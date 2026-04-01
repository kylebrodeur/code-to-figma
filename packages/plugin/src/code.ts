import {
  hex, rgbaFill, noFill, applyStroke,
  createFrame, hRow, vCol,
  createText, loadFonts,
  getOrCreatePage, clearByName, restackVertical,
} from './primitives';
import type {
  FigmaJsonOutput, FigmaVariant, FigmaFill, FigmaStroke,
  FigmaEffect, FigmaAutoLayout, FigmaPadding, PluginMessage, UIMessage,
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
function applyFills(node: GeometryMixin, fills: FigmaFill[]): void {
  if (!fills || fills.length === 0) {
    node.fills = noFill();
    return;
  }
  const paintList: Paint[] = [];
  for (const f of fills) {
    if (f.type === 'SOLID' && f.color) {
      paintList.push({
        type: 'SOLID',
        color: { r: f.color.r, g: f.color.g, b: f.color.b },
        opacity: f.opacity !== undefined ? f.opacity : f.color.a,
      });
    }
    // Gradient and image fills can be extended later
  }
  node.fills = paintList;
}

// ── APPLY STROKES ──
function applyStrokes(node: GeometryMixin, strokes: FigmaStroke[]): void {
  if (!strokes || strokes.length === 0) return;
  const strokeList: Paint[] = [];
  for (const s of strokes) {
    strokeList.push({
      type: 'SOLID',
      color: { r: s.color.r, g: s.color.g, b: s.color.b },
      opacity: s.color.a,
    });
  }
  node.strokes = strokeList;
  if (strokes[0]) {
    node.strokeWeight = strokes[0].weight;
    node.strokeAlign = strokes[0].alignment;
  }
}

// ── APPLY EFFECTS ──
function applyEffects(node: BlendMixin, effects: FigmaEffect[]): void {
  if (!effects || effects.length === 0) return;
  const effectList: Effect[] = [];
  for (const e of effects) {
    if (e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW') {
      effectList.push({
        type: e.type,
        color: e.color ? { r: e.color.r, g: e.color.g, b: e.color.b, a: e.color.a } : { r: 0, g: 0, b: 0, a: 0.25 },
        offset: e.offset ? { x: e.offset.x, y: e.offset.y } : { x: 0, y: 4 },
        radius: e.radius,
        spread: e.spread !== undefined ? e.spread : 0,
        visible: true,
        blendMode: 'NORMAL',
      });
    } else if (e.type === 'LAYER_BLUR' || e.type === 'BACKGROUND_BLUR') {
      effectList.push({
        type: e.type,
        blurType: 'NORMAL',
        radius: e.radius,
        visible: true,
      } as Effect);
    }
  }
  node.effects = effectList;
}

// ── APPLY PADDING ──
function applyPadding(frame: FrameNode, padding?: FigmaPadding): void {
  if (!padding) return;
  frame.paddingTop = padding.top;
  frame.paddingRight = padding.right;
  frame.paddingBottom = padding.bottom;
  frame.paddingLeft = padding.left;
}

// ── APPLY AUTO-LAYOUT ──
function applyAutoLayout(frame: FrameNode, layout: FigmaAutoLayout): void {
  frame.layoutMode = layout.mode;
  frame.layoutWrap = layout.wrap ? 'WRAP' : 'NO_WRAP';
  frame.itemSpacing = layout.gap;
  applyPadding(frame, layout.padding);

  // Primary axis alignment
  const primaryMap: Record<string, 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN'> = {
    MIN: 'MIN',
    CENTER: 'CENTER',
    MAX: 'MAX',
    SPACE_BETWEEN: 'SPACE_BETWEEN',
  };
  frame.primaryAxisAlignItems = primaryMap[layout.alignment.primary] || 'MIN';

  // Counter axis alignment
  const counterMap: Record<string, 'MIN' | 'CENTER' | 'MAX'> = {
    MIN: 'MIN',
    CENTER: 'CENTER',
    MAX: 'MAX',
  };
  frame.counterAxisAlignItems = counterMap[layout.alignment.counter] || 'MIN';
}

// ── BUILD VARIANT FRAME ──
async function buildVariantFrame(
  variant: FigmaVariant,
  styles: FigmaJsonOutput['styles'],
  autoLayout: FigmaAutoLayout,
): Promise<FrameNode> {
  const frame = createFrame(variant.name, variant.frame.width);
  frame.resize(variant.frame.width, variant.frame.height);

  // Apply auto-layout from component-level settings
  applyAutoLayout(frame, autoLayout);

  // Override padding/gap from variant if specified
  if (variant.frame.padding) applyPadding(frame, variant.frame.padding);
  if (variant.frame.gap !== undefined) frame.itemSpacing = variant.frame.gap;

  // Apply visual properties
  applyFills(frame, variant.frame.fills);
  applyStrokes(frame, variant.frame.strokes);
  applyEffects(frame, variant.frame.effects);

  // Add a text label showing the variant name for identification
  const fontFamily = styles.typography.fontFamily || 'Inter';
  const fontSize = (typeof styles.typography.fontSize === 'number' && styles.typography.fontSize > 0)
    ? styles.typography.fontSize
    : 14;
  const fontWeight = styles.typography.fontWeight || 400;
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
  const fontFamilies: string[] = [data.styles.typography.fontFamily || 'Inter'];
  await loadFonts(fontFamilies);

  if (data.type === 'COMPONENT_SET' && data.variants.length > 1) {
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
    for (const variant of data.variants) {
      const variantFrame = await buildVariantFrame(variant, data.styles, data.autoLayout);
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
    const frame = await buildVariantFrame(variant, data.styles, data.autoLayout);
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
        await loadFonts();
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
