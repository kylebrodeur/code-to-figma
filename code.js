figma.showUI(__html__, { width: 320, height: 600, title: 'BSS Design Builder' });

// ── TOKENS ────────────────────────────────────────────────────────────────────
var T = {
  dark: {
    bg:'#1a1510',sf:'#231c14',sf2:'#2c2418',br:'#3a3020',brh:'#4e4030',
    tx:'#e8dfd0',mu:'#907e68',dm:'#7a6a58',go:'#c98d1a',ru:'#cc6030',te:'#5a9e80',
    gd:'rgba(201,141,26,0.10)',gb:'rgba(201,141,26,0.28)',gg:'rgba(201,141,26,0.055)',
    rd:'rgba(204,96,48,0.10)',rb:'rgba(204,96,48,0.26)',
    td:'rgba(90,158,128,0.10)',tb:'rgba(90,158,128,0.26)'
  },
  light:{
    bg:'#f2ede4',sf:'#e8e1d6',sf2:'#ded6c8',br:'#ccc0ac',brh:'#b8a894',
    tx:'#1e1510',mu:'#6a5a48',dm:'#a89078',go:'#8a6010',ru:'#a83e18',te:'#2a6a4c'
  }
};
var D = T.dark;
// Figma widths — style guide 1200, landing page 1040 inner in 1440 frame
var W = 1440, SW = 1200;
// Exact section padding from HTML: section{padding:88px 0}
var LP_H = 88, LP_INNER = LP_H;
// Container inner = 1040px, centered in 1440px = 200px each side
var LP_PAD = 200;
// Style guide padding
var SG_PAD = 48;

// ── PRIMITIVES ────────────────────────────────────────────────────────────────
function hex(h){ var s=h.replace('#',''); return {r:parseInt(s.slice(0,2),16)/255,g:parseInt(s.slice(2,4),16)/255,b:parseInt(s.slice(4,6),16)/255}; }
function hexA(h,a){ var c=hex(h); return {r:c.r,g:c.g,b:c.b,a:a}; }
function fill(h,a){ if(a===undefined)a=1; return [{type:'SOLID',color:hex(h),opacity:a}]; }
function noFill(){ return []; }
function stroke(n,h,w){ if(w===undefined)w=1; n.strokes=[{type:'SOLID',color:hex(h)}]; n.strokeWeight=w; n.strokeAlign='INSIDE'; }

// Gradient fill matching CSS linear-gradient(140deg, color@alpha 0%, transparent 55%)
function gradFill(hx,alpha){
  return {type:'GRADIENT_LINEAR',
    gradientTransform:[[0.766,-0.643,0.322],[0.643,0.766,-0.205]],
    gradientStops:[{position:0,color:hexA(hx,alpha)},{position:0.55,color:hexA(hx,0)}]};
}
// Radial gradient (ellipse at center top) — approximated as top-center linear
function radialTopFill(hx,alpha){
  return {type:'GRADIENT_RADIAL',
    gradientTransform:[[0.5,0,0.25],[0,0.35,0]],
    gradientStops:[{position:0,color:hexA(hx,alpha)},{position:1,color:hexA(hx,0)}]};
}

function fr(name,w){ var f=figma.createFrame(); f.name=name; f.fills=noFill(); if(w)f.resize(w,100); return f; }
function rct(name,w,h,c){ var r=figma.createRectangle(); r.name=name; r.resize(w,h); r.fills=c?fill(c):noFill(); return r; }
function circ(name,d,c){ var r=figma.createEllipse(); r.name=name; r.resize(d,d); r.fills=c?fill(c):noFill(); return r; }

// Grid texture on section frames
function applyGrid(f){
  try{ var c=hex(D.br); f.layoutGrids=[{pattern:'GRID',sectionSize:48,visible:true,color:{r:c.r,g:c.g,b:c.b,a:0.055}}]; }catch(e){}
}

// ── LAYOUT HELPERS ────────────────────────────────────────────────────────────
function hrow(name,gap){ if(gap===undefined)gap=12; var f=fr(name); f.layoutMode='HORIZONTAL'; f.primaryAxisSizingMode='AUTO'; f.counterAxisSizingMode='AUTO'; f.itemSpacing=gap; f.fills=noFill(); return f; }
function vcol(name,gap){ if(gap===undefined)gap=8; var f=fr(name); f.layoutMode='VERTICAL'; f.primaryAxisSizingMode='AUTO'; f.counterAxisSizingMode='AUTO'; f.itemSpacing=gap; f.fills=noFill(); return f; }

// Section wrapper — matches HTML section{padding:88px 0} for LP, different for SG
function lpSec(name,bg){
  if(bg===undefined)bg=D.bg;
  var s=fr(name,W);
  s.layoutMode='VERTICAL'; s.primaryAxisSizingMode='AUTO'; s.counterAxisSizingMode='FIXED';
  s.paddingLeft=s.paddingRight=LP_PAD; s.paddingTop=s.paddingBottom=LP_H; s.itemSpacing=0;
  s.fills=fill(bg); applyGrid(s); return s;
}
function sgSec(name){
  var s=fr(name,SW);
  s.layoutMode='VERTICAL'; s.primaryAxisSizingMode='AUTO'; s.counterAxisSizingMode='FIXED';
  s.paddingLeft=s.paddingRight=SG_PAD; s.paddingTop=s.paddingBottom=48; s.itemSpacing=20;
  s.fills=fill(D.bg); applyGrid(s); return s;
}

// ── TEXT ──────────────────────────────────────────────────────────────────────
async function tx(str,fam,sty,sz,col,opts){
  if(!opts)opts={}; var t=figma.createText();
  t.fontName={family:fam,style:sty}; t.fontSize=sz; t.fills=fill(col);
  if(opts.ls)t.letterSpacing={value:opts.ls,unit:'PERCENT'};
  if(opts.lh)t.lineHeight={value:opts.lh,unit:'PIXELS'};
  if(opts.w){t.textAutoResize='HEIGHT';t.resize(opts.w,100);}
  else t.textAutoResize='WIDTH_AND_HEIGHT';
  if(opts.upper)t.textCase='UPPER';
  if(opts.align)t.textAlignHorizontal=opts.align;
  if(opts.strike)t.textDecoration='STRIKETHROUGH';
  t.characters=str; return t;
}
function mm(s,sz,col,opts){ return tx(s,'Martian Mono','Medium',sz,col,opts); }
function mmr(s,sz,col,opts){ return tx(s,'Martian Mono','Regular',sz,col,opts); }
function bg(s,sz,col,opts){ return tx(s,'Bricolage Grotesque','Bold',sz,col,opts); }
function bgsb(s,sz,col,opts){ return tx(s,'Bricolage Grotesque','SemiBold',sz,col,opts); }
function bar(s,sz,col,opts){ return tx(s,'Barlow','Regular',sz,col,opts); }

// ── REUSABLE COMPONENTS ───────────────────────────────────────────────────────

// Section label (.sl) — "// LABEL TEXT" — from HTML: Martian Mono 11px, .14em tracking, muted, with // prefix in dm color
async function slLabel(text){
  var row=hrow('sl',10); row.counterAxisAlignItems='CENTER';
  row.appendChild(await mmr('//',12,D.dm,{ls:4}));
  row.appendChild(await mm(text,11,D.mu,{ls:14,upper:true}));
  return row;
}

// H2 headline — from HTML: Bricolage 44px bold, -3em tracking, 1.06 line-height, with optional gold em word
async function h2(baseText,goldText,width){
  if(!width)width=800;
  var t=figma.createText();
  t.fontName={family:'Bricolage Grotesque',style:'Bold'}; t.fontSize=44;
  t.fills=fill(D.tx);
  t.letterSpacing={value:-3,unit:'PERCENT'};
  t.lineHeight={value:48,unit:'PIXELS'};
  t.textAutoResize='HEIGHT'; t.resize(width,100);
  var full=baseText+(goldText||'');
  t.characters=full;
  if(goldText&&goldText.length>0){
    var start=baseText.length;
    t.setRangeFills(start,start+goldText.length,fill(D.go));
  }
  return t;
}

// Subheading .ss — font-size:15px, color:mu, line-height:1.72
async function subHead(text,width){
  if(!width)width=520;
  return bar(text,15,D.mu,{lh:26,w:width});
}

// Tag (.tag) — Martian Mono 10px, uppercase, .09em, padding 3x8, radius 2px
async function tag(text,type){
  var f=fr('tag-'+text); f.cornerRadius=2;
  f.layoutMode='HORIZONTAL'; f.counterAxisAlignItems='CENTER'; f.primaryAxisAlignItems='CENTER';
  f.paddingLeft=f.paddingRight=8; f.paddingTop=f.paddingBottom=3;
  f.primaryAxisSizingMode='AUTO'; f.counterAxisSizingMode='AUTO';
  if(type==='gold'){ f.fills=fill(D.go,0.10); f.strokes=[{type:'SOLID',color:hex(D.go),opacity:0.28}]; f.strokeWeight=1; f.strokeAlign='INSIDE'; }
  else if(type==='rust'){ f.fills=fill(D.ru,0.10); f.strokes=[{type:'SOLID',color:hex(D.ru),opacity:0.26}]; f.strokeWeight=1; f.strokeAlign='INSIDE'; }
  else if(type==='teal'){ f.fills=fill(D.te,0.10); f.strokes=[{type:'SOLID',color:hex(D.te),opacity:0.26}]; f.strokeWeight=1; f.strokeAlign='INSIDE'; }
  else{ f.fills=fill(D.sf2); stroke(f,D.brh); }
  var col=type==='gold'?D.go:type==='rust'?D.ru:type==='teal'?D.te:D.mu;
  f.appendChild(await mm(text,10,col,{ls:9,upper:true}));
  return f;
}

// Icon placeholder — solid colored dot with label, approximate inline SVG icons
async function iconBox(color,size){
  if(!size)size=22;
  var f=fr('icon',size); f.layoutMode='HORIZONTAL'; f.counterAxisAlignItems='CENTER'; f.primaryAxisAlignItems='CENTER';
  f.primaryAxisSizingMode='FIXED'; f.counterAxisSizingMode='FIXED';
  f.resize(size,size); f.fills=fill(color,0.15); f.cornerRadius=2;
  var dot=rct('dot',size-8,size-8,color); dot.opacity=0.7;
  f.appendChild(dot); return f;
}

// ── FONT PRELOAD ──────────────────────────────────────────────────────────────
async function loadFonts(){
  await Promise.all([
    figma.loadFontAsync({family:'Martian Mono',style:'Regular'}),
    figma.loadFontAsync({family:'Martian Mono',style:'Medium'}),
    figma.loadFontAsync({family:'Martian Mono',style:'SemiBold'}),
    figma.loadFontAsync({family:'Barlow',style:'Regular'}),
    figma.loadFontAsync({family:'Barlow',style:'SemiBold'}),
    figma.loadFontAsync({family:'Bricolage Grotesque',style:'Bold'}),
    figma.loadFontAsync({family:'Bricolage Grotesque',style:'SemiBold'}),
  ]);
}

// ── PAGE HELPERS ──────────────────────────────────────────────────────────────
function getOrCreatePage(name){
  var p=figma.root.children.find(function(x){return x.name===name;});
  if(p)return p; var pg=figma.createPage(); pg.name=name; return pg;
}
function clearSec(pg,name){ pg.children.filter(function(n){return n.name===name;}).forEach(function(n){n.remove();}); }
function restack(pg,gap){
  if(gap===undefined)gap=0;
  var fs=pg.children.filter(function(n){return n.type==='FRAME';}).sort(function(a,b){return a.y-b.y;});
  var y=0; for(var i=0;i<fs.length;i++){fs[i].x=0;fs[i].y=y;y+=fs[i].height+gap;}
}
function status(msg){figma.ui.postMessage({type:'STATUS',msg:msg});}

// ══════════════════════════════════════════════════════════════════════════════
// STYLE GUIDE SECTION BUILDERS
// ══════════════════════════════════════════════════════════════════════════════

