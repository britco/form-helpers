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
})(jQuery);

$(document).ready(function() {
    var defaults = function(dest, source) {
        for (var k in source) {
            if (dest[k] === void 0) {
                dest[k] = source[k];
            }
            return dest;
        }
    };
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
    (function($) {
        $("select").each(function() {
            if (!$(this).parents(".input").length) {
                var selectClasses = $(this).attr("class");
                $(this).wrap('<div class="input input-select ' + selectClasses + '" />');
            }
        });
        $.fn.selectify = function() {
            this.each(function() {
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
                    events: {}
                };
                var uniqid = ids.length + 1;
                ids.push("");
                var wrapperSelector = "select-wrapper-" + uniqid;
                ctx.wrapperSelector = "." + wrapperSelector;
                var html = '<div class="select-wrapper ' + wrapperSelector + '">';
                var $active = $select.find("option:selected");
                var value = $active.attr("value");
                var label = $active.html();
                html += '<div class="select-active"';
                html += 'data-value="' + value + '"';
                html += 'data-label="' + label + '">';
                html += label + "</div>";
                html += '<ul class="select-options dropdown-options">';
                $.each(options, function(i, option) {
                    var $option = $(option);
                    var value = $option.attr("value");
                    var label = $option.html();
                    html += '<li data-value="' + value + '" data-label="' + label + '">' + label + "</li>";
                });
                html += "</ul>";
                html += "</div>";
                $parent.append(html);
                ctx.$wrapper = $(".select-wrapper", $parent);
                ctx.$active = $(".select-active", $parent);
                ctx.$options = $(".select-options", $parent);
                var styleAttr = ctx.$options.attr("style") || "";
                ctx.$options.css({
                    position: "absolute",
                    top: "-9999px",
                    left: "-9999px",
                    display: "block"
                });
                var minWidth = ctx.$options.outerWidth();
                minWidth += ctx.$wrapper.css("border-left-width").replace(/px$,''/);
                minWidth += ctx.$wrapper.css("border-right-width").replace(/px$,''/);
                ctx.$wrapper.css("min-width", minWidth);
                ctx.$options.attr("style", styleAttr);
                var ns = ".ns_select_" + uniqid;
                ctx.ns = ns;
                $("body").on("click" + ns, ctx, bodyClicked);
                $(".select-active", $parent).on("click" + ns, ctx, selectToggle);
                $(".select-wrapper", $parent).on("destroyed" + ns, ctx, divRemoved);
                $(".select-options li", $parent).on("click" + ns, ctx, clickedItem);
            });
        };
        function bodyClicked(e) {
            if (!$(event.target).closest(e.data.wrapperSelector).length) {
                selectClose(e.data);
            }
        }
        function divRemoved(e) {
            events = e.data.events;
            ns = e.data.ns;
            $select = e.data.$select;
            $("body").off(ns);
            arrayRemove(selectified, $select[0]);
        }
        function clickedItem(e) {
            var $li = $(e.target);
            var label = $li.attr("data-label");
            var value = $li.attr("data-value");
            selectUpdateValue(e.data, label, value);
            selectClose(e.data);
        }
        function selectUpdateValue(data, label, value) {
            data.$select.val(value);
            data.$select.trigger("change");
            data.$active.attr("data-label", label);
            data.$active.attr("data-value", value);
            data.$active.html(label);
        }
        function selectToggle(event) {
            var status = event.data.status;
            if (status === "closed") {
                selectOpen(event.data);
            } else {
                selectClose(event.data);
            }
        }
        function selectOpen(data) {
            data.$options.show();
            $(data.$wrapper).addClass("select-wrapper-open");
            $(data.$active).addClass("select-wrapper-open");
            data.status = "opened";
        }
        function selectClose(data) {
            data.$options.hide();
            $(data.$wrapper).removeClass("select-wrapper-open");
            $(data.$active).removeClass("select-wrapper-open");
            data.status = "closed";
        }
        $(document).on("everyinsert", selector, function() {
            $(this).selectify();
        });
    })(jQuery);
});

$(document).ready(function() {
    var defaults = function(dest, source) {
        for (var k in source) {
            if (dest[k] === void 0) {
                dest[k] = source[k];
            }
            return dest;
        }
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