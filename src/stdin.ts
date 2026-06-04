export function readStdinLines(): Promise<string[]> {
  if (process.stdin.isTTY) {
    return Promise.resolve([]);
  }

  return new Promise((resolve) => {
    const chunks: Buffer[] = [];

    process.stdin.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    process.stdin.on("end", () => {
      const text = Buffer.concat(chunks).toString("utf-8");
      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      resolve(lines);
    });
  });
}
