---
title: "Window rules"
description: "Keep chosen windows out of tiling, or send them to a display, Space, or grid position."
weight: 60
---

Rules keep chosen windows floating, or place them on a display or Space. Add them to `~/.config/swm/swmrc`. For example, this leaves System Settings and Finder out of tiling layouts:

```sh
swm rule add label=settings bundle-id=com.apple.systempreferences manage=off
swm rule add label=finder bundle-id=com.apple.finder manage=off
```

Rules last until the daemon stops. Adding or removing a rule updates windows that are already open as well as windows opened later.

## Commands

```sh
swm rule add label=finder app='^Finder$' manage=off
swm rule list
swm rule remove finder
swm rule remove 1
```

`swm rule clear` removes every rule.

`list` prints a JSON array. Each entry has a one-based `index` and a `rule` object holding the rule's properties. Indexes shift after a removal, so give a rule a unique, non-numeric `label` if you want to remove it by name.

`add` needs at least one action:

- `manage=on|off` allows or prevents automatic tiling.
- `display=<index|uuid>` moves the window to a display without moving focus. Indexes start at 1 and use the same order as `swm window move --display`. A UUID from `swm query displays` names a monitor whatever its index. Rules do not accept `next` or `prev`.
- `space=<index>` moves the window to a normal desktop Space without switching to it. Use a positive index from `swm query spaces`. A rule cannot set both `space` and `display`.
- `grid=<columns>:<rows>:<x>:<y>:<width>:<height>` places a floating window within the display's visible bounds. It uses the destination Space's padding and gaps, and clamps coordinates the same way as `swm window grid`.

## Match windows

A rule can filter on:

- `bundle-id=<identifier>`, an exact, case-sensitive application identifier. `bundle-id!=<identifier>` excludes it.
- `app=<regex>`, the application name. The name can change with the system language.
- `title=<regex>`, the window title.
- `app!=<regex>` or `title!=<regex>`, which require the text not to match.

Every filter must match. If a window has no value for a filter, that filter fails, even when inverted. A rule with no filters matches every window.

To leave every application except Finder out of automatic tiling:

```sh
swm rule add label=other-apps 'bundle-id!=com.apple.finder' manage=off
```

This rule skips Finder and any window with no bundle ID. swm compares bundle IDs exactly, never as regexes. Only `bundle-id`, `app`, and `title` can be negated. A rule with both `bundle-id` and `bundle-id!` counts as a duplicate property, and swm rejects it.

Regexes use Foundation's ICU syntax. They are case-sensitive and match anywhere in the text unless you anchor them with `^` and `$`. Quote them in shell scripts. swm rejects a rule with an invalid regex, unknown property, empty value, or duplicate property, and does not add it.

For each action, the last matching rule wins. A rule that only sets `grid` keeps the `manage`, `display`, or `space` value from an earlier rule. Across matching rules, the last `space` or `display` action picks the destination and replaces the other. Put broad rules first and exceptions after them:

```sh
swm rule add label=finder app='^Finder$' manage=off
swm rule add label=finder-projects app='^Finder$' title='^Projects$' manage=on
```

## Tiling

`manage=off` keeps a window out of automatic tiling and tiling cycles. Queries, focus, and direct window commands still work on it. `manage=on` lets the window tile if it can. It cannot force fixed-size, nonstandard, or native-fullscreen windows into a layout.

swm checks rules before a new window's first layout, whenever rules change, and on later window updates. A title change triggers a check if the app reports title changes. Removing a `manage` rule restores the value from an earlier matching rule, or the normal default.

`swm window float on`, `off`, and `toggle` override `manage` rules for that window until it closes or the daemon restarts. Editing rules keeps that choice. `toggle` reverses the window's float or tile setting. Rules never change a Space's layout, and a Space using `float` keeps its usual floating-window commands and cycling.

## Windows from accessory applications

swm also watches applications that use macOS's accessory activation policy, including helper processes that own windows. It tracks their windows when Accessibility reports the `AXStandardWindow` subrole, and ignores their other windows, such as panels and menu-bar strips.

Those standard windows follow the usual rules and tiling checks. A window must still be movable and resizable to tile, and fixed-size or native-fullscreen windows stay out of automatic tiling.

## Display and grid placement

```sh
# Place Finder in the right half of display 2.
swm rule add label=finder app='^Finder$' manage=off display=2 grid=2:1:1:0:1:1
```

swm moves the window to the display first, then works out the grid. Without a grid, the window keeps its relative position and swm fits its size to the destination. Tiled windows join the destination display's layout.

A grid only applies to a resizable, floating window. Use `manage=off`, float the window yourself, or send it to a Space with the `float` layout. Until the window qualifies, the grid waits.

Each placement action runs once, when it first matches or when its value changes. Moving or resizing the window by hand afterwards does not make it run again. A new `display` value also reapplies the matching grid on the new display. Changing only the grid does not repeat a display move that already happened.

Placement waits while the window is minimized, on an inactive or fullscreen Space, or bound for a display that is not connected. swm tries again on later window or display updates. It never switches Spaces to place a window, and never applies a grid on a different monitor instead.

Removing a placement rule leaves the window's frame and display as they are, unless an earlier matching rule takes over. swm forgets completed actions when a window closes or stops matching. If an Accessibility move or resize fails, swm logs the failure and stops retrying that action. Remove the rule and add it again to retry.

## Place windows on a Space with rules

The `space=<index>` action moves matching windows to a Space without switching to it:

```sh
swm query spaces
swm rule add label=slack app='^Slack$' space=3
```

The index must be a positive integer from `swm query spaces`. Rules do not accept `next`, `prev`, or Space IDs. Indexes follow the current Space order, so reordering Spaces can change where the rule sends windows next time it applies.

A rule can combine `space` with `manage` and `grid`, but not with `display`. Across matching rules, the last `space` or `display` action picks the destination and replaces the other. A later rule that only sets `grid` or `manage` keeps that destination. `swm rule list` shows the `space` value in each rule's JSON.

Only a window on one normal desktop Space can move, and the destination must be a normal desktop Space. Placement waits while the window is minimized, on an inactive or fullscreen Space, or being dragged. A missing destination, or an index that names a fullscreen Space, waits for later updates. A window already on the target Space stays where it is.

The window leaves its source tiling layout during the move, then joins the destination layout. A move to another display fits the window to that display's visible bounds. A matching grid applies after the move, once the destination Space is visible and the window is floating and resizable, using that Space's padding and gaps.

The `space` action runs when it first matches or when its value changes. Moving the window back by hand does not make it run again, and removing the rule does not move the window back. If a move fails, swm logs the failure and stops retrying that action. A move that timed out can still finish later, so check which Space the window is on before you remove and re-add the rule to retry.
