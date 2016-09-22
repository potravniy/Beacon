BeaconManager.module("Entities", function(Entities, BeaconManager,
Backbone, Marionette, $, _){
  Entities.Chat = Backbone.Model.extend({
    defaults: {
      beacon_id: "",
      user_id: "",
      avatar: "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAIC‌​RAEAOw==", //  1px x 1px transparent gif
      text: "Ваше повідомлення може бути першим.",
      ts: "",
    }
  });
  Entities.ChatCollection = Backbone.Collection.extend({
    model: Entities.Chat,
    comparator: "ts"
  });
  
  var Chat;
  var initializeChat = function(){
    Chat = new Entities.BeaconCollection([
      {
        beacon_id: "12345",
        user_id: "Nick",
        avatar: "./static/img/dog.png",
        text: "Залишайтесь на зв'язку, я вже їду до Вас. Буду хвилин за 30.",
        ts: "2016-03-21 11:45:13",
      },
      {
        beacon_id: "12345",
        user_id: "Nickname",
        avatar: "./static/img/user.jpg",
        text: "Дуже шкода, що так трапилось. Я спробую знайти когось поряд, чи зателефоную друзям або волонтерам.",
        ts: "2016-03-20 15:22:09",
      },
      {
        beacon_id: "10645",
        user_id: "Olga",
        avatar: "./static/img/user.jpg",
        text: "Залишайтесь на зв'язку, я вже їду до Вас. Буду за 20 хвилин.",
        ts: "2016-04-15 18:55:26",
      },
    ])
  }
  var API = {
    getChatForID: function(BID){
      if(Chat === undefined){
        initializeChat();
      }
      return _.filter(Chat, function (b) { return b.id == BID });
    }
  };
  console.log(API)
  BeaconManager.reqres.setHandler({
    "Chat:forBeaconID": function(BID){
      return API.getChatForID();
    }
  });
});