---
title: "Appearance"
description: "Theme defaults, per-item overrides, and custom symbols."
weight: 3
---

The optional top-level `theme` sets bar appearance and default item styling. Each item's `style` overrides individual theme fields. Groups can supply intermediate defaults through [`childStyle`](/sbar/configuration/items/#group-spacing). Omitted or `null` fields inherit from the theme. Zero padding and transparent colours override inherited values.

## Example

```json
{
  "schemaVersion": 1,
  "bar": {},
  "theme": {
    "background": "#18202EEE",
    "horizontalPadding": 12,
    "itemSpacing": 8,
    "itemStyle": {
      "tint": "#E5E9F0",
      "fontSize": 13,
      "fontWeight": "medium",
      "horizontalPadding": 6,
      "verticalPadding": 2,
      "cornerRadius": 4
    }
  },
  "items": {
    "right": [
      {
        "id": "clock",
        "type": "datetime",
        "symbol": "clock",
        "format": "HH:mm",
        "style": { "tint": "#88C0D0", "background": "#FFFFFF18" }
      }
    ]
  }
}
```

## Theme and item styles

Colours use `#RRGGBB` or `#RRGGBBAA`, with alpha last. An omitted bar background uses the system material. An omitted item tint uses the system primary colour; item backgrounds default to transparent. Use `#00000000` to clear an inherited background.

Set these properties inside `theme`:

| Property | Default | Description |
| --- | --- | --- |
| `background` | System material | Bar background colour. |
| `horizontalPadding` | `10` | Left and right content padding, from 0 to 96 points. |
| `verticalPadding` | `0` | Top and bottom content padding, from 0 to 48 points. |
| `cornerRadius` | `0` | Bar corner radius, from 0 to 48 points. |
| `itemSpacing` | `10` | Space between items in a bar region, from 0 to 96 points. |
| `regionStyle` | Defaults below | Shared style for the left, centre, and right regions. |
| `regions` | Inherit `regionStyle` | Per-region `left`, `center`, and `right` overrides. |
| `itemStyle` | Defaults below | Default style for individual items. |

Set these properties inside `theme.itemStyle` or an item's `style`:

| Property | Default | Description |
| --- | --- | --- |
| `tint` | System primary colour | Text and symbol colour. |
| `background` | Transparent | Item background colour. |
| `hoverTint` | Normal tint | Text and symbol colour while the pointer is over an interactive item. |
| `hoverBackground` | Subtle highlight | Background while the pointer is over an interactive item. |
| `fontFamily` | System font | Unreleased. Installed font family or font name for item text. |
| `fontSize` | `13` | Font size, from 8 to 72 points. |
| `fontWeight` | `regular` | `regular`, `medium`, `semibold`, or `bold`. |
| `symbolFontWeight` | Text weight | The same weights, applied to SF Symbols. |
| `horizontalPadding` | `0` | Left and right padding, from 0 to 96 points. |
| `verticalPadding` | `0` | Top and bottom padding, from 0 to 48 points. |
| `cornerRadius` | `0` | Rounded corners, from 0 to 48 points. |
| `minWidth` | - | Minimum item width, from 0 to 4096 points, including symbols, text, and padding. |
| `width` | - | Fixed item width, from 0 to 4096 points; takes precedence over `minWidth`. |
| `alignment` | `center` | Content alignment within the item width: `leading`, `center`, or `trailing`. |

Bar padding sits inside its configured height or width. Styling does not increase the bar's thickness, and content that exceeds its bar region is clipped. Bar corners clip both the background and content. See [bar settings](/sbar/configuration/#bar-settings) for height and margins, and [shadows](/sbar/configuration/#shadows) for `bar.shadow`.

## Text fonts

