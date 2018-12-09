<?php

namespace Iconify\Iconify\Entity;

use XF\Mvc\Entity\Structure;

class Option extends XFCP_Option
{
    protected $_resetIcon = false;

    public function getFormatParams()
    {
        if ($this->edit_format !== 'icon')
        {
            return parent::getFormatParams();
        }
        return $this->app()->stringFormatter()->createKeyValueSetFromString($this->edit_format_params);
    }

    public static function getStructure(Structure $structure)
    {
        $structure = parent::getStructure($structure);
        $structure->columns['edit_format']['allowedValues'][] = 'icon';
        return $structure;
    }

    protected function verifyOptionValue(&$optionValue)
    {
        if ($this->edit_format === 'icon')
        {
            if ($this->data_type !== 'array')
            {
                return false;
            }
            file_put_contents('_debug-' . $this->option_id . '.txt', print_r($optionValue, true));
            if (!empty($optionValue['reset']))
            {
                $this->_resetIcon = true;
            }
            unset($optionValue['reset']);
        }
        return parent::verifyOptionValue($optionValue);
    }

    protected function _preSave()
    {
        if ($this->edit_format === 'icon')
        {
            // Also see: option.js, property.js, Admin/Controller/StyleProperty.php
            $defaultValues = [
                'value' => '',
                'default' => '',
                'color' => '',
                'showColor' => false,
                'canTransform' => true,
                'required' => false
            ];

            // List of keys to copy from defaultValue to value
            $syncKeys = ['showColor', 'canTransform', 'required'];

            // Force sub_options and data_type
            $this->data_type = 'array';
            $this->sub_options = array_keys($defaultValues);

            // Validate default value
            $defaultValue = json_decode($this->getValue('default_value'), true);
            if (!is_array($defaultValue))
            {
                $defaultValue = [];
            }
            foreach ($defaultValues as $key => $value)
            {
                if (!isset($defaultValue[$key]))
                {
                    $defaultValue[$key] = $value;
                }
            }
            $defaultValue['showColor'] = $defaultValue['showColor'] || $defaultValue['color'] !== '';

            // Validate option value
            $optionValue = json_decode($this->getValue('option_value'), true);
            if (!is_array($optionValue))
            {
                $optionValue = [];
            }

            if ($this->_resetIcon)
            {
                // Force reset
                $optionValue = $defaultValue;
            }
            else
            {
                foreach ($defaultValues as $key => $value)
                {
                    // Set missing attributes, copy some attributes from default value
                    if (!isset($optionValue[$key]) || in_array($key, $syncKeys))
                    {
                        $optionValue[$key] = $defaultValue[$key];
                    }
                }

                // Reset color if it was disabled
                if ($optionValue['color'] !== '' && !$optionValue['showColor'])
                {
                    $optionValue['color'] = '';
                }
            }

            // Remove unused options to avoid triggering error in parent _postSave() if some leftover old/custom/temporary options remained
            foreach (array_keys($defaultValue) as $key)
            {
                if (!isset($defaultValues[$key]))
                {
                    unset($defaultValue[$key]);
                }
            }
            foreach (array_keys($optionValue) as $key)
            {
                if (!isset($optionValue[$key]))
                {
                    unset($optionValue[$key]);
                }
            }
            $this->default_value = json_encode($defaultValue);
            $this->option_value = $optionValue;
        }
        return parent::_preSave();
    }

    protected function validateDataTypeEditFormat($dataType, $editFormat)
    {
        if ($editFormat === 'icon')
        {
            if ($dataType != 'array')
            {
                $this->error(\XF::phrase('please_select_data_type_array_for_icon'), 'data_type');
                return false;
            }
            return true;
        }
        return parent::validateDataTypeEditFormat($dataType, $editFormat);
    }
}
