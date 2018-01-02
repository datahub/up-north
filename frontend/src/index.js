import * as d3 from 'd3';
import * as topojson from 'topojson';
import { kebabCase, round, debounce } from 'lodash';

import renderLegend from './components/render-legend';

import './styles.scss';

import './media/up-north.png';
import './media/highway-sign-2.svg';
import './media/highway-sign-8.svg';
import './media/highway-sign-10.svg';
import './media/highway-sign-18.svg';
import './media/highway-sign-29.svg';
import './media/highway-sign-33.svg';
import './media/highway-sign-64.svg';

import './data/topo.json';
import './data/bbox.json';
import './data/locations.csv';

let location;
let disabled = true;

const extent = {
    lon: [-92.91, -86.86],
    lat: [42.49, 47.09],
};

let width = 430;
let height = width * 1.263;

const container = d3.select('#up-north-quiz');

const svg = container.select('svg.map')
    .attr('width', width)
    .attr('height', height);

const locationSelect = container.select('#location-select');

const submitButton = container.select('#submit-choice');

const thanksMessage = container.select('.thanks-message');

const legend = container.select('.legend')
    .call(renderLegend, width);

const projection = d3.geoMercator();

const path = d3.geoPath()
    .projection(projection);

// https://stackoverflow.com/questions/8584902/get-closest-number-out-of-array
function closest(num, arr) {
    let curr = arr[0];
    let diff = Math.abs(num - curr);
    for (let val = 0; val < arr.length; val += 1) {
        const newdiff = Math.abs(num - arr[val]);
        if (newdiff < diff) {
            diff = newdiff;
            curr = arr[val];
        }
    }
    return curr;
}

function fitBounds(proj, size, bbox) {
    const [x0, y0, x1, y1] = bbox;
    const coordinates = [
        [x0, y0],
        [x0, y1],
        [x1, y0],
        [x1, y1],
        [x0, y0],
    ];
    const polygon = {
        type: 'Polygon',
        coordinates: [coordinates],
    };
    proj.fitSize(size, polygon);
}

