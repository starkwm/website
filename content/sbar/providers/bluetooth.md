---
title: "Bluetooth"
description: "Bluetooth power state, connected device names, and access status."
weight: 11
category: "Connectivity"
cadence: "Native events"
options: "`bluetooth` block"
---

## Output

Connected device names and status, such as `Keyboard connected, Mouse connected`, sorted by name, with a state-dependent icon. With no connected devices, the item shows `Bluetooth on` or `Bluetooth off`. Omitting the `bluetooth` block is equivalent to `bluetooth: {}`.

Denied or restricted access shows `Bluetooth access denied`. Missing hardware, read failures, or a resetting controller show `Bluetooth unavailable`. Device names are omitted when Bluetooth is off or inaccessible. Missing or blank names fall back to `Unnamed device`.

## Configuration

Use the item-level [`text` template](/sbar/configuration/text-templates/) to customise or hide the label.

Set these options inside `bluetooth`.

| Property | Default | Description |
| --- | --- | --- |
| `showSymbol` | `true` | Show the state icon; `false` hides even an item-level symbol override. |
| `hideWhenDisconnected` | `false` | Hide the `on` and `off` states. Access-denied and unavailable states remain visible. |
| `symbols.font` | - | Shared installed font name for glyph symbols; each glyph can override it. |
| `symbols.size` | Resolved item/theme font size | Shared glyph size, 8 to 72 points; each glyph can override it. |
| `symbols` state keys | Icons below | Override symbols for the five states. |
| `tints` state keys | Normal tint | State colours for the same five states; accept `#RRGGBB` or `#RRGGBBAA`. |

### States and labels {#power-connection-and-access-states}

`symbols` and `tints` accept these state keys:

| State key | Default symbol | Default label |
| --- | --- | --- |
| `on` | `antenna.radiowaves.left.and.right` | `on` |
| `off` | `antenna.radiowaves.left.and.right.slash` | `off` |
| `connected` | `antenna.radiowaves.left.and.right` | `connected` |
| `unauthorized` | `exclamationmark.triangle` | `access denied` |
| `unavailable` | `exclamationmark.triangle` | `unavailable` |

The `on` state means Bluetooth is powered on with no connected devices reported by the provider. With at least one connected device, the state is `connected`. Denied or restricted access takes precedence over the power state.

### Appearance {#symbols-and-colours}

Symbols accept SF Symbol names or [font glyph objects](/sbar/configuration/appearance/#font-glyph-symbols). Use [`symbolFontWeight`](/sbar/configuration/appearance/#sf-symbol-weight) to set SF Symbol weight independently of text.

An item-level `symbol` overrides the state icon. `showSymbol: false` hides all symbols, including this override. Omitted state symbols use the built-in defaults. State tints override the normal item/theme tint.

To change `bluetooth`, edit the configuration file. `sbar set` cannot change this block.

### Permissions {#bluetooth-access}

Monitoring starts only when a Bluetooth item is active. macOS may request Bluetooth access at that point. If access is denied, allow it in System Settings > Privacy & Security > Bluetooth and restart `sbar`.

The executable embeds the required usage description. Custom app bundles must also include `NSBluetoothAlwaysUsageDescription` in their `Info.plist`. A missing or blank usage description prevents monitoring from starting and leaves the provider unavailable.

[Shared item options](/sbar/configuration/items/) cover styling, symbols, actions, priority, and enabled state.

### Text templates

The item-level `text` setting supports `id`, `value`, `symbol`, `status`, `names`, `count`, `connected`, `devices`, `name`, `deviceId`, `index`, `total`, `first`, `last`, `separator`. See [text templates](/sbar/configuration/text-templates/) for syntax and collection rules.

`devices` includes connected Bluetooth devices only. It is empty when Bluetooth is off, access is denied, or the provider is unavailable. `names` lists connected devices and `count` is their count. `total` is the number of entries in `devices`; both counts are zero when the list is empty. Bluetooth does not expose `available`.

```json
{
  "id": "bluetooth",
  "type": "bluetooth",
  "text": "{{#devices}}{{name}} linked{{#separator}}, {{/separator}}{{/devices}}{{^devices}}{{value}}{{/devices}}"
}
```

With Keyboard and Mouse connected, the example displays `Keyboard linked, Mouse linked`. If Keyboard disconnects, it displays `Mouse linked`. With no connected devices, the inverse section preserves the default label, such as `Bluetooth on`, `Bluetooth off`, or `Bluetooth access denied`.

Entries sort by name, with their identifier breaking ties. The provider collapses whitespace in names to one line. Unnamed entries use `Unnamed device`. The provider treats names as literal text, even if they contain template tags. `names` is sorted and comma-separated.

| Field | Meaning inside a loop |
| --- | --- |
| `name` | Device name |
| `status` | `connected` |
| `connected` | Always `true`; the loop contains connected devices only |
| `deviceId` | Provider identifier |
| `index` | One-based position in the sorted list |
| `first`, `last` | Position flags for the source list |
| `value` | Default entry label, such as `Keyboard connected` |
| `total` | Collection count, also available outside the loop |
| `id` | The containing item ID |

Outside the loop, `status` describes the overall Bluetooth state. `connected` is true only when that state is `connected`, meaning at least one connected device was reported. `value` is the default combined label. Entry-only fields are empty outside the loop. Counts describe the source list and do not change when template conditions hide entries.

Loops produce plain text with the item's overall symbol and tint. They preserve accessibility descriptions and hide rules. Loops use the same snapshot as other template fields and do not trigger extra scans or queries.

Use `text: "Bluetooth {{status}}"` for an aggregate label or `text: ""` for an icon alone. The raw `status` value `unauthorized` differs from the default label `Bluetooth access denied`; use `value` to retain that wording. Accessibility retains the native names and statuses.

## Updates

Items and displays share one native event monitor. Core Bluetooth supplies power and access state. IOBluetooth supplies connected device names and connection notifications. Unavailable reads retry every two seconds.

The provider waits for the initial permission and power state before capturing refresh snapshots. Event items follow device and power changes. Interval and manual items hold their snapshot until refreshed or triggered. Snapshots retain device names, status, text, icon, tint, and visibility together. Triggers capture the latest shared state. See [refresh policies](/sbar/configuration/refresh/).

## Current limits

Device coverage comes from IOBluetooth's paired-device list and new connections observed while the provider is running. Only connected devices are listed. Devices exposed only through Bluetooth Low Energy services may be absent.

The provider does not scan, pair, connect, disconnect, or change Bluetooth power. Templates can filter which device entries appear in the label, but do not change which devices the provider monitors. There is no monitoring filter, and device battery levels are not included.

## Example

```json
{
  "id": "bluetooth",
  "type": "bluetooth",
  "bluetooth": {
    "hideWhenDisconnected": true,
    "tints": {
      "connected": "#8AADF4",
      "unauthorized": "#ED8796"
    }
  }
}
```

This hides the item when Bluetooth is off or on with no connected devices. Connected, access-denied, and unavailable states remain visible.
