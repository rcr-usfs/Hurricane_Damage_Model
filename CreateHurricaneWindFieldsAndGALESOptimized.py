from osgeo import gdal, ogr, osr
import numpy
import pylab, math, os, sys,json
import pickle
#########################################################
#User Params
res = 3000 #Spatial resolution of output in meters. Generally not much reason to go finer than 30 
window_radius = 150000 #Distance in meters of radius of each window for each frame (needs to be divisible by res)
epsg = 5070 #Generally better with UTM which is 326 + zone in northern hemisphere or 327 + zone in southern hemisphere
wind_threshold = 30. #Threshold in mph for including wind values
wind_nodata = 0 #Value to set as null for wind output
wind_datatype = 'u1'#Use the NumPy  datatype format. Generally Byte ('u1') is fine for wind. If more precision is needed, use 'Float32'
storm_name = 'Michael'
frames_output_folder = 'windfields_frames/'
mosaic_output_folder = 'windfields_mosaic/'
storm_track_json = 'michael-track-refined.json'
#########################################################

def check_dir(in_path):
    if os.path.exists(in_path) == False:
        print('Making dir:', in_path)
        os.makedirs(in_path)
#########################################################
#Adapted from https://gis.stackexchange.com/questions/167069/simple-gdal-coordinate-conversion
#Converts a coordinate in one projection to another
def geogToProj(lng,lat,fromEPSG = 4326,toEPSG = 32616):
    InSR = osr.SpatialReference()
    InSR.ImportFromEPSG(fromEPSG)       # Geographic
    OutSR = osr.SpatialReference()
    OutSR.ImportFromEPSG(toEPSG)     #output

    Point = ogr.Geometry(ogr.wkbPoint)
    Point.AddPoint(lng,lat) # use your coordinates here
    Point.AssignSpatialReference(InSR)    # tell the point what coordinates it's in
    Point.TransformTo(OutSR)              # project it to the out spatial reference
    return {'x':Point.GetX(),'y':Point.GetY()} # output projected X and Y coordinates
#########################################################
def getTransform(centerX,centerY,width,height,res):
    left = centerX - math.floor(width/2.)*res
    top = centerY + math.ceil(height/2.)*res
    return [left, float(res), 0.0, top, 0.0, -1. * res]
##############################################################################################
#Converts between Numpy and GDAL data types
dt_dict = {'u1': 'Byte', 'uint8' : 'Byte', 'uint16': 'UInt16','u2': 'UInt16', 'u4': 'UInt32', 'i2' : 'Int16','i4':'Int32', 'int16':'Int16', 'Float32' : 'float32','float32' : 'Float32', 'Float64' : 'float64','float64' : 'Float64'}
##############################################################################################
#########################################################
def writegeotiff( transform, Output, Title, ncols, nrows,epsg,out_no_data = 255,dt = 'u1'):
    output_raster = gdal.GetDriverByName('GTiff').Create(Title,int(ncols), int(nrows), 1 ,eval('gdal.GDT_'+dt_dict[dt]))#Float32)
    output_raster.SetGeoTransform( transform )
    srs = osr.SpatialReference()
    srs.ImportFromEPSG(epsg)
    output_raster.SetProjection( srs.ExportToWkt() )
    output_raster.GetRasterBand(1).SetNoDataValue(out_no_data)
    
    output_raster.GetRasterBand(1).WriteArray( Output.astype(dt)) 
    Min,Max,Mean,Std = output_raster.GetRasterBand(1).ComputeStatistics(0)
    output_raster.GetRasterBand(1).SetStatistics(Min,Max,Mean,Std)
    output_raster.FlushCache()
#########################################################
def CalcStormMotion(y1,y2,x1,x2,dt):
    # return storm velocity components in meters per second
    V = (y2-y1) * 111. *1000/ float(dt)
    U = (x2-x1) * math.cos(y1*math.pi/180.) * 111. *1000/ float(dt)
    return U,V
