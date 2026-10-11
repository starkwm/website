---
title: "Shell command"
description: "Captured output from a shell command."
weight: 20
category: "Extensions"
cadence: "Startup / trigger / interval"
options: "`command` block"
---

## Output

Captured text or a structured JSON result from a shell command. No symbol is added by default. Scripts run through `/bin/sh -c` and inherit the bar's environment.

## Configuration

Use the item-level [`text` template](/sbar/configuration/text-templates/) to customise or hide the label.

Set these options inside `command`.

| Property | Default | Description |
| --- | --- | --- |
| `showSymbol` | `true` | Show a configured or returned symbol, including an item-level override. |
| `script` | Required | Nonblank shell script string. |
| `timeout` | `5` | Timeout in seconds, 0.1 to 60. |
| `format` | `text` | `text` or `json`. |
| `output` | `combined` for text; `stdout` for JSON | Capture stdout and stderr together, or stdout only. JSON rejects explicit `combined`. |
| `maxLength` | `256` | Integer 1 to 4096; maximum displayed characters, including the truncation ellipsis. |
| `onError` | `show` | `show`, `keepLast`, or `hide`. |
| `symbols.font` | - | Shared installed font name for configured glyph symbols; each glyph can override it. |
| `symbols.size` | Resolved item/theme font size | Shared configured glyph size, 8 to 72 points; each glyph can override it. |
| `symbols.running` | Result symbol, if retained | Symbol while the command runs. |
| `symbols.success` | Result symbol, if supplied | Symbol after success. |
| `symbols.failure` | Retained result symbol, if any | Symbol after failure. |
| `tints.running` | Result tint, then normal tint | Colour while the command runs. |
| `tints.success` | Result tint, then normal tint | Colour after success. |
| `tints.failure` | Retained result tint, then normal tint | Colour after failure. |

### Text and JSON output

Text mode captures combined stdout/stderr unless `output: "stdout"` is set. JSON mode always reads stdout. The bar discards stderr when it is excluded. The bar collapses whitespace and line breaks into spaces, then truncates the text to `maxLength` with an ellipsis. A successful command can return empty text.

For structured output, set `format: "json"`. The script must emit one JSON object:

```json
{
  "text": "3 updates",
  "symbol": "shippingbox.fill",
  "tint": "#FFCC00",
  "hidden": false
}
```

| Result field | Required | Meaning |
| --- | --- | --- |
| `text` | Yes | String displayed by the item. |
| `symbol` | No | SF Symbol name or complete font glyph object. |
| `tint` | No | `#RRGGBB` or `#RRGGBBAA` colour. |
| `hidden` | No | Boolean controlling result visibility. |

A complete command item can emit that result directly:

```json
{
  "id": "updates",
  "type": "command",
  "command": {
    "script": "printf '%s\n' '{\"text\":\"3 updates\",\"symbol\":\"shippingbox.fill\",\"tint\":\"#FFCC00\"}'",
    "format": "json",
    "onError": "keepLast"
  }
}
```

Invalid JSON or invalid field values count as failures. Result data is never executed. A result glyph must include its own font, for example `{"glyph":"X","font":"Menlo","size":14}`.

### Appearance and errors {#state-appearance-and-errors}

