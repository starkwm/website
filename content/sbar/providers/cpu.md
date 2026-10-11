---
title: "CPU"
description: "Aggregate CPU usage, for example CPU 12%."
weight: 12
category: "System"
cadence: "2-second sampling"
options: "`cpu` block"
---

## Output

Aggregate busy CPU usage across all cores, from 0% to 100%, rounded to the nearest whole percent. The default item displays a `cpu` icon and `CPU N%`. Omitting the `cpu` block is equivalent to `cpu: {}`.

## Configuration

Use the item-level [`text` template](/sbar/configuration/text-templates/) to customise or hide the label.

Set these options inside `cpu`.

| Property | Default | Description |
| --- | --- | --- |
| `showSymbol` | `true` | Show the state icon, including an item-level override. |
| `smoothingSamples` | `1` | Integer 1 to 30; average this many recent available samples before rounding. |
| `warningThreshold` | `60` | Integer 0 to 100; medium usage starts at this displayed percentage. Must be below `highThreshold`. |
| `highThreshold` | `85` | Integer 0 to 100; high usage starts at this displayed percentage. |
| `symbols.font` | - | Shared installed font name for glyph symbols; each glyph can override it. |
| `symbols.size` | Resolved item/theme font size | Shared glyph size, 8 to 72 points; each glyph can override it. |
| `symbols.low` | `cpu` | Below the warning threshold. |
| `symbols.medium` | `cpu` | At or above warning, below high. |
| `symbols.high` | `cpu` | At or above the high threshold. |
| `symbols.unavailable` | `questionmark` | No usable CPU sample. |
| `tints.low` | Normal tint | Low-usage colour. |
| `tints.medium` | Normal tint | Medium-usage colour. |
| `tints.high` | Normal tint | High-usage colour. |
| `tints.unavailable` | Normal tint | Unavailable-sample colour. |

Thresholds use the rounded, smoothed percentage shown by the item. With defaults, 0 to 59% is low, 60 to 84% is medium, and 85 to 100% is high.

Symbols accept SF Symbol names or [font glyph objects](/sbar/configuration/appearance/#font-glyph-symbols). Use [`symbolFontWeight`](/sbar/configuration/appearance/#sf-symbol-weight) to set SF Symbol weight independently of text.

An item-level `symbol` overrides state symbols. `showSymbol: false` hides all symbols, including this override. State tints override the normal item/theme tint and accept `#RRGGBB` or `#RRGGBBAA`. Icon-only items retain an accessibility label, including when usage is unavailable.

To change `cpu`, edit the configuration file. `sbar set` cannot change this block.

[Shared item options](/sbar/configuration/items/) cover styling, symbols, actions, priority, and enabled state.

### Text templates

The item-level `text` setting supports `id`, `value`, `symbol`, `percentage`, `available`. See [text templates](/sbar/configuration/text-templates/) for shared fields and syntax. `percentage` is the item's smoothed reading, rounded to a whole number without `%`. It is empty when no reading is available. `available` is true when a reading exists, including zero. `value` contains the default smoothed label, such as `CPU 12%`, or `CPU —` when unavailable.

Use `available` to customise the percentage label while keeping the default unavailable label:

```json
{
  "id": "cpu",
  "type": "cpu",
  "text": "{{#available}}Usage {{percentage}}%{{/available}}{{^available}}{{value}}{{/available}}"
}
```

This displays `Usage 12%` for a 12% reading, `Usage 0%` for zero, and `CPU —` when unavailable. The item keeps its state icon, tint, and native accessibility description.

## Updates

The provider samples CPU usage every two seconds for all displays. Each item chooses its own smoothing window. A value of 1 disables smoothing; larger values average the most recent available samples, using fewer during warm-up. Text, thresholds, and accessibility use the same smoothed percentage. Raw provider events retain the latest unsmoothed reading.

Refresh policies capture the sample history, so manual and interval items keep their displayed values and appearance until refreshed. Smoothing does not change how often the provider samples usage. See [refresh policies](/sbar/configuration/refresh/).

### Unavailable readings {#unavailable-samples}

Startup, failed reads, unchanged CPU counters, and sampling gaps longer than ten seconds show `CPU —` by default and clear smoothing history. Failed reads and sampling restarts also reset the counter baseline; the provider needs a fresh sampling interval before it can show usage again. Unchanged counters mean there is no usable delta, not a measured 0% load.

## Current limits

No per-core view or configurable decimal precision. Thresholds affect appearance only; they do not trigger actions.

## Example

```json
{
  "id": "cpu",
  "type": "cpu",
  "cpu": {
    "smoothingSamples": 3,
    "tints": {
      "medium": "#EBCB8B",
      "high": "#BF616A",
      "unavailable": "#888888"
    }
  },
  "text": "{{#available}}{{percentage}}%{{/available}}{{^available}}—{{/available}}"
}
```

This shows an icon and `N%`, averaging up to three recent samples and using the default thresholds. When no sample is available, it shows `—` with a question-mark icon. Set top-level `text: ""` for an icon-only item, or `cpu.showSymbol: false` for text-only output.
