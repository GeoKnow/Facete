/**
 * Copyright (C) 2011, MOLE research group at AKSW,
 * University of Leipzig
 *
 * SpatialSemanticBrowsingWidgets is free software; you can redistribute
 * it and/or modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 *
 * SpatialSemanticBrowsingWidgets is distributed in the hope that it will
 * be useful, but WITHOUT ANY WARRANTY; without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
(function($) {


$.widget("ui.ssb_facets", {

	// TODO: Add _init method for backward compatibility
	
	_create: function() {

		this.domElement = this.element.get(0);
		
		//this.repaintScheduler = new Scheduler();
		
		//this.instanceToLabel = this.options.instanceToLabel;
		//this.instanceToTypes  = this.options.instanceToType;
		this.schemaIcons = this.options.schemaIcons;	

		
		var self = this;
		
		/*
		$(this.instanceToLabel).bind("changed", function(event, change) {
			self.repaintScheduler.schedule(function() { self.onDataChange(change); });
		});*/
	
		
		this.schemaIcons = this.options.schemaIcons;    //new MapCollection();		
		this.schemaLabels = this.options.schemaLabels;   //new LabelCollection();
		this.classHierarchy = this.options.classHierarchy; //new BidiMultiMap();
		this.activeLanguage = "en";

		
		this.selection = this.options.selection;
		
		// The tree structure derived from the class hierarchy
		this.fullTree = undefined; //{"rootKeys": [], "keyHierarchy": keyHierarchy, "keyToUri": keyToUri};
		
		// uri to view object
		// NOTE one uri maps to multiple nodes, but 1 node only maps to 1 uri
		// so actually we would like a BidiOneToMany map
		this.uriToFacet = {};//new BidiMultiMap();
		
		this.keyToFacetState = {};

		
		// Attach the dynatree widget to an existing <div id="tree"> element
	    // and pass the tree options as an argument to the dynatree() function:
	    $(this.domElement).dynatree({
	    	imagePath: " ",
	    	checkbox: true,
	        onActivate: function(node) {
	            // A DynaTreeNode object is passed to the activation handler
	            // Note: we also get this event, if persistence is on, and the page is reloaded.
	            //alert("You activated " + node.data.title);
	        },
	        onSelect: function(select, node) {
	        	var resource = self.fullTree.keyToUri.getFirst(node.data.key);
	        	
	        	if(select == true) {
	        		self.selection.add(resource);
	        	} else {
	        		self.selection.remove(resource);
	        	}
	        	
	        	self._trigger("changed", {}, {});
	            //alert("You checked " + node.data.title);
	        	//dtnode.visit(function(dtnode){ $("#chb-"+dtnode.data.key).attr("checked",select); },null,true);
	        },
	        persist: true,
	        children: []
	    });
	    

	    /*
	    $(facetElementId).dynatree.onActivate = function(node) {
	        if(node.tree.isUserEvent()){
	        	notify("test", "test");
	        }
	    };*/
	},

    //$.ui.dynatree.nodedatadefaults["icon"] = false;
	
	onMapEvent: function(event, bound) {

		console.log("Facet map event");
		
		// Fetch meta information about the selected area
		this.fetchClasses(bound);
		//this.fetchProperties(bound);
	},


	/*
	getAllSelected: function() {
		var result = [];
		var rootNode = $(this.domElement).dynatree("getRoot");

		this.getAllSelected(rootNode, result);
		

		return result;
	},

	getAllSelected: function(node, result) {
		var children = node.getChildren();
		if(children) {
			for(var i = 0; i < children.length; ++i) {
				var childNode = children[i];
				
				if(childNode.data)
				
				this.getAllSelected(childNode, result);
			}
		}		
	}*/
	
	getSelectedFacets: function() {
		console.log(this.keyToFacetState);
		/*
		var selection = $(this.domElement).dynatree("getSelectedNodes");

		for(var i = 0; i < selection.length; ++i) {
			
		}*/
	},
	
	
	setFacets: function(uriToCount) {

		var facets = uriToCount;
		
		// Add all selected facets
		var sel = this.selection.toArray();
		for(var i = 0; i < sel.length; ++i) {
			var uri = sel[i];
			
			if(!(uri in facets)) {
				facets[uri] = 0;
			}
		}
		
		
		var self = this;

		//console.log("Hierarchy:");
		//console.log(self.classHierarchy);
		
		this.fullTree = computeTreeStructure(this.classHierarchy);
		
		var keys = [];
		var uriToKeys = this.fullTree.keyToUri.inverse.entries;
		
		// console.log(uriToKeys);
		for(var uri in facets) {
			if(uri in uriToKeys) {
				for(var key in uriToKeys[uri]) {
					keys.push(key);
				}
			} 
		}
		
		
		// Include all keys of the currently selected resource
		for(var i in sel) {
			var uri = sel[i];
			for(var key in uriToKeys[uri]) {
				keys.push(key);
			}
		}
		
		
		//console.log("KEYYYs");
		//console.log(keys);
		//console.log(this.selection.toArray());

		var tree = computeTreeStructureExcerpt(this.fullTree, keys);
		
		// Based on the facets and the class hierarchy, derive a tree structure:
		// For all facets, get their parents
		for(var uri in facets) {
			var count = facets[uri];
			
			var label = self.schemaLabels.get(uri, self.activeLanguage); 
			if(!label || label == "(missing label)") {
				var i = uri.lastIndexOf("/");
				
				label = i >= 0 ? uri.substring(i + 1) : uri;
			}
			
			var icon = self.schemaIcons.get(uri);
			if(!icon || icon == "(missing icon)") {
				icon = false;
			}
			var tmp = icon;

			//console.log("icon: " + icon);
			//rootNode.addChild({title: label + " (" + count + ")", icon: tmp});
			/*
			var facet;
			if(!(uri in this.uriToFacet.forward.entries)) {
				facet = {title: "no set"};
				this.uriToFacet.put(uri, facet);
			}*/
			
			if(!(uri in this.uriToFacet)) {
				this.uriToFacet[uri] = {title: "unnamed", icon: null, select:false, visible:false};
			}
			
			var facet = this.uriToFacet[uri];
			
			facet.title = label + " (" + count + ")";
			facet.icon  = tmp;
		}
		
		
		
		//console.log(arguments);
		
		//notify("Debug - wee", JSON.stringify(facets));
		//notify("test", JSON.stringify(arguments));
		var rootNode = $(this.domElement).dynatree("getRoot");

		// Save the state of all children
		this.saveFacetState(rootNode);
		
		rootNode.removeChildren();
		
		//console.log(tree);
		
		this.buildFacetView(rootNode, tree);
		
		/*
		for(var uri in facets) {
			var count = facets[uri];
			
			var label = self.labels.get(uri, self.activeLanguage); 
			if(!label || label == "(missing label)") {
				var i = uri.lastIndexOf("/");
				
				label = i >= 0 ? uri.substring(i + 1) : uri;
			}
			
			var icon = self.icons.get(uri);
			if(!icon || icon == "(missing icon)") {
				icon = "";
			}
			var tmp = icon;

			//console.log("icon: " + icon);
			rootNode.addChild({title: label + " (" + count + ")", icon: tmp});
		}*/
	},
	
	saveFacetState: function(node) {
		//console.log("Saving key " + node.data.key);
		this.keyToFacetState[node.data.key] = {select: node.isSelected(), expand: node.isExpanded(), visible: node.isVisible()};
		
		var children = node.getChildren();
		if(children) {
			for(var i = 0; i < children.length; ++i) {
				this.saveFacetState(children[i]);
			}
		}
	},
	
	
	buildFacetView: function(root, tree) {
		for(var i = 0; i < tree.rootKeys.length; ++i) {
			var key = tree.rootKeys[i];
			
			this.buildFacetViewRec(root, tree, key);
			
			//rootNode.addChild({title: label + " (" + count + ")", icon: tmp});
		}
	},

	buildFacetViewRec: function(node, tree, key) {

		var uri;
		for(var tmp in tree.keyToUri.forward.entries[key]) {
			uri = tmp;
		}
		var facet = this.uriToFacet[uri];
		
		
		if(!facet) {
			console.log("No entry for uri");

			facet = {title:"unnamed - " + key};
		}
		
		
		var facetState = (key in this.keyToFacetState) ? this.keyToFacetState[key] : {};
		

		var childNode = node.addChild({title:facet.title, icon:facet.icon, "key":key, expand: facetState.expand, select:facetState.select, visible: facetState.visible});

		if(facetState.visible === true) {
			childNode.makeVisible();
		}		
		
		
		for(var child in tree.keyHierarchy.inverse.entries[key]) {
			this.buildFacetViewRec(childNode, tree, child);
		}
	}
});

})(jQuery);

