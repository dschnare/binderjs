(function (binder, unit) {
	'use strict';

	/*global 'BINDER', 'UNIT'*/

	return {
		simpleFromJSONTest: function () {
			var model,
				o = {
					firstName: 'Darren',
					lastName: 'Schnare',
					skills: ['javascript', 'html', 'css', 'ruby'],
					team: [{
						firstName: 'Alex',
						lastName: 'Grendo'
					}, {
						firstName: 'Sam',
						lastName: 'Hilto'
					}, {
						firstName: 'James',
						lastName: 'Wazzabi'
					}]
				};

			model = binder.fromJSON(o);

			unit.expect('model.firstName to be a function', typeof model.firstName === 'function');
			unit.expect('model.firstName() to equal "Darren"', model.firstName() === 'Darren');
			unit.expect('model.lastName to be a function', typeof model.lastName === 'function');
			unit.expect('model.lastName() to equal "Schnare"', model.lastName() === 'Schnare');
			unit.expect('model.skills to be a function', typeof model.skills === 'function');
			unit.expect('model.skills() to be an Array', binder.utiljs.isArray(model.skills()));
			unit.expect('model.skills() to equal [javascript, html, css, ruby]', model.skills().join(',') === 'javascript,html,css,ruby');
			unit.expect('model.team to be a function', typeof model.team === 'function');
			unit.expect('model.team() to be an Array', binder.utiljs.isArray(model.team()));
			unit.expect('model.team()[0].firstName() to equal "Alex"', model.team()[0].firstName() === 'Alex');
			unit.expect('model.team()[0].lastName() to equal "Grendo"', model.team()[0].lastName() === 'Grendo');
			unit.expect('model.team()[1].firstName() to equal "Sam"', model.team()[1].firstName() === 'Sam');
			unit.expect('model.team()[1].lastName() to equal "Hilto"', model.team()[1].lastName() === 'Hilto');
			unit.expect('model.team()[2].firstName() to equal "James"', model.team()[2].firstName() === 'James');
			unit.expect('model.team()[2].lastName() to equal "Wazzabi"', model.team()[2].lastName() === 'Wazzabi');
		},
		customFromJSONTest: function () {
			var model,
				o = {
					firstName: 'Darren',
					lastName: 'Schnare',
					skills: ['javascript', 'html', 'css', 'ruby'],
					team: [{
						firstName: 'Alex',
						lastName: 'Grendo'
					}, {
						firstName: 'Sam',
						lastName: 'Hilto'
					}, {
						firstName: 'James',
						lastName: 'Wazzabi'
					}]
				};

			model = binder.fromJSON(o, {
				filter: function (model, json) {
					model.fullName = binder.makeProperty(function () {
						return model.firstName + ' ' + model.lastName;
					});
					return model;
				},
				properties: {
					skills: function (model, json) {
						return json.charAt(0).toUpperCase() + json.substring(1);
					},
					team: {
						exclude: ['firstName', 'lastName'],
						filter: function (model, json) {
							model.name = binder.makeProperty(json.firstName + ' ' + json.lastName);
							return model;
						}
					}
				}
			});

			unit.expect('model.firstName to be a function', typeof model.firstName === 'function');
			unit.expect('model.firstName() to equal "Darren"', model.firstName() === 'Darren');
			unit.expect('model.lastName to be a function', typeof model.lastName === 'function');
			unit.expect('model.lastName() to equal "Schnare"', model.lastName() === 'Schnare');
			unit.expect('model.fullName() to equal "Darren Schnare"', model.fullName() === 'Darren Schnare');
			unit.expect('model.skills to be a function', typeof model.skills === 'function');
			unit.expect('model.skills() to be an Array', binder.utiljs.isArray(model.skills()));
			unit.expect('model.skills() to equal [Javascript, Html, Css, Ruby]', model.skills().join(',') === 'Javascript,Html,Css,Ruby');
			unit.expect('model.team to be a function', typeof model.team === 'function');
			unit.expect('model.team() to be an Array', binder.utiljs.isArray(model.team()));
			unit.expect('model.team()[0].name() to equal "Alex Grendo"', model.team()[0].name() === 'Alex Grendo');
			unit.expect('model.team()[0].firstName to equal undefined', model.team()[0].firstName === undefined);
			unit.expect('model.team()[0].lastName to equal undefined', model.team()[0].lastName === undefined);
			unit.expect('model.team()[1].name() to equal "Sam Hilto"', model.team()[1].name() === 'Sam Hilto');
			unit.expect('model.team()[1].firstName to equal undefined', model.team()[1].firstName === undefined);
			unit.expect('model.team()[1].lastName to equal undefined', model.team()[1].lastName === undefined);
			unit.expect('model.team()[2].name() to equal "James Wazzabi"', model.team()[2].name() === 'James Wazzabi');
			unit.expect('model.team()[2].firstName to equal undefined', model.team()[2].firstName === undefined);
			unit.expect('model.team()[2].lastName to equal undefined', model.team()[2].lastName === undefined);
		}
	};

}(BINDER, UNIT));