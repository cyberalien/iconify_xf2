<?php

namespace Iconify\Iconify\Template\Compiler\Tag;

use XF\Template\Compiler\Tag\AbstractTag;
use XF\Template\Compiler\Syntax\Tag;
use XF\Template\Compiler;

class Icon extends AbstractTag
{
    public function compile(Tag $tag, Compiler $compiler, array $context, $inlineExpected)
    {
        $options = $this->compileAttributesAsArray($tag->attributes, $compiler, $context);
        $inline = $tag->name === 'inlineicon' ? 'true' : 'false';

        $indent = $compiler->indent();
        $optionCode = "array(" . implode('', $options)  . "\n$indent)";

        return "{$compiler->templaterVariable}->icon($inline, $optionCode)";
    }
}
