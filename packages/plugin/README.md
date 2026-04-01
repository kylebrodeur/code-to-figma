# @kylebrodeur/code-to-figma-plugin

Figma plugin that renders `FigmaJsonOutput` JSON (produced by the CLI) as auto-layout frames and component sets on the Figma canvas.

---

## Loading the Plugin

1. Open **Figma Desktop** (the plugin API is not available in the browser)
2. Go to **Plugins → Development → Import plugin from manifest…**
3. Select `packages/plugin/manifest.json` from this repository
4. The plugin appears under **Plugins → Development → code-to-figma**

> The plugin is a **local development plugin**. It reads JSON you provide — no network calls, no Figma Community listing.

---

## Using the Plugin

### Step 1 — Build the CLI output

```bash
# In your project with React components:
code-to-figma scan "src/components/**/*.tsx"
code-to-figma plugin-output -i .figma -o plugin-data.json
```

### Step 2 — Import JSON

In the plugin panel you can import JSON two ways:

**Paste JSON** — click the `▸` toggle to expand the import panel and paste the contents of `plugin-data.json` into the textarea, then press **Import**.

**Load file** — click **Load file** and select `plugin-data.json` from disk.

Both methods populate the component list.

### Step 3 — Build components

The component list shows one row per component with:
- **Checkbox** — select for bulk actions
- **Name** — component name
- **`Nv`** — number of variants
- **Badge** — `set` (COMPONENT_SET with variants) or `single` (COMPONENT)
- **Build** — build just this component
- **✕** — remove from the list (does not delete existing canvas frames)

**Bulk actions** (bottom bar):
- **Build selected** — build all checked components
- **Update** — rebuild components that already exist on canvas
- **Remove** — remove checked components from the list

All renders go to a page named **`code-to-figma`** (created automatically if missing).

---

## What the Plugin Renders

### COMPONENT_SET

A wrapper frame containing:
1. A title label (`component name` in Martian Mono)
2. A horizontal row of variant frames, one per variant in the JSON

Each variant frame:
- Sized to `frame.width × frame.height` from JSON
- Auto-layout applied (mode, gap, padding, alignment)
- Fills, strokes, and effects applied from JSON arrays
- A text label showing the variant name

### COMPONENT

A single frame (no wrapper), same rendering as above.

---

## Message Protocol

The UI communicates with the plugin sandbox via postMessage:

**UI → Plugin:**

| Message | Payload | Description |
|---------|---------|-------------|
| `IMPORT_JSON` | `data: FigmaJsonOutput[]` | Load components into the build queue |
| `BUILD_COMPONENT` | `name: string` | Build one component by name |
| `REMOVE_COMPONENT` | `name: string` | Remove one component (clears canvas frame) |
| `REMOVE_COMPONENTS` | `names: string[]` | Bulk remove (clears canvas frames) |
| `REMOVE_ALL` | — | Clear all components and frames |

**Plugin → UI:**

| Message | Payload | Description |
|---------|---------|-------------|
| `STATUS` | `msg: string` | Progress update |
| `DONE` | `msg: string` | Build completed |
| `ERROR` | `msg: string` | Error occurred |

---

## `FigmaJsonOutput` Contract

The plugin reads this exact shape (produced by the CLI):

```typescript
interface FigmaJsonOutput {
  name: string;
  type: "COMPONENT_SET" | "COMPONENT";
  variants: FigmaVariant[];          // one per variant value
  styles: FigmaStyle;                // layout + typography
  tokens: string[];                  // CSS token names (informational)
  props: FigmaProp[];                // all component props
  autoLayout: FigmaAutoLayout;       // Figma auto-layout settings
}

interface FigmaVariant {
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
```

Full type definitions live in [`src/types.ts`](./src/types.ts).

---

## Source Files

| File | Purpose |
|------|---------|
| `src/code.ts` | Plugin entry — shows UI, handles messages, calls Figma API |
| `src/ui.html` | Self-contained UI panel (HTML/CSS/JS, no framework) |
| `src/primitives.ts` | Figma API helpers: `createFrame`, `createText`, `hRow`, `vCol`, etc. |
| `src/types.ts` | Mirror of CLI `FigmaJsonOutput` types + message protocol |
| `dist/code.js` | Compiled plugin code (esbuild, ES2017, IIFE) |
| `manifest.json` | Figma plugin manifest |

---

## Building

```bash
cd packages/plugin

# One-time build
pnpm build          # → dist/code.js (~11kb)

# Watch mode
pnpm watch          # rebuilds on src changes

# Typecheck only (no emit)
pnpm typecheck
```

**Requires** Node.js 18+ and `pnpm`. The compiled `dist/code.js` is committed so you don't need to build before loading in Figma.

### Figma Engine Constraints

The plugin must target **ES2017** (`esbuild --target es2017`) because Figma's sandbox uses an older JS engine. Forbidden patterns:

| ❌ Breaks in Figma | ✅ Use instead |
|-------------------|---------------|
| `{...obj}` object spread | Manual property assignment |
| `function foo(x = val)` default params | `if (x === undefined) x = val` |
| Complex nested arrow functions at top level | Named functions |

---

## UI Design

The plugin UI uses the **BSS warm obsidian** design tokens:

| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#1a1510` | Panel background |
| `--sf` | `#231c14` | Surface (list rows) |
| `--go` | `#c98d1a` | Gold — primary actions, busy indicator |
| `--ru` | `#cc6030` | Rust — destructive actions, error state |
| `--te` | `#5a9e80` | Teal — success / ok state |
| `--tx` | `#e8dfd0` | Body text |
| `--mu` | `#907e68` | Muted text |

Font: **Martian Mono** (monospace). Border radius: 2px throughout.

---

## Development Tips

- After editing `src/code.ts` or `src/primitives.ts`, run `pnpm build` then **reload** the plugin in Figma (right-click plugin → Reload)
- `src/ui.html` is loaded directly from disk by Figma — no rebuild needed for UI-only edits, just reload the plugin
- Status messages appear in the plugin's status bar; errors also go to the Figma plugin console (Menu → Plugins → Development → Open Console)
