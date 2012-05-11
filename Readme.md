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

# Build System Requirements

- Ruby 1.9.2
- Rake
- Java for running jslint
- Bundler (only if you intend to run the Sinatra web app)


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

# Organization

The structure of this project follows my [template-javascript](https://github.com/dschnare/template-javascript) project. Rake is used as the build system to compile all JavaScript modules and to test all source files via [jslint](http://www.jslint.com/). To see all the Rake tasks run `rake -D`.

In the `web` directory you will find a simple [Sinatra](http://www.sinatrarb.com/) application that can be used for testing (although it isn't necessary since you can run the index.html page by opening it in your web browser).


# Installing

After installing the **Build System Requirements** you can install Sinatra and Foreman by running:

`bundle install`

To run the Sinatra application:

Unix/Linux: `foreman start`
Windows: `bundle exec ruby -Cweb app.rb -p 5000`

Then point your browser to [localhost:5000](http://localhost:5000/).


# Products

Inside the `web/public/inc/scripts` directory you will find the following files:

- util.min.js - Minified source of utiljs
- binder.js - Full source of the binderjs module
- binder.min.js - Minified source of the binderjs module
- binder.all.js - Full source of the binderjs module that has utiljs baked-in
- binder.all.min.js - Minified source of the binderjs module that has utiljs baked-in

`binder.js/binder.min.js` - Will produce the global object `BINDER` when loaded into a web page. If loaded using a module framework like AMD or CommonJS, then will attempt to require the following dependencies: `utiljs`

`binder.all.js/binder.all.min.js` - Will produce the global object `BINDER` when loaded into a web page. If loaded using a module framework like AMD or CommonJS, then will not attempt to require any dependencies.