---
title: "Command line"
description: "Command structure, every command at a glance, and JSON queries."
weight: 20
---

## How commands work

Run `swm` with no subcommand to start the daemon. `swm start` does the same thing:

```sh
swm [start] [--config <path>] [--log-level <level>]
```

Every other command goes to the running daemon:

```sh
swm <domain> <command> [arguments]
```

The domains are `query`, `window`, `space`, `display`, `config`, `rule`, and `signal`. Commands print their result to standard output and exit with a non-zero status when they fail. For help, run `swm --help`, `swm <domain> --help`, or `swm help <domain> <command>`.

Top-level options:

```text
-h, --help                 Show help
-v, --version              Show the version
```

`swm --version` and `swm -v` print `swm version <version>` and exit. They do not start the daemon.

`swm` and `swm start` also accept these daemon options:

```text
-c, --config <path>        Use a different startup configuration file
    --log-level <level>    debug, info, warn, or error (default: info)
```

The daemon requests cancellation after 4.5 seconds. A timed-out failure reports `request timed out and was cancelled`. Cancellation takes effect at the command's next cancellation check; it does not undo changes already submitted, such as a Space switch. Query the state before retrying.

## Command reference

| Command | Action |
| --- | --- |
| `swm reload` | Run the [configuration file](/swm/getting-started/#configuration-file) again. |
| `swm query displays\|spaces\|windows` | List displays, Spaces, or windows as JSON. |
| `swm query display\|space\|window` | Print one object, or the focused one. |
| `swm window focus` | Focus a neighbouring, recent, master, or specific window. |
| `swm window warp` | Move the mouse cursor to a window. |
| `swm window minimize`, `unminimize` | Minimize or restore a window. |
| `swm window move`, `resize`, `grid` | Place a floating window. |
| `swm window move --display`, `--space` | Send a window to another display or Space. |
| `swm window float` | Float a window, return it to tiling, or toggle between the two. |
| `swm window swap` | Swap a window with a neighbour or the master window. |
| `swm window split-ratio`, `toggle-split`, `swap-split` | Change the nearest dwindle split. |
| `swm display focus` | Focus another display. |
| `swm space activate` | Show a Space on its display. |
| `swm config <setting>` | Read or change a global default, or select one Space with `--space`. |
| `swm rule add`, `list`, `remove`, `clear` | Manage [window rules](/swm/rules/). |
| `swm signal add`, `list`, `remove`, `clear` | Manage [signals](/swm/signals/). |

[Windows](/swm/windows/), [Spaces and layouts](/swm/spaces-and-layouts/), and [global settings](/swm/settings/) describe each command's arguments.

## Reload the configuration

```sh
swm reload [--config <path>]
```

Without `--config`, reload runs `~/.config/swm/swmrc`, even if the daemon started with another file. Pass that file's path explicitly to reload it.

Rules and signals registered by the file replace the current ones only when the file exits successfully. While it runs, its rule and signal commands work on a separate collection that starts empty. Existing rules and signals stay active. Unchanged rule placements are not repeated, so windows you moved by hand stay where you put them.

If the file exits unsuccessfully, reload exits with status 1, keeps the previous rules and signals, and restores settings. If the reload process exits before finishing, the daemon also rolls back. Add `set -e` to a shell configuration to stop at a failed command; otherwise the script's final exit status decides whether the reload succeeds.

Settings change immediately while the file runs. Settings omitted from the file keep their values. Rollback cannot undo window, Space, or display commands, or programs the file starts. Restoring layout settings can reflow windows. Restoring a changed split ratio rebalances splits, and restoring split preservation cannot recover directions cleared by the script.

Only one reload can run at a time. Commands outside the script still apply immediately, but rules and signals they add during a reload are replaced if it succeeds. A failed reload restores all settings to their values at its start, including settings changed by hotkeys while it ran. Child programs inherit `SWM_RELOAD_TOKEN`; their commands join the reload while it is open and apply immediately after it closes.

With an older daemon that lacks reload transactions, the client warns and falls back to clearing rules and signals before running the file. Restart the daemon after upgrading to use rollback.

## Query state

Queries print indented JSON in a terminal and compact JSON on one line when piped or redirected. List every tracked object of one type:

```sh
swm query displays
swm query spaces
swm query windows
```

Add at most one selector to filter the list:

```sh
swm query windows --display 1
swm query windows --space 1
swm query windows --window 12345
```

The singular commands take an optional index or ID. Without one, they print the focused object:

```sh
swm query display [display-index]
swm query space [space-index]
swm query window [window-id]
```

Display indexes start at 1 and follow the physical display arrangement. Space indexes also start at 1. When the selector names the same type as the query, a filtered query prints one JSON object. Otherwise it prints an array of related objects.

### Window tiling state

Window queries include `tiling` and `tiling-reason`. `tiling` reports how the last layout update treated the window:

- `tiled`: the window is part of a tiling layout.
- `floating`: swm leaves the window's frame alone.
- `excluded`: swm does not lay out the window.
- `pending`: swm is waiting for Accessibility or Space information.
- `null`: swm has not yet laid out the window.

`tiling-reason` explains a `floating` or `excluded` state and is otherwise `null`:

| Reason | Meaning |
| --- | --- |
| `manual` | Floated with `swm window float`. |
| `rule` | A rule sets `manage=off`. |
| `float-layout` | The window's Space uses the `float` layout. |
| `multiple-spaces` | The window is on more than one Space. |
| `dialog` | The window is modal, or has a close button but no enabled full-screen button. |
| `not-resizable` | The application does not allow resizing the window. |
| `not-movable` | The application does not allow moving the window. |
| `unsupported-subrole` | The window is not a standard window, such as a panel or sheet. |
| `native-fullscreen` | The window is in macOS full screen. |
| `minimized` | The window is minimized. |
