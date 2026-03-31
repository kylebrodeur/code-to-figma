#!/usr/bin/env node
import { Command } from "commander";
import pc from "picocolors";
import { initConfig } from "./commands/init.js";
import { scanFile } from "./commands/scan.js";
import { syncToFigma } from "./commands/sync.js";
import { watchFiles } from "./commands/watch.js";
import { loadConfig } from "./config.js";

const program = new Command();

program
  .name("code-to-figma")
  .description("Sync React components to Figma designs")
  .version("0.1.0");

program
  .command("init")
  .description("Initialize configuration file")
  .option("-f, --force", "Overwrite existing config")
  .action(async (options) => {
    console.log(pc.cyan("Initializing code-to-figma..."));
    await initConfig(options.force);
  });

program
  .command("scan <filePattern>")
  .description("Scan React components and generate Figma JSON")
  .option("-o, --output <dir>", "Output directory", ".figma")
  .option("-w, --watch", "Watch for changes")
  .action(async (filePattern, options) => {
    const config = await loadConfig();
    
    if (options.watch) {
      console.log(pc.cyan(`Watching ${filePattern}...`));
      await watchFiles(filePattern, options.output, config);
    } else {
      console.log(pc.cyan(`Scanning ${filePattern}...`));
      await scanFile(filePattern, options.output, config);
    }
  });

program
  .command("sync")
  .description("Sync generated JSON to Figma via REST API")
  .option("--dry-run", "Preview without uploading")
  .option("--file-key <key>", "Figma file key")
  .action(async (options) => {
    const config = await loadConfig();
    await syncToFigma({ ...config, ...options });
  });

program
  .command("plugin-output")
  .description("Generate JSON for Figma plugin consumption")
  .option("-i, --input <dir>", "Input directory", ".figma")
  .option("-o, --output <file>", "Output file", "plugin-data.json")
  .action(async (options) => {
    console.log(pc.cyan("Generating plugin output..."));
    // Implementation in commands/plugin-output.ts
  });

program.parse();
