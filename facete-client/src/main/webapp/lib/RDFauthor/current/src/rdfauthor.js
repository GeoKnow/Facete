/**
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>
 */

/**
 * RDFauthor base object.
 * Serves as a namespace, widget registry and simplified façade.
 *
 * @namespace
 * @requires Statement
 */
RDFauthor = (function($) {
    /** Namespace for update predicates */
    var UPDATE_NS = 'http://ns.aksw.org/update/';
    
    /** RDF namespace */
    var RDF_NS = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
    
    /** RDFS namespace */
    var RDFS_NS = 'http://www.w3.org/2000/01/rdf-schema#';
    
    /** OWL namespace */
    var OWL_NS = 'http://www.w3.org/2002/07/owl#';
    
    /** Default generic hook name */
    var DEFAULT_HOOK = '__DEFAULT__';
    
    /** Default hook name for objects */
    var OBJECT_HOOK  = '__OBJECT__';
    
    /** Default hook name for literals */
    var LITERAL_HOOK = '__LITERAL__';
    
    /** Prefix for ad-hoc IDs */
    var ELEMENT_ID_PREFIX = 'el-';
    
    /** script is in unknown state */
    var SCRIPT_STATE_UNKNOWN = undefined;
    
    /** script is currently loading */
    var SCRIPT_STATE_LOADING = 1;
    
    /** script is ready */
    var SCRIPT_STATE_READY = 2;
    
    /** Databanks indexed by graph URI. */
    var _databanksByGraph = {};
    
    /**
     * Object to hold statements treated in a special way.
     * Those are essentially protected and hidden statements.
     * Explicit statements have been added to the view manually (as opposed to 
     * by parsing) and will be sent to sources even if not changed.
     * Hidden statements are not shown in the view and can thus not be edited 
     * by the user.
     */
    var _specialStatements = {
        'explicit': [], 
        'hidden': []
    };

    /** Wheather the property axiom cache has been loaded */
    var _cacheLoaded = false;

    /** Wheather the property widget cache has been loaded */
    var _propertycacheLoaded = false;

    /** Wheather the config has been loaded */
    var _configLoaded = false;

    /** Original databanks as extracted by graph URI. */
    var _extractedByGraph = {};
    
    /** Default graph URI */
    var _defaultGraphURI = null;
    
    /** Default subject URI */
    var _defaultSubjectURI = null;
    
    /** General target for events */
    var _eventTarget = 'body';
    
    /** The number of errors that occured while parsing RDFa. */
    var _parserErrors = 0;
    
    /** Information about named graphs in the page (indexed by graph URI). */
    var _graphInfo = {};
    
    /** Initial ID */
    var _idSeed = Math.round(Math.random() * 1000);
    
    /** Mapping of info shortcuts to predicate URIs. */
    var _infoShortcuts = {};
    
    /** Info predicates */
    var _infoPredicates = {};
    
    /** Denotes whether the page has been parsed */
    var _pageParsed = false;
    
    /** Predicate info */
    var _predicateInfo = {};

    /** Whether predicate infos have been loaded */
    var _predicateInfoLoaded = false;
    
    /** Predicates to be queried for */ 

    var _predicates = {};
    
    /** Callbacks to be executed when script loading finishes */
    var _scriptCallbacks = {};
    
    /** Loaded JavaScript URIs */
    var _loadedScripts = {};
    
    /** Loaded stylesheet URIs */
    var _loadedStylesheets = {};
    
    /** Element by statement hash */
    var _elementsByStatementHash = {};
    
    /** View instance */
    var _view = null;
    
    /** Number of pending scripts */
    var _requirePending = 0;
    
    /** Root element for editing */
    var _rootElement = null;
    
    /** Statement options storage */
    var _statementOptions = {};
    
    /** Default options */
    var _defaultOptions = {
        title: 'Title', 
        saveButtonTitle: 'saveButtonTitle', 
        cancelButtonTitle: 'cancelButtonTitle', 
        showButtons: true, 
        useAnimations: true, 
        autoParse: true, 
        usePredicateInfo: true, 
        useSPARQL11: false, 
        fetchAllPredicates: true, 
        viewOptions: {
            type: 'popover' /* inline or popover */
        }
    };
    
    /** actual options initialized to defaults */
    var _options = {};
    
    /** Hash registered widgets */
    var _registeredWidgets = {
        '__LITERAL__':  {},
        '__OBJECT__': {}, 
        '__DEFAULT__': {}, 
        '__DEBUG__': {},
        '__PROPERTY__': {},
        'resource':   {}, 
        'property':   {}, 
        'range':      {}, 
        'datatype':   {}
    };
    
    /**
     * Adds a predicate that is queried for
     * @private
     */
    function _addInfoPredicate(infoPredicateURI, shortcut, filterCondition) {
        // store predicate
        _infoPredicates[infoPredicateURI] = {};
        
        // add filter
        if (filterCondition) {
            _infoPredicates[infoPredicateURI].filter = filterCondition;
        }
        
        // keep shortcut
        if (undefined !== shortcut) {
            _infoShortcuts[shortcut] = infoPredicateURI;
        }
    }
    
    /**
     * Adds a new RDFA triple
     * @private
     */
    function _addTriple(element, triple, graph) {
        if (undefined !== triple) {
            var statement;
            
            // handle object label callback
            var label = null;
            if (typeof _options.objectLabel == 'function') {
                label = _options.objectLabel(element);

            }
            
            /* blank graph means page graph */
            if (graph instanceof RDFBlankNode) {
                graph = _pageGraph();
            }
            try {
                // TODO: …
                statement = new Statement(triple, {'graph': graph, objectLabel: label});
                _statementOptions[statement.asRdfQueryTriple()] = {'graph': graph, objectLabel: label};
            } catch (e) {
                /* count illegal RDFa triples */
                _parserErrors++;
            }
            
            /* add statement if it is not ignored */
            if (undefined !== statement && !statement.isIgnored()) {
                if (statement.isUpdateVocab()) {
                    _handleUpdateStatement(statement);
                } else {
                    if (_options.autoParse) {
                        RDFauthor.addStatement(statement, element);
                    }
                }
            }
        }
    }
    
    /**
     * Adds a special statement to the store with name given.
     * @private
     */
    function _addSpecialStatement(statement, specialSpec) {
        var graphURI = statement.graphURI() || this.defaultGraphURI();
        if (specialSpec in _specialStatements) {
            if (!(graphURI in _specialStatements[specialSpec])) {
                _specialStatements[specialSpec][graphURI] = [];
            }
            
            _specialStatements[specialSpec][graphURI].push(statement);
        } else {
            // error
        }
    }
    
    /**
     * Adds special statements for graph denoted by graphURI to the databank given.
     * @private
     */
    function _insertSpecialStatements(databank, graphURI) {
        for (var specialSpec in _specialStatements) {
            for (var i = 0; i < _specialStatements[specialSpec].length; i++) {
                var currentStatement = _specialStatements[specialSpec][i];
                // only add complete statements
                if (currentStatement.hasObject()) {
                    databank.add(currentStatement.asRdfQueryTriple());
                }
            }
        }
    }
    
    /**
     * Calls its parameter if it is of type funtion.
     * @private
     */
    function _callIfIsFunction(functionSpec, params) {
        if ($.isFunction(functionSpec)) {
           var result
               = typeof params === 'undefined'
               ? functionSpec.apply(functionSpec)
               : functionSpec.apply(functionSpec, params);
               ;

           return result;
        }
    }
    
    /**
     * Checks whether object implementes interface if
     * @private
     */
    function _checkInterface(object, interf) {
        for (var member in interf) {
            if (typeof member !== 'function') {
                continue;
            }
            
            if (!object[member] || (typeof object[member] !== 'function')) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Clones databank for each graph before calling 
     * for widgets to write their data.
     * @private
     */
    function _cloneDatabanks() {
        for (var g in _graphInfo) {            
            if (undefined !== _databanksByGraph[g] &&
                _databanksByGraph[g] instanceof $.rdf.databank) {
                
                var databank  = _databanksByGraph[g];
                var extracted = $.rdf.databank();
                
                databank.triples().each(function() {
                    if (this instanceof $.rdf.triple 
                        && this.object instanceof $.rdf.literal
                        && (typeof this.object.value == 'string')) {
                        /* HACK: reverse HTML escaping in literals */
                        this.object.value = this.object.value.replace(/&lt;/, '<').replace(/&gt;/, '>');
                    }
                    
                    // FIXME: rdfQuery no-object hack
                    if (this.object.value == 'undefined') {
                        databank.remove(this);
                    } else {
                        extracted.add(this);
                    }
                });
                
                /* store original as extracted */
                _extractedByGraph[g] = extracted;
            } else {
                /* create new empty databank */
                _extractedByGraph[g] = $.rdf.databank();
            }
            
            /* FIXME: explicit triples hack */
            if (g in _specialStatements['explicit']) {
                for (var i = 0; i < _specialStatements['explicit'][g].length; i++) {
                    var specialStatement = _specialStatements['explicit'][g][i];
                    _extractedByGraph[g].remove(specialStatement.asRdfQueryTriple());
                }
            }
            
            /* FIXME: hidden triples hack */
            if (g in _specialStatements['hidden']) {
                for (var i = 0; i < _specialStatements['hidden'][g].length; i++) {
                    var specialStatement = _specialStatements['hidden'][g][i];
                    databank.add(specialStatement.asRdfQueryTriple());
                }
            }
        }
    }
    
    function _createInlineView() {
        var viewController = new InlineController(_options.viewOptions);
        
        return viewController;
    }
    
    function _createPopoverView() {
        if ($('.modal-wrapper').length < 1) {
            $('body').append('<div class="modal-wrapper" style="display:none"></div>');
        }
                        
        var self = this;
        var options = $.extend({}, _options, {
            onBeforeSubmit: function () {
                // keep db before changes
                _cloneDatabanks();
            }, 
            onAfterSubmit: function () {
                _updateSources();
            }, 
            onAfterCancel: function () {
                _callIfIsFunction(_options.onCancel);
                RDFauthor.cancel();
            }, 
            container: _options.container ? _options.container : $('.modal-wrapper').eq(0), 
            useAnimations: _options.useAnimations
        });
        
        // init view controller
        var viewController = new PopoverController(options);
        
        return viewController;
    }
    
    function _createMobileView() {
        if ($('.modal-wrapper').length < 1) {
            $('body').append('<div class="modal-wrapper" style="display:none"></div>');
        }
                        
        var self = this;
        var options = $.extend({}, _options, {
            onBeforeSubmit: function () {
                // keep db before changes
                _cloneDatabanks();
            }, 
            onAfterSubmit: function () {
                _updateSources();
            }, 
            onAfterCancel: function () {
                _callIfIsFunction(_options.onCancel);
                RDFauthor.cancel();
            }, 
            container: _options.container ? _options.container : $('.modal-wrapper').eq(0), 
            useAnimations: _options.useAnimations
        });
        
        // init view controller
        var viewController = new MobileController(options);
        
        return viewController;
    }
    
    /**
     * Creates a new widget base object ensuring it uses the abstract 
     * Widget as its prototype object.
     * @return {Object}
     */
    function _createWidget(widgetSpec) {
        var F = function () {};
        F.prototype = Widget;
        
        var W = function (statement, options) {
            this.ID = RDFauthor.nextID();
            this.statement = statement;
            
            // widget has options
            if (undefined !== options) {
                this.options = $.extend(
                    {},             /* empty base */
                    this.options,   /* options from prototype chain */
                    options         /* user-provided options */
                );
            }
        };
        W.prototype = $.extend(new F(), widgetSpec);
        W.prototype.constructor = W;
        W.prototype.animate = _options.useAnimations;
        
        return W;
    }
    
    /**
     * Builds the SPARQL query for fetching predicate info.
     */
    function _createPredicateInfoQuery() {
        var selects     = '',
            basePattern = '',
            filters     = [],
            infoFilters = [],
            typeFilters = [];
        
        for (var infoPredicateURI in _infoPredicates) {
            infoFilters.push('sameTerm(?infoPredicate, <' + infoPredicateURI + '>)');
        }

        typeFilters = [
           'sameTerm(?type, <http://www.w3.org/2000/01/rdf-schema#Property>)',
           'sameTerm(?type, <http://www.w3.org/2000/01/rdf-schema#Property>)',
           'sameTerm(?type, <http://www.w3.org/2002/07/owl#DatatypeProperty>)',
        ];
        
        // Query certain predicates only
        if (!_options.fetchAllPredicates) {
            for (var predicate in _predicates) {
                filters.push('sameTerm(?predicate, <' + predicate + '>)');
            }
        } else {
            basePattern = '?predicate ?infoPredicate ?infoValue . ';
        }
        
        // No query w/o filter on info predicates
        if (infoFilters.length > 0) {  
            var query = '\
                SELECT DISTINCT ?predicate ?infoPredicate ?infoValue\
                WHERE {' + basePattern + 
                ('FILTER (' + infoFilters.join(' || ') + ')') +
                'OPTIONAL {?anySubject ?predicate ?anyObject . } ' + 
                'OPTIONAL {?predicate a ?type}' + 
                ((typeFilters.length > 0) ? (' FILTER(' + typeFilters.join(' || ') + ')') : '') + 
                // ((filters.length > 0) ? (' FILTER(' + filters.join(' || ') + ')') : '') + 
            '}';
            
            return query;
        }
        
        return null;
    }

    function _loadCache() {
        if (!_cacheLoaded) {
            _require(RDFAUTHOR_BASE + 'src/rdfauthor.cache.js', function () {
                $.extend(_predicateInfo, __cache);
            }); 
            _cacheLoaded = true;
        };
    }

    function _loadPropertyCache() {
        if (!_propertycacheLoaded) {
            _require(RDFAUTHOR_BASE + 'src/rdfauthor.propertycache.js', function () {
                $.extend(_predicateInfo, __propertycache['generalapplicable']);
            });
            _propertycache = true;
        }
    }

    function _loadConfig(callback) {
        var dfd = $.Deferred();
        if (!_configLoaded) {
            _require(RDFAUTHOR_BASE + 'src/rdfauthor.config.js', function() {
                _configLoaded = true;

                dfd.resolve();
            });
        } else {
            _configLoaded = true;
            dfd.resolve();
        }
        return dfd.promise();
    }

    /**
     * Loads info predicates for all predicates
     * @private
     */ 
    function _fetchPredicateInfo(callback) {
        if (!_predicateInfoLoaded) {
            if (_options.usePredicateInfo) {
                var query = _createPredicateInfoQuery();

                //_predicateInfo = {};
                
                if (query) {
                    // use first graph w/ update info for now
                    var graph;
                    for (var g in _graphInfo) {
                        if (undefined !== RDFauthor.serviceURIForGraph(g)) {
                            graph = g;
                            break;
                        }
                    }
                    
                    // fallback to default graph
                    if (undefined === graph) {
                        graph = RDFauthor.defaultGraphURI();
                    }
                    
                    /* TODO: for each graph */
                    // try {
                        RDFauthor.queryGraph(graph, query, {
                            callbackSuccess: function (result) {
                                if (result && result['results'] && result['results']['bindings']) {
                                    var bindings = result['results']['bindings'];
                                    for (var i = 0; i < bindings.length; i++) {
                                        var row = bindings[i];
                                        /* build  */
                                        var predicate = row['predicate'].value,
                                            infoPredicate = row['infoPredicate'].value,
                                            infoValue = row['infoValue'].value;

                                        /* build info structure */
                                        if (undefined === _predicateInfo[predicate]) {
                                            _predicateInfo[predicate] = {};
                                        }
                                        if (undefined === _predicateInfo[predicate][infoPredicate]) {
                                            _predicateInfo[predicate][infoPredicate] = [];
                                        }
                                        _predicateInfo[predicate][infoPredicate].push(infoValue);
                                    }
                                }

                                _callIfIsFunction(callback);
                            }, 
                            callbackError: function () {
                                // SPARQL error
                                _callIfIsFunction(callback);
                            }, 
                            // synchronous
                            async: false
                        })
                    // } catch (e) {
                    //     // TODO: 
                    //     _callIfIsFunction(callback);
                    // }
                }
            } else {
                _predicateInfo = {};
                _callIfIsFunction(callback);
            }
            _predicateInfoLoaded = true;
        } else {
            _callIfIsFunction(callback);
        }
    }
    
    /**
     * Adds an update vocabulary statement to the internal store
     * @private
     */
    function _handleUpdateStatement(statement) {
        var subject = statement.subjectURI();
        var key     = statement.predicateURI().substr(UPDATE_NS.length);
        
        /* empty graph is expanded w/ document's namespace */
        if ('' === subject) {
            subject = _pageGraph();
        }
        
        if (typeof _graphInfo[subject] == 'undefined') {
            _graphInfo[subject] = {};
        }
        
        _graphInfo[subject][key] = statement.objectValue();
    }

    /**
     * Builds an RDF/JSON index structure with literal objects being
     * replace bei the 'data-object-hash' attribute value from the
     * corresponding DOM element.
     *
     * @param {array} triples
     * @param {string} graph
     * @returns {object} rdf/json index
     */
    function _buildHashedObjectIndexes(triples, graph) {
        var index = {}, 
            hashed = {}, 
            targetIndex;
        
        for (var i = 0; i < triples.length; i++) {
            var statement = new Statement(triples[i], graph);
            var element   = RDFauthor.elementForStatement(statement);
            var hash      = $(element).attr('data-object-hash');
            
            targetIndex = (hash !== undefined) ? hashed : index;
            
            var s = String(triples[i].subject.value);
            var p = String(triples[i].property.value);
            // var o = hash;
            if (undefined === targetIndex[s]) {
                targetIndex[s] = {};
            }
            if (undefined === targetIndex[s][p]) {
                targetIndex[s][p] = [];
            }

            targetIndex[s][p].push(hash ? hash : triples[i].object.dump());
        }
        
        return {'plain': index, 'hashed': hashed};
    }
    
    /**
     * Instantiates and returns a widget object
     * @param {Function} constructor
     * @param {Statement} statement
     * @return {Widget}
     */
    function _instantiateWidget(constructor, statement, options) {
        if (typeof constructor === 'function') {
            if (undefined !== options) {
                return new constructor(statement, options);
            } else {
                return new constructor(statement);
            }
        }
        
        return null;
    }
    
    /**
     * Loads a JavaScript file by including a <code>&lt;script&gt;</code> tag in the page header.
     * @private
     * @param {string} scriptURI
     * @param {function} function that will be called when the script finished loading (optional)
     */
    function _loadScript(scriptURI, callback) {
        if (_loadedScripts[scriptURI] === SCRIPT_STATE_UNKNOWN) {
            // load script
            var s  = document.createElement('script');
            s.type = 'text/javascript';
            s.src  = scriptURI;
            
            // callback handler fro loaded scripts
            var _scriptReady = function () {
                // now its ready
                _loadedScripts[scriptURI] = SCRIPT_STATE_READY;

                // script is ready, call all callbacks
                if ($.isArray(_scriptCallbacks[scriptURI])) {
                    var callbacks = _scriptCallbacks[scriptURI];
                    for (var i = 0, max = callbacks.length; i < max; i++) {
                        callbacks[i]();
                    }
                    _scriptCallbacks[scriptURI] = [];
                }
            }
            
            // set callback handler
            if (s.all) {
                s.onreadystatechange = function () {
                    if (this.readyState === 'loaded' || this.readyState === 'complete') {
                        _scriptReady();
                    }
                }
            } else {
                // works: Safari, Chrome, Firefox
                s.onload = _scriptReady;
            }
            
            // init callback store
            _scriptCallbacks[scriptURI] = [];
            // store callback if it is a function
            if (arguments.length >= 2 && typeof callback == 'function') {
                _scriptCallbacks[scriptURI].push(callback);
            }
            
            document.getElementsByTagName('head')[0].appendChild(s);
            // set script to loading
            _loadedScripts[scriptURI] = SCRIPT_STATE_LOADING;
        } else if (_loadedScripts[scriptURI] === SCRIPT_STATE_LOADING) {
            // script has been added, but still loading
            // add callback to script's ready callback list
            _scriptCallbacks[scriptURI].push(callback);
        } else if (_loadedScripts[scriptURI] === SCRIPT_STATE_READY) {
            // script is ready, execute callback immediately
            _callIfIsFunction(callback);
        }
    }
    
    /**
     * Loads a Stylesheet file by including a <code>&lt;script&gt;</code> tag in the page header.
     * @private
     * @param {string} stylesheetURI
     */
    function _loadStylesheet(stylesheetURI) {
        var stylesheetLoaded = false;
        var links = document.getElementsByTagName('link');
        
        for (var i = 0, max = links.length; i < max; i++) {
            var uri = links[i].getAttribute('href');
            if ((uri && uri == stylesheetURI)) {
                stylesheetLoaded = true;
                break;
            }
        }
        
        if (!stylesheetLoaded) {
            var l   = document.createElement('link');
            l.rel   = 'stylesheet';
            l.type  = 'text/css';
            l.media = 'screen';
            l.href  = stylesheetURI;
            
            document.getElementsByTagName('head')[0].appendChild(l);
        }
    }
    
    /**
     * Makes an element's triples (from children and self) editable
     * @private
     */
    function _makeElementEditable(element, statement) {
        /*
         * add hash id
         * store id => statement index
         */
         var id = $(element).attr('id');
         if (undefined === id) {
             id = RDFauthor.nextID(ELEMENT_ID_PREFIX);
             $(element).attr('id', id);
         }
         
         $(element)
            .data('rdfauthor.statement', statement)
            .addClass('rdfauthor-statement-provider');/*
            .click(function () {
                alert($(this).data('rdfauthor.statement'));
                return false;
            });*/
         
         _elementsByStatementHash[String(statement)] = element;
    };
    
    /**
     * Returns the name (URI) of the current document's graph.
     * @return {String}
     */
    function _pageGraph() {
        return document.location.href;
    }
    
    /**
     * Parses the current page for RDFa triples
     * @private
     */
    function _parse(callback) {
        if (!_pageParsed) {
            // _resetDatabanks();
            // set parsing callback
            RDFA.CALLBACK_DONE_PARSING = function () {
                _pageParsed = true;
                _callIfIsFunction(callback);
            };
            // parse
            RDFA.parse();
        } else {
            // already parsed, execute callback immediately
            _callIfIsFunction(callback);
        }
    }
    
    /**
     * Parses a URL string and returns an object similar to the internal Location object.
     * based on http://blog.stevenlevithan.com/archives/parseuri
     * @private
     */
    function _parseURL(str) {
        var o = {
            strictMode: false, 
            key: ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'hostname', 
                  'port', 'relative', 'path', 'directory', 'file','query','anchor'],
            q: {
                name:   'queryKey',
                parser: /(?:^|&)([^&=]*)=?([^&]*)/g
            },
            parser: {
                strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
                loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
            }
        };
        
        var m   = o.parser[o.strictMode ? 'strict' : 'loose'].exec(str), 
            uri = {}, 
            i   = 14;

        while (i--) {
            uri[o.key[i]] = m[i] || '';
        }
        
        uri[o.q.name] = {};
        uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
            if ($1) {
                uri[o.q.name][$1] = $2;
            }
        });
        
        return uri;
    }
    
    /**
     * Populates the given view with statements.
     * @private
     */
    function _populateView(view) {
        var root = _root();
        if (null === root) {
            // reset old view
            _resetView();
        }
        if (undefined === view) {
            view = RDFauthor.getView();
        }
        /* make sure, view has predicate info available */
        _fetchPredicateInfo(function() {
            if (null !== root) {
                root.find('.rdfauthor-statement-provider').each(function () {
                    var statement = $(this).data('rdfauthor.statement');
                    view.addWidget(statement);
                });
            } else {
                // add all parsed statements
                for (var graph in _databanksByGraph) {
                    var updateEndpoint = RDFauthor.updateURIForGraph(graph);
                    if (undefined !== updateEndpoint) {
                        var triples = _databanksByGraph[graph].triples();
                        for (var i = 0, length = triples.length; i < length; i++) {
                            // init statement
                            var statement = new Statement(triples[i], {'graph': graph});
                            
                            // handle object label callback
                            var element = RDFauthor.elementForStatement(statement);
                            var label = null;
                            if (typeof _options.objectLabel == 'function') {
                                label = _options.objectLabel(element);
                            }
                            
                            // init statement
                            var statement2 = new Statement(triples[i], {'graph': graph, objectLabel: label});
                            
                            view.addWidget(statement2);
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Called when RDFauthor is ready loading all its dependencies
     */
    function _ready() {
        if (typeof RDFAUTHOR_READY_CALLBACK !== 'undefined') {
            RDFAUTHOR_READY_CALLBACK();
        }
    }
    
    /**
     * Used internally for script requirements. For each pending script, 
     * a counter is increased and decreased when the script has finished 
     * loading. Readyness is announced when all pending scripts are loaded.
     */
    function _require(scriptURI, callback) {
        _requirePending++;
        _loadScript(scriptURI, function () {
            _callIfIsFunction(callback);
            _requirePending--;
            if (_requirePending == 0) {
                _ready();
            }
        });
    }
    
    function _resetDatabanks() {
        _pageParsed = false;
        _databanksByGraph  = {};
        _extractedByGraph  = {};
        _specialStatements = {
            'explicit': [], 
            'hidden': []
        };
    }
    
    function _resetParser() {
        // Excluded RDFA because of name clash with 'Namespace' ~ Claus 26 Nov 2012
        //RDFA.reset();
        _pageParsed = false;
    }
    
    function _resetView() {
        if (null !== _view && typeof _view.reset == 'function') {
            _view.reset();
        }
        
        _view = null;
    }
    
    function _resetOptions() {
        _options = {};
        for (var key in _defaultOptions) {
            _options[key] = _defaultOptions[key];
        }
    }
    
    function _restoreDatabanks() {
        for (var g in _extractedByGraph) {
            if (undefined !== _extractedByGraph[g] 
                && _extractedByGraph[g] instanceof $.rdf.databank) {
                // restore databank
                _databanksByGraph[g] = _extractedByGraph[g];
            }
        }
    }
    
    /** Returns current view root element */
    function _root() {
        return _rootElement;
    }
    
    /** Sets current view root element */
    function _setRoot(root) {
        _rootElement = root;
    }
    
    /**
     * Returns the shortcut registered for the info predicate or
     * creates and registers a new one if none had been registered before.
     * @private
     */
    function _shortcutForInfoPredicate(infoPredicateURI) {
        var count = 1
        for (var shortcut in _infoShortcuts) {
            if (_infoShortcuts[shortcut] === infoPredicateURI) {
                return shortcut;
            }
            count++;
        }
        
        /* not found, create new one */
        shortcut = 'info' + count;
        _infoShortcuts[shortcut] = infoPredicateURI;
        
        return shortcut;
    }
    
    /**
     * Shows the property editing view, creating it if necessary.
     * @private
     */
    function _showView() {
        /* make sure, view has predicate info available */
        _fetchPredicateInfo(function() {
            var view = RDFauthor.getView();
            view.show(true);
        });
    }
    
    /**
     * Remove JSON key value pairs if invalid argument.
     * E.g. empty string.
     * @private
     */
    function _checkJSON(json) {
        for (var r in json) {
            for (var p in json[r]) {
                for (var o in json[r][p]) {
                    if( json[r][p][o].value.length === 0 || json[r][p][o].value == null) {
                        delete json[r][p];
                    }
                }
            }
        }
        return json;
    }

    /**
     * Updates all sources via SPARQL/Update
     * @private
     */
    function _updateSources() {
        for (var g in _graphInfo) {
            var updateURI = RDFauthor.updateURIForGraph(g);
            var databank  = RDFauthor.databankForGraph(g);
            var original  = _extractedByGraph[g];
            // console.log('updateURI', updateURI);
            // console.log('databank', databank);
            // console.log('original', original);
            if (undefined !== updateURI && undefined !== databank) {
                var added   = databank.except(original);
                var removed = original.except(databank);
                
                _insertSpecialStatements(added, g);
                
                if (_options.useSPARQL11) {
                    // console.log('useSPARQL11');
                    // SPARQL/Update
                    var updateQuery = '';
                    
                    var addedArray = $.makeArray(added.triples());
                    if (addedArray.length > 0) {
                        updateQuery += '\nINSERT DATA INTO <' + g + '> {' + 
                        addedArray.join('\n').replace('""""', '"""') + '}';
                    }
                    
                    var removedArray = $.makeArray(removed.triples());
                    if (removedArray.length > 0) {
                        updateQuery += '\nDELETE DATA FROM <' + g + '> {' + 
                        removedArray.join('\n').replace('""""', '"""') + '}';
                    }

                    // console.log('SPARQL Added: ', $.makeArray(added.triples()));
                    // console.log('SPARQL Deleted: ', $.makeArray(removed.triples()));
                    // console.log('SPARQL Query: ', updateQuery);
                    // return;

                    // if no changes, don't run query due to bad request (sparql endpoint)
                    if (updateQuery.length != 0) {
                        $.ajax({
                            type: 'POST',
                            url: updateURI, 
                            data: {
                                'query': updateQuery
                            },
                            dataType: 'json'
                        }).done(function (responseData, textStatus, XHR) {
                            _view.hide(true);
                            _callIfIsFunction(_options.onSubmitSuccess, [responseData]);
                        }).fail(function (jqXHR, textStatus, errorThrown) {
                            alert('error while post request: ' + errorThrown);
                        });
                    } else {
                        _callIfIsFunction(_options.onSubmitSuccess);
                        _view.hide(true);
                    }

                } else {
                    // console.log('use REST');
                    // REST style
                    var addedJSON = _checkJSON($.rdf.dump(added.triples()));
                    var indexes   = _buildHashedObjectIndexes(removed.triples(), g);
                    // , {format: 'application/json', serialize: true})
                    // console.log('JSON Added: ' + $.toJSON(addedJSON));
                    // console.log('JSON Removed: ' + $.toJSON(indexes));
                    // return;
                    
                    if (addedJSON || removedJSON) {
                        // x-domain request sending works w/ $.get only
                        $.ajax({
                            type: 'POST',
                            url: updateURI, 
                            data: {
                                'named-graph-uri': g, 
                                'insert': addedJSON ? $.toJSON(addedJSON) : '{}', 
                                'delete': indexes.plain ? $.toJSON(indexes.plain) : '{}', 
                                'delete_hashed': indexes.hashed ? $.toJSON(indexes.hashed) : '{}'
                            },
                            dataType: 'json'
                        }).done(function (responseData, textStatus, XHR) {
                            _view.hide(true);
                            _callIfIsFunction(_options.onSubmitSuccess, [responseData]);
                        }).fail(function (jqXHR, textStatus, errorThrown) {
                            alert('error while post request: ' + errorThrown);
                        });
                    } else {
                        _view.hide(true);
                        _callIfIsFunction(_options.onSubmitSuccess);
                    }
                }
            }
        }
    }
    
    // RDFauthor setup code ///////////09:27:33+02:00
    ////////////////////////////////////////
    
    if (RDFAUTHOR_BASE.charAt(RDFAUTHOR_BASE.length - 1) !== '/') {
        RDFAUTHOR_BASE = RDFAUTHOR_BASE + '/';
    }
    // let RDFa parser load GRDDL files locally
    __RDFA_BASE = RDFAUTHOR_BASE + 'libraries/';
    
    // RDFA namespace and parser options
    RDFA = {
        NAMED_GRAPH_ATTRIBUTE: {ns: UPDATE_NS, attribute: 'from'}, 
        CALLBACK_NEW_TRIPLE_WITH_URI_OBJECT: _addTriple, 
        CALLBACK_NEW_TRIPLE_WITH_LITERAL_OBJECT: _addTriple, 
        CALLBACK_DONE_PARSING: function() {_pageParsed = true;}
    };

    // Config
    _loadConfig();

    // PropertyCache
    _loadPropertyCache();

    // Cache
    _loadCache();

    // jQuery UI
    if (undefined === $.ui) {
        _require(RDFAUTHOR_BASE + 'libraries/jquery-ui.js');
        _loadStylesheet(RDFAUTHOR_BASE + 'libraries/jquery-ui.css');
    }
    
    // rdfQuery
    if (undefined === $.rdf) {
        _require(RDFAUTHOR_BASE + 'libraries/jquery.rdfquery.rdfa-1.0.js');
    }
    
    // toJSON
    if (undefined === $.toJSON) {
        _require(RDFAUTHOR_BASE + 'libraries/jquery.json.js');
    }
    
    // load required scripts
    _requirePending++;
    _require(RDFAUTHOR_BASE + 'src/rdfauthor.statement.js');    /* Statement */
    _require(RDFAUTHOR_BASE + 'src/rdfauthor.predicaterow.js'); /* Predicate Row */
    _require(RDFAUTHOR_BASE + 'src/rdfauthor.selector.js');     /* Property selector */
    _require(RDFAUTHOR_BASE + 'src/rdfauthor.subjectgroup.js'); /* Subject Group */
    _require(RDFAUTHOR_BASE + 'src/rdfauthor.popovercontroller.js');   /* ViewController */
    _require(RDFAUTHOR_BASE + 'src/rdfauthor.mobilecontroller.js');   /* ViewController */
    _require(RDFAUTHOR_BASE + 'src/rdfauthor.inlinecontroller.js'); /* InlineViewController */
    // DISABLED because of name class with "Namespace" ~ Claus
    //    _require(__RDFA_BASE + 'rdfa.js');                          /* RDFA */
    
    // load widgets; widget prototype is required before all other widgets
    _require(RDFAUTHOR_BASE + 'src/widget.prototype.js', function () {
        // global widgets
        $.when(_loadConfig()).then(function() {
            _require(RDFAUTHOR_BASE + 'src/widget.literal.js');
            _require(RDFAUTHOR_BASE + 'src/widget.resource.js');
            _require(RDFAUTHOR_BASE + 'src/widget.meta.js');
            _require(RDFAUTHOR_BASE + 'src/widget.xmlliteral.js');
            _require(RDFAUTHOR_BASE + 'src/widget.property.js');
            // additional widgets
            for ( var widget in __config['widgets']) {
                // grab widget
                var wConfig = __config['widgets'][widget];
                // if enabled the widget will be loaded
                if (wConfig['enabled']) {
                    // console.log('enabled: ' + widget);
                   _require(RDFAUTHOR_BASE + wConfig['path']);
                } else {
                    // console.log('disabled: ' + widget);
                }
            }
            _requirePending--;
        });
    });
    
    // load stylesheets
    if ((typeof RDFAUTHOR_MOBILE != 'undefined') && RDFAUTHOR_MOBILE) {
        _loadStylesheet(RDFAUTHOR_BASE + 'src/rdfauthor_mobile.css')
    } else {
        _loadStylesheet(RDFAUTHOR_BASE + 'src/rdfauthor.css');
    }

    // load ontowiki stylesheet when rdfauthor is used without ontowiki
    if (!/ontowiki|aksw/gi.test($('head title').text())) {
        _loadStylesheet(RDFAUTHOR_BASE + 'src/rdfauthor.ow.css');
        // _loadStylesheet(RDFAUTHOR_BASE + 'src/rdfauthor.ow.update.css');
        // preparation for new theme
        // _loadStylesheet(RDFAUTHOR_BASE + 'src/ow-style/default.css');
        // _loadStylesheet(RDFAUTHOR_BASE + 'src/ow-style/default.dev.css');
        // _loadStylesheet(RDFAUTHOR_BASE + 'src/ow-style/deprecated.dev.css');
        // _loadStylesheet(RDFAUTHOR_BASE + 'src/ow-style/old.css');
    }

    // default info predicates
    _addInfoPredicate(RDF_NS + 'type', 'type');
    _addInfoPredicate(RDFS_NS + 'range', 'range');
    _addInfoPredicate(RDFS_NS + 'label', 'label', 'langMatches(lang(?predicate), "en")');
    
    // load default options
    _resetOptions();
    
    // return uninstantiable singleton
    /** @lends RDFauthor */
    return {
        /**
         * Adds a statement to the number of editable statements.
         * @param {string} graphURI
         * @param {Statement} statement
         * @param {HTMLElement} element
         */
        addStatement: function (statement, element) {
            if (statement.isHidden()) {
                _addSpecialStatement(statement, 'hidden');
            } else {
                var graphURI = statement.graphURI() || this.defaultGraphURI();
                var databank = this.databankForGraph(graphURI);
                var asTriple = statement.asRdfQueryTriple();
                
                // store triples
                databank.add(asTriple);
                
                if (!(statement.predicateURI() in _predicates)) {
                    _predicates[statement.predicateURI()] = 1;
                }
                
                // explicit statements are editable
                if (statement.isProtected()) {
                    _addSpecialStatement(statement, 'explicit');
                }
                
                // make editable
                if (undefined !== element) {
                    _makeElementEditable(element, statement);
                }
            }
        }, 
        
        /**
         * Cancels the editing process.
         */
        cancel: function () {
            var self = this;
            var view = RDFauthor.getView();
            view.hide(true, function () {
                _callIfIsFunction(_options.onCancel);
                /* clean up */
                _resetDatabanks();
                _resetParser();
                _resetOptions();
                
                /* trigger plug-ins */
                self.eventTarget().trigger('rdfauthor.cancel');
            });
        }, 
        
        /**
         * Commits changes from an ongoing editing process.
         * All pending changes will be sent to sources.
         * @todo inform on error
         */
        commit: function () {
            _cloneDatabanks();
            if (this.getView().submit()) {
                _updateSources();
            } else {
                _restoreDatabanks();
            }
        },
        
        /**
         * Returns the jQuery.rdf.databank that stores statements for graph denoted by <code>graphURI</code>.
         * @param {string} graphURI
         * @return {$.rdf.databank}
         */
        databankForGraph: function (graphURI) {
            if (undefined === _databanksByGraph[graphURI]) {
                _databanksByGraph[graphURI] = $.rdf.databank();
            }
            
            return _databanksByGraph[graphURI];
        }, 
        
        debug: function (privateFuncSpec, parameters) {
            this.call(privateFuncSpec, parameters);
        }, 
        
        /**
         * Returns the default graph URI.
         * The default graph is the graph, to which newly created statements 
         * are added. That is, statements that also add a new property.
         * @return {string}
         */
        defaultGraphURI: function () {
            /* TODO: if there is only one graph, this should be the default graph */
             if (null === _defaultGraphURI) {
                 if (typeof RDFAUTHOR_DEFAULT_GRAPH === 'string') {
                     /* 1. RDFAUTHOR_DEFAULT_GRAPH JavaScript variable */
                     _defaultGraphURI = RDFAUTHOR_DEFAULT_GRAPH;
                 } else if (undefined !== _options.defaultGraph) {
                     /* 2. options.defaultGraph */
                     _defaultGraphURI = _options.defaultGraph;
                 } else if (undefined !== _graphInfo[_pageGraph()] 
                            && undefined !== _graphInfo[_pageGraph()]['defaultGraph']) {
                     /* 3. link w/ rel="update:defaultGraph" */
                     _defaultGraphURI = _graphInfo[_pageGraph()]['defaultGraph'];
                 } else {
                     /* 4. document.location.href (i.e. page graph) */
                     _defaultGraphURI = _pageGraph();
                 }
             }
             
             console.debug("[RDFAuthor] Falling back to default graph ", _defaultGraphURI);

             return _defaultGraphURI;
        }, 
        
        /**
         * Returns the default subject's URI.
         * @return {string}
         */
        defaultSubjectURI: function () {
            /* TODO: if there is only one resource, this should be the default resource */
             if (null === _defaultSubjectURI) {
                 if (typeof RDFAUTHOR_DEFAULT_SUBJECT === 'string') {
                     /* 1. RDFAUTHOR_DEFAULT_SUBJECT JavaScript variable */
                     _defaultSubjectURI = RDFAUTHOR_DEFAULT_SUBJECT;
                 } else if (undefined !== _options.defaultSubject) {
                     /* 2. options.defaultSubject */
                     _defaultSubjectURI = _options.defaultSubject;
                 } else if (undefined !== _graphInfo[_pageGraph()] 
                            && undefined !== _graphInfo[_pageGraph()]['defaultSubject']) {
                     /* 3. link w/ rel="update:defaultSubject" */
                     _defaultSubjectURI = _graphInfo[_pageGraph()]['defaultSubject'];
                 }
             }
             
             return _defaultSubjectURI;
        },
        
        /**
         * Edit resources.
         * @param config type, targetSparqlEndpoint, targetUpdateEndpoint, targetGraph, targetResource, [targetResourceData]
         */
        edit: function (config) {
            var self = this;

            var createStatements = function() {
                var dfd = $.Deferred();
                // if resourceTargetData is not defined, query the endpoint
                if (typeof config.targetResourceData == 'undefined') {
                    var query = '\
                        SELECT ?p ?o\
                        FROM <' + config.targetGraph + '>\
                        WHERE {\
                            <' + config.targetResource + '> ?p ?o.\
                        }';
                    self.queryGraph(config.targetGraph, query, {
                        callbackSuccess: function(data, status) {
                            // create statements
                            data = data['results']['bindings'];
                            for (var currentPropertyIndex in data) {
                                var currentProperty = data[currentPropertyIndex]['p'].value;
                                var currentPropertyObject = data[currentPropertyIndex]['o'];
                                var objSpec = currentPropertyObject;
                                var value;
                                if ( objSpec.type == 'uri' ) { 
                                    value = '<' + objSpec.value + '>'; 
                                } else if ( objSpec.type == 'bnode' ) { 
                                    value = '_:' + objSpec.value;
                                } else {
                                    // IE fix, object keys with empty strings are removed
                                    value = objSpec.value ? objSpec.value : ""; 
                                }

                                var newObjectSpec = {
                                    value : value,
                                    type: String(objSpec.type).replace('typed-', '')
                                };


                                if (objSpec.value) {
                                    if (/literal/.test(objSpec.type)) {
                                        if (objSpec.datatype) {
                                            newObjectSpec.options = {
                                                'datatype': objSpec.datatype
                                            };
                                        }
                                        if (objSpec.lang) {
                                            newObjectSpec.options = {
                                                'lang': objSpec.lang
                                            };
                                        }
                                        if (objSpec['xml:lang']) {
                                            newObjectSpec.options = {
                                                'lang': objSpec['xml:lang']
                                            };
                                        }
                                    }
                                }

                                // console.log('newObjectSpec', newObjectSpec);

                                var stmt = new Statement({
                                    subject: '<' + config.targetResource + '>', 
                                    predicate: '<' + currentProperty + '>', 
                                    object: newObjectSpec
                                }, {
                                    graph: config.targetGraph, 
                                    title: objSpec.title, 
                                    protect: protect ? true : false, 
                                    hidden: objSpec.hidden ? objSpec.hidden : false
                                });

                                // console.log("Adding statement ", stmt);
                                // console.log('Statement Graph', stmt.graphURI());
                                self.addStatement(stmt);

                            }
                            dfd.resolve();
                        }
                    });

                } else {
                    // resourceTargetData was defined and will be used to create the statements
                    var data = config.targetResourceData;

                    // create statements
                    var protect  = arguments.length >= 2 ? protect : true;
                    var resource = arguments.length >= 3 ? resource : null;
                    var graph    = arguments.length >= 4 ? graph : null;
                    for (var currentProperty in data[config.targetResource]) {
                        var objects = data[config.targetResource][currentProperty];

                        for (var i = 0; i < objects.length; i++) {
                            var objSpec = objects[i];
                            var value;
                            if ( objSpec.type == 'uri' ) { 
                                value = '<' + objSpec.value + '>'; 
                            } else if ( objSpec.type == 'bnode' ) { 
                                value = '_:' + objSpec.value;
                            } else {
                                // IE fix, object keys with empty strings are removed
                                value = objSpec.value ? objSpec.value : ""; 
                            }

                            var newObjectSpec = {
                                value : value,
                                type: String(objSpec.type).replace('typed-', '')
                            };

                            if (objSpec.value) {
                                if (/literal/.test(objSpec.type)) {
                                    if (objSpec.datatype) {
                                        newObjectSpec.options = {
                                            'datatype': objSpec.datatype
                                        };
                                    }
                                    if (objSpec.lang) {
                                        newObjectSpec.options = {
                                            'lang': objSpec.lang
                                        };
                                    }
                                }
                            }

                            // console.log('newObjectSpec', newObjectSpec);
                            var stmt = new Statement({
                                subject: '<' + config.targetResource + '>', 
                                predicate: '<' + currentProperty + '>', 
                                object: newObjectSpec
                            }, {
                                graph: config.targetGraph, 
                                title: objSpec.title, 
                                protect: protect ? true : false, 
                                hidden: objSpec.hidden ? objSpec.hidden : false
                            });

                            // console.log("Adding statement ", stmt);
                            // console.log('Statement Graph', stmt.graphURI());
                            self.addStatement(stmt);
                        }
                    }
                    dfd.resolve();
                }
                return dfd.promise();
            }

            var setOptions = function() {
                // var dfd = $.Deferred();
                // set gui/editing options
                self.setOptions({
                    saveButtonTitle: config.saveButtonTitle ? config.saveButtonTitle : 'Save',
                    cancelButtonTitle: config.cancelButtonTitle ? config.cancelButtonTitle : 'Cancel',
                    title: config.title ? config.title : 'Edit Resource: ' + config.targetResource,  
                    autoParse: false, 
                    showPropertyButton: config.showPropertyButton ? config.showPropertyButton : true,
                    onSubmitSuccess: function (responseData) {
                        // run callback
                        _callIfIsFunction(config.onSubmitSuccess);
                    }
                });
                // dfd.resolve();
                // return dfd.promise();
            }

            var createView = function() {
                // var dfd = $.Deferred();
                // create editing view
                var view = self.getView();
                for (var graph in _databanksByGraph) {
                    var updateEndpoint = config.targetUpdateEndpoint;
                    if (undefined !== updateEndpoint) {
                        var triples = _databanksByGraph[graph].triples();
                        for (var i = 0, length = triples.length; i < length; i++) {
                            // init statement
                            var statement = new Statement(triples[i], {'graph': config.targetGraph});
                            // handle object label callback
                            var element = RDFauthor.elementForStatement(statement);
                            var label = null;
                            if (typeof _options.objectLabel == 'function') {
                                label = _options.objectLabel(element);
                            }
                            // init statement
                            var statement2 = new Statement(triples[i], {'graph': graph, objectLabel: label});
                            view.addWidget(statement2);
                        }
                    }
                }
                // show view
                view.show(true);
                // dfd.resolve();
                // return dfd.promise();
            }

            var init = function() {
                // reset rdfauthor settings
                _resetOptions();
                // set rdfauthor settings
                self.setInfoForGraph(config.targetGraph, 'queryEndpoint', config.targetSparqlEndpoint);
                self.setInfoForGraph(config.targetGraph, 'updateEndpoint', config.targetUpdateEndpoint);
                _options.viewOptions.type = config.view;
                _options.useSPARQL11 = config.useSPARQL11 | false;

                // console.log('config', config);
                // console.log('_graphInfo', _graphInfo);
                // console.log('_options', _options);
                // console.log('data', data);
                $.when(createStatements()).then(function() {
                    setOptions();
                    createView();
                });

            }

            // if rdfauthor is rdy, start editing
            // the code tries to run the editing mode within 15 seconds otherwise 
            // checks the loading state of rdfauthor every 10 ms
            var loading = true;
            var count = 0;
            var idInterval = window.setInterval(function(){
                count++;
                // _requirePending indicates how many scripts still have to be appended to dom
                _requirePending > 0 ? loading = true : loading = false;
                // count == 1500 equals 15 seconds
                if (count < 1500) {
                    if (!loading) {
                        // stop interval
                        window.clearInterval(idInterval);
                        // run editing mode
                        init();
                    }
                } else {
                    // stop interval check after 15seconds
                    window.clearInterval(idInterval);
                    console.err('error while using EDIT function (timeout for loading rdfauthor)');
                }
            }, 10);
        },

        /**
         * Returns the element a given statement was found on.
         */
        elementForStatement: function (statement) {
            return _elementsByStatementHash[String(statement)];
        }, 
        
        /**
         * Returns the DOM element to which events are bound
         * @return {$}
         */
        eventTarget: function () {
            return $(_eventTarget);
        },
        
        /**
         * Returns the current view instance
         */
        getView: function () {
            if (null === _view) {
                if (_options.viewOptions.type === 'popover') {
                    _view = _createPopoverView();
                } else if(_options.viewOptions.type === 'mobile'){
                    _view = _createMobileView();
                } else {
                    _view = _createInlineView();
                }
            }
            
            return _view;
        }, 
        
        /**
         * Returns an instance of the widget that has been registered 
         * for <code>hookName</code> and <code>hookValue</code>.
         * @param {string} hookName
         * @param {mixed} hookValue
         * @param {Statement} statement The statement with which to initialize the widget
         * @return {Widget} An object conforming to the Widget interface
         */
        getWidgetForHook: function (hookName, hookValue, statement, options) {
            if (!hookValue) {
                hookValue = '';
            }
            var widgetConstructor = _registeredWidgets[hookName][hookValue];
            
            /* initialize widget */
            return _instantiateWidget(widgetConstructor, statement, options);
        }, 
        
        /**
         * Returns an instance of the widget most suitable for editing statement.
         * @param {Statement} statement
         */
        getWidgetForStatement: function (statement, options) {
            var widgetConstructor = null;
            
            var subjectURI   = statement.subjectURI();
            var predicateURI = statement.predicateURI();
            var datatypeURI  = statement.hasObject() ? statement.objectDatatype() : null;
            var ranges       = this.infoForPredicate(predicateURI, 'range');
            var types        = this.infoForPredicate(predicateURI, 'type');
            
            // local widget selection
            if (subjectURI in _registeredWidgets.resource) {
                widgetConstructor = _registeredWidgets.resource[subjectURI];
            } else if (predicateURI in _registeredWidgets.property) {
                widgetConstructor = _registeredWidgets.property[predicateURI];
            } else if (ranges[0] in _registeredWidgets.range) {
                widgetConstructor = _registeredWidgets.range[ranges[0]];
            } else if (datatypeURI in _registeredWidgets.datatype) {
                widgetConstructor = _registeredWidgets.datatype[datatypeURI];
            }
            
            // try property axioms (property type, property range)
            if (null === widgetConstructor) {
                if (($.inArray(OWL_NS + 'DatatypeProperty', types) >= 0) 
                    || ($.inArray(RDFS_NS + 'Literal', ranges) >= 0)) {
                    
                    widgetConstructor = _registeredWidgets[LITERAL_HOOK][''];
                } else if (
                    /* owl stuff */
                    ($.inArray(OWL_NS + 'ObjectProperty', types) >= 0)
                    || ($.inArray(OWL_NS + 'Thing', ranges) >= 0)
                    || ($.inArray(OWL_NS + 'Class', ranges) >= 0)
                    /* rdfs stuff */
                    || ($.inArray(RDFS_NS + 'Resource', ranges) >= 0)
                    || ($.inArray(RDFS_NS + 'Class', ranges) >= 0)
                ) {
                    
                    widgetConstructor = _registeredWidgets[OBJECT_HOOK][''];
                } else if ($.inArray(RDF_NS + 'XMLLiteral', ranges) >= 0) {
                    var range = RDFauthor.infoForPredicate(statement.predicateURI(), 'range');
                    widgetConstructor = _registeredWidgets['range'][range];
                }
            }
            
            // fallback to default widgets
            if (null === widgetConstructor) {
                if (statement.hasObject()) {
                    var ot = statement.objectType();
                    if (ot == 'literal') {
                        widgetConstructor = _registeredWidgets[LITERAL_HOOK][''];
                    } else {
                        widgetConstructor = _registeredWidgets[OBJECT_HOOK][''];
                    }
                } else {
                    widgetConstructor = _registeredWidgets[DEFAULT_HOOK][''];
                }
            }
            
            /* initialize widget */
            return _instantiateWidget(widgetConstructor, statement, options);
        },
        
        /**
         * Returns info predicate values for the predicate given by predicateURI.
         * An array is alsways return, even if there is only one value in it.
         * @param {string} predicateURI
         * @param {string} infoSpec
         * @return {Array}
         */
        infoForPredicate: function (predicateURI, infoSpec) {
            // predicate info not yet loaded
            if (null !== _predicateInfo) {
                var infoSpecURI;
                if (undefined !== _infoShortcuts[infoSpec]) {
                    infoSpecURI = _infoShortcuts[infoSpec];
                }

                if (undefined !== _predicateInfo[predicateURI]) {
                    if (undefined !== _predicateInfo[predicateURI][infoSpec]) {
                        return  _predicateInfo[predicateURI][infoSpec];
                    }

                    if (undefined !==  _predicateInfo[predicateURI][infoSpecURI]) {
                        return  _predicateInfo[predicateURI][infoSpecURI];
                    }
                }
            }
            
            return [];
        },
        
        /**
         * Returns the datatypes to be supported by typed-literal widgets.
         * @return {array}
         */
        literalDatatypes: function () {
            var types = [];
            for (var t in $.typedValue.types) {
                types.push(t);
            }
            
            /* let others modify datatypes */
            this.eventTarget().trigger('rdfauthor.datatypes', types);

            return types;
        }, 
        
        /**
         * Returns the language tags to be supported by plain-literal widgets.
         * @return {array}
         */
        literalLanguages: function () {
            var langs = ['de', 'en', 'fr', 'nl', 'es', 'it', 'cn', 'ka', 'ru'];
            
            /* let others modify languages */
            this.eventTarget().trigger('rdfauthor.languages', langs);
            
            return langs;
        },
        
        /**
         * Loads a JavaScript file from URI <code>scriptURI</code>.
         * If callback is supplied, it will be called after the script has been loaded.
         * @param {string} scriptURI
         * @param {function} function that will be called when the script finished loading (optional)
         */
        loadScript: function (scriptURI, callback) {
            _loadScript(scriptURI, callback);
        }, 
        
        /**
         * Loads a bunch of JavaScript files at once. If callback is supplied, it will
         * be called after the last script has been loaded.
         * @param {Array} scriptURIs
         * @param {function} callback
         */
        loadScripts: function (scriptURIs, callback) {
            for (var i = 0, max = scriptURIs.length; i < max; i++) {
                var scriptURI = scriptURIs[i];
                var cbParam   = (i === (max - 1)) ? callback : undefined;
                this.loadScript(scriptURI, cbParam);
            }
        }, 
        
        /**
         * Loads a Stylesheet file by including a <code>&lt;script&gt;</code> tag in the page header.
         * @param {string} stylesheetURI
         */
        loadStylesheet: function (stylesheetURI) {
            _loadStylesheet(stylesheetURI);
        },
        
        namespaces: function () {
            return {
                'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#', 
                'rdfs': 'http://www.w3.org/2000/01/rdf-schema#', 
                'owl': 'http://www.w3.org/2002/07/owl#', 
                'xsd': 'http://www.w3.org/2001/XMLSchema#',
                'sysont': 'http://ns.ontowiki.net/SysOnt/'
            }
        }, 
        
        /**
         * With every call, returns a unique ID that can be used to build id attributes
         * for CSS selector access.
         * @param prefix string
         * @return string
         */
        nextID: function (prefix) {
            return (prefix ? String(prefix) : '') + _idSeed++;
        },
        
        /**
         * Sends a SPARQL query to the endpoint for graph denoted by graphURI.
         * @param {string} graphURI The graph to be queried
         * @param {string} query the SPARQL query
         * @param {object} options An object with optional parameters. The following key are recognized:
         *  <ul>
         *    <li>{function} <code>callbackSuccess</code> Function to be called when the query 
         *        was executed sucessfully (implies asynchronous = true). The function 
         *        should accept one parameter which is a 
         *        <a href="http://www.w3.org/TR/rdf-sparql-json-res/">SPARQL Results JSON</a> object.</li>
         *    <li>{function} <code>callbackError</code> Function to be called if an error occurs.</li>
         *    <li>{boolean} <code>async</code> Function to be called if an error occurs. If false, the 
         *        query result will be returned. Otherwise, callbackSuccess must be supplied and 
         *        will be called.</li>
         *    <li>{string} <code>sparqlEndpoint</code> The URI for the SPARQL endpoint to be used.</li>
         *  </ul>  
         * @throws An exception if the graph queried has no associated SPARQL endpoint.
         */
        queryGraph: function (graphURI, query, options) {
            var defaults = {
                callbackSuccess: null, 
                callbackError: null, 
                async: true, 
                sparqlEndpoint: null 
            };
            var o = $.extend(defaults, options);
            
            var serviceURI = o.sparqlEndpoint ? o.sparqlEndpoint : this.serviceURIForGraph(graphURI);
            if (undefined === serviceURI) {
            	var errorMsg = "Graph '" + graphURI + "' has no SPARQL endpoint defined.";
            	//console.error("[RDFAuthor]", errorMsg);
            	//console.debug("[RDFAuthor] Registered graphs", _graphInfo);
            	
                throw errorMsg;
            }
            
            /* Request parameters */
            var parameters = {
                query: query, 
                'default-graph-uri': graphURI
            }
            
            /* Default ajax options (JSON) */
            var ajaxOptions = {
                timeout: 2000, 
                dataType: 'json', 
                url: serviceURI, 
                data: parameters, 
                async: o.async, 
                /* request application/sparql-results+json */
                beforeSend: function (XMLHTTPRequest) {
                    XMLHTTPRequest.setRequestHeader('Accept', 'application/sparql-results+json');
                    // XMLHTTPRequest.setRequestHeader('Accept', 'application/javascript');
                }
            };
            
            /* Success callback */
            if (typeof o.callbackSuccess == 'function') {
                ajaxOptions.success = function (data, status) {o.callbackSuccess(data);}
            }
            
            /* Error callback */
            if (typeof o.callbackError == 'function') {
                ajaxOptions.error = function (request, status, error) {o.callbackError(status, error);}
            }
            
            var serviceLocation = _parseURL(serviceURI);
            var currentLocation = window.location;
            
            /* 
             * Check whether JSONp is necessary 
             * http://en.wikipedia.org/wiki/Same_origin_policy#Origin_determination_rules
             */
            if (!(currentLocation.protocol.replace(':', '') === serviceLocation.protocol && 
                currentLocation.hostname === serviceLocation.hostname /*&&
                currentLocation.port     === serviceLocation.port*/)) {
                
                /* not same origin, use JSONp and modify ajax options accordingly */
                var JSONpOptions = {
                    dataType: 'jsonp',
                    callbackParameter: 'callback'
                }
                $.extend(ajaxOptions, JSONpOptions);
            }
            
            $.ajax(ajaxOptions);
        },
        
        /**
         * Registers a predicate to automatically be queried for all predicates.
         * Widgets will be provided with values of these predicates on request.
         * @param {string} infoPredicateURI The URI of the info predicate.
         * @param {string} infoSpec Short name for the info predicate (optional).
         * @throws An exception if shortcut has already been registered .
         */
        registerInfoPredicate: function (infoPredicateURI, shortcut) {
            if ((arguments.length > 1) && (undefined !== _infoShortcuts[shortcut])) {
                throw 'Shortcut has already been registered.';
            }
            
            _addInfoPredicate(infoPredicateURI, shortcut);
        },
        
        /**
         * Registers a new widget type.
         * @param {object} widgetObject An object conforming the the widget specification.
         * @param {object} widgetSpec An object with the following keys:
         *  <ul>
         *  <li><code>widgetSpec</code> One of <code>resource</code>, <code>property</code>, <code>range</code>, 
         *                            <code>datatype</code></li>
         *  <li><code>hookSpec</code> An array of possible values for hookName that trigger the widget</li>
         *  </ul>
         */
        registerWidget: function (widgetSpec, hooks) {
            // Check interface conformance
            // if (!_checkInterface(widgetSpec, Widget)) {
                // throw "Registered object does not conform to 'Widget' interface.";
            // }
            
            // ensure array
            if (!$.isArray(hooks)) {
                hooks = [hooks];
            }
            for (var i = 0; i < hooks.length; i++) {
                // the default hook value is an empty string (any value)
                var hookSpec = $.extend({values: ['']}, hooks[i]);
                // is the hook supported for which the widget attemps to register?
                if (_registeredWidgets[hookSpec.name]) {
                    // Register for all hook values
                    for (var j = 0; j < hookSpec.values.length; j++) {
                        var value = hookSpec.values[j];
                        if (!_registeredWidgets[hookSpec.name][value]) {
                            _registeredWidgets[hookSpec.name][value] = _createWidget(widgetSpec);
                        }
                    }
                }
                _callIfIsFunction(hookSpec.callback);
            }
        },
        
        /**
         * Resets private variables (mainly used for testing).
         */
        reset: function () {
            _resetDatabanks();
            _resetOptions();
            _resetParser();
            _resetView();
            
            _defaultGraphURI   = null;
            _defaultSubjectURI = null;
            _loadedScripts     = {};
            _loadedStylesheets = {};
            
            // remove events
            $(this.eventTarget()).unbind();
        },
        
        /**
         * Searches the property cache for a label matchint 'term'.
         * @param {string} term
         * @return {array}
         */
        searchCacheByLabel: function (term) {
            var results = [];
            for (var property in __cache) {
                var propertyLabel = __cache[property]['label'];
                if (propertyLabel && String(propertyLabel.search(term)) > -1) {
                    results.push($.extend({}, __cache[property], {'uri': property}));
                }
            }
            return results;
        },
        
        /**
         * Returns the SPARQL query service URI for graph denoted by graphURI.
         * @param {string} graphURI
         * @return {string}
         */
        serviceURIForGraph: function (graphURI) {
            if (graphURI && graphURI in _graphInfo) {
                return _graphInfo[graphURI].queryEndpoint;
            }
            
            if (typeof RDFAUTHOR_DEFAULT_SERVICE_ENDPOINT != 'undefined') {
                return RDFAUTHOR_DEFAULT_SERVICE_ENDPOINT;
            }
            
            return undefined;
        }, 
        
        /**
         * Sets the info predicates for the graph denoted by graphURI.
         * Currently the info spec keys 'queryEndpoint' and 'updateEndpoint' 
         * (both pointing to a URI) are recognized.
         */
        setInfoForGraph: function (graphURI, infoSpec, infoValue) {
            if (!(graphURI in _graphInfo)) {
                _graphInfo[graphURI] = {};
            }
            
            _graphInfo[graphURI][infoSpec] = infoValue;
        }, 
        
        /**
         * Returns the SPARQL query service URI for graph denoted by graphURI.
         * @param {string} graphURI
         * @return {string}
         */
        updateURIForGraph: function (graphURI) {
            if (graphURI && graphURI in _graphInfo) {
                return _graphInfo[graphURI].updateEndpoint;
            }
            
            if (typeof RDFAUTHOR_DEFAULT_UPDATE_ENDPOINT != 'undefined') {
                return RDFAUTHOR_DEFAULT_UPDATE_ENDPOINT;
            }
            
            return undefined;
        },
        
        /**
         * Sets RDFauthor options
         * @param {object} optionSpec
         */
        setOptions: function (optionSpec) {
            $.extend(_options, optionSpec);
        }, 
        
        /**
         * Starts editing the current page. If root defines a valid DOM element, only
         * those triples that where extracted from root or its children are beeing edited.
         * @param {HTMLElement} root
         */
        start: function (root) {
            if (arguments.length >= 1) {
                _setRoot(root);
            } else {
                _setRoot(null);
            }
            
            this.eventTarget().trigger('rdfauthor.start');
            /* parse */
            _parse(function() {
                /* display view */
                _populateView();
                _showView();
            });
        }
    }
})(jQuery);
