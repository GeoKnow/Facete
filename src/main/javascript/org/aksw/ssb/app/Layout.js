
var controllers = Namespace("org.aksw.ssb.app.controllers");

// TODO [HACK] Avoid global function
function doSearch() {
	controllers.AppController.doSearch();
};

/**
 * Attach scripted layouting and internationalization of the user interface.
 * 
 */
(function($) {

	var ns = Namespace("org.aksw.ssb.app");
	
	
	/**
	 * This is a bit hacky, as we resize the instance list to 100% minus some pixel,
	 * but its less hacky than hiding divs on mouse over and such
	 * (and we require javascript anyway)
	 */
	$(document).ready(function() {
	 
		/*
		 * Add a button to toggle the header
		 */
		//$("#container").
		//var headerToggle = $(document).append('<img id="div_header_toggle" src="images/arrow_up.jpg">');

		var headerDiv = $("#header_div");
		headerDiv.slideUp("fast", function() { $(window).resize(); });

		$(window).resize(function() {
			var headerDiv = $("#header_div");
			
			var windowHeight = $(window).height();
			var headerHeight = headerDiv.is(":visible") ? headerDiv.height() : 0;
			var contentHeight = windowHeight - headerHeight;

			
			//console.log("header div", $("#headerDiv"));
			//console.debug("windowHeigh, headerHeigh, contentHeigh", windowHeight, headerHeight, contentHeight);

			$("#main").css('height', contentHeight + "px");

			
			// $("#tabs").css('height', contentHeight + "px");
			// $("#instances").css('max-height', (contentHeight - 75) + "px");
			// $("#facets").css('max-height', (contentHeight - 75) + "px");
		});

		$(window).resize();

		$("#language-switcher").change(function() {
			var lang = $("#language-switcher").val();

			var href = "src/main/resources/i18n/" + lang + "/LC_MESSAGES/messages.po";

			$("#active_lang").attr('href', href);

			updateLang();

			//insertParam("lang", lang);
		});

		//$( "#tabs" ).tabs({ fx: { height: 'toggle', opacity: 'toggle' } });
		//$( "#tabs" ).tabs({ fx: { opacity: 'toggle' } });
		$( "#tabs" ).tabs({});
		
				
	});

	/**
	 * TODO Should all I18N go into this method, or should the widgets handle
	 * that themselves?
	 * 
	 */
	ns.updateLang = function() {
    	var gt = new Gettext({ 'domain' : 'messages' });
    	$("#facets-title").html(gt.gettext('ssb.ui.facets'));
	};
    
    /**
     * I18n of the user interface
     *
     */
    window.onload = function init() {
		ns.updateLang();
    	
    	$("#language-switcher").val(lang);
   	};

})(jQuery);
