//  Start of section BeaconCreate

BeaconCreateModel = Backbone.Model.extend({
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
    'tags': '',       //  string, string...
    'icon_url': '//:0'
  },
  initialize: function(){
    this.set({icon_url: getIconURL(this.attributes, true)})
  }
})
BeaconCreateView = Backbone.Marionette.ItemView.extend({
  template: "#beacon_create_tpl",
  className: 'create_object ui-content',
  attributes: {
    "data-role": "content"
  },
  model: BeaconCreateModel,
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
    if(this.model.get('b_type') == 911 || this.model.get('b_type') == 777) {
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
        that.ui.progressWrap.hide()
        console.log("https://gurtom.mobi/i/up.php?type="
          + that.model.get('b_type') + ' request has been failed')
        alert(window.localeMsg[window.localeLang].CONNECTION_ERROR)
      }
      client.onreadystatechange = function(){
        if (client.readyState == 4 && client.status == 200){
          if(response.error){
            alert(window.localeMsg[window.localeLang][response.error])
            return
          }
          that.model.set('img', client.responseText)
          sendNewBeaconAJAX()
        }
      }
      upload();  
    } else sendNewBeaconAJAX()

    function sendNewBeaconAJAX() {
      var promise = $.ajax({
        type: "POST",
        url: "https://gurtom.mobi/beacon_add.php",
        dataType: "json",
        xhrFields: { withCredentials: true },
        crossDomain: true,
        data: that.model.attributes
      })
      promise.done(function (response) {
        if(response.error){
          alert(window.localeMsg[window.localeLang][response.error])
          return
        }
        window.state.singleBeacon = true
        markers[markers.length-1].setDraggable(false)
        beaconsList.set(response, {reset: true})
        closeBeaconNew()    // showBeaconsListView()
      })
      promise.fail(function(response){
        console.log("https://gurtom.mobi/beacon_add.php" + ' request has been failed')
        alert(window.localeMsg[window.localeLang].CONNECTION_ERROR)
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
        success: function (response) {
          if(response.error){
            alert(window.localeMsg[window.localeLang][response.error])
            return
          }
          $.each( response, function ( i, val ) {
            html += '<li>' + val.tag.replace(/&amp;#39;/g, "'") + '</li>';
          });
          $ul.html( html );
          $ul.listview( "refresh" );
          $ul.trigger( "updatelayout");
        },
        error: function(){
          console.log("https://gurtom.mobi/tags.php" + ' request has been failed')
          alert(window.localeMsg[window.localeLang].CONNECTION_ERROR)
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
          if(response.error){
            alert(window.localeMsg[window.localeLang][response.error])
            return
          }
          $.each( response, function ( i, val ) {
            html += '<li data-id="'+ val.id +'">' + val.type + '</li>';
          });
          $ul.html( html );
          $ul.listview( "refresh" );
          $ul.trigger( "updatelayout");
        },
        error: function(){
          console.log("https://gurtom.mobi/beacon_list.php" + ' request has been failed')
          alert(window.localeMsg[window.localeLang].CONNECTION_ERROR)
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
  selectCategoryBtnClearClick: function(){
    $('#select_category__autocomplete-input').attr('data-id', '')
  },
  input_click: function(e){
    $(e.target).attr('data-id', '').val('')
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
          console.log("https://gurtom.mobi/groups.php" + ' request has been failed')
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
      }, 700),
    'click @ui.tag_autocomplete_list': 'addTagFromAutocomplete',
    'keyup @ui.tag_input':  'processTagInput',
    'click #tag_store>div': 'deleteTag',
    'filterablebeforefilter #select_category__autocomplete': _.debounce(function(e, data){
        this.categoryAutocomplete(e, data)
      }, 700),
    'click #select_category__autocomplete': 'categoryAutocompleteClick',
    'click @ui.msgCategory': 'input_click',
    'click #select_group__autocomplete-input': 'input_click',
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
