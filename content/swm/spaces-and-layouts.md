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

In a dwindle layout, a new window splits the focused tiled window. Closing a window gives its space to the sibling branch. Splits normally follow the longest edge. `swm space preserve-split on` keeps each branch's direction instead, and `swm window toggle-split` changes it.

Each physical display has its own tiling layout, even when macOS's **Displays have separate Spaces** setting is off. A tiled window moved to another display joins that display's layout. If you drag or resize a tiled window by hand, it snaps back into place.

## Dwindle size recovery

Some apps keep a window larger than swm asks for. When an app does this repeatedly, dwindle records the size the app refused and tries to fit the layout around it. The configured split ratio does not change, but the actual window sizes can end up with a different ratio. Dynamic splits still follow each region's longest edge, and preserved split directions stay fixed.

swm waits for every window in the Space and display's layout to settle, then makes up to two corrective layout passes. If those fail, it can restore the last arrangement that worked, as long as the same windows, display bounds, and Space settings still apply. It does not float windows or turn on split preservation to make them fit.

If swm cannot find or restore an arrangement that works, it logs an unsatisfied layout and stops retrying that arrangement during background reflows. Recovery has limits and can fail when the windows cannot fit or an app changes its size requirements. Adjusting the layout yourself, or finishing a move or resize with the pointer, lets swm try again. swm forgets a window's recorded size limits when the window closes.

## Activate a Space

```sh
swm query spaces
swm space activate <space-index>
```

Pass the `index` from `swm query spaces`. swm changes the visible desktop on that Space's display, without moving keyboard focus between displays. The display must contain only normal desktop Spaces. swm refuses a display that has a native fullscreen Space.

swm waits up to two seconds for the display to report the new Space. A timeout or cancellation does not mean the Space stayed the same, so query the state before you retry.

`space activate` needs v0.0.26 or later.

## Configure a Space

Space commands change the active Space unless you pass `--space <space-index>`. The index is the one-based `index` from `swm query spaces`. It follows the current Space order, so it changes when you reorder Spaces.

```sh
swm space layout [--space <space-index>] [<float|master|monocle|dwindle>]
swm space master-ratio [--space <space-index>] [<ratio>]
swm space master-placement [--space <space-index>] [<left|right|top|bottom|next|prev>]
swm space split-ratio [--space <space-index>] [<ratio>]
swm space preserve-split [--space <space-index>] [<on|off>]
swm space padding [--space <space-index>] [<points>] [--top <points>] [--bottom <points>] [--left <points>] [--right <points>]
swm space gap [--space <space-index>] [<points>]
```

An unsigned value sets a ratio, padding, or gap. A signed value such as `+2` or `-2` adjusts it. Master and split ratios must be from `0.1` through `0.9`, and swm clamps adjustments to that range. Padding and gaps never go below zero.

A padding value without a flag sets or adjusts every side. With side flags alone, the sides you leave out keep their values. [Set padding on all sides](/swm/settings/#set-padding-on-all-sides) explains how the two combine. A Space's settings apply on every display that shows it.

{{< unreleased commit="f6b17b9247dcdfe471ca5877ef6fe44b8eb2f3c5" >}}
On `main`, these settings move to `swm config`. For example, `swm space gap 8` becomes `swm config gap --space current 8`. See [moving Space settings to config](/swm/unreleased/#move-space-settings-to-config).
{{< /unreleased >}}

## Read Space settings

Leave out the value to print a setting without changing it:

```sh
swm space layout
swm space master-ratio
swm space master-placement
swm space split-ratio
swm space preserve-split
swm space gap
swm space padding --space 2
```

Each command prints the value in the form its setting command accepts. Padding prints `--top <points> --bottom <points> --left <points> --right <points>`, and split preservation prints `on` or `off`.

Reading the layout, master ratio, master placement, split ratio, or split preservation fails when automatic tiling is unavailable for that Space.

## Set dwindle split ratios

The split ratio is the share of each dwindle split that goes to the left or upper side. The built-in default is `0.5`.

```sh
swm space split-ratio 0.6
swm space split-ratio --space 2 +0.05
```

Setting or adjusting a Space's ratio rebalances every dwindle split in that Space and applies to new splits on every display that shows it. Split directions stay the same. Both reading and writing fail when automatic tiling is unavailable for that Space.

This replaces any adjustments you made to single splits in that Space. Use `swm window split-ratio` afterwards to change only the split nearest a window. That command leaves the Space's ratio for new splits alone.

To change these settings on every Space, use the [global settings](/swm/settings/).
