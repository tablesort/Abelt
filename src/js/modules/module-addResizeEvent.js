;(function ($) {
'use strict';
/*
 _____         _                            _
| __  |___ ___|_|___ ___    ___ _ _ ___ ___| |_
|    -| -_|_ -| |- _| -_|  | -_| | | -_|   |  _|
|__|__|___|___|_|___|___|  |___|\_/|___|_|_|_|

add resize event to table headers
*/
$.abelt.utility.addHeaderResizeEvent = function( $table, disable, settings ) {
	$table = $( $table ); // make sure we have a jQuery object
	var headers,
		defaults = {
			timer : 250
		},
		options = $.extend( {}, defaults, settings ),
		abelt = $table.data( 'abelt' ),
		checkSizes = function( triggerEvent ) {
			abelt.flags.resize_flag = true;
			headers = [];
			abelt.$headers.each( function() {
				var $header = $( this ),
					sizes = $header.data( 'savedSizes' ) || [ 0, 0 ],
					width = this.offsetWidth,
					height = this.offsetHeight;
				if ( width !== sizes[ 0 ] || height !== sizes[ 1 ] ) {
					$header.data( 'savedSizes', [ width, height ] );
					headers.push( this );
				}
			});
			if ( headers.length && triggerEvent !== false ) {
				abelt.$table.trigger( 'resize', [ headers ] );
			}
			abelt.flags.resize_flag = false;
		};
	checkSizes( false );
	clearInterval( abelt.vars.resize_timer );
	if ( disable ) {
		abelt.flags.resize_flag = false;
		return false;
	}
	abelt.vars.resize_timer = setInterval( function() {
		if ( abelt.flags.resize_flag ) { return; }
		checkSizes();
	}, options.timer );
};

})(jQuery);
