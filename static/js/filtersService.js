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

var $filter_all = $('#all')
var $filter_votings = $('#votings')
var $filter_programms = $('#programms')
var $filter_project_proposals = $('#project_proposals')
var $filter_projects = $('#projects')
var $filter_requests = $('#requests')
var $filter_positive = $('#positive')
var $filter_negative = $('#negative')
var $filter_budget = $('#budget')
var $filter_info = $('#info')
var $filter_sos = $('#sos')
var $filter_organizations = $('#organizations')
function actionsRead(event){
  if(event.target.nodeName === 'INPUT'){
    var result = ''
    if($filter_votings.prop("checked")) {
      result += "1"
    }
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
    if($filter_positive.prop("checked")){
      if(result) result += ",69"
      else result += "69"
    }
    if($filter_negative.prop("checked")){
      if(result) result += ",96"
      else result += "96"
    }
    if($filter_budget.prop("checked")){
      if(result) result += ",330"
      else result += "330"
    }
    if($filter_info.prop("checked")){
      if(result) result += ",777"
      else result += "777"
    }
    if($filter_sos.prop("checked")){
      if(result) result += ",911"
      else result += "911"
    }
    if($filter_organizations.prop("checked")){
      if(result) result += ",1000"
      else result += "1000"
    }
    window.state.b_types = result
    window.state.sendGET(window.state.urlMarkers)
  }
}
function setAllActions(e){
  var isChecked = $filter_all.prop("checked")
  $filter_votings.prop('checked', isChecked).flipswitch( "refresh" )
  $filter_programms.prop('checked', isChecked).flipswitch( "refresh" )
  $filter_project_proposals.prop('checked', isChecked).flipswitch( "refresh" )
  $filter_projects.prop('checked', isChecked).flipswitch( "refresh" )
  $filter_requests.prop('checked', isChecked).flipswitch( "refresh" )
  $filter_positive.prop('checked', isChecked).flipswitch( "refresh" )
  $filter_negative.prop('checked', isChecked).flipswitch( "refresh" )
  $filter_budget.prop('checked', isChecked).flipswitch( "refresh" )
  $filter_info.prop('checked', isChecked).flipswitch( "refresh" )
  $filter_sos.prop('checked', isChecked).flipswitch( "refresh" )
  $filter_organizations.prop('checked', isChecked).flipswitch( "refresh" )
}

//  this section processes TWO last tabs in right panel navbar --- END

var $filter_date_picker = $('#time_range .date_picker'),
    $timeFilterWrapper = $('#time_range')[0]
