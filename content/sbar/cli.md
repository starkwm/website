---
title: "Command line"
description: "Start, validate, inspect, and control a running bar."
weight: 20
---

| Command | Action |
| --- | --- |
| `sbar`, `sbar start` | Start the bar. |
| `sbar validate` | Check a configuration file without starting the bar. |
| `sbar query` | Print the running configuration, diagnostics, or displays as JSON. |
| `sbar reload` | Reload the configuration file now. |
| `sbar set` | Change an item property until the next reload. |
| `sbar trigger` | Refresh matching items and send an event to plugins. |
| `sbar subscribe` | Stream runtime events as JSON lines. |
| `sbar stop` | Stop a running bar. |

Run `sbar --help` or `sbar <command> --help` for help. Client commands and validation exit with a nonzero status when they fail.

## Start the bar

Run `sbar` or `sbar start` to start the bar. By default, sbar reads `~/.config/sbar/config.jsonc` if it exists, and `~/.config/sbar/config.json` otherwise. Pass `--config <path>` to either command to use another file. The process runs until you stop it.

Client commands connect to `~/.config/sbar/control.sock` by default. A bar started with `--config` creates `control.sock` next to that file. To reach that bar, pass `--socket <path>` after the client subcommand:

```sh
sbar start --config /path/to/config.jsonc
```

In another terminal:

```sh
sbar query --socket /path/to/control.sock
sbar stop --socket /path/to/control.sock
```

Only one bar can own a socket, and clients must run as the same user. Two configuration files in the same directory share one socket. If a client reports `Cannot connect to sbar`, check that the bar is running and that `--socket` points into its configuration directory.

## Validate configuration

```sh
sbar validate
sbar validate --config /path/to/config.jsonc
```

Validation does not need a running bar. It reads the default file unless you pass `--config`, reports invalid or missing files, and never writes to the file. See [configuration](/sbar/configuration/) for the required fields.

## Query state

```sh
sbar query [--diagnostics | --displays] [--socket <path>]
```

`query` prints the running configuration as JSON. `--diagnostics` prints the configuration path, the current configuration error, the last action error, and up to 100 recent runtime events. `--displays` prints each connected display's ID and name, and whether it is the primary display. Pass at most one of these flags.

## Reload configuration

```sh
sbar reload [--socket <path>]
```

`reload` reads the file straight away. If the configuration is invalid, the command fails and the bar keeps the last valid one.

## Update items

```sh
sbar set <item-id> <property> <value> [--socket <path>]
```

sbar parses the value as JSON when it can, and as a string otherwise:

```sh
sbar set clock enabled false
sbar set clock style '{"tint":"#88C0D0"}'
```

`set` only changes the configuration in memory. It supports `symbol`, `enabled`, `priority`, `format`, `dateStyle`, `timeStyle`, `style`, and `popup`. A successful reload or a restart throws these changes away, so edit the configuration file to keep them.

Setting `style` replaces the item's whole style object, and the fields you leave out fall back to the theme. `sbar set clock style null` clears every style override on the item. Changing `text`, `symbolPosition`, provider blocks, actions, children, or refresh settings needs a configuration file edit.

## Trigger events

```sh
sbar trigger <event> [<json>] [--socket <path>]
sbar trigger refresh '{"source":"manual"}'
```

Items whose ID or refresh event name matches take a new native snapshot, or rerun their command. The bar also passes the trigger to running plugins, subject to their [input queue and restart rules](/sbar/providers/plugin/#input-protocol). The optional payload must be valid JSON. sbar includes it in runtime events and plugin input.

## Subscribe to events

```sh
sbar subscribe [--socket <path>]
```

`subscribe` prints a JSON line for each configuration change, provider value, and trigger until you interrupt it. The bar disconnects subscribers that fall behind.

## Stop the bar

```sh
sbar stop [--socket <path>]
```

`stop` acknowledges the request, then shuts the bar down. It stops providers and child processes, closes panels, and removes the control socket. Pass `--socket` to stop a bar started with a custom configuration directory.

For a Homebrew service, run `brew services stop sbar` instead. That stops the bar and turns off startup at login. `sbar stop` on its own makes Homebrew start the service again.
