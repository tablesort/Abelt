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
		makeNegative   : /^\s*\(([.\d]+)\)/,
		// regex targetting temporary placeholder (\u0000)
		placeholder    : /\\u0000/g,
		// target spaces for removal
		spaces         : /\s+/g
	},

	defaults : {
		// set to match the jQuery Globalize format;
		// if installed, set this option to Globalize.cultures[ {language} ].numberFormat
		// where {language} is the selected language, e.g. 'en' is English, 'fr' is French, etc
		numberFormat : {
			'.' : '.',
			',' : ','
		}
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
		// index = current column index
		// getCell = flag to return resulting object
		getColumnData : function( abelt, obj, index, getCell, $headers ) {
			if ( $.isEmptyObject( obj ) ) { return index; }
			var $header, key,
				$cells = ( $headers || abelt.$headers ),
				$cell = abelt.$headerIndexed && abelt.$headerIndexed[ index ] ||
					$cells.filter( '[data-column="' + index + '"]:last' );
			if ( obj[ index ] ) {
				return getCell ?
					obj[ index ] :
					obj[ $cells.index( abelt.$headerIndexed[ index ] ) ];
			}
			for ( key in obj ) {
				if ( typeof key === 'string' ) {
					$header = $cell
						// header cell with class/id
						.filter( key )
						// find elements within the header cell with cell/id
						.add( $cell ).find( key );
					if ( $header.length ) {
						return obj[ key ];
					}
				}
			}
			return index;
		},

		formatFloat : function( str, abelt ) {
			if ( typeof( str ) !== 'string' || str === '' ) { return str; }
			var reformat, numbr, regexDecimal, regexComma,
				// follow http://github.com/jquery/globalize formatting, so the
				// numberFormat option can be set from Globalize.cultures['en'].numberFormat
				format = abelt !== false ? { '.' : '.', ',' : ',' } : { '.' : ',', ',' : '.' };
			// allow using formatFloat without set options; defaults to US number format
			format = !$.isEmptyObject( abelt && abelt.options && abelt.options.numberFormat ) ? abelt.options.numberFormat || format : format;

			// save regexp
			regexDecimal = $abelt.regex[ format[ '.' ] ] = $abelt.regex[ format[ '.' ] ] || ( new RegExp( '\\' + format['.'], 'g') );
			regexComma = $abelt.regex[ format[ ',' ] ] = $abelt.regex[ format[ ',' ] ] || ( new RegExp( '\\' + format[','], 'g') );

			reformat = str
				.replace( $abelt.regex.spaces, '' ) // remove spaces
				.replace( regexDecimal, '\\u0000' ) // decimal placeholder
				.replace( regexComma, '' ) // remove comma(s)
				.replace( $abelt.regex.placeholder, '.' ); // add decimal back
			if ( $abelt.regex.isNegative.test( reformat ) ) {
				// make (#) into a negative number -> (10) = -10
				reformat = reformat.replace( $abelt.regex.makeNegative, '-$1' );
			}
			numbr = parseFloat( reformat);
			// return the text instead of zero
			return isNaN( numbr ) ? $.trim( str ) : numbr;
		},

		isDigit : function( str ) {
			// replace all unwanted chars and match
			return isNaN( str ) ?
				$abelt.regex.isDigit.test( str.toString().replace( $abelt.regex.nonDigitDetect, '' ) ) :
				str !== '';
		},

		isValueInArray : function( value, arry ) {
			var index,
				len = arry.length;
			for ( index = 0; index < len; index++ ) {
				if ( arry[ index ][ 0 ] === value ) {
					return index;
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
