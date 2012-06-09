/**
 * @preserve Author: Darren Schnare
 * Keywords: javascript,binding,bind,property,list,observer,observable
 * License: MIT ( http://www.opensource.org/licenses/mit-license.php )
 * Repo: https://github.com/dschnare/binderjs
 */
/*global 'UTIL', 'xport', 'setTimeout', 'clearTimeout'*/
/*jslint sub: true, continue: true*/
(function () {
	'use strict';

	function module(util) {
		var Array = ([]).constructor,
			Object = ({}).constructor,
			makeList = (function () {
				var defaultItemOperators = {
						"equals": function (a, b) {
							a = a ? a.valueOf() : a;
							b = b ? b.valueOf() : b;

							return a === b;
						},
						"changed": function (a, b) {
							a = a ? a.valueOf() : a;
							b = b ? b.valueOf() : b;

							return a !== b;
						}
					},
					makeCompareResult = function (status, item, index, otherItem, otherIndex) {
						return {
							"status": status,
							"item": item,
							"value": item,
							"index": index,
							"otherItem": otherItem,
							"otherIndex": otherIndex,
							toString: function () {
								var s = "{status: {0}, item: {1}, index: {2}, otherItem: {3}, otherIndex: {4}}";
								return util.format(s, status, item, index, otherItem, otherIndex);
							}
						};
					},
					makeList = function (o) {
						var list = [];

						list["getItemOperators"] = function () {
							return util.create(defaultItemOperators);
						};

						// HTML5 specification.
						list["indexOf"] = list["indexOf"] || function (item, fromIndex) {
							var i,
								len = this.length;

							fromIndex = isNaN(fromIndex) ? 0 : fromIndex;

							if (len === 0) {
								return -1;
							}
							if (fromIndex >= len) {
								return -1;
							}
							if (fromIndex < 0) {
								fromIndex = len + fromIndex;
							}
							if (fromIndex < 0) {
								fromIndex = 0;
							}

							for (i = fromIndex; i < len; i += 1) {
								if (this[i] === item) {
									return i;
								}
							}

							return -1;
						};
						list["lastIndexOf"] = list["lastIndexOf"] || function (item, fromIndex) {
							var i,
								len = this.length,
								min = function (a, b) {
									return a < b ? a : b;
								};

							if (len === 0) {
								return -1;
							}

							fromIndex = isNaN(fromIndex) ? len : fromIndex;

							if (fromIndex >= 0) {
								fromIndex = min(fromIndex, len - 1);
							}
							if (fromIndex < 0) {
								fromIndex = len + fromIndex;
							}

							for (i = fromIndex; i >= 0; i -= 1) {
								if (this[i] === item) {
									item = null;
									return i;
								}
							}

							item = null;
							return -1;
						};
						list["reverse"] = list["reverse"] || function () {
							var i = 0,
								len = this.length,
								k = len - 1,
								mid = parseInt((len / 2).toFixed(0), 10),
								temp;

							while (i < mid) {
								temp = this[k];
								this[k] = this[i];
								this[i] = temp;
								k -= 1;
								i += 1;
							}

							return this;
						};
						list["map"] = list["map"] || function (callback, thisObj) {
							var i = 0,
								len = this.length,
								result = [];

							result.length = len;

							if (typeof callback !== 'function') {
								throw new Error('TypeError');
							}

							for (i = 0; i < len; i += 1) {
								if (this.hasOwnProperty(i)) {
									result[i] = callback.call(thisObj, this[i], i, this);
								}
							}

							return result;
						};
						list["filter"] = list["filter"] || function (callback, thisObj) {
							var i,
								v,
								len = this.length,
								result = [];

							if (typeof callback !== 'function') {
								throw new Error('TypeError');
							}

							for (i = 0; i < len; i += 1) {
								if (this.hasOwnProperty(i)) {
									v = this[i];
									if (callback.call(thisObj, v, i, this)) {
										result.push(v);
									}
								}
							}

							return result;
						};
						list["forEach"] = list["forEach"] || function (callback, thisObj) {
							var i,
								len = this.length;

							if (typeof callback !== 'function') {
								throw new Error('TypeError');
							}

							for (i = 0; i < len; i += 1) {
								if (this.hasOwnProperty(i)) {
									callback.call(thisObj, this[i], i, this);
								}
							}
						};
						list["reduce"] = list["reduce"] || function (callback, initialValue) {
							var len = this.length,
								i = 0,
								acc,
								present;

							if (typeof callback !== 'function') {
								throw new Error('TypeError');
							}
							if (len === 0 && arguments.length === 1) {
								throw new Error('TypeError');
							}

							if (arguments.length === 2) {
								acc = initialValue;
							} else {
								present = false;
								i = 0;

								while (!present && i < len) {
									present = this.hasOwnProperty(i);

									if (present) {
										acc = this[i];
									}

									i += 1;
								}
							}

							while (i < len) {
								present = this.hasOwnProperty(i);

								if (present) {
									acc = callback.call(undefined, acc, this[i], i, this);
								}

								i += 1;
							}

							return acc;
						};
						list["reduceRight"] = list["reduceRight"] || function (callback, initialValue) {
							var len = this.length,
								i = len - 1,
								acc,
								present;

							if (typeof callback !== 'function') {
								throw new Error('TypeError');
							}
							if (len === 0 && arguments.length === 1) {
								throw new Error('TypeError');
							}

							if (arguments.length === 2) {
								acc = initialValue;
							} else {
								present = false;

								while (!present && i >= 0) {
									present = this.hasOwnProperty(i);

									if (present) {
										acc = this[i];
									}

									i -= 1;
								}
							}

							while (i >= 0) {
								present = this.hasOwnProperty(i);

								if (present) {
									acc = callback.call(undefined, acc, this[i], i, this);
								}

								i -= 1;
							}

							return acc;
						};
						list["some"] = list["some"] || function (callback, thisObj) {
							var len = this.length,
								i;

							if (typeof callback !== 'function') {
								throw new Error('TypeError');
							}

							for (i = 0; i < len; i += 1) {
								if (this.hasOwnProperty(i)) {
									if (callback.call(thisObj, this[i], i, this)) {
										return true;
									}
								}
							}

							return false;
						};
						list["every"] = list["every"] || function (callback, thisObj) {
							var len = this.length,
								i;

							if (typeof callback !== 'function') {
								throw new Error('TypeError');
							}

							for (i = 0; i < len; i += 1) {
								if (this.hasOwnProperty(i)) {
									if (!callback.call(thisObj, this[i], i, this)) {
										return false;
									}
								}
							}

							return true;
						};

						// Custom Functionality.
						list["contains"] = function (item) {
							return this.indexOf(item) >= 0;
						};
						list["occurances"] = function (item) {
							var i = this.indexOf(item),
								count = 0;

							while (i >= 0) {
								count += 1;
								i = this.indexOf(item, i + 1);
							}

							return count;
						};
						list["distinct"] = function () {
							var i = this.length,
								distinct = [],
								item;

							while (i) {
								i -= 1;
								item = this[i];
								if (this["occurances"](item) === 1) {
									distinct.unshift(item);
								}
							}

							return distinct;
						};
						list["first"] = function (callback, thisObj) {
							var i,
								len = this.length;

							if (typeof callback !== 'function') {
								throw new Error('TypeError');
							}

							for (i = 0; i < len; i += 1) {
								if (this.hasOwnProperty(i)) {
									if (callback.call(thisObj, this[i], i, this)) {
										return this[i];
									}
								}
							}

							return undefined;
						};
						list["last"] = function (callback, thisObj) {
							var i = this.length;

							if (typeof callback !== 'function') {
								throw new Error('TypeError');
							}

							while (i) {
								i -= 1;
								if (this.hasOwnProperty(i)) {
									if (callback.call(thisObj, this[i], i, this)) {
										return this[i];
									}
								}
							}

							return undefined;
						};
						// find(callback)
						// find(callback, fromIndex)
						// find(callback, thisObj)
						// find(callback, fromIndex, thisObj)
						list["find"] = function (callback, fromIndex, thisObj) {
							var i,
								len = this.length;

							if (typeof callback !== 'function') {
								throw new Error('TypeError');
							}

							if (typeof fromIndex !== 'number' && !thisObj) {
								thisObj = fromIndex;
							}

							if (isNaN(fromIndex) || fromIndex < 0) {
								fromIndex = 0;
							}

							for (i = fromIndex; i < len; i += 1) {
								if (this.hasOwnProperty(i)) {
									if (callback.call(thisObj, this[i], i, this)) {
										return {item: this[i], index: i};
									}
								}
							}

							return {item: undefined, index: -1};
						};
						list["equals"] = function (otherList, equals) {
							var i,
								alen,
								blen,
								a = this,
								b = otherList,
								operators;

							if (!util.isArray(otherList)) {
								return false;
							}
							if (a === b) {
								return true;
							}
							if (a.length !== b.length) {
								return false;
							}

							alen = a.length;
							blen = b.length;
							operators = makeList["getItemOperators"](this);
							equals = typeof equals === 'function' ? equals : function () {
								return operators["equals"].apply(operators, arguments);
							};

							for (i = 0; i < alen && i < blen; i += 1) {
								if (!equals(a[i], b[i])) {
									return false;
								}
							}

							return true;
						};
						list["changed"] = function (otherList, equals, changed) {
							var i,
								alen,
								blen,
								a = this,
								b = otherList,
								operators;

							if (!util.isArray(otherList)) {
								return false;
							}
							if (a === b) {
								return false;
							}
							if (a.length !== b.length) {
								return true;
							}

							operators = makeList["getItemOperators"](this);
							equals = typeof equals === 'function' ? equals : function () {
								return operators["equals"].apply(operators, arguments);
							};
							changed = typeof changed === 'function' ? changed : function () {
								return operators["changed"].apply(operators, arguments);
							};

							alen = a.length;
							blen = b.length;
							for (i = 0; i < alen && i < blen; i += 1) {
								if (!equals(a[i], b[i]) || changed(a[i], b[i])) {
									return true;
								}
							}

							return false;
						};
						list["compare"] = function (otherList, equals, changed) {
							var operators,
								differences = makeList(),
								i,
								len,
								item,
								find = this.find,
								callback,
								result;

							otherList = makeList(otherList);
							operators = makeList["getItemOperators"](this);
							equals = typeof equals === 'function' ? equals : function () {
								return operators["equals"].apply(operators, arguments);
							};
							changed = typeof changed === 'function' ? changed : function () {
								return operators["changed"].apply(operators, arguments);
							};
							callback = function (it) {
								return equals(item, it);
							};

							len = this.length;
							for (i = 0; i < len; i += 1) {
								item = this[i];
								result = find.call(otherList, callback);

								if (result["index"] < 0) {
									differences.push(makeCompareResult("deleted", item, i));
								} else {
									if (changed(item, result["item"])) {
										differences.push(makeCompareResult("changed", item, i, result["item"], result["index"]));
									} else {
										differences.push(makeCompareResult("retained", item, i, result["item"], result["index"]));
									}

									delete otherList[result.index];
								}
							}

							len = otherList.length;
							for (i = 0; i < len; i += 1) {
								if (otherList.hasOwnProperty(i)) {
									item = otherList[i];

									if (this.find(callback).index < 0) {
										differences.push(makeCompareResult("added", undefined, -1, item, i));
									}
								}
							}

							item = otherList = equals = changed = null;

							return differences;
						};
						list["merge"] = function (otherList, equals, changed) {
							var list = makeList(this);
							list["mergeWith"](otherList, equals, changed);
							return list;
						};
						list["mergeWith"] = function (otherList, equals, changed) {
							var operators,
								d,
								i,
								len,
								diff;

							operators = makeList["getItemOperators"](this);
							d = this["compare"](otherList, equals, changed);
							len = d.length;

							for (i = 0; i < len; i += 1) {
								diff = d[i];

								switch (diff["status"]) {
								case "added":
									if (this[diff["otherIndex"]] === undefined) {
										this[diff["otherIndex"]] = diff["otherItem"];
									} else {
										this.splice(diff["otherIndex"], 0, diff["otherItem"]);
									}
									break;
								case "deleted":
									this[diff["index"]] = undefined;
									break;
								case "changed":
									// Move and a change.
									if (diff["index"] !== diff["otherIndex"]) {
										if (this[diff["otherIndex"]] === undefined) {
											this[diff["index"]] = undefined;
											this[diff["otherIndex"]] = diff["otherItem"];
										} else {
											this.splice(diff["index"], 1);
											this.splice(diff["otherIndex"], 0, diff["item"]);
										}
									// Just a change.
									} else {
										this[diff["index"]] = diff["otherItem"];
									}
									break;
								case "retained":
									// Move.
									if (diff["index"] !== diff["otherIndex"]) {
										if (this[diff["otherIndex"]] === undefined) {
											this[diff["index"]] = undefined;
											this[diff["otherIndex"]] = diff["otherItem"];
										} else {
											this.splice(diff["index"], 1);
											this.splice(diff["otherIndex"], 0, diff["item"]);
										}
									} else {
										this[diff["index"]] = diff["otherItem"];
									}
									break;
								}
							}

							this["collapse"]();
						};
						list["remove"] = function () {
							var i,
								k,
								arg,
								len = arguments.length;

							for (i = 0; i < len; i += 1) {
								arg = arguments[i];
								k = this.length;

								while (k) {
									k -= 1;
									if (this[k] === arg) {
										this.splice(k, 1);
									}
								}
							}
						};
						list["removeAt"] = function (index) {
							if (isFinite(index) && index >= 0 && index < this.length) {
								return this.splice(index, 1).pop();
							}
						};
						list["clear"] = function () {
							while (this.length) {
								this.pop();
							}
						};
						list["collapse"] = function () {
							var i = this.length;

							while (i) {
								i -= 1;
								if (this[i] === undefined) {
									this.splice(i, 1);
								}
							}
						};
						list["replaceAt"] = function (index, item) {
							var replaced;

							if (isFinite(index) && index >= 0 && index < this.length) {
								replaced = this[index];
								this[index] = item;
							}

							return replaced;
						};
						list["isEmpty"] = function () {
							return this.length === 0;
						};
						list["peek"] = function () {
							return this[this.length - 1];
						};
						list["insert"] = function (index, item) {
							if (index > this.length) {
								index = this.length;
							} else if (index < 0) {
								index = 0;
							}

							if (isFinite(parseInt(index, 10))) {
								if (index === this.length) {
									this.push(item);
								} else if (this.hasOwnProperty(index)) {
									this.splice(index, 0, item);
								} else {
									this[index] = item;
								}

								return index;
							}

							return false;
						};


						// Initialization.
						(function (args) {
							var argcount = args.length;

							if (argcount === 1 && util.isArray(o)) {
								list.push.apply(list, o);
							} else if (argcount) {
								list.push.apply(list, list.slice.call(args));
							}
						}(arguments));

						return list;
					};

				// Guarantees valid item operators.
				makeList["getItemOperators"] = function (list) {
					var operators = list["getItemOperators"]();

					if (typeof operators["equals"] !== 'function') {
						operators["equals"] = defaultItemOperators["equals"];
					}
					if (typeof operators["changed"] !== 'function') {
						operators["changed"] = defaultItemOperators["changed"];
					}

					return operators;
				};

				makeList["interfce"] = {
					"concat": 'function',
					"indexOf": 'function',
					"join": 'function',
					"lastIndexOf": 'function',
					"map": 'function',
					"filter": 'function',
					"forEach": 'function',
					"reduce": 'function',
					"reduceRight": 'function',
					"reverse": 'function',
					"some": 'function',
					"shift": 'function',
					"slice": 'function',
					"sort": 'function',
					"splice": 'function',
					"every": 'function',
					"pop": 'function',
					"push": 'function',
					"unshift": 'function',
					"toString": 'function',
					//--
					"contains": 'function',
					"occurances": 'function',
					"distinct": 'function',
					"first": 'function',
					"last": 'function',
					"find": 'function',
					"equals": 'function',
					"changed": 'function',
					"compare": 'function',
					"merge": 'function',
					"mergeWith": 'function',
					"remove": 'function',
					"removeAt": 'function',
					"clear": 'function',
					"collapse": 'function',
					"replaceAt": 'function',
					"isEmpty": 'function',
					"peek": 'function',
					"insert": 'function'
				};

				return makeList;
			}()),
			makeObservable = (function () {
				var slice = Array.prototype.slice,
					notify = function (self, observers, args) {
						var i,
							observer,
							len = observers.length,
							temp;

						args = args.slice();
						args.unshift(self);

						for (i = 0; i < len; i += 1) {
							observer = observers[i];

							if (observer) {
								if (typeof observer === 'function') {
									observer.apply(observer["thisObj"], args);
								} else if (typeof observer["onNotify"] === 'function') {
									observer["onNotify"].apply(observer, args);
								}
							}
						}
					},
					makeObservable = function () {
						var observers = makeList(),
							throttleDuration = 0,
							notifying = false,
							blockStack = [],
							throttleId = -1,
							observable = {
								"block": function () {
									blockStack.push(true);
								},
								"unblock": function () {
									blockStack.pop();
								},
								"subscribe": function (observer, thisObj) {
									if (observer && !observers["contains"](observer)) {
										observer["thisObj"] = thisObj || undefined;
										observers.push(observer);

										return {
											"dispose": function () {
												observers["remove"](observer);
											}
										};
									}

									return {
										"dispose": function () {}
									};
								},
								"throttle": function (durationInMilliseconds) {
									if (!isFinite(durationInMilliseconds)) {
										durationInMilliseconds = 0;
									}
									throttleDuration = durationInMilliseconds;
								},
								// Can specify any number of arguments.
								"notify": function () {
									var self = this, args = slice.call(arguments);

									if (blockStack.length || notifying) {
										return;
									}

									notifying = true;

									if (throttleDuration > 0) {
										throttleId = setTimeout(function () {
											notify(self, observers, args);
											notifying = false;
										}, throttleDuration);
									} else {
										notify(self, observers, args);
										notifying = false;
									}
								},
								"dispose": function () {
									observers["clear"]();
									clearTimeout(throttleId);
								}
							};

						return observable;
					};

				makeObservable["interfce"] = {
					"block": 'function',
					"unblock": 'function',
					"subscribe": 'function',
					"throttle": 'function',
					"notify": 'function',
					"dispose": 'function'
				};

				return makeObservable;
			}()),
			makeObservableList = (function () {
				var makeObservableList = function () {
					var slice = ([]).slice,
						list = makeList.apply(undefined, slice.call(arguments)),
						makeActionArgs = function (action, newStartingIndex, newItems, oldStartingIndex, oldItems) {
							newStartingIndex = parseInt(newStartingIndex, 10);
							oldStartingIndex = parseInt(oldStartingIndex, 10);

							return {
								"action": action,
								"newStartingIndex": isFinite(newStartingIndex) ? newStartingIndex : -1,
								"newItems": util.isArray(newItems) ? newItems : (newItems === null || newItems === undefined ? [] : [newItems]),
								"oldStartingIndex": isFinite(oldStartingIndex) ? oldStartingIndex : -1,
								"oldItems": util.isArray(oldItems) ? oldItems : (oldItems === null || oldItems === undefined ? [] : [oldItems])
							};
						},
						actions = {
							add: function (newStartingIndex, newItems) {
								list["notify"](makeActionArgs('add', newStartingIndex, newItems));
							},
							remove: function (oldStartingIndex, oldItems) {
								list["notify"](makeActionArgs('remove', null, null, oldStartingIndex, oldItems));
							},
							replace: function (newStartingIndex, newItems, oldStartingIndex, oldItems) {
								list["notify"](makeActionArgs('replace', newStartingIndex, newItems, oldStartingIndex, oldItems));
							},
							move: function (newStartingIndex, newItems, oldStartingIndex, oldItems) {
								list["notify"](makeActionArgs('move', newStartingIndex, newItems, oldStartingIndex, oldItems));
							},
							reset: function () {
								list["notify"](makeActionArgs('reset'));
							}
						};

					util.mixin(list, makeObservable());

					// remove() does not need to be overridden because internally it
					// calls splice(), which will issue notifications. The remove()
					// method will issue a notification of change for every item being removed.

					list["replaceAt"] = (function (base) {
						return function (index, newItem) {
							var oldItem;

							if (index >= 0 && index < this.length) {
								this["block"]();
								oldItem = base.call(this, index, newItem);
								this["unblock"]();

								actions.replace(index, newItem, index, oldItem);
							}

							return oldItem;
						};
					}(list["replaceAt"]));
					list["clear"] = (function (base) {
						return function () {
							var origLen = this.length;

							this["block"]();
							base.call(this);
							this["unblock"]();

							if (origLen !== this.length) {
								actions.reset();
							}
						};
					}(list["clear"]));
					list["collapse"] = (function (base) {
						return function () {
							var origLen = this.length;

							this["block"]();
							base.call(this);
							this["unblock"]();

							if (origLen !== this.length) {
								actions.reset();
							}
						};
					}(list["collapse"]));
					list["insert"] = (function (base) {
						return function (index, item) {
							this["block"]();
							var insertedIndex = base.call(this, index, item);
							this["unblock"]();

							if (insertedIndex !== false) {
								actions.add(insertedIndex, item);
							}

							return insertedIndex;
						};
					}(list["insert"]));
					list["mergeWith"] = (function (base) {
						return function (otherList, equals, changed) {
							var operators,
								d,
								i,
								len,
								diff,
								notifications = [];

							this["block"]();

							operators = makeList["getItemOperators"](this);
							d = this["compare"](otherList, equals, changed);
							len = d.length;

							for (i = 0; i < len; i += 1) {
								diff = d[i];

								switch (diff["status"]) {
								case "added":
									notifications.push(makeActionArgs('add', diff["otherIndex"], diff["otherItem"]));

									if (this[diff["otherIndex"]] === undefined) {
										this[diff["otherIndex"]] = diff["otherItem"];
									} else {
										this.splice(diff["otherIndex"], 0, diff["otherItem"]);
									}
									break;
								case "deleted":
									notifications.push(makeActionArgs('remove', null, null, diff["index"], diff["item"]));
									this[diff["index"]] = undefined;
									break;
								case "changed":
									// Move and a change.
									if (diff["index"] !== diff["otherIndex"]) {
										notifications.push(makeActionArgs('move', diff["otherIndex"], diff["otherItem"], diff["index"], diff["item"]));

										if (this[diff["otherIndex"]] === undefined) {
											this[diff["index"]] = undefined;
											this[diff["otherIndex"]] = diff["otherItem"];
										} else {
											this.splice(diff["index"], 1);
											this.splice(diff["otherIndex"], 0, diff["item"]);
										}
									// Just a change.
									} else {
										notifications.push(makeActionArgs("replace", diff["index"], diff["otherItem"], diff["index"], diff["item"]));
										this[diff["index"]] = diff["otherItem"];
									}
									break;
								case "retained":
									// Move.
									if (diff["index"] !== diff["otherIndex"]) {
										notifications.push(makeActionArgs('move', diff["otherIndex"], diff["otherItem"], diff["index"], diff["item"]));

										if (this[diff["otherIndex"]] === undefined) {
											this[diff["index"]] = undefined;
											this[diff["otherIndex"]] = diff["otherItem"];
										} else {
											this.splice(diff["index"], 1);
											this.splice(diff["otherIndex"], 0, diff["item"]);
										}
									} else {
										this[diff["index"]] = diff["otherItem"];
									}
									break;
								}
							}

							this["collapse"]();
							this["unblock"]();

							while (notifications.length) {
								this["notify"](notifications.shift());
							}
						};
					}(list["mergeWith"]));
					list["reverse"] = (function (base) {
						return function () {
							this["block"]();
							base.call(this);
							this["unblock"]();

							actions.reset();

							return this;
						};
					}(list["reverse"]));
					list["pop"] = (function (base) {
						return function () {
							var origLen = this.length,
								oldItem;

							this["block"]();
							oldItem = base.call(this);
							this["unblock"]();

							if (origLen !== this.length) {
								actions.remove(origLen - 1, oldItem);
							}

							return oldItem;
						};
					}(list["pop"]));
					list["push"] = (function (base) {
						return function () {
							var origLen = this.length,
								newItems = slice.call(arguments),
								newLength;

							this["block"]();
							newLength = base.apply(this, newItems);
							this["unblock"]();

							if (origLen !== newLength) {
								actions.add(origLen, newItems);
							}

							return newLength;
						};
					}(list["push"]));
					list["shift"] = (function (base) {
						return function () {
							var origLen = this.length,
								oldItem;

							this["block"]();
							oldItem = base.call(this);
							this["unblock"]();

							if (origLen !== this.length) {
								actions.remove(0, oldItem);
							}

							return oldItem;
						};
					}(list["shift"]));
					list["unshift"] = (function (base) {
						return function () {
							var origLen = this.length,
								newItems = slice.call(arguments),
								newLength;

							this["block"]();
							newLength = base.apply(this, newItems);
							this["unblock"]();

							if (origLen !== this.length) {
								actions.add(0, newItems);
							}

							return newLength;
						};
					}(list["unshift"]));
					list["sort"] = (function (base) {
						return function () {
							base.apply(this, slice.call(arguments));

							actions.reset();

							return this;
						};
					}(list["sort"]));
					list["splice"] = (function (base) {
						return function (index, deleteCount) {
							var origLen = this.length,
								newItems = slice.call(arguments, 2),
								oldItems;

							index = parseInt(index, 10);
							index = isFinite(index) ? index : 0;

							if (index < 0) {
								index = 0;
							} else if (index > this.length) {
								index = this.length;
							}

							this["block"]();
							oldItems = base.apply(this, slice.call(arguments));
							this["unblock"]();

							if (origLen !== this.length) {
								if (newItems.length === 0 && oldItems.length !== 0) {
									actions.remove(index, oldItems);
								} else if (newItems.length !== 0 && oldItems.length === 0) {
									actions.add(index, newItems);
								} else {
									actions.replace(index, newItems, index, oldItems);
								}
							}

							return oldItems;
						};
					}(list["splice"]));

					return list;
				};

				makeObservableList["interfce"] = util.mixin({}, makeObservable["interfce"], makeList["interfce"]);

				return makeObservableList;
			}()),
			makeProperty = (function () {
				var makeProperty,
					getVal,
					stack = makeList(),
					// Flag to indicate that properties can only add themselves as
					// dependencies iff the property at the top of the stack has
					// the same owner. By default this is set to false, meaning that
					// if a property were to call another property of a different
					// owner then the property called would be marked as a dependency.
					// This value is never changed at runtime.
					strictDependencies = false;

				stack.pushProperty = function (property) {
					if (this.length) {
						if (!strictDependencies || this["peek"]()["owner"] === property["owner"]) {
							this.push(property);
						}
					} else {
						this.push(property);
					}
				};
				stack.addDependency = function (property) {
					if (this.length) {
						if (!strictDependencies || this["peek"]()["owner"] === property["owner"]) {
							this["peek"]()["dependencies"]()["add"](property);
						}
					}
				};

				makeProperty = function (options, set, owner) {
					var writing = false,
						dependencies = makeList(),
						subscriptions = [],
						setter,
						getter,
						memo,
						property,
						observer = function () {
							memo = undefined;
							property["notify"]();
						};

					dependencies["add"] = function (prop) {
						if (!this["contains"](prop)) {
							this.push(prop);
							subscriptions.push(prop["subscribe"](observer));
						}
					};

					property = function (value) {
						var ret, origOwner = property["owner"];

						// Temporarily set the owner to the 'this' object.
						if (this !== undefined) {
							property["owner"] = this;
						}

						if (arguments.length) {
							property["set"](value);
							ret = this;
						} else {
							ret = property["get"]();
						}

						property["owner"] = origOwner;

						return ret;
					};
					property["equals"] = function (b) {
						var a = this["get"]();
						b = getVal(b);

						a = a ? a.valueOf() : a;
						b = b ? b.valueOf() : b;

						return a === b;
					};
					property["changed"] = function (b) {
						var a = this["get"]();
						b = getVal(b);

						a = a ? a.valueOf() : a;
						b = b ? b.valueOf() : b;

						return a !== b;
					};
					property["clearMemo"] = function () {
						memo = undefined;
					};
					property["get"] = function () {
						if (!writing) {
							stack.addDependency(this);
							stack.pushProperty(this);
						}

						var result = memo === undefined ? getter.call(this["owner"]) : memo;
						memo = result;

						if (stack[stack.length - 1] === this) {
							stack.pop();
						}

						return result;
					};
					property["set"] = function (value) {
						// Check if the property is writable.
						if (typeof setter === 'function') {
							writing = true;

							if (!this["equals"](value) || this["changed"](value)) {
								// We block just in case our value is an ObservableList
								// or something that is observable that will also trigger
								// a notification when it is changed. This will occur
								// if the property's value is an ObservableList.
								this["block"]();
								setter.call(this["owner"], value);
								memo = undefined;
								this["unblock"]();
								this["notify"]();
							}

							writing = false;
						}
					};
					property["dependencies"] = function () {
						return dependencies;
					};
					property["isDependent"] = function () {
						return dependencies.length !== 0;
					};
					property["toString"] = function () {
						return util.str(this["get"]());
					};
					property["valueOf"] = function () {
						var value = this["get"]();
						return util.isNil(value) ? value : value.valueOf();
					};

					util.mixin(property, makeObservable());

					// Initialization.
					(function () {
						var value,
							self = property,
							lazy = false,
							isObject = util.isObject,
							isArray = util.isArray,
							adheresTo = util.adheresTo;

						self["owner"] = undefined;

						// Just a getter function, with optional setter and or owner.
						// (getter)
						// (getter, owner)
						// (getter, setter)
						// (getter, setter, owner)
						if (typeof options === 'function') {
							getter = options;
							setter = typeof set === 'function' ? set : null;
							self["owner"] = typeof set === 'function' ? owner : set;
						// {get, [set, lazy, changed, equals, owner]}
						} else if (isObject(options) && typeof options["get"] === 'function') {
							lazy = options["lazy"];
							getter = options["get"];
							setter = typeof options["set"] === 'function' ? options["set"] : null;
							self["equals"] = typeof options["equals"] === 'function' ? options["equals"] : self["equals"];
							self["changed"] = typeof options["changed"] === 'function' ? options["changed"] : self["changed"];
							self["owner"] = options["owner"];
						} else {
							// {value, [changed, equals]}
							if (isObject(options)) {
								self["equals"] = typeof options["equals"] === 'function' ? options["equals"] : self["equals"];
								self["changed"] = typeof options["changed"] === 'function' ? options["changed"] : self["changed"];
								value = options["value"];
							// Just the value.
							} else {
								value = options;
							}

							// Make all Arrays into ObservableLists.
							if (isArray(value) && !adheresTo(value, makeObservable["interfce"])) {
								value = makeObservableList(value);

								// For array values the equals and changed operators
								// specified in the options are opertors for testing items in the list
								// not for operating on individual lists themselves.

								// Override the item operators for the newly created ObservableList
								// so that the item operators are taken from the options.
								value["getItemOperators"] = (function (equals, changed, operators) {
									equals = typeof equals === 'function' ? equals : operators["equals"];
									changed = typeof changed === 'function' ? changed : operators["changed"];

									return function () {
										return {
											"equals": equals,
											"changed": changed
										};
									};
								}(options["equals"], options["changed"], value["getItemOperators"]()));

								self["equals"] = function (b) {
									b = getVal(b);
									return value["equals"](b);
								};
								self["changed"] = function (b) {
									b = getVal(b);
									return value["changed"](b);
								};
							}

							// If the value is observable then we observe it for notifications.
							if (value && typeof value["subscribe"] === 'function' && typeof value["dispose"] === 'function') {
								subscriptions.push(value["subscribe"](observer));
							}

							getter = function () {
								return value;
							};
							setter = function (v) {
								if (adheresTo(value, makeList["interfce"])) {
									value["clear"]();

									if (isArray(v)) {
										value.push.apply(value, v);
									} else {
										value.push(v);
									}
								} else if (isArray(value)) {
									while (value.length) {
										value.pop();
									}

									if (isArray(v)) {
										value.push.apply(value, v);
									} else {
										value.push(v);
									}
								} else if (value !== v) {
									value = v;
								}
							};
						}

						self["dispose"] = (function (base) {
							return function () {
								while (subscriptions.length) {
									subscriptions.pop()["dispose"]();
								}
								while (dependencies.length) {
									dependencies.pop();
								}
								base.call(this);
							};
						}(self["dispose"]));

						// Watch dependent properties automatically
						// if they are not 'lazy'. If we are lazy then
						// dependent properties will not be tracked until
						// we have been read at least once.
						if (!lazy) {
							property["get"]();
						}
					}());

					return property;
				};

				// Convenience method to retrieve the value of the specified property.
				// If the specified property is not a property then returns property.
				getVal = function (property) {
					if (property && typeof property["get"] === 'function') {
						return property["get"]();
					}
					return property;
				};
				makeProperty["get"] = getVal;


				makeProperty["interfce"] = util.mixin({
					"dependencies": 'function',
					"isDependent": 'function',
					"clearMemo": 'function',
					"get": 'function',
					"set": 'function',
					"equals": 'function',
					"changed": 'function'
				}, makeObservable["interfce"]);

				return makeProperty;
			}()),
			makeBinding = (function () {
				var makeBinding = function (source, sink, type) {
					var propertyInterface = makeProperty["interfce"],
						subscriptions = [],
						subscription;

					type = type || 'twoway';
					type = util.str(type);
					type = type.toLowerCase();

					if (!util.adheresTo(source, propertyInterface)) {
						throw new Error('Binding source must be an observable property. ' + source);
					}
					if (!util.adheresTo(sink, propertyInterface)) {
						throw new Error('Binding sink must be an observable property. ' + sink);
					}

					sink["set"](source["get"]());

					switch (type) {
					case 'oneway':
						subscription = source["subscribe"](function () {
							sink["set"](source["get"]());
						});
						subscriptions.push(subscription);
						break;
					case 'twoway':
						subscription = source["subscribe"](function () {
							sink["set"](source["get"]());
						});
						subscriptions.push(subscription);

						subscription = sink["subscribe"](function () {
							source["set"](sink["get"]());
						});
						subscriptions.push(subscription);
						break;
					}

					subscription = null;

					return {
						"type": function () {
							return type;
						},
						"source": function () {
							return source;
						},
						"sink": function () {
							return sink;
						},
						"dispose": function () {
							while (subscriptions.length) {
								subscriptions.pop()["dispose"]();
							}
						}
					};
				};

				makeBinding["interfce"] = {
					"type": 'function',
					"source": 'function',
					"sink": 'function',
					"dispose": 'function'
				};

				return makeBinding;
			}()),
			/*toJSON(model, {
				include: []
				exclude: []
				filter
				properties: {
					property: fn that will be called with the value
							of a property and return a new value,
							or a nested options object
				}
			});*/
			toJSON = function (o, options) {
				var i,
					len,
					key,
					value,
					json,
					opt,
					empty = {},
					isObject = util.isObject,
					isArray = util.isArray,
					adheresTo = util.adheresTo,
					propertyInterface = makeProperty["interfce"],
					passthru = function (v) {
						return v;
					},
					include,
					exclude,
					filter;

				options = options || empty;

				if (typeof options === 'function') {
					filter = options;
				} else {
					filter = options["filter"];
					filter = typeof filter === 'function' ? filter : passthru;
				}

				if (isArray(o)) {
					json = [];
					len = o.length;

					for (i = 0; i < len; i += 1) {
						json.push(toJSON(o[i], options));
					}
				} else if (isObject(o)) {
					json = {};
					include = makeList(options["include"] || []);
					exclude = makeList(options["exclude"] || []);

					for (key in o) {
						if (o[key] !== undefined) {
							if (include["contains"](key) || !exclude["contains"](key)) {
								value = o[key];
								opt = options["properties"] ? options["properties"][key] : empty;

								if (adheresTo(value, propertyInterface)) {
									json[key] = toJSON(value["get"](), opt);
								} else {
									json[key] = toJSON(value, opt);
								}
							}
						}
					}

					json = filter(json, o);
				} else {
					json = filter(o, o);
				}

				return json;
			},
			/*fromJSON(data, {
				include: []
				exclude: []
				copy: [],
				filter(value): fn that will be called with the value
							created before returning from fromJSON().
							Must return the same value or a new value.
				properties: {
					property: {
						create(value): fn that returns an object
						that will be used to create a binder property.
						// All other properties are supported.
					}
				}
			});*/
			fromJSON = function (json, options, target) {
				var isArray = util["isArray"],
					isNil = util["isNil"],
					isObject = util["isObject"],
					adheresTo = util["adheresTo"],
					propertyInterface = makeProperty["interfce"],
					empty = {},
					include,
					exclude,
					copy,
					filter,
					create,
					passthru = function (v) {
						return v;
					},
					opt,
					key,
					value,
					i,
					len,
					array,
					model,
					property;

				options = options || empty;

				if (typeof options === 'function') {
					filter = options;
				} else {
					filter = options["filter"];
					filter = typeof filter === 'function' ? filter : passthru;
				}

				if (isArray(json)) {
					model = makeList();
					len = json.length;

					for (i = 0; i < len; i += 1) {
						model.push(fromJSON(json[i], options));
					}

					if (target) {
						if (adheresTo(target, makeList["interfce"])) {
							target["merge"](model);
						} else if (isArray(target)) {
							target.push.apply(target, model);
						} else {
							throw new Error('Expected target to be an Array.');
						}
					}
				} else if (isObject(json)) {
					model = {};
					include = makeList(options["include"] || []);
					exclude = makeList(options["exclude"] || []);
					copy = makeList(options["copy"] || []);

					for (key in json) {
						if (json[key] !== undefined && typeof json[key] !== 'function') {
							opt = options["properties"] ? options["properties"][key] : empty;
							value = json[key];
							create = opt ? opt["create"] : passthru;
							create = typeof create === 'function' ? create : passthru;

							if (value !== undefined &&
									(include["contains"](key) || !exclude["contains"](key))) {

								if (copy["contains"](key)) {
									if (target) {
										if (adheresTo(target[key], propertyInterface)) {
											target[key](fromJSON(value, opt));
										} else {
											target[key] = fromJSON(value, opt);
										}
									} else {
										model[key] = fromJSON(value, opt);
									}
								} else if (isArray(value)) {
									if (target) {
										if (adheresTo(target[key], propertyInterface)) {
											target[key](fromJSON(value, opt));
										} else if (isArray(target[key])) {
											fromJSON(value, opt, target[key]);
										} else {
											property = makeProperty(create(fromJSON(value, opt), target));
											target[key] = property;
											property["owner"] = target;
										}
									} else {
										property = makeProperty(create(fromJSON(value, opt), model));
										property["owner"] = model;
										model[key] = property;
									}
								} else if (isObject(value)) {
									if (target) {
										if (adheresTo(target[key], propertyInterface)) {
											target[key](fromJSON(value, opt));
										} else {
											target[key] = fromJSON(value, opt);
										}
									} else {
										model[key] = fromJSON(value, opt);
									}
								} else {
									if (target) {
										if (adheresTo(target[key], propertyInterface)) {
											target[key](fromJSON(value, opt));
										} else {
											property = makeProperty(create(fromJSON(value, opt), target));
											target[key] = property;
											property["owner"] = target;
										}
									} else {
										property = makeProperty(create(fromJSON(value, opt), model));
										property["owner"] = model;
										model[key] = property;
									}
								}
							}
						}
					}

					model = filter(model, json);
				} else {
					model = filter(json, json);
				}

				return target || model;
			};

		return {
			"makeList": makeList,
			"makeObservable": makeObservable,
			"makeObservableList": makeObservableList,
			"makeProperty": makeProperty,
			"makeBinding": makeBinding,
			"toJSON": toJSON,
			"fromJSON": fromJSON
		};
	}

	xport.module(['utiljs'], module, function () {
		xport('BINDER', module(UTIL));
	});
}());