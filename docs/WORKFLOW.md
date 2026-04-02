# End-to-End Workflow Guide

From a fresh React component to live Figma frames — and keeping them in sync as your code evolves.

---

## Overview

```
Your codebase
      │
      ▼  code-to-figma scan
.figma/*.figma.json       ← one file per component
      │
      ▼  code-to-figma plugin-output
plugin-data.json          ← bundled for the plugin
      │
      ▼  Figma plugin: Import JSON → Build
Figma canvas              ← component sets + variant frames
      │
      ▼  Edit code → re-scan → plugin: Update
Figma canvas kept in sync
```

---

## Phase 1 — First-Time Setup

### 1.1 Install the CLI

```bash
npm install -g @kylebrodeur/code-to-figma
# verify
code-to-figma --version
```

Or use without installing (slower on each run):

```bash
npx @kylebrodeur/code-to-figma scan src/components/Button.tsx
```

### 1.2 Initialize config in your project

```bash
cd my-react-app
code-to-figma init
```

This creates `.code-to-figma.json`:

```json
{
  "componentGlob": "src/components/**/*.tsx",
  "outputDir": ".figma",
  "framework": "react",
  "styling": "tailwind",
  "adapter": "tailwind-v3"
}
```

Adjust `adapter` to match your stack:

| Stack | `adapter` value |
|-------|----------------|
| Tailwind CSS v3 | `"tailwind-v3"` (default) |
| Tailwind CSS v4 | `"tailwind-v4"` |
| shadcn/ui | `"shadcn"` |
| shadcn/ui + Tailwind v4 | `"shadcn-v4"` |
| Radix Themes | `"radix"` |
| Base UI | `"base-ui"` |

### 1.3 Load the plugin in Figma

1. Open **Figma Desktop** (plugin API not available in-browser)
2. **Plugins → Development → Import plugin from manifest…**
3. Select `packages/plugin/manifest.json` from this repository (or wherever you cloned it)
4. The plugin is now available under **Plugins → Development → code-to-figma**

This is a one-time step per Figma installation.

---

## Phase 2 — Scanning Components

### 2.1 Scan a single component

```bash
code-to-figma scan src/components/Button.tsx
```

Output: `.figma/Button.figma.json`

### 2.2 Scan everything at once

```bash
code-to-figma scan "src/components/**/*.tsx"
```

Output: one `.figma.json` file per component found.

### 2.3 What gets extracted

The parser reads your TypeScript source (no build step required) and extracts:

- **Variant props** — `variant?: 'primary' | 'secondary'` → one Figma frame per value
- **Colors** — Tailwind `bg-*`, `text-*`, `border-*` → resolved to RGBA
- **Layout** — `flex`, `flex-row/col`, `gap-*`, `p-*`, `px-*`, `py-*` → auto-layout settings
- **Typography** — `text-sm`, `font-bold`, `font-sans` → fontSize, fontWeight, fontFamily
- **Border radius** — `rounded-*` → cornerRadius
- **CSS Modules** — `styles.button`, `cn(styles.a, styles.b)`, `styles[variant]`, `composes:`
- **CVA** — `cva("base", { variants: { … } })` → full cross-product of variants
- **cn()/clsx()** — static strings, ternary branches, logical `&&` args

### 2.4 Example component and output

Component:

```tsx
// src/components/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'primary', size = 'md' }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center rounded-md font-semibold',
        variant === 'primary' && 'bg-blue-500 text-white',
        variant === 'secondary' && 'bg-gray-100 text-gray-900',
        variant === 'destructive' && 'bg-red-500 text-white',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2 text-base',
        size === 'lg' && 'px-6 py-3 text-lg',
      )}
    >
      Button
    </button>
  );
}
```

Scan output `.figma/Button.figma.json` (abbreviated):

```json
{
  "name": "Button",
  "type": "COMPONENT_SET",
  "variants": [
    {
      "name": "primary/sm",
      "properties": { "variant": "primary", "size": "sm" },
      "frame": {
        "width": 120, "height": 32,
        "fills": [{ "type": "SOLID", "color": { "r": 0.231, "g": 0.510, "b": 0.965, "a": 1 } }],
        "padding": { "top": 6, "right": 12, "bottom": 6, "left": 12 }
      }
    }
    // … 8 more variant combinations
  ]
}
```

---

## Phase 3 — Bundling for the Plugin

After scanning, bundle all `.figma.json` files into one payload for the plugin:

```bash
code-to-figma plugin-output
# uses defaults: -i .figma -o plugin-data.json

# explicit paths
code-to-figma plugin-output -i .figma -o plugin-data.json
```

Output summary printed to terminal:

```
✓ Button.figma.json   — COMPONENT_SET, 9 variant(s)
✓ Badge.figma.json    — COMPONENT_SET, 4 variant(s)
✓ Card.figma.json     — COMPONENT, 1 variant(s)

Bundled 3 component(s) → plugin-data.json
  Next: Load plugin-data.json in the Figma plugin
```

