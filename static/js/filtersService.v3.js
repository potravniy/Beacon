var $filter_new_beacons = $('#new_beacons')
var $filter_confirmed_beacons = $('#confirmed_beacons')
var $filter_processing_beacons = $('#processing_beacons')
var $filter_closed_beacons = $('#closed_beacons')
$('#beacon_status').click(_.debounce(beaconStatusRead, 1000))
function beaconStatusRead(event){
  var result = []
  if($filter_new_beacons.prop("checked")) result.push("0")
  if($filter_confirmed_beacons.prop("checked")) result.push("1")
  if($filter_processing_beacons.prop("checked")) result.push("2")
  if($filter_closed_beacons.prop("checked")) result.push("3")
  window.state.b_status = result.join(',')
  window.state.sendGET(window.state.urlMarkers)
}

var $filter_all = $('#all')
var $filter_e_mail = $('#e-mail')
var $filter_social_net = $('#social_net')
var $filter_co_owners = $('#co-owners')
var $filter_organisations = $('#organisations')
var $filter_payments = $('#payments')
var $filter_bank_id = $('#bank-id')
$('#user_rating').click(_.debounce(userRatingRead, 1000))
function userRatingRead(event){
  var result = []
  if($filter_e_mail.prop("checked")) result.push("0")
  if($filter_social_net.prop("checked")) result.push("1")
  if($filter_co_owners.prop("checked")) result.push("7")
  if($filter_organisations.prop("checked")) result.push("8")
  if($filter_payments.prop("checked")) result.push("9")
  if($filter_bank_id.prop("checked")) result.push("10")
  window.state.user_auth = result.join(',')
  window.state.sendGET(window.state.urlMarkers)
}
function setAllActions(e){
  var isChecked = $filter_all.prop("checked")
  $filter_e_mail.prop('checked', isChecked).flipswitch( "refresh" )
  $filter_social_net.prop('checked', isChecked).flipswitch( "refresh" )
  $filter_co_owners.prop('checked', isChecked).flipswitch( "refresh" )
  $filter_organisations.prop('checked', isChecked).flipswitch( "refresh" )
  $filter_payments.prop('checked', isChecked).flipswitch( "refresh" )
  $filter_bank_id.prop('checked', isChecked).flipswitch( "refresh" )
}


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

function actionsRead(event){
  if(event.target.nodeName === 'INPUT'){
    var result = []
    if($filter_votings.prop("checked")) result.push('1')
    if($filter_programms.prop("checked")) result.push('2')
    if($filter_project_proposals.prop("checked")) result.push('3')
    if($filter_projects.prop("checked")) result.push('4')
    if($filter_requests.prop("checked")) result.push('5')
    if($filter_positive.prop("checked")) result.push('69')
    if($filter_negative.prop("checked")) result.push('96')
    if($filter_budget.prop("checked")) result.push('330')
    if($filter_info.prop("checked")) result.push('777')
    if($filter_sos.prop("checked")) result.push('911')
    window.state.b_types = result.join(',')
    window.state.sendGET(window.state.urlMarkers)
  }
}





var $filter_date_picker = $('#time_range .date_picker'),
    $timeFilterWrapper = $('#time_range')[0]

