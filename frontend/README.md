# up-north frontend

To get started first you'll need to install some node packages.
```
npm install
```

Then you'll need to download and clean up some geographic data. The
data is put together using [`make`](https://www.gnu.org/software/make/). In addition to `make`, it requires some of the standard command line programs like `curl`, `unzip` and `tar`. It also uses [`mapshaper`](https://github.com/mbloch/mapshaper) to process the map data and [`jq`](https://stedolan.github.io/jq/) to process some JSON. If you have these installed run:
```
cd data
make
cd ..
```

Work in the src folder. Then run a webserver and open the app.
```
npm start
```

Then, when ready, build the app for production and copy the files in the `dist` folder.
```
npm run build
```
