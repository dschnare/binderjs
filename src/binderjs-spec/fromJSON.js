	module('From JSON Tests');

	test('simple fromJSON test', function () {
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

		strictEqual(typeof model.firstName, 'function', 'Expect model.firstName to be a function');
		strictEqual(model.firstName(), 'Darren', 'Expect model.firstName() to equal "Darren"');
		strictEqual(typeof model.lastName, 'function', 'Expect model.lastName to be a function');
		strictEqual(model.lastName(), 'Schnare', 'Expect model.lastName() to equal "Schnare"');
		strictEqual(typeof model.skills, 'function', 'Expect model.skills to be a function');
		ok(binder.utiljs.isArray(model.skills()), 'Expect model.skills() to be an Array');
		strictEqual(model.skills().join(','), 'javascript,html,css,ruby', 'Expect model.skills() to equal [javascript, html, css, ruby]');
		strictEqual(typeof model.team, 'function', 'Expect model.team to be a function');
		ok(binder.utiljs.isArray(model.team()), 'Expect model.team() to be an Array');
		strictEqual(model.team()[0].firstName(), 'Alex', 'Expect model.team()[0].firstName() to equal "Alex"');
		strictEqual(model.team()[0].lastName(), 'Grendo', 'Expect model.team()[0].lastName() to equal "Grendo"');
		strictEqual(model.team()[1].firstName(), 'Sam', 'Expect model.team()[1].firstName() to equal "Sam"');
		strictEqual(model.team()[1].lastName(), 'Hilto', 'Expect model.team()[1].lastName() to equal "Hilto"');
		strictEqual(model.team()[2].firstName(), 'James', 'Expect model.team()[2].firstName() to equal "James"');
		strictEqual(model.team()[2].lastName(), 'Wazzabi', 'Expect model.team()[2].lastName() to equal "Wazzabi"');
	});

	test('custom fromJSON test', function () {
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

		strictEqual(typeof model.firstName, 'function', 'Expect model.firstName to be a function');
		strictEqual(model.firstName(), 'Darren', 'Expect model.firstName() to equal "Darren"');
		strictEqual(typeof model.lastName, 'function', 'Expect model.lastName to be a function');
		strictEqual(model.lastName(), 'Schnare', 'Expect model.lastName() to equal "Schnare"');
		strictEqual(model.fullName(), 'Darren Schnare', 'Expect model.fullName() to equal "Darren Schnare"');
		strictEqual(typeof model.skills, 'function', 'Expect model.skills to be a function');
		ok(binder.utiljs.isArray(model.skills()), 'Expect model.skills() to be an Array');
		strictEqual(model.skills().join(','), 'Javascript,Html,Css,Ruby', 'Expect model.skills() to equal [Javascript, Html, Css, Ruby]');
		strictEqual(typeof model.team, 'function', 'Expect model.team to be a function');
		ok(binder.utiljs.isArray(model.team()), 'Expect model.team() to be an Array');
		strictEqual(model.team()[0].name(), 'Alex Grendo', 'Expect model.team()[0].name() to equal "Alex Grendo"');
		strictEqual(model.team()[0].firstName, undefined, 'Expect model.team()[0].firstName to equal undefined');
		strictEqual(model.team()[0].lastName, undefined, 'Expect model.team()[0].lastName to equal undefined');
		strictEqual(model.team()[1].name(), 'Sam Hilto', 'Expect model.team()[1].name() to equal "Sam Hilto"');
		strictEqual(model.team()[1].firstName, undefined, 'Expect model.team()[1].firstName to equal undefined');
		strictEqual(model.team()[1].lastName, undefined, 'Expect model.team()[1].lastName to equal undefined');
		strictEqual(model.team()[2].name(), 'James Wazzabi', 'Expect model.team()[2].name() to equal "James Wazzabi"');
		strictEqual(model.team()[2].firstName, undefined, 'Expect model.team()[2].firstName to equal undefined');
		strictEqual(model.team()[2].lastName, undefined, 'Expect model.team()[2].lastName to equal undefined');
	});