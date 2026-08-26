import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.argv[2] ?? "docs";
const build = process.env.STUDYMATE_BUILD ?? new Date().toISOString();

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (entry.name.endsWith(".html")) {
      const html = await readFile(file, "utf8");
      const marker = `<!-- studymate-build:${build} -->`;
      if (html.includes(marker)) continue;
      const patch = `${marker}<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"/><meta http-equiv="Pragma" content="no-cache"/><meta name="studymate-build" content="${build}"/>`;
      const updated = html.replace("</head>", `${patch}</head>`);
      await writeFile(file, updated);
    }
  }
}

await stat(root);
await walk(root);
console.log(`Patched HTML cache metadata for build ${build}`);
