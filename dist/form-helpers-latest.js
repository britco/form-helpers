(function($){
	// Remove event
	$.event.special.destroyed = {
		remove: function(o) {
			if (o.handler && o.type === 'destroyed') {
				o.handler(o);
			}
		}
	};

	// See https://gist.github.com/hsablonniere/2581101
	if (!Element.prototype.scrollIntoViewIfNeeded) {
		Element.prototype.scrollIntoViewIfNeeded = function (centerIfNeeded) {
			centerIfNeeded = arguments.length === 0 ? true : !!centerIfNeeded;

			var parent = this.parentNode,
					parentComputedStyle = window.getComputedStyle(parent, null),
					parentBorderTopWidth = parseInt(parentComputedStyle.getPropertyValue('border-top-width')),
					parentBorderLeftWidth = parseInt(parentComputedStyle.getPropertyValue('border-left-width')),
					overTop = this.offsetTop - parent.offsetTop < parent.scrollTop,
					overBottom = (this.offsetTop - parent.offsetTop + this.clientHeight - parentBorderTopWidth) > (parent.scrollTop + parent.clientHeight),
					overLeft = this.offsetLeft - parent.offsetLeft < parent.scrollLeft,
					overRight = (this.offsetLeft - parent.offsetLeft + this.clientWidth - parentBorderLeftWidth) > (parent.scrollLeft + parent.clientWidth),
					alignWithTop = overTop && !overBottom;

			if ((overTop || overBottom) && centerIfNeeded) {
				parent.scrollTop = this.offsetTop - parent.offsetTop - parent.clientHeight / 2 - parentBorderTopWidth + this.clientHeight / 2;
			}

			if ((overLeft || overRight) && centerIfNeeded) {
				parent.scrollLeft = this.offsetLeft - parent.offsetLeft - parent.clientWidth / 2 - parentBorderLeftWidth + this.clientWidth / 2;
			}

			if ((overTop || overBottom || overLeft || overRight) && !centerIfNeeded) {
				this.scrollIntoView(alignWithTop);
			}
		};
	}
}(jQuery));
/*jshint smarttabs:true */

