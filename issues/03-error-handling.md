## What to build

Implement the error handling system. All errors go to stderr with `exa:` prefix and red color via chalk. Support `NO_COLOR` env var to disable colors. Define exit code conventions. Handle SIGINT for clean exit.

## Acceptance criteria

- [ ] `exaError(message)` prints to stderr with `exa: error: ` prefix in red
- [ ] `exaWarning(message)` prints to stderr with `exa: warning: ` prefix in yellow
- [ ] Colors disabled when `NO_COLOR` env var is set
- [ ] Colors disabled when output format is `llm`
- [ ] Exit codes: 0=success, 1=general error, 2=auth/config error, 3=API/network error, 130=SIGINT
- [ ] SIGINT handler exits with code 130, produces no output
- [ ] Missing API key error: exit 2
- [ ] Auth failure (401): exit 2
- [ ] Invalid Zod input: exit 1, includes the invalid value in message
- [ ] Rate limit (429): exit 3, includes retry-after info when available
- [ ] Network error: exit 3

## Blocked by

- #1 Project Foundation
