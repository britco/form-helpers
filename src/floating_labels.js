$(document).ready(function(){
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