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

describe("parseComponent — CSS Module: cn() merges", () => {
  it("merges two CSS Module classes passed to cn()", async () => {
    writeFileSync(join(TMP, "Merged.module.css"), `
      .base { background-color: #1d4ed8; border-radius: 4px; }
      .active { background-color: #16a34a; }
    `);
    const file = writeTmp("Merged.tsx", `
      import styles from "./Merged.module.css";
      import { cn } from "./cn";
      export function Merged() {
        return <div className={cn(styles.base, styles.active)}>hi</div>;
      }
    `);
    const result = await parseComponent(file, defaultConfig);
    expect(result).not.toBeNull();
    // .active wins (last write) for backgroundColor
    expect(result!.styles.visual.backgroundColor).toBe("#16a34a");
    // borderRadius comes from .base
    expect(result!.styles.visual.borderRadius).toBe("4px");
  });

  it("mixes CSS Module class and bare Tailwind string in cn()", async () => {
    writeFileSync(join(TMP, "Mixed.module.css"), `
      .card { background-color: #f0f0f0; }
    `);
    const file = writeTmp("Mixed.tsx", `
      import styles from "./Mixed.module.css";
      import { cn } from "./cn";
      export function Mixed() {
        return <div className={cn(styles.card, "flex gap-4")}>hi</div>;
      }
    `);
    const result = await parseComponent(file, defaultConfig);
    expect(result).not.toBeNull();
    expect(result!.styles.visual.backgroundColor).toBe("#f0f0f0");
    expect(result!.styles.layout.display).toBe("flex");
    expect(result!.styles.layout.gap).toBe("4"); // parseTailwindClasses strips "gap-" prefix
  });

  it("resolves conditional expression inside cn() — both branches", async () => {
    writeFileSync(join(TMP, "Cond.module.css"), `
      .primary { background-color: #3b82f6; }
      .secondary { background-color: #6b7280; }
    `);
    const file = writeTmp("Cond.tsx", `
      import styles from "./Cond.module.css";
      import { cn } from "./cn";
      export function Cond({ active }: { active: boolean }) {
        return <div className={cn(active ? styles.primary : styles.secondary)}>hi</div>;
      }
    `);
    const result = await parseComponent(file, defaultConfig);
    expect(result).not.toBeNull();
    // Both branches are extracted; secondary overwrites primary in a single-pass merge
    expect(result!.styles.visual.backgroundColor).toBeTruthy();
  });

  it("resolves logical && expression inside cn()", async () => {
    writeFileSync(join(TMP, "Logical.module.css"), `
      .disabled { background-color: #d1d5db; }
    `);
    const file = writeTmp("Logical.tsx", `
      import styles from "./Logical.module.css";
      import { cn } from "./cn";
      export function Logical({ disabled }: { disabled: boolean }) {
        return <div className={cn(disabled && styles.disabled)}>hi</div>;
      }
    `);
    const result = await parseComponent(file, defaultConfig);
    expect(result).not.toBeNull();
    expect(result!.styles.visual.backgroundColor).toBe("#d1d5db");
  });
});

describe("parseComponent — CSS Module: styles[variant] dynamic access", () => {
  it("resolves all union values from styles[variant]", async () => {
    writeFileSync(join(TMP, "Dynamic.module.css"), `
      .primary { background-color: #3b82f6; font-size: 14px; }
      .danger { background-color: #ef4444; }
    `);
    const file = writeTmp("Dynamic.tsx", `
      import styles from "./Dynamic.module.css";
      interface Props { variant: "primary" | "danger"; }
      export function Dynamic({ variant }: Props) {
        return <div className={styles[variant]}>hi</div>;
      }
    `);
    const result = await parseComponent(file, defaultConfig);
    expect(result).not.toBeNull();
    // fontSize comes from .primary (last value from any merged class)
    expect(result!.styles.typography.fontSize).toBe("14px");
    // backgroundColor is set (could be from either class)
    expect(result!.styles.visual.backgroundColor).toBeTruthy();
  });

  it("resolves styles[variant] inside cn() alongside Tailwind class", async () => {
    writeFileSync(join(TMP, "DynCn.module.css"), `
      .sm { font-size: 12px; }
      .lg { font-size: 20px; }
    `);
    const file = writeTmp("DynCn.tsx", `
      import styles from "./DynCn.module.css";
      import { cn } from "./cn";
      interface Props { size: "sm" | "lg"; }
      export function DynCn({ size }: Props) {
        return <div className={cn(styles[size], "flex")}>hi</div>;
      }
    `);
    const result = await parseComponent(file, defaultConfig);
    expect(result).not.toBeNull();
    expect(result!.styles.typography.fontSize).toBeTruthy();
    expect(result!.styles.layout.display).toBe("flex");
  });
});

