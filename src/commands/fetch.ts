import { defineCommand } from "citty";
import { z } from "zod";
import { getApiKey } from "../config";
import { exaError, exaWarning, EXIT_API, EXIT_ERROR } from "../error";
import { readStdinLines } from "../stdin";

const fetchOptionsSchema = z.object({
  urls: z.array(z.string()).optional(),
  text: z.boolean().optional(),
  highlights: z.boolean().optional(),
  summary: z.boolean().optional(),
  "max-chars": z.coerce.number().int().positive().optional(),
  format: z.enum(["json", "markdown", "llm"]).optional(),
});

type ExaResult = {
  title?: string;
  url: string;
  id?: string;
  publishedDate?: string;
  author?: string;
  text?: string;
  highlights?: string[];
  highlightScores?: number[];
  summary?: string;
};

type ExaStatus = {
  id: string;
  status: "success" | "error";
  error?: {
    tag: string;
    httpStatusCode?: number;
  };
};

type ExaContentsResponse = {
  requestId?: string;
  results: ExaResult[];
  statuses?: ExaStatus[];
  costDollars?: { total?: number };
};

function buildRequestBody(
  urls: string[],
  opts: z.infer<typeof fetchOptionsSchema>
): Record<string, unknown> {
  const body: Record<string, unknown> = { urls };

  const hasText = opts.text === true;
  const hasHighlights = opts.highlights === true;
  const hasSummary = opts.summary === true;
  const hasMaxChars = opts["max-chars"] !== undefined;

  if (!hasText && !hasHighlights && !hasSummary) {
    body.text = true;
  } else {
    if (hasText) {
      body.text = hasMaxChars ? { maxCharacters: opts["max-chars"] } : true;
    }
    if (hasHighlights) {
      body.highlights = true;
    }
    if (hasSummary) {
      body.summary = true;
    }
  }

  return body;
}

async function callExaContents(
  apiKey: string,
  body: Record<string, unknown>
): Promise<ExaContentsResponse> {
  let response: Response;
  try {
    response = await fetch("https://api.exa.ai/contents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    exaError("Connection failed. Check your network and try again.", EXIT_API);
  }

  if (response.status === 401) {
    exaError(
      "Authentication failed (401). Check your key with 'exa auth'",
      EXIT_API
    );
  }

  if (response.status === 429) {
    const retryAfter = response.headers.get("retry-after");
    const msg = retryAfter
      ? `Rate limited (429). Retry after ${retryAfter} seconds.`
      : "Rate limited (429). Retry after a few seconds.";
    exaError(msg, EXIT_API);
  }

  if (!response.ok) {
    const text = await response.text();
    exaError(
      `API error (${response.status}): ${text.slice(0, 200)}`,
      EXIT_API
    );
  }

  return (await response.json()) as ExaContentsResponse;
}

function formatMarkdown(data: ExaContentsResponse): string {
  const lines: string[] = [];

  lines.push("# Fetched Content");
  lines.push("");
  lines.push(`- **Results:** ${data.results.length}`);
  if (data.costDollars?.total !== undefined) {
    lines.push(`- **Cost:** $${data.costDollars.total.toFixed(4)}`);
  }
  lines.push("");

  if (data.results.length === 0) {
    return lines.join("\n");
  }

  for (const [i, result] of data.results.entries()) {
    lines.push(`## ${i + 1}. ${result.title ?? "Untitled"}`);
    lines.push("");
    lines.push(`**URL:** ${result.url}`);

    const meta: string[] = [];
    if (result.author) meta.push(`Author: ${result.author}`);
    if (result.publishedDate) {
      meta.push(`Published: ${result.publishedDate.split("T")[0]}`);
    }
    if (meta.length > 0) {
      lines.push(meta.join(" | "));
    }
    lines.push("");

    const content =
      result.text ?? result.highlights?.join("\n") ?? result.summary;
    if (content) {
      lines.push(`> ${content.replace(/\n/g, "\n> ")}`);
      lines.push("");
    }

    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

function warnAboutFailures(statuses: ExaStatus[]): boolean {
  let allFailed = true;

  for (const status of statuses) {
    if (status.status === "error") {
      const errMsg = status.error?.tag ?? "unknown error";
      exaWarning(`Failed to fetch URL: ${errMsg} (${status.id})`);
    } else {
      allFailed = false;
    }
  }

  return allFailed;
}

function extractPositionalUrls(rawArgs: string[]): string[] {
  const urls: string[] = [];
  const flagsWithValues = new Set([
    "--max-chars",
    "--format",
    "-m",
    "-f",
  ]);

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg === undefined) continue;
    if (arg.startsWith("-")) {
      if (flagsWithValues.has(arg) && i + 1 < rawArgs.length) {
        i++;
      }
    } else {
      urls.push(arg);
    }
  }

  return urls;
}

export const fetchCommand = defineCommand({
  meta: {
    name: "fetch",
    description: "Fetch content from URLs using Exa API",
  },
  args: {
    text: {
      type: "boolean",
      description: "Request full text content (default content type)",
    },
    highlights: {
      type: "boolean",
      description: "Request highlights",
    },
    summary: {
      type: "boolean",
      description: "Request AI summary",
    },
    "max-chars": {
      type: "string",
      description: "Maximum characters for text content",
    },
    format: {
      type: "string",
      description: "Output format: json, markdown, llm",
    },
  },
  async run({ args, rawArgs }) {
    let urls = extractPositionalUrls(rawArgs);

    if (urls.length === 0) {
      urls = await readStdinLines();
    }

    const parsed = fetchOptionsSchema.safeParse({
      ...args,
      urls,
    });

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      if (issue) {
        const path = issue.path.join(".");
        const flag = path ? `--${path}` : "url";
        exaError(
          `Invalid option '${flag}': ${issue.message}`,
          EXIT_ERROR
        );
      }
      exaError("Invalid input", EXIT_ERROR);
    }

    const opts = parsed.data;

    if (urls.length === 0) {
      exaError(
        "No URLs provided. Pass URLs as arguments or pipe them to stdin.",
        EXIT_ERROR
      );
    }

    const apiKey = getApiKey();
    const body = buildRequestBody(urls, opts);
    const data = await callExaContents(apiKey, body);

    if (data.statuses && data.statuses.length > 0) {
      const allFailed = warnAboutFailures(data.statuses);

      if (allFailed) {
        process.exit(1);
      }
    }

    const format = opts.format ?? "markdown";

    if (format === "llm") {
      exaError(
        "Format 'llm' is not yet implemented. Use 'json' or 'markdown'.",
        EXIT_ERROR
      );
    }

    if (format === "json") {
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log(formatMarkdown(data));
    }
  },
});
