
By: John Conway
--------------------------
:::::NEIGHBORHOOD MAP:::::
--------------------------


-----------------
:::::CREDITS:::::
-----------------
This code was written using CodePen.
Thanks to Udacity for inspiration, and various code snippets used throughout.
This application uses the google maps javascript API. Various code snippets have been taken from the documentation.
This application also uses the foursquare url APIs with JQuery Ajax calls.


-----------------
:::::PURPOSE:::::
-----------------
Explore neighborhoods using google maps and FourSquare APIs. Check an establishment's streetview, picture, google rating, foursquare rating, hours, and more!


----------------
:::::HOW TO:::::
----------------
1) Download the repository
2) Open index.html with your browser of choice
3) Have fun!
4) Use the drawing manager to draw shapes which narrow down your searchbox selection

At the top of the aside there are 3 buttons:
- the eraser button will erase all searchbox results from the aside.
- the paintbrush will toggle the drawing manager on/off
- the database button will drop the default hard-coded markers onto the map


--------------------------
:::::TECHNICAL STUFFS:::::
--------------------------
When the markers are dropped onto the map, an object is created within the javascript and stored within an observableArray() called markersAndPlaces. The object has the following attributes:

markersAndPlaces object = 
{
        marker: Marker,                   (this is the google api Marker object)
        place: PlaceResult,               (this is a google PlaceResult object, returned from the SearchBox.getPlaces() method)
        visible: ko.observable(),         (this is an observable, toggled between boolean values true and false)
        foursquareInfo: ko.observable(),  (this is an observable, toggled between boolean values true and false)
        googleInfo: ko.observable()       (this is an observable, toggled between boolean values true and false)
}
 
