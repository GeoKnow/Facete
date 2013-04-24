$(document).ready(function() {
    module('rdfauthor', {
        setup: function () {
            delete RDFAUTHOR_DEFAULT_GRAPH;
            this.fixture = RDFauthor;
        }, 
        
        teardown: function () {
            this.fixture.reset();
            this.fixture = null;
        }
    });
    
    test('setup', 2, function() {
        ok(typeof RDFauthor == 'object', 'RDFauthor should be of type \'object\'.');
        equal(this.fixture, RDFauthor, 'RDFauthor should be the same object as test fixture.');
    });
    
    test('addStatement', 3, function() {
        var db = this.fixture.databankForGraph('http://example.com/addStatement/');
        equal(db.size(), 0, 'Databank should have 0 triples');
        
        var s1 = new Statement(
            {subject: '<http://example.com/r1>', predicate: '<http://example.com/p1>', object: {value: '<http://example.com/o1>', type: 'literal'}}, 
            {graph: 'http://example.com/addStatement/'});
        
        this.fixture.addStatement(s1);
        equal(db.size(), 1, 'Databank should now have 1 triple');

        var s2 = new Statement(
            {subject: '<http://example.com/r1>', predicate: '<http://example.com/p1>', object: {value: 'Bar', type: 'literal'}}, 
            {graph: 'http://example.com/addStatement/'});
        this.fixture.addStatement(s2);
        equal(db.size(), 2, 'Databank should now have 2 triples');
    });
    
    test('defaultGraphURI', 3, function() {
        equal(this.fixture.defaultGraphURI(), 
              document.location.href, 
              'Default graph should equal page graph.');
        
        this.fixture.reset();
        this.fixture.setOptions({defaultGraph: 'http://example.com/g1/'});
        equal(this.fixture.defaultGraphURI(), 
              'http://example.com/g1/', 
              'Default graph should equal the one set.');
        
        this.fixture.reset();
        RDFAUTHOR_DEFAULT_GRAPH = 'http://example.com/g2/';
        equal(this.fixture.defaultGraphURI(), 
              'http://example.com/g2/', 
              'Default graph should equal the one set.');
        
    });
    
    test('defaultSubjectURI', 2, function() {
        this.fixture.setOptions({defaultSubject: 'http://example.com/s1'});
        equal(this.fixture.defaultSubjectURI(), 
              'http://example.com/s1', 
              'Default subject should equal the one set.');
        
        this.fixture.reset();
        RDFAUTHOR_DEFAULT_SUBJECT = 'http://example.com/s2';
        equal(this.fixture.defaultSubjectURI(), 
              'http://example.com/s2', 
              'Default subject should equal the one set.');
    });
    
    test('databankForGraph', 2, function() {
        this.fixture.reset();
        var db = this.fixture.databankForGraph('http://example.com/g1/');
        equal(db.size(), 0, 'Databank should have 0 triples');
        
        // add a statement
        var s1 = new Statement(
            {subject: '<http://example.com/r1>', predicate: '<http://example.com/p1>', object: {value: '<http://example.com/o1>', type: 'uri'}}, 
            {graph: 'http://example.com/g1/'});
        
        this.fixture.addStatement(s1);
        
        // re-retrieve db for graph
        db = this.fixture.databankForGraph('http://example.com/g1/');
        equal(db.size(), 1, 'Databank should now have 1 triple');
    });
    
    test('eventTarget', 1, function() {
        ok(this.fixture.eventTarget().get(0) === document.body, 'Event target should be <code>body</code> element');
        // equal(this.fixture.eventTarget().get(0), document.body, 'Event target should be <code>body</code> element');
    });
    
    test('literalDatatypes', 2, function() {
        var dt = this.fixture.literalDatatypes();
        ok($.inArray('http://www.w3.org/2001/XMLSchema#string', dt) >= 0, 'Datatypes should contain \'xsd:string\'.');
        ok($.inArray('http://www.w3.org/2001/XMLSchema#int', dt) >= 0, 'Datatypes should contain \'xsd:int\'.');
    });
    
    test('literalLanguages', 2, function() {
        var dt = this.fixture.literalLanguages();
        ok($.inArray('en', dt) >= 0, 'Languages should contain \'en\'.');
        ok($.inArray('de', dt) >= 0, 'Languages should contain \'de\'.');
    });
    
    test('loadScript', 3, function() {
        var scriptURI = RDFAUTHOR_BASE + 'tests/resources/dummy.js';
        equal($('head').find('script[src=' + scriptURI + ']').length, 0, 'Script has not been loaded.');
        stop(2000); /* stop and make test fail after 2000 ms */
        
        this.fixture.loadScript(scriptURI, function() {
            equal($('head').find('script[src=' + scriptURI + ']').length, 1, 'Script should have been loaded.');
            ok(DUMMY_LOADED, 'Dummy variable should have been set.');
            start();
        });
    });
    
    test('loadScriptTwice', 4, function() {
        var scriptURI = RDFAUTHOR_BASE + 'tests/resources/dummy2.js';
        equal($('head').find('script[src=' + scriptURI + ']').length, 0, 'Script has not been loaded.');
        stop(2000); /* stop and make test fail after 2000 ms */
        
        var that = this;
        this.fixture.loadScript(scriptURI, function() {
            equal($('head').find('script[src=' + scriptURI + ']').length, 1, 'Script should have been loaded');
            // load same script another time
            that.fixture.loadScript(scriptURI, function() {
                equal($('head').find('script[src=' + scriptURI + ']').length, 1, 'Script should still have been loaded only once');
                ok(DUMMY2_LOADED, 'Dummy2 variable should have been set.');
                start();
            });
        });
    });
    
    test('loadScripts', 6, function() {
        var scripts = [
            RDFAUTHOR_BASE + 'tests/resources/dummy.js', 
            RDFAUTHOR_BASE + 'tests/resources/dummy2.js'];
        
        for (var i = 0; i < scripts.length; i++) {
            var scriptURI = scripts[i];
            if ($('head').find('script[src=' + scriptURI + ']').length > 0) {
                // remove script
                $('head').find('script[src=' + scriptURI + ']').remove();
            }
        }
        
        // ensure scripts are not loaded
        equal($('head').find('script[src=' + RDFAUTHOR_BASE + 'tests/resources/dummy.js' + ']').length, 0, 
            'Script has not been loaded.');
        equal($('head').find('script[src=' + RDFAUTHOR_BASE + 'tests/resources/dummy2.js' + ']').length, 0, 
            'Script has not been loaded.');
        
        stop(2000); /* stop and make test fail after 2000 ms */
        
        // load scripts combined
        this.fixture.loadScripts(scripts, function() {
            // this should only be called after the second script has loaded, so both dummy vars must be true
            equal($('head').find('script[src=' + RDFAUTHOR_BASE + 'tests/resources/dummy.js' + ']').length, 1, 
                'Script should have been loaded.');
            equal($('head').find('script[src=' + RDFAUTHOR_BASE + 'tests/resources/dummy2.js' + ']').length, 1, 
                'Script should have been loaded.');
            
            ok(DUMMY_LOADED, 'Dummy variable 1 should have been set.');
            ok(DUMMY2_LOADED, 'Dummy variable 2 should have been set.');
            start();
        });
        
    });
    
    test('loadStylesheet', 3, function() {
        var stylesheetURI = RDFAUTHOR_BASE + 'tests/resources/dummy.css';
        equal($('head').find('link[rel=stylesheet][src=' + stylesheetURI + ']').length, 0, 
            'Stylesheet has not been loaded.');
        this.fixture.loadStylesheet(stylesheetURI);
        equal($('head').find('link[rel=stylesheet][href=' + stylesheetURI + ']').length, 1, 
            'Stylesheet should have been loaded.');
        equal($('#' + TEST_CONTAINER_ID).length, 1, 'Test container should be in DOM');
    });
    
    test('nextID', function() {
        var first = this.fixture.nextID();
        equal(this.fixture.nextID(), Number(first) + 1);
        equal(this.fixture.nextID('prefix'), 'prefix' + (Number(first) + 2));
    });
    
    test('registerInfoPredicate', 1, function() {
        this.fixture.registerInfoPredicate('http://www.w3.org/2000/01/rdf-schema#label', 'labelaaaa');
        try {
            this.fixture.registerInfoPredicate('http://www.w3.org/2000/01/rdf-schema#ttt', 'labelaaaa');
        } catch (e) {
            ok(true, 'Exception should be thrown.');
        }
    });
    
    test('setOptions', 2, function() {
        this.fixture.reset();
        equal(this.fixture.defaultGraphURI(), 
              document.location.href, 
              'Default graph should equal page graph.');
        
        this.fixture.reset();
        this.fixture.setOptions({defaultGraph: 'http://example.com/g1/'});
        
        equal(this.fixture.defaultGraphURI(), 
              'http://example.com/g1/', 
              'Default graph should equal the one set.');
    });
    
    test('serviceURIForGraph', 2, function() {
        this.fixture.reset();
        var g = this.fixture.defaultGraphURI();
        this.fixture.setInfoForGraph(g, 'queryEndpoint', 'http://example.com/sparql');
        equal(this.fixture.serviceURIForGraph(g), 'http://example.com/sparql', 'Service URI should match the one set.');
        ok(this.fixture.updateURIForGraph(g) != 'http://example.com/sparql', 'Service URI should not match update URI.');
    });
    
    test('updateURIForGraph', 2, function() {
        this.fixture.reset();
        var g = this.fixture.defaultGraphURI();
        this.fixture.setInfoForGraph(g, 'updateEndpoint', 'http://example.com/update');
        equal(this.fixture.updateURIForGraph(g), 'http://example.com/update', 'Update URI should match the one set.');
        ok(this.fixture.serviceURIForGraph(g) != 'http://example.com/update', 'Update URI should not match service URI.');
    });
    
    test('reset', 2, function() {
        var g = this.fixture.defaultGraphURI();
        RDFAUTHOR_DEFAULT_GRAPH = 'http://example.com/';
        ok(this.fixture.defaultGraphURI() != RDFAUTHOR_DEFAULT_GRAPH, 'Default graph should not match.');
        this.fixture.reset();
        equal(this.fixture.defaultGraphURI(), RDFAUTHOR_DEFAULT_GRAPH, 'Default graph should now match.');
    });
    
    test('namespaces', 3, function() {
        ok('rdf' in this.fixture.namespaces(), 'Namespaces should contain RDF');
        ok('rdfs' in this.fixture.namespaces(), 'Namespaces should contain RDFS');
        ok('owl' in this.fixture.namespaces(), 'Namespaces should contain OWL');
    });
    
    test('infoForPredicate', 1, function() {
        same([], this.fixture.infoForPredicate('http://example.com/p1', 'ttt'), 'Info for unknown predicate should be empty');
    });
    
    // skip this test in IE
    // if (!jQuery.browser.msie) {
    //     test('commit', 1, function() {
    //         this.fixture.eventTarget().bind('rdfauthor.commit', function () {
    //             ok(true, 'Commit event should have been triggered.');
    //         });
    //         stop(2000); /* stop and make test fail after 2000 ms */
    //         this.fixture.commit();
    //         start();
    //     });
    // }
    
    test('cancel', 1, function() {
        this.fixture.eventTarget().bind('rdfauthor.cancel', function () {
            ok(true, 'Cancel event should have been triggered.');
        });
        stop(2000); /* stop and make test fail after 2000 ms */
        this.fixture.cancel();
        start();
    });
    
    // test('start', 1, function() {
    //     this.fixture.eventTarget().bind('rdfauthor.start', function () {
    //         ok(true, 'Start event should have been triggered.');
    //     });
    //     stop(2000); /* stop and make test fail after 2000 ms */
    //     this.fixture.cancel();
    //     this.fixture.start();
    // });
    
    test('registerWidget', 2, function() {
        this.fixture.registerWidget({
            element: function () {}, 
            markup:  function () {}, 
            remove:  function () {}, 
            submit:  function () {}
        }, [{name: '__DEBUG__'}]);
        
        var w = this.fixture.getWidgetForHook('__DEBUG__', null, '__statement__');
        ok(Widget.isPrototypeOf(w), 'Widget should be prototype of widget instance.');
        equal(w.statement, '__statement__', 'Constructor should have been called.');
    });
    
    /*    
    test('getWidgetForHook', 0, function() {
        
    });
    
    test('getWidgetForStatement', 0, function() {
        
    });
    
    test('queryGraph', 0, function() {
        
    });
    
    test('getView', 0, function() {

    });
    */
});
