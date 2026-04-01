import { parse as babelParse } from "@babel/parser";
import traverseModule from "@babel/traverse";
const traverse = (traverseModule as any).default || traverseModule;
import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { readFileSync } from "fs";
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

  // Traverse AST to find component
  traverse(ast, {
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
      if (t.isJSXIdentifier(path.node.name) && path.node.name.name === "className") {
        const classes = extractClasses(path.node.value);
        parseTailwindClasses(classes, styles, config);
      }
    },

    // Build JSX structure tree
    JSXElement(path: NodePath<t.JSXElement>) {
      const node = buildJSXNode(path.node);
      if (node) jsxStructure.push(node);
    },
  });

  if (!componentName) return null;

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
    // Simple case: just concatenate
    return value.expression.quasis.map((q) => q.value.raw).join(" ");
  }
  
  return "";
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
