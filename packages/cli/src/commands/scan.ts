import { mkdirSync, writeFileSync } from "fs";
import { dirname, join, parse } from "path";
import pc from "picocolors";
import glob from "fast-glob";
import type { Config } from "../config.js";
import { parseComponent } from "../parser/react-parser.js";
import { generateFigmaJson } from "../generator/figma-generator.js";

export async function scanFile(
  pattern: string,
  outputDir: string,
  config: Config
): Promise<void> {
  // Create output directory if needed
  mkdirSync(outputDir, { recursive: true });

  // Find files matching pattern
  const files = await glob(pattern, { absolute: true });

  if (files.length === 0) {
    console.log(pc.yellow(`No files found matching: ${pattern}`));
    return;
  }

  console.log(pc.dim(`Found ${files.length} file(s)...\n`));

  for (const filePath of files) {
    try {
      // Parse React component
      const componentInfo = await parseComponent(filePath, config);
      
      if (!componentInfo) {
        console.log(pc.yellow(`⚠ No components found in ${filePath}`));
        continue;
      }

      // Generate Figma-compatible JSON
      const figmaJson = generateFigmaJson(componentInfo, config);

      // Write output
      const { name } = parse(filePath);
      const outputPath = join(outputDir, `${name}.figma.json`);
      writeFileSync(outputPath, JSON.stringify(figmaJson, null, 2));

      console.log(pc.green(`✓ ${name} → ${outputPath}`));
      
      // Summary
      console.log(pc.dim(`  Variants: ${figmaJson.variants?.length || 1}`));
      console.log(pc.dim(`  Props detected: ${componentInfo.props?.length || 0}`));
      console.log(pc.dim(`  Tokens mapped: ${figmaJson.tokens?.length || 0}`));
      console.log();
    } catch (error) {
      console.error(pc.red(`✗ Error processing ${filePath}:`), error);
    }
  }

  console.log(pc.cyan(`Output written to: ${outputDir}`));
  console.log(pc.dim(`\nNext: Sync to Figma with: npx code-to-figma sync`));
}
