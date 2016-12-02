'use strict'

$.fn.exists = function () { //  http://stackoverflow.com/questions/7141334/checking-if-a-jquery-selector-doesnt-find-any-results
    return this.length !== 0; //  true if selector returned not empty jquery object
}
var indexOfLastNonEmptyElement = function(array){
  for ( var i=array.length-1; i>=0; i--){
    if ( array[i] ) return i
  }
  return undefined
}
// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
  Object.keys = (function() {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
      hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
      dontEnums = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'constructor'
      ],
      dontEnumsLength = dontEnums.length;
    return function(obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }
      var result = [], prop, i;
      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }
      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}

/*
 * DOMParser HTML extension
 * 2012-09-04
 * 
 * By Eli Grey, http://eligrey.com
 * Public domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*! @source https://gist.github.com/1129031 */
/*global document, DOMParser*/

(function(DOMParser) {
	"use strict";

	var
	  DOMParser_proto = DOMParser.prototype
	, real_parseFromString = DOMParser_proto.parseFromString
	;

	// Firefox/Opera/IE throw errors on unsupported types
	try {
		// WebKit returns null on unsupported types
		if ((new DOMParser).parseFromString("", "text/html")) {
			// text/html parsing is natively supported
			return;
		}
	} catch (ex) {}

	DOMParser_proto.parseFromString = function(markup, type) {
		if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
			var
			  doc = document.implementation.createHTMLDocument("")
			;
	      		if (markup.toLowerCase().indexOf('<!doctype') > -1) {
        			doc.documentElement.innerHTML = markup;
      			}
      			else {
        			doc.body.innerHTML = markup;
      			}
			return doc;
		} else {
			return real_parseFromString.apply(this, arguments);
		}
	};
}(DOMParser));


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

window.Lib = Marionette.Object.extend({
  tagList: function(that) {
    var list = '',
        tags = that.model.get('tags')
    if(tags && tags.length > 0){
      list = "#"+_.map(tags, function(item){
        var tag = window.lib.htmlEntityDecode( item.tag )
        return tag
      })
      .join(', #')
    }
    return { tagList: list }
  },
  isJson: function (str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
  },
  currency: {
    _data: {
      ICAN: '1',
      USD: '840',
      EUR: '978',
      UAH: '980',
      vUAH: '1980'
    },
    getCode: function(name){
      return window.lib.currency._data[name]
    },
    getName: function(code){
      for(var name in window.lib.currency._data){
        if(window.lib.currency._data[name] == code) return name
      }
      return undefined
    }
  },
  //  http://stackoverflow.com/questions/1912501/unescape-html-entities-in-javascript
  htmlEntityDecode: function(htmlString){
    var doc1 = new DOMParser().parseFromString(htmlString, "text/html");
    var doc2 = new DOMParser().parseFromString(doc1.documentElement.textContent, "text/html");
    return doc2.documentElement.textContent
  },
  bType: {
    _data: {
      'голосування': '1',
      'програма': '2',
      'проектна пропозиція': '3',
      'проект': '4',
      'запит': '5',
      'тут добре': '69',
      'тут погано': '96',
      'проект по бюджету участі': '330', 
      'важливо': '777',
      'СОС': '911'
    },
    getCode: function(name){
      return window.lib.bType._data[name]
    },
    getName: function(code){
      for(var name in window.lib.bType._data){
        if(window.lib.bType._data[name] == code) return name
      }
      return undefined
    }
  }
})
window.lib = new window.Lib()

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

var btnsCopyDel = [
  {
    text: 'Скопіювати до себе',
    className: 'copy',
    isAvailable: function(options){
      var full = options.full && options.full.length > 0
      var isNotAuthor = window.state.user.id && window.state.user.id !== options.author_id  
      return full && isNotAuthor 
    }
  },
  {
    text: 'Видалити маячок',
    className: 'delete',
    isAvailable: function(options){
      return window.state.user.id === options.author_id && options.b_status.join() === "0,0,0,0"
    }
  }
]

