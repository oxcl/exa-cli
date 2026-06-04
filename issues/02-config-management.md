## What to build

Implement config read/write for `~/.config/exa/config.json`. The config stores the Exa API key. Provide a function to load the config and extract the API key for SDK initialization. Return a clear error when no API key is found.

## Acceptance criteria

- [ ] Config path resolved to `~/.config/exa/config.json`
- [ ] `loadConfig()` reads and parses the JSON file
- [ ] Returns `null` or empty object when file doesn't exist (no crash)
- [ ] `getApiKey()` returns the stored key or throws with `No API key found. Run 'exa auth' to set one up.`
- [ ] `saveConfig()` writes config file, creating directories if needed
- [ ] Config file is created with proper directory structure on first save
- [ ] TypeScript types defined for config shape

## Blocked by

- #1 Project Foundation
