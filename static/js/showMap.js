'use strict'
window.state = {
	map: null,
	initFromURL: false,
	zoom: 6,
	center: {lat: 49.0275009, lng: 31.4822306},
	latmin: 0,
	latmax: 0,
	lngmin: 0,
	lngmax: 0,
	signsAfterDot: 0,
	b_types: '',
	b_status: '',
	b_sources: '',
	b_layer_type: '',
	b_layer_owner_id: '',
	b_link: '0',
	user_auth: '0,1,7,8,9,10',
	start: '',
	finish: '',
	filter: '',
	get4thFilter: function(){
		if ( !window.listOrgCollection ) return ''
		var uniq_id = []
		var layer_owner_id = _.reduce(window.listOrgCollection.toJSON(), function( memo, item ){
			if ( item.chkd ) {
				memo.push( item.layer_owner_id )
			} else {
				uniq_id = uniq_id.concat(_.reduce(item.layers, function( mem, it ){
					if ( it.chkd ) mem.push( it.uniq_id )
					return mem
				}, []))
			}
			return memo 
		}, [])
		var res = (uniq_id.length===0 ? '' : '&uniq_id=' + uniq_id.join())
		  + (layer_owner_id.length===0 ? '' : '&layer_owner_id=' + layer_owner_id.join())
		return res
	},
	oReq: new XMLHttpRequest(),
	sendGET: function(url){
		this.oReq.open("GET", url + this.urlRequest(), true)
		this.oReq.send()
		Manager.trigger('state_update')
		if(window.beaconsListView && !window.beaconsListView.isDestroyed) {
			beaconsList.getNewCollection()
		}
		window.clipboardView && !window.clipboardView.isShowndBefore && window.clipboardView.initialShow()
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
		+ (this.filter ? '&filter=' + encodeURIComponent(this.filter) : '')
		+ (this.b_link !== '0' ? '&b_link=' + this.b_link : '')
		+ this.get4thFilter()
		return result
	},
	viewState: 'mm',	//	mm: mapMultiView, cardsMultiView;	  ms: mapMultiView, cardsFullView;  msd: mapMultiView, donation;
	viewStateId: '',
	singleBeacon: false,
	mapWidth: 0,	// temp values for map resize investigation
	mapHeight: 0	// temp values for map resize investigation
}

window.onload = function() {
	if (!History.started) window.Manager.start();
	window.markers = []
	window.i = 0
	window.geocoder = new google.maps.Geocoder()
	window.infowindow = new google.maps.InfoWindow;
	window.isMapListeningClick = false
	window.mapListenerClick = undefined
	window.state.oReq.addEventListener("load", renderMarkers)
	window.state.oReq.addEventListener("error", function(){
		alert(window.localeMsg[window.localeLang].CONNECTION_ERROR)
	})
	mapInit()
	window.state.map.off = function(){
		if(window.requestMarkersListener.b) {
			window.google.maps.event.removeListener(window.requestMarkersListener)
		}
	}
	window.state.map.on = function(){
		if(!window.requestMarkersListener.b) window.requestMarkersListener = window.state.map.addListener('idle', _.debounce(requestMarkers, 500))
		google.maps.event.trigger(window.state.map,'resize')
	}
	if(!window.state.initFromURL) tryGeoLocation()
	$(":mobile-pagecontainer").pagecontainer({
  	change: function( event, ui ) {
    	if(ui.toPage.attr('id') === 'beacons-map'){
				window.state.map.on()
			} else if(ui.prevPage.attr('id') === 'beacons-map'){
				window.state.map.off()
			}
  	}
	});
} 	//	window.onload

function mapInit(){
	if(window.requestMarkersListener) window.google.maps.event.removeListener(window.requestMarkersListener)
	window.state.map = new window.google.maps.Map(document.getElementById('the-map'), {
		zoom: window.state.zoom,
		center: window.state.center,
		mapTypeControl: true,
		mapTypeControlOptions: {
			style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
			position: google.maps.ControlPosition.BOTTOM_CENTER,
			mapTypeIds: ['roadmap', 'hybrid']
		}
	})
	window.requestMarkersListener = window.state.map.addListener('idle', _.debounce(requestMarkers, 500))
}

function tryGeoLocation() {
	if (navigator.geolocation && navigator.geolocation.getCurrentPosition) {
		var listener = window.state.map.addListener('idle', renderGeolocation)
	}
	function renderGeolocation() {
		navigator.geolocation.getCurrentPosition(function(position){
			var MapOptions = {
				zoom: 15,
				center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
			}
			window.state.map.setOptions(MapOptions)
			window.state.map.myPosition = MapOptions.center
		})
		window.google.maps.event.removeListener(listener)
	}
}

