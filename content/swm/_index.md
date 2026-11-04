---
title: "swm"
description: "A client and daemon for scriptable macOS window management."
weight: 20
homeSummary: "Moves your windows around so you don't have to."
homeHello: "I tile."
homeSays: "swm window warp right"
homeInstall: "brew install starkwm/formulae/swm"
homeVersion: "v0.0.30"
homeDetails: "Move, resize, and focus windows from the command line, or tile them with master, monocle, or dwindle layouts. Query displays, Spaces, and windows as JSON, and run shell commands when windows or Spaces change."
---

`swm` is a command-line window manager with optional automatic tiling. One `swm` process runs as a daemon and tracks applications, displays, spaces, and windows. Other invocations send commands to that daemon.

It is inspired by [yabai](https://github.com/asmvik/yabai) and replaces the JavaScript configuration used by its predecessor, [Stark](https://github.com/starkwm/stark), with a small shell-based command interface.

This reference covers [v0.0.30](https://github.com/starkwm/swm/releases/tag/v0.0.30), the latest prerelease, checked on 3 November 2026.

## Unreleased main changes

The changes below apply to [main at `201e8a1`](https://github.com/starkwm/swm/commit/201e8a125fac4421222f1602411c0f8073b179ac), after v0.0.30. They are not part of the v0.0.30 Homebrew release. The rest of this reference retains the v0.0.30 syntax.

### Move Space settings to config

On main, `swm space` only provides `activate`. The `layout`, `master-ratio`, `master-placement`, `split-ratio`, `preserve-split`, `padding`, and `gap` subcommands have moved from `space` to `config`. Their old `swm space` forms are rejected.

Use `--space current` to select the active Space, or `--space <space-index>` for a positive one-based index from `swm query spaces`. Indexes follow the current Space ordering and can change when Spaces are reordered.

| v0.0.30 | Unreleased main |
| --- | --- |
| `swm space gap 8` | `swm config gap --space current 8` |
| `swm space gap --space 2 +2` | `swm config gap --space 2 +2` |
| `swm space gap` | `swm config gap --space current` |
| `swm space padding --space 2 --top +4` | `swm config padding --space 2 --top +4` |
| `swm space master-placement next` | `swm config master-placement --space current next` |
| `swm space preserve-split on` | `swm config preserve-split --space current on` |

Apply the same migration to all seven settings in configuration files and keyboard shortcuts. Keep `--space current` when migrating a command that previously targeted the active Space. Omitting `--space` reads the global default or updates all current Spaces and the defaults for future Spaces. A selected Space changes independently of other Spaces and future defaults.

Run a setting without a value to read its value in the selected scope. Signed gap, padding, and ratio changes use that scope's current value, as do `master-placement next` and `prev`. Padding side flags override the positional value for their side; with side flags alone, omitted sides keep their values.

For dwindle, use `swm config preserve-split --space current on` before `swm window toggle-split`. For a window on another Space, select that Space's index instead. `swm config split-ratio --space current 0.6` sets the ratio for new splits and rebalances existing splits on that Space. `swm window split-ratio` still changes one split.

`animation-duration`, `animation-easing`, and `focus-follows-mouse` remain global only and reject `--space`. `swm space activate <space-index>` is unchanged.

## Requirements

- macOS 26 or later
- Accessibility permission for `swm`
- A Swift 6.4 toolchain and the macOS SDK when building from source

`swm` uses private macOS frameworks. A macOS update may change behavior that it relies on.

## Installation

Install the latest release with Homebrew on Apple silicon:

```sh
brew tap starkwm/formulae
brew install starkwm/formulae/swm
```

Start it now and at login:

```sh
brew services start swm
```

Or build from source:

```sh
git clone https://github.com/starkwm/swm.git
cd swm
git checkout v0.0.30
make build
```

`make build` writes the binary to `.build/debug/swm`. Run it once and grant Accessibility permission when macOS asks:

```sh
.build/debug/swm
```

A source build does not install a login service.

Restart the daemon after upgrading so the client and daemon use the same IPC format. For a Homebrew service, run `brew services restart swm`.

## How commands work

Run `swm` without a subcommand to start the daemon. `swm start` is the explicit equivalent:

```sh
swm [start] [--config <path>] [--log-level <level>]
```

Send commands to the running daemon through command-specific subcommands:

```sh
swm <domain> <command> [arguments]
```

The available domains are `query`, `window`, `space`, `display`, `config`, `rule`, and `signal`. Commands print their result to standard output and return a non-zero exit status on failure. Run `swm --help`, `swm <domain> --help`, or `swm help <domain> <command>` for help.

Top-level options:

```text
-h, --help                 Show help
-v, --version              Show the version
```

`swm --version` and `swm -v` print `swm version <version>` and exit without starting the daemon.

Daemon startup options, accepted by `swm` and `swm start`:

```text
-c, --config <path>        Use a different startup configuration file
    --log-level <level>    debug, info, warn, or error (default: info)
```

## Shell completions

`swm` can generate completion scripts for Bash, Zsh, and Fish. Homebrew installations include them automatically.

For a manual installation, generate the script into a directory loaded by your shell:

```sh
# Bash: source this file from ~/.bashrc if it is not loaded automatically.
mkdir -p ~/.local/share/bash-completion/completions
swm --generate-completion-script bash > ~/.local/share/bash-completion/completions/swm

# Zsh: add ~/.zfunc to fpath before running compinit in ~/.zshrc.
mkdir -p ~/.zfunc
swm --generate-completion-script zsh > ~/.zfunc/_swm

# Fish
mkdir -p ~/.config/fish/completions
swm --generate-completion-script fish > ~/.config/fish/completions/swm.fish
```

Restart the shell after installing a completion script.

## Query state

Queries return JSON. Query all tracked objects of one type:

```sh
swm query displays
swm query spaces
swm query windows
```

Add at most one selector to filter the result:

```sh
swm query windows --display 1
swm query windows --space 1
swm query windows --window 12345
```

Singular query commands accept an optional index or ID. Without one they return the focused object:

```sh
swm query display [display-index]
swm query space [space-index]
swm query window [window-id]
```

Display indexes are one-based and follow the physical display arrangement. Space indexes are one-based. A filtered query returns one JSON object when the selector identifies the same type as the query; otherwise it returns an array of related objects.

## Focus a display

`swm display focus <target>` focuses another display.

| Target | Display |
| --- | --- |
| `<display-index>` | One-based index from `swm query displays` |
| `next`, `prev` | Next or previous in arrangement order, wrapping at the ends |
| `first`, `last` | First or last in arrangement order |
| `recent` | Previously active display |
| `mouse` | Display under the mouse cursor |
| `left`, `right`, `up`, `down` | Neighbor in that direction, preferring aligned displays |

```sh
swm display focus 2
swm display focus next
swm display focus recent
swm display focus right
```

The current display is the one containing the focused window, or the active Space's display when no focused window can be resolved. swm focuses the target display's frontmost visible, non-minimized window known to the daemon. If there is no such window, it moves the pointer to the display's center and attempts to focus the desktop. Selecting the current display does nothing.

Success prints nothing. If a target cannot be resolved, such as a missing recent display or no neighbor in the requested direction, the command fails with `could not locate display: <target>`. Use `swm display focus --help` for command help.

## Manage windows

The `--window` option has no short form. It accepts a numeric window ID, or `recent` for the previously focused window. Commands that accept `--window` use the focused window when it is omitted.

### Focus and minimize

```sh
swm window focus <left|right|up|down|next|prev|recent|master|window-id>
swm window minimize [--window <window|recent>]
swm window unminimize [--window <window|recent>]
```

Directional focus chooses the nearest non-minimized window on the currently visible Spaces. `next` and `prev` follow stable layout order. Use `recent` for the previously focused window, `master` for the master window in the focused window's layout, or a window ID to focus that window.

### Move the mouse cursor

```sh
swm window warp [<left|right|up|down|recent|window-id>]
```

`warp` moves the mouse cursor to the selected window's center without focusing or raising the window, switching Spaces, or generating a mouse movement event. It defaults to the focused window. swm rejects hidden, minimized, and off-Space windows. If the window's center is off-screen, the cursor moves to the center of the largest part of the window visible on a display.

With a direction, swm chooses the nearest non-minimized, on-screen window in the requested direction from the managed window under the cursor. If the cursor is not over an available managed window, it starts from the focused window. Each command checks the window under the cursor again, so repeated warps navigate between windows without changing focus. If another window covers the destination, the next warp starts from that covering window.

`warp` accepts one positional target. Omit it to use the focused window, or use `recent` for the previously focused window. Window IDs must be positive 32-bit integers; `next`, `prev`, and `master` are not warp targets. The `--window` option is not accepted.

### Move, resize, and place

```sh
swm window move [--window <window|recent>] <abs|rel>:<x>:<y>
swm window resize [--window <window|recent>] <abs|rel>:<width>:<height>
swm window grid [--window <window|recent>] <columns>:<rows>:<x>:<y>:<width>:<height>
swm window display [--window <window|recent>] <next|prev|display-index>
```

`abs` sets coordinates or dimensions; `rel` adds signed values to the current frame. Grid cells share the padded screen bounds, with the configured gap between adjacent cells. A multi-cell span includes its internal gaps; a full-axis span uses the entire padded axis. Grid coordinates start at `0:0` in the top-left. The final width and height are cell spans. `move`, `resize`, and `grid` reject tiled windows. Float the focused window before placing it in the right half of a 2-by-1 grid:

```sh
swm window float on
swm window grid 2:1:1:0:1:1
```

For a specific window, pass the same `--window <window-id>` to both commands. Use `swm window float off` to return it to automatic tiling afterwards.

Tiled windows return `window is tiled: <window-id>`. Windows on a Space using the `float` layout, explicitly floated windows, and windows on multiple Spaces are outside automatic layout geometry and do not trigger this rejection. Other checks still apply. `swm window display` and `swm window space` can move tiled windows.

Display indexes are one-based. `next` and `prev` wrap around the arranged display list; `previous` is also accepted.

### Move between Spaces

```sh
swm window space [--window <window|recent>] <space-index|next|prev>
```

Space indexes are one-based and match `swm query spaces`. `next` and `prev` cycle through normal desktop Spaces in query order, skip fullscreen Spaces, and wrap at either end. `previous` is also accepted. The command defaults to the focused window and keeps the current Space active. Moves to a Space on another display fit the window within that display's visible bounds.

Only windows on a single normal desktop Space can move. swm rejects fullscreen windows and windows assigned to more than one Space. Moving a window to its current Space leaves it in place.

Movement works with SIP enabled. The command waits up to two seconds for WindowServer to confirm the new Space membership, then updates visible tiling layouts. If movement is unavailable or cannot be confirmed, the command returns an error. A timeout does not undo a move that completes later. Query the state before retrying.

```sh
swm query spaces
swm window space next
swm window space --window <window-id> 1
```

### Control tiling

```sh
swm window float [--window <window|recent>] <on|off|toggle>
swm window swap [--window <window|recent>] <left|right|up|down|next|prev|master>
swm window split-ratio [--window <window|recent>] <ratio>
swm window toggle-split [--window <window|recent>]
swm window swap-split [--window <window|recent>]
```

- `float on|off|toggle` floats a window, returns it to tiling eligibility, or toggles its state. It defaults to the focused window and accepts `--window`. Its choices override management rules until the window closes or the daemon restarts; editing rules does not reset them. `off` does not change the Space's layout or bypass other tiling requirements.
- `swap left|right|up|down` swaps tiled positions, or complete frames in a floating layout.
- `swap next|prev` swaps the focused tiled window with its ordered neighbour and does not accept `--window`.
- `swap master` promotes a window in a master layout.
- `split-ratio` sets the nearest dwindle split to a ratio from `0.1` through `0.9`, or adjusts it by a signed change such as `+0.05`. Adjustments are clamped to that range.
- `toggle-split` switches the nearest retained dwindle split between columns and rows. Split preservation must be enabled.
- `swap-split` exchanges the two subtrees at the nearest dwindle split.

### Enable split preservation before toggling

`swm window toggle-split` requires split preservation to be enabled for the selected window's dwindle layout. Split preservation is off by default.

For a focused tiled window in the active Space's dwindle layout:

```sh
swm space preserve-split on
swm window toggle-split
```

For a window selected with `--window`, enable preservation on its Space with `swm space preserve-split --space <space-index> on`. Without preservation, or when the window has no eligible dwindle split, the command returns `window has no dwindle split to toggle, or preserve-split is off: <window-id>`.

Turning preservation off with `swm space preserve-split off` clears retained directions and returns splits to following the longest edge.

## Configure spaces

### Activate a Space

```sh
swm query spaces
swm space activate <space-index>
```

Activation uses the one-based `index` from `swm query spaces`. It changes the visible Desktop on the target's display without requesting keyboard-focus transfer between displays. The target display must contain only normal desktop Spaces. swm refuses displays that contain a native fullscreen Space.

The command waits up to two seconds for the target display to report the requested current Space. A timeout or cancellation after submission does not mean the Space stayed unchanged. Query the state before retrying.

`space activate` is available in v0.0.26 and later.

### Configure a Space

Space commands affect the active space by default. Use `--space <space-index>` to select another space by its one-based index from `swm query spaces`. Indexes follow the current Space ordering and may change when Spaces are reordered:

```sh
swm space layout [--space <space-index>] [<float|master|monocle|dwindle>]
swm space master-ratio [--space <space-index>] [<ratio>]
swm space master-placement [--space <space-index>] [<left|right|top|bottom|next|prev>]
swm space split-ratio [--space <space-index>] [<ratio>]
swm space preserve-split [--space <space-index>] [<on|off>]
swm space padding [--space <space-index>] [<points>] [--top <points>] [--bottom <points>] [--left <points>] [--right <points>]
swm space gap [--space <space-index>] [<points>]
```

Use an unsigned value to set a ratio, padding, or gap, or a signed value such as `+2` or `-2` to adjust it. Master and split ratios must be from `0.1` through `0.9`; adjustments are clamped to that range. Omit the value to read a setting. Padding without values prints all four sides. A positional value sets or adjusts every side; with side flags alone, omitted sides stay unchanged. See [padding precedence](#set-padding-on-all-sides) when combining them. Negative resulting padding and gaps are clamped to zero. Space settings apply to every display showing that space.

### Read Space settings

Omit the value to print a setting without changing it:

```sh
swm space layout
swm space master-ratio
swm space master-placement
swm space split-ratio
swm space preserve-split
swm space gap
swm space padding --space 2
```

These commands print a plain value in the form accepted by the setting command. Padding prints `--top <points> --bottom <points> --left <points> --right <points>`; split preservation prints `on` or `off`.

Layout, master ratio, master placement, split ratio, and split preservation reads return an error if automatic tiling is unavailable for the selected Space.

### Set dwindle split ratios

The split ratio is the share of each dwindle split's region given to its left or upper side. The built-in default is `0.5`.

```sh
swm space split-ratio 0.6
swm space split-ratio --space 2 +0.05
```

Setting or adjusting a Space's ratio rebalances every existing dwindle split to the result and uses it for new splits on every display showing that Space. Retained split directions are preserved. Reads and writes return an error if automatic tiling is unavailable for the selected Space.

The command replaces individual split adjustments in that Space. Use `swm window split-ratio` afterwards to adjust just the nearest split for a window; that command does not change the Space's setting for new splits.

### Layouts

The layouts are:

- `float`: do not arrange windows automatically.
- `master`: place one window at the selected edge and the others in a stack.
- `monocle`: overlap every tiled window across the available bounds.
- `dwindle`: recursively split the available bounds around the focused window.

In a dwindle layout, new windows split the focused tiled window and removing a window collapses its sibling branch. Splits normally follow the longest available edge. `swm space preserve-split on` keeps each branch's direction, and `swm window toggle-split` changes it.

Each physical display has an independent tiling layout, including when macOS's **Displays have separate Spaces** setting is disabled. Moving a tiled window between displays moves it into the destination layout. If you move or resize a tiled window by hand, it snaps back into place.

### Dwindle size recovery

When an application repeatedly keeps a window larger than requested, dwindle records the refused dimensions and tries to fit the layout around them. The configured split ratio stays unchanged, but the actual window sizes can use a different ratio. Dynamic splits still follow each region's longest edge; preserved split directions stay fixed.

swm waits for all windows in the Space/display layout to settle before attempting up to two corrective layout passes. If recovery fails, it can try restoring the last verified arrangement when the same windows, display bounds, and Space settings still match. It does not float windows or turn on split preservation to make them fit.

If swm cannot find or restore a working arrangement, it logs an unsatisfied layout and stops retrying that arrangement during background reflows. Recovery is bounded and is not guaranteed when windows cannot fit or an app changes its size requirements. Explicit layout adjustments and finishing a pointer move or resize allow a fresh attempt. Observed size constraints are temporary and are removed when the window closes.

## Set global defaults

Config commands change settings in the running daemon. Layout, padding, and gap settings also apply to spaces discovered later:

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

Built-in defaults are floating layout, focus-follows-mouse off, `0.5` master and dwindle split ratios, master on the left, split preservation off, animation disabled, and zero padding and gaps. Master and split ratios must be from `0.1` through `0.9`. Gap, padding, master ratio, and split ratio accept unsigned values to set them or signed changes to the global value. The result replaces per-Space settings and becomes the default for future Spaces. With side flags alone, padding updates only the supplied sides; a positional value applies to every side. Negative resulting gaps and padding are clamped to zero; ratios are clamped to `0.1` through `0.9`. Run a config command without a value to print its current setting, such as `swm config gap` or `swm config padding`.

### Adjust global settings

Each signed adjustment starts from the current global value and applies the result to every Space, replacing that setting's per-Space overrides and updating the default for future Spaces:

```sh
swm config gap +2
swm config padding --top -2 --bottom +2
swm config master-ratio -0.05
swm config split-ratio -0.05
```

For example, with a global gap of `6` and a Space gap of `20`, `swm config gap +2` sets both to `8`. With side flags alone, padding changes affect only the sides supplied; omitted sides keep their existing values on each Space. Use `swm config gap 0` to reset the gap to zero.

A global split-ratio change also rebalances existing dwindle splits, replacing individual split adjustments, and sets the ratio for new splits. Retained split directions are preserved. Use the corresponding `space` command to adjust just one Space.

### Set padding on all sides

Both `config padding` and `space padding` accept an optional positional padding value:

```sh
swm config padding 8
swm config padding 8 --top +2
swm space padding --space 2 +2 --top 12
swm space padding --space=2 -2
```

An unsigned value sets every side, and a signed value adjusts each side from its current padding. Side flags take precedence over the positional value regardless of argument order. For example, `swm config padding 8 --top +2` adds 2 to the current global top padding and sets the other sides to 8. It does not add 2 to 8.

Global adjustments use the current global padding, apply the changed sides to every Space, and update defaults for future Spaces. Space adjustments use the selected Space's padding and leave global defaults unchanged. Negative results clamp to zero.

With side flags alone, omitted sides keep their padding. With no values, the command prints `--top <points> --bottom <points> --left <points> --right <points>`.

### Cycle global master placement

```sh
swm config master-placement next
swm config master-placement prev
```

`next` cycles through `left`, `top`, `right`, `bottom`, then back to `left`; `prev` reverses that order. The command starts from the current global edge, applies the result to every Space, replacing per-Space master-placement overrides, and updates the default for future Spaces. It prints the resulting edge, such as `top`.

Omit the argument to read the global edge without changing it, or supply `left`, `right`, `top`, or `bottom` to set it directly. Use `swm space master-placement next` or `prev` to cycle just one Space from its own current edge.

## Window animation

Window animation is off by default. Turn it on with a duration in seconds, from 0 through 1:

```sh
swm config animation-duration 0.18
swm config animation-easing ease-out-circ
```

This animates swaps, automatic layout reflows, and the `move`, `resize`, and `grid` commands. Set the duration to `0` to finish active animations and go back to instant movement. macOS Reduce Motion overrides the setting. Add both commands to `swmrc` to apply them at startup.

The easing curves are `linear`, `ease-out-quad`, `ease-out-cubic`, `ease-out-circ`, and `ease-in-out-quad`. The default is `ease-out-quad`. `ease-out-circ` is close to yabai's default. A new curve applies to animations that start or change destination after you set it. Running animations keep their curve.

With animation on, geometry commands return as soon as swm queues the movement. Repeated relative moves and resizes add up against the pending destination, not the current frame. Moving a window to another display is always instant and cancels its animation. Smoothness depends on the app.

### Dragging during an animation

When you drag or resize a window, swm stops animating it until you release the mouse, then recalculates the layout. A click without a drag leaves the animation running. Geometry commands return an error during a drag, and placement rules wait for the mouse release.

### Timing and corrections

Each active display drives animation updates at up to 60 Hz. With no display, swm uses a 60 Hz timer. If a display stops sending updates for two seconds, swm jumps that display's animations to their destination. Animations on other displays carry on.

swm reads and writes window frames through Accessibility, one call at a time per app, so a slow app does not hold up animations in other apps. A new frame replaces any frame still waiting to be written. After the final write, swm waits 100 ms and checks the window's position and size. If the frame is off, swm corrects it once and checks again 100 ms later. These checks do not block other windows in the same app, and a newer request or a cancellation discards them.

An Accessibility call can still finish after swm cancels its animation. swm drops the queued updates and ignores the late result. Synchronous geometry commands wait for in-progress calls before they move or resize the window.

## Configuration file

At startup, the daemon executes `~/.config/swm/swmrc` if it exists. Use `--config <path>` to select another file; an explicitly selected file must exist. `swm` makes the file owner-executable when needed and stops if it exits unsuccessfully.

The file can be any executable script. A shell script is the simplest option:

```sh
#!/bin/sh

swm config layout dwindle
swm config focus-follows-mouse autofocus
swm config animation-duration 0.18
swm config gap 8
swm config padding --top 8 --bottom 8 --left 8 --right 8
```

Run `swm reload` to execute the configuration again, or `swm reload --config /path/to/swmrc` to use another file. Reload removes every rule and signal before running the file. Settings the file no longer sets keep their current values.

## Window rules

Add rules to `~/.config/swm/swmrc` to keep selected windows floating or place them on a display or Space. For example, leave Settings and Finder out of tiling layouts:

```sh
swm rule add label=settings bundle-id=com.apple.systempreferences manage=off
swm rule add label=finder bundle-id=com.apple.finder manage=off
```

Rules last until the daemon stops. Adding or removing a rule updates existing windows as well as windows opened later.

### Commands

```sh
swm rule add label=finder app='^Finder$' manage=off
swm rule list
swm rule remove finder
swm rule remove 1
```

Use `swm rule clear` to remove every registered rule.

`list` returns a JSON array. Each entry has a one-based `index` and a `rule` object with the registered properties. Indexes change after removal. Use a unique, non-integer `label` to remove a rule by name.

`add` requires at least one action:

- `manage=on|off` allows or skips automatic tiling.
- `display=<index|uuid>` moves the window to a display without following focus. Indexes start at 1 and use the same order as `swm window display`. Use a UUID from `swm query displays` to identify a monitor regardless of its index. Rules accept neither `next` nor `prev`.
- `space=<index>` moves the window to a normal desktop Space without switching to it. Use a positive index from `swm query spaces`; `space` and `display` cannot appear in the same rule.
- `grid=<columns>:<rows>:<x>:<y>:<width>:<height>` places a floating window within the display's visible bounds. It uses the destination Space's padding and gaps, with the same coordinate clamping as `swm window grid`.

### Match windows

A rule can use these filters:

- `bundle-id=<identifier>` matches an exact, case-sensitive application identifier. `bundle-id!=<identifier>` excludes it.
- `app=<regex>` matches the application name, which can vary with the system language.
- `title=<regex>` matches the window title.
- `app!=<regex>` or `title!=<regex>` requires the text not to match.

All filters must match. If a window's value is missing, that filter fails even when inverted. A rule without filters matches every window.

To leave windows from applications other than Finder out of automatic tiling:

```sh
swm rule add label=other-apps 'bundle-id!=com.apple.finder' manage=off
```

This does not match Finder or windows whose bundle ID is missing. Bundle IDs use exact comparison, not regular expressions. Negation is supported only for `bundle-id`, `app`, and `title`. Supplying both `bundle-id` and `bundle-id!` in one rule is rejected as a duplicate property.

Regexes use Foundation's ICU syntax. They are case-sensitive by default and match substrings unless anchored with `^` and `$`. Quote them in shell scripts. swm rejects invalid regexes, unknown properties, empty values, and duplicate properties without adding the rule.

The last matching value for each action wins. A rule that only sets `grid` leaves an earlier `manage`, `display`, or `space` value in place. Across matching rules, the last `space` or `display` action chooses the destination and replaces the other. Put broad rules before exceptions:

```sh
swm rule add label=finder app='^Finder$' manage=off
swm rule add label=finder-projects app='^Finder$' title='^Projects$' manage=on
```

### Tiling

`manage=off` leaves a window out of automatic tiling and tiling cycles. Queries, focus, and direct window commands still work. `manage=on` allows tiling if the window supports it. It cannot force fixed-size, nonstandard, or native-fullscreen windows into a layout.

swm checks rules before a new window's first layout, when rules change, and during later window updates. Title changes trigger a check when the app supports title notifications. Removing a management rule restores the earlier matching value or the normal default.

`swm window float on`, `off`, and `toggle` override management rules for that window until it closes or the daemon restarts. Rule edits preserve those choices. `toggle` reverses the window's float/tile setting. Rules do not change the Space's layout. A Space using `float` keeps its usual floating-window commands and cycling.

### Windows from accessory applications

swm also observes applications with macOS's accessory activation policy, including helper processes that own windows. It tracks their windows when Accessibility reports the `AXStandardWindow` subrole. Nonstandard windows from these processes, such as panels and menu-bar strips, are ignored.

These standard windows use the usual window rules and tiling eligibility checks. A window must still be movable and resizable to tile, and fixed-size or native-fullscreen windows remain excluded from automatic tiling.

### Display and grid placement

```sh
# Place Finder in the right half of display 2.
swm rule add label=finder app='^Finder$' manage=off display=2 grid=2:1:1:0:1:1
```

swm selects the display before calculating the grid. Without a grid, it preserves the window's relative position and fits its size to the destination. Tiled windows join the destination layout.

Grid placement requires a resizable, floating window. Use `manage=off`, a manual float command, or a destination Space with the `float` layout. A grid waits until the window meets those conditions.

Each placement action runs when it first matches or its value changes. Later manual moves and resizes leave that action unchanged, so it does not run again. A new display value also reapplies the matching grid on that display. Changing only the grid does not repeat a completed display move.

Placement waits for minimized windows, windows on inactive or fullscreen Spaces, and unavailable destination displays. swm tries again during later window or display updates. It does not switch Spaces to place a window or apply a grid on a substitute monitor.

Removing a placement rule leaves the current frame and display in place unless an earlier matching value takes over. swm forgets completed actions when a window closes or stops matching them. If an Accessibility move or resize fails, swm logs the failure and stops retrying that action. Remove and add the rule to retry.

### Place windows on a Space with rules

`swm rule add` accepts `space=<index>` as a placement action. It moves matching windows without switching to the destination Space.

```sh
swm query spaces
swm rule add label=slack app='^Slack$' space=3
```

The index must be a positive integer from `swm query spaces`. Rules do not accept `next`, `prev`, or Space IDs. Indexes follow the current Space ordering, so reordering Spaces can change the destination of future rule applications.

A rule can combine `space` with `manage` and `grid`, but cannot set both `space` and `display`. Across matching rules, the last `space` or `display` action chooses the destination and replaces the other. A later rule that only sets `grid` or `manage` preserves that destination. `swm rule list` includes the registered `space` value in each rule's JSON properties.

Only windows on one normal desktop Space can move, and the destination must be a normal desktop Space. Placement waits while the window is minimized, on an inactive or fullscreen Space, or being dragged. Missing destinations and indexes naming fullscreen Spaces wait for later updates. A window already on the target Space stays there.

The window stays out of its source tiling layout during the move, then joins the destination layout. Moving to another display fits the window to that display's visible bounds. A matching grid applies after the move, once the destination Space is visible and the window is floating and resizable, using that Space's padding and gaps.

The Space action runs when it first matches or its value changes. Moving the window back manually does not repeat it. Removing the rule does not move the window back. If a move fails, swm logs the failure and stops retrying that action. Check the window's actual Space before removing and adding the rule to retry, since a timed-out move can still complete later.

## Run commands on events

Signals run shell actions after matching runtime events:

```sh
swm signal add event=window-focused action='echo "$SWM_WINDOW_ID"'
swm signal add event=window-created app='^Safari$' label=safari-created action='echo "$SWM_WINDOW_ID"'
swm signal list
swm signal remove <index|label>
```

`add` requires `event` and `action`. It also accepts:

- `label=<text>`: unique name used by `remove`.
- `app=<regex>` and `title=<regex>`: require a regular-expression match.
- `app!=<regex>` and `title!=<regex>`: require the value not to match.
- `active=on|off`: filter application and window events by active or focused state.

`active=on` matches active applications or focused windows; `active=off` matches inactive applications or unfocused windows. Space and display events reject this filter. The values `yes` and `no` are not accepted. Signal filters do not accept bundle IDs.

```sh
swm signal add event=window-focused active=on action='echo "$SWM_WINDOW_ID"'
```

Supported events:

- `application-launched`
- `application-terminated`
- `application-front-switched`
- `window-created`
- `window-destroyed`
- `window-focused`
- `window-moved`
- `window-resized`
- `window-minimized`
- `window-deminimized`
- `space-changed`
- `display-changed`
- `display-added`
- `display-removed`
- `display-moved`
- `display-resized`

Actions run asynchronously through `/usr/bin/env sh -c`. Depending on the event, the action receives these environment variables:

- `SWM_PROCESS_ID`
- `SWM_WINDOW_ID`
- `SWM_SPACE_ID`
- `SWM_SPACE_INDEX`
- `SWM_RECENT_SPACE_ID`
- `SWM_RECENT_SPACE_INDEX`
- `SWM_DISPLAY_ID`
- `SWM_RECENT_DISPLAY_ID`
- `SWM_EVENT_DISPLAY_ID`

Use `swm signal clear` to remove every registered signal.

Signal registrations exist only for the current daemon run, so put persistent registrations in `swmrc`.

## Keyboard shortcuts

`swm` does not bind keys. Use a hotkey daemon such as [skbd](/skbd/) to invoke its commands. These grid bindings require a floating window. Run `swm window float on` first if it is tiled:

```text
hyper - h: swm window grid 2:1:0:0:1:1
hyper - l: swm window grid 2:1:1:0:1:1
hyper - f: swm window grid 1:1:0:0:1:1
hyper - r: swm window focus recent
```
