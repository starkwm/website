---
title: "Weather"
description: "Current weather from Open-Meteo at configured coordinates."
weight: 9
category: "Weather"
cadence: "Configurable polling"
options: "`weather` block"
---

## Output

The rounded temperature and an icon for the current conditions, such as `18°C`. A `weather` item requires latitude and longitude. It does not request location permission or look up your position.

Before the first reading, the item shows `Weather unavailable` with a question-mark icon. If a later request fails, sbar keeps the last reading and marks it stale. A successful request clears the stale state.

## Configuration

Set these options inside `weather`:

| Property | Default | Description |
| --- | --- | --- |
| `latitude` | Required | Latitude from -90 to 90. |
| `longitude` | Required | Longitude from -180 to 180. |
| `temperatureUnit` | `celsius` | `celsius` or `fahrenheit`. |
| `windSpeedUnit` | `kmh` | `kmh`, `mph`, `ms`, or `kn`. |
| `pollInterval` | `900` | Seconds between completed requests, from 60 to 86,400. |
| `showSymbol` | `true` | Show a condition icon; `false` also hides an item-level symbol. |
| `symbols.font` | - | Shared installed font name for glyph symbols; each glyph can override it. |
| `symbols.size` | Resolved item/theme font size | Shared glyph size, from 8 to 72 points; each glyph can override it. |
| `symbols` condition keys | Icons below | Override individual condition icons. |

Temperature and wind conversions happen before sbar rounds the displayed values.

### Condition symbols

Clear and partly cloudy conditions use different icons for day and night. Other weather codes map to cloud, fog, drizzle, rain, sleet, snow, shower, and storm icons. Unknown codes use `questionmark`.

Override individual icons with these `weather.symbols` keys:

| Conditions | Keys |
| --- | --- |
| Clear and mainly clear | `clearDay`, `clearNight` |
| Partly cloudy | `partlyCloudyDay`, `partlyCloudyNight` |
| Overcast | `overcast`, `overcastDay`, `overcastNight` |
| Fog | `fog` |
| Drizzle and rain | `drizzle`, `freezingDrizzle`, `rain`, `freezingRain` |
| Snow and showers | `snow`, `rainShowers`, `snowShowers` |
| Storms | `thunderstorm`, `thunderstormHail` |
| Other states | `unknown`, `unavailable` |

Strings name SF Symbols. Glyph objects use their own `font` and `size` or inherit them from the symbols block:

```json
{
  "id": "weather",
  "type": "weather",
  "symbolPosition": "right",
  "weather": {
    "latitude": 53.4808,
    "longitude": -2.2426,
    "symbols": {
      "font": "Symbols Nerd Font Mono",
      "size": 16,
      "clearDay": "sun.max.fill",
      "clearNight": "moon.stars.fill",
      "overcast": "cloud.fill",
      "rain": { "glyph": "\uf0e9" },
      "rainShowers": { "glyph": "\uf0e9" }
    }
  }
}
```

Use `overcast` for both day and night, or set `overcastDay` and `overcastNight` separately. sbar selects the day or night entry using the location's daylight flag, falling back to `overcast`, then the built-in `cloud.fill` icon when the entry is omitted or `null`.

Other omitted or `null` entries keep the built-in icons. `unknown` covers unrecognised weather codes, while `unavailable` applies before a reading exists. A stale reading keeps its condition icon. An item-level `symbol` overrides every condition. `weather.showSymbol: false` hides all of them. See [font glyph symbols](/sbar/configuration/appearance/#font-glyph-symbols) for font requirements.

### Text templates

The item-level `text` setting supports these fields:

| Field | Value |
| --- | --- |
| `temperature`, `feelsLike` | Rounded temperature in the selected unit. |
| `temperatureUnit` | `°C` or `°F`. |
| `humidity` | Rounded relative humidity percentage, without `%`. |
| `windSpeed`, `windSpeedUnit` | Rounded speed and `km/h`, `mph`, `m/s`, or `kn`. |
| `condition`, `weatherCode` | English condition and Open-Meteo WMO code. |
| `isDay` | `true` when the location is in daylight. |
| `updatedAt` | API data timestamp in ISO 8601 UTC format. |
| `available` | A current or retained stale reading exists. |
| `stale` | The last request failed and sbar retained an earlier reading. |
| `status` | `available`, `stale`, or `unavailable`. |
| `value` | Default temperature label, or `Weather unavailable`. |

Missing optional measurements produce empty strings. `updatedAt` is the API's data timestamp, not the time sbar fetched it.

```json
{
  "id": "weather",
  "type": "weather",
  "weather": { "latitude": 51.5074, "longitude": -0.1278 },
  "text": "{{#available}}{{temperature}}{{temperatureUnit}} · {{condition}}{{#stale}} *{{/stale}}{{/available}}{{^available}}Weather unavailable{{/available}}"
}
```

Set `text` to an empty string for an icon alone. See [text templates](/sbar/configuration/text-templates/) for conditions, shared fields, and symbol placement.

## Updates

sbar fetches weather immediately, then waits `pollInterval` seconds after each request finishes. Items with identical coordinates share one request across displays, even if they use different display units. The shortest interval among enabled items at that location applies. Removing the last item for a location cancels its requests. Changing the interval restarts polling, while cosmetic changes do not.

Requests time out after 15 seconds. A failed request retains the last reading and sets `stale`; stale does not mean that a reading passed an age threshold.

[Refresh policies](/sbar/configuration/refresh/) control presentation snapshots separately from network polling. Manual items receive their first successful reading, then hold it until triggered. Changing coordinates clears the previous location's snapshot. Changing units reformats the held reading without another request.

Provider value events use the item ID and the default Celsius label. Text templates and display units do not change that event value.

## Current limits

Current conditions are weather-model estimates. sbar does not support automatic location lookup, custom Open-Meteo endpoints, or API keys.

Weather data comes from [Open-Meteo](https://open-meteo.com/) under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). sbar uses the keyless, non-commercial API. See [Open-Meteo's plans](https://open-meteo.com/en/pricing) for service limits and commercial access.

## Example

```json
{
  "id": "weather",
  "type": "weather",
  "weather": {
    "latitude": 51.5074,
    "longitude": -0.1278,
    "temperatureUnit": "celsius",
    "windSpeedUnit": "kmh",
    "pollInterval": 900
  }
}
```

This shows current weather for central London and updates it every 15 minutes after each completed request.
