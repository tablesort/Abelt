/* jQuery Abelt cache module - updated 11/13/2014 (v1.0.0-alpha.3)
 _____ _____ _____ __  _____
|  _  | __  |   __|  ||_   _|
|     | __ -|   __|  |__| |
|__|__|_____|_____|_____|_| Cache Module
*/
/*jshint browser:true, jquery:true */
;( function ( $, undefined ) {
'use strict';

var $abelt = $.abelt;

$.extend( true, $abelt, {

/*
 ___ ___ ___ ___ ___ ___
| . | .'|  _|_ -| -_|  _|
|  _|__,|_| |___|___|_|
|_|
*/
	parser : {

		init : function( abelt ) {

			// add caching events
			$.extend( true, abelt, {

				options : {
					// text extraction method/function - function(node, abelt, cellIndex){}
					textExtraction   : null,
					// data-attribute that contains alternate cell text (used in textExtraction function)
					textAttribute    : 'data-text',

					events : {
						addRows        : 'addRows',
						appendCache    : 'appendCache',
						updateCell     : 'updateCell',

						// note that this 'update' replaces the core 'update' function; 'updateRows' event is included
						// because of prototype - see issue #217 (https://github.com/Mottie/tablesorter/issues/217)
						updateRows     : 'updateRows',
						updateComplete : 'updateComplete'
					},

					// a place for parser options
					parsers : {}

					// to do
					// useWebWorkers    : true,       // ************* Still needs coding *************
				},

				// internal variables
				vars : {
					parsers  : [],
					cache    : [],
					strings  : {},
					empties  : {}
				},

				// internal flags
				flags : {
					isUpdating: true
				}

			}, abelt );

			var o = abelt.options,
				events = [
					o.events.addRows,
					o.events.appendCache,
					o.events.updateCell,
					o.events.updateRows,
					o.events.updateComplete,
					''
				].join( abelt.namespace + ',' ).split( ',' );

			abelt.$table
				// addRows
				.on( events[ 0 ], function( e, $row, callback ) {
					e.stopPropagation();
					$abelt.build.addRows( $row, callback );
				})
				// appendCache
				.on( events[ 1 ], function( e, callback, init ) {
					e.stopPropagation();
					$abelt.build.append( abelt, callback, init );
				})
				// updateCell
				.on( events[ 2 ], function( e, cell, resort, callback ) {
					e.stopPropagation();
					$abelt.build.updateCell( abelt, cell, resort, callback );
				})
				// updateRows
				.on( events[ 3 ], function( e, callback ) {
					e.stopPropagation();
					abelt.flags.isUpdating = true;
					$abelt.build.update( abelt, callback );
				})
				// updateComplete
				.on( events[ 4 ], function() {
					abelt.flags.isUpdating = false;
				});

		},

		add : function( parser, replaceParser ) {
			var index,
				len = $abelt.parsers.length,
				name = parser.id.toString().toLowerCase(),
				isNew = true;
			for ( index = 0; index < len; index++ ) {
				if ( $abelt.parsers[ index ].id.toLowerCase() === name ) {
					if ( replaceParser ) {
						$abelt.parsers[ index ] = parser;
						if ( $abelt.debug ) {
							console.log( 'Replaced ' + parser.id + ' with a newly defined parser' );
						}
					}
					isNew = false;
				}
			}
			if ( isNew ) {
				$abelt.parsers.push( parser );
				if ( $abelt.debug ) {
					console.log( parser.id + ' parser added' );
				}
			}
		},

		get : function( id ) {
			var index,
				name = id.toString().toLowerCase(),
				len = $abelt.parsers.length;
			for ( index = 0; index < len; index++ ) {
				if ( $abelt.parsers[ index ].id.toLowerCase() === name ) {
					return $abelt.parsers[ index ];
				}
			}
			return false;
		},

		detect: function( abelt, rows, rowIndex, cellIndex ) {
			var parser, $node,
				o = abelt.options,
				index = $abelt.parsers.length,
				node = false,
				nodeValue = '',
				keepLooking = true;
			while ( nodeValue === '' && keepLooking ) {
				rowIndex++;
				if ( rows[ rowIndex ] ) {
					node = rows[ rowIndex ].cells[ cellIndex ];
					nodeValue = $abelt.utility.getText( abelt, node, cellIndex );
					$node = $( node );
					if ( o.debug ) {
						console.log( 'Checking if value was empty on row ' + rowIndex + ', column: ' + cellIndex +
							': "' + nodeValue + '"' );
					}
				} else {
					keepLooking = false;
				}
			}
			while ( --index >= 0 ) {
				parser = $abelt.parsers[ index ];
				// ignore the default text parser because it will always be true
				if ( parser && parser.id !== 'text' && parser.is && parser.is( nodeValue, abelt, node, $node ) ) {
					return parser;
				}
			}
			// nothing found, return the generic parser (text)
			return $abelt.parser.get('text');
		}

	},

	regex : {
		nonDigit : /[^\w,. \-()]/g
	},

	// essential default parsers
	parsers : [{
		id: 'no-parser',
		is: function() {
			return false;
		},
		format: function() {
			return '';
		},
		type: 'text'
	},{
		// Text parser (default & fallback)
		id: 'text',
		is: function() {
			return true;
		},
		format: function( str, abelt ) {
			var o = abelt.options;
			if ( str ) {
				str = $.trim( o.sort && o.sort.ignoreCase ? str.toLocaleLowerCase() : str );
				str = o.sortLocaleCompare && $abelt.utility.replaceAccents ? $abelt.utility.replaceAccents( str ) : str;
			}
			return str;
		},
		type: 'text'
	},{
		// Numeric (removes all non-numeric characters)
		id: 'digit',
		is: function( str ) {
			return $abelt.utility.isDigit( str );
		},
		format: function( str, abelt ) {
			var o = abelt.options,
				numbr = $abelt.utility.formatFloat( ( str || '' ).replace( $abelt.regex.nonDigit, '' ), abelt );
			return str && typeof numbr === 'number' ?
				numbr : str ? $.trim( str && o.sort && o.sort.ignoreCase ? str.toLocaleLowerCase() : str ) : str;
		},
		type: 'numeric'
	}],

/*   _   _ _ _ _
 _ _| |_|_| |_| |_ _ _
| | |  _| | | |  _| | |
|___|_| |_|_|_|_| |_  |
                  |___|
*/

	utility: {

		getText : function( abelt, node, cellIndex ) {
			if ( !node ) { return ''; }
			var columnExtract,
				o = abelt.options,
				$node = $( node ),
				txtExtract = o.textExtraction || '';
			if ( typeof txtExtract === 'string' ) {
				// check data-attribute first when set to "basic"; don't use node.innerText - it's really slow!
				return $.trim( ( txtExtract === 'basic' ? $node.attr( o.textAttribute ) || node.textContent : node.textContent ) || $node.text() || '' );
			} else {
				if ( typeof txtExtract === 'function' ) {
					return $.trim( txtExtract( node, abelt, cellIndex ) );
				} else if ( typeof ( columnExtract = $abelt.getColumnData( abelt, txtExtract, cellIndex ) ) === 'function' ) {
					return $.trim( columnExtract( node, abelt, cellIndex ) );
				}
			}
			// fallback
			return $.trim( node.textContent || $node.text() || '' );
		},

		// used when replacing accented characters for sorting & filtering
		characterEquivalents : {
			'a' : '\u00e1\u00e0\u00e2\u00e3\u00e4\u0105\u00e5', // áàâãäąå
			'A' : '\u00c1\u00c0\u00c2\u00c3\u00c4\u0104\u00c5', // ÁÀÂÃÄĄÅ
			'c' : '\u00e7\u0107\u010d', // çćč
			'C' : '\u00c7\u0106\u010c', // ÇĆČ
			'e' : '\u00e9\u00e8\u00ea\u00eb\u011b\u0119', // éèêëěę
			'E' : '\u00c9\u00c8\u00ca\u00cb\u011a\u0118', // ÉÈÊËĚĘ
			'i' : '\u00ed\u00ec\u0130\u00ee\u00ef\u0131', // íìİîïı
			'I' : '\u00cd\u00cc\u0130\u00ce\u00cf', // ÍÌİÎÏ
			'o' : '\u00f3\u00f2\u00f4\u00f5\u00f6', // óòôõö
			'O' : '\u00d3\u00d2\u00d4\u00d5\u00d6', // ÓÒÔÕÖ
			'ss': '\u00df', // ß (s sharp)
			'SS': '\u1e9e', // ẞ (Capital sharp s)
			'u' : '\u00fa\u00f9\u00fb\u00fc\u016f', // úùûüů
			'U' : '\u00da\u00d9\u00db\u00dc\u016e' // ÚÙÛÜŮ
		},

		replaceAccents : function( str ) {
			var accent,
				regex = '[',
				equiv = $abelt.utility.characterEquivalents;
			if ( !$abelt.regex.replaceAccents ) {
				// cached regex is faster than using new RegExp
				$abelt.regex.replaceAccentsArray = {};
				for ( accent in equiv ) {
					if ( typeof accent === 'string' ) {
						regex += equiv[ accent ];
						$abelt.regex.replaceAccentsArray[ accent ] = new RegExp( '[' + equiv[ accent ] + ']', 'g' );
					}
				}
				$abelt.regex.replaceAccents = new RegExp( regex + ']' );
			}
			if ( $abelt.regex.replaceAccents.test( str ) ) {
				for ( accent in equiv ) {
					if ( typeof accent === 'string' ) {
						str = str.replace( $abelt.regex.replaceAccentsArray[ accent ], accent );
					}
				}
			}
			return str;
		}

	},

/*
 _       _ _   _
| |_ _ _|_| |_| |
| . | | | | | . |
|___|___|_|_|___|
*/

	build: {

		// previously buildParserCache
		parserCache: function( abelt ) {
			var rows, cols, columnIndex, $cell, optionHeaders, noparser, parser, extractor, time,
				o = abelt.options,
				v = abelt.vars,
				// update table bodies in case we start with an empty table
				$tbodies = abelt.$tbodies = abelt.$table.children(' tbody:not(.' + o.css.ignore + ')' ),
				tbodyIndex = 0,
				debug = {},
				list = {
					extractors: [],
					parsers: []
				},
				len = $tbodies.length;
			if ( !$abelt.utility.getColumnData ) {
				return $abelt.debug && o.debug ? console.warn( '-> The module-utilities.js file is required to parse the table' ) : '';
			} else if ( len === 0 ) {
				return $abelt.debug && o.debug ? console.warn( '-> Warning: *Empty table!* Not building a parser cache' ) : '';
			} else if ( $abelt.debug && o.debug ) {
				time = new Date();
				console[ console.group ? 'group' : 'log' ]( 'Detecting parsers for each column' );
			}
			while ( tbodyIndex < len ) {
				rows = $tbodies[ tbodyIndex ].rows;
				if ( rows.length ) {
					cols = v.columns; // rows[j].cells.length;
					for ( columnIndex = 0; columnIndex < cols; columnIndex++ ) {
						$cell = abelt.$headers.filter( '[data-column="' + columnIndex + '"]:last' );
						// get column indexed table cell
						optionHeaders = $abelt.utility.getColumnData( abelt, optionHeaders, columnIndex );
						// get column parser/extractor
						extractor = $abelt.parser.get( $abelt.utility.getData( $cell, optionHeaders, 'extractor' ) );
						parser = $abelt.parser.get( $abelt.utility.getData( $cell, optionHeaders, 'sorter' ) );
						noparser = $abelt.utility.getData( $cell, optionHeaders, 'parser' ) === 'false';
						// empty cells behaviour - keeping emptyToBottom for backwards compatibility
						v.empties[ columnIndex ] = ( $abelt.utility.getData( $cell, optionHeaders, 'empty') ||
							o.sort && o.sort.emptyTo || 'bottom' ).toLowerCase();
						// text strings behaviour in numerical sorts
						v.strings[ columnIndex ] = ( $abelt.utility.getData( $cell, optionHeaders, 'string') ||
							o.sort && o.sort.stringTo || 'max' ).toLowerCase();
						if ( noparser ) {
							parser = $abelt.parser.get( 'no-parser' );
						}
						if ( !extractor ) {
							// For now, maybe detect someday
							extractor = false;
						}
						if ( !parser ) {
							parser = $abelt.parser.detect( abelt, rows, -1, columnIndex );
						}
						if ( $abelt.debug && o.debug ) {
							debug[ '(' + columnIndex + ') ' + $cell.text() ] = {
								extractor : extractor ? extractor.id : 'none',
								parser : parser.id,
								string : v.strings[ columnIndex ],
								empty  : v.empties[ columnIndex ]
							};
						}
						list.parsers[ columnIndex ] = parser;
						list.extractors[ columnIndex ] = extractor;
					}
				}
				tbodyIndex += ( list.parsers.length ) ? len : 1;
			}
			if ( $abelt.debug && o.debug ) {
				if ( !$.isEmptyObject( debug ) ) {
					console[ console.table ? 'table' : 'log' ]( debug );
				} else {
					console.warn( '  No parsers detected!' );
				}
				console.log( 'Completed detecting parsers' + $abelt.benchmark( time ) );
				if ( console.groupEnd ) { console.groupEnd(); }
			}
			v.parsers = list.parsers;
			v.extractors = list.extractors;
		},

		// previously buildCache
		cache: function( abelt ) {
			var cache, cacheIndex, text, txt, parsed, tbodyIndex, rowIndex, cellIndex,
				$row, rows, cols, time, totalRows, rowData, colMax,
				o = abelt.options,
				v = abelt.vars,
				$tbodies = abelt.$tbodies,
				extractors = v.extractors,
				parsers = v.parsers;
			v.cache = {};
			v.totalRows = 0;
			// if no parsers found, return - it's an empty table.
			if ( !parsers.length ) {
				return $abelt.debug && o.debug ? console.warn( 'Warning: *Empty table!* Not building a cache' ) : '';
			}
			if ( $abelt.debug && o.debug ) { time = new Date(); }
			// processing icon
			if ( o.showProcessing ) {
				$abelt.utility.isProcessing( abelt, true );
			}
			for ( tbodyIndex = 0; tbodyIndex < $tbodies.length; tbodyIndex++ ) {
				colMax = []; // column max value per tbody
				cache = v.cache[ tbodyIndex ] = {
					normalized: [] // array of normalized row data; last entry contains 'rowData' above
					// colMax: #   // added at the end
				};
				totalRows = ( $tbodies[ tbodyIndex ] && $tbodies[ tbodyIndex ].rows.length ) || 0;
				for ( rowIndex = 0; rowIndex < totalRows; ++rowIndex ) {
					rowData = {
						// order: original row order #
						// $row : jQuery Object[]
						child: [], // child row text (filter widget)
						raw: [] // original cell text
					};
					/** Add the table data to main data array */
					$row = $( $tbodies[ tbodyIndex ].rows[ rowIndex ] );
					cols = [];
					// if this is a child row, add it to the last row's children and continue to the next row
					// ignore child row class, if it is the first row
					if ( $row.hasClass( o.css.childRow ) && rowIndex !== 0 ) {
						cacheIndex = cache.normalized.length - 1;
						cache.normalized[ cacheIndex ][ v.columns ].$row =
							cache.normalized[ cacheIndex ][ v.columns ].$row.add( $row );
						// add 'hasChild' class name to parent row
						if ( !$row.prev().hasClass( o.css.childRow ) ) {
							$row.prev().addClass( abelt.css.hasChild );
						}
						// save child row content (un-parsed!)
						rowData.child[ cacheIndex ] =
							$.trim( $row[ 0 ].textContent || $row[ 0 ].innerText || $row.text() || '' );
						// go to the next for loop
						continue;
					}
					rowData.$row = $row;
					rowData.order = rowIndex; // add original row position to rowCache
					for ( cellIndex = 0; cellIndex < v.columns; ++cellIndex ) {
						if ( parsers[ cellIndex ] === undefined ) {
							if ( $abelt.debug && o.debug ) {
								console.warn( 'No parser found for cell:', $row[ 0 ].cells[ cellIndex ], 'does it have a header?' );
							}
							continue;
						}
						text = $abelt.utility.getText( abelt, $row[ 0 ].cells[ cellIndex ], cellIndex );
						rowData.raw.push( text ); // save original cell text
						// do extract before parsing if there is one
						if ( extractors[ cellIndex ].id === undefined ) {
							txt = text;
						} else {
							txt = extractors[ cellIndex ].format( text, abelt, $row[ 0 ].cells[ cellIndex ], cellIndex );
						}
						// allow parsing if the string is empty, previously parsing would change it to zero,
						// in case the parser needs to extract data from the table cell attributes
						parsed = parsers[ cellIndex ].id === 'no-parser' ? '' : parsers[ cellIndex ].format( txt, abelt, $row[ 0 ].cells[ cellIndex ], cellIndex );
						cols.push( o.sort && o.sort.ignoreCase && typeof parsed === 'string' ? parsed.toLowerCase() : parsed );
						if ( ( parsers[ cellIndex ].type || '' ).toLowerCase() === 'numeric' ) {
							// determine column max value (ignore sign)
							colMax[ cellIndex ] = Math.max( Math.abs( parsed ) || 0, colMax[ cellIndex ] || 0 );
						}
					}
					// ensure rowData is always in the same location (after the last column)
					cols[ v.columns ] = rowData;
					cache.normalized.push( cols );
				}
				cache.colMax = colMax;
				// total up rows, not including child rows
				v.totalRows += cache.normalized.length;
			}
			if ( o.showProcessing ) {
				$abelt.utility.isProcessing( abelt ); // remove processing icon
			}
			if ( $abelt.debug && o.debug ) {
				console.log( 'Building cache for ' + totalRows + ' rows' + $abelt.benchmark( time ) );
			}
		},

		update : function( abelt, callback ) {
			var o = abelt.options;
			abelt.flags.isUpdating = true;

			// remove rows/elements before update
			abelt.$table.find( o.selectors.remove ).remove();
			// rebuild parsers
			$abelt.build.parserCache( abelt );
			// rebuild the cache map
			$abelt.build.cache( abelt );
			abelt.flags.isUpdating = false;
			// need to fix this; replace sort check when queue system is in place
			if ( $abelt.sort && $abelt.sort.checkResort ) {
				$abelt.sort.checkResort( abelt, false, callback );
			} else if ( $.isFunction( callback ) ) {
				callback( abelt );
			}

		},

		// init flag (true) used by pager plugin to prevent widget application
		append : function( abelt, callback, init ) {
			var $tbody, tbodyIndex, time,
				o = abelt.options,
				v = abelt.vars,
				$tbodies = abelt.$tbodies,
				len = $tbodies.length,
				rows = [],
				cache = v.cache;
			// empty table - fixes #206/#346
			if ( $.isEmptyObject( cache ) ) {
				// run pager appender in case the table was just emptied
				return abelt.functions.appender ? abelt.functions.appender( abelt, rows ) :
					abelt.flags.isUpdating ? abelt.$table.trigger( o.events.updateComplete, abelt ) : ''; // Fixes #532
			}
			if ( $abelt.debug && o.debug ) {
				time = new Date();
			}
			for ( tbodyIndex = 0; tbodyIndex < len; tbodyIndex++ ) {
				$tbody = $tbodies.eq( tbodyIndex );
				if ( $tbody.length ) {
					// get tbody
					/*jshint loopfunc : true */
					$abelt.utility.processTbody( abelt, $tbody, function( $tb ) {
						var rowIndex,
							normalized = cache[ tbodyIndex ].normalized,
							totalRows = normalized.length;
						for ( rowIndex = 0; rowIndex < totalRows; rowIndex++ ) {
							rows.push( normalized[ rowIndex ][ v.columns ].$row );
							// removeRows used by the pager plugin; don't render if using ajax - fixes #411
							if ( !abelt.functions.appender || ( $abelt.widget.has( 'pager' ) && o.pager.removeRows && !o.pager.ajax ) ) {
								$tb.append( normalized[ rowIndex ][ v.columns ].$row );
							}
						}
					});
				}
			}
			if ( abelt.functions.appender ) {
				abelt.functions.appender( abelt, rows );
			}
			if ( $abelt.debug && o.debug ) {
				console.log( 'Rebuilt table' + $abelt.benchmark( time ) );
			}
			// apply table widgets; but not before ajax completes
			if ( !init && !abelt.functions.appender ) {
				$abelt.widget.apply( abelt );
			}
			if ( abelt.flags.isUpdating ) {
				abelt.$table.trigger( o.events.updateComplete, abelt );
			}
			if ( $.isFunction( callback ) ) {
				callback( abelt );
			}
		},

		addRows : function( abelt, $row, callback ) {
			abelt.flags.isUpdating = true;
			if ( $.isEmptyObject( abelt.vars.cache ) ) {
				// empty table, do an update instead - fixes #450
				$abelt.build.update( abelt, callback );
			} else {
				// make sure we're using a jQuery object
				$row = $( $row ).attr( 'role', 'row' );
				var rowIndex, cellIndex, len, text, value, rowData, cells,
					o = abelt.options,
					v = abelt.vars,
					$table = abelt.$table,
					rows = $row.filter( 'tr' ).length,
					tbodyIndex = abelt.$tbodies.index( $row.closest( 'tbody' ) );

				// fixes adding rows to an empty table - see issue #179
				if ( !( v.parsers && v.parsers.length ) ) {
					$abelt.build.parserCache( abelt );
				}
				// add each row
				for ( rowIndex = 0; rowIndex < rows; rowIndex++ ) {
					len = $row[ rowIndex ].cells.length;
					cells = [];
					rowData = {
						child: [],
						$row : $row.eq( rowIndex ),
						order: v.cache[tbodyIndex].normalized.length
					};
					// add each cell
					for ( cellIndex = 0; cellIndex < len; cellIndex++ ) {
						text = $abelt.utility.getText( abelt, $row[ rowIndex ].cells[ cellIndex ], cellIndex );
						if ( v.extractors[ cellIndex ].id !== undefined ) {
							text = v.extractors[ cellIndex ].format( text, abelt.table, $row[ rowIndex ].cells[ cellIndex ], cellIndex );
						}
						value = v.parsers[ cellIndex ].id === 'no-parser' ? '' :
							v.parsers[ cellIndex ].format( text, abelt.table, $row[ rowIndex ].cells[ cellIndex ], cellIndex );
						cells[ cellIndex ] = o.sort && o.sort.ignoreCase && typeof value === 'string' ? value.toLowerCase() : value;
						if ( ( v.parsers[ cellIndex ].type || '').toLowerCase() === 'numeric' ) {
							// update column max value (ignore sign)
							v.cache[ tbodyIndex ].colMax[ cellIndex ] = Math.max(
								Math.abs( cells[ cellIndex ] ) || 0, v.cache[ tbodyIndex ].colMax[ cellIndex ] || 0
							);
						}
					}
					// add the row data to the end
					cells.push( rowData );
					// update cache
					v.cache[ tbodyIndex ].normalized.push( cells );
				}
				// resort using current settings - need to fix this; replace sort check when queue system is in place
				if ( $abelt.sort.checkResort ) {
					$abelt.sort.checkResort( abelt, false, callback );
				}
			}
			if ( $.isFunction( callback ) ) {
				callback( abelt );
			}
		},

		updateCell : function( abelt, cell, resort, callback ) {
			abelt.flags.isUpdating = true;
			abelt.$table.find( abelt.options.selectors.remove ).remove();

			// get position from the dom
			var value, text, row, cellIndex,
				o = abelt.options,
				v = abelt.vars,
				$tbody = abelt.$tbodies,
				$cell = $( cell ),
				// update cache - format: function(s, table, cell, cellIndex)
				tbodyIndex = $tbody.index( $cell.closest( 'tbody' ) ),
				$row = $cell.closest( 'tr' );
			// in case cell is a jQuery object
			cell = $cell[ 0 ];
			// tbody may not exist if update is initialized while tbody is removed for processing
			if ( $tbody.length && tbodyIndex >= 0 ) {
				// eventually fix this to work with colspan/rowspan in tbody
				row = $tbody.eq( tbodyIndex ).children( 'tr' ).index( $row );
				cellIndex = $cell.index();

				v.cache[ tbodyIndex ].normalized[ row ][ v.columns ].$row = $row;
				if ( v.extractors[ cellIndex ].id === undefined ) {
					text = $.abelt.utility.getText( abelt, cell, cellIndex );
				} else {
					text = v.extractors[ cellIndex ].format( $.abelt.utility.getText( abelt, cell, cellIndex), abelt, cell, cellIndex );
				}
				value = v.parsers[ cellIndex ].id === 'no-parser' ? '' :
					v.parsers[ cellIndex ].format( text, abelt, cell, cellIndex );
				v.cache[ tbodyIndex ].normalized[ row ][ cellIndex ] = o.sort && o.sort.ignoreCase && typeof value === 'string' ? value.toLowerCase() : value;
				if ( ( v.parsers[ cellIndex ].type || '' ).toLowerCase() === 'numeric' ) {
					// update column max value (ignore sign)
					v.cache[ tbodyIndex ].colMax[ cellIndex ] = Math.max( Math.abs( value ) || 0, v.cache[ tbodyIndex ].colMax[ cellIndex ] || 0 );
				}
				// resort using current settings - need to fix this; replace sort check when queue system is in place
				if ( $abelt.sort.checkResort ) {
					value = resort !== 'undefined' ? resort : o.resort;
					if ( !value ) {
						// widgets will be reapplied
						$abelt.sort.checkResort( abelt, value, callback );
					} else {
						// don't reapply widgets is resort is false, just in case it causes
						// problems with element focus
						if ( $.isFunction( callback ) ) {
							callback( abelt );
						}
						abelt.$table.trigger('updateComplete', c.table);
					}
				}
			}
			if ( $.isFunction( callback ) ) {
				callback( abelt );
			}
		}

	}

});

})( jQuery );
