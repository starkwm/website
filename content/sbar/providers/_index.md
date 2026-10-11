---
title: "Providers"
description: "Compare provider output, updates, and configuration."
weight: 2
showDocList: false
---

Every provider uses the same item structure. Start with `id` and `type`, then add the settings listed on its page. Shared styling, actions, and refresh controls are available to every provider. Use [`text` templates](/sbar/configuration/text-templates/) to customise displayed labels; provider pages describe their default labels.

## Provider reference

| Provider | Updates | Dedicated configuration |
| --- | --- | --- |
| [Date and time](/sbar/providers/datetime/) | Every second | `format`, `dateStyle`, `timeStyle` |
| [Front application](/sbar/providers/frontapplication/) | Native events | `frontApplication` block |
| [Battery](/sbar/providers/battery/) | Native events | `battery` block |
| [Volume](/sbar/providers/volume/) | Native events | `volume` block |
| [Audio devices](/sbar/providers/audiodevice/) | Native events / 2-second retries when unavailable | `audioDevice` block |
| [Mail](/sbar/providers/mail/) | Configurable polling; 30 seconds by default | `mail` |
| [Network](/sbar/providers/network/) | Native events | `network` block |
| [Weather](/sbar/providers/weather/) | Configurable polling; 15 minutes by default | `weather` block |
| [VPN](/sbar/providers/vpn/) | Native events / 2-second retries when unavailable | `vpn` block |
| [Bluetooth](/sbar/providers/bluetooth/) | Native events / 2-second retries when unavailable | `bluetooth` block |
| [CPU](/sbar/providers/cpu/) | 2-second sampling | `cpu` block |
| [Memory](/sbar/providers/memory/) | 2-second sampling | `memory` block |
| [Disk](/sbar/providers/disk/) | 2-second sampling | `disk` block |
| [Throughput](/sbar/providers/throughput/) | 2-second sampling | `throughput` block |
| [Media](/sbar/providers/media/) | Playback notifications | `media` block |
| [Spaces](/sbar/providers/spaces/) | Native events | `spaces` block |
| [AeroSpace](/sbar/providers/aerospace/) | 2-second polling / fresh triggers | `aerospace` block |
| [Yabai](/sbar/providers/yabai/) | 2-second polling / fresh triggers | `yabai` block |
| [Shell command](/sbar/providers/command/) | Startup / trigger / interval | `command` block |
| [Process plugin](/sbar/providers/plugin/) | Process stream | `plugin` block |

## Layout items

Use these items for fixed text, containers, and spacing. See [shared item options](/sbar/configuration/items/) for containers and overflow.

| Type | Configuration | Behaviour |
| --- | --- | --- |
| `text` | `text` | Static text or a template using `id` and `value`; empty when omitted. |
| `group` | `children` | Inline children, nesting up to eight levels. |
| `popup` | `text`, `children` | Click to reveal children; label defaults to the item ID unless overridden. |
| `divider` | Shared styling | Vertical separator. |
| `spacer` | No dedicated options | Flexible empty space. |
