!function($, window, document, _undefined)
{
    "use strict";

    $(document).ready(function() {
        var $inputs = {
                // default blocks
                edit_format: $('select[name=edit_format]'),
                edit_format_params: $('textarea[name=edit_format_params]'),
                data_type: $('select[name=data_type]'),
                default_value: $('textarea[name=default_value]'),
                sub_options: $('textarea[name=sub_options]'),
                validation_class: $('input[name=validation_class]'),
                validation_method: $('input[name=validation_method]'),

                // icon blocks
                edit_icon: $('div[data-name=edit_icon]'),

                // inputs
                hidden: $('input.iconbox-input--value'),
                can_transform: $('input[name="edit_icon_transform[selected]"]'),
                show_color: $('input[name="edit_icon_color[selected]"]'),
                required: $('input[name="edit_icon_required[selected]"]')
            },
            toggleBlocks = ['edit_format_params', 'data_type', 'default_value', 'sub_options', 'validation_class'],
            $containers = {},
            $optionsContainer = $('.iconOptions'),
            failed = $optionsContainer.length !== 1,
            defaultValue = {
                // Also see Entity/Option.php, property.js
                value: '',
                default: '',
                color: '',
                showColor: false,
                canTransform: true,
                required: false
            },
            initialized = false,
            visible = false;

        function init() {
            initialized = true;

            $inputs.hidden.on('change', setValuesDelayed);
            $inputs.can_transform.on('change', setValues);
            $inputs.show_color.on('change', setValues);
            $inputs.required.on('change', setValues);
        }

        function checkInput() {
            var format = $inputs.edit_format.val();

            if (format !== 'icon') {
                // Hide icon editor
                if (visible) {
                    $optionsContainer.hide();
                    toggleBlocks.forEach(function(key) {
                        $containers[key].removeClass('formRow--editing-icon');
                    });
                    visible = false;
                    setTimeout(XF.layoutChange, 0);
                }
                return;
            }

            // Show icon editor
            if (visible) {
                return;
            }
            if (!initialized) {
                init();
            }

            setValues();
            $optionsContainer.show();
            toggleBlocks.forEach(function(key) {
                $containers[key].addClass('formRow--editing-icon');
            });
            visible = true;
            setTimeout(XF.layoutChange, 0);
        }

        function checkDefaultValue() {
            var format = $inputs.edit_format.val(),
                value;

            if (format === 'icon') {
                // Set values from default value
                value = $inputs.hidden.parent().attr('data-original-value');
                if (!value || value.slice(0, 1) !== '{') {
                    value = $inputs.hidden.val();
                }
                value = JSON.parse(value);

                Object.keys(defaultValue).forEach(function(key) {
                    if (value[key] !== void 0) {
                        defaultValue[key] = value[key];
                    }
                });
            }

            $inputs.can_transform.prop('checked', defaultValue.canTransform);
            $inputs.show_color.prop('checked', defaultValue.showColor);
            $inputs.required.prop('checked', defaultValue.required);
        }

        function setValues() {
            var keys = Object.keys(defaultValue),
                hiddenValue = JSON.parse($inputs.hidden.val());

            defaultValue.default = defaultValue.value = typeof hiddenValue.value === 'string' ? hiddenValue.value : '';
            defaultValue.color = typeof hiddenValue.color === 'string' ? hiddenValue.color : '';
            defaultValue.canTransform = !!$inputs.can_transform.prop('checked');
            defaultValue.showColor = !!$inputs.show_color.prop('checked');
            defaultValue.required = !!$inputs.required.prop('checked');

            if (defaultValue.color !== '' && !defaultValue.showColor) {
                // Force showColor option
                defaultValue.showColor = true;
                $inputs.show_color.prop('checked', true);
            }

            if (!defaultValue.canTransform && (defaultValue.value.indexOf('icon-rotate:') !== -1 || defaultValue.value.indexOf('icon-transform:') !== -1)) {
                // Allow transformations
                defaultValue.canTransform = true;
                $inputs.can_transform.prop('checked', true);
            }

            $inputs.sub_options.val(keys.join('\n')).css('height', (14 + 21 * keys.length) + 'px');
            $inputs.default_value.val(JSON.stringify(defaultValue)).css('height', (14 + 21 * 3) + 'px');
            $inputs.data_type.val('array');
        }

        function setValuesDelayed() {
            setTimeout(setValues, 0);
        }

        Object.keys($inputs).forEach(function(key) {
            if ($inputs[key].length !== 1) {
                failed = true;
                return;
            }
            $containers[key] = $inputs[key].parents('.formRow:first');
            if ($containers[key].length !== 1) {
                failed = true;
            }
        });

        if (failed) {
            return;
        }

        checkDefaultValue();
        $inputs.edit_format.on('change', checkInput);
        setTimeout(checkInput, 0);
    });

}(jQuery, window, document);