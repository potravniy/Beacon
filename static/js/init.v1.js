'use strict'

$.fn.exists = function () { //  http://stackoverflow.com/questions/7141334/checking-if-a-jquery-selector-doesnt-find-any-results
    return this.length !== 0; //  true if selector returned not empty jquery object
}
var indexOfLastNonEmptyElement = function(array){
  if (!Array.isArray( array )) return undefined
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
    if(response.error){
      alert(window.localeMsg[window.localeLang][response.error])
      return
    }
    window.state.listNCO = response
  },
  error: function(){
    console.log("https://gurtom.mobi/nco.php" + ' request has been failed')
    alert(window.localeMsg[window.localeLang].CONNECTION_ERROR)
  }
})

var data = {}
data[window.localeMsg[window.localeLang].VOTING] = '1'
data[window.localeMsg[window.localeLang].PROGRAMM] = '2'
data[window.localeMsg[window.localeLang].PROJECT_PROPOSAL] = '3'
data[window.localeMsg[window.localeLang].PROJECT] = '4'
data[window.localeMsg[window.localeLang].REQUEST] = '5'
data[window.localeMsg[window.localeLang].EMOTICON_GOOD] = '69'
data[window.localeMsg[window.localeLang].EMOTICON_BAD] = '96'
data[window.localeMsg[window.localeLang].PARTICIPATIVE_BUDGET] = '330'
data[window.localeMsg[window.localeLang].IMPORTANT] = '777'
data[window.localeMsg[window.localeLang].SOS] = '911'

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
      vUSD: '1840',
      vEUR: '1978',
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
    if(htmlString === "") return ""
    var doc1 = new DOMParser().parseFromString(htmlString, "text/html");
    var doc2 = new DOMParser().parseFromString(doc1.documentElement.textContent, "text/html");
    return doc2.documentElement.textContent
  },
  bType: {
    _data: data,
    getCode: function(name){
      return window.lib.bType._data[name]
    },
    getName: function(code){
      for(var name in window.lib.bType._data){
        if(window.lib.bType._data[name] == code) return name
      }
      return undefined
    }
  },
  isDemand: function(model){
    var type
    if(model.get){
      type = +model.get('b_type') === 1000 || !model.get('b_type')
        ? model.get('type')
        : model.get('b_type')
    } else {
      type = model.type || model.parent_type
    }
    return +type > 50 && +type !== 330
  },
  areInSameCategory: function(beaconA, beaconB){
    return window.lib.isDemand(beaconA) === window.lib.isDemand(beaconB)
  },
  isAuthor: function(model){
    var options = model.get ? model.attributes : model
    return window.state.user.id === options.author_id
  },
  getNCObyID: function(id){
    return _.find(window.state.listNCO, function(NCO){
      return NCO.id == id
    })
  },
  getNameNCObyID: function(id){
    if(+id !== 0) {
      var nco = window.lib.getNCObyID(id)
      return nco ? nco.nco_name : 'undefined'
    }
    else return 'undefined'
  }
})

window.lib = new window.Lib()

