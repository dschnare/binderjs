			/*toJSON(model, {
				include: []
				exclude: []
				filter
				properties: {
					property: fn that will be called with the value
							of a property and return a new value,
							or a nested options object
				}
			});*/
			toJSON = function (o, options) {
				var i,
					len,
					key,
					value,
					json,
					opt,
					empty = {},
					isObject = utiljs.isObject,
					isArray = utiljs.isArray,
					adheresTo = utiljs.adheresTo,
					propertyInterface = makeProperty["interfce"],
					passthru = function (v) {
						return v;
					},
					include,
					exclude,
					filter;

				options = options || empty;

				if (typeof options === 'function') {
					filter = options;
				} else {
					filter = options["filter"];
					filter = typeof filter === 'function' ? filter : passthru;
				}

				if (isArray(o)) {
					json = [];
					len = o.length;

					for (i = 0; i < len; i += 1) {
						json.push(toJSON(o[i], options));
					}
				} else if (isObject(o)) {
					json = {};
					include = makeList(options["include"] || []);
					exclude = makeList(options["exclude"] || []);

					for (key in o) {
						if (o[key] !== undefined) {
							if (include["contains"](key) || !exclude["contains"](key)) {
								value = o[key];
								opt = options["properties"] ? options["properties"][key] : empty;

								if (adheresTo(value, propertyInterface)) {
									json[key] = toJSON(value["get"](), opt);
								} else {
									json[key] = toJSON(value, opt);
								}
							}
						}
					}

					json = filter(json, o);
				} else {
					json = filter(o, o);
				}

				return json;
			},