#########################################################
def getWind(current,future):
    mytime = current['date'].split(':')
    cseconds = 3600*int(mytime[1])+60*int(mytime[2].split()[0])
    mytime = future['date'].split(':')
    fseconds = 3600*int(mytime[1])+60*int(mytime[2].split()[0])
    if fseconds < cseconds:
        fseconds += 24*60*60

    out_filename = os.path.join(frames_output_folder,storm_name+'_'+'_'.join([current['date'],future['date']]).replace(' ','_').replace(':','_')+'_wind.tif')
    print('Creating:',out_filename)
    CurrentLat = current['lat']
    CurrentLon = current['lon']
    FutureLat = future['lat']
    FutureLon = future['lon']

    MaxWind = current['wspd']
    CentralPressure = current['pres']
    FutureMaxWind = future['wspd']
    FutureCentralPressure = future['pres']
    HurricaneMotionU, HurricaneMotionV = CalcStormMotion(CurrentLat,FutureLat,CurrentLon,FutureLon,fseconds-cseconds)

    Lat = CurrentLat
    Lon = CurrentLon
    Wind = MaxWind
    Pressure = CentralPressure

    # xc, yc = convert2grid(Lat,Lon,topo_info)

    Pc   = Pressure * 100.
    Pe = 1013. *100.
    if Pe <= Pc:
        Pe = Pc * 1.05
    deltaP = (Pe-Pc)/100.
    Rmax  = ( math.exp(2.636-0.00005086*deltaP**2+0.037842*28.)) * 1000.

    HSpd = math.sqrt( HurricaneMotionU**2+HurricaneMotionV**2 )
    HDir = math.atan2( HurricaneMotionV, HurricaneMotionU )
    

    def getWindAtDist(px,py):
        umin = 1000.
        r = -1
        r0 = 1200.*1000.
        a = 0.25
        m =1.6
        n = 0.9
        r = numpy.sqrt(py**2+px**2)
        
        
        f1 = (Wind-HSpd)**2
        f2 = ((r0-r)/(r0-Rmax))**2
        f3 = (r/Rmax)**2
     
        t1n = (1.-a)*(n+m)
        t1d = n+m*(r/Rmax)**(2.*(n+m))
        t2n = a*(1.+2.*m)
        t2d = 1.+2.*m*(r/Rmax)**(2.*(m+1.))
        Vholland=numpy.sqrt(f1*f2*f3*(t1n/t1d+t2n/t2d))
        
        # if r > 0:
        Vholland[r <=0] = 0
        
        Beta = -HDir - numpy.arctan2(py,px)
       
        rotation =  HSpd*numpy.sin(-Beta)
        u = (Vholland +rotation) #/ 0.44704
        del(r)
        del(Vholland)
        del(Beta)
        del(rotation)
        return u

    #Set up distance grid
    #Distane grid is expected to be ascending in x direction from west to east
    #And ascending in the y direction from north to south (opposite of normal)
    gridWidth = window_width*res
    gridHeight = window_height*res
    
    row = numpy.array([numpy.arange(-gridWidth,gridWidth+1,res).astype('float32')])
    px = numpy.repeat(row,row.shape[1],0)
    py = numpy.repeat(numpy.rot90(row),row.shape[1],1)*-1
   
    #Get wind at distance
    u =getWindAtDist(px,py)

    #Use this to get the wind at a specific distance
    # print(getWindAtDist(numpy.array([20174.875]),numpy.array([12400])))
    
    u[u<wind_threshold] = wind_nodata

    #Write output
    coords = geogToProj(Lon,Lat,fromEPSG = 4326,toEPSG = epsg)
    transform = getTransform(coords['x'],coords['y'],u.shape[0],u.shape[1],res)
    writegeotiff( transform, u, out_filename, u.shape[0], u.shape[1],epsg, wind_nodata)
    wind_summary.updateFootprint(u,transform)
    del(px)
    del(py)
    del(row)
    del(u)
##################################################################

