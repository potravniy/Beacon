// var beaconApp = new Marionette.Application();


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
    chat: [],
    full: ''
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
    var list = '',
        tags = this.model.get('tags')
    if(tags && tags.length > 0){
      list = "#"+_.map(tags, function(item){ return item.tag }).join(', #')
    }
    return { tagList: list };
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
    var chat = this.model.get('chat')
    this.collection = new MsgGroup(chat);
  },
  ui: {
    expandBtn: '.expanding_view .btn_wrapper',
    beaconStatusBtn: '.beacon_status',
    img: '.photo'
  },
  events: {
    'click .share':  'onClickShare',
    'click .link':   'onClickLink',
    'click .error':  'onClickAbuse',
    'click .star':   'onClickStar',
    'click .add':    'onClickAdd',
    'click .header': 'onThisViewClick',
    'click .beacon-content': 'onThisViewClick',
    'click .expanding_btn': 'goToSingleView',
    'click @ui.beaconStatusBtn': 'onClickStatusBtn',
    'click @ui.img': 'onClickImg'
  },
  onBeforeShow: function(){
    if(this.model.get('b_type') == '330' || this.model.get('type') == '330'
      || this.model.get('b_type') == '1' || this.model.get('type') == '1'){
      this.ui.expandBtn.show()
    }
  },
  onDomRefresh: function(){
    this.$el.trigger("create")
  },
  onClickShare: function (event) {
    event.stopPropagation()
    console.log('button "share" clicked id=' + this.model.get('id'))
  },
  onClickLink: function (event) {
    event.stopPropagation()
    console.log('button "link" clicked id=' + this.model.get('id'))
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
    event.stopPropagation()
    console.log('button "add" clicked id=' + this.model.get('id'))
  },
  onClickStatusBtn: function(){
    showPopupStatusBeacon({ id: this.model.get('id') })
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
    window.showBeaconFullView(this.model.get('id'))
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
    if( scroll < 4 ){
      if(window.beaconsListView) beaconsList.getNextPage()
    }
  }
})

//  End of section BeaconsView
//  Start of section BeaconCreate

