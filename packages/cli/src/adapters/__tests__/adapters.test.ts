import { describe, it, expect } from "vitest";
import { tailwindV3Adapter, TAILWIND_COLORS, TAILWIND_FONT_SIZES, TAILWIND_FONT_WEIGHTS } from "../tailwind-v3.js";
import { tailwindV4Adapter } from "../tailwind-v4.js";
import { shadcnAdapter } from "../shadcn.js";
import { getAdapter } from "../index.js";
import type { Config } from "../../config.js";

// Minimal config used across tests
const cfg = (overrides: Partial<Config> = {}): Config => ({
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
  ...overrides,
});

// ─── tailwindV3Adapter ────────────────────────────────────────────────────────

describe("tailwindV3Adapter.resolveColor", () => {
  it("resolves bg-blue-500 to blue RGBA", () => {
    const result = tailwindV3Adapter.resolveColor("bg-blue-500", cfg());
    expect(result).toEqual({ r: 0.23, g: 0.51, b: 0.96, a: 1 });
  });

  it("resolves text-red-600 to red RGBA", () => {
    const result = tailwindV3Adapter.resolveColor("text-red-600", cfg());
    expect(result).toEqual({ r: 0.94, g: 0.27, b: 0.27, a: 1 });
  });

  it("resolves bg-green-500 to green RGBA", () => {
    const result = tailwindV3Adapter.resolveColor("bg-green-500", cfg());
    expect(result).toEqual({ r: 0.13, g: 0.77, b: 0.37, a: 1 });
  });

  it("resolves bg-white to white RGBA", () => {
    const result = tailwindV3Adapter.resolveColor("bg-white", cfg());
    expect(result).toEqual({ r: 1, g: 1, b: 1, a: 1 });
  });

  it("resolves bg-black to black RGBA", () => {
    const result = tailwindV3Adapter.resolveColor("bg-black", cfg());
    expect(result).toEqual({ r: 0, g: 0, b: 0, a: 1 });
  });

  it("returns null for unrecognised class", () => {
    const result = tailwindV3Adapter.resolveColor("p-4", cfg());
    expect(result).toBeNull();
  });

  it("resolves border-rose-500 via keyword", () => {
    const result = tailwindV3Adapter.resolveColor("border-rose-500", cfg());
    expect(result).not.toBeNull();
    expect(result?.r).toBeGreaterThan(0.9);
  });

  it("does NOT receive modifier-prefixed classes (stripModifiers responsibility)", () => {
    // hover:bg-blue-500 would be stripped by the parser — but if it did arrive
    // the adapter would still try to substring-match "blue"
    const result = tailwindV3Adapter.resolveColor("bg-blue-500", cfg());
    expect(result).toEqual({ r: 0.23, g: 0.51, b: 0.96, a: 1 });
  });
});

describe("tailwindV3Adapter.resolveFontSize", () => {
  const cases: [string, number][] = [
    ["text-xs", 12],
    ["text-sm", 14],
    ["text-base", 16],
    ["text-lg", 18],
    ["text-xl", 20],
    ["text-2xl", 24],
    ["text-3xl", 30],
    ["text-4xl", 36],
  ];

  for (const [cls, expected] of cases) {
    it(`${cls} → ${expected}px`, () => {
      expect(tailwindV3Adapter.resolveFontSize(cls, cfg())).toBe(expected);
    });
  }

  it("returns null for non-font-size class", () => {
    expect(tailwindV3Adapter.resolveFontSize("bg-blue-500", cfg())).toBeNull();
  });

  it("returns null for unknown text size", () => {
    expect(tailwindV3Adapter.resolveFontSize("text-enormous", cfg())).toBeNull();
  });
});

describe("tailwindV3Adapter.resolveFontWeight", () => {
  const cases: [string, number][] = [
    ["font-thin", 100],
    ["font-extralight", 200],
    ["font-light", 300],
    ["font-normal", 400],
    ["font-medium", 500],
    ["font-semibold", 600],
    ["font-bold", 700],
    ["font-extrabold", 800],
    ["font-black", 900],
  ];

  for (const [cls, expected] of cases) {
    it(`${cls} → ${expected}`, () => {
      expect(tailwindV3Adapter.resolveFontWeight(cls, cfg())).toBe(expected);
    });
  }

  it("returns null for non-font-weight class", () => {
    expect(tailwindV3Adapter.resolveFontWeight("text-sm", cfg())).toBeNull();
  });

  it("returns null for unknown font weight", () => {
    expect(tailwindV3Adapter.resolveFontWeight("font-ultra", cfg())).toBeNull();
  });
});

// ─── tailwindV4Adapter ────────────────────────────────────────────────────────

describe("tailwindV4Adapter.resolveColor", () => {
  it("resolves bg-(--color-primary) to neutral placeholder when in tokenMapping", () => {
    const config = cfg({ tokenMapping: { "--color-primary": "brand/primary" } });
    const result = tailwindV4Adapter.resolveColor("bg-(--color-primary)", config);
    expect(result).toEqual({ r: 0.5, g: 0.5, b: 0.5, a: 1 });
  });

  it("returns null for bg-(--varname) when NOT in tokenMapping", () => {
    const result = tailwindV4Adapter.resolveColor("bg-(--unknown-var)", cfg());
    expect(result).toBeNull();
  });

  it("falls through to v3 for standard Tailwind classes", () => {
    const result = tailwindV4Adapter.resolveColor("bg-blue-500", cfg());
    expect(result).toEqual({ r: 0.23, g: 0.51, b: 0.96, a: 1 });
  });

  it("handles text-(--var) CSS variable syntax", () => {
    const config = cfg({ tokenMapping: { "--color-brand": "color/brand" } });
    const result = tailwindV4Adapter.resolveColor("text-(--color-brand)", config);
    expect(result).toEqual({ r: 0.5, g: 0.5, b: 0.5, a: 1 });
  });

  it("font-size falls through to v3", () => {
    expect(tailwindV4Adapter.resolveFontSize("text-sm", cfg())).toBe(14);
  });

  it("font-weight falls through to v3", () => {
    expect(tailwindV4Adapter.resolveFontWeight("font-bold", cfg())).toBe(700);
  });
});

