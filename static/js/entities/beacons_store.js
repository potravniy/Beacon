BeaconManager.module("Entities", function(Entities, BeaconManager,
Backbone, Marionette, $, _){
  Entities.Beacon = Backbone.Model.extend({
    defaults: {
      id: "0",
      b_type: "0",
      lat: "49.0",
      lng: "31.4",
      ts: "0000-00-00 00:00:00",
      b_status: "empty",  //  'empty' / 'one' / 'two' / 'full'
      source: "0",  //  list required
      category: "0",
      subcategory: "0",
      category_full_title: "0",
      b_img: "//:0",
      details: "",
      favorite: "0",
    }
  });
  Entities.BeaconCollection = Backbone.Collection.extend({
    model: Entities.Beacon
    // ,comparator: function (item) {
    //   return item.get("firstName") + ' ' + item.get("lastName")
    // }
  });
  
  var Beacons;
  var initializeBeacons = function(){
    Beacons = new Entities.BeaconCollection([
      {
        id: "12345",
        b_type: "0",
        lat: "49.0",
        lng: "31.4",
        ts: "2016.03.27 11:32:02",
        b_status: "empty",  //  0 - 3
        source: "community",  //  list required
        category: "0",
        subcategory: "0",
        category_full_title: "SOS: Frozen",
        b_img: "./static/img/frozen.jpg",
        details: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Odit deleniti incidunt deserunt quos quas, atque? Voluptatibus exercitationem enim ex consectetur at, ad neque cum nesciunt atque quas. Architecto sunt, ullam.",
        favorite: "0",
      },
      {
        id: "10001",
        b_type: "0",
        lat: "49.0",
        lng: "31.4",
        ts: "2016.03.27 11:32:02",
        b_status: "one",  //  0 - 3
        source: "vk",  //  list required
        category: "0",
        subcategory: "0",
        category_full_title: "SOS: Crying in the night...",
        b_img: "./static/img/beacons_final_slide.png",
        details: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Odit deleniti incidunt deserunt quos quas, atque? Voluptatibus exercitationem enim ex consectetur at, ad neque cum nesciunt atque quas. Architecto sunt, ullam.",
        favorite: "0",
      },
      {
        id: "10645",
        b_type: "0",
        lat: "49.0",
        lng: "31.4",
        ts: "2016.03.27 11:32:02",
        b_status: "two",  //  0 - 3
        source: "facebook",  //  list required
        category: "0",
        subcategory: "0",
        category_full_title: "SOS: Перемога!",
        b_img: "./static/img/crime.jpg",
        details: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Odit deleniti incidunt deserunt quos quas, atque? Voluptatibus exercitationem enim ex consectetur at, ad neque cum nesciunt atque quas. Architecto sunt, ullam.",
        favorite: "1",
      },
      {
        id: "12349",
        b_type: "0",
        lat: "49.0",
        lng: "31.4",
        ts: "2016.05.03 15:12:52",
        b_status: "full",  //  0 - 3
        source: "linkedin",  //  list required
        category: "0",
        subcategory: "0",
        category_full_title: "SOS: Homeless gentlemen doesn't have a dinner",
        b_img: "./static/img/homeless.jpg",
        details: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Odit deleniti incidunt deserunt quos quas, atque? Voluptatibus exercitationem enim ex consectetur at, ad neque cum nesciunt atque quas. Architecto sunt, ullam.",
        favorite: "1",
      }
    ]);
  };
  var API = {
    getBeaconEntities: function(){  //  Да, но отдать же надо с чатом...
      if(Beacons === undefined){
        initializeBeacons();
      }
      return Beacons;
    },
    getBeaconWithID: function(ID){  //  Да, но отдать же надо с чатом...
      if(Beacons === undefined){
        initializeBeacons();
      }
      return _.find(Beacons, function (b) { return b.id == ID });
    }
  };
  BeaconManager.reqres.setHandler({
    "Beacon:entities": function(){
      return API.getBeaconEntities();
    },
    "Beacon:withID": function(ID){
      return API.getBeaconWithID();
    }
  });
});