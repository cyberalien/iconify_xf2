# Iconify Integration

Iconify Integration add-on for XenForo 2.

This add-on adds the following functionality to XenForo 2:
* Template tags for icon picker: xf:iconbox and xf:iconboxrow
* Template tags for icon: xf:icon and xf:inlineicon
* Support for Iconify tags: ```<span class="iconify" data-icon="mdi-home"></span>``` and ```<iconify-icon data-icon="mdi-home"></iconify-icon>```

Add-on is available on XenForo: https://xenforo.com/community/resources/iconify-integration.6851/

## Compatibility

This add-on is compatible with:
* XenForo 2.0
* XenForo 2.1


## License

Add-on is dual licensed (meaning you can pick whatever license you want): Apache 2.0 or GPL 2.0

## Installation

Iconify Integration add-on creates new XenForo template engine tags. Because of that add-on must always be available as if it was part of XenForo core. That means add-on should run even when event listeners are disabled and add-ons are being installed/uninstalled or XenForo might throw errors.

Because of that add-on installation requires adding code to src/config.php that will make sure XenForo template engine always has Iconify tags available, so templates are always displayed properly.

If your src/config.php is writable, add-on will add all necessary code on installation, so you do not need to do anything. Add-on will also remove that code when its uninstalled. How to know if src/config.php is writable? Try to install add-on, it will show error if file is not writable.

If your src/config.php is not writable by PHP, you need to add code yourself.

How to add code to src/config.php:

* Below you can see code. Select all code (Ctrl+A on Windows, Cmd+A on Mac) and copy it (Ctrl+C on Windows, Cmd+C on Mac).
* Open src/config.php in any text editor, move cursor to end of file and paste code (Ctrl+V on Windows, Cmd+V on Mac).

If you are uninstalling Iconify Integration add-on, make sure you uninstall all add-ons and styles that depend on it first. Then you can uninstall Iconify Integration add-on and after that you can remove code from src/config.php.


```

/* Include Iconify code */
$iconifyConfigFile = __DIR__ . '/addons/Iconify/Iconify/config.php';
if (@file_exists($iconifyConfigFile))
{
  require($iconifyConfigFile);
}
/* End of Iconify code */

```

These instructions are not needed if your src/config.php is writable by PHP.
