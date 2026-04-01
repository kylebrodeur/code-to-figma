# Testing & NPM Publish Checklist

## Status

- **Package:** `@kylebrodeur/code-to-figma` — version `0.1.1` **published to npm** ✅
- **Test runner:** Vitest — **100 tests passing** (94 unit + 6 integration)
- **Lint/format:** Biome
- **Security:** esbuild override applied, `pnpm audit` clean

---

## Part 1 — Testing Tasks

✅ All tests implemented and passing (100 tests — 94 unit + 6 integration, commit `d7a271d`).

---

### 1.1 Adapter Unit Tests ✅

**File:** `packages/cli/src/adapters/__tests__/adapters.test.ts`

| Test | What to verify |
|---|---|
| `tailwindV3Adapter.resolveColor("bg-blue-500", config)` | returns `{r:0.231, g:0.510, b:0.965, a:1}` (exact shade) |
| `tailwindV3Adapter.resolveColor("text-red-600", config)` | returns red RGBA |
| `tailwindV3Adapter.resolveColor("hover:bg-blue-500", config)` | not called with modifiers (parser strips) |
| `tailwindV3Adapter.resolveFontSize("text-sm", config)` | returns `14` |
| `tailwindV3Adapter.resolveFontSize("text-xl", config)` | returns `20` |
| `tailwindV3Adapter.resolveFontWeight("font-bold", config)` | returns `700` |
| `tailwindV3Adapter.resolveFontWeight("font-semibold", config)` | returns `600` |
| `tailwindV4Adapter.resolveColor("bg-(--color-primary)", config)` | resolves hex from `config.tokenMapping` when value is `#hex`; neutral placeholder otherwise |
| `tailwindV4Adapter.resolveColor("bg-blue-500", config)` | falls through to v3 |
| `shadcnAdapter.resolveColor("bg-primary", config)` | returns `{r:0.094, g:0.094, b:0.106, a:1}` |
| `shadcnAdapter.resolveColor("bg-destructive", config)` | returns destructive red RGBA |
| `shadcnAdapter.autoToken("bg-primary", config)` | returns `{name:"color/primary", type:"COLOR"}` |
| `shadcnAdapter.autoToken("text-muted-foreground", config)` | returns `{name:"color/muted-foreground", type:"COLOR"}` |
| `shadcnAdapter.autoToken("bg-blue-500", config)` | returns `null` (not a semantic token) |
| `getAdapter({styling:"tailwind"})` | returns tailwindV3Adapter |
| `getAdapter({styling:"tailwind-v4"})` | returns tailwindV4Adapter |
| `getAdapter({adapter:"shadcn"})` | returns shadcnAdapter (adapter field takes priority) |
| `getAdapter({})` | falls back to tailwindV3Adapter |

---

### 1.2 Parser Unit Tests ✅

**File:** `packages/cli/src/parser/__tests__/react-parser.test.ts`

| Test | What to verify |
|---|---|
| `stripModifiers("bg-blue-500")` | returns `"bg-blue-500"` |
| `stripModifiers("hover:bg-blue-500")` | returns `null` |
| `stripModifiers("dark:bg-blue-800")` | returns `null` |
| `stripModifiers("data-[state=open]:bg-red-500")` | returns `null` |
| `stripModifiers("bg-blue-500/50")` | returns `"bg-blue-500"` (opacity stripped) |
| `stripModifiers("focus-visible:ring-2")` | returns `null` |
| Basic component parse | `className="bg-blue-500 text-sm font-bold"` → correct styles |
| Conditional class ignored | `className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-800"` → fill = blue-500 only |
| data-* attribute ignored | `className="bg-blue-500 data-[active]:bg-red-500"` → fill = blue-500 only |
| Variant prop detection | `variant?: "primary" \| "secondary"` → `propUnionTypes.variant = ["primary","secondary"]` |
| CVA detection | `cva("base", { variants: { variant: { default: "...", destructive: "..." } } })` → `propUnionTypes.variant = ["default","destructive"]` |
| CVA cross-product | 3 variants × 3 sizes → 9 output variants |
| `tokenMapping` respected | class in `config.tokenMapping` → token in `tokens[]` |

---

### 1.3 Generator Unit Tests ✅

**File:** `packages/cli/src/generator/__tests__/figma-generator.test.ts`

| Test | What to verify |
|---|---|
| `generateFigmaStyles` with tailwind styles | correct RGBA fill, fontSize, fontWeight in output |
| `font-bold` fontWeight | output is `700`, not `NaN` or `400` |
| `text-sm` fontSize | output is `14` |
| Single-variant component | produces 1 variant frame |
| Multi-variant component | produces N variant frames with correct `name` and `properties` |
| `autoToken()` path | shadcn classes produce entries in `tokens[]` |
| `tokenMapping` path | explicit mapping produces entries in `tokens[]` |
| No duplicate tokens | `bg-primary` in multiple variants → single token entry |

---

### 1.4 CLI Integration Tests (scan command) ✅

