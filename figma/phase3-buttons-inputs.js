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
  figma.notify('Phase 3: Buttons & Inputs…');
  await figma.loadFontAsync({family:'Martian Mono',style:'SemiBold'});
  await figma.loadFontAsync({family:'Martian Mono',style:'Medium'});
  await figma.loadFontAsync({family:'Martian Mono',style:'Regular'});
  await figma.loadFontAsync({family:'Barlow',style:'Regular'});

  // ── BUTTONS ───────────────────────────────────────────────
  clearSection('03 · Buttons');
  const bsec=section('03 · Buttons');
  bsec.appendChild(await sectionHeader('Buttons',3));

  async function btn(label,bgHex,txtHex,borderHex,h=44){
    const f=fr(`btn-${label}`); f.cornerRadius=3;
    f.layoutMode='HORIZONTAL'; f.counterAxisAlignItems='CENTER'; f.primaryAxisAlignItems='CENTER';
    f.paddingLeft=f.paddingRight=18; f.primaryAxisSizingMode='AUTO'; f.counterAxisSizingMode='FIXED';
    f.resize(100,h); f.fills=bgHex?fill(bgHex):noFill();
    if(borderHex) applyStroke(f,borderHex);
    f.appendChild(await tx(label,'Martian Mono','SemiBold',11,txtHex,{ls:8,upper:true}));
    return f;
  }

  async function btnCol(colLabel,btnLabel,bg,txt,border,h=44){
    const col=vcol(`bc-${colLabel}`,6);
    col.appendChild(await tx(colLabel,'Martian Mono','Regular',9,D.dm,{ls:6}));
    col.appendChild(await btn(btnLabel,bg,txt,border,h));
    return col;
  }

  bsec.appendChild(await subLabel('Variants'));
  const vrow=hrow('variants',14); vrow.counterAxisAlignItems='MIN';
  vrow.appendChild(await btnCol('Primary',    'Get started', D.go,D.bg,D.go));
  vrow.appendChild(await btnCol('Secondary',  'Cancel',      null,D.tx,D.brh));
  vrow.appendChild(await btnCol('Destructive','Delete',      D.ru,D.bg,D.ru));
  vrow.appendChild(await btnCol('Outline',    'View docs',   null,D.go,D.go));
  vrow.appendChild(await btnCol('Ghost',      'Skip',        null,D.tx,null));
  bsec.appendChild(vrow);

  bsec.appendChild(await subLabel('Sizes'));
  const srow=hrow('sizes',14); srow.counterAxisAlignItems='MIN';
  srow.appendChild(await btnCol('sm',          'Push rows',  D.go,D.bg,D.go,44));
  srow.appendChild(await btnCol('md · default','Sync now',   D.go,D.bg,D.go,44));
  srow.appendChild(await btnCol('lg',          'Start free', D.go,D.bg,D.go,52));
  bsec.appendChild(srow);

  bsec.appendChild(await subLabel('States'));
  const strow=hrow('states',14); strow.counterAxisAlignItems='MIN';
  strow.appendChild(await btnCol('Default', 'Sync mapping',D.go,D.bg,D.go));
  const dis=await btnCol('Disabled','Sync mapping',D.go,D.bg,D.go);
  dis.opacity=0.4; strow.appendChild(dis);
  strow.appendChild(await btnCol('Outline', 'Verified',    null,D.go,D.go));
  bsec.appendChild(strow);

  figma.currentPage.appendChild(bsec);

  // ── INPUTS ────────────────────────────────────────────────
  clearSection('04 · Inputs');
  const isec=section('04 · Inputs');
  isec.appendChild(await sectionHeader('Inputs & Labels',4));

  async function inputField(lbl,placeholder,state){
    const col=vcol(`field-${lbl}`,7);
    col.appendChild(await tx(lbl,'Martian Mono','Medium',11,D.mu,{ls:9,upper:true}));
    const box=fr(`input-${lbl}`); box.cornerRadius=2;
    box.layoutMode='HORIZONTAL'; box.counterAxisAlignItems='CENTER';
    box.paddingLeft=box.paddingRight=13;
    box.primaryAxisSizingMode='FIXED'; box.counterAxisSizingMode='FIXED';
    box.resize(260,44); box.fills=fill(D.sf2);
    const bc=state==='error'?D.ru:state==='success'?D.te:D.brh;
    applyStroke(box,bc);
    box.appendChild(await tx(placeholder,'Barlow','Regular',15,state?D.tx:D.dm));
    col.appendChild(box);
    return col;
  }

  const irow=hrow('inputs',20); irow.counterAxisAlignItems='MIN';
  irow.appendChild(await inputField('Webhook URL','https://hooks.zapier.com/…',null));
  irow.appendChild(await inputField('Email address','you@company.com',null));
  irow.appendChild(await inputField('Error state','Sheet not found','error'));
  irow.appendChild(await inputField('Success state','CRM Import v2','success'));
  irow.appendChild(await inputField('Disabled','Read only',null));
  isec.appendChild(irow);

  figma.currentPage.appendChild(isec);
  restack();
  figma.viewport.scrollAndZoomIntoView([bsec,isec]);
  figma.notify('Phase 3 done ✓  Run Phase 4 next.');
})();
