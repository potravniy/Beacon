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
  var $el = $('#container')
  this.showMap = function(){
    if($(window).width() < 880){
      if(document.readyState === 'complete'){
        $el.one(window.transitionEndEventName, window.state.map.on)
      }
      $el.css({ "transform": "translate(0,0)" })
    }
  }
  this.showBeaconsCards = function(){
    if($(window).width() < 880){
      if(document.readyState === 'complete'){
        window.state.map.off()
      }
      $el.css({ "transform": "translate(-50%,0)" })
    }
  }
  return this
}

window.mainRegion = new window.MainRegion()

var $btnMap = $('.btn-2-left') 
var $btnCards = $('.btn-2-right') 
$btnMap.click(function() {
  window.mainRegion.showMap()
})
$btnCards.click(function() {
  window.mainRegion.showBeaconsCards()
})

$(document).ready(function(){
  $('#create_btn').on('click', function() {
    checkLoggedInThen(showBeaconCreateMenu)
  })
})

$( document ).on( "pagecreate", function() {
  $( ".photopopup" ).on({
    popupbeforeposition: function() {
      var maxHeight = $( window ).height() - 60 + "px";
      $( ".photopopup img" ).css( "max-height", maxHeight );
    }
  });
});

$( "#right-panel" ).panel({
  open: function() {
    $("#right-panel .navbar .ui-tabs-active a").click()
  }
});

