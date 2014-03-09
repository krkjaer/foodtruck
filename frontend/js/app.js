$(function() {
	/* Model - A single Food Truck item */
	var FoodTruck = Backbone.Model.extend({
		defaults: function() {
			return {
				objectid: '',
				applicant: '',
				facilitytype: '',
				locationdescription: '',
				address: '',
				status: '',
				fooditems: new Array(),
				latitude: 0,
				longitude: 0,
				schedulelink: ''
			};
		},
		
		isWithin: function(map) {
			return true; // TODO: Determine if this model is visibl
		}
	});
	
	/* A collection of food trucks */
	var FoodTruckList = Backbone.Collection.extend({ 
		model: FoodTruck,
		
		url: 'http://localhost:5000/foodtrucks',
		
		visible: function(map) {
			return this;
		}
	});
		
	/* Views */
	var TruckView = Backbone.View.extend({
		initialize: function(opts) {
			// TODO: Set element
			this.options = {
				position: new google.maps.LatLng(this.model.get('latitude'),
												 this.model.get('longitude')),
				map: null,
				title: this.model.get('applicant')
			};
			
			this.infoText = "<h3>" + truck.get('applicant') + "</h3>" + 
			"<h4>" + truck.get('locationdescription') + "</h4>";
		},
		
		render: function(){
			google.maps.event.addListener(marker, 'click', function() {
    				App.infowindow.setContent(infoText(truck)); // TODO: Scope
    				App.infowindow.open(App.map, marker); // TODO: Scope
    			});			
			return this;
		}
	});
	
	var FoodTrucksView = Backbone.View.extend({
		initialize: function(opts) {
			this.collection = new FoodTruckList();
			this.infowindow = new google.maps.InfoWindow();
				
			/* Render the foodtruck marker when it is added to the foodtruck list */
			this.collection.on("add", function(truck) {
				if (truck.isWithin(App.Map)) {
					var latlng = new google.maps.LatLng(truck.get('latitude'), truck.get('longitude'));
					var marker = new google.maps.Marker({
						position: latlng,
						map: App.map, // TODO: This is _not_ how to do it
						title: truck.get('applicant')
					});
				truck.marker = marker; // So we can find it if we remove it.
				}
			});
			
			_.bindAll(this, 'render');
			this.collection.fetch({remove: false});
		},
		
		// Temporary - these will become default when we cannot get the users position
		latitude: 37.77,
		longitude: -122.42,
		
		render: function() {
			var mapElement = document.getElementById('mapHolder');
			var lat = this.latitude;
			var lng = this.longitude;
			var latlong = new google.maps.LatLng(lat, lng);
			var options = {
				zoom: 14,
				center: latlong,
				mapTypeId:google.maps.MapTypeId.ROADMAP,
				mapTypeControl:false,
				navigationControlOptions:{style:google.maps.NavigationControlStyle.SMALL} 
			};
			this.map = new google.maps.Map(mapElement,options);
			/* Google map events */
			google.maps.event.addListener(this.map, 'tilesloaded', function() {
				//this.renderVisible();
			});
			google.maps.event.addListener(this.map, 'zoom_changed', function() {
				this.bounds = App.map.getBounds(); // TODO: Change model state
			});
			google.maps.event.addListener(this.map, 'dragend', function() {
				this.bounds = App.map.getBounds(); // TODO: Change model state
			});
			
				
			
			/* var marker = new google.maps.Marker({ // TODO: This should be animated, and use a different icon
					position: latlong,
					map: this.map,
					title: "You are here"
				}); */
			return this;
		},
		renderVisible: function() {
			this.collection.each()(function (truck) {
			
			});
		}
	});
	
	var App = new FoodTrucksView();
	App.render();
})