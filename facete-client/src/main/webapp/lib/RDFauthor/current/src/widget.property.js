/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>
 * Author: Clemens Hoffmann <cannelony@gmail.com>
 */


RDFauthor.registerWidget({
    init: function () {
        this._propertiesInUse = [];
        this._filterProperties = "search for properties or enter a custom property uri";
        this._domReady     = false;
        this._pluginLoaded = false;
        this._initialized  = false;
        this._autocomplete = null;

        this._namespaces = jQuery.extend({
            foaf: 'http://xmlns.com/foaf/0.1/',
            dc:   'http://purl.org/dc/terms/',
            owl:  'http://www.w3.org/2002/07/owl#',
            rdf:  'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
            rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
            skos: 'http://www.w3.org/2004/02/skos/core#',
            geo:  'http://www.w3.org/2003/01/geo/wgs84_pos#',
            dbp:  'http://dbpedia.org/property/',
            xsd:  'http://www.w3.org/2001/XMLSchema#',
            sioc: 'http://rdfs.org/sioc/ns#'
        }, RDFauthor.namespaces());

        /* default options */
        this._options = jQuery.extend({
            // Autocomplete options:
            minChars:           3,      /* minmum chars needed to be typed before search starts */
            delay:              1000,   /* delay in ms before search starts */
            // Callbacks
            selectionCallback:  null,   /* the function to be called when a new selection is made */
            selectOnReturn:     false   /* executes selection callback if the user hits return in the search field */
        }, this.options);

        var self = this;
        if (undefined === jQuery.ui.autocomplete) {
            RDFauthor.loadScript(RDFAUTHOR_BASE + 'libraries/jquery.ui.autocomplete.js', function () {
                self._pluginLoaded = true;
                self._init();
            });
        } else {
            self._pluginLoaded = true;
            self._init();
        }

        // jQuery UI styles
        RDFauthor.loadStylesheet(RDFAUTHOR_BASE + 'libraries/jquery.ui.autocomplete.css');

        // load stylesheets
        RDFauthor.loadStylesheet(RDFAUTHOR_BASE + 'src/widget.property.css');

        // returns the size of an object
        Object.size = function(obj) {
            var size = 0, key;
            for (key in obj) {
                size++;
            }
            return size;
        }

    },

    ready: function () {
        this._domReady = true;
        this._init();
        this.element().trigger('click');
    },

    element: function () {
        return $('#property-input-' + this.ID);
    },

    markup: function () {
            var self = this;
            var markup = '\
            <div class="rdfauthor-container resource-value">\
                <input type="hidden" id="property-input-' + this.ID + '" name="propertypicker" class="text resource-edit-input" />\
            </div>';
            var propertyPicker = '\
                <div id="propertypicker" class="window ui-draggable ui-resizable">\
                  <h1 class="title">Suggested Properties</h1>\
                  <div class="window-buttons">\
                    <div class="window-buttons-left"></div>\
                    <div class="window-buttons-right">\
                      <span class="button button-windowclose"><span>\
                    </div>\
                  </div>\
                  <div class="content" style="height: 92%">\
                    <input id="filterProperties" autocomplete="off" type="text" \
                           class="text inner-label width99" style="margin: 5px 5px 0px 0px;"/>\
                    <ul class="bullets-none separated">\
                      <li>\
                        <h1 class="propertyHeadline">\
                          <div class="has-contextmenu-area">\
                            <div class="contextmenu">\
                              <a class="item" title="These properties are currently in use at other resources of the same class(es)."><span class="item icon icon-list ui-icon ui-icon-help"></span></a>\
                            </div>\
                            <span style="display: inline-block !important;" class="ui-icon ui-icon-minus"></span>\
                            <span>In use elsewhere (<span id="suggestedInUseCount"></span>)</span>\
                          </div>\
                        </h1>\
                        <div id="suggestedInUse">\
                          <ul class="inline separated">\
                          </ul>\
                        </div>\
                      </li>\
                      <li>\
                        <h1 class="propertyHeadline">\
                          <div class="has-contextmenu-area">\
                            <div class="contextmenu">\
                              <a class="item" title="These properties are generally applicable to all resources. "><span class="item icon icon-list ui-icon ui-icon-help"></span></a>\
                            </div>\
                            <span style="display: inline-block !important;" class="ui-icon ui-icon-minus"></span>\
                            <span>General applicable (<span id="suggestedGeneralCount"></span>)</span>\
                          </div>\
                        </h1>\
                        <div id="suggestedGeneral">\
                          <ul class="inline separated">\
                          </ul>\
                        </div>\
                      </li>\
                      <!--li>\
                        <h1 class="propertyHeadline">\
                          <div class="has-contextmenu-area">\
                            <div class="contextmenu">\
                              <a class="item" title="placeholder for infotext"><span class="item icon icon-list ui-icon ui-icon-help"></span></a>\
                            </div>\
                            <span style="display: inline-block !important;" class="ui-icon ui-icon-plus"></span>\
                            <span>Applicable (<span id="suggestedApplicableCount">?</span>)</span>\
                          </div>\
                        </h1>\
                        <div id="suggestedApplicable">\
                        </div>\
                      </li-->\
                    </ul>\
                 </div>\
                </div>';
        var modalwrapper = '<div class="modal-wrapper-propertyselector"></div>';
        var spinner = '<div id="spinner-propertyselector">\
            <div class="bar1"></div>\
            <div class="bar2"></div>\
            <div class="bar3"></div>\
            <div class="bar4"></div>\
            <div class="bar5"></div>\
            <div class="bar6"></div>\
            <div class="bar7"></div>\
            <div class="bar8"></div>\
            <div class="bar9"></div>\
            <div class="bar10"></div>\
            <div class="bar11"></div>\
            <div class="bar12"></div>\
          </div>'
        if( $('#propertypicker').length == 0 ) {
            $('body').append(modalwrapper);
            $('.modal-wrapper-propertyselector').append(spinner)
                                                .append(propertyPicker);
        }

        return markup;
    },

    submit: function () {
        if (this.shouldProcessSubmit()) {
            // get databank
            var databank   = RDFauthor.databankForGraph(this.statement.graphURI());
            var hasChanged = (
                this.statement.hasObject()
                && this.statement.objectValue() !== this.value()
                && null !== this.value()
            );

            if (hasChanged || this.removeOnSubmit) {
                var rdfqTriple = this.statement.asRdfQueryTriple();
                if (rdfqTriple) {
                    databank.remove(rdfqTriple);
                }
            }

            if (!this.removeOnSubmit && this.value()) {
                var self = this;
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
        $('#propertypicker').remove();
        return true;
    },

    shouldProcessSubmit: function () {
        var t1 = !this.statement.hasObject();
        var t2 = null === this.value();
        var t3 = this.removeOnSubmit;

        return (!(t1 && t2) || t3);
    },

    value: function () {
        var typedValue = this.element().val();
        if (typedValue.length != 0) {
            return typedValue;
        }

        return null;
    },

    generateURI: function (item, prefix) {
        var lastChar = prefix.charAt(prefix.length - 1);
        if (!(lastChar == '/' || lastChar == '#')) {
            prefix += '/';
        }

        return prefix + item;
    },

    isURI: function (term) {
        // TODO: more advanced URI check
        return (/(https?:\/\/|mailto:|tel:)/.exec(term) !== null);
    },

    highlight: function (text, term) {
        var highlight = text.replace(RegExp(term, 'i'), '<em>$&</em>');
        return highlight;
    },

    localName: function (uri) {
        var s = String(uri);
        var l;
        if (s.lastIndexOf('#') > -1) {
            l = s.substr(s.lastIndexOf('#') + 1);
        } else {
            l = s.substr(s.lastIndexOf('/') + 1);
        }

        return (l !== '') ? l : s;
    },

    expandNamespace: function (prefixedName) {
        var splits = prefixedName.split(':', 2);
        if (splits.length >= 2) {
            if (splits[0] in this._namespaces) {
                return this._namespaces[splits[0]] + splits[1];
            }
        }

        return prefixedName;
    },

    _suggestions: function (callback) {
        var self = this;
        var subjectURI = self.statement.subjectURI();
        var graphURI = self.statement.graphURI();
        var prefixPattern = '\
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n';
        var selectPattern = 'DISTINCT ?resourceUri ?label\n';
        var typePattern = '<' + subjectURI + '> a ?class .\n';
        var classPattern = '?others a ?class .\n';
        var uriPattern = '?others ?resourceUri ?object .\n';
        var labelPattern = 'OPTIONAL {?resourceUri rdfs:label ?label . } .\n';
        var query = prefixPattern + 'SELECT ' + selectPattern
                                  + 'WHERE { \n'
                                  + typePattern
                                  + classPattern
                                  + uriPattern
                                  + labelPattern
                                  + '}';
        var everywhereInUse = {};
        // request properties in use
        RDFauthor.queryGraph(graphURI, query, {
            callbackSuccess: function(data) {
                var results = data.results.bindings;
                for (var i in results) {
                    if( (typeof(results[i].resourceUri) != "undefined")  && (i != "last") ) {
                        var resourceUri = results[i].resourceUri.value;
                        (typeof(results[i].label) != "undefined") &&
                        (results[i].label != null)              ? everywhereInUse[resourceUri] = results[i].label.value
                                                                : everywhereInUse[resourceUri] = null;
                    }
                }
                self._hasProperties(function(hasProperties){
                    $.merge(self._propertiesInUse, hasProperties);
                    for (var resourceUri in everywhereInUse) {
                        if ($.inArray(resourceUri, hasProperties) != -1) {
                            delete everywhereInUse[resourceUri];
                        } else {
                            self._propertiesInUse.push(resourceUri);
                        }
                    }
                    $.isFunction(callback) ? callback(everywhereInUse) : null;
                })
            }
        });
    },

    _hasProperties: function (callback) {
        var self = this;
        var subjectURI = self.statement.subjectURI();
        var graphURI = self.statement.graphURI();
        var prefixPattern = '\
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n';
        var selectPattern = '?resourceUri\n';
        var uriPattern = '<' + subjectURI + '> ?resourceUri ?object .\n';
        var query = prefixPattern + 'SELECT ' + selectPattern
                                  + 'WHERE { \n'
                                  + uriPattern
                                  + '}';
        var hasProperties = [];
        //query
        RDFauthor.queryGraph(graphURI, query, {
            callbackSuccess: function(data) {
                var results = data.results.bindings;
                for (var i in results) {
                    if( (results[i].resourceUri != "undefined") && (i != "last") ) {
                        hasProperties.push(results[i].resourceUri.value);
                    }
                }
                $.isFunction(callback) ? callback(hasProperties) : null;
            },
            callbackError: function() {
                $.isFunction(callback) ? callback(hasProperties) : null;
            }
        });
    },

    _performSearch: function (requestTerm, callback) {
        if ( typeof(requestTerm) == 'function' ) {
            requestTerm = null;
        }
        var self = this;
        var value = $('#filterProperties').val();
        var subjectURI = self.statement.subjectURI();
        var graphURI = self.statement.graphURI();
        var prefixPattern = '\
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
            PREFIX owl: <http://www.w3.org/2002/07/owl#>\n';
        var selectPattern = 'DISTINCT ?resourceUri\n';
        var classPattern = '?resourceUri a ?class .\n';
        var literalPattern = '?resourceUri ?p0 ?literal .\n';
        var filter1 = 'FILTER (REGEX(?literal, "' + requestTerm + '", "i")). \n';
        var filter2 = 'FILTER ( ( ( (sameTerm(?class,owl:DatatypeProperty)) || (sameTerm(?class,owl:ObjectProperty)) ) || \
                                (sameTerm(?class, rdf:Property)) ) || \
                                (sameTerm(?class, owl:AnnotationProperty)) ).\n';
        var query = prefixPattern + 'SELECT ' + selectPattern
                                  + 'WHERE { \n'
                                  + classPattern
                                  + literalPattern
                                  + filter1
                                  + filter2
                                  + '}';
        //query
        RDFauthor.queryGraph(graphURI, query, {
            callbackSuccess: function(data) {
                var results = data.results.bindings;
                var queryResult = [];
                for (var i in results) {
                    if (typeof results[i].resourceUri == 'object') {
                        queryResult.push(results[i].resourceUri.value);
                    }
                }
                $.isFunction(callback) ? callback(queryResult) : null;
            },
            callbackError: function() {
                $.isFunction(callback) ? callback() : null;
            }
        });

    },

    _listProperty: function (resourceUri,label,comment) {
        var self = this;
        label = label == null ? self.localName(resourceUri) : label;
        title = typeof(comment) != "undefined" ? comment : label;
        return '<li><a name="propertypicker" class="show-property Resource" about="'+resourceUri+'" \
                title="' + title + '">' + label + '</a></li>';
    },

    _listPropertyAutocomplete: function (resourceUri) {
        var self = this;
        label = self.localName(resourceUri);
        return '<li><a style="line-height:0.8em !important;">\
                <span style="font-size: 15px;">' + label + '</span><br/>\
                <span style="font-size:10px;">' + resourceUri + '</span></li>';
    },

    _normalizeValue: function (value) {
        if (!this.selectedResource) {
            this.selectedResource      = this.expandNamespace(value);
            this.selectedResourceLabel = this.localName(value);
        }
    },

    _validateURI: function (uri) {
        var uriRE = new RegExp (
            /^([a-zA-Z][a-zA-Z0-9+-.]*):((\/\/(((([a-zA-Z0-9\-._~!$&'()*+,;=':]|(%[0-9a-fA-F]{2}))*)@)?((\[((((([0-9a-fA-F]{1,4}:){6}|(::([0-9a-fA-F]{1,4}:){5})|(([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:){4})|((([0-9a-fA-F]{1,4}:)?[0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:){3})|((([0-9a-fA-F]{1,4}:){0,2}[0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:){2})|((([0-9a-fA-F]{1,4}:){0,3}[0-9a-fA-F]{1,4})?::[0-9a-fA-F]{1,4}:)|((([0-9a-fA-F]{1,4}:){0,4}[0-9a-fA-F]{1,4})?::))((([0-9a-fA-F]{1,4}):([0-9a-fA-F]{1,4}))|(([0-9]|(1[0-9]{2})|(2[0-4][0-9])|(25[0-5]))\.([0-9]|(1[0-9]{2})|(2[0-4][0-9])|(25[0-5]))\.([0-9]|(1[0-9]{2})|(2[0-4][0-9])|(25[0-5]))\.([0-9]|(1[0-9]{2})|(2[0-4][0-9])|(25[0-5])))))|((([0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4})?::[0-9a-fA-F]{1,4})|((([0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4})?::))|(v[0-9a-fA-F]+\.[a-zA-Z0-9\-._~!$&'()*+,;=':]+))\])|(([0-9]|(1[0-9]{2})|(2[0-4][0-9])|(25[0-5]))\.([0-9]|(1[0-9]{2})|(2[0-4][0-9])|(25[0-5]))\.([0-9]|(1[0-9]{2})|(2[0-4][0-9])|(25[0-5]))\.([0-9]|(1[0-9]{2})|(2[0-4][0-9])|(25[0-5])))|(([a-zA-Z0-9\-._~!$&'()*+,;=']|(%[0-9a-fA-F]{2}))*))(:[0-9]*)?)((\/([a-zA-Z0-9\-._~!$&'()*+,;=':@]|(%[0-9a-fA-F]{2}))*)*))|(\/?(([a-zA-Z0-9\-._~!$&'()*+,;=':@]|(%[0-9a-fA-F]{2}))+(\/([a-zA-Z0-9\-._~!$&'()*+,;=':@]|(%[0-9a-fA-F]{2}))*)*)?))(\?(([a-zA-Z0-9\-._~!$&'()*+,;=':@\/?]|(%[0-9a-fA-F]{2}))*))?((#(([a-zA-Z0-9\-._~!$&'()*+,;=':@\/?]|(%[0-9a-fA-F]{2}))*)))?$/i
        );
        return uriRE.test(uri);
    },

    _init: function () {
        var self = this;
        var focus;
        if (this._pluginLoaded && this._domReady) {
            self.element().click(function() {
                focus = true;
                // positioning
                var left = self._getPosition().left + 'px !important;';
                var top = self._getPosition().top + 'px !important';

                $('#propertypicker').data('input',$(this))
                                    .draggable({
                                        cancel: '#propertypicker .content, #propertypicker h1 input'
                                    }).keydown(function (e) {
                                        if (e.which === 27) {
                                            e.stopPropagation();
                                            $('#propertypicker').parent().fadeOut();
                                            self._reinitialization();
                                            console.log('removed');
                                        }
                                    });
                // query - fills the everywhere in use part
                self._suggestions(function(everywhereInUse) {
                    // add in use everywhere to dom
                    for (var resourceUri in everywhereInUse) {
                        $('#suggestedInUse ul').append(self._listProperty(resourceUri,everywhereInUse[resourceUri],resourceUri));
                    }
                    $('#suggestedInUseCount').html(Object.size(everywhereInUse));

                    // add general applicable to dom
                    var generalapplicable = __propertycache['generalapplicable'];
                    // show only new suggested general applicable properties
                    for (var resourceUri in generalapplicable) {
                        if($.inArray(resourceUri,self._propertiesInUse) != -1) {
                            delete generalapplicable[resourceUri];
                        } else {
                            $('#suggestedGeneral ul').append(self._listProperty(resourceUri,
                                                                                generalapplicable[resourceUri].label,
                                                                                generalapplicable[resourceUri].comment));
                        }
                    }
                    $('#suggestedGeneralCount').html(Object.size(generalapplicable));

                    //TESTING
                    self._performSearch(function(){

                    });

                    // ready
                    self._positioning();
                    $('#spinner-propertyselector').remove();
                    $('#propertypicker').fadeIn('fast', function() {
                        $('#filterProperties').focus().blur(function() {
                            if ($(this).val().length == 0) {
                                $(this).val(self._filterProperties);                            
                            }
                        });
                    });
                });
            }).keydown(function (e) {
                if ((e.which === 13) && self._options.selectOnReturn) {
                    $('#propertypicker').hide();
                    var val = jQuery(e.target).val();
                    self._normalizeValue(val);

                    var splits = val.split(':', 2);
                    if (splits.length >= 2 && !self.isURI(val)) {
                        if (splits[0] in self._namespaces) {
                            self.selectedResource = self._namespaces[splits[0]] + splits[1];
                            self.selectedResourceLabel = splits[1];
                        }
                    }

                    self._options.selectionCallback(self.selectedResource, self.selectedResourceLabel);

                    // prevent newline in new widget field
                    e.preventDefault();
                } else if (e.which === 27) {
                    e.stopPropagation();
                }
            });

            /** INPUT EVENTS */

            $('#filterProperties').click(function() {
                                      if ($(this).val() == self._filterProperties) {
                                         $(this).val('').css('background-color', 'none');                                     
                                      }
                                  }).autocomplete({
                                      minLength: 3,
                                      delay: 500,
                                      source: function(request, response) {
                                          self._performSearch(request.term, function(result) {
                                              response(result);
                                          });
                                          $('.ui-autocomplete:last').css({
                                              'max-height': '300px',
                                              'overflow-y': 'auto',
                                              'overflow-x': 'hidden',
                                              'padding-right': '1px'
                                          });
                                      },
                                      select: function(event, ui) {
                                          var resourceUri = ui.item.value;
                                          var keydownEvent = $.Event("keydown");
                                          keydownEvent.which=13;
                                          self.element().val(resourceUri).trigger(keydownEvent);
                                          $('.modal-wrapper-propertyselector').remove();
                                      }
                                  }).keyup(function(event) {
                                      // uri check
                                      var cssRed = 'rgb(255, 187, 187)';
                                      if (!self._validateURI($(this).val()) && $(this).val().length != 0) {
                                          var currentColour = $(this).css('background-color');
                                          if (currentColour != cssRed) {
                                              $(this).data('previousColour', $(this).css('background-color'));
                                          }
                                          $(this).css('background-color', cssRed);
                                      } else {
                                          $(this).css('background-color', $(this).data('previousColour'));
                                      }
                                      // return
                                      if(event.which == '13') {
                                          if(self._validateURI($(this).val())) {
                                              event.preventDefault();
                                              var resourceUri = $('#filterProperties').val();
                                              var keydownEvent = $.Event("keydown");
                                              keydownEvent.which=13;
                                              self.element().val(resourceUri).trigger(keydownEvent);
                                              $('.modal-wrapper-propertyselector').remove();
                                          } else {
                                              alert('Faulty entry! "' + $(this).val() + '" is not a valid uri.');
                                          }
                                      }
                                  }).data( "autocomplete" )._renderItem = function( ul, item ) {
                                      var li = self._listPropertyAutocomplete(item.value);
                                      return $(li).data("item.autocomplete", item).appendTo(ul);
                                  };

            /** SHOW-HIDE-SCROLL EVENTS */
            $('html').unbind('click').click(function(){
                if ($('#propertypicker').css("display") != "none" && focus == false) {
                    $('#propertypicker').parent().fadeOut();
                    self._reinitialization();
                }else if (focus == true){
                    $('#propertypicker').parent().fadeIn();
                }
            });
            $('#propertypicker,input[name="propertypicker"]').mouseover(function(){
                focus = true;
            });
            $('#propertypicker,input[name="propertypicker"]').mouseout(function(){
                focus = false;
            });

            /** SCROLL EVENTS */

            // $('.rdfauthor-view-content,html').scroll(function() {
                // var left = self._getPosition().left + 'px !important;';
                // var top = self._getPosition().top + 'px !important';

                // $('#propertypicker').css('left',left)
                                    // .css('top',top);
                // $('#propertypicker').parent().fadeOut();
            // });

            $(document).scroll(function() {
                var height = $(document).height();
                var width = $(document).width();
                $('.modal-wrapper-propertyselector').css('height', height);
                $('.modal-wrapper-propertyselector').css('width', width);
            });

            $('#propertypicker .button-windowclose').live('click', function() {
                $('#propertypicker').parent().fadeOut();
                self._reinitialization();
            });

            /** TOGGLE EVENT */
            $('#propertypicker .content ul li').die('click').live('click', function(){
                $(this).find('h1 .ui-icon')
                       .hasClass('ui-icon-minus') ? $(this).find('h1 .ui-icon')
                                                           .removeClass('ui-icon-minus')
                                                           .addClass('ui-icon-plus')
                                                  : $(this).find('h1 .ui-icon')
                                                           .removeClass('ui-icon-plus')
                                                           .addClass('ui-icon-minus');
                $(this).find('h1').next('div').slideToggle();
            });

            /** CLICK EVENT ON PROPERTY */
            $('#propertypicker a[name="propertypicker"]').live('click', function(event){
                event.preventDefault();
                var resourceUri = $(this).attr('about');
                var keydownEvent = $.Event("keydown");
                keydownEvent.which=13;
                self.element().val(resourceUri).trigger(keydownEvent);
                $('.modal-wrapper-propertyselector').remove();
            })
        }
    },

    _getPosition: function () {
        var pos = {
            'top' : this.element().offset().top + this.element().outerHeight(),
            'left': this.element().offset().left
        };
        return pos;
    },

    _positioning: function (element) {
        //trick to get the height and width from a non visible object using jquery
        var bodyh = $(document).height();
        var bodyw = $(document).width();
        var ww = $('#propertypicker').outerWidth();
        var wh = $('#propertypicker').outerHeight();
        var offsetPosition = {
            'top': Math.max( (bodyh - wh) * 0.5 , 20),
            'left': Math.max( (bodyw - ww) * 0.5 , 50 )
        }
        $('#propertypicker').offset(offsetPosition);
    },

    _reinitialization: function () {
        var self = this;
        var propertyselectorInlineController = self.element().parent().parent().parent().parent().parent();
        var propertyselectorPopOverController = self.element().parent().parent();
        if(propertyselectorInlineController.attr('id') != "rdfauthor-view") {
            propertyselectorInlineController.remove();
        } else {
            propertyselectorPopOverController.remove();
        }
        //remove model-wrapper div including propertypicker
        $('#propertypicker').parent().remove();
    }

}, [{
        name: '__PROPERTY__'
    }]
);
