# Usage

**Standard HTML:**

	<script type="text/javascript" src="pathto/util.min.js"></script>
	<script type="text/javascript" src="pathto/BINDER.min.js"></script>

	// Or if you prefer to use the all-in-one script that already includes utiljs

	<script type="text/javascript" src="pathto/BINDER.all.min.js"></script>

	// do stuff with BINDER

**AMD Module:**

	// If not using the all-in-one script then requires the 'utiljs' module to be reachable.
	define(['binderjs'], function (binder) {
		// do stuff with binder
	});

**CommonJS Module:**

	// If not using the all-in-one script then requires the 'utiljs' module to be reachable.
	var binder = require('binderjs');

	// do stuff with binder


# API

**BINDER.run()**

	run(fn)

	fn - A function to run and observer all property access invocations.
	return - An object with a subscribe() and dispose() method.
		subscribe(observer) - Observes for changes. Observer can be an object with onNotify() or a function. The observer will be passed a function that when called will run the function passed to run(), and any arguments a property passes when notifying.
		dispose() - Stops observing.

	This method will run a function and observe all property access invocations.


Example:

	BINDER.run(function () {
		document.getElementById('message').innerHTML = model.name();
	}).subscribe(function (fn) {
		fn();
	});


**BINDER.toJSON()**

	toJSON(o, options)

	o - An object with binderjs properties.
	options - Options that describe how to treat properties.
	return - A new POJO with a shallow copy each property, or the specified target model.

	If o is a native type then just the filter function will be invoked if specified.


	Options is a nested object structure with the following form:

	{
		include: [list of property names to include (applies to each item in an Array if the current level is an Array)]
        exclude: [list of property names to exclude (applies to each item in an Array if the current level is an Array)]
        filter(json, original): A filter function called on the value just before returning from toJSON().
        						If the level this filter is specified at is an Array then the filter will be called
        						for each item in the array.

        						Where json is the current POJO/JSON representation of the object being processed.
        						Original is the original representation of the object being processed. If the object
        						being processed is a native type then json and original will be equal.

        						The return value of the filter function is the new JSON/POJO representation of the object
        						being processed. If you just want to modifiy several properties then return the json argument,
        						otherwise you can return an entirely new object.
        properties: {
            property: A filter function that will be called with the value
                    of a property that must return a value. This value can also be a nested options object
                    with the following properties: include, exclude, filter, properties.
        }
	}

Converts an object that contains binderjs properties into a plain-old-javascript-object (POJO) by performing a shallow copy of all properties and adding them to a new object. If the property is a binderjs property then the property's value will be copied.

Example:

	var obj, model;

	model = {
		firstName: BINDER.mkProperty('Darren'),
		lastName: BINDER.mkProperty('Schnare'),
		skills: BINDER.mkProperty(['javascript', 'html', 'css', 'ruby']),
		team: [{
			firstName: BINDER.mkProperty('Alex'),
			lastName: BINDER.mkProperty('Grendo')
		}, {
			firstName: BINDER.mkProperty('Sam'),
			lastName: BINDER.mkProperty('Hilto')
		}, {
			firstName: BINDER.mkProperty('James'),
			lastName: BINDER.mkProperty('Wazzabi')
		}]
	};

	model.fullName = BINDER.mkProperty(function () {
		return model.firstName + ' ' + model.lastName;
	});

	obj = BINDER.toJSON(model);

The result is:

	{
		firstName: "Darren",
		lastName: "Schnare",
		fullName: "Darren Schnare",
		skills: ['javascript', 'html', 'css', 'ruby'],
		team: [{
			firstName: "Alex",
			lastName: "Grendo"
		}, {
			firstName: "Sam",
			lastName: "Hilto"
		}, {
			firstName: "James",
			lastName: "Wazzabi"
		}]
	}

