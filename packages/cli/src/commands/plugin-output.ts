import { readFileSync, readdirSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import pc from "picocolors";
import type { FigmaJsonOutput } from "../generator/figma-generator.js";

export interface PluginOutputOptions {
  input: string;
  output: string;
}

export async function pluginOutput(options: PluginOutputOptions): Promise<void> {
  const inputDir = resolve(options.input);
  const outputFile = resolve(options.output);

  let entries: string[];
  try {
    entries = readdirSync(inputDir).filter((f) => f.endsWith(".figma.json"));
  } catch {
    console.error(pc.red(`✗ Cannot read input directory: ${inputDir}`));
    process.exit(1);
  }

  if (entries.length === 0) {
    console.log(pc.yellow(`No .figma.json files found in: ${inputDir}`));
    console.log(pc.dim(`  Run: code-to-figma scan <pattern> -o ${options.input}`));
    return;
  }

  const components: FigmaJsonOutput[] = [];
  const errors: string[] = [];

  for (const entry of entries) {
    const filePath = join(inputDir, entry);
    try {
      const raw = readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw) as FigmaJsonOutput;
      components.push(parsed);
      console.log(pc.green(`✓ ${entry}`) + pc.dim(` — ${parsed.type}, ${parsed.variants?.length ?? 1} variant(s)`));
    } catch (err) {
      errors.push(entry);
      console.error(pc.red(`✗ Failed to parse ${entry}:`), err instanceof Error ? err.message : err);
    }
  }

  if (components.length === 0) {
    console.error(pc.red("No valid components to bundle."));
    process.exit(1);
  }

  writeFileSync(outputFile, JSON.stringify(components, null, 2), "utf-8");

  console.log();
  console.log(pc.cyan(`Bundled ${components.length} component(s) → ${outputFile}`));
  if (errors.length > 0) {
    console.log(pc.yellow(`  ${errors.length} file(s) skipped due to parse errors`));
  }
  console.log(pc.dim(`  Next: Load ${options.output} in the Figma plugin`));
}
