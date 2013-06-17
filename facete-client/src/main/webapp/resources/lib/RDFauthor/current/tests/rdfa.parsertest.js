$(document).ready(function() {
    module('rdfa.parser', {
        setup: function() {
            RDFA.reset();
        }
    });
    
    // check basic triple count
    asyncTest('triple count', 1, function() {
        var numTriples = 0;
        RDFA.NAMED_GRAPH_ATTRIBUTE = {attribute: 'from', ns: 'http://ns.aksw.org/update/'};
        RDFA.CALLBACK_NEW_TRIPLE_WITH_URI_OBJECT = function(e, t, g) {
            numTriples++;
        };
        RDFA.CALLBACK_NEW_TRIPLE_WITH_LITERAL_OBJECT = function(e, t, g) {
            numTriples++;
        }
        RDFA.CALLBACK_DONE_PARSING = function() {
            equal(numTriples, 6, 'Parsing should yield 6 triples.');
            start();
        }
        RDFA.parse();
    });
    
    // check individual triples
    asyncTest('exact triples', 5, function() {
        var expected = {
            'http://example.com/g1/': [
                '<http://example.com/r1> <http://www.w3.org/2000/01/rdf-schema#label> "Resource 1" .', 
                '<http://example.com/r1> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.com/c1> .', 
                '<http://example.com/r1> <http://xmlns.com/foaf/0.1/homepage> <http://example.com/h1> .', 
                '<http://example.com/r1> <http://xmlns.com/foaf/0.1/homepage> <http://example.com/h2> .'
                
            ], 
            'http://example.com/g2/': [
                '<http://example.com/r1> <http://www.w3.org/2000/01/rdf-schema#label> "Resource 1 (label 2)"^^<http://www.w3.org/2001/XMLSchema#string> .'
            ], 
            'http://example.com/g3/': []
        };
        
        var triples = [];
        var graphs  = [];
        
        RDFA.NAMED_GRAPH_ATTRIBUTE = {attribute: 'from', ns: 'http://ns.aksw.org/update/'};
        RDFA.CALLBACK_NEW_TRIPLE_WITH_URI_OBJECT = function(e, t, g) {
            triples.push(t);
            graphs.push(g);
        };
        RDFA.CALLBACK_NEW_TRIPLE_WITH_LITERAL_OBJECT = function(e, t, g) {
            triples.push(t);
            graphs.push(g);
        }
        RDFA.CALLBACK_DONE_PARSING = function() {
            for (var i in triples) {
                var t = triples[i];
                var g = graphs[i];
                if (!(g instanceof RDFBlankNode)) {
                    ok($.inArray(String(t), expected[g]) > -1, 'Triple ' + String(t) + ' should be present in expected graph <' + String(g) + '>.');
                }
            }
            start();
        }
        RDFA.parse();
    });
});
