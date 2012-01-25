
/**
 * 
 * A quad tree where nodes are loaded on access:
 * 
 * query(bounds):
 * This will
 * 1. locate the n adjacent best matching nodes that fully contain the given bounds*(see below)
 * 2. create the tree down to it. Then it invokes the load callback on it.
 *    The load callback may refuse to load a node if it contains to many elements. In this case it must indicate a minimum number of elements.
 * 
 * 3a. As soon as the node is loaded, the metadata of the parents is updated (minElementCount)
 * 3b. If it happens that all children of a node become loaded, a merge action may be triggered (in case of a merge, the children are removed, and the parent becomes loaded)
 * if the total number of elements does not exceed a threshold.
 * 
 * 
 * 
 * * If we have a small view-rect containing the center of the tree, the only node that is fully contains the view-rect is the root node. 
 *   This is undesirable. For this reason, it is better to collect n nodes from depths below the view rect. 
 * 
 * 
 * callback(node)
 * 
 * @param bounds
 * @param callback
 */
function LazyLoadingQuadTree(bounds, callback) {
	
	
}

/**
 * Query items in the given area.
 * 
 */
LazyLoadingQuadTree.prototype.query = function(bounds, resultCallback) {
	
};





function QuadTree(bounds, maxDepth, k) {
	if(k == undefined) {
		k = 0.25;
	}
	
	this.node = new Node(null, bounds, maxDepth, 0, k);
	//this.maxDepth = maxDepth; 
}


function LazyLoadingNode() {
	this.isLoaded = false;
}



/**
 * Retrieve the node that completely encompasses the given bounds
 * 
 * 
 * @param bounds
 */
QuadTree.prototype.aquireNodes = function(bounds, depth) {
	return this.node.aquireNodes(bounds, depth);
};


QuadTree.prototype.query = function(bounds, depth) {
	return this.node.query(bounds, depth);
};

QuadTree.prototype.insert = function(item) {
	
};


function Point(x, y) {
	this.x = x;
	this.y = y;
}

function Bounds(left, right, bottom, top) {
	this.left = left;
	this.right = right;
	this.bottom = bottom;
	this.top = top;
}


Bounds.prototype.getCenter = function() {
	return new Point(0.5 * (this.left + this.right), 0.5 * (this.bottom + this.top));
};

Bounds.prototype.getWidth = function() {
	return this.right - this.left; 
};

Bounds.prototype.getHeight = function() {
	return this.top - this.bottom;
};


Bounds.prototype.contains = function(bounds) {
	return bounds.left >= this.left && bounds.right <= this.right && bounds.bottom >= this.bottom && bounds.top <= this.top;
};

Bounds.prototype.rangeX = function() {
	return new Range(this.left, this.right);
};

Bounds.prototype.rangeY = function() {
	return new Range(this.bottom, this.top);
};

Bounds.prototype.overlap = function(bounds) {
	if(!bounds.rangeX) {
		console.log("test");
	}
	
	var ox = this.rangeX().getOverlap(bounds.rangeX());
	if(!ox) {
		return null;
	}
	
	var oy = this.rangeY().getOverlap(bounds.rangeY());
	if(!oy) {
		return null;
	}
	
	return new Bounds(ox.min, ox.max, oy.min, oy.max);
};

Bounds.prototype.isOverlap = function(bounds) {
	var tmp = this.overlap(bounds);
	return tmp != null;
};

Bounds.prototype.toString = function() {
	//return "[" + this.left + ", " + this.bottom + ", " + this.right + ", " + this.top + "]"; 
	return "[" + this.left + " - " + this.right + ", " + this.bottom + " - " + this.top + "]";
};

function Range(min, max) {
	this.min = min;
	this.max = max;
}

Range.prototype.getOverlap = function(other) {
	var min = Math.max(this.min, other.min);
	var max = Math.min(this.max, other.max);

	return (min > max) ? null : new Range(min, max); 
};

// Node

function Node(parent, bounds, maxDepth, depth, k) {
	this.parent = parent;	
	this._bounds = bounds;
	this._maxDepth = maxDepth;
	this._depth = depth;
	this._k = k;  // expansion factor for loose quad tree [0, 1[ - recommended range: 0.25-0.5

	this.isLoaded = false;
	this.children = null;
	
	this.data = {};
	
	this._classConstructor = Node;
};

Node.prototype.getBounds = function() {
	return this._bounds;
};

Node.TOP_LEFT = 0;
Node.TOP_RIGHT = 1;
Node.BOTTOM_LEFT = 2;
Node.BOTTOM_RIGHT = 3;


Node.prototype.getCenter = function() {
	return this._bounds.getCenter();
};


