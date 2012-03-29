(function (binder, unit) {
	'use strict';

	/*global 'BINDER', 'UNIT'*/

	var testArrayProperty = function (p) {
			unit.expect('"p.toString()" to be equal to "1,2,3"', p.toString() === '1,2,3');
			unit.expect('"p().join(",")" to be equal to "1,2,3"', p().join(',') === '1,2,3');
			unit.expect('"p.get().join(",")" to be equal to "1,2,3"', p.get().join(',') === '1,2,3');
			unit.expect('"p.valueOf().join(",")" to be equal to "1,2,3"', p.valueOf().join(',') === '1,2,3');

			p().push(4);

			unit.expect('"p.valueOf().join(",")" to be equal to "1,2,3,4"', p.valueOf().join(',') === '1,2,3,4');

			var notified = false;
			p.subscribe(function () {
				notified = true;
			});


			notified = false;
			p().remove(1);
			unit.expect('the property to be notified when the first element is removed', notified);

			notified = false;
			p().clear();
			unit.expect('the property to be notified when the list is cleared', notified);

			notified = false;
			p().push(1, 2, 3);
			unit.expect('the property to be notified when new items are pushed onto the list', notified);

			notified = false;
			p().pop();
			unit.expect('the property to be notified when an item is popped off the list', notified);

			notified = false;
			p().shift();
			unit.expect('the property to be notified when item is removed from front of list', notified);

			notified = false;
			p().unshift(1);
			unit.expect('the property to be notified when item is prepended to front of list', notified);

			notified = false;
			p().splice(0, 1);
			unit.expect('the property to be notified when the list is spliced', notified);

			notified = false;
			p().splice(0, 0);
			unit.dontExpect('the property to be notified when the list is spliced but zero elements are removed and added', notified);

			p().push(10);
			notified = false;
			p().sort();
			unit.expect('the property to be notified when the list is sorted', notified);

			notified = false;
			p().insert(0, 11);
			unit.expect('the property to be notified when an item is inserted', notified);

			notified = false;
			p().reverse();
			unit.expect('the property to be notified when the list is reversed', notified);

			notified = false;
			p().replaceAt(0, 99);
			unit.expect('the property to be notified when an item is replaced', notified);

			notified = false;
			p()[0] = undefined;
			p().collapse();
			unit.expect('the property to be notified when a sparse list is collapsed', notified);
		};

	return {
		adherenceTest: function () {
			var p = binder.makeProperty('value');

			unit.expect('"p" to adhere to the "binder.makeProperty.interfce" interface', binder.utiljs.adheresTo(p, binder.makeProperty.interfce));
			unit.dontExpect('"p" to not be dependent', p.isDependent());
			unit.expect('"p" to have no dependencies', p.dependencies().length === 0);
			unit.expect('"p.toString()" to be equal to "value"', p.toString() === 'value');
			unit.expect('"p.valueOf()" to be equal to "value"', p.valueOf() === 'value');
			unit.expect('"p.get()" to be equal to "value"', p.get() === 'value');
			unit.expect('"p()" to be equal to "value"', p() === 'value');


			p('value2');

			unit.expect('"p.toString()" to be equal to "value2"', p.toString() === 'value2');
			unit.expect('"p.valueOf()" to be equal to "value2"', p.valueOf() === 'value2');
			unit.expect('"p.get()" to be equal to "value2"', p.get() === 'value2');
			unit.expect('"p()" to be equal to "value2"', p() === 'value2');


			p.set('value3');

			unit.expect('"p.toString()" to be equal to "value3"', p.toString() === 'value3');
			unit.expect('"p.valueOf()" to be equal to "value3"', p.valueOf() === 'value3');
			unit.expect('"p.get()" to be equal to "value3"', p.get() === 'value3');
			unit.expect('"p()" to be equal to "value3"', p() === 'value3');


			p.dispose();
		},
		dependenciesTest: function () {
			var fname = binder.makeProperty('Super'),
				lname = binder.makeProperty('Mario'),
				notified = false,
				fullName = binder.makeProperty(function () {
					return fname + ' ' + lname;
				}),
				deps = fullName.dependencies();

			unit.expect('"fullName" to be dependent', fullName.isDependent());
			unit.expect('"fullName" to be dependent on "fname" and "lname"', deps.contains(fname) && deps.contains(lname));
			unit.expect('"fullName()" to be equal to "Super Mario"', fullName() === 'Super Mario');


			fullName.subscribe(function () {
				notified = true;
			});
			fname.set('super');

			unit.expect('"fullName" to be notified that "fname" has been changed', notified);
			unit.expect('"fullName()" to be equal to "super Mario"', fullName() === 'super Mario');


			notified = false;
			fullName.dispose();
			fname.set('Super');

			unit.dontExpect('"fullName" to be notified that "fname" has been changed', notified);
			unit.dontExpect('"fullName" to be dependent', fullName.isDependent());
			unit.dontExpect('"fullName" to be dependent on "fname" and "lname"', deps.contains(fname) && deps.contains(lname));
			unit.expect('"fullName()" to be equal to "super Mario"', fullName() === 'super Mario');
		},
		memoizationTest: function () {
			var computed = false,
				p = binder.makeProperty(function () {
					computed = true;
					return 'value';
				});

			unit.expect('property to have been called', computed);


			computed = false;
			p();

			unit.dontExpect('property to have been called', computed);


			p.clearMemo();
			p();

			unit.expect('property to have been called', computed);
		},
		lazyTest: function () {
			var computed = false,
				p = binder.makeProperty({
					lazy: true,
					get: function () {
						computed = true;
						return 'value';
					}
				});

			unit.dontExpect('property to have been called', computed);


			p();

			unit.expect('property to have been called', computed);
		},

		simpleConstructionTest: function () {
			var p = binder.makeProperty('value');

			unit.expect('"p.toString()" to be equal to "value"', p.toString() === 'value');
			unit.expect('"p.valueOf()" to be equal to "value"', p.valueOf() === 'value');
			unit.expect('"p.get()" to be equal to "value"', p.get() === 'value');
			unit.expect('"p()" to be equal to "value"', p() === 'value');
		},
		valueParameterizedConstructionTest: function () {
			var p = binder.makeProperty({
				value: 'value'
			});

			unit.expect('"p.toString()" to be equal to "value"', p.toString() === 'value');
			unit.expect('"p.valueOf()" to be equal to "value"', p.valueOf() === 'value');
			unit.expect('"p.get()" to be equal to "value"', p.get() === 'value');
			unit.expect('"p()" to be equal to "value"', p() === 'value');
		},
		getConstructionTest: function () {
			var get = false,
				p = binder.makeProperty({
					get: function () {
						get = true;
						return 'value';
					}
				});

			unit.expect('the custom getter to be called', get);
			unit.expect('"p.toString()" to be equal to "value"', p.toString() === 'value');
			unit.expect('"p.valueOf()" to be equal to "value"', p.valueOf() === 'value');
			unit.expect('"p.get()" to be equal to "value"', p.get() === 'value');
			unit.expect('"p()" to be equal to "value"', p() === 'value');
		},
		getSetConstructionTest: function () {
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

			unit.expect('the custom getter to be called', get);
			unit.expect('"p.toString()" to be equal to "value"', p.toString() === 'value');
			unit.expect('"p.valueOf()" to be equal to "value"', p.valueOf() === 'value');
			unit.expect('"p.get()" to be equal to "value"', p.get() === 'value');
			unit.expect('"p()" to be equal to "value"', p() === 'value');


			p('value');

			unit.dontExpect('the custom setter to be called', set);


			p('new value');

			unit.expect('the custom setter to be called', set);
		},
		getSetLazyConstructionTest: function () {
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

			unit.dontExpect('the custom getter to be called', get);
			unit.expect('"p.toString()" to be equal to "value"', p.toString() === 'value');
			unit.expect('the custom getter to be called', get);
			unit.expect('"p.valueOf()" to be equal to "value"', p.valueOf() === 'value');
			unit.expect('"p.get()" to be equal to "value"', p.get() === 'value');
			unit.expect('"p()" to be equal to "value"', p() === 'value');


			p('value');

			unit.dontExpect('the custom setter to be called', set);


			p('new value');

			unit.expect('the custom setter to be called', set);
		},
		observableValuePropertyTest: function () {
			var o = binder.makeObservable();
			var p = binder.makeProperty(o);

			unit.expect('"p.toString()" to be equal to the empty string', p.toString() === '');
			unit.expect('"p.valueOf()" to be equal to undefined', p.valueOf() === undefined);
			unit.expect('"p.get()" to be equal to undefined', p.get() === undefined);
			unit.expect('"p()" to be equal to undefined', p() === undefined);


			o.valueOf = function () {
				return 'observable';
			};
			o.toString = o.valueOf;
			p = binder.makeProperty({
				value: o
			});

			unit.expect('"p.toString()" to be equal to "o.toString()"', p.toString() === o.toString());
			unit.expect('"p.valueOf()" to be equal to "o.valueOf()"', p.valueOf() === o.valueOf());
			unit.expect('"p.get()" to be equal to o', p.get() === o);
			unit.expect('"p()" to be equal to o', p() === o);


			var notified = false;
			p.subscribe(function () {
				notified = true;
			});

			o.notify();

			unit.expect('the property to be notified when "o" has been notified', notified);


			p.dispose();
		},
		operatorsTest: function () {
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


			unit.expect('property to be equal to {id: 0}', p.equals({id: 0}));
			unit.expect('custom equality operator to be called', equals);
			unit.expect('property to be equal to {id: 0, label: "pear"} and will be changed if set', p.equals({id: 0, label: 'pear'}) && p.changed({id: 0, label: 'pear'}));
			unit.expect('custom equality operator to be called', changed);
		},
		arrayTest: function () {
			// When the value is an Array, the underlying value
			// converted to an ObservableList.
			var p = binder.makeProperty([1, 2, 3]);

			testArrayProperty(p);
		},
		observableListTest: function () {
			var l = binder.makeObservableList([1, 2, 3]),
				p = binder.makeProperty(l);

			testArrayProperty(p);
		},
		listOperatorsTest: function () {
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

			unit.expect('the property to equal the list', p.equals(l));


			l.pop();

			unit.dontExpect('the property to equal the list', p.equals(l));
			unit.expect('the property to change if set to the list', p.changed(l));
		}
	};
}(BINDER, UNIT));