import type { Config } from "../config.js";
import type { StyleAdapter, RGBA } from "./types.js";

// ---------------------------------------------------------------------------
// Tailwind 500-weight color approximations (0–1 sRGB)
// Used as fill placeholders; accurate enough for Figma design previews.
// ---------------------------------------------------------------------------
export const TAILWIND_COLORS: Record<string, { r: number; g: number; b: number }> = {
  // Semantic aliases
  primary:   { r: 0.2,  g: 0.4,  b: 1    },
  secondary: { r: 0.5,  g: 0.5,  b: 0.5  },
  danger:    { r: 0.9,  g: 0.2,  b: 0.2  },
  success:   { r: 0.2,  g: 0.8,  b: 0.4  },
  // Neutral
  white:     { r: 1,    g: 1,    b: 1    },
  black:     { r: 0,    g: 0,    b: 0    },
  // Tailwind color palette keywords
  blue:      { r: 0.23, g: 0.51, b: 0.96 },
  red:       { r: 0.94, g: 0.27, b: 0.27 },
  green:     { r: 0.13, g: 0.77, b: 0.37 },
  yellow:    { r: 0.98, g: 0.8,  b: 0.08 },
  orange:    { r: 0.98, g: 0.45, b: 0.09 },
  purple:    { r: 0.66, g: 0.33, b: 0.97 },
  pink:      { r: 0.93, g: 0.28, b: 0.6  },
  indigo:    { r: 0.39, g: 0.4,  b: 0.95 },
  teal:      { r: 0.09, g: 0.72, b: 0.65 },
  cyan:      { r: 0.06, g: 0.72, b: 0.83 },
  gray:      { r: 0.62, g: 0.62, b: 0.62 },
  slate:     { r: 0.55, g: 0.6,  b: 0.67 },
  zinc:      { r: 0.58, g: 0.58, b: 0.6  },
  rose:      { r: 0.96, g: 0.26, b: 0.44 },
  violet:    { r: 0.6,  g: 0.33, b: 0.97 },
  sky:       { r: 0.22, g: 0.7,  b: 0.97 },
  lime:      { r: 0.52, g: 0.86, b: 0.11 },
  amber:     { r: 0.96, g: 0.62, b: 0.04 },
  emerald:   { r: 0.06, g: 0.73, b: 0.51 },
  neutral:   { r: 0.58, g: 0.58, b: 0.58 },
  stone:     { r: 0.6,  g: 0.57, b: 0.54 },
  fuchsia:   { r: 0.86, g: 0.27, b: 0.9  },
};

// ---------------------------------------------------------------------------
// Tailwind font-size scale (px)
// ---------------------------------------------------------------------------
export const TAILWIND_FONT_SIZES: Record<string, number> = {
  xs: 12, sm: 14, base: 16, lg: 18, xl: 20,
  "2xl": 24, "3xl": 30, "4xl": 36, "5xl": 48,
  "6xl": 60, "7xl": 72, "8xl": 96, "9xl": 128,
};

// ---------------------------------------------------------------------------
// Tailwind font-weight map
// ---------------------------------------------------------------------------
export const TAILWIND_FONT_WEIGHTS: Record<string, number> = {
  thin: 100, extralight: 200, light: 300, normal: 400,
  medium: 500, semibold: 600, bold: 700, extrabold: 800, black: 900,
};

// ---------------------------------------------------------------------------
// Shared helper — used by v4 and shadcn adapters
// ---------------------------------------------------------------------------
export function resolveColorByKeyword(cls: string, _config: Config): RGBA | null {
  const lower = cls.toLowerCase();
  for (const [name, color] of Object.entries(TAILWIND_COLORS)) {
    if (lower.includes(name)) {
      return { ...color, a: 1 };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Tailwind v3 adapter
// ---------------------------------------------------------------------------
export const tailwindV3Adapter: StyleAdapter = {
  name: "tailwind-v3",

  resolveColor(cls, config) {
    return resolveColorByKeyword(cls, config);
  },

  resolveFontSize(cls, _config) {
    if (!cls.startsWith("text-")) return null;
    const key = cls.slice(5); // strip "text-"
    return TAILWIND_FONT_SIZES[key] ?? null;
  },

  resolveFontWeight(cls, _config) {
    if (!cls.startsWith("font-")) return null;
    const key = cls.slice(5); // strip "font-"
    return TAILWIND_FONT_WEIGHTS[key] ?? null;
  },
};
