var BINDER = (function (util) {
    'use strict';

    var Array = ([]).constructor,
        Object = ({}).constructor,
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
        module = function (util) {
            return {
                makeList: makeList,
                makeObservable: makeObservable,
                makeObservableList: makeObservableList,
                makeProperty: makeProperty,
                makeBinding: makeBinding,
                toObject: toObject
            };
        };

    // Asynchronous modules (AMD) supported.
    if (typeof define === 'function' && typeof define.amd === 'object') {
        define(['util'], module);
    // Nodejs/CommonJS modules supported.
    } else if (typeof exports === 'object' && exports && typeof require === 'function') {
        util = require('util');
        util.mixin(exports, module(util));
    } else {
        return module(util);
    }
}(UTIL));