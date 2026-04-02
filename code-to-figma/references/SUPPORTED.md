# Supported Patterns

What `code-to-figma` can and cannot parse.

## ✅ Fully Supported

### Static Tailwind Classes

```tsx
// ✅ Works perfectly
function Button() {
  return (
    <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
      Click me
    </button>
  );
}
```

### Template Literal Strings

```tsx
// ✅ Concatenation of static strings
function Button({ variant }: { variant: 'primary' | 'secondary' }) {
  const base = "rounded-md font-medium transition-colors";
  const variants = {
    primary: "bg-blue-500 text-white",
    secondary: "bg-gray-200 text-gray-900"
  };
  
  return (
    <button className={`${base} ${variants[variant]}`}>
      Click
    </button>
  );
}
```

### Variant Props with Unions

```tsx
// ✅ Detects all variants
interface Props {
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'sm' | 'md' | 'lg';
}

export function Button({ variant, size }: Props) {
  // Creates COMPONENT_SET with 9 variants (3×3)
}
```

### cn() / clsx() — Static Args

```tsx
// ✅ Static string arguments are fully extracted
import { cn } from "@/lib/utils";

function Button({ variant }: { variant: 'primary' | 'secondary' }) {
  return (
    <button className={cn(
      "px-4 py-2 rounded-md font-medium",
      variant === 'primary' ? 'bg-blue-500 text-white' : 'bg-gray-200'
    )}>
      Click
    </button>
  );
}
// ✅ The leading static string is extracted
// ✅ Both branches of the ternary are extracted
// ✅ Logical && args: cn('base', loading && 'opacity-50') — both sides extracted
```

Supported utility names: `cn`, `clsx`, `classnames`, `cx`, `twMerge`.

### Inline Styles

```tsx
// ✅ Supported style properties extracted directly from style={{}}
function Button() {
  return (
    <button style={{
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      fontSize: '16px',
      fontWeight: 600,
      borderRadius: '8px',
    }}>
      Click me
    </button>
  );
}
```

Supported properties: `backgroundColor`, `color`, `fontSize`, `fontWeight`, `borderRadius`. Hex values are resolved to RGBA.

### CSS Modules

```tsx
// ✅ Supported: default import + member expression className
import styles from './Button.module.css';

export function Button() {
  return <button className={styles.button}>Click me</button>;
}
```

```css
/* Button.module.css */
.button {
  background-color: #3b82f6;
  color: #ffffff;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  gap: 8px;
}
```

The parser resolves the import path relative to the component file, reads the `.module.css` file with PostCSS, and extracts the CSS declarations for the referenced class name.

**Supported CSS properties:** `background-color`, `background`, `color`, `border-radius`, `font-size`, `font-weight`, `font-family`, `padding`, `gap`, `row-gap`, `column-gap`, `display`, `flex-direction`, `align-items`.

**Pseudo-selectors** (`:hover`, `:focus`, etc.) are ignored — only the base class declarations are used for Figma rendering.

**`composes`** directives are not followed (they expand at build time; use `tokenMapping` for shared values if needed).

**Bracket notation** also works: `className={styles['button-primary']}`.

**`cn(styles.a, styles.b)` merges** are fully resolved — all CSS Module refs in a `cn()`/`clsx()` call (including logical `&&` and conditional `? :` branches) are merged into the extracted styles. Any bare Tailwind strings in the same call are processed normally alongside them.

**`styles[variant]` dynamic access** is resolved by enumerating all union literal values declared in the component's TypeScript `interface` or `type`. For example `interface Props { variant: "primary" | "danger" }` with `className={styles[variant]}` extracts both `.primary` and `.danger` class styles.

### Figma Variable Collections via `tokenMapping`

```json
// .code-to-figma.json
{
  "tokenMapping": {
    "--color-primary": "brand/primary",
    "--space-4": "spacing/base"
  }
}
```

When a CSS class matches a `tokenMapping` key, its resolved value (`{r,g,b,a}` for colors, `number` for spacing) is included in `tokens[]` of the generated JSON. On import, the Figma plugin creates a **Variable Collection** named after the component with one Variable per token entry.

