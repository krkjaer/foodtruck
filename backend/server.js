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
		
	// Add all items to the item-list, but do a bit of cleanup first
	for (var i = 0; i<items.length;i++) {
		var item = items[i].trim();
		if (item.charAt(item.length -1) === ".")
			item = item.slice(0,-1);
		if (item != "")
			result.push(item.toLowerCase());
	}
	
	return result;
}

/* Create a unique list of fooditems */
function createItemList() {
	global.fooditems = new Array();
	for(var i=0;i<global.data.length;i++) {
		if(global.data[i].expirationdate > new Date()) {
			for(var j=0;j<global.data[i].fooditems.length;j++) {
				if(global.fooditems.indexOf(global.data[i].fooditems[j]) < 0) {
					global.fooditems.push(global.data[i].fooditems[j]);
				}
			}
		}
	}
	global.fooditems.sort();
};

fs.readFile(file, 'utf8', function(err, data) {
	if (err) throw err;
	try {
		var data = JSON.parse(data);
		global.data = parse(data.data);
		createItemList();
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
		/* console.log("Expires: " + item.expirationdate);
		console.log("Now: " + new Date());
		console.log(item.expirationdate > new Date()); */
		return item.expirationdate > new Date();
	}));
});

app.get('/fooditems', function(req, res) {
	console.log('/fooditems');
	res.jsonp({fooditems: global.fooditems});
});

app.listen(5000);