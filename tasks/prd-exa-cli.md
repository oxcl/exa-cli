# PRD: exa-cli

## Introduction

Build a CLI tool called `exa-cli` that replaces the Exa MCP server using the Skill+CLI paradigm. The tool wraps the Exa search API (`exa-js` SDK) and exposes two core commands — `search` and `fetch` — with human-readable error handling, Zod-validated inputs, and multiple output formats (JSON, Markdown, LLM). It is distributed as standalone binaries for 5 platforms via GitHub Releases.

## Goals

- Provide a CLI alternative to the Exa MCP server with zero protocol overhead
- Validate all CLI inputs using Zod schemas with clear, actionable error messages
- Support three output formats: JSON (machine), Markdown (human), LLM (dense context)
- Run `exa auth` for first-time setup with interactive key entry and validation
- Build standalone binaries for Linux x64/arm64, macOS x64/arm64, and Windows x64
- Publish via GitHub Releases triggered by version tags
- Support stdin piping for `fetch` (batch URLs) and `search` (single query)

## User Stories

### US-001: Authenticate with Exa API
**Description:** As a user, I want to run `exa auth` and enter my API key interactively so that the CLI is configured for use.

**Acceptance Criteria:**
- [ ] `exa auth` prompts for API key using masked input (characters hidden)
- [ ] API key is validated against the Exa API before saving
- [ ] On success, key is saved to `~/.config/exa/config.json`
- [ ] On validation failure, error message shown: `exa: error: Authentication failed (401). Check your key with 'exa auth'`
- [ ] On network failure during validation, key is saved anyway with a warning
- [ ] Existing config is overwritten on re-run
- [ ] Typecheck passes

### US-002: Search the web
**Description:** As a user, I want to run `exa search "query"` and get search results back in my chosen format.

**Acceptance Criteria:**
- [ ] Positional argument `<query>` is accepted
- [ ] `--query` and `-q` flags work as aliases for the positional arg
- [ ] Default output format is `--format markdown`
- [ ] Default content type is `highlights` (can be overridden with `--text`, `--highlights`, `--summary`)
- [ ] Results are printed to stdout
- [ ] Empty results return `[]` (JSON) or empty markdown with exit code 0
- [ ] Typecheck passes

### US-003: Fetch content from URLs
**Description:** As a user, I want to run `exa fetch "url1" "url2"` to get clean content from known URLs.

**Acceptance Criteria:**
- [ ] Positional arguments `<url...>` accept 1 or more URLs
- [ ] Default output format is `--format markdown`
- [ ] Default content type is `text` (can be overridden with `--text`, `--highlights`, `--summary`)
- [ ] Results are printed to stdout
- [ ] Empty results return `[]` (JSON) or empty markdown with exit code 0
- [ ] Typecheck passes

### US-004: Search with all options
**Description:** As a user, I want to pass advanced search options to refine my results.

**Acceptance Criteria:**
- [ ] `--type` accepts: auto, fast, instant, deep-lite, deep, deep-reasoning
- [ ] `--num` accepts 1-10
- [ ] `--include-domains` accepts comma-separated domain list
- [ ] `--exclude-domains` accepts comma-separated domain list
- [ ] `--start-date` accepts YYYY-MM-DD format
- [ ] `--end-date` accepts YYYY-MM-DD format
- [ ] `--category` accepts: company, research paper, news, pdf, personal site, financial report, people
- [ ] `--text` requests full text content
- [ ] `--highlights` requests highlights explicitly
- [ ] `--summary` requests AI summary
- [ ] `--max-chars <n>` truncates text content (no default — Exa decides)
- [ ] `--format` accepts: json, markdown, llm
- [ ] All options validated by Zod; invalid values produce errors with the invalid value included
- [ ] Typecheck passes

### US-005: Fetch with all options
**Description:** As a user, I want to pass options to `fetch` to control content extraction.

**Acceptance Criteria:**
- [ ] `--text` requests full text (this is the default)
- [ ] `--highlights` requests highlights
- [ ] `--summary` requests AI summary
- [ ] `--max-chars <n>` truncates text content (no default)
- [ ] `--format` accepts: json, markdown, llm
- [ ] All options validated by Zod
- [ ] Typecheck passes

### US-006: JSON output format
**Description:** As a user, I want `--format json` so I can pipe results to `jq` or other tools.

