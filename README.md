# Code to Figma

Sync React components to Figma designs. A CLI tool + Figma plugin for code-to-design workflows.

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
