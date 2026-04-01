/**
 * Integration tests for the `scan` command.
 *
 * Each test:
 *  1. Creates a temp directory with a fixture .tsx file + .code-to-figma.json
 *  2. Spawns `cli.js scan` via node
 *  3. Reads the generated .figma.json output and asserts on its contents
 *
 * NOTE: requires `pnpm build` to have been run first so dist/cli.js exists.
 */
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { execa } from "execa";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { rmSync } from "fs";

const CLI_PATH = new URL("../../dist/cli.js", import.meta.url).pathname;

function makeTmpDir(): string {
  const dir = join(tmpdir(), `c2f-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(dir, { recursive: true });
  mkdirSync(join(dir, "src"), { recursive: true });
  return dir;
}

function writeConfig(dir: string, config: Record<string, unknown>): void {
  writeFileSync(join(dir, ".code-to-figma.json"), JSON.stringify(config, null, 2));
}

function writeFixture(dir: string, name: string, content: string): string {
  const filePath = join(dir, "src", `${name}.tsx`);
  writeFileSync(filePath, content);
  return filePath;
}

async function runScan(dir: string, pattern: string, outputDir = ".figma"): Promise<void> {
  await execa("node", [CLI_PATH, "scan", pattern, "-o", outputDir], {
    cwd: dir,
    reject: false,
  });
}

function readOutput(dir: string, name: string, outputDir = ".figma"): Record<string, unknown> {
  const raw = readFileSync(join(dir, outputDir, `${name}.figma.json`), "utf-8");
  return JSON.parse(raw);
}

let tmpDir: string;

beforeEach(() => {
  tmpDir = makeTmpDir();
});

afterEach(() => {
  try {
    rmSync(tmpDir, { recursive: true, force: true });
  } catch {
    // ignore cleanup failures
  }
});

// ──────────────────────────────────────────────────────────────
// Scenario 1 — Tailwind basic: color, fontWeight, fontSize
// ──────────────────────────────────────────────────────────────
describe("Tailwind basic", () => {
  it("resolves fill, fontWeight=700 and fontSize=14 for a simple component", async () => {
    writeConfig(tmpDir, { styling: "tailwind" });
    writeFixture(
      tmpDir,
      "Button",
      `export function Button() {
  return <button className="bg-blue-500 font-bold text-sm">Click</button>;
}`
    );

    await runScan(tmpDir, "src/Button.tsx");

    const output = readOutput(tmpDir, "Button");
    expect(output).toHaveProperty("name", "Button");

    const variants = output.variants as Array<Record<string, unknown>>;
    expect(variants.length).toBeGreaterThanOrEqual(1);

    const frame = variants[0].frame as Record<string, unknown>;
    const fills = frame.fills as Array<Record<string, unknown>>;
    expect(fills).toHaveLength(1);
    expect(fills[0].type).toBe("SOLID");
    // blue-500 = {r:0.235, g:0.510, b:0.961}
    const color = fills[0].color as Record<string, number>;
    expect(color.r).toBeCloseTo(0.235, 1);
    expect(color.b).toBeCloseTo(0.961, 1);

    const styles = output.styles as Record<string, unknown>;
    const typography = styles.typography as Record<string, unknown>;
    expect(typography.fontSize).toBe(14);
    expect(typography.fontWeight).toBe(700);
  });
});

// ──────────────────────────────────────────────────────────────
// Scenario 2 — Modifier stripping: only the base class survives
// ──────────────────────────────────────────────────────────────
describe("Modifier stripping", () => {
  it("only uses base class when hover/dark/data-* classes are present", async () => {
    writeConfig(tmpDir, { styling: "tailwind" });
    writeFixture(
      tmpDir,
      "Card",
      `export function Card() {
  return (
    <div className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-800 data-[state=open]:bg-red-500">
      content
    </div>
  );
}`
    );

    await runScan(tmpDir, "src/Card.tsx");

    const output = readOutput(tmpDir, "Card");
    const variants = output.variants as Array<Record<string, unknown>>;
    const frame = variants[0].frame as Record<string, unknown>;
    const fills = frame.fills as Array<Record<string, unknown>>;
    expect(fills).toHaveLength(1);

    // Must be blue-500, not red-500
    const color = fills[0].color as Record<string, number>;
    expect(color.r).toBeCloseTo(0.235, 1);
  });
});

// ──────────────────────────────────────────────────────────────
// Scenario 3 — shadcn auto-tokens: tokens[] populated without tokenMapping
// ──────────────────────────────────────────────────────────────
describe("shadcn auto-tokens", () => {
  it("generates token entries without explicit tokenMapping", async () => {
    writeConfig(tmpDir, { adapter: "shadcn" });
    writeFixture(
      tmpDir,
      "Badge",
      `export function Badge() {
  return <span className="bg-primary text-muted-foreground">Badge</span>;
}`
    );

    await runScan(tmpDir, "src/Badge.tsx");

    const output = readOutput(tmpDir, "Badge");
    const tokens = output.tokens as Array<Record<string, unknown>>;
    expect(tokens).toBeDefined();

    const names = tokens.map((t) => t.name);
    expect(names).toContain("color/primary");
    expect(names).toContain("color/muted-foreground");
  });
});

// ──────────────────────────────────────────────────────────────
// Scenario 4 — CVA cross-product: 3 variants × 3 sizes → 9 frames
// ──────────────────────────────────────────────────────────────
describe("CVA cross-product", () => {
  it("produces 9 variant frames for 3×3 CVA variants", async () => {
    writeConfig(tmpDir, { styling: "tailwind" });
    writeFixture(
      tmpDir,
      "Chip",
      `import { cva } from "class-variance-authority";

const chipVariants = cva("base-class", {
  variants: {
    variant: {
      default: "bg-blue-500",
      destructive: "bg-red-500",
      outline: "bg-transparent",
    },
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
  },
});

export function Chip({ variant = "default", size = "md" }: { variant?: string; size?: string }) {
  return <span className={chipVariants({ variant, size })}>Chip</span>;
}`
    );

    await runScan(tmpDir, "src/Chip.tsx");

    const output = readOutput(tmpDir, "Chip");
    const variants = output.variants as Array<Record<string, unknown>>;
    expect(variants).toHaveLength(9);

    // spot-check a few names
    const names = variants.map((v) => v.name as string);
    expect(names).toContain("default/sm");
    expect(names).toContain("destructive/md");
    expect(names).toContain("outline/lg");
  });
});

// ──────────────────────────────────────────────────────────────
// Scenario 5 — Tailwind v4 CSS var + tokenMapping
// ──────────────────────────────────────────────────────────────
describe("Tailwind v4 CSS var with tokenMapping", () => {
  it("resolves fill via tokenMapping for bg-(--color-brand)", async () => {
    writeConfig(tmpDir, {
      adapter: "tailwind-v4",
      tokenMapping: {
        "--color-brand": "#3b82f6",
      },
    });
    writeFixture(
      tmpDir,
      "Hero",
      `export function Hero() {
  return <section className="bg-(--color-brand)">Hero</section>;
}`
    );

    await runScan(tmpDir, "src/Hero.tsx");

    const output = readOutput(tmpDir, "Hero");
    const variants = output.variants as Array<Record<string, unknown>>;
    expect(variants.length).toBeGreaterThanOrEqual(1);
    // fill should be resolved (not undefined / grey placeholder)
    const frame = variants[0].frame as Record<string, unknown>;
    const fills = frame.fills as Array<Record<string, unknown>>;
    expect(fills).toHaveLength(1);
    expect(fills[0].type).toBe("SOLID");
  });
});
