## What to build

Set up the `exa-cli` project with Bun, TypeScript, and the core CLI framework. Create stub commands for `auth`, `search`, and `fetch` using `citty`. Add `--version`/`-v` flag that reads from `package.json`. Auto-generated help text via citty.

## Acceptance criteria

- [ ] Bun project initialized with TypeScript config
- [ ] `citty` CLI framework wired up with root command
- [ ] Stub `auth`, `search`, `fetch` subcommands registered
- [ ] `--version` / `-v` prints `exa X.Y.Z` from package.json
- [ ] `exa --help` shows available commands with descriptions
- [ ] `exa search --help` and `exa fetch --help` show flags (empty for now)
- [ ] Zod installed and available for validation
- [ ] Chalk installed for terminal colors
- [ ] TypeScript compiles without errors

## Blocked by

None - can start immediately
