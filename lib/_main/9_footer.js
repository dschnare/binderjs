
		return {
			"makeList": makeList,
			"makeObservable": makeObservable,
			"makeObservableList": makeObservableList,
			"makeProperty": makeProperty,
			"makeBinding": makeBinding,
			"toJSON": toJSON,
			"fromJSON": fromJSON
		};
	}

	xport.module(['utiljs'], module, function () {
		xport('BINDER', module(utiljs));
	});
}(typeof XPORT === 'function' ? XPORT : null, typeof UTILJS === 'object' && UTILJS ? UTILJS : null));