(function (binder) {
	'use strict';

	module('Binding Tests');

	function bindingSetup() {
		return {
			p1: binder.makeProperty('Mario'),
			p2: binder.makeProperty('Luigi')
		};
	}

	test('adherence test', function () {
		var o = bindingSetup(),
			p1 = o["p1"],
			p2 = o["p2"];

		raises(function () {
			binder.makeBinding(1, 2);
		}, 'Expect makeBinding to throw an error when called with numbers.');
		raises(function () {
			binder.makeBinding(1, p2);
		}, 'Expect makeBinding to throw an error when called with a number and a property.');
		raises(function () {
			binder.makeBinding(p1, 2);
		}, 'Expect makeBinding to throw an error when called with a number and a property.');
	});

	test('oneWay binding test', function () {
		var o = bindingSetup(),
			p1 = o["p1"],
			p2 = o["p2"],
			binding = binder.makeBinding(p1, p2, 'oneway');

		strictEqual(binding.type(), 'oneway', 'Expect binding to have a type of "oneway"');
		strictEqual(binding.source(), p1, 'Expect binding to have a source equal to p1');
		strictEqual(binding.sink(), p2, 'Expect binding to have a sink equal to p2');
		strictEqual('Mario', p2(), 'Expect p2 to have a value of "Mario"');

		p1('Luigi');

		strictEqual('Luigi', p1(), 'Expect p1 to have a value of "Luigi"');
		strictEqual('Luigi', p2(), 'Expect p2 to have a value of "Luigi"');


		p2('Mario');

		strictEqual('Luigi', p1(), 'Expect p1 to have a value of "Luigi"');
		strictEqual('Mario', p2(), 'Expect p2 to have a value of "Mario"');


		p1('Toad');

		strictEqual('Toad', p1(), 'Expect p1 to have a value of "Toad"');
		strictEqual('Toad', p2(), 'Expect p2 to have a value of "Toad"');
	});

	test('twoWay binding test', function () {
		var o = bindingSetup(),
			p1 = o["p1"],
			p2 = o["p2"],
			binding = binder.makeBinding(p1, p2);

		strictEqual(binding.type(), 'twoway', 'Expect binding to have a type of "twoway"');
		strictEqual(binding.source(), p1, 'Expect binding to have a source equal to p1');
		strictEqual(binding.sink(), p2, 'Expect binding to have a sink equal to p2');
		strictEqual(p2(), 'Mario', 'Expect p2 to have a value of "Mario"');

		p1('Luigi');

		strictEqual(p1(), 'Luigi', 'Expect p1 to have a value of "Luigi"');
		strictEqual(p2(), 'Luigi', 'Expect p2 to have a value of "Luigi"');


		p2('Princess');

		strictEqual(p1(), 'Princess', 'Expect p1 to have a value of "Princess"');
		strictEqual(p2(), 'Princess', 'Expect p2 to have a value of "Princess"');


		p1('Toad');

		strictEqual(p1(), 'Toad', 'Expect p1 to have a value of "Toad"');
		strictEqual(p2(), 'Toad', 'Expect p2 to have a value of "Toad"');
	});

	test('once binding test', function () {
		var o = bindingSetup(),
			p1 = o["p1"],
			p2 = o["p2"],
			binding = binder.makeBinding(p1, p2, 'once');

		strictEqual(binding.type(), 'once', 'Expect binding to have a type of "once"');
		strictEqual(binding.source(), p1, 'Expect binding to have a source equal to p1');
		strictEqual(binding.sink(), p2, 'Expect binding to have a sink equal to p2');
		strictEqual(p2(), 'Mario', 'Expect p2 to have a value of "Mario"');

		p1('Luigi');

		strictEqual(p1(), 'Luigi', 'Expect p1 to have a value of "Luigi"');
		strictEqual(p2(), 'Mario', 'Expect p2 to have a value of "Mario"');


		p2('Princess');

		strictEqual(p1(), 'Luigi', 'Expect p1 to have a value of "Luigi"');
		strictEqual(p2(), 'Princess', 'Expect p2 to have a value of "Princess"');


		p1('Toad');

		strictEqual(p1(), 'Toad', 'Expect p1 to have a value of "Toad"');
		strictEqual(p2(), 'Princess', 'Expect p2 to have a value of "Princess"');
	});
	module('From JSON Tests');

	test('simple fromJSON test', function () {
		var model,
			o = {
				firstName: 'Darren',
				lastName: 'Schnare',
				skills: ['javascript', 'html', 'css', 'ruby'],
				team: [{
					firstName: 'Alex',
					lastName: 'Grendo'
				}, {
					firstName: 'Sam',
					lastName: 'Hilto'
				}, {
					firstName: 'James',
					lastName: 'Wazzabi'
				}]
			};

		model = binder.fromJSON(o);

		strictEqual(typeof model.firstName, 'function', 'Expect model.firstName to be a function');
		strictEqual(model.firstName(), 'Darren', 'Expect model.firstName() to equal "Darren"');
		strictEqual(typeof model.lastName, 'function', 'Expect model.lastName to be a function');
		strictEqual(model.lastName(), 'Schnare', 'Expect model.lastName() to equal "Schnare"');
		strictEqual(typeof model.skills, 'function', 'Expect model.skills to be a function');
		ok(binder.utiljs.isArray(model.skills()), 'Expect model.skills() to be an Array');
		strictEqual(model.skills().join(','), 'javascript,html,css,ruby', 'Expect model.skills() to equal [javascript, html, css, ruby]');
		strictEqual(typeof model.team, 'function', 'Expect model.team to be a function');
		ok(binder.utiljs.isArray(model.team()), 'Expect model.team() to be an Array');
		strictEqual(model.team()[0].firstName(), 'Alex', 'Expect model.team()[0].firstName() to equal "Alex"');
		strictEqual(model.team()[0].lastName(), 'Grendo', 'Expect model.team()[0].lastName() to equal "Grendo"');
		strictEqual(model.team()[1].firstName(), 'Sam', 'Expect model.team()[1].firstName() to equal "Sam"');
		strictEqual(model.team()[1].lastName(), 'Hilto', 'Expect model.team()[1].lastName() to equal "Hilto"');
		strictEqual(model.team()[2].firstName(), 'James', 'Expect model.team()[2].firstName() to equal "James"');
		strictEqual(model.team()[2].lastName(), 'Wazzabi', 'Expect model.team()[2].lastName() to equal "Wazzabi"');
	});

	test('custom fromJSON test', function () {
		var model,
			o = {
				firstName: 'Darren',
				lastName: 'Schnare',
				skills: ['javascript', 'html', 'css', 'ruby'],
				team: [{
					firstName: 'Alex',
					lastName: 'Grendo'
				}, {
					firstName: 'Sam',
					lastName: 'Hilto'
				}, {
					firstName: 'James',
					lastName: 'Wazzabi'
				}]
			};

		model = binder.fromJSON(o, {
			filter: function (model, json) {
				model.fullName = binder.makeProperty(function () {
					return model.firstName + ' ' + model.lastName;
				});
				return model;
			},
			properties: {
				skills: function (model, json) {
					return json.charAt(0).toUpperCase() + json.substring(1);
				},
				team: {
					exclude: ['firstName', 'lastName'],
					filter: function (model, json) {
						model.name = binder.makeProperty(json.firstName + ' ' + json.lastName);
						return model;
					}
				}
			}
		});

		strictEqual(typeof model.firstName, 'function', 'Expect model.firstName to be a function');
		strictEqual(model.firstName(), 'Darren', 'Expect model.firstName() to equal "Darren"');
		strictEqual(typeof model.lastName, 'function', 'Expect model.lastName to be a function');
		strictEqual(model.lastName(), 'Schnare', 'Expect model.lastName() to equal "Schnare"');
		strictEqual(model.fullName(), 'Darren Schnare', 'Expect model.fullName() to equal "Darren Schnare"');
		strictEqual(typeof model.skills, 'function', 'Expect model.skills to be a function');
		ok(binder.utiljs.isArray(model.skills()), 'Expect model.skills() to be an Array');
		strictEqual(model.skills().join(','), 'Javascript,Html,Css,Ruby', 'Expect model.skills() to equal [Javascript, Html, Css, Ruby]');
		strictEqual(typeof model.team, 'function', 'Expect model.team to be a function');
		ok(binder.utiljs.isArray(model.team()), 'Expect model.team() to be an Array');
		strictEqual(model.team()[0].name(), 'Alex Grendo', 'Expect model.team()[0].name() to equal "Alex Grendo"');
		strictEqual(model.team()[0].firstName, undefined, 'Expect model.team()[0].firstName to equal undefined');
		strictEqual(model.team()[0].lastName, undefined, 'Expect model.team()[0].lastName to equal undefined');
		strictEqual(model.team()[1].name(), 'Sam Hilto', 'Expect model.team()[1].name() to equal "Sam Hilto"');
		strictEqual(model.team()[1].firstName, undefined, 'Expect model.team()[1].firstName to equal undefined');
		strictEqual(model.team()[1].lastName, undefined, 'Expect model.team()[1].lastName to equal undefined');
		strictEqual(model.team()[2].name(), 'James Wazzabi', 'Expect model.team()[2].name() to equal "James Wazzabi"');
		strictEqual(model.team()[2].firstName, undefined, 'Expect model.team()[2].firstName to equal undefined');
		strictEqual(model.team()[2].lastName, undefined, 'Expect model.team()[2].lastName to equal undefined');
	});
	module('To JSON Tests');

	test('simple toJSON test', function () {
		var o,
			model = {
				firstName: binder.makeProperty('Darren'),
				lastName: binder.makeProperty('Schnare'),
				skills: binder.makeProperty(['javascript', 'html', 'css', 'ruby']),
				team: [{
					firstName: binder.makeProperty('Alex'),
					lastName: binder.makeProperty('Grendo')
				}, {
					firstName: binder.makeProperty('Sam'),
					lastName: binder.makeProperty('Hilto')
				}, {
					firstName: binder.makeProperty('James'),
					lastName: binder.makeProperty('Wazzabi')
				}]
			};

		model.fullName = binder.makeProperty(function () {
			return model.firstName + ' ' + model.lastName;
		});

		o = binder.toJSON(model);

		strictEqual(o.firstName, 'Darren', 'Expect o.firstName to equal "Darren"');
		strictEqual(o.lastName, 'Schnare', 'Expect o.lastName to equal "Schnare"');
		strictEqual(o.fullName, 'Darren Schnare', 'Expect o.fullName to equal "Darren Schnare"');
		ok(binder.utiljs.isArray(o.skills), 'Expect o.skills to be an Array');
		strictEqual(o.skills.join(','), 'javascript,html,css,ruby', 'Expect o.skills to equal [javascript, html, css, ruby]');
		ok(binder.utiljs.isArray(o.team), 'Expect o.team to be an Array');
		strictEqual(o.team[0].firstName, 'Alex', 'Expect o.team[0].firstName to equal "Alex"');
		strictEqual(o.team[0].lastName, 'Grendo', 'Expect o.team[0].lastName to equal "Grendo"');
		strictEqual(o.team[1].firstName, 'Sam', 'Expect o.team[1].firstName to equal "Sam"');
		strictEqual(o.team[1].lastName, 'Hilto', 'Expect o.team[1].lastName to equal "Hilto"');
		strictEqual(o.team[2].firstName, 'James', 'Expect o.team[2].firstName to equal "James"');
		strictEqual(o.team[2].lastName, 'Wazzabi', 'Expect o.team[2].lastName to equal "Wazzabi"');
	});

	test('custom toJSON test', function () {
		var o,
			model = {
				firstName: binder.makeProperty('Darren'),
				lastName: binder.makeProperty('Schnare'),
				skills: binder.makeProperty(['javascript', 'html', 'css', 'ruby']),
				team: [{
					firstName: binder.makeProperty('Alex'),
					lastName: binder.makeProperty('Grendo')
				}, {
					firstName: binder.makeProperty('Sam'),
					lastName: binder.makeProperty('Hilto')
				}, {
					firstName: binder.makeProperty('James'),
					lastName: binder.makeProperty('Wazzabi')
				}]
			};

		model.fullName = binder.makeProperty(function () {
			return model.firstName + ' ' + model.lastName;
		});

		o = binder.toJSON(model, {
			exclude: ['fullName'],
			properties: {
				skills: function (skill) {
					return skill.charAt(0).toUpperCase() + skill.substring(1);
				},
				team: {
					exclude: ['firstName', 'lastName'],
					filter: function (json, original) {
						json.name = original.firstName + ' ' + original.lastName;
						return json;
					}
				}
			}
		});

		strictEqual(o.firstName, 'Darren', 'Expect o.firstName to equal "Darren"');
		strictEqual(o.lastName, 'Schnare', 'Expect o.lastName to equal "Schnare"');
		strictEqual(o.fullName, undefined, 'Expect o.fullName to equal undefined');
		ok(binder.utiljs.isArray(o.skills), 'Expect o.skills to be an Array');
		strictEqual(o.skills.join(','), 'Javascript,Html,Css,Ruby', 'Expect o.skills to equal [Javascript, Html, Css, Ruby]');
		ok(binder.utiljs.isArray(o.team), 'Expect o.team to be an Array');
		strictEqual(o.team[0].name, 'Alex Grendo', 'Expect o.team[0].name to equal "Alex Grendo"');
		strictEqual(o.team[0].firstName, undefined, 'Expect o.team[0].firstName to equal undefined');
		strictEqual(o.team[0].lastName, undefined, 'Expect o.team[0].lastName to equal undefined');
		strictEqual(o.team[1].name, 'Sam Hilto', 'Expect o.team[1].name to equal "Sam Hilto"');
		strictEqual(o.team[1].firstName, undefined, 'Expect o.team[1].firstName to equal undefined');
		strictEqual(o.team[1].lastName, undefined, 'Expect o.team[1].lastName to equal undefined');
		strictEqual(o.team[2].name, 'James Wazzabi', 'Expect o.team[2].name to equal "James Wazzabi"');
		strictEqual(o.team[2].firstName, undefined, 'Expect o.team[2].firstName to equal undefined');
		strictEqual(o.team[2].lastName, undefined, 'Expect o.team[2].lastName to equal undefined');
	});
	module('Property Tests');

	function testArrayProperty(p) {
		strictEqual(p.toString(), '1,2,3', 'Expect "p.toString()" to be equal to "1,2,3"');
		strictEqual(p().join(','), '1,2,3', 'Expect "p().join(",")" to be equal to "1,2,3"');
		strictEqual(p.get().join(','), '1,2,3', 'Expect "p.get().join(",")" to be equal to "1,2,3"');
		strictEqual(p.valueOf().join(','), '1,2,3', 'Expect "p.valueOf().join(",")" to be equal to "1,2,3"');

		p().push(4);

		strictEqual(p.valueOf().join(','), '1,2,3,4', 'Expect "p.valueOf().join(",")" to be equal to "1,2,3,4"');

		var notified = false;
		p.subscribe(function () {
			notified = true;
		});


		notified = false;
		p().remove(1);
		ok(notified, 'Expect the property to be notified when the first element is removed');

		notified = false;
		p().clear();
		ok(notified, 'Expect the property to be notified when the list is cleared');

		notified = false;
		p().push(1, 2, 3);
		ok(notified, 'Expect the property to be notified when new items are pushed onto the list');

		notified = false;
		p().pop();
		ok(notified, 'Expect the property to be notified when an item is popped off the list');

		notified = false;
		p().shift();
		ok(notified, 'Expect the property to be notified when item is removed from front of list');

		notified = false;
		p().unshift(1);
		ok(notified, 'Expect the property to be notified when item is prepended to front of list');

		notified = false;
		p().splice(0, 1);
		ok(notified, 'Expect the property to be notified when the list is spliced');

		notified = false;
		p().splice(0, 0);
		notStrictEqual(notified, true, 'Expect the property to be notified when the list is spliced but zero elements are removed and added');

		p().push(10);
		notified = false;
		p().sort();
		ok(notified, 'Expect the property to be notified when the list is sorted');

		notified = false;
		p().insert(0, 11);
		ok(notified, 'Expect the property to be notified when an item is inserted');

		notified = false;
		p().reverse();
		ok(notified, 'Expect the property to be notified when the list is reversed');

		notified = false;
		p().replaceAt(0, 99);
		ok(notified, 'Expect the property to be notified when an item is replaced');

		notified = false;
		p()[0] = undefined;
		p().collapse();
		ok(notified, 'Expect the property to be notified when a sparse list is collapsed');
	}

	test('adherence test', function () {
		var p = binder.makeProperty('value');

		ok(binder.utiljs.adheresTo(p, binder.makeProperty.interfce), 'Expect "p" to adhere to the "binder.makeProperty.interfce" interface');
		notStrictEqual(p.isDependent(), true, 'Expect "p" to not be dependent');
		strictEqual(p.dependencies().length, 0, 'Expect "p" to have no dependencies');
		strictEqual(p.toString(), 'value', 'Expect "p.toString()" to be equal to "value"');
		strictEqual(p.valueOf(), 'value', 'Expect "p.valueOf()" to be equal to "value"');
		strictEqual(p.get(), 'value', 'Expect "p.get()" to be equal to "value"');
		strictEqual(p(), 'value', 'Expect "p()" to be equal to "value"');


		p('value2');

		strictEqual(p.toString(), 'value2', 'Expect "p.toString()" to be equal to "value2"');
		strictEqual(p.valueOf(), 'value2', 'Expect "p.valueOf()" to be equal to "value2"');
		strictEqual(p.get(), 'value2', 'Expect "p.get()" to be equal to "value2"');
		strictEqual(p(), 'value2', 'Expect "p()" to be equal to "value2"');


		p.set('value3');

		strictEqual(p.toString(), 'value3', 'Expect "p.toString()" to be equal to "value3"');
		strictEqual(p.valueOf(), 'value3', 'Expect "p.valueOf()" to be equal to "value3"');
		strictEqual(p.get(), 'value3', 'Expect "p.get()" to be equal to "value3"');
		strictEqual(p(), 'value3', 'Expect "p()" to be equal to "value3"');

		p.dispose();
	});

	test('dependcies test', function () {
		var fname = binder.makeProperty('Super'),
			lname = binder.makeProperty('Mario'),
			notified = false,
			fullName = binder.makeProperty(function () {
				return fname + ' ' + lname;
			}),
			deps = fullName.dependencies();

		ok(fullName.isDependent(), 'Expect "fullName" to be dependent');
		ok(deps.contains(fname) && deps.contains(lname), 'Expect "fullName" to be dependent on "fname" and "lname"');
		strictEqual(fullName(), 'Super Mario', 'Expect "fullName()" to be equal to "Super Mario"');


		fullName.subscribe(function () {
			notified = true;
		});
		fname.set('super');

		ok(notified, 'Expect "fullName" to be notified that "fname" has been changed');
		strictEqual(fullName(), 'super Mario', 'Expect "fullName()" to be equal to "super Mario"');


		notified = false;
		fullName.dispose();
		fname.set('Super');

		ok(!notified, 'Expect "fullName" not to be notified that "fname" has been changed');
		ok(!fullName.isDependent(), 'Expect "fullName" not to be dependent');
		ok(!deps.contains(fname) && !deps.contains(lname), 'Expect "fullName" not to be dependent on "fname" and "lname"');
		strictEqual(fullName(), 'super Mario', 'Expect "fullName()" to be equal to "super Mario"');
	});

	test('memoization test', function () {
		var computed = false,
			p = binder.makeProperty(function () {
				computed = true;
				return 'value';
			});

		ok(computed, 'Expect property to have been called');


		computed = false;
		p();

		notStrictEqual(computed, true, 'Expect property to have been called');


		p.clearMemo();
		p();

		ok(computed, 'Expect property to have been called');
	});

	test('lazy test', function () {
		var computed = false,
			p = binder.makeProperty({
				lazy: true,
				get: function () {
					computed = true;
					return 'value';
				}
			});

		notStrictEqual(computed, true, 'Expect property to have been called');


		p();

		ok(computed, 'Expect property to have been called');
	});

	test('simple construction test', function () {
		var p = binder.makeProperty('value');

		strictEqual(p.toString(), 'value', 'Expect "p.toString()" to be equal to "value"');
		strictEqual(p.valueOf(), 'value', 'Expect "p.valueOf()" to be equal to "value"');
		strictEqual(p.get(), 'value', 'Expect "p.get()" to be equal to "value"');
		strictEqual(p(), 'value', 'Expect "p()" to be equal to "value"');
	});

	test('value parameterized construction test', function () {
		var p = binder.makeProperty({
				value: 'value'
			});

		strictEqual(p.toString(), 'value', 'Expect "p.toString()" to be equal to "value"');
		strictEqual(p.valueOf(), 'value', 'Expect "p.valueOf()" to be equal to "value"');
		strictEqual(p.get(), 'value', 'Expect "p.get()" to be equal to "value"');
		strictEqual(p(), 'value', 'Expect "p()" to be equal to "value"');
	});

	test('custom getter construction test', function () {
		var get = false,
			p = binder.makeProperty({
				get: function () {
					get = true;
					return 'value';
				}
			});

		ok(get, 'Expect the custom getter to be called');
		strictEqual(p.toString(), 'value', 'Expect "p.toString()" to be equal to "value"');
		strictEqual(p.valueOf(), 'value', 'Expect "p.valueOf()" to be equal to "value"');
		strictEqual(p.get(), 'value', 'Expect "p.get()" to be equal to "value"');
		strictEqual(p(), 'value', 'Expect "p()" to be equal to "value"');
	});

	test('custom getter/setter construction test', function () {
		var get = false,
			set = false,
			p = binder.makeProperty({
				get: function () {
					get = true;
					return 'value';
				},
				set: function () {
					set = true;
				}
			});

		ok(get, 'Expect the custom getter to be called');
		strictEqual(p.toString(), 'value', 'Expect "p.toString()" to be equal to "value"');
		strictEqual(p.valueOf(), 'value', 'Expect "p.valueOf()" to be equal to "value"');
		strictEqual(p.get(), 'value', 'Expect "p.get()" to be equal to "value"');
		strictEqual(p(), 'value', 'Expect "p()" to be equal to "value"');

		p('value');

		ok(!set, 'Expect the custom setter not to be called');


		p('new value');

		ok(set, 'Expect the custom setter to be called');
	});

	test('custom getter/setter with laziness construction test', function () {
		var get = false,
			set = false,
			p = binder.makeProperty({
				lazy: true,
				get: function () {
					get = true;
					return 'value';
				},
				set: function () {
					set = true;
				}
			});

		notStrictEqual(get, true, 'Expect the custom getter to be called');
		strictEqual(p.toString(), 'value', 'Expect "p.toString()" to be equal to "value"');
		strictEqual(p.valueOf(), 'value', 'Expect "p.valueOf()" to be equal to "value"');
		strictEqual(p.get(), 'value', 'Expect "p.get()" to be equal to "value"');
		strictEqual(p(), 'value', 'Expect "p()" to be equal to "value"');

		p('value');

		ok(get, 'Expect the custom getter to be called');
		ok(!set, 'Expect the custom setter not to be called');


		p('new value');

		ok(set, 'Expect the custom setter to be called');
	});

	test('observable value property test', function () {
		var o = binder.makeObservable(),
			p = binder.makeProperty(o),
			notified;

		strictEqual(p.toString(), '', 'Expect "p.toString()" to be equal to the empty string');
		strictEqual(p.valueOf(), undefined, 'Expect "p.valueOf()" to be equal to undefined');
		strictEqual(p.get(), undefined, 'Expect "p.get()" to be equal to undefined');
		strictEqual(p(), undefined, 'Expect "p()" to be equal to undefined');


		o.valueOf = function () {
			return 'observable';
		};
		o.toString = o.valueOf;
		p = binder.makeProperty({
			value: o
		});

		strictEqual(p.toString(), o.toString(), 'Expect "p.toString()" to be equal to "o.toString()"');
		strictEqual(p.valueOf(), o.valueOf(), 'Expect "p.valueOf()" to be equal to "o.valueOf()"');
		strictEqual(p.get(), o, 'Expect "p.get()" to be equal to o');
		strictEqual(p(), o, 'Expect "p()" to be equal to o');


		notified = false;
		p.subscribe(function () {
			notified = true;
		});

		o.notify();

		ok(notified, 'Expect the property to be notified when "o" has been notified');

		p.dispose();
	});

	test('operators test', function () {
		var equals = false,
			changed = false,
			p = binder.makeProperty({
				value: {
					id: 0,
					label: 'apple'
				},
				equals: function (b) {
					equals = true;
					var a = this.get();
					b = binder.makeProperty.get(b);
					return a.id === b.id;
				},
				changed: function (b) {
					changed = true;
					var a = this.get();
					b = binder.makeProperty.get(b);
					return a.label !== b.label;
				}
			});


		ok(p.equals({id: 0}), 'Expect property to be equal to {id: 0}');
		ok(equals, 'Expect custom equality operator to be called');
		ok(p.equals({id: 0, label: 'pear'}) && p.changed({id: 0, label: 'pear'}), 'Expect property to be equal to {id: 0, label: "pear"} and will be changed if set');
		ok(changed, 'Expect custom equality operator to be called');
	});

	test('array property value test', function () {
		// When the value is an Array, the underlying value
		// converted to an ObservableList.
		var p = binder.makeProperty([1, 2, 3]);

		testArrayProperty(p);
	});

	test('observable list property value test', function () {
		var l = binder.makeObservableList([1, 2, 3]),
			p = binder.makeProperty(l);

		testArrayProperty(p);
	});

	test('list operators test', function () {
		var p = binder.makeProperty({
				value: binder.makeList(
					{id: 0, label: 'apple'},
					{id: 1, label: 'pear'},
					{id: 2, label: 'orange'}
				),
				equals: function (a, b) {
					return a.id === b.id;
				},
				changed: function (a, b) {
					return a.label !== b.label;
				}
			}),
			l = binder.makeList(
				{id: 0, label: 'apple'},
				{id: 1, label: 'pear'},
				{id: 2, label: 'orange'}
			);

		ok(p.equals(l), 'Expect the property to equal the list');


		l.pop();

		notStrictEqual(p.equals(l), 'Expect the property to equal the list');
		ok(p.changed(l), 'Expect the property to change if set to the list');
	});
	module('Observable Tests');

	test('adherence test', function () {
		var ob = binder.makeObservable();

		ok(typeof binder.makeObservable.interfce === 'object' && binder.makeObservable.interfce, 'Expect binder.makeObservable to contain the property "interfce"');
		ok(binder.utiljs.adheresTo(ob, binder.makeObservable.interfce), 'Expect "ob" to adhere to the "binder.makeObservable.interfce" interface');
	});

	test('subscription test', function () {
		var ob = binder.makeObservable(),
			notified = false,
			fn = function () {
				notified = true;
			},
			observer = {
				onNotify: function () {
					this.notified = true;
				}
			},
			subscriptions = {};

		ob.notify();

		notStrictEqual(notified, true, 'Expect "fn" to be called');
		notStrictEqual(observer.notified, true, 'Expect "observer.onNotify" to be called');


		subscriptions.fn = ob.subscribe(fn);
		subscriptions.observer = ob.subscribe(observer);
		notified = false;
		delete observer.notified;
		ob.notify();

		ok(notified, 'Expect "fn" to be called');
		ok(observer.notified, 'Expect "observer.onNotify" to be called');


		subscriptions.fn.dispose();
		notified = false;
		delete observer.notified;
		ob.notify();

		notStrictEqual(notified, true, 'Expect "fn" to be called');
		ok(observer.notified, 'Expect "observer.onNotify" to be called');


		subscriptions.observer.dispose();
		notified = false;
		delete observer.notified;
		ob.notify();

		notStrictEqual(notified, true, 'Expect "fn" to be called');
		notStrictEqual(observer.notified, true, 'Expect "observer.onNotify" to be called');

		subscriptions.fn.dispose();
		subscriptions.observer.dispose();


		notified = false;
		delete observer.notified;
		ob.notify();

		notStrictEqual(notified, true, 'Expect "fn" to be called');
		notStrictEqual(observer.notified, true, 'Expect "observer.onNotify" to be called');


		ob.subscribe(fn);
		ob.subscribe(observer);
		notified = false;
		delete observer.notified;
		ob.dispose();
		ob.notify();

		notStrictEqual(notified, true, 'Expect "fn" to be called');
		notStrictEqual(observer.notified, true, 'Expect "observer.onNotify" to be called');
	});

	test('blocking test', function () {
		var ob = binder.makeObservable(),
			notified = false,
			fn = function () {
				notified = true;
			};

		ob.notify();

		notStrictEqual(notified, true, 'Expect "fn" to be called');


		notified = false;
		ob.subscribe(fn);
		ob.unblock();
		ob.notify();

		ok(notified, 'Expect "fn" to be called');


		notified = false;
		ob.block();
		ob.notify();

		notStrictEqual(notified, true, 'Expect "fn" to be called');
		ob.unblock();
		notStrictEqual(notified, true, 'Expect "fn" to be called');

		ob.dispose();
	});

	asyncTest('throttling test', function () {
		expect(2);

		var ob = binder.makeObservable(),
			notified = false,
			fn = function () {
				notified = true;
			};

		ob.subscribe(fn);
		ob.throttle(500);
		ob.notify();
		// The second notify should be ignored because we're throttling
		// and only one notification should be sent.
		ob.notify();
		notStrictEqual('Expect "fn" to be called', notified, true);

		setTimeout(function () {
			ok(notified, 'Expect "fn" to be called after 500 milliseconds');
			start();
		}, 505);
	});

	asyncTest('throttling and observable disposal test', function () {
		expect(2);

		var ob = binder.makeObservable(),
			notified = false,
			fn = function () {
				notified = true;
			};

		ob.subscribe(fn);
		ob.throttle(500);
		ob.notify();
		// When the observable is disposed all throttling
		// 'threads' should be terminated.
		ob.dispose();
		notStrictEqual(notified, true, 'Expect "fn" not to be called');

		setTimeout(function () {
			notStrictEqual(notified, true, 'Expect "fn" not to be called after 500 milliseconds');
			start();
		}, 505);
	});
	module('List Tests');

	function setupListTest() {
		return binder.makeList(1, 2, 3, 1);
	}
	function destroyListTest(list) {
		list.clear();
	}

	test('adherence test', function () {
		var list = setupListTest();

		ok(Object.prototype.toString.call(list), '[object Array]', 'Expect the list to be a native Array');

		destroyListTest(list);
	});

	test('indexOf test', function () {
		var list = setupListTest();

		ok(typeof list.indexOf === 'function', 'Expect list to have an indexOf() method');
		strictEqual(list.indexOf(2), 1, 'Expect index of 2 to be 1');
		strictEqual(list.indexOf(1), 0, 'Expect index of 1 to be 0');
		strictEqual(list.indexOf(1, 1), 3, 'Expect index of 1 from index 1 to be 3');
		ok(list.indexOf(10) < 0, 'Expect index of 10 to be less than zero');

		destroyListTest(list);
	});

	test('lastIndexOf test', function () {
		var list = setupListTest();

		ok(typeof list.lastIndexOf === 'function', 'Expect list to have an lastIndexOf() method');
		strictEqual(list.lastIndexOf(2), 1, 'Expect last index of 2 to be 1');
		strictEqual(list.lastIndexOf(1), 3, 'Expect last index of 1 to be 3');
		strictEqual(list.lastIndexOf(1, 1), 0, 'Expect last index of 1 from index 1 to be 0');
		ok(list.lastIndexOf(10) < 0, 'Expect last index of 10 to be less than zero');

		destroyListTest(list);
	});

	test('reverse test', function () {
		var list = setupListTest();

		ok(typeof list.reverse === 'function', 'Expect list to have a reverse() method');
		var l = list.reverse();
		strictEqual(l, list, 'Expect "list.reverse()" to return the same list');
		strictEqual(list.join(', '), '1, 3, 2, 1', 'Expect the list to be in reverse order');

		destroyListTest(list);
	});

	test('map test', function () {
		var list = setupListTest();

		ok(typeof list.map === 'function', 'Expect list to have an map() method');

		var o = {},
			l = list.map(function (item, index, array) {
				this.pass = array === list;
				return index;
			}, o);

		strictEqual(list.join(', '), '1, 2, 3, 1', 'Expect the list to be unmodified');
		ok(o.pass, 'Expect the callback to be called with the correct scope and passed a reference to the list');
		notStrictEqual(l, list, 'Do not expect "list.map()" to return a new list');
		strictEqual(l.join(', '), '0, 1, 2, 3', 'Expect the new list to be [0, 1, 2, 3]');


		l = list.map(function (item, index, array) {
			if (index === 0) {
				list.push(4);
			}
			return index;
		});

		strictEqual(list.join(', '), '1, 2, 3, 1, 4', 'Expect the list to be unmodified');
		strictEqual(l.join(', '), '0, 1, 2, 3', 'Expect the new list to be [0, 1, 2, 3]');


		l = list.map(function (item, index, array) {
			if (index === 0) {
				list.splice(4, 1);
			}
			notStrictEqual(index, 4, 'Did not expect the callback to be called with index 4');
			return index;
		});

		strictEqual(list.join(', '), '1, 2, 3, 1', 'Expect the list to be unmodified');
		strictEqual(l.join(', '), '0, 1, 2, 3, ', 'Expect the new list to be [0, 1, 2, 3, ]');

		destroyListTest(list);
	});

	test('filter test', function () {
		var list = setupListTest();

		strictEqual(typeof list.filter, 'function', 'list to have an filter() method');

		var o = {},
			l = list.filter(function (item, index, array) {
				this.pass = array === list;
				return item > 1;
			}, o);

		strictEqual(list.join(', '), '1, 2, 3, 1', 'Expect the list to be unmodified');
		ok(o.pass, 'Expect the callback to be called with the correct scope and passed a reference to the list');
		notStrictEqual(l, list, 'Do not expect "list.filter()" to return a new list');
		strictEqual(l.join(', '), '2, 3', 'Expect the new list to be [2, 3]');


		l = list.filter(function (item, index, array) {
			if (index === 0) {
				list.push(4);
			}
			return item > 1;
		});

		strictEqual(list.join(', '), '1, 2, 3, 1, 4', 'Expect the list to be unmodified');
		strictEqual(l.join(', '), '2, 3', 'Expect the new list to be [2, 3]');


		l = list.filter(function (item, index, array) {
			if (index === 0) {
				list.splice(4, 1);
			}
			return item > 1;
		});

		strictEqual(list.join(', '), '1, 2, 3, 1', 'Expect the list to be unmodified');
		strictEqual(l.join(', '), '2, 3', 'Expect the new list to be [2, 3]');

		destroyListTest(list);
	});

	test('forEach test', function () {
		var list = setupListTest();

		strictEqual(typeof list.forEach, 'function', 'Expect list to have an forEach() method');

		var o = {},
			l = [];

		list.forEach(function (item, index, array) {
			this.pass = array === list;
			l[index] = item;
		}, o);

		strictEqual(list.join(', '), '1, 2, 3, 1', 'Expect the list to be unmodified');
		ok(o.pass, 'Expect the callback to be called with the correct scope and passed a reference to the list');
		strictEqual(l.join(', '), '1, 2, 3, 1', 'Expect the new array to be [1, 2, 3, 1]');

		destroyListTest(list);
	});

	test('reduce test', function () {
		var list = setupListTest();

		strictEqual(typeof list.reduce, 'function', 'Expect list to have an reduce() method');

		var total = list.reduce(function (total, item, index, array) {
				return total + item;
			}, 0);

		strictEqual(total, 7, 'Expect total to be 7');


		list[0] = 0;
		total = list.reduce(function (total, item, index, array) {
			return total + item;
		});

		strictEqual(total, 6, 'Expect total to be 6');


		delete list[0];
		total = list.reduce(function (total, item, index, array) {
			if (index === 2) {
				list.splice(3, 1);
			}
			return total + item;
		});

		strictEqual(total, 5, 'Expect total to be 5');


		list[2] = undefined;
		total = list.reduce(function (total, item, index, array) {
			if (item === undefined) {
				return total;
			}
			return total + item;
		});

		strictEqual(total, 2, 'Expect total to be 2');

		destroyListTest(list);
	});

	test('reduceRight test', function () {
		var list = setupListTest();

		strictEqual(typeof list.reduceRight, 'function', 'Expect list to have an reduceRight() method');

		var total = list.reduceRight(function (total, item, index, array) {
				return total + item;
			}, 0);

		strictEqual(total, 7, 'Expect total to be 7');


		list[0] = 0;
		total = list.reduceRight(function (total, item, index, array) {
			return total + item;
		});

		strictEqual(total, 6, 'Expect total to be 6');

		delete list[0];
		total = list.reduceRight(function (total, item, index, array) {
			if (index === 2) {
				list.splice(1, 1);
			}
			return total + item;
		});

		strictEqual(total, 7, 'Expect total to be 7');


		list[1] = undefined;
		total = list.reduceRight(function (total, item, index, array) {
			if (item === undefined) {
				return total;
			}
			return total + item;
		});

		strictEqual(total, 1, 'Expect total to be 1');

		destroyListTest(list);
	});

	test('some test', function () {
		var list = setupListTest();

		strictEqual(typeof list.some, 'function', 'Expect list to have an some() method');

		var o = {},
			value = list.some(function (item, index, array) {
				this.pass = array === list;
				return item === 2;
			}, o);


		strictEqual(list.join(', '), '1, 2, 3, 1', 'Expect the list to be unmodified');
		ok(o.pass, 'Expect the callback to be called with the correct scope and passed a reference to the list');
		ok(value, 'Expect "value" to be true');


		value = list.some(function (item, index, array) {
			return false;
		});

		ok(!value, 'Expect "value" to be false');


		value = list.some(function (item, index, array) {
			if (index === 1) {
				list.splice(3, 1);
			}
			if (index === 3) {
				notStrictEqual(index, 3, 'Did not expect index 3 to be visited');
			}
			return false;
		});

		ok(!value, 'Expect "value" to be false');

		destroyListTest(list);
	});

	test('every test', function () {
		var list = setupListTest();

		strictEqual(typeof list.every, 'function', 'Expect list to have an every() method');

		var o = {},
			value = list.every(function (item, index, array) {
				this.pass = array === list;
				return item === 2;
			}, o);


		strictEqual(list.join(', '), '1, 2, 3, 1', 'Expect the list to be unmodified');
		ok(o.pass, 'Expect the callback to be called with the correct scope and passed a reference to the list');
		ok(!value, 'Expect "value" to be false');


		delete list[0];
		value = list.every(function (item, index, array) {
			if (index === 0) {
				notStrictEqual(index, 0, 'Did not expect index 0 to be visited');
			}
			return true;
		});

		ok(value, 'Expect "value" to be true');


		value = list.every(function (item, index, array) {
			if (index === 1) {
				list.splice(3, 1);
			}
			if (index === 3) {
				notStrictEqual(index, 3, 'Did not expect index 3 to be visited');
			}
			return true;
		});

		ok(value, 'Expect "value" to be true');

		destroyListTest(list);
	});

	// Custom Functionality.

	test('contains test', function () {
		var list = setupListTest();

		strictEqual(typeof list.contains, 'function', 'Expect list to have an contains() method');

		ok(list.contains(1), 'Expect list to contain 1');
		ok(list.contains(3), 'Expect list to contain 3');
		ok(!list.contains(30), 'Expect list not to contain 30');


		list.clear();
		ok(!list.contains(3), 'Expect list not to contain 3');

		destroyListTest(list);
	});

	test('occurances test', function () {
		var list = setupListTest();

		strictEqual(typeof list.occurances, 'function', 'Expect list to have an occurances() method');

		strictEqual(list.occurances(1), 2, 'Expect list to contain 2 occurances of 1');
		strictEqual(list.occurances(2), 1, 'Expect list to contain 1 occurances of 2');
		strictEqual(list.occurances(3), 1, 'Expect list to contain 2 occurances of 3');
		strictEqual(list.occurances(14), 0, 'Expect list to contain 0 occurances of 14');


		list.pop();
		strictEqual(list.occurances(1), 1, 'Expect list to contain 1 occurances of 1');

		destroyListTest(list);
	});

	test('distinct test', function () {
		var list = setupListTest();

		strictEqual(typeof list.distinct, 'function', 'Expect list to have an distinct() method');

		var l = list.distinct();

		strictEqual(list.join(', '), '1, 2, 3, 1', 'Expect the list to be unmodified');
		strictEqual(l.join(', '), '2, 3', 'Expect the returned array to be [2, 3]');

		destroyListTest(list);
	});

	test('first test', function () {
		var list = setupListTest();

		strictEqual(typeof list.first, 'function', 'Expect list to have an first() method');

		var o = {},
			value = list.first(function (item, index, array) {
				this.pass = array === list;
				ok(index <= 0, 'Expect only the first index to be visited');
				return item === 1;
			}, o);

		strictEqual(list.join(', '), '1, 2, 3, 1', 'Expect the list to be unmodified');
		ok(o.pass, 'Expect the callback to be called with the correct scope and passed a reference to the list');
		strictEqual(value, 1, 'Expect "value" to be equal to 1');


		value = list.first(function (item, index, array) {
			return item === 31;
		}, o);

		strictEqual(value, undefined, 'Expect "value" to be equal to undefined');

		destroyListTest(list);
	});

	test('last test', function () {
		var list = setupListTest();

		strictEqual(typeof list.last, 'function', 'Expect list to have an last() method');

		var o = {},
			value = list.last(function (item, index, array) {
				this.pass = array === list;
				ok(index === list.length - 1, 'Expect only the last index to be visited');
				return item === 1;
			}, o);

		strictEqual(list.join(', '), '1, 2, 3, 1', 'Expect the list to be unmodified');
		ok(o.pass, 'Expect the callback to be called with the correct scope and passed a reference to the list');
		strictEqual(value, 1, 'Expect "value" to be equal to 1');


		value = list.last(function (item, index, array) {
			return item === 31;
		}, o);

		strictEqual(value, undefined, 'Expect "value" to be equal to undefined');

		destroyListTest(list);
	});

	test('find tets', function () {
		var list = setupListTest();

		strictEqual(typeof list.find, 'function', 'Expect list to have an find() method');

		var o = {},
			value = list.find(function (item, index, array) {
				this.pass = array === list;
				if (index > 0) {
					notStrictEqual(index, 0, 'Did not expect indices above 0 to be visited');
				}
				return item === 1;
			}, o);

		strictEqual(list.join(', '), '1, 2, 3, 1', 'Expect the list to be unmodified');
		ok(o.pass, 'Expect the callback to be called with the correct scope and passed a reference to the list');
		strictEqual(value.index, 0, 'Expect "value" to have index 0');


		value = list.find(function (item, index, array) {
			return item === 31;
		}, o);

		ok(value.index < 0, 'Expect "value" to have a negative index');


		delete list[0];
		value = list.find(function (item, index, array) {
			if (index === 0) {
				notStrictEqual(index, 0, 'Did not expect index 0 to be visited');
			}
			return item === 1;
		}, o);

		strictEqual(value.index, 3, 'Expect "value" to have index 3');

		destroyListTest(list);
	});

	test('equals test', function () {
		var list = setupListTest();

		strictEqual(typeof list.equals, 'function', 'Expect list to have an equals() method');

		var b = [1, 2, 3, 1];

		ok(list.equals(b), 'Expect the list to be equal to second list');


		b.pop();

		ok(!list.equals(b), 'Expect the list to not equal the second list');


		b.push(1);

		ok(list.equals(b), 'Expect the list to be equal to second list');


		list.getItemOperators = function () {
			return {
				equals: function (a, b) {
					return false;
				},
				changed: function (a, b) {
					return a !== b;
				}
			};
		};

		ok(!list.equals(b), 'Expect the list to not equal the second list');

		destroyListTest(list);
	});

	test('changed test', function () {
		var list = setupListTest();

		strictEqual(typeof list.changed, 'function', 'Expect list to have an changed() method');

		var b = [1, 2, 3, 1];

		ok(!list.changed(b), 'Expect the list to be the same as the second list');


		b.pop();

		ok(list.changed(b), 'Expect the list to be different than the second list');


		b.push(1);

		ok(!list.changed(b), 'Expect the list to be the same as the second list');


		list.getItemOperators = function () {
			return {
				equals: function (a, b) {
					return false;
				},
				changed: function (a, b) {
					return true;
				}
			};
		};

		ok(list.changed(b), 'Expect the list to be different than the second list');

		destroyListTest(list);
	});


	test('compare test', function () {
		var list = setupListTest();

		strictEqual(typeof list.compare, 'function', 'Expect list to have an compare() method');

		var l = [1, 2, 3, 1],
			comparison = list.compare(l);

		notStrictEqual(list, comparison, 'Expect this list to not be the same list as the comparison result');
		strictEqual(comparison.length, 4, 'Expect the comparison result to have a length of 4');


		comparison = binder.makeList(comparison);

		ok(comparison.every(function (item) {
			return item.status === 'retained';
		}), 'Expect all comparison objects to have a status of "retained"');


		l = [2, 3, 1];
		comparison = binder.makeList(list.compare(l));

		strictEqual(comparison[0].status, 'retained', 'Expect comparison object at index 0 to have a status of "retained"');
		strictEqual(comparison[1].status, 'retained', 'Expect comparison object at index 1 to have a status of "retained"');
		strictEqual(comparison[2].status, 'retained', 'Expect comparison object at index 2 to have a status of "retained"');
		strictEqual(comparison[3].status, 'deleted', 'Expect comparison object at index 3 to have a status of "deleted"');


		l = [2, 4];
		comparison = binder.makeList(list.compare(l));

		strictEqual(comparison[0].status, 'deleted', 'Expected comparison object at index 0 to have a status of "deleted"');
		strictEqual(comparison[1].status, 'retained', 'Expected comparison object at index 1 to have a status of "retained"');
		strictEqual(comparison[2].status, 'deleted', 'Expected comparison object at index 2 to have a status of "deleted"');
		strictEqual(comparison[3].status, 'deleted', 'Expected comparison object at index 3 to have a status of "deleted"');
		strictEqual(comparison[4].status, 'added', 'Expected comparison object at index 3 to have a status of "added"');
		strictEqual(comparison[4].otherIndex, 1, 'Expected comparison object at index 3 to have an otherIndex equal to 1');


		list = binder.makeList(
			{
				id: 0,
				type: 'fruit'
			},
			{
				id: 1,
				type: 'vegetable'
			},
			{
				id: 2,
				type: 'grains'
			}
		);

		list.getItemOperators = function () {
			return {
				equals: function (a, b) {
					return a.id === b.id;
				},
				changed: function (a, b) {
					return a.type !== b.type;
				}
			};
		};

		l = [
			{
				id: 0,
				type: 'fruit'
			},
			{
				id: 1,
				type: 'Vegetable'
			},
			{
				id: 3,
				type: 'meat'
			}
		];

		comparison = list.compare(l);

		strictEqual(comparison[0].status, 'retained', 'Expect comparison object at index 0 to have a status of "retained"');
		strictEqual(comparison[1].status, 'changed', 'Expect comparison object at index 1 to have a status of "changed"');
		strictEqual(comparison[2].status, 'deleted', 'Expect comparison object at index 2 to have a status of "deleted"');
		strictEqual(comparison[3].status, 'added', 'Expect comparison object at index 3 to have a status of "added"');

		destroyListTest(list);
	});

	test('merge test', function () {
		var list = setupListTest();

		strictEqual(typeof list.merge, 'function', 'Expect list to have an merge() method');

		var a = [1, 2, 3, 1],
			l = list.merge(a);

		notStrictEqual(list, l, 'Expect the merged list to not be the same list as the "list"');
		strictEqual(l.join(', '), '1, 2, 3, 1', 'Expect the merged list to contain [1, 2, 3, 1]');


		a = [2, 3];
		l = list.merge(a);

		strictEqual(l.join(', '), '2, 3', 'Expect the merged list to contain [2, 3]');


		list = binder.makeList(
			{
				id: 0,
				type: 'fruit',
				toString: function () {
					return this.type;
				}
			},
			{
				id: 1,
				type: 'vegetable',
				toString: function () {
					return this.type;
				}
			},
			{
				id: 2,
				type: 'grains',
				toString: function () {
					return this.type;
				}
			}
		);

		list.getItemOperators = function () {
			return {
				equals: function (a, b) {
					return a.id === b.id;
				},
				changed: function (a, b) {
					return a.type !== b.type;
				}
			};
		};

		a = [
			{
				id: 0,
				type: 'fruit',
				toString: function () {
					return this.type;
				}
			},
			{
				id: 1,
				type: 'Vegetable',
				toString: function () {
					return this.type;
				}
			},
			{
				id: 3,
				type: 'meat',
				toString: function () {
					return this.type;
				}
			}
		];

		l = list.merge(a);

		strictEqual(l.join(', '), 'fruit, Vegetable, meat', 'Expect the merged list to contains [friuit, Vegetable, meat]');

		destroyListTest(list);
	});

	test('mergeWith test', function () {
		var list = setupListTest();

		strictEqual(typeof list.mergeWith, 'function', 'Expect list to have an merveWith() method');

		var a = [1, 2, 3, 1],
			l = list.mergeWith(a);

		strictEqual(l, undefined, 'Expect the result of merging to be undefined');
		strictEqual(list.join(', '), '1, 2, 3, 1', 'Expect the list to be unmodified');


		a = [2, 3];
		list.mergeWith(a);

		strictEqual(list.join(', '), '2, 3', 'Expect the list to contain [2, 3]');


		list = binder.makeList(
			{
				id: 0,
				type: 'fruit',
				toString: function () {
					return this.type;
				}
			},
			{
				id: 1,
				type: 'vegetable',
				toString: function () {
					return this.type;
				}
			},
			{
				id: 2,
				type: 'grains',
				toString: function () {
					return this.type;
				}
			}
		);

		list.getItemOperators = function () {
			return {
				equals: function (a, b) {
					return a.id === b.id;
				},
				changed: function (a, b) {
					return a.type !== b.type;
				}
			};
		};

		a = [
			{
				id: 0,
				type: 'fruit',
				toString: function () {
					return this.type;
				}
			},
			{
				id: 1,
				type: 'Vegetable',
				toString: function () {
					return this.type;
				}
			},
			{
				id: 3,
				type: 'meat',
				toString: function () {
					return this.type;
				}
			}
		];

		list.mergeWith(a);

		strictEqual(list.join(', '), 'fruit, Vegetable, meat', 'Expect the list to contains [friuit, Vegetable, meat]');

		destroyListTest(list);
	});

	test('remove test', function () {
		var list = setupListTest();

		strictEqual(typeof list.remove, 'function', 'Expect list to have an remove() method');

		list.remove(1);

		strictEqual(list.join(', '), '2, 3', 'Expect the list to contain [2, 3]');


		list.remove(2, 3);

		strictEqual(list.join(', '), '', 'Expect the list to be empty');

		destroyListTest(list);
	});

	test('removeAt test', function () {
		var list = setupListTest();

		strictEqual(typeof list.removeAt, 'function', 'Expect list to have an removeAt() method');

		strictEqual(list.removeAt(0), 1, 'Expect the item that was removed to be equal to 1');
		strictEqual(list.join(', '), '2, 3, 1', 'Expect the list to contain [2, 3, 1]');


		strictEqual(list.removeAt(1), 3, 'Expect the item that was removed to be equal to 3');
		strictEqual(list.join(', '), '2, 1', 'Expect the list to contain [2, 1]');


		strictEqual(list.removeAt(20), undefined, 'Expect the item that was removed to be equal to undefined');
		strictEqual(list.join(', '), '2, 1', 'Expect the list to contain [2, 1]');

		destroyListTest(list);
	});

	test('clear test', function () {
		var list = setupListTest();

		strictEqual(typeof list.clear, 'function', 'Expect list to have an clear() method');

		list.clear();

		strictEqual(list.length, 0, 'Expect list to have length 0');
		strictEqual(list.join(', '), '', 'Expect list to contain nothing');

		destroyListTest(list);
	});

	test('collapse test', function () {
		var list = setupListTest();

		strictEqual(typeof list.collapse, 'function', 'Expect list to have an collapse() method');

		list.collapse();

		strictEqual(list.join(', '), '1, 2, 3, 1', 'Expect the list to be unmodified');


		delete list[0];
		list[1] = undefined;
		list.collapse();

		strictEqual(list.join(', '), '3, 1', 'Expect the list to contain [3, 1]');

		destroyListTest(list);
	});

	test('replaceAt test', function () {
		var list = setupListTest();

		strictEqual(typeof list.replaceAt, 'function', 'Expect list to have an replaceAt() method');

		list.replaceAt(0, 10);

		strictEqual(list[0], 10, 'Expect index 0 to hold the value 10');
		strictEqual(list.join(', '), '10, 2, 3, 1', 'Expect the list to contain [10, 2, 3, 1]');


		delete list[3];
		list.replaceAt(3, 20);

		strictEqual(list[3], 20, 'Expect index 3 to hold the value 20');
		strictEqual(list.join(', '), '10, 2, 3, 20', 'Expect the list to contain [10, 2, 3, 20]');

		destroyListTest(list);
	});

	test('isEmpty test', function () {
		var list = setupListTest();

		strictEqual(typeof list.isEmpty, 'function', 'Expect list to have an isEmpty() method');

		ok(!list.isEmpty(), 'Expect list to not be empty');


		list.clear();

		ok(list.isEmpty(), 'Expect list to be empty');

		list.push(1);

		ok(!list.isEmpty(), 'Expect list to not be empty');


		list.pop();
		list.pop();

		ok(list.isEmpty(), 'Expect list to be empty');


		list.splice(0, 0, 1, 2, 3);

		ok(!list.isEmpty(), 'Expect list to not be empty');

		destroyListTest(list);
	});

	test('peek test', function () {
		var list = setupListTest();

		strictEqual(typeof list.peek, 'function', 'Expect list to have an peek() method');

		strictEqual(list.peek(), 1, 'Expect the last item to be 1');
		ok(!list.isEmpty(), 'Expect the list to not be empty');


		list.pop();

		strictEqual(list.peek(), 3, 'Expect the last item to be 3');

		destroyListTest(list);
	});

	test('insert test', function () {
		var list = setupListTest();

		strictEqual(typeof list.insert, 'function', 'Expect list to have an insert() method');

		list.insert(0, 10);

		strictEqual(list.join(', '), '10, 1, 2, 3, 1', 'Expect the list to contain [10, 1, 2, 3, 1]');


		list.insert(1, 20);

		strictEqual(list.join(', '), '10, 20, 1, 2, 3, 1', 'Expect the list to contain [10, 20, 1, 2, 3, 1]');


		list.insert(list.length, 30);

		strictEqual(list.join(', '), '10, 20, 1, 2, 3, 1, 30', 'Expect the list to contain [10, 20, 1, 2, 3, 1, 30]');


		list.insert(40, 0);

		strictEqual(list.join(', '), '10, 20, 1, 2, 3, 1, 30, 0', 'Expect the list to contain [10, 20, 1, 2, 3, 1, 30, 0]');


		delete list[0];
		list.insert(0, 0);

		strictEqual(list.join(', '), '0, 20, 1, 2, 3, 1, 30, 0', 'Expect the list to contain [0, 20, 1, 2, 3, 1, 30, 0]');

		destroyListTest(list);
	});
	module('ObservableList Test');

	function setupObservableListTest() {
		var list = binder.makeObservableList(1, 2, 3, 1),
			observer = {
				notifiedCount: 0,
				onNotify: function (observable) {
					this.notifiedCount += Boolean(observable) ? 1 : 0;
				},
				reset: function () {
					this.notifiedCount = 0;
				}
			};

		list.subscribe(observer);

		return {list: list, observer: observer};
	}
	function destroyObservableListTest(list) {
		list.dispose();
		list.clear();
	}

	test('adherence test', function () {
		var list = setupObservableListTest().list;

		ok(Object.prototype.toString.call(list), '[object Array]', 'Expect the list to be a native Array');

		destroyObservableListTest(list);
	});

	test('indexOf test', function () {
		var list = setupObservableListTest().list;

		ok(typeof list.indexOf === 'function', 'Expect list to have an indexOf() method');
		strictEqual(list.indexOf(2), 1, 'Expect index of 2 to be 1');
		strictEqual(list.indexOf(1), 0, 'Expect index of 1 to be 0');
		strictEqual(list.indexOf(1, 1), 3, 'Expect index of 1 from index 1 to be 3');
		ok(list.indexOf(10) < 0, 'Expect index of 10 to be less than zero');

		destroyObservableListTest(list);
	});

	test('lastIndexOf test', function () {
		var list = setupObservableListTest().list;

		ok(typeof list.lastIndexOf === 'function', 'Expect list to have an lastIndexOf() method');
		strictEqual(list.lastIndexOf(2), 1, 'Expect last index of 2 to be 1');
		strictEqual(list.lastIndexOf(1), 3, 'Expect last index of 1 to be 3');
		strictEqual(list.lastIndexOf(1, 1), 0, 'Expect last index of 1 from index 1 to be 0');
		ok(list.lastIndexOf(10) < 0, 'Expect last index of 10 to be less than zero');

		destroyObservableListTest(list);
	});

	test('reverse test', function () {
		var state = setupObservableListTest(),
			list = state.list,
			observer = state.observer;

		ok(typeof list.reverse === 'function', 'Expect list to have a reverse() method');
		var l = list.reverse();
		strictEqual(observer.notifiedCount, 1, 'Expect observer to be notified once');
		strictEqual(l, list, 'Expect "list.reverse()" to return the same list');
		strictEqual(list.join(', '), '1, 3, 2, 1', 'Expect the list to be in reverse order');

		destroyObservableListTest(list);
	});

	test('map test', function () {
		var list = setupObservableListTest().list;

		ok(typeof list.map === 'function', 'Expect list to have an map() method');

		var o = {},
			l = list.map(function (item, index, array) {
				this.pass = array === list;
				return index;
			}, o);

		strictEqual(list.join(', '), '1, 2, 3, 1', 'Expect the list to be unmodified');
		ok(o.pass, 'Expect the callback to be called with the correct scope and passed a reference to the list');
		notStrictEqual(l, list, 'Do not expect "list.map()" to return a new list');
		strictEqual(l.join(', '), '0, 1, 2, 3', 'Expect the new list to be [0, 1, 2, 3]');


		l = list.map(function (item, index, array) {
			if (index === 0) {
				list.push(4);
			}
			return index;
		});

		strictEqual(list.join(', '), '1, 2, 3, 1, 4', 'Expect the list to be unmodified');
		strictEqual(l.join(', '), '0, 1, 2, 3', 'Expect the new list to be [0, 1, 2, 3]');


		l = list.map(function (item, index, array) {
			if (index === 0) {
				list.splice(4, 1);
			}
			notStrictEqual(index, 4, 'Did not expect the callback to be called with index 4');
			return index;
		});

		strictEqual(list.join(', '), '1, 2, 3, 1', 'Expect the list to be unmodified');
		strictEqual(l.join(', '), '0, 1, 2, 3, ', 'Expect the new list to be [0, 1, 2, 3, ]');

		destroyObservableListTest(list);
	});

	test('filter test', function () {
		var list = setupObservableListTest().list;

		strictEqual(typeof list.filter, 'function', 'list to have an filter() method');

		var o = {},
			l = list.filter(function (item, index, array) {
				this.pass = array === list;
				return item > 1;
			}, o);

		strictEqual(list.join(', '), '1, 2, 3, 1', 'Expect the list to be unmodified');
		ok(o.pass, 'Expect the callback to be called with the correct scope and passed a reference to the list');
		notStrictEqual(l, list, 'Do not expect "list.filter()" to return a new list');
		strictEqual(l.join(', '), '2, 3', 'Expect the new list to be [2, 3]');


		l = list.filter(function (item, index, array) {
			if (index === 0) {
				list.push(4);
			}
			return item > 1;
		});

		strictEqual(list.join(', '), '1, 2, 3, 1, 4', 'Expect the list to be unmodified');
		strictEqual(l.join(', '), '2, 3', 'Expect the new list to be [2, 3]');


		l = list.filter(function (item, index, array) {
			if (index === 0) {
				list.splice(4, 1);
			}
			return item > 1;
		});

		strictEqual(list.join(', '), '1, 2, 3, 1', 'Expect the list to be unmodified');
		strictEqual(l.join(', '), '2, 3', 'Expect the new list to be [2, 3]');

		destroyObservableListTest(list);
	});

	test('forEach test', function () {
		var list = setupObservableListTest().list;

		strictEqual(typeof list.forEach, 'function', 'Expect list to have an forEach() method');

		var o = {},
			l = [];

		list.forEach(function (item, index, array) {
			this.pass = array === list;
			l[index] = item;
		}, o);

		strictEqual(list.join(', '), '1, 2, 3, 1', 'Expect the list to be unmodified');
		ok(o.pass, 'Expect the callback to be called with the correct scope and passed a reference to the list');
		strictEqual(l.join(', '), '1, 2, 3, 1', 'Expect the new array to be [1, 2, 3, 1]');

		destroyObservableListTest(list);
	});

	test('reduce test', function () {
		var list = setupObservableListTest().list;

		strictEqual(typeof list.reduce, 'function', 'Expect list to have an reduce() method');

		var total = list.reduce(function (total, item, index, array) {
				return total + item;
			}, 0);

		strictEqual(total, 7, 'Expect total to be 7');


		list[0] = 0;
		total = list.reduce(function (total, item, index, array) {
			return total + item;
		});

		strictEqual(total, 6, 'Expect total to be 6');


		delete list[0];
		total = list.reduce(function (total, item, index, array) {
			if (index === 2) {
				list.splice(3, 1);
			}
			return total + item;
		});

		strictEqual(total, 5, 'Expect total to be 5');


		list[2] = undefined;
		total = list.reduce(function (total, item, index, array) {
			if (item === undefined) {
				return total;
			}
			return total + item;
		});

		strictEqual(total, 2, 'Expect total to be 2');

		destroyObservableListTest(list);
	});

	test('reduceRight test', function () {
		var list = setupObservableListTest().list;

		strictEqual(typeof list.reduceRight, 'function', 'Expect list to have an reduceRight() method');

		var total = list.reduceRight(function (total, item, index, array) {
				return total + item;
			}, 0);

		strictEqual(total, 7, 'Expect total to be 7');


		list[0] = 0;
		total = list.reduceRight(function (total, item, index, array) {
			return total + item;
		});

		strictEqual(total, 6, 'Expect total to be 6');

		delete list[0];
		total = list.reduceRight(function (total, item, index, array) {
			if (index === 2) {
				list.splice(1, 1);
			}
			return total + item;
		});

		strictEqual(total, 7, 'Expect total to be 7');


		list[1] = undefined;
		total = list.reduceRight(function (total, item, index, array) {
			if (item === undefined) {
				return total;
			}
			return total + item;
		});

		strictEqual(total, 1, 'Expect total to be 1');

		destroyObservableListTest(list);
	});

	test('some test', function () {
		var list = setupObservableListTest().list;

		strictEqual(typeof list.some, 'function', 'Expect list to have an some() method');

		var o = {},
			value = list.some(function (item, index, array) {
				this.pass = array === list;
				return item === 2;
			}, o);


		strictEqual(list.join(', '), '1, 2, 3, 1', 'Expect the list to be unmodified');
		ok(o.pass, 'Expect the callback to be called with the correct scope and passed a reference to the list');
		ok(value, 'Expect "value" to be true');


		value = list.some(function (item, index, array) {
			return false;
		});

		ok(!value, 'Expect "value" to be false');


		value = list.some(function (item, index, array) {
			if (index === 1) {
				list.splice(3, 1);
			}
			if (index === 3) {
				notStrictEqual(index, 3, 'Did not expect index 3 to be visited');
			}
			return false;
		});

		ok(!value, 'Expect "value" to be false');

		destroyObservableListTest(list);
	});

	test('every test', function () {
		var list = setupObservableListTest().list;

		strictEqual(typeof list.every, 'function', 'Expect list to have an every() method');

		var o = {},
			value = list.every(function (item, index, array) {
				this.pass = array === list;
				return item === 2;
			}, o);


		strictEqual(list.join(', '), '1, 2, 3, 1', 'Expect the list to be unmodified');
		ok(o.pass, 'Expect the callback to be called with the correct scope and passed a reference to the list');
		ok(!value, 'Expect "value" to be false');


		delete list[0];
		value = list.every(function (item, index, array) {
			if (index === 0) {
				notStrictEqual(index, 0, 'Did not expect index 0 to be visited');
			}
			return true;
		});

		ok(value, 'Expect "value" to be true');


		value = list.every(function (item, index, array) {
			if (index === 1) {
				list.splice(3, 1);
			}
			if (index === 3) {
				notStrictEqual(index, 3, 'Did not expect index 3 to be visited');
			}
			return true;
		});

		ok(value, 'Expect "value" to be true');

		destroyObservableListTest(list);
	});

	// Custom Functionality.

	test('contains test', function () {
		var list = setupObservableListTest().list;

		strictEqual(typeof list.contains, 'function', 'Expect list to have an contains() method');

		ok(list.contains(1), 'Expect list to contain 1');
		ok(list.contains(3), 'Expect list to contain 3');
		ok(!list.contains(30), 'Expect list not to contain 30');


		list.clear();
		ok(!list.contains(3), 'Expect list not to contain 3');

		destroyObservableListTest(list);
	});

	test('occurances test', function () {
		var list = setupObservableListTest().list;

		strictEqual(typeof list.occurances, 'function', 'Expect list to have an occurances() method');

		strictEqual(list.occurances(1), 2, 'Expect list to contain 2 occurances of 1');
		strictEqual(list.occurances(2), 1, 'Expect list to contain 1 occurances of 2');
		strictEqual(list.occurances(3), 1, 'Expect list to contain 2 occurances of 3');
		strictEqual(list.occurances(14), 0, 'Expect list to contain 0 occurances of 14');


		list.pop();
		strictEqual(list.occurances(1), 1, 'Expect list to contain 1 occurances of 1');

		destroyObservableListTest(list);
	});

	test('distinct test', function () {
		var list = setupObservableListTest().list;

		strictEqual(typeof list.distinct, 'function', 'Expect list to have an distinct() method');

		var l = list.distinct();

		strictEqual(list.join(', '), '1, 2, 3, 1', 'Expect the list to be unmodified');
		strictEqual(l.join(', '), '2, 3', 'Expect the returned array to be [2, 3]');

		destroyObservableListTest(list);
	});

	test('first test', function () {
		var list = setupObservableListTest().list;

		strictEqual(typeof list.first, 'function', 'Expect list to have an first() method');

		var o = {},
			value = list.first(function (item, index, array) {
				this.pass = array === list;
				ok(index <= 0, 'Expect only the first index to be visited');
				return item === 1;
			}, o);

		strictEqual(list.join(', '), '1, 2, 3, 1', 'Expect the list to be unmodified');
		ok(o.pass, 'Expect the callback to be called with the correct scope and passed a reference to the list');
		strictEqual(value, 1, 'Expect "value" to be equal to 1');


		value = list.first(function (item, index, array) {
			return item === 31;
		}, o);

		strictEqual(value, undefined, 'Expect "value" to be equal to undefined');

		destroyObservableListTest(list);
	});

	test('last test', function () {
		var list = setupObservableListTest().list;

		strictEqual(typeof list.last, 'function', 'Expect list to have an last() method');

		var o = {},
			value = list.last(function (item, index, array) {
				this.pass = array === list;
				ok(index === list.length - 1, 'Expect only the last index to be visited');
				return item === 1;
			}, o);

		strictEqual(list.join(', '), '1, 2, 3, 1', 'Expect the list to be unmodified');
		ok(o.pass, 'Expect the callback to be called with the correct scope and passed a reference to the list');
		strictEqual(value, 1, 'Expect "value" to be equal to 1');


		value = list.last(function (item, index, array) {
			return item === 31;
		}, o);

		strictEqual(value, undefined, 'Expect "value" to be equal to undefined');

		destroyObservableListTest(list);
	});

	test('find tets', function () {
		var list = setupObservableListTest().list;

		strictEqual(typeof list.find, 'function', 'Expect list to have an find() method');

		var o = {},
			value = list.find(function (item, index, array) {
				this.pass = array === list;
				if (index > 0) {
					notStrictEqual(index, 0, 'Did not expect indices above 0 to be visited');
				}
				return item === 1;
			}, o);

		strictEqual(list.join(', '), '1, 2, 3, 1', 'Expect the list to be unmodified');
		ok(o.pass, 'Expect the callback to be called with the correct scope and passed a reference to the list');
		strictEqual(value.index, 0, 'Expect "value" to have index 0');


		value = list.find(function (item, index, array) {
			return item === 31;
		}, o);

		ok(value.index < 0, 'Expect "value" to have a negative index');


		delete list[0];
		value = list.find(function (item, index, array) {
			if (index === 0) {
				notStrictEqual(index, 0, 'Did not expect index 0 to be visited');
			}
			return item === 1;
		}, o);

		strictEqual(value.index, 3, 'Expect "value" to have index 3');

		destroyObservableListTest(list);
	});

	test('equals test', function () {
		var list = setupObservableListTest().list;

		strictEqual(typeof list.equals, 'function', 'Expect list to have an equals() method');

		var b = [1, 2, 3, 1];

		ok(list.equals(b), 'Expect the list to be equal to second list');


		b.pop();

		ok(!list.equals(b), 'Expect the list to not equal the second list');


		b.push(1);

		ok(list.equals(b), 'Expect the list to be equal to second list');


		list.getItemOperators = function () {
			return {
				equals: function (a, b) {
					return false;
				},
				changed: function (a, b) {
					return a !== b;
				}
			};
		};

		ok(!list.equals(b), 'Expect the list to not equal the second list');

		destroyObservableListTest(list);
	});

	test('changed test', function () {
		var list = setupObservableListTest().list;

		strictEqual(typeof list.changed, 'function', 'Expect list to have an changed() method');

		var b = [1, 2, 3, 1];

		ok(!list.changed(b), 'Expect the list to be the same as the second list');


		b.pop();

		ok(list.changed(b), 'Expect the list to be different than the second list');


		b.push(1);

		ok(!list.changed(b), 'Expect the list to be the same as the second list');


		list.getItemOperators = function () {
			return {
				equals: function (a, b) {
					return false;
				},
				changed: function (a, b) {
					return true;
				}
			};
		};

		ok(list.changed(b), 'Expect the list to be different than the second list');

		destroyObservableListTest(list);
	});


	test('compare test', function () {
		var list = setupObservableListTest().list;

		strictEqual(typeof list.compare, 'function', 'Expect list to have an compare() method');

		var l = [1, 2, 3, 1],
			comparison = list.compare(l);

		notStrictEqual(list, comparison, 'Expect this list to not be the same list as the comparison result');
		strictEqual(comparison.length, 4, 'Expect the comparison result to have a length of 4');


		comparison = binder.makeList(comparison);

		ok(comparison.every(function (item) {
			return item.status === 'retained';
		}), 'Expect all comparison objects to have a status of "retained"');


		l = [2, 3, 1];
		comparison = binder.makeList(list.compare(l));

		strictEqual(comparison[0].status, 'retained', 'Expect comparison object at index 0 to have a status of "retained"');
		strictEqual(comparison[1].status, 'retained', 'Expect comparison object at index 1 to have a status of "retained"');
		strictEqual(comparison[2].status, 'retained', 'Expect comparison object at index 2 to have a status of "retained"');
		strictEqual(comparison[3].status, 'deleted', 'Expect comparison object at index 3 to have a status of "deleted"');


		l = [2, 4];
		comparison = binder.makeList(list.compare(l));

		strictEqual(comparison[0].status, 'deleted', 'Expected comparison object at index 0 to have a status of "deleted"');
		strictEqual(comparison[1].status, 'retained', 'Expected comparison object at index 1 to have a status of "retained"');
		strictEqual(comparison[2].status, 'deleted', 'Expected comparison object at index 2 to have a status of "deleted"');
		strictEqual(comparison[3].status, 'deleted', 'Expected comparison object at index 3 to have a status of "deleted"');
		strictEqual(comparison[4].status, 'added', 'Expected comparison object at index 3 to have a status of "added"');
		strictEqual(comparison[4].otherIndex, 1, 'Expected comparison object at index 3 to have an otherIndex equal to 1');


		list = binder.makeObservableList(
			{
				id: 0,
				type: 'fruit'
			},
			{
				id: 1,
				type: 'vegetable'
			},
			{
				id: 2,
				type: 'grains'
			}
		);

		list.getItemOperators = function () {
			return {
				equals: function (a, b) {
					return a.id === b.id;
				},
				changed: function (a, b) {
					return a.type !== b.type;
				}
			};
		};

		l = [
			{
				id: 0,
				type: 'fruit'
			},
			{
				id: 1,
				type: 'Vegetable'
			},
			{
				id: 3,
				type: 'meat'
			}
		];

		comparison = list.compare(l);

		strictEqual(comparison[0].status, 'retained', 'Expect comparison object at index 0 to have a status of "retained"');
		strictEqual(comparison[1].status, 'changed', 'Expect comparison object at index 1 to have a status of "changed"');
		strictEqual(comparison[2].status, 'deleted', 'Expect comparison object at index 2 to have a status of "deleted"');
		strictEqual(comparison[3].status, 'added', 'Expect comparison object at index 3 to have a status of "added"');

		destroyObservableListTest(list);
	});

	test('merge test', function () {
		var list = setupObservableListTest().list;

		strictEqual(typeof list.merge, 'function', 'Expect list to have an merge() method');

		var a = [1, 2, 3, 1],
			l = list.merge(a);

		notStrictEqual(list, l, 'Expect the merged list to not be the same list as the "list"');
		strictEqual(l.join(', '), '1, 2, 3, 1', 'Expect the merged list to contain [1, 2, 3, 1]');


		a = [2, 3];
		l = list.merge(a);

		strictEqual(l.join(', '), '2, 3', 'Expect the merged list to contain [2, 3]');


		list = binder.makeObservableList(
			{
				id: 0,
				type: 'fruit',
				toString: function () {
					return this.type;
				}
			},
			{
				id: 1,
				type: 'vegetable',
				toString: function () {
					return this.type;
				}
			},
			{
				id: 2,
				type: 'grains',
				toString: function () {
					return this.type;
				}
			}
		);

		list.getItemOperators = function () {
			return {
				equals: function (a, b) {
					return a.id === b.id;
				},
				changed: function (a, b) {
					return a.type !== b.type;
				}
			};
		};

		a = [
			{
				id: 0,
				type: 'fruit',
				toString: function () {
					return this.type;
				}
			},
			{
				id: 1,
				type: 'Vegetable',
				toString: function () {
					return this.type;
				}
			},
			{
				id: 3,
				type: 'meat',
				toString: function () {
					return this.type;
				}
			}
		];

		l = list.merge(a);

		strictEqual(l.join(', '), 'fruit, Vegetable, meat', 'Expect the merged list to contains [friuit, Vegetable, meat]');

		destroyObservableListTest(list);
	});

	test('mergeWith test', function () {
		var state = setupObservableListTest(),
			list = state.list,
			observer = state.observer;

		strictEqual(typeof list.mergeWith, 'function', 'Expect list to have an merveWith() method');

		var a = [1, 2, 3, 1],
			l = list.mergeWith(a);

		strictEqual(observer.notifiedCount, 1, 'Expect observer to be notified once');
		strictEqual(l, undefined, 'Expect the result of merging to be undefined');
		strictEqual(list.join(', '), '1, 2, 3, 1', 'Expect the list to be unmodified');


		a = [2, 3];
		observer.reset();
		list.mergeWith(a);

		strictEqual(observer.notifiedCount, 1, 'Expect observer to be notified once');
		strictEqual(list.join(', '), '2, 3', 'Expect the list to contain [2, 3]');


		list.dispose();
		list = binder.makeObservableList(
			{
				id: 0,
				type: 'fruit',
				toString: function () {
					return this.type;
				}
			},
			{
				id: 1,
				type: 'vegetable',
				toString: function () {
					return this.type;
				}
			},
			{
				id: 2,
				type: 'grains',
				toString: function () {
					return this.type;
				}
			}
		);

		list.getItemOperators = function () {
			return {
				equals: function (a, b) {
					return a.id === b.id;
				},
				changed: function (a, b) {
					return a.type !== b.type;
				}
			};
		};

		a = [
			{
				id: 0,
				type: 'fruit',
				toString: function () {
					return this.type;
				}
			},
			{
				id: 1,
				type: 'Vegetable',
				toString: function () {
					return this.type;
				}
			},
			{
				id: 3,
				type: 'meat',
				toString: function () {
					return this.type;
				}
			}
		];

		observer.reset();
		list.subscribe(observer);
		list.mergeWith(a);

		strictEqual(observer.notifiedCount, 1, 'Expect observer to be notified once');
		strictEqual(list.join(', '), 'fruit, Vegetable, meat', 'Expect the list to contains [friuit, Vegetable, meat]');

		destroyObservableListTest(list);
	});

	test('remove test', function () {
		var state = setupObservableListTest(),
			list = state.list,
			observer = state.observer;

		strictEqual(typeof list.remove, 'function', 'Expect list to have an remove() method');

		list.remove(1);

		strictEqual(observer.notifiedCount, 1, 'Expect observer to be notified once');
		strictEqual(list.join(', '), '2, 3', 'Expect the list to contain [2, 3]');


		observer.reset();
		list.remove(2, 3);

		strictEqual(observer.notifiedCount, 1, 'Expect observer to be notified once');
		strictEqual(list.join(', '), '', 'Expect the list to be empty');

		destroyObservableListTest(list);
	});

	test('removeAt test', function () {
		var state = setupObservableListTest(),
			list = state.list,
			observer = state.observer;

		strictEqual(typeof list.removeAt, 'function', 'Expect list to have an removeAt() method');

		strictEqual(list.removeAt(0), 1, 'Expect the item that was removed to be equal to 1');
		strictEqual(observer.notifiedCount, 1, 'Expect observer to be notified once');
		strictEqual(list.join(', '), '2, 3, 1', 'Expect the list to contain [2, 3, 1]');


		observer.reset();
		strictEqual(list.removeAt(1), 3, 'Expect the item that was removed to be equal to 3');
		strictEqual(observer.notifiedCount, 1, 'Expect observer to be notified once');
		strictEqual(list.join(', '), '2, 1', 'Expect the list to contain [2, 1]');


		observer.reset();
		strictEqual(list.removeAt(20), undefined, 'Expect the item that was removed to be equal to undefined');
		strictEqual(observer.notifiedCount, 0, 'Expect observer not to be notified');
		strictEqual(list.join(', '), '2, 1', 'Expect the list to contain [2, 1]');

		destroyObservableListTest(list);
	});

	test('clear test', function () {
		var state = setupObservableListTest(),
			list = state.list,
			observer = state.observer;

		strictEqual(typeof list.clear, 'function', 'Expect list to have an clear() method');

		list.clear();

		strictEqual(observer.notifiedCount, 1, 'Expect observer to be notified once');
		strictEqual(list.length, 0, 'Expect list to have length 0');
		strictEqual(list.join(', '), '', 'Expect list to contain nothing');

		destroyObservableListTest(list);
	});

	test('collapse test', function () {
		var state = setupObservableListTest(),
			list = state.list,
			observer = state.observer;

		strictEqual(typeof list.collapse, 'function', 'Expect list to have an collapse() method');

		list.collapse();

		strictEqual(list.join(', '), '1, 2, 3, 1', 'Expect the list to be unmodified');
		strictEqual(observer.notifiedCount, 0, 'Expect observer to not be notified');


		observer.reset();
		delete list[0];
		list[1] = undefined;
		list.collapse();

		strictEqual(list.join(', '), '3, 1', 'Expect the list to contain [3, 1]');
		strictEqual(observer.notifiedCount, 1, 'Expect observer to be notified once');

		destroyObservableListTest(list);
	});

	test('replaceAt test', function () {
		var state = setupObservableListTest(),
			list = state.list,
			observer = state.observer;

		strictEqual(typeof list.replaceAt, 'function', 'Expect list to have an replaceAt() method');

		list.replaceAt(0, 10);

		strictEqual(observer.notifiedCount, 1, 'Expect observer to be notified once');
		strictEqual(list[0], 10, 'Expect index 0 to hold the value 10');
		strictEqual(list.join(', '), '10, 2, 3, 1', 'Expect the list to contain [10, 2, 3, 1]');


		observer.reset();
		delete list[3];
		list.replaceAt(3, 20);

		strictEqual(observer.notifiedCount, 1, 'Expect observer to be notified once');
		strictEqual(list[3], 20, 'Expect index 3 to hold the value 20');
		strictEqual(list.join(', '), '10, 2, 3, 20', 'Expect the list to contain [10, 2, 3, 20]');

		destroyObservableListTest(list);
	});

	test('isEmpty test', function () {
		var state = setupObservableListTest(),
			list = state.list,
			observer = state.observer;

		strictEqual(typeof list.isEmpty, 'function', 'Expect list to have an isEmpty() method');

		ok(!list.isEmpty(), 'Expect list to not be empty');


		list.clear();

		strictEqual(observer.notifiedCount, 1, 'Expect observer to be notified once');
		ok(list.isEmpty(), 'Expect list to be empty');

		observer.reset();
		list.push(1);

		ok(!list.isEmpty(), 'Expect list to not be empty');
		strictEqual(observer.notifiedCount, 1, 'Expect observer to be notified once');

		observer.reset();
		list.pop();
		list.pop();

		strictEqual(observer.notifiedCount, 1, 'Expect observer to be notified once');
		ok(list.isEmpty(), 'Expect list to be empty');


		list.splice(0, 0, 1, 2, 3);

		ok(!list.isEmpty(), 'Expect list to not be empty');

		destroyObservableListTest(list);
	});

	test('peek test', function () {
		var state = setupObservableListTest(),
			list = state.list,
			observer = state.observer;

		strictEqual(typeof list.peek, 'function', 'Expect list to have an peek() method');

		strictEqual(list.peek(), 1, 'Expect the last item to be 1');
		strictEqual(observer.notifiedCount, 0, 'Expect observer to not be notified');
		ok(!list.isEmpty(), 'Expect the list to not be empty');


		list.pop();

		strictEqual(list.peek(), 3, 'Expect the last item to be 3');

		destroyObservableListTest(list);
	});

	test('insert test', function () {
		var state = setupObservableListTest(),
			list = state.list,
			observer = state.observer;

		strictEqual(typeof list.insert, 'function', 'Expect list to have an insert() method');

		list.insert(0, 10);

		strictEqual(observer.notifiedCount, 1, 'Expect observer to be notified once');
		strictEqual(list.join(', '), '10, 1, 2, 3, 1', 'Expect the list to contain [10, 1, 2, 3, 1]');


		observer.reset();
		list.insert(1, 20);

		strictEqual(observer.notifiedCount, 1, 'Expect observer to be notified once');
		strictEqual(list.join(', '), '10, 20, 1, 2, 3, 1', 'Expect the list to contain [10, 20, 1, 2, 3, 1]');


		observer.reset();
		list.insert(list.length, 30);

		strictEqual(observer.notifiedCount, 1, 'Expect observer to be notified once');
		strictEqual(list.join(', '), '10, 20, 1, 2, 3, 1, 30', 'Expect the list to contain [10, 20, 1, 2, 3, 1, 30]');


		observer.reset();
		list.insert(40, 0);

		strictEqual(observer.notifiedCount, 1, 'Expect observer to be notified once');
		strictEqual(list.join(', '), '10, 20, 1, 2, 3, 1, 30, 0', 'Expect the list to contain [10, 20, 1, 2, 3, 1, 30, 0]');


		observer.reset();
		delete list[0];
		list.insert(0, 0);

		strictEqual(observer.notifiedCount, 1, 'Expect observer to be notified once');
		strictEqual(list.join(', '), '0, 20, 1, 2, 3, 1, 30, 0', 'Expect the list to contain [0, 20, 1, 2, 3, 1, 30, 0]');


		observer.reset();
		list.insert(NaN, 0);

		strictEqual(observer.notifiedCount, 0, 'Expect observer to not be notified');

		destroyListTest(list);
	});
}(BINDER));