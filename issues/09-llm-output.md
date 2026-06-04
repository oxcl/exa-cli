## What to build

Implement `--format llm` output for both `search` and `fetch` commands. Produces dense, context-efficient output suitable for LLM consumption. No metadata header, no ANSI codes, no extra spacing.

## Acceptance criteria

- [ ] `--format llm` produces dense output with no extra spacing or separators
- [ ] No metadata header (type, result count, time, cost are omitted)
- [ ] Search results show: `[Title](url)` as heading, `score=X published=DATE author=NAME` (author only when present), then content
- [ ] Fetch results show: `[Title](url)` as heading, `score=X published=DATE author=NAME` (author only when present), then content
- [ ] No ANSI color codes in output (colors auto-disabled)
- [ ] No `--max-chars` truncation applied by default (Exa decides)
- [ ] Works for both `search` and `fetch`
- [ ] Typecheck passes

## Blocked by

- #5 Search Command
- #6 Fetch Command
