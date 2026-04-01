---
name: code-to-figma
description: "Sync React components to Figma designs. Use when: 'sync component to Figma', 'generate Figma from code', 'create design system in Figma', 'export React to Figma'. Parses React/TSX with Babel AST, resolves Tailwind classes, outputs Figma-compatible JSON. Requires Node.js 18+, optional Figma plugin for rendering."
compatibility: "Requires: Node.js 18+, @kylebrodeur/code-to-figma CLI (npm i -g or npx). Optional: Figma Desktop with plugin loaded from packages/plugin/manifest.json. Network: none for CLI, Figma REST API for read command only. Platforms: Agent Skills, Claude Code, GitHub Copilot."
license: MIT
metadata:
  author: kylebrodeur
  version: "0.2.0"
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

## Supported Patterns

| Pattern | Status | Example |
|---------|--------|---------|
| Static Tailwind | ✅ | `className="bg-blue-500 p-4"` |
| TypeScript literal union props | ✅ | `variant: 'primary' \| 'secondary'` |
| Arrow function + `React.FC<Props>` | ✅ | Standard function component |
| `interface Props` + `type Props` | ✅ | Types read for variant detection |
| Template literals (static parts) | ✅ | `` `${base} ${cls}` `` (base string extracted) |
| Figma Variable Collections | ✅ | `tokenMapping` in config → COLOR/FLOAT variables created on import |
| Dynamic `className` expressions | ⚠️ | `{isActive ? 'x' : 'y'}` not resolved |
| `clsx()` / `cn()` with conditions | ⚠️ | Limited to static args |
| CSS-in-JS (styled, emotion) | ❌ | Not supported |

See [references/SUPPORTED.md](references/SUPPORTED.md) for full spec.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Variants are wrong names | Ensure `interface Props { variant: 'a' \| 'b' }` syntax (literal unions, not `string`) |
| Empty fills in Figma | Add `tokenMapping` in config to resolve colors; plugin will also create Figma Variables per token |
| No Figma Variables created | Expected when `tokenMapping` is empty — add CSS-class-to-path entries in config |
| Plugin not in menu | Use Figma **Desktop** (not browser); load via **Plugins → Development → Import from manifest** |
| `fontSize` shows wrong | Fixed in v0.2 — was returning `"AUTO"` for non-numeric Tailwind classes |

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
