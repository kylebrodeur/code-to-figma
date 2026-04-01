import type { Config } from "../config.js";
import type { StyleAdapter } from "./types.js";
import { tailwindV3Adapter } from "./tailwind-v3.js";
import { tailwindV4Adapter } from "./tailwind-v4.js";
import { shadcnAdapter } from "./shadcn.js";

export type { StyleAdapter, RGBA } from "./types.js";
export { tailwindV3Adapter } from "./tailwind-v3.js";
export { tailwindV4Adapter } from "./tailwind-v4.js";
export { shadcnAdapter } from "./shadcn.js";

/**
 * Adapter registry.
 *
 * Keys are all valid `styling` and `adapter` config values.
 * Falls back to tailwindV3Adapter for unknown values.
 *
 * Radix UI and Base UI are not styling systems themselves — they pair with
 * Tailwind/shadcn for styling, so they map to the appropriate adapter.
 */
const REGISTRY: Record<string, StyleAdapter> = {
  // Tailwind
  "tailwind":          tailwindV3Adapter,
  "tailwind-v3":       tailwindV3Adapter,
  "tailwind-v4":       tailwindV4Adapter,
  // shadcn (component library built on Tailwind + Radix)
  "shadcn":            shadcnAdapter,
  "shadcn-v4":         shadcnAdapter,
  // Radix UI — headless, typically styled with shadcn/tailwind
  "radix":             shadcnAdapter,
  "radix-ui":          shadcnAdapter,
  // Base UI — headless, pairs with Tailwind v4
  "base-ui":           tailwindV4Adapter,
  // Other
  "css-modules":       tailwindV3Adapter,
  "css":               tailwindV3Adapter,
  "styled-components": tailwindV3Adapter,
};

/**
 * Returns the StyleAdapter for the current config.
 * Explicit `config.adapter` takes priority over `config.styling`.
 */
export function getAdapter(config: Config): StyleAdapter {
  const key = config.adapter ?? config.styling ?? "tailwind";
  return REGISTRY[key] ?? tailwindV3Adapter;
}
