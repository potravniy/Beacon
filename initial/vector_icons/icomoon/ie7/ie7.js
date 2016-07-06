/* To avoid CSS expressions while still supporting IE 7 and IE 6, use this script */
/* The script tag referencing this file must be placed before the ending body tag. */

/* Use conditional comments in order to target IE 7 and older:
	<!--[if lt IE 8]><!-->
	<script src="ie7/ie7.js"></script>
	<!--<![endif]-->
*/

(function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'icomoon\'">' + entity + '</span>' + html;
	}
	var icons = {
		'icon-help': '&#xe900;',
		'icon-progress-empty': '&#xe901;',
		'icon-progress-full': '&#xe902;',
		'icon-progress-one': '&#xe903;',
		'icon-progress-two': '&#xe904;',
		'icon-unattended_burning_garbage': '&#xe905;',
		'icon-dangerous_insects': '&#xe906;',
		'icon-snakes': '&#xe907;',
		'icon-mercury_spill': '&#xe908;',
		'icon-acarus': '&#xe909;',
		'icon-rescue_post': '&#xe90a;',
		'icon-mining': '&#xe90b;',
		'icon-ammunition': '&#xe90c;',
		'icon-plague_fish': '&#xe90d;',
		'icon-homeless_animals': '&#xe90e;',
		'icon-stopped_water_supply': '&#xe90f;',
		'icon-blackout': '&#xe910;',
		'icon-mass_unrest': '&#xe911;',
		'icon-training_interaction_services': '&#xe912;',
		'icon-oil_spill': '&#xe913;',
		'icon-stuck_in_elevator': '&#xe914;',
		'icon-suicide': '&#xe915;',
		'icon-admin_service_center': '&#xe916;',
		'icon-ads_signs': '&#xe917;',
		'icon-construction_and_reconstruction': '&#xe918;',
		'icon-education': '&#xe919;',
		'icon-housing_and_utilities': '&#xe91a;',
		'icon-legal_advice': '&#xe91b;',
		'icon-medicine': '&#xe91c;',
		'icon-nearby': '&#xe91d;',
		'icon-odnoklassniki': '&#xe91e;',
		'icon-open_summer_places_and_small_trading_points': '&#xe91f;',
		'icon-other': '&#xe920;',
		'icon-pin_off': '&#xe921;',
		'icon-pin_on': '&#xe922;',
		'icon-sport': '&#xe923;',
		'icon-transp_bicycle': '&#xe924;',
		'icon-transp_bus': '&#xe925;',
		'icon-transp_tram': '&#xe926;',
		'icon-transp_trolleybus': '&#xe927;',
		'icon-trust-icon-community': '&#xe928;',
		'icon-urban_planning_and_infrastructure': '&#xe929;',
		'icon-login': '&#xe92a;',
		'icon-logout': '&#xe92b;',
		'icon-map_pin': '&#xe92c;',
		'icon-tasks': '&#xe92d;',
		'icon-location': '&#xe92e;',
		'icon-lock': '&#xe92f;',
		'icon-unlocked': '&#xe930;',
		'icon-link': '&#xe931;',
		'icon-star-empty': '&#xe932;',
		'icon-star-full': '&#xe933;',
		'icon-filter': '&#xe934;',
		'icon-facebook2': '&#xe935;',
		'icon-twitter': '&#xe936;',
		'icon-vk': '&#xe937;',
		'icon-youtube2': '&#xe938;',
		'icon-tux': '&#xe939;',
		'icon-appleinc': '&#xe93a;',
		'icon-android': '&#xe93b;',
		'icon-windows8': '&#xe93c;',
		'icon-linkedin': '&#xe93d;',
		'icon-schedule': '&#xe8b5;',
		'icon-add': '&#xe145;',
		'icon-add_location': '&#xe567;',
		'icon-apps': '&#xe5c3;',
		'icon-poll': '&#xe801;',
		'icon-assignment': '&#xe85d;',
		'icon-assignment_ind': '&#xe85e;',
		'icon-assignment_turned_in': '&#xe862;',
		'icon-flag': '&#xe153;',
		'icon-block': '&#xe14b;',
		'icon-brightness_1': '&#xe3a6;',
		'icon-brightness_2': '&#xe3a7;',
		'icon-brightness_3': '&#xe3a8;',
		'icon-brightness_4': '&#xe3a9;',
		'icon-brightness_low': '&#xe1ad;',
		'icon-brightness_medium': '&#xe1ae;',
		'icon-brightness_high': '&#xe1ac;',
		'icon-cancel': '&#xe5c9;',
		'icon-close': '&#xe5cd;',
		'icon-comment': '&#xe0b9;',
		'icon-delete': '&#xe872;',
		'icon-error_outline': '&#xe001;',
		'icon-face': '&#xe87c;',
		'icon-favorite': '&#xe87d;',
		'icon-favorite_border': '&#xe87e;',
		'icon-my_location': '&#xe55c;',
		'icon-location_searching': '&#xe1b7;',
		'icon-location_disabled': '&#xe1b6;',
		'icon-people': '&#xe7fb;',
		'icon-highlight_off': '&#xe888;',
		'icon-info_outline': '&#xe88f;',
		'icon-link2': '&#xe157;',
		'icon-keyboard_arrow_down': '&#xe313;',
		'icon-keyboard_arrow_left': '&#xe314;',
		'icon-keyboard_arrow_right': '&#xe315;',
		'icon-keyboard_arrow_up': '&#xe316;',
		'icon-menu': '&#xe5d2;',
		'icon-more_horiz': '&#xe5d3;',
		'icon-more_vert': '&#xe5d4;',
		'icon-new_releases': '&#xe031;',
		'icon-pan_tool': '&#xe93e;',
		'icon-radio_button_unchecked': '&#xe836;',
		'icon-person': '&#xe7fd;',
		'icon-priority_high': '&#xe645;',
		'icon-search': '&#xe8b6;',
		'icon-send': '&#xe163;',
		'icon-sentiment_dissatisfied': '&#xe811;',
		'icon-sentiment_neutral': '&#xe812;',
		'icon-sentiment_satisfied': '&#xe813;',
		'icon-sentiment_very_dissatisfied': '&#xe814;',
		'icon-sentiment_very_satisfied': '&#xe815;',
		'icon-settings': '&#xe8b8;',
		'icon-share': '&#xe80d;',
		'icon-style': '&#xe41d;',
		'0': 0
		},
		els = document.getElementsByTagName('*'),
		i, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
		c = el.className;
		c = c.match(/icon-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
}());
