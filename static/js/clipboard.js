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
    isExpanded: false,
    isLinking: false
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
    this.linkingParentRegion = new Backbone.Marionette.Region({el: ".linking_parent__region"})
  },
  templateHelpers: function(){
    return {
      help: window.localeMsg[window.localeLang].LINKING_HELP
    }
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
    'click .ui-icon-close': 'collapse',
    'click .make_link': 'toLink'
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
    this.model.get('isLinking')
      ?  this.$el.addClass('linking')
      :  this.$el.removeClass('linking')
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
          : window.createMarker(model.attributes)
            .setAnimation(google.maps.Animation.BOUNCE)
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
    this.model.set({
      clipboardTitle: window.localeMsg[window.localeLang].SELECTED_BEACONS,
      isExpanded: true,
    })
    this.index.reset()
    this.filter = function(model){
      return window.lib.isDemand(model)
    }
    this.showCollected()
  },
  expandSupply: function(){
    this.model.set({
      clipboardTitle: window.localeMsg[window.localeLang].SELECTED_BEACONS,
      isExpanded: true,
    })
    this.index.reset()
    this.filter = function(model){
      return !window.lib.isDemand(model)
    }
    this.showCollected()
  },
  expandLinking: function(clickedModel){
    this.model.set({
      clipboardTitle: window.localeMsg[window.localeLang].CREATE_LINK_QUESTION,
      isLinking: true,
      linkingParentModel: clickedModel
    })
    this.index.reset()
    this.filter = function(model){
      var authorship = window.lib.isDemand(model)
          ? true
          : window.lib.isAuthor(model)
      return !window.lib.areInSameCategory(clickedModel, model) && authorship
    }
    this.showCollected()
  },
  showCollected: function(){
    window.cardsRegion.$el.hide()
    this.render()
  },
  collapse: function(){
    this.model.set({
      clipboardTitle: window.localeMsg[window.localeLang].CLIPBOARD_TITLE,
      isExpanded: false,
      isLinking: false,
      linkingParentModel: null
    })
    this.filter = function(model){ return false },
    this.linkingParentRegion.reset()
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
    this.linkingParentRegion.reset()
    if(this.model.get('isLinking')){
      var view = new BeaconView({model: this.model.get('linkingParentModel')})
      this.linkingParentRegion.show(view)
    }
  },
  initialShow: function(){
    var that = this
    this.$el.show()
    this.setWidth = this.setWidth.bind(this)
    this.setWidth()
    $( window ).on( 'resize', function(){
      that.setWidth()
      that.safariFix()
    });
    $("#right-panel").panel({
      open: function(){
        that.setWidth()
        that.safariFix()
      },
      close: that.setWidth,
      beforeclose: function(){
        setTimeout(that.setWidth, 100)
      }
    });
    $(":mobile-pagecontainer").on("pagecontainerchange", that.setWidth.bind(that))
    this.isShowndBefore = true
  },
  setWidth: function(){
    window.$innerDiv && window.$innerDiv.outerWidth() > 16  //  "> 16" : Safari bug fixer
      ? this.$el.outerWidth(window.$innerDiv.outerWidth() - 8)
      : this.$el.outerWidth(this.$el.parent().outerWidth() - 8)
    !window.$innerDiv && $('#clipboard-region').hide()
  },
  safariFix: function(){
    var that = this
    setTimeout(function(){
      if(beaconsListView && !beaconsListView.isDestroyed && beaconsListView.collection.length > 0){
        var model = beaconsListView.collection.find(function(model){
          return !that.collection.contains(model)
        })
        that.collection.add(model)
        that.collection.remove(model)
        $('#cards-region').scrollTop(2)
        $('#cards-region').scrollTop(0)
      }
    }, 100)
  },
  showFullView: function(id){
    $(".clipboard__full-view").removeClass('empty')
    window.showBeaconFullView({ id: id }, this.fullViewRegion)
  },
  removeFullView: function(){
    this.fullViewRegion.$el.addClass('empty')
    this.fullViewRegion.empty()
  },
  getCollectionDemandOrSupply: function(demandOrSupply){
    return _.filter(this.collection.models, function(model){
      return demandOrSupply === 'demand'
        ? window.lib.isDemand(model)
        : demandOrSupply === 'supply'
          ? !window.lib.isDemand(model)
          : false
    })
  },
  getLinkableCollection(clickedModel){
    return this.collection.filter(function(model){
      var authorship = window.lib.isDemand(model)
          ? true
          : window.lib.isAuthor(model)
      return !window.lib.areInSameCategory(clickedModel, model) && authorship
    })
  },
  toLink: function(){
    var that = this
    var linkingCollection = this.collection.filter(this.filter)
    if(linkingCollection.length === 0){
      alert("Nothing to link!")
      this.collapse()
      return
    }
    var linkingParentModel = this.model.get('linkingParentModel')
    if(window.lib.isDemand(linkingParentModel)) {
      var data = {
        ask_ids: linkingParentModel.get('id')
      }
      var linking = _.map(linkingCollection, function(supply){
        data.bid_id = supply.get('id')
        return linkIt(data, false)
      })
      $.when.apply(this, linking).then(function(){
        alert(window.localeMsg[window.localeLang].LINK_CREATED_SUCCESSFULLY)
        that.collapse()
      })
    } else {
      data = {
        bid_id: linkingParentModel.get('id'),
        ask_ids:  _.map(linkingCollection, function(model){
                    return model.get('id')
                  })
                  .join(',')
      }
      linkIt(data, true)
    }

    function linkIt(data, displaySuccessAlert){
      return $.ajax({
        url: "https://gurtom.mobi/chain_add.php",
        method: "POST",
        dataType: "json",
        data: data,
        crossDomain: true,
        success: function (response) {
          if(response.error){
            alert(window.localeMsg[window.localeLang][response.error])
            that.collapse()
            return
          } else {
            var dataArray = (data.ask_ids +','+ data.bid_id).split(',')
            window.beaconsListView.children.each(function(view){
              view.setBeaconLinked(dataArray)
            })
            displaySuccessAlert &&
            alert(window.localeMsg[window.localeLang].LINK_CREATED_SUCCESSFULLY) &&
            that.collapse()
          }
        },
        error: function(){
          alert(window.localeMsg[window.localeLang].CONNECTION_ERROR)
          that.collapse()
        }
      })
    }
  }
})