**File:** `packages/cli/src/__tests__/integration.test.ts`

Spawns `cli.js scan` via `execa` against tmp fixture dirs, asserts on the generated `.figma.json` output.

| Scenario | Input | Expected output |
|---|---|---|
| Tailwind basic | `bg-blue-500 font-bold text-sm` | fill=blue, fontWeight=700, fontSize=14 |
| Modifier stripping | `bg-blue-500 hover:bg-blue-600 dark:bg-blue-800 data-[state=open]:bg-red-500` | fill=blue-500 only |
| shadcn auto-tokens | adapter="shadcn", `bg-primary text-muted-foreground` | `tokens[]` has 2 entries, no tokenMapping needed |
| CVA cross-product | `cva("base", { variants: { v: {a,b,c}, s: {sm,md,lg} } })` | 9 variants named `a/sm`, `a/md`, ... |
| Tailwind v4 CSS var | adapter="tailwind-v4", `bg-(--color-brand)` + `tokenMapping` | fill resolves via tokenMapping |

---

### 1.5 How to Run Tests

```bash
# All tests
cd packages/cli && pnpm test

# Watch mode
cd packages/cli && pnpm test --watch

# Single file
cd packages/cli && pnpm exec vitest run src/adapters/__tests__/adapters.test.ts

# Typecheck (run before publish)
cd packages/cli && pnpm typecheck
```

---

## Part 2 — NPM Publish Checklist

### Pre-Publish

| Step | Status | Action |
|---|---|---|
| LICENSE file exists | ✅ Done | MIT added to repo root |
| `package.json` `"license": "MIT"` | ✅ Done | already set |
| `"files"` field in package.json | ✅ Done | `["dist", "README.md", "LICENSE"]` |
| `"bin"` entries created | ✅ Done | `code-to-figma` + `c2f` → `dist/cli.js` |
| `dist/cli.js` has shebang + chmod +x | ✅ Done | `prepublishOnly` script handles it |
| `"main"` and `"exports"` set | ✅ Done | ESM-only, `.`, `./parser`, `./generator` |
| `"engines": { "node": ">=18.0.0" }` | ✅ Done | already set |
| `"repository"` with `directory` field | ✅ Done | points to `packages/cli` |
| All tests pass | ✅ Done | 100 tests passing — 94 unit + 6 integration (`pnpm test`) |
| `pnpm build` succeeds | ✅ Done | passes, 0 errors |
| `pnpm typecheck` passes | ✅ Done | no errors |
| README is accurate | ✅ Done | up to date |
| GitHub repo is public | ✅ Done | repo is public at github.com/kylebrodeur/code-to-figma |
| npm account authenticated | ✅ Done | published successfully |
| npm org scope `@kylebrodeur` available | ✅ Done | `@kylebrodeur/code-to-figma@0.1.0` is live |
| CHANGELOG or release notes | ✅ Done | `CHANGELOG.md` added to repo root |

---

### Publish Steps

```bash
# 1. Make sure you're on main and clean
cd /home/kylebrodeur/projects/code-to-figma
git status  # must be clean

# 2. Build
cd packages/cli && pnpm build

# 3. Verify package contents before publish
npm pack --dry-run
# Should list: dist/, README.md, LICENSE

# 4. Authenticate (if not already)
npm login

# 5. Publish
# If @kylebrodeur is a personal npm scope (free):
npm publish --access public

# Or from package root using pnpm:
pnpm --filter @kylebrodeur/code-to-figma publish --access public
```

---

### Version Strategy

| Release type | When | Command |
|---|---|---|
| `0.1.x` patch | bug fixes | `npm version patch` |
| `0.2.0` minor | new adapter, new command | `npm version minor` |
| `1.0.0` major | stable API, plugin + CLI both tested | `npm version major` |

Current: `0.1.0` — treat as **alpha**. Use `--tag alpha` on publish if you want to keep `latest` clean for a stable release:

```bash
npm publish --access public --tag alpha
```

---

### Post-Publish Validation

```bash
# Verify it exists on npm
npm view @kylebrodeur/code-to-figma

# Test install in a clean dir
mkdir /tmp/test-install && cd /tmp/test-install
npm init -y
npm install @kylebrodeur/code-to-figma
npx code-to-figma --version
npx code-to-figma init
```

---

## Blocking Items Summary

| Priority | Item |
|---|---|
| ✅ Done | Unit tests (94 passing across adapters, parser, generator) |
| ✅ Done | Integration tests (5 scenarios via execa subprocess) |
| ✅ Done | GitHub repo public |
| ✅ Done | npm published — `@kylebrodeur/code-to-figma@0.1.0` live |
| ✅ Done | CHANGELOG.md added |
| ✅ Done | GitHub Actions CI (build + test on push) |
| ✅ Done | Bump to `0.1.1` — keywords/homepage now live on npm |
| 🟡 Next | Write integration tests for v0.2 features (plugin-output command, watch mode) |
