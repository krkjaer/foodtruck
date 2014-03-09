if (!global) var global = this;

var express = require('express');
var fs = require('fs');
var file = __dirname + '/foodtrucks.json';

function parse (data) {
	var parsedData = new Array();
	for (var i=0;i<data.length;i++) {
		parsedData.push(toFoodTruck(data[i]));
	}
	return parsedData;
}

function toFoodTruck(truck) {
	var item = 
		{
			objectid: truck[1],
			applicant: truck[9],
			facilitytype: truck[10],
			locationdescription: truck[12],
			address: truck[13],
			status: truck[18],
			fooditems: splitFoodItems(truck[19]),
			latitude: truck[22],
			longitude: truck[23],
			schedulelink: truck[24],
			/* For now, we happily ignore timezones */
			expirationdate: new Date(truck[29])
		};
	return item;
};

function splitFoodItems(foodItems) {
	var items = new Array();
	var result = new Array();
	if (foodItems)
		items = foodItems.split(':');
		
	for (var i = 0; i<items.length;i++) {
		var item = items[i].trim();
		if (item != "")
			result.push(item);
	}
	
	return result;
}

fs.readFile(file, 'utf8', function(err, data) {
	if (err) throw err;
	try {
		var data = JSON.parse(data);
		global.data = parse(data.data);
	} catch (e) {
		console.error('Parsing error:', e);
	}
});

var app = express();

/* Allow cross-domain origin */
app.all('/*', function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Acces-Control-Allow-Headers', 'X-Requested-With')
	next();
});

/* An explanatory index */
app.get('/', function(req, res) {
	console.log('/');
	res.send('Use /foodtrucks to retrieve all data');
});

app.get('/foodtrucks', function(req, res) {
	// TODO: Check filter
	console.log('/foodtrucks');
	res.jsonp(global.data.filter(function(item) {
		return item.expirationdate > new Date();
	}));
});

app.listen(5000);