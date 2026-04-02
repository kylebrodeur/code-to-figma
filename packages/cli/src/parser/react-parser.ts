import { parse as babelParse } from "@babel/parser";
import traverseModule from "@babel/traverse";
const traverse = (traverseModule as any).default || traverseModule;
import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import postcss from "postcss";
import type { Config } from "../config.js";

export interface ParsedComponent {
  name: string;
  filePath: string;
  props: ComponentProp[];
  variants: Variant[];
  styles: ExtractedStyles;
  jsxStructure: JSXNode[];
}

export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
}

export interface Variant {
  name: string;
  propValues: Record<string, string>;
  styles: Record<string, string>;
}

export interface ExtractedStyles {
  layout: {
    display?: string;
    flexDirection?: string;
    gap?: string;
    padding?: string;
    alignItems?: string;
  };
  visual: {
    backgroundColor?: string;
    color?: string;
    borderRadius?: string;
    border?: string;
    boxShadow?: string;
  };
  typography: {
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
  };
}

export interface JSXNode {
  type: string;
  props: Record<string, any>;
  children: JSXNode[];
}

export async function parseComponent(
  filePath: string,
  config: Config
): Promise<ParsedComponent | null> {
  const code = readFileSync(filePath, "utf-8");
  
  // Parse with Babel
  const ast = babelParse(code, {
    sourceType: "module",
    plugins: [
      "jsx",
      "typescript",
      "decorators-legacy",
      "classProperties",
    ],
  });

  let componentName = "";
  const props: ComponentProp[] = [];
  const variants: Variant[] = [];
  let styles: ExtractedStyles = { layout: {}, visual: {}, typography: {} };
  const jsxStructure: JSXNode[] = [];
  const propUnionTypes: Record<string, string[]> = {};
  // Map from local binding name (e.g. "styles") → absolute path to .module.css
  const cssModuleImports = new Map<string, string>();
  // Deferred dynamic accesses: styles[variant] — resolved after traverse when propUnionTypes is populated
  const deferredDynamicAccesses: { cssFile: string; propName: string }[] = [];

  // Traverse AST to find component
  traverse(ast, {
    // Track CSS Module imports: `import styles from './Button.module.css'`
    ImportDeclaration(path: NodePath<t.ImportDeclaration>) {
      const src = path.node.source.value;
      if (!src.endsWith(".module.css") && !src.endsWith(".module.scss")) return;
      const absPath = resolve(dirname(filePath), src.replace(/\.module\.scss$/, ".module.css"));
      const defaultSpec = path.node.specifiers.find((s): s is t.ImportDefaultSpecifier =>
        t.isImportDefaultSpecifier(s)
      );
      if (defaultSpec) {
        cssModuleImports.set(defaultSpec.local.name, absPath);
      }
    },
    // Collect TypeScript interface/type union literals for variant detection
    TSInterfaceDeclaration(path: NodePath<t.TSInterfaceDeclaration>) {
      path.node.body.body.forEach((member) => {
        if (
          t.isTSPropertySignature(member) &&
          t.isIdentifier(member.key) &&
          member.typeAnnotation
        ) {
          const vals = extractUnionLiterals(member.typeAnnotation.typeAnnotation);
          if (vals.length > 0) {
            propUnionTypes[member.key.name] = vals;
          }
        }
      });
    },

    TSTypeAliasDeclaration(path: NodePath<t.TSTypeAliasDeclaration>) {
      if (t.isTSTypeLiteral(path.node.typeAnnotation)) {
        path.node.typeAnnotation.members.forEach((member) => {
          if (
            t.isTSPropertySignature(member) &&
            t.isIdentifier(member.key) &&
            member.typeAnnotation
          ) {
            const vals = extractUnionLiterals(member.typeAnnotation.typeAnnotation);
            if (vals.length > 0) {
              propUnionTypes[member.key.name] = vals;
            }
          }
        });
      }
    },

    // Detect cva() calls (class-variance-authority) — used by shadcn v4 and
    // any component using CVA for variant management.
    // cva("base", { variants: { variant: { primary: "...", secondary: "..." }, size: { sm: "...", lg: "..." } } })
    CallExpression(path: NodePath<t.CallExpression>) {
      const callee = path.node.callee;
      const isCva =
        (t.isIdentifier(callee) && callee.name === "cva") ||
        (t.isMemberExpression(callee) && t.isIdentifier(callee.property) && callee.property.name === "cva");

      if (!isCva || path.node.arguments.length < 2) return;

      const optionsArg = path.node.arguments[1];
      if (!t.isObjectExpression(optionsArg)) return;

      const variantsProp = optionsArg.properties.find(
        (p) => t.isObjectProperty(p) && t.isIdentifier((p as t.ObjectProperty).key) &&
               ((p as t.ObjectProperty).key as t.Identifier).name === "variants"
      ) as t.ObjectProperty | undefined;

      if (!variantsProp || !t.isObjectExpression(variantsProp.value)) return;

      for (const group of variantsProp.value.properties) {
        if (!t.isObjectProperty(group) || !t.isIdentifier(group.key)) continue;
        if (!t.isObjectExpression(group.value)) continue;
        const propName = (group.key as t.Identifier).name;
        const vals = group.value.properties
          .filter((p): p is t.ObjectProperty => t.isObjectProperty(p) && t.isIdentifier(p.key))
          .map((p) => ((p.key as t.Identifier).name));
        if (vals.length > 0) {
          propUnionTypes[propName] = vals;
        }
      }
    },

    // styled.button`...` / styled(Button)`...` / styled.button.attrs({})`...`
    // Also handles @emotion/styled. Only processes template literals with no expressions.
    TaggedTemplateExpression(path: NodePath<t.TaggedTemplateExpression>) {
      if (!isStyledTag(path.node.tag)) return;
      const quasi = path.node.quasi;
      if (quasi.expressions.length > 0) return; // skip interpolated CSS
      const cssText = quasi.quasis[0]?.value.cooked ?? quasi.quasis[0]?.value.raw ?? "";
      if (cssText.trim()) parseStyledCssToStyles(cssText, styles);
    },

    // Find function/component declarations
    FunctionDeclaration(path: NodePath<t.FunctionDeclaration>) {
      if (isComponentFunction(path.node)) {
        componentName = path.node.id?.name || "Component";
        extractPropsFromFunction(path, props, config);
      }
    },
    
    // Find ArrowFunction components
    VariableDeclarator(path: NodePath<t.VariableDeclarator>) {
      if (
        t.isArrowFunctionExpression(path.node.init) &&
        t.isIdentifier(path.node.id) &&
        isComponentName(path.node.id.name)
      ) {
        componentName = path.node.id.name;
        extractPropsFromArrowFunction(path, props, config);
      }
    },

    // Extract className/tailwind usage
    JSXAttribute(path: NodePath<t.JSXAttribute>) {
      const attrName = t.isJSXIdentifier(path.node.name) ? path.node.name.name : "";
      if (attrName === "className") {
        const val = path.node.value;
        if (t.isJSXExpressionContainer(val)) {
          const expr = val.expression;
          if (t.isMemberExpression(expr) && t.isIdentifier(expr.object)) {
            const localName = expr.object.name;
            const cssFile = cssModuleImports.get(localName);
            if (cssFile) {
              if (!expr.computed) {
                // styles.button or styles['foo-bar'] — static key
                const key =
                  t.isIdentifier(expr.property) ? expr.property.name
                  : t.isStringLiteral(expr.property) ? expr.property.value
                  : null;
                if (key) {
                  parseCssModuleStyles(cssFile, key, styles);
                  return;
                }
              } else if (t.isIdentifier(expr.property)) {
                // styles[variant] — dynamic key, defer until propUnionTypes is populated
                deferredDynamicAccesses.push({ cssFile, propName: expr.property.name });
                return;
              }
            }
          }
          // cn(styles.button, styles.active, "tailwind") — extract all CSS Module refs,
          // then fall through so extractClasses() also picks up any bare string classes.
          if (t.isCallExpression(expr)) {
            const cssRefs = extractCssModuleCallRefs(expr, cssModuleImports, deferredDynamicAccesses);
            for (const { cssFile, key } of cssRefs) {
              parseCssModuleStyles(cssFile, key, styles);
            }
          }
          // Template literal with single identifier: className={`text-${size} font-bold`}
          if (t.isTemplateLiteral(expr) && expr.expressions.length === 1 && t.isIdentifier(expr.expressions[0])) {
            const ident = expr.expressions[0] as t.Identifier;
            if (propUnionTypes[ident.name]?.length > 0) {
              const prefix = expr.quasis[0].value.cooked ?? expr.quasis[0].value.raw;
              const suffix = expr.quasis[1]?.value.cooked ?? expr.quasis[1]?.value.raw ?? "";
              for (const v of propUnionTypes[ident.name]) {
                parseTailwindClasses(`${prefix}${v}${suffix}`.trim(), styles, config);
              }
              return;
            }
          }
        }
        const classes = extractClasses(path.node.value);
        parseTailwindClasses(classes, styles, config);
      } else if (attrName === "style") {
        extractInlineStyle(path.node.value, styles);
      }
    },

    // Build JSX structure tree
    JSXElement(path: NodePath<t.JSXElement>) {
      const node = buildJSXNode(path.node);
      if (node) jsxStructure.push(node);
    },
  });

  // Resolve deferred dynamic CSS Module accesses (styles[variant]) now that
  // propUnionTypes is fully populated by the traverse above.
  for (const { cssFile, propName } of deferredDynamicAccesses) {
    const values = propUnionTypes[propName] ?? [];
    for (const val of values) {
      parseCssModuleStyles(cssFile, val, styles);
    }
  }

  if (!componentName) return null;

  // Back-fill prop types from TypeScript union type annotations
  for (const prop of props) {
    if (propUnionTypes[prop.name]) {
      prop.type = propUnionTypes[prop.name].map((v) => `"${v}"`).join(" | ");
    }
  }

  // Extract variants from props
  if (config.parserOptions.extractVariantsFromProps) {
    extractVariants(props, variants, propUnionTypes);
  }

  return {
    name: componentName,
    filePath,
    props,
    variants,
    styles,
    jsxStructure,
  };
}

