(function (util, makeProperty, makeList, $) {
	'use strict';
	/*jslint  regexp: true*/
	/*global 'util', 'makeProperty', 'makeList', 'jQuery'*/

	var getPartials = function () {
			var partials = {};

			$('script[type="text/html"][id]').each(function () {
				var $this = $(this),
					id = $this.attr('id'),
					partial = $this.text();

				partials[id] = partial;
			});

			return partials;
		},
		removeOwningElement = function (text) {
			var i = text.indexOf('>'),
				k = text.lastIndexOf('<');

			return text.substring(i + 1, k);
		},
		makeRenderEngine2 = function (selector, model, render) {
			var $scope = selector ? $(selector) : $('body'),
				pattern = /\{\{.+\}\}/,
				properties = [],
				subEngines = [],
				partials = getPartials(),
				makeElementProperty = function ($element) {
					var nodeName = $element.prop('nodeName').toLowerCase(),
						type = $element.attr('type'),
						template,
						property;

					switch (nodeName) {
					case 'input':
						switch (type) {
						case 'button':
						case 'submit':
						case 'reset':
							template = $element.val();
							if (template.search(pattern) >= 0) {
								property = makeProperty(function () {
									return render(template, model, partials);
								});
								property.subscribe(function () {
									var value = property.get();
									$element.val(value ? value.toString() : '');
								});
							}
							break;
						case 'checkbox':
						case 'radio':
							template = $element.attr('data-checked');
							$element.removeAttr('data-checked');
							if (template.search(pattern) >= 0) {
								property = makeProperty(function () {
									return render(template, model, partials);
								});
								property.subscribe(function () {
									var deps = property.dependencies(),
										dep;

									if (deps.length === 1) {
										dep = deps[0];

										if (typeof dep === 'function') {
											$element.attr('checked', Boolean(dep()));
										} else if (util.object.adheresTo(dep, makeList.interfce)) {
											$element.attr('checked', dep.indexOf($element.val()) >= 0);
										}
									}
								});
								$element.bind('change.binding', function () {
									var deps = property.dependencies(),
										dep,
										i;

									if (deps.length === 1) {
										dep = deps[0];
										property.block();

										if (typeof dep === 'function') {
											dep($element.attr('checked'));
										} else if (util.object.adheresTo(dep, makeList.interfce)) {
											if ($element.attr('checked')) {
												dep.push($element.val());
											} else {
												dep.remove($element.val());
											}
										}

										property.unblock();
									}
								});
							}
							break;
						case 'hidden':
							template = $element.val();
							if (template.search(pattern) >= 0) {
								property = makeProperty(function () {
									return render(template, model, partials);
								});
								property.subscribe(function () {
									$element.val(property.get());
								});
							}
							break;
						}
						break;
					case 'button':
						template = $element.text();
						if (template.search(pattern) >= 0) {
							property = makeProperty(function () {
								return render(template, model, partials);
							});
							property.subscribe(function () {
								$element.text(property.get());
							});
						}
						break;
					default:
						template = $element.text();
						if (template.search(pattern) >= 0) {
							property = makeProperty(function () {
								return render(template, model, partials);
							});
							property.subscribe(function () {
								$element.text(property.get());
							});
							if ($element.attr('contenteditable') || $element.attr('data-contenteditable')) {
								$element.bind('blur.binding', function () {
									var deps = property.dependencies(),
										dep;

									if (deps.length === 1 && $element.attr('contenteditable')) {
										dep = deps[0];
										property.block();

										if (typeof dep === 'function') {
											dep($element.text());
										} else if (util.object.adheresTo(dep, makeList.interfce)) {
											dep.clear();
											dep.push($element.text());
										}

										property.unblock();
									}
								});
							}
						}
					}

					return property;
				},
				makeAttributeProperties = function ($element) {
					var key,
						template,
						property,
						properties = [],
						element = $element[0],
						// Data-based attributes since some attributes
						// get computed when rendered or some attributes
						// simply don't have a valid DOM counterpart.
						dataset = [
							'data-checked',
							'data-enabled',
							'data-disabled',
							'data-contenteditable',
							'data-visible'
						],
						makeTextBasedProperty = function (template, key, $element) {
							var property;

							if (template && template.search(pattern) >= 0) {
								property = makeProperty(function () {
									return render(template, model, partials);
								});

								property.subscribe(function () {
									$element.attr(key, property.get());
								});
							}

							return property;
						},
						makeBooleanBasedProperty = function (template, key, $element) {
							var property;

							if (template && template.search(pattern) >= 0) {
								property = makeProperty(function () {
									return render(template, model, partials);
								});
								property.subscribe(function () {
									var value = property.get();
									$element.attr(key, value !== 'false');
								});
							}

							return property;
						},
						makeEnabledProperty = function (template, $element) {
							var property;

							if (template && template.search(pattern) >= 0) {
								property = makeProperty(function () {
									return render(template, model, partials);
								});
								property.subscribe(function () {
									var value = property.get();
									$element.attr('disabled', !value || value === 'false');
								});
							}

							return property;
						},
						makeVisibleProperty = function (template, $element) {
							var property;

							if (template && template.search(pattern) >= 0) {
								property = makeProperty(function () {
									return render(template, model, partials);
								});
								property.subscribe(function () {
									var visible = Boolean(property.get());
									if (visible) {
										$element.show();
									} else {
										$element.hide();
									}
								});
							}

							return property;
						};

					for (key in element) {
						if (element.hasOwnProperty(key)) {
							property = null;
							template = element[key];
							template = template && typeof template.toString === 'function' ? template.toString() : '';
							property = makeTextBasedProperty(template, key, $element);

							if (property) {
								properties.push(property);
							}
						}
					}


					while (dataset.length) {
						property = null;
						key = dataset.pop();
						template = $element.attr(key);
						template = template && typeof template.toString === 'function' ? template.toString() : '';

						switch (key) {
						case 'enable':
							property = makeEnabledProperty(template, $element);
							break;
						case 'disabled':
						case 'checked':
						case 'contenteditable':
							property = makeBooleanBasedProperty(template, key.replace(/^data-/, ''), $element);
							break;
						case 'visible':
							property = makeVisibleProperty(template, $element);
							break;
						}

						if (property) {
							properties.push(property);
							$element.removeAttr(key);
						}
					}

					return properties;
				},
				makeTextElementProperty = function ($child) {
					var template = $child.text(),
						property;

					if (template.search(pattern) >= 0) {
						property = makeProperty(function () {
							return render(template, model, partials);
						});

						property.subscribe(function () {
							$child.replaceWith(property.get());
						});
					}

					return property;
				};

			$('*', $scope).each(function () {
				var $this = $(this);

				(function () {
					var child = $this[0].firstChild,
						$child,
						property,
						sectionBeginPattern = /\{\{(#|^)(.+?)\}\}/,
						sectionEndPattern = /\{\{\/(.+?)\}\}/,
						result,
						propertyName,
						$clones,
						engine;

					property = makeElementProperty($this);

					if (property) {
						properties.push(property);
					} else {
						while (child) {
							$child = $(child);

							if (child.nodeType === 3) {
								/*result = sectionBeginPattern.exec($child.text());

								// If this child contains a section or inverse section
								// token then we try to grab the entire section.
								if (result) {
									// Save the property name of the section.
									propertyName = result[2];
									child = child.nextSibling;
									$clones = $([]);

									// Look for the end section, cloning all nodes we
									// encounter along the way.
									while (child) {
										$child = $(child);
										result = sectionEndPattern.exec($child.text());

										// Found the end section with the same name.
										// NOTE: This does not take into account nested
										// sections with the same property name.
										if (result && result[1] === propertyName) {
											// TODO: Lump the clones under a single element
											engine = makeRenderEngine2($clones, model, render);
											subEngines.push(engine);
											engine.refresh();
										} else {
											if (child.nodeType === 1) {
												$clones.push($child.clone());
											} else if (child.nodeType === 3) {
												$clones.push($child.text());
											} else {
												$clones.push($child.html());
											}
										}
									}
								} else {*/
									property = makeTextElementProperty($child);
								//}

								if (property) {
									properties.push(property);
								}
							}
							child = child.nextSibling;
						}
					}
				}());
			});

			return {
				refresh: function () {
					var i,
						len = properties.length;

					for (i = 0; i < len; i += 1) {
						properties[i].notify();
					}

					for (i = 0; i < len; i += 1) {
						subEngines[i].refresh();
					}
				},
				dispose: function () {
					while (properties.length) {
						properties.pop().dispose();
					}
					while (subEngines.length) {
						subEngines.pop().dispose();
					}
					model = null;
					render = null;
					partials = null;
				}
			};
		},
		makeRenderEngine = function (selector, model, render) {
			var $elements = selector ? $(selector) : $('body'),
				partials = getPartials(),
				properties = [],
				wrappedModel = {};

			(function () {
				var key,
					wrap = function (o, propertyName, value) {
						var ret = value;

						if (util.object.adheresTo(value, makeProperty.interfce)) {
							ret = function () {
								var args = arguments;
								if (args.length) {
									value.call(o, args[0]);
								} else {
									return value.call(o);
								}
							};
						}

						return ret;
					};

				for (key in model) {
					if (model.hasOwnProperty(key)) {
						wrappedModel[key] = wrap(model, key, model[key]);
					}
				}
			}());

			$elements.each(function () {
				var $this = $(this),
					template = removeOwningElement($this.html()),
					property = makeProperty(function () {
						return render(template, model, partials);
					});

				property.subscribe(function () {
					$this.html(property.get());
				});
				property.dispose = (function (base) {
					return function () {
						base.call(this);
						$this = null;
						property = null;
						template = null;
					};
				}(property.dispose));
				properties.push(property);
			});

			return {
				refresh: function () {
					var i,
						property,
						len = properties.length;

					for (i = 0; i < len; i += 1) {
						property = properties[i];
						property.notify();
					}
				},
				dispose: function () {
					while (properties.length) {
						properties.pop().dispose();
					}
					model = null;
					render = null;
					partials = null;
				}
			};
		};

	return {
		makeRenderEngine: makeRenderEngine,
		makeRenderEngine2: makeRenderEngine2
	};
}(util, makeProperty, makeList, jQuery));