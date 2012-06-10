			makeObservableList = (function () {
				var makeObservableList = function () {
					var slice = ([]).slice,
						list = makeList.apply(undefined, slice.call(arguments)),
						itemSubscriptions = makeList(),
						observeItems = false,
						makeActionArgs = function (action, newStartingIndex, newItems, oldStartingIndex, oldItems) {
							newStartingIndex = parseInt(newStartingIndex, 10);
							oldStartingIndex = parseInt(oldStartingIndex, 10);

							return {
								"action": action,
								"newStartingIndex": isFinite(newStartingIndex) ? newStartingIndex : -1,
								"newItems": util.isArray(newItems) ? newItems : (newItems === null || newItems === undefined ? [] : [newItems]),
								"oldStartingIndex": isFinite(oldStartingIndex) ? oldStartingIndex : -1,
								"oldItems": util.isArray(oldItems) ? oldItems : (oldItems === null || oldItems === undefined ? [] : [oldItems])
							};
						},
						actions = {
							add: function (newStartingIndex, newItems) {
								list["notify"](makeActionArgs('add', newStartingIndex, newItems));
							},
							remove: function (oldStartingIndex, oldItems) {
								list["notify"](makeActionArgs('remove', null, null, oldStartingIndex, oldItems));
							},
							replace: function (newStartingIndex, newItems, oldStartingIndex, oldItems) {
								list["notify"](makeActionArgs('replace', newStartingIndex, newItems, oldStartingIndex, oldItems));
							},
							move: function (newStartingIndex, newItems, oldStartingIndex, oldItems) {
								list["notify"](makeActionArgs('move', newStartingIndex, newItems, oldStartingIndex, oldItems));
							},
							reset: function () {
								list["notify"](makeActionArgs('reset'));
							},
							change: function (index, item) {
								list["notify"](makeActionArgs('change', index, item, index, item));
							}
						},
						itemSubscriptionFindCallback = function (s) {
							var item = itemSubscriptionFindCallback.item;

							if (item !== null && item !== undefined) {
								return s["item"] === item;
							}
						},
						onItemChange = function (item) {
							var i = list.indexOf(item);

							if (i >= 0) {
								actions.change(i, item);
							}
						},
						subscribeToItems = function () {
							var args = slice.call(arguments),
								len = args.length,
								isArray = util.isArray,
								arg,
								i;

							for (i = 0; observeItems && i < len; i += 1) {
								arg = args[i];

								if (isArray(arg)) {
									subscribeToItems.apply(undefined, arg);
								} else if (typeof arg["subscribe"] === 'function') {
									itemSubscriptions.push({"item": arg, "subscription": arg["subscribe"](onItemChange)});
								}
							}
						},
						unsubscribeFromItems = function () {
							var args = slice.call(arguments),
								len = args.length,
								isArray = util.isArray,
								arg,
								s,
								i;

							for (i = 0; observeItems && i < len; i += 1) {
								arg = args[i];

								if (isArray(arg)) {
									unsubscribeFromItems.apply(undefined, arg);
								} else if (typeof arg["subscribe"] === 'function') {
									itemSubscriptionFindCallback.item = arg;
									s = itemSubscriptions["first"](itemSubscriptionFindCallback);

									if (s !== undefined) {
										itemSubscriptions["remove"](s);

										if (s["subscription"] && typeof s["subscription"]["dispose"] === 'function') {
											s["subscription"]["dispose"]();
										}
									}
								}
							}

							itemSubscriptionFindCallback.item = null;
						},
						unsubscribeFromAllItems = function () {
							var s;

							while (itemSubscriptions.length) {
								s = itemSubscriptions.pop();

								if (s["subscription"] && typeof s["subscription"]["dispose"] === 'function') {
									s["subscription"]["dispose"]();
								}

								s["item"] = null;
								s["subscription"] = null;
							}
						};

					util.mixin(list, makeObservable());

					// Determines if the items in the list will be observed for changes.
					// This only applies to items with a subscribe function (i.e. implements Observable).
					list["observeItems"] = function (value) {
						if (arguments.length && value !== observeItems) {
							// For sanity we unsubscribe from all items first.
							unsubscribeFromAllItems();

							observeItems = value;

							// After our flag has been set then we subscribe to our items.
							// This is because the subscription functions won't do anything
							// unless we are observing the items.
							subscribeToItems(this);
						}

						return observeItems;
					};

					// remove() does not need to be overridden because internally it
					// calls splice(), which will issue notifications. The remove()
					// method will issue a notification of change for every item being removed.

					list["replaceAt"] = (function (base) {
						return function (index, newItem) {
							var oldItem;

							if (index >= 0 && index < this.length) {
								this["block"]();
								oldItem = base.call(this, index, newItem);
								unsubscribeFromItems(oldItem);
								subscribeToItems(newItem);
								this["unblock"]();

								actions.replace(index, newItem, index, oldItem);
							}

							return oldItem;
						};
					}(list["replaceAt"]));
					list["clear"] = (function (base) {
						return function () {
							var origLen = this.length;

							this["block"]();
							base.call(this);
							this["unblock"]();

							if (origLen !== this.length) {
								unsubscribeFromAllItems();
								actions.reset();
							}
						};
					}(list["clear"]));
					list["collapse"] = (function (base) {
						return function () {
							var origLen = this.length;

							this["block"]();
							base.call(this);
							this["unblock"]();

							if (origLen !== this.length) {
								actions.reset();
							}
						};
					}(list["collapse"]));
					list["insert"] = (function (base) {
						return function (index, item) {
							this["block"]();
							var insertedIndex = base.call(this, index, item);
							this["unblock"]();

							if (insertedIndex !== false) {
								actions.add(insertedIndex, item);
								subscribeToItems(item);
							}

							return insertedIndex;
						};
					}(list["insert"]));
					list["mergeWith"] = (function (base) {
						return function (otherList, equals, changed) {
							var operators,
								d,
								i,
								len,
								diff,
								notifications = [];

							this["block"]();

							operators = makeList["getItemOperators"](this);
							d = this["compare"](otherList, equals, changed);
							len = d.length;

							for (i = 0; i < len; i += 1) {
								diff = d[i];

								switch (diff["status"]) {
								case "added":
									subscribeToItems(diff["otherItem"]);
									notifications.push(makeActionArgs('add', diff["otherIndex"], diff["otherItem"]));

									if (this[diff["otherIndex"]] === undefined) {
										this[diff["otherIndex"]] = diff["otherItem"];
									} else {
										this.splice(diff["otherIndex"], 0, diff["otherItem"]);
									}
									break;
								case "deleted":
									unsubscribeFromItems(this[diff["index"]]);
									notifications.push(makeActionArgs('remove', null, null, diff["index"], diff["item"]));
									this[diff["index"]] = undefined;
									break;
								case "changed":
									unsubscribeFromItems(diff["item"]);
									subscribeToItems(diff["otherItem"]);

									// Move and a change.
									if (diff["index"] !== diff["otherIndex"]) {
										notifications.push(makeActionArgs('move', diff["otherIndex"], diff["otherItem"], diff["index"], diff["item"]));

										if (this[diff["otherIndex"]] === undefined) {
											this[diff["index"]] = undefined;
											this[diff["otherIndex"]] = diff["otherItem"];
										} else {
											this.splice(diff["index"], 1);
											this.splice(diff["otherIndex"], 0, diff["item"]);
										}
									// Just a change.
									} else {
										notifications.push(makeActionArgs("replace", diff["index"], diff["otherItem"], diff["index"], diff["item"]));
										this[diff["index"]] = diff["otherItem"];
									}
									break;
								case "retained":
									unsubscribeFromItems(diff["item"]);
									subscribeToItems(diff["otherItem"]);

									// Move.
									if (diff["index"] !== diff["otherIndex"]) {
										notifications.push(makeActionArgs('move', diff["otherIndex"], diff["otherItem"], diff["index"], diff["item"]));

										if (this[diff["otherIndex"]] === undefined) {
											this[diff["index"]] = undefined;
											this[diff["otherIndex"]] = diff["otherItem"];
										} else {
											this.splice(diff["index"], 1);
											this.splice(diff["otherIndex"], 0, diff["item"]);
										}
									} else {
										this[diff["index"]] = diff["otherItem"];
									}
									break;
								}
							}

							this["collapse"]();
							this["unblock"]();

							while (notifications.length) {
								this["notify"](notifications.shift());
							}
						};
					}(list["mergeWith"]));
					list["reverse"] = (function (base) {
						return function () {
							this["block"]();
							base.call(this);
							this["unblock"]();

							actions.reset();

							return this;
						};
					}(list["reverse"]));
					list["pop"] = (function (base) {
						return function () {
							var origLen = this.length,
								oldItem;

							this["block"]();
							oldItem = base.call(this);
							this["unblock"]();

							if (origLen !== this.length) {
								unsubscribeFromItems(oldItem);
								actions.remove(origLen - 1, oldItem);
							}

							return oldItem;
						};
					}(list["pop"]));
					list["push"] = (function (base) {
						return function () {
							var origLen = this.length,
								newItems = slice.call(arguments),
								newLength;

							this["block"]();
							newLength = base.apply(this, newItems);
							this["unblock"]();

							if (origLen !== newLength) {
								subscribeToItems(newItems);
								actions.add(origLen, newItems);
							}

							return newLength;
						};
					}(list["push"]));
					list["shift"] = (function (base) {
						return function () {
							var origLen = this.length,
								oldItem;

							this["block"]();
							oldItem = base.call(this);
							this["unblock"]();

							if (origLen !== this.length) {
								unsubscribeFromItems(oldItem);
								actions.remove(0, oldItem);
							}

							return oldItem;
						};
					}(list["shift"]));
					list["unshift"] = (function (base) {
						return function () {
							var origLen = this.length,
								newItems = slice.call(arguments),
								newLength;

							this["block"]();
							newLength = base.apply(this, newItems);
							this["unblock"]();

							if (origLen !== this.length) {
								subscribeToItems(newItems);
								actions.add(0, newItems);
							}

							return newLength;
						};
					}(list["unshift"]));
					list["sort"] = (function (base) {
						return function () {
							base.apply(this, slice.call(arguments));

							actions.reset();

							return this;
						};
					}(list["sort"]));
					list["splice"] = (function (base) {
						return function () {
							var origLen = this.length,
								args = slice.call(arguments),
								index = args.shift(),
								newItems,
								oldItems;

							// Remove the deleteCount argument.
							args.shift();

							newItems = args;
							index = parseInt(index, 10);
							index = isFinite(index) ? index : 0;

							if (index < 0) {
								index = 0;
							} else if (index > this.length) {
								index = this.length;
							}

							this["block"]();
							oldItems = base.apply(this, slice.call(arguments));
							this["unblock"]();

							if (origLen !== this.length) {
								if (newItems.length === 0 && oldItems.length !== 0) {
									unsubscribeFromItems(oldItems);
									actions.remove(index, oldItems);
								} else if (newItems.length !== 0 && oldItems.length === 0) {
									subscribeToItems(newItems);
									actions.add(index, newItems);
								} else {
									unsubscribeFromItems(oldItems);
									subscribeToItems(newItems);
									actions.replace(index, newItems, index, oldItems);
								}
							}

							return oldItems;
						};
					}(list["splice"]));

					return list;
				};

				makeObservableList["interfce"] = util.mixin({}, makeObservable["interfce"], makeList["interfce"]);

				return makeObservableList;
			}()),