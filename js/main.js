'use strict'

$('#favorite__list').on("popupbeforeposition", function() {
  var maxHeight = $(window).height() - 135
  $('#favorite__list .listview').css('max-height', maxHeight + 'px')
})