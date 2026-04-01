# Code-to-Figma Workflow

Detailed workflow for converting React components to Figma designs.

## Overview

```
CODE → PARSE → RESOLVE → GENERATE → IMPORT → FIGMA
  ↑                                                  ↓
  └──────────── UPDATE ← COMPARE ← VERIFY ────────────┘
```

## Step 1: CODE — Select Component

**Input:** React component file

Requirements:
- Functional component with defined props
- Uses Tailwind CSS or CSS modules
- Has variants (optional but recommended)

Example:
```tsx
// src/components/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'sm' | 'md' | 'lg';
}

export function Button({ variant, size }: ButtonProps) {
  // ...
}
```

## Step 2: PARSE — Extract Structure

**Command:**
```bash
code-to-figma scan src/components/Button.tsx
```

**Extracted:**
- Component name
- Props and types
- Variants (from prop unions)
- className strings
- JSX structure (simplified)

## Step 3: RESOLVE — Convert to Figma

Resolution happens automatically during `scan`. No extra flag needed — Tailwind classes are resolved inline:

| Tailwind | Figma Value |
|----------|-------------|
| `bg-blue-500` | `{ r: 0.231, g: 0.510, b: 0.965, a: 1 }` |
| `p-4` | `padding: 16` |
| `gap-2` | `itemSpacing: 8` |
| `rounded-md` | `cornerRadius: 6` |
| `rounded-lg` | `cornerRadius: 8` |
| `rounded-full` | `cornerRadius: 9999` |
| `text-sm` + `p-2` | `height: max(32, 14 + 8 + 8)` |

## Step 4: GENERATE — Figma JSON

**Output:** `.figma/Button.figma.json`

```json
{
  "name": "Button",
  "type": "COMPONENT_SET",
  "variants": [
    {
      "name": "primary/default",
      "properties": { "variant": "primary", "size": "default" },
      "frame": {
        "width": 120,
        "height": 40,
        "fills": [{ "type": "SOLID", "color": { "r": 0.2, "g": 0.4, "b": 1 } }],
        "padding": { "top": 8, "right": 16, "bottom": 8, "left": 16 }
      }
    }
  ],
  "autoLayout": {
    "mode": "HORIZONTAL",
    "gap": 8
  },
  "tokens": [
    {
      "name": "brand/primary",
      "type": "COLOR",
      "value": { "r": 0.2, "g": 0.4, "b": 1, "a": 1 },
      "source": "bg-blue-500"
    }
  ]
}
```

`tokens` is populated when `tokenMapping` is configured. Each entry carries a resolved `value` so the plugin can create real Figma Variables without further lookups.

## Step 5: IMPORT — Load in Figma via Plugin

```bash
# Generate bundle for plugin
code-to-figma plugin-output -i .figma -o plugin-data.json
```

In Figma:
```
Plugins → Code to Figma → Import from JSON
Select plugin-data.json
```

On import the plugin will:
1. Create frames/component sets on the `code-to-figma` page
2. **Create a Figma Variable Collection** named after the component for every token in `tokens[]` — one Variable per token entry (COLOR or FLOAT type)

> **Note:** The Figma REST API is read-only for design data. Creating frames
> and components requires the Plugin API. Use `code-to-figma read` to
> inspect an existing Figma file.

## Integration with ux-collab

Add SYNC phase to 8-step loop:

```
SEE → DISCUSS → IDEATE → SPECIFY → BUILD → VERIFY → SYNC → RECORD
                                                    ↑
                                               code-to-figma
```

**Configuration:**
```yaml
# .ux-collab.md
syncToFigma:
  enabled: true
  cliCommand: "npx @kylebrodeur/code-to-figma"
  outputDir: ".figma"
  onBuild: true
```

**Example session:**
```
User: "Build pricing page and sync to Figma"
Agent: [BUILD] Creates PricingCard.tsx
Agent: [VERIFY] Screenshot with agent-browser
Agent: [SYNC] code-to-figma scan PricingCard.tsx
       → Generated 4 variants
       → Ready for Figma import
Agent: [RECORD] Updates decisions doc
```

## Watch Mode

For active development:

```bash
code-to-figma scan "src/components/**/*.tsx" --watch
```

Automatically regenerates on file changes.
