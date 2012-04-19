(function (util, makeProperty, makeList) {
	'use strict';

	/*global 'util', 'makeProperty', 'makeList'*/
	/*jslint continue: true*/

	/*fromJSON(data, {
        include: []
        exclude: []
        copy: [],
        filter(value): fn that will be called with the value
                    created before returning from fromJSON().
                    Must return the same value or a new value.
        properties: {
            property: {
                create(value): fn that returns an object
                that will be used to create a binder property.
                // All other properties are supported.
            }
        }
    });*/

	var fromJSON = function (json, options, target) {
			var isArray = util.isArray,
				isNil = util.isNil,
				isObject = util.isObject,
				adheresTo = util.adheresTo,
				propertyInterface = makeProperty.interfce,
				empty = {},
				include,
				exclude,
				copy,
				filter,
				create,
				passthru = function (v) {
					return v;
				},
				opt,
				key,
				value,
				i,
				len,
				array,
				model,
				property;

			options = options || empty;

			if (typeof options === 'function') {
				filter = options;
			} else {
				filter = options.filter;
				filter = typeof filter === 'function' ? filter : passthru;
			}

			if (isArray(json)) {
				model = makeList();
				len = json.length;

				for (i = 0; i < len; i += 1) {
					model.push(fromJSON(json[i], options));
				}

				if (target) {
					if (adheresTo(target, makeList.interfce)) {
						target.merge(model);
					} else if (isArray(target)) {
						target.push.apply(target, model);
					} else {
						throw new Error('Expected target to be an Array.');
					}
				}
			} else if (isObject(json)) {
				model = {};
				include = makeList(options.include || []);
				exclude = makeList(options.exclude || []);
				copy = makeList(options.copy || []);

				for (key in json) {
					if (json[key] !== undefined && typeof json[key] !== 'function') {
						opt = options.properties ? options.properties[key] : empty;
						value = json[key];
						create = opt ? opt.create : passthru;
						create = typeof create === 'function' ? create : passthru;

						if (value !== undefined &&
								(include.contains(key) || !exclude.contains(key))) {

							if (copy.contains(key)) {
								if (target) {
									if (adheresTo(target[key], propertyInterface)) {
										target[key](fromJSON(value, opt));
									} else {
										target[key] = fromJSON(value, opt);
									}
								} else {
									model[key] = fromJSON(value, opt);
								}
							} else if (isArray(value)) {
								if (target) {
									if (adheresTo(target[key], propertyInterface)) {
										target[key](fromJSON(value, opt));
									} else if (isArray(target[key])) {
										fromJSON(value, opt, target[key]);
									} else {
										property = makeProperty(create(fromJSON(value, opt), target));
										target[key] = property;
										property.owner = target;
									}
								} else {
									property = makeProperty(create(fromJSON(value, opt), model));
									property.owner = model;
									model[key] = property;
								}
							} else if (isObject(value)) {
								if (target) {
									if (adheresTo(target[key], propertyInterface)) {
										target[key](fromJSON(value, opt));
									} else {
										target[key] = fromJSON(value, opt);
									}
								} else {
									model[key] = fromJSON(value, opt);
								}
							} else {
								if (target) {
									if (adheresTo(target[key], propertyInterface)) {
										target[key](fromJSON(value, opt));
									} else {
										property = makeProperty(create(fromJSON(value, opt), target));
										target[key] = property;
										property.owner = target;
									}
								} else {
									property = makeProperty(create(fromJSON(value, opt), model));
									property.owner = model;
									model[key] = property;
								}
							}
						}
					}
				}

				model = filter(model, json);
			} else {
				model = filter(json, json);
			}

			return target || model;
		};

	return fromJSON;
}(util, makeProperty, makeList));