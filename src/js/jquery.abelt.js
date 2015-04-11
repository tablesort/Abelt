/*! jQuery Abelt plugin - updated 11/13/2014 (v1.0.0-alpha.3)
 _____ _____ _____ __  _____
|  _  | __  |   __|  ||_   _|
|     | __ -|   __|  |__| |
|__|__|_____|_____|_____|_|

by Rob Garrison (Mottie)
MIT License
Requires : jQuery v1.7+ */
/*jshint browser:true, jquery:true */
/*global require:false, define:false, module:false */
;( function ( factory ) {
	if ( typeof define === 'function' && define.amd ) {
		define( [ 'jquery' ], factory );
	} else if ( typeof module === 'object' && typeof module.exports === 'object' ) {
		module.exports = factory( require( 'jquery' ) );
	} else {
		factory( jQuery );
	}
}( function( $ ) {
'use strict';
var undef,
$abelt = $.abelt = {

	version : '1.0.0-alpha.4',

	// development mode. If false, the grunt build uglify will remove all extra development code
	debug :  true,

	defaults : {

		// *** appearance
		theme            : 'metro-dark', // adds abelt-{theme} to the table for styling
		widthFixed       : false,        // adds colgroup to fix widths of columns
		showProcessing   : false,        // show an indeterminate timer icon in the header while the table is busy.

		// *** functionality
		cancelSelection  : true, // prevent text selection in the header

		// *** widget options
		initWidgets      : true,            // apply widgets on abelt initialization
		widgets          : '',              // method to add widgets, e.g. widgets :  'filter zebra columns'
		widgetClass      : 'widget-{name}', // table class name template to match to include a widget

		// *** parser options
		parsers          : {},

		// *** callbacks
		initialized : null, // function(table){},

		css : {
			// *** extra css class names
			table       : '',
			caption     : '',
			headerRow   : '',
			headerCells : '',
			headerHover : '',
			footerRow   : '',
			footerCells : '',
			processing  : '',                  // processing icon applied to header during sort/filter
			ignore      : 'abelt-ignore',      // widgets ignore the contents of a thead row and tbody with this class name
			childRow    : 'abelt-childRow',    // Rows to group with a parent
			visible     : ''                   // class name added to visible rows
		},

		// selectors (jQuery selectors)
		selectors : {
			// children within the thead rows
			headers   : 'th, td',
			// elements (rows) to be removed when tablesorter updates (they shouldn't contain data, just info)
			remove    : '.remove-me'
		},

		// event names
		events : {
			namespace        : 'abelt', // a random number is added after to make a unique table namespace
			init             : 'abelt-init',
			widgetUpdate     : 'widgetUpdate',
			widgetApply      : 'widgetApply',
			widgetApplyAll   : 'widgetApplyAll',
			widgetRemove     : 'widgetRemove',
			widgetsRefresh   : 'widgetsRefresh',
			widgetsRefreshed : 'widgetsRefreshComplete',
			destroy          : 'destroy',
			resetToLoadState : 'resetToLoadState'
		}

	},

	// internal css classes - these will ALWAYS be added to
	// the table and MUST only contain one class name
	css : {
		table       : 'abelt',
		headerRow   : 'abelt-headerRow',
		headerCells : 'abelt-header',
		processing  : 'abelt-processing',
		hasChild    : 'abelt-hasChildRow'
	},

	// stored regex
	regex : {
		lists : /[\s,]+/ // convert (split) space/comma separated lists into an array
	},

	/*     _   _         _
	 _ _ _|_|_| |___ ___| |_ ___
	| | | | | . | . | -_|  _|_ -|
	|_____|_|___|_  |___|_| |___|
	            |___|
	*/

	// All added widgets go here
	widgets : [],

	widget : {

		// get widgets from table class name & add options
		setup : function( abelt, callback ) {
			var index, name, len,
				o = abelt.options,

			// add widget from table class name
			tableClass = ' ' + abelt.table.className + ' ',
			// look for widgets to apply from in table class
			// don't use \b otherwise this regex matches 'ui-widget-content' & adds a 'content' widget
			regex = new RegExp( '\\s' + o.widgetClass.replace( /\{name\}/i, '([\\w-]+)' )+ '\\s', 'g' ),
			// extract out the widget id from the table class (widget id's can include dashes)
			widget = tableClass.match( regex );
			if ( widget ) {
				len = widget.length;
				for ( index = 0; index < len; index++ ) {
					name = ( widget[ index ] || '' ).replace( regex, '$1' );
					o.widgets.push( name );
				}
			}

			// ensure unique widget ids
			o.widgets = $.grep( o.widgets, function( val, index ) {
				return o.widgets.indexOf( val ) === index;
			});
			len = o.widgets.length;
			for ( index = 0; index < len; index++ ) {
				$abelt.widget.addOptions( abelt, o.widgets[ index ] );
			}

			// callback executed on init only
			if ( $.isFunction( callback ) ) {
				callback( abelt );
			}

		},

		addOptions : function( abelt, name ) {
			var index, len, option, settings, blocks,
				o = abelt.options,
				widget = $abelt.widget.get( name );
			if ( widget.id ) {
				if ( widget.options ) {
					// options are specific to the widget - ( abelt.options.{widget-name} )
					o[ name ] = $.extend( true, {}, widget.options, o[ name ] );
				}
				// settings can be addded to the options, var, flags, etc
				settings = widget.settings;
				if ( settings ) {
					// trying to extend abelt, then replace it with itself
					// abelt = $.extend( true, {}, widgetSettings, abelt ); // -> breaks a bunch of options
					// it just works better to extend abelt settings into each block...
					blocks = abelt.vars.allowedBlocks;
					len = blocks.length;
					for ( index = 0; index < len; index++ ) {
						option = blocks[ index ];
						if ( settings[ option ] ) {
							abelt[ option ] = $.extend( true, {}, settings[ option ], abelt[ option ] );
						}
					}
				}
			}
		},


		add : function( widget, replaceWidget ) {
			if ( widget && widget.id ) {
				var index, storedWidget,
					storedWidgetsLength = $abelt.widgets.length,
					isNew = true;
				widget.id = widget.id;
				// set priority to 10, if not defined
				if ( widget.priority === undef ) {
					widget.priority = 10;
				}
				// make sure widget doesn't already exist
				for ( index = 0; index < storedWidgetsLength; index++ ) {
					storedWidget = $abelt.widgets[ index ];
					if ( storedWidget && storedWidget.id && storedWidget.id === widget.id ) {
						if ( replaceWidget ) {
							$abelt.widgets[ index ] = widget;
							if ( $abelt.debug ) {
								console.log( 'Replaced ' + widget.id + ' with a newly defined widget' );
							}
						} else if ( $abelt.debug ) {
							console.log( widget.id + ' already exists!' );
						}
						isNew = false;
					}
				}
				if ( isNew ) {
					$abelt.widgets.push( widget );
					if ( $abelt.debug ) {
						console.log( widget.id + ' widget added' );
					}
				}
			}
		},

		get : function( id ) {
			var index, widget,
				name = ( id || '' ).toString(),
				len = $abelt.widgets.length;
			for ( index = 0; index < len; index++ ) {
				widget = $abelt.widgets[ index ];
				if ( widget && widget.id && widget.id === name ) {
					return widget;
				}
			}
			return false;
		},

		has : function( abelt, name ) {
			return abelt.flags.widgetInit[ name ] || false;
		},

		apply : function( abelt, named, init, callback ) {
			named = named || '';
			var overall, time, applied, index, name, widgetsArray, widget, len,
				o = abelt.options,
				widgets = [],
				// if named == string, then apply specific widget(s), otherwise apply them all
				str = typeof named === 'string' && named !== '';

			// prevent numerous consecutive widget applications - ** isUpdating is added by module-cache.js **
			if ( init !== false && abelt.flags.init && ( abelt.flags.isApplyingWidgets || abelt.flags.isUpdating ) ) {
				return;
			}

			if ( $abelt.debug && o.debug ) { overall = new Date(); }

			if ( o.widgets.length ) {

				abelt.flags.isApplyingWidgets = true;

				// named can contain multiple widgets names, separated by spaces (or commas)
				// if named is an empty string, apply all widgets
				widgetsArray = str ? named.split( $abelt.regex.lists ) : o.widgets;
				len = widgetsArray.length;

				// build widget array
				len = widgetsArray.length;
				for ( index = 0; index < len; index++ ) {
					name = widgetsArray[ index ];
					widget = $abelt.widget.get( name );
					if ( widget && widget.id ) {
						widgets[ index ] = widget;
					}
				}

				// sort widgets by priority
				widgets.sort(function( a, b ){
					return a.priority < b.priority ? -1 : a.priority === b.priority ? 0 : 1;
				});
				// add/update selected widgets
				for ( index = 0; index < len; index++ ) {
					widget = widgets[ index ];
					name = widget ? widget.id : '';
					// make sure applied widget is added to options.widgets
					if ( name && widgetsArray.indexOf( name ) < 0 ) {
						o.widgets.push( name );
					}
					applied = false;
					if ( name ) {

						if ( $abelt.debug && o.debug ) {
							time = new Date();
							console[ console.group ? 'group' : 'log' ]( 'Start ' + ( init ? 'initializing ' : 'applying ' ) + name + ' widget' );
						}

						if ( init || !( abelt.flags.widgetInit[ name ] ) ) {
							// set widget initialized flag by widget name/id
							abelt.flags.widgetInit[ name ] = true;
							// extend widget options & settings
							if ( abelt.flags.init ) {
								$abelt.widget.addOptions( abelt, name );
							}

							if ( widget.init ) {
								applied = true;
								widget.init( abelt );
							}
						}
						if ( !init && widget.update ) {
							applied = true;
							widget.update( abelt );
						}
						if ( applied ) {
							abelt.flags.widgetInit[ name ] = true;
							if ( $abelt.debug && o.debug ) {
								console.log( 'Completed ' + ( init ? 'initializing ' : 'applying ' ) + name + ' widget' + $abelt.benchmark( time ) );
								if ( console.groupEnd ) { console.groupEnd(); }
							}
						} else {
							if ( $abelt.debug && o.debug ) {
								console.warn( init ? 'no init function found' : name + ' widget not applied!' );
								if ( console.groupEnd ) { console.groupEnd(); }
							}
						}

					}
				}

				setTimeout(function(){
					abelt.flags.isApplyingWidgets = false;
				}, 0);

			}
			if ( $abelt.debug && o.debug ) {
				console.log( 'Completed ' + ( init ? 'initializing' : 'applying' ) + ' ' +
					( str ? named.split( $abelt.regex.lists ).join( ' & ' ) + ' widgets'  :
					( len > 1 ? 'all widgets (' + o.widgets.join( ',  ') + ')' :
					o.widgets + ' widget' ) ) + $abelt.benchmark(overall ) );
				if ( console.groupEnd ) { console.groupEnd(); }
			}

			// callback executed on init only
			if ( !init && $.isFunction( callback ) ) {
				callback( abelt );
			}

		},

		remove : function( abelt, named, refreshing ) {
			var widget, len, storedWidget,
				o = abelt.options,
				index = 0;
			// if name === true, add all widgets from $.tablesorter.widgets
			if (named === true) {
				named = [];
				len = $abelt.widgets.length;
				for ( index = 0; index < len; index++ ) {
					storedWidget = $abelt.widgets[ index ];
					if ( storedWidget && storedWidget.id ) {
						named.push( storedWidget.id );
					}
				}
			} else {
				// named can be either an array of widgets names,
				// or a space/comma separated list of widget names
				named = ( $.isArray( named ) ? named.join( ',' ) : named || '' ).toLowerCase().split( abelt.regex.lists );
			}
			len = named.length;
			for ( index = 0; index < len; index++ ) {
				widget = $abelt.widget.get( name[ index ] );
				index = o.widgets.indexOf( name[ index ] );
				if ( widget && 'remove' in widget ) {
					if ( $abelt.debug && o.debug && index >= 0 ) {
						console.log( 'Removing "' + name[ index ] + '" widget' );
					}
					widget.remove( abelt, refreshing );
					abelt.flags.widgetInit[ widget.id ] = false;
				}
				// don't remove the widget from options.widget if refreshing
				if ( index >= 0 && refreshing !== true ) {
					o.widgets.splice( index, 1 );
				}
			}
		},

		refresh : function( abelt, doAll, dontApply ) {
			var index, len, widget,
				o = abelt.options,
				list = [],
				initializedWidgets = o.widgets,
				callback = function( abelt ) {
					// refresh complete event
					abelt.$table.trigger( o.events.widgetsRefreshed );
				};
			// remove widgets not defined in config.widgets, unless doAll is true
			len = $abelt.widgets.length;
			for ( index = 0; index < len; index++ ) {
				widget = $abelt.widgets[ index ];
				if ( widget && widget.id && ( doAll || initializedWidgets.indexOf( widget.id ) < 0)) {
					list.push( widget.id );
				}
			}
			$abelt.widget.remove( abelt, list.join( ',' ), true );
			if ( dontApply !== true ) {
				// trigger widget init
				$abelt.widget.apply( abelt, doAll || false , callback );
				if (doAll) {
					$abelt.widget.apply( abelt, false , callback );
				}
			} else {
				callback( abelt );
			}
		},

		update : function( abelt, callback ) {
			$abelt.utility.setConstants( abelt );
			// remove extra rows
			abelt.$table.find( abelt.options.selectors.remove ).remove();
			// update column indexes in case a column was added/removed
			var $rows = abelt.$table.children( 'thead : eq(0), tfoot' ).children( 'tr' );
			abelt.vars.columns = $abelt.utility.computeIndexes( $rows );
			// update widgets
			$abelt.widget.apply( abelt );
			if ( $.isFunction( callback ) ) {
				callback( abelt );
			}
		}

	}, // end widget functions

	/*   _   _ _ _ _
	 _ _| |_|_| |_| |_ _ _
	| | |  _| | | |  _| | |
	|___|_| |_|_|_|_| |_  |
	                  |___|
	*/

	utility : {

		// add internal constants
		setConstants : function( abelt ) {
			var o = abelt.options,
				// join ignore class names
				ignoreClass = '.' + o.css.ignore.split( $abelt.regex.lists ).join( ',.' );

			// update 'constants'
			abelt.$table = $( abelt.table );

			// selectors.headers should only contain 'th' or 'td', or both
			abelt.$headers = abelt.$table.children( 'thead' ).children( 'tr' ).not( ignoreClass ).children( o.selectors.headers );

			abelt.$tbodies = abelt.$table.children( 'tbody' ).not( ignoreClass );
			abelt.$tfoot = abelt.$table.children( 'tfoot' );
		},

		// Add classes & accessibility attributes
		appearance : function( abelt ) {
			var caption,
				o = abelt.options,
				theme = '';

			// add table theme class only if there isn't already one there
			if ( !/abelt\-/.test( abelt.$table.attr('class') ) ) {
				theme = ( o.theme !== '' ? ' abelt-' + o.theme : '' );
			}

			abelt.$table
				// add table class names
				.addClass( $abelt.css.table + ' ' + o.css.table + theme )
				// table accessibility
				.attr( 'role', 'grid' )
				// row accessibility
				.children().children( 'tr' ).attr( 'role', 'row' );

			if ( abelt.$table.children( 'caption' ).length ) {
				caption = abelt.$table.children( 'caption' ).addClass( o.css.caption )[0];
				if ( !caption.id) {
					caption.id = abelt.namespace.slice(1) + 'caption';
				}
				abelt.$table.attr( 'aria-labelledby', caption.id );
			}

			abelt.$headers
				// add class to header cells
				.addClass( $abelt.css.headerCells + ' ' + o.css.headerCells )
				// add header class (cycles through all cells to capture rows with full colspan)
				// not that efficient a method to add row class names, but it works
				.each( function() {
					$( this ).parent().addClass( $abelt.css.headerRow + ' ' + o.css.headerRow );
				});

			abelt.$tfoot
				.children().addClass( o.css.footerRow )
				.children().addClass( o.css.footerCells );

			// add visible rows class (if it exists)
			if ( o.css.visible ) {
				$abelt.utility.visibleRows( abelt );
			}

		},

		visibleRows : function( abelt ) {
			var o = abelt.options;
			// all rows are visible before widgets are applied
			if ( $abelt.utility.processTbody ) {
				var tbodyIndex, $tbody,
					$tbodies = abelt.$tbodies;
				for ( tbodyIndex = 0; tbodyIndex < $tbodies.length; tbodyIndex++ ) {
					$tbody = $tbodies.eq( tbodyIndex );
					if ( $tbody.find( 'tr' ).length ) {
						/*jshint loopfunc : true */
						$abelt.utility.processTbody( $tbody, function( $tb ) {
							$tb.children( 'tr' ).addClass( o.css.visible );
						});
					}
				}
			} else {
				abelt.$tbodies.children( 'tr' ).addClass( o.css.visible );
			}
		},

		fixColumnWidth : function( abelt ) {
			var calcW, $colgroup, overallWidth,
				o = abelt.options;
			if ( o.widthFixed && !abelt.$table.children( 'colgroup' ).length ) {
				$colgroup = $( '<colgroup>' );
				overallWidth = abelt.$table.width();
				// only add col for visible columns - fixes #371
				abelt.$tbodies.children( 'tr:visible' ).eq( 0 ).children( 'td:visible' ).each( function() {
					// saving percentage width to one decimal place (i.e. 33.3%)
					calcW = parseInt( ( $( this ).width() / overallWidth ) * 1000, 10 ) / 10 + '%';
					$colgroup.append( $( '<col>' ).css( 'width', calcW ) );
				});
				abelt.$table.prepend( $colgroup );
			}
		},

		// computeTableHeaderCellIndexes from :
		// http : //www.javascripttoolbox.com/lib/table/examples.php
		// http : //www.javascripttoolbox.com/temp/table_cellindex.html
		computeIndexes : function( $rows ) {
			var indexRow, indexCell, indexMatrix, indexMatrixCol,
				$cell, cell, cells, rowIndex, cellId, rowSpan, colSpan, firstAvailCol, matrixrow,
				matrix = [],
				lookup = {};
			for ( indexRow = 0; indexRow < $rows.length; indexRow++ ) {
				cells = $rows[ indexRow ].cells;
				for ( indexCell = 0; indexCell < cells.length; indexCell++ ) {
					cell = cells[ indexCell ];
					$cell = $(cell);
					rowIndex = cell.parentNode.rowIndex;
					cellId = rowIndex + '-' + $cell.index();
					rowSpan = cell.rowSpan || 1;
					colSpan = cell.colSpan || 1;
					if ( matrix[ rowIndex ] === undef ) {
						matrix[ rowIndex ] = [];
					}
					// Find first available column in the first row
					for ( indexMatrix = 0; indexMatrix < matrix[ rowIndex ].length + 1; indexMatrix++ ) {
						if ( matrix[ rowIndex ][ indexMatrix ] === undef ) {
							firstAvailCol = indexMatrix;
							break;
						}
					}
					lookup[ cellId ] = firstAvailCol;
					// add data-column; .attr({ 'data-row' : rowIndex })
					$cell.attr({ 'data-column' : firstAvailCol });
					cell.column = firstAvailCol;
					for ( indexMatrix = rowIndex; indexMatrix < rowIndex + rowSpan; indexMatrix++ ) {
						if ( matrix[ indexMatrix ] === undef ) {
							matrix[ indexMatrix ] = [];
						}
						matrixrow = matrix[ indexMatrix ];
						for ( indexMatrixCol = firstAvailCol; indexMatrixCol < firstAvailCol + colSpan; indexMatrixCol++ ) {
							matrixrow[ indexMatrixCol ] = 'x';
						}
					}
				}
			}
			// may not be accurate if # header columns !== # tbody columns, or if an info
			// only tbody contains a colspan that does not match the actual # of columns
			return matrixrow.length;
		},

		// ***********************************
		// add a que system for these methods
		// ***********************************
		bindMethods : function( abelt ) {
			var o = abelt.options,
				events = o.events,
				widgetEvents = [
					events.widgetUpdate,
					events.widgetApply,
					events.widgetApplyAll,
					events.widgetsRefresh,
					events.destroy,
					events.resetToLoadState,
					// empty so joining with namespace works
					''
					// add namespace to all events
				].join( abelt.namespace + ',' ).split( ',' );
			abelt.$table
				.off( widgetEvents.join( ' ' ).replace( /\s+/g, ' ' ) )
				.on( events.widgetUpdate, function( e, callback ) {
					e.stopPropagation();
					$abelt.widget.update( abelt, callback );
				})
				.on( events.widgetApply, function( e, name, init ) {
					e.stopPropagation();
					// apply named widget; name can be 'widget1 widget2' for multiple widgets (space or comma separated)
					$abelt.widget.apply( abelt, name, init );
				})
				.on( events.widgetApplyAll, function( e, init ) {
					e.stopPropagation();
					// apply all widgets
					$abelt.widget.apply( abelt, true, init );
				})
				.on( events.widgetsRefresh, function( e, doAll, dontApply ) {
					e.stopPropagation();
					$abelt.widget.refresh( abelt, doAll, dontApply );
				})
				.on( events.widgetRemove, function( e, name, callRemove ) {
					e.stopPropagation();
					// callRemove means, call the widget remove function (completely remove the widget)
					$abelt.widget.remove( abelt, name, callRemove );
				})
				.on( events.destroy, function( e, removeClasses, callback ) {
					e.stopPropagation();
					$abelt.destroy( removeClasses, callback );
				})
				.on( events.resetToLoadState, function( e ) {
					e.stopPropagation();
					// remove all widgets
					$abelt.widget.refresh( abelt, true, true );
					// restore original settings; this clears out current settings, but does not clear
					// values saved to storage.
					abelt.flags.init = false;
					// setup the entire table again
					$abelt.setup( abelt.vars.originalSettings );
				});
		}

	},

	/* ___ ___ ___ ___
	  |  _| . |  _| -_|
	  |___|___|_| |___|
	*/

	init : function( table, settings, callback ) {
		var abelt = $( table ).data( 'abelt' ) || {},
			// build options list
			options = $.extend( true, {}, $abelt.defaults, settings );
		// create a table from data (build table widget)
		if ( table.nodeName !== 'TABLE' && abelt.flags && !abelt.flags.init && abelt.build && abelt.build.table ) {
			// return the table (in case the original target is the table's container)
			$abelt.build.table( table, options );
		}
		$abelt.setup( table, options, callback );
	},

	setup : function( table, options, callback ) {
		// if no thead or tbody, or abelt is already present, quit
		if ( !table || !table.tHead || table.tBodies.length === 0 || table.abelt && table.abelt.flags.init ) {
			if ( $abelt.debug && options.debug ) {
				if ( table.abelt  && table.abelt.flags.init ) {
					console.error( 'Stopping initialization! Abelt has already been initialized' );
				} else {
					console.error( 'Stopping initialization! No table, thead or tbody' );
				}
			}
			return;
		}

		var $rows, hover,
		abelt = table.abelt = {
			// constants
			table   : table,
			$table  : $( table ),
			options : options,
			// internal variables
			vars : {
				// internal timer
				timer : 0,
				// save the original settings
				originalSettings : options,
				// blocks that can have widget settings merged into them
				allowedBlocks : [ 'flags', 'functions', 'options', 'vars' ]
			},
			// indicator flags
			flags : {
				// initialization flag
				init :  false,
				// table is being processed flag
				isProcessing :  true,
				// widget initialization flags
				widgetInit : [],
			},
			// misc functions (e.g. pager appender, etc)
			functions : {}
		},
		o = options;

		// Add a reverse reference to the DOM object
		abelt.$table.data( 'abelt', abelt );

		if ( $abelt.debug && o.debug ) { abelt.vars.timer = new Date(); }

		// give the table a unique id, which will be used in namespace binding
		if ( !abelt.namespace ) {
			abelt.namespace = '.' + o.events.namespace.replace( /\W/g, '' ) + Math.random().toString(16).slice(2);
		}

		// make sure to store the config object
		$abelt.utility.setConstants( abelt );
		// add class names & accessibility attributes
		$abelt.utility.appearance( abelt );
		// fixate columns if the users supplies the fixedWidth option
		// do this after theme has been applied
		$abelt.utility.fixColumnWidth( abelt );

		// add widget options before parsing (e.g. grouping widget has parser settings)
		$abelt.widget.setup( abelt );

		// add data-column indexing to targetted rows
		$rows = abelt.$table.children( 'thead:eq(0), tfoot' ).children('tr');
		abelt.vars.columns = $abelt.utility.computeIndexes( $rows );

		if ( $abelt.parser && $abelt.parser.init && !( o.sort && o.sort.delayInit ) ) {
			// initialize parser module; but only if sort.delayInit isn't true, or doesn't exist
			$abelt.parser.init( abelt );
		}

		// widget initialization
		$abelt.widget.apply( abelt, true, true );

		if ( o.initWidgets ) {
			// widget format/update on abelt init
			$abelt.widget.apply( abelt );
		}

		// cancel text selection of header cells
		if ( o.cancelSelection ) {
			abelt.$table.children( 'thead' ).children( 'tr' ).children( o.selectors.headers )
				.addClass( 'cancelSelection' )
				.attr( 'unselectable', 'on' )
				.on( 'selectstart', false );
		}

		if ( o.css.headerHover ) {
			hover = 'mouseenter mouseleave '.split( $abelt.regex.lists ).join( abelt.namespace + ' ' );
			abelt.$headers.on( hover, function( event ) {
				$( this ).toggleClass( o.css.headerHover, event.type === 'mouseenter' );
			});
		}

		$abelt.utility.bindMethods( abelt );

		// initialized
		abelt.flags.init = true;

		if ( $abelt.debug && o.debug ) {
			console.log( 'Overall initialization time' + $abelt.benchmark( abelt.vars.timer ) );
		}

		abelt.$table.trigger( o.events.init, this );
		abelt.flags.isUpdating = false;

		if ( $.isFunction( o.initialized ) ) {
			o.initialized( abelt );
		}
		if ( $.isFunction( callback ) ) {
			callback( abelt );
		}

		abelt.flags.isProcessing = false;

	},

	// other modules expect this to exist
	build : {},

	destroy : function( abelt, removeClasses, callback ) {
		if ( !abelt.flags.init ) { return; }
		// remove all widgets
		$abelt.widget.refresh( abelt, true, true );
		var o = abelt.options,
			events = o.events,
			$table = abelt.$table,
			tableClasses = $abelt.css.table + ' ' + o.css.table + ' abelt-' + o.theme,
			$thead = $table.children( 'thead' ),
			$rows = $thead.children( 'tr.' + $abelt.css.headerRow )
				.removeClass( $abelt.css.headerRow + ' ' + o.css.headerRow ),
			$tfoot = abelt.$tfoot
				.children( 'tr' ).removeClass( o.css.footerRow )
				.children( 'th, td' ).removeClass( o.css.footerCells ),

			widgetEvents = [
				events.widgetUpdate,
				events.widgetApply,
				events.widgetApplyAll,
				events.widgetsRefresh,
				events.destroy,
				events.resetToLoadState,
				''
			];

		// remove widget added rows, just in case
		$thead.children( 'tr' ).not( $rows ).remove();

		// disable tablesorter
		$table
			.removeData( 'abelt' )
			.off( widgetEvents.join( abelt.namespace + ' ' ).replace( /\s+/, ' ' ) );

		abelt.$headers.add( $tfoot )
			.removeClass( [ $abelt.css.headerCells, o.css.headerCells ].join(' ') )
			.removeAttr( 'data-column' );

		$table.toggleClass( tableClasses, removeClasses === false );
		// clear flag in case the plugin is initialized again
		abelt.flags.init = false;
		delete abelt.vars.cache;
		if ( $.isFunction( callback ) ) {
			callback( abelt );
		}
	}

};

// queue system (WIP)
$abelt.queue = {
	destroy : [ $abelt.destroy ]
};

if ( $abelt.debug ) {
	// benchmark function - just returns the string
	// this allows the debug logs to maintain actual line numbers
	$abelt.benchmark = function( d ) {
		return( ' (' + ( new Date().getTime() - d.getTime() ) + 'ms)' );
	};

	// set up debug logs
	if ( !( console && console.log ) ) {
		$abelt.logs = [];
		/*jshint -W020 */
		console = {};
		console.log = console.warn = console.error = console.table = function() {
			$abelt.logs.push( [ Date.now(), arguments ] );
		};
	}
}

$.fn.abelt = function( settings, callback ) {
	return this.each( function() {
		// prevent multiple initializations
		if ( this.abelt ) {
			if ( settings ) {
				$.extend( true, this.abelt, settings );
			}
			$abelt.widget.update( this.abelt, callback );
		} else {
			$abelt.init( this, settings, callback );
		}
	});
};

return $abelt;

}));
