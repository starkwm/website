---
title: "Disk"
description: "Capacity of a selected volume, with configurable formats and free-space colours."
weight: 14
category: "System"
cadence: "2-second sampling"
options: "`disk` block"
---

## Output

Capacity of a selected volume, defaulting to the home volume. The default item displays an `internaldrive` icon and text such as `120 GB free`. Omitting the `disk` block is equivalent to `disk: {}`.

## Configuration

Use the item-level [`text` template](/sbar/configuration/text-templates/) to customise or hide the label.

Set these options inside `disk`.

| Property | Default | Description |
| --- | --- | --- |
| `showSymbol` | `true` | Show the state icon, including an item-level override. |
| `path` | Home directory | Absolute path or path with `~` expansion; capacity describes its containing filesystem. |
| `warningThreshold` | `20` | Integer 0 to 100; warning applies at or below this percentage free. |
| `criticalThreshold` | `10` | Integer 0 to 100; critical applies at or below this percentage free. Must be below `warningThreshold`. |
| `symbols.font` | - | Shared installed font name for glyph symbols; each glyph can override it. |
| `symbols.size` | Resolved item/theme font size | Shared glyph size, 8 to 72 points; each glyph can override it. |
| `symbols.available` | `internaldrive` | Valid capacity reading. |
| `symbols.unavailable` | `questionmark` | No usable capacity reading. |
| `tints.normal` | Normal tint | Free percentage above the warning threshold. |
| `tints.warning` | Normal tint | Free percentage at or below warning, above critical. |
| `tints.critical` | Normal tint | Free percentage at or below critical. |
| `tints.unavailable` | Normal tint | Unavailable-reading colour. |

### Display formats

| Text template | Example with label | Meaning |
| --- | --- | --- |
| `{{free}} free` | `120 GB free` | Free capacity. |
| `{{used}} used` | `380 GB used` | Total minus free capacity. |
| `{{total}} total` | `500 GB total` | Total filesystem capacity. |
| `{{used}} / {{total}} used` | `380 GB / 500 GB used` | Used and total capacity. |
| `{{percentage}}% used` | `76% used` | Used percentage, rounded to the nearest whole percent. |

Bytes use macOS file-size formatting. Choose fields in top-level `text`.

### Appearance {#state-appearance}

Thresholds compare the unrounded free percentage, while `{{percentage}}%` displays the rounded used percentage. Critical takes precedence over warning. State tints override the normal item/theme tint and accept `#RRGGBB` or `#RRGGBBAA`; omitted colours use the normal tint.

Symbols accept SF Symbol names or [font glyph objects](/sbar/configuration/appearance/#font-glyph-symbols). Use [`symbolFontWeight`](/sbar/configuration/appearance/#sf-symbol-weight) to set SF Symbol weight independently of text.

An item-level `symbol` overrides both state icons. `showSymbol: false` hides all symbols, including this override. Icon-only items retain the path, free/total capacity, and used percentage in their accessibility label, or identify the path as unavailable.

To change `disk`, edit the configuration file. `sbar set` cannot change this block.

[Shared item options](/sbar/configuration/items/) cover styling, symbols, actions, priority, and enabled state.

### Text templates

The item-level `text` setting supports `id`, `value`, `symbol`, `used`, `free`, `total`, `percentage`, `freeBytes`, `totalBytes`, `available`. See [text templates](/sbar/configuration/text-templates/) for shared fields and syntax. Fields follow the selected path. `percentage` measures used space, while the default label shows free space.

`used`, `free`, and `total` include units. `freeBytes` and `totalBytes` contain byte counts. `percentage` is a rounded whole number without `%`. These reading fields are empty when unavailable. Zero free space is still a valid reading with `available: true`.

`value` contains the default free-space label, such as `120 GB free`, or `— unavailable` when no valid reading exists. Use it as a fallback when displaying used percentage:

```json
{
  "id": "disk",
  "type": "disk",
  "text": "{{#available}}{{percentage}}% used{{/available}}{{^available}}{{value}}{{/available}}"
}
```

This displays `76% used` for a volume with 24% free space, `100% used` when full, and `— unavailable` for an invalid reading. State colours still follow the unrounded free percentage.

## Updates

The provider samples disk capacity every two seconds. Paths on the same volume share one capacity read per sampling pass, across items and displays. Refresh policies capture each item's full capacity state; manual and interval items hold their snapshot until refreshed. Changing an item's path immediately clears its old snapshot. See [refresh policies](/sbar/configuration/refresh/).

Disk value events use each item ID, with free-space text regardless of the text template. Unavailable event values use `Disk —`, distinct from the template fallback `— unavailable`.

### Unavailable readings {#missing-or-unmounted-volumes}

Missing paths, failed reads, and invalid capacities display `— unavailable` with a `questionmark` icon by default. A valid sample restores the reading.

The provider checks the mount before and after reading. Once a path has produced a valid reading, a different mount point is treated as unavailable so an unmounted drive does not silently become a reading for its parent disk. Leftover directories under `/Volumes` are rejected unless they are on that mounted volume.

## Current limits

The provider tracks the volume at a path, not a persistent physical-drive identity. Free and total capacity come from the filesystem's `systemFreeSize` and `systemSize`; used is total minus free. There is no estimate of reclaimable storage or configurable units. Thresholds control colours, not actions.

## Example

```json
{
  "id": "external",
  "type": "disk",
  "disk": {
    "path": "/Volumes/External",
    "tints": {
      "warning": "#EBCB8B",
      "critical": "#BF616A",
      "unavailable": "#888888"
    }
  },
  "text": "{{#available}}{{used}} / {{total}}{{/available}}{{^available}}—{{/available}}"
}
```

Replace the path with an existing file or directory on the volume you want to monitor. This shows an icon and used/total capacity, using the default free-space thresholds. When no reading is available, it shows `—` with a question-mark icon. Set top-level `text: ""` for an icon-only item, or `disk.showSymbol: false` for text-only output.
