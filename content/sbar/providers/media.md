---
title: "Media"
description: "Apple Music and Spotify track details, with source selection and playback state icons."
weight: 16
category: "Desktop"
cadence: "Playback notifications"
options: "`media` block"
---

## Output

Track title and artist from Apple Music or Spotify, separated by ` — `, with a playback state icon. Omitting the `media` block is equivalent to `media: {}`. By default, the provider selects a source automatically from the two players.

## Configuration

Use the item-level [`text` template](/sbar/configuration/text-templates/) to customise or hide the label.

Set these options inside `media`.

| Property | Default | Description |
| --- | --- | --- |
| `showSymbol` | `true` | Show the playback state icon, including an item-level override. |
| `hideWhenNotPlaying` | `false` | Hide unless the selected source is playing, including waiting and unavailable states. |
| `hideWhenPaused` | `false` | Hide the item when the selected source is paused. |
| `hideWhenStopped` | `false` | Hide the item when the selected source is stopped. |
| `source` | `automatic` | `automatic`, `music`, or `spotify`. |
| `symbols.font` | - | Shared installed font name for glyph symbols; each glyph can override it. |
| `symbols.size` | Resolved item/theme font size | Shared glyph size, 8 to 72 points; each glyph can override it. |
| `symbols.playing` | `play.fill` | Playing source icon. |
| `symbols.paused` | `pause.fill` | Paused source icon. |
| `symbols.stopped` | `stop.fill` | Stopped source icon. |
| `symbols.unavailable` | `questionmark` | Waiting for a notification, or unknown playback state. |

### Source selection

Automatic selection prefers playing sources over paused, then stopped, then unknown sources. Within the same playback state, the most recently received update wins. A pause notification from one player does not replace another playing source.

Select `music` or `spotify` to ignore the other player for that item. Different items can select different sources while sharing the same notification tracking.

### States and labels {#track-details-and-state}

Paused playback retains track details when a notification omits them. Stopped playback, unknown playback states, and app termination clear that player's track. A new title with no artist does not inherit the previous track's artist. The separator appears only between nonempty visible fields.

| Condition | Fallback text |
| --- | --- |
| Playing with no visible metadata | `Playing` |
| Paused with no visible metadata | `Paused` |
| Stopped | `Stopped` |
| Selected source has not sent an update | `Waiting for playback` |
| Unknown or malformed playback state | `Playback unavailable` |

Setting top-level `text` to `""` hides all text, including fallback text.

`hideWhenNotPlaying` hides every state except playing. `hideWhenPaused` and `hideWhenStopped` hide those individual states and leave waiting and unavailable states visible. All three options apply to the selected source. If any enabled option matches its state, the item is hidden and takes no [layout or overflow space](/sbar/configuration/items/#overflow).

Symbols accept SF Symbol names or [font glyph objects](/sbar/configuration/appearance/#font-glyph-symbols). Use [`symbolFontWeight`](/sbar/configuration/appearance/#sf-symbol-weight) to set SF Symbol weight independently of text.

An item-level `symbol` overrides state symbols. `showSymbol: false` hides all symbols, including this override. Icon-only items retain the source, playback state, and known metadata in their accessibility label.

To change `media`, edit the configuration file. `sbar set` cannot change this block.

[Shared item options](/sbar/configuration/items/) cover styling, symbols, actions, priority, and enabled state.

### Text templates

The item-level `text` setting supports `id`, `value`, `symbol`, `title`, `artist`, `source`, `status`, `playing`, `available`. See [text templates](/sbar/configuration/text-templates/) for shared fields and syntax. Fields follow the selected source. Use the template to select title, artist, and separators; `value` contains the default title/artist label or the fallback text when metadata is absent, such as `Paused` or `Waiting for playback`. Playback hide rules still apply.

`status` is `playing`, `paused`, `stopped`, or `unknown`. Use [state conditions](/sbar/configuration/text-templates/#state-specific-labels) to choose a label for each state.

The configuration setting `media.source` uses lowercase `music` or `spotify`, or `automatic` to select between them. The template field `source` uses `Music` or `Spotify`, including in equality comparisons. It is empty when no source has been selected.

`available` is false while waiting for a source or when the selected source has an unknown state. It is true for playing, paused, and stopped sources, even without track metadata. Use `playing` to test active playback.

Use conditions to add a separator only when both title and artist are present, and keep the default label when neither is available:

```json
{
  "id": "media",
  "type": "media",
  "text": "{{title}}{{#artist}}{{#title}} / {{/title}}{{artist}}{{/artist}}{{^title}}{{^artist}}{{value}}{{/artist}}{{/title}}"
}
```

For a track named `Daylight` by `Example Artist`, this displays `Daylight / Example Artist`. With only a title or artist, it displays that field without a separator. With neither, it retains the default playback or waiting label. Playback hide rules still apply.

## Updates

The provider follows playback notifications. By default, startup displays `Waiting for playback` until the selected source sends an update, even if it was already playing when the bar started. With `hideWhenNotPlaying: true`, the item stays hidden until a playing update arrives. Start or change a track to display its details.

Refresh policies snapshot both players' states together. Manual and interval items retain their track, state symbol, and visibility until refreshed, including after a player quits. Provider events use the default automatic selection and text. See [refresh policies](/sbar/configuration/refresh/).

## Current limits

Supports Apple Music and Spotify notifications only. No initial playback query, playback controls, artwork, or dedicated state tints.

## Example

```json
{
  "id": "media",
  "type": "media",
  "media": {
    "hideWhenNotPlaying": true
  }
}
```

This shows track details only while the selected source is playing. It hides the item while paused, stopped, waiting for playback, or unavailable. Set top-level `text` to `""` for an icon-only item, or `media.showSymbol: false` for text-only output.
