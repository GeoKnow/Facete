/**
 * Main file
 * 
 */
(function() {

	var backend = Namespace("org.aksw.ssb.backend"); 	
	var controllers = Namespace("org.aksw.qa-dashboard.app.controllers");

	var config = {};

	
    $(document).ready(function() {
    	main_latc_qa();
    });
	
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
    };

	
})();