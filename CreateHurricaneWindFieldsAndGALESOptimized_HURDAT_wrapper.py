from CreateHurricaneWindFieldsAndGALESOptimized_lib import *
#########################################################
#User Params
# storm_track = 'track_data/michael-track.csv'
# storm_name = 'Michael'
# storm_year = 2018

res = 3000 #Spatial resolution of output in meters. Generally not much reason to go finer than 30 
window_radius = 150000 #Distance in meters of radius of each window for each frame (needs to be divisible by res)
epsg = 5070 #Generally better with UTM which is 326 + zone in northern hemisphere or 327 + zone in southern hemisphere
wind_threshold = 30. #Threshold in mph for including wind values
wind_nodata = 0 #Value to set as null for wind output
wind_datatype = 'u1'#Use the NumPy  datatype format. Generally Byte ('u1') is fine for wind. If more precision is needed, use 'Float32'

write_frames = False #Whether to write out each individual wind field frame
output_folder = 'output_data_pac/'

#Data from: https://www.nhc.noaa.gov/data/hurdat/hurdat2-1851-2019-052520.txt
storm_split_str = 'AL'
raw_hurdat = "track_data/hurdat2-1851-2019-052520.txt"

# storm_split_str = 'EP'
# raw_hurdat = "track_data/hurdat2-nepac-1949-2019-042320.txt"

hurdat_folder = 'track_data/hurdat_tracks/'


# #########################################################

# ##################################################################
#Parse and refine HURDAT data
prep_HURDAT(raw_hurdat,hurdat_folder,storm_split_str)


# window_width = window_radius/res #Number of pixels for window width radius (5000 will result in 10001 pixels width)
# window_height = window_radius/res #Number of pixels for window height radius (5000 will result in 10001 pixels height)



# hurdat_tracks = glob.glob(hurdat_folder+ '*-refined.json')
# for hurdat_track in hurdat_tracks:
# 	# print(hurdat_track)

# 	storm_name = os.path.basename(os.path.splitext(hurdat_track)[0]).split('-refined')[0]
# 	print(storm_name)
	
	
# 	#Open up the storm track
# 	storm_track_json = hurdat_track
	
# 	try:
# 		o = open(storm_track_json,'r')
# 		rows = json.loads(o.read())
# 		o.close()
# 	except Exception as e:
# 		print(e)
# 		rows = []
	
# 	if len(rows) > 1:
# 		#Set up output directories
# 		frames_output_folder = os.path.join(output_folder,'windfields_frames',storm_name)
# 		# mosaic_output_folder = os.path.join(output_folder_storm ,'windfields_mosaic/')
# 		check_dir(frames_output_folder)
# 		# check_dir(mosaic_output_folder)
		

# 		#Split into left and right for pairs of rows
# 		left = rows[:-1]
# 		right = rows[1:]

# 		#Initialize mosaic for wind fields
# 		wind_summary_name = os.path.join(output_folder, storm_name+'_wind.tif')
# 		wind_summary = windSummary(wind_summary_name, left,window_width,window_height,res,epsg,wind_nodata,wind_datatype)
# 		wind_summary.getGetFootprintArray()

# 		#Iterate across each pair of frames 
# 		for left,right in zip(left,right):
# 			try:
# 				getWind(left,right,frames_output_folder,storm_name,window_width,window_height,res,wind_nodata,wind_threshold,epsg,wind_summary,write_frames)

# 			except Exception as e:
# 				print(e)
# 		#
# 		#Write mosaic of wind fields out
# 		wind_summary.writeSummary()