$(document).ready(function() {
	// Global

	// Functions
	var defaults = function(dest,source) {
		for(var k in source) {
			if(dest[k] === void 0) {
				dest[k] = source[k];
			}
		}

		return dest;
	};

	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			clearTimeout(timeout);
			timeout = setTimeout(function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			}, wait);
				if (immediate && !timeout) func.apply(context, args);
		};
	}

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
		beforeActive: '<div class="icon-ui-dropdown-arrow"></div>',
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

	// Plugin
	$.fn.selectify = function() {
		// Loop through all elements in jQ obj.
		this.each(function () {

			// Wrap select in <div class="input input-select">..</div>
			// if it needs it
			if(!$(this).parents('.input').length) {
				var selectClasses = $(this).attr('class');
				$(this).wrap('<div class="input input-select '+ selectClasses + '" />');
			}

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
				config: config,
				labels: [],
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
			ctx.selected = value;
			var label = $active.html();

			html += '<div class="select-active"';
			html += 'data-value="'+ value + '"';
			html += 'data-label="'+ label +'">';
			html += (config.beforeActive || '');
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
				var labelSlug = label.trim().toLowerCase();
				ctx.labels.push(labelSlug);
				html += '<li class="select-option" data-value="'+ value +'" data-label="'+ label +'"';
				html += ' data-label-slug="' + labelSlug + '">' + label + '</li>';
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
			$('.select-options', $parent).on('mouseover'+ns, 'li', ctx, hoverOverItem);
		});
	};

	// Click anywhere on the body
	function bodyClicked(e) {
		// http://stackoverflow.com/a/1423722
		if(!$(e.target).closest(e.data.wrapperSelector).length) {
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
		$(document).off(ns);
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
		selectUpdateValue(e.data,$li);

		selectClose(e.data);
	}

	function hoverOverItem(e) {
		// Update currently hovered over item
		selectUpdateHover(e.data,$(e.target));
	}

	// Update the active value for the select based on the attributes from $li
	function selectUpdateValue(ctx,$li,flash) {
		var label = $li.attr('data-label');
		var value = $li.attr('data-value');

		// Update original select
		ctx.$select.val(value);
		ctx.$select.trigger('change');

		// Update context with new value
		ctx.selected = value;

		// Update active class
		ctx.$options.find('> li.active')
			 .not('li[data-value="' + $li.attr('data-value') + '"]')
			 .removeClass('active');

		if(typeof(flash) !== "undefined") {
			$li.removeClass('active hover');
			window.setTimeout(function() {
				$li.addClass('active');
			}, flash);
		} else {
			$li.addClass('active');
		}

		// Update label
		ctx.$active.attr('data-label',label);
		ctx.$active.attr('data-value',value);
		ctx.$active.html((ctx.config.beforeActive || '') + label);
	}

	// Update the LI that is currently being hovered on.. Accessible by function
	// for search and what not..
	function selectUpdateHover(ctx,$li) {
		var action = function() {
			if(ctx.hasOwnProperty('$hover')) {
				ctx.$hover.removeClass('hover');
			}

			ctx.$hover = $li;
			$li.addClass('hover');
		};

		if(window.requestAnimationFrame) {
			window.requestAnimationFrame(action);
		} else {
			action();
		}
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
	function selectOpen(ctx) {
		var search_delay = 475;

		ctx.$options.css({
			'visibility': 'visible',
			'max-height': 'none',
			'overflow': 'visible'
		});

		$(ctx.$wrapper).addClass('select-wrapper-open');
		$(ctx.$active).addClass('select-wrapper-open');

		// Add active class to whichever item was active
		ctx.$hover = ctx.$options.find('> li[data-value="' + ctx.selected + '"]');
		ctx.$hover.addClass('active');

		// Bindings for search
		$(document).on('keyup' + ctx.ns + 'active', function(e) {
			// Don't close the dropdown now, because you are probably searching for
			// something
			window.clearTimeout(ctx.updateAndCloseTimeout);

			ctx.search_term = ctx.search_term || '';
			ctx.search_term += String.fromCharCode(e.keyCode).toLowerCase();

			// Do a new search
			debounce(function() {
				selectSearch.call(this,ctx);
			}, 15)();
		});

		$(document).on('keyup' + ctx.ns + 'active', debounce(function(e) {
			ctx.search_term = '';
		}, search_delay));

		$(document).on('keydown' + ctx.ns + 'active', function(e) {
			// 40: down arrow
			// 38: up arrow
			// 27: esc
			if(e.shiftKey) {
				return;
			}

			// Can use arrows to move between items
			if(e.keyCode == 40 || e.keyCode == 38) {
				e.preventDefault();

				if(ctx.hasOwnProperty('$hover') && ctx.$hover.length) {
					var dir;
					if(e.keyCode == 40) {
						dir = 'next';
					} else {
						dir = 'prev';
					}

					if(ctx.$hover[dir]('li').length) {
						var $next = ctx.$hover[dir]('li');
						selectUpdateHover(ctx,$next);

						if (Element.prototype.scrollIntoViewIfNeeded) {
							$next.get(0).scrollIntoViewIfNeeded(true);
						}
					}
				}
			}

			// Esc key, just close
			if (!e.shiftKey && e.keyCode == 27) {
				selectClose(ctx);
			}

			// Change value to hovered-over LI when hitting enter or space
			if(!e.shiftKey && (e.keyCode == 32 || e.keyCode == 13)) {
				// Don't scroll if you hit space when select is open
				if(e.keyCode == 32) {
					e.preventDefault();
				}

				var updateAndClose = function() {
					if(ctx.hasOwnProperty('$hover') && ctx.$hover.length) {
						selectUpdateValue(ctx,ctx.$hover,80);
					}

					window.setTimeout(function() { selectClose(ctx); }, 120);
				};

				if(e.keyCode == 32) {
					// If you hit space bar, wait a little before triggering, because
					// you could be in the middle of a search
					ctx.updateAndCloseTimeout = window.setTimeout(updateAndClose, 60);
				} else {
					updateAndClose();
				}
			}
		});

		// Update status
		ctx.status = 'opened';
	}

	// If there is a matching term, focus on it
	function selectSearch(ctx) {
		var searchTerm = ctx.search_term.trim();
		var match = ctx.$options
									 .find('> li[data-label-slug^="' + searchTerm + '"]')
									 .first();

		if(match.length) {
			// Update the hover state to the new LI
			selectUpdateHover(ctx,match);

			// Scroll to this LI
			if (Element.prototype.scrollIntoViewIfNeeded) {
				match[0].scrollIntoViewIfNeeded(true);
			}
		}
	}

	// Close menu
	function selectClose(data) {
		data.$options.css({
			'visibility': 'hidden',
			'max-height': '0',
			'overflow': 'hidden'
		});

		// Remove active listeners.. listeners that were only active when menu was
		// open
		$(document).off('keydown' + data.ns + 'active');
		$(document).off('keyup' + data.ns + 'active');

		$(data.$wrapper).removeClass('select-wrapper-open');
		$(data.$active).removeClass('select-wrapper-open');

		// Update status
		data.status = 'closed';

		// Clear the hover state
		$(data.$options).find(' > li.hover').removeClass('hover');
	}

	// Trigger plugin on existing <selects> and new ones that get added
	$(document).on('everyinsert', selector, function() { $(this).selectify(); });
});
$(document).ready(function(){
	var defaults = function(dest,source) {
		for(var k in source) {
			if(dest[k] === void 0) {
				dest[k] = source[k];
			}
		}

		return dest;
	};

	// Config
	var defaultConfig = {
		enabled: true
	};

	window.FormHelpers = window.FormHelpers || {};
	window.FormHelpers.FloatingLabels = window.FormHelpers.FloatingLabels || {};
	config = defaults(window.FormHelpers.FloatingLabels,defaultConfig);

	// If plugin is not enabled, don't continue
	if(window.FormHelpers.FloatingLabels.enabled === false) {
		return;
	}

	// If placeholders aren't supported, don't even continue, since this lib
	// will mess with placeholder shiv libraries like jquery.placeholder
	var isOperaMini = Object.prototype.toString.call(window.operamini) == '[object OperaMini]';
	var isInputSupported = 'placeholder' in document.createElement('input') && !isOperaMini;
	if(!isInputSupported) {
		return;
	}

	var autofill_mode = false;
	try {
		$(':-webkit-autofill').first();
		autofill_mode = 'webkit';
	} catch(_error) {
		var autofill_mode = false;
	}

	var updatePlaceholder = function() {
		var input = $(this);

		var parent = $(this).parents('.input').first();

		// Attach a label if there is not one already (won't show until label-
		// float-show class is added)
		var nearby_labels = $(this).siblings('label');

		if(!nearby_labels.length) {
			placeholder = $(this).attr('placeholder');
			$(this).before('<label>' + placeholder + '</label>');
		}

		window.setTimeout(function() {
			// If value is filled in, or autofill is on, show label
			var val = input.val();

			var autofilled = autofill_mode === 'webkit' && $(input).filter(':-webkit-autofill').length;

			if (val !== "" || autofilled === true) {
				parent.addClass('label-float-show');
			} else {
				parent.removeClass('label-float-show');
			}
		}, 10);
	};

	var addFocusClass = function() {
		var parent = $(this).parents('.input').first();

		parent.addClass('input-focus');
	};

	var removeFocusClass = function() {
		var parent = $(this).parents('.input').first();

		parent.removeClass('input-focus');
	};

	var selectors = [];

	var parents = [
	'form:not([data-floating-labels="off"]) .input:not([data-floating-labels="off"])',
	'.input.label-float:not([data-floating-labels="off"])',
	'.input[data-label-float="on"]:not([data-floating-labels="off"])'
	];
	for(var i in parents) {
		var parent = parents[i] + " ";
		selectors.push(parent + "input[placeholder]:not([type=submit]):not([type=checkbox])");
		selectors.push(parent + "textarea[placeholder]");
	}

	selector = selectors.join(', ');

	// Setup functionality on all inputs (existing and new)
	$(document).on('everyinsert', selector, function() {
		updatePlaceholder.call(this);
	});

	// Update placeholders on events
	$('body').on('keydown keyup', selector, updatePlaceholder);
	$('body').on('focus', selector, addFocusClass);
	$('body').on('blur', selector, removeFocusClass);
});