
		return {
			mkList: mkList,
			mkObservable: mkObservable,
			mkObservableList: mkObservableList,
			mkProperty: mkProperty,
			run: function (fn) {
				var property, observers;

				observers = [];
				property = mkProperty(fn);
				property.subscribe(function () {
					var i, len, o, args;

					args = ([]).slice.call(arguments, 1);
					args.unshift(function () {
						property();
					});

					for (i = 0, len = observers.length; i < len; i += 1) {
						o = observers[i];

						if (o && typeof o.onNotify === 'function') {
							o.onNotify.apply(o, args);
						} else if (typeof o === 'function') {
							o.apply(undefined, args);
						}
					}
				});

				return {
					subscribe: function (observer) {
						if (observer) {
							observers.push(observer);
						}
					},
					dispose: function () {
						property.dispose();
					}
				};
			},
			mkBinding: mkBinding,
			toJSON: toJSON,
			fromJSON: fromJSON
		};
	}

	xport.module(['utiljs'], module, function () {
		xport('BINDER', module(utiljs));
	});
}(this.XPORT, this.UTIL));