**Acceptance Criteria:**
- [ ] `--format json` outputs valid, pretty-printed JSON to stdout
- [ ] JSON contains the full Exa response (results array, metadata)
- [ ] Works for both `search` and `fetch`
- [ ] Typecheck passes

### US-007: Markdown output format
**Description:** As a user, I want `--format markdown` (default) for human-readable terminal output.

**Acceptance Criteria:**
- [ ] Default format when `--format` is not specified
- [ ] Search results show: query, type, result count, time, cost, then numbered results with title, URL, score, published date, and content as blockquotes
- [ ] Fetch results show: URL, title, published date, then content
- [ ] Horizontal rules (`---`) separate results
- [ ] Works for both `search` and `fetch`
- [ ] Typecheck passes

### US-008: LLM output format
**Description:** As a user, I want `--format llm` for dense, context-efficient output suitable for LLM consumption.

**Acceptance Criteria:**
- [ ] `--format llm` produces dense output with no extra spacing or separators
- [ ] No metadata header (type, result count, time, cost are omitted)
- [ ] Results show: `[Title](url)` as heading, `score=X published=DATE author=NAME` (author only when present), then content
- [ ] No ANSI color codes in output (colors auto-disabled)
- [ ] No `--max-chars` truncation applied by default (Exa decides)
- [ ] Works for both `search` and `fetch`
- [ ] Typecheck passes

### US-009: Human-readable error handling
**Description:** As a user, I want clear, actionable error messages when something goes wrong.

**Acceptance Criteria:**
- [ ] All errors go to stderr (stdout is clean for piping)
- [ ] Errors are prefixed with `exa:` and colored red (via `chalk`)
- [ ] Colors are disabled when `NO_COLOR` env var is set
- [ ] Colors are disabled when `--format llm` is used
- [ ] Missing API key: `exa: error: No API key found. Run 'exa auth' to set one up.` (exit 2)
- [ ] Auth failure: `exa: error: Authentication failed (401). Check your key with 'exa auth'` (exit 2)
- [ ] Invalid Zod input: `exa: error: Invalid option '--type "turbo"': must be one of: auto, fast, instant, deep-lite, deep, deep-reasoning` (exit 1)
- [ ] Missing required arg: `exa: error: Missing required argument 'query'` (exit 1)
- [ ] Rate limit: `exa: error: Rate limited (429). Retry after 30 seconds.` (exit 3)
- [ ] Network error: `exa: error: Connection failed. Check your network and try again.` (exit 3)
- [ ] SIGINT (Ctrl+C): clean exit with code 130, no output
- [ ] Typecheck passes

### US-010: Stdin support for fetch
**Description:** As a user, I want to pipe URLs into `exa fetch` from stdin so I can batch-process URLs.

**Acceptance Criteria:**
- [ ] `cat urls.txt | exa fetch` reads one URL per line from stdin
- [ ] Positional args override stdin (both can be used, positional takes precedence)
- [ ] No stdin + no positional args: error `exa: error: No URLs provided. Pass URLs as arguments or pipe them to stdin.` (exit 1)
- [ ] Stdin detection uses `process.stdin.isTTY`
- [ ] Works with `--format json`, `--format markdown`, `--format llm`
- [ ] Typecheck passes

### US-011: Stdin support for search
**Description:** As a user, I want to pipe a query string into `exa search` from stdin.

**Acceptance Criteria:**
- [ ] `echo "bun runtime" | exa search` reads a single query from stdin
- [ ] Positional arg overrides stdin
- [ ] No stdin + no positional arg: error `exa: error: Missing required argument 'query'` (exit 1)
- [ ] Batch mode NOT supported (one query at a time)
- [ ] Typecheck passes

### US-012: Fetch multiple URLs with partial failure
**Description:** As a user, I want partial results when fetching multiple URLs where some may fail.

**Acceptance Criteria:**
- [ ] Successful URLs return their results in the output
- [ ] Failed URLs print a warning to stderr: `exa: warning: Failed to fetch URL: error message`
- [ ] Exit code is 0 if at least one URL succeeded
- [ ] Exit code is 1 if ALL URLs failed
- [ ] Works with all three output formats
- [ ] Typecheck passes

### US-013: Version flag
**Description:** As a user, I want `exa --version` to show the current version for debugging.

**Acceptance Criteria:**
- [ ] `exa --version` prints `exa X.Y.Z`
- [ ] `exa -v` also works
- [ ] Version is read from `package.json` and injected at build time
- [ ] Typecheck passes

