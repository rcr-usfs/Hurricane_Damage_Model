from osgeo import gdal, ogr, osr
import numpy
import pylab, math, os, sys,json,datetime,glob

#########################################################
#Function for getting HURDAT data into the correct format for subsequent processing
def prep_HURDAT(raw_hurdat,csv_folder,storm_split_str = 'AL'):
    check_dir(csv_folder)

    #Read in HURDAT data
    o = open(raw_hurdat,'r')

    #Split out by storm (lines that start with AL)
    lines = o.read().split(storm_split_str)
    lines = [i for i in lines if i != '']
    o.close()

    allJSON = []
    
    #Iterate across each storm
    for h in lines:

        h_out = []

        #Clean up the data
        h = h.split('\n')
        if len(h) > 1:
            h = [i.split(',') for i in h]
            header = h[0]
            header = [i.strip() for i in header]
            h = h[1:]
            
            h = [[i2.strip() for i2 in i] for i in h if i[0] != '' and int(i[6]) > 0 and int(i[7]) > 0]
            
            #If there are obs for the storm, process it
            if len(header) ==4 and len(h) > 1 and len(header[0]) > 0:
                name = header[1]
                if name == 'UNNAMED':
                    name = header[2]
                year = header[0][2:]
                out_csv = os.path.join(csv_folder,name + '-'+year+'.csv')
                if os.path.exists(out_csv) == False:
                    hLines = []
                    hLinesCSV = ''
                    #Set up outputs for storm
                    hObj = {}

                    hObj['name'] = name
                    hObj['year'] = int(year)

                    for line in h:
                        lineObj = {}

                        #Get relevant fields and format them
                        date = line[0]
                        time = line[1]
                        y = int(date[:4])
                        m = int(date[4:6])
                        d = int(date[6:])
                        h =int(time[:2])
                        minutes = int(time[2:])
                        
                        date = datetime.datetime(y,m,d,h,minutes)
                        out_date = date.strftime("%b %d,%H:%M:%S GMT")
                        
                        lineObj['date'] = out_date
                        
                        lat = float(line[4][:-1])
                        lon = float(line[5][:-1])
                        if line[4][-1] == 'S':lat = lat*-1
                        if line[5][-1] == 'W':lon = lon*-1
                        lineObj['lat'] = lat
                        lineObj['lon'] = lon
                        lineObj['pres'] = int(line[7])
                        lineObj['wspd'] = int(line[6])
                        hLines.append(lineObj)


                        hLinesCSV += ','.join([out_date,str(lineObj['lat']),str(lineObj['lon']),str(lineObj['wspd']) + ' mph',str(lineObj['pres']) + ' mb\n'])
                    
                    
                    hObj['track'] = hLines
                    allJSON.append(hObj)
                    
                    o = open(out_csv,'w')
                    o.write(hLinesCSV)
                    o.close()

                    #Refine storm track
                    try:
                        refineStormTrack(out_csv,name,year)
                    except Exception as e:
                        print(e)
    #Write a master json- not used currently    
    o = open(csv_folder + os.path.basename(os.path.splitext(raw_hurdat)[0]) + '_all.json','w')
    o.write(json.dumps(allJSON))
    o.close()
