

//  Controller

window.rightRegion = new Backbone.Marionette.Region({el: "#beacons-map__the-beacons"})
window.createBeaconMenuRegion = new Backbone.Marionette.Region({el: "#create_beacon__geo_region"})
window.rightPopupRegion = new Backbone.Marionette.Region({el: "#right_popup__region"})
window.fourthFilterRegion = new Backbone.Marionette.Region({el: "#categories"})
window.mapSearchRegion = new Backbone.Marionette.Region({el: "#map_search_container"})
window.profileRegion = new Backbone.Marionette.Region({el: ".profile_page__wrapper"})
window.showBeaconsListView()

function showBeaconsListView() {
  window.beaconsList = new BeaconsList()
  window.beaconsListView = new BeaconListView({
    collection: beaconsList,
  });
  window.rightRegion.show(window.beaconsListView);
}

function beaconsListGetNewCollection(){
  window.beaconsList.getNewCollection()
}

function showObjectCreateView(model, options) {
  var titler = ''
  switch (+model.type) {
    case 1:
      titler = 'Створення голосування'
      break;
    case 2:
      titler = 'Створення програми'
      break;
    case 3:
      titler = 'Створення проектної пропозиції'
      break;
    case 4:
      titler = 'Створення проекту'
      break;
    case 5:
      titler = 'Створення запиту'
      break;
    case 69:
      titler = 'Створення маячка "Тут добре"'
      break;
    case 96:
      titler = 'Створення маячка "Тут погано"'
      break;
    case 330:
      titler = 'Створення проекту по бюджету участі'
      break;
    case 777:
      titler = 'Створення маячка "Важливо"'
      break;
    case 911:
      titler = 'Створення маячка "СОС"'
      break;
  }
  model = $.extend({}, model, { titler: titler })

  if ( options ){
    options.model = model
  } else {
    var options = {model: model}
  }
  window.objectCreateView = new ObjectCreateView(options)
  window.rightRegion.show(objectCreateView);
}

function showBeaconFullView(param){
  var model = ( Array.isArray(param) ? param[0] : param )
  window.beaconFullViewModel = new BeaconFullModel(model)
  if( model.hasOwnProperty('full') ) {
    showFullView()
  } else {
    $.mobile.loading('show')
    window.beaconFullViewModel.fetch()
    .done(function(){
      showFullView()
    })
    .always(function(){
      $.mobile.loading('hide')
    })
  }
  function showFullView(){
    window.beaconFullView = new BeaconFullView({ model: beaconFullViewModel })
    window.rightRegion.show(window.beaconFullView);
  }
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
  window.rightRegion.show(window.donateView)
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
  console.log('Switch to fourthFilterView')
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
  window.profileRegion.show(window.profileView)
  console.log('Switch to profileView')
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

