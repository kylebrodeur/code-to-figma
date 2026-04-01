import { describe, it, expect } from "vitest";
import { generateFigmaJson } from "../figma-generator.js";
import type { ParsedComponent } from "../../parser/react-parser.js";
import type { Config } from "../../config.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function makeComponent(overrides: Partial<ParsedComponent> = {}): ParsedComponent {
  return {
    name: "TestButton",
    filePath: "/tmp/TestButton.tsx",
    props: [],
    variants: [],
    styles: {
      layout: {},
      visual: {},
      typography: {},
    },
    jsxStructure: [],
    ...overrides,
  };
}

// ─── generateFigmaJson — structure ─────────────────────────────────────────

describe("generateFigmaJson — output structure", () => {
  it("produces required top-level keys", () => {
    const component = makeComponent();
    const out = generateFigmaJson(component, defaultConfig);
    expect(out).toHaveProperty("name", "TestButton");
    expect(out).toHaveProperty("type");
    expect(out).toHaveProperty("variants");
    expect(out).toHaveProperty("styles");
    expect(out).toHaveProperty("tokens");
    expect(out).toHaveProperty("props");
    expect(out).toHaveProperty("autoLayout");
  });

  it("creates a single Default variant when component has no variants", () => {
    const out = generateFigmaJson(makeComponent(), defaultConfig);
    expect(out.variants).toHaveLength(1);
    expect(out.variants[0].name).toBe("Default");
  });

  it("COMPONENT type for single variant", () => {
    const out = generateFigmaJson(makeComponent(), defaultConfig);
    expect(out.type).toBe("COMPONENT");
  });

  it("COMPONENT_SET type for multiple variants", () => {
    const component = makeComponent({
      variants: [
        { name: "primary", propValues: { variant: "primary" }, styles: {} },
        { name: "secondary", propValues: { variant: "secondary" }, styles: {} },
      ],
    });
    const out = generateFigmaJson(component, defaultConfig);
    expect(out.type).toBe("COMPONENT_SET");
    expect(out.variants).toHaveLength(2);
    expect(out.variants[0].name).toBe("primary");
    expect(out.variants[1].name).toBe("secondary");
  });
});

// ─── generateFigmaJson — typography ─────────────────────────────────────────

describe("generateFigmaJson — typography via adapter", () => {
  it("font-bold resolves to fontWeight 700 (not NaN)", () => {
    const component = makeComponent({
      styles: { layout: {}, visual: {}, typography: { fontWeight: "font-bold" } },
    });
    const out = generateFigmaJson(component, defaultConfig);
    expect(out.styles.typography.fontWeight).toBe(700);
  });

  it("font-semibold resolves to 600", () => {
    const component = makeComponent({
      styles: { layout: {}, visual: {}, typography: { fontWeight: "font-semibold" } },
    });
    const out = generateFigmaJson(component, defaultConfig);
    expect(out.styles.typography.fontWeight).toBe(600);
  });

  it("font-normal resolves to 400", () => {
    const component = makeComponent({
      styles: { layout: {}, visual: {}, typography: { fontWeight: "font-normal" } },
    });
    const out = generateFigmaJson(component, defaultConfig);
    expect(out.styles.typography.fontWeight).toBe(400);
  });

  it("text-sm resolves to fontSize 14", () => {
    const component = makeComponent({
      styles: { layout: {}, visual: {}, typography: { fontSize: "text-sm" } },
    });
    const out = generateFigmaJson(component, defaultConfig);
    expect(out.styles.typography.fontSize).toBe(14);
  });

  it("text-xl resolves to fontSize 20", () => {
    const component = makeComponent({
      styles: { layout: {}, visual: {}, typography: { fontSize: "text-xl" } },
    });
    const out = generateFigmaJson(component, defaultConfig);
    expect(out.styles.typography.fontSize).toBe(20);
  });

  it("defaults to fontWeight 400 when no font-weight class", () => {
    const out = generateFigmaJson(makeComponent(), defaultConfig);
    expect(out.styles.typography.fontWeight).toBe(400);
  });

  it("defaults to fontSize 16 when no font-size class", () => {
    const out = generateFigmaJson(makeComponent(), defaultConfig);
    expect(out.styles.typography.fontSize).toBe(16);
  });
});

// ─── generateFigmaJson — fill / color ────────────────────────────────────────

describe("generateFigmaJson — fill color", () => {
  it("bg-blue-500 produces correct SOLID fill in default variant frame", () => {
    const component = makeComponent({
      styles: {
        layout: {},
        visual: { backgroundColor: "bg-blue-500" },
        typography: {},
      },
    });
    const out = generateFigmaJson(component, defaultConfig);
    const fill = out.variants[0].frame.fills[0];
    expect(fill.type).toBe("SOLID");
    expect(fill.color).toEqual({ r: 0.231, g: 0.51, b: 0.965, a: 1 });
  });

  it("no bg class produces empty fills array", () => {
    const out = generateFigmaJson(makeComponent(), defaultConfig);
    expect(out.variants[0].frame.fills).toHaveLength(0);
  });
});

// ─── generateFigmaJson — tokens ───────────────────────────────────────────────

describe("generateFigmaJson — tokens", () => {
  it("produces no tokens when no tokenMapping and no shadcn adapter", () => {
    const component = makeComponent({
      styles: {
        layout: {},
        visual: { backgroundColor: "bg-blue-500" },
        typography: {},
      },
    });
    const out = generateFigmaJson(component, defaultConfig);
    expect(out.tokens).toHaveLength(0);
  });

  it("produces token when class is in tokenMapping", () => {
    const config: Config = {
      ...defaultConfig,
      tokenMapping: { "blue-500": "brand/primary" },
    };
    const component = makeComponent({
      styles: {
        layout: {},
        visual: { backgroundColor: "bg-blue-500" },
        typography: {},
      },
    });
    const out = generateFigmaJson(component, config);
    const token = out.tokens.find((t) => t.name === "brand/primary");
    expect(token).toBeDefined();
    expect(token!.type).toBe("COLOR");
    expect(token!.source).toBe("bg-blue-500");
  });

  it("produces auto-tokens for shadcn semantic classes without tokenMapping", () => {
    const config: Config = {
      ...defaultConfig,
      adapter: "shadcn",
    };
    const component = makeComponent({
      styles: {
        layout: {},
        visual: { backgroundColor: "bg-primary" },
        typography: {},
      },
    });
    const out = generateFigmaJson(component, config);
    const token = out.tokens.find((t) => t.name === "color/primary");
    expect(token).toBeDefined();
    expect(token!.type).toBe("COLOR");
    expect(token!.source).toBe("bg-primary");
  });

  it("does not produce duplicate tokens for the same class", () => {
    const config: Config = {
      ...defaultConfig,
      adapter: "shadcn",
    };
    const component = makeComponent({
      // bg-primary appears in both backgroundColor and color
      styles: {
        layout: {},
        visual: { backgroundColor: "bg-primary", color: "bg-primary" },
        typography: {},
      },
    });
    const out = generateFigmaJson(component, config);
    const primaryTokens = out.tokens.filter((t) => t.name === "color/primary");
    expect(primaryTokens).toHaveLength(1);
  });
});
