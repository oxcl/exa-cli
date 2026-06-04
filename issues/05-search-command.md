## What to build

Implement `exa search` command with all options. Accepts a query via positional arg or `--query`/`-q` flags. Supports all search refinement options (type, num, domains, dates, category) and content type selection. Outputs markdown by default. All inputs validated by Zod with clear error messages.

## Acceptance criteria

- [ ] Positional argument `<query>` accepted
- [ ] `--query` and `-q` flags work as aliases
- [ ] `--type` accepts: auto, fast, instant, deep-lite, deep, deep-reasoning
- [ ] `--num` accepts 1-10
- [ ] `--include-domains` accepts comma-separated domain list
- [ ] `--exclude-domains` accepts comma-separated domain list
- [ ] `--start-date` accepts YYYY-MM-DD format
- [ ] `--end-date` accepts YYYY-MM-DD format
- [ ] `--category` accepts: company, research paper, news, pdf, personal site, financial report, people
- [ ] `--text` requests full text content
- [ ] `--highlights` requests highlights (default content type)
- [ ] `--summary` requests AI summary
- [ ] `--max-chars <n>` truncates text content (no default)
- [ ] `--format` accepts: json, markdown, llm (default: markdown)
- [ ] All options validated by Zod; invalid values produce errors with the invalid value included
- [ ] Results printed to stdout
- [ ] Empty results return `[]` (JSON) or empty markdown with exit code 0
- [ ] Typecheck passes

## Blocked by

- #2 Config Management
- #3 Error Handling
