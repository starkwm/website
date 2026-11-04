---
title: "Signals"
description: "Run shell commands when applications, windows, Spaces, or displays change."
weight: 70
---

## Run commands on events

A signal runs a shell action after a matching event:

```sh
swm signal add event=window-focused action='echo "$SWM_WINDOW_ID"'
swm signal add event=window-created app='^Safari$' label=safari-created action='echo "$SWM_WINDOW_ID"'
swm signal list
swm signal remove <index|label>
```

`add` needs `event` and `action`. It also accepts:

- `label=<text>`, a unique name to use with `remove`.
- `app=<regex>` and `title=<regex>`, which require the value to match.
- `app!=<regex>` and `title!=<regex>`, which require the value not to match.
- `active=on|off`, which filters application and window events by whether the app is active or the window focused.

`active=on` matches active applications or focused windows, and `active=off` matches the rest. Space and display events reject this filter. swm does not accept `yes` or `no` for it. Signal filters do not accept bundle IDs.

```sh
swm signal add event=window-focused active=on action='echo "$SWM_WINDOW_ID"'
```

`swm signal clear` removes every signal. Signals only last for the current daemon run, so add the ones you want to keep in [`swmrc`](/swm/getting-started/#configuration-file).

## Events and variables

swm runs each action in the background with `/usr/bin/env sh -c`, and sets environment variables that describe the event:

| Events | Variables |
| --- | --- |
| `application-launched`, `application-terminated`, `application-front-switched` | `SWM_PROCESS_ID` |
| `window-created`, `window-destroyed`, `window-focused`, `window-moved`, `window-resized`, `window-minimized`, `window-deminimized` | `SWM_WINDOW_ID`, plus `SWM_PROCESS_ID` when swm knows the window's application |
| `space-changed` | `SWM_SPACE_ID`, plus `SWM_SPACE_INDEX`, `SWM_RECENT_SPACE_ID`, and `SWM_RECENT_SPACE_INDEX` when known |
| `display-changed` | `SWM_DISPLAY_ID` and `SWM_RECENT_DISPLAY_ID` when known |
| `display-added`, `display-removed`, `display-moved`, `display-resized` | `SWM_EVENT_DISPLAY_ID`, plus `SWM_DISPLAY_ID` and `SWM_RECENT_DISPLAY_ID` when known |

`SWM_EVENT_DISPLAY_ID` names the display the event is about. `SWM_DISPLAY_ID` and `SWM_RECENT_DISPLAY_ID` name the current and previously active displays.
