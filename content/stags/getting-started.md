---
title: "Getting started"
description: "Build stags, grant Accessibility access, and try a tag view."
weight: 10
---

## Build and start

`stags` requires macOS 26 or later, Swift 6.2 or later to build, and a logged-in desktop session. It moves windows through Accessibility and uses private macOS APIs to identify the active Space.

From the [source repository](https://github.com/starkwm/stags):

```sh
git clone https://github.com/starkwm/stags.git
cd stags
swift build
swift run stags daemon
```

The daemon stays in the foreground. If macOS prompts for Accessibility access, grant it to the executable in System Settings > Privacy & Security > Accessibility, then start the daemon again. Its default control socket is `~/.config/stags/control.sock`.

## Choose a view

Use a second terminal for commands:

```sh
swift run stags query
swift run stags window set work chat
swift run stags view work
swift run stags view work chat
swift run stags stop
```

The daemon starts with tag `1`. `window set work chat` assigns both tags to the focused window. `view work` shows windows tagged `work` and parks windows still on `1`. `view work chat` shows windows with either tag.

The other guides use `stags` as the command name. From a source build, use `swift run stags` or `.build/debug/stags` instead. A source build does not install a command on your `PATH` or a login service.

Before trying this with important windows, read [window recovery](/stags/recovery/). Applications may reject an off-screen move or clamp the window to the display.

## Use it with swm

If [swm](/swm/) manages the same windows, choose its floating layout. Automatic tiling can move a parked window back on screen. The daemons do not yet coordinate layouts.
