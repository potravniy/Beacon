"use strict"
var MsgCollectionView = Backbone.Marionette.CompositeView.extend({
  template: '#chat_tpl',
  className: 'chat',
  attributes: {
    'data-role': "chat"
  },
  ui: {
    msgInput: '#text-message',
    btnSend: '.input-message__send'
  },
  events: {
    'click @ui.btnSend': 'msgSend'
  },
  msgSend: function(){
    if( window.state.user.login === 'Guest' ) {
      alert(window.localeMsg[window.localeLang].REGISTRATION_REQUIRED)
      return
    } else if( window.state.user.voting_status === '0' ) {
      alert(window.localeMsg[window.localeLang].YOUR_AUTHORIZATION_MUST_BE_HIGHER)
      return
    }
    $.mobile.loading('show')
    var that = this
    var data = {
      data: JSON.stringify({
        beacon_id: this.options.beacon_id,
        msg: this.ui.msgInput.val()
      })
    }
    this.ui.msgInput.val("")
    var promise = $.ajax({
      type: "POST",
      url: "https://gurtom.mobi/chat_add.php",
      dataType: "json",
      crossDomain: true,
      data: data
    })
    promise.done(function(response){
      if(response.error){
        alert(window.localeMsg[window.localeLang][response.error])
        return
      } else that.collection.add(response.msg)
    });
    promise.fail(function(response){
      alert(window.localeMsg[window.localeLang].CONNECTION_ERROR)
    });
    promise.always(function(response){
      $.mobile.loading('hide')
    })
    
  },
  collection: MsgGroup,
  childView: MsgView,
  childViewContainer: '.sent-message__wrapper',
})
var ParticipBudgetModel = Backbone.Model.extend({
  defaults: {
    amount: '0',
    curr: '980',
    descr: ''
  }
})
var ParticipBudgetView = Backbone.Marionette.ItemView.extend({
  template: '#expand_to_p-budget__tpl',
  model: ParticipBudgetModel,
})
var VotingSupportBtnView = Backbone.Marionette.ItemView.extend({
  template: '#voting_support__tpl',
  className: 'voting_support',
  events: {
    'click #voting_support__btn': 'btnClick'
  },
  btnClick: function(){
    this.triggerMethod('support:btn_click')
  }
})
var VotingButtonsView = Backbone.Marionette.ItemView.extend({
  template: '#voting_buttons__tpl',
  attributes: {
    'data-role': "navbar"
  },
  templateHelpers: function(){
    var res = {
      yes:     ( this.model.get('user_vote') == '1' ? "ui-btn-active" : '' ),
      no:      ( this.model.get('user_vote') == '2' ? "ui-btn-active" : '' ), 
      abstain: ( this.model.get('user_vote') == '3' ? "ui-btn-active" : '' ) 
    }
    return res
  },
  onShow: function(){
    var privat = ( this.model.get('user_vote_open')==='1' ? false : true )
    this.ui.priv.flipswitch({
      create: function( event, ui ) {
        $(this).prop('checked', privat).flipswitch('refresh')
      }
    })
    $('.voting_btns').trigger("create")
  },
  ui: {
    priv: '#flip-vote_type'
  },
  events: {
    'click .voting_button__no': 'btnNoClick',
    'click .voting_button__abstain': 'btnAbstainClick',
    'click .voting_button__yes': 'btnYesClick'
  },
  btnNoClick: function(){
    this.triggerMethod('voting:btn_no_click', this.ui.priv.prop('checked'))
  },
  btnAbstainClick: function(){
    this.triggerMethod('voting:btn_abst_click', this.ui.priv.prop('checked'))
  },
  btnYesClick: function(){
    this.triggerMethod('voting:btn_yes_click', this.ui.priv.prop('checked'))
  }
})
var VotingModel = Backbone.Model.extend({
  defaults: {
    canUserVote: false,
    usr_status: window.localeMsg[window.localeLang].YOU_CANNOT_VOTE
  },
  initialize: function(){
    this.extendModel()
  },
  extendModel: function(){
    this.canUser()
    switch (+this.get('offer_status')) {
      case 0:
        if( new Date(this.get('sprtf')) < getTodayWithZeroTime()) {
          this.set({'v_status': (new IntlMessageFormat(window.localeMsg[window.localeLang].VOTING_SUPPORT_COMPLETED, window.localeLang)).format({when: reverseDateFormat(this.get('sprtf'))})})
        } else {
          this.set({'v_status': (new IntlMessageFormat(window.localeMsg[window.localeLang].VOTING_SUPPORT_CONTINUE, window.localeLang)).format({when: reverseDateFormat(this.get('sprtf'))})})
          if(this.get('canUserVote')) {
            this.set({'usr_status': (this.get('sprt_my') == '1' ? window.localeMsg[window.localeLang].YOU_SUPPORTED_THE_VOTING : window.localeMsg[window.localeLang].YOU_DID_NOT_SUPPORT_THE_VOTING )})
            this.set({'btn_support': (this.get('sprt_my') == '1' ? window.localeMsg[window.localeLang].WITHDRAW : window.localeMsg[window.localeLang].SUPPORT ) })
          }
        }
        break;
      case 1:
        if(new Date(this.get('offer_start_time')) <= getTodayWithZeroTime()){
          this.set({'v_status': (new IntlMessageFormat(window.localeMsg[window.localeLang].VOTING_STARTED_AND_RUNS_TO, window.localeLang)).format({when: reverseDateFormat(this.get('offer_finish_time'))})})
          if(this.get('canUserVote')) {
            this.set({'usr_status': haveUserVoted(this)})
          }
        } else {
          this.set({'v_status': (new IntlMessageFormat(window.localeMsg[window.localeLang].VOTING_WILL_START, window.localeLang)).format({when: reverseDateFormat(this.get('offer_start_time'))})})
          if(this.get('canUserVote')) {
            this.set({'usr_status': (this.get('sprt_my') == '1' ? window.localeMsg[window.localeLang].YOU_SUPPORTED_THE_VOTING : window.localeMsg[window.localeLang].YOU_DID_NOT_SUPPORT_THE_VOTING )})
          }
        }
        break;
      case 2:
        this.set({'v_status': (new IntlMessageFormat(window.localeMsg[window.localeLang].VOTING_IS_OVER, window.localeLang)).format({when: reverseDateFormat(this.get('offer_finish_time'))})})
        if(this.get('canUserVote')) {
          this.set({'usr_status': haveUserVoted(this)})
        }
        break;
      case 3:
        this.set({'v_status': window.localeMsg[window.localeLang].VOTING_IS_NOT_SUPPORTED}) 
        if(this.get('canUserVote')) {
          this.set({'usr_status': (this.get('sprt_my') == '1' ? window.localeMsg[window.localeLang].YOU_SUPPORTED_THE_VOTING : window.localeMsg[window.localeLang].YOU_DID_NOT_SUPPORT_THE_VOTING )})
        }
        break;
        this.set({'v_status': (new IntlMessageFormat(window.localeMsg[window.localeLang].VOTING_IS_SUPPORTED, window.localeLang)).format({when: reverseDateFormat(this.get('offer_finish_time'))})})
      case 4:
        if(this.get('canUserVote')) {
          this.set({'usr_status': (this.get('sprt_my') == '1' ? window.localeMsg[window.localeLang].YOU_SUPPORTED_THE_VOTING : window.localeMsg[window.localeLang].YOU_DID_NOT_SUPPORT_THE_VOTING )})
        }
        break;
    }
    function haveUserVoted(that){
      var open = that.get('user_vote_open') == '1' ? window.localeMsg[window.localeLang].YOU_DID_VOTE_OPEN : window.localeMsg[window.localeLang].YOU_DID_VOTE_SECRET
      var vote = (that.get('user_vote') == '1' ? (new IntlMessageFormat(window.localeMsg[window.localeLang].YOU_VOTED_FOR, window.localeLang)).format({how: open})
            : that.get('user_vote') == '2' ? (new IntlMessageFormat(window.localeMsg[window.localeLang].YOU_VOTED_AGAINST, window.localeLang)).format({how: open})
            : that.get('user_vote') == '3' ? (new IntlMessageFormat(window.localeMsg[window.localeLang].YOU_ABSTAINED, window.localeLang)).format({how: open})
            : window.localeMsg[window.localeLang].YOU_DID_NOT_VOTE )
      return vote
    }
  },
  canUser: function(){
    this.set({'canUserVote': false})
    if( isAuthLevelOk(this) && this.get('can_user') == '1' ) {
      this.set({'canUserVote': true})
    } else if(!window.state.user.id){
      this.set({'usr_status': window.localeMsg[window.localeLang].REGISTER_FOR_VOTE})
    } else if(this.get('can_user') == '-2'){
      this.set({'usr_status': window.localeMsg[window.localeLang].FILL_AGE_FOR_VOTE})
    } else if(this.get('can_user') == '-3') {
      this.set({'usr_status': (new IntlMessageFormat(window.localeMsg[window.localeLang].YOU_CANNOT_VOTE_BECAUSE_OF_AGE, window.localeLang)).format({ageFrom: this.get('age_from'), ageTo: this.get('age_to')})})
    } else if( !isAuthLevelOk(this) ) {
      var authLevel = this.get('v1')=='1' ? 1
       : this.get('v2')=='1' ? 2
       : this.get('v3')=='1' ? 3
       : this.get('v4')=='1' ? 4
       : this.get('v5')=='1' ? 5
       : 1
      this.set({'usr_status': (new IntlMessageFormat(window.localeMsg[window.localeLang].YOU_CANNOT_VOTE_BECAUSE_OF_AUTHENTIFICATION_LEVEL, window.localeLang)).format({authLevel: authLevel})})
    } else if( this.get('can_user') == '0' ) {
      this.set({ 'usr_status': window.localeMsg[window.localeLang].YOU_CANNOT_VOTE_BECAUSE_OF_SPHERE})
    } 
    function isAuthLevelOk(that){
      if(that.get('v0') == 1
          || that.get('v1') == 1 && (window.state.user.fb == 1 || window.state.user.gp == 1 || window.state.user.tw == 1 || window.state.user.in == 1 || window.state.user.vk == 1 || window.state.user.ok == 1)
          || that.get('v2') == 1 && window.state.user.osmd == 1
          || that.get('v3') == 1 && window.state.user.go == 1
          || that.get('v4') == 1 && window.state.user.payment == 1
          || that.get('v5') == 1 && window.state.user.bankid == 1){
        return true
      } else return false
    }
  }
})
var VotingResultItemtModel = Backbone.Model.extend({
  defaults: {
    title: '',
    minus: '0',
    plus: '0',
    abst: '0'
  }
})
var ResultCollectionModel = Backbone.Collection.extend({
  model: VotingResultItemtModel
})
var ResultView = Backbone.Marionette.ItemView.extend({
  template: '#voting_results__bar__tpl',
  templateHelpers: function(){
    if($('#percent_checkbox').prop('checked')){
      var totalVotes = ( this.model.get('type') === 'resulting' ? this.model.get('totalVotes') : this.model.get('total') )
      this.model.set('totalView', +((100 * this.model.get('total')/ totalVotes ).toFixed(1)))
      if( this.model.get('total') === 0 ) {
        this.model.set('minusView', 0)
        this.model.set('plusView', 0)
        this.model.set('abstView', 0)
      } else {
        this.model.set('minusView', +((100 * this.model.get('minus')/this.model.get('total')).toFixed(1)))
        this.model.set('plusView', +((100 * this.model.get('plus')/this.model.get('total')).toFixed(1)))
        this.model.set('abstView', +((100 * this.model.get('abst')/this.model.get('total')).toFixed(1)))
      }
    } else {
      this.model.set('totalView', this.model.get('total'))
      this.model.set('minusView', this.model.get('minus'))
      this.model.set('plusView', this.model.get('plus'))
      this.model.set('abstView', this.model.get('abst'))
    }
    return {
      totalView: this.model.get('totalView'),
      minusView: this.model.get('minusView'),
      plusView: this.model.get('plusView'),
      abstView: this.model.get('abstView')
    }
  },
  model: VotingResultItemtModel,
  ui: {
    'no': '.votes_no',
    'yes': '.votes_yes',
    'abst': '.votes_abstain',
    'total': '.votes_total .number'
  },
  onAttach: function(){
    $('#percent_checkbox').on('change', { that: this }, function(e){
      e.data.that.render()
      e.data.that.setColorBarsWidth()
    })
    this.setColorBarsWidth()
  },
  initialize: function(){
    $( window ).on( 'resize', { that: this }, this.setColorBarsWidth );
  },
  onBeforeDestroy: function(){
    $( window ).off( 'resize', this.setColorBarsWidth );
    $('#percent_checkbox').off()
  },
  setColorBarsWidth: function(e){
    var that = ( e ? e.data.that : this ),
        width_no, width_yes, width_abst
    if(that.model.get('type') === 'resulting') {
      if(that.model.get('category') === 'total') {
        var width = parseInt(that.$el.css('width'), 10)
        var widthTotalPrgrf = parseInt(that.ui.total.css('width'), 10)
        ResultView.prototype.maxBarWidth  = (width/2) - widthTotalPrgrf - 15 
      }
      if($('#percent_checkbox').prop('checked')){
        width_no = that.maxBarWidth * that.model.get('minusView')/100 +'px'
        width_yes = that.maxBarWidth * that.model.get('plusView')/100 +'px'
        width_abst = that.maxBarWidth * that.model.get('abstView')/100 +'px'
      } else if( +that.model.get('totalVotes') === 0 ) {
        width_no = width_yes = width_abst = '0'
      } else {
        width_no = that.maxBarWidth * that.model.get('minusView')/that.model.get('totalVotes') +'px'
        width_yes = that.maxBarWidth * that.model.get('plusView')/that.model.get('totalVotes') +'px'
        width_abst = that.maxBarWidth * that.model.get('abstView')/that.model.get('totalVotes') +'px'
      }
    } else if(that.model.get('type') === 'indicating') {
      if($('#percent_checkbox').prop('checked')){
        width_no = that.maxBarWidth * that.model.get('minusView')/100 +'px'
        width_yes = that.maxBarWidth * that.model.get('plusView')/100 +'px'
        width_abst = that.maxBarWidth * that.model.get('abstView')/100 +'px'
      } else if( +that.model.get('total') === 0 ) {
        width_no = width_yes = width_abst = '0'
      } else {
        width_no = that.maxBarWidth * that.model.get('minusView')/that.model.get('total') +'px'
        width_yes = that.maxBarWidth * that.model.get('plusView')/that.model.get('total') +'px'
        width_abst = that.maxBarWidth * that.model.get('abstView')/that.model.get('total') +'px'
      }
    }
    that.ui.no.css({width: width_no})
    that.ui.yes.css({width: width_yes})
    that.ui.abst.css({width: width_abst})
  } 
})
var ResultsView = Backbone.Marionette.CompositeView.extend({
  template: '#voting_results__title__tpl',
  templateHelpers: function(){
    var title, disabled, hide
    if(this.model.get('type')==='resulting'){
      title = window.localeMsg[window.localeLang].VOTING_RESULTS
      hide = ''
    } else {
      title = window.localeMsg[window.localeLang].INDICATIVE_VOTING_RESULTS
      hide = 'display: none;'
    }
    disabled = ( +this.model.get('totalVotes') === 0 ? 'disabled' : '' ) 
    return {
      title: title,
      disabled: disabled,
      hide: hide
    }
  },
  className: 'voting_results__bars',
  childView: ResultView,
  childViewContainer: ".voting_results"
})
var VotingView = Backbone.Marionette.LayoutView.extend({
  initialize: function() {
    this.listenTo(this.model, "change", this.render);
  },
  template: '#expand_to_voting__tpl',
  templateHelpers: function(){
    var result = {
      sphereStr: this.model.get('type_uk') +' > '
                  + this.model.get('city_uk') +' > '
                  + this.model.get('sphere'),
      sprtF: reverseDateFormat(this.model.get('sprtf')),
      offerStartTime: reverseDateFormat(this.model.get('offer_start_time')),
      offerFinishTime: reverseDateFormat(this.model.get('offer_finish_time')),
      votingStatus: ( state.user.voting_status
                      ? window.state.usrAuthLvl[+state.user.voting_status]
                      : window.localeMsg[window.localeLang].YOU_ARE_NOT_LOGGED_IN )
    } 
    return result
  },
  regions: {
    btnRegion: '.voting_btns',
    resultingRegion: '.voting_results__region',
    indicativeRegion: '.indicative_voting__region'
  },
  showVotesResults: function(){
    var model, view
    var votes = this.getCollectionsOfVotingResults()
    model = new Backbone.Model({
      type: 'resulting',
      totalVotes: this.model.get('totalVotes')
    })
    view = new ResultsView({
      model: model,
      collection: new Backbone.Collection(votes.res)
    })
    this.showChildView('resultingRegion', view)

    if( votes.ind.length > 0 ){
      model = new Backbone.Model({
        type: 'indicating'
      })
      view = new ResultsView({
        model: model,
        collection: new Backbone.Collection(votes.ind)
      })
      this.showChildView('indicativeRegion', view)
    }
  },
  onRender: function(){
    var model, view
    switch (+this.model.get('offer_status')) {
      case 0:   //  Support is active
        if(this.model.get('canUserVote')) {
          model = new Backbone.Model({
            btn_support: this.model.get('btn_support')
          }) 
          view = new VotingSupportBtnView({
            model: model
          })
          this.showChildView('btnRegion', view)
        }
        break;
      case 1:   //  Voting is active
        if(this.model.get('canUserVote') && (new Date(this.model.get('offer_start_time')) <= getTodayWithZeroTime())) {
          model = new Backbone.Model({
            user_vote: this.model.get('user_vote'),
            user_vote_open: this.model.get('user_vote_open')
          })
          view = new VotingButtonsView({
            model: model
          })
          this.showChildView('btnRegion', view)
        }
        this.showVotesResults()
        break;
      case 2:   //  Voting over
        this.showVotesResults()
        break;
    }
  },
  getCollectionsOfVotingResults: function() {
    var i = 0,
        v = 0,
        r = 1,
        res = [], //  resulting votes
        ind = []  //  indicating votes
    res[0] = {}
    res[0].title = window.localeMsg[window.localeLang].ALL_USER_CATHEGORIES
    res[0].minus = +this.model.get('votes_minus')
    res[0].plus = +this.model.get('votes_plus')
    res[0].abst = +this.model.get('votes_abstained')
    res[0].total = res[0].minus + res[0].plus + res[0].abst
    res[0].totalVotes = res[0].total
    res[0].category = 'total'
    res[0].type = 'resulting' 
    this.model.set('totalVotes', res[0].totalVotes)
    for(v=0; v<=window.state.usrAuthLvl.length; v++){
      if( this.model.get('v'+ v) && this.model.get('v'+ v) == '1' ){
        res[r] = {}
        res[r].title = window.state.usrAuthLvl[v]
        res[r].minus = +this.model.get('v'+ v + '_minus')
        res[r].plus = +this.model.get('v'+ v + '_plus')
        res[r].abst = +this.model.get('v'+ v + '_abst')
        res[r].total = res[r].minus + res[r].plus + res[r].abst
        res[r].totalVotes = res[0].total
        res[r].category = 'v'+ v
        res[r].type = 'resulting'
        r++
      } else if( this.model.get('v'+ v) && this.model.get('v'+ v) == '0' ){
        ind[i] = {}
        ind[i].title = window.state.usrAuthLvl[v]
        ind[i].minus = +this.model.get('v'+ v + '_minus')
        ind[i].plus = +this.model.get('v'+ v + '_plus')
        ind[i].abst = +this.model.get('v'+ v + '_abst')
        ind[i].total = ind[i].minus + ind[i].plus + ind[i].abst
        ind[i].category = 'v'+ v
        ind[i].type = 'indicating'
        i++
      }
    }
    return {
      res: res,
      ind: ind
    }
  },
  childEvents: {
    'support:btn_click': 'onSupportBtnClick',
    'voting:btn_no_click': 'onNoBtnClick',
    'voting:btn_abst_click': 'onAbstBtnClick',
    'voting:btn_yes_click': 'onYesBtnClick'
  },
  onSupportBtnClick: function(){
    var data = {
      id: this.model.get('id'),
      vote: '4'
    }
    this.sendVote(data)
  },
  onYesBtnClick: function(childView, priv){
    var data = {
      id: this.model.get('id'),
      open: ''+ +!priv, 
      vote: this.model.get('user_vote') == '1' ? "0" : "1"
    }
    this.sendVote(data)
  },
  onNoBtnClick: function(childView, priv){
    var data = {
      id: this.model.get('id'),
      open: +!priv, 
      vote: this.model.get('user_vote') == '2' ? "0" : "2"
    }
    this.sendVote(data)
  },
  onAbstBtnClick: function(childView, priv){
    var data = {
      id: this.model.get('id'),
      open: +!priv, 
      vote: this.model.get('user_vote') == '3' ? "0" : "3"
    }
    this.sendVote(data)
  },
  sendVote: function(data){
    $.mobile.loading('show')
    var that = this
    var promise = $.ajax({
      type: "POST",
      url: "https://gurtom.mobi/vote_simple_add.php",
      dataType: "json",
      xhrFields: { withCredentials: true },
      crossDomain: true,
      data: data
    })
    promise.done(function ( response ) {
      if(response.error){
        alert(window.localeMsg[window.localeLang][response.error])
      } else {
        that.model.set(response[0].full[0])
        that.model.extendModel()
      }
    })
    promise.fail(function(){
      alert( window.localeMsg[window.localeLang].CONNECTION_ERROR )
    })
    promise.always(function(){
      $.mobile.loading('hide')
    })
  }
})
var FundModel =  Backbone.Model.extend({
  defaults: {
    id: 0,
    curr: undefined,
    saldo: undefined
  }
})
var FundItemView = Backbone.Marionette.ItemView.extend({
  template: "#funds_item_view",
  tagName: 'tr',
  model: FundModel
})
var FundsLabelModel = Backbone.Model.extend({
  defaults: {
    label: "",
    collection: [],
    amount: ''
  },
  initialize: function(){
    if(!this.get('amount')) {
      if(this.get('collection').length===0) this.set('amount', '0.')
    }
  }
}) 
var FundsListView = Backbone.Marionette.CompositeView.extend({
  template: '#funds_list_view',
  tagName: 'table',
  className: 'funds_table',
  childView: FundItemView,
  childViewContainer: 'tbody',
  initialize: function(){
    this.collection = new Backbone.Collection(this.model.get('collection'))
  }
})
var oneNCOwantsAdmin = Backbone.Marionette.ItemView.extend({
  template: '.nco_wants_admin',
  className: function(){
    return this.model.get('authorBtn') || this.model.get('ncoBtn') ? 'ui-field-contain' : ''
  },
  triggers: {
    'click .accept': 'accept',
    'click .withdraw': 'withdraw'
  }
})
var AdministrationNCOView = Backbone.Marionette.CompositeView.extend({
  template: '#admin_nco_view',
  initialize: function(){
    var that = this
    if(this.model.get('nco_acceptance') === 0) {
      this.model.set({ nco_bids: this.model.get('nco_bids') || [] })
      var list = this.model.get('nco_bids').map(function(item){
        return {
          authorBtn: window.lib.isAuthor(that.model),
          item: window.lib.getNCObyID( item ),
          ncoBtn: +window.state.user.id === item,
          ncoBtnText: window.localeMsg[window.localeLang].WITHDRAW_PROPOSAL
        }
      })
      this.collection = new Backbone.Collection( list )
    } else {
      this.collection = new Backbone.Collection( [] )
    }
  },
  templateHelpers: function(){
    var res = {
      subject_administration: window.localeMsg[window.localeLang].SUBJECT_ADMINISTRATION[+this.model.get('type')],
      no_nco: window.localeMsg[window.localeLang].ANY_NCO_DO_NOT_ASKED_TO_ADMINISTER_THE_SUBJECT[+this.model.get('type')],
      nco_defined: window.localeMsg[window.localeLang].NCO_IS_DEFINED[+this.model.get('type')],
      nco_list: window.localeMsg[window.localeLang].LIST_NCO[+this.model.get('type')],
      ncoName: window.lib.getNameNCObyID( this.model.get('nco_id') ),
      showNcoBtn: false,
      txt: '',
      isAuthor: window.lib.isAuthor(this.model)
    }
    if( +window.state.user.nco > '0' && this.model.get('nco_acceptance') === 0 ){
      var doesNcoBid = _.contains(this.model.get('nco_bids'), +window.state.user.id),
          doesNcoMeetAuthorChoise = this.model.get('nco_id') == window.state.user.id

      if( doesNcoMeetAuthorChoise ){
        res.showNcoBtn = true
        res.txt = window.localeMsg[window.localeLang].TAKE_ADMINISTRATION
      } else if( doesNcoBid ){
        res.showNcoBtn = false
      } else {
        res.showNcoBtn = true
        res.txt = window.localeMsg[window.localeLang].PROPOSE_OUR_NCO
      }
    }
    return res
  },
  className: 'admin_nco',
  childView: oneNCOwantsAdmin,
  childViewContainer: '.nco_list',
  events: {
    'click .nco_decision': 'sendRequest'
  },
  childEvents: {
    'accept': 'onAccept',
    'withdraw': 'withdraw'
  },
  onAccept: function(view){
    var confirmed = confirm(window.localeMsg[window.localeLang].CONFIRM_FINAL_DECISION)
    if(confirmed) this.sendRequest(null, view.model.get('item').id)
  },
  withdraw: function(){
    this.sendRequest()
  },
  sendRequest: function(e, nco_id){
    $.mobile.loading('show')
    var that = this
    var data = {
      beacon_id: +this.model.get('b_id')
    }
    if(nco_id) data.nco_id = parseInt(nco_id)
    var promise = $.ajax({
      type: "POST",
      url: nco_id ? "/beacon_nco_ask.php" : "/beacon_nco_bid.php",
      dataType: "json",
      crossDomain: true,
      data: data
    })
    promise.done(function(response){
      if(response.error){
        alert(window.localeMsg[window.localeLang][response.error] || response.error)
      } else {
        window.showFullView(response)
      }
    });
    promise.fail(function(response){
      alert(window.localeMsg[window.localeLang].CONNECTION_ERROR)
    });
    promise.always(function(response){
      $.mobile.loading('hide')
    })
  },
  onRender: function(){
    if(window.lib.isAuthor(this.model) && this.model.get('nco_acceptance') === 0){
      var nco_bids = this.model.get('nco_bids')
      var view = NCOView.extend({
        model: new Backbone.Model({'required': ''}),
        informParent: this.sendRequest.bind(this),
        filter: function(item){
          return !_.contains(nco_bids, +item.id)
        }
      })
      this.choiseView = new view()
      this.choiseRegion = new Backbone.Marionette.Region({el: this.$('.nco_choise')})
      this.choiseRegion.show(this.choiseView)
    }
  },
  onBeforeDestroy: function(){
    if(this.choiseRegion){
      this.choiseRegion.reset()
      this.choiseRegion = null
    }
    if(this.choiseView){
      this.choiseView = null
    }
  }
})
var ProgramModel = Backbone.Model.extend({
  defaults: {
    id: 'undefined',
    my_donations: [],
    description: "",
    funds: [],
    discussion_link: undefined,
    pp: undefined,
    program_id: 'undefined',
    program_title: 'undefined',
    amount_asking: 'undefined',
    nco_acceptance: 0,
    nco_bids: [],
    nco_id: '0',
    amount: ''
  }
})
var Objects2_5View = Backbone.Marionette.LayoutView.extend({
  template: "#objects2-5_full_view",
  templateHelpers: function (){
    var subject_id = window.localeMsg[window.localeLang].SUBJECT_ID[+this.model.get('type')]
    var subject_expiration = window.localeMsg[window.localeLang].SUBJECT_EXPIRATION[+this.model.get('type')]
    var subject_discussion = window.localeMsg[window.localeLang].SUBJECT_DISCUSSION[+this.model.get('type')]
    return {
      subject_id: subject_id,
      subject_expiration: subject_expiration,
      subject_discussion: subject_discussion,
      closed: window.localeMsg[window.localeLang].SUBJECT_CLOSED[+this.model.get('type')],
      dt_expired: this.model.get('dt_expired') || false,
      ts_closed: this.model.get('ts_closed') || false,
      currency: window.lib.currency.getName(this.model.get('currency_asking')),
      subject_description_title: window.localeMsg[window.localeLang].SUBJECT_DESCRIPTION_TITLE[+this.model.get('type')]
    }
  },
  regions: {
    funds: '.funds',
    contribution: '.contribution',
    nco: '.nco'
  },
  events: {
    'click .withdraw': 'withdraw',
    'click .pp_list': 'showListPP'
  },
  withdraw: function(){
    console.log('Кнопка "Відкликати" натиснута.')
  },
  showListPP: function(){
    alert(window.localeMsg[window.localeLang].THIS_FUNCTION_IS_NOT_AVAILABLE_YET)
  },
  triggers: {
    'click .donate': 'pay:donate'
  },
  onBeforeShow: function(){
    var type = +this.model.get('b_type') === 1000 || !this.model.get('b_type') ? this.model.get('type') : this.model.get('b_type')
    var options = {
      label: window.localeMsg[window.localeLang].FOR_THIS_SUBJECT_AMOUNT_COLLECTED[type],
      collection: _.map(this.model.get('funds'), function(item){
        return $.extend({}, item, { 'withdrawable': false })
      })
    }
    var model = new FundsLabelModel(options)
    var View = FundsListView.extend({
      model: model
    })
    this.showChildView('funds', new View())

    if(window.state.user.id){
      options = {
        label: window.localeMsg[window.localeLang].YOUR_DONATION,
        amount: ( window.state.user.id ? '' : window.localeMsg[window.localeLang].UNKNOWN +'.' ),
        collection: _.map(this.model.get('my_donations'), function(item){
          return $.extend({}, item, { 'withdrawable': true })
        })
      }
      model = new FundsLabelModel(options)
      View = FundsListView.extend({
        model: model
      })
      this.showChildView('contribution', new View())
    }

    if(this.model.get('type') !== '2'){
      View = AdministrationNCOView.extend({
        model: this.model
      })
      this.showChildView('nco', new View())
    }
  }
})

