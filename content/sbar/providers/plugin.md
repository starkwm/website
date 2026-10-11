---
title: "Process plugin"
description: "Text and dynamic appearance streamed by an external process over newline-delimited JSON."
weight: 21
category: "Extensions"
cadence: "Process stream"
options: "`plugin` block"
---

## Output

Text with optional symbols, colours, and visibility, streamed by an external process as newline-delimited JSON. The executable runs directly with its arguments and inherits the bar's environment. There is no default execution timeout; plugins are long-running streams.

## Configuration

Use the item-level [`text` template](/sbar/configuration/text-templates/) to customise or hide the label.

Set these options inside `plugin`.

| Property | Default | Description |
| --- | --- | --- |
| `showSymbol` | `true` | Show a configured or returned symbol, including an item-level override. |
| `executable` | Required | Nonblank executable path; `${NAME}` and `~` expand here. Runs directly, without a shell wrapper. |
| `arguments` | `[]` | Literal argument strings; no shell, environment-variable, or `~` expansion. |
| `restart` | `true` | Restart after exit or invalid output, with an increasing delay. |
| `maxLength` | `4096` | Integer 1 to 4096; maximum displayed characters, including the truncation ellipsis. |
| `onError` | `show` | `show`, `keepLast`, or `hide`. |
| `symbols.font` | - | Shared installed font name for configured glyph symbols; each glyph can override it. |
| `symbols.size` | Resolved item/theme font size | Shared configured glyph size, 8 to 72 points; each glyph can override it. |
| `symbols.running` | Retained result symbol, if any | Symbol when a new process starts. |
| `symbols.success` | Result symbol, if supplied | Symbol after valid output. |
| `symbols.failure` | Retained result symbol, if any | Symbol after failure. |
| `tints.running` | Retained result tint, then normal tint | Colour when a new process starts. |
| `tints.success` | Result tint, then normal tint | Colour after valid output. |
| `tints.failure` | Retained result tint, then normal tint | Colour after failure. |

### Input protocol

Every new process receives this JSON line first on stdin:

```json
{ "version": 1, "event": "start" }
```

Plugins receive all runtime triggers, not just triggers matching their item ID. Check `event` and ignore unrelated events. Triggers have an optional `value`:

```json
{ "version": 1, "event": "refresh", "value": { "source": "manual" } }
```

The input queue holds up to 32 events. The bar drops new events when it is full. Each restart creates a new queue with `start` first. The bar discards queued events from the previous process. It also drops triggers while waiting to restart or after a one-shot process exits.

### Output protocol

Write one JSON object per line to stdout. End every message with a newline and flush after each update. The bar discards stderr.

```json
{
  "text": "3 updates",
  "symbol": "shippingbox.fill",
  "tint": "#FFCC00",
  "hidden": false
}
```

| Result field | Required | Meaning |
| --- | --- | --- |
| `text` | Yes | String displayed by the item. |
| `symbol` | No | SF Symbol name or complete font glyph object. |
| `tint` | No | `#RRGGBB` or `#RRGGBBAA` colour. |
| `hidden` | No | Boolean controlling result visibility. |

Each message replaces the previous result. Omitted optional fields reset their result-level values. A result glyph must include its own font, for example `{"glyph":"X","font":"Menlo","size":14}`. The bar collapses whitespace into a single line and truncates the text to `maxLength` with an ellipsis.

### Appearance and errors {#state-appearance-and-errors}

