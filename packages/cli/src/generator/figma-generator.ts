import type { Config } from "../config.js";
import type { ParsedComponent, Variant, ExtractedStyles } from "../parser/react-parser.js";

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

  return {
    name: variant.name,
    properties: variant.propValues,
    frame: {
      width: 200,
      height: 44,
      fills,
      strokes: [],
      effects: [],
      padding: inferPadding(styles),
      gap: parseGap(styles.layout.gap),
    },
  };
}

function generateDefaultFrame(
  styles: ExtractedStyles,
  config: Config
): FigmaVariant["frame"] {
  return {
    width: 200,
    height: 44,
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
  };
}

function generateFigmaStyles(
  styles: ExtractedStyles,
  config: Config
): FigmaStyle {
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
      fontSize: parseSizeNum(styles.typography.fontSize, 16),
      fontWeight: parseWeight(styles.typography.fontWeight) || 400,
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

  // Color tokens from background and text color classes
  const colorClasses = [
    styles.visual.backgroundColor,
    styles.visual.color,
  ].filter(Boolean) as string[];

  for (const cls of colorClasses) {
    const tokenName = mapClassToToken(cls, config);
    if (tokenName && !seen.has(tokenName)) {
      seen.add(tokenName);
      const color = mapTokenToColor(cls, config);
      if (color) {
        tokens.push({ name: tokenName, type: "COLOR", value: color, source: cls });
      }
    }
  }

  // Spacing/sizing tokens from layout classes
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
  
  // Check token mapping
  for (const [css, figmaPath] of Object.entries(config.tokenMapping)) {
    if (cssClass.includes(css.replace("--", "").replace("color-", ""))) {
      // Return placeholder color - Figma plugin should resolve actual token
      return { r: 0.5, g: 0.5, b: 0.5, a: 1 };
    }
  }
  
  // Default fallback colors
  const colorMap: Record<string, { r: number; g: number; b: number }> = {
    primary: { r: 0.2, g: 0.4, b: 1 },
    secondary: { r: 0.5, g: 0.5, b: 0.5 },
    danger: { r: 0.9, g: 0.2, b: 0.2 },
    success: { r: 0.2, g: 0.8, b: 0.4 },
    white: { r: 1, g: 1, b: 1 },
    black: { r: 0, g: 0, b: 0 },
  };
  
  for (const [name, color] of Object.entries(colorMap)) {
    if (cssClass.toLowerCase().includes(name)) {
      return { ...color, a: 1 };
    }
  }
  
  return { r: 0.8, g: 0.8, b: 0.8, a: 1 };
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
