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