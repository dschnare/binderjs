/** @constructor */
function List() {}
List.prototype.concat = function () {};
List.prototype.indexOf = function () {};
List.prototype.join = function () {};
List.prototype.lastIndexOf = function () {};
List.prototype.map = function () {};
List.prototype.filter = function () {};
List.prototype.forEach = function () {};
List.prototype.reduce = function () {};
List.prototype.reduceRight = function () {};
List.prototype.reverse = function () {};
List.prototype.some = function () {};
List.prototype.shift = function () {};
List.prototype.slice = function () {};
List.prototype.sort = function () {};
List.prototype.splice = function () {};
List.prototype.every = function () {};
List.prototype.pop = function () {};
List.prototype.push = function () {};
List.prototype.unshift = function () {};
List.prototype.toString = function () {};
List.prototype.contains = function () {};
List.prototype.contains = function () {};
List.prototype.occurances = function () {};
List.prototype.distinct = function () {};
List.prototype.first = function () {};
List.prototype.last = function () {};
List.prototype.find = function () {};
List.prototype.equals = function () {};
List.prototype.changed = function () {};
List.prototype.compare = function () {};
List.prototype.merge = function () {};
List.prototype.mergeWith = function () {};
List.prototype.remove = function () {};
List.prototype.removeAt = function () {};
List.prototype.clear = function () {};
List.prototype.collapse = function () {};
List.prototype.replaceAt = function () {};
List.prototype.isEmpty = function () {};
List.prototype.peek = function () {};
List.prototype.insert = function () {};

/** @constructor */
function Observer() {}
Observer.prototype.onNotify = function () {};
/** @type {Object} */
Observer.prototype.thisObj;

/** @constructor */
function Disposable() {}
Disposable.prototype.dispose = function () {};

/**
 * @extends {Disposable}
 * @constructor
 */
function Observable() {}
Observable.prototype.block = function () {};
Observable.prototype.unblock = function () {};
/** @return {Disposable} */
Observable.prototype.subscribe = function () {};
Observable.prototype.throttle = function () {};
Observable.prototype.notify = function () {};

/**
 * @extends {Observable}
 * @extends {List}
 * @constructor
 */
function ObservableList() {}

/**
 * @extends {ActionArgs}
 * @constructor
 */
function ActionArgs() {}
ActionArgs.prototype.action;
ActionArgs.prototype.newStartingIndex;
ActionArgs.prototype.newItems;
ActionArgs.prototype.oldStartingIndex;
ActionArgs.prototype.oldItems;


/**
 * @extends {List}
 * @constructor
 */
function Dependencies() {}
Dependencies.prototype.add = function () {};

/**
 * @extends {Observable}
 * @constructor
 */
function Property() {}
/** @type {*} */
Property.owner;
/** @type {Dependecies} */
Property.prototype.dependencies;
Property.prototype.isDependent = function () {};
Property.prototype.clearMemo = function () {};
Property.prototype.get = function () {};
Property.prototype.set = function () {};
Property.prototype.equals = function () {};
Property.prototype.changed = function () {};

/**
 * @extends {Disposable}
 * @constructor
 */
function Binding() {}
Binding.prototype.type = function () {};
Binding.prototype.source = function () {};
Binding.prototype.sink = function () {};

var binder = {
	/** @return {List} */
	makeList: function () {},
	/** @return {Observable} */
	makeObservable: function () {},
	/** @return {ObservableList} */
	makeObservableList: function () {},
	/** @return {Property} */
	makeProperty: function () {},
	/** @return {Binding} */
	makeBinding: function () {},
	toJSON: function () {},
	fromJSON: function () {}
};

/** @type {Object} */
binder.makeList.interfce;
/** @type {Object} */
binder.makeObservable.interfce;
/** @type {Object} */
binder.makeObservableList.interfce;
/** @type {Object} */
binder.makeProperty.interfce;
binder.makeProperty.get = function () {};
/** @type {Object} */
binder.makeBinding.interfce;