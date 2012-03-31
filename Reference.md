# Usage

**Standard HTML:**

	<script type="text/javascript" src="pathto/util.min.js"></script>
	<script type="text/javascript" src="pathto/binder.min.js"></script>

	// Or if you prefer to use the all-in-one script that already includes utiljs

	<script type="text/javascript" src="pathto/binder.all.min.js"></script>

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

**binder.utiljs**

The exposed API for utiljs.

**binder.toObject()**

Converts an object that contains binderjs properties into a plain-old-javascript-object (POJO) by performing a shallow copy of all properties and adding them to a new object. If the property is a binderjs property then the property's value will be copied. If `excludeDependentProperties` is `truthy` then any binderjs property that has dependencies will be skipped.

	toObject(o, excludeDependentProperties)

	o - An object with binderjs properties.
	excludeDependentProperties - Flag that determines if properties with dependencies (i.e. dependent properties) will be excluded.
	return - A new POJO with a shallow copy each property.

---

**binder.makeObservable()**

Creates an observable object that can be observed for changes.

	makeObservable()

*observable.subscribe()*

Subscribes to the changes of an observable. When the callback or `onNotify` function are called the observable sending the notification will be passed as an argument. If an observer object does not have an `onNotify` method then the observer object will not subscribe to the observerable.

	subscribe(fn)
	subscribe(observer)

	fn - The callback function to have called when the observable has changed.
	observer - An object with a onNotify() function.
	return - A subscription object with a dispose() function.

*observable.notify()*	

Notifies all subscribers if the observable is not blocked and not being throttled.

	notify()

*observable.throttle()*

Throttles notifications sent to subscribers by placing a timeout between the first call to `notify()` and when the subscribers are actually notified. All subsequent calls to `notify()` will have no effect until the timeout has expired. When the timeout has expired then the subscribers will be notified.

	throttle(duration)

	duration - The timeout duration in milliseconds.

*observable.block()*

Pushes a block state onto the internal block stack. While the block stack has at least one block state the observable is said to be blocked and subsequent calls to `notify()` will have no effect.

	block()

*observable.unblock()*

Removes a block state from the internal block stack. While the block stack has at least one block state the observable is said to be blocked and subsequent calls to `notify()` will have no effect.

	unblock()

*observable.dispose()*		

Removes and disposes all subscribers.

	dispose()		

---

**binder.makeList()**

Makes a list that extends `Array` and adheres to the EcmaScript 5 Array specification.

	makeList()
	makeList(array)
	makeList(item,...,item)
	
	array - An Array or another list to copy items from.
	... - A variadic list of items to add to the list.

