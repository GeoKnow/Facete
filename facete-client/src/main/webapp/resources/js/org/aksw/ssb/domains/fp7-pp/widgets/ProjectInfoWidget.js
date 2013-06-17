(function() {
	
	var stringUtils = Namespace("org.aksw.ssb.utils.strings");
	var widgets = Namespace("org.aksw.ssb.widgets");
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	var facets = Namespace("org.aksw.ssb.facets");
	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");
	var backboneUtils = Namespace("org.aksw.utils.backbone");

	
	var ns = Namespace("org.aksw.ssb.widgets");
	
(function() {
	
	var self = this;
	var ns = this;
	
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


	/*
	this.ItemViewBase2 = Backbone.View.extend({
	    initialize: function(){
	    	_.bindAll(this);
	    	
	    	this.model.bind('change', this.render, this);
	    	this.model.bind('remove', this.unrender, this);
	    },
	    unrender: function() {
	      $(this.el).remove();
	    },
	    remove: function(){
	      this.model.destroy();
	    }
	});
	*/

	this.RowView2 = Backbone.View.extend({
		tagName: 'tr',
	    initialize: function(){
	    	_.bindAll(this);
	    	
	    	//this.model.bind('change', this.render, this);
	    	this.model.bind('remove', this.unrender, this);
	    },
	    render: function() {
	    	var els = this.options.rowItemRenderer(this.model);

	    	var tds = _.map(els, function(el) {
				var td = $('<td></td>');
				td.append(el);
				return td;
			});
	    	
			var $el = this.$el;
			_.each(tds, function(td) {
				$el.append(td);
			});
			
			return this;
	    },
	    unrender: function() {
	      this.$el.remove();
	    }
	});

	/**
	 *
	 */
	this.TableView2 = Backbone.View.extend({
		tagName: 'table',
		attributes: {
			'class': 'table table-condensed table-bordered'
		},
		initialize: function() {
			_.bindAll(this);
			
	    	this.collection.bind('add', this.renderRow, this);
	    	this.collection.bind('reset', this.reset, this);
		},
		render: function() {
			this.collection.each(this.renderRow);
			
			this.trigger('renderDone', this);
			
			return this;
		},
		renderRow: function(model) {
			var rowView = new ns.RowView2({
				model: model,
				rowItemRenderer: this.options.rowItemRenderer
			});
			
			var $rowViewEl = rowView.render().$el;
			this.$el.append($rowViewEl);
		},
		unrender: function() {
			this.$el.remove();
		},
	    reset: function() {
	    	this.$el.empty();
	    	this.render();
	    }
	});
	
	/*
	this.TableViewMap = this.TableViewBase.extend({
		renderRow: function(model) {
			var nameToRenderer = this.nameToRenderer;
			var defaultRenderer = this.defaultRenderer;
			
			_.each(this.columnNames, function(columnName) {
				var renderer = this.nameToRenderer[columName];
				if(!renderer) {
					renderer = defaultRenderer;
				}
				
				
			});
		}
	});
*/
	
	/**
	 * 
	 * I guess I want something like:
	 * 
	 * var MyItemView = ItemViewRowBase.extend({
	 * 	renderMap: { 
	 *      s: CheckBoxView
	 *      p: FoobarView
	 *  }
	 * });
	 * 
	 * 
	 */
	
/*
	this.ItemViewRowBase = this.ItemViewBase2.extend({
		tagName: 'tr',
		render: function() {
			this.constructor.__super__.render.apply(this);
			Backbone.View.prototype.render.apply(this);
			var tds = this.renderRow();
			
			var $el = this.$el;
			_.each(tds, function(td) {
				$el.append(td);
			});
		}
	});
*/ 
	
	this.ItemViewRowBase = Backbone.View.extend({
	    tagName: 'tr',
	    //attributes: {'class': "table"},
	    //attributes: {style: ""},
	    events: { 
	    },    
	    initialize: function(){
	      _.bindAll(this, 'render', 'unrender', 'remove'); // every function that uses 'this' as the current object should be in here

	      this.model.bind('change', this.render, this);
	      this.model.bind('remove', this.unrender, this);
	    },
	    render: function() {
	    
			//this.constructor.__super__.render.apply(this);
	    	Backbone.View.prototype.render.apply(this);

			
			
	      var html;
	      
	      if(typeof(this.renderHtml) === 'function') {
	          html = this.renderHtml();
	      } else {
	          html = "<td>No renderer set or renderer is not a function</td>";
	      }
	    
	      //console.log("Row Status", this.el);
	      
	      this.$el.html(html); 
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
	
	    var template = '<div style="position:relative; width: 100%; height: {height}px;"><div style="position: absolute; right: 0px; background-color: #0080ff; border-color: #00a0ff; width: {width}px;  height: {height}px;">{innerHtml}</div></div>';
	
	
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

			/*
			var templateStr
				= '<td>{partnerLabel}</td>'
				+ '<td>' + self.renderBar(data) + '</td>'
				+*/ 
			
			var result
				= '<td><span>' + partnerLabel + '</span></td>'
				+ '<td style="width: 250px; height: 20px;">' + self.renderBar(data) + '</td>'
				+ '<td>' + stringUtils.formatNumber(a) + '&nbsp;&euro;</td>'
				;
				
		    return result;
		}
	});
	
	this.TableView = widgets.ListView.extend({
		tagName: 'table'
	});
	

	this.PartnerView = this.TableView.extend({
		//el : $("#table"),
		// attributes: {style: {'list-style': 'none'}},
		//collection : viewCollection,
		itemRenderer : new widgets.ItemRendererBackbone(self.ItemViewProject)
	});

	//console.log("PartnerView", this.PartnerView);

	
	
	this.createPartnerQuery = function(projectNode) {
		var concept = widgets.createConceptPartnerState();
		var element = concept.getElement(); 

		
		var projectVar = sparql.Node.v("s");
		//var projectUri = sparql.Node.uri("projectUri")
		
		var query = queryUtils.createQuerySelectElement(element, element
				.getVarsMentioned(), {
			limit : 1000
		});
		
		query.elements.push(new sparql.ElementFilter([new sparql.E_Equals(projectVar, projectNode)]));
		
		
		query.orderBy.push(new sparql.SortCondition(new sparql.ExprVar(
				sparql.Node.v("a"))));

		return query;
	};
	
	this.createPartnerCollection = function(projectNode, sparqlService, labelFetcher) {
		
		var concept = widgets.createConceptPartnerState();
		var element = concept.getElement(); 

		
		var projectVar = sparql.Node.v("s");
		//var projectUri = sparql.Node.uri("projectUri")
		
		var query = queryUtils.createQuerySelectElement(element, element
				.getVarsMentioned(), {
			limit : 1000
		});
		
		query.elements.push(new sparql.ElementFilter([new sparql.E_Equals(projectVar, projectNode)]));
		
		
		query.orderBy.push(new sparql.SortCondition(new sparql.ExprVar(
				sparql.Node.v("a"))));

		//query.offset = 100;


		//TODO: The syncer should pass the result set to a post processor first.
		// TODO: Actually, this sync thing should already be a a backbone collection
		
		var viewCollection = new backboneUtils.BackboneSyncQueryCollection([], {
			sparqlService: sparqlService,
			postProcessor: backboneUtils.createDefaultPostProcessor(labelFetcher),
			query: query
		});

		//viewCollection.sync(query);

		return viewCollection;
	};
	
	
	this.createConceptPartnerState = function() {
		var str
			= "    ?s\n"
			+ "        a fp7-pp-o:Project ;\n"
			+ "        fp7-pp-o:funding ?f .\n"
			+ "\n"
			+ "    ?f\n"
			+ "        fp7-pp-o:amount ?a ;\n"
			+ "        fp7-pp-o:partner ?p ;\n"
			+ "        fp7-pp-o:partnerRole ?pr \n"
			;			
	
		var nsStr = "http://fp7-pp.publicdata.eu/ontology/";
		str = str.replace(/fp7-pp-o:(\S*)/g, "<" + nsStr + "\$1>");

		var s = sparql.Node.v("s");
		
		var vars = sparql.extractSparqlVars(str);
		var element = new sparql.ElementString(str, vars);
		
		var result = new facets.ConceptInt(element, s);
		
		return result;
	};
	
	


}).apply(ns);


})();
