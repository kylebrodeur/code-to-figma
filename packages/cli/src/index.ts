// Main exports for @kylebrodeur/code-to-figma
export { parseComponent } from "./parser/react-parser.js";
export { generateFigmaJson } from "./generator/figma-generator.js";
export { loadConfig, type Config } from "./config.js";

// Re-export command functions for programmatic use
export { scanFile } from "./commands/scan.js";
export { syncToFigma } from "./commands/sync.js";
export { initConfig } from "./commands/init.js";
export { watchFiles } from "./commands/watch.js";
