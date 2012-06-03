# Overview

Binderjs is am object-oriented property-binding API. See the [reference](https://github.com/dschnare/binderjs/blob/master/Reference.md) for usage and API reference.

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

# Building

Ruby Rake is used to build the purejs module. Use `rake -D` to list all the rake tasks. For more indepth details on the build system for the project see my [project template](https://github.com/dschnare/project-template) repo, of which this project is based.

Use `rake deploy` to perform a build and to have all built files copied to 'web/inc/scripts'. The web project is a unit testing project that uses Qunit.


# Dependencies

**All dependencies are included with this project**

- [Utiljs](https://github.com/dschnare/utiljs) for common utilitiy functions.


# Support

Browsers will be added to the list as testing ensues:

- Chrome
- FireFox 8+
- Safari 5.1+
- IE 7/8/9/10
- Can be loaded as an [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) module
- Can be loaded as a [NodeJS](http://nodejs.org/docs/latest/api/modules.html)/[CommonJS](http://wiki.commonjs.org/wiki/Modules/1.1) module


# Products

Inside the `web/public/inc/scripts` directory you will find the following files:

**src/xport** - The xport module that exports a function used to export symbols for the Closure Compiler (< 1Kb when compiled).

- build/xport.js
- build/xport.min.js

**src/util** - The utiljs module that exports the utiljs API. Depends on the xport module.

- build/util.js
- build/util.min.js
- build/util-complete.js (contains xport module)
- build/util-complete.min.js (contains compiled xport module)

**src/binder** - The binderjs module that exports the binderjs API. Depends on the xport and utiljs modules.

- build/binder.js
- build/binder.min.js
- build/binder-complete.js (contains xport and utiljs modules)
- build/binder-complete.min.js (contains compiled xport and utiljs modules)


`buid/binder.js and build/binder.min.js` - Will produce the global object `BINDER` when loaded into a web page. If loaded using a module framework like AMD or CommonJS, then will attempt to require the following dependencies: `utiljs`

`build/binder-complete.js and build/binder-complete.min.js` - Will produce the global object `BINDER` when loaded into a web page. If loaded using a module framework like AMD or CommonJS, then will not attempt to require any dependencies.