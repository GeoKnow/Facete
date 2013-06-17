$(document).ready(function() {    
    module('rdfauthor.view', {
        setup: function () {
            this.fixtureID = 'rdfAuthorViewTest';
            this.fixtureTitle = 'View Test Title';
            this.fixtureContentContainerClass = 'rdfAuthorViewTestContentContainer';
            this.fixture = new View({
                id: this.fixtureID, 
                container: $('#' + TEST_CONTAINER_ID), 
                title: this.fixtureTitle, 
                contentContainerClass: this.fixtureContentContainerClass
            });
        }, 
        teardown: function () {
            this.fixture = null;
            // $('#' + TEST_CONTAINER_ID).empty();
        }
    });
    
    test('init', 4, function() {
        ok(this.fixture instanceof View, 'Should be instance of View.');
        equal($('#' + TEST_CONTAINER_ID).children('#' + this.fixtureID).length, 1, 'Container should have 1 child with view\'s id.');
        ok($('#' + TEST_CONTAINER_ID).children('#' + this.fixtureID).hasClass('window'), 'View should have class window.');
        equal($('#' + TEST_CONTAINER_ID).children('#' + this.fixtureID).children('.title').html(), this.fixtureTitle, 
              'View window should have the title that was set on instantiation.');
    });
    
    test('addWidget', 3, function() {
        this.fixture.addWidget(statement1, new _Widget);
        equal(this.fixture._subjectCount, 1, 'Should have 1 subject.');
        this.fixture.addWidget(statement2, new _Widget);
        equal(this.fixture._subjectCount, 2, 'Should have 2 subjects.');
        this.fixture.addWidget(statement1, new _Widget);
        equal(this.fixture._subjectCount, 2, 'Should have 2 subjects.');
    });
    
    test('getContentContainer', 1, function() {
        equal(this.fixture.getContentContainer().get(0), 
            $('#' + TEST_CONTAINER_ID).children('#' + this.fixtureID).children('.' + this.fixtureContentContainerClass).get(0), 
            'Returned DOM element should match container set on instantiation.');
    });
    
    test('getElement', 1, function() {
        // ok(this.fixture.getElement() instanceof HTMLElement, 'Element returned should be an instance of HTMLElement.');
        equal($(this.fixture.getElement()).attr('id'), 'rdfAuthorViewTest', 'Should have the id given on initialization.');
    });
    
    test('getSubjectGroup', 2, function() {
        this.fixture.addWidget(statement1, new _Widget);
        equal(this.fixture._subjectCount, 1, 'Should have 1 subject.');
        ok(this.fixture.getSubjectGroup('http://example.com/subject1') instanceof SubjectGroup, 
            'Returned subject group should be an instance of SubjectGroup.');
    });
    
    test('cssID', 1, function() {
        equal(this.fixture.cssID(), this.fixtureID, 'Should return CSS id passed on initialization.');
    });
    
    test('numberOfSubjects', 4, function() {
        equal(this.fixture.numberOfSubjects(), 0, 'Should have 0 subjects.');
        this.fixture.addWidget(statement1, new _Widget);
        equal(this.fixture.numberOfSubjects(), 1, 'Should have 1 subject.');
        this.fixture.addWidget(statement2, new _Widget);
        equal(this.fixture.numberOfSubjects(), 2, 'Should have 2 subjects.');
        this.fixture.addWidget(statement1, new _Widget);
        equal(this.fixture.numberOfSubjects(), 2, 'Should still have 2 subjects.');
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