/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>
 */

function Selector(graphURI, subjectURI, options) {
    this._options = $.extend({
        container: 'body',
        selectionCallback: null,
        animationTime: 250,
        ID: 'rdfauthor-selector-' + RDFauthor.nextID(),
        cssClass: 'rdfauthor-selector'
    }, options);

    var widgetOptions = {
        maxResults: 5,
        local: true,
        sparql: true,
        sindice: false,
        uri: true,
        filterRange: false,
        filterDomain: true,
        filterProperties: true,
        selectionCallback: this._options.selectionCallback,
        selectOnReturn: true
    };

    // FIXME: title hack
    var statement = new Statement({subject: '<' + subjectURI + '>'}, {graph: graphURI, title: ' '});
    this._widget = RDFauthor.getWidgetForHook('__PROPERTY__', null, statement, widgetOptions);
    this._widget.init();
}

Selector.prototype = {
    cssID: function () {
        return '#' + this._options.ID;
    },

    markup: function () {
       return '<div id="' + this._options.ID + '" class="' + this._options.cssClass + '">' + this._widget.markup() + '</div>';
    },

    presentInContainer: function (animated) {
        // append if necessary
        if (this._options.container.find(this.cssID()).length < 1) {
            this._options.container.append(this.markup());
            this._widget.ready();
        }

        // make visisble
        jQuery(this.cssID()).show();

        // scroll the container to the selector's top
        var offset = jQuery(this.cssID()).offset();
        var selectorTop = jQuery(this.cssID()).offset().top;
        this._options.container.animate(
            {scrollTop: (selectorTop/* - containerTop*/)},
            animated ? this._options.animationTime : 0);

        // give focus to widget
        this._widget.focus();
    },

    dismiss: function (animated) {
        var self = this;
        if (this._options.container.find(this.cssID()).length > 0) {
            if (animated) {
                jQuery(this.cssID()).slideUp(this._options.animationTime, function () {
                    jQuery(self.cssID()).remove();
                });
            } else {
                jQuery(this.cssID()).hide();
                jQuery(this.cssID()).remove();
            }
        }
    },

    selection: function () {
        return {
            uri: this._widget.selectedResource,
            label: this.widget.selectedResourcelabel
        };
    }
}