---

## Phase 4 — Rendering in Figma

### 4.1 Import the JSON

In Figma, open the plugin (**Plugins → Development → code-to-figma**).

Two ways to load data:

**Option A — Load file:** Click **Load file** and select `plugin-data.json`.

**Option B — Paste JSON:** Expand the import panel (`▸`), paste the contents of `plugin-data.json`, click **Import**.

The component list populates with one row per component.

### 4.2 Build components

- **Build** button on a row — renders that component immediately
- **Select all** + **Build selected** — renders everything at once
- All frames are created on a Figma page named **`code-to-figma`** (auto-created if missing)

### 4.3 What appears on canvas

For a `COMPONENT_SET` (has variants):
- A wrapper frame with the component name as a label
- A horizontal row of variant frames, one per variant combination
- Each frame has auto-layout, fills, padding, typography, and corner radius applied from the JSON

For a `COMPONENT` (single):
- One frame with the same properties

---

## Phase 5 — Ongoing Updates

This is the normal day-to-day loop as you iterate on code.

### 5.1 Re-scan changed components

After editing a component:

```bash
code-to-figma scan src/components/Button.tsx
code-to-figma plugin-output
```

Or scan all components if multiple changed:

```bash
code-to-figma scan "src/components/**/*.tsx"
code-to-figma plugin-output
```

### 5.2 Update in Figma

In the plugin, reload `plugin-data.json` (or paste the updated JSON), then click **Update** to rebuild only the components that already exist on canvas.

The **Update** action:
1. Finds the existing wrapper frame on the `code-to-figma` page by component name
2. Deletes the old variant frames inside it
3. Rebuilds from the new JSON data
4. Preserves your page layout (the wrapper frame stays in place)

### 5.3 Watch mode (automated re-scan)

For active development, run the CLI in watch mode. Every time you save a component file, the `.figma.json` is automatically regenerated:

```bash
code-to-figma scan "src/components/**/*.tsx" --watch
```

You still need to manually run `plugin-output` and hit **Update** in Figma — watch mode only keeps the JSON files current.

---

## Phase 6 — Token Mapping (Optional)

If you use CSS custom properties (design tokens) in your Tailwind config or CSS, map them to Figma Variable paths so the plugin can create real Figma Variables.

In `.code-to-figma.json`:

```json
{
  "tokenMapping": {
    "--color-primary": "brand/primary",
    "--color-destructive": "brand/destructive",
    "--space-4": "spacing/4",
    "--radius-md": "radius/md"
  }
}
```

When a component uses `bg-(--color-primary)` (Tailwind v4) or a CSS Module references `var(--color-primary)`, the parser emits a token entry. The plugin creates a **Figma Variable Collection** per component and populates it with COLOR / FLOAT variables — one per token.

---

## Phase 7 — Reading from Figma (Optional)

The `read` command lets you inspect what's already in a Figma file — useful for comparing your component output against existing Figma components.

```bash
# Set your access token once
export FIGMA_ACCESS_TOKEN=figd_...
# or add to .code-to-figma.json

# Read the whole file
code-to-figma read --file-key ABC123

# Read a specific node
code-to-figma read --file-key ABC123 --node-id 1:234

# Save output to file
code-to-figma read --file-key ABC123 -o figma-read.json
```

The file key is the segment after `/design/` in the Figma URL:  
`https://www.figma.com/design/ABC123/My-File` → `ABC123`

---

## Common Patterns

### Single component, iterating quickly

```bash
# Terminal 1 — watch + rebuild JSON on every save
code-to-figma scan src/components/Button.tsx --watch

# Terminal 2 — rebuild bundle after each scan (optional script)
# Or just run plugin-output manually when ready to push to Figma
code-to-figma plugin-output
```

### Full library sync

```bash
# Scan everything
code-to-figma scan "src/components/**/*.tsx"

# Bundle
code-to-figma plugin-output

# In Figma: select all → Build selected (first time)
# Or: Update (subsequent syncs)
```

### CI / pre-commit hook

```bash
# .husky/pre-commit or similar
code-to-figma scan "src/components/**/*.tsx"
code-to-figma plugin-output
git add .figma plugin-data.json
```

This keeps `.figma.json` and `plugin-data.json` committed and always in sync with the component source.

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---------|-------------|-----|
| No variants generated | Props not typed with string literals | Add `variant?: 'a' \| 'b'` to your interface |
| Fill is a grey placeholder | Class not resolvable by adapter | Check `adapter` in config matches your Tailwind version |
| CSS Module styles missing | `.module.css` import not found | Ensure the import path in the component is correct relative to the file |
| Plugin shows blank frames | `width`/`height` are `0` | Component has no padding/font-size — add `p-*` or `text-*` classes |
| `composes:` not resolved | Cross-file path wrong | Check the `from` path in your CSS Module is correct |
| Token not created in Figma | `tokenMapping` not set | Add the CSS variable → token path mapping to `.code-to-figma.json` |
