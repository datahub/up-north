#!/usr/bin/env node

const os = require('os');
const fs = require('fs')
const _ = require('lodash');
const d3 = require('d3');
const request = require('request');

request('https://apps.jsonline.com/tally/api/votes', (error, response, body) => {
    if (error) console.error(error);
    const data = JSON.parse(body);
    const votes = _.uniqBy(data, d => d.values + d.browser)
        .filter(d => {
        	const mean = d3.mean(d.values.split(',').map(d => +d));
        	return mean < 43.99 || mean > 44.01;
        });
    process.stdout.write(JSON.stringify(votes) + os.EOL);
});
