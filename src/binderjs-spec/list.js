(function (binder, unit) {
	'use strict';

	/*global 'BINDER', 'UNIT'*/

	return {
		setupSuite: function () {
			this.list = binder.makeList(1, 2, 3);
		},
		destroySuite: function () {
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
			unit.expect('index of 10 to be less than zero', this.list.indexOf(10) < 0);
        },
        lastIndexOf: function () {
        	unit.expect('list to have an lastIndexOf() method', typeof this.list.lastIndexOf === 'function');
        },
        reverse: function () {
        	unit.expect('list to have an reverse() method', typeof this.list.reverse === 'function');
        },
        map: function () {
        	unit.expect('list to have an map() method', typeof this.list.map === 'function');
        },
        filter: function () {
        	unit.expect('list to have an filter() method', typeof this.list.filter === 'function');
        },
        forEach: function () {
        	unit.expect('list to have an forEach() method', typeof this.list.forEach === 'function');
        },
        reduce: function () {
        	unit.expect('list to have an reduce() method', typeof this.list.reduce === 'function');
        },
        reduceRight: function () {
        	unit.expect('list to have an reduceRight() method', typeof this.list.reduceRight === 'function');
        },
        some: function () {
        	unit.expect('list to have an some() method', typeof this.list.some === 'function');
        },
        every: function () {
        	unit.expect('list to have an every() method', typeof this.list.every === 'function');
        },

        // Custom Functionality.
        contains: function () {
        	unit.expect('list to have an contains() method', typeof this.list.contains === 'function');
        },
        occurances: function () {
        	unit.expect('list to have an occurances() method', typeof this.list.occurances === 'function');
        },
        distinct: function () {
        	unit.expect('list to have an distinct() method', typeof this.list.distinct === 'function');
        },
        first: function () {
        	unit.expect('list to have an first() method', typeof this.list.first === 'function');
        },
        last: function () {
        	unit.expect('list to have an last() method', typeof this.list.last === 'function');
        },
        find: function () {
        	unit.expect('list to have an find() method', typeof this.list.find === 'function');
        },
        equals: function () {
        	unit.expect('list to have an equals() method', typeof this.list.equals === 'function');
        },
        changed: function () {
        	unit.expect('list to have an changed() method', typeof this.list.changed === 'function');
        },
        compare: function () {
        	unit.expect('list to have an compare() method', typeof this.list.compare === 'function');
        },
        merge: function () {
        	unit.expect('list to have an merge() method', typeof this.list.merge === 'function');
        },
        mergeWith: function () {
        	unit.expect('list to have an merveWith() method', typeof this.list.mergeWith === 'function');
        },
        remove: function () {
        	unit.expect('list to have an remove() method', typeof this.list.remove === 'function');
        },
        removeAt: function () {
        	unit.expect('list to have an removeAt() method', typeof this.list.removeAt === 'function');
        },
        clear: function () {
        	unit.expect('list to have an clear() method', typeof this.list.clear === 'function');
        },
        collapse: function () {
        	unit.expect('list to have an collapse() method', typeof this.list.collapse === 'function');
        },
        replaceAt: function () {
        	unit.expect('list to have an replaceAt() method', typeof this.list.replaceAt === 'function');
        },
        isEmpty: function () {
        	unit.expect('list to have an isEmpty() method', typeof this.list.isEmpty === 'function');
        },
        peek: function () {
        	unit.expect('list to have an peek() method', typeof this.list.peek === 'function');
        },
        insert: function () {
        	unit.expect('list to have an insert() method', typeof this.list.insert === 'function');
        }
	};
}(BINDER, UNIT));