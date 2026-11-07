import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const indexPath = path.join(root, "index.html");
const previousIndex = readFileSync(indexPath, "utf8");

try {
  // Rebuild from React source, not from the previously bundled GitHub Pages file.
  writeFileSync(indexPath, readFileSync(new URL("./index.template.html", import.meta.url)));
  const build = spawnSync("npm", ["run", "build"], {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (build.error) throw build.error;
  if (build.status !== 0) throw new Error("The presentation build failed.");

  const html = readFileSync(path.join(root, "dist/index.html"), "utf8");
  mkdirSync(path.join(root, "docs"), { recursive: true });
  for (const file of ["index.html", "404.html", "docs/index.html", "dist/404.html"]) {
    writeFileSync(path.join(root, file), html);
  }
  for (const file of [".nojekyll", "docs/.nojekyll", "dist/.nojekyll"]) {
    writeFileSync(path.join(root, file), "");
  }
  console.log("Updated all GitHub Pages copies from the React source.");
} catch (error) {
  writeFileSync(indexPath, previousIndex);
  console.error(error);
  process.exitCode = 1;
}