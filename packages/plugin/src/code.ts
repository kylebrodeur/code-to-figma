import {
  hex, rgbaFill, noFill, applyStroke,
  createFrame, hRow, vCol,
  createText, loadFonts,
  getOrCreatePage, clearByName, restackVertical,
} from './primitives';
import type {
  FigmaJsonOutput, ExtractedVariantData, PluginMessage, UIMessage
} from './types';

const PAGE_NAME = 'code-to-figma';

figma.showUI(__html__, { width: 420, height: 520, title: 'Code to Figma' });

function sendStatus(msg: string): void {
  const message: UIMessage = { type: 'STATUS', msg };
  figma.ui.postMessage(message);
}

function sendDone(msg: string): void {
  const message: UIMessage = { type: 'DONE', msg };
  figma.ui.postMessage(message);
}

function sendError(msg: string): void {
  const message: UIMessage = { type: 'ERROR', msg };
  figma.ui.postMessage(message);
}

// ── APPLY FILLS ──
function applyFills(node: GeometryMixin, fills: { r: number; g: number; b: number; a: number }[]): void {
  if (!fills || fills.length === 0) {
    node.fills = noFill();
    return;
  }
  const paintList: Paint[] = [];
  for (const f of fills) {
    paintList.push({
      type: 'SOLID',
      color: { r: f.r, g: f.g, b: f.b },
      opacity: f.a,
    });
  }
  node.fills = paintList;
}

// ── BUILD VARIANT FRAME ──
async function buildVariantFrame(
  variant: ExtractedVariantData
): Promise<FrameNode> {
  const frame = createFrame(variant.name, variant.frame.width);
  frame.resize(variant.frame.width, variant.frame.height);

  // Apply auto-layout properties derived from DOM
  if (variant.frame.display === 'flex' || variant.frame.display === 'inline-flex') {
    frame.layoutMode = variant.frame.flexDirection.includes('column') ? 'VERTICAL' : 'HORIZONTAL';
    frame.itemSpacing = variant.frame.gap || 0;
    
    const alignMap: Record<string, "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN"> = {
      'flex-start': 'MIN',
      'center': 'CENTER',
      'flex-end': 'MAX',
      'space-between': 'SPACE_BETWEEN'
    };
    
    if (frame.layoutMode === 'HORIZONTAL') {
      frame.primaryAxisAlignItems = alignMap[variant.frame.justifyContent] || 'MIN';
      frame.counterAxisAlignItems = alignMap[variant.frame.alignItems] || 'MIN';
    } else {
      frame.primaryAxisAlignItems = alignMap[variant.frame.justifyContent] || 'MIN';
      frame.counterAxisAlignItems = alignMap[variant.frame.alignItems] || 'MIN';
    }
  }

  // Padding
  frame.paddingTop = variant.frame.padding.top;
  frame.paddingRight = variant.frame.padding.right;
  frame.paddingBottom = variant.frame.padding.bottom;
  frame.paddingLeft = variant.frame.padding.left;
  
  // Corner Radius
  frame.cornerRadius = variant.frame.cornerRadius;

  // Apply visual properties
  applyFills(frame, variant.frame.fills);

  // Add a text label showing the variant name for identification
  const fontFamily = variant.frame.typography.fontFamily.split(',')[0].replace(/['"]/g, '') || 'Inter';
  const fontSize = (typeof variant.frame.typography.fontSize === 'number' && variant.frame.typography.fontSize > 0)
    ? variant.frame.typography.fontSize
    : 14;
  const fontWeight = variant.frame.typography.fontWeight || 400;
  const fontStyle = fontWeight >= 700 ? 'Bold' : fontWeight >= 500 ? 'Medium' : 'Regular';

  try {
    const label = await createText(
      variant.name,
      fontFamily,
      fontStyle,
      fontSize,
      '#000000',
    );
    frame.appendChild(label);
  } catch (_e) {
    // Fallback to Inter if custom font is not available
    const label = await createText(
      variant.name,
      'Inter',
      'Regular',
      fontSize,
      '#000000',
    );
    frame.appendChild(label);
  }

  return frame;
}

// ── BUILD COMPONENT ──
async function buildComponent(data: FigmaJsonOutput): Promise<FrameNode> {
  sendStatus('Building ' + data.name + '...');

  const pg = getOrCreatePage(PAGE_NAME);
  figma.currentPage = pg;

  // Clear any existing frame with this name
  clearByName(pg, data.name);

  // Collect unique font families to preload
  const fontFamilies = new Set<string>(['Inter']);
  data.variants.forEach(v => {
    const family = v.frame.typography.fontFamily.split(',')[0].replace(/['"]/g, '');
    if (family) fontFamilies.add(family);
  });
  await loadFonts(Array.from(fontFamilies));

  if (data.type === 'COMPONENT_SET') {
    // Create a wrapper frame for the component set
    const wrapper = vCol(data.name, 20);
    wrapper.paddingTop = 20;
    wrapper.paddingRight = 20;
    wrapper.paddingBottom = 20;
    wrapper.paddingLeft = 20;

    // Add component name label
    const titleLabel = await createText(
      data.name,
      'Inter',
      'Bold',
      18,
      '#333333',
    );
    wrapper.appendChild(titleLabel);

    // Build each variant
    const variantRow = hRow('variants', 16);
    variantRow.layoutWrap = 'WRAP';
    
    for (const variant of data.variants) {
      const variantFrame = await buildVariantFrame(variant);
      variantRow.appendChild(variantFrame);
    }
    wrapper.appendChild(variantRow);

    pg.appendChild(wrapper);
    return wrapper;
  } else {
    // Single component
    const variant = data.variants[0];
    if (!variant) {
      throw new Error('Component has no variants');
    }
    const frame = await buildVariantFrame(variant);
    frame.name = data.name;
    pg.appendChild(frame);
    return frame;
  }
}

// ── MESSAGE HANDLER ──
figma.ui.onmessage = async (msg: PluginMessage) => {
  try {
    switch (msg.type) {
      case 'IMPORT_JSON': {
        const components = msg.data;
        if (!components || components.length === 0) {
          sendError('No components found in JSON');
          return;
        }
        sendStatus('Importing ' + components.length + ' component(s)...');
        await loadFonts(['Inter']);
        for (const comp of components) {
          await buildComponent(comp);
        }
        const pg = getOrCreatePage(PAGE_NAME);
        restackVertical(pg, 40);
        figma.viewport.scrollAndZoomIntoView(pg.children);
        sendDone('Built ' + components.length + ' component(s)');
        break;
      }
      case 'BUILD_COMPONENT': {
        sendError('BUILD_COMPONENT requires JSON data — use IMPORT_JSON instead');
        break;
      }
      case 'REMOVE_COMPONENT': {
        const pg = getOrCreatePage(PAGE_NAME);
        clearByName(pg, msg.name);
        restackVertical(pg, 40);
        sendDone('Removed ' + msg.name);
        break;
      }
      case 'REMOVE_COMPONENTS': {
        const pg = getOrCreatePage(PAGE_NAME);
        for (const name of msg.names) {
          clearByName(pg, name);
        }
        restackVertical(pg, 40);
        sendDone('Removed ' + msg.names.length + ' component(s)');
        break;
      }
      case 'REMOVE_ALL': {
        const pg = getOrCreatePage(PAGE_NAME);
        const children = Array.from(pg.children);
        for (const child of children) {
          child.remove();
        }
        sendDone('All components removed');
        break;
      }
    }
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : 'Unknown error';
    sendError(errMsg);
  }
};
