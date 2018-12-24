<?php

namespace Iconify\Iconify\Template;

class Templater extends XFCP_Templater
{
    protected $iconBoxCachedColorData = null;
    protected $resolvedIconColorsCache = [];

    /**
     * Render xf:iconbox element
     *
     * @param array $controlOptions
     * @return string
     */
    public function formIconBox(array $controlOptions)
    {
        $this->processDynamicAttributes($controlOptions);

        // Get value
        if (isset($controlOptions['value']))
        {
            $value = $controlOptions['value'];
            unset($controlOptions['value']);
        } else
        {
            $value = '';
        }

        // Decode value
        $format = 'object';
        if (!is_array($value))
        {
            $format = 'string';
            if (is_string($value) && substr($value, 0, 1) === '{')
            {
                // Try JSON
                $decoded = json_decode($value, true);
                if (is_array($decoded))
                {
                    $value = $decoded;
                    $format = 'json';
                }
            }
            if (is_string($value) && $format !== 'json' && preg_match('/^[a-z0-9:\-\s]+$/i', $value))
            {
                // Assume its icon name
                $value = [
                    'value' => $value,
                    'canTransform' => false
                ];
            }
            elseif ($format === 'string' && !is_array($value))
            {
                $value = [
                    'value' => '',
                    'canTransform' => false
                ];
            }
        }

        // Force JSON format - for admin panel where value could be different
        if (!empty($controlOptions['format']) && $controlOptions['format'] === 'json')
        {
            $format = 'json';
        }

        // Check for missing value
        if (!isset($value['value']))
        {
            $value['value'] = '';
        }

        // Save original value. Used to get original value when value is overwritten by custom attributes, such as option editor
        $originalValue = null;
        if (!empty($controlOptions['keep-original-value']) && $controlOptions['keep-original-value'] !== 'false')
        {
            $originalValue = json_encode($value);
        }

        // Get options from attributes
        $name = isset($controlOptions['name']) ? htmlspecialchars($controlOptions['name']) : '';
        $readonly = !empty($controlOptions['readonly']) && $controlOptions['readonly'] !== 'false';
        if (!$readonly && !empty($controlOptions['disabled']))
        {
            // alias of readonly
            $readonly = $controlOptions['disabled'] !== 'false';
        }
        if (!empty($controlOptions['can-transform']))
        {
            $value['canTransform'] = $controlOptions['can-transform'] !== 'false';
        }
        if (!empty($controlOptions['show-color']) && $format !== 'string')
        {
            $value['showColor'] = $controlOptions['show-color'] !== 'false';
        }
        if (isset($controlOptions['default']))
        {
            $value['default'] = $controlOptions['default'];
        }
        if (!empty($controlOptions['required']))
        {
            $value['required'] = $controlOptions['required'] !== 'false';
        }
        if (!empty($controlOptions['use-default']))
        {
            $value['value'] = $value['default'];
        }
        if (isset($controlOptions['default-color']) && empty($value['color']))
        {
            $value['color'] = $controlOptions['default-color'];
        }

        // Check options
        if ($format === 'string')
        {
            $showColor = false;
        }
        else
        {
            $showColor = !isset($value['color']) && !isset($value['showColor']) ? false : (!empty($value['showColor']) && $value['showColor'] !== 'false');
        }
        $canReset = $format !== 'string' && isset($controlOptions['can-reset']) && $controlOptions['can-reset'] === 'true';
        $alwaysShowColor = $showColor && !empty($controlOptions['always-show-color']) && $controlOptions['always-show-color'] !== 'false';

        // Get color palette and resolve color
        if ($showColor)
        {
            $colorData = $this->iconBoxCachedColorData;

            if ($colorData === null && $this->currentTemplateType === 'admin')
            {
                $colorData = null;
                /** @var \XF\Entity\Style $style */
                if ($this->styleId)
                {
                    $style = \XF::em()->find('XF:Style', $this->styleId, null);
                }
                else
                {
                    /** @var \XF\Repository\Style $stylesRepo */
                    $stylesRepo = \XF::repository('XF:Style');
                    $style = $stylesRepo->getMasterStyle();
                }
                if ($style)
                {
                    /** @var \XF\Repository\StyleProperty $propertiesRepo */
                    $propertiesRepo = \XF::repository('XF:StyleProperty');
                    $colorData = $propertiesRepo->getStyleColorData($style);
                    $this->iconBoxCachedColorData = $colorData;
                }
            }

            if (!isset($value['color']))
            {
                $resolvedColor = '';
            }
            elseif ($colorData === null && substr($value['color'], 0, 1) !== '#')
            {
                $resolvedColor = $this->fn('parse_less_color', [$value['color']]);
            }
            else
            {
                $resolvedColor = $value['color'];
            }
        }
        else
        {
            $colorData = null;
            $resolvedColor = '';
        }

        // Generate icon picker container
        $input = '<div data-value="' . htmlspecialchars(json_encode($value)) . '" data-format="' . $format . '" data-name="' . $name . '" data-xf-init="iconbox"' .
            ($readonly ? ' readonly="readonly"' : '') .
            ($canReset ? ' data-can-reset="true"' : '') .
            ' data-show-color="' . ($showColor ? 'true' : 'false') . '"' .
            ($originalValue !== null ? ' data-original-value="' . htmlspecialchars($originalValue) . '"' : '') .
            ($showColor && $colorData === null ? ' data-resolved-color="' . htmlspecialchars($resolvedColor) . '"' : '') .
            ($alwaysShowColor ? ' data-always-show-color="true"' : '') .
            '>';

        // Add hidden inputs
        if (strlen($name))
        {
            switch ($format)
            {
                case 'object':
                    foreach ($value as $attr => $attrValue)
                    {
                        $input .= '<input type="hidden" class="iconbox-input--' . $attr . '" name="' . $name . '[' . htmlspecialchars($attr) . ']" value="' . htmlspecialchars($attrValue) . '" />';
                    }
                    if ($canReset)
                    {
                        $input .= '<input type="hidden" class="iconbox-input--reset" name="' . $name . '[reset]" value="" />';
                    }
                    break;

                default:
                    $input .= '<input type="hidden" class="iconbox-input--value" name="' . $name . '" value="' . htmlspecialchars($format === 'json' ? json_encode($value) : $value['value']) . '" />';
            }
        }

        // Icon picker input
        $input .= '<div class="inputGroup inputGroup--joined inputGroup--iconbox' . ($readonly ? ' inputGroup--readonly' : '') . '">' .
            '<input type="text" class="input input--icon" spellcheck="false" ' . ($readonly ? 'readonly="readonly" ' : '') . '/>' .
            '<div class="inputGroup-text' . ($readonly ? ' inputGroup-text--disabled' : '') . ' js-iconbox-trigger"><span class="iconbox"><span class="iconbox-sample-container"></span></span></div>' .
            '</div>';

        // Color picker
        if ($showColor)
        {
            $params = [
                'name' => $this->fn('unique_id'),
                'value' => $resolvedColor,
                'row' => false,
                'showTxt' => false,
                'allowPalette' => $colorData !== null ? 'true' : '',
                'includeScripts' => true,
                'colorData' => $colorData,
            ];
            $input .= $this->callMacro('public:color_picker_macros', 'color_picker', $params, $this->defaultParams);
        }

        // Reset button
        if (isset($controlOptions['can-reset']) && $controlOptions['can-reset'] === 'true')
        {
            $input .= $this->formCheckBox([
                'name' => $this->fn('unique_id')
            ], [[
                'value' => '1',
                'label' => \XF::phrase('reset')
            ]]);
        }

        // Close container
        $input .= '</div>';

        // Include scripts and style
        $this->includeJs([
            'src' => 'iconify/search.js',
            'min' => 1
        ]);
        $this->includeJs([
            'src' => 'iconify/input.js'
        ]);
        $this->includeCss('public:iconify_search.less');
        $this->includeCss('public:iconify_arty.css');

        // Include translation
        $input .= $this->callMacro('public:iconify_macros', 'iconbox_phrases', [], $this->defaultParams);

        return $input;
    }