class windSummary:
    def __init__(self,rows,window_width,window_height,res):
        self.rows,self.window_width,self.window_height,self.res =rows,window_width,window_height,res

    def getGetFootprintArray(self):
        coords = [geogToProj(row['lon'],row['lat'],fromEPSG = 4326,toEPSG = epsg) for row in self.rows]
        coords =  [[i['x'],i['y']] for i in coords]
    
        xs = [i[0] for i in coords]
        ys = [i[1] for i in coords]

 
        xmin,ymin,xmax,ymax = min(xs),min(ys),max(xs),max(ys)
        xmin = xmin-window_width*res
        ymin = ymin-window_height*res
        xmax = xmax+(window_width+1)*res
        ymax = ymax+(window_height+1)*res
        print(xmin,xmax)
        self.width = math.ceil((xmax-xmin)/res)
        self.height = math.ceil((ymax-ymin)/res)
        # print(self.width,self.height)
        self.footprint = numpy.zeros((self.height,self.width), dtype=wind_datatype)
        self.footprint[self.footprint == 0] = wind_nodata
        print(self.footprint.shape)
        self.transform = getTransform(xmin,ymax,0,0,res)

    def updateFootprint(self,array,wind_transform):
        res = wind_transform[1]
        xo = math.floor((wind_transform[0] - self.transform[0])/res)
        yo = math.floor((self.transform[3] - wind_transform[3])/res)
        
        clipped = self.footprint[yo:yo+array.shape[0],xo:xo+array.shape[1]]
        clipped = numpy.amax([array,clipped],0)
        self.footprint[yo:yo+array.shape[0],xo:xo+array.shape[1]] = clipped
        
        del(clipped)  
        
    def clearFootprint(self):
        del(self.footprint)

    def writeSummary(self):
        writegeotiff( self.transform, self.footprint, os.path.join(mosaic_output_folder, storm_name+'_wind.tif'), self.width, self.height,epsg, wind_nodata,'u1')
        self.clearFootprint()

##################################################################
# def GALES(WindSpeed, Hgt, CrownDepth, Spacing, ModRupture=8500.):
#     if Spacing > 0  and Hgt > 0: #Hgt > 0 and Spacing > 0 and Hgt - CBH>0:
#         Z = 1.3
#         b = 2.*CrownDepth/Hgt
#         l = b*CrownDepth/Spacing*0.5
#         G35 = (1.-math.exp(-math.sqrt(15*l)))/math.sqrt(15*l)
#         D = Hgt*(1.-G35)
#         UstarRatio = min(0.3, math.sqrt(0.003+0.3*l))
#         PsiH = 0.193
#         Z0H = G35*math.exp(-0.4/UstarRatio-PsiH)
#         HD = Spacing / Hgt
#         z0 = Z0H * Hgt
#         BMmean = 0.68*HD-0.0385+(-0.68*HD+0.4785)*(1.7239*HD+0.0316)**(5)
#         BMmax  = 2.7193*HD-0.061+(1.273*HD+0.9701)*(1.1127*HD+0.0311)**5
#         G = BMmax/BMmean
#         MOR = ModRupture*6894.757
#         Mcrit = 0.00358811*MOR
#         try:
#             M = 1.22*(D-Z)*1.226*G*(0.4*Spacing*WindSpeed/math.log((Hgt-D)/z0))**2
#         except:
#             print(Hgt,Spacing, WindSpeed)
#             print(D, Z, G, Spacing, WindSpeed, Hgt, z0)
#         if M<0:
#             print('Negative M: ', BMmax, BMmean, Hgt, Spacing, WindSpeed, CBH)

#         R = M/Mcrit - 1.
#         return ( int(100. * math.exp(R) / (math.exp(R)+1.) ) - 50) *2
#     else:
#         return 0

##################################################################
window_width = window_radius/res #Number of pixels for window width radius (5000 will result in 10001 pixels width)
window_height = window_radius/res #Number of pixels for window height radius (5000 will result in 10001 pixels height)

check_dir(frames_output_folder)
check_dir(mosaic_output_folder)

o = open(storm_track_json,'r')
rows = json.loads(o.read())
o.close()

left = rows[:-1]
right = rows[1:]

wind_summary = windSummary(left,window_width,window_height,res)
wind_summary.getGetFootprintArray()



   
for left,right in zip(left,right):
    # print(left,right)
    getWind(left,right)

wind_summary.writeSummary()