//  Popup add a beacon START

BeaconCreatePopupListItemModel = Backbone.Model.extend({
  defaults: {
    targetId: "",
    name: '',
    img: "//:0"
  }
})
BeaconCreatePopupList = Backbone.Collection.extend({
  model: BeaconCreatePopupListItemModel
})
BeaconCreatePopupItemView = Backbone.Marionette.ItemView.extend({
  template: '#gov_single_menu_item__tpl',
  tagName: 'li',
  className: function(){
    return 'menu_item '+ (this.model.get('className') || '' ) 
  },
  events: {
    'click .ui-btn': 'btnClick'
  },
  btnClick: function(){
    createObject(this.model.attributes)
  }
})

BeaconCreatePopup = Backbone.Marionette.CompositeView.extend({
  template: '#create_beacon__geo_tpl',
  id: 'create_beacon__geo',
  ui: {
    settings: '.settings'
  },
  events: {
    'click @ui.settings': 'onSettingsClick'
  },
  childView: BeaconCreatePopupItemView,
  childViewContainer: '.listview',
  collection: new BeaconCreatePopupList(),
  onSettingsClick: function(){
    showChangeGovMenuView()
  },
  initialize: function(options){
    var collection = []
    if(window.state.user.gov === "0") collection = _.clone(window.state.listMenu)
    else collection = _.clone(window.state.listMenuLMR)
    collection = _.map(collection, function(item){
      return $.extend(item, options)
    })
    this.collection.set(collection)
  },
  onDomRefresh: function(){
    if( state.user.gov !== '1' ) this.ui.settings.hide()
    this.$el.popup({
      positionTo: "#beacons-map__the-map",
      transition: "slideup",
      theme: "a",
      overlayTheme: "b"
    })
    this.$el.popup('open')
    this.$el.trigger("create")
  },
})

//  Popup add a beacon END


//  Popup beacon status START

