"use strict"

var Manager = new Marionette.Application();
Manager.App = {}
var API = {
    home: function(){
      $(":mobile-pagecontainer").pagecontainer("change", $('#beacons-map'), {changeHash: false})
    },
    login: function(){
      $(":mobile-pagecontainer").pagecontainer("change", $('#login_dialog'), {changeHash: false})
    },
    register: function(){
      console.log("route to register was triggered");
    },
    repass: function(){
      console.log("route to restorePass was triggered");
    },
    create: function(){
      console.log("route to create was triggered");
    }
  }
Manager.App.Router = Marionette.AppRouter.extend({
  appRoutes: {
    home: 'home',
    login: 'login',
    register: 'register',
    restorePass: 'repass',
    create: 'create',
  },
  controller: API
})

Manager.navigate = function(route, options){
  options || (options = {});
  Backbone.history.navigate(route, options);
};
Manager.getCurrentRoute = function(){
  return Backbone.history.fragment
};

Manager.on("start", function(){
  if(Backbone.history){
    Backbone.history.start();
  }
  new Manager.App.Router()
  if(this.getCurrentRoute() === ""){
    this.navigate('home')
  } else {
    this.trigger(this.getCurrentRoute())
  }
});
Manager.on('home', function(){
  Manager.navigate('home')
  API.home()
  console.log("home event handler");
})
Manager.on('login', function(){
  Manager.navigate('login')
  API.login()
  console.log("login event handler");
})

