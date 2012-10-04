var originLoc = new google.maps.LatLng(40.445563, -79.942387);

var mapOptions = {
  center: originLoc,
  zoom: 16,
  mapTypeId: google.maps.MapTypeId.ROADMAP
};

var markerList = [];
var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
var geocoder = new google.maps.Geocoder();

//  Create a new viewpoint bound
var bounds = new google.maps.LatLngBounds();

$("#user-location-form").submit(function (e) {
	e.preventDefault();

	var address = $(this).children()[0].value;
	var geoOptions = {
		"address": address,
		"location": originLoc
	}

	geocoder.geocode( geoOptions, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			var location = results[0].geometry.location;
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