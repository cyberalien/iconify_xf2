<?php

namespace Iconify\Iconify;

use XF\AddOn\AbstractSetup;
use XF\AddOn\StepRunnerInstallTrait;
use XF\AddOn\StepRunnerUninstallTrait;
use XF\AddOn\StepRunnerUpgradeTrait;

class Setup extends AbstractSetup
{
    use StepRunnerInstallTrait;
    use StepRunnerUpgradeTrait;
    use StepRunnerUninstallTrait;

    public function installStep1()
    {
        $schema = $this->schemaManager();

        $schema->alterTable('xf_option', function($table)
        {
            try
            {
                $table->changeColumn('edit_format')->addValues(['icon']);
            }
            catch (\LogicException $e)
            {
            }
        });

        $schema->alterTable('xf_style_property', function($table)
        {
            try
            {
                $table->changeColumn('property_type')->addValues(['icon']);
            }
            catch (\LogicException $e)
            {
            }
        });
    }

    protected function checkIconifyUsage()
    {
        // Check if there are options relying on Iconify
        $finder = \XF::app()->finder('XF:Option');
        $finder->where('edit_format', 'icon');
        $options = $finder->fetch()->toArray();
        if (count($options))
        {
            throw new \LogicException('Cannot uninstall Iconify because following ' . (count($options) > 1 ? 'options use' : 'option uses') . ' Iconify: ' . implode(', ', array_keys($options)));
        }

        // Check if there are style properties relying on Iconify
        $finder = \XF::app()->finder('XF:StyleProperty');
        $finder->where('property_type', 'icon');
        $properties = $finder->fetch()->toArray();
        if (count($properties))
        {
            $keys = [];
            foreach ($properties as $prop)
            {
                $keys[$prop->property_name] = true;
            }
            throw new \LogicException('Cannot uninstall Iconify because following style ' . (count($keys) > 1 ? 'properties use' : 'property uses') . ' Iconify: ' . implode(', ', array_keys($keys)));
        }
    }

    public function uninstallStep1()
    {
        $this->checkIconifyUsage();

        $schema = $this->schemaManager();

        $schema->alterTable('xf_option', function($table)
        {
            try
            {
                $table->changeColumn('edit_format')->removeValues(['icon']);
            }
            catch (\LogicException $e)
            {
            }
        });

        $schema->alterTable('xf_style_property', function($table)
        {
            try
            {
                $table->changeColumn('property_type')->removeValues(['icon']);
            }
            catch (\LogicException $e)
            {
            }
        });
    }

}
