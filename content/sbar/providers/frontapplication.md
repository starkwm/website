---
title: "Front application"
description: "The name of the application owning the menu bar, with an optional native colour icon."
weight: 3
category: "Desktop"
cadence: "Native events"
options: "`frontApplication` block"
---

## Output

The name of the application owning the menu bar, with an optional native colour icon.

The provider follows menu-bar ownership, not keyboard focus. A temporary launcher leaves the underlying application's name and icon in place while that application still owns the menu bar.

## Configuration

Use the item-level [`text` template](/sbar/configuration/text-templates/) to customise or hide the label.

| Property | Default | Description |
| --- | --- | --- |
| `text` | Menu-bar owner's name | Fixed text or a template replacing the name; use `""` for an icon-only item. |
| `frontApplication.showIcon` | `false` | Show the menu-bar owner's native colour icon. |

Change `frontApplication.showIcon` in the configuration file and let it reload. The `frontApplication` block cannot be changed with `sbar set`.

### Appearance {#icon-appearance}

The native icon replaces the item's `symbol`. If macOS provides no icon, the item uses its configured symbol as a fallback. The icon retains its original colours. Its size follows `style.fontSize`, then the theme font size. There is no separate icon-size option. Item tint and `symbolFontWeight` do not recolour or change the weight of the native image; they still apply to an SF Symbol fallback.

Set the item's `symbolPosition` to `right` to put the icon after the application name. It defaults to `left` and also controls the fallback symbol. See [symbol placement](/sbar/configuration/appearance/#symbol-placement).

### Icon-only item

```json
{
  "id": "app",
  "type": "frontApplication",
  "symbol": "app",
  "frontApplication": {
    "showIcon": true
  },
  "text": ""
}
```

The empty `text` hides the application name. The configured SF Symbol provides a fallback when the native icon is unavailable.

[Shared item options](/sbar/configuration/items/) cover styling, symbols, actions, priority, and enabled state.

### Text templates

The item-level `text` setting supports `id`, `value`, `symbol`, `name`. See [text templates](/sbar/configuration/text-templates/) for shared fields and syntax. `name` and `value` both contain the menu-bar owner's name, even when `text` supplies a fixed label. Both are empty when macOS supplies no name.

Templates without `{{symbol}}` retain the normal icon behaviour. If a template contains that tag, the native icon or fallback symbol appears only when a branch containing the tag renders. Native icons still require `frontApplication.showIcon: true`.

To show the native icon only for Safari, enable `frontApplication.showIcon` and put `{{symbol}}` inside a name condition:

```json
{
  "id": "application",
  "type": "frontApplication",
  "text": "{{#name=Safari}}{{symbol}}{{/name}}{{name}}",
  "frontApplication": { "showIcon": true }
}
```

The application name always appears, but its native icon appears only for Safari. The configured item symbol remains the fallback if the native icon is unavailable.

## Updates

The provider reads the menu-bar owner at startup, then observes changes to that ownership. The icon and name follow the refresh policy together, including interval and manual snapshots. See [refresh policies](/sbar/configuration/refresh/) for snapshot and trigger behaviour.

## Current limits

There is no window-title option.

## Example

```json
{
  "id": "frontApplication",
  "type": "frontApplication",
  "frontApplication": { "showIcon": true }
}
```
