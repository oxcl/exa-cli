import { defineCommand } from "citty";

export const fetchCommand = defineCommand({
  meta: {
    name: "fetch",
    description: "Fetch content from URLs using Exa API",
  },
  args: {},
  run() {
    console.log("Fetch command - not yet implemented");
  },
});
