			mkObservable = (function () {
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
									observer.apply(observer.thisObj, args);
								} else if (typeof observer.onNotify === 'function') {
									observer.onNotify.apply(observer, args);
								}
							}
						}
					},
					mkObservable = function () {
						var observers = mkList(),
							throttleDuration = 0,
							notifying = false,
							blockStack = [],
							throttleId = -1,
							instance = UTIL.create(mkObservable.fn);


						instance.block = function () {
							blockStack.push(true);
						};
						instance.unblock = function () {
							blockStack.pop();
						};
						instance.subscribe = function (observer, thisObj) {
							if (observer && !observers.contains(observer)) {
								observer.thisObj = thisObj || undefined;
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
						};
						instance.throttle = function (durationInMilliseconds) {
							if (!isFinite(durationInMilliseconds)) {
								durationInMilliseconds = 0;
							}
							throttleDuration = durationInMilliseconds;
						};
						// Can specify any number of arguments.
						instance.notify = function () {
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
						};
						instance.dispose = function () {
							observers.clear();
							clearTimeout(throttleId);
						};

						return instance;
					};

				mkObservable.fn = {};
				mkObservable.interfce = {
					block: 'function',
					unblock: 'function',
					subscribe: 'function',
					throttle: 'function',
					notify: 'function',
					dispose: 'function'
				};

				return mkObservable;
			}()),