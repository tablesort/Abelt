/*
 _____     _
|__   |___| |_ ___ ___
|   __| -_| . |  _| .'|
|_____|___|___|_| |__,| Widget

Add table row zebra striping
*/
/*! Abelt Zebra widget - updated 11/11/2014 */
;( function( $ ) {
'use strict';

$.abelt.widget.add({
	id: 'zebra',
	options : {
		zebra : [ 'even', 'odd' ]
	},
	priority: 90,
	update: function( abelt ) {
		var $tbody, $trVisible, $tr, row, even, time, tbodyIndex,
			o = abelt.options,
			zebra = o.zebra,
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
	remove: function( abelt ) {
		var tbodyIndex,
			$tb = c.$tbodies,
			rmv = ( abelt.options.zebra.classes || [ 'even', 'odd' ] ).join( ' ' );
		for ( tbodyIndex = 0; tbodyIndex < $tb.length; tbodyIndex++  ){
			$abelt.utility.processTbody( abelt, $tb.eq( tbodyIndex ), function( $tbody ) {
				$tbody.children().removeClass( rmv );
			});
		}
	}
});

})(jQuery);
