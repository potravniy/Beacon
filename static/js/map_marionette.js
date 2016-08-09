'use strict'

var MapModel = Backbone.Model.extend({
  defaults: {
    MapOptions: null,
    bounds: null,
    myPosition: null,
    markerMyPosition: null,
    iconMainURL: 'https://gurtom.mobi/images/',
    markers: [],
    i: 0,
    geocoder: new window.google.maps.Geocoder(),
    isMapListeningClick: false,
    mapListenerClick,
    initCity: searchCityInHash() 	//	https://potravny.od.ua/test_b/beacon.html?city=Львів
  }
})


var MapRegionModel = Backbone.Model.extend({
  defaults: {
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
    filter: ''
  }
})
var MapRegionView = Backbone.Marionette.ItemView.extend({
  model: MapRegionModel,
  template: '#map_view',
  className: 'map_view',
  url: 'https://gurtom.mobi/map_cluster.php?',
  ui: {
    search: '#map_search',
    nearBtn: '#near',
    location: '#location',
    favoriteBtn: '.favorite-button',
    createBtn: '#create_btn',
    shareBtn: 'share'
  },
  initialize: function(){

  } 

})
