import { defineCommand } from "citty";
import { z } from "zod";
import { getApiKey } from "../config";
import { exaError, EXIT_API, EXIT_ERROR } from "../error";

const searchOptionsSchema = z.object({
  query: z.string().optional(),
  q: z.string().optional(),
  type: z
    .enum(["auto", "fast", "instant", "deep-lite", "deep", "deep-reasoning"])
    .optional(),
  num: z.coerce.number().int().min(1).max(10).optional(),
  "include-domains": z.string().optional(),
  "exclude-domains": z.string().optional(),
  "start-date": z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format").optional(),
  "end-date": z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format").optional(),
  category: z
    .enum(["company", "research paper", "news", "pdf", "personal site", "financial report", "people"])
    .optional(),
  text: z.boolean().optional(),
  highlights: z.boolean().optional(),
  summary: z.boolean().optional(),
  "max-chars": z.coerce.number().int().positive().optional(),
  format: z.enum(["json", "markdown", "llm"]).optional(),
});

type ExaResult = {
  title?: string;
  url: string;
  publishedDate?: string;
  author?: string;
  text?: string;
  highlights?: string[];
  highlightScores?: number[];
  summary?: string;
};

type ExaResponse = {
  requestId?: string;
  results: ExaResult[];
  costDollars?: { total?: number };
};

function buildContentsObject(
  opts: z.infer<typeof searchOptionsSchema>
): Record<string, unknown> | undefined {
  const hasText = opts.text === true;
  const hasHighlights = opts.highlights === true;
  const hasSummary = opts.summary === true;
  const hasMaxChars = opts["max-chars"] !== undefined;

  if (!hasText && !hasHighlights && !hasSummary) {
    return { highlights: true };
  }

  const contents: Record<string, unknown> = {};
  if (hasText) {
    contents.text = hasMaxChars ? { maxCharacters: opts["max-chars"] } : true;
  }
  if (hasHighlights) {
    contents.highlights = true;
  }
  if (hasSummary) {
    contents.summary = true;
  }
  return contents;
}

function buildRequestBody(
  query: string,
  opts: z.infer<typeof searchOptionsSchema>
): Record<string, unknown> {
  const body: Record<string, unknown> = { query };

  if (opts.type !== undefined) body.type = opts.type;
  if (opts.num !== undefined) body.numResults = opts.num;
  if (opts["include-domains"] !== undefined) {
    body.includeDomains = opts["include-domains"]
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);
  }
  if (opts["exclude-domains"] !== undefined) {
    body.excludeDomains = opts["exclude-domains"]
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);
  }
  if (opts["start-date"] !== undefined) {
    body.startPublishedDate = `${opts["start-date"]}T00:00:00.000Z`;
  }
  if (opts["end-date"] !== undefined) {
    body.endPublishedDate = `${opts["end-date"]}T00:00:00.000Z`;
  }
  if (opts.category !== undefined) body.category = opts.category;

  const contents = buildContentsObject(opts);
  if (contents) body.contents = contents;

  return body;
}

async function callExaSearch(
  apiKey: string,
  body: Record<string, unknown>
): Promise<ExaResponse> {
  let response: Response;
  try {
    response = await fetch("https://api.exa.ai/search", {
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

  return (await response.json()) as ExaResponse;
}

function formatMarkdown(data: ExaResponse, query: string, type?: string): string {
  const lines: string[] = [];

  lines.push(`# Search: ${query}`);
  lines.push("");
  lines.push(`- **Type:** ${type ?? "auto"}`);
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

    const content = result.highlights?.join("\n") ?? result.text ?? result.summary;
    if (content) {
      lines.push(`> ${content.replace(/\n/g, "\n> ")}`);
      lines.push("");
    }

    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

export const searchCommand = defineCommand({
  meta: {
    name: "search",
    description: "Search the web using Exa API",
  },
  args: {
    query: {
      type: "positional",
      description: "Search query",
      required: false,
    },
    q: {
      type: "string",
      description: "Search query (alias for positional)",
      alias: "query",
    },
    type: {
      type: "string",
      description:
        "Search type: auto, fast, instant, deep-lite, deep, deep-reasoning",
    },
    num: {
      type: "string",
      description: "Number of results (1-10)",
    },
    "include-domains": {
      type: "string",
      description: "Comma-separated list of domains to include",
    },
    "exclude-domains": {
      type: "string",
      description: "Comma-separated list of domains to exclude",
    },
    "start-date": {
      type: "string",
      description: "Start date in YYYY-MM-DD format",
    },
    "end-date": {
      type: "string",
      description: "End date in YYYY-MM-DD format",
    },
    category: {
      type: "string",
      description:
        "Category: company, research paper, news, pdf, personal site, financial report, people",
    },
    text: {
      type: "boolean",
      description: "Request full text content",
    },
    highlights: {
      type: "boolean",
      description: "Request highlights (default content type)",
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
  async run({ args }) {
    const parsed = searchOptionsSchema.safeParse(args);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      if (issue) {
        const path = issue.path.join(".");
        const flag = path ? `--${path}` : "query";
        exaError(
          `Invalid option '${flag}': ${issue.message}`,
          EXIT_ERROR
        );
      }
      exaError("Invalid input", EXIT_ERROR);
    }

    const opts = parsed.data;
    const query = args.query ?? opts.q;

    if (!query) {
      exaError("Missing required argument 'query'", EXIT_ERROR);
    }

    const apiKey = getApiKey();
    const body = buildRequestBody(query!, opts);
    const data = await callExaSearch(apiKey, body);

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
      console.log(formatMarkdown(data, query!, opts.type));
    }
  },
});
