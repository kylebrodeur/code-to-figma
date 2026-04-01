import type { Config } from "../config.js";
import type { ParsedComponent, Variant, ExtractedStyles } from "../parser/react-parser.js";
import { getAdapter } from "../adapters/index.js";
import { parseHexColor } from "../adapters/tailwind-v3.js";

export interface FigmaToken {
  name: string;                                   // e.g. "brand/primary"
  type: "COLOR" | "FLOAT" | "STRING";             // Figma variable type
  value: { r: number; g: number; b: number; a: number } | number | string;
  source: string;                                // originating CSS class, e.g. "bg-blue-600"
}

export interface FigmaJsonOutput {
  name: string;
  type: "COMPONENT_SET" | "COMPONENT";
  variants: FigmaVariant[];
  styles: FigmaStyle;
  tokens: FigmaToken[];
  props: FigmaProp[];
  autoLayout: FigmaAutoLayout;
}

export interface FigmaVariant {
  name: string;
  properties: Record<string, string>;
  frame: {
    width: number;
    height: number;
    fills: FigmaFill[];
    strokes: FigmaStroke[];
    effects: FigmaEffect[];
    padding?: FigmaPadding;
    gap?: number;
    cornerRadius?: number;
  };
}

export interface FigmaStyle {
  layout: {
    display: "FLEX" | "GRID" | "NONE";
    flexDirection?: "ROW" | "COLUMN";
    gap: number;
    padding: FigmaPadding;
    alignment: {
      horizontal: "LEFT" | "CENTER" | "RIGHT" | "JUSTIFY";
      vertical: "TOP" | "CENTER" | "BOTTOM";
    };
  };
  typography: {
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    lineHeight: number | "AUTO";
    letterSpacing: number;
  };
}

export interface FigmaAutoLayout {
  mode: "HORIZONTAL" | "VERTICAL";
  wrap: boolean;
  gap: number;
  padding: FigmaPadding;
  alignment: {
    primary: "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";
    counter: "MIN" | "CENTER" | "MAX";
  };
}

export interface FigmaPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface FigmaFill {
  type: "SOLID" | "GRADIENT_LINEAR" | "GRADIENT_RADIAL" | "IMAGE";
  color?: { r: number; g: number; b: number; a: number };
  opacity?: number;
}

export interface FigmaStroke {
  type: "SOLID";
  color: { r: number; g: number; b: number; a: number };
  weight: number;
  alignment: "INSIDE" | "OUTSIDE" | "CENTER";
}

export interface FigmaEffect {
  type: "DROP_SHADOW" | "INNER_SHADOW" | "LAYER_BLUR" | "BACKGROUND_BLUR";
  color?: { r: number; g: number; b: number; a: number };
  offset?: { x: number; y: number };
  radius: number;
  spread?: number;
}

export interface FigmaProp {
  name: string;
  type: string;
  defaultValue?: string;
  variantProperty: boolean;
}

export function generateFigmaJson(
  component: ParsedComponent,
  config: Config
): FigmaJsonOutput {
  const variants: FigmaVariant[] = component.variants.map((variant) =>
    generateVariantFrame(variant, component.styles, config)
  );

  // If no variants, create a single default variant
  if (variants.length === 0) {
    variants.push({
      name: "Default",
      properties: {},
      frame: generateDefaultFrame(component.styles, config),
    });
  }

  const tokens = extractTokenNames(component.styles, config);

  return {
    name: component.name,
    type: variants.length > 1 ? "COMPONENT_SET" : "COMPONENT",
    variants,
    styles: generateFigmaStyles(component.styles, config),
    tokens,
    props: component.props.map((p) => ({
      name: p.name,
      type: p.type,
      defaultValue: p.defaultValue,
      variantProperty: ["variant", "size"].includes(p.name.toLowerCase()),
    })),
    autoLayout: generateAutoLayout(component.styles, config),
  };
}

