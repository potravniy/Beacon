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

var Currency = function(){
  var curr = {
    ICAN: '1',
    USD: '840',
    EUR: '978',
    UAH: '980',
    vUAH: '1980'
  }
  var that = this
  this.getCode = function(name){
    return curr[name]
  }
  this.getName = function(code){
    for(var name in curr){
      if(curr[name] == code) return name
    }
    return undefined
  }
}
var currency = new Currency()
