(function () {
    'use strict';

    var util = {
            object: {
                typeOf: function (o) {
                    if (o === null) {
                        return 'null';
                    }
                    if (util.object.isArray(o)) {
                        return 'array';
                    }
                    return typeof o;
                },
                isObject: function (o) {
                    return o && util.object.typeOf(o) === 'object';
                },
                isArray: (function () {
                    var toString = Object.prototype.toString;

                    return function (o) {
                        return toString.call(o) === '[object Array]';
                    };
                }()),
                isNil: function (o) {
                    return o === null || o === undefined;
                },
                adheresTo: function (o, interfce) {
                    var key,
                        typeofo,
                        typeofi,
                        isObject = util.object.isObject,
                        isArray = util.object.isArray,
                        toString = util.string.toString,
                        typeOf = util.object.typeOf;

                    if ((isObject(o) || typeof o === 'function' || isArray(o)) &&
                            (isObject(interfce) || typeof interfce === 'function' || isArray(interfce))) {
                        for (key in interfce) {
                            if (interfce.hasOwnProperty(key)) {
                                // Property can be any type, but must exist.
                                if (interfce[key] === '*') {
                                    if (!o.hasOwnProperty(key)) {
                                        return false;
                                    }
                                } else {

                                    if (typeOf(o[key]) !== typeOf(interfce[key]) &&
                                            typeOf(o[key]) !== toString(interfce[key])) {
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
                mixin: function (o) {
                    var isNil = util.object.isNil,
                        len = arguments.length,
                        i,
                        arg,
                        key;

                    if (len === 0 || !o) {
                        return o;
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
                create: (function () {
                    var F = function () {};

                    return function (o) {
                        F.prototype = o;
                        return new F();
                    };
                }())
            },
            string: {
                toString: function (o) {
                    return o === undefined || o === null ? '' : o.toString();
                },
                trim: function (str) {
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
                format: function (str) {
                    var s = util.string.toString(str),
                        args = arguments,
                        argCount = args.length,
                        i = s.length,
                        c = null,
                        n = 0,
                        k = 0,
                        next = function () {
                            i -= 1;
                            c = s.charAt(i);
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
                                    s = s.substring(0, i) + args[n] + s.substring(k);
                                }
                            }
                        }
                    }

                    return s;
                }
            }
        };

    return util;
}());