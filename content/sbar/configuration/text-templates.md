---
title: "Text templates"
description: "Customise item labels with provider values and conditional sections."
weight: 4
---

Set an item's `text` to replace its displayed label. Use a plain string for fixed text, or insert provider values with `{{field}}`. Omit `text` or set it to `null` to keep the default label and icons.

```json
{
  "id": "cpu",
  "type": "cpu",
  "text": "CPU {{percentage}}%"
}
```

An empty string hides the text without hiding the item or removing its padding. Item symbols, provider symbols, and native application icons remain visible. Throughput direction icons require a `transfers` loop with `{{symbol}}`. Groups, dividers, and spacers reject `text`. For a group, set templates on its children instead.

## Values and sections

| Syntax | Result |
| --- | --- |
| `{{field}}` | Insert a value; a missing value becomes an empty string. |
| `{{#field}}...{{/field}}` | Include the contents when the value is present. |
| `{{^field}}...{{/field}}` | Include the contents when the value is missing, empty, or `false`. |

Spaces around a tag are allowed, for example `{{ percentage }}`. Templates insert values as plain text, without HTML escaping or evaluating tags inside those values. An empty value or the literal value `false` counts as absent. Numeric zero counts as present, so a section around `unreadCount` also matches zero unread messages. Sections can nest up to eight levels.

Presence sections test whether a value exists. Equality sections compare a value with an expected string.

### Missing readings

Use `available` to avoid displaying an incomplete value while a reading is missing:

```json
{
  "id": "memory",
  "type": "memory",
  "text": "{{#available}}RAM {{used}} / {{total}}{{/available}}{{^available}}RAM unavailable{{/available}}"
}
```

### Optional metadata

Put a separator inside a section so it appears only with the corresponding metadata:

```json
{
  "id": "media",
  "type": "media",
  "text": "{{#artist}}{{artist}}: {{/artist}}{{title}}{{^title}}Nothing playing{{/title}}"
}
```

Provider hide rules still apply. For example, `media.hideWhenNotPlaying: true` hides this item during paused, stopped, or unavailable playback even if the template produces text.

### Keep the default label as a fallback

`value` contains the provider's default label, including error messages:

```json
{
  "id": "mail",
  "type": "mail",
  "text": "{{#available}}Inbox: {{unreadCount}}{{/available}}{{^available}}{{value}}{{/available}}"
}
```

## State-specific labels

Equality sections select a label for a particular state. Close them with the field name alone:

```json
{
  "id": "vpn",
  "type": "vpn",
  "text": "{{#status=connected}}Secure{{/status}}{{^status=connected}}{{value}}{{/status}}"
}
```

`{{#status=connected}}` includes its contents when the status equals `connected`.
`{{^status=connected}}` includes its contents when the status differs or is missing.
The example keeps the default provider label for every other state. Sections can
nest, including conditions on the same field.

Comparisons use case-sensitive strings. Whitespace around the field,
`=`, and expected value is ignored. Expected values are unquoted text, so
`{{#title=A song}}...{{/title}}` matches that exact title. Numeric values compare
their formatted strings; there are no arithmetic or ordering comparisons. Empty
expected values are rejected; use `{{^field}}` to handle empty or missing fields.
Boolean comparisons accept `true` and `false`. Booleans render as `true` or `false`.

Configuration validation checks the allowed status values for each provider. For example,
`{{#status=conected}}` fails configuration validation rather than silently hiding text.

