//  Popup add a beacon START

GovItemModel = Backbone.Model.extend({
  defaults: {
    targetId: "",
    name: '',
    icon_url: "//:0"
  }
})
GovListModel = Backbone.Collection.extend({
  model: GovItemModel
})
GovItemView = Backbone.Marionette.ItemView.extend({
  template: '#gov_single_menu_item__tpl',
  tagName: 'li',
  className: function(){
    this.model.set({ icon_url: getIconURL(this.model.attributes) })
    return 'menu_item '+ (this.model.get('className') ? this.model.get('className') : '' ) 
  },
  events: {
    'click .ui-btn': 'btnClick'
  },
  btnClick: function(){
    createObjectLMR(this.model.attributes)
  }
})

GovCreateBeaconView = Backbone.Marionette.CompositeView.extend({
  template: '#create_beacon__geo_tpl',
  id: 'create_beacon__geo',
  ui: {
    settings: '.settings'
  },
  events: {
    'click @ui.settings': 'onSettingsClick'
  },
  childView: GovItemView,
  childViewContainer: '.listview',
  collection: new GovListModel(),
  onSettingsClick: function(){
    console.log('onSettingsClick')
  },
  initialize: function(options){
    var collection = []
    if(window.state.user.gov == 0) collection = _.clone(window.state.listMenu)
    else collection = _.clone(window.state.listMenuLMR)
    collection = _.map(collection, function(item){
      return $.extend(item, options)
    })
    this.collection.set(collection)
  },
  onDomRefresh: function(){
    if( state.user.gov !== '1' ) this.ui.settings.hide()
    this.$el.popup({
      positionTo: "#beacons-map__the-map",
      transition: "slideup",
      theme: "a",
      overlayTheme: "b"
    })
    this.$el.popup('open')
    this.$el.trigger("create")
  },
})

//  Popup add a beacon END


//  Popup beacon status START

StatusModel = Backbone.Model.extend({
  defaults: {
    id: ""
  }
})
PopupStatusBeacon = Backbone.Marionette.ItemView.extend({
  template: '#beacon_status__tpl',
  id: 'beacon-status',
  model: StatusModel,
  ui: {
    confirmBtn: '.status.one',
    landHandBtn: '.status.two',
    solvedBtn: '.status.full',
    deleteBtn: '.status.delete',
    copyBtn: '.status.copy',
    forLMR: '.lmr'
  },
  events: {
    'click @ui.confirmBtn':  'confirm',
    'click @ui.landHandBtn': 'landHand',
    'click @ui.solvedBtn':   'solved',
    'click @ui.deleteBtn':   'delete',
    'click @ui.copyBtn':     'copy'
  },
  confirm:  function(){ console.log('Btn confirm  clicked.') },
  landHand: function(){ console.log('Btn landHand clicked.') },
  solved:   function(){ console.log('Btn solved   clicked.') },
  delete:   function(){ console.log('Btn delete   clicked.') },
  copy:     function(){
    var options = { targetId: this.model.get('id') }
    this.$el.one("popupafterclose", function() {
      window.popupStatusBeaconRegion.empty()
      switchBeaconCreateMenuToLMR(options)
    })
    this.$el.popup('destroy')
  },
  onBeforeShow: function(){
    if(window.state.user.gov > 0) this.ui.forLMR.show()
    else this.ui.forLMR.hide()
  },
  onDomRefresh: function(){
    this.$el.popup({
      positionTo: "#beacons-map__the-beacons",
      transition: "slideup",
      theme: "a",
      overlayTheme: "b"
    })
    this.$el.popup('open')
    this.$el.trigger("create")
  }
})


//  Popup beacon status END

//  Settings of gov beacon create popup START

ChangeGovMenuItemView = Backbone.Marionette.ItemView.extend({
  template: '#change_gov_menu_item__tpl',
  templateHelpers: function () {
    var url = getIconURL(this.model.attributes)
    return { icon_url: url }
  },
  ui: {
    btnIcon: '.change_gov_menu__icon',
    btnDel: '.change_gov_menu__delete_item' 
  },
  events: {
    'click @ui.btnIcon': 'icon',
    'click @ui.btnDel': 'delete'
  },
  icon: function(){
    console.log('icon')
  },
  delete: function(){
    console.log('delete')
  }

})
ChangeGovMenuView = Backbone.Marionette.CompositeView.extend({
  template: '#change_gov_menu__tpl',
  className: 'change_gov_menu',
  attributes: {
    "data-role": "content"
  },
  childView: ChangeGovMenuItemView,
  childViewContainer: '.listview',
  initialize: function(){
    this.collection = new Backbone.Collection(state.listMenuLMR)
  },
  onShow: function(){
    this.$el.trigger('create')
  },
  ui: {
    btnAdd: '.add',
    btnSave: '.save' 
  },
  events: {
    'click @ui.btnAdd': 'add',
    'click @ui.btnSave': 'save'
  },
  add: function(){
    console.log('add')
  },
  save: function(){
    console.log('save')
  }

})


//  Settings of gov beacon create popup END

//  Controller

window.govCreateBeaconRegion = new Backbone.Marionette.Region({el: "#create_beacon__geo_region"})
window.popupStatusBeaconRegion = new Backbone.Marionette.Region({el: "#beacon-status__region"})

function switchBeaconCreateMenuToLMR(options) {
  window.govCreateBeaconView = new GovCreateBeaconView(options)
  window.govCreateBeaconRegion.show(window.govCreateBeaconView)
}

function showPopupStatusBeacon(options) {
  window.model = new StatusModel(options)
  window.popupStatusBeacon = new PopupStatusBeacon({
    model: model
  })
  window.popupStatusBeaconRegion.show(window.popupStatusBeacon)
}

function showChangeGovMenuView() {
  window.changeGovMenuView = new ChangeGovMenuView();
  window.rightRegion.show(window.changeGovMenuView);
}
