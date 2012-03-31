(function (binder, unit) {
	'use strict';

	/*global 'BINDER', 'UNIT'*/

	return {
		setupTest: function () {
			this.list = binder.makeList(1, 2, 3, 1);
		},
		destroyTest: function () {
			this.list.clear();
			delete this.list;
		},
		adherenceTest: function () {
			unit.expect('the list to be a native Array', Object.prototype.toString.call(this.list) === '[object Array]');
		},
		// EcmaScript 5 API
		indexOfTest: function () {
			unit.expect('list to have an indexOf() method', typeof this.list.indexOf === 'function');
			unit.expect('index of 2 to be 1', this.list.indexOf(2) === 1);
			unit.expect('index of 1 to be 0', this.list.indexOf(1) === 0);
			unit.expect('index of 1 from index 1 to be 3', this.list.indexOf(1, 1) === 3);
			unit.expect('index of 10 to be less than zero', this.list.indexOf(10) < 0);
        },
        lastIndexOfTest: function () {
        	unit.expect('list to have an lastIndexOf() method', typeof this.list.lastIndexOf === 'function');
        	unit.expect('last index of 2 to be 1', this.list.lastIndexOf(2) === 1);
			unit.expect('last index of 1 to be 3', this.list.lastIndexOf(1) === 3);
			unit.expect('last index of 1 from index 1 to be 0', this.list.lastIndexOf(1, 1) === 0);
			unit.expect('last index of 10 to be less than zero', this.list.lastIndexOf(10) < 0);
        },
        reverseTest: function () {
        	unit.expect('list to have an reverse() method', typeof this.list.reverse === 'function');
        	var l = this.list.reverse();
        	unit.expect('"list.reverse()" to return the same list', l === this.list);
        	unit.expect('the list to be in reverse order', this.list.join(',') === '1,3,2,1');
        },
        mapTest: function () {
        	unit.expect('list to have an map() method', typeof this.list.map === 'function');

        	var self = this,
        		o = {},
        		l = this.list.map(function (item, index, array) {
        			this.pass = array === self.list;
        			return index;
        		}, o);

        	unit.expect('the list to be unmodified', this.list.join(',') === '1,2,3,1');
        	unit.expect('the callback to be called with the correct scope and passed a reference to the list', o.pass);
        	unit.expect('"list.map()" to return a new list', l !== this.list);
        	unit.expect('the new list to be [0,1,2,3]', l.join(',') === '0,1,2,3');


        	l = this.list.map(function (item, index, array) {
        		if (index === 0) {
        			self.list.push(4);
        		}
    			return index;
    		});

    		unit.expect('the list to be unmodified', this.list.join(',') === '1,2,3,1,4');
        	unit.expect('the new list to be [0,1,2,3]', l.join(',') === '0,1,2,3');


        	l = this.list.map(function (item, index, array) {
        		if (index === 0) {
        			self.list.splice(4, 1);
        		}
        		if (index === 4) {
        			unit.fail('Did not expect the callback to be called with index 4');
        		}
    			return index;
    		});

    		unit.expect('the list to be unmodified', this.list.join(',') === '1,2,3,1');
        	unit.expect('the new list to be [0,1,2,3,]', l.join(',') === '0,1,2,3,');
        },
        filterTest: function () {
        	unit.expect('list to have an filter() method', typeof this.list.filter === 'function');

        	var self = this,
        		o = {},
        		l = this.list.filter(function (item, index, array) {
        			this.pass = array === self.list;
        			return item > 1;
        		}, o);

        	unit.expect('the list to be unmodified', this.list.join(',') === '1,2,3,1');
        	unit.expect('the callback to be called with the correct scope and passed a reference to the list', o.pass);
        	unit.expect('"list.filter()" to return a new list', l !== this.list);
        	unit.expect('the new list to be [2,3]', l.join(',') === '2,3');


        	l = this.list.filter(function (item, index, array) {
        		if (index === 0) {
        			self.list.push(4);
        		}
    			return item > 1;
    		});

    		unit.expect('the list to be unmodified', this.list.join(',') === '1,2,3,1,4');
        	unit.expect('the new list to be [2,3]', l.join(',') === '2,3');


        	l = this.list.filter(function (item, index, array) {
        		if (index === 0) {
        			self.list.splice(4, 1);
        		}
    			return item > 1;
    		});

    		unit.expect('the list to be unmodified', this.list.join(',') === '1,2,3,1');
        	unit.expect('the new list to be [2,3]', l.join(',') === '2,3');
        },
        forEachTest: function () {
        	unit.expect('list to have an forEach() method', typeof this.list.forEach === 'function');

        	var self = this,
        		o = {},
        		l = [];

        	this.list.forEach(function (item, index, array) {
        		this.pass = array === self.list;
        		l[index] = item;
        	}, o);

        	unit.expect('the list to be unmodified', this.list.join(',') === '1,2,3,1');
        	unit.expect('the callback to be called with the correct scope and passed a reference to the list', o.pass);
        	unit.expect('the new array to be [1,2,3,1]', l.join(',') === '1,2,3,1');
        },
        reduceTest: function () {
        	unit.expect('list to have an reduce() method', typeof this.list.reduce === 'function');

        	var self = this,
        		total = this.list.reduce(function (total, item, index, array) {
        			return total + item;
        		}, 0);

        	unit.expect('total to be 7', total === 7);


        	this.list[0] = 0;
    		total = this.list.reduce(function (total, item, index, array) {
    			return total + item;
    		});

        	unit.expect('total to be 6', total === 6);


        	delete this.list[0];
    		total = this.list.reduce(function (total, item, index, array) {
    			if (index === 2) {
    				self.list.splice(3, 1);
    			}
    			return total + item;
    		});

        	unit.expect('total to be 5', total === 5);


        	this.list[2] = undefined;
    		total = this.list.reduce(function (total, item, index, array) {
    			if (item === undefined) {
    				return total;
    			}
    			return total + item;
    		});

        	unit.expect('total to be 2', total === 2);
        },
        reduceRightTest: function () {
        	unit.expect('list to have an reduceRight() method', typeof this.list.reduceRight === 'function');

        	var self = this,
        		total = this.list.reduceRight(function (total, item, index, array) {
        			return total + item;
        		}, 0);

        	unit.expect('total to be 7', total === 7);


        	this.list[0] = 0;
    		total = this.list.reduceRight(function (total, item, index, array) {
    			return total + item;
    		});

        	unit.expect('total to be 6', total === 6);


        	delete this.list[0];
    		total = this.list.reduceRight(function (total, item, index, array) {
    			if (index === 2) {
    				self.list.splice(1, 1);
    			}
    			return total + item;
    		});

        	unit.expect('total to be 7', total === 7);


        	this.list[1] = undefined;
    		total = this.list.reduceRight(function (total, item, index, array) {
    			if (item === undefined) {
    				return total;
    			}
    			return total + item;
    		});

        	unit.expect('total to be 1', total === 1);
        },
        someTest: function () {
        	unit.expect('list to have an some() method', typeof this.list.some === 'function');

        	var o = {},
        		self = this,
        		value = this.list.some(function (item, index, array) {
        			this.pass = array === self.list;
        			return item === 2;
        		}, o);


        	unit.expect('the list to be unmodified', this.list.join(',') === '1,2,3,1');
        	unit.expect('the callback to be called with the correct scope and passed a reference to the list', o.pass);
        	unit.expect('"value" to be true', value);


        	value = this.list.some(function (item, index, array) {
    			return false;
    		});

    		unit.expect('"value" to be false', !value);


    		value = this.list.some(function (item, index, array) {
    			if (index === 1) {
    				self.list.splice(3, 1);
    			}
    			if (index === 3) {
    				unit.fail('Did not expect index 3 to be visited');
    			}
    			return false;
    		});

    		unit.expect('"value" to be false', !value);
        },
        everyTest: function () {
        	unit.expect('list to have an every() method', typeof this.list.every === 'function');

        	var o = {},
        		self = this,
        		value = this.list.every(function (item, index, array) {
        			this.pass = array === self.list;
        			return item === 2;
        		}, o);


        	unit.expect('the list to be unmodified', this.list.join(',') === '1,2,3,1');
        	unit.expect('the callback to be called with the correct scope and passed a reference to the list', o.pass);
        	unit.expect('"value" to be false', !value);


        	delete this.list[0];
        	value = this.list.every(function (item, index, array) {
        		if (index === 0) {
        			unit.fail('Did not expect index 0 to be visited');
        		}
    			return true;
    		});

    		unit.expect('"value" to be true', value);


    		value = this.list.every(function (item, index, array) {
    			if (index === 1) {
    				self.list.splice(3, 1);
    			}
    			if (index === 3) {
    				unit.fail('Did not expect index 3 to be visited');
    			}
    			return true;
    		});

    		unit.expect('"value" to be true', value);
        },

        // Custom Functionality.
        containsTest: function () {
        	unit.expect('list to have an contains() method', typeof this.list.contains === 'function');

        	unit.expect('list to contain 1', this.list.contains(1));
        	unit.expect('list to contain 3', this.list.contains(3));
        	unit.dontExpect('list to contain 30', this.list.contains(30));


        	this.list.clear();
        	unit.dontExpect('list to contain 3', this.list.contains(3));
        },
        occurancesTest: function () {
        	unit.expect('list to have an occurances() method', typeof this.list.occurances === 'function');

        	unit.expect('list to contain 2 occurances of 1', this.list.occurances(1) === 2);
        	unit.expect('list to contain 1 occurances of 2', this.list.occurances(2) === 1);
        	unit.expect('list to contain 2 occurances of 3', this.list.occurances(3) === 1);
        	unit.expect('list to contain 0 occurances of 14', this.list.occurances(14) === 0);


        	this.list.pop();
        	unit.expect('list to contain 1 occurances of 1', this.list.occurances(1) === 1);
        },
        distinctTest: function () {
        	unit.expect('list to have an distinct() method', typeof this.list.distinct === 'function');

        	var l = this.list.distinct();

        	unit.expect('the list to be unmodified', this.list.join(',') === '1,2,3,1');
        	unit.expect('the returned array to be [2,3]', l.join(',') === '2,3');
        },
        firstTest: function () {
        	unit.expect('list to have an first() method', typeof this.list.first === 'function');

        	var o = {},
        		self = this,
        		value = this.list.first(function (item, index, array) {
        			this.pass = array === self.list;
        			if (index > 0) {
        				unit.fail('Did not expect indices above 0 to be visited');
        			}
        			return item === 1;
        		}, o);

        	unit.expect('the list to be unmodified', this.list.join(',') === '1,2,3,1');
        	unit.expect('the callback to be called with the correct scope and passed a reference to the list', o.pass);
        	unit.expect('"value" to be equal to 1', value === 1);


        	value = this.list.first(function (item, index, array) {
    			return item === 31;
    		}, o);

    		unit.expect('"value" to be equal to undefined', value === undefined);
        },
        lastTest: function () {
        	unit.expect('list to have an last() method', typeof this.list.last === 'function');

        	var o = {},
        		self = this,
        		value = this.list.last(function (item, index, array) {
        			this.pass = array === self.list;
        			if (index < self.list.length - 1) {
        				unit.fail('Did not expect indices below the last index to be visited');
        			}
        			return item === 1;
        		}, o);

        	unit.expect('the list to be unmodified', this.list.join(',') === '1,2,3,1');
        	unit.expect('the callback to be called with the correct scope and passed a reference to the list', o.pass);
        	unit.expect('"value" to be equal to 1', value === 1);


        	value = this.list.last(function (item, index, array) {
    			return item === 31;
    		}, o);

    		unit.expect('"value" to be equal to undefined', value === undefined);
        },
        findTest: function () {
        	unit.expect('list to have an find() method', typeof this.list.find === 'function');

        	var o = {},
        		self = this,
        		value = this.list.find(function (item, index, array) {
        			this.pass = array === self.list;
        			if (index > 0) {
        				unit.fail('Did not expect indices above 0 to be visited');
        			}
        			return item === 1;
        		}, o);

        	unit.expect('the list to be unmodified', this.list.join(',') === '1,2,3,1');
        	unit.expect('the callback to be called with the correct scope and passed a reference to the list', o.pass);
        	unit.expect('"value" to have index 0', value.index === 0);


        	value = this.list.find(function (item, index, array) {
    			return item === 31;
    		}, o);

    		unit.expect('"value" to have a negative index', value.index < 0);


    		delete this.list[0];
    		value = this.list.find(function (item, index, array) {
    			if (index === 0) {
    				unit.fail('Did not expect index 0 to be visited');
    			}
    			return item === 1;
    		}, o);

    		unit.expect('"value" to have index 3', value.index === 3);
        },
        equalsTest: function () {
        	unit.expect('list to have an equals() method', typeof this.list.equals === 'function');

        	var b = [1,2,3,1];

        	unit.expect('the list to be equal to second list', this.list.equals(b));


        	b.pop();

        	unit.dontExpect('the list to be equal to second list', this.list.equals(b));


        	b.push(1);

        	unit.expect('the list to be equal to second list', this.list.equals(b));


        	this.list.getItemOperators = function () {
        		return {
        			equals: function (a, b) {
        				return false;
        			},
        			changed: function (a, b) {
        				return a !== b;
        			}
        		};
        	};

        	unit.dontExpect('the list to be equal to second list', this.list.equals(b));
        },
        changedTest: function () {
        	unit.expect('list to have an changed() method', typeof this.list.changed === 'function');

        	var b = [1,2,3,1];

        	unit.dontExpect('the list to be different than the second list', this.list.changed(b));


        	b.pop();

        	unit.expect('the list to be different than the second list', this.list.changed(b));


        	b.push(1);

        	unit.dontExpect('the list to be different than the second list', this.list.changed(b));


        	this.list.getItemOperators = function () {
        		return {
        			equals: function (a, b) {
        				return false;
        			},
        			changed: function (a, b) {
        				return true;
        			}
        		};
        	};

        	unit.expect('the list to be different than the second list', this.list.changed(b));
        },
        compareTest: function () {
        	unit.expect('list to have an compare() method', typeof this.list.compare === 'function');

        	var l = [1,2,3,1],
        		comparison = this.list.compare(l);

        	unit.expect('this list to not be the same list as the comparison result', this.list !== comparison);
        	unit.expect('the comparison result to have a length of 4', comparison.length === 4);


        	comparison = binder.makeList(comparison);

        	unit.expect('all comparison objects to have a status of "retained"', comparison.every(function (item) {
        		return item.status === 'retained';
        	}));


        	l = [2,3,1];
        	comparison = binder.makeList(this.list.compare(l));

        	unit.expect('comparison object at index 0 to have a status of "retained"', comparison[0].status === 'retained');
        	unit.expect('comparison object at index 1 to have a status of "retained"', comparison[1].status === 'retained');
        	unit.expect('comparison object at index 2 to have a status of "retained"', comparison[2].status === 'retained');
        	unit.expect('comparison object at index 3 to have a status of "deleted"', comparison[3].status === 'deleted');


        	l = [2,4];
        	comparison = binder.makeList(this.list.compare(l));

        	unit.expect('comparison object at index 0 to have a status of "deleted"', comparison[0].status === 'deleted');
        	unit.expect('comparison object at index 1 to have a status of "retained"', comparison[1].status === 'retained');
        	unit.expect('comparison object at index 2 to have a status of "deleted"', comparison[2].status === 'deleted');
        	unit.expect('comparison object at index 3 to have a status of "deleted"', comparison[3].status === 'deleted');
        	unit.expect('comparison object at index 3 to have a status of "added"', comparison[4].status === 'added');
        	unit.expect('comparison object at index 3 to have an otherIndex equal to 1', comparison[4].otherIndex === 1);


        	this.list = binder.makeList(
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

        	this.list.getItemOperators = function () {
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

        	comparison = this.list.compare(l);

        	unit.expect('comparison object at index 0 to have a status of "retained"', comparison[0].status === 'retained');
        	unit.expect('comparison object at index 1 to have a status of "changed"', comparison[1].status === 'changed');
        	unit.expect('comparison object at index 2 to have a status of "deleted"', comparison[2].status === 'deleted');
        	unit.expect('comparison object at index 3 to have a status of "added"', comparison[3].status === 'added');
        },
        mergeTest: function () {
        	unit.expect('list to have an merge() method', typeof this.list.merge === 'function');

        	var a = [1,2,3,1],
        		l = this.list.merge(a);

        	unit.expect('the merged list to not be the same list as the "this.list"', this.list !== l);
        	unit.expect('the merged list to contain [1,2,3,1]', l.join(',') === '1,2,3,1');


        	a = [2,3];
        	l = this.list.merge(a);

        	unit.expect('the merged list to contain [2, 3]', l.join(',') === '2,3');


        	this.list = binder.makeList(
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

        	this.list.getItemOperators = function () {
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

        	l = this.list.merge(a);

        	unit.expect('the merged list to contains [friuit, Vegetable, meat]', l.join(',') === 'fruit,Vegetable,meat');
        },
        mergeWithTest: function () {
        	unit.expect('list to have an merveWith() method', typeof this.list.mergeWith === 'function');

        	var a = [1,2,3,1],
        		l = this.list.mergeWith(a);

        	unit.expect('the result of merging to be undefined', l === undefined);
        	unit.expect('the list to be unmodified', this.list.join(',') === '1,2,3,1');


        	a = [2,3];
        	this.list.mergeWith(a);

        	unit.expect('the list to contain [2, 3]', this.list.join(',') === '2,3');


        	this.list = binder.makeList(
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

        	this.list.getItemOperators = function () {
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

        	this.list.mergeWith(a);

        	unit.expect('the list to contains [friuit, Vegetable, meat]', this.list.join(',') === 'fruit,Vegetable,meat');
        },
        removeTest: function () {
        	unit.expect('list to have an remove() method', typeof this.list.remove === 'function');

        	this.list.remove(1);

        	unit.expect('the list to contain [2,3]', this.list.join(',') === '2,3');


        	this.list.remove(2, 3);

        	unit.expect('the list to be empty', this.list.join(',') === '');
        },
        removeAtTest: function () {
        	unit.expect('list to have an removeAt() method', typeof this.list.removeAt === 'function');

        	unit.expect('the item that was removed to be equal to 0', this.list.removeAt(0) === 1);
        	unit.expect('the list to contain [2,3,1]', this.list.join(',') === '2,3,1');


        	unit.expect('the item that was removed to be equal to 0', this.list.removeAt(1) === 3);
        	unit.expect('the list to contain [2,1]', this.list.join(',') === '2,1');


        	unit.expect('the item that was removed to be equal to undefined', this.list.removeAt(20) === undefined);
        	unit.expect('the list to contain [2,1]', this.list.join(',') === '2,1');
        },
        clearTest: function () {
        	unit.expect('list to have an clear() method', typeof this.list.clear === 'function');

        	this.list.clear();

        	unit.expect('list to have length 0', this.list.length === 0);
        	unit.expect('list to contain nothing', this.list.join(',') === '');
        },
        collapseTest: function () {
        	unit.expect('list to have an collapse() method', typeof this.list.collapse === 'function');

        	this.list.collapse();

        	unit.expect('the list to be unmodified', this.list.join(',') === '1,2,3,1');


        	delete this.list[0];
        	this.list[1] = undefined;
        	this.list.collapse();

			unit.expect('the list to contain [3,1]', this.list.join(',') === '3,1');
        },
        replaceAtTest: function () {
        	unit.expect('list to have an replaceAt() method', typeof this.list.replaceAt === 'function');

        	this.list.replaceAt(0, 10);

        	unit.expect('index 0 to hold the value 10', this.list[0] === 10);
        	unit.expect('the list to contain [10,2,3,1]', this.list.join(',') === '10,2,3,1');


        	delete this.list[3];
        	this.list.replaceAt(3, 20);

        	unit.expect('index 3 to hold the value 20', this.list[3] === 20);
        	unit.expect('the list to contain [10,2,3,20]', this.list.join(',') === '10,2,3,20');
        },
        isEmptyTest: function () {
        	unit.expect('list to have an isEmpty() method', typeof this.list.isEmpty === 'function');

        	unit.dontExpect('list to be empty', this.list.isEmpty());


        	this.list.clear();

        	unit.expect('list to be empty', this.list.isEmpty());

        	this.list.push(1);

        	unit.dontExpect('list to be empty', this.list.isEmpty());


        	this.list.pop();
        	this.list.pop();

        	unit.expect('list to be empty', this.list.isEmpty());


        	this.list.splice(0, 0, 1, 2, 3);

        	unit.dontExpect('list to be empty', this.list.isEmpty());
        },
        peekTest: function () {
        	unit.expect('list to have an peek() method', typeof this.list.peek === 'function');

        	unit.expect('the last item to be 1', this.list.peek() === 1);
        	unit.dontExpect('the list to be empty', this.list.isEmpty());


        	this.list.pop();

        	unit.expect('the last item to be 3', this.list.peek() === 3);
        },
        insertTest: function () {
        	unit.expect('list to have an insert() method', typeof this.list.insert === 'function');

        	this.list.insert(0, 10);

        	unit.expect('the list to contain [10,1,2,3,1]', this.list.join(',') === '10,1,2,3,1');


        	this.list.insert(1, 20);

        	unit.expect('the list to contain [10,20,1,2,3,1]', this.list.join(',') === '10,20,1,2,3,1');


        	this.list.insert(this.list.length, 30);

        	unit.expect('the list to contain [10,20,1,2,3,1,30]', this.list.join(',') === '10,20,1,2,3,1,30');


        	this.list.insert(40, 0);

        	unit.expect('the list to contain [10,20,1,2,3,1,30,0]', this.list.join(',') === '10,20,1,2,3,1,30,0');


        	delete this.list[0];
        	this.list.insert(0, 0);

        	unit.expect('the list to contain [0,20,1,2,3,1,30,0]', this.list.join(',') === '0,20,1,2,3,1,30,0');
        }
	};
}(BINDER, UNIT));