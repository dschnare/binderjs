/*
Author: Darren Schnare
Keywords: javascript,binding,bind,property,list,observer,observable
License: MIT ( http://www.opensource.org/licenses/mit-license.php )
Repo: https://github.com/dschnare/binderjs
*/
var BINDER = (function () {
    'use strict';

    var Array = ([]).constructor,
        Object = ({}).constructor,
        util = (function () {
            var define = null,
                exports = null,
                require = null;

            var UTIL = (function () {
            	/*global 'define', 'exports', 'require' */
            
            	var Object = {}.constructor,
            		isNil = function (o) {
            			return o === null || o === undefined;
            		},
            		isArray = (function () {
            			var toString = Object.prototype.toString;
            
            			return function (o) {
            				return (toString.call(o) === '[object Array]') || (!isNil(o) && typeof o.length === 'number' && typeof o.push === 'function');
            			};
            		}()),
            		typeOf = function (o) {
            			if (o === null) {
            				return 'null';
            			}
            			if (isArray(o)) {
            				return 'array';
            			}
            			return typeof o;
            		},
            		isObject = function (o) {
            			return o && typeOf(o) === 'object';
            		},
            		str = function (o) {
            			return o === undefined || o === null ? '' : o.toString();
            		},
            		mixin = function (o) {
            			var len = arguments.length,
            				i,
            				arg,
            				key;
            
            			if (len === 0 || !o) {
            				throw new Error('Expected at least one object as an argument.');
            			}
            
            			for (i = 1; i < len; i += 1) {
            				arg = arguments[i];
            
            				if (!isNil(arg)) {
            					for (key in arg) {
            						if (arg.hasOwnProperty(key)) {
            							o[key] = arg[key];
            						}
            					}
            				}
            			}
            
            			return o;
            		},
            		util = {
            			typeOf: typeOf,
            			isObject: isObject,
            			isArray: isArray,
            			isNil: isNil,
            			mixin: mixin,
            			str: str,
            			respondsTo: function (o, method) {
            				return o && typeof o[method] === 'function';
            			},
            			adheresTo: function (o, interfce) {
            				var key,
            					typeofo,
            					typeofi;
            
            				if ((isObject(o) || typeof o === 'function' || isArray(o)) &&
            						(isObject(interfce) || typeof interfce === 'function' || isArray(interfce))) {
            					for (key in interfce) {
            						if (interfce.hasOwnProperty(key)) {
            							// Property can be any type, but must exist.
            							if (interfce[key] === '*') {
            								if (!o.hasOwnProperty(key)) {
            									return false;
            								}
            							} else {
            
            								if (typeOf(o[key]) !== typeOf(interfce[key]) &&
            										typeOf(o[key]) !== str(interfce[key])) {
            									return false;
            								}
            							}
            						}
            					}
            
            					return true;
            				}
            
            				typeofo = typeOf(o);
            				typeofi = typeOf(interfce);
            
            				return typeofo === typeofi;
            			},
            			create: (function () {
            				var F = function () {};
            
            				return function (o) {
            					if (!o) {
            						throw new Error('Expected an object as an argument.');
            					}
            					F.prototype = o;
            					return new F();
            				};
            			}()),
            			trim: function (str) {
            				str = str ? str.toString() : '';
            
            				var i = 0,
            					c = str.charAt(i);
            
            				while (c) {
            					if (c > ' ') {
            						str = str.substring(i);
            						break;
            					}
            
            					i += 1;
            					c = str.charAt(i);
            				}
            
            				i = str.length;
            
            				while (i) {
            					i -= 1;
            					c = str.charAt(i);
            
            					if (c > ' ') {
            						str = str.substring(0, i + 1);
            						break;
            					}
            				}
            
            				return str;
            			},
            			format: function (s) {
            				var string = str(s),
            					args = arguments,
            					argCount = args.length,
            					i = string.length,
            					c = null,
            					n = 0,
            					k = 0,
            					next = function () {
            						i -= 1;
            						c = string.charAt(i);
            						return c;
            					};
            
            				while (next()) {
            					if (c === '}') {
            						k = i + 1;
            						next();
            						n = '';
            
            						while (c >= '0' && c <= '9') {
            							n = c + n;
            							next();
            						}
            
            						if (c === '{') {
            							n = parseInt(n, 10) + 1;
            
            							if (n < argCount) {
            								string = string.substring(0, i) + args[n] + string.substring(k);
            							}
            						}
            					}
            				}
            
            				return string;
            			}
            		};
            
            	// Asynchronous modules (AMD) supported.
            	if (typeof define === 'function' && typeof define.amd === 'object') {
            		define(util);
            	// Nodejs/CommonJS modules supported.
            	} else if (exports && typeof exports === 'object' && typeof require === 'function') {
            		util.mixin(exports, util);
            	} else {
            		return util;
            	}
            }());

            return UTIL;
        }()),
        makeList = (function (util) {
            /*global 'util'*/
        
            var Array = ([]).constructor,
                defaultItemOperators = {
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
                            return util.format(s, status, item, index, otherItem, otherIndex);
                        }
                    };
                },
                makeList = function (o) {
                    var list = [];
        
                    list.getItemOperators = function () {
                        return util.create(defaultItemOperators);
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
                        operators = makeList.getItemOperators(this);
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
        
                        if (!util.isArray(otherList)) {
                            return false;
                        }
                        if (a === b) {
                            return false;
                        }
                        if (a.length !== b.length) {
                            return true;
                        }
        
                        operators = makeList.getItemOperators(this);
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
                            differences = makeList(),
                            i,
                            len,
                            item,
                            find = this.find,
                            callback,
                            result;
        
                        otherList = makeList(otherList);
                        operators = makeList.getItemOperators(this);
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
                        var list = makeList(this);
                        list.mergeWith(otherList, equals, changed);
                        return list;
                    };
                    list.mergeWith = function (otherList, equals, changed) {
                        var operators,
                            d,
                            i,
                            diff;
        
                        operators = makeList.getItemOperators(this);
                        d = this.compare(otherList, equals, changed);
                        i = d.length;
        
                        this.length = otherList.length;
        
                        // For sanity we use the equality operator again on each item
                        // that has been marked as not being 'added'.
        
                        while (i) {
                            i -= 1;
                            diff = d[i];
        
                            switch (diff.status) {
                            case "added":
                                this[diff.otherIndex] = diff.otherItem;
                                break;
                            case "deleted":
                                if (operators.equals(this[diff.index], diff.item)) {
                                    this[diff.index] = undefined;
                                }
                                break;
                            case "changed":
                                if (operators.equals(this[diff.index], diff.item)) {
                                    this[diff.index] = undefined;
                                }
                                this[diff.otherIndex] = diff.otherItem;
                                break;
                            case "retained":
                                if (operators.equals(this[diff.index], diff.item)) {
                                    this[diff.index] = undefined;
                                }
                                this[diff.otherIndex] = diff.item;
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
                        if (index > this.length + 1) {
                            index = this.length + 1;
                        } else if (index < 0) {
                            index = 0;
                        }
        
                        if (index >= 0) {
                            if (index === this.length + 1) {
                                this.push(item);
                            } else if (this.hasOwnProperty(index)) {
                                this.splice(index, 0, item);
                            } else {
                                this[index] = item;
                            }
        
                            return true;
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
            makeList.getItemOperators = function (list) {
                var operators = list.getItemOperators();
        
                if (typeof operators.equals !== 'function') {
                    operators.equals = defaultItemOperators.equals;
                }
                if (typeof operators.changed !== 'function') {
                    operators.changed = defaultItemOperators.changed;
                }
        
                return operators;
            };
        
            makeList.interfce = {
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
        
            return makeList;
        }(util)),
        makeObservable = (function (makeList, setTimeout) {
            /*global 'makeList', 'setTimeout', 'clearTimeout'*/
        
            var notify = function (self, observers) {
                    var i,
                        observer,
                        len = observers.length;
        
                    for (i = 0; i < len; i += 1) {
                        observer = observers[i];
        
                        if (observer) {
                            if (typeof observer === 'function') {
                                observer(self);
                            } else if (typeof observer.onNotify === 'function') {
                                observer.onNotify(self);
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
                            block: function () {
                                blockStack.push(true);
                            },
                            unblock: function () {
                                blockStack.pop();
                            },
                            subscribe: function (observer) {
                                if (observer && !observers.contains(observer)) {
                                    observers.push(observer);
        
                                    return {
                                        dispose: function () {
                                            observers.remove(observer);
                                        }
                                    };
                                }
        
                                return {
                                    dispose: function () {}
                                };
                            },
                            throttle: function (durationInMilliseconds) {
                                if (!isFinite(durationInMilliseconds)) {
                                    durationInMilliseconds = 0;
                                }
                                throttleDuration = durationInMilliseconds;
                            },
                            notify: function () {
                                var self = this;
        
                                if (blockStack.length || notifying) {
                                    return;
                                }
        
                                notifying = true;
        
                                if (throttleDuration > 0) {
                                    throttleId = setTimeout(function () {
                                        notify(self, observers);
                                        notifying = false;
                                    }, throttleDuration);
                                } else {
                                    notify(self, observers);
                                    notifying = false;
                                }
                            },
                            dispose: function () {
                                observers.clear();
                                clearTimeout(throttleId);
                            }
                        };
        
                    return observable;
                };
        
            makeObservable.interfce = {
                block: 'function',
                unblock: 'function',
                subscribe: 'function',
                throttle: 'function',
                notify: 'function',
                dispose: 'function'
            };
        
            return makeObservable;
        }(makeList, setTimeout)),
        makeObservableList = (function (util, makeList, makeObservable) {
            /*global 'util', 'makeList', 'makeObservable'*/
        
            var makeObservableList = function () {
                var slice = ([]).slice,
                    list = makeList.apply(undefined, slice.call(arguments));
        
                util.mixin(list, makeObservable());
                list.remove = (function (base) {
                    return function () {
                        var origLen = this.length, ret;
        
                        this.block();
                        ret = base.apply(this, slice.call(arguments));
                        this.unblock();
        
                        if (origLen !== this.length) {
                            this.notify();
                        }
        
                        return ret;
                    };
                }(list.remove));
                list.removeAt = (function (base) {
                    return function () {
                        var origLen = this.length, ret;
        
                        this.block();
                        ret = base.apply(this, slice.call(arguments));
                        this.unblock();
        
                        if (origLen !== this.length) {
                            this.notify();
                        }
        
                        return ret;
                    };
                }(list.removeAt));
                list.replaceAt = (function (base) {
                    return function () {
                        var ret;
        
                        this.block();
                        ret = base.apply(this, slice.call(arguments));
                        this.unblock();
                        this.notify();
        
                        return ret;
                    };
                }(list.replaceAt));
                list.clear = (function (base) {
                    return function () {
                        var origLen = this.length, ret;
        
                        this.block();
                        ret = base.call(this);
                        this.unblock();
        
                        if (origLen !== this.length) {
                            this.notify();
                        }
        
                        return ret;
                    };
                }(list.clear));
                list.collapse = (function (base) {
                    return function () {
                        var origLen = this.length, ret;
        
                        this.block();
                        ret = base.call(this);
                        this.unblock();
        
                        if (origLen !== this.length) {
                            this.notify();
                        }
        
                        return ret;
                    };
                }(list.collapse));
                list.insert = (function (base) {
                    return function () {
                        var ret;
        
                        this.block();
                        ret = base.apply(this, slice.call(arguments));
                        this.unblock();
        
                        if (ret) {
                            this.notify();
                        }
        
                        return ret;
                    };
                }(list.insert));
                list.mergeWith = (function (base) {
                    return function () {
                        var ret;
        
                        this.block();
                        ret = base.apply(this, slice.call(arguments));
                        this.unblock();
                        this.notify();
        
                        return ret;
                    };
                }(list.mergeWith));
                list.reverse = (function (base) {
                    return function () {
                        var ret;
        
                        this.block();
                        ret = base.call(this);
                        this.unblock();
                        this.notify();
        
                        return ret;
                    };
                }(list.reverse));
                list.pop = (function (base) {
                    return function () {
                        var origLen = this.length, ret;
        
                        this.block();
                        ret = base.call(this);
                        this.unblock();
        
                        if (origLen !== this.length) {
                            this.notify();
                        }
        
                        return ret;
                    };
                }(list.pop));
                list.push = (function (base) {
                    return function () {
                        var origLen = this.length, ret;
        
                        this.block();
                        ret = base.apply(this, slice.call(arguments));
                        this.unblock();
        
                        if (origLen !== this.length) {
                            this.notify();
                        }
        
                        return ret;
                    };
                }(list.push));
                list.shift = (function (base) {
                    return function () {
                        var origLen = this.length, ret;
        
                        this.block();
                        ret = base.call(this);
                        this.unblock();
        
                        if (origLen !== this.length) {
                            this.notify();
                        }
        
                        return ret;
                    };
                }(list.shift));
                list.unshift = (function (base) {
                    return function () {
                        var origLen = this.length, ret;
        
                        this.block();
                        ret = base.apply(this, slice.call(arguments));
                        this.unblock();
        
                        if (origLen !== this.length) {
                            this.notify();
                        }
        
                        return ret;
                    };
                }(list.unshift));
                list.sort = (function (base) {
                    return function () {
                        var ret = base.apply(this, slice.call(arguments));
        
                        this.notify();
        
                        return ret;
                    };
                }(list.sort));
                list.splice = (function (base) {
                    return function () {
                        var origLen = this.length, ret;
        
                        this.block();
                        ret = base.apply(this, slice.call(arguments));
                        this.unblock();
        
                        if (origLen !== this.length) {
                            this.notify();
                        }
        
                        return ret;
                    };
                }(list.splice));
        
                return list;
            };
        
            makeObservableList.interfce = util.mixin({}, makeObservable.interfce, makeList.interfce);
        
            return makeObservableList;
        }(util, makeList, makeObservable)),
        makeProperty = (function (util, makeList, makeObservable, makeObservableList) {
            /*global 'util', 'makeList', 'makeObservable', 'makeObservableList'*/
        
            var makeProperty,
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
                    if (!strictDependencies || this.peek().owner === property.owner) {
                        this.push(property);
                    }
                } else {
                    this.push(property);
                }
            };
            stack.addDependency = function (property) {
                if (this.length) {
                    if (!strictDependencies || this.peek().owner === property.owner) {
                        this.peek().dependencies().add(property);
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
                        property.notify();
                    };
        
                dependencies.add = function (prop) {
                    if (!this.contains(prop)) {
                        this.push(prop);
                        subscriptions.push(prop.subscribe(observer));
                    }
                };
        
                property = function (value) {
                    var ret, origOwner = property.owner;
        
                    // Temporarily set the owner to the 'this' object.
                    if (this !== undefined) {
                        property.owner = this;
                    }
        
                    if (arguments.length) {
                        property.set(value);
                        ret = this;
                    } else {
                        ret = property.get();
                    }
        
                    property.owner = origOwner;
        
                    return ret;
                };
                property.equals = function (b) {
                    var a = this.get();
                    b = makeProperty.get(b);
        
                    a = a ? a.valueOf() : a;
                    b = b ? b.valueOf() : b;
        
                    return a === b;
                };
                property.changed = function (b) {
                    var a = this.get();
                    b = makeProperty.get(b);
        
                    a = a ? a.valueOf() : a;
                    b = b ? b.valueOf() : b;
        
                    return a !== b;
                };
                property.clearMemo = function () {
                    memo = undefined;
                };
                property.get = function () {
                    if (!writing) {
                        stack.addDependency(this);
                        stack.pushProperty(this);
                    }
        
                    var result = memo === undefined ? getter.call(this.owner) : memo;
                    memo = result;
        
                    if (stack[stack.length - 1] === this) {
                        stack.pop();
                    }
        
                    return result;
                };
                property.set = function (value) {
                    // Check if the property is writable.
                    if (typeof setter === 'function') {
                        writing = true;
        
                        if (!this.equals(value) || this.changed(value)) {
                            // We block just in case our value is an ObservableList
                            // or something that is observable that will also trigger
                            // a notification when it is changed. This will occur
                            // if the property's value is an ObservableList.
                            this.block();
                            setter.call(this.owner, value);
                            memo = undefined;
                            this.unblock();
                            this.notify();
                        }
        
                        writing = false;
                    }
                };
                property.dependencies = function () {
                    return dependencies;
                };
                property.isDependent = function () {
                    return dependencies.length !== 0;
                };
                property.toString = function () {
                    return util.str(this.get());
                };
                property.valueOf = function () {
                    var value = this.get();
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
        
                    self.owner = undefined;
        
                    // Just a getter function, with optional setter and or owner.
                    // (getter)
                    // (getter, owner)
                    // (getter, setter)
                    // (getter, setter, owner)
                    if (typeof options === 'function') {
                        getter = options;
                        setter = typeof set === 'function' ? set : null;
                        self.owner = typeof set === 'function' ? owner : set;
                    // {get, [set, lazy, changed, equals, owner]}
                    } else if (isObject(options) && typeof options.get === 'function') {
                        lazy = options.lazy;
                        getter = options.get;
                        setter = typeof options.set === 'function' ? options.set : null;
                        self.equals = typeof options.equals === 'function' ? options.equals : self.equals;
                        self.changed = typeof options.changed === 'function' ? options.changed : self.changed;
                        self.owner = options.owner;
                    } else {
                        // {value, [changed, equals]}
                        if (isObject(options)) {
                            self.equals = typeof options.equals === 'function' ? options.equals : self.equals;
                            self.changed = typeof options.changed === 'function' ? options.changed : self.changed;
                            value = options.value;
                        // Just the value.
                        } else {
                            value = options;
                        }
        
                        // Make all Arrays into ObservableLists.
                        if (isArray(value) && !adheresTo(value, makeObservable.interfce)) {
                            value = makeObservableList(value);
        
                            // For array values the equals and changed operators
                            // specified in the options are opertors for testing items in the list
                            // not for operating on individual lists themselves.
        
                            // Override the item operators for the newly created ObservableList
                            // so that the item operators are taken from the options.
                            value.getItemOperators = (function (equals, changed, operators) {
                                equals = typeof equals === 'function' ? equals : operators.equals;
                                changed = typeof changed === 'function' ? changed : operators.changed;
        
                                return function () {
                                    return {
                                        equals: equals,
                                        changed: changed
                                    };
                                };
                            }(options.equals, options.changed, value.getItemOperators()));
        
                            self.equals = function (b) {
                                b = makeProperty.get(b);
                                return value.equals(b);
                            };
                            self.changed = function (b) {
                                b = makeProperty.get(b);
                                return value.changed(b);
                            };
                        }
        
                        // If the value is observable then we observe it for notifications.
                        if (value && typeof value.subscribe === 'function' && typeof value.dispose === 'function') {
                            subscriptions.push(value.subscribe(observer));
                        }
        
                        getter = function () {
                            return value;
                        };
                        setter = function (v) {
                            if (adheresTo(value, makeList.interfce)) {
                                value.clear();
        
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
        
                    self.dispose = (function (base) {
                        return function () {
                            while (subscriptions.length) {
                                subscriptions.pop().dispose();
                            }
                            while (dependencies.length) {
                                dependencies.pop();
                            }
                            base.call(this);
                        };
                    }(self.dispose));
        
                    // Watch dependent properties automatically
                    // if they are not 'lazy'. If we are lazy then
                    // dependent properties will not be tracked until
                    // we have been read at least once.
                    if (!lazy) {
                        property.get();
                    }
                }());
        
                return property;
            };
        
            // Convenience method to retrieve the value of the specified property.
            // If the specified property is not a property then returns property.
            makeProperty.get = function (property) {
                if (property && typeof property.get === 'function') {
                    return property.get();
                }
                return property;
            };
        
            makeProperty.interfce = util.mixin({
                owner: '*',
                dependencies: 'function',
                isDependent: 'function',
                clearMemo: 'function',
                get: 'function',
                set: 'function',
                equals: 'function',
                changed: 'function'
            }, makeObservable.interfce);
        
            return makeProperty;
        }(util, makeList, makeObservable, makeObservableList)),
        makeBinding = (function (util, makeProperty) {
            /*global 'util', 'makeProperty'*/
        
            var makeBinding = function (source, sink, type) {
                var propertyInterface = makeProperty.interfce,
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
        
                sink.set(source.get());
        
                switch (type) {
                case 'oneway':
                    subscription = source.subscribe(function () {
                        sink.set(source.get());
                    });
                    subscriptions.push(subscription);
                    break;
                case 'twoway':
                    subscription = source.subscribe(function () {
                        sink.set(source.get());
                    });
                    subscriptions.push(subscription);
        
                    subscription = sink.subscribe(function () {
                        source.set(sink.get());
                    });
                    subscriptions.push(subscription);
                    break;
                }
        
                subscription = null;
        
                return {
                    type: function () {
                        return type;
                    },
                    source: function () {
                        return source;
                    },
                    sink: function () {
                        return sink;
                    },
                    dispose: function () {
                        while (subscriptions.length) {
                            subscriptions.pop().dispose();
                        }
                    }
                };
            };
        
            makeBinding.interfce = {
                type: 'function',
                source: 'function',
                sink: 'function',
                dispose: 'function'
            };
        
            return makeBinding;
        }(util, makeProperty)),
        toJSON = (function (util, makeProperty, makeList) {
        	/*global 'util', 'makeProperty', 'makeList'*/
        
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
        
        	var toJSON = function (o, options) {
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
        				propertyInterface = makeProperty.interfce,
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
        				filter = options.filter;
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
        				include = makeList(options.include || []);
        				exclude = makeList(options.exclude || []);
        
        				for (key in o) {
        					if (o[key] !== undefined) {
        						if (include.contains(key) || !exclude.contains(key)) {
        							value = o[key];
        							opt = options.properties ? options.properties[key] : empty;
        
        							if (adheresTo(value, propertyInterface)) {
        								json[key] = toJSON(value.get(), opt);
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
        		};
        
        	return toJSON;
        }(util, makeProperty, makeList)),
        fromJSON = (function (util, makeProperty, makeList) {
        	/*global 'util', 'makeProperty', 'makeList'*/
        	/*jslint continue: true*/
        
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
        
        	var fromJSON = function (json, options, target) {
        			var isArray = util.isArray,
        				isNil = util.isNil,
        				isObject = util.isObject,
        				adheresTo = util.adheresTo,
        				propertyInterface = makeProperty.interfce,
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
        				filter = options.filter;
        				filter = typeof filter === 'function' ? filter : passthru;
        			}
        
        			if (isArray(json)) {
        				model = makeList();
        				len = json.length;
        
        				for (i = 0; i < len; i += 1) {
        					model.push(fromJSON(json[i], options));
        				}
        
        				if (target) {
        					if (adheresTo(target, makeList.interfce)) {
        						target.merge(model);
        					} else if (isArray(target)) {
        						target.push.apply(target, model);
        					} else {
        						throw new Error('Expected target to be an Array.');
        					}
        				}
        			} else if (isObject(json)) {
        				model = {};
        				include = makeList(options.include || []);
        				exclude = makeList(options.exclude || []);
        				copy = makeList(options.copy || []);
        
        				for (key in json) {
        					if (json[key] !== undefined && typeof json[key] !== 'function') {
        						opt = options.properties ? options.properties[key] : empty;
        						value = json[key];
        						create = opt ? opt.create : passthru;
        						create = typeof create === 'function' ? create : passthru;
        
        						if (value !== undefined &&
        								(include.contains(key) || !exclude.contains(key))) {
        
        							if (copy.contains(key)) {
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
        										property.owner = target;
        									}
        								} else {
        									property = makeProperty(create(fromJSON(value, opt), model));
        									property.owner = model;
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
        										property.owner = target;
        									}
        								} else {
        									property = makeProperty(create(fromJSON(value, opt), model));
        									property.owner = model;
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
        
        	return fromJSON;
        }(util, makeProperty, makeList)),
        module = {
            utiljs: util,
            makeList: makeList,
            makeObservable: makeObservable,
            makeObservableList: makeObservableList,
            makeProperty: makeProperty,
            makeBinding: makeBinding,
            toJSON: toJSON,
            fromJSON: fromJSON
        };

    // Asynchronous modules (AMD) supported.
    if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
        define(module);
    // Nodejs/CommonJS modules supported.
    } else if (typeof exports === 'object' && exports && typeof require === 'function') {
        util.mixin(exports, module);
    } else {
        return module;
    }
}());