// BeaconCreateModel = Backbone.Model.extend({
//   defaults: {
//     'lat': '',        //  decimal(12,8)
//     'lng': '',        //  decimal(12,8)
//     'source': '',     //  tinyint(1)
//     'img': '',        //  varchar(100)
//     'b_type': '',     //  int(11)
//     'layer_type': '', //  int(11)
//     'details': '',    //  varchar(255)
//     'result': '',     //  tinyint(1)
//     'phone': '',      //  varchar(45)
//     'email': '',      //  varchar(45)
//     'private': '',    //  bigint(20)
//     'tags': '',       //  string, string...
//     'icon_url': '//:0'
//   },
//   initialize: function(){
//     this.set({icon_url: getIconURL(this.attributes, true)})
//   }
// })
// BeaconCreateView = Backbone.Marionette.ItemView.extend({
//   template: "#beacon_create_tpl",
//   className: 'create_object ui-content',
//   attributes: {
//     "data-role": "content"
//   },
//   model: BeaconCreateModel,
//   modelEvents: {
//     "change": "modelChanged"   //  Rerenders .lat_lng only after new marker move across the map
//   },
//   modelChanged: function(e){
//     if(e.changed.lat || e.changed.lng) {
//       var data = this.serializeData()
//       data = this.mixinTemplateHelpers(data)
//       var html = Marionette.Renderer.render(this.getTemplate(), data, this)
//       this.$el.find('.lat_lng').replaceWith($('.lat_lng', html));
//     }
//   },
//   onDomRefresh: function(){
//     this.$el.trigger("create")
//   },
//   ui: {
//     msg: '#message_input__textarea',
//     photo: '#take_photo__input',
//     tag_input: '#add_tag__autocomplete-input',
//     tag_autocomplete_list: '#add_tag__autocomplete',
//     tag_store: '#tag_store',
//     msgCategory: '#select_category__autocomplete-input',
//     phone: 'phone_number__input',
//     response: '#expected_response__input',
//     publicOrPriv: '#public_private_switch__input',
//     privatGroup: '#select_group__autocomplete-input',
//     submitBtn: '.submit_btn',
//     progressVal: '.submit .progressval',
//     progressBar: '.submit .progressbar',
//     progressWrap: '.submit .progress_bar__wrapper'
//   },
//   onChangePrivat: function () {
//     if($('#public_private_switch__input').is(':checked')){
//       $('.select_group').show()
//     } else {
//       $('.select_group').hide()
//     }
//   },
//   onClickSubmit: function () {
//     //  set phone
//     if(this.model.get('b_type') == 911 || this.model.get('b_type') == 777) {
//       var phone = '+' + $('#phone_number__input').val()
//       var regex = /^\+(?:[0-9] ?){11,14}[0-9]$/;
//       if (regex.test(phone)) {
//         this.model.set('phone', phone)
//       } else {
//         alert('Номер телефону невірний.')
//         return
//       }
//     }
//     //  set details
//     if(this.ui.msg.val().length > 15) {
//       this.model.set('details', this.ui.msg.val())
//     } else {
//       alert('Повідомлення не може містити менше 15 літер.')
//       return
//     }
//     //  set tags
//     var tags = $( '#tag_store .ui-icon-delete' ).map(function() {
//         return this.innerText.substring(1, this.innerText.length)
//       })
//       .get()
//       .join();
//     this.model.set('tags', tags)
//     //  set layer_type
//     var layer_type = $('#select_category__autocomplete-input').attr('data-id')
//     this.model.set('layer_type', layer_type)
//     //  set private
//     var private = $('#select_group__autocomplete-input').attr('data-id')
//     this.model.set('private', private)
//     //  send photo
//     var file = $("#take_photo__input")[0].files[0],
//         that = this
//     if (file){
//       var client = new XMLHttpRequest()
//       function upload(){
//         that.ui.progressBar.css({ "width": 0 })
//         that.ui.progressWrap.show()
//         var formData = new FormData();
//         formData.append("picture", file);
//         client.open("post", "https://gurtom.mobi/i/up.php?type="
//         + that.model.get('b_type') , true);
//         client.setRequestHeader('Accept'
//         ,'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
//         client.send(formData);
//       }
//       client.upload.onprogress = function(e) {
//         if (e.lengthComputable) {
//           var percentCompleted = (100 * e.loaded / e.total).toFixed(0) + '%';
//           that.ui.progressBar.css({ "width": percentCompleted })
//           that.ui.progressVal.text(percentCompleted)
//         }
//       }
//       client.onerror = function(){
//         console.log(client.responseText);
//         that.ui.progressWrap.hide()
//       }
//       client.onreadystatechange = function(){
//         if (client.readyState == 4 && client.status == 200){
//           console.log(client.responseText);
//           that.model.set('img', client.responseText)
//           sendNewBeaconAJAX()
//         }
//       }
//       upload();  
//     } else sendNewBeaconAJAX()
//     //  Send new beacon
//     function sendNewBeaconAJAX() {
//       var promise = $.ajax({
//         type: "POST",
//         url: "https://gurtom.mobi/beacon_add.php",
//         dataType: "json",
//         xhrFields: { withCredentials: true },
//         crossDomain: true,
//         data: that.model.attributes
//       })
//       promise.done(function ( response ) {
//         window.state.singleBeacon = true
//         markers[markers.length-1].setDraggable(false)
//         beaconsList.set(response, {reset: true})
//         closeBeaconNew()    // showBeaconsListView()
//       })
//       promise.fail(function(response){
//         alert(response)
//       })
//       promise.always(function(){
//         $('that.ui.progressWrap').hide()
//       })
//     }
//   },
//   tagAutocomplete: function(e, data){
//     var $ul = $( '#add_tag__autocomplete' ),
//       $input = $( data.input ),
//       value = $input.val(),
//       html = "";
//     $ul.html( "" );
//     if ( value && value.length > 0 ) {
//       $ul.html( "<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>" );
//       $ul.listview( "refresh" );
//       $.ajax({
//         url: "https://gurtom.mobi/tags.php",
//         dataType: "json",
//         xhrFields: { withCredentials: true },
//         crossDomain: true,
//         data: {
//           tag: $input.val()
//         },
//         success: function ( response ) {
//           $.each( response, function ( i, val ) {
//             html += '<li>' + val.tag.replace(/&amp;#39;/g, "'") + '</li>';
//           });
//           $ul.html( html );
//           $ul.listview( "refresh" );
//           $ul.trigger( "updatelayout");
//         } 
//       })
//     }
//   }, 
//   addTagFromAutocomplete: function(e){
//     $("#tag_store").append( "<div class='ui-icon-delete'>" +'#'+ e.target.innerText +"</div>" )
//     $('#add_tag__autocomplete-input').val('')
//     var $ul = $( '#add_tag__autocomplete' )
//     $ul.html( '' );
//     $ul.listview( "refresh" );
//     $ul.trigger( "updatelayout");
//   },
//   processTagInput: function(e){
//     if(e.which === 13 && e.target.value.length > 1) {
//       collect()
//       return
//     }
//     var filter = /^[A-ZА-ЯІЇЄa-zа-яіїє0-9 ]+$/
//     var isDotComaEntered = false
//     if(!filter.test(e.target.value)){
//       e.target.value = _.filter(e.target.value, function(item){
//         if(item==="." || item===",") isDotComaEntered = true
//         return filter.test(item)
//       }).join('')
//     }
//     if(isDotComaEntered){
//       if(e.target.value.length > 1) collect()
//       else e.target.value = ''
//     }
//     function collect() {
//       $("#tag_store").append( "<div class='ui-icon-delete'>" 
//        +'#'+ e.target.value +"</div>" )
//       e.target.value = ''
//     }
//   },
//   deleteTag: function(e){
//     e.target.parentElement.removeChild(e.target)
//   },
//   categoryAutocomplete: function(e, data){
//     var $ul = $( '#select_category__autocomplete' ),
//       $input = $( data.input ),
//       value = $input.val(),
//       html = "";
//     $ul.html( "" );
//     if ( value && value.length > 0 ) {
//       $ul.html( "<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>" );
//       $ul.listview( "refresh" );
//       $.ajax({
//         type: "POST",
//         url: "https://gurtom.mobi/beacon_list.php", //  !!!
//         dataType: "json",
//         xhrFields: { withCredentials: true },
//         crossDomain: true,
//         data: {
//           b_type: this.model.get('b_type'),
//           type: $input.val()
//         },
//         success: function ( response ) {
//           $.each( response, function ( i, val ) {
//             html += '<li data-id="'+ val.id +'">' + val.type + '</li>';
//           });
//           $ul.html( html );
//           $ul.listview( "refresh" );
//           $ul.trigger( "updatelayout");
//         } 
//       })
//     }
//   },
//   categoryAutocompleteClick: function(e){
//     var $input = $('#select_category__autocomplete-input') 
//     $input.attr('data-id', $(e.target).attr('data-id'))
//     $input.val(e.target.innerText)
//     var $ul = $( '#select_category__autocomplete' )
//     $ul.html( '' );
//     $ul.listview( "refresh" );
//     $ul.trigger( "updatelayout");
//   },
//   selectCategoryBtnClearClick: function(){
//     $('#select_category__autocomplete-input').attr('data-id', '')
//   },
//   input_click: function(e){
//     $(e.target).attr('data-id', '').val('')
//   },
//   selectGroupBtnClearClick:  function(){
//     $('#select_group__autocomplete-input').attr('data-id', '')
//   },
//   groupAutocomplete: function(e, data){
//     var $ul = $( '#select_group__autocomplete' ),
//       $input = $( data.input ),
//       value = $input.val(),
//       html = "";
//     $ul.html( "" );
//     if ( value && value.length > 2 ) {
//       $ul.html( "<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>" );
//       $ul.listview( "refresh" );
//       $.ajax({
//         url: "https://gurtom.mobi/groups.php", //  !!!
//         dataType: "json",
//         xhrFields: { withCredentials: true },
//         crossDomain: true,
//         data: {
//           filter: $input.val()
//         },
//         success: function ( response ) {
//           $.each( response, function ( i, val ) {
//             html += '<li data-id="'+ val.id +'">' + val.org + '</li>';
//           });
//           $ul.html( html );
//           $ul.listview( "refresh" );
//           $ul.trigger( "updatelayout");
//         } 
//       })
//     }
//   },
//   groupAutocompleteClick: function(e){
//     $input = $('#select_group__autocomplete-input')
//     $input.attr('data-id', $(e.target).attr('data-id'))
//     $input.val(e.target.innerText)
//     var $ul = $( '#select_group__autocomplete' )
//     $ul.html( '' );
//     $ul.listview( "refresh" );
//     $ul.trigger( "updatelayout");
//   },
//   takePhotoBtnClick: function(e){
//     e.preventDefault();
//     $("#take_photo__input").trigger("click");
//   },
//   takePhoto: function(e){
//     file = $("#take_photo__input")[0].files[0]
//     var $btnRemove = $('#take_photo__input__remove')            
//     $("#preview").empty();
//     if(file){
//       previewImage(file, "preview");
//       $btnRemove.show()
//       $btnRemove.one('click', function(e){
//         $('.take_photo .ui-input-clear').trigger("click")
//       })
//     } else {
//       $btnRemove.off()
//       $btnRemove.hide()
//     }
//     function previewImage(file, containerid) {
//       if (typeof FileReader !== "undefined") {
//         var container = document.getElementById(containerid),
//             img = document.createElement("img"),
//             reader;
//         container.appendChild(img);
//         reader = new FileReader();
//         reader.onload = (function (theImg) {
//           return function (evt) {
//             theImg.src = evt.target.result;
//           };
//         }(img));
//         reader.readAsDataURL(file);
//       }
//     }
//   },
//   events: {
//     'change @ui.publicOrPriv': 'onChangePrivat',
//     'click @ui.submitBtn':  _.debounce(function(){
//         this.onClickSubmit()
//       }, 10000, true),
//     'filterablebeforefilter #add_tag__autocomplete': _.debounce(function(e, data){
//         this.tagAutocomplete(e, data)
//       }, 700),
//     'click @ui.tag_autocomplete_list': 'addTagFromAutocomplete',
//     'keyup @ui.tag_input':  'processTagInput',
//     'click #tag_store>div': 'deleteTag',
//     'filterablebeforefilter #select_category__autocomplete': _.debounce(function(e, data){
//         this.categoryAutocomplete(e, data)
//       }, 700),
//     'click #select_category__autocomplete': 'categoryAutocompleteClick',
//     'click @ui.msgCategory': 'input_click',
//     'click #select_group__autocomplete-input': 'input_click',
//     'filterablebeforefilter #select_group__autocomplete': 'groupAutocomplete',
//     'click #select_group__autocomplete': 'groupAutocompleteClick',
//     'click .select_category .ui-input-search .ui-input-clear': 'selectCategoryBtnClearClick',
//     'click .select_group .ui-input-search .ui-input-clear': 'selectGroupBtnClearClick',
//     'click #take_photo__choose_file': 'takePhotoBtnClick',
//     'change #take_photo__input': 'takePhoto',
//     'click .header a': closeBeaconNew
//   }
// });

