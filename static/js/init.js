'use strict'

$.ajax({
  url: "https://gurtom.mobi/nco.php",
  dataType: "json",
  crossDomain: true,
  success: function ( response ) {
    window.listNCO = response
  },
  error: function(){
    console.log('nco request error')
  }
})
