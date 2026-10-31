---
title: "Compatibility"
description: "Permissions, macOS support, and setups that still need testing."
weight: 40
---

## macOS and permissions

`sborders` targets macOS 26 or later. It uses private WindowServer APIs to discover windows and draw borders. These APIs can change between macOS releases. If a required API is missing, sborders won't start. If it cannot read a window's corner radius, it uses a fixed radius instead.

The default `windowServer` focus mode does not request Accessibility permission. Set `focusMode` to `"accessibility"` to use the focused Accessibility window instead. That mode requires permission in System Settings > Privacy & Security > Accessibility.

Run the daemon as your desktop user while logged into macOS. It has no Dock icon and does not activate its border windows.

## Window behaviour

Hidden, minimised, and native fullscreen windows receive no visible border. Borders hide temporarily during Mission Control and return when it closes, without changing the `enabled` setting.

Even if an app matches your filters, sborders skips attached windows, windows excluded from normal window cycling, and its own windows.

sborders follows ordinary moves and resizes from window managers. It does not support yabai's animation-proxy protocol. Stop other border daemons before trying sborders to avoid duplicate borders.

## Validation limits

The [v0.0.1 development notes](https://github.com/starkwm/sborders/blob/v0.0.1/docs/development.md#validation-record) record desktop checks on macOS 27.0 build `26A428` with Swift 6.4. The build targets macOS 26, but desktop behaviour on that version still needs testing.

These setups still need testing:

- A macOS 26 desktop and compiler, including Mission Control
- Mixed-scale multi-display layouts and sticky windows
- Stage Manager, sleep/wake, and login/logout
- Accessibility focus mode permissions and application compatibility

## Inspect a missing border

```sh
sborders query --config
sborders query --windows
sborders query --diagnostics
```

Check that borders are enabled, the application passes your filters, and its border colour is not fully transparent. Window diagnostics show whether the border is visible. Daemon diagnostics show whether Mission Control is hiding borders and report the latest configuration or backend error. See the [command reference](/sborders/cli/#inspect-state) for details.
