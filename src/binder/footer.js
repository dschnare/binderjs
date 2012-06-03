
		return {
			"utiljs": util,
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
		xport('BINDER', module(UTIL));
	});
}());