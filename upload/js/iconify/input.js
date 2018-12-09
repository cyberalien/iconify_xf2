!function($, window, document, _undefined)
{
    "use strict";

    var oldAutoFocus = XF.autoFocusWithin,
        translated = false;

    /**
     * Get boolean attribute value
     *
     * @param {*} value
     * @param {*} defaultValue
     * @param {string} [key]
     * @return {*}
     */
    function checkBooleanAttribute(value, defaultValue, key)
    {
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'string') {
            if (value === 'true' || value === '1' || value === key) {
                return true;
            }
            if (value === 'false' || value === '0' || value === '') {
                return false;
            }
        }
        return defaultValue;
    }

    /**
     * Apply language variables to icon finder
     */
    function translate()
    {
        translated = true;

        if (window.IconifySearchTranslation === void 0) {
            return;
        }

        IconifySearch.setLang(window.IconifySearchTranslation);
    }

    /**
     * Allow typing in icon input when menu is open
     */
    XF.autoFocusWithin = function($container)
    {
        if ($container.hasClass('menu--iconbox--focused')) {
            return;
        }
        return oldAutoFocus.apply(this, arguments);
    };

    /**
     * Icon picker input
     */
    XF.IconBox = XF.Element.newHandler({
        menuInited: false,
        menu: null,

        options: {
            icon: '| .input--icon',
            sampleBox: '| .js-iconbox-trigger',
            sample: '| .iconbox-sample-container'
        },

        init: function()
        {
            var $target = this.$target;

            this.initOptions();
            this.initDOM();
        },

        /**
         * Get options from attributes, set values
         */
        initOptions: function()
        {
            var $target = this.$target;

            // Get data from container
            this.format = $target.attr('data-format');
            this.inputName = $target.attr('data-name');
            this.originalValue = JSON.parse($target.attr('data-value'));
            this.showColor = $target.attr('data-show-color') === 'true';
            this.alwaysShowColor = $target.attr('data-always-show-color') === 'true';
            this.canReset = $target.attr('data-can-reset') === 'true';

            this.value = IconifySearch.valueFromString(this.originalValue.value);
            this.color = typeof this.originalValue.color === 'string' ? this.originalValue.color : '';
            if (this.showColor) {
                this.defaultColorResolved = $target.attr('data-resolved-color');
                this.defaultColor = this.color;
            }

            // Default options
            this.readOnly = false;
            this.required = checkBooleanAttribute(this.originalValue.required, false, 'required');
            this.canTransform = checkBooleanAttribute(this.originalValue.canTransform, true);
            this.defaultValue = this.originalValue.default === void 0 ? null : IconifySearch.valueFromString(this.originalValue.default);

            // Check for transform
            if (!this.canTransform && this.value && this.value.icon && (this.value.rotate || this.value.hFlip || this.value.vFlip)) {
                this.canTransform = true;
            }

            // Options from attributes
            this.required = checkBooleanAttribute($target.attr('data-required'), this.required, 'required');
            this.readOnly = checkBooleanAttribute($target.attr('readonly'), this.readOnly, 'readonly');
            this.readOnly = checkBooleanAttribute($target.attr('data-readonly'), this.readOnly);

            this.canClear = this.required ? !!(this.defaultValue !== null && this.defaultValue.icon) : true;

            // Mix stuff
            this.visibleIcon = '';
            this.visibleIconPalette = 'unknown';

            document.addEventListener('IconifyAddedIcons', XF.proxy(this, 'checkVisibleIconPalette'));
        },

        /**
         * Create DOM and setup events
         */
        initDOM: function()
        {
            var $target = this.$target;

            // Find hidden inputs
            this.$hiddenValue = $target.find('.iconbox-input--value');
            if (this.showColor && this.format === 'object') {
                this.$hiddenColor = $target.find('.iconbox-input--color');
            }

            // Container
            this.$inputGroup = $target.find('.inputGroup--iconbox');

            // Find color picker
            if (this.showColor) {
                this.$color = $target.find('.inputGroup--color > input');
                this.$color.on('change', XF.proxy(this, 'updateColorFromInput'));
                if (this.readOnly) {
                    // Disable color picker
                    this.$color.attr('readonly', true);
                    $target.find('.inputGroup--color .inputGroup-text').addClass('inputGroup-text--disabled');
                }
            }

            if (this.canReset) {
                this.$reset = $target.find('.inputChoices input[type=checkbox]');
                this.$reset.prop('checked', false);
                if (this.format === 'object') {
                    this.$hiddenReset = $target.find('.iconbox-input--reset');
                }
                this.$reset.on('change', XF.proxy(this, 'updateHiddenInputs'));
            }

            // Find nodes
            this.$icon = XF.findRelativeIf(this.options.icon, $target);
            if (this.defaultValue) {
                this.$icon.attr('placeholder', this.defaultValue.icon);
            }
            this.updateIconInput();
            if (!this.readOnly) {
                this.$icon.on('blur paste', XF.proxy(this, 'updateIconFromInput'));
                this.$icon.on('focus', XF.proxy(this, 'iconInputFocus'));
            }

            this.$sampleBox = XF.findRelativeIf(this.options.sampleBox, $target);
            if (!this.readOnly) {
                this.$sampleBox.click(XF.proxy(this, 'iconSampleClick'));
            }

            this.$sample = XF.findRelativeIf(this.options.sample, $target);
            this.updateVisibleIcon();
        },

        /**
         * Update values in hidden inputs
         */
        updateHiddenInputs: function()
        {
            var value;

            switch (this.format) {
                case 'string':
                    value = this.canTransform ? IconifySearch.valueToClass(this.value) : this.value.icon;
                    this.$hiddenValue.val(value);
                    this.$hiddenValue.trigger('change');
                    break;

                case 'json':
                    value = Object.assign({}, this.originalValue);
                    value.value = this.value ? IconifySearch.valueToClass(this.value) : '';
                    if (this.showColor) {
                        value.color = this.color;
                    }
                    if (this.canReset && this.$reset.prop('checked')) {
                        value.reset = true;
                    }
                    this.$hiddenValue.val(JSON.stringify(value));
                    this.$hiddenValue.trigger('change');
                    break;

                case 'object':
                    this.$hiddenValue.val(this.value ? IconifySearch.valueToClass(this.value) : '');
                    this.$hiddenValue.trigger('change');
                    if (this.showColor && this.$hiddenColor) {
                        this.$hiddenColor.val(this.color);
                        this.$hiddenColor.trigger('change');
                    }
                    if (this.canReset) {
                        this.$hiddenReset.val(this.$reset.prop('checked') ? 'true' : '');
                        this.$hiddenReset.trigger('change');
                    }
                    break;
            }
        },

        /**
         * Update icon sample. Also toggles empty/non-empty class on container
         */
        updateVisibleIcon: function()
        {
            var value, color, style, hsl;

            if (!this.value || !this.value.icon) {
                if (!this.defaultValue || !this.defaultValue.icon) {
                    // Nothing to show
                    this.visibleIcon = '';
                    if (!this.alwaysShowColor) {
                        this.$inputGroup.addClass('inputGroup--iconbox--empty');
                    }
                    this.$sample.html('<span class="iconbox-sample iconbox-sample--empty"></span>');
                    return;
                }
                value = this.defaultValue;
            } else {
                value = this.value;
            }

            // Change visible icon, get palette
            this.visibleIcon = value.icon;
            this.checkVisibleIconPalette(true);

            // Mark as non-empty
            if (!this.alwaysShowColor) {
                this.$inputGroup.removeClass('inputGroup--iconbox--empty');
            }

            // Check color
            if (this.showColor) {
                if (this.color === this.defaultColor && this.defaultColorResolved !== void 0) {
                    color = this.defaultColorResolved;
                } else if (this.color !== '' && (color = XF.Color.fromString(this.color)) !== null) {
                    color = color.toCss();
                } else {
                    color = '';
                }

                style = 'color: ' + color + ';';

                // Set background color
                if (XF.Color) {
                    color = XF.Color.fromString(color);
                    if (color !== null) {
                        hsl = color.toHsl();
                        style += 'background-color: ' + (hsl.l > 0.6 ? '#000' : '#fff') + ';';
                    }
                }
            }

            this.$sample.html('<iconify-icon data-width="1em" data-height="1em" class="iconbox-sample ' + IconifySearch.valueToClass(value) + '"' + (this.showColor && color !== '' ? ' style="' + style + '"' : '') + '></iconify-icon>');
        },

        /**
         * Check visible icon's palette
         *
         * @param {boolean} [force]
         */
        checkVisibleIconPalette: function(force)
        {
            var svg, palette;

            if (force !== true && this.visibleIconPalette !== 'unknown') {
                return;
            }

            palette = 'unknown';
            if (this.visibleIcon && Iconify.iconExists(this.visibleIcon)) {
                svg = Iconify.getSVG(this.visibleIcon);
                if (svg) {
                    palette = svg.indexOf('currentColor') === -1 ? 'colorful' : 'colorless';
                }
            }

            if (this.visibleIconPalette !== palette) {
                if (!this.alwaysShowColor) {
                    this.$inputGroup.removeClass('inputGroup--iconbox--' + this.visibleIconPalette);
                    this.$inputGroup.addClass('inputGroup--iconbox--' + palette);
                    setTimeout(XF.layoutChange, 0);
                }
                this.visibleIconPalette = palette;
            }
        },

        /**
         * Update icon input value
         */
        updateIconInput: function()
        {
            this.$icon.val(IconifySearch.valueToClass(this.value).replace('icon:', ''));
            this.$icon.trigger('change');
        },

        /**
         * Set new icon value from input
         */
        updateIconFromInput: function()
        {
            var newValue = IconifySearch.valueFromString(this.$icon.val(), this.value);

            if (!this.canClear && (!newValue || !newValue.icon)) {
                this.updateIconInput();
                return;
            }
            if (!this.canTransform) {
                newValue.rotate = 0;
                newValue.hFlip = false;
                newValue.vFlip = false;
            }

            if (JSON.stringify(newValue) === JSON.stringify(this.value)) {
                return;
            }

            this.value = newValue;
            this.destroyMenu();
            this.refreshIconValue('input');
        },

        /**
         * Refresh value in all inputs and menu
         */
        refreshIconValue: function(source)
        {
            this.updateHiddenInputs();
            this.updateIconInput();
            this.updateVisibleIcon();
            if (source !== 'box') {
                this.updateIconPicker();
            }
        },

        /**
         * Change sample color
         */
        updateColorFromInput: function()
        {
            var chunk, parts, hex;

            if (this.readOnly) {
                this.$color.val(this.color);
                return;
            }

            this.color = this.$color.val();

            // Convert rgb() to hex
            if (this.color.slice(0, 4) === 'rgb(' && this.color.slice(-1) === ')') {
                chunk = this.color.slice(4, this.color.length - 1);
                if (chunk.match(/^[0-9, ]+$/)) {
                    parts = chunk.split(',');
                    if (parts.length === 3) {
                        hex = '#';
                        parts.forEach(function(num) {
                            num = parseInt(num);
                            if (isNaN(num) || hex === null || num < 0 || num > 255) {
                                hex = null;
                                return;
                            }
                            hex += (num < 15 ? '0' : '') + num.toString(16);
                        });
                        if (hex !== null) {
                            this.color = hex;
                            this.$color.val(this.color);
                        }
                    }
                }
            }

            this.updateHiddenInputs();
            this.updateVisibleIcon();
        },

        /**
         * Icon sample clicked
         *
         * @param e
         */
        iconSampleClick: function(e)
        {
            this.toggleMenu(e, true);
        },

        /**
         * Icon input focused
         *
         * @param e
         */
        iconInputFocus: function(e)
        {
            this.toggleMenu(e, false);
        },

        /**
         * Toggle menu
         *
         * @param e
         * @param toggle
         */
        toggleMenu: function(e, toggle)
        {
            if (this.readOnly)
            {
                if (this.menu)
                {
                    this.closeMenu();
                }
                return;
            }

            this.setupMenu();

            if (toggle || !this.menu.isOpen())
            {
                this.menu.$menu[toggle ? 'removeClass' : 'addClass']('menu--iconbox--focused');
                this.menu.toggle(XF.isEventTouchTriggered(e));
            }
        },

        /**
         * Get overlay parameters
         *
         * @return {object}
         */
        getOverlayParams()
        {
            var params = {
                show: true,
                overlay: false,
                append: false,
                fancySearch: false,
                footer: {
                    submit: true,
                    cancel: true,
                    clear: this.canClear
                },
                value: this.value,
                callback: this.iconifyCallback.bind(this)
            };

            if (this.canTransform) {
                params.footer.transform = true;
            }

            return params;
        },

        /**
         * Callback from IconifySearch instance
         *
         * @param event
         * @param icon
         */
        iconifyCallback: function(event, icon)
        {
            switch (event) {
                case 'clear':
                    if (!this.canClear) {
                        return;
                    }
                    this.value = IconifySearch.emptyIcon();
                    this.closeMenu();
                    this.refreshIconValue('box');
                    break;

                case 'cancel':
                    this.closeMenu();
                    break;

                case 'submit':
                    this.value = icon;
                    this.closeMenu();
                    this.refreshIconValue('box');
            }
        },

        /**
         * Create menu container
         */
        getMenuEl: function()
        {
            return $($.parseHTML('<div class="menu menu--iconbox" data-menu="menu" aria-hidden="true"><div class="menu-content menu-content--iconbox"></div></div>'));
        },

        /**
         * Create menu
         */
        setupMenu: function()
        {
            var $menu;

            if (!translated) {
                translate();
            }

            if (this.menuInited) {
                return;
            }
            this.menuInited = true;

            $menu = this.getMenuEl();
            this.$target.after($menu);
            XF.activate($menu);

            // Create Iconify overlay
            this.menuContentContainer = $menu.find('.menu-content--iconbox').get(0);
            IconifySearch.create(this.menuContentContainer, this.getOverlayParams());

            // Create XenForo menu
            this.menu = new XF.MenuClick(this.$target, {
                menuPosRef: this.options.sampleBox,
                arrowPosRef: this.options.sampleBox
            });
            if (this.menu.$menuPosRef !== this.menu.$arrowPosRef) {
                this.menu.$arrowPosRef = this.menu.$menuPosRef;
            }
        },

        /**
         * Open menu
         */
        openMenu: function()
        {
            if (this.readOnly)
            {
                return;
            }

            this.setupMenu();

            this.menu.open();
        },

        /**
         * Close menu
         */
        closeMenu: function()
        {
            if (this.menu)
            {
                this.menu.close();
            }
        },

        /**
         * Destroy menu
         */
        destroyMenu: function()
        {
            if (!this.menuInited)
            {
                return;
            }

            this.closeMenu();
            this.menuInited = false;
            this.menu = null;
            if (this.menuContentContainer)
            {
                IconifySearch.destroy(this.menuContentContainer);
            }
            this.menuContentContainer = null;
        },

        /**
         * Update values in icon picker
         */
        updateIconPicker: function()
        {
            if (!this.menuContentContainer) {
                return;
            }
            IconifySearch.create(this.menuContentContainer, this.getOverlayParams());
        },

    });

    XF.Element.register('iconbox', 'XF.IconBox');

}(jQuery, window, document);