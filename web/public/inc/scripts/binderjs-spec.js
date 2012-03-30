/*
Author: Darren Schnare
Keywords: javascript,binding,bind,property,list,observer,observable
License: MIT ( http://www.opensource.org/licenses/mit-license.php )
Repo: https://github.com/dschnare/binderjs
*/
(function (binder, unit) {
	'use strict';

	var observableSuite = (function (binder, unit) {
			/*global 'BINDER', 'UNIT', 'setTimeout'*/
		
			return {
				adherenceTest: function () {
					var ob = binder.makeObservable();
		
					unit.expect('binder.makeObservable to contain the property "interfce"', typeof binder.makeObservable.interfce === 'object' && binder.makeObservable.interfce);
					unit.expect('"ob" to adhere to the "binder.makeObservable.interfce" interface', binder.utiljs.adheresTo(ob, binder.makeObservable.interfce));
				},
				subscriptionTest: function () {
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
		
					unit.dontExpect('"fn" to be called', notified);
					unit.dontExpect('"observer.onNotify" to be called', observer.notified);
		
		
					subscriptions.fn = ob.subscribe(fn);
					subscriptions.observer = ob.subscribe(observer);
					notified = false;
					delete observer.notified;
					ob.notify();
		
					unit.expect('"fn" to be called', notified);
					unit.expect('"observer.onNotify" to be called', observer.notified);
		
		
					subscriptions.fn.dispose();
					notified = false;
					delete observer.notified;
					ob.notify();
		
					unit.dontExpect('"fn" to be called', notified);
					unit.expect('"observer.onNotify" to be called', observer.notified);
		
		
					subscriptions.observer.dispose();
					notified = false;
					delete observer.notified;
					ob.notify();
		
					unit.dontExpect('"fn" to be called', notified);
					unit.dontExpect('"observer.onNotify" to be called', observer.notified);
		
		
					unit.dontExpectToThrow('"subscriptions.fn.dispose" to throw an error', function () {
						subscriptions.fn.dispose();
					});
					unit.dontExpectToThrow('"subscriptions.observer.dispose" to throw an error', function () {
						subscriptions.observer.dispose();
					});
		
		
					notified = false;
					delete observer.notified;
					ob.notify();
		
					unit.dontExpect('"fn" to be called', notified);
					unit.dontExpect('"observer.onNotify" to be called', observer.notified);
		
		
					ob.subscribe(fn);
					ob.subscribe(observer);
					notified = false;
					delete observer.notified;
					ob.dispose();
					ob.notify();
		
					unit.dontExpect('"fn" to be called', notified);
					unit.dontExpect('"observer.onNotify" to be called', observer.notified);
				},
				blockingTest: function () {
					var ob = binder.makeObservable(),
						notified = false,
						fn = function () {
							notified = true;
						};
		
					ob.notify();
		
					unit.dontExpect('"fn" to be called', notified);
		
		
					notified = false;
					ob.subscribe(fn);
					ob.unblock();
					ob.notify();
		
					unit.expect('"fn" to be called', notified);
		
		
					notified = false;
					ob.block();
					ob.notify();
		
					unit.dontExpect('"fn" to be called', notified);
					ob.unblock();
					unit.dontExpect('"fn" to be called', notified);
		
					ob.dispose();
				},
				throttlingTest: function () {
					var ob = binder.makeObservable(),
						notified = false,
						fn = function () {
							notified = true;
						},
						promise = unit.util.promise.create();
		
					ob.subscribe(fn);
					ob.throttle(500);
					ob.notify();
					// The second notify should be ignored because we're throttling
					// and only one notification should be sent.
					ob.notify();
					unit.dontExpect('"fn" to be called', notified);
		
					setTimeout(function () {
						if (notified) {
							promise.fulfill();
						} else {
							promise.smash('Expected "fn" to be called after 500 milliseconds');
						}
					}, 500);
		
					return promise;
				},
				throttlingAndObservableDisposalTest: function () {
					var ob = binder.makeObservable(),
						notified = false,
						fn = function () {
							notified = true;
						},
						promise = unit.util.promise.create();
		
					ob.subscribe(fn);
					ob.throttle(500);
					ob.notify();
					// When the observable is disposed all throttling
					// 'threads' should be terminated.
					ob.dispose();
					unit.dontExpect('"fn" to be called', notified);
		
					setTimeout(function () {
						if (notified) {
							promise.smash('Did not expect "fn" to be called after 500 milliseconds');
						} else {
							promise.fulfill();
						}
					}, 500);
		
					return promise;
				},
				throttlingAndSubscriptionDisposalTest: function () {
					var ob = binder.makeObservable(),
						notified = false,
						fn = function () {
							notified = true;
						},
						promise = unit.util.promise.create(),
						subscription;
		
					subscription = ob.subscribe(fn);
					ob.throttle(500);
					ob.notify();
					// When the a subscription is disposed that is subscribing
					// to a throttled observable, the subscription should not
					// be notified.
					subscription.dispose();
					unit.dontExpect('"fn" to be called', notified);
		
					setTimeout(function () {
						if (notified) {
							promise.smash('Did not expect "fn" to be called after 500 milliseconds');
						} else {
							promise.fulfill();
						}
					}, 500);
		
					return promise;
				}
			};
		}(BINDER, UNIT)),
		listSuite = (function (binder, unit) {
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
		        },
		        compareTest: function () {
		        	unit.expect('list to have an compare() method', typeof this.list.compare === 'function');
		        },
		        mergeTest: function () {
		        	unit.expect('list to have an merge() method', typeof this.list.merge === 'function');
		        },
		        mergeWithTest: function () {
		        	unit.expect('list to have an merveWith() method', typeof this.list.mergeWith === 'function');
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
		}(BINDER, UNIT)),
		observableListSuite = (function (binder, unit) {
			/*global 'BINDER', 'UNIT'*/
		
			return {
		
			};
		}(BINDER, UNIT)),
		propertySuite = (function (binder, unit) {
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
		}(BINDER, UNIT)),
		bindingSuite = (function (binder, unit) {
			/*global 'BINDER', 'UNIT'*/
		
			return {
		
			};
		}(BINDER, UNIT));

	unit.makeTestHarness('Binderjs Test Harness',
		'Observable Test Suite', observableSuite,
		'List Test Suite', listSuite,
		'ObservableList Test Suite', observableListSuite,
		'Property Test Suite', propertySuite,
		'Binding Test Suite', bindingSuite).run();
}(BINDER, UNIT));