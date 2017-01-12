module.exports = Coordinates;

function Coordinates() {
    //this.clearAll();
}

var latitude;
var longitude;


Coordinates.prototype = {

    getLatitude: function () {
        return this.latitude;
    },
    setLatitude: function(lat) {
        this.latitude = lat;
    },
    getLongitude: function() {
        return this.longitude;
    },
    setLongitude: function(long) {
        this.longitude = long;
    }
}