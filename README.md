# code-to-figma

Parse React components with a hybrid AST + Headless Browser approach, extract pixel-perfect computed styles, generate structured `.figma.json` files, and render them as Figma frames using a local plugin — all from the command line.

```
React Component (.tsx)
        │
        ▼  code-to-figma scan (AST finds API + Playwright traces DOM)
.figma.json  (structured pixel-perfect data)
        │
        ▼  code-to-figma plugin-output
plugin-data.json  (bundled for plugin)
        │
        ▼  Figma plugin: Import JSON
Figma Canvas  (auto-layout frames + variant sets)
```

## Documentation

- [**End-to-End Workflow Guide**](./docs/WORKFLOW.md) — Full walkthrough: setup → scan → plugin → ongoing sync

## Packages

| Package | Description | Docs |
|---------|-------------|------|
| `@kylebrodeur/code-to-figma` | CLI — parses React → generates `.figma.json` | [packages/cli/](./packages/cli/README.md) |
| `@kylebrodeur/code-to-figma-plugin` | Figma plugin — renders `.figma.json` → designs | [packages/plugin/](./packages/plugin/README.md) |

## Quick Start

### 1. Install CLI

```bash
npm install -g @kylebrodeur/code-to-figma
# or use without installing:
npx @kylebrodeur/code-to-figma scan src/components/Button.tsx
```

### 2. Initialize config (optional)

```bash
code-to-figma init
# Creates .code-to-figma.json with defaults
```

### 3. Scan your components

```bash
code-to-figma scan src/components/Button.tsx
# → .figma/Button.figma.json

code-to-figma scan "src/components/**/*.tsx"
# → .figma/*.figma.json  (one file per component)
```

### 4. Bundle for the plugin

```bash
code-to-figma plugin-output -i .figma -o plugin-data.json
# → plugin-data.json  (all components in one array)
```

### 5. Load in Figma

1. Open Figma Desktop
2. **Plugins → Development → Import plugin from manifest…**
3. Select `packages/plugin/manifest.json`
4. Run the plugin: **Plugins → code-to-figma**
5. Paste or load `plugin-data.json`
6. Click **Build selected** or **Build selected** on individual components

Components render on a page named `code-to-figma` as auto-layout frames.

---

## How it Works (The Hybrid Architecture)

Code-to-Figma uses a two-step hybrid approach to perfectly map complex React components to Figma:

1. **AST Parsing (The API):** It parses your TypeScript file using Babel to find exactly what props and variants exist (e.g. `variant: 'primary' | 'secondary'`).
2. **Headless DOM Tracing (The Visuals):** It dynamically creates a Vite server, mounts every variant combination of your component, opens a headless browser (Playwright), and uses `window.getComputedStyle()` to trace the exact pixel values.

Because it measures the real browser output, it **is immune to complex React logic**. It doesn't matter if you use 10 ternary operators, complex CSS modules, or heavily nested Tailwind classes — if it renders in the browser, it syncs to Figma.

| Feature | How it's extracted |
|---------|------------------|
| **Variant props** | Extracted from TypeScript literal unions or `cva()` definitions |
| **Component type** | `COMPONENT_SET` (has variant prop) or `COMPONENT` (single frame) |
| **Dimensions** | `rect.width` and `rect.height` from the rendered DOM node |
| **Auto-layout** | Mapped from computed `display: flex`, `gap`, `flex-direction`, `align-items`, etc. |
| **Typography** | `fontSize`, `fontWeight`, and `fontFamily` from computed styles |
| **Fills** | Computed `backgroundColor` resolved to precise RGBA floats |
| **Corner radius** | Computed `borderRadius` px value per frame |

---

## Configuration

`.code-to-figma.json` (created by `code-to-figma init`):

```json
{
  "figmaFileKey": "",
  "figmaAccessToken": "",
  "componentGlob": "src/components/**/*.tsx",
  "outputDir": ".figma",
  "framework": "react",
  "styling": "tailwind",
  "tokenMapping": {
    "--color-primary": "brand/primary",
    "--space-4": "spacing/4"
  },
  "parserOptions": {
    "extractVariantsFromProps": true,
    "detectClassNameUtilities": true,
    "extractSpacing": true
  }
}
```

Token mappings can also be managed via the CLI without editing the file directly:

```bash
code-to-figma token add -k "--color-primary" -p "color/primary"
code-to-figma token list
code-to-figma token remove -k "--color-primary"
```

See [COMMANDS.md](./code-to-figma/references/COMMANDS.md#token) for the full token command reference.

---

## Repository Structure

```
code-to-figma/
├── packages/
│   ├── cli/                    # CLI (@kylebrodeur/code-to-figma)
│   │   ├── src/
│   │   │   ├── commands/       # init, scan, read, watch, plugin-output, token
│   │   │   ├── parser/         # Babel AST → ParsedComponent
│   │   │   ├── generator/      # ParsedComponent → FigmaJsonOutput
│   │   │   ├── cli.ts          # Commander entry point
│   │   │   └── config.ts       # .code-to-figma.json loader
│   │   └── README.md
│   └── plugin/                 # Figma plugin (@kylebrodeur/code-to-figma-plugin)
│       ├── src/
│       │   ├── code.ts         # Plugin main — message handler + Figma API
│       │   ├── ui.html         # Plugin UI panel
│       │   ├── primitives.ts   # Figma API building blocks
│       │   └── types.ts        # FigmaJsonOutput contract (mirror of CLI types)
│       ├── dist/code.js        # Compiled plugin (esbuild, ES2017)
│       └── manifest.json
├── code-to-figma/
│   ├── SKILL.md                # Agent skill definition
│   └── references/
│       ├── COMMANDS.md         # Full CLI reference
│       ├── SUPPORTED.md        # Parser support matrix
│       └── WORKFLOW.md         # Step-by-step workflow guide
└── .github/
    └── prompts/
        └── plan-reusableFigmaPlugin.prompt.md  # Build plan
```

---

## Development

```bash
# Install all dependencies
pnpm install

# Build both packages
pnpm build

# Build + watch (both packages)
pnpm dev

# CLI only
cd packages/cli && pnpm build
cd packages/cli && pnpm dev        # tsc --watch

# Plugin only
cd packages/plugin && pnpm build
cd packages/plugin && pnpm watch   # esbuild watch
```

---

## Why This Exists

**The gap:** Existing tools only bridge one direction:
- **Builder.io / Anima** — Figma → Code (design-first)
- **Figma Code Connect** — Code → API reference (not editable Figma designs)
- **Tokens Studio** — tokens only

**code-to-figma fills the reverse:** build in code, sync to Figma for stakeholder review and design documentation, without needing a dedicated designer.

---

## License

MIT

## Contributing

See package-specific READMEs for development guidelines.

## Related

- [ux-collab](https://github.com/kylebrodeur/ux-collab) - Agent skill for UI/UX workflows (uses this package)
