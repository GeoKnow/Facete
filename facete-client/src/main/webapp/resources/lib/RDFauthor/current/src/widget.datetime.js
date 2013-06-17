/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>
 *         Clemens Hoffmann <cannelony@gmail.com>
 */
RDFauthor.registerWidget({
    // Uncomment this to execute code when your widget is instantiated,
    // e.g. load scripts/stylesheets etc.
    init: function () {
        this.datatypes = {
            date: 'http://www.w3.org/2001/XMLSchema#date',
            dateTime: 'http://www.w3.org/2001/XMLSchema#dateTime',
            time: 'http://www.w3.org/2001/XMLSchema#time'
        };
        this.datatype;
        this._datetimepickerLoaded = false;
        this._domRdy = false;
        var self = this;

        if (undefined === jQuery.ui.datepicker) {
            RDFauthor.loadScript(RDFAUTHOR_BASE + 'libraries/jquery.ui.js');
            // RDFauthor.loadStylesheet(RDFAUTHOR_BASE + 'libraries/jquery.ui.css');
        }
        RDFauthor.loadScript(RDFAUTHOR_BASE + 'libraries/jquery-ui-timepicker-addon.js', function () {
            self._datetimepickerLoaded = true;
            self._init();
        });
        RDFauthor.loadStylesheet(RDFAUTHOR_BASE + 'libraries/jquery-ui-timepicker-addon.css');
    },

    // Uncomment this to execute code when you widget's markup is ready in the DOM,
    // e.g. load jQuery plug-ins, attach event handlers etc.
    ready: function () {
        var self = this;
        self._domRdy = true;
        self._init();
        $('.rdfauthor-view-content').scroll(function() {
            $('#ui-datepicker-div').fadeOut();
        });
    },

    // return your jQuery-wrapped main input element here
    element: function () {
        return $('#date-edit-' + this.ID);
    },

    /*
    // Uncomment to give focus to your widget.
    // The default implementation will give focus to the first match in the
    // return value of element().
    focus: function () {},
    */

    // return your widget's markup code here
    markup: function () {
        var markup =
            '<div class="rdfauthor-container" style="width:100%">\
                <input type="text" style="width:50%" class="text" id="date-edit-' + this.ID + '" value="'
                    + (this.statement.hasObject() ? this.statement.objectValue() : '') + '"/>\
            </div>';

        return markup;
    },

    // commit changes here (add/remove/change)
    submit: function () {
        if (this.shouldProcessSubmit()) {
            // get databank
            var databank = RDFauthor.databankForGraph(this.statement.graphURI());

            var somethingChanged = (
                this.statement.hasObject() &&
                    this.statement.objectValue() !== this.value()
            );

            var isNew = !this.statement.hasObject() && (null !== this.value());

            if (somethingChanged || this.removeOnSubmit) {
                var rdfqTriple = this.statement.asRdfQueryTriple();
                if (rdfqTriple) {
                    databank.remove(rdfqTriple);
                }
            }

            if ((null !== this.value()) && !this.removeOnSubmit && (somethingChanged || isNew)) {
                try {
                    var newStatement = this.statement.copyWithObject({
                        value: this.value(),
                        options: {datatype: this.datatype},
                        type: 'literal'
                    });
                    databank.add(newStatement.asRdfQueryTriple());
                } catch (e) {
                    var msg = e.message ? e.message : e;
                    alert('Could not save literal for the following reason: \n' + msg);
                    return false;
                }
            }
        }

        return true;
    },

    shouldProcessSubmit: function () {
        var t1 = !this.statement.hasObject();
        var t2 = null === this.value();
        var t3 = this.removeOnSubmit;

        return (!(t1 && t2) || t3);
    },

    value: function () {
        var value = this.element().val();
        if (String(value).length > 0) {
            return value;
        }

        return null;
    },
    _init: function () {
        var self = this;
        if (self._datetimepickerLoaded && self._domRdy) {
            var datatype = this.statement.objectDatatype();
            switch(datatype) {
                case self.datatypes['date']:
                        self.datatype = self.datatypes['date'];
                        this.element().datepicker({
                            dateFormat: $.datepicker.ISO_8601,
                            // showOn: 'both',
                            firstDay: 1
                        });
                        $('#ui-datepicker-div').css('z-index', 10000);
                    break;
                case self.datatypes['dateTime']:
                        var timezone = this.element().val().substr(19,25);
                        if ( timezone == "Z" ) { timezone = "+00:00" };
                        self.datatype = self.datatypes['dateTime'];
                        this.element().datetimepicker({
                            separator: 'T',
                            dateFormat: $.datepicker.ISO_8601,
                            showSecond: true,
                            timeFormat: 'hh:mm:ss',
                            showTimezone: true,
                            timezone: timezone,
                            firstDay: 1
                        });
                    break;
                case self.datatypes['time']:
                        var timezone = this.element().val().substr(8,14);
                        if ( timezone == "Z" ) { timezone = "+00:00" };
                        self.datatype = self.datatypes['time'];
                        this.element().timepicker({
                            showSecond: true,
                            timeFormat: 'hh:mm:ss',
                            showTimezone: true,
                            timezone: timezone
                        });
                    break;
                default: alert('no matched datatype');
                    break;
            }
        }
    }
},  //load hook settings from rdfauthor.config.js
    __config['widgets']['datetime']['hook']
);
