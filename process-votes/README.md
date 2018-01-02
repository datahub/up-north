To process the votes run `bash bin/process-votes.sh`

Here's a summary of the commands:
* `node bin/get-votes.js`
  1. downloads reader responses from the `tally/` API
  2. removes duplicates
  3. creates `votes.json`
* `python bin/aggregate-area.py`
  1. creates an "up north" polygon for each reader's response
  2. burns all of these polygons into a raster
    * `gdal.RasterizeLayer(raster, [1], polygons, burn_values=[1], options=['MERGE_ALG=ADD'])`
  3. write the aggregation raster to file as a GeoTIFF
* `gdal_translate`: shrink the GeoTIFF to a more managable size
* `node bin/colorize.js`: convert from 1-band sum values to 3-band color (white = few; green = many)
* `gdalwarp`: cut the GeoTIFF to the border of Wisconsin
* `gdalwarp`: reproject to mercator
* `gdal_translate`: convert from GeoTIFF to PNG
