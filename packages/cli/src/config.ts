import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

export interface Config {
  figmaFileKey?: string;
  figmaAccessToken?: string;
  componentGlob: string;
  tokenMapping: Record<string, string>;
  outputDir: string;
  framework: "react" | "vue" | "svelte";
  styling: "tailwind" | "tailwind-v4" | "shadcn" | "shadcn-v4" | "css-modules" | "styled-components" | "css";
  /**
   * Optional explicit adapter override.
   * Auto-detected from `styling` when omitted.
   * Valid values: "tailwind-v3" | "tailwind-v4" | "shadcn" | "shadcn-v4" | "radix" | "radix-ui" | "base-ui"
   */
  adapter?: string;
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
  writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
}

/**
 * Read the raw config JSON from disk (no defaultConfig merge), merge the
 * provided tokenMapping entries into it, and write it back.
 * Creates `.code-to-figma.json` with just the token mapping if no file exists.
 */
export function mergeTokenMapping(entries: Record<string, string>): void {
  const configPath = resolve(process.cwd(), ".code-to-figma.json");
  let raw: Record<string, unknown> = {};
  if (existsSync(configPath)) {
    try {
      raw = JSON.parse(readFileSync(configPath, "utf-8"));
    } catch {
      // Malformed file — start fresh but preserve by merging into object
    }
  }
  const existing = (raw.tokenMapping as Record<string, string> | undefined) ?? {};
  raw.tokenMapping = { ...existing, ...entries };
  writeFileSync(configPath, JSON.stringify(raw, null, 2) + "\n");
}

/**
 * Remove specific token mapping keys from the config file.
 */
export function removeTokenMappings(keys: string[]): number {
  const configPath = resolve(process.cwd(), ".code-to-figma.json");
  if (!existsSync(configPath)) return 0;
  let raw: Record<string, unknown> = {};
  try {
    raw = JSON.parse(readFileSync(configPath, "utf-8"));
  } catch {
    return 0;
  }
  const existing = (raw.tokenMapping as Record<string, string> | undefined) ?? {};
  let removed = 0;
  for (const key of keys) {
    if (key in existing) {
      delete existing[key];
      removed++;
    }
  }
  raw.tokenMapping = existing;
  writeFileSync(configPath, JSON.stringify(raw, null, 2) + "\n");
  return removed;
}

/**
 * Read only the tokenMapping from the config file (no defaultConfig merge).
 */
export function readTokenMapping(): Record<string, string> {
  const configPath = resolve(process.cwd(), ".code-to-figma.json");
  if (!existsSync(configPath)) return {};
  try {
    const raw = JSON.parse(readFileSync(configPath, "utf-8")) as Record<string, unknown>;
    return (raw.tokenMapping as Record<string, string>) ?? {};
  } catch {
    return {};
  }
}
