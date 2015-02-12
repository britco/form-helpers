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
		},

		markupEscapeCodes = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#39;',
			'/': '&#x2F;'
		};

	function escapeMarkup(subject) {
		return subject.replace(/[&<>"'\/]/g, function (char) {
			return markupEscapeCodes[char];
		});
	}

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
	}

	// See http://stackoverflow.com/a/4786582/2763703 and
	// http://stackoverflow.com/a/13127566/2763703
	function mapKeyPressToActualCharacter(isShiftKey, characterCode) {
		if (characterCode === 27 || characterCode === 8 || characterCode === 9 || characterCode === 20 || characterCode === 16 || characterCode === 17 || characterCode === 91 || characterCode === 13 || characterCode === 92 || characterCode === 18) {
			return false;
		}

		if (typeof isShiftKey != "boolean" || typeof characterCode != "number") {
			return false;
		}

		var _to_ascii = {
			'188': '44',
			'109': '45',
			'190': '46',
			'191': '47',
			'192': '96',
			'220': '92',
			'222': '39',
			'221': '93',
			'219': '91',
			'173': '45',
			'187': '61', //IE Key codes
			'186': '59', //IE Key codes
			'189': '45' //IE Key codes
		};

		var shiftUps = {
			"96": "~",
			"49": "!",
			"50": "@",
			"51": "#",
			"52": "$",
			"53": "%",
			"54": "^",
			"55": "&",
			"56": "*",
			"57": "(",
			"48": ")",
			"45": "_",
			"61": "+",
			"91": "{",
			"93": "}",
			"92": "|",
			"59": ":",
			"39": "\"",
			"44": "<",
			"46": ">",
			"47": "?"
		};

		if (characterCode in _to_ascii) {
			characterCode = _to_ascii[characterCode];
		}

		var character;

		if (!isShiftKey && (characterCode >= 65 && characterCode <= 90)) {
			character = String.fromCharCode(characterCode + 32);
		} else if (isShiftKey && shiftUps.hasOwnProperty(characterCode)) {
			character = shiftUps[characterCode];
		} else {
			character = String.fromCharCode(characterCode);
		}

		return character;
	}

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
				var selectClasses = $(this).attr('class') ? ' ' + $(this).attr('class') : '';
				$(this).wrap('<div class="input input-select'+ selectClasses + '" />');
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
			html += ' data-value="'+ escapeMarkup(value) + '"';
			html += ' data-label="'+ escapeMarkup(label) +'">';
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

				var label = $option.html();
				var labelSlug = label.trim().toLowerCase();
				ctx.labels.push(labelSlug);
				html += '<li class="select-option" data-value="'+ escapeMarkup(value) +'" data-label="'+ escapeMarkup(label) +'"';
				html += ' data-label-slug="' + escapeMarkup(labelSlug) + '">' + label + '</li>';
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
			$select.on('change'+ns, ctx, selectionChanged);
		});
	};

	// Updates the UI whenever the select element changes
	function selectionChanged(evt) {
		var ctx = evt.data;
		var $allSelected = $(this).find(':selected');
		var value = $allSelected.attr('value');
		var $selectedOptions = ctx.$options.find('[data-value="' + value + '"]');
		selectUpdateValue(ctx, $selectedOptions, undefined, false);
	}

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
	function selectUpdateValue(ctx,$li,flash,retrigger) {
		var label = $li.attr('data-label');
		var value = $li.attr('data-value');

		// Update original select
		ctx.$select.val(value);

		// Fire a change event, but don't allow **our** onChange event to fire.. that
		// is just asking for trouble..
		var ns = ctx.ns;
		ctx.$select.off('change'+ns, selectionChanged);
		if (retrigger !== false) { ctx.$select.trigger('change'); }
		ctx.$select.on('change'+ns, ctx, selectionChanged);

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
			var character = mapKeyPressToActualCharacter(e.shiftKey, e.keyCode);
			if(character != null && character != false) {
				ctx.search_term += (character + '').toLowerCase();
			}

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
		// You shouldn't need to search for escaped and non-escaped, but you do..
		// some things like > will match when escaped, but double quotes will only
		// match when unescaped
		var match = ctx.$options
									 .find(
									 	'> li[data-label-slug^="' + escapeMarkup(searchTerm) + '"],\
									 	 > li[data-label-slug^="' + searchTerm + '"]'
									 )
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
