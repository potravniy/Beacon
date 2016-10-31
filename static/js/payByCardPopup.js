"use strict"
var PopupModel = Backbone.Model.extend({
  defaults: {
    header: "",
    html_response: ''
  }
})
var PayByCardView = Backbone.Marionette.ItemView.extend({
  template: '#right_popup__component_tpl',
  id: 'pay_by_card',
  ui: {
    'mainDiv': '.main__right_popup__component'
  },
  initialize: function(param){
    this.model = new PopupModel(param)
  },
  onBeforeShow: function(){
    if( this.model.get('html_response') ){
      var html = '<p>Натиснувши на зелену кнопку "PAY", Ви перейдете на сайт www.liqpay.com для пожертвування коштів. Будьте готові ввести дані банківської картки.</p>'
      html += this.model.get('html_response')
      this.ui.mainDiv.html(html)
    }
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
