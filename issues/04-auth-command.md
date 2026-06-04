## What to build

Implement `exa auth` command. Prompts user interactively for API key (masked input), validates it against the Exa API, and saves to config. Handles re-runs by overwriting existing config.

## Acceptance criteria

- [ ] `exa auth` prompts for API key using masked input (characters hidden)
- [ ] Uses `@inquirer/prompts` for interactive input
- [ ] API key validated against Exa API before saving
- [ ] On success, key saved to `~/.config/exa/config.json`
- [ ] On validation failure (401), shows: `exa: error: Authentication failed (401). Check your key with 'exa auth'` (exit 2)
- [ ] On network failure during validation, key saved anyway with warning
- [ ] Existing config overwritten on re-run
- [ ] Typecheck passes

## Blocked by

- #2 Config Management
- #3 Error Handling
