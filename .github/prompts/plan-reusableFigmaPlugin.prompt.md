# Plan: Reusable Figma Plugin from BSS Reference

The BSS plugin works — it has 1482 lines of proven Figma API code, primitive builders (`fr()`, `rct()`, `tx()`, `hrow()`, `vcol()`), gradient factories, grid overlays, and a clean message protocol. But it's BSS-specific: hardcoded tokens, hardcoded content, hardcoded sections. The goal is to build `packages/plugin/` as a **generic, data-driven plugin** that consumes `.figma.json` from the CLI.

## Steps

### Phase 1: Plugin Foundation ✅ COMPLETE
1. ✅ Create `packages/plugin/` — `manifest.json`, `src/code.ts`, `src/ui.html`, `package.json`, `esbuild.config.mjs`
2. ✅ Extract reusable primitives from BSS `code.js`: color helpers (`hex`, `fill`, `hexA`), frame/rect/text factories (`fr`, `rct`, `tx`), layout builders (`hrow`, `vcol`), gradient factories, `applyGrid`, `restackOrdered`, font loading
3. ✅ Build the JSON consumer — `code.ts` reads `FigmaJsonOutput` and maps variants → component frames, styles → auto-layout/fills/typography

### Phase 2: UI & Message Protocol ✅ COMPLETE
4. ✅ Build `ui.html` — BSS warm dark theme, collapsible import panel, file picker/paste JSON, per-component rows with Build/X inline buttons
5. ✅ Message protocol: `IMPORT_JSON`, `BUILD_COMPONENT`, `REMOVE_COMPONENT`, `REMOVE_COMPONENTS`, `STATUS`/`DONE`/`ERROR`
   - Extended with `REMOVE_COMPONENTS` (array) for bulk removal

> Commits: `feat(plugin): add packages/plugin Phase 1 foundation`, `feat(plugin): adopt BSS checkbox-per-component UX pattern`

### Phase 3: CLI Bridge ✅ COMPLETE
6. ✅ Create `packages/cli/src/commands/plugin-output.ts` — reads `.figma.json` files from input dir, bundles into `plugin-data.json`
7. ✅ Wire up properly in `cli.ts` (replaced stub `console.log` action with `pluginOutput()` call)
8. ✅ Export `pluginOutput` from `packages/cli/src/index.ts`

> Commit: `feat(cli): implement plugin-output command`

### Phase 4: Integration & Testing ✅ COMPLETE
9. ✅ End-to-end: `scan` → `plugin-output` → verified pipeline with real Button component (3 variants: primary/secondary/destructive from TypeScript union types)
10. ✅ Parser fixes: variants now read from `TSInterfaceDeclaration` / `TSTypeAliasDeclaration` instead of hardcoded names; `fontSize` always emits a number (never `"AUTO"`)
11. ✅ Plugin fix: defensive `typeof` check on `fontSize` before passing to `createText()`
12. ✅ Docs: root README, CLI README, plugin README (created), SKILL.md updated to v0.2.0

> Commits: `fix(parser): read variant names from TypeScript union types; fix fontSize AUTO bug`, `docs: production-ready READMEs + SKILL.md v0.2.0`

---

## Status: ALL PHASES COMPLETE ✅

The full pipeline is functional and documented:
- `code-to-figma scan` → accurate `.figma.json` (uses TypeScript types for variants)
- `code-to-figma plugin-output` → bundled `plugin-data.json`
- Plugin loads in Figma Desktop, renders component sets with variant frames
- All packages typecheck clean, `pnpm build` succeeds across monorepo

## Relevant Files

### Source (BSS reference — READ ONLY)
- `../bss-figma-project/plugin/code.js` — 1482 lines, all proven Figma API patterns
- `../bss-figma-project/plugin/ui.html` — working UI panel
- `../bss-figma-project/plugin/manifest.json` — manifest format
- `../bss-figma-project/plugin/esbuild.config.mjs` — build config
- `../bss-figma-project/AGENT_HANDOFF.md` — engine constraints, known issues, patterns

### Target (code-to-figma — MODIFY)
- `packages/plugin/` — new directory (create)
- `packages/cli/src/commands/plugin-output.ts` — new file (create)
- `packages/cli/src/cli.ts` — update stub `plugin-output` command
- `packages/cli/src/generator/figma-generator.ts` — `FigmaJsonOutput` is the contract between CLI and plugin

## Verification
1. `pnpm build` succeeds (both cli and plugin)
2. `code-to-figma scan some-component.tsx` produces valid `.figma.json`
3. `code-to-figma plugin-output -i .figma -o plugin-data.json` bundles correctly
4. Plugin loads in Figma Desktop without runtime errors
5. Plugin renders a basic component frame from JSON input
6. No ES6+ syntax violations in compiled `code.js` (Figma's old engine)

## Decisions
- `FigmaJsonOutput` is the contract — plugin consumes it, CLI produces it
- Tokens come from JSON, not hardcoded in plugin
- Write `code.ts` in TypeScript, compile with esbuild targeting ES2017
- Fonts loaded dynamically from JSON with Inter fallback
- BSS plugin primitives are extracted and generalized, no BSS-specific code in the new plugin
- `sync` (REST API) stays as a stub — plugin path is the practical route
- Plugin does NOT connect to Figma REST API — it's a local plugin only

## Critical Figma Engine Constraint (Old JS)
These patterns throw `Syntax error: Unexpected token` in Figma's sandbox:

| ❌ Forbidden | ✅ Use Instead |
|---|---|
| Object spread `{...obj}` | `hexA(h,a)` helper returns `{r,g,b,a}` manually |
| Default params `function foo(x=val)` | `if(x===undefined) x=val` |
| `const`/`let` at file top | `var` |
| Arrow functions in filters at top-level | `function(n){...}` |
| Template literals with special chars | Plain string concat |

## Further Considerations — Resolved

### 1. Figma Variable Creation ⟶ Phase 5
`tokens: string[]` currently holds Figma path names only (e.g. `"brand/primary"`) — populated when `tokenMapping` is configured. The Figma Variables API requires actual values (`{r,g,b,a}`, `number`, `string`). Creating variables from names alone would produce empty, useless entries.

**To implement properly requires a contract change:**
1. CLI: extend `tokens` from `string[]` to `{ name: string; value: string | number | { r:number; g:number; b:number; a:number }; type: 'COLOR' | 'FLOAT' | 'STRING' }[]`
2. CLI: resolve Tailwind color classes to `{r,g,b,a}` in `extractTokenNames()`
3. Plugin: create a `VariableCollection` per component with one variable per token entry

Deferred to **Phase 5**. No code change now — tokens remain informational.

### 2. Component Set Handling ✅ Fixed
Bug fixed: `buildComponent()` was branching on `data.type === 'COMPONENT_SET' && data.variants.length > 1`, causing a single-variant COMPONENT_SET to be rendered as a bare frame (losing the wrapper). Corrected to `data.type === 'COMPONENT_SET'`.

### 3. Font Fallback ✅ Already Done
`loadFonts()` pre-loads families with silent try/catch per font. `buildVariantFrame()` has a try/catch around `createText()` that retries with Inter/Regular if the requested font isn't installed. No changes needed.

---

## Phase 5: Figma Variable Collections (Future)
- Extend `FigmaJsonOutput.tokens` to `TokenEntry[]` with `{ name, value, type }`
- CLI: resolve Tailwind color classes → `{r,g,b,a}` when computing tokens
- Plugin: `createVariableCollection(data.name)` + one variable per token entry
- Only run when `data.tokens.length > 0`
