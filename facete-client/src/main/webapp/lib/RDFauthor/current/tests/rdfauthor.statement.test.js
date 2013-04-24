$(document).ready(function() {
    module('rdfauthor.statement', {
        setup: function () {
            RDFauthor.reset();
            this.fixture = new Statement({
                subject: '<http://example.com/r1>', 
                predicate: '<http://ns.aksw.org/update/p1>', 
                object: {
                    type: 'literal', 
                    value: 'Foo'
                }}, {graph:'http://example.com/g1/', hidden: true, required: true, protected: true, title: 'Property One'});
        }, 
        teardown: function () {
            this.fixture = null;
        }
    });
    
    test('initSimple', 3, function() {
        var s1 = new Statement({
            subject: '<http://example.com/r1>', 
            predicate: '<http://example.com/p1>', 
            object: {
                type: 'uri', 
                value: '<http://example.com/o1>'
            }});
        equal(
            String(s1), 
            '<http://example.com/r1> <http://example.com/p1> <http://example.com/o1> .', 
            'Statement should be <http://example.com/r1> <http://example.com/p1> <http://example.com/o1> .');
       
        var s2 = new Statement({subject: '<http://example.com/r1>', predicate: '<http://example.com/p1>', 
        object: {value: 'Bar', type: 'literal'}});
        equal(
            String(s2), 
            '<http://example.com/r1> <http://example.com/p1> "Bar" .', 
            'Statement should be <http://example.com/r1> <http://example.com/p1> "Bar" .');
        
        var s3 = new Statement({subject: '<http://example.com/r3>', predicate: '<http://example.com/p3>'});
        ok(!s3.hasObject(), 'Statment should not have an object set.');
    });
    
    test('initComlex', 3, function() {        
        var s1 = new Statement({
            subject: {value: '<http://example.com/cr1>'}, 
            predicate: {value: 'ex:cp1', options: {namespaces: {'ex': 'http://example.com/'}}}, 
            object: {value: '<http://example.com/co1>', type: 'uri'}
        });
        equal(
            String(s1), 
            '<http://example.com/cr1> <http://example.com/cp1> <http://example.com/co1> .', 
            'Statement should be <http://example.com/cr1> <http://example.com/cp1> <http://example.com/co1> .');

        var s2 = new Statement({
            subject: '<http://example.com/r1>', 
            predicate: '<http://example.com/p1>', 
            object: {type: 'literal', value: 'Bar', options: {datatype: 'http://www.w3.org/2001/XMLSchema#string'}}});
        equal(
            String(s2), 
            '<http://example.com/r1> <http://example.com/p1> "Bar"^^<http://www.w3.org/2001/XMLSchema#string> .', 
            'Statemetn should be <http://example.com/r1> <http://example.com/p1> "Bar"^^<http://www.w3.org/2001/XMLSchema#string> .');
        
        var s3 = new Statement({
            subject: '<http://example.com/r1>', 
            predicate: '<http://example.com/p1>', 
            object: {type: 'literal', value: 'ttt', options: {lang: 'de'}}});
        equal(
            String(s3), 
            '<http://example.com/r1> <http://example.com/p1> "ttt"@de .', 
            'Statement should be <http://example.com/r1> <http://example.com/p1> "ttt"@de .');
    });
    
    test('initWithLongLiteral', 6, function() {        
        var s1 = new Statement({
            subject: {value: '<http://example.com/r1>'}, 
            predicate: {value: 'ex:p1', options: {namespaces: {'ex': 'http://example.com/'}}}, 
            object: {value: 'literal with \' single quote.', type: 'literal'}
        });
        equal(
            String(s1), 
            '<http://example.com/r1> <http://example.com/p1> "literal with \' single quote." .', 
            'Statement should be <http://example.com/r1> <http://example.com/p1> "literal with \' single quote." .');
        
        var s2 = new Statement({
            subject: {value: '<http://example.com/r2>'}, 
            predicate: {value: 'ex:p2', options: {namespaces: {'ex': 'http://example.com/'}}}, 
            object: {value: 'literal with "double" quote.', type: 'literal'}
        });
        equal(
            String(s2), 
            '<http://example.com/r2> <http://example.com/p2> "literal with \"double\" quote." .', 
            'Statement should be <http://example.com/r2> <http://example.com/p2> "literal with \"double\" quote." .');
        
        var s3 = new Statement({
            subject: {value: '<http://example.com/r3>'}, 
            predicate: {value: 'ex:p3', options: {namespaces: {'ex': 'http://example.com/'}}}, 
            object: {value: 'literal with \n line break.', type: 'literal'}
        });
        equal(
            String(s3), 
            '<http://example.com/r3> <http://example.com/p3> """literal with \n line break.""" .', 
            'Statement should be <http://example.com/r3> <http://example.com/p3> """literal with \n line break.""" .');

        var s4 = new Statement({
            subject: {value: '<http://example.com/r4>'}, 
            predicate: {value: 'ex:p4', options: {namespaces: {'ex': 'http://example.com/'}}}, 
            object: {value: 'literal with \t tab.', type: 'literal'}
        });
        equal(
            String(s4), 
            '<http://example.com/r4> <http://example.com/p4> "literal with \t tab." .', 
            'Statement should be <http://example.com/r4> <http://example.com/p4> "literal with \t tab." .');
        
        var s5 = new Statement({
            subject: {value: '<http://example.com/r5>'}, 
            predicate: {value: 'ex:p5', options: {namespaces: {'ex': 'http://example.com/'}}}, 
            object: {value: 'literal with ünícóde.', type: 'literal'}
        });
        equal(
            String(s5), 
            '<http://example.com/r5> <http://example.com/p5> "literal with ünícóde." .', 
            'Statement should be <http://example.com/r5> <http://example.com/p5> "literal with ünícóde." .');
        
        var s6 = new Statement({
            subject: {value: '<http://example.com/1>'}, 
            predicate: {value: '<http://example.com/2>'}, 
            object: {type: 'literal', value: 'Over the past 3 years, the semantic web activity has gained momentum with the widespread publishing of structured data as RDF. The Linked Data paradigm has therefore evolved from a practical research idea into a very promising candidate for addressing one of the biggest challenges in the area of intelligent information management: the exploitation of the Web as a platform for data and information integration in addition to document search. To translate this initial success into a world-scale disruptive reality, encompassing the Web 2.0 world and enterprise data alike, the following research challenges need to be addressed: improve coherence and quality of data published on the Web, close the performance gap between relational and RDF data management, establish trust on the Linked Data Web and generally lower the entrance barrier for data publishers and users. With partners among those who initiated and strongly supported the Linked Open Data initiative, the LOD2 project aims at tackling these challenges by developing:\n<ol>\n<li>enterprise-ready tools and methodologies for exposing and managing very large amounts of structured information on the Data Web,</li>\n<li>a testbed and bootstrap network of high-quality multi-domain, multi-lingual ontologies from sources such as Wikipedia and OpenStreetMap.</li>\n<li>algorithms based on machine learning for automatically interlinking and fusing data from the Web.</li>\n<li>standards and methods for reliably tracking provenance, ensuring privacy and data security as well as for assessing the quality of information.</li>\n<li>adaptive tools for searching, browsing, and authoring of Linked Data.</li>\n</ol>\nWe will integrate and syndicate linked data with large-scale, existing applications and showcase the benefits in the three application scenarios of media & publishing, corporate data intranets and eGovernment. The resulting tools, methods and data sets have the potential to change the Web as we know it today.'}
        });
        equal(
            String(s6), 
            '<http://example.com/1> <http://example.com/2> """Over the past 3 years, the semantic web activity has gained momentum with the widespread publishing of structured data as RDF. The Linked Data paradigm has therefore evolved from a practical research idea into a very promising candidate for addressing one of the biggest challenges in the area of intelligent information management: the exploitation of the Web as a platform for data and information integration in addition to document search. To translate this initial success into a world-scale disruptive reality, encompassing the Web 2.0 world and enterprise data alike, the following research challenges need to be addressed: improve coherence and quality of data published on the Web, close the performance gap between relational and RDF data management, establish trust on the Linked Data Web and generally lower the entrance barrier for data publishers and users. With partners among those who initiated and strongly supported the Linked Open Data initiative, the LOD2 project aims at tackling these challenges by developing:\n<ol>\n<li>enterprise-ready tools and methodologies for exposing and managing very large amounts of structured information on the Data Web,</li>\n<li>a testbed and bootstrap network of high-quality multi-domain, multi-lingual ontologies from sources such as Wikipedia and OpenStreetMap.</li>\n<li>algorithms based on machine learning for automatically interlinking and fusing data from the Web.</li>\n<li>standards and methods for reliably tracking provenance, ensuring privacy and data security as well as for assessing the quality of information.</li>\n<li>adaptive tools for searching, browsing, and authoring of Linked Data.</li>\n</ol>\nWe will integrate and syndicate linked data with large-scale, existing applications and showcase the benefits in the three application scenarios of media & publishing, corporate data intranets and eGovernment. The resulting tools, methods and data sets have the potential to change the Web as we know it today.""" .', 
            'Statement should match.');
    });
    
    test('asRdfQueryTriple', 2, function() {
        ok(this.fixture.asRdfQueryTriple() instanceof $.rdf.triple, 'should be instanceof $.rdf.triple');
        equal(
            String(this.fixture.asRdfQueryTriple()), 
            '<http://example.com/r1> <http://ns.aksw.org/update/p1> "Foo" .', 
            'Statement should be <http://example.com/r1> <http://ns.aksw.org/update/p1> "Foo" .');
    });
    
    test('toString', 1, function() {
        equal(
            this.fixture.toString(), 
            '<http://example.com/r1> <http://ns.aksw.org/update/p1> "Foo" .', 
            'Statement should be <http://example.com/r1> <http://ns.aksw.org/update/p1> "Foo" .');
    });
    
    test('isHiddden', 1, function() {
        ok(this.fixture.isHidden(), 'Statement should be hidden.');
    });
    
    test('isRequired', 1, function() {
        ok(this.fixture.isRequired(), 'Statement should be required.');
    });
    
    test('isProtected', 1, function() {
        equals(this.fixture.isProtected(), true, 'Statement should be protected.');
    });
    
    test('isUpdateVocab', 1, function() {
       equals(this.fixture.isUpdateVocab(), true, 'Statement should be from update vocab.');
    });
    
    test('hasObject', 2, function() {
        ok(this.fixture.hasObject(), 'Test w/ object defined', 'Statement should have an object.');
        
        var s = new Statement({subject: '<http://example.com/r1>', predicate: '<http://example.com/p1>', object: null});
        equal(s.hasObject(), false, 'Test w/o object defined', 'Statement should not have an object.');
    });
    
    test('predicateLabel', 3, function() {
        equal(this.fixture.predicateLabel(), 'Property One', 'predicate label should be Property One.');
        
        // if no label given, URI should be used
        var s = new Statement({subject: '<http://example.com/r1>', predicate: '<http://example.com/p1>', object: {value: '<http://example.com/o1>', type: 'uri'}});
        equal(s.predicateLabel(), 'p1', 'predicate label should be p1');
        
        var s = new Statement({subject: '<http://example.com/r1>', predicate: '<http://example.com#ttt>', object: {value: '<http://example.com#abc>', type: 'literal'}});
        equal(s.predicateLabel(), 'ttt', 'predicate label should be ttt.');
    });
    
    test('isDatatypeValid', 2, function() {        
        // xsd:string should be valid
        ok(this.fixture.isDatatypeValid('http://www.w3.org/2001/XMLSchema#string'), 'xsd:string should be valid.');
        
        // this should fail
        equal(this.fixture.isDatatypeValid('http://example.com/myUnregisteredDatatype'), false, 'ex:myUnregisteredDatatype should not be valid.');
    });
    
    test('registerDatatype', 2, function() {        
        // datatype should be invalid
        equal(this.fixture.isDatatypeValid('http://example.com/myUnregisteredDatatype'), false, 'ex:myUnregisteredDatatype should be invalid.');
        
        // register it
        this.fixture.registerDatatype('http://example.com/myUnregisteredDatatype');
        
        // should be ok now
        ok(this.fixture.isDatatypeValid('http://example.com/myUnregisteredDatatype'), 'ex:myUnregisteredDatatype should be valid.');
    });
    
    test('graphURI', 1, function() {
        equal(this.fixture.graphURI(), 'http://example.com/g1/', 'Graph URI should match the one provided on instantiation');
    });
});

