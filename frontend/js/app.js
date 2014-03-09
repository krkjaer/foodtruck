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
		url: 'http://foodtrucks-krkjaer.rhcloud.com/fooditems',
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
	});
	
	/* A collection of food trucks */
	var FoodTruckList = Backbone.Collection.extend({ 
		model: FoodTruck,
		url: 'http://foodtrucks-krkjaer.rhcloud.com/foodtrucks',
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
			
			this.latitude = opts.latitude;
			this.longitude = opts.longitude;
				
			/* Create the foodtruck marker when it is added to the foodtruck list */
			this.collection.on("add", function(truck) {
				truck.latlng = new google.maps.LatLng(truck.get('position').lat, truck.get('position').lng);
				var marker = new google.maps.Marker({
									position: truck.latlng,
									map: this.map, // TODO: This is _not_ how to do it
									title: truck.get('applicant'),
									visible: false
								});
				
				/* Add a listener to the marker */
				var _self = this;
				google.maps.event.addListener(marker, 'click', function() {
					// Get template for info window content
					var template = _.template($('#infoText').html(), { truck: truck });
					_self.infowindow.setContent(template); // TODO: Scope
					_self.infowindow.open(_self.map, marker); // TODO: Scope
				});	
				truck.marker = marker;
			}, this);
			
			this.collection.fetch({remove: false});
			
			this.render();
		},
		
		render: function() {
			var lat = this.latitude;
			var lng = this.longitude;
			var latlong = new google.maps.LatLng(lat, lng);
			var options = {
				zoom: 16,
				center: latlong,
				mapTypeId:google.maps.MapTypeId.ROADMAP,
				mapTypeControl:false,
				navigationControlOptions:{style:google.maps.NavigationControlStyle.SMALL} 
			};
			this.map = new google.maps.Map(this.el,options);
			/* Google map events */
			_self = this;
			google.maps.event.addListener(this.map, 'tilesloaded', function() {
				_self.renderFoodTrucks();
			});
			google.maps.event.addListener(this.map, 'zoom_changed', function() {
				_self.renderFoodTrucks();
			});
			google.maps.event.addListener(this.map, 'dragend', function() {
				_self.renderFoodTrucks();
			});
			this.renderFoodTrucks();
			return this;
		},
		
		renderFoodTrucks: function () {
			var bounds = this.map.getBounds();
			_self = this;
			this.collection.each(function(truck) {
				if (bounds && bounds.contains(truck.latlng)) {
					if ( _self.filter && _self.filter != "all" 
							&& truck.get('fooditems').indexOf(_self.filter) < 0 ) {
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
			this.renderFoodTrucks();
		}
	});
	
	// Retrieve position and show map
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition, handleError)
	} else {
		handleError();
	}

	function handleError(error)
	{
		// No geolocation - so use default position
		var App = new FoodTrucksView({latitude: 37.78, 
									 longitude: -122.398});
	}
	
	function showPosition(position)
	{
		var App = new FoodTrucksView({latitude: position.coords.latitude, 
									  longitude: position.coords.longitude})
	}
})