function isComponentFunction(node: t.FunctionDeclaration): boolean {
  return (
    node.id != null &&
    isComponentName(node.id.name)
  );
}

function isComponentName(name: string): boolean {
  // PascalCase check (heuristic)
  return /^[A-Z][a-zA-Z0-9]*$/.test(name) && 
    !/^(use|handle|on|get|set)[A-Z]/.test(name);
}

function extractPropsFromFunction(
  path: NodePath<t.FunctionDeclaration>,
  props: ComponentProp[],
  config: Config
): void {
  const params = path.node.params;
  if (params.length === 0) return;

  const propsParam = params[0];
  if (!t.isIdentifier(propsParam) && !t.isObjectPattern(propsParam)) return;

  // Try to find TypeScript interface/type definition
  const body = path.node.body;
  if (t.isBlockStatement(body)) {
    // Check for destructuring patterns
    if (t.isObjectPattern(propsParam)) {
      propsParam.properties.forEach((prop) => {
        if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
          props.push({
            name: prop.key.name,
            type: "unknown",
            required: !prop.value,
          });
        }
      });
    }
  }
}

function extractPropsFromArrowFunction(
  path: NodePath<t.VariableDeclarator>,
  props: ComponentProp[],
  config: Config
): void {
  if (!t.isArrowFunctionExpression(path.node.init)) return;
  
  const params = path.node.init.params;
  if (params.length === 0) return;

  const propsParam = params[0];
  if (t.isObjectPattern(propsParam)) {
    propsParam.properties.forEach((prop) => {
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
        props.push({
          name: prop.key.name,
          type: "unknown",
          required: false,
        });
      }
    });
  }
}

