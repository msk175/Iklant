var colorArray = ["FF0000","FF00EB","0000FF","00FFFF","00FF22","EEFF00","FFAA00","00B3FF","74902E"];
var google_map;
var currentPositionmarker;
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var flightPath;
//Define a variable with all map points.
var _mapPoints = [];
//Define a DirectionsRenderer variable.
var _directionsRenderer = '';
var earthRadius = 6371;

var markers = [];
var drArr = [];

$(document).ready(function() {
    //var map1 = new google.maps.Map();
    //var center = map1.getCenter();
    // Check to see if this browser supports geolocation.
    if (navigator.geolocation) {

        // This is the location marker that we will be using
        // on the map. Let's store a reference to it here so
        // that it can be updated in several places.
        var locationMarker = null;

        // Get the location of the user's browser using the
        // native geolocation service. When we invoke this method
        // only the first callback is requied. The second
        // callback - the error handler - and the third
        // argument - our configuration options - are optional.
        navigator.geolocation.getCurrentPosition(
            function( position ){

                // Check to see if there is already a location.
                // There is a bug in FireFox where this gets
                // invoked more than once with a cahced result.
                if (locationMarker){
                    return;
                }
                var mapOptions = {
                    center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
                    zoom: 12,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                google_map = new google.maps.Map(document.getElementById("map_canvas_path"),mapOptions);
                _directionsRenderer = new google.maps.DirectionsRenderer({suppressMarkers: true});
                //Set the map for directionsRenderer
                _directionsRenderer.setMap(google_map);

                //Set different options for DirectionsRenderer mehtods.
                //draggable option will used to drag the route.
                _directionsRenderer.setOptions({
                    draggable: false
                });
            },
            function( error ){
                alert("Kindly Allow Application to access your Location")
            },
            {
                //timeout: (5 * 1000),
                //maximumAge: (1000 * 60 * 15),
                enableHighAccuracy: true
            }
        );
    }
});
var collectionInfoObject;
function markDestinationAddress(groupDetails){
    var latLongArray = new Array();
    for(var j=0;j<groupDetails.length;j++){
        var geocoder = new google.maps.Geocoder();
        var addressString =  groupDetails[j].address.replace(/^[,\s]+|[,\s]+$/g, '').replace(/,[,\s]*,/g, ',');
        groupDetails[j].address =  addressString;
        geocoder.geocode({ 'address': groupDetails[j].address}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                latLongArray.push(results[0].geometry.location);
                if(latLongArray.length == groupDetails.length ){
                    collectionInfoObject = new Array();
                    for(var i=0;i<latLongArray.length ;i++) {
                        var collectionInfoObjectTemp = new Object();
                        collectionInfoObjectTemp.position =  latLongArray[i];
                        collectionInfoObjectTemp.groupDetails =  groupDetails[i] ;
                        collectionInfoObject.push(collectionInfoObjectTemp);
                    }
                    storeLatLongArray(collectionInfoObject,latLongArray);
                }
            }
        } );
    }
}

function storeLatLongArray(groupDetails,latLongArray){
    _mapPoints = [];
    var startPositionLatLng = new google.maps.LatLng(groupDetails[0].groupDetails.startLatitude,groupDetails[0].groupDetails.startLongitude) ;
    latLongArray.splice(0, 0, startPositionLatLng);
    _mapPoints[0] = latLongArray[0];
    var distanceArray = new Array();
    var totalLength = latLongArray.length;
    for(var i =0;i<totalLength;i++) {
        var tempDistance = 0;
        for(var j=1;j<latLongArray.length;j++)
        {
            var distance =   calculateDistance(_mapPoints[i], latLongArray[j]) ;
            if(tempDistance>distance)
            {
                var temp =  latLongArray[j];
                _mapPoints[i+1] = latLongArray[j];
                distanceArray[i+1] = distance;
                tempDistance =   distance;
            }
            else
            {
                if(tempDistance ==0 && j == 1)
                {
                    _mapPoints[i+1] = latLongArray[j];
                    distanceArray[i+1] = distance;
                    tempDistance =   distance;
                }
            }
        }
        latLongArray.splice( latLongArray.indexOf( _mapPoints[i+1]), 1 );
    }
    for(var k=0;k<_mapPoints.length ;k++) {
        if(k>0){
            var pos = _mapPoints[k-1];
            if(_mapPoints[k].equals(pos)){
                var newLat = _mapPoints[k].lat() + (Math.random() -.5) / 1500;// * (Math.random() * (max - min) + min);
                var newLng = _mapPoints[k].lng() + (Math.random() -.5) / 1500;// * (Math.random() * (max - min) + min);
                var finalLatLng = new google.maps.LatLng(newLat,newLng);
                for(var l=0;l<groupDetails.length;l++)
                {
                    if(groupDetails[l].position.lat() == _mapPoints[k].lat())
                    {
                        groupDetails[l].position = finalLatLng;
                        _mapPoints[k] = finalLatLng;
                    }
                }
            }
        }
    }
    drawRoutePointsAndWaypoints(_mapPoints,groupDetails,distanceArray);
}


