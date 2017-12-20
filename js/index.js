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

    self.clearMarkersAndPlaces();

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

          var object = {
            marker: marker,
            place: place,
            // initialize visible to true so the marker appears
            visible: ko.observable(true),
            // initialize to false so the fs info window does not appear
            foursquareInfo: ko.observable(false),
            // initialize to false to the google info window does not appear
            googleInfo: ko.observable(false)
          };
          
          self.markersAndPlaces.push(object);

          // add event listener to show info window
          // when marker is clicked on
          object.marker.addListener("click", function() {
            self.currentWindowPosition(marker.position);
            self.populateInfoWindow(this);
            self.toggleInformationWindows(object);
          });

          // add event when hovered over marker
          object.marker.addListener("mouseover", function() {
            this.setIcon(model.hover_icon());
          });

          // add event when no longer hoevered
          object.marker.addListener("mouseout", function() {
            this.setIcon(model.default_icon());
          });

          // extend the bounds for the current marker position
          self.bounds.extend(marker.position);

          // fit map to current bounds
          map.fitBounds(self.bounds);
          
        } else {
          
          alert("getDetails method status NOT OK");
          
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
  this.allMarkerAnimationNull = function() {
    self.markersAndPlaces().forEach(function(object) {
      object.marker.setAnimation(null);
    });
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
  this.toggleAllMarkersVisible = function() {
    self.markersAndPlaces().forEach(function(object){
      object.visible(true);
      object.marker.setVisible(true);
    });
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
    self.toggleAllGoogleInfos();
    self.toggleFourSquareOff_All();
    self.allMarkerAnimationNull();
  });
  // function to populate an info window
  this.populateInfoWindow = function(marker) {
    
    if (marker.getVisible()) {
      
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
      
      self.infoWindow.close();
      
    }
  };
  
  
  
  
  /* The following functions and objects are 
   * involved with the Autcomplete object created 
   */
  
  // init function for the filter address autocomplete
  this.initFilterAutoComplete = function(element) {
    self.filterAutoComplete = new google.maps.places.Autocomplete(element);
    self.filterAutoComplete.addListener('place_changed', self.filterSearchResults );
    self.filterAutoComplete.bindTo('bounds', map);
    console.log("Filter Autocomplete object created");
  }
  // function to filter markersAndPlaces array
  this.filterSearchResults = function() {
    console.log("Calling filter function");
    // create new GeoCoder object
    var geocoder = new google.maps.Geocoder();
    // geocode the filter text input to retrieve place information
    geocoder.geocode({ address: self.filterInputText() }, function(results, status) {
      // if status = OK
      if (status == google.maps.GeocoderStatus.OK) {
        console.log("Status OK");
        // clear all info windows
        self.toggleFourSquareOff_All();
        self.toggleAllGoogleInfos();
        // close the current infoWindow (if it is open)
        self.infoWindow.close();
        // make all locations and markers visible
        self.toggleAllMarkersVisible();
        // store the latlng object of filter location within initLocation
        var initLocation = results[0].geometry.location;
        // iterate through markersAndPlaces
        self.markersAndPlaces().forEach(function(object) {
          // store the current objects latlng object within variable currLocation
          var currLocation = object.marker.position;
          // store the distance between the two locations in variable distance
          // (in meters)
          var distance = google.maps.geometry.spherical.computeDistanceBetween(initLocation, currLocation);
          if (distance > self.selectedDistanceMeters() ) {
            object.visible(false);
            object.marker.setVisible(false);
            
          }
          
        });
        
        self.sortMarkersArray();
        
        
        
      } else {
        console.log(
          "Could not find specified address\n" +
            "Try clicking on one of the autocomplete suggestions!"
        );
      }
    });
  }
  // observable to link the value of the filter AutoComplete text input
  this.filterInputText = ko.observable("");
  // observable for the filter miles distance slider
  this.selectedDistanceMiles = ko.observable(10);
  // ko computed variable to covert miles to meters
  this.selectedDistanceMeters = ko.computed(function() {
    return self.selectedDistanceMiles() * 1609.34;
  });
  
  // function to initialize the autocomplete object
  this.initAutoComplete = function(element) {
    self.neighborhoodAutoComplete = new google.maps.places.Autocomplete(element);
    self.neighborhoodAutoComplete.addListener('place_changed', self.zoomToNeighborhood);
    console.log("Autocomplete object created");
  }
  // function which executes sorrounding the
  // neighborhood form section in the aside
  this.zoomToNeighborhood = function() {
    var geocoder = new google.maps.Geocoder();
    var address = self.neighborhoodInputText();
    geocoder.geocode({ address: address }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
      } else {
        alert(
          "Could not find specified address\n" +
            "Try clicking on one of the autocomplete suggestions!"
        );
      }
    });
  
  };
  // ko observable for the Neighborhood inputText binding
  this.neighborhoodInputText = ko.observable("");
  
  
  
  
  /* The following functions and objects are 
   * involved with the SearchBox object created 
   */
  
  
  // function to initialize the SearchBox object
  this.initSearchBox = function(element) {
   self.searchBox = new google.maps.places.SearchBox(element, {
      bounds: self.currentBounds()
    });
   self.searchBox.addListener("places_changed", function() {
    // retrieve places from searchBox object getPlaces() method
    var places = self.searchBox.getPlaces();
    // if no place was returned alert user
    if (places.length === 0) {
      alert(
        "No places found\nTry selecting an option from the suggested items"
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

      var object = {
        marker: marker,
        place: place,
        visible: ko.observable(true),
        foursquareInfo: ko.observable(false),
        googleInfo: ko.observable(false)
      };
      // push objects into markersAndPlaces Array
      self.markersAndPlaces.push(object);

      // add event listener to show info window
      // when marker is clicked on
      object.marker.addListener("click", function() {
        self.currentWindowPosition(marker.position);
        self.populateInfoWindow(this);
        self.toggleInformationWindows(object);
      });

      // add event when hovered over marker
      object.marker.addListener("mouseover", function() {
        this.setIcon(model.hover_icon());
      });

      // add event when no longer hoevered
      object.marker.addListener("mouseout", function() {
        this.setIcon(model.default_icon());
      });
    });

    // fit the map to the current self.bounds
    map.fitBounds(self.bounds);
    // clear the bounds object for future use
    self.bounds = new google.maps.LatLngBounds();
      
  });
    
    console.log("SearchBox object created");
    
  };
  
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
      self.searchWithinPolygon();
      self.polygon.getPath().addListener("set_at", self.searchWithinPolygon);
      self.polygon.getPath().addListener("insert_at", self.searchWithinPolygon);
    }
    // if Circle
    if (self.polygon instanceof google.maps.Circle) {
      self.searchWithinCirlce();
      self.polygon.addListener("radius_changed", self.searchWithinCirlce);
      self.polygon.addListener("center_changed", self.searchWithinCirlce);
    }
    // if rectangle
    if (self.polygon instanceof google.maps.Rectangle) {
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
    self.clearFSInfo();

    // if the current objects info is true
    if (object.foursquareInfo()) {
      self.toggleFourSquareOff_All();

      // else, if the current object info is false
    } else {
      self.FSgetPlace(object);
      self.toggleFourSquareOff_All();
      object.foursquareInfo(true);
    }
  };
  // toggles both the google places information div
  // and the foursquare information div
  this.toggleInformationWindows = function(object) {
    self.allMarkerAnimationNull();
    self.toggleThisGoogleInfoWindow(object);
    self.toggleThisFourSquareInfo(object);
    if (object.visible() && object.googleInfo() && object.foursquareInfo()) {
      self.populateInfoWindow(object.marker);
      object.marker.setAnimation(google.maps.Animation.BOUNCE);
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
    var location = object.place.geometry.location.lat() + "," +
        object.place.geometry.location.lng();
    // create url variable to get passed into ajax request
    var url = ("https://api.foursquare.com/v2/venues/search?" +
               "client_id=" + model.foursquare_id + 
               "&client_secret=" + model.foursquare_secret +
               "&v=" + model.foursquare_version + "&ll=" + location +
               "&intent=match" +
               "&query=" + object.marker.title +
               "&limit=1");

    $.ajax({
      type: "GET",
      url: url,
      cache: false,
      dataType: "json",
      success: function(data) {
        // capture the ID of the first venue
        var id = data.response.venues[0].id;
        // call the getPlaceDetails function with id
        self.FSgetPlaceDetails(id);
      },
      error: function(data) {
        console.log("Foursquare API query failed to return places for coordinates, and query: ", location, object.marker.title);
        alert("Foursquare API query failed to return places for:\nCoordinates: "+location+"\nand Query: "+ object.marker.title);
      }
    });
    
  };
  // get place details from foursquare
  // using a place's ID
  this.FSgetPlaceDetails = function(id) {
    // create api url with id passed in
    var url = ( "https://api.foursquare.com/v2/venues/" + id + "?" +
               "client_id=" + model.foursquare_id + 
               "&client_secret=" + model.foursquare_secret +
               "&v=" + model.foursquare_version);
    
    // perform ajax request and pass response into variable
    $.ajax({
      type: "GET",
      url: url,
      cache: false,
      dataType: "json",
      success: function(data) {
        var result = data;
        // store venue object (for easy access)
        var venue = result.response.venue;
      
        // check if the venue object contains the
        // 'hours' property
        if (venue.hasOwnProperty('hours')) {
        
          // log that the foursquare place indeed has an 'hours' property
          console.log("Object contains 'hours' property");
        
          // store the 'hours' array in variable for easy access
          var hours = venue.hours.timeframes;
        
          // iterate through hours array and push into the
          // currentFourSquareHours observableArray
          for (var i = 0; i < hours.length; i++) {
            var days = hours[i].days;
            var time = hours[i].open[0].renderedTime;
            self.currentFourSquareHours.push({
              days: days,
              time: time
            });
          }
        } 
        else {
          console.log("Object does not contain 'hours' property");
        }
        
        var name = result.response.venue.name;
        var rating = result.response.venue.rating;

        // store result within observable
        self.currentFourSquareVenue(result);
        self.currentFourSquareName(name);
        self.currentFourSquareRating(rating);   
      },
      error: function(data) {
        console.log("Foursquare API call failed to find details for place, given VENUE_ID: ", id);
        alert("Foursquare API call failed to find details for VENUE_ID: "+id); 
      } 
    });
    
  };
  // function that calls the FSgetPlaceID and then the
  // FSgetPlaceDetails together
  this.FSgetPlace = function(object) {
    // retrieve id# from foursquare venue search
    self.FSgetPlaceID(object);
  };
  // clears currentFourSquare observables
  this.clearFSInfo = function() {
    self.currentFourSquareVenue(null);
    self.currentFourSquareHours.removeAll();
    self.currentFourSquareName(null);
    self.currentFourSquareRating(null);
  }

};


initMap = () => {
  var init = new ViewModel();
  ko.applyBindings(init);
  init.dropDefaultMarkers();
  
}

mapError = () => {
  console.log("Call to google maps API failed :( ");
  alert("Call to google maps API failed.\n\nPlease try reloading the page.\n\nCheck the API call src url if problem persists.");
}