### US-014: Build standalone binaries
**Description:** As a maintainer, I want GitHub Actions to build standalone binaries for all platforms.

**Acceptance Criteria:**
- [ ] `.github/workflows/release.yml` triggers on `v*` tag push
- [ ] Builds 5 binaries: linux-x64, linux-arm64, darwin-x64, darwin-arm64, windows-x64
- [ ] Uses `bun build --compile` with `--target` flag for each platform
- [ ] Binaries attached to GitHub Release
- [ ] Release created with tag name (e.g. `v1.0.0`)
- [ ] Typecheck passes

### US-015: Help text
**Description:** As a user, I want `exa --help` and `exa search --help` to show usage information.

**Acceptance Criteria:**
- [ ] `exa --help` shows available commands (search, fetch, auth)
- [ ] `exa search --help` shows all search flags with descriptions
- [ ] `exa fetch --help` shows all fetch flags with descriptions
- [ ] `exa auth --help` shows auth usage
- [ ] Help auto-generated by `citty` from command definitions
- [ ] Typecheck passes

## Functional Requirements

- FR-1: The CLI must read the Exa API key from `~/.config/exa/config.json`
- FR-2: The `auth` command must interactively prompt for an API key, validate it, and save it
- FR-3: The `search` command must accept a query via positional arg, `--query`, or `-q`
- FR-4: The `fetch` command must accept URLs via positional args or stdin (one per line)
- FR-5: All CLI inputs must be validated against Zod schemas before API calls
- FR-6: Invalid inputs must produce error messages that include the invalid value
- FR-7: The CLI must support `--format json`, `--format markdown`, and `--format llm`
- FR-8: Default format for `search` and `fetch` is `markdown`
- FR-9: Default content for `search` is `highlights`; for `fetch` is `text`
- FR-10: `--max-chars` must be optional with no default (Exa API decides)
- FR-11: Errors must go to stderr with `exa:` prefix and red color
- FR-12: Colors must respect `NO_COLOR` env var and be disabled in `--format llm`
- FR-13: Exit codes: 0=success, 1=general error, 2=auth error, 3=API error, 130=SIGINT
- FR-14: Empty results must return exit code 0 with empty output
- FR-15: Fetch with multiple URLs must return partial results and warn on failures
- FR-16: Rate limit (429) errors must include retry-after info when available
- FR-17: `--version` / `-v` must print version from package.json
- FR-18: Standalone binaries must be built for 5 platforms via GitHub Actions
- FR-19: `exa search` must not support batch mode (single query only)
- FR-20: `exa fetch` must support batch via positional args and stdin

## Non-Goals

- No MCP server implementation (this replaces MCP with CLI)
- No SKILL.md in this project (can be added later)
- No batch mode for `search` (single query only)
- No streaming output (future feature)
- No `answer` command (future feature — uses Exa's synthesized Q&A endpoint)
- No auto-retry on rate limits (user decides when to retry)
- No config file validation beyond checking apiKey exists
- No proxy support (relies on system proxy settings via fetch)
- No `--verbose` / `--debug` flags (future feature)
- No npm publish in initial release (only GitHub Releases with binaries)

## Technical Considerations

- **Runtime:** Bun (for development and compilation)
- **CLI framework:** `citty` (lightweight, native TS, auto-generated help)
- **Validation:** Zod schemas, one per command
- **SDK:** `exa-js` (official Exa JavaScript SDK, reads EXA_API_KEY from env)
- **Colors:** `chalk` with `NO_COLOR` support
- **Auth prompts:** `@inquirer/prompts` (masked password input)
- **Build:** `bun build --compile --target` for each platform
- **Config location:** `~/.config/exa/config.json` (XDG-style on Linux/macOS)
- **Exa SDK note:** `text`/`highlights`/`summary` are inside `contents` for `search`, but top-level for `getContents` (fetch). The SDK handles this difference.
- **Stdin:** Check `process.stdin.isTTY` to detect piped input
- **SIGINT:** Handle `SIGINT` event, exit with code 130, no output

## Success Metrics

- CLI installs and runs on all 5 target platforms without issues
- `exa search "query"` returns results in under 2 seconds for `--type auto`
- All Zod validation errors produce clear, actionable messages
- `--format llm` output contains zero ANSI escape codes
- GitHub Actions build produces 5 working binaries per release
- `exa auth` validates API key against Exa API before saving

## Open Questions

- None — all design decisions have been resolved in the interview.
