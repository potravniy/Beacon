<!doctype html>
<html lang="en">
  <head>
    <!--<base href="https://gurtom.mobi/">-->
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="description" content="Beacon page of gurtom.mobi mobile web apps">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    <title>Маячок</title>

    <!-- Add to homescreen for Chrome on Android -->
    <meta name="mobile-web-app-capable" content="yes">
    <link rel="icon" sizes="192x192" href="./static/img/android-desktop.png">

    <!-- Add to homescreen for Safari on iOS -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="apple-mobile-web-app-title" content="Beacon">
    <link rel="apple-touch-icon-precomposed" href="./static/img/android-desktop.png">

    <!-- Tile icon for Win8 (144x144 + tile color) -->
    <meta name="msapplication-TileImage" content="./static/img/ms-touch-icon-144x144.png">
    <meta name="msapplication-TileColor" content="#3372DF">

    <link rel="shortcut icon" href="./static/img/favicon.ico">

    <!--<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">-->
    
    <script src="https://cdn.polyfill.io/v2/polyfill.min.js?features=Intl.~locale.en,Intl.~locale.ru,Intl.~locale.uk"></script>
    <script src="./static/js/vendor/intl-messageformat.min.js"></script>
    <script src="./static/js/vendor/locale-data/en.js"></script> <!-- from https://github.com/yahoo/intl-messageformat/tree/master/dist/locale-data -->
    <script src="./static/js/vendor/locale-data/uk.js"></script>
    <script src="./static/js/vendor/locale-data/ru.js"></script>
    <script>
      (function(){
        // var oReq = new XMLHttpRequest();
        // oReq.addEventListener("load", function() {
        //   window.commonMsg = JSON.parse( this.responseText )
        // });
        // oReq.open("GET", "./static/js/lang/commonMsg.json");
        // oReq.send();
        var source = null
        if( Array.isArray(navigator.languages) && navigator.languages.length > 0 ) source = navigator.languages
        else if( navigator.language ) source = navigator.language
        else if( navigator.browserLanguage ) source = navigator.browserLanguage
        var msg = new IntlMessageFormat('', source)
        window.localeLang = msg.resolvedOptions().locale
        var src = "./static/js/lang/local_en.json"
        if ( window.localeLang === 'uk' ) src = "./static/js/lang/local_uk.json"
        if ( window.localeLang === 'ru' ) src = "./static/js/lang/local_ru.json"
        var oReq = new XMLHttpRequest();
        oReq.addEventListener("load", function() {
          window.localeMsg = JSON.parse( this.responseText )
        });
        oReq.open("GET", src, false);
        oReq.send();

        var reg = null, lang
        if ( Array.isArray(source) ) source = source[0]
        if ( source.length > 4 && source.indexOf('-') > -1 ) {
          lang = source.split('-')[0]
          reg = source.split('-')[1]
        } else {
          lang = source.substr(0, 2)
        }
        var goog = document.createElement("script")
        goog.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyD9GrBwQ_NFlEMzjrAkE4KzsZcTsqf0_h8&language="
        + lang + "&region=" + reg + "&libraries=places"
        document.head.appendChild(goog)
      })()
    </script>

    <style>
      h1 {display: none;}
      a {display: none;}
      .page {display: none;}
    </style>
    <link rel="stylesheet" href="./static/css/vendor/jquery.mobile-1.4.5_modified.css">
    <link rel="stylesheet" href="./static/css/beacon.css">

  </head>
  <body>
    <div id="beacons-map" data-role="page" data-fullscreen="true" class="ui-overlay-shadow ui-responsive-panel" data-theme="a" data-title="Маячок">

      <div id="header" data-role="header" data-position="fixed" data-tap-toggle="false" data-update-page-padding="false" data-fullscreen="true">
        <a class="ui-btn ui-btn-left ui-btn-inline ui-icon-menu ui-btn-icon-notext ui-nodisc-icon" href="#left-panel">Menu</a>
        <h1>Гість</h1>
        <a class="ui-btn ui-btn-right ui-btn-inline ui-icon-more_vert ui-btn-icon-notext ui-nodisc-icon" href="#right-panel">Options</a>
      </div>
      <div id="container" data-role="main" class="ui-panel-wrapper">
        <div id="beacons-map__the-map">

          <div id="the-map"></div>
          <div class="ui-input-search searsh-buttons-wrapper ">
            <a href="#" class="searsh-buttons hash-search ui-btn ui-btn-inline">#</a>
            <a href="#" class="searsh-buttons id-search ui-btn ui-btn-inline">id</a>
            <a href="#" class="searsh-buttons google-search ui-btn ui-btn-inline ui-icon-flag ui-btn-icon-notext">address</a>
          </div>
          <div id="map_search_container"></div>

          <div class="ui-nodisc-icon buttons-wrapper upper-right unused">
            <a href="#" class="ui-btn ui-corner-all ui-icon-nearby ui-btn-icon-notext ui-btn-inline">nearby</a><br>
            <a href="#" class="ui-btn ui-corner-all ui-icon-my_location ui-btn-icon-notext ui-btn-inline">location</a><br>
            <a href="#favorite__list" data-rel="popup" data-transition="slideup" data-position-to="#beacons-map__the-map" class="ui-btn ui-corner-all ui-icon-star-empty ui-btn-icon-notext ui-btn-inline favorite-button">favorite</a>
          </div>
          <div class="ui-nodisc-icon buttons-wrapper lower-left">
            <a id="create_btn" href="#" data-rel="popup" data-transition="turn" data-position-to="origin" class="ui-btn ui-corner-all ui-icon-add ui-btn-icon-notext ui-btn-inline">add</a><br>
            <a href="#" class="unused ui-btn ui-corner-all ui-icon-share ui-btn-icon-notext ui-btn-inline">share</a>
          </div>
        </div> <!-- /beacons-map__the-map -->
        
        <div id="beacons-map__the-beacons">
          <!--<p>Place for Beacon Cards or Beacon Create.</p>-->
        </div>    <!-- /beacons-map__the-beacons -->
        
        
        <div data-role="popup" id="favorite__list" data-theme="a" data-overlay-theme="b">
          <div data-role="header" data-position="fixed" data-update-page-padding="false" data-fullscreen="true"> <!-- data-fullscreen="true" prevents padding-top incorrect change in row 12588 of jQM -->
            <h1>Обрані маячки</h1>
            <a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-close ui-btn-icon-notext ui-btn-right ui-nodisc-icon">Close</a>
          </div>
          <div data-role="main">
            <ul data-role="listview" class="listview">
              <li class="ui-li-has-alt">
                <a href="#" class="ui-icon-unattended_burning_garbage ui-btn ui-btn-icon-left ui-nodisc-icon">Пожежа</a>
                <a href="#" data-icon="delete" class="ui-btn ui-btn-icon-notext ui-icon-delete">Remove</a>
              </li>
              <li class="ui-li-has-alt">
                <a href="#" class="ui-icon-acarus ui-btn ui-btn-icon-left ui-nodisc-icon">Тарантули</a>
                <a href="#" data-icon="delete" class="ui-btn ui-btn-icon-notext ui-icon-delete">Remove</a>
              </li>
              <li class="ui-li-has-alt">
                <a href="#" class="ui-icon-transp_bicycle ui-btn ui-btn-icon-left ui-nodisc-icon">Велодоріжки</a>
                <a href="#" data-icon="delete" class="ui-btn ui-btn-icon-notext ui-icon-delete">Remove</a>
              </li>
              <li class="ui-li-has-alt">
                <a href="#" class="ui-icon-training_interaction_services ui-btn ui-btn-icon-left ui-nodisc-icon">Семінар з підприємництва</a>
                <a href="#" data-icon="delete" class="ui-btn ui-btn-icon-notext ui-icon-delete">Remove</a>
              </li>
              <li class="ui-li-has-alt">
                <a href="#" class="ui-icon-stuck_in_elevator ui-btn ui-btn-icon-left ui-nodisc-icon">Застрягли в ліфті</a>
                <a href="#" data-icon="delete" class="ui-btn ui-btn-icon-notext ui-icon-delete">Remove</a>
              </li>
              <li class="ui-li-has-alt">
                <a href="#" class="ui-icon-rescue_post ui-btn ui-btn-icon-left ui-nodisc-icon">Пункт обігріву</a>
                <a href="#" data-icon="delete" class="ui-btn ui-btn-icon-notext ui-icon-delete">Remove</a>
              </li>
              <li class="ui-li-has-alt">
                <a href="#" class="ui-icon-plague_fish ui-btn ui-btn-icon-left ui-nodisc-icon">Масовий мор риби</a>
                <a href="#" data-icon="delete" class="ui-btn ui-btn-icon-notext ui-icon-delete">Remove</a>
              </li>
            </ul>
          </div>
        </div>
        <div data-role="popup" id="popupPhoto" class="photopopup" data-overlay-theme="b" data-corners="false" data-tolerance="30,15">
          <a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-close ui-btn-icon-notext ui-btn-right">Close</a>
          <img class="photopopup__img" src="" alt="Photo">
          <a href="#" class="abuse ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-info_outline ui-btn-icon-notext ui-btn-right">Abuse</a>
        </div>
        <div id="right_popup__region"></div>
        <div data-role="popup" id="create_beacon__geo_region"></div>

      </div>    <!-- /container -->
      
      <div id="footer" data-role="footer" data-position="fixed" data-update-page-padding="false" data-fullscreen="true" data-tap-toggle="false"> 
        <div data-role="navbar">
          <ul>
            <li><a href="#" id="btn__the-map" class="ui-btn-active">Карта</a></li>
            <li><a href="#" id="btn__the-beacons" class="">Маячки</a></li>
          </ul>
        </div>
      </div>    <!-- /footer -->

      <div data-role="panel" id="left-panel" data-position="left" data-display="overlay" class="auth-panel" >
        <div class="panel-head">
          <div class="user-info">
            <div id = "menu_avatar" class="avatar"></div>
            <div class="username">Guest</div>
            <div class="email"></div>
          </div>
        </div>
        <ul class="menu">
          <li>
            <a class="main-menu ui-link" data-ajax="false" data-link = "menu-page" href="./main.html#menu-page">Main Menu</a>
          </li>
          <li>
            <a class="activities menu-icon-activities ui-link" data-ajax="false" data-link = "menu-page" href="./main.html#my-activities-page">My Activities</a>
          </li>
          <li>
            <a class="menu-icon-tasks ui-link" data-ajax="false" data-link = "menu-page" href="./main.html#my-tasks-page">My Tasks</a>
          </li>
          <li>
            <a class="profile menu-icon-profile" data-ajax="false" href="#">My Profile</a>
          </li>
          <li class="sep">
            &nbsp;
          </li>
          <li>
            <a class="menu-icon-help ui-link" data-ajax="false" data-link = "menu-page" href="./main.html#help">Help</a>
          </li>
          <li class="login">
            <a class="menu-icon-login ui-link" data-ajax="false" data-link = "menu-page" href="#">Login</a>
          </li>
          <li id='logout' class="logout">
            <a class="menu-icon-logout ui-link" data-ajax="false" data-link = "menu-page" data-prefetch="true" href="#">Logout</a>
          </li>
        </ul>
      </div>   <!-- /left-panel -->

      <div data-role="panel" id="right-panel" data-display="push" data-position="right" class="panel">
        <div data-role="tabs">
          <div data-role="navbar" class="navbar">
            <ul>
              <li><a href="#user_rating" data-ajax="false" data-icon="person" class="user_rating ui-btn-icon-notext ui-nodisc-icon ui-bar-inherit ui-bar ui-bar-a ui-btn-active ui-state-persist">User rating</a></li>
              <li><a href="#categories" data-ajax="false" data-icon="filter" class="categories ui-btn-icon-notext ui-nodisc-icon ui-bar-inherit ui-bar ui-bar-a">Categories</a></li>
              <li><a href="#time_range" data-ajax="false" data-icon="schedule" class="time_range ui-btn-icon-notext ui-nodisc-icon ui-bar-inherit ui-bar ui-bar-a">Time range</a></li>
              <li><a href="#beacon_status" data-ajax="false" data-icon="progress_two" class="beacon_status ui-btn-icon-notext ui-nodisc-icon ui-bar-inherit ui-bar ui-bar-a">Beacon status</a></li>
              <li><a href="#actions" data-ajax="false" data-icon="assignment_turned_in" class="actions ui-btn-icon-notext ui-nodisc-icon ui-bar-inherit ui-bar ui-bar-a">Actions</a></li>
            </ul>
          </div>
          <div id="user_rating" class="scrollable_content">
            <h4 class="filter_title">Показати маячки від громадян, авторизованих:</h4>
            <ul data-role="listview" class="listview">
              <li>
                <input type="checkbox" data-role="flipswitch" name="all" id="all" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch" checked>
                <label for="all">Всі</label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="e-mail" id="e-mail" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch" checked>
                <label for="e-mail">за електронною поштою</label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="payments" id="payments" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch" checked>
                <label for="payments">за платежем</label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="bank-id" id="bank-id" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch" checked>
                <label for="bank-id">за Bank ID</label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="social_net" id="social_net" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch" checked>
                <label for="social_net">за соціальною мережею</label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="organisations" id="organisations" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch" checked>
                <label for="organisations">організацією</label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="co-owners" id="co-owners" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch" checked>
                <label for="co-owners">як співвласники</label>
              </li>
            </ul>
          </div>
          <div id="categories" class="scrollable_content"></div>
          <div id="time_range" class="scrollable_content">
            <h4 class="filter_title">Показати маячки:</h4>
            <fieldset data-role="controlgroup">
              <input type="radio" name="radio-time" id="any" value="any">
              <label for="any">За весь час</label>
              <input type="radio" name="radio-time" id="last_hour" value="hour">
              <label for="last_hour">За останню годину</label>
              <input type="radio" name="radio-time" id="last_day" value="day" checked="checked">
              <label for="last_day">За останній день</label>
              <input type="radio" name="radio-time" id="last_week" value="week">
              <label for="last_week">За останній тиждень</label>
              <input type="radio" name="radio-time" id="last_month" value="month">
              <label for="last_month">За останні 30 днів</label>
              <input type="radio" name="radio-time" id="last_hundred" value="hundred">
              <label for="last_hundred">За останні 100 днів</label>
              <input type="radio" name="radio-time" id="last_year" value="year">
              <label for="last_year">За останній рік</label>
              <input type="radio" name="radio-time" id="custom_range" value="custom">
              <label for="custom_range">Встановити межі</label>
              <div class="date_picker">
                <div class="ui-field-contain">
                  <label for="low_limit">з</label>
                  <input type="date" data-clear-btn="false" data-mini="true" name="low_limit" id="low_limit" value="" placeholder="дд.мм.рррр">
                </div>
                <div class="ui-field-contain">
                  <label for="hight_limit">по</label>
                  <input type="date" data-clear-btn="false" data-mini="true" name="hight_limit" id="hight_limit" value="" placeholder="дд.мм.рррр">
                </div>
              </div>
            </fieldset>
          </div>
          <div id="beacon_status" class="scrollable_content">
            <h4 class="filter_title">Показати маячки тільки:</h4>
            <ul data-role="listview" class="listview">
              <li>
                <input type="checkbox" data-role="flipswitch" name="new_beacons" id="new_beacons" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch">
                <label for="new_beacons">Нові</label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="confirmed_beacons" id="confirmed_beacons" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch">
                <label for="confirmed_beacons">Підтверджені</label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="processing_beacons" id="processing_beacons" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch">
                <label for="processing_beacons">В стані обробки</label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="closed_beacons" id="closed_beacons" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch">
                <label for="closed_beacons">Закриті</label>
              </li>
            </ul>
          </div>
          <div id="actions" class="scrollable_content">
            <h4 class="filter_title">Показати маячки громадян<br>тільки:</h4>
            <ul data-role="listview" class="listview">
              <li>
                <input type="checkbox" data-role="flipswitch" name="votings" id="votings" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch">
                <label for="votings">Голосування</label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="programms" id="programms" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch">
                <label for="programms">Програми</label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="project_proposals" id="project_proposals" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch">
                <label for="project_proposals">Проектні пропозиції</label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="projects" id="projects" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch">
                <label for="projects">Проекти</label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="requests" id="requests" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch">
                <label for="requests">Запити</label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="requests" id="budget" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch">
                <label for="budget">Бюджет участі</label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="requests" id="positive" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch">
                <label for="positive">Тут добре</label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="requests" id="negative" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch">
                <label for="negative">Тут погано</label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="requests" id="info" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch">
                <label for="info">Важливо</label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="requests" id="sos" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch">
                <label for="sos">СОС</label>
              </li>
            </ul>
          </div>
        </div>
        
      </div>   <!-- /right-panel -->

    </div>    <!-- /beacons-map page -->


    <div data-role="page" data-dialog="true" id="login_dialog" data-close-btn="none" data-title="Вхід" class="page">
      <form id="login" action="https://gurtom.mobi/l/index.php?m=0" method="post">
        <div data-role="header">
          <a href="#" data-icon="close" class="history_back ui-btn ui-corner-all ui-icon-close ui-btn-icon-notext ui-btn-left">Close</a>
          <h1>Увійти</h1>
        </div>
        <div data-role="main" class="ui-content ui-grid-a">
          <div class="ui-block-a form">
            <input type="hidden" name="login" value="1">
            <label for="email_login">Електронна пошта</label>
            <input id="email_login" type="email" name="user_name" placeholder="my-email@example.com" required>  <!--pattern="[a-zA-Zа-яіїєА-ЯІЇЄ0-9]{2,64}"-->
            <label for="user_password">Пароль</label>
            <input id="user_password" type="password" name="user_password" pattern=".{6,}" required>
            <input class="submit" type="submit" value="Увійти">
          </div>
          <div class="ui-block-b">
            <div class="custom-border-radius">
              <h5>Приєднатися через мережу</h5>
              <a href="./sn/gp.php" data-ajax="false" class="gp ui-btn ui-icon-google_plus ui-btn-icon-notext ui-nodisc-icon ui-corner-all">Google+</a>
              <a href="./sn/fb.php" data-ajax="false" class="ui-btn ui-icon-facebook ui-btn-icon-notext ui-nodisc-icon ui-corner-all">Facebook</a>
              <a href="./sn/li.php" data-ajax="false" class="ui-btn ui-icon-linkedin ui-btn-icon-notext ui-nodisc-icon ui-corner-all">LinkedIn</a>
            </div>
            <a href="#" class="registration ui-btn ui-input-btn ui-corner-all ui-shadow">Ви тут вперше?</a>
            <a href="#" class="restore_pass ui-btn ui-input-btn ui-corner-all ui-shadow">Забули пароль?</a>
          </div>
          <a href="https://goo.gl/bZZkoL" target="_blank" class="org ui-btn ui-corner-all">Реєстрація юридичної особи</a>
        </div>
      </form>
    </div>

    <div data-role="page" data-dialog="true" id="registration_dialog" data-close-btn="none" data-title="Реєстрація" class="page">
      <div data-role="header" data-position="fixed">
        <a href="#" data-icon="close" class="history_back ui-btn ui-corner-all ui-icon-close ui-btn-icon-notext ui-btn-left">Close</a>
        <h1>Реєстрація</h1>
      </div>
      <form action="https://gurtom.mobi/l/index.php?m=4" id="registration" method="POST">
        <div data-role="main" class="form">
          <div class="ui-content ui-grid-a">
            <div class="ui-block-a">
              <label for="login">Нік</label>
                <input id="login" type="text" name="user_name" placeholder="Nickname" pattern="[a-zA-Z0-9]{2,64}" required>
              <label for="email">Дійсний email</label>
                <input id="email" type="email" name="user_email" placeholder="email@example.com" required>
            </div>
            <div class="ui-block-b">
              <label for="password">Пароль</label>
                <input id="password" type="password" name="user_password_new" pattern=".{6,}" required>
              <label for="password-repeat">Повторіть пароль</label>
                <input id="password-repeat" type="password" name="user_password_repeat" pattern=".{6,}" required>
            </div>
            <hr>
            <input type="hidden" name="register" value="Register">
            <div class="g-recaptcha" data-size="compact" data-sitekey="6Le4yCITAAAAAPRq84f8ZkuWD5oSdmAvGlfPCx6P"></div>
          </div>
          <input class="submit" type="submit" name="login" value="Зареєструватись"  data-wrapper-class="submit__wrapper">
        </div>
      </form>
    </div>

    <div data-role="page" data-dialog="true" id="restore_pass_dialog" data-close-btn="none" data-title="Відновлення паролю" class="page">
      <div data-role="header">
        <a href="#" data-icon="close" class="history_back ui-btn ui-corner-all ui-icon-close ui-btn-icon-notext ui-btn-left">Close</a>
        <h1>Відновлення паролю</h1>
      </div>
      <div data-role="main" class="ui-content">
        <div class="form">
          <label for="email-rest">Ваш email</label>
          <input id="email-rest" type="email" name="email-rest">
          <input class="submit" type="submit" name="login" value="Відновити">
        </div>
      </div>
    </div>

    <div data-role="page" data-dialog="true" id="reset_pass_dialog" data-close-btn="none" data-title="Відновлення паролю" class="page">
      <div data-role="header">
        <a href="#" data-icon="close" class="history_back ui-btn ui-corner-all ui-icon-close ui-btn-icon-notext ui-btn-left">Close</a>
        <h1>Відновлення паролю</h1>
      </div>
      <div data-role="main" class="ui-content">
        <div class="form">
          <label for="password_reset">Пароль</label>
          <input id="password_reset" type="password" name="password_reset" pattern=".{6,}">
          <label for="password_reset-repeat">Повторіть пароль</label>
          <input id="password_reset-repeat" type="password" name="password_reset-repeat" pattern=".{6,}">
          <input class="submit" type="submit" name="login" value="Відновити">
        </div>
      </div>
    </div>

    <span class='warning'><h2>Прототип</h2></span>

    <div class="profile_page__wrapper"></div>


    <script id="object_create_tpl" type="text/template">
        <div data-role="header" class="header">
          <h4><%-titler%></h4>
          <% if(parent_id !== '') { %>
            <h4 class="follower">пов'язаного з маячком id=<%- parent_id %></h4>
          <% } %>
          <% if(targetId !== '') { %>
            <h4 class="follower">як копії маячка id=<%- targetId %></h4>
          <% } %>
          <a href="#" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-close ui-btn-icon-notext ui-btn-right ui-nodisc-icon">Close</a>
        </div>
        <div data-role="main" class="main ui-content">
          <form action="" id="object_create">
            <div class="wrapper__lat_lng"></div>
            <div class="wrapper__title"></div>
            <div class="wrapper__admin_level"></div>
            <div class="wrapper__description"></div>
            <div class="wrapper__details"></div>
            <div class="wrapper__sphere" data-role="collapsible-set" data-theme="a" data-content-theme="a"></div>
            <div class="wrapper__money"></div>
            <div class="wrapper__currency_only"></div>
            <div class="wrapper__support"></div>
            <div class="wrapper__support_finish_date"></div>
            <div class="wrapper__start_date"></div>
            <div class="wrapper__end_date"></div>
            <div class="wrapper__beneficiar"></div>
            <div class="wrapper__phone"></div>
            <div class="wrapper__usr_countbl"></div>
            <div class="wrapper__age"></div>
            <div class="wrapper__response"></div>
            <input id="tags" type="hidden" name="tags">
            <input id="nco" type="hidden" name="nco">
            <input id="img" type="hidden" name="img">
            <input id="program_id" type="hidden" name="program_id">
            <input id="uniq_id" type="hidden" name="uniq_id" value="<%- uniq_id %>">
            <input id="layer_owner_id" type="hidden" name="layer_owner_id" value="<%- layer_owner_id %>">
            <input id="type" type="hidden" name="type" value="<%- type||'' %>">
            <input id="targetId" type="hidden" name="targetId" value="<%- targetId||'' %>">
            <input id="private_group" type="hidden" name="private">
            <input id="parent_id" type="hidden" name="parent_id" value="<%- parent_id %>">
            <input id="parent_type" type="hidden" name="parent_type" value="<%- parent_type %>">
            <input id="chat" type="hidden" name="chat" value="<%- chat %>">
            <div id="submit" class="submit">
              <label for="submit_btn" class="ui-hidden-accessible">Submit</label>
              <button id="submit_btn" type="submit">Створити</button>
              <div class="progress_bar__wrapper">
                <div class="mask"></div>
                <div class="progressbar"></div>
                <div class="progressval"></div>
              </div>
            </div>
          </form>
          <div class="wrapper__programID"></div>
          <div class="wrapper__tag"></div>
          <div class="wrapper__nco"></div>
          <div class="wrapper__photo"></div>
          <div class="wrapper__layer_type"></div>
          <div class="wrapper__private"></div>
          <br>
          <h6>* - Обов'язкові поля.</h6>
        </div>
    </script>
    <!-- /object_create_tpl -->
    <script id="latlng__tpl" type="text/template">
        <input id="lat" type="hidden" name="lat" value="<%- lat %>">
        <input id="lng" type="hidden" name="lng" value="<%- lng %>">
        <input id="b_type" type="hidden" name="b_type" value="<%- b_type %>">
        <p class='lat_lng'>
          <img class="marker_img" src="<%- icon_url %>" alt="marker">
          Координати <%- (''+lat).replace('.', ',') %>&deg ш.; <%- (''+lng).replace('.', ',') %>&deg д. Можете перетягнути його в іншу точку на карті.
          <% if(+window.state.user.gov > 0){ %> Шар: <%- name %>.<% } %>
        </p>
    </script>
    <script id="title__tpl" type="text/template">
      <label for="title"><strong>Назва&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></strong></label>
      <input id="title" type="text" name="title" <%-required%>>
    </script>
    <script id="money__tpl" type="text/template">
      <fieldset id="money" class="ui-field-contain" data-role="controlgroup" data-type="horizontal">
        <legend><strong><%- ( label ? label : 'Необхідна сума' ) %>&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></strong></legend>
        <input id="amount" type="number" name="amount" pattern=".{12,}" value="<%-parent_amount%>" <%-required%>>
        <label for="currency">у валюті</label>
        <select id="currency" name="curr" data-inline="true" data-mini="true" data-iconpos="noicon" data-native-menu="false">
          <option value="980">UAH</option>
          <option value="840">USD</option>
          <option value="978">EUR</option>
          <% if( !realCurrencyOnly ) { %>
            <option value="1980">vUAH</option>
            <option value="1">ICAN</option>
          <% } %>

        </select>
      </fieldset>
    </script>
    <script id="currency_only__tpl" type="text/template">
        <label for="currency_only__select"><strong>Виберіть валюту</strong></label>
        <select name="curr" id="currency_only__select" data-iconpos="noicon" data-native-menu="false">
          <option value="980" selected>UAH</option>
          <option value="1980">vUAH</option>
          <option value="840">USD</option>
          <option value="978">EUR</option>
          <option value="1">ICAN</option>
        </select>
    </script>
    <script id="start_date__tpl" type="text/template">
      <label for="start_date__input"><strong><%- ( label ? label : 'Термін збору коштів для початку проекту' ) %>&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></strong></label>
      <input id="start_date__input" type="date" data-clear-btn="false" name="dtst" value="" placeholder="дд.мм.рррр" <%-required%>>
    </script>
    <script id="end_date__tpl" type="text/template">
        <label for="end_date__input"><strong><%- ( label ? label : 'Термін завершення' ) %>&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></strong></label>
        <input id="end_date__input" type="date" data-clear-btn="false" name="dtex" value="" placeholder="дд.мм.рррр" <%-required%>>
    </script>
    <script id="beneficiar__tpl" type="text/template">
        <label for="beneficiar_name"><strong>Визначте вигодонабувача&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></strong></label>
        <input id="beneficiar_name" type="text" name="ben" pattern=".{100,}" <%-required%>>
    </script>
    <script id="nco__tpl" type="text/template">
      <div id="nco__wrapper">
        <p><strong>Запропонуйте неприбуткову організацію для адміністрування проекту&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></strong></p>
        <h6>Автодоповнення починається з першої літери.</h6>
        <form class="ui-filterable" autocomplete="off">
          <input id="nco__autocomplete-input" data-type="search" placeholder="Оберіть організацію..." data-wrapper-class="input" autocomplete="off">
        </form>
        <ul id="nco__ul" data-role="listview" data-inset="true" data-filter="true" data-filter-reveal="true" data-input="#nco__autocomplete-input"></ul>
      </div>
    </script>
    <script id="description_tpl" type="text/template">
      <label for="description"><strong>Детальний опис&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></strong></label>
      <textarea id="description" name="descr" placeholder="Розмістіть детальний опис тут." cols="40" rows="2" maxlength="10000" <%-required%>><%-parent_descr%></textarea>
    </script>

    <script id="response_tpl" type="text/template">
      <p><strong>Очікувана відповідь</strong></p>
      <input type="text" data-clear-btn="true" name="response" id="response__input" value="" placeholder="Тип відповіді">
    </script>
    <script id="details_tpl" type="text/template">
      <label for="details"><strong>Повідомлення&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></strong></label>
      <textarea id="details" name="details" placeholder="Довжина повідомлення - до 240 символів." cols="40" rows="2" maxlength="240" data-wrapper-class="textarea" <%-required%>></textarea>
    </script>
    <script id="private_tpl" type="text/template">
        <div class="public_private_switch ui-content" data-role="content">
          <label for="public_private_switch__input" class=" ui-hidden-accessible">Flip toggle switch checkbox:</label>
          <input type="checkbox" data-role="flipswitch" name="public_private_switch__input" id="public_private_switch__input" data-on-text="Для групи" data-off-text="Публічний" data-wrapper-class="public_private_switch__flipswitch">
        </div>
        <div id="select_group">
          <p><strong>Оберіть групу</strong></p>
          <h6>Автодоповнення починається <strong>з третьої літери</strong>.</h6>
          <form class="ui-filterable" autocomplete="off">
            <input id="select_group__autocomplete-input" data-type="search" placeholder="Назва групи" data-wrapper-class="input">
          </form>
          <ul id="select_group__autocomplete" data-role="listview" data-inset="true" data-filter="true" data-input="#select_group__autocomplete-input"></ul>
        </div>
    </script>


    <script id="tag_tpl" type="text/template">
      <p><strong>Додати тег&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></strong></p>
      <p id="tag_storage"></p>
      <h6>Автодоповнення починається з першої літери. Для завершення натисніть Enter.</h6>
      <form action="">
        <input id="add_tag__input" data-type="search" placeholder="# лише букви та цифри" data-wrapper-class="input" title="Вводьте лише букви та цифри." autocomplete="off">
      </form>
      <ul id="add_tag__ul" data-role="listview" data-inset="true" data-filter="true" data-input="#add_tag__input"></ul>
    </script>

    <script id="photo_tpl" type="text/template">
      <div class="hiddenfile">
        <label for="photo__input">Завантажити фото:</label>
        <input id="photo__input" type="file" data-clear-btn="true" name="photo__input" accept="image/*">
      </div>
      <div class="preview_wrapper clearfix">
        <div id="photo__preview"></div>
        <button id="photo__remove" class="ui-input-clear ui-btn ui-icon-delete ui-btn-icon-notext ui-corner-all"></button>
      </div>
      <button id="photo__choose_file">Оберіть фото&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></button>
    </script>
    <script id="phone_tpl" type="text/template">
      <label for="phone_num__input"><strong>Номер телефону&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></strong></label>
      <input type="tel" data-clear-btn="true" name="phone" id="phone_num__input" value="" placeholder="380ХХХХХХХХХХ" data-wrapper-class="input" <%-required%>>
    </script>
    <script id="admin_level__tpl" type="text/template">
      <label for="admin_level__select"><strong>Виберіть адміністративний рівень проекту&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></strong></label>
      <select name="admin_level" id="admin_level__select" data-iconpos="noicon">
        <option value="3" selected>Місто</option>
        <option value="4">Район міста</option>
      </select>
    </script>

    <script id="select_menu__tpl" type="text/template">
      <p><strong><%- title %></strong>&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></p>
      <label for="options__select" class="select_option__label"><%- label %></label>
        <select id="options__select" data-iconpos="noicon" <% if(multi){ %>multiple="multiple"<% } else { %><% } %> data-native-menu="false" data-overlay-theme='b'>
        </select>
      </div>
      <input id="options" type="hidden" name="<%- inputName %>">
    </script>
    <script id="option__tpl" type="text/template">
      <span><%- optext %></span>
    </script>
    
    <script id="age__tpl" type="text/template">
      <div data-role="rangeslider">
        <label for="age_from"><strong>Вікові межі голосуючих</strong></label>
        <input class="age_range" type="range" name="age_from" id="age_from" min="12" max="99" value="21">
        <label for="age_to"></label>
        <input class="age_range" type="range" name="age_to" id="age_to" min="13" max="100" value="60">
      </div>
    </script>
    <script id="support__tpl" type="text/template">
      <label for="support__input"><strong>Мінімальна кількість голосів для початку голосування&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></strong></label>
      <input id="support__input" type="number" data-clear-btn="false" name="sprt" value="" placeholder="100" <%-required%>>
    </script>
    <script id="support_finish_date__tpl" type="text/template">
        <label for="support_finish_date__input"><strong>Дата завершення збору голосів підтримки&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></strong></label>
        <input id="support_finish_date__input" type="date" data-clear-btn="false" name="sprtf" value="" placeholder="дд.мм.рррр" <%-required%>>
    </script>
    <script id="sphere_title__tpl" type="text/template">
      <h3>Виберіть сферу голосування</h3>
      <div class="composite" data-role="collapsible-set" data-theme="a"></div>
    </script>
    <script id="sphere__tpl" type="text/template">
      <% if(menu.length > 0) { %>
        <legend><%- name %></legend>
        <div class="composite" data-role="collapsible-set" data-theme="a"></div>
      <% } else { %>
        <label for="idc-<%- idc %>" class="ui-btn ui-corner-all ui-btn-inherit ui-btn-icon-left ui-radio-off"><%- name %></label>
        <input id="idc-<%- idc %>" name="sph" data-enhanced="true" type="radio" value="<%- idc %>">
      <% } %>
    </script>
    

    <!-- /object_create_tpl subViews -->

    <script id="beacon_main_tpl" type="text/template">
      <div data-role="beacon" class="beacon ui-corner-all">
        <div data-role="header" class="header">
          <% if(full){ %>
            <div class="ui-btn-left ui-icon-<% if(full){ %>close<% } else { %><%-source%><% } %> ui-btn-icon-notext ui-btn-inline">Left Icon</div>
          <% } else { %>
            <img src="<%- icon_url %>" alt="icon" class="ui-btn-left ui-btn-icon-notext ui-btn-inline">
          <% } %>
          
          <div class="beacon-header">
            <h6>від: <span><%- author_name %></span>, ID <%- author_id %></h6>                                                                     
            <div class="content-with-icon">
              <span class="icon ui-btn-left ui-icon-schedule ui-btn-icon-notext ui-btn-inline ui-nodisc-icon">Icon</span>
              <p><%- ts %>; cardID <%- id %></p>                                                
            </div>
          </div>
          <a href="#" data-rel="popup" data-transition="slideup" data-position-to="#beacons-map__the-beacons" class="beacon_status <%- color %> ui-btn ui-corner-all ui-btn-right ui-btn-inline ui-icon-progress_<% if(b_status===0){ %>empty<% } else if(b_status===1){ %>one<% } else if(b_status===2){ %>two<% } else if(b_status===3){ %>full<% } %> ui-btn-icon-notext">Status</a>
        </div>
        <div data-role="content" class="beacon-content clearfix">
          <h3><%- title %></h3>
          <p><img class="photo" src="<%-b_img%>" alt="Photo"><strong><%- details %></strong></p>
          <p class="tags"><%- tagList %></p>
          <div class="expanding_view click_transparent">
            <div class="btn_wrapper ui-input-btn ui-btn ui-icon-more_horiz ui-btn-icon-notext ui-btn-right">
              <input class="expanding_btn ui-btn" type="button" data-enhanced="true" value="Enhanced - Icon only">
            </div>
          </div>
        </div>
        <div data-role="navbar" class="navbar">
          <ul >
            <li><button data-icon="share" class="share ui-btn-icon-notext ui-nodisc-icon ui-bar-inherit ui-bar ui-bar-a">Share</button></li>
            <li><button data-icon="link" class="link ui-btn-icon-notext ui-nodisc-icon ui-bar-inherit ui-bar ui-bar-a">Link</button></li>
            <li><button data-icon="error_outline" class="error ui-btn-icon-notext ui-nodisc-icon ui-bar-inherit ui-bar ui-bar-a">Disprove</button></li>
            <li><button data-icon="star-<% if (+favorite) { %>full<% } else { %>empty<% } %>" class="star ui-btn-icon-notext ui-nodisc-icon ui-bar-inherit ui-bar ui-bar-a">Add to Favorite</button></li>
            <li><button data-icon="add" class="add_linked ui-btn-icon-notext ui-nodisc-icon ui-bar-inherit ui-bar ui-bar-a">Add New</button></li>
          </ul>
        </div>
        <div id="chat_region"></div>
      </div>
    </script>

    <script id="chat_tpl" type="text/template">
      <div class="input-message ui-field-contain">
        <label for="text-message" class="ui-hidden-accessible">Відправити</label>
        <input type="text" data-clear-btn="true" data-mini="true" name="text-message" id="text-message" value="" placeholder="Повідомлення">
        <button class="input-message__send ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-send ui-btn-icon-notext ui-btn-a">Надіслати</button>
      </div>
      <div class="sent-message__wrapper"></div>
    </script>

    <script id="beacon_list_is_empty_tpl" type="text/template">
      <h3 class="empty_beacon_list">За обраними параметрами мапи та фільтрів<br>позначки/маячки користувачів тут відсутні</h3>
    </script>
    
    <script id="sos_extention_view_tpl" type="text/template">
      <p class="phone_view">   <span >Тел. </span>   <%- phone %>   </p>
    </script>

    <script id="chat_item_view_tpl" type="text/template">
      <p><img src="<%-avatar%>" alt="avatar">(<%- user_id %>) <span class="nickname"><%- user_name %>: </span><%- text %></p>
      <p class="date"><%- ts %><button class="abuse-spam ui-shadow ui-btn ui-corner-all ui-btn-inline ui-btn-right ui-icon-error_outline ui-btn-icon-notext ui-btn-a">Поскажитись</button></p>
    </script>

    <script id="expand_to_p-budget__tpl" type="text/template">
      <p class="money">Орієнтовна вартість проекту: <strong><%- amount %> <%- lib.currency.getName(curr) %></strong></p>
      <p class="descript">Детальний опис проекту: <strong><%- descr %></strong></p>
    </script>
    <script id="expand_to_voting__tpl" type="text/template">
      <p class="voting">Зібрано <strong><%- sprtd %></strong> голосів підтримки з <strong><%- sprt %></strong> необхідних.</p>
      <p class="voting">Дата завершення збору підтримки: <strong><%- sprtF %></strong>.</p>
      <p class="voting">Дата початку голосування: <strong><%- offerStartTime %></strong>.</p>
      <p class="voting">Дата завершення голосування: <strong><%- offerFinishTime %></strong>.</p>
      <p class="voting">Сфера голосування: <strong><%- sphereStr %></strong>.</p>
      <p class="voting">Статус голосування: <strong><%- v_status %></strong></p>
      <p class="voting">Детальний опис: <br><strong><%- descr %></strong></p>
      <a href="<%- discussion_link %>" class="ui-btn ui-corner-all ui-icon-twitter ui-btn-icon-left ui-mini" target="_blank">Обговорення голосування</a>
      <hr>
      <p class="voting">Рівень Вашої авторизації: <strong>"<%- votingStatus %>".</strong></p>
      <p class="voting">Ваш статус: <strong><%- usr_status %></strong></p>
      <div class="voting_btns"></div>
      <div class="voting_results__region"></div>
      <div class="indicative_voting__region"></div>
    </script>
    <script id="voting_support__tpl" type="text/template">
      <a href="#" class="ui-btn ui-corner-all" id="voting_support__btn"><%- btn_support %></a>
    </script>
    <script id="voting_buttons__tpl" type="text/template">
      <div class="ui-field-contain">
        <label for="flip-vote_type">Голосувати:</label>
        <input type="checkbox" data-role="flipswitch" name="flip-vote_type" id="flip-vote_type" data-on-text="Таємно" data-off-text="Відкрито" data-wrapper-class="voting-flipswitch">
      </div>
      <ul>
        <li><a href="#" class="voting_button voting_button__no <%- no %>">Проти</a></li>
        <li><a href="#" class="voting_button voting_button__abstain <%- abstain %>">Утриматись</a></li>
        <li><a href="#" class="voting_button voting_button__yes <%- yes %>">За</a></li>
      </ul>
      <hr>
    </script>
    
    <script id="voting_results__title__tpl" type="text/template">
      <h2 class="title"><%- title %></h2>
      <div class="ui-checkbox ui-state-<%-disabled%>" style="<%- hide %>">
        <label for="percent_checkbox" class="percents ui-btn ui-corner-all ui-btn-inherit ui-btn-icon-left ui-checkbox-off">У відсотках</label>
        <input type="checkbox" name="percent_checkbox" id="percent_checkbox" data-enhanced="true" <%- disabled %>>
      </div>
      <div class="subtitles">
        <p class="subtitle total">Всього</p>
        <p class="subtitle minus">Проти</p>
        <p class="subtitle plus">За</p>
        <p class="subtitle abst">Утримались</p>
      </div>
      <div class="voting_results"></div>
      <hr>
    </script>
    
    <script id="voting_results__bar__tpl" type="text/template">
      <p class="usr_category"><%- title %></p>
      <div class="bars">
          <p> </p>
        <div class="votes votes_total">
          <p> </p>
          <p class="number"><%- totalView %></p>
        </div>
        <div class="votes votes_no">
          <p> </p>
          <p class="number"><%- minusView %></p>
        </div>
        <div class="votes votes_yes">
          <p> </p>
          <p class="number"><%- plusView %></p>
        </div>
        <div class="votes votes_abstain">
          <p> </p>
          <p class="number"><%- abstView %></p>
        </div>
      </div>
    </script>

    <script id="program_full_view" type="text/template">
      <p class="project">Опис:<br><%= description %></p>
      <p class="project">ID програми: <strong><%- id %></strong></p>
      <a href="<%- discussion_link %>" class="ui-btn ui-corner-all ui-icon-twitter ui-btn-icon-left" target="_blank">Обговорення програми</a>
      <p class="project">Проектних пропозицій: <strong><%- pp %>.</strong> <a href="#" class="pp_list ui-btn ui-corner-all ui-btn-inline ui-mini">Перелік</a></p>
      <hr>
      <div class="funds"></div>
      <hr>
      <div class="contribution"></div>
      <hr>
      <a href="#" class="donate ui-btn ui-corner-all ui-icon-add ui-btn-icon-left">Пожертвувати</a>
    </script>

    <script id="objects2-5_full_view" type="text/template">
      <p class="project">Опис:<br><%= description %></p>
      <p class="project">ID  <%- obj_ %>: <strong><%- id %></strong></p>
      <% if( type === "3" ){ %>
        <p class="project">
          До програми ID: <%- program_id %>
          <a href="<%- program_link %>" target="_blank"><strong> <%- program_title %> </strong></a>
        </p>
      <% } %>
      <% if( type === "5" ){ %>
        <p class="project">Бенефіціар: <strong> <%- beneficiary %>.</strong></p>
      <% } %>
      <% if( +type >= 3 && +type <= 5 ){ %>
        <p class="project">Сума запитувана: <strong> <%- amount_asking %> <%- currency %>.</strong></p>
      <% } %>
      <% if( dt_expired && dt_expired != '0000-00-00 00:00:00' ){ %>
        <p class="project">Дата завершення <%- obj_ %>: <strong> <%- dt_expired %>.</strong></p>
      <% } %>
      <% if( ts_closed && ts_closed != '0000-00-00 00:00:00' ){ %>
        <p class="project"><%- closed %> <strong> <%- ts_closed %>.</strong></p>
      <% } %>
      <% if( discussion_link ){ %>
        <a href="<%- discussion_link %>" class="ui-btn ui-corner-all ui-icon-twitter ui-btn-icon-left" target="_blank">Обговорення <%- obj_ %></a>
      <% } %>
      <% if( type === "2" ){ %>
        <p class="project">Проектних пропозицій: <strong><%- pp %>.</strong> <a href="#" class="pp_list ui-btn ui-corner-all ui-btn-inline ui-mini">Перелік</a></p>
      <% } %>
      <hr>
      <div class="funds"></div>
      <hr>
      <div class="contribution"></div>
      <a href="#" class="donate ui-btn ui-corner-all ui-icon-add ui-btn-icon-left">Пожертвувати</a>
      <div class="nco"></div>
    </script>

    <script id="admin_nco_view" type="text/template">
      <h3>Адміністрування <%- obj_ %></h3>
      <% if( nco_acceptance === "0" && nco_id === "0" ){ %>
        <p class="project"> Автор не визначився з бажаною НКО.</p>
      <% } %>
      <% if( nco_acceptance === "0" && nco_id !== 0 ){ %>
        <p class="project">
          Автор хотів би співпрацювати з НКО 
          <strong> <%- ncoName %>. </strong>
        </p>
      <% } %>
      <div class="nco_choise"></div>
      <% if( nco_acceptance === "0" && nco_bids.length === 0 ){ %>
        <p class="project"> Жодна НКО не виявила бажання адмініструвати <%- obj__ %>.</p>
      <% } %>
      <% if( nco_acceptance !== "0" ){ %>
        <p class="project"> За двосторонньою згодою, <%- obj__ %> адмініструє НКО <strong> <%- ncoName %> </strong></p>
      <% } %>
      <% if( nco_acceptance === "0" && nco_bids.length !== 0 ){ %>
        <p class="project"> Перелік НКО, що хотіли б адмініструвати <%- obj__ %>).</p>
      <% } %>
      <div class="nco_list"></div>
      <% if( showNcoBtn ){ %>
        <button class="nco_decision"> <%- txt %></p>
      <% } %>
    </script>

    <script class="nco_wants_admin" type="text/template">
      <p class="project"> <%- item.nco_name %>.</p>
      <% if( button ){ %>
        <button class="accept"> Прийняти пропозицію.</p>
      <% } %>
    </script>

    <script id="funds_list_view" type="text/template">
      <caption class="project"><%- label %>: <strong><%- amount %></strong></caption>
      <tbody></tbody>
    </script>
    <script id="funds_item_view" type="text/template">
      <td>  
        <strong class="saldo"><%- saldo %></strong>
      </td>
      <td>  
        <strong class="curr"><%- lib.currency.getName(curr) %></strong>
      </td>
      <td>  
        <% if( withdrawable ) { %>
          <a href="#" class="withdraw ui-btn ui-icon-block ui-corner-all ui-btn-icon-left ui-mini ui-btn-inline" title="Відкликати">Відкликати</a>
        <% } %>
      </td>
    </script>

    <script id="map_view" type="text/template">
      <div id="the-map"></div>
      <label for="map_search" class="ui-hidden-accessible map_search"></label>
      <input data-wrapper-class="wrapper_map_search" type="search" name="map_search" id="map_search" placeholder="#хеш-тег чи числовий id">
      <div class="ui-nodisc-icon buttons-wrapper upper-right unused">
        <a href="#" id="near" class="ui-btn ui-corner-all ui-icon-nearby ui-btn-icon-notext ui-btn-inline">nearby</a><br>
        <a href="#" id="location" class="ui-btn ui-corner-all ui-icon-my_location ui-btn-icon-notext ui-btn-inline">location</a><br>
        <a href="#favorite__list" data-rel="popup" data-transition="slideup" data-position-to="#beacons-map__the-map" class="ui-btn ui-corner-all ui-icon-star-empty ui-btn-icon-notext ui-btn-inline favorite-button">favorite</a>
      </div>
      <div class="ui-nodisc-icon buttons-wrapper lower-left">
        <a id="create_btn" href="#" data-rel="popup" data-transition="turn" data-position-to="origin" class="ui-btn ui-corner-all ui-icon-add ui-btn-icon-notext ui-btn-inline">add</a><br>
        <a id="share" href="#" class="unused ui-btn ui-corner-all ui-icon-share ui-btn-icon-notext ui-btn-inline">share</a>
      </div>
    </script>

    <script id="create_beacon__geo_tpl" type="text/template">
      <div data-role="header" class="header">
        <a href="#" class="settings ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-settings ui-btn-icon-notext ui-btn-left ui-nodisc-icon">Close</a>
        <h1>Створити маячок</h1>
        <a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-close ui-btn-icon-notext ui-btn-right ui-nodisc-icon">Close</a>
      </div>
      <div data-role="main" class="listview_wrapper">
        <ul data-role="listview" class="listview"></ul>
        <h4 class="info">Щоб створити новий шар <br> натисніть ліву кнопку</h3>
      </div>
    </script>

    <script id="create_beacon_menu_item__tpl" type="text/template">
      <a href="#" data-rel="dialog" class="ui-btn<%-disabled%>">
        <%- name %>
        <img class="a_la_icon" src="<%- img %>" alt="">
      </a>
    </script>

    <script id="beacon_status__tpl" type="text/template">
      <div data-role="header">
        <h1>Статус маячка</h1>
        <a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-close ui-btn-icon-notext ui-btn-right ui-nodisc-icon">Close</a>
      </div>
      <div data-role="main" class="status_list__wrapper">
        <ul data-role="listview" class="listview"></ul>
      </div>
    </script>
    <script id="beacon_status__li_item" type="text/template">
      <% if( icon ) { %>
        <div class="status_item__paragraf_wrapper ui-nodisc-icon">
          <h3 class="status_item__paragraf <%- icon %> ui-btn-icon-left"><%- text %></h3>
        </div>
      <% } %>
      <div class="child_btns"></div>
    </script>

    <script id="right_popup__component_tpl" type="text/template">
      <div data-role="header">
        <h1><%-header%></h1>
        <a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-close ui-btn-icon-notext ui-btn-right ui-nodisc-icon">Close</a>
      </div>
      <div data-role="main" class="main__right_popup__component"></div>
    </script>

    <script id="right_popup__share_tpl" type="text/template">
      <div class="custom-border-radius">
        <a target="_blank" href="https://plus.google.com/share?url=<%-link%>"
          data-ajax="false" class="gp ui-btn ui-icon-google_plus ui-btn-icon-notext ui-nodisc-icon ui-corner-all">Google+</a>
        <a target="_blank" href="https://www.facebook.com/sharer.php?u=<%-link%>&t=<%-title%>"
          data-ajax="false" class="ui-btn ui-icon-facebook ui-btn-icon-notext ui-nodisc-icon ui-corner-all">Facebook</a>
        <a target="_blank" href="https://www.linkedin.com/cws/share?url=<%-link%>"
          data-ajax="false" class="ui-btn ui-icon-linkedin ui-btn-icon-notext ui-nodisc-icon ui-corner-all">LinkedIn</a>
