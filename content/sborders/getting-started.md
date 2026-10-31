---
title: "Getting started"
description: "Install sborders, choose a configuration file, and start the border daemon."
weight: 10
---

## Install and start

Install v0.0.1 from the [StarkWM Homebrew tap](https://github.com/starkwm/homebrew-formulae/blob/main/Formula/sborders.rb). The package requires Apple silicon and macOS 26 or later.

```sh
brew install starkwm/formulae/sborders
sborders start
```

The daemon stays in the foreground. Press Ctrl-C to stop it, or run `sborders stop` from another terminal. It has no Dock icon and does not activate its border windows.

## Run at login

Stop any foreground sborders process before starting the Homebrew service:

```sh
brew services start sborders
```

Run this as your desktop user, without `sudo`. The service runs in your login session and starts again when you log in.

To stop it and disable startup at login:

```sh
brew services stop sborders
```

Use `brew services stop` for the service. Homebrew keeps it running, so `sborders stop` alone will cause it to restart. After configuration changes that need a restart, use `brew services restart sborders`.

## Configuration

At startup, sborders looks for `~/.config/sborders/config.jsonc`, then `config.json`. If neither exists, it starts with built-in defaults and watches `config.json`. If you create `config.jsonc` after starting with defaults, restart the daemon to use it.

Create the configuration directory before starting:

```sh
mkdir -p ~/.config/sborders
```

Save this as `~/.config/sborders/config.jsonc`:

```jsonc
{
  "$schema": "https://stark.software/sborders/config.schema.json",
  "width": 4,
  "activeColor": "#89B4FA",
  "inactiveColor": "#45475A80"
}
```

Check the file, then start sborders:

```sh
sborders validate
sborders start
```

To select a different file:

```sh
sborders start --config /path/to/config.jsonc
```

If the file you pass to `--config` is missing or invalid, sborders won't start. Once running, it keeps the last valid settings if you save an invalid edit. See [configuration](/sborders/configuration/) for how file settings and runtime changes interact.

## Permissions and compatibility

The default `windowServer` focus mode tracks windows through private WindowServer APIs. It does not request Accessibility permission. The optional `accessibility` focus mode uses the focused Accessibility window and requires permission in System Settings > Privacy & Security > Accessibility.

Private APIs can change between macOS releases. Missing required functions produce a startup error. Read [the validation record](/sborders/compatibility/) before relying on an untested OS version.

For initial testing, stop any other border daemon to avoid drawing two borders around the same windows.

## Mission Control

Borders hide temporarily while Mission Control is open and return after it closes. This also applies when the daemon starts during Mission Control. Changing settings during Mission Control won't make the borders reappear early. You don't need to configure this behaviour or grant extra permissions.

## Build from source

Source builds require Swift 6.2 or later:

```sh
git clone --branch v0.0.1 --depth 1 https://github.com/starkwm/sborders.git
cd sborders
make release
.build/release/sborders start
```

You can copy the release binary to a directory on your `PATH`. If you haven't installed it, replace `sborders` in the other commands with `.build/release/sborders`. A source build does not set up a login service.
