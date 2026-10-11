---
title: "Yabai"
description: "Yabai Spaces, with focused or per-display scope and fullscreen filtering."
weight: 19
category: "Workspaces"
cadence: "2-second polling"
options: "`yabai` block"
---

## Output

The focused Space's Yabai label and a `rectangle.3.group` icon. If the label is missing or blank, the item shows the Mission Control index. Omitting the `yabai` block is equivalent to `yabai: {}`.

## Configuration

Use the item-level [`text` template](/sbar/configuration/text-templates/) to customise or hide the label.

Set these options inside `yabai`.

| Property | Default | Description |
| --- | --- | --- |
| `showSymbol` | `true` | Show the state icon, including an item-level override. |
| `includeFullscreen` | `true` | Include native fullscreen Spaces. |
| `scope` | `focused` | `focused` spans displays; `display` uses each bar's display. |
| `symbols.font` | - | Shared installed font name for glyph symbols; each glyph can override it. |
| `symbols.size` | Resolved item/theme font size | Shared glyph size, 8 to 72 points; each glyph can override it. |
| `symbols.available` | `rectangle.3.group` | Available Space state. |
| `symbols.unavailable` | `questionmark` | Missing or unavailable integration or display state. |
| `tints.focused` | Normal tint | Focused Space; takes precedence over visible. |
| `tints.visible` | Normal tint | Visible Space without focus. |
| `tints.inactive` | Normal tint | Other list entries. |
| `tints.unavailable` | Normal tint | Unavailable state. |

### Scope and labels {#scope-labels-and-fullscreen-spaces}

With `scope: "focused"`, the default label shows the focused Space on every bar, and `workspaces` includes Spaces across displays. With `scope: "display"`, the default label shows that display's visible Space even when another display has focus; lists contain only its Spaces. The provider maps display indexes using Yabai's display UUIDs. This supports custom Yabai display ordering.

Labels come from Yabai. Blank or missing labels fall back to Mission Control indexes, and lists follow index order. Use template conditions on `name`, `index`, or `workspaceId` to customise the display text. Indexes may change when Spaces are added, removed, or reordered.

### Fullscreen Spaces

With `includeFullscreen: false`, lists omit native fullscreen Spaces without renumbering the remaining indexes. An active fullscreen Space has `value` of `Fullscreen` and `fullscreen: true`, and retains its native `index` and `name`. Lists retain the other Spaces without highlighting the excluded Space. Use `{{^workspaces}}{{value}}{{/workspaces}}` for an empty-list fallback; `available` can still be true.

### Appearance {#state-appearance}

Symbols accept SF Symbol names or [font glyph objects](/sbar/configuration/appearance/#font-glyph-symbols). Use [`symbolFontWeight`](/sbar/configuration/appearance/#sf-symbol-weight) to set SF Symbol weight independently of text.

An item-level `symbol` overrides both state icons. `showSymbol: false` hides all symbols, including this override. Tints accept `#RRGGBB` or `#RRGGBBAA`; omitted tints inherit the normal item style. Icon-only items retain workspace or unavailable-state information in their accessibility label.

To change `yabai`, edit the configuration file. `sbar set` cannot change this block.

[Shared item options](/sbar/configuration/items/) cover styling, symbols, actions, priority, and enabled state.

### Text templates

Use the item-level `text` setting to customise the workspace label. See [text templates](/sbar/configuration/text-templates/) for syntax and collection rules.

Outside `{{#workspaces}}...{{/workspaces}}`, fields describe the current workspace selected by `scope`. Inside the loop, entry fields describe each workspace in order. `available` still describes the selected current workspace. With display scope, `active` can be true while `focused` is false when another display has focus.

| Field | Meaning |
| --- | --- |
| `name` | Yabai Space label, falling back to its Mission Control index |
| `index` | Original Mission Control index |
| `workspaceId` | Native Yabai Space ID |
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
  "id": "yabai",
  "type": "yabai",
  "text": "{{#workspaces}}{{#index=1}}Code{{/index}}{{^index=1}}{{name}}{{/index}}{{#separator}} · {{/separator}}{{/workspaces}}{{^workspaces}}{{value}}{{/workspaces}}",
  "yabai": { "scope": "display", "includeFullscreen": false }
}
```

For Spaces with indexes 1, 3, and 5 and no Yabai labels, this displays `Code · 3 · 5`. Indexes are not renumbered.

Yabai emphasises the globally focused entry and retains focused, visible, and inactive tints. Hover tint overrides entry colours. Separators use the inactive tint, or the item colour if none is set. They are never bold. Literal text inside the loop inherits the entry styling. Templates add no spacing or per-workspace click actions.

Unavailable snapshots have no current fields, `available: false`, and `total: 0`. Use `{{^workspaces}}{{value}}{{/workspaces}}` as an empty-list fallback.

Yabai retains original Mission Control indexes after filtering, so `index` is not a position within the displayed list. For example, index 5 can belong to a list of three Spaces. Use a label and a separate count instead:

```json
{
  "id": "yabai",
  "type": "yabai",
  "text": "{{#available}}{{value}} · {{total}} spaces{{/available}}{{^available}}{{value}}{{/available}}"
}
```

With the current Space labelled Code and three included Spaces, this displays `Code · 3 spaces`.

Scope selection, loops, and the default label use the same snapshot. Template conditions can hide entries without changing `index`, `total`, `first`, or `last`. Separators appear only between entries that render content. An inverse `workspaces` section tests whether the source list is empty, not whether conditions hid every entry.

Omit `text` for the current workspace label, or set `text: ""` for an icon alone. A `{{symbol}}` tag controls the single item icon, including inside a loop. If the template contains the tag, the icon appears only when a branch containing it renders; `showSymbol: false` still hides it.

## Updates

The provider polls every two seconds, independently of item refresh policies. Each CLI invocation has a two-second timeout. A snapshot queries displays, then Spaces, then displays again to verify the mapping. Incomplete snapshots receive up to three attempts while retaining the previous value. Polling waits for any running refresh to finish.

### Fresh queries on triggers

Manual and event triggers request fresh queries before capturing the completed result. The provider combines trigger bursts. Cancelled queries cannot publish stale results. Interval refresh captures the latest polled snapshot.

```json
{
  "id": "yabai",
  "type": "yabai",
  "refresh": { "mode": "manual" }
}
```

```sh
sbar trigger yabai
```

Existing Yabai signals can invoke this command for an item with manual or event refresh configured. Replace `yabai` with the item's ID, and add `--socket <path>` when targeting a custom bar socket. The bar does not install signals or change Yabai configuration. See [refresh policies](/sbar/configuration/refresh/).

## Current limits

Requires Yabai in PATH or a standard Homebrew bin directory. Missing installations display `Yabai not installed`; failed, malformed, or inconsistent reads display `Yabai unavailable` after retries. Standard output is parsed separately from diagnostics.

No executable-path override or built-in Space switching controls. Lists and labels reflect Yabai's reported state.

## Example

```json
{
  "id": "yabai",
  "type": "yabai",
  "text": "{{#workspaces}}{{name}}{{#separator}} · {{/separator}}{{/workspaces}}{{^workspaces}}{{value}}{{/workspaces}}",
  "yabai": {
    "includeFullscreen": false,
    "scope": "display",
    "tints": {
      "focused": "#FFFFFF",
      "visible": "#88CCFF",
      "inactive": "#888888"
    }
  }
}
```

This lists desktop Spaces on each bar's display, with the focused Space in bold. Lists are read-only.
