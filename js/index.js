var model = {
  data: [
    {
      name: "Sushi Seki Times Square",
      googleID: "ChIJs_C94VNYwokRAL_Ca9EH3rw",
      foursquareID: "56170622498ecfea6b924d0b",
      position: { lat: 40.760942, lng: -73.99007489999997 }
    },
    {
      name: "Mt. Fuji",
      googleID: "ChIJXQNum4fgwokRVCtTQI7HpkY",
      foursquareID: "4b64f8a6f964a52003dd2ae3",
      position: { lat: 41.1288107, lng: -74.16876760000002 }
    },
    {
      name: "Bellissimo",
      googleID: "ChIJP5aQjqrowokRrq27i5HB4W8",
      foursquareID: "4c9bd88c46978cfa94bb887f",
      position: { lat: 41.03909220000001, lng: -74.02859639999997 }
    },
    {
      name: "Menya Sandaime",
      googleID: "ChIJSYn-ren2wokRi9ff6gVFOcU",
      foursquareID: "533f3cd6498eafdebcb3fa67",
      position: { lat: 40.8497359, lng: -73.96770349999997 }
    },
    {
      name: "Quality Italian",
      googleID: "ChIJsTgQqfBYwokRU3iwRQ4U0Hc",
      foursquareID: "51e7310c498e639ed27062b1",
      position: { lat: 40.764518, lng: -73.976763 }
    }
  ],

  foursquare_id: "4MKB5U3G31V4SAMFWDPH20G44OQEY31MIWAP4NTW3EIQLZVT",
  foursquare_secret: "DMQEG0VWTW1D2JYU5QTELRJUMY1HQ0WBH1SWWM3H3GORFRTA",
  foursquare_version: "20170801",
  // create function that returns icon object
  // for default icon
  default_icon: function() {
    var icon = {
      url:
        "http://icons.iconarchive.com/icons/icons-land/vista-map-markers/256/Map-Marker-Marker-Outside-Chartreuse-icon.png",
      size: new google.maps.Size(71, 71),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(45, 45)
    };
    return icon;
  },
  // create function that returns icon object
  // for hover icon
  hover_icon: function() {
    var icon = {
      url:
        "http://icons.iconarchive.com/icons/icons-land/vista-map-markers/256/Map-Marker-Marker-Inside-Chartreuse-icon.png",
      size: new google.maps.Size(71, 71),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(45, 45)
    };
    return icon;
  }
};


