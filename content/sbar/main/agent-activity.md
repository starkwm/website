---
title: "Agent activity (main / unreleased)"
description: "Report agent sessions to a shared native item and inspect them in a popup."
weight: 3
---

Available in [main source builds](/sbar/main/) at `0a8ad51`, not in the Homebrew v0.0.2 release.

An `agentActivity` item shows which agents are working or waiting for input. Click it for session details and a Dismiss button. All items and displays share one session store in memory. Reports arrive through the control socket; no shell command or streaming plugin is needed for the item itself.

```json
{
  "id": "agents",
  "type": "agentActivity",
  "text": "{{working}} working · {{needsInput}} needs input · {{idle}} idle",
  "agentActivity": {
    "finishedRetention": 30,
    "staleAfter": 300,
    "hideWhenEmpty": true,
    "showSymbol": true
  }
}
```

The settings above are the defaults. Omit `text` to show only states with nonzero counts. With no sessions, the item hides by default; `hideWhenEmpty: false` shows "No agent activity". The [standalone example](https://github.com/starkwm/sbar/tree/0a8ad51f8cb0eeb83bb408dea041fc1d9a23312a/examples/agent-activity) includes a separate socket and a simulator for manual testing.

## Reporting and control commands

Use the reviewed source binary from the repository root:

```fish
.build/debug/sbar agents report --source custom --session conversation --run turn-one --sequence 0 --state working --title Build --project /work/project
.build/debug/sbar agents report --source custom --session conversation --run turn-one --sequence 1 --state needsInput
.build/debug/sbar agents report --source custom --session conversation --run turn-two --replaces turn-one --sequence 0 --state working
.build/debug/sbar agents list
.build/debug/sbar agents dismiss --source custom --session conversation
```

These commands accept `--socket` and require an active `agentActivity` item. Responses contain an `ok` flag and a `value` array of stored entries. Each entry contains `report`, `startedAt`, `reportedAt`, `changedAt`, `expired` and `dismissed`. The list includes dismissed and retained entries, even when item filters or retention hide their rows.

`report --json FILE`, or `--json -` for standard input, accepts a versioned report:

```json
{"version":1,"source":"custom","session":"conversation","run":"turn-one","sequence":0,"state":"working","agent":"custom","title":"Build","project":"/work/project"}
```

`source` identifies the reporter, `session` the conversation and `run` the response attempt. Each must be nonempty, at most 256 UTF-8 bytes, and contain no colons or control characters. `sequence` is a nonnegative integer that increases within a run. The flags default it to zero; JSON must provide it.

An identical duplicate is accepted without renewing its timestamp. Older sequences and conflicting duplicates are rejected. A new run must name the current run in `replaces`; replaced runs are rejected while retained in the ordering history, which keeps the last 32 run IDs per session. Send reports in order for each source/session pair.

Optional `title`, `project`, `agent`, `host` and `identity` retain their previous values when omitted. Each accepts at most 1024 UTF-8 bytes without control characters. Send only identifiers and display metadata, not prompts, transcripts, credentials or tool arguments.

The store keeps up to 4096 sessions, including dismissed entries. At capacity it evicts the least recently reported session. Reload preserves sessions while an agent item remains active. Removing the last active item or stopping sbar clears all sessions and ordering data. On reconnect, inspect `agents list`; after a restart, republish the current state without `replaces`.

## States, retention and refresh

States are `working`, `needsInput`, `idle`, `finished`, `failed`, `interrupted` and `unknown`. Use `needsInput` for a real question or approval wait. `idle` means ready for another prompt. `finished` means a response has ended, not necessarily that its task succeeded.

Finished rows hide after `finishedRetention`, default 30 seconds from the state change. Unchanged heartbeats do not extend retention. Other rows remain until updated or dismissed. Dismissal lasts until the run or reported state changes.

Reports can include `heartbeatSeconds`, from 1 to 3600. Missing that deadline changes the visible state to `unknown`. Event-only reports without a heartbeat keep their last state. The popup marks a report stale after `staleAfter`, default 300 seconds; this warning does not itself change the state. Silence never implies success or failure.

Reports publish state immediately. A one-second task checks expiry and retention, and the popup updates elapsed and last-report times every second. Existing [refresh policies](/sbar/configuration/refresh/) control item presentation snapshots; they do not stop the shared store or its live popup. Removing a row from a filtered view does not delete it from `agents list`.

## Filters, templates and appearance

`sources` and `projects` select exact matches. Omit either array to select everything; an empty array selects nothing. Filters apply to item counts, default text, template sessions and popup rows. `finishedRetention` and `staleAfter` accept 1 to 86400 seconds.

Templates expose the common `value`, `id` and `symbol` fields, plus `total`, `status` and a count named after each state. A `sessions` loop exposes `source`, `session`, `run`, `agent`, `host`, `title`, `project`, `status`, `elapsed` in seconds and `lastReported` as an ISO timestamp, with the usual loop fields. For example:

```json
{"id":"agent-titles","type":"agentActivity","text":"{{working}}/{{total}} {{#sessions}}{{title}}{{/sessions}}"}
```

The aggregate status, symbol and tint follow this priority: `needsInput`, `failed`, `interrupted`, `working`, `unknown`, `idle`, `finished`. An empty selection has status `unknown`. Default symbols are `questionmark.bubble`, `exclamationmark.triangle`, `pause.circle`, `gearshape.2`, `questionmark.circle`, `moon.zzz` and `checkmark.bubble`, respectively. Needs-input defaults to `#FFCC00` and failed to `#FF5555`; other states have no provider tint.

Set `agentActivity.symbols` and `agentActivity.tints` by state name. Symbol `font` and `size` defaults belong inside `agentActivity`. Top-level symbol, text and style overrides still apply; `showSymbol: false` hides the symbol. A primary action can run alongside the native popup, and configured popup text or child items appear below the session list.

A custom host reporter can suppress a matching standalone row by providing the same nonempty `identity` and setting `host` on its own report. Matching uses that explicit identity, never title or project.

## Bundled adapters

`agents setup` supports `codex`, `claude` and `pi`. It requires an explicit configuration root. These commands modify agent settings:

```fish
.build/debug/sbar agents setup --source codex --root "$HOME/.codex"
.build/debug/sbar agents setup --source claude --root "$HOME/.claude"
.build/debug/sbar agents setup --source pi --root "$HOME/.pi/agent"
.build/debug/sbar agents doctor --source codex
.build/debug/sbar agents setup --source codex --root "$HOME/.codex" --remove
```

Setup uses Bash, `jq` and `lockf`. It installs owned hooks in Codex `hooks.json` or Claude `settings.json`, or an owned pi extension, preserving unrelated settings. `--remove` removes the owned integration. Pass `--socket` to select another bar. Installed shell hooks call the binary used for setup; rerun setup if its path changes.

Review the installed hooks and trust settings before activation. Setup does not grant trust or change approval settings. `doctor` finds the agent executable, runs a bounded version check and queries the reporting socket. It does not prove that hooks fire. Its source compatibility baselines are Codex 0.166.0, Claude Code 2.1.314 and pi 1.4.0; minimum compatible versions are not established.

Codex and Claude hooks report prompt/pre-tool activity, input waits and idle stops. Session end dismisses the row. Codex maps `Interrupt` to `interrupted`; Claude maps `StopFailure` to `failed` and handles permission/elicitation notifications. Both omit `PostToolUse` to avoid late callbacks reviving an idle session. Claude cancellation has no corresponding mapping, so it can leave a working row until another event arrives.

The pi extension reports settled responses as idle, errors as failed and cancellations as interrupted. It tracks UI input waits and sends heartbeats every ten seconds with a 30-second deadline. Codex and Claude event hooks omit heartbeats. Normal shell hooks hide reporting errors and return no approval decision or model text.

Hosted agents use the same adapters when their host loads the relevant agent settings and permits hooks. There is no bundled T3 adapter or thread-title mapping. Select the configuration root used by the host and verify event delivery in that environment.

For custom sources, use the reporting protocol above. The [source adapter guide](https://github.com/starkwm/sbar/blob/0a8ad51f8cb0eeb83bb408dea041fc1d9a23312a/docs/providers/agent-activity.md#writing-an-adapter-for-another-harness) includes ordering, retry and wrapper examples. Keep hook failures separate from agent approvals and response continuation.

Store and routing tests cover ordering, expiry, filtering and lifecycle behavior. Live popup rendering, supported-agent settings preservation and hook delivery still need manual checks. Test prompt start, a question or approval, response stop, a second turn and reconnect after restarting the bar.
