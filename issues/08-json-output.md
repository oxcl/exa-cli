## What to build

Implement `--format json` output for both `search` and `fetch` commands. Outputs valid, pretty-printed JSON to stdout containing the full Exa response.

## Acceptance criteria

- [ ] `--format json` outputs valid, pretty-printed JSON to stdout
- [ ] JSON contains the full Exa response (results array, metadata)
- [ ] Works for both `search` and `fetch`
- [ ] Empty results output `[]`
- [ ] Typecheck passes

## Blocked by

- #5 Search Command
- #6 Fetch Command
