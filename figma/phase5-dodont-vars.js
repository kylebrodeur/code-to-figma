// ── SHARED HELPERS (included in every phase) ──────────────
const FILE_W = 1200, PAD = 48;
const T = {
  dark:  { bg:'#1a1510',sf:'#231c14',sf2:'#2c2418',br:'#3a3020',brh:'#4e4030',tx:'#e8dfd0',mu:'#907e68',dm:'#7a6a58',go:'#c98d1a',ru:'#cc6030',te:'#5a9e80' },
  light: { bg:'#f2ede4',sf:'#e8e1d6',sf2:'#ded6c8',br:'#ccc0ac',brh:'#b8a894',tx:'#1e1510',mu:'#6a5a48',dm:'#a89078',go:'#8a6010',ru:'#a83e18',te:'#2a6a4c' }
};
const D = T.dark;

function hex(h){ const s=h.replace('#',''); return {r:parseInt(s.slice(0,2),16)/255,g:parseInt(s.slice(2,4),16)/255,b:parseInt(s.slice(4,6),16)/255}; }
function fill(h,a=1){ return [{type:'SOLID',color:hex(h),opacity:a}]; }
function noFill(){ return []; }
function applyStroke(node,h,w=1){ node.strokes=[{type:'SOLID',color:hex(h)}]; node.strokeWeight=w; node.strokeAlign='INSIDE'; }

function fr(name,w){ const f=figma.createFrame(); f.name=name; f.fills=noFill(); if(w) f.resize(w,100); return f; }
function rct(name,w,h,c){ const r=figma.createRectangle(); r.name=name; r.resize(w,h); r.fills=c?fill(c):noFill(); return r; }

function section(name){ 
  const s=fr(name,FILE_W); 
  s.layoutMode='VERTICAL'; s.primaryAxisSizingMode='AUTO'; s.counterAxisSizingMode='FIXED';
  s.paddingLeft=s.paddingRight=PAD; s.paddingTop=s.paddingBottom=40; s.itemSpacing=20;
  s.fills=fill(D.bg); return s; 
}

function hrow(name,gap=12){ 
  const f=fr(name); f.layoutMode='HORIZONTAL'; f.primaryAxisSizingMode='AUTO'; 
  f.counterAxisSizingMode='AUTO'; f.itemSpacing=gap; f.fills=noFill(); return f; 
}

function vcol(name,gap=6){ 
  const f=fr(name); f.layoutMode='VERTICAL'; f.primaryAxisSizingMode='AUTO'; 
  f.counterAxisSizingMode='AUTO'; f.itemSpacing=gap; f.fills=noFill(); return f; 
}

async function tx(str,fam,sty,sz,col,opts={}){
  const t=figma.createText();
  t.fontName={family:fam,style:sty}; t.fontSize=sz;
  t.fills=fill(col);
  if(opts.ls) t.letterSpacing={value:opts.ls,unit:'PERCENT'};
  if(opts.lh) t.lineHeight={value:opts.lh,unit:'PIXELS'};
  if(opts.w){ t.textAutoResize='HEIGHT'; t.resize(opts.w,50); }
  else t.textAutoResize='WIDTH_AND_HEIGHT';
  if(opts.upper) t.textCase='UPPER';
  t.characters=str; return t;
}

async function sectionHeader(label,num){
  const row=hrow(`SH-${num}`,12);
  row.counterAxisAlignItems='CENTER';
  row.primaryAxisSizingMode='FIXED'; row.counterAxisSizingMode='AUTO';
  row.resize(FILE_W-PAD*2,40);
  row.appendChild(await tx(`0${num}`,'Martian Mono','Medium',11,D.go,{ls:14}));
  row.appendChild(await tx(label.toUpperCase(),'Martian Mono','Medium',11,D.mu,{ls:14}));
  const line=rct('line',FILE_W-PAD*2-220,1,D.br); row.appendChild(line);
  return row;
}

function subLabel(str){ return tx(str,'Martian Mono','Regular',9,D.dm,{ls:8}); }

function clearSection(name){
  const pg=figma.currentPage;
  const existing=pg.children.filter(n=>n.name===name);
  existing.forEach(n=>n.remove());
}

function restack(){
  const pg=figma.currentPage;
  const frames=pg.children.filter(n=>n.type==='FRAME').sort((a,b)=>a.y-b.y);
  let y=0;
  for(const f of frames){ f.x=0; f.y=y; y+=f.height+80; }
}