StatusModel = Backbone.Model.extend({
  defaults: {
    id: ""
  }
})
PopupStatusBeacon = Backbone.Marionette.ItemView.extend({
  template: '#beacon_status__tpl',
  id: 'beacon-status',
  model: StatusModel,
  ui: {
    confirmBtn: '.status.one',
    landHandBtn: '.status.two',
    solvedBtn: '.status.full',
    deleteBtn: '.status.delete',
    copyBtn: '.status.copy',
    forLMR: '.lmr'
  },
  events: {
    'click @ui.confirmBtn':  'confirm',
    'click @ui.landHandBtn': 'landHand',
    'click @ui.solvedBtn':   'solved',
    'click @ui.deleteBtn':   'delete',
    'click @ui.copyBtn':     'copy'
  },
  confirm:  function(){ console.log('Btn confirm  clicked.') },
  landHand: function(){ console.log('Btn landHand clicked.') },
  solved:   function(){ console.log('Btn solved   clicked.') },
  delete:   function(){ console.log('Btn delete   clicked.') },
  copy:     function(){
    var options = { targetId: this.model.get('id') }
    this.$el.one("popupafterclose", function() {
      window.popupStatusBeaconRegion.empty()
      showBeaconCreateMenu(options)
    })
    this.$el.popup('destroy')
  },
  onBeforeShow: function(){
    if(window.state.user.gov > 0) this.ui.forLMR.show()
    else this.ui.forLMR.hide()
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


//  Popup beacon status END

//  Settings of gov beacon create popup START

ChangeGovMenuItemModel = Backbone.Model.extend({
  defaults: {
    "act": '0',   //  act: '0'=nothing, '1'=add, '2'=edit, '3'=del 
    "name": "",
    "type": "330",
    "b_type": "1000",
    "layer_type": "",
    "img": "/images/1000.png"
  },
  sendIconToServer: function(){
    if(this.get('file')){
      var that = this
      var fd = new FormData();   //  http://stackoverflow.com/questions/6974684/how-to-send-formdata-objects-with-ajax-requests-in-jquery    
      fd.append( 'picture', this.get('file') );
      var promise = $.ajax({
        url: "https://gurtom.mobi/i/up.php?type=1000",
        data: fd,
        crossDomain: true,
        processData: false,
        contentType: false,
        headers: {'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'},
        type: 'POST'
      });
      promise.done(function(data){
        that.set({ img: data })
        that.unset('file')
      })
      promise.fail(function(){
        alert("Немає зв'язку з сервером.")
      })
      return promise
    } else {
      return $.Deferred().resolve()
    }
  }
})
ChangeGovMenuItemView = Backbone.Marionette.ItemView.extend({
  template: '#change_gov_menu_item__tpl',
  tagName: 'li',
  className: 'change_gov_menu_item',
  ui: {
    btnIcon: '.change_gov_menu__icon',
    iconImg: '.a_la_icon',
    iconFile: ".take_icon__input",
    btnDel: '.change_gov_menu__delete_item',
    inputName: '.change_gov_menu__input' 
  },
  events: {
    'click @ui.btnIcon': 'iconClick',
    'change @ui.iconFile': 'changeIcon',
    'click @ui.btnDel': 'delete',
    'blur @ui.inputName': 'updateName'
  },
  iconClick: function(e){
    e.preventDefault();
    this.ui.iconFile.trigger("click");
  },
  changeIcon: function(e){
    var file = this.ui.iconFile[0].files[0]
    if(file){
      previewImage(file, this.ui.iconImg[0]);
      this.setEditStatus()
      this.model.set( {file: file} )
    }
    function previewImage(file, img) {
      if (typeof FileReader !== "undefined") {
        var reader = new FileReader();
        reader.onload = (function (theImg) {
          return function (evt) {
            theImg.src = evt.target.result;
          };
        }(img));
        reader.readAsDataURL(file);
      }
    }
  },
  delete: function(){
    if(this.model.get('act') === '1'){
      this.triggerMethod('delete:me')
    } else {
      this.model.set( {act: '3'} )
      this.$el.hide()
      this.triggerMethod('reposition:popup')
    }
  },
  updateName: function(){
    this.model.set( {name: this.ui.inputName.val()} )
    this.setEditStatus()
  },
  setEditStatus: function(){
    if(this.model.get('act') === '0'){
      this.model.set( {act: '2'} )
    }
  }
})
ChangeGovMenuCollection = Backbone.Collection.extend({
  model: ChangeGovMenuItemModel,
  url: "https://gurtom.mobi/beacon_list_layers.php"
})
ChangeGovMenuView = Backbone.Marionette.CompositeView.extend({
  template: '#change_gov_menu__tpl',
  className: 'change_gov_menu',
  childView: ChangeGovMenuItemView,
  childViewContainer: '#change_gov_menu_list',
  initialize: function(){
    var collection = _.clone(window.state.listMenuLMR)
    this.collection = new ChangeGovMenuCollection(collection)
  },
  onShow: function(){
    this.$el.trigger('create')
    // window.setMaxHeightOfInnerEl()
    // this.reposition()
  },
  ui: {
    btnAdd: '.add',
    btnSave: '.save' 
  },
  events: {
    'click @ui.btnAdd': 'add',
    'click @ui.btnSave': 'save'
  },
  childEvents: {
    'delete:me': 'deleteChild',
    'reposition:popup': 'reposition'
  },
  add: function(e){
    var newItemModel = new ChangeGovMenuItemModel({
      layer_owner_id: window.state.user.id,
      layer_type: '',
      act: '1'
    }) 
    this.collection.add(newItemModel)
    this.$childViewContainer.trigger('create')
    this.reposition()
  },
  save: function(){
    var promises = _.map(this.collection.models, function(model){
      return model.sendIconToServer()
    })
    var that = this
    $.when.apply(this, promises).done(function(){
      that.send()
    })
  },
  send: function(){
    var that = this
    var promise = this.collection.sync("create", this.collection)
    promise.done(function(response){
      console.log(response)
      window.state.listMenuLMR = response
      var $beaconCreatePopup = $('#create_beacon__geo')
      $beaconCreatePopup.one( "popupafterclose", function(event, ui) {
        window.showBeaconCreateMenu()
      })
      $beaconCreatePopup.popup( "close" )
    })
    promise.fail(function(){
      alert("Немає зв'язку з сервером.")
    })
  },
  deleteChild: function(childView){
    this.collection.remove(childView.model)
    this.reposition()
  },
  reposition: function(){
    $('#create_beacon__geo').popup('reposition', {'positionTo': "#beacons-map__the-map"})
  }
})


//  Settings of gov beacon create popup END

//  Controller

window.govCreateBeaconRegion = new Backbone.Marionette.Region({el: "#create_beacon__geo_region"})
window.popupStatusBeaconRegion = new Backbone.Marionette.Region({el: "#beacon-status__region"})
window.changeGovMenuRegion = new Backbone.Marionette.Region({el: "#create_beacon__geo"})

function showBeaconCreateMenu(options) {
  window.govCreateBeaconView = new BeaconCreatePopup(options)
  window.govCreateBeaconRegion.show(window.govCreateBeaconView)
  console.log('Switch to govCreateBeaconView')
}

function showPopupStatusBeacon(options) {
  window.model = new StatusModel(options)
  window.popupStatusBeacon = new PopupStatusBeacon({
    model: model
  })
  window.popupStatusBeaconRegion.show(window.popupStatusBeacon)
  console.log('Switch to popupStatusBeacon')
}

function showChangeGovMenuView() {
  window.changeGovMenuView = new ChangeGovMenuView();
  window.changeGovMenuRegion.show(window.changeGovMenuView);
  console.log('Switch to changeGovMenuView')
}

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
