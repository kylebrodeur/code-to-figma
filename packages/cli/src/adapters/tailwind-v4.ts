import type { Config } from "../config.js";
import type { StyleAdapter, RGBA } from "./types.js";
import { tailwindV3Adapter, resolveColorByKeyword, parseHexColor } from "./tailwind-v3.js";

/**
 * Tailwind v4 adapter.
 *
 * Tailwind v4 differences from v3:
 * - CSS-variable utility syntax: `bg-(--color-primary)` instead of arbitrary `bg-[var(--...)]`
 * - Config lives in CSS `@theme` blocks instead of tailwind.config.js
 * - Opacity modifier syntax is the same: `bg-blue-500/50`
 * - Named color utilities (bg-blue-500 etc.) are unchanged
 *
 * This adapter handles the new CSS-var syntax and falls through to v3
 * for all standard utility classes.
 */
export const tailwindV4Adapter: StyleAdapter = {
  name: "tailwind-v4",

  resolveColor(cls, config) {
    // Tailwind v4 CSS variable utility: bg-(--color-primary), text-(--my-token), etc.
    // Pattern: bg-(--varname) or text-(--varname)
    const cssVarMatch = cls.match(/^(?:bg|text|border|ring|fill|stroke)-\(--([^)]+)\)$/);
    if (cssVarMatch) {
      const varName = `--${cssVarMatch[1]}`;
      // If the var is in tokenMapping, it will be picked up as a token below;
      // provide a neutral placeholder fill so the frame has a fill at all.
      if (config.tokenMapping[varName] !== undefined) {
        const mapped = config.tokenMapping[varName];
        const rgba = parseHexColor(mapped);
        if (rgba) return rgba;
        // Non-hex token name (e.g. Figma variable path) — neutral placeholder
        return { r: 0.5, g: 0.5, b: 0.5, a: 1 };
      }
      return null;
    }

    return resolveColorByKeyword(cls, config);
  },

  resolveFontSize:   tailwindV3Adapter.resolveFontSize,
  resolveFontWeight: tailwindV3Adapter.resolveFontWeight,
};
