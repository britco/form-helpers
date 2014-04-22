form-helpers
============

Form helpers.. for forms..

## Floating labels
Javascript for floating labels.

Combines the best of all solutions:
* Works even with elements added after the DOM.
* Allows you to have a different placeholder and label attribute.
* Only targets inputs

Inspiration
* http://codepen.io/lbebber/pen/uEHzD


### Configure:
````
window.FormHelpers = {
	FloatingLabels: {
		enabled: true
	}
};
````

## Fancy dropdowns
* Custom styled dropdowns


### Configure:
````
window.FormHelpers = {
	FancyDropdowns: {
		selector: '.input.input-select:not([data-fancy-dropdowns="off"]) select'
	}
};
````

## Download
[form-helpers-0.1.6.js](https://raw2.github.com/britco/form-helpers/master/dist/form-helpers-0.1.6.js)

## Dependencies
* https://github.com/britco/everyInsert

## Development
CD to root

Install packages:

````
sudo npm install
````

Watch for changes

````
grunt watch
````

## License
Available under the [MIT License](LICENSE.md).
