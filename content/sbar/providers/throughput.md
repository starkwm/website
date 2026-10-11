---
title: "Throughput"
description: "Download and upload rates, with interface selection and smoothing."
weight: 15
category: "Connectivity"
cadence: "2-second sampling"
options: "`throughput` block"
---

## Output

Download and upload rates, with directional icons and automatically scaled units, such as `42 KiB/s` and `8 KiB/s`. By default, the provider combines valid rates from all non-loopback interfaces. Omitting the `throughput` block is equivalent to `throughput: {}`.

## Configuration

Use the item-level [`text` template](/sbar/configuration/text-templates/) to customise or hide the label.

Set these options inside `throughput`.

| Property | Default | Description |
| --- | --- | --- |
| `showSymbol` | `true` | Show directional or unavailable icons, including an item-level override. |
| `interfaces` | All non-loopback interfaces | Nonempty list of unique interface names, without blank names or surrounding whitespace. |
| `unit` | `bytes` | `bytes` or `bits`; rates scale automatically. |
| `smoothingSamples` | `1` | Integer 1 to 30; average recent rates separately for each interface before summing. |
| `symbols.font` | - | Shared installed font name for glyph symbols; each glyph can override it. |
| `symbols.size` | Resolved item/theme font size | Shared glyph size, 8 to 72 points; each glyph can override it. |
| `symbols.download` | `arrow.down` | Download icon. |
| `symbols.upload` | `arrow.up` | Upload icon. |
| `symbols.unavailable` | `questionmark` | No usable rate reading. |

### Units and visibility

| Unit | Scale | Suffixes |
| --- | --- | --- |
| `bytes` | 1024 | `B/s`, `KiB/s`, `MiB/s`, `GiB/s` |
| `bits` | 1000 | `bit/s`, `kbit/s`, `Mbit/s`, `Gbit/s` |

Values round to at most one decimal place, retaining small rates such as `0.5 B/s`. Each direction scales independently. The `number`, `download.value`, and `upload.value` template fields omit suffixes while retaining automatic scaling.

Use `text` to select directions, numbers, units, or icons; see the examples below. Accessibility retains both direction names, rates, and units whenever a reading is available, even when the template hides them.

An empty `text` hides both text and directional icons. An item-level symbol override or unavailable icon still follows `showSymbol`. For directional icons alone, use a `transfers` loop containing `{{symbol}}`.

