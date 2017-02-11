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
      alert('Зареєструйтесь, будь-ласка!')
      return
    } else if( window.state.user.voting_status === '0' ) {
      alert('Для відправки повідомлень, будь-ласка, підвищіть рівень Вашої авторизації.')
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
      console.log("success: ", response)
      if(response.error === 0){
        that.collection.add(response.msg)
      } else if(response.error === 4){
        alert("Це повідомлення Ви вже відправляли.")
      } else if(response.error === 100){
        alert("Для відправки повідомлень, будь-ласка, підвищіть рівень Вашої авторизації.")
      }
    });
    promise.fail(function(response){
      console.log("error")
      alert("Error: "+ response[0].error_uk)
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
    usr_status: 'Ви не можете проголосувати.'
  },
  initialize: function(){
    this.extendModel()
  },
  extendModel: function(){
    this.canUser()
    switch (+this.get('offer_status')) {
      case 0:
        if( new Date(this.get('sprtf')) < getTodayWithZeroTime()) {
          this.set({'v_status': 'Збір голосів підтримки закінчився'+' '+ reverseDateFormat(this.get('sprtf')) +'.'})
        } else {
          this.set({'v_status': 'Триває збір голосів підтримки до'+' '+ reverseDateFormat(this.get('sprtf')) +'.'})
          if(this.get('canUserVote')) {
            this.set({'usr_status': (this.get('sprt_my') == '1' ? 'Ви підтримали це голосування.' : 'Ви ще не підтримували проведення цього голосування.' )})
            this.set({'btn_support': (this.get('sprt_my') == '1' ? 'Скасувати' : 'Підтримати' ) })
          }
        }
        break;
      case 1:
        if(new Date(this.get('offer_start_time')) <= getTodayWithZeroTime()){
          this.set({'v_status': 'Голосування розпочато і триває до'+' '+ reverseDateFormat(this.get('offer_finish_time')) +'.'})
          if(this.get('canUserVote')) {
            this.set({'usr_status': haveUserVoted(this)})
          }
        } else {
          this.set({'v_status': 'Голосування розпочнеться'+' '+ reverseDateFormat(this.get('offer_start_time')) +'.'})
          if(this.get('canUserVote')) {
            this.set({'usr_status': (this.get('sprt_my') == '1' ? 'Ви підтримали це голосування.' : 'Ви не підтримали це голосування.' )})
          }
        }
        break;
      case 2:
        this.set({'v_status': 'Голосування закінчилось'+' '+ reverseDateFormat(this.get('offer_finish_time')) +'.'})
        if(this.get('canUserVote')) {
          this.set({'usr_status': haveUserVoted(this)})
        }
        break;
      case 3:
        this.set({'v_status': 'Голосування не набрало необхідну кількість голосів підтримки і є скасованим.'}) 
        if(this.get('canUserVote')) {
          this.set({'usr_status': (this.get('sprt_my') == '1' ? 'Ви підтримали це голосування.' : 'Ви не підтримали це голосування.' )})
        }
        break;
      case 4:
        this.set({'v_status': 'Голосування набрало необхідну кількість голосів підтримки.'
          + 'Голосування розпочнеться'+' '+ reverseDateFormat(this.get('offer_finish_time')) +'.' }) 
        if(this.get('canUserVote')) {
          this.set({'usr_status': (this.get('sprt_my') == '1' ? 'Ви підтримали це голосування.' : 'Ви не підтримали це голосування.' )})
        }
        break;
    }
    function haveUserVoted(that){
      var vote = (that.get('user_vote') == '1' ? 'Ви голосували "за"'+' '+ (that.get('user_vote_open') == '1' ? 'відкрито.' : 'таємно.')
            : that.get('user_vote') == '2' ? 'Ви голосували "проти"'+' '+ (that.get('user_vote_open') == '1' ? 'відкрито.' : 'таємно.') 
            : that.get('user_vote') == '3' ? 'Ви "утримались"'+' '+ (that.get('user_vote_open') == '1' ? 'відкрито.' : 'таємно.')
            : 'Ви не голосували.' )
      return vote
    }
  },
  canUser: function(){
    this.set({'canUserVote': false})
    if( isAuthLevelOk(this) && this.get('can_user') == '1' ) {
      this.set({'canUserVote': true})
    } else if(!window.state.user.id){
      this.set({'usr_status': "Для участі в голосуваннях, будь-ласка, зареєструйтесь."})
    } else if(this.get('can_user') == '-2'){
      this.set({'usr_status': "Для участі в голосуваннях, будь-ласка, заповніть поле 'Дата народження' в своїх особистих даних."})
    } else if(this.get('can_user') == '-3') {
      this.set({'usr_status': "Ви не можете приймати участь в цьому голосуванні, оскільки автор встановив вікові обмеження від"+' '
      + this.get('age_from') +" до "+ this.get('age_to') + " років."})
    } else if( !isAuthLevelOk(this) ) {
      this.set({'usr_status': "Ви не можете приймати участь в цьому голосуванні, оскільки рівень Вашої авторизації на цьому сервісі не відповідає вимогам автора голосування. "
      + "Для участі в цьому голосуванні Вам слід мати рівень авторизації не нижче ніж: "
      + (this.get('v1')=='1' ? 'Авторизація через соціальну мережу'   // 1
       : this.get('v2')=='1' ? "Співвласники"                         // 2
       : this.get('v3')=='1' ? "Члени громадських об'єднань"          // 3
       : this.get('v4')=='1' ? "Авторизація по платежу"               // 4
       : this.get('v5')=='1' ? "Авторизація по банківській карті"     // 5
       : '' ) + '.' })
    } else if( this.get('can_user') == '0' ) {
      this.set({ 'usr_status': "Ви не можете приймати участь в цьому голосуванні, оскільки предмет голосування є поза Вашими сферами." })
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
      title = 'Результати голосування'
      hide = ''
    } else {
      title = 'Результати індикативного голосування'
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
                      : 'Ви не зареєструвались' )
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
    res[0].title = 'Всі категорії користувачів'
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
      if(response[0].msg_uk) alert(response[0].msg_uk)
      else{
        that.model.set(response[0].full[0])
        that.model.extendModel()
      }
    })
    promise.fail(function(){
      alert( localeMsg.FAIL )
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
  initialize: function(){
    this.triggers = {
      'click .accept': 'accept:' + this.model.get('item').id
    }
  }
})
var AdministrationNCOView = Backbone.Marionette.CompositeView.extend({
  template: '#admin_nco_view',
  templateHelpers: function(){
    var res = {
        ncoName: window.lib.getNameNCObyID( this.model.get('nco_id') ),
        showNcoBtn: false,
        txt: ''
      }
    if( window.state.user.nco !== '0' && this.model.get('nco_acceptance') === "0" ){
      var doesNcoBid = this.model.get('nco_bids').indexOf(window.state.user.id) > -1,
          doesNcoMeetAuthorChoise = this.model.get('nco_id') === window.state.user.id

      if( doesNcoMeetAuthorChoise ){
        res.showNcoBtn = true
        this.ncoAction = 'takeIt'
        res.txt = 'Прийняти адміністрування'
      } else if( doesNcoBid ){
        res.showNcoBtn = true
        this.ncoAction = 'withdraw'
        res.txt = 'Відкликати пропозицію'
      } else {
        res.showNcoBtn = true
        this.ncoAction = 'propose'
        res.txt = 'Запропонувати свою НКО'
      }
    }
    return res
  },
  className: 'admin_nco',
  childView: oneNCOwantsAdmin,
  childViewContainer: '.nco_list',
  events: {
    'click .nco_decision': 'sendNCOdecision'
  },
  initialize: function(){
    if(this.model.get('nco_acceptance') === "0") {
      var btn = window.state.user.id === this.model.get('author_id') ? true : false
      this.model.set({ nco_bids: this.model.get('nco_bids') || [] })
      var list = this.model.get('nco_bids').map(function(item){
        return {
          item: window.lib.getNCObyID( item ),
          button: btn
        }
      })
      this.collection = new Backbone.Collection( list )
    } else {
      this.collection = new Backbone.Collection( [] )
    }
  },
  sendNCOdecision: function(){
    console.log("NCO descision is: ", this.ncoAction)
  }
})
var ProgramModel = Backbone.Model.extend({
  defaults: {
    id: 0,
    my_donations: [],
    description: "",
    funds: [],
    discussion_link: undefined,
    pp: undefined,
    amount: ''
  }
})
var Objects2_5View = Backbone.Marionette.LayoutView.extend({
  template: "#objects2-5_full_view",
  templateHelpers: function (){
    return {
      dt_expired: this.model.get('dt_expired') || false,
      ts_closed: this.model.get('ts_closed') || false,
      currency: window.lib.currency.getName(this.model.get('currency_asking'))
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
    alert("Ця функція поки що недоступна.")
  },
  triggers: {
    'click .donate': 'pay:donate'
  },
  onBeforeShow: function(){
    var options = {
      label: 'Для '+ this.model.get('obj_') +' зібрано коштів',
      collection: _.map(this.model.get('funds'), function(item){
        return $.extend({}, item, { 'withdrawable': false })
      })
    }
    var model = new FundsLabelModel(options)
    var View = FundsListView.extend({
      model: model
    })
    this.showChildView('funds', new View())

    options = {
      label: 'Ваш внесок',
      amount: ( window.state.user.id ? '' : 'невідомий'+'.' ),
      collection: _.map(this.model.get('my_donations'), function(item){
        return $.extend({}, item, { 'withdrawable': true })
      })
    }
    model = new FundsLabelModel(options)
    View = FundsListView.extend({
      model: model
    })
    this.showChildView('contribution', new View())

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
    alert("Ця функція поки що недоступна.")
  },
  triggers: {
    'click .donate': 'pay:donate'
  },
  onBeforeShow: function(){
    var options = {
      label: 'Для програми зібрано коштів',
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
      label: 'Ваш внесок',
      amount: ( window.state.user.id ? '' : 'невідомий.' ),
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
// var ProjProposModel = Backbone.Model.extend({
//   defaults: {
//     id: 0,
//     my_donations: [],
//     description: "",
//     funds: [],
//     discussion_link: undefined,
//     pp: undefined,
//     amount: ''
//   }
// })
var SOS_Info_Emo_View = Backbone.Marionette.ItemView.extend({
  template: '#sos_extention_view_tpl',
  templateHelpers: function(){
    var mayUserSeePhone =  
      (  window.state.user.bankid  === '1' || window.state.user.gov === '1' 
      || window.state.user.payment === '1' || window.state.user.nco === '1' )
    return {
      phone: mayUserSeePhone ? this.model.get('phone') : 'Перегляд доступний лише юридичним особам.'  
    }
  }
})
var BeaconFullModel = BeaconModel.extend({
  parse: function(response) {
    var res = response[0]
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
  baseUrl: 'https://gurtom.mobi/beacon_cards.php?b_id=',
  template: '#beacon_main_tpl',
  templateHelpers: function() {
    var bs = this.model.get('b_status')
    var i = window.indexOfLastNonEmptyElement(bs) || 0
    var obj = {
      full: this.model.get('full') || '',
      b_status: i,
      color: bs[i]>0 ? 'green' : bs[i]<0 ? 'red' : '',
      icon_url: window.getIconURL(this.model.attributes, true) 
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
      link: window.location.origin + window.location.pathname + '#' 
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
    console.log('button "error" clicked id=' + this.model.get('id'))
  },
  onClickStar: function (event) {
    event.stopPropagation()
    console.log('button "star" clicked id=' + this.model.get('id'))
  },
  onClickAdd: function (event) {
    event.stopPropagation()
    var options = {
      'parent_id': this.model.get('id'),
      'parent_type': +this.model.get('b_type') === 1000 ? this.model.get('type') : this.model.get('b_type'),
      'parent_model': this.model.attributes
    }
    if(options.parent_type == '2'){
      $.extend(options, { 'program_id': this.model.get('full')[0].id })
    }
    checkLoggedInThen(showBeaconCreateMenu, options)
  },
  onBeforeShow: function(){
    console.log("OnBeforeShow FullView")
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
        View = window.state.user.id === '14409' || window.state.user.id === '1' ? Objects2_5View : ProgramView
        addOptions.obj = 'програма'
        addOptions.obj_ = 'програми'
        addOptions.obj__ = 'цю програму'
        addOptions.closed = ''
        break
      case '3':
        Model = ProgramModel
        View = window.state.user.id === '14409' || window.state.user.id === '1' ? Objects2_5View : null
        addOptions.obj = 'проектна пропозиція'
        addOptions.obj_ = 'проектної пропозиції'
        addOptions.obj__ = 'цю проектну пропозицію'
        addOptions.closed = 'Пропозиція закрита'
        addOptions.program_link = "https://gurtom.mobi/beacon.php#main/6/48.47700521/31.57012122/"+ this.model.get('program_beacon_id') +"/0,1,7,8,9,10/0/2/-/-/-/-/-/-/-/-/mm/-"
        break
      case '4':
        Model = ProgramModel
        View = window.state.user.id === '14409' || window.state.user.id === '1' ? Objects2_5View : null
        addOptions.obj = 'проект'
        addOptions.obj_ = 'проекту'
        addOptions.obj__ = 'цей проект'
        addOptions.closed = 'Проект закрито'
        break
      case '5':
        Model = ProgramModel
        View = window.state.user.id === '14409' || window.state.user.id === '1' ? Objects2_5View : null
        addOptions.obj = 'запит'
        addOptions.obj_ = 'запиту'
        addOptions.obj__ = 'цей запит'
        addOptions.closed = 'Запит закрито'
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
      var extModel = this.model.get('full')[0]
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
    if( window.state.b_link === this.model.get('id') ){
      this.ui.link.addClass('ui-btn-active')
    } else {
      this.ui.link.removeClass('ui-btn-active')
    }
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
    window.closeSingleBeaconMode()
  },
  onClickStatusBtn: function(){
    showPopupStatusBeacon( this.model.attributes )
  },
  onClickImg: function(){
    var $photoPopup = $('#popupPhoto')
    $('#popupPhoto .photopopup__img').attr("src", this.model.get('b_img'))
    $photoPopup.popup('open')
    $photoPopup.popup("reposition", {positionTo: 'window'})
    var $abuseBtn = $('#popupPhoto .abuse')
    $abuseBtn.attr("data-id", this.model.get('id'))
    $abuseBtn.click(function(){
      console.log('image abuse btn clicked for beacon_id:' + $(this).attr('data-id'))
      alert('Скаргу на зображення надіслано.')
      $photoPopup.popup('close')
    })
    $photoPopup.popup({
      afterclose: function( event, ui ) {
        $abuseBtn.off()
      }
    });
  }
})
