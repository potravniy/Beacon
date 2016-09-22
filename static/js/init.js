'use strict'

$.fn.exists = function () { //  http://stackoverflow.com/questions/7141334/checking-if-a-jquery-selector-doesnt-find-any-results
    return this.length !== 0;
}

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
    img: "/images/911.png"
  },
  { b_type: "777",
    layer_owner_id: "",
    layer_type: "",
    name: "Важливо",
    type: "777",
    className: 'important',
    img: "/images/777.png"
  },
  { b_type: "69",
    layer_owner_id: "",
    layer_type: "",
    name: "Тут добре",
    type: "69",
    className: 'emo_good',
    img: "/images/69.png"
  },
  { b_type: "96",
    layer_owner_id: "",
    layer_type: "",
    name: "Тут погано",
    type: "96",
    className: 'emo_bad',
    img: "/images/96.png"
  },
  { b_type: "1",
    layer_owner_id: "",
    layer_type: "",
    name: "Голосування",
    type: "1",
    className: 'voting',
    img: "/images/1.png"
  },
  { b_type: "2",
    layer_owner_id: "",
    layer_type: "",
    name: "Програма",
    type: "2",
    className: 'program',
    img: "/images/2.png"
  },
  { b_type: "3",
    layer_owner_id: "",
    layer_type: "",
    name: "Проектна пропозиція",
    type: "3",
    className: 'project_proposal',
    img: "/images/3.png"
  },
  { b_type: "4",
    layer_owner_id: "",
    layer_type: "",
    name: "Проект",
    type: "4",
    className: 'project',
    img: "/images/4.png"
  },
  { b_type: "330",
    layer_owner_id: "",
    layer_type: "",
    name: "Бюджет участі",
    type: "330",
    className: 'p_budget',
    img: "/images/330.png"
  },
  { b_type: "5",
    layer_owner_id: "",
    layer_type: "",
    name: "Запит",
    type: "5",
    className: 'request',
    img: "/images/5.png"
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
      if(response.length === 0){
        console.log('listMenuLMR is empty')
      }
      window.state.listMenuLMR = response
    },
    error: function(){
      console.log('listMenuLMR request error')
    }
  })
}

function getIconURL(r, relative) {
	var iconMainURL = ( relative ? '/' : window.iconMainURL )
	if(r.b_type && +r.b_type < 1000) {
		return iconMainURL + "images/" + r.b_type +'.png' 
	} else if(r.b_type && r.layer_owner_id && r.layer_type && +r.b_type >= 1000 ){
		return iconMainURL +"uploads/"+ r.layer_owner_id +"/" + r.b_type + "/" + r.layer_type +'.png'
	}
	return "//:0"
}

function minifyObj(obj){
  return _.pick(obj, function(val){
    return val !== '' 
  })
}

window.transitionEndEventName = (function() {   //  http://stackoverflow.com/questions/5023514/how-do-i-normalize-css3-transition-functions-across-browsers
  var i,
    el = document.createElement('div'),
    transitions = {
      'transition':'transitionend',
      'OTransition':'otransitionend',  // oTransitionEnd in very old Opera
      'MozTransition':'transitionend',
      'WebkitTransition':'webkitTransitionEnd'
    };
  for (i in transitions) {
    if (transitions.hasOwnProperty(i) && el.style[i] !== undefined) {
      return transitions[i];
    }
  }
})()

setTimeout(function(){
  $('.warning').remove()
}, 4000)
