//  Using old site

// $('#create_beacon__no_geo .listview .voting').click(function ()           { createBeaconNoGeo(1) })
$('#create_beacon__geo .listview .voting').click(function ()           { createBeaconGeo(1) })

function createBeaconNoGeo(index){
  $('#create_beacon__no_geo').popup('close')
  location.hash = ''
  location.assign("./main.html#create-item?back=0&type=" + index);
}
function createBeaconGeo(index) {
  $('#create_beacon__geo').popup('close')
  index += "&lat=" + +state.map.getCenter().lat().toFixed(8)
   + "&lng=" + +state.map.getCenter().lng().toFixed(8)
  createBeaconNoGeo(index) 
}


//  New form

$('#create_beacon__no_geo .listview .program').click(function ()          { createObjectNoGeoNew(2)  })
$('#create_beacon__no_geo .listview .project_proposal').click(function () { createObjectNoGeoNew(3) })
$('#create_beacon__no_geo .listview .project').click(function ()          { createObjectNoGeoNew(4)  })
$('#create_beacon__no_geo .listview .request').click(function ()          { createObjectNoGeoNew(5)  })

$('#create_beacon__geo .listview .program').click(function ()          { createObjectGeoNew(2) })
$('#create_beacon__geo .listview .project_proposal').click(function () { createObjectGeoNew(3) })
$('#create_beacon__geo .listview .project').click(function ()          { createObjectGeoNew(4) })
$('#create_beacon__geo .listview .p_budget').click(function ()      { createObjectGeoNew(330) })
$('#create_beacon__geo .listview .request').click(function ()          { createObjectGeoNew(5) })

$('#create_beacon__geo .listview .sos').click(function () {       createBeaconGeoNew('911') })
$('#create_beacon__geo .listview .important').click(function () { createBeaconGeoNew('777') })
$('#create_beacon__geo .listview .emo_good').click(function () {  createBeaconGeoNew('69')  })
$('#create_beacon__geo .listview .emo_bad').click(function () {   createBeaconGeoNew('96')  })

$('#create_btn').click(function(e){
  if(!window.state.user.id){
    e.preventDefault()
    $.mobile.navigate('#login_dialog')
  }
})

function createBeaconGeoNew(type) {
  $('#create_beacon__geo').popup('close')
  var options = {
    'lat': +window.state.map.getCenter().lat().toFixed(8),
    'lng': +window.state.map.getCenter().lng().toFixed(8),
    'b_type': +type
  }
  showBeaconCreateView(options)
  //  Show new marker
  google.maps.event.removeListener(requestMarkersListener)
  hideMarkers()
  createMarker(options.b_type, '', '', markers.length, '', '', options.lat, options.lng, true)
}
function createObjectGeoNew(type) {
  $('#create_beacon__geo').popup('close')
  var options = {
    'lat': +window.state.map.getCenter().lat().toFixed(8),
    'lng': +window.state.map.getCenter().lng().toFixed(8),
    'b_type': +type
  }
  showObjectCreateView(type, options)
  //  Show new marker
  google.maps.event.removeListener(requestMarkersListener)
  hideMarkers()
  createMarker(options.b_type, '', '', markers.length, '', '', options.lat, options.lng, true)
}
function createObjectNoGeoNew(type) {
  $('#create_beacon__no_geo').popup('close')
  showObjectCreateView(type)
}

function closeBeaconNew() {
  requestMarkersListener = window.state.map.addListener('idle', requestMarkers)
  requestMarkers()
  showBeaconsListView()
  setSingleBeaconMode()
}

