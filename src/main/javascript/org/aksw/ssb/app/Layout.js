
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
				//console.log("childHeight: " + childHeight, child);
				childrenHeight += childHeight;
			});
	
			var space = element.outerHeight(true) - element.innerHeight();
			
			var elementHeight = parentHeight - childrenHeight - space;
			if(elementHeight < 0) {
				elementHeight = 0;
			}
			
			element.css("height", elementHeight + "px");
		};
		
		$(window).resize(result);
		
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
	 * Some elements have scripted layouts.
	 * 
	 */
	$(document).ready(function() {
		
		//$("#wrapper").autoHeight();
		//$("#main").autoHeight();
		//$("#ssb-breadcrumb").autoHeight();
		$("#ssb-nav-tabs-content").autoHeight();
		$("#map").autoHeight();
		
		
		$("#language-switcher").change(function() {
				
			var lang = $("#language-switcher").val();

			var href = "src/main/resources/i18n/" + lang + "/LC_MESSAGES/messages.po";

			$("#active_lang").attr('href', href);

			ns.updateLang();
			
			//insertParam("lang", lang);
		});

		
		
		// Trigger a resize event for doing the layout
		// Note: AppController triggers another resize event once it
		// initialized some further widgets
		$(window).resize();
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
