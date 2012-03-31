(function (binder, unit) {
	'use strict';

	/*global 'BINDER', 'UNIT'*/

	return {
		toObjectTest: function () {
			var model = {
					firstName: binder.makeProperty('Darren'),
					lastName: binder.makeProperty('Schnare'),
					skills: binder.makeProperty(['javascript', 'html', 'css', 'ruby'])
				};

			model.fullName = binder.makeProperty(function () {
				return model.firstName + ' ' + model.lastName;
			});

			var o = binder.toObject(model);

			unit.expect('o.firstName to equal "Darren"', o.firstName === 'Darren');
			unit.expect('o.lastName to equal "Schnare"', o.lastName === 'Schnare');
			unit.expect('o.fullName to equal "Darren Schnare"', o.fullName === 'Darren Schnare');
			unit.expect('o.skills to be an Array', binder.utiljs.isArray(o.skills));
			unit.expect('o.skills to equal [javascript, html, css, ruby]', o.skills.join(',') === 'javascript,html,css,ruby');


			// Convert to simple JavaScript object
			// excluding properties with dependencies
			// (i.e. dependent properties).
			o = binder.toObject(model, true);

			unit.expect('o.firstName to equal "Darren"', o.firstName === 'Darren');
			unit.expect('o.lastName to equal "Schnare"', o.lastName === 'Schnare');
			unit.expect('o.fullName to be undefined', o.fullName === undefined);
			unit.expect('o.skills to be an Array', binder.utiljs.isArray(o.skills));
			unit.expect('o.skills to equal [javascript, html, css, ruby]', o.skills.join(',') === 'javascript,html,css,ruby');
		}
	};

}(BINDER, UNIT));