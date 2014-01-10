(function($){
	// Remove event
	$.event.special.destroyed = {
		remove: function(o) {
			if (o.handler && o.type === 'destroyed') {
				o.handler(o);
			}
		}
	};
}(jQuery));