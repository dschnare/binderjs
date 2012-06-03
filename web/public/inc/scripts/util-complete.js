/**
 * @preserve Module: xport
 * Author: Darren Schnare
 * Keywords: javascript,export
 * License: MIT ( http://www.opensource.org/licenses/mit-license.php )
 * Repo: https://github.com/dschnare/project-template
 */

/*globals 'window', 'define', 'exports', 'require' */

(function () {
	'use strict';

	/**
	 * Exports a symbol with the given name onto the specified scope.
	 *
	 * @param {String} name The name to give the symbol for export.
	 * @param {Object} symbol The symbol to export.
	 * @param {Object} scope The scope to export into. Defaults to the window object if it exists, otherwise an empty object.
	 * @return {Object} The scope exported to.
	 */
	function xport(name, symbol, scope) {
		name = name ? name.toString() : '';

		if (!scope) {
			if (typeof window !== 'object') {
				scope = {};
			} else {
				scope = window;
			}
		}

		var names = name.split('.'),
			len = names.length,
			o = scope,
			i,
			n;

		for (i = 0; i < len - 1; i += 1) {
			n = names[i];

			if (o[n] === undefined) {
				o[n] = {};
			}

			o = o[n];
		}

		n = names[len - 1];
		o[n] = symbol;

		return scope;
	}

	/**
	 * Attempts to export a module using either the AMD or CommonJS module system. If no module system
	 * is present then will call the fallback callback.
	 *
	 * For example:
	 *	// With dependencies
	 *	xport.module(['dep1', 'jquery', 'dep2'], moduleFn, function () {
	 *		xport('MODULE', moduleFn(DEP1, jQuery, DEP2));
	 *	});
	 *
	 *	// Without dependencies
	 *	xport.module(moduleFn, function () {
	 *		xport('MODULE', moduleFn());
	 *	});
	 *
	 *	// Without dependencies
	 *	xport.module(someObject, function () {
	 *		xport('MODULE', someObject);
	 *	});
	 *
	 * @param {Array<String>=} deps The module dependencies to use when exporting via AMD or CommonJS (optional).
	 * @param {function(...Object):Object|Object} fn The module function or if an object if there are no dependencies.
	 * @param {function()} fallback The callback to call when no module system exists.
	 */
	function module(deps, fn, fallback) {
		var d, i, o, k, Object = ({}).constructor;

		if (Object.prototype.toString.call(deps) !== '[object Array]') {
			fallback = fn;
			fn = deps;
			deps = [];

			// If 'fn' is not a function then wrap it in a function.
			if (typeof fn !== 'function') {
				fn = (function (o) {
					return function () {
						return o;
					};
				}(fn));
			}
		}

		// Asynchronous modules (AMD) supported.
		if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
			if (deps.length === 0) {
				define(fn);
			} else {
				define(deps, fn);
			}
		// Nodejs/CommonJS modules supported.
		} else if (typeof exports === 'object' && exports && typeof require === 'function') {
			if (deps.length === 0) {
				o = fn();
			} else {
				d = [];
				i = deps.length;

				// Require all dependencies.
				while (i > 0) {
					i -= 1;
					d.unshift(require(deps[i]));
				}

				// Build the module.
				o = fn.apply(undefined, d);
			}

			// Export the module.
			if (o) {
				for (k in o) {
					if (o.hasOwnProperty(k)) {
						exports[k] = o[k];
					}
				}
			}
		// There is no module system present so call the fallback.
		} else if (typeof fallback === 'function') {
			fallback();
		}
	}

	// Export the module function on the xport funciton.
	xport('module', module, xport);
	// Export the xport function to the window (if it exists).
	xport('xport', xport);
}());
/**
 * @preserve Author: Darren Schnare
 * Keywords: javascript,util,utility,format
 * License: MIT ( http://www.opensource.org/licenses/mit-license.php )
 * Repo: https://github.com/dschnare/utiljs
 */