$filter_date_picker.hide()
$("#time_range input:radio").change(timeRangeChanged)
function timeRangeChanged(e) {
  var theMoment = formatTime(new Date()),
      dateFrom;
  switch (e.target.value) {
    case 'custom':
      $filter_date_picker.show()
      $timeFilterWrapper.scrollTop = $timeFilterWrapper.scrollHeight
      break;
    case 'any':
      dateFrom = ''
      break;
    case 'hour':
      dateFrom = formatTime(new Date(Date.now() - 1000*60*60))
      break;
    case 'day':
      dateFrom = formatTime(new Date(Date.now() - 1000*60*60*24))
      break;
    case 'week':
      dateFrom = formatTime(new Date(Date.now() - 1000*60*60*24*7))
      break;
    case 'month':
      dateFrom = formatTime(new Date(Date.now() - 1000*60*60*24*30))
      break;
    case 'hundred':
      dateFrom = formatTime(new Date(Date.now() - 1000*60*60*24*100))
      break;
    case 'year':
      dateFrom = formatTime(new Date(Date.now() - 1000*60*60*24*365))
      break;
  }
  if(e.target.value !== 'custom'){
    $filter_date_picker.hide()
    if(dateFrom) setDatesForAJAX(dateFrom, theMoment)
    else setDatesForAJAX('', '')
  }
  function setDatesForAJAX(start, finish){
    window.state.start = encodeURIComponent(start)
    window.state.finish = encodeURIComponent(finish)
    window.state.sendGET(window.state.urlMarkers)
  }
}
$filter_date_picker.change(datePickerChanged)
function datePickerChanged(){
  var low = normalizeInput( $('#low_limit').val() )
  var hight = normalizeInput( $('#hight_limit').val() )
  if(low && hight){
    window.state.start = encodeURIComponent(formatTime(new Date(low + ' 00:00:00')))
    window.state.finish = encodeURIComponent(formatTime(new Date(hight + ' 23:59:59')))
    window.state.sendGET(window.state.urlMarkers)
  }
}
function normalizeInput(date) {
  if(date.length < 10) return ""
  var temp = [],
      res
  if(date.indexOf('.') !== -1) temp = date.split('.')
  else if(date.indexOf('-') !== -1) temp = date.split('-')
  else if(date.indexOf('/') !== -1) temp = date.split('/')
  else alert( 'Будь-ласка, у полі "Дата" між днями, місяцем та роком '
    + 'використовуте такі розділювачі, як: "." або "-" або "/".' )
  if(temp[temp.length - 1].length > 2) res = temp.reverse().join('-')
  else res = temp.join('-')
  return res
}
function formatTime(date){
  var day = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)
  var time = ('0' + date.getHours()).slice(-2) +':'+ ('0' + date.getMinutes()).slice(-2) +':'+ ('0' + date.getSeconds()).slice(-2)
  return day +' '+ time
}
function getTodayWithZeroTime(){
  var date = new Date()
  var day = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)
  return new Date(normalizeInput(day))
}
function getAge(dateString) {     //    http://stackoverflow.com/questions/4060004/calculate-age-in-javascript
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}
function reverseDateFormat(dateStr) {
  return dateStr.split('-').reverse().join('.')
}
$(window).load(function(){
  window.$filter_mapSearch = $('#map_search')
  window.$filter_mapSearch.on('change keydown keyup paste', _.debounce(mapSeachEventHandler, 1000))
  $(document).on('click', 'input', function(e){
    e.stopPropagation()
  })
  $(window).click(function(){
    if(document.activeElement.tagName.toLowerCase() === 'input'){
      document.activeElement.blur()
    }
  })
  $('#actions input').change(_.debounce(actionsRead, 1000))
  $filter_all.change(setAllActions)
  getListOrgs()
  $filter_4__anchor = $('.categories')
  $filter_4__anchor.on('click', window.showFourthFilter )
})

function mapSeachEventHandler(){
  var res = window.$filter_mapSearch.val()
  if (res === ""){
    window.state.filter = ""
    window.state.sendGET(window.state.urlMarkers)
  } else {
    var first = res[0]
    if( +first >= 0 && +first <= 9 ){
      res = _.filter(res, function(item){
        return item !== "#"
      }).join('')
      window.state.filter = encodeURIComponent(res)
      window.state.sendGET(window.state.urlMarkers)
    } else if(first === '#'){
      res = _.filter(res, function(item){
        return item !== "#"
      }).join('')
      window.state.filter = encodeURIComponent(res)
      window.state.sendGET(window.state.urlMarkers)
    } else {
      console.log(first, 'string')
      //  Adress search is not written yet.
    }
  }
}

function getListOrgs() {
  return $.ajax({
    url: "https://gurtom.mobi/filter_layers.php",
    dataType: "json",
    crossDomain: true,
    success: function ( response ) {
      if(response.length === 0){
        console.log('listOrgs is empty')
      } else if(response.length>1){
        window.state.listOrgs = response
      } else {
        console.log( 'listOrgs is not received, error:'+ response[0].error )
      }
    },
    error: function(){
      console.log('listOrgs request error')
    }
  })
}

