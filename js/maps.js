var originLoc = new google.maps.LatLng(40.445563, -79.942387);

var mapOptions = {
  center: originLoc,
  zoom: 16,
  mapTypeId: google.maps.MapTypeId.ROADMAP
};

var markerList = [];
var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
var geocoder = new google.maps.Geocoder();
var service = new google.maps.places.PlacesService(map);

//  Create a new viewpoint bound
var bounds = new google.maps.LatLngBounds();

/* script using harvesine formula to calculate
    the greatest circle distance bt two points */

Number.prototype.toRad = function() {
    return this * Math.PI / 180;
};

function calculateDistance(start, end) {
    var lat1 = start.lat();
    var lon1 = start.lng();
    var endLoc = end.geometry.location;
    var lat2 = endLoc.lat();
    var lon2 = endLoc.lng();

    // var R = 6371; // km
    var R = 3959; // miles
    var dLat = (lat2-lat1).toRad();
    var dLon = (lon2-lon1).toRad();
    var rLat1 = lat1.toRad();
    var rLat2 = lat2.toRad();

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(rLat1) * Math.cos(rLat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

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
    this.markers = [];
    this.origin = origin;
}

function mapMarker(location, dist) {
    this.location = location;
    this.dist = dist;
}

function findNextMarker(currentDist, counter, markerObjs) {
    var index = counter.GetValue();
    var nextMarker = markerObjs[index];

    if ((typeof nextMarker) === "undefined") {
        alert("no more locations");
        return;
    }
    if (nextMarker.distance - currentDist <= 0.2) { //next marker is too close
        counter.SetValue(counter.GetValue() + 1);
        findNextMarker(currentDist, counter, markerObjs);
    }
    else{
        return;
    }
}

function createListener(counter, markerObjs) {
    var index = counter.GetValue();
    google.maps.event.addListener(markerObjs[index].marker, 'click',
        function() {
            if (typeof markerObjs[index] === "undefined") {
                alert("no more locations; tried to create listener");
                return;
            }
            if (markerObjs[index].marker.visible) {
                counter.SetValue(index + 1);
                findNextMarker(markerObjs[index].distance, counter, markerObjs);
                markerObjs[index].marker.setMap(null);
                markerObjs[index].marker.setVisible(false);
                markerObjs[counter.GetValue()].marker.setVisible(true);
                createListener(counter, markerObjs);
            }
            else {
                alert("went to else branch");
            }
            return;
        });
}

pathMap.prototype.addAddress = function(address) {

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

            var sortedDist = _.sortBy(distLocs, function(loc) { return loc.distance; });

            var justDist = _.map(sortedDist, function(loc) {return loc.distance;});


            var currMarkers = _.map(sortedDist, function(loc) {
                                                    return new mapMarker(loc.geo.geometry.location, loc.distance);
                                                });



            self.markers.push(
                            {
                                'location' : geoOptions.address,
                                'currMarkers' : currMarkers
                            });

            var markerObjs = _.map(currMarkers, function (marker) {
                                                    return {
                                                        marker : new google.maps.Marker({
                                                                    map : map,
                                                                    position : marker.location,
                                                                    visible : false
                                                                    }),
                                                        distance : marker.dist
                                                    };
                                                });



            var locCount = new Counter(0);

            _.each(self.markers, function (results) {
                bounds.extend(results.currMarkers[locCount.GetValue()].location); //need to move to createListener
            });

            if (self.markers.length != 1) {
                map.fitBounds(bounds);
            }


            markerObjs[0].marker.setVisible(true);
            createListener(locCount, markerObjs);


        }
        else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
};

var p = new pathMap(originLoc);
p.addAddress("CVS");
// p.addAddress("Walmart");
    // var address = $(this).children()[0].value;
