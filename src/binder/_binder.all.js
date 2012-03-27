var BINDER = (function () {
    'use strict';

    var Array = ([]).constructor,
        Object = ({}).constructor,
        util = (function () {
            var define = null,
                exports = null,
                require = null;

            {{util}};

            return UTIL;
        }()),
        makeList = {{makeList}},
        makeObservable = {{makeObservable}},
        makeObservableList = {{makeObservableList}},
        makeProperty = {{makeProperty}},
        makeBinding = {{makeBinding}},
        toObject = function (o, excludeDependentProperties) {
            var i,
                len,
                key,
                value,
                js = {},
                isObject = util.isObject,
                isArray = util.isArray,
                adheresTo = util.adheresTo,
                propertyInterface = makeProperty.interfce;

            if (isArray(o)) {
                len = o.length;
                js = [];

                for (i = 0; i < len; i += 1) {
                    js.push(toObject(o[i]));
                }

                return js;
            }

            if (!isObject(o)) {
                return o;
            }

            for (key in o) {
                value = o[key];

                if (adheresTo(value, propertyInterface)) {
                    if (!(value.isDependent() && excludeDependentProperties)) {
                        js[key] = toObject(value.get());
                    }
                } else {
                    js[key] = value;
                }
            }

            return js;
        },
        module = {
            util: util,
            makeList: makeList,
            makeObservable: makeObservable,
            makeObservableList: makeObservableList,
            makeProperty: makeProperty,
            makeBinding: makeBinding,
            toObject: toObject
        };

    // Asynchronous modules (AMD) supported.
    if (typeof define === 'function' && typeof define.amd === 'object') {
        define(module);
    // Nodejs/CommonJS modules supported.
    } else if (typeof exports === 'object' && exports && typeof require === 'function') {
        util.mixin(exports, module);
    } else {
        return module;
    }
}());