/*
 _____     _
|__   |___| |_ ___ ___
|   __| -_| . |  _| .'|
|_____|___|___|_| |__,| Widget

Add table row zebra striping
*/
/*! Abelt Zebra widget - updated 11/13/2014 (v1.0.0-alpha.3) */
;( function( $ ) {
'use strict';

$.abelt.widget.add({
	id: 'zebra',
	settings : {
		options : {
			css : {
				even : 'even', // even row zebra striping
				odd  : 'odd'   // odd row zebra striping
			}
		}
	},
	priority: 90,
	update: function( abelt ) {
		var $tbody, $trVisible, $tr, row, even, tbodyIndex, rowLength, rowIndex,
			o = abelt.options,
			zebra = [ o.css.even, o.css.odd ],
			childRegex = new RegExp( o.css.childRow, 'i' ),
			$tbodies = abelt.$tbodies.add( $( abelt.namespace + '_extra_table' ).children( 'tbody' ) );
		for ( tbodyIndex = 0; tbodyIndex < $tbodies.length; tbodyIndex++ ) {
			// loop through the visible rows
			row = 0;
			$tbody = $tbodies.eq( tbodyIndex );
			// we can't use processTbody because it detaches the rows - so we can't tell if they are visible
			$trVisible = $tbody.children( 'tr:visible' ).not( o.selectors.remove );
			rowLength = $trVisible.length;
			for ( rowIndex = 0; rowIndex < rowLength; rowIndex++ ) {
				$tr = $trVisible.eq( rowIndex );
				// style child rows the same way the parent row was styled
				if ( !childRegex.test( $tr[0].className ) ) { row++; }
				even = ( row % 2 === 0 );
				$tr.removeClass( zebra[ even ? 1 : 0 ] ).addClass( zebra[ even ? 0 : 1 ] );
			}
		}
	},
	remove: function( abelt, refreshing ) {
		if ( refreshing ) { return; }
		var tbodyIndex,
			css = abelt.options.css,
			$tb = abelt.$tbodies,
			rmv = ( css.even + ' ' + css.odd );
		for ( tbodyIndex = 0; tbodyIndex < $tb.length; tbodyIndex++ ) {
			/*jshint loopfunc : true */
			$.abelt.utility.processTbody( abelt, $tb.eq( tbodyIndex ), function( $tbody ) {
				$tbody.children().removeClass( rmv );
			});
		}
	}
});

})(jQuery);