async function buildSG_Colour(){
  var sec=sgSec('01 · Colour');

  // Section header with // prefix
  var sh=hrow('SH-1',12); sh.counterAxisAlignItems='CENTER';
  sh.primaryAxisSizingMode='FIXED'; sh.counterAxisSizingMode='AUTO';
  sh.resize(SW-SG_PAD*2,40); sh.paddingBottom=16;
  sh.appendChild(await mmr('01',11,D.go,{ls:14}));
  sh.appendChild(await mm('COLOUR PALETTE',11,D.mu,{ls:14}));
  sh.appendChild(rct('line',SW-SG_PAD*2-200,1,D.br));
  sec.appendChild(sh);

  var dswatchDescs={
    'Background':'Rich warm charcoal. Obsidian match.',
    'Surface':'Cards, panels, popovers.',
    'Surface 2':'Input backgrounds, nested.',
    'Text':'Warm cream. Obsidian body text.',
    'Muted':'Labels, secondary text.',
    'Gold':'Primary — Obsidian link colour.',
    'Rust':'Destructive — errors, before states.',
    'Teal':'Success — synced, after states.',
    'Border':'Dividers, card edges.'
  };

  var swatchRow=async function(swatches,theme,descs){
    sec.appendChild(await mmr(theme+' Theme',9,D.dm,{ls:8}));
    var row=hrow('swatches-'+theme,12);
    for(var i=0;i<swatches.length;i++){
      var sw=swatches[i];
      var card=fr('sw-'+sw.n,117); card.cornerRadius=4; card.clipsContent=true;
      card.layoutMode='VERTICAL'; card.primaryAxisSizingMode='FIXED'; card.counterAxisSizingMode='FIXED';
      card.resize(117,120); card.itemSpacing=0; card.fills=fill(D.sf); stroke(card,D.brh);
      card.appendChild(rct('chip',117,52,sw.hex));
      var info=fr('info',117); info.layoutMode='VERTICAL';
      info.paddingLeft=info.paddingRight=10; info.paddingTop=info.paddingBottom=8; info.itemSpacing=3;
      info.fills=fill(D.sf); info.primaryAxisSizingMode='FIXED'; info.counterAxisSizingMode='FIXED';
      info.resize(117,68);
      info.appendChild(await mmr(sw.n,9,D.mu,{ls:6}));
      info.appendChild(await mm(sw.hex,10,D.tx));
      info.appendChild(await bar(descs[sw.n]||'',10,D.dm,{lh:14,w:97}));
      card.appendChild(info); row.appendChild(card);
    }
    sec.appendChild(row);
  };

  await swatchRow([
    {n:'Background',hex:D.bg},{n:'Surface',hex:D.sf},{n:'Surface 2',hex:D.sf2},
    {n:'Text',hex:D.tx},{n:'Muted',hex:D.mu},{n:'Gold',hex:D.go},
    {n:'Rust',hex:D.ru},{n:'Teal',hex:D.te},{n:'Border',hex:D.br}
  ],'Dark',dswatchDescs);

  var lswatchDescs={
    'Background':'Warm parchment. Aged paper.',
    'Surface':'Cards on light theme.',
    'Surface 2':'Input backgrounds, nested.',
    'Text':'Warm near-black.',
    'Muted':'Secondary text, labels.',
    'Gold':'Primary — darker for AA contrast.',
    'Rust':'Destructive — light theme.',
    'Teal':'Success — light theme.',
    'Border':'Dividers on light theme.'
  };
  var L=T.light;
  await swatchRow([
    {n:'Background',hex:L.bg},{n:'Surface',hex:L.sf},{n:'Surface 2',hex:L.sf2},
    {n:'Text',hex:L.tx},{n:'Muted',hex:L.mu},{n:'Gold',hex:L.go},
    {n:'Rust',hex:L.ru},{n:'Teal',hex:L.te},{n:'Border',hex:L.br}
  ],'Light',lswatchDescs);

  return sec;
}

async function buildSG_Typography(){
  var sec=sgSec('02 · Typography'); sec.itemSpacing=0;
  var sh=hrow('SH-2',12); sh.counterAxisAlignItems='CENTER';
  sh.primaryAxisSizingMode='FIXED'; sh.counterAxisSizingMode='AUTO';
  sh.resize(SW-SG_PAD*2,40); sh.paddingBottom=16;
  sh.appendChild(await mmr('02',11,D.go,{ls:14}));
  sh.appendChild(await mm('TYPOGRAPHY',11,D.mu,{ls:14}));
  sh.appendChild(rct('line',SW-SG_PAD*2-200,1,D.br));
  sec.appendChild(sh);

  var rows=[
    {meta:'52px Display\nBricolage Bold',fam:'Bricolage Grotesque',sty:'Bold',sz:52,sample:'500 rows, ',accent:'1 task.',ls:-2,lh:52},
    {meta:'32px H1\nBricolage Bold',fam:'Bricolage Grotesque',sty:'Bold',sz:32,sample:'Stop paying per ',accent:'row.',ls:-2,lh:36},
    {meta:'22px H2\nBricolage Bold',fam:'Bricolage Grotesque',sty:'Bold',sz:22,sample:'Column ',accent:'Mapping',ls:-2,lh:26},
    {meta:'17px H3\nBricolage SemiBold',fam:'Bricolage Grotesque',sty:'SemiBold',sz:17,sample:'Push to Webhook',accent:'',ls:-1,lh:22},
    {meta:'15px Body\nBarlow Regular',fam:'Barlow',sty:'Regular',sz:15,sample:'One Zapier task processes your entire JSON array. 500 rows, 1 task.',accent:'',ls:0,lh:26},
    {meta:'13px Small\nBarlow Regular',fam:'Barlow',sty:'Regular',sz:13,sample:'Mapping rules stored. Data processed in RAM only, never logged.',accent:'',ls:0,lh:21},
    {meta:'11px Label\nMartian Mono Medium',fam:'Martian Mono',sty:'Medium',sz:11,sample:'FOUNDING MEMBER RATE',accent:'',ls:14,lh:16,color:D.go},
    {meta:'12px Code\nMartian Mono Regular',fam:'Martian Mono',sty:'Regular',sz:12,sample:'POST /api/sync  200 OK  1 task consumed',accent:'',ls:0,lh:20},
  ];

  for(var ri=0;ri<rows.length;ri++){
    var row=rows[ri];
    sec.appendChild(rct('div',SW-SG_PAD*2,1,D.br));
    var r=hrow('type-'+row.sz,24); r.counterAxisAlignItems='MIN';
    r.primaryAxisSizingMode='FIXED'; r.counterAxisSizingMode='AUTO';
    r.resize(SW-SG_PAD*2,100); r.paddingTop=r.paddingBottom=20;
    r.appendChild(await mmr(row.meta,9,D.dm,{ls:6,lh:14,w:148}));
    var t=figma.createText();
    t.fontName={family:row.fam,style:row.sty}; t.fontSize=row.sz;
    t.fills=fill(row.color||D.tx);
    t.letterSpacing={value:row.ls,unit:'PERCENT'};
    t.lineHeight={value:row.lh,unit:'PIXELS'};
    t.textAutoResize='WIDTH_AND_HEIGHT';
    t.characters=row.sample+(row.accent||'');
    if(row.accent)t.setRangeFills(row.sample.length,row.sample.length+row.accent.length,fill(D.go));
    r.appendChild(t); sec.appendChild(r);
  }
  return sec;
}

async function buildSG_Buttons(){
  var sec=sgSec('03 · Buttons');
  var sh=hrow('SH-3',12); sh.counterAxisAlignItems='CENTER';
  sh.primaryAxisSizingMode='FIXED'; sh.counterAxisSizingMode='AUTO';
  sh.resize(SW-SG_PAD*2,40); sh.paddingBottom=16;
  sh.appendChild(await mmr('03',11,D.go,{ls:14}));
  sh.appendChild(await mm('BUTTONS',11,D.mu,{ls:14}));
  sh.appendChild(rct('line',SW-SG_PAD*2-200,1,D.br));
  sec.appendChild(sh);

  var btn=async function(label,bg2,txt,border,h){
    if(h===undefined)h=44;
    var f=fr('btn-'+label); f.cornerRadius=3;
    f.layoutMode='HORIZONTAL'; f.counterAxisAlignItems='CENTER'; f.primaryAxisAlignItems='CENTER';
    f.paddingLeft=f.paddingRight=18; f.primaryAxisSizingMode='AUTO'; f.counterAxisSizingMode='FIXED';
    f.resize(100,h); f.fills=bg2?fill(bg2):noFill();
    if(border)stroke(f,border);
    f.appendChild(await mm(label,11,txt,{ls:8,upper:true}));
    return f;
  };
  var btnCol=async function(lbl,btnLabel,bg2,txt,border,h){
    if(h===undefined)h=44;
    var col=vcol('bc-'+lbl,6);
    col.appendChild(await mmr(lbl,9,D.dm,{ls:6}));
    col.appendChild(await btn(btnLabel,bg2,txt,border,h));
    return col;
  };

  // Sub label matching HTML pattern
  var varLbl=vcol('var-group',8);
  varLbl.appendChild(await mmr('Variants',9,D.dm,{ls:8,upper:true}));
  var vrow=hrow('variants',16); vrow.counterAxisAlignItems='MIN';
  vrow.appendChild(await btnCol('Primary','Get started',D.go,D.bg,D.go));
  vrow.appendChild(await btnCol('Secondary','Cancel',null,D.tx,D.brh));
  vrow.appendChild(await btnCol('Destructive','Delete',D.ru,D.bg,D.ru));
  vrow.appendChild(await btnCol('Outline','View docs',null,D.go,D.go));
  vrow.appendChild(await btnCol('Ghost','Skip',null,D.tx,null));
  varLbl.appendChild(vrow); sec.appendChild(varLbl);

  var szLbl=vcol('sz-group',8);
  szLbl.appendChild(await mmr('Sizes',9,D.dm,{ls:8,upper:true}));
  var srow=hrow('sizes',16); srow.counterAxisAlignItems='MIN';
  srow.appendChild(await btnCol('sm','Push rows',D.go,D.bg,D.go,44));
  srow.appendChild(await btnCol('md default','Sync now',D.go,D.bg,D.go,44));
  srow.appendChild(await btnCol('lg','Start free',D.go,D.bg,D.go,52));
  szLbl.appendChild(srow); sec.appendChild(szLbl);

  var stLbl=vcol('st-group',8);
  stLbl.appendChild(await mmr('States',9,D.dm,{ls:8,upper:true}));
  var strow=hrow('states',16); strow.counterAxisAlignItems='MIN';
  strow.appendChild(await btnCol('Default','Sync mapping',D.go,D.bg,D.go));
  var dis=await btnCol('Disabled','Sync mapping',D.go,D.bg,D.go); dis.opacity=0.4; strow.appendChild(dis);
  strow.appendChild(await btnCol('Outline','Verified',null,D.go,D.go));
  stLbl.appendChild(strow); sec.appendChild(stLbl);
  return sec;
}

async function buildSG_Inputs(){
  var sec=sgSec('04 · Inputs');
  var sh=hrow('SH-4',12); sh.counterAxisAlignItems='CENTER';
  sh.primaryAxisSizingMode='FIXED'; sh.counterAxisSizingMode='AUTO';
  sh.resize(SW-SG_PAD*2,40); sh.paddingBottom=16;
  sh.appendChild(await mmr('04',11,D.go,{ls:14}));
  sh.appendChild(await mm('INPUTS',11,D.mu,{ls:14}));
  sh.appendChild(rct('line',SW-SG_PAD*2-200,1,D.br));
  sec.appendChild(sh);

  var inp=async function(lbl,ph,state){
    var col=vcol('f-'+lbl,7);
    col.appendChild(await mm(lbl,11,D.mu,{ls:9,upper:true}));
    var box=fr('input-'+lbl); box.cornerRadius=2;
    box.layoutMode='HORIZONTAL'; box.counterAxisAlignItems='CENTER';
    box.paddingLeft=box.paddingRight=13; box.primaryAxisSizingMode='FIXED'; box.counterAxisSizingMode='FIXED';
    box.resize(240,44); box.fills=fill(D.sf2);
    stroke(box,state==='error'?D.ru:state==='success'?D.te:D.brh);
    box.appendChild(await bar(ph,14,state?D.tx:D.dm));
    col.appendChild(box); return col;
  };
  var r1=hrow('inputs-r1',20); r1.counterAxisAlignItems='MIN';
  r1.appendChild(await inp('Webhook URL','https://hooks.zapier.com/',null));
  r1.appendChild(await inp('Email address','you@company.com',null));
  r1.appendChild(await inp('Error state','Sheet not found','error'));
  r1.appendChild(await inp('Success state','CRM Import v2','success'));
  sec.appendChild(r1);
  var r2=hrow('inputs-r2',20); r2.counterAxisAlignItems='MIN';
  r2.appendChild(await inp('Disabled','Read only',null));
  var taCol=vcol('f-textarea',7);
  taCol.appendChild(await mm('JSON Preview',11,D.mu,{ls:9,upper:true}));
  var ta=fr('textarea'); ta.cornerRadius=2;
  ta.layoutMode='HORIZONTAL'; ta.counterAxisAlignItems='MIN';
  ta.paddingLeft=ta.paddingRight=13; ta.paddingTop=ta.paddingBottom=11;
  ta.primaryAxisSizingMode='FIXED'; ta.counterAxisSizingMode='FIXED';
  ta.resize(320,88); ta.fills=fill(D.sf2); stroke(ta,D.brh);
  ta.appendChild(await mmr('{"name":"Kyle","rows":[...]}',12,D.dm));
  taCol.appendChild(ta); r2.appendChild(taCol); sec.appendChild(r2);
  return sec;
}