function extractClasses(
  value: t.JSXAttribute["value"]
): string {
  if (!value) return "";
  
  if (t.isStringLiteral(value)) {
    return value.value;
  }
  
  if (t.isJSXExpressionContainer(value) && t.isStringLiteral(value.expression)) {
    return value.expression.value;
  }
  
  // Handle template literals (most Tailwind cases)
  if (t.isJSXExpressionContainer(value) && t.isTemplateLiteral(value.expression)) {
    return value.expression.quasis.map((q) => q.value.raw).join(" ");
  }

  // Handle cn() / clsx() / classnames() call expressions
  if (t.isJSXExpressionContainer(value) && t.isCallExpression(value.expression)) {
    return extractClassesFromCall(value.expression);
  }

  // Handle direct ternary: className={isActive ? 'bg-blue-500' : 'bg-gray-500'}
  if (t.isJSXExpressionContainer(value) && t.isConditionalExpression(value.expression)) {
    const expr = value.expression;
    const parts: string[] = [];
    if (t.isStringLiteral(expr.consequent)) parts.push(expr.consequent.value);
    else if (t.isCallExpression(expr.consequent)) parts.push(extractClassesFromCall(expr.consequent));
    if (t.isStringLiteral(expr.alternate)) parts.push(expr.alternate.value);
    else if (t.isCallExpression(expr.alternate)) parts.push(extractClassesFromCall(expr.alternate));
    return parts.join(" ");
  }

  return "";
}

