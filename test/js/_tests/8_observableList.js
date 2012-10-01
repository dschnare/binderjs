	module('ObservableList Test');

	function setupObservableListTest() {
		var list = binder.mkObservableList(1, 2, 3, 1),
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


		comparison = binder.mkList(comparison);

		ok(comparison.every(function (item) {
			return item.status === 'retained';
		}), 'Expect all comparison objects to have a status of "retained"');


		l = [2, 3, 1];
		comparison = binder.mkList(list.compare(l));

		strictEqual(comparison[0].status, 'retained', 'Expect comparison object at index 0 to have a status of "retained"');
		strictEqual(comparison[1].status, 'retained', 'Expect comparison object at index 1 to have a status of "retained"');
		strictEqual(comparison[2].status, 'retained', 'Expect comparison object at index 2 to have a status of "retained"');
		strictEqual(comparison[3].status, 'deleted', 'Expect comparison object at index 3 to have a status of "deleted"');


		l = [2, 4];
		comparison = binder.mkList(list.compare(l));

		strictEqual(comparison[0].status, 'deleted', 'Expected comparison object at index 0 to have a status of "deleted"');
		strictEqual(comparison[1].status, 'retained', 'Expected comparison object at index 1 to have a status of "retained"');
		strictEqual(comparison[2].status, 'deleted', 'Expected comparison object at index 2 to have a status of "deleted"');
		strictEqual(comparison[3].status, 'deleted', 'Expected comparison object at index 3 to have a status of "deleted"');
		strictEqual(comparison[4].status, 'added', 'Expected comparison object at index 3 to have a status of "added"');
		strictEqual(comparison[4].otherIndex, 1, 'Expected comparison object at index 3 to have an otherIndex equal to 1');


		list = binder.mkObservableList(
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


		list = binder.mkObservableList(
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

		strictEqual(observer.notifiedCount, 0, 'Expect observer not to be notified when merging with identical lists');
		strictEqual(l, undefined, 'Expect the result of merging to be undefined');
		strictEqual(list.join(', '), '1, 2, 3, 1', 'Expect the list to be unmodified');


		a = [2, 3];
		observer.reset();
		list.mergeWith(a);

		strictEqual(observer.notifiedCount, 4, 'Expect observer to be notified four times');
		strictEqual(list.join(', '), '2, 3', 'Expect the list to contain [2, 3]');


		list.dispose();
		list = binder.mkObservableList(
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

		strictEqual(observer.notifiedCount, 3, 'Expect observer to be notified three times');
		strictEqual(list.join(', '), 'fruit, Vegetable, meat', 'Expect the list to contains [friuit, Vegetable, meat]');

		destroyObservableListTest(list);
	});

	test('remove test', function () {
		var state = setupObservableListTest(),
			list = state.list,
			observer = state.observer;

		strictEqual(typeof list.remove, 'function', 'Expect list to have an remove() method');

		list.remove(1);

		strictEqual(observer.notifiedCount, 2, 'Expect observer to be notified twice');
		strictEqual(list.join(', '), '2, 3', 'Expect the list to contain [2, 3]');


		observer.reset();
		list.remove(2, 3);

		strictEqual(observer.notifiedCount, 2, 'Expect observer to be notified twice');
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