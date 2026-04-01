---
name: code-to-figma
description: "Sync React components to Figma designs. Use when: 'sync component to Figma', 'generate Figma from code', 'create design system in Figma', 'export React to Figma'. Parses React/TSX with Babel AST, resolves Tailwind classes, outputs Figma-compatible JSON. Requires Node.js 18+, optional Figma plugin for rendering."
compatibility: "Requires: Node.js 18+, @kylebrodeur/code-to-figma CLI (npm i -g or npx). Optional: Figma Desktop with plugin loaded from packages/plugin/manifest.json. Network: none for CLI, Figma REST API for read command only. Platforms: Agent Skills, Claude Code, GitHub Copilot."
license: MIT
metadata:
  author: kylebrodeur
  version: "0.1.1"
  repository: https://github.com/kylebrodeur/code-to-figma
  cli-package: "@kylebrodeur/code-to-figma"
  platforms:
    - agent-skills
    - claude-code
    - github-copilot
---

# Code-to-Figma Skill

Convert React components to Figma designs. Parse TypeScript prop interfaces, extract Tailwind layout/style classes, and render component sets with variants directly in Figma via a local plugin.

## When to Use

- **Sync to Figma:** "Sync Button component to Figma"
- **Generate from code:** "Create Figma designs from my components"
- **Design system docs:** "Export component library to Figma"
- **Code-first workflow:** Build in code, then sync to Figma for stakeholder review

## Full Workflow

```
1. code-to-figma scan src/components/Button.tsx
   → .figma/Button.figma.json

2. code-to-figma plugin-output -i .figma -o plugin-data.json
   → plugin-data.json  (all components bundled)

3. Figma Desktop → Plugins → Development → Import plugin from manifest
   → select packages/plugin/manifest.json

4. Run plugin → Import JSON → Build selected
   → Frames appear on page "code-to-figma"
```

## Quick Start

```bash
# Install CLI
npm install -g @kylebrodeur/code-to-figma

# Scan component(s)
code-to-figma scan src/components/Button.tsx
code-to-figma scan "src/components/**/*.tsx"

# Generate for Figma plugin
code-to-figma plugin-output -i .figma -o plugin-data.json
```

Then in Figma: load plugin from `packages/plugin/manifest.json`, import `plugin-data.json`.

## Commands

| Command | Purpose |
|---------|---------|
| `init` | Create `.code-to-figma.json` config |
| `scan <pattern>` | Parse component(s) → `.figma.json` per file |
| `scan --watch` | Re-scan on save |
| `plugin-output` | Bundle `.figma.json` files → `plugin-data.json` |
| `read --file-key <key>` | Read from Figma REST API |
| `token add <cssVar> <figmaPath>` | Add or update a token mapping |
| `token remove <cssVar>` | Remove a token mapping |
| `token list` | Show all current token mappings |
| `token clear` | Remove all token mappings |

## Supported Patterns

| Pattern | Status | Example |
|---------|--------|---------|
| Static Tailwind | ✅ | `className="bg-blue-500 p-4"` |
| TypeScript literal union props | ✅ | `variant: 'primary' \| 'secondary'` |
| Prop type inference | ✅ | Types back-filled into `props[]` array |
| Arrow function + `React.FC<Props>` | ✅ | Standard function component |
| `interface Props` + `type Props` | ✅ | Types read for variant detection |
| Template literals (static parts) | ✅ | `` `${base} ${cls}` `` (base string extracted) |
| `cn()` / `clsx()` / `classnames()` — static args | ✅ | `cn("bg-blue-500", "p-4")` |
| Inline `style={{}}` — color/font/radius properties | ✅ | `style={{ backgroundColor: '#3b82f6' }}` |
| `rounded-*` → `cornerRadius` | ✅ | `rounded-lg` → 8px |
| Frame size from font-size + padding | ✅ | Inferred, not hardcoded |
| Figma Variable Collections | ✅ | `tokenMapping` in config → COLOR/FLOAT variables created on import |
| Tailwind v4 CSS-var syntax | ✅ | `bg-(--color-primary)` matched to `tokenMapping` |
| Watch mode with unlink cleanup | ✅ | Removes `.figma.json` when source is deleted |
| `FIGMA_ACCESS_TOKEN` env var | ✅ | Fallback for `read` command |
| Dynamic `className` expressions | ⚠️ | `{isActive ? 'x' : 'y'}` not resolved |
| `cn()` / `clsx()` with boolean conditions | ⚠️ | Unconditional args only |
| CSS-in-JS (styled, emotion) | ❌ | Not supported |

See [references/SUPPORTED.md](references/SUPPORTED.md) for full spec.

## Generating Token Mappings

`tokenMapping` tells the plugin how to resolve CSS class names or CSS custom properties into Figma Variable paths. Without it, color fills and spacing will appear as hardcoded values with no Figma Variable link.

### How token mappings work

```jsonc
// .code-to-figma.json
{
  "tokenMapping": {
    // CSS custom property (Tailwind v4)       → Figma variable path
    "--color-primary": "color/primary",
    "--color-brand-500": "brand/500",

    // Tailwind v3 semantic class               → Figma variable path
    "bg-primary": "color/primary",
    "text-brand": "color/brand"
  }
}
```

The key is whatever appears in `className` (or a CSS var reference like `bg-(--color-primary)`).  
The value is the Figma Variable path (`collection/variable` or just `variable`).

