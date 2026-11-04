---
title: "sborders"
description: "Configurable window borders for macOS, with focus tracking and live configuration reloads."
weight: 60
homeSummary: "Puts a border around your windows."
homeHello: "I outline."
homeSays: "sborders set width 6"
homeInstall: "brew install starkwm/formulae/sborders"
release:
  version: "v0.0.1"
  url: "https://github.com/starkwm/sborders/releases/tag/v0.0.1"
---

`sborders` draws a border around each application window and redraws it as focus changes and windows move or resize. It works with [swm](/swm/) or any other window manager, and alongside [skbd](/skbd/) and [sbar](/sbar/).

## Start here

1. [Install and start sborders](/sborders/getting-started/).
2. [Configure colours, width, and application filters](/sborders/configuration/).
3. Use the [command reference](/sborders/cli/) to inspect borders or change settings while running.

## Requirements

- macOS 26 or later and a logged-in desktop session
- Apple silicon for the Homebrew package
- Swift 6.2 or later to build from source

The default focus mode does not request Accessibility permission. The optional Accessibility focus mode requires it. `sborders` uses private macOS APIs. The [compatibility guide](/sborders/compatibility/) explains which setups still need testing.

## Install and try it

```sh
brew install starkwm/formulae/sborders
sborders start
```

The daemon runs in the foreground. With no configuration file, it uses a four-point border with a light active colour and transparent inactive colour. Press Ctrl-C to stop it.

Create `~/.config/sborders/config.jsonc` before starting to change the appearance:

```jsonc
{
  "$schema": "https://stark.software/sborders/config.schema.json",
  "width": 4,
  "activeColor": "#89B4FA",
  "inactiveColor": "#45475A80"
}
```

`sborders` reloads the selected file when you save it. If an edit is invalid, it keeps the last valid settings. See [getting started](/sborders/getting-started/#configuration) for file selection and validation.
