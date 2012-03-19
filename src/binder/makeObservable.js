(function (makeList, setTimeout) {
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
}(makeList, setTimeout));