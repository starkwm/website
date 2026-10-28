---
title: "swm"
description: "A client and daemon for scriptable macOS window management."
weight: 20
homeSummary: "Moves your windows around so you don't have to."
homeHello: "I tile."
homeSays: "swm window warp --direction east"
homeInstall: "brew install starkwm/formulae/swm"
homeVersion: "v0.0.27"
homeDetails: "Move, resize, and focus windows from the command line, or tile them with master, monocle, or dwindle layouts. Query displays, Spaces, and windows as JSON, and run shell commands when windows or Spaces change."
---

`swm` is a command-line window manager with optional automatic tiling. One `swm` process runs as a daemon and tracks applications, displays, spaces, and windows. Other invocations send commands to that daemon.

It is inspired by [yabai](https://github.com/asmvik/yabai) and replaces the JavaScript configuration used by its predecessor, [Stark](https://github.com/starkwm/stark), with a small shell-based command interface.

This reference covers [v0.0.27](https://github.com/starkwm/swm/releases/tag/v0.0.27), the latest prerelease, checked on 12 October 2026.

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
git checkout v0.0.27
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
    --version              Show the version
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
swm query windows --space 0
swm query windows --window 12345
```

Singular query commands accept an optional index or ID. Without one they return the focused object:

```sh
swm query display [display-index]
swm query space [space-index]
swm query window [window-id]
```

Display indexes are one-based and follow the physical display arrangement. Space indexes are zero-based. A filtered query returns one JSON object when the selector identifies the same type as the query; otherwise it returns an array of related objects.

## Manage windows

The `--window` option accepts a numeric window ID, or `recent` for the previously focused window. Commands that accept `--window` use the focused window when it and any alternative target, such as `--direction`, are omitted.

### Focus and minimize

```sh
swm window focus [--window <window|recent> | --direction <left|right|up|down>]
swm window minimize [--window <window|recent>]
swm window unminimize [--window <window|recent>]
```

Directional focus chooses the nearest non-minimized window on the currently visible spaces.

### Move the mouse cursor

```sh
swm window warp [--window <window|recent> | --direction <left|right|up|down>]
```

`warp` moves the mouse cursor to the selected window's center without focusing or raising the window, switching Spaces, or generating a mouse movement event. It defaults to the focused window. swm rejects hidden, minimized, and off-Space windows. If the window's center is off-screen, the cursor moves to the center of the largest part of the window visible on a display.

With `--direction`, swm chooses the nearest non-minimized, on-screen window in the requested direction from the managed window under the cursor. If the cursor is not over an available managed window, it starts from the focused window. Each command checks the window under the cursor again, so repeated warps navigate between windows without changing focus. If another window covers the destination, the next warp starts from that covering window. `--window` and `--direction` cannot be combined.

`window warp` is available in v0.0.26 and later.

### Move, resize, and place

```sh
swm window move [--window <window|recent>] <abs|rel>:<x>:<y>
swm window resize [--window <window|recent>] <abs|rel>:<width>:<height>
swm window grid [--window <window|recent>] <columns>:<rows>:<x>:<y>:<width>:<height>
swm window display [--window <window|recent>] <next|prev|display-index>
```

`abs` sets coordinates or dimensions; `rel` adds signed values to the current frame. Grid coordinates start at `0:0` in the top-left. The final width and height are cell spans. For example, this places the focused window in the right half of a 2-by-1 grid:

```sh
swm window grid 2:1:1:0:1:1
```

Display indexes are one-based. `next` and `prev` wrap around the arranged display list; `previous` is also accepted.

### Move between Spaces

```sh
swm window space [--window <window|recent>] <space-index|next|prev>
```

Space indexes are zero-based and match `swm query spaces`. `next` and `prev` cycle through normal desktop Spaces in query order, skip fullscreen Spaces, and wrap at either end. `previous` is also accepted. The command defaults to the focused window and keeps the current Space active. Moves to a Space on another display fit the window within that display's visible bounds.

Only windows on a single normal desktop Space can move. swm rejects fullscreen windows and windows assigned to more than one Space. Moving a window to its current Space leaves it in place.

Movement works with SIP enabled. The command waits up to two seconds for WindowServer to confirm the new Space membership, then updates visible tiling layouts. If movement is unavailable or cannot be confirmed, the command returns an error. A timeout does not undo a move that completes later. Query the state before retrying.

```sh
swm query spaces
swm window space next
swm window space --window <window-id> 0
```

### Control tiling

```sh
swm window layout [--window <window|recent>] <float|tile|toggle>
swm window cycle --direction <next|prev>
swm window swap-cycle --direction <next|prev>
swm window swap [--window <window|recent>] --direction <left|right|up|down>
swm window swap-with-master [--window <window|recent>]
swm window focus-master [--window <window|recent>]
swm window split-ratio [--window <window|recent>] <abs|rel>:<ratio>
swm window toggle-split [--window <window|recent>]
swm window swap-split [--window <window|recent>]
```

- `layout` floats a window, returns it to tiling, or toggles its state.
- `cycle` focuses the next or previous window in stable layout order.
- `swap-cycle` swaps the focused tiled window with its ordered neighbour.
- `swap` swaps tiled positions, or complete frames in a floating layout.
- `swap-with-master` promotes a window in a master layout.
- `focus-master` focuses the master window for the selected window's layout.
- `split-ratio` changes the nearest dwindle split; ratios are clamped to `0.1...0.9`.
- `toggle-split` switches the nearest retained dwindle split between columns and rows.
- `swap-split` exchanges the two subtrees at the nearest dwindle split.

## Configure spaces

### Activate a Space

```sh
swm query spaces
swm space activate <space-index>
```

Activation uses the zero-based `index` from `swm query spaces`. It changes the visible Desktop on the target's display without requesting keyboard-focus transfer between displays. The target display must contain only normal desktop Spaces. swm refuses displays that contain a native fullscreen Space.

The command waits up to two seconds for the target display to report the requested current Space. A timeout or cancellation after submission does not mean the Space stayed unchanged. Query the state before retrying.

`space activate` is available in v0.0.26 and later.

### Configure a Space

Space commands affect the active space by default. Use `--space <space-index>` to select another space by its zero-based index from `swm query spaces`. Indexes follow the current Space ordering and may change when Spaces are reordered:

```sh
swm space layout [--space <space-index>] <float|master|monocle|dwindle>
swm space master-ratio [--space <space-index>] <abs|rel>:<ratio>
swm space master-placement [--space <space-index>] <left|right|top|bottom|next|prev>
swm space preserve-split [--space <space-index>] <on|off>
swm space padding [--space <space-index>] <abs|rel>:<top>:<bottom>:<left>:<right>
swm space gap [--space <space-index>] <abs|rel>:<points>
```

swm clamps padding, gaps, and ratios to valid values. Space settings apply to every display showing that space.

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
swm config master-placement <left|right|top|bottom>
swm config preserve-split <on|off>
swm config animation-duration <seconds>
swm config animation-easing <linear|ease-out-quad|ease-out-cubic|ease-out-circ|ease-in-out-quad>
swm config window-gap <points>
swm config top-padding <points>
swm config bottom-padding <points>
swm config left-padding <points>
swm config right-padding <points>
```

Built-in defaults are floating layout, focus-follows-mouse off, `0.5` master ratio, master on the left, split preservation off, animation disabled, and zero padding and gaps. swm clamps negative padding and gaps to zero.

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
swm config window-gap 8
swm config top-padding 8
swm config bottom-padding 8
swm config left-padding 8
swm config right-padding 8
```

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

`list` returns a JSON array. Each entry has a one-based `index` and a `rule` object with the registered properties. Indexes change after removal. Use a unique, non-integer `label` to remove a rule by name.

`add` requires at least one action:

- `manage=on|off` allows or skips automatic tiling.
- `display=<index|uuid>` moves the window to a display without following focus. Indexes start at 1 and use the same order as `swm window display`. Use a UUID from `swm query displays` to identify a monitor regardless of its index. Rules accept neither `next` nor `prev`.
- `grid=<columns>:<rows>:<x>:<y>:<width>:<height>` places a floating window within the display's visible bounds. It uses the destination Space's padding and gaps, with the same coordinate clamping as `swm window grid`.

### Match windows

A rule can use these filters:

- `bundle-id=<identifier>` matches an exact, case-sensitive application identifier.
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
- `active=yes|no`: filter application and window events by active or focused state.

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

Signal registrations exist only for the current daemon run, so put persistent registrations in `swmrc`.

## Keyboard shortcuts

`swm` does not bind keys. Use a hotkey daemon such as [skbd](/skbd/) to invoke its commands:

```text
hyper - h: swm window grid 2:1:0:0:1:1
hyper - l: swm window grid 2:1:1:0:1:1
hyper - f: swm window grid 1:1:0:0:1:1
hyper - r: swm window focus --window recent
```
