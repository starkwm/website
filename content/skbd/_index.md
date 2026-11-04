---
title: "skbd"
description: "A keyboard shortcut daemon for macOS built on Quartz Event Services."
weight: 30
homeSummary: "Turns key presses into shell commands."
homeHello: "I listen."
homeSays: "hyper - t: open -a Terminal"
homeInstall: "brew install starkwm/formulae/skbd@2"
homeDetails: "Bind key combinations to shell commands, including bindings that tell left and right modifier keys apart. skbd reloads its configuration when you save it, so a new shortcut works without a restart."
release:
  version: "v0.0.8"
  url: "https://github.com/starkwm/skbd/releases/tag/v0.0.8"
  checked: "31 October 2026"
  prerelease: true
---

skbd runs a shell command when you press a shortcut. It watches key presses through [Quartz Event Services](https://developer.apple.com/documentation/coregraphics/quartz-event-services), so a binding can tell the left and right modifier keys apart.

Each line of the configuration file is one binding:

```text
hyper - t: open -a Terminal
lcmd + shift - k: open -a Safari
```

skbd reloads the file when you save it, so a new binding works straight away.

## Start here

1. [Install skbd](/skbd/getting-started/), write a first binding, and grant Accessibility permission.
2. [Write bindings](/skbd/configuration/) with modifiers, named keys, and key codes.
3. Pair it with [swm](/swm/getting-started/#keyboard-shortcuts) to move windows from the keyboard.

## Requirements

- macOS 26 or later
- Accessibility permission for `skbd`
- Xcode 26 or later with Swift 6.2 when building from source
