---
title: "Refresh and runtime"
description: "Set refresh intervals, trigger updates, and control the running bar."
weight: 5
---

Set `refresh.mode` to `event`, `interval`, or `manual`. Interval mode also requires `seconds`, from 1 to 86,400. Add an optional `event` name to refresh the item with `sbar trigger <event>`. You can also trigger an item by its ID.

For example, hold a CPU reading until the `system-status` event or the item's ID is triggered:

```json
{
  "id": "cpu",
  "type": "cpu",
  "refresh": { "mode": "manual", "event": "system-status" }
}
```

```sh
sbar trigger system-status
```

Use `"refresh": { "mode": "interval", "seconds": 30 }` to update the displayed reading every 30 seconds instead. Manual items capture an initial provider value; they do not start empty while waiting for a trigger.

## Sampling versus display refresh

Without `refresh`, native items follow their shared provider. An explicit event policy follows changes too. Interval and manual policies keep a snapshot for each item. They do not change how often the provider samples data. Native metrics still sample every two seconds.

A trigger normally captures the latest shared value without querying the hardware again. AeroSpace and Yabai items with manual or event refresh request a fresh query and capture its completed snapshot. Interval refresh uses the latest polled state. Date and time snapshots capture the current time.

[Mail](/sbar/providers/mail/#updates) queries Apple Mail when enabled, then waits the shortest `mail.pollInterval` among enabled Mail items after each completed read. Omitted intervals count as 30 seconds; the minimum is 5 seconds. Changing the shared interval on reload starts an immediate query. Item refresh settings control snapshots independently of this polling schedule.

[Weather](/sbar/providers/weather/#updates) fetches each configured location immediately, then waits the shortest `weather.pollInterval` among enabled items at that location after each request finishes. The default is 15 minutes. Item refresh settings control snapshots independently of network polling.

Commands run at startup even in manual mode. An interval reruns the command after the previous execution finishes and the interval elapses. The bar combines matching triggers received within 50 milliseconds. These replace any running command and restart its interval schedule.

Plugins stream updates at their own rate, regardless of the item refresh policy. The bar queues up to 32 triggers per plugin. It drops new triggers when the queue is full, while waiting to restart, or after a one-shot process exits. Each new process receives a new queue with `start` first.

Providers and commands pause during sleep and restart after wake.

## Configuration reloads

Adding or removing an unrelated provider keeps existing native providers running. Their playback state, metric history, and sampling baselines remain available. For example, adding a clock does not reset an existing media item to `Waiting for playback`.

Native refresh snapshots and interval timing survive a reload when the item's `id`, `type`, `refresh` settings, disk path, and weather coordinates are unchanged. Styling edits, text-template edits, weather unit changes, and changes to other items do not refresh a held reading. Templates render fields from that same snapshot. A new item or a change to its type, refresh policy, disk path, or weather coordinates captures a new snapshot for that item. Removing its refresh policy returns it to live provider updates.

These rules apply to configuration reloads, not a process restart. Restarting the bar starts providers and captures initial values again.

## Runtime commands

### Start the bar

Run `sbar` or `sbar start` to start the bar. By default, sbar uses `~/.config/sbar/config.jsonc` when it exists, then `~/.config/sbar/config.json`. Both commands accept `--config <path>` for another configuration file. The process keeps running until you stop it.

Client commands connect to `~/.config/sbar/control.sock` by default. A bar started with `--config` creates `control.sock` beside that file. Pass `--socket <path>` after the client subcommand to target that bar:

```sh
sbar start --config /path/to/config.jsonc
```

In another terminal:

```sh
sbar query --socket /path/to/control.sock
sbar stop --socket /path/to/control.sock
```

Only one instance can own a given socket, and clients must run as the same user. A custom configuration filename in the same directory still uses the same socket. If a client reports `Cannot connect to sbar`, check that the bar is running and that `--socket` points to its configuration directory.

Run `sbar --help` or `sbar <command> --help` for help. Client commands and validation return a nonzero exit status on failure.

### Validate configuration

```sh
sbar validate
sbar validate --config /path/to/config.jsonc
```

Validation works without a running bar. It reads the default file unless you pass `--config`, reports invalid or missing files, and never writes to the file. See [configuration](/sbar/configuration/) for the required fields.

### Query state

```sh
sbar query [--diagnostics | --displays] [--socket <path>]
```

`query` returns the running configuration as JSON. `--diagnostics` returns the configuration path, current configuration error, last action error, and up to 100 recent runtime events. `--displays` returns connected display IDs, names, and whether each is primary. Use only one of these flags at a time.

### Reload configuration

```sh
sbar reload [--socket <path>]
```

Reload the file immediately. Invalid configuration returns an error and retains the last valid configuration.

### Update items

```sh
sbar set <item-id> <property> <value> [--socket <path>]
```

sbar reads values as JSON when possible and as strings otherwise. For example:

```sh
sbar set clock enabled false
sbar set clock style '{"tint":"#88C0D0"}'
```

`set` changes in-memory configuration only. Supported properties are `symbol`, `enabled`, `priority`, `format`, `dateStyle`, `timeStyle`, `style`, and `popup`. Edit the configuration file to make changes persistent. A successful reload or restart discards these temporary changes.

Setting `style` replaces the item's whole style object. Omitted fields then inherit from the theme. Use `sbar set clock style null` to clear all item style overrides. `text`, `symbolPosition`, provider blocks, actions, children, and refresh settings require a configuration-file edit.

### Trigger events

```sh
sbar trigger <event> [<json>] [--socket <path>]
sbar trigger refresh '{"source":"manual"}'
```

Matching item IDs or refresh event names update native snapshots or rerun command items. The bar sends triggers to running plugins, subject to their [input queue and restart rules](/sbar/providers/plugin/#input-protocol). The optional payload must be valid JSON and is included in runtime events and plugin input.

### Subscribe to events

```sh
sbar subscribe [--socket <path>]
```

`subscribe` streams JSON lines for configuration changes, provider values, and triggers until interrupted. The bar disconnects subscribers that cannot keep up.

### Stop the bar

For a Homebrew service, use `brew services stop sbar` to stop it and disable startup at login. `sbar stop` alone causes Homebrew to restart the service. The command below stops a foreground instance.

```sh
sbar stop [--socket <path>]
```

`stop` acknowledges the request, then shuts down the bar, stops providers and child processes, closes panels, and removes the control socket. Use `--socket` to target an instance started with a custom configuration directory.