**The following [ES5](http://www.ecma-international.org/publications/standards/Ecma-262.htm) functions are implemented if not present on the native Array (without modifying the Array.prototype):**

*list.indexOf()*

	indexOf(item, [fromIndex])
	
	item - The item to search for.
	fromIndex - The index to start the search.
	return - The index of the item in the list, -1 otherwise.

*list.lastIndexOf()*

	lastIndexOf(item, [fromIndex])

	item - The item to search for.
	fromIndex - The index to start the search.
	return - The index of the item in the list, -1 otherwise.

*list.reverse()*

	reverse()
	
	return - This list.

*list.map()*

	map(callback, [thisObj])

	callback - The callback to call on each item.
	thisObj - The context to call callback with.
	return - A new array with the mapped items.

*list.filter()*

	filter(callback, [thisObj])

	callback - The callback to call on each item.
	thisObj - The context to call callback with.
	return - A new array with the filtered items.

*list.forEach()*

	forEach(callback, [thisObj])

	callback - The callback to call on each item.
	thisObj - The context to call callback with.

*list.reduce()*

	reduce(callback, [initialValue])

	callback - The callback to call on each item.
	initialValue - The initial value to assign to previous.
	return - The final result of calling callback.

*list.reduceRight()*

	reduceRight(callback, [initialValue])

	callback - The callback to call on each item.
	initialValue - The initial value to assign to previous.
	return - The final result of calling callback.

*list.some()*

	some(callback, [thisObj])

	callback - The callback to call on each item.
	thisObj - The context to call callback with.
	return - True if callback returns true, false otherwise.

*list.every()*

	every(callback, [thisObj])

	callback - The callback to call on each item.
	thisObj - The context to call callback with.
	return - True if callback always returns true, false otherwise.

**The following methods are added to form the list API:**

*list.collapse()*

Removes all sparce items in this list. A sparce item is any item that has the value of undefined or whose index does not exist in the list.

	collapse()

*list.contains()*

Determines if the specified item is found in the list. The search is performed using strict equality.

	contains(item)

	item - The item to test for containment.
	return - True if the item is found in the list, false otherwise.

*list.occurances()*

Determines the number of occurances an item occurs in the list. The search is performed using strict equality.

	occurances(item)

	item - The item to search for.
	return - The number of times the item occurs in the list.

*list.distinct()*

Produces an `Array` that contains all items that only occur once in the list.

	distinct()

	return - An Array with all items that occur once in the list.

*list.first()*

Retrieves the first item where the `callback` returns true. The order of the traversal is ascending order.

`callback` will be called with the item, the index of the item and the object being traversed.

	first(callback, [thisObj])

	callback - The callback to call on each item.
	thisObj - The context to call callback with.
	return - The item where the callback returned true, undefined otherwise.

*list.last()*

Retrieves the last item where the `callback` returns true. The order of the traversal is descending order.

`callback` will be called with the item, the index of the item and the object being traversed.

	last(callback, [thisObj])

	callback - The callback to call on each item.
	thisObj - The context to call callback with.
	return - The item where the callback returned true, undefined otherwise.

	last(callback, [thisOb])

*list.find()*

Retrieves the item and index where the `callback` returns true. The order of the traversal is ascending order.

`callback` will be called with the item, the index of the item and the object being traversed.

	find(callback)
	find(callback, fromIndex)
	find(callback, thisObj)
	find(callback, fromIndex, thisObj)

	callback - The callback to call on each item.
	thisObj - The context to call callback with.
	fromIndex - The starting index of the traversal.
	return - An object with the following properties: index, item.

*list.getItemOperators*

Method that can be overriden to provide `equals` and `changed` operators that are to be used when comparing items in the list. The operators have the following signature:

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


	getItemOperators()

	return - An object with the following properties: equals, changed.	

*list.equals()*

Determines if all items in the `otherList` are in the same order and are equal to the items in this list. Equality is performed by calling the `equals` operator from `getItemOperators`.

	equals(otherList)

	otherList - The other list (or Array) to compare against.
	return - True if all items in the other list are equal to the this list, false otherwise.

*list.changed()*

Determines if all items in the `otherList` are in the same order and are equal to the items in this list but have changed. Equality and changed is performed by calling the `equals` and `changed` operators respectively from `getItemOperators`.

	changed(otherList)

	otherList - The other list (or Array) to compare against.
	return - True if any item in the ohter list has changed or is not equal to the associated item in this list.

*list.compare()*

Retrieves the comparison results by comparing this list against the `otherList`. The `equals` and `changed` operators from `getItemOperators` are used to determine if items are equal or have changed.

Returns a list with a comparison result for each item in this list. Comparison results have the following properties:

	status - The status of the comparison: added, changed, deleted, retained.
	item - The referenced item in this list.
	value - The referenced item in this list (alias for item property).
	index - The index of the referenced item in this list.
	otherItem - The referenced item in the other list.
	otherIndex - The index of the referenced item in the other list.
	toString - Custom toString() function.


	compare(otherList)

	otherList - The other list (or Array) to compare against.
	return - A new list with the comparison results for each item in this list.

*list.merge()*

Produces a new list with the results of merging this list with `otherList`. All items that are 'retained' are unmodified, all items that are 'added' are added, all items that are 'deleted' are removed, all items that are 'changed' are replaced with the newer item.

All indices from `otherList` are kept in the resulting list.

	merge(otherList)
	
	otherList - The other list (or Array) to merge against.
	return - A new collapsed list with the results of the merge.

*list.mergeWith()*

Merges the `otherList` into this list in-palce. All items that are 'retained' are unmodified, all items that are 'added' are added, all items that are 'deleted' are removed, all items that are 'changed' are replaced with the newer item.

All indices from `otherList` are kept in the resulting list.

	mergeWith(otherList)
	
	otherList - The other list (or Array) to merge against.

*list.remove()*

Removes the specified items from this list. The items are found by using strict equality.

	remove(item,...,item)

	... - A variadic list of items to remove.

*list.removeAt()*

Removes the item at the specified index.

	removeAt(index)

	index - The index of the item to remove.
	return - The item removed or undefined if index is out of bounds.

*list.clear()*

Removes all items in the list.

	clear()

*list.replaceAt()*

Replaces the item at the specified index.

	replaceAt(index, item)

	index - The index of the item to replace.
	item - The new item.
	return - The item replaced.

*list.isEmpty()*

Determines if the list has a length of zero.

	isEmpty()

*list.peek()*

Retrieves the last item in the list without removing it.

	peek()

*list.insert()*		

Inserts an item at the specified index and increases the length of the list.

If `index` is less than `0` then `index` is set to `0`.

If `index` is greater than the list length then `index` is set to `length - 1`.

	insert(index, item)

	index - The index to insert at.
	item - The item to insert.
	return - True if the item was inserted, false otherwise.

---			

**binder.makeObservableList()**

	makeObservableList()
	makeObservableList(array)
	makeObservableList(item,...,item)

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

---

**binder.makeProperty()**

Makes an observable property that extends `function`. All properties will dynamically track any property that is accessed during a `get` operation as dependencies. If any dependencies change then this property will notify its observers of the change as well.

Immediately after the property is created a `get` operation is called on the property in order to track any property dependencies accurately. This behaviour can be deferred until the property is first accessed by setting `lazy` to a truthy value.

If the value of the property is an `Array` or `List` then it will be copied into an `ObservableList` and the new list will be the property's value. If the value is already an `ObservableList` then no new list will be created.

If the value is `Observable` then the property will subscribe to the value for changes and relay any notifications.

Properties work best when the value is not a `function`.

	makeProperty(value)
	makeProperty(get)
	makeProperty({value, [equals, changed]})
	makeProperty({get, [set, equals, changed, lazy, owner]})

	value - The property value.
	get - The custom get opertor.
	set - The custom set operator.
	equals - The equals operator. Defaults to using strict equality.
	changed - The changed operator. Defautlts to using strict inequality.
	lazy - Flag indicating that dependencies shouldn't be tracked until first access. Defaults to false.
	owner - The object the property belongs to. Defaults to undefined.

*makeProperty.get()*

A convenience method that will retrieve the value of the specified property if it is a binderjs property, otherwise returns property.

	get(property)

	property - A binderjs property or any other value.
	return - If property is a binderjs property then the value of the property, otherwise property.

*property()*

Retrieves the value of the property. Temporarily the `owner` property of the property is assigned the `this` object if `this` does not equal `window`. The custom `get` operator will be called with the `owner` property as the `this` object.

*property(value)*

Sets the value of the property. Temporarily the `owner` property of the property is assigned the `this` object if `this` does not equal `window`. The custom `set` operator will be called with the `owner` property as the `this` object.

*property.get()*
	
Retrieves the value of the property. The custom `get` operator will be called with the `owner` property as the `this` object.

	get()

*property.set()*

Sets the value of the property. The custom `set` operator will be called with the `owner` property as the `this` object.

	set(value)

*property.dependecnies()*

Retrieves the reference to the list of properties this property is dependent on. This list should not be modified.

	dependencies()

	return - List of properties.

*property.equals()*

Determines if this property value equals the specified value.

	equals(value)

	value - An object or binderjs property to compare.
	return - True if the value is equal to the property's value.

*property.changed()*

Determines if this property value equals the specified value and the value represents a change. When specifying your own `change` operator you should call `equals` first then perform the change calculation only if the `value` is equal to the property's value.

	changed(value)

	value - An object or binderjs property to compare.

*property.clearMemo()*

Since all properties are memoized, repeated calls to the `get` operator will result in only one calculation. All other calls will return the memoized value. This method will clear the memoized value and force the next call to the `get` operator to perform a calculation.

	clearMemo()

*property.isDependent()*

Determines if the property is dependent on other properties.

	isDependent()

*property.toString()*

Returs the value of calling `toString` on the property's value. If the value is `null` or `undefined` then returns the empty string.

	toString()

*property.valueOf()*

Returns the value of calling `valueOf` on the property's value.

	valueOf()


---

**binder.makeBinding()**

Creates a binding between two disjoint (i.e. completely independent) binderjs properties.

A binding alwyas flows data from source to sink when created, but the following binding types will dictate whether or not data will flow from sink to source:

	once - Only flows data once from source to sink.
	oneway - Only flows data from source to sink if the source is modified. If the sink is modified then no data flow occurs.
	twoway [default] - Flows data from source to sink if the source is modified, and flows data from sink to source if the sink is modified.

	makeBinding(source, sink, [type])

	source - The binderjs property that will be the source of the binding.
	sink - The binderjs property that will be the sink of the binding.
	type - The type of binding ('once', 'oneway', 'twoway'[default])
	return - A new binding object.
	

*binding.type()*

Retrieves the binding type.

	type()

	return - The type of the binding: 'once', 'oneway', 'twoway'

*binding.source()*

Retrieves the binding source.

	source()

	return - The source binderjs property for this binding.

*binding.sink()*

Retrieves the binding sink.

	sink()

	return - The sink binderjs property for this binding.

*binding.dispose()*

Disposes all subscriptions to the source and sink.

	dispose()
	