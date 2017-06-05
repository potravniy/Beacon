"use strict"

// Profile's old link:  https://gurtom.mobi/main.html#profile-page

var AddressView = Backbone.Marionette.ItemView.extend({
  template: ""
})
var ProfilePopupView = Backbone.Marionette.LayoutView.extend({
  template: '#profile_popup__tpl',
  className: 'profile',
  regions: {
    avatar: '.avatar',
    authLevels: '.auth-levels',
    addresses: '.addresses',
    funds: '.my-funds',
    addFund: '.my-new-fund tbody'
  },
  initialize: function(){
    this.collection = new Backbone.Collection(window.state.user.adr)
  },
  events: {
    'click .replenish': function(e){
      console.log('fund id:', e.target.getAttribute("data-id"))
    },
    'click .add_fund__btn': function(){
      $.mobile.loading('show')
      var that = this
      var promise = $.ajax({
        type: "POST",
        url: "https://gurtom.mobi/fund_user_add.php",
        dataType: "json",
        crossDomain: true,
        data: {
          currency: $('.new_currency #currency_only__select').val(),
          fund_name: $('.new_fund_name').val()
        }
      })
      promise.done(function(response){
        if(response.error){
          alert(window.localeMsg[window.localeLang][response.error])
          return
        } else {
          console.log(response.new_fund)
          window.state.user.funds.push(response.new_fund)
          that.showFundList()
          $('.new_fund_name').val('')
        }
      });
      promise.fail(function(response){
        alert(window.localeMsg[window.localeLang].CONNECTION_ERROR)
      });
      promise.always(function(response){
        $.mobile.loading('hide')
      })
    }
  },
  onRender: function(){
    var that = this,
        $background = $('#beacons-map')
    this.$el.appendTo('body')
    this.showFundList()
    this.$el.popup({
      transition: "slidedown",
      theme: "a",
      overlayTheme: "b"
    })
    this.$el.one("popupafterclose", function( event, ui ) {
      $background.removeClass('blur')
      that.destroy()
    })
    this.$el.popup('open')
    this.$el.trigger("create")
    $background.addClass('blur')
    var height = $('#beacons-map__the-beacons').height()*0.7
    $('.profile .listview_wrapper').css({ "max-height": height })
  },
  showFundList: function(){
    var options = {
      label: window.localeMsg[window.localeLang].YOUR_FUNDS,
      collection: _.map(window.state.user.funds, function(item){
        return {
          id: item.id,
          fund_name: item.fund_name,
          curr: item.currency,
          saldo: item.saldo,
          withdrawable: false,
          replenishable: true
        }
      })
    }
    var model = new FundsLabelModel(options)
    var View = FundsListView.extend({
      model: model
    })
    this.showChildView('funds', new View())
  }
})