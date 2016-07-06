'use strict'
window.state = {
	map: null,
	zoom: 0,
	latmin: 0,
	latmax: 0,
	lngmin: 0,
	lngmax: 0,
	signsAfterDot: 0,
	b_types: '1,2,3,4,5,69,96,777,911,1000',
	b_status: '0,1,2,3',
	b_sources: '',
	b_layer_type: '',
	b_layer_owner_id: '',
	user_auth: '0,1,7,8,9,10',
	start: '',
	finish: '',
	filter: '',
	oReq: new XMLHttpRequest(),
	sendGET: function(url){
		this.oReq.open("GET", url + this.urlRequest(), true)
		this.oReq.send()
		if(window.beaconsListView && !window.beaconsListView.isDestroyed) {
			beaconsList.getNewCollection()
		}
	},
	urlMarkers: 'https://gurtom.mobi/map_cluster.php?',
	urlRequest: function(){
		var result = 'z=' + this.zoom
		+ '&latmin=' + this.latmin
		+ '&latmax=' + this.latmax
		+ '&lngmin=' + this.lngmin
		+ '&lngmax=' + this.lngmax
		+ '&m=' + this.signsAfterDot
		+ (this.b_types ? '&b_types=' + this.b_types : '')
		+ (this.b_status ? '&b_status=' + this.b_status : '')
		+ (this.b_sources ? '&b_sources=' + this.b_sources: '')
		+ (this.b_layer_type ? '&b_layer_type=' + this.b_layer_type : '')
		+ (this.b_layer_owner_id ? '&b_layer_owner_id=' + this.b_layer_owner_id : '')
		+ (this.user_auth ? '&user_auth=' + this.user_auth : '')
		+ (this.start ? '&start=' + this.start : '')
		+ (this.finish ? '&finish=' + this.finish : '')
		+ (this.filter ? '&filter=' + this.filter : '')
		return result
	},
	singleBeacon: false
}

window.onload = function() {
	window.MapOptions = null
	window.bounds = null
	window.myPosition = null
	window.markerMyPosition = null
	window.iconMainURL = 'https://gurtom.mobi/images/'
	window.markers = []
	window.i = 0
	window.geocoder = new google.maps.Geocoder()
	window.isMapListeningClick = false
	window.mapListenerClick
	window.initCity = searchCityInHash() 	//	https://potravny.od.ua/test_b/beacon.html?city=Львів

	window.MapOptions = {
		zoom: 7,
		center: {lat: 49.0, lng: 31.4},
		mapTypeControl: false
	}
	window.state.map = new window.google.maps.Map(document.getElementById('the-map'), MapOptions)
	window.state.oReq.addEventListener("load", renderMarkers)
	window.requestMarkersListener = window.state.map.addListener('idle', requestMarkers)

	window.initScaleListener = window.state.map.addListener('idle', function(){
		window.address = initCity ? initCity + ", UA" : "UA"
		window.geocoder.geocode({'address': address}, function (results, status) {
			window.state.map.fitBounds(results[0].geometry.viewport)
			window.google.maps.event.removeListener(initScaleListener)
		})      
	})

	if(!window.initCity) {
		if (navigator.geolocation && navigator.geolocation.getCurrentPosition) {
			var listener = window.state.map.addListener('idle', renderGeolocation)
		}
		function renderGeolocation() {
			navigator.geolocation.getCurrentPosition(function(position){
				window.myPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
				window.MapOptions = {
					zoom: 15,
					center: myPosition
				}
				window.state.map.setOptions(MapOptions)
			})
			window.google.maps.event.removeListener(listener)
		}
	}
} 	//	window.onload


