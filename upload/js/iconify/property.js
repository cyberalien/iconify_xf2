!function($, window, document, _undefined)
{
    "use strict";

    $(document).ready(function() {
        var $inputs = {
                // inputs
                property_type: $('input[name="property_type"]'),
                value: $('input[name="icon_value"]'),
                hidden: $('input.iconbox-input--value'),
                can_transform: $('input[name="edit_icon_transform[selected]"]'),
                show_color: $('input[name="edit_icon_color[selected]"]'),
                required: $('input[name="edit_icon_required[selected]"]')
            },
            defaultValue = {
                // Also see Admin/Controller/StyleProperty.php, option.js
                value: '',
                default: '',
                color: '',
                showColor: false,
                canTransform: true,
                required: false
            },
            keepValue = false;

        function checkDefaultValue() {
            var format, value;

            $inputs.property_type.each(function() {
                var $this = $(this);

                if ($this.prop('checked')) {
                    format = $this.attr('value');
                }
            });

            if (format === 'icon') {
                // Set values from default value
                value = $inputs.value.val();
                if (!value || value.slice(0, 1) !== '{') {
                    value = $inputs.hidden.val();
                }
                value = JSON.parse(value);

                Object.keys(defaultValue).forEach(function(key) {
                    if (value[key] !== void 0) {
                        defaultValue[key] = value[key];
                    }
                });

                keepValue = defaultValue.value !== defaultValue.default;
            }

            $inputs.can_transform.prop('checked', defaultValue.canTransform);
            $inputs.show_color.prop('checked', defaultValue.showColor);
            $inputs.required.prop('checked', defaultValue.required);

            setValuesDelayed();
        }

        function setValues() {
            var hiddenValue = JSON.parse($inputs.hidden.val());

            defaultValue.default = typeof hiddenValue.value === 'string' ? hiddenValue.value : '';
            if (!keepValue) {
                defaultValue.value = defaultValue.default;
            }
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

            $inputs.value.val(JSON.stringify(defaultValue));
        }

        function setValuesDelayed() {
            setTimeout(setValues, 0);
        }

        checkDefaultValue();

        $inputs.hidden.on('change', setValuesDelayed);
        $inputs.can_transform.on('change', setValues);
        $inputs.show_color.on('change', setValues);
        $inputs.required.on('change', setValues);
    });

}(jQuery, window, document);