const CLASS_UTIL_NAMES = new Set(["cn", "clsx", "classnames", "cx", "twMerge", "tw"]);

function extractClassesFromCall(call: t.CallExpression): string {
  const callee = call.callee;
  const name =
    t.isIdentifier(callee) ? callee.name
    : t.isMemberExpression(callee) && t.isIdentifier(callee.property) ? callee.property.name
    : "";
  if (!CLASS_UTIL_NAMES.has(name)) return "";

  const parts: string[] = [];
  for (const arg of call.arguments) {
    if (t.isStringLiteral(arg)) {
      parts.push(arg.value);
    } else if (t.isTemplateLiteral(arg)) {
      parts.push(arg.quasis.map((q) => q.value.raw).join(" "));
    } else if (t.isCallExpression(arg)) {
      // Support nested cn/clsx calls
      const nested = extractClassesFromCall(arg);
      if (nested) parts.push(nested);
    } else if (t.isLogicalExpression(arg)) {
      // condition && 'class' — extract string from either side
      for (const side of [arg.left, arg.right]) {
        if (t.isStringLiteral(side)) parts.push(side.value);
        else if (t.isTemplateLiteral(side)) parts.push(side.quasis.map(q => q.value.raw).join(" "));
        else if (t.isCallExpression(side)) { const n = extractClassesFromCall(side); if (n) parts.push(n); }
      }
    } else if (t.isConditionalExpression(arg)) {
      // condition ? 'class-a' : 'class-b' — extract both branches
      for (const branch of [arg.consequent, arg.alternate]) {
        if (t.isStringLiteral(branch)) parts.push(branch.value);
        else if (t.isTemplateLiteral(branch)) parts.push(branch.quasis.map(q => q.value.raw).join(" "));
        else if (t.isCallExpression(branch)) { const n = extractClassesFromCall(branch); if (n) parts.push(n); }
      }
    }
  }
  return parts.join(" ");
}

function extractInlineStyle(
  value: t.JSXAttribute["value"],
  styles: ExtractedStyles
): void {
  if (!t.isJSXExpressionContainer(value)) return;
  const expr = value.expression;
  if (!t.isObjectExpression(expr)) return;

  for (const prop of expr.properties) {
    if (!t.isObjectProperty(prop) || !t.isIdentifier(prop.key)) continue;
    const key = prop.key.name;
    const strVal =
      t.isStringLiteral(prop.value) ? prop.value.value
      : t.isTemplateLiteral(prop.value) ? prop.value.quasis.map((q) => q.value.raw).join("")
      : null;
    if (strVal === null) continue;

    switch (key) {
      case "backgroundColor": styles.visual.backgroundColor = strVal; break;
      case "color":           styles.visual.color           = strVal; break;
      case "fontSize":        styles.typography.fontSize    = strVal; break;
      case "fontWeight":      styles.typography.fontWeight  = strVal; break;
      case "borderRadius":    styles.visual.borderRadius    = strVal; break;
    }
  }
}

/**
 * Parse a CSS Module file (`.module.css`) and extract the style properties
 * for a specific class name, applying them to `styles`.
 *
 * Supports: background-color / background, color, border-radius,
 *           font-size, font-weight, font-family, padding, gap, display.
 *
 * `composes` directives are resolved recursively (same-file and cross-file).
 */
