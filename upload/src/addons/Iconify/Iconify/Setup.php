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

    protected function getConfigStartComment()
    {
        return '/* Include Iconify code */';
    }

    protected function getConfigEndComment()
    {
        return '/* End of Iconify code */';
    }

    protected function getIncludedConfigFile()
    {
        return '/addons/Iconify/Iconify/config.php';
    }

    protected function getConfigCode()
    {
        return 'require(__DIR__ . \'' . $this->getIncludedConfigFile() . '\');';
    }

    protected function addCodeToConfig($config)
    {
        $link = $this->getIncludedConfigFile();
        if (strpos($config, $link) !== false)
        {
            return false;
        }

        return rtrim($config) . "\n\n" . $this->getConfigStartComment() . "\n" . $this->getConfigCode() . "\n" . $this->getConfigEndComment() . "\n";
    }

    protected function removeCodeFromConfig($config)
    {
        $startComment = $this->getConfigStartComment();
        $startIndex = strpos($config, $startComment);

        $endComment = $this->getConfigEndComment();
        $endIndex = strpos($config, $endComment);

        if ($startIndex === false && $endIndex === false)
        {
            // Nothing to remove
            return false;
        }
        if ($startIndex === false || $endIndex === false || $endIndex < $startIndex)
        {
            // Broken comment
            return true;
        }

        return rtrim(substr($config, 0, $startIndex)) . "\n\n" . ltrim(substr($config, $endIndex + strlen($endComment)));
    }

    protected function updateConfig($add)
    {
        $configFile = \XF::getSourceDirectory() . '/config.php';

        if (!@file_exists($configFile))
        {
            return false;
        }

        $contents = @file_get_contents($configFile);
        if ($contents === false)
        {
            return false;
        }

        // Try to add or remove code
        if ($add)
        {
            if (($contents = $this->addCodeToConfig($contents)) === false)
            {
                // Code already exists
                return true;
            }
        }
        else
        {
            if (($contents = $this->removeCodeFromConfig($contents)) === false)
            {
                // Code already removed
                return true;
            }
            if ($contents === true)
            {
                // Error removing contents. Cannot do anything because it will break add-on uninstallation
                return true;
            }
        }

        // Attempt to write code to configuration
        if (!@file_put_contents($configFile, $contents))
        {
            return false;
        }

        return true;
    }

    public function checkRequirements(&$errors = [], &$warnings = [])
    {
        if (!$this->updateConfig(true))
        {
            $errors[] = 'Iconify requires modifications to src/config.php. Please append code to src/config.php from following Gist (copy link and open it in new browser window): https://gist.github.com/cyberalien/b3295a0392d92ce159f59da6e138f858';
        }
    }

    public function installStep1()
    {
        if (!$this->updateConfig(true))
        {
            throw new \LogicException('test');
        }

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
        /*
        $this->checkIconifyUsage();

        if (!$this->updateConfig(false))
        {
            throw new \LogicException('test');
        }
        */

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
