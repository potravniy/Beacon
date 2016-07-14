GovItemModel = Backbone.Model.extend({
  defaults: {
    id: "0",
    name: '',
    img: "//:0"
  }
})
GovItemListModel = Backbone.Collection.extend({
  model: GovItemModel,
  url: "https://gurtom.mobi/beacon_list_layers.php"
})
GovCreateSingleView = Backbone.Marionette.ItemView.extend({
  template: '#gov_single_menu_item__tpl',
  tagName: 'li',
  className: 'menu_item'
})
govItemListModel = new GovItemListModel()
GovCreateBeaconView = Backbone.Marionette.CompositeView.extend({
  template: '#gov_create_beacon',
  className: 'gov',
  childView: GovCreateSingleView,
  childViewContainer: '.listview',
  collection: govItemListModel,
  initialize: function(){
    this.collection.fetch();
  },
  onDomRefresh: function(){
    this.$el.trigger("create")
  },
})





//  Controller

window.govCreateBeaconRegion = new Backbone.Marionette.Region({el: "#create_beacon__geo"})


function switchBeaconCreateMenuToLMR() {
  console.log('gov')
  window.govCreateBeaconView = new GovCreateBeaconView()
  window.govCreateBeaconRegion.show(window.govCreateBeaconView)
}