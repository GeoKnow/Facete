var Dispatcher = {
    register: function(event, context, functionName) {
    	if(context) {
    		$(this).bind(event, $.proxy(context, functionName));
    	} else {
    		$(this).bind(event, functionName);
    	}
    },

    /*
    registerFn: function(event, fn) {
        $(this).bind(event, fn);
    },
    */

    /**
     * Fires the given event, any additional parameters are passed on
     * @param event
     */
    fireEvent: function(event) {
    	//notify("Args", JSON.stringify(arguments));
    	//console.log(JSON.stringify(arguments));
        $(this).trigger.apply($(this), arguments);
    }
};
