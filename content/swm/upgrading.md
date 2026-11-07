---
title: "Upgrading to v0.0.31"
description: "Command changes when upgrading from v0.0.30 to v0.0.31."
aliases: ["/swm/unreleased/"]
weight: 90
---

[v0.0.31](https://github.com/starkwm/swm/releases/tag/v0.0.31) changes commands and arguments from v0.0.30. Update `swmrc` and your key bindings when you upgrade. This reference uses v0.0.31 syntax. Check [installation](/swm/getting-started/#installation) for Homebrew availability.

## Move Space settings to config

In v0.0.31, `swm space` only has `activate`. The `layout`, `master-ratio`, `master-placement`, `split-ratio`, `preserve-split`, `padding`, and `gap` subcommands move from `space` to `config`, and swm rejects their old `swm space` forms.

Pass `--space current` for the active Space, or `--space <space-index>` with a positive one-based index from `swm query spaces`. Indexes follow the current Space order and change when you reorder Spaces.

| v0.0.30 | v0.0.31 |
| --- | --- |
| `swm space gap 8` | `swm config gap --space current 8` |
| `swm space gap --space 2 +2` | `swm config gap --space 2 +2` |
| `swm space gap` | `swm config gap --space current` |
| `swm space padding --space 2 --top +4` | `swm config padding --space 2 --top +4` |
| `swm space master-placement next` | `swm config master-placement --space current next` |
| `swm space preserve-split on` | `swm config preserve-split --space current on` |

The same change applies to all seven settings. Keep `--space current` when you migrate a command that used to act on the active Space. Without `--space`, a command reads the global default, or changes every current Space and the default for future Spaces. With `--space`, it changes only that Space, and leaves other Spaces and future defaults alone.

Leave out the value to read the setting for the chosen scope. Signed gap, padding, and ratio changes start from that scope's current value, and so do `master-placement next` and `prev`. Padding side flags win over the plain value for their side. With side flags alone, the other sides keep their values.

For dwindle, run `swm config preserve-split --space current on` before `swm window toggle-split`. For a window on another Space, pass that Space's index instead. `swm config split-ratio --space current 0.6` sets the ratio for new splits and rebalances existing splits on that Space. `swm window split-ratio` still changes a single split.

`animation-duration`, `animation-easing`, and `focus-follows-mouse` stay global and reject `--space`. `swm space activate <space-index>` does not change.

## Move and resize arguments

In v0.0.31, `move` and `resize` take two whole numbers in points. They move or resize relative to the current frame by default. Add `--absolute` to set the top-left position or the size instead. swm rejects the old `abs:...` and `rel:...` arguments.

```sh
swm window move [--window <window|recent>] [--absolute] <x> <y>
swm window resize [--window <window|recent>] [--absolute] <width> <height>
```

| v0.0.30 | v0.0.31 |
| --- | --- |
| `swm window move abs:0:25` | `swm window move --absolute 0 25` |
| `swm window move rel:-20:0` | `swm window move -20 0` |
| `swm window resize abs:1200:800` | `swm window resize --absolute 1200 800` |
| `swm window resize rel:40:0` | `swm window resize 40 0` |

Negative values work on either axis without a `--` separator, even mixed with window selection, as in `swm window move -20 --window recent -10`. Coordinate moves and resizes still reject tiled windows.

## Grid arguments

In v0.0.31, `swm window grid` takes six separate whole numbers instead of one colon-separated argument, and rejects the old form.

```sh
swm window grid [--window <window|recent>] <columns> <rows> <x> <y> <width> <height>
```

| v0.0.30 | v0.0.31 |
| --- | --- |
| `swm window grid 2:1:0:0:1:1` | `swm window grid 2 1 0 0 1 1` |
| `swm window grid 2:1:1:0:1:1` | `swm window grid 2 1 1 0 1 1` |
| `swm window grid 1:1:0:0:1:1` | `swm window grid 1 1 0 0 1 1` |

Columns and rows must be at least 1. `x` and `y` count cells from zero at the top left, and `width` and `height` count the cells to span. swm clamps `x` and `y` into the grid, then clamps each span to between one cell and the cells left on that axis. Negative values work without a `--` separator.

Choose a window with `--window` as before, for example `swm window grid --window recent 2 1 1 0 1 1`. Grid placement still uses the configured padding and gaps and rejects tiled windows. Float a tiled window with `swm window float on` first, with the same `--window` when you target a specific window.

Rule properties keep the colon-separated form, such as `grid=2:1:1:0:1:1`.

## Move windows between displays and Spaces

In v0.0.31, `swm window display` and `swm window space` are gone. Use `swm window move --display` or `swm window move --space` instead:

| v0.0.30 | v0.0.31 |
| --- | --- |
| `swm window display next` | `swm window move --display next` |
| `swm window display --window 123 2` | `swm window move --window 123 --display 2` |
| `swm window space 3` | `swm window move --space 3` |
| `swm window space --window recent prev` | `swm window move --window recent --space prev` |

Each `move` does one thing. It takes two coordinates, `--display <target>`, or `--space <target>`, never more than one. The display and Space forms reject coordinates and `--absolute`. Both take a positive one-based index, `next` or `prev`. They move the focused window unless you pass `--window` with a window ID or `recent`.

Display indexes follow the arranged display list. Space indexes match `swm query spaces`, and cycling skips fullscreen Spaces and wraps through normal desktops. The current Space stays active. Unlike coordinate moves, these can move tiled windows into the destination layout. The existing display and Space move restrictions still apply, including the rule that a Space move must start and end on a normal desktop Space.

`previous` is no longer accepted for display or Space navigation. Use `prev` instead.

Rule properties such as `display=2` and `space=3` do not change.

## Minimize and unminimize targets

In v0.0.31, `swm window minimize` and `swm window unminimize` take the window as a positional argument instead of `--window`. Pass `recent` for the previously focused window, or a positive window ID. Without a target, `minimize` minimizes the focused window. `unminimize` needs a target, because a minimized window cannot have focus.

```sh
swm window minimize [<recent|window-id>]
swm window unminimize <recent|window-id>
```

| v0.0.30 | v0.0.31 |
| --- | --- |
| `swm window minimize --window recent` | `swm window minimize recent` |
| `swm window unminimize --window 123` | `swm window unminimize 123` |

A bare `swm window unminimize` now fails. Both commands reject `--window`, directions, and zero or out-of-range IDs. Other window commands that take `--window`, including `move`, `resize`, and `swap`, keep it.

## Dwindle size limits

Dwindle keeps the planned tile positions when an app refuses a smaller size. It no longer adjusts allocations around observed size limits or restores a previous arrangement. See [dwindle size limits](/swm/spaces-and-layouts/#dwindle-size-recovery).