<!--
        <a target="_blank" href="https://twitter.com/intent/tweet?url=<%-link%>&text=<%-title%>"
          data-ajax="false" class="tw ui-btn ui-icon-twitter_box ui-btn-icon-notext ui-nodisc-icon ui-corner-all">Twitter</a>
-->
      </div>
    </script>

    <script id="change_gov_menu__tpl" type="text/template">
      <div data-role="header" class="header">
        <h1>Змінити меню</h1>
        <a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-close ui-btn-icon-notext ui-btn-right ui-nodisc-icon">Close</a>
      </div>
      <div data-role="main" class="listview_wrapper ui-content">
        <ul id="change_gov_menu_list" class="listview" data-role="listview"></ul>
        <button class="add ui-btn ui-corner-all">Додати ще</button>
        <button class="save ui-btn ui-corner-all">Зберегти</button>
      </div>
    </script>
    <script id="change_gov_menu_item__tpl" type="text/template">
      <input type="hidden" class="change_gov_menu__layer" name="layer_type" value="<%- layer_type %>">
      <div class="change_gov_menu__input_wrapper ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset">
        <input class="change_gov_menu__input" type="text" data-enhanced="true" data-clear-btn="false" name="text-enhanced" id="text-enhanced" value="<%- name %>" placeholder="Додайте назву шару">
      </div>
      <div class="change_gov_menu__select_type"></div>
      <div class="hiddenfile">
        <label>
          <input class="take_icon__input" type="file" data-clear-btn="false" name="icon__input" accept="image/*" capture>
        </label>
      </div>
      <button data-iconpos="noicon" class="change_gov_menu__icon ui-btn ui-btn-inline ui-btn-icon-notext">
        <img class="a_la_icon" src="<%- img %>" alt="?">
      </button>
      <a href="#" class="change_gov_menu__delete_item ui-btn ui-btn-inline ui-btn-icon-notext ui-icon-delete"></a>
    </script>

    <script id="donate_tpl" type="text/template">
        <div data-role="header" class="header">
          <h4><%-header_title%></h4>
          <% if(id !== '0') { %>
            <h4 class="follower"><%-subtitle%> "<%-details%>", id:<%- id %></h4>
          <% } %>
          <a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-close ui-btn-icon-notext ui-btn-right ui-nodisc-icon history_back">Close</a>
        </div>
        <div data-role="main" class="main ui-content">
          <form action="" id="donate__form">
            <div class="wrapper__email"></div>
            <div class="wrapper__funds"></div>
            <div class="wrapper__money"></div>
            <div class="wrapper__checkbox"></div>
            <input type="hidden" name="type" value="<%-type%>">
            <input type="hidden" name="id" value="<%-id%>">
          </form>
          <br>
          <h6>* - Обов'язкові поля.</h6>
          <div id="donate__submit" class="submit">
            <label for="submit_btn" class="ui-hidden-accessible">Submit</label>
            <button id="submit_btn" type="submit">Пожертвувати</button>
          </div>
        </div>
    </script>

    <script id="email_input__tpl" type="text/template">
      <div class="ui-field-contain">
        <label for="email_input"><strong>Ваша електронна пошта:&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></strong></label>
        <input class="email_input" type="email" name="email" id="email_input" placeholder="example@site.com" value="<%- email %>">
      </div>
    </script>
    <script id="checkbox__tpl" type="text/template">
      <label>
        <input class="checkbox" type="checkbox" name="<%-checkBoxName%>"><%-label%>
      </label>
    </script>

    <script id="org_layer__tpl" type="text/template">
      <div class="org_layer__chk ui-checkbox">
          <label for="i<%-uniq_id%>" class="ui-btn ui-btn-inherit ui-btn-icon-right ui-checkbox-<%-chkd%>" data-iconpos="right">
            <%- text %>
          </label>
          <input  id="i<%-uniq_id%>" type="checkbox" data-enhanced="true" <%- chk %>>
      </div>
      <% if( isPinnable ) { %>
        <div class="org_item__pin ui-icon-<%if(+pined){ %><%-'pin_on'%><% } else { %><%-'pin_off'%><% } %> ui-btn-icon-notext ui-nodisc-icon ui-btn-icon-left ui-btn-inline ui-mini" data-enhanced="true"></div>
      <% } %>
    </script>

    <script id="org__tpl" type="text/template">
      <h3 class="org_title ui-collapsible-heading ui-collapsible-heading-collapsed">
        <a href="#" class="ui-collapsible-heading-toggle ui-btn" data-iconpos="noicon">
          <%- text %>
          <span class="ui-collapsible-heading-status"> click to expand contents</span>
        </a>
      </h3>
      <div class="layers_container ui-collapsible-content ui-collapsible-content-collapsed" aria-hidden="true">
      </div>
      <div class="org__chk ui-checkbox ui-btn-inline">
          <label for="i<%-layer_owner_id%>" class="ui-btn ui-corner-all ui-btn-inherit ui-btn-icon-left ui-btn-inline ui-checkbox-<%-chkd%>"></label>
          <input  id="i<%-layer_owner_id%>" type="checkbox" data-enhanced="true" <%- chk %>>
      </div>
      <% if( isPinnable ) { %>
        <div class="org__pin ui-icon-<%if(+pined){ %><%-'pin_on'%><% } else { %><%-'pin_off'%><% } %> ui-btn-icon-notext ui-nodisc-icon ui-btn-icon-left ui-btn-inline ui-mini" data-enhanced="true"></div>
      <% } %>
    </script>

    <script id="fourth_filter__tpl" type="text/template">
      <h4 class="filter_title">Показати маячки організацій:</h4>
      <div class="selected_layers"></div>
      <div class="search_wrapper"></div>
      <div class="unselected_layers"></div>
    </script>
     
    <script id="map_search__tpl" type="text/template">
      <input data-wrapper-class="wrapper_map_search" type="<%- inputType %>" data-type="search" name="map_search" id="map_search" placeholder="<%- placeholder %>" data-enhanced="true" value="<%- value %>" autofocus>
      <a href="#" tabindex="-1" aria-hidden="true" class="ui-input-clear ui-btn ui-icon-delete ui-btn-icon-notext ui-corner-all ui-input-clear-hidden" title="Clear text">Clear text</a>
      <a href="#" tabindex="-2" class="ui-input-close ui-btn ui-icon-close ui-btn-icon-notext ui-corner-all" title="Close input">Close input</a>
    </script>

    <script id="profile_popup__tpl" type="text/template">
      <div data-role="header" class="header">
        <h1>Ваш профіль</h1>
        <a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-close ui-btn-icon-notext ui-btn-right ui-nodisc-icon">Close</a>
      </div>
      <div data-role="main" class="listview_wrapper">
        <div class="profile_info clearfix">
          <img class="avatar" src="<%- avatarSrc %>" alt="Photo">
          <p class="name"><strong>Ім'я:</strong> <%- name %> </p>
          <p class="name"><strong>login:</strong> <%- login %> </p>
          <p class="name"><strong>id:</strong> <%- id %> </p>
        </div>
        <p class="name"><strong>email:</strong> <%- email %> </p>
        <div class="address">
          <p class="address_title">Адреси для доступу до місцевих голосувань:</p>
          <ul class="address_list"></ul>
        </div>
      </div>
    </script>


    <script>
      (function(){
        var $g_recaptcha = document.querySelector('.g-recaptcha')
        if(window.innerWidth > 359 && window.innerHeight > 359) {
          $g_recaptcha.setAttribute('data-size', 'normal')
        } else {
          $g_recaptcha.setAttribute('data-size', 'compact')
        }
      })()
    </script>
    <script src="https://www.google.com/recaptcha/api.js" async defer></script>

    <script src="./static/js/vendor/json2.js"></script>
    <script src="./static/js/vendor/underscore-min.js"></script>
    <script src="./static/js/vendor/jquery-1.11.1.min.js"></script>
    <script>
      $(document).on("mobileinit", function () {
        $.mobile.hashListeningEnabled = false;
        $.mobile.pushStateEnabled = false;
        $.mobile.changePage.defaults.changeHash = false;
        $.mobile.ajaxEnabled=false;
      });
    </script>
    <script src="./static/js/vendor/jquery.mobile-1.4.5.js"></script>
    <script src="./static/js/vendor/backbone.js"></script>
    <script src="./static/js/vendor/backbone.marionette.js"></script>
    <script src="./static/js/showMap.js"></script>
    <script src="./static/js/init.js" async defer></script>
    <script src="./static/js/jQM_tweaks.js"></script>
    <script src="./static/js/filtersService.js"></script>
    <script src="./static/js/router.js"></script>
    <script src="./static/js/beaconBriefCardsList.js"></script>
    <script src="./static/js/beaconsCreatePopupMenu.js"></script>
    <script src="./static/js/beaconCreateView.js"></script>
    <script src="./static/js/beaconFullView.js"></script>
    <script src="./static/js/govEditBeaconCreatePopupMenu.js"></script>
    <script src="./static/js/beaconChangeStatusMenu.js"></script>
    <script src="./static/js/payByCardPopup.js"></script>
    <script src="./static/js/donate.js"></script>
    <script src="./static/js/controller.js"></script>
    <script src="./static/js/authentification_manager.js"></script>
    <script src="./static/js/fourthFilter.js"></script>
    <script src="./static/js/shareInSocialNet.js"></script>
    <script src="./static/js/mapSearch.js"></script>
    <script src="./static/js/profilePopup.js"></script>

  </body>
</html>
