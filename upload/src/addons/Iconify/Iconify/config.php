<?php

/**
 * Extend Templater class, which cannot be done properly via event listeners.
 */

use Iconify\Iconify\Template\Compiler\Tag\Icon;
use Iconify\Iconify\Template\Compiler\Tag\IconBoxRow;

/** @var \XF\Container $c */
$c['templateCompiler'] = function ($c)
{
    $compiler = new \XF\Template\Compiler();

    $compiler->setTag('icon', new Icon('icon'));
    $compiler->setTag('inlineicon', new Icon('inlineicon'));
    $compiler->setTag('iconbox', new IconBoxRow('iconbox'));
    $compiler->setTag('iconboxrow', new IconBoxRow('iconboxrow'));

    return $compiler;
};

$c['templater'] = function ($c)
{
    switch ($c['app.classType'])
    {
        case 'Install':
            $class = '\XF\Install\Templater';
            break;

        default:
            $class = '\XF\Template\Templater';
    }

    $class = $this->extendClass($class);
    class_alias($class, 'Iconify\\Iconify\\Template\\XFCP_Templater');

    $templater = $this->setupTemplaterObject($c, 'Iconify\\Iconify\\Template\\Templater');

    $templater->setPageParam('head.js-iconify', $templater->preEscaped('<script src="//code.iconify.design/1/1.0.0-rc5/iconify.min.js"></script>'));

    return $templater;
};
