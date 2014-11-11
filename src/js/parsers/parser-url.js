;( function( $ ) {
'use strict';

	$.abelt.parser.add({
		id: 'url',
		is: function( text ) {
			return ( /^(https?|ftp|file):\/\// ).test( text );
		},
		format: function( text ) {
			return text ? $.trim( text.replace( /(https?|ftp|file):\/\//, '' ) ) : text;
		},
		parsed : true, // filter widget flag
		type: 'text'
	});

})( jQuery );
