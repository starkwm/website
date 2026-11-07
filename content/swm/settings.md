---
title: "Global settings"
description: "Defaults for every Space, focus-follows-mouse, and window animation."
weight: 50
---

## Set global defaults

`swm config` commands change settings in the running daemon. Layout, padding, and gap settings also apply to Spaces that swm finds later.

```sh
swm config layout <float|master|monocle|dwindle>
swm config focus-follows-mouse <off|autofocus|autoraise>
swm config master-ratio <ratio>
swm config master-placement <left|right|top|bottom|next|prev>
swm config split-ratio <ratio>
swm config preserve-split <on|off>
swm config animation-duration <seconds>
swm config animation-easing <linear|ease-out-quad|ease-out-cubic|ease-out-circ|ease-in-out-quad>
swm config gap <points>
swm config padding [<points>] [--top <points>] [--bottom <points>] [--left <points>] [--right <points>]
```

| Setting | Built-in default |
| --- | --- |
| `layout` | `float` |
| `focus-follows-mouse` | `off` |
| `master-ratio`, `split-ratio` | `0.5` |
| `master-placement` | `left` |
| `preserve-split` | `off` |
| `animation-duration` | `0`, no animation |
| `gap`, `padding` | `0` |

Master and split ratios must be from `0.1` through `0.9`. Apart from focus-follows-mouse and animation, a new value replaces every Space's own setting and becomes the default for future Spaces. A padding value without a flag applies to every side. With side flags alone, padding only changes the sides you pass.

Leave out the value to print the current setting, as in `swm config gap` or `swm config padding`. Put the commands you want at startup in [`swmrc`](/swm/getting-started/#configuration-file).

For `layout`, `master-ratio`, `master-placement`, `split-ratio`, `preserve-split`, `padding`, and `gap`, add `--space current` or `--space <space-index>` to read or change only that Space. Without it, reads return the global default and writes affect all current Spaces and future defaults. Animation and focus-follows-mouse settings reject `--space`.

## Adjust global settings

Gap, padding, master ratio, and split ratio also take a signed change:

```sh
swm config gap +2
swm config padding --top -2 --bottom +2
swm config master-ratio -0.05
swm config split-ratio -0.05
```

swm adds the change to the current global value, then applies the result to every Space and to future Spaces. It replaces any per-Space value for that setting. With a global gap of `6` and a Space gap of `20`, `swm config gap +2` sets both to `8`. Gaps and padding stop at zero, and ratios stay within `0.1` through `0.9`. Run `swm config gap 0` to remove the gap.

A global split-ratio change also rebalances existing dwindle splits, replacing adjustments made to single splits, and sets the ratio for new splits. Split directions stay the same. To change one Space, use the matching [`swm config --space` command](/swm/spaces-and-layouts/#configure-a-space).

## Set padding on all sides

`swm config padding` and `swm config padding --space current` both take an optional padding value without a flag:

```sh
swm config padding 8
swm config padding 8 --top +2
swm config padding --space 2 +2 --top 12
swm config padding --space=2 -2
```

An unsigned value sets every side, and a signed value adjusts each side from its current padding. Side flags win over the plain value, whatever order you write them in. `swm config padding 8 --top +2` adds 2 to the current global top padding and sets the other three sides to 8. It does not add 2 to 8.

Global changes start from the current global padding, apply the changed sides to every Space, and update the default for future Spaces. Space changes start from that Space's padding and leave the global defaults alone. Padding never goes below zero.

With side flags alone, the sides you leave out keep their padding. With no values, the command prints `--top <points> --bottom <points> --left <points> --right <points>`.

## Cycle global master placement

```sh
swm config master-placement next
swm config master-placement prev
```

`next` moves the master window's edge from `left` to `top`, `right`, `bottom`, and back to `left`. `prev` goes the other way. swm starts from the current global edge, applies the result to every Space, replacing their own placements, and makes it the default for future Spaces. The command prints the new edge, such as `top`.

Leave out the argument to print the global edge, or pass `left`, `right`, `top`, or `bottom` to set it. `swm config master-placement --space current next` and `prev` cycle a single Space from its own edge.

## Window animation

Window animation is off by default. Turn it on with a duration in seconds, from 0 through 1:

```sh
swm config animation-duration 0.18
swm config animation-easing ease-out-circ
```

swm then animates swaps, layout changes, and the `move`, `resize`, and `grid` commands. Set the duration back to `0` to finish running animations and return to instant movement. macOS Reduce Motion overrides this setting. Add both commands to `swmrc` to turn animation on at startup.

The easing curves are `linear`, `ease-out-quad`, `ease-out-cubic`, `ease-out-circ`, and `ease-in-out-quad`. The default is `ease-out-quad`, and `ease-out-circ` is closest to yabai's default. A new curve applies to animations that start or change destination after you set it. Running animations keep their curve.

With animation on, geometry commands return as soon as swm queues the movement. Repeated relative moves and resizes add up from the pending destination, not the current frame. Moving a window to another display is always instant and cancels its animation. How smooth an animation looks depends on the app.

### Dragging during an animation

Dragging or resizing a window with the mouse stops its animation until you let go. swm then recalculates the layout. A click without a drag leaves the animation running. During a drag, geometry commands fail and placement [rules](/swm/rules/) wait for the mouse release.

### Timing and corrections

Each active display drives animation updates at up to 60 Hz. With no display, swm uses a 60 Hz timer. If a display sends no updates for two seconds, swm jumps that display's animations to their destination. Animations on other displays carry on.

swm reads and writes window frames through Accessibility, one call at a time per app, so a slow app does not hold up animations in other apps. A new frame replaces any frame still waiting to be written. 100 ms after the final write, swm checks the window's position and size. If the frame is wrong, swm corrects it once and checks again 100 ms later. These checks do not block other windows in the same app, and a newer request or a cancellation discards them.

An Accessibility call can still finish after swm cancels its animation. swm drops the queued updates and ignores the late result. Synchronous geometry commands wait for any call in progress before they move or resize the window.
