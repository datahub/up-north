#!/usr/bin/env python

import sys
import json
import numpy as np
from scipy.interpolate import PchipInterpolator
from osgeo import gdal, gdalconst, ogr, osr
from osgeo.gdalconst import *

votes_filename = sys.argv[1]
raster_filename = sys.argv[2]

def lineString(coordinates):
    line = ogr.Geometry(ogr.wkbLineString)
    for coordinate in coordinates:
        line.AddPoint(coordinate[0], coordinate[1])
    return line

def polygon(coordinates):
    ring = ogr.Geometry(ogr.wkbLinearRing)
    for coordinate in coordinates:
        ring.AddPoint(coordinate[0], coordinate[1])
    poly = ogr.Geometry(ogr.wkbPolygon)
    poly.AddGeometry(ring)
    return poly

def add_feature(layer, geometry):
    layerDefn = layer.GetLayerDefn()
    feature = ogr.Feature(layerDefn)
    feature.SetGeometry(geometry)
    layer.CreateFeature(feature)
    feature = None

with open(votes_filename) as f:
    votes = json.load(f)

proj = osr.SpatialReference()
proj.SetWellKnownGeogCS('EPSG:4326')

dataset = ogr.GetDriverByName('MEMORY').CreateDataSource('out')

layerBorder = dataset.CreateLayer('up-north-border', srs = proj)
layerArea = dataset.CreateLayer('up-north-area', srs = proj)

layerDefnBorder = layerBorder.GetLayerDefn()
layerDefnArea = layerArea.GetLayerDefn()

for vote in votes:
    latitudes = [float(lat) for lat in vote['values'].split(',')]
    longitudes = [-92.91, -92.04571428571428, -91.18142857142857, -90.31714285714285, -89.45285714285714, -88.58857142857143, -87.72428571428571, -86.86]

    spline = PchipInterpolator(longitudes, latitudes)
    coordinates = []
    for longitude in np.arange(-92.91, -86.86, 0.1):
        latitude = spline(longitude)
        coordinates.append((longitude, float(latitude)))
    
    # Not currently used
    borderCoordinates = coordinates
    border = lineString(borderCoordinates)
    add_feature(layerBorder, border)

    areaCoordinates = []
    for coordinate in coordinates:
        areaCoordinates.append(coordinate)
    areaCoordinates.append((longitudes[-1], 50))
    areaCoordinates.append((longitudes[0], 50))
    areaCoordinates.append((longitudes[0], latitudes[0]))
    area = polygon(areaCoordinates)
    add_feature(layerArea, area)

pixel_size = 0.01
NoData_value = -999

x_min = -95
y_min = 41
x_max = -85
y_max = 50

x_res = int((x_max - x_min) / pixel_size)
y_res = int((y_max - y_min) / pixel_size)

raster_dataset = gdal.GetDriverByName('GTiff').Create(raster_filename, x_res, y_res, bands = 1, eType = gdal.GDT_UInt16)
raster_dataset.SetGeoTransform((x_min, pixel_size, 0, y_max, 0, -pixel_size))
srs = osr.SpatialReference()
srs.ImportFromEPSG(4326)
raster_dataset.SetProjection(srs.ExportToWkt())

band = raster_dataset.GetRasterBand(1)
band.SetNoDataValue(0)

gdal.RasterizeLayer(raster_dataset, [1], layerArea, burn_values=[1], options=['MERGE_ALG=ADD'])

band.ComputeBandStats()

dataset = None
