"use strict";

if (self.IconifySearch === void 0) {
	self.IconifySearch = {};

	(function (search, global) {
		var local = {
			config: {},
			version: '1.0.0-dev'
		};

		
		(function(search, local, global) {
		
			var cache = {};
		
			/**
			 * Execute API request
			 *
			 * @param {object|null} obj
			 * @param {string} key Unique key
			 * @param {string} url
			 * @param {function} callback
			 * @param {string} [cacheKey]
			 */
			local.apiRequest = function(obj, key, url, callback, cacheKey) {
				var script;
		
				if (obj) {
					obj.lastCallback = key;
				}
		
				// Load from cache
				if (cacheKey !== void 0 && cache[cacheKey]) {
					window.setTimeout(function() {
						if (obj && obj.lastCallback !== key) {
							return;
						}
						callback(JSON.parse(cache[cacheKey]));
					}, 0);
					return;
				}
		
				// Callback
				search[key] = function(results) {
					if (cacheKey !== void 0) {
						local.setAPICache(cacheKey, results);
					}
					window.setTimeout(function() {
						if (obj && obj.lastCallback !== key) {
							return;
						}
						callback(results);
					}, 0);
				};
		
				// Send API request
				url = search.config.API + url + (url.indexOf('?') === -1 ? '?' : '&') + '&callback=' + encodeURIComponent('IconifySearch.' + key);
				script = document.createElement('script');
				script.setAttribute('type', 'text/javascript');
				script.setAttribute('src', url);
				script.setAttribute('async', 'true');
				document.head.appendChild(script);
			};
		
			/**
			 * Save cache
			 *
			 * @param key
			 * @param data
			 */
			local.setAPICache = function(key, data) {
				cache[key] = JSON.stringify(data);
			};
		
		})(search, local, global);

		(function(search, local, global) {
		
			/**
			 * Render UI icon
			 *
			 * @param {string} key
			 * @returns {string}
			 */
			local.renderUIIcon = function(key) {
				var data, html;
		
				if (!search.config.uiIcons[key]) {
					return '';
				}
		
				data = search.config.uiIcons[key];
		
				if (typeof data === 'string') {
					return '<span class="iconify" data-icon="' + data + '"></span>';
				}
		
				if (typeof data === 'object' && data.name) {
					html = '<span class="' + (data.className ? data.className : 'iconify') + '" data-icon="' + data.name + '"';
					Object.keys(data).forEach(function(key) {
						if (key !== 'name' && key !== 'className') {
							html += ' ' + key + '="' + data[key] + '"';
						}
					});
					return html + '></span>';
				}
		
				return '';
			};
		
			/**
			 * Render UI input decoration
			 *
			 * @param {string} key
			 * @returns {string}
			 */
			local.renderUIInputDecoration = function(key) {
				var html, parts;
		
				if (!search.config.uiDecorations[key]) {
					return '';
				}
		
				parts = search.config.uiDecorations[key];
				html = '<div class="is-input-deco is-input-deco--' + key.toLowerCase() + '">';
		
				Object.keys(parts).forEach(function(side) {
					html += '<div class="is-input-deco-part is-input-deco-part--' + side + '">' + parts[side] + '</div>';
				});
		
				html += '</div>';
				return html;
			};
		
		})(search, local, global);

		(function(search, local, global) {
		
			// Language variables
			var lang = {
				searchPlaceholder: 'Search all icons...',
				searchPlaceholderPrefixed: 'Search collection...',
				searchPlaceholderPrefixedNamed: 'Search {title}...',
				searchButton: 'Find Icons',
				searchCollectionButton: 'Search {title}',
				searchReset: 'Clear Search',
				statusSearching: 'Searching...',
				statusSearchingMore: 'Loading more search results...',
				statusEmpty: 'No icons to display.',
				statusEmptySearch: 'No icons found. Try different search term.',
				statusMaxResults: 'Too many search results. Showing only first {count} icons.',
				statusLoadingCollection: 'Loading collection...',
				paginationMore: 'Show more search results',
				displayingCollection: 'Displaying collection: {title}',
				displayingIcons0: 'No icons to display.',
				displayingIcons1: 'Displaying 1 icon:',
				displayingIcons: 'Displaying {count} icons:',
				displayingIconsMore: 'Displaying {count} icons (click second page to load more results):',
				displayingCallback: function(count, showMore) {
					switch (count) {
						case 0:
							return lang.displayingIcons0;
						case 1:
							return lang.displayingIcons1;
						default:
							return lang[showMore ? 'displayingIconsMore' : 'displayingIcons'].replace('{count}', showMore ? count / 2 : count);
					}
				},
				iconTooltipName: 'Icon name: {name}',
				iconTooltipCategory: 'Category: {category}',
				iconTooltipCharacter: 'Character: {char}',
				iconTooltipSize: 'Original size: {size}',
				iconTooltip: function(instance, icon, size) {
					var props = [
						lang.iconTooltipName.replace('{name}', icon)
					];
					if (instance.debug) {
						return '';
					}
					if (instance.categories && instance.categories[icon] && instance.categories[icon] !== lang.uncategorized) {
						props.push(lang.iconTooltipCategory.replace('{category}', instance.categories[icon]));
					}
					if (instance.chars && instance.chars[icon]) {
						props.push(lang.iconTooltipCharacter.replace('{char}', instance.chars[icon]));
					}
					if (size !== null) {
						props.push(lang.iconTooltipSize.replace('{size}', size));
					}
		
					return props.join('\n');
				},
				uncategorized: 'Uncategorized',
				rotateTitle: 'Rotate Icon',
				rotate0: 'Cancel rotation',
				rotate: 'Rotate {deg}',
				flipTitle: 'Flip icon',
				hFlip: 'Flip horizontally',
				hFlipText: 'Horizontal',
				vFlip: 'Flip vertically',
				vFlipText: 'Vertical',
				footerButtons: {
					submit: 'Change',
					cancel: 'Close',
					clear: 'Clear'
				},
				poweredBy: 'Powered by <a href="https://iconify.design/">Iconify open source SVG framework</a>.'
			};
		
			// Configuration
			search.config = {
				// Display configuration. Should be changed before creating overlay
				perPage: 48,
				maxCategoryIndex: 10,
				maxResults: 500, // 999 is maximum returned by API
		
				// API URL
				API: '//api.iconify.design',
		
				// Language variables
				lang: lang,
		
				// Layout stuff
				compactWidth: 700,
		
				// Decorations. Will be replaced with SVG during build
				uiDecorations: {
					inputSVG: {
						mid: '<svg width="16" height="44" viewBox="0 0 16 44" preserveAspectRatio="none"><path d="M-3 1v42h22V1H-3z" class="is-input-path"/></svg>',
						left: '<svg width="16" height="44" viewBox="0 0 16 44"><path d="M12.594 1L1.139 22l11.455 21H19V1h-6.406z" class="is-input-path"/></svg>',
						right: '<svg width="16" height="44" viewBox="0 0 16 44"><path d="M-3 1v42H7.3l7.636-21L7.3 1H-3z" class="is-input-path"/></svg>'
					},
				},
		
				// Icons used for interface
				uiIcons: {
					searchInput: {
						name: 'arty-animated:16-search',
						className: 'iconify arty-animated',
						'data-flip': 'horizontal'
					},
					searchReset: {
						name: 'arty-animated:16-close',
						className: 'iconify arty-animated'
					},
					searchDefaultButton: {
						name: 'arty-animated:16-search',
						className: 'iconify arty-animated',
						'data-flip': 'horizontal'
					},
					gridFilter: 'arty-animated:24-grid-3-outline',
					gridSelectedFilter: {
						name: 'arty-animated:24-grid-3',
						className: 'iconify arty-animated'
					},
					listFilter: 'arty-animated:24-list-3-outline',
					listSelectedFilter: {
						name: 'arty-animated:24-list-3',
						className: 'iconify arty-animated'
					},
					rotate0: {
						name: 'arty-animated:16-close',
						className: 'iconify arty-animated'
					},
					rotate1: {
						name: 'arty-animated:16-arc-90',
						className: 'iconify arty-animated'
					},
					rotate2: {
						name: 'arty-animated:16-arc-180',
						className: 'iconify arty-animated'
					},
					rotate3: {
						name: 'arty-animated:16-arc-270',
						className: 'iconify arty-animated'
					},
					hFlip: {
						name: 'arty-animated:16-double-arrow-horizontal',
						className: 'iconify arty-animated'
					},
					vFlip: {
						name: 'arty-animated:16-double-arrow-vertical',
						className: 'iconify arty-animated'
					}
				},
		
				// Functions
				/**
				 * Link for icons. Overwrite with custom function
				 *
				 * @param {string} icon
				 * @returns {string}
				 */
				iconLink: function(icon) {
					var split = icon.split(':');
					if (split.length === 1) {
						split = icon.split('-');
					}
					return 'https://iconify.design/icon-sets/' + split.shift() + '/' + split.join('-') + '.html';
				},
		
				/**
				 * Link for collection. Overwrite with custom function
				 *
				 * @param {string} prefix
				 * @returns {string} Collection link
				 */
				collectionLink: function(prefix) {
					return 'https://iconify.design/icon-sets/' + prefix + '/';
				},
			};
		
			// Get/set language variables
			search.setLang = function(changes) {
				Object.assign(lang, changes);
			};
			search.getLang = function(key) {
				return lang[key];
			};
		
		})(search, local, global);

		(function(search, local, global) {
		
			/**
			 * Get empty icon data
			 *
			 * @return {{icon: null, rotate: number, hFlip: boolean, vFlip: boolean}}
			 */
			search.emptyIcon = function() {
				return {
					icon: null,
					rotate: 0,
					hFlip: false,
					vFlip: false,
					extraClasses: ''
				};
			};
		
			/**
			 * Remove prefix from icon
			 *
			 * @param icon
			 * @return {string}
			 */
			local.removePrefix = function(icon) {
				var parts = icon.split(':');
				if (parts.length > 1) {
					parts.shift();
					return parts.join(':');
				}
				parts = icon.split('-');
				parts.shift();
				return parts.join('-');
			};
		
			/**
			 * Split value
			 *
			 * @param {string} value
			 * @param {object} [params]
			 * @return {{icon: null|string, rotate: number, hFlip: boolean, vFlip: boolean}}
			 */
			search.valueFromString = function(value, params) {
				var result = search.emptyIcon();
		
				params = typeof params === 'object' ? params : {};
		
				value.trim().split(/\s+/).forEach(function(value, index, values) {
					var parts = value.split(':');
		
					if (values.length === 1) {
						// If it has one item - assume its a value
						if (parts.length === 1) {
							if (params.prefix && !params.valueHasPrefix) {
								result.icon = params.prefix + ':' + value;
								return;
							}
							parts = value.split('-');
							if (parts.length < 2) {
								return;
							}
							result.icon= parts.shift() + ':' + parts.join('-');
							return;
						}
					}
		
					if (parts.length === 1) {
						// Invalid string?
						return;
					}
		
					switch (parts[0]) {
						case 'icon':
							parts.shift();
							if (parts.length === 1) {
								parts = parts[0].split('-');
								if (parts.length > 1) {
									result.icon = parts.shift() + ':' + parts.join('-');
								}
								return;
							}
							if (parts.length === 2) {
								result.icon = parts.join(':');
							}
							return;
		
						case 'icon-rotate':
							if (parts.length !== 2) {
								return;
							}
							switch (parts.pop().toLowerCase()) {
								case '90deg':
								case '25%':
								case '1':
									result.rotate = 1;
									break;
		
								case '180deg':
								case '50%':
								case '2':
									result.rotate = 2;
									break;
		
								case '270deg':
								case '75%':
								case '3':
									result.rotate = 3;
									break;
							}
							return;
		
						case 'icon-flip':
							if (parts.length !== 2) {
								return;
							}
							parts.pop().toLowerCase().split(/[\s,]+/).forEach(function(flip) {
								switch (flip) {
									case 'horizontal':
										result.hFlip = true;
										break;
		
									case 'vertical':
										result.vFlip = true;
								}
							});
							return;
					}
		
					if (parts.length === 2 && parts[0].slice(0, 5) === 'icon-') {
						result.extraClasses += ' ' + parts.join(':');
						return;
					}
		
					// Icon name
					if (parts.length === 2) {
						result.icon = parts.join(':');
						return;
					}
		
					result.extraClasses += ' ' + parts.join(':');
				});
		
				return result;
			};
		
			/**
			 * Convert value to class string
			 *
			 * @param {object} value
			 * @return {string}
			 */
			search.valueToClass = function(value) {
				var result;
				if (!value.icon) {
					return '';
				}
		
				result = 'icon:' + value.icon;
		
				if (value.rotate) {
					result += ' icon-rotate:' + (value.rotate * 90) + 'deg';
				}
				if (value.hFlip) {
					result += ' icon-flip:horizontal' + (value.vFlip ? ',vertical' : '');
				} else if (value.vFlip) {
					result += ' icon-flip:vertical';
				}
		
				if (value.extraClasses) {
					result += ' ' + value.extraClasses.trim();
				}
		
				return result;
			};
		
			/**
			 * Convert value to attributes list
			 *
			 * @param {object} value
			 * @param {string} [classes] Classes to add
			 * @param {boolean} [returnAsString] If true, result will be string
			 * @return {string|object}
			 */
			search.valueToAttributes = function(value, classes, returnAsString) {
				var attr = {},
					result;
		
				if (!value.icon) {
					return returnAsString ? '' : attr;
				}
		
				if (typeof classes !== 'string') {
					classes = 'iconify';
				}
				attr['class'] = classes.trim();
				if (value.extraClasses) {
					attr['class'] += (attr['class'].length ? ' ' : '') + value.extraClasses.trim();
				}
		
				attr['data-icon'] = value.icon;
		
				if (value.rotate) {
					attr['data-rotate'] = (value.rotate * 90) + 'deg';
				}
				if (value.hFlip) {
					attr['data-flip'] = 'horizontal' + (value.vFlip ? ',vertical' : '');
				} else if (value.vFlip) {
					attr['data-flip'] = 'vertical';
				}
		
				if (returnAsString) {
					result = '';
					Object.keys(attr).forEach(function(key, index) {
						result += (index ? ' ' : '') + key + '="' + attr[key] + '"';
					});
					return result;
				}
		
				return attr;
			};
		
		})(search, local, global);

		(function(search, local, global) {
		
			/**
			 * Create new overlay
			 *
			 * @param $parent
			 * @param {object} params
			 * @return {object}
			 * @constructor
			 */
			local.Overlay = function($parent, params) {
				var _compact = false,
					obj = {
						// Main stuff
						_destroyed: false,
						_visible: false,
						_created: false,
						_$parent: $parent,
						_$root: null,
		
						// Search results
						_allIcons: [],
						_icons: [],
						_categories: null,
						_chars: null,
						_pendingSearch: 0,
		
						// Currently visible items
						_currentView: null,
						_notice: null,
						_visibleIcons: [],
						_pendingIcons: [],
						_icon: search.emptyIcon(),
		
						// Search forms
						_resetVisible: {},
						_searchThrottled: false,
					},
					defaultParams;
		
				/**
				 * Check width to toggle compact layout
				 */
				obj.checkWidth = function() {
					var width, compact;
		
					if (obj._destroyed) {
						return;
					}
		
					width = Math.min(obj._$parent.offsetWidth, obj._$root.offsetWidth);
					compact = width < search.config.compactWidth;
					if (compact !== _compact) {
						obj._$root.classList[compact ? 'add' : 'remove']('is-root--compact');
						_compact = compact;
					}
				};
		
				/**
				 * Show overlay
				 */
				obj.show = function() {
					if (obj._visible || obj._destroyed) {
						return;
					}
		
					if (obj.sendEvent('show') === false) {
						return;
					}
		
					// Hide other overlays
					local.listOverlays().forEach(function(overlay) {
						if (overlay.visible) {
							overlay.hide();
						}
					});
		
					// Show
					obj._$root.classList.remove('is-root--hidden');
					obj._visible = true;
		
					obj.refresh();
		
					obj.checkWidth();
					setTimeout(function() {
						obj.checkWidth();
					}, 500);
				};
		
				/**
				 * Hide overlay
				 */
				obj.hide = function() {
					if (!obj._created || obj._destroyed || !obj._visible) {
						return;
					}
		
					if (obj.sendEvent('hide') === false) {
						return;
					}
		
					// Hide
					obj._visible = false;
					obj._$root.classList.add('is-root--hidden');
				};
		
				/**
				 * Destroy overlay
				 */
				obj.destroy = function() {
					if (obj._destroyed) {
						return;
					}
		
					obj.sendEvent('destroy');
		
					obj._destroyed = true;
					obj._$root.remove();
					local.removeOverlay(obj);
					document.removeEventListener('IconifyAddedIcons', obj.iconifyEvent);
				};
		
				/**
				 * Send event to caller
				 *
				 * @param event
				 * @param [data]
				 */
				obj.sendEvent = function(event, data) {
					if (obj._callback === null) {
						return;
					}
		
					// Call callback
					return obj._callback.call(null, event, data);
				};
		
				/**
				 * Get icon data for event
				 *
				 * @param icon
				 * @return {object}
				 */
				obj.sendEventIcon = function(icon) {
					var result = Object.assign({}, icon),
						prefix = result.icon.split(':');
		
					if (prefix.length < 2) {
						prefix = result.icon.split('-');
					}
					result.prefix = prefix.shift();
					result.name = result.icon.slice(result.prefix.length + 1);
					result.prefixTitle = local.getCollectionTitle(result.prefix, result.prefix);
		
					return result;
				};
		
				/**
				 * Event handler for "IconifyAddedIcons" that is fired when Iconify receives new icons
				 */
				obj.iconifyEvent = function() {
					var updated = [],
						pending = [],
						i;
		
					if (obj.footerRequiresUpdate() !== null) {
						obj.updateFooter();
					}
		
					if (obj._destroyed || !obj._pendingIcons.length) {
						return;
					}
		
					// Find updated icons
					obj._pendingIcons.forEach(function(icon) {
						if (Iconify.iconExists(icon)) {
							updated.push(icon);
						} else {
							pending.push(icon);
						}
					});
		
					if (!updated.length) {
						return;
					}
		
					// Refresh icons list
					obj._pendingIcons = pending;
					obj.updatePendingIcons();
				};
		
				/**
				 * Update value
				 *
				 * @param params
				 */
				obj.updateValue = function(params) {
					var result;
		
					if (params.value === void 0) {
						return;
					}
		
					if (typeof params.value === 'object' && params.value.icon !== void 0) {
						result = Object.assign({}, params.value);
					} else {
						result = search.valueFromString(params.value, params);
					}
					if (!result.icon) {
						return;
					}
		
					// Set new values
					obj._icon = result;
		
					// Load icon if needed
					if (obj._icon.icon && !Iconify.iconExists(obj._icon.icon)) {
						Iconify.preloadImages([obj._icon.icon]);
					}
		
					// Refresh
					if (obj._created) {
						obj.refresh();
					}
				};
		
				// Default params
				defaultParams = {
					append: false,
					overlay: true,
					page: 0,
					perPage: search.config.perPage,
					listView: false,
					showViewModes: true,
					hidePrefix: false,
					showSize: true,
					fancySearch: true,
					poweredBy: true,
					prefix: null,
					defaultPrefix: null,
					footer: null,
					callback: null,
					useForm: true
				};
		
				// Expand params
				params = typeof params === 'object' ? params : {};
				Object.keys(defaultParams).forEach(function(key) {
					obj['_' + key] = params[key] === void 0 ? defaultParams[key] : params[key];
				});
		
				// Create root node
				obj._$root = document.createElement('div');
				obj._$root.className = 'is-root is-root--hidden' + (obj._append ? '' : ' is-root--temporary');
		
				if (!obj._append) {
					obj._updatePlaceholder = true;
					obj._$parent.innerHTML = '<div class="is-root--old">' + obj._$parent.innerHTML + '</div>';
				}
				obj._$parent.appendChild(obj._$root);
		
				// Set value
				obj.updateValue(params);
		
				// Check other parameters
				if (obj._prefix === null) {
					obj._hidePrefix = false;
				}
				obj._defaultPrefix = obj._prefix;
		
				// Add event handler for "IconifyAddedIcons" event that is fired when Iconify receives new icons
				document.addEventListener('IconifyAddedIcons', obj.iconifyEvent);
		
				// Check prefix stuff, get collections index on first overlay load
				if (obj._prefix === null) {
					local.getCollections();
				}
		
				// Preload selected image or it won't show
				if (obj._icon.icon) {
					Iconify.preloadImages([obj._icon.icon]);
				}
		
				// Show form automatically if query or selected icon are present
				if (params.show === true || obj._icon.icon || (typeof params.query === 'string' && params.query.length)) {
					setTimeout(function() {
						var query = typeof params.query === 'string' && params.query.length ? params.query : null;
		
						obj.show();
		
						if (obj._prefix !== null) {
							obj.loadCollection(obj._prefix, function() {
								if (query !== null) {
									obj.search(query);
								}
							});
						} else if (query) {
							obj.search(query);
						}
					}, 0);
				}
		
				return obj;
			};
		
		})(search, local, global);

		(function(search, local, global) {
		
			var overlays = [],
				resizeThrottled = false;
		
			/**
			 * Find overlay
			 *
			 * @param $parent Parent node
			 * @return {object|null}
			 */
			local.findOverlay = function($parent) {
				for (var i = 0; i < overlays.length; i++) {
					if (overlays[i]._$parent === $parent) {
						return overlays[i];
					}
				}
				return null;
			};
		
			/**
			 * Create overlay
			 *
			 * @param $parent
			 * @param params
			 * @return {object}
			 */
			local.createOverlay = function($parent, params) {
				var overlay = local.Overlay($parent, params);
				overlays.push(overlay);
				return overlay;
			};
		
			/**
			 * Remove overlay from list
			 *
			 * @param overlay
			 */
			local.removeOverlay = function(overlay) {
				overlays = overlays.filter(function(item) {
					return item !== overlay;
				});
			};
		
			/**
			 * Get list of active overlays
			 *
			 * @return {Array}
			 */
			local.listOverlays = function() {
				return overlays;
			};
		
			/**
			 * Resize all visible overlays
			 */
			local.resizeOverlays = function() {
				overlays.forEach(function(overlay) {
					if (overlay._visible) {
						overlay.checkWidth();
					}
				});
			};
		
			/**
			 * Add onresize event listener
			 */
			window.addEventListener('resize', function() {
				if (resizeThrottled) {
					return;
				}
				resizeThrottled = true;
				window.setTimeout(function() {
					local.resizeOverlays();
					resizeThrottled = false;
				}, 200);
			});
		
		
		})(search, local, global);

		(function(search, local, global) {
		
			var createOverlay = local.Overlay;
		
			/**
			 * Create new overlay
			 *
			 * @param $parent
			 * @param {object} params
			 * @return {object}
			 * @constructor
			 */
			local.Overlay = function($parent, params) {
				var obj = createOverlay($parent, params),
					lang = search.config.lang;
		
				obj._activeCategory = null;
				obj._categories = null;
		
				/**
				 * Update category filter
				 */
				obj.updateCategoryFilter = function() {
					var maxPage, index;
		
					// Filter icons
					if (obj._activeCategory === null) {
						obj._icons = obj._allIcons.slice(0);
					} else {
						obj._icons = obj._categories[obj._activeCategory].slice(0);
					}
		
					// Update page
					maxPage = obj.maxPage() - 1;
					if (obj._icon.icon) {
						index = obj._icons.indexOf(obj._icon.icon);
						if (index !== -1) {
							obj._page = Math.floor(index / obj._perPage);
						}
					}
					obj._page = Math.max(Math.min(obj._page, maxPage), 0);
		
					obj.updateCounter();
					obj.updateCategories();
					obj.updatePagination();
					obj.updateIcons();
				};
		
				/**
				 * Show specific category
				 *
				 * @param {string|null} category Null to show all categories or category title
				 */
				obj.showCategory = function(category) {
					if (obj._categories === null) {
						return;
					}
		
					if (category === null) {
						// Show all categories
						if (!obj._activeCategory === null) {
							return;
						}
						obj.setActiveCategory(null);
						return;
					}
		
					// Toggle category
					if (obj._categoryIndex[category] === void 0 || obj._activeCategory === category) {
						return;
					}
		
					obj.setActiveCategory(category);
				};
		
				/**
				 * Update categories HTML
				 */
				obj.updateCategories = function() {
					var html, i, cat, items;
		
					if (obj._categories === null) {
						obj._$nodes.categories.innerHTML = '';
						obj._$nodes.categories.classList.add('is-categories--hidden');
						return;
					}
		
					html = '';
					items = Object.keys(obj._categoryIndex);
					for (i = 0; i < items.length; i++) {
						cat = items[i];
						html += '<a href="javascript:void(0)" class="is-category-' + (obj._activeCategory === null || obj._activeCategory === cat ? 'visible' : 'hidden') + '" data-category="' + cat + '">' + cat + '</a>';
					}
		
					obj._$nodes.categories.innerHTML = html;
					obj._$nodes.categories.classList.remove('is-categories--hidden');
				};
		
				/**
				 * Categories block clicked
				 *
				 * @param event
				 */
				obj.categoriesClicked = function(event) {
					var category;
		
					if (event.target.tagName !== 'A') {
						return;
					}
		
					category = event.target.innerText.trim();
		
					event.preventDefault();
					event.stopPropagation();
		
					// Toggle category
					if (obj._categoryIndex[category] === void 0) {
						return;
					}
		
					obj.setActiveCategory(obj._activeCategory === category ? null : category);
				};
		
				/**
				 * Set active category
				 *
				 * @param category
				 */
				obj.setActiveCategory = function(category) {
					if (obj._currentView && obj._currentView.type === 'search' && obj._prefix) {
						obj.resetSearchInput(obj._collectionsBlockVisible ? 'search2' : 'search');
						obj.restoreCollection();
					}
		
					if (obj._activeCategory !== category) {
						obj._activeCategory = category;
						obj.updateCategoryFilter();
					}
				};
		
				return obj;
			};
		
		})(search, local, global);

		(function(search, local, global) {
		
			var createOverlay = local.Overlay,
				requestedCollections = false;
		
			/**
			 * Create new overlay
			 *
			 * @param $parent
			 * @param {object} params
			 * @return {object}
			 * @constructor
			 */
			local.Overlay = function($parent, params) {
				var obj = createOverlay($parent, params),
					lang = search.config.lang;
		
				/**
				 * Display entire collection
				 *
				 * @param {object} data
				 */
				obj.loadCollectionData = function(data) {
					var prefix = data.prefix,
						icons = data.icons;
		
					if (obj._destroyed || !obj._created) {
						return;
					}
		
					obj._currentView = {
						type: 'collection',
						prefix: prefix
					};
					obj._prefix = prefix;
					obj._pendingSearch = 0;
					obj._notice = null;
		
					// Check categories and characters
					obj._chars = data.chars;
					obj._categories = null;
					obj._iconCategories = null;
					obj._categoryIndex = {};
					obj._activeCategory = null;
					if (data.categories) {
						obj._categories = {};
						obj._iconCategories = {};
		
						// Get categories list, index each category
						Object.keys(data.categories).forEach(function(cat, index) {
							obj._categoryIndex[cat] = index % search.config.maxCategoryIndex + 1;
							obj._categories[cat] = data.categories[cat].slice(0);
							data.categories[cat].forEach(function(icon) {
								if (obj._iconCategories[icon] === void 0) {
									obj._iconCategories[icon] = [cat];
								} else {
									obj._iconCategories[icon].push(cat);
								}
							});
						});
		
						// Check for uncategorized icons
						if (data.uncategorized && data.uncategorized.length) {
							obj._categoryIndex[lang.uncategorized] = Object.keys(data.categories).length % search.config.maxCategoryIndex + 1;
							obj._categories[lang.uncategorized] = data.uncategorized.slice(0);
						}
					}
		
					// Send event
					if (obj._defaultPrefix === null) {
						obj.sendEvent('collection', {
							prefix: prefix,
							prefixTitle: local.getCollectionTitle(prefix, prefix)
						});
					}
		
					// Set icons
					obj.updateCollectionBlock();
					obj.resetSearchInput(obj._collectionsBlockVisible ? 'search2' : 'search');
					obj.displayIcons(icons);
					obj.updateFooter(true);
				};
		
				/**
				 * Restore collection
				 */
				obj.restoreCollection = function() {
					if (obj._prefix && local._collectionData && local._collectionData[obj._prefix]) {
						obj.loadCollectionData(local._collectionData[obj._prefix]);
					}
				};
		
				/**
				 * Load and display collection
				 *
				 * @param {string} prefix
				 * @param {function} [callback] Callback to call when collection has been loaded
				 */
				obj.loadCollection = function(prefix, callback) {
					if (local._collectionData && local._collectionData[prefix]) {
						obj.loadCollectionData(local._collectionData[prefix]);
						if (callback) {
							callback();
						}
						return;
					}
		
					obj._notice = lang.statusLoadingCollection;
					obj.updateCounter();
		
					// Load collection from API
					local.apiRequest(obj, 'search_' + prefix.replace(/-/g, '_'), '/list-icons-categorized?prefix=' + prefix, function(results) {
						obj.loadCollectionData(local.saveCollectionData(results));
						if (callback && !obj._destroyed) {
							callback();
						}
					}, 'collection-' + prefix);
				};
		
				/**
				 * Update collection block
				 */
				obj.updateCollectionBlock = function() {
					var visible = obj._prefix !== null && obj._defaultPrefix === null,
						wasVisible = obj._collectionsBlockVisible === void 0 ? false : obj._collectionsBlockVisible,
						title;
		
					if (!visible || (title = local.getCollectionTitle(obj._prefix, obj._prefix)) === null) {
						visible = false;
					}
					if (visible === wasVisible) {
						return;
					}
		
					obj._collectionsBlockVisible = visible;
					if (!visible) {
						obj._$nodes.collectionContainer.classList.add('is-current-collection--hidden');
						obj._$nodes.collectionContainer.innerHTML = '';
						obj._$nodes.search2.container.classList.add('is-search-form--hidden');
						obj._$nodes.search2.container.innerHTML = '';
						return;
					}
		
					obj._$nodes.collectionContainer.innerHTML = lang.displayingCollection.replace('{title}', title);
					obj._$nodes.collectionContainer.classList.remove('is-current-collection--hidden');
					obj._$nodes.search2.container.classList.remove('is-search-form--hidden');
					obj.rebuildSearchForm(true);
				};
		
				/**
				 * Link for category.
				 *
				 * @param category
				 * @returns {object|null}
				 */
				obj.categoryLink = function(category) {
					return {
						link: 'javascript:void(0)',
						title: category,
						data: category,
						// className is mandatory and must include "is-link-category"
						className: 'is-link-category is-index-' + obj._categoryIndex[category]
					};
				};
		
				return obj;
			};
		
			/**
			 * Functions for getting collection link
			 */
		
			// Cache for collection links
			local._collectionLinksCache = {};
		
			/**
			 * Get collection link and title
			 *
			 * @param {string} prefix
			 * @return {object}
			 */
			local.collectionLink = function(prefix) {
				var link, index;
		
				if (local._collectionLinksCache[prefix] !== void 0) {
					return local._collectionLinksCache[prefix];
				}
		
				link = {
					data: prefix,
					title: local.getCollectionTitle(prefix, prefix)
				};
		
				if (link.title === null) {
					return null;
				}
		
				if (local._collectionsInfo && local._collectionsInfo[prefix]) {
					index = local._collectionsInfo[prefix].index === void 0 ?
						Object.keys(local._collectionsInfo).indexOf(prefix) % search.config.maxCategoryIndex :
						local._collectionsInfo[prefix].index;
				} else {
					index = Object.keys(local._collectionLinksCache).length % search.config.maxCategoryIndex;
				}
		
				link.link = search.config.collectionLink(prefix);
				link.className = 'is-link-collection is-index-' + index;
		
				return local._collectionLinksCache[prefix] = link;
			};
		
			/**
			 * Get collection title
			 *
			 * @param prefix
			 * @param defaultValue
			 * @return {string|null}
			 */
			local.getCollectionTitle = function(prefix, defaultValue) {
				// Look in data cache
				if (local._collectionsInfo && local._collectionsInfo[prefix] && local._collectionsInfo[prefix].name !== void 0) {
					return local._collectionsInfo[prefix].name;
				}
		
				// Look in collections cache
				if (local._collectionData && local._collectionData[prefix] && local._collectionData[prefix].title !== void 0) {
					return local._collectionData[prefix].title;
				}
		
				return defaultValue;
			};
		
			/**
			 * Send API request for collections list
			 */
			local.getCollections = function() {
				if (requestedCollections) {
					return;
				}
				requestedCollections = true;
				local.apiRequest(null, 'collections', '/collections', function(results) {
					local._collectionsInfo = results;
				}, 'collections');
			};
		
		
			/**
			 * Save collection data
			 *
			 * @param {object} data
			 * @returns {object}
			 */
			local.saveCollectionData = function(data) {
				var icons = {},
					chars;
		
				// Add prefix to all icons and list all icons
				if (data.uncategorized && data.uncategorized.length) {
					data.uncategorized = data.uncategorized.map(function(icon) {
						return data.prefix + ':' + icon;
					});
					data.uncategorized.forEach(function(icon) {
						icons[icon] = true;
					});
				}
				if (data.categories) {
					Object.keys(data.categories).forEach(function(category) {
						data.categories[category] = data.categories[category].map(function(icon) {
							return data.prefix + ':' + icon;
						});
						data.categories[category].forEach(function(icon) {
							icons[icon] = true;
						});
					});
				}
		
				icons = Object.keys(icons);
				icons.sort(function(a, b) {
					return a.localeCompare(b);
				});
				data.icons = icons;
		
				// Characters map
				if (data.chars) {
					chars = {};
					Object.keys(data.chars).forEach(function(char) {
						var icon = data.prefix + ':' + data.chars[char];
						chars[icon] = char;
					});
					data.chars = chars;
				} else {
					data.chars = null;
				}
		
				// Cache collection data
				if (local._collectionData === void 0) {
					local._collectionData = {};
				}
				local._collectionData[data.prefix] = data;
		
				return data;
			};
		
			/**
			 * Set collection data cache to avoid requesting it from API
			 *
			 * @param data
			 */
			search.cacheCollectionData = function(data) {
				local.saveCollectionData(data);
			};
		
			/**
			 * Cache collections info
			 *
			 * @param data
			 */
			search.cacheCollectionsInfo = function(data) {
				local._collectionsInfo = data;
			};
		
		})(search, local, global);

		(function(search, local, global) {
		
			var createOverlay = local.Overlay;
		
			/**
			 * Create new overlay
			 *
			 * @param $parent
			 * @param {object} params
			 * @return {object}
			 * @constructor
			 */
			local.Overlay = function($parent, params) {
				var obj = createOverlay($parent, params),
					lang = search.config.lang;
		
				/**
				 * Display icons
				 *
				 * @param {Array} icons
				 * @param {boolean} [keepPages]
				 */
				obj.displayIcons = function(icons, keepPages) {
					obj._allIcons = icons.slice(0);
					obj._icons = icons.slice(0);
					obj._pendingSearch = 0;
					obj._notice = null;
					if (keepPages !== true) {
						obj._page = 0;
					}
		
					obj.refresh();
				};
		
				/**
				 * Refresh display
				 */
				obj.refresh = function() {
					if (obj._destroyed) {
						return;
					}
					if (!obj._created) {
						obj.buildStructure();
					}
		
					obj.updateLayoutsFilter();
					obj.updateCounter();
					obj.updatePagination();
					obj.updateIcons();
					obj.updateCategories();
					obj.updateFooter();
		
					if (!obj._icons.length && !obj._notice) {
						obj._$nodes.resultsContainer.classList.add('is-search-results--hidden');
						obj._$nodes.poweredBy.classList.remove('is-powered-by--visible-icons');
					} else {
						obj._$nodes.resultsContainer.classList.remove('is-search-results--hidden');
						if (obj._poweredBy) {
							obj._$nodes.poweredBy.classList.add('is-powered-by--visible-icons');
						}
					}
		
					// Smooth change from placeholder to real search results
					if (obj._updatePlaceholder === true) {
						obj._updatePlaceholder = false;
						window.setTimeout(function() {
							var $children, $node, i;
		
							if (obj._destroyed) {
								return;
							}
		
							$children = obj._$root.parentNode.childNodes;
		
							for (i = $children.length - 1; i >= 0; i--) {
								$node = $children[i];
								if ($node !== obj._$root) {
									$node.remove();
								}
							}
							obj._$root.classList.remove('is-root--temporary');
						}, 0);
					}
				};
		
				/**
				 * Show empty results
				 */
				obj.showEmptyResults = function() {
					obj._icons = [];
					obj.refresh();
				};
		
				return obj;
			};
		
		})(search, local, global);

		(function(search, local, global) {
		
			var createOverlay = local.Overlay;
		
			/**
			 * Create new overlay
			 *
			 * @param $parent
			 * @param {object} params
			 * @return {object}
			 * @constructor
			 */
			local.Overlay = function($parent, params) {
				var obj = createOverlay($parent, params),
					lang = search.config.lang,
					defaultData = search.emptyIcon(),
					dataKeys = Object.keys(defaultData).slice(1);
		
				obj._footerHidden = true;
				obj._footerData = Object.assign({}, defaultData);
		
				/**
				 * Check if footer requires update
				 *
				 * @return {null}
				 */
				obj.footerRequiresUpdate = function() {
					var update = {},
						requireUpdate = false;
		
					update.icon = !obj._icon.icon || Iconify.iconExists(obj._icon.icon) ? obj._icon.icon : obj._footerData.icon;
					if (update.icon !== obj._footerData.icon) {
						requireUpdate = true;
					} else if (obj._footerData.icon === '') {
						// Icon is still empty - ignore transformations
						return null;
					}
		
					dataKeys.forEach(function(key) {
						if (obj._icon[key] !== obj._footerData[key]) {
							update.transform = true;
							requireUpdate = true;
						}
						update[key] = obj._icon[key];
					});
		
					return requireUpdate ? update : null;
				};
		
				/**
				 * Update footer HTML code
				 */
				obj.updateFooter = function(force) {
					var showFooter = obj._footer && obj._overlay,
						update = obj.footerRequiresUpdate();
		
					if (update === null && force) {
						update = obj._footerData;
					}
		
					if (update === null && (!obj._footerHidden || !showFooter)) {
						// Nothing to update
						return;
					}
		
					if ((update === null || !update.icon) && !showFooter) {
						if (obj._footerData.icon) {
							obj._footerHidden = true;
							obj._$nodes.footer.classList.add('is-footer--hidden');
							obj._$nodes.poweredBy.classList.remove('is-powered-by--visible-footer');
							obj._$nodes.footer.innerHTML = '';
						}
						obj._footerData.icon = '';
						return;
					}
		
					// Update code
					if (!obj._footer) {
						// Send event to caller. Assume submit if icon is set, cancel icon is empty
						if (obj._icon.icon) {
							obj.sendEvent('submit', obj.sendEventIcon(obj._icon));
						} else {
							obj.sendEvent('cancel');
						}
						obj._footerData = update === null ? obj._footerData : update;
						return;
					}
		
					// Generate footer again if value changes from/to empty
					if (!obj._footerData.icon) {
						// Show
						obj._footerHidden = false;
						obj.generateFooterHTML(update === null ? obj._footerData : update);
						obj._$nodes.footer.classList.remove('is-footer--hidden');
						if (obj._poweredBy) {
							obj._$nodes.poweredBy.classList.add('is-powered-by--visible-footer');
						}
					} else if (update !== null && (!update.icon || update.transform)) {
						// Was hidden before or transformation changed - update everything
						obj.generateFooterHTML(update);
					} else {
						// Old and new values are not empty - update only code
						obj.updateFooterHTML(update === null ? obj._footerData : update);
					}
					obj._footerData = update === null ? obj._footerData : update;
				};
		
				/**
				 * Generate footer HTML code
				 *
				 * @param {object} update Data to show
				 */
				obj.generateFooterHTML = function(update) {
					var transform = '',
						buttons = '',
						empty = !update.icon,
						buttonsList = empty ? ['cancel'] : ['submit', 'cancel', 'clear'],
						visibleButtons = [],
						rotations = [0, 1, 2, 3],
						flip = ['h', 'v'];
		
					if (!empty && obj._footer.transform) {
						// Flip
						transform += '<div class="is-footer-block is-footer-block--transform is-footer-block--flip"><span class="is-footer-block-title">' + lang.flipTitle + '</span>';
						flip.forEach(function(value) {
							transform += '<a href="javascript:void(0)" class="is-transformation is-transformation--flip is-transformation--flip--' + value + '" title="' + lang[value + 'Flip'] + '"></strong></a>';
						});
						transform += '</div>';
		
						// Rotations
						transform += '<div class="is-footer-block is-footer-block--transform is-footer-block--rotate"><span class="is-footer-block-title">' + lang.rotateTitle + '</span>';
						rotations.forEach(function(value) {
							var degrees = (value * 90) + '&deg;';
							transform += '<a href="javascript:void(0)" class="is-transformation is-transformation--rotate is-transformation--rotate--' + value + '" title="' + lang.rotate.replace('{deg}', degrees) + '"></a>';
						});
						transform += '</div>';
					}
		
					buttonsList.forEach(function(key) {
						if (obj._footer[key] === void 0 && (key === 'submit' || key === 'cancel')) {
							// Show only "submit" and "cancel" by default
							return;
						}
						if (obj._footer[key] === false) {
							// Explicitly disabled button
							return;
						}
		
						buttons += '<a href="javascript:void(0)" class="is-footer-button is-footer-button--' + key + '"></a>';
						visibleButtons.push(key);
					});
		
					obj._$nodes.footer.innerHTML = '<div class="is-footer-content">' +
						(empty ? '' : '<div class="is-footer-sample"><div></div></div>') +
						(empty ? '' : '<div class="is-footer-controls' + (transform === '' ? '' : ' is-footer-controls--transform') + '"><div class="is-footer-icon-name"></div>' + transform + '</div>') +
						(buttons === '' ? '' : '<div class="is-footer-buttons">' + buttons + '</div>') +
						'</div>';
		
					obj._$nodes.footerSample = obj._$nodes.footer.querySelector('.is-footer-sample > div');
					obj._$nodes.footerIconName = obj._$nodes.footer.querySelector('.is-footer-icon-name');
					obj._$nodes.footerButtons = obj._$nodes.footer.querySelector('.is-footer-buttons');
		
					// Update transformation buttons
					if (!empty && obj._footer.transform) {
						rotations.forEach(function(value) {
							obj.updateRotationButton(value, update.rotate === value).addEventListener('click', obj.rotationClicked.bind(this, value));
						});
						flip.forEach(function(value) {
							obj.updateFlipButton(value, update[value + 'Flip']).addEventListener('click', obj.flipClicked.bind(this, value));
						});
					}
		
					// Toggle is-footer--empty class
					obj._$nodes.footer.classList[empty ? 'add' : 'remove']('is-footer--empty');
		
					// Update submit buttons
					visibleButtons.forEach(function(key) {
						obj.updateFooterButton(key).addEventListener('click', obj.footerButtonClicked.bind(this, key));
					});
		
					// Update sample
					obj.updateFooterHTML(update);
		
					// Check dimensions - could have been resized after showing full size footer
					setTimeout(function() {
						obj.checkWidth();
					}, 100);
				};
		
				/**
				 * Rotation clicked
				 *
				 * @param value
				 * @param event
				 */
				obj.rotationClicked = function(value, event) {
					event.preventDefault();
					event.stopPropagation();
		
					if (value === obj._icon.rotate) {
						if (!value) {
							return;
						}
						value = 0;
					}
					obj.updateRotationButton(obj._icon.rotate, false);
					obj._icon.rotate = value;
					obj._footerData.rotate = value;
					obj.updateRotationButton(obj._icon.rotate, true);
					obj.updateFooterSample(obj._footerData);
				};
		
				/**
				 * Flip clicked
				 *
				 * @param value
				 * @param event
				 */
				obj.flipClicked = function(value, event) {
					var key = value + 'Flip';
		
					event.preventDefault();
					event.stopPropagation();
		
					obj._icon[key] = !obj._icon[key];
					obj._footerData[key] = obj._icon[key];
					obj.updateFlipButton(value, obj._icon[key]);
					obj.updateFooterSample(obj._footerData);
				};
		
				/**
				 * Button clicked
				 *
				 * @param key
				 * @param event
				 */
				obj.footerButtonClicked = function(key, event) {
					event.preventDefault();
					event.stopPropagation();
		
					switch (key) {
						case 'clear':
							// Reset everything
							obj._icon = search.emptyIcon();
							obj.refresh();
							break;
					}
		
					// Send event to caller
					if (key === 'submit') {
						obj.sendEvent('submit', obj.sendEventIcon(obj._icon));
					} else {
						obj.sendEvent(key);
					}
				};
		
				/**
				 * Update rotation button
				 *
				 * @param key
				 * @param selected
				 * @returns {Element}
				 */
				obj.updateRotationButton = function(key, selected) {
					var $node = obj._$nodes.footer.querySelector('.is-transformation--rotate--' + key);
					$node.classList[selected ? 'add' : 'remove']('is-transformation--active');
					$node.innerHTML = local.renderUIIcon('rotate' + key) + '<strong>' + (key * 90) + '&deg;</strong>';
					return $node;
				};
		
				/**
				 * Update flip button
				 *
				 * @param key
				 * @param checked
				 * @returns {Element}
				 */
				obj.updateFlipButton = function(key, checked) {
					var $node = obj._$nodes.footer.querySelector('.is-transformation--flip--' + key);
					$node.classList[checked ? 'add' : 'remove']('is-transformation--active');
					$node.innerHTML = local.renderUIIcon(key + 'Flip') + '<strong>' + lang[key + 'FlipText'] + '</strong>';
					return $node;
				};
		
				/**
				 *
				 * @param key
				 * @return {Element}
				 */
				obj.updateFooterButton = function(key) {
					var $node = obj._$nodes.footerButtons.querySelector('.is-footer-button--' + key);
					$node.innerHTML = local.renderUIIcon(key + 'FooterButton') + '<strong>' + (typeof obj._footer[key] === 'string' ? obj._footer[key] : lang.footerButtons[key]) + '</strong>';
					return $node;
				};
		
				/**
				 * Update footer sample
				 *
				 * @param {object} data Data to use
				 */
				obj.updateFooterSample = function(data) {
					var html;
		
					if (!obj._$nodes.footerSample) {
						return;
					}
					if (!data.icon) {
						obj._$nodes.footerSample.innerHTML = '';
						return;
					}
		
					// Sample
					html = '<iconify-icon class="' + search.valueToClass(data) + '" data-width="1em" data-height="1em"></iconify-icon>';
		
					obj._$nodes.footerSample.innerHTML = html;
				};
		
				/**
				 * Update footer code
				 *
				 * @param {object} update Data to show
				 */
				obj.updateFooterHTML = function(update) {
					var link = null,
						html, parts, prefix;
		
					// Update icon name
					if (obj._$nodes.footerIconName) {
						if (update === null || update.icon === '') {
							html = '';
						} else {
							html = '<span class="iconify" data-icon="' + update.icon + '"></span> ';
							html += obj._hidePrefix ? local.removePrefix(update.icon) : update.icon;
		
							if (!obj._hidePrefix && obj._prefix === null) {
								// Collection link
								parts = update.icon.split(':');
								if (parts.length === 1) {
									parts = update.icon.split('-');
								}
								prefix = parts.shift();
		
								link = local.collectionLink(prefix);
								if (link !== null) {
									html += '<a class="' + link.className + '" href="' + link.link + '">' + link.title + '</a>';
								}
							}
						}
		
						obj._$nodes.footerIconName.innerHTML = html;
						if (link !== null) {
							obj._$nodes.footerIconName.querySelector('a').addEventListener('click', obj.footerPrefixClicked.bind(this, link.data));
						}
					}
		
					// Sample
					obj.updateFooterSample(update);
				};
		
				/**
				 * Click event handler for collection name in footer
				 *
				 * @param prefix
				 * @param event
				 */
				obj.footerPrefixClicked = function(prefix, event) {
					event.preventDefault();
					event.stopPropagation();
		
					if (obj._prefix === prefix) {
						return;
					}
		
					obj.loadCollection(prefix);
				};
		
				return obj;
			};
		
		})(search, local, global);

		(function(search, local, global) {
		
			var createOverlay = local.Overlay;
		
			/**
			 * Create new overlay
			 *
			 * @param $parent
			 * @param {object} params
			 * @return {object}
			 * @constructor
			 */
			local.Overlay = function($parent, params) {
				var obj = createOverlay($parent, params),
					lang = search.config.lang;
		
				/**
				 * Refresh icons list
				 */
				obj.updateIcons = function() {
					var start = obj._page * obj._perPage,
						end = Math.min(start + obj._perPage, obj._icons.length),
						className = 'is-icons is-icons--' + (obj._listView ? 'list' : 'grid'),
						i;
		
					// Nothing to show?
					if (!obj._icons.length) {
						className += ' is-icons--empty';
						obj._$nodes.iconsContainer.innerHTML = '<div class="' + className + '"></div>';
						return;
					}
		
					// Filter visible icons list
					obj._visibleIcons = [];
					obj._pendingIcons = [];
		
					for (i = start; i < end; i ++) {
						obj._visibleIcons.push(obj._icons[i]);
					}
		
					// Disable cache and preload images
					Iconify.setConfig('localStorage', false);
					Iconify.setConfig('sessionStorage', false);
		
					// Show icons
					obj._$nodes.iconsContainer.innerHTML = '<div class="' + className + '"><ul>' + obj._visibleIcons.map(obj.drawIcon).join('') + '</ul></div>';
		
					// Check dimensions - overlay could have been resized after showing icons list
					setTimeout(function() {
						obj.checkWidth();
					}, 100);
				};
		
				/**
				 * Update pending icons
				 */
				obj.updatePendingIcons = function() {
					var $nodes = obj._$nodes.iconsContainer.querySelectorAll('li.is-icon--pending'),
						i, $node, icon;
		
					for (i = 0; i < $nodes.length; i++) {
						$node = $nodes[i];
						icon = $node.getAttribute('data-icon');
						if (Iconify.iconExists(icon)) {
							// Change to rendered!
							$node.classList.remove('is-icon--pending');
							$node.classList.add('is-icon--rendered');
							$node.innerHTML = obj.drawIconContents(icon, obj._showSize ? Iconify.getIcon(icon) : null);
						}
					}
				};
		
				/**
				 * Draw icon
				 *
				 * @param {string} icon
				 * @returns {string}
				 */
				obj.drawIcon = function(icon) {
					var exists = Iconify.iconExists(icon);
		
					if (!exists) {
						obj._pendingIcons.push(icon);
					}
		
					return '<li data-icon="' + icon + '" class="is-icon is-icon--' + (exists ? 'rendered' : 'pending') + (icon === obj._icon.icon ? ' is-selected-icon' : '') + '">' + obj.drawIconContents(icon, exists ? Iconify.getIcon(icon) : null) + '</li>';
				};
		
				/**
				 * Draw icon contents
				 *
				 * @param {string} icon
				 * @param {object|null} data
				 * @returns {string}
				 */
				obj.drawIconContents = function(icon, data) {
					var size = null,
						tag = 'iconify-icon',
						displayIcon = obj._hidePrefix ? local.removePrefix(icon) : icon,
						html, title, link, prefix, parts, links;
		
					link = search.config.iconLink(icon);
		
					if (obj._showSize && data) {
						size = data.width + ' x ' + data.height;
					}
					title = lang.iconTooltip(obj, displayIcon, size);
					html = '<a href="' + link + '" title="' + title + '"><' + tag + ' data-icon="' + icon + '" data-width="1em" data-height="1em"></' + tag + '></a>';
		
					html += '<div class="is-icon-stats"><a class="is-icon-link" href="' + link + '" title="' + title + '">' + displayIcon + '</a>';
		
					if (obj._showSize && data) {
						html += '<span class="is-icon-data">' + size + '</span>';
					}
		
					// Links
					links = [];
					if (obj._prefix === null) {
						parts = icon.split(':');
						if (parts.length === 1) {
							parts = icon.split('-');
						}
						prefix = parts.shift();
		
						link = local.collectionLink(prefix);
						if (link !== null) {
							links.push(link);
						}
					}
		
					if (obj._categories !== null && obj._iconCategories[icon] !== void 0) {
						obj._iconCategories[icon].forEach(function(cat) {
							if (cat !== obj._activeCategory) {
								link = obj.categoryLink(cat);
								if (link !== null) {
									links.push(link);
								}
							}
						});
					}
		
					if (links.length) {
						html += '<span class="is-icon-labels">';
						links.forEach(function(link) {
							html += '<a href="' + link.link + '" title="' + link.title + '"' + (link.className ? ' class="' + link.className + '"' : '') + (link.data ? ' data-link="' + link.data + '"' : '') + '>' + link.title + '</a>';
						});
						html += '</span>';
					}
		
					html += '</div>';
		
					return html;
				};
		
				/**
				 * Icons clicked
				 *
				 * @param event
				 */
				obj.iconsClicked = function(event) {
					var tag = event.target.tagName,
						$node;
		
					if (tag === 'UL' || tag === 'LI' || tag === 'DIV' || tag === 'SPAN') {
						return;
					}
		
					function clickedIcon() {
						var icon;
		
						// Get icon name
						icon = $node.getAttribute('data-icon');
						if (typeof icon !== 'string') {
							return;
						}
		
						event.preventDefault();
						event.stopPropagation();
		
						if (obj._icon.icon === icon) {
							return;
						}
		
						// Select icon
						obj.setSelectedIcon(icon);
					}
		
					function clickedCategory() {
						var category = $node.getAttribute('data-link');
		
						event.preventDefault();
						event.stopPropagation();
		
						if (obj._categoryIndex[category] === void 0 || obj._activeCategory === category) {
							return;
						}
		
						obj.setActiveCategory(category);
					}
		
					function clickedCollection() {
						var prefix = $node.getAttribute('data-link');
		
						event.preventDefault();
						event.stopPropagation();
		
						if (obj._prefix === prefix) {
							return;
						}
		
						obj.loadCollection(prefix);
					}
		
					// Find LI
					$node = event.target;
					try {
						while ($node !== null) {
							if ($node.tagName === 'LI') {
								clickedIcon();
								return;
							}
		
							if ($node.tagName === 'A') {
								if ($node.classList && $node.classList.contains('is-link-category')) {
									clickedCategory();
									return;
								}
								if ($node.classList && $node.classList.contains('is-link-collection')) {
									clickedCollection();
									return;
								}
							}
		
							$node = $node.parentNode;
						}
					} catch (err) {
					}
				};
		
				/**
				 * Set selected icon
				 *
				 * @param icon
				 */
				obj.setSelectedIcon = function(icon) {
					var $node;
		
					if (obj._destroyed || !obj._created) {
						return;
					}
		
					$node = obj._$nodes.iconsContainer.querySelector('.is-selected-icon');
					if ($node) {
						$node.classList.remove('is-selected-icon');
					}
					$node = obj._$nodes.iconsContainer.querySelector('[data-icon="' + icon + '"]');
					if ($node) {
						$node.classList.add('is-selected-icon');
					}
					obj._icon.icon = icon;
					obj.updateFooter();
				};
		
				/**
				 * Update counter text
				 *
				 * Moved to this module because it does not belong anywhere else
				 */
				obj.updateCounter = function() {
					obj._$nodes.stats.innerHTML = obj._notice ? obj._notice : lang.displayingCallback(obj._icons.length, obj._currentView && obj._currentView.morePages);
				};
		
				return obj;
			};
		
		})(search, local, global);

		(function(search, local, global) {
		
			var createOverlay = local.Overlay;
		
			/**
			 * Create new overlay
			 *
			 * @param $parent
			 * @param {object} params
			 * @return {object}
			 * @constructor
			 */
			local.Overlay = function($parent, params) {
				var obj = createOverlay($parent, params),
					lang = search.config.lang,
					listView = obj._listView;
		
				/**
				 * Build HTML structure
				 */
				obj.buildStructure = function() {
					var $root = obj._$root,
						html = '<div class="is-container">' +
						// First search form
						'<div class="is-search-form is-search-form--main"></div>' +
						// Current collection block
						'<div class="is-current-collection is-current-collection--hidden"></div>' +
						// Categories list
						'<div class="is-categories is-categories--hidden"></div>' +
						// Second search form
						'<div class="is-search-form is-search-form--secondary is-search-form--hidden"></div>' +
						// Search results block
						'<div class="is-search-results is-search-results--hidden is-layout-' + (listView ? 'list' : 'grid') + '">' +
							// Search results header
						'   <div class="is-header">' +
						'	   <div class="is-header-layouts"></div>' +
						'	   <div class="is-header-stats"></div>' +
						'   </div>' +
							// Search results
						'   <div class="is-icons-container"><div class="is-icons is-icons--' + (listView ? 'list' : 'grid') + '"></div></div>' +
							// Search results pagination
						'   <div class="is-pagination is-pagination--hidden"></div>' +
						'</div>' +
						// Footer
						'<div class="is-footer is-footer--hidden"></div>' +
						// Powered by string
						'<div class="is-powered-by">' + lang.poweredBy + '</div>' +
						'</div>';
		
					$root.innerHTML = html;
					obj._created = true;
		
					// Find nodes
					obj._$nodes = {
						search: {
							container: $root.querySelector('.is-search-form--main')
						},
						search2: {
							container: $root.querySelector('.is-search-form--secondary')
						},
						collectionContainer: $root.querySelector('.is-current-collection'),
						resultsContainer: $root.querySelector('.is-search-results'),
						stats: $root.querySelector('.is-search-results .is-header-stats'),
						layouts: $root.querySelector('.is-search-results .is-header-layouts'),
						categories: $root.querySelector('.is-container .is-categories'),
						iconsContainer: $root.querySelector('.is-search-results .is-icons-container'),
						pagination: $root.querySelector('.is-search-results .is-pagination'),
						footer: $root.querySelector('.is-footer'),
						poweredBy: $root.querySelector('.is-powered-by')
					};
		
					// Setup events
					obj._$nodes.categories.addEventListener('click', obj.categoriesClicked);
					obj._$nodes.iconsContainer.addEventListener('click', obj.iconsClicked);
		
					obj.rebuildSearchForm(false);
				};
		
				return obj;
			};
		
		})(search, local, global);

		(function(search, local, global) {
		
			var createOverlay = local.Overlay;
		
			/**
			 * Create new overlay
			 *
			 * @param $parent
			 * @param {object} params
			 * @return {object}
			 * @constructor
			 */
			local.Overlay = function($parent, params) {
				var obj = createOverlay($parent, params),
					lang = search.config.lang;
		
				/**
				 * Get maximum page
				 *
				 * @returns {number}
				 */
				obj.maxPage = function() {
					return Math.max(Math.floor((obj._icons.length - 1) / obj._perPage) + 1, 1);
				};
		
				/**
				 * Selected page
				 *
				 * @param event
				 */
				obj.pageClicked = function(event) {
					var page;
		
					event.preventDefault();
					event.stopPropagation();
		
					page = parseInt(event.target.getAttribute('data-page'));
					if (isNaN(page)) {
						return;
					}
		
					obj.changePage(page);
					obj.updatePagination();
				};
		
				/**
				 * Change current page
				 *
				 * @param {number} page
				 */
				obj.changePage = function(page) {
					var $node,
						maxPage = obj.maxPage();
		
					if (page === obj._page || page < 0 || page >= maxPage) {
						return;
					}
		
					$node = obj._$nodes.pagination.querySelector('[data-page="' + obj._page + '"]');
					if ($node) {
						$node.setAttribute('class', '');
					}
		
					obj._page = page;
					obj._$nodes.pagination.querySelector('[data-page="' + obj._page + '"]').setAttribute('class', 'is-current');
		
					obj.updateIcons();
		
					if (page === 1) {
						// Load more results
						if (obj._currentView && obj._currentView.type === 'search' && obj._currentView.morePages) {
							obj.loadMoreSearchResults();
						}
					}
				};
		
				/**
				 * Update pagination code
				 */
				obj.updatePagination = function() {
					var maxPage = obj.maxPage(),
						showPages = [],
						last = 0,
						current = obj._page,
						i, start, end, $nodes;
		
					// Empty
					if (obj._icons.length <= obj._perPage) {
						obj._$nodes.pagination.classList.add('is-pagination--hidden');
						obj._$nodes.pagination.innerHTML = '';
						return;
					}
					obj._$nodes.pagination.classList.remove('is-pagination--hidden');
		
					if (obj._currentView && obj._currentView.morePages) {
						// "Show more results" pages
						obj._$nodes.pagination.innerHTML = '<a href="javascript:void(0)" data-page="1" class="is-load-more">' + lang.paginationMore + '</a>';
					} else {
						if (maxPage < 12) {
							// Show all pages
							for (i = 0; i < maxPage; i++) {
								showPages.push(i);
							}
						} else {
							// Always show first 3 pages
							for (i = 0; i < 3; i++) {
								if (i < maxPage) {
									showPages.push(i);
									last = i;
								}
							}
		
							// Current page +- 2
							start = Math.max(current - 2, last + 1);
							end = Math.min(Math.max(current, 2) + 3, maxPage);
							for (i = start; i < end; i++) {
								showPages.push(i);
								last = i;
							}
		
							// Always show last 3 pages
							if (maxPage > last) {
								start = Math.max(last + 1, maxPage - 3);
								for (i = start; i < maxPage; i++) {
									showPages.push(i);
								}
							}
						}
		
						last = 0;
						obj._$nodes.pagination.innerHTML = showPages.map(function(item) {
							var result = '<a href="javascript:void(0)" data-page="' + item + '"' + (current === item ? ' class="is-current"' : '') + '>' + (item + 1) + '</a>';
							if (item > last + 1) {
								if (item === last + 2) {
									result = '<a href="javascript:void(0)" data-page="' + (item - 1) + '">' + item + '</a>' + result;
								} else {
									result = '<span>...</span>' + result;
								}
							}
							last = item;
							return result;
						}).join('');
					}
		
					// Set events
					$nodes = obj._$nodes.pagination.querySelectorAll('a');
					for (i = 0; i < $nodes.length; i++) {
						$nodes[i].addEventListener('click', obj.pageClicked);
					}
				};
		
				return obj;
			};
		
		})(search, local, global);

		(function(search, local, global) {
		
			var createOverlay = local.Overlay;
		
			/**
			 * Create new overlay
			 *
			 * @param $parent
			 * @param {object} params
			 * @return {object}
			 * @constructor
			 */
			local.Overlay = function($parent, params) {
				var obj = createOverlay($parent, params),
					lang = search.config.lang;
		
				/**
				 * Send search request
				 *
				 * @param {string} keyword
				 * @param {boolean} [onlyCollection]
				 */
				obj.startSearch = function(keyword, onlyCollection) {
					var time = Date.now(),
						params;
		
					// Check if too many searches were sent
					if (obj._searchThrottled) {
						obj._searchThrottled = {
							keyword: keyword,
							collection: onlyCollection
						};
						return;
					} else {
						obj._searchThrottled = true;
						window.setTimeout(function() {
							if (obj._destroyed) {
								return;
							}
							obj.checkPendingSearch();
						}, 2000);
					}
		
					// Init search object
					obj.showPendingSearch(time);
		
					params = {
						query: keyword,
						limit: obj._perPage * (onlyCollection === true ? 15 : 2)
					};
					if (onlyCollection === true && obj._prefix) {
						params.prefix = obj._prefix;
					}
					obj.sendSearchRequest(params, function(results) {
						obj.setSearchResults(time, results);
					});
				};
		
				/**
				 * Send search request
				 *
				 * @param {string} keyword
				 */
				obj.search = function(keyword) {
					var prefix;
		
					if (!obj._visible) {
						obj.refresh();
					}
		
					prefix = (obj._prefix !== null && obj._defaultPrefix === null) ? 'search2' : 'search';
					if (obj._$nodes && obj._$nodes[prefix]) {
						obj._$nodes[prefix].input.value = keyword;
						obj.searchInputChanged(prefix);
					}
		
					obj.startSearch(keyword, obj._prefix !== null);
				};
		
				/**
				 * Check for throttled search request
				 */
				obj.checkPendingSearch = function() {
					var params;
		
					if (!obj._searchThrottled) {
						return;
					}
		
					if (typeof obj._searchThrottled === 'object') {
						params = obj._searchThrottled;
						obj._searchThrottled = false;
						obj.startSearch(params.keyword, params.collection);
						return;
					}
					obj._searchThrottled = false;
				};
		
				/**
				 * Send search request
				 *
				 * @param {object} params
				 * @param {function} callback
				 */
				obj.sendSearchRequest = function(params, callback) {
					var url;
		
					if (!params.prefix && obj._defaultPrefix !== null) {
						params.prefix = obj._defaultPrefix;
					}
					if (params.prefix && obj._activeCategory !== null) {
						params.category = obj._activeCategory === lang.uncategorized ? '' : obj._activeCategory;
					}
		
					url = '/search?';
					Object.keys(params).forEach(function(key, index) {
						if (index) {
							url += '&';
						}
						url += key + '=' + encodeURIComponent(params[key]);
					});
		
					local.apiRequest(obj, 'search' + Date.now(), url, callback, url);
				};
		
				/**
				 * Received search results
				 *
				 * @param {number} time
				 * @param {object} results
				 * @param {boolean} [more]
				 */
				obj.setSearchResults = function(time, results, more) {
					if (obj._destroyed) {
						return;
					}
					if (!results.total) {
						obj._notice = lang.statusEmptySearch;
						obj._currentView = {
							type: 'search',
							time: time,
							keyword: results.request.query
						};
						obj.showEmptyResults();
						return;
					}
		
					obj._notice = null;
					if (more && results.total === obj._perPage * 2) {
						// Nothing new was loaded
						obj.updateCounter();
						return;
					}
		
					// Reset collection
					if (obj._prefix && !results.request.prefix) {
						obj._prefix = null;
						obj._categories = null;
						obj._categoryIndex = {};
						obj._activeCategory = null;
						obj._iconCategories = null;
						obj.updateCollectionBlock();
						obj.updateFooter(true);
					}
		
					obj._currentView = {
						type: 'search',
						time: time,
						keyword: results.request.query,
						morePages: more !== true && results.total === results.limit && results.limit === obj._perPage * 2
					};
					obj.displayIcons(results.icons, more);
					if (!obj._currentView.morePages && results.total === results.limit) {
						obj._notice = lang.statusMaxResults.replace('{count}', results.total);
						obj.updateCounter();
					}
				};
		
				/**
				 * Load more search results
				 */
				obj.loadMoreSearchResults = function() {
					var time = Date.now();
		
					// Init search object
					obj._notice = lang.statusSearchingMore;
					obj.updateCounter();
					obj.sendSearchRequest({
						query: obj._currentView.keyword,
						limit: search.config.maxResults
					}, function(results) {
						obj.setSearchResults(time, results, true);
					});
				};
		
				/**
				 * Remove icons, show pending search
				 */
				obj.showPendingSearch = function(time) {
					obj._pendingSearch = time;
					obj._notice = lang.statusSearching;
					if (obj._created && !obj._destroyed) {
						obj.showEmptyResults();
					}
				};
		
				return obj;
			};
		
		})(search, local, global);

		(function(search, local, global) {
		
			var createOverlay = local.Overlay;
		
			/**
			 * Create new overlay
			 *
			 * @param $parent
			 * @param {object} params
			 * @return {object}
			 * @constructor
			 */
			local.Overlay = function($parent, params) {
				var obj = createOverlay($parent, params),
					lang = search.config.lang;
		
				/**
				 * Reset search form value
				 *
				 * @param prefix
				 * @param [event]
				 */
				obj.resetSearchForm = function(prefix, event) {
					if (event && event.preventDefault) {
						event.preventDefault();
						event.stopPropagation();
					}
		
					obj.resetSearchInput(prefix);
		
					// Show entire collection if form was showing search results
					if (obj._currentView && obj._currentView.type === 'search' && obj._prefix) {
						obj.restoreCollection();
					}
				};
		
				/**
				 * Reset search input
				 *
				 * @param prefix
				 */
				obj.resetSearchInput = function(prefix) {
					if (!obj._$nodes) {
						return;
					}
					obj._$nodes[prefix].input.value = '';
					if (obj._resetVisible[prefix]) {
						obj._$nodes[prefix].inputContainer.classList.add('is-form-input--empty');
						obj._resetVisible[prefix] = false;
					}
				};
		
				/**
				 * Event handler for search input change and keyup events
				 */
				obj.searchInputChanged = function(prefix, event) {
					var value = obj._$nodes[prefix].input.value.trim(),
						showReset = value.length > 0;
		
					if (showReset !== obj._resetVisible[prefix]) {
						obj._resetVisible[prefix] = showReset;
						obj._$nodes[prefix].inputContainer.classList[showReset ? 'remove' : 'add']('is-form-input--empty');
						obj._$nodes[prefix].form.classList.remove('is-search-form--empty'); // only remove on first change
					}
		
					if (event && event.keyCode && event.keyCode === 13) {
						obj.searchSubmitted(prefix, event);
					}
				};
		
				/**
				 * Search form submitted
				 *
				 * @param prefix
				 * @param [event]
				 */
				obj.searchSubmitted = function(prefix, event) {
					var value = obj._$nodes[prefix].input.value.trim();
		
					event.preventDefault();
					event.stopPropagation();
		
					if (value.length) {
						obj.startSearch(value, obj._defaultPrefix !== null || prefix === 'search2');
					}
				};
		
				/**
				 * Rebuild HTML for search form
				 *
				 * @param {boolean} [secondary]
				 */
				obj.rebuildSearchForm = function(secondary) {
					var title, placeholder,
						prefix = secondary ? 'search2' : 'search',
						formTag = obj.useForm ? 'form' : 'div',
						$nodes = obj._$nodes[prefix],
						$parent = $nodes.container,
						visible = secondary || ($nodes.form && $nodes.form.classList && !$nodes.form.classList.contains('is-search-form--empty'));
		
					if (obj._prefix || secondary) {
						title = local.getCollectionTitle(obj._prefix, null);
						placeholder = title === null ? lang.searchPlaceholderPrefixed : lang.searchPlaceholderPrefixedNamed.replace('{title}', title);
					} else {
						placeholder = lang.searchPlaceholder;
					}
					$parent.innerHTML = '<' + formTag + ' class="is-search-form ' + (visible ? '' : 'is-search-form--empty ') + '">' +
						'   <div class="is-form-input">' +
						'	   <div class="is-input is-input--' + (obj._fancySearch ? 'decorated' : 'plain') + '">' +
						(obj._fancySearch ? local.renderUIInputDecoration('inputSVG') : '') +
						'		   <input type="text" placeholder="' + placeholder + '" value="" spellcheck="false" />' +
						'	   </div>' +
						'	   <span class="is-form-image is-form-image--placeholder">' + local.renderUIIcon('searchInput') + '</span>' +
						'	   <a href="javascript:void(0)" class="is-form-image is-form-image--reset" title="' + lang.searchReset + '">' + local.renderUIIcon('searchReset') + '</a>' +
						'   </div>' +
						'   <a href="javascript:void(0);" class="is-search-button is-search-button--default" title="' + lang.searchButton + '">' + local.renderUIIcon('searchDefaultButton') + '</a>' +
						'</' + formTag + '>';
		
					$nodes.form  = $parent.querySelector('.is-search-form');
					$nodes.inputContainer = $parent.querySelector('.is-form-input');
					$nodes.input = $parent.querySelector('input');
					$nodes.reset = $parent.querySelector('.is-form-image--reset');
					$nodes.submit = $parent.querySelector('.is-search-button--default');
		
					obj._resetVisible[prefix] = $nodes.input.value.length > 0;
					if (!obj._resetVisible[prefix]) {
						$nodes.inputContainer.classList.add('is-form-input--empty');
					}
					$nodes.form.addEventListener('submit', obj.searchSubmitted.bind(this, prefix));
					$nodes.reset.addEventListener('click', obj.resetSearchForm.bind(this, prefix));
					$nodes.input.addEventListener('change', obj.searchInputChanged.bind(this, prefix));
					$nodes.input.addEventListener('keyup', obj.searchInputChanged.bind(this, prefix));
					$nodes.submit.addEventListener('click', obj.searchSubmitted.bind(this, prefix));
				};
		
				return obj;
			};
		
		})(search, local, global);

		(function(search, local, global) {
		
			var createOverlay = local.Overlay;
		
			/**
			 * Create new overlay
			 *
			 * @param $parent
			 * @param {object} params
			 * @return {object}
			 * @constructor
			 */
			local.Overlay = function($parent, params) {
				var obj = createOverlay($parent, params),
					lang = search.config.lang;
		
				/**
				 * Get HTML code for layouts buttons
				 */
				obj.layoutsFilterHTML = function() {
					var layouts = '';
					if (!obj._icons.length || !obj._showViewModes) {
						return '';
					}
					['grid', 'list'].forEach(function(entry) {
						var selected = (entry === 'list') === obj._listView;
						layouts += '<a href="javascript:void(0)" class="' + (selected ? 'is-selected' : 'is-clickable') + '" data-layout="' + entry + '">' + local.renderUIIcon(entry + (selected ? 'Selected' : '') + 'Filter') + '</a>';
					});
					return layouts;
				};
		
				/**
				 * Change layout
				 *
				 * @param [event]
				 */
				obj.changeLayout = function(event) {
					if (event && event.preventDefault) {
						event.preventDefault();
						event.stopPropagation();
					}
		
					obj._listView = !obj._listView;
					obj._$nodes.iconsContainer.childNodes[0].className = 'is-icons is-icons--' + (obj._listView ? 'list' : 'grid');
					if (obj._icons.length) {
						obj.updateLayoutsFilter();
					}
				};
		
				/**
				 * Update layouts filter HTML code
				 */
				obj.updateLayoutsFilter = function() {
					var html = obj.layoutsFilterHTML();
		
					obj._$nodes.layouts.innerHTML = html;
					if (html !== '' && obj._icons.length) {
						obj._$nodes.layouts.querySelector('a.is-clickable').addEventListener('click', obj.changeLayout);
					}
				};
		
				return obj;
			};
		
		})(search, local, global);

		(function(search, local, global) {
		
			/**
			 * Apply action to all/selected overlay(s)
			 * @param action
			 * @param [$parent] Parent item to filter
			 * @param [skip] Overlay to skip
			 */
			function overlayAction(action, $parent, skip) {
				var overlay, overlays;
		
				if ($parent === void 0 || $parent === null) {
					// Apply to all overlays
					overlays = local.listOverlays();
				} else {
					overlay = local.findOverlay($parent);
					if (overlay === null) {
						return;
					}
					overlays = [overlay];
				}
		
				overlays.forEach(function(item) {
					if (item !== skip) {
						item[action]();
					}
				});
			}
		
			/**
			 * Hide visible overlays
			 *
			 * @param {boolean} overlaysOnly True if only overlays should be hidden
			 * @param {object} skip Overlay to skip
			 */
			local.hideActiveOverlays = function(overlaysOnly, skip) {
				local.listOverlays().forEach(function(overlay) {
					if (overlay === skip || !overlay._visible) {
						return;
					}
		
					if (overlaysOnly && !overlay._overlay) {
						return;
					}
		
					overlay.hide();
				});
			};
		
			/**
			 * Create overlay
			 *
			 * @param {Node} $parent
			 * @param {object} [params]
			 */
			search.create = function($parent, params) {
				var overlay;
		
				if (!$parent) {
					return false;
				}
				params = typeof params === 'object' ? params : {};
		
				// Delete old overlay
				overlay = local.findOverlay($parent);
				if (overlay !== null && !overlay._destroyed) {
					if (params.reuse === true) {
						// Re-use existing overlay
						if (!overlay._visible) {
							local.hideActiveOverlays(true, overlay);
							overlay.show();
						}
						overlay.updateValue(params);
						return true;
					}
		
					overlay.destroy();
				}
		
				// Hide other overlays
				local.hideActiveOverlays(true);
		
				// Create new overlay
				local.createOverlay($parent, params);
				return true;
			};
		
			/**
			 * Hide overlay
			 *
			 * @param {Node} [$parent]
			 */
			search.hide = function($parent) {
				overlayAction('hide', $parent);
			};
		
			/**
			 * Destroy overlay
			 *
			 * @param $parent
			 */
			search.destroy = function($parent) {
				overlayAction('destroy', $parent);
			}
		
		})(search, local, global);


	})(self.IconifySearch, self);
}
