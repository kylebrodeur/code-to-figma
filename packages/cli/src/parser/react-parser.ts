import { parse as babelParse } from "@babel/parser";
import traverse from "@babel/traverse";
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

  // Traverse AST to find component
  traverse(ast, {
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
    extractVariants(props, variants);
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
    node.id !== null &&
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
  
  for (const cls of classList) {
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
    if (cls.startsWith("text-")) styles.visual.color = cls;
    if (cls.startsWith("rounded-")) styles.visual.borderRadius = cls;
    
    // Typography
    if (cls.startsWith("text-")) styles.typography.fontSize = cls;
    if (cls.startsWith("font-")) styles.typography.fontWeight = cls;
  }
}

function extractVariants(props: ComponentProp[], variants: Variant[]): void {
  // Look for variant/size/style props
  const variantProps = props.filter(
    (p) => ["variant", "size", "color"].includes(p.name.toLowerCase())
  );
  
  if (variantProps.length === 0) return;

  // Create basic variants (default, primary, secondary, etc.)
  const variantNames = ["default", "primary", "secondary", "outline"];
  
  for (const name of variantNames) {
    variants.push({
      name,
      propValues: { variant: name },
      styles: {},
    });
  }
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
