/*
 _____ _ _         _____ _
|  _  | |_|___ ___|     | |_ ___ ___
|     | | | . |   |   --|   | .'|  _|
|__|__|_|_|_  |_|_|_____|_|_|__,|_|   Widget
          |___|

Align characters vertically by R.Garrison
*/
/*! Abelt AlignChar widget - updated 11/11/2014 (v1.0.0-alpha.2) */
;( function( $, undefined ) {
'use strict';
var $abelt = $.abelt,

$abeltAlignChar = $abelt.alignChar = {

	init : function( abelt ) {
		var o = abelt.options;

		if ( $.isEmptyObject( abelt.vars.cache ) ) {
			if ( $abelt.debug && o.debug ) {
				console.warn( 'Cache not found. Can not continue alignChar widget setup' );
			}
			return;
		}

		abelt.$headers.filter( '[' + o.alignChar.charAttrib + ']' ).each( function() {
			var $this = $(this),
				column = $this.data( 'column' ),
				data = {
					column     : column,
					align      : $this.attr( o.alignChar.charAttrib ),
					alignIndex : parseInt( $this.attr( o.alignChar.indexAttrib ) || 0, 10 ),
					adjust     : parseFloat( $this.attr( o.alignChar.adjustAttrib ) ) || 0,
				};
			data.regex = new RegExp( '\\' + data.align, 'g' );
			if ( data.align !== undefined ) {
				o.alignChar.savedData[ column] = data;
				$abeltAlignChar.setup( abelt, data );
			}
		});
	},

	setup: function( abelt, data ) {
		// do nothing for empty tables
		if ( $.isEmptyObject( abelt.vars.cache ) ) {
			return;
		}

		var tbodyIndex, rowIndex, start, end, last, index, rows, val, count,
			len, wLeft, wRight, alignChar, $row,
			o = abelt.options,
			v = abelt.vars,
			left = [],
			right = [];

		for ( tbodyIndex = 0; tbodyIndex < abelt.$tbodies.length; tbodyIndex++ ) {
			rows = v.cache[ tbodyIndex ];
			len = rows.normalized.length;
			for ( rowIndex = 0; rowIndex < len; rowIndex++ ) {
				$row = rows.normalized[ rowIndex ][ v.columns ].$row;
				val = $row.find( 'td' ).eq( data.column ).text().replace( /\s/g, '\u00a0' );
				// count how many "align" characters are in the string
				count = ( val.match( data.regex ) || [] ).length;
				// set alignment @ alignIndex (one-based index)
				if ( count > 0 && data.alignIndex > 0 ) {
					end = Math.min( data.alignIndex, count );
					start = 0;
					index = 0;
					last = 0;
					// find index of nth align character based on alignIndex (data-align-index)
					while ( start++ < end ) {
						last = val.indexOf( data.align, last + 1 );
						index = last < 0 ? index : last;
					}
				} else {
					index = val.indexOf( data.align );
				}
				if ( index >= 0 ) {
					left.push( val.substring( 0, index ) || '' );
					right.push( val.substring( index, val.length ) || '' );
				} else {
					// no align character found!
					// put val in right or left based on the align index
					left.push( ( count >= 1 && data.alignIndex >= count ) ? '' : val || '' );
					right.push( ( count >= 1 && data.alignIndex >= count ) ? val || '' : '' );
				}
			}
		}

		// find widest segments
		wLeft = ( $.extend([], left ) ).sort( function( a,b ){ return b.length - a.length; } )[ 0 ];
		wRight = ( $.extend([], right ) ).sort( function( a,b ){ return b.length - a.length; } )[ 0 ];
		// calculate percentage widths
		data.width = data.width || ( Math.floor( wLeft.length / ( wLeft.length + wRight.length ) * 100 ) + data.adjust );
		wLeft = 'min-width:' + data.width + '%';
		wRight = 'min-width:' + ( 100 - data.width )  + '%';

		for ( tbodyIndex = 0; tbodyIndex < abelt.$tbodies.length; tbodyIndex++ ) {
			rows = v.cache[ tbodyIndex ];
			len = rows.normalized.length;
			for ( rowIndex = 0; rowIndex < len; rowIndex++ ) {
				alignChar = $( o.alignChar.wrap ).length ? $( o.alignChar.wrap ).html( data.align )[ 0 ].outerHTML : data.align;
				$row = rows.normalized[ rowIndex ][ v.columns ].$row;
				$row.find( 'td' ).eq( data.column ).html(
					'<span class="abelt-align-wrap abelt-align-column-' + data.column + '">' +
						'<span class="abelt-align-left" style="' + wLeft + '">' + left[ rowIndex ] + '</span>' +
						'<span class="abelt-align-right" style="' + wRight + '">' +
							alignChar + right[ rowIndex ].slice( data.align.length ) +
						'</span></span>'
				);
			}
		}
		o.alignChar.initialized = true;

	},
	remove: function( abelt, column ) {
		if ( $.isEmptyObject( abelt.vars.cache ) ) { return; }
		var tbodyIndex, rowIndex, len, rows, $row, $cell,
			v = abelt.vars;
		for ( tbodyIndex = 0; tbodyIndex < abelt.$tbodies.length; tbodyIndex++ ) {
			rows = v.cache[ tbodyIndex ];
			len = rows.normalized.length;
			for ( rowIndex = 0; rowIndex < len; rowIndex++ ) {
				$row = rows.normalized[ rowIndex ][ v.columns ].$row;
				$cell = $row.find( 'td' ).eq( column );
				$cell.html( $cell.text().replace( /\s/g, ' ' ) );
			}
		}
	}
};

$abelt.widget.add({
	id: 'alignChar',
	priority: 100,
	options: {
		wrap         : '',
		charAttrib   : 'data-align-char',
		indexAttrib  : 'data-align-index',
		adjustAttrib : 'data-align-adjust' // percentage width adjustments
	},
	init: function( abelt ){
		var o = abelt.options;
		o.alignChar.initialized = false;
		o.alignChar.savedData = [];
		$abeltAlignChar.init( abelt );
		abelt.$table.on( 'pagerEnd refreshAlign', function() {
			abelt.$headers.filter( '[' + o.alignChar.charAttrib + ']' ).each( function() {
				$abeltAlignChar.remove( abelt, $( this ).data( 'column' ) );
			});
			$abeltAlignChar.init( abelt );
		});
		// build the cache <- ignores the sort.delayInit option
		if ( $.isEmptyObject( abelt.vars.cache ) && $abelt.build.update ) {
				$abelt.build.update( abelt );
		}
	},
	update : function( abelt ) {
		// reinitialize in case table is empty when first initialized
		if ( !abelt.options.alignChar.initialized ) {
			abelt.$table.trigger( 'refreshAlign' );
		}
	},
	remove : function( abelt, refreshing ) {
		if ( refreshing ) { return; }
		var o = abelt.options;
		abelt.$headers.filter( '[' + o.alignChar.charAttrib + ']' ).each( function() {
			$abeltAlignChar.remove( abelt, this.column );
		});
		o.alignChar.initialized = false;
	}
});

})( jQuery );
