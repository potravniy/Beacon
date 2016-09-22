'use strict'

var MapModel = Backbone.Model.extend({
  defaults: {
    map = null,
    zoom: 6,
  	center: {lat: 49.0275009, lng: 31.4822306},
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
    filter: '',
    MapOptions: null,
    bounds: null,
    myPosition: null,
    markerMyPosition: null,
    iconMainURL: 'https://gurtom.mobi/images/',
    markers: [],
    i: 0,
    isMapListeningClick: false,
    mapListenerClick = null
  }
})

var MapPageView = Backbone.Marionette.ItemView.extend({
  el: '#the-map',
  template: false,
  model: MapModel,
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
