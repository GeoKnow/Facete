var RDFAUTHOR_BASE = "lib/RDFauthor/current/";

(function() {
	
	ns = Namespace("org.aksw.ssb.plugins.RDFauthor");
	
/**
 * Loads RDFauthor if necessary and executes callback afterwards.
 */
ns.loadRDFauthor = function(callback) {
    var loaderURI = RDFAUTHOR_BASE + 'src/rdfauthor.js';
    
    if ($('head').children('script[src="' + loaderURI + '"]').length > 0) {
        callback();
    } else {
        RDFAUTHOR_READY_CALLBACK = callback;
        // load script
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.src = loaderURI;
        document.getElementsByTagName('head')[0].appendChild(s);
    }
};

ns.populateRDFauthor = function(data, protect, resource, graph) {
    protect  = arguments.length >= 2 ? protect : true;
    resource = arguments.length >= 3 ? resource : null;
    graph    = arguments.length >= 4 ? graph : null;
    
    for (var currentSubject in data) {
        for (var currentProperty in data[currentSubject]) {
            var objects = data[currentSubject][currentProperty];

            for (var i = 0; i < objects.length; i++) {
                var objSpec = objects[i];
                
                var value;
                if ( objSpec.type == 'uri' ) { 
                    value = '<' + objSpec.value + '>'; 
                } else if ( objSpec.type == 'bnode' ) { 
                    value = '_:' + objSpec.value;
                } else {
                    // IE fix, object keys with empty strings are removed
                    value = objSpec.value ? objSpec.value : ""; 
                }

                //console.debug("spec is", objSpec);

                var newObjectSpec = {
                    value : value,
                    type: String(objSpec.type).replace('typed-', '')
                }

                if (objSpec.value) {
                    if (objSpec.type == 'typed-literal') {
                        newObjectSpec.options = {
                            datatype: objSpec.datatype
                        }
                    } else if (objSpec.lang) {
                        newObjectSpec.options = {
                            lang: objSpec.lang
                        }
                    }
                }

                var stmt = new Statement({
                    subject: '<' + currentSubject + '>', 
                    predicate: '<' + currentProperty + '>', 
                    object: newObjectSpec
                }, {
                    graph: graph, 
                    title: objSpec.title, 
                    protect: protect ? true : false, 
                    hidden: objSpec.hidden ? objSpec.hidden : false
                });

                // remove all values except for type
/*
                if ( !/type/gi.test(stmt._predicateLabel) ) {
                    stmt._object.value = "";
                }
*/
                console.debug("Adding statement", "" + stmt);
                RDFauthor.addStatement(stmt);
            }
        }
    }
};

/*
 * get the rdfa init description from the service in class mode and start the
 * RDFauthor window
 * dataCallback is called right after the json request to manipulate the requested data
 */
ns.createInstanceFromClassURI = function(type, dataCallback) {
    var serviceUri = urlBase + 'service/rdfauthorinit';

    // remove resource menus
    //removeResourceMenus();

    ns.loadRDFauthor(function() {
        $.getJSON(serviceUri, {
            mode: 'class',
            uri: type
        }, function(data) {
            // pass data through callback
            if (typeof dataCallback == 'function') {
                data = dataCallback(data);
            }
            // get default resource uri for subjects in added statements (issue 673)
            // grab first object key
            for (var subjectUri in data) {break;};
            // add statements to RDFauthor
            ns.populateRDFauthor(data, true, subjectUri, selectedGraph.URI);
            RDFauthor.setOptions({
                saveButtonTitle: 'Create Resource',
                cancelButtonTitle: 'Cancel',
                title: 'Create New Instance of ' + type,  
                autoParse: false, 
                showPropertyButton: true, 
                onSubmitSuccess: function (responseData) {
                    var newLocation;
                    if (responseData && responseData.changed) {
                        newLocation = resourceURL(responseData.changed);
                    } else {
                        newLocation = window.location.href;
                    }
                    // HACK: reload whole page after 500 ms
                    window.setTimeout(function () {
                        window.location.href = newLocation;
                    }, 500);
                }
            });
           
            RDFauthor.start();
        });
    });
};
	

})();