function parseCssModuleStyles(
  cssFilePath: string,
  className: string,
  styles: ExtractedStyles,
  visited = new Set<string>()
): void {
  const visitKey = `${cssFilePath}::${className}`;
  if (visited.has(visitKey)) return;
  visited.add(visitKey);
  if (!existsSync(cssFilePath)) return;
  let cssText: string;
  try {
    cssText = readFileSync(cssFilePath, "utf-8");
  } catch {
    return;
  }

  let root: postcss.Root;
  try {
    root = postcss.parse(cssText);
  } catch {
    return;
  }

  root.walkRules((rule) => {
    // Match `.className`, `.className:hover { … }` (only the base class matters)
    const selector = rule.selector;
    const base = selector.split(/[:\s,[\(]+/)[0].trim();
    if (base !== `.${className}`) return;

    rule.walkDecls((decl) => {
      const prop = decl.prop.toLowerCase().trim();
      const val = decl.value.trim();

      switch (prop) {
        case "background-color":
        case "background":
          // Only store plain color values; skip gradients / none / transparent
          if (/^(#|rgb|hsl|oklch|lch)/.test(val) || /^[a-z]+$/.test(val)) {
            styles.visual.backgroundColor = val;
          }
          break;
        case "color":
          styles.visual.color = val;
          break;
        case "border-radius":
          styles.visual.borderRadius = val;
          break;
        case "font-size":
          styles.typography.fontSize = val;
          break;
        case "font-weight":
          styles.typography.fontWeight = val;
          break;
        case "font-family":
          styles.typography.fontFamily = val;
          break;
        case "padding":
        case "padding-block":
        case "padding-inline":
          styles.layout.padding = val;
          break;
        case "gap":
        case "row-gap":
        case "column-gap":
          styles.layout.gap = val;
          break;
        case "display":
          styles.layout.display = val;
          break;
        case "flex-direction":
          styles.layout.flexDirection = val;
          break;
        case "align-items":
          styles.layout.alignItems = val;
          break;
        case "composes": {
          // Formats: "base", "base from './other.css'", "a b from './shared.css'"
          const fromIdx = val.indexOf(" from ");
          let classNames: string[];
          let fromFile: string | null = null;
          if (fromIdx !== -1) {
            classNames = val.slice(0, fromIdx).trim().split(/\s+/);
            fromFile = val.slice(fromIdx + 6).trim().replace(/^['"`]|['"`]$/g, "");
          } else {
            classNames = val.trim().split(/\s+/);
          }
          const targetFile = fromFile ? resolve(dirname(cssFilePath), fromFile) : cssFilePath;
          for (const cn of classNames) {
            parseCssModuleStyles(targetFile, cn, styles, visited);
          }
          break;
        }
      }
    });
  });
}

/**
 * Recursively extract CSS Module class references from a cn()/clsx() call.
 * Returns static {cssFile, key} pairs for immediate resolution.
 * Pushes dynamic accesses (styles[varName]) into `deferred`.
 */
function extractCssModuleCallRefs(
  call: t.CallExpression,
  cssModuleImports: Map<string, string>,
  deferred: { cssFile: string; propName: string }[]
): { cssFile: string; key: string }[] {
  const results: { cssFile: string; key: string }[] = [];
  for (const arg of call.arguments) {
    if (t.isExpression(arg)) {
      results.push(...extractCssModuleRefsFromExpr(arg, cssModuleImports, deferred));
    }
  }
  return results;
}

/**
 * Recursively collect CSS Module MemberExpression refs from an expression.
 * Handles: styles.button, styles['foo'], styles[variant] (deferred),
 *          logical expressions (cond && styles.x),
 *          conditional expressions (cond ? styles.a : styles.b),
 *          and nested cn()/clsx() calls.
 */
function extractCssModuleRefsFromExpr(
  expr: t.Expression,
  cssModuleImports: Map<string, string>,
  deferred: { cssFile: string; propName: string }[]
): { cssFile: string; key: string }[] {
  const results: { cssFile: string; key: string }[] = [];
  if (t.isMemberExpression(expr) && t.isIdentifier(expr.object)) {
    const cssFile = cssModuleImports.get(expr.object.name);
    if (cssFile) {
      if (!expr.computed && t.isIdentifier(expr.property)) {
        results.push({ cssFile, key: expr.property.name });
      } else if (!expr.computed && t.isStringLiteral(expr.property)) {
        results.push({ cssFile, key: expr.property.value });
      } else if (expr.computed && t.isIdentifier(expr.property)) {
        deferred.push({ cssFile, propName: expr.property.name });
      }
    }
  } else if (t.isCallExpression(expr)) {
    results.push(...extractCssModuleCallRefs(expr, cssModuleImports, deferred));
  } else if (t.isLogicalExpression(expr)) {
    // condition && styles.button — only the right side is the candidate class
    results.push(...extractCssModuleRefsFromExpr(expr.right, cssModuleImports, deferred));
  } else if (t.isConditionalExpression(expr)) {
    // condition ? styles.a : styles.b — both branches
    results.push(...extractCssModuleRefsFromExpr(expr.consequent, cssModuleImports, deferred));
    results.push(...extractCssModuleRefsFromExpr(expr.alternate, cssModuleImports, deferred));
  }
  return results;
}

function parseTailwindClasses(
  classes: string,
  styles: ExtractedStyles,
  config: Config
): void {
  if (!config.parserOptions.detectClassNameUtilities) return;

  const classList = classes.split(/\s+/);
  
  for (const rawCls of classList) {
    const cls = stripModifiers(rawCls);
    if (cls === null) continue; // e.g. dark: classes are skipped

    // Layout
    if (cls === "flex") styles.layout.display = "flex";
    if (cls === "grid") styles.layout.display = "grid";
    if (cls.startsWith("flex-")) styles.layout.flexDirection = cls.replace("flex-", "");
    if (cls.startsWith("gap-")) styles.layout.gap = cls.replace("gap-", "");
    if (cls.startsWith("p-") || cls.startsWith("px-") || cls.startsWith("py-")) {
      styles.layout.padding = cls;
    }
    if (cls.startsWith("items-")) styles.layout.alignItems = cls.replace("items-", "");
    
    // Visual
    if (cls.startsWith("bg-")) styles.visual.backgroundColor = cls;
    if (cls.startsWith("text-") && !cls.startsWith("text-xs") && !cls.startsWith("text-sm") &&
        !cls.startsWith("text-base") && !cls.startsWith("text-lg") && !cls.startsWith("text-xl")) {
      styles.visual.color = cls;
    }
    if (cls.startsWith("rounded-")) styles.visual.borderRadius = cls;
    
    // Typography
    if (cls.startsWith("text-")) styles.typography.fontSize = cls;
    if (cls.startsWith("font-")) styles.typography.fontWeight = cls;
  }
}

/**
 * Strip Tailwind modifier prefixes from a class.
 *
 * Returns null (skip class entirely) for any class with a conditional modifier:
 * hover:, focus:, dark:, sm:, md:, data-[state=open]:, group-hover:, etc.
 * Only pure unconditional utility classes (no colons outside brackets) are
 * used as the canonical style for Figma rendering.
 *
 * Strips opacity modifier suffix: bg-blue-500/50 → bg-blue-500
 *
 * @internal Exported for unit testing only.
 */
export function stripModifiers(cls: string): string | null {
  // Detect any colon outside square brackets (modifier prefix)
  let depth = 0;
  for (let i = 0; i < cls.length; i++) {
    const ch = cls[i];
    if (ch === "[") depth++;
    else if (ch === "]") depth--;
    else if (ch === ":" && depth === 0) return null; // has modifier → skip
  }
  // Strip opacity modifier: bg-blue-500/50 → bg-blue-500
  return cls.replace(/\/[\d.]+$/, "");
}

function extractVariants(
  props: ComponentProp[],
  variants: Variant[],
  propUnionTypes: Record<string, string[]>,
): void {
  const variantPropKeys = ["variant", "size", "color", "type", "intent"];

  // Collect ALL variant-like props that have resolved union literals
  const activePropNames = variantPropKeys.filter(
    (key) => props.some((p) => p.name.toLowerCase() === key) && propUnionTypes[key]?.length > 0
  );

  if (activePropNames.length === 0) {
    // Fallback: use first variant-like prop name without types, or generic fallback
    const variantProp = props.find((p) => variantPropKeys.includes(p.name.toLowerCase()));
    if (!variantProp) return;
    for (const name of ["default", "primary", "secondary", "outline"]) {
      variants.push({ name, propValues: { variant: name }, styles: {} });
    }
    return;
  }

  // Cross-product all variant prop values
  const allValues: Array<[string, string[]]> = activePropNames.map(
    (key) => [key, propUnionTypes[key]]
  );

  function cartesian(
    axes: Array<[string, string[]]>,
    current: Record<string, string>,
    depth: number
  ): void {
    if (depth === axes.length) {
      const name = Object.entries(current).map(([, v]) => v).join("/");
      variants.push({ name, propValues: { ...current }, styles: {} });
      return;
    }
    const [propName, values] = axes[depth];
    for (const val of values) {
      cartesian(axes, { ...current, [propName]: val }, depth + 1);
    }
  }

  cartesian(allValues, {}, 0);
}

function extractUnionLiterals(typeNode: t.TSType): string[] {
  if (t.isTSUnionType(typeNode)) {
    const values: string[] = [];
    for (const member of typeNode.types) {
      if (t.isTSLiteralType(member) && t.isStringLiteral(member.literal)) {
        values.push(member.literal.value);
      }
    }
    return values;
  }
  if (t.isTSLiteralType(typeNode) && t.isStringLiteral(typeNode.literal)) {
    return [typeNode.literal.value];
  }
  return [];
}

function buildJSXNode(node: t.JSXElement): JSXNode | null {
  const opening = node.openingElement;
  const tagName = t.isJSXIdentifier(opening.name) 
    ? opening.name.name 
    : "unknown";

  const props: Record<string, any> = {};
  
  opening.attributes.forEach((attr) => {
    if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
      const value = t.isStringLiteral(attr.value) 
        ? attr.value.value 
        : true;
      props[attr.name.name] = value;
    }
  });

  return {
    type: tagName,
    props,
    children: [],
  };
}

/**
 * Returns true if the expression is a styled-components / @emotion/styled tag:
 *   styled.button, styled(Button), styled.button.attrs({})
 */
function isStyledTag(tag: t.Expression): boolean {
  if (t.isMemberExpression(tag) && t.isIdentifier(tag.object) && tag.object.name === "styled") return true;
  if (t.isCallExpression(tag)) {
    const callee = tag.callee;
    if (t.isIdentifier(callee) && callee.name === "styled") return true;
    // styled.button.attrs(...)`...`
    if (t.isMemberExpression(callee)) return isStyledTag(callee.object as t.Expression);
  }
  return false;
}

/**
 * Parse a static styled-components/emotion template literal CSS string
 * (no expressions) and apply the declarations to `styles`.
 */
function parseStyledCssToStyles(cssText: string, styles: ExtractedStyles): void {
  let root: postcss.Root;
  try {
    root = postcss.parse(`:root {\n${cssText}\n}`);
  } catch {
    return;
  }
  root.walkDecls((decl) => {
    const prop = decl.prop.toLowerCase().trim();
    const val = decl.value.trim();
    switch (prop) {
      case "background-color":
      case "background":
        if (/^(#|rgb|hsl|oklch|lch)/.test(val) || /^[a-z]+$/.test(val)) {
          styles.visual.backgroundColor = val;
        }
        break;
      case "color": styles.visual.color = val; break;
      case "border-radius": styles.visual.borderRadius = val; break;
      case "font-size": styles.typography.fontSize = val; break;
      case "font-weight": styles.typography.fontWeight = val; break;
      case "font-family": styles.typography.fontFamily = val; break;
      case "padding":
      case "padding-block":
      case "padding-inline": styles.layout.padding = val; break;
      case "gap":
      case "row-gap":
      case "column-gap": styles.layout.gap = val; break;
      case "display": styles.layout.display = val; break;
      case "flex-direction": styles.layout.flexDirection = val; break;
      case "align-items": styles.layout.alignItems = val; break;
    }
  });
}
