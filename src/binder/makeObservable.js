(function (makeList, setTimeout) {
    'use strict';
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
                blocked = false,
                throttleId = -1,
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
}(makeList, setTimeout));