/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>
 */
RDFauthor.registerWidget({
    init: function () {
        this.disclosureID = 'disclosure-' + RDFauthor.nextID();
        this.languages    = RDFauthor.literalLanguages();
        this.datatypes    = RDFauthor.literalDatatypes();
        this.bool         = "http://www.w3.org/2001/XMLSchema#boolean";
        this.integer      = "http://www.w3.org/2001/XMLSchema#integer";
        this.namespaces   = RDFauthor.namespaces();

        this._domRdy      = false;
        this._shiftenter  = false;
        this._elastic     = false;
        this.languages.unshift('');
        
        var self = this;

        // load shiftenter plugin
        RDFauthor.loadScript(RDFAUTHOR_BASE + 'libraries/jquery.shiftenter.js', function () {
            self._shiftenter = true;
            self._init();

        });

        // load shiftenter stylesheet
        RDFauthor.loadStylesheet(RDFAUTHOR_BASE + 'libraries/jquery.shiftenter.css');

        // load elastic plugin
        RDFauthor.loadScript(RDFAUTHOR_BASE + 'libraries/jquery.elastic.js', function () {
            self._elastic = true;
            self._init();
        });

        // modify Safari input behaviour (CSS3)
        if ($.browser.webkit) {
            RDFauthor.loadStylesheet(RDFAUTHOR_BASE + 'src/widget.literal.css');
        }
    },

    ready: function () {
        var widget = this;
        // disclosure button
        jQuery('#' + widget.disclosureID).click(function () {
            var close = $(this).hasClass('open') ? true : false;

            // update UI accordingly
            var button = this;
            if (close) {
                if (this.animate) {
                    $('.' + widget.disclosureID).fadeIn(250, function() {
                        $(button).removeClass('open').addClass('closed');
                    });
                } else {
                    $('.' + widget.disclosureID).show();
                    $(button).removeClass('open').addClass('closed');
                }
            } else {
                if (this.animate) {
                    $('.' + widget.disclosureID).fadeOut(250, function() {
                        $(button).removeClass('cosed').addClass('open');
                    });
                } else {
                    $('.' + widget.disclosureID).hide();
                    $(button).removeClass('cosed').addClass('open');
                }
            }
        });

        var typeb = this.bool;
        $('.literal-datatype select').change(function(){
            var selected = $(this).find('option:selected').text();
            if( selected == typeb ) {
                $(this).parent().parent().parent().parent().find('.boolean').show();
                $(this).parent().parent().parent().parent().find('.notboolean').hide();
            } else {
                $(this).parent().parent().parent().parent().find('.boolean').hide();
                $(this).parent().parent().parent().parent().find('.notboolean').show();
            }
        });

        $('.literal-value .radio').click(function() {
            var textarea = $(this).parent().parent().parent().find('textarea');
            if( $(this).val() == 'true' ) {
                textarea.val('true');
            } else if ( $(this).val() == 'false' ) {
                textarea.val('false');
            }
        });
        // literal options
        $('.literal-type .radio').click(function() {
            var textarea = $(this).parent().parent().parent().find('textarea');
            if ( (textarea.val() != 'true' ) && (textarea.val() != 'false') ) {
                $(this).data('val',textarea.val());
            }
            var jDatatypeSelect = $('#' + $(this).attr('name').replace('literal-type', 'literal-datatype')).eq(0);
            var jLangSelect     = $('#' + $(this).attr('name').replace('literal-type', 'literal-lang')).eq(0);

            if ($(this).val() == 'plain') {
                textarea.attr('readonly','');
                if(textarea.val() == 'true' || textarea.val() == 'false'){
                    textarea.val('');
                }
                $('.notboolean').show();
                $('.boolean').hide();
                textarea.val($(this).data('val'));
                jDatatypeSelect.closest('div').hide();
                jLangSelect.closest('div').show();
                // clear datatype
                jDatatypeSelect.val('');
            } else if ($(this).val() == 'typed') {
                textarea.attr('readonly','');
                if(textarea.val() == 'true' || textarea.val() == 'false'){
                    textarea.val('');
                }
                $('.notboolean').show();
                $('.boolean').hide();
                textarea.val($(this).data('val'));
                jDatatypeSelect.closest('div').show();
                jLangSelect.closest('div').hide();
                // clear lang
                jLangSelect.val('');
            } else if ( ( $(this).val() == 'true' ) || ( $(this).val() == 'false' ) ) {
                textarea.attr('readonly','true');
                textarea.val($(this).val());
                $('.boolean').show();
                $('.notboolean').hide();
                jDatatypeSelect.closest('div').hide();
                jLangSelect.closest('div').hide();
                jLangSelect.val('');
                jDatatypeSelect.val('');
            }
        });

        this._domRdy = true;
        this._init();
    },

    valueClass: function () {
        var length = this.statement.hasObject() ? this.statement.objectValue().length : 0;
        var cls;
        switch (true) {
            case length >= 52:
                cls = 'literal-value literal-value-large';
                break;
            case length >= 26:
                cls = 'literal-value literal-value-medium';
                break;
            default:
                cls =  'literal-value literal-value-short';
        }

        return cls;
    },

    isLarge: function () {
        if (this.statement.hasObject()) {
            var objectValue = this.statement.objectValue();
            if (objectValue.search) {
                return ((objectValue.length >= 52) || 0 <= objectValue.search(/\n/));
            }
        }

        return false;
    },

    isMedium: function () {
        if (this.statement.hasObject()) {
            return (this.statement.objectValue().length >= 20);
        }

        return false;
    },

    makeOptionString: function(options, selected, replaceNS) {
        replaceNS = replaceNS || false;

        var optionString = '';
        for (var i = 0; i < options.length; i++) {
            var display = options[i];
            if (true) {
                for (var s in this.namespaces) {
                    if (options[i].match(this.namespaces[s])) {
                        display = options[i].replace(this.namespaces[s], s + ':');
                        break;
                    }
                }
            }

            var current = options[i] == selected;
            if (current) {
                // TODO: do something
            }

            // Firefox hack
            if (display == '') {
                display = '[none]';
            }

            optionString += '<option value="' + options[i] + '"' + (current ? 'selected="selected"' : '') + '>' + display + '</option>';
        }

        return optionString;
    },

    element: function () {
        return jQuery('#literal-value-' + this.ID);
    },

    markup: function () {
        var areaConfig = {
            rows: (this.isLarge() ? '3' : '1'),
            buttonClass: /*(this.isLarge()) ? 'disclosure-button-horizontal' :*/ 'disclosure-button-vertical',
            containerClass: this.valueClass()
        }
        var readonly = '';
        if (this.statement.objectValue() == 'true' || this.statement.objectValue() == 'false') {
            readonly = 'readonly="true"';
        }

        var isBoolean = this.statement.objectDatatype() == this.bool ? true : false;
        var areaMarkup = '\
            <div class="rdfauthor-container ' + areaConfig.containerClass + '" style="width:100%">\
                <div class="notboolean" style="' + ( isBoolean ? 'display:none;' : 'display:block;' ) + '">\
                <textarea class="width99" rows="' + String(areaConfig.rows) + '" cols="20" id="literal-value-' +
                    this.ID + '">' + (this.statement.hasObject() ? this.statement.objectValue() : '') + '</textarea>\
                </div>\
                <div class="boolean" style="' + ( isBoolean ? 'display:block;' : 'display:none;' ) + '">\
                    <label><input type="radio" class="radio" name="literal-type-'+this.ID+'-2"' + ( this.statement.objectDatatype() == this.bool && this.statement.objectValue() == 'true' ? 'checked="checked"' : '' ) + ' value="true" />True</label>\
                    <label><input type="radio" class="radio" name="literal-type-'+this.ID+'-2"' + ( this.statement.objectDatatype() == this.bool && this.statement.objectValue() == 'false' ? 'checked="checked"' : '' ) + ' value="false" />False</label>\
                </div>\
            </div>\
            <div class="rdfauthor-container util" style="clear:left">\
                <a class="disclosure-button ' + areaConfig.buttonClass + ' open" id="' + this.disclosureID
                        + '" title="Toggle details disclosure"></a>\
            </div>';

        var markup = '\
            ' + areaMarkup + '\
            <div class="rdfauthor-container literal-type util ' + this.disclosureID + '" style="display:none">\
                <label><input type="radio" class="radio" name="literal-type-' + this.ID + '"'
                        + (this.statement.objectDatatype() ? '' : ' checked="checked"') + ' value="plain" />Plain</label>\
                <label><input type="radio" class="radio" name="literal-type-' + this.ID + '"'
                        + (this.statement.objectDatatype() ? ' checked="checked"' : '') + ' value="typed" />Typed</label>\
            </div>\
            <div class="rdfauthor-container util ' + this.disclosureID + '" style="display:none">\
                <div class="literal-lang"' + (this.statement.objectDatatype() ? ' style="display:none"' : '') + '>\
                    <label for="literal-lang-' + this.ID + '">Language:\
                        <select id="literal-lang-' + this.ID + '" name="literal-lang-' + this.ID + '">\
                            ' + this.makeOptionString(this.languages, this.statement.objectLang()) + '\
                        </select>\
                    </label>\
                </div>\
                <div class="literal-datatype"' + (this.statement.objectDatatype() ? '' : ' style="display:none"') + '>\
                    <label>Datatype:\
                        <select id="literal-datatype-' + this.ID + '" name="literal-datatype-' + this.ID + '">\
                            ' + this.makeOptionString(this.datatypes, this.statement.objectDatatype(), true) + '\
                        </select>\
                    </label>\
                </div>\
            </div>';

        return markup;
    },

    submit: function () {
        if (this.shouldProcessSubmit()) {
            // get databank
            var databank = RDFauthor.databankForGraph(this.statement.graphURI());

            /*
            var v = this.value();
            // */

            var somethingChanged = (
                this.statement.hasObject() && (
                    // existing statement should have been edited
                    this.statement.objectValue() !== this.value() ||
                    this.statement.objectLang() !== this.lang() ||
                    this.statement.objectDatatype() !== this.datatype()
                )
            );

            // new statement must not be empty
            var isNew = !this.statement.hasObject() && (null !== this.value());

            if (somethingChanged || this.removeOnSubmit) {
                var rdfqTriple = this.statement.asRdfQueryTriple();
                if (rdfqTriple) {
                    databank.remove(rdfqTriple);
                }
            }
            if ((null !== this.value()) && !this.removeOnSubmit && (somethingChanged || isNew)) {
                try {
                    var objectOptions = {};
                    if (null !== this.lang()) {
                        objectOptions.lang = this.lang();
                    } else if (null !== this.datatype()) {
                        objectOptions.datatype = this.datatype();
                    }
                    var newStatement = this.statement.copyWithObject({
                        value: this.value(),
                        options: objectOptions,
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

    type: function () {
        var type = $('input[name=literal-type-' + this.ID + ']:checked').eq(0).val();

        if ('' !== type) {
            return type;
        }

        return null;
    },

    lang: function () {
        var lang = $('#literal-lang-' + this.ID + ' option:selected').eq(0).val();
        if ((this.type() == 'plain') && ('' !== lang)) {
            return lang;
        }

        return null;
    },

    datatype: function () {
        var datatype = $('#literal-datatype-' + this.ID + ' option:selected').eq(0).val();
        if ((this.type() == 'typed') && ('' !== datatype)) {
            return datatype;
        }

        return null;
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
        if (self._domRdy && self._shiftenter && self._elastic) {
            // bind plugins
            self.element()
                .elastic()
                .shiftenter({
                    hint: 'Shift+Enter for line break - Enter for submitting changes',
                    onReturn: function() {
                        RDFauthor.commit();
                    }
                });
        }
    }
}, {
        name: '__LITERAL__',
        callback: function () {

            // register new datatype sysont:Markdown
            $.typedValue.types['http://ns.ontowiki.net/SysOnt/Markdown'] = {
                 regex: /.*/,
                 strip: false,
                 /** @ignore */
                 value: function (v, options) {
                   var opts = $.extend({}, $.typedValue.defaults, options);
                   return v;
                 }
            };
            // register new datatype sysont:HTML
            $.typedValue.types['http://ns.ontowiki.net/SysOnt/HTML'] = {
                 regex: /.*/,
                 strip: false,
                 /** @ignore */
                 value: function (v, options) {
                   var opts = $.extend({}, $.typedValue.defaults, options);
                   return v;
                 }
            };
            // register new datatype xsd:time
            $.typedValue.types['http://www.w3.org/2001/XMLSchema#time'] = {
                regex: /^.*$/,
                strip: true,
                /** @ignore */
                value: function (v, options) {
                  var opts = $.extend({}, $.typedValue.defaults, options);
                  return v;
                }
            };

        }
    }
);
