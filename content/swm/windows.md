---
title: "Windows"
description: "Focus, move, resize, and tile windows, and move focus between displays."
weight: 30
---

Most window commands act on the focused window unless you pass `--window`. The option has no short form. It takes a numeric window ID from `swm query windows`, or `recent` for the previously focused window.

## Focus and minimize

```sh
swm window focus <left|right|up|down|next|prev|recent|master|window-id>
swm window minimize [<recent|window-id>]
swm window unminimize <recent|window-id>
```

A direction focuses the nearest non-minimized window on the visible Spaces. `next` and `prev` follow a stable layout order. `recent` focuses the previously focused window, `master` focuses the master window in the focused window's layout, and a window ID focuses that window.

`minimize` defaults to the focused window. `unminimize` requires a target because a minimized window cannot have focus. Both accept `recent` or a positive window ID as a positional argument and reject `--window`.

## Focus a display

```sh
swm display focus <target>
```

| Target | Display |
| --- | --- |
| `<display-index>` | One-based index from `swm query displays` |
| `next`, `prev` | Next or previous in arrangement order, wrapping at the ends |
| `first`, `last` | First or last in arrangement order |
| `recent` | Previously active display |
| `mouse` | Display under the mouse cursor |
| `left`, `right`, `up`, `down` | Neighbour in that direction, preferring aligned displays |

```sh
swm display focus 2
swm display focus next
swm display focus recent
swm display focus right
```

The current display is the one with the focused window. If swm cannot find a focused window, it uses the active Space's display. swm focuses the frontmost visible, non-minimized window it knows about on the target display. If there is none, it moves the pointer to the centre of that display and tries to focus the desktop. Choosing the current display does nothing.

The command prints nothing when it succeeds. If swm cannot resolve the target, for example because there is no recent display or no neighbour in that direction, it fails with `could not locate display: <target>`.

## Move the mouse cursor

```sh
swm window warp [<left|right|up|down|recent|window-id>]
```

`warp` moves the mouse cursor to the centre of a window. It does not focus or raise the window, switch Spaces, or generate a mouse movement event. swm rejects hidden, minimized, and off-Space windows. If the window's centre is off-screen, the cursor moves to the centre of the largest part of the window that a display shows.

`warp` takes one positional target and does not accept `--window`. Leave it out to use the focused window, or pass `recent` for the previously focused window. Window IDs must be positive 32-bit integers. `next`, `prev`, and `master` are not warp targets.

With a direction, swm starts from the managed window under the cursor and picks the nearest non-minimized, on-screen window that way. If the cursor is not over a managed window, it starts from the focused window. swm checks the window under the cursor on every call, so repeated warps walk between windows without changing focus. If another window covers the destination, the next warp starts from the covering window.

## Move, resize, and place

```sh
swm window move [--window <window|recent>] [--absolute] <x> <y>
swm window resize [--window <window|recent>] [--absolute] <width> <height>
swm window grid [--window <window|recent>] <columns> <rows> <x> <y> <width> <height>
swm window move [--window <window|recent>] --display <next|prev|display-index>
```

Move and resize take two whole numbers in points. They add offsets to the current frame by default. `--absolute` sets the top-left position or size. Negative values work without a `--` separator. The old `abs:...` and `rel:...` forms are rejected.

Each move takes either coordinates, `--display <target>`, or `--space <target>`. The transfer options cannot be combined with coordinates, each other, or `--absolute`.

A grid divides the display's bounds, minus padding, into cells with the configured gap between them. `x` and `y` count cells from `0, 0` in the top-left corner. `width` and `height` are the number of cells the window spans, including the gaps between them. A span across a whole axis uses all of it. Columns and rows must be at least 1. swm clamps coordinates into the grid and spans to between one cell and the cells remaining on that axis. Rule properties keep their colon-separated `grid=...` form.

Coordinate moves, `resize`, and `grid` refuse tiled windows with `window is tiled: <window-id>`. Float the window first. This places the focused window in the right half of a 2-by-1 grid:

```sh
swm window float on
swm window grid 2 1 1 0 1 1
```

For another window, pass the same `--window <window-id>` to both commands. Run `swm window float off` to return it to the layout.

Windows outside the automatic layout never get the tiled error. That covers windows on a Space with the `float` layout, windows you floated, and windows on more than one Space. Other checks still apply. `swm window move --display` and `swm window move --space` move tiled windows too.

Display indexes start at 1. `next` and `prev` wrap around the arranged display list.

## Move between Spaces

```sh
swm window move [--window <window|recent>] --space <space-index|next|prev>
```

Space indexes start at 1 and match `swm query spaces`. `next` and `prev` cycle through normal desktop Spaces in query order, skip fullscreen Spaces, and wrap at either end. The command moves the focused window by default and leaves the current Space active. When the Space is on another display, swm fits the window within that display's visible bounds.

Only a window on a single normal desktop Space can move. swm rejects fullscreen windows and windows assigned to several Spaces. Moving a window to its current Space leaves it where it is.

This works with SIP enabled. swm waits up to two seconds for WindowServer to confirm the window's new Space, then updates the visible tiling layouts. If the move is unavailable or unconfirmed, the command fails. A timeout does not undo a move that finishes later, so query the state before you retry:

```sh
swm query spaces
swm window move --space next
swm window move --window <window-id> --space 1
```

## Control tiling

```sh
swm window float [--window <window|recent>] <on|off|toggle>
swm window swap [--window <window|recent>] <left|right|up|down|next|prev|master>
swm window split-ratio [--window <window|recent>] <ratio>
swm window toggle-split [--window <window|recent>]
swm window swap-split [--window <window|recent>]
```

- `float on` floats a window, `float off` lets it tile again, and `float toggle` switches between the two. The choice overrides [window rules](/swm/rules/#tiling) until the window closes or the daemon restarts, and editing rules does not reset it. `off` does not change the Space's layout or skip other tiling requirements.
- `swap left|right|up|down` swaps tiled positions. In a floating layout it swaps the two windows' frames.
- `swap next|prev` swaps the focused tiled window with the next or previous one in layout order. It does not accept `--window`.
- `swap master` makes the window the master window in a master layout.
- `split-ratio` sets the nearest dwindle split to a ratio from `0.1` through `0.9`. A signed value such as `+0.05` adjusts it, clamped to the same range.
- `toggle-split` switches the nearest retained dwindle split between columns and rows. It needs split preservation, described below.
- `swap-split` exchanges the two sides of the nearest dwindle split.

[Spaces and layouts](/swm/spaces-and-layouts/#layouts) explains how each layout arranges windows.

## Enable split preservation before toggling

`swm window toggle-split` only works when split preservation is on for the window's dwindle layout. Split preservation is off by default.

For a focused tiled window in the active Space's dwindle layout:

```sh
swm config preserve-split --space current on
swm window toggle-split
```

For a window chosen with `--window`, turn preservation on for that window's Space with `swm config preserve-split --space <space-index> on`. Without preservation, or when the window has no dwindle split to change, the command fails with `window has no dwindle split to toggle, or preserve-split is off: <window-id>`.

`swm config preserve-split --space current off` forgets the retained directions, and splits go back to following the longest edge.
