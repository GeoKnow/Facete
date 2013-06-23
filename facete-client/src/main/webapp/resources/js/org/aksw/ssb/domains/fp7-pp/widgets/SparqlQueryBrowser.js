(function() {

		var ns = Namespace("org.aksw.ssb.widgets");
		var uriUtils = Namespace("org.aksw.ssb.utils.uris");
		
	
		ns.createQueryBrowser = function() {
	
			/*
	    	config.sparqlServiceUri = "http://fts.publicdata.eu/sparql";
	
			var sparqlServiceHttp = new backend.SparqlServiceHttp(
			config.sparqlServiceUri, config.defaultGraphUris,
			config.sparqlProxyServiceUri, config.sparqlProxyParamName);
	*/
			/*
			var sparqlService = new backend.SparqlServicePaginator(sparqlServiceHttp, 1000);	
			var labelFetcher = new labelUtils.LabelFetcher(sparqlService);
			*/
	    
	    
	    	var widget = createSparqlExplorer();
	    	var models = widget.models;
	    	//console.log("XModels: ", models);

	    	var tableModel = models.tableModel;

	    	models.model = new Backbone.Model();
	    	

			models.model.on("change:selected", function() {
			    var val = this.get("selected");
			    var node = val.node;
			    
			    if(!node.isUri()) {
			        return;
			    }
			
			    //alert("Switching to: " + node.value);
			    var query = queryUtils.createQueryDescribe(node);
			    var queryFactory = new facets.QueryFactoryQuery(query);
   	    	    tableModel.set({queryFactory: queryFactory});
			});
	    	
						
	
	/*
			var template
				= '<div class="semmap-window" />'
				+ '    <span>Filter:</span>'
				*/
	
//	        var frame = $('<div class="semmap-window" />');
//	        container.append(frame);
			
			var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");

			models.model.on("change:selected", function() {
				var selected = models.model.get("selected");
				var label = selected ? selected.label : null;
				var text = label ? label.value : null;
				
				if(!text) {
					var node = selected.node;
					if(node) {
						if(node.isUri()) {
							text = uriUtils.extractLabelFromUri(node.value);
						} else {
							text = node.value;
						}
					}										
				}
				
				if(text) {
					this.set({title: text});
				}
			});

			
			

			return widget;			

	    	//var createSparqlExplorer = function(sparqlService, queryFactory, containerEl, labelFetcher);
	    };

		ns.createView = function(container, widget, tableViewFactory) {

//				var browseConfig = models.browseConfig;
//		    	var tableModel = browseConfig.config.tableModel;

				//console.log("Widget", widget);
				
				var models = widget.models;
				var tableModel = models.tableModel;

				
				

	    	var MyItemView = ItemViewTd.extend({
				events: {
					'click span': function() {
					    var attr = this.options.attr;
						var o = this.model.get(attr);
						models.model.set({selected: o});
						//alert("Selected: " + node.value);
					}
				}
			});
		
			ns.ViewSpan = Backbone.View.extend({
			
			});
		
			var RowView = Backbone.View.extend({
				tagName: 'tr',
				
				initialize: function(options) {
					//console.log("[RowView] Model: " + JSON.stringify(this.model));
					
				    this.model.on('change', this.reset, this);
				    this.model.on('remove', this.unrender, this);
				    
				    this.columns = options.columns;
				},
				
				render: function() {
					//console.log("[RowView] render()");

					Backbone.View.prototype.render.call(this);
					
				    var cols = this.columns;
                    for(var i = 0; i < cols.length; ++i) {
                         var col = cols[i];
                         
                         viewClass = col.viewClass;
                         var td = null; //view ? view.render().el : 
                         if(viewClass) {
                             var view = new viewClass({model: this.model});
                             var rendered = view.render();
                             td = rendered.el;
                         } else {
                             td = $("<td />");
                         }

						this.$el.append(td);                         
                    }
				
					return this;
				},
				
				unrender: function() {
					this.$el.remove();
				},
			
				reset: function() {
					//console.log("[RowView] reset()");
					
					//this.unrender();
					this.$el.empty();
					this.render();
				}
			});


			var createColumn = function(name) {
				var r = {
					name : name,
					viewClass : MyItemView.extend({
						options : {
							attr : name,
							binding : {
								label : function(model) {
									//console.log("Column Model: ", model);
									var result = getLabel(model, name);
									if (!result) {
										var item = model.get(name);
										if (item) {
											result = item.node.value;
										}
		
										if (!result) {
											//console.log("Null column. Name, Model: ", name, JSON.stringify(model), model);
											
											//model.on('change', function() { alert("Model changed afterwards"); });
											
											result = "(null)";
										}
									}
									return result;
								}
							}
						}
					})
				};

				return r;
			};
			
		
			var TableView = Backbone.View.extend({
				tagName: 'table',
				attributes: {
					//'class': 'table table-bordered table-striped table-condensed',
					'class': 'table table-bordered table-hover table-striped',
					'style': 'margin: 0px'
				},

			    /**
				 * options: colNames: [{id: "http://...", name: "age",
				 * cellRenderer:}]
				 * 
				 */
			    initialize: function(options) {	 
			    	this.collection.bind('add', this.addModel, this);
			    	this.collection.bind('remove', this.removeModel, this);
			    	this.collection.bind('reset', this.reset, this);
			    	
			    	//this.collection.bind('change', this.reset, this);
			    	
			    	
			    	this.model.bind('change', this.reset, this);
			    },

			    render: function() {
			    	Backbone.View.prototype.render.call(this);
			    
			    	var self = this;
					
					var useThreePartTable = true;
					if(useThreePartTable) {
						this.thead = $("<thead />");
						this.tbody = $("<tbody />");

						this.$el.append(this.thead);
						this.$el.append(this.tbody);
					} else {
						this.thead = this.$el;
						this.tbody = this.$el;
					}
		
					this.renderHeader();
		
					this.collection.each(function(model) {
						self.addModel(model);
					});
					
					//console.log("Status: ", this.$el, this.tbody);
					
					return this;
			    },
			    
			    renderHeader: function() {
			        var queryFactory = this.model.get("queryFactory");
			    	var query = queryFactory.createQuery();
			    	if(!query) {
			    	    return;
			    	}
			    	
			    	var vars = query.projectVars.vars;
			    	//console.log("Vars: ", vars);
			    	var columns = [];
			    	this.columns = columns;
			    	for(var i = 0; i < vars.length; ++i) {
			    	    var v = vars[i];
			    	    
			    	    
			    	    //console.log("Creating column with " + v.value);
			    	    columns.push(createColumn(v.value));
			    	}
			    	
			    	var tr = $('<tr />');
			    	
			    	for(var i = 0; i < columns.length; ++i) {
			    		var col = columns[i];
			    		
			    		var label = col.name;
			    		
			    		var th = $('<th>' + label + '</th>'); 
			    		
			    		tr.append(th);
			    	}

			    	this.thead.append(tr);
			    },
			    
			    addModel: function(model) {
					var rowView = new RowView({
						model: model,
						columns: this.columns
					});					

					var rendered = rowView.render();
					this.tbody.append(rendered.el);
			    },
			    unrender: function() {
			    	this.$el.remove();	
			    },
			    reset: function() {
			    	this.$el.empty();			    	
	    			this.render();
			    }
			});

			
			
			//var ViewTableClass = ViewTableCustom ? ViewTableCustom : TableView;

			var tableView;
			
			var options = {
					collection: models.resultSet, //browseConfig.collection,
					model: tableModel
					//options: { attributes: { style: "margin: 0px;" } }
			};
			
			if(tableViewFactory) {
				tableView = tableViewFactory(options);
			} else {
				tableView = new TableView(options);				
			}
					
				var el = tableView.render().el;
		



				var TitleView = Backbone.View.extend({
					tagName: 'h3',
					initialize: function() {
				    	this.model.bind('change', this.render, this);
				    	this.model.bind('remove', this.unrender, this);
					},
					render: function() {
						Backbone.View.prototype.render.call(this);
					
						var title = this.model.get("title");
						if(title) {
							this.$el.text(title);
						}
						return this;
					},
					unrender: function() {
						this.$el.remove();
					}
				});

				//var header = $('<div style="background-color:#F0F0F0; bottom: 0px; padding: 3px; margin: 0px;" />');
				var header = $('<div />');//' style="background-color:#F0F0F0; bottom: 0px; padding: 3px; margin: 0px;" />');
				container.append(header);
				
				var titleView = new TitleView({model: models.model});
				header.append(titleView.render().el);

			
				//header.append($('<span>Filter:</span>'));
				header.append($().ssb.searchBox(models.searchModel).render().el);
				header.append('<br />');
				
				
				var body = $('<div />');
				body.append(el);
				container.append(body);
												
				
				//var footer = $('<div style="background-color:#F0F0F0; height: 26px; bottom: 0px; padding: 3px; margin: 0px;" />');
				var footer = $('<div />'); //style="background-color:#F0F0F0; height: 26px; bottom: 0px; padding: 3px; margin: 0px;" />'); 
				container.append(footer);
				
				footer.append($().ssb.paginator({model: models.paginatorModel}).render().el);

			};

			
})();
