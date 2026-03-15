// =============================================================
// BulkSheetsSync — Figma Style Guide Builder
// Paste into: Plugins → Development → Open Console → run
//
// What this creates:
//   1. Variable collection "BSS Tokens" with Dark + Light modes
//   2. Text styles for the full BSS type scale
//   3. Style guide page with 8 sections matching the HTML guide
//   4. A "Tokens JSON" page with Token Studio-compatible JSON
// =============================================================

(async () => {

// ── HELPERS ────────────────────────────────────────────────
function hex(h) {
  const s = h.replace('#','');
  return { r: parseInt(s.slice(0,2),16)/255, g: parseInt(s.slice(2,4),16)/255, b: parseInt(s.slice(4,6),16)/255 };
}
function fill(h, a=1) {
  return [{ type:'SOLID', color:hex(h), opacity:a }];
}
function noFill() { return []; }
function stroke(h, w=1) {
  return { strokes:[{type:'SOLID',color:hex(h)}], strokeWeight:w, strokeAlign:'INSIDE' };
}
function applyStroke(node, h, w=1) {
  node.strokes = [{type:'SOLID',color:hex(h)}];
  node.strokeWeight = w;
  node.strokeAlign = 'INSIDE';
}

async function loadFont(family, style) {
  try { await figma.loadFontAsync({family, style}); return true; }
  catch(e) { console.warn('Font not found:',family,style); return false; }
}

function frame(name, w, h) {
  const f = figma.createFrame();
  f.name = name; f.resize(w, h);
  f.fills = noFill();
  return f;
}

function rect(name, w, h, fillHex) {
  const r = figma.createRectangle();
  r.name = name; r.resize(w, h);
  r.fills = fillHex ? fill(fillHex) : noFill();
  return r;
}

async function text(str, opts={}) {
  const t = figma.createText();
  const family = opts.family || 'Barlow';
  const style  = opts.style  || 'Regular';
  await loadFont(family, style);
  t.fontName = { family, style };
  t.characters = str;
  t.fontSize   = opts.size   || 15;
  t.fills      = opts.color  ? fill(opts.color) : fill('#e8dfd0');
  if (opts.letterSpacing) t.letterSpacing = { value: opts.letterSpacing, unit:'PERCENT' };
  if (opts.lineHeight)    t.lineHeight    = { value: opts.lineHeight, unit:'PIXELS' };
  if (opts.width) { t.textAutoResize = 'HEIGHT'; t.resize(opts.width, 100); }
  else t.textAutoResize = 'WIDTH_AND_HEIGHT';
  return t;
}

function autoLayout(node, dir='HORIZONTAL', gap=12, padH=0, padV=0) {
  node.layoutMode = dir;
  node.itemSpacing = gap;
  node.paddingLeft = padH; node.paddingRight = padH;
  node.paddingTop  = padV; node.paddingBottom = padV;
  node.primaryAxisSizingMode  = 'AUTO';
  node.counterAxisSizingMode  = 'AUTO';
}

// ── TOKENS ─────────────────────────────────────────────────
const T = {
  dark: {
    bg:'#1a1510', sf:'#231c14', sf2:'#2c2418',
    br:'#3a3020', brh:'#4e4030',
    tx:'#e8dfd0', mu:'#907e68', dm:'#7a6a58',
    go:'#c98d1a', ru:'#cc6030', te:'#5a9e80',
  },
  light: {
    bg:'#f2ede4', sf:'#e8e1d6', sf2:'#ded6c8',
    br:'#ccc0ac', brh:'#b8a894',
    tx:'#1e1510', mu:'#6a5a48', dm:'#a89078',
    go:'#8a6010', ru:'#a83e18', te:'#2a6a4c',
  }
};

// ── 1. VARIABLE COLLECTION ──────────────────────────────────
figma.notify('Creating BSS variable collection…');

const coll = figma.variables.createVariableCollection('BSS Tokens');
coll.renameMode(coll.modes[0].modeId, 'Dark');
const lightModeId = coll.addMode('Light');
const darkModeId  = coll.modes[0].modeId;

const tokenDefs = [
  { name:'color/background',   dark:T.dark.bg,  light:T.light.bg  },
  { name:'color/surface',      dark:T.dark.sf,  light:T.light.sf  },
  { name:'color/surface-2',    dark:T.dark.sf2, light:T.light.sf2 },
  { name:'color/border',       dark:T.dark.br,  light:T.light.br  },
  { name:'color/border-hover', dark:T.dark.brh, light:T.light.brh },
  { name:'color/text',         dark:T.dark.tx,  light:T.light.tx  },
  { name:'color/muted',        dark:T.dark.mu,  light:T.light.mu  },
  { name:'color/dim',          dark:T.dark.dm,  light:T.light.dm  },
  { name:'color/gold',         dark:T.dark.go,  light:T.light.go  },
  { name:'color/rust',         dark:T.dark.ru,  light:T.light.ru  },
  { name:'color/teal',         dark:T.dark.te,  light:T.light.te  },
  // Spacing
  { name:'spacing/xs',  dark:4,  light:4,  type:'FLOAT' },
  { name:'spacing/sm',  dark:8,  light:8,  type:'FLOAT' },
  { name:'spacing/md',  dark:16, light:16, type:'FLOAT' },
  { name:'spacing/lg',  dark:24, light:24, type:'FLOAT' },
  { name:'spacing/xl',  dark:40, light:40, type:'FLOAT' },
  // Radius
  { name:'radius/sm',   dark:2,  light:2,  type:'FLOAT' },
  { name:'radius/md',   dark:3,  light:3,  type:'FLOAT' },
  { name:'radius/card', dark:4,  light:4,  type:'FLOAT' },
  // Typography sizes (px)
  { name:'font-size/label',   dark:11, light:11, type:'FLOAT' },
  { name:'font-size/small',   dark:13, light:13, type:'FLOAT' },
  { name:'font-size/body',    dark:15, light:15, type:'FLOAT' },
  { name:'font-size/h3',      dark:17, light:17, type:'FLOAT' },
  { name:'font-size/h2',      dark:22, light:22, type:'FLOAT' },
  { name:'font-size/h1',      dark:32, light:32, type:'FLOAT' },
  { name:'font-size/display', dark:52, light:52, type:'FLOAT' },
];

const vars = {};
for (const def of tokenDefs) {
  const vtype = def.type || 'COLOR';
  const v = figma.variables.createVariable(def.name, coll, vtype);
  if (vtype === 'COLOR') {
    v.setValueForMode(darkModeId,  hex(def.dark));
    v.setValueForMode(lightModeId, hex(def.light));
  } else {
    v.setValueForMode(darkModeId,  def.dark);
    v.setValueForMode(lightModeId, def.light);
  }
  vars[def.name] = v;
}

// ── 2. TEXT STYLES ──────────────────────────────────────────
figma.notify('Creating text styles…');

const typeStyles = [
  { name:'BSS/Display',    family:'Bricolage Grotesque', style:'Bold',    size:52, tracking:-2,  lh:52  },
  { name:'BSS/H1',         family:'Bricolage Grotesque', style:'Bold',    size:32, tracking:-2,  lh:36  },
  { name:'BSS/H2',         family:'Bricolage Grotesque', style:'Bold',    size:22, tracking:-2,  lh:26  },
  { name:'BSS/H3',         family:'Bricolage Grotesque', style:'SemiBold',size:17, tracking:-1,  lh:22  },
  { name:'BSS/Body',       family:'Barlow',              style:'Regular', size:15, tracking:0,   lh:24  },
  { name:'BSS/Body Small', family:'Barlow',              style:'Regular', size:13, tracking:0,   lh:20  },
  { name:'BSS/Label',      family:'Martian Mono',        style:'Medium',  size:11, tracking:8,   lh:16  },
  { name:'BSS/Caption',    family:'Martian Mono',        style:'Regular', size:10, tracking:6,   lh:14  },
  { name:'BSS/Code',       family:'Martian Mono',        style:'Regular', size:12, tracking:0,   lh:20  },
];

for (const ts of typeStyles) {
  try {
    await loadFont(ts.family, ts.style);
    const s = figma.createTextStyle();
    s.name = ts.name;
    s.fontName = { family: ts.family, style: ts.style };
    s.fontSize = ts.size;
    s.letterSpacing = { value: ts.tracking, unit:'PERCENT' };
    s.lineHeight     = { value: ts.lh, unit:'PIXELS' };
  } catch(e) { console.warn('Text style failed:', ts.name, e.message); }
}

// ── 3. BUILD STYLE GUIDE PAGE ───────────────────────────────
figma.notify('Building style guide frames…');

// Rename current page or create new one
const sg = figma.currentPage;
sg.name = 'BSS Style Guide';

// Clear existing content
for (const n of [...sg.children]) n.remove();

// ── CONSTANTS ────
const W = 1200;      // frame width
const BG = T.dark.bg;
const SF = T.dark.sf;
const BR = T.dark.br;
const BRH = T.dark.brh;
const TX = T.dark.tx;
const MU = T.dark.mu;
const DM = T.dark.dm;
const GO = T.dark.go;
const RU = T.dark.ru;
const TE = T.dark.te;
const SF2 = T.dark.sf2;

let yPos = 0;
const GAP = 80;
const PADDING = 48;

// Helper: section header
async function sectionHeader(label, num) {
  const f = frame(`SH-${num}`, W - PADDING*2, 40);
  f.layoutMode = 'HORIZONTAL';
  f.primaryAxisAlignItems = 'CENTER';
  f.counterAxisAlignItems = 'CENTER';
  f.itemSpacing = 12;
  f.fills = noFill();

  const numT = await text(`0${num}`, { family:'Martian Mono', style:'Medium', size:11, color:GO, letterSpacing:14 });
  const lblT = await text(label.toUpperCase(), { family:'Martian Mono', style:'Medium', size:11, color:MU, letterSpacing:14 });

  const line = rect('divider', W - PADDING*2 - 200, 1, BR);
  f.appendChild(numT);
  f.appendChild(lblT);
  f.appendChild(line);
  f.counterAxisSizingMode = 'AUTO';
  f.primaryAxisSizingMode = 'FIXED';
  return f;
}

// ── SECTION 01: COLOUR ──────────────────────────────────────
{
  const sec = frame('01 · Colour', W, 1);
  sec.x = 0; sec.y = yPos;
  sec.fills = fill(BG);
  sec.layoutMode = 'VERTICAL';
  sec.paddingLeft = sec.paddingRight = PADDING;
  sec.paddingTop  = sec.paddingBottom = 40;
  sec.itemSpacing = 24;
  sec.primaryAxisSizingMode  = 'AUTO';
  sec.counterAxisSizingMode  = 'FIXED';
  sec.resize(W, 1);

  sec.appendChild(await sectionHeader('Colour Palette', 1));

  // Dark swatches row
  const darkLbl = await text('Dark Theme', { family:'Martian Mono', style:'Regular', size:9, color:DM, letterSpacing:8 });
  sec.appendChild(darkLbl);

  const darkRow = frame('Dark Swatches', W - PADDING*2, 1);
  darkRow.layoutMode = 'HORIZONTAL';
  darkRow.itemSpacing = 12;
  darkRow.fills = noFill();
  darkRow.primaryAxisSizingMode = 'AUTO';
  darkRow.counterAxisSizingMode = 'AUTO';

  const darkSwatches = [
    { name:'Background', hex:T.dark.bg, desc:'#1a1510' },
    { name:'Surface',    hex:T.dark.sf, desc:'#231c14' },
    { name:'Surface 2',  hex:T.dark.sf2,desc:'#2c2418' },
    { name:'Text',       hex:T.dark.tx, desc:'#e8dfd0' },
    { name:'Muted',      hex:T.dark.mu, desc:'#907e68' },
    { name:'Gold',       hex:T.dark.go, desc:'#c98d1a' },
    { name:'Rust',       hex:T.dark.ru, desc:'#cc6030' },
    { name:'Teal',       hex:T.dark.te, desc:'#5a9e80' },
    { name:'Border',     hex:T.dark.br, desc:'#3a3020' },
  ];

  for (const sw of darkSwatches) {
    const card = frame(`swatch-${sw.name}`, 117, 100);
    card.cornerRadius = 4;
    card.fills = fill(T.dark.sf);
    applyStroke(card, T.dark.brh);
    card.layoutMode = 'VERTICAL';
    card.primaryAxisSizingMode = 'FIXED';
    card.counterAxisSizingMode = 'FIXED';
    card.itemSpacing = 0;
    card.clipsContent = true;

    const chip = rect('chip', 117, 52, sw.hex);
    const info = frame('info', 117, 48);
    info.fills = fill(T.dark.sf);
    info.layoutMode = 'VERTICAL';
    info.paddingLeft = info.paddingRight = 10;
    info.paddingTop = info.paddingBottom = 8;
    info.itemSpacing = 3;
    info.primaryAxisSizingMode = 'FIXED';
    info.counterAxisSizingMode = 'FIXED';

    const nameT = await text(sw.name, { family:'Martian Mono', style:'Regular', size:9, color:MU, letterSpacing:6 });
    const hexT  = await text(sw.desc, { family:'Martian Mono', style:'Medium',  size:10, color:TX });
    info.appendChild(nameT); info.appendChild(hexT);
    card.appendChild(chip); card.appendChild(info);
    darkRow.appendChild(card);
  }
  sec.appendChild(darkRow);

  // Light swatches row
  const lightLbl = await text('Light Theme', { family:'Martian Mono', style:'Regular', size:9, color:DM, letterSpacing:8 });
  sec.appendChild(lightLbl);

  const lightRow = frame('Light Swatches', W - PADDING*2, 1);
  lightRow.layoutMode = 'HORIZONTAL';
  lightRow.itemSpacing = 12;
  lightRow.fills = noFill();
  lightRow.primaryAxisSizingMode = 'AUTO';
  lightRow.counterAxisSizingMode = 'AUTO';

  const lightSwatches = [
    { name:'Background', hex:T.light.bg, desc:'#f2ede4' },
    { name:'Surface',    hex:T.light.sf, desc:'#e8e1d6' },
    { name:'Surface 2',  hex:T.light.sf2,desc:'#ded6c8' },
    { name:'Text',       hex:T.light.tx, desc:'#1e1510' },
    { name:'Muted',      hex:T.light.mu, desc:'#6a5a48' },
    { name:'Gold',       hex:T.light.go, desc:'#8a6010' },
    { name:'Rust',       hex:T.light.ru, desc:'#a83e18' },
    { name:'Teal',       hex:T.light.te, desc:'#2a6a4c' },
    { name:'Border',     hex:T.light.br, desc:'#ccc0ac' },
  ];

  for (const sw of lightSwatches) {
    const card = frame(`lswatch-${sw.name}`, 117, 100);
    card.cornerRadius = 4;
    card.fills = fill(T.light.sf);
    applyStroke(card, T.light.brh);
    card.layoutMode = 'VERTICAL';
    card.primaryAxisSizingMode = 'FIXED';
    card.counterAxisSizingMode = 'FIXED';
    card.itemSpacing = 0;
    card.clipsContent = true;

    const chip = rect('chip', 117, 52, sw.hex);
    const info = frame('info', 117, 48);
    info.fills = fill(T.light.sf);
    info.layoutMode = 'VERTICAL';
    info.paddingLeft = info.paddingRight = 10;
    info.paddingTop = info.paddingBottom = 8;
    info.itemSpacing = 3;
    info.primaryAxisSizingMode = 'FIXED';
    info.counterAxisSizingMode = 'FIXED';

    const nameT = await text(sw.name, { family:'Martian Mono', style:'Regular', size:9, color:T.light.mu, letterSpacing:6 });
    const hexT  = await text(sw.desc, { family:'Martian Mono', style:'Medium',  size:10, color:T.light.tx });
    info.appendChild(nameT); info.appendChild(hexT);
    card.appendChild(chip); card.appendChild(info);
    lightRow.appendChild(card);
  }
  sec.appendChild(lightRow);
  sec.primaryAxisSizingMode = 'AUTO';
  sg.appendChild(sec);
  yPos += sec.height + GAP;
}

// ── SECTION 02: TYPOGRAPHY ──────────────────────────────────
{
  const sec = frame('02 · Typography', W, 1);
  sec.x = 0; sec.y = yPos;
  sec.fills = fill(BG);
  sec.layoutMode = 'VERTICAL';
  sec.paddingLeft = sec.paddingRight = PADDING;
  sec.paddingTop  = sec.paddingBottom = 40;
  sec.itemSpacing = 0;
  sec.primaryAxisSizingMode = 'AUTO';
  sec.counterAxisSizingMode = 'FIXED';
  sec.resize(W, 1);

  sec.appendChild(await sectionHeader('Typography', 2));
  const spacer = rect('spacer', 1, 24); spacer.fills = noFill();
  sec.appendChild(spacer);

  const typeRows = [
    { meta:'52px · Display\nBricolage Bold',   sample:'500 rows, ',   accent:'1 task.',    size:52, family:'Bricolage Grotesque', style:'Bold' },
    { meta:'32px · H1\nBricolage Bold',        sample:'Stop paying per ', accent:'row.',   size:32, family:'Bricolage Grotesque', style:'Bold' },
    { meta:'22px · H2\nBricolage Bold',        sample:'Column ', accent:'Mapping',         size:22, family:'Bricolage Grotesque', style:'Bold' },
    { meta:'17px · H3\nBricolage SemiBold',    sample:'Push to Webhook', accent:'',        size:17, family:'Bricolage Grotesque', style:'SemiBold' },
    { meta:'15px · Body\nBarlow Regular',      sample:'One Zapier task processes your entire JSON array. 500 rows, 1 task.', accent:'', size:15, family:'Barlow', style:'Regular' },
    { meta:'13px · Small\nBarlow Regular',     sample:'Mapping rules stored. Data processed in RAM only — never logged.', accent:'', size:13, family:'Barlow', style:'Regular' },
    { meta:'11px · Label\nMartian Mono Medium\nUPPERCASE', sample:'FOUNDING MEMBER RATE', accent:'', size:11, family:'Martian Mono', style:'Medium', mono:true, upper:true, color:GO },
    { meta:'12px · Code\nMartian Mono Regular',sample:'POST /api/sync  → 200 OK · 1 task', accent:'', size:12, family:'Martian Mono', style:'Regular', mono:true },
  ];

  for (const row of typeRows) {
    const rowF = frame(`type-${row.size}`, W - PADDING*2, 1);
    rowF.layoutMode = 'HORIZONTAL';
    rowF.itemSpacing = 24;
    rowF.paddingTop = rowF.paddingBottom = 14;
    rowF.fills = noFill();
    rowF.counterAxisAlignItems = 'MIN';
    rowF.primaryAxisSizingMode = 'FIXED';
    rowF.counterAxisSizingMode = 'AUTO';

    // border top
    const divLine = rect('div', W - PADDING*2, 1, BR);
    rowF.appendChild(divLine);

    // Hmm, layout mode and rect don't mix well for border-top. Let me just use a frame wrapper.
    const metaT = await text(row.meta, { family:'Martian Mono', style:'Regular', size:9, color:DM, letterSpacing:6, lineHeight:14, width:140 });
    rowF.appendChild(metaT);

    // Sample text — for large sizes, keep it short
    await loadFont(row.family, row.style);
    const sampleT = figma.createText();
    sampleT.fontName = { family: row.family, style: row.style };
    sampleT.fontSize = row.size;
    sampleT.fills = fill(row.color || TX);
    if (row.upper) sampleT.textCase = 'UPPER';
    sampleT.textAutoResize = 'WIDTH_AND_HEIGHT';
    sampleT.letterSpacing = { value: row.mono ? 6 : -2, unit:'PERCENT' };
    sampleT.characters = row.sample + (row.accent || '');

    // Apply gold color to accent portion
    if (row.accent && row.accent.length > 0) {
      const start = row.sample.length;
      const end   = row.sample.length + row.accent.length;
      sampleT.setRangeFills(start, end, fill(GO));
    }

    rowF.appendChild(sampleT);
    sec.appendChild(rowF);
  }

  sg.appendChild(sec);
  yPos += sec.height + GAP;
}

// ── SECTION 03: BUTTONS ─────────────────────────────────────
{
  const sec = frame('03 · Buttons', W, 1);
  sec.x = 0; sec.y = yPos;
  sec.fills = fill(BG);
  sec.layoutMode = 'VERTICAL';
  sec.paddingLeft = sec.paddingRight = PADDING;
  sec.paddingTop  = sec.paddingBottom = 40;
  sec.itemSpacing = 20;
  sec.primaryAxisSizingMode = 'AUTO';
  sec.counterAxisSizingMode = 'FIXED';
  sec.resize(W, 1);

  sec.appendChild(await sectionHeader('Buttons', 3));

  // Sub-label
  const subLbl = await text('Variants', { family:'Martian Mono', style:'Regular', size:9, color:DM, letterSpacing:8 });
  sec.appendChild(subLbl);

  // Button helper
  async function makeBtn(label, bgColor, txtColor, borderColor, isBorder=false) {
    const f = frame(`btn-${label}`, 1, 44);
    f.layoutMode = 'HORIZONTAL';
    f.counterAxisAlignItems = 'CENTER';
    f.primaryAxisAlignItems = 'CENTER';
    f.paddingLeft = f.paddingRight = 18;
    f.primaryAxisSizingMode = 'AUTO';
    f.counterAxisSizingMode = 'FIXED';
    f.cornerRadius = 3;
    f.fills = bgColor ? fill(bgColor) : noFill();
    if (borderColor) {
      f.strokes = [{type:'SOLID',color:hex(borderColor)}];
      f.strokeWeight = 1;
      f.strokeAlign = 'INSIDE';
    }

    const t = await text(label.toUpperCase(), {
      family: 'Martian Mono', style: 'SemiBold',
      size: 11, color: txtColor, letterSpacing: 8
    });
    f.appendChild(t);
    return f;
  }

  // Button with label column
  async function btnWithLabel(label, btnLabel, bgColor, txtColor, borderColor) {
    const col = frame(`bwl-${label}`, 1, 1);
    col.layoutMode = 'VERTICAL';
    col.itemSpacing = 6;
    col.fills = noFill();
    col.primaryAxisSizingMode = 'AUTO';
    col.counterAxisSizingMode = 'AUTO';
    const lbl = await text(label, { family:'Martian Mono', style:'Regular', size:9, color:DM, letterSpacing:6 });
    const btn = await makeBtn(btnLabel, bgColor, txtColor, borderColor);
    col.appendChild(lbl);
    col.appendChild(btn);
    return col;
  }

  const btnsRow = frame('Buttons Row', W - PADDING*2, 1);
  btnsRow.layoutMode = 'HORIZONTAL';
  btnsRow.itemSpacing = 16;
  btnsRow.fills = noFill();
  btnsRow.counterAxisAlignItems = 'MIN';
  btnsRow.primaryAxisSizingMode = 'AUTO';
  btnsRow.counterAxisSizingMode = 'AUTO';

  btnsRow.appendChild(await btnWithLabel('Primary',     'Get started',  GO,  BG,  GO));
  btnsRow.appendChild(await btnWithLabel('Secondary',   'Cancel',       null,TX,  BRH));
  btnsRow.appendChild(await btnWithLabel('Destructive', 'Delete',       RU,  BG,  RU));
  btnsRow.appendChild(await btnWithLabel('Outline',     'View docs',    null,GO,  GO));
  btnsRow.appendChild(await btnWithLabel('Ghost',       'Skip',         null,TX,  null));
  sec.appendChild(btnsRow);

  // Sizes
  const sizeLbl = await text('Sizes', { family:'Martian Mono', style:'Regular', size:9, color:DM, letterSpacing:8 });
  sec.appendChild(sizeLbl);

  const sizesRow = frame('Sizes Row', W - PADDING*2, 1);
  sizesRow.layoutMode = 'HORIZONTAL';
  sizesRow.itemSpacing = 16;
  sizesRow.fills = noFill();
  sizesRow.counterAxisAlignItems = 'MIN';
  sizesRow.primaryAxisSizingMode = 'AUTO';
  sizesRow.counterAxisSizingMode = 'AUTO';

  // sm button
  const smCol = frame('sm-col', 1, 1);
  smCol.layoutMode='VERTICAL'; smCol.itemSpacing=6; smCol.fills=noFill();
  smCol.primaryAxisSizingMode='AUTO'; smCol.counterAxisSizingMode='AUTO';
  const smLbl = await text('sm', { family:'Martian Mono', style:'Regular', size:9, color:DM, letterSpacing:6 });
  const smBtn = frame('btn-sm', 1, 44);
  smBtn.layoutMode='HORIZONTAL'; smBtn.counterAxisAlignItems='CENTER';
  smBtn.primaryAxisAlignItems='CENTER'; smBtn.paddingLeft=smBtn.paddingRight=13;
  smBtn.primaryAxisSizingMode='AUTO'; smBtn.counterAxisSizingMode='FIXED';
  smBtn.cornerRadius=3; smBtn.fills=fill(GO);
  smBtn.appendChild(await text('PUSH ROWS', { family:'Martian Mono', style:'SemiBold', size:10, color:BG, letterSpacing:8 }));
  smCol.appendChild(smLbl); smCol.appendChild(smBtn); sizesRow.appendChild(smCol);

  // md button (default)
  const mdCol = frame('md-col', 1, 1);
  mdCol.layoutMode='VERTICAL'; mdCol.itemSpacing=6; mdCol.fills=noFill();
  mdCol.primaryAxisSizingMode='AUTO'; mdCol.counterAxisSizingMode='AUTO';
  const mdLbl = await text('md · default', { family:'Martian Mono', style:'Regular', size:9, color:DM, letterSpacing:6 });
  const mdBtn = frame('btn-md', 1, 44);
  mdBtn.layoutMode='HORIZONTAL'; mdBtn.counterAxisAlignItems='CENTER';
  mdBtn.primaryAxisAlignItems='CENTER'; mdBtn.paddingLeft=mdBtn.paddingRight=18;
  mdBtn.primaryAxisSizingMode='AUTO'; mdBtn.counterAxisSizingMode='FIXED';
  mdBtn.cornerRadius=3; mdBtn.fills=fill(GO);
  mdBtn.appendChild(await text('SYNC NOW', { family:'Martian Mono', style:'SemiBold', size:11, color:BG, letterSpacing:8 }));
  mdCol.appendChild(mdLbl); mdCol.appendChild(mdBtn); sizesRow.appendChild(mdCol);

  // lg button
  const lgCol = frame('lg-col', 1, 1);
  lgCol.layoutMode='VERTICAL'; lgCol.itemSpacing=6; lgCol.fills=noFill();
  lgCol.primaryAxisSizingMode='AUTO'; lgCol.counterAxisSizingMode='AUTO';
  const lgLbl = await text('lg', { family:'Martian Mono', style:'Regular', size:9, color:DM, letterSpacing:6 });
  const lgBtn = frame('btn-lg', 1, 52);
  lgBtn.layoutMode='HORIZONTAL'; lgBtn.counterAxisAlignItems='CENTER';
  lgBtn.primaryAxisAlignItems='CENTER'; lgBtn.paddingLeft=lgBtn.paddingRight=28;
  lgBtn.primaryAxisSizingMode='AUTO'; lgBtn.counterAxisSizingMode='FIXED';
  lgBtn.cornerRadius=3; lgBtn.fills=fill(GO);
  lgBtn.appendChild(await text('START FREE', { family:'Martian Mono', style:'SemiBold', size:12, color:BG, letterSpacing:8 }));
  lgCol.appendChild(lgLbl); lgCol.appendChild(lgBtn); sizesRow.appendChild(lgCol);

  sec.appendChild(sizesRow);
  sg.appendChild(sec);
  yPos += sec.height + GAP;
}

// ── SECTION 04: INPUTS ──────────────────────────────────────
{
  const sec = frame('04 · Inputs', W, 1);
  sec.x = 0; sec.y = yPos;
  sec.fills = fill(BG);
  sec.layoutMode = 'VERTICAL';
  sec.paddingLeft = sec.paddingRight = PADDING;
  sec.paddingTop  = sec.paddingBottom = 40;
  sec.itemSpacing = 24;
  sec.primaryAxisSizingMode = 'AUTO';
  sec.counterAxisSizingMode = 'FIXED';
  sec.resize(W, 1);

  sec.appendChild(await sectionHeader('Inputs & Labels', 4));

  async function makeInput(lbl, placeholder, state) {
    const col = frame(`input-${lbl}`, 1, 1);
    col.layoutMode = 'VERTICAL';
    col.itemSpacing = 7;
    col.fills = noFill();
    col.primaryAxisSizingMode = 'AUTO';
    col.counterAxisSizingMode = 'AUTO';

    const labelT = await text(lbl.toUpperCase(), { family:'Martian Mono', style:'Medium', size:11, color:MU, letterSpacing:9 });
    col.appendChild(labelT);

    const inputF = frame(`inputbox-${lbl}`, 260, 44);
    inputF.cornerRadius = 2;
    inputF.layoutMode = 'HORIZONTAL';
    inputF.counterAxisAlignItems = 'CENTER';
    inputF.paddingLeft = inputF.paddingRight = 13;
    inputF.primaryAxisSizingMode = 'FIXED';
    inputF.counterAxisSizingMode = 'FIXED';
    inputF.fills = fill(SF2);

    const borderColor = state === 'error' ? RU : state === 'success' ? TE : BRH;
    inputF.strokes = [{type:'SOLID',color:hex(borderColor)}];
    inputF.strokeWeight = 1;
    inputF.strokeAlign = 'INSIDE';

    const pColor = state ? TX : DM;
    const pt = await text(placeholder, { family:'Barlow', style:'Regular', size:15, color:pColor });
    inputF.appendChild(pt);
    col.appendChild(inputF);
    return col;
  }

  const inputsRow = frame('Inputs Row', W - PADDING*2, 1);
  inputsRow.layoutMode = 'HORIZONTAL';
  inputsRow.itemSpacing = 20;
  inputsRow.fills = noFill();
  inputsRow.counterAxisAlignItems = 'MIN';
  inputsRow.primaryAxisSizingMode = 'AUTO';
  inputsRow.counterAxisSizingMode = 'AUTO';

  inputsRow.appendChild(await makeInput('Webhook URL', 'https://hooks.zapier.com/…', null));
  inputsRow.appendChild(await makeInput('Email address', 'you@company.com', null));
  inputsRow.appendChild(await makeInput('Error state', 'Sheet not found', 'error'));
  inputsRow.appendChild(await makeInput('Success state', 'CRM Import v2', 'success'));

  sec.appendChild(inputsRow);
  sg.appendChild(sec);
  yPos += sec.height + GAP;
}

// ── SECTION 05: TAGS ────────────────────────────────────────
{
  const sec = frame('05 · Tags', W, 1);
  sec.x = 0; sec.y = yPos;
  sec.fills = fill(BG);
  sec.layoutMode = 'VERTICAL';
  sec.paddingLeft = sec.paddingRight = PADDING;
  sec.paddingTop  = sec.paddingBottom = 40;
  sec.itemSpacing = 20;
  sec.primaryAxisSizingMode = 'AUTO';
  sec.counterAxisSizingMode = 'FIXED';
  sec.resize(W, 1);

  sec.appendChild(await sectionHeader('Tags & Badges', 5));

  async function makeTag(label, bgHex, textHex, borderHex) {
    const f = frame(`tag-${label}`, 1, 24);
    f.layoutMode = 'HORIZONTAL';
    f.counterAxisAlignItems = 'CENTER';
    f.primaryAxisAlignItems = 'CENTER';
    f.paddingLeft = f.paddingRight = 8;
    f.primaryAxisSizingMode = 'AUTO';
    f.counterAxisSizingMode = 'FIXED';
    f.cornerRadius = 2;
    f.fills = fill(bgHex, bgHex === 'transparent' ? 0 : 1);

    if (bgHex === 'transparent') f.fills = noFill();
    f.strokes = [{type:'SOLID',color:hex(borderHex)}];
    f.strokeWeight = 1; f.strokeAlign = 'INSIDE';

    const t = await text(label.toUpperCase(), { family:'Martian Mono', style:'Medium', size:10, color:textHex, letterSpacing:9 });
    f.appendChild(t);
    return f;
  }

  const tagsRow = frame('Tags Row', W - PADDING*2, 1);
  tagsRow.layoutMode = 'HORIZONTAL';
  tagsRow.itemSpacing = 10;
  tagsRow.fills = noFill();
  tagsRow.counterAxisAlignItems = 'CENTER';
  tagsRow.primaryAxisSizingMode = 'AUTO';
  tagsRow.counterAxisSizingMode = 'AUTO';

  tagsRow.appendChild(await makeTag('Active',   '#c98d1a22', GO, GO));
  tagsRow.appendChild(await makeTag('Synced',   '#5a9e8022', TE, TE));
  tagsRow.appendChild(await makeTag('Error',    '#cc603022', RU, RU));
  tagsRow.appendChild(await makeTag('Module 1', SF2, MU, BRH));
  tagsRow.appendChild(await makeTag('Beta',     'transparent', TX, BRH));
  tagsRow.appendChild(await makeTag('Founding', 'transparent', GO, GO));

  sec.appendChild(tagsRow);
  sg.appendChild(sec);
  yPos += sec.height + GAP;
}

// ── SECTION 06: CARDS ───────────────────────────────────────
{
  const sec = frame('06 · Cards', W, 1);
  sec.x = 0; sec.y = yPos;
  sec.fills = fill(BG);
  sec.layoutMode = 'VERTICAL';
  sec.paddingLeft = sec.paddingRight = PADDING;
  sec.paddingTop  = sec.paddingBottom = 40;
  sec.itemSpacing = 20;
  sec.primaryAxisSizingMode = 'AUTO';
  sec.counterAxisSizingMode = 'FIXED';
  sec.resize(W, 1);

  sec.appendChild(await sectionHeader('Cards', 6));

  async function makeCard(title, desc, tagLabel, tagBg, tagTxt, tagBorder, accentColor) {
    const card = frame(`card-${title}`, 270, 1);
    card.cornerRadius = 4;
    card.layoutMode = 'VERTICAL';
    card.paddingLeft = card.paddingRight = 18;
    card.paddingTop  = card.paddingBottom = 18;
    card.itemSpacing = 10;
    card.primaryAxisSizingMode = 'AUTO';
    card.counterAxisSizingMode = 'FIXED';

    // Accent gradient-ish: use bg with tint
    if (accentColor) {
      card.fills = fill(SF); // base
      card.strokes = [{type:'SOLID',color:hex(accentColor)}];
      card.strokeWeight = 1; card.strokeAlign = 'INSIDE';
    } else {
      card.fills = fill(SF);
      applyStroke(card, BRH);
    }

    const titleT = await text(title, { family:'Bricolage Grotesque', style:'SemiBold', size:17, color:TX, letterSpacing:-1, lineHeight:22 });
    const descT  = await text(desc,  { family:'Barlow', style:'Regular', size:13, color:MU, lineHeight:20, width:234 });

    // Tag
    const tagF = frame(`tag`, 1, 24);
    tagF.layoutMode = 'HORIZONTAL';
    tagF.counterAxisAlignItems = 'CENTER';
    tagF.paddingLeft = tagF.paddingRight = 8;
    tagF.primaryAxisSizingMode = 'AUTO';
    tagF.counterAxisSizingMode = 'FIXED';
    tagF.cornerRadius = 2;
    tagF.fills = tagBg ? fill(tagBg, 0.15) : noFill();
    tagF.strokes = [{type:'SOLID',color:hex(tagBorder)}];
    tagF.strokeWeight = 1; tagF.strokeAlign = 'INSIDE';
    tagF.appendChild(await text(tagLabel.toUpperCase(), { family:'Martian Mono', style:'Medium', size:10, color:tagTxt, letterSpacing:9 }));

    // Footer divider
    const div = rect('div', 234, 1, BR);

    card.appendChild(titleT);
    card.appendChild(descT);
    card.appendChild(tagF);
    card.appendChild(div);
    return card;
  }

  const cardsRow = frame('Cards Row', W - PADDING*2, 1);
  cardsRow.layoutMode = 'HORIZONTAL';
  cardsRow.itemSpacing = 16;
  cardsRow.fills = noFill();
  cardsRow.counterAxisAlignItems = 'MIN';
  cardsRow.primaryAxisSizingMode = 'AUTO';
  cardsRow.counterAxisSizingMode = 'AUTO';

  cardsRow.appendChild(await makeCard(
    'Inbound Sync', 'Map JSON to sheet columns. One task per Zap, regardless of row count.',
    'Active', TE, TE, TE, null
  ));
  cardsRow.appendChild(await makeCard(
    'Push to Webhook', 'Highlight rows, click Push. Instant delivery — no 15-min polling.',
    'New', GO, GO, GO, GO
  ));
  cardsRow.appendChild(await makeCard(
    'Sync Failed', 'Last attempt 3 minutes ago. Sheet permissions may have changed.',
    'Error', RU, RU, RU, RU
  ));
  cardsRow.appendChild(await makeCard(
    'Last Push', '1,247 rows delivered to CRM Import sheet. 1 Zapier task used.',
    '247 tasks saved', TE, TE, TE, TE
  ));

  sec.appendChild(cardsRow);
  sg.appendChild(sec);
  yPos += sec.height + GAP;
}

// ── SECTION 07: DO / DON'T ──────────────────────────────────
{
  const sec = frame('07 · Do / Don\'t', W, 1);
  sec.x = 0; sec.y = yPos;
  sec.fills = fill(BG);
  sec.layoutMode = 'VERTICAL';
  sec.paddingLeft = sec.paddingRight = PADDING;
  sec.paddingTop  = sec.paddingBottom = 40;
  sec.itemSpacing = 20;
  sec.primaryAxisSizingMode = 'AUTO';
  sec.counterAxisSizingMode = 'FIXED';
  sec.resize(W, 1);

  sec.appendChild(await sectionHeader('Do / Don\'t', 7));

  const cols = frame('DD Cols', W - PADDING*2, 1);
  cols.layoutMode = 'HORIZONTAL';
  cols.itemSpacing = 16;
  cols.fills = noFill();
  cols.counterAxisAlignItems = 'MIN';
  cols.primaryAxisSizingMode = 'FIXED';
  cols.counterAxisSizingMode = 'AUTO';
  const colW = (W - PADDING*2 - 16) / 2;

  async function ddCol(items, isGood) {
    const col = frame(`dd-${isGood?'do':'dont'}`, colW, 1);
    col.cornerRadius = 4;
    col.layoutMode = 'VERTICAL';
    col.paddingLeft = col.paddingRight = 18;
    col.paddingTop  = col.paddingBottom = 18;
    col.itemSpacing = 0;
    col.primaryAxisSizingMode = 'AUTO';
    col.counterAxisSizingMode = 'FIXED';
    col.fills = fill(isGood ? TE : RU, 0.08);
    col.strokes = [{type:'SOLID',color:hex(isGood ? TE : RU), opacity:0.3}];
    col.strokeWeight = 1; col.strokeAlign = 'INSIDE';

    const hdr = await text(isGood ? 'DO' : 'DON\'T', {
      family:'Martian Mono', style:'Medium', size:10,
      color: isGood ? TE : RU, letterSpacing:10
    });
    col.appendChild(hdr);

    const spacer2 = rect('s', 1, 12); spacer2.fills = noFill();
    col.appendChild(spacer2);

    for (let i = 0; i < items.length; i++) {
      const row = frame(`ddr-${i}`, colW - 36, 1);
      row.layoutMode = 'VERTICAL';
      row.paddingTop = row.paddingBottom = 8;
      row.fills = noFill();
      row.primaryAxisSizingMode = 'AUTO';
      row.counterAxisSizingMode = 'FIXED';
      if (i > 0) {
        const divLine = rect('div', colW-36, 1, BR);
        row.appendChild(divLine);
      }
      const itemT = await text(items[i], { family:'Barlow', style:'Regular', size:13, color:TX, lineHeight:19, width:colW-36 });
      row.appendChild(itemT);
      col.appendChild(row);
    }
    return col;
  }

  const doItems = [
    'One gold word per heading — exactly one',
    'Martian Mono for all buttons, labels, nav, data',
    'Rust for problems/errors · Teal for success',
    'Weight + colour for emphasis — never italic',
    'Max 4px border-radius on any element',
    'Gold focus ring on all interactive elements',
    'Min 44px touch targets on interactive elements',
    'CSS variables for every colour — no hardcoded hex',
  ];
  const dontItems = [
    'Multiple coloured words in a single heading',
    'Inter, DM Sans, Space Grotesk — wrong aesthetic',
    'Italic — ever, in any context',
    'Border-radius above 4px (no soft rounded cards)',
    'Gold fills on non-primary/secondary actions',
    'Colour as the only distinguishing signal',
    'Animations without prefers-reduced-motion guard',
    'Hardcoded colours — defeats light/dark theming',
  ];

  cols.appendChild(await ddCol(doItems,   true));
  cols.appendChild(await ddCol(dontItems, false));
  sec.appendChild(cols);
  sg.appendChild(sec);
  yPos += sec.height + GAP;
}

// ── 4. TOKENS JSON PAGE ─────────────────────────────────────
figma.notify('Building tokens JSON page…');

let tokensPage = figma.root.children.find(p => p.name === 'Tokens JSON');
if (!tokensPage) {
  tokensPage = figma.createPage();
  tokensPage.name = 'Tokens JSON';
}

const tokensJson = {
  "$schema": "https://styledictionary.com/reference/interfaces/designtoken/",
  "color": {
    "background":   { "dark": {"$value":"#1a1510","$type":"color"}, "light": {"$value":"#f2ede4","$type":"color"} },
    "surface":      { "dark": {"$value":"#231c14","$type":"color"}, "light": {"$value":"#e8e1d6","$type":"color"} },
    "surface-2":    { "dark": {"$value":"#2c2418","$type":"color"}, "light": {"$value":"#ded6c8","$type":"color"} },
    "border":       { "dark": {"$value":"#3a3020","$type":"color"}, "light": {"$value":"#ccc0ac","$type":"color"} },
    "border-hover": { "dark": {"$value":"#4e4030","$type":"color"}, "light": {"$value":"#b8a894","$type":"color"} },
    "text":         { "dark": {"$value":"#e8dfd0","$type":"color"}, "light": {"$value":"#1e1510","$type":"color"} },
    "muted":        { "dark": {"$value":"#907e68","$type":"color"}, "light": {"$value":"#6a5a48","$type":"color"} },
    "dim":          { "dark": {"$value":"#7a6a58","$type":"color"}, "light": {"$value":"#a89078","$type":"color"} },
    "gold":         { "dark": {"$value":"#c98d1a","$type":"color"}, "light": {"$value":"#8a6010","$type":"color"} },
    "rust":         { "dark": {"$value":"#cc6030","$type":"color"}, "light": {"$value":"#a83e18","$type":"color"} },
    "teal":         { "dark": {"$value":"#5a9e80","$type":"color"}, "light": {"$value":"#2a6a4c","$type":"color"} }
  },
  "spacing": {
    "xs":  {"$value":4,  "$type":"dimension"},
    "sm":  {"$value":8,  "$type":"dimension"},
    "md":  {"$value":16, "$type":"dimension"},
    "lg":  {"$value":24, "$type":"dimension"},
    "xl":  {"$value":40, "$type":"dimension"}
  },
  "borderRadius": {
    "sm":   {"$value":2, "$type":"dimension"},
    "md":   {"$value":3, "$type":"dimension"},
    "card": {"$value":4, "$type":"dimension"}
  },
  "typography": {
    "display":   {"$type":"typography","$value":{"fontFamily":"Bricolage Grotesque","fontWeight":700,"fontSize":"52px","lineHeight":"52px","letterSpacing":"-0.02em"}},
    "h1":        {"$type":"typography","$value":{"fontFamily":"Bricolage Grotesque","fontWeight":700,"fontSize":"32px","lineHeight":"36px","letterSpacing":"-0.02em"}},
    "h2":        {"$type":"typography","$value":{"fontFamily":"Bricolage Grotesque","fontWeight":700,"fontSize":"22px","lineHeight":"26px","letterSpacing":"-0.02em"}},
    "h3":        {"$type":"typography","$value":{"fontFamily":"Bricolage Grotesque","fontWeight":600,"fontSize":"17px","lineHeight":"22px","letterSpacing":"-0.01em"}},
    "body":      {"$type":"typography","$value":{"fontFamily":"Barlow","fontWeight":400,"fontSize":"15px","lineHeight":"24px","letterSpacing":"0"}},
    "body-sm":   {"$type":"typography","$value":{"fontFamily":"Barlow","fontWeight":400,"fontSize":"13px","lineHeight":"20px","letterSpacing":"0"}},
    "label":     {"$type":"typography","$value":{"fontFamily":"Martian Mono","fontWeight":500,"fontSize":"11px","lineHeight":"16px","letterSpacing":"0.08em","textTransform":"uppercase"}},
    "caption":   {"$type":"typography","$value":{"fontFamily":"Martian Mono","fontWeight":400,"fontSize":"10px","lineHeight":"14px","letterSpacing":"0.06em","textTransform":"uppercase"}},
    "code":      {"$type":"typography","$value":{"fontFamily":"Martian Mono","fontWeight":400,"fontSize":"12px","lineHeight":"20px","letterSpacing":"0"}}
  }
};

// Add JSON as a text block on the tokens page
const prevPage = figma.currentPage;
figma.currentPage = tokensPage;
for (const n of [...tokensPage.children]) n.remove();

const jsonFrame = frame('Tokens JSON (W3C DTCG + Token Studio)', 900, 1);
jsonFrame.x = 0; jsonFrame.y = 0;
jsonFrame.fills = fill('#1a1510');
jsonFrame.cornerRadius = 4;
jsonFrame.layoutMode = 'VERTICAL';
jsonFrame.paddingLeft = jsonFrame.paddingRight = 32;
jsonFrame.paddingTop  = jsonFrame.paddingBottom = 32;
jsonFrame.primaryAxisSizingMode = 'AUTO';
jsonFrame.counterAxisSizingMode = 'FIXED';

const headerT = await text('BSS TOKENS · W3C DTCG FORMAT · Token Studio Compatible', {
  family:'Martian Mono', style:'Medium', size:10, color:'#c98d1a', letterSpacing:10
});
jsonFrame.appendChild(headerT);

const subT = await text('Import via Token Studio plugin → Load from JSON → paste contents of tokens.json', {
  family:'Barlow', style:'Regular', size:13, color:'#907e68', lineHeight:20
});
jsonFrame.appendChild(subT);

const divRectJ = rect('div', 836, 1, '#3a3020');
jsonFrame.appendChild(divRectJ);
const spacerJ = rect('spacer', 1, 8); spacerJ.fills=noFill(); jsonFrame.appendChild(spacerJ);

await loadFont('Martian Mono', 'Regular');
const jsonT = figma.createText();
jsonT.fontName = {family:'Martian Mono', style:'Regular'};
jsonT.fontSize = 11;
jsonT.fills = fill('#e8dfd0');
jsonT.textAutoResize = 'HEIGHT';
jsonT.resize(836, 100);
jsonT.lineHeight = {value:18, unit:'PIXELS'};
jsonT.characters = JSON.stringify(tokensJson, null, 2);
jsonFrame.appendChild(jsonT);
tokensPage.appendChild(jsonFrame);

figma.currentPage = sg;

// ── DONE ────────────────────────────────────────────────────
figma.viewport.scrollAndZoomIntoView(sg.children);
figma.notify('BSS Style Guide built! Variables, text styles, and Tokens JSON page all ready.', {timeout:6000});

})();