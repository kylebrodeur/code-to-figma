import pc from "picocolors";
import { mergeTokenMapping, removeTokenMappings, readTokenMapping } from "../config.js";

export function addToken(cssVar: string, figmaPath: string): void {
  mergeTokenMapping({ [cssVar]: figmaPath });
  console.log(`${pc.green("✓")} Added token mapping: ${pc.cyan(cssVar)} → ${pc.yellow(figmaPath)}`);
}

export function removeToken(cssVar: string): void {
  const removed = removeTokenMappings([cssVar]);
  if (removed > 0) {
    console.log(`${pc.green("✓")} Removed token mapping: ${pc.cyan(cssVar)}`);
  } else {
    console.log(`${pc.yellow("!")} No mapping found for: ${pc.cyan(cssVar)}`);
    process.exit(1);
  }
}

export function listTokens(): void {
  const mapping = readTokenMapping();
  const entries = Object.entries(mapping);
  if (entries.length === 0) {
    console.log(pc.dim("No token mappings configured."));
    console.log(pc.dim(`  Run: code-to-figma token add <cssVar> <figmaPath>`));
    return;
  }
  console.log(pc.cyan(`Token mappings (${entries.length}):\n`));
  const maxKey = Math.max(...entries.map(([k]) => k.length));
  for (const [key, val] of entries) {
    console.log(`  ${pc.cyan(key.padEnd(maxKey))}  →  ${pc.yellow(val)}`);
  }
}

export function clearTokens(): void {
  const mapping = readTokenMapping();
  const keys = Object.keys(mapping);
  if (keys.length === 0) {
    console.log(pc.dim("No token mappings to clear."));
    return;
  }
  removeTokenMappings(keys);
  console.log(`${pc.green("✓")} Cleared ${keys.length} token mapping${keys.length === 1 ? "" : "s"}.`);
}
