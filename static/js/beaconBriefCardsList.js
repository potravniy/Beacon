var MsgModel = Backbone.Model.extend({
  defaults: {
    avatar: "//:0",
    user_id: '',
    text: window.localeMsg[window.localeLang].YOUR_MESSAGE_MAY_BE_FIRST
  }
})
var MsgGroup = Backbone.Collection.extend({
  model: MsgModel,
  comparator: function(model) {
    return +model.get('ts');  //  latest msg appears first
  }
})
var BeaconModel = Backbone.Model.extend({
  defaults: {
    id: "",
    b_type: "",
    author_id: '',
    author_name: 'anonimus',
    b_status: "0",
    source: "help",  //  list required
    category: "0",
    subcategory: "0",
    title: "?",
    details: '',
    b_img: "//:0",
    favorite: "0",
    ts: '0000-00-00 00:00:00',
    chat: []
  }
});
var BeaconsList = Backbone.Collection.extend({
  model: BeaconModel,
  limit: 10,
  page:0,
  hasMorePages: true,
  baseUrl: 'https://gurtom.mobi/beacon_cards.php?',
  url: '',
  getNewCollection: function() {
    $.mobile.loading('show')
  	this.page = 0;
    this.hasMorePages = true;
  	this.url = this.baseUrl + window.state.urlRequest()
    this.fetch({
      reset: true,
      success: function(res){
        $.mobile.loading('hide')
        window.clipboardView.setWidth()
        if(res.error){
          alert(window.localeMsg[window.localeLang][res.error])
        }
      },
      error: function(){
        $.mobile.loading('hide')
        window.clipboardView.setWidth()
        alert(window.localeMsg[window.localeLang].CONNECTION_ERROR)
      }
    })
  },
  getNextPage: function() {
    var that = this
    if (this.hasMorePages && !this.isFetching) {
      $.mobile.loading('show')
  		this.page += 1;
      this.url = this.baseUrl + window.state.urlRequest()
        + '&ls=' + (this.page * this.limit)
      this.isFetching = true
      this.fetch({
        add: true,
        remove: false,
        success: function(res){
          that.isFetching = false
          $.mobile.loading('hide')
          window.clipboardView.setWidth()
          if(res.error){
            alert(window.localeMsg[window.localeLang][res.error])
          }
        },
        error: function(){
          that.isFetching = false
          $.mobile.loading('hide')
          window.clipboardView.setWidth()
        alert(window.localeMsg[window.localeLang].CONNECTION_ERROR)
        }
      })
    }
  },
  parse: function(response) {
  	if (response.length < this.limit) this.hasMorePages = false
    var res = _.map(response, function(i){
      for (key in i){
        if(i[key]==='') {
          delete i[key]
        } else if( key==='details' || key==='title' ){
          i[key] = window.lib.htmlEntityDecode( i[key] ) 
        } else if( key==='tags' ){
          i[key] = _.map(i[key], function(item){
            item.tag = window.lib.htmlEntityDecode( item.tag )
            return item
          })
        }
      }
      return i
    })
    return res
  }
})
var MsgView = Backbone.Marionette.ItemView.extend({
  model: MsgModel,
  template: '#chat_item_view_tpl',
  templateHelpers: function(){
    return {
      text: window.lib.htmlEntityDecode( this.model.get('text') ),
      user_name: window.lib.htmlEntityDecode( this.model.get('user_name') )
    }
  },
  className: 'sent-message clearfix',
  events: {
    'click .abuse-spam': 'onClickBtn'
  },
  onClickBtn: function(){
    $.mobile.loading('show')
    var that = this
    var data = {
      data: JSON.stringify({
        chat_id: this.model.get('chat_id')
      })
    }
    var promise = $.ajax({
      type: "POST",
      url: "https://gurtom.mobi/chat_spam.php",
      dataType: "json",
      crossDomain: true,
      data: data
    })
    promise.done(function(response){
      if(response.error){
        alert(window.localeMsg[window.localeLang][response.error])
      } else {
        alert(window.localeMsg[window.localeLang].ABUSE_ON_MESSAGE_SENT)
      }
    });
    promise.fail(function(response){
      alert(window.localeMsg[window.localeLang].CONNECTION_ERROR)
    });
    promise.always(function(response){
      $.mobile.loading('hide')
    })
  }
})
var BeaconView = Backbone.Marionette.ItemView.extend({
  template: "#beacon_main_tpl",
  templateHelpers: function() {
    var bs = this.model.get('b_status')
    var i = window.indexOfLastNonEmptyElement(bs) || 0
    var obj = {
      full: this.model.get('full') || '',
      link_icon: this.model.get('linked') === '0' ? 'unlinked' : 'linked',
      // title: window.lib.htmlEntityDecode(this.model.get('title')),
      // details: window.lib.htmlEntityDecode(this.model.get('details')),
      b_status: i,
      color: bs[i]>0 ? 'green' : bs[i]<0 ? 'red' : '',
      icon_url: this.model.get('img') || window.getIconURL(this.model.attributes, true) 
    }
    return $.extend({}, window.lib.tagList(this), obj )
  },
  className: function(){
    var index = this.options.isWithinClipboard
      ? this.options.index.get()
      : _.indexOf(this.model.collection.models, this.model)
    return "ui-content ui-block-" + ((index % 2) ? "b" : "a")
  },
  attributes: {
    "data-role": "content"
  },
  ui: {
    expandBtn: '.expanding_view .btn_wrapper',
    beaconStatusBtn: '.beacon_status',
    img: '.photo',
    link: '.link',
    add: '.add_linked'
  },
  modelEvents: {
    "change": 'onModelChange'
  },
  events: {
    'click .share': 'onClickShare',
    'click @ui.link':'onClickLink',
    'click .error': 'onClickAbuse',
    'click .star': 'onClickStar',
    'click @ui.add': 'onClickAdd',
    'click .header': 'onThisViewClick',
    'click .beacon-content': 'onThisViewClick',
    'click .expanding_btn': 'showFullView',
    'click @ui.beaconStatusBtn': 'onClickStatusBtn',
    'click @ui.img': 'onClickImg'
  },
  initialize: function(){
    this.isSelected = !!this.options.isWithinClipboard

  },
  onBeforeShow: function(){
    if(  this.model.get('b_type') == '330' || this.model.get('type') == '330'
      || this.model.get('b_type') == '911' || this.model.get('type') == '911'
      || this.model.get('b_type') == '777' || this.model.get('type') == '777'
      || this.model.get('b_type') == '96'  || this.model.get('type') == '96'
      || this.model.get('b_type') == '69'  || this.model.get('type') == '69'
      || this.model.get('b_type') == '1'   || this.model.get('type') == '1'
      || this.model.get('b_type') == '2'   || this.model.get('type') == '2' ) {
      this.ui.expandBtn.show()
    }
  },
  onModelChange: function(){
    this.render()
  },
  onDomRefresh: function(){
    this.$el.trigger("create")
    if( window.state.b_link === this.model.get('id') ){
      this.ui.link.addClass('ui-btn-active')
    }
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
    event.stopPropagation()
    if( window.state.b_link === this.model.get('id') ){
      window.state.b_link = '0'
      this.ui.link.removeClass('ui-btn-active')
    } else {
      window.state.b_link = this.model.get('id')
      this.ui.link.addClass('ui-btn-active')
    }
    window.beaconsListGetNewCollection()
  },
  onClickAbuse: function (event) {
    event.stopPropagation()
    console.log('button "Abuse" clicked id=' + this.model.get('id'))
    alert(window.localeMsg[window.localeLang].ABUSE_ON_INFORMATIION_SENT)
  },
  onClickStar: function (event) {
    event.stopPropagation()
    console.log('button "star" clicked id=' + this.model.get('id'))
  },
  onClickAdd: function (event) {
    event.stopImmediatePropagation()
    if(window.clipboardView.collection.isEmpty()){
      var options = {
        'parent_id': this.model.get('id'),
        'parent_type': +this.model.get('b_type') === 1000 ? this.model.get('type') : this.model.get('b_type')  
      }
      window.checkLoggedInThen(showBeaconCreateMenu, options)
    } else {
      if(!window.lib.isDemand(this.model)){
        var confirmed = confirm(window.localeMsg[window.localeLang].CREATE_LINK_QUESTION)
        if(confirmed){
          var data = {
            bid_id: this.model.get('id'),
            ask_ids: window.clipboardView.getCollectionIdsListAsString('demand')
          }
          window.clipboardView.linkSelected(data)
        }
      }
    }
  },
  setBeaconLinked: function(idArray) {
    if(_.contains(idArray, this.model.get('id'))){
      var linked = parseInt(this.model.get('linked')) + 1 +''
      this.model.set({linked: linked})
      this.render()
    }
  },
  onClickStatusBtn: function(){
    showPopupStatusBeacon( this.model.attributes )
  },
  onThisViewClick: function(e){
    var isPhoto = (e.target.className.search('photo') !== -1) 
    var isStatusBtn = (e.target.className.search('beacon_status') !== -1)
    var isExpandBtn = (e.target.className.search('expanding_btn') !== -1) 
    if(!isPhoto && !isStatusBtn && !isExpandBtn) {
      if(this.isSelected){
        window.clipboardView.removeBeaconFromCollection(this.model)
      } else {
        window.clipboardView.addBeaconToCollection(this.model)
      }
    }
  },
  toggleSelected: function(){
    this.isSelected = !this.isSelected
    this.styleSelected()
  },
  styleSelected: function(){
    var div = this.$el.find('.beacon')
    if(this.isSelected){
      div.css( "box-shadow", "0 0 2px 3px #46f" )
    } else {
      div.css( "box-shadow", "" )
    }
  },
  showFullView: function(e){
    this.options && this.options.region
      ? window.clipboardView.showFullView(this.model.get('id'))
      : window.showBeaconFullView([{ id: this.model.get('id') }])
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
    this.styleSelected()
    if(!window.lib.isDemand(this.model) && !window.lib.isAuthor(this.model)){
      this.ui.add.prop( "disabled", true )
    }
  }
});
var BeaconEmptyListView = Backbone.Marionette.ItemView.extend({
  template: '#beacon_list_is_empty_tpl'
})
var BeaconListView = Backbone.Marionette.CollectionView.extend({
  childView: BeaconView,
  className: "collection_view__wrapper ui-grid-a my-responsive ui-nodisc-icon",
  emptyView: BeaconEmptyListView,
  events: {
    'click': 'stopSingleBeaconMode'
  },
  stopSingleBeaconMode: function(e){
    if(window.state.singleBeacon &&
     $(event.target).hasClass('collection_view__wrapper')) {
       setMultiBeaconMode()
     }
  },
  initialize: function(){
    window.$outerDiv = $('#cards-region')
    window.$innerDiv = this.$el
    window.$outerDiv.on('scroll', this.handleCollectionUpdate)
  },
  onBeforeDestroy: function(){
    window.$outerDiv.off('scroll', this.handleCollectionUpdate)
    if(!window.clipboardView.model.get('isExpanded')){
      $('#clipboard-region').hide()
    }
  },
  scrollHendlerOn: function(){
    this.$el.parent().bind('scroll', this.handleCollectionUpdate, this)
  },
  handleCollectionUpdate: function (event){
    var scroll = $innerDiv.height() - $outerDiv.height() - $outerDiv.scrollTop()
    if( scroll < -30 ) {
      beaconsList.getNextPage()
    }
  },
  onRender: function(){
    window.clipboardView && window.clipboardView.updateBeaconListView('reset')
    window.clipboardView && window.clipboardView.isShowndBefore && $('#clipboard-region').show()
    setTimeout(function(){
      window.clipboardView && window.clipboardView.isShowndBefore && window.clipboardView.setWidth()
    }, 100)

  }
})