var ProgramView = Backbone.Marionette.LayoutView.extend({
  template: "#program_full_view",
  regions: {
    funds: '.funds',
    contribution: '.contribution'
  },
  events: {
    'click .withdraw': 'withdraw',
    'click .pp_list': 'showListPP'
  },
  withdraw: function(){
    console.log('Кнопка "Відкликати" натиснута.')
  },
  showListPP: function(){
    alert(window.localeMsg[window.localeLang].THIS_FUNCTION_IS_NOT_AVAILABLE_YET)
  },
  triggers: {
    'click .donate': 'pay:donate'
  },
  onBeforeShow: function(){
    var options = {
      label: window.localeMsg[window.localeLang].FOR_THIS_SUBJECT_AMOUNT_COLLECTED[2],
      collection: _.map(this.model.get('funds'), function(item){
        return $.extend({}, item, { 'withdrawable': false })
      })
    }
    var model = new FundsLabelModel(options)
    var View = FundsListView.extend({
      model: model
    })
    var programFundsListView = new View()
    options = {
      label: window.localeMsg[window.localeLang].YOUR_DONATION,
      amount: ( window.state.user.id ? '' : window.localeMsg[window.localeLang].UNKNOWN +'.' ),
      collection: _.map(this.model.get('my_donations'), function(item){
        return $.extend({}, item, { 'withdrawable': true })
      })
    }
    model = new FundsLabelModel(options)
    View = FundsListView.extend({
      model: model
    })
    var contributionListView = new View()
    this.showChildView('funds', programFundsListView)
    this.showChildView('contribution', contributionListView)
  }
})
var SOS_Info_Emo_View = Backbone.Marionette.ItemView.extend({
  template: '#sos_extention_view_tpl',
  templateHelpers: function(){
    var mayUserSeePhone =  
      (  window.state.user.bankid  === '1' || window.state.user.gov === '1' 
      || window.state.user.payment === '1' || window.state.user.nco === '1' )
    return {
      phone: mayUserSeePhone ? this.model.get('phone') : window.localeMsg[window.localeLang].FOR_ORGANIZATIONS_ONLY
    }
  }
})
var BeaconFullModel = BeaconModel.extend({
  parse: function(response) {
    var res = response[0]
    var key
      for (key in res){
        if(res[key]==='') {
          delete res[key]
        } else if( key==='details' || key==='title' ){
          res[key] = window.lib.htmlEntityDecode( res[key] ) 
        } else if( key==='tags' ){
          res[key] = _.map(res[key], function(item){
            item.tag = window.lib.htmlEntityDecode( item.tag )
            return item
          })
        }
      }
    return res
  },
  initialize: function(){
    this.url = 'https://gurtom.mobi/beacon_cards.php?b_id=' + this.get('id')
  }
})
var BeaconFullView = Backbone.Marionette.LayoutView.extend({
  template: '#beacon_main_tpl',
  templateHelpers: function() {
    var bs = this.model.get('b_status')
    var i = window.indexOfLastNonEmptyElement(bs) || 0
    var obj = {
      full: this.model.get('full') || '',
      b_status: i,
      color: bs[i]>0 ? 'green' : bs[i]<0 ? 'red' : '',
      link_icon: this.model.get('linked') === '1' ? 'linked' : 'unlinked',
      icon_url: window.getIconURL(this.model.attributes, true),
      showBreakLinkBtn: false
    }  
    return $.extend({}, window.lib.tagList(this), obj )
  },
  id: 'beacon_full_view',
  className: 'ui-nodisc-icon',
  attributes: {
    "data-role": "content"
  },
  regions: {
    extention: '.expanding_view',
    chat: '#chat_region'
  },
  modelEvents: {
    "change": 'onModelChange'
  },
  ui: {
    'beaconStatusBtn': '.beacon_status',
    'img': '.photo',
    'share': '.share',
    'link': '.link',
    'error': '.error',
    'star': '.star',
    'add': '.add_linked'
  },
  events: {
    'click @ui.share':  'onClickShare',
    'click @ui.link':   'onClickLink',
    'click @ui.error':  'onClickError',
    'click @ui.star':   'onClickStar',
    'click @ui.add':    'onClickAdd',
    'click .ui-icon-close': 'exit',
    'click @ui.beaconStatusBtn': 'onClickStatusBtn',
    'click @ui.img': 'onClickImg'
  },
  childEvents: {
    'pay:donate': 'donate'
  },
  onModelChange: function(){
    this.render()
  },
  onDomRefresh: function(){
    this.$el.trigger("create")
  },
  onClickShare: function (event) {
    var options = {
      title: this.model.get('details'),
      link: window.location.origin + '#' 
       + serializeState(this.model.get('id'), this.model.get('lat'), this.model.get('lng')) 
    }
    window.showPopupShare(options)
  },
  onClickLink: function (event) {
    if( window.state.b_link === this.model.get('id') ){
      window.state.b_link = '0'
      this.ui.link.removeClass('ui-btn-active')
    } else {
      window.state.b_link = this.model.get('id')
      this.ui.link.addClass('ui-btn-active')
      showBeaconsListView()
    }
  },
  onClickError: function (event) {
    event.stopPropagation()
    if(!confirm(window.localeMsg[window.localeLang].SEND_MESSAGE_ABUSE)) return
    alert(window.localeMsg[window.localeLang].ABUSE_ON_INFORMATIION_SENT)
    console.log('button "error" clicked id=' + this.model.get('id'))
  },
  onClickStar: function (event) {
    event.stopPropagation()
    console.log('button "star" clicked id=' + this.model.get('id'))
  },
  onClickAdd: function (event) {
    var options = {
      'parent_id': this.model.get('id'),
      'parent_type': +this.model.get('b_type') === 1000
                      ? this.model.get('type')
                      : this.model.get('b_type')  
    }
    if(options.parent_type == '2'){
      $.extend(options, { 'program_id': this.model.get('full')[0].id })
    }
    window.checkLoggedInThen(showBeaconCreateMenu, options)
  },
  onBeforeShow: function(){
    var type = +this.model.get('b_type') === 1000 ? this.model.get('type') : this.model.get('b_type')
    var addOptions = {}
    addOptions.author_id = this.model.get('author_id')
    addOptions.type = type
    var Model,
        View
    switch (type) {
      case '1':
        Model = VotingModel
        View = VotingView
        break
      case '2':
        Model = ProgramModel
        View = Objects2_5View // ProgramView
        break
      case '3':
        Model = ProgramModel
        View = Objects2_5View
        addOptions.program_link = "https://gurtom.mobi/beacon.php#main/6/48.47700521/31.57012122/"+ this.model.get('program_beacon_id') +"/0,1,7,8,9,10/0/2/-/-/-/-/-/-/-/-/mm/-"
        break
      case '4':
        Model = ProgramModel
        View = Objects2_5View
        break
      case '5':
        Model = ProgramModel
        View = Objects2_5View
        break
      case '69':
      case '96':
        Model = Backbone.Model
        View = SOS_Info_Emo_View
        break
      case '330':
        Model = ParticipBudgetModel
        View = ParticipBudgetView
        break
      case '555':
      case '777':
      case '911':
        Model = Backbone.Model
        View = SOS_Info_Emo_View
        break
    }
    if ( Model && View ) {
      var extModel = this.model.get('full')[0] || {}
      $.extend(extModel, addOptions)
      View = View.extend({model: new Model(extModel)}) 
      this.showChildView('extention', new View())
    }
    var chat = this.model.get('chat')
    var chatCollection = new MsgGroup(chat)
    this.showChildView('chat', new MsgCollectionView({
      collection: chatCollection,
      beacon_id: this.model.get('id')
    }))
    // if( window.state.b_link === this.model.get('id') ){
    //   this.ui.link.addClass('ui-btn-active')
    // } else {
    //   this.ui.link.removeClass('ui-btn-active')
    // }
  },
  donate: function(){
    var param = {
      id: this.model.get('full')[0].id,
      beaconID: this.model.get('id'),
      details: this.model.get('details'),
      type: ( this.model.get('b_type')==1000 ? this.model.get('type') : this.model.get('b_type') ),
    }
    showDonateView(param)
  },
  exit: function(){
    if(this.options.region){
  } else {
    window.closeSingleBeaconMode()
  }
},
onClickStatusBtn: function(){
  showPopupStatusBeacon( this.model.attributes )
},
onClickImg: function(){
  var $photoPopup = $('#popupPhoto')
    var $abuseBtn = $('#popupPhoto .abuse')
    $abuseBtn.attr("data-id", this.model.get('id'))
    $abuseBtn.click(function(){
      console.log('image abuse btn clicked for beacon_id:' + $(this).attr('data-id'))
      if(!confirm(window.localeMsg[window.localeLang].SEND_PICTURE_ABUSE)) return
      alert(window.localeMsg[window.localeLang].ABUSE_ON_IMAGE_SENT)
      $photoPopup.popup('close')
    })
    $photoPopup.popup({
      afterclose: function( event, ui ) {
        $abuseBtn.off()
      }
    });
  },
  onRender: function(){
    if(!window.lib.isDemand(this.model) && !window.lib.isAuthor(this.model)){
      this.ui.add.prop( "disabled", true )
    }
    this.ui.link.prop( "disabled", true )
  }
})
