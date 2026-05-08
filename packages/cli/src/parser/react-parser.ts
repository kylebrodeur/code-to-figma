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

    // Detect cva() calls for variant management.
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
  });

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

  const body = path.node.body;
  if (t.isBlockStatement(body)) {
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
      variants.push({ name, propValues: { variant: name } });
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
      variants.push({ name, propValues: { ...current } });
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
