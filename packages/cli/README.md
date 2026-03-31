# Code-to-Figma

CLI tool and Figma plugin for syncing React components to Figma designs.

## Quick Start

```bash
# Install globally
npm install -g code-to-figma

# Or use npx
npx code-to-figma init
npx code-to-figma scan src/components/Button.tsx
npx code-to-figma sync --to-figma
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
5. Future updates: re-scan → sync
```

### Workflow B: Figma-First (with Code Connect)
```
1. Design in Figma
2. Code Connect → generates React
3. Implement in code
4. (Optional) Sync back for verification
```

## Commands

| Command | Purpose |
|---------|---------|
| `init` | Create `.code-to-figma.json` config |
| `scan <file>` | Parse component to `.figma.json` |
| `scan --watch` | Watch and re-scan on change |
| `sync` | Upload to Figma via REST API |
| `sync --dry-run` | Preview without uploading |
| `plugin` | Output plugin-compatible JSON |

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
  "parserOptions": {
    "extractVariantsFromProps": true,
    "detectClassNameUtilities": true
  }
}
```

## Integration with ux-collab

Add to your `.ux-collab.md`:

```yaml
syncToFigma:
  enabled: true
  cliCommand: "npx code-to-figma"
  outputDir: ".figma"
  autoSync: false
  
  # When to trigger
  onBuild: true
  onVerify: false
```

## Figma Plugin Setup

1. Install plugin from Figma Community: "Code to Figma"
2. Or development: Load `plugin/` folder in Figma Desktop
3. Plugin reads from JSON files or REST API

## License

MIT
