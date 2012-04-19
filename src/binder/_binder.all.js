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
        toJSON = {{toJSON}},
        fromJSON = {{fromJSON}},
        module = {
            utiljs: util,
            makeList: makeList,
            makeObservable: makeObservable,
            makeObservableList: makeObservableList,
            makeProperty: makeProperty,
            makeBinding: makeBinding,
            toJSON: toJSON,
            fromJSON: fromJSON
        };

    // Asynchronous modules (AMD) supported.
    if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
        define(module);
    // Nodejs/CommonJS modules supported.
    } else if (typeof exports === 'object' && exports && typeof require === 'function') {
        util.mixin(exports, module);
    } else {
        return module;
    }
}());