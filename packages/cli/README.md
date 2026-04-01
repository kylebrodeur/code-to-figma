# @kylebrodeur/code-to-figma

CLI for parsing React components and generating Figma-compatible JSON.

## Install

```bash
npm install -g @kylebrodeur/code-to-figma
# or
npx @kylebrodeur/code-to-figma <command>
```

Requires **Node.js 18+**.

---

## Commands

### `init`

Create a `.code-to-figma.json` config file in the current directory.

```bash
code-to-figma init
code-to-figma init --force   # overwrite existing
```

**Output:** `.code-to-figma.json`

---

### `scan <filePattern>`

Parse React component(s) and generate `.figma.json` output files.

```bash
# Single file
code-to-figma scan src/components/Button.tsx

# Glob (quote to prevent shell expansion)
code-to-figma scan "src/components/**/*.tsx"

# Custom output directory
code-to-figma scan src/components/Button.tsx -o my-figma-data

# Watch mode — re-scans on save
code-to-figma scan "src/components/**/*.tsx" --watch
```

**Options:**

| Flag | Default | Description |
|------|---------|-------------|
| `-o, --output <dir>` | `.figma` | Output directory for `.figma.json` files |
| `-w, --watch` | off | Watch files for changes |

**Output:** `<outputDir>/<ComponentName>.figma.json` per component

**What it extracts:**
- `name` — component name
- `type` — `COMPONENT_SET` (has variant prop) or `COMPONENT`
- `variants` — one entry per string-literal value in the variant union
- `styles` — layout (flex direction, gap, padding) + typography (family, size, weight)
- `autoLayout` — Figma auto-layout settings (mode, wrap, alignment)
- `props` — all destructured props with `type` (from TS unions) and `variantProperty` flag
- `tokens` — CSS token names found in className strings
- `frame.cornerRadius` — from `rounded-*` classes
- `frame.width/height` — inferred from font-size + padding

**Variant detection:** The parser reads `TSInterfaceDeclaration` and `TSTypeAliasDeclaration` nodes to extract actual union literal values. For example:

```tsx
interface ButtonProps {
  variant?: "primary" | "secondary" | "destructive";
}
```

Produces three variants: `primary`, `secondary`, `destructive`. Falls back to generic names (`default`, `primary`, `secondary`, `outline`) if no TypeScript types are found.

---

### `plugin-output`

Bundle multiple `.figma.json` files into a single `plugin-data.json` array for the Figma plugin.

```bash
code-to-figma plugin-output
code-to-figma plugin-output -i .figma -o plugin-data.json
```

**Options:**

| Flag | Default | Description |
|------|---------|-------------|
| `-i, --input <dir>` | `.figma` | Directory containing `*.figma.json` files |
| `-o, --output <file>` | `plugin-data.json` | Output file path |

**Output:** JSON array of `FigmaJsonOutput` objects, ready to paste or load in the plugin.

**Example output summary:**
```
✓ Button.figma.json — COMPONENT_SET, 3 variant(s)
✓ Badge.figma.json  — COMPONENT_SET, 4 variant(s)
✓ Card.figma.json   — COMPONENT, 1 variant(s)

Bundled 3 component(s) → plugin-data.json
  Next: Load plugin-data.json in the Figma plugin
```

---

### `read`

Read components and styles from an existing Figma file via the REST API.

```bash
code-to-figma read --file-key ABC123
code-to-figma read --file-key ABC123 --node-id 1:234
code-to-figma read --file-key ABC123 -o figma-read.json
```

**Requires** `figmaAccessToken` in `.code-to-figma.json` (or `FIGMA_ACCESS_TOKEN` env var). This command is for reading *from* Figma, not writing to it.

---

## Configuration

`.code-to-figma.json`:

