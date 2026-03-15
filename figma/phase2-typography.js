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
  figma.notify('Phase 2: Typography…');
  await figma.loadFontAsync({family:'Bricolage Grotesque',style:'Bold'});
  await figma.loadFontAsync({family:'Bricolage Grotesque',style:'SemiBold'});
  await figma.loadFontAsync({family:'Barlow',style:'Regular'});
  await figma.loadFontAsync({family:'Martian Mono',style:'Regular'});
  await figma.loadFontAsync({family:'Martian Mono',style:'Medium'});

  clearSection('02 · Typography');
  const sec=section('02 · Typography');
  sec.appendChild(await sectionHeader('Typography',2));

  const rows=[
    {meta:'52px · Display\nBricolage Bold',   fam:'Bricolage Grotesque',sty:'Bold',    sz:52,sample:'500 rows, ',accent:'1 task.',ls:-2,lh:52},
    {meta:'32px · H1\nBricolage Bold',         fam:'Bricolage Grotesque',sty:'Bold',    sz:32,sample:'Stop paying per ',accent:'row.',ls:-2,lh:36},
    {meta:'22px · H2\nBricolage Bold',         fam:'Bricolage Grotesque',sty:'Bold',    sz:22,sample:'Column ',accent:'Mapping',ls:-2,lh:26},
    {meta:'17px · H3\nBricolage SemiBold',     fam:'Bricolage Grotesque',sty:'SemiBold',sz:17,sample:'Push to Webhook',accent:'',ls:-1,lh:22},
    {meta:'15px · Body\nBarlow Regular',       fam:'Barlow',sty:'Regular',sz:15,sample:'One Zapier task processes your entire JSON array. 500 rows, 1 task.',accent:'',ls:0,lh:24},
    {meta:'13px · Small body\nBarlow Regular', fam:'Barlow',sty:'Regular',sz:13,sample:'Mapping rules stored. Data processed in RAM only — never logged.',accent:'',ls:0,lh:20},
    {meta:'11px · Label\nMartian Mono Medium', fam:'Martian Mono',sty:'Medium',sz:11,sample:'FOUNDING MEMBER RATE',accent:'',ls:8,lh:16,color:D.go},
    {meta:'12px · Code\nMartian Mono Regular', fam:'Martian Mono',sty:'Regular',sz:12,sample:'POST /api/sync  → 200 OK · 1 task consumed',accent:'',ls:0,lh:20},
  ];

  for(const row of rows){
    const div=rct('div',FILE_W-PAD*2,1,D.br);
    sec.appendChild(div);
    const r=hrow(`type-${row.sz}`,24); r.counterAxisAlignItems='MIN';
    r.primaryAxisSizingMode='FIXED'; r.counterAxisSizingMode='AUTO';
    r.resize(FILE_W-PAD*2,100); r.paddingTop=r.paddingBottom=14;

    r.appendChild(await tx(row.meta,'Martian Mono','Regular',9,D.dm,{ls:6,lh:14,w:140}));

    const t=figma.createText();
    t.fontName={family:row.fam,style:row.sty}; t.fontSize=row.sz;
    t.fills=fill(row.color||D.tx);
    t.letterSpacing={value:row.ls,unit:'PERCENT'};
    t.lineHeight={value:row.lh,unit:'PIXELS'};
    t.textAutoResize='WIDTH_AND_HEIGHT';
    t.characters=row.sample+(row.accent||'');
    if(row.accent&&row.accent.length>0){
      t.setRangeFills(row.sample.length,row.sample.length+row.accent.length,fill(D.go));
    }
    r.appendChild(t); sec.appendChild(r);
  }

  figma.currentPage.appendChild(sec);
  restack();
  figma.viewport.scrollAndZoomIntoView([sec]);
  figma.notify('Phase 2 done ✓  Run Phase 3 next.');
})();