(async()=>{
  figma.notify("Phase 5: Do/Don't + Variables + Text Styles…");
  await figma.loadFontAsync({family:'Martian Mono',style:'Medium'});
  await figma.loadFontAsync({family:'Martian Mono',style:'Regular'});
  await figma.loadFontAsync({family:'Barlow',style:'Regular'});
  await figma.loadFontAsync({family:'Bricolage Grotesque',style:'Bold'});
  await figma.loadFontAsync({family:'Bricolage Grotesque',style:'SemiBold'});

  // ── DO / DON'T ────────────────────────────────────────────
  clearSection('07 · Do / Don\'t');
  const dsec=section('07 · Do / Don\'t');
  dsec.appendChild(await sectionHeader('Do / Don\'t',7));

  const colW=Math.floor((FILE_W-PAD*2-16)/2);

  async function ddCol(items,isGood){
    const col=fr(isGood?'do-col':'dont-col',colW); col.cornerRadius=4;
    col.layoutMode='VERTICAL'; col.paddingLeft=col.paddingRight=18;
    col.paddingTop=col.paddingBottom=18; col.itemSpacing=0;
    col.primaryAxisSizingMode='AUTO'; col.counterAxisSizingMode='FIXED';
    col.fills=fill(isGood?D.te:D.ru,0.08);
    applyStroke(col,isGood?D.te:D.ru);
    col.appendChild(await tx(isGood?'DO':'DON\'T','Martian Mono','Medium',10,isGood?D.te:D.ru,{ls:10}));
    col.appendChild(rct('gap',1,10));
    for(let i=0;i<items.length;i++){
      if(i>0) col.appendChild(rct('div',colW-36,1,D.br));
      const row=fr(`ddr-${i}`,colW-36); row.layoutMode='VERTICAL';
      row.paddingTop=row.paddingBottom=8; row.fills=noFill();
      row.primaryAxisSizingMode='AUTO'; row.counterAxisSizingMode='FIXED';
      row.appendChild(await tx(items[i],'Barlow','Regular',13,D.tx,{lh:19,w:colW-36}));
      col.appendChild(row);
    }
    return col;
  }

  const ddrow=hrow('dodont',16); ddrow.counterAxisAlignItems='MIN';
  ddrow.primaryAxisSizingMode='FIXED'; ddrow.counterAxisSizingMode='AUTO';
  ddrow.resize(FILE_W-PAD*2,100);
  ddrow.appendChild(await ddCol([
    'One gold word per heading — exactly one',
    'Martian Mono for all buttons, labels, nav, data',
    'Rust for problems · Teal for success/after states',
    'Weight + colour for emphasis — never italic',
    'Max 4px border-radius on any element',
    'Gold focus ring on all interactive elements',
    'Min 44px touch targets on interactive elements',
    'CSS variables for every colour — no hardcoded hex',
  ],true));
  ddrow.appendChild(await ddCol([
    'Multiple coloured words in one heading',
    'Inter, DM Sans, Space Grotesk — wrong aesthetic',
    'Italic — ever, in any context',
    'Border-radius above 4px on any component',
    'Gold fills on non-primary/secondary actions',
    'Colour as the only distinguishing signal',
    'Animations without prefers-reduced-motion guard',
    'Hardcoded colours — defeats light/dark theming',
  ],false));
  dsec.appendChild(ddrow);
  figma.currentPage.appendChild(dsec);
  restack();

  // ── VARIABLE COLLECTION ───────────────────────────────────
  figma.notify('Creating variables…');
  try {
    const existing=figma.variables.getLocalVariableCollections().find(c=>c.name==='BSS Tokens');
    if(existing) existing.remove();

    const coll=figma.variables.createVariableCollection('BSS Tokens');
    coll.renameMode(coll.modes[0].modeId,'Dark');
    const lightId=coll.addMode('Light');
    const darkId=coll.modes[0].modeId;

    const defs=[
      ['color/background',  D.bg,   T.light.bg],
      ['color/surface',     D.sf,   T.light.sf],
      ['color/surface-2',   D.sf2,  T.light.sf2],
      ['color/border',      D.br,   T.light.br],
      ['color/border-hover',D.brh,  T.light.brh],
      ['color/text',        D.tx,   T.light.tx],
      ['color/muted',       D.mu,   T.light.mu],
      ['color/dim',         D.dm,   T.light.dm],
      ['color/gold',        D.go,   T.light.go],
      ['color/rust',        D.ru,   T.light.ru],
      ['color/teal',        D.te,   T.light.te],
    ];
    for(const [name,dark,light] of defs){
      const v=figma.variables.createVariable(name,coll,'COLOR');
      v.setValueForMode(darkId,hex(dark));
      v.setValueForMode(lightId,hex(light));
    }
    const floats=[
      ['spacing/xs',4],['spacing/sm',8],['spacing/md',16],['spacing/lg',24],['spacing/xl',40],
      ['radius/sm',2],['radius/md',3],['radius/card',4],
      ['font-size/label',11],['font-size/small',13],['font-size/body',15],
      ['font-size/h3',17],['font-size/h2',22],['font-size/h1',32],['font-size/display',52],
    ];
    for(const [name,val] of floats){
      const v=figma.variables.createVariable(name,coll,'FLOAT');
      v.setValueForMode(darkId,val); v.setValueForMode(lightId,val);
    }
  } catch(e){ console.warn('Variables:',e.message); }

  // ── TEXT STYLES ────────────────────────────────────────────
  const styles=[
    ['BSS/Display',   'Bricolage Grotesque','Bold',    52,-2,52],
    ['BSS/H1',        'Bricolage Grotesque','Bold',    32,-2,36],
    ['BSS/H2',        'Bricolage Grotesque','Bold',    22,-2,26],
    ['BSS/H3',        'Bricolage Grotesque','SemiBold',17,-1,22],
    ['BSS/Body',      'Barlow',            'Regular', 15, 0,24],
    ['BSS/Body Small','Barlow',            'Regular', 13, 0,20],
    ['BSS/Label',     'Martian Mono',      'Medium',  11, 8,16],
    ['BSS/Caption',   'Martian Mono',      'Regular', 10, 6,14],
    ['BSS/Code',      'Martian Mono',      'Regular', 12, 0,20],
  ];
  for(const [name,fam,sty,sz,ls,lh] of styles){
    try {
      const s=figma.createTextStyle(); s.name=name;
      s.fontName={family:fam,style:sty}; s.fontSize=sz;
      s.letterSpacing={value:ls,unit:'PERCENT'};
      s.lineHeight={value:lh,unit:'PIXELS'};
    } catch(e){ console.warn('Style',name,e.message); }
  }

  figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);
  figma.notify('Phase 5 done ✓  All sections, variables, and text styles built!',{timeout:8000});
})();
