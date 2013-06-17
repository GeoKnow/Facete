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
        this._embedPicasaGalleryLoaded = false;
        this._slimboxLoaded = false;
        this._domRdy = false;
        this._album = __config['widgets']['imagepicker']['albumtitle'];
        this._webuploadurl = __config['widgets']['imagepicker']['webuploadurl'];
        this._albumid = __config['widgets']['imagepicker']['albumid'];
        this._authkey = __config['widgets']['imagepicker']['authkey'];
        this._matcher = __config['widgets']['imagepicker']['tag'];
        this._thumbsize = __config['widgets']['imagepicker']['thumbsize'];
        this._showmore = __config['widgets']['imagepicker']['showmore'];
        var self = this;

        RDFauthor.loadStylesheet(RDFAUTHOR_BASE + 'libraries/slimbox/slimbox2.css');

        RDFauthor.loadStylesheet(RDFAUTHOR_BASE + 'src/widget.imagepicker.css');

        // RDFauthor.loadScript(RDFAUTHOR_BASE + 'libraries/slimbox/slimbox2.js', function(){
            // self._slimboxLoaded = true;
            // self._init();
        // });
        self._slimboxLoaded = true;
        RDFauthor.loadScript(RDFAUTHOR_BASE + 'libraries/jquery.EmbedPicasaGallery.js', function(){
            self._embedPicasaGalleryLoaded = true;
            self._init();
        });

    },

    // Uncomment this to execute code when you widget's markup is ready in the DOM,
    // e.g. load jQuery plug-ins, attach event handlers etc.
    ready: function () {
        var self = this;
        self._domRdy = true;
        self._init();
    },

    // return your jQuery-wrapped main input element here
    element: function () {
        return $('#imagepicker-edit-' + this.ID);
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
                <input type="text" style="width:100%;" class="text image-icon imagepicker" name="imagepicker" id="imagepicker-edit-' + this.ID + '" value="'
                    + (this.statement.hasObject() ? this.statement.objectValue() : '') + '" />\
            </div>';

        var imagePicker =
            '<div id="imagepicker" class="window" style="display: none;">\
               <h1 class="title">ImagePicker - Album: ' + this._album + '<a href="' + this._webuploadurl + '" target="_blank" ><img style="height: 15px; float:right; margin-right:15px;" src="'+ RDFAUTHOR_BASE+'libraries/images/upload_photo.png' +'" alt="upload pictures to album "'+ this._album +'</img></a>\
                 <br/>\
                 <input id="filterGallery" autocomplete="off" type="text" class="text inner-label width99" style="margin: 5px 5px 0px 0px;"/>\
               </h1>\
               <div class="window-buttons">\
                 <div class="window-buttons-left"></div>\
                 <div class="window-buttons-right">\
                   <span class="button button-windowclose"><span>\
                 </div>\
               </div>\
               <div class="content">\
                 <div id="gallery">\
                 </div>\
              </div>\
             </div>\
            ';

        if( $('#imagepicker').length == 0 ) {
            $('body').append(imagePicker);
        }
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
        $('#imagepicker').remove();
        return true;    },

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
        var focus;
        if (self._embedPicasaGalleryLoaded && self._slimboxLoaded && self._domRdy) {
            self.element().click(function(){
                focus = true;
                $('#imagepicker').data('current',self.element().attr('id'));
                // positioning
                var left = self._getPosition().left;
                var top = self._getPosition().top;

                $('#imagepicker').data('input',$(this))
                                 .show()
                                 .offset({left: left, top: top})
                                 .resizable({
                                    minHeight: 400,
                                    minWidth: 550,
                                    alsoResize: $('#gallery')
                                 });
            });

            $("#gallery").EmbedPicasaGallery('aksw.group',{
                    albumid: self._albumid,
                    authkey: self._authkey,
                    matcher: self._matcher,
                    size: self._thumbsize, // thumb size (32,48,64,72,144,160))
                    loading_animation: RDFAUTHOR_BASE + "libraries/slimbox/loading.gif",
                    msg_more: '<span id="gallery_more" style="font-weight: bolder;">MORE</span>',
                    show_more: self._showmore
                });

            $('#filterGallery').click(function(){
                var noInput;
                $(this).autocomplete({
                    source: $.EmbedPicasaGallery.defaultOptions.keywords
                }).bind('change cut input keyup',function(){
                    if ( $('#filterGallery').val().length == 0 ) {
                        $('#gallery .album div').each(function(i){
                            if( i < 5 ) {
                               $(this).show();
                            } else {
                               $(this).hide();
                            }
                        });
                        $('#gallery_more').parent().parent().show();
                        $('#gallery_more').parent().show();
                    } else {
                        var moreButton = $('#gallery_more').parent().parent();
                        moreButton.hide();
                        $('#gallery img').each(function(){
                            var keywords = $(this).data('keywords');
                            var valueFilterGallery = $('#filterGallery').val();
                            var regex = new RegExp(valueFilterGallery,'gi');
                            $(this).parent().parent().hide();
                            for ( var i in keywords ) {
                                if ( keywords[i].search(regex) != -1 ) {
                                   $(this).parent().parent().show();
                                }
                            }
                        });
                    }
                });
            })

            $('html').unbind('click').click(function(event){
                if ($('#imagepicker').css("display") != "none" && focus == false) {
                    $('#imagepicker').fadeOut();
                }else if (focus == true){
                    $('#imagepicker').fadeIn();
                }
            });
            $('#imagepicker,input[name="imagepicker"]').mouseover(function(){
                focus = true;
            });
            $('#imagepicker,input[name="imagepicker"]').mouseout(function(){
                focus = false;
            });

            $('.rdfauthor-view-content,html').scroll(function() {
                var left = self._getPosition().left + 'px !important;';
                var top = self._getPosition().top + 'px !important';

                $('#imagepicker').css('left',left)
                                .css('top',top);
                $('#imagepicker').fadeOut();
            });

            $('#imagepicker .button-windowclose').live('click', function() {
                $('#imagepicker').fadeOut();
            });

            $('#imagepicker #gallery .album a').live('click', function(event){
                event.preventDefault();
                var picURI = $(this).attr('href');
                var current = $('#imagepicker').data('current');
                $('#' + current).val(picURI);
                $('#imagepicker').hide();
            });
        }
    },

    _getPosition: function () {
        var pos = {
            'top' : this.element().offset().top + this.element().outerHeight(),
            'left': this.element().offset().left
        };
        return pos;
    }

},  //load hook settings from rdfauthor.config.js
    __config['widgets']['imagepicker']['hook']
);
