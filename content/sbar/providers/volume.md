---
title: "Volume"
description: "Output volume and mute state, with automatic icons and optional state colours."
weight: 5
category: "System"
cadence: "Native events"
options: "`volume` block"
---

## Output

`Volume N%`, `Muted`, `Fixed volume`, or `No output`, with a state-dependent icon. Icons appear by default; omitting the `volume` block is equivalent to `volume: {}`.

## Configuration

Use the item-level [`text` template](/sbar/configuration/text-templates/) to customise or hide the label.

Set these options inside `volume`.

| Property | Default | Description |
| --- | --- | --- |
| `showSymbol` | `true` | Show the state icon; `false` gives text-only output. |
| `symbols.font` | - | Shared installed font name for glyph symbols; each glyph can override it. |
| `symbols.size` | Resolved item/theme font size | Shared glyph size, 8 to 72 points; each glyph can override it. |
| `symbols.levels` | Four speaker icons listed below | Exactly four symbols, ordered by volume level: 0%, 1 to 33%, 34 to 66%, and 67 to 100%. |
| `symbols.muted` | `speaker.slash.fill` | Muted output icon. |
| `symbols.fixed` | `speaker.wave.3.fill` | Output without a readable volume. |
| `symbols.unavailable` | `speaker.slash` | No available output. |
| `tints.muted` | Normal tint | Muted output colour. |
| `tints.fixed` | Normal tint | Fixed-volume output colour. |
| `tints.unavailable` | Normal tint | No-output colour. |

The default level symbols are `speaker.fill`, `speaker.wave.1.fill`, `speaker.wave.2.fill`, and `speaker.wave.3.fill`, in that order.

Zero volume and mute are separate states. No output takes precedence over mute; mute takes precedence over the volume level or fixed-volume state. Omitted state symbols use the built-in defaults.

Symbols accept SF Symbol names or [font glyph objects](/sbar/configuration/appearance/#font-glyph-symbols). Use [`symbolFontWeight`](/sbar/configuration/appearance/#sf-symbol-weight) to set SF Symbol weight independently of text.

An item-level `symbol` overrides the automatic icon; `showSymbol: false` hides it regardless. State colours override the normal item/theme tint and accept `#RRGGBB` or `#RRGGBBAA`. Icon-only items retain their accessibility label. Change the `volume` block in the configuration file; it cannot be changed with `sbar set`.

[Shared item options](/sbar/configuration/items/) cover styling, symbols, actions, priority, and enabled state.

### Text templates

The item-level `text` setting supports `id`, `value`, `symbol`, `percentage`, `muted`, `available`, `status`. See [text templates](/sbar/configuration/text-templates/) for shared fields and syntax. A fixed-volume output can be `available` while `percentage` is missing. Test `percentage` before adding a percent sign, or use `{{value}}` for its default status text.

`status` is `available`, `muted`, `fixed`, or `unavailable`. Use [state conditions](/sbar/configuration/text-templates/#state-specific-labels) to choose a label for each state.

Zero volume is still `available`. The `percentage` field contains a whole number without `%`; the provider scales the volume to 0 through 100 and truncates the fractional part.

Use a status condition to display the percentage while retaining mute, fixed-volume, and no-output labels:

```json
{
  "id": "volume",
  "type": "volume",
  "text": "{{#status=available}}{{percentage}}%{{/status}}{{^status=available}}{{value}}{{/status}}"
}
```

This displays `0%` for an unmuted zero-volume reading, and keeps `Muted`, `Fixed volume`, or `No output` for the other states. Testing `percentage` alone would also match a muted output with a readable volume.

## Updates

The provider reads the default output device when enabled, then follows native output-device, volume, and mute events. It reads the main output volume first. If that is unreadable, it averages the readable left and right channel volumes, or uses the single readable channel. Text, icon, and tint follow the item's refresh policy together. See [refresh policies](/sbar/configuration/refresh/) for snapshot and trigger behaviour.

## Current limits

Uses the default output device. No input-volume selector or built-in slider. Outputs without a readable volume display `Fixed volume` instead of an estimated percentage.

Use the [Audio devices provider](/sbar/providers/audiodevice/) to show the default output or input device name.

## Example

```json
{
  "id": "volume",
  "type": "volume",
  "volume": {
    "tints": {
      "muted": "#FF6655"
    }
  },
  "text": ""
}
```

This icon-only example uses the default level and mute symbols and adds a muted colour. Remove `text: ""` to show text alongside the icon.
