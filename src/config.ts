import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

export interface Config {
  apiKey: string;
}

export const CONFIG_PATH = join(homedir(), ".config", "exa", "config.json");

export function loadConfig(): Config | null {
  if (!existsSync(CONFIG_PATH)) {
    return null;
  }

  try {
    const raw = readFileSync(CONFIG_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return parsed as Config;
  } catch {
    return null;
  }
}

export function getApiKey(): string {
  const config = loadConfig();
  if (!config?.apiKey) {
    throw new Error(
      "No API key found. Run 'exa auth' to set one up."
    );
  }
  return config.apiKey;
}

export function saveConfig(config: Config): void {
  const dir = join(homedir(), ".config", "exa");
  mkdirSync(dir, { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n");
}