/*global 'xport', 'define', 'exports', 'require' */
(function (xport) {
	'use strict';

	var Object = {}.constructor,
		isNil = function (o) {
			return o === null || o === undefined;
		},
		isArray = (function () {
			var toString = Object.prototype.toString;

			return function (o) {
				return (toString.call(o) === '[object Array]') || (!isNil(o) && typeof o.length === 'number' && typeof o.push === 'function');
			};
		}()),
		typeOf = function (o) {
			if (o === null) {
				return 'null';
			}
			if (isArray(o)) {
				return 'array';
			}
			return typeof o;
		},
		isObject = function (o) {
			return o && typeOf(o) === 'object';
		},
		str = function (o) {
			return o === undefined || o === null ? '' : o.toString();
		},
		mixin = function (o) {
			var len = arguments.length,
				i,
				key,
				arg;

			if (!o) {
				throw new Error('Expected at least one object as an argument.');
			}

			for (i = 1; i < len; i += 1) {
				arg = arguments[i];

				if (!isNil(arg)) {
					for (key in arg) {
						if (arg.hasOwnProperty(key)) {
							o[key] = arg[key];
						}
					}
				}
			}

			return o;
		},
		respondsTo = function (o, method) {
			return o && typeof o[method] === 'function';
		},
		adheresTo = function (o, interfce) {
			var key,
				typeofo,
				typeofi;

			if ((isObject(o) || typeof o === 'function' || isArray(o)) &&
					(isObject(interfce) || typeof interfce === 'function' || isArray(interfce))) {
				for (key in interfce) {
					if (interfce.hasOwnProperty(key)) {
						// Property can be any type, but must exist.
						if (interfce[key] === '*') {
							if (o[key] === undefined) {
								return false;
							}
						} else {
							if (typeOf(o[key]) !== typeOf(interfce[key]) &&
									typeOf(o[key]) !== str(interfce[key])) {
								return false;
							}
						}
					}
				}

				return true;
			}

			typeofo = typeOf(o);
			typeofi = typeOf(interfce);

			return typeofo === typeofi;
		},
		create = function (o) {
			if (!o) {
				throw new Error('Expected an object as an argument.');
			}
			var F = function () {};
			F.prototype = o;
			return new F();
		},
		trim = function (str) {
			str = str ? str.toString() : '';

			var i = 0,
				c = str.charAt(i);

			while (c) {
				if (c > ' ') {
					str = str.substring(i);
					break;
				}

				i += 1;
				c = str.charAt(i);
			}

			i = str.length;

			while (i) {
				i -= 1;
				c = str.charAt(i);

				if (c > ' ') {
					str = str.substring(0, i + 1);
					break;
				}
			}

			return str;
		},
		format = function (s) {
			var string = str(s),
				args = arguments,
				argCount = args.length,
				i = string.length,
				c = null,
				n = 0,
				k = 0,
				next = function () {
					i -= 1;
					c = string.charAt(i);
					return c;
				};

			while (next()) {
				if (c === '}') {
					k = i + 1;
					next();
					n = '';

					while (c >= '0' && c <= '9') {
						n = c + n;
						next();
					}

					if (c === '{') {
						n = parseInt(n, 10) + 1;

						if (n < argCount) {
							string = string.substring(0, i) + args[n] + string.substring(k);
						}
					}
				}
			}

			return string;
		},
		// Ensure our public API is exported with the correct property names
		// by using JSON notation.
		util = {
			"typeOf": typeOf,
			"isObject": isObject,
			"isArray": isArray,
			"isNil": isNil,
			"mixin": mixin,
			"str": str,
			"respondsTo": respondsTo,
			"adheresTo": adheresTo,
			"create": create,
			"trim": trim,
			"format": format
		};

	// Export the utiljs API.
	xport.module(util, function () {
		xport('UTIL', util);
	});
}(typeof xport === 'function' ? xport : null));