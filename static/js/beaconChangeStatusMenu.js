var LiItemBtnView = Backbone.Marionette.ItemView.extend({
  tagName: 'button',
  template: _.template("<%- text %>"),
  attributes: function(){
    var attrib = {
      "data-mini": "true",
      "data-data": this.model.get('index') +','+ this.model.get('val'),
    }
    return attrib
  },
  className: function(){
    return this.model.get('className')
  }
})
var LiItemView = Backbone.Marionette.CompositeView.extend({
  template: '#beacon_status__li_item',
  tagName: 'li',
  className: function(){
    return 'status_item '+ this.model.get('color')  
  },
  templateHelpers: function(){
    return {
      'text': this.model.get('text'),
      'icon': this.model.get('icon')
    } 
  },
  initialize: function(){
    if ( this.model.get('btns') ) {
      this.collection = new Backbone.Collection(this.model.get('btns'))
    }
  },
  childView: LiItemBtnView,
  childViewContainer: '.child_btns',
}) 
var StatusModel = Backbone.Model.extend({
  defaults: {
    b_id: ""
  }
})
var PopupStatusBeacon = Backbone.Marionette.CompositeView.extend({
  template: '#beacon_status__tpl',
  id: 'beacon-status',
  childView: LiItemView,
  childViewContainer: '.listview',
  modelEvents: {
    "change": 'onModelChange'
  },
  initialize: function(options){
    this.model = new StatusModel(options)
    this.setCollection(options)
  },
  setCollection: function(options, diff){
    var statusList = null
    switch (this.model.get('type') || this.model.get('b_type')) {
      case '911':
        statusList = window.state.statusList.SOS
        break;
      case '777':
        statusList = window.state.statusList.infoAndEvent
        break;
      case '555':
        statusList = window.state.statusList.infoAndEvent
        break;
      case '330':
        alert('Status window is not ready for this beacon type')
        return
      case '96':
        statusList = window.state.statusList.goodAndBad
        break;
      case '69':
        statusList = window.state.statusList.goodAndBad
        break;
      case '6':
        alert('Status window is not ready for this beacon type')
        return
      case '5':
        statusList = window.state.statusList.projPropAndProjectAndRequest
        break;
      case '4':
        statusList = window.state.statusList.projPropAndProjectAndRequest
        break;
      case '3':
        statusList = window.state.statusList.projPropAndProjectAndRequest
        break;
      case '2':
        statusList = window.state.statusList.program
        break;
      case '1':
        alert('Status window is not ready for this beacon type')
        return
    }
    var collection = _.reduce(statusList, function(res, item){
      var tmp = {}
      var index = item.bStatusIndex
      var b_st = diff ? diff.status[index] : options.b_status[index]
      var btns = getCurrentBtns(item.btns, options, b_st, index ) || []
      if ( btns.length > 0 ) tmp.btns = btns
      if ( $.isNumeric(index) ){
        tmp.index = index
        tmp.text = item.text[ b_st + 1 ]
        tmp.icon = item.icon
        tmp.color = b_st<0 ? 'red' : (b_st>0 ? 'green' : '')
      }
      if ( Object.keys( tmp ).length >0 ) {
        res.push( tmp ) 
      }
      return res
      function getCurrentBtns( arr, options, b_st, index ){
        var result = _.reduce(arr, function(memo, el){
          if ( el.isAvailable(options, b_st) ) {
            var elm = {}
            elm.text = el.text
            elm.val = el.val || 'NA'
            elm.className = el.className
            elm.index = index
            memo.push( elm )
          }
          return memo
        }, [])
        return result
      } 
    }, [])
    this.collection = new Backbone.Collection(collection)
    if( diff ) this.render()
  },
  events: {
    'click button': 'onClickBtn'
  },
  onClickBtn: function(e){
    var btnClassName = e.target.className.split(' ')[0]
    var data = e.target.attributes.getNamedItem('data-data').value.split(',')
    data = {
      'b_id': this.model.get('b_id'),
      'status': data[0],
      'value': data[1]
    }
    switch (btnClassName) {
      case 'verify':
        // console.log('Btn verify clicked.')
        break;
      case 'confirm':
        // console.log('Btn confirm clicked.')
        break;
      case 'disprove':
        // console.log('Btn disprove clicked.')
        break;
      case 'lendhand':
        // console.log('Btn lendhand clicked.')
        var phone = prompt('Введіть номер телефону у форматі 380XXXXXXXXX:', window.state.user.phone)
        if (phone) {
          data.phone = phone
          break
        } else {
          return
        }
      case 'complete':
        // console.log('Btn complete clicked.')
        break;
      case 'copy':
        // console.log('Btn copy clicked.')
        var options = { targetId: this.model.get('b_id') }
        this.$el.one("popupafterclose", function() {
          window.rightPopupRegion.empty()
          showBeaconCreateMenu(options)
        })
        this.exit()
        return
      case 'delete':
        // console.log('Btn delete clicked.')
        var r = confirm("Видалити маячок?");
        if (r == true) {
          var that = this
          $.ajax({
            url: "https://gurtom.mobi/beacon_del.php",
            dataType: "json",
            data: {
              b_id: this.model.get('b_id')
            },
            crossDomain: true,
            success: function ( response ) {
              if(response.error === 0){
                alert('Маячок видалено')
                beaconsList.getNewCollection()
                that.exit()
              }
            },
            error: function(){
              console.log('Beacon delete error')
            }
          })
        }
        return
      case 'start':
        // console.log('Btn start clicked.')
        break;
      case 'transfer':
        // console.log('Btn transfer clicked.')
        break;
      default:
        alert('Button "'+ btnClassName + '" is not processed.')
        break;
    }
    this.setChange(data)
  },
  setChange: function(data){
    var that = this
    $.ajax({
      url: "https://gurtom.mobi/beacon_status_change.php",
      dataType: "json",
      data: data,
      crossDomain: true,
      success: function ( response ) {
        if(response.length === 0){
          console.log('Status list is empty')
        }
        if ( response.error === 3 ) {
          alert ( 'Невірний формат номеру телефону' )
        }
        that.setCollection(that.model.attributes, response)
        var theModel = window.beaconsList.models.find(function(model){
          return model.get('b_id') == response.id
        })
        theModel.set('b_status', response.status)
      },
      error: function(){
        console.log('Status change error')
      }
    })
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
    this.setListHeight()
    var that = this
    $(window).resize(that.setListHeight)
  },
  setListHeight: function(){
    var height = $('#beacons-map__the-beacons').height()*0.7
    $('.status_list__wrapper').css({ "max-height": height })
  },
  onModelChange: function(){
    console.log('Model changed to ', this.model.get('b_id'))
  },
  exit: function(){
    this.$el.popup('destroy')
    window.rightPopupRegion.empty()
  }
})