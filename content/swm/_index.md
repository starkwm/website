---
title: "swm"
description: "A client and daemon for scriptable macOS window management."
weight: 20
homeSummary: "Moves your windows around so you don't have to."
homeHello: "I tile."
homeSays: "swm window warp right"
homeInstall: "brew install starkwm/formulae/swm"
homeVersion: "v0.0.29"
homeDetails: "Move, resize, and focus windows from the command line, or tile them with master, monocle, or dwindle layouts. Query displays, Spaces, and windows as JSON, and run shell commands when windows or Spaces change."
---

`swm` is a command-line window manager with optional automatic tiling. One `swm` process runs as a daemon and tracks applications, displays, spaces, and windows. Other invocations send commands to that daemon.

It is inspired by [yabai](https://github.com/asmvik/yabai) and replaces the JavaScript configuration used by its predecessor, [Stark](https://github.com/starkwm/stark), with a small shell-based command interface.

This reference covers [v0.0.29](https://github.com/starkwm/swm/releases/tag/v0.0.29), the latest prerelease, checked on 1 November 2026.

## Unreleased main

The following behavior is on [main at 2543eb4](https://github.com/starkwm/swm/commit/2543eb481791f67e07df1225e393a20cd547b7c3), after v0.0.29. It is not included in that release or its Homebrew installation. The rest of this reference describes v0.0.29.

### Dwindle size recovery

When an application repeatedly keeps a window larger than requested, dwindle records the refused dimensions and tries to fit the layout around them. The configured split ratio stays unchanged, but the actual window sizes can use a different ratio. Dynamic splits still follow each region's longest edge; preserved split directions stay fixed.

swm waits for all windows in the Space/display layout to settle before attempting up to two corrective layout passes. If recovery fails, it can try restoring the last verified arrangement when the same windows, display bounds, and Space settings still match. It does not float windows or turn on split preservation to make them fit.

If swm cannot find or restore a working arrangement, it logs an unsatisfied layout and stops retrying that arrangement during background reflows. Recovery is bounded and is not guaranteed when windows cannot fit or an app changes its size requirements. Explicit layout adjustments and finishing a pointer move or resize allow a fresh attempt. Observed size constraints are temporary and are removed when the window closes.

### Enable split preservation before toggling

On main, `swm window toggle-split` requires split preservation to be enabled for the selected window's dwindle layout. This requirement was added in [2543eb4](https://github.com/starkwm/swm/commit/2543eb481791f67e07df1225e393a20cd547b7c3). Split preservation is off by default.

For a focused tiled window in the active Space's dwindle layout:

```sh
swm space preserve-split on
swm window toggle-split
```

Update scripts and key bindings that toggle splits to enable preservation first. For a window selected with `--window`, enable preservation on its Space with `swm space preserve-split --space <space-index> on`. Without preservation, or when the window has no eligible dwindle split, the command returns `window has no dwindle split to toggle, or preserve-split is off: <window-id>`.

Turning preservation off with `swm space preserve-split off` clears retained directions and returns splits to following the longest edge. The new preservation requirement does not apply to v0.0.29.

## Upgrade from v0.0.28

In v0.0.29, `swm -v` is a short form of `swm --version`. Both print `swm version <version>` and exit without starting the daemon. The short form was added in [b213835](https://github.com/starkwm/swm/commit/b2138357727b99333e6bdaedf30c950209d0eb0f). Use `swm --version` with v0.0.28.

In v0.0.29, window subcommands accept only `--window` for the optional window selector. The `-w` short form was removed in [ea1e57d](https://github.com/starkwm/swm/commit/ea1e57d62e3ab7500f9d29fd856eeed60ec1afbc). Replace `-w` with `--window` in scripts and key bindings before upgrading. This change is not included in v0.0.28. Window IDs, `recent`, and the default focused-window selection are unchanged.

### Read Space settings

In v0.0.29, omit the value from `space layout`, `space master-ratio`, `space master-placement`, `space preserve-split`, or `space gap` to print the selected Space's current setting. Run `space padding` without side flags to print all four sides. These read operations were added in [46a0ba6](https://github.com/starkwm/swm/commit/46a0ba614ba8a13f995c724157c738fa49fcf3bb).

```sh
swm space layout
swm space master-ratio
swm space master-placement
swm space preserve-split
swm space gap
swm space padding --space 2
```

The commands use the active Space unless you supply `--space <space-index>`, the one-based index from `swm query spaces`. They print a plain value in the form accepted by the setting command. Padding prints `--top <points> --bottom <points> --left <points> --right <points>`; split preservation prints `on` or `off`.

Reading a setting leaves it unchanged. Layout, master ratio, master placement, and split preservation reads return an error if automatic tiling is unavailable for the selected Space. `space activate` still requires an index.

### Adjust global settings

In v0.0.29, `config gap`, `config padding`, and `config master-ratio` accept signed changes such as `+2` or `-0.05`. An unsigned number sets the value. This was added in [95cdec2](https://github.com/starkwm/swm/commit/95cdec2b285bf2bedec6d03be14e69dd2c418498).

```sh
swm config gap +2
swm config padding --top -2 --bottom +2
swm config master-ratio -0.05
```

Each adjustment starts from the current global value and applies the result to every Space, replacing that setting's per-Space overrides and updating the default for future Spaces. For example, with a global gap of `6` and a Space gap of `20`, `swm config gap +2` sets both to `8`. Padding changes affect only the sides supplied; omitted sides keep their existing values on each Space.

Negative resulting gaps and padding are clamped to zero, and master ratios to `0.1` through `0.9`. Omitting the value still prints the current global setting. Use the corresponding `space` command to adjust just one Space.

A negative global gap now subtracts from the global value instead of setting the gap to zero. Use `swm config gap 0` to reset it. After upgrading, restart the daemon so the client and daemon agree on the changed IPC format for global gap and master ratio.

### Cycle global master placement

In v0.0.29, `swm config master-placement next` and `swm config master-placement prev` cycle the global master-area edge. This was added in [18fb8e7](https://github.com/starkwm/swm/commit/18fb8e714e920811f4c87bd0422513bc35bfee8e).

```sh
swm config master-placement next
swm config master-placement prev
```

`next` cycles through `left`, `top`, `right`, `bottom`, then back to `left`; `prev` reverses that order. The command starts from the current global edge, applies the result to every Space, replacing per-Space master-placement overrides, and updates the default for future Spaces. It prints the resulting edge, such as `top`.

Omit the argument to read the global edge without changing it, or supply `left`, `right`, `top`, or `bottom` to set it directly. Use `swm space master-placement next` or `prev` to cycle just one Space from its own current edge.

### Exclude a bundle ID from a rule

In v0.0.29, `swm rule add` accepts `bundle-id!=<identifier>` to match windows whose bundle ID differs from the given identifier. This was added in [83dde79](https://github.com/starkwm/swm/commit/83dde79606ecdc6d9c0f7d15c1df873c82ac721d).

```sh
swm rule add label=other-apps 'bundle-id!=com.apple.finder' manage=off
```

This rule leaves windows from other identified applications out of automatic tiling. It does not match Finder or windows whose bundle ID is missing. Bundle IDs use exact, case-sensitive comparison, not regular expressions. Other filters on the same rule must also match.

Negation is supported only for `bundle-id`, `app`, and `title` rule filters. Supplying both `bundle-id` and `bundle-id!` in one rule is rejected as a duplicate property. Signal filters do not accept bundle IDs.

### Update signal active filters

In v0.0.29, `swm signal add` accepts `active=on|off` instead of `active=yes|no`. This changed in [19395d7](https://github.com/starkwm/swm/commit/19395d7e0d7f5f3d27d2f82c83144310ff944949). Keep using `yes` and `no` with v0.0.28.

Before upgrading, replace `active=yes` with `active=on` and `active=no` with `active=off` in signal registrations, including those in `swmrc`. The old values now return an error.

```sh
swm signal add event=window-focused active=on action='echo "$SWM_WINDOW_ID"'
```

`on` matches active applications or focused windows; `off` matches inactive applications or unfocused windows. The filter remains limited to application and window events. Space and display events reject it.

### Set dwindle split ratios

In v0.0.29, `swm space split-ratio` and `swm config split-ratio` read, set, or adjust the ratio used for dwindle splits. These commands were added in [9523c6e](https://github.com/starkwm/swm/commit/9523c6e41bf73b07180ad22989e0c60b8a6f7867).

```sh
swm space split-ratio [--space <space-index>] [<ratio>]
swm config split-ratio [<ratio>]
```

The ratio is the share of each split's region given to its left or upper side. The built-in default is `0.5`. An unsigned number sets the ratio from `0.1` through `0.9`; a signed number adjusts it, clamping the result to that range. Omit the value to print the current setting without changing it.

```sh
swm space split-ratio 0.6
swm space split-ratio --space 2 +0.05
swm config split-ratio -0.05
swm config split-ratio
```

A Space command uses the active Space unless you supply `--space`, and applies to every display showing that Space. Setting or adjusting its ratio rebalances every existing dwindle split to the result and uses it for new splits. Retained split directions are preserved. Reads and writes return an error if automatic tiling is unavailable for the selected Space.

A global change starts from the global ratio, applies the result to every Space, replacing per-Space split ratios, and updates the default for future Spaces. Both commands replace any individual split adjustments in their scope. Use `swm window split-ratio` afterwards to adjust just the nearest split for a window; that command does not change the Space's setting for new splits.

### Float windows before direct placement

In v0.0.29, `swm window move`, `swm window resize`, and `swm window grid` reject tiled windows with `window is tiled: <window-id>`. This changed in [755a57c](https://github.com/starkwm/swm/commit/755a57c2f6f488df4a1d4690e6426b28e28e3771).

Before using these commands on a tiled window, float it first. For example, to place the focused window in the right half of the display:

```sh
swm window layout float
swm window grid 2:1:1:0:1:1
```

For a specific window, pass the same `--window <window-id>` to both commands. Update scripts and grid key bindings that target tiled windows before upgrading. Use `swm window layout tile` to return the window to automatic tiling afterwards.

Windows on a Space using the `float` layout, explicitly floated windows, and windows on multiple Spaces are outside automatic layout geometry and do not trigger this rejection. Other checks still apply. `swm window display` and `swm window space` are not affected by this change.

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
git checkout v0.0.29
make build
```

`make build` writes the binary to `.build/debug/swm`. Run it once and grant Accessibility permission when macOS asks:

```sh
.build/debug/swm
```

A source build does not install a login service.

## How commands work

Run `swm` without a subcommand to start the daemon. `swm start` is the explicit equivalent:

```sh
swm [start] [--config <path>] [--log-level <level>]
```

Send commands to the running daemon through command-specific subcommands:

```sh
swm <domain> <command> [arguments]
```

The available domains are `query`, `window`, `space`, `config`, `rule`, and `signal`. Commands print their result to standard output and return a non-zero exit status on failure. Run `swm --help`, `swm <domain> --help`, or `swm help <domain> <command>` for help.

Top-level options:

```text
-h, --help                 Show help
-v, --version              Show the version
```

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
swm window warp [--window <window|recent> | <left|right|up|down>]
```

`warp` moves the mouse cursor to the selected window's center without focusing or raising the window, switching Spaces, or generating a mouse movement event. It defaults to the focused window. swm rejects hidden, minimized, and off-Space windows. If the window's center is off-screen, the cursor moves to the center of the largest part of the window visible on a display.

With a direction, swm chooses the nearest non-minimized, on-screen window in the requested direction from the managed window under the cursor. If the cursor is not over an available managed window, it starts from the focused window. Each command checks the window under the cursor again, so repeated warps navigate between windows without changing focus. If another window covers the destination, the next warp starts from that covering window. `--window` and a direction cannot be combined.

`window warp` is available in v0.0.26 and later.

### Move, resize, and place

```sh
swm window move [--window <window|recent>] <abs|rel>:<x>:<y>
swm window resize [--window <window|recent>] <abs|rel>:<width>:<height>
swm window grid [--window <window|recent>] <columns>:<rows>:<x>:<y>:<width>:<height>
swm window display [--window <window|recent>] <next|prev|display-index>
```

`abs` sets coordinates or dimensions; `rel` adds signed values to the current frame. Grid cells share the padded screen bounds, with the configured gap between adjacent cells. A multi-cell span includes its internal gaps; a full-axis span uses the entire padded axis. Grid coordinates start at `0:0` in the top-left. The final width and height are cell spans. `move`, `resize`, and `grid` reject tiled windows. Float the focused window before placing it in the right half of a 2-by-1 grid:

```sh
swm window layout float
swm window grid 2:1:1:0:1:1
```

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
swm window layout [--window <window|recent>] <float|tile|toggle>
swm window swap [--window <window|recent>] <left|right|up|down|next|prev|master>
swm window split-ratio [--window <window|recent>] <ratio>
swm window toggle-split [--window <window|recent>]
swm window swap-split [--window <window|recent>]
```

- `layout` floats a window, returns it to tiling, or toggles its state.
- `swap left|right|up|down` swaps tiled positions, or complete frames in a floating layout.
- `swap next|prev` swaps the focused tiled window with its ordered neighbour and does not accept `--window`.
- `swap master` promotes a window in a master layout.
- `split-ratio` sets the nearest dwindle split to a ratio from `0.1` through `0.9`, or adjusts it by a signed change such as `+0.05`. Adjustments are clamped to that range.
- `toggle-split` switches the nearest retained dwindle split between columns and rows.
- `swap-split` exchanges the two subtrees at the nearest dwindle split.

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
swm space padding [--space <space-index>] [--top <points>] [--bottom <points>] [--left <points>] [--right <points>]
swm space gap [--space <space-index>] [<points>]
```

Use an unsigned value to set a ratio, padding, or gap, or a signed value such as `+2` or `-2` to adjust it. Master and split ratios must be from `0.1` through `0.9`; adjustments are clamped to that range. Omit the value to read a setting. Padding without side flags prints all four sides; when setting padding, omitted sides stay unchanged. Negative resulting padding and gaps are clamped to zero. Space settings apply to every display showing that space.

### Layouts

The layouts are:

- `float`: do not arrange windows automatically.
- `master`: place one window at the selected edge and the others in a stack.
- `monocle`: overlap every tiled window across the available bounds.
- `dwindle`: recursively split the available bounds around the focused window.

In a dwindle layout, new windows split the focused tiled window and removing a window collapses its sibling branch. Splits normally follow the longest available edge. `swm space preserve-split on` keeps each branch's direction, and `swm window toggle-split` changes it.

Each physical display has an independent tiling layout, including when macOS's **Displays have separate Spaces** setting is disabled. Moving a tiled window between displays moves it into the destination layout. If you move or resize a tiled window by hand, it snaps back into place.

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
swm config padding [--top <points>] [--bottom <points>] [--left <points>] [--right <points>]
```

Built-in defaults are floating layout, focus-follows-mouse off, `0.5` master and dwindle split ratios, master on the left, split preservation off, animation disabled, and zero padding and gaps. Master and split ratios must be from `0.1` through `0.9`. Gap, padding, master ratio, and split ratio accept unsigned values to set them or signed changes to the global value. The result replaces per-Space settings and becomes the default for future Spaces. Padding updates only the supplied sides. Negative resulting gaps and padding are clamped to zero; ratios are clamped to `0.1` through `0.9`. Run a config command without a value to print its current setting, such as `swm config gap` or `swm config padding`.

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

Add rules to `~/.config/swm/swmrc` to keep selected windows floating or place them on a display. For example, leave Settings and Finder out of tiling layouts:

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
- `grid=<columns>:<rows>:<x>:<y>:<width>:<height>` places a floating window within the display's visible bounds. It uses the destination Space's padding and gaps, with the same coordinate clamping as `swm window grid`.

### Match windows

A rule can use these filters:

- `bundle-id=<identifier>` matches an exact, case-sensitive application identifier. `bundle-id!=<identifier>` excludes it.
- `app=<regex>` matches the application name, which can vary with the system language.
- `title=<regex>` matches the window title.
- `app!=<regex>` or `title!=<regex>` requires the text not to match.

All filters must match. If a window's value is missing, that filter fails even when inverted. A rule without filters matches every window.

Regexes use Foundation's ICU syntax. They are case-sensitive by default and match substrings unless anchored with `^` and `$`. Quote them in shell scripts. swm rejects invalid regexes, unknown properties, empty values, and duplicate properties without adding the rule.

The last matching value for each action wins. A rule that only sets `grid` leaves an earlier `manage` or `display` value in place. Put broad rules before exceptions:

```sh
swm rule add label=finder app='^Finder$' manage=off
swm rule add label=finder-projects app='^Finder$' title='^Projects$' manage=on
```

### Tiling

`manage=off` leaves a window out of automatic tiling and tiling cycles. Queries, focus, and direct window commands still work. `manage=on` allows tiling if the window supports it. It cannot force fixed-size, nonstandard, or native-fullscreen windows into a layout.

swm checks rules before a new window's first layout, when rules change, and during later window updates. Title changes trigger a check when the app supports title notifications. Removing a management rule restores the earlier matching value or the normal default.

`swm window layout float`, `tile`, and `toggle` override management rules for that window until it closes or the daemon restarts. Rule edits preserve those choices. `toggle` reverses the window's float/tile setting. Rules do not change the Space's layout. A Space using `float` keeps its usual floating-window commands and cycling.

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

`swm` does not bind keys. Use a hotkey daemon such as [skbd](/skbd/) to invoke its commands. These grid bindings require a floating window. Run `swm window layout float` first if it is tiled:

```text
hyper - h: swm window grid 2:1:0:0:1:1
hyper - l: swm window grid 2:1:1:0:1:1
hyper - f: swm window grid 1:1:0:0:1:1
hyper - r: swm window focus recent
```
