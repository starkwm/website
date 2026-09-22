+++
title = 'Stark'
description = 'A macOS window manager configured in JavaScript.'
homeSummary = 'Window management in JavaScript'
homeDetails = 'Write a stark.js file to move and resize windows, control applications, and bind keyboard shortcuts with the JavaScript API.'
weight = 10
+++

Stark is a window manager for macOS. Use its JavaScript API to create keyboard shortcuts that control windows and applications.

Stark is no longer updated. For a current setup, use [swm](/swm/) for window management and [skbd](/skbd/) for keyboard shortcuts.

## Installation

Stark must be built from source. You need macOS 26 or later and Xcode 26 or later.

```sh
git clone https://github.com/starkwm/stark.git
cd stark
xcodebuild -project Stark.xcodeproj -scheme Stark \
  -configuration Release -derivedDataPath ./build \
  CODE_SIGN_IDENTITY=- CODE_SIGN_STYLE=Manual DEVELOPMENT_TEAM= build
```

The app is at `build/Build/Products/Release/Stark.app`. Move it to `/Applications`, launch it, grant it Accessibility permission, then restart it. Enable _Launch at login_ in its menu to start it when you log in.

Stark uses private macOS frameworks, so future macOS updates may break it.

## Configuration

Configure Stark with a `stark.js` file in one of these locations.

- `~/.stark.js`
- `~/.config/stark/stark.js`
- `~/Library/Application Support/Stark/stark.js`

Stark loads the first file it finds in the order above.

Enable logging from the menu bar icon to write debug output to `~/.stark.log`. This includes calls to `print` in your configuration.

See the [API reference][api-docs] for available methods, or [Tom's configuration][tom-config] for an example of manual window management.

[api-docs]: /stark/api/
[tom-config]: https://github.com/tombell/dotfiles/blob/main/tag-macos/config/stark/stark.js
