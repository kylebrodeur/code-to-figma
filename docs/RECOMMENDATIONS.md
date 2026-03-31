# Code-to-Figma: Build vs Use Recommendations

## What NOT to Build

### ❌ Full React Parser
**Why:** React components are Turing-complete. Parsing all patterns (hooks, conditionals, dynamic classes) is extremely complex.

**Instead:** Use Babel AST with targeted extraction (already prototyped in `src/parser/`)

### ❌ Tailwind Class Parser From Scratch
**Why:** Tailwind has complex rules (arbitrary values, plugins, themes)

**Instead:** 
- Use `tailwindcss` itself via PostCSS
- Or use Intellisense: `tailwindcss-language-service`
- Or scrape computed styles via browser automation

### ❌ Full CSS Parser
**Why:** CSS parsing is notoriously complex

**Instead:** Use `postcss` or `lightningcss` (already battle-tested)

---

## What TO Use (Existing Libraries)

### 1. React Component Extraction
```bash
npm install @babel/parser @babel/traverse @babel/types
```

**Use for:** Finding components, props, JSX structure
**Don't use for:** Runtime behavior, hook logic

### 2. Tailwind Resolution  
```bash
npm install tailwindcss postcss
```

**Strategy:** 
```typescript
// Generate a temporary HTML file with component classes
// Run it through Tailwind CLI
// Extract computed CSS
const computed = await postcss([tailwind()]).process(html, { from: undefined });
```

### 3. CSS Parsing
```bash
npm install postcss
```

**Use PostCSS to extract:**
- Colors: `background-color`, `color`
- Spacing: `padding`, `margin`, `gap`
- Typography: `font-size`, `font-weight`
- Layout: `display`, `flex-direction`

### 4. Figma Node Generation
```bash
npm install figma-api  # REST API client
```

**Or use the plugin approach** (no dependencies)

---

## Recommended Architecture (Simplified)

```
┌─────────────────────────────────────────────────────────────┐
│  React Component File                                        │
│  (Button.tsx)                                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 1: Babel AST Extraction                               │
│  - Find component name                                       │
│  - Extract props                                             │
│  - Get JSX structure                                         │
│  - Extract className strings                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 2: CSS Resolution                                     │
│  Option A: Tailwind                                          │
│  - Run through tailcsscss JIT                                │
│  - Extract computed styles                                   │
│                                                            │
│  Option B: CSS Modules / Scoped                              │
│  - Extract from .css file via PostCSS                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 3: Map to Figma JSON                                  │
│  - Convert px → number                                       │
│  - Convert hex → RGB                                         │
│  - Infer auto-layout properties                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 4: Plugin Consumption                                 │
│  - Read JSON in Figma plugin                                 │
│  - Create frames with plugin API                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Minimal Viable Product (MVP)

**Scope for first working version:**

1. **Parse:** Only functional components with simple props
2. **Styles:** Only Tailwind utility classes (no arbitrary values)
3. **Elements:** Only `div`, `span`, `button`, `input`
4. **Layout:** Only `flex`, `flex-col`, `gap-*`, `p-*`
5. **Visual:** Only `bg-*`, `text-*`, `rounded-*`

**Out of scope initially:**
- Dynamic class names: `className={isActive ? 'bg-blue-500' : 'bg-gray-500'}`
- CSS-in-JS: `styled-components`, `emotion`
- Complex layouts: CSS Grid, absolute positioning
- Media queries / responsive variants

---

## Alternative: No-Parser Approach

If building a parser is too complex, consider this alternative:

### Browser-Based Extraction

```typescript
// Use Playwright or Puppeteer to render component
// Extract computed styles via browser

const browser = await chromium.launch();
const page = await browser.newPage();

// Inject component
await page.setContent(`
  <script src="https://cdn.tailwindcss.com"></script>
  <div id="root"></div>
  <script>
    // Render React component to #root
  </script>
`);

// Extract computed styles
const computed = await page.evaluate(() => {
  const el = document.querySelector('#root > *');
  return window.getComputedStyle(el);
});

// Map to Figma
const figmaNode = {
  fills: [{ color: computed.backgroundColor }],
  padding: computed.padding,
  // ...
};
```

**Pros:** Handles any CSS, any framework
**Cons:** Requires browser, slower, no prop variants

---

## Decision Matrix

| Approach | Effort | Flexibility | Maintainability | Recommendation |
|----------|--------|-------------|-----------------|----------------|
| Full custom parser | High | High | Low | ❌ Don't |
| Babel + PostCSS | Medium | Medium | Medium | ✅ Yes |
| Browser automation | Medium | Low | High | ⚡ Alternative |
| Use existing OSS | Low | Low | High | ❌ None exists |

---

## Recommended Implementation

**Go with: Babel + PostCSS approach**

It's the sweet spot of:
- Not reinventing parsers (use Babel/PostCSS)
- Feasible for MVP
- Extensible for future needs
- Matches what I prototyped in `src/parser/react-parser.ts`

**Next steps:**
1. Simplify `react-parser.ts` to use PostCSS for Tailwind resolution
2. Remove complex JSX tree building (not needed for Figma)
3. Focus on extracting variants from props
4. Test with 3-5 real components before expanding scope
