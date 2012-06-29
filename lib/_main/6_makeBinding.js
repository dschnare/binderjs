			makeBinding = (function () {
				var makeBinding = function (source, sink, type) {
					var propertyInterface = makeProperty["interfce"],
						subscriptions = [],
						subscription;

					type = type || 'twoway';
					type = utiljs.str(type);
					type = type.toLowerCase();

					if (!utiljs.adheresTo(source, propertyInterface)) {
						throw new Error('Binding source must be an observable property. ' + source);
					}
					if (!utiljs.adheresTo(sink, propertyInterface)) {
						throw new Error('Binding sink must be an observable property. ' + sink);
					}

					sink["set"](source["get"]());

					switch (type) {
					case 'oneway':
						subscription = source["subscribe"](function () {
							sink["set"](source["get"]());
						});
						subscriptions.push(subscription);
						break;
					case 'twoway':
						subscription = source["subscribe"](function () {
							sink["set"](source["get"]());
						});
						subscriptions.push(subscription);

						subscription = sink["subscribe"](function () {
							source["set"](sink["get"]());
						});
						subscriptions.push(subscription);
						break;
					}

					subscription = null;

					return {
						"type": function () {
							return type;
						},
						"source": function () {
							return source;
						},
						"sink": function () {
							return sink;
						},
						"dispose": function () {
							while (subscriptions.length) {
								subscriptions.pop()["dispose"]();
							}
						}
					};
				};

				makeBinding["interfce"] = {
					"type": 'function',
					"source": 'function',
					"sink": 'function',
					"dispose": 'function'
				};

				return makeBinding;
			}()),