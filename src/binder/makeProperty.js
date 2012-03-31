(function (util, makeList, makeObservable, makeObservableList, window) {
    'use strict';
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
                return util.str(this.get());
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
}(util, makeList, makeObservable, makeObservableList, window));