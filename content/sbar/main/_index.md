---
title: "v0.0.3 and main"
description: "sbar v0.0.3 source builds and the reviewed main revision."
weight: 3
---

These pages describe [v0.0.3](https://github.com/starkwm/sbar/releases/tag/v0.0.3) and main at [d490fae](https://github.com/starkwm/sbar/commit/d490fae32148d2d242e849db434ee5f782fcf25d), verified on 3 November 2026. The tag and reviewed main revision are identical; there are no additional unreleased changes at this revision. Homebrew also installs v0.0.3. See the [installation guide](/sbar/) to install it without building from source.

## Build the reviewed revision

The requirements remain macOS 26 and Xcode 26 with Swift 6.2 or later. In a separate source checkout:

```fish
git clone https://github.com/starkwm/sbar.git
cd sbar
git checkout d490fae32148d2d242e849db434ee5f782fcf25d
make build
```

Use `.build/debug/sbar` for this build. It is a standalone executable; Calendar and Reminders use EventKit in that process, without a helper app. These commands do not install a login service.

Use the [main configuration schema](/sbar/config.main.schema.json) with this revision. It is copied from the source schema at the revision above. The [release schema](/sbar/config.schema.json) also targets v0.0.3 and is identical at this revision. Validate a v0.0.3 or main configuration with `.build/debug/sbar validate --config /path/to/config.json`; validation does not request EventKit access.

## Reminders

The [Reminders provider](/sbar/main/reminders/) adds incomplete-task counts, next-task details, list discovery, and status-specific appearance. It requires separate Reminders permission, even when Calendar already has access.

## Pomodoro

The [Pomodoro provider](/sbar/main/pomodoro/) adds a shared focus and break timer, native bar actions, and `pomodoro` CLI controls. Timing changes take effect after Reset; no session is saved across restarts.

## Agent activity

The [agent activity provider](/sbar/main/agent-activity/) adds shared session reporting, a native popup, templates and `agents` CLI controls, with optional Codex, Claude and pi adapters.
