(function() {
	
	var stringUtils = Namespace("org.aksw.ssb.utils.strings");
	var widgets = Namespace("org.aksw.ssb.widgets");
	var ns = Namespace("org.aksw.ssb.widgets");
	
(function() {
	
	var self = this;
	
	/**
	 * A widget for displaying project information;
	 * 
	 * consists of
	 * - some generic facts (id, instrument, strategic objective, year, call)
	 * - a summary of the fundings of the partners (partner-name, partner-role, funding)
	 * 
	 */
	this.TableView = widgets.ListView.extend({
		tagName: 'table'
	});
		
		
	this.ItemViewRowBase = Backbone.View.extend({
		    tagName: 'tr',
		    //attributes: {style: ""},
		    events: { 
		    },    
		    initialize: function(){
		      _.bindAll(this, 'render', 'unrender', 'remove'); // every function that uses 'this' as the current object should be in here

		      this.model.bind('change', this.render, this);
		      this.model.bind('remove', this.unrender, this);
		    },
		    render: function() {		      
		      var html;
		      
		      if(typeof(this.renderHtml) === 'function') {
		          html = this.renderHtml();
		      } else {
		          html = "<div>No renderer set or renderer is not a function</div>";
		      }
		    
		      $(this.el).html(html); 
		      return this;
		    },
		    unrender: function() {
		      $(this.el).remove();
		    },
		    remove: function(){
		      this.model.destroy();
		    }
	});


    this.renderBar = function(data) {
    
        var template = '<div style="position: absolute; right: 0px; background-color: #0080ff; border-color: #00a0ff; width: {width}px;  height: {height}px;">{innerHtml}</div>';
    
    
        var result = jsontemplate.expand(template, data);
    
 
    	return result;
    };

	this.ItemViewProject = this.ItemViewRowBase.extend({
		renderHtml: function() {
			//console.log("Model", this.model);
			
			var project   = this.model.get("s");
			var partner   = this.model.get("p");
			var partnerRole = this.model.get("pr");
			var partnerAmount = this.model.get("a");
			
			var partnerLabel = partner.label.value; //this.model.get("partnerLabel");
		
		    var a = parseFloat(partnerAmount.node.value);
		
			var ratio = Math.min(a / 1000000.0, 1.0);
			
			var data = {
			    height: 20,
			    width: 200 * ratio,
			    //innerHtml: formatNumber(a)
			    innerHtml: ""
			};
		
		//console.log(data);
		
			var result
				= '<td>' + partnerLabel + '</td>'
				+ '<td style="position: relative; width: 250px">' + self.renderBar(data) + '</td>'
				+ '<td>' + stringUtils.formatNumber(a) + '</td>'
				;
				
		    return result;
		}
	});

}).apply(ns);


})();
