
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

		//var headerDiv = $("#header_div");
		//headerDiv.slideUp("fast", function() { $(window).resize(); });

		$(window).resize(function() {
			var header = $("#header");
			
			var windowHeight = $(window).height();
			var headerHeight = header.is(":visible") ? header.height() : 0;
			var contentHeight = windowHeight - headerHeight;

			
			//console.log("header div", $("#headerDiv"));
			//console.debug("windowHeigh, headerHeigh, contentHeigh", windowHeight, headerHeight, contentHeight);

			//$("#main").css('height', contentHeight + "px");
			//$("#map").css('height', contentHeight + "px");

			
			// $("#tabs").css('height', contentHeight + "px");
			// $("#instances").css('max-height', (contentHeight - 75) + "px");
			// $("#facets").css('max-height', (contentHeight - 75) + "px");
		});

		
		/*
		 * Auto height for the tabs
		 * FIXME Make this a generic utility function:
		 * Input: A container and an element which to resize based on the size of all other elements in the container
		 */
		$(window).resize(function() {
			var containerSelector = "#tabs";
			
			// TODO We could just use the two children of the container
			var headerSelector = "#ssb-nav-tabs-header";
			var contentSelector = "#ssb-nav-tabs-content";
			
			var container = $(containerSelector);
			var header = $(headerSelector); 
			var content = $(contentSelector);
			
			var containerHeight = container.height();
			var headerHeight = header.is(":visible") ? header.height() : 0;
			var contentHeight = containerHeight - headerHeight;
			
			content.css("height", contentHeight + "px");			
		});
		
		
		$(window).resize();

		$("#language-switcher").change(function() {
			var lang = $("#language-switcher").val();

			var href = "src/main/resources/i18n/" + lang + "/LC_MESSAGES/messages.po";

			$("#active_lang").attr('href', href);

			ns.updateLang();

			//insertParam("lang", lang);
		});

		//$( "#tabs" ).tabs({ fx: { height: 'toggle', opacity: 'toggle' } });
		//$( "#tabs" ).tabs({ fx: { opacity: 'toggle' } });
		$( "#tabs" ).tabs({});
		
				
	});

	ns.updateLangById = function(gt, domElement) {
		var id = $(domElement).attr('id');

		
		var text = gt.gettext(id);
		//console.log("test", id, text);
		if(id === text) {
			return true;
		}
		
		$(domElement).html(text);		
	};
	
	ns.updateLangConvention = function(gt, selectorStr) {

		$(selectorStr).each(function() {
			ns.updateLangById(gt, this);
		});		
	};
	
	/**
	 * TODO Should all I18N go into this method, or should the widgets handle
	 * that themselves?
	 * 
	 */
	ns.updateLang = function() {
		var gt = new Gettext({domain : 'messages'});

		ns.updateLangConvention(gt, "[id^='org.aksw.ssb.ui.label']");
		ns.updateLangConvention(gt, "[id^='org.ec.odp.ssb.ui.label']");
		
    	//var gt = new Gettext({ 'domain' : 'messages' });
    	//$("#facets-title").html(gt.gettext('ssb.ui.facets'));
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
