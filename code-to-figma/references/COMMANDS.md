# Command Reference

Complete CLI reference for `@kylebrodeur/code-to-figma`.

## Global Options

```
-v, --version    Show version number
-h, --help       Show help
```

## Commands

### `init`

Create configuration file.

```bash
code-to-figma init [options]
```

**Options:**
- `-f, --force` — Overwrite existing config

**Creates:** `.code-to-figma.json`

**Example:**
```bash
code-to-figma init
# Creates .code-to-figma.json with defaults
```

---

### `scan`

Parse React components and generate Figma JSON.

```bash
code-to-figma scan <filePattern> [options]
```

**Arguments:**
- `filePattern` — Glob pattern or file path (e.g., `Button.tsx` or `**/*.tsx`)

**Options:**
- `-o, --output <dir>` — Output directory (default: `.figma`)
- `-w, --watch` — Watch for changes
- `-t, --tailwind-config <path>` — Custom Tailwind config path
- `-v, --validate` — Validate generated JSON
- `--resolve-tailwind` — Resolve Tailwind classes to values

**Examples:**
```bash
# Single file
code-to-figma scan src/components/Button.tsx

# Glob pattern
code-to-figma scan "src/components/**/*.tsx"

# With watch mode
code-to-figma scan Button.tsx --watch

# Custom output
code-to-figma scan Button.tsx -o ./design-system/figma
```

---

### `plugin-output`

Generate plugin-compatible bundle from scanned files.

```bash
code-to-figma plugin-output [options]
```

**Options:**
- `-i, --input <dir>` — Input directory with .figma.json files (default: `.figma`)
- `-o, --output <file>` — Output file (default: `plugin-data.json`)

**Examples:**
```bash
# Default
code-to-figma plugin-output
# Reads .figma/*.figma.json → plugin-data.json

# Custom paths
code-to-figma plugin-output -i ./design-system/.figma -o ./output/bundle.json
```

---

### `read`

Read components and styles from a Figma file via REST API (read-only).

```bash
code-to-figma read [options]
```

**Options:**
- `--file-key <key>` — Figma file key (required)
- `--node-id <id>` — Specific node ID to read
- `-o, --output <file>` — Write output to file

**Configuration:**
- `figmaAccessToken` in `.code-to-figma.json` or `FIGMA_ACCESS_TOKEN` env

**Examples:**
```bash
# Read file summary
code-to-figma read --file-key ABC123

# Read specific node
code-to-figma read --file-key ABC123 --node-id 42:123

# Save to file
code-to-figma read --file-key ABC123 -o figma-data.json
```

---

### `watch`

Watch files and auto-regenerate on changes.

```bash
code-to-figma watch <filePattern> [options]
```

**Arguments:**
- `filePattern` — Glob to watch

**Options:**
- Same as `scan`

**Example:**
```bash
code-to-figma watch "src/components/**/*.tsx" -o .figma
```

---

## Configuration File

`.code-to-figma.json`:

```json
{
  "figmaFileKey": "ABC123",
  "componentGlob": "src/components/**/*.tsx",
  "outputDir": ".figma",
  "framework": "react",
  "styling": "tailwind",
  "tailwindConfig": "./tailwind.config.ts",
  "tokenMapping": {
    "--color-primary": "primary/500",
    "--space-4": "spacing/4"
  },
  "parserOptions": {
    "extractVariantsFromProps": ["variant", "size", "color"],
    "resolveTailwind": true,
    "includeJsxStructure": false
  }
}
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Parse error |
| 3 | Config error |
| 4 | Network error |
