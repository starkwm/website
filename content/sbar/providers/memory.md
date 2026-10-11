---
title: "Memory"
description: "Used memory, for example RAM 8 GB, from active, wired, and compressed pages."
weight: 13
category: "System"
cadence: "2-second sampling"
options: "`memory` block"
---

## Output

Used memory from active, wired, and compressed physical pages. The default item displays a `memorychip` icon and text such as `RAM 8 GB`. Omitting the `memory` block is equivalent to `memory: {}`.

## Configuration

Use the item-level [`text` template](/sbar/configuration/text-templates/) to customise or hide the label.

Set these options inside `memory`.

| Property | Default | Description |
| --- | --- | --- |
| `showSymbol` | `true` | Show the state icon, including an item-level override. |
| `symbols.font` | - | Shared installed font name for glyph symbols; each glyph can override it. |
| `symbols.size` | Resolved item/theme font size | Shared glyph size, 8 to 72 points; each glyph can override it. |
| `symbols.available` | `memorychip` | Valid memory reading. |
| `symbols.unavailable` | `questionmark` | No usable memory reading. |

### Display formats

| Template fields | Example value | Meaning |
| --- | --- | --- |
| `{{used}}` | `8 GB` | Used bytes formatted by macOS. |
| `{{percentage}}%` | `50%` | Used bytes divided by installed physical RAM, rounded to the nearest whole percent. |
| `{{used}} / {{total}}` | `8 GB / 16 GB` | Used bytes and installed physical RAM, each formatted by macOS. |

Add `RAM` to `text` if you want the prefix. Wrap readings in an `available` section to handle missing values.

### Appearance {#symbols-and-accessibility}

Symbols accept SF Symbol names or [font glyph objects](/sbar/configuration/appearance/#font-glyph-symbols). Use [`symbolFontWeight`](/sbar/configuration/appearance/#sf-symbol-weight) to set SF Symbol weight independently of text.

An item-level `symbol` overrides both state icons. `showSymbol: false` hides all symbols, including this override. Icon-only items retain used/total and percentage in their accessibility label, or `Memory usage unavailable` when no valid reading exists.

To change `memory`, edit the configuration file. `sbar set` cannot change this block.

[Shared item options](/sbar/configuration/items/) cover styling, symbols, actions, priority, and enabled state.

### Text templates

The item-level `text` setting supports `id`, `value`, `symbol`, `used`, `total`, `percentage`, `usedBytes`, `totalBytes`, `available`. See [text templates](/sbar/configuration/text-templates/) for shared fields and syntax.

`used` and `total` include units. `usedBytes` and `totalBytes` contain byte counts. `percentage` is a rounded whole number without `%`. These reading fields are empty when unavailable. A valid zero-usage reading still has `available: true`.

`value` contains the default label, such as `RAM 8 GB`, or `RAM —` when unavailable. Use it as a fallback when displaying a percentage:

```json
{
  "id": "memory",
  "type": "memory",
  "text": "{{#available}}RAM {{percentage}}%{{/available}}{{^available}}{{value}}{{/available}}"
}
```

This displays `RAM 50%` when half the installed memory is used, `RAM 0%` for a valid zero reading, and `RAM —` when unavailable. The item keeps its state icon and native accessibility description.

## Updates

The provider samples memory usage every two seconds for all displays. Startup, failed reads, or inconsistent counts display `RAM —` with the unavailable icon by default, replacing the previous reading. The next valid sample restores the value.

Refresh policies capture the full numeric state, including unavailable readings. Manual and interval items retain their snapshot until refreshed. Raw provider events retain used-byte formatting regardless of an item's text template. See [refresh policies](/sbar/configuration/refresh/).

## Current limits

Used bytes are active + wired + compressed physical pages, multiplied by the host page size. This calculation omits other virtual memory categories and can differ from Activity Monitor's "Memory Used". `used`, `usedBytes`, and the used-memory portion of `percentage` share this calculation. `total` and `totalBytes` represent installed physical RAM.

No memory-pressure measurement, configurable units, alternative usage calculation, or dedicated state tints.

## Example

```json
{
  "id": "memory",
  "type": "memory",
  "text": "{{#available}}{{used}} / {{total}}{{/available}}{{^available}}—{{/available}}"
}
```

This shows an icon and a value such as `8 GB / 16 GB`. When no reading is available, it shows `—` with a question-mark icon. Set top-level `text: ""` for an icon-only item, or `memory.showSymbol: false` for text-only output.
