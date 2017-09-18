'use strict'

var StatItemModel = Backbone.Model.extend({
  initialize: function() {
    var list = this.get("list")
    if(list){
      this.set("list", new ListCollection(list))
    } else {
      this.set("list", null)
    }
  }
});
var ListCollection = Backbone.Collection.extend({
  model: StatItemModel
});
var StatCompositeView = Marionette.CompositeView.extend({
  template: '#stat_item__tpl',
  attributes: function(){
    if(this.model.get('q')){
      return {
        'class': "quantity"
      }
    } else {
      return {
        // 'data-role': "collapsible",
        'data-inset': "true",
        'data-iconpos': "noicon"
      }
    }
  },
  childViewContainer: ".composite",
  initialize: function() {
    this.collection = this.model.get("list");
  },
  filter: function(it){
    return it.get('name') !== ''
  }
});
var StatGeneralView = Marionette.CompositeView.extend({
  template: '#stat_title__tpl',
  className: 'statistic',
  attributes: {
    // 'data-role': "collapsible",
    'data-iconpos': "noicon"
  },
  childView: StatCompositeView,
  childViewContainer: ".composite",
  onRender: function(){
    window.openStatPopup(this)
  }
})
var openStatPopup = function(that){
  var $background = $('#beacons-map')
  that.$el.appendTo('body')
  that.$el.popup({
    transition: "slidedown",
    theme: "a",
    overlayTheme: "b"
  })
  that.$el.one("popupafterclose", function( event, ui ) {
    $background.removeClass('blur')
    that.destroy()
  })
  that.$el.popup('open')
  that.$el.trigger("create")
  $background.addClass('blur')
  var height = $('#beacons-map__the-beacons').height()
  $('.profile .listview_wrapper').css({ "max-height": height*0.7 })
  $('.main.composite').css({ "max-height": height - 20 })
}
$('.stat_icon').click(function(){
  $.mobile.loading('show')
  var promise = $.ajax({
    url: "https://gurtom.mobi/beacon_stat.php?"+ window.state.urlRequest(),
    dataType: "json",
    crossDomain: true
  })
  promise.done(function(response){
    if(response.error){
      alert(window.localeMsg[window.localeLang][response.error])
      return
    } else {
      var collection = new ListCollection(response.msg)
      window.statView = new StatGeneralView({
        collection: collection
      })
      window.statView.render()
    }
  });
  promise.fail(function(response){
    console.log("/beacon_stat.php" + ' request has been failed')
    alert(window.localeMsg[window.localeLang].CONNECTION_ERROR)
  });
  promise.always(function(response){
    $.mobile.loading('hide')
  })
})