```json
{
  "figmaFileKey": "ABC123",
  "figmaAccessToken": "figd_...",
  "componentGlob": "src/components/**/*.tsx",
  "outputDir": ".figma",
  "framework": "react",
  "styling": "tailwind",
  "adapter": "tailwind-v3",
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

| Field | Default | Description |
|-------|---------|-------------|
| `figmaFileKey` | `""` | Figma file key for `read` command |
| `figmaAccessToken` | `""` | Personal access token for `read` command |
| `componentGlob` | `"src/components/**/*.tsx"` | Default glob for `scan` |
| `outputDir` | `".figma"` | Where `.figma.json` files are written |
| `framework` | `"react"` | Parser mode (`react` only currently) |
| `styling` | `"tailwind"` | Styling system to resolve |
| `adapter` | auto | Explicit adapter override: `tailwind-v3`, `tailwind-v4`, `shadcn`, `shadcn-v4`, `radix`, `base-ui` |
| `tokenMapping` | `{}` | Map CSS custom properties to Figma token paths |
| `parserOptions.extractVariantsFromProps` | `true` | Detect variant prop unions |
| `parserOptions.detectClassNameUtilities` | `true` | Parse Tailwind `className` strings |
| `parserOptions.extractSpacing` | `true` | Extract padding/gap values |

---

## Supported Patterns

| Pattern | Status |
|---------|--------|
| Static `className="..."` strings | ✅ Full |
| TypeScript literal union props (`'a' \| 'b'`) | ✅ Full |
| Template literals in `className` (static parts) | ✅ Full |
| `cn()` / `clsx()` / `classnames()` — static string args | ✅ Full |
| Inline `style={{ backgroundColor, color, fontSize, fontWeight, borderRadius }}` | ✅ Full |
| Arrow function + `React.FC<Props>` | ✅ Full |
| Function declaration components | ✅ Full |
| `interface Props` + `type Props` — prop type inference | ✅ Full |
| Watch mode (`--watch`) with unlink cleanup | ✅ Full |
| `FIGMA_ACCESS_TOKEN` env var for `read` command | ✅ Full |
| Dynamic `className` expressions (conditional ternaries) | ⚠️ Limited (static quasis only) |
| `cn()` / `clsx()` with boolean conditions | ⚠️ Limited (unconditional args only) |
| CSS Modules / styled-components | ❌ Not supported |

See [`../../code-to-figma/references/SUPPORTED.md`](../../code-to-figma/references/SUPPORTED.md) for detailed examples.

---

## Programmatic API

```typescript
import { scanFile, pluginOutput, generateFigmaJson, parseComponent } from "@kylebrodeur/code-to-figma";

// Scan a file
await scanFile("src/components/Button.tsx", ".figma", config);

// Bundle for plugin
await pluginOutput({ input: ".figma", output: "plugin-data.json" });

// Low-level: parse then generate
const parsed = await parseComponent("Button.tsx", config);
const json = generateFigmaJson(parsed, config);
```

---

## Development

```bash
cd packages/cli

# Build (tsc)
pnpm build

# Watch
pnpm dev

# Typecheck only
pnpm typecheck
```


## Quick Start

```bash
# Install globally
npm install -g @kylebrodeur/code-to-figma

# Or use npx
npx @kylebrodeur/code-to-figma init
npx @kylebrodeur/code-to-figma scan src/components/Button.tsx
npx @kylebrodeur/code-to-figma plugin-output -i .figma -o plugin-data.json
```

## Architecture

```
React Component → Parser → Figma JSON → Figma Plugin → Figma Canvas
                     ↑______CLI_______↑    ↑______Plugin_____↑
```

**Two-part system:**
1. **CLI** (this package) — Parses React/Tailwind, generates `.figma.json`
2. **Figma Plugin** — Reads JSON, renders frames with auto-layout

## Workflows

### Workflow A: Code-First (Greenfield)
```
1. Build component in React
2. code-to-figma scan → generates .figma.json
3. Plugin imports to Figma
4. Designers polish in Figma
5. Future updates: re-scan → re-import in plugin
```

### Workflow B: Figma-First (with Code Connect)
```
1. Design in Figma
2. Code Connect → generates React
3. Implement in code
4. (Optional) Read components via `code-to-figma read`
```

## Commands

| Command | Purpose |
|---------|---------|
| `init` | Create `.code-to-figma.json` config |
| `scan <file>` | Parse component to `.figma.json` |
| `scan --watch` | Watch and re-scan on change |
| `read` | Read components/styles from Figma via REST API |
| `plugin-output` | Generate plugin-compatible JSON bundle || `token add -k <key> -p <path>` | Add or update a token mapping |
| `token remove -k <key>` | Remove a token mapping |
| `token list` | List all token mappings |
| `token clear` | Remove all token mappings |
## Configuration

`.code-to-figma.json`:
```json
{
  "figmaFileKey": "ABC123",
  "figmaAccessToken": "figd_xxx",
  "componentGlob": "src/components/**/*.tsx",
  "tokenMapping": {
    "--color-primary": "primary/500",
    "--space-4": "spacing/4"
  },
  "outputDir": ".figma",
  "framework": "react",
  "styling": "tailwind",
  "adapter": "tailwind-v3",
  "parserOptions": {
    "extractVariantsFromProps": true,
    "detectClassNameUtilities": true
  }
}
```

> **Tip:** Token mappings can be managed without editing this file — use `code-to-figma token add -k "--color-primary" -p "color/primary"`.

## Integration with ux-collab

Add to your `.ux-collab.md`:

```yaml
codeToFigma:
  enabled: true
  cliCommand: "npx @kylebrodeur/code-to-figma"
  outputDir: ".figma"
  onBuild: true
```

## Figma Plugin Setup

1. Install plugin from Figma Community: "Code to Figma"
2. Or development: Load `plugin/` folder in Figma Desktop
3. Plugin reads from JSON files or REST API

## License

MIT
