---
title: "Network"
description: "Wi-Fi, Connected, or Offline based on the current network path."
weight: 8
category: Connectivity
cadence: "Native events"
options: "`network` block"
---

## Output

`Wi-Fi`, `Connected`, or `Offline` based on the current network path, with a state-dependent icon. Omitting the `network` block is equivalent to `network: {}`. Use an interface filter for Wi-Fi or another connection type.

## Configuration

Use the item-level [`text` template](/sbar/configuration/text-templates/) to customise or hide the label.

Set these options inside `network`.

| Property | Default | Description |
| --- | --- | --- |
| `showSymbol` | `true` | Show the state icon; `false` hides even an item-level symbol override. |
| `hideWhenDisconnected` | `false` | Hide the item in its offline state, including when an interface filter does not match. |
| `interface` | - | Follow the active connection, or filter by `wifi`, `ethernet`, `cellular`, or `other`. |
| `symbols.font` | - | Shared installed font name for glyph symbols; each glyph can override it. |
| `symbols.size` | Resolved item/theme font size | Shared glyph size, 8 to 72 points; each glyph can override it. |
| `symbols` state keys | Icons below | Override symbols for `wifi`, `ethernet`, `cellular`, `other`, or `offline`. |
| `tints` state keys | Normal tint | State colours for the same five states; accept `#RRGGBB` or `#RRGGBBAA`. |

### States and labels {#connection-symbols}

Without an interface filter, these are the default symbols and labels:

| State key | Default symbol | Default label |
| --- | --- | --- |
| `wifi` | `wifi` | `Wi-Fi` |
| `ethernet` | `cable.connector` | `Connected` |
| `cellular` | `antenna.radiowaves.left.and.right` | `Connected` |
| `other` | `network` | `Connected` |
| `offline` | `network.slash` | `Offline` |

```json
{
  "id": "network",
  "type": "network",
  "network": {
    "symbols": {
      "ethernet": { "glyph": "E", "font": "Menlo", "size": 16 }
    }
  }
}
```

This uses an `E` glyph for Ethernet and keeps the default icons for other states.

Symbols accept SF Symbol names or [font glyph objects](/sbar/configuration/appearance/#font-glyph-symbols). Use [`symbolFontWeight`](/sbar/configuration/appearance/#sf-symbol-weight) to set SF Symbol weight independently of text.

An item-level `symbol` overrides the state icon. `showSymbol: false` hides all symbols, including this override. Omitted state symbols use the built-in defaults. State tints override the normal item/theme tint. Text templates retain the default accessibility label.

### Interface filtering

To monitor Wi-Fi specifically:

```json
{
  "id": "wifi",
  "type": "network",
  "network": {
    "hideWhenDisconnected": true,
    "interface": "wifi",
    "tints": {
      "wifi": "#66CC88"
    }
  },
  "text": ""
}
```

An unsatisfied path is `offline`. For a satisfied path, Wi-Fi takes precedence over Ethernet, then cellular, then other when macOS reports multiple interface types. Filtering applies to that classified active path, not every connected adapter. The filtered item reports `offline` when its filter does not match.

Wi-Fi filtering defaults to `Wi-Fi connected` / `Wi-Fi disconnected` and `wifi` / `wifi.slash`. Other filters use labels such as `Ethernet connected` / `Ethernet disconnected` and the normal state icons. Override filtered labels with top-level `text` conditions and colours with the selected interface key and `offline`. `hideWhenDisconnected: true` hides the entire offline item.

### Runtime changes

To change the item-level fixed `symbol` temporarily:

```sh
sbar set network symbol '"network"'
sbar set network symbol null
```

Clearing the override restores the state icon, unless `network.showSymbol` is false. Replace `network` with the item's ID. To change `network`, edit the configuration file. `sbar set` cannot change this block.

[Shared item options](/sbar/configuration/items/) cover styling, symbols, actions, priority, and enabled state.

### Text templates

The item-level `text` setting supports `id`, `value`, `symbol`, `status`, `connected`. See [text templates](/sbar/configuration/text-templates/) for shared fields and syntax. `status` and `connected` respect the configured interface filter. `connected` is true when the filtered path is not `offline`. `value` contains the default label, including labels such as `Wi-Fi disconnected` when a filter is set.

Use a [state condition](/sbar/configuration/text-templates/#state-specific-labels) to customise a connection label while preserving the defaults for other states:

```json
{
  "id": "network",
  "type": "network",
  "text": "{{#status=ethernet}}Wired{{/status}}{{^status=ethernet}}{{value}}{{/status}}"
}
```

This displays `Wired` for Ethernet and retains labels such as `Wi-Fi` and `Offline` otherwise. The item keeps its state icon and default accessibility label. Provider hide rules still apply to custom text.

## Updates

The provider follows native network-path events. Refresh policies capture the connection state, label, symbol, tint, and visibility together. Interval and manual policies hold that snapshot until the next refresh or trigger, including when the interface changes but its default text remains `Connected`. See [refresh policies](/sbar/configuration/refresh/).

## Current limits

The provider does not identify VPNs. Use the [VPN provider](/sbar/providers/vpn/) for registered VPN service names and connection states.

The provider does not report radio power, association, address, SSID, or signal strength. A satisfied path is not an internet reachability test.

## Example

```json
{
  "id": "network",
  "type": "network",
  "network": {
    "tints": {
      "offline": "#FF6655"
    }
  },
  "text": ""
}
```

This icon-only example uses the default connection symbols and retains the connection label for accessibility. Remove `text: ""` to show text alongside the icon.
