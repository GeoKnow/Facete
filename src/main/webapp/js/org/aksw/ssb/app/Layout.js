
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
				
		

		$("#tabs-content-search").parentHeight();
		$("#ssb-tabs-search").parentHeight();
		$("#ssb-tabs-search-content").autoHeight();
		
		
		$("#tabs-content-start").parentHeight();
		$("#ssb-tabs-start").parentHeight();
		$("#ssb-tabs-start-content").autoHeight();

		
		// FIXME HACK for IE7, otherwise the map area has zero height.
		
		setTimeout(function() { $(window).resize(); }, 500);
		
		/*
    	$('.tab-content:parent > ul > li > a').each(function(index, item) {
    		console.log("Showing ", item);
    		$(item).tab('show');
    		$(window).resize();
    	});*/

		
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
			});

			$('#box-resources-secondary').position({
				my: 'right top',
				at: 'right top',
				of: $('#map'),
				offset: '0 70'
			});

			
			$('#box-facts').position({
				my: 'right top',
				at: 'right top',
				of: $('#map'),
				//offset: '0 300'
				offset: '0 70' // [HACK] for LOD2
			});
			
//			$('#box-facts').position({
//				my: 'right top',
//				at: 'right top',
//				offset: '0 70',
//				of: $('#map')
//			});

			
			
			
			
			
		//});
		
		
		
		// Trigger a resize event for doing the layout
		// Note: AppController triggers another resize event once it
		// initialized some further widgets
			
//		setTimeout(function() {
			$(window).resize();
//		}, 500);
		
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
