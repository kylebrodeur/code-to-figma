#!/usr/bin/env node
import { Command } from "commander";
import pc from "picocolors";
import { initConfig } from "./commands/init.js";
import { scanFile } from "./commands/scan.js";
import { readFromFigma } from "./commands/read.js";
import { watchFiles } from "./commands/watch.js";
import { pluginOutput } from "./commands/plugin-output.js";
import { addToken, removeToken, listTokens, clearTokens } from "./commands/token.js";
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
  .command("read")
  .description("Read components and styles from a Figma file via REST API")
  .requiredOption("--file-key <key>", "Figma file key")
  .option("--node-id <id>", "Specific node ID to read")
  .option("-o, --output <file>", "Write output to file")
  .action(async (options) => {
    const config = await loadConfig();
    await readFromFigma({ ...config, fileKey: options.fileKey, nodeId: options.nodeId, output: options.output });
  });

program
  .command("plugin-output")
  .description("Generate JSON for Figma plugin consumption")
  .option("-i, --input <dir>", "Input directory", ".figma")
  .option("-o, --output <file>", "Output file", "plugin-data.json")
  .action(async (options) => {
    console.log(pc.cyan("Generating plugin output..."));
    await pluginOutput({ input: options.input, output: options.output });
  });

// ─── token ────────────────────────────────────────────────────────────────────

const tokenCmd = program
  .command("token")
  .description("Manage token mappings in .code-to-figma.json");

tokenCmd
  .command("add")
  .description("Add or update a token mapping")
  .requiredOption("-k, --key <cssVar>", "CSS variable or class name (e.g. --color-primary, bg-brand)")
  .requiredOption("-p, --path <figmaPath>", "Figma variable path (e.g. color/primary, brand/500)")
  .action((opts: { key: string; path: string }) => {
    addToken(opts.key, opts.path);
  });

tokenCmd
  .command("remove")
  .description("Remove a token mapping by its CSS var or class name")
  .requiredOption("-k, --key <cssVar>", "CSS variable or class name to remove")
  .action((opts: { key: string }) => {
    removeToken(opts.key);
  });

tokenCmd
  .command("list")
  .description("List all token mappings in the config")
  .action(() => {
    listTokens();
  });

tokenCmd
  .command("clear")
  .description("Remove all token mappings from the config")
  .action(() => {
    clearTokens();
  });

program.parse();
