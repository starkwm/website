---
title: "Spaces and layouts"
description: "Choose a tiling layout, switch Spaces, and change settings for one Space."
weight: 40
---

## Layouts

Each Space uses one of four layouts:

- `float` leaves windows where you put them. This is the default.
- `master` puts one window against the chosen edge and stacks the rest beside it.
- `monocle` stretches every tiled window across the available area, one on top of another.
- `dwindle` splits the available area in two around the focused window, again and again.

In a dwindle layout, a new window splits the focused tiled window. Closing a window gives its space to the sibling branch. Splits normally follow the longest edge. `swm config preserve-split --space current on` keeps each branch's direction instead, and `swm window toggle-split` changes it.

Each physical display has its own tiling layout, even when macOS's **Displays have separate Spaces** setting is off. A tiled window moved to another display joins that display's layout. If you drag or resize a tiled window by hand, it snaps back into place.

## Dwindle size limits {#dwindle-size-recovery}

Dwindle keeps the requested split ratios and directions when an app refuses a smaller tile. The app can remain larger, overlap neighbouring tiles, or extend beyond the display. Other tiles keep their planned positions. swm does not adjust allocations around observed size limits or restore an earlier arrangement.

After a refused arrangement, swm logs an unsatisfied layout and avoids repeating it during background reflows. Explicit layout adjustments or finishing a move or resize with the pointer allow another attempt.

## Activate a Space

```sh
swm query spaces
swm space activate <space-index>
```

Pass the `index` from `swm query spaces`. swm changes the visible desktop on that Space's display, without moving keyboard focus between displays. The display must contain only normal desktop Spaces. swm refuses a display that has a native fullscreen Space.

swm waits up to two seconds for the display to report the new Space. A timeout or cancellation does not mean the Space stayed the same, so query the state before you retry.

`space activate` needs v0.0.26 or later.

## Configure a Space

Use `swm config` with `--space current` for the active Space, or `--space <space-index>` for another Space. Without `--space`, writes change all current Spaces and future defaults, and reads return the global default. The index is the one-based `index` from `swm query spaces`. It follows the current Space order, so it changes when you reorder Spaces.

```sh
swm config layout --space <current|space-index> [<float|master|monocle|dwindle>]
swm config master-ratio --space <current|space-index> [<ratio>]
swm config master-placement --space <current|space-index> [<left|right|top|bottom|next|prev>]
swm config split-ratio --space <current|space-index> [<ratio>]
swm config preserve-split --space <current|space-index> [<on|off>]
swm config padding --space <current|space-index> [<points>] [--top <points>] [--bottom <points>] [--left <points>] [--right <points>]
swm config gap --space <current|space-index> [<points>]
```

An unsigned value sets a ratio, padding, or gap. A signed value such as `+2` or `-2` adjusts it. Master and split ratios must be from `0.1` through `0.9`, and swm clamps adjustments to that range. Padding and gaps never go below zero.

A padding value without a flag sets or adjusts every side. With side flags alone, the sides you leave out keep their values. [Set padding on all sides](/swm/settings/#set-padding-on-all-sides) explains how the two combine. A Space's settings apply on every display that shows it.

## Read Space settings

Leave out the value to print a setting without changing it:

```sh
swm config layout --space current
swm config master-ratio --space current
swm config master-placement --space current
swm config split-ratio --space current
swm config preserve-split --space current
swm config gap --space current
swm config padding --space 2
```

Each command prints the value in the form its setting command accepts. Padding prints `--top <points> --bottom <points> --left <points> --right <points>`, and split preservation prints `on` or `off`.

Reading the layout, master ratio, master placement, split ratio, or split preservation fails when automatic tiling is unavailable for that Space.

## Set dwindle split ratios

The split ratio is the share of each dwindle split that goes to the left or upper side. The built-in default is `0.5`.

```sh
swm config split-ratio --space current 0.6
swm config split-ratio --space 2 +0.05
```

Setting or adjusting a Space's ratio rebalances every dwindle split in that Space and applies to new splits on every display that shows it. Split directions stay the same. Both reading and writing fail when automatic tiling is unavailable for that Space.

This replaces any adjustments you made to single splits in that Space. Use `swm window split-ratio` afterwards to change only the split nearest a window. That command leaves the Space's ratio for new splits alone.

To change these settings on every Space, use the [global settings](/swm/settings/).
