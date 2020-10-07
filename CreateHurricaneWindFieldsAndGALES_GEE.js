//Original Python implementation written by: Scott Goodrick
//GEE implementation written by: Ian Housman and Robert Chastain
//////////////////////////////////////////////////////////////
var palettes = require('users/gena/packages:palettes');
var hgt_array = ee.ImageCollection("LANDFIRE/Vegetation/EVH/v1_4_0").mosaic();

//Define export params
var studyArea = geometry;
var name = 'Michael';
var driveFolder = 'GALES-Model-Outputs';
var crs = 'EPSG:5070';
var transform = [30,0,-2361915.0,0,-30,3177735.0];
var scale = null;

//Define some other params
var windThreshold = 30;
var year = 2018;

var rows = [{"lon": -86.6, "lat": 18.0, "wspd": 30.0, "date": "Oct 6:21:00 GMT", "pres": 1006.0, "FO": "O"}, {"lon": -86.6, "lat": 18.1, "wspd": 30.0, "date": "Oct 6:22:00 GMT", "pres": 1005.0, "FO": "O"}, {"lon": -86.6, "lat": 18.2, "wspd": 30.0, "date": "Oct 6:23:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.6, "lat": 18.3, "wspd": 30.0, "date": "Oct 7:00:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.6, "lat": 18.47, "wspd": 30.0, "date": "Oct 7:01:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.6, "lat": 18.63, "wspd": 30.0, "date": "Oct 7:02:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.6, "lat": 18.8, "wspd": 30.0, "date": "Oct 7:03:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.77, "lat": 18.67, "wspd": 31.0, "date": "Oct 7:04:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.93, "lat": 18.53, "wspd": 33.0, "date": "Oct 7:05:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -87.1, "lat": 18.4, "wspd": 35.0, "date": "Oct 7:06:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -87.03, "lat": 18.47, "wspd": 35.0, "date": "Oct 7:07:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.97, "lat": 18.53, "wspd": 35.0, "date": "Oct 7:08:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.9, "lat": 18.6, "wspd": 35.0, "date": "Oct 7:09:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.87, "lat": 18.7, "wspd": 35.0, "date": "Oct 7:10:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.83, "lat": 18.8, "wspd": 35.0, "date": "Oct 7:11:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.8, "lat": 18.9, "wspd": 35.0, "date": "Oct 7:12:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.83, "lat": 19.0, "wspd": 35.0, "date": "Oct 7:13:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.87, "lat": 19.1, "wspd": 35.0, "date": "Oct 7:14:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.9, "lat": 19.2, "wspd": 35.0, "date": "Oct 7:15:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.9, "lat": 19.2, "wspd": 36.0, "date": "Oct 7:15:38 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.9, "lat": 19.2, "wspd": 38.0, "date": "Oct 7:16:16 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.9, "lat": 19.2, "wspd": 39.0, "date": "Oct 7:16:54 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.9, "lat": 19.2, "wspd": 40.0, "date": "Oct 7:16:55 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.9, "lat": 19.2, "wspd": 40.0, "date": "Oct 7:17:16 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.9, "lat": 19.2, "wspd": 40.0, "date": "Oct 7:17:37 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.9, "lat": 19.2, "wspd": 40.0, "date": "Oct 7:17:58 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.9, "lat": 19.2, "wspd": 40.0, "date": "Oct 7:18:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.43, "lat": 19.2, "wspd": 43.0, "date": "Oct 7:19:00 GMT", "pres": 1002.0, "FO": "O"}, {"lon": -85.97, "lat": 19.2, "wspd": 46.0, "date": "Oct 7:20:00 GMT", "pres": 1000.0, "FO": "O"}, {"lon": -85.5, "lat": 19.2, "wspd": 50.0, "date": "Oct 7:21:00 GMT", "pres": 999.0, "FO": "O"}, {"lon": -85.47, "lat": 19.43, "wspd": 53.0, "date": "Oct 7:22:00 GMT", "pres": 998.0, "FO": "O"}, {"lon": -85.43, "lat": 19.67, "wspd": 56.0, "date": "Oct 7:23:00 GMT", "pres": 997.0, "FO": "O"}, {"lon": -85.4, "lat": 19.9, "wspd": 60.0, "date": "Oct 8:00:00 GMT", "pres": 997.0, "FO": "O"}, {"lon": -85.4, "lat": 19.93, "wspd": 60.0, "date": "Oct 8:01:00 GMT", "pres": 997.0, "FO": "O"}, {"lon": -85.4, "lat": 19.97, "wspd": 60.0, "date": "Oct 8:02:00 GMT", "pres": 997.0, "FO": "O"}, {"lon": -85.4, "lat": 20.0, "wspd": 60.0, "date": "Oct 8:03:00 GMT", "pres": 997.0, "FO": "O"}, {"lon": -85.43, "lat": 20.03, "wspd": 60.0, "date": "Oct 8:04:00 GMT", "pres": 996.0, "FO": "O"}, {"lon": -85.47, "lat": 20.07, "wspd": 60.0, "date": "Oct 8:05:00 GMT", "pres": 995.0, "FO": "O"}, {"lon": -85.5, "lat": 20.1, "wspd": 60.0, "date": "Oct 8:06:00 GMT", "pres": 994.0, "FO": "O"}, {"lon": -85.5, "lat": 20.27, "wspd": 63.0, "date": "Oct 8:07:00 GMT", "pres": 990.0, "FO": "O"}, {"lon": -85.5, "lat": 20.43, "wspd": 66.0, "date": "Oct 8:08:00 GMT", "pres": 986.0, "FO": "O"}, {"lon": -85.5, "lat": 20.6, "wspd": 70.0, "date": "Oct 8:09:00 GMT", "pres": 983.0, "FO": "O"}, {"lon": -85.37, "lat": 20.7, "wspd": 70.0, "date": "Oct 8:10:00 GMT", "pres": 982.0, "FO": "O"}, {"lon": -85.23, "lat": 20.8, "wspd": 70.0, "date": "Oct 8:11:00 GMT", "pres": 982.0, "FO": "O"}, {"lon": -85.1, "lat": 20.9, "wspd": 70.0, "date": "Oct 8:12:00 GMT", "pres": 982.0, "FO": "O"}, {"lon": -85.03, "lat": 21.0, "wspd": 71.0, "date": "Oct 8:13:00 GMT", "pres": 982.0, "FO": "O"}, {"lon": -84.97, "lat": 21.1, "wspd": 73.0, "date": "Oct 8:14:00 GMT", "pres": 982.0, "FO": "O"}, {"lon": -84.9, "lat": 21.2, "wspd": 75.0, "date": "Oct 8:15:00 GMT", "pres": 982.0, "FO": "O"}, {"lon": -84.97, "lat": 21.37, "wspd": 75.0, "date": "Oct 8:16:00 GMT", "pres": 980.0, "FO": "O"}, {"lon": -85.03, "lat": 21.53, "wspd": 75.0, "date": "Oct 8:17:00 GMT", "pres": 979.0, "FO": "O"}, {"lon": -85.1, "lat": 21.7, "wspd": 75.0, "date": "Oct 8:18:00 GMT", "pres": 978.0, "FO": "O"}, {"lon": -85.13, "lat": 21.87, "wspd": 76.0, "date": "Oct 8:19:00 GMT", "pres": 978.0, "FO": "O"}, {"lon": -85.17, "lat": 22.03, "wspd": 78.0, "date": "Oct 8:20:00 GMT", "pres": 978.0, "FO": "O"}, {"lon": -85.2, "lat": 22.2, "wspd": 80.0, "date": "Oct 8:21:00 GMT", "pres": 978.0, "FO": "O"}, {"lon": -85.2, "lat": 22.37, "wspd": 81.0, "date": "Oct 8:22:00 GMT", "pres": 975.0, "FO": "O"}, {"lon": -85.2, "lat": 22.53, "wspd": 83.0, "date": "Oct 8:23:00 GMT", "pres": 972.0, "FO": "O"}, {"lon": -85.2, "lat": 22.7, "wspd": 85.0, "date": "Oct 9:00:00 GMT", "pres": 970.0, "FO": "O"}, {"lon": -85.23, "lat": 22.87, "wspd": 86.0, "date": "Oct 9:01:00 GMT", "pres": 970.0, "FO": "O"}, {"lon": -85.27, "lat": 23.03, "wspd": 88.0, "date": "Oct 9:02:00 GMT", "pres": 970.0, "FO": "O"}, {"lon": -85.3, "lat": 23.2, "wspd": 90.0, "date": "Oct 9:03:00 GMT", "pres": 970.0, "FO": "O"}, {"lon": -85.43, "lat": 23.33, "wspd": 90.0, "date": "Oct 9:04:00 GMT", "pres": 971.0, "FO": "O"}, {"lon": -85.57, "lat": 23.47, "wspd": 90.0, "date": "Oct 9:05:00 GMT", "pres": 972.0, "FO": "O"}, {"lon": -85.7, "lat": 23.6, "wspd": 90.0, "date": "Oct 9:06:00 GMT", "pres": 973.0, "FO": "O"}, {"lon": -85.77, "lat": 23.77, "wspd": 90.0, "date": "Oct 9:07:00 GMT", "pres": 973.0, "FO": "O"}, {"lon": -85.83, "lat": 23.93, "wspd": 90.0, "date": "Oct 9:08:00 GMT", "pres": 973.0, "FO": "O"}, {"lon": -85.9, "lat": 24.1, "wspd": 90.0, "date": "Oct 9:09:00 GMT", "pres": 973.0, "FO": "O"}, {"lon": -85.97, "lat": 24.23, "wspd": 93.0, "date": "Oct 9:10:00 GMT", "pres": 971.0, "FO": "O"}, {"lon": -86.03, "lat": 24.37, "wspd": 96.0, "date": "Oct 9:11:00 GMT", "pres": 969.0, "FO": "O"}, {"lon": -86.1, "lat": 24.5, "wspd": 100.0, "date": "Oct 9:12:00 GMT", "pres": 968.0, "FO": "O"}, {"lon": -86.13, "lat": 24.67, "wspd": 103.0, "date": "Oct 9:13:00 GMT", "pres": 967.0, "FO": "O"}, {"lon": -86.17, "lat": 24.83, "wspd": 106.0, "date": "Oct 9:14:00 GMT", "pres": 966.0, "FO": "O"}, {"lon": -86.2, "lat": 25.0, "wspd": 110.0, "date": "Oct 9:15:00 GMT", "pres": 965.0, "FO": "O"}, {"lon": -86.27, "lat": 25.13, "wspd": 110.0, "date": "Oct 9:16:00 GMT", "pres": 965.0, "FO": "O"}, {"lon": -86.33, "lat": 25.27, "wspd": 110.0, "date": "Oct 9:17:00 GMT", "pres": 965.0, "FO": "O"}, {"lon": -86.4, "lat": 25.4, "wspd": 110.0, "date": "Oct 9:18:00 GMT", "pres": 965.0, "FO": "O"}, {"lon": -86.4, "lat": 25.6, "wspd": 113.0, "date": "Oct 9:19:00 GMT", "pres": 962.0, "FO": "O"}, {"lon": -86.4, "lat": 25.8, "wspd": 116.0, "date": "Oct 9:20:00 GMT", "pres": 959.0, "FO": "O"}, {"lon": -86.4, "lat": 26.0, "wspd": 120.0, "date": "Oct 9:21:00 GMT", "pres": 957.0, "FO": "O"}, {"lon": -86.43, "lat": 26.2, "wspd": 120.0, "date": "Oct 9:22:00 GMT", "pres": 955.0, "FO": "O"}, {"lon": -86.47, "lat": 26.4, "wspd": 120.0, "date": "Oct 9:23:00 GMT", "pres": 954.0, "FO": "O"}, {"lon": -86.5, "lat": 26.6, "wspd": 120.0, "date": "Oct 10:00:00 GMT", "pres": 953.0, "FO": "O"}, {"lon": -86.5, "lat": 26.77, "wspd": 121.0, "date": "Oct 10:01:00 GMT", "pres": 951.0, "FO": "O"}, {"lon": -86.5, "lat": 26.93, "wspd": 123.0, "date": "Oct 10:02:00 GMT", "pres": 949.0, "FO": "O"}, {"lon": -86.5, "lat": 27.1, "wspd": 125.0, "date": "Oct 10:03:00 GMT", "pres": 947.0, "FO": "O"}, {"lon": -86.53, "lat": 27.3, "wspd": 126.0, "date": "Oct 10:04:00 GMT", "pres": 946.0, "FO": "O"}, {"lon": -86.57, "lat": 27.5, "wspd": 128.0, "date": "Oct 10:05:00 GMT", "pres": 945.0, "FO": "O"}, {"lon": -86.6, "lat": 27.7, "wspd": 130.0, "date": "Oct 10:06:00 GMT", "pres": 945.0, "FO": "O"}, {"lon": -86.57, "lat": 27.9, "wspd": 133.0, "date": "Oct 10:07:00 GMT", "pres": 944.0, "FO": "O"}, {"lon": -86.53, "lat": 28.1, "wspd": 136.0, "date": "Oct 10:08:00 GMT", "pres": 943.0, "FO": "O"}, {"lon": -86.5, "lat": 28.3, "wspd": 140.0, "date": "Oct 10:09:00 GMT", "pres": 943.0, "FO": "O"}, {"lon": -86.47, "lat": 28.4, "wspd": 140.0, "date": "Oct 10:09:20 GMT", "pres": 941.0, "FO": "O"}, {"lon": -86.43, "lat": 28.5, "wspd": 140.0, "date": "Oct 10:09:40 GMT", "pres": 939.0, "FO": "O"}, {"lon": -86.4, "lat": 28.6, "wspd": 140.0, "date": "Oct 10:10:00 GMT", "pres": 937.0, "FO": "O"}, {"lon": -86.37, "lat": 28.67, "wspd": 140.0, "date": "Oct 10:10:20 GMT", "pres": 937.0, "FO": "O"}, {"lon": -86.33, "lat": 28.73, "wspd": 140.0, "date": "Oct 10:10:40 GMT", "pres": 937.0, "FO": "O"}, {"lon": -86.3, "lat": 28.8, "wspd": 140.0, "date": "Oct 10:11:00 GMT", "pres": 937.0, "FO": "O"}, {"lon": -86.3, "lat": 28.87, "wspd": 141.0, "date": "Oct 10:11:20 GMT", "pres": 935.0, "FO": "O"}, {"lon": -86.3, "lat": 28.93, "wspd": 143.0, "date": "Oct 10:11:40 GMT", "pres": 934.0, "FO": "O"}, {"lon": -86.3, "lat": 29.0, "wspd": 145.0, "date": "Oct 10:12:00 GMT", "pres": 933.0, "FO": "O"}, {"lon": -86.27, "lat": 29.03, "wspd": 145.0, "date": "Oct 10:12:20 GMT", "pres": 933.0, "FO": "O"}, {"lon": -86.23, "lat": 29.07, "wspd": 145.0, "date": "Oct 10:12:40 GMT", "pres": 933.0, "FO": "O"}, {"lon": -86.2, "lat": 29.1, "wspd": 145.0, "date": "Oct 10:13:00 GMT", "pres": 933.0, "FO": "O"}, {"lon": -86.17, "lat": 29.17, "wspd": 145.0, "date": "Oct 10:13:20 GMT", "pres": 932.0, "FO": "O"}, {"lon": -86.13, "lat": 29.23, "wspd": 145.0, "date": "Oct 10:13:40 GMT", "pres": 931.0, "FO": "O"}, {"lon": -86.1, "lat": 29.3, "wspd": 145.0, "date": "Oct 10:14:00 GMT", "pres": 931.0, "FO": "O"}, {"lon": -86.07, "lat": 29.33, "wspd": 145.0, "date": "Oct 10:14:20 GMT", "pres": 930.0, "FO": "O"}, {"lon": -86.03, "lat": 29.37, "wspd": 145.0, "date": "Oct 10:14:40 GMT", "pres": 929.0, "FO": "O"}, {"lon": -86.0, "lat": 29.4, "wspd": 145.0, "date": "Oct 10:15:00 GMT", "pres": 928.0, "FO": "O"}, {"lon": -85.97, "lat": 29.43, "wspd": 146.0, "date": "Oct 10:15:10 GMT", "pres": 926.0, "FO": "O"}, {"lon": -85.93, "lat": 29.47, "wspd": 148.0, "date": "Oct 10:15:20 GMT", "pres": 924.0, "FO": "O"}, {"lon": -85.9, "lat": 29.5, "wspd": 150.0, "date": "Oct 10:15:30 GMT", "pres": 923.0, "FO": "O"}, {"lon": -85.87, "lat": 29.53, "wspd": 150.0, "date": "Oct 10:15:40 GMT", "pres": 923.0, "FO": "O"}, {"lon": -85.83, "lat": 29.57, "wspd": 150.0, "date": "Oct 10:15:50 GMT", "pres": 923.0, "FO": "O"}, {"lon": -85.8, "lat": 29.6, "wspd": 150.0, "date": "Oct 10:16:00 GMT", "pres": 923.0, "FO": "O"}, {"lon": -85.77, "lat": 29.7, "wspd": 150.0, "date": "Oct 10:16:20 GMT", "pres": 921.0, "FO": "O"}, {"lon": -85.73, "lat": 29.8, "wspd": 150.0, "date": "Oct 10:16:40 GMT", "pres": 920.0, "FO": "O"}, {"lon": -85.7, "lat": 29.9, "wspd": 150.0, "date": "Oct 10:17:00 GMT", "pres": 919.0, "FO": "O"}, {"lon": -85.63, "lat": 29.93, "wspd": 153.0, "date": "Oct 10:17:10 GMT", "pres": 919.0, "FO": "O"}, {"lon": -85.57, "lat": 29.97, "wspd": 156.0, "date": "Oct 10:17:20 GMT", "pres": 919.0, "FO": "O"}, {"lon": -85.5, "lat": 30.0, "wspd": 160.0, "date": "Oct 10:17:30 GMT", "pres": 919.0, "FO": "O"}, {"lon": -85.47, "lat": 30.07, "wspd": 158.0, "date": "Oct 10:17:40 GMT", "pres": 919.0, "FO": "O"}, {"lon": -85.43, "lat": 30.13, "wspd": 156.0, "date": "Oct 10:17:50 GMT", "pres": 919.0, "FO": "O"}, {"lon": -85.4, "lat": 30.2, "wspd": 155.0, "date": "Oct 10:18:00 GMT", "pres": 920.0, "FO": "O"}, {"lon": -85.37, "lat": 30.27, "wspd": 153.0, "date": "Oct 10:18:20 GMT", "pres": 920.0, "FO": "O"}, {"lon": -85.33, "lat": 30.33, "wspd": 151.0, "date": "Oct 10:18:40 GMT", "pres": 921.0, "FO": "O"}, {"lon": -85.3, "lat": 30.4, "wspd": 150.0, "date": "Oct 10:19:00 GMT", "pres": 922.0, "FO": "O"}, {"lon": -85.27, "lat": 30.47, "wspd": 146.0, "date": "Oct 10:19:20 GMT", "pres": 923.0, "FO": "O"}, {"lon": -85.23, "lat": 30.53, "wspd": 143.0, "date": "Oct 10:19:40 GMT", "pres": 925.0, "FO": "O"}, {"lon": -85.2, "lat": 30.6, "wspd": 140.0, "date": "Oct 10:20:00 GMT", "pres": 927.0, "FO": "O"}, {"lon": -85.17, "lat": 30.7, "wspd": 135.0, "date": "Oct 10:20:20 GMT", "pres": 928.0, "FO": "O"}, {"lon": -85.13, "lat": 30.8, "wspd": 130.0, "date": "Oct 10:20:40 GMT", "pres": 930.0, "FO": "O"}, {"lon": -85.1, "lat": 30.9, "wspd": 125.0, "date": "Oct 10:21:00 GMT", "pres": 932.0, "FO": "O"}, {"lon": -85.03, "lat": 30.97, "wspd": 121.0, "date": "Oct 10:21:20 GMT", "pres": 934.0, "FO": "O"}, {"lon": -84.97, "lat": 31.03, "wspd": 118.0, "date": "Oct 10:21:40 GMT", "pres": 937.0, "FO": "O"}, {"lon": -84.9, "lat": 31.1, "wspd": 115.0, "date": "Oct 10:22:00 GMT", "pres": 940.0, "FO": "O"}, {"lon": -84.9, "lat": 31.1, "wspd": 110.0, "date": "Oct 10:22:20 GMT", "pres": 943.0, "FO": "O"}, {"lon": -84.9, "lat": 31.1, "wspd": 105.0, "date": "Oct 10:22:40 GMT", "pres": 946.0, "FO": "O"}, {"lon": -84.9, "lat": 31.1, "wspd": 100.0, "date": "Oct 10:23:00 GMT", "pres": 950.0, "FO": "O"}, {"lon": -84.77, "lat": 31.23, "wspd": 96.0, "date": "Oct 10:23:20 GMT", "pres": 951.0, "FO": "O"}, {"lon": -84.63, "lat": 31.37, "wspd": 93.0, "date": "Oct 10:23:40 GMT", "pres": 953.0, "FO": "O"}, {"lon": -84.5, "lat": 31.5, "wspd": 90.0, "date": "Oct 11:00:00 GMT", "pres": 955.0, "FO": "O"}, {"lon": -84.47, "lat": 31.57, "wspd": 88.0, "date": "Oct 11:00:20 GMT", "pres": 956.0, "FO": "O"}, {"lon": -84.43, "lat": 31.63, "wspd": 86.0, "date": "Oct 11:00:40 GMT", "pres": 958.0, "FO": "O"}, {"lon": -84.4, "lat": 31.7, "wspd": 85.0, "date": "Oct 11:01:00 GMT", "pres": 960.0, "FO": "O"}, {"lon": -84.3, "lat": 31.77, "wspd": 83.0, "date": "Oct 11:01:20 GMT", "pres": 961.0, "FO": "O"}, {"lon": -84.2, "lat": 31.83, "wspd": 81.0, "date": "Oct 11:01:40 GMT", "pres": 963.0, "FO": "O"}, {"lon": -84.1, "lat": 31.9, "wspd": 80.0, "date": "Oct 11:02:00 GMT", "pres": 965.0, "FO": "O"}, {"lon": -84.0, "lat": 31.97, "wspd": 78.0, "date": "Oct 11:02:20 GMT", "pres": 966.0, "FO": "O"}, {"lon": -83.9, "lat": 32.03, "wspd": 76.0, "date": "Oct 11:02:40 GMT", "pres": 968.0, "FO": "O"}, {"lon": -83.8, "lat": 32.1, "wspd": 75.0, "date": "Oct 11:03:00 GMT", "pres": 970.0, "FO": "O"}, {"lon": -83.73, "lat": 32.17, "wspd": 73.0, "date": "Oct 11:03:20 GMT", "pres": 971.0, "FO": "O"}, {"lon": -83.67, "lat": 32.23, "wspd": 71.0, "date": "Oct 11:03:40 GMT", "pres": 973.0, "FO": "O"}, {"lon": -83.6, "lat": 32.3, "wspd": 70.0, "date": "Oct 11:04:00 GMT", "pres": 975.0, "FO": "O"}, {"lon": -83.47, "lat": 32.43, "wspd": 66.0, "date": "Oct 11:04:40 GMT", "pres": 976.0, "FO": "O"}, {"lon": -83.33, "lat": 32.57, "wspd": 63.0, "date": "Oct 11:05:20 GMT", "pres": 977.0, "FO": "O"}, {"lon": -83.2, "lat": 32.7, "wspd": 60.0, "date": "Oct 11:06:00 GMT", "pres": 979.0, "FO": "O"}, {"lon": -82.97, "lat": 32.97, "wspd": 56.0, "date": "Oct 11:07:00 GMT", "pres": 980.0, "FO": "O"}, {"lon": -82.73, "lat": 33.23, "wspd": 53.0, "date": "Oct 11:08:00 GMT", "pres": 981.0, "FO": "O"}, {"lon": -82.5, "lat": 33.5, "wspd": 50.0, "date": "Oct 11:09:00 GMT", "pres": 983.0, "FO": "O"}, {"lon": -82.27, "lat": 33.7, "wspd": 50.0, "date": "Oct 11:10:00 GMT", "pres": 984.0, "FO": "O"}, {"lon": -82.03, "lat": 33.9, "wspd": 50.0, "date": "Oct 11:11:00 GMT", "pres": 985.0, "FO": "O"}, {"lon": -81.8, "lat": 34.1, "wspd": 50.0, "date": "Oct 11:12:00 GMT", "pres": 986.0, "FO": "O"}, {"lon": -81.47, "lat": 34.3, "wspd": 50.0, "date": "Oct 11:13:00 GMT", "pres": 987.0, "FO": "O"}, {"lon": -81.13, "lat": 34.5, "wspd": 50.0, "date": "Oct 11:14:00 GMT", "pres": 988.0, "FO": "O"}, {"lon": -80.8, "lat": 34.7, "wspd": 50.0, "date": "Oct 11:15:00 GMT", "pres": 990.0, "FO": "O"}, {"lon": -80.53, "lat": 35.03, "wspd": 50.0, "date": "Oct 11:16:00 GMT", "pres": 990.0, "FO": "O"}, {"lon": -80.27, "lat": 35.37, "wspd": 50.0, "date": "Oct 11:17:00 GMT", "pres": 990.0, "FO": "O"}, {"lon": -80.0, "lat": 35.7, "wspd": 50.0, "date": "Oct 11:18:00 GMT", "pres": 991.0, "FO": "O"}, {"lon": -79.6, "lat": 35.83, "wspd": 50.0, "date": "Oct 11:19:00 GMT", "pres": 990.0, "FO": "O"}, {"lon": -79.2, "lat": 35.97, "wspd": 50.0, "date": "Oct 11:20:00 GMT", "pres": 990.0, "FO": "O"}, {"lon": -78.8, "lat": 36.1, "wspd": 50.0, "date": "Oct 11:21:00 GMT", "pres": 990.0, "FO": "O"}, {"lon": -78.47, "lat": 36.23, "wspd": 50.0, "date": "Oct 11:22:00 GMT", "pres": 989.0, "FO": "O"}, {"lon": -78.13, "lat": 36.37, "wspd": 50.0, "date": "Oct 11:23:00 GMT", "pres": 989.0, "FO": "O"}, {"lon": -77.8, "lat": 36.5, "wspd": 50.0, "date": "Oct 12:00:00 GMT", "pres": 989.0, "FO": "O"}, {"lon": -77.23, "lat": 36.7, "wspd": 50.0, "date": "Oct 12:01:00 GMT", "pres": 988.0, "FO": "O"}, {"lon": -76.67, "lat": 36.9, "wspd": 50.0, "date": "Oct 12:02:00 GMT", "pres": 988.0, "FO": "O"}, {"lon": -76.1, "lat": 37.1, "wspd": 50.0, "date": "Oct 12:03:00 GMT", "pres": 988.0, "FO": "O"}, {"lon": -75.77, "lat": 37.17, "wspd": 53.0, "date": "Oct 12:04:00 GMT", "pres": 987.0, "FO": "O"}, {"lon": -75.43, "lat": 37.23, "wspd": 56.0, "date": "Oct 12:05:00 GMT", "pres": 986.0, "FO": "O"}, {"lon": -75.1, "lat": 37.3, "wspd": 60.0, "date": "Oct 12:06:00 GMT", "pres": 985.0, "FO": "O"}, {"lon": -74.43, "lat": 37.53, "wspd": 61.0, "date": "Oct 12:07:00 GMT", "pres": 984.0, "FO": "O"}, {"lon": -73.77, "lat": 37.77, "wspd": 63.0, "date": "Oct 12:08:00 GMT", "pres": 983.0, "FO": "O"}]
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//Function for converting line from storm track table to an object
function trackLineToObject(line){
  var fields = line.split(',');
  var wspd = fields[4].split('m')[0];
  var pres = fields[5].split('m')[0];
  return {'date':fields[0]+':'+fields[1],
          'lat':parseFloat(fields[2]),
          'lon':parseFloat(fields[3]),
          'wspd':parseFloat(wspd),
          'pres':parseFloat(pres),
          'FO':fields[fields.length-1]
    
  };
}
////////////////////////////////////////////////////////////////////////////////
function CalcStormMotion(y1,y2,x1,x2,dt){
  //return storm velocity components in meters per second
  
  // V = (y2-y1) * 111. *1000/ float(dt)
  var V = (y2-y1) * 111 *1000/ dt;
  
  // U = (x2-x1) * math.cos(y1*math.pi/180.) * 111. *1000/ float(dt)
  var U = (x2-x1) * Math.cos(y1*Math.PI/180) * 111 *1000/ dt;
  
  return {V:V,U:U};
}
////////////////////////////////////////////////////////////////////////////////
function getCoordGrid(lng,lat){
 
  var pt = ee.FeatureCollection([ee.Feature(ee.Geometry.Point([lng,lat]))]);
  // Map.addLayer(pt)
  var proj = ee.Projection(crs);
  
  var coords = ee.Image.pixelCoordinates(proj).float();
  var ptValues = ee.Image.constant(ee.List(ee.Dictionary(coords.reduceRegion(ee.Reducer.first(), pt, 1, crs)).values()));
  coords = coords.subtract(ptValues);
  return coords//.reproject(crs,null,1);
}
////////////////////////////////////////////////////////////////////////////////
//Function for creating wind fields from a pair of rows from a storm track table
function createHurricaneWindFields(current,future){
  // current = trackLineToObject(current);
  // future = trackLineToObject(future);
  
  var mytime = current['date'].split(':');
  var currentTimeForImage = ee.Date(new Date(mytime[0] + ' '+ year.toString() + ' ' +mytime.slice(1,3).join(':'))).millis();
 
  var cseconds = 3600*parseInt(mytime[1])+60*parseInt(mytime[2].split()[0]);

  var mytime = future['date'].split(':');
  var fseconds = 3600*parseInt(mytime[1])+60*parseInt(mytime[2].split()[0]);
 
  if(fseconds < cseconds){fseconds += 24*60*60}
        

  var CurrentLat = current['lat'];
  var CurrentLon = current['lon'];
  var FutureLat = future['lat'];
  var FutureLon = future['lon'];
  
  var MaxWind = current['wspd'];
  var CentralPressure = current['pres'];
  var FutureMaxWind = future['wspd'];
  var FutureCentralPressure = future['pres'];
  var HurricaneMotion = CalcStormMotion(CurrentLat,FutureLat,CurrentLon,FutureLon,fseconds-cseconds);
  var HurricaneMotionU = HurricaneMotion.U;
  var HurricaneMotionV = HurricaneMotion.V;
  
  var Lat = CurrentLat
  var Lon = CurrentLon
  var Wind = MaxWind
  var Pressure = CentralPressure
  
  //Not needed in GEE
  //var xc, yc = convert2grid(Lat,Lon,topo_info)

  // Pc   = Pressure * 100.
  var Pc   = Pressure * 100.
  
  //  Pe = 1013. *100.
  var Pe = 1013. *100.
  
  //  if Pe <= Pc:Pe = Pc * 1.05
  if(Pe <= Pc){Pe = Pc * 1.05}
   
  //deltaP = (Pe-Pc)/100.
  var deltaP = (Pe-Pc)/100
  
  //  Rmax  = ( math.exp(2.636-0.00005086*deltaP**2+0.037842*28.)) * 1000.
  var Rmax  = ( Math.exp(2.636-0.00005086*Math.pow(deltaP,2)+0.037842*28)) * 1000

  var HSpd = Math.sqrt(Math.pow(HurricaneMotionU,2)+Math.pow(HurricaneMotionV,2) )
  var HDir = Math.atan2( HurricaneMotionV, HurricaneMotionU )
  
  //This is replaced by the getCoordGrid function
  //     for d in range(1,5000):
  //         pts = []
  //         for x in (-d, d):
  //             for y in range(-d,d+1):
  //                 pts.append( (y,x) )
  //         for y in (-d,d):
  //             for x in range(-d+1,d):
  //                 pts.append( (y,x) )
  var xyGrid = getCoordGrid(Lon,Lat);
  // Map.addLayer(xyGrid)
  //Set up some constants
  var umin = 1000;
  var r = -1;
  var r0 = 1200*1000;
  var a = 0.25;
  var m =1.6;
  var n = 0.9;
  
  //No need to iterate here
  //         for py,px in pts:
  //             if 0<xc+px<nx and 0<yc+py<ny:
  
  //Convert to radius
  //                 r = math.sqrt( py**2+px**2 ) * 30.
  r = xyGrid.pow(2).reduce(ee.Reducer.sum()).sqrt();
  // Map.addLayer(r,{min:0,max:1000})
  
  function calcVholland(r){
    //  f1 = (Wind-HSpd)**2
    var f1 = ee.Image(Wind-HSpd).pow(2);
    
    //  f2 = ((r0-r)/(r0-Rmax))**2
    var f2 = ((ee.Image(r0).subtract(r)).divide(ee.Image(r0-Rmax))).pow(2);
    
    //  f3 = (r/Rmax)**2
    var f3 = (r.divide(ee.Image(Rmax))).pow(2);
    
    // t1n = (1.-a)*(n+m)
    var t1n = ee.Image((1-a)*(n+m));
    
    //  t1d = n+m*(r/Rmax)**(2.*(n+m))
    var t1d = ee.Image(n).add(ee.Image(m).multiply((r.divide(Rmax)).pow(2*(n+m))));
   
    //   t2n = a*(1.+2.*m)
    var t2n = ee.Image(a*(1+2*m));
    
    //  t2d = 1.+2.*m*(r/Rmax)**(2.*(m+1.))
    var t2d = ee.Image(1).add(ee.Image(2*m).multiply((r.divide(Rmax)).pow(2*(m+1))));
   
    // Vholland=math.sqrt(f1*f2*f3*(t1n/t1d+t2n/t2d))
    var Vholland=(f1.multiply(f2).multiply(f3).multiply(t1n.divide(t1d).add(t2n.divide(t2d)))).sqrt();
    return Vholland;
  }
    //                 if r > 0:
      //                 else:
  //                     Vholland = 0.
  var vHolland = ee.Image(0).where(r.gt(0),calcVholland(r));
  
  // Beta = -HDir - math.atan2(py,px)
  var Beta = ee.Image(-HDir).subtract(xyGrid.select(['y']).atan2(xyGrid.select(['x'])));
  
  // u = (Vholland + HSpd*math.sin(-Beta)) #/ 0.44704
  var u = vHolland.add((ee.Image(HSpd).multiply(Beta.multiply(-1).sin())));// 0.44704
  // Map.addLayer(u,{min:0,max:100});
  return u.set('system:time_start',currentTimeForImage);
  // umin = min(umin,u)
  // umin = ee.Image.cat([ee.Image(umin),u]).reduce(ee.Reducer.min());
}
////////////////////////////////////////////////////////////////////////////////
function GALES(WindSpeed, Hgt, CrownDepth, Spacing, ModRupture){
  if(ModRupture === undefined || ModRupture === null){ModRupture = 8500}
  Spacing = ee.Image(Spacing);
  function GALESFun(){
    
    // Z = 1.3;
    var Z = 1.3;
    
    // b = 2.*CrownDepth/Hgt
    var b = CrownDepth.divide(Hgt).multiply(2);
    
    // l = b*CrownDepth/Spacing*0.5
    var l = b.multiply(CrownDepth).divide(Spacing).multiply(0.5);
    
    // G35 = (1.-math.exp(-math.sqrt(15*l)))/math.sqrt(15*l)
    var G35 = ee.Image(1).subtract(l.multiply(15).sqrt().multiply(-1).exp().multiply(-1)).divide(l.multiply(15));
    
    // D = Hgt*(1.-G35)
    var D = Hgt.multiply(ee.Image(1).subtract(G35));
    
    //UstarRatio = min(0.3, math.sqrt(0.003+0.3*l))
    var UstarRatio = ee.Image.cat([ee.Image(0.3),((l.multiply(0.3)).add(0.003)).sqrt()]).reduce(ee.Reducer.min());
    
    // PsiH = 0.193
    var PsiH = 0.193;
    
    // Z0H = G35*math.exp(-0.4/UstarRatio-PsiH)
    var Z0H = G35.multiply(((UstarRatio.divide(-0.4)).subtract(PsiH)).exp());
    
    // HD = Spacing / Hgt
    var HD = ee.Image(Spacing).divide(Hgt);
    
    // z0 = Z0H * Hgt
    var z0 = Z0H.multiply(Hgt);
    
    // BMmean = 0.68*HD-0.0385+(-0.68*HD+0.4785)*(1.7239*HD+0.0316)**(5)
    var BMmean = HD.multiply(0.68).subtract(0.0385).add(((HD.multiply(-0.68)).add(0.4785)).multiply((HD.multiply(1.7239)).add(0.0316)).pow(5));
    
    // BMmax  = 2.7193*HD-0.061+(1.273*HD+0.9701)*(1.1127*HD+0.0311)**5
    var BMmax = HD.multiply(2.7193).subtract(0.061).add(((HD.multiply(1.273)).add(0.9701)).multiply((HD.multiply(1.1127)).add(0.0311)).pow(5));
    
    // G = BMmax/BMmean
    var G = BMmax.divide(BMmean);
    
    // MOR = ModRupture*6894.757
    var MOR = ee.Image(ModRupture*6894.757);
    
    // Mcrit = 0.00358811*MOR
    var Mcrit = MOR.multiply(0.00358811);
    
    // try:
    //     M = 1.22*(D-Z)*1.226*G*(0.4*Spacing*WindSpeed/math.log((Hgt-D)/z0))**2
    var M = D.subtract(Z).multiply(1.22).multiply(1.226).multiply(G).multiply(((Spacing.multiply(WindSpeed).multiply(0.4)).divide(((Hgt.subtract(D)).divide(z0)).log())).pow(2));
   
    // except:
    //     print(Hgt,Spacing, WindSpeed)
    //     print(D, Z, G, Spacing, WindSpeed, Hgt, z0)
    // if M<0:
    //     print('Negative M: ', BMmax, BMmean, Hgt, Spacing, WindSpeed, CBH)
    
    // R = M/Mcrit - 1.
    var R = M.divide(Mcrit).subtract(1);
    
    // return ( int(100. * math.exp(R) / (math.exp(R)+1.) ) - 50) *2
    var out = ((R.exp().multiply(100).divide((R.exp().add(1)))).subtract(50)).multiply(2);
    
    return out;
  }
    // if Spacing > 0  and Hgt > 0: #Hgt > 0 and Spacing > 0 and Hgt - CBH>0:
    // else:
    //     return 0
    var GALESOut = ee.Image(0).where(Spacing.gt(0).and(Hgt.gt(0)),GALESFun());
    return GALESOut;
    
}
    
////////////////////////////////////////////////////////////////////////////////
function createHurricaneWindFieldsWrapper(rows){
  var left = rows.slice(0,rows.length-1);
  var right = rows.slice(1,rows.length);
  var paired = ee.List(left).zip(right).getInfo();
  var c = ee.ImageCollection(paired.map(function(r){
    return createHurricaneWindFields(r[0],r[1]);
  }));
  // Map.addLayer(c)
  
  var wind_array  = ee.Image(c.max());
  wind_array = wind_array.updateMask(wind_array.gt(windThreshold));
  Map.addLayer(wind_array,{min:30,max:175,palette:palettes.cmocean.Speed[7]},'Max Wind');
  var GALESOut = GALES(wind_array.multiply(0.447), hgt_array.multiply(0.1), hgt_array.multiply(0.33*0.1), 5.0, 8500).updateMask(wind_array.mask());
  Map.addLayer(GALESOut,{min:-50,max:75,palette:palettes.cmocean.Thermal[7]}, 'GALES');
  
  
  wind_array = wind_array.clip(studyArea).unmask(255,false).byte();
  GALESOut = GALESOut.multiply(100).clip(studyArea).unmask(10001,false).int16();
  
  var outRegion = studyArea.bounds().transform('EPSG:4326', 100);
  print('Exporting:',outRegion);
  Export.image.toDrive(wind_array, name + '-wind', driveFolder, name + '-wind', null, outRegion, scale, crs, transform, 1e13);
  Export.image.toDrive(GALESOut, name + '-GALES', driveFolder, name + '-GALES', null, outRegion, scale, crs, transform, 1e13);

  
}
createHurricaneWindFieldsWrapper(rows);


Map.setOptions('HYBRID');







//                 if u > wind_threshold:
//                     StormWindField[yc+py,xc+px] = max(u,StormWindField[yc+py,xc+px])
//                     TotalStormWindField[yc+py,xc+px] = max(u,TotalStormWindField[yc+py,xc+px])
