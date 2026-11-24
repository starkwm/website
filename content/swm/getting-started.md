---
title: "Getting started"
description: "Install swm, run the daemon, and write a startup configuration."
weight: 10
---

## Installation

Install v0.0.36 with Homebrew on Apple silicon:

```sh
brew tap starkwm/formulae
brew install starkwm/formulae/swm
```

Read the [upgrade guide](/swm/upgrading/) before updating existing scripts.

Start the daemon now and at every login:

```sh
brew services start swm
```

Follow the [Accessibility permission instructions](#grant-accessibility-permission) below.

### Build from source

```sh
git clone https://github.com/starkwm/swm.git
cd swm
git checkout v0.0.36
make build
```

`make build` writes the binary to `.build/debug/swm`. Run it once, then follow the permission instructions below:

```sh
.build/debug/swm
```

A source build does not install a login service.

### Grant Accessibility permission

Without Accessibility permission, swm exits with an error naming the resolved path of the binary to add. Follow that path, including the versioned Homebrew directory rather than its symlink.

The v0.0.36 error directs macOS 27.3 and later to System Settings > Privacy & Security > System & App Protection Override. On earlier versions, it directs you to Privacy & Security > Accessibility. Add the binary there, then start swm again. If an upgraded or rebuilt binary is already listed but access fails, remove its entry and add it again.

### Upgrade

The client and daemon must use the same IPC format, so restart the daemon after every upgrade. For a Homebrew service, run `brew services restart swm`.

## Shell completions

`swm` generates completion scripts for Bash, Zsh, and Fish. Homebrew installs them for you.

For a manual installation, write the script to a directory your shell loads:

```sh
# Bash: source this file from ~/.bashrc if it is not loaded automatically.
mkdir -p ~/.local/share/bash-completion/completions
swm --generate-completion-script bash > ~/.local/share/bash-completion/completions/swm

# Zsh: add ~/.zfunc to fpath before running compinit in ~/.zshrc.
mkdir -p ~/.zfunc
swm --generate-completion-script zsh > ~/.zfunc/_swm

# Fish
mkdir -p ~/.config/fish/completions
swm --generate-completion-script fish > ~/.config/fish/completions/swm.fish
```

Restart the shell to load the new script.

## Configuration file

At startup, the daemon runs `~/.config/swm/swmrc` if it exists. Pass `--config <path>` to run a different file. That file must exist. `swm` makes the file executable by its owner when needed, and stops if the file exits with an error.

At startup, the file runs as a child of the daemon and can use its Accessibility access. A reload runs the file from the calling process instead. Keep the file and scripts it runs writable only by your user. The file and programs it starts can read and control other apps' windows through that access.

`swmrc` can be any executable. A shell script that calls `swm` is the simplest:

```sh
#!/bin/sh
set -e

swm config layout dwindle
swm config focus-follows-mouse autofocus
swm config animation-duration 0.18
swm config gap 8
swm config padding --top 8 --bottom 8 --left 8 --right 8
```

Run `swm reload` to run the file again, or `swm reload --config /path/to/swmrc` to run another one. On success, reload replaces every [rule](/swm/rules/) with those registered by the file. On failure, it keeps the previous rules and restores settings. Settings the file no longer mentions keep their current values. See [reload behavior and limits](/swm/cli/#reload-the-configuration).

See [global settings](/swm/settings/) for everything `swm config` can set.

## Keyboard shortcuts

`swm` does not bind keys. Use a hotkey daemon such as [skbd](/skbd/) to run its commands. Grid placement only works on floating windows, so run `swm window float on` on a tiled window before using these grid bindings:

```text
hyper - h: swm window grid 2 1 0 0 1 1
hyper - l: swm window grid 2 1 1 0 1 1
hyper - f: swm window grid 1 1 0 0 1 1
hyper - r: swm window focus recent
```

The first three place the focused window in the left half, the right half, or across the whole display. The last one returns focus to the previous window.
