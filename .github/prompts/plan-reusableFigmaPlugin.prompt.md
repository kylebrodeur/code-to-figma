# Plan: Reusable Figma Plugin from BSS Reference

The BSS plugin works — it has 1482 lines of proven Figma API code, primitive builders (`fr()`, `rct()`, `tx()`, `hrow()`, `vcol()`), gradient factories, grid overlays, and a clean message protocol. But it's BSS-specific: hardcoded tokens, hardcoded content, hardcoded sections. The goal is to build `packages/plugin/` as a **generic, data-driven plugin** that consumes `.figma.json` from the CLI.

## Steps

### Phase 1: Plugin Foundation
1. Create `packages/plugin/` — `manifest.json`, `src/code.ts`, `src/ui.html`, `package.json`, `esbuild.config.mjs`
2. Extract reusable primitives from BSS `code.js`: color helpers (`hex`, `fill`, `hexA`), frame/rect/text factories (`fr`, `rct`, `tx`), layout builders (`hrow`, `vcol`), gradient factories, `applyGrid`, `restackOrdered`, font loading
3. Build the JSON consumer — `code.ts` reads `FigmaJsonOutput` (the interface already defined in `packages/cli/src/generator/figma-generator.ts`) and maps variants → component frames, styles → auto-layout/fills/typography, tokens → Figma variables

### Phase 2: UI & Message Protocol
4. Build `ui.html` — file picker/paste JSON, preview, build/remove buttons
5. Message protocol: `IMPORT_JSON`, `BUILD_COMPONENT`, `REMOVE_COMPONENT`, `STATUS`/`DONE`/`ERROR`

### Phase 3: CLI Bridge
6. Create `packages/cli/src/commands/plugin-output.ts` — reads `.figma.json` files, bundles into `plugin-data.json` *(currently a stub action in `packages/cli/src/cli.ts`)*
7. Wire up properly in `cli.ts`

### Phase 4: Integration & Testing
8. End-to-end: `scan` → `plugin-output` → load in Figma → verify rendered frame
9. Test with BSS theme components (badge, button, card from `bss-figma-project/plugin/theme/components/ui/`)
10. Update docs (README, SKILL.md)

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

## Further Considerations
1. **Figma variable creation** — Should the plugin create variable collections from the `tokens` array? Recommend yes when tokens are non-empty.
2. **Component set handling** — `FigmaJsonOutput.type` already distinguishes `COMPONENT_SET` vs `COMPONENT`. Plugin should handle both — single frame for COMPONENT, variant set for COMPONENT_SET.
3. **Font fallback** — BSS hardcodes 3 families (`Bricolage Grotesque`, `Barlow`, `Martian Mono`). Generic plugin should try `loadFontAsync` from JSON font info, fall back to Inter if unavailable.
