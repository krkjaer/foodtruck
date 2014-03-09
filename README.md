Foodtruck
=========

This is a small sample project written with node.js and Backbone.js. I have no previous experience with either, so the choices where partly made based on a wish to learn how to use them.

Technical choices
----------------------

Overall design
------------------
The backend parses the original data into a subset with named attributes, for easier handling in the frontend. 

The server is kept quite simple. It exposes a REST api with two operations: 
* /foodtrucks, which retrieves all trucks. The only filtering done on the server-side is veryfiing the that each truck hasn't exceeded its expiration date.
* /fooditems, which retrieves a list of all available food items, for use in filters.

The frontend retrieves all data from the backend, and then uses filters locally to determine what to display. There are two kinds of filters:
* Position: The front-end only shows foodtrucks within the currently visible area.
* Available food items: The front-end shows a list of available items, allowing the user to filter the view.