describe("parseComponent — cn() logical && and ternary extraction", () => {
  it("extracts string from logical && arg in cn()", async () => {
    const file = writeTmp("LogicalTailwind.tsx", `
      import React from "react";
      import { cn } from "./cn";
      export function LogicalTailwind({ loading }: { loading: boolean }) {
        return <div className={cn("flex gap-2", loading && "opacity-50")}>hi</div>;
      }
    `);
    const result = await parseComponent(file, defaultConfig);
    expect(result).not.toBeNull();
    expect(result!.styles.layout.display).toBe("flex");
  });

  it("extracts both branches of a ternary arg in cn()", async () => {
    const file = writeTmp("TernaryCn.tsx", `
      import React from "react";
      import { cn } from "./cn";
      export function TernaryCn({ active }: { active: boolean }) {
        return <div className={cn("rounded-md", active ? "bg-blue-500" : "bg-gray-200")}>hi</div>;
      }
    `);
    const result = await parseComponent(file, defaultConfig);
    expect(result).not.toBeNull();
    // bg-gray-200 is last branch — overwrites bg-blue-500 in single pass
    expect(result!.styles.visual.backgroundColor).toBeTruthy();
  });

  it("extracts both branches of a direct JSX ternary", async () => {
    const file = writeTmp("DirectTernary.tsx", `
      import React from "react";
      export function DirectTernary({ active }: { active: boolean }) {
        return <div className={active ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}>hi</div>;
      }
    `);
    const result = await parseComponent(file, defaultConfig);
    expect(result).not.toBeNull();
    expect(result!.styles.visual.backgroundColor).toBeTruthy();
  });
});

describe("parseComponent — template literal Tailwind interpolation", () => {
  it("enumerates union values for single-identifier template literal", async () => {
    const file = writeTmp("TplTailwind.tsx", `
      import React from "react";
      interface Props { size: "sm" | "lg"; }
      export function TplTailwind({ size }: Props) {
        return <div className={\`text-\${size} font-bold\`}>hi</div>;
      }
    `);
    const result = await parseComponent(file, defaultConfig);
    expect(result).not.toBeNull();
    // fontSize should be set from one of text-sm / text-lg
    expect(result!.styles.typography.fontSize).toBeTruthy();
    expect(result!.styles.typography.fontWeight).toBeTruthy();
  });
});

describe("parseComponent — CSS composes resolution", () => {
  it("resolves composes from another file", async () => {
    writeFileSync(join(TMP, "base.module.css"), `
      .base { background-color: #1d4ed8; border-radius: 4px; }
    `);
    writeFileSync(join(TMP, "Composed.module.css"), `
      .button { composes: base from './base.module.css'; font-size: 14px; }
    `);
    const file = writeTmp("Composed.tsx", `
      import styles from "./Composed.module.css";
      export function Composed() {
        return <div className={styles.button}>hi</div>;
      }
    `);
    const result = await parseComponent(file, defaultConfig);
    expect(result).not.toBeNull();
    // From composed base class
    expect(result!.styles.visual.backgroundColor).toBe("#1d4ed8");
    expect(result!.styles.visual.borderRadius).toBe("4px");
    // From own class
    expect(result!.styles.typography.fontSize).toBe("14px");
  });

  it("resolves composes from same file", async () => {
    writeFileSync(join(TMP, "SameFile.module.css"), `
      .base { background-color: #16a34a; }
      .button { composes: base; color: #ffffff; }
    `);
    const file = writeTmp("SameFile.tsx", `
      import styles from "./SameFile.module.css";
      export function SameFile() {
        return <div className={styles.button}>hi</div>;
      }
    `);
    const result = await parseComponent(file, defaultConfig);
    expect(result).not.toBeNull();
    expect(result!.styles.visual.backgroundColor).toBe("#16a34a");
    expect(result!.styles.visual.color).toBe("#ffffff");
  });
});

describe("parseComponent — styled-components / emotion static CSS", () => {
  it("extracts styles from styled.div with no interpolations", async () => {
    const file = writeTmp("StyledDiv.tsx", `
      import styled from "styled-components";
      const Box = styled.div\`
        background-color: #3b82f6;
        border-radius: 8px;
        padding: 16px;
        display: flex;
        gap: 8px;
      \`;
      export function StyledDiv() {
        return <Box>hi</Box>;
      }
    `);
    const result = await parseComponent(file, defaultConfig);
    expect(result).not.toBeNull();
    expect(result!.styles.visual.backgroundColor).toBe("#3b82f6");
    expect(result!.styles.visual.borderRadius).toBe("8px");
    expect(result!.styles.layout.display).toBe("flex");
    expect(result!.styles.layout.gap).toBe("8px");
  });

  it("extracts styles from styled(Component) wrapping pattern", async () => {
    const file = writeTmp("StyledWrap.tsx", `
      import styled from "styled-components";
      const BaseButton = () => null;
      const Button = styled(BaseButton)\`
        background-color: #ef4444;
        font-size: 14px;
        font-weight: 600;
      \`;
      export function StyledWrap() {
        return <Button>hi</Button>;
      }
    `);
    const result = await parseComponent(file, defaultConfig);
    expect(result).not.toBeNull();
    expect(result!.styles.visual.backgroundColor).toBe("#ef4444");
    expect(result!.styles.typography.fontSize).toBe("14px");
    expect(result!.styles.typography.fontWeight).toBe("600");
  });

  it("skips styled templates with interpolations (cannot resolve at parse time)", async () => {
    const file = writeTmp("StyledDynamic.tsx", `
      import styled from "styled-components";
      const Box = styled.div\`
        background-color: \${props => props.color};
        padding: 8px;
      \`;
      export function StyledDynamic() {
        return <Box>hi</Box>;
      }
    `);
    const result = await parseComponent(file, defaultConfig);
    // backgroundColor is not set because template has expressions
    // padding would also not be set since entire template is skipped
    expect(result!.styles.visual.backgroundColor).toBeUndefined();
  });
});
