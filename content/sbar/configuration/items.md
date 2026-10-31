---
title: "Shared item options"
description: "Identity, layout, actions, and the options shared by providers."
weight: 2
---

Place items in `items.left`, `items.center`, or `items.right` in display order. Omitted sections are empty. Item snippets on provider pages belong inside one of these arrays.

## Properties

| Property | Default | Description |
| --- | --- | --- |
| `id` | Required | Nonblank string, unique across all sections and nested children. |
| `type` | Required | One of the [documented item types](/sbar/providers/). |
| `enabled` | `true` | Disable an item; disabled containers also disable their child providers. |
| `text` | - | [Text template](/sbar/configuration/text-templates/) or fixed string; sets the displayed label. Empty text hides the label; omitted or `null` preserves it. Not supported by groups, dividers, or spacers. |
| `symbol` | - | SF Symbol name or font glyph object. Use [template symbol conditions](/sbar/configuration/text-templates/#symbols-visibility-and-accessibility) to control when it appears. Ignored by groups, dividers, and spacers. With `frontApplication.showIcon`, it is a fallback when the native icon is unavailable. |
| `symbolPosition` | `left` | `left` or `right`; places symbols and application icons on that side of the text. `null` uses the default. See [symbol placement](/sbar/configuration/appearance/#symbol-placement). |
| `priority` | `0` | Integer. Higher values stay visible longer during overflow. |
| `style` | Inherit theme | [Colours, hover appearance, font, padding, corners, and widths](/sbar/configuration/appearance/). |
| `refresh` | Provider behaviour | [Event, interval, or manual snapshots](/sbar/configuration/refresh/). |
| `primaryAction` | - | Action on click. |
| `secondaryAction` | - | Action in the context menu. |
| `popup` | - | Text to show in a popover. |
| `format` | - | [Date and time](/sbar/providers/datetime/) Unicode pattern; nonempty values override both styles. |
| `dateStyle` | `none` | Localised date style for `datetime`: `none`, `short`, `medium`, `long`, or `full`. |
| `timeStyle` | `short` | Localised time style for `datetime`: `none`, `short`, `medium`, `long`, or `full`. |
| `children` | Empty | Items for a group or popup. |
| `itemSpacing` | `4` | Group-only gap between children, 0 to 96 points. |
| `childStyle` | Inherit parent defaults | Group-only style defaults for children. Each child's `style` takes precedence. |
| `frontApplication` | - | [Native application icon](/sbar/providers/frontapplication/) configuration. |
| `aerospace`, `audioDevice`, `battery`, `bluetooth`, `cpu`, `disk`, `media`, `memory`, `mail`, `network`, `spaces`, `throughput`, `volume`, `vpn`, `weather`, `yabai` | - | Provider settings for data, appearance, and visibility. |
| `command`, `plugin` | - | Required process settings for the corresponding type. |

The [Mail provider](/sbar/providers/mail/) accepts a `mail` block to configure polling.

## Actions

Set `primaryAction` to run an action on click, or `secondaryAction` to add it to the context menu. Each action needs a `kind` and `value`. The kind can be `command`, `url`, or `application`. URL actions allow HTTP, HTTPS, and mailto. Application values are bundle IDs or paths. URL and application paths support `${NAME}` and `~` expansion. Shell actions use `/bin/sh -c` and inherit the environment.

```json
{
  "id": "settings",
  "type": "text",
  "primaryAction": {
    "kind": "application",
    "value": "com.apple.systempreferences"
  },
  "secondaryAction": {
    "kind": "command",
    "value": "open -a 'Activity Monitor'"
  },
  "text": "Settings"
}
```

Shell actions have a five-second timeout and a 64 KB combined stdout/stderr limit. They do not display command output in the item; use a [command item](/sbar/providers/command/) for that. Inspect action failures with `sbar query --diagnostics`.

If an item has both a primary action and a popover, clicking it runs the action and opens or closes the popover. Groups render inline children, so put primary actions on the child items.

Items with either action or a popup show a hover highlight. Set [hover colours](/sbar/configuration/appearance/#hover-colours) to customise their text, symbols, and background.

## Containers and overflow

`group` items render `children` in a row in horizontal bars and a column in side bars. `popup` items show `children` when clicked; any item can also have a `popup` text string. Groups nest up to eight levels. Disabling a group disables its child providers.

A popup's visible label defaults to its item ID. Child providers run while the container is enabled, even when its popover is closed. A container's `style` applies to the container itself. Use `theme.itemStyle` for child defaults, a group's `childStyle` for inherited overrides, and each child's `style` for its own overrides.

Set `symbolPosition` on each child that needs it. Children do not inherit their container's placement.

```json
{
  "id": "system",
  "type": "popup",
  "children": [
    {
      "id": "cpu",
      "type": "cpu"
    },
    {
      "id": "memory",
      "type": "memory"
    }
  ],
  "text": "System"
}
```

### Group spacing

Use `itemSpacing` to set the gap between children and `childStyle` to set their shared style.

Set `itemSpacing` on a group to change the gap between its children. It accepts 0 to 96 points and defaults to 4. Nested groups use their own spacing. Theme and region `itemSpacing` settings control the gaps between top-level items.

Children inherit padding, width, and other styles from `theme.itemStyle`. Use the group's `childStyle` to override those defaults for all its children. A child's own `style` overrides matching fields in `childStyle`. Nested groups inherit these defaults and can set their own `childStyle`.

To keep symbols close together, remove child padding with `childStyle.horizontalPadding: 0`:

```json
{
  "id": "status",
  "type": "group",
  "itemSpacing": 2,
  "childStyle": { "horizontalPadding": 0 },
  "children": [
    {
      "id": "volume",
      "type": "volume",
      "text": ""
    },
    {
      "id": "network",
      "type": "network",
      "text": ""
    },
    {
      "id": "battery",
      "type": "battery",
      "text": ""
    }
  ]
}
```

Use the group's `style.horizontalPadding` to add space around the whole group. If the theme sets `minWidth`, set `childStyle.minWidth` to `0` to let children shrink to their content. A fixed `width` still takes precedence over `minWidth`.

### Overflow

Horizontal bars measure item widths; side bars measure item heights. Popovers open towards the middle of the display and keep their items horizontal.

Disabled items and items hidden by their provider take no layout space or inter-item spacing and do not appear in overflow. Hidden children are also excluded from groups and popovers. A group with no visible children is hidden, including an empty group or one that contains only hidden nested groups. Items hidden by a provider keep updating while enabled, so they can reappear when their state changes.

Each region moves low-priority items into an overflow popover when space runs out. Horizontal bars also allow flexible text to compress. Larger `priority` values remain visible longer; equal priorities hide from the end. The centre reserves one third of the bar length when populated. When a top bar crosses a notch, the centre and right sections share the usable right-hand area. Bar content stays clipped within its own region.

[`style.minWidth` and `style.width`](/sbar/configuration/appearance/#item-widths) reserve horizontal space during overflow selection. Fixed-width items retain that width; their long labels truncate instead of shrinking the reserved space.

### Dividers and spacers

A `divider` draws a separator across the bar. A `spacer` adds flexible empty space along it. Both require an `id` and `type`, and neither displays a label or symbol:

```json
{
  "schemaVersion": 1,
  "bar": {},
  "items": {
    "left": [
      {
        "id": "title",
        "type": "text",
        "text": "Work"
      },
      {
        "id": "gap",
        "type": "spacer"
      },
      {
        "id": "separator",
        "type": "divider"
      },
      {
        "id": "app",
        "type": "frontApplication"
      }
    ]
  }
}
```
