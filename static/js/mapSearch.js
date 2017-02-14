"use strict"

var MapSearchView = Backbone.Marionette.ItemView.extend({
  template: '#map_search__tpl',
  className: 'ui-input-search ui-body-inherit ui-corner-all wrapper_map_search ui-shadow-inset ui-input-has-clear',
  ui: {
    input: '#map_search',
    clear: '.ui-input-clear',
    close: '.ui-input-close'
  },
  onDomRefresh: function(){
    this.$el.trigger('create')
    this.ui.input.focus()
  },
  close: function(){
    var that = this
    var destroy = _.debounce(function(){
      that.destroy()
    }, 1200)
    this.ui.clear.click()
    destroy()
  }
})

var HashAndIdMapSearchView = MapSearchView.extend({
  initialize: function(options){
    switch (options.searchType) {
      case 'hash':
        var model = {
          placeholder: window.localeMsg[window.localeLang].HASH_TAG,
          inputType: 'text'
        }
        break;
      case 'id':
        var model = {
          placeholder: window.localeMsg[window.localeLang].BEACON_ID,
          inputType: 'text'
        }
        break;
    }
    model.value = options.value || '' 
    this.model = new Backbone.Model(model)
  },
  events: {
    'click @ui.close': 'close'
  },
  search: function(e){
    if(e.keyCode >= 16 && e.keyCode <= 18) return
    var res = this.ui.input.val()
    if (res === ""){
      window.state.filter = ""
    } else {
      if ( this.model.get('inputType') === 'text' ){
        res = _.filter(res, function(item){
          return item !== "#"
        }).join('')
      }
      window.state.filter = res
    }
    window.state.sendGET(window.state.urlMarkers)
  },
  onShow: function(){
    var that = this
    this.ui.input.on(
      'change keydown keyup paste',
      _.debounce(that.search.bind(that), 1000)
    )
  },
  onBeforeDestroy: function(){
    this.ui.input.off()
  }
})

var GoogleMapSearchView = MapSearchView.extend({
  initialize: function(){
    var model = {
      placeholder: window.localeMsg[window.localeLang].ADDRESS_OR_PLACE_ON_MAP,
      inputType: 'text'
    }
    model.value = '' 
    this.model = new Backbone.Model(model)
  },
  events: {
    'click @ui.clear': 'clearSearchMarkers',
    'click @ui.close': 'close'
  },
  onShow: function(){
    var that = this
    var map = window.state.map
    // Create the search box and link it to the UI element.
    var input = document.getElementById('map_search');
    var searchBox = new google.maps.places.SearchBox(input);
    // Bias the SearchBox results towards current map's viewport.
    this.boundsListener = map.addListener('bounds_changed', function() {
      searchBox.setBounds(map.getBounds());
    });

    this.searchMarkers = [];

    // [START region_getplaces]
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    this.placeChanged = searchBox.addListener('places_changed', function() {
      var places = searchBox.getPlaces();
      if (places.length == 0) return

      // Clear out the old markers.
      that.clearSearchMarkers()

      // For each place, get the icon, name and location.
      var bounds = new google.maps.LatLngBounds();
      places.forEach(function(place) {
        var icon = {
          url: place.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25)
        };

        // Create a marker for each place.
        that.searchMarkers.push(new google.maps.Marker({
          map: map,
          icon: icon,
          title: place.name,
          position: place.geometry.location
        }));

        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      map.fitBounds(bounds);
    });
  },
  onBeforeDestroy: function(){
    google.maps.event.removeListener(this.boundsListener)
    google.maps.event.removeListener(this.placeChanged)
  },
  clearSearchMarkers: function(){
    this.searchMarkers.forEach(function(marker) {
      marker.setMap(null);
    });
    this.searchMarkers = [];
  },
})