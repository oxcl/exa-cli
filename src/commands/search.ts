import { defineCommand } from "citty";

export const searchCommand = defineCommand({
  meta: {
    name: "search",
    description: "Search the web using Exa API",
  },
  args: {},
  run() {
    console.log("Search command - not yet implemented");
  },
});
