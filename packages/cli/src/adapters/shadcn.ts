import type { Config } from "../config.js";
import type { StyleAdapter, RGBA } from "./types.js";
import { tailwindV3Adapter, resolveColorByKeyword } from "./tailwind-v3.js";

/**
 * shadcn v4 adapter.
 *
 * shadcn v4 uses CSS variables for all theme tokens.  Components reference
 * them via semantic Tailwind utilities:
 *
 *   bg-background, bg-card, bg-primary, bg-secondary, bg-muted, bg-accent,
 *   bg-destructive, bg-popover
 *   text-foreground, text-primary-foreground, text-muted-foreground …
 *   border-border, border-input, ring-ring
 *
 * This adapter:
 * 1. Maps those semantic classes to sensible light-mode RGBA placeholders
 *    (accurate enough for design review; users override via Figma Variables).
 * 2. Implements `autoToken()` so semantic classes automatically emit Figma
 *    Variable token entries without needing `tokenMapping` config.
 * 3. Falls through to Tailwind v3 for numeric palette classes (bg-blue-500
 *    etc.) which shadcn components also use inline.
 *
 * Works equally for Radix UI and Base UI components since they typically
 * pair with shadcn/Tailwind for styling.
 */

// Light-mode defaults — approximated sRGB (0–1)
// Source palette: shadcn/ui default "zinc" theme (https://ui.shadcn.com/theming)
const SHADCN_TOKENS: Record<string, RGBA> = {
  background:              { r: 1,     g: 1,     b: 1,     a: 1 },
  foreground:              { r: 0.047, g: 0.039, b: 0.035, a: 1 }, // zinc-950
  card:                    { r: 1,     g: 1,     b: 1,     a: 1 },
  "card-foreground":       { r: 0.047, g: 0.039, b: 0.035, a: 1 },
  popover:                 { r: 1,     g: 1,     b: 1,     a: 1 },
  "popover-foreground":    { r: 0.047, g: 0.039, b: 0.035, a: 1 },
  primary:                 { r: 0.094, g: 0.094, b: 0.106, a: 1 }, // zinc-900
  "primary-foreground":    { r: 0.98,  g: 0.98,  b: 0.98,  a: 1 },
  secondary:               { r: 0.957, g: 0.957, b: 0.961, a: 1 }, // zinc-100
  "secondary-foreground":  { r: 0.094, g: 0.094, b: 0.106, a: 1 },
  muted:                   { r: 0.957, g: 0.957, b: 0.961, a: 1 },
  "muted-foreground":      { r: 0.435, g: 0.435, b: 0.455, a: 1 }, // zinc-500
  accent:                  { r: 0.957, g: 0.957, b: 0.961, a: 1 },
  "accent-foreground":     { r: 0.094, g: 0.094, b: 0.106, a: 1 },
  destructive:             { r: 0.937, g: 0.263, b: 0.263, a: 1 }, // red-500
  "destructive-foreground":{ r: 0.98,  g: 0.98,  b: 0.98,  a: 1 },
  border:                  { r: 0.894, g: 0.894, b: 0.906, a: 1 }, // zinc-200
  input:                   { r: 0.894, g: 0.894, b: 0.906, a: 1 },
  ring:                    { r: 0.094, g: 0.094, b: 0.106, a: 1 },
  sidebar:                 { r: 0.98,  g: 0.98,  b: 0.984, a: 1 },
  "sidebar-foreground":    { r: 0.235, g: 0.247, b: 0.275, a: 1 },
  "sidebar-primary":       { r: 0.094, g: 0.094, b: 0.106, a: 1 },
  "sidebar-accent":        { r: 0.941, g: 0.945, b: 0.953, a: 1 },
  "sidebar-border":        { r: 0.878, g: 0.886, b: 0.898, a: 1 },
  "sidebar-ring":          { r: 0.471, g: 0.525, b: 0.596, a: 1 },
  chart1:                  { r: 0.91,  g: 0.396, b: 0.227, a: 1 },
  chart2:                  { r: 0.208, g: 0.62,  b: 0.565, a: 1 },
  chart3:                  { r: 0.235, g: 0.361, b: 0.455, a: 1 },
  chart4:                  { r: 0.914, g: 0.686, b: 0.294, a: 1 },
  chart5:                  { r: 0.886, g: 0.455, b: 0.282, a: 1 },
};

const COLOR_PREFIXES = ["bg-", "text-", "border-", "ring-", "fill-", "stroke-"] as const;

function extractShadcnKey(cls: string): string | null {
  for (const prefix of COLOR_PREFIXES) {
    if (cls.startsWith(prefix)) {
      const key = cls.slice(prefix.length);
      if (SHADCN_TOKENS[key] !== undefined) return key;
    }
  }
  return null;
}

export const shadcnAdapter: StyleAdapter = {
  name: "shadcn",

  resolveColor(cls, config) {
    const key = extractShadcnKey(cls);
    if (key !== null) return SHADCN_TOKENS[key];
    // Fall through to standard Tailwind color keywords for non-semantic classes
    return resolveColorByKeyword(cls, config);
  },

  resolveFontSize:   tailwindV3Adapter.resolveFontSize,
  resolveFontWeight: tailwindV3Adapter.resolveFontWeight,

  /**
   * Emit Figma Variable token metadata for every shadcn semantic class,
   * without requiring an explicit tokenMapping entry.
   * Token name format: "color/<key>"  e.g. "color/primary", "color/destructive"
   */
  autoToken(cls, _config) {
    const key = extractShadcnKey(cls);
    if (key === null) return null;
    return { name: `color/${key}`, type: "COLOR" };
  },
};
