import md5 from 'blueimp-md5'

// http://www.w3schools.com/js/js_cookies.asp
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

// https://stackoverflow.com/questions/19491336/get-url-parameter-jquery-or-how-to-get-query-string-values-in-js
//var getUrlParameter = function getUrlParameter(sParam) {
function getUrlParameter(sParam) {
	var sPageURL = window.location.search.substring(1),
	    sURLVariables = sPageURL.split('&'),
	    sParameterName,
	    i;

	for (i = 0; i < sURLVariables.length; i++) {
		sParameterName = sURLVariables[i].split('=');

		if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
		}
	}
};

var other_label='All others';

// Common functions used in many Vues

//export default function getRGB(str){
export function getRGB(str){
	if (str == other_label) {
		return '#cccccc'
	}
	var hash = md5(str);
	return '#' + hash.substring(0,6);
}

// https://github.com/shutterstock/rickshaw/pull/620
function formatBase1024KMGTP (y) {
    var abs_y = Math.abs(y);
    if (abs_y >= 1125899906842624)   { return (y / 1125899906842624).toFixed(2) + "P" }
    else if (abs_y >= 1099511627776) { return (y / 1099511627776).toFixed(2) + "T" }
    else if (abs_y >= 1073741824)    { return (y / 1073741824).toFixed(2) + "G" }
    else if (abs_y >= 1048576)       { return (y / 1048576).toFixed(2) + "M" }
    else if (abs_y >= 1024)          { return (y / 1024).toFixed(2) + "K" }
    else if (abs_y < 1 && abs_y > 0) { return y.toFixed(2) }
    else if (abs_y === 0)            { return '0' }
    else                             { return y }
};

export function human_size(y) {
	return formatBase1024KMGTP(y);
};



