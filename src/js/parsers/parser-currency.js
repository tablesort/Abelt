;( function( $ ) {
'use strict';

	var $abelt = $.abelt;

	$abelt.parser.add({
		id: 'currency',
		is: function( text ) {
			// £$€¤¥¢
			return ( /^\(?\d+[\u00a3$\u20ac\u00a4\u00a5\u00a2?.]|[\u00a3$\u20ac\u00a4\u00a5\u00a2?.]\d+\)?$/ )
				.test( ( text || '' ).replace( /[+\-,. ]/g, '' ) );
		},
		format: function( text, abelt ) {
			var num = $abelt.utility.formatFloat( ( text || '' ).replace( $abelt.regex.nonDigit, '' ), abelt );
			return text && typeof num === 'number' ? num :
				text ? $.trim( text && abelt.options.ignoreCase ? text.toLocaleLowerCase() : text ) : text;
		},
		type: 'numeric'
	});

})(jQuery);
