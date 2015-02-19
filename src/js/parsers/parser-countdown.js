/*! Countdown parser ( hh:mm:ss ) */
/*jshint jquery:true, unused:false */
;(function($){
'use strict';

	$.abelt.parsers.push({
		id: 'countdown',
		is: function () {
			return false;
		},
		format: function ( text, abelt ) {
			// change maxDigits to 4, if values go > 999
			// or to 5 for values > 9999, etc.
			var maxDigits = abelt.options.parsers.durationLength || 4,
				// prefix contains leading zeros that are tacked
				prefix = new Array( maxDigits + 1 ).join( '0' ),
				// split time into blocks
				blocks = text.split( /\s*:\s*/ ),
				len = blocks.length,
				result = [];
			// add values in reverse, so if there is only one block
			// ( e.g. '10' ), then it would be the time in seconds
			while ( len ) {
				result.push( ( prefix + ( blocks[ --len ] || 0 ) ).slice( -maxDigits ) );
			}
			// reverse the results and join them
			return result.length ? result.reverse().join( '' ) : text;
		},
		type: 'text'
	});

})(jQuery);
