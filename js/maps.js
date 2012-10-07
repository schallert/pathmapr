//var originLoc = new google.maps.LatLng(38.237792, -85.572555); //Louisville,KY
var originLoc = new google.maps.LatLng(40.443504,-79.941571); //CMU


var mapOptions = {
  center: window.originLoc,
  zoom: 16,
  mapTypeId: google.maps.MapTypeId.ROADMAP
};

var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
var geocoder = new google.maps.Geocoder();
var service = new google.maps.places.PlacesService(map);
var directions = new google.maps.DirectionsService();

var renderOptions = {
    map : window.map,
    suppressMarkers : true
};

var renderer = new google.maps.DirectionsRenderer(window.renderOptions);

//  Create a new viewpoint bound
var bounds = new google.maps.LatLngBounds();

// counter used to move through arrays of objects
function Counter(initial) {
    this.val = initial;

    this.GetValue = function() {
        return this.val;
    };

    this.SetValue = function(value) {
        this.val = value;
    };
}

function pathMap(origin) {
    this.origin = origin;
    this.markers = [];
}

function mapMarker(location, dist) {
    this.location = location;
    this.dist = dist;
}

function wayPoint(location, stopover) {
    this.location = location;
    this.stopover = stopover || true;
}
    
/* used as a subroutine in createListener, it finds the next closest marker that is
    not consider the same store */
pathMap.prototype.findNextMarker = function(currentDist, counter, markerObjs) {
    var index = counter.GetValue();
    var nextMarker = markerObjs[index];

    if ((typeof nextMarker) === "undefined") {
        alert("no more locations");
        return;
    }
    if (nextMarker.distance - currentDist <= 0.2) { //next marker is too close
        counter.SetValue(counter.GetValue() + 1);
        pathMap.prototype.findNextMarker(currentDist, counter, markerObjs);
    }
    else{
        return;
    }
};

// recursively create a new listener each time that the previous one is clicked/activated
pathMap.prototype.createListener = function(thiss, counter, markerObjs) {
    _.each(thiss.markers, function (results) {
        var justLocs = _.map(results.currMarkers, function(m) {
                                                        return m.marker.position;
                                                  });
        bounds.extend(justLocs[counter.GetValue()]);
    });

    if (thiss.markers.length !== 0) {
        window.map.fitBounds(bounds);
    }

    var index = counter.GetValue();
    google.maps.event.addListener(markerObjs[index].marker, 'click',
        function() {
            if (typeof markerObjs[index] === "undefined") {
                alert("no more locations; tried to create listener");
                return;
            }
            if (markerObjs[index].marker.visible) {
                counter.SetValue(index + 1);
                pathMap.prototype.findNextMarker(markerObjs[index].distance, counter, markerObjs);
                markerObjs[index].marker.setMap(null);
                markerObjs[index].marker.setVisible(false);
                /* counter is adjusted when calling findnextMarker to the index
                    of the next closest marker based on the spec of findNextMarker */
                markerObjs[counter.GetValue()].marker.setVisible(true);
                pathMap.prototype.createListener(thiss, counter, markerObjs);
            }
            else {
                alert("went to else branch");
            }
            return;
        });
};

pathMap.prototype.addAddress = function(addressIn) {

    var address = addressIn.address;
    var inputEl = addressIn.el;

    var geoOptions = {
        "address": address,
        "location": this.origin
    };

    var placesRequest = {
        location : this.origin,
        radius : '500',
        query : address
    };

    var self = this;

    window.service.textSearch(placesRequest, function(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            var distLocs = _.map(results, function(endLoc) {
                                                return {
                                                    geo: endLoc,
                                                    distance: calculateDistance(window.originLoc, endLoc)
                                                };
                                            });

            //sort the location object by the distance from input location
            var sortedDist = _.sortBy(distLocs, function(loc) { return loc.distance; });

            var justDist = _.map(sortedDist, function(loc) {return loc.distance;});

            //create a marker object based on the previously sorted location array
            var currMarkers = _.map(sortedDist, function(loc) {
                                                    return new mapMarker(loc.geo.geometry.location, loc.distance);
                                                });

            //create google marker objs
            var markerObjs = _.map(currMarkers, function (marker) {
                                                    return {
                                                        marker : new google.maps.Marker({
                                                                    map : window.map,
                                                                    position : marker.location,
                                                                    visible : false
                                                                    }),
                                                        distance : marker.dist
                                                    };
                                                });

            //add all the markers for the current address (string text)

            console.log("current marker list: " + self.markers);

            //create a new counter to move through the current markers
            var locCount = new Counter(0);
            markerObjs[0].marker.setVisible(true);

            self.markers.push(
                            {
                                'location' : geoOptions.address,
                                'currMarkers' : markerObjs
                            });

            // call the base case of a recursive listener markers
            pathMap.prototype.createListener(self, locCount, markerObjs);

            var divList = $("<div/>");
            divList.append($("<p/>", { text: "Results" } ));
            subDiv = $("<div/>");
            _.each(markerObjs, function (obj) {
                var markerElem = $("<p/>", { text: "marker" });
                markerElem.click(function (e) {
                    _.each(markerObjs, function (o) { o.marker.setVisible(false) });
                    obj.marker.setVisible(true);
                });
                subDiv.append(markerElem);
            });
            divList.append(subDiv);
            divList.collapse();

            $(inputEl[0].parentNode).append(divList);


        }
        else {
            alert("Geocode was not successful for the following reason: " + status);
      }
    });
};

pathMap.prototype.getWaypoints = function(locationList) {
    var wayPts = [];
    _.each(locationList, function(loc) {
                            var current = _.find(loc.currMarkers, function(m) {
                                                                      return m.marker.visible;
                                                                  }).marker.position;
                            console.log(current);
                            wayPts.push(
                            {
                                location : current,
                                stopover : true
                            });
                         });
    return wayPts;
};

//waypoints should include origin (1st) and end destination (last)
pathMap.prototype.makeDirections = function(travelBy, start, dest) {
    //still need to add markers for the start and end points
    //they are currently custom markers
    var waypoints = pathMap.prototype.getWaypoints(this.markers);
    console.log("waypoints: " + typeof waypoints);
    var dirRequest = {
        destination : dest,
        optimizeWaypoints : true,
        origin : start,
        travelMode : travelBy,
        waypoints : waypoints
    };

    var self = this;

    window.directions.route(dirRequest, function(results, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            window.renderer.setDirections(results);
        }
        else {
            alert("directions not successful for the following reason: " + status);
        }
    });

};


var p = new pathMap(window.originLoc);
// p.addAddress("CVS");
// p.addAddress("Target");
var endLoc = new google.maps.LatLng(40.446693,-79.948045);
setTimeout(function () {
    p.makeDirections("DRIVING", window.originLoc, window.endLoc);
}, 2000);
// p.addAddress("PNC Park");
// p.addAddress("carnegie Mellon University");
// p.addAddress("Walmart");
    // var address = $(this).children()[0].value;
