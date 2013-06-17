(function() {

	var mathUtils = Namespace("org.aksw.utils.math");
	
	var ns = Namespace("org.aksw.ssb.widgets");
	var widgets = ns;
	
	
	function createLabel(low, high) {
		return mathUtils.roundNumber((low * 0.1), 2) + "% - " + mathUtils.roundNumber((high * 0.1), 2) + "%";
	};

	
	/**
	 * The specification of a slider widget
	 */
	ns.SliderModel = Backbone.Model.extend({
		defaults: {
			range: true,
			min: 0,
			max: 100,
			values: [0, 100],
			slide: function(event, ui) {
			    var low = ui.values[0];
			    var high = ui.values[1];
                var label = createLabel(low, high);
			
                console.log(label);
				//$("#amount").val(label);
			}
		}
	});

	
	ns.ViewSlider = Backbone.View.extend({
	    tagName: 'div',
	    //className: 'pagination pagination-centered',
	    //attributes: {style: 'float: left'},
	    events: {
	    },    
	    initialize: function(){
	    	_.bindAll(this, 'render', 'unrender', 'remove'); // every function that uses 'this' as the current object should be in here

	    	this.model.bind('change', this.render);
	    	this.model.bind('remove', this.unrender);
	    },
	    render: function() {

	    	$(this.el).children().remove();

	    	var html = 
			'<p>' +
			'    <label for="amount">Price range:</label>' + // maybe assign auto generated id
			'    <input type="text" style="border:0; color:#f6931f; font-weight:bold;" />' +
		    '</p>' +
		    '<div></div>'; // id="slider-range"
	    	
	    	
	    	var json = this.model.attributes;
	    					
			/*
					{
				range: true,
				min: 0,
				max: 1000,
				values: [0, 1],
				slide: function(event, ui) {
				    var low = ui.values[0];
				    var high = ui.values[1];
                    var label = percentageRange(low, high);
				
					$("#amount").val(label);
				}
			});
			*/

	    	
	    	$(this.el).html(html); 
			$(this.el, "div:eq(0)").slider(json);
	    	
	    	return this;
	    },
	    unrender: function(){
	      $(this.el).remove();
	    },
	    remove: function(){
	      this.model.destroy();
	    }
	});
	
	

})();