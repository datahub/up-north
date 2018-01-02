# Where's up north for Wisconsinites?

An interactive map that asks readers to say where they're from and where "up north" is to them? Responses are analyzed to show what parts of Wisconsin readers as a whole think of as "up north."

Under the hood, there are three parts to the interactive, each with an associated folder in this repo:
* `frontend/`: webpage that readers see
* `tally/`: backend app that collects reader responses
* `process-votes/`: heat map generator

### `frontend/`

This is the webpage that shows the map, asks you to draw the line for "up north" and enter where you're from. 
After you respond it shows you the heat map of all readers' responses, which is created in `process-votes/` folder.

Most of the work is done with [D3.js](https://d3js.org/). The code is built with webpack. See 
[`frontend/README.md`](https://github.com/datahub/up-north/tree/master/frontend)
for instructions on how to develop and build the code.

### `tally/`

This is a [flask](http://flask.pocoo.org/) app that collects responses from readers. It uses the [peewee](https://github.com/coleifer/peewee) library to
manage the response data in a SQLite database.

First thing you'll need to do is create the database. In the `tally/` folder, open up python and enter:
```python
from models import create_database
create_database()
```

The database contains one table, votes, which has five columns:
* `_id`: unique ID for a vote (automatically generated)
* `timestamp`: when the vote was cast
* `values`: comma-separated list of eight latitudes
* `location`: where the reader is from, ie., the county in Wisconsin or state name if not a Wisconsinite
* `browser`: hash of user agent and IP address of poster

The `values` field defines the line the user drew. A line consists of eight points with fixed longitudes and variable latitudes, which the reader can adjust. Only latitudes are stored in the database
because the longitudes don't change.

The `browser` field is used later on to prevent one person from posting a bunch of times and skewing the results.

The API has two routes. One for posting a vote (`/api/vote`) and one for getting all votes (`/api/votes`). The vote posting data
should look like: `{ v: values..., l: location... }`.

### `process-votes/`

This pulls in reader responses and creates a heat map showing where most Wisconsinites think "up north" is.

The main script is `bin/process-votes.sh`, a bash script with a series of commands. This is run periodically as a
cron job. The end result is a PNG of the heat map, `output/up-north.png`, which is accessed by the frontend webpage
to display the response of readers as a whole.

Here's a summary of the commands:
* `node bin/get-votes.js`
  1. downloads reader responses from the `tally/` API
  2. removes duplicates
  3. creates `votes.json`
* `python bin/aggregate-area.py`
  1. creates an "up north" polygon for each reader's response
  2. burns all of these polygons into a raster
    * `gdal.RasterizeLayer(raster, [1], polygons, burn_values=[1], options=['MERGE_ALG=ADD'])`
    * this creates a raster where if 56 polygons overlap in one spot, the value for that pixel will be 56
  3. write the aggregation raster to file as a GeoTIFF
* `gdal_translate`: shrink the GeoTIFF to a more managable size
* `node bin/colorize.js`: convert from 1-band sum values to 3-band color (white = few; green = many)
* `gdalwarp`: cut the GeoTIFF to the border of Wisconsin
* `gdalwarp`: reproject to mercator
* `gdal_translate`: convert from GeoTIFF to PNG
