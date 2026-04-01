import type { Config } from "../config.js";
import type { StyleAdapter, RGBA } from "./types.js";

// ---------------------------------------------------------------------------
// Inline hex → normalised RGB helper (no external deps)
// ---------------------------------------------------------------------------
function h(hex: string): { r: number; g: number; b: number } {
  const n = parseInt(hex, 16);
  const round = (x: number) => Math.round(x * 1000) / 1000;
  return {
    r: round(((n >> 16) & 0xff) / 255),
    g: round(((n >> 8)  & 0xff) / 255),
    b: round( (n        & 0xff) / 255),
  };
}

// ---------------------------------------------------------------------------
// Parse a CSS hex colour string (#rgb / #rrggbb / #rrggbbaa) → RGBA | null
// ---------------------------------------------------------------------------
export function parseHexColor(value: string): RGBA | null {
  const v = value.trim();
  if (!v.startsWith("#")) return null;
  const hex = v.slice(1);
  let r: number, g: number, b: number, a = 1;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16) / 255;
    g = parseInt(hex[1] + hex[1], 16) / 255;
    b = parseInt(hex[2] + hex[2], 16) / 255;
  } else if (hex.length === 6) {
    r = parseInt(hex.slice(0, 2), 16) / 255;
    g = parseInt(hex.slice(2, 4), 16) / 255;
    b = parseInt(hex.slice(4, 6), 16) / 255;
  } else if (hex.length === 8) {
    r = parseInt(hex.slice(0, 2), 16) / 255;
    g = parseInt(hex.slice(2, 4), 16) / 255;
    b = parseInt(hex.slice(4, 6), 16) / 255;
    a = parseInt(hex.slice(6, 8), 16) / 255;
  } else {
    return null;
  }
  const round = (x: number) => Math.round(x * 1000) / 1000;
  return { r: round(r), g: round(g), b: round(b), a: round(a) };
}

// ---------------------------------------------------------------------------
// Full Tailwind colour shade table (50 – 950)
// Source: tailwindcss/src/public/colors.js (Tailwind v3/v4 palette)
// ---------------------------------------------------------------------------
export const TAILWIND_COLOR_SHADES: Record<string, Record<number, ReturnType<typeof h>>> = {
  slate:   { 50:h("f8fafc"),100:h("f1f5f9"),200:h("e2e8f0"),300:h("cbd5e1"),400:h("94a3b8"),500:h("64748b"),600:h("475569"),700:h("334155"),800:h("1e293b"),900:h("0f172a"),950:h("020617") },
  gray:    { 50:h("f9fafb"),100:h("f3f4f6"),200:h("e5e7eb"),300:h("d1d5db"),400:h("9ca3af"),500:h("6b7280"),600:h("4b5563"),700:h("374151"),800:h("1f2937"),900:h("111827"),950:h("030712") },
  zinc:    { 50:h("fafafa"),100:h("f4f4f5"),200:h("e4e4e7"),300:h("d4d4d8"),400:h("a1a1aa"),500:h("71717a"),600:h("52525b"),700:h("3f3f46"),800:h("27272a"),900:h("18181b"),950:h("09090b") },
  neutral: { 50:h("fafafa"),100:h("f5f5f5"),200:h("e5e5e5"),300:h("d4d4d4"),400:h("a3a3a3"),500:h("737373"),600:h("525252"),700:h("404040"),800:h("262626"),900:h("171717"),950:h("0a0a0a") },
  stone:   { 50:h("fafaf9"),100:h("f5f5f4"),200:h("e7e5e4"),300:h("d6d3d1"),400:h("a8a29e"),500:h("78716c"),600:h("57534e"),700:h("44403c"),800:h("292524"),900:h("1c1917"),950:h("0c0a09") },
  red:     { 50:h("fef2f2"),100:h("fee2e2"),200:h("fecaca"),300:h("fca5a5"),400:h("f87171"),500:h("ef4444"),600:h("dc2626"),700:h("b91c1c"),800:h("991b1b"),900:h("7f1d1d"),950:h("450a0a") },
  orange:  { 50:h("fff7ed"),100:h("ffedd5"),200:h("fed7aa"),300:h("fdba74"),400:h("fb923c"),500:h("f97316"),600:h("ea580c"),700:h("c2410c"),800:h("9a3412"),900:h("7c2d12"),950:h("431407") },
  amber:   { 50:h("fffbeb"),100:h("fef3c7"),200:h("fde68a"),300:h("fcd34d"),400:h("fbbf24"),500:h("f59e0b"),600:h("d97706"),700:h("b45309"),800:h("92400e"),900:h("78350f"),950:h("451a03") },
  yellow:  { 50:h("fefce8"),100:h("fef9c3"),200:h("fef08a"),300:h("fde047"),400:h("facc15"),500:h("eab308"),600:h("ca8a04"),700:h("a16207"),800:h("854d0e"),900:h("713f12"),950:h("422006") },
  lime:    { 50:h("f7fee7"),100:h("ecfccb"),200:h("d9f99d"),300:h("bef264"),400:h("a3e635"),500:h("84cc16"),600:h("65a30d"),700:h("4d7c0f"),800:h("3f6212"),900:h("365314"),950:h("1a2e05") },
  green:   { 50:h("f0fdf4"),100:h("dcfce7"),200:h("bbf7d0"),300:h("86efac"),400:h("4ade80"),500:h("22c55e"),600:h("16a34a"),700:h("15803d"),800:h("166534"),900:h("14532d"),950:h("052e16") },
  emerald: { 50:h("ecfdf5"),100:h("d1fae5"),200:h("a7f3d0"),300:h("6ee7b7"),400:h("34d399"),500:h("10b981"),600:h("059669"),700:h("047857"),800:h("065f46"),900:h("064e3b"),950:h("022c22") },
  teal:    { 50:h("f0fdfa"),100:h("ccfbf1"),200:h("99f6e4"),300:h("5eead4"),400:h("2dd4bf"),500:h("14b8a6"),600:h("0d9488"),700:h("0f766e"),800:h("115e59"),900:h("134e4a"),950:h("042f2e") },
  cyan:    { 50:h("ecfeff"),100:h("cffafe"),200:h("a5f3fc"),300:h("67e8f9"),400:h("22d3ee"),500:h("06b6d4"),600:h("0891b2"),700:h("0e7490"),800:h("155e75"),900:h("164e63"),950:h("083344") },
  sky:     { 50:h("f0f9ff"),100:h("e0f2fe"),200:h("bae6fd"),300:h("7dd3fc"),400:h("38bdf8"),500:h("0ea5e9"),600:h("0284c7"),700:h("0369a1"),800:h("075985"),900:h("0c4a6e"),950:h("082f49") },
  blue:    { 50:h("eff6ff"),100:h("dbeafe"),200:h("bfdbfe"),300:h("93c5fd"),400:h("60a5fa"),500:h("3b82f6"),600:h("2563eb"),700:h("1d4ed8"),800:h("1e40af"),900:h("1e3a8a"),950:h("172554") },
  indigo:  { 50:h("eef2ff"),100:h("e0e7ff"),200:h("c7d2fe"),300:h("a5b4fc"),400:h("818cf8"),500:h("6366f1"),600:h("4f46e5"),700:h("4338ca"),800:h("3730a3"),900:h("312e81"),950:h("1e1b4b") },
  violet:  { 50:h("f5f3ff"),100:h("ede9fe"),200:h("ddd6fe"),300:h("c4b5fd"),400:h("a78bfa"),500:h("8b5cf6"),600:h("7c3aed"),700:h("6d28d9"),800:h("5b21b6"),900:h("4c1d95"),950:h("2e1065") },
  purple:  { 50:h("faf5ff"),100:h("f3e8ff"),200:h("e9d5ff"),300:h("d8b4fe"),400:h("c084fc"),500:h("a855f7"),600:h("9333ea"),700:h("7e22ce"),800:h("6b21a8"),900:h("581c87"),950:h("3b0764") },
  fuchsia: { 50:h("fdf4ff"),100:h("fae8ff"),200:h("f5d0fe"),300:h("f0abfc"),400:h("e879f9"),500:h("d946ef"),600:h("c026d3"),700:h("a21caf"),800:h("86198f"),900:h("701a75"),950:h("4a044e") },
  pink:    { 50:h("fdf2f8"),100:h("fce7f3"),200:h("fbcfe8"),300:h("f9a8d4"),400:h("f472b6"),500:h("ec4899"),600:h("db2777"),700:h("be185d"),800:h("9d174d"),900:h("831843"),950:h("500724") },
  rose:    { 50:h("fff1f2"),100:h("ffe4e6"),200:h("fecdd3"),300:h("fda4af"),400:h("fb7185"),500:h("f43f5e"),600:h("e11d48"),700:h("be123c"),800:h("9f1239"),900:h("881337"),950:h("4c0519") },
};

