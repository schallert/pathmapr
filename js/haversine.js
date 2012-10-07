/*
 * Group members: Dima Ivanyuk (divanyuk), Matt Schallert (mschalle)
 */

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