function generateVariantFrame(
  variant: Variant,
  styles: ExtractedStyles,
  config: Config
): FigmaVariant {
  const fills: FigmaFill[] = [];
  
  // Background
  if (styles.visual.backgroundColor) {
    const color = mapTokenToColor(styles.visual.backgroundColor, config);
    if (color) {
      fills.push({
        type: "SOLID",
        color,
        opacity: 1,
      });
    }
  }

  // Text color
  const textColor = styles.visual.color
    ? mapTokenToColor(styles.visual.color, config)
    : { r: 0, g: 0, b: 0, a: 1 };

  const { width, height } = inferFrameSize(styles, config);
  const cornerRadius = inferCornerRadius(styles);

  return {
    name: variant.name,
    properties: variant.propValues,
    frame: {
      width,
      height,
      fills,
      strokes: [],
      effects: [],
      padding: inferPadding(styles),
      gap: parseGap(styles.layout.gap),
      ...(cornerRadius !== undefined ? { cornerRadius } : {}),
    },
  };
}

function generateDefaultFrame(
  styles: ExtractedStyles,
  config: Config
): FigmaVariant["frame"] {
  const { width, height } = inferFrameSize(styles, config);
  const cornerRadius = inferCornerRadius(styles);

  return {
    width,
    height,
    fills: styles.visual.backgroundColor
      ? [{
          type: "SOLID",
          color: mapTokenToColor(styles.visual.backgroundColor, config) || { r: 0, g: 0, b: 0, a: 1 },
          opacity: 1,
        }]
      : [],
    strokes: [],
    effects: [],
    padding: inferPadding(styles),
    gap: parseGap(styles.layout.gap),
    ...(cornerRadius !== undefined ? { cornerRadius } : {}),
  };
}

function generateFigmaStyles(
  styles: ExtractedStyles,
  config: Config
): FigmaStyle {
  const adapter = getAdapter(config);
  return {
    layout: {
      display: (styles.layout.display?.toUpperCase() as any) || "FLEX",
      flexDirection: styles.layout.flexDirection?.toUpperCase() as any,
      gap: parseGap(styles.layout.gap),
      padding: inferPadding(styles),
      alignment: {
        horizontal: "CENTER",
        vertical: "CENTER",
      },
    },
    typography: {
      fontFamily: styles.typography.fontFamily || "Inter",
      fontSize: adapter.resolveFontSize(styles.typography.fontSize || "", config)
        ?? parseSizeNum(styles.typography.fontSize, 16),
      fontWeight: adapter.resolveFontWeight(styles.typography.fontWeight || "", config)
        ?? parseWeight(styles.typography.fontWeight) ?? 400,
      lineHeight: parseSize(styles.typography.lineHeight),
      letterSpacing: 0,
    },
  };
}

function generateAutoLayout(
  styles: ExtractedStyles,
  config: Config
): FigmaAutoLayout {
  const isHorizontal = styles.layout.flexDirection !== "column";
  
  return {
    mode: isHorizontal ? "HORIZONTAL" : "VERTICAL",
    wrap: false,
    gap: parseGap(styles.layout.gap),
    padding: inferPadding(styles),
    alignment: {
      primary: "CENTER",
      counter: "CENTER",
    },
  };
}

function extractTokenNames(
  styles: ExtractedStyles,
  config: Config
): FigmaToken[] {
  const tokens: FigmaToken[] = [];
  const seen = new Set<string>();
  const adapter = getAdapter(config);

  function pushColorToken(cls: string): void {
    if (seen.has(cls)) return;

    // 1. Explicit tokenMapping entry
    const mappedName = mapClassToToken(cls, config);
    if (mappedName && !seen.has(mappedName)) {
      seen.add(mappedName);
      const color = mapTokenToColor(cls, config);
      if (color) tokens.push({ name: mappedName, type: "COLOR", value: color, source: cls });
      return;
    }

    // 2. Adapter auto-token (e.g. shadcn semantic tokens)
    const auto = adapter.autoToken?.(cls, config);
    if (auto && !seen.has(auto.name)) {
      seen.add(auto.name);
      const color = mapTokenToColor(cls, config);
      if (color && auto.type === "COLOR") {
        tokens.push({ name: auto.name, type: "COLOR", value: color, source: cls });
      }
    }
  }

  // Color tokens from background and text color classes
  const colorClasses = [
    styles.visual.backgroundColor,
    styles.visual.color,
  ].filter(Boolean) as string[];
  for (const cls of colorClasses) pushColorToken(cls);

  // Spacing/sizing tokens from layout classes (explicit tokenMapping only)
  const spacingClasses = [
    styles.layout.gap,
    styles.layout.padding,
  ].filter(Boolean) as string[];

  for (const cls of spacingClasses) {
    const tokenName = mapClassToToken(cls, config);
    if (tokenName && !seen.has(tokenName)) {
      seen.add(tokenName);
      const num = parseInt(cls.replace(/\D/g, ""), 10);
      const val = isNaN(num) ? 0 : num * 4;
      tokens.push({ name: tokenName, type: "FLOAT", value: val, source: cls });
    }
  }

  return tokens;
}

