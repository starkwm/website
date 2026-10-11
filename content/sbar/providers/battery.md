---
title: "Battery"
description: "Battery percentage and charging state, with an AC power fallback."
weight: 4
category: "System"
cadence: "Native events"
options: "`battery` block"
---

## Output

Battery percentage with an icon for the charge level or power state. When no power source has readable capacity data, the provider shows `AC power` and a plug icon. This includes Macs without a battery. Omitting the `battery` block is equivalent to `battery: {}`.

## Configuration

Use the item-level [`text` template](/sbar/configuration/text-templates/) to customise or hide the label.

Set these options inside `battery`. Use `showSymbol: false` for text-only output or top-level `text: ""` for an icon-only item.

| Property | Default | Description |
| --- | --- | --- |
| `showSymbol` | `true` | Show the state icon, including an item-level symbol override. |
| `lowThreshold` | `20` | Apply `tints.low` at or below this percentage while on battery power. Integer 0 to 100, inclusive. |
| `symbols.font` | - | Shared installed font name for glyph symbols; each glyph can override it. |
| `symbols.size` | Resolved item/theme font size | Shared glyph size, 8 to 72 points; each glyph can override it. |
| `symbols.levels` | Five system battery icons | Exactly five symbols for 0, 25, 50, 75, 100%; nearest 25% step. |
| `symbols.chargingLevels` | Unset | Exactly five charging symbols for 0, 25, 50, 75, 100%; nearest 25% step. Takes precedence over `symbols.charging`. |
| `symbols.charging` | `battery.100percent.bolt` | Charging icon when `symbols.chargingLevels` is omitted or `null`. |
| `symbols.pluggedIn` | `powerplug` | AC power without charging icon. |
| `tints.low` | Normal tint | At or below threshold while on battery. |
| `tints.charging` | Normal tint | Charging colour. |
| `tints.pluggedIn` | Normal tint | AC power without charging colour. |

An item-level `symbol` overrides the battery-level, charging, and plug icons. `showSymbol: false` hides that override too.

Symbols accept SF Symbol names or [font glyph objects](/sbar/configuration/appearance/#font-glyph-symbols). Use [`symbolFontWeight`](/sbar/configuration/appearance/#sf-symbol-weight) to set SF Symbol weight independently of text.

Set `symbols.chargingLevels` to show the charge level while charging. Its entries inherit `symbols.font` and `symbols.size`, with per-glyph overrides. Omit it or use `null` to keep the single charging icon.

[Shared item options](/sbar/configuration/items/) cover styling, symbols, actions, priority, and enabled state.

### Text templates

The item-level `text` setting supports `id`, `value`, `symbol`, `percentage`, `charging`, `pluggedIn`, `available`, `status`. See [text templates](/sbar/configuration/text-templates/) for shared fields and syntax. Templates retain state colours and native accessibility descriptions. Templates without `{{symbol}}` retain the normal icon behaviour. If a template contains the tag, the icon appears only when a branch containing it renders; `showSymbol: false` still hides it.

`status` is `charging`, `pluggedIn`, `onBattery`, or `noBattery`. Use [state conditions](/sbar/configuration/text-templates/#state-specific-labels) to choose a label for each state.

`noBattery` means no percentage reading, matching the `AC power` fallback. Otherwise charging takes precedence over plugged-in power, then battery power. `percentage` is a whole number without `%`, calculated using integer division and clamped to 0 through 100. `available` is true when a percentage reading exists, including zero.

Use `available` to show a custom percentage label while keeping the default fallback when no reading exists:

```json
{
  "id": "battery",
  "type": "battery",
  "text": "{{#available}}Battery {{percentage}}%{{/available}}{{^available}}{{value}}{{/available}}"
}
```

This displays `Battery 75%` for a 75% reading and `AC power` when no capacity is available. It retains the normal state icon.

## Updates

The provider reads the power sources when enabled, then follows native power-source events. See [refresh policies](/sbar/configuration/refresh/) for snapshot and trigger behaviour.

## Current limits

The provider uses the first power source with readable capacity data. There is no power-source selector or time-remaining estimate.

## Example

Show the charge level while charging, with a green tint to indicate charging and a red tint for low battery:

```json
{
  "id": "battery",
  "type": "battery",
  "battery": {
    "lowThreshold": 20,
    "symbols": {
      "chargingLevels": [
        "battery.0percent",
        "battery.25percent",
        "battery.50percent",
        "battery.75percent",
        "battery.100percent"
      ]
    },
    "tints": {
      "low": "#FF6655",
      "charging": "#66CC88"
    }
  }
}
```
