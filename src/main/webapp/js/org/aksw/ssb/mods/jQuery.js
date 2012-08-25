(function($) {


	// Solution from
	// http://stackoverflow.com/questions/1225102/jquery-event-to-trigger-action-when-a-div-is-made-visible
	// Used to layout elements as soon as they are shown
	var _oldShow = $.fn.show;

	$.fn.show = function(speed, oldCallback) {
		alert("test2");
		return $(this).each(function() {
			var obj = $(this), newCallback = function() {
				if ($.isFunction(oldCallback)) {
					oldCallback.apply(obj);
				}

				alert("afterShow raw");
				obj.trigger('afterShow');
			};

			// you can trigger a before show if you want
			obj.trigger('beforeShow');

			// now use the old function to show the element passing the new
			// callback
			_oldShow.apply(obj, [ speed, newCallback ]);
		});
	};

	/*
	var _oldTab = $.fn.tab;

	$.fn.tab = function(arg) {
		alert("test2");
		return $(this).each(function() {
			var obj = $(this);
			/*
			, newCallback = function() {
				if ($.isFunction(oldCallback)) {
					oldCallback.apply(obj);
				}
* /
			//});

			// you can trigger a before show if you want
			obj.trigger('beforeShow');

			// now use the old function to show the element passing the new
			// callback
			_oldTab.apply(obj, [arg]);

			obj.trigger('afterShow');
		});
	};
*/
	
	
})(jQuery);