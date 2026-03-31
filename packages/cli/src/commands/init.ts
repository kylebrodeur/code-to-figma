import { existsSync } from "fs";
import pc from "picocolors";
import { createConfig, writeConfig } from "../config.js";

const templateConfig = {
  figmaFileKey: "YOUR_FIGMA_FILE_KEY",
  figmaAccessToken: "YOUR_FIGMA_ACCESS_TOKEN",
  componentGlob: "src/components/**/*.tsx",
  tokenMapping: {
    "--color-primary": "primary/500",
    "--color-secondary": "secondary/500",
    "--space-4": "spacing/4",
    "--space-8": "spacing/8",
  },
  outputDir: ".figma",
  framework: "react",
  styling: "tailwind",
  parserOptions: {
    extractVariantsFromProps: true,
    detectClassNameUtilities: true,
    extractSpacing: true,
  },
};

export async function initConfig(force = false): Promise<void> {
  const configPath = ".code-to-figma.json";
  
  if (existsSync(configPath) && !force) {
    console.log(pc.yellow(`${configPath} already exists. Use --force to overwrite.`));
    return;
  }

  writeConfig(templateConfig as any);
  console.log(pc.green(`✓ Created ${configPath}`));
  console.log(pc.dim("\nNext steps:"));
  console.log(pc.dim("1. Add your Figma file key and access token"));
  console.log(pc.dim("2. Customize token mappings for your design system"));
  console.log(pc.dim("3. Run: npx code-to-figma scan src/components/**/*.tsx"));
}
