import * as d3 from 'd3';

const colorScale = d3.scaleLinear()
    .domain([0, 1])
    .range(['#fff', '#123524']);

const margin = { top: 20, right: 20, bottom: 20, left: 20 };

const nBars = 100;
const barHeight = 12;

function ensureExists(selection, element, className) {
    const selectionString = className ? `${element}.${className}` : `${element}`;
    return selection.select(selectionString).empty() ?
        selection.append(element).attr('class', className) :
        selection.select(selectionString);
}

function renderLegend(selection, w) {
    const width = w - margin.left - margin.right;

    const svg = selection.select('.legend-scale')
        .attr('width', w)
        .attr('height', barHeight + margin.top + margin.bottom);

    const defs = svg.call(ensureExists, 'defs').select('defs');
    const marker = defs.call(ensureExists, 'marker').select('marker')
        .attr('id', 'arrow')
        .attr('markerWidth', 10)
        .attr('markerHeight', 10)
        .attr('refX', 0)
        .attr('refY', 3)
        .attr('orient', 'auto')
        .attr('markerUnits', 'strokeWidth');
    marker.call(ensureExists, 'path').select('path')
        .attr('d', 'M0,0 L0,6L9,3 Z');

    const g = svg.call(ensureExists, 'g', 'g-canvas').select('.g-canvas');

    g.attr('transform', `translate(${margin.left},${margin.top})`);

    const barData = d3.range(0, nBars).map(d => d / nBars);

    const xScaleBand = d3.scaleBand()
        .domain(barData)
        .range([0, width]);

    const xScaleLinear = d3.scaleLinear()
        .domain([0, 1])
        .range([0, width]);

    const tickValues = [0, 0.25, 0.5, 0.75, 1];

    const xAxis = d3.axisBottom(xScaleLinear)
        .tickValues(tickValues)
        .tickFormat(d => `${Math.round(d * 100)}%`);

    const bars = g.call(ensureExists, 'g', 'bars').select('.bars');

    const bar = bars.selectAll('.bar').data(barData);

    const barEnter = bar.enter().append('rect')
        .attr('class', 'bar');

    bar.merge(barEnter)
        .attr('x', d => xScaleBand(d))
        .attr('y', 0)
        .attr('width', xScaleBand.bandwidth())
        .attr('height', barHeight)
        .style('fill', d => colorScale(d));

    bar.exit().remove();

    const gXAxis = g.select('.axis.axis--x').empty() ?
        g.append('g').attr('class', 'axis axis--x') :
        g.select('.axis.axis--x');

    gXAxis
        .attr('transform', `translate(0,${barHeight})`)
        .call(xAxis);

    const tick = gXAxis.selectAll('.tick');

    tick.select('line')
        .filter(d => d === 0 || d === 1)
        .attr('y1', -barHeight);

    const arrowData = [
        {
            text: 'Definitely "up north"',
            x: width - 10,
            align: 'right',
        },
        {
            text: 'Not "up north"',
            x: 10,
            align: 'left',
        },
    ];

    const arrows = g.call(ensureExists, 'g', 'arrows').select('.arrows');

    const arrow = arrows.selectAll('.arrow').data(arrowData);

    const arrowEnter = arrow.enter().append('g')
        .attr('class', 'arrow');

    arrowEnter.append('line');
    arrowEnter.append('text');

    const arrowUpdate = arrow.merge(arrowEnter);

    function updateArrow(d) {
        const y = -10;
        let x1;
        let x2;
        if (d.align === 'right') {
            x1 = width - 30;
            x2 = width - 10;
        } else {
            x1 = 30;
            x2 = 10;
        }
        d3.select(this).select('line')
            .attr('x1', x1)
            .attr('x2', x2)
            .attr('y1', y)
            .attr('y2', y)
            .attr('marker-end', 'url(#arrow)');
        d3.select(this).select('text')
            .attr('x', x1)
            .attr('y', y)
            .attr('dx', d.align === 'right' ? -4 : 4)
            .attr('dy', '0.33em')
            .attr('text-anchor', d.align === 'right' ? 'end' : 'start')
            .text(d.text);
    }

    arrowUpdate.each(updateArrow);

    arrow.exit().remove();
}

export default renderLegend;
