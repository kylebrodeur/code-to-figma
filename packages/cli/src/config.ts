import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

export interface Config {
  figmaFileKey?: string;
  figmaAccessToken?: string;
  componentGlob: string;
  tokenMapping: Record<string, string>;
  outputDir: string;
  framework: "react" | "vue" | "svelte";
  styling: "tailwind" | "css-modules" | "styled-components" | "css";
  parserOptions: {
    extractVariantsFromProps: boolean;
    detectClassNameUtilities: boolean;
    extractSpacing: boolean;
  };
}

const defaultConfig: Config = {
  componentGlob: "src/components/**/*.tsx",
  tokenMapping: {},
  outputDir: ".figma",
  framework: "react",
  styling: "tailwind",
  parserOptions: {
    extractVariantsFromProps: true,
    detectClassNameUtilities: true,
    extractSpacing: true,
  },
};

export async function loadConfig(): Promise<Config> {
  const configPath = resolve(process.cwd(), ".code-to-figma.json");
  
  if (!existsSync(configPath)) {
    console.log("No .code-to-figma.json found, using defaults");
    return defaultConfig;
  }

  try {
    const content = readFileSync(configPath, "utf-8");
    const userConfig = JSON.parse(content);
    return { ...defaultConfig, ...userConfig };
  } catch (error) {
    console.error("Error loading config:", error);
    return defaultConfig;
  }
}

export function createConfig(config: Partial<Config>): Config {
  return { ...defaultConfig, ...config };
}

export function writeConfig(config: Config): void {
  const configPath = resolve(process.cwd(), ".code-to-figma.json");
  writeFileSync(configPath, JSON.stringify(config, null, 2));
}
