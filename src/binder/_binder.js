var BINDER = (function () {
    'use strict';

    var Array = ([]).constructor,
        Object = ({}).constructor,
        util = {{util}},
        makeList = {{makeList}},
        makeObservable = {{makeObservable}},
        makeObservableList = {{makeObservableList}},
        makeProperty = {{makeProperty}},
        makeBinding = {{makeBinding}},
        templating = {{templating}};

    return {
        util: util,
        makeList: makeList,
        makeObservable: makeObservable,
        makeObservableList: makeObservableList,
        makeProperty: makeProperty,
        makeBinding: makeBinding,
        templating: templating,
        toObject: function (o, excludeDependentProperties) {
            var i,
                len,
                key,
                value,
                js = {},
                toObject = util.toObject,
                isObject = util.object.isObject,
                isArray = util.object.isArray,
                adheresTo = util.object.adheresTo,
                propertyInterface = makeProperty.interfce;

            if (isArray(o)) {
                len = o.length;
                js = [];

                for (i = 0; i < len; i += 1) {
                    js.push(toObject(o[i]));
                }

                return js;
            } else

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
        }
    };
}());