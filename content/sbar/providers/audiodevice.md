---
title: "Audio devices"
description: "The default audio output or input device name, with device and error states."
weight: 6
category: "System"
cadence: "Native events"
options: "`audioDevice` block"
---

## Output

An `audioDevice` item shows the default output device name, such as `Studio Display Speakers`, with a speaker icon. Set `audioDevice.device` to `input` to show the default input device, such as `USB Microphone`, with a microphone icon. Omitting the `audioDevice` block is equivalent to `audioDevice: {}`.

A missing device shows `No output` or `No input`. Failed reads show `Output unavailable` or `Input unavailable`. Blank names fall back to `Unnamed device`.

## Configuration

Use the item-level [`text` template](/sbar/configuration/text-templates/) to customise or hide the label.

Set these options inside `audioDevice`.

| Property | Default | Description |
| --- | --- | --- |
| `device` | `output` | Follow the default `output` or `input` device. |
| `showSymbol` | `true` | Show the state icon; `false` hides even an item-level symbol override. |
| `hideWhenDisconnected` | `false` | Hide a missing device. Failed reads remain visible. |
| `symbols.font` | - | Shared installed font name for glyph symbols; each glyph can override it. |
| `symbols.size` | Resolved item/theme font size | Shared glyph size, 8 to 72 points; each glyph can override it. |
| `symbols.output` | `speaker.wave.2.fill` | Available output device icon. |
| `symbols.input` | `mic.fill` | Available input device icon. |
| `symbols.disconnected` | `speaker.slash` for output, `mic.slash` for input | Missing device icon for the selected direction. |
| `symbols.unavailable` | `exclamationmark.triangle` | Failed device read icon. |
| `tints` state keys | Normal tint | Colours for `available`, `disconnected`, or `unavailable`; accept `#RRGGBB` or `#RRGGBBAA`. |

### States and labels {#device-states-and-labels}

`tints` accepts these state keys; the default labels are shown alongside them:

| State key | Default output label | Default input label |
| --- | --- | --- |
| `available` | Output device name | Input device name |
| `disconnected` | `No output` | `No input` |
| `unavailable` | `Output unavailable` | `Input unavailable` |

A device is `disconnected` when macOS reports no default device or reports that the device is no longer alive. A failed read or notification subscription produces `unavailable`. A failed input device read does not suppress a readable output device, and vice versa.

Accessibility retains the device name and direction, such as `Input: USB Microphone`, even with a custom label or `text: ""`. Missing and unavailable states retain their default accessibility labels.

### Appearance {#symbols-and-colours}

Omitted state symbols use the built-in defaults.

Symbols accept SF Symbol names or [font glyph objects](/sbar/configuration/appearance/#font-glyph-symbols). Use [`symbolFontWeight`](/sbar/configuration/appearance/#sf-symbol-weight) to set SF Symbol weight independently of text.

An item-level `symbol` overrides the state icon. `showSymbol: false` hides all symbols, including this override. State tints override the normal item/theme tint.

To change `audioDevice`, edit the configuration file. `sbar set` cannot change this block.

[Shared item options](/sbar/configuration/items/) cover styling, symbols, actions, priority, and enabled state.

### Text templates

The item-level `text` setting supports `id`, `value`, `symbol`, `name`, `status`, `available`. See [text templates](/sbar/configuration/text-templates/) for shared fields and syntax. Fields follow the selected input or output endpoint.

`name` contains the reported device name, or an empty string when none is available. `value` contains the formatted label. The provider collapses whitespace in names, uses `Unnamed device` for a blank name, and supplies the missing-device or read-error label. `available` is true only for a readable device. The `status` values match the [device states above](#device-states-and-labels).

Use a [state condition](/sbar/configuration/text-templates/#state-specific-labels) to add a prefix while preserving device names and error labels:

```json
{
  "id": "microphone",
  "type": "audioDevice",
  "audioDevice": { "device": "input" },
  "text": "{{#status=available}}Mic: {{value}}{{/status}}{{^status=available}}{{value}}{{/status}}"
}
```

This displays `Mic: USB Microphone` for that device, `Mic: Unnamed device` for a blank name, and `No input` or `Input unavailable` for the other states. Use `{{name}}` when you need the reported name without the formatting or fallback. Provider hide rules still apply to custom text.

## Updates

Items and displays share one native event monitor. Monitoring starts when an audio device item becomes active and reads both default devices immediately. Core Audio notifications track default device changes, renames, device removal, and audio service restarts. Unavailable reads retry every two seconds.

Event items follow changes to their selected device. Interval and manual items hold a snapshot until refreshed or triggered. Snapshots retain input and output device state, text, icon, tint, and visibility together. Triggers capture the latest shared state. See [refresh policies](/sbar/configuration/refresh/).

## Current limits

The provider follows the macOS default input and normal output. Applications can choose different devices, and macOS has a separate output for alerts. There is no device list, selector for a named device, or built-in switching control.

Reading device names does not record audio or change audio settings. Use the [Volume provider](/sbar/providers/volume/) for output volume and mute state.

## Example

Use two items to show the default output and input together:

```json
{
  "schemaVersion": 1,
  "bar": {},
  "items": {
    "right": [
      { "id": "speakers", "type": "audioDevice" },
      {
        "id": "microphone",
        "type": "audioDevice",
        "audioDevice": {
          "device": "input",
          "hideWhenDisconnected": true,
          "tints": { "unavailable": "#ED8796" }
        }
      }
    ]
  }
}
```

The microphone item hides when there is no default input device. Read errors remain visible, with the configured colour. The output item uses the default settings.
