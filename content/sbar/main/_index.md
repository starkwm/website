---
title: "Main / unreleased"
description: "sbar changes available in source builds after v0.0.2."
weight: 3
---

These pages describe unreleased source builds, verified at [d25f0da](https://github.com/starkwm/sbar/commit/d25f0da981ee9ad447ec9e9e9d49ea79fbfa1817). They do not describe the Homebrew v0.0.2 release. The [release reference](/sbar/) remains available separately.

## Build the reviewed revision

The requirements remain macOS 26 and Xcode 26 with Swift 6.2 or later. In a separate source checkout:

```fish
git clone https://github.com/starkwm/sbar.git
cd sbar
git checkout d25f0da981ee9ad447ec9e9e9d49ea79fbfa1817
make build
```

Use `.build/debug/sbar` for this build. It is a standalone executable; Calendar and Reminders use EventKit in that process, without a helper app. These commands do not install a login service.

Use the [main configuration schema](/sbar/config.main.schema.json) with this revision. It is copied from the source schema at the revision above. Keep the [release schema](/sbar/config.schema.json) for v0.0.2 configurations. Validate a main configuration with `.build/debug/sbar validate --config /path/to/config.json`; validation does not request EventKit access.

## Reminders

The [Reminders provider](/sbar/main/reminders/) adds incomplete-task counts, next-task details, list discovery, and status-specific appearance. It requires separate Reminders permission, even when Calendar already has access.
