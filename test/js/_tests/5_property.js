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
		var p = binder.mkProperty('value');

		ok(util.adheresTo(p, binder.mkProperty.interfce), 'Expect "p" to adhere to the "binder.mkProperty.interfce" interface');
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
		var fname = binder.mkProperty('Super'),
			lname = binder.mkProperty('Mario'),
			notified = false,
			fullName = binder.mkProperty(function () {
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
			p = binder.mkProperty(function () {
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
			p = binder.mkProperty({
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
		var p = binder.mkProperty('value');

		strictEqual(p.toString(), 'value', 'Expect "p.toString()" to be equal to "value"');
		strictEqual(p.valueOf(), 'value', 'Expect "p.valueOf()" to be equal to "value"');
		strictEqual(p.get(), 'value', 'Expect "p.get()" to be equal to "value"');
		strictEqual(p(), 'value', 'Expect "p()" to be equal to "value"');
	});

	test('value parameterized construction test', function () {
		var p = binder.mkProperty({
				value: 'value'
			});

		strictEqual(p.toString(), 'value', 'Expect "p.toString()" to be equal to "value"');
		strictEqual(p.valueOf(), 'value', 'Expect "p.valueOf()" to be equal to "value"');
		strictEqual(p.get(), 'value', 'Expect "p.get()" to be equal to "value"');
		strictEqual(p(), 'value', 'Expect "p()" to be equal to "value"');
	});

	test('custom getter construction test', function () {
		var get = false,
			p = binder.mkProperty({
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
			p = binder.mkProperty({
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
			p = binder.mkProperty({
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
		var o = binder.mkObservable(),
			p = binder.mkProperty(o),
			notified;

		strictEqual(p.toString(), '', 'Expect "p.toString()" to be equal to the empty string');
		strictEqual(p.valueOf(), undefined, 'Expect "p.valueOf()" to be equal to undefined');
		strictEqual(p.get(), undefined, 'Expect "p.get()" to be equal to undefined');
		strictEqual(p(), undefined, 'Expect "p()" to be equal to undefined');


		o.valueOf = function () {
			return 'observable';
		};
		o.toString = o.valueOf;
		p = binder.mkProperty({
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
			p = binder.mkProperty({
				value: {
					id: 0,
					label: 'apple'
				},
				equals: function (b) {
					equals = true;
					var a = this.get();
					b = binder.mkProperty.get(b);
					return a.id === b.id;
				},
				changed: function (b) {
					changed = true;
					var a = this.get();
					b = binder.mkProperty.get(b);
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
		var p = binder.mkProperty([1, 2, 3]);

		testArrayProperty(p);
	});

	test('observable list property value test', function () {
		var l = binder.mkObservableList([1, 2, 3]),
			p = binder.mkProperty(l);

		testArrayProperty(p);
	});

	test('list operators test', function () {
		var p = binder.mkProperty({
				value: binder.mkList(
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
			l = binder.mkList(
				{id: 0, label: 'apple'},
				{id: 1, label: 'pear'},
				{id: 2, label: 'orange'}
			);

		ok(p.equals(l), 'Expect the property to equal the list');


		l.pop();

		notStrictEqual(p.equals(l), 'Expect the property to equal the list');
		ok(p.changed(l), 'Expect the property to change if set to the list');
	});