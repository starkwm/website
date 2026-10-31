---
title: "stags"
description: "Tag windows and choose which groups to show in the active macOS Space."
weight: 50
homeSummary: "Sorts your windows into piles."
homeHello: "I tag."
homeSays: "stags view work chat"
homeInstall: "brew install starkwm/formulae/stags"
homeVersion: "v0.0.1"
---

`stags` assigns one or more tags to each window in the active macOS Space. Choose a view containing one or several tags, and it moves windows outside that view to a display edge. It does not switch native Spaces.

`stags` is an early implementation. Some applications refuse off-screen moves or leave a narrow strip visible. Read [window recovery](/stags/recovery/) before using it with windows you need to keep open.

These guides cover [stags v0.0.1](https://github.com/starkwm/stags/releases/tag/v0.0.1), available through Homebrew.

## Start here

1. [Install and start the daemon](/stags/getting-started/), then grant Accessibility permission.
2. [Assign tags and choose a view](/stags/tags-and-views/).
3. Use the [command reference](/stags/cli/) for window IDs, JSON queries, and socket options.

## Requirements

- macOS 26 or later
- Apple silicon for the Homebrew package
- Swift 6.2 or later to build from source
- Accessibility permission for the `stags` executable

`stags` also uses private macOS APIs to match windows with the active Space. macOS updates may change the behaviour it relies on.

## Try a tag view

Install with Homebrew and start the foreground daemon:

```sh
brew install starkwm/formulae/stags
stags daemon
```

Grant Accessibility permission in System Settings > Privacy & Security > Accessibility, then restart the daemon if needed. In another terminal, tag the focused window and show the `work` view:

```sh
stags window set work
stags view work
stags query
```

Run `stags stop` to restore parked windows and stop the daemon. If a parked window is on another macOS Space, switch to that Space and run `stags restore` first. The [getting started guide](/stags/getting-started/) explains the initial tag and how to run it at login.

## Use it with swm

If [swm](/swm/) manages the same windows, use its floating layout. Automatic tiling can move parked windows back on screen. The two daemons do not coordinate their layouts yet.
