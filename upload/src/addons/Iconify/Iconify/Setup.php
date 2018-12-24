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

    /**
     * Check requirements
     *
     * @param array $errors
     * @param array $warnings
     */
    public function checkRequirements(&$errors = [], &$warnings = [])
    {
        $gistLink = ConfigHelper::GIST;

        $result = ConfigHelper::updateConfig(true);
        switch ($result) {
            case ConfigHelper::CONFIG_CHANGE_SUCCESS:
            case ConfigHelper::CONFIG_ALREADY_MODIFIED:
                break;

            case ConfigHelper::CONFIG_NOT_WRITABLE:
                $errors[] = 'Iconify requires modifications to src/config.php. Please make src/config.php writable or append code to src/config.php from following Gist (copy link and open it in new browser window): ' . $gistLink;
                break;

            default:
                // Unknown error
                $errors[] = 'Iconify requires modifications to src/config.php. Please make src/config.php writable or append code to src/config.php from following Gist (copy link and open it in new browser window): ' . $gistLink;
        }
    }

    /**
     * Add database stuff
     */
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

    /**
     * Remove database stuff
     */
    public function uninstallStep1()
    {
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

        // Disable all template modifications
        // See https://xenforo.com/community/threads/template-modifications-are-active-after-add-on-uninstallation-via-cmd-php.158304/#post-1308831
        $finder = \XF::finder('XF:TemplateModification');
        $finder->where('addon_id', 'Iconify/Iconify');
        foreach ($finder->fetch() as $tm)
        {
            $tm->enabled = false;
            $tm->save();
        }
    }

    /**
     * Remove code from config.php if possible
     */
    public function uninstallStep2()
    {
        ConfigHelper::updateConfig(false);
    }
}
