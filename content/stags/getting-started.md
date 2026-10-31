---
title: "Getting started"
description: "Install stags, grant Accessibility access, and try a tag view."
weight: 10
---

## Install and start

The Homebrew package requires Apple silicon, macOS 26 or later, and a logged-in desktop session. It moves windows through Accessibility and uses private macOS APIs to identify the active Space.

Install and start the foreground daemon:

```sh
brew install starkwm/formulae/stags
stags daemon
```

The daemon stays in the foreground. If macOS prompts for Accessibility access, grant it to the executable in System Settings > Privacy & Security > Accessibility, then start the daemon again. Its default control socket is `~/.config/stags/control.sock`.

## Choose a view

Use a second terminal for commands:

```sh
stags query
stags window set work chat
stags view work
stags view work chat
stags stop
```

The daemon starts with tag `1`. `window set work chat` assigns both tags to the focused window. `view work` shows windows tagged `work` and parks windows still on `1`. `view work chat` shows windows with either tag.

Before trying this with important windows, read [window recovery](/stags/recovery/). Applications may reject an off-screen move or clamp the window to the display.

## Run at login

After granting Accessibility permission, stop the foreground daemon before starting the Homebrew service:

```sh
brew services start stags
```

Run this as your desktop user, without `sudo`. To stop the service and disable startup at login, use `brew services stop stags`. Homebrew keeps the daemon running, so `stags stop` alone causes it to restart. Restore parked windows in each Space before stopping the service. See [window recovery](/stags/recovery/).

## Build from source

Source builds require Swift 6.2 or later:

```sh
git clone --branch v0.0.1 --depth 1 https://github.com/starkwm/stags.git
cd stags
make build
.build/debug/stags daemon
```

Use `.build/debug/stags` in place of `stags` in the other commands. A source build does not install a command on your `PATH` or a login service.

## Use it with swm

If [swm](/swm/) manages the same windows, use its floating layout. Automatic tiling can move a parked window back on screen. The two daemons do not coordinate their layouts yet.
