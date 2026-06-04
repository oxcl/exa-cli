import { defineCommand } from "citty";

export const authCommand = defineCommand({
  meta: {
    name: "auth",
    description: "Manage Exa API authentication",
  },
  args: {},
  run() {
    console.log("Auth command - not yet implemented");
  },
});
