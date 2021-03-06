	module('To JSON Tests');

	test('simple toJSON test', function () {
		var o,
			model = {
				firstName: binder.mkProperty('Darren'),
				lastName: binder.mkProperty('Schnare'),
				skills: binder.mkProperty(['javascript', 'html', 'css', 'ruby']),
				team: [{
					firstName: binder.mkProperty('Alex'),
					lastName: binder.mkProperty('Grendo')
				}, {
					firstName: binder.mkProperty('Sam'),
					lastName: binder.mkProperty('Hilto')
				}, {
					firstName: binder.mkProperty('James'),
					lastName: binder.mkProperty('Wazzabi')
				}]
			};

		model.fullName = binder.mkProperty(function () {
			return model.firstName + ' ' + model.lastName;
		});

		o = binder.toJSON(model);

		strictEqual(o.firstName, 'Darren', 'Expect o.firstName to equal "Darren"');
		strictEqual(o.lastName, 'Schnare', 'Expect o.lastName to equal "Schnare"');
		strictEqual(o.fullName, 'Darren Schnare', 'Expect o.fullName to equal "Darren Schnare"');
		ok(util.isArray(o.skills), 'Expect o.skills to be an Array');
		strictEqual(o.skills.join(','), 'javascript,html,css,ruby', 'Expect o.skills to equal [javascript, html, css, ruby]');
		ok(util.isArray(o.team), 'Expect o.team to be an Array');
		strictEqual(o.team[0].firstName, 'Alex', 'Expect o.team[0].firstName to equal "Alex"');
		strictEqual(o.team[0].lastName, 'Grendo', 'Expect o.team[0].lastName to equal "Grendo"');
		strictEqual(o.team[1].firstName, 'Sam', 'Expect o.team[1].firstName to equal "Sam"');
		strictEqual(o.team[1].lastName, 'Hilto', 'Expect o.team[1].lastName to equal "Hilto"');
		strictEqual(o.team[2].firstName, 'James', 'Expect o.team[2].firstName to equal "James"');
		strictEqual(o.team[2].lastName, 'Wazzabi', 'Expect o.team[2].lastName to equal "Wazzabi"');
	});

	test('custom toJSON test', function () {
		var o,
			model = {
				firstName: binder.mkProperty('Darren'),
				lastName: binder.mkProperty('Schnare'),
				skills: binder.mkProperty(['javascript', 'html', 'css', 'ruby']),
				team: [{
					firstName: binder.mkProperty('Alex'),
					lastName: binder.mkProperty('Grendo')
				}, {
					firstName: binder.mkProperty('Sam'),
					lastName: binder.mkProperty('Hilto')
				}, {
					firstName: binder.mkProperty('James'),
					lastName: binder.mkProperty('Wazzabi')
				}]
			};

		model.fullName = binder.mkProperty(function () {
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

		strictEqual(o.firstName, 'Darren', 'Expect o.firstName to equal "Darren"');
		strictEqual(o.lastName, 'Schnare', 'Expect o.lastName to equal "Schnare"');
		strictEqual(o.fullName, undefined, 'Expect o.fullName to equal undefined');
		ok(util.isArray(o.skills), 'Expect o.skills to be an Array');
		strictEqual(o.skills.join(','), 'Javascript,Html,Css,Ruby', 'Expect o.skills to equal [Javascript, Html, Css, Ruby]');
		ok(util.isArray(o.team), 'Expect o.team to be an Array');
		strictEqual(o.team[0].name, 'Alex Grendo', 'Expect o.team[0].name to equal "Alex Grendo"');
		strictEqual(o.team[0].firstName, undefined, 'Expect o.team[0].firstName to equal undefined');
		strictEqual(o.team[0].lastName, undefined, 'Expect o.team[0].lastName to equal undefined');
		strictEqual(o.team[1].name, 'Sam Hilto', 'Expect o.team[1].name to equal "Sam Hilto"');
		strictEqual(o.team[1].firstName, undefined, 'Expect o.team[1].firstName to equal undefined');
		strictEqual(o.team[1].lastName, undefined, 'Expect o.team[1].lastName to equal undefined');
		strictEqual(o.team[2].name, 'James Wazzabi', 'Expect o.team[2].name to equal "James Wazzabi"');
		strictEqual(o.team[2].firstName, undefined, 'Expect o.team[2].firstName to equal undefined');
		strictEqual(o.team[2].lastName, undefined, 'Expect o.team[2].lastName to equal undefined');
	});