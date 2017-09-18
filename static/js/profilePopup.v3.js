"use strict"

// Profile's old link:  https://gurtom.mobi/main.html#profile-page

var FundsHistoryItemModel = Backbone.Model.extend({
  defaults: {
    amount: 0,
    corr_fund_id: 0,
    corr_id: 0,
    corr_type: 0,
    cur: 0,
    id: 0,
    returnable: 0,
    title: '',
    ts: ''
  }
})

var FundsHistoryItemCollection = Backbone.Collection.extend({
  model: FundsHistoryItemModel,
})

var FundsHistoryItemView = Backbone.Marionette.ItemView.extend({
  template: '#funds_history_item_view',
  modelEvents: {
    'change': 'onModelChange'
  },
  onModelChange: function(){
    this.render()
  }
})

var FundsHistoryView = Backbone.Marionette.CompositeView.extend({
  template: '#funds_history_view',
  templateHelpers: function(){
    var that = this
    var fund = _.find(window.state.user.funds, function(fund){
      return fund.id === that.model.get('fund_id')
    })
    return {
      fundName: fund && fund.fund_name
        ? '"'+ fund.fund_name +'"'
        : 'id:'+ that.model.get('fund_id'),
      collectionLength: this.collection.length
    }
  },
  className: 'fund-history',
  childView: FundsHistoryItemView,
  childViewContainer: ".history__list",
  initialize: function(options){
    this.model = new Backbone.Model({
      fund_id: options.fund_id
    })
    var list = _.filter(options.list, function(it){
      return it.corr_type !== 0 && it.corr_id !== 0
    })
    list = list.map(function(it){
      var row = _.clone(it)
      row.amount = Math.abs(it.amount).toFixed(2)
      row.curr = window.lib.currency.getName(it.cur)
      row.title = window.lib.htmlEntityDecode(it.title)
      row.btnTitle = it.returnable > 0
        ? window.localeMsg[window.localeLang].WITHDRAW
        : ''
      row.action = it.amount > 0
        ? window.localeMsg[window.localeLang].INCOME
        : window.localeMsg[window.localeLang].OUTCOME
      row.pretitle = _.findKey(window.data, function(el){
        return el === it.corr_type.toString()
      }) +" cardID="+ it.beacon_id
      return row
    })
    this.collection = new FundsHistoryItemCollection(list)
  },
  events: {
    'click .funds_history__withdraw': function(e){
      console.log('data-id:', e.target.getAttribute("data-id"))
      $.mobile.loading('show')
      var that = this
      var promise = $.ajax({
        type: "POST",
        url: "https://gurtom.mobi/fund_return.php",
        dataType: "json",
        crossDomain: true,
        data: {
          id: e.target.getAttribute("data-id")
        }
      })
      promise.done(function(response){
        if(response.error){
          alert(window.localeMsg[window.localeLang][response.error])
          return
        } else {
          console.log('fund_return.php responce:', response)
          that.withdraw(response)
        }
      });
      promise.fail(function(response){
        console.log("https://gurtom.mobi/fund_return.php" + ' request has been failed')
        alert(window.localeMsg[window.localeLang].CONNECTION_ERROR)
      });
      promise.always(function(response){
        $.mobile.loading('hide')
      })
    }
  },
  withdraw: function(resp){
    var model = this.collection.get(resp.old_history_item.id)
    model.set('returnable', resp.old_history_item.returnable)
    this.collection.set(model, {remove: false})
    var newModel = new FundsHistoryItemModel(resp.new_history_item)
    this.collection.unshift(newModel)
    window.state.user.funds = _.map(window.state.user.funds, function(it){
      if(it.id === resp.user_fund.id) it.saldo = resp.user_fund.saldo
      return it
    })
    if(
      window.beaconFullView
      && +window.beaconFullView.model.get('b_id') === resp.full_view.beacon_id
    ){
      try {
        var contribution = beaconFullView.extention.currentView.contribution.currentView.collection
        var funds = beaconFullView.extention.currentView.funds.currentView.collection
      } catch (error) {
        return
      }
      if(funds.length > 0){
        funds = funds.map(function(it){
          if(it.get('id') === resp.full_view.fund.id){
            it.set('saldo', resp.full_view.fund.saldo)
          }
          return it
        })
      }
      if(contribution.length > 0){
        contribution = contribution.map(function(it){
          if(it.get('id') === resp.full_view.my_donation.id){
            it.set('saldo', resp.full_view.my_donation.saldo)
          }
          return it
        })
      }
    }
  },
  onRender: function(){
    if(this.isAttached) return
    var that = this,
        $background = $('#beacons-map')
    this.$el.appendTo('body')
    this.isAttached = true
    this.$el.popup({
      transition: "slidedown",
      theme: "a",
      overlayTheme: "b"
    })
    this.$el.one("popupafterclose", function( event, ui ) {
      $background.removeClass('blur')
      that.destroy()
      window.showProfile()
    })
    this.$el.popup('open')
    this.$el.trigger("create")
    $background.addClass('blur')
    var height = $('#beacons-map__the-beacons').height() - 44
    $('.history__list').css({ "max-height": height })
  }
})

