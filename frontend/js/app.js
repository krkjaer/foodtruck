$(function() {
	/* Model */		
	var FoodTruck = Backbone.Model.extend({		
		parse: function(truck) {
			return {
				objectid: truck.objectid,
				applicant: truck.applicant,
				facilitytype: truck.facilitytype,
				locationdescription: truck.locationdescription,
				address: truck.address,
				status: truck.status,
				fooditems: truck.fooditems,
				position: {
					lat: truck.latitude,
					lng: truck.longitude
				},
				schedulelink: truck.schedulelink
			};
		},
		
		// TODO: This should really not be in the model
		infoText: function() {
			return "<h3>" + this.get('applicant') + "</h3>" + 
			"<h4>" + this.get('locationdescription') + "</h4>";
		},
		
		isWithin: function() {
			return true;
		}
	});
	
	/* A collection of food trucks */
	var FoodTruckList = Backbone.Collection.extend({ 
		model: FoodTruck,
		url: 'http://localhost:5000/foodtrucks',
	});
		
	/* Views */
	var FoodTrucksView = Backbone.View.extend({
		initialize: function(opts) {
			this.collection = new FoodTruckList();
			this.infowindow = new google.maps.InfoWindow();
			this.setElement($('#map-element'));
				
			/* Create the foodtruck marker when it is added to the foodtruck list */
			this.collection.on("add", function(truck) {
				truck.latlng = new google.maps.LatLng(truck.get('position').lat, truck.get('position').lng);
				var marker = new google.maps.Marker({
									position: truck.latlng,
									map: App.map, // TODO: This is _not_ how to do it
									title: truck.get('applicant')
								});
				
				/* Add a listener to the marker */
				google.maps.event.addListener(marker, 'click', function() {
					App.infowindow.setContent(truck.infoText()); // TODO: Scope
					App.infowindow.open(App.map, marker); // TODO: Scope
				});	
				truck.marker = marker;
			});
			
			//_.bindAll(this, 'render'); // TODO: What is the purpose of this?
			this.collection.fetch({remove: false});
			this.render();
		},
		
		// Temporary - these will become default when we cannot get the users position
		latitude: 37.77,
		longitude: -122.42,
		
		render: function() {
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
			this.map = new google.maps.Map(this.el,options);
			/* Google map events */
			google.maps.event.addListener(this.map, 'tilesloaded', function() {
				App.renderFoodTrucks();
			});
			google.maps.event.addListener(this.map, 'zoom_changed', function() {
				App.renderFoodTrucks();
			});
			google.maps.event.addListener(this.map, 'dragend', function() {
				App.renderFoodTrucks();
			});
			
			/* var marker = new google.maps.Marker({ // TODO: This should be animated, and use a different icon
					position: latlong,
					map: this.map,
					title: "You are here"
				}); */
			return this;
		},
		
		renderFoodTrucks: function () {
			var bounds = App.map.getBounds();
			App.collection.each(function(truck) {
				if (bounds && truck.marker && bounds.contains(truck.latlng)) {
					if (!truck.marker) {
						
					} else {
						truck.marker.setVisible(true);
					}
				} else {
					if (truck.marker) {
						truck.marker.setVisible(false);
					}
				}
			});
		}
	});
	
	var App = new FoodTrucksView();
})