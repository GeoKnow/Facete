(function($) {

	var config = Namespace("org.aksw.ssb.config"); 

	
	var ns = Namespace("org.aksw.ssb.odp");
	
	
	ns.ajax = function(url) {
			
		/*
		var username = "";
		var password = "";

		var words = CryptoJS.enc.Utf16.parse(username + ":" + password);
		var base64 = CryptoJS.enc.Base64.stringify(words);
		*/

		base64 = "ZWM6ZWNwb3J0YWw=";
		
		var authValue = "Basic " + base64;

		return $.ajax({
			url : url,
			dataType : "json",
			beforeSend : function(req) {
		        req.setRequestHeader("Authorization", authValue);
			}
		});
	};

	
	$(document).ready(function() {

		if(!config.odp) {
			return;
		}
		
		var odp = config.odp;
		
		if(!config.odp.apiUrl) {
			return;
		}
		
		
		var baseUrl = odp.apiUrl;
		
		var urlGetLanguages = baseUrl + "getLanguages";
		var urlGetHeaderMenu = baseUrl + "getHeaderMenu/";

		
		ns.ajax(urlGetLanguages).pipe(function(json) {
			
			
			var lang = $("#language-switcher").val();

			
			// TODO get any currently selected language
			var languageSwitcherSelector = "#language-switcher";
			
			var element = $(languageSwitcherSelector); 			
			element.children().remove();
			
			$.each(json, function(key, value) {
				
				var selected = key === lang ? ' selected="selected"' : "";
				
				element.append('<option value="' + key + '"' + selected + '>' + value + '</option>');
			});
			
			return json;
		});
		
		/*
		$("#language-switcher").change(function() {
				
			var lang = $("#language-switcher").val();
			
			ns.ajax(urlGetHeaderMenu + lang).pipe(function(langToIdToMsg) {
				
				// Workaround: If the lang is not mapped, then empty arrays are returned,
				// rather than empty objects...
				if($.isArray(langToIdToMsg)) {
					return;
				}
				
				var idToMsg = langToIdToMsg(lang);

				//$("org.ec.odp.ssb.ui.label.legal-notice").attr()

				
				
			});
			
		});*/
		
	});

	
})(jQuery);
