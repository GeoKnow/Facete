/**
 * Marks the required interface for a widget.
 * Use this object as the prototype for your custom widget by setting
 * <code>MyWidget.prototype = Widget;</code> or make sure you implement all
 * the functions yourself.
 */
var Widget = {
    animate: false,
    options: {},
    _maxWidth: 481,
    predicateRow: null,
    removeOnSubmit: false,

    /**
     * Returns the available space the widget can use in pixels.
     */
    availableWidth: function () {
        return this._maxWidth;
    },

    /**
     * This function gets called by the framework once a widget is used.
     */
    init: function () {

    },

    /**
     * This function gets called by the framework once a widget is ready.
     * You can rely on the widget's markup to already be in the DOM.
     */
    ready: function () {

    },

    /**
     * Returns the widget's markup code.
     * @return {String}
     */
    markup: function () {
        return '<span>Widget not correctly implemented.</span>';
    },

    /**
     * Gives focus to the widget's main input element.
     */
    focus: function () {
        var el = this.element();
        if (el && el.length > 0) {
            if (el.get(0).tagName.toLowerCase() == 'input' || el.get(0).tagName.toLowerCase() == 'textarea') {
                el.focus();
            }
        }
    },

    /**
     * Is called for every active widget if the user cancels the editing process.
     */
    cancel: function () {

    },

    /**
     * Is called if the user removes a widget indicating the aim to delete the
     * statement this widget represents.
     */
    remove: function () {
        this.removeOnSubmit = true;
    },

    /**
     * Called for every active widget when the user commits his editing by clicking 'Submit'.
     * Widgets should write their changes to the databank obtained by <code>this.databank();</code>
     * and return true on succes or false if the submitting process should be suspended.
     * Suspending a submit usually gives the user a change to revise some erroneous input.
     * @return {Boolean}
     */
    submit: function () {

    },

    /**
     * Returns a reference to the widget's jQuery-wrapped main input element.
     * If the widget has more than one main input elements, a reference to the first
     * one in DOM order should be returned.
     */
    element: function () {
        return null;
    }
};
