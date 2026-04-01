/**
 * Mirror of FigmaJsonOutput interfaces from packages/cli/src/generator/figma-generator.ts
 * The plugin can't import from the CLI, so it needs its own copy.
 * These types define the JSON contract between CLI output and plugin input.
 */

export interface FigmaJsonOutput {
  name: string;
  type: "COMPONENT_SET" | "COMPONENT";
  variants: FigmaVariant[];
  styles: FigmaStyle;
  tokens: string[];
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

// Plugin message protocol
export type PluginMessage =
  | { type: "IMPORT_JSON"; data: FigmaJsonOutput[] }
  | { type: "BUILD_COMPONENT"; name: string }
  | { type: "REMOVE_COMPONENT"; name: string }
  | { type: "REMOVE_ALL" };

export type UIMessage =
  | { type: "STATUS"; msg: string }
  | { type: "DONE"; msg: string }
  | { type: "ERROR"; msg: string };