`fontFamily` requires an unreleased build from `main`. v0.0.1 uses the system font for text; custom font glyph symbols are supported in that release. See [release compatibility](/sbar/#release-compatibility).

Set `fontFamily` in `theme.itemStyle` to choose the default text font. Set it in an item's `style` to override that default:

```json
{
  "schemaVersion": 1,
  "bar": {},
  "theme": {
    "itemStyle": {
      "fontFamily": "Menlo",
      "fontSize": 13,
      "fontWeight": "medium"
    }
  },
  "items": {
    "left": [
      {
        "id": "app",
        "type": "frontApplication",
        "style": { "fontFamily": "Helvetica Neue" }
      }
    ],
    "right": [
      { "id": "clock", "type": "datetime", "format": "HH:mm" }
    ]
  }
}
```

The clock uses Menlo; the application name uses Helvetica Neue. Both inherit the theme's font size and weight. Use a font family or font name installed on your Mac.

Omitted or `null` values inherit the theme font. Without a theme font, text uses the system font. `fontSize` and `fontWeight` still apply independently. Custom [font glyph symbols](#font-glyph-symbols) keep their own `font`; they do not use `fontFamily`.

## Region backgrounds

Set `theme.regionStyle` to style all three bar regions. Use `theme.regions.left`, `theme.regions.center`, and `theme.regions.right` for individual overrides. Each property inherits separately when omitted or `null`. A zero value or transparent colour overrides the shared setting.

```json
{
  "schemaVersion": 1,
  "bar": { "shadow": false },
  "theme": {
    "background": "#00000000",
    "verticalPadding": 4,
    "regionStyle": {
      "background": "#1A1B26",
      "cornerRadius": 8,
      "horizontalPadding": 10,
      "verticalPadding": 2,
      "borderColor": "#414868",
      "borderWidth": 1
    },
    "regions": {
      "center": { "background": "#24283B" },
      "right": { "cornerRadius": 12 }
    }
  },
  "items": {
    "left": [{ "id": "app", "type": "frontApplication" }],
    "right": [{ "id": "clock", "type": "datetime", "format": "HH:mm" }]
  }
}
```

Set these properties inside `theme.regionStyle` or a region override:

| Property | Default | Description |
| --- | --- | --- |
| `background` | Transparent | Region background colour. |
| `borderColor` | Transparent | Region border colour. |
| `borderWidth` | `0` | Inset border width, from 0 to 48 points. |
| `cornerRadius` | `0` | Region corner radius, from 0 to 48 points. |
| `horizontalPadding` | `0` | Left and right padding, from 0 to 96 points. |
| `verticalPadding` | `0` | Top and bottom padding, from 0 to 48 points. |
| `itemSpacing` | Theme spacing, then `10` | Space between items, from 0 to 96 points. |

Region backgrounds fit their visible items, padding, and overflow button. A flexible spacer can expand a region to its allocated width. Empty regions draw nothing, including regions whose items are all hidden. Alignment and notch placement do not change.

Padding reduces the room available to items and may move them into overflow. sbar limits padding to half the allocated width or height. Regions stay within the bar bounds, and oversized content remains clipped. Borders draw inside the region bounds. Region decoration adds no click targets, so mouse pass-through still uses item bounds.

The whole-bar background and corner radius still apply. Use a transparent `theme.background` and disable `bar.shadow` for separate floating regions. Region shadows and material backgrounds are not supported. See the complete [sections example](https://github.com/starkwm/sbar/tree/v0.0.1/examples/sections).

## Hover colours

Set `hoverTint` and `hoverBackground` in `theme.itemStyle` for defaults, or in an item's `style` for overrides. Hover colours apply to items with a primary action, secondary action, or popup:

```json
{
  "schemaVersion": 1,
  "bar": {},
  "theme": {
    "itemStyle": {
      "horizontalPadding": 8,
      "verticalPadding": 4,
      "cornerRadius": 7,
      "hoverTint": "#FFFFFF",
      "hoverBackground": "#3B4261"
    }
  },
  "items": {
    "right": [
      {
        "id": "cpu",
        "type": "cpu",
        "primaryAction": { "kind": "application", "value": "com.apple.ActivityMonitor" },
        "style": { "background": "#292E42", "hoverBackground": "#414868" }
      }
    ]
  }
}
```

Both colours accept `#RRGGBB` and `#RRGGBBAA`. Each inherits independently from the theme when omitted or `null`. `hoverTint` overrides normal text and symbol colours, including provider state and segment tints. Native application icons retain their original colours. Without a hover tint, normal colours remain.

`hoverBackground` replaces the normal background during hover. Set it to `#00000000` to clear the background, or to the normal background colour to keep it unchanged. Without a hover background, the item adds a highlight using the system primary colour at 8% opacity over its normal background.

The hover background covers the item's full width and padding and uses its corner radius. Non-interactive items do not change on hover. See [actions](/sbar/configuration/items/#actions) for click and context-menu behaviour.

## Item widths

Use `minWidth` to reserve space for changing values while allowing longer content to grow:

```json
{
  "id": "battery",
  "type": "battery",
  "style": { "minWidth": 80, "alignment": "trailing" }
}
```

This item stays at least 80 points wide. Choose a minimum that fits the longest expected value to avoid shifting nearby items.

Use `width` to keep an item at a fixed width:

```json
{
  "id": "app",
  "type": "frontApplication",
  "style": { "width": 160, "alignment": "leading" }
}
```

Fixed-width labels stay on one line and truncate at the end. Other content that cannot fit, such as a large symbol or group, is clipped to the item bounds. `width` takes precedence over `minWidth`, including inherited values.

Both widths accept 0 to 4096 points and include symbols, text, and padding. `alignment` accepts `leading`, `center`, or `trailing` and defaults to `center`. Backgrounds and hover areas cover the reserved width. [Overflow selection](/sbar/configuration/items/#overflow) respects that space.

These fields also work in `theme.itemStyle`. Each inherits independently when omitted or `null`. Set `minWidth` to `0` to clear an inherited minimum. Setting `width` to `0` reserves no width; `null` inherits the theme's fixed width. Without either width setting, items size to their content.

## Symbol placement

Set `symbolPosition` on an item to place its symbol to the `left` or `right` of its text:

```json
{
  "id": "battery",
  "type": "battery",
  "symbolPosition": "right"
}
```

This puts the battery state icon after the percentage. The default is `left`; omitting the setting or using `null` keeps that placement.

Placement applies to SF Symbols, custom font glyphs, provider state and result symbols, and [native application icons](/sbar/providers/frontapplication/#icon-appearance). Existing symbol overrides and visibility settings still apply.

For providers with multiple segments, each symbol moves beside its own text while the segments keep their order. [Throughput](/sbar/providers/throughput/) still shows download before upload when both arrows are on the right. An item-level symbol override sits beside the combined content.

Set placement directly on each item, including children inside groups and popovers. It is not a `style` or theme setting, and children do not inherit it. Groups, dividers, and spacers do not display symbols.

Change `symbolPosition` in the configuration file and let it reload. `sbar set` cannot change this property.

## SF Symbol weight

Use `symbolFontWeight` in `theme.itemStyle` or an item's `style` to set SF Symbol weight independently of text. It accepts `regular`, `medium`, `semibold`, or `bold`.

```json
{
  "id": "clock",
  "type": "datetime",
  "symbol": "clock",
  "format": "HH:mm",
  "style": { "fontWeight": "regular", "symbolFontWeight": "bold" }
}
```

An item's `symbolFontWeight` overrides the theme's symbol weight. Omitted or `null` values inherit the theme setting; when neither sets `symbolFontWeight`, symbols inherit the resolved text weight. Changing an item's `fontWeight` does not override an explicit theme symbol weight.

This applies to every provider's SF Symbols, including state and result symbols. Font glyph objects retain their custom font and are unaffected by `symbolFontWeight`.

## Font glyph symbols

Every `symbol` accepts either an SF Symbol name or a glyph object. Install the font on your Mac first and use its font name:

```json
{
  "id": "wifi",
  "type": "network",
  "network": {
    "interface": "wifi",
    "symbols": {
      "font": "Symbols Nerd Font Mono",
      "wifi": {
        "glyph": ""
      },
      "offline": "wifi.slash"
    }
  },
  "text": ""
}
```

Set `glyph` to literal text or a JSON Unicode escape. Set `font` to the installed font name. The optional `size` accepts 8 to 72 points. Without `size`, glyphs use the item or theme font size. Only the symbol uses this font; item text uses the resolved `fontFamily` or the system font. Missing fonts or glyphs use macOS font fallback, which may display a missing-character box. You can mix SF Symbol strings with glyph objects.

An item-level glyph needs its own font:

```json
{
  "id": "clock",
  "type": "datetime",
  "symbol": { "glyph": "T", "font": "Menlo", "size": 14 },
  "format": "HH:mm"
}
```

Within any provider's `symbols` block, glyphs can inherit `font` and `size` from that block. Each glyph can override either value. A glyph must set a font or inherit one. SF Symbol strings ignore these font settings. Glyphs returned by commands and plugins must include their own font; they do not inherit the configured symbol font.

Battery `symbols.levels` and optional `symbols.chargingLevels` each accept exactly five symbols, ordered 0%, 25%, 50%, 75%, 100%:

```json
{
  "id": "battery",
  "type": "battery",
  "battery": {
    "symbols": {
      "font": "Symbols Nerd Font Mono",
      "levels": [
        { "glyph": "\uf244" },
        { "glyph": "\uf243" },
        { "glyph": "\uf242" },
        { "glyph": "\uf241" },
        { "glyph": "\uf240" }
      ],
      "charging": { "glyph": "\uf0e7" }
    }
  }
}
```

Omitted state symbols use each provider's defaults. An item-level `symbol` overrides state and result symbols. A provider's `showSymbol: false` hides the symbol regardless of these settings. With `frontApplication.showIcon: true`, the native application icon takes precedence over the item symbol.

Use `sbar set` to change an item-level `symbol` to a glyph object. This change lasts until reload or restart.

## Text and provider appearance

Use the item-level [`text` field](/sbar/configuration/text-templates/) to replace labels with provider values or conditional text. An empty template hides the label while retaining item-level symbols and provider hide rules. Use [conditional symbol tags](/sbar/configuration/text-templates/#symbols-visibility-and-accessibility) to show native symbols or application icons only in selected states. Workspace loops preserve per-entry highlighting. Throughput loops preserve direction icons when they contain `{{symbol}}`; an empty template hides those icons.

## Provider appearance

Use each provider's configuration block to change its state symbols, tints, and visibility.

### Battery appearance

Battery items show dynamic symbols by default. Add a `battery` block to customise the symbols and state tints. See [battery appearance](/sbar/providers/battery/) for charging states and the low-battery threshold.

### Volume appearance

Configure `volume.symbols` and `volume.tints` for volume levels, mute, fixed volume, and unavailable output. See [volume appearance](/sbar/providers/volume/) for defaults and level boundaries.

### Audio device appearance

Customise `audioDevice.symbols` with `output`, `input`, `disconnected`, and `unavailable` keys. Glyphs inherit `audioDevice.symbols.font` and optional `size`. Tints use `available`, `disconnected`, and `unavailable`. Use top-level `text` conditions for custom state labels or `text: ""` for icon-only output. See [audio device appearance](/sbar/providers/audiodevice/) for defaults, input selection, and missing-device visibility.

### Mail appearance

Mail uses `envelope.badge` when the combined inbox has unread messages and `envelope` for zero unread or error states. An item-level `symbol` overrides both; `symbolPosition` controls its placement. Use shared styling for colours and widths. The `mail` block controls polling. Use `text` to customise the count label or [conditional symbol tags](/sbar/configuration/text-templates/#symbols-visibility-and-accessibility) to control the icon. There is no dedicated setting to hide zero-count items. See [Mail](/sbar/providers/mail/) for output and Automation permissions.

### Network connection symbols

Network items show connection icons by default. Customise `network.symbols` with `wifi`, `ethernet`, `cellular`, `other`, and `offline` state keys. Glyphs inherit `network.symbols.font` and optional `size`. Each symbol can override these values. An item-level `symbol` overrides the connection icon; `network.showSymbol: false` hides it. Use top-level `text: ""` for icon-only output. See [network appearance](/sbar/providers/network/#connection-symbols) for defaults, labels, tints, and interface filtering.

### VPN connection appearance

Customise `vpn.symbols` and `vpn.tints` for `connecting`, `connected`, `disconnecting`, `disconnected`, and `unavailable`. Glyphs inherit `vpn.symbols.font` and optional `size`. Use `text: "VPN {{status}}"` for an aggregate label or `text: ""` for icon-only output. See [VPN appearance](/sbar/providers/vpn/) for defaults, state precedence, and visibility when disconnected or unavailable.

### Bluetooth state appearance

Customise `bluetooth.symbols` and `bluetooth.tints` for `on`, `off`, `connected`, `unauthorized`, and `unavailable`. Glyphs inherit `bluetooth.symbols.font` and optional `size`. Use `text: "Bluetooth {{status}}"` for a status-only label or `text: ""` for icon-only output. See [Bluetooth appearance](/sbar/providers/bluetooth/) for defaults, device names, and visibility when disconnected or access is denied.

### CPU state appearance

CPU items show a state icon by default. Configure `cpu.symbols` and `cpu.tints` for `low`, `medium`, `high`, and `unavailable`. Glyphs inherit `cpu.symbols.font` and optional `size`. Each symbol can override these values. Thresholds use the rounded, smoothed percentage. See [CPU appearance](/sbar/providers/cpu/) for visibility settings, defaults, and smoothing behaviour.

### Memory state appearance

Memory items show a `memorychip` icon by default and `questionmark` when unavailable. Customise `memory.symbols.available` and `memory.symbols.unavailable`; glyphs inherit `memory.symbols.font` and optional `size`. Each symbol can override these values. See [memory appearance](/sbar/providers/memory/) for display formats and visibility settings.

### Disk state appearance

Disk items show `internaldrive` for valid readings and `questionmark` when unavailable. Customise `disk.symbols.available` and `disk.symbols.unavailable`, with shared glyph `font` and `size` settings. Use `disk.tints` for normal, warning, critical, and unavailable states. Thresholds compare free percentage even when the item displays used percentage. See [disk appearance](/sbar/providers/disk/) for defaults and capacity formats.

### Throughput direction symbols

Use a [`transfers` loop](/sbar/providers/throughput/#text-templates) with `{{symbol}}` to retain direction icons in a custom template.

Throughput items show separate download and upload icons by default. Customise `throughput.symbols.download`, `upload`, and `unavailable`, with shared glyph `font` and `size` settings. An item-level `symbol` replaces directional icons with one fixed icon; `throughput.showSymbol: false` hides it. See [throughput appearance](/sbar/providers/throughput/) for direction visibility, units, and smoothing.

### Media playback symbols

Media items show playback state icons by default. Customise `media.symbols.playing`, `paused`, `stopped`, and `unavailable`, with shared glyph `font` and `size` settings. An item-level `symbol` overrides state icons; `media.showSymbol: false` hides it. See [media appearance](/sbar/providers/media/) for source selection and track visibility.

### Spaces appearance

Spaces items show `rectangle.3.group` by default and `questionmark` when unavailable. Customise `spaces.symbols.available` and `unavailable`, with shared glyph `font` and `size` settings. Use `spaces.tints.active` and `inactive` for list entries and `unavailable` for unreadable state. The active list entry is bold. See [Spaces appearance](/sbar/providers/spaces/) for scope, labels, and fullscreen filtering.

### AeroSpace appearance

AeroSpace items show `rectangle.3.group` by default and `questionmark` when unavailable. Customise `aerospace.symbols.available` and `unavailable`, with shared glyph `font` and `size` settings. Use `aerospace.tints.focused`, `visible`, `inactive`, and `unavailable` for workspace states; focused takes precedence over visible. See [AeroSpace appearance](/sbar/providers/aerospace/) for scope, labels, and list formatting.

### Yabai appearance

Yabai items show `rectangle.3.group` by default and `questionmark` when unavailable. Customise `yabai.symbols.available` and `unavailable`, with shared glyph `font` and `size` settings. Use `yabai.tints.focused`, `visible`, `inactive`, and `unavailable` for Space states; focused takes precedence over visible. See [Yabai appearance](/sbar/providers/yabai/) for scope, list formatting, and fullscreen filtering.

### Shell command appearance

Shell commands can return a JSON symbol, tint, and hidden state alongside text. Configure `command.symbols` and `command.tints` for running, success, and failure states. An item-level symbol takes precedence over state symbols, then result symbols. See [shell command appearance](/sbar/providers/command/#state-appearance-and-errors) for precedence and error policies.

### Process plugin appearance

Process plugins can stream JSON symbols, tints, and visibility alongside text. Configure `plugin.symbols` and `plugin.tints` for running, success, and failure states. Item symbols override state symbols, then result symbols; each output message replaces the previous result. See [process plugin appearance](/sbar/providers/plugin/#state-appearance-and-errors) for precedence and error policies.

## Vertical bar styling

Side bars require an unreleased build from `main`. v0.0.1 supports horizontal bars only.

In side bars, `theme.regions.left`, `center` and `right` style the top, middle and bottom sections. Each section fills the inner bar width and grows vertically to fit its visible items. Empty sections draw nothing.

Vertical padding leaves less height for items before they move into overflow. Horizontal padding leaves less width for each label.

Item `width`, `minWidth` and `alignment` still control horizontal sizing. Allow for bar and section padding when setting an item width. Content wider than its section is clipped. See the [vertical example](https://github.com/starkwm/sbar/tree/main/examples/vertical).
