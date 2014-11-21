/*!
 * Form helpers
 * @author Paul Dufour
 * @company Brit + Co
 */
(function($) {
    $.event.special.destroyed = {
        remove: function(o) {
            if (o.handler && o.type === "destroyed") {
                o.handler(o);
            }
        }
    };
    if (!Element.prototype.scrollIntoViewIfNeeded) {
        Element.prototype.scrollIntoViewIfNeeded = function(centerIfNeeded) {
            centerIfNeeded = arguments.length === 0 ? true : !!centerIfNeeded;
            var parent = this.parentNode, parentComputedStyle = window.getComputedStyle(parent, null), parentBorderTopWidth = parseInt(parentComputedStyle.getPropertyValue("border-top-width")), parentBorderLeftWidth = parseInt(parentComputedStyle.getPropertyValue("border-left-width")), overTop = this.offsetTop - parent.offsetTop < parent.scrollTop, overBottom = this.offsetTop - parent.offsetTop + this.clientHeight - parentBorderTopWidth > parent.scrollTop + parent.clientHeight, overLeft = this.offsetLeft - parent.offsetLeft < parent.scrollLeft, overRight = this.offsetLeft - parent.offsetLeft + this.clientWidth - parentBorderLeftWidth > parent.scrollLeft + parent.clientWidth, alignWithTop = overTop && !overBottom;
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
})(jQuery);

$(document).ready(function() {
    var defaults = function(dest, source) {
        for (var k in source) {
            if (dest[k] === void 0) {
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
    var defaultConfig = {
        selector: '.input.input-select:not([data-fancy-dropdowns="off"]) select',
        beforeActive: '<div class="icon-ui-dropdown-arrow"></div>',
        enabled: true
    };
    window.FormHelpers = window.FormHelpers || {};
    window.FormHelpers.FancyDropdowns = window.FormHelpers.FancyDropdowns || {};
    config = defaults(window.FormHelpers.FancyDropdowns, defaultConfig);
    if (window.FormHelpers.FancyDropdowns.enabled === false) {
        return;
    }
    var selector = config.selector;
    var ids = [];
    var selectified = [];
    $.fn.selectify = function() {
        this.each(function() {
            if (!$(this).parents(".input").length) {
                var selectClasses = $(this).attr("class") ? " " + $(this).attr("class") : "";
                $(this).wrap('<div class="input input-select' + selectClasses + '" />');
            }
            if ($.inArray($(this)[0], selectified) !== -1) {
                return false;
            }
            selectified.push($(this)[0]);
            if (!$(this).is("select")) {
                return false;
            }
            var $select = $(this);
            var options = $select[0].options;
            var $parent = $(this).parents(".input").first();
            var ctx = {
                $select: $select,
                options: options,
                $parent: $parent,
                status: "closed",
                config: config,
                labels: [],
                events: {}
            };
            var uniqid = ids.length + 1;
            ids.push("");
            var wrapperSelector = "select-wrapper-" + uniqid;
            ctx.wrapperSelector = "." + wrapperSelector;
            var html = '<div class="select-wrapper ' + wrapperSelector + '">';
            var $active = $select.find("option:selected");
            var value = $active.attr("value");
            ctx.selected = value;
            var label = $active.html();
            $select.change(function(evt) {
                selectionChanged.call(this, ctx, evt);
            });
            html += '<div class="select-active"';
            html += 'data-value="' + value + '"';
            html += 'data-label="' + label + '">';
            html += config.beforeActive || "";
            html += label + "</div>";
            html += '<ul class="select-options dropdown-options" style="';
            html += "display: block; ";
            html += "visibility: hidden; ";
            html += "max-height: 0; ";
            html += 'overflow: hidden">';
            $.each(options, function(i, option) {
                var $option = $(option);
                var value = $option.attr("value");
                var label = $option.html();
                var labelSlug = label.trim().toLowerCase();
                ctx.labels.push(labelSlug);
                html += '<li class="select-option" data-value="' + value + '" data-label="' + label + '"';
                html += ' data-label-slug="' + labelSlug + '">' + label + "</li>";
            });
            html += "</ul>";
            html += "</div>";
            $parent.append(html);
            ctx.$wrapper = $(".select-wrapper", $parent);
            ctx.$active = $(".select-active", $parent);
            ctx.$options = $(".select-options", $parent);
            var ns = ".ns_select_" + uniqid;
            ctx.ns = ns;
            $("body").on("click" + ns, ctx, bodyClicked);
            $(".select-active", $parent).on("click" + ns, ctx, selectToggle);
            $(".select-wrapper", $parent).on("destroyed" + ns, ctx, divRemoved);
            $(".select-options li", $parent).on("click" + ns, ctx, clickedItem);
            $(".select-options", $parent).on("mouseover" + ns, "li", ctx, hoverOverItem);
        });
    };
    function selectionChanged(ctx, evt) {
        var $allSelected = $(this).find(":selected");
        var value = $allSelected.attr("value");
        var $selectedOptions = ctx.$options.find("[data-value=" + value + "]");
        selectUpdateValue(ctx, $selectedOptions, undefined, false);
    }
    function bodyClicked(e) {
        if (!$(e.target).closest(e.data.wrapperSelector).length) {
            selectClose(e.data);
        }
    }
    function divRemoved(e) {
        events = e.data.events;
        ns = e.data.ns;
        $select = e.data.$select;
        $("body").off(ns);
        $(document).off(ns);
        $(window).off(ns);
        arrayRemove(selectified, $select[0]);
    }
    function clickedItem(e) {
        var $li = $(e.target);
        var label = $li.attr("data-label");
        var value = $li.attr("data-value");
        selectUpdateValue(e.data, $li);
        selectClose(e.data);
    }
    function hoverOverItem(e) {
        selectUpdateHover(e.data, $(e.target));
    }
    function selectUpdateValue(ctx, $li, flash, retrigger) {
        var label = $li.attr("data-label");
        var value = $li.attr("data-value");
        ctx.$select.val(value);
        if (retrigger !== false) {
            ctx.$select.trigger("change");
        }
        ctx.selected = value;
        ctx.$options.find("> li.active").not('li[data-value="' + $li.attr("data-value") + '"]').removeClass("active");
        if (typeof flash !== "undefined") {
            $li.removeClass("active hover");
            window.setTimeout(function() {
                $li.addClass("active");
            }, flash);
        } else {
            $li.addClass("active");
        }
        ctx.$active.attr("data-label", label);
        ctx.$active.attr("data-value", value);
        ctx.$active.html((ctx.config.beforeActive || "") + label);
    }
    function selectUpdateHover(ctx, $li) {
        var action = function() {
            if (ctx.hasOwnProperty("$hover")) {
                ctx.$hover.removeClass("hover");
            }
            ctx.$hover = $li;
            $li.addClass("hover");
        };
        if (window.requestAnimationFrame) {
            window.requestAnimationFrame(action);
        } else {
            action();
        }
    }
    function selectToggle(event) {
        var status = event.data.status;
        if (status === "closed") {
            selectOpen(event.data);
        } else {
            selectClose(event.data);
        }
    }
    function selectOpen(ctx) {
        var search_delay = 475;
        ctx.$options.css({
            visibility: "visible",
            "max-height": "none",
            overflow: "visible"
        });
        $(ctx.$wrapper).addClass("select-wrapper-open");
        $(ctx.$active).addClass("select-wrapper-open");
        ctx.$hover = ctx.$options.find('> li[data-value="' + ctx.selected + '"]');
        ctx.$hover.addClass("active");
        $(document).on("keyup" + ctx.ns + "active", function(e) {
            window.clearTimeout(ctx.updateAndCloseTimeout);
            ctx.search_term = ctx.search_term || "";
            ctx.search_term += String.fromCharCode(e.keyCode).toLowerCase();
            debounce(function() {
                selectSearch.call(this, ctx);
            }, 15)();
        });
        $(document).on("keyup" + ctx.ns + "active", debounce(function(e) {
            ctx.search_term = "";
        }, search_delay));
        $(document).on("keydown" + ctx.ns + "active", function(e) {
            if (e.shiftKey) {
                return;
            }
            if (e.keyCode == 40 || e.keyCode == 38) {
                e.preventDefault();
                if (ctx.hasOwnProperty("$hover") && ctx.$hover.length) {
                    var dir;
                    if (e.keyCode == 40) {
                        dir = "next";
                    } else {
                        dir = "prev";
                    }
                    if (ctx.$hover[dir]("li").length) {
                        var $next = ctx.$hover[dir]("li");
                        selectUpdateHover(ctx, $next);
                        if (Element.prototype.scrollIntoViewIfNeeded) {
                            $next.get(0).scrollIntoViewIfNeeded(true);
                        }
                    }
                }
            }
            if (!e.shiftKey && e.keyCode == 27) {
                selectClose(ctx);
            }
            if (!e.shiftKey && (e.keyCode == 32 || e.keyCode == 13)) {
                if (e.keyCode == 32) {
                    e.preventDefault();
                }
                var updateAndClose = function() {
                    if (ctx.hasOwnProperty("$hover") && ctx.$hover.length) {
                        selectUpdateValue(ctx, ctx.$hover, 80);
                    }
                    window.setTimeout(function() {
                        selectClose(ctx);
                    }, 120);
                };
                if (e.keyCode == 32) {
                    ctx.updateAndCloseTimeout = window.setTimeout(updateAndClose, 60);
                } else {
                    updateAndClose();
                }
            }
        });
        ctx.status = "opened";
    }
    function selectSearch(ctx) {
        var searchTerm = ctx.search_term.trim();
        var match = ctx.$options.find('> li[data-label-slug^="' + searchTerm + '"]').first();
        if (match.length) {
            selectUpdateHover(ctx, match);
            if (Element.prototype.scrollIntoViewIfNeeded) {
                match[0].scrollIntoViewIfNeeded(true);
            }
        }
    }
    function selectClose(data) {
        data.$options.css({
            visibility: "hidden",
            "max-height": "0",
            overflow: "hidden"
        });
        $(document).off("keydown" + data.ns + "active");
        $(document).off("keyup" + data.ns + "active");
        $(data.$wrapper).removeClass("select-wrapper-open");
        $(data.$active).removeClass("select-wrapper-open");
        data.status = "closed";
        $(data.$options).find(" > li.hover").removeClass("hover");
    }
    $(document).on("everyinsert", selector, function() {
        $(this).selectify();
    });
});

$(document).ready(function() {
    var defaults = function(dest, source) {
        for (var k in source) {
            if (dest[k] === void 0) {
                dest[k] = source[k];
            }
        }
        return dest;
    };
    var defaultConfig = {
        enabled: true
    };
    window.FormHelpers = window.FormHelpers || {};
    window.FormHelpers.FloatingLabels = window.FormHelpers.FloatingLabels || {};
    config = defaults(window.FormHelpers.FloatingLabels, defaultConfig);
    if (window.FormHelpers.FloatingLabels.enabled === false) {
        return;
    }
    var isOperaMini = Object.prototype.toString.call(window.operamini) == "[object OperaMini]";
    var isInputSupported = "placeholder" in document.createElement("input") && !isOperaMini;
    if (!isInputSupported) {
        return;
    }
    var autofill_mode = false;
    try {
        $(":-webkit-autofill").first();
        autofill_mode = "webkit";
    } catch (_error) {
        var autofill_mode = false;
    }
    var updatePlaceholder = function() {
        var input = $(this);
        var parent = $(this).parents(".input").first();
        var nearby_labels = $(this).siblings("label");
        if (!nearby_labels.length) {
            placeholder = $(this).attr("placeholder");
            $(this).before("<label>" + placeholder + "</label>");
        }
        window.setTimeout(function() {
            var val = input.val();
            var autofilled = autofill_mode === "webkit" && $(input).filter(":-webkit-autofill").length;
            if (val !== "" || autofilled === true) {
                parent.addClass("label-float-show");
            } else {
                parent.removeClass("label-float-show");
            }
        }, 10);
    };
    var addFocusClass = function() {
        var parent = $(this).parents(".input").first();
        parent.addClass("input-focus");
    };
    var removeFocusClass = function() {
        var parent = $(this).parents(".input").first();
        parent.removeClass("input-focus");
    };
    var selectors = [];
    var parents = [ 'form:not([data-floating-labels="off"]) .input:not([data-floating-labels="off"])', '.input.label-float:not([data-floating-labels="off"])', '.input[data-label-float="on"]:not([data-floating-labels="off"])' ];
    for (var i in parents) {
        var parent = parents[i] + " ";
        selectors.push(parent + "input[placeholder]:not([type=submit]):not([type=checkbox])");
        selectors.push(parent + "textarea[placeholder]");
    }
    selector = selectors.join(", ");
    $(document).on("everyinsert", selector, function() {
        updatePlaceholder.call(this);
    });
    $("body").on("keydown keyup", selector, updatePlaceholder);
    $("body").on("focus", selector, addFocusClass);
    $("body").on("blur", selector, removeFocusClass);
});