var ReplanishmentInput = Backbone.Marionette.ItemView.extend({
  template: '#replanishement_amount-popup',
  className: function(){
    return 'fund' + this.model.get('id')
  },
  onDomRefresh: function(){
    var screen = $('.replanishement_amount__screen')
    screen.parents().eq(2).prepend(screen)
    screen.css({
      'height': 2 * window.innerHeight,
      'width': 2 * window.innerWidth
    })
  },
  onDestroy: function(){
    this.$el.parent().hide()
  }
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
      var that = this
      var fundID = e.target.getAttribute("data-id")
      var model = new Backbone.Model({id: fundID})
      var amountView = new ReplanishmentInput({model: model})
      this.addRegion('fund', '.replanishement_amount-popup.'+ fundID)
      this.getRegion('fund').show(amountView)
      $('.replanishement_amount-popup.'+ fundID).show()
    },
    'click .replanishement_amount__screen': function(){
      this.closeReplanishPopup()
    },
    'click .replenish__amount': function(e){
      var fundId = parseInt(e.target.getAttribute("data-id"))
      var currency = _.find(window.state.user.funds, function(fund){
        return fund.id === fundId
      }).currency
      if(currency < 100 || currency > 999){
        this.emitVirtualCurrency(fundId)
      } else {
        this.replanishFund(fundId)
      }
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
          window.state.user.funds.push(response.new_fund)
          that.showFundList()
          $('.new_fund_name').val('')
        }
      });
      promise.fail(function(response){
        console.log("https://gurtom.mobi/fund_user_add.php" + ' request has been failed')
        alert(window.localeMsg[window.localeLang].CONNECTION_ERROR)
      });
      promise.always(function(response){
        $.mobile.loading('hide')
      })
    },
    'click .saldo_wrapper': function(e){
      var that = this
      var fundID = e.target.getAttribute("data-id")
      $.mobile.loading('show')
      var promise = $.ajax({
        url: "https://gurtom.mobi/fund_user_cf.php?fund_id="+ fundID,
        dataType: "json",
        crossDomain: true
      })
      promise.done(function(response){
        if(response.error){
          alert(window.localeMsg[window.localeLang][response.error])
          return
        } else {
          that.$el.one("popupafterclose", function( event, ui ) {
            that.destroy()
            window.showFundHistory(response)
          })
          that.$el.popup('close')
          console.log('fund_'+ fundID +' history:', response)
        }
      });
      promise.fail(function(response){
        console.log("https://gurtom.mobi/fund_user_cf.php" + ' request has been failed')
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
  },
  closeReplanishPopup: function(){
    $('.replanishement_amount__screen').remove()
    this.fund.currentView.destroy()
    this.removeRegion("fund")
  },
  replanishFund: function(fundId){
    $.mobile.loading('show')
    var that = this
    var promise = $.ajax({
      type: "POST",
      url: "https://gurtom.mobi/sn/create_donate_user_fund.php",
      dataType: "json",
      crossDomain: true,
      data: {
        fund_id: fundId,
        amount: $('#replanishement_amount'+ fundId).val()
      }
    })
    promise.done(function(response){
      if(response.error){
        alert(window.localeMsg[window.localeLang][response.error])
        return
      } else {
        var props = {
          header: window.localeMsg[window.localeLang].REPLENISHMENT,
          welcome: window.localeMsg[window.localeLang].PRESSING_BUTTON_REPLENISH_YOU_WILL_BE_REDIRECTED_TO_PAYING_SYSTEM_LIQPAY,
          pay: window.localeMsg[window.localeLang].REPLENISH,
          url: response.url,
          msg: window.localeMsg[window.localeLang].REPLENISHED
        }
        that.closeReplanishPopup()
        that.$el.one("popupafterclose", function( event, ui ) {
          window.showLiqpayReplenishPopup(props)
        })
        that.$el.popup('close')
      }
    });
    promise.fail(function(response){
      console.log("sn/create_donate_user_fund.php" + ' request has been failed')
      alert(window.localeMsg[window.localeLang].CONNECTION_ERROR)
    });
    promise.always(function(response){
      $.mobile.loading('hide')
    })
    // this.closeReplanishPopup()
  },
  emitVirtualCurrency: function(fundId){
    $.mobile.loading('show')
    var that = this
    var promise = $.ajax({
      type: "POST",
      url: "https://gurtom.mobi/sn/currency_emission.php",
      dataType: "json",
      crossDomain: true,
      data: {
        fund_id: fundId,
        amount: $('#replanishement_amount'+ fundId).val()
      }
    })
    promise.done(function(response){
      if(response.error){
        alert(window.localeMsg[window.localeLang][response.error])
        return
      } else {
        var fundUp = response.fund_updated
        var success = _.some(window.state.user.funds, function(fund, i){
          if(fund.id === fundUp.fund_id){
            window.state.user.funds[i].saldo = fundUp.saldo
            return true
          }
          return false
        })
        if(!success){
          console.log('currency_emission.php returned nonexisting fund_id')
        }
        that.showFundList()
      }
    });
    promise.fail(function(response){
      console.log("currency_emission.php" + ' request has been failed')
      alert(window.localeMsg[window.localeLang].CONNECTION_ERROR)
    });
    promise.always(function(response){
      $.mobile.loading('hide')
    })
    this.closeReplanishPopup()
  }
})