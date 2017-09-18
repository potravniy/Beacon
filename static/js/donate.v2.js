"use strict"
var DonateModel = Backbone.Model.extend({
  defaults: {
    header_title: '',
    subtitle: '',
    details: '',
    id: '0',
    type: ''
  }
})
var CheckboxView = Backbone.Marionette.ItemView.extend({
  template: '#checkbox__tpl',
  initialize: function(param){
    this.model = new Backbone.Model(param)
  },
  templateHelpers: function(){
    return this.model.attributes
  },
  ui: {
    'input': '.checkbox' 
  },
  events: {
    'change @ui.input': function(){
      if(this.ui.input.prop("checked")){
        this.ui.input.val('0')
      } else {
        this.ui.input.val('1')
      }
    }
  }
})
var EmailInputView = Backbone.Marionette.ItemView.extend({
  template: '#email_input__tpl',
  id: 'email_input__wrapper',
  initialize: function(options){
    this.model = new Backbone.Model(options)
    if(this.model.get('hidden')) this.$el.hide()
    if(!this.model.get('email')) this.model.set('email', '')
  },
})
var FundslOptionView = Backbone.Marionette.ItemView.extend({
  template: '#option__tpl',
  tagName: 'option',
  attributes: function(){
    var attrib = {}
    if(this.model.get('id') !== -1){
      attrib = {
        "value": this.model.get('id'),
        "selected": false 
      }
    }
    return attrib
  }
})
var UserFundslView = Backbone.Marionette.CompositeView.extend({
  template: '#select_menu__tpl',
  attributes: {
    'data-iconpos': "noicon"
  },
  childViewContainer: "#options__select",
  childView: FundslOptionView,
  ui: {
    select: '#options__select',
    input: '#options'
  },
  events: {
    'change @ui.select': function(){
      var oldVal = this.ui.input.val()
      var newVal = this.ui.select.val()
      if(newVal==='0' && oldVal!=='0') this.triggerMethod('card:selected')
      if(oldVal==='0' && newVal!=='0') this.triggerMethod('card:deselected')
      this.ui.input.val(newVal)
      if(newVal==='0'){
        this.triggerMethod('currency:deselected')
      } else {
        var curr = _.find(window.state.user.funds, function(item){
          return item.id == newVal
        })
        this.triggerMethod('currency:selected', curr.currency)
      }
    }
  },
  initialize: function(){
    this.model = new Backbone.Model({
      title: window.localeMsg[window.localeLang].CHOOSE_FUND,
      required: 'required',
      label: window.localeMsg[window.localeLang].FUNDS,
      inputName: 'fund_id',
      multi: false
    })
    var first = [{
      id: -1,
      optext: this.model.get('label')
    }]
    var fundsArray = _.map(window.state.user.funds, function(item){
      var code = ''
      switch (item.l_code) {
        case 'ICAN':
          code = '  '+ item.l_code     // 2*&nbsp
          break;
        case 'USD':
          code = '   '+ item.l_code    // 3*&nbsp
          break;
        case 'EUR':
          code = '   '+ item.l_code    // 3*&nbsp
          break;
        case 'UAH':
          code = '   '+ item.l_code    // 3*&nbsp
          break;
        case 'vUAH':
          code = ' '+ item.l_code      // 1*&nbsp
          break;
      }
      return {
        id: item.id,
        optext: item.saldo + code
      }
    })
    var last = [{
      id: 0,
      optext: window.localeMsg[window.localeLang].BANK_CARD
    }]
    this.collection = new Backbone.Collection( _.union(first, fundsArray, last) )
  },
  alignTextCollectionView: function(){
    $("#options__select-menu .ui-btn").css({"text-align": "right"})
    $("#options__select-menu .ui-last-child .ui-btn").css({"text-align": "center"})
  }
})
//  donate knows:
// fund_id: int,
// currency: int
// amount: int
// type: int // 2 - program, 3 - projet program, 4 - procejt, 5 - request,
// id: int // id of type above
// open: bool  //  anonimous = 0, known = 1
// link: fund_add_by_type.php