window.state.statusList = {}
window.state.statusList.SOS = [
  {
    bStatusIndex: 0,
    icon: 'ui-icon-progress_empty',
    text: [
      ' ',
      'Очікує на перевірку',
      'Прийнято до перевірки'
    ],
    btns: [
      {
        text: 'Прийняти до перевірки',
        className: 'verify',
        chngTo: 1,
        isAvailable: function(options){
          return +window.state.user.id > 0 && window.state.user.id !== options.author_id
        }
      }
    ],
  },
  {
    bStatusIndex: 1,
    icon: 'ui-icon-progress_one',
    text: [
      'Спростовано',
      'Очікує на підтверження',
      'Підтверджено'
    ],
    btns: [
      {
        text: 'Підтвердити',
        className: 'confirm',
        chngTo: 1,
        isAvailable: function(options){
          return +window.state.user.nco > 0 || +window.state.user.gov > 0 
        }
      },
      {
        text: 'Спростувати',
        className: 'disprove',
        chngTo: -1,
        isAvailable: function(options){
          return +window.state.user.nco > 0 || +window.state.user.gov > 0
        }
      }
    ]
  },
  {
    bStatusIndex: 2,
    icon: 'ui-icon-progress_two',
    text: [
      ' ',
      'Очікує на допомогу',
      'Допомогу запропоновано'
    ],
    btns: [
      {
        text: 'Запропонувати свою допомогу',
        className: 'lendhand',
        chngTo: 1,
        isAvailable: function(options){
          return +window.state.user.id > 0  && window.state.user.id !== options.author_id
        }
      }
    ]
  },
  {
    bStatusIndex: 3,
    icon: 'ui-icon-progress_full',
    text: [
      ' ',
      'Очікує завершення',
      'Завершено'
    ],
    btns: [
      {
        text: 'Завершити',
        className: 'complete',
        chngTo: 1,
        isAvailable: function(options){
          return +window.state.user.nco > 0 || +window.state.user.gov > 0 || window.state.user.id === options.author_id
        }
      }
    ]
  },
  {
    bStatusIndex: 'addLast',
    btns: btnsCopyDel
  }
]
window.state.statusList.infoAndEvent = [
  {
    bStatusIndex: 0,
    icon: 'ui-icon-progress_empty',
    text: [
      '',
      'Очікує на початок',
      'Розпочато'
    ],
    btns: [
      {
        text: 'Розпочати',
        className: 'start',
        chngTo: 1,
        isAvailable: function(options, b_st){
          return window.state.user.id === options.author_id && b_st < 1 
        }
      }
    ],
  },
  {
    bStatusIndex: 1,
    icon: 'ui-icon-progress_full',
    text: [
      '',
      'Очікує завершення',
      'Завершено'
    ],
    btns: [
      {
        text: 'Завершити',
        className: 'complete',
        chngTo: 1,
        isAvailable: function(options, b_st){
          return window.state.user.id === options.author_id && b_st < 1
        }
      }
    ]
  },
  {
    btns: btnsCopyDel
  }
]
window.state.statusList.goodAndBad = [
  {
    btns: btnsCopyDel
  }
]
window.state.statusList.projPropAndProjectAndRequest = [
  {
    bStatusIndex: 0,
    icon: 'ui-icon-progress_empty',
    text: [
      'Кошти не зібрано',
      'Збір коштів',
      'Кошти зібрано'
    ]
  },
  {
    bStatusIndex: 1,
    icon: 'ui-icon-progress_one',
    text: [
      ' ',
      'Визначення НКО для адміністрування',
      'НКО для адміністрування визначено'
    ]
  },
  {
    bStatusIndex: 2,
    icon: 'ui-icon-progress_two',
    text: [
      ' ',
      'Переведення коштів на НКО',
      'Кошти на Нко переведено'
    ],
    btns: [
      {
        text: 'Перевести кошти НКО',
        className: 'transfer',
        chngTo: 1,
        isAvailable: function(){
          return +window.state.user.id === 4618
        }
      }
    ]
  },
  {
    bStatusIndex: 3,
    icon: 'ui-icon-progress_full',
    text: [
      ' ',
      'Очікує завершення',
      'Завершено'
    ],
    btns: [
      {
        text: 'Завершити',
        className: 'complete',
        chngTo: 1,
        isAvailable: function(options){
          return !!options.full && window.state.user.id === options.nco_id && +options.nco_acceptance === 1
        }
      }
    ]
  },
  {
    bStatusIndex: 'addLast',
    btns: btnsCopyDel
  }
]
window.state.statusList.program = [
  {
    btns: btnsCopyDel
  }
]
window.state.statusList.partBudg_Vot_WeightVot = [
  {
    btns: btnsCopyDel
  }
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

function getListMenuOrg() {
  $.ajax({
    url: "https://gurtom.mobi/beacon_list_layers.php",
    dataType: "json",
    crossDomain: true,
    success: function ( response ) {
      if(response.length === 0){
        console.log('listMenuOrg is empty')
      }
      window.state.listMenuOrg = response
    },
    error: function(){
      console.log('listMenuOrg request error')
    }
  })
}
getListMenuOrg.isAvailable = function(){
  return +window.state.user.gov > 0 || +window.state.user.nco > 0
}

function getIconURL(r, relative) {
	var iconMainURL = ( relative ? '/' : window.iconMainURL )
	if(r.b_type && +r.b_type < 1000) {
		return iconMainURL + "images/" + r.b_type +'.png' 
	} else if(r.b_type && r.layer_owner_id && r.layer_type && +r.b_type >= 1000 ){
		// return iconMainURL +"uploads/"+ r.layer_owner_id +"/" + r.b_type + "/" + r.layer_type +'.png'
    return iconMainURL +"uploads/"+ r.layer_owner_id +"/" + r.b_type + "/" + r.id +'.png'
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

