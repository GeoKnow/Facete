/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>
 */

/*
 * RDFauthor widget template.
 * Use this as a base for your own widget implementations.
 * All methods not uncommented are mandatory to be implemented.
 */
RDFauthor.registerWidget({
    /*
    // Uncomment this to execute code when your widget is instantiated,
    // e.g. load scripts/stylesheets etc.
    init: function () {},
    */

    /*
    // Uncomment this to execute code when you widget's markup is ready in the DOM,
    // e.g. load jQuery plug-ins, attach event handlers etc.
    ready: function () {},
    */

    // Return your jQuery-wrapped main input element here
    element: function () {
        return $('#' + this.ID);
    },

    /*
    // Uncomment to give focus to your widget.
    // The default implementation will give focus to the first match in the
    // return value of element().
    focus: function () {},
    */

    // Return your widget's markup code here using this.ID for an
    // identifier. See widget.prototype.js for other variables/methods
    // you can use.
    markup: function () {
        return '<span id="' + this.ID + '">aLiDa</span>';
    },

    /*
    // Uncomment to mark the current triple for removal here.
    // Actual databank writes should be done in submit().
    // Removing the widget markup from the DOM is done by RDFauthor.
    // The default implementation sets
    //   this.removeOnSubmit = true;
    remove: function () {

    },
    */

    // Commit changes to databank here (add/remove/change).
    // You can retrieve the databank containing the graph your widget's
    // triple belongs to from RDFauthor by calling
    //   var databank = RDFauthor.databankForGraph(this.statement.graphURI());
    submit: function () {
        return true;
    }
}, [{
    // Hooks to register your widget for
        // Uncomment this if your widgets binds to the property hook,
        // and denote the type of property (ObjectProperty or DatatypeProperty).
        // For other hooks this can be inferred automatically.
        type: 'ObjectProperty',
        // Name of first hook
        name: 'property',
        // Array of values for first hook
        values: ['http://www.w3.org/1999/02/22-rdf-syntax-ns#type']
    }/* add more hooks here */]
);
