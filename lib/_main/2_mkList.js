			mkList = (function () {
				var defaultItemOperators = {
						equals: function (a, b) {
							a = a ? a.valueOf() : a;
							b = b ? b.valueOf() : b;

							return a === b;
						},
						changed: function (a, b) {
							a = a ? a.valueOf() : a;
							b = b ? b.valueOf() : b;

							return a !== b;
						}
					},
					makeCompareResult = function (status, item, index, otherItem, otherIndex) {
						return {
							status: status,
							item: item,
							value: item,
							index: index,
							otherItem: otherItem,
							otherIndex: otherIndex,
							toString: function () {
								var s = "{status: {0}, item: {1}, index: {2}, otherItem: {3}, otherIndex: {4}}";
								return utiljs.format(s, status, item, index, otherItem, otherIndex);
							}
						};
					},
					mkList = function (o) {
						var instance = UTIL.create(mkList.fn);

						// Initialization.
						(function (args) {
							var argcount = args.length;

							if (argcount === 1 && utiljs.isArray(o)) {
								instance.push.apply(instance, o);
							} else if (argcount) {
								instance.push.apply(instance, instance.slice.call(args));
							}
						}(arguments));

						return instance;
					};

				// Guarantees valid item operators.
				mkList.getItemOperators = function (list) {
					var operators = list.getItemOperators();

					if (typeof operators.equals !== 'function') {
						operators.equals = defaultItemOperators.equals;
					}
					if (typeof operators.changed !== 'function') {
						operators.changed = defaultItemOperators.changed;
					}

					return operators;
				};

				mkList.fn = (function (list) {
					list.getItemOperators = function () {
						return utiljs.create(defaultItemOperators);
					};

					// HTML5 specification.
					list.indexOf = list.indexOf || function (item, fromIndex) {
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
					list.lastIndexOf = list.lastIndexOf || function (item, fromIndex) {
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
					list.reverse = list.reverse || function () {
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
					list.map = list.map || function (callback, thisObj) {
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
					list.filter = list.filter || function (callback, thisObj) {
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
					list.forEach = list.forEach || function (callback, thisObj) {
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
					list.reduce = list.reduce || function (callback, initialValue) {
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
					list.reduceRight = list.reduceRight || function (callback, initialValue) {
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
					list.some = list.some || function (callback, thisObj) {
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
					list.every = list.every || function (callback, thisObj) {
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
					list.contains = function (item) {
						return this.indexOf(item) >= 0;
					};
					list.occurances = function (item) {
						var i = this.indexOf(item),
							count = 0;

						while (i >= 0) {
							count += 1;
							i = this.indexOf(item, i + 1);
						}

						return count;
					};
					list.distinct = function () {
						var i = this.length,
							distinct = [],
							item;

						while (i) {
							i -= 1;
							item = this[i];
							if (this.occurances(item) === 1) {
								distinct.unshift(item);
							}
						}

						return distinct;
					};
					list.first = function (callback, thisObj) {
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
					list.last = function (callback, thisObj) {
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
					list.find = function (callback, fromIndex, thisObj) {
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
					list.equals = function (otherList, equals) {
						var i,
							alen,
							blen,
							a = this,
							b = otherList,
							operators;

						if (!utiljs.isArray(otherList)) {
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
						operators = mkList.getItemOperators(this);
						equals = typeof equals === 'function' ? equals : function () {
							return operators.equals.apply(operators, arguments);
						};

						for (i = 0; i < alen && i < blen; i += 1) {
							if (!equals(a[i], b[i])) {
								return false;
							}
						}

						return true;
					};
					list.changed = function (otherList, equals, changed) {
						var i,
							alen,
							blen,
							a = this,
							b = otherList,
							operators;

						if (!utiljs.isArray(otherList)) {
							return false;
						}
						if (a === b) {
							return false;
						}
						if (a.length !== b.length) {
							return true;
						}

						operators = mkList.getItemOperators(this);
						equals = typeof equals === 'function' ? equals : function () {
							return operators.equals.apply(operators, arguments);
						};
						changed = typeof changed === 'function' ? changed : function () {
							return operators.changed.apply(operators, arguments);
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
					list.compare = function (otherList, equals, changed) {
						var operators,
							differences = mkList(),
							i,
							len,
							item,
							find = this.find,
							callback,
							result;

						otherList = mkList(otherList);
						operators = mkList.getItemOperators(this);
						equals = typeof equals === 'function' ? equals : function () {
							return operators.equals.apply(operators, arguments);
						};
						changed = typeof changed === 'function' ? changed : function () {
							return operators.changed.apply(operators, arguments);
						};
						callback = function (it) {
							return equals(item, it);
						};

						len = this.length;
						for (i = 0; i < len; i += 1) {
							item = this[i];
							result = find.call(otherList, callback);

							if (result.index < 0) {
								differences.push(makeCompareResult("deleted", item, i));
							} else {
								if (changed(item, result.item)) {
									differences.push(makeCompareResult("changed", item, i, result.item, result.index));
								} else {
									differences.push(makeCompareResult("retained", item, i, result.item, result.index));
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
					list.merge = function (otherList, equals, changed) {
						var list = mkList(this);
						list.mergeWith(otherList, equals, changed);
						return list;
					};
					list.mergeWith = function (otherList, equals, changed) {
						var operators,
							d,
							i,
							len,
							diff;

						operators = mkList.getItemOperators(this);
						d = this.compare(otherList, equals, changed);
						len = d.length;

						for (i = 0; i < len; i += 1) {
							diff = d[i];

							switch (diff.status) {
							case 'added':
								if (this[diff.otherIndex] === undefined) {
									this[diff.otherIndex] = diff.otherItem;
								} else {
									this.splice(diff.otherIndex, 0, diff.otherItem);
								}
								break;
							case 'deleted':
								this[diff.index] = undefined;
								break;
							case 'changed':
								// Move and a change.
								if (diff.index !== diff.otherIndex) {
									if (this[diff.otherIndex] === undefined) {
										this[diff.index] = undefined;
										this[diff.otherIndex] = diff.otherItem;
									} else {
										this.splice(diff.index, 1);
										this.splice(diff.otherIndex, 0, diff.item);
									}
								// Just a change.
								} else {
									this[diff.index] = diff.otherItem;
								}
								break;
							case 'retained':
								// Move.
								if (diff.index !== diff.otherIndex) {
									if (this[diff.otherIndex] === undefined) {
										this[diff.index] = undefined;
										this[diff.otherIndex] = diff.otherItem;
									} else {
										this.splice(diff.index, 1);
										this.splice(diff.otherIndex, 0, diff.item);
									}
								} else {
									this[diff.index] = diff.otherItem;
								}
								break;
							}
						}

						this.collapse();
					};
					list.remove = function () {
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
					list.removeAt = function (index) {
						if (isFinite(index) && index >= 0 && index < this.length) {
							return this.splice(index, 1).pop();
						}
					};
					list.clear = function () {
						while (this.length) {
							this.pop();
						}
					};
					list.collapse = function () {
						var i = this.length;

						while (i) {
							i -= 1;
							if (this[i] === undefined) {
								this.splice(i, 1);
							}
						}
					};
					list.replaceAt = function (index, item) {
						var replaced;

						if (isFinite(index) && index >= 0 && index < this.length) {
							replaced = this[index];
							this[index] = item;
						}

						return replaced;
					};
					list.isEmpty = function () {
						return this.length === 0;
					};
					list.peek = function () {
						return this[this.length - 1];
					};
					list.insert = function (index, item) {
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

					return list;
				}([]));

				mkList.interfce = {
					concat: 'function',
					indexOf: 'function',
					join: 'function',
					lastIndexOf: 'function',
					map: 'function',
					filter: 'function',
					forEach: 'function',
					reduce: 'function',
					reduceRight: 'function',
					reverse: 'function',
					some: 'function',
					shift: 'function',
					slice: 'function',
					sort: 'function',
					splice: 'function',
					every: 'function',
					pop: 'function',
					push: 'function',
					unshift: 'function',
					toString: 'function',
					//--
					contains: 'function',
					occurances: 'function',
					distinct: 'function',
					first: 'function',
					last: 'function',
					find: 'function',
					equals: 'function',
					changed: 'function',
					compare: 'function',
					merge: 'function',
					mergeWith: 'function',
					remove: 'function',
					removeAt: 'function',
					clear: 'function',
					collapse: 'function',
					replaceAt: 'function',
					isEmpty: 'function',
					peek: 'function',
					insert: 'function'
				};

				return mkList;
			}()),