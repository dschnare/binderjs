			makeObservableList = (function () {
				var makeObservableList = function () {
					var slice = ([]).slice,
						list = makeList.apply(undefined, slice.call(arguments));

					util.mixin(list, makeObservable());
					list["remove"] = (function (base) {
						return function () {
							var origLen = this.length, ret;

							this["block"]();
							ret = base.apply(this, slice.call(arguments));
							this["unblock"]();

							if (origLen !== this.length) {
								this["notify"]();
							}

							return ret;
						};
					}(list["remove"]));
					list["removeAt"] = (function (base) {
						return function () {
							var origLen = this.length, ret;

							this["block"]();
							ret = base.apply(this, slice.call(arguments));
							this["unblock"]();

							if (origLen !== this.length) {
								this["notify"]();
							}

							return ret;
						};
					}(list["removeAt"]));
					list["replaceAt"] = (function (base) {
						return function () {
							var ret;

							this["block"]();
							ret = base.apply(this, slice.call(arguments));
							this["unblock"]();
							this["notify"]();

							return ret;
						};
					}(list["replaceAt"]));
					list["clear"] = (function (base) {
						return function () {
							var origLen = this.length, ret;

							this["block"]();
							ret = base.call(this);
							this["unblock"]();

							if (origLen !== this.length) {
								this["notify"]();
							}

							return ret;
						};
					}(list["clear"]));
					list["collapse"] = (function (base) {
						return function () {
							var origLen = this.length, ret;

							this["block"]();
							ret = base.call(this);
							this["unblock"]();

							if (origLen !== this.length) {
								this["notify"]();
							}

							return ret;
						};
					}(list["collapse"]));
					list["insert"] = (function (base) {
						return function () {
							var ret;

							this["block"]();
							ret = base.apply(this, slice.call(arguments));
							this["unblock"]();

							if (ret) {
								this["notify"]();
							}

							return ret;
						};
					}(list["insert"]));
					list["mergeWith"] = (function (base) {
						return function () {
							var ret;

							this["block"]();
							ret = base.apply(this, slice.call(arguments));
							this["unblock"]();
							this["notify"]();

							return ret;
						};
					}(list["mergeWith"]));
					list["reverse"] = (function (base) {
						return function () {
							var ret;

							this["block"]();
							ret = base.call(this);
							this["unblock"]();
							this["notify"]();

							return ret;
						};
					}(list["reverse"]));
					list["pop"] = (function (base) {
						return function () {
							var origLen = this.length, ret;

							this["block"]();
							ret = base.call(this);
							this["unblock"]();

							if (origLen !== this.length) {
								this["notify"]();
							}

							return ret;
						};
					}(list["pop"]));
					list["push"] = (function (base) {
						return function () {
							var origLen = this.length, ret;

							this["block"]();
							ret = base.apply(this, slice.call(arguments));
							this["unblock"]();

							if (origLen !== this.length) {
								this["notify"]();
							}

							return ret;
						};
					}(list["push"]));
					list["shift"] = (function (base) {
						return function () {
							var origLen = this.length, ret;

							this["block"]();
							ret = base.call(this);
							this["unblock"]();

							if (origLen !== this.length) {
								this["notify"]();
							}

							return ret;
						};
					}(list["shift"]));
					list["unshift"] = (function (base) {
						return function () {
							var origLen = this.length, ret;

							this["block"]();
							ret = base.apply(this, slice.call(arguments));
							this["unblock"]();

							if (origLen !== this.length) {
								this["notify"]();
							}

							return ret;
						};
					}(list["unshift"]));
					list["sort"] = (function (base) {
						return function () {
							var ret = base.apply(this, slice.call(arguments));

							this["notify"]();

							return ret;
						};
					}(list["sort"]));
					list["splice"] = (function (base) {
						return function () {
							var origLen = this.length, ret;

							this["block"]();
							ret = base.apply(this, slice.call(arguments));
							this["unblock"]();

							if (origLen !== this.length) {
								this["notify"]();
							}

							return ret;
						};
					}(list["splice"]));

					return list;
				};

				makeObservableList["interfce"] = util.mixin({}, makeObservable["interfce"], makeList["interfce"]);

				return makeObservableList;
			}()),