See the [provider references below](#provider-fields) for accepted states and field meanings.

## Workspace fields and lists

See [Spaces](/sbar/providers/spaces/#text-templates), [AeroSpace](/sbar/providers/aerospace/#text-templates), and [Yabai](/sbar/providers/yabai/#text-templates) for workspace fields, loop examples, scope, and entry styling.

## VPN services and Bluetooth devices

See [VPN services](/sbar/providers/vpn/#text-templates) and [Bluetooth devices](/sbar/providers/bluetooth/#text-templates) for collection fields, examples, and aggregate state behaviour.

## Throughput fields and symbols

See [throughput templates](/sbar/providers/throughput/#text-templates) for rate fields, direction conditions, and icon examples.

## Collection rules

Collections cannot nest, be compared, or be inserted as scalar values. Each provider accepts only its own collection. Agent activity exposes a [`sessions` collection](/sbar/providers/agent-activity/#filters-templates-and-appearance). `{{#separator}}...{{/separator}}` is valid only inside a collection, with no inverse, comparison, or scalar form. `{{symbol}}` is a shared value tag, valid inside or outside a collection. It cannot be used as a section or comparison.

Separators appear only between entries that render content. Entries that produce only a separator are omitted. Whitespace and symbol tags count as content, so keep literal spaces inside the condition when hiding an entry. Write spaces explicitly; templates add no spacing between runs.

`first`, `last`, `index`, and `total` still describe the source list. An inverse collection section tests whether that source list is empty, not whether conditions hid every entry. Multiple loops may appear beside one another; each renders independently.

### Filter a list without stray separators

This shows visible workspaces, with separators only between entries that render:

```json
{
  "id": "spaces",
  "type": "spaces",
  "text": "{{#workspaces}}{{#visible}}{{name}}{{/visible}}{{#separator}} · {{/separator}}{{/workspaces}}{{^workspaces}}{{value}}{{/workspaces}}"
}
```

Use the `separator` section for punctuation after filtering. A condition such as `{{^last}}, {{/last}}` uses the source position and can leave a trailing comma when the final source entry is hidden.

## Provider fields

Every item that accepts `text` supports `id`, `value`, and `symbol`. `id` is the item's configuration ID. `value` is the provider's default label. `symbol` requests its native icon or the item's configured symbol. Use the template to choose individual fields or `text: ""` to hide the label.

Provider pages define their fields, accepted states, and examples:

- [Date and time](/sbar/providers/datetime/#text-templates)
- [Front application](/sbar/providers/frontapplication/#text-templates)
- [Battery](/sbar/providers/battery/#text-templates)
- [Volume](/sbar/providers/volume/#text-templates)
- [Audio devices](/sbar/providers/audiodevice/#text-templates)
- [Calendar](/sbar/providers/calendar/#text-templates)
- [Reminders](/sbar/providers/reminders/#templates-and-appearance)
- [Pomodoro](/sbar/providers/pomodoro/#presentation-and-templates)
- [Agent activity](/sbar/providers/agent-activity/#filters-templates-and-appearance)
- [Mail](/sbar/providers/mail/#text-templates)
- [Network](/sbar/providers/network/#text-templates)
- [Weather](/sbar/providers/weather/#text-templates)
- [VPN](/sbar/providers/vpn/#text-templates)
- [Bluetooth](/sbar/providers/bluetooth/#text-templates)
- [CPU](/sbar/providers/cpu/#text-templates)
- [Memory](/sbar/providers/memory/#text-templates)
- [Disk](/sbar/providers/disk/#text-templates)
- [Throughput](/sbar/providers/throughput/#text-templates)
- [Media](/sbar/providers/media/#text-templates)
- [Spaces](/sbar/providers/spaces/#text-templates)
- [AeroSpace](/sbar/providers/aerospace/#text-templates)
- [Yabai](/sbar/providers/yabai/#text-templates)
- [Shell command](/sbar/providers/command/#text-templates)
- [Process plugin](/sbar/providers/plugin/#text-templates)

Static `text` and `popup` items have no additional fields.

Fields follow the item's media source, audio endpoint, disk path, network interface, weather units, and CPU/throughput smoothing settings. They also use its [refresh snapshot](/sbar/configuration/refresh/). Editing the template changes how a held reading appears without refreshing it.

## Symbols, visibility, and accessibility

`{{symbol}}` requests the provider's native symbol or the item's explicit symbol. It displays the icon itself. The icon follows `symbolPosition`, regardless of where the tag appears. Repeated tags retain one aggregate icon. Throughput loops can render one direction icon per run.

Without a symbol tag, templates retain the provider's normal icon behaviour. Once a template contains a symbol tag anywhere, the icon appears only if a branch containing that tag renders. Throughput direction icons always require a tag inside `transfers` when using an explicit template.

### Show an icon conditionally

This shows the battery icon only while charging, with a fallback label when no percentage is available:

```json
{
  "id": "battery",
  "type": "battery",
  "text": "{{#charging}}{{symbol}}{{/charging}}{{#available}}{{percentage}}%{{/available}}{{^available}}{{value}}{{/available}}",
  "symbolPosition": "right"
}
```

At 50% while charging, the text is `50%` with the icon on the right. On battery power, the same text has no icon. Removing the symbol tag entirely restores the normal battery icon behaviour.

Provider `showSymbol: false` still hides symbols. A symbol tag does not create an icon for a provider that has none. Workspace, VPN, and Bluetooth loops retain one aggregate icon, even if several entries render the tag. Use provider state conditions around `{{symbol}}`; `{{#symbol}}` and `{{#symbol=...}}` are invalid.

### Conditional application icons

See [front application templates](/sbar/providers/frontapplication/#text-templates) for conditional native icons and the `showIcon` option.

### Icon-only templates

Use `{{symbol}}` alone to request an icon without text:

```json
{
  "id": "volume",
  "type": "volume",
  "text": "{{symbol}}"
}
```

An empty template also retains ordinary provider icons, but hides throughput direction icons. For those, use the [directional icon-only example](/sbar/providers/throughput/#text-templates).

Workspace loops retain each entry's colour and emphasis. Throughput `transfers` loops retain direction icons when they include `{{symbol}}`; scalar rate fields render text alone. An item-level symbol supplies one shared icon. See [throughput visibility](/sbar/providers/throughput/#units-and-visibility) for symbol overrides and empty templates.

Item symbols, native application icons, item colours, and provider hide rules still apply. Native providers retain their existing accessibility descriptions. Command and plugin accessibility descriptions also remain unchanged. Static, popup, application, and clock labels use the rendered text.

## Validation and runtime changes

Unknown fields, unmatched tags, unclosed sections, and nesting beyond eight levels fail `sbar validate`. Collections used as values, nested collections, separator tags outside a collection, and symbol sections also fail validation. Fields must belong to the item's type, so `{{artist}}` is invalid on a CPU item. A failed reload retains the previous valid configuration.

Edit `text` in the configuration file and let it reload. `sbar set` cannot change it. Templates affect displayed labels only; CLI values and subscription events keep their existing output. A `text` field returned by a command or plugin is result data, not a template.

### Validate and try a template

Save a complete configuration and validate it before running the bar:

```sh
sbar validate --config "$PWD/config.json"
sbar start --config "$PWD/config.json"
```

The JSON item examples on this page belong inside `items.left`, `items.center`, or `items.right`. For example:

```json
{
  "schemaVersion": 1,
  "bar": {},
  "items": {
    "right": [
      {
        "id": "cpu",
        "type": "cpu",
        "text": "{{#available}}{{symbol}}CPU {{percentage}}%{{/available}}{{^available}}{{value}}{{/available}}"
      }
    ]
  }
}
```

Check each condition with matching and non-matching values on the Mac running the bar. Connect and disconnect a VPN service, switch Spaces, or change the foreground application to exercise the relevant example. For throughput, check active transfers, zero rates, and unavailable readings. Zero remains an available reading.

With manual refresh, the label and conditional icon use the held snapshot. Change the underlying state, then run `sbar trigger <item-id>` to capture it. Editing `text` alone renders the held values again. See [refresh policies](/sbar/configuration/refresh/) for interval and event behaviour.

## Current limits

There are no custom number formatters, arbitrary command/plugin JSON field lookups, or escapes for literal `{{`.

See [command templates](/sbar/providers/command/#text-templates), [plugin templates](/sbar/providers/plugin/#text-templates), and [date formatting](/sbar/providers/datetime/#text-templates) for result and formatting behaviour.
