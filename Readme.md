# Overview

Binderjs is an object-oriented property-binding API for JavaScript. See the [reference](https://github.com/dschnare/binderjs/blob/master/Reference.md) for usage and API reference.

# Features

- Dynamic property dependency tracking
- EcmaScript-5-firendly list implementation
- Property binding with 'oneway' and 'twoway' behaviour

# Sneek Peek

	// Create a person object that has a firstName and lastName property.
	var person = {
		firstName: BINDER.makeProperty('Darren'),
		lastName: BINDER.makeProperty('Schnare'),
		skills: BINDER.makeProperty(['javascript', 'html', 'css', 'ruby'])
	};

	// Now give our person object a readonly property, fullName, that
	// depends on the values of firstName and lastName.
	person.fullName = BINDER.makeProperty({
		get: function () {
			// We can treat properties like simple values
			// when used in an expression because even
			// though properties are functions they have their
			// 'valueOf' and 'toString' methods overriden
			// to provide the value of the property.
			return this.firstName + ' ' + this.lastName;
		},
		// We have to specify the owner of this property
		// because we are using 'this' inside the property's
		// get operator.
		owner: person
	});

	// When either of the firstName or lastName are changed
	// we will be notified and then we can read the value
	// of fullName and do something with it.
	person.fullName.subscribe(function (fullName) {
		document.getElementById('display-name').innerHTML = fullName();
	});

	// Let's watch our skills too. If they change then we want to do
	// something with them as well.
	person.skills.subscribe(function (skills) {
		document.getElementById('skills').innerHTML = skills().join(', ');
	});


	// So now we have a person model with some data and some observers
	// on the fullName and skills properties. Let's 'prime-the-pump'
	// so to speak by forcing our observers on the fullName and skills
	// properties to be notified and to update the DOM.
	person.fullName.notify();
	person.skills.notify();



	// Sometime later in our code ...

	// Just by setting these properties we cause the fullName
	// property to be notified of their changes then this change
	// is relayed to our observer on fullName. The DOM will be
	// udated each time either of these properties change.
	person.firstName('Super');
	person.lastName('Mario');



	// SIDEBAR: Don't like the functional look of properties? You
	// can replace all occurances of 'property()' and 'property(value)'
	// with 'property.get()' and 'property.set(value)' respectively
	// so it's more clear when a property is accessed vs. mutated.



	// SIDEBAR: If we had wanted to 'batch' the notifications on the
	// fullName property so that way the DOM only gets updated
	// once after both the firstName and lastName properties changed
	// then we could have done something like this:
	// person.fullName.block(); -- Block all notifications on fullName
	// person.firstName('Super'); -- Change firstName
	// person.lastName('Mario'); -- Change lastName
	// person.fullName.unblock(); -- Unblock notifications on fullName
	// person.fullName.notify(); -- Notify only once



	// Likewise with our list of skills any changes will automatically
	// be observed and the DOM will be updated. Here we merge a new list of
	// skills into our existing list of skills so that we get one
	// change notifiaction and the DOM only gets updated once. This has
	// the effect of completely replacing our list of skills with a new list.
	person.skills().mergeWith(['saving princess toadstool', 'beating bowser to a pulp', 'plumbing']);


# Installation

Install locally:

	npm install git://github.com/dschnare/binderjs.git

Or use as a dependency:

	{
		"dependencies": {
			"binderjs": "git://github.com/dschnare/binderjs.git"
		}
	}

If all you want is a minified version of this script and its dependencies so you can simply include it in your web page do the following:

1. Install Node with NPM.
2. Create an empty directory and run the following:

		npm install git://github.com/dschnare/binderjs.git
		cd node_modules/binderjs
		npm install
		npm run-script build-test

3. Copy the source files you want from `node_modules/binderjs/test/js`. The combined script files contain binderjs and all its dependencies.
4. Delete the directory you just created.


# Support

Browsers will be added to the list as testing ensues:

- Chrome
- FireFox 8+
- Safari 5.1+
- IE 7/8/9/10
- Can be loaded as an [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) module
- Can be loaded as a [NodeJS](http://nodejs.org/docs/latest/api/modules.html)/[CommonJS](http://wiki.commonjs.org/wiki/Modules/1.1) module


# Testing

If you want to run the tests then you will need to do the following:

	cd binderjs
	npm install
	npm run-script build-test

Then open `test/index.html` in a web browser. This web page uses QUnit to run several unit tests.

**WARNING:** Do not run `npm install` with the `--dev` option on. This will result in an infinite dependency cycle. The cycle exists somewhere in the hierarchy, in some third-party module and I haven't been able to track it down to tell the author(s). Only run `npm install` with no arguments in the `binderjs` module directory.


# API

If not loaded using a module framework then this module exports `BINDER` in the global namespace.

See the [Reference](https://github.com/dschnare/binderjs/blob/master/Reference.md) file.