function mapTokenToColor(
  cssClass: string | undefined,
  config: Config
): { r: number; g: number; b: number; a: number } | null {
  if (!cssClass) return null;
  // Inline style values (from style={{ backgroundColor: "#f00" }}) are raw hex
  if (cssClass.startsWith("#")) return parseHexColor(cssClass);
  return getAdapter(config).resolveColor(cssClass, config);
}

function mapClassToToken(
  cssClass: string,
  config: Config
): string | null {
  for (const [css, figma] of Object.entries(config.tokenMapping)) {
    if (cssClass.includes(css.replace("--", ""))) {
      return figma;
    }
  }
  return null;
}

function parseGap(gap: string | undefined): number {
  if (!gap) return 0;
  const num = parseInt(gap.replace(/\D/g, ""), 10);
  return isNaN(num) ? 0 : num * 4; // Tailwind spacing scale
}

function parseSize(size: string | undefined): number | "AUTO" {
  if (!size) return "AUTO";
  const num = parseInt(size.replace(/\D/g, ""), 10);
  return isNaN(num) ? "AUTO" : num;
}

function parseSizeNum(size: string | undefined, fallback: number): number {
  const result = parseSize(size);
  return result === "AUTO" ? fallback : result;
}

function parseWeight(weight: string | undefined): number {
  if (!weight) return 400;
  const num = parseInt(weight.replace(/\D/g, ""), 10);
  return isNaN(num) ? 400 : num;
}

// ---------------------------------------------------------------------------
// Tailwind rounded-* → cornerRadius in px
// ---------------------------------------------------------------------------
const ROUNDED_MAP: Record<string, number> = {
  "rounded-none": 0,
  "rounded-sm":   2,
  "rounded":      4,
  "rounded-md":   6,
  "rounded-lg":   8,
  "rounded-xl":   12,
  "rounded-2xl":  16,
  "rounded-3xl":  24,
  "rounded-full": 9999,
};

function inferCornerRadius(styles: ExtractedStyles): number | undefined {
  const cls = styles.visual.borderRadius;
  if (!cls) return undefined;
  // Check exact map first
  if (cls in ROUNDED_MAP) return ROUNDED_MAP[cls];
  // The class may be stored as raw px value from inline style={{ borderRadius: "8px" }}
  const px = parseInt(cls, 10);
  if (!isNaN(px)) return px;
  return undefined;
}

// ---------------------------------------------------------------------------
// Infer frame dimensions from font-size + padding
// ---------------------------------------------------------------------------
function inferFrameSize(
  styles: ExtractedStyles,
  config: Config
): { width: number; height: number } {
  const adapter = getAdapter(config);
  const fontSize =
    adapter.resolveFontSize(styles.typography.fontSize || "", config) ??
    parseSizeNum(styles.typography.fontSize, 16);
  const pad = inferPadding(styles);
  const height = Math.max(32, fontSize + pad.top + pad.bottom);
  const width  = Math.max(80, fontSize * 10 + pad.left + pad.right);
  return { width, height };
}

function inferPadding(styles: ExtractedStyles): FigmaPadding {
  const padding = styles.layout.padding || "";
  const value = parseGap(padding) || 12;
  
  return {
    top: value,
    right: value,
    bottom: value,
    left: value,
  };
}
