#!/usr/bin/env node

const fs = require('fs');
const d3 = require('d3');
const gdal = require('gdal');
const program = require('commander');

gdal.verbose();

program
    .usage('[options] <value>')
    .option('-i, --input <file>', 'Input GeoTIFF file')
    .option('-o, --output <file>', 'Output GeoTIFF file')
    .parse(process.argv);

const driver = gdal.drivers.get('GTiff');

const input = gdal.open(program.input);

const band = input.bands.get(1);
band.computeStatistics(false);
const min = band.minimum;
const max = band.maximum;
const size = band.size;

const output = driver.create(program.output, size.x, size.y, 3);
output.geoTransform = input.geoTransform;
output.srs = input.srs;

const red = output.bands.get(1);
red.colorInterpretation = gdal.GCI_RedBand;

const green = output.bands.get(2);
green.colorInterpretation = gdal.GCI_GreenBand;

const blue = output.bands.get(3);
blue.colorInterpretation = gdal.GCI_BlueBand;

const pixels = {
    value: band.pixels,
    r: red.pixels,
    g: green.pixels,
    b: blue.pixels,
};

const color = d3.scaleLinear()
    .domain([min, max])
    .range(['#fff', '#123524'])
    .interpolate(d3.interpolateHcl);

for (let x = 0; x < size.x; x++) {
    for (let y = 0; y < size.y; y++) {
        const value = pixels.value.get(x, y);
        const rgb = d3.rgb(color(value));
        pixels.r.set(x, y, rgb.r);
        pixels.g.set(x, y, rgb.g);
        pixels.b.set(x, y, rgb.b);
    }
}

// Wish this worked...
// const data = pixels.value.read(0, 0, size.x, size.y);
// const colorData = data.map(d => d3.rgb(color(d)));
// const redData = colorData.map(d => d.r);
// const greenData = colorData.map(d => d.g);
// const blueData = colorData.map(d => d.b);
// red.pixels.write(0, 0, size.x, size.y, redData);
// green.pixels.write(0, 0, size.x, size.y, greenData);
// blue.pixels.write(0, 0, size.x, size.y, blueData);

input.close();
output.close();