// dummy RDFauthor
// RDFauthor = {
//     dummy: true, 
//     nextID: function() {return Math.round(Math.random() * 1000)}, 
//     getWidgetForHook: function () {return new _Widget()}, 
//     getWidgetForStatement: function () {return new _Widget()}, 
//     defaultSubjectURI: function () {return 'http://example.com/subject1'}, 
//     defaultGraphURI: function () {return 'http://example.com/'}
// }

// dummy statements
var statement1 = {
    graphURI: function () {return 'http://example.com/'}, 
    subjectURI: function () {return 'http://example.com/subject1'}, 
    predicateURI: function () {return 'http://example.com/predicate1'}, 
    predicateLabel: function () {return 'Predicate 1'}, 
    hasObject: function () {return false}, 
    objectDatatype: function () {return null}, 
    objectLang: function () {return null}, 
    objectType: function () {return 'uri'}
};

var statement2 = {
    graphURI: function () {return 'http://ttt.com/'}, 
    subjectURI: function () {return 'http://ttt.com/subject1'}, 
    predicateURI: function () {return 'http://ttt.com/predicate1'}, 
    predicateLabel: function () {return 'Pädikat 1'}, 
    hasObject: function () {return true}, 
    objectDatatype: function () {return null}, 
    objectLang: function () {return null}, 
    objectType: function () {return 'uri'}, 
    objectValue: function () {return 'http:://ttt.com/object1'}
};

// dummy widget
_Widget = function(s) {
    this.s = s;
    this.removeCalled = false;
    this.cancelCalled = false;
    this.submitCalled = false;
}
// dummy widget prototype
_Widget.prototype = {
    init: function () {
        // do nothing
    }, 
    ready: function () {
        // do nothing
    }, 
    markup: function () {
        return '<span>I am a widget!</span>';
    }, 
    remove: function() {
        this.removeCalled = true;
    }, 
    cancel: function() {
        this.cancelCalled = true;
    }, 
    submit: function() {
        this.submitCalled = true;
    }
};
