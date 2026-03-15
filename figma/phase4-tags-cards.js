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
  figma.notify('Phase 4: Tags & Cards…');
  await figma.loadFontAsync({family:'Martian Mono',style:'Medium'});
  await figma.loadFontAsync({family:'Martian Mono',style:'Regular'});
  await figma.loadFontAsync({family:'Bricolage Grotesque',style:'SemiBold'});
  await figma.loadFontAsync({family:'Barlow',style:'Regular'});

  // ── TAGS ──────────────────────────────────────────────────
  clearSection('05 · Tags');
  const tsec=section('05 · Tags');
  tsec.appendChild(await sectionHeader('Tags & Badges',5));

  async function tag(label,bgHex,bgA,txtHex,borderHex){
    const f=fr(`tag-${label}`); f.cornerRadius=2;
    f.layoutMode='HORIZONTAL'; f.counterAxisAlignItems='CENTER'; f.primaryAxisAlignItems='CENTER';
    f.paddingLeft=f.paddingRight=8; f.primaryAxisSizingMode='AUTO'; f.counterAxisSizingMode='FIXED';
    f.resize(60,24);
    f.fills=bgHex?fill(bgHex,bgA):noFill();
    applyStroke(f,borderHex);
    f.appendChild(await tx(label,'Martian Mono','Medium',10,txtHex,{ls:9,upper:true}));
    return f;
  }

  tsec.appendChild(await subLabel('Variants'));
  const trow=hrow('tag-variants',10); trow.counterAxisAlignItems='CENTER';
  trow.appendChild(await tag('Active',  D.go,0.15,D.go,D.go));
  trow.appendChild(await tag('Synced',  D.te,0.15,D.te,D.te));
  trow.appendChild(await tag('Error',   D.ru,0.15,D.ru,D.ru));
  trow.appendChild(await tag('Module 1',D.sf2,1,D.mu,D.brh));
  trow.appendChild(await tag('Beta',    null,0,D.tx,D.brh));
  trow.appendChild(await tag('Founding',null,0,D.go,D.go));
  tsec.appendChild(trow);

  figma.currentPage.appendChild(tsec);

  // ── CARDS ─────────────────────────────────────────────────
  clearSection('06 · Cards');
  const csec=section('06 · Cards');
  csec.appendChild(await sectionHeader('Cards',6));

  async function card(title,desc,tagLabel,tagColor,accentColor,bgTint){
    const c=fr(`card-${title}`,270); c.cornerRadius=4; c.clipsContent=false;
    c.layoutMode='VERTICAL'; c.paddingLeft=c.paddingRight=18;
    c.paddingTop=c.paddingBottom=18; c.itemSpacing=10;
    c.primaryAxisSizingMode='AUTO'; c.counterAxisSizingMode='FIXED';
    if(bgTint){ c.fills=[{type:'SOLID',color:hex(bgTint),opacity:0.07},{type:'SOLID',color:hex(D.sf)}]; }
    else c.fills=fill(D.sf);
    applyStroke(c,accentColor||D.brh);
    c.appendChild(await tx(title,'Bricolage Grotesque','SemiBold',17,D.tx,{ls:-1,lh:22}));
    c.appendChild(await tx(desc,'Barlow','Regular',13,D.mu,{lh:20,w:234}));
    const tf=fr('ctag'); tf.cornerRadius=2;
    tf.layoutMode='HORIZONTAL'; tf.counterAxisAlignItems='CENTER'; tf.primaryAxisAlignItems='CENTER';
    tf.paddingLeft=tf.paddingRight=8; tf.primaryAxisSizingMode='AUTO'; tf.counterAxisSizingMode='FIXED';
    tf.resize(60,24); tf.fills=fill(tagColor,0.15); applyStroke(tf,tagColor);
    tf.appendChild(await tx(tagLabel,'Martian Mono','Medium',10,tagColor,{ls:9,upper:true}));
    c.appendChild(tf);
    c.appendChild(rct('div',234,1,D.br));
    return c;
  }

  const crow=hrow('cards',16); crow.counterAxisAlignItems='MIN';
  crow.appendChild(await card('Inbound Sync',   'Map JSON to sheet columns. One task per Zap, regardless of row count.',   'Active', D.te,D.te,null));
  crow.appendChild(await card('Push to Webhook','Highlight rows, click Push. Instant delivery — no 15-min polling.',       'New',    D.go,D.go,D.go));
  crow.appendChild(await card('Sync Failed',    'Last attempt 3 minutes ago. Sheet permissions may have changed.',         'Error',  D.ru,D.ru,D.ru));
  crow.appendChild(await card('Last Push',      '1,247 rows delivered to CRM Import sheet. 1 Zapier task used.',           'Synced', D.te,D.te,D.te));
  csec.appendChild(crow);

  figma.currentPage.appendChild(csec);
  restack();
  figma.viewport.scrollAndZoomIntoView([tsec,csec]);
  figma.notify('Phase 4 done ✓  Run Phase 5 next.');
})();
