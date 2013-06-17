$(document).ready(function() {
    module('rdfauthor.subjectgroup', {
        setup: function () {
            this.fixture = new SubjectGroup('http://example.com/', 'http://example.com/subject1', 'Subject 1', $('#test-container'), 11);
        }, 
        teardown: function () {
            this.fixture = null;
            $('#' + TEST_CONTAINER_ID).empty();
        }
    });
    
    test('init', 2, function() {
       ok(this.fixture instanceof SubjectGroup, 'Should be instanceof SubjectGroup');
       equal($('#test-container').children('.subject-group').length, 1, 'Container should have 1 child of class subject-group.');
    });
    
    test('addWidget', 2, function() {        
        this.fixture.addWidget(statement1, new _Widget);
        equal(this.fixture.numberOfRows(), 1, 'Should have 1 row.');
        
        // add wrong statement
        try {
            this.fixture.addWidget(statement2);
        } catch (e) {
            equal(String(e), 'Statement not associated with this row (invalid subject).', 'Expected exception');
        }
    });
    
    test('getRowByID', function() {
        
    });
    
    test('getRowByPredicate', 2, function() {
        this.fixture.addWidget(statement1, new _Widget);
        var r = this.fixture.getRowByPredicate('http://example.com/predicate1');
        ok(r instanceof PredicateRow, 'Should be an instanceof PredicateRow');
        this.fixture.addWidget(statement1, _Widget);
        var r2 = this.fixture.getRowByPredicate('http://example.com/predicate1');
        ok(r === r2, 'Rows should be equal.');
    });
    
    test('show', 2, function() {
        var el = this.fixture.getElement();
        $(el).hide();
        equal($(el).css('display'), 'none', 'Element should not be visible before');
        this.fixture.show(false);
        ok($(el).css('display') != 'none', 'Element should be visible afterwards.');
    });
    
    test('hide', 2, function() {
        var el = this.fixture.getElement();
        $(el).show();
        ok($(el).css('display') != 'none', 'Element should be visible before.');
        this.fixture.hide(false);
        equal($(el).css('display'), 'none', 'Element should not be visible afterwards');
    });
});
