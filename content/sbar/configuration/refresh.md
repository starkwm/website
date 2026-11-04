---
title: "Refresh"
description: "Set refresh intervals, trigger updates, and keep readings across reloads."
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

To trigger items, reload the configuration, or stop the bar, see the [command line](/sbar/cli/) reference.
