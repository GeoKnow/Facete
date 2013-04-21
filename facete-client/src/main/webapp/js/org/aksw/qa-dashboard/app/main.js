/**
 * Main file
 * 
 */
(function() {

	var backend = Namespace("org.aksw.ssb.backend"); 	
	var controllers = Namespace("org.aksw.qa-dashboard.app.controllers");

	var backboneUtils = Namespace("org.aksw.utils.backbone"); 	
	var core = Namespace("org.aksw.qa-dashboard.core");

	var config = {};

	
    $(document).ready(function() {
    	main_latc_qa();
    });
	
	var app = {
			/*
			loadMainPage: function() {
				if(!this.mainPageLoaded) {
					
				}
			}
			
	        showMainPage: function() {
	        	alert("test");
	        },*/
	        
	        showLinksetDetails: function(id) {
	             core.renderDetailPage(id);
	        }
	};

    
    
    function main_latc_qa() {
	
		config.sparqlServiceUri = "http://localhost/sparql";
		
		// If a proxy service is set, then the sparqlServiceUri is resolved against it.
		// Otherwise, the sparqlServiceUri is interpreted as the service URL 
		config.sparqlProxyServiceUri = "lib/SparqlProxyPHP/current/sparql-proxy.php";
		config.sparqlProxyParamName = "service-uri";
	
		config.defaultGraphUris = [];
		
		var sparqlService = new backend.SparqlServiceHttp(
				config.sparqlServiceUri,
				config.defaultGraphUris,
				config.sparqlProxyServiceUri,
				config.sparqlProxyParamName);
	
		
		var appController = new controllers.AppController({sparqlService: sparqlService});

		appController.run();
		
		var AppRouter = backboneUtils.AppRouter.extend({
	        routes: {
	        	"": "showMainPage",
	        	//"foo": "showLinksetDetails",
	            "linkset/*id": "showLinksetDetails"
	        },
		});


	    // Initiate the router
	    var appRouter = new AppRouter({app: app});

	    // Start Backbone history a neccesary step for bookmarkable URL's
	    Backbone.history.start();

    };

	
})();