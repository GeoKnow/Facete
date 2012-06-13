
var controllers = Namespace("org.aksw.ssb.app.controllers");

// TODO [HACK] Avoid global function
function doSearch() {
	controllers.AppController.doSearch();
};


var ns = {};


/*
 * An auto-height plugin, that assigns the remaining space to an element
 * based on its parent and siblings (i.e. the parent's children)
 * 
 * Note: Currently does not update on non-window resize events.
 * E.g. if only a sibling is resized, the 
 */
(function($) {

	/**
	 * Returns the actual height of an element; considering margins of child elements 
	 * 
	 */
	/*
	$.fn.actualHeight = function() {
		var element = $(this[0]);
		
		var children = element.children();
		
		
	};
	*/

	/**
	 * Returns the sibling of an element excluding the element.
	 * 
	 */
	$.fn.otherSiblings = function() {
		var element = $(this[0]);
		
		var parent = element.parent();
		var children = parent.children();

		var result = children.filter(function(i) {
			var child = $(this);
			return !element.is(child);
		});
		
		return result;
	};
	
	
	/**
	 * Resizes an element to take the remaining space by substracting the height from all children from that of the parent.
	 * 
	 * 
	 * 
	 */
	$.fn.autoHeight = function() {
			
		var element = $(this[0]);
		
		var result = function() {
			var parent = element.parent();
			var children = parent.children();
		
			var parentHeight = parent.outerHeight(true);
			var childrenHeight = 0;
			
			var otherSiblings = $(element).otherSiblings();
			
			otherSiblings.each(function(i) {
				var child = $(this);
				
				var childHeight = child.is(":visible") ? child.outerHeight(true) : 0;
				console.log("childHeight: " + childHeight, child);
				childrenHeight += childHeight;
			});
	
			var space = element.outerHeight(true) - element.innerHeight();
			
			var elementHeight = parentHeight - childrenHeight - space;
			if(elementHeight < 0) {
				elementHeight = 0;
			}
			
			element.css("height", elementHeight + "px");
		};
		
		
		//var parent = element.parent();
		//var otherSiblings = $(element).otherSiblings();
		
		//$(parent).resize(result);
		//$(otherSiblings).resize(result);
		
		//var children = parent.children();

		//$(parent).resize(result);
		//$(children).resize(result);
		
		
		//var scheduler = new Scheduler();
		//$(window).resize(function() { scheduler.schedule(result); });
		
		$(window).resize(result);
		//$(element).resize(result);
		
		return result;
	};

})(jQuery);


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

		/*
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
		*/

		
		/*
		 * Auto height for the tabs
		 * FIXME Make this a generic utility function:
		 * Input: A container and an element which to resize based on the size of all other elements in the container
		 */
		
		//$("#wrapper").autoHeight();
		//$("#main").autoHeight();
		//$("#ssb-breadcrumb").autoHeight();
		$("#ssb-nav-tabs-content").autoHeight();
		$("#map").autoHeight();
		
		
		//$(window).height($(window).height() - 1);
		
		/*
		$(window).resize(function() {
			var containerSelector = "#tabs";
			
			// TODO We could just use the two children of the container
			var headerSelector = "#ssb-nav-tabs-header";
			var contentSelector = "#ssb-nav-tabs-content";
			
			var container = $(containerSelector);
			var header = $(headerSelector); 
			var content = $(contentSelector);
			
			var containerHeight = container.outerHeight(true);
			var headerHeight = header.is(":visible") ? header.outerHeight(true) : 0;
			

			var space = content.outerHeight(true) - content.innerHeight();
			
			var contentHeight = containerHeight - headerHeight - space;
			if(contentHeight < 0) {
				contentHeight = 0;
			}
			
			content.css("height", contentHeight + "px");			
		});*/

		
		
		$("#language-switcher").change(function() {
				
			var lang = $("#language-switcher").val();

			var href = "src/main/resources/i18n/" + lang + "/LC_MESSAGES/messages.po";

			$("#active_lang").attr('href', href);

			ns.updateLang();
			
			//insertParam("lang", lang);
		});

		
		//$("#filters").click(function() { $("#filters").html(""); $(window).resize(); });
		
		//$( "#tabs" ).tabs({ fx: { height: 'toggle', opacity: 'toggle' } });
		//$( "#tabs" ).tabs({ fx: { opacity: 'toggle' } });
		// $( "#tabs" ).tabs({});
		
				

		//var scheduler = new Scheduler(5000);
		//scheduler.schedule(function() { $(window).trigger("resize"); });
		//$(window).trigger("resize");

	});
	
	
	
	ns.updateLangFromApi = function(lang) {
		
	};
	
	

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
		//ns.updateLangConvention(gt, "[id^='org.ec.odp.ssb.ui.label']");
		
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
