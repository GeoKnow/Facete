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
                             td = $('<td />');
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
			
		


			// Synchronize the SPARQL result set variables with the table headings model
			var headCollection = new Backbone.Collection();
			var headModel = new Backbone.Model({
				id: 'head',
				columnIds: [],
				labelMap: {}
			});
			
			headCollection.add(headModel);

			
			tableModel.on('change', function() {
				var model = this;
				var labelMap = model.get('labelMap');
				
				headModel.set({labelMap: labelMap});
			});
			
			//var ViewTableClass = ViewTableCustom ? ViewTableCustom : TableView;

			
//			models.resultSet.on('add remove reset', function() {
//				console.log('dammit', models.resultSet);
//			});
			
			
			var resultCollection = models.resultSet;
			
			var options = {
					model: new widgets.TableModel2({
						headCollection: headCollection,
						bodyCollection: resultCollection,
						tableModel: tableModel
					}),
					
					headRenderer: function(model) {

						var columnIds = model.get('columnIds');
						var labelMap = model.get('labelMap');
						
						var result = [];
						for(var i = 0; i < columnIds.length; ++i) {
							var columnId = columnIds[i];
							
							var label = labelMap[columnId];
							
							if(!label && label !== 0) {
								label = columnId;
							}
							
							//result.push($('<th>' + label + '</th>'));
							result.push($('<th>' + label + '</th>'));
						}
						
						console.log('table heading', result, headCollection.length);
						return result;
						//return [$('<th>test</th>')];
					},
					
					bodyRenderer: function(model) {
						
						var columnIds = headModel.get('columnIds');
						//console.log('Invoked', columnIds, model);

						var result = [];
						for(var i = 0; i < columnIds.length; ++i) {
							var columnId = columnIds[i];
													
							var item = model.get(columnId);

							var text;
							if(item) {
								text = item.node.value;
								
								if(item.node.isUri()) {
									text = '<span data-uri="' + text + '" />';
								}
							}
							else {
								text = '(null)';
							}
							
							result.push($('<td>' + text + '</td>'));							
						}
						
						return result;
					},
					
					bodyEmptyRenderer: function(context) {
						
						var columnStates = context.columnStates;
						var colspan = columnStates ? columnStates.length : 0;
						
						
						return [$('<td colspan="' + colspan + '">No data to be shown</td>')];
					}
			};
			
			
			var tableView;
			if(tableViewFactory) {
				tableView = tableViewFactory(options);
			} else {
				tableView = new widgets.TableView2(options);				
			}
					
			
			
			tableModel.on('change:queryFactory', function() {
				var model = tableModel;
				
		        var queryFactory = model.get('queryFactory');
		        if(!queryFactory) {
		        	return;
		        }
		        
		    	var query = queryFactory.createQuery();
		    	if(!query) {
		    	    return;
		    	}
		    			    	
		    	var vars = query.projectVars.vars;
		    	//console.log("Vars: ", vars);

		    	var columnIds = [];
		    	for(var i = 0; i < vars.length; ++i) {
		    	    var v = vars[i];
		    	    
		    	    var varName = v.value;
		    	    	
		    	    columnIds.push(varName);
		    	    //console.log("Creating column with " + v.value);
		    	    //columns.push(createColumn(varName));
		    	}

		    	headModel.set({
		    		columnIds: columnIds
		    	});
			});
			
			tableModel.trigger('change:queryFactory');
			//tableModel.trigger('change:labelMap');
			
			
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
				
				
				//var header = $('<div class="facete-table-header" />');//' style="background-color:#F0F0F0; bottom: 0px; padding: 3px; margin: 0px;" />');
				var header = $('<table class="facete-table-header" />');
				container.append(header);

				var $tr = $('<tr />');
				header.append($tr);
				
				var $col1 = $('<td />');
				var $col2 = $('<td style="width: 70px; text-align: right" />');
				var $col3 = $('<td style="width: 1px; align: right" />');
				
				$tr.append($col1);
				$tr.append($col2);
				$tr.append($col3);
				
				var titleView = new TitleView({model: models.model});
				//header.append(titleView.render().el);
				//col1.append(titleView.render().el)

			
				//header.append($('<span>Filter:</span>'));
				$col1.append($().ssb.searchBox(models.searchModel).render().el);
				
				

				$col2.append('Max Rows:');
				// Items per page (ipp) switcher
				var $elIpp = $('<select class="facete-table-limit"><option value="10">10</option><option value="20">20</option><option value="30">30</option><option value="50">50</option><option value="75">75</option><option value="100">100</option></select>');
				//header.append($elIpp);
				$col3.append($elIpp);
				
				
				
				$elIpp.on('change', function() {
					var val = $(this).val();

					var itemsPerPage = parseInt(val);
					tableModel.set('limit', itemsPerPage);
					//this.val();
				});
				
				header.append('<br />');
				
				
				container.append(el);
				
//				var body = $('<div />');
//				body.append(el);
//				container.append(body);
												
				
				//var footer = $('<div style="background-color:#F0F0F0; height: 26px; bottom: 0px; padding: 3px; margin: 0px;" />');
				var footer = $('<div class="facete-table-footer" />'); //style="background-color:#F0F0F0; height: 26px; bottom: 0px; padding: 3px; margin: 0px;" />'); 
				container.append(footer);
				
				footer.append($().ssb.paginator({model: models.paginatorModel}).render().el);

				
				return tableView;
			};

			
})();








