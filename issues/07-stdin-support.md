## What to build

Add stdin piping support to `search` and `fetch` commands. Detect piped input via `process.stdin.isTTY`. Positional args override stdin input. Proper error messages when no input is provided.

## Acceptance criteria

- [ ] `cat urls.txt | exa fetch` reads one URL per line from stdin
- [ ] `echo "bun runtime" | exa search` reads a single query from stdin
- [ ] Positional args override stdin (both can be used, positional takes precedence)
- [ ] Fetch: no stdin + no positional args → error `exa: error: No URLs provided. Pass URLs as arguments or pipe them to stdin.` (exit 1)
- [ ] Search: no stdin + no positional arg → error `exa: error: Missing required argument 'query'` (exit 1)
- [ ] Stdin detection uses `process.stdin.isTTY`
- [ ] Works with all three output formats (json, markdown, llm)
- [ ] Batch mode NOT supported for search (single query only)
- [ ] Typecheck passes

## Blocked by

- #5 Search Command
- #6 Fetch Command
