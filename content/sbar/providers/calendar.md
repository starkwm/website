---
title: "Calendar"
description: "Show the current or next event from macOS calendars."
weight: 25
---

A `calendar` item reads events from the calendars available through Apple EventKit. It shows an ongoing timed event first, then an ongoing all-day event, then the next event by start time. Cancelled and ended events are excluded. The [Calendar example](https://github.com/starkwm/sbar/tree/v0.0.4/examples/calendar) includes a complete bar configuration.

```json
{
  "id": "next-event",
  "type": "calendar",
  "calendar": {
    "lookaheadDays": 7,
    "includeAllDay": false,
    "hideWhenEmpty": true
  }
}
```

The default label is the local start time and title, `Now` and title for an ongoing timed event, or `All day` and title for an all-day event. Blank titles display `Untitled event`.

## Configuration

Set these options inside `calendar`:

| Property | Default | Description |
| --- | --- | --- |
| `lookaheadDays` | `7` | Event horizon, from 1 to 30 days. |
| `includeAllDay` | `true` | Include all-day events in selection. |
| `timeFormat` | System short time | Nonblank DateFormatter pattern for start and end times. |
| `showSymbol` | `true` | Show the provider symbol or item-level override. |
| `hideWhenEmpty` | `false` | Hide only confirmed empty results. Permission and read failures stay visible. |
| `symbols` | Status symbols | Overrides for `loading`, `upcoming`, `ongoing`, `empty`, `unauthorized`, and `unavailable`. |
| `tints` | Normal item tint | Colours keyed by the same six status names. |

Symbols accept SF Symbol names or [font glyph objects](/sbar/configuration/appearance/#font-glyph-symbols), with shared `font` and `size` inside `symbols`. The default symbol is `calendar`, `calendar.badge.clock` for an ongoing event, or `calendar.badge.exclamationmark` for denied access and read failures. A top-level `symbol` overrides the status symbol.

## Permission and updates

The first enabled Calendar item requests full Calendar access. macOS requires this permission to read events even though sbar never edits them. Calendar and Reminders permissions are separate. Validation does not request access.

EventKit runs inside the standalone executable. macOS may attribute permission to the launching terminal. Check System Settings > Privacy & Security > Calendars for the application macOS names. Permission behaviour needs verification from the intended launcher.

The provider reads on activation, after EventKit change notifications, and every minute. Enabled Calendar items share one query using the longest configured lookahead; each item selects its event independently. Removing the last active item stops monitoring. Item [refresh policies](/sbar/configuration/refresh/) control displayed snapshots independently of those reads. Manual snapshots hold event fields and `minutesUntil` until triggered.

The labels are `Loading calendar` before a result, `No events` for an empty selection, `Calendar permission denied` for denied access, and `Calendar unavailable` for failures. Event data stays in memory and is not sent to a server.

## Text templates

Use top-level `text` to customise the label:

```json
{
  "id": "next-event",
  "type": "calendar",
  "text": "{{#status=upcoming}}{{startTime}} · {{title}}{{/status}}{{^status=upcoming}}{{value}}{{/status}}",
  "calendar": {
    "timeFormat": "HH:mm",
    "tints": { "ongoing": "#66CC88", "unauthorized": "#FF6655" }
  }
}
```

| Field | Meaning |
| --- | --- |
| `value` | Default label, including empty and error labels. |
| `status` | `loading`, `upcoming`, `ongoing`, `empty`, `unauthorized`, or `unavailable`. |
| `available` | True for upcoming, ongoing, and empty results. |
| `title`, `calendar` | Selected event title and calendar name. |
| `startTime`, `endTime` | Local times using `timeFormat`, or the system short format. |
| `minutesUntil` | Minutes until the event starts, rounded up; zero for ongoing events. |
| `allDay` | Whether the selected event is all-day. |

Without a selected event, event strings are empty and `allDay` is false. Shared `id` and `symbol` fields also apply. There is no event collection loop.

Set top-level `text: ""` for an icon alone. The accessibility label still includes the default event title, so hiding the text does not conceal that title from accessibility output.
