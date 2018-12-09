<?php

namespace Iconify\Iconify\Template\Compiler\Tag;

use XF\Template\Compiler\Tag\AbstractFormElement;
use XF\Template\Compiler\Syntax\Tag;
use XF\Template\Compiler;

class IconBoxRow extends AbstractFormElement
{
    public function compile(Tag $tag, Compiler $compiler, array $context, $inlineExpected)
    {
        return $this->compileTextInput('IconBox', $tag->name == 'iconboxrow', $tag, $compiler, $context);
    }
}