function ready(error, topo, bbox, locations) {
    if (error) throw error;

    const locationsGrouped = d3.nest()
        .key(d => d.group)
        .entries(locations);

    locationSelect.append('option')
        .attr('disabled', '')
        .attr('selected', '')
        .attr('value', '')
        .text('Pick a location');

    const optgroup = locationSelect.selectAll('optgroup').data(locationsGrouped)
        .enter().append('optgroup')
            .attr('label', d => d.key);

    optgroup.selectAll('option').data(d => d.values)
        .enter().append('option')
            .attr('value', d => kebabCase(d.option))
            .text(d => d.option);

    const collectionWisconsin = topojson.feature(topo, topo.objects.wisconsin);
    const collectionHighways = topojson.feature(topo, topo.objects.highways);
    const collectionStates = topojson.feature(topo, topo.objects.states);

    fitBounds(projection, [width, height], bbox);

    const defs = svg.append('defs');
    const marker = defs.append('marker')
        .attr('id', 'choice-arrow')
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('refX', 0)
        .attr('refY', 1.5)
        .attr('orient', 'auto')
        .attr('markerUnits', 'strokeWidth');
    marker.append('path')
        .attr('d', 'M0,0 L0,3L4.5,1.5 Z');

    const markerUnderlying = defs.append('marker')
        .attr('id', 'choice-arrow-underlying')
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('refX', 0.5)
        .attr('refY', 1.5)
        .attr('orient', 'auto')
        .attr('markerUnits', 'strokeWidth');
    markerUnderlying.append('path')
        .attr('d', 'M0,0 L0,3L4.5,1.5 Z');

    svg.append('g').attr('class', 'states')
        .append('path')
        .datum(collectionStates)
        .attr('d', path);

    svg.append('g').attr('class', 'wisconsin')
        .append('path')
        .datum(collectionWisconsin)
        .attr('d', path);

    const upNorthRaster = svg.append('image')
        .attr('id', 'up-north-raster')
        .attr('xlink:href', 'http://45.55.209.220/up-north/up-north.png')
        .attr('width', width)
        .attr('height', height)
        .classed('hidden', true);

    svg.append('g').attr('class', 'wisconsin--border')
        .append('path')
        .datum(collectionWisconsin)
        .attr('d', path);

    svg.append('g').attr('class', 'highways')
        .append('path')
        .datum(collectionHighways)
        .attr('d', path);

    const city = svg.append('g').attr('class', 'cities')
            .selectAll('.city').data(topo.objects.cities.geometries)
        .enter().append('g')
            .attr('class', 'city')
            .attr('transform', (d) => {
                const p = projection(d.coordinates);
                return `translate(${p[0]}, ${p[1]})`;
            });

    city.append('text')
        .text(d => d.properties.NAME);

    const highwaySymbolData = [
        {
            number: 18,
            coordinates: [-89.11684705938869, 42.94672679789123],
        },
        {
            number: 18,
            coordinates: [-90.5564947727811, 42.989204233617194],
        },
        {
            number: 33,
            coordinates: [-89.89472122710879, 43.51348638672223],
        },
        {
            number: 33,
            coordinates: [-88.4434634515116, 43.42923005211662],
        },
        {
            number: 10,
            coordinates: [-89.32582817907469, 44.47398723017432],
        },
        {
            number: 10,
            coordinates: [-91.12538782081519, 44.58158733276998],
        },
        {
            number: 29,
            coordinates: [-90.69581551923842, 44.95251427254231],
        },
        {
            number: 29,
            coordinates: [-88.65244457119759, 44.76322698402232],
        },
        {
            number: 64,
            coordinates: [-88.33897289166862, 45.14117930381352],
        },
        {
            number: 64,
            coordinates: [-92.1006330460165, 45.149368015787445],
        },
        {
            number: 8,
            coordinates: [-90.7654758924671, 45.5491740172909],
        },
        {
            number: 8,
            coordinates: [-88.53634394914982, 45.64665522278497],
        },
        {
            number: 2,
            coordinates: [-91.32275887829641, 46.564283159743276],
        },
        {
            number: 2,
            coordinates: [-89.30260805466513, 46.195850476671566],
        },
    ];

    const highwaySymbolWidth = 18;

    svg.append('g').attr('class', 'highway-symbols')
            .selectAll('.highway-symbol').data(highwaySymbolData)
        .enter().append('image')
            .attr('class', 'highway-symbol')
            .attr('transform', (d) => {
                const p = projection(d.coordinates);
                return `translate(${p[0]},${p[1]})`;
            })
            .attr('width', highwaySymbolWidth)
            .attr('height', highwaySymbolWidth)
            .attr('x', -highwaySymbolWidth / 2)
            .attr('y', -highwaySymbolWidth / 2)
            .attr('xlink:href', d => `media/highway-sign-${d.number}.svg`);

    const n = 8;

    const curve = d3.curveMonotoneX;

    const line = d3.line()
        .x(d => projection(d)[0])
        .y(d => projection(d)[1])
        .curve(curve);

    const area = d3.area()
        .x(d => projection(d)[0])
        .y0(d => projection(d)[1])
        .y1(d => projection([d[0], 50])[1])
        .curve(curve);

    const lonScale = d3.scaleLinear()
        .domain([0, n - 1])
        .range(extent.lon);

    const points = d3.range(n)
        .map(d => [lonScale(d), 44]);

    const upNorth = svg.append('g')
        .attr('class', 'up-north');

    const upNorthArea = upNorth.append('path')
        .attr('class', 'area');

    const upNorthBorderUnderlying = upNorth.append('path')
        .attr('class', 'border border--underlying hidden');

    const upNorthBorder = upNorth.append('path')
        .attr('class', 'border');

    const upNorthTitle = upNorth.append('text')
        .attr('class', 'title')
        .text('"UP NORTH"');

    const upNorthChoiceMarker = upNorth.append('g')
        .attr('class', 'choice-marker hidden');

    upNorthChoiceMarker.append('line')
        .attr('class', 'underlying')
        .attr('y1', 34)
        .attr('y2', 14)
        .attr('marker-end', 'url(#choice-arrow-underlying)');

    upNorthChoiceMarker.append('line')
        .attr('y1', 34)
        .attr('y2', 14)
        .attr('marker-end', 'url(#choice-arrow)');

    upNorthChoiceMarker.append('text')
        .attr('x', 14)
        .attr('y', 34)
        .attr('dy', '1em')
        .text('Your choice');

    function update() {
        upNorthArea
            .datum(points)
            .attr('d', area);
        upNorthBorderUnderlying
            .datum(points)
            .attr('d', line);
        upNorthBorder
            .datum(points)
            .attr('d', line);
        upNorthTitle
            .attr('transform', () => {
                const lon = (extent.lon[1] + extent.lon[0]) / 2;
                const lat = d3.mean(points, d => d[1]);
                const p = projection([lon, lat]);
                return `translate(${p[0]}, ${p[1] - 150})`;
            });
    }

    function dragStarted() {
        const p = projection.invert([d3.event.subject.x, d3.event.subject.y]);
        const min = closest(p[0], points.map(d => d[0]));
        const i = points.map(d => d[0]).indexOf(min);
        points[i][1] = p[1];
        update();
    }

    function dragged() {
        const p = projection.invert([d3.event.x, d3.event.y]);
        const min = closest(p[0], points.map(d => d[0]));
        const i = points.map(d => d[0]).indexOf(min);
        points[i][1] = p[1];
        update();
    }

    function dragContainer() { return this; }

    const drag = d3.drag()
        .container(dragContainer)
        .on('start', dragStarted)
        .on('drag', dragged);

    function changeLocation() {
        location = d3.event.target.value;
        disabled = false;
        submitButton.classed('disabled', false);
    }

    locationSelect.on('change', changeLocation);

    function showResults() {
        // Hide some stuff
        container.selectAll('.step').classed('hidden', true);
        upNorthArea.classed('hidden', true);
        upNorthTitle.classed('hidden', true);

        // Show other stuff
        upNorthRaster.classed('hidden', false);
        thanksMessage.classed('hidden', false);
        legend.classed('hidden', false);
        city.select('text')
            .style('fill', '#444');
        upNorthBorderUnderlying.classed('hidden', false);
        upNorthBorder.classed('border--with-results', true);

        const [tx, ty] = projection(points.slice(-2)[0]);
        upNorthChoiceMarker
            .classed('hidden', false)
            .attr('transform', `translate(${tx},${ty})`);

        // Remove drag functionality
        drag
            .on('start', null)
            .on('drag', null);
    }
    function submitChoice() {
        if (!disabled) {
            submitButton
                .classed('disabled', true)
                .on('click', null);
            const values = points.map(d => round(d[1], 3)).join(',');
            const data = JSON.stringify({ l: location, v: values });
            showResults();
            d3.request('https://apps.jsonline.com/tally/api/vote')
                .post(data, (errorPost, response) => {
                    if (errorPost) throw error;
                });
        }
    }

    submitButton.on('click', submitChoice);

    svg.call(drag);

    function resize() {
        width = +container.style('width').replace('px', '');
        height = width * 1.263;

        svg.attr('height', height);

        fitBounds(projection, [width, height], bbox);

        svg.select('.states path').attr('d', path);
        svg.select('.wisconsin path').attr('d', path);
        svg.select('.wisconsin--border path').attr('d', path);
        svg.select('.highways path').attr('d', path);
        svg.selectAll('.highway-symbol')
            .attr('transform', (d) => {
                const p = projection(d.coordinates);
                return `translate(${p[0]},${p[1]})`;
            });

        city.attr('transform', (d) => {
            const p = projection(d.coordinates);
            return `translate(${p[0]}, ${p[1]})`;
        });

        upNorthRaster
            .attr('width', width)
            .attr('height', height);

        legend.call(renderLegend, width);

        update();
    }

    resize();

    d3.select(window).on('resize', debounce(resize, 250));
}

d3.queue()
    .defer(d3.json, 'data/topo.json')
    .defer(d3.json, 'data/bbox.json')
    .defer(d3.csv, 'data/locations.csv')
    .await(ready);
