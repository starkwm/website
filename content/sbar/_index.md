---
title: "sbar"
description: "A status bar for macOS built from native providers, shell commands, and plugins."
weight: 40
showDocList: false
homeSummary: "Keeps an eye on everything, up top."
homeHello: "I show."
homeSays: "\"type\": \"datetime\""
homeInstall: "brew install starkwm/formulae/sbar"
homeVersion: "v0.0.2"
homeDetails: "Show system information, media, and workspaces using native providers. Add shell commands and streaming plugins, then style the bar with JSON."
---

sbar draws a status bar on your displays. Each item comes from a native provider, such as battery or Spaces, a shell command, or a long-running plugin process. One JSON file describes the bar, and sbar reloads it when you save.

The latest prerelease is [v0.0.2](https://github.com/starkwm/sbar/releases/tag/v0.0.2), checked on 31 October 2026. This reference covers that release.

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

Create a configuration before starting the bar, as shown below.

## A minimal bar

Create the configuration directory:

```sh
mkdir -p ~/.config/sbar
```

Save this as `~/.config/sbar/config.jsonc`:

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

Check the configuration, then start the bar now and at login:

```sh
sbar validate
brew services start sbar
```

Run the service as your desktop user, without `sudo`. Use `brew services stop sbar` to stop it and disable startup at login, or `brew services restart sbar` to restart it. Homebrew keeps the process running, so `sbar stop` alone causes it to restart.

To try the bar in the foreground instead, run `sbar` after stopping any Homebrew service. Stop the foreground process with Ctrl-C or `sbar stop` from another terminal.

sbar reloads the file when it changes. If an edit is invalid, it keeps the last valid configuration. Run `sbar validate` to check your file, or `sbar query --diagnostics` to inspect errors. See [runtime commands](/sbar/configuration/refresh/#runtime-commands) for custom configuration paths and control sockets.

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

Use the [v0.0.2 configuration schema](/sbar/config.schema.json) for this release. It includes side bars, text fonts, group spacing and styles, and day/night overcast symbols. The linked examples also target v0.0.2. Run `sbar validate` to check constraints the schema cannot express.

## Build from source

Build the release from source:

```sh
git clone https://github.com/starkwm/sbar.git
cd sbar
git checkout v0.0.2
make build
```

Use `make release` for an optimised build in `.build/release`. The `sbar` executable is self-contained. Copy it to a directory on your `PATH` to use the CLI commands.

The commands in this reference assume `sbar` is on your `PATH`. From the source repository, add the debug build for the current terminal session:

```fish
fish_add_path --path "$PWD/.build/debug"
```

For later sessions, add the absolute directory containing `sbar` to your shell's `PATH`. You can also use `.build/debug/sbar` from the source repository whenever an example calls `sbar`.

Source builds do not install a login service. To start the bar at login, create a Launch Agent that runs the executable by its absolute path. Commands and plugins inherit that process's environment, so use absolute executable paths or configure its `PATH` explicitly.
