'use strict'

$.ajax({
  url: "https://gurtom.mobi/nco.php",
  dataType: "json",
  crossDomain: true,
  success: function ( response ) {
    window.state.listNCO = response
  },
  error: function(){
    console.log('nco request error')
  }
})

var Currency = function(){
  var curr = {
    ICAN: '1',
    USD: '840',
    EUR: '978',
    UAH: '980',
    vUAH: '1980'
  }
  var that = this
  this.getCode = function(name){
    return curr[name]
  }
  this.getName = function(code){
    for(var name in curr){
      if(curr[name] == code) return name
    }
    return undefined
  }
}
var currency = new Currency()

window.state.usrAuthLvl = [  //  Index corresponds to v+index in response JSON.
  'Авторизовані через електронну пошту',  //  "v0"
  'Авторизовані через соціальні мережі',
  "Члени громадських об'єднань",
  'Співвласники',
  'Авторизовані через платіж',
  'Авторизовані через банківську ідентифікацію'
]
window.state.listMenu = [
  { b_type: "911",
    layer_owner_id: "",
    layer_type: "",
    name: "SOS",
    type: "911",
    className: 'sos',
  },
  { b_type: "777",
    layer_owner_id: "",
    layer_type: "",
    name: "Важливо",
    type: "777",
    className: 'important',
  },
  { b_type: "69",
    layer_owner_id: "",
    layer_type: "",
    name: "Тут добре",
    type: "69",
    className: 'emo_good',
  },
  { b_type: "96",
    layer_owner_id: "",
    layer_type: "",
    name: "Тут погано",
    type: "96",
    className: 'emo_bad',
  },
  { b_type: "1",
    layer_owner_id: "",
    layer_type: "",
    name: "Голосування",
    type: "1",
    className: 'voting',
  },
  { b_type: "2",
    layer_owner_id: "",
    layer_type: "",
    name: "Програма",
    type: "2",
    className: 'program',
  },
  { b_type: "3",
    layer_owner_id: "",
    layer_type: "",
    name: "Проектна пропозиція",
    type: "3",
    className: 'project_proposal',
  },
  { b_type: "4",
    layer_owner_id: "",
    layer_type: "",
    name: "Проект",
    type: "4",
    className: 'project',
  },
  { b_type: "330",
    layer_owner_id: "",
    layer_type: "",
    name: "Бюджет участі",
    type: "330",
    className: 'p_budget',
  },
  { b_type: "5",
    layer_owner_id: "",
    layer_type: "",
    name: "Запит",
    type: "5",
    className: 'request',
  },
]

function getSpheresForVoting(){
  $.ajax({
    url: "https://gurtom.mobi/sph.php",
    dataType: "json",
    crossDomain: true,
    success: function ( response ) {
      window.state.sphereJSON = response
    },
    error: function(){
      console.log('sphere request error')
    }
  })
}

function getListMenuLMR() {
  $.ajax({
    url: "https://gurtom.mobi/beacon_list_layers.php",
    dataType: "json",
    crossDomain: true,
    success: function ( response ) {
      window.state.listMenuLMR = response
    },
    error: function(){
      console.log('listMenuLMR request error')
    }
  })
}

