$(document).ready(function(){
	var updatePlaceholder = function() {
		var input = $(this);

		var parent = $(this).parents('.input').first();

		var val = input.val();

		window.setTimeout(function() {
			if (val!=="") {
				parent.addClass('label-float-show');
			} else {
				parent.removeClass('label-float-show');
			}
		}, 1);
	};

	var addFocusClass = function() {
		// Attach a label if there is not one already
		var nearby_labels = $(this).siblings('label');

		if(!nearby_labels.length) {
			placeholder = $(this).attr('placeholder');
			$(this).before('<label>' + placeholder + '</label>');
		}

		var parent = $(this).parents('.input').first();

		parent.addClass('input-focus');
	};

	var removeFocusClass = function() {
		var parent = $(this).parents('.input').first();

		parent.removeClass('input-focus');
	};

	var selector = 'input[placeholder]:not([type=submit]):not([type=checkbox]),textarea[placeholder]';

	$('body').on('keydown', selector, updatePlaceholder);

	$('body').on('keyup', selector, updatePlaceholder);

	$('body').on('focus', selector, addFocusClass);

	$('body').on('blur', selector, removeFocusClass);
});