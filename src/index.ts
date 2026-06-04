#!/usr/bin/env bun
import { defineCommand, runMain } from "citty";
import { authCommand } from "./commands/auth";
import { searchCommand } from "./commands/search";
import { fetchCommand } from "./commands/fetch";
import { readFileSync } from "fs";
import { resolve } from "path";

const pkg = JSON.parse(
  readFileSync(resolve(import.meta.dir, "../package.json"), "utf-8")
);

const main = defineCommand({
  meta: {
    name: "exa",
    version: pkg.version,
    description: "Exa AI command-line interface",
  },
  subCommands: {
    auth: authCommand,
    search: searchCommand,
    fetch: fetchCommand,
  },
});

runMain(main);
