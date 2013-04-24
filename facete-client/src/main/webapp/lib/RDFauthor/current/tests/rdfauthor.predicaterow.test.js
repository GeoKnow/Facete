$(document).ready(function() {
    module('rdfauthor.predicaterow', {
        setup: function () {
            RDFauthor.reset();
            this.fixture = new PredicateRow('http://example.com/r1', 'http://example.com/p1', 'Predicate', $('#test-container'), 123);
        }, 
        teardown: function () {
            this.fixture = null;
            $('#' + TEST_CONTAINER_ID).empty();
        }
    });

    test('init', 4, function() {
        ok(this.fixture instanceof PredicateRow, 'Should be instanceof PredicateRow');
        equal($('#' + TEST_CONTAINER_ID).children('.property-row').length, 1, 'Test container should have 1 child of class property-row.');
        equal($('#' + TEST_CONTAINER_ID).children('.property-row').attr('id'), this.fixture._idPrefix + 123, 'Property row id should be ' + this.fixture._idPrefix + 123);
        equal(this.fixture.numberOfWidgets(), 0, 'Should have no widgets.');
    });

    test('addWidget', 4, function() {
        equal(this.fixture.numberOfWidgets(), 0, 'Should have no widgets.');
        var id = this.fixture.addWidget(statement1, _Widget);
        equal(this.fixture.numberOfWidgets(), 1, 'Should have 1 widget.');
        equal($('#' + TEST_CONTAINER_ID).children('.property-row').children('fieldset').children('.widget').length, 1, 'HTML for one widget should be in DOM.');
        equal($('#' + TEST_CONTAINER_ID).children('.property-row').children('fieldset').children('#' + id).attr('id'), id, 'Widget CSS id should be the id returned.');
    });
    
    test('getWidget', 0, function() {
    });
    
    test('getWidgetForID', 0, function() {
    });
    
    test('numberOfWidgets', 0, function() {
    });
    
    test('removeWidget', 0, function() {
    });
    
    test('removeWidgetForID', 5, function() {
        equal(this.fixture.numberOfWidgets(), 0, 'Should have no widgets.');
        var id = this.fixture.addWidget(statement1, _Widget);
        equal(this.fixture.numberOfWidgets(), 1, 'Should have 1 widget.');        
        this.fixture.removeWidgetForID(id);
              
        equal(this.fixture.getWidgetForID(id).removeCalled, true, 'onRemove should have been called for widget.');
        
        // test for issue 1
        // http://code.google.com/p/rdfauthor/issues/detail?id=1
        // alert($('#' + this.cssID()).children('fieldset').children('.widget').length);
        equal($('#' + this.fixture.cssID()).children('fieldset').children('.widget').length, 0, 'There sould be 0 widgets visible.');
        equal($('#' + this.fixture.cssID()).css('display'), 'none', 'Should be hidden if all widgets have been removed.');
    });
    
    test('onCancel', 3, function() {
        equal(this.fixture.numberOfWidgets(), 0, 'Should have no widgets.');
        var id = this.fixture.addWidget(statement1, _Widget);
        equal(this.fixture.numberOfWidgets(), 1, 'Should have 1 widget.');
        this.fixture.onCancel();
        equal(this.fixture.getWidgetForID(id).cancelCalled, true, 'onCancel should have been called for widget.');
    });
    
    test('onSubmit', 3, function() {
        equal(this.fixture.numberOfWidgets(), 0, 'Should have no widgets.');
        var id = this.fixture.addWidget(statement1, _Widget);
        equal(this.fixture.numberOfWidgets(), 1, 'Should have 1 widget.');
        this.fixture.onSubmit();
        equal(this.fixture.getWidgetForID(id).submitCalled, true, 'onSubmit should have been called for widget.');
    });
});