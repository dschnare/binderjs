/*
Author: Darren Schnare
Keywords: javascript,binding,bind,property,list,observer,observable
License: MIT ( http://www.opensource.org/licenses/mit-license.php )
Repo: https://github.com/dschnare/binderjs
*/
var BINDER = (function (util) {
    'use strict';

    var Array = ([]).constructor,
        Object = ({}).constructor,
        makeList = (function (util) {
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
        
            makeObservableList.interfce = util.mixin({}, makeObservable.interfce, makeList.interfce);
        
            return makeObservableList;
        }(util, makeList, makeObservable)),
        makeProperty = (function (util, makeList, makeObservable, makeObservableList, window) {
            /*global 'util', 'makeList', 'makeObservable', 'makeObservableList', 'window'*/
        
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
                    clearMemo: function () {
                        memo = undefined;
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
                        return util.toString(this.get());
                    },
                    valueOf : function () {
                        var value = this.get();
                        return util.isNil(value) ? value : value.valueOf();
                    }
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
                        if (this !== window) {
                            fn.owner = this;
                        }
        
                        if (arguments.length) {
                            fn.set(value);
                            ret = this;
                        } else {
                            ret = fn.get();
                        }
        
                        fn.owner = origOwner;
        
                        return ret;
                    };
        
                    util.mixin(fn, property);
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
        }(util, makeList, makeObservable, makeObservableList, window)),
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
                    throw new Error('Binding source must be a observable property. ' + source);
                }
                if (!util.adheresTo(sink, propertyInterface)) {
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
        toObject = function (o, excludeDependentProperties) {
            var i,
                len,
                key,
                value,
                js = {},
                isObject = util.isObject,
                isArray = util.isArray,
                adheresTo = util.adheresTo,
                propertyInterface = makeProperty.interfce;

            if (isArray(o)) {
                len = o.length;
                js = [];

                for (i = 0; i < len; i += 1) {
                    js.push(toObject(o[i]));
                }

                return js;
            }

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
        },
        module = function (util) {
            return {
                makeList: makeList,
                makeObservable: makeObservable,
                makeObservableList: makeObservableList,
                makeProperty: makeProperty,
                makeBinding: makeBinding,
                toObject: toObject
            };
        };

    // Asynchronous modules (AMD) supported.
    if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
        define(['util'], module);
    // Nodejs/CommonJS modules supported.
    } else if (typeof exports === 'object' && exports && typeof require === 'function') {
        util = require('util');
        util.mixin(exports, module(util));
    } else {
        return module(util);
    }
}(UTIL));