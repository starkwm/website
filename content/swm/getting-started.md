---
title: "Getting started"
description: "Install swm, run the daemon, and write a startup configuration."
weight: 10
---

## Installation

Install v0.0.31 with Homebrew on Apple silicon:

```sh
brew tap starkwm/formulae
brew install starkwm/formulae/swm
```

The Homebrew formula and bottle provide v0.0.31. Read the [upgrade guide](/swm/upgrading/) before updating existing scripts.

Start the daemon now and at every login:

```sh
brew services start swm
```

Grant Accessibility permission to `swm` in System Settings > Privacy & Security > Accessibility.

### Build from source

```sh
git clone https://github.com/starkwm/swm.git
cd swm
git checkout v0.0.31
make build
```

`make build` writes the binary to `.build/debug/swm`. Run it once, and grant Accessibility permission when macOS asks:

```sh
.build/debug/swm
```

A source build does not install a login service.

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

`swmrc` can be any executable. A shell script that calls `swm` is the simplest:

```sh
#!/bin/sh

swm config layout dwindle
swm config focus-follows-mouse autofocus
swm config animation-duration 0.18
swm config gap 8
swm config padding --top 8 --bottom 8 --left 8 --right 8
```

Run `swm reload` to run the file again, or `swm reload --config /path/to/swmrc` to run another one. Reload removes every [rule](/swm/rules/) and [signal](/swm/signals/) before it runs the file. Settings the file no longer mentions keep their current values.

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