$filter_date_picker.hide()
$("#time_range input:radio").change(function(e){
  window.timeRangeChanged(e)
  e.target.getAttribute('id') === "custom_range"
    ? window.datePickerChanged()
    : window.state.sendGET(window.state.urlMarkers)
})
$("#time_range input:radio").one('init', function(e){
  window.timeRangeChanged(e)
})
function timeRangeChanged(e) {
  var theMoment = formatTime(new Date()),
      dateFrom;
  switch (e.target.value) {
    case 'custom':
      if(!window.$datepickers) window.setDatePickers()
      $filter_date_picker.show()
      $timeFilterWrapper.scrollTop = $timeFilterWrapper.scrollHeight
      break;
    case 'any':
      dateFrom = ''
      break;
    case 'year':
      dateFrom = formatTime(new Date(Date.now() - 1000*60*60*24*365))
      break;
    case 'hundred':
      dateFrom = formatTime(new Date(Date.now() - 1000*60*60*24*100))
      break;
    case 'month':
      dateFrom = formatTime(new Date(Date.now() - 1000*60*60*24*30))
      break;
    case 'week':
      dateFrom = formatTime(new Date(Date.now() - 1000*60*60*24*7))
      break;
    case 'day':
      dateFrom = formatTime(new Date(Date.now() - 1000*60*60*24))
      break;
    // case 'hour':
    //   dateFrom = formatTime(new Date(Date.now() - 1000*60*60))
    //   break;
  }
  if(e.target.value !== 'custom'){
    $filter_date_picker.hide()
    if(dateFrom) setDatesForAJAX(dateFrom, theMoment)
    else setDatesForAJAX('', '')
  }
  function setDatesForAJAX(start, finish){
    window.state.start = encodeURIComponent(start)
    window.state.finish = encodeURIComponent(finish)
  }
}
function setDatePickers(){
  console.log('setDatePickers')
  window.$datepickers = $('#time_range .date_picker input').pikaday({
    firstDay: 1,
    showDaysInNextAndPreviousMonths: true,
    i18n: window.localeMsg[window.localeLang].PIKADAY_I18N,
    maxDate: new Date(),
    minDate: new Date("March 8, 2016 15:15:15"),
    onSelect: function(date){
      var year = date.getFullYear()
          ,month = date.getMonth() + 1
          ,day = date.getDate()
          ,formattedDate = [
            year
            ,month < 10 ? '0' + month : month
            ,day < 10 ? '0' + day : day
            ].join('-')
      switch (this._o.field.attributes.id.value) {
        case "low_limit":
          pikadayHigh.config({minDate: this.getDate()})
          formattedDate += ' 00:00:00'
          break;
        case "high_limit":
          pikadayLow.config({maxDate: this.getDate()})
          formattedDate += ' 23:59:59'
          break;
      }
      this._o.field.value = formattedDate
      datePickerChanged()
    }
  })
  window.pikadayLow = $datepickers.filter('#low_limit').data('pikaday')
  window.pikadayHigh = $datepickers.filter('#high_limit').data('pikaday')
}
function datePickerChanged(){
  var low = $('#low_limit').val()
  var high = $('#high_limit').val()
  if(low && high){
    window.state.start = encodeURIComponent(low)
    window.state.finish = encodeURIComponent(high)
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
  else alert(window.localeMsg[window.localeLang].USE_FOLLOWING_SEPARATORS)
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
  $('.searsh-buttons-wrapper .hash-search').on(
    'click',
    _.debounce(showSearch_Hash, 100)
  )
  $('.searsh-buttons-wrapper .id-search').on(
    'click',
    _.debounce(showSearch_ID, 100)
  )
  $('.searsh-buttons-wrapper .google-search').on(
    'click',
    _.debounce(showSearch_Google, 100)
  )
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
//  initializes radioButton selected from timeRange 
//  available options are:
//    '#any'
//    '#last_year' 
//    '#last_hundred' (days)
//    '#last_month'
//    '#last_week'
//    '#last_day'
  $('#any').prop('checked', true).checkboxradio('refresh').trigger('init')
})

window.state.oReq.addEventListener('load', getListOrgs)

function getListOrgs() {
  window.state.oReq.removeEventListener('load', getListOrgs)
  setTimeout(function(){
    $.ajax({
      url: "https://gurtom.mobi/filter_layers.php",
      dataType: "json",
      crossDomain: true,
    })
      .done(function(response) {
        if(response.error){
          alert(window.localeMsg[window.localeLang][response.error])
          return
        }
        if(response.length === 0){
          alert(window.localeMsg[window.localeLang].FAIL)
        } else {
          window.state.listOrgs = response
          window.showFourthFilter()
          window.Manager.trigger('state_update')
        }
      })
      .fail(function(){
        console.log("https://gurtom.mobi/filter_layers.php" + ' request has been failed')
        alert(window.localeMsg[window.localeLang].CONNECTION_ERROR)
      })
    
    // $.ajax({
    //   url: "https://gurtom.mobi/nco.php",
    //   dataType: "json",
    //   crossDomain: true,
    //   success: function ( response ) {
    //     if(response.error){
    //       alert(window.localeMsg[window.localeLang][response.error])
    //       return
    //     }
    //     window.state.listNCO = response
    //   },
    //   error: function(){
    //     alert(window.localeMsg[window.localeLang].CONNECTION_ERROR)
    //   }
    // })
  }, 1000)
}