Symbols accept SF Symbol names or [font glyph objects](/sbar/configuration/appearance/#font-glyph-symbols). Use [`symbolFontWeight`](/sbar/configuration/appearance/#sf-symbol-weight) to set SF Symbol weight independently of text.

An item-level `symbol` replaces the directional symbols with one fixed icon and also overrides the unavailable icon. `showSymbol: false` hides it regardless.

Set the item's [`symbolPosition`](/sbar/configuration/appearance/#symbol-placement) to `right` to put each arrow after its own rate. Download still precedes upload. With an item-level `symbol` override, the single icon appears after the combined content. Placement defaults to `left`.

To change `throughput`, edit the configuration file. `sbar set` cannot change this block.

[Shared item options](/sbar/configuration/items/) cover styling, symbols, actions, priority, and enabled state.

### Text templates

The item-level `text` setting supports `id`, `value`, `symbol`, `download`, `upload`, `download.value`, `download.unit`, `upload.value`, `upload.unit`, `available`, `transfers`, `direction`, `number`, `unit`, `separator`, `first`, `last`, `index`, `total`. See [text templates](/sbar/configuration/text-templates/) for syntax. Rates follow interface selection, units, and smoothing.

| Field | Meaning |
| --- | --- |
| `download`, `upload` | Full formatted rates, including units. |
| `download.value`, `upload.value` | Scaled numbers without units. |
| `download.unit`, `upload.unit` | Unit suffixes. |
| `available` | Whether the item has a usable rate reading. |
| `transfers` | Download then upload when available; empty otherwise. Use as a section. |
| `direction` | `download` or `upload` inside the loop. |
| `value` | Combined rates outside the loop, such as `42 KiB/s 8 KiB/s`; the entry rate inside it, such as `42 KiB/s`. Unavailable fallback: `—`. |
| `number`, `unit` | Scaled number and suffix inside the loop. |
| `symbol` | Direction icon inside the loop; item-level or unavailable icon outside it. Use as `{{symbol}}`. |
| `index`, `first`, `last` | One-based position and position flags inside the loop. |
| `total` | Two when available, zero otherwise; also available outside the loop. |
| `separator` | Section for content between entries that render text or a symbol. |
| `id` | Item ID, including inside the loop. |

Zero download and upload rates are valid readings with `available: true` and two transfer entries. When unavailable, the rate fields are empty and `transfers` has no entries. `total` counts the source entries, so it remains two even when a condition displays only download.

Entry-only fields are empty outside the loop. `{{^transfers}}{{symbol}}{{value}}{{/transfers}}` supplies the unavailable fallback. Explicit templates add no spacing between runs; the default layout uses four points between directions.

A symbol tag inside a false condition suppresses that icon. Outside the loop, `{{symbol}}` requests the item-level override or unavailable icon; it does not select a direction. If a template contains any symbol tag, an aggregate icon appears only when a symbol tag renders. Include `{{symbol}}` in the inverse `transfers` section to retain the unavailable icon.

Repeated symbol tags in the same run request one icon. Scalar rate fields render text without requesting directional icons.

For download alone:

```json
{
  "id": "download",
  "type": "throughput",
  "text": "{{#transfers}}{{#direction=download}}{{symbol}}{{value}}{{/direction}}{{/transfers}}{{^transfers}}{{symbol}}{{value}}{{/transfers}}"
}
```

For scaled numbers without units, retain the icons and replace `value` with `number`:

```json
{
  "id": "throughput",
  "type": "throughput",
  "text": "{{#transfers}}{{symbol}}{{number}}{{#separator}} · {{/separator}}{{/transfers}}{{^transfers}}{{symbol}}{{value}}{{/transfers}}"
}
```

For directional icons alone:

```json
{
  "id": "throughput",
  "type": "throughput",
  "text": "{{#transfers}}{{symbol}}{{#separator}} {{/separator}}{{/transfers}}"
}
```

This icon-only template hides the unavailable icon too, because no symbol tag renders when `transfers` is empty. Add `{{^transfers}}{{symbol}}{{/transfers}}` to retain that icon without adding text.

For a text-only rate label without directional icons, use scalar fields:

```json
{
  "id": "throughput",
  "type": "throughput",
  "text": "{{#available}}Down {{download}} / Up {{upload}}{{/available}}{{^available}}{{value}}{{/available}}",
  "throughput": { "showSymbol": false }
}
```

This displays text such as `Down 42 KiB/s / Up 8 KiB/s`, or `—` when unavailable. `showSymbol: false` also hides the unavailable icon and any item-level symbol override.

## Updates

The provider samples network counters every two seconds for all displays. It calculates download and upload deltas for each interface, then combines them. Each item can choose its own interfaces and smoothing window. A window of 1 disables smoothing; larger windows use fewer samples during warm-up.

Refresh policies capture the full per-interface history, so manual and interval items keep their displayed rates and appearance until refreshed. Provider events retain unsmoothed all-interface rates in bytes. See [refresh policies](/sbar/configuration/refresh/).

### Unavailable readings {#interface-availability}

When `interfaces` is set, every selected interface must have a valid rate. A missing, newly appeared, or reset interface makes the item unavailable. Without a filter, only interfaces with valid deltas contribute; new or reset interfaces join after a fresh interval. If none have valid deltas, the item is unavailable. Loopback interfaces are excluded even when explicitly named.

Startup, failed reads, sampling restarts, and gaps longer than ten seconds clear baselines and history. The item shows `—` with a `questionmark` icon by default until a fresh sampling interval is available; accessibility reports `Network throughput unavailable`.

Timing uses a monotonic clock. Counter decreases, including resets or wraparound, and interface identity changes reset only that interface's history without producing a traffic spike. Unchanged counters are a valid zero rate. Removed interfaces are discarded immediately.

## Current limits

Interface names depend on the machine and do not imply Wi-Fi or Ethernet. The unfiltered total includes tunnels, which can add traffic from the same underlying transfer. No dedicated state tints or fixed-unit scale.

## Example

```json
{
  "id": "throughput",
  "type": "throughput",
  "text": "{{#transfers}}{{symbol}}{{value}}{{#separator}} · {{/separator}}{{/transfers}}{{^transfers}}{{symbol}}{{value}}{{/transfers}}",
  "throughput": {
    "interfaces": ["en0"],
    "smoothingSamples": 3
  }
}
```

Replace `en0` with an interface name on your Mac, or omit `interfaces` to combine all non-loopback interfaces. This averages up to three recent rates per interface before combining them.
