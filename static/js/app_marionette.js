// var BeaconManager = new Marionette.Application();


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
    id: "unknown",
    b_type: "unknown",
    author_id: 'unknown',
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
      success: function(){
        $.mobile.loading('hide')
      },
      error: function(){
        $.mobile.loading('hide')
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
    // var listID = _.map(response, function(item){
    //   return item.id
    // })
    var res = _.map(response, function(i){
      for (key in i){
        // console.log(i[key])
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
  className: 'sent-message clearfix'
})

BeaconView = Backbone.Marionette.CompositeView.extend({
  template: "#beacon_main_tpl",
  childView: MsgView,
  childViewContainer: '.sent-message__wrapper',
  collection: BeaconModel,
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
  events: {
    'click .share':  'onClickShare',
    'click .link':   'onClickLink',
    'click .error': 'onClickError',
    'click .star':  'onClickStar',
    'click .add':    'onClickAdd',
    'click .header': 'onCompositeViewClick',
    'click .beacon-content': 'onCompositeViewClick'
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
  isBouncing: false,
  onCompositeViewClick: function(e){
    var isPhoto = (e.target.className.search('photo') !== -1) 
    var isStatusBtn = (e.target.className.search('beacon_status') !== -1) 
    if(!isPhoto && !isStatusBtn) {
      var id = this.model.get('id')
      var i = _.findIndex(markers, function(item){
        return item.beaconID === id
      })
      if(this.isBouncing){
        markers[i].setAnimation(null)
        this.$el.css( "background-color", "" )
        this.isBouncing = false
      } else {
        if( i === -1 ) {
          var index = markers.length
          createMarker(this.model.get('b_type'), this.model.get('layer_type'),
          this.model.get('layer_owner_id'), index, this.model.get('title'),
          this.model.get('id'), this.model.get('lat'), this.model.get('lng'))
          markers[index].setAnimation(google.maps.Animation.BOUNCE)
      } else {
          markers[i].setAnimation(google.maps.Animation.BOUNCE)
        }
        this.$el.css( "background-color", "#8af" )
        this.isBouncing = true
        this.trigger("marker:bounce", this.model.get('id'));
      }
    }
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
    if( scroll < 1 ){
      if(window.beaconsListView) beaconsList.getNextPage()
    }
  }
})

var beaconsList = new BeaconsList()

//  End of section BeaconsView
//  Start of section BeaconCreate

BeaconCreateForm = Backbone.Model.extend({
  defaults: {
    'lat': '',        //  decimal(12,8)
    'lng': '',        //  decimal(12,8)
    'source': '',     //  tinyint(1)
    'img': '',        //  varchar(100)
    'b_type': '',     //  int(11)
    'layer_type': '', //  int(11)
    'details': '',    //  varchar(255)
    'result': '',     //  tinyint(1)
    'phone': '',      //  varchar(45)
    'email': '',      //  varchar(45)
    'private': '',    //  bigint(20)
    'tags': ''        //  string, string...
  }
})

BeaconCreateView = Backbone.Marionette.ItemView.extend({
  template: "#beacon_create_tpl",
  className: 'create_object ui-content',
  attributes: {
    "data-role": "content"
  },
  model: BeaconCreateForm,
  modelEvents: {
    "change": "modelChanged"   //  Rerenders .lat_lng only after new marker move across the map
  },
  modelChanged: function(e){
    if(e.changed.lat || e.changed.lng) {
      var data = this.serializeData()
      data = this.mixinTemplateHelpers(data)
      var html = Marionette.Renderer.render(this.getTemplate(), data, this)
      this.$el.find('.lat_lng').replaceWith($('.lat_lng', html));
    }
  },
  onDomRefresh: function(){
    this.$el.trigger("create")
  },
  ui: {
    msg: '#message_input__textarea',
    photo: '#take_photo__input',
    tag_input: '#add_tag__autocomplete-input',
    tag_autocomplete_list: '#add_tag__autocomplete',
    tag_store: '#tag_store',
    msgCategory: '#select_category__autocomplete-input',
    phone: 'phone_number__input',
    response: '#expected_response__input',
    publicOrPriv: '#public_private_switch__input',
    privatGroup: '#select_group__autocomplete-input',
    submitBtn: '.submit_btn',
    progressVal: '.submit .progressval',
    progressBar: '.submit .progressbar',
    progressWrap: '.submit .progress_bar__wrapper'
  },
  onChangePrivat: function () {
    if($('#public_private_switch__input').is(':checked')){
      $('.select_group').show()
    } else {
      $('.select_group').hide()
    }
  },
  onClickSubmit: function () {
    //  set phone
    if(this.model.get('b_type') != 69 && this.model.get('b_type') != 69) {
      var phone = '+' + $('#phone_number__input').val()
      var regex = /^\+(?:[0-9] ?){11,14}[0-9]$/;
      if (regex.test(phone)) {
        this.model.set('phone', phone)
      } else {
        alert('Номер телефону невірний.')
        return
      }
    }
    //  set details
    if(this.ui.msg.val().length > 15) {
      this.model.set('details', this.ui.msg.val())
    } else {
      alert('Повідомлення не може містити менше 15 літер.')
      return
    }
    //  set tags
    var tags = $( '#tag_store .ui-icon-delete' ).map(function() {
        return this.innerText.substring(1, this.innerText.length)
      })
      .get()
      .join();
    this.model.set('tags', tags)
    //  set layer_type
    var layer_type = $('#select_category__autocomplete-input').attr('data-id')
    this.model.set('layer_type', layer_type)
    //  set private
    var private = $('#select_group__autocomplete-input').attr('data-id')
    this.model.set('private', private)
    //  send photo
    var file = $("#take_photo__input")[0].files[0],
        that = this
    if (file){
      var client = new XMLHttpRequest()
      function upload(){
        that.ui.progressBar.css({ "width": 0 })
        that.ui.progressWrap.show()
        var formData = new FormData();
        formData.append("picture", file);
        client.open("post", "https://gurtom.mobi/i/up.php?type="
        + that.model.get('b_type') , true);
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
          that.model.set('img', client.responseText)
          sendNewBeaconAJAX()
        }
      }
      upload();  
    } else sendNewBeaconAJAX()
    //  Send new beacon
    function sendNewBeaconAJAX() {
      var promise = $.ajax({
        type: "POST",
        url: "https://gurtom.mobi/beacon_add.php",
        dataType: "json",
        xhrFields: { withCredentials: true },
        crossDomain: true,
        data: that.model.attributes
      })
      promise.done(function ( response ) {
        window.state.singleBeacon = true
        markers[markers.length-1].setDraggable(false)
        beaconsList.set(response, {reset: true})
        closeBeaconNew()    // showBeaconsListView()
      })
      promise.fail(function(response){
        alert(response)
      })
      promise.always(function(){
        $('that.ui.progressWrap').hide()
      })
    }
  },
  tagAutocomplete: function(e, data){
    var $ul = $( '#add_tag__autocomplete' ),
      $input = $( data.input ),
      value = $input.val(),
      html = "";
    $ul.html( "" );
    if ( value && value.length > 0 ) {
      $ul.html( "<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>" );
      $ul.listview( "refresh" );
      $.ajax({
        url: "https://gurtom.mobi/tags.php",
        dataType: "json",
        xhrFields: { withCredentials: true },
        crossDomain: true,
        data: {
          tag: $input.val()
        },
        success: function ( response ) {
          $.each( response, function ( i, val ) {
            html += '<li>' + val.tag + '</li>';
          });
          $ul.html( html );
          $ul.listview( "refresh" );
          $ul.trigger( "updatelayout");
        } 
      })
    }
  }, 
  addTagFromAutocomplete: function(e){
    $("#tag_store").append( "<div class='ui-icon-delete'>" +'#'+ e.target.innerText +"</div>" )
    $('#add_tag__autocomplete-input').val('')
    var $ul = $( '#add_tag__autocomplete' )
    $ul.html( '' );
    $ul.listview( "refresh" );
    $ul.trigger( "updatelayout");
  },
  processTagInput: function(e){
    if(e.which === 13 && e.target.value.length > 1) {
      collect()
      return
    }
    var filter = /^[A-ZА-ЯІЇЄa-zа-яіїє0-9 ]+$/
    var isDotComaEntered = false
    if(!filter.test(e.target.value)){
      e.target.value = _.filter(e.target.value, function(item){
        if(item==="." || item===",") isDotComaEntered = true
        return filter.test(item)
      }).join('')
    }
    if(isDotComaEntered){
      if(e.target.value.length > 1) collect()
      else e.target.value = ''
    }
    function collect() {
      $("#tag_store").append( "<div class='ui-icon-delete'>" 
       +'#'+ e.target.value +"</div>" )
      e.target.value = ''
    }
  },
  deleteTag: function(e){
    e.target.parentElement.removeChild(e.target)
  },
  categoryAutocomplete: function(e, data){
    var $ul = $( '#select_category__autocomplete' ),
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
  categoryAutocompleteClick: function(e){
    var $input = $('#select_category__autocomplete-input') 
    $input.attr('data-id', $(e.target).attr('data-id'))
    $input.val(e.target.innerText)
    var $ul = $( '#select_category__autocomplete' )
    $ul.html( '' );
    $ul.listview( "refresh" );
    $ul.trigger( "updatelayout");
  },
  input_click: function(e){
    $(e.target).attr('data-id', '').val('')
  },
  selectCategoryBtnClearClick: function(){
    $('#select_category__autocomplete-input').attr('data-id', '')
  },
  selectGroupBtnClearClick:  function(){
    $('#select_group__autocomplete-input').attr('data-id', '')
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
  takePhotoBtnClick: function(e){
    e.preventDefault();
    $("#take_photo__input").trigger("click");
  },
  takePhoto: function(e){
    file = $("#take_photo__input")[0].files[0]
    var $btnRemove = $('#take_photo__input__remove')            
    $("#preview").empty();
    if(file){
      previewImage(file, "preview");
      $btnRemove.show()
      $btnRemove.one('click', function(e){
        $('.take_photo .ui-input-clear').trigger("click")
      })
    } else {
      $btnRemove.off()
      $btnRemove.hide()
    }
    function previewImage(file, containerid) {
      if (typeof FileReader !== "undefined") {
        var container = document.getElementById(containerid),
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
  events: {
    'change @ui.publicOrPriv': 'onChangePrivat',
    'click @ui.submitBtn':  _.debounce(function(){
                              this.onClickSubmit()
                            }, 10000, true),
    'filterablebeforefilter #add_tag__autocomplete': _.debounce(function(e, data){
                                                       this.tagAutocomplete(e, data)
                                                       console.log("debounce")
                                                     }, 700),
    'click @ui.tag_autocomplete_list': 'addTagFromAutocomplete',
    'keyup @ui.tag_input':  'processTagInput',
    'click #tag_store>div': 'deleteTag',
    'filterablebeforefilter #select_category__autocomplete': _.debounce(function(e, data){
                                                               this.categoryAutocomplete(e, data)
                                                               console.log("debounce")
                                                             }, 700),
    'click @ui.msgCategory': 'input_click',
    'click #select_group__autocomplete-input': 'input_click',
    'click #select_category__autocomplete': 'categoryAutocompleteClick',
    'filterablebeforefilter #select_group__autocomplete': 'groupAutocomplete',
    'click #select_group__autocomplete': 'groupAutocompleteClick',
    'click .select_category .ui-input-search .ui-input-clear': 'selectCategoryBtnClearClick',
    'click .select_group .ui-input-search .ui-input-clear': 'selectGroupBtnClearClick',
    'click #take_photo__choose_file': 'takePhotoBtnClick',
    'change #take_photo__input': 'takePhoto',
    'click .header a': closeBeaconNew
  }
});

// view.scrollHendlerOn()    //  How to arrange?


//    Object Create Start

LatLngModel = Backbone.Model.extend({
  defaults: {
    lat: '',
    lng: '',
    b_type: ''
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
    this.render()
  }
})
TitleView = Backbone.Marionette.ItemView.extend({
  template: '#title__tpl',
  ui: {
    'input': '#title'
  }
})
MoneyModel = Backbone.Model.extend({
  defaults: {
    label: 'Необхідна сума '
  }
})
MoneyView = Backbone.Marionette.ItemView.extend({
  model: MoneyModel,
  template: '#money__tpl'
})
CurrencyView = Backbone.Marionette.ItemView.extend({
  template: '#currency_only__tpl',
  id: 'currency_only',
  className: 'ui-field-contain'
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
  className: 'ui-field-contain',
  ui: {
    'input': '#end_date__input'
  },
  events: {
    'blur @ui.input': 'checkInput'
  },
  checkInput: function(){
    this.ui.input.val( normalizeInput(this.ui.input.val()) )
    // this.ui.input.val(formatTime(new Date(this.ui.input.val() + ' 23:59:59')))
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
    $.each( window.listNCO, function ( i, val ) {
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
    'textarea': '#decription'
  }
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
            html += '<li>' + val.tag + '</li>';
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
      var filter = /^[A-ZА-ЯІЇЄa-zа-яіїє0-9 ]+$/
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
  removePhoto: function(){
    this.ui.previewPhoto.empty()
    this.ui.photo.val('')
    this.ui.removePhotoBtn.hide()
  },
})

ObjectModel = Backbone.Model.extend();
ObjectCreateView = Backbone.Marionette.LayoutView.extend({
  template: '#object_create_tpl',
  model: ObjectModel,
  id: 'object_create_dialog',
  className: 'project_create__wrapper',
  attributes: {
    "data-role": "content"
  },
  regions: {
    latLng: '.wrapper__lat_lng',
    title: '.wrapper__title',
    money: '.wrapper__money',
    currency: '.wrapper__currency_only',
    startDate: '.wrapper__start_date',
    endDate: '.wrapper__end_date',
    beneficiar: '.wrapper__beneficiar',
    programID: '.wrapper__programID',
    nco: '.wrapper__nco',
    desr: '.wrapper__decription',
    tag: '.wrapper__tag',
    photo: '.wrapper__photo'
  },
  ui: {
    submitBtn: '#submit_btn',
    progressVal: '.submit .progressval',
    progressBar: '.submit .progressbar',
    progressWrap: '.submit .progress_bar__wrapper',
    form: '#object_create',
    closeBtn: '.header a'
  },
  // onBeforeShow: function() {
    
  // },
  onShow: function(){
    this.$el.trigger('create')
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
    }
    var file = this.ui.photo[0].files[0]
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
    var tags = ''
    if(tags = this.getTags()) {
      $('#tags').val(tags)
    } else {
      alert("Поле 'Додати тег' є обов'язковим.")
      that.ui.progressWrap.hide()
      return false
    }
    var nco = ''
    if(this.nco.currentView && (nco = this.nco.currentView.getNCO())) {
      $('#nco').val(nco)
    }
    var programID = ''
    if(this.programID.currentView) {
      if(programID = this.programID.currentView.getProgramID()){
        $('#program_id').val(programID)
      } else {
        alert("Поле 'Виберіть ID програми' є обов'язковим.")
        that.ui.progressWrap.hide()
        return false
      }
    }
    return true
  },
  sendForm: function(){
    if(!this.verifyInputs(this)) return
    var that = this,
        url = ''
    switch (this.model.get('type')) {
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
      case 40:
        url = "https://gurtom.mobi/project_add.php"
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
        beaconsList.set(response, {reset: true})
        closeBeaconNew()    // showBeaconsListView()
      } else {
        that.exit()
      }
    })
    promise.fail(function( response ){
      alert(response)
    })
    promise.always(function(){
      $(that.ui.progressWrap).hide()
    })
  },
  exit: function(){
    setMultiBeaconMode()
    showBeaconsListView()
  },
  addNewChild: function(region, viewItem, req){
    var opt = { 'required': req ? 'required' : '' }
    window.test = viewItem
    console.log(region, viewItem, opt)
    debugger
    var inst = new (viewItem.extend({
      model: new (Backbone.Model.extend(opt))
    }))
    this.showChildView(region, inst)
  }
})
//    Object Create End


//  Controller

window.region = new Backbone.Marionette.Region({el: "#beacons-map__the-beacons"}) 
window.showBeaconsListView()

function showBeaconsListView() {
  window.beaconsListView = new BeaconListView({
    collection: beaconsList,
  });
  region.reset()
  region.show(window.beaconsListView);
}

function showBeaconCreateView(options) {
  var beaconModel = new BeaconCreateForm(options)
  window.beaconCreateView = new BeaconCreateView({
    model: beaconModel
  })
  region.reset()
  region.show(beaconCreateView);
}

function showObjectCreateView(key, latLngB) {
  var View = null
  var that = this
  var req = { 'required': 'required' }
  if(latLngB) {
    var latLngModel = new LatLngModel(latLngB)
    latLngView = new LatLngView({
      model: latLngModel
    })
  }
  switch (key) {
    case 2:
      View = ObjectCreateView.extend({
        onBeforeShow: function() {
          if(latLngB) this.showChildView('latLng', latLngView);
          this.showChildView('title', new TitleView.extend({
            model: Backbone.Model.extend(req)
          }))
          this.showChildView('decription', new DescriptionView.extend({
            model: new Backbone.Model.extend(req)
          }))
          this.showChildView('photo', new PhotoView())
          this.showChildView('tag', new TagsView.extend({
            model: new Backbone.Model.extend(req)
          }))
          this.showChildView('currency', new CurrencyView.extend({
            model: new Backbone.Model.extend(req)
          }))
        },
        model: new ObjectModel({
          title: 'програми',
          type: key
        })
      })
      break;
    case 3:
      View = ObjectCreateView.extend({
        onBeforeShow: function() {
          if(latLngB) this.showChildView('latLng', window.latLngView);
          this.addNewChild('nco', NCOView, false)
          this.addNewChild('title', TitleView, true)
          this.addNewChild('decription', DescriptionView, true)
          this.addNewChild('photo', PhotoView, false)
          this.addNewChild('tag', TagsView, true)
          this.addNewChild('money', MoneyView, true)
          this.addNewChild('endDate', EndDateView, true)
          this.addNewChild('programID', ProgramIdView, true)
        },
        model: new ObjectModel({
          title: 'проектної пропозиції',
          type: key
        })
      })
      break;
    case 4:
      View = ObjectCreateView.extend({
        onBeforeShow: function() {
          if(latLngB) this.showChildView('latLng', window.latLngView);
          this.addNewChild('nco', NCOView, false)
          this.addNewChild('title', TitleView, true)
          this.addNewChild('decription', DescriptionView, true)
          this.addNewChild('photo', PhotoView, false)
          this.addNewChild('tag', TagsView, true)
          this.addNewChild('money', MoneyView, true)
          this.addNewChild('startDate', StartDateView, true)
          this.addNewChild('endDate', EndDateView, true)
        },
        model: new ObjectModel({
          title: 'проекту',
          type: key
        })
      })
      break;
    case 5:
      View = ObjectCreateView.extend({
        onBeforeShow: function() {
          if(latLngB) this.showChildView('latLng', window.latLngView);
          this.addNewChild('nco', NCOView, false)
          this.addNewChild('title', TitleView, true)
          this.addNewChild('decription', DescriptionView, true)
          this.addNewChild('photo', PhotoView, false)
          this.addNewChild('tag', TagsView, true)
          this.addNewChild('money', MoneyView, true)
          this.addNewChild('endDate', EndDateView, true)
          this.addNewChild('beneficiar', BeneficiarView, true)
        },
        model: new ObjectModel({
          title: 'запиту',
          type: key
        })
      })
      break;
    case 40:
      View = ObjectCreateView.extend({
        onBeforeShow: function() {
          this.showChildView('latLng', window.latLngView);
          this.addNewChild('title', TitleView, true)
          this.addNewChild('decription', DescriptionView, true)
          this.addNewChild('money', MoneyView, true)   //  Change label to 'Приблизна вартість'
          this.addNewChild('phone', PhoneView, false)  //  Create PhoneView
          this.addNewChild('photo', PhotoView, false)
        },
        model: new ObjectModel({
          title: 'проекту по бюджету участі',
          type: key
        })
      })
      break;
    default:
      break;
  }
  window.objectCreateView = new View()
  region.reset()
  region.show(objectCreateView);
}

