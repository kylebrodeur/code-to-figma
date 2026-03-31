---
name: code-to-figma
description: "Sync React components to Figma designs. Use when: 'sync component to Figma', 'generate Figma from code', 'create design system in Figma', 'export React to Figma'. Parses React/TSX with Babel AST, resolves Tailwind classes, outputs Figma-compatible JSON. Requires Node.js 18+, optional Figma plugin for rendering."
compatibility: "Requires: Node.js 18+, @kylebrodeur/code-to-figma CLI (npm i -g or npx). Optional: Figma plugin 'Code to Figma' installed. Network: none for CLI, Figma API only for sync command. Platforms: Agent Skills, Claude Code, GitHub Copilot."
license: MIT
metadata:
  author: kylebrodeur
  version: "0.1.0"
  repository: https://github.com/kylebrodeur/code-to-figma
  cli-package: "@kylebrodeur/code-to-figma"
  platforms:
    - agent-skills
    - claude-code
    - github-copilot
---

# Code-to-Figma Skill

Convert React components to Figma designs. Code-first workflow for design documentation.

## When to Use

- **Sync to Figma:** "Sync Button component to Figma"
- **Generate from code:** "Create Figma designs from my components"
- **Design system docs:** "Export component library to Figma"
- **Code-first workflow:** Build in code, then sync to Figma for review

## Quick Start

```bash
# Install CLI
npm install -g @kylebrodeur/code-to-figma

# Scan component
code-to-figma scan src/components/Button.tsx

# Generate for Figma plugin
code-to-figma plugin-output -i .figma -o plugin-data.json
```

Then in Figma: Plugins → Code to Figma → Import JSON

## Workflow Steps

1. **CODE** — Identify React component
2. **PARSE** — Extract with Babel AST
3. **RESOLVE** — Convert Tailwind → Figma values
4. **GENERATE** — Create .figma.json files
5. **SYNC** — Import via plugin or API

See [references/WORKFLOW.md](references/WORKFLOW.md) for detailed steps.

## Supported Patterns

| Pattern | Status | Example |
|---------|--------|---------|
| Static Tailwind | ✅ | `className="bg-blue-500 p-4"` |
| Variant props | ✅ | `variant: 'primary' \| 'secondary'` |
| Dynamic classes | ⚠️ | `className={isActive ? 'x' : 'y'}` |
| CSS-in-JS | ❌ | `styled.button`...

See [references/SUPPORTED.md](references/SUPPORTED.md) for full spec.

## Commands

| Command | Purpose |
|---------|---------|
| `init` | Create config |
| `scan <file>` | Parse component |
| `scan --watch` | Watch mode |
| `plugin-output` | Generate plugin bundle |

See [references/COMMANDS.md](references/COMMANDS.md) for full reference.

## Troubleshooting

| Error | Solution |
|-------|----------|
| "No variants detected" | Use literal unions: `'a' \| 'b'` not `string` |
| "Tailwind not resolved" | Check config path: `--tailwind-config ./tailwind.config.ts` |
| "Plugin error" | Validate JSON: `code-to-figma scan --validate` |

## Integration

### With ux-collab

Add to `.ux-collab.md`:
```yaml
syncToFigma:
  enabled: true
  cliCommand: "npx @kylebrodeur/code-to-figma"
  onBuild: true
```

### Standalone

Use directly in any project:
```bash
npx @kylebrodeur/code-to-figma scan components/**/*.tsx
```

## Resources

- [Full Workflow](references/WORKFLOW.md)
- [Command Reference](references/COMMANDS.md)
- [Supported Patterns](references/SUPPORTED.md)
- [CLI Documentation](https://github.com/kylebrodeur/code-to-figma/tree/main/packages/cli)
- [Figma Plugin API](https://www.figma.com/plugin-docs/)

## Platform Compatibility

This skill works across multiple agent platforms:

| Platform | Config Location | Usage |
|----------|----------------|-------|
| Agent Skills | Install via `npx skills add` | Standard skill loading |
| Claude Code | `.claude-plugin/plugin.json` | Auto-loaded in Claude Code |
| GitHub Copilot | `.github/copilot.json` | Referenced in copilot agents |

### Claude Code

The skill is automatically available when this repository is loaded in Claude Code via `.claude-plugin/plugin.json`.

### GitHub Copilot

Add to your Copilot configuration:
```json
{
  "agents": [{
    "name": "code-to-figma",
    "skills": ["skill/SKILL.md"]
  }]
}
```

### Agent Skills CLI

Install globally:
```bash
npx skills add kylebrodeur/code-to-figma@code-to-figma -g
```
