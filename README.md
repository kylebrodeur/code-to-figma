# code-to-figma

Parse React components with Babel AST, generate structured `.figma.json` files, and render them as Figma frames using a local plugin — all from the command line.

```
React Component (.tsx)
        │
        ▼  code-to-figma scan
.figma.json  (structured component data)
        │
        ▼  code-to-figma plugin-output
plugin-data.json  (bundled for plugin)
        │
        ▼  Figma plugin: Import JSON
Figma Canvas  (auto-layout frames + variant sets)
```

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

## What Gets Parsed

The CLI uses Babel AST to extract:

| Feature | What's extracted |
|---------|-----------------|
| **Variant props** | String literal unions (`'primary' \| 'secondary'`) → one frame per value |
| **Component type** | `COMPONENT_SET` (has variant prop) or `COMPONENT` (single frame) |
| **Layout** | `flex`, `flex-row/col`, `gap-*`, `p-*` Tailwind classes |
| **Auto-layout** | Direction, gap, padding, alignment mode |
| **Typography** | `font-*`, `text-*` (size classes), `fontFamily` |
| **Fills** | `bg-*` Tailwind color classes → RGBA fills |
| **Props list** | All destructured props with `variantProperty` flag |
| **Design tokens** | CSS-class → Figma path via `tokenMapping` → `tokens[]` with resolved values; plugin creates a Figma Variable Collection on import |

**Limitations:** Dynamic `className` expressions aren't resolved. Tailwind color classes without a `tokenMapping` entry resolve to built-in fallback colors. See [SUPPORTED.md](./code-to-figma/references/SUPPORTED.md) for the full matrix.

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

---

## Repository Structure

```
code-to-figma/
├── packages/
│   ├── cli/                    # CLI (@kylebrodeur/code-to-figma)
│   │   ├── src/
│   │   │   ├── commands/       # init, scan, read, watch, plugin-output
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


```
┌─────────────────────────────────────────────────────────────┐
│  REACT COMPONENTS                                            │
│  (Button.tsx, Card.tsx...)                                  │
└────────────────────┬────────────────────────────────────────┘
                     │ CLI parses + generates
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  .figma.json files                                          │
│  (structured component data)                                  │
└────────────────────┬────────────────────────────────────────┘
                     │ Plugin consumes
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  FIGMA DESIGNS                                              │
│  (auto-layout frames, variants, specs)                        │
└─────────────────────────────────────────────────────────────┘
```

## Packages

| Package | Purpose | Location |
|---------|---------|----------|
| `@kylebrodeur/code-to-figma` | 🖥️ CLI - Parse React → Generate .figma.json | [`packages/cli/`](./packages/cli/) |
| `@kylebrodeur/code-to-figma-plugin` | 🎨 Figma Plugin - Render .figma.json → Designs | [`packages/plugin/`](./packages/plugin/) |

## Quick Start

### 1. Install CLI

```bash
npm install -g @kylebrodeur/code-to-figma
# or
npx @kylebrodeur/code-to-figma init
```

### 2. Configure

```bash
code-to-figma init
# Creates .code-to-figma.json
```

### 3. Scan Components

```bash
code-to-figma scan src/components/Button.tsx
# Generates .figma/Button.figma.json
```

### 4. Plugin Output

```bash
code-to-figma plugin-output -i .figma -o plugin-data.json
```

### 5. Import in Figma

```
Plugins → Code to Figma → Import from JSON
```

## Supported Patterns

**✅ Works well:**
- Static Tailwind classes (`className="bg-blue-500 p-4"`)
- Variant mapping from props (`variant: 'primary' \| 'secondary'`)
- Simple composition patterns

**⚠️ Limited:**
- Dynamic class names (`className={isActive ? 'x' : 'y'}`)
- Runtime expressions in className

**❌ Not supported:**
- CSS-in-JS (styled-components, emotion)
- Complex conditional logic

## Repository Structure

```
code-to-figma/
├── packages/
│   ├── cli/          # CLI implementation
│   │   ├── src/
│   │   │   ├── parser/      # React AST parsing
│   │   │   ├── generator/   # Figma JSON generation
│   │   │   └── commands/    # CLI commands
│   │   └── README.md
│   └── plugin/       # Figma plugin (consumes JSON)
│       ├── code.js
│       ├── ui.html
│       └── manifest.json
├── code-to-figma/
│   └── SKILL.md      # Agent skill definition (Agent Skills, Claude Code, GitHub Copilot)
└── README.md         # This file
```

## Development

```bash
# Install dependencies
pnpm install

# Build CLI
pnpm build:cli

# Build plugin
pnpm build:plugin

# Dev mode
pnpm dev:cli    # Watch TypeScript
pnpm dev:plugin # Watch plugin
```

## Documentation

- [CLI README](./packages/cli/README.md) - Full CLI documentation
- [SKILL.md](./code-to-figma/SKILL.md) - Agent integration guide
- [docs/RECOMMENDATIONS.md](./docs/RECOMMENDATIONS.md) - Architecture decisions

## Why This Exists

**The Gap:** Existing tools only go one direction:
- **Builder.io, Anima:** Figma → Code (design-first)
- **Figma Code Connect:** Code → API reference (not editable designs)
- **Tokens Studio:** Tokens only, not full components

**Code-to-Figma fills the reverse:** Code-first teams can build, then sync to Figma for stakeholder review and design documentation.

## License

MIT

## Contributing

See package-specific READMEs for development guidelines.

## Related

- [ux-collab](https://github.com/kylebrodeur/ux-collab) - Agent skill for UI/UX workflows (uses this package)
