<?php

namespace Iconify\Iconify;

use Iconify\Iconify\Template\Compiler\Tag\Icon;
use Iconify\Iconify\Template\Compiler\Tag\IconBoxRow;

class EventListener
{
    public static function appSetup(\XF\App $app)
    {
        $compiler = $app->templateCompiler();
        $templater = $app->templater();

        $compiler->setTag('icon', new Icon('icon'));
        $compiler->setTag('inlineicon', new Icon('inlineicon'));
        $compiler->setTag('iconbox', new IconBoxRow('iconbox'));
        $compiler->setTag('iconboxrow', new IconBoxRow('iconboxrow'));

        $templater->setPageParam('head.js-iconify', $templater->preEscaped('<script src="//code.iconify.design/1/1.0.0-rc5/iconify.min.js"></script>'));
    }
}
