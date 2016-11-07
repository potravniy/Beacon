"use strict"

// window.state.listOrgs = [
// 	{
// 		"layer_owner_id": 14361,
// 		"layer_owner_code": "testGOV",
// 		"layer_owner_name": "testGOV",
// 		"pined": 0,
// 		"chkd": 0,
// 		"layers": [
// 			{
// 				"uniq_id": 30,
// 				"layer_name": "Авжеж",
// 				"pined": 0,
// 				"chkd": 0
// 			},
// 			{
// 				"uniq_id": 38,
// 				"layer_name": "Дідька лисого",
// 				"pined": 0,
// 				"chkd": 0
// 			},
// 			{
// 				"uniq_id": 29,
// 				"layer_name": "Дзуськи",
// 				"pined": 0,
// 				"chkd": 0
// 			},
// 			{
// 				"uniq_id": 39,
// 				"layer_name": "Дуля з маком",
// 				"pined": 0,
// 				"chkd": 0
// 			},
// 			{
// 				"uniq_id": 41,
// 				"layer_name": "Зрада",
// 				"pined": 0,
// 				"chkd": 0
// 			},
// 			{
// 				"uniq_id": 5,
// 				"layer_name": "Личаківський район",
// 				"pined": 0,
// 				"chkd": 0
// 			},
// 			{
// 				"uniq_id": 1,
// 				"layer_name": "Місто Львів",
// 				"pined": 0,
// 				"chkd": 0
// 			},
// 			{
// 				"uniq_id": 27,
// 				"layer_name": "Нівроку",
// 				"pined": 0,
// 				"chkd": 0
// 			},
// 			{
// 				"uniq_id": 33,
// 				"layer_name": "Незабаром",
// 				"pined": 0,
// 				"chkd": 0
// 			},
// 			{
// 				"uniq_id": 4,
// 				"layer_name": "Сихівський район",
// 				"pined": 0,
// 				"chkd": 0
// 			},
// 			{
// 				"uniq_id": 3,
// 				"layer_name": "Франківський район",
// 				"pined": 0,
// 				"chkd": 0
// 			},
// 			{
// 				"uniq_id": 2,
// 				"layer_name": "Шевченківський район",
// 				"pined": 0,
// 				"chkd": 0
// 			}
// 		]
// 	},
// 	{
// 		"layer_owner_id": 14321,
// 		"layer_owner_code": "26274568",
// 		"layer_owner_name": "Громадська організація «Молодіжна корпорація»",
// 		"pined": 0,
// 		"chkd": 0,
// 		"layers": [
// 			{
// 				"uniq_id": 40,
// 				"layer_name": "ОСББ Одеси",
// 				"pined": 0,
// 				"chkd": 0
// 			}
// 		]
// 	}
// ]

var OrgLayerView = Backbone.Marionette.ItemView.extend({
  template: '#org_layer__tpl',
  templateHelpers: function(){
    var tmp = {
      text: this.model.get('layer_name'),
      isPinnable: this.isPinnable,
      chk: +this.model.get('chkd') ? 'checked' : '' 
    }
    return tmp
  },
  className: 'org_layer_view',
  attributes: {
    "data-enhanced": true
  },
  initialize: function(options){
    this.isPinnable = options.isPinnable
    this.layer_owner_id = options.layer_owner_id
  },
  ui: {
    'chk': '.org_layer__chk input',
    'pin': '.org_item__pin'
  },
  events: {
    'change @ui.chk': 'onChk',
    'click @ui.pin': 'onPin'
  },
  onChk: function(){
    if (this.ui.chk.prop('checked')) this.model.set('chkd', 1)
    else this.model.set('chkd', 0)
  },
  onPin: function(){
    this.model.set('pined', ( this.ui.pin.hasClass('ui-icon-pin_on') ? 0 : 1 ) )
    this.renderPin()
  },
  renderPin: function(){
    if( this.model.get('pined')===1 ){
      this.ui.pin.removeClass('ui-icon-pin_off').addClass('ui-icon-pin_on')
    } else {
      this.ui.pin.removeClass('ui-icon-pin_on').addClass('ui-icon-pin_off')
    }
  }
})

