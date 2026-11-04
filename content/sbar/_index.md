---
title: "sbar"
description: "A status bar for macOS built from native providers, shell commands, and plugins."
weight: 40
showDocList: false
aliases: ["/sbar/main/"]
homeSummary: "Keeps an eye on everything, up top."
homeHello: "I show."
homeSays: "\"type\": \"datetime\""
homeInstall: "brew install starkwm/formulae/sbar"
homeDetails: "Show system information, media, and workspaces using native providers. Add shell commands and streaming plugins, then style the bar with JSON."
release:
  version: "v0.0.3"
  url: "https://github.com/starkwm/sbar/releases/tag/v0.0.3"
  checked: "3 November 2026"
  prerelease: true
schema: "/sbar/config.schema.json"
---

sbar draws a status bar on your displays. Each item in the bar comes from a native provider such as battery or Spaces, a shell command, or a plugin process that keeps running and streams updates. One JSON file describes the whole bar, and sbar reloads it when you save.

Homebrew installs v0.0.3, the release this reference covers. It added the [Reminders](/sbar/providers/reminders/), [Pomodoro](/sbar/providers/pomodoro/), and [agent activity](/sbar/providers/agent-activity/) providers.

## Start here

1. [Install sbar and start a minimal bar](/sbar/getting-started/).
2. [Write a configuration](/sbar/configuration/) and arrange items across your displays.
3. [Browse providers](/sbar/providers/) to compare their output, update behaviour, and options.
4. [Customise labels with text templates](/sbar/configuration/text-templates/).
5. [Style your items](/sbar/configuration/appearance/) and [control when they update](/sbar/configuration/refresh/).
6. Inspect and change the running bar from the [command line](/sbar/cli/).

## Requirements

- macOS 26 or later
- Apple silicon for the Homebrew package
- Xcode 26 or later with Swift 6.2 when building from source
