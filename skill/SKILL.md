---
name: code-to-figma
description: "Sync React components to Figma designs. Use when: converting code components to Figma designs, creating design system documentation from code, or keeping Figma in sync with implementation. Trigger phrases: 'sync this component to Figma', 'generate Figma from code', 'create design system in Figma from components'."
compatibility: "Requires: code-to-figma CLI (npm install -g @kylebrodeur/code-to-figma) or npx. Optional: Figma plugin 'Code to Figma' installed."
license: MIT
metadata:
  author: kylebrodeur
  version: "0.1.0"
---

# Code-to-Figma Skill

Sync React components to Figma designs. Bridges the gap between code-first development and design documentation.

## When to Use

- Converting React components to Figma for stakeholder review
- Generating design system documentation from existing codebase
- Keeping Figma designs in sync with shipped code
- Creating component libraries in Figma from code

## Prerequisites

```bash
# Install CLI globally
npm install -g @kylebrodeur/code-to-figma

# Or use npx (no install)
npx @kylebrodeur/code-to-figma init
```

**Figma Plugin Setup:**
1. Install "Code to Figma" plugin in Figma Desktop
2. Or use REST API if you have Figma Enterprise

---

## The Workflow

```
CODE → PARSE → RESOLVE → GENERATE → SYNC → FIGMA
  ↑                                                  ↓
  └──────────── UPDATE ← COMPARE ← VERIFY ────────────┘
```

### Step 1 — CODE: Select Component

Identify the React component to sync:

```bash
# Example component
src/components/Button.tsx
```

**Requirements:**
- Functional component with defined props
- Uses Tailwind CSS or CSS modules
- Has variants (optional but recommended)

### Step 2 — PARSE: Extract Structure

```bash
code-to-figma scan src/components/Button.tsx
```

**What gets extracted:**
- Component name
- Props and their types
- Variants (from props like `variant`, `size`)
- className utilities
- JSX structure (simplified)

### Step 3 — RESOLVE: Convert to Figma Properties

```bash
# Resolve Tailwind classes to actual values
code-to-figma scan src/components/Button.tsx --resolve-tailwind
```

**Resolves:**
- `bg-blue-500` → `{ r: 0.2, g: 0.4, b: 1, a: 1 }`
- `p-4` → `padding: 16`
- `gap-2` → `itemSpacing: 8`
- `rounded-md` → `cornerRadius: 6`

### Step 4 — GENERATE: Figma JSON

```bash
# Output to .figma/Button.figma.json
code-to-figma scan src/components/Button.tsx -o .figma
```

**Generated structure:**
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
    "gap": 8,
    "padding": { "top": 8, "right": 16, "bottom": 8, "left": 16 }
  }
}
```

### Step 5 — SYNC: Upload to Figma

**Option A: Plugin (Recommended)**
```bash
# Generate plugin-compatible bundle
code-to-figma plugin-output -i .figma -o plugin-data.json

# Then in Figma:
# Plugins → Code to Figma → Import from JSON
```

**Option B: REST API (Enterprise only)**
```bash
code-to-figma sync --file-key ABC123
```

---

## Supported Patterns

### ✅ Works Well

```tsx
// Simple props
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

// Static Tailwind classes
export function Button({ variant, size, children }: ButtonProps) {
  const base = "rounded-md font-medium transition-colors";
  const variants = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100"
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };
  
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]}`}>
      {children}
    </button>
  );
}
```

### ⚠️ Limited Support

```tsx
// Dynamic class names
className={isActive ? 'bg-blue-500' : 'bg-gray-500'}

// Runtime computed values
className={`p-${customPadding}`}

// Conditional spread
className={cn(base, variant === 'primary' && 'bg-blue-500')}
```

**Workaround:** Use resolved classes via `getComputedStyle` or manual token mapping.

### ❌ Not Supported (Yet)

```tsx
// CSS-in-JS
const Button = styled.button`...`

// Complex runtime logic
className={computeClasses(props)}

// Responsive variants
className="md:bg-blue-500 lg:bg-red-500"
```

---

## Configuration

`.code-to-figma.json`:

```json
{
  "figmaFileKey": "ABC123",
  "componentGlob": "src/components/**/*.tsx",
  "tokenMapping": {
    "--color-primary": "primary/500",
    "--color-secondary": "secondary/500",
    "--space-4": "spacing/4",
    "--radius-md": "radius/6"
  },
  "outputDir": ".figma",
  "framework": "react",
  "styling": "tailwind",
  "parserOptions": {
    "extractVariantsFromProps": ["variant", "size", "color"],
    "resolveTailwind": true,
    "includeJsxStructure": false
  }
}
```

---

## Integration with ux-collab

Add to `.ux-collab.md`:

```yaml
syncToFigma:
  enabled: true
  cliCommand: "npx code-to-figma"
  outputDir: ".figma"
  autoSync: false
  
  # When to trigger during ux-collab loop
  onBuild: true      # After BUILD phase
  onVerify: false    # After VERIFY (optional)
  
  # Conflict resolution
  onConflict: "prompt"  # prompt, overwrite, skip
```

**Workflow with ux-collab:**

```
SEE → DISCUSS → IDEATE → SPECIFY → BUILD → VERIFY → SYNC → RECORD
                                                    ↑
                                           [code-to-figma skill]
```

**Example session:**

```
User: "Let's work on the Button component"
Agent: [SEE] Screenshot current implementation
User: "Sync this to Figma for the design team to review"
Agent: [SYNC] Running code-to-figma scan
Agent: [SYNC] Generated 4 variants (primary, secondary, ghost × sm, md, lg)
Agent: [SYNC] Upload to Figma file "Design System"
Agent: [RECORD] Updated DESIGN_DECISIONS.md with Figma link
```

---

## Commands Reference

| Command | Purpose | Example |
|---------|---------|---------|
| `init` | Create config | `code-to-figma init` |
| `scan <file>` | Parse component | `code-to-figma scan Button.tsx` |
| `scan --watch` | Watch for changes | `code-to-figma scan --watch` |
| `sync` | Upload to Figma | `code-to-figma sync --file-key ABC123` |
| `plugin-output` | Generate plugin JSON | `code-to-figma plugin-output` |

---

## Troubleshooting

### "No variants detected"

Ensure props use literal unions:
```tsx
variant: 'primary' | 'secondary'  // ✅ Detected
variant: string                   // ❌ Too broad
```

### "Tailwind classes not resolved"

Ensure Tailwind config is accessible:
```bash
code-to-figma scan Button.tsx --tailwind-config ./tailwind.config.ts
```

### "Figma plugin shows error"

Check JSON validity:
```bash
code-to-figma scan Button.tsx --validate
```

---

## Resources

- [code-to-figma CLI docs](../../code-to-figma/README.md)
- [Building vs Using Parsers](../../code-to-figma/RECOMMENDATIONS.md)
- [Figma Plugin API](https://www.figma.com/plugin-docs/)