function requestMarkers() {
	if(!window.state.singleBeacon) {
		window.state.zoom = window.state.map.getZoom()
		bounds = window.state.map.getBounds()
		window.state.latmin = +(bounds.getSouthWest().lat().toFixed(8))
		window.state.lngmin = +(bounds.getSouthWest().lng().toFixed(8))
		window.state.latmax = +(bounds.getNorthEast().lat().toFixed(8))
		window.state.lngmax = +(bounds.getNorthEast().lng().toFixed(8))
		var delta = (window.state.lngmax - window.state.lngmin)/(window.innerWidth/40)
		window.state.signsAfterDot = Math.round(-Math.log(delta)/Math.LN10)
		window.state.sendGET(window.state.urlMarkers)
	}
}
function renderMarkers() {
	var contents = [],
			image = ''
	deleteMarkers()
	var response = JSON.parse(this.responseText) 
	if(myPosition) {
		image = {
			url: './static/css/images/my_location.png',
			size: new google.maps.Size(24, 24),
			scaledSize: new google.maps.Size(24, 24),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(12, 12)
		}
		markerMyPosition = new window.google.maps.Marker({
			map: window.state.map,
			icon: image,
			title: 'You are here.',
			position: myPosition
		});
	}
	//	Render clusters first
	for(i=0; i<response.length; i++){
		if (+response[i].c_n > 1) {
			image = {
				path: google.maps.SymbolPath.CIRCLE,
				scale: 2 + window.state.map.getZoom() * Math.log(parseInt(response[i].c_n)),
				fillColor: '#00f',
				fillOpacity: 0.3,
				strokeWeight: 0
			}
			markers[i] = new window.google.maps.Marker({
				map: window.state.map,
				icon: image,
				title: response[i].c_n,
				zIndex: 10,
				optimized: false,
				position: new google.maps.LatLng(response[i].lat, response[i].lng)
			});
		}
	}
	//	Render markers
	for(i=0; i<response.length; i++){
		if (response[i].c_n === '1') {
			createMarker(response[i].b_type, response[i].layer_type, response[i].layer_owner_id,
			i, response[i].title, response[i].id, response[i].lat, response[i].lng)
		}
	}
}

function createMarker(b_type, layer_type, layer_owner_id, index, title, id, lat, lng, draggable){
	var iconURL = ''
	if(b_type < 100) {
		iconURL = iconMainURL + b_type +'.png' 
	} else if(b_type < 1000) {
		iconURL = iconMainURL + b_type +'.png'
	} else {
			iconURL = iconMainURL + b_type +'.png'
	}
	markers[index] = new window.google.maps.Marker({
		map: window.state.map,
		title: title,
		beaconID: id,
		zIndex: 2,
		position: new google.maps.LatLng(lat, lng),
		draggable: !!draggable,
		icon: {
			url: iconURL,
			// This marker is 20 pixels wide by 32 pixels high.
			size: new google.maps.Size(20, 32),
			scaledSize: new google.maps.Size(20, 32),
			// The origin for this image is (0, 0).
			origin: new google.maps.Point(0, 0),
			// The anchor for this image is the base of the flagpole at (0, 32).
			anchor: new google.maps.Point(10, 32)
		}
	});
	markers[index].iconImg = new Image();
	markers[index].iconImg.parent = markers[index] 
	markers[index].iconImg.onload = function () {
		this.parent.iconImg = null
	}
	markers[index].iconImg.onerror = function () {
			this.parent.setIcon(null); //This displays brick colored standard marker icon in case image is not found.
			this.parent.iconImg = null
	}
	markers[index].iconImg.src = iconURL
	markers[index].addListener('click', function(){
		beaconsList.getBeaconById(this.beaconID)
		setSingleBeaconMode()
	})
	if(draggable){
    markers[index].addListener('dragend',function(event) {
			var createView = window.beaconCreateView || window.latLngView
      createView.model.set({
				'lat': +event.latLng.lat().toFixed(8),
				'lng': +event.latLng.lng().toFixed(8)
			}) 
    });
	}
}
function setSingleBeaconMode() {
	if(!window.state.singleBeacon) window.state.singleBeacon = true
	if(!window.isMapListeningClick) {
		window.mapListenerClick = window.state.map.addListener('click', setMultiBeaconMode)
		window.isMapListeningClick = true
	}
}
function setMultiBeaconMode() {
	google.maps.event.removeListener(window.mapListenerClick)
	window.isMapListeningClick = false
	window.state.singleBeacon = null
	window.state.sendGET(window.state.urlMarkers)
}	
function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}
// Removes the markers from the map, but keeps them in the array.
function hideMarkers() {
  setMapOnAll(null);
}
// Shows any markers currently in the array.
function showMarkers() {
  setMapOnAll(window.state.map);
}
// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  hideMarkers();
  markers = [];
}

function searchCityInHash() {
	var hash = window.location.hash
	var city = ''
	var search = 'city='
	var start = hash.indexOf(search)
	if(start > 0) {
		var end = hash.indexOf('&', start)
		if (end > start + search.length){
			city = hash.substring(start + search.length, end)
			location.hash = hash.replace(search + city + '&', '')
		} else {
			city = hash.substr(start + search.length)
			location.hash = hash.replace(search + city, '')
		}
	}
	return city
}
