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
  var $el = $('#container'),
      isFooterVisible = $(window).width() < 880 
  this.showMap = function(){
    if(isFooterVisible) {
      if(document.readyState === 'complete'){
        $el.one(window.transitionEndEventName, window.state.map.on)
      }
      $el.css({ "transform": "translate(0,0)" })
    }
  }
  this.showBeaconsCards = function(){
    if(isFooterVisible) {
      if(document.readyState === 'complete'){
        window.state.map.off()
      }
      $el.css({ "transform": "translate(-50%,0)" })
    }
  }
  this.hideFooter = function(){
    $el.css({ "transform": "" })
    isFooterVisible = false
  }
  this.showFooter = function(){
    isFooterVisible = true
    if ($btnCards.hasClass('ui-btn-active')) {
      $el.css({ "transform": "translate(-50%,0)" })
    } else if ($btnMap.hasClass('ui-btn-active')) {
      $el.css({ "transform": "translate(0,0)" })
    }
  }
  return this
}

window.mainRegion = new window.MainRegion()
$(window).on('resize', _.debounce(function(e, data){
  window.setHeights(e, data)
}, 500))

var $btnMap = $('#btn__the-map') 
var $btnCards = $('#btn__the-beacons') 
$btnMap.click(function() {
  mainRegion.showMap()
})
$btnCards.click(function() {
  mainRegion.showBeaconsCards()
})

function setHeights(e){
  console.log('resize')
  var $el = $('#container')
  var maxHeight = $(window).height(),
      rule = null
  if($(window).width() >= 880){
    rule = {
      "padding-bottom": "0"
    }
    mainRegion.hideFooter()
  } else {
    rule = {
      "padding-bottom": "35px"
    }
    mainRegion.showFooter()
  }
  $el.css( rule )
  $( ".listview_wrapper" ).css({ "max-height": maxHeight - 88 + "px" })
  $('.panel .ui-widget-content').css({'max-height': maxHeight - 59 + 'px'})
}

$(document).ready(function(){
  $('#create_btn').on('click', showCreatePopup)
  function showCreatePopup() {
    if(!window.state.user.id){
      window.logIn()
    } else {
      showBeaconCreateMenu()
    }
  }
})
// $(document).ready(function(){
//   var $createBeaconPopup = $("#create_beacon")
//   var $createBeaconGeoPopup = $('#create_beacon__geo')
//   var $createBeaconNoGeoPopup = $('#create_beacon__no_geo')
//   var $geoProectPropos = $('#create_beacon__geo .proect_prop')
//   var $noGeoProectPropos = $('#create_beacon__no_geo .proect_prop')
//   var $proectPropPopup = $('#proect_propos_popup')
//   $('#create_btn').on('click', showInitPopup)
//   $('#btn__create_beacon__geo').on('click', {el: $createBeaconGeoPopup}, togglePopup)
//   $('#btn__create_beacon__no_geo').on('click', {el: $createBeaconNoGeoPopup}, togglePopup)
//   $geoProectPropos.on('click', {el: $createBeaconGeoPopup}, openProectPopup)
//   $noGeoProectPropos.on('click', {el: $createBeaconNoGeoPopup}, openProectPopup)

//   function showInitPopup() {
//     if(!window.state.user.id){
//       window.logIn()
//     } else {
//       var options = {
//         transition: 'turn',
//         positionTo: '#create_btn'
//       }
//       $createBeaconPopup.popup("open", options)
//     }
//   }

//   function openProectPopup(event) {
//     event.data.el.one("popupafterclose", function() {
//       $proectPropPopup.popup("open")
//     })
//     event.data.el.popup("close")
//   }

//   function togglePopup(event) {
//     $createBeaconPopup.one("popupafterclose", function() {
//       showBeaconCreateMenu()
//     })
//     $createBeaconPopup.popup("close")
//   }
// })

$( document ).on( "pagecreate", function() {
  $( ".photopopup" ).on({
    popupbeforeposition: function() {
      var maxHeight = $( window ).height() - 60 + "px";
      $( ".photopopup img" ).css( "max-height", maxHeight );
    }
  });
  setHeights()
});

$( "#right-panel" ).panel({
  open: function() {
    $("#right-panel .navbar .ui-tabs-active a").addClass('ui-btn-active')
  }
});

