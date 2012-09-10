(function() {

	var ns = Namespace("org.aksw.utils.backbone");

	/**
	 * Returns a key from the model based on the binding.
	 * 
	 * 
	 */
	ns.getModelValue = function(model, key, binding) {
		var b = binding ? binding[key] : null;
		var result;

		if (b) {
			if (typeof b === 'function') {
				return b(model);
			} else {
				return model.get(b);
			}
		} else {
			return model.get(key);
		}
	};

	/**
	 * A seemingly useful routing approach for separating configuration and
	 * behaviour of routers.
	 * 
	 * Usage Example:
	 * 
	 * var appMethods = {...};
	 * 
	 * var AppRouter = backboneUtils.AppRouter.extend({
	 *     routes: {
	 *         ...
	 *     }     
	 * });
	 * 
	 * var appRouter = new AppRouter({app: app});
	 * 
	 * Backbone.history.start();
	 * 
	 * 
	 * Source:
	 * http://lostechies.com/derickbailey/2012/01/02/reducing-backbone-routers-to-nothing-more-than-configuration/
	 * 
	 */
	ns.AppRouter = Backbone.Router.extend({

		constructor : function(options) {
			Backbone.Router.prototype.constructor.call(this, options);

			if (this.routes) {
				this.processAppRoutes(options.app, this.routes);
			}
		},

		processAppRoutes : function(app, appRoutes) {
			var method, methodName;
			var route, routesLength;
			var routes = [];
			var router = this;

			for (route in appRoutes) {
				routes.unshift([ route, appRoutes[route] ]);
			}

			routesLength = routes.length;
			for ( var i = 0; i < routesLength; i++) {

				route = routes[i][0];
				methodName = routes[i][1];
				method = app[methodName];
				router.route(route, methodName, method);

			}
		}

	});
})();