window.state.usrAuthLvl = [  //  Index corresponds to v+index in response JSON.
  window.localeMsg[window.localeLang].AUTH_WITH_EMAIL,  //  v0
  window.localeMsg[window.localeLang].AUTH_WITH_SOCIAL_NET,
  window.localeMsg[window.localeLang].CIVIL_ORGS_MEMBERS,
  window.localeMsg[window.localeLang].COOWNERS,
  window.localeMsg[window.localeLang].AUTH_WITH_PAYMENT,
  window.localeMsg[window.localeLang].AUTH_WITH_BANK_ID
]
window.state.listMenu = [
  { b_type: "911",
    layer_owner_id: "",
    layer_type: "",
    name: window.localeMsg[window.localeLang].SOS,
    type: "911",
    className: 'sos',
    img: "/images/911.png"
  },
  { b_type: "777",
    layer_owner_id: "",
    layer_type: "",
    name: window.localeMsg[window.localeLang].IMPORTANT,
    type: "777",
    className: 'important',
    img: "/images/777.png"
  },
  { b_type: "69",
    layer_owner_id: "",
    layer_type: "",
    name: window.localeMsg[window.localeLang].EMOTICON_GOOD,
    type: "69",
    className: 'emo_good',
    img: "/images/69.png"
  },
  { b_type: "96",
    layer_owner_id: "",
    layer_type: "",
    name: window.localeMsg[window.localeLang].EMOTICON_BAD,
    type: "96",
    className: 'emo_bad',
    img: "/images/96.png"
  },
  { b_type: "1",
    layer_owner_id: "",
    layer_type: "",
    name: window.localeMsg[window.localeLang].VOTING,
    type: "1",
    className: 'voting',
    img: "/images/1.png"
  },
  { b_type: "2",
    layer_owner_id: "",
    layer_type: "",
    name: window.localeMsg[window.localeLang].PROGRAMM,
    type: "2",
    className: 'program',
    img: "/images/2.png"
  },
  { b_type: "3",
    layer_owner_id: "",
    layer_type: "",
    name: window.localeMsg[window.localeLang].PROJECT_PROPOSAL,
    type: "3",
    className: 'project_proposal',
    img: "/images/3.png"
  },
  { b_type: "4",
    layer_owner_id: "",
    layer_type: "",
    name: window.localeMsg[window.localeLang].PROJECT,
    type: "4",
    className: 'project',
    img: "/images/4.png"
  },
  { b_type: "330",
    layer_owner_id: "",
    layer_type: "",
    name: window.localeMsg[window.localeLang].PARTICIPATIVE_BUDGET,
    type: "330",
    className: 'p_budget',
    img: "/images/330.png"
  },
  { b_type: "5",
    layer_owner_id: "",
    layer_type: "",
    name: window.localeMsg[window.localeLang].REQUEST,
    type: "5",
    className: 'request',
    img: "/images/5.png"
  },
]

var btnsCopyDel = [
  {
    text: window.localeMsg[window.localeLang].COPY_TO_ME,
    className: 'copy',
    isAvailable: function(options){
      var isFull = options.full && options.full.length > 0
      var isOrg = +window.state.user.gov > 0 || +window.state.user.nco > 0
      return isFull && isOrg && !window.lib.isAuthor(options)
    }
  },
  {
    text: window.localeMsg[window.localeLang].REMOVE_BEACON,
    className: 'delete',
    isAvailable: function(options){
      return window.lib.isAuthor(options) && (options.b_status.join() === "0,0,0,0" || options.b_status.join() === "1,0,0,0")
    }
  }
]

