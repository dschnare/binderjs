(function (binder, unit) {
	'use strict';

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
}(BINDER, UNIT));