function filterViewUpdateFromDataURL (al, bs, bt, qw, st, ft, ocp, oc, op, lcp, lc, lp) {
  $('#beacon_status').off()
  $('#user_rating').off()
  $('#actions input').off()
  $filter_all.off()

  var arr = al.split(',')
  $filter_e_mail.prop('checked', _.indexOf(arr, '0' ) > -1).flipswitch( "refresh" )
  $filter_social_net.prop('checked', _.indexOf(arr, '1' ) > -1).flipswitch( "refresh" )
  $filter_co_owners.prop('checked', _.indexOf(arr, '7' ) > -1).flipswitch( "refresh" )
  $filter_organisations.prop('checked', _.indexOf(arr, '8' ) > -1).flipswitch( "refresh" )
  $filter_payments.prop('checked', _.indexOf(arr, '9' ) > -1).flipswitch( "refresh" )
  $filter_bank_id.prop('checked', _.indexOf(arr, '10' ) > -1).flipswitch( "refresh" )
  $filter_all.prop('checked', arr.length > 3).flipswitch( "refresh" )
  arr = bs.split(',')
  $filter_new_beacons.prop('checked', _.indexOf(arr, '0' ) > -1).flipswitch( "refresh" )
  $filter_confirmed_beacons.prop('checked', _.indexOf(arr, '1' ) > -1).flipswitch( "refresh" )
  $filter_processing_beacons.prop('checked', _.indexOf(arr, '2' ) > -1).flipswitch( "refresh" )
  $filter_closed_beacons.prop('checked', _.indexOf(arr, '3' ) > -1).flipswitch( "refresh" )
  arr = bt.split(',')
  $filter_votings.prop('checked', _.indexOf(arr, '1' ) > -1).flipswitch( "refresh" )
  $filter_programms.prop('checked', _.indexOf(arr, '2' ) > -1).flipswitch( "refresh" )
  $filter_project_proposals.prop('checked', _.indexOf(arr, '3' ) > -1).flipswitch( "refresh" )
  $filter_projects.prop('checked', _.indexOf(arr, '4' ) > -1).flipswitch( "refresh" )
  $filter_requests.prop('checked', _.indexOf(arr, '5' ) > -1).flipswitch( "refresh" )
  $filter_positive.prop('checked', _.indexOf(arr, '69' ) > -1).flipswitch( "refresh" )
  $filter_negative.prop('checked', _.indexOf(arr, '96' ) > -1).flipswitch( "refresh" )
  $filter_budget.prop('checked', _.indexOf(arr, '330' ) > -1).flipswitch( "refresh" )
  $filter_info.prop('checked', _.indexOf(arr, '777' ) > -1).flipswitch( "refresh" )
  $filter_sos.prop('checked', _.indexOf(arr, '911' ) > -1).flipswitch( "refresh" )
  // if(_.indexOf(arr, '1000') === -1 ) $filter_organizations.prop('checked', false).flipswitch( "refresh" )
  if(qw !== '-'){
    qw = decodeURIComponent(qw)
    if(isNaN(qw[0])){
      window.showSearch_Hash({value: qw})
    } else {
      window.showSearch_ID({value: qw})
    }
  }

  if( st==='-' && ft==='-' ) {
    $('#any').prop( "checked", true )
    $filter_date_picker.hide()
  } else {
    if(!window.$datepickers) window.setDatePickers()
    $filter_date_picker.show()
    st = decodeURIComponent(decodeURIComponent(st))
    $('#low_limit').val(st)
    ft = decodeURIComponent(decodeURIComponent(ft))
    $('#high_limit').val(ft)
    $('#custom_range').prop( "checked", true )
  }
  $('.ui-radio input').checkboxradio( "refresh" )

  if ( window.fourthFilterView && !window.fourthFilterView.isDestroyed ) {
    window.fourthFilterView.destroy()
  }
  window.trans4thFilterRouteToState( [ocp, oc, op, lcp, lc, lp] )
  if ( window.state.listOrgs ) window.showFourthFilter()

  $('#beacon_status').click(_.debounce(beaconStatusRead, 1000))
  $('#user_rating').click(_.debounce(userRatingRead, 1000))
  $('#actions input').change(_.debounce(actionsRead, 1000))
  $filter_all.change(setAllActions)
}