(function($){
	// Remove event
	$.event.special.destroyed = {
		remove: function(o) {
			if (o.handler && o.type === 'destroyed') {
				o.handler(o);
			}
		}
	};

	// http://stackoverflow.com/a/501316
	// http://pygments.org/demo/132921/
	// TODO: Look into optimization
	$.fn._init = $.fn.init;
	$.fn.init = function ( selector, context) {
		var _super = $.fn._init.apply(this, arguments);

		// Save the selector as a string
		if(selector && typeof selector === 'string') {
			if(_super instanceof $) {
				_super.data('selector', selector);
			}
		}

		return _super;
	};
	$.fn.init.prototype = $.fn._init.prototype;

	// `Element added` event
	$.event.special.everyInsert = {
		add: function(handleObj) {
			var preHandler = function(ctx) {
			};

			var _this = this;
			var selector = $(_this).data('selector');

			// Loop through the current elements already inserted
			$(this).each(function() {
				preHandler(this);
				handleObj.handler.call(this);
			});

			// Loop again as a failsafe
			window.setTimeout(function() {
				$(_this).each(function() {
					preHandler(_this);
					handleObj.handler.call(_this);
				});
			}, 19);

			// Listen for new inserts
			if(selector) {
				insertionQ(selector, false, false).every(function(node) {
					preHandler(node);
					handleObj.handler.call(node);
				});
			}
		}
	};

}(jQuery));