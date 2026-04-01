# Changelog

All notable changes to `@kylebrodeur/code-to-figma` are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [0.1.0] — 2026-04-01

### Added
- Initial release of `@kylebrodeur/code-to-figma` CLI
- `scan` command — parse React components and generate Figma-compatible `.figma.json` files
- `init` command — scaffold `.code-to-figma.json` config
- `read` command — read component and style data from a Figma file via REST API
- `watch` command — run `scan` in watch mode on file changes
- `plugin-output` command — bundle `.figma.json` output for Figma plugin consumption
- **Adapter system** for style resolution:
  - `tailwind` / `tailwind-v3` — full Tailwind v3 color, font-size, and font-weight maps
  - `tailwind-v4` — CSS-variable utility syntax (`bg-(--token)`) with v3 fallthrough
  - `shadcn` / `shadcn-v4` — 25 semantic design tokens with `autoToken()` (no `tokenMapping` needed)
  - Registry aliases for `radix-ui`, `base-ui`, `headlessui`
- **Parser fixes:**
  - `stripModifiers()` — skips `hover:`, `dark:`, `data-[]:`, and all other conditional modifiers
  - Opacity suffix stripping (`bg-blue-500/50` → `bg-blue-500`)
  - CVA `cva()` detection — extracts variant cross-product from `class-variance-authority` calls
  - TypeScript union prop detection from `interface`/`type` declarations
- **Generator fixes:**
  - `font-bold` → fontWeight `700` (was NaN/400)
  - `autoToken()` path for shadcn — no explicit `tokenMapping` required
  - Deduplication of token entries across variants
- 99 automated tests: 57 adapter, 20 parser, 17 generator, 5 integration (Vitest)
- MIT license

[0.1.0]: https://github.com/kylebrodeur/code-to-figma/releases/tag/v0.1.0
