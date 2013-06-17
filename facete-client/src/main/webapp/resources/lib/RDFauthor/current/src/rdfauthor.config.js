var __config = {
    /**
     * RDfauthor Widget Configurations
     *
     * -- required
     * - path
     * - enable/disable widgets
     * - set hook object
     *
     * -- optional
     * - title
     */
    'widgets' : {
        /*------------------------------- xmlliteral ----------------------------------*/
        'xmlliteral' : {
            'path' : 'src/widget.xmlliteral.js',
            'enabled' : true,
            'hook' : [{
                name: 'range',
                values: ['http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral']
            }, {
                name: 'datatype',
                values: ['http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral']
            }]
        },
        /*--------------------------------- HTML --------------------------------------*/
        'html' : {
            'path' : 'src/widget.html.js',
            'enabled' : true,
            'hook' : [{
                name: 'range',
                values: ['http://ns.ontowiki.net/SysOnt/HTML']
            }, {
                name: 'datatype',
                values: ['http://ns.ontowiki.net/SysOnt/HTML']
            }]
        },
        /*------------------------------- datetime ------------------------------------*/
        'datetime' : {
            'path' : 'src/widget.datetime.js',
            'enabled' : true,
            'hook' : {
                name: 'datatype',
                values: ['http://www.w3.org/2001/XMLSchema#dateTime',
                         'http://www.w3.org/2001/XMLSchema#date',
                         'http://www.w3.org/2001/XMLSchema#time'],
                callback : function () {
                    $.typedValue.types['http://www.w3.org/2001/XMLSchema#time'] = {
                        regex: /^.*$/,
                        strip: true,
                        /** @ignore */
                        value: function (v, options) {
                            var opts = $.extend({}, $.typedValue.defaults, options);
                            return v;
                        }
                    };
                    $.typedValue.types['http://www.w3.org/2001/XMLSchema#dateTime'] = {
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
        },
        /*--------------------------------- mailto ------------------------------------*/
        'mailto' : {
            'path' : 'src/widget.mailto.js',
            'enabled' : true,
            'hook' : {
                type: 'ObjectProperty',
                name: 'property',
                values: ['http://xmlns.com/foaf/0.1/mbox', 
                         'http://rdfs.org/sioc/ns#email', 
                         'http://usefulinc.com/ns/doap#mailing-list']
            }
        },
        /*---------------------------------- tel --------------------------------------*/
        'tel' : {
            'path' : 'src/widget.tel.js',
            'enabled' : true,
            'hook' : {
                type: 'ObjectProperty',
                name: 'property',
                values: ['http://xmlns.com/foaf/0.1/phone',
                         'http://purl.org/net/ldap#mobile',
                         'http://purl.org/net/ldap#homePhone',
                         'http://purl.org/net/ldap#telephoneNumber',
                         'http://purl.org/net/ldap#fax']
            }
        },
        /*---------------------------------- geo --------------------------------------*/
//        'geo' : {
//            'path' : 'src/widget.geo.js',
//            'enabled' : true,
//            'hook' : {
//                name: 'property',
//                values: ['http://www.w3.org/2003/01/geo/wgs84_pos#long',
//                         'http://www.w3.org/2003/01/geo/wgs84_pos#lat']
//            }
//        },
        /*------------------------------- markdown ------------------------------------*/
        'markdown' : {
            'path' : 'src/widget.markdown.js',
            'enabled' : true,
            'hook' : [
            {
                name: 'property',
                values: ['http://www.w3.org/2000/01/rdf-schema#comment',
                         'http://purl.org/dc/terms/description',
                         'http://purl.org/dc/elements/1.1/description',
                         'http://www.w3.org/2004/02/skos/core#note',
                         'http://www.w3.org/2004/02/skos/core#editorialNote',
                         'http://ns.ontowiki.net/SysOnt/Site/content']
            },
            {
                name: 'datatype',
                values: ['http://ns.ontowiki.net/SysOnt/Markdown'],
                callback : function () {
                    $.typedValue.types['http://ns.ontowiki.net/SysOnt/Markdown'] = {
                        regex: /.*/,
                        strip: false,
                        /** @ignore */
                        value: function (v, options) {
                            var opts = $.extend({}, $.typedValue.defaults, options);
                            return v;
                        }
                    };
                }
            }]
        },
        /*------------------------------- imagepicker ---------------------------------*/
        'imagepicker' : {
            'path' : 'src/widget.imagepicker.js',
            'enabled' : true,
            'hook' : {
                name: 'property',
                values: ['http://xmlns.com/foaf/0.1/depiction',
                         'http://open.vocab.org/terms/screenshot',
                         'http://xmlns.com/foaf/0.1/logo',
                         'http://purl.org/ontology/mo/image',
                         'http://xmlns.com/foaf/0.1/img']
            },
            'albumtitle' : 'aksw.org',
            'webuploadurl' : 'https://picasaweb.google.com/lh/webUpload?uname=aksw.group&aid=5646308221729665137&continue=https://picasaweb.google.com/aksw.group/AkswOrg%3Fauthkey%3DGv1sRgCIebodK_ssfhUg', // Link for webupload
            'albumid' : '5646308221729665137', // Picasa Album ID
            'authkey' : 'Gv1sRgCISL87-luIbGXg', // Picasa Auth Key
            'tag' : 'Screenshot', // show pics with tag
            'thumbsize' : 144, // size of thumbnails
            'showmore' : 5 // number of thumbnails
        },
        'treeselector' : {
            'path' : 'src/widget.treeselector.js',
            'enabled' : true,
            'hook' : {
                name: 'property',
                values: ['http://foo.bar/treeselector']
            }
        }
    }
}
