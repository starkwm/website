---
title: "VPN"
description: "Names and connection states of VPN services registered with macOS."
weight: 10
category: "Connectivity"
cadence: "Native events"
options: "`vpn` block"
---

## Output

VPN service names and statuses, such as `Tailscale connected, Work connecting`, with a state-dependent icon. The default label sorts services by name and omits disconnected services. Here, active means any service that is not disconnected, including connecting, disconnecting, and unavailable services. With no active services, the item shows `VPN disconnected`. Omitting the `vpn` block is equivalent to `vpn: {}`.

Failed reads show `VPN unavailable`, or the affected service's name followed by `unavailable`. Known active names remain visible when another service cannot be read.

## Configuration

Use the item-level [`text` template](/sbar/configuration/text-templates/) to customise or hide the label.

Set these options inside `vpn`.

| Property | Default | Description |
| --- | --- | --- |
| `showSymbol` | `true` | Show the state icon; `false` hides even an item-level symbol override. |
| `hideWhenDisconnected` | `false` | Hide only a confirmed disconnected state. Failed reads remain visible. |
| `symbols.font` | - | Shared installed font name for glyph symbols; each glyph can override it. |
| `symbols.size` | Resolved item/theme font size | Shared glyph size, 8 to 72 points; each glyph can override it. |
| `symbols` state keys | Icons below | Override symbols for the five connection states. |
| `tints` state keys | Normal tint | State colours for the same five states; accept `#RRGGBB` or `#RRGGBBAA`. |

### States and labels {#connection-states}

`symbols` and `tints` accept these state keys:

| State key | Default symbol | Default label |
| --- | --- | --- |
| `connecting` | `arrow.triangle.2.circlepath` | `connecting` |
| `connected` | `lock.shield.fill` | `connected` |
| `disconnecting` | `arrow.triangle.2.circlepath` | `disconnecting` |
| `disconnected` | `lock.shield` | `disconnected` |
| `unavailable` | `exclamationmark.shield` | `unavailable` |

With multiple services, the overall icon, tint, and aggregate label use the first present state in this order: `unavailable`, `connected`, `connecting`, `disconnecting`, `disconnected`. Each visible service keeps its own status label.

Use a [`services` loop](#text-templates) with state conditions to customise each service label. Use `text: "VPN {{status}}"` for an aggregate label or `text: ""` for an icon alone. Accessibility retains the native names and statuses.

### Appearance {#symbols-and-colours}

Symbols accept SF Symbol names or [font glyph objects](/sbar/configuration/appearance/#font-glyph-symbols). Use [`symbolFontWeight`](/sbar/configuration/appearance/#sf-symbol-weight) to set SF Symbol weight independently of text.

An item-level `symbol` overrides the state icon. `showSymbol: false` hides all symbols, including this override. Omitted state symbols use the built-in defaults. State tints override the normal item/theme tint.

To change `vpn`, edit the configuration file. `sbar set` cannot change this block.

[Shared item options](/sbar/configuration/items/) cover styling, symbols, actions, priority, and enabled state.

### Text templates

The item-level `text` setting supports `id`, `value`, `symbol`, `status`, `names`, `connected`, `available`, `services`, `name`, `serviceId`, `index`, `total`, `first`, `last`, `separator`. See [text templates](/sbar/configuration/text-templates/) for syntax and collection rules.

`services` includes all monitored VPN services, including disconnected ones. Unavailable service lists are empty; stale entries are not rendered. The default `value` and `names` list active services only.

```json
{
  "id": "vpn",
  "type": "vpn",
  "text": "{{#services}}{{name}}: {{#status=connected}}Connected{{/status}}{{^status=connected}}{{status}}{{/status}}{{#separator}}, {{/separator}}{{/services}}{{^services}}{{value}}{{/services}}"
}
```

Entries sort by name, with their identifier breaking ties. The provider collapses whitespace in names to one line. Unnamed entries use `VPN`. The provider treats names as literal text, even if they contain template tags. `names` is sorted and comma-separated.

| Field | Meaning inside a loop |
| --- | --- |
| `name` | Service name |
| `status` | Individual service status |
| `connected` | Whether the entry is connected |
| `available` | VPN service status is not `unavailable` |
| `serviceId` | Provider identifier |
| `index` | One-based position in the sorted list |
| `first`, `last` | Position flags for the source list |
| `value` | Default entry label, such as `Work connected` |
| `total` | Collection count, also available outside the loop |
| `id` | The containing item ID |

Outside the loop, `status` follows the precedence in [States and labels](#connection-states), and `connected` is true only when that aggregate status is `connected`. An unavailable service takes precedence, so `connected` is false even if another service is connected.

Aggregate `available` means the service list was read successfully. It can be true while an individual service is unavailable. Inside a loop, `available` instead reports whether that service's status is not `unavailable`.

`value` outside the loop is the default combined label. Entry-only fields are empty outside the loop. Use an inverse collection section for an empty-list fallback.

Loops produce plain text with the item's overall symbol and tint. They preserve accessibility descriptions and hide rules. Loops use the same snapshot as other template fields and do not trigger extra scans or queries.

This shows connected VPN services, with commas only between visible names:

```json
{
  "id": "vpn",
  "type": "vpn",
  "text": "{{#connected}}{{#services}}{{#connected}}{{name}}{{/connected}}{{#separator}}, {{/separator}}{{/services}}{{/connected}}{{^connected}}{{value}}{{/connected}}"
}
```

If Home is disconnected and Office and Work are connected, the label is `Office, Work`. If Office disconnects, it becomes `Work`. If none are connected, the outer aggregate condition supplies the default label, such as `VPN disconnected`. It also preserves the default error label when an unavailable service takes precedence over connected services. A `{{^services}}` fallback would run only if the service list itself were empty.

## Updates

Items and displays share one native event monitor. The provider reads the service list when enabled, then follows SystemConfiguration service and connection notifications. Unavailable reads retry every two seconds.

Refresh policies capture service states, text, icon, tint, and visibility together. Interval and manual items hold their snapshot until refreshed or triggered. Triggers capture the latest shared state. See [refresh policies](/sbar/configuration/refresh/).

## Current limits

Detects enabled Network Extension, IPSec, and L2TP VPN services registered with macOS. The provider cannot detect standalone tunnels that do not register a macOS service. Templates can filter which services appear in the label, but the provider still monitors all detected services. There is no monitoring filter or built-in connect/disconnect control.

A connected state reports the service's status. It does not establish whether all traffic uses the VPN or whether the remote network is reachable. Use the [Network provider](/sbar/providers/network/) for the active network connection type.

## Example

```json
{
  "id": "vpn",
  "type": "vpn",
  "vpn": {
    "hideWhenDisconnected": true,
    "tints": {
      "connected": "#A6DA95",
      "connecting": "#EED49F",
      "unavailable": "#ED8796"
    }
  }
}
```

This hides the item only when all detected services are disconnected, including when no services are registered. Connecting, disconnecting, and unavailable states remain visible.
