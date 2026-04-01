import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { writeFileSync, mkdirSync, rmSync, existsSync } from "fs";
import { join } from "path";
import { parseComponent } from "../react-parser.js";
import { stripModifiers } from "../react-parser.js";
import type { Config } from "../../config.js";

// ─── stripModifiers ──────────────────────────────────────────────────────────

describe("stripModifiers", () => {
  it("passes through unconditional class unchanged", () => {
    expect(stripModifiers("bg-blue-500")).toBe("bg-blue-500");
  });

  it("passes through flex utility", () => {
    expect(stripModifiers("flex")).toBe("flex");
  });

  it("returns null for hover: modifier", () => {
    expect(stripModifiers("hover:bg-blue-500")).toBeNull();
  });

  it("returns null for dark: modifier", () => {
    expect(stripModifiers("dark:bg-blue-800")).toBeNull();
  });

  it("returns null for focus-visible: modifier", () => {
    expect(stripModifiers("focus-visible:ring-2")).toBeNull();
  });

  it("returns null for responsive sm: modifier", () => {
    expect(stripModifiers("sm:text-lg")).toBeNull();
  });

  it("returns null for data-[state=open]: modifier", () => {
    expect(stripModifiers("data-[state=open]:bg-red-500")).toBeNull();
  });

  it("returns null for group-hover: modifier", () => {
    expect(stripModifiers("group-hover:opacity-100")).toBeNull();
  });

  it("strips opacity suffix /50", () => {
    expect(stripModifiers("bg-blue-500/50")).toBe("bg-blue-500");
  });

  it("strips opacity suffix /30", () => {
    expect(stripModifiers("bg-white/30")).toBe("bg-white");
  });

  it("handles class with square brackets but no modifier colon", () => {
    // Arbitrary value class: bg-[#ff0000] — no colon outside brackets
    expect(stripModifiers("bg-[#ff0000]")).toBe("bg-[#ff0000]");
  });
});

// ─── parseComponent ──────────────────────────────────────────────────────────

const TMP = "/tmp/vitest-parser";

const defaultConfig: Config = {
  componentGlob: "src/**/*.tsx",
  tokenMapping: {},
  outputDir: ".figma",
  framework: "react",
  styling: "tailwind",
  parserOptions: {
    extractVariantsFromProps: true,
    detectClassNameUtilities: true,
    extractSpacing: true,
  },
};

function writeTmp(name: string, code: string): string {
  const file = join(TMP, name);
  writeFileSync(file, code, "utf-8");
  return file;
}

beforeAll(() => {
  if (!existsSync(TMP)) mkdirSync(TMP, { recursive: true });
});

afterAll(() => {
  rmSync(TMP, { recursive: true, force: true });
});

describe("parseComponent — basic class extraction", () => {
  it("extracts background color from className", async () => {
    const file = writeTmp("Basic.tsx", `
      import React from "react";
      export function Basic() {
        return <div className="bg-blue-500 text-sm font-bold">Hello</div>;
      }
    `);
    const result = await parseComponent(file, defaultConfig);
    expect(result).not.toBeNull();
    expect(result!.styles.visual.backgroundColor).toBe("bg-blue-500");
  });

  it("extracts font-size class", async () => {
    const file = writeTmp("FontSize.tsx", `
      import React from "react";
      export function FontSize() {
        return <div className="text-sm">Hello</div>;
      }
    `);
    const result = await parseComponent(file, defaultConfig);
    expect(result!.styles.typography.fontSize).toBe("text-sm");
  });

  it("extracts font-weight class", async () => {
    const file = writeTmp("FontWeight.tsx", `
      import React from "react";
      export function FontWeight() {
        return <div className="font-bold">Hello</div>;
      }
    `);
    const result = await parseComponent(file, defaultConfig);
    expect(result!.styles.typography.fontWeight).toBe("font-bold");
  });
});

describe("parseComponent — modifier stripping", () => {
  it("unconditional bg class wins when conditional classes also present", async () => {
    const file = writeTmp("Modifiers.tsx", `
      import React from "react";
      export function Modifiers() {
        return (
          <div className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-800 data-[state=open]:bg-red-500">
            Hello
          </div>
        );
      }
    `);
    const result = await parseComponent(file, defaultConfig);
    expect(result!.styles.visual.backgroundColor).toBe("bg-blue-500");
  });

  it("hover class alone results in no canonical bg", async () => {
    const file = writeTmp("HoverOnly.tsx", `
      import React from "react";
      export function HoverOnly() {
        return <div className="hover:bg-red-500">Hello</div>;
      }
    `);
    const result = await parseComponent(file, defaultConfig);
    // No unconditional bg class — backgroundColor should be undefined
    expect(result!.styles.visual.backgroundColor).toBeUndefined();
  });
});

describe("parseComponent — variant detection from TS interface", () => {
  it("detects variant prop values from interface union type", async () => {
    const file = writeTmp("WithVariants.tsx", `
      import React from "react";
      interface Props {
        variant?: "primary" | "secondary" | "outline";
      }
      export function WithVariants({ variant = "primary" }: Props) {
        return <button className="bg-blue-500">{variant}</button>;
      }
    `);
    const result = await parseComponent(file, defaultConfig);
    expect(result).not.toBeNull();
    const variantNames = result!.variants.map((v) => v.name);
    expect(variantNames).toContain("primary");
    expect(variantNames).toContain("secondary");
    expect(variantNames).toContain("outline");
    expect(result!.variants).toHaveLength(3);
  });

  it("detects size prop", async () => {
    const file = writeTmp("WithSize.tsx", `
      import React from "react";
      interface Props {
        size?: "sm" | "md" | "lg";
      }
      export function WithSize({ size = "md" }: Props) {
        return <button className="text-sm">{size}</button>;
      }
    `);
    const result = await parseComponent(file, defaultConfig);
    const variantNames = result!.variants.map((v) => v.name);
    expect(variantNames).toContain("sm");
    expect(variantNames).toContain("md");
    expect(variantNames).toContain("lg");
  });
});

describe("parseComponent — CVA detection", () => {
  it("detects variants from cva() call", async () => {
    const file = writeTmp("CVAButton.tsx", `
      import React from "react";
      import { cva } from "class-variance-authority";
      const buttonVariants = cva("rounded px-4", {
        variants: {
          variant: {
            default: "bg-blue-500",
            destructive: "bg-red-500",
            outline: "border border-gray-300",
          },
          size: {
            sm: "text-sm h-8",
            md: "text-base h-10",
            lg: "text-lg h-12",
          },
        },
      });
      export function CVAButton({ variant, size }: any) {
        return <button className={buttonVariants({ variant, size })}>Click</button>;
      }
    `);
    const result = await parseComponent(file, defaultConfig);
    expect(result).not.toBeNull();
    // 3 variants × 3 sizes = 9
    expect(result!.variants).toHaveLength(9);
    const names = result!.variants.map((v) => v.name);
    expect(names).toContain("default/sm");
    expect(names).toContain("destructive/md");
    expect(names).toContain("outline/lg");
  });
});

describe("parseComponent — returns null for non-component", () => {
  it("returns null when file has no PascalCase function", async () => {
    const file = writeTmp("utility.tsx", `
      export function formatDate(d: Date) {
        return d.toISOString();
      }
    `);
    const result = await parseComponent(file, defaultConfig);
    expect(result).toBeNull();
  });
});
