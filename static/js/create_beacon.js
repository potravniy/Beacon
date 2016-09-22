// $('#create_beacon__no_geo .listview .voting').click(function (){ createBeaconNoGeo(1) })
// function createBeaconNoGeo(index){
//   $('#create_beacon__no_geo').popup('close')
//   location.hash = ''
//   location.assign("./main.html#create-item?back=0&type=" + index);
// }
// function createBeaconGeo(index) {
//   $('#create_beacon__geo').popup('close')
//   index += "&lat=" + +state.map.getCenter().lat().toFixed(8)
//    + "&lng=" + +state.map.getCenter().lng().toFixed(8)
//   createBeaconNoGeo(index) 
// }


//  New form

// $('#create_beacon__no_geo .listview .program').click(function ()          { createObjectNoGeoNew(2)  })
// $('#create_beacon__no_geo .listview .project_proposal').click(function () { createObjectNoGeoNew(3) })
// $('#create_beacon__no_geo .listview .project').click(function ()          { createObjectNoGeoNew(4)  })
// $('#create_beacon__no_geo .listview .request').click(function ()          { createObjectNoGeoNew(5)  })

// $('#create_beacon__geo .listview .voting').click(function ()           { createObjectGeoNew(1) })
// $('#create_beacon__geo .listview .program').click(function ()          { createObjectGeoNew(2) })
// $('#create_beacon__geo .listview .project_proposal').click(function () { createObjectGeoNew(3) })
// $('#create_beacon__geo .listview .project').click(function ()          { createObjectGeoNew(4) })
// $('#create_beacon__geo .listview .request').click(function ()          { createObjectGeoNew(5) })
// $('#create_beacon__geo .listview .p_budget').click(function ()         { createObjectGeoNew(330) })
// $('#create_beacon__geo .listview .emo_good').click(function ()         { createObjectGeoNew(69) })
// $('#create_beacon__geo .listview .emo_bad').click(function ()          { createObjectGeoNew(96) })
// $('#create_beacon__geo .listview .important').click(function ()        { createObjectGeoNew(777) })
// $('#create_beacon__geo .listview .sos').click(function ()              { createObjectGeoNew(911) })

// $('#create_beacon__geo .listview .sos').click(function () {       createBeaconGeoNew('911') })
// $('#create_beacon__geo .listview .important').click(function () { createBeaconGeoNew('777') })
// $('#create_beacon__geo .listview .emo_good').click(function () {  createBeaconGeoNew('69')  })
// $('#create_beacon__geo .listview .emo_bad').click(function () {   createBeaconGeoNew('96')  })

// function createBeaconGeoNew(type) {
//   var options = getGeoOptions(type)
//   $.extend(options, { type: type })
//   showBeaconCreateView(options)
//   createSingleMarker(options, true)
//   window.mainRegion.showBeaconsCards()
// }
// function createObjectGeoNew(type) {
//   var options = getGeoOptions(type)
//   $.extend(options, { type: type })
//   showObjectCreateView(options)
//   createSingleMarker(options, true)
//   window.mainRegion.showBeaconsCards()
// }
function createObject(model) {
  // if(model.type==69 || model.type==96 || model.type==777 || model.type==911) {  //  migrate to objectCreateView ASAP !!!
  //   return createBeaconGeoNew(model.type)
  // }
  var options = getGeoOptions(model.type)
  $.extend(options, model)
  showObjectCreateView(options)
  createSingleMarker(options, true)
  window.mainRegion.showBeaconsCards()
}
// function createObjectNoGeoNew(type) {
//   $('#create_beacon__no_geo').popup('close')
//   showObjectCreateView({type: type})
//   window.mainRegion.showBeaconsCards()
// }
function getGeoOptions(type){
  $('#create_beacon__geo').popup('close')
  var options = {
    'lat': +window.state.map.getCenter().lat().toFixed(8),
    'lng': +window.state.map.getCenter().lng().toFixed(8),
    'b_type': +type
  }
  return options  
}
function closeBeaconNew() {
  requestMarkersListener = window.state.map.addListener('idle', requestMarkers)
  showBeaconsListView()
  requestMarkers()
  setSingleBeaconMode()
}

