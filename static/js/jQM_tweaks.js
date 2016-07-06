// 'use strict'

$.mobile.defaultPageTransition = 'flip'

$('#favorite__list').on("popupbeforeposition"
  , {el: $('#favorite__list .listview')}, maxPopupHeightLimit)
$('#create_beacon__geo').on("popupbeforeposition"
  , {el: $('#create_beacon__geo .listview')}, maxPopupHeightLimit)
$('#create_beacon__no_geo').on("popupbeforeposition"
  , {el: $('#create_beacon__no_geo .listview')}, maxPopupHeightLimit)
function maxPopupHeightLimit(event) {
  var maxHeight = $(window).height() - 135
  event.data.el.css('max-height', maxHeight + 'px')
}


var MainRegion = function(){
  this.$el = $('#container')
  this.showMap = function(){
    this.$el.css({
      "-webkit-transform": "translate(0,0)",
      "-moz-transform": "translate(0,0)",
      "-o-transform": "translate(0,0)",
      "-ms-transform": "translate(0,0)",
      "transform": "translate(0,0)"
    })
  }
  this.showBeacons = function(){
    this.$el.css({
      "-webkit-transform": "translate(-50%,0)",
      "-moz-transform": "translate(-50%,0)",
      "-o-transform": "translate(-50%,0)",
      "-ms-transform": "translate(-50%,0)",
      "transform": "translate(-50%,0)"
    })
  }
  return this
}
var mainRegion = new MainRegion()
window.setPanelContent = function () {
  var maxHeight = $(window).height() - 59
  $('.panel .ui-widget-content').css('max-height', maxHeight + 'px')
  // mainRegion.$el.css('max-height', maxHeight + 'px')
}
var $btnMap = $('#btn__the-map') 
var $btnBeacons = $('#btn__the-beacons') 
$btnMap.click(function() {
  mainRegion.showMap()
})
$btnBeacons.click(function() {
  mainRegion.showBeacons()
})
$(window).resize(function(){
  if($(window).width() >= 880){
    mainRegion.showMap()
  } else if ($btnBeacons.hasClass('ui-btn-active')) {
    mainRegion.showBeacons()
  } else if ($btnMap.hasClass('ui-btn-active')) {
    mainRegion.showMap()
  }
  window.setPanelContent()
})

$(document).ready(function(){
  var $initPopup = $("#create_beacon")
  var $geoPopup = $('#create_beacon__geo')
  var $noGeoPopup = $('#create_beacon__no_geo')
  var $geoProectPropos = $('#create_beacon__geo .proect_prop')
  var $noGeoProectPropos = $('#create_beacon__no_geo .proect_prop')
  var $proectPropPopup = $('#proect_propos_popup')
  $('#btn__create_beacon__geo').on('click', {el: $geoPopup}, togglePopup)
  $('#btn__create_beacon__no_geo').on('click', {el: $noGeoPopup}, togglePopup)
  $geoProectPropos.on('click', {el: $geoPopup}, openProectPopup)
  $noGeoProectPropos.on('click', {el: $noGeoPopup}, openProectPopup)
  function openProectPopup(event) {
    event.data.el.one("popupafterclose", function() {
      $proectPropPopup.popup("open")
    })
    event.data.el.popup("close")
  }
  function togglePopup(event) {
    $initPopup.one("popupafterclose", function() {
      event.data.el.popup("open")
    })
    $initPopup.popup("close")
  }
})

$( document ).on( "pagecreate", function() {
  $( ".photopopup" ).on({
    popupbeforeposition: function() {
      var maxHeight = $( window ).height() - 60 + "px";
      $( ".photopopup img" ).css( "max-height", maxHeight );
    }
  });
  window.setPanelContent()
  // $( "#beacons-map" ).loader( "option", "html", "<span class='ui-icon ui-icon-loading'><h2>Ми переходимо на новий інтерфейс<br>Перепрошуємо за тимчасові незручності</h2></span>" );
});

$(document).ready(photoPopupHanlder)
function photoPopupHanlder(){
  var $photoPopup = $('#popupPhoto')
  var $popupPhotoImg = $('#popupPhoto .photopopup__img')
  $('#beacons-map__the-beacons').on('click', 'img.photo', function(){
    $popupPhotoImg.attr("src", $(this).attr('src'))
    $photoPopup.popup('open')
    $photoPopup.popup("reposition", {positionTo: 'window'})
  })
}
//  NEED TO BE MOVED TO VIEW MODULE OF MVC TO DINAMIC CHANGE OF #beacons-map__the-beacons ELEMENT

$( "#right-panel" ).panel({
  open: function() {
    $("#right-panel .navbar .ui-tabs-active a").addClass('ui-btn-active')
  }
});

function minifyObj(obj){
  return _.pick(obj, function(val){
    return val !== '' 
  })
}

setInterval(function(){
  $('.warning').remove()
}, 4000)