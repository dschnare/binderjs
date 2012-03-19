(function (util, makeList, makeObservable) {
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
}(util, makeList, makeObservable));