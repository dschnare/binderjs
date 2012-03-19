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
            'use strict';
        
            var util = {
                    object: {
                        typeOf: function (o) {
                            if (o === null) {
                                return 'null';
                            }
                            if (util.object.isArray(o)) {
                                return 'array';
                            }
                            return typeof o;
                        },
                        isObject: function (o) {
                            return o && util.object.typeOf(o) === 'object';
                        },
                        isArray: (function () {
                            var toString = Object.prototype.toString;
        
                            return function (o) {
                                return toString.call(o) === '[object Array]';
                            };
                        }()),
                        isNil: function (o) {
                            return o === null || o === undefined;
                        },
                        adheresTo: function (o, interfce) {
                            var key,
                                typeofo,
                                typeofi,
                                isObject = util.object.isObject,
                                isArray = util.object.isArray,
                                toString = util.string.toString,
                                typeOf = util.object.typeOf;
        
                            if ((isObject(o) || typeof o === 'function' || isArray(o)) &&
                                    (isObject(interfce) || typeof interfce === 'function' || isArray(interfce))) {
                                for (key in interfce) {
                                    if (interfce.hasOwnProperty(key)) {
                                        // Property can be any type, but must exist.
                                        if (interfce[key] === '*') {
                                            if (o[key] === undefined) {
                                                return false;
                                            }
                                        } else {
        
                                            if (typeOf(o[key]) !== typeOf(interfce[key]) &&
                                                    typeOf(o[key]) !== toString(interfce[key])) {
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
                        mixin: function (o) {
                            var isNil = util.object.isNil,
                                len = arguments.length,
                                i,
                                arg,
                                key;
        
                            if (len === 0 || !o) {
                                return o;
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
                        create: (function () {
                            var F = function () {};
        
                            return function (o) {
                                F.prototype = o;
                                return new F();
                            };
                        }())
                    },
                    string: {
                        toString: function (o) {
                            return o === undefined || o === null ? '' : o.toString();
                        },
                        trim: function (str) {
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
                        format: function (str) {
                            var s = util.string.toString(str),
                                args = arguments,
                                argCount = args.length,
                                i = s.length,
                                c = null,
                                n = 0,
                                k = 0,
                                next = function () {
                                    i -= 1;
                                    c = s.charAt(i);
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
                                            s = s.substring(0, i) + args[n] + s.substring(k);
                                        }
                                    }
                                }
                            }
        
                            return s;
                        }
                    }
                };
        
            return util;
        }()),
        makeList = (function (util) {
            'use strict';
            /*global 'util'*/
        
            var defaultItemOperators = {
                    equals: function (a, b) {
                        a = a ? a.valueOf() : a;
                        b = b ? b.valueOf() : b;
        
                        return a === b;
                    },
                    changed: function (a, b) {
                        a = a ? a.valueOf() : a;
                        b = b ? b.valueOf() : b;
        
                        return false;
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
                            return util.string.format(s, status, item, index, otherItem, otherIndex);
                        }
                    };
                },
                makeList = function (o) {
                    var list = [];
        
                    list.getItemOperators = function () {
                        return util.object.create(defaultItemOperators);
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
                            mid = parseInt(len / 2, 10);
        
                        while (i < mid) {
                            this[k] = this[i];
                            k -= 1;
                            i += 1;
                        }
        
                        return this;
                    };
                    list.map = list.map || function (callback, thisObj) {
                        var i,
                            len = this.length,
                            result = [];
        
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
                            i,
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
                            i,
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
                            i = len - 1;
        
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
                                distinct.push(item);
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
                    list.find = function (callback, thisObj) {
                        var i,
                            len = this.length;
        
                        if (typeof callback !== 'function') {
                            throw new Error('TypeError');
                        }
        
                        for (i = 0; i < len; i += 1) {
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
        
                        if (!util.object.isArray(otherList)) {
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
        
                        if (!util.object.isArray(otherList)) {
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
        
                            if (result.item === undefined) {
                                differences.push(makeCompareResult("deleted", item, i));
                            } else {
                                if (changed(item, result.item)) {
                                    differences.push(makeCompareResult("changed", item, i, result.item, result.index));
                                } else {
                                    differences.push(makeCompareResult("retained", item, i, result.item, result.index));
                                }
                            }
                        }
        
                        len = otherList.length;
                        for (i = 0; i < len; i += 1) {
                            item = otherList[i];
        
                            if (this.find(callback).item === undefined) {
                                differences.push(makeCompareResult("added", undefined, -1, item, i));
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
                            if (!this.hasOwnProperty(i)) {
                                this.splice(i, 1);
                            }
                        }
                    };
                    list.replaceAt = function (index, item) {
                        if (isFinite(index) && index >= 0 && index < this.length) {
                            this[index] = item;
                        }
                    };
                    list.isEmpty = function () {
                        return this.length === 0;
                    };
                    list.peek = function () {
                        return this[this.length - 1];
                    };
                    list.insert = function (index, item) {
                        if (index >= 0 && index <= this.length + 1) {
                            if (index === this.length + 1) {
                                this.push(item);
                            } else if (this.hasOwnProperty(index)) {
                                this.splice(index, 0, item);
                            } else {
                                this[index] = item;
                            }
                        }
                    };
        
        
                    // Initialization.
                    (function (args) {
                        var argcount = args.length;
        
                        if (argcount === 1 && util.object.isArray(o)) {
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
            'use strict';
            /*global 'makeList', 'setTimeout'*/
        
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
                        blocked = false,
                        observable = {
                            block: function () {
                                blocked = true;
                            },
                            unblock: function () {
                                blocked = false;
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
        
                                if (blocked || notifying) {
                                    return;
                                }
        
                                notifying = true;
        
                                if (throttleDuration > 0) {
                                    setTimeout(function () {
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
                dispose: 'dispose'
            };
        
            return makeObservable;
        }(makeList, setTimeout)),
        makeObservableList = (function (util, makeList, makeObservable) {
            'use strict';
            /*global 'util', 'makeList', 'makeObservable'*/
        
            var makeObservableList = function () {
                var slice = ([]).slice,
                    list = makeList.apply(undefined, slice.call(arguments));
        
                util.object.mixin(list, makeObservable());
                list.remove = (function (base) {
                    return function () {
                        var origLen = this.length;
        
                        this.block();
                        base.apply(this, slice.call(arguments));
                        this.unblock();
        
                        if (origLen !== this.length) {
                            this.notify();
                        }
                    };
                }(list.remove));
                list.clear = (function (base) {
                    return function () {
                        var origLen = this.length;
        
                        this.block();
                        base.call(this);
                        this.unblock();
        
                        if (origLen !== this.length) {
                            this.notify();
                        }
                    };
                }(list.clear));
                list.collapse = (function (base) {
                    return function () {
                        var origLen = this.length;
        
                        this.block();
                        base.call(this);
                        this.unblock();
        
                        if (origLen !== this.length) {
                            this.notify();
                        }
                    };
                }(list.collapse));
                list.insert = (function (base) {
                    return function (index, item) {
                        this.block();
                        base.call(this, index, item);
                        this.unblock();
                        this.notify();
                    };
                }(list.insert));
                list.mergeWith = (function (base) {
                    return function (otherList, equals, changed) {
                        this.block();
                        base.call(this, otherList, equals, changed);
                        this.unblock();
                        this.notify();
                    };
                }(list.mergeWith));
                list.replaceAt = function (index, item) {
                    if (isFinite(index) && index >= 0 && index < this.length) {
                        this[index] = item;
                        this.notify();
                    }
                };
                list.reverse = (function (base) {
                    return function () {
                        var result;
        
                        this.block();
                        result = base.call(this);
                        this.unblock();
                        this.notify();
        
                        return result;
                    };
                }(list.reverse));
                list.pop = (function (base) {
                    return function () {
                        var origLen = this.length, result;
        
                        this.block();
                        result = base.call(this);
                        this.unblock();
        
                        if (origLen !== this.length) {
                            this.notify();
                        }
        
                        return result;
                    };
                }(list.pop));
                list.push = (function (base) {
                    return function () {
                        var origLen = this.length,
                            result;
        
                        this.block();
                        result = base.apply(this, slice.call(arguments));
                        this.unblock();
        
                        if (origLen !== this.length) {
                            this.notify();
                        }
        
                        return result;
                    };
                }(list.push));
                list.shift = (function (base) {
                    return function () {
                        var origLen = this.length,
                            result;
        
                        this.block();
                        result = base.call(this);
                        this.unblock();
        
                        if (origLen !== this.length) {
                            this.notify();
                        }
        
                        return result;
                    };
                }(list.shift));
                list.unshift = (function (base) {
                    return function () {
                        var origLen = this.length,
                            result;
        
                        this.block();
                        result = base.apply(this, slice.call(arguments));
                        this.unblock();
        
                        if (origLen !== this.length) {
                            this.notify();
                        }
        
                        return result;
                    };
                }(list.unshift));
                list.sort = (function (base) {
                    return function () {
                        base.apply(this, slice.call(arguments));
                        this.notify();
                    };
                }(list.sort));
                list.splice = (function (base) {
                    return function () {
                        var origLen = this.length,
                            result;
        
                        this.block();
                        result = base.apply(this, slice.call(arguments));
                        this.unblock();
        
                        if (origLen !== this.length) {
                            this.notify();
                        }
        
                        return result;
                    };
                }(list.splice));
        
                if (arguments.length) {
                    list.notify();
                }
        
                return list;
            };
        
            makeObservableList = util.object.mixin({}, makeObservable.interfce, makeList.interfce);
        
            return makeObservableList;
        }(util, makeList, makeObservable)),
        makeProperty = (function (util, makeList, makeObservable, makeObservableList) {
            'use strict';
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
        
            makeProperty = function (options) {
                var writing = false,
                    dependencies = makeList(),
                    subscriptions = [],
                    setter,
                    getter,
                    memo,
                    property,
                    fn,
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
        
                property = {
                    equals: function (b) {
                        var a = this.get();
                        b = makeProperty.get(b);
        
                        a = a ? a.valueOf() : a;
                        b = b ? b.valueOf() : b;
        
                        return a === b;
                    },
                    changed: function (b) {
                        var a = this.get();
                        b = makeProperty.get(b);
        
                        a = a ? a.valueOf() : a;
                        b = b ? b.valueOf() : b;
        
                        return a !== b;
                    },
                    get: function () {
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
                    },
                    set: function (value) {
                        // Check if the property is writable.
                        if (typeof setter === 'function') {
                            writing = true;
        
                            if (!this.equals(value) || this.changed(value)) {
                                memo = undefined;
                                setter.call(this.owner, value);
                                this.notify();
                            }
        
                            writing = false;
                        }
                    },
                    dependencies: function () {
                        return dependencies;
                    },
                    isDependent: function () {
                        return dependencies.length !== 0;
                    },
                    toString: function () {
                        return util.object.toString(this.get());
                    },
                    valueOf : function () {
                        var value = this.get();
                        return util.object.isNil(value) ? value : value.valueOf();
                    }
                };
        
                util.object.mixin(property, makeObservable());
        
                // Initialization.
                (function () {
                    var value,
                        self = property,
                        lazy = false,
                        isObject = util.object.isObject,
                        isArray = util.object.isArray,
                        adheresTo = util.object.adheresTo;
        
                    self.owner = undefined;
        
                    // Just a getter function.
                    if (typeof options === 'function') {
                        getter = options;
                    // {get[, set, lazy, changed, equals, owner]}
                    } else if (isObject(options) && (typeof options.get === 'function' || typeof options.set === 'function')) {
                        lazy = options.lazy;
                        getter = options.get;
                        setter = typeof options.set === 'function' ? options.set : null;
                        self.equals = typeof options.equals === 'function' ? options.equals : self.equals;
                        self.changed = typeof options.changed === 'function' ? options.changed : self.changed;
                        self.owner = options.owner;
                    } else {
                        // {value[, changed, equqls, owner]}
                        if (isObject(options)) {
                            self.equals = typeof options.equals === 'function' ? options.equals : self.equals;
                            self.changed = typeof options.changed === 'function' ? options.changed : self.changed;
                            value = options.value;
                            self.owner = options.owner;
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
                            value.getItemOperators = (function (equals, changed) {
                                return function () {
                                    return {equals: equals, changed: changed};
                                };
                            }(self.equals, self.changed));
        
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
                        self.get();
                    }
        
                    // Create the functional property 'fn'.
                    fn = function (value) {
                        var ret,
                            origOwner = fn.owner;
        
                        // Temporarily set the owner to the 'this' object.
                        fn.owner = this;
        
                        if (arguments.length) {
                            fn.set(value);
                            ret = this;
                        } else {
                            ret = fn.get();
                        }
        
                        fn.owner = origOwner;
        
                        return ret;
                    };
        
                    util.object.mixin(fn, property);
                }());
        
                // We can return either the property (object) or fn (functional property).
                return fn;
            };
        
            // Convenience method to retrieve the value of the specified property.
            // If the specified property is not a property then returns property.
            makeProperty.get = function (property) {
                if (property && typeof property.get === 'function') {
                    return property.get();
                }
                return property;
            };
        
            makeProperty.interfce = util.object.mixin({
                owner: '*',
                get: 'function',
                set: 'function',
                equals: 'function',
                changed: 'function'
            }, makeObservable.interfce);
        
            return makeProperty;
        }(util, makeList, makeObservable, makeObservableList)),
        makeBinding = (function (util, makeProperty) {
            'use strict';
            /*global 'util', 'makeProperty'*/
        
            var makeBinding = function (source, sink, type) {
                var propertyInterface = makeProperty.interfce,
                    subscriptions = [],
                    subscription;
        
                type = type || 'twoway';
                type = util.string.toString(type);
                type = type.toLowerCase();
        
                if (!util.object.adheresTo(source, propertyInterface)) {
                    throw new Error('Binding source must be a observable property. ' + source);
                }
                if (!util.object.adheresTo(sink, propertyInterface)) {
                    throw new Error('Binding sink must be a observable property. ' + sink);
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
        templating = (function (util, makeProperty, makeList, $) {
        	'use strict';
        	/*jslint  regexp: true*/
        	/*global 'util', 'makeProperty', 'makeList', 'jQuery'*/
        
        	var getPartials = function () {
        			var partials = {};
        
        			$('script[type="text/html"][id]').each(function () {
        				var $this = $(this),
        					id = $this.attr('id'),
        					partial = $this.text();
        
        				partials[id] = partial;
        			});
        
        			return partials;
        		},
        		removeOwningElement = function (text) {
        			var i = text.indexOf('>'),
        				k = text.lastIndexOf('<');
        
        			return text.substring(i + 1, k);
        		},
        		makeRenderEngine2 = function (selector, model, render) {
        			var $scope = selector ? $(selector) : $('body'),
        				pattern = /\{\{.+\}\}/,
        				properties = [],
        				subEngines = [],
        				partials = getPartials(),
        				makeElementProperty = function ($element) {
        					var nodeName = $element.prop('nodeName').toLowerCase(),
        						type = $element.attr('type'),
        						template,
        						property;
        
        					switch (nodeName) {
        					case 'input':
        						switch (type) {
        						case 'button':
        						case 'submit':
        						case 'reset':
        							template = $element.val();
        							if (template.search(pattern) >= 0) {
        								property = makeProperty(function () {
        									return render(template, model, partials);
        								});
        								property.subscribe(function () {
        									var value = property.get();
        									$element.val(value ? value.toString() : '');
        								});
        							}
        							break;
        						case 'checkbox':
        						case 'radio':
        							template = $element.attr('data-checked');
        							$element.removeAttr('data-checked');
        							if (template.search(pattern) >= 0) {
        								property = makeProperty(function () {
        									return render(template, model, partials);
        								});
        								property.subscribe(function () {
        									var deps = property.dependencies(),
        										dep;
        
        									if (deps.length === 1) {
        										dep = deps[0];
        
        										if (typeof dep === 'function') {
        											$element.attr('checked', Boolean(dep()));
        										} else if (util.object.adheresTo(dep, makeList.interfce)) {
        											$element.attr('checked', dep.indexOf($element.val()) >= 0);
        										}
        									}
        								});
        								$element.bind('change.binding', function () {
        									var deps = property.dependencies(),
        										dep,
        										i;
        
        									if (deps.length === 1) {
        										dep = deps[0];
        										property.block();
        
        										if (typeof dep === 'function') {
        											dep($element.attr('checked'));
        										} else if (util.object.adheresTo(dep, makeList.interfce)) {
        											if ($element.attr('checked')) {
        												dep.push($element.val());
        											} else {
        												dep.remove($element.val());
        											}
        										}
        
        										property.unblock();
        									}
        								});
        							}
        							break;
        						case 'hidden':
        							template = $element.val();
        							if (template.search(pattern) >= 0) {
        								property = makeProperty(function () {
        									return render(template, model, partials);
        								});
        								property.subscribe(function () {
        									$element.val(property.get());
        								});
        							}
        							break;
        						}
        						break;
        					case 'button':
        						template = $element.text();
        						if (template.search(pattern) >= 0) {
        							property = makeProperty(function () {
        								return render(template, model, partials);
        							});
        							property.subscribe(function () {
        								$element.text(property.get());
        							});
        						}
        						break;
        					default:
        						template = $element.text();
        						if (template.search(pattern) >= 0) {
        							property = makeProperty(function () {
        								return render(template, model, partials);
        							});
        							property.subscribe(function () {
        								$element.text(property.get());
        							});
        							if ($element.attr('contenteditable') || $element.attr('data-contenteditable')) {
        								$element.bind('blur.binding', function () {
        									var deps = property.dependencies(),
        										dep;
        
        									if (deps.length === 1 && $element.attr('contenteditable')) {
        										dep = deps[0];
        										property.block();
        
        										if (typeof dep === 'function') {
        											dep($element.text());
        										} else if (util.object.adheresTo(dep, makeList.interfce)) {
        											dep.clear();
        											dep.push($element.text());
        										}
        
        										property.unblock();
        									}
        								});
        							}
        						}
        					}
        
        					return property;
        				},
        				makeAttributeProperties = function ($element) {
        					var key,
        						template,
        						property,
        						properties = [],
        						element = $element[0],
        						// Data-based attributes since some attributes
        						// get computed when rendered or some attributes
        						// simply don't have a valid DOM counterpart.
        						dataset = [
        							'data-checked',
        							'data-enabled',
        							'data-disabled',
        							'data-contenteditable',
        							'data-visible'
        						],
        						makeTextBasedProperty = function (template, key, $element) {
        							var property;
        
        							if (template && template.search(pattern) >= 0) {
        								property = makeProperty(function () {
        									return render(template, model, partials);
        								});
        
        								property.subscribe(function () {
        									$element.attr(key, property.get());
        								});
        							}
        
        							return property;
        						},
        						makeBooleanBasedProperty = function (template, key, $element) {
        							var property;
        
        							if (template && template.search(pattern) >= 0) {
        								property = makeProperty(function () {
        									return render(template, model, partials);
        								});
        								property.subscribe(function () {
        									var value = property.get();
        									$element.attr(key, value !== 'false');
        								});
        							}
        
        							return property;
        						},
        						makeEnabledProperty = function (template, $element) {
        							var property;
        
        							if (template && template.search(pattern) >= 0) {
        								property = makeProperty(function () {
        									return render(template, model, partials);
        								});
        								property.subscribe(function () {
        									var value = property.get();
        									$element.attr('disabled', !value || value === 'false');
        								});
        							}
        
        							return property;
        						},
        						makeVisibleProperty = function (template, $element) {
        							var property;
        
        							if (template && template.search(pattern) >= 0) {
        								property = makeProperty(function () {
        									return render(template, model, partials);
        								});
        								property.subscribe(function () {
        									var visible = Boolean(property.get());
        									if (visible) {
        										$element.show();
        									} else {
        										$element.hide();
        									}
        								});
        							}
        
        							return property;
        						};
        
        					for (key in element) {
        						if (element.hasOwnProperty(key)) {
        							property = null;
        							template = element[key];
        							template = template && typeof template.toString === 'function' ? template.toString() : '';
        							property = makeTextBasedProperty(template, key, $element);
        
        							if (property) {
        								properties.push(property);
        							}
        						}
        					}
        
        
        					while (dataset.length) {
        						property = null;
        						key = dataset.pop();
        						template = $element.attr(key);
        						template = template && typeof template.toString === 'function' ? template.toString() : '';
        
        						switch (key) {
        						case 'enable':
        							property = makeEnabledProperty(template, $element);
        							break;
        						case 'disabled':
        						case 'checked':
        						case 'contenteditable':
        							property = makeBooleanBasedProperty(template, key.replace(/^data-/, ''), $element);
        							break;
        						case 'visible':
        							property = makeVisibleProperty(template, $element);
        							break;
        						}
        
        						if (property) {
        							properties.push(property);
        							$element.removeAttr(key);
        						}
        					}
        
        					return properties;
        				},
        				makeTextElementProperty = function ($child) {
        					var template = $child.text(),
        						property;
        
        					if (template.search(pattern) >= 0) {
        						property = makeProperty(function () {
        							return render(template, model, partials);
        						});
        
        						property.subscribe(function () {
        							$child.replaceWith(property.get());
        						});
        					}
        
        					return property;
        				};
        
        			$('*', $scope).each(function () {
        				var $this = $(this);
        
        				(function () {
        					var child = $this[0].firstChild,
        						$child,
        						property,
        						sectionBeginPattern = /\{\{(#|^)(.+?)\}\}/,
        						sectionEndPattern = /\{\{\/(.+?)\}\}/,
        						result,
        						propertyName,
        						$clones,
        						engine;
        
        					property = makeElementProperty($this);
        
        					if (property) {
        						properties.push(property);
        					} else {
        						while (child) {
        							$child = $(child);
        
        							if (child.nodeType === 3) {
        								/*result = sectionBeginPattern.exec($child.text());
        
        								// If this child contains a section or inverse section
        								// token then we try to grab the entire section.
        								if (result) {
        									// Save the property name of the section.
        									propertyName = result[2];
        									child = child.nextSibling;
        									$clones = $([]);
        
        									// Look for the end section, cloning all nodes we
        									// encounter along the way.
        									while (child) {
        										$child = $(child);
        										result = sectionEndPattern.exec($child.text());
        
        										// Found the end section with the same name.
        										// NOTE: This does not take into account nested
        										// sections with the same property name.
        										if (result && result[1] === propertyName) {
        											engine = makeRenderEngine2($clones, model, render);
        											subEngines.push(engine);
        											engine.refresh();
        										} else {
        											if (child.nodeType === 1) {
        												$clones.push($child.clone());
        											} else if (child.nodeType === 3) {
        												$clones.push($child.text());
        											} else {
        												$clones.push($child.html());
        											}
        										}
        									}
        								} else {*/
        									property = makeTextElementProperty($child);
        								//}
        
        								if (property) {
        									properties.push(property);
        								}
        							}
        							child = child.nextSibling;
        						}
        					}
        				}());
        			});
        
        			return {
        				refresh: function () {
        					var i,
        						len = properties.length;
        
        					for (i = 0; i < len; i += 1) {
        						properties[i].notify();
        					}
        
        					for (i = 0; i < len; i += 1) {
        						subEngines[i].refresh();
        					}
        				},
        				dispose: function () {
        					while (properties.length) {
        						properties.pop().dispose();
        					}
        					while (subEngines.length) {
        						subEngines.pop().dispose();
        					}
        					model = null;
        					render = null;
        					partials = null;
        				}
        			};
        		},
        		makeRenderEngine = function (selector, model, render) {
        			var $elements = selector ? $(selector) : $('body'),
        				partials = getPartials(),
        				properties = [],
        				wrappedModel = {};
        
        			(function () {
        				var key,
        					wrap = function (o, propertyName, value) {
        						var ret = value;
        
        						if (util.object.adheresTo(value, makeProperty.interfce)) {
        							ret = function () {
        								var args = arguments;
        								if (args.length) {
        									value.call(o, args[0]);
        								} else {
        									return value.call(o);
        								}
        							};
        						}
        
        						return ret;
        					};
        
        				for (key in model) {
        					if (model.hasOwnProperty(key)) {
        						wrappedModel[key] = wrap(model, key, model[key]);
        					}
        				}
        			}());
        
        			$elements.each(function () {
        				var $this = $(this),
        					template = removeOwningElement($this.html()),
        					property = makeProperty(function () {
        						return render(template, model, partials);
        					});
        
        				property.subscribe(function () {
        					$this.html(property.get());
        				});
        				property.dispose = (function (base) {
        					return function () {
        						base.call(this);
        						$this = null;
        						property = null;
        						template = null;
        					};
        				}(property.dispose));
        				properties.push(property);
        			});
        
        			return {
        				refresh: function () {
        					var i,
        						property,
        						len = properties.length;
        
        					for (i = 0; i < len; i += 1) {
        						property = properties[i];
        						property.notify();
        					}
        				},
        				dispose: function () {
        					while (properties.length) {
        						properties.pop().dispose();
        					}
        					model = null;
        					render = null;
        					partials = null;
        				}
        			};
        		};
        
        	return {
        		makeRenderEngine: makeRenderEngine,
        		makeRenderEngine2: makeRenderEngine2
        	};
        }(util, makeProperty, makeList, jQuery));

    return {
        util: util,
        makeList: makeList,
        makeObservable: makeObservable,
        makeObservableList: makeObservableList,
        makeProperty: makeProperty,
        makeBinding: makeBinding,
        templating: templating,
        toObject: function (o, excludeDependentProperties) {
            var i,
                len,
                key,
                value,
                js = {},
                toObject = util.toObject,
                isObject = util.object.isObject,
                isArray = util.object.isArray,
                adheresTo = util.object.adheresTo,
                propertyInterface = makeProperty.interfce;

            if (isArray(o)) {
                len = o.length;
                js = [];

                for (i = 0; i < len; i += 1) {
                    js.push(toObject(o[i]));
                }

                return js;
            } else

            if (!isObject(o)) {
                return o;
            }

            for (key in o) {
                value = o[key];

                if (adheresTo(value, propertyInterface)) {
                	if (!(value.isDependent() && excludeDependentProperties)) {
                        js[key] = toObject(value.get());
                    }
                } else {
                    js[key] = value;
                }
            }

            return js;
        }
    };
}());