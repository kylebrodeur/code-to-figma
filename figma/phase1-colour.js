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
  figma.notify('Phase 1: Colour…');
  await figma.loadFontAsync({family:'Martian Mono',style:'Regular'});
  await figma.loadFontAsync({family:'Martian Mono',style:'Medium'});

  clearSection('01 · Colour');
  const sec=section('01 · Colour');

  sec.appendChild(await sectionHeader('Colour Palette',1));

  const swatchRow = async (swatches, theme) => {
    const lbl = await tx(theme+' Theme','Martian Mono','Regular',9,D.dm,{ls:8});
    sec.appendChild(lbl);
    const row=hrow('swatches-'+theme,12);
    for(const sw of swatches){
      const card=fr(`sw-${sw.n}`,117); card.cornerRadius=4; card.clipsContent=true;
      card.layoutMode='VERTICAL'; card.primaryAxisSizingMode='FIXED'; card.counterAxisSizingMode='FIXED';
      card.resize(117,100); card.itemSpacing=0; card.fills=fill(D.sf); applyStroke(card,D.brh);
      const chip=rct('chip',117,52,sw.hex); card.appendChild(chip);
      const info=fr('info',117); info.layoutMode='VERTICAL'; info.paddingLeft=info.paddingRight=10;
      info.paddingTop=info.paddingBottom=8; info.itemSpacing=3; info.fills=fill(D.sf);
      info.primaryAxisSizingMode='FIXED'; info.counterAxisSizingMode='FIXED'; info.resize(117,48);
      info.appendChild(await tx(sw.n,'Martian Mono','Regular',9,D.mu,{ls:6}));
      info.appendChild(await tx(sw.hex,'Martian Mono','Medium',10,D.tx));
      card.appendChild(info); row.appendChild(card);
    }
    sec.appendChild(row);
  };

  await swatchRow([
    {n:'Background',hex:D.bg},{n:'Surface',hex:D.sf},{n:'Surface 2',hex:D.sf2},
    {n:'Text',hex:D.tx},{n:'Muted',hex:D.mu},{n:'Gold',hex:D.go},
    {n:'Rust',hex:D.ru},{n:'Teal',hex:D.te},{n:'Border',hex:D.br}
  ],'Dark');

  const L=T.light;
  await swatchRow([
    {n:'Background',hex:L.bg},{n:'Surface',hex:L.sf},{n:'Surface 2',hex:L.sf2},
    {n:'Text',hex:L.tx},{n:'Muted',hex:L.mu},{n:'Gold',hex:L.go},
    {n:'Rust',hex:L.ru},{n:'Teal',hex:L.te},{n:'Border',hex:L.br}
  ],'Light');

  figma.currentPage.appendChild(sec);
  restack();
  figma.viewport.scrollAndZoomIntoView([sec]);
  figma.notify('Phase 1 done ✓  Run Phase 2 next.');
})();
