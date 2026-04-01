import { FSWatcher, watch } from "chokidar";
import { unlinkSync } from "fs";
import { basename, join, parse as parsePath } from "path";
import pc from "picocolors";
import type { Config } from "../config.js";
import { scanFile } from "./scan.js";

export async function watchFiles(
  pattern: string,
  outputDir: string,
  config: Config
): Promise<void> {
  const watcher: FSWatcher = watch(pattern, {
    persistent: true,
    ignoreInitial: false,
  });

  watcher
    .on("add", (path) => {
      console.log(pc.dim(`[add] ${path}`));
      scanFile(path, outputDir, config);
    })
    .on("change", (path) => {
      console.log(pc.dim(`[change] ${path}`));
      scanFile(path, outputDir, config);
    })
    .on("unlink", (filePath) => {
      console.log(pc.yellow(`[remove] ${filePath}`));
      const { name } = parsePath(filePath);
      const outputFile = join(outputDir, name + ".figma.json");
      try {
        unlinkSync(outputFile);
        console.log(pc.dim(`  removed ${basename(outputFile)}`));
      } catch {
        // File may not exist if scan never ran for it — safe to ignore
      }
    });

  console.log(pc.cyan("Watching for changes... Press Ctrl+C to stop."));
}
