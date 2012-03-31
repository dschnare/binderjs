(function (binder, unit) {
	'use strict';

	/*global 'BINDER', 'UNIT'*/

	return {
		setupTest: function () {
			this.p1 = binder.makeProperty('Mario');
			this.p2 = binder.makeProperty('Luigi');
		},
		destroyTest: function () {
			if (this.binding) {
				this.binding.dispose();
			}

			delete this.binding;
			delete this.p1;
			delete this.p2;
		},
		adherenceTest: function () {
			unit.expectToThrow('makeBinding to throw an error', function () {
				binder.makeBinding(1, 2);
			});
			unit.expectToThrow('makeBinding to throw an error', function () {
				binder.makeBinding(1, this.p2);
			});
			unit.expectToThrow('makeBinding to throw an error', function () {
				binder.makeBinding(this.p1, 2);
			});
		},
		oneWayBindingTest: function () {
			this.binding = binder.makeBinding(this.p1, this.p2, 'oneway');

			unit.expect('the binding to have a type of "oneway"', this.binding.type() === 'oneway');
			unit.expect('the binding to have a source equal to p1', this.binding.source() === this.p1);
			unit.expect('the binding to have a sink equal to p2', this.binding.sink() === this.p2);
			unit.expect('p2 to have a value of "Mario"', 'Mario' === this.p2());

			this.p1('Luigi');

			unit.expect('p1 to have a value of "Luigi"', 'Luigi' === this.p1());
			unit.expect('p2 to have a value of "Luigi"', 'Luigi' === this.p2());


			this.p2('Mario');

			unit.expect('p1 to have a value of "Luigi"', 'Luigi' === this.p1());
			unit.expect('p2 to have a value of "Mario"', 'Mario' === this.p2());


			this.p1('Toad');

			unit.expect('p1 to have a value of "Toad"', 'Toad' === this.p1());
			unit.expect('p2 to have a value of "Toad"', 'Toad' === this.p2());
		},
		oneWayBindingTest2: function () {
			this.binding = binder.makeBinding(this.p1, this.p2, 'OneWAY');

			unit.expect('the binding to have a type of "oneway"', this.binding.type() === 'oneway');
			unit.expect('the binding to have a source equal to p1', this.binding.source() === this.p1);
			unit.expect('the binding to have a sink equal to p2', this.binding.sink() === this.p2);
			unit.expect('p2 to have a value of "Mario"', 'Mario' === this.p2());

			this.p1('Luigi');

			unit.expect('p1 to have a value of "Luigi"', 'Luigi' === this.p1());
			unit.expect('p2 to have a value of "Luigi"', 'Luigi' === this.p2());


			this.p2('Mario');

			unit.expect('p1 to have a value of "Luigi"', 'Luigi' === this.p1());
			unit.expect('p2 to have a value of "Mario"', 'Mario' === this.p2());

			this.p1('Toad');

			unit.expect('p1 to have a value of "Toad"', 'Toad' === this.p1());
			unit.expect('p2 to have a value of "Toad"', 'Toad' === this.p2());
		},
		twoWayBindingTest: function () {
			this.binding = binder.makeBinding(this.p1, this.p2);

			unit.expect('the binding to have a type of "twoway"', this.binding.type() === 'twoway');
			unit.expect('the binding to have a source equal to p1', this.binding.source() === this.p1);
			unit.expect('the binding to have a sink equal to p2', this.binding.sink() === this.p2);
			unit.expect('p2 to have a value of "Mario"', 'Mario' === this.p2());

			this.p1('Luigi');

			unit.expect('p1 to have a value of "Luigi"', 'Luigi' === this.p1());
			unit.expect('p2 to have a value of "Luigi"', 'Luigi' === this.p2());


			this.p2('Princess');

			unit.expect('p1 to have a value of "Princess"', 'Princess' === this.p1());
			unit.expect('p2 to have a value of "Princess"', 'Princess' === this.p2());


			this.p1('Toad');

			unit.expect('p1 to have a value of "Toad"', 'Toad' === this.p1());
			unit.expect('p2 to have a value of "Toad"', 'Toad' === this.p2());
		},
		twoWayBindingTest2: function () {
			this.binding = binder.makeBinding(this.p1, this.p2, 'TwoWAY');

			unit.expect('the binding to have a type of "twoway"', this.binding.type() === 'twoway');
			unit.expect('the binding to have a source equal to p1', this.binding.source() === this.p1);
			unit.expect('the binding to have a sink equal to p2', this.binding.sink() === this.p2);
			unit.expect('p2 to have a value of "Mario"', 'Mario' === this.p2());

			this.p1('Luigi');

			unit.expect('p1 to have a value of "Luigi"', 'Luigi' === this.p1());
			unit.expect('p2 to have a value of "Luigi"', 'Luigi' === this.p2());


			this.p2('Princess');

			unit.expect('p1 to have a value of "Princess"', 'Princess' === this.p1());
			unit.expect('p2 to have a value of "Princess"', 'Princess' === this.p2());


			this.p1('Toad');

			unit.expect('p1 to have a value of "Toad"', 'Toad' === this.p1());
			unit.expect('p2 to have a value of "Toad"', 'Toad' === this.p2());
		},
		onceBindingTest: function () {
			this.binding = binder.makeBinding(this.p1, this.p2, 'once');

			unit.expect('the binding to have a type of "once"', this.binding.type() === 'once');
			unit.expect('the binding to have a source equal to p1', this.binding.source() === this.p1);
			unit.expect('the binding to have a sink equal to p2', this.binding.sink() === this.p2);
			unit.expect('p2 to have a value of "Mario"', 'Mario' === this.p2());

			this.p1('Luigi');

			unit.expect('p1 to have a value of "Luigi"', 'Luigi' === this.p1());
			unit.expect('p2 to have a value of "Mario"', 'Mario' === this.p2());


			this.p2('Princess');

			unit.expect('p1 to have a value of "Luigi"', 'Luigi' === this.p1());
			unit.expect('p2 to have a value of "Princess"', 'Princess' === this.p2());


			this.p1('Toad');

			unit.expect('p1 to have a value of "Toad"', 'Toad' === this.p1());
			unit.expect('p2 to have a value of "Princess"', 'Princess' === this.p2());
		},
		onceBindingTest2: function () {
			this.binding = binder.makeBinding(this.p1, this.p2, 'ONcE');

			unit.expect('the binding to have a type of "once"', this.binding.type() === 'once');
			unit.expect('the binding to have a source equal to p1', this.binding.source() === this.p1);
			unit.expect('the binding to have a sink equal to p2', this.binding.sink() === this.p2);
			unit.expect('p2 to have a value of "Mario"', 'Mario' === this.p2());

			this.p1('Luigi');

			unit.expect('p1 to have a value of "Luigi"', 'Luigi' === this.p1());
			unit.expect('p2 to have a value of "Mario"', 'Mario' === this.p2());


			this.p2('Princess');

			unit.expect('p1 to have a value of "Luigi"', 'Luigi' === this.p1());
			unit.expect('p2 to have a value of "Princess"', 'Princess' === this.p2());


			this.p1('Toad');

			unit.expect('p1 to have a value of "Toad"', 'Toad' === this.p1());
			unit.expect('p2 to have a value of "Princess"', 'Princess' === this.p2());
		}
	};
}(BINDER, UNIT));