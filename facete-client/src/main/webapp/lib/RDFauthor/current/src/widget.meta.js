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
    // Uncomment this to execute code when your widget is instantiated,
    // e.g. load scripts/stylesheets etc.
    init: function () {
        this.resourceWidget = RDFauthor.getWidgetForHook('__OBJECT__', null, this.statement);
        this.literalWidget  = RDFauthor.getWidgetForHook('__LITERAL__', null, this.statement);

        this.resourceWidget.init();
        this.literalWidget.init();

        if (this.statement.hasObject() && this.statement.objectType() == 'uri') {
            this.options.active = 'resource';
        } else {
            this.options.active = 'literal';
        }
    },

    // Uncomment this to execute code when you widget's markup is ready in the DOM,
    // e.g. load jQuery plug-ins, attach event handlers etc.
    ready: function () {
        this.resourceWidget.ready();
        this.literalWidget.ready();

        var self = this;

        jQuery('#meta-select-' + this.ID + ' .meta-type .radio').click(function () {
            var jResourceDiv = $(this).closest('.meta-select').children('.meta-resource');
            var jLiteralDiv  = $(this).closest('.meta-select').children('.meta-literal');

            if ($(this).val() == 'resource') {
                jResourceDiv.show();
                jLiteralDiv.hide();

                var val;
                if (typeof self.literalWidget.value == 'function') {
                    val = self.literalWidget.value();
                } else {
                    val = jQuery(self.literalWidget.element()).val();
                }
                jQuery(self.resourceWidget.element()).val(val);
            } else {
                jResourceDiv.hide();
                jLiteralDiv.show();

                var val;
                if (typeof self.resourceWidget.value == 'function') {
                    val = self.resourceWidget.value();
                } else {
                    val = jQuery(self.resourceWidget.element()).val();
                }
                jQuery(self.literalWidget.element()).val(val);
            }
        });
    },

    // return your jQuery-wrapped main input element here
    element: function () {
        return this.activeWidget().element();
    },

    // return your widget's markup code here
    markup: function () {
        var active = this.activeWidget() == this.literalWidget
                   ? 'literal'
                   : 'resource';

        var markup = '\
            <div class="meta-select" id="meta-select-' + this.ID + '">\
                <div class="inline-container meta-type util">\
                    <label><input type="radio" class="radio" '
                        + (active == 'resource' ? 'checked="checked"' : '')
                        + ' name="meta-type-' + this.ID + '" id="meta-rselect-' + this.ID + '" value="resource" />Resource</label>\
                    <label><input type="radio" class="radio" '
                        + (active == 'literal' ? 'checked="checked"' : '')
                        + ' name="meta-type-' + this.ID + '" id="meta-lselect-' + this.ID + '" value="literal" />Literal</label>\
                </div>\
                <hr style="clear:left; height:0; border:none" />\
                <div class="meta-resource" id="meta-resource-' + this.ID + '"' + (active == 'resource' ? '' : 'style="display:none"') + '>\
                    ' + this.resourceWidget.markup() + '\
                </div>\
                <div class="meta-literal" id="meta-literal-' + this.ID + '"' + (active == 'literal' ? '' : 'style="display:none"') + '>\
                    ' + this.literalWidget.markup() + '\
                </div>\
            </div>';

        return markup;
    },

    // perform widget and triple removal here
    remove: function () {
        return this.activeWidget().remove();
    },

    // commit changes here (add/remove/change)
    submit: function () {
        return this.activeWidget().submit();
    },

    activeWidget: function () {
        var activeWidget = null;

        if ($('input:radio[name=meta-type-' + this.ID + ']:checked').length) {
            var value = $('input:radio[name=meta-type-' + this.ID + ']:checked').val();

            if (value == 'literal') {
                activeWidget = this.literalWidget;
            } else {
                activeWidget = this.resourceWidget;
            }
        } else {
            activeWidget = this.options.active == 'literal' ? this.literalWidget : this.resourceWidget;
        }

        return activeWidget;
    }
}, [{
        name: '__DEFAULT__'
    }]
);
