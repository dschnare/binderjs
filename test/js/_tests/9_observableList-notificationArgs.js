	module('ObservableList Notification Arguments Tests');

	test('remove test', function () {
		var list = BINDER.mkObservableList(1, 2, 3),
			subscription,
			actions,
			actionArgs;

		list.subscribe(function (observer, actionArgs) {
			actions.push(actionArgs);
		});

		actions = [];
		list.remove(2);

		actionArgs = actions[0];
		strictEqual(actionArgs.action, 'remove', "Expected the actionArgs type to be 'remove'.");
		strictEqual(actionArgs.newStartingIndex, -1, "Expected the actionArgs newStartingIndex to be -1.");
		strictEqual(actionArgs.newItems.join(','), '', "Expected the actionArgs newItems to be [].");
		strictEqual(actionArgs.oldStartingIndex, 1, "Expected the actionArgs oldStartingIndex to be 1.");
		strictEqual(actionArgs.oldItems.join(','), '2', "Expected the actionArgs oldItems to be [2].");

		actions = [];
		list.remove(1, 3, 4, 5, 6);

		strictEqual(actions.length, 2, "Expected the list to notify twice.");

		actionArgs = actions[0];
		strictEqual(actionArgs.action, 'remove', "Expected the actionArgs type to be 'remove'.");
		strictEqual(actionArgs.newStartingIndex, -1, "Expected the actionArgs newStartingIndex to be -1.");
		strictEqual(actionArgs.newItems.join(','), '', "Expected the actionArgs newItems to be [].");
		strictEqual(actionArgs.oldStartingIndex, 0, "Expected the actionArgs oldStartingIndex to be 0.");
		strictEqual(actionArgs.oldItems.join(','), '1', "Expected the actionArgs oldItems to be [1].");

		actionArgs = actions[1];
		strictEqual(actionArgs.action, 'remove', "Expected the actionArgs type to be 'remove'.");
		strictEqual(actionArgs.newStartingIndex, -1, "Expected the actionArgs newStartingIndex to be -1.");
		strictEqual(actionArgs.newItems.join(','), '', "Expected the actionArgs newItems to be [].");
		strictEqual(actionArgs.oldStartingIndex, 0, "Expected the actionArgs oldStartingIndex to be 0.");
		strictEqual(actionArgs.oldItems.join(','), '3', "Expected the actionArgs oldItems to be [3].");

		ok(list.isEmpty(), "Expected the list to be empty.");

		actions = [];
		list.remove(1, 2, 3);

		strictEqual(actions.length, 0, "Expected the list to not notify when attempting to remove items from an empty list.");
	});

	test('replaceAt test', function () {
		var list = BINDER.mkObservableList(1, 2, 3),
			subscription,
			actions,
			actionArgs;

		list.subscribe(function (observer, actionArgs) {
			actions.push(actionArgs);
		});

		actions = [];
		list.replaceAt(-1, 0);

		strictEqual(actions.length, 0, "Expected the list to not notify when attempting to replace an item out of range.");

		list.replaceAt(2, 4);

		actionArgs = actions[0];
		strictEqual(actionArgs.action, 'replace', "Expected the actionArgs type to be 'replace'.");
		strictEqual(actionArgs.newStartingIndex, 2, "Expected the actionArgs newStartingIndex to be 2.");
		strictEqual(actionArgs.newItems.join(','), '4', "Expected the actionArgs newItems to be [4].");
		strictEqual(actionArgs.oldStartingIndex, 2, "Expected the actionArgs oldStartingIndex to be 2.");
		strictEqual(actionArgs.oldItems.join(','), '3', "Expected the actionArgs oldItems to be [3].");
	});

	test('clear test', function () {
		var list = BINDER.mkObservableList(1, 2, 3),
			subscription,
			actions,
			actionArgs;

		list.subscribe(function (observer, actionArgs) {
			actions.push(actionArgs);
		});

		actions = [];
		list.clear();

		strictEqual(actions.length, 1, "Expected the list to only notify once when cleared.");

		actionArgs = actions[0];
		strictEqual(actionArgs.action, 'reset', "Expected the actionArgs type to be 'reset'.");
		strictEqual(actionArgs.newStartingIndex, -1, "Expected the actionArgs newStartingIndex to be -1.");
		strictEqual(actionArgs.newItems.join(','), '', "Expected the actionArgs newItems to be [].");
		strictEqual(actionArgs.oldStartingIndex, -1, "Expected the actionArgs oldStartingIndex to be -1.");
		strictEqual(actionArgs.oldItems.join(','), '', "Expected the actionArgs oldItems to be [].");

		actions = [];
		list.clear();

		strictEqual(actions.length, 0, "Expected the list to not notify when attempting to clear an empty list.");
	});

	test('collapse test', function () {
		var list = BINDER.mkObservableList(1, undefined, 3, undefined),
			subscription,
			actions,
			actionArgs;

		list.subscribe(function (observer, actionArgs) {
			actions.push(actionArgs);
		});

		actions = [];
		list.collapse();

		strictEqual(list.join(','), '1,3', "Expected the sparse items to be removed.");
		strictEqual(actions.length, 1, "Expected the list to only notify once when collapsing.");

		actionArgs = actions[0];
		strictEqual(actionArgs.action, 'reset', "Expected the actionArgs type to be 'reset'.");
		strictEqual(actionArgs.newStartingIndex, -1, "Expected the actionArgs newStartingIndex to be -1.");
		strictEqual(actionArgs.newItems.join(','), '', "Expected the actionArgs newItems to be [].");
		strictEqual(actionArgs.oldStartingIndex, -1, "Expected the actionArgs oldStartingIndex to be -1.");
		strictEqual(actionArgs.oldItems.join(','), '', "Expected the actionArgs oldItems to be [].");

		actions = [];
		list.collapse();

		strictEqual(actions.length, 0, "Expected the list to not notify when attempting to collapse a compact list.");
	});

	test('insert test', function () {
		var list = BINDER.mkObservableList(1, 3),
			subscription,
			actions,
			actionArgs;

		list.subscribe(function (observer, actionArgs) {
			actions.push(actionArgs);
		});

		actions = [];
		list.insert(10, 0);

		strictEqual(actions.length, 1, "Expected the list to only notify once when inserting.");

		actionArgs = actions[0];
		strictEqual(actionArgs.action, 'add', "Expected the actionArgs type to be 'add'.");
		strictEqual(actionArgs.newStartingIndex, 2, "Expected the actionArgs newStartingIndex to be 2.");
		strictEqual(actionArgs.newItems.join(','), '0', "Expected the actionArgs newItems to be [0].");
		strictEqual(actionArgs.oldStartingIndex, -1, "Expected the actionArgs oldStartingIndex to be -1.");
		strictEqual(actionArgs.oldItems.join(','), '', "Expected the actionArgs oldItems to be [].");

		actions = [];
		list.insert(0, -10);

		strictEqual(actions.length, 1, "Expected the list to only notify once when inserting.");

		actionArgs = actions[0];
		strictEqual(actionArgs.action, 'add', "Expected the actionArgs type to be 'add'.");
		strictEqual(actionArgs.newStartingIndex, 0, "Expected the actionArgs newStartingIndex to be 0.");
		strictEqual(actionArgs.newItems.join(','), '-10', "Expected the actionArgs newItems to be [-10].");
		strictEqual(actionArgs.oldStartingIndex, -1, "Expected the actionArgs oldStartingIndex to be -1.");
		strictEqual(actionArgs.oldItems.join(','), '', "Expected the actionArgs oldItems to be [].");


		actions = [];
		list.insert(NaN, 100);

		strictEqual(actions.length, 0, "Expected the list to not notify when attempting to insert with an invalid index.");
	});

	test('mergeWith test', function () {
		var list = BINDER.mkObservableList(1, 2, 3),
			subscription,
			actions,
			actionArgs,
			axn;

		list.subscribe(function (observer, actionArgs) {
			actions.push(actionArgs);
		});

		actions = [];
		list.mergeWith([1, 2, 3]);

		strictEqual(actions.length, 0, "Expected the list to not notify when merging identical lists.");


		actions = [];
		list.mergeWith([1, 3, 4]);

		strictEqual(actions.length, 3, "Expected the list to notify three times.");

		actionArgs = actions[0];
		strictEqual(actionArgs.action, 'remove', "Expected the actionArgs type to be 'remove'.");
		strictEqual(actionArgs.newStartingIndex, -1, "Expected the actionArgs newStartingIndex to be -1.");
		strictEqual(actionArgs.newItems.join(','), '', "Expected the actionArgs newItems to be [].");
		strictEqual(actionArgs.oldStartingIndex, 1, "Expected the actionArgs oldStartingIndex to be 1.");
		strictEqual(actionArgs.oldItems.join(','), '2', "Expected the actionArgs oldItems to be [2].");

		actionArgs = actions[1];
		strictEqual(actionArgs.action, 'move', "Expected the actionArgs type to be 'move'.");
		strictEqual(actionArgs.newStartingIndex, 1, "Expected the actionArgs newStartingIndex to be 1.");
		strictEqual(actionArgs.newItems.join(','), '3', "Expected the actionArgs newItems to be [3].");
		strictEqual(actionArgs.oldStartingIndex, 2, "Expected the actionArgs oldStartingIndex to be 2.");
		strictEqual(actionArgs.oldItems.join(','), '3', "Expected the actionArgs oldItems to be [3].");

		actionArgs = actions[2];
		strictEqual(actionArgs.action, 'add', "Expected the actionArgs type to be 'add'.");
		strictEqual(actionArgs.newStartingIndex, 2, "Expected the actionArgs newStartingIndex to be 2.");
		strictEqual(actionArgs.newItems.join(','), '4', "Expected the actionArgs newItems to be [4].");
		strictEqual(actionArgs.oldStartingIndex, -1, "Expected the actionArgs oldStartingIndex to be -1.");
		strictEqual(actionArgs.oldItems.join(','), '', "Expected the actionArgs oldItems to be [].");
	});

	test('reverse test', function () {
		var list = BINDER.mkObservableList(1, 2, 3),
			subscription,
			actions,
			actionArgs;

		list.subscribe(function (observer, actionArgs) {
			actions.push(actionArgs);
		});

		actions = [];
		list.reverse();

		strictEqual(list.join(','), '3,2,1', "Expected the list to be reversed.");
		strictEqual(actions.length, 1, "Expected the list to only notify once when reversing.");

		actionArgs = actions[0];
		strictEqual(actionArgs.action, 'reset', "Expected the actionArgs type to be 'reset'.");
		strictEqual(actionArgs.newStartingIndex, -1, "Expected the actionArgs newStartingIndex to be -1.");
		strictEqual(actionArgs.newItems.join(','), '', "Expected the actionArgs newItems to be [].");
		strictEqual(actionArgs.oldStartingIndex, -1, "Expected the actionArgs oldStartingIndex to be -1.");
		strictEqual(actionArgs.oldItems.join(','), '', "Expected the actionArgs oldItems to be [].");
	});

	test('pop test', function () {
		var list = BINDER.mkObservableList(1, 2, 3),
			subscription,
			actions,
			actionArgs;

		list.subscribe(function (observer, actionArgs) {
			actions.push(actionArgs);
		});

		actions = [];
		list.pop();

		strictEqual(actions.length, 1, "Expected the list to only notify once when popping.");

		actionArgs = actions[0];
		strictEqual(actionArgs.action, 'remove', "Expected the actionArgs type to be 'remove'.");
		strictEqual(actionArgs.newStartingIndex, -1, "Expected the actionArgs newStartingIndex to be -1.");
		strictEqual(actionArgs.newItems.join(','), '', "Expected the actionArgs newItems to be [].");
		strictEqual(actionArgs.oldStartingIndex, 2, "Expected the actionArgs oldStartingIndex to be 2.");
		strictEqual(actionArgs.oldItems.join(','), '3', "Expected the actionArgs oldItems to be [3].");

		list.clear();
		actions = [];
		list.pop();

		strictEqual(actions.length, 0, "Expected the list to not notify when popping from an empty list.");
	});

	test('push test', function () {
		var list = BINDER.mkObservableList(1, 2, 3),
			subscription,
			actions,
			actionArgs;

		list.subscribe(function (observer, actionArgs) {
			actions.push(actionArgs);
		});

		actions = [];
		list.push(4);

		strictEqual(actions.length, 1, "Expected the list to only notify once when pushing a single item.");

		actionArgs = actions[0];
		strictEqual(actionArgs.action, 'add', "Expected the actionArgs type to be 'add'.");
		strictEqual(actionArgs.newStartingIndex, 3, "Expected the actionArgs newStartingIndex to be 3.");
		strictEqual(actionArgs.newItems.join(','), '4', "Expected the actionArgs newItems to be [4].");
		strictEqual(actionArgs.oldStartingIndex, -1, "Expected the actionArgs oldStartingIndex to be -1.");
		strictEqual(actionArgs.oldItems.join(','), '', "Expected the actionArgs oldItems to be [].");


		actions = [];
		list.push(5, 6);

		strictEqual(actions.length, 1, "Expected the list to notify once when pushing more than one item.");

		actionArgs = actions[0];
		strictEqual(actionArgs.action, 'add', "Expected the actionArgs type to be 'add'.");
		strictEqual(actionArgs.newStartingIndex, 4, "Expected the actionArgs newStartingIndex to be 4.");
		strictEqual(actionArgs.newItems.join(','), '5,6', "Expected the actionArgs newItems to be [5,6].");
		strictEqual(actionArgs.oldStartingIndex, -1, "Expected the actionArgs oldStartingIndex to be -1.");
		strictEqual(actionArgs.oldItems.join(','), '', "Expected the actionArgs oldItems to be [].");
	});

	test('shift test', function () {
		var list = BINDER.mkObservableList(1, 2, 3),
			subscription,
			actions,
			actionArgs;

		list.subscribe(function (observer, actionArgs) {
			actions.push(actionArgs);
		});

		actions = [];
		list.shift();

		strictEqual(actions.length, 1, "Expected the list to only notify once when shifting.");

		actionArgs = actions[0];
		strictEqual(actionArgs.action, 'remove', "Expected the actionArgs type to be 'remove'.");
		strictEqual(actionArgs.newStartingIndex, -1, "Expected the actionArgs newStartingIndex to be -1.");
		strictEqual(actionArgs.newItems.join(','), '', "Expected the actionArgs newItems to be [].");
		strictEqual(actionArgs.oldStartingIndex, 0, "Expected the actionArgs oldStartingIndex to be 0.");
		strictEqual(actionArgs.oldItems.join(','), '1', "Expected the actionArgs oldItems to be [1].");

		list.clear();
		actions = [];
		list.shift();

		strictEqual(actions.length, 0, "Expected the list to not notify when shifting from an empty list.");
	});

	test('unshift test', function () {
		var list = BINDER.mkObservableList(1, 2, 3),
			subscription,
			actions,
			actionArgs;

		list.subscribe(function (observer, actionArgs) {
			actions.push(actionArgs);
		});

		actions = [];
		list.unshift(4);

		strictEqual(actions.length, 1, "Expected the list to only notify once when unshifting a single item.");

		actionArgs = actions[0];
		strictEqual(actionArgs.action, 'add', "Expected the actionArgs type to be 'add'.");
		strictEqual(actionArgs.newStartingIndex, 0, "Expected the actionArgs newStartingIndex to be 0.");
		strictEqual(actionArgs.newItems.join(','), '4', "Expected the actionArgs newItems to be [4].");
		strictEqual(actionArgs.oldStartingIndex, -1, "Expected the actionArgs oldStartingIndex to be -1.");
		strictEqual(actionArgs.oldItems.join(','), '', "Expected the actionArgs oldItems to be [].");


		actions = [];
		list.unshift(5, 6);

		strictEqual(actions.length, 1, "Expected the list to notify once when pushing more than one item.");

		actionArgs = actions[0];
		strictEqual(actionArgs.action, 'add', "Expected the actionArgs type to be 'add'.");
		strictEqual(actionArgs.newStartingIndex, 0, "Expected the actionArgs newStartingIndex to be 0.");
		strictEqual(actionArgs.newItems.join(','), '5,6', "Expected the actionArgs newItems to be [5,6].");
		strictEqual(actionArgs.oldStartingIndex, -1, "Expected the actionArgs oldStartingIndex to be -1.");
		strictEqual(actionArgs.oldItems.join(','), '', "Expected the actionArgs oldItems to be [].");
	});

	test('sort test', function () {
		var list = BINDER.mkObservableList(3, 2, 1),
			subscription,
			actions,
			actionArgs;

		list.subscribe(function (observer, actionArgs) {
			actions.push(actionArgs);
		});

		actions = [];
		list.sort();

		strictEqual(list.join(','), '1,2,3', "Expected the list to be sorted.");
		strictEqual(actions.length, 1, "Expected the list to only notify once when sorting.");

		actionArgs = actions[0];
		strictEqual(actionArgs.action, 'reset', "Expected the actionArgs type to be 'reset'.");
		strictEqual(actionArgs.newStartingIndex, -1, "Expected the actionArgs newStartingIndex to be -1.");
		strictEqual(actionArgs.newItems.join(','), '', "Expected the actionArgs newItems to be [].");
		strictEqual(actionArgs.oldStartingIndex, -1, "Expected the actionArgs oldStartingIndex to be -1.");
		strictEqual(actionArgs.oldItems.join(','), '', "Expected the actionArgs oldItems to be [].");
	});

	test('splice test', function () {
		var list = BINDER.mkObservableList(1, 2, 3),
			subscription,
			actions,
			actionArgs;

		list.subscribe(function (observer, actionArgs) {
			actions.push(actionArgs);
		});

		actions = [];
		list.splice();

		strictEqual(actions.length, 0, "Expected the list to not notify when not splicing any items.");


		actions = [];
		list.splice(0, 0);

		strictEqual(actions.length, 0, "Expected the list to not notify when not splicing any items.");


		actions = [];
		list.splice(0, 0, -1, 0);

		strictEqual(actions.length, 1, "Expected the list to notify once when splicing.");

		actionArgs = actions[0];
		strictEqual(actionArgs.action, 'add', "Expected the actionArgs type to be 'add'.");
		strictEqual(actionArgs.newStartingIndex, 0, "Expected the actionArgs newStartingIndex to be 0.");
		strictEqual(actionArgs.newItems.join(','), '-1,0', "Expected the actionArgs newItems to be [-1,0].");
		strictEqual(actionArgs.oldStartingIndex, -1, "Expected the actionArgs oldStartingIndex to be -1.");
		strictEqual(actionArgs.oldItems.join(','), '', "Expected the actionArgs oldItems to be [].");


		actions = [];
		list.splice(1, 1);

		strictEqual(actions.length, 1, "Expected the list to notify once when splicing.");

		actionArgs = actions[0];
		strictEqual(actionArgs.action, 'remove', "Expected the actionArgs type to be 'remove'.");
		strictEqual(actionArgs.newStartingIndex, -1, "Expected the actionArgs newStartingIndex to be -1.");
		strictEqual(actionArgs.newItems.join(','), '', "Expected the actionArgs newItems to be [].");
		strictEqual(actionArgs.oldStartingIndex, 1, "Expected the actionArgs oldStartingIndex to be 1.");
		strictEqual(actionArgs.oldItems.join(','), '0', "Expected the actionArgs oldItems to be [0].");


		actions = [];
		list.splice(0, 2, 4, 5, 6);

		strictEqual(actions.length, 1, "Expected the list to notify once when splicing.");

		actionArgs = actions[0];
		strictEqual(actionArgs.action, 'replace', "Expected the actionArgs type to be 'replace'.");
		strictEqual(actionArgs.newStartingIndex, 0, "Expected the actionArgs newStartingIndex to be 0.");
		strictEqual(actionArgs.newItems.join(','), '4,5,6', "Expected the actionArgs newItems to be [4,5,6].");
		strictEqual(actionArgs.oldStartingIndex, 0, "Expected the actionArgs oldStartingIndex to be 0.");
		strictEqual(actionArgs.oldItems.join(','), '-1,1', "Expected the actionArgs oldItems to be [-1,1].");
	});

	test('observe items test', function () {
		var list = BINDER.mkObservableList(),
			subscription,
			actions,
			actionArgs;

		list.push(BINDER.mkProperty(1), BINDER.mkProperty(2), BINDER.mkProperty(3));

		list.subscribe(function (observer, actionArgs) {
			actions.push(actionArgs);
		});

		actions = [];

		strictEqual(list.join(','), '1,2,3', 'Expected list to be equal to the array [1,2,3]');


		list.observeItems(true);
		list[0].set(0);

		strictEqual(actions.length, 1, 'Expected the list to notify when an item has changed.');

		actionArgs = actions[0];
		strictEqual(actionArgs.action, 'change', "Expected the actionArgs type to be 'change'.");
		strictEqual(actionArgs.newStartingIndex, 0, "Expected the actionArgs newStartingIndex to be 0.");
		strictEqual(actionArgs.newItems.join(','), '0', "Expected the actionArgs newItems to be [0].");
		strictEqual(actionArgs.oldStartingIndex, 0, "Expected the actionArgs oldStartingIndex to be 0.");
		strictEqual(actionArgs.oldItems.join(','), '0', "Expected the actionArgs oldItems to be [0].");

		list.observeItems(false);

		actions = [];
		list[0].set(10);
		list[1].set(100);

		strictEqual(actions.length, 0, 'Expected the list to not notify when an item has changed and the list is not observing items for change.');


		list.block();
		list.observeItems(true);
		var p = list.splice(2, 1).pop();
		list.unblock();
		p.set(1000);

		strictEqual(actions.length, 0, 'Expected the list to not notify when an item has been removed from the list then changed.');
	});
