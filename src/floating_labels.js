$(document).ready(function(){
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
			var autofilled = $(input).filter(':-webkit-autofill').length;

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

	var selector = 'input[placeholder]:not([type=submit]):not([type=checkbox]),textarea[placeholder]';

	// Setup functionality on all inputs (existing and new)
	$(document).on('everyInsert', selector, function() {
		updatePlaceholder.call(this);
	});

	// Update placeholders on events
	$('body').on('keydown keyup', selector, updatePlaceholder);
	$('body').on('focus', selector, addFocusClass);
	$('body').on('blur', selector, removeFocusClass);
});