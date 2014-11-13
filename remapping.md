```
 _____                       _
| __  |___ _____ ___ ___ ___|_|___ ___
|    -| -_|     | .'| . | . | |   | . |
|__|__|___|_|_|_|__,|  _|  _|_|_|_|_  |
                    |_| |_|       |___|
Tablesorter to Abelt

* [All]   = all files
* [Core]  = abelt.js
* [Cache] = module-cache.js
* [Sort]  = widget-sort.js
* [Store] = module-storage.js
* [Util]  = module-utilities.js
* [Zebra] = widget-zebra.js

         _   _
 ___ ___| |_|_|___ ___ ___
| . | . |  _| | . |   |_ -|
|___|  _|_| |_|___|_|_|___|
    |_|

    // *** appearance
    config.theme               => [Core]  abelt.options.theme
    config.widthFixed          => [Core]  abelt.options.widthFixed
    config.showProcessing      => [Core]  abelt.options.showProcessing

    config.headerTemplate      => [Sort]  abelt.options.sort.headerTemplate
    config.onRenderTemplate    => [Sort]  abelt.options.sort.onRenderTemplate
    config.onRenderHeader      => [Sort]  abelt.options.sort.onRenderHeader

    // *** functionality
    config.cancelSelection     => [Core]  abelt.options.cancelSelection
    config.tabIndex            => [Sort]  abelt.options.sort.tabIndex
    config.sortMultiSortKey    => [Sort]  abelt.options.sort.multisortKey
    config.sortResetKey        => [Sort]  abelt.options.sort.resetKey
    config.delayInit           => [Sort]  abelt.options.sort.delayInit
    config.serverSideSorting   => [Sort]  abelt.options.sort.serverSide
    config.dateFormat          => [Cache] abelt.options.dateFormat
    config.usNumberFormat      => [Util]  abelt.options.usNumberFormat

    // *** sort options
    config.headers             => [Sort]  abelt.options.sort.headers
    config.ignoreCase          => [Sort]  abelt.options.sort.ignoreCase
    config.sortForce           => [Sort]  abelt.options.sort.force
    config.sortList            => [Sort]  abelt.options.sort.list
    config.sortAppend          => [Sort]  abelt.options.sort.append
    config.sortStable          => [Sort]  abelt.options.sort.stable

    config.sortInitialOrder    => [Sort]  abelt.options.sort.initialOrder
    config.sortLocaleCompare   => [Sort]  abelt.options.sort.localeCompare
    config.sortReset           => [Sort]  abelt.options.sort.reset
    config.sortRestart         => [Sort]  abelt.options.sort.restart
    ** NEW **                  => [Sort]  abelt.options.sort.resort
    ** NEW **                  => [Sort]  abelt.options.sort.clickDelay

    config.emptyTo             => [Sort]  abelt.options.sort.emptyTo
    config.stringTo            => [Sort]  abelt.options.sort.stringTo
    config.textSorter          => [Sort]  abelt.options.sort.textSorter
    config.numberSorter        => [Sort]  abelt.options.sort.numberSorter
    config.textExtraction      => [Cache] abelt.options.textExtraction
    config.textAttribute       => [Cache] abelt.options.textAttribute

    // *** zebra widget options
    config.widgetOptions.zebra => [Zebra] - abelt.options.zebra = [ 'even', 'odd' ] ** REMOVED in v1.0.0-alpha.3 **
                                  [Zebra] - abelt.options.css.even ** new in v1.0.0-alpha.3 **
                                  [Zebra] - abelt.options.css.odd  ** new in v1.0.0-alpha.3 **

    // *** widget options
    config.widgets             => [Core]  abelt.options.widgets
    config.widgetOptions       => ** REMOVED **

    config.initWidgets         => [Core]  abelt.options.initWidgets
    config.widgetClass         => [Core]  abelt.options.widgetClass

    // *** callbacks
    config.initialized         => [Core]  abelt.options.initialized
    ** NEW **                  => [Sort]  abelt.options.sort.initalized

    // *** extra css class names
    config.tableClass          => [Core]  abelt.options.css.table
    config.cssHeader           => [Core]  abelt.options.css.headerCells ** changed in v1.0.0-alpha.3 **
    config.cssHeaderRow        => [Core]  abelt.options.css.headerRow
    config.cssProcessing       => [Core]  abelt.options.css.processing
    ** NEW **                  => [Core]  abelt.options.css.headerHover
    ** NEW **                  => [Core]  abelt.options.css.footerRow
    ** NEW **                  => [Core]  abelt.options.css.footerCells
    ** NEW **                  => [Core]  abelt.options.css.caption ** new in v1.0.0-alpha.3 **

    config.cssAsc              => [Sort]  abelt.options.css.sortAsc
    config.cssDesc             => [Sort]  abelt.options.css.sortDesc
    config.cssNone             => [Sort]  abelt.options.css.sortNone
    config.cssIcon             => [Core]  abelt.options.css.icon
    config.cssIconNone         => [Core]  abelt.options.css.iconNone
    config.cssIconAsc          => [Core]  abelt.options.css.iconAsc
    config.cssIconDesc         => [Core]  abelt.options.css.iconDesc
    ** NEW **                  => [Sort]  abelt.options.css.sortActive

    config.cssChildRow         => [Core]  abelt.options.childRow
    config.cssInfoBlock        => [Core]  abelt.options.css.ignore ** changed in v1.0.0-alpha.3 **
    config.cssAllowClicks      => [Sort]  abelt.options.css.allowClicks
    ** NEW **                  => [Core]  abelt.options.css.visible

    // *** selectors
    config.selectorHeaders     => [Core]  abelt.options.selectors.headers
    config.selectorRemove      => [Core]  abelt.options.selectors.remove
    config.selectorSort        => [Sort]  abelt.options.selectors.sort

    // *** advanced
    config.debug               => [Core]  abelt.options.debug
    ** NEW **                  => [Core]  $.abelt.debug // if set to false; uglify should remove all debug code

    // *** Internal variables
    config.headerList          => ** REMOVED **
    config.cache               => [Cache] abelt.vars.cache
    config.columns             => [Core]  abelt.vars.columns
    config.empties             => [Sort]  abelt.vars.empties
    config.string              => [Sort]  abelt.vars.string
    config.strings             => [Sort]  abelt.vars.strings
    config.parsers             => [Cache] abelt.vars.parsers
    config.extractors          => [Cache] abelt.vars.extractors

    // added to the DOM header cells
    headerCell.sortDisabled    => [Sort]  abelt.vars.sortDisabled
    headerCell.count           => [Sort]  abelt.vars.sortCount
    headerCell.order           => [Sort]  abelt.vars.sortOrder
    headerCell.lockedOrder     => [Sort]  abelt.vars.lockedOrder


    // to be added with filter_customVal
    config.cssIgnoreRow        => [Core]  abelt.options.css.ignoreRow

# Event Names

    config.namespace           => [Core]  abelt.namespace
    ** NEW **                  => [Core]  abelt.options.events.init
    ** NEW **                  => [Core]  abelt.options.events.widgetUpdate
    ** NEW **                  => [Core]  abelt.options.events.widgetApply
    ** NEW **                  => [Core]  abelt.options.events.widgetApplyAll
    ** NEW **                  => [Core]  abelt.options.events.widgetRemove
    ** NEW **                  => [Core]  abelt.options.events.widgetsRefresh
    ** NEW **                  => [Core]  abelt.options.events.destroy
    ** NEW **                  => [Core]  abelt.options.events.resetToLoadState

# Variables

    $.tablesorter                      => [Core]  $.abelt
    $.tablesorter.version              => [Core]  $.abelt.version
    $.tablesorter.widgets              => [Core]  $.abelt.widgets
    $.tablesorter.defaults             => [Core]  $.abelt.defaults
    $.tablesorter.regex                => [All]   $.abelt.regex
    $.tablesorter.parsers              => [Cache] $.abelt.parsers
    $.tablesorter.language             => [Sort]  $.abelt.language
    $.tablesorter.css                  => [All]   $.abelt.css
    $.tablesorter.css.table            => [Core]  $.abelt.css.table
    $.tablesorter.css.header           => [Core]  $.abelt.css.header
    $.tablesorter.css.headerRow        => [Core]  $.abelt.css.headerRow
    $.tablesorter.css.processing       => [Core]  $.abelt.css.processing
    $.tablesorter.css.hasChild         => [Core]  $.abelt.css.hasChild
    $.tablesorter.css.headerInner      => [Sort]  $.abelt.css.headerInner
    $.tablesorter.css.icon             => [Sort]  $.abelt.css.icon
    $.tablesorter.css.sortAsc          => [Sort]  $.abelt.css.sortAsc
    $.tablesorter.css.sortDesc         => [Sort]  $.abelt.css.sortDesc
    $.tablesorter.css.sortNone         => [Sort]  $.abelt.css.sortNone
    ** NEW **                          => [Sort]  $.abelt.css.sortActive

  ## New

      // global debug setting (if false, uglify should remove all debug code when compressing)
      [Core] $.abelt.debug = true;

 ___ ___ ___ ___
|  _| . |  _| -_|
|___|___|_| |___| functions

    $.tablesorter.construct(settings)                     => [Core]  $.abelt.construct( table, settings, callback )
    $.tablesorter.setup(table, c)                         => [Core]  $.abelt.setup( table, options, callback )
    $.tablesorter.destroy(table, removeClasses, callback) => [Core]  $.abelt.destroy( abelt, removeClasses, callback )
    $.tablesorter.storage(table, key, value, options)     => [Store] $.abelt.storage( table, key, value, options )

  ## Notable changes

      $.tablesorter.log        => [All] console.log
      $.tablesorter.benchmark  => [All] $.abelt.benchmark( time )

    Log a timed event as follows:

      if ( $.abelt.debug && abelt.options.debug ) {
          console.log( 'Completed in ' + $.abelt.benchmark(time) );
      }

 ___ _
|  _| |___ ___ ___
|  _| | .'| . |_ -|
|_| |_|__,|_  |___|
          |___|

    table.isUpdating        => abelt.flags.isUpdating
    table.isProcessing      => abelt.flags.isProcessing
    table.isApplyingWidgets => abelt.flags.isApplyingWidgets
    table.hasInitialized    => abelt.flags.init
    table.config.widgetInit => abelt.flags.widgetInit

       _   _         _
 _ _ _|_|_| |___ ___| |_
| | | | | . | . | -_|  _|
|_____|_|___|_  |___|_|  functions
            |___|

    $.tablesorter.addWidget(widget)                       => [Core] $.abelt.widget.add( widget, replaceWidget )
    $.tablesorter.getWidgetById(name)                     => [Core] $.abelt.widget.get( id )
    $.tablesorter.hasWidget(table, name)                  => [Core] $.abelt.widget.has( abelt, name )
    $.tablesorter.refreshWidgets(table, doAll, dontapply) => [Core] $.abelt.widget.refresh( abelt, doAll, dontApply )
    // abelt named parameter = specificly named widget(s) e.g. 'zebra filter' or undefined for all
    $.tablesorter.applyWidget(table, init)                => [Core] $.abelt.widget.apply( abelt, named, init )

  ## New

      [Core] $.abelt.widget.remove( abelt, named, callRemove ) // callRemove (boolean) to call widget remove function
      [Core] $.abelt.widget.update( abelt, callback )          // called when an update is triggered

     _   _ _ _ _
 _ _| |_|_| |_| |_ _ _
| | |  _| | | |  _| | |
|___|_| |_|_|_|_| |_  | functions & variables
                  |___|

    $.tablesorter.computeColumnIndex(trs)                             => [Core]  $.abelt.utility.computeIndexes( $rows )
    $.tablesorter.characterEquivalents                                => [Cache] $.abelt.utility.characterEquivalents
    $.tablesorter.replaceAccents(s)                                   => [Cache] $.abelt.utility.replaceAccents( str )
    $.tablesorter.getData(h, ch, key)                                 => [Util]  $.abelt.utility.getData( header, optionHearer, key )
    $.tablesorter.getColumnData(table, obj, indx, getCell, $headers)  => [Util]  $.abelt.utility.getColumnData( abelt, obj, indx, getCell )
    $.tablesorter.formatFloat(s, table)                               => [Util]  $.abelt.utility.formatFloat( str, abelt )
    $.tablesorter.isDigit(s)                                          => [Util]  $.abelt.utility.isDigit( str )
    $.tablesorter.isValueInArray(column, arry)                        => [Util]  $.abelt.utility.isValueInArray( value, arry )
    $.tablesorter.isProcessing(table, toggle, $ths)                   => [Util]  $.abelt.utility.isProcessing( abelt, toggle, $ths )

  ## Tablesorter (private functions) => Abelt public functions

      isEmptyObject(obj)                     => [All]   $.isEmptyObject() // jQuery function
      bindMethods(table)                     => [Core]  $.abelt.utility.bindMethods( abelt )
      fixColumnWidth(table)                  => [Core]  $.abelt.utility.fixColumnWidth( abelt )
      getElementText(table, node, cellIndex) => [Cache] $.abelt.utility.getText( abelt, node, cellIndex )

  ## New

      [Core] $.abelt.utility.setConstants( abelt ) // update stored jQuery objects, e.g. abelt.$table, abelt.$headers, abelt.$tbodies, etc.
      [Core] $.abelt.utility.appearance( abelt )   // initially add class names to table, header row & cells, footer row & cells, basic ARIA attributes
      [Core] $.abelt.utility.visibleRows( abelt )  // add class to visible rows, if abelt.options.css.visible option is not an empty string

  ## Notable changes

      $.tablesorter.processTbody(table, $tb, getIt)  => [Util] $.abelt.utility.processTbody( abelt, $tb, process )

    In tablesorter, you would have to call this function twice; once to remove the tbody and a second time to replace it

      $tb = $.tablesorter.processTbody( table, $('tbody').eq(0), true ); // remove tbody
      $tb.children().removeClass( 'foo' ); // do something
      $.tablesorter.processTbody( table, $tb, false ); // replace tbody

    In Abelt, you pass the process function

      $.abelt.utility.processTbody( abelt, $('tbody').eq(0), function( $tbody ){
        $tbody.children().removeClass( 'foo' ); // do something
      });

 ___ ___ ___ ___ ___ ___
| . | .'|  _|_ -| -_|  _|
|  _|__,|_| |___|___|_|  functions
|_|

    $.tablesorter.addParser(parser)   => [Cache] $.abelt.parser.add( parser, replaceParser )
    $.tablesorter.getParserById(name) => [Cache] $.abelt.parser.get( id )

  ## Tablesorter (private functions) => Abelt public functions

      detectParserForColumn(table, rows, rowIndex, cellIndex) => [Cache] $.abelt.parser.detect( abelt, rows, rowIndex, cellIndex )

 _       _ _   _
| |_ _ _|_| |_| |
| . | | | | | . |
|___|___|_|_|___| functions

  ## Tablesorter (private functions) => Abelt public functions

    buildParserCache(table)    => [Cache] $.abelt.build.parserCache( abelt )
    buildCache(table)          => [Cache] $.abelt.build.cache( abelt )
    appendToTable(table, init) => [Cache] $.abelt.build.append( ... )
    buildHeaders(table)        => [Sort]  $.abelt.build.headers( abelt )

             _
 ___ ___ ___| |_
|_ -| . |  _|  _|
|___|___|_| |_|  functions

    $.tablesorter.bindEvents(table, $headers, core)  => $.abelt.sort.bindEvents( abelt )
    $.tablesorter.restoreHeaders(table)              => $.abelt.sort.restoreHeaders( abelt )

  ## Tablesorter (private functions) => Abelt public functions

      initSort(table, cell, event)          => [Sort]  $.abelt.sort.init( abelt )
      formatSortingOrder(v)                 => [Sort]  $.abelt.sort.formatOrder( value )
      setHeadersCss(table)                  => [Sort]  $.abelt.sort.setHeadersCss( ... )
      updateHeader(table)                   => [Sort]  $.abelt.sort.updateHeader( ... )
      updateHeaderSortCount(table, list)    => [Sort]  $.abelt.sort.updateHeaderSortCount(... )
      getCachedSortType(parsers, i)         => [Sort]  $.abelt.sort.getCachedSortType( ... )
      multisort(table)                      => [Sort]  $.abelt.sort.multisort( ... )
      checkResort($table, flag, callback)   => [Sort]  $.abelt.sort.checkResort( abelt, flag, callback )
      resortComplete($table, callback)      => [Sort]  $.abelt.sort.complete( ... )
      commonUpdate(table, resort, callback) => [Cache] $.abelt.build.update( abelt, callback )

  ## New

    [Sort] $.abelt.sort.init( abelt )
    [Sort] $.abelt.sort.initComplete( abelt )
    [Sort] $.abelt.sort.appearance( abelt )
    [Sort] $.abelt.sort.triggerSort( ... )
    [Sort] $.abelt.sort.destroy( ... )

  ## Sorters

    $.tablesorter.sortNatural(a, b)                          => $.abelt.sorters.natural( a, b )
    $.tablesorter.sortNaturalAsc(a, b, col, table, c)        => $.abelt.sorters.naturalAsc( a, b, col, abelt )
    $.tablesorter.sortNaturalDesc(a, b, col, table, c)       => $.abelt.sorters.naturalDesc( a, b, col, abelt )
    $.tablesorter.sortText(a, b)                             => $.abelt.sorters.text( a, b )
    $.tablesorter.getTextValue(a, num, mx)                   => $.abelt.sorters.getTextValue(a, num, mx)
    $.tablesorter.sortNumericAsc(a, b, num, mx, col, table)  => $.abelt.sorters.numericAsc( a, b, num, mx, col, abelt )
    $.tablesorter.sortNumericDesc(a, b, num, mx, col, table) => $.abelt.sorters.numericDesc( a, b, num, mx, col, abelt )
    $.tablesorter.sortNumeric(a, b)                          => $.abelt.sorters.numeric( a, b )

 ___ ___ ___ ___ ___
| . | .'| . | -_|  _|
|  _|__,|_  |___|_|   (just variables used in module-cache.js, so far)
|_|     |___|

    table.config.appender(table, rows) => [Cache] abelt.functions.appender( abelt, rows )
    table.config.pager                 => [Cache] abelt.options.pager
    table.config.pager.ajax            => [Cache] abelt.options.pager.ajax
    table.config.pager.removeRows      => [Cache] abelt.options.pager.removeRows

   _     _     _         _
 _| |___| |___| |_ ___ _| |
| . | -_| | -_|  _| -_| . |
|___|___|_|___|_| |___|___| functions

    $.tablesorter.clearTableBody(table)
```