/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>
 */

/*
 * RDFauthor widget template.
 * Use this as a base for your own widget implementations.
 */
RDFauthor.registerWidget({
    /*
    // Uncomment this to execute code when your widget is instantiated,
    // e.g. load scripts/stylesheets etc.
    init: function () {},
    */

    // Uncomment this to execute code when you widget's markup is ready in the DOM,
    // e.g. load jQuery plug-ins, attach event handlers etc.
    ready: function () {
        var self   = this;
        var cssRed = 'rgb(255, 187, 187)';
        this.element().keyup(function (event) {
            if (!self.validateLabel(self.element().val())) {
                var currentColour = self.element().css('background-color');
                if (currentColour != cssRed) {
                    self.element().data('previousColour', self.element().css('background-color'));
                }
                self.element().css('background-color', cssRed);
            } else {
                self.element().css('background-color', self.element().data('previousColour'));
            }
        });
        if(this.element().val() == "null" ) {
            this.element().val('');
        }
    },

    // return your jQuery-wrapped main input element here
    element: function () {
        return $('#phone-value-' + this.ID);
    },

    /*
    // Uncomment to give focus to your widget.
    // The default implementation will give focus to the first match in the
    // return value of element().
    focus: function () {},
    */

    // return your widget's markup code here
    markup: function () {
        var markup = '\
            <div class="rdfauthor-container resource-value" style="width:100%">\
                <input type="text" id="phone-value-' + this.ID + '" class="text" size="20"\
                 value="' + this.labelForURI(this.statement.objectValue()) + '"\
                 style="width:51%;\
                        box-sizing: border-box;\
                        -moz-box-sizing: border-box;\
                        -webkit-box-sizing: border-box;\
                        background-position: 1% center;\
                        background-image:url(\'' + RDFAUTHOR_BASE + 'img/phone.png\');\
                        background-repeat:no-repeat;\
                        padding-left:20px" />\
            </div>';

        return markup;
    },

    // commit changes here (add/remove/change)
    submit: function () {
        if (this.shouldProcessSubmit()) {
            // get databank
            var databank   = RDFauthor.databankForGraph(this.statement.graphURI());
            var hasChanged = (
                this.statement.hasObject()
                && this.statement.objectValue() !== this.value()
            );

            if (hasChanged || this.removeOnSubmit) {
                var rdfqTriple = this.statement.asRdfQueryTriple();
                if (rdfqTriple) {
                    databank.remove(rdfqTriple);
                }
            }

            if (!this.removeOnSubmit && this.value()) {
                try {
                    var newStatement = this.statement.copyWithObject({
                        value: '<' + this.value() + '>',
                        type: 'uri'
                    });
                    databank.add(newStatement.asRdfQueryTriple());
                } catch (e) {
                    var msg = e.message ? e.message : e;
                    alert('Could not save resource for the following reason: \n' + msg);
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

    value: function() {
        var typedValue = this.element().val();
        if ('' !== typedValue) {
            return this.URIForLabel(typedValue);
        }

        return null;
    },

    labelForURI: function (URI) {
        var label = String(URI)
            .replace(/tel:/g, '')   // remove the tel: prefix
            .replace(/-/g, ' ');    // create spaces

        return label;
    },

    validateLabel: function (label) {
        var phoneRE = new RegExp(
            /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,5})|(\(?\d{2,6}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/
        );

        return phoneRE.test(label);
    },

    URIForLabel: function (label) {
        var URI = String(label)
            .replace(/\ /g, '-');   // create "-" instead of spaces
        return 'tel:' + URI;
    }
},  //load hook settings from rdfauthor.config.js
    __config['widgets']['tel']['hook']
);
