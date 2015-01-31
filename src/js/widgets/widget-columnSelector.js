/*
         _               _____     _         _
 ___ ___| |_ _ _____ ___|   __|___| |___ ___| |_ ___ ___
|  _| . | | | |     |   |__   | -_| | -_|  _|  _| . |  _|
|___|___|_|___|_|_|_|_|_|_____|___|_|___|___|_| |___|_|   Widget

Turning columns on and off like a champ
by by Justin Hallett & Rob Garrison
*/
/*! Abelt columnSelector widget - updated 11/11/2014 (v1.0.0-alpha.2) */
;( function( $, undefined ) {
'use strict';

var $abelt = $.abelt,

$abeltColSel = $abelt.columnSelector = {

	queryAll   : '@media only all { [columns] { display: none; } } ',
	queryBreak : '@media all and (min-width: [size]) { [columns] { display: table-cell; } } ',

	init : function( abelt ) {
		var $t, colSel,
			o = abelt.options,
			v = abelt.vars;

		// abort if no input is contained within the layout
		$t = $( o.columnSelector.layout );
		if ( !$t.find( 'input' ).add( $t.filter( 'input' ) ).length ) {
			if ( $abelt.debug && o.debug ) {
				console.error( '*** ERROR: Column Selector aborting, no input found in the layout! ***' );
			}
			return;
		}

		// add unique table class name
		abelt.$table.addClass( abelt.namespace.slice( 1 ) );

		// build column selector/state array
		colSel = v.columnSelector = {
			namespace  : abelt.namespace + 'columnSelector',
			$container : $( o.columnSelector.container || '<div>' )
		};
		colSel.$style = $( '<style></style>' ).prop( 'disabled', true ).appendTo( 'head' );
		colSel.$breakpoints = $( '<style></style>' ).prop( 'disabled', true ).appendTo( 'head' );

		colSel.isInitializing = true;
		$abeltColSel.setupSelector( abelt );

		if ( o.columnSelector.mediaquery ) {
			$abeltColSel.setupBreakpoints( abelt );
		}

		colSel.isInitializing = false;
		if ( colSel.$container.length ) {
			$abeltColSel.updateCols( abelt );
		}

		abelt.$table
			.off( 'refreshColumnSelector' + colSel.namespace )
			.on( 'refreshColumnSelector' + colSel.namespace, function(e, option) {
				var indx,
					isArray = $.isArray( option ),
					$container = v.columnSelector.$container;
				if ( option && $container.length ) {
					if ( isArray ) {
						// make sure array contains numbers
						$.each( option, function( indx, val ) {
							option[ indx ] = parseInt( val, 10 );
						});
						for ( indx = 0; indx < v.columns; indx++ ) {
							$container
								.find( 'input[data-column=' + indx + ']' )
								.prop( 'checked', $.inArray( indx, option ) >= 0 );
						}
					}
					// if passing an array, set auto to false to allow manual column selection & update columns
					$abeltColSel.updateAuto( abelt, $container.find( 'input[data-column="auto"]' ).prop( 'checked', !isArray ) );
				} else {
					$abeltColSel.updateBreakpoints( abelt );
					$abeltColSel.updateCols( abelt );
				}
			});

	},

	setupSelector : function( abelt ) {
		var name,
			o = abelt.options,
			v = abelt.vars,
			colSel = v.columnSelector,
			$container = colSel.$container,
			useStorage =  o.columnSelector.saveColumns && $abelt.storage,
			// get stored column states
			saved = useStorage ? $abelt.storage( abelt.table, 'abelt-columnSelector' ) : [],
			state = useStorage ? $abelt.storage( abelt.table, 'abelt-columnSelector-auto' ) : {};

		// initial states
		colSel.auto = $.isEmptyObject( state ) || $.type( state.auto ) !== 'boolean' ?
			o.columnSelector.mediaqueryState : state.auto;
		colSel.states = [];
		colSel.$column = [];
		colSel.$wrapper = [];
		colSel.$checkbox = [];
		// populate the selector container
		abelt.$table.children( 'thead' ).find( 'tr:first th' ).each( function() {
			var $this = $( this ),
				// if no data-priority is assigned, default to 1, but don't remove it from the selector list
				priority = $this.attr( o.columnSelector.priority) || 1,
				colId = $this.data( 'column' ),
				optionHeaders = $abelt.utility.getColumnData( abelt, optionHeaders, colId );
				state = $abelt.utility.getData( this, optionHeaders, 'columnSelector' );

			// if this column not hidable at all
			// include getData check (includes "columnSelector-false" class, data attribute, etc)
			if ( isNaN( priority ) && priority.length > 0 || state === 'disable' ||
				(  o.columnSelector.columns[ colId ] &&  o.columnSelector.columns[ colId ] === 'disable' ) ) {
				return true; // goto next
			}

			// set default state; storage takes priority
			colSel.states[ colId ] = saved && saved[ colId ] !== undefined ?
				saved[ colId ] : o.columnSelector.columns[colId] !== undefined ?
				 o.columnSelector.columns[ colId ] : ( state === 'true' ||  state !== 'false' );
			colSel.$column[ colId ] = $( this );

			// set default col title
			name = $this.attr( o.columnSelector.name ) || $this.text();

			if ( $container.length ) {
				colSel.$wrapper[ colId ] = $( o.columnSelector.layout.replace( /\{name\}/g, name ) ).appendTo( $container );
				colSel.$checkbox[ colId ] = colSel.$wrapper[ colId ]
					// input may not be wrapped within the layout template
					.find( 'input' ).add( colSel.$wrapper[ colId ].filter( 'input' ) )
					.attr( 'data-column', colId )
					.toggleClass( o.columnSelector.cssChecked, colSel.states[ colId ] )
					.prop( 'checked', colSel.states[ colId ] )
					.on( 'change', function() {
						colSel.states[ colId ] = this.checked;
						$abeltColSel.updateCols( abelt );
					}).change();
			}
		});

	},

	setupBreakpoints: function( abelt ) {
		var o = abelt.options,
			colSel = abelt.vars.columnSelector;

		// add responsive breakpoints
		if ( o.columnSelector.mediaquery ) {
			// used by window resize function
			colSel.lastIndex = -1;
			$abeltColSel.updateBreakpoints( abelt );
			abelt.$table
				.off( 'updateAll' + colSel.namespace )
				.on( 'updateAll' + colSel.namespace, function() {
					$abeltColSel.updateBreakpoints( abelt );
					$abeltColSel.updateCols( abelt );
				});
		}

		if ( colSel.$container.length ) {
			// Add media queries toggle
			if ( o.columnSelector.mediaquery ) {
				colSel.$auto = $(  o.columnSelector.layout.replace( /\{name\}/g,  o.columnSelector.mediaqueryName ) )
					.prependTo( colSel.$container );
				colSel.$auto
					// needed in case the input in the layout is not wrapped
					.find( 'input' ).add( colSel.$auto.filter( 'input' ) )
					.attr( 'data-column', 'auto' )
					.toggleClass( o.columnSelector.cssChecked, colSel.auto )
					.prop( 'checked', colSel.auto )
					.on( 'change', function() {
						$abeltColSel.updateAuto( abelt, $( this ) );
					}).change();
			}
			// Add a bind on update to re-run col setup
			abelt.$table
				.off( 'update' + colSel.namespace )
				.on( 'update' + colSel.namespace, function() {
					$abeltColSel.updateCols( abelt );
				});
		}
	},

	updateAuto: function( abelt, $el ) {
		var o = abelt.options,
			colSel = abelt.vars.columnSelector;
		colSel.auto = $el.prop('checked') || false;
		$.each( colSel.$checkbox, function( indx, $cbox ) {
			if ( $cbox ) {
				$cbox[ 0 ].disabled = colSel.auto;
				colSel.$wrapper[ indx ].toggleClass( 'disabled', colSel.auto );
			}
		});
		if ( o.columnSelector.mediaquery ) {
			$abeltColSel.updateBreakpoints( abelt );
		}
		$abeltColSel.updateCols( abelt );
		// copy the column selector to a popup/tooltip
		if ( colSel.$popup ) {
			colSel.$popup.find( '.abelt-column-selector' )
				.html( colSel.$container.html() )
				.find( 'input' ).each( function() {
					var $this = $( this ),
						indx = $this.attr('data-column');
					$this.prop( 'checked', indx === 'auto' ? colSel.auto : colSel.states[ indx ] );
				});
		}
		if ( o.columnSelector.saveColumns && $abelt.storage ) {
			$abelt.storage( abelt.$table[ 0 ], 'abelt-columnSelector-auto', { auto : colSel.auto } );
		}
		// trigger columnUpdate if auto is true - it gets skipped in updateCols()
		if ( colSel.auto ) {
			abelt.$table.trigger( 'columnUpdate' );
		}
	},

	updateBreakpoints: function( abelt ) {
		var priority, column, breaks,
			o = abelt.options,
			colSel = abelt.vars.columnSelector,
			prefix = abelt.namespace,
			mediaAll = [],
			breakpts = '';
		if ( o.columnSelector.mediaquery && !colSel.auto ) {
			colSel.$breakpoints.prop( 'disabled', true );
			colSel.$style.prop( 'disabled', false );
			return;
		}

		// only 6 breakpoints (same as jQuery Mobile)
		for ( priority = 0; priority < 6; priority++ ) {
			/*jshint loopfunc:true */
			breaks = [];
			abelt.$headers
				.filter( '[' +  o.columnSelector.priority + '=' + ( priority + 1 ) + ']' )
				.each( function() {
					column = $( this ).data( 'column' ) + 1;
					breaks.push( prefix + ' col:nth-child(' + column + ')' );
					breaks.push( prefix + ' tr th:nth-child(' + column + ')' );
					breaks.push( prefix + ' tr td:nth-child(' + column + ')' );
				});
			if ( breaks.length ) {
				mediaAll = mediaAll.concat( breaks );
				breakpts += $abeltColSel.queryBreak
					.replace( /\[size\]/g,  o.columnSelector.breakpoints[ priority ] )
					.replace( /\[columns\]/g, breaks.join( ',' ) );
			}
		}
		if ( colSel.$style ) {
			colSel.$style.prop( 'disabled', true );
		}
		if ( mediaAll.length ) {
			colSel.$breakpoints
				.prop( 'disabled', false )
				.html( $abeltColSel.queryAll.replace( /\[columns\]/g, mediaAll.join( ',' ) ) + breakpts );
		}
	},

	updateCols: function( abelt ) {
		var column,
			o = abelt.options,
			colSel = abelt.vars.columnSelector,
			styles = [],
			prefix = abelt.namespace;

		if ( o.columnSelector.mediaquery && colSel.auto || colSel.isInitializing ) {
			return;
		}

		colSel.$container
			.find( 'input[data-column]' )
			.filter( '[data-column!="auto"]' )
			.each( function() {
				var $this = $( this );
				if ( !this.checked ) {
					column = $this.data( 'column' ) + 1;
					styles.push( prefix + ' col:nth-child(' + column + ')' );
					styles.push( prefix + ' tr th:nth-child(' + column + ')' );
					styles.push( prefix + ' tr td:nth-child(' + column + ')' );
				}
				$this.toggleClass( o.columnSelector.cssChecked, this.checked );
			});
		if ( o.columnSelector.mediaquery ) {
			colSel.$breakpoints.prop( 'disabled', true );
		}
		if ( colSel.$style ) {
			colSel.$style
				.prop( 'disabled', false )
				.html( styles.length ? styles.join( ',' ) + ' { display: none; }' : '' );
		}
		if ( o.columnSelector.saveColumns && $abelt.storage ) {
			$abelt.storage( abelt.table, 'abelt-columnSelector', colSel.states );
		}
		abelt.$table.trigger('columnUpdate');
	},

	attachTo : function( $table, elm ) {
		$table = $( $table );
		var indx,
			abelt = $table[ 0 ].abelt,
			colSel = abelt.vars.columnSelector,
			$popup = $( elm );
		if ( $popup.length ) {
			if ( !$popup.find( '.abelt-column-selector' ).length ) {
				// add a wrapper to add the selector into, in case the popup has other content
				$popup.append( '<span class="abelt-column-selector"></span>' );
			}
			$popup.find( '.abelt-column-selector' )
				.html( colSel.$container.html() )
				.find( 'input' ).each( function() {
					var $this = $( this ),
						indx = $this.data( 'column' ),
						isChecked = indx === 'auto' ? colSel.auto : colSel.states[ indx ];
					$this
						.toggleClass( abelt.options.columnSelector.cssChecked, isChecked )
						.prop( 'checked', isChecked );
				});
			colSel.$popup = $popup.on( 'change', 'input', function() {
				// data input
				indx = $( this ).data( 'column' );
				// update original popup
				colSel.$container.find( 'input[data-column="' + indx + '"]' )
					.prop( 'checked', this.checked )
					.trigger( 'change' );
			});
		}
	}

};

$abelt.widget.add({
	id: 'columnSelector',
	priority: 10,
	options: {
		// target the column selector markup
		container : null,
		// column status, true = display, false = hide
		// disable = do not display on list
		columns : {},
		// remember selected columns
		saveColumns: true,

		// container layout
		layout : '<label><input type="checkbox">{name}</label>',
		// data attribute containing column name to use in the selector container
		name  : 'data-selector-name',

		/* Responsive Media Query settings */
		// enable/disable mediaquery breakpoints
		mediaquery: true,
		// toggle checkbox name
		mediaqueryName: 'Auto: ',
		// breakpoints checkbox initial setting
		mediaqueryState: true,
		// responsive table hides columns with priority 1-6 at these breakpoints
		// see http://view.jquerymobile.com/1.3.2/dist/demos/widgets/table-column-toggle/#Applyingapresetbreakpoint
		// *** set to false to disable ***
		breakpoints : [ '20em', '30em', '40em', '50em', '60em', '70em' ],
		// data attribute containing column priority
		// duplicates how jQuery mobile uses priorities:
		// http://view.jquerymobile.com/1.3.2/dist/demos/widgets/table-column-toggle/
		priority : 'data-priority',
		// class name added to checked checkboxes - this fixes an issue with Chrome not updating FontAwesome
		// applied icons; use this class name (input.checked) instead of input:checked
		cssChecked : 'checked'
	},
	init: function( abelt ) {
		$abeltColSel.init( abelt );
	},
	remove: function( abelt, refreshing ) {
		if ( refreshing ) { return; }
		var colSel = abelt.vars.columnSelector;
		colSel.$container.empty();
		if ( colSel.$popup ) { colSel.$popup.empty(); }
		colSel.$style.remove();
		colSel.$breakpoints.remove();
		abelt.$table.off( 'updateAll' + colSel.namespace + ' update' + colSel.namespace );
	}

});

})( jQuery );
