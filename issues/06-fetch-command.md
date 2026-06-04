## What to build

Implement `exa fetch` command with all options. Accepts one or more URLs as positional arguments. Supports content type selection and text truncation. Outputs markdown by default. Handles partial failures gracefully when fetching multiple URLs.

## Acceptance criteria

- [ ] Positional arguments `<url...>` accept 1 or more URLs
- [ ] `--text` requests full text (default content type)
- [ ] `--highlights` requests highlights
- [ ] `--summary` requests AI summary
- [ ] `--max-chars <n>` truncates text content (no default)
- [ ] `--format` accepts: json, markdown, llm (default: markdown)
- [ ] All options validated by Zod
- [ ] Results printed to stdout
- [ ] Empty results return `[]` (JSON) or empty markdown with exit code 0
- [ ] Partial failure: successful URLs return their results
- [ ] Partial failure: failed URLs print warning to stderr: `exa: warning: Failed to fetch URL: error message`
- [ ] Partial failure: exit 0 if at least one URL succeeded
- [ ] Partial failure: exit 1 if ALL URLs failed
- [ ] Typecheck passes

## Blocked by

- #2 Config Management
- #3 Error Handling
