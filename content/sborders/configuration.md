---
title: "Configuration"
description: "Border appearance, application filters, and live configuration reloads."
weight: 20
---

Both `.json` and `.jsonc` files accept JSON with `//` comments, block comments, and trailing commas. Comment markers inside strings stay as text. sborders rejects unknown or duplicate keys and values with the wrong type or format.

`sborders validate`, startup, and reloads all check the same rules. Add the [JSON schema](/sborders/config.schema.json) to get editor completion:

```jsonc
{
  "$schema": "https://stark.software/sborders/config.schema.json",
  "width": 4,
  "activeColor": "#89B4FA",
  "inactiveColor": "#45475A80"
}
```

## Settings

| Property | Default | Accepted values |
| --- | --- | --- |
| `enabled` | `true` | Boolean; false removes border windows |
| `width` | `4` | Number from 0.5 to 64 points |
| `style` | `"round"` | `"round"` or `"square"` |
| `activeColor` | `"#E1E3E4"` | `#RRGGBB` or `#RRGGBBAA` |
| `inactiveColor` | `"#00000000"` | `#RRGGBB` or `#RRGGBBAA` |
| `focusMode` | `"windowServer"` | `"windowServer"` or `"accessibility"` |
| `includeApps` | `[]` | Application matchers; empty allows all eligible apps |
| `excludeApps` | `[]` | Application matchers; exclusion takes precedence |
| `$schema` | Absent | Optional schema URL for editors |

For colours with eight hex digits, the last two control opacity. `#45475A80` is translucent and `#00000000` is transparent. Set border width in points. sborders adjusts rendering for each window's display scale.

Round borders use the window's reported corner radius, falling back to nine points when the API is unavailable. For small windows, sborders reduces the radius to fit. Windows smaller than two points in either dimension get no border. Borders sit immediately below their target, with the same level and sublevel.

## Application matching

Each entry in `includeApps` or `excludeApps` must contain either `bundleID` or `processName`. The value cannot be empty. Matches are exact and case-sensitive. Use `query --windows` to find the identifiers reported for an application. `processName` matches the reported application name, which can be localised.

```jsonc
{
  "includeApps": [
    { "bundleID": "com.apple.Terminal" },
    { "bundleID": "com.mitchellh.ghostty" }
  ],
  "excludeApps": [
    { "processName": "Example utility" }
  ]
}
```

Adding an app to `includeApps` doesn't force borders onto every window. sborders still skips attached windows, windows excluded from normal window cycling, and its own windows. Hidden, minimised, and native fullscreen windows receive no visible border.

## Reload and overrides

sborders watches the selected file and its parent directory, so it also detects editors that save by replacing the file. If you save an invalid edit or remove the file, it keeps the last valid settings and reports `configurationError` in diagnostics. Save a valid file to clear the error. Restoring the previous contents works too.

Use `set` to try a setting without editing your file:

```sh
sborders set width 6
sborders set activeColor '#A6E3A1'
sborders set includeApps '[{"bundleID":"com.apple.Terminal"}]'
```

File settings override the defaults. Changes made with `set` override the file until the next successful reload. On reload, sborders reads the whole file again and uses defaults for any missing properties. If the reload fails, your current settings stay in place.

```sh
sborders reload
sborders query --config
sborders query --diagnostics
```

Changes to other files in the configuration directory won't reset your `set` changes. Running `sborders reload` always reloads the configuration, even if its contents haven't changed.
