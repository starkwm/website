---
title: "Command line"
description: "Start and stop sborders, change settings, and inspect window borders."
weight: 30
---

`sborders` without a command runs `sborders start`.

| Command | Behaviour |
| --- | --- |
| `start [--config <path>]` | Run the daemon in the foreground |
| `validate [--config <path>]` | Check an existing file without starting the daemon |
| `query [--windows \| --config \| --diagnostics]` | Print a JSON response; defaults to diagnostics |
| `reload` | Reload the file and clear runtime overrides after validation |
| `set <property> <value>` | Apply a runtime setting without changing the file |
| `stop` | Stop the daemon and remove its border windows and socket |
| `--help` | Show command help |
| `--version` | Show the binary version |

Help, version, and validation work without a desktop session. Invalid commands and configurations return a nonzero exit status.

## Target a daemon

Client commands accept `--socket`. The default is `~/.config/sborders/control.sock`. A daemon using `--config` creates `control.sock` beside that file:

```sh
sborders start --config /tmp/my-borders/config.jsonc
sborders query --socket /tmp/my-borders/control.sock
sborders set width 5 --socket /tmp/my-borders/control.sock
sborders stop --socket /tmp/my-borders/control.sock
```

Only one daemon can own a given socket. Socket permissions and peer checks restrict access to the same user. Start the daemon before running client commands.

## Inspect state

Queries return an object with `ok`, a `value` on successful queries, and `error` on failure.

`query --config` reports the effective configuration, including runtime changes.

### Windows

`query --windows` lists discovered windows with their IDs, PID, application identity, frame, Spaces, focus state, and border diagnostics.

A missing border isn't always an error. Hidden, fullscreen, or filtered windows have no visible border, nor do windows whose border colour is fully transparent. Borders also hide during Mission Control or when you disable them.

Each border uses up to four small backing windows around the application's window. The query reports these fields:

| Field | Meaning |
| --- | --- |
| `borderIDs` | IDs of all backing windows for the border |
| `borderID` | First backing window ID, kept for compatibility |
| `borderFrame` | Combined bounds of the backing windows, as reported by WindowServer |
| `borderSublevel` | Sublevel of the first backing window |
| `borderVisible` | Whether all backing windows are ordered in for display |

Frames use WindowServer coordinates. The origin is at the top left of the main display, so other displays can have negative coordinates.

### Diagnostics

`query --diagnostics` reports the daemon PID, OS version, selected configuration path, and whether runtime overrides are active. It also includes window, border, event, and reconciliation counts, plus the latest configuration or backend error.

`missionControlActive` tells you whether Mission Control is hiding borders. This does not change the `enabled` setting.

`borderCount` counts borders that have backing windows, including hidden borders retained by the daemon. Fully transparent borders have no backing windows and don't count towards this total.

### Drawing counters

To inspect what happens during a drag, compare counters before moving a window and after it settles. Check whether unrelated borders changed and whether the moved border reused its drawing contexts.

Daemon diagnostics include `geometryQueryCount`, `metadataQueryCount`, and `focusQueryCount`. These count queries for window bounds, metadata, and focus respectively. Each window also reports drawing counters:

| Counter | What it counts |
| --- | --- |
| `contextCreationCount` | Drawing contexts created for individual border strips |
| `redrawCount` | Border repaints, counted per whole border |
| `transactionCount` | Grouped WindowServer transactions |

These counters show how much work sborders submitted. They don't measure how long it took to appear on screen.

## Stop

If you started sborders with Homebrew services, use `brew services stop sborders`. Running `sborders stop` alone causes Homebrew to restart it. See [run at login](/sborders/getting-started/#run-at-login).

`stop` replies before the daemon finishes shutting down. The daemon unregisters notifications, cancels file watchers, closes borders, and removes its socket. SIGINT and SIGTERM use the same cleanup path. The lock file may remain on disk after exit, but the operating system releases the lock when the daemon closes the file.
