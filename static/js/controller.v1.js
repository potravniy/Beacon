

//  Controller

window.cardsRegion = new Backbone.Marionette.Region({el: "#cards-region"})
window.createBeaconMenuRegion = new Backbone.Marionette.Region({el: "#create_beacon__geo_region"})
window.rightPopupRegion = new Backbone.Marionette.Region({el: "#right_popup__region"})
window.fourthFilterRegion = new Backbone.Marionette.Region({el: "#categories"})
window.mapSearchRegion = new Backbone.Marionette.Region({el: "#map_search_container"})
window.clipboardRegion = new Backbone.Marionette.Region({el: "#clipboard-region"})

function showBeaconsListView() {
  console.log("showBeaconsListView")
  if(window.state.viewState !== 'mm'){
    window.state.viewState = 'mm'
    window.state.viewStateId = ''
		Manager.trigger('state_update')
  }
  window.beaconsList = new BeaconsList()

  beaconsList.on('update', function(e){
    console.log('update', e)
  })

  window.beaconsListView = new BeaconListView({
    collection: window.beaconsList,
  });
  window.cardsRegion.show(window.beaconsListView);
}

function showBeaconFullView(model, region){
  if(model){
    window.state.viewState = 'ms'
    window.state.viewStateId = model.id
		Manager.trigger('state_update')
  } else {
    model = {
      id: window.state.viewStateId
    }
  }
  window.beaconFullViewModel = new BeaconFullModel(model)
  window.showFullView = function (model){
    if(model){
      window.beaconFullViewModel = new BeaconFullModel(model)
    }
    window.beaconFullView = new BeaconFullView({
      model: window.beaconFullViewModel,
      region: region
    })
    region
      ? region.show(window.beaconFullView)
      : window.cardsRegion.show(window.beaconFullView)
  }
  if(!model || !model.full || _.isEmpty(model.full)) {
    $.mobile.loading('show')
    window.beaconFullViewModel
      .fetch()
      .done(function(){
        showFullView()
      })
      .always(function(){
        $.mobile.loading('hide')
      })
  } else {
    window.showFullView()
  }
}

function showClipboard() {
  window.clipboardView = new ClipboardView();
  window.clipboardRegion.show(window.clipboardView);
}

function beaconsListGetNewCollection(){
  window.beaconsList.getNewCollection()
}

function showObjectCreateView(model, options) {
  var titler = ''
  switch (+model.type) {
    case 1:
      titler = window.localeMsg[window.localeLang].CREATE_VOTING
      break;
    case 2:
      titler = window.localeMsg[window.localeLang].CREATE_PROGRAM
      break;
    case 3:
      titler = window.localeMsg[window.localeLang].CREATE_PROJECT_PROPOSAL
      break;
    case 4:
      titler = window.localeMsg[window.localeLang].CREATE_PROJECT
      break;
    case 5:
      titler = window.localeMsg[window.localeLang].CREATE_REQUEST
      break;
    case 69:
      titler = window.localeMsg[window.localeLang].CREATE_EMOTICON_GOOD
      break;
    case 96:
      titler = window.localeMsg[window.localeLang].CREATE_EMOTICON_BAD
      break;
    case 330:
      titler = window.localeMsg[window.localeLang].CREATE_PARTICIPATION_BUDGET_PROJECT
      break;
    case 777:
      titler = window.localeMsg[window.localeLang].CREATE_IMPORTANT
      break;
    case 911:
      titler = window.localeMsg[window.localeLang].CREATE_SOS
      break;
  }
  model = $.extend({}, model, { titler: titler })

  if ( options ){
    options.model = model
  } else {
    var options = {model: model}
  }
  window.objectCreateView = new ObjectCreateView(options)
  window.cardsRegion.show(objectCreateView);
}

function showBeaconCreateMenu(options) {
  window.createBeaconMenuView = new BeaconCreatePopup(options)
  window.createBeaconMenuRegion.show(window.createBeaconMenuView)
  console.log('Switch to createBeaconMenuView')
}

function showPopupStatusBeacon(options) {
  window.popupStatusBeacon = new PopupStatusBeacon(options)
  if ( !window.popupStatusBeacon.isDestroyed ) {
    window.rightPopupRegion.show(window.popupStatusBeacon)
    console.log('Switch to popupStatusBeacon')
  } else {
    console.log('popupStatusBeacon selfdestroyed due abcence of beacon type')
  }
}

function showChangeGovMenuView() {
  window.changeGovMenuView = new ChangeGovMenuView();
  window.createBeaconMenuRegion.show(window.changeGovMenuView);
  console.log('Switch to changeGovMenuView')
}

function createObject(model, options) {
  $('#create_beacon__geo').popup('close')
  if ( options.lat && options.lng && options.b_type ) {
    var geoOptions = {
      'lat': +options.lat,
      'lng': +options.lng,
      'b_type': +options.b_type
    }
  } else {
    var geoOptions = getGeoOptions(model.type)
  }
  model = $.extend({}, geoOptions, model)
  showObjectCreateView(model, options)
  createSingleMarker(model, 'draggable')
  window.mainRegion.showBeaconsCards()
}

