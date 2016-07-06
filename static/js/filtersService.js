var $filter_new_beacons = $('#new_beacons')
var $filter_confirmed_beacons = $('#confirmed_beacons')
var $filter_processing_beacons = $('#processing_beacons')
var $filter_closed_beacons = $('#closed_beacons')
$('#beacon_status').click(_.debounce(beaconStatusRead, 1000))
function beaconStatusRead(event){
  var result = ''
  if($filter_new_beacons.prop("checked")) result += "0"
  if($filter_confirmed_beacons.prop("checked")){
    if(result) result += ",1"
    else result += "1"
  }
  if($filter_processing_beacons.prop("checked")){
    if(result) result += ",2"
    else result += "2"
  }
  if($filter_closed_beacons.prop("checked")){
    if(result) result += ",3"
    else result += "3"
  }
  window.state.b_status = result
  window.state.sendGET(window.state.urlMarkers)
}

var $filter_e_mail = $('#e-mail')
var $filter_social_net = $('#social_net')
var $filter_co_owners = $('#co-owners')
var $filter_organisations = $('#organisations')
var $filter_payments = $('#payments')
var $filter_bank_id = $('#bank-id')
$('#user_rating').click(_.debounce(userRatingRead, 1000))
function userRatingRead(event){
  var result = ''
  if($filter_e_mail.prop("checked")) result += "0"
  if($filter_social_net.prop("checked")){
    if(result) result += ",1"
    else result += "1"
  }
  if($filter_co_owners.prop("checked")){
    if(result) result += ",7"
    else result += "7"
  }
  if($filter_organisations.prop("checked")){
    if(result) result += ",8"
    else result += "8"
  }
  if($filter_payments.prop("checked")){
    if(result) result += ",9"
    else result += "9"
  }
  if($filter_bank_id.prop("checked")){
    if(result) result += ",10"
    else result += "10"
  }
  window.state.user_auth = result
  window.state.sendGET(window.state.urlMarkers)
}

//  this section processes TWO last tabs in right panel navbar --- START
var $filter_votings = $('#votings')
var $filter_programms = $('#programms')
var $filter_project_proposals = $('#project_proposals')
var $filter_projects = $('#projects')
var $filter_requests = $('#requests')
$('#actions').click(_.debounce(actionsRead, 1000))
function actionsRead(event){
  if(event.target.nodeName === 'INPUT'){
    var result = ''
    if($filter_votings.prop("checked")) result += "1"
    if($filter_programms.prop("checked")){
      if(result) result += ",2"
      else result += "2"
    }
    if($filter_project_proposals.prop("checked")){
      if(result) result += ",3"
      else result += "3"
    }
    if($filter_projects.prop("checked")){
      if(result) result += ",4"
      else result += "4"
    }
    if($filter_requests.prop("checked")){
      if(result) result += ",5"
      else result += "5"
    }
    window.state.b_types = result + (result ? ',69,96,777,911,1000' : '')
    window.state.sendGET(window.state.urlMarkers)
  }
}
//  this section processes TWO last tabs in right panel navbar --- END

var $filter_date_picker = $('#time_range .date_picker')
$filter_date_picker.hide()
$("#time_range input:radio").change(function() {
  var date = new Date()
  var theMoment = formatTime(date)
  var dateFrom;
  if($(this).val() === 'custom') $filter_date_picker.show()
  else $filter_date_picker.hide()
  if($(this).val() === 'any'){
    setDatesForAJAX('', '')
  } else if($(this).val() === 'hour'){
    dateFrom = formatTime(new Date(Date.now() - 1000*60*60))
    setDatesForAJAX(dateFrom, theMoment)
  } else if($(this).val() === 'day'){
    dateFrom = formatTime(new Date(Date.now() - 1000*60*60*24))
    setDatesForAJAX(dateFrom, theMoment)
  } else if($(this).val() === 'week'){
    dateFrom = formatTime(new Date(Date.now() - 1000*60*60*24*7))
    setDatesForAJAX(dateFrom, theMoment)
  }
  function setDatesForAJAX(start, finish){
    window.state.start = start
    window.state.finish = finish
    window.state.sendGET(window.state.urlMarkers)
  }
})
$filter_date_picker.change(function(){
  var low = normalizeInput( $('#low_limit').val() )
  var hight = normalizeInput( $('#hight_limit').val() )
  if(low && hight){
    window.state.start = formatTime(new Date(low + ' 00:00:00'))
    window.state.finish = formatTime(new Date(hight + ' 23:59:59'))
    window.state.sendGET(window.state.urlMarkers)
  }
})
function normalizeInput(date) {
  var temp = []
  if(date.indexOf('.') !== -1) temp = date.split('.')
  else temp = date.split('-')
  if(temp[temp.length - 1].length > 2) date = temp.reverse().join('-')
  else date = temp.join('-')
  return date
}
function formatTime(date){
  var day = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)
  var time = ('0' + date.getHours()).slice(-2) +':'+ ('0' + date.getMinutes()).slice(-2) +':'+ ('0' + date.getSeconds()).slice(-2)
  return day +' '+ time
}

$(window).load(function(){
  window.$filter_mapSearch = $('#map_search')
  var s ='change keydown paste input'
  window.$filter_mapSearch.on('keydown keyup paste', _.debounce(mapSeachEventHandler, 1000))
  
  function mapSeachEventHandler(){
    var res = window.$filter_mapSearch.val()
    if(res.length){
      var first = res[0]
      if( +first > -1 && +first < 10 ){
        window.state.filter = res
        window.state.sendGET(window.state.urlMarkers)
      } else if(res[0] === '#'){
        res = _.filter(res, function(item){
          return item !== "#"
        }).join('')
        window.state.filter = res
        window.state.sendGET(window.state.urlMarkers)
      } else {
        console.log(first, 'string')
        //  Adress search is not written yet.
      }
    }
  }
})