// ---------------------------------------------------------------------------
// Keyword-only fallback (no shade) — white, black, and semantic aliases
// ---------------------------------------------------------------------------
export const TAILWIND_COLORS: Record<string, { r: number; g: number; b: number }> = {
  // Semantic aliases (framework-agnostic)
  primary:   { r: 0.2,  g: 0.4,  b: 1    },
  secondary: { r: 0.5,  g: 0.5,  b: 0.5  },
  danger:    { r: 0.9,  g: 0.2,  b: 0.2  },
  success:   { r: 0.2,  g: 0.8,  b: 0.4  },
  // Neutrals (no shade variant)
  white:     { r: 1,    g: 1,    b: 1    },
  black:     { r: 0,    g: 0,    b: 0    },
  transparent: { r: 0,  g: 0,    b: 0    },
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
// Resolve a Tailwind colour utility class → RGBA
// Strategy:
//   1. Shade-specific lookup: bg-blue-500 → TAILWIND_COLOR_SHADES["blue"][500]
//   2. Keyword fallback:      bg-white, bg-primary → TAILWIND_COLORS["white"]
// ---------------------------------------------------------------------------
export function resolveColorByKeyword(cls: string, _config: Config): RGBA | null {
  const lower = cls.toLowerCase();

  // 1. Shade resolution: match <prefix>-<color>-<shade>
  //    Prefixes: bg, text, border, ring, fill, stroke, from, to, via
  const shadeMatch = lower.match(
    /(?:^|-)(?:bg|text|border|ring|fill|stroke|from|to|via)-([a-z]+)-(\d+)(?:$|[^a-z])/
  );
  if (shadeMatch) {
    const colorName = shadeMatch[1];
    const shade = parseInt(shadeMatch[2], 10);
    const entry = TAILWIND_COLOR_SHADES[colorName]?.[shade];
    if (entry) return { ...entry, a: 1 };
  }

  // 2. Keyword fallback (white, black, primary, transparent, etc.)
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
