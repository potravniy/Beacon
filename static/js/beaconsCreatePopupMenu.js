
BeaconCreatePopupListItemModel = Backbone.Model.extend({
  defaults: {
    targetId: "",
    name: '',
    img: "//:0"
  }
})
BeaconCreatePopupList = Backbone.Collection.extend({
  model: BeaconCreatePopupListItemModel
})
BeaconCreatePopupItemView = Backbone.Marionette.ItemView.extend({
  template: '#create_beacon_menu_item__tpl',
  tagName: 'li',
  className: function(){
    return 'menu_item '+ (this.model.get('className') || '' ) 
  },
  events: {
    'click .ui-btn': 'btnClick'
  },
  btnClick: function(){
    createObject(this.model.attributes)
  }
})
BeaconCreatePopup = Backbone.Marionette.CompositeView.extend({
  template: '#create_beacon__geo_tpl',
  id: 'create_beacon__geo',
  ui: {
    settings: '.settings',
    listView: '.listview_wrapper > .listview',
    info: '.info'
  },
  events: {
    'click @ui.settings': 'onSettingsClick',
    'resize window': 'onResize'
  },
  childView: BeaconCreatePopupItemView,
  childViewContainer: '.listview',
  collection: new BeaconCreatePopupList(),
  onSettingsClick: function(){
    showChangeGovMenuView()
  },
  initialize: function(options){
    var collection = []
    if( window.getListMenuOrg.isAvailable() ) {
      collection = $.extend([], window.state.listMenuOrg)
    }
    else {
      collection = $.extend([], window.state.listMenu)
    }

    if( !(options.parent_type && options.parent_type === '2') ) {
      collection = _.filter(collection, function(item) {
        return item.type !== '3';   //  Project proposal can be created as object linked to Program object only/
      })
    }

    collection = _.map(collection, function(item){
      return $.extend(item, options)
    })
    this.collection.set(collection)
    window.mainRegion.showMap()
  },
  onDomRefresh: function(){
    if( state.user.gov === '1' || state.user.nco === '1' ) {
      this.ui.settings.show()
      if ( this.collection.length === 0 ) this.ui.info.show()
    }
    this.$el.popup({
      positionTo: "#beacons-map__the-map",
      transition: "slideup",
      theme: "a",
      overlayTheme: "b"
    })
    this.$el.popup('open')
    this.$el.trigger("create")
  },
  onShow: function(){
    this.onResize()
  },
  onResize: function(){
    this.ui.listView.css({ 'max-height': 0.7*window.innerHeight })
  }
})