async function buildSG_Tags(){
  var sec=sgSec('05 · Tags');
  var sh=hrow('SH-5',12); sh.counterAxisAlignItems='CENTER';
  sh.primaryAxisSizingMode='FIXED'; sh.counterAxisSizingMode='AUTO';
  sh.resize(SW-SG_PAD*2,40); sh.paddingBottom=16;
  sh.appendChild(await mmr('05',11,D.go,{ls:14}));
  sh.appendChild(await mm('TAGS',11,D.mu,{ls:14}));
  sh.appendChild(rct('line',SW-SG_PAD*2-200,1,D.br));
  sec.appendChild(sh);

  var trow=hrow('tag-variants',10); trow.counterAxisAlignItems='CENTER';
  trow.appendChild(await tag('Active','gold'));
  trow.appendChild(await tag('Synced','teal'));
  trow.appendChild(await tag('Error','rust'));
  trow.appendChild(await tag('Module 1','muted'));
  trow.appendChild(await tag('Beta','muted'));
  trow.appendChild(await tag('Founding','gold'));
  sec.appendChild(trow);

  // In-context: heading with tag
  var ctx=hrow('heading-ctx',10); ctx.counterAxisAlignItems='CENTER';
  ctx.appendChild(await bgsb('Column Mapping',17,D.tx,{ls:-1,lh:22}));
  ctx.appendChild(await tag('Beta','gold'));
  sec.appendChild(ctx);
  return sec;
}

async function buildSG_Cards(){
  var sec=sgSec('06 · Cards');
  var sh=hrow('SH-6',12); sh.counterAxisAlignItems='CENTER';
  sh.primaryAxisSizingMode='FIXED'; sh.counterAxisSizingMode='AUTO';
  sh.resize(SW-SG_PAD*2,40); sh.paddingBottom=16;
  sh.appendChild(await mmr('06',11,D.go,{ls:14}));
  sh.appendChild(await mm('CARDS',11,D.mu,{ls:14}));
  sh.appendChild(rct('line',SW-SG_PAD*2-200,1,D.br));
  sec.appendChild(sh);

  var card=async function(title,desc,tagText,tagType,tintColor){
    var c=fr('card-'+title,264); c.cornerRadius=4;
    c.layoutMode='VERTICAL'; c.paddingLeft=c.paddingRight=18;
    c.paddingTop=c.paddingBottom=18; c.itemSpacing=10;
    c.primaryAxisSizingMode='AUTO'; c.counterAxisSizingMode='FIXED';
    if(tintColor){
      c.fills=[gradFill(tintColor,0.055),{type:'SOLID',color:hex(D.sf)}];
      c.strokes=[{type:'SOLID',color:hex(tintColor),opacity:0.28}]; c.strokeWeight=1; c.strokeAlign='INSIDE';
    } else {
      c.fills=fill(D.sf); stroke(c,D.brh);
    }
    c.appendChild(await bgsb(title,17,D.tx,{ls:-1,lh:22}));
    c.appendChild(await bar(desc,13,D.mu,{lh:21,w:228}));
    c.appendChild(await tag(tagText,tagType));
    c.appendChild(rct('div',228,1,D.br));
    return c;
  };

  var crow=hrow('cards',16); crow.counterAxisAlignItems='MIN';
  crow.appendChild(await card('Inbound Sync','Map JSON to sheet columns. One task per Zap, regardless of row count.','Active','teal',null));
  crow.appendChild(await card('Push to Webhook','Highlight rows, click Push. Instant delivery, no 15-min polling.','New','gold',D.go));
  crow.appendChild(await card('Sync Failed','Last attempt 3 minutes ago. Sheet permissions may have changed.','Error','rust',D.ru));
  crow.appendChild(await card('Last Push','1,247 rows delivered to CRM Import sheet. 1 Zapier task used.','Synced','teal',D.te));
  sec.appendChild(crow);
  return sec;
}

async function buildSG_DoDont(){
  var sec=sgSec("07 Do Dont");
  var sh=hrow('SH-7',12); sh.counterAxisAlignItems='CENTER';
  sh.primaryAxisSizingMode='FIXED'; sh.counterAxisSizingMode='AUTO';
  sh.resize(SW-SG_PAD*2,40); sh.paddingBottom=16;
  sh.appendChild(await mmr('07',11,D.go,{ls:14}));
  sh.appendChild(await mm('DO DONT',11,D.mu,{ls:14}));
  sh.appendChild(rct('line',SW-SG_PAD*2-200,1,D.br));
  sec.appendChild(sh);

  var colW=Math.floor((SW-SG_PAD*2-16)/2);
  var ddCol=async function(items,isGood){
    var col=fr(isGood?'do-col':'dont-col',colW); col.cornerRadius=4;
    col.layoutMode='VERTICAL'; col.paddingLeft=col.paddingRight=20;
    col.paddingTop=col.paddingBottom=20; col.itemSpacing=0;
    col.primaryAxisSizingMode='AUTO'; col.counterAxisSizingMode='FIXED';
    col.fills=[gradFill(isGood?D.te:D.ru,0.08),{type:'SOLID',color:hex(D.sf)}];
    col.strokes=[{type:'SOLID',color:hex(isGood?D.te:D.ru),opacity:0.26}]; col.strokeWeight=1; col.strokeAlign='INSIDE';
    col.appendChild(await mm(isGood?'DO':'DONT',10,isGood?D.te:D.ru,{ls:10}));
    col.appendChild(rct('hdiv',colW-40,1,isGood?D.te:D.ru));
    for(var i=0;i<items.length;i++){
      var row=fr('ddr-'+i,colW-40); row.layoutMode='VERTICAL';
      row.paddingTop=row.paddingBottom=9; row.fills=noFill();
      row.primaryAxisSizingMode='AUTO'; row.counterAxisSizingMode='FIXED';
      row.appendChild(await bar(items[i],13,D.tx,{lh:20,w:colW-40}));
      col.appendChild(row);
      if(i<items.length-1)col.appendChild(rct('div',colW-40,1,D.br));
    }
    return col;
  };
  var ddrow=hrow('dodont',16); ddrow.counterAxisAlignItems='MIN';
  ddrow.primaryAxisSizingMode='FIXED'; ddrow.counterAxisSizingMode='AUTO';
  ddrow.resize(SW-SG_PAD*2,100);
  ddrow.appendChild(await ddCol([
    'One gold word per heading, exactly one',
    'Martian Mono for all buttons, labels, nav, data',
    'Rust for problems, Teal for success states',
    'Weight and colour for emphasis, never italic',
    'Max 4px border-radius on any element',
    'Gold focus ring on all interactive elements',
    'Min 44px touch targets on interactive elements',
    'CSS variables for every colour, no hardcoded hex',
  ],true));
  ddrow.appendChild(await ddCol([
    'Multiple coloured words in one heading',
    'Inter, DM Sans, Space Grotesk, wrong aesthetic',
    'Italic, ever, in any context',
    'Border-radius above 4px on any component',
    'Gold fills on non-primary actions',
    'Colour as the only distinguishing signal',
    'Animations without prefers-reduced-motion guard',
    'Hardcoded colours, defeats light/dark theming',
  ],false));
  sec.appendChild(ddrow);
  return sec;
}

