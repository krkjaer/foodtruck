$(function() {
	/* Model */	
	var Filter = Backbone.Model.extend({
		parse: function (item) {
			return {
				item: item
			};
		}
	});
	
	var FilterList = Backbone.Collection.extend({
		model: Filter,
		url: 'http://localhost:5000/fooditems',
		parse: function(response) {
			return response.fooditems;
		}
	});
	
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
			return 'Do not use this';
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
	
	var FiltersView = Backbone.View.extend({
		el: $('#filter-element'),
		
		events: {
			'change #filter-selector' : 'filterChanged'
		},
		
		filterChanged: function(e) {
			this.parentView.filterChanged($('#filter-selector').val());
		},
	
		initialize: function(opts) {
			this.collection = new FilterList();
			this.collection.on('reset', this.render, this);
			this.collection.fetch({reset: true});
			this.setElement($('#filter-element'))
		},
		
		render: function() {
			var template = _.template($('#filter-optionset').html(), {options: this.collection.models});
			this.$el.html(template);
		}
	});
	
	var FoodTrucksView = Backbone.View.extend({
		el: $('#map-element'),
	
		initialize: function(opts) {
			this.collection = new FoodTruckList();
			this.filterView = new FiltersView();
			this.filterView.parentView = this;
			this.infowindow = new google.maps.InfoWindow();
				
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
					// Get template for info window content
					var template = _.template($('#infoText').html(), { truck: truck });
					App.infowindow.setContent(template); // TODO: Scope
					App.infowindow.open(App.map, marker); // TODO: Scope
				});	
				truck.marker = marker;
			});
			
			this.collection.fetch({remove: false});
			
			this.render();
		},
		
		// Default position of map - potentially, we could get these from
		// the users location
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
				if (bounds && bounds.contains(truck.latlng)) {
					if ( App.filter && App.filter != "all" 
							&& truck.get('fooditems').indexOf(App.filter) < 0 ) {
						truck.marker.setVisible(false)
					} else {
						truck.marker.setVisible(true);
					}
				} else {
					truck.marker.setVisible(false);
				}
			});
		},
		
		filterChanged: function(value) {
			this.filter = value;
			App.renderFoodTrucks();
		}
	});
	
	var App = new FoodTrucksView();
})