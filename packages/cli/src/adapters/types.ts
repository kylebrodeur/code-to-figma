import type { Config } from "../config.js";

export type RGBA = { r: number; g: number; b: number; a: number };

/**
 * StyleAdapter — pluggable resolver for a specific styling system.
 *
 * Each adapter knows how to:
 * - Resolve a CSS class to an RGBA color value
 * - Resolve a CSS class to font-size / font-weight numbers
 * - Optionally emit Figma Variable token entries for built-in token vocabularies
 *   (e.g. shadcn semantic tokens like "bg-primary" → "color/primary")
 *
 * Adapters receive classes AFTER modifier stripping, so they never see
 * "hover:bg-blue-500" — only "bg-blue-500".
 */
export interface StyleAdapter {
  readonly name: string;

  /**
   * Resolve a CSS class to an RGBA color (0–1 sRGB).
   * Return null if the class is not a color class or cannot be resolved.
   */
  resolveColor(cls: string, config: Config): RGBA | null;

  /**
   * Resolve a CSS class to a font-size in pixels.
   * Return null if the class is not a font-size class.
   */
  resolveFontSize(cls: string, config: Config): number | null;

  /**
   * Resolve a CSS class to a numeric font-weight (100–900).
   * Return null if the class is not a font-weight class.
   */
  resolveFontWeight(cls: string, config: Config): number | null;

  /**
   * For adapters with a built-in token vocabulary (e.g. shadcn v4 semantic
   * tokens), return the Figma Variable token metadata for a class without
   * requiring an explicit `tokenMapping` entry.
   * Return null if there is no built-in token for this class.
   */
  autoToken?(cls: string, config: Config): { name: string; type: "COLOR" | "FLOAT" | "STRING" } | null;
}
