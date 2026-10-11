---
title: "Spaces"
description: "Native macOS Spaces, with focused or per-display scope and configurable labels."
weight: 17
category: "Workspaces"
cadence: "Native events"
options: "`spaces` block"
---

## Output

The focused native macOS Space's one-based position across displays, with a `rectangle.3.group` icon by default. Fullscreen Spaces are included. Omitting the `spaces` block is equivalent to `spaces: {}`; no window manager is required.

## Configuration

Use the item-level [`text` template](/sbar/configuration/text-templates/) to customise or hide the label.

Set these options inside `spaces`.

| Property | Default | Description |
| --- | --- | --- |
| `showSymbol` | `true` | Show the state icon, including an item-level override. |
| `includeFullscreen` | `true` | Include fullscreen Spaces in positions and totals. |
| `scope` | `focused` | `focused` spans displays; `display` uses each bar's display. |
| `symbols.font` | - | Shared installed font name for glyph symbols; each glyph can override it. |
| `symbols.size` | Resolved item/theme font size | Shared glyph size, 8 to 72 points; each glyph can override it. |
| `symbols.available` | `rectangle.3.group` | Available Space state. |
| `symbols.unavailable` | `questionmark` | Requested Space or display cannot be read. |
| `tints.active` | Normal tint | Current value or active list entry. |
| `tints.inactive` | Normal tint | Other list entries. |
| `tints.unavailable` | Normal tint | Unavailable state. |

### Scope and labels {#scope-and-formats}

With `scope: "focused"`, every bar shows the same focused Space within the ordering across displays. With `scope: "display"`, each bar uses its own display's Space list and active Space. When macOS shares Spaces across displays, bars use the shared list.

Positions are numbered after scope and fullscreen filtering. They can change when Spaces are reordered, added, or removed. Use `workspaceId` to match a native Space ID instead.

### Fullscreen Spaces

With `includeFullscreen: false`, `name` and `value` are `Fullscreen` when a fullscreen Space is active, and `index` is empty. The `fullscreen` field remains true. The loop contains the remaining desktop Spaces with none highlighted. Use `{{^workspaces}}{{value}}{{/workspaces}}` for a fallback when no entries remain; `available` can still be true.

### Appearance {#state-appearance}

Symbols accept SF Symbol names or [font glyph objects](/sbar/configuration/appearance/#font-glyph-symbols). Use [`symbolFontWeight`](/sbar/configuration/appearance/#sf-symbol-weight) to set SF Symbol weight independently of text.

An item-level `symbol` overrides both state icons. `showSymbol: false` hides all symbols, including this override. Tints accept `#RRGGBB` or `#RRGGBBAA`; omitted tints inherit the normal item style. Icon-only items retain an accessibility label describing the active Space or unavailable state.

To change `spaces`, edit the configuration file. `sbar set` cannot change this block.

[Shared item options](/sbar/configuration/items/) cover styling, symbols, actions, priority, and enabled state.

### Text templates

Use the item-level `text` setting to customise the workspace label. See [text templates](/sbar/configuration/text-templates/) for syntax and collection rules.

Outside `{{#workspaces}}...{{/workspaces}}`, fields describe the current workspace selected by `scope`. Inside the loop, entry fields describe each workspace in order. `available` still describes the selected current workspace. With display scope, `active` can be true while `focused` is false when another display has focus.

| Field | Meaning |
| --- | --- |
| `name` | One-based position after scope and fullscreen filtering; `Fullscreen` for an excluded current fullscreen Space |
| `index` | Position after scope and fullscreen filtering |
| `workspaceId` | Native Space ID |
| `total` | Number of entries after scope/fullscreen filtering |
| `active` | The current workspace for this item's scope |
| `focused` | The globally focused workspace |
| `visible` | Currently visible on a display |
| `fullscreen` | Native fullscreen Space |
| `available` | Whether the current workspace selected by scope is available; unchanged inside the loop |
| `first`, `last` | First/last entry in the source list, available inside a loop |
| `value` | Default current label outside a loop; entry name inside it |
| `id` | Item ID, including inside a loop |
| `workspaces` | Ordered workspace collection; use as a section |
| `separator` | Section for content between entries that render content |
| `symbol` | Requests the single native or configured item icon, not a per-workspace icon |

This labels the workspace with `index=1` as Code:

```json
{
  "id": "spaces",
  "type": "spaces",
  "text": "{{#workspaces}}{{#index=1}}Code{{/index}}{{^index=1}}{{name}}{{/index}}{{#separator}} · {{/separator}}{{/workspaces}}{{^workspaces}}{{value}}{{/workspaces}}",
  "spaces": { "scope": "display", "includeFullscreen": false }
}
```

For three desktop Spaces, this displays `Code · 2 · 3`.

Spaces highlights the active entry. Hover tint overrides entry colours. Separators use the inactive tint, or the item colour if none is set. They are never bold. Literal text inside the loop inherits the entry styling. Templates add no spacing or per-workspace click actions.

Unavailable snapshots have no current fields, `available: false`, and `total: 0`. Use `{{^workspaces}}{{value}}{{/workspaces}}` as an empty-list fallback.

To show the current position and total with a default-label fallback:

```json
{
  "id": "spaces",
  "type": "spaces",
  "text": "{{#index}}{{index}} / {{total}}{{/index}}{{^index}}{{value}}{{/index}}"
}
```

For the second workspace in a list of four, this displays `2 / 4`. When `index` is missing, it keeps the default label.

Scope selection, loops, and the default label use the same snapshot. Template conditions can hide entries without changing `index`, `total`, `first`, or `last`. Separators appear only between entries that render content. An inverse `workspaces` section tests whether the source list is empty, not whether conditions hid every entry.

Omit `text` for the current workspace label, or set `text: ""` for an icon alone. A `{{symbol}}` tag controls the single item icon, including inside a loop. If the template contains the tag, the icon appears only when a branch containing it renders; `showSymbol: false` still hides it.

## Updates

The provider refreshes on Space switches, application activation, and display changes. It combines notification bursts into one update. If a Space transition returns incomplete data, it retries a limited number of times and keeps the previous snapshot until then.

Each refresh captures Spaces across displays. Every bar uses that snapshot to show the Spaces for its display. Manual and interval items retain that state until refreshed. See [refresh policies](/sbar/configuration/refresh/).

## Current limits

Uses private SkyLight APIs. Shows `Spaces unavailable` when the requested Space or display cannot be read. Lists do not switch Spaces when clicked. Positional labels can move when the Space order changes.

## Example

```json
{
  "id": "spaces",
  "type": "spaces",
  "text": "{{#workspaces}}{{name}}{{#separator}} · {{/separator}}{{/workspaces}}{{^workspaces}}{{value}}{{/workspaces}}",
  "spaces": {
    "includeFullscreen": false,
    "scope": "display",
    "tints": {
      "active": "#FFFFFF",
      "inactive": "#888888",
      "unavailable": "#FF6666"
    }
  }
}
```

This lists desktop Spaces for each bar's display, with the active entry in bold. Lists are read-only.
