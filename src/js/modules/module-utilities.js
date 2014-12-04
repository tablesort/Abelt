/* jQuery Abelt plugin utilities - updated 11/10/2014 (v1.0.0-alpha.1)
 _____ _____ _____ __  _____
|  _  | __  |   __|  ||_   _|
|     | __ -|   __|  |__| |
|__|__|_____|_____|_____|_| Utilities Module
*/
/*jshint browser:true, jquery:true */
;( function ( $, window, undefined ) {
'use strict';
var $abelt = $.abelt;

/* extend utility functions */
$.extend( true, $abelt, {

	regex : {
		// nonDigitDetect = characters removed before isDigit is used
		nonDigitDetect : /[,.'"\s]/g,
		// determine if the string has a number value, ignore +-()
		isDigit        : /^[\-+(]?\d+[)]?$/,
		// detect (#) = negative number
		isNegative     : /^\s*\([.\d]+\)/,
		// regex used by replace function to change () into a negative
		makeNegative   : /^\s*\(([.\d]+)\)/
	},

	defaults : {
		usNumberFormat : true // false for German '1.234.567,89' or French '1 234 567,89'
	},

/*   _   _ _ _ _
 _ _| |_|_| |_| |_ _ _
| | |  _| | | |  _| | |
|___|_| |_|_|_|_| |_  |
                  |___|
*/

	utility : {

		// get sorter, string, empty, etc options for each column from
		// jQuery data, header option or header class name ( 'sorter-false' )
		// priority = jQuery data > headers option > header class name
		getData: function( header, optionHeader, key ) {
			// header = options.$header.eq(column); index not used because the same header is checked multiple times
			// optionHeader = options.headers[index]
			var headerClass,
				value = '', // add result to empty string to maintain string type
				$header = $( header );
			if ( !$header.length ) { return ''; }
			// add a space to the beginning to simplify regex matching
			headerClass = ' ' + ( $header.attr( 'class' ) || '' );
			// this order sets the priority
			// jQuery data
			if ( $header.data( key ) !== undefined || $header.data( key.toLowerCase() ) !== undefined ) {
				// 'data-lockedOrder' is assigned to 'lockedorder'; but 'data-locked-order' is assigned to 'lockedOrder'
				// 'data-sort-initial-order' is assigned to 'sortInitialOrder'
				value += $header.data( key ) || $header.data( key.toLowerCase() );
			// headers option
			} else if ( optionHeader && optionHeader[ key ] !== undefined ) {
				value += optionHeader[ key ];
			// header class name
			} else if ( headerClass !== ' ' && headerClass.match( ' ' + key + '-' ) ) {
				// include sorter class name 'sorter-text', etc
				value = headerClass.match( new RegExp( '\\s' + key + '-([\\w-]+)' ) )[ 1 ] || '';
			}
			return $.trim( value );
		},

		// obj = options.headers, filter.functions, filter.defaultFilter, etc
		// indx = current column index
		// getCell = flag to return resulting object
		getColumnData : function( abelt, obj, indx, getCell ) {
			if ( $.isEmptyObject( obj ) ) { return indx; }
			var $header, key;
			if ( obj[ indx ] ) {
				return getCell ?
					obj[ indx ] :
					obj[ abelt.$headers.index( abelt.$headers.filter( '[data-column="' + indx + '"]:last' ) ) ];
			}
			for ( key in obj ) {
				if ( typeof key === 'string' ) {
					$header = abelt.$headers.filter( '[data-column="' + indx + '"]:last' )
						// header cell with class/id
						.filter( key )
						// find elements within the header cell with cell/id
						.add( abelt.$headers.filter( '[data-column="' + indx + '"]:last' ).find( key ) );
					if ( $header.length ) {
						return obj[ key ];
					}
				}
			}
			return indx;
		},

		formatFloat : function( str, abelt ) {
			if ( typeof( str ) !== 'string' || str === '' ) { return str; }
			var numbr;
			// allow using formatFloat without set options; defaults to US number format
			if ( abelt ? abelt.options.usNumberFormat !== false : abelt !== undefined ? abelt : true ) {
				// US Format - 1,234,567.89 -> 1234567.89
				str = str.replace( /,/g, '' );
			} else {
				// German Format = 1.234.567,89 -> 1234567.89
				// French Format = 1 234 567,89 -> 1234567.89
				str = str.replace( /[\s.]/g, '' ).replace( /,/g, '.' );
			}
			if ( $abelt.regex.isNegative.test( str ) ) {
				// make (#) into a negative number -> (10) = -10
				str = str.replace( $abelt.regex.makeNegative, '-$1' );
			}
			numbr = parseFloat( str );
			// return the text instead of zero
			return isNaN( numbr ) ? $.trim( str ) : numbr;
		},

		isDigit : function( str ) {
			// replace all unwanted chars and match
			return isNaN( str ) ? $abelt.regex.isDigit.test( str.toString().replace( $abelt.regex.nonDigitDetect, '' ) ) : true;
		},

		isValueInArray : function( value, arry ) {
			var indx,
				len = arry.length;
			for ( indx = 0; indx < len; indx++ ) {
				if ( arry[ indx ][ 0 ] === value ) {
					return indx;
				}
			}
			return -1;
		},

		// add processing indicator
		isProcessing : function( abelt, toggle, $ths ) {
			// default to all headers
			var o = abelt.options,
				$headers = $ths || abelt.$headers;
			if ( toggle ) {
				if ( $ths !== undefined && o.sortList.length > 0 ) {
					// get headers from the sortList
					$headers = $headers.filter( function() {
						return this.sortDisabled ? false : $abelt.utility.isValueInArray( $( this ).data( 'column' ), o.sortList ) >= 0;
					});
				}
				abelt.$table.add( $headers ).addClass( abelt.css.processing + ' ' + o.css.processing );
			} else {
				abelt.$table.add( $headers ).removeClass( abelt.css.processing + ' ' + o.css.processing );
			}
		},

		// *** Process table ***
		// detach tbody but save the position
		processTbody : function( abelt, $tb, process ) {
			var saved, $tbody;
			abelt.flags.isProcessing = true;
			// don't add a tbody as a place holder; it messes up the indexing (see updateCell)
			$tb.before('<span class="abelt-savemyplace"/>');
			$tbody = ( $.fn.detach ) ? $tb.detach() : $tb.remove();
			// processing callback function
			process( $tbody );
			saved = abelt.$table.find('span.abelt-savemyplace');
			$tbody.insertAfter( saved );
			saved.remove();
			abelt.flags.isProcessing = false;
		}

	}

});

})( jQuery, window );
