	module('Observable Tests');

	test('adherence test', function () {
		var ob = binder.mkObservable();

		ok(typeof binder.mkObservable.interfce === 'object' && binder.mkObservable.interfce, 'Expect binder.mkObservable to contain the property "interfce"');
		ok(util.adheresTo(ob, binder.mkObservable.interfce), 'Expect "ob" to adhere to the "binder.mkObservable.interfce" interface');
	});

	test('subscription test', function () {
		var ob = binder.mkObservable(),
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
		var ob = binder.mkObservable(),
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

		var ob = binder.mkObservable(),
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

		var ob = binder.mkObservable(),
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