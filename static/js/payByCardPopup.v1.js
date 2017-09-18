"use strict"

var PopupModel = Backbone.Model.extend({
  defaults: {
    header: window.localeMsg[window.localeLang].DONATION,
    welcome: window.localeMsg[window.localeLang].PRESSING_BUTTON_PAY_YOU_WILL_BE_REDIRECTED_TO_PAYING_SYSTEM_LIQPAY,
    pay: window.localeMsg[window.localeLang].DONATE,
    url: ''
  }
})

var PayByCardView = Backbone.Marionette.ItemView.extend({
  template: '#right_popup__component_tpl',
  id: 'pay_by_card',
  ui: {
    payBtn: '#btn_pay'
  },
  events: {
    'click @ui.payBtn': 'openLiqpayPage'
  },
  initialize: function(param){
    this.model = new PopupModel(param)
  },
  openLiqpayPage: function(){
    $.mobile.loading('show')
    var that = this,
        msg = this.model.get('msg') || window.localeMsg[window.localeLang].THANKS_FOR_DONATE
    window.liqpay = window.open(this.model.get('url'))
    var id = setInterval(function(){
      try {
        if(window.liqpay.location && window.liqpay.location.href === "https://gurtom.mobi/sn/lp_responce.php"){
          if(window.lib.isJson(window.liqpay.document.body.innerHTML)){
            clearInterval(id)
            var response = JSON.parse(window.liqpay.document.body.innerHTML)
            if(_.contains(response.url.split('/'), 'success')){
              $.mobile.loading('hide')
              window.liqpay.close()
              that.exit()
              alert(msg)
            } else {
              $.mobile.loading('hide')
              console.log("NOT SUCCESS")
              window.liqpay.close()
              that.exit()
            }
          }
        } else if(window.liqpay.closed){
          clearInterval(id)
          console.log("CLOSED")
          $.mobile.loading('hide')
          that.$el.popup('close')
        }
      } catch(e) {
        if(window.liqpay.closed){
          clearInterval(id)
          console.log("CLOSED")
          $.mobile.loading('hide')
          that.exit()
        }
      }
    }, 200)
  },
  exit: function(){
    this.$el.popup('close')
    $.mobile.loading('show')
    window.beaconFullViewModel
      .fetch()
      .done(function(){
        showFullView()
      })
      .always(function(){
        $.mobile.loading('hide')
      })
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