var DonateView = Backbone.Marionette.LayoutView.extend({
  template: '#donate_tpl',
  templateHelpers: function(){
    switch (+this.model.get('type')) {
      case 2:
        return {subtitle: window.localeMsg[window.localeLang].ON_PROGRAMM +' '}
      case 3:
        return {subtitle: window.localeMsg[window.localeLang].ON_PROJECT_PROPOSAL +' '}
      case 4:
        return {subtitle: window.localeMsg[window.localeLang].ON_PROJECT +' '}
      case 5:
        return {subtitle: window.localeMsg[window.localeLang].ON_REQUEST +' '}
    }
  },
  id: 'donate__wrapper',
  className: 'css__create_form',
  attributes: {
    "data-role": "content"
  },
  regions: {
    email: '.wrapper__email',
    money: '.wrapper__money',
    checkbox: '.wrapper__checkbox',
    fund: '.wrapper__funds'
  },
  ui: {
    submitBtn: '#submit_btn',
    form: '#donate__form',
    closeBtn: '.header .close'
  },
  events: {
    'click @ui.submitBtn': 'send',
    'click @ui.closeBtn': 'close'
  },
  childEvents: {
    'card:selected': function(){
      this.checkbox.currentView.$el.hide()
    },
    'card:deselected': function(){
      this.checkbox.currentView.$el.show()
    },
    'currency:deselected': function(){
      this.money.currentView.unlockCurrencySelector()
    },
    'currency:selected': function(view, opt){
      this.money.currentView.setAndLockCurrencySelector(opt)
    }
  },
  initialize: function(){
    if(window.state.user.id) {
      this.model.set('header_title', window.localeMsg[window.localeLang].DONATION)
    } else {
      this.model.set('header_title', window.localeMsg[window.localeLang].ANONIMOUS_DONATION)
    }
  },
  onBeforeShow: function(){
    var model = null,
        view = null
    model = {
      'required': 'required',
      'label': window.localeMsg[window.localeLang].DONATION_AMOUNT,
      'realCurrencyOnly': !window.state.user.id
    }
    view = new MoneyView({ model: new Backbone.Model(model) })
    this.showChildView('money', view)

    if (window.state.user.id) {
      model = {
        checkBoxName: 'open',
        label: window.localeMsg[window.localeLang].DONATE_ANONIMOUSLY
      }
      this.showChildView('checkbox', new CheckboxView(model))
      this.showChildView('fund', new UserFundslView())
      model = {
        'required': 'required',
        'email': window.state.user.email,
        'hidden': true
      }
      this.showChildView('email', new EmailInputView( model ))
    } else {
      model = { 'required': 'required' }
      this.showChildView('email', new EmailInputView( model ))
    }
  },
  onShow: function(){
    this.$el.trigger('create')
    if(this.fund.currentView) this.fund.currentView.alignTextCollectionView()
  },
  send: function(){
    var formData = _.reduce(this.ui.form.serializeArray(), function(obj, item) {
      obj[item.name] = item.value;
      return obj;
    }, {})
    if(!this.verifyInputs(formData)) return
    var url
    if ( window.state.user.id && this.fund.currentView.ui.input.val()!=='0') {
      url = 'fund_add_by_type.php'
      delete formData.email
     } else {
      url = 'sn/create_donate_btn.php'
      delete formData.fund_id
    }
    $.mobile.loading('show')
    var that = this
    var promise = $.ajax({
      type: "POST",
      url: url,
      dataType: "json",
      xhrFields: { withCredentials: true },
      crossDomain: true,
      data: formData
    })
    promise.done(function( response ){
      if(response.error){
        alert(window.localeMsg[window.localeLang][response.error])
        return
      }
      if(response.url){
        showPayByCardView({
          url: response.url
        })
      } else {
        window.state.user.funds = _.map(window.state.user.funds, function(fund){
          if(fund.id == response.user_fund_id){
            fund.saldo = response.user_fund_saldo
          }
          return fund
        })
        window.showBeaconFullView({ id: +that.model.get('beaconID') })
        alert(window.localeMsg[window.localeLang].THANKS_FOR_DONATE)
      }
    })
    promise.fail(function(response){
      console.log(url + ' request has been failed')
      alert( window.localeMsg[window.localeLang].CONNECTION_ERROR )
    })
    promise.always(function(){
      $.mobile.loading('hide')
    })
  },
  verifyInputs: function( formData ){
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // https://stackoverflow.com/questions/46155/validate-email-address-in-javascript
    if ( window.state.user.id && +formData.fund_id > 0 ){
      var fund = _.find(window.state.user.funds, function(item){
        return item.id == formData.fund_id
      })
      if (+fund.saldo < +formData.amount){
        alert(window.localeMsg[window.localeLang].DONATION_IS_BIGGER_THAN_FUND_AMOUNT)
        return false
      }
    } else if ( window.state.user.id && formData.fund_id === '' ) {
      alert(window.localeMsg[window.localeLang].YOU_HAVE_NOT_FUND_CHOOSEN)
      return false
    }
    if( +formData.amount === 0 ) {
      alert(window.localeMsg[window.localeLang].YOU_HAVE_OMITTED_AMOUNT)
      return false
    }
    if( !window.state.user.id && (formData.email === '' || !re.test(formData.email)) ) {
      alert(window.localeMsg[window.localeLang].ENTER_EMAIL)
      return false
    }
    return true
  } ,
  close: function(){
    window.showFullView()
  }
})



  //     url: "https://gurtom.mobi/sn/create_donate_btn.php?type=2&id=1&amount=1000&curr=980&email=aaa@aaa.aa",
  //     type: "int", // 2 - program, 3 - projet program, 4 - procejt, 5 - request, (b_type || type)
  //     id: "int", // id of type above (full[0].id) 
  //     email: "aaa@aaa.aa",
  //     amount: 'num',
  //     curr: 'num'

  //     //  test card: 5457841000232821
  //     //  exp date:  03/22
  //     //  ccv:       111




