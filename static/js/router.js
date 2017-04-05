"use strict"

var Manager = new Marionette.Application();
Manager.App = {}
Manager.API = {
    home: function(z, lt, ln, qw, al, bs, bt, st, ft, ocp, oc, op, lcp, lc, lp, vs, ia){
    	// console.log('router.home', Manager.getCurrentRoute())
      if(z && lt && ln){
      	// console.log('router.home resets state')
        window.state.zoom = +z
        window.state.center.lat = +lt
        window.state.center.lng = +ln
        window.state.filter = (qw==='-' ? '' : qw)
        window.state.user_auth = (al==='-' ? '' : al)
        window.state.b_status = (bs==='-' ? '' : bs)
        window.state.b_types = (bt==='-' ? '' : bt)
        window.state.start = (st==='-' ? '' : decodeURIComponent(st))
        window.state.finish = (ft==='-' ? '' : decodeURIComponent(ft))
        window.filterViewUpdateFromDataURL(al, bs, bt, qw, st, ft, ocp, oc, op, lcp, lc, lp)
        window.state.viewState = vs
        window.state.viewStateId = ia === '-' ? '' : ia
      }
      checkLoggedIn()
      window.state.initFromURL = true
      switch (window.state.viewState) {
        case 'mm':
          window.showBeaconsListView()
          break;
        case 'ms':
          window.showBeaconFullView()
          break;
      }
      window.showClipboard()
      $(":mobile-pagecontainer").pagecontainer("change", $('#beacons-map'), {changeHash: false})
    },
    login: function(usr_id, verif_code){
      $(":mobile-pagecontainer").pagecontainer("change", $('#login_dialog'), {changeHash: false})
      if ( usr_id && verif_code ) confirmVerification(usr_id, verif_code)
    },
    registration: function(){
      $(":mobile-pagecontainer").pagecontainer("change", $('#registration_dialog'), {changeHash: false})
    },
    passRestore: function(){
      $(":mobile-pagecontainer").pagecontainer("change", $('#restore_pass_dialog'), {changeHash: false})
    },
    passReset: function(verif_code){
      resetDialogInit(verif_code)
      $(":mobile-pagecontainer").pagecontainer("change", $('#reset_pass_dialog'), {changeHash: false})
    },
    create: function(){
      // console.log("route to create was triggered");
    }
  }
Manager.App.Router = Marionette.AppRouter.extend({
  appRoutes: {
    "": 'home',
    'home/:zoom': 'home',
    "main/:zoom/:lat/:lng/:mapSearch/:authLevel/:bStatus/:bTypes/:startTime/:finishTime/:ocp/:oc/:op/:lcp/:lc/:lp/:viewState/:viewStateId": 'home',
    "login": 'login',
    "login/:usr_id/:verif_code": 'login',
    "registration": 'registration',
    "pass_restore": 'passRestore',
    "pass_reset/:verif_code": 'passReset',
    "create": 'create'
  },
  controller: Manager.API,
  onRoute: function(name, path, args){
    // console.log("onRouteHandler\n" + name +'\n'+ path +'\n'+ args);
  }
})

Manager.navigate = function(route, options){
  options = options || {}
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
  Backbone.history.start();           //    {pushState: true}  
  $('.history_back').click(function(){
    window.history.back()
  })
  // console.log('router started')
});
Manager.on('state_update', function(){
  Manager.navigate(serializeState())
})
Manager.on('home', function(){
  Manager.API.home()
  Manager.navigate(serializeState())
})
Manager.on('login', function(){
  Manager.navigate('login')
  Manager.API.login()
  // console.log("login event handler");
})
Manager.on('registration', function(){
  Manager.navigate('registration')
  Manager.API.registration()
  // console.log("registration event handler");
})
Manager.on('pass_restore', function(){
  Manager.navigate('pass_restore')
  Manager.API.passRestore()
  // console.log("pass_restore event handler");
})
Manager.on('pass_reset', function(){
  Manager.API.passReset()
  Manager.navigate('pass_reset')
  // console.log("pass_reset event handler");
})

function serializeState(id, lat, lng) {
  var fourthFilter = trans4thFilterStateToRoute()
  var str = 'main/' + window.state.zoom
    + '/'+ ( lat===undefined ? window.state.center.lat : lat )
    + '/'+ ( lng===undefined ? window.state.center.lng : lng )
    + '/'+ ( +id>0 ? id : (window.state.filter==='' ? '-' : window.state.filter) )
    + '/'+ (window.state.user_auth==='' ? '-' : window.state.user_auth)
    + '/'+ (window.state.b_status==='' ? '-' : window.state.b_status)
    + '/'+ (window.state.b_types==='' ? '-' : window.state.b_types)
    + '/'+ (window.state.start==='' ? '-' : encodeURIComponent(window.state.start))
    + '/'+ (window.state.finish==='' ? '-' : encodeURIComponent(window.state.finish))
    + '/'+ (fourthFilter.ocp==='' ? '-' : fourthFilter.ocp)
    + '/'+ (fourthFilter.oc==='' ? '-' : fourthFilter.oc)
    + '/'+ (fourthFilter.op==='' ? '-' : fourthFilter.op)
    + '/'+ (fourthFilter.lcp==='' ? '-' : fourthFilter.lcp)
    + '/'+ (fourthFilter.lc==='' ? '-' : fourthFilter.lc)
    + '/'+ (fourthFilter.lp==='' ? '-' : fourthFilter.lp)
    + '/'+ window.state.viewState
    + '/'+ (window.state.viewStateId === '' ? '-' : window.state.viewStateId)
  return encodeURI(str)
}