Using the same model we can change how the JSON/POJO object will be generated:

	obj = BINDER.toJSON(model, {
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

The result will be:

	{
		firstName: "Darren",
		lastName: "Schnare",
		skills: ['Javascript', 'Html', 'Css', 'Ruby'],
		team: [{
			name: "Alex Grendo"
		}, {
			name: "Sam Hilto"
		}, {
			name: "James Wazzabi"
		}]
	}


**BINDER.fromJSON()**

	fromJSON(o, options)
	fromJSON(o, options, target)

	o - A POJO object.
	options - Options that describe how to create binderjs properties.
	target - An optional target model to read the properties into.

	If o is a native type then just the filter function will be invoked if specified.


	Options is a nested object with the following form:

	{
		include: [list of property names to include (applies to each item in an Array if the current level is an Array)]
        exclude: [list of property names to exclude (applies to each item in an Array if the current level is an Array)]
        copy: [list of property names to simply copy as is (and optionally filter) without creating a binderjs property
        		(applies to each item in an Array if the current level is an Array)]
        filter(model, json): A filter function called with the value just before returning from fromJSON().
        		This is typically used to format primitive values or add custom functions/properties
        		to a model before returning.

        		Where model is the current model representation of the object being processed. Model may be an object
        		with several properties defined, some might be binderjs properties. The json argument is the
        		JSON/POJO represnetation of the object being processed. If the object being processed is a native type
        		then mdoel and json will be equal.

        		The return value of the filter function is the new model representation of the object
        		being processed. If you just want to modifiy several properties then return the model argument,
        		otherwise you can return an entirely new object.
        properties: {
            property: {
                create(model, owner): A function that returns an object that will be used
                		to create a binder property via BINDER.mkProperty(). If the object returned is a POJO
                		object then it will be used as the options for the call to mkProperty(). This function will be
                		called when attaching properties for native values or arrays to a model. This will not be called
                		if the object being processed is a JSON/POJO object, instead the property will just be the object.

                		Where model is equal to the value returned from calling fromJSON() recursively and owner is
                		the owning model to wich the property will be attached.

                		This method can be used to create a setter for a property or to spefify an 'equals' and 'changed'
                		operators for a property.

                // All other properties are supported: include, exclude, copy, filter, properties.
            }
            // NOTE: If the value of a property is a function instead of an object like described above, then it is
            // treated like a filter function.
        }
	}

Converts a POJO object to an object, making each property binderjs property. All property values are shallow copied unless overriden with the options.

Example:

	var obj, model;

	obj = {
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
	}

	model = BINDER.fromJSON(obj);

The result is:

	{
		firstName: BINDER.mkProperty('Darren')
		lastName: BINDER.mkProperty('Schnare'),
		skills: BINDER.mkPrpoperty(['javascript', 'html', 'css', 'ruby']),
		team: BINDER.mkProperty([{
			firstName: BINDER.mkProperty('Alex'),
			lastName: BINDER.mkProperty('Grendo')
		}, {
			firstName: BINDER.mkProperty('Sam'),
			lastName: BINDER.mkProperty('Hilto')
		}, {
			firstName: BINDER.mkProperty('James'),
			lastName: BINDER.mkProperty('Wazzabi')
		}])
	}

Using the same POJO we can change how the model object will be generated:


	BINDER.fromJSON(o, {
		filter: function (model, json) {
			model.fullName = BINDER.mkProperty(function () {
				return model.firstName + ' ' + model.lastName;
			});

			return model;
		},
		properties: {
			skills: function (model, json) {
				// Since our skills array contains strings it means we are filtering
				// a native object. This means that model and json are equal. So
				// we'll just return a new string.
				return json.charAt(0).toUpperCase() + json.substring(1);
			},
			team: {
				exclude: ['firstName', 'lastName'],
				filter: function (model, json) {
					model.name = BINDER.mkProperty(json.firstName + ' ' + json.lastName);
					return model;
				}
			}
		}
	});

The result will be:

	{
		firstName: BINDER.mkProperty('Darren')
		lastName: BINDER.mkProperty('Schnare'),
		fullName: BINDER.mkProperty(function () {
			return model.firstName + ' ' + model.lastName;
		}),
		skills: BINDER.mkPrpoperty(['Javascript', 'Html', 'Css', 'Ruby']),
		team: BINDER.mkProperty([{
			name: BINDER.mkProperty('Alex Grendo')
		}, {
			name: BINDER.mkProperty('Sam Hilto')
		}, {
			name: BINDER.mkProperty('James Wazzabi')
		}])
	}

---

**BINDER.mkObservable()**

	mkObservable()

Creates an observable object that can be observed for changes.


**observable.subscribe()**

	subscribe(fn)
	subscribe(fn, thisObj)
	subscribe(observer)

	fn - The callback function to have called when the observable has changed.
	thisObj - The optional 'this' object to use when calling the subscribed callback.
	observer - An object with a onNotify() function.
	return - A subscription object with a dispose() function.

	Example Subscriber Signature:

	function (observer, arg1, arg2) {...}

Subscribes to the changes of an observable. When the callback or `onNotify` function are called the observable sending the notification will be passed as an argument along with any additional arguments specified for the notification. If an observer object does not have an `onNotify` method then the observer object will not subscribe to the observerable.


**observable.notify()**

	notify(...)

Notifies all observers if the observable is not blocked and not being throttled. Any arguments passed to this method will be passed along with the observer itself to each subscriber.


**observable.throttle()**

	throttle(duration)

	[default -1]

	duration - The timeout duration in milliseconds. If 0 then all notifications will be asynchronous. Less than 0 for synchronous notifications.

Throttles notifications sent to observers by placing a timeout between the first call to `notify()` and when the observers are actually notified. All subsequent calls to `notify()` will have no effect until the timeout has expired. When the timeout has expired then the observers will be notified.


**observable.block()**

	block()

Pushes a block state onto the internal block stack. While the block stack has at least one block state the observable is said to be blocked and subsequent calls to `notify()` will have no effect.


**observable.unblock()**

	unblock()

Removes a block state from the internal block stack. While the block stack has at least one block state the observable is said to be blocked and subsequent calls to `notify()` will have no effect.


**observable.dispose()**

	dispose()

Removes all observers.

---

**BINDER.mkList()**

	mkList()
	mkList(array)
	mkList(item,...,item)

	array - An Array or another list to copy items from.
	... - A variadic list of items to add to the list.

makes a list that extends `Array` and adheres to the EcmaScript 5 Array specification.


**The following [ES5](http://www.ecma-international.org/publications/standards/Ecma-262.htm) functions are implemented if not present on the native Array (without modifying the Array.prototype):**

**list.indexOf()**

	indexOf(item, [fromIndex])

	item - The item to search for.
	fromIndex - The index to start the search.
	return - The index of the item in the list, -1 otherwise.

**list.lastIndexOf()**

	lastIndexOf(item, [fromIndex])

	item - The item to search for.
	fromIndex - The index to start the search.
	return - The index of the item in the list, -1 otherwise.

**list.reverse()**

	reverse()

	return - This list.

**list.map()**

	map(callback, [thisObj])

	callback - The callback to call on each item.
	thisObj - The context to call callback with.
	return - A new array with the mapped items.

**list.filter()**

	filter(callback, [thisObj])

	callback - The callback to call on each item.
	thisObj - The context to call callback with.
	return - A new array with the filtered items.

**list.forEach()**

	forEach(callback, [thisObj])

	callback - The callback to call on each item.
	thisObj - The context to call callback with.

**list.reduce()**

	reduce(callback, [initialValue])

	callback - The callback to call on each item.
	initialValue - The initial value to assign to previous.
	return - The final result of calling callback.

**list.reduceRight()**

	reduceRight(callback, [initialValue])

	callback - The callback to call on each item.
	initialValue - The initial value to assign to previous.
	return - The final result of calling callback.

**list.some()**

	some(callback, [thisObj])

	callback - The callback to call on each item.
	thisObj - The context to call callback with.
	return - True if callback returns true, false otherwise.

**list.every()**

	every(callback, [thisObj])

	callback - The callback to call on each item.
	thisObj - The context to call callback with.
	return - True if callback always returns true, false otherwise.

**The following methods are added to form the list API:**

**list.collapse()**

	collapse()

Removes all sparce items in this list. A sparce item is any item that has the value of undefined or whose index does not exist in the list.


**list.contains()**

	contains(item)

	item - The item to test for containment.
	return - True if the item is found in the list, false otherwise.

Determines if the specified item is found in the list. The search is performed using strict equality.


**list.occurances()**

	occurances(item)

	item - The item to search for.
	return - The number of times the item occurs in the list.

Determines the number of occurances an item occurs in the list. The search is performed using strict equality.


**list.distinct()**

	distinct()

	return - An Array with all items that occur once in the list.

Produces an `Array` that contains all items that only occur once in the list.


**list.first()**

	first(callback, [thisObj])

	callback - The callback to call on each item.
	thisObj - The context to call callback with.
	return - The item where the callback returned true, undefined otherwise.

Retrieves the first item where the `callback` returns true. The order of the traversal is ascending order.

`callback` will be called with the item, the index of the item and the object being traversed.


**list.last()**

	last(callback, [thisObj])

	callback - The callback to call on each item.
	thisObj - The context to call callback with.
	return - The item where the callback returned true, undefined otherwise.

Retrieves the last item where the `callback` returns true. The order of the traversal is descending order.

`callback` will be called with the item, the index of the item and the object being traversed.


**list.find()**

	find(callback)
	find(callback, fromIndex)
	find(callback, thisObj)
	find(callback, fromIndex, thisObj)

	callback - The callback to call on each item.
	thisObj - The context to call callback with.
	fromIndex - The starting index of the traversal.
	return - An object with the following properties: index, item.

Retrieves the item and index where the `callback` returns true. The order of the traversal is ascending order.

`callback` will be called with the item, the index of the item and the object being traversed.


**list.getItemOperators**

	getItemOperators()

	return - An object with the following properties: equals, changed.

Retrieves the `equals` and `changed` operators used for the items in the list. This method can be overriden to provide `equals` and `changed` operators that are to be used when comparing items in the list. The operators have the following signature:

		equals(a, b) - return true if a is equal to b
		changed(a, b) - return true if a is equal to b but b has changes

By default the `equals` operator tests for strict equality and the `changed` operator tests for strict inequality. These operators are in place to aid in comparing objects that have uniquely identifiable properties, but also have properties that can be updated. When an operator is called it will be called with the `this` object set to the object returned from `getItemOperators`.

For example:

	// With items of the form:
	{id: 12, message: 'Hello World', type: 'text'}

	// The operators could look like this:
	myList.getItemOperators = function () {
		return {
			equals: function (a, b) {
				return a.id === b.id;
			},
			changed: function (a, b) {
				if (this.equals(a, b)) {
					return a.message !== b.message || a.type !== b.type;
				}
				return false;
			}
		};
	};

**list.equals()**

	equals(otherList)

	otherList - The other list (or Array) to compare against.
	return - True if all items in the other list are equal to the this list, false otherwise.

Determines if all items in the `otherList` are in the same order and are equal to the items in this list. Equality is performed by calling the `equals` operator from `getItemOperators`.


**list.changed()**

	changed(otherList)

	otherList - The other list (or Array) to compare against.
	return - True if any item in the ohter list has changed or is not equal to the associated item in this list.

Determines if all items in the `otherList` are in the same order and are equal to the items in this list but have changed. Equality and changed is performed by calling the `equals` and `changed` operators respectively from `getItemOperators`.


**list.compare()**

	compare(otherList)
	compare(otherList, equals, changed)

	otherList - The other list (or Array) to compare against.
	return - A new list with the comparison results for each item in this list.

Retrieves the comparison results by comparing this list against the `otherList`. The `equals` and `changed` operators from `getItemOperators` are used to determine if items are equal or have changed. If custom `equals` and `changed` operators are specified then these operators will be used instead.

Returns a list with a comparison result for each item in this list. Comparison results have the following properties:

	status - The status of the comparison: added, changed, deleted, retained.
	item - The referenced item in this list.
	value - The referenced item in this list (alias for item property).
	index - The index of the referenced item in this list.
	otherItem - The referenced item in the other list.
	otherIndex - The index of the referenced item in the other list.
	toString - Custom toString() function.


**list.merge()**

	merge(otherList)
	merge(otherList, equals, changed)

	otherList - The other list (or Array) to merge against.
	return - A new collapsed list with the results of the merge.

Produces a new list with the results of merging this list with `otherList`. All items that are 'retained' are unmodified, all items that are 'added' are added, all items that are 'deleted' are removed, all items that are 'changed' are replaced with the newer item. If custom `equals` and `changed` operators are specified then these operators will be used instead of the operators retrieved from this list's `getItemOperators` method.

All indices from `otherList` are kept in the resulting list.


**list.mergeWith()**

	mergeWith(otherList)
	mergeWith(otherList, equals, changed)

	otherList - The other list (or Array) to merge against.
	equals - An optional equals operator to use when comparing.
	changed - An optional changed operator to use when comparing.

Merges the `otherList` into this list in-palce. All items that are 'retained' are unmodified, all items that are 'added' are added, all items that are 'deleted' are removed, all items that are 'changed' are replaced with the newer item. If custom `equals` and `changed` operators are specified then these operators will be used instead of the operators retrieved from this list's `getItemOperators` method.

All indices from `otherList` are kept in the resulting list.


**list.remove()**

	remove(item,...,item)

	... - A variadic list of items to remove.

Removes the specified items from this list. The items are found by using strict equality.


**list.removeAt()**

	removeAt(index)

	index - The index of the item to remove.
	return - The item removed or undefined if index is out of bounds.

Removes the item at the specified index.


**list.clear()**

	clear()

Removes all items in the list.


**list.replaceAt()**

	replaceAt(index, item)

	index - The index of the item to replace.
	item - The new item.
	return - The item replaced.

Replaces the item at the specified index.


**list.isEmpty()**

	isEmpty()

Determines if the list has a length of zero.


**list.peek()**

	peek()

Retrieves the last item in the list without removing it.


**list.insert()**

	insert(index, item)

	index - The index to insert at.
	item - The item to insert.

Inserts an item at the specified index and increases the length of the list by one. Returns the index at which the insertion occured, false otherwise.

If `index` is less than `0` then `index` is set to `0`.

If `index` is greater than the list length then `index` is set to `length`.


---

**BINDER.mkObservableList()**

	mkObservableList()
	mkObservableList(array)
	mkObservableList(item,...,item)

makes a list that can be observed for changes.


**observableList.observeItems()**

	observeItems()
	observeItems(value)

	[default false]

	value - Boolean value to set the flag to.
	return - The value of the flag.

Flag that determines if the items in the list will be observed for changes. When being set to true all items in the list will be observed, and when setting to false all items subscriptions will be disposed. In order for items to be observed they must have a `subscribe()` method that returns a subscription object. In other words the subscription model must adhere to the `observable` object interface.


**ObservableLists have the same interface as Array, observable and list.**

ObservableList will notify all observers when the list has been modified via the following methods:

- remove
- removeAt
- replaceAt
- clear
- insert
- mergeWith
- reverse
- pop
- push
- shift
- unshift
- sort
- splice

Each subscriber notified of a change on an observable list will be passed an action argument that gives information regarding what items and action occured.
The action argument is an object with the following properties:

- action - The action that caused the change: add, remove, replace, move, reset, change
- newStartingIndex - The index at which the change occured.
- newItems - The new items involved in the change.
- oldStartingIndex - The index at which a move, remove, replace or change action occured.
- oldItems - The items affected by a replace, remove, move or change action.

The properties for an action argument (and their meaning) are identical to the [NotifyCollectionChangedEventArgs](http://msdn.microsoft.com/en-us/library/system.collections.specialized.notifycollectionchangedeventargs.aspx) class in .NET.

The actions have the following meaning:

- add - One or more items were added to the collection.
- remove - One or more items were removed from the collection.
- replace - One or more items were replaced in the collection.
- move - One or more items were moved within the collection.
- reset - The content of the collection changed dramatically.
- change - An item in the list has been has changed.

Example:

	var list = BINDER.mkObservableList(1, 2, 3);
	list.subscribe(function (observer, actionArgs) {
		// Will receive two notifications (i.e. will be called twice).
		// Once for "2" being removed and once for the item "3" being moved.
		// Changes for each item in the list are notified first then any additions
		// to the list will be notified last.

		// For "2" being removed:
		// actionArgs: {action: "remove", oldStartingIndex: 1, oldItems: [2]}

		// For "3" being moved:
		// actionArgs: {action: "move", newStartingIndex: 1, newItems: [3], oldStartingIndex: 2, oldItems: [3]}
	});
	list.mergeWith([1, 3]);
	list.join(','); // list is now [1,3]

---

**BINDER.mkProperty()**

	mkProperty(value)
	mkProperty(get)
	mkProperty(get, owner)
	mkProperty(get, set)
	mkProperty(get, set, owner)
	mkProperty({value, [equals, changed]})
	mkProperty({get, [set, equals, changed, lazy, owner]})

	value - The property value.
	get - The custom get opertor.
	set - The custom set operator.
	equals - The equals operator. Defaults to using strict equality.
	changed - The changed operator. Defautlts to using strict inequality.
	lazy - Flag indicating that dependencies shouldn't be tracked until first access. Defaults to false.
	owner - The object the property belongs to. Defaults to undefined.

makes an observable property that extends `function`. All properties will dynamically track any property that is accessed during a `get` operation as dependencies. If any dependencies change then this property will notify its observers of the change as well.

Immediately after the property is created a `get` operation is called on the property in order to track any property dependencies accurately. This behaviour can be deferred until the property is first accessed by setting `lazy` to a truthy value.

If the value of the property is an `Array` or `List` then it will be copied into an `ObservableList` and the new list will be the property's value. If the value is already an `ObservableList` then no new list will be created.

If the value is an `Array` or `List` then the `equals` and `changed` operators must be item operators that accept two arguments as opposed to only one for typical property operators. See the `list.getItemOperators` method for more details on item operators. See the `property.equals` and `property.changed` methods for more details on property operators.

If the value is `Observable` then the property will subscribe to the value for changes and relay any notifications and any parameters.

Properties work best when the value is not a `function`.


*Note About Context*

 All properties behave like any other JavaScript funtion in that they derive their context based on how they are called. However, when a property is called without an explicit context, the owner of the property will be used. For example (note that is a contrived example):

 	var model = {
 		type: 'fruit'
 	};
	var nameProperty = BINDER.mkProperty(function () {
		return this.type === 'fruit' ? 'Apple' : 'Tomatoe';
	}, model);

 	var model2 = {
 		type: 'vegetable'
 	};

 	model.name = nameProperty;
 	model2.name = nameProperty;

 	// The context for 'name' will be the 'model' object.
 	model.name(); // Returns 'Apple'

 	// The context for 'name' will be the 'model2' object.
 	nameProperty.clearMemo(); // Clear the memoized value, otherwise will always return 'Apple'.
 	model2.name(); // Returns 'Tomatoe'

 	// In JavaScript the context would typically be inferred to be the 'window' object.
 	// However, instead of inferring 'window' BINDER uses the value of the property's
 	// 'owner' property, which in this case is the 'model' object.
 	nameProperty.clearMemo();
 	nameProperty(); // Returns 'Apple'
 	// These statements are equivalent the one above.
 	nameProperty.clearMemo();
 	nameProperty.call(nameProperty.owner); // Returns 'Apple'
 	nameProperty.clearMemo();
 	nameProperty.get(); // Returns 'Apple'

**BINDER.mkProperty.get()**

	get(property)

	property - A binderjs property or any other value.
	return - If property is a binderjs property then the value of the property, otherwise property.

A convenience method that will retrieve the value of the specified property if it is a binderjs property, otherwise returns property.

---

**property()**

	property()
	property(value)

Retrieves or sets the value of the property. Temporarily the `owner` property of the property is assigned the `this` object if `this` does not equal `undefined`. The custom `get` operator will be called with the `owner` property as the `this` object.

If the value of the property is a `List` and the value being set is not an `Array` then the list will be cleared and the value will be pushed onto the list, otherwise if the value being set is an `Array` then it will be merged with the list, potentially replacing the list's contents. While this occurs all notifications are temporarily blocked so that only one notification occurs.


**property.get()**

	get()

Retrieves the value of the property. The custom `get` operator will be called with the `owner` property as the `this` object. This is an alias to the functional pattern to properties above.


**property.set()**

	set(value)


Sets the value of the property. The custom `set` operator will be called with the `owner` property as the `this` object. This is an alias to the functional pattern to properties above.



**property.dependecnies()**

	dependencies()

	return - List of properties.

Retrieves the reference to the list of properties this property is dependent on. This list should not be modified.


**property.equals()**

	equals(value)

	value - An object or binderjs property to compare.
	return - True if the value is equal to the property's value.

Determines if this property value equals the specified value.

The `equals` operator will be called with a single argument to test against.

For example:

	property.equals = function (other) {
		other = BINDER.mkProperty.get(other);
		return this.get().id === other.id;
	};


**property.changed()**

	changed(value)

	value - An object or binderjs property to compare.

Determines if this property value equals the specified value and the value represents a change.

The `changed` operator will be called with a single argument to test against.

When specifying your own `change` operator you should call `equals` first then perform the change calculation only if the `value` is equal to the property's value.

For example:

	property.changed = function (other) {
		if (this.equals(other)) {
			other = BINDER.mkProperty.get(other);
			return this.get().type !== other.type;
		}
		return false;
	};


**property.clearMemo()**

	clearMemo()

Since all properties are memoized, repeated calls to the `get` operator will result in only one calculation. All other calls will return the memoized value. This method will clear the memoized value and force the next call to the `get` operator to perform a calculation.


**property.isDependent()**

	isDependent()

Determines if the property is dependent on other properties.


**property.toString()**

	toString()

Returs the value of calling `toString` on the property's value. If the value is `null` or `undefined` then returns the empty string.


**property.valueOf()**

	valueOf()

Returns the value of calling `valueOf` on the property's value.


---

**BINDER.mkBinding()**

	mkBinding(source, sink, [type])

	source - The binderjs property that will be the source of the binding.
	sink - The binderjs property that will be the sink of the binding.
	type - The type of binding ('once', 'oneway', 'twoway'[default])
	return - A new binding object.

Creates a binding between two disjoint (i.e. completely independent) binderjs properties.

A binding alwyas flows data from source to sink when created, but the following binding types will dictate whether or not data will flow from sink to source:

	once - Only flows data once from source to sink.
	oneway - Only flows data from source to sink if the source is modified.
				If the sink is modified then no data flow occurs.
	twoway [default] - Flows data from source to sink if the source is modified,
						and flows data from sink to source if the sink is modified.


**binding.type()**

	type()

	return - The type of the binding: 'once', 'oneway', 'twoway'

Retrieves the binding type.


**binding.source()**

	source()

	return - The source binderjs property for this binding.

Retrieves the binding source.


**binding.sink()**

	sink()

	return - The sink binderjs property for this binding.

Retrieves the binding sink.


**binding.dispose()**

	dispose()

Disposes the subscription to the source and sink.