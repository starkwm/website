---
title: "Getting started"
description: "Install skbd, run it at login, and use its command-line options."
weight: 10
---

## Installation

Install skbd with [Homebrew](https://brew.sh) on Apple silicon:

```sh
brew tap starkwm/formulae
brew install starkwm/formulae/skbd@2
```

skbd will not start without a configuration, so write one first:

```sh
mkdir -p ~/.config/skbd
echo 'hyper - t: open -a Terminal' > ~/.config/skbd/skbdrc
```

Start skbd as a launchd service:

```sh
brew services start skbd@2
```

Grant Accessibility permission for the current `skbd` executable, then restart the service. If startup reports `failed to create event tap`, v0.0.10 prints the resolved executable path and the System Settings pane to check: Privacy & Security > Accessibility on macOS versions before 27.3, or Privacy & Security > System & App Protection Override on 27.3 or later.

Use **+** in that pane and Command-Shift-G in the file picker to select the executable at the printed path. After upgrading or rebuilding skbd, remove the old entry and add the current executable again.

```sh
brew services restart skbd@2
```

Press Hyper-T, which is Shift, Control, Option, and Command with T, to open Terminal.

### Build from source

To build v0.0.10 from [source](https://github.com/starkwm/skbd), install Xcode 26 or later and the macOS SDK:

```sh
git clone https://github.com/starkwm/skbd.git
cd skbd
git checkout v0.0.10
make build
```

Run `.build/debug/skbd` in the foreground. If it reports `failed to create event tap` at startup, check its Accessibility permission. A source build does not install a login service. To run skbd in the background, create a Launch Agent `.plist` file for it.

## Command line

Run `skbd` with no options to start the daemon. Only one instance can run for each user.

```text
-c, --config <path>     Use a configuration file or directory
-v, --version          Show version information
-h, --help             Show help information
```

The configuration path must exist and parse when skbd starts. `--help` and `--version` do not start the daemon.