##############################################################        
#Function for interpolating track input entries
def refineStormTrack(input_track,storm_name,storm_year):
    Today = datetime.datetime.utcnow()

    stormname,stormyear =storm_name,storm_year
    stormyear = int(stormyear)
    csvname = os.path.splitext(input_track)[0]
    outfile = open(csvname+'-refined.csv','w')
    outfileJSON = open(csvname+'-refined.json','w')
    refinement_factor = 3

    def GetTime( X ):
        mytime = X.split(',')[1].split(':')
        hour = int(mytime[0])
        mins = 60*int(hour)+int(mytime[1].split(' ')[0])
        return mins

    def GetInfo( X ):
        fields = X.strip().split(',')
        lat = float( fields[2])
        lon = float( fields[3])
        WS = float( fields[4].split(' ')[0] )
        Pr = float( fields[5].split(' ')[0])
        return [lat,lon,WS,Pr]

    def Interp( s, e, f ):
        return (1.-f)*s+f*e

    # read csv file of storm track data
    trackfile = open(csvname + '.csv','r')
    track = trackfile.readlines()
    trackfile.close()

    # set start date
    start = track[0]
    start_time = GetTime( start )
    start_info = GetInfo( start )

    # loop through file
    
    jsonList = []
    for end in track[1:]:
        # read end date
        end_time = GetTime( end )
        end_info = GetInfo( end )
        if start_time>end_time:
            end_time += 24*60

        # loop over time between
        desired_dt = int( (end_time-start_time)/refinement_factor )
        for t in range(0, end_time-start_time, desired_dt):
            # linear interpolate time, position and other parameters
            fraction = float(t) / float(end_time-start_time)
            new_mins = Interp( start_time, end_time, fraction )
            new_lat = Interp( start_info[0], end_info[0], fraction )
            new_lon = Interp( start_info[1], end_info[1], fraction )
            new_WS  = Interp( start_info[2], end_info[2], fraction )
            new_Pr  = Interp( start_info[3], end_info[3], fraction )

            # write new record
            hr =int(new_mins/60.)
            mins = new_mins-hr*60
            if hr > 23:
                hr = 0
            fields = start.strip().split(',')

            OutputDate = datetime.datetime.strptime(fields[0].strip(), '%b %d')
            if stormyear > Today.year:
                Forecast = 'F'
            elif stormyear == Today.year:
                if OutputDate.month > Today.month:
                    Forecast = 'F'
                elif OutputDate.month == Today.month:
                    if OutputDate.day > Today.day:
                        Forecast = 'F'
                    elif OutputDate.day == Today.day:
                        if hr > Today.hour:
                            Forecast = 'F'
                        else:
                            Forecast = 'O'
                    else:
                        Forecast = 'O'
                else:
                    Forecast = 'O'
            else:
                Forecast = 'O'
            if Forecast == 'F':
                refinement_factor = 24
            out = '%s,%02d:%02d GMT,%4.2f,%4.2f,%d mph,%d mb,%s,%s,%s\n'% (fields[0],hr,mins,new_lat,new_lon,new_WS,new_Pr,fields[-2],fields[-1], Forecast)
            outfile.write( out )

            fields = out.strip().split(',')
            wspd = fields[4].split('m')[0]
            pres = fields[5].split('m')[0]
            jsonList.append({'date':fields[0]+':'+fields[1],
              'lat':float(fields[2]),
              'lon':float(fields[3]),
              'wspd':float(wspd),
              'pres':float(pres),
              'FO':fields[-1]})
        start = end
        start_time = GetTime(end)
        start_info = end_info

    outfileJSON.write(json.dumps(jsonList))
    outfile.close()
    outfileJSON.close()
#########################################################
#Function for creating directory if it doesn't exist
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
def getWind(current,future,frames_output_folder,storm_name,window_width,window_height,res,wind_nodata,wind_threshold,epsg,wind_summary,write_frames = False):
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

    if write_frames:
        writegeotiff( transform, u, out_filename, u.shape[0], u.shape[1],epsg, wind_nodata)

    wind_summary.updateFootprint(u,transform)
    del(px)
    del(py)
    del(row)
    del(u)
##################################################################
#Object for creating max mosaic of wind fields
class windSummary:
    def __init__(self,output_name,rows,window_width,window_height,res,epsg,wind_nodata,wind_datatype):
        self.output_name,self.rows,self.window_width,self.window_height,self.res,self.epsg,self.wind_nodata,self.wind_datatype =output_name,rows,window_width,window_height,res,epsg,wind_nodata,wind_datatype

    def getGetFootprintArray(self):
        coords = [geogToProj(row['lon'],row['lat'],fromEPSG = 4326,toEPSG = self.epsg) for row in self.rows]
        coords =  [[i['x'],i['y']] for i in coords]
    
        xs = [i[0] for i in coords]
        ys = [i[1] for i in coords]

 
        xmin,ymin,xmax,ymax = min(xs),min(ys),max(xs),max(ys)
        xmin = xmin-self.window_width*self.res
        ymin = ymin-self.window_height*self.res
        xmax = xmax+(self.window_width+1)*self.res
        ymax = ymax+(self.window_height+1)*self.res
        print(xmin,xmax)
        self.width = math.ceil((xmax-xmin)/self.res)
        self.height = math.ceil((ymax-ymin)/self.res)
        # print(self.width,self.height)
        self.footprint = numpy.zeros((self.height,self.width), dtype=self.wind_datatype)
        self.footprint[self.footprint == 0] = self.wind_nodata
        print(self.footprint.shape)
        self.transform = getTransform(xmin,ymax,0,0,self.res)

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
        writegeotiff( self.transform, self.footprint, self.output_name, self.width, self.height,self.epsg, self.wind_nodata,self.wind_datatype)
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
