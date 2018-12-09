<?php

namespace Iconify\Iconify\Admin\Controller;

use XF\Mvc\Entity\Entity;
use XF\Entity\StyleProperty as StylePropertyEntity;

class StyleProperty extends XFCP_StyleProperty
{
    protected function propertySaveProcess(\XF\Entity\StyleProperty $property)
    {
        $type = $this->filter('property_type', 'str', '');

        if ($type === 'icon')
        {
            $input = $this->filter([
                'style_id' => 'uint',
                'property_name' => 'str',
                'title' => 'str',
                'description' => 'str',
                'css_components' => 'array-str',
                'value_parameters' => 'str',
                'group_name' => 'str',
                'display_order' => 'uint',
                'depends_on' => 'str',
                'value_group' => 'str',
                'addon_id' => 'str'
            ]);

            $value = $this->filter('icon_value', 'str', '');
            if ($value === '')
            {
                // Also see: option.js, property.js, Entity/Option.php
                $value = json_encode([
                    'value' => '',
                    'default' => '',
                    'color' => '',
                    'showColor' => false,
                    'canTransform' => true,
                    'required' => false
                ]);
            }

            $input['property_type'] = $type;
            $input['property_value'] = $value;
            $input['value_type'] = 'string';

            $form = $this->formAction();
            $form->basicEntitySave($property, $input);
            return $form;
        }
        else
        {
            return parent::propertySaveProcess($property);
        }
    }
}
