"use strict"

var ClipboardBeaconsList = Backbone.Collection.extend({
  model: BeaconModel,
  collection: []
})

var ClipboardModel = Backbone.Model.extend({
  defaults: {
    clipboardTitle: window.localeMsg[window.localeLang].CLIPBOARD_TITLE,
    demand_title: window.localeMsg[window.localeLang].DEMAND,
    supply_title: window.localeMsg[window.localeLang].SUPPLY,
    on_demand: 0,
    on_supply: 0,
    isExpanded: false
  }
})

var ClipboardView = Backbone.Marionette.CompositeView.extend({
  template: '#clipboard__tpl',
  className: "clipboard_view",
  childViewContainer: ".clipboard_collection",
  childView: window.BeaconView,
  model: new ClipboardModel(),
  collection: new ClipboardBeaconsList(),
  index: new function(){
    var index = 0
    this.get = function(){
      return index++
    }
    this.reset = function(){
      index = 0
      return index
    }
    return this
  },
  fullViewRegion: new Backbone.Marionette.Region({el: ".clipboard__full-view"}),
  initialize: function(){
    this.childViewOptions = {
      isWithinClipboard: true,
      index: this.index,
      region: this.fullViewRegion
    }
    this.prevCollectionIDs = []
  },
  collectionEvents: {
    update: 'onCollectionChange'
  },
  modelEvents: {
    change: 'onModelChange'
  },
  events: {
    'click .demand_clear': 'clearDemand',
    'click .supply_clear': 'clearSupply',
    'click .demand_label': 'expandDemand',
    'click .supply_label': 'expandSupply',
    'click .ui-icon-close': 'collapse'
  },
  filter: function(model){ return false },
  onCollectionChange : function(){
    this.index.reset()
    var on_demand = _.filter(this.collection.models, function(model){
      return window.lib.isDemand(model)
    })
    this.model.set({
      on_demand: on_demand.length,
      on_supply: this.collection.length - on_demand.length
    })
    this.render()
    this.updateBeaconListView()
  },
  onModelChange: function(){
    this.model.get('isExpanded')
      ?  this.$el.addClass('expanded')
      :  this.$el.removeClass('expanded')
  },
  setSelectedMarkersBounsing: function(options){
    var that = this,
        diff
    if(options === 'reset') this.prevCollectionIDs = []
    if (this.prevCollectionIDs.length > this.collection.length){
      diff = _.difference(this.prevCollectionIDs, this.collection.pluck('id'))
      _.each(diff, function(id){
        var index = _.findIndex(window.markers, function(marker){
          return _.isMatch(marker, {beaconID: id})
        })
        index > -1
          ? window.markers[index].setAnimation(null)
          : null
        var isMarkerOld = _.find(window.markersList, function(markerData){
          return id === markerData.id
        })
        if(!isMarkerOld) {
          window.markers[index].setMap(null)
          window.markers[index] = undefined
        }
      })
      window.markers = _.compact(window.markers)
    } else {
      diff = this.collection.filter(function(model){
        return !_.contains(that.prevCollectionIDs, model.get('id'))
      })
      _.each(diff, function(model){
        var marker = _.find(window.markers, function(marker){
          return model.get('id') === marker.beaconID
        })
        marker
          ? marker.setAnimation(google.maps.Animation.BOUNCE)
          : window.state.map.getBounds().contains({
              lat: +model.get('lat'),
              lng: +model.get('lng')
            })
              ? window.createMarker(model.attributes)
                .setAnimation(google.maps.Animation.BOUNCE)
              : null
      })
    }
    this.prevCollectionIDs = this.collection.pluck('id')
  },
  updateBeaconListView: function(options){
    var that = this
    window.beaconsListView.children.each(function(view){
      var isSelected = that.collection.some(function(model){
        return model.get('id') === view.model.get('id')
      })
      if((isSelected && !view.isSelected) || (!isSelected && view.isSelected)){
        view.toggleSelected()
      }
    })
    this.setSelectedMarkersBounsing(options)
  },
  clearDemand : function(){
    var models = this.collection.models.filter(function(model){
      return !window.lib.isDemand(model)
    })
    this.collection.set(models)
  },
  clearSupply : function(){
    var models = this.collection.models.filter(function(model){
      return window.lib.isDemand(model)
    })
    this.collection.set(models)
  },
  expandDemand: function(){
    this.index.reset()
    this.filter = function(model){
      return window.lib.isDemand(model)
    }
    this.showCollected()
  },
  expandSupply: function(){
    this.index.reset()
    this.filter = function(model){
      return !window.lib.isDemand(model)
    }
    this.showCollected()
  },
  showCollected: function(){
    this.model.set({
      clipboardTitle: window.localeMsg[window.localeLang].SELECTED_BEACONS,
      isExpanded: true
    })
    window.cardsRegion.$el.hide()
    this.render()
  },
  collapse: function(){
    this.model.set({
      clipboardTitle: window.localeMsg[window.localeLang].CLIPBOARD_TITLE,
      isExpanded: false
    })
    this.filter = function(model){ return false },
    window.cardsRegion.$el.show()
    this.render()
  },
  addBeaconToCollection: function(model){
    this.collection.add(model)
  },
  removeBeaconFromCollection: function (model){
    this.collection.remove(model)
  },
  isShowndBefore: false,
  onRender: function(){
    this.isShowndBefore && this.setWidth()
  },
  initialShow: function(){
    var that = this
    this.$el.show()
    this.setWidth()
    $( window ).on( 'resize', that.setWidth.bind(that));
    $("#right-panel").panel({
      open: that.setWidth.bind(that),
      close: that.setWidth.bind(that),
      beforeclose: function(){
        setTimeout(that.setWidth.bind(that), 100)
      }
    });
    $(":mobile-pagecontainer").on("pagecontainerchange", that.setWidth.bind(that))
    this.isShowndBefore = true
  },
  setWidth: function(){
    window.$innerDiv.outerWidth()
      ? this.$el.outerWidth(window.$innerDiv.outerWidth() - 8)
      : this.$el.outerWidth(this.$el.parent().outerWidth() - 8)
  },
  showFullView: function(id){
    $(".clipboard__full-view").removeClass('empty')
    window.showBeaconFullView({ id: id }, this.fullViewRegion)
  },
  removeFullView: function(){
    this.fullViewRegion.$el.addClass('empty')
    this.fullViewRegion.empty()
  },
  getCollectionIdsListAsString: function(demandOrSupply){
    var selected = _.filter(this.collection.models, function(model){
      return demandOrSupply === 'demand'
        ? window.lib.isDemand(model)
        : demandOrSupply === 'supply'
          ? !window.lib.isDemand(model)
          : false
    })
    return _.map(selected, function(model){
              return model.get('id')
            })
            .join(',')
  },
  linkSelected: function(data){

    $.ajax({
      url: "https://gurtom.mobi/chain_add.php",
      method: "POST",
      dataType: "json",
      data: data,
      crossDomain: true,
      success: function (response) {
        if(response.error){
          alert(window.localeMsg[window.localeLang][response.error])
          return
        } else {
          var dataArray = (data.ask_ids +','+ data.bid_id).split(',')
          window.beaconsListView.children.each(function(view){
            view.setBeaconLinked(dataArray)
          })
          alert(window.localeMsg[window.localeLang].LINK_CREATED_SUCCESSFULLY)
        }
      },
      error: function(){
        alert(window.localeMsg[window.localeLang].CONNECTION_ERROR)
      }
    })
    
  }
})