// view.scrollHendlerOn()    //  How to arrange?


//    Object Create Start

LatLngModel = Backbone.Model.extend({
  defaults: {
    lat: '',
    lng: '',
    b_type: '',
    icon_url: '//:0'
  }
});
LatLngView = Backbone.Marionette.ItemView.extend({
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
    var latlng = {lat: this.model.get('lat'), lng: this.model.get('lng')};
    window.geocoder.geocode({'location': latlng}, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          window.infowindow.setContent(results[0].formatted_address);
          window.infowindow.open(window.state.map, window.markers[window.markers.length-1]);
        } else {
          window.alert('No results found');
        }
      } else {
        window.infowindow.setContent('Територія, окупована Росією.');
        window.infowindow.open(window.state.map, window.markers[window.markers.length-1]);
      }
    });
  }
})
TitleView = Backbone.Marionette.ItemView.extend({
  template: '#title__tpl'
})
MoneyView = Backbone.Marionette.ItemView.extend({
  template: '#money__tpl'
})
CurrencyView = Backbone.Marionette.ItemView.extend({
  template: '#currency_only__tpl',
  id: 'currency_only',
  className: 'ui-field-contain'
})
AdmLevelView = Backbone.Marionette.ItemView.extend({
  template: '#admin_level__tpl',
  id: 'admin_level'
})
StartDateView = Backbone.Marionette.ItemView.extend({
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
    // this.ui.input.val(formatTime(new Date(this.ui.input.val() + ' 00:00:00')))
  }
})
EndDateView = Backbone.Marionette.ItemView.extend({
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
BeneficiarView = Backbone.Marionette.ItemView.extend({
  template: '#beneficiar__tpl',
  id: 'beneficiar',
  ui: {
    'input': '#beneficiar_name'
  },
})
ProgramIdView = Backbone.Marionette.ItemView.extend({   //  It should be a CollectionView with set of programID models
  template: '#programID__tpl',
  id: 'programID',
  ui: {
    'input': '#programID__input'
  },
  getProgramID: function(){
    return this.ui.input.val()
  }
})
NCOView = Backbone.Marionette.ItemView.extend({   //  It should be a CollectionView with set of NCO models
  template: '#nco__tpl',
  id: 'nco__wrapper',
  ui: {
    input: '#nco__autocomplete-input',
    ncoUl: '#nco__ul',
    storage: '#nco_storage'
  },
  events: {
    'focus @ui.input': 'enableFiltering',
    'click @ui.ncoUl': 'setNCO'
  },
  onRender: function(){
    var html = ''
    $.each( window.state.listNCO, function ( i, val ) {
      html += '<li>' + val.nco_type +' '+ val.nco_name +', '+ val.city
        +', '+ val.street +', '+ val.build +', id='+ val.id + '</li>';
    });
    this.ui.ncoUl.html( html );
  },
  enableFiltering: function(){
    this.ui.ncoUl.show()
  },
  setNCO: function(e){
    this.ui.input.val(e.target.innerText)
    this.ui.ncoUl.hide()
  },
  getNCO: function(){
    var str = this.ui.input.val() 
    var idIndex = str.lastIndexOf('id=')
    if(idIndex < 0) return ''
    return str.substring(idIndex + 3, str.length)
  }
})
DescriptionView = Backbone.Marionette.ItemView.extend({
  template: '#description_tpl',
  id: 'description_view',
  ui: {
    'textarea': '#description'
  }
})
DetailsView = Backbone.Marionette.ItemView.extend({
  template: '#details_tpl',
  className: 'message_input'
})
ResponseView = Backbone.Marionette.ItemView.extend({
  template: '#response_tpl',
  className: 'response'
})
TagsView = Backbone.Marionette.ItemView.extend({
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
          $.each( response, function ( i, val ) {
            html += '<li>' + val.tag.replace(/&amp;#39;/g, "'") + '</li>';
          });
          that.ui.tagUl.html( html );
          that.ui.tagUl.listview( "refresh" );
          that.ui.tagUl.trigger( "updatelayout");
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
      $("#tag_storage").append( "<div class='ui-icon-delete'>" +'#'+ tagsArray[i].tag +"</div>" )
    }
  }
})
LayerTypeView = Backbone.Marionette.ItemView.extend({
  template: '#layer_type_tpl',
  id: 'layer_type__view',
  ui: {
    layerTypeInput: '#layer_type__input',
    layerTypeUl: '#layer_type__ul',
  },
  events: {
    'click @ui.layerTypeInput': 'input_click',
    'filterablebeforefilter @ui.layerTypeUl': _.debounce(function(e, data){
        this.layerTypeAutocomplete(e, data)
      }, 700),
    'click @ui.layerTypeUl': 'layerTypeAutocompleteClick',
    'click #layer_type__view .ui-input-search .ui-input-clear': 'layerTypeBtnClearClick'
  },
  input_click: function(e){
    $(e.target).attr('data-id', '').val('')
  },
  layerTypeAutocomplete: function(e, data){
    var $ul = $( '#layer_type__ul' ),
      $input = $( data.input ),
      value = $input.val(),
      html = "";
    $ul.html( "" );
    if ( value && value.length > 0 ) {
      $ul.html( "<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>" );
      $ul.listview( "refresh" );
      $.ajax({
        type: "POST",
        url: "https://gurtom.mobi/beacon_list.php", //  !!!
        dataType: "json",
        xhrFields: { withCredentials: true },
        crossDomain: true,
        data: {
          b_type: this.model.get('b_type'),
          type: $input.val()
        },
        success: function ( response ) {
          $.each( response, function ( i, val ) {
            html += '<li data-id="'+ val.id +'">' + val.type + '</li>';
          });
          $ul.html( html );
          $ul.listview( "refresh" );
          $ul.trigger( "updatelayout");
        } 
      })
    }
  },
  layerTypeAutocompleteClick: function(e){
    var $input = $('#layer_type__input') 
    $input.attr('data-id', $(e.target).attr('data-id'))
    $input.val(e.target.innerText)
    var $ul = $( '#layer_type__ul' )
    $ul.html( '' );
    $ul.listview( "refresh" );
    $ul.trigger( "updatelayout");
  },
  layerTypeBtnClearClick: function(){
    $('#layer_type__input').attr('data-id', '')
  },
  getLayerType: function(){
    var str = this.ui.layerTypeInput.val()
  }
})
PhotoView = Backbone.Marionette.ItemView.extend({
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
  showLoadedPhoto: function(imgURL){
    var container = document.getElementById("photo__preview"),
        img = document.createElement("img")
    img.src = 'https://gurtom.mobi' + imgURL
    container.appendChild(img);
  },
  removePhoto: function(){
    this.ui.previewPhoto.empty()
    this.ui.photo.val('')
    this.ui.removePhotoBtn.hide()
  },
})
PhoneView = Backbone.Marionette.ItemView.extend({
  template: '#phone_tpl',
  className: 'phone_number ui-field-contain',
  ui: {
    'input': '#phone_num__input'
  }
})
UsrCountblOptionView = Backbone.Marionette.ItemView.extend({
  template: '#usr_countbl__option__tpl',
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
UsrCountblView = Backbone.Marionette.CompositeView.extend({
  template: '#usr_countbl__tpl',
  attributes: {
     'data-iconpos': "noicon"
  },
  childViewContainer: "#usr_countbl__select",
  childView: UsrCountblOptionView,
  initialize: function(){
    var first = [{
        index: -1,
        name: 'Хто буде голосувати?'
    }]
    var array = _.map(window.state.usrAuthLvl, function(value, index){
      return {
        index: index,
        name: value
      }
    })
    this.collection = new Backbone.Collection( _.union(first, array) )
  }
})
AgeView = Backbone.Marionette.ItemView.extend({
  template: '#age__tpl',
  id: 'age'
})
SupportView = Backbone.Marionette.ItemView.extend({
  template: '#support__tpl',
  id: 'support'
})
SupportFinishDateView = Backbone.Marionette.ItemView.extend({
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
PrivateView = Backbone.Marionette.ItemView.extend({
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
          $.each( response, function ( i, val ) {
            html += '<li data-id="'+ val.id +'">' + val.org + '</li>';
          });
          $ul.html( html );
          $ul.listview( "refresh" );
          $ul.trigger( "updatelayout");
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
    var str = this.ui.layerTypeInput.val()
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
ObjectCreateView = Backbone.Marionette.LayoutView.extend({
  template: '#object_create_tpl',
  id: 'object_create_dialog',
  className: 'project_create__wrapper',
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
    if(this.model.get('targetId') && +this.model.get('targetId') > 0) this.fetchObjectModelById()
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
    if(t==1 ||       t==3 ||t==4 ||t==5                                                    ) this.addNewChild('endDate', EndDateView, true, (t==1 ? 'Оберіть дату закінчення голосування' : undefined))
    if(t==1 ||              t==4                                                           ) this.addNewChild('startDate', StartDateView, true, (t==1 ? 'Оберіть дату початку голосування' : undefined))
    if(              t==3                                                                  ) this.addNewChild('programID', ProgramIdView, true)
    if(                            t==5                                                    ) this.addNewChild('beneficiar', BeneficiarView, true)
    if(                                   t==330 ||t==69 ||t==96 ||t==777 ||t==911         ) this.addNewChild('phone', PhoneView, true)
    if(              t==3 ||t==4 ||t==5 ||t==330                                           ) this.addNewChild('money', MoneyView, true, (t==330 ? 'Орієнтовна вартість проекту' : undefined))
    if(                                   t==330                                   && g==0 ) this.addNewChild('admLevel', AdmLevelView, true)
    if(t==1                                                                                ) this.addNewChild('usrCountbl', UsrCountblView, true)
    if(t==1                                                                                ) this.addNewChild('age', AgeView, true)
    if(t==1                                                                                ) this.addNewChild('support', SupportView, true)
    if(t==1                                                                                ) this.addNewChild('supportFinishDate', SupportFinishDateView, true)
    if(t==1                                                                                ) this.addNewChild('sphere', SphereGeneralView, true)
    if(                                            t==69 ||t==96 ||t==777 ||t==911         ) this.addNewChild('details', DetailsView, true)
    if(                                                            t==777 ||t==911         ) this.addNewChild('response', ResponseView, false)
    if(                                                            t==777 ||t==911         ) this.addNewChild('layerType', LayerTypeView, false)
    if(                                                            t==777 ||t==911         ) this.addNewChild('private', PrivateView, false)
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
      viewModel = new Backbone.Model(opt) 
      viewItem = new ViewItem({
        model: viewModel
      })
    }
    this.showChildView(region, viewItem)
  },
  fetchObjectModelById: function(){
    this.model.url = 'https://gurtom.mobi/beacon_cards.php?b_id=' + this.model.get('targetId')
    $.mobile.loading('show')
    var that = this
    this.model.fetch({
      success: function(){
        $.mobile.loading('hide')
        that.fillFormWithTargetData()
      },
      error: function(){
        $.mobile.loading('hide')
      }
    })
  },
  fillFormWithTargetData: function(){   //  Not completed. It lacks fields and conditions to display
    var brief = this.model.changedAttributes()[0],
        full = brief.full[0]
    this.model.set({'lat': brief.lat})
    this.model.set({'lng': brief.lng})
    this.latLng.currentView.model.set({'lat': +brief.lat, 'lng': +brief.lng})
    // this.latLng.currentView.render()
    $('#title').val(full.title || '')
    $('#description').val(full.descr || '')
    $('#currency').val(full.curr || '').trigger( "change" )
    $('#amount').val(full.amount || '')
    $('#phone_num__input').val(full.title || '')
    this.tag.currentView.setTags(brief.tags || '')
    $('#img').val((brief.b_img || ''))
    if(brief.b_img) {
      this.photo.currentView.showLoadedPhoto(brief.b_img)
    }
  },
  onShow: function(){
    this.$el.trigger('create')
    $('#usr_countbl__select-button').one('click', function(){
      $('#usr_countbl__select-dialog .ui-dialog-contain .ui-header .ui-btn').removeClass( "ui-icon-delete" ).addClass( "ui-icon-close" )
      $("#usr_countbl__select-listbox-popup .ui-popup .ui-header a").removeClass( "ui-icon-delete" ).addClass( "ui-icon-close" )
    })
  },
  events: {
    'click @ui.submitBtn': 'sendPhoto',
    'click @ui.closeBtn': 'exit'
  },
  sendPhoto: function(e){
    e.preventDefault()
    if(!this.ui.form.get(0).checkValidity()){
      alert("Будь ласка, заповніть обов'язкові поля.")
      return
    } else if(!this.verifyInputs(this)) return
    var file = this.photo.currentView.ui.photo[0].files[0]
    if (file){
      var client = new XMLHttpRequest(),
          that = this
      function upload(){
        that.ui.progressBar.css({ "width": 0 })
        that.ui.progressWrap.show()
        var formData = new FormData();
        formData.append("picture", file);
        client.open("post", "https://gurtom.mobi/i/up.php?type="
        + that.model.get('type') , true);
        client.setRequestHeader('Accept'
        ,'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
        client.send(formData);
      }
      client.upload.onprogress = function(e) {
        if (e.lengthComputable) {
          var percentCompleted = (100 * e.loaded / e.total).toFixed(0) + '%';
          that.ui.progressBar.css({ "width": percentCompleted })
          that.ui.progressVal.text(percentCompleted)
        }
      }
      client.onerror = function(){
        console.log(client.responseText);
        that.ui.progressWrap.hide()
      }
      client.onreadystatechange = function(){
        if (client.readyState == 4 && client.status == 200){
          console.log(client.responseText);
          $('#img').val(client.responseText)
          that.sendForm()
        }
      }
      upload();  
    } else this.sendForm()
  },
  verifyInputs: function(that){
    // if(this.startDate.currentView) this.startDate.currentView.checkInput()
    // if(this.endDate.currentView) this.endDate.currentView.checkInput()
    if(this.tag.currentView){
      var tags = ''
      if(tags = this.tag.currentView.getTags()) {
        $('#tags').val(tags)
      } else if(this.tag.currentView.model && this.tag.currentView.model.get('required')) {
        alert("Поле 'Додати тег' є обов'язковим.")
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
        alert("Поле 'Виберіть ID програми' є обов'язковим.")
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
        alert("Дата завершення збору голосів підтримки не може бути у минулому.")
        return validationFailed()
      } else if( dateFinishSupport > dateStartVoting ) {
        alert("Голосування не може бути розпочато до дати завершення збору голосів підтримки.")
        return validationFailed()
      } else if( dateStartVoting >= dateEndVoting ) {
        alert("Голосування не може бути завершено до його початку.")
        return validationFailed()
      }
      var $usr_countbl__select = $('#usr_countbl__select')
      if($usr_countbl__select.val().length > 0){
        $('#usr_countbl').val($usr_countbl__select.val().join())
      } else {
        alert("Вкажіть статуси користувачів, чиї голоси будуть зараховуватися в голосуванні. Потрібно вибрати хоча б один статус.")
        return validationFailed()
      }
    }
    if(this.layerType.currentView){
      var val = '',
          layerTypeView = this.layerType.currentView 
      if(val = layerTypeView.getLayerType()) {
        $('#layer_type').val(val)
      } else if(layerTypeView.model && layerTypeView.model.get('required')) {
        alert("Поле 'Категорія повідомлення' є обов'язковим.")
        return validationFailed()
      } else {
        $('#layer_type').val(null)
      }
    }
    if(this.private.currentView){
      var val = '',
          privateView = this.private.currentView 
      if(val = privateView.getLayerType()) {
        $('#private_group').val(val)
      } else if(privateView.model && privateView.model.get('required')) {
        alert("Поле 'Оберіть групу' є обов'язковим.")
        return validationFailed()
      } else {
        $('#private_group').val(null)
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
      case 330:
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
      window.state.singleBeacon = true
      if(that.latLng.currentView){
        markers[markers.length-1].setDraggable(false)
        showBeaconFullView(response)                      //  Add alert on error!
        // beaconsList.set(response, {reset: true})
        // showBeaconsListView()
      } else {
        that.exit()
      }
    })
    promise.fail(function(){
      alert("Немає зв'язку з сервером.")
    })
    promise.always(function(){
      $(that.ui.progressWrap).hide()
    })
  },
  exit: function(){
    closeBeaconNew()
    showBeaconsListView()
    setMultiBeaconMode()
  }
})
//    Object Create End

//    FullView start
MsgCollectionView = Backbone.Marionette.CollectionView.extend({
  collection: MsgGroup,
  childView: MsgView,
  childViewContainer: '.sent-message__wrapper',
})
ParticipBudgetModel = Backbone.Model.extend({
  defaults: {
    amount: '0',
    curr: '980',
    descr: ''
  }
})
ParticipBudgetView = Backbone.Marionette.ItemView.extend({
  template: '#expand_to_p-budget__tpl',
  className: 'expand_to_full',
  model: ParticipBudgetModel,
})
VotingSupportBtnView = Backbone.Marionette.ItemView.extend({
  template: '#voting_support__tpl',
  className: 'voting_support',
  events: {
    'click #voting_support__btn': 'btnClick'
  },
  btnClick: function(){
    this.triggerMethod('support:btn_click')
  }
})
VotingButtonsView = Backbone.Marionette.ItemView.extend({
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
    this.ui.private.flipswitch({
      create: function( event, ui ) {
        $(this).prop('checked', privat).flipswitch('refresh')
      }
    })
    $('.voting_btns').trigger("create")
  },
  ui: {
    private: '#flip-vote_type'
  },
  events: {
    'click .voting_button__no': 'btnNoClick',
    'click .voting_button__abstain': 'btnAbstainClick',
    'click .voting_button__yes': 'btnYesClick'
  },
  btnNoClick: function(){
    this.triggerMethod('voting:btn_no_click', this.ui.private.prop('checked'))
  },
  btnAbstainClick: function(){
    this.triggerMethod('voting:btn_abst_click', this.ui.private.prop('checked'))
  },
  btnYesClick: function(){
    this.triggerMethod('voting:btn_yes_click', this.ui.private.prop('checked'))
  }
})
VotingModel = Backbone.Model.extend({
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
          this.set({'v_status': 'Збір голосів підтримки закінчився '+ reverseDateFormat(this.get('sprtf')) +'.'})
        } else {
          this.set({'v_status': 'Триває збір голосів підтримки до '+ reverseDateFormat(this.get('sprtf')) +'.'})
          if(this.get('canUserVote')) {
            this.set({'usr_status': (this.get('sprt_my') == '1' ? 'Ви підтримали це голосування.' : 'Ви не підтримали це голосування.' )})
            this.set({'btn_support': (this.get('sprt_my') == '1' ? 'Скасувати' : 'Підтримати' ) })
          }
        }
        break;
      case 1:
        if(new Date(this.get('offer_start_time')) <= getTodayWithZeroTime()){
          this.set({'v_status': 'Голосування розпочато і триває до '+ reverseDateFormat(this.get('offer_finish_time')) +'.'})
          if(this.get('canUserVote')) {
            this.set({'usr_status': haveUserVoted(this)})
          }
        } else {
          this.set({'v_status': 'Голосування розпочнеться '+ reverseDateFormat(this.get('offer_start_time')) +'.'})
          if(this.get('canUserVote')) {
            this.set({'usr_status': (this.get('sprt_my') == '1' ? 'Ви підтримали це голосування.' : 'Ви не підтримали це голосування.' )})
          }
        }
        break;
      case 2:
        this.set({'v_status': 'Голосування закінчилось '+ reverseDateFormat(this.get('offer_finish_time')) +'.'})
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
          + 'Голосування розпочнеться '+ reverseDateFormat(this.get('offer_finish_time')) +'.' }) 
        if(this.get('canUserVote')) {
          this.set({'usr_status': (this.get('sprt_my') == '1' ? 'Ви підтримали це голосування.' : 'Ви не підтримали це голосування.' )})
        }
        break;
    }
    function haveUserVoted(that){
      var vote = (that.get('user_vote') == '1' ? 'Ви голосували "за" '+ (that.get('user_vote_open') == '1' ? 'відкрито.' : 'таємно.')
            : that.get('user_vote') == '2' ? 'Ви голосували "проти" '+ (that.get('user_vote_open') == '1' ? 'відкрито.' : 'таємно.') 
            : that.get('user_vote') == '3' ? 'Ви "утримались" '+ (that.get('user_vote_open') == '1' ? 'відкрито.' : 'таємно.')
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
      this.set({'usr_status': "Ви не можете приймати участь в цьому голосуванні, оскільки автор встановив вікові обмеження від "
      + this.get('age_from') +" до "+ this.get('age_to') + " років."})
    } else if( !isAuthLevelOk(this) ) {
      this.set({'usr_status': "Ви не можете приймати участь в цьому голосуванні, оскільки рівень Вашої авторизації на цьому сервісі не відповідає вимогам автора голосування. "
      + "Для участі в цьому голосуванні Вам слід мати рівень авторизації не нижче ніж: "
      + (this.get('v1')=='1' ? 'Авторизація через соціальну мережу'
       : this.get('v2')=='1' ? "Співвласники"
       : this.get('v3')=='1' ? "Члени громадських об'єднань" 
       : this.get('v4')=='1' ? "Авторизація по платежу" 
       : this.get('v5')=='1' ? "Авторизація по банківській карті"
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
ResulItemtModel = Backbone.Model.extend({
  defaults: {
    title: '',
    minus: '0',
    plus: '0',
    abst: '0'
  }
})
ResultCollectionModel = Backbone.Collection.extend({
  model: ResulItemtModel
})
ResultView = Backbone.Marionette.ItemView.extend({
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
  model: ResulItemtModel,
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
ResultsView = Backbone.Marionette.CompositeView.extend({
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
VotingView = Backbone.Marionette.LayoutView.extend({
  model: VotingModel,
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
                      : 'відсутній' )
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
    data = {
      id: this.model.get('id'),
      vote: '4'
    }
    this.sendVote(data)
  },
  onYesBtnClick: function(childView, private){
    data = {
      id: this.model.get('id'),
      open: ''+ +!private, 
      vote: this.model.get('user_vote') == '1' ? "0" : "1"
    }
    this.sendVote(data)
  },
  onNoBtnClick: function(childView, private){
    data = {
      id: this.model.get('id'),
      open: +!private, 
      vote: this.model.get('user_vote') == '2' ? "0" : "2"
    }
    this.sendVote(data)
  },
  onAbstBtnClick: function(childView, private){
    data = {
      id: this.model.get('id'),
      open: +!private, 
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
      alert("Щось пішло не так...\nСпробуйте згодом ще раз.")
    })
    promise.always(function(){
      $.mobile.loading('hide')
    })
  }
})
BeaconFullModel = BeaconModel.extend({
  parse: function(response){
    return response[0]
  },
  initialize: function(){
    this.url = 'https://gurtom.mobi/beacon_cards.php?b_id=' + this.get('id')
  }
})
BeaconFullView = Backbone.Marionette.LayoutView.extend({
  model: BeaconModel,
  baseUrl: 'https://gurtom.mobi/beacon_cards.php?b_id=',
  template: '#beacon_main_tpl',
  templateHelpers: function() {
    var list = '',
        tags = this.model.get('tags')
    if(tags && tags.length > 0){
      list = "#"+_.map(tags, function(item){ return item.tag }).join(', #')
    }
    return { tagList: list };
  },
  id: 'beacon_full_view',
  className: 'ui-nodisc-icon',
  attributes: {
    "data-role": "content"
  },
  regions: {
    extention: '.expanding_view',
    chat: '.sent-message__wrapper'
  },
  events: {
    'click .share':  'onClickShare',
    'click .link':   'onClickLink',
    'click .error':  'onClickError',
    'click .star':   'onClickStar',
    'click .add':    'onClickAdd',
    'click .header': 'onLayoutViewClick',
    'click .beacon-content': 'onLayoutViewClick',
    'click .ui-icon-close': 'exit',
    'click .beacon_status': 'onClickStatusBtn'
  },
  onDomRefresh: function(){
    this.$el.trigger("create")
  },
  onClickShare: function (event) {
    event.stopPropagation()
    console.log('button "share" clicked id=' + this.model.get('id'))
  },
  onClickLink: function (event) {
    event.stopPropagation()
    console.log('button "link" clicked id=' + this.model.get('id'))
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
    console.log('button "add" clicked id=' + this.model.get('id'))
  },
  onBeforeShow: function(){
    var Model,
        View
    if(this.model.get('type') == 330){
      Model = ParticipBudgetModel
      View = ParticipBudgetView
    } else if(this.model.get('b_type') == 1){
      Model = VotingModel
      View = VotingView
    }
    if ( Model && View ) {
      var extModel = new Model(this.model.get('full')[0])
      View = View.extend({model: extModel}) 
      this.showChildView('extention', new View())
    }
    
    var chat = this.model.get('chat')
    var chatCollection = new MsgGroup(chat)
    this.showChildView('chat', new MsgCollectionView({collection: chatCollection}))
  },
  exit: function(){
    closeBeaconNew()
    // showBeaconsListView()
    // beaconsList.getNewCollection()
  },
  onClickStatusBtn: function(){
    showPopupStatusBeacon({ targetId: this.model.get('id') })
  }
})
//    FullView end

//  Controller

window.rightRegion = new Backbone.Marionette.Region({el: "#beacons-map__the-beacons"})
window.showBeaconsListView()

function showBeaconsListView() {
  window.beaconsList = new BeaconsList()
  window.beaconsListView = new BeaconListView({
    collection: beaconsList,
  });
  window.rightRegion.show(window.beaconsListView);
}

function showBeaconCreateView(options) {
  var beaconModel = new BeaconCreateModel(options)
  window.beaconCreateView = new BeaconCreateView({
    model: beaconModel
  })
  window.rightRegion.show(beaconCreateView);
}

function showObjectCreateView(model) {
  var View = null
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
  $.extend(model, { titler: titler })
  View = ObjectCreateView.extend({
    model: new Backbone.Model(model)
  })
  window.objectCreateView = new View()
  window.rightRegion.show(objectCreateView);
}

function showBeaconFullView(param){
  if(param[0] && param[0].full && param[0].full[0]) {
    window.beaconFullViewModel = new BeaconFullModel(param[0])
    showFullView()
  } else if( +param.b_type > 0 || +param.type > 0 ) {
    window.beaconFullViewModel = new BeaconFullModel(param)
    showFullView()
  } else if(param[0] && param[0].id) {
    window.beaconFullViewModel = new BeaconFullModel(param[0])
    $.mobile.loading('show')
    window.beaconFullViewModel.fetch()
    .done(function(){
      showFullView()
    })
    .always(function(){
      $.mobile.loading('hide')
    })
  } else {
    window.beaconFullViewModel = new BeaconFullModel({id: param})
    $.mobile.loading('show')
    window.beaconFullViewModel.fetch()
    .done(function(){
      showFullView()
    })
    .always(function(){
      $.mobile.loading('hide')
    })
  }
  function showFullView() {
    window.beaconFullView = new BeaconFullView({model: window.beaconFullViewModel})
    window.rightRegion.show(window.beaconFullView);
  }
}
