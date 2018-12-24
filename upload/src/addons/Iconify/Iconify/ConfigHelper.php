<?php

namespace Iconify\Iconify;

class ConfigHelper
{
    const GIST = 'https://gist.github.com/cyberalien/b3295a0392d92ce159f59da6e138f858';

    /**
     * Messages returned by updateConfig()
     */
    const CONFIG_CHANGE_SUCCESS = 0;
    const CONFIG_NOT_WRITABLE = 1;
    const CONFIG_ALREADY_MODIFIED = 2;
    const CONFIG_CODE_NOT_FOUND = 3;

    /**
     * Get comment before Iconify code
     *
     * @return string
     */
    public static function getConfigStartComment()
    {
        return '/* Include Iconify code */';
    }

    /**
     * Get comment after Iconify code
     *
     * @return string
     */
    public static function getConfigEndComment()
    {
        return '/* End of Iconify code */';
    }

    /**
     * Get code to add to config.php
     *
     * @return string
     */
    public static function getConfigCode()
    {
        $ds = DIRECTORY_SEPARATOR;
        $file = "{$ds}addons{$ds}Iconify{$ds}Iconify{$ds}config.php";

        $code = "
\$iconifyConfigFile = __DIR__ . '" . addslashes($file) . "';
if (@file_exists(\$iconifyConfigFile))
{
    require(\$iconifyConfigFile);
}
";
        return $code;
    }

    /**
     * Add Iconify code to config
     *
     * @param string $config Old contents of config.php
     * @return bool|string Updated contents of config.php, false if code is already there
     */
    public static function addCodeToConfig($config)
    {
        if (strpos($config, 'Iconify') !== false)
        {
            return false;
        }

        return rtrim($config) . "\n\n" . self::getConfigStartComment() . self::getConfigCode() . self::getConfigEndComment() . "\n";
    }

    /**
     * Remove Iconify code from config.php
     *
     * @param string $config
     * @return bool|string
     */
    public static function removeCodeFromConfig($config)
    {
        $startComment = self::getConfigStartComment();
        $startIndex = strpos($config, $startComment);

        $endComment = self::getConfigEndComment();
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

    /**
     * Update config.php
     *
     * @param bool $add True if Iconify code should be added, false if removed
     * @return int
     */
    public static function updateConfig($add)
    {
        $configFile = \XF::getSourceDirectory() . DIRECTORY_SEPARATOR . 'config.php';

        if (!@file_exists($configFile) || !is_writable($configFile))
        {
            return self::CONFIG_NOT_WRITABLE;
        }

        $contents = @file_get_contents($configFile);
        if ($contents === false)
        {
            return self::CONFIG_NOT_WRITABLE;
        }

        // Try to add or remove code
        if ($add)
        {
            if (($contents = self::addCodeToConfig($contents)) === false)
            {
                // Code already exists
                return self::CONFIG_ALREADY_MODIFIED;
            }
        }
        else
        {
            if (($contents = self::removeCodeFromConfig($contents)) === false)
            {
                // Code already removed
                return self::CONFIG_ALREADY_MODIFIED;
            }
            if ($contents === true)
            {
                // Error removing contents. Cannot do anything because it will break add-on uninstallation
                return self::CONFIG_CODE_NOT_FOUND;
            }
        }

        // Attempt to write code to configuration
        if (!@file_put_contents($configFile, $contents))
        {
            return self::CONFIG_NOT_WRITABLE;
        }

        return self::CONFIG_CHANGE_SUCCESS;
    }
}