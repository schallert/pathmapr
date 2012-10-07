$("#dest-group").hide();

$("#origin-input").focusin(function () {
	$("#dest-group").fadeIn("slow");
});

// $("#origin-input").focusout(function () {
// 	var address = $(this).val();
// 	var geocoder = new google.maps.Geocoder();
// 	geocoder.geocode({ "address": address }, function (results, status) {
// 		if (status == google.maps.GeocoderStatus.OK) {
//         doItAll(results[0].geometry.location);
//       } else {
//         alert("Geocode was not successful for the following reason: " + status);
//       }
// 	});
// });