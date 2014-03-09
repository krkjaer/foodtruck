Foodtruck
=========

This is a small sample project written with node.js and Backbone.js that provides the location of Food Trucks in San Francisco, and allows the user to filter them based on the type of food they provide.

Technical choices
-----------------
The frontend is implemented in Backbone.js, and provides most of the application logic. Backbone.js was chosen because it provides a simple framework for building MVC-like applications.

The backend is implemented in node.js. Node.js was chosen primarily because it allowed rapid development, and allowed both front- and backend to implemented in the same language.

Google Maps API has been used to provide the mapping functionality.

Overall design
--------------
The backend parses the original data into a subset with named attributes, for easier handling in the frontend. 

The server is kept quite simple. It exposes a REST api with two operations: 

* /foodtrucks, which retrieves all trucks. The only filtering done on the server-side is veryfiing the that each truck hasn't exceeded its expiration date.
* /fooditems, which retrieves a list of all available food items, for use in filters.

The frontend retrieves all data from the backend, and then uses filters locally to determine 
what to display. There are two kinds of filters:

* Position: The frontend only renders foodtrucks within the currently visible area.
* Available food items: The front-end shows a list of available items, allowing the 
user to filter the view.

Availability
-------
The application can be accessed on ellebaek.net: [http://ellebaek.net/sffoodtrucks](http://ellebaek.net/sffoodtrucks), while the node.js backend is hosted on OpenShift: [http://foodtrucks-krkjaer.rhcloud.com](http://foodtrucks-krkjaer.rhcloud.com)

Room for improvement
-------
Since the purpose of this software is mainly to try out Backbone.js and node.js, the implementation has several obvious areas that are ripe for improvement. Some low-hanging fruits are:

*  Provide a suitable styling for mobile/touch devices
*  Use geolocation to center the map
*  Use another icon for the trucks

Known issues
------
There are a couple of known issues:

* The markers appear to be slightly off, compared to where you would expect them to be.
* For some reason, the app tends to crash Mobile Safari.