function getGeoOptions(type){
  var options = {
    'lat': +window.state.map.getCenter().lat().toFixed(8),
    'lng': +window.state.map.getCenter().lng().toFixed(8),
    'b_type': +type
  }
  return options  
}

function closeSingleBeaconMode() {
  requestMarkersListener = window.state.map.addListener('idle', requestMarkers)
  window.showBeaconsListView()
  window.setMultiBeaconMode()
}

function showDonateView(param) {
  window.donateModel = new DonateModel( param )
  window.donateView = new DonateView({ model: window.donateModel })
  window.cardsRegion.show(window.donateView)
  console.log('Switch to showDonateView')
}

function showPayByCardView(options) {
  window.popupPayByCardView = new PayByCardView(options)
  window.rightPopupRegion.show(window.popupPayByCardView)
  console.log('Switch to popupPayByCardView')
}

function showPopupShare(options) {
  window.popupShareInSocial = new PopupShareInSocial(options)
  window.rightPopupRegion.show(window.popupShareInSocial)
  console.log('Switch to popupShareInSocial')
}

function showFourthFilter() {
  window.listOrgCollection = new ListOrgCollection( makeListOrgs() )
  window.fourthFilterView = new FourthFilterView()
  window.fourthFilterRegion.show(window.fourthFilterView)
  // console.log('Switch to fourthFilterView')
}

function checkLoggedInThen(func, args) {
  if( window.state.user.id ){
    func(args)
  } else {
    window.defferedAfterLogin = jQuery.Deferred()
    .done(function(){
      func(args)
    })
    window.logIn()
  }
}

function showSearch_Hash(options){
  options = options || {}
  $.extend(options, {searchType: 'hash'})
  window.mapSearchView = new HashAndIdMapSearchView( options )
  showMapSearchView()
}
function showSearch_ID(options){
  options = options || {}
  $.extend(options, {searchType: 'id'})
  window.mapSearchView = new HashAndIdMapSearchView( options )
  showMapSearchView()
}
function showSearch_Google(){
  window.mapSearchView = new GoogleMapSearchView()
  showMapSearchView()
}
function showMapSearchView(){
  window.mapSearchRegion.show(window.mapSearchView)
  console.log('Switch to mapSearchView')
}

function showProfile(){
  window.profileView = new ProfilePopupView()
  window.profileView.render()
  console.log('Switch to profileView')
}

function showFundHistory(options){
  window.fundHistoryView = new FundsHistoryView(options)
  window.fundHistoryView.render()
  console.log('Switch to fundHistoryView')
}

function showLiqpayReplenishPopup(options){
  var View = PayByCardView.extend({
    onRender: function(){
      var that = this,
          $background = $('#beacons-map')
      this.$el.appendTo('body')
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
    },
    exit: function(){
      this.$el.popup('close')
      window.checkLoggedIn()
        .then(function(){
          window.showProfile()
        })
      },
    onDomRefresh: _.noop
  })
  window.popupPayByCardView = new View(options)
  window.popupPayByCardView.render()
  console.log('Switch to popupPayByCardView')
}

window.onpopstate = function(){
  var path = Manager.getCurrentRoute()
  if( window.defferedAfterLogin && window.defferedAfterLogin.state()==="pending" ){
    if(path!=="login" && path!=="registration" && path!=="pass_restore" && path!=="pass_reset"){
      if(window.state.user.id){
        $(":mobile-pagecontainer").one('pagecontainerchange', window.defferedAfterLogin.resolve)
      } else {
        window.defferedAfterLogin.reject()
      }
    }
  }
}



//  Started but not completed
var Controller = Marionette.Object.extend({
  _mapState: 'multi',
  _cardsState: 'multi',
  _id: [],
  changeState: function(stateInURLformat, id){
    if(stateInURLformat.length !== 2) throw new Error('Wrong controller.changeState options: '+ stateInURLformat)
    if(stateInURLformat[0] === 'm') {
      this._mapState = 'multi'
    }else if(stateInURLformat[0] === 's') {
      this._mapState = 'single'
    }else{
      throw new Error('Wrong controller.changeState options: '+ stateInURLformat)
    }
    if(stateInURLformat[1] === 'm') {
      this._cardsState = 'multi'
    }else if(stateInURLformat[1] === 's') {
      this._cardsState = 'single'
    }else{
      throw new Error('Wrong controller.changeState options: '+ stateInURLformat)
    }
    this._id = _.map(id.split(','), function(item){
      return parseInt(item, 10)
    })
  },
  getMapState: function(){
    return _mapState
  },
  getCardsState: function(){
    return _cardsState
  },
  setMapState: function(){

  }
})

