// ── COLOR HELPERS ──

/** Parse hex string to Figma RGB {r, g, b} (0-1 range) */
export function hex(h: string): RGB {
  const s = h.replace('#', '');
  return {
    r: parseInt(s.slice(0, 2), 16) / 255,
    g: parseInt(s.slice(2, 4), 16) / 255,
    b: parseInt(s.slice(4, 6), 16) / 255,
  };
}

/** Parse hex string to Figma RGBA with alpha */
export function hexA(h: string, a: number): RGBA {
  const c = hex(h);
  return { r: c.r, g: c.g, b: c.b, a };
}

/** Create a solid fill array from hex + optional opacity */
export function solidFill(h: string, opacity?: number): SolidPaint[] {
  return [{ type: 'SOLID', color: hex(h), opacity: opacity !== undefined ? opacity : 1 }];
}

/** Create an RGBA fill array from pre-parsed {r,g,b,a} color */
export function rgbaFill(color: RGBA, opacity?: number): SolidPaint[] {
  return [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b }, opacity: opacity !== undefined ? opacity : color.a }];
}

/** Empty fills array */
export function noFill(): Paint[] {
  return [];
}

/** Apply stroke to a node */
export function applyStroke(node: GeometryMixin, h: string, weight?: number): void {
  node.strokes = [{ type: 'SOLID', color: hex(h) }];
  node.strokeWeight = weight !== undefined ? weight : 1;
  node.strokeAlign = 'INSIDE';
}

// ── FRAME / SHAPE FACTORIES ──

/** Create a frame with optional width */
export function createFrame(name: string, width?: number): FrameNode {
  const f = figma.createFrame();
  f.name = name;
  f.fills = noFill();
  if (width) f.resize(width, 100);
  return f;
}

/** Create a rectangle */
export function createRect(name: string, w: number, h: number, fillHex?: string): RectangleNode {
  const r = figma.createRectangle();
  r.name = name;
  r.resize(w, h);
  r.fills = fillHex ? solidFill(fillHex) : noFill();
  return r;
}

// ── LAYOUT HELPERS ──

/** Create a horizontal auto-layout frame */
export function hRow(name: string, gap?: number): FrameNode {
  const g = gap !== undefined ? gap : 12;
  const f = createFrame(name);
  f.layoutMode = 'HORIZONTAL';
  f.primaryAxisSizingMode = 'AUTO';
  f.counterAxisSizingMode = 'AUTO';
  f.itemSpacing = g;
  return f;
}

/** Create a vertical auto-layout frame */
export function vCol(name: string, gap?: number): FrameNode {
  const g = gap !== undefined ? gap : 8;
  const f = createFrame(name);
  f.layoutMode = 'VERTICAL';
  f.primaryAxisSizingMode = 'AUTO';
  f.counterAxisSizingMode = 'AUTO';
  f.itemSpacing = g;
  return f;
}

// ── TEXT ──

export interface TextOptions {
  letterSpacing?: number;
  lineHeight?: number;
  width?: number;
  upper?: boolean;
  align?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
}

/** Create a text node — loads font automatically */
export async function createText(
  str: string,
  family: string,
  style: string,
  size: number,
  fillHex: string,
  opts?: TextOptions,
): Promise<TextNode> {
  const t = figma.createText();
  await figma.loadFontAsync({ family, style });
  t.fontName = { family, style };
  t.fontSize = size;
  t.fills = solidFill(fillHex);
  if (opts) {
    if (opts.letterSpacing !== undefined) t.letterSpacing = { value: opts.letterSpacing, unit: 'PERCENT' };
    if (opts.lineHeight !== undefined) t.lineHeight = { value: opts.lineHeight, unit: 'PIXELS' };
    if (opts.width !== undefined) {
      t.textAutoResize = 'HEIGHT';
      t.resize(opts.width, 100);
    } else {
      t.textAutoResize = 'WIDTH_AND_HEIGHT';
    }
    if (opts.upper) t.textCase = 'UPPER';
    if (opts.align) t.textAlignHorizontal = opts.align;
  } else {
    t.textAutoResize = 'WIDTH_AND_HEIGHT';
  }
  t.characters = str;
  return t;
}

// ── FONT LOADING ──

/** Load fonts needed for rendering, with Inter as fallback */
export async function loadFonts(families?: string[]): Promise<void> {
  // Always load Inter as fallback
  const defaultFonts: FontName[] = [
    { family: 'Inter', style: 'Regular' },
    { family: 'Inter', style: 'Medium' },
    { family: 'Inter', style: 'Semi Bold' },
    { family: 'Inter', style: 'Bold' },
  ];

  const customFonts: FontName[] = [];
  if (families) {
    for (const fam of families) {
      customFonts.push({ family: fam, style: 'Regular' });
      customFonts.push({ family: fam, style: 'Medium' });
      customFonts.push({ family: fam, style: 'Bold' });
    }
  }

  const allFonts = defaultFonts.concat(customFonts);

  // Load each font individually, skip failures silently (font may not be installed)
  for (const font of allFonts) {
    try {
      await figma.loadFontAsync(font);
    } catch (_e) {
      // Font not available — will use fallback
    }
  }
}

// ── PAGE HELPERS ──

/** Get or create a page by name */
export function getOrCreatePage(name: string): PageNode {
  const existing = figma.root.children.find((p) => p.name === name);
  if (existing) return existing;
  const pg = figma.createPage();
  pg.name = name;
  return pg;
}

/** Remove all children with a given name from a page */
export function clearByName(parent: PageNode | FrameNode, name: string): void {
  const toRemove = parent.children.filter((n) => n.name === name);
  for (const n of toRemove) {
    n.remove();
  }
}

/** Restack frames vertically with optional gap */
export function restackVertical(parent: PageNode, gap?: number): void {
  const g = gap !== undefined ? gap : 0;
  const frames = parent.children
    .filter((n): n is FrameNode => n.type === 'FRAME')
    .sort((a, b) => a.y - b.y);
  let y = 0;
  for (const f of frames) {
    f.x = 0;
    f.y = y;
    y += f.height + g;
  }
}
