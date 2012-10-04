(function() {

	var ns = Namespace("org.aksw.ssb.utils");
	
	/**
	 * The abbreviator assigns abbreviations to IDs.
	 * In this case it is simlpy numbers.
	 * It is used for assigning numbers/letters to markers on the map based on their id.
	 * 
	 * 
	 * @returns {ns.Abbreviator}
	 */
	ns.Abbreviator = function() {
		
		// the pool of free abbreviations
		this.pool = [];
		
		this.idToCount = {};
		this.idToAbbr = {};

		// The next abbreviation to assign if the pool is empty
		this.nextCount = 1;
		
		// Free a slot for an id after not encountering it for x times: 
		this.preserveCount = 5;
	};
	
	
	ns.Abbreviator.prototype = {

			/**
			 *
			 * Assigns abbreviations to the ids in the order they are passed
			 * 
			 * @param ids An array of ids for which to allocate abbreviations.
			 * @returns A map from id to abbreviation
			 */
			allocAll: function(ids) {
				
				var result = {};
				for(var i = 0; i < ids.length; ++i) {
					
					var id = ids[i];
					var abbr = this.alloc(id);
					
					result[id] = abbr;
				}
				
				return result;
			},
			
			
			/**
			 * Allocates an abbreviation for a single id.
			 * 
			 * 
			 * @param id
			 * @returns
			 */
			alloc: function(id) {
				var result = this.idToAbbr[id];
				
				if(!result) {
					if(this.pool.length > 0) {
						result = this.pool[this.pool.length - 1];
						this.pool.pop();
					} else {
						result = this.nextCount++;
					}
					
					this.idToAbbr[id] = result;
				}
				this.idToCount[id] = 0;

				return result;
			},
			
	
			/**
			 * Advance to the next abbreviation context
			 * All abbreviations that have not been used for a while are added to the pool.
			 * 
			 * FIXME merge consecutive abbrs to free some space
			 * 
			 */
			nextContext: function() {

				var nextIdToCount = {};

				var self = this;
				$.each(this.idToCount, function(id, count) {
					
					if(count > this.preserveCount) {
						var abbr = self.idToAbbr[id];
						
						self.pool.push[abbr];
					} else {
						
						self.idToCount[id] = count + 1;
						
					}
					
				});
				
				// Sort the pool in ascending order, so we pick elements
				// from the end of the array
				this.pool.sort(function(a, b) { return b - a; });
				
				this.idToCount = nextIdToCount;
			}
			
	};
	
})();

