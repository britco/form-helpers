$(document).ready(function() {
	// Global

	// Functions
	var defaults = function(dest,source) {
		for(var k in source) {
			if(dest[k] === void 0) {
				dest[k] = source[k];
			}

			return dest;
		}
	};

	// arrayRemove([1,2],1);
	// See http://stackoverflow.com/a/3955096
	var arrayRemove = function(arr) {
		var what, a = Array.prototype.slice.call(arguments, 1), L = a.length, ax;
		while (L && arr.length) {
			what = a[--L];
			while ((ax = arr.indexOf(what)) !== -1) {
				arr.splice(ax, 1);
			}
		}
		return arr;
	};

	// Config
	var defaultConfig = {
		selector: '.input.input-select:not([data-fancy-dropdowns="off"]) select',
		enabled: true
	};

	window.FormHelpers = window.FormHelpers || {};
	window.FormHelpers.FancyDropdowns = window.FormHelpers.FancyDropdowns || {};
	config = defaults(window.FormHelpers.FancyDropdowns,defaultConfig);

	// If plugin is not enabled, don't continue
	if(window.FormHelpers.FancyDropdowns.enabled === false) {
		return;
	}

	var selector = config.selector;
	var ids = [];
	var selectified = [];

	// Example:
	// $('body').after('<div class="input input-select"><select><option value="volvo">Volvo</option></select></div>');

	// Wrap all existing selects in <div class="input input-select">..</div>
	$('select').each(function() {
		if(!$(this).parents('.input').length) {
			var selectClasses = $(this).attr('class');
			$(this).wrap('<div class="input input-select '+ selectClasses + '" />');
		}
	});

	// Plugin
	$.fn.selectify = function() {
		// Loop through all elements in jQ obj.
		this.each(function () {
			// Only run once
			if($.inArray($(this)[0],selectified) !== -1) {
				return false;
			}
			selectified.push($(this)[0]);

			// If not running on a select, pass through
			if(!$(this).is('select')) {
				return false;
			}

			// References
			var $select = $(this);
			var options = $select[0].options;
			var $parent = $(this).parents('.input').first();

			// Context object
			var ctx = {
				$select : $select,
				options: options,
				$parent: $parent,
				status: 'closed',
				events: {}
			};

			// Add a unique ID
			var uniqid = ids.length + 1;
			ids.push('');

			// Create new list that will be used as a replacement for the <select>
			var wrapperSelector = 'select-wrapper-' + uniqid;
			ctx.wrapperSelector = '.' + wrapperSelector;
			var html = '<div class="select-wrapper ' + wrapperSelector + '">';

			// Top bar
			var $active = $select.find('option:selected');
			var value = $active.attr('value');
			var label = $active.html();

			html += '<div class="select-active"';
			html += 'data-value="'+ value + '"';
			html += 'data-label="'+ label +'">';
			html += '<div class="icon-ui-dropdown-arrow"></div>';
			html += label + '</div>';

			// Options
			html += '<ul class="select-options dropdown-options" style="';
			html += 'display: block; ';
			html += 'visibility: hidden; ';
			html += 'max-height: 0; ';
			html += 'overflow: hidden">';

			$.each(options, function(i,option) {
				var $option = $(option);
				var value = $option.attr('value');

				// TODO: Escape quotes when in the data-label tag
				var label = $option.html();
				html += '<li data-value="'+ value +'" data-label="'+ label +'">' + label + '</li>';
			});

			html += '</ul>';
			html += '</div>'; // /select-wrapper

			// Append the UL
			$parent.append(html);

			// Add more data
			ctx.$wrapper = $('.select-wrapper', $parent);
			ctx.$active = $('.select-active', $parent);
			ctx.$options = $('.select-options', $parent);

			// Create events
			var ns = '.ns_select_' + uniqid;
			ctx.ns = ns;
			$('body').on('click'+ns, ctx, bodyClicked);
			$('.select-active', $parent).on('click'+ns, ctx, selectToggle);
			$('.select-wrapper', $parent).on('destroyed'+ns, ctx, divRemoved);
			$('.select-options li', $parent).on('click'+ns, ctx, clickedItem);
		});
	};

	// Click anywhere on the body
	function bodyClicked(e) {
		// http://stackoverflow.com/a/1423722
		if(!$(event.target).closest(e.data.wrapperSelector).length) {
			// Close menu when clicking off
			selectClose(e.data);
		}
	}

	// Callback when the select-wrapper is removed
	function divRemoved(e) {
		events = e.data.events;
		ns = e.data.ns;
		$select = e.data.$select;

		// Clean up events
		$('body').off(ns);
		$(window).off(ns);

		// Remove from selectified list
		arrayRemove(selectified, $select[0]);
	}

	// Clicked on any of the select options
	function clickedItem(e) {
		var $li = $(e.target);
		var label = $li.attr('data-label');
		var value = $li.attr('data-value');

		// Forward to update function
		selectUpdateValue(e.data,label,value);

		selectClose(e.data);
	}

	// Update the active value for the select
	function selectUpdateValue(data,label,value) {
		// Update original select
		data.$select.val(value);
		data.$select.trigger('change');

		// Update label
		data.$active.attr('data-label',label);
		data.$active.attr('data-value',value);
		data.$active.html(label);
	}

	// Toggle menu
	function selectToggle(event) {
		// If it's closed, open
		var status = event.data.status;

		if(status === 'closed') {
			selectOpen(event.data);
		} else {
			selectClose(event.data);
		}
	}

	// Open menu
	function selectOpen(data) {
		data.$options.css({
			'visibility': 'visible',
			'max-height': 'none',
			'overflow': 'visible'
		});

		$(data.$wrapper).addClass('select-wrapper-open');
		$(data.$active).addClass('select-wrapper-open');

		// Update status
		data.status = 'opened';
	}

	// Close menu
	function selectClose(data) {
		data.$options.css({
			'visibility': 'hidden',
			'max-height': '0',
			'overflow': 'hidden'
		});

		$(data.$wrapper).removeClass('select-wrapper-open');
		$(data.$active).removeClass('select-wrapper-open');

		// Update status
		data.status = 'closed';
	}

	// Trigger plugin on existing <selects> and new ones that get added
	$(document).on('everyinsert', selector, function() { $(this).selectify(); });
});