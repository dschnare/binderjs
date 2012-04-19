var BINDER = (function (util) {
    'use strict';

    /*global 'UTIL', 'define', 'exports', 'require'*/

    var module = function (util) {
            var Array = ([]).constructor,
                Object = ({}).constructor,
                makeList = {{makeList}},
                makeObservable = {{makeObservable}},
                makeObservableList = {{makeObservableList}},
                makeProperty = {{makeProperty}},
                makeBinding = {{makeBinding}},
                toJSON = {{toJSON}},
                fromJSON = {{fromJSON}};

            return {
                utiljs: util,
                makeList: makeList,
                makeObservable: makeObservable,
                makeObservableList: makeObservableList,
                makeProperty: makeProperty,
                makeBinding: makeBinding,
                toJSON: toJSON,
                fromJSON: fromJSON
            };
        };

    // Asynchronous modules (AMD) supported.
    if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
        define(['utiljs'], module);
    // Nodejs/CommonJS modules supported.
    } else if (typeof exports === 'object' && exports && typeof require === 'function') {
        util = require('utiljs');
        util.mixin(exports, module(util));
    } else {
        return module(util);
    }
}(typeof UTIL === 'object' && UTIL ? UTIL : null));