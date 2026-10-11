---
title: "Mail"
description: "Apple Mail's combined inbox unread count."
weight: 7
category: "Connectivity"
cadence: "Configurable polling"
options: "`mail` block"
---

## Output

The unread count for Apple Mail's combined inbox, such as `3 unread`. An inbox with no unread messages displays `0 unread`; the item remains visible.

| State | Text | Default symbol |
| --- | --- | --- |
| Unread messages | `3 unread` | `envelope.badge` |
| No unread messages | `0 unread` | `envelope` |
| Mail is not running | `Mail closed` | `envelope` |
| Automation access denied | `Mail permission denied` | `envelope` |
| Read failure or timeout | `Mail unavailable` | `envelope` |

Failed reads never become a zero unread count. Successful readings include `Inbox` in the accessibility label, for example `Inbox, 3 unread`.

## Configuration

Use the item-level [`text` template](/sbar/configuration/text-templates/) to customise or hide the label.

All fields below are inside `mail`. Omitting the block or using `mail: {}` selects the default interval.

| Property | Default | Description |
| --- | --- | --- |
| `pollInterval` | `30` | Seconds to wait after each completed query. A finite number of at least 5; fractional seconds are accepted. |

The `mail` block is valid only on Mail items. Edit it in the configuration file; `sbar set` cannot change it. Use [shared item options](/sbar/configuration/items/) for styling, actions, visibility, and refresh policies.

An item-level `symbol` overrides both envelope symbols. It accepts an SF Symbol name or a [font glyph object](/sbar/configuration/appearance/#font-glyph-symbols). Set `symbolPosition` to `right` to place it after the count; the default is `left`. Use `style.tint` for a fixed colour and `style.minWidth` to [reserve space](/sbar/configuration/appearance/#item-widths) for changing counts.

### Permissions {#automation-permission}

Mail must already be running. When macOS requests permission to automate Mail, allow access in System Settings > Privacy & Security > Automation. Depending on how you launch sbar, macOS may attribute the request to the launching application. Check permission using the same launch method as your normal bar.

The sbar executable includes an Apple Events usage description. Custom builds must retain `NSAppleEventsUsageDescription`; without it, the provider reports `Mail unavailable`. Hardened-runtime builds also need the `com.apple.security.automation.apple-events` entitlement.

### Text templates

The item-level `text` setting supports `id`, `value`, `symbol`, `unreadCount`, `status`, `available`. See [text templates](/sbar/configuration/text-templates/) for shared fields and syntax. `unreadCount` contains the count only after a successful reading and is empty in other states. Zero counts as present in sections; it does not trigger an inverse `unreadCount` section. `available` distinguishes a successful reading from closed, permission-denied, and unavailable states.

`status` is `available`, `closed`, `unauthorized`, or `unavailable`. Use [state conditions](/sbar/configuration/text-templates/#state-specific-labels) to choose a label for each state.

Use an `available` section to add a count label, with `value` as the fallback:

```json
{
  "id": "mail",
  "type": "mail",
  "text": "{{#available}}Inbox: {{unreadCount}}{{/available}}{{^available}}{{value}}{{/available}}"
}
```

This displays `Inbox: 3` for three unread messages and `Inbox: 0` for none. It keeps `Mail closed`, `Mail permission denied`, and `Mail unavailable` for the other states.

There is no `showSymbol` option, but a conditional `{{symbol}}` tag can control the icon. For example, this shows it only when a count is available:

```json
{
  "id": "mail",
  "type": "mail",
  "text": "{{#available}}{{symbol}}{{/available}}{{value}}"
}
```

Without a symbol tag, templates retain the normal envelope icon. An empty `text` hides only the label; it does not hide the item.

## Updates

The provider queries Mail immediately when enabled, then waits `mail.pollInterval` seconds after each completed read before querying again. The default is 30 seconds. Failed reads retry on the same schedule. Apple Events run off the main thread with a ten-second timeout.

Monitoring is shared across items and displays. The shortest interval among enabled Mail items controls polling. An omitted interval counts as 30 seconds; disabled items do not contribute. For example, items requesting 60 and 10 seconds share a ten-second poll. An item requesting 60 seconds alongside an item with no interval shares a 30-second poll.

Changing the shared interval on configuration reload restarts polling with an immediate query. Monitoring stops when no Mail items are enabled.

Default and event refresh follow completed readings. Interval and manual policies retain a snapshot until refreshed. A trigger captures the latest shared state; it does not force a new Mail query or change the polling interval. See [refresh policies](/sbar/configuration/refresh/).

## Current limits

Counts reflect Mail's local synchronisation state. Only the combined inbox is supported, with no account or mailbox selection and no message content access. Other mail applications are not supported.

There are no dedicated state tints or settings to hide items with zero counts or error states.

## Example

```json
{
  "id": "mail",
  "type": "mail",
  "mail": { "pollInterval": 10 },
  "primaryAction": { "kind": "application", "value": "com.apple.mail" }
}
```

This shows the unread count, waits ten seconds after each completed query, and opens Mail when clicked. The action is optional; monitoring itself never launches Mail.
