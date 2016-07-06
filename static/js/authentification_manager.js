'use strict'

window.state.user = {}

if($.mobile && $.mobile.activePage && $.mobile.activePage.attr('id')){
  emailAccountActivation()
  leftPanelInit()
} else {
  $( document ).one( "pagecreate", function(){
    emailAccountActivation()
    leftPanelInit()
  }) 
}

function emailAccountActivation(){
  var i = undefined
  if((i = location.href.indexOf('/index.php?m=5&id=')) > -1){
    var promise = $.ajax({
      url: 'https://gurtom.mobi/l' + location.href.substring(i, location.href.length),
      type: "GET",
      dataType: "json",
      xhrFields: {
        withCredentials: true
      },
      crossDomain: true
    });
    promise.done(function( response ){
      console.log(response[0].msg)
      alert("Ваш профіль створено!\nУвійти можна через ліве меню -> Login.")
    })
    promise.fail(function( response ){
      console.log(response[0].error)
      alert("Ваш профіль не створено!")
    })
    promise.always(function(){
      location.href = 'https://gurtom.mobi/index.php'
    })
  }
}

$( "#login_dialog" ).one( "pagecreate", loginDialogInit)
$( "#registration_dialog" ).one( "pagecreate", registerDialogInit)
$( '#restore_pass_dialog' ).one( "pagecreate", restoreDialogInit)
$( '#reset_pass_dialog' ).one( "pagecreate", resetDialogInit)

function leftPanelInit(){
  checkLoggedIn()
  $('#left-panel.auth-panel .menu li.logout').click( logOut )
}

function loginDialogInit(){
  $('#login').submit(function (e) {
    e.preventDefault()
    var promise = loggingRequest($(this).serialize(), 0)
    promise.done(function ( response ) {
      if(response[0] && response[0].id && response[0].id > 0) {
        window.state.user = response[0]
        showUserInfo()
        $.mobile.navigate( "#beacons-map" )
      } else {
        alert("Введені облікові дані не дійсні.\nВведіть правильні Ім'я та Пароль.")
      }
    });
    promise.fail(function(response){
      alert("Введені облікові дані не дійсні.\nВведіть правильні Ім'я та Пароль.")
    });
  })
}

function logOut(){
  var data = {
    'logout': '1'
  }
  var promise = loggingRequest(data, 0)
  promise.done(function ( response ) {
    if(response[0] && response[0].id && response[0].id === '-10'){
      window.state.user = {
        user_first: 'Гість',
        login: 'Guest',
        avatar: '/images/avatar-bg.png'
      }
      showUserInfo()
    }
  });
  promise.fail(function(response){
    alert("Error: ", response[0].error_uk)
  });
}

function registerDialogInit(){
  $('#registration #login').before("<p class='tip'>Латиницею літери та цифри, 2-64 символи.</p>")
  $('#registration #email').before("<p class='tip'>Потрібен для завершення реєстрації.</p>")
  $('#registration #password').before("<p class='tip'>Не менше 6 символів.<br></p>")
  $('#registration #password-repeat').before("<p class='tip'>Не менше 6 символів.<br></p>")
  
  $('#registration').submit(function (e) {
    e.preventDefault()
    if(!$('#g-recaptcha-response').val()) {
      alert("Заповніть поле 'Я не робот'.")
      return
    }
    var promise = loggingRequest($(this).serialize(), 4)
    promise.done(function ( response ) {
      if(response[0] && response[0].msg) {
        alert(response[0].msg)
        $.mobile.navigate( "#beacons-map" )
      } else if(response[0] && response[0].error) {
        alert("Error: " + response[0].error)
      } else {
        window.resp = response
        console.log("window.resp: ", window.resp)
      }
    });
    promise.fail(function(response){
      alert("Error: " + response[0].error)
    });
    promise.always(grecaptcha.reset())
  })
}

function restoreDialogInit(){
  var $email = $('#restore_pass_dialog #email-rest'),
      $btnSubmit = $('#restore_pass_dialog .submit')
  
  $btnSubmit.click(requestRestore)
  $('#restore_pass_dialog').keyup(keyboardEnterEsc)
  function keyboardEnterEsc(e){
    if (e.keyCode===13) requestRestore()
    else if (e.keyCode===27) window.history.back()
  }

  function requestRestore() {
    var data = {
      email: $email.val(),
      request_password_reset: 'Reset my password'
    }
    var promise = loggingRequest(data, 3)
    promise.done(function(response){
      alert("Error: " + response[0].msg)
      $.mobile.navigate( "#beacons-map" )
    });
    promise.fail(function(response){
      var i = response.responseText.indexOf('<'),
          msg = ''
      if( i >= 0 ) {
        msg = response.responseText.substring(0, i)
        alert("Error: " + msg)
      } else {
        alert("Error: ", response[0].error_uk)
      }
    });
  }
}