function calculateDistance(posA, posB) {
    var lat = posB.lat()-posA.lat(); // Difference of latitude
    var lon = posB.lng()-posA.lng(); // Difference of longitude

    var disLat = (lat*Math.PI*earthRadius)/180; // Vertical distance
    var disLon = (lon*Math.PI*earthRadius)/180; // Horizontal distance

    var ret = Math.pow(disLat, 2) + Math.pow(disLon, 2);
    return ret = Math.sqrt(ret); // Total distance (calculated by Pythagore: a^2 + b^2 = c^2)

    // Now you have the total distance in the variable ret
}

function getRoutePointsAndWaypoints(Points) {
    if (Points.length <= 10) {
        drawRoutePointsAndWaypoints(Points);
    }
    else {
        var newPoints = new Array();
        var startPoint = Points.length - 10;
        var Legs = Points.length - 10;
        for (var i = startPoint; i < Points.length; i++) {
            newPoints.push(Points[i]);
        }
        drawRoutePointsAndWaypoints(newPoints);
    }
}
function drawRoutePointsAndWaypoints(Points,groupDetails,distanceArray) {
    var _waypoints = new Array();
    for (var j = 0; j < Points.length; j++) {
        var address = Points[j];
        var myLatlng = new google.maps.LatLng(Points[j].lat(),Points[j].lng()) ;
        var groupInfo = getGroupInfo(groupDetails,Points[j]);
        if(j == 0)
        {
            createMarker(google_map,myLatlng," ","","FF00EB","First",j,distanceArray[j]);
        }
        else
        {
            if (address !== "") {
                _waypoints.push({
                    location: address,
                    stopover: true  //stopover is used to show marker on map for waypoints
                });
            }

            createMarker(google_map,myLatlng,groupInfo.clientName,groupInfo,groupInfo.displayLoan ?"EEFF00" : "74902E","Middle",j,distanceArray[j].toFixed(2));
        }
    }
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'address': groupInfo.officeAddress.replace(/^[,\s]+|[,\s]+$/g, '').replace(/,[,\s]*,/g, ',') }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            Points[Points.length - 1] = results[0].geometry.location;
            createMarker(google_map,results[0].geometry.location,"",groupInfo.officeAddress.replace(/^[,\s]+|[,\s]+$/g, '').replace(/,[,\s]*,/g, ','),"FF0000","Last",j,distanceArray[j]);
            drawRoute(Points[0], Points[Points.length - 1], _waypoints);
        }
    });
}

