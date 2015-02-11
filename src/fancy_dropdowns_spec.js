describe('fancyDropdowns', function () {
	var options = [
		{ value: "Alabama", name: "Alabama" },
		{ value: "Alaska", name: "Alaska" },
		{ value: "Arizona", name: "Arizona" },
		{ value: "Arkansas", name: "Arkansas" },
		{ value: "California", name: "California" },
		{ value: "Colorado ", name: "Colorado"  },
		{ value: "Connecticut", name: "Connecticut" },
		{ value: "Delaware", name: "Delaware" },
		{ value: "District of Columbia", name: "District of Columbia" },
		{ value: "Florida", name: "Florida" },
		{ value: "Georgia", name: "Georgia" },
		{ value: "Hawaii", name: "Hawaii" },
		{ value: "Idaho", name: "Idaho" },
		{ value: "Illinois", name: "Illinois" },
		{ value: "Indiana", name: "Indiana" },
		{ value: "Iowa", name: "Iowa" },
		{ value: "Kansas", name: "Kansas" },
		{ value: "Kentucky", name: "Kentucky" },
		{ value: "Louisiana", name: "Louisiana" },
		{ value: "Maine", name: "Maine" },
		{ value: "Maryland", name: "Maryland" },
		{ value: "Massachusetts", name: "Massachusetts" },
		{ value: "Michigan", name: "Michigan" },
		{ value: "Minnesota", name: "Minnesota" },
		{ value: "Mississippi", name: "Mississippi" },
		{ value: "Missouri", name: "Missouri" },
		{ value: "Montana", name: "Montana" },
		{ value: "Nebraska", name: "Nebraska" },
		{ value: "Nevada", name: "Nevada" },
		{ value: "New Hampshire", name: "New Hampshire" },
		{ value: "New Jersey", name: "New Jersey" },
		{ value: "New Mexico", name: "New Mexico" },
		{ value: "New York", name: "New York" },
		{ value: "North Carolina", name: "North Carolina" },
		{ value: "North Dakota", name: "North Dakota" },
		{ value: "Ohio", name: "Ohio" },
		{ value: "Oklahoma", name: "Oklahoma" },
		{ value: "Oregon", name: "Oregon" },
		{ value: "Pennsylvania", name: "Pennsylvania" },
		{ value: "Rhode Island", name: "Rhode Island" },
		{ value: "South Carolina", name: "South Carolina" },
		{ value: "South Dakota", name: "South Dakota" },
		{ value: "Tennessee", name: "Tennessee" },
		{ value: "Texas", name: "Texas" },
		{ value: "United States", name: "United States" },
		{ value: "Utah", name: "Utah" },
		{ value: "Vermont", name: "Vermont" },
		{ value: "Virginia", name: "Virginia" },
		{ value: "Washington", name: "Washington" },
		{ value: "West Virginia", name: "West Virginia" },
		{ value: "Wisconsin", name: "Wisconsin" },
		{ value: "Wyoming ", name: "Wyoming " },
	];

	beforeEach(function () {
		var $body,
				$select,
				$option, option, optionIndex;

		$body = jQuery('body');
		$select = jQuery('<select>');

		for (optionIndex in options) {
			option = options[optionIndex];

			$option = jQuery('<option>');
			$option.val(option.value);
			$option.text(option.name);

			$select.append($option);
		}

		$select.appendTo($body);
	});

	beforeEach(function () {
		var numSelects = jQuery('[name=state]').get().length;
		assert(numSelects > 0, 'at least one select element is expected to exist');
	});

	it('does not create a fancy dropdown until requested to', function () {
		var numSelects = jQuery('[name=state]').get().length,
		    numFancyDropdowns = jQuery('.select-wrapper').get().length;

		assert.equal(numFancyDropdowns, 0);
	});

	it('creates a fancy dropdown for each select element', function () {
		var numSelects = jQuery('[name=state]').get().length,
				numFancyDropdowns = jQuery('.select-wrapper').get().length;

		assert.equal(numFancyDropdowns, 0);

		numFancyDropdowns = jQuery('.select-wrapper').get().length;

		this.$select.selectify();
		assert.equal(numSelects, numFancyDropdowns);
	});

	describe('after creating fancy dropdowns', function () {
		beforeEach(function () {
			this.$select.selectify();
		});
	});
});
