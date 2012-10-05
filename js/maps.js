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
/*function toRad(num) {
    return num * Math.PI / 180;
}*/

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
    var R = 3959 // miles
    var dLat = (lat2-lat1).toRad();
    var dLon = (lon2-lon1).toRad();
    var rLat1 = lat1.toRad();
    var rLat2 = lat2.toRad();

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(rLat1) * Math.cos(rLat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

$("#user-location-form").submit(function (e) {
    e.preventDefault();

    var address = $(this).children()[0].value;
    var geoOptions = {
        "address": address,
        "location": originLoc
    };

    var placesRequest = {
        location : originLoc,
        radius : '500',
        query : address
    };

    geocoder.geocode( geoOptions, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            //associate each location with its distance from the origin
            var distLocs = _.map(results, function(loc2) {
                                                return {
                                                    geo: loc2,
                                                    distance: calculateDistance(originLoc, loc2)};
                                                });

            var sortedDist = _.sortBy(distLocs, function(loc) { return loc.distance; });
            console.log(sortedDist);

            var location = sortedDist[0].geo.geometry.location;
            markerList.push(location);
            var marker = new google.maps.Marker({
                map: map,
                position: location
            });
            _.each(markerList, function (location) {
                bounds.extend(location);
            });
            if (markerList.length != 1) {
                map.fitBounds(bounds);
            }
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
});