function getGroupInfo(groupDetails,position)
{
     for(var i=0;i<groupDetails.length;i++)
     {
         if(groupDetails[i].position.lat() == position.lat())
         {
             //alert("Inside true");
             return   groupDetails[i].groupDetails;
         }
     }
}
function drawRoute(originAddress, destinationAddress, _waypoints) {
    //Define a request variable for route .
    var _request = '';

    //This is for more then two locatins
    if (_waypoints.length > 0) {

       _request = {
            origin: originAddress,
            destination: destinationAddress,
            waypoints: _waypoints, //an array of waypoints
            optimizeWaypoints: true, //set to true if you want google to determine the shortest route or false to use the order specified.
            travelMode: google.maps.DirectionsTravelMode.DRIVING
        };
    } else {
        //This is for one or two locations. Here noway point is used.
        _request = {
            origin: originAddress,
            destination: destinationAddress,
            travelMode: google.maps.DirectionsTravelMode.DRIVING
        };
    }
    //This will take the request and draw the route and return response and status as output
    directionsService.route(_request, function (_response, _status) {
        if (_status == google.maps.DirectionsStatus.OK) {
            _directionsRenderer.setDirections(_response);
            drArr.push(_directionsRenderer);
        }
    });
}
function onChangeUser() {
    if(typeof timeOut != "undefined") {
        clearTimeout(timeOut);
    }
    getTravellingPath();
}
function getTravellingPath(){
    for(i=0; i < markers.length; i++){
        markers[i].setMap(null);
    }
    _directionsRenderer.setDirections({routes: []});
    if(typeof(flightPath) != 'undefined'){
        flightPath.setMap(null);
    }
     if($("#foname").val() != '0') {
        var data = {};
        data.loanOfficerId = $("#foname").val();
        ajaxVariable = $.ajax({
            beforeSend : function() {
                $.mobile.showPageLoadingMsg();
            },
            complete: function() {
                $.mobile.hidePageLoadingMsg();
            },
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: 'http://'+ajaxcallip+'/mfi/api/1.0/loanRecovery/FSO/travellingPath/ajaxCall',
            success: function(data) {
                if(data.currentLatitide.length == 0){
                    alert("FO Not yet started the day,travelling path will be visible once he started the day.");
                    $.mobile.hidePageLoadingMsg();
                }
                else if(data.loanDetails.length == 0){
                   alert("No Collections for selected FO");
                   $.mobile.hidePageLoadingMsg();
                    if(data.currentLatitide.length>0){
                        var pathArray = new Array();
                        for(i=0;i<data.currentLatitide.length;i++) {
                            pathArray[i] = new google.maps.LatLng(data.currentLatitide[i],data.currentLongitude[i]);
                        }
                        flightPath=new google.maps.Polyline({
                            path:pathArray,
                            strokeColor:"#FF0000",
                            strokeOpacity:0.8,
                            strokeWeight:5,
                            map:google_map
                        });
                        var markerLatLng = new google.maps.LatLng(data.currentLatitide[data.currentLatitide.length-1],data.currentLongitude[data.currentLatitide.length-1]);
                        currentPositionmarker = new google.maps.Marker({
                            position: markerLatLng,
                            icon : '/images/navigator.png',
                            map: google_map
                        });
                        setMarkerText(currentPositionmarker,markerLatLng);
                        google_map.setCenter(markerLatLng);
                        google_map.setZoom(8);
                    }
               }
               else if(data.loanDetails.length > 0){
                    var pathArray = new Array();
                    for(i=0;i<data.currentLatitide.length;i++) {
                        pathArray[i] = new google.maps.LatLng(data.currentLatitide[i],data.currentLongitude[i]);
                    }
                    flightPath=new google.maps.Polyline({
                        path:pathArray,
                        strokeColor:"#FF0000",
                        strokeOpacity:0.8,
                        strokeWeight:5,
                        map:google_map
                    });
                    var markerLatLng = new google.maps.LatLng(data.currentLatitide[data.currentLatitide.length-1],data.currentLongitude[data.currentLatitide.length-1]);
                    currentPositionmarker = new google.maps.Marker({
                        position: markerLatLng,
                        icon : '/images/navigator.png',
                        map: google_map
                    });
                    setMarkerText(currentPositionmarker,markerLatLng);
                    $.mobile.hidePageLoadingMsg();
                    markDestinationAddress(data.loanDetails) ;
                    google_map.setCenter(markerLatLng);
                    google_map.setZoom(8);
                }

               //$.mobile.hidePageLoadingMsg();
            },
            complete: function() {
                timeOut = window.setTimeout(getCurrentPosition, 1000 * 100);
            }
        });
    }

     else {
          alert("Select Field Officer to view travelling path");
    }


}
function getCurrentPosition(){
    deleteMarker();
    if($("#foname").val() != '0') {
        var data = {};
        data.loanOfficerId = $("#foname").val();
        ajaxVariable = $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: 'http://'+ajaxcallip+'/mfi/api/1.0/loanRecovery/FSO/travellingPath/getCurrentPosition',
            success: function(data) {
                if(data.currentLatitide.length > 0){
                    var markerLatLng = new google.maps.LatLng(data.currentLatitide[data.currentLatitide.length-1],data.currentLongitude[data.currentLatitide.length-1]);
                    currentPositionmarker = new google.maps.Marker({
                        position: markerLatLng,
                        icon : '/images/navigator.png',
                        map: google_map
                    });

                    setMarkerText(currentPositionmarker,markerLatLng);
                    $.mobile.hidePageLoadingMsg();

                }
            },
            complete: function() {
                timeOut = window.setTimeout(getCurrentPosition, 1000 *100);
            }
        });
    } else {
        alert("Select Field Officer to view travelling path");
    }

}
var iconShadow = new google.maps.MarkerImage('http://www.google.com/mapfiles/shadow50.png',
    // The shadow image is larger in the horizontal dimension
    // while the position and offset are the same as for the main image.
    new google.maps.Size(37, 34),
    new google.maps.Point(0,0),
    new google.maps.Point(9, 34));