Token types resolved automatically:
| Source class | Figma Variable type | Example value |
|---|---|---|
| `bg-*`, `text-*` | `COLOR` | `{r:0.2, g:0.4, b:1, a:1}` |
| `gap-*`, `p-*` (spacing) | `FLOAT` | `16` (px, Tailwind ×4) |

> Components without a `tokenMapping` match still generate correctly — `tokens[]` is empty and no Variable Collection is created.

---

## ⚠️ Limited Support

### Dynamic Class Names (runtime numeric values)

```tsx
// ⚠️ Cannot resolve — padding is a plain number, not a union literal
function Button({ padding }: { padding: number }) {
  return <button className={`p-${padding}`}>...</button>;
}
```

**Fix:** Use a string union type instead, and the template will be enumerated:
```tsx
// ✅ Resolved — size is a string union
function Button({ size }: { size: 'sm' | 'md' | 'lg' }) {
  return <button className={`text-${size}`}>...</button>;
}
```

---

### Styled Components / Emotion (static)

```tsx
// ✅ Supported when the template literal has NO expressions
import styled from 'styled-components'; // or @emotion/styled

const Button = styled.button`
  background-color: #3b82f6;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
`;
// ✅ Also works with styled(Component)`...`
// ✅ Also works with styled.button.attrs({})`...` (attrs are ignored, base CSS extracted)
// ❌ Template literals with ${} expressions are skipped (runtime values can't be inferred)
```

### Direct JSX Ternary

```tsx
// ✅ Both branches are extracted
function Button({ active }: { active: boolean }) {
  return <button className={active ? 'bg-blue-500' : 'bg-gray-500'}>...</button>;
}
```

### Template Literal Interpolation (Union Prop)

```tsx
// ✅ Enumerates all union values when the interpolated identifier has a TS union type
interface Props { size: 'sm' | 'md' | 'lg'; }
function Button({ size }: Props) {
  return <button className={`text-${size} font-medium`}>...</button>;
}
// Extracts text-sm, text-md, text-lg — last write wins for the canonical Figma style
// Only single-identifier interpolations are enumerated.
// Purely-runtime dynamic values (`p-${padding}` where padding: number) still can't be resolved.
```

---

## ❌ Not Supported

### CSS-in-JS with Interpolations

```tsx
// ❌ Cannot resolve — expressions reference runtime values
const Button = styled.button`
  background: ${props => props.theme.primary};
  padding: ${props => props.size === 'lg' ? '12px' : '8px'};
`;
```

### Runtime Computed Styles

```tsx
// ❌ Cannot resolve — expressions reference runtime values that aren't statically typed
const Button = styled.button`
  background: ${props => props.theme.primary};
  padding: ${props => props.size === 'lg' ? '12px' : '8px'};
`;
```

### Media Queries / Responsive

```tsx
// ❌ Not supported
function Button() {
  return (
    <button className="bg-blue-500 md:bg-red-500 lg:bg-green-500">
      Responsive
    </button>
  );
}
```

**Workaround:** Create separate components for breakpoints or use Figma's variant properties for responsive states.

---

## Framework Support

| Framework | Status |
|-----------|--------|
| React (TSX) | ✅ Full |
| React (JSX) | ✅ Full |
| Next.js | ✅ Full |
| Vue | ❌ Not yet |
| Svelte | ❌ Not yet |
| Solid | ❌ Not yet |

## Styling Support

| Solution | Status | Notes |
|----------|--------|-------|
| Tailwind CSS | ✅ Full | v3, v4 supported |
| CSS Modules | ✅ Full | Reads `.module.css`, resolves colors/spacing/typography; `composes` resolved recursively |
| Styled Components | ✅ Partial | Static template literals (no `${}`) — expressions skipped |
| Emotion (`@emotion/styled`) | ✅ Partial | Same as styled-components — static template literals only |
| Linaria | ❌ No | Static extraction not yet implemented |
| CSS-in-JS with expressions | ❌ No | Runtime values can't be inferred |

---

## Requesting Support

To request support for a new pattern:

1. Check if it can be expressed with static analysis
2. File an issue: https://github.com/kylebrodeur/code-to-figma/issues
3. Include minimal reproduction example
