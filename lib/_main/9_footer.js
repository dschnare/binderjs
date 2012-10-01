
		return {
			mkList: mkList,
			mkObservable: mkObservable,
			mkObservableList: mkObservableList,
			mkProperty: mkProperty,
			mkBinding: mkBinding,
			toJSON: toJSON,
			fromJSON: fromJSON
		};
	}

	xport.module(['utiljs'], module, function () {
		xport('BINDER', module(utiljs));
	});
}(this.XPORT, this.UTIL));