
var LatLngModel = Backbone.Model.extend({
  defaults: {
    lat: '',
    lng: '',
    b_type: '',
    icon_url: '//:0'
  }
});
var LatLngView = Backbone.Marionette.ItemView.extend({
  model: LatLngModel,
  template: '#latlng__tpl',
  id: 'lat_lng',
  modelEvents: {
    "change": 'onLatLngChanges'   //  Rerenders .lat_lng only after new marker move across the map
  },
  onLatLngChanges: function(){
    window.moveLastMarkerTo(this.model.get('lat'), this.model.get('lng'))
    this.render()
  },
  onRender: function(){
    this.addressLookUp()
  },
  addressLookUp: function() {
    var latlng = new google.maps.LatLng(this.model.get('lat'), this.model.get('lng'))
    var Crimea = new google.maps.Polygon({paths: window.state.crimeanCoords})
    if(window.google.maps.geometry.poly.containsLocation(latlng, Crimea)){
      window.infowindow.setContent(window.localeMsg[window.localeLang].RUSSIA_OCCUPIED_TERRITORY)
      window.infowindow.open(window.state.map, window.markers[window.markers.length-1]);
    } else {
      window.geocoder.geocode({'location': latlng}, function(results, status) {
        if (status === window.google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            window.infowindow.setContent(results[0].formatted_address);
          } else {
            window.infowindow.setContent(window.localeMsg[window.localeLang].NO_ADDRESS_FOUND);
          }
        } else {
          window.infowindow.setContent(window.localeMsg[window.localeLang].NO_ADDRESS_FOUND);
        }
        window.infowindow.open(window.state.map, window.markers[window.markers.length-1]);
      });
    }
  }
})
var TitleView = Backbone.Marionette.ItemView.extend({
  template: '#title__tpl',
  templateHelpers: function(){
    var obj = {
      parent_details: this.options.model.attributes.parent_model ? this.options.model.attributes.parent_model.details : '' 
    }
    return obj
  },
  ui: { input: '#title' },
  setTitle: function(titleStr){
    this.ui.input.val(titleStr)
  }
})
var MoneyView = Backbone.Marionette.ItemView.extend({
  template: '#money__tpl',
  templateHelpers: function(){
    var obj = {
      parent_amount: this.options.model.attributes.parent_model ? this.options.model.attributes.parent_model.full[0].amount : '',
      realCurrencyOnly: !!this.model.get('realCurrencyOnly') 
    }
    return obj
  },
  initialize: function(){
    if ( this.options.model.attributes.parent_model ){
      this.selectCurrency( this.options.model.attributes.parent_model.full[0].curr )
    }
  },
  ui: {
    selector: '#currency',
    input: '#amount'
  },
  setAndLockCurrencySelector: function(curr){
    this.ui.selector.selectmenu( "enable" )
    this.selectCurrency(curr)
    this.ui.selector.selectmenu( "disable" )
  },
  unlockCurrencySelector: function(){
    this.ui.selector.selectmenu( "enable" )
    this.selectCurrency('980')
  },
  selectCurrency: function(curr){
    var currName = window.lib.currency.getName(curr)
    $('#currency-button').click()
    $("#currency-menu .ui-btn")
      .filter(function(){ return $(this).contents().text() === currName})
      .click()
  },
  setMoney: function(curr, amount){
    this.selectCurrency(curr)
    this.ui.input.val(amount)
  }
})
var CurrencyView = Backbone.Marionette.ItemView.extend({
  template: '#currency_only__tpl',
  id: 'currency_only',
  className: 'ui-field-contain'
})
var AdmLevelView = Backbone.Marionette.ItemView.extend({
  template: '#admin_level__tpl',
  id: 'admin_level'
})
var StartDateView = Backbone.Marionette.ItemView.extend({
  template: '#start_date__tpl',
  id: 'start_date',
  ui: {
    'input': '#start_date__input'
  },
  events: {
    'blur @ui.input': 'checkInput'
  },
  checkInput: function(){
    this.ui.input.val( normalizeInput(this.ui.input.val()) )
  }
})
var EndDateView = Backbone.Marionette.ItemView.extend({
  template: '#end_date__tpl',
  id: 'end_date',
  ui: {
    'input': '#end_date__input'
  },
  events: {
    'blur @ui.input': 'checkInput'
  },
  checkInput: function(){
    this.ui.input.val( normalizeInput(this.ui.input.val()) )
  }
})
var BeneficiarView = Backbone.Marionette.ItemView.extend({
  template: '#beneficiar__tpl',
  id: 'beneficiar',
  ui: {
    'input': '#beneficiar_name'
  },
})
var NCOView = Backbone.Marionette.ItemView.extend({   //  It should be a CollectionView with set of NCO models
  template: '#nco__tpl',
  id: 'nco__wrapper',
  ui: {
    input: '#nco__autocomplete-input',
    ncoUl: '#nco__ul'
  },
  events: {
    'focus @ui.input': 'enableFiltering',
    'click @ui.ncoUl': 'setNCO'
  },
  onRender: function(){
    var html = _.reduce(window.state.listNCO, function(memo, val){
      if(!this.filter || this.filter && this.filter(val)){
        memo += '<li>' + val.nco_type +' '+ val.nco_name +', '+ val.city
          +', '+ val.street +', '+ val.build +', id='+ val.id + '</li>';
      }
      return memo
    }, '', this)
    this.ui.ncoUl.html( html );
  },
  enableFiltering: function(){
    this.ui.ncoUl.show()
  },
  setNCO: function(e){
    this.ui.input.val(e.target.innerText)
    this.ui.ncoUl.hide()
    if(this.informParent) this.informParent(null, this.getNCO())
  },
  getNCO: function(){
    var str = this.ui.input.val() 
    var idIndex = str.lastIndexOf('id=')
    if(idIndex < 0) return ''
    return str.substring(idIndex + 3, str.length)
  }
})
var DescriptionView = Backbone.Marionette.ItemView.extend({
  template: '#description_tpl',
  id: 'description_view',
  ui: {
    'textarea': '#description'
  },
  templateHelpers: function(){
    var obj = {
      parent_descr: this.options.model.attributes.parent_model ? lib.htmlEntityDecode(this.options.model.attributes.parent_model.full[0].descr) : '' 
    }
    return obj
  },
  setDescr: function(descr){
    this.ui.textarea.val(descr)
  }
})
var DetailsView = Backbone.Marionette.ItemView.extend({
  template: '#details_tpl',
  className: 'message_input',
  ui: { input: '#details' },
  setDetails: function(str){
    this.ui.input.val(str)
  }
})
var ResponseView = Backbone.Marionette.ItemView.extend({
  template: '#response_tpl',
  className: 'response'
})
var TagsView = Backbone.Marionette.ItemView.extend({
  template: '#tag_tpl',
  id: 'add_tag',
  ui: {
    tagInput: '#add_tag__input',
    tagUl: '#add_tag__ul',
  },
  events: {
    'filterablebeforefilter @ui.tagUl': _.debounce(function(e, data){
      this.tagAutocomplete(e, data)
    }, 700),
    'click @ui.tagUl': 'addTagFromAutocomplete',
    'keyup @ui.tagInput':  'processTagInput',
    'click #tag_storage>div': 'deleteTag',
  },
  tagAutocomplete: function(e, data){
    var that = this,
        value = this.ui.tagInput.val(),
        html = "";
    this.ui.tagUl.html( "" );
    if ( value && value.length > 0 ) {
      this.ui.tagUl.html( "<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>" );
      this.ui.tagUl.listview( "refresh" );
      $.ajax({
        url: "https://gurtom.mobi/tags.php",
        dataType: "json",
        xhrFields: { withCredentials: true },
        crossDomain: true,
        data: {
          tag: value
        },
        success: function ( response ) {
          if(response.error){
            alert(window.localeMsg[window.localeLang][response.error])
            return
          }
          $.each( response, function ( i, val ) {
            html += '<li>' + val.tag.replace(/&amp;#39;/g, "'") + '</li>';
          });
          that.ui.tagUl.html( html );
          that.ui.tagUl.listview( "refresh" );
          that.ui.tagUl.trigger( "updatelayout");
        },
        error: function(){
          alert(window.localeMsg[window.localeLang].CONNECTION_ERROR)
        }
      })
    }
  }, 
  addTagFromAutocomplete: function(e){
    $("#tag_storage").append( "<div class='ui-icon-delete'>" +'#'+ e.target.innerText +"</div>" )
    this.ui.tagInput.val('')
    this.ui.tagUl.html( '' );
    this.ui.tagUl.listview( "refresh" );
    this.ui.tagUl.trigger( "updatelayout");
  },
  processTagInput: function(e){
    if(e.which === 13 && e.target.value.length > 1) {
      $("#tag_storage").append( "<div class='ui-icon-delete'>" +'#'+ e.target.value +"</div>" )
      var promise = $.ajax({
        url: "https://gurtom.mobi/tags.php",
        dataType: "json",
        xhrFields: { withCredentials: true },
        crossDomain: true,
        data: {
          'tag': e.target.value,
          'new': '1'
        }
      })
      promise.success(function(response){
        if(response.error){
          alert(window.localeMsg[window.localeLang][response.error])
        }
      })
      promise.error(function(){
        alert(window.localeMsg[window.localeLang].CONNECTION_ERROR)
      })
      promise.always(function(response){
        console.log(response)
      })
      e.target.value = ''
    } else {
      var filter = /^[A-ZА-ЯІЇЄa-zа-яіїє'0-9 ]+$/
      if(!filter.test(e.target.value)){
        e.target.value = _.filter(e.target.value, function(item){
          return filter.test(item)
        }).join('')
      }
    }
  },
  deleteTag: function(e){
    e.target.parentElement.removeChild(e.target)
  },
  getTags: function(){
    return _.reduce($('#tag_storage .ui-icon-delete'), function(acc, item, index){
      return acc + ((index>0) ? ',' : '') + item.innerText.substring(1, item.innerText.length)
    }, '')
  },
  setTags: function(tagsArray){
    for(var i=0; i< tagsArray.length; i++){
      $("#tag_storage").append( "<div class='ui-icon-delete'>#" + tagsArray[i].tag +"</div>" )
    }
  }
})
var PhotoView = Backbone.Marionette.ItemView.extend({
  template: '#photo_tpl',
  id: 'photo',
  ui: {
    photo: '#photo__input',
    choosePhotoBtn: '#photo__choose_file',
    removePhotoBtn: '#photo__remove',
    previewPhoto: '#photo__preview'
  },
  events: {
    'click @ui.choosePhotoBtn': 'takePhotoBtnClick',
    'change @ui.photo': 'takePhoto',
    'click @ui.removePhotoBtn': 'removePhoto',
  },
  takePhotoBtnClick: function(e){
    this.ui.photo.trigger("click");
  },
  takePhoto: function(e){
    var file = this.ui.photo[0].files[0]
    this.ui.previewPhoto.empty();
    if(file){
      previewImage(file);
      this.ui.removePhotoBtn.show()
    } else {
      this.ui.removePhotoBtn.hide()
    }
    function previewImage(file) {
      if (typeof FileReader !== "undefined") {
        var container = document.getElementById("photo__preview"),
            img = document.createElement("img"),
            reader;
        container.appendChild(img);
        reader = new FileReader();
        reader.onload = (function (theImg) {
          return function (evt) {
            theImg.src = evt.target.result;
          };
        }(img));
        reader.readAsDataURL(file);
      }
    }
  },
  setLoadedPhoto: function(imgURL){
    var container = document.getElementById("photo__preview"),
        img = document.createElement("img")
    img.src = 'https://gurtom.mobi' + imgURL
    container.appendChild(img);
    $('#img').val(imgURL)
    this.ui.removePhotoBtn.show()
  },
  removePhoto: function(){
    this.ui.previewPhoto.empty()
    this.ui.photo.val('')
    this.ui.removePhotoBtn.hide()
  },
})
var PhoneView = Backbone.Marionette.ItemView.extend({
  template: '#phone_tpl',
  templateHelpers: function(){
    var obj = {
      parent_phone: this.options.model.attributes.parent_model ? this.options.model.attributes.parent_model.full[0].amount : '',
    }
    return obj
  },
  className: 'phone_number ui-field-contain',
  ui: {
    'input': '#phone_num__input'
  },
  setPhone: function(numStr){
    this.ui.input.val(numStr)
  }
})
var UsrCountblOptionView = Backbone.Marionette.ItemView.extend({
  template: '#option__tpl',
  tagName: 'option',
  attributes: function(){
    var attrib = {}
    if(this.model.get('index') !== -1){
      attrib = {
        "value": this.model.get('index'),
        "selected": true 
      }
    }
    return attrib
  }
})
var UsrCountblView = Backbone.Marionette.CompositeView.extend({
  template: '#select_menu__tpl',
  attributes: {
    'data-iconpos': "noicon"
  },
  childViewContainer: "#options__select",
  childView: UsrCountblOptionView,
  initialize: function(){
    this.model = new Backbone.Model({
      title: window.localeMsg[window.localeLang].USER_STATUSES_ALLOWED_TO_VOTE,
      required: '',
      label: window.localeMsg[window.localeLang].WHO_WILL_VOTE,
      inputName: 'usr_countbl',
      multi: true
    })
    var first = [{
      index: -1,
      optext: this.model.get('label')
    }]
    var array = _.map(window.state.usrAuthLvl, function(value, index){
      return {
        index: index,
        optext: value
      }
    })
    this.collection = new Backbone.Collection( _.union(first, array) )
  }
})
var AgeView = Backbone.Marionette.ItemView.extend({
  template: '#age__tpl',
  id: 'age'
})
var SupportView = Backbone.Marionette.ItemView.extend({
  template: '#support__tpl',
  id: 'support'
})
var SupportFinishDateView = Backbone.Marionette.ItemView.extend({
  template: '#support_finish_date__tpl',
  id: 'support_finish_date',
  ui: {
    'input': '#support_finish_date__input'
  },
  events: {
    'blur @ui.input': 'checkInput'
  },
  checkInput: function(){
    this.ui.input.val( normalizeInput(this.ui.input.val()) )
  }
})
var PrivateView = Backbone.Marionette.ItemView.extend({
  template: '#private_tpl',
  ui: {
    publicOrPriv: '#public_private_switch__input',
    privatGroup: '#select_group__autocomplete-input',
  },
  events: {
    'change @ui.publicOrPriv': 'onChangePrivat',
    'click @ui.privatGroup': 'input_click',
    'filterablebeforefilter #select_group__autocomplete': 'groupAutocomplete',
    'click #select_group__autocomplete': 'groupAutocompleteClick',
    'click #select_group .ui-input-search .ui-input-clear': 'selectGroupBtnClearClick',
  },
  onChangePrivat: function () {
    if($('#public_private_switch__input').is(':checked')){
      $('#select_group').show()
    } else {
      this.ui.privatGroup.val(null)
      $('#select_group').hide()
    }
  },
  input_click: function(e){
    $(e.target).attr('data-id', '').val('')
  },
  groupAutocomplete: function(e, data){
    var $ul = $( '#select_group__autocomplete' ),
      $input = $( data.input ),
      value = $input.val(),
      html = "";
    $ul.html( "" );
    if ( value && value.length > 2 ) {
      $ul.html( "<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>" );
      $ul.listview( "refresh" );
      $.ajax({
        url: "https://gurtom.mobi/groups.php", //  !!!
        dataType: "json",
        xhrFields: { withCredentials: true },
        crossDomain: true,
        data: {
          filter: $input.val()
        },
        success: function ( response ) {
          if(response.error){
            alert(window.localeMsg[window.localeLang][response.error])
            return
          }
          $.each( response, function ( i, val ) {
            html += '<li data-id="'+ val.id +'">' + val.org + '</li>';
          });
          $ul.html( html );
          $ul.listview( "refresh" );
          $ul.trigger( "updatelayout");
        },
        error: function(){
          alert(window.localeMsg[window.localeLang].CONNECTION_ERROR)
        }
      })
    }
  },
  groupAutocompleteClick: function(e){
    $input = $('#select_group__autocomplete-input')
    $input.attr('data-id', $(e.target).attr('data-id'))
    $input.val(e.target.innerText)
    var $ul = $( '#select_group__autocomplete' )
    $ul.html( '' );
    $ul.listview( "refresh" );
    $ul.trigger( "updatelayout");
  },
  selectGroupBtnClearClick:  function(){
    $('#select_group__autocomplete-input').attr('data-id', '')
  },
  getPrivate: function(){
    var str = this.ui.privatGroup.val()
  }
})
var SphereItemModel = Backbone.Model.extend({
  initialize: function() {
    var menu = this.get("menu");
    this.set("menu", new SphereMenuCollection(menu));
  }
});
var SphereMenuCollection = Backbone.Collection.extend({
  model: SphereItemModel
});
var SphereCompositeView = Marionette.CompositeView.extend({
  template: '#sphere__tpl',
  attributes: function(){
    if(this.model.get('idc')){
      return {
        'class': "ui-radio idc-input"
      }
    } else {
      return {
        'data-role': "collapsible",
        'data-inset': "true",
        'data-iconpos': "noicon"
      }
    }
  },
  childViewContainer: ".composite",
  initialize: function() {
    this.collection = this.model.get("menu");
  }
});
var SphereGeneralView = Marionette.CompositeView.extend({
  template: '#sphere_title__tpl',
  tagName: 'fieldset',
  attributes: {
    'data-role': "collapsible",
    'data-iconpos': "noicon"
  },
  childView: SphereCompositeView,
  childViewContainer: ".composite"
});
var ObjectCreateView = Backbone.Marionette.LayoutView.extend({
  template: '#object_create_tpl',
  templateHelpers: function(){
    var obj = {
      layer_owner_id: this.model.get('layer_owner_id') || '',
      uniq_id: this.model.get('id') || '',
      parent_id: this.options.parent_id || '',
      parent_type: this.options.parent_type || '',
      targetId: this.options.targetId || '',
      chat: +this.options.targetId>0 ? serializeState(this.options.targetId, this.options.lat, this.options.lng) : ''
    }
    return obj
  },
  id: 'object_create_dialog',
  className: 'project_create__wrapper css__create_form',
  attributes: {
    "data-role": "content"
  },
  regions: {
    latLng: '.wrapper__lat_lng',
    title: '.wrapper__title',
    description: '.wrapper__description',
    money: '.wrapper__money',
    currency: '.wrapper__currency_only',
    startDate: '.wrapper__start_date',
    endDate: '.wrapper__end_date',
    beneficiar: '.wrapper__beneficiar',
    programID: '.wrapper__programID',
    nco: '.wrapper__nco',
    tag: '.wrapper__tag',
    photo: '.wrapper__photo',
    phone: '.wrapper__phone',
    admLevel: '.wrapper__admin_level',
    usrCountbl: '.wrapper__usr_countbl',
    age: '.wrapper__age',
    support: '.wrapper__support',
    supportFinishDate: '.wrapper__support_finish_date',
    sphere: '.wrapper__sphere',
    details: '.wrapper__details',
    response: '.wrapper__response',
    layerType: '.wrapper__layer_type',
    private: '.wrapper__private'
  },
  ui: {
    submitBtn: '#submit_btn',
    progressVal: '.submit .progressval',
    progressBar: '.submit .progressbar',
    progressWrap: '.submit .progress_bar__wrapper',
    form: '#object_create',
    closeBtn: '.header a'
  },
  onBeforeShow: function() {
    // if(this.options.targetId && +this.options.targetId > 0 && !this.options.full) {
    //   this.fetchObjectModelById()
    // }
    if(this.model.get('lat') && this.model.get('lng')) {
      var latLngModel = new LatLngModel({
        'lat': this.model.get('lat'),
        'lng': this.model.get('lng'),
        'b_type': this.model.get('b_type'),
        'icon_url': this.model.get('img'),
        'name': this.model.get('name')
      })
      LatLngView = LatLngView.extend({ model: latLngModel })
      this.showChildView('latLng', new LatLngView());
    }

    var t = +this.model.get('type'),
        g = +window.state.user.gov
    if(t==1 ||t==2 ||t==3 ||t==4 ||t==5 ||t==330                                           ) this.addNewChild('title', TitleView, true)
    if(t==1 ||t==2 ||t==3 ||t==4 ||t==5 ||t==330                                           ) this.addNewChild('description', DescriptionView, true)
    if(              t==3 ||t==4 ||t==5                                                    ) this.addNewChild('nco', NCOView, false)
    if(t==1 ||t==2 ||t==3 ||t==4 ||t==5 ||t==330 ||t==69 ||t==96 ||t==777 ||t==911         ) this.addNewChild('photo', PhotoView, false)
    if(       t==2 ||t==3 ||t==4 ||t==5                                                    ) this.addNewChild('tag', TagsView, true)
    if(                                   t==330 ||t==69 ||t==96 ||t==777 ||t==911         ) this.addNewChild('tag', TagsView, false)
    if(       t==2                                                                         ) this.addNewChild('currency', CurrencyView, true)
    if(t==1 ||       t==3 ||t==4 ||t==5                                                    ) this.addNewChild('endDate', EndDateView, true, (t==1 ? window.localeMsg[window.localeLang].CHOOSE_VOTING_END_DATE : undefined))
    if(t==1 ||              t==4                                                           ) this.addNewChild('startDate', StartDateView, true, (t==1 ? window.localeMsg[window.localeLang].CHOOSE_VOTING_START_DATE : undefined))
    if(                            t==5                                                    ) this.addNewChild('beneficiar', BeneficiarView, true)
    if(                                   t==330                          ||t==911         ) this.addNewChild('phone', PhoneView, true)
    if(                                            t==69 ||t==96 ||t==777                  ) this.addNewChild('phone', PhoneView, false)
    if(              t==3 ||t==4 ||t==5 ||t==330                                           ) this.addNewChild('money', MoneyView, true, (t==330 ? window.localeMsg[window.localeLang].PROJECT_COST : undefined))
    if(t==1                                                                                ) this.addNewChild('usrCountbl', UsrCountblView, true)
    if(t==1                                                                                ) this.addNewChild('age', AgeView, true)
    if(t==1                                                                                ) this.addNewChild('support', SupportView, true)
    if(t==1                                                                                ) this.addNewChild('supportFinishDate', SupportFinishDateView, true)
    if(t==1                                                                                ) this.addNewChild('sphere', SphereGeneralView, true)
    if(                                                            t==777 ||t==911         ) this.addNewChild('details', DetailsView, true)
    if(                                            t==69 ||t==96                           ) this.addNewChild('details', DetailsView, false)
    if(                                                            t==777 ||t==911         ) this.addNewChild('private', PrivateView, false)
 // if(                                   t==330                                   && g==0 ) this.addNewChild('admLevel', AdmLevelView, true)
 // if(                                                            t==777 ||t==911         ) this.addNewChild('response', ResponseView, false)
 // if(                                                            t==777 ||t==911         ) this.addNewChild('layerType', LayerTypeView, false)
 // if(              t==3                                                                  ) this.addNewChild('programID', ProgramIdView, true)
  },
  addNewChild: function(region, ViewItem, req, label){
    if(region === 'sphere') {
      var sphereMenus = new SphereMenuCollection(window.state.sphereJSON)
      var viewItem = new SphereGeneralView({
        collection: sphereMenus
      });
    } else {
      var opt = {},
          viewModel = null,
          ViewItemExt = null,
          viewItem = null
      opt = {
        'required': req ? 'required' : '',
        'label': label ? label : undefined
      }
      if( this.model.attributes.parent_model ) $.extend(opt, { 'parent_model': this.model.attributes.parent_model })
      viewModel = new Backbone.Model(opt) 
      viewItem = new ViewItem({
        model: viewModel
      })
    }
    this.showChildView(region, viewItem)
  },
  // fetchObjectModelById: function(){
  //   this.model.url = 'https://gurtom.mobi/beacon_cards.php?b_id=' + this.model.get('targetId')
  //   $.mobile.loading('show')
  //   var that = this
  //   this.model.fetch({
  //     success: function(){
  //       $.mobile.loading('hide')
  //       that.fillFormWithTargetData()
  //     },
  //     error: function(){
  //       $.mobile.loading('hide')
  //     }
  //   })
  // },
  fillFormWithTargetData: function(){   //  Not completed. It lacks fields and conditions to display
    switch ( +this.options.type || +this.options.b_type ) {
      case 911:
      case 777:
      case 69:
      case 96:
        this.details.currentView.setDetails(this.options.details)
        this.photo.currentView.setLoadedPhoto(this.options.b_img)
        this.tag.currentView.setTags(this.options.tags)
        this.phone.currentView.setPhone(
          this.options.full ? this.options.full[0].phone : ''
        )
        break;
      case 330:
        this.title.currentView.setTitle(this.options.details)
        this.description.currentView.setDescr(
          this.options.full ? this.options.full[0].descr : ''
        )
        this.photo.currentView.setLoadedPhoto(this.options.b_img)
        this.tag.currentView.setTags(this.options.tags)
        this.money.currentView.setMoney(
          this.options.full ? this.options.full[0].curr : '',
          this.options.full ? this.options.full[0].amount : ''
        )
        this.phone.currentView.setPhone(
          this.options.full ? this.options.full[0].phone : ''
        )
        break;
      default:
        alert(window.localeMsg[window.localeLang].AUTOCOMPLETE_DOES_NOT_WORK_FOR_THIS_BEACON_TYPE)
        return
    }
  },
  onShow: function(){
    var that = this
    this.$el.one('create', function(){
      if ( that.options.targetId && +that.options.targetId > 0 ){
        that.fillFormWithTargetData()
      }
    })
    this.$el.trigger('create')
    $('#options__select-button').one('click', function(){
      $('#options__select-dialog .ui-dialog-contain .ui-header .ui-btn').removeClass( "ui-icon-delete" ).addClass( "ui-icon-close" )
      $("#options__select-listbox-popup .ui-popup .ui-header a").removeClass( "ui-icon-delete" ).addClass( "ui-icon-close" )
    })
  },
  events: {
    'click @ui.submitBtn': 'checkBeaconPosition',
    'click @ui.closeBtn': 'exit'
  },
  checkBeaconPosition: function(e){
    e.preventDefault()
    var $warn = $('.warning'),
        that = this
    $warn.empty()
    window.mainRegion.showMap()
    var msg = window.localeMsg[window.localeLang].IS_BEACON_IN_PROPER_POSITION
    $warn.append('<p class="cofirmation">'
      + msg
      +'</p><button class="confirm">'
      + window.localeMsg[window.localeLang].YES
      +'</button>')
    $warn.css({ "top": "60px" }).show()
    $('.warning .confirm').click(function(){
      $warn.empty().hide()
      window.mainRegion.showBeaconsCards()
      that.sendPhoto()
    })
  },
  sendPhoto: function(e){
    if(!this.verifyInputs(this)) return
    var file = this.photo.currentView.ui.photo[0].files[0]
    if (file){
      var client = new XMLHttpRequest(),
          that = this
      client.upload.onprogress = function(e) {
        if (e.lengthComputable) {
          var percentCompleted = (100 * e.loaded / e.total).toFixed(0) + '%';
          that.ui.progressBar.css({ "width": percentCompleted })
          that.ui.progressVal.text(percentCompleted)
        }
      }
      client.onerror = function(){
        alert(window.localeMsg[window.localeLang].CONNECTION_ERROR)
        that.ui.progressWrap.hide()
      }
      client.onreadystatechange = function(){
        if (client.readyState == 4 && client.status == 200){
          var response = JSON.parse(client.response)
          if(response.error){
            that.ui.progressWrap.hide()
            console.log(response.msg)
            alert(window.localeMsg[window.localeLang][response.error] || response.error)
          } else {
            $('#img').val(response.img)
            that.sendForm()
          }
        }
      }
      this.ui.progressBar.css({ "width": 0 })
      this.ui.progressWrap.show()
      var formData = new FormData();
      formData.append("picture", file);
      client.open("post", "https://gurtom.mobi/i/up.php?type="
      + this.model.get('type') , true);
      client.setRequestHeader('Accept'
      ,'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
      client.send(formData);
    } else this.sendForm()
  },
  verifyInputs: function(that){
    if(this.tag.currentView){
      var tags = ''
      if(tags = this.tag.currentView.getTags()) {
        $('#tags').val(tags)
      } else if(this.tag.currentView.model && this.tag.currentView.model.get('required')) {
        alert(window.localeMsg[window.localeLang].TAG_REQUIRED)
        return validationFailed()
      } else {
        $('#tags').val(null)
      }
    }
    var nco = ''
    if(this.nco.currentView && (nco = this.nco.currentView.getNCO())) {
      $('#nco').val(nco)
    } else {
      $('#nco').val(null)
    }
    var programID = ''
    if(this.programID.currentView) {
      if(programID = this.programID.currentView.getProgramID()){
        $('#program_id').val(programID)
      } else if(this.programID.currentView.model && this.programID.currentView.model.get('required')){
        alert(window.localeMsg[window.localeLang].PROGRAM_ID_REQUIRED)
        return validationFailed()
      } else {
        $('#program_id').val(null)
      }
    }
    if(this.usrCountbl.currentView){
      var today = getTodayWithZeroTime(),
          dateFinishSupport = new Date(normalizeInput( $('#support_finish_date__input').val() )),
          dateStartVoting = new Date(normalizeInput( $('#start_date__input').val() )),
          dateEndVoting = new Date(normalizeInput( $('#end_date__input').val() ))
      if( today > dateFinishSupport ) {
        alert(window.localeMsg[window.localeLang].WRONG_DATE_OF_SUPPORT_COMPLETE)
        return validationFailed()
      } else if( dateFinishSupport > dateStartVoting ) {
        alert(window.localeMsg[window.localeLang].WRONG_DATE_OF_VOTING_START)
        return validationFailed()
      } else if( dateStartVoting >= dateEndVoting ) {
        alert(window.localeMsg[window.localeLang].WRONG_DATE_OF_VOTING_COMPLETE)
        return validationFailed()
      }
      var $usr_countbl__select = $('#options__select')
      if($usr_countbl__select.val().length > 0){
        $('#options').val($usr_countbl__select.val().join())
      } else {
        alert(window.localeMsg[window.localeLang].DEFINE_VOTERS_STATUSES)
        return validationFailed()
      }
    }
    if(this.private.currentView){
      var privateView = this.private.currentView,
          val = privateView.getPrivate()
      if(val) {
        $('#private_group').val(val)
      } else if(privateView.model && privateView.model.get('required')) {
        alert(window.localeMsg[window.localeLang].GROUP_CHOISE_REQUIRED)
        return validationFailed()
      } else {
        $('#private_group').val(null)
      }
    }
    if(this.phone.currentView){
      var val = this.phone.currentView.ui.input.val(),
          reg = /^\d+$/
      if(reg.test(val) && val.length >= 12 && val.length <= 16) {
      } else if(val.length === 0) {
        if (this.model.get('required') === 'required'){
          alert(window.localeMsg[window.localeLang].PHONE_NUMBER_REQUIRED)
          return validationFailed()
        }
      } else {
        alert(window.localeMsg[window.localeLang].CORRECT_PHONE_NUMBER)
        return validationFailed()
      }
    }
    return true
    function validationFailed(){
      that.ui.progressWrap.hide()
      return false
    }
  },
  sendForm: function(){
    $('#object_create').children(':input[value=""]').attr("disabled", "disabled")   //  http://stackoverflow.com/questions/5904437/jquery-how-to-remove-blank-fields-from-a-form-before-submitting
    var that = this,
        url = ''
    switch (+this.model.get('type')) {
      case 1:
        url = "https://gurtom.mobi/votings_simple_add.php"
        break;
      case 2:
        url = "https://gurtom.mobi/program_add.php"
        break;
      case 3:
        url = "https://gurtom.mobi/project_propositions_add.php"
        break;
      case 4:
        url = "https://gurtom.mobi/project_add.php"
        break;
      case 5:
        url = "https://gurtom.mobi/request_add.php"
        break;
      case 69:
      case 96:
      case 330:
      case 555:
      case 777:
      case 911:
        url = "https://gurtom.mobi/beacon_add.php"
        break;
    }
    var promise = $.ajax({
      type: "POST",
      url: url,
      dataType: "json",
      xhrFields: { withCredentials: true },
      crossDomain: true,
      data: that.ui.form.serialize()
    })
    promise.done(function( response ){
      if(typeof response !== "object"){
        alert( window.localeMsg[window.localeLang].FAIL )
        return
      }
      if(response.error){
        alert(window.localeMsg[window.localeLang][response.error] || response.error)
        return
      }
      window.state.singleBeacon = true
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
      if(that.latLng.currentView){
        markers[markers.length-1].setDraggable(false)
        showBeaconFullView(res[0])                      //  Add alert on error!
      } else {
        that.exit()
      }
    })
    promise.fail(function(){
      alert(window.localeMsg[window.localeLang].CONNECTION_ERROR)
    })
    promise.always(function(){
      $(that.ui.progressWrap).hide()
    })
  },
  exit: function(){
    window.closeSingleBeaconMode()
    $('.warning').empty().hide()
  },
  initialize: function(options){
    this.model = new Backbone.Model(options.model)
    delete options.model
    this.options = options
    this.childViewOptions = function() {
      return this.options
    }
    // if ( this.options )
  }
})
