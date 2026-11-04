---
title: "Configuration"
description: "Binding syntax, modifiers, key names, and the block list."
weight: 20
---

## Files and reloading

skbd reads `~/.config/skbd/skbdrc` by default. Pass `-c` or `--config` to use another file or a directory.

For a directory, skbd loads every non-hidden regular file in lexicographical filename order. It skips subdirectories, and files need no particular extension. skbd joins the files with newlines and parses them as one configuration. The first matching binding wins, and the last `.blocklist` replaces any earlier one.

skbd reloads the configuration when you edit it. If the path is a symlink, skbd watches both the link and its target, so editing the target or pointing the link somewhere else both trigger a reload. For a directory, editing, adding, removing, or renaming a file in it triggers a reload.

If the new configuration fails to load or parse, skbd prints an error and keeps the last one that worked.

## Bindings

A binding joins modifiers with `+`, separates them from the key with `-`, and puts the command after `:`.

```text
cmd + shift - k: open -a iTerm
```

Modifiers are optional, so `f19: open -a Terminal` also works. They must match exactly. Holding Shift stops a `cmd - k` binding from matching.

skbd swallows the key press after running the command. To pass the key press on to the application as well, use `->` instead of `:`.

```text
cmd + shift - k -> open -a iTerm
```

skbd runs commands with `-c` in the shell named by `$SHELL`, or `/bin/bash` if that is unset or empty. It discards standard output and standard error unless you redirect them. End a line with `\` to continue the command on the next line.

```text
ctrl + shift - return:
    osascript -e 'if application "Ghostty" is running then' \
              -e '  tell application "System Events"' \
              -e '    click menu item "New Window" of menu "File" of menu bar 1 of process "Ghostty"' \
              -e '  end tell' \
              -e 'else' \
              -e '  tell application "Ghostty" to activate' \
              -e 'end if' > /dev/null
```

## Comments

A line that starts with `#` is a comment.

## Modifiers

| Modifier | Keys |
| --- | --- |
| `shift` | Shift |
| `ctrl` | Control |
| `opt`, `alt` | Option |
| `cmd` | Command |
| `meh` | Shift, Control, and Option |
| `hyper` | Shift, Control, Option, and Command |
| `fn` | Function or Globe |

Prefix `shift`, `ctrl`, `opt`, `alt`, or `cmd` with `l` or `r` to match only the left or right key, as in `lcmd` or `ralt`.

## Keys

### Letters, digits, and punctuation

Use lowercase letters `a` through `z`, digits `0` through `9`, or these punctuation characters:

```text
` - = [ ] ' ; \ , . /
```

skbd maps character keys with the current ASCII-capable keyboard layout when it first loads the key map. Write a punctuation key straight after the modifier separator:

```text
cmd - -: open -a Terminal
cmd - [: open -a Finder
cmd - ]: open -a Safari
```

### Named keys

| Group | Names |
| --- | --- |
| Typing | `return`, `tab`, `space`, `backspace`, `escape`, `backtick` |
| Navigation | `delete`, `home`, `end`, `pageup`, `pagedown`, `insert` |
| Arrows | `left`, `right`, `up`, `down` |
| Function keys | `f1` through `f20` |

`return` is the Return key. `backspace` deletes backwards, and `delete` deletes forwards.

Navigation, arrow, and function key names add the `fn` event flag when matching, so you do not need to write `fn` yourself.

### Hexadecimal key codes

To bind by code, write a macOS virtual key code in hexadecimal with a `0x` prefix:

```text
ctrl - 0x31: open -a Terminal
```

`0x31` is the Space bar. Key codes do not add the `fn` flag that named navigation, arrow, and function keys add. Include `fn` in the modifiers when you need it.

## Block list

List process names in `.blocklist` to turn shortcuts off while one of those processes is frontmost:

```text
.blocklist [
  "Ghostty"
  "Finder"
]
```

With this list, skbd ignores its shortcuts while Ghostty or Finder is frontmost, and those apps receive key presses as normal.

Entries must match the frontmost application's localised name exactly.
