# MooMo

> [!WARNING]
> MooMo is still in a **very** experimental beta phase. Many features aren't fully tested and could break at any time. See [](#beta-usage) for more information.

A client-side "mod" designed for [Moodle](https://moodle.org/) sites. Provides functionality such as ~~a Python language server for [CodeRunner](https://coderunner.org.nz/) questions~~(coming soon), better math-based input fields for [STACK](https://stack-assessment.org/), and a feature-rich CSS reset ~~and theming~~(WIP) support. The mod is distributed as a chrome/firefox extension, an should be usable on all Chromium/Firefox-based browsers (If not, this is a bug).

## Beta usage

**Remember, at any point you may turn off the extension (at `chrome://extensions`/`about:addons`) in order to use the page as normal**. At this point in time major concerns are math input fields. If anything unexpected occurs while entering inputs into math fields, please [create an issue](https://github.com/wntiv-main/moomo/issues/new/choose) describing the problem. **NOTE**: you may not see errors in the math-field's translation into STACK until it is too late!! **YOU MAY LOSE MARKS TO THIS, USE AT YOUR OWN RISK** (though we try our best to display any error we can detect). In general, any "simple" expressions should work fine, but "complex" objects (derivatives, greek letters, matrices, etc) might be risky. Again, please [report](https://github.com/wntiv-main/moomo/issues/new/choose) anything you find not to work as expected.

### Known issues

- Coderunner questions dont always save until (pre-)checked (TODO: is this caused by us? ~ I belive this is intended behaviour not nice one tho) (copy before reloading)
- ~~Matrices not implemented inside math fields (disable ext.)~~(should work, not fully tested)
- Many LaTeX commands not implemented in math fields (WIP)

## Install

The extension can be installed by:

- Downloading the latest release build ~~[here](TODO)~~(TODO)
- Unzip the file to a known location (unless using firefox developer edition, see below)

In google chrome / chromium browsers:

- Go to `chrome://extensions` in a new tab
- Check the `Developer mode` toggle (note that some chromium-based browsers lay this out differently)
- Press `Load Unpacked`. A folder select dialog should pop up.
- Select the folder you unzipped before (this folder should contain a `manifest.json` file)
- You should now see the new Moodle UI when you access LEARN (You may need to reload any open tabs)

Or in firefox, as the extension is not currently Mozilla approved it can only be installed for the duration of a browser session:
- Go to `about:debugging#/runtime/this-firefox` in a new tab
- Press `Load Temporary Add-On...`. A file select dialog should pop up.
- Within the folder you unzipped before, select the `manifest.json` file
- You should now see the new Moodle UI when you access LEARN (You may need to reload any open tabs for full functionality)

Or in firefox developer edition, it can be installed permanently. For this you will not need to unpack the zip but instead rename it to have an .xpi extension:
- Setting the config `xpinstall.signatures.required` to `false` in `about:config`
- Go to `about:addons`
- Press Extensions > Settings (icon) > Install add-on from file...
- Select the .xpi file earlier renamed from the zip
- You should now see the new Moodle UI when you access LEARN (You may need to reload any open tabs for full functionality)

This installation process will become easier/smoother once the extension is approved in extension stores, but this will likely not happen until the extension is much more stable.

## Contributions

Contributions are welcome and encouraged! If you find a bug, please report it in our [GitHub Issues](https://github.com/wntiv-main/moomo/issues). For developers, PRs are welcome, especially for bugfixes or CSS tweaks. Try avoid subjective thematic/aesthetic CSS (that would be better in personal user/theme CSS) in PRs, limit to layout bugs, overflows, LEARN CSS overrides, etc. Suggestions for aesthetic design  choices can be made in [GitHub Issues](https://github.com/wntiv-main/moomo/issues).