    /**
     * Render xf:iconboxrow element
     *
     * @param array $controlOptions
     * @param array $rowOptions
     * @return string
     */
    public function formIconBoxRow(array $controlOptions, array $rowOptions)
    {
        $this->addToClassAttribute($rowOptions, 'formRow--input', 'rowclass');

        $controlId = $this->assignFormControlId($controlOptions);
        $controlHtml = $this->formIconBox($controlOptions);
        return $this->formRow($controlHtml, $rowOptions, $controlId);
    }

    /**
     * Render xf:icon and xf:inlineicon elements
     *
     * @param boolean $inline
     * @param array $options
     * @return string
     */
    public function icon($inline, array $options)
    {
        if (!isset($options['value']))
        {
            return '';
        }

        $color = null;
        $is_array = false;

        if (!is_array($options['value']))
        {
            $value = $this->processAttributeToRaw($options, 'value', '', false);
            if (!is_string($value) || $value === '')
            {
                return '';
            }

            if (substr($value, 0, 1) === '{')
            {
                // Decode JSON
                $value = json_decode($value, true);
                if (!is_array($value))
                {
                    return '';
                }
                $is_array = true;
            }
            else
            {
                // Assume its icon name
                $icon = strpos($value, 'icon:') === false ? 'icon:' . $value : $value;
            }
        }
        else
        {
            // Array
            $value = $options['value'];
            unset($options['value']);
            $is_array = true;
        }

        if ($is_array)
        {
            if (!isset($value['value']) || !is_string($value['value']) || $value['value'] === '')
            {
                // Check for default value
                if (!isset($value['default']) || !is_string($value['default']) || $value['default'] === '')
                {
                    return '';
                }
                $icon = $value['default'];
            }
            else
            {
                $icon = $value['value'];
            }

            if (isset($value['color']) && is_string($value['color']) && $value['color'] !== '')
            {
                $color = $value['color'];
            }
            elseif (isset($value['defaultColor']) && is_string($value['defaultColor']) && $value['defaultColor'] !== '')
            {
                $color = $value['defaultColor'];
            }
        }

        // Generate element
        $htmlTag = $inline ? 'span' : 'iconify-icon';
        $html = '<' . $htmlTag;

        // Set class
        $className = $this->processAttributeToRaw($options, 'class', '', true);
        if ($className !== '')
        {
            $className = ' ' . $className;
        }
        $html .= ' class="iconify ' . htmlspecialchars($icon) . $className . '"';

        // Set style and color
        if (isset($options['color']))
        {
            $color = $options['color'];
            unset($options['color']);
        }
        if ($color !== null || isset($options['style']))
        {
            if (substr($color, 0, 1) !== '#')
            {
                if (isset($this->resolvedIconColorsCache[$color]))
                {
                    $color = $this->resolvedIconColorsCache[$color];
                }
                else
                {
                    $color = $this->fn('parse_less_color', [$color]);
                    $this->resolvedIconColorsCache[$color] = $color;
                }
            }
            $style = $this->processAttributeToRaw($options, 'style', '', true);
            $html .= ' style="' . ($color !== null ? 'color: ' . htmlspecialchars($color) . ';' : '') . $style . '"';
        }

        // Set other options
        foreach ($options as $key => $value)
        {
            if ($key === 'width' || $key === 'height' || $key === 'align' || $key === 'inline')
            {
                $key = 'data-' . $key;
            }
            $html .= ' ' . htmlspecialchars($key) . '="' . htmlspecialchars($value) . '"';
        }

        $html .= '></' . $htmlTag . '>';

        return $html;
    }

