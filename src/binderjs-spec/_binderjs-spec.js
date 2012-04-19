(function (binder, unit) {
	'use strict';

	var observableSuite = {{observable}},
		listSuite = {{list}},
		observableListSuite = {{observableList}},
		propertySuite = {{property}},
		bindingSuite = {{binding}},
		toJSONSuite = {{toJSON}},
		fromJSONSuite = {{fromJSON}};

	unit.makeTestHarness('Binderjs Test Harness',
		'Observable Test Suite', observableSuite,
		'List Test Suite', listSuite,
		'ObservableList Test Suite', observableListSuite,
		'Property Test Suite', propertySuite,
		'Binding Test Suite', bindingSuite,
		'toJSON Test Suite', toJSONSuite,
		'fromJSON Test Suite', fromJSONSuite).run();
}(BINDER, UNIT));