function filterViewUpdateFromDataURL (al, bs, bt, qw, st, ft) {
  $('#beacon_status').off()
  $('#user_rating').off()
  $('#actions input').off()
  $filter_date_picker.off()
  window.$filter_mapSearch.off('change keydown keyup paste')

  var arr = al.split(',')
  if(_.indexOf(arr, '0' ) === -1 ) $filter_e_mail.prop('checked', false).flipswitch( "refresh" )
  if(_.indexOf(arr, '1' ) === -1 ) $filter_social_net.prop('checked', false).flipswitch( "refresh" )
  if(_.indexOf(arr, '7' ) === -1 ) $filter_co_owners.prop('checked', false).flipswitch( "refresh" )
  if(_.indexOf(arr, '8' ) === -1 ) $filter_organisations.prop('checked', false).flipswitch( "refresh" )
  if(_.indexOf(arr, '9' ) === -1 ) $filter_payments.prop('checked', false).flipswitch( "refresh" )
  if(_.indexOf(arr, '10') === -1 ) $filter_bank_id.prop('checked', false).flipswitch( "refresh" )
  arr = bs.split(',')
  if(_.indexOf(arr, '0' ) === -1 ) $filter_new_beacons.prop('checked', false).flipswitch( "refresh" )
  if(_.indexOf(arr, '1' ) === -1 ) $filter_confirmed_beacons.prop('checked', false).flipswitch( "refresh" )
  if(_.indexOf(arr, '2' ) === -1 ) $filter_processing_beacons.prop('checked', false).flipswitch( "refresh" )
  if(_.indexOf(arr, '3' ) === -1 ) $filter_closed_beacons.prop('checked', false).flipswitch( "refresh" )
  arr = bt.split(',')
  if(_.indexOf(arr, '1' ) === -1 ) $filter_votings.prop('checked', false).flipswitch( "refresh" )
  if(_.indexOf(arr, '2' ) === -1 ) $filter_programms.prop('checked', false).flipswitch( "refresh" )
  if(_.indexOf(arr, '3' ) === -1 ) $filter_project_proposals.prop('checked', false).flipswitch( "refresh" )
  if(_.indexOf(arr, '4' ) === -1 ) $filter_projects.prop('checked', false).flipswitch( "refresh" )
  if(_.indexOf(arr, '5' ) === -1 ) $filter_requests.prop('checked', false).flipswitch( "refresh" )
  if(_.indexOf(arr, '69') === -1 ) $filter_positive.prop('checked', false).flipswitch( "refresh" )
  if(_.indexOf(arr, '96') === -1 ) $filter_negative.prop('checked', false).flipswitch( "refresh" )
  if(_.indexOf(arr, '330') === -1 ) $filter_budget.prop('checked', false).flipswitch( "refresh" )
  if(_.indexOf(arr, '777') === -1 ) $filter_info.prop('checked', false).flipswitch( "refresh" )
  if(_.indexOf(arr, '911') === -1 ) $filter_sos.prop('checked', false).flipswitch( "refresh" )
  if(_.indexOf(arr, '1000') === -1 ) $filter_organizations.prop('checked', false).flipswitch( "refresh" )
  if(qw !== '.') window.$filter_mapSearch.val( decodeURIComponent(qw) )
  if(st!=='.' && ft!=='.') {
    var $customRangeRadioBtn = $('#custom_range'),
        $timeTabBtn = $(".time_range")
    $customRangeRadioBtn.click()
    st = decodeURIComponent(st).split(' ')[0]
    $('#low_limit').val(st)
    ft = decodeURIComponent(ft).split(' ')[0]
    $('#hight_limit').val(ft)
    $timeTabBtn.one('click', function(){
      $customRangeRadioBtn.click()
    })
  }

  $('#beacon_status').click(_.debounce(beaconStatusRead, 1000))
  $('#user_rating').click(_.debounce(userRatingRead, 1000))
  $('#actions input').change(_.debounce(actionsRead, 1000))
  $filter_all.change(setAllActions)
  $filter_date_picker.change(datePickerChanged)
  window.$filter_mapSearch.on('change keydown keyup paste', _.debounce(mapSeachEventHandler, 1000))

}