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

function mapMarker(location) {
    this.location = location;
}

function createListener(counter, markerList) {
    var index = counter.GetValue();
    google.maps.event.addListener(markerList[index], 'click',
        function() {
            if (markerList[index].visible) {
                counter.SetValue(index + 1);
                markerList[index].setMap(null);
                markerList[index].setVisible(false);
                markerList[index + 1].setVisible(true);
                createListener(counter, markerList);
            }
            else {
                alert("went to else branch");
            }
        });
}

pathMap.prototype.addAddress = function(address) {
    var locCount = new Counter(0);
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
            //associate each location with its distance from the origin
            var distLocs = _.map(results, function(endLoc) {
                                                return {
                                                    geo: endLoc,
                                                    distance: calculateDistance(originLoc, endLoc)
                                                };
                                            });

            var sortedDist = _.sortBy(distLocs, function(loc) { return loc.distance; });

            var currMarkers = _.map(sortedDist, function(loc) {
                                                    return new mapMarker(loc.geo.geometry.location);
                                                });


            // console.log(sortedDist[locCount.GetValue]);
            // var location = sortedDist[locCount.GetValue()].geo.geometry.location;



            self.markers.push(
                            {
                                'location' : geoOptions.address,
                                'currMarkers' : currMarkers
                            });


            // var currObj = _.find(self.markers, function(loc){ return loc.location === address; });
            // console.log(currObj);
            var markerObjs = _.map(currMarkers, function (marker) {
                                                    return (new google.maps.Marker({
                                                                map : map,
                                                                position : marker.location,
                                                                visible : false
                                                            }));
                                                 });

            _.each(self.markers, function (results) {
                bounds.extend(results.currMarkers[locCount.GetValue()].location);
            });

            if (self.markers.length != 1) {
                map.fitBounds(bounds);
            }

            markerObjs[0].setVisible(true);
            createListener(locCount, markerObjs);


        }
        else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
};

var p = new pathMap(originLoc);
// p.addAddress("CVS");
p.addAddress("Target");
    // var address = $(this).children()[0].value;
