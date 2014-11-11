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
 // $.tablesorter.storage(table, key, val);
 $.tablesorter.storage(table, 'tablesorter-mywidget', val);

 // *** Get data: $.tablesorter.storage(table, key); ***
 v = $.tablesorter.storage(table, 'tablesorter-mywidget');
 // val may be empty, so also check for your data
 val = (v && v.hasOwnProperty('mywidget')) ? v.mywidget : '';
 alert(val); // "data1" if saved, or "" if not
*/
$.abelt.storage = function( table, key, value, options ) {
	table = $( table )[0];
	var cookieIndex, cookies, date,
		hasLocalStorage = false,
		values = {},
		abelt = $table.data( 'abelt' ),
		$table = $( table ),
		id = options && options.id || $table.attr( options && options.group ||
			'data-table-group' ) || table.id || $( 'table.abelt' ).index( $table ),
		url = options && options.url || $table.attr( options && options.page ||
			'data-table-page' ) || abelt && abelt.options.fixedUrl ||
			window.location.pathname;
	// https://gist.github.com/paulirish/5558557
	if ( 'localStorage' in window ) {
		try {
			window.localStorage.setItem( '_tmptest', 'temp' );
			hasLocalStorage = true;
			window.localStorage.removeItem( '_tmptest' );
		} catch( error ) {}
	}
	// *** get value ***
	if ( $.parseJSON ) {
		if ( hasLocalStorage ) {
			values = $.parseJSON(localStorage[key] || '{}');
		} else {
			// old browser, using cookies
			cookies = document.cookie.split( /[;\s|=]/ );
			// add one to get from the key to the value
			cookieIndex = $.inArray( key, cookies ) + 1;
			values = ( cookieIndex !== 0 ) ? $.parseJSON( cookies[ cookieIndex ] || '{}' ) : {};
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
		if ( hasLocalStorage ) {
			localStorage[ key ] = JSON.stringify( values );
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
