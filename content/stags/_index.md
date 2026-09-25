---
title: "stags"
description: "Tag windows and choose which groups to show in the active macOS Space."
weight: 25
homeSummary: "Window tags within a macOS Space"
---

`stags` assigns one or more tags to each window in the active macOS Space. Choose a view containing one or several tags, and it moves windows outside that view to a display edge. It does not switch native Spaces.

`stags` is an early implementation. Some applications refuse off-screen moves or leave a narrow strip visible. Read [window recovery](/stags/recovery/) before using it with windows you need to keep open.

## Start here

1. [Build and start the daemon](/stags/getting-started/), then grant Accessibility permission.
2. [Assign tags and choose a view](/stags/tags-and-views/).
3. Use the [command reference](/stags/cli/) for window IDs, JSON queries, and socket options.

## Requirements

- macOS 26 or later
- Swift 6.2 or later to build from source
- Accessibility permission for the `stags` executable

`stags` also uses private macOS APIs to match windows with the active Space. macOS updates may change the behaviour it relies on.

## Try a tag view

Build from [source](https://github.com/starkwm/stags) and start the foreground daemon:

```sh
git clone https://github.com/starkwm/stags.git
cd stags
make build
.build/debug/stags daemon
```

In another terminal, tag the focused window and show the `work` view:

```sh
.build/debug/stags window set work
.build/debug/stags view work
.build/debug/stags query
```

Run `.build/debug/stags stop` to restore parked windows and stop the daemon. If a parked window is on another macOS Space, switch to that Space and run `.build/debug/stags restore` first. The [getting started guide](/stags/getting-started/) explains the initial tag and how to run commands from a source build.

## Use it with swm

If [swm](/swm/) manages the same windows, use its floating layout. Automatic tiling can move parked windows back on screen. The two daemons do not coordinate their layouts yet.
