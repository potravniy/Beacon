"use strict"

// Profile's old link:  https://gurtom.mobi/main.html#profile-page

var AddressView = Backbone.Marionette.ItemView.extend({
  template: "",

})
var ProfilePopupView = Backbone.Marionette.CompositeView.extend({
  template: '#profile_popup__tpl',
  className: 'profile',
  childView:
  initialize: function(){
    this.collection = new Backbone.Collection(window.state.user.adr)
  },
  templateHelpers: function(){
    return {
      avatarSrc: window.state.user.avatar,
      name: window.state.user.user_first +' '+ window.state.user.user_last,
      email: window.state.user.email,
      login: window.state.user.login,
      id: window.state.user.id
    }
  },
  onDomRefresh: function(){
    var that = this
    this.$el.popup({
      positionTo: "body",
      transition: "turn",
      theme: "a",
      overlayTheme: "b"
    })
    this.$el.one("popupafterclose", function( event, ui ) {
      $('#beacons-map').removeClass('blur')
      that.destroy()
    })
    this.$el.popup('open')
    this.$el.trigger("create")
    $('#beacons-map').addClass('blur')
  },

})