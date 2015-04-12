;( function ( $, window ) {
'use strict';
/*
 _____ _
|   __| |_ ___ ___ ___ ___ ___
|__   |  _| . |  _| .'| . | -_|
|_____|_| |___|_| |__,|_  |___|
                      |___|

 Store abelt data in local storage, with a cookie fallback

 IE7 needs JSON library for JSON.stringify - (http://caniuse.com/#search=json)
 if you need it, then include https://github.com/douglascrockford/JSON-js

 $.parseJSON is not available is jQuery versions older than 1.4.1, using older
 versions will only allow storing information for one page at a time

 // *** Save data (JSON format only) ***
 // val must be valid JSON... use http://jsonlint.com/ to ensure it is valid
 var val = { "mywidget" : "data1" }; // valid JSON uses double quotes
 // $.abelt.storage(table, key, val);
 $.abelt.storage(table, 'abelt-mywidget', val);

 // *** Get data: $.abelt.storage(table, key); ***
 v = $.abelt.storage(table, 'abelt-mywidget');
 // val may be empty, so also check for your data
 val = (v && v.hasOwnProperty('mywidget')) ? v.mywidget : '';
 alert(val); // "data1" if saved, or "" if not
*/
$.abelt.storage = function( table, key, value, options ) {
	table = $( table )[0];
	var id, url, cookieIndex, cookies, date, storageType,
		hasStorage = false,
		values = {},
		$table = $( table ),
		abelt = $table.data( 'abelt' );

	// get options from abelt.options.storage is not defined when called
	options = options || abelt && abelt.options.storage || {};

	storageType = options && options.useSessionStorage ? 'sessionStorage' : 'localStorage';

	// id from (1) options ID, (2) table "data-table-group" attribute, (3) widgetOptions.storage_tableId,
	// (4) table ID, then (5) table index
	id = options && options.id ||
		$table.attr( options && options.group || 'data-table-group' ) ||
		options && options.tableId || table.id || $( 'table.abelt' ).index( $table );
	// url from (1) options url, (2) table "data-table-page" attribute, (3) widgetOptions.storage_fixedUrl,
	// then (4) window location path
	url = options && options.url ||
		$table.attr( options && options.page || 'data-table-page' ) ||
		window.location.pathname;

	// https://gist.github.com/paulirish/5558557
	if ( storageType in window ) {
		try {
			window[ storageType ].setItem( '_tmptest', 'temp' );
			hasStorage = true;
			window[ storageType ].removeItem( '_tmptest' );
		} catch( error ) {
			if ( $.abelt.debug ) {
				console.log( storageType + ' is not supported in this browser' );
			}
		}
	}
	// *** get value ***
	if ( $.parseJSON ) {
		if ( hasStorage ) {
			values = $.parseJSON( window[ storageType ][ key ] || 'null' ) || {};
		} else {
			// old browser, using cookies
			cookies = document.cookie.split( /[;\s|=]/ );
			// add one to get from the key to the value
			cookieIndex = $.inArray( key, cookies ) + 1;
			values = ( cookieIndex !== 0 ) ? $.parseJSON( cookies[ cookieIndex ] || 'null' ) : {};
		}
	}
	// allow value to be an empty string too
	if ( ( value || value === '' ) && window.JSON && JSON.hasOwnProperty( 'stringify' ) ) {
		// add unique identifiers = url pathname > table ID/index on page > data
		if ( !values[ url ] ) {
			values[ url ] = {};
		}
		values[ url ][ id ] = value;
		// *** set value ***
		if ( hasStorage ) {
			window[ storageType ][ key ] = JSON.stringify( values );
		} else {
			date = new Date();
			date.setTime( date.getTime() + ( 31536e+6 ) ); // 365 days
			document.cookie = key + '=' + ( JSON.stringify( values ) ).replace( /\"/g, '\"' ) + '; expires=' +
				date.toGMTString() + '; path=/';
		}
	} else {
		return values && values[ url ] ? values[ url ][ id ] : '';
	}
};

})( jQuery, window );