//// TODO Replace with TableView2
//var TableView = Backbone.View.extend({
//	tagName: 'div',
//	attributes: {
//		style: 'position: relative; width: 100%;'
//	},
////	tagName: 'table',
////	attributes: {
////		//'class': 'table table-bordered table-striped table-condensed',
////		'class': 'table table-bordered table-hover table-striped',
////		'style': 'margin: 0px; position: relative;'
////	},
//
//    /**
//	 * options: colNames: [{id: "http://...", name: "age",
//	 * cellRenderer:}]
//	 * 
//	 */
//    initialize: function(options) {	 
//    	this.collection.bind('add', this.addModel, this);
//    	this.collection.bind('remove', this.removeModel, this);
//    	this.collection.bind('reset', this.reset, this);
//    	
//    	//this.collection.bind('change', this.reset, this);
//    	
//    	
//    	//this.model.bind('change', this.onChange, this);
//    	this.model.bind('change', this.onChange, this);
//    	//this.model.bind('change:isLoadingData', this.onChangeIsLoadingData, this);
//    },
//
//    onChange: function() {
//    	var model = this.model;
//    	
//    	if(model.hasChanged('isLoadingData')) {
//    		// Nothing to do
//    	} else {
//	    	this.reset();			    		
//    	}
//    	
//    },
//    
//    onChangeIsLoadingData: function() {
//    	var model = this.model;
//
//    	var isLoadingData = model.get('isLoadingData');
//    	
//    	var $el = this.$el;
//    	
//    	if(isLoadingData) {
//    	}
//    	
//    	
//    },
//    
//    render: function() {
//    	Backbone.View.prototype.render.call(this);
//    
//    	var self = this;
//		
//		var $el = this.$el;
//
//		var $elTable = $('<table class="table table-bordered table-hover table-striped style="margin: 0px; position: absolute; top: 0px; left: 0px; />');
//		
//		var useThreePartTable = true;
//		if(useThreePartTable) {
//			this.thead = $('<thead />');
//			this.tbody = $('<tbody />');
//
//			$elTable.append(this.thead);
//			$elTable.append(this.tbody);
//		} else {
//			$elTable.thead = this.$el;
//			$elTable.tbody = this.$el;
//		}
//
//		this.renderHeader();
//
//		this.collection.each(function(model) {
//			self.addModel(model);
//		});
//		
//		
//		this.$loading = $('<i class="custom-icon-spinner" style="position:absolute; top: 0px; right = 0px;" /i>');
//		$el.append($loading);
//		
//		//console.log("Status: ", this.$el, this.tbody);
//		
//		return this;
//    },
//    
//    renderHeader: function() {
//        var queryFactory = this.model.get('queryFactory');
//        if(!queryFactory) {
//        	return;
//        }
//        
//    	var query = queryFactory.createQuery();
//    	if(!query) {
//    	    return;
//    	}
//    	
//    	var model = this.model;
//    	
//    	var vars = query.projectVars.vars;
//    	//console.log("Vars: ", vars);
//    	var columns = [];
//    	this.columns = columns;
//    	for(var i = 0; i < vars.length; ++i) {
//    	    var v = vars[i];
//    	    
//    	    var varName = v.value;
//    	    			    	    
//    	    //console.log("Creating column with " + v.value);
//    	    columns.push(createColumn(varName));
//    	}
//    	
//    	var tr = $('<tr />');
//    	
//    	var headerMap = model.get('headerMap');
//
//    	
//    	for(var i = 0; i < columns.length; ++i) {
//    		var col = columns[i];
//    		
//    		var label = col.name;
//    		
//    		
//    	    var mapped = headerMap.get(label);
//    	    if(mapped) {
//    	    	var tmp = mapped.get('label');
//    	    	if(tmp) {
//    	    		label = tmp;
//    	    	}
//    	    }
//
//    		
//    		
//    		var th = $('<th>' + label + '</th>'); 
//    		
//    		tr.append(th);
//    	}
//
//    	this.thead.append(tr);
//    },
//    addModel: function(model) {
//		var rowView = new RowView({
//			model: model,
//			columns: this.columns
//		});					
//
//		var rendered = rowView.render();
//		this.tbody.append(rendered.el);
//    },
//    unrender: function() {
//    	this.$el.remove();	
//    },
//    reset: function() {
//    	this.$el.empty();			    	
//		this.render();
//    }
//});

//console.log("Column Model: ", model);
//var result = getLabel(model, name);
//if (!result) {
//	var item = model.get(name);
//	if (item) {
//		result = item.node.value;
//	}
//
//	if (!result) {
//		//console.log("Null column. Name, Model: ", name, JSON.stringify(model), model);
//		
//		//model.on('change', function() { alert("Model changed afterwards"); });
//		
//		result = "(null)";
//	}
//}
//return result;

//collection: models.resultSet, //browseConfig.collection,
//model: tableModel

//options: { attributes: { style: "margin: 0px;" } }
