---
title: "sbar"
description: "Configure sbar for macOS."
weight: 40
showDocList: false
homeSummary: "A configurable status bar for macOS"
homeDetails: "Show system information, media, and workspaces using native providers. Add shell commands and streaming plugins, then style the bar with JSON."
---

Configure your macOS status bar with native providers, shell commands, and streaming plugins.

The latest prerelease is [v0.0.1](https://github.com/starkwm/sbar/releases/tag/v0.0.1), checked on 11 October 2026. This reference covers that release and marks settings that require an unreleased source build. See [release compatibility](#release-compatibility) before using those settings.

## Start here

1. [Create a configuration](/sbar/configuration/) and arrange items across your displays.
2. [Browse providers](/sbar/providers/) to compare their output, update behaviour, and options.
3. [Customise labels with text templates](/sbar/configuration/text-templates/).
4. [Style your items](/sbar/configuration/appearance/) and [control updates](/sbar/configuration/refresh/).

## Requirements and installation

sbar requires macOS 26 or later. Building from source requires Xcode 26 or later with Swift 6.2.

Install the release with Homebrew on Apple silicon:

```sh
brew tap starkwm/formulae
brew install starkwm/formulae/sbar
```

Start it now and at login:

```sh
brew services start sbar
```

Or build the release from source:

```sh
git clone https://github.com/starkwm/sbar.git
cd sbar
git checkout v0.0.1
make build
```

Use `make release` for an optimised build in `.build/release`. The `sbar` executable is self-contained. Copy it to a directory on your `PATH` to use the CLI commands.

The commands in this reference assume `sbar` is on your `PATH`. From the source repository, add the debug build for the current terminal session:

```sh
export PATH="$PWD/.build/debug:$PATH"
```

For later sessions, add the absolute directory containing `sbar` to your shell's `PATH`. You can also use `.build/debug/sbar` from the source repository whenever an example calls `sbar`.

Source builds do not install a login service. To start the bar at login, create a Launch Agent that runs the executable by its absolute path. Commands and plugins inherit that process's environment, so use absolute executable paths or configure its `PATH` explicitly.

## A minimal bar

Create the configuration directory:

```sh
mkdir -p ~/.config/sbar
```

Save this as `~/.config/sbar/config.jsonc`, then run `sbar`:

```json
{
  "schemaVersion": 1,
  "bar": {},
  "items": {
    "left": [
      { "id": "app", "type": "frontApplication" }
    ],
    "right": [
      { "id": "battery", "type": "battery" },
      { "id": "clock", "type": "datetime", "format": "HH:mm" }
    ]
  }
}
```

sbar reloads the file automatically. If an edit is invalid, it keeps the last valid configuration. Run `sbar validate` to check your file, or `sbar query --diagnostics` to inspect errors. Stop the bar with `sbar stop`. See [runtime commands](/sbar/configuration/refresh/#runtime-commands) for custom configuration paths and control sockets.

## A styled bar {#app-icons-battery-state-and-localized-date-and-time}

This configuration shows the menu-bar owner's native icon, battery state colours, and localised date and time. SF Symbols use a bold weight while text keeps its default regular weight.

```json
{
  "schemaVersion": 1,
  "bar": {},
  "theme": {
    "itemStyle": { "symbolFontWeight": "bold" }
  },
  "items": {
    "left": [
      {
        "id": "app",
        "type": "frontApplication",
        "symbol": "app",
        "frontApplication": { "showIcon": true }
      }
    ],
    "right": [
      {
        "id": "battery",
        "type": "battery",
        "battery": {
          "symbols": { "pluggedIn": "powerplug" },
          "tints": { "low": "#FF6655", "charging": "#66CC88" }
        }
      },
      {
        "id": "datetime",
        "type": "datetime",
        "dateStyle": "medium",
        "timeStyle": "short"
      }
    ]
  }
}
```

The app's `symbol` is a fallback if its native icon is unavailable. Battery icons appear by default; this battery block adds state colours and sets the plugged-in symbol. On battery power, the low-battery colour applies at 20% or below by default. Date and time styles follow the system locale. See [application icons](/sbar/providers/frontapplication/), [battery appearance](/sbar/providers/battery/), and [date and time](/sbar/providers/datetime/) for more options.

Use `sbar --version` to print the embedded version without starting the bar.

## Release compatibility

The following settings are available on `main` but are not in v0.0.1:

| Settings | Guide |
| --- | --- |
| Side bars, `bar.width`, and `bar.extendToTopEdge` | [Vertical bars](/sbar/configuration/#vertical-bars) |
| Text `fontFamily` | [Text fonts](/sbar/configuration/appearance/#text-fonts) |
| Group `itemSpacing` and `childStyle` | [Group spacing](/sbar/configuration/items/#group-spacing) |
| Weather `overcastDay` and `overcastNight` symbols | [Condition symbols](/sbar/providers/weather/#condition-symbols) |

Use the [v0.0.1 configuration schema](/sbar/config.schema.json) for the published release. The [development schema](/sbar/config.main.schema.json) matches [main at 7921050](https://github.com/starkwm/sbar/tree/7921050d6e8a5fe3899cc8b5370612dc814cf094) and includes unreleased settings. Run `sbar validate` as well to check constraints the schema cannot express.

For unreleased settings, keep a source clone on `main` instead of checking out v0.0.1, then run `make build`. The groups and vertical examples linked from these guides also require that source build. Values and date formats depend on your Mac and system locale.