Symbol precedence is item-level `symbol`, configured state symbol, then JSON result symbol. No symbol appears if none is supplied. Configured glyphs inherit `command.symbols.font` and optional `size`, with per-glyph overrides; see [font glyph symbols](/sbar/configuration/appearance/#font-glyph-symbols). SF Symbols use [`symbolFontWeight`](/sbar/configuration/appearance/#sf-symbol-weight). `showSymbol: false` hides every symbol source.

Configured state tints override the result tint; otherwise the result tint applies, then normal item/theme styling. Colours accept `#RRGGBB` or `#RRGGBBAA`.

| Error policy | Behaviour |
| --- | --- |
| `show` | Display the error. |
| `keepLast` | Retain the last successful result; show the error if there has been no success. |
| `hide` | Hide the item. |

Nonzero exits, timeouts, output-limit failures, and invalid JSON follow the selected policy. While a command runs again, the item shows its previous successful result with the configured running appearance. Before the first result, it shows `…`. A retained result keeps its JSON symbol, tint, and hidden state, subject to configured state overrides.

To change `command`, edit the configuration file. `sbar set` cannot change this block.

[Shared item options](/sbar/configuration/items/) cover styling, symbols, actions, priority, and enabled state.

### Text templates

The item-level `text` setting supports `id`, `value`, `symbol`, `status`, `error`. See [text templates](/sbar/configuration/text-templates/) for shared fields and syntax. `value` keeps the command's truncation and error policy. Templates cannot look up arbitrary JSON result fields. Result `text` is literal data, not a template.

`status` is `running`, `success`, or `failure`. Use [state conditions](/sbar/configuration/text-templates/#state-specific-labels) to choose a label for each state.

`value` contains the displayed result after whitespace cleanup, truncation, and the error policy. With `onError: "keepLast"`, a failed run retains the last successful result in `value`, while `status` is `failure` and `error` contains the new error. Before any successful run, `value` falls back to the error. `error` is empty during a new run and after success.

Use state conditions to distinguish a running check, its result, and a failure. This uses the repository-status script from the [example below](#example):

```json
{
  "id": "repo-status",
  "type": "command",
  "symbol": "chevron.left.forwardslash.chevron.right",
  "text": "{{#status=running}}Checking\u2026{{/status}}{{#status=success}}Project: {{value}}{{/status}}{{#status=failure}}Check failed: {{error}}{{/status}}",
  "command": {
    "script": "/bin/sh \"$HOME/.config/sbar/scripts/repo-status.sh\""
  },
  "refresh": {
    "mode": "interval",
    "seconds": 60
  }
}
```

This displays `Checking…` during a run, `Project: Clean` or the change count after success, and an error prefixed with `Check failed:` after failure.

`maxLength` limits the result used by `value`, not the completed template. Literal prefixes and `error` can make the final label longer. An item hidden by `onError: "hide"` or a retained JSON result's `hidden: true` stays hidden even if the template produces text.

## Updates

Commands run once at startup, including in manual mode. Item-ID triggers rerun them even without a refresh configuration; named refresh events also trigger runs. The bar combines triggers received within 50 milliseconds and replaces any running command.

Interval delays begin after completion; a trigger restarts that schedule. Changes to the script, timeout, output selection, format, or refresh settings rerun the command. Changing `maxLength`, `onError`, symbols, tints, or the item-level `text` changes how the result appears without rerunning the script. See [refresh policies](/sbar/configuration/refresh/).

## Current limits

Captured output is limited to 64 KB; exceeding that limit fails the run. This is separate from `maxLength`, which truncates displayed result text without failing the command. Scripts receive no interactive input because stdin is connected to `/dev/null`. Timeout, cancellation, and completion terminate the process group. Commands display their output after they finish. Use a [process plugin](/sbar/providers/plugin/) for streamed output.

## Example

Keep an eye on uncommitted changes in a local Git repository. Save this script as `~/.config/sbar/scripts/repo-status.sh`, creating the `scripts` directory if needed:

```sh
repo="$HOME/Code/my-project"
changes=$(git -C "$repo" status --porcelain --untracked-files=all) || exit $?
if [ -z "$changes" ]; then
  printf 'Clean\n'
else
  count=$(printf '%s\n' "$changes" | awk 'END { print NR }')
  printf '%s changes\n' "$count"
fi
```

Replace `$HOME/Code/my-project` with the repository path. Then add this item:

```json
{
  "id": "repo-status",
  "type": "command",
  "symbol": "chevron.left.forwardslash.chevron.right",
  "text": "Project: {{value}}",
  "command": {
    "script": "/bin/sh \"$HOME/.config/sbar/scripts/repo-status.sh\"",
    "tints": {
      "failure": "#FF6655"
    }
  },
  "refresh": {
    "mode": "interval",
    "seconds": 60
  }
}
```

The item displays `Project: Clean` or a count such as `Project: 3 changes`. It counts Git status entries, including staged, unstaged, and untracked files. A file changed in both the index and working tree counts once. It does not count changed lines or check the remote repository.

The command runs at startup and waits 60 seconds after each run before checking again. Read failures remain visible in red. Change the `Project:` prefix to your repository's name. The script runs through `/bin/sh`, so it does not need executable permissions.

After a commit, request an immediate update:

```sh
sbar trigger repo-status
```