var OrgView = Backbone.Marionette.CompositeView.extend({
  template: '#org__tpl',
  templateHelpers: function(){
    var tmp = {
      text: this.model.get('layer_owner_name') + ', ЄДРПОУ ' + this.model.get('layer_owner_code'),
      chkd: ( +this.model.get('chkd') ? 'on' : 'off' ),
      isPinnable: this.isPinnable,
      chk: +this.model.get('chkd') ? 'checked' : ''
    }
    return  tmp
  },
  className: 'org_item_view ui-collapsible ui-collapsible-inset ui-corner-all ui-collapsible-collapsed',
  attributes: {
    'data-role': "collapsible",
    'data-enhanced': "true",
    "data-iconpos": "noicon"
  },
  initialize: function(options){
    this.isPinnable = options.isPinnable
    this.searchStr = options.searchStr
    this.collection = new Backbone.Collection( this.model.get('layers') )
    Marionette.bindEntityEvents(this, this.collection, this.collectionEvents);
  },
  childViewOptions: function(model){
    return {
      'isPinnable': this.isPinnable,
      'layer_owner_id': this.model.get('layer_owner_id')
    }
  },
  childView: OrgLayerView,
  childViewContainer: '.layers_container',
  filter: function(child, index, collection){
    var isChildPinedOrChecked = ( child.get('pined')===1 || child.get('chkd')===1 )
    var isChildVisible = this.isPinnable ? isChildPinedOrChecked : !isChildPinedOrChecked
    if( isChildVisible && this.searchStr!=='' ) {
      return child.get('layer_name').toLowerCase().indexOf(this.searchStr) !== -1
    } else {
      return isChildVisible
    }
  },
  ui: {
    'chk': '.org__chk input',
    'pin': '.org__pin'
  },
  events: {
    'change @ui.chk': 'onCheck',
    'click @ui.pin': 'onPin'
  },
  collectionEvents: {
    'change': 'onCollectionChange'
  },
  onCheck: function(){
    if( this.ui.chk.prop('checked') ){
      this.model.set('chkd', 1)
      this.setModelCheckedTo(true)
    } else {
      this.model.set('chkd', 0)
      this.setModelCheckedTo(false)
    }
    this.trigger('render:me', this.$el.collapsible('option', 'collapsed'))
  },
  onPin: function(){
    if( this.ui.pin.hasClass('ui-icon-pin_on') ){
      this.unpin()
      this.setModelPinedTo(false)
    } else {
      this.pin()
      this.setModelPinedTo(true)
    }
    this.trigger('render:me', this.$el.collapsible('option', 'collapsed'))
  },
  onCollectionChange: function(e){
    if( e.changed.hasOwnProperty('chkd') ){
      if(this.model.get('chkd')===1 && e.get('chkd')===0){
        this.uncheck()
      } else if(this.model.get('chkd')===0 && e.get('chkd')===1 && this.isAllCollectionChecked()){
        this.check()
      }
    }
    if( e.changed.hasOwnProperty('pined') ){
      if(this.model.get('pined')===1 && e.changed.pined===0){
        this.unpin()
      } else if(this.model.get('pined')===0 && e.changed.pined===1 && this.isAllCollectionPined()){
        this.pin()
      }
    }
    this.syncModelWithCollection()
    if( !this.filter(e) ) {
      this.trigger('render:expand')
    }
  },
  syncModelWithCollection: function(){
    this.model.set('layers', this.collection.toJSON())
  },
  pin: function(){
    this.model.set('pined', 1)
    this.ui.pin.removeClass('ui-icon-pin_off').addClass('ui-icon-pin_on')
  },
  unpin: function(){
    this.model.set('pined', 0)
    this.ui.pin.removeClass('ui-icon-pin_on').addClass('ui-icon-pin_off')
  },
  check: function(){
    this.model.set('chkd', 1)
    this.ui.chk.prop('checked', true).checkboxradio('refresh')
  },
  uncheck: function(){
    this.model.set('chkd', 0)
    this.ui.chk.prop('checked', false).checkboxradio('refresh')
  },
  isAllCollectionChecked: function(){
    return _.every(this.collection.models, function(item){
      return item.get('chkd')===1
    })
  },
  isAllCollectionPined: function(){
    return _.every(this.collection.models, function(item){
      return item.get('pined')===1
    })
  },
  setModelCheckedTo: function(check){
    _.each(this.model.get('layers'), function(item){
      item.chkd = +check
    })
  },
  setModelPinedTo: function(pined){
    _.each(this.model.get('layers'), function(item){
      item.pined = +pined
    })
  },
  expand: function () {
    this.$el.collapsible( "expand" )
  },
  collapse: function () {
    this.$el.collapsible( "collapse" )
  }
})
var SearchView = Backbone.Marionette.ItemView.extend({
  template: _.template('<input type="text" data-type="search" value="">'),
  tagName: 'label',
  className: 'search',
  ui: {
    'input': 'input'
  },
  events: {
    'keyup @ui.input': 'keyup',
    'click .ui-input-clear': 'search'
  },
  keyup: function(e){
    if( (e.keyCode || e.which) == 13 ) {
      this.ui.input.blur()
    } else {
      this.search()
    }
  },
  search: _.debounce(function(){
    console.log('Search requested with "' + this.ui.input.val() +'"')
    this.searchblView.setSearchStr( this.ui.input.val().toLowerCase() )
  }, 700)
})
function makeListOrgs(){
  if( window.state.user.filters ){
    var res = _.map(window.state.listOrgs, function(item){
      var unit = {}
      var ownrSetts = _.findWhere(state.user.filters[0].filter4, {layer_owner_id: +item.layer_owner_id})
      if ( ownrSetts && ownrSetts.chkd===1 && ownrSetts.pined===1 ) {
        unit.layer_owner_id = +item.layer_owner_id
        unit.layer_owner_code = item.layer_owner_code
        unit.layer_owner_name = item.layer_owner_name
        unit.chkd = 1
        unit.pined = 1
        unit.layers = _.map(item.layers, function(layer){
          var res = {}
          res.uniq_id = +layer.uniq_id
          res.layer_name = layer.layer_name
          res.chkd = 1
          res.pined = 1
          return res
        })
      } else if ( ownrSetts && (ownrSetts.chkd===1 || ownrSetts.pined===1) ) {
        unit.layer_owner_id = +item.layer_owner_id
        unit.layer_owner_code = item.layer_owner_code
        unit.layer_owner_name = item.layer_owner_name
        unit.chkd = ownrSetts.chkd
        unit.pined = ownrSetts.pined
        unit.layers = _.map(item.layers, function(layer){
          var layerSetts = _.findWhere(state.user.filters[0].filter4, {uniq_id: +layer.uniq_id})
          var res = {}
          if ( layerSetts ) {
            res.uniq_id = +layer.uniq_id
            res.layer_name = layer.layer_name
            res.chkd = ownrSetts.chkd ? ownrSetts.chkd : layerSetts.chkd
            res.pined = ownrSetts.pined ? ownrSetts.pined : layerSetts.pined
          } else {
            res.uniq_id = +layer.uniq_id
            res.layer_name = layer.layer_name
            res.chkd = 0
            res.pined = 0
          }
          return res
        })
      } else {
        unit.layer_owner_id = +item.layer_owner_id
        unit.layer_owner_code = item.layer_owner_code
        unit.layer_owner_name = item.layer_owner_name
        unit.chkd = 0
        unit.pined = 0
        unit.layers = _.map(item.layers, function(layer){
          var layerSetts = _.findWhere(state.user.filters[0].filter4, {uniq_id: +layer.uniq_id})
          var res = {}
          if ( layerSetts ) {
            res.uniq_id = +layer.uniq_id
            res.layer_name = layer.layer_name
            res.chkd = layerSetts.chkd
            res.pined = layerSetts.pined
          } else {
            res.uniq_id = +layer.uniq_id
            res.layer_name = layer.layer_name
            res.chkd = 0
            res.pined = 0
          }
          return res
        })
      }
      return unit
    })
  } else {
    var res = _.map(window.state.listOrgs, function(item){
      var unit = {}
      unit.layer_owner_id = +item.layer_owner_id
      unit.layer_owner_code = item.layer_owner_code
      unit.layer_owner_name = item.layer_owner_name
      unit.chkd = 0
      unit.pined = 0
      unit.layers = _.map(item.layers, function(layer){
        var res = {}
        res.uniq_id = +layer.uniq_id
        res.layer_name = layer.layer_name
        res.chkd = 0
        res.pined = 0
        return res
      })
      return unit
    })
  }
  return res
}
var ListOrgCollection = Backbone.Collection.extend({
  exportListOrgSetts: function() {
    var listOrgs = this.toJSON()
    var result = _.reduce(listOrgs, function(memo, item){
      if( item.chkd===1 && item.pined===1 ){
        var tmp = {}
        tmp.chkd = item.chkd
        tmp.pined = item.pined
        tmp.layer_owner_id = item.layer_owner_id
        memo.push(tmp)
      } else if( item.chkd===1 || item.pined===1 ){
        var tmp = {}
        tmp.chkd = item.chkd
        tmp.pined = item.pined
        tmp.layer_owner_id = item.layer_owner_id
        memo.push(tmp)
        _.each(item.layers, function(unit){
          if( unit.chkd===1 || unit.pined===1 ){
            var tmp = {}
            tmp.chkd = unit.chkd
            tmp.pined = unit.pined
            tmp.uniq_id = unit.uniq_id
            memo.push(tmp)
          }
        })
      } else {
        _.each(item.layers, function(unit){
          if( unit.chkd===1 || unit.pined===1 ){
            var tmp = {}
            tmp.chkd = unit.chkd
            tmp.pined = unit.pined
            tmp.uniq_id = unit.uniq_id
            memo.push(tmp)
          }
        })
      }
      return memo
    },[])
    window.state.sendGET(window.state.urlMarkers)
    if( window.state.user.id ) {
      var promise = $.ajax({
        type: "POST",
        url: "https://gurtom.mobi/filter_layers_change_user.php",
        dataType: "json",
        crossDomain: true,
        data: { "filter": result.length===0 ? [{'filter':'empty'}] : result }
      })
      promise.done(function(response){
        if(response.error===0){
          console.log("UserPrefer4thFilter updated successfully")
        } else if(response.error!==0){
          console.log("UserPrefer4thFilter update failed, error:"+ response.error)
        }
      });
      promise.fail(function(response){
        console.log("UserPrefer4thFilter update failed.")
      });
    } else if ( !state.user.filters ) {
      state.user.filters = []
      state.user.filters[0] = {}
    }
    state.user.filters[0].filter4 = result
  }
})
var OrgsCollectionView = Backbone.Marionette.CollectionView.extend({
  attributes: {
    "data-role": "collapsibleset"
  },
  childView: OrgView,
  initialize: function(options){
    this.collection = listOrgCollection
    $.extend(options, { searchStr: this.searchStr })
    this.childViewOptions = options
  },
  filter: function (child, index, collection) {
    var that = this
    var childCollection = _.filter(child.get('layers'), function(item){
      var isGrandChildPinedOrChecked = ( item.pined===1 || item.chkd===1 )
      return that.childViewOptions.isPinnable ? isGrandChildPinedOrChecked : !isGrandChildPinedOrChecked
    })
    var isChildVisible = childCollection.length===0 ? false : true
    if(isChildVisible && this.searchStr!==''){
      var isSearchStrInChildModel =
       child.get('layer_owner_name').toLowerCase().indexOf(this.searchStr) !== -1
       || child.get('layer_owner_code').toLowerCase().indexOf(this.searchStr) !== -1
      childCollection = _.filter(childCollection, function(item){
        return item.layer_name.toLowerCase().indexOf(that.searchStr) !== -1
      }) 
      var isSearchStrInChildCollection = childCollection.length===0 ? false : true
      return isSearchStrInChildModel || isSearchStrInChildCollection
    } else {
      return isChildVisible
    }
  },
  setSearchStr: function(option){
    this.searchStr = option
    $.extend(this.childViewOptions, { searchStr: option })
    this.render().$el.collapsibleset().trigger('create')
  },
  searchStr: '',
  childEvents: {
    'render:expand': 'onChildRenderExpand',
    'render:me': 'renderOnChildViewRequest'
  },
  twin: 'is set by fourthFilterView.onShow',
  onChildRenderExpand: function (childView) {
    this.renderOnChildViewRequest(childView, false)
  },
  renderOnChildViewRequest: function(childView, isChildViewCollapsed){
    var cid = childView.model.cid
    var that = this
    setTimeout(function(){
      that.render().$el.collapsibleset().trigger('create')
      that.twin.render().$el.collapsibleset().trigger('create')
      if ( !isChildViewCollapsed ) {
        var targetChild
        if ( targetChild = that.children.findByModelCid(cid) ) targetChild.expand()
        if ( targetChild = that.twin.children.findByModelCid(cid) ) targetChild.expand()
      }
    }, 500)
  }
})
var FourthFilterView = Backbone.Marionette.LayoutView.extend({
  template: '#fourth_filter__tpl',
  className: 'org__view',
  regions: {
    'selected': '.selected_layers',
    'search': '.search_wrapper',
    'unselected': '.unselected_layers'
  },
  onShow: function(){
    this.$el.trigger('create')
    this.selected.currentView.twin = this.unselected.currentView
    this.unselected.currentView.twin = this.selected.currentView
    this.search.currentView.searchblView = this.unselected.currentView
  },
  onBeforeShow: function(){
    this.showChildView('selected', new OrgsCollectionView({isPinnable: true}))
    this.showChildView('search', new SearchView())
    this.showChildView('unselected', new OrgsCollectionView({isPinnable: false}))
  },
  initialize: function(){
    this.collection = listOrgCollection
    this.collectionEvents = {}
    var that = this
    this.collectionEvents.change = _.debounce(that.onCollectionChange, 200) 
    Marionette.bindEntityEvents(this, this.collection, this.collectionEvents);
  },
  onCollectionChange: function(){
    this.collection.exportListOrgSetts()
    window.Manager.trigger('state_update')
  }
})

