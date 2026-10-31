---
title: "Configuration"
description: "One JSON file controls the entire bar."
weight: 1
showDocList: false
---

By default, sbar looks for `~/.config/sbar/config.jsonc`, then `~/.config/sbar/config.json`. Edit either file and sbar reloads it when the file changes. If neither file exists, the bar shows the application owning the menu bar, a divider, and a clock. Removing the active file restores that default bar. If an edit is invalid, sbar keeps the last valid configuration. If the file is invalid at startup, it uses the default bar.

Inspect errors with `sbar query --diagnostics`. Valid reloads preserve unchanged native providers and [refresh snapshots](/sbar/configuration/refresh/#configuration-reloads).

Run `sbar validate` to check the file without starting the bar. To check another file, use `sbar validate --config /path/to/config.jsonc`. Invalid or missing files produce an error and a nonzero exit status. Validation never writes the file. Use `sbar start --config /path/to/config.jsonc` to run with another configuration.

Configuration files accept `//` line comments, `/* ... */` block comments, and trailing commas in objects and arrays. sbar removes them in memory before decoding. It does not change the file, and comment markers inside strings remain literal text. Block comments cannot nest.

Both `.jsonc` and `.json` files accept this syntax. `sbar start` and `sbar validate` prefer `config.jsonc` when both default files exist. If `config.jsonc` is invalid, sbar reports the error instead of falling back to `config.json`.

```jsonc
{
  "schemaVersion": 1,
  // Leave room for the menu bar.
  "bar": { "margin": { "top": 40, }, },
  "items": {
    "right": [
      /* Use a 24-hour clock. */
      { "id": "clock", "type": "datetime", "format": "HH:mm", },
    ],
  },
}
```

Save persistent changes in the configuration file. sbar never writes to the file or backs it up. For editor completion, copy the [v0.0.2 schema](/sbar/config.schema.json) beside your configuration as `config.schema.json` and add `"$schema": "config.schema.json"` to the root object.

The [Everyday bar](https://github.com/starkwm/sbar/tree/v0.0.2/examples/everyday) includes native application icons, media shown only during playback, weather, system metrics, unread Mail counts, and connection and audio-device popovers. It uses [text templates](/sbar/configuration/text-templates/) for labels, plus hover colours and minimum widths for its CPU and memory items. The [floating bar](https://github.com/starkwm/sbar/tree/v0.0.2/examples/floating) has fewer items, inset edges, and rounded corners. The [sections example](https://github.com/starkwm/sbar/tree/v0.0.2/examples/sections) gives the left, centre, and right regions separate backgrounds and borders.

The [groups example](https://github.com/starkwm/sbar/tree/v0.0.2/examples/groups) demonstrates child spacing and style inheritance. For a side bar, see the [vertical example](https://github.com/starkwm/sbar/tree/v0.0.2/examples/vertical).

## Example

Create `~/.config/sbar/config.jsonc` with a configuration such as:

```json
{
  "schemaVersion": 1,
  "bar": {},
  "items": {
    "left": [
      { "id": "app", "type": "frontApplication" }
    ],
    "right": [
      { "id": "battery", "type": "battery" },
      { "id": "clock", "type": "datetime", "format": "HH:mm" }
    ]
  }
}
```

The root object requires `schemaVersion`, `bar`, and `items`. Only `schemaVersion: 1` is supported. An empty `bar` uses the default bar settings; an empty `items` displays no items. Add an optional `theme` for [bar and item appearance](/sbar/configuration/appearance/).

Use the shared [`text` field](/sbar/configuration/text-templates/) to customise labels with provider values and conditional sections. Provider defaults apply when `text` is omitted.

Provider configuration blocks must match the item's `type`. For example, an `audioDevice` block belongs on an `audioDevice` item. Validation also checks disabled items and children. Use `sbar validate` alongside editor schema checks to catch duplicate IDs and other constraints that depend on multiple values.

## Bar settings

`position` accepts `top`, `bottom`, `left`, or `right`. Use `width` and `extendToTopEdge` to configure side bars.

| Property | Default | Description |
| --- | --- | --- |
| `position` | `top` | `top`, `bottom`, `left`, or `right`. |
| `height` | `32` | Horizontal bar height, 20 to 96 points including padding. |
| `width` | `32` | Vertical bar width, 20 to 96 points including padding. |
| `extendToTopEdge` | `false` | Extend side bars into the menu-bar area, respecting the Dock and margins. Ignored by horizontal bars. |
| `margin` | All `0` | Object with `top`, `bottom`, `left`, `right` offsets, each from 0 to 4096 points. |
| `displays` | `all` | `main`, `all`, or `selected`. |
| `displayIDs` | None | Display IDs, required when `displays` is `selected`. |
| `windowLevel` | `floating` | `floating`, `statusBar`, or `screenSaver`; `null` uses the default. |
| `shadow` | `false` | Enable a native window shadow or a fade along the bar's edge. `null` also uses the default. See [shadows](#shadows). |
| `mousePassThrough` | `false` | Pass mouse events through empty regions. |

`main` selects the primary display. Use `sbar query --displays` to find connected display IDs and names.

The default `floating` window level keeps the bar above ordinary windows and below system notifications and the revealed menu bar. Explicit `statusBar` and `screenSaver` levels can cover notifications, especially when the menu bar auto-hides and banners overlap the bar.

A top bar sits at the physical screen edge and shares the system menu-bar area. Bottom and side bars fit within the space left by the menu bar and Dock. Set `extendToTopEdge` to extend a side bar into the menu-bar area. When a top bar crosses a notch, its items avoid the cutout and the centre section sits immediately to its right.

Bars hide on displays showing a full-screen app and return on desktop Spaces. Bars on other displays stay visible. This applies to every position and window level, even without a Spaces item.

The bar does not hide the system menu bar or reserve space for application windows. Set a gap in your window manager and adjust the bar's margins to avoid overlap.

### Space transitions

Panels follow display and Space changes. sbar uses a shared Space to keep panels visible during desktop transition animations. This uses private macOS SkyLight APIs, independently of the [Spaces provider](/sbar/providers/spaces/). If those APIs are unavailable or the shared Space cannot be created, the bar logs a warning and keeps its normal AppKit window behaviour.

## Floating bar

To create a floating bar, add margins and rounded corners:

```json
{
  "schemaVersion": 1,
  "bar": {
    "height": 40,
    "shadow": true,
    "margin": { "top": 44, "left": 12, "right": 12 }
  },
  "theme": {
    "horizontalPadding": 16,
    "verticalPadding": 4,
    "cornerRadius": 12
  },
  "items": { "right": [{ "id": "clock", "type": "datetime", "format": "HH:mm" }] }
}
```

Margins leave space between the bar and its placement area's edges. Left and right margins shorten horizontal bars; top and bottom margins shorten side bars. sbar clamps margins that would leave no room, keeping at least one point of space, and shrinks the bar to fit.

For top bars and side bars with `extendToTopEdge`, `margin.top` starts at the physical screen edge. Leave enough room for the menu bar or notch. Other positions use the usable display area. Changes reload automatically.

The theme's `verticalPadding` and `cornerRadius` accept 0 to 48 points and default to zero. Padding sits inside the bar. The rounded corners clip the content and background, whether you use the system material or a custom colour.

## Vertical bars

Set `bar.position` to `left` or `right` and set the width with `bar.width`. Items stay upright and run from top to bottom on either edge.

| Section | Position in a side bar |
| --- | --- |
| `items.left` | Top |
| `items.center` | Middle |
| `items.right` | Bottom |

The matching `theme.regions` styles follow the same order.

```json
{
  "schemaVersion": 1,
  "bar": { "position": "left", "width": 64 },
  "theme": { "horizontalPadding": 4, "verticalPadding": 8 },
  "items": {
    "left": [{ "id": "spaces", "type": "spaces", "spaces": { "showSymbol": false } }],
    "right": [{ "id": "clock", "type": "datetime", "format": "HH:mm" }]
  }
}
```

`bar.width` controls side bars; `bar.height` controls top and bottom bars. Both default to 32 points and accept 20 to 96. Padding and item widths keep their usual directions. Use short labels or `"text": ""` for icons without labels. Long labels truncate to fit.

Group children and provider entries, such as a list of Spaces, stack vertically. Dividers run across the bar and spacers expand along it. [Overflow](/sbar/configuration/items/#overflow) uses item heights and the same priority order as horizontal bars. Popups open towards the middle of the display. Items inside them keep their horizontal layout.

Side bars do not reserve space for other windows. Set a left or right gap in your window manager if needed.

See the [vertical example](https://github.com/starkwm/sbar/tree/v0.0.2/examples/vertical) for app shortcuts, status icons and popups.

## Shadows

Set `bar.shadow` to `true` to enable a shadow. Inset or rounded bars use the native macOS window shadow. macOS controls its colour, blur, and offset.

Square bars spanning the display's full width use a soft 16-point fade below a top bar or above a bottom bar. Side bars spanning the full display height cast the fade towards the middle of the display. The fade shortens at the screen edge. It uses extra transparent window space that passes clicks through, so the shadow does not change the configured bar height, content position, or mouse hit regions.

Shadow changes reload with the configuration, including changes to the margins, background, and corner radius.
