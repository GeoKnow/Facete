(function() {

	//var strings = Namespace("org.aksw.ssb.utils.strings");
	//var xsd = Namespace("org.aksw.ssb.vocabs.xsd");
	var ns = Namespace('org.aksw.serializer');


	ns.Serializer = function() {
		this.labelToClass = {};
		
		
		this.labelToFnSerialize = {};
		this.labelToFnDeserialize = {};
	};
	

	ns.Serializer.prototype = {
	
		registerOverride: function(classLabel, fnSerialize, fnDeserialize) {
			this.labelToFnSerialize[classLabel] = fnSerialize;
			this.labelToFnDeserialize[classLabel] = fnDeserialize;
		},
			
		indexClasses: function(ns) {
			var tmp = this.findClasses(ns);
			
			_.extend(this.labelToClass, tmp);
			
			return tmp;
		},
		

		findClasses: function(ns) {
			var result = {};
			
			_.each(ns, function(k) {			
				var classLabel = k.classLabel;
				if(classLabel) {
					result[classLabel] = k;
				}			
			});
			
			return result;
		},


		/**
		 * Returns the class label for an instance
		 * 
		 */
		getLabelForClass: function(obj) {
			var objProto = Object.getPrototypeOf(obj);
			
			var result;
			_.find(this.labelToClass, function(ctor, classLabel) {
				if(objProto == ctor.prototype) {
					result = classLabel;
					return true;
				}			
			});

			return result;
		},
		

		getClassForLabel: function(classLabel) {
			var result;
			_.find(this.labelToClass, function(ctor, cl) {
				if(cl === classLabel) {
					result = ctor
					return true;
				}			
			});

			return result;		
		},


		serialize: function(obj) {
			var result;
			
			if(_.isFunction(obj)) {
				result = undefined;
			}
			else if(_.isArray(obj)) {
				result = [];
				
				for(var i = 0; i < obj.length; ++i) {
					var item = obj[i];
					
					var tmp = this.serialize(item);
					result.push(tmp);
				}
			}
			else if(_.isObject(obj)) {
				// Try to figure out the class of the object
				
				
				//var objClassLabel = obj.classLabel;
				
				var classLabel = this.getLabelForClass(obj);

				
				var proto;
				if(classLabel) {
					var clazz = this.getClassForLabel(classLabel);
					
					if(clazz) {
						proto = new clazz();
						//console.log('Class for label ', classLabel, ' is ', clazz, ' with proto ', proto);
					}
				}
					
				
//				if(obj.toJson) {
//					// TODO: There must also be a fromJson method
//					result = obj.toJson();
//				} else {

				result = {}; 
				
				var self = this;
				_.each(obj, function(v, k) {
					
					
					var val = self.serialize(v);
					
					if(proto) {
						var compVal = proto[k];
						var isEqual = _.isEqual(val, compVal) || (val == null && compVal == null); 
						//console.log('is equal: ', isEqual, 'val: ', val, 'compVal: ', compVal);
						if(isEqual) {
							return;
						}
					}
					
					if(!_.isUndefined(val)) {
						result[k] = val;
					}
					//serialize(clazz, k, v);
				});

//				}
				
				if(classLabel) {
					result['classLabel'] = classLabel;
				}
			}
			else {
				result = obj;
				//throw "unhandled case for " + obj;
			}

			return result;
		},

		
		deserialize: function(obj) {
			var result;
			
			if(_.isArray(obj)) {
				result = [];
				
				for(var i = 0; i < obj.length; ++i) {
					var item = obj[i];
					
					var tmp = this.deserialize(item);
					result.push(tmp);
				}
			}
			else if(_.isObject(obj)) {
				

				var classLabel = obj.classLabel;
				
				if(classLabel) {
					var classFn = this.getClassForLabel(classLabel);
					
					if(!classFn) {
						throw 'Unknown class label encountered in deserialization: ' + classLabel;
					}
					
					result = new classFn();
				} else {
					result = {};
				}
				
			
				var self = this;
				_.each(obj, function(v, k) {
					
					if(k === 'classLabel') {
						return;
					}
					
					var val = self.deserialize(v);
					
					result[k] = val;
				});


			} else {
				result = obj;
			}
			
		
			return result;
		}
	};
	
	ns.Serializer.singleton = new ns.Serializer();

})();
