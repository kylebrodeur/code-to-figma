import { FSWatcher, watch } from "chokidar";
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
    .on("unlink", (path) => {
      console.log(pc.yellow(`[remove] ${path}`));
      // Optionally clean up corresponding .figma.json
    });

  console.log(pc.cyan("Watching for changes... Press Ctrl+C to stop."));
}
