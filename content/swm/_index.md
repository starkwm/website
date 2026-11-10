---
title: "swm"
description: "A client and daemon for scriptable macOS window management."
weight: 20
homeSummary: "Moves your windows around so you don't have to."
homeHello: "I tile."
homeSays: "swm window warp right"
homeInstall: "brew install starkwm/formulae/swm"
homeDetails: "Move, resize, and focus windows from the command line, or tile them with master, monocle, or dwindle layouts. Query displays, Spaces, and windows as JSON, and run shell commands when windows or Spaces change."
release:
  version: "v0.0.32"
  url: "https://github.com/starkwm/swm/tree/v0.0.32"
  checked: "10 November 2026"
---

`swm` is a window manager you drive from the shell. One `swm` process runs as a daemon and keeps track of applications, displays, Spaces, and windows. Every other `swm` invocation sends one command to that daemon and prints the result.

Tiling is optional. Keep the default floating layout and bind swm commands to keys to move and focus windows, or give a Space the `master`, `monocle`, or `dwindle` layout and let swm arrange it.

swm borrows ideas from [yabai](https://github.com/asmvik/yabai). It replaces the JavaScript configuration of its predecessor, [Stark](https://github.com/starkwm/stark), with shell commands.

This reference covers v0.0.32. Read the [upgrade guide](/swm/upgrading/) before updating existing scripts.

## Start here

1. [Install swm and start the daemon](/swm/getting-started/), then grant Accessibility permission.
2. Learn [how commands work](/swm/cli/) and query what swm can see.
3. [Move and focus windows](/swm/windows/), or [choose a tiling layout](/swm/spaces-and-layouts/) for a Space.
4. Save your settings, [window rules](/swm/rules/), and [signals](/swm/signals/) in `swmrc` so the daemon applies them at startup.

## Requirements

- macOS 26 or later
- Accessibility permission for `swm`
- A Swift 6.4 toolchain and the macOS SDK when building from source

`swm` uses private macOS frameworks. A macOS update can change behaviour that it depends on.

## Try it

Install swm and start the daemon:

```sh
brew install starkwm/formulae/swm
brew services start swm
```

Grant Accessibility permission to `swm` in System Settings > Privacy & Security > Accessibility. Then, from any terminal:

```sh
swm query windows
swm config layout dwindle
swm window focus right
```

The first command prints every window swm tracks as JSON. The second tiles every current and future Space with the dwindle layout. The third focuses the nearest window to the right. Run `swm config layout float` to stop tiling.

## Use it with other tools

swm does not bind keys. Use [skbd](/skbd/) or another hotkey daemon to run its commands, as shown in [keyboard shortcuts](/swm/getting-started/#keyboard-shortcuts).

If [stags](/stags/) manages the same windows, keep swm on the floating layout. Automatic tiling can move windows that stags has parked back on screen.
