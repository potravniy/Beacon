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
var OptionForNativeSelectComponent = Backbone.Marionette.ItemView.extend({
  template: '#option__tpl',
  tagName: 'option',
  attributes: function() {
    return { "value": this.model.get('type') }
  },
  templateHelpers: function(){
    return { optext: this.model.get('name') }
  },
  initialize: function(options){
    if( options.type === this.model.get('type') ){
      this.$el.prop('selected', 'selected')
    }
  }
})
var NativeSelectComponent = Backbone.Marionette.CollectionView.extend({
  tagName: 'select',
  className: 'change_gov_menu__type',
  attributes: {
    'data-inline': "true",
    'data-mini': "true",
    'data-iconpos': "noicon",
    'data-native-menu': "true"
  },
  childView: OptionForNativeSelectComponent,
  childViewOptions: function(){
    return { type: this.model.get('type') }
  } ,
  initialize: function(options){
    this.model = new Backbone.Model(options.parentModel)
    this.collection = new Backbone.Collection(options.collection)
    if( this.model.get('act') !== '1' ){
      this.$el.prop({ 'disabled': 'disabled' })
    }
  }
})
ChangeGovMenuItemView = Backbone.Marionette.LayoutView.extend({
  template: '#change_gov_menu_item__tpl',
  tagName: 'li',
  className: 'change_gov_menu_item',
  regions: {
    select: '.change_gov_menu__select_type',
  },
  ui: {
    btnIcon: '.change_gov_menu__icon',
    iconImg: '.a_la_icon',
    iconFile: ".take_icon__input",
    btnDel: '.change_gov_menu__delete_item',
    inputName: '.change_gov_menu__input',
    selectType: '.ui-select select'
  },
  onBeforeShow: function(){
    var options = {
      parentModel: this.model.attributes,
      collection: window.state.listMenu
    }
    var nativeSelectComponent = new NativeSelectComponent(options)
    this.showChildView('select', nativeSelectComponent)
  },
  events: {
    'click @ui.btnIcon': 'iconClick',
    'change @ui.iconFile': 'changeIcon',
    'click @ui.btnDel': 'delete',
    'blur @ui.inputName': 'updateName',
    'change @ui.selectType': 'selectType'
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
  selectType: function(){
    this.model.set('type', this.$el.find('.ui-select select').val())
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
    var collection = _.clone(window.state.listMenuOrg)
    this.collection = new ChangeGovMenuCollection(collection)
  },
  onShow: function(){
    this.onResize()
    this.$el.trigger('create')
    var that = this
    setTimeout(function(){
      var $thisPopup = $('#create_beacon__geo_region')
      $thisPopup.popup({ overlayTheme: "b" });
      $thisPopup.popup('open')
      $thisPopup.popup('reposition', {'positionTo': "#beacons-map__the-map"})
      if ( that.collection.length === 0 ) that.ui.btnAdd.click()
    }, 500)
  },
  ui: {
    btnAdd: '.add',
    btnSave: '.save',
    listView: '.listview_wrapper > .listview'
  },
  events: {
    'click @ui.btnAdd': 'add',
    'click @ui.btnSave': 'save',
    'resize window': 'onResize'
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
    this.ui.listView.animate({ scrollTop: this.ui.listView.height() }, 500)
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
  onResize: function(){
    this.ui.listView.css({ 'max-height': 0.7*window.innerHeight })
  } ,
  send: function(){
    var that = this
    var promise = this.collection.sync("create", this.collection)
    promise.done(function(response){
      console.log(response)
      var collectionRemoved = [];
      _.each(changeGovMenuView.collection.models, function(item){
        var model=item.attributes
        if (model.act === '3') {
          collectionRemoved.push( { layer_type: model.layer_type, name: model.name } )
        }
      })
      var answer = _.map(response, function(item){
        return { layer_type: item.layer_type, name: item.name }
      })
      var notErased = []
      _.each(collectionRemoved, function(item){
        var isReturned = _.some(answer, function(el){
          return el.layer_type === item.layer_type
        })
        if (isReturned) notErased.push(item)
      })

      var notErasedTxt = _.reduce(notErased, function(acc, item){
        return acc +' '+ item.name + '\n' 
      },'\n')
      if(notErased.length > 0){
        alert('Наступні шари меню:\n'+ notErasedTxt +'\nне були видалені,оскільки в них є діючі маячки.')
      }
      window.state.listMenuOrg = response
      var $beaconCreatePopup = $('#create_beacon__geo_region')
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
    $('#create_beacon__geo_region').popup('reposition', {'positionTo': "#beacons-map__the-map"})
  }
})

