---
title: "AeroSpace"
description: "AeroSpace workspaces, with focused or per-display scope and custom labels."
weight: 18
category: "Workspaces"
cadence: "2-second polling"
options: "`aerospace` block"
---

## Output

The focused AeroSpace workspace name with a `rectangle.3.group` icon by default. Omitting the `aerospace` block is equivalent to `aerospace: {}`. Choose display scope to show the workspace on each bar's monitor. Use a `workspaces` loop to show multiple workspaces.

## Configuration

Use the item-level [`text` template](/sbar/configuration/text-templates/) to customise or hide the label.

Set these options inside `aerospace`.

| Property | Default | Description |
| --- | --- | --- |
| `showSymbol` | `true` | Show the state icon, including an item-level override. |
| `scope` | `focused` | `focused` spans all monitors; `display` uses each bar's display. |
| `symbols.font` | - | Shared installed font name for glyph symbols; each glyph can override it. |
| `symbols.size` | Resolved item/theme font size | Shared glyph size, 8 to 72 points; each glyph can override it. |
| `symbols.available` | `rectangle.3.group` | Available workspace state. |
| `symbols.unavailable` | `questionmark` | Missing or unavailable integration or display state. |
| `tints.focused` | Normal tint | Focused workspace; takes precedence over visible. |
| `tints.visible` | Normal tint | Visible workspace without focus. |
| `tints.inactive` | Normal tint | Other list entries. |
| `tints.unavailable` | Normal tint | Unavailable state. |

### Scope and labels {#scope-and-formats}

With `scope: "focused"`, the default label shows the focused workspace on every bar, and `workspaces` includes workspaces across all monitors. With `scope: "display"`, only that bar's monitor is included; the default label shows its visible workspace even when another monitor has focus. Lists emphasise the focused workspace in bold.

Use conditions on `name` or `workspaceId` to rename workspaces, or `index` to match their position in the scoped query order. The provider maps monitor indexes to display UUIDs during each query. A display-layout change during a query invalidates that result.

### Appearance {#state-appearance}

Symbols accept SF Symbol names or [font glyph objects](/sbar/configuration/appearance/#font-glyph-symbols). Use [`symbolFontWeight`](/sbar/configuration/appearance/#sf-symbol-weight) to set SF Symbol weight independently of text.

An item-level `symbol` overrides both state icons. `showSymbol: false` hides all symbols, including this override. Tints accept `#RRGGBB` or `#RRGGBBAA`; omitted tints inherit the normal item style. Icon-only items retain workspace or unavailable-state information in their accessibility label.

To change `aerospace`, edit the configuration file. `sbar set` cannot change this block.

[Shared item options](/sbar/configuration/items/) cover styling, symbols, actions, priority, and enabled state.

### Text templates

Use the item-level `text` setting to customise the workspace label. See [text templates](/sbar/configuration/text-templates/) for syntax and collection rules.

Outside `{{#workspaces}}...{{/workspaces}}`, fields describe the current workspace selected by `scope`. Inside the loop, entry fields describe each workspace in order. `available` still describes the selected current workspace. With display scope, `active` can be true while `focused` is false when another display has focus.

| Field | Meaning |
| --- | --- |
| `name` | Workspace name |
| `index` | Position in the scoped query order |
| `workspaceId` | AeroSpace workspace name |
| `total` | Number of entries in the selected scope |
| `active` | The current workspace for this item's scope |
| `focused` | The globally focused workspace |
| `visible` | Currently visible on a display |
| `fullscreen` | Always false |
| `available` | Whether the current workspace selected by scope is available; unchanged inside the loop |
| `first`, `last` | First/last entry in the source list, available inside a loop |
| `value` | Default current label outside a loop; entry name inside it |
| `id` | Item ID, including inside a loop |
| `workspaces` | Ordered workspace collection; use as a section |
| `separator` | Section for content between entries that render content |
| `symbol` | Requests the single native or configured item icon, not a per-workspace icon |

This displays the workspace named `web` as Web:

```json
{
  "id": "aerospace",
  "type": "aerospace",
  "text": "{{#workspaces}}{{#name=web}}Web{{/name}}{{^name=web}}{{name}}{{/name}}{{#separator}} · {{/separator}}{{/workspaces}}{{^workspaces}}{{value}}{{/workspaces}}",
  "aerospace": { "scope": "display" }
}
```

For workspaces named `code`, `web`, and `chat`, this displays `code · Web · chat`.

AeroSpace emphasises the globally focused entry and retains focused, visible, and inactive tints. Hover tint overrides entry colours. Separators use the inactive tint, or the item colour if none is set. They are never bold. Literal text inside the loop inherits the entry styling. Templates add no spacing or per-workspace click actions.

Unavailable snapshots have no current fields, `available: false`, and `total: 0`. Use `{{^workspaces}}{{value}}{{/workspaces}}` as an empty-list fallback.

To show the current position and total with a default-label fallback:

```json
{
  "id": "aerospace",
  "type": "aerospace",
  "text": "{{#index}}{{index}} / {{total}}{{/index}}{{^index}}{{value}}{{/index}}"
}
```

For the second workspace in a list of four, this displays `2 / 4`. When `index` is missing, it keeps the default label.

Scope selection, loops, and the default label use the same snapshot. Template conditions can hide entries without changing `index`, `total`, `first`, or `last`. Separators appear only between entries that render content. An inverse `workspaces` section tests whether the source list is empty, not whether conditions hid every entry.

Omit `text` for the current workspace label, or set `text: ""` for an icon alone. A `{{symbol}}` tag controls the single item icon, including inside a loop. If the template contains the tag, the icon appears only when a branch containing it renders; `showSymbol: false` still hides it.

## Updates

The provider polls every two seconds, with a two-second query timeout. Background queries run independently of item refresh policies. Interval refresh captures the latest polled snapshot.

### Fresh queries on triggers

Manual and event triggers request a fresh AeroSpace query and capture its completed snapshot. The provider combines trigger bursts into one query. If a newer query replaces it, the older query cannot overwrite the result. Configure a manual or event refresh policy to use this behaviour:

```json
{
  "id": "aerospace",
  "type": "aerospace",
  "refresh": { "mode": "manual" }
}
```

```sh
sbar trigger aerospace
```

Call this command from an existing AeroSpace workspace-change callback to update the bar without waiting for the next poll. Replace `aerospace` with the item's ID, and add `--socket <path>` when targeting a custom bar socket. The bar does not modify AeroSpace configuration. See [refresh policies](/sbar/configuration/refresh/) for shared snapshot behaviour.

## Current limits

Requires AeroSpace in PATH or a standard Homebrew bin directory. The installed CLI must support `list-workspaces --all --json --format` with `workspace`, `workspace-is-focused`, `workspace-is-visible`, and `monitor-appkit-nsscreen-screens-id` fields.

Missing installations display `Aerospace not installed`. Failed, empty, malformed, or incompatible output displays `Aerospace unavailable`; unavailable display state also uses that message. No executable-path override or built-in workspace switching control.

## Example

```json
{
  "id": "aerospace",
  "type": "aerospace",
  "text": "{{#workspaces}}{{name}}{{#separator}} · {{/separator}}{{/workspaces}}{{^workspaces}}{{value}}{{/workspaces}}",
  "aerospace": {
    "scope": "display",
    "tints": {
      "focused": "#FFFFFF",
      "visible": "#88CCFF",
      "inactive": "#888888"
    }
  }
}
```

This lists workspaces on each bar's display, with the focused workspace in bold. Lists are read-only.
