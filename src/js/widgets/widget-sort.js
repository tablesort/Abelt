/*
 _____         _
|   __|___ ___| |_
|__   | . |  _|  _|
|_____|___|_| |_|  Widget

Add multi-column natural sorting
*/
/*! Abelt Sort widget - updated 11/13/2014 (v1.0.0-alpha.3) */
;( function( $, undefined ) {
'use strict';

var $abelt = $.abelt;

/* extended core functions */
$.extend( true, $abelt, {

	css: {
		sortAsc     : 'abelt-sortAsc',
		sortDesc    : 'abelt-sortDesc',
		sortNone    : 'abelt-unsorted',
		sortActive  : 'abelt-sorted', // applied along with sortAsc or sortDesc
		headerInner : 'abelt-headerInner',
		icon        : 'abelt-icon'
	},

	// labels applied to sortable headers for accessibility (aria) support
	language : {
		sortAsc  : 'Ascending sort applied, ',
		sortDesc : 'Descending sort applied, ',
		sortNone : 'No sort applied, ',
		nextAsc  : 'activate to apply an ascending sort',
		nextDesc : 'activate to apply a descending sort',
		nextNone : 'activate to remove the sort'
	},

	// *** sort functions ***
	// regex used in natural sort
	regex : {
		// chunk/tokenize numbers & letters
		chunk: /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
		// hex
		hex: /^0x[0-9a-f]+$/i
	},

/*           _
 ___ ___ ___| |_
|_ -| . |  _|  _|
|___|___|_| |_|
*/

	sort: {

		init : function( abelt ) {
			var o = abelt.options;

			if ( $abelt.build.parserCache ) {
				// attempt to auto detect column type, and store in abelt.parsers
				$abelt.build.parserCache( abelt );
			} else {
				if ( $abelt.debug && o.debug ) {
					console.warn( 'Cache not found (missing module-cache.js). Can not continue sort widget setup' );
				}
				return;
			}

			$abelt.sort.appearance( abelt );

			// build headers
			$abelt.build.headers( abelt );

			// build the cache for the tbody cells
			// delayInit will delay building the cache until the user starts a sort
			if ( !o.sort.delayInit ) { $abelt.build.cache( abelt ); }

		},

		initComplete : function( abelt ) {
			var o = abelt.options,
				$table = abelt.$table,
				events = [ o.events.sortBegin, o.events.sortEnd, '' ].join( abelt.namespace + 'sort ' );

			// get sort list from jQuery data
			if ( $table.data().list !== undefined ) {
				o.sort.list = $table.data().list;
			}

			// show processesing icon
			if ( o.showProcessing && $abelt.utility.isProcessing ) {
				$table
					.off( events.replace( /\s+/g, ' ' ) )
					.on( events, function( e ) {
						$abelt.utility.isProcessing( abelt, events.type === o.events.sortBegin );
					});
			}

			// bind all header events and methods
			$abelt.sort.bindEvents( abelt, abelt.$headers, true );
			$abelt.sort.setHeadersCss( abelt );

			// initialized
			abelt.flags.sortInit = true;
			abelt.flags.isProcessing = false;

			// if user has supplied a sort list to constructor
			if ( o.sort.list.length > 0 ) {
				$abelt.sort.start( abelt, o.sort.list, {}, !o.initWidgets );
			}

			abelt.$table.trigger( o.events.sortInit, abelt );
			// callback function
			if ( $.isFunction( o.sort.initialized ) ) {
				o.sort.initialized( abelt );
			}

		},

		appearance: function( abelt ) {
			abelt.$tbodies.attr({
				'aria-live' : 'polite',
				'aria-relevant' : 'all'
			});
		},

		bindEvents : function( abelt, $headers, core, remove ) {
			var $table,
				o = abelt.options,
				namespace = abelt.namespace + 'sort',
				sortEvents = [
					o.events.sorton,
					o.events.sortReset,
					o.events.updateAll,
					o.events.updateComplete,
					o.events.sortDestroy,
					''
				].join( namespace + ',' ).split( ',' ),

				userEvents = [
					o.events.mousedown,
					o.events.mouseup,
					o.events.keyup,
					o.events.click,
					'' // add namespace to all events
				].join( namespace + ' ' ).replace( /\s+/g, ' ' );

			abelt.vars.downTarget = null;

			if ( core !== true ) {
				$headers.addClass( abelt.namespace.slice( 1 ) + '_extra_headers' );
				$table = $headers.closest( 'table' );
				if ( $table && $table[0] !== abelt.table ) {
					$table.addClass( abelt.namespace.slice(1) + '_extra_table' );
				}
			}

			// remove listeners
			abelt.$table.off( sortEvents.join( ' ' ).replace( /\s+/g, ' ' ) );
			// target user selected sort objects
			$headers
				.off( o.events.sort )
				// http://stackoverflow.com/questions/5312849/jquery-find-self;
				.find( o.selectors.sort ).add( $headers.filter( o.selectors.sort ) )
				.off( ( userEvents ).replace( /\s+/g, ' ' ) );

			// remove is true when the destroy method calls this function
			if ( !remove ) {
				// apply sort methods
				abelt.$table
				// sort on (sorton)
				.on( sortEvents[0], function( event, list, callback, init ) {
					event.stopPropagation();
					$abelt.sort.start( abelt, list, callback, init );
				})
				// sort reset (sortReset)
				.on( sortEvents[1], function( event, callback ) {
					event.stopPropagation();
					$abelt.sort.start( abelt, [], callback );
				})
				// updateAll
				.on( sortEvents[2], function( event, resort, callback ) {
					event.stopPropagation();
					$abelt.build.updateAll( abelt );
					$abelt.sort.checkResort( abelt, resort, callback );
				})
				// updateComplete
				.on( sortEvents[3], function( event, abelt, internal ) {
					event.stopPropagation();
					if ( internal ) { return; }
					// update sorting (if enabled/disabled)
					$abelt.sort.updateHeader( abelt );
					$abelt.sort.checkResort( abelt, o.sort.resort );
				})
				// sort destroy
				.on( sortEvents[4], function( event, removeClasses, callback ) {
					event.stopPropagation();
					$abelt.sort.destroy( abelt, removeClasses, callback );
				});

				// *** apply event handling to headers ***
				$headers
					// "sort" triggered on header cell
					.on( o.events.sort, function( event, external ) {
						$abelt.sort.triggerSort( abelt, event, external );
					})
					// other events triggered on sort selector
					.find( o.selectors.sort ).add( $headers.filter( o.selectors.sort ) )
					.on( userEvents, function( event, external ) {
						event.stopPropagation();
						$abelt.sort.triggerSort( abelt, event, external );
					});
			}

		},

		formatOrder : function( value ) {
			// look for 'd' in 'desc' order; return true
			return ( /^d/i.test( value ) || value === 1 );
		},

		setHeadersCss: function( abelt ) {
			var $cell, cellIndex, listIndex,
				o = abelt.options,
				v = abelt.vars,
				list = o.sort.list,
				len = list.length,
				active = $abelt.css.sortActive + ' ' + o.css.sortActive,
				none = $abelt.css.sortNone + ' ' + o.css.sortNone,
				css = [ $abelt.css.sortAsc + ' ' + o.css.sortAsc, $abelt.css.sortDesc + ' ' + o.css.sortDesc ],
				cssIcon = [ o.css.iconAsc, o.css.iconDesc, o.css.iconNone ],
				aria = [ 'ascending', 'descending' ],
				// find the footer
				$footer = abelt.$tfoot.children( 'tr' ).children( 'th, td' )
					.add( $( abelt.namespace + '_extra_headers' ) )
					.removeClass( css.join(' ') );
			// remove all header information
			abelt.$headers
				.removeClass( css.join(' ') + ' ' + active )
				.addClass( none )
				.attr( 'aria-sort', 'none' )
				.find( '.' + $abelt.css.icon )
				.removeClass( cssIcon.join( ' ' ) )
				.addClass( cssIcon[ 2 ] );

			for ( listIndex = 0; listIndex < len; listIndex++ ) {
				// direction = 2 means reset!
				if ( list[ listIndex ][ 1 ] !== 2 ) {
					// multicolumn sorting updating - choose the :last in case there are nested columns
					$cell = abelt.$headers
						.not( '.sorter-false' )
						.filter( '[data-column="' + list[ listIndex ][0] + '"]' + ( len === 1 ? ':last' : '' ) );
					if ($cell.length) {
						for ( cellIndex = 0; cellIndex < $cell.length; cellIndex++ ) {
							if ( !v.sortDisabled[ cellIndex ] ) {
								$cell.eq( cellIndex )
									.removeClass( none )
									.addClass( css[ list[ listIndex ][ 1 ] ] + ' ' + active )
									.attr( 'aria-sort', aria[ list[ listIndex ][ 1 ] ] )
									.find( '.' + $abelt.css.icon )
									.removeClass( cssIcon.join( ' ' ) )
									.addClass( cssIcon[ list[ listIndex ][ 1 ] ] );
							}
						}
						// add sorted class to footer & extra headers, if they exist
						if ($footer.length) {
							$footer.filter( '[data-column="' + list[ listIndex ][ 0 ] + '"]' )
								.removeClass( none )
								.addClass( css[ list[ listIndex ][ 1 ] ] );
						}
					}
				}
			}
			// add verbose aria labels
			abelt.$headers.not( '.sorter-false' ).each( function() {
				var $this = $(this),
					columnIndex = $this.data( 'column' ),
					nextSort = v.sortOrder[ columnIndex ][ ( v.sortCount[ columnIndex ] + 1 ) % ( o.sort.reset ? 3 : 2 ) ],
					text = $.trim( $this.text() ) + ': ' +
						$abelt.language[ $this.hasClass( $abelt.css.sortAsc ) ? 'sortAsc' : $this.hasClass( $abelt.css.sortDesc ) ? 'sortDesc' : 'sortNone' ] +
						$abelt.language[ nextSort === 0 ? 'nextAsc' : nextSort === 1 ? 'nextDesc' : 'nextNone' ];
				$this.attr('aria-label', text );
			});
		},

		updateHeader: function( abelt ) {
			var isDisabled, $th, columnIndex,
				o = abelt.options;
			abelt.$headers.each(function( index, th ) {
				$th = $(th);
				columnIndex = $abelt.utility.getColumnData( abelt, o.sort.headers, index, true );
				// add "sorter-false" class if "parser-false" is set
				isDisabled = $abelt.utility.getData( th, columnIndex, 'sorter' ) === 'false' ||
					$abelt.utility.getData( th, columnIndex, 'parser' ) === 'false';
				abelt.vars.sortDisabled[ columnIndex ] = isDisabled;
				$th
					.toggleClass( 'sorter-false', isDisabled )
					.attr( 'aria-disabled', '' + isDisabled );

				// aria-controls - requires table ID
				if ( abelt.table.id ) {
					if ( isDisabled ) {
						$th.removeAttr( 'aria-controls' );
					} else {
						$th.attr( 'aria-controls', abelt.table.id );
					}
				}
			});

		},

		updateSortCount: function( abelt, list ) {
			var sort, direction, column, primary, order, count, index, set,
				o = abelt.options,
				v = abelt.vars,
				newSort = list || o.sort.list,
				len = newSort.length;
			o.sort.list = [];
			for ( index = 0; index < len; index++ ) {
				set = newSort[ index ];
				// ensure all sortList values are numeric - fixes #127
				column = parseInt( set[ 0 ], 10 );

				// make sure header exists
				order = v.sortOrder[ column ];
				count = v.sortCount[ column ];
				// prevents error if sorton array is wrong
				if ( column <= v.columns ) {
					// 0/(a)sc (default), 1/(d)esc, (s)ame, (o)pposite, (n)ext
					direction = ( '' + set[ 1 ] ).match( /^(1|d|s|o|n)/ );
					direction = direction ? direction[ 0 ] : '';
					switch( direction ) {
						case '1': case 'd': // descending
							direction = 1;
							break;
						case 's': // same direction (as primary column)
							// if primary sort is set to "s", make it ascending
							direction = primary || 0;
							break;
						case 'o':
							sort = order[ ( primary || 0 ) % ( o.sort.reset ? 3 : 2 ) ];
							// opposite of primary column; but resets if primary resets
							direction = sort === 0 ? 1 : sort === 1 ? 0 : 2;
							break;
						case 'n':
							v.sortCount[ column ] = count++;
							direction = order[ count % ( o.sort.reset ? 3 : 2 ) ];
							break;
						default: // ascending
							direction = 0;
							break;
					}
					primary = index === 0 ? direction : primary;
					sort = [ column, parseInt( direction, 10 ) || 0 ];
					o.sort.list.push( sort );
					direction = order.indexOf( sort[ 1 ] ); // fixes issue #167
					v.sortCount[ column ] = direction >= 0 ? direction : sort[ 1 ] % ( o.sort.reset ? 3 : 2);
				}
			}
		},

		getCachedSortType: function( parsers, columnIndex ) {
			return ( parsers && parsers[ columnIndex ]) ? parsers[ columnIndex ].type || '' : '';
		},

		// called by 'sorton' & 'sortReset' events
		start: function( abelt, list, callback, init ) {
			var o = abelt.options;
			o.sort.list = list || [];
			abelt.$table.trigger( o.events.sortStart, [ abelt ] );
			// update header count index
			$abelt.sort.updateSortCount( abelt, list );
			// set css for headers
			$abelt.sort.setHeadersCss( abelt );
			// fixes #346
			if ( o.sort.delayInit && $.isEmptyObject( abelt.vars.cache ) ) {
				$abelt.build.cache( abelt );
			}
			abelt.$table.trigger( o.events.sortBegin, [ abelt ] );

			// sort the table and append it to the dom
			$abelt.sort.multisort( abelt );
			$abelt.build.append( abelt, init );

			abelt.$table.trigger( o.events.sortEnd, [ abelt ] );

			// $abelt.widget.apply( abelt );

			if (typeof callback === 'function') {
				callback( abelt );
			}
		},

		// called when a user interacts with the header
		triggerSort: function( abelt, event, external ) {
			var columnIndex,
				o = abelt.options,
				v = abelt.vars,
				events = o.events,
				regex = new RegExp( [ events.sort, events.keyup, events.click ].join( '|' ) ),
				$target = $( event.target ),
				$cell = $target.closest( 'th, td' ),
				type = event.type;

			// only recognize left clicks
			if ( ( ( event.which || event.button ) !== 1 && !regex.test(type) ) ||
				// allow pressing enter
				( type === events.keyup && events.which !== 13 ) ||
				// allow triggering a click event ( event.which is undefined ) & ignore physical clicks
				( type === events.click && typeof event.which !== 'undefined' ) ||
				// ignore mouseup if mousedown wasn't on the same target
				( type === events.mouseup && v.downTarget !== event.target && external !== true ) ) {
				return;
			}

			// set target on mousedown
			if ( type === events.mousedown ) {
				v.downTarget = event.target;
				return;
			}
			v.downTarget = null;

			// prevent sort being triggered on form elements
			if ( /(input|select|button|textarea)/i.test( event.target.nodeName ) ||
				// noSort class name, or elements within a noSort container
				$target.hasClass( o.css.noSort ) || $target.parents( '.' + o.css.noSort).length > 0 ||
				// elements within a button
				$target.parents( 'button' ).length > 0 ) {
				return !o.cancelSelection;
			}

			if ( o.sort.delayInit && $.isEmptyObject( abelt.vars.cache ) ) {
				$abelt.build.cache( abelt );
			}
			// jQuery data does not update if columns rearranged
			columnIndex = parseInt( $cell.attr( 'data-column' ), 10 );

			if ( !abelt.vars.sortDisabled[ columnIndex ] ) {
				$abelt.sort.initSort( abelt, columnIndex, event );
			}

		},

		initSort: function( abelt, columnIndex, event ) {
			if ( abelt.flags.isUpdating ) {
				// let any updates complete before initializing a new sort
				// remove when queue system is added
				return setTimeout( function() {
					$abelt.sort.initSort( abelt, columnIndex, event );
				}, 50 );
			}
			var arry, col, order, index,
				o = abelt.options,
				v = abelt.vars,
				key = !event[ o.sort.multiSortKey ],
				$table = abelt.$table,
				cell = $( event.target ).closest( 'th, td' )[ 0 ];

			// Only call sortStart if sorting is enabled
			$table.trigger( o.events.sortStart, abelt );
			// get current column sort order
			v.sortCount[ columnIndex ] = event[ o.sort.resetKey ] ? 2 :
				( v.sortCount[ columnIndex ] + 1 ) % ( o.sort.reset ? 3 : 2 );
			// reset all sorts on non-current column - issue #30
			if ( o.sort.restart ) {
				abelt.$headers.each( function() {
					var $this = $( this );
					// only reset counts on columns that weren't just clicked on and if not included in a multisort
					if ( this !== cell && ( key || !$this.is( '.' + $abelt.css.sortActive ) ) ) {
						v.sortCount[ $this.data('column') ] = -1;
					}
				});
			}
			// user only wants to sort on one column
			if ( key ) {
				// flush the sort list
				o.sort.list = [];
				if ( o.sort.force ) {
					arry = o.sort.force;
					for ( col = 0; col < arry.length; col++ ) {
						if ( arry[ col ][ 0 ] !== columnIndex ) {
							o.sort.list.push( arry[ col ] );
						}
					}
				}
				// add column to sort list
				order = v.sortOrder[ columnIndex ][ v.sortCount[ columnIndex ] ];
				if ( order < 2 ) {
					o.sort.list.push( [ columnIndex, order ] );
					// add other columns if header spans across multiple
					if ( cell.colSpan > 1 ) {
						for ( col = 1; col < cell.colSpan; col++ ) {
							o.sort.list.push( [columnIndex + col, order ] );
						}
					}
				}
				// multi column sorting
			} else {
				// get rid of the sortAppend before adding more - fixes issue #115 & #523
				if ( o.sort.append && o.sort.list.length > 1 ) {
					for ( col = 0; col < o.sort.append.length; col++ ) {
						index = $abelt.utility.isValueInArray( o.sort.append[ col ][ 0 ], o.sort.list );
						if ( index >= 0 ) {
							o.sort.list.splice( index, 1 );
						}
					}
				}
				// the user has clicked on an already sorted column
				if ( $abelt.utility.isValueInArray( columnIndex, o.sort.list ) >= 0 ) {
					// reverse the sorting direction
					for ( col = 0; col < o.sort.list.length; col++ ) {
						index = o.sort.list[ col ];
						if ( index[ 0 ] === columnIndex ) {
							// order.count seems to be incorrect when compared to cell.count
							index[ 1 ] = v.sortOrder[ index[ 0 ] ][ v.sortCount[ index[ 0 ] ] ];
							if ( index[ 1 ] === 2 ) {
								o.sort.list.splice( col, 1 );
								v.sortCount[ index[ 0 ] ] = -1;
							}
						}
					}
				} else {
					// add column to sort list array
					index = v.sortOrder[ columnIndex ][ v.sortCount[ columnIndex ] ];
					if ( index < 2 ) {
						o.sort.list.push( [ columnIndex, index ] );
						// add other columns if header spans across multiple
						if ( cell.colSpan > 1 ) {
							for ( col = 1; col < cell.colSpan; col++ ) {
								o.sort.list.push( [ columnIndex + col, index ] );
							}
						}
					}
				}
			}
			if ( o.sort.append ) {
				arry = o.sort.append;
				for ( col = 0; col < arry.length; col++ ) {
					if ( arry[ col ][ 0 ] !== columnIndex ) {
						o.sort.list.push( arry[ col ] );
					}
				}
			}
			// sortBegin event triggered immediately before the sort
			$table.trigger( o.events.sortBegin, [ abelt ] );
			// setTimeout needed so the processing icon shows up
			setTimeout( function() {
				// set css for headers
				$abelt.sort.setHeadersCss( abelt );
				$abelt.sort.multisort( abelt );
				$abelt.build.append( abelt );
				$table.trigger( o.events.sortEnd, [ abelt ] );
			}, 1);
		},

		// sort multiple columns
		multisort: function( abelt ) {
			/*jshint loopfunc:true */
			var index, tbodyIndex, num, col, time, colMax,
				cache, order, sort, x, y,
				dir = 0,
				o = abelt.options,
				v = abelt.vars,
				customTextSort = o.sort.textSorter || '',
				list = o.sort.list,
				len = list.length,
				tbodyLen = abelt.$tbodies.length;

			if (o.sort.serverSide || $.isEmptyObject( v.cache ) ) {
				return;
			}

			if ( $abelt.debug && o.debug ) { time = new Date(); }
			for ( tbodyIndex = 0; tbodyIndex < tbodyLen; tbodyIndex++ ) {
				colMax = v.cache[ tbodyIndex ].colMax;
				cache = v.cache[ tbodyIndex ].normalized;

				cache.sort( function( a, b ) {
					// cache is undefined here in IE, so don't use it!
					for ( index = 0; index < len; index++ ) {
						col = list[ index ][ 0 ];
						order = list[ index ][ 1 ];
						// sort direction, true = asc, false = desc
						dir = order === 0;

						if ( o.sort.stable && a[ col ] === b[ col ] && len === 1 ) {
							// sort reset, return original unsorted order
							return a[ v.columns ].order - b[ v.columns ].order;
						}

						// fallback to natural sort since it is more robust
						num = /n/i.test( $abelt.sort.getCachedSortType( v.parsers, col ) );
						if ( num && v.strings[ col ] ) {
							// sort strings in numerical columns
							if ( typeof ( v.string[ v.strings[ col ] ]) === 'boolean' ) {
								num = ( dir ? 1 : -1 ) * ( v.string[ v.strings[ col ] ] ? -1 : 1 );
							} else {
								num = ( v.strings[ col ] ) ? v.string[ v.strings[ col ] ] || 0 : 0;
							}
							// fall back to built-in numeric sort
							sort = o.sort.numberSorter ?
								o.sort.numberSorter( a[ col ], b[ col ], dir, colMax[ col ], abelt ) :
								$abelt.sorters[ 'numeric' + ( dir ? 'Asc' : 'Desc' ) ]( a[ col ], b[ col ], num, colMax[ col ], col, abelt );
						} else {
							// set a & b depending on sort direction
							x = dir ? a : b;
							y = dir ? b : a;
							// text sort function
							if ( $.isFunction( customTextSort ) ) {
								// custom OVERALL text sorter
								sort = customTextSort( x[ col ], y[ col ], dir, col, abelt );
							} else if ( typeof( customTextSort ) === 'object' && customTextSort.hasOwnProperty( col ) ) {
								// custom text sorter for a SPECIFIC COLUMN
								sort = customTextSort[ col ]( x[ col ], y[ col ], dir, col, abelt );
							} else {
								// fall back to natural sort
								sort = $abelt.sorters[ 'natural' + ( dir ? 'Asc' : 'Desc' ) ]( a[ col ], b[ col ], col, abelt );
							}
						}
						if ( sort ) { return sort; }
					}
					return a[ v.columns ].order - b[ v.columns ].order;
				});
			}
			if ( $abelt.debug && o.debug ) {
				console.log( 'Sorting on ' + list.toString() + ' and dir ' + order + ' time' + $abelt.benchmark( time ) );
			}
		},

		checkResort: function( abelt, resrt, callback ) {
			var o = abelt.options,
				list = $.isArray( resrt ) ? resrt : o.sort.list,
				// if no resort parameter is passed, fallback to config.resort (true by default)
				resort = typeof resrt === 'undefined' ? o.sort.resort : resrt;
			// don't try to resort if the table is still processing
			// this will catch spamming of the updateCell method
			if ( resort !== false && !o.sort.serverSide && !abelt.flags.isProcessing && $.isArray( list ) ) {
				// sorton
				$abelt.sort.start( abelt, list, function(){
					$abelt.sort.complete( abelt, callback );
				}, true );
			} else {
				$abelt.sort.complete( abelt, callback );
				$abelt.widget.apply( abelt, '', false );
			}
		},

		complete: function( abelt, callback ) {
			var o = abelt.options;
			if ( !abelt.flags.isProcessing ) {
				// *** TO FIX: don't trigger this until ajax has completed ***
				abelt.$table.trigger( o.events.updateComplete, [ abelt, true ] );
				if ( $.isFunction( callback ) ) {
					callback( abelt );
				}
			}
		},

		// restore headers
		restoreHeaders: function( abelt ){
			var $cell,
				o = abelt.options;
			// don't use abelt.$headers here in case header cells were swapped
			abelt.$table.children( 'thead' ).children( 'tr' ).children( o.selectors.headers ).each( function( index ) {
				$cell = $( this );
				// only restore header cells if it is still wrapped
				// because this is also used by the updateAll method
				if ( $cell.find( '.' + $abelt.css.headerInner ).length ) {
					$cell.html( abelt.vars.originalHeaders[ index ] );
				}
			});
		},

		destroy: function( abelt, callback ){
			if ( !abelt.flags.sortInit ) { return; }
			// clear flag in case the widget is initialized again
			abelt.flags.sortInit = false;

			// remove 'sort' from list of widgets
			// false flag prevents calling the widget remove function again
			$abelt.widget.remove( 'sort', false );

			var o = abelt.options,
			$footerCells = abelt.$tfoot.children( 'tr' ).children( 'th, td' ),
			sortClasses = [ abelt.css.sortNone, o.css.sortNone, abelt.css.sortAsc, o.css.sortAsc,
					abelt.css.sortDesc, o.css.sortDesc ];

			// the last true parameter prevents rebinding of listeners
			$abelt.sort.bindEvents( abelt, abelt.$headers.add( $( abelt.namespace + '_extra_headers' ) ), true, true );

			abelt.$table
				.children('thead').children( 'tr' ).children( 'th, td' )
				.add( $footerCells ).removeClass( sortClasses.join(' ') );

			$abelt.sort.restoreHeaders( abelt );

			if (typeof callback === 'function') {
				callback( abelt );
			}
		}

	},

/*
             _
 ___ ___ ___| |_ ___ ___ ___
|_ -| . |  _|  _| -_|  _|_ -|
|___|___|_| |_| |___|_| |___|
*/

	sorters : {

		naturalAsc : function( a, b, col, abelt ) {
			if ( a === b ) { return 0; }
			var e = abelt.vars.string[ ( abelt.vars.empties[ col ] || abelt.options.sort.emptyTo ) ];
			if ( a === '' && e !== 0 ) { return typeof e === 'boolean' ? ( e ? -1 : 1 ) : -e || -1; }
			if ( b === '' && e !== 0 ) { return typeof e === 'boolean' ? ( e ? 1 : -1 ) : e || 1; }
			return $abelt.sorters.natural( a, b );
		},

		naturalDesc : function( a, b, col, abelt ) {
			if ( a === b ) { return 0; }
			var e = abelt.vars.string[ ( abelt.vars.empties[ col ] || abelt.options.sort.emptyTo ) ];
			if ( a === '' && e !== 0 ) { return typeof e === 'boolean' ? ( e ? -1 : 1 ) : e || 1; }
			if ( b === '' && e !== 0 ) { return typeof e === 'boolean' ? ( e ? 1 : -1 ) : -e || -1; }
			return $abelt.sorters.natural( b, a );
		},

		// Natural sort - modified from https://github.com/overset/javascript-natural-sort
		natural: function( a, b ) {
			if ( a === b ) { return 0; }
			var xN, xD, yN, yD, xF, yF, i, mx,
				regex = $abelt.regex;
			// first try and sort Hex codes
			if ( regex.hex.test( b ) ) {
				xD = parseInt( a.match( regex.hex ), 16 );
				yD = parseInt( b.match( regex.hex ), 16 );
				if ( xD < yD ) { return -1; }
				if ( xD > yD ) { return 1; }
			}
			// chunk/tokenize
			xN = a.replace( regex.chunk, '\\0$1\\0' ).replace( regex.chunks, '' ).split( '\\0' );
			yN = b.replace( regex.chunk, '\\0$1\\0' ).replace( regex.chunks, '' ).split( '\\0' );
			mx = Math.max( xN.length, yN.length );
			// natural sorting through split numeric strings and default strings
			for ( i = 0; i < mx; i++ ) {
				// find floats not starting with '0', string or 0 if not defined
				xF = isNaN( xN[ i ] ) ? xN[ i ] || 0 : parseFloat( xN[ i ] ) || 0;
				yF = isNaN( yN[ i ] ) ? yN[ i ] || 0 : parseFloat( yN[ i ] ) || 0;
				// handle numeric vs string comparison - number < string - (Kyle Adams)
				if ( isNaN( xF ) !== isNaN( yF ) ) { return isNaN( xF ) ? 1 : -1; }
				// rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
				if ( typeof xF !== typeof yF ) {
					xF += '';
					yF += '';
				}
				if ( xF < yF ) { return -1; }
				if ( xF > yF ) { return 1; }
			}
			return 0;
		},

		// basic alphabetical sort
		text: function( a, b ) {
			return a > b ? 1 : ( a < b ? -1 : 0 );
		},

		// return text string value by adding up ascii value
		// so the text is somewhat sorted when using a digital sort
		// this is NOT an alphanumeric sort
		getTextValue: function( a, num, mx ) {
			if ( mx ) {
				// make sure the text value is greater than the max numerical value (mx)
				var i,
					l = a ? a.length : 0,
					n = mx + num;
				for ( i = 0; i < l; i++ ) {
					n += a.charCodeAt(i);
				}
				return num * n;
			}
			return 0;
		},

		// Sort which gives numerical value to any text within the column
		numericAsc : function( a, b, num, mx, col, abelt ) {
			if ( a === b ) { return 0; }
			var e = abelt.vars.string[ ( abelt.vars.empties[ col ] || abelt.options.sort.emptyTo ) ];
			if ( a === '' && e !== 0 ) { return typeof e === 'boolean' ? ( e ? -1 : 1 ) : -e || -1; }
			if ( b === '' && e !== 0 ) { return typeof e === 'boolean' ? ( e ? 1 : -1 ) : e || 1; }
			if ( isNaN( a ) ) { a = $abelt.sorters.getTextValue( a, num, mx ); }
			if ( isNaN( b ) ) { b = $abelt.sorters.getTextValue( b, num, mx ); }
			return a - b;
		},

		numericDesc : function( a, b, num, mx, col, abelt ) {
			if ( a === b ) { return 0; }
			var e = abelt.vars.string[ ( abelt.vars.empties[ col ] || abelt.options.sort.emptyTo ) ];
			if ( a === '' && e !== 0 ) { return typeof e === 'boolean' ? ( e ? -1 : 1 ) : e || 1; }
			if ( b === '' && e !== 0 ) { return typeof e === 'boolean' ? ( e ? 1 : -1 ) : -e || -1; }
			if ( isNaN( a ) ) { a = $abelt.sorters.getTextValue( a, num, mx ); }
			if ( isNaN( b ) ) { b = $abelt.sorters.getTextValue( b, num, mx ); }
			return b - a;
		},

		numeric : function( a, b ) {
			return a - b;
		}

	},

/*
 _       _ _   _
| |_ _ _|_| |_| |
| . | | | | | . |
|___|___|_|_|___|
*/

	build : {

		headers : function( abelt ) {
			var icon, lock, time,
				o = abelt.options,
				v = abelt.vars,
				// only grab the first class name from css.ignore; in case there are more than one
				ignoreClass = '.' + o.css.ignore.split( $abelt.regex.lists )[0];

			abelt.vars.originalHeaders = [];
			if ( $abelt.debug && o.debug ) {
				time = new Date();
			}
			// children tr in tfoot - see issue #196 & #547
			v.columns = $abelt.utility.computeIndexes( abelt.$table.children( 'thead, tfoot' ).children( 'tr' ) );
			// only add icon if css.icon option exists
			icon = o.css.icon ? '<i class="' +
				( o.css.icon === $abelt.css.icon ? $abelt.css.icon : o.css.icon + ' ' + $abelt.css.icon ) + '"></i>' : '';
			// redefine abelt.$headers here in case of an updateAll that replaces or adds an entire header cell
			abelt.$headers = abelt.$table.children( 'thead' )
			.children( 'tr' ).not( ignoreClass )
			.children( o.selectors.headers )
			.each( function( columnIndex ) {
				var header,
					template = o.sort.headerTemplate,
					$cell = $(this),
					$icon = $cell.find( '.' + $abelt.css.icon ),
					$inner = $cell.find( '.' + $abelt.css.headerInner ),
					// if $inner exists, get its contents (probably updating)
					contents = $inner.length ? $inner.html() : $cell.html(),
					// make sure to get header cell & not column indexed cell
					data = $abelt.utility.getColumnData( abelt, o.sort.headers, columnIndex, true );

				// save original header content
				abelt.vars.originalHeaders[ columnIndex ] = contents;

				if ( template === '{content}{icon}' && !$icon.length ) {
					// if only adding an icon, just append it (bypasses onRenderTemplate execution)
					$cell.append( icon );
				} else if ( template !== '{content}' ) {
					// if headerTemplate is empty, don't reformat the header cell
					// set up header template
					template = template.replace( /\{content\}/g, contents ).replace( /\{icon\}/g, hasIcon ? '' : icon );
					if ( $.isFunction( o.sort.onRenderTemplate ) ) {
						header = o.sort.onRenderTemplate.apply( $cell, [ columnIndex, template ] );
						// only change t if something is returned
						if ( header && typeof header === 'string' ) { template = header; }
					}
					$cell.html( template );
				}

				/*************************************************************
					Considering completely removing headerInner as Firefox now
					allows position:relative to be set on table cells
				**************************************************************/
				// starting to not care about IE... this works fine
				$cell.each( function() {
					var $this = $( this );
					if ( !$this.find( '.' + $abelt.css.headerInner ).length ) {
						$this.wrapInner( '<div class="' + $abelt.css.headerInner + '"/>' );
					}
				});

				if ( $.isFunction( o.sort.onRenderHeader ) ) {
					o.sort.onRenderHeader.apply( $cell, [ columnIndex, abelt ] );
				}
				v.sortOrder[ columnIndex ] =
					$abelt.sort.formatOrder( $abelt.utility.getData( $cell, data, 'sortInitialOrder' ) || o.sort.initialOrder ) ?
					[ 1,0,2 ] : [ 0,1,2 ];
				v.sortCount[ columnIndex ] = -1; // set to -1 because clicking on the header automatically adds one
				v.lockedOrder[ columnIndex ] = false;
				lock = $abelt.utility.getData( $cell, data, 'lockedOrder' ) || false;
				if ( lock !== undefined && lock !== false ) {
					v.sortOrder[ columnIndex ] = v.lockedOrder = $abelt.sort.formatOrder( lock ) ? [ 1,1,1 ] : [ 0,0,0 ];
				}
				$cell.addClass( $abelt.css.headerCells + ' ' + o.css.headerCells );
				// add to parent in case there are multiple rows
				$cell.parent().addClass( $abelt.css.headerRow + ' ' + o.css.headerRow ).attr( 'role', 'row' );
				// allow keyboard cursor to focus on element
				if ( o.sort.tabIndex ) {
					$cell.attr( 'tabindex', 0 );
				}
			}).attr({
				scope: 'col',
				role : 'columnheader'
			});
			// enable/disable sorting
			$abelt.sort.updateHeader( abelt );
			if ( $abelt.debug && o.debug ) {
				console.log( 'Built headers:' + $abelt.benchmark( time ) );
				console.log( abelt.$headers );
			}
		},

		updateAll : function( abelt, callback ) {
			abelt.flags.isUpdating = true;
			$abelt.widgets.refresh( abelt, true, true );
			$abelt.build.headers( abelt );
			// rebind abelt widget methods
			$abelt.utility.bindMethods( abelt );
			// rebind sort methods
			$abelt.sort.bindEvents( abelt, abelt.$headers, true );
			// updateRows
			$abelt.build.update( abelt, callback );
		}

	}

});

$abelt.widget.add({
	id: 'sort',
	// widget options are added to 'abelt.options.{widget-name}'
	// => 'abelt.options.sort'
	options: {
		// *** appearance
		headerTemplate   : '{content}{icon}', // header layout template (HTML ok); {content} = innerHTML, {icon} = <i/> (class from cssIcon)
		onRenderTemplate : null,       // function(index, template){ return template; }, (template is a string)
		onRenderHeader   : null,       // function(index){}, (nothing to return)

		// *** functionality
		multiSortKey     : 'shiftKey', // key used to select additional columns
		resetKey         : 'ctrlKey',  // key used to remove sorting on a column
		serverSide       : false,      // if true, server-side sorting should be performed because client-side sorting will be disabled, but the ui and events will still be used.
		resort           : true,       // default setting to trigger a resort after an "updateRows", "addRows", "updateCell", etc has completed
		tabIndex         : true,       // add tabindex to header for keyboard accessibility
		delayInit        : false,      // if false, the parsed table contents will not update until the first sort
		clickDelay       : 250,        // minimum click delay allowed (in milliseconds) between mousedown and mouseup (prevents resizable widget from initializing a sort)

		// sort options
		headers          : {},         // set sorter, string, empty, locked order, initialOrder, filter, etc.
		ignoreCase       : true,       // ignore case while sorting
		force            : null,       // column(s) first sorted; always applied
		list             : [],         // Initial sort order; applied initially; updated when manually sorted
		append           : null,       // column(s) sorted last; always applied

		initialOrder     : 'asc',      // sort direction on first click
		localeCompare    : false,      // replace equivalent character (accented characters)
		reset            : false,      // third click on the header will reset column to default - unsorted
		restart          : false,      // restart sort to 'initialOrder' when clicking on previously unsorted columns

		emptyTo          : 'bottom',   // sort empty cell to bottom, top, none, zero
		stringTo         : 'max',      // sort strings in numerical column as max, min, top, bottom, zero
		textSorter       : null,       // choose overall or specific column sorter function(a, b, direction, table, columnIndex) [alt: abelt.sortText]
		numberSorter     : null,       // choose overall numeric sorter function(a, b, direction, maxColumnValue)

		// callbacks
		initialized      : null        // function( abelt ){},
	},
	// widget settings are added to 'abelt'
	settings : {
		// the following block will be added to 'abelt.options'
		options : {
			// css class names => abelt.options.css
			css : {
				sortNone    : '',
				sortAsc     : '',
				sortDesc    : '',
				sortActive  : '', // applied with sortAsc or sortDesc
				headerInner : '',
				icon        : 'abelt-icon', //  an <i> will only be added to the header if this class exists & the headerTemplate has an {icon}
				iconNone    : '', // class name added to the icon when there is no column sort
				iconAsc     : '', // class name added to the icon when the column has an ascending sort
				iconDesc    : '', // class name added to the icon when the column has a descending sort
				noSort      : 'abelt-noSort' // class name added to element inside header; clicking on it won't cause a sort
			},

			// selectors => abelt.options.selectors
			selectors : {
				sort       : 'th, td', // jQuery selector of content within selectorHeaders that is clickable to trigger a sort
				sortTarget : 'th, td'  // target of sort classes (sortAsc, sortDec & sortNone; not sortActive)
			},

			// event names => abelt.options.events
			events : {
				// updateAll is here & not in module-cache because this is like a normal update, but
				// the headers need to be updated
				updateAll   : 'updateAll',
				// on table
				sortDestroy : 'sortDestroy',
				sortStart   : 'sortStart',
				sortBegin   : 'sortBegin',
				sortEnd     : 'sortEnd',
				sortReset   : 'sortReset',
				sorton      : 'sorton',

				// a sort is applied to header cells (th, td)
				sort        : 'sort',

				// applied to user defined objects within the header ( using selectors.sort )
				// only one event name allowed
				mouseup     : 'mouseup',
				mousedown   : 'mousedown',
				keyup       : 'keyup',
				click       : 'click',

				// sort widget initialized
				sortInit    : 'sort-init'

			}
		},

		// table specific Internal variables => abelt.vars
		vars : {
			// digit column; sort text location
			string   : { 'max': 1, 'min': -1, 'zero': 0, 'none': 0, 'null': 0, 'top': true, 'bottom': false },

			// values previously stored in each header cell
			sortDisabled : [],
			sortCount    : [],
			sortOrder    : [],
			lockedOrder  : []
		}

	}, // end settings

	init: function( abelt ) {
		$abelt.sort.init( abelt );
	},

	// only update to complete sorter initialization
	update: function( abelt ) {
		if ( !abelt.flags.sortInit ) {
			$abelt.sort.initComplete( abelt );
		}
	},

	remove: function( abelt, refreshing ) {
		if ( refreshing ) { return; }
		$abelt.sort.destroy( abelt );
	},

	// no remove function because is refreshWidgets, or updateAll
	// is called, the sorter is removed and reapplied causing problems.
	priority: 0,
	type: 'core'
});

})( jQuery );