// ─── shadcnAdapter ───────────────────────────────────────────────────────────

describe("shadcnAdapter.resolveColor", () => {
  it("resolves bg-primary to zinc-900 dark RGBA", () => {
    const result = shadcnAdapter.resolveColor("bg-primary", cfg());
    expect(result).toEqual({ r: 0.094, g: 0.094, b: 0.106, a: 1 });
  });

  it("resolves bg-destructive to red-500 RGBA", () => {
    const result = shadcnAdapter.resolveColor("bg-destructive", cfg());
    expect(result!.r).toBeGreaterThan(0.9);
    expect(result!.g).toBeLessThan(0.3);
  });

  it("resolves text-muted-foreground to zinc-500", () => {
    const result = shadcnAdapter.resolveColor("text-muted-foreground", cfg());
    expect(result).toEqual({ r: 0.435, g: 0.435, b: 0.455, a: 1 });
  });

  it("resolves bg-background to white", () => {
    const result = shadcnAdapter.resolveColor("bg-background", cfg());
    expect(result).toEqual({ r: 1, g: 1, b: 1, a: 1 });
  });

  it("resolves border-border", () => {
    const result = shadcnAdapter.resolveColor("border-border", cfg());
    expect(result).not.toBeNull();
  });

  it("falls through to v3 for numeric Tailwind classes", () => {
    const result = shadcnAdapter.resolveColor("bg-blue-500", cfg());
    expect(result).toEqual({ r: 0.23, g: 0.51, b: 0.96, a: 1 });
  });

  it("returns null for non-color class", () => {
    const result = shadcnAdapter.resolveColor("p-4", cfg());
    expect(result).toBeNull();
  });
});

describe("shadcnAdapter.autoToken", () => {
  it("emits color/primary token for bg-primary", () => {
    const result = shadcnAdapter.autoToken!("bg-primary", cfg());
    expect(result).toEqual({ name: "color/primary", type: "COLOR" });
  });

  it("emits color/destructive token for bg-destructive", () => {
    const result = shadcnAdapter.autoToken!("bg-destructive", cfg());
    expect(result).toEqual({ name: "color/destructive", type: "COLOR" });
  });

  it("emits color/muted-foreground for text-muted-foreground", () => {
    const result = shadcnAdapter.autoToken!("text-muted-foreground", cfg());
    expect(result).toEqual({ name: "color/muted-foreground", type: "COLOR" });
  });

  it("returns null for numeric Tailwind class (not a semantic token)", () => {
    const result = shadcnAdapter.autoToken!("bg-blue-500", cfg());
    expect(result).toBeNull();
  });

  it("returns null for layout class", () => {
    const result = shadcnAdapter.autoToken!("flex", cfg());
    expect(result).toBeNull();
  });

  it("emits token for border- prefix", () => {
    const result = shadcnAdapter.autoToken!("border-border", cfg());
    expect(result).toEqual({ name: "color/border", type: "COLOR" });
  });
});

// ─── getAdapter ───────────────────────────────────────────────────────────────

describe("getAdapter", () => {
  it("returns tailwindV3Adapter for styling=tailwind", () => {
    expect(getAdapter(cfg({ styling: "tailwind" })).name).toBe("tailwind-v3");
  });

  it("returns tailwindV3Adapter for styling=tailwind-v3 (via adapter field)", () => {
    expect(getAdapter(cfg({ adapter: "tailwind-v3" })).name).toBe("tailwind-v3");
  });

  it("returns tailwindV4Adapter for styling=tailwind-v4", () => {
    expect(getAdapter(cfg({ styling: "tailwind-v4" })).name).toBe("tailwind-v4");
  });

  it("returns shadcnAdapter for adapter=shadcn", () => {
    expect(getAdapter(cfg({ adapter: "shadcn" })).name).toBe("shadcn");
  });

  it("adapter field takes priority over styling field", () => {
    expect(getAdapter(cfg({ styling: "tailwind", adapter: "shadcn" })).name).toBe("shadcn");
  });

  it("returns shadcnAdapter for adapter=radix-ui", () => {
    expect(getAdapter(cfg({ adapter: "radix-ui" })).name).toBe("shadcn");
  });

  it("returns tailwindV4Adapter for adapter=base-ui", () => {
    expect(getAdapter(cfg({ adapter: "base-ui" })).name).toBe("tailwind-v4");
  });

  it("falls back to tailwindV3Adapter for unknown adapter value", () => {
    expect(getAdapter(cfg({ adapter: "does-not-exist" })).name).toBe("tailwind-v3");
  });

  it("falls back to tailwindV3Adapter when no styling or adapter set", () => {
    const minimal: Config = {
      componentGlob: "",
      tokenMapping: {},
      outputDir: ".figma",
      framework: "react",
      styling: "tailwind",
      parserOptions: { extractVariantsFromProps: true, detectClassNameUtilities: true, extractSpacing: true },
    };
    expect(getAdapter(minimal).name).toBe("tailwind-v3");
  });
});
