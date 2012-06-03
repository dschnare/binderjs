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