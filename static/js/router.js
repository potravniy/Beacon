"use strict"

var Manager = new Marionette.Application();
Manager.App = {}
var API = {
    home: function(z, lt, ln, qw, al, bs, bt, st, ft, ocp, oc, op, lcp, lc, lp, vs, ia){
    	console.log('router.home')
      if(z && lt && ln){
        window.state.zoom = +z
        window.state.center.lat = +lt
        window.state.center.lng = +ln
        window.state.filter = (qw==='.' ? '' : encodeURIComponent(qw))
        window.state.user_auth = (al==='.' ? '' : al)
        window.state.b_status = (bs==='.' ? '' : bs)
        window.state.b_types = (bt==='.' ? '' : bt)
        window.state.start = (st==='.' ? '' : encodeURIComponent(st))
        window.state.finish = (ft==='.' ? '' : encodeURIComponent(ft))
        window.filterViewUpdateFromDataURL(al, bs, bt, qw, st, ft, ocp, oc, op, lcp, lc, lp)
        window.state.viewState = vs
        var viewStateIdArray = (ia==='.' ? [] : _.map(ia.split(','), function(item){ return parseInt(item, 10) }))
        window.state.viewStateIdArray = viewStateIdArray
        window.state.initFromURL = true
      }
      $(":mobile-pagecontainer").pagecontainer("change", $('#beacons-map'), {changeHash: false})
    },
    login: function(){
      $(":mobile-pagecontainer").pagecontainer("change", $('#login_dialog'), {changeHash: false})
    },
    registration: function(){
      $(":mobile-pagecontainer").pagecontainer("change", $('#registration_dialog'), {changeHash: false})
    },
    passRestore: function(){
      $(":mobile-pagecontainer").pagecontainer("change", $('#restore_pass_dialog'), {changeHash: false})
    },
    passReset: function(){
      $(":mobile-pagecontainer").pagecontainer("change", $('#reset_pass_dialog'), {changeHash: false})
    },
    create: function(){
      console.log("route to create was triggered");
    }
  }
Manager.App.Router = Marionette.AppRouter.extend({
  appRoutes: {
    "": 'home',
    'home/:zoom': 'home',
    "main/:zoom/:lat/:lng/:mapSearch/:authLevel/:bStatus/:bTypes/:startTime/:finishTime/:ocp/:oc/:op/:lcp/:lc/:lp/:viewState/:viewStateIdArray": 'home',
    "login": 'login',
    "registration": 'registration',
    "pass_restore": 'passRestore',
    "pass_reset": 'passReset',
    "create": 'create'
  },
  controller: window.API,
  onRoute: function(name, path, args){
    console.log("onRouteHandler\n" + name +'\n'+ path +'\n'+ args);
  }
})

Manager.navigate = function(route, options){
  options || (options = {});
  Backbone.history.navigate(route, options);
};
Manager.getCurrentRoute = function(){
  return Backbone.history.fragment
};
Manager.getMapZoomAndCenter = function(){
  var mapRoute = Manager.getCurrentRoute().split('/')
  var options = {
    zoom: +mapRoute[1],
    center: new google.maps.LatLng(+mapRoute[2], +mapRoute[3])
  }
  return options
};

Manager.on("start", function(){
  Manager.App.router = new Manager.App.Router()
  Backbone.history.start();
  $('.history_back').click(function(){
    window.history.back()
  })
  console.log('router is ready')
});
Manager.on('state_update', function(){
  Manager.navigate(serializeState())
})
Manager.on('home', function(){
  API.home()
  Manager.navigate(serializeState())
})
Manager.on('login', function(){
  Manager.navigate('login')
  API.login()
  console.log("login event handler");
})
Manager.on('registration', function(){
  Manager.navigate('registration')
  API.registration()
  console.log("registration event handler");
})
Manager.on('pass_restore', function(){
  Manager.navigate('pass_restore')
  API.passRestore()
  console.log("pass_restore event handler");
})
Manager.on('pass_reset', function(){
  Manager.navigate('pass_reset')
  API.passReset()
  console.log("pass_reset event handler");
})

function serializeState() {
  var fourthFilter = trans4thFilterStateToRoute()
  var str = 'main/' + window.state.zoom
    + '/'+ window.state.center.lat
    + '/'+ window.state.center.lng
    + '/'+ (window.state.filter==='' ? "." : window.state.filter)
    + '/'+ (window.state.user_auth==='' ? "." : window.state.user_auth)
    + '/'+ (window.state.b_status==='' ? "." : window.state.b_status)
    + '/'+ (window.state.b_types==='' ? "." : window.state.b_types)
    + '/'+ (window.state.start==='' ? "." : window.state.start)
    + '/'+ (window.state.finish==='' ? "." : window.state.finish)
    + '/'+ (fourthFilter.ocp==='' ? "." : fourthFilter.ocp)
    + '/'+ (fourthFilter.oc==='' ? "." : fourthFilter.oc)
    + '/'+ (fourthFilter.op==='' ? "." : fourthFilter.op)
    + '/'+ (fourthFilter.lcp==='' ? "." : fourthFilter.lcp)
    + '/'+ (fourthFilter.lc==='' ? "." : fourthFilter.lc)
    + '/'+ (fourthFilter.lp==='' ? "." : fourthFilter.lp)
    + '/'+ window.state.viewState
    + '/'+ (window.state.viewStateIdArray.length===0 ? '.' : window.state.viewStateIdArray.join())
  return str + '/'
}