Node.prototype.subdivide = function()
{
	var depth = this._depth + 1;
	
	var c = this.getCenter();

	//console.log("k is " + this._k);
	
	// expansions
	var ew = this._k * 0.5 * this._bounds.getWidth();
	var eh = this._k * 0.5 * this._bounds.getHeight();
	
	this.children = [];
	
	this.children[Node.TOP_LEFT] = new this._classConstructor(this, new Bounds(
		this._bounds.left, 
		c.x + ew, 
		c.y - eh,
		this._bounds.top
	), 
	this._maxDepth, depth, this._k);
	
	this.children[Node.TOP_RIGHT] = new this._classConstructor(this, new Bounds(
		c.x - ew, 
		this._bounds.right, 
		c.y - eh,
		this._bounds.top
	),
	this._maxDepth, depth, this._k);
	
	this.children[Node.BOTTOM_LEFT] = new this._classConstructor(this, new Bounds(
		this._bounds.left, 
		c.x + ew, 
		this._bounds.bottom,
		c.y + eh
	),
	this._maxDepth, depth, this._k);

	this.children[Node.BOTTOM_RIGHT] = new this._classConstructor(this, new Bounds(
		c.x - ew, 
		this._bounds.right, 
		this._bounds.bottom,
		c.y + eh
	),
	this._maxDepth, depth, this._k);
	
	
	//console.log("Subdivided " + this._bounds + " into ");
	for(var i in this.children) {
		var child = this.children[i];
		//console.log("    " + child._bounds);
	}
	
};


Node.prototype._findIndexPoint = function(point) {
	var center = this.getCenter(bounds);
	left = point.x < center.x;
	top = point.y > center.y;
	
	var index; 
	if(left) {
		if(top) {
			index = Node.TOP_LEFT;
		} else {
			index = Node.BOTTOM_LEFT;
		};
	} else {
		if(top) {
			index = Node.TOP_RIGHT;
		} else {
			index = Node.BOTTOM_RIGHT;
		};
	}
	
	return index;	
};

Node.prototype._findIndex = function(bounds)
{
	var topLeft = new Point(bounds.left, bounds.top);
	return this._findIndexPoint(topLeft);
};

Node.prototype.getOverlaps = function(bounds) {
	
};



/**
 * Return loaded and leaf nodes within the bounds
 * 
 * @param bounds
 * @param depth The maximum number of levels to go beyond the level derived from the size of bounds
 * @returns {Array}
 */
Node.prototype.query = function(bounds, depth) {
	var result = [];
	
	this.queryRec(bounds, result);
	
	return result;
};

Node.prototype.queryRec = function(bounds, result) {
	if(!this._bounds.isOverlap(bounds)) {
		return;
	}

	var w = bounds.getWidth() / this._bounds.getWidth();
	var h = bounds.getHeight() / this._bounds.getHeight();
	
	var r = Math.max(w, h);
	
	// Stop recursion on encounter of a loaded node or leaf node or node that exceeded the depth limit
	if(this.isLoaded || !this.children || r >= depth) {
		result.push(this);
		return;
	}
	
	for(i in this.children) {
		var child = this.children[i];
		
		child.queryRec(bounds, depth, result);
	}	
};


/**
 * 
 * @param bounds
 * @param depth
 */
Node.prototype.splitFor = function(bounds, depth, result) {
	/*
	console.log("Depth = " + depth);
	console.log(this.getBounds());
	*/
	
	
	/*
	if(depth > 10) {
		result.push(this);
		return;
	}*/
	
	
	if(!this._bounds.isOverlap(bounds)) {
		return;
	}
	
	// If the node is loaded, avoid splitting it
	if(this.isLoaded) {
		if(result) {
			result.push(this);
		}
		return;
	}
	
	// How many times the current node is bigger than the view rect
	var w = bounds.getWidth() / this._bounds.getWidth();
	var h = bounds.getHeight() / this._bounds.getHeight();

	var r = Math.max(w, h);
	
	if(r >= depth || this._depth >= this._maxDepth) {
		if(result) {
			result.push(this);
			//console.log("Added a node");
		}
		return;
	}
	
	if(!this.children) {
		this.subdivide();
	}
	
	for(var i in this.children) {
		var child = this.children[i];
		
		//console.log(child);
		child.splitFor(bounds, depth, result);
	}	
};


Node.prototype.aquireNodes = function(bounds, depth) {
	var result = [];
	
	this.splitFor(bounds, depth, result);
	
	return result;
};


Node.prototype.unlink = function() {
	if(!this.parent) {
		return;
	}
	
	for(i in this.parent.children) {
		var child = this.parent.children[i];
		
		if(child == this) {
			this.parent.children = new Node(this.parent, this._bounds, this._depth, this._k);
		}
	}
	
};


