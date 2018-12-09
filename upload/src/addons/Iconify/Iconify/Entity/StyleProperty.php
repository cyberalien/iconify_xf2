<?php

namespace Iconify\Iconify\Entity;

use XF\Mvc\Entity\Structure;

class StyleProperty extends XFCP_StyleProperty
{
    public static function getStructure(Structure $structure)
    {
        $structure = parent::getStructure($structure);
        $structure->columns['property_type']['allowedValues'][] = 'icon';
        return $structure;
    }

    protected function _preSave()
    {
        if ($this->property_type === 'icon')
        {
            $this->css_components = [];
            $this->value_type = 'string';
            $this->value_parameters = '';
        }

        return parent::_preSave();
    }
}
