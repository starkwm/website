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
