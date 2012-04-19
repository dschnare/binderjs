(function (binder, unit) {
	'use strict';

	/*global 'BINDER', 'UNIT'*/

	return {
		simpleToJSONTest: function () {
			var o,
				model = {
					firstName: binder.makeProperty('Darren'),
					lastName: binder.makeProperty('Schnare'),
					skills: binder.makeProperty(['javascript', 'html', 'css', 'ruby']),
					team: [{
						firstName: binder.makeProperty('Alex'),
						lastName: binder.makeProperty('Grendo')
					}, {
						firstName: binder.makeProperty('Sam'),
						lastName: binder.makeProperty('Hilto')
					}, {
						firstName: binder.makeProperty('James'),
						lastName: binder.makeProperty('Wazzabi')
					}]
				};

			model.fullName = binder.makeProperty(function () {
				return model.firstName + ' ' + model.lastName;
			});

			o = binder.toJSON(model);

			unit.expect('o.firstName to equal "Darren"', o.firstName === 'Darren');
			unit.expect('o.lastName to equal "Schnare"', o.lastName === 'Schnare');
			unit.expect('o.fullName to equal "Darren Schnare"', o.fullName === 'Darren Schnare');
			unit.expect('o.skills to be an Array', binder.utiljs.isArray(o.skills));
			unit.expect('o.skills to equal [javascript, html, css, ruby]', o.skills.join(',') === 'javascript,html,css,ruby');
			unit.expect('o.team to be an Array', binder.utiljs.isArray(o.team));
			unit.expect('o.team[0].firstName to equal "Alex"', o.team[0].firstName === 'Alex');
			unit.expect('o.team[0].lastName to equal "Grendo"', o.team[0].lastName === 'Grendo');
			unit.expect('o.team[1].firstName to equal "Sam"', o.team[1].firstName === 'Sam');
			unit.expect('o.team[1].lastName to equal "Hilto"', o.team[1].lastName === 'Hilto');
			unit.expect('o.team[2].firstName to equal "James"', o.team[2].firstName === 'James');
			unit.expect('o.team[2].lastName to equal "Wazzabi"', o.team[2].lastName === 'Wazzabi');
		},
		customToJSONTest: function () {
			var o,
				model = {
					firstName: binder.makeProperty('Darren'),
					lastName: binder.makeProperty('Schnare'),
					skills: binder.makeProperty(['javascript', 'html', 'css', 'ruby']),
					team: [{
						firstName: binder.makeProperty('Alex'),
						lastName: binder.makeProperty('Grendo')
					}, {
						firstName: binder.makeProperty('Sam'),
						lastName: binder.makeProperty('Hilto')
					}, {
						firstName: binder.makeProperty('James'),
						lastName: binder.makeProperty('Wazzabi')
					}]
				};

			model.fullName = binder.makeProperty(function () {
				return model.firstName + ' ' + model.lastName;
			});

			o = binder.toJSON(model, {
				exclude: ['fullName'],
				properties: {
					skills: function (skill) {
						return skill.charAt(0).toUpperCase() + skill.substring(1);
					},
					team: {
						exclude: ['firstName', 'lastName'],
						filter: function (json, original) {
							json.name = original.firstName + ' ' + original.lastName;
							return json;
						}
					}
				}
			});

			unit.expect('o.firstName to equal "Darren"', o.firstName === 'Darren');
			unit.expect('o.lastName to equal "Schnare"', o.lastName === 'Schnare');
			unit.expect('o.fullName to equal undefined', o.fullName === undefined);
			unit.expect('o.skills to be an Array', binder.utiljs.isArray(o.skills));
			unit.expect('o.skills to equal [Javascript, Html, Css, Ruby]', o.skills.join(',') === 'Javascript,Html,Css,Ruby');
			unit.expect('o.team to be an Array', binder.utiljs.isArray(o.team));
			unit.expect('o.team[0].name to equal "Alex Grendo"', o.team[0].name === 'Alex Grendo');
			unit.expect('o.team[0].firstName to equal undefined', o.team[0].firstName === undefined);
			unit.expect('o.team[0].lastName to equal undefined', o.team[0].lastName === undefined);
			unit.expect('o.team[1].name to equal "Sam Hilto"', o.team[1].name === 'Sam Hilto');
			unit.expect('o.team[1].firstName to equal undefined', o.team[1].firstName === undefined);
			unit.expect('o.team[1].lastName to equal undefined', o.team[1].lastName === undefined);
			unit.expect('o.team[2].name to equal "James Wazzabi"', o.team[2].name === 'James Wazzabi');
			unit.expect('o.team[2].firstName to equal undefined', o.team[2].firstName === undefined);
			unit.expect('o.team[2].lastName to equal undefined', o.team[2].lastName === undefined);
		}
	};

}(BINDER, UNIT));