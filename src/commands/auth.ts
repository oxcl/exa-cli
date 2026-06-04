import { defineCommand } from "citty";
import { password } from "@inquirer/prompts";
import { saveConfig } from "../config";
import { exaError, exaWarning, EXIT_AUTH } from "../error";

type ValidationResult =
  | { status: "valid" }
  | { status: "invalid" }
  | { status: "network_error" };

async function validateApiKey(apiKey: string): Promise<ValidationResult> {
  try {
    const response = await fetch("https://api.exa.ai/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query: "test", numResults: 1 }),
    });

    if (response.status === 401) {
      return { status: "invalid" };
    }

    return { status: "valid" };
  } catch {
    return { status: "network_error" };
  }
}

export const authCommand = defineCommand({
  meta: {
    name: "auth",
    description: "Manage Exa API authentication",
  },
  args: {},
  async run() {
    const apiKey = await password({
      message: "Enter your Exa API key:",
      mask: "*",
    });

    if (!apiKey) {
      exaError("API key cannot be empty.", EXIT_AUTH);
    }

    const result = await validateApiKey(apiKey);

    if (result.status === "invalid") {
      exaError(
        "Authentication failed (401). Check your key with 'exa auth'",
        EXIT_AUTH
      );
    }

    if (result.status === "network_error") {
      exaWarning(
        "Could not validate API key due to network error. Saving key anyway."
      );
    }

    saveConfig({ apiKey });
    console.log("API key saved successfully.");
  },
});