Symbol precedence is item-level `symbol`, configured state symbol, then result symbol. No symbol appears if none is supplied. Configured glyphs inherit `plugin.symbols.font` and optional `size`, with per-glyph overrides; see [font glyph symbols](/sbar/configuration/appearance/#font-glyph-symbols). SF Symbols use [`symbolFontWeight`](/sbar/configuration/appearance/#sf-symbol-weight). `showSymbol: false` hides every symbol source.

Configured state tints override the result tint, which otherwise overrides normal item/theme styling. Colours accept `#RRGGBB` or `#RRGGBBAA`.

| Error policy | Behaviour |
| --- | --- |
| `show` | Display the error. |
| `keepLast` | Retain the last successful result; show the error if there has been no success. |
| `hide` | Hide the item. |

A new process starts with running appearance and the previous successful result, or `…` if none exists. Valid output uses success appearance while the process continues running. `success` means a valid message arrived, not that the process exited. Launch, protocol, and nonzero-exit failures use failure appearance and the selected error policy. Retained results keep their symbol, tint, and hidden state, subject to state overrides. A clean one-shot exit retains its last result.

To change `plugin`, edit the configuration file. `sbar set` cannot change this block.

[Shared item options](/sbar/configuration/items/) cover styling, symbols, actions, priority, and enabled state.

### Text templates

The item-level `text` setting supports `id`, `value`, `symbol`, `status`, `error`. See [text templates](/sbar/configuration/text-templates/) for shared fields and syntax. `value` keeps the plugin's truncation and error policy. Templates cannot look up arbitrary JSON result fields. Streamed `text` is literal data, not a template.

`status` is `running`, `success`, or `failure`. Use [state conditions](/sbar/configuration/text-templates/#state-specific-labels) to choose a label for each state.

With `onError: "keepLast"`, a failure leaves the last successful result in `value`, while `status` is `failure` and `error` contains the new error. Without a previous result, `value` shows the error. Starting a new process or receiving valid output clears `error`.

For a visible failure indicator while retaining the last result, add this template to the focus timer item and set `plugin.onError` to `keepLast`:

```json
{
  "id": "focus",
  "type": "plugin",
  "text": "{{value}}{{#status=failure}} (timer unavailable){{/status}}",
  "plugin": {
    "executable": "~/.config/sbar/plugins/focus-timer.py",
    "onError": "keepLast"
  }
}
```

This could display `Focus 12:34 (timer unavailable)` after a failure. The retained countdown is stale until the restarted process sends a new result.

`maxLength` limits result text used by `value`, not the complete template. Added text and direct use of `error` can exceed that limit. Templates cannot reveal an item hidden by `onError: "hide"` or a result's `hidden: true`.

## Updates

Plugins stream updates regardless of the item refresh policy. The bar sends runtime triggers to running plugins, subject to the input queue limit. When output arrives faster than the bar can display it, the bar keeps only the latest result in its one-result buffer. See [refresh policies](/sbar/configuration/refresh/).

The delay between automatic restarts increases from one to 30 seconds. A run lasting at least 30 seconds that emitted valid output resets the delay to one second. On reload, the bar restarts a plugin only if its executable, arguments, or restart setting changed. Changes to `maxLength`, `onError`, symbols, tints, or item-level `text` change how the result appears without restarting the process.

Removing or disabling a plugin, or shutting down the bar, terminates its process group. Updates from an obsolete process cannot overwrite its replacement or failure state.

## Current limits

Each JSON line is limited to 64 KB excluding its terminating newline. This byte limit is separate from `maxLength`, which truncates displayed result characters. Malformed or oversized messages stop the process with an explicit error. Partial messages may arrive across multiple reads; an unfinished line fails when the stream ends. Trigger delivery follows the queue and restart rules above.

## Example

Run a focus timer that updates its countdown without starting a new process each second. This example requires Python 3 on the bar's `PATH`.

Save the following as `~/.config/sbar/plugins/focus-timer.py`, creating the `plugins` directory if needed:

```python
#!/usr/bin/env python3
import json
import math
import queue
import sys
import threading
import time

messages = queue.Queue()

def read_events():
    for line in sys.stdin:
        messages.put(json.loads(line))
    messages.put(None)

threading.Thread(target=read_events, daemon=True).start()
deadline = None
finished = False
previous = None

while True:
    remaining = max(0, math.ceil(deadline - time.monotonic())) if deadline else 0
    if deadline and remaining == 0:
        deadline = None
        finished = True
    if deadline:
        minutes, seconds = divmod(remaining, 60)
        result = {"text": f"Focus {minutes:02d}:{seconds:02d}", "symbol": "timer"}
    elif finished:
        result = {"text": "Take a break", "symbol": "checkmark.circle", "tint": "#66CC88"}
    else:
        result = {"text": "Focus ready", "symbol": "timer"}
    if result != previous:
        print(json.dumps(result), flush=True)
        previous = result
    try:
        message = messages.get(timeout=1)
    except queue.Empty:
        continue
    if message is None:
        break
    if message.get("version") != 1:
        continue
    if message.get("event") == "focus-start":
        value = message.get("value")
        seconds = value.get("seconds", 1500) if isinstance(value, dict) else 1500
        if type(seconds) is int and 1 <= seconds <= 86400:
            deadline = time.monotonic() + seconds
            finished = False
    elif message.get("event") == "focus-reset":
        deadline = None
        finished = False
```

Make the script executable:

```sh
chmod +x ~/.config/sbar/plugins/focus-timer.py
```

Add this item to your configuration:

```json
{
  "id": "focus",
  "type": "plugin",
  "plugin": {
    "executable": "~/.config/sbar/plugins/focus-timer.py"
  },
  "primaryAction": {
    "kind": "command",
    "value": "sbar trigger focus-start"
  },
  "secondaryAction": {
    "kind": "command",
    "value": "sbar trigger focus-reset"
  }
}
```

The item initially shows `Focus ready`. Click it to start or restart a 25-minute countdown. Its secondary action resets it from the context menu. At zero it shows `Take a break` in green. Starting or resetting removes the result's green tint because the next message omits `tint`.

The actions require `sbar` on the bar's `PATH`. You can also control the timer from a terminal:

```sh
sbar trigger focus-start
sbar trigger focus-start '{"seconds": 300}'
sbar trigger focus-reset
```

The optional duration is an integer from 1 to 86400 seconds; invalid durations are ignored. Pass `--socket <path>` to each command, including the item actions, when targeting a custom socket.

The script consumes stdin events, ignores unrelated triggers, and flushes each changed result as one JSON line. It uses a monotonic deadline so delayed updates do not accumulate timer drift. Restarting the plugin resets the timer; it does not persist sessions or send a notification when time runs out.