    /**
     * Return icon code
     *
     * @param $iconClasses
     * @param array $options
     * @return string
     */
    public function fontAwesome($iconClasses, array $options = [])
    {
        if (substr($iconClasses, 0, 5) === 'icon:')
        {
            $class = $this->processAttributeToRaw($options, 'class');
            if ($class)
            {
                $iconClasses = "{$iconClasses} {$class}";
            }

            $svgClasses = [];
            $spanClasses = [];
            foreach (explode(' ', $iconClasses) as $className)
            {
                switch ($className)
                {
                    case 'fa':
                    case 'far':
                    case 'fab':
                    case 'fas':
                    case 'fal':
                        break;

                    case 'fa-lg':
                    case 'fa-xs':
                    case 'fa-sm':
                    case 'fa-2x':
                    case 'fa-3x':
                    case 'fa-4x':
                    case 'fa-5x':
                    case 'fa-6x':
                    case 'fa-7x':
                    case 'fa-8x':
                    case 'fa-9x':
                    case 'fa-10x':
                    case 'fa-fw':
                        $spanClasses[] = $className;
                        break;

                    default:
                        $svgClasses[] = $className;
                }
            }
            $useContainer = count($spanClasses) > 0;

            $style = $this->processAttributeToRaw($options, 'style');
            if ($useContainer)
            {
                $style = 'position:relative; display:inline-block; min-width: 1em;' . $style;
            }

            $unhandledAttrs = $this->processUnhandledAttributes($options);

            return $useContainer ?
                '<span class="' . implode(' ', $spanClasses) . '" style="' . $style . '"' . $unhandledAttrs . '>&nbsp;<iconify-icon class="' . implode(' ', $svgClasses) . '" style="position: absolute; left: 50%; top: 50%; margin-left: -0.5em; margin-top: -0.5em;" data-width="1em" data-height="1em"></iconify-icon></span>' :
                '<iconify-icon class="' . implode(' ', $svgClasses) . '" style="' . $style . '"' . $unhandledAttrs . ' data-width="1em" data-height="1em"></iconify-icon>';

        }
        return parent::fontAwesome($iconClasses, $options);
    }
}
