#!/usr/bin/env bash

DIR=/directory_where_code_lives

rm -f $DIR/temp* $DIR/tif/up-north.tif

echo 'Downloading votes'
node $DIR/bin/get-votes.js > $DIR/votes.json

echo 'aggregate-area.py'
python $DIR/bin/aggregate-area.py \
    $DIR/votes.json \
    $DIR/temp-1.tif

echo 'gdal_translate (shrink GeoTiff)'
gdal_translate \
    -r lanczos \
    -outsize 1600 0 \
    $DIR/temp-1.tif \
    $DIR/temp-2.tif

echo 'colorize.js (convert 1-band value to 3-band RGB)'
node $DIR/bin/colorize.js \
    -i $DIR/temp-2.tif \
    -o $DIR/temp-3.tif

echo 'gdalwarp (cut GeoTiff to Wisconsin border)'
gdalwarp \
    -cutline $DIR/shp/wisconsin.shp \
    -crop_to_cutline \
    -dstalpha \
    $DIR/temp-3.tif \
    $DIR/temp-4.tif

echo 'gdalwarp (reproject GeoTiff)'
gdalwarp \
    -t_srs EPSG:3395 \
    -r lanczos \
    -wo SOURCE_EXTRA=1000 \
    -co COMPRESS=LZW \
    $DIR/temp-4.tif \
    $DIR/tif/up-north.tif

echo 'gdal_translate (GeoTiff to PNG)'
rm -f $DIR/public/up-north.png
gdal_translate \
    -of PNG \
    -outsize 800 0 \
    -r bilinear \
    $DIR/tif/up-north.tif \
    $DIR/output/up-north.png

echo 'Generated up-north.png'

rm -f $DIR/temp*
