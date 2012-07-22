
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
	var config = Namespace("org.aksw.ssb.config");

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
	
	
	var ns = {};
	
	ns.innerHeight = function(element) {
		return element.innerHeight(); 
	};
	
	ns.outerHeight = function(element) {
		return element.outerHeight(true);
	};
	
	ns.innerWidth = function(element) {
		return element.innerWidth();
	};
	
	ns.outerWidth = function(element) {
		return element.outerWidth(true);
	};
	
	ns.calcDim = function(element, innerDim, outerDim) {
		var parent = element.parent();
		var children = parent.children();
	
		var parentDim = outerDim(parent);
		var childrenDim = 0;
		
		var otherSiblings = $(element).otherSiblings();
		
		otherSiblings.each(function(i) {
			var child = $(this);
			
			var childDim = child.is(":visible") ? outerDim(child) : 0;
			//console.log("childHeight: " + childHeight, child);
			childrenDim += childDim;
		});

		var space = outerDim(element) - innerDim(element);
		
		var elementDim = parentDim - childrenDim - space;
		if(elementDim < 0) {
			elementDim = 0;
		}
		
		//element.css("height", elementHeight + "px");
		return elementDim;
	};


	
	/**
	 * Resizes an element to take the remaining space by substracting the height from all children from that of the parent.
	 * 
	 * 
	 * 
	 */
	$.fn.autoHeight = function() {			
		var element = $(this[0]);
		
		$(window).resize(function() {
			var height = ns.calcDim(element, ns.innerHeight, ns.outerHeight);
			element.css("height", height + "px");
		});		
	};
	
	
	$.fn.autoWidth = function() {
		var element = $(this[0]);

		$(window).resize(function() {
			var width = ns.calcDim(element, ns.innerWidth, ns.outerWidth);
			element.css("width", width + "px");
		});
		
	};

	

	/*
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
	};*/
})(jQuery);


/**
 * Attach scripted layouting and internationalization of the user interface.
 * 
 */
(function($) {

	var config = Namespace("org.aksw.ssb.config");

	var ns = Namespace("org.aksw.ssb.app");
	

	/**
	 * Some elements have scripted layouts.
	 * 
	 */
	$(document).ready(function() {
		
		//$("#wrapper").autoHeight();
		//$("#main").autoHeight();
		//$("#ssb-breadcrumb").autoHeight();

		//$("#content").autoHeight();
		
		/*
		$( ".positionable" ).position({
			of: $( "#parent" ),
			my: $( "#my_horizontal" ).val() + " " + $( "#my_vertical" ).val(),
			at: $( "#at_horizontal" ).val() + " " + $( "#at_vertical" ).val(),
			offset: $( "#offset" ).val(),
			collision: $( "#collision_horizontal" ).val() + " " + $( "#collision_vertical" ).val()
		});*/
		
		$("#main").autoHeight();
		
		//$("#tabs").autoHeight();
		$("#ssb-nav-tabs-content").autoHeight();
		
		//$("#ssb-main-content").autoWidth();

		
		$("#map").autoHeight();
		
		$("#ssb-tabs-start").autoHeight();
		$("#ssb-tabs-start-content").autoHeight();
		
		
		var languageSwitcherSelector = "#edit-lang-dropdown-select";		
		var element = $(languageSwitcherSelector); 
		
		
		$(element).change(function() {
				
			var lang = $(element).val();

			var href = "src/main/resources/i18n/" + lang + "/LC_MESSAGES/messages.po";

			$("#active_lang").attr('href', href);

			ns.updateLang();
			
			//insertParam("lang", lang);
		});


		
		//$(window).resize(function() {


			$('#box-resources').position({
				my: 'left top',
				at: 'left top',
				offset: '60 70',
				of: $('#map')
//				offset: '60 70',
//				of: $('#main')
			});

			$('#box-facts').position({
				my: 'right top',
				at: 'right top',
				offset: '0 70',
				of: $('#map')
//				offset: '0 70',
//				of: $('#main')
			});
			
		//});
		
		
		
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
    	
    	$("#language-switcher").val(config.lang);
   	};
   	
   	

})(jQuery);