async function buildVariablesAndStyles(){
  try{
    var ex=figma.variables.getLocalVariableCollections().find(function(c){return c.name==='BSS Tokens';});
    if(ex)ex.remove();
    var coll=figma.variables.createVariableCollection('BSS Tokens');
    coll.renameMode(coll.modes[0].modeId,'Dark');
    var lightId=coll.addMode('Light'), darkId=coll.modes[0].modeId;
    var cd=[
      ['color/background',D.bg,T.light.bg],['color/surface',D.sf,T.light.sf],
      ['color/surface-2',D.sf2,T.light.sf2],['color/border',D.br,T.light.br],
      ['color/border-hover',D.brh,T.light.brh],['color/text',D.tx,T.light.tx],
      ['color/muted',D.mu,T.light.mu],['color/dim',D.dm,T.light.dm],
      ['color/gold',D.go,T.light.go],['color/rust',D.ru,T.light.ru],['color/teal',D.te,T.light.te],
    ];
    for(var ci=0;ci<cd.length;ci++){
      var v=figma.variables.createVariable(cd[ci][0],coll,'COLOR');
      v.setValueForMode(darkId,hex(cd[ci][1])); v.setValueForMode(lightId,hex(cd[ci][2]));
    }
  }catch(e){console.warn('vars:',e.message);}
  var ts=[
    ['BSS/Display','Bricolage Grotesque','Bold',52,-2,52],
    ['BSS/H1','Bricolage Grotesque','Bold',32,-2,36],
    ['BSS/H2','Bricolage Grotesque','Bold',44,-3,48],
    ['BSS/H3','Bricolage Grotesque','SemiBold',17,-1,22],
    ['BSS/Body','Barlow','Regular',15,0,26],
    ['BSS/Body Small','Barlow','Regular',13,0,21],
    ['BSS/Label','Martian Mono','Medium',11,14,16],
    ['BSS/Caption','Martian Mono','Regular',10,6,14],
    ['BSS/Code','Martian Mono','Regular',12,0,20],
  ];
  for(var si=0;si<ts.length;si++){
    try{
      var s=figma.createTextStyle(); s.name=ts[si][0];
      s.fontName={family:ts[si][1],style:ts[si][2]}; s.fontSize=ts[si][3];
      s.letterSpacing={value:ts[si][4],unit:'PERCENT'};
      s.lineHeight={value:ts[si][5],unit:'PIXELS'};
    }catch(e){}
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// LANDING PAGE — exact match to HTML version
// Inner container = 1040px, centered in 1440px frame (LP_PAD=200 each side)
// section{padding:88px 0} — all sections have paddingTop/Bottom=88
// ══════════════════════════════════════════════════════════════════════════════

var INNER=1040; // max-width of content

// Helper: inner content wrapper at 1040px
function innerCol(gap){
  if(gap===undefined)gap=0;
  var f=fr('inner',INNER);
  f.layoutMode='VERTICAL'; f.primaryAxisSizingMode='AUTO'; f.counterAxisSizingMode='FIXED';
  f.itemSpacing=gap; f.fills=noFill();
  return f;
}

// Section divider line between sections
function secDivider(){
  var r=rct('sec-divider',W,1,D.br); return r;
}

// ── LP NAV ────────────────────────────────────────────────────────────────────
async function buildLP_Nav(){
  var sec=fr('LP · Nav',W);
  sec.layoutMode='HORIZONTAL'; sec.counterAxisAlignItems='CENTER';
  sec.primaryAxisSizingMode='FIXED'; sec.counterAxisSizingMode='FIXED';
  sec.resize(W,52); sec.paddingLeft=sec.paddingRight=LP_PAD; sec.itemSpacing=0;
  sec.fills=fill(D.sf,0.93); stroke(sec,D.br,1); applyGrid(sec);

  // Logo
  var logo=hrow('logo',9); logo.counterAxisAlignItems='CENTER';
  var ldot=fr('ld'); ldot.resize(7,7); ldot.cornerRadius=4; ldot.fills=fill(D.go);
  logo.appendChild(ldot);
  logo.appendChild(await bg('BulkSheetsSync',17,D.tx,{ls:-3,lh:20}));
  sec.appendChild(logo);

  var sp=fr('sp'); sp.layoutMode='HORIZONTAL'; sp.primaryAxisSizingMode='FIXED';
  sp.counterAxisSizingMode='AUTO'; sp.resize(1,1); sp.fills=noFill(); sp.layoutGrow=1;
  sec.appendChild(sp);

  // Nav links
  var links=hrow('nav-links',20); links.counterAxisAlignItems='CENTER';
  var navItems=['Status','Problem','ROI Calc','Pricing','FAQ'];
  for(var ni=0;ni<navItems.length;ni++){
    links.appendChild(await mmr(navItems[ni],11,D.mu,{ls:4}));
  }
  sec.appendChild(links);

  // Theme toggle
  var tmb=fr('tmbtn'); tmb.cornerRadius=2; tmb.layoutMode='HORIZONTAL';
  tmb.counterAxisAlignItems='CENTER'; tmb.paddingLeft=tmb.paddingRight=10; tmb.paddingTop=tmb.paddingBottom=5;
  tmb.primaryAxisSizingMode='AUTO'; tmb.counterAxisSizingMode='FIXED'; tmb.resize(80,44);
  tmb.fills=noFill(); stroke(tmb,D.brh);
  tmb.appendChild(await mmr('Light',11,D.mu,{ls:4}));
  sec.appendChild(tmb);

  // CTA
  var cta=fr('bnav'); cta.cornerRadius=2; cta.layoutMode='HORIZONTAL';
  cta.counterAxisAlignItems='CENTER'; cta.primaryAxisAlignItems='CENTER';
  cta.paddingLeft=cta.paddingRight=14; cta.paddingTop=cta.paddingBottom=8;
  cta.primaryAxisSizingMode='AUTO'; cta.counterAxisSizingMode='FIXED'; cta.resize(130,44);
  cta.fills=fill(D.go);
  cta.appendChild(await mm('Join Waitlist',11,D.bg,{ls:4}));
  sec.appendChild(cta);
  return sec;
}

// ── LP HERO ───────────────────────────────────────────────────────────────────
// hero{padding:140px 0 80px}
async function buildLP_Hero(){
  var sec=fr('LP · Hero',W);
  sec.layoutMode='VERTICAL'; sec.counterAxisAlignItems='MIN';
  sec.primaryAxisSizingMode='AUTO'; sec.counterAxisSizingMode='FIXED';
  sec.paddingLeft=sec.paddingRight=LP_PAD;
  sec.paddingTop=140; sec.paddingBottom=80; sec.itemSpacing=0;
  sec.fills=fill(D.bg); applyGrid(sec);

  // .hglow — radial gradient overlay at top — represented as a wide gradient rect
  var glow=fr('hglow',800); glow.cornerRadius=0;
  glow.primaryAxisSizingMode='FIXED'; glow.counterAxisSizingMode='FIXED'; glow.resize(800,440);
  glow.fills=[radialTopFill(D.go,0.055)];
  // Position it centered — in auto layout, center align and use negative margin equivalent
  sec.appendChild(glow);

  var inner=innerCol(0);

  // Status pill (.hpill)
  var pill=fr('hpill'); pill.cornerRadius=2; pill.layoutMode='HORIZONTAL';
  pill.counterAxisAlignItems='CENTER'; pill.paddingLeft=pill.paddingRight=13;
  pill.paddingTop=pill.paddingBottom=6; pill.itemSpacing=8;
  pill.primaryAxisSizingMode='AUTO'; pill.counterAxisSizingMode='AUTO';
  pill.fills=fill(D.sf); stroke(pill,D.brh);
  var liveDot=fr('hd2'); liveDot.resize(5,5); liveDot.cornerRadius=3; liveDot.fills=fill(D.go);
  pill.appendChild(liveDot);
  pill.appendChild(await mmr('Building now',10,D.go,{ls:4}));
  pill.appendChild(await mmr('·',10,D.dm,{ls:2}));
  pill.appendChild(await mmr('Q3 2025 launch',10,D.mu,{ls:2}));
  pill.appendChild(await mmr('·',10,D.dm,{ls:2}));
  pill.appendChild(await mmr('Founding spots: 253 remaining',10,D.mu,{ls:2}));
  inner.appendChild(pill);
  inner.appendChild(rct('spacer-pill',1,28)); // 28px gap after pill

  // H1 — .h1: Bricolage 88px, weight 800, line-height .96, letter-spacing -.045em
  var h1=figma.createText();
  h1.fontName={family:'Bricolage Grotesque',style:'Bold'}; h1.fontSize=80;
  h1.fills=fill(D.tx);
  h1.letterSpacing={value:-4.5,unit:'PERCENT'};
  h1.lineHeight={value:76,unit:'PIXELS'};
  h1.textAutoResize='HEIGHT'; h1.resize(780,100);
  h1.characters='500 rows.\n1 task.\nNot 500.';
  // "1 task." in gold
  h1.setRangeFills(10,16,fill(D.go));
  inner.appendChild(h1);
  inner.appendChild(rct('spacer-h1',1,24));

  // .hsub — 17px, mu, line-height 1.68, max-width 520
  inner.appendChild(await bar('Zapier\'s Loop action bills you per iteration. Send a 500-record webhook, pay for 500 tasks. BulkSheetsSync processes entire JSON arrays in a single API call.',17,D.mu,{lh:29,w:520}));
  inner.appendChild(rct('spacer-sub',1,38));

  // Email form
  var flbl=await mm('Work email — founding rate locked on signup',11,D.mu,{ls:12,upper:true});
  inner.appendChild(flbl);
  inner.appendChild(rct('spacer-lbl',1,8));
  var frow=hrow('frow',0); frow.counterAxisAlignItems='CENTER';
  var fi=fr('fi'); fi.cornerRadius=3; fi.layoutMode='HORIZONTAL'; fi.counterAxisAlignItems='CENTER';
  fi.paddingLeft=fi.paddingRight=16; fi.primaryAxisSizingMode='FIXED'; fi.counterAxisSizingMode='FIXED';
  fi.resize(320,44); fi.fills=fill(D.sf); stroke(fi,D.brh,1);
  fi.appendChild(await mmr('you@company.com',12,D.mu));
  var fbtn=fr('fb'); fbtn.cornerRadius=0; fbtn.layoutMode='HORIZONTAL'; fbtn.counterAxisAlignItems='CENTER'; fbtn.primaryAxisAlignItems='CENTER';
  fbtn.paddingLeft=fbtn.paddingRight=20; fbtn.primaryAxisSizingMode='AUTO'; fbtn.counterAxisSizingMode='FIXED'; fbtn.resize(180,44);
  fbtn.fills=fill(D.go);
  fbtn.appendChild(await mm('Reserve My Spot',11,D.bg,{ls:4}));
  frow.appendChild(fi); frow.appendChild(fbtn);
  inner.appendChild(frow);
  inner.appendChild(rct('spacer-form',1,10));
  inner.appendChild(await mmr('Lock Full Suite at $49/yr (launches $79). No payment now.',11,D.dm,{ls:2}));

  // .hstats — margin-top:52px, padding-top:36px, border-top:1px solid br, gap:36px
  inner.appendChild(rct('spacer-stats',1,52));
  var statsDiv=rct('stats-divider',1040,1,D.br); inner.appendChild(statsDiv);
  inner.appendChild(rct('spacer-statspt',1,36));
  var stats=hrow('hstats',36); stats.counterAxisAlignItems='MIN';
  var statItems=[
    {n:'500×',l:'task reduction'},
    {n:'$0',l:'data stored, ever'},
    {n:'<1s',l:'push latency'},
    {n:'247',l:'on waitlist'}
  ];
  for(var si2=0;si2<statItems.length;si2++){
    var sc=vcol('hst-'+si2,3);
    sc.appendChild(await mm(statItems[si2].n,26,D.go,{ls:0}));
    sc.appendChild(await bar(statItems[si2].l,11,D.mu,{lh:16}));
    stats.appendChild(sc);
  }
  inner.appendChild(stats);
  inner.appendChild(rct('spacer-term',1,52));

  // Terminal block (.term)
  var term=fr('term',INNER); term.cornerRadius=4; term.clipsContent=true;
  term.layoutMode='VERTICAL'; term.primaryAxisSizingMode='AUTO'; term.counterAxisSizingMode='FIXED';
  term.fills=fill(D.sf); stroke(term,D.brh);
  // Title bar
  var tbar=fr('tbar',INNER); tbar.cornerRadius=0; tbar.layoutMode='HORIZONTAL';
  tbar.counterAxisAlignItems='CENTER'; tbar.paddingLeft=tbar.paddingRight=16;
  tbar.paddingTop=tbar.paddingBottom=10; tbar.itemSpacing=5;
  tbar.primaryAxisSizingMode='FIXED'; tbar.counterAxisSizingMode='AUTO';
  tbar.fills=fill(D.sf2); stroke(tbar,D.br,1);
  // Traffic light dots
  var td1=fr('d1'); td1.resize(10,10); td1.cornerRadius=5; td1.fills=[{type:'SOLID',color:{r:0.55,g:0.23,b:0.16}}];
  var td2=fr('d2'); td2.resize(10,10); td2.cornerRadius=5; td2.fills=[{type:'SOLID',color:{r:0.55,g:0.44,b:0.19}}];
  var td3=fr('d3'); td3.resize(10,10); td3.cornerRadius=5; td3.fills=[{type:'SOLID',color:{r:0.23,g:0.44,b:0.25}}];
  tbar.appendChild(td1); tbar.appendChild(td2); tbar.appendChild(td3);
  tbar.appendChild(await mmr('POST BulkSheetsSync  500 Shopify orders',11,D.mu,{ls:2}));
  term.appendChild(tbar);
  // Code body
  var tbody=fr('tbody',INNER); tbody.layoutMode='VERTICAL'; tbody.primaryAxisSizingMode='AUTO'; tbody.counterAxisSizingMode='FIXED';
  tbody.paddingLeft=tbody.paddingRight=24; tbody.paddingTop=tbody.paddingBottom=20; tbody.itemSpacing=0;
  tbody.fills=noFill();
  var codeLines=[
    {text:'// Zapier native Loop action',color:D.dm},
    {text:'tasks_billed:  500    // $0.60 overage. Every time.',color:D.tx,highlight:{start:15,end:18,color:D.ru}},
    {text:'',color:D.dm},
    {text:'// BulkSheetsSync one POST full array',color:D.dm},
    {text:'tasks_billed:  1      // always. regardless of payload size.',color:D.tx,highlight:{start:15,end:16,color:D.go}},
    {text:'rows_written:  500    // confirmed in same response',color:D.tx,highlight:{start:15,end:18,color:D.go}},
    {text:'data_stored:   0      // RAM only, instantly discarded',color:D.tx,highlight:{start:15,end:16,color:D.ru}},
  ];
  for(var cli=0;cli<codeLines.length;cli++){
    var cl=codeLines[cli];
    var ct=figma.createText();
    ct.fontName={family:'Martian Mono',style:'Regular'}; ct.fontSize=12;
    ct.fills=fill(cl.color); ct.lineHeight={value:26,unit:'PIXELS'};
    ct.textAutoResize='WIDTH_AND_HEIGHT';
    ct.characters=cl.text||' ';
    if(cl.highlight){
      ct.setRangeFills(cl.highlight.start,cl.highlight.end,fill(cl.highlight.color));
    }
    tbody.appendChild(ct);
  }
  term.appendChild(tbody);
  inner.appendChild(term);

  sec.appendChild(inner);
  return sec;
}

// ── LP LAUNCH STATUS ──────────────────────────────────────────────────────────
async function buildLP_Launch(){
  var sec=lpSec('LP · Launch',D.sf);
  var inner=innerCol(0);

  inner.appendChild(await slLabel('Build Status'));
  inner.appendChild(rct('sp1',1,16));
  inner.appendChild(await h2('Where we are.\nWhere we\'re ','going.',INNER));
  inner.appendChild(rct('sp2',1,12));
  inner.appendChild(await subHead('Building in public. Real progress, not a marketing slide.',INNER));
  inner.appendChild(rct('sp3',1,44));

  // Two-column grid (.lpg) — gap:48px
  var grid=hrow('lpg',48); grid.counterAxisAlignItems='MIN';
  var colW=Math.floor((INNER-48)/2);

  // Left: timeline items (.lpi)
  var timeline=vcol('timeline',0); timeline.counterAxisAlignItems='MIN';

  var milestones=[
    {icon:'dn',title:'Core inbound API array processing engine',desc:'Receives bulk JSON, applies mapping rules in memory, writes to Sheets via batchUpdate. 10k rows per call.',date:'Shipped',done:true},
    {icon:'dn',title:'Visual Mapper dashboard',desc:'Drag-and-drop JSON key to Sheet column UI. Nested path support, multiple profiles, append/overwrite/upsert.',date:'Shipped',done:true},
    {icon:'dn',title:'Zapier custom action published',desc:'Available as a Zapier custom action. Passes entire payload array as a single task.',date:'Shipped',done:true},
    {icon:'nw',title:'Google Workspace Add-on marketplace review',desc:'Outbound Add-on submitted. Adds Push to Webhook sidebar. Review: 2-3 weeks.',date:'In progress — Est. May 2025',done:false},
    {icon:'sn',title:'Billing and credit management',desc:'PAYG credit tracking, subscription management, usage dashboard.',date:'Target: Jun 2025',done:false},
    {icon:'sn',title:'Public launch',desc:'Waitlist notified first. Founding member pricing activated.',date:'Target: Q3 2025',done:false},
  ];

  for(var mi=0;mi<milestones.length;mi++){
    var m=milestones[mi];
    var lpi=hrow('lpi-'+mi,18); lpi.counterAxisAlignItems='MIN';
    lpi.paddingTop=lpi.paddingBottom=18;
    if(mi<milestones.length-1){
      lpi.strokes=[{type:'SOLID',color:hex(D.br)}]; lpi.strokeWeight=1; lpi.strokeAlign='OUTSIDE';
    }
    lpi.fills=noFill();

    // Number circle
    var lpn=fr('lpn'); lpn.resize(20,20); lpn.cornerRadius=10;
    if(m.done){lpn.fills=fill(D.go);}
    else if(m.icon==='nw'){lpn.fills=fill(D.go,0.10); stroke(lpn,D.go,1.5);}
    else{lpn.fills=noFill(); stroke(lpn,D.dm,1.5);}
    lpn.layoutMode='HORIZONTAL'; lpn.counterAxisAlignItems='CENTER'; lpn.primaryAxisAlignItems='CENTER';
    lpn.primaryAxisSizingMode='FIXED'; lpn.counterAxisSizingMode='FIXED';
    lpn.appendChild(await mmr(m.done?'v':'o',8,m.done?D.bg:m.icon==='nw'?D.go:D.dm));
    lpi.appendChild(lpn);

    var lpco=vcol('lpco-'+mi,4); lpco.counterAxisAlignItems='MIN';
    lpco.appendChild(await mm(m.title,11,m.done?D.tx:m.icon==='nw'?D.go:D.mu,{}));
    lpco.appendChild(await bar(m.desc,13,D.mu,{lh:20,w:colW-38}));
    lpco.appendChild(await mmr(m.date,9,m.done?D.dm:m.icon==='nw'?D.go:D.dm,{ls:4}));
    lpi.appendChild(lpco);
    timeline.appendChild(lpi);
  }
  grid.appendChild(timeline);

  // Right: counter + founding card
  var right=vcol('right-col',16);

  // Counter block (.cntb)
  var cntb=fr('cntb',colW); cntb.cornerRadius=4; cntb.layoutMode='VERTICAL';
  cntb.paddingLeft=cntb.paddingRight=24; cntb.paddingTop=cntb.paddingBottom=24; cntb.itemSpacing=8;
  cntb.primaryAxisSizingMode='AUTO'; cntb.counterAxisSizingMode='FIXED';
  cntb.fills=fill(D.bg); stroke(cntb,D.brh);
  cntb.appendChild(await mm('Waitlist signups',11,D.mu,{ls:12,upper:true}));
  cntb.appendChild(await bg('247',52,D.tx,{ls:-3,lh:52}));
  // Progress bar
  var pgTrack=fr('pgTrack',colW-48); pgTrack.resize(colW-48,2); pgTrack.cornerRadius=1; pgTrack.fills=fill(D.br);
  var pgFill=fr('pgFill',Math.round((247/500)*(colW-48))); pgFill.resize(Math.round((247/500)*(colW-48)),2); pgFill.cornerRadius=1; pgFill.fills=fill(D.go);
  pgTrack.appendChild(pgFill);
  cntb.appendChild(pgTrack);
  var pgLbl=hrow('pgLbl',0); pgLbl.primaryAxisSizingMode='FIXED'; pgLbl.counterAxisSizingMode='AUTO';
  pgLbl.resize(colW-48,16); pgLbl.counterAxisAlignItems='CENTER';
  pgLbl.appendChild(await mmr('0',9,D.dm));
  var pgSp=fr('pgsp'); pgSp.layoutMode='HORIZONTAL'; pgSp.primaryAxisSizingMode='FIXED'; pgSp.counterAxisSizingMode='AUTO'; pgSp.resize(1,1); pgSp.fills=noFill(); pgSp.layoutGrow=1;
  pgLbl.appendChild(pgSp);
  pgLbl.appendChild(await mmr('247 / 500 founding spots',9,D.dm));
  pgLbl.appendChild(fr('pgsp2'));
  pgLbl.children[pgLbl.children.length-1].resize(1,1);
  pgLbl.appendChild(await mmr('500',9,D.dm));
  cntb.appendChild(pgLbl);
  right.appendChild(cntb);

  // Founding rate card (.fcard)
  var fcard=fr('fcard',colW); fcard.cornerRadius=4; fcard.layoutMode='VERTICAL';
  fcard.paddingLeft=fcard.paddingRight=24; fcard.paddingTop=fcard.paddingBottom=22; fcard.itemSpacing=10;
  fcard.primaryAxisSizingMode='AUTO'; fcard.counterAxisSizingMode='FIXED';
  fcard.fills=[gradFill(D.go,0.055),{type:'SOLID',color:hex(D.sf)}];
  fcard.strokes=[{type:'SOLID',color:hex(D.go),opacity:0.28}]; fcard.strokeWeight=1; fcard.strokeAlign='INSIDE';
  fcard.appendChild(await mm('Founding Member Rate',10,D.go,{ls:12,upper:true}));
  var priceRow=hrow('price-row',12); priceRow.counterAxisAlignItems='BASELINE';
  priceRow.appendChild(await mmr('$79',18,D.dm,{strike:true}));
  priceRow.appendChild(await bg('$49',42,D.go,{ls:-3,lh:42}));
  priceRow.appendChild(await mmr('/yr forever',11,D.mu));
  fcard.appendChild(priceRow);
  fcard.appendChild(await bar('Locked permanently at signup. No price increases ever apply to founding members. Includes both modules, 100k rows/mo, all future features.',13,D.mu,{lh:21,w:colW-48}));
  right.appendChild(fcard);

  grid.appendChild(right);
  inner.appendChild(grid);
  sec.appendChild(inner);
  return sec;
}

// ── LP PROBLEM ────────────────────────────────────────────────────────────────
async function buildLP_Problem(){
  var sec=lpSec('LP · Problem',D.bg);
  var inner=innerCol(0);

  inner.appendChild(await slLabel('The Zapier Task Trap'));
  inner.appendChild(rct('sp1',1,16));
  inner.appendChild(await h2('You\'re not paying for automation.\nYou\'re paying for ','iteration.',INNER));
  inner.appendChild(rct('sp2',1,12));
  inner.appendChild(await subHead('Loop action charges one task per row. For bulk data, this silently upgrades your plan without warning.',INNER));
  inner.appendChild(rct('sp3',1,44));

  // .psg — gap:2px, border:1px solid brh, border-radius:4px
  // In Figma: side by side with 2px gap
  var psg=hrow('psg',2); psg.counterAxisAlignItems='MIN';
  psg.primaryAxisSizingMode='FIXED'; psg.counterAxisSizingMode='AUTO';
  psg.resize(INNER,100);
  psg.strokes=[{type:'SOLID',color:hex(D.brh)}]; psg.strokeWeight=1; psg.strokeAlign='OUTSIDE';
  psg.cornerRadius=4;

  var pColW=Math.floor((INNER-2)/2);

  var pscBad=fr('psc-bad',pColW); pscBad.layoutMode='VERTICAL';
  pscBad.paddingLeft=pscBad.paddingRight=30; pscBad.paddingTop=pscBad.paddingBottom=30; pscBad.itemSpacing=0;
  pscBad.primaryAxisSizingMode='AUTO'; pscBad.counterAxisSizingMode='FIXED';
  pscBad.fills=fill(D.ru,0.04);
  pscBad.strokes=[{type:'SOLID',color:hex(D.br)}]; pscBad.strokeWeight=1; pscBad.strokeAlign='OUTSIDE';

  var pscGood=fr('psc-good',pColW); pscGood.layoutMode='VERTICAL';
  pscGood.paddingLeft=pscGood.paddingRight=30; pscGood.paddingTop=pscGood.paddingBottom=30; pscGood.itemSpacing=0;
  pscGood.primaryAxisSizingMode='AUTO'; pscGood.counterAxisSizingMode='FIXED';
  pscGood.fills=fill(D.go,0.04);

  var psrData=[
    {key:'Architecture',bad:'Loop action, one task per row, always',good:'Array-aware, entire payload, one API call'},
    {key:'500 Shopify orders',bad:'= 500 tasks consumed',good:'= 1 task consumed'},
    {key:'Starter cap (750 tasks)',bad:'Blown in a single webhook',good:'749 tasks remaining after that webhook'},
    {key:'Required tier for bulk',bad:'Professional ($149/mo) minimum',good:'Stay on Starter. We handle the bulk.'},
    {key:'Outbound latency',bad:'Polling only. Up to 15-min delay.',good:'Instant push. Highlight rows, click Push.'},
  ];

  pscBad.appendChild(await tag('Native Zapier','rust'));
  pscBad.appendChild(rct('sp-tag',1,20));
  pscGood.appendChild(await tag('BulkSheetsSync','gold'));
  pscGood.appendChild(rct('sp-tag',1,20));

  for(var pi=0;pi<psrData.length;pi++){
    var prow=hrow('psr-bad-'+pi,12); prow.counterAxisAlignItems='MIN';
    prow.paddingTop=prow.paddingBottom=12; prow.fills=noFill();
    if(pi<psrData.length-1){prow.strokes=[{type:'SOLID',color:hex(D.br)}]; prow.strokeWeight=1; prow.strokeAlign='OUTSIDE';}
    var xdot=fr('x'); xdot.resize(14,14); xdot.cornerRadius=7; xdot.fills=fill(D.ru,0.15);
    var xrowInner=vcol('xi',2);
    xrowInner.appendChild(await mmr(psrData[pi].key.toUpperCase(),9,D.mu,{ls:7}));
    xrowInner.appendChild(await mmr(psrData[pi].bad,11,D.ru,{ls:0,w:pColW-60}));
    prow.appendChild(xdot); prow.appendChild(xrowInner);
    pscBad.appendChild(prow);

    var grow=hrow('psr-good-'+pi,12); grow.counterAxisAlignItems='MIN';
    grow.paddingTop=grow.paddingBottom=12; grow.fills=noFill();
    if(pi<psrData.length-1){grow.strokes=[{type:'SOLID',color:hex(D.br)}]; grow.strokeWeight=1; grow.strokeAlign='OUTSIDE';}
    var ck=fr('ck'); ck.resize(14,14); ck.cornerRadius=7; ck.fills=fill(D.go,0.15);
    var gRowInner=vcol('gi',2);
    gRowInner.appendChild(await mmr(psrData[pi].key.toUpperCase(),9,D.mu,{ls:7}));
    gRowInner.appendChild(await mmr(psrData[pi].good,11,D.go,{ls:0,w:pColW-60}));
    grow.appendChild(ck); grow.appendChild(gRowInner);
    pscGood.appendChild(grow);
  }
  psg.appendChild(pscBad); psg.appendChild(pscGood);
  inner.appendChild(psg);

  // .crow — stat cards, gap:14px, margin-top:28px
  inner.appendChild(rct('sp4',1,28));
  var crow=hrow('crow',14); crow.counterAxisAlignItems='MIN';

  var ccData=[
    {label:'Native Zapier 50k rows/mo',n:'$149',unit:'/mo',note:'Professional forced. $1,788/year.',bad:true},
    {label:'BulkSheetsSync 100k rows/mo',n:'$49',unit:'/yr',note:'Founding rate. Stay on Zapier Starter.',good:true},
    {label:'Annual savings',n:'$1,739',unit:'',note:'3,549% ROI at founding pricing.',savings:true},
  ];

  for(var ci2=0;ci2<ccData.length;ci2++){
    var cc=ccData[ci2];
    var ccF=fr('cc-'+ci2); ccF.cornerRadius=3; ccF.layoutMode='VERTICAL';
    ccF.paddingLeft=ccF.paddingRight=18; ccF.paddingTop=ccF.paddingBottom=18; ccF.itemSpacing=7;
    ccF.primaryAxisSizingMode='AUTO'; ccF.counterAxisSizingMode='AUTO'; ccF.layoutGrow=1;
    if(cc.bad){ccF.fills=fill(D.ru,0.10); ccF.strokes=[{type:'SOLID',color:hex(D.ru),opacity:0.26}]; ccF.strokeWeight=1; ccF.strokeAlign='INSIDE';}
    else if(cc.good){ccF.fills=fill(D.go,0.10); ccF.strokes=[{type:'SOLID',color:hex(D.go),opacity:0.28}]; ccF.strokeWeight=1; ccF.strokeAlign='INSIDE';}
    else{ccF.fills=fill(D.sf); stroke(ccF,D.brh);}
    ccF.appendChild(await mmr(cc.label.toUpperCase(),9,D.mu,{ls:8,upper:true}));
    var nRow=hrow('n-'+ci2,3); nRow.counterAxisAlignItems='BASELINE';
    nRow.appendChild(await bg(cc.n,32,cc.bad?D.ru:cc.good?D.go:D.go,{ls:-2.5,lh:36}));
    if(cc.unit)nRow.appendChild(await bar(cc.unit,15,D.mu));
    ccF.appendChild(nRow);
    ccF.appendChild(await bar(cc.note,13,D.mu,{lh:20}));
    crow.appendChild(ccF);
  }
  inner.appendChild(crow);
  sec.appendChild(inner);
  return sec;
}

// ── LP FEATURES ───────────────────────────────────────────────────────────────
async function buildLP_Features(){
  var sec=lpSec('LP · Features',D.bg);
  var inner=innerCol(0);

  inner.appendChild(await slLabel('Two Modules. Both Directions.'));
  inner.appendChild(rct('sp1',1,16));
  inner.appendChild(await h2('Inbound. Outbound.\n','Zero loops.',INNER));
  inner.appendChild(rct('sp2',1,12));
  inner.appendChild(await subHead('A complete bi-directional bridge between Zapier and Google Sheets.',INNER));
  inner.appendChild(rct('sp3',1,44));

  // .fg — gap:16px, grid-template-columns:1fr 1fr
  var fg=hrow('fg',16); fg.counterAxisAlignItems='MIN';
  var fpW=Math.floor((INNER-16)/2);

  var featureCard=async function(moduleNum,tagText,dir,title,desc,flowItems,bullets){
    var fp=fr('fp-'+moduleNum,fpW); fp.cornerRadius=4; fp.layoutMode='VERTICAL';
    fp.primaryAxisSizingMode='AUTO'; fp.counterAxisSizingMode='FIXED';
    fp.fills=fill(D.sf); stroke(fp,D.brh);

    // .fph — header: padding 24px 26px, bg:sf, border-bottom
    var fph=fr('fph',fpW); fph.layoutMode='VERTICAL';
    fph.paddingLeft=fph.paddingRight=26; fph.paddingTop=fph.paddingBottom=24; fph.itemSpacing=10;
    fph.primaryAxisSizingMode='AUTO'; fph.counterAxisSizingMode='FIXED';
    fph.fills=fill(D.sf);
    fph.strokes=[{type:'SOLID',color:hex(D.br)}]; fph.strokeWeight=1; fph.strokeAlign='OUTSIDE';
    // .fpd
    var fpd=hrow('fpd',7); fpd.counterAxisAlignItems='CENTER';
    fpd.appendChild(await tag(moduleNum,'gold'));
    fpd.appendChild(await mmr(dir,11,D.mu,{ls:10,upper:true}));
    fph.appendChild(fpd);
    fph.appendChild(await bgsb(title,20,D.tx,{ls:-2,lh:24}));
    fph.appendChild(await bar(desc,13,D.mu,{lh:20,w:fpW-52}));
    fp.appendChild(fph);

    // .fflow — flow row: padding 11px 26px, bg:bg, border-bottom
    var fflow=fr('fflow',fpW); fflow.layoutMode='HORIZONTAL';
    fflow.counterAxisAlignItems='CENTER';
    fflow.paddingLeft=fflow.paddingRight=26; fflow.paddingTop=fflow.paddingBottom=11; fflow.itemSpacing=6;
    fflow.primaryAxisSizingMode='AUTO'; fflow.counterAxisSizingMode='FIXED';
    fflow.fills=fill(D.bg);
    fflow.strokes=[{type:'SOLID',color:hex(D.br)}]; fflow.strokeWeight=1; fflow.strokeAlign='OUTSIDE';
    for(var ffi=0;ffi<flowItems.length;ffi++){
      var fn2=fr('fn-'+ffi); fn2.cornerRadius=2; fn2.layoutMode='HORIZONTAL';
      fn2.counterAxisAlignItems='CENTER'; fn2.paddingLeft=fn2.paddingRight=9; fn2.paddingTop=fn2.paddingBottom=4;
      fn2.primaryAxisSizingMode='AUTO'; fn2.counterAxisSizingMode='AUTO';
      if(flowItems[ffi].on){fn2.fills=fill(D.go,0.10); fn2.strokes=[{type:'SOLID',color:hex(D.go),opacity:0.28}]; fn2.strokeWeight=1; fn2.strokeAlign='INSIDE';}
      else{fn2.fills=noFill(); stroke(fn2,D.brh);}
      var fnCol=flowItems[ffi].on?D.go:D.mu;
      fn2.appendChild(await mmr(flowItems[ffi].label,10,fnCol));
      fflow.appendChild(fn2);
      if(ffi<flowItems.length-1){
        fflow.appendChild(await mmr('>',11,D.dm));
      }
    }
    fp.appendChild(fflow);

    // .fpb — bullets: padding 22px 26px
    var fpb=fr('fpb',fpW); fpb.layoutMode='VERTICAL';
    fpb.paddingLeft=fpb.paddingRight=26; fpb.paddingTop=fpb.paddingBottom=22; fpb.itemSpacing=0;
    fpb.primaryAxisSizingMode='AUTO'; fpb.counterAxisSizingMode='FIXED'; fpb.fills=noFill();
    for(var bi=0;bi<bullets.length;bi++){
      var fpi=hrow('fpi-'+bi,12); fpi.counterAxisAlignItems='MIN';
      fpi.paddingTop=fpi.paddingBottom=12; fpi.fills=noFill();
      if(bi<bullets.length-1){fpi.strokes=[{type:'SOLID',color:hex(D.br)}]; fpi.strokeWeight=1; fpi.strokeAlign='OUTSIDE';}
      var fpbt=fr('fpbt'); fpbt.resize(5,5); fpbt.cornerRadius=3; fpbt.fills=fill(D.go);
      var bText=vcol('btext-'+bi,3);
      bText.appendChild(await bar(bullets[bi].title,13,D.tx,{lh:20}));
      bText.appendChild(await bar(bullets[bi].desc,13,D.mu,{lh:21,w:fpW-70}));
      fpi.appendChild(fpbt); fpi.appendChild(bText);
      fpb.appendChild(fpi);
    }
    fp.appendChild(fpb);
    return fp;
  };

  fg.appendChild(await featureCard(
    'Module 01','Module 01','Zapier to Sheets',
    'Inbound Visual Mapper',
    'Catch bulk JSON arrays in Zapier. Map them to your Sheet visually. No formulas. No code.',
    [{label:'Zapier Trigger',on:true},{label:'BSS Action',on:true},{label:'Mapper UI',on:false},{label:'Google Sheet',on:true}],
    [
      {title:'Drag-and-drop JSON to column mapping',desc:'Paste a sample payload, drag JSON keys onto Sheet headers. Mapping rules persist for every future webhook.'},
      {title:'Nested object flattening',desc:'Access order.customer.email directly in the mapper. Deep paths, zero manual parsing.'},
      {title:'Append, overwrite, or upsert',desc:'Choose how each sync writes. Upsert on a key column, overwrite a range, or append.'},
      {title:'1 Zapier task. Always.',desc:'50 rows or 50,000, the action fires once. Task count stays flat while data volume scales.'},
    ]
  ));

  fg.appendChild(await featureCard(
    'Module 02','Module 02','Sheets to Zapier',
    'Outbound Bulk Push',
    'Highlight rows, click Push. Hits your Zapier webhook in under a second, no 15-minute polling wait.',
    [{label:'Google Sheet',on:true},{label:'Add-on',on:true},{label:'BSS API',on:true},{label:'Zapier Webhook',on:false}],
    [
      {title:'Instant, not polled',desc:'Native Zapier Sheets triggers poll every 15 minutes. This Add-on pushes on-demand, delivered in milliseconds.'},
      {title:'Highlight any selection',desc:'Select 1 row or 10,000. Packages selection as structured JSON. Column headers become JSON keys automatically.'},
      {title:'Multi-destination routing',desc:'Configure multiple webhook endpoints per sheet. Route different selections to different Zaps from one sidebar.'},
      {title:'Google Workspace Marketplace',desc:'Installs in 30 seconds. No IT approval required for most plans. Works in browser and desktop Sheets.'},
    ]
  ));

  inner.appendChild(fg);
  sec.appendChild(inner);
  return sec;
}

// ── LP SECURITY ───────────────────────────────────────────────────────────────
async function buildLP_Security(){
  var sec=lpSec('LP · Security',D.bg);
  var inner=innerCol(0);

  inner.appendChild(await slLabel('Zero Data Residency'));
  inner.appendChild(rct('sp1',1,16));
  inner.appendChild(await h2('We process your data.\nWe ','never store it.',INNER));
  inner.appendChild(rct('sp2',1,12));
  inner.appendChild(await subHead('Stateless transit architecture. Your spreadsheet data never touches a database, never gets logged, never creates GDPR liability.',INNER));
  inner.appendChild(rct('sp3',1,44));

  // .sg2 — grid-template-columns:1fr 1fr, gap:36px
  var sg2=hrow('sg2',36); sg2.counterAxisAlignItems='MIN';
  var sgColW=Math.floor((INNER-36)/2);

  // Left: 4 security pillars (.sps .spl)
  var sps=vcol('sps',2);
  var pillars=[
    {title:'RAM-Only Processing',desc:'Your JSON payload is received, transformed, and forwarded entirely in memory. The moment the response is sent, the data is gone. No write path to any database for payload data.'},
    {title:'We Store Mapping Rules, Nothing Else',desc:'The only thing persisted is your column mapping schema — the structural instructions for how to rearrange data. A recipe, not the ingredients.'},
    {title:'Zero Data Residency Risk',desc:'No GDPR Article 28 processor liability. No SOC 2 scope creep. If your legal team asks "where does the data live?" — the honest answer is: it doesn\'t.'},
    {title:'OAuth2 Credential Isolation',desc:'Google Sheets tokens scoped per-user, never logged. Zapier webhook URLs stored encrypted at rest.'},
  ];
  for(var spi=0;spi<pillars.length;spi++){
    var spl=fr('spl-'+spi,sgColW); spl.cornerRadius=3; spl.layoutMode='VERTICAL';
    spl.paddingLeft=spl.paddingRight=22; spl.paddingTop=spl.paddingBottom=18; spl.itemSpacing=10;
    spl.primaryAxisSizingMode='AUTO'; spl.counterAxisSizingMode='FIXED';
    spl.fills=fill(D.sf); stroke(spl,D.brh);
    // Icon placeholder (22px colored box representing icon)
    var iconF=fr('spli'); iconF.resize(22,22); iconF.cornerRadius=3; iconF.fills=fill(D.go,0.12);
    iconF.layoutMode='HORIZONTAL'; iconF.counterAxisAlignItems='CENTER'; iconF.primaryAxisAlignItems='CENTER';
    iconF.primaryAxisSizingMode='FIXED'; iconF.counterAxisSizingMode='FIXED';
    var iDot=fr('id'); iDot.resize(8,8); iDot.cornerRadius=2; iDot.fills=fill(D.go,0.8);
    iconF.appendChild(iDot);
    spl.appendChild(iconF);
    spl.appendChild(await bgsb(pillars[spi].title,15,D.tx,{ls:-1.5,lh:20}));
    spl.appendChild(await bar(pillars[spi].desc,13,D.mu,{lh:21,w:sgColW-44}));
    sps.appendChild(spl);
  }
  // Zero badge
  var zbadge=fr('zbadge',sgColW); zbadge.cornerRadius=2; zbadge.layoutMode='HORIZONTAL';
  zbadge.counterAxisAlignItems='CENTER'; zbadge.paddingLeft=zbadge.paddingRight=14;
  zbadge.paddingTop=zbadge.paddingBottom=8; zbadge.itemSpacing=7;
  zbadge.primaryAxisSizingMode='AUTO'; zbadge.counterAxisSizingMode='AUTO';
  zbadge.fills=fill(D.go,0.10); zbadge.strokes=[{type:'SOLID',color:hex(D.go),opacity:0.28}]; zbadge.strokeWeight=1; zbadge.strokeAlign='INSIDE';
  zbadge.appendChild(await mmr('Stateless Transit — Zero payload persistence by design',11,D.go,{ls:4}));
  sps.appendChild(zbadge);
  sg2.appendChild(sps);

  // Right: code panel (.sc2)
  var sc2=fr('sc2',sgColW); sc2.cornerRadius=4; sc2.clipsContent=true;
  sc2.layoutMode='VERTICAL'; sc2.primaryAxisSizingMode='AUTO'; sc2.counterAxisSizingMode='FIXED';
  sc2.fills=fill(D.sf); stroke(sc2,D.brh);
  // Title bar
  var scb=fr('scb',sgColW); scb.layoutMode='HORIZONTAL'; scb.counterAxisAlignItems='CENTER';
  scb.paddingLeft=scb.paddingRight=14; scb.paddingTop=scb.paddingBottom=9; scb.itemSpacing=5;
  scb.primaryAxisSizingMode='FIXED'; scb.counterAxisSizingMode='AUTO';
  scb.fills=fill(D.sf2); scb.strokes=[{type:'SOLID',color:hex(D.br)}]; scb.strokeWeight=1; scb.strokeAlign='OUTSIDE';
  var sd1=fr('sd1'); sd1.resize(9,9); sd1.cornerRadius=5; sd1.fills=[{type:'SOLID',color:{r:0.55,g:0.23,b:0.16}}];
  var sd2=fr('sd2'); sd2.resize(9,9); sd2.cornerRadius=5; sd2.fills=[{type:'SOLID',color:{r:0.55,g:0.44,b:0.19}}];
  var sd3=fr('sd3'); sd3.resize(9,9); sd3.cornerRadius=5; sd3.fills=[{type:'SOLID',color:{r:0.23,g:0.44,b:0.25}}];
  scb.appendChild(sd1); scb.appendChild(sd2); scb.appendChild(sd3);
  scb.appendChild(await mmr('data-pipeline.ts',9,D.mu,{ls:2}));
  sc2.appendChild(scb);
  // Code body
  var scb2=fr('scb2',sgColW); scb2.layoutMode='VERTICAL'; scb2.primaryAxisSizingMode='AUTO'; scb2.counterAxisSizingMode='FIXED';
  scb2.paddingLeft=scb2.paddingRight=22; scb2.paddingTop=scb2.paddingBottom=20; scb2.itemSpacing=0;
  scb2.fills=fill(D.sf);
  var codeData=[
    {t:'// What our inbound handler does',c:D.dm},
    {t:'async function handleBulkInbound(req, res) {',c:'#9bbfdf'},
    {t:'  // 1. Load mapping rules only',c:D.dm},
    {t:'  const mapping = await db.getMapping(req.mappingId);',c:D.tx},
    {t:'  // 2. Payload lives ONLY in RAM',c:D.dm},
    {t:'  const rows = req.body.data; // never written to DB',c:D.tx},
    {t:'  // 3. Transform in memory',c:D.dm},
    {t:'  const mapped = applyMapping(rows, mapping);',c:D.tx},
    {t:'  // 4. Write to Sheets via OAuth',c:D.dm},
    {t:'  await sheets.batchUpdate(mapped);',c:D.go},
    {t:'  return res.json({ tasks: 1, rows: mapped.length });',c:D.tx},
    {t:'} // Zero persistence. Zero liability.',c:D.dm},
  ];
  for(var cdi=0;cdi<codeData.length;cdi++){
    var cdt=figma.createText();
    cdt.fontName={family:'Martian Mono',style:'Regular'}; cdt.fontSize=11;
    cdt.fills=fill(codeData[cdi].c||D.tx);
    cdt.lineHeight={value:23,unit:'PIXELS'};
    cdt.textAutoResize='WIDTH_AND_HEIGHT';
    cdt.characters=codeData[cdi].t||' ';
    scb2.appendChild(cdt);
  }
  sc2.appendChild(scb2);
  sg2.appendChild(sc2);
  inner.appendChild(sg2);
  sec.appendChild(inner);
  return sec;
}

// ── LP PRICING ────────────────────────────────────────────────────────────────
async function buildLP_Pricing(){
  var sec=lpSec('LP · Pricing',D.bg);
  var inner=innerCol(0);

  inner.appendChild(await slLabel('Pricing'));
  inner.appendChild(rct('sp1',1,16));
  inner.appendChild(await h2('Founding rates lock today.\n','Public rates live at launch.',INNER));
  inner.appendChild(rct('sp2',1,12));
  inner.appendChild(await subHead('Every tier priced against the Zapier task cost it replaces. The math is deliberately obvious.',INNER));
  inner.appendChild(rct('sp3',1,44));

  // .pcg — grid-template-columns:repeat(4,1fr), gap:2px
  var pcg=hrow('pcg',2); pcg.counterAxisAlignItems='MIN';
  pcg.primaryAxisSizingMode='FIXED'; pcg.counterAxisSizingMode='AUTO';
  pcg.resize(INNER,100);

  var tiers=[
    {name:'Free',price:'0',per:'',sub:'500 lifetime rows. No card required.',badge:null,badgeColor:null,color:D.brh,featured:false,ltd:false,
     features:[{on:true,text:'500 lifetime row credits'},{on:true,text:'Inbound Visual Mapper'},{on:true,text:'Outbound Add-on access'},{on:false,text:'Credits reset monthly',dim:true}],
     cta:'Join Waitlist',ctaStyle:'ghost'},
    {name:'Pay-As-You-Go',price:'19',per:'',sub:'10,000 row credits. Never expire.',badge:null,badgeColor:null,color:D.mu,featured:false,ltd:false,
     features:[{on:true,text:'10,000 row credits'},{on:true,text:'Credits never expire'},{on:true,text:'Inbound + Outbound'},{on:true,text:'One-time migrations'}],
     cta:'Join Waitlist',ctaStyle:'ghost'},
    {name:'Full Suite',price:'49',per:'/yr',strike:'$79',sub:'100k rows/mo. Both modules.',badge:'Founding Rate',badgeColor:D.go,color:D.go,featured:true,ltd:false,
     features:[{on:true,text:'100,000 rows/mo resets monthly'},{on:true,text:'Inbound Visual Mapper'},{on:true,text:'Outbound Bulk Push Add-on'},{on:true,text:'Unlimited mapping profiles'},{on:true,text:'Priority email support'}],
     cta:'Reserve Founding Spot',ctaStyle:'gold'},
    {name:'Agency Master',price:'349',per:' once',sub:'Unlimited fair-use. All client accounts.',badge:'Agency LTD',badgeColor:D.te,color:D.te,featured:false,ltd:true,
     features:[{on:true,text:'Unlimited rows (fair-use)',te:true},{on:true,text:'Unlimited client workspaces',te:true},{on:true,text:'All future modules included',te:true},{on:true,text:'White-label mapping dashboard',te:true},{on:true,text:'Dedicated Slack support',te:true}],
     cta:'Reserve Agency Spot',ctaStyle:'teal'},
  ];
  var tW=Math.floor((INNER-2*3)/4);

  for(var ti=0;ti<tiers.length;ti++){
    var tier=tiers[ti];
    var pc=fr('pc-'+tier.name,tW); pc.cornerRadius=4; pc.layoutMode='VERTICAL';
    pc.paddingLeft=pc.paddingRight=22; pc.paddingTop=26; pc.paddingBottom=26; pc.itemSpacing=0;
    pc.primaryAxisSizingMode='AUTO'; pc.counterAxisSizingMode='FIXED';
    if(tier.featured){
      pc.fills=[gradFill(tier.color,0.055),{type:'SOLID',color:hex(D.sf)}];
      pc.strokes=[{type:'SOLID',color:hex(tier.color),opacity:0.28}]; pc.strokeWeight=1; pc.strokeAlign='INSIDE';
    } else if(tier.ltd){
      pc.fills=[gradFill(tier.color,0.055),{type:'SOLID',color:hex(D.sf)}];
      pc.strokes=[{type:'SOLID',color:hex(tier.color),opacity:0.26}]; pc.strokeWeight=1; pc.strokeAlign='INSIDE';
    } else {
      pc.fills=fill(D.sf); stroke(pc,D.brh);
    }

    // Badge (positioned via top spacer row)
    if(tier.badge){
      var badgeRow=fr('badge-row',tW-44); badgeRow.layoutMode='HORIZONTAL'; badgeRow.counterAxisAlignItems='CENTER'; badgeRow.primaryAxisAlignItems='CENTER';
      badgeRow.primaryAxisSizingMode='FIXED'; badgeRow.counterAxisSizingMode='AUTO';
      badgeRow.fills=noFill();
      var pcbadge=fr('pcbadge'); pcbadge.cornerRadius=20; pcbadge.layoutMode='HORIZONTAL';
      pcbadge.counterAxisAlignItems='CENTER'; pcbadge.paddingLeft=pcbadge.paddingRight=10;
      pcbadge.paddingTop=pcbadge.paddingBottom=3; pcbadge.primaryAxisSizingMode='AUTO'; pcbadge.counterAxisSizingMode='AUTO';
      pcbadge.fills=fill(tier.badgeColor);
      pcbadge.appendChild(await mm(tier.badge,9,D.bg,{ls:10,upper:true}));
      badgeRow.appendChild(pcbadge);
      pc.paddingTop=12;
      pc.appendChild(badgeRow);
      pc.appendChild(rct('sp-badge',1,14));
    } else {
      pc.appendChild(rct('sp-nobadge',1,14));
    }

    pc.appendChild(await mm(tier.name,11,D.mu,{ls:12,upper:true}));
    pc.appendChild(rct('sp-name',1,16));

    // Price
    var prRow=hrow('pr-'+ti,3); prRow.counterAxisAlignItems='BASELINE';
    prRow.appendChild(await mmr('$',16,D.mu));
    prRow.appendChild(await bg(tier.price,44,D.tx,{ls:-4,lh:44}));
    if(tier.per)prRow.appendChild(await mmr(tier.per,11,D.mu));
    if(tier.strike)prRow.appendChild(await mmr(tier.strike,11,D.dm,{strike:true}));
    pc.appendChild(prRow);
    pc.appendChild(rct('sp-price',1,4));
    pc.appendChild(await bar(tier.sub,12,D.mu,{lh:19,w:tW-44}));
    pc.appendChild(rct('sp-sub',1,20));
    pc.appendChild(rct('div',tW-44,1,D.br));
    pc.appendChild(rct('sp-div',1,20));

    // Features
    var pcfs=vcol('pcfs-'+ti,9);
    for(var ffi2=0;ffi2<tier.features.length;ffi2++){
      var feat=tier.features[ffi2];
      var pfRow=hrow('pf-'+ffi2,8); pfRow.counterAxisAlignItems='MIN';
      var checkDot=fr('pfk'); checkDot.resize(12,12); checkDot.cornerRadius=6;
      var checkColor=feat.dim?D.dm:feat.te?D.te:feat.on?D.go:D.dm;
      checkDot.fills=fill(checkColor,feat.on?0.15:0.1); checkDot.strokes=[{type:'SOLID',color:hex(checkColor),opacity:0.4}]; checkDot.strokeWeight=1; checkDot.strokeAlign='INSIDE';
      pfRow.appendChild(checkDot);
      pfRow.appendChild(await bar(feat.text,12,feat.dim?D.dm:D.tx,{lh:18,w:tW-70}));
      pcfs.appendChild(pfRow);
    }
    pc.appendChild(pcfs);
    pc.appendChild(rct('sp-feats',1,20));

    // CTA button
    var pcbtn=fr('pcbtn-'+ti,tW-44); pcbtn.cornerRadius=3; pcbtn.layoutMode='HORIZONTAL';
    pcbtn.counterAxisAlignItems='CENTER'; pcbtn.primaryAxisAlignItems='CENTER';
    pcbtn.primaryAxisSizingMode='FIXED'; pcbtn.counterAxisSizingMode='FIXED'; pcbtn.resize(tW-44,44);
    if(tier.ctaStyle==='gold'){pcbtn.fills=fill(D.go); stroke(pcbtn,D.go);}
    else if(tier.ctaStyle==='teal'){pcbtn.fills=fill(D.te); stroke(pcbtn,D.te);}
    else{pcbtn.fills=noFill(); stroke(pcbtn,D.brh);}
    var btnTxtColor=tier.ctaStyle==='gold'?D.bg:tier.ctaStyle==='teal'?D.bg:D.tx;
    pcbtn.appendChild(await mm(tier.cta,11,btnTxtColor,{ls:4}));
    pc.appendChild(pcbtn);
    pcg.appendChild(pc);
  }
  inner.appendChild(pcg);

  // .pnote — below pricing grid
  inner.appendChild(rct('sp5',1,18));
  var pnote=fr('pnote',INNER); pnote.cornerRadius=3; pnote.layoutMode='HORIZONTAL';
  pnote.counterAxisAlignItems='CENTER';
  pnote.paddingLeft=pnote.paddingRight=16; pnote.paddingTop=pnote.paddingBottom=14;
  pnote.primaryAxisSizingMode='FIXED'; pnote.counterAxisSizingMode='AUTO';
  pnote.fills=fill(D.sf); stroke(pnote,D.brh);
  pnote.appendChild(await mmr('Full Suite vs Zapier Professional: $49 vs $1,788/yr   Agency LTD break-even: 7 years or 1 retainer   Effective monthly: $4.08/mo founding',10,D.mu,{ls:2,lh:21,w:INNER-32}));
  inner.appendChild(pnote);
  sec.appendChild(inner);
  return sec;
}

// ── LP FAQ ────────────────────────────────────────────────────────────────────
async function buildLP_FAQ(){
  var sec=lpSec('LP · FAQ',D.bg);
  var inner=innerCol(0);

  inner.appendChild(await slLabel('Technical FAQ'));
  inner.appendChild(rct('sp1',1,16));
  inner.appendChild(await h2('Questions your RevOps lead\nis going to ','ask anyway.',INNER));
  inner.appendChild(rct('sp3',1,44));

  var faqs=[
    {q:'Do you store my spreadsheet data or payload contents?',a:'No. Your actual row data and JSON payloads are processed entirely in RAM and immediately discarded after the operation completes. The only thing persisted is your mapping configuration. No payload contents, no row values, no webhook body data is ever logged.'},
    {q:'How do PAYG credits work? What counts as one row?',a:'One row credit = one row written to Google Sheets (Inbound) or one row sent in an Outbound push. A 200-object payload consumes 200 credits. Credits deduct only on confirmed success. PAYG credits never expire.'},
    {q:'Do I need a paid Zapier account?',a:'Yes. Both modules require at minimum Zapier Starter ($19.99/mo) because custom actions and webhook triggers are paid Zapier features. The entire value prop is that we eliminate the task multiplication that would otherwise force you onto Professional ($149/mo) or Team ($449/mo).'},
    {q:'What happens if a payload partially fails? Is there rollback?',a:'We use the Google Sheets batchUpdate API, which is atomic at the batch level. The entire write either succeeds or fails. No partial inserts. If the Sheets API returns an error, the whole batch rolls back. Row credits are only deducted on confirmed success.'},
    {q:'What does founding rate locked forever actually mean?',a:'No catch. Your $49/yr rate is stored against your account at signup. If we raise to $79, $99, or $149 — your billing stays at $49 indefinitely. The only scenario where this would not hold is shutting the product down entirely.'},
  ];

  var faqList=vcol('faq-list',2);
  for(var fi3=0;fi3<faqs.length;fi3++){
    var fqi=fr('fqi-'+fi3,INNER); fqi.cornerRadius=3; fqi.layoutMode='VERTICAL';
    fqi.primaryAxisSizingMode='AUTO'; fqi.counterAxisSizingMode='FIXED';
    fqi.fills=fill(D.sf); stroke(fqi,D.brh);
    // Question row
    var fqq=fr('fqq',INNER); fqq.layoutMode='HORIZONTAL'; fqq.counterAxisAlignItems='CENTER';
    fqq.paddingLeft=fqq.paddingRight=22; fqq.paddingTop=fqq.paddingBottom=18; fqq.itemSpacing=14;
    fqq.primaryAxisSizingMode='FIXED'; fqq.counterAxisSizingMode='AUTO'; fqq.fills=noFill();
    fqq.appendChild(await mm(faqs[fi3].q,11,D.tx,{ls:0,w:INNER-80}));
    var plus=fr('plus'); plus.resize(20,20); plus.cornerRadius=2; plus.layoutMode='HORIZONTAL';
    plus.counterAxisAlignItems='CENTER'; plus.primaryAxisAlignItems='CENTER';
    plus.primaryAxisSizingMode='FIXED'; plus.counterAxisSizingMode='FIXED';
    plus.fills=noFill();
    plus.appendChild(await mmr('+',18,D.mu));
    fqq.appendChild(plus);
    fqi.appendChild(fqq);
    // Answer
    fqi.appendChild(rct('fqa-div',INNER,1,D.br));
    var fqai=fr('fqai',INNER); fqai.layoutMode='VERTICAL';
    fqai.paddingLeft=fqai.paddingRight=22; fqai.paddingTop=fqai.paddingBottom=20;
    fqai.primaryAxisSizingMode='AUTO'; fqai.counterAxisSizingMode='FIXED'; fqai.fills=fill(D.bg);
    fqai.appendChild(await bar(faqs[fi3].a,14,D.mu,{lh:25,w:INNER-44}));
    fqi.appendChild(fqai);
    faqList.appendChild(fqi);
  }
  inner.appendChild(faqList);
  sec.appendChild(inner);
  return sec;
}

// ── LP FOOTER CTA ─────────────────────────────────────────────────────────────
async function buildLP_FooterCTA(){
  var sec=lpSec('LP · Footer CTA',D.bg);
  // No standard padding — this section is centered
  sec.counterAxisAlignItems='CENTER';

  var fci=fr('fci',INNER); fci.cornerRadius=6; fci.layoutMode='VERTICAL';
  fci.paddingLeft=fci.paddingRight=24; fci.paddingTop=fci.paddingBottom=64; fci.itemSpacing=0;
  fci.counterAxisAlignItems='CENTER'; fci.primaryAxisSizingMode='AUTO'; fci.counterAxisSizingMode='FIXED';
  // Radial gradient background
  fci.fills=[
    {type:'GRADIENT_RADIAL',
     gradientTransform:[[0.5,0,0.25],[0,0.5,0.25]],
     gradientStops:[{position:0,color:hexA(D.go,0.055)},{position:1,color:hexA(D.go,0)}]},
    {type:'SOLID',color:hex(D.bg)}
  ];
  stroke(fci,D.brh);

  // H — Bricolage, clamp(28-58px), weight 800
  var fch=figma.createText();
  fch.fontName={family:'Bricolage Grotesque',style:'Bold'}; fch.fontSize=52;
  fch.fills=fill(D.tx); fch.textAlignHorizontal='CENTER';
  fch.letterSpacing={value:-3.5,unit:'PERCENT'}; fch.lineHeight={value:55,unit:'PIXELS'};
  fch.textAutoResize='HEIGHT'; fch.resize(700,100);
  fch.characters='Stop paying Zapier\nfor counting rows.';
  fch.setRangeFills(25,38,fill(D.go));
  fci.appendChild(fch);
  fci.appendChild(rct('sp1',1,16));
  fci.appendChild(await bar('Founding rate: $49/yr, locked permanently. 253 spots remaining.',15,D.mu,{lh:24,align:'CENTER',w:500}));
  fci.appendChild(rct('sp2',1,28));

  // Email form
  var fcf=hrow('fcf',0); fcf.counterAxisAlignItems='CENTER';
  var fcfi=fr('fcfi'); fcfi.cornerRadius=3; fcfi.layoutMode='HORIZONTAL'; fcfi.counterAxisAlignItems='CENTER';
  fcfi.paddingLeft=fcfi.paddingRight=14; fcfi.primaryAxisSizingMode='FIXED'; fcfi.counterAxisSizingMode='FIXED';
  fcfi.resize(280,44); fcfi.fills=fill(D.sf); stroke(fcfi,D.brh,1);
  fcfi.appendChild(await mmr('you@company.com',12,D.mu));
  var fcfb=fr('fcfb'); fcfb.cornerRadius=0; fcfb.layoutMode='HORIZONTAL'; fcfb.counterAxisAlignItems='CENTER'; fcfb.primaryAxisAlignItems='CENTER';
  fcfb.paddingLeft=fcfb.paddingRight=18; fcfb.primaryAxisSizingMode='AUTO'; fcfb.counterAxisSizingMode='FIXED'; fcfb.resize(160,44);
  fcfb.fills=fill(D.go);
  fcfb.appendChild(await mm('Reserve Spot',11,D.bg,{ls:4}));
  fcf.appendChild(fcfi); fcf.appendChild(fcfb);
  fci.appendChild(fcf);
  fci.appendChild(rct('sp3',1,11));
  fci.appendChild(await mmr('No payment now — No spam — Founding rate locked at signup',9,D.dm,{ls:4,align:'CENTER',w:400}));
  sec.appendChild(fci);
  return sec;
}

// ── LP FOOTER ─────────────────────────────────────────────────────────────────
async function buildLP_Footer(){
  var sec=fr('LP · Footer',W);
  sec.layoutMode='HORIZONTAL'; sec.counterAxisAlignItems='CENTER';
  sec.primaryAxisSizingMode='FIXED'; sec.counterAxisSizingMode='AUTO';
  sec.paddingLeft=sec.paddingRight=LP_PAD; sec.paddingTop=sec.paddingBottom=28;
  sec.fills=fill(D.bg); stroke(sec,D.br,1);

  var inner=hrow('fi2',0); inner.counterAxisAlignItems='CENTER';
  inner.primaryAxisSizingMode='FIXED'; inner.counterAxisSizingMode='AUTO';
  inner.resize(INNER,40); inner.fills=noFill();

  inner.appendChild(await mmr('2025 BulkSheetsSync. Built for people who read Zapier invoices.',10,D.dm,{ls:2}));

  var fsp=fr('fsp'); fsp.layoutMode='HORIZONTAL'; fsp.primaryAxisSizingMode='FIXED'; fsp.counterAxisSizingMode='AUTO'; fsp.resize(1,1); fsp.fills=noFill(); fsp.layoutGrow=1;
  inner.appendChild(fsp);

  var flinks=hrow('flinks',18);
  var linkItems=['Privacy','Terms','Docs','Status'];
  for(var li=0;li<linkItems.length;li++){
    flinks.appendChild(await mmr(linkItems[li],10,D.dm,{ls:2}));
  }
  inner.appendChild(flinks);
  sec.appendChild(inner);
  return sec;
}

// ══════════════════════════════════════════════════════════════════════════════
// REGISTRIES
// ══════════════════════════════════════════════════════════════════════════════
var SG_PAGE='BSS Style Guide', LP_PAGE='BSS Landing Page';

var SG_NAMES={
  colour:'01 · Colour',typography:'02 · Typography',buttons:'03 · Buttons',
  inputs:'04 · Inputs',tags:'05 · Tags',cards:'06 · Cards',dodont:'07 Do Dont'
};
var SG_BUILDERS={
  colour:buildSG_Colour,typography:buildSG_Typography,buttons:buildSG_Buttons,
  inputs:buildSG_Inputs,tags:buildSG_Tags,cards:buildSG_Cards,dodont:buildSG_DoDont
};
var LP_NAMES={
  nav:'LP · Nav',hero:'LP · Hero',launch:'LP · Launch',problem:'LP · Problem',
  features:'LP · Features',security:'LP · Security',pricing:'LP · Pricing',
  faq:'LP · FAQ',footercta:'LP · Footer CTA',footer:'LP · Footer'
};
var LP_BUILDERS={
  nav:buildLP_Nav,hero:buildLP_Hero,launch:buildLP_Launch,problem:buildLP_Problem,
  features:buildLP_Features,security:buildLP_Security,pricing:buildLP_Pricing,
  faq:buildLP_FAQ,footercta:buildLP_FooterCTA,footer:buildLP_Footer
};
var SG_ORDER=['colour','typography','buttons','inputs','tags','cards','dodont'];
var LP_ORDER=['nav','hero','launch','problem','features','security','pricing','faq','footercta','footer'];

async function runBuild(pageName,keys,nameMap,builderMap,order){
  await loadFonts();
  var pg=getOrCreatePage(pageName); figma.currentPage=pg;
  var ordered=order.filter(function(k){return keys.indexOf(k)!==-1;});
  for(var i=0;i<ordered.length;i++){
    var key=ordered[i];
    status('Building '+nameMap[key]+'...');
    clearSec(pg,nameMap[key]);
    var node=await builderMap[key]();
    pg.appendChild(node);
  }
  if(pageName===SG_PAGE&&keys.indexOf('dodont')!==-1){status('Variables...'); await buildVariablesAndStyles();}
  // Stack with 0 gap (sections are visually separated by border-top)
  restack(pg,0);
  figma.viewport.scrollAndZoomIntoView(pg.children);
}

function runRemove(pageName,keys,nameMap,order){
  var pg=getOrCreatePage(pageName); figma.currentPage=pg;
  if(keys==='all'){Array.prototype.slice.call(pg.children).forEach(function(n){n.remove();});}
  else{order.filter(function(k){return keys.indexOf(k)!==-1;}).forEach(function(k){clearSec(pg,nameMap[k]);});restack(pg,0);}
}

figma.ui.onmessage=async function(msg){
  try{
    switch(msg.type){
      case 'BUILD_SG': await runBuild(SG_PAGE,msg.sections,SG_NAMES,SG_BUILDERS,SG_ORDER); figma.ui.postMessage({type:'DONE',msg:'Style guide built'}); break;
      case 'REMOVE_SG': runRemove(SG_PAGE,msg.sections,SG_NAMES,SG_ORDER); figma.ui.postMessage({type:'DONE',msg:'Removed'}); break;
      case 'BUILD_LP': await runBuild(LP_PAGE,msg.sections,LP_NAMES,LP_BUILDERS,LP_ORDER); figma.ui.postMessage({type:'DONE',msg:'Landing page built'}); break;
      case 'REMOVE_LP': runRemove(LP_PAGE,msg.sections,LP_NAMES,LP_ORDER); figma.ui.postMessage({type:'DONE',msg:'Removed'}); break;
      case 'CLOSE': figma.closePlugin(); break;
    }
  }catch(e){figma.ui.postMessage({type:'ERROR',msg:e.message||'Unknown error'});}
};