function trans4thFilterStateToRoute(){
  if ( !window.state.user.filters ) return {
    ocp: '',
    oc: '',
    op: '',
    lcp: '',
    lc: '',
    lp: ''
  } 
  var owner_chk_pined = [],
      owner_chk = [],
      owner_pined = [],
      layer_chk_pined = [],
      layer_chk = [],
      layer_pined = []
  _.each(window.state.user.filters[0].filter4, function(item){
    switch ( '' + item.chkd + item.pined ) {
      case '11':
        if ( item.hasOwnProperty('uniq_id') ) layer_chk_pined.push(item.uniq_id)
        else owner_chk_pined.push(item.layer_owner_id)
        break;
      case '10':
        if ( item.hasOwnProperty('uniq_id') ) layer_chk.push(item.uniq_id)
        else owner_chk.push(item.layer_owner_id)
        break;
      case '01':
        if ( item.hasOwnProperty('uniq_id') ) layer_pined.push(item.uniq_id)
        else owner_pined.push(item.layer_owner_id)
        break;
    }
  })
  var res = {
    ocp: owner_chk_pined.join(),
    oc: owner_chk.join(),
    op: owner_pined.join(),
    lcp: layer_chk_pined.join(),
    lc: layer_chk.join(),
    lp: layer_pined.join()
  }
  return res
}
function trans4thFilterRouteToState(arr){
  var res = []
  _.each(arr, function(item, index){
    if ( item!=='.' ){
      var ar = item.split(',')
      _.each(ar, function(it){
        var ob = {}
        ob.chkd = ( index===2 || index===5 ) ? 0 : 1
        ob.pined = ( index===1 || index===4 ) ? 0 : 1
        if ( index < 3 ) ob.layer_owner_id = +it
        else ob.uniq_id = +it
        res.push( ob )
        ob = {}
      })
    }
  })
  if ( !window.state.user.filters ) {
    window.state.user.filters = []
    window.state.user.filters[0] = {}
  }
  window.state.user.filters[0].filter4 = res
}