window.state.statusList = {}
window.state.statusList.SOS = [
  {
    bStatusIndex: 0,
    icon: 'ui-icon-progress_empty',
    text: [
      window.localeMsg[window.localeLang].DELETED,
      window.localeMsg[window.localeLang].DRAFT,
      window.localeMsg[window.localeLang].NEW
    ],
    // btns: [
    //   {
    //     text: window.localeMsg[window.localeLang].TAKE_VERIFICATION,
    //     className: 'verify',
    //     chngTo: 1,
    //     isAvailable: function(options){
    //       return +window.state.user.id > 0 && !window.lib.isAuthor(options)
    //     }
    //   }
    // ],
  },
  {
    bStatusIndex: 1,
    icon: 'ui-icon-progress_one',
    text: [
      window.localeMsg[window.localeLang].DISPROVEN,
      window.localeMsg[window.localeLang].CONFIRMATION_EXPECTED,
      window.localeMsg[window.localeLang].CONFIRMED
    ],
    btns: [
      {
        text: window.localeMsg[window.localeLang].CONFIRM,
        className: 'confirm',
        chngTo: 1,
        isAvailable: function(options){
          return (+window.state.user.nco > 0 || +window.state.user.gov > 0 || +window.state.user.voting_status > 0) && !window.lib.isAuthor(options) && options.b_status[3] < 1
        }
      },
      {
        text: window.localeMsg[window.localeLang].DISPROVE,
        className: 'disprove',
        chngTo: -1,
        isAvailable: function(options){
          return (+window.state.user.nco > 0 || +window.state.user.gov > 0 || +window.state.user.voting_status > 0) && !window.lib.isAuthor(options) && options.b_status[3] < 1
        }
      }
    ]
  },
  {
    bStatusIndex: 2,
    icon: 'ui-icon-progress_two',
    text: [
      ' ',
      window.localeMsg[window.localeLang].WAITS_FOR_HELP,
      window.localeMsg[window.localeLang].HELP_PROPOSED
    ],
    btns: [
      {
        text: window.localeMsg[window.localeLang].PROPOSE_MY_HELP,
        className: 'lendhand',
        chngTo: 1,
        isAvailable: function(options){
          return +window.state.user.id > 0 && !window.lib.isAuthor(options)
        }
      }
    ]
  },
  {
    bStatusIndex: 3,
    icon: 'ui-icon-progress_full',
    text: [
      ' ',
      window.localeMsg[window.localeLang].EXPECTS_COMPLETION,
      window.localeMsg[window.localeLang].COMPLETED
    ],
    btns: [
      {
        text: window.localeMsg[window.localeLang].COMPLETE,
        className: 'complete',
        chngTo: 1,
        isAvailable: function(options, b_st){
          return (+window.state.user.nco > 0 || +window.state.user.gov > 0 || window.lib.isAuthor(options)) && b_st < 1
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
      window.localeMsg[window.localeLang].EXPECTS_START,
      window.localeMsg[window.localeLang].STARTED
    ],
    btns: [
      {
        text: window.localeMsg[window.localeLang].START,
        className: 'start',
        chngTo: 1,
        isAvailable: function(options, b_st){
          return !window.lib.isAuthor(options) && b_st < 1 
        }
      }
    ],
  },
  {
    bStatusIndex: 1,
    icon: 'ui-icon-progress_full',
    text: [
      '',
      window.localeMsg[window.localeLang].EXPECTS_COMPLETION,
      window.localeMsg[window.localeLang].COMPLETED
    ],
    btns: [
      {
        text: window.localeMsg[window.localeLang].COMPLETE,
        className: 'complete',
        chngTo: 1,
        isAvailable: function(options, b_st){
          return window.lib.isAuthor(options) && b_st < 1
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
      window.localeMsg[window.localeLang].AMOUNT_NOT_COLLECTED,
      window.localeMsg[window.localeLang].AMOUNT_COLLECTION,
      window.localeMsg[window.localeLang].AMOUNT_COLLECTED
    ]
  },
  {
    bStatusIndex: 1,
    icon: 'ui-icon-progress_one',
    text: [
      ' ',
      window.localeMsg[window.localeLang].DETERMINING_NCO_FOR_ADMINISTRATION,
      window.localeMsg[window.localeLang].NCO_FOR_ADMINISTRATION_DETERMINED
    ]
  },
  {
    bStatusIndex: 2,
    icon: 'ui-icon-progress_two',
    text: [
      ' ',
      window.localeMsg[window.localeLang].FUNDS_TRANFERRING_TO_NCO,
      window.localeMsg[window.localeLang].FUNDS_TRANFERRED_TO_NCO
    ],
    btns: [
      {
        text: window.localeMsg[window.localeLang].TRANFER_FUNDS_TO_NCO,
        className: 'transfer',
        chngTo: 1,
        isAvailable: function(){
          return +window.state.user.id == 4618
        }
      }
    ]
  },
  {
    bStatusIndex: 3,
    icon: 'ui-icon-progress_full',
    text: [
      ' ',
      window.localeMsg[window.localeLang].EXPECTS_COMPLETION,
      window.localeMsg[window.localeLang].COMPLETED
    ],
    btns: [
      {
        text: window.localeMsg[window.localeLang].COMPLETE,
        className: 'complete',
        chngTo: 1,
        isAvailable: function(options){
          return !!options.full && window.state.user.id === options.nco_id && options.nco_acceptance !== 0
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
    success: function (response) {
      if(response.error){
        alert(window.localeMsg[window.localeLang][response.error])
        return
      }
      window.state.sphereJSON = response
    },
    error: function(){
      console.log("https://gurtom.mobi/sph.php" + ' request has been failed')
      alert(window.localeMsg[window.localeLang].CONNECTION_ERROR)
    }
  })
}

function getListMenuOrg() {
  if(+window.state.user.gov > 0 || +window.state.user.nco > 0){
    $.ajax({
      url: "https://gurtom.mobi/beacon_list_layers.php",
      dataType: "json",
      crossDomain: true,
      success: function ( response ) {
        if(response.error){
          alert(window.localeMsg[window.localeLang][response.error])
          return
        }
        // if(response.length === 0){
        //   alert(window.localeMsg[window.localeLang].FAIL)
        //   return
        // }
        window.state.listMenuOrg = response
      },
      error: function(response){
        console.log("https://gurtom.mobi/beacon_list_layers.php" + ' request has been failed')
        alert(window.localeMsg[window.localeLang].CONNECTION_ERROR)
      }
    })
  } else {
    window.state.listMenuOrg = undefined
  }
}

function getIconURL(r, relative) {
	var iconMainURL = ( relative ? '/' : window.iconMainURL )
	if(r.b_type && +r.b_type < 1000) {
		return iconMainURL + "images/" + r.b_type +'.png' 
	} else if(r.b_type && r.layer_owner_id && r.layer_type && +r.b_type >= 1000 ){
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
  $('.warning h2').remove()
  $('.warning').hide()
}, 4000)

function updateLocaleFilesWithNewCommonMsg(){
  window.old_localeMsg = {}
  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", function() {
    window.commonMsg = JSON.parse( this.responseText )
    mergeCommonMsgWithLocaleMsg()
  });
  oReq.open("GET", "/static/js/lang/commonMsg.json");
  oReq.send();
  var oReq_en = new XMLHttpRequest();
  oReq_en.addEventListener("load", function() {
    window.old_localeMsg.en = JSON.parse( this.responseText )
    mergeCommonMsgWithLocaleMsg()
  });
  oReq_en.open("GET", "/static/js/lang/local_en.json");
  oReq_en.send();
  var oReq_uk = new XMLHttpRequest();
  oReq_uk.addEventListener("load", function() {
    window.old_localeMsg.uk = JSON.parse( this.responseText )
    mergeCommonMsgWithLocaleMsg()
  });
  oReq_uk.open("GET", "/static/js/lang/local_uk.json");
  oReq_uk.send();
  var oReq_ru = new XMLHttpRequest();
  oReq_ru.addEventListener("load", function() {
    window.old_localeMsg.ru = JSON.parse( this.responseText )
    mergeCommonMsgWithLocaleMsg()
  });
  oReq_ru.open("GET", "/static/js/lang/local_ru.json");
  oReq_ru.send();

  function mergeCommonMsgWithLocaleMsg(){
    if(!window.old_localeMsg.en || !window.old_localeMsg.uk || !window.old_localeMsg.ru || !window.commonMsg){
      return
    }
    window.normalisedCommonMsg = _.reduce(window.commonMsg, function( memo, val, key){
      if(val.msg) memo[key] = val.msg
      return memo
    }, {})
    console.log('commonMsg.msg.length=', Object.keys(window.normalisedCommonMsg).length)
    var langs = ['en', 'uk', 'ru']
    
    window.new_localeMsg = _.mapObject(langs, function(lang){
      var oldLocale =_.clone(window.old_localeMsg[lang][lang])
      var obj = {}
      obj[lang] = $.extend({}, window.normalisedCommonMsg, _.pick(oldLocale, Object.keys(window.normalisedCommonMsg)))
      console.log('local_'+ lang +'.json.length=', Object.keys(obj[lang]).length)
      var omitted = _.omit(oldLocale, Object.keys(window.normalisedCommonMsg))
      console.log('Omitted: ', Object.keys(omitted).length)
      console.log('Added: ', Object.keys(obj[lang]).length - Object.keys(oldLocale).length + Object.keys(omitted).length)
      download(obj, 'local_'+ lang +'.json');
      return obj
    })
    function download(text, name) {
      var a = document.createElement("a");
      var file = new Blob([JSON.stringify(text)], {type: 'application/json'});
      a.href = URL.createObjectURL(file);
      a.download = name;
      a.click();
    }
  }

}