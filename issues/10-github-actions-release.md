## What to build

Create GitHub Actions workflow to build standalone binaries for 5 platforms and publish them to GitHub Releases on version tag push.

## Acceptance criteria

- [ ] `.github/workflows/release.yml` triggers on `v*` tag push
- [ ] Builds 5 binaries: linux-x64, linux-arm64, darwin-x64, darwin-arm64, windows-x64
- [ ] Uses `bun build --compile` with `--target` flag for each platform
- [ ] Binaries attached to GitHub Release
- [ ] Release created with tag name (e.g. `v1.0.0`)
- [ ] Binaries are named with platform identifiers (e.g. `exa-linux-x64`)
- [ ] Typecheck passes

## Blocked by

None - can start immediately
