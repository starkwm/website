---
title: "Getting started"
description: "Install sbar, start a first bar, and build from source."
weight: 10
---

## Installation

Install the release with Homebrew on Apple silicon:

```sh
brew tap starkwm/formulae
brew install starkwm/formulae/sbar
```

Write a configuration before you start the bar.

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

Check the configuration, then start the bar now and at every login:

```sh
sbar validate
brew services start sbar
```

Run the service as your own user, without `sudo`. `brew services stop sbar` stops the bar and turns off startup at login, and `brew services restart sbar` restarts it. Homebrew keeps the process alive, so it starts the bar again after `sbar stop`.

To try the bar in the foreground instead, stop any Homebrew service and run `sbar`. Press Ctrl-C, or run `sbar stop` from another terminal, to stop it.

sbar reloads the file when it changes. If an edit is invalid, sbar keeps the last valid configuration. Run `sbar validate` to check the file, or `sbar query --diagnostics` to see what went wrong. The [command line](/sbar/cli/#start-the-bar) page covers custom configuration paths and control sockets.

## A styled bar

This configuration shows the menu-bar owner's own app icon, colours the battery by state, and shows the date and time in your locale. SF Symbols use a bold weight, and text keeps its default regular weight.

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

The app's `symbol` appears if its icon is unavailable. Battery icons appear by default. This battery block adds state colours and changes the plugged-in symbol. On battery power, the low colour applies at 20% or below by default. Date and time styles follow the system locale. See [front application](/sbar/providers/frontapplication/), [battery](/sbar/providers/battery/), and [date and time](/sbar/providers/datetime/) for more options.

`sbar --version` prints the version without starting the bar.

## Release compatibility

Use the [v0.0.3 configuration schema](/sbar/config.schema.json) with this release. It covers the Reminders, Pomodoro, and agent activity providers. The examples on this site also target v0.0.3. `sbar validate` checks rules the schema cannot express.

## Build from source

```sh
git clone https://github.com/starkwm/sbar.git
cd sbar
git checkout v0.0.3
make build
```

`make release` writes an optimised build to `.build/release`. The `sbar` executable is self-contained, so you can copy it to any directory on your `PATH`.

The commands on this site assume `sbar` is on your `PATH`. To add the debug build for the current terminal session, run this from the source repository:

```fish
fish_add_path --path "$PWD/.build/debug"
```

For later sessions, add the absolute path of the directory that holds `sbar` to your shell's `PATH`. You can also run `.build/debug/sbar` from the source repository wherever an example calls `sbar`.

A source build does not install a login service. To start the bar at login, create a Launch Agent that runs the executable by its absolute path. Commands and plugins inherit that process's environment, so use absolute paths to executables or set its `PATH` yourself.
