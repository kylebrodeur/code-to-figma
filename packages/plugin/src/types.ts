/**
 * Mirror of FigmaJsonOutput interfaces from packages/cli/src/generator/figma-generator.ts
 * The plugin can't import from the CLI, so it needs its own copy.
 * These types define the JSON contract between CLI output and plugin input.
 */

export interface FigmaToken {
  name: string;                                   // e.g. "brand/primary"
  type: "COLOR" | "FLOAT" | "STRING";             // Figma variable type
  value: { r: number; g: number; b: number; a: number } | number | string;
  source: string;                                // originating CSS class, e.g. "bg-blue-600"
}

export interface FigmaJsonOutput {
  name: string;
  type: string;
  variants: ExtractedVariantData[];
}

export interface ExtractedVariantData {
  name: string;
  propValues: Record<string, string>;
  frame: {
    width: number;
    height: number;
    fills: { r: number; g: number; b: number; a: number }[];
    padding: { top: number; right: number; bottom: number; left: number };
    gap: number;
    cornerRadius: number;
    display: string;
    flexDirection: string;
    alignItems: string;
    justifyContent: string;
    typography: {
      fontFamily: string;
      fontSize: number;
      fontWeight: number;
    };
  };
}

// Plugin message protocol
export type PluginMessage =
  | { type: "IMPORT_JSON"; data: FigmaJsonOutput[] }
  | { type: "BUILD_COMPONENT"; name: string }
  | { type: "REMOVE_COMPONENT"; name: string }
  | { type: "REMOVE_COMPONENTS"; names: string[] }
  | { type: "REMOVE_ALL" };

export type UIMessage =
  | { type: "STATUS"; msg: string }
  | { type: "DONE"; msg: string }
  | { type: "ERROR"; msg: string };
