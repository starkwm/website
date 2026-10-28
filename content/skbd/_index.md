---
title: "skbd"
description: "A keyboard shortcut daemon for macOS built on Quartz Event Services."
weight: 30
homeSummary: "Turns key presses into shell commands."
homeHello: "I listen."
homeSays: "hyper - t: open -a Terminal"
homeInstall: "brew install starkwm/formulae/skbd@2"
homeVersion: "v0.0.7"
homeDetails: "Bind key combinations to shell commands, including bindings that tell left and right modifier keys apart. skbd reloads its configuration when you save it, so a new shortcut works without a restart."
---

skbd runs shell commands when you press configured keyboard shortcuts. It uses [Quartz Event Services][quartz] to monitor key presses on macOS and can distinguish left and right modifier keys.

[quartz]: https://developer.apple.com/documentation/coregraphics/quartz-event-services

This reference covers [v0.0.7](https://github.com/starkwm/skbd/releases/tag/v0.0.7), the latest prerelease, checked on 11 October 2026.

## Requirements

- macOS 26 or later
- Accessibility permission for `skbd`
- Xcode 26 or later with Swift 6.2 when building from source

## Installation

Install skbd with [Homebrew][brew] on Apple silicon:

```sh
brew tap starkwm/formulae
brew install starkwm/formulae/skbd@2
```

skbd refuses to start without a configuration, so create one first:

```sh
mkdir -p ~/.config/skbd
echo 'hyper - t: open -a Terminal' > ~/.config/skbd/skbdrc
```

Start skbd as a launchd service:

```sh
brew services start skbd@2
```

Grant Accessibility permission in System Settings > Privacy & Security > Accessibility, then restart the service:

```sh
brew services restart skbd@2
```

To build the same release from [source][gh-skbd], install Xcode 26 or later and the macOS SDK:

```sh
git clone https://github.com/starkwm/skbd.git
cd skbd
git checkout v0.0.7
make build
```

Run `.build/debug/skbd` in the foreground. If startup reports `failed to create event tap`, check Accessibility permission. A source build does not install a login service, so create a Launch Agent `.plist` file to run skbd in the background.

[brew]: https://brew.sh
[gh-skbd]: https://github.com/starkwm/skbd

## Command line

Run `skbd` without options to start the daemon. Only one instance can run per user.

```text
-c, --config <path>     Use a configuration file or directory
-v, --version          Show version information
-h, --help             Show help information
```

The selected configuration path must exist and parse successfully at startup. Help and version options do not start the daemon.

## Configuration

Configure `skbd` with a single file or a directory of files. It reads `~/.config/skbd/skbdrc` by default. If the configured path points to a directory, `skbd` loads all non-hidden regular files in that directory in lexicographical filename order. Use `-c/--config` to select another path. `skbd` skips subdirectories, and files need no particular extension. It joins the files with newlines and parses them as one configuration. The first matching binding wins; the last `.blocklist` directive replaces earlier lists.

`skbd` reloads the configuration when you edit it, without a restart. If the configured path is a symlink, `skbd` watches both the symlink location and the resolved target, so editing the target or repointing the symlink reloads the configuration. For a directory configuration, `skbd` reloads when you edit, add, remove, or rename a file in it.

If a changed configuration cannot be loaded or parsed, `skbd` prints an error and keeps using the last valid configuration.

Join modifiers with `+`, separate them from the key with `-`, and put the command after `:`. Modifiers are optional, so `f19: open -a Terminal` is also valid. Modifiers must match exactly; holding Shift prevents a `cmd - k` binding from matching.

```
cmd + shift - k: open -a iTerm
```

By default, `skbd` consumes the key event after executing the command. To allow the key press to pass through to the application, use `->` instead of `:`.

```
cmd + shift - k -> open -a iTerm
```

`skbd` runs commands with the shell in `$SHELL`, or `/bin/bash` if it is unset or empty. Commands run with `-c`; standard output and standard error are discarded unless redirected. End a line with `\` to continue a command on the next line.

```
ctrl + shift - return:
    osascript -e 'if application "Ghostty" is running then' \
              -e '  tell application "System Events"' \
              -e '    click menu item "New Window" of menu "File" of menu bar 1 of process "Ghostty"' \
              -e '  end tell' \
              -e 'else' \
              -e '  tell application "Ghostty" to activate' \
              -e 'end if' > /dev/null
```

### Comments

Start a line with `#` to add a comment.

### Modifiers

Available modifiers:

- `shift`
- `ctrl`
- `opt`/`alt`
- `cmd`
- `meh`
- `hyper`
- `fn`

Prefix `shift`, `ctrl`, `opt`, `alt`, or `cmd` with `l` or `r` to select the left or right modifier key.

`meh` combines `shift`, `ctrl`, and `alt`.

`hyper` combines `shift`, `ctrl`, `alt`, and `cmd`.

`fn` is the Function or Globe key.

### Keys

#### Letters, digits, and punctuation

Use lowercase letters `a` through `z`, digits `0` through `9`, or these punctuation characters:

```text
` - = [ ] ' ; \ , . /
```

Character keys use the current ASCII-capable keyboard layout when the key map is first loaded. A punctuation key is written directly after the modifier separator:

```text
cmd - -: open -a Terminal
cmd - [: open -a Finder
cmd - ]: open -a Safari
```

#### Named keys

| Group | Names |
| --- | --- |
| Typing | `return`, `tab`, `space`, `backspace`, `escape`, `backtick` |
| Navigation | `delete`, `home`, `end`, `pageup`, `pagedown`, `insert` |
| Arrows | `left`, `right`, `up`, `down` |
| Function keys | `f1` through `f20` |

Use `return` for the Return key. `backspace` is backward delete, and `delete` is forward delete.

Navigation, arrow, and function key names automatically include the `fn` event flag when matching a shortcut.

#### Hexadecimal key codes

Use a hexadecimal macOS virtual key code prefixed with `0x` to bind by code:

```text
ctrl - 0x31: open -a Terminal
```

`0x31` is the Space key. Hexadecimal codes do not add the implicit `fn` flag used by named navigation, arrow, and function keys. Include `fn` in the modifiers when needed.

### Block list

Add process names to `.blocklist` to disable shortcuts while one of those processes is frontmost.

```
.blocklist [
  "Ghostty"
  "Finder"
]
```

In this example, skbd does not run shortcuts while Ghostty or Finder is frontmost.

Block-list entries match the frontmost application's localised name exactly. Matching applications receive key events normally.
