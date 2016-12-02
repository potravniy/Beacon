MsgModel = Backbone.Model.extend({
  defaults: {
    avatar: "//:0",
    user_id: '',
    text: "Ваше повідомлення може бути першим."
  }
})
MsgGroup = Backbone.Collection.extend({
  model: MsgModel,
  comparator: function(model) {
    return -model.get('ts');  //  latest msg appears first
  }
})
BeaconModel = Backbone.Model.extend({
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
BeaconsList = Backbone.Collection.extend({
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
      },
      error: function(){
        $.mobile.loading('hide')
        alert("Відсутній зв'язок або неполадки на сервері.")
      }
    })
  },
  getNextPage: function() {
    if (this.hasMorePages) {
      $.mobile.loading('show')
  		this.page += 1;
      this.url = this.baseUrl + window.state.urlRequest()
       + '&ls=' + (this.page * this.limit)
      this.fetch({
        add: true,
        remove: false,
        success: function(){
          $.mobile.loading('hide')
        },
        error: function(){
          $.mobile.loading('hide')
          alert("Відсутній зв'язок або неполадки на сервері.")
        }
      })
    }
  },
  getBeaconById: function(beaconID) {
    this.url = this.baseUrl + 'b_id=' + beaconID
    $.mobile.loading('show')
    this.fetch({
      reset: true,
      success: function(){
        $.mobile.loading('hide')
      },
      error: function(){
        $.mobile.loading('hide')
      }
    })
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
MsgView = Backbone.Marionette.ItemView.extend({
  model: MsgModel,
  template: '#chat_item_view_tpl',
  className: 'sent-message clearfix',
  events: {
    'click .abuse-spam': 'onClickBtn'
  },
  onClickBtn: function(){
    console.log('chat abuse btn clicked for beacon_id:' + this.model.get('beacon')
    + ', user_id: ' + this.model.get('user_id')
    + ', text: ' + this.model.get('text') )
    alert('Скаргу на повідомлення надіслано.')
  }
})
BeaconView = Backbone.Marionette.CompositeView.extend({
  template: "#beacon_main_tpl",
  templateHelpers: function() {
    var bs = this.model.get('b_status')
    var i = window.indexOfLastNonEmptyElement(bs) || 0
    var obj = {
      full: this.model.get('full') || '',
      // title: window.lib.htmlEntityDecode(this.model.get('title')),
      // details: window.lib.htmlEntityDecode(this.model.get('details')),
      b_status: i,
      color: bs[i]>0 ? 'green' : bs[i]<0 ? 'red' : '',
      icon_url: this.model.get('img') || window.getIconURL(this.model.attributes, true) 
    }
    
    return $.extend({}, window.lib.tagList(this), obj )
  },
  childView: MsgView,
  childViewContainer: '.sent-message__wrapper',
  className: function(){
    var index = _.indexOf(this.model.collection.models, this.model)
    return "ui-content ui-block-" + ((index % 2) ? "b" : "a")
  },
  attributes: {
    "data-role": "content"
  },
  initialize: function(){
    this.collection = new MsgGroup( this.model.get('chat') );
  },
  ui: {
    expandBtn: '.expanding_view .btn_wrapper',
    beaconStatusBtn: '.beacon_status',
    img: '.photo',
    link: '.link'
  },
  modelEvents: {
    "change": 'onModelChange'
  },
  events: {
    'click .share': 'onClickShare',
    'click @ui.link':'onClickLink',
    'click .error': 'onClickAbuse',
    'click .star': 'onClickStar',
    'click .add_linked': 'onClickAdd',
    'click .header': 'onThisViewClick',
    'click .beacon-content': 'onThisViewClick',
    'click .expanding_btn': 'goToSingleView',
    'click @ui.beaconStatusBtn': 'onClickStatusBtn',
    'click @ui.img': 'onClickImg'
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
    alert('Скаргу на цю інформацію надіслано.')
  },
  onClickStar: function (event) {
    event.stopPropagation()
    console.log('button "star" clicked id=' + this.model.get('id'))
  },
  onClickAdd: function (event) {
    event.stopImmediatePropagation()
    var options = {
      'parent_id': this.model.get('id'),
      'parent_type': +this.model.get('b_type') === 1000 ? this.model.get('type') : this.model.get('b_type')  
    }
    window.checkLoggedInThen(showBeaconCreateMenu, options)
  },
  onClickStatusBtn: function(){
    showPopupStatusBeacon( this.model.attributes )
  },
  isSelected: false,
  onThisViewClick: function(e){
    var isPhoto = (e.target.className.search('photo') !== -1) 
    var isStatusBtn = (e.target.className.search('beacon_status') !== -1)
    var isExpandBtn = (e.target.className.search('expanding_btn') !== -1) 
    if(!isPhoto && !isStatusBtn && !isExpandBtn) {
      var id = this.model.get('id')
      var i = _.findIndex(markers, function(item){
        return item.beaconID === id
      })
      var div = this.$el.find('.beacon')
      if(this.isSelected){
        markers[i].setAnimation(null)
        div.css( "outline", "" )
        this.isSelected = false
      } else {
        if( i === -1 ) {
          i = markers.length
          createMarker(this.model.attributes, i)
        }
        markers[i].setAnimation(google.maps.Animation.BOUNCE)
        div.css( "outline", "#69f solid 3px" )
        this.isSelected = true
        this.trigger("marker:bounce", this.model.get('id'));
      }
    }
  },
  goToSingleView: function(e){
    window.showBeaconFullView([{ id: this.model.get('id') }])
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
});
BeaconListView = Backbone.Marionette.CollectionView.extend({
  childView: BeaconView,
  className: "collection_view__wrapper ui-grid-a my-responsive ui-nodisc-icon",
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
    window.$outerDiv = $('#beacons-map__the-beacons')
    window.$innerDiv = this.$el
    window.$outerDiv.on('scroll', this.handleCollectionUpdate)
  },
  onBeforeDestroy: function(){
    window.$outerDiv.off('scroll', this.handleCollectionUpdate)
  },
  scrollHendlerOn: function(){
    this.$el.parent().bind('scroll', this.handleCollectionUpdate, this)
  },
  handleCollectionUpdate: function (event){
    var scroll = $innerDiv.height() - $outerDiv.height() - $outerDiv.scrollTop()
    if( scroll < 4 ) beaconsList.getNextPage()
  }
})
