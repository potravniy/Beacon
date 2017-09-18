
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
  templateHelpers: function(){
    return {
      title: this.title
    }
  },
  initialize: function(options){
    var collection
    this.title = window.localeMsg[window.localeLang].CREATE_BEACON
    if(window.state.listMenuOrg) {
      collection = $.extend([], window.state.listMenuOrg)
    } else if(!options || _.isEmpty(options)){
      collection = $.extend([], window.state.listMenu)
    } else {
      collection = _.filter(window.state.listMenu, function(it){
        return !window.lib.areInSameCategory(it, options)
      })
      this.title = window.localeMsg[window.localeLang].CREATE_LINKED_BEACON
    }
    this.collection.set(collection)
    if ( options.b_id && options.type ){
      this.canCopy = _.some(collection, function(item){
        return item.type === options.type
      }) 
    } else {
      this.canCopy = true
    }
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
        alert(window.localeMsg[window.localeLang].YOU_DO_NOT_HAVE_APPROPRIATE_LAYER +'"'+ window.lib.bType.getName( that.options.type ) + '"')
      });
    }
  },
  onResize: function(){
    this.ui.listView.css({ 'max-height': 0.7*window.innerHeight })
  }
})

