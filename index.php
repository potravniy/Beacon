<?php

if(isset($_SERVER['HTTP_ACCEPT_LANGUAGE']))
  {
    $l_lang = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2);
  }else{
    $l_lang = 'en';
  }
require_once($_SERVER['DOCUMENT_ROOT'].'/lang_'.$l_lang.'.php');

?>

<!doctype html>
<html lang="<?php echo $l_lang; ?>">
  <head>
    <!--<base href="https://gurtom.mobi/">-->
    <meta charset="utf-8">
    <link rel="manifest" href="/manifest.json">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="description" content="<?php echo META_DESCRIPTION ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#e9e9e9">
    
    <title><?php echo BEACON ?></title>

    <!-- Add to homescreen for Chrome on Android -->
    <meta name="mobile-web-app-capable" content="yes">
    <link rel="icon" sizes="192x192" href="/static/img/android-desktop.png">

    <!-- Add to homescreen for Safari on iOS -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="apple-mobile-web-app-title" content="<?php echo BEACON ?>">
    <link rel="apple-touch-icon" href="/static/img/android-desktop.png">
    <link rel="apple-touch-icon-precomposed" href="/static/img/android-desktop.png">
    <link rel="apple-touch-startup-image" href="/static/img/android-desktop.png">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

    <!-- Tile icon for Win8 (144x144 + tile color) -->
    <meta name="msapplication-TileImage" content="/static/img/ms-touch-icon-144x144.png">
    <meta name="msapplication-TileColor" content="#3372DF">

    <link rel="shortcut icon" href="/static/img/favicon.ico">

    <script src="https://cdn.polyfill.io/v2/polyfill.min.js?features=Intl.~locale.en,Intl.~locale.ru,Intl.~locale.uk"></script>
    <script src="/static/js/vendor/intl-messageformat.min.js"></script>
    <!-- from https://github.com/yahoo/intl-messageformat/tree/master/dist/locale-data -->
    <script src="<?php echo "/static/js/vendor/locale-data/".$l_lang.".js"; ?>"></script>
    <script>
      (function(){
        var src = "<?php echo "/static/js/lang/local_".$l_lang.".json"; ?>"
        var oReq = new XMLHttpRequest();
        oReq.addEventListener("load", function() {
          if(JSON.parse(this.response).error){
            alert(JSON.parse(this.response).error)
            return
          }
          window.localeMsg = JSON.parse( this.responseText )
          window.localeLang = "<?php echo $l_lang; ?>"
        });
        oReq.open("GET", src, false);
        oReq.send();
      })()
    </script>
    <script src="<?php echo "https://maps.googleapis.com/maps/api/js?key=AIzaSyD9GrBwQ_NFlEMzjrAkE4KzsZcTsqf0_h8&language=".$l_lang."&libraries=places"; ?>"></script>

    <style>
      h1 {display: none;}
      a {display: none;}
      .page {display: none;}
    </style>
    <link rel="stylesheet" href="/static/css/vendor/jquery.mobile-1.4.5_modified.css">
    <link rel="stylesheet" href="/static/css/beacon.css">

  </head>
  <body>
    <div id="beacons-map" data-role="page" data-fullscreen="true" class="ui-overlay-shadow ui-responsive-panel" data-theme="a" data-title="<?php echo BEACONS ?>">

      <div id="header" data-role="header" data-position="fixed" data-tap-toggle="false" data-update-page-padding="false" data-fullscreen="true">
        <a class="ui-btn ui-btn-left ui-btn-inline ui-icon-menu ui-btn-icon-notext ui-nodisc-icon" href="#left-panel"><?php echo MAIN_MENU ?></a>
        <h1><?php echo GUEST ?></h1>
        <a class="ui-btn ui-btn-right ui-btn-inline ui-icon-more_vert ui-btn-icon-notext ui-nodisc-icon" href="#right-panel"><?php echo OPTIONS ?></a>
      </div>
      <div id="container" data-role="main" class="ui-panel-wrapper">
        <div id="beacons-map__the-map">

          <div id="the-map"></div>
          <div class="ui-input-search searsh-buttons-wrapper ">
            <a href="#" class="searsh-buttons hash-search ui-btn ui-btn-inline">#</a>
            <a href="#" class="searsh-buttons id-search ui-btn ui-btn-inline">id</a>
            <a href="#" class="searsh-buttons google-search ui-btn ui-btn-inline ui-icon-flag ui-btn-icon-notext"><?php echo ADDRESS ?></a>
          </div>
          <div id="map_search_container"></div>

          <div class="ui-nodisc-icon buttons-wrapper upper-right unused">
            <a href="#" class="ui-btn ui-corner-all ui-icon-nearby ui-btn-icon-notext ui-btn-inline"><?php echo NEARBY ?></a><br>
            <a href="#" class="ui-btn ui-corner-all ui-icon-my_location ui-btn-icon-notext ui-btn-inline"><?php echo LOCATION ?></a><br>
            <a href="#favorite__list" data-rel="popup" data-transition="slideup" data-position-to="#beacons-map__the-map" class="ui-btn ui-corner-all ui-icon-star-empty ui-btn-icon-notext ui-btn-inline favorite-button"><?php echo FAVORITE ?></a>
          </div>
          <div class="ui-nodisc-icon buttons-wrapper lower-left">
            <a id="create_btn" href="#" data-rel="popup" data-transition="turn" data-position-to="origin" class="ui-btn ui-corner-all ui-icon-add-beacon ui-btn-icon-notext ui-btn-inline"><?php echo ADD ?></a><br>
            <a href="#" class="unused ui-btn ui-corner-all ui-icon-share ui-btn-icon-notext ui-btn-inline"><?php echo SHARE ?></a>
          </div>
        </div> <!-- /beacons-map__the-map -->
        
        <div id="beacons-map__the-beacons">
          <div id="cards-region"></div>
          <div id="clipboard-region">
            Clipboard
          </div>
          <!--<p>Place for Beacon Cards or Beacon Create.</p>-->
        </div>    <!-- /beacons-map__the-beacons -->
        
        
        <div data-role="popup" id="favorite__list" data-theme="a" data-overlay-theme="b">
          <div data-role="header" data-position="fixed" data-update-page-padding="false" data-fullscreen="true"> <!-- data-fullscreen="true" prevents padding-top incorrect change in row 12588 of jQM -->
            <h1><?php echo FAVORITE_BEACONS ?></h1>
            <a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-close ui-btn-icon-notext ui-btn-right ui-nodisc-icon"><?php echo CLOSE ?></a>
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
          <a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-close ui-btn-icon-notext ui-btn-right"><?php echo CLOSE ?></a>
          <img class="photopopup__img" src="" alt="Photo">
          <a href="#" class="abuse ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-info_outline ui-btn-icon-notext ui-btn-right"><?php echo ABUSE ?></a>
        </div>
        <div id="right_popup__region"></div>
        <div data-role="popup" id="create_beacon__geo_region"></div>

      </div>    <!-- /container -->
      
      <div id="footer" data-role="footer" data-position="fixed" data-update-page-padding="false" data-fullscreen="true" data-tap-toggle="false"> 
        <div data-role="navbar">
          <ul>
            <li><a href="#" id="btn__the-map" class="footer_buttons ui-btn-active"><?php echo MAP ?></a></li>
            <li><a href="#" id="btn__the-beacons" class="footer_buttons"><?php echo BEACONS ?></a></li>
          </ul>
        </div>
      </div>    <!-- /footer -->

      <div data-role="panel" id="left-panel" data-position="left" data-display="overlay" class="auth-panel" >
        <div class="panel-head">
          <div class="user-info">
            <div id = "menu_avatar" class="avatar"></div>
            <div class="username"><?php echo GUEST ?></div>
            <div class="email"></div>
          </div>
        </div>
        <ul class="menu">
          <li>
            <a class="main-menu ui-link" data-ajax="false" data-link = "menu-page" href="/main.html#menu-page"><?php echo MAIN_MENU ?></a>
          </li>
          <li>
            <a class="activities menu-icon-activities ui-link" data-ajax="false" data-link = "menu-page" href="/main.html#my-activities-page"><?php echo MY_ACTIVITIES ?></a>
          </li>
          <li>
            <a class="menu-icon-tasks ui-link" data-ajax="false" data-link = "menu-page" href="/main.html#my-tasks-page"><?php echo MY_TASKS ?></a>
          </li>
          <li>
            <a class="profile menu-icon-profile" data-ajax="false" href="#"><?php echo MY_PROFILE ?></a>
          </li>
          <li class="sep">
            &nbsp;
          </li>
          <li>
            <a class="menu-icon-help ui-link" data-ajax="false" data-link = "menu-page" href="/main.html#help"><?php echo HELP ?></a>
          </li>
          <li class="login">
            <a class="menu-icon-login ui-link" data-ajax="false" data-link = "menu-page" href="#"><?php echo LOGIN ?></a>
          </li>
          <li id='logout' class="logout">
            <a class="menu-icon-logout ui-link" data-ajax="false" data-link = "menu-page" data-prefetch="true" href="#"><?php echo LOGOUT ?></a>
          </li>
        </ul>
      </div>   <!-- /left-panel -->

      <div data-role="panel" id="right-panel" data-display="push" data-position="right" class="panel">
        <div data-role="tabs">
          <div data-role="navbar" class="navbar">
            <ul>
              <li><a href="#user_rating" data-ajax="false" data-icon="person" class="user_rating ui-btn-icon-notext ui-nodisc-icon ui-bar-inherit ui-bar ui-bar-a ui-btn-active ui-state-persist"><?php echo USER_RATING ?></a></li>
              <li><a href="#categories" data-ajax="false" data-icon="filter" class="categories ui-btn-icon-notext ui-nodisc-icon ui-bar-inherit ui-bar ui-bar-a"><?php echo CATEGORIES ?></a></li>
              <li><a href="#time_range" data-ajax="false" data-icon="schedule" class="time_range ui-btn-icon-notext ui-nodisc-icon ui-bar-inherit ui-bar ui-bar-a"><?php echo TIME_RANGE ?></a></li>
              <li><a href="#beacon_status" data-ajax="false" data-icon="progress_two" class="beacon_status ui-btn-icon-notext ui-nodisc-icon ui-bar-inherit ui-bar ui-bar-a"><?php echo BEACON_STATUS ?></a></li>
              <li><a href="#actions" data-ajax="false" data-icon="assignment_turned_in" class="actions ui-btn-icon-notext ui-nodisc-icon ui-bar-inherit ui-bar ui-bar-a"><?php echo ACTIONS ?></a></li>
            </ul>
          </div>
          <div id="user_rating" class="scrollable_content">
            <h4 class="filter_title"><?php echo AUTH_TITLE ?> </h4>
            <ul data-role="listview" class="listview">
              <li>
                <input type="checkbox" data-role="flipswitch" name="all" id="all" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch" checked>
                <label for="all"><?php echo ALL ?></label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="e-mail" id="e-mail" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch" checked>
                <label for="e-mail"><?php echo AUTH_EMAIL ?></label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="payments" id="payments" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch" checked>
                <label for="payments"><?php echo AUTH_PAYMENT ?></label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="bank-id" id="bank-id" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch" checked>
                <label for="bank-id"><?php echo AUTH_BANKID ?></label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="social_net" id="social_net" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch" checked>
                <label for="social_net"><?php echo AUTH_SOCIAL ?></label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="organisations" id="organisations" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch" checked>
                <label for="organisations"><?php echo AUTH_ORG ?></label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="co-owners" id="co-owners" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch" checked>
                <label for="co-owners"><?php echo AUTH_COOWNERS ?></label>
              </li>
            </ul>
          </div>
          <div id="categories" class="scrollable_content"></div>
          <div id="time_range" class="scrollable_content">
            <h4 class="filter_title"><?php echo BEACONS_SHOW ?>:</h4>
            <fieldset data-role="controlgroup">
              <input type="radio" name="radio-time" id="any" value="any">
              <label for="any"><?php echo LAST_ANY ?></label>
              <input type="radio" name="radio-time" id="last_hour" value="hour">
              <label for="last_hour"><?php echo LAST_HOUR ?></label>
              <input type="radio" name="radio-time" id="last_day" value="day">
              <label for="last_day"><?php echo LAST_DAY ?></label>
              <input type="radio" name="radio-time" id="last_week" value="week">
              <label for="last_week"><?php echo LAST_WEEK ?></label>
              <input type="radio" name="radio-time" id="last_month" value="month">
              <label for="last_month"><?php echo LAST_MONTH ?></label>
              <input type="radio" name="radio-time" id="last_hundred" value="hundred">
              <label for="last_hundred"><?php echo LAST_HUNDRED ?></label>
              <input type="radio" name="radio-time" id="last_year" value="year">
              <label for="last_year"><?php echo LAST_YEAR ?></label>
              <input type="radio" name="radio-time" id="custom_range" value="custom">
              <label for="custom_range"><?php echo CUSTOM_RANGE ?></label>
              <div class="date_picker">
                <div class="ui-field-contain">
                  <label for="low_limit"><?php echo FROM ?></label>
                  <input type="date" data-clear-btn="false" data-mini="true" name="low_limit" id="low_limit" value="" placeholder="<?php echo DATE_PLACEHOLDER ?>">
                </div>
                <div class="ui-field-contain">
                  <label for="hight_limit"><?php echo TO ?></label>
                  <input type="date" data-clear-btn="false" data-mini="true" name="hight_limit" id="hight_limit" value="" placeholder="<?php echo DATE_PLACEHOLDER ?>">
                </div>
              </div>
            </fieldset>
          </div>
          <div id="beacon_status" class="scrollable_content">
            <h4 class="filter_title"><?php echo BEACONS_SHOW_ONLY ?>:</h4>
            <ul data-role="listview" class="listview">
              <li>
                <input type="checkbox" data-role="flipswitch" name="new_beacons" id="new_beacons" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch">
                <label for="new_beacons"><?php echo BEACONS_NEW ?></label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="confirmed_beacons" id="confirmed_beacons" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch">
                <label for="confirmed_beacons"><?php echo BEACONS_CONFIRMED ?></label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="processing_beacons" id="processing_beacons" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch">
                <label for="processing_beacons"><?php echo BEACONS_PROCESSING ?></label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="closed_beacons" id="closed_beacons" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch">
                <label for="closed_beacons"><?php echo BEACONS_CLOSED ?></label>
              </li>
            </ul>
          </div>
          <div id="actions" class="scrollable_content">
            <h4 class="filter_title"><?php echo BEACONS_SHOW_ONLY_USERS ?>:</h4>
            <ul data-role="listview" class="listview">
              <li>
                <input type="checkbox" data-role="flipswitch" name="votings" id="votings" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch">
                <label for="votings"><?php echo VOTINGS ?></label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="programms" id="programms" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch">
                <label for="programms"><?php echo PROGRAMMS ?></label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="project_proposals" id="project_proposals" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch">
                <label for="project_proposals"><?php echo PROJECT_PROPOSALS ?></label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="projects" id="projects" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch">
                <label for="projects"><?php echo PROJECTS ?></label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="requests" id="requests" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch">
                <label for="requests"><?php echo REQUESTS ?></label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="requests" id="budget" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch">
                <label for="budget"><?php echo BUDGET ?></label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="requests" id="positive" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch">
                <label for="positive"><?php echo POSITIVE ?></label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="requests" id="negative" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch">
                <label for="negative"><?php echo NEGATIVE ?></label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="requests" id="info" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch">
                <label for="info"><?php echo IMPORTANT ?></label>
              </li>
              <li>
                <input type="checkbox" data-role="flipswitch" name="requests" id="sos" data-on-text="" data-off-text="" data-wrapper-class="custom-size-flipswitch">
                <label for="sos"><?php echo SOS ?></label>
              </li>
            </ul>
          </div>
        </div>
        
      </div>   <!-- /right-panel -->

    </div>    <!-- /beacons-map page -->


    <div data-role="page" data-dialog="true" id="login_dialog" data-close-btn="none" data-title="<?php echo ENTER ?>" class="page">
      <form id="login" action="https://gurtom.mobi/l/index.php?m=0" method="post">
        <div data-role="header">
          <a href="#" data-icon="close" class="history_back ui-btn ui-corner-all ui-icon-close ui-btn-icon-notext ui-btn-left"><?php echo CLOSE ?></a>
          <h1><?php echo ENTER ?></h1>
        </div>
        <div data-role="main" class="ui-content ui-grid-a">
          <div class="ui-block-a form">
            <input type="hidden" name="login" value="1">
            <label for="email_login"><?php echo EMAIL ?></label>
            <input id="email_login" type="email" name="user_name" placeholder="my-email@example.com" required>  <!--pattern="[a-zA-Zа-яіїєА-ЯІЇЄ0-9]{2,64}"-->
            <label for="user_password"><?php echo PASSWORD ?></label>
            <input id="user_password" type="password" name="user_password" pattern=".{6,}" required>
            <input class="submit" type="submit" value="<?php echo ENTER ?>">
          </div>
          <div class="ui-block-b">
            <div class="custom-border-radius">
              <h5><?php echo ENTER_SOCIAL ?></h5>
              <a href="#" data-ajax="false" class="google_plus_login gp ui-btn ui-icon-google_plus ui-btn-icon-notext ui-nodisc-icon ui-corner-all">Google+</a>
              <a href="#" data-ajax="false" class="facebook_login ui-btn ui-icon-facebook ui-btn-icon-notext ui-nodisc-icon ui-corner-all">Facebook</a>
              <a href="#" data-ajax="false" class="linkedin_login ui-btn ui-icon-linkedin ui-btn-icon-notext ui-nodisc-icon ui-corner-all">LinkedIn</a>
            </div>
            <a href="#" class="registration ui-btn ui-input-btn ui-corner-all ui-shadow"><?php echo QUESTION_FIRST_TIME ?></a>
            <a href="#" class="restore_pass ui-btn ui-input-btn ui-corner-all ui-shadow"><?php echo QUESTION_RESTORE_PASSWORD ?></a>
          </div>
          <a href="https://goo.gl/bZZkoL" target="_blank" class="org ui-btn ui-corner-all" rel="noopener"><?php echo REGISTER_CORPORATE ?></a>
        </div>
      </form>
    </div>

    <div data-role="page" data-dialog="true" id="registration_dialog" data-close-btn="none" data-title="<?php echo REGISTER ?>" class="page">
      <div data-role="header" data-position="fixed">
        <a href="#" data-icon="close" class="history_back ui-btn ui-corner-all ui-icon-close ui-btn-icon-notext ui-btn-left"><?php echo CLOSE ?></a>
        <h1><?php echo REGISTER ?></h1>
      </div>
      <form action="https://gurtom.mobi/l/index.php?m=4" id="registration" method="POST">
        <div data-role="main" class="form">
          <div class="ui-content ui-grid-a">
            <div class="ui-block-a">
              <label for="login"><?php echo NICKNAME ?></label>
                <input id="login" type="text" name="user_name" placeholder="<?php echo NICKNAME ?>" pattern="[a-zA-Z0-9]{2,64}" required>
              <label for="email"><?php echo EMAIL ?></label>
                <input id="email" type="email" name="user_email" placeholder="email@example.com" required>
            </div>
            <div class="ui-block-b">
              <label for="password"><?php echo PASSWORD ?></label>
                <input id="password" type="password" name="user_password_new" pattern=".{6,}" required>
              <label for="password-repeat"><?php echo PASSWORD_REPEAT ?></label>
                <input id="password-repeat" type="password" name="user_password_repeat" pattern=".{6,}" required>
            </div>
            <hr>
            <input type="hidden" name="register" value="Register">
            <div class="g-recaptcha" data-size="compact" data-sitekey="6Le4yCITAAAAAPRq84f8ZkuWD5oSdmAvGlfPCx6P"></div>
          </div>
          <input class="submit" type="submit" name="login" value="<?php echo REGISTER_NOW ?>"  data-wrapper-class="submit__wrapper">
        </div>
      </form>
    </div>

    <div data-role="page" data-dialog="true" id="restore_pass_dialog" data-close-btn="none" data-title="<?php echo RESTORE ?>" class="page">
      <div data-role="header">
        <a href="#" data-icon="close" class="history_back ui-btn ui-corner-all ui-icon-close ui-btn-icon-notext ui-btn-left"><?php echo CLOSE ?></a>
        <h1><?php echo RESTORE_PASSWORD ?></h1>
      </div>
      <div data-role="main" class="ui-content">
        <div class="form">
          <label for="email-rest"><?php echo EMAIL ?></label>
          <input id="email-rest" type="email" name="email-rest">
          <input class="submit" type="submit" name="login" value="<?php echo RESTORE ?>">
        </div>
      </div>
    </div>

    <div data-role="page" data-dialog="true" id="reset_pass_dialog" data-close-btn="none" data-title="<?php echo PASSWORD_RESET ?>" class="page">
      <div data-role="header">
        <a href="#" data-icon="close" class="history_back ui-btn ui-corner-all ui-icon-close ui-btn-icon-notext ui-btn-left"><?php echo CLOSE ?></a>
        <h1><?php echo PASSWORD_RESET ?></h1>
      </div>
      <div data-role="main" class="ui-content">
        <div class="form">
          <label for="password_reset"><?php echo PASSWORD ?></label>
          <input id="password_reset" type="password" name="password_reset" pattern=".{6,}">
          <label for="password_reset-repeat"><?php echo PASSWORD_REPEAT ?></label>
          <input id="password_reset-repeat" type="password" name="password_reset-repeat" pattern=".{6,}">
          <input class="submit" type="submit" name="login" value="<?php echo PASSWORD_RESET_NOW ?>">
        </div>
      </div>
    </div>

    <span class='warning'><h2><?php echo PROTOTYPE ?></h2></span>

    <div class="profile_page__wrapper"></div>


    <script id="object_create_tpl" type="text/template">
        <div data-role="header" class="header">
          <h4><%-titler%></h4>
          <% if(parent_id !== '') { %>
            <h4 class="follower"><?php echo BEACON_RELATED ?></h4>
          <% } %>
          <% if(targetId !== '') { %>
            <h4 class="follower"><?php echo AS_COPY_OF_BEACON ?></h4>
          <% } %>
          <a href="#" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-close ui-btn-icon-notext ui-btn-right ui-nodisc-icon"><?php echo CLOSE ?></a>
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
              <label for="submit_btn" class="ui-hidden-accessible"><?php echo CREATE ?></label>
              <button id="submit_btn" type="submit"><?php echo CREATE ?></button>
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
          <h6><?php echo REQUIRED_FIELDS ?></h6>
        </div>
    </script>
    <!-- /object_create_tpl -->
    <script id="latlng__tpl" type="text/template">
        <input id="lat" type="hidden" name="lat" value="<%- lat %>">
        <input id="lng" type="hidden" name="lng" value="<%- lng %>">
        <input id="b_type" type="hidden" name="b_type" value="<%- b_type %>">
        <p class='lat_lng'>
          <img class="marker_img" src="<%- icon_url %>" alt="marker">
          <?php echo COORDINATES ?> <%- (''+lat).replace('.', ',') %>&deg <?php echo LAT ?>; <%- (''+lng).replace('.', ',') %>&deg <?php echo LNG ?> <?php echo MESSAGE_CAN_MOVE_BEACON ?>
          <% if(+window.state.user.gov > 0){ %> <?php echo LAYER ?>: <%- name %>.<% } %>
        </p>
    </script>
    <script id="title__tpl" type="text/template">
      <label for="title"><strong><?php echo TITLE ?>&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></strong></label>
      <input id="title" type="text" name="title" <%-required%>>
    </script>
    <script id="money__tpl" type="text/template">
      <fieldset id="money" class="ui-field-contain" data-role="controlgroup" data-type="horizontal">
        <legend><strong><%- ( label ? label : '<?php echo REQUIRED_AMOUNT ?>' ) %>&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></strong></legend>
        <input id="amount" type="number" name="amount" pattern=".{12,}" value="<%-parent_amount%>" <%-required%>>
        <label for="currency"><?php echo IN_CURRENCY ?></label>
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
        <label for="currency_only__select"><strong><?php echo CHOOSE_CURRENCY ?></strong></label>
        <select name="curr" id="currency_only__select" data-iconpos="noicon" data-native-menu="false">
          <option value="980" selected>UAH</option>
          <option value="1980">vUAH</option>
          <option value="840">USD</option>
          <option value="978">EUR</option>
          <option value="1">ICAN</option>
        </select>
    </script>
    <script id="start_date__tpl" type="text/template">
      <label for="start_date__input"><strong><%- ( label ? label : '<?php echo FUNDING_PERIOD ?>' ) %>&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></strong></label>
      <input id="start_date__input" type="date" data-clear-btn="false" name="dtst" value="" placeholder="<?php echo DATE_PLACEHOLDER ?>" <%-required%>>
    </script>
    <script id="end_date__tpl" type="text/template">
        <label for="end_date__input"><strong><%- ( label ? label : '<?php echo FUNDING_FINISH ?>' ) %>&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></strong></label>
        <input id="end_date__input" type="date" data-clear-btn="false" name="dtex" value="" placeholder="<?php echo DATE_PLACEHOLDER ?>" <%-required%>>
    </script>
    <script id="beneficiar__tpl" type="text/template">
        <label for="beneficiar_name"><strong><?php echo SELECT_BENEFICIARY ?>&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></strong></label>
        <input id="beneficiar_name" type="text" name="ben" pattern=".{100,}" <%-required%>>
    </script>
    <script id="nco__tpl" type="text/template">
      <p><strong><?php echo NCO_BID ?>&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></strong></p>
      <h6><?php echo MESSAGE_AUTOCOMPLITE ?></h6>
      <form class="ui-filterable" autocomplete="off">
        <input id="nco__autocomplete-input" data-type="search" placeholder="<?php echo CHOOSE_NCO ?>" data-wrapper-class="input" autocomplete="off">
      </form>
      <ul id="nco__ul" data-role="listview" data-inset="true" data-filter="true" data-filter-reveal="true" data-input="#nco__autocomplete-input"></ul>
    </script>
    <script id="description_tpl" type="text/template">
      <label for="description"><strong><?php echo DESCRIPTION_FULL ?>&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></strong></label>
      <textarea id="description" name="descr" placeholder="<?php echo DESCRIPTION_PLACEHOLDER ?>" cols="40" rows="2" maxlength="10000" <%-required%>><%-parent_descr%></textarea>
    </script>

    <script id="response_tpl" type="text/template">
      <p><strong><?php echo RESPONSE_EXPECTED ?></strong></p>
      <input type="text" data-clear-btn="true" name="response" id="response__input" value="" placeholder="<?php echo RESPONSE_TYPE ?>">
    </script>
    <script id="details_tpl" type="text/template">
      <label for="details"><strong><?php echo DETAILS ?>&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></strong></label>
      <textarea id="details" name="details" placeholder="<?php echo DETAILS_PLACEHOLDER ?>" cols="40" rows="2" maxlength="240" data-wrapper-class="textarea" <%-required%>></textarea>
    </script>
    <script id="private_tpl" type="text/template">
        <div class="public_private_switch ui-content" data-role="content">
          <label for="public_private_switch__input" class=" ui-hidden-accessible"><?php echo FLIP_TOGGLE_SWITCH_CHECKBOX ?></label>
          <input type="checkbox" data-role="flipswitch" name="public_private_switch__input" id="public_private_switch__input" data-on-text="<?php echo FOR_GROUP ?>" data-off-text="<?php echo MESSAGE_PUBLIC ?>" data-wrapper-class="public_private_switch__flipswitch">
        </div>
        <div id="select_group">
          <p><strong><?php echo SELECT_GROUP ?></strong></p>
          <h6><?php echo MESSAGE_AUTOCOMPLITE ?></h6>
          <form class="ui-filterable" autocomplete="off">
            <input id="select_group__autocomplete-input" data-type="search" placeholder="<?php echo GROUP_NAME_PLACEHOLDER ?>" data-wrapper-class="input">
          </form>
          <ul id="select_group__autocomplete" data-role="listview" data-inset="true" data-filter="true" data-input="#select_group__autocomplete-input"></ul>
        </div>
    </script>

    <script id="tag_tpl" type="text/template">
      <p><strong><?php echo TAG_ADD ?>&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></strong></p>
      <p id="tag_storage"></p>
      <h6><?php echo MESSAGE_AUTOCOMPLITE ?> <?php echo PRESS_ENTER ?></h6>
      <form action="">
        <input id="add_tag__input" data-type="search" placeholder="<?php echo ADD_TAG_PLACEHOLDER ?>" data-wrapper-class="input" title="<?php echo MESSAGE_ONLY_LETTERS_DIGITS ?>" autocomplete="off">
      </form>
      <ul id="add_tag__ul" data-role="listview" data-inset="true" data-filter="true" data-input="#add_tag__input"></ul>
    </script>

    <script id="photo_tpl" type="text/template">
      <div class="hiddenfile">
        <label for="photo__input"><?php echo PHOTO_UPLOAD ?></label>
        <input id="photo__input" type="file" data-clear-btn="true" name="photo__input" accept="image/*">
      </div>
      <div class="preview_wrapper clearfix">
        <div id="photo__preview"></div>
        <button id="photo__remove" class="ui-input-clear ui-btn ui-icon-delete ui-btn-icon-notext ui-corner-all"></button>
      </div>
      <button id="photo__choose_file"><?php echo PHOTO_CHOOSE_FILE ?>&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></button>
    </script>
    <script id="phone_tpl" type="text/template">
      <label for="phone_num__input"><strong><?php echo PHONE_NUMBER ?>&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></strong></label>
      <input type="tel" data-clear-btn="true" name="phone" id="phone_num__input" value="" placeholder="380ХХХХХХХХХХ" data-wrapper-class="input" <%-required%>>
    </script>
    <script id="admin_level__tpl" type="text/template">
      <label for="admin_level__select"><strong><?php echo ADMIN_LEVEL_SELECT ?>&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></strong></label>
      <select name="admin_level" id="admin_level__select" data-iconpos="noicon">
        <option value="3" selected><?php echo ADMIN_LEVEL_CITY ?></option>
        <option value="4"><?php echo ADMIN_LEVEL_CITY_DISTRICT ?></option>
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
        <label for="age_from"><strong><?php echo AGE_RANGE ?></strong></label>
        <input class="age_range" type="range" name="age_from" id="age_from" min="12" max="99" value="21">
        <label for="age_to"></label>
        <input class="age_range" type="range" name="age_to" id="age_to" min="13" max="100" value="60">
      </div>
    </script>
    <script id="support__tpl" type="text/template">
      <label for="support__input"><strong><?php echo MIN_SUPPORT_VOTES ?>&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></strong></label>
      <input id="support__input" type="number" data-clear-btn="false" name="sprt" value="" placeholder="100" <%-required%>>
    </script>
    <script id="support_finish_date__tpl" type="text/template">
        <label for="support_finish_date__input"><strong><?php echo SUPPORT_FINISH_DATE ?>&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></strong></label>
        <input id="support_finish_date__input" type="date" data-clear-btn="false" name="sprtf" value="" placeholder="<?php echo DATE_PLACEHOLDER ?>" <%-required%>>
    </script>
    <script id="sphere_title__tpl" type="text/template">
      <h3><?php echo CHOOSE_SPHERE ?></h3>
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
            <div class="ui-btn-left ui-icon-<% if(full){ %>close<% } else { %><%-source%><% } %> ui-btn-icon-notext ui-btn-inline"><?php echo LEFT_ICON ?></div>
          <% } else { %>
            <img src="<%- icon_url %>" alt="icon" class="ui-btn-left ui-btn-icon-notext ui-btn-inline">
          <% } %>
          
          <div class="beacon-header">
            <h6><?php echo FROM ?>: <span><%- author_name %></span>, ID <%- author_id %></h6>                                                                     
            <div class="content-with-icon">
              <span class="icon ui-btn-left ui-icon-schedule ui-btn-icon-notext ui-btn-inline ui-nodisc-icon"><?php echo ICON ?></span>
              <p><%- ts %>; cardID <%- id %></p>                                                
            </div>
          </div>
          <a href="#" data-rel="popup" data-transition="slideup" data-position-to="#beacons-map__the-beacons" class="beacon_status <%- color %> ui-btn ui-corner-all ui-btn-right ui-btn-inline ui-icon-progress_<% if(b_status===0){ %>empty<% } else if(b_status===1){ %>one<% } else if(b_status===2){ %>two<% } else if(b_status===3){ %>full<% } %> ui-btn-icon-notext"><?php echo STATUS ?></a>
        </div>
        <div data-role="content" class="beacon-content clearfix">
          <h3><%- title %></h3>
          <p><img class="photo" src="<%-b_img%>" alt="<?php echo PHOTO ?>"><strong><%- details %></strong></p>
          <p class="tags"><%- tagList %></p>
          <div class="expanding_view click_transparent">
            <div class="btn_wrapper ui-input-btn ui-btn ui-icon-more_horiz ui-btn-icon-notext ui-btn-right">
              <input class="expanding_btn ui-btn" type="button" data-enhanced="true" value="<?php echo ENHANCED_ICON_ONLY ?>">
            </div>
          </div>
        </div>
        <div data-role="navbar" class="navbar">
          <ul >
            <li><button class="share ui-icon-share ui-btn-icon-notext ui-nodisc-icon ui-bar-inherit ui-bar ui-bar-a ui-btn ui-btn-icon-top"><?php echo SHARE ?></button></li>
            <li>
              <button class="link ui-icon-<%-link_icon%> ui-btn-icon-notext ui-nodisc-icon ui-bar-inherit ui-bar ui-bar-a ui-btn ui-btn-icon-top"><?php echo LINK ?></button>
              <% if(showBreakLinkBtn){ %>
                <button class="break_link ui-icon-break_link ui-btn-icon-notext ui-nodisc-icon ui-bar-inherit ui-bar ui-bar-a ui-btn ui-btn-icon-top"><?php echo LINK ?></button>
              <% } %>
            </li>
            <li><button class="error ui-icon-error_outline ui-btn-icon-notext ui-nodisc-icon ui-bar-inherit ui-bar ui-bar-a ui-btn ui-btn-icon-top"><?php echo DISPROVE ?></button></li>
            <li><button class="star ui-icon-star-<% if (+favorite) { %>full<% } else { %>empty<% } %> ui-btn-icon-notext ui-nodisc-icon ui-bar-inherit ui-bar ui-bar-a ui-btn ui-btn-icon-top"><?php echo ADD_TO_FAVORITE ?></button></li>
            <li><button class="add_linked ui-icon-add_link ui-btn-icon-notext ui-nodisc-icon ui-bar-inherit ui-bar ui-bar-a ui-btn ui-btn-icon-top"><?php echo ADD_NEW ?></button></li>
          </ul>
        </div>
        <div id="chat_region"></div>
      </div>
    </script>

    <script id="chat_tpl" type="text/template">
      <div class="input-message ui-field-contain">
        <label for="text-message" class="ui-hidden-accessible"><?php echo SEND ?></label>
        <input type="text" data-clear-btn="true" data-mini="true" name="text-message" id="text-message" value="" placeholder="<?php echo MESSAGE_PLACEHOLDSER ?>">
        <button class="input-message__send ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-send ui-btn-icon-notext ui-btn-a"><?php echo POST ?></button>
      </div>
      <div class="sent-message__wrapper"></div>
    </script>

    <script id="beacon_list_is_empty_tpl" type="text/template">
      <h3 class="empty_beacon_list"><?php echo EMPTY_BEACON_LIST ?></h3>
    </script>
    
    <script id="sos_extention_view_tpl" type="text/template">
      <p class="phone_view"><span ><?php echo PHONE ?></span>   <%- phone %>   </p>
    </script>

    <script id="chat_item_view_tpl" type="text/template">
      <p><img src="<%-avatar%>" alt="avatar">(<%- user_id %>) <span class="nickname"><%- user_name %>: </span><%- text %></p>
      <p class="date"><%- ts %><button class="abuse-spam ui-shadow ui-btn ui-corner-all ui-btn-inline ui-btn-right ui-icon-error_outline ui-btn-icon-notext ui-btn-a"><?php echo ABUSE_SPAM ?></button></p>
    </script>

    <script id="expand_to_p-budget__tpl" type="text/template">
      <p class="money"><?php echo PROJECT_COST ?>: <strong><%- amount %> <%- lib.currency.getName(curr) %></strong></p>
      <p class="descript"><?php echo DESCRIPTION_FULL_PROJECT ?>: <strong><%- descr %></strong></p>
    </script>
    <script id="expand_to_voting__tpl" type="text/template">
      <p class="voting"><?php echo SUPPORTED_VOTES ?></p>
      <p class="voting"><?php echo SUPPORT_LAST_DATE?>: <strong><%- sprtF %></strong>.</p>
      <p class="voting"><?php echo VOTE_START_DATE ?>: <strong><%- offerStartTime %></strong>.</p>
      <p class="voting"><?php echo VOTE_FINISH_DATE ?>: <strong><%- offerFinishTime %></strong>.</p>
      <p class="voting"><?php echo VOTE_SPHERE ?>: <strong><%- sphereStr %></strong>.</p>
      <p class="voting"><?php echo VOTE_STATUS ?>: <strong><%- v_status %></strong></p>
      <p class="voting"><?php echo DESCRIPTION_FULL ?>: <br><strong><%- descr %></strong></p>
      <a href="<%- discussion_link %>" class="discussion_btn ui-btn ui-corner-all ui-icon-twitter ui-btn-icon-left ui-mini" target="_blank"><?php echo VOTE_DESCUSSION ?></a>
      <hr>
      <p class="voting"><?php echo YOUR_AUTH_LEVEL ?>: <strong>"<%- votingStatus %>".</strong></p>
      <p class="voting"><?php echo YOUR_STATUS ?>: <strong><%- usr_status %></strong></p>
      <div class="voting_btns"></div>
      <div class="voting_results__region"></div>
      <div class="indicative_voting__region"></div>
    </script>
    <script id="voting_support__tpl" type="text/template">
      <a href="#" class="ui-btn ui-corner-all" id="voting_support__btn"><%- btn_support %></a>
    </script>
    <script id="voting_buttons__tpl" type="text/template">
      <div class="ui-field-contain">
        <label for="flip-vote_type"><?php echo VOTE_NOW ?>:</label>
        <input type="checkbox" data-role="flipswitch" name="flip-vote_type" id="flip-vote_type" data-on-text="<?php echo VOTE_ANONYMOUS ?>" data-off-text="<?php echo VOTE_OPEN ?>" data-wrapper-class="voting-flipswitch">
      </div>
      <ul>
        <li><a href="#" class="voting_button voting_button__no <%- no %>"><?php echo VOTE_NO ?></a></li>
        <li><a href="#" class="voting_button voting_button__abstain <%- abstain %>"><?php echo VOTE_ABSTAIN ?></a></li>
        <li><a href="#" class="voting_button voting_button__yes <%- yes %>"><?php echo VOTE_YES ?></a></li>
      </ul>
      <hr>
    </script>
    
    <script id="voting_results__title__tpl" type="text/template">
      <h2 class="title"><%- title %></h2>
      <div class="ui-checkbox ui-state-<%-disabled%>" style="<%- hide %>">
        <label for="percent_checkbox" class="percents ui-btn ui-corner-all ui-btn-inherit ui-btn-icon-left ui-checkbox-off"><?php echo IN_PERCENTS ?></label>
        <input type="checkbox" name="percent_checkbox" id="percent_checkbox" data-enhanced="true" <%- disabled %>>
      </div>
      <div class="subtitles">
        <p class="subtitle total"><?php echo TOTAL ?></p>
        <p class="subtitle minus"><?php echo VOTE_NO ?></p>
        <p class="subtitle plus"><?php echo VOTE_YES ?></p>
        <p class="subtitle abst"><?php echo VOTE_ABSTAIN ?></p>
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
      <p class="project"><?php echo PROGRAM_DESCRIPTION ?>:<br><%= description %></p>
      <p class="project"><?php echo PROGRAM_ID ?>: <strong><%- id %></strong></p>
      <a href="<%- discussion_link %>" class="discussion_btn ui-btn ui-corner-all ui-icon-twitter ui-btn-icon-left" target="_blank"><?php echo PROGRAM_DISCUSSION ?></a>
      <p class="project"><?php echo NUMBER_OF_PP ?>: <strong><%- pp %>.</strong> <a href="#" class="pp_list ui-btn ui-corner-all ui-btn-inline ui-mini"><?php echo PP_LIST ?></a></p>
      <hr>
      <div class="funds"></div>
      <hr>
      <div class="contribution"></div>
      <hr>
      <a href="#" class="donate ui-btn ui-corner-all ui-icon-add ui-btn-icon-left"><?php echo DONATE ?></a>
    </script>

    <script id="objects2-5_full_view" type="text/template">
      <p class="project"><%- subject_description_title %>:<br><%- description %></p>
      <p class="project"><%- subject_id %>: <strong><%- id %></strong></p>
      <% if( type === "3" ){ %>
        <p class="project">
          <?php echo TO_PROGRAM ?>: <%- program_id %>
          <a href="<%- program_link %>" target="_blank"><strong> <%- program_title %> </strong></a>
        </p>
      <% } %>
      <% if( type === "5" ){ %>
        <p class="project"><?php echo BENEFICIARY ?>: <strong> <%- beneficiary %>.</strong></p>
      <% } %>
      <% if( +type >= 3 && +type <= 5 ){ %>
        <p class="project"><?php echo SUM_REQUESTED ?>: <strong> <%- amount_asking %> <%- currency %>.</strong></p>
      <% } %>
      <% if( dt_expired && dt_expired != '0000-00-00 00:00:00' ){ %>
        <p class="project"><%- subject_expiration %>: <strong> <%- dt_expired %>.</strong></p>
      <% } %>
      <% if( ts_closed && ts_closed != '0000-00-00 00:00:00' ){ %>
        <p class="project"><%- closed %> <strong> <%- ts_closed %>.</strong></p>
      <% } %>
      <% if( discussion_link ){ %>
        <a href="<%- discussion_link %>" class="discussion_btn ui-btn ui-corner-all ui-icon-twitter ui-btn-icon-left" target="_blank"><%- subject_discussion %></a>
      <% } %>
      <% if( type === "2" ){ %>
        <p class="project"><?php echo NUMBER_OF_PP ?>: <strong><%- pp %>.</strong> <a href="#" class="pp_list ui-btn ui-corner-all ui-btn-inline ui-mini"><?php echo PP_LIST ?></a></p>
      <% } %>
      <hr>
      <div class="funds"></div>
      <hr>
      <div class="contribution"></div>
      <button class="donate ui-btn ui-corner-all ui-icon-add ui-btn-icon-left"><?php echo DONATE ?></button>
      <!--<a href="#" class="donate ui-btn ui-corner-all ui-icon-add ui-btn-icon-left"><?php echo DONATE ?></a>-->
      <div class="nco"></div>
    </script>

    <script id="admin_nco_view" type="text/template">
      <h3><%- subject_administration %></h3>
      <% if( nco_acceptance === 0 && nco_id === 0 ){ %>
        <p class="project"><?php echo NCO_NOT_SELECTED_BY_AUTHOR ?></p>
      <% } %>
      <% if( nco_acceptance === 0 && nco_id !== 0 ){ %>
        <p class="project"><?php echo NCO_SELECTED_BY_AUTHOR ?>
          <strong> <%- ncoName %> </strong>
        </p>
      <% } %>
      <div class="nco_choise"></div>
      <% if( nco_acceptance === 0 && nco_bids.length === 0 ){ %>
        <p class="project"><%- no_nco %></p>
      <% } %>
      <% if( nco_acceptance !== 0 ){ %>
        <p class="project"><%- nco_defined %></p>
      <% } %>
      <% if( nco_acceptance === 0 && nco_bids.length !== 0 ){ %>
        <p class="project"><%- nco_list %>:</p>
      <% } %>
      <div class="nco_list"></div>
      <% if( showNcoBtn ){ %>
        <button class="nco_decision"> <%- txt %></p>
      <% } %>
    </script>

    <script class="nco_wants_admin" type="text/template">
      <label class="project"> <%- item.nco_name %></label>
      <% if( authorBtn ){ %>
        <button class="accept" data-mini="true"><?php echo ACCEPT_PROPOSAL ?></p>
      <% } %>
      <% if( ncoBtn ){ %>
        <button class="withdraw" data-mini="true"><%- ncoBtnText %></p>
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
          <a href="#" class="withdraw ui-btn ui-icon-block ui-corner-all ui-btn-icon-left ui-mini ui-btn-inline" title="<?php echo CALL_OFF ?>"><?php echo CALL_OFF ?></a>
        <% } %>
      </td>
    </script>

    <script id="create_beacon__geo_tpl" type="text/template">
      <div data-role="header" class="header">
        <a href="#" class="settings ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-settings ui-btn-icon-notext ui-btn-left ui-nodisc-icon"><?php echo CLOSE ?></a>
        <h1><%- title %></h1>
        <a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-close ui-btn-icon-notext ui-btn-right ui-nodisc-icon"><?php echo CLOSE ?></a>
      </div>
      <div data-role="main" class="listview_wrapper">
        <ul data-role="listview" class="listview"></ul>
        <h4 class="info"><?php echo BEACON_CREATE_MESSAGE ?></h3>
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
        <h1><?php echo BEACON_STATUS ?></h1>
        <a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-close ui-btn-icon-notext ui-btn-right ui-nodisc-icon"><?php echo CLOSE ?></a>
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
        <a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-close ui-btn-icon-notext ui-btn-right ui-nodisc-icon"><?php echo CLOSE ?></a>
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
        <h1><?php echo CHANGE_MENU ?></h1>
        <a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-close ui-btn-icon-notext ui-btn-right ui-nodisc-icon"><?php echo CLOSE ?></a>
      </div>
      <div data-role="main" class="listview_wrapper ui-content">
        <ul id="change_gov_menu_list" class="listview" data-role="listview"></ul>
        <button class="add ui-btn ui-corner-all"><?php echo ADD_MORE ?></button>
        <button class="save ui-btn ui-corner-all"><?php echo SAVE ?></button>
      </div>
    </script>
    <script id="change_gov_menu_item__tpl" type="text/template">
      <input type="hidden" class="change_gov_menu__layer" name="layer_type" value="<%- layer_type %>">
      <div class="change_gov_menu__input_wrapper ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset">
        <input class="change_gov_menu__input" type="text" data-enhanced="true" data-clear-btn="false" name="text-enhanced" id="text-enhanced" value="<%- name %>" placeholder="<?php echo ADD_LAYER_TITLE ?>">
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
          <button class="close ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-close ui-btn-icon-notext ui-btn-right ui-nodisc-icon"><?php echo CLOSE ?></button>
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
          <h6><?php echo REQUIRED_FIELDS ?></h6>
          <div id="donate__submit" class="submit">
            <label for="submit_btn" class="ui-hidden-accessible"><?php echo DONATE ?></label>
            <button id="submit_btn" type="submit"><?php echo DONATE ?></button>
          </div>
        </div>
    </script>

    <script id="email_input__tpl" type="text/template">
      <div class="ui-field-contain">
        <label for="email_input"><strong><?php echo YOUR_EMAIL ?>:&nbsp<% if(required=='required'){ %>*<% } else { %><% } %></strong></label>
        <input class="email_input" type="email" name="email" id="email_input" placeholder="your@email.com" value="<%- email %>">
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
          <span class="ui-collapsible-heading-status"><?php echo CLICK_TO_EXPAND_CONTENTS ?></span>
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
      <h4 class="filter_title"><?php echo BEACONS_OF_CORPS_SHOW ?>:</h4>
      <div class="selected_layers"></div>
      <div class="search_wrapper"></div>
      <div class="unselected_layers"></div>
    </script>
     
    <script id="map_search__tpl" type="text/template">
      <input data-wrapper-class="wrapper_map_search" type="<%- inputType %>" data-type="search" name="map_search" id="map_search" placeholder="<%- placeholder %>" data-enhanced="true" value="<%- value %>" autofocus>
      <a href="#" tabindex="-1" aria-hidden="true" class="ui-input-clear ui-btn ui-icon-delete ui-btn-icon-notext ui-corner-all ui-input-clear-hidden" title="<?php echo CLEAR_TEXT ?>"><?php echo CLEAR_TEXT ?></a>
      <a href="#" tabindex="-2" class="ui-input-close ui-btn ui-icon-close ui-btn-icon-notext ui-corner-all" title="<?php echo CLOSE_INPUT ?>"><?php echo CLOSE_INPUT ?></a>
    </script>

    <script id="profile_popup__tpl" type="text/template">
      <div data-role="header" class="header">
        <h1><?php echo YOUR_PROFILE ?></h1>
        <a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-close ui-btn-icon-notext ui-btn-right ui-nodisc-icon"><?php echo CLOSE ?></a>
      </div>
      <div data-role="main" class="listview_wrapper">
        <div class="profile_info clearfix">
          <img class="avatar" src="<%- avatarSrc %>" alt="Photo">
          <p class="name"><strong><?php echo NAME ?>:</strong> <%- name %> </p>
          <p class="name"><strong><?php echo NICKNAME ?>:</strong> <%- login %> </p>
          <p class="name"><strong>id:</strong> <%- id %> </p>
        </div>
        <p class="name"><strong>email:</strong> <%- email %> </p>
        <div class="address">
          <p class="address_title"><?php echo YOUR_VOTING_ADDRESSES ?>:</p>
          <ul class="address_list"></ul>
        </div>
      </div>
    </script>

    <script id="clipboard__tpl" type="text/template">
      <% if( on_supply == 0 && on_demand == 0 || isExpanded || isLinking) { %>
        <div class="clipboard_title"><%- clipboardTitle %></div>
        <% if(isExpanded || isLinking){ %>
          <div class="ui-btn-left ui-icon-close ui-btn-icon-notext ui-btn-inline"></div>
        <% } %>
      <% } %>
      <div class="linking_parent__region my-responsive ui-grid-a clearfix"></div>
      <% if(isLinking){ %>
        <button class="make_link ui-btn ui-corner-all ui-icon-add_link ui-btn-icon-left">Link with:</button>
      <% } %>
      <% if(!isLinking && (on_supply > 0 || on_demand > 0 || isExpanded)) { %>
        <div class="demand">
          <span class="demand_label"><%- demand_title %>: </span>
          <span class="collected"><%- on_demand %></span>
          <% if( on_demand > 0 ) { %>
            <a href="#" aria-hidden="true" class="demand_clear ui-input-clear ui-btn ui-icon-delete ui-btn-icon-notext ui-corner-all ui-input-clear-hidden ui-btn-inline ui-mini" title="<?php echo CLEAR_TEXT ?>"><?php echo CLEAR_TEXT ?></a>
          <% } %>
        </div>
        <div class="supply">
          <span class="supply_label"><%- supply_title %>: </span>
          <span class="collected"><%- on_supply %></span>
          <% if( on_supply > 0 ) { %>
            <a href="#" aria-hidden="true" class="supply_clear ui-input-clear ui-btn ui-icon-delete ui-btn-icon-notext ui-corner-all ui-input-clear-hidden ui-btn-inline ui-mini" title="<?php echo CLEAR_TEXT ?>"><?php echo CLEAR_TEXT ?></a>
          <% } %>
        </div>
      <% } %>
      <div >
        <div class="clipboard__full-view empty"></div>
        <div class="clipboard_collection ui-grid-a my-responsive ui-nodisc-icon"></div>
        <% if(isLinking){ %>
          <p class="clipboard__help"><%- help %></p>
        <% } %>
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

    <script src="/static/js/vendor/json2.js"></script>
    <script src="/static/js/vendor/underscore-min.js"></script>
    <script src="/static/js/vendor/jquery-1.11.1.min.js"></script>
    <script>
      $(document).on("mobileinit", function () {
        $.mobile.hashListeningEnabled = false;
        $.mobile.pushStateEnabled = false;
        $.mobile.changePage.defaults.changeHash = false;
        $.mobile.ajaxEnabled=false;
      });
    </script>
    <script src="/static/js/vendor/jquery.mobile-1.4.5.min.js"></script>
    <script src="/static/js/vendor/backbone-min.js"></script>
    <script src="/static/js/vendor/backbone.marionette.min.js"></script>
    <script src="/static/js/showMap.js"></script>
    <script src="/static/js/init.js"></script>
    <script src="/static/js/jQM_tweaks.js"></script>
    <script src="/static/js/filtersService.js"></script>
    <script src="/static/js/router.js"></script>
    <script src="/static/js/beaconBriefCardsList.js"></script>
    <script src="/static/js/beaconsCreatePopupMenu.js"></script>
    <script src="/static/js/beaconCreateView.js"></script>
    <script src="/static/js/beaconFullView.js"></script>
    <script src="/static/js/govEditBeaconCreatePopupMenu.js"></script>
    <script src="/static/js/beaconChangeStatusMenu.js"></script>
    <script src="/static/js/payByCardPopup.js"></script>
    <script src="/static/js/donate.js"></script>
    <script src="/static/js/clipboard.js"></script>
    <script src="/static/js/controller.js"></script>
    <script src="/static/js/authentification_manager.js"></script>
    <script src="/static/js/fourthFilter.js"></script>
    <script src="/static/js/shareInSocialNet.js"></script>
    <script src="/static/js/mapSearch.js"></script>
    <script src="/static/js/profilePopup.js"></script>
    <!--<script>
      'use strict';   //  https://github.com/GoogleChrome/sw-precache/blob/master/demo/app/js/service-worker-registration.js#L20
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register('/sw.js').then(function(reg) {
            console.log('ServiceWorker succesfully registered')
            // updatefound is fired if sw.js changes.
            reg.onupdatefound = function() {
              var installingWorker = reg.installing;
              installingWorker.onstatechange = function() {
                switch (installingWorker.state) {

                  case 'installed':
                    if (navigator.serviceWorker.controller) {
                      console.log('New or updated content is available.');
                    } else {
                      console.log('Content is now available offline!');
                    }
                    break;

                  case 'redundant':
                    console.error('The installing service worker became redundant.');
                    break;
                }
              };
            };
          }).catch(function(e) {
            console.error('Error during service worker registration:', e);
          });
        });
      }
    </script>-->
    <script>
      'use strict'
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.getRegistrations()
          .then(function(arrSW) {
            if(arrSW.length > 0) {
              arrSW.forEach(function(sw){
                sw.unregister()
                .then(function(){
                  console.log('ServiceWorker for '+ sw.scope +' has been unregistered.')
                })
              })
            }
          })
        });
      }
    </script>

  </body>
</html>

