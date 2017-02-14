"use strict"
var PopupShareModel = Backbone.Model.extend({
  defaults: {
    header: window.localeMsg[window.localeLang].SHARE_BEACON_WITH +" :"
  }
})

var PopupShareButtons = Backbone.Marionette.ItemView.extend({
  template: '#right_popup__share_tpl',
  templateHelpers: function(){
    return {
      title: encodeURIComponent(this.model.get('title')) 
    }
  }
})

var PopupShareInSocial = Backbone.Marionette.CompositeView.extend({
  template: '#right_popup__component_tpl',
  // model: PopupShareModel,
  initialize: function(options){
    this.model = new PopupShareModel()
    this.collection = new Backbone.Collection([options])
  },
  childView: PopupShareButtons,
  childViewContainer: '.main__right_popup__component',
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