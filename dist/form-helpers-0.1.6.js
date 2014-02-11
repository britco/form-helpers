/*!
 * Form helpers
 * @author Paul Dufour
 * @company Brit + Co
 */
(function(exports, global) {
    global["globals"] = exports;
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
        var parentSelector = ".input.input-select";
        var selector = ".input.input-select select";
        var ids = [];
        var selectified = [];
        arrayRemove = function(arr) {
            var what, a = Array.prototype.slice.call(arguments, 1), L = a.length, ax;
            while (L && arr.length) {
                what = a[--L];
                while ((ax = arr.indexOf(what)) !== -1) {
                    arr.splice(ax, 1);
                }
            }
            return arr;
        };
        (function($) {
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
            $(document).on("everyInsert", selector, function() {
                $(this).selectify();
            });
        })(jQuery);
    });
    $(document).ready(function() {
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
                var autofilled = $(input).filter(":-webkit-autofill").length;
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
        var selector = "input[placeholder]:not([type=submit]):not([type=checkbox]),textarea[placeholder]";
        $(document).on("everyInsert", selector, function() {
            updatePlaceholder.call(this);
        });
        $("body").on("keydown keyup", selector, updatePlaceholder);
        $("body").on("focus", selector, addFocusClass);
        $("body").on("blur", selector, removeFocusClass);
    });
})({}, function() {
    return this;
}());