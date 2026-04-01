import pc from "picocolors";
import type { Config } from "../config.js";

interface ReadOptions extends Config {
  fileKey: string;
  nodeId?: string;
  output?: string;
}

export async function readFromFigma(options: ReadOptions): Promise<void> {
  const { fileKey, nodeId } = options;
  const token = options.figmaAccessToken;

  if (!token) {
    console.error(pc.red("Error: Figma access token required"));
    console.log(pc.dim("Set figmaAccessToken in .code-to-figma.json"));
    return;
  }

  if (!fileKey) {
    console.error(pc.red("Error: Figma file key required"));
    console.log(pc.dim("Use --file-key <key> or set figmaFileKey in .code-to-figma.json"));
    return;
  }

  const url = nodeId
    ? `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`
    : `https://api.figma.com/v1/files/${fileKey}`;

  console.log(pc.cyan(`Reading from Figma file ${fileKey}...`));
  if (nodeId) console.log(pc.dim(`Node: ${nodeId}`));

  try {
    const response = await fetch(url, {
      headers: { "X-Figma-Token": token },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(pc.red(`Figma API error (${response.status}): ${errorText}`));
      return;
    }

    const data = await response.json();

    // Extract useful info
    const output = {
      name: data.name,
      lastModified: data.lastModified,
      version: data.version,
      ...(nodeId ? { nodes: data.nodes } : {
        components: data.components,
        componentSets: data.componentSets,
        styles: data.styles,
      }),
    };

    if (options.output) {
      const { writeFileSync } = await import("fs");
      writeFileSync(options.output, JSON.stringify(output, null, 2));
      console.log(pc.green(`✓ Written to ${options.output}`));
    } else {
      console.log(JSON.stringify(output, null, 2));
    }

    // Summary
    if (!nodeId) {
      const componentCount = Object.keys(data.components || {}).length;
      const styleCount = Object.keys(data.styles || {}).length;
      console.log(pc.dim(`\nComponents: ${componentCount}, Styles: ${styleCount}`));
    }
  } catch (error) {
    console.error(pc.red("Failed to read from Figma:"), error);
  }
}