var infowindow = new google.maps.InfoWindow(
    {
        //size: new google.maps.Size(150,150)
        maxWidth: 200,
        maxHeight :200
    });
function createMarker(map, latlng, label, groupDetails, color,position,index,distance) {
    var contentString = '<b>Group Name:</b> '+label+'<br><b>Account ID:</b> '+groupDetails.loanAccountId+'<br>';
    contentString = contentString+ '<b>Address:</b> '+groupDetails.address+'<br><b>Phone Number:</b> '+groupDetails.phoneNumber+'<br>';
    var installmentId = groupDetails.installmentId;

    contentString = contentString+ '<b>InstallmentId: </b>'+installmentId+'<br><b>Due Date: </b> '+groupDetails.actionDate +'<br><b>Distance: </b>'+distance +" Kms";
    if(position == "First"){
        index= "S";
        label = "Starting Point";
    }
    else if(position == "Last"){
        index= "E";
        label = "End Point";
        contentString = '<b>Address</b> '+groupDetails;
    }
    var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        shadow: iconShadow,
        icon : "http://www.googlemapsmarkers.com/v1/"+index+"/"+color+"/",
        title: label
    });
    marker.myname = label.charAt(0).toUpperCase();
    google.maps.event.addListener(marker, 'click', function() {
        if(position == "First"){
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({'latLng': latlng}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    google.maps.event.addListener(marker, "click", function() {
                        infowindow.setContent("<b>Starting Position of FSO</b> <br> <b> Address : </b>"+results[0].formatted_address);
                        infowindow.open(marker.getMap(), marker);
                    });

                } else {
                    alert("Geocoder failed due to: " + status);
                }
            });
            infowindow.setContent("<b>Starting Point of The Day</b>");
            infowindow.open(marker.getMap(), marker);
        }
        else {
            infowindow.setContent(contentString);
            infowindow.open(map,marker);
        }
    });
    markers.push(marker);
    return marker;
}
function setMarkerText(marker,markerLatLng) {
    markers.push(marker);
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'latLng': markerLatLng}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            google.maps.event.addListener(marker, "click", function() {
                infowindow.setContent("<b>Current Position of FSO</b> <br> <b> Address </b>: "+results[0].formatted_address);
                infowindow.open(marker.getMap(), marker);
            });

        } else {
            alert("Geocoder failed due to: " + status);
        }
    });
}
function deleteMarker() {
    if(typeof (currentPositionmarker) != 'undefined'){
        currentPositionmarker.setMap(null);
    }
}
function codeLatLng(markerLatLng) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'latLng': markerLatLng}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            return results[1].formatted_address;
        } else {
            alert("Geocoder failed due to: " + status);
        }
    });
}