### CLI commands

```bash
# Add a mapping
code-to-figma token add -k "--color-primary" -p "color/primary"
code-to-figma token add -k "bg-brand" -p "brand/500"

# Review what's mapped
code-to-figma token list

# Remove a single entry
code-to-figma token remove -k "--color-primary"

# Wipe all entries
code-to-figma token clear
```

> `token add` merges into the existing config file. No other fields are overwritten.

### Common patterns

#### Tailwind v4 CSS custom properties → Figma paths

| CSS var in className | Figma path | Example usage |
|---|---|---|
| `--color-primary` | `color/primary` | `bg-(--color-primary)` |
| `--color-brand-500` | `brand/500` | `text-(--color-brand-500)` |
| `--color-surface` | `color/surface` | `bg-(--color-surface)` |
| `--radius-md` | `radius/md` | `rounded-(--radius-md)` |
| `--spacing-4` | `spacing/4` | `p-(--spacing-4)` |

#### Tailwind v3 semantic classes → Figma paths

| Tailwind class | Figma path | Notes |
|---|---|---|
| `bg-primary` | `color/primary` | shadcn/ui default |
| `bg-secondary` | `color/secondary` | shadcn/ui default |
| `bg-destructive` | `color/destructive` | shadcn/ui default |
| `bg-muted` | `color/muted` | shadcn/ui default |
| `bg-accent` | `color/accent` | shadcn/ui default |
| `text-primary` | `color/primary-foreground` | shadcn foreground |
| `text-muted-foreground` | `color/muted-foreground` | shadcn foreground |
| `border-border` | `color/border` | shadcn border |
| `ring-ring` | `color/ring` | shadcn focus ring |

#### shadcn/ui full token set (run these to bootstrap)

```bash
code-to-figma token add -k "bg-background" -p "color/background"
code-to-figma token add -k "bg-foreground" -p "color/foreground"
code-to-figma token add -k "bg-card" -p "color/card"
code-to-figma token add -k "bg-primary" -p "color/primary"
code-to-figma token add -k "bg-primary-foreground" -p "color/primary-foreground"
code-to-figma token add -k "bg-secondary" -p "color/secondary"
code-to-figma token add -k "bg-secondary-foreground" -p "color/secondary-foreground"
code-to-figma token add -k "bg-muted" -p "color/muted"
code-to-figma token add -k "bg-muted-foreground" -p "color/muted-foreground"
code-to-figma token add -k "bg-accent" -p "color/accent"
code-to-figma token add -k "bg-destructive" -p "color/destructive"
code-to-figma token add -k "border-border" -p "color/border"
code-to-figma token add -k "ring-ring" -p "color/ring"
```

### Agent workflow for generating mappings

When a user asks to set up token mappings or says colors aren't resolving in Figma:

1. **Identify the styling system** — ask or infer from `package.json` / `tailwind.config.*`
2. **Find custom tokens in use:**
   - Tailwind v4: grep for `bg-(--`, `text-(--`, `border-(--` in component files
   - Tailwind v3: check `tailwind.config` `theme.extend.colors` / `theme.extend.backgroundColor`
   - shadcn: look for `globals.css` CSS variable definitions under `:root`
3. **Generate the `token add` commands** — one per entry, using the table above as a guide
4. **Run the commands** (or paste the block into a terminal)
5. **Verify with `code-to-figma token list`**

Example agent dialogue:
> "I can see you're using shadcn/ui with these semantic colors in your Button: `bg-primary`, `bg-destructive`, `text-primary-foreground`. Here are the token-add commands to map them:"
> ```bash
> code-to-figma token add -k "bg-primary" -p "color/primary"
> code-to-figma token add -k "bg-destructive" -p "color/destructive"
> code-to-figma token add -k "text-primary-foreground" -p "color/primary-foreground"
> ```
> "Run these, then re-scan your component. The Figma plugin will bind those fills to Figma Variables automatically."

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Variants are wrong names | Ensure `interface Props { variant: 'a' \| 'b' }` syntax (literal unions, not `string`) |
| Empty fills in Figma | Add `tokenMapping` in config to resolve colors; plugin will also create Figma Variables per token |
| No Figma Variables created | Expected when `tokenMapping` is empty — add CSS-class-to-path entries in config |
| Plugin not in menu | Use Figma **Desktop** (not browser); load via **Plugins → Development → Import from manifest** |
| `cn()`/`clsx()` classes not extracted | Only unconditional string args are extracted; conditional args (ternary, `&&`) are skipped |
| Inline style color not resolved | Use hex strings (e.g. `'#3b82f6'`) — color keywords and `rgb()` are not parsed |

## Integration

### With ux-collab

Add to `.ux-collab.md`:
```yaml
codeToFigma:
  enabled: true
  cliCommand: "npx @kylebrodeur/code-to-figma"
  onBuild: true
```

### Standalone

```bash
npx @kylebrodeur/code-to-figma scan components/**/*.tsx
```

## Resources

- [Root README](../README.md) — Full architecture + Quick Start
- [CLI README](../packages/cli/README.md) — All commands + programmatic API
- [Plugin README](../packages/plugin/README.md) — How to load + use the plugin
- [Full Workflow](references/WORKFLOW.md)
- [Command Reference](references/COMMANDS.md)
- [Supported Patterns](references/SUPPORTED.md)
