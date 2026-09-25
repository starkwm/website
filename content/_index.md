---
description: Open-source window management, window tags, keyboard shortcuts, and status bars for macOS.
---

Stark Software is a collection of [open-source][starkwm] macOS tools. I built them to manage my windows and run commands from the keyboard.

## How it started

I built the first version of Stark in [early 2016][first-commit] while learning Swift. I wanted to control my windows with keyboard shortcuts and configure their behaviour in JavaScript.

Stark uses the [Accessibility API][ax-api] and private macOS frameworks to manage windows. My work on it has drawn on [Amethyst][amethyst] and [yabai][yabai].

## Why swm exists

After years of maintaining Stark, I wanted to configure window management with shell commands. swm runs as a daemon that tracks displays, spaces, and windows. Its command-line interface lets scripts query and control them.

## Why skbd exists

I built skbd to bind key combinations to shell commands. It can distinguish left and right modifier keys. Pair it with swm to manage windows from the keyboard.

## Where stags fits

[stags](/stags/) groups windows by tags within the active macOS Space. A view can show one tag or several at once, without switching Spaces.

[starkwm]: https://github.com/starkwm
[first-commit]: https://github.com/starkwm/stark/commit/7cfb1e2339bdb454e158b3e8c0b9fc8ca846f8ed
[ax-api]: https://developer.apple.com/documentation/accessibility/accessibility-api
[amethyst]: https://github.com/ianyh/Amethyst
[yabai]: https://github.com/asmvik/yabai