function resetDialogInit(){
  var $pass1 = $('#reset_pass_dialog #password_reset'),
      $pass2 = $('#reset_pass_dialog #password_reset-repeat'),
      $btnSubmit = $('#reset_pass_dialog .submit')
  
  $btnSubmit.click(resetPass)
  $('#reset_pass_dialog').keyup(keyboardEnterEsc)
  function keyboardEnterEsc(e) {
    if (e.keyCode===13) resetPass()
    else if (e.keyCode===27) window.history.back()
  }

  function resetPass() {
    if($pass1.val() !== $pass2.val()) {
      alert('Паролі не співпадають.')
      return
    } else if ($pass1.val().length < 6) {
      alert('Пароль не може мати менше 6 символів.')
      return
    }
    var i = location.hash.indexOf('=')
    // if(i < 36) $.mobile.navigate( "#beacons-map" )
    var hash = location.hash.substring(i+1, location.hash.length),
    promise = $.ajax({
      type: "POST",
      url: "https://gurtom.mobi/user_pass_reset.php",
      dataType: "json",
      crossDomain: true,
      data: {
          pass: $pass1.val(),
          hash: hash
        }
    })
    promise.done(function(response){
      console.log("success")
      if(response[0] && response[0].msg_uk){
        alert("Message: "+ response[0].msg_uk)
      } else if(response[0] && response[0].error_uk){
        alert("Error: "+ response[0].error_uk)
      }
      $.mobile.navigate('#beacons-map')
    });
    promise.fail(function(response){
      console.log("error")
      alert("Error: "+ response[0].error_uk)
    });
    promise.always(function(){
      console.log(response[0])
    })
  }
}

function checkLoggedIn(){
  $.ajax({
    type: "GET",
    url: "https://gurtom.mobi/profile.php",
    dataType: "json",
    crossDomain: true,
    success: function ( response ) {
      if(response[0] && response[0].id && response[0].id > 0){
        window.state.user = response[0]
      } else {
        window.state.user = {
          user_first: 'Гість',
          login: 'Guest',
          avatar: '/images/avatar-bg.png'
        }
      }
      showUserInfo()
    },
    error: function(response){
      console.log('Error: ', response)
      alert('Status check error.')
    } 
  })
}

function showUserInfo(){
  var name = ''
  if(window.state.user.user_first && window.state.user.user_last){
    name = window.state.user.user_first + ' ' + window.state.user.user_last 
  } else if(window.state.user.user_first && !window.state.user.user_last){
    name = window.state.user.user_first 
  } else if(!window.state.user.user_first && window.state.user.user_last){
    name = window.state.user.user_last 
  } else if(!window.state.user.user_first && !window.state.user.user_last){
    name = window.state.user.login 
  }
  $('#header h1').text( name )
  $('#left-panel .username').text(window.state.user.login)
  $('#left-panel .email').text(window.state.user.email)
  $('#left-panel .avatar').css({'background-image': 'url(../..'+ window.state.user.avatar +')'})
  if(window.state.user.id){
    $('#left-panel.auth-panel .menu li.login').hide()
    $('#left-panel.auth-panel .menu li.logout').show()
    $('.menu .activities').removeClass('ui-state-disabled')
    $('.menu .profile').removeClass('ui-state-disabled')
    } else {
    $('#left-panel.auth-panel .menu li.login').show()
    $('#left-panel.auth-panel .menu li.logout').hide()
    $('.menu .activities').addClass('ui-state-disabled')
    $('.menu .profile').addClass('ui-state-disabled')
  }
}

function loggingRequest(data, m){
  return $.ajax({
    type: "POST",
    url: "https://gurtom.mobi/l/index.php?m=" + m,
    dataType: "json",
    crossDomain: true,
    data: data
  })
}

function removeAccount(){
  if (!window.state.user.id){
    console.log('You are not logged in.')
    return
  }
  $.ajax({
    type: "GET",
    url: "https://gurtom.mobi/user_rm.php?rm=1",
    dataType: "json",
    crossDomain: true
  })
  .then(function(response){
    checkLoggedIn()
    console.log(response)
    console.log(response[0].action)
  })
}










// $date_picker.change(function(){
//   var low = normalizeInput( $('#low_limit').val() )
//   var hight = normalizeInput( $('#hight_limit').val() )
//   if(low && hight){
//     window.state.start = formatTime(new Date(low + ' 00:00:00'))
//     window.state.finish = formatTime(new Date(hight + ' 23:59:59'))
//     window.state.sendGET(window.state.urlMarkers)
//   }
// })
