#!/usr/bin/env node

var program = require('commander'),
colorsTmpl = require('colors-tmpl'),
tablify = require('tablify'),
fs = require('fs'),
scrape = require('./scrape'),
stories = require('./stories');

function print(s) {
	console.log(colorsTmpl(s));
}

program
	.version('0.0.1')
	.option('-u, --update', 'Scrape data from SABESP and update local database')
	.option('serve', 'Run server and update database on a 3 hours interval')
	.parse(process.argv);

if(program.update) {

	print('{yellow}{bold}Scrapping data{/bold}{/yellow}');
	scrape();

}

if(program.serve) {

	var port = process.env.PORT || 3000;

	var express = require('express');

	var app = express();

	var bundles = require('../bundle.result.json');

	app.set('view engine', 'ejs');

	app.get('/', function(req, res) {
		res.header('Cache-Control', 'public,max-age=172800');
		res.render(__dirname + '/../src/index.ejs', {
			'cdn': process.env.MANANCIAIS_CDN_HOST || '',
			'bundle': bundles
		});
	});

	app.use('/', express.static(__dirname + '/../public'));

	var getData = function(req, res) {
		res.header("Content-Type", 'text/plain');
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		res.header('Cache-Control', 'public,max-age=7200');
		res.sendfile('data/data.csv');
	};

	app.get('/data', getData);
	app.get('/data.csv', getData);

	stories(app);

	app.listen(port, function() {
		print('{yellow}{bold}Server running at port ' + port + '{/bold}{/yellow}');
		print('{bold}Data url: http://localhost:' + port + '/data.csv{/bold}');
	});

}