var ViewModel = function() {
  
  // self=this trick
  var self = this;
  
  // function to drop the default icons on the map
  this.dropDefaultMarkers = function() {
    console.log("Now within dropDefaultMarkers function");

    self.clearMarkersAndPlaces();

    console.log("cleared markersAndPlaces array");

    model.data.forEach(function(data) {
      // clear current self.bounds for the default icons
      self.bounds = new google.maps.LatLngBounds();

      var request = {
        placeId: data.googleID
      };

      var svc = new google.maps.places.PlacesService(map);

      svc.getDetails(request, function(place, status) {
        if (status == "OK") {
          var marker = new google.maps.Marker({
            position: data.position,
            title: data.name,
            map: map,
            animation: google.maps.Animation.DROP,
            icon: model.default_icon()
          });

          // add event listener to show info window
          // when marker is clicked on
          marker.addListener("click", function() {
            console.log("the marker was clicked");
            self.currentWindowPosition(marker.position);
            self.populateInfoWindow(this);
          });

          // add event when hovered over marker
          marker.addListener("mouseover", function() {
            this.setIcon(model.hover_icon());
          });

          // add event when no longer hoevered
          marker.addListener("mouseout", function() {
            this.setIcon(model.default_icon());
          });

          self.markersAndPlaces.push({
            marker: marker,
            place: place,
            // initialize visible to true so the marker appears
            visible: ko.observable(true),
            // initialize to false so the fs info window does not appear
            foursquareInfo: ko.observable(false),
            // initialize to false to the google info window does not appear
            googleInfo: ko.observable(false)
          });

          // extend the bounds for the current marker position
          self.bounds.extend(marker.position);

          // fit map to current bounds
          map.fitBounds(self.bounds);
        } else {
          console.log("getDetails method status NOT OK");
        }
      });
    });
  };
  
  // function to toggle the marker icon when the 
  // associated object within the aside is hovered over
  this.markerIconToHover = function(object) {
    object.marker.setIcon(model.hover_icon());
  }
  this.markerIconToDefault = function(object) {
    object.marker.setIcon(model.default_icon());
  }
  
  
  
  
  /* The following functions and objects are 
   * involved with the Map object created 
   */
  
  // initialize google Map object
  var map = new google.maps.Map($("#map")[0], {
    center: { lat: 40.7713024, lng: -73.9632393 },
    zoom: 13,
    mapTypeControl: false
  });
  // add listener for when the map tiles are loaded
  map.addListener("tilesloaded", function() {
    // pass the maps bounds into the currentBounds observable
    self.currentBounds(map.getBounds());
    // pass the maps bounds into the currentMapCenter observable
    self.currentMapCenter(map.getCenter());
    // update the bounds for the searchBox
    self.searchBox.setBounds(self.currentBounds());
  });
  // add listener for when the map is dragged
  map.addListener("drag", function() {
    // pass the maps bounds into the currentBounds observable
    self.currentBounds(map.getBounds());
    // pass the maps bounds into the currentMapCenter observable
    self.currentMapCenter(map.getCenter());
    // update the bounds for the searchBox
    self.searchBox.setBounds(self.currentBounds());
  });
  // observable for the current bounds of the map
  this.currentBounds = ko.observable();
  // observable for the current center of the map
  this.currentMapCenter = ko.observable();
  // initialize google LatLng object
  this.bounds = new google.maps.LatLngBounds();
  
  
  
  /* The following functions and objects are 
   * involved with the Markers objects created 
   */
  
  // empty observable to hold markers and place results
  this.markersAndPlaces = ko.observableArray();
  // function to sort the objects by visibility
  this.sortMarkersArray = function() {
    self.markersAndPlaces.sort(function(left, right) {
      return left.visible() == right.visible()
        ? 0
        : left.visible() < right.visible() ? 1 : -1;
    });
  };
  // function for removing a marker
  // first setMap(null), then pop from observableArray
  this.removeMarker = function(object) {
    object.marker.setMap(null);
    self.markersAndPlaces.remove(object);
  };
  // clears the markersAndPlaces observableArray
  // removes all markers from map
  this.clearMarkersAndPlaces = function() {
    self.markersAndPlaces().forEach(function(object) {
      object.marker.setMap(null);
    });
    self.markersAndPlaces.removeAll();
  };
  // function to toggle if marker is visible
  this.toggleMarkerVisible = function(object) {
    if (object.marker.getVisible()) {
      object.marker.setVisible(false);
      self.infoWindow.close();
      self.currentWindowPosition(null);
      object.googleInfo(false);
      object.foursquareInfo(false);
      object.visible(false);
    } else {
      object.marker.setVisible(true);
      object.visible(true);
    }
    self.sortMarkersArray();
  };
  
  
  
  /* The following functions and objects are 
   * involved with the InfoWindow object created 
   */

  // info window, only need one open at a time
  this.infoWindow = new google.maps.InfoWindow();
  // observable to hold the current marker's location
  this.currentWindowPosition = ko.observable();
  // function for closing a markers info window
  this.infoWindow.addListener("closeclick", function() {
    self.infoWindow.marker = null;
    self.currentWindowPosition(null);
  });
  // function to populate an info window
  this.populateInfoWindow = function(marker) {
    console.log("Now calling the populateInfoWindow function()");
    if (marker.getVisible()) {
      console.log("Marker is visible...");
      self.infoWindow.setContent("");
      // clear infoWindow for street content
      self.infoWindow.marker = marker;
      // capture the position of the current marker
      // within the observable
      self.currentWindowPosition(marker.position);

      // add street view pano
      var sv = new google.maps.StreetViewService();

      function processSVData(data, status) {
        self.infoWindow.setContent(
          "<div>" + marker.title + "</div>" + '<div id="pano"></div>'
        );
        var panorama = new google.maps.StreetViewPanorama($("#pano")[0]);
        panorama.setPano(data.location.pano);
        panorama.setPov({
          heading: 270,
          pitch: 0
        });
        panorama.setVisible(true);
      }

      sv.getPanorama(
        {
          location: marker.position,
          radius: 50
        },
        processSVData
      );

      self.infoWindow.open(map, marker);
    } else {
      console.log("Marker is not visible..");
      self.infoWindow.close();
    }
  };
  
  
  
  
  /* The following functions and objects are 
   * involved with the SearchBox object created 
   */
  
  // initialize the autocomplete object for the neighborhood search bar
  this.neighborhoodAutoComplete = new google.maps.places.Autocomplete($("#neighborhoodZoom")[0]);
  // create neighborhood variable to represent the current bounds
  this.neighborhood = ko.observable("New York City");
  // function which executes sorrounding the
  // neighborhood form section in the aside
  this.zoomToNeighborhood = function() {
    var geocoder = new google.maps.Geocoder();
    var address = $("#neighborhoodZoom").val();
    geocoder.geocode({ address: address }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
        var objectResults = results[0].address_components;
        for (var i = 0; i < objectResults.length; i++) {
          if (objectResults[i].types[0] == "locality") {
            self.neighborhood(objectResults[i].long_name);
          }
        }
        //console.log(results[0].address_components);
      } else {
        alert(
          "Could not find specified address\n" +
            "Try clicking on one of the autocomplete suggestions!"
        );
      }
    });
  };
  
  
  
  
  /* The following functions and objects are 
   * involved with the SearchBox object created 
   */
  
  // create searchbox object
  this.searchBox = new google.maps.places.SearchBox($("#searchTerms")[0], {
    bounds: self.currentBounds()
  });
  // add listener function to retrieve results
  // from search box when the place is changed
  this.searchBox.addListener("places_changed", function() {
    // retrieve places from searchBox object getPlaces() method
    var places = self.searchBox.getPlaces();
    // if no place was returned alert user
    if (places.length === 0) {
      alert(
        "No places found\n" + "Try selecting an option from the suggested items"
      );
      return;
    }
    // clear markersAndPlaces array
    self.clearMarkersAndPlaces();
    // reset the bounds object to resize the map
    self.bounds = new google.maps.LatLngBounds();
    // iterate through places
    places.forEach(function(place) {
      // create marker from place using function
      var marker = self.createMarker_searchBox(place);
      // extend bounds object
      self.bounds.extend(marker.position);

      // push objects into markersAndPlaces Array
      self.markersAndPlaces.push({
        marker: marker,
        place: place,
        visible: ko.observable(true),
        foursquareInfo: ko.observable(false),
        googleInfo: ko.observable(false)
      });

      // add event listener to show info window
      // when marker is clicked on
      marker.addListener("click", function() {
        console.log("the marker was clicked");
        self.currentWindowPosition(marker.position);
        self.populateInfoWindow(this);
      });

      // add event when hovered over marker
      marker.addListener("mouseover", function() {
        this.setIcon(model.hover_icon());
      });

      // add event when no longer hoevered
      marker.addListener("mouseout", function() {
        this.setIcon(model.default_icon());
      });
    });

    // fit the map to the current self.bounds
    map.fitBounds(self.bounds);
    // clear the bounds object for future use
    self.bounds = new google.maps.LatLngBounds();
  });
  // create Marker object from PlaceResult returned from searchBox function
  // ... returns a Marker object...
  this.createMarker_searchBox = function(object) {
    var marker = new google.maps.Marker({
      position: object.geometry.location,
      title: object.name,
      map: map,
      animation: google.maps.Animation.DROP,
      icon: model.default_icon()
    });
    return marker;
  };

  
  
  
  /* These functions and objects are involved with 
   * the use of google's drawingManager object...
   */ 
  
  // intiliaze a polygon variable so only one can exist
  this.polygon = null;
  // initiliaze the drawing manager
  this.drawingManager = new google.maps.drawing.DrawingManager();
  // set its options
  this.drawingManager.setOptions({
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_LEFT,
      drawingModes: ["circle", "polygon", "rectangle"]
    }
  });
  // set the drawing manager to the map
  this.drawingManager.setMap(map);
  // function the toggle the drawing manager
  this.toggleDrawingManager = function() {
    if (self.drawingManager.map) {
      self.drawingManager.setMap(null);
      if (self.polygon) {
        self.polygon.setMap(null);
      }
    } else {
      self.drawingManager.setMap(map);
    }
  };
  // function to execute once overlay is complete
  this.drawingManager.addListener("overlaycomplete", function(event) {
    // erase an existing polygon if one exists
    if (self.polygon) {
      self.polygon.setMap(null);
    }
    // close the drawing manager after an overlay is complete
    self.drawingManager.setDrawingMode(null);
    // update the self.polygon vaariable to the event overlay
    self.polygon = event.overlay;
    // enable editing for the polygon
    self.polygon.setEditable(true);
    
    /* depending on the shape used, 
     * call the corresponding searchWithin
     * function and create listeners for when edited */
    
    // if polygon:
    if (self.polygon instanceof google.maps.Polygon) {
      console.log("this is a Polygon shape");
      self.searchWithinPolygon();
      self.polygon.getPath().addListener("set_at", self.searchWithinPolygon);
      self.polygon.getPath().addListener("insert_at", self.searchWithinPolygon);
    }
    // if Circle
    if (self.polygon instanceof google.maps.Circle) {
      console.log("this is a Circle shape");
      self.searchWithinCirlce();
      self.polygon.addListener("radius_changed", self.searchWithinCirlce);
      self.polygon.addListener("center_changed", self.searchWithinCirlce);
    }
    // if rectangle
    if (self.polygon instanceof google.maps.Rectangle) {
      console.log("this is a Rectangle shape");
      self.searchWithinRectangle();
      self.polygon.addListener("bounds_changed", self.searchWithinRectangle);
    }
    // then sort the array by visibility
    self.sortMarkersArray();
    // close the current info window for clarity
    self.infoWindow.close();
    // set the self.infoWindow marker to null
    self.infoWindow.marker = null;
  });
  // search within shape functions, for each shape
  this.searchWithinCirlce = function() {
    self.markersAndPlaces().forEach(function(object) {
      if (!self.polygon.getBounds().contains(object.marker.position)) {
        object.marker.setVisible(false);
        object.visible(false);
        object.foursquareInfo(false);
        object.googleInfo(false);
      } else {
        object.marker.setVisible(true);
        object.visible(true);
      }
      // close the current info window
      self.infoWindow.close();
      // close the current info window
      self.infoWindow.marker = null;
    });
    // sory the array by visibility
    self.sortMarkersArray();
  };
  this.searchWithinPolygon = function() {
    self.markersAndPlaces().forEach(function(object) {
      if (self.polygon instanceof google.maps.Polygon) {
        if (
          !google.maps.geometry.poly.containsLocation(
            object.marker.position,
            self.polygon
          )
        ) {
          object.marker.setVisible(false);
          object.visible(false);
          object.foursquareInfo(false);
          object.googleInfo(false);
        } else {
          object.marker.setVisible(true);
          object.visible(true);
        }
        // close the current info window
        self.infoWindow.close();
        // close the current info window
        self.infoWindow.marker = null;
      }
    });
    // sory the array by visibility
    self.sortMarkersArray();
  };
  this.searchWithinRectangle = function() {
    self.markersAndPlaces().forEach(function(object) {
      if (!self.polygon.getBounds().contains(object.marker.position)) {
        object.marker.setVisible(false);
        object.visible(false);
        object.foursquareInfo(false);
        object.googleInfo(false);
      } else {
        object.marker.setVisible(true);
        object.visible(true);
      }
      // close the current info window
      self.infoWindow.close();
      // close the current info window
      self.infoWindow.marker = null;
    });
    // sory the array by visibility
    self.sortMarkersArray();
  };

  
  
  
  /* These functions and objects are involved 
   * with toggling the information dv's within the aside
   */ 
  
  // turns the googleInfo attribute off for all
  // objects within the markersAndPlaces observable array
  this.toggleAllGoogleInfos = function() {
    self.markersAndPlaces().forEach(function(object) {
      object.googleInfo(false);
    });
  };
  // toggles the google information window within the aside
  // also toggles all others off
  this.toggleThisGoogleInfoWindow = function(object) {
    // if the current objects googleInfo attr is true:
    if (object.googleInfo()) {
      //toggle all infos off
      self.toggleAllGoogleInfos();
    } else {
      //toggle all other google infos off
      self.toggleAllGoogleInfos();
      object.googleInfo(true);
    }
    
  };
  // turns the foursquareInfo attribute off for all
  // objects within the markersAndPlaces observable array
  this.toggleFourSquareOff_All = function() {
    self.markersAndPlaces().forEach(function(object) {
      object.foursquareInfo(false);
    });
  };
  // toggles the FourSquare information window within the aside
  // also toggles all others off
  this.toggleThisFourSquareInfo = function(object) {
    // clear observables
    self.currentFourSquareVenue(null);
    self.currentFourSquareHours.removeAll();
    self.currentFourSquareName(null);
    self.currentFourSquareRating(null);

    // if the current objects info is true
    if (object.foursquareInfo()) {
      self.toggleFourSquareOff_All();
      console.log("Window was already open");

      // else, if the current object info is false
    } else {
      self.FSgetPlace(object);
      self.toggleFourSquareOff_All();
      object.foursquareInfo(true);
      console.log(object.foursquareInfo());
    }
  };
  // toggles both the google places information div
  // and the foursquare information div
  this.toggleInformationWindows = function(object) {
    self.toggleThisGoogleInfoWindow(object);
    self.toggleThisFourSquareInfo(object);
    if (object.visible() && object.googleInfo() && object.foursquareInfo()) {
      self.populateInfoWindow(object.marker);
    } else {
      self.infoWindow.close();
    }
  };

  
  
  
  /* These functions and objects are involved 
   * with the use of FourSquare's API
   */ 

  // observables to store the FourSquare information within
  this.currentFourSquareVenue = ko.observable();
  this.currentFourSquareHours = ko.observableArray();
  this.currentFourSquareName = ko.observable();
  this.currentFourSquareRating = ko.observable();
  // send a foursquare search request
  // pass in a place result from the searchBox object
  // returns the foursquare_id for the resulting restaurant
  this.FSgetPlaceID = function(object) {
    // create location variable to store lat, lng coords
    // of place
    var location =
      object.place.geometry.location.lat() +
      "," +
      object.place.geometry.location.lng();
    // create url variable to get passed into ajax request
    var url =
      "https://api.foursquare.com/v2/venues/search?" +
      "client_id=" +
      model.foursquare_id +
      "&client_secret=" +
      model.foursquare_secret +
      "&v=" +
      model.foursquare_version +
      "&ll=" +
      location +
      "&intent=match" +
      "&query=" +
      object.marker.title +
      "&limit=1";

    var result = $.ajax({
      url: url,
      async: false,
      dataType: "json"
    }).responseJSON;
    // print the resulting foursquare ID
    // (mostly for debugging purposes)
    // return the ID value
    return result.response.venues[0].id;
  };
  // get place details from foursquare
  // using a place's ID
  this.FSgetPlaceDetails = function(id) {
    // create api url with id passed in
    var url =
      "https://api.foursquare.com/v2/venues/" +
      id +
      "?" +
      "client_id=" +
      model.foursquare_id +
      "&client_secret=" +
      model.foursquare_secret +
      "&v=" +
      model.foursquare_version;

    // perform ajax request and pass response into variable
    var result = $.ajax({
      url: url,
      async: false,
      dataType: "json"
    }).responseJSON;

    var hours = result.response.venue.hours.timeframes;
    var name = result.response.venue.name;
    var rating = result.response.venue.rating;

    // store result within observable
    self.currentFourSquareVenue(result);
    self.currentFourSquareName(name);
    self.currentFourSquareRating(rating);

    for (var i = 0; i < hours.length; i++) {
      var days = hours[i].days;
      var time = hours[i].open[0].renderedTime;
      self.currentFourSquareHours.push({
        days: days,
        time: time
      });
      // console.log(days, time);
    }
  };
  // function that calls the FSgetPlaceID and then the
  // FSgetPlaceDetails together
  this.FSgetPlace = function(object) {
    // retrieve id# from foursquare venue search
    var id = self.FSgetPlaceID(object);
    // call FSgetPlaceDetails after passing in the venue id
    self.FSgetPlaceDetails(id);
  };

};


function initMap() {
  var init = new ViewModel();
  ko.applyBindings(init);
  init.dropDefaultMarkers();
}