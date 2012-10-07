/*
 * Group members: Dima Ivanyuk (divanyuk), Matt Schallert (mschalle)
 */

// function doItAll (shiz) {
    //var originLoc = new google.maps.LatLng(38.237792, -85.572555); //Louisville,KY
var originLoc = new google.maps.LatLng(40.443504,-79.941571); //CMU

var destInputForm = new DestForm();
destInputForm.appendNew();

var submitButton = $("#submit-input");

submitButton.click(function (e) {
    e.preventDefault();
});


var mapOptions = {
  center: originLoc,
  zoom: 16,
  mapTypeId: google.maps.MapTypeId.ROADMAP
};

var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
var geocoder = new google.maps.Geocoder();
var service = new google.maps.places.PlacesService(map);
var directions = new google.maps.DirectionsService();

var renderOptions = {
    map : map,
    suppressMarkers : true
};

var renderer = new google.maps.DirectionsRenderer(renderOptions);

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
        map.fitBounds(bounds);
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
                pathMap.prototype.makeDirections(thiss, "DRIVING", window.originLoc, window.originLoc);              
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

    service.textSearch(placesRequest, function(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            var distLocs = _.map(results, function(endLoc) {
                return {
                    geo: endLoc,
                    distance: calculateDistance(originLoc, endLoc)
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
                        map : map,
                        position : marker.location,
                        visible : false,
                        title : geoOptions.address
                    }),
                    distance : marker.dist
                };
            });

            //add all the markers for the current address (string text)

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
            divList.append($("<a/>", { text: "+", class: "marker-expand" } ));
            subDiv = $("<div/>");
            var resultList = _.first(markerObjs, 3)
            for (var i = 0; i < resultList.length; i ++) {
                var obj = resultList[i];
                var markerElem = $("<p/>", { text: "Option " + (i + 1), class: "marker-list" });
                markerElem.click(function (e) {
                    _.each(markerObjs, function (o) { o.marker.setVisible(false) });
                    obj.marker.setVisible(true);
                });
                subDiv.append(markerElem);
            }
            divList.append(subDiv);
            divList.collapse({
                open: function() {
                    this.slideDown(100);
                },
                close: function() {
                    this.slideUp(100);
                },
            });

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
        wayPts.push(
        {
            location : current,
            stopover : true
        });
    });
    return wayPts;
};

//waypoints should include origin (1st) and end destination (last)
pathMap.prototype.makeDirections = function(thiss, travelBy, start, dest) {
    //still need to add markers for the start and end points
    //they are currently custom markers
    var waypoints = pathMap.prototype.getWaypoints(thiss.markers);
    var dirRequest = {
        destination : dest,
        optimizeWaypoints : true,
        origin : start,
        travelMode : travelBy,
        waypoints : waypoints
    };

    var startMarker = new google.maps.Marker({
                            map : window.map,
                            position : start,
                            icon : 'images/home.png',
                            visible : true
                        });

    if (start !== dest) {
        var endMarker = new google.maps.Marker({
                             map : window.map,
                             position : dest,
                             icon : 'images/blue-dot.png',
                             visible : true
        });
    }

    var self = thiss;

    directions.route(dirRequest, function(results, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            renderer.setDirections(results);
        }
        else {
            alert("directions not successful for the following reason: " + status);
        }
    });

};


var p = new pathMap(originLoc);

$("#submit-input").click(function (e) {
    e.preventDefault();
    p.makeDirections(p, "DRIVING", originLoc, originLoc);
});
// }