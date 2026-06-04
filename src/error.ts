import chalk from "chalk";

export const EXIT_SUCCESS = 0;
export const EXIT_ERROR = 1;
export const EXIT_AUTH = 2;
export const EXIT_API = 3;
export const EXIT_SIGINT = 130;

if (process.env.NO_COLOR) {
  chalk.level = 0;
}

export function disableColors(): void {
  chalk.level = 0;
}

export function exaError(message: string, code: number = EXIT_ERROR): never {
  process.stderr.write(`exa: error: ${chalk.red(message)}\n`);
  process.exit(code);
}

export function exaWarning(message: string): void {
  process.stderr.write(`exa: warning: ${chalk.yellow(message)}\n`);
}

export function setupSigintHandler(): void {
  process.on("SIGINT", () => {
    process.exit(EXIT_SIGINT);
  });
}
