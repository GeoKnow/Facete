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
        var self = this;
        this.datatype = 'http://ns.ontowiki.net/SysOnt/Markdown';
        this._domRdy = false;
        this._markitupRdy = false;
        this._showdownRdy = false;
        this._converter;
        RDFauthor.loadStylesheet(RDFAUTHOR_BASE + 'libraries/markitup/sets/markdown/style.css');
        RDFauthor.loadStylesheet(RDFAUTHOR_BASE + 'libraries/markitup/skins/simple/style.css');
        RDFauthor.loadScript(RDFAUTHOR_BASE + 'libraries/markitup/jquery.markitup.js', function () {
            self._markitupRdy = true;
            self._init();
        });
        RDFauthor.loadScript(RDFAUTHOR_BASE + 'libraries/markitup/sets/markdown/showdown.js', function () {
            self._showdownRdy = true;
            // showdown converter
            self._converter = new Showdown.converter();
            self._init();
        });
        // mIu nameSpace to avoid conflict. For h1 and h2 headings (==,-- instead of #,##).
        this._miu = {
            markdownTitle: function(markItUp, char) {
                heading = '';
                n = $.trim(markItUp.selection||markItUp.placeHolder).length;
                for(i = 0; i < n; i++) {
                    heading += char;
                }
                return '\n'+heading+'\n';
            }
        };
        // markItUp settings
        this._settings = {
            nameSpace: 'markdown', // Useful to prevent multi-instances CSS conflict
            onShiftEnter: {keepDefault:false, openWith:'\n\n'},
            returnParserData: function(data){
                //added new callback in markItUp to use json markdown parser (in this case: showdown)
                return self._converter.makeHtml(data);
            },
            markupSet: [
            {name:'First Level Heading', key:"1", placeHolder:'Your title here...',
             closeWith:function(markItUp) { return self._miu.markdownTitle(markItUp, '=') } },
            {name:'Second Level Heading', key:"2", placeHolder:'Your title here...',
             closeWith:function(markItUp) { return self._miu.markdownTitle(markItUp, '-') } },
            {name:'Heading 3', key:"3", openWith:'### ', placeHolder:'Your title here...' },
            {name:'Heading 4', key:"4", openWith:'#### ', placeHolder:'Your title here...' },
            {name:'Heading 5', key:"5", openWith:'##### ', placeHolder:'Your title here...' },
            {name:'Heading 6', key:"6", openWith:'###### ', placeHolder:'Your title here...' },
            {separator:'---------------' },
            {name:'Bold', key:"B", openWith:'**', closeWith:'**'},
            {name:'Italic', key:"I", openWith:'_', closeWith:'_'},
            {separator:'---------------' },
            {name:'Bulleted List', openWith:'- ' },
            {name:'Numeric List', openWith:function(markItUp) {
              return markItUp.line+'. ';
            }},
            {separator:'---------------' },
            {name:'Picture', key:"P", replaceWith:'![[![Alternative text]!]]([![Url:!:http://]!] "[![Title]!]")'},
            {name:'Link', key:"L", openWith:'[', closeWith:']([![Url:!:http://]!] "[![Title]!]")',
             placeHolder:'Your text to link here...' },
            {separator:'---------------'},
            {name:'Quotes', openWith:'> '},
            {name:'Code Block / Code', openWith:'(!(\t|!|`)!)', closeWith:'(!(`)!)'},
            {separator:'---------------'},
            {name:'Preview', call:'preview', className:"preview"}
          ]
        };
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
        return $('#markdown-edit-' + this.ID);
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
                <textarea class="text markItUp" id="markdown-edit-' + this.ID + '">'
                + (this.statement.hasObject() ? this.statement.objectValue() : '') + '</textarea>\
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
        if (String(value).length > 0 && typeof(value) != "undefined") {
            return value;
        }

        return null;
    },

    _init: function () {
       var self = this;
       if (self._domRdy && self._markitupRdy && self._showdownRdy) {
          self.element().markItUp(self._settings);
       }
    }
},  //load hook settings from rdfauthor.config.js
    __config['widgets']['markdown']['hook']
);
