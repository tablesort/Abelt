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
		var $tbody, $trVisible, $tr, row, even, tbodyIndex,
			o = abelt.options,
			zebra = [ o.css.even, o.css.odd ],
			childRegex = new RegExp( o.css.childRow, 'i' ),
			$tbodies = abelt.$tbodies;
		for ( tbodyIndex = 0; tbodyIndex < $tbodies.length; tbodyIndex++ ) {
			// loop through the visible rows
			row = 0;
			$tbody = $tbodies.eq( tbodyIndex );
			$trVisible = $tbody.children( 'tr:visible' ).not( o.selectors.remove );
			// reverted to using jQuery each - strangely it's the fastest method
			/*jshint loopfunc:true */
			$trVisible.each(function(){
				$tr = $( this );
				// style child rows the same way the parent row was styled
				if ( !childRegex.test( this.className ) ) { row++; }
				even = ( row % 2 === 0 );
				$tr.removeClass( zebra[ even ? 1 : 0 ] ).addClass( zebra[ even ? 0 : 1 ] );
			});
		}
	},
	remove: function( abelt, refreshing ) {
		if ( refreshing ) { return; }
		var tbodyIndex,
			css = abelt.options.css,
			$tb = abelt.$tbodies,
			rmv = ( css.even + ' ' + css.odd );
		for ( tbodyIndex = 0; tbodyIndex < $tb.length; tbodyIndex++  ){
			/*jshint loopfunc : true */
			$.abelt.utility.processTbody( abelt, $tb.eq( tbodyIndex ), function( $tbody ) {
				$tbody.children().removeClass( rmv );
			});
		}
	}
});

})(jQuery);
