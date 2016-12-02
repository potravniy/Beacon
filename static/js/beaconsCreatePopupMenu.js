
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
  templateHelpers: function(){
    var obj = {
      disabled: this.options.type ? ( this.model.get('type') === this.options.type ? '' : ' disabled' ) : ''   
    }
    return obj
  },
  tagName: 'li',
  className: function(){
    return 'menu_item '+ (this.model.get('className') || '' ) 
  },
  ui: {
    btn: '.ui-btn'
  },
  events: {
    'click @ui.btn': 'btnClick'
  },
  btnClick: function(){
    createObject(this.model.attributes, this.options)
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
    'click .settings': 'onSettingsClick',
    'resize window': 'onResize'
  },
  childView: BeaconCreatePopupItemView,
  childViewContainer: '.listview',
  childViewOptions: function(){
    return this.options
  },
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
    if ( options.b_id && options.type ){
      this.canCopy = _.some(collection, function(item){
        return item.type === options.type
      }) 
    } else {
      this.canCopy = true
    }
    // if( !(options.parent_type && options.parent_type === '2') ) {
    //   collection = _.filter(collection, function(item) {
    //     return item.type !== '3';   //  Project proposal can be created as object linked to Program object only/
    //   })
    // }

    // collection = _.map(collection, function(item){
    //   return $.extend(item, options)
    // })
    this.collection.set(collection)
    // window.mainRegion.showMap()
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
    var that = this
    if ( !this.canCopy ) {
      this.$el.one("popupafteropen", function( event, ui ) {
        alert('Ви не маєте шару з типом "' + window.lib.bType.getName( that.options.type ) + '"')
      });
    }
  },
  onResize: function(){
    this.ui.listView.css({ 'max-height': 0.7*window.innerHeight })
  }
})

