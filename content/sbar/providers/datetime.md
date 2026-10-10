---
title: "Date and time"
description: "Current date and time with localised styles or custom patterns."
weight: 1
category: Time
cadence: "Every second"
options: "`format`, `dateStyle`, `timeStyle`"
---

## Output

Current time using the system short time style by default. Choose localised date and time styles or a custom pattern to change the output.

## Configuration

Use the item-level [`text` template](/sbar/configuration/text-templates/) to customise or hide the label.

| Property | Default | Description |
| --- | --- | --- |
| `format` | - | Unicode date/time pattern. A nonempty value overrides both styles; omitted, `null`, or empty values use the styles. |
| `dateStyle` | `none` | `none`, `short`, `medium`, `long`, or `full`. |
| `timeStyle` | `short` | `none`, `short`, `medium`, `long`, or `full`. |

### Localised styles {#localized-styles}

Set `dateStyle` and `timeStyle` independently. Use `timeStyle: "none"` for a date-only display. The exact order, punctuation, and names depend on the system locale.

```json
{ "id": "date", "type": "datetime", "dateStyle": "full", "timeStyle": "none" }
```

To show both date and time in one item:

```json
{ "id": "datetime", "type": "datetime", "dateStyle": "medium", "timeStyle": "short" }
```

For separate styling or placement, use two `datetime` items with distinct IDs: one with `timeStyle: "none"` for the date and one with `dateStyle: "none"` for the time. Setting both styles to `none` produces an empty default label unless a nonempty `format` overrides them. A `text` template can still add literal text.

### Custom patterns

Examples below use 13 September 2026 at 16:05:09 with a British English locale.

| Pattern | Example output |
| --- | --- |
| `EEE d MMM HH:mm` | `Sun 13 Sep 16:05` |
| `HH:mm` | `16:05` |
| `h:mm a` | `4:05 pm` |
| `HH:mm:ss` | `16:05:09` |
| `yyyy-MM-dd` | `2026-09-13` |
| `dd/MM/yyyy` | `13/09/2026` |
| `EEEE, d MMMM` | `Sunday, 13 September` |
| `MMM d 'at' HH:mm` | `Sep 13 at 16:05` |

Patterns use the system locale and time zone. Quote literal words with single quotes. Use `yyyy` for the calendar year; `YYYY` is the week-based year and can differ around New Year.

### Runtime changes

```sh
sbar set date format '"EEEE, d MMMM"'
```

Use `sbar set` to change either style property. Clear a custom pattern before using styles:

```sh
sbar set date format null
sbar set date dateStyle '"full"'
sbar set date timeStyle '"none"'
```

Replace `date` with the item's ID. Runtime changes are temporary; save the format in the configuration file to keep it after a reload or restart.

[Shared item options](/sbar/configuration/items/) cover styling, symbols, actions, priority, and enabled state.

### Text templates

The item-level `text` setting supports `id`, `value`, `symbol`. See [text templates](/sbar/configuration/text-templates/) for shared fields and syntax. Format the date with `format`, `dateStyle`, or `timeStyle`, then insert it with `{{value}}`.

This provider has no default icon. To use `{{symbol}}`, configure an item-level `symbol`, such as `"symbol": "clock"`.

For example, add a prefix to a formatted time:

```json
{
  "id": "clock",
  "type": "datetime",
  "format": "HH:mm",
  "text": "Time {{value}}"
}
```

## Updates

The shared clock updates every second, including for date-only items. See [refresh policies](/sbar/configuration/refresh/) for snapshot and trigger behaviour.

## Current limits

There is no per-item locale or time zone setting; both follow the system. Every nonempty `format` is interpreted as a custom pattern; localised style names belong in `dateStyle` and `timeStyle`.

## Example

```json
{
  "id": "date",
  "type": "datetime",
  "format": "EEE d MMM HH:mm"
}
```