function requestMarkers() {
	if(!window.state.singleBeacon) {
		window.state.$map = window.state.$map || $('#the-map')
		window.state.zoom = window.state.map.getZoom()
		window.state.center.lat = +(window.state.map.center.lat().toFixed(8))
		window.state.center.lng = +(window.state.map.center.lng().toFixed(8))
		var bounds = window.state.map.getBounds()
		window.state.latmin = +(bounds.getSouthWest().lat().toFixed(8))
		window.state.lngmin = +(bounds.getSouthWest().lng().toFixed(8))
		window.state.latmax = +(bounds.getNorthEast().lat().toFixed(8))
		window.state.lngmax = +(bounds.getNorthEast().lng().toFixed(8))
		var delta = (window.state.lngmax - window.state.lngmin)/(window.innerWidth/40)
		window.state.signsAfterDot = Math.round(-Math.log(delta)/Math.LN10)
		window.state.mapHeight = window.state.$map.css('height')
		window.state.mapWidth  = window.state.$map.css('width')
		window.state.sendGET(window.state.urlMarkers)
	}
}

function renderMarkers() {
	if(this.toString()==="[object XMLHttpRequest]"){
		try {
			window.markersList = JSON.parse(this.responseText)
		} catch (error) {
			alert(window.localeMsg[window.localeLang].FAIL)
			throw new Error("Invalid JSON received from "+ this.responseURL)
			return
		}
		if(window.markersList.error){
			alert(window.localeMsg[window.localeLang][window.markersList.error])
			return
		}
	}
	var contents = [],
			image = null
	deleteMarkers()
	if(window.state.map.myPosition) {
		image = {
			url: '/static/css/images/my_location.png',
			size: new google.maps.Size(24, 24),
			scaledSize: new google.maps.Size(24, 24),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(12, 12)
		}
		var markerMyPosition = new window.google.maps.Marker({
			map: window.state.map,
			icon: image,
			title: 'You are here.',
			position: window.state.map.myPosition
		});
	}
	//	Render clusters first
	for(i=0; i<window.markersList.length; i++){
		if (+window.markersList[i].c_n > 1) {
			image = {
				path: google.maps.SymbolPath.CIRCLE,
				scale: 2 + window.state.map.getZoom() * Math.log(parseInt(window.markersList[i].c_n)),
				fillColor: '#00f',
				fillOpacity: 0.3,
				strokeWeight: 0
			}
			markers[i] = new window.google.maps.Marker({
				map: window.state.map,
				icon: image,
				title: window.markersList[i].c_n,
				zIndex: 10,
				optimized: false,
				position: new google.maps.LatLng(window.markersList[i].lat, window.markersList[i].lng)
			});
		}
	}
	//	Render markers
	for(i=0; i<window.markersList.length; i++){
		if (window.markersList[i].c_n === '1') {
			createMarker(window.markersList[i], i) 
		}
	}
}

function createMarker(r, index, draggable){ 	// createMarker(r.b_type, r.layer_type, r.layer_owner_id, r.title, r.id, r.lat, r.lng, i)
	var iconURL = r.img || getIconURL(r, true)
	index = index === undefined ? window.markers.length : index
	markers[index] = new window.google.maps.Marker({
		map: window.state.map,
		title: r.title + ', id:' + r.id,
		beaconID: r.id,
		zIndex: 2000,
		position: new google.maps.LatLng(r.lat, r.lng),
		draggable: (draggable === true || draggable === 'draggable') ? true : false,
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
	markers[index].iconImg.alt = '!'
	markers[index].iconImg.parent = markers[index] 
	markers[index].iconImg.onload = function () {
		this.parent.iconImg = null
	}
	markers[index].iconImg.onerror = function () {
			this.parent.setIcon(null); //This displays brick colored standard marker icon in case of image load fail.
			this.parent.iconImg = null
	}
	markers[index].iconImg.src = iconURL
	markers[index].addListener('click', function(){
		showBeaconFullView({ id: this.beaconID })
		setSingleBeaconMode()
	})
	if(draggable){
    markers[index].addListener('dragend',function(event) {
      window.objectCreateView.latLng.currentView.model.set({
				'lat': +event.latLng.lat().toFixed(8),
				'lng': +event.latLng.lng().toFixed(8)
			}) 
    });
	}
	return markers[index]
}

function createSingleMarker(r, draggable) {
  window.state.map.off()
	window.state.singleBeacon = true
  hideMarkers()
	createMarker(r, undefined, draggable)
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
	window.requestMarkers()
}

function setMapForAllMarkers(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function hideMarkers() {
  setMapForAllMarkers(null);
}

// Shows any markers currently in the array.
function showMarkers() {
  setMapForAllMarkers(window.state.map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  hideMarkers();
  markers = [];
}

function moveLastMarkerTo(lat, lng) {
	markers[markers.length - 1].setPosition(new google.maps.LatLng(lat, lng))
}

