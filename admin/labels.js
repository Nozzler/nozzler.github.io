/* Nozzler box labels: the "Labels" tab. Every label is a JSON template (admin/labels.defaults.js + your overrides),
   built into a small scene (mm) and exported as SVG, PNG (any dpi), vector PDF, print sheets or ZIP. No libraries, works offline.
   Loaded by admin/index.html after cloud.js and labels.defaults.js. Uses the app globals S, CF, esc, $, toast, save, tab, render, bc, rcRows. */
(()=>{
const MM=72/25.4,N=v=>+(+v).toFixed(2),X=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
/* Helvetica / Helvetica-Bold advance widths for ASCII 32..126 (same metrics in the SVG via Arial/Helvetica) */
const WR=[278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584],
WB=[278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,556,556,778,556,556,500,389,280,389,584];
const tw=(s,z,b)=>[...String(s)].reduce((a,c)=>a+((b?WB:WR)[c.charCodeAt(0)-32]||556),0)*z/1000;
const wrap=(s,z,b,mw)=>{const o=[];for(const p of String(s).split("\n")){let l="";for(const w of p.split(/\s+/).filter(Boolean)){const t=l?l+" "+w:w;if(!l||tw(t,z,b)<=mw)l=t;else{o.push(l);l=w}}o.push(l)}return o};
const fit=(s,z,b,mw,mn=2)=>{while(z>mn&&tw(s,z,b)>mw)z-=.2;return z};
const cut=(s,z,b,mw)=>{s=String(s);if(tw(s,z,b)<=mw)return s;while(s.length>1&&tw(s+"…",z,b)>mw)s=s.slice(0,-1);return s+"…"};
let PAL={color:{}},BR={wordmark:[["",""]],tagline:""};
const C=(t,m)=>t&&(t[0]=="#"?t:PAL[m][t]),hx=c=>[1,3,5].map(i=>parseInt(c.substr(i,2),16));
const norm=(e,m)=>{const o={...e},f=e.f;o.f=f?C(f,m):null;o.s=e.s?C(e.s,m):null;
 if(m=="bw"&&e.k!="t"&&f&&["lt","l2","pp","ln"].includes(f)){if(f=="ln")o.f="#ffffff";if(!o.s){o.s="#000000";o.sw=.25}}return o};
/* scene primitives (mm, origin top-left, y of text = baseline) */
const R=(x,y,w,h,o={})=>({k:"r",x,y,w,h,...o}),L=(x,y,x2,y2,o={})=>({k:"l",x,y,x2,y2,...o}),P=(p,o={})=>({k:"p",p,...o}),T=(x,y,t,o={})=>({k:"t",x,y,t,...o});
const logo=(x,y,h,o={})=>{const k=h/96,u=v=>x+v*k,w=v=>y+v*k,e=[R(u(28),w(6),40*k,18*k,{f:"st",r:4*k}),P([[34,24],[62,24],[53,46],[43,46]].map(q=>[u(q[0]),w(q[1])]),{f:"lt"}),R(u(45),w(46),6*k,5*k,{f:"ac",r:k}),
 R(u(12),w(56),72*k,9*k,{f:"l2",r:4.5*k}),R(u(12),w(68),72*k,9*k,{f:"o2",r:4.5*k}),R(u(12),w(80),72*k,9*k,{f:"d2",r:4.5*k})];
 if(!o.mark)e.push(T(u(108),w(60),BR.wordmark,{z:46*k,b:1}),T(u(110),w(80),BR.tagline,{z:10*k,b:1,f:"mu"}));return e};
const bars=(x,y,w,h,id)=>{const b=bc(id),k=w/b.n;return b.r.map(q=>R(x+q[0]*k,y,q[1]*k,h,{f:"ink"}))};
/* rotate a finished scene 90 degrees clockwise (shapes are remapped, text keeps its run layout and is drawn rotated) */
const rot90=sc=>{const H=sc.h;return{w:sc.h,h:sc.w,e:sc.e.map(e=>e.k=="t"?{...e,rot:1,H}:e.k=="r"?{...e,x:H-e.y-e.h,y:e.x,w:e.h,h:e.w}:e.k=="l"?{...e,x:H-e.y,y:e.x,x2:H-e.y2,y2:e.x2}:{...e,p:e.p.map(q=>[H-q[1],q[0]])})}};
const tp=(e,r)=>e.rot?[e.H-e.y,r.x]:[r.x,e.y];
/* ---------- exporters ---------- */
const runs=(e,m)=>{const rs=(typeof e.t=="string"?[[e.t,e.f||"ink"]]:e.t).map(r=>[r[0],C(r[1]||"ink",m)]),w=rs.reduce((a,r)=>a+tw(r[0],e.z,e.b),0);let x=e.x-(e.a=="m"?w/2:e.a=="r"?w:0);return rs.map(r=>{const q={x,t:r[0],c:r[1]};x+=tw(r[0],e.z,e.b);return q})};
const svg=(sc,m)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${sc.w}mm" height="${sc.h}mm" viewBox="0 0 ${sc.w} ${sc.h}"><rect width="${sc.w}" height="${sc.h}" fill="#fff"/>`+sc.e.map(e=>{
 if(e.k=="t")return runs(e,m).map(r=>{const[px,py]=tp(e,r);return`<text x="${N(px)}" y="${N(py)}"${e.rot?` transform="rotate(90 ${N(px)} ${N(py)})"`:""} font-size="${N(e.z)}" font-family="Helvetica,Arial,sans-serif" font-weight="${e.b?700:400}" fill="${r.c}">${X(r.t)}</text>`}).join("");
 const o=norm(e,m),a=`fill="${o.f||"none"}"${o.s?` stroke="${o.s}" stroke-width="${o.sw||.3}"`:""}${o.d?` stroke-dasharray="${o.d.join(" ")}"`:""}`;
 return o.k=="r"?`<rect x="${N(o.x)}" y="${N(o.y)}" width="${N(o.w)}" height="${N(o.h)}"${o.r?` rx="${N(o.r)}"`:""} ${a}/>`:o.k=="l"?`<line x1="${N(o.x)}" y1="${N(o.y)}" x2="${N(o.x2)}" y2="${N(o.y2)}" ${a}/>`:`<polygon points="${o.p.map(q=>N(q[0])+","+N(q[1])).join(" ")}" ${a}/>`}).join("")+"</svg>";
const WA={"€":128,"‚":130,"„":132,"…":133,"‘":145,"’":146,"“":147,"”":148,"•":149,"–":150,"—":151,"™":153},
 pe=s=>[...s].map(c=>{const n=c.charCodeAt(0),v=WA[c]||(n<256?n:63);return String.fromCharCode(v)}).join("").replace(/[\\()]/g,"\\$&");
const pc=(sc,m)=>{const H=sc.h*MM,Y=y=>N(H-y*MM),Z=v=>N(v*MM),F=c=>hx(c).map(v=>(v/255).toFixed(3)).join(" ");
 const rr=(x,y,w,h,r)=>{r=Math.min(r||0,w/2,h/2);const a=Z(x),b=Y(y+h),c=Z(w),d=Z(h);if(!r)return`${a} ${b} ${c} ${d} re `;r=Z(r);const k=N(r*.4477),e=a+c,g=N(b+d);
  return`${N(a+r)} ${b} m ${N(e-r)} ${b} l ${N(e-k)} ${b} ${e} ${N(b+k)} ${e} ${N(b+r)} c ${e} ${N(g-r)} l ${e} ${N(g-k)} ${N(e-k)} ${g} ${N(e-r)} ${g} c ${N(a+r)} ${g} l ${N(a+k)} ${g} ${a} ${N(g-k)} ${a} ${N(g-r)} c ${a} ${N(b+r)} l ${a} ${N(b+k)} ${N(a+k)} ${b} ${N(a+r)} ${b} c h `};
 let s="1 1 1 rg 0 0 "+Z(sc.w)+" "+Z(sc.h)+" re f\n";
 for(const e of sc.e){if(e.k=="t"){for(const r of runs(e,m)){const[px,py]=tp(e,r);s+=`${F(r.c)} rg BT /F${e.b?2:1} ${Z(e.z)} Tf ${e.rot?`0 -1 1 0 ${Z(px)} ${Y(py)} Tm`:`${Z(px)} ${Y(py)} Td`} (${pe(r.t)}) Tj ET\n`}continue}
  const o=norm(e,m);let g=(o.f?F(o.f)+" rg ":"")+(o.s?F(o.s)+" RG "+Z(o.sw||.3)+" w ":"")+(o.d?`[${Z(o.d[0])} ${Z(o.d[1])}] 0 d `:"[] 0 d ");
  if(o.k=="r")g+=rr(o.x,o.y,o.w,o.h,o.r);else if(o.k=="l")g+=`${Z(o.x)} ${Y(o.y)} m ${Z(o.x2)} ${Y(o.y2)} l `;else g+=o.p.map((q,i)=>`${Z(q[0])} ${Y(q[1])} ${i?"l":"m"} `).join("")+"h ";
  s+=g+(o.k=="l"?"S":o.f&&o.s?"B":o.f?"f":"S")+"\n"}return s};
/* pages: [{w,h,it:[{sc,x,y,border}]}] in mm; one scene per page for plain label PDFs, many per page for print sheets */
const pdfPages=(pages,m)=>{let o="%PDF-1.4\n",of=[];const ob=(n,s)=>{of[n]=o.length;o+=n+" 0 obj\n"+s+"\nendobj\n"};
 ob(1,"<</Type/Catalog/Pages 2 0 R>>");ob(2,`<</Type/Pages/Count ${pages.length}/Kids[${pages.map((_,i)=>5+i*2+" 0 R").join(" ")}]>>`);
 ob(3,"<</Type/Font/Subtype/Type1/BaseFont/Helvetica/Encoding/WinAnsiEncoding>>");ob(4,"<</Type/Font/Subtype/Type1/BaseFont/Helvetica-Bold/Encoding/WinAnsiEncoding>>");
 pages.forEach((pg,i)=>{let s="";for(const it of pg.it){s+=`q 1 0 0 1 ${N(it.x*MM)} ${N((pg.h-it.y-it.sc.h)*MM)} cm\n`+pc(it.sc,m);if(it.border)s+=`0.7 G 0.2 w [1.5 1.5] 0 d 0 0 ${N(it.sc.w*MM)} ${N(it.sc.h*MM)} re S [] 0 d\n`;s+="Q\n"}
  ob(5+i*2,`<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${N(pg.w*MM)} ${N(pg.h*MM)}]/Resources<</Font<</F1 3 0 R/F2 4 0 R>>>>/Contents ${6+i*2} 0 R>>`);ob(6+i*2,`<</Length ${s.length}>>\nstream\n${s}\nendstream`)});
 const x=o.length,n=5+pages.length*2;o+=`xref\n0 ${n}\n0000000000 65535 f \n`+of.slice(1).map(v=>String(v).padStart(10,"0")+" 00000 n \n").join("")+`trailer\n<</Size ${n}/Root 1 0 R>>\nstartxref\n${x}\n%%EOF`;
 return Uint8Array.from(o,c=>c.charCodeAt(0))};
const pdf=(L,m)=>pdfPages(L.map(sc=>({w:sc.w,h:sc.h,it:[{sc,x:0,y:0}]})),m);
const png=async(sc,m,dpi)=>{const im=new Image();await new Promise((ok,no)=>{im.onload=ok;im.onerror=no;im.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg(sc,m))});
 const cv=document.createElement("canvas");cv.width=Math.round(sc.w/25.4*dpi);cv.height=Math.round(sc.h/25.4*dpi);cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);return new Promise(r=>cv.toBlob(r,"image/png"))};
const crcT=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})(),crc=u=>{let c=-1;for(const b of u)c=crcT[(c^b)&255]^(c>>>8);return(c^-1)>>>0};
/* stored (uncompressed) zip; the central directory entry is 46 bytes + name */
const zip=fs=>{const u2=v=>[v&255,v>>8&255],u4=v=>[v&255,v>>8&255,v>>16&255,v>>>24&255],ps=[],cd=[];let off=0;
 for(const f of fs){const nm=new TextEncoder().encode(f.n),c=crc(f.d),a=[...u4(c),...u4(f.d.length),...u4(f.d.length),...u2(nm.length),0,0];
  ps.push(new Uint8Array([0x50,0x4b,3,4,20,0,0,8,0,0,0,0,33,0,...a]),nm,f.d);
  cd.push(new Uint8Array([0x50,0x4b,1,2,20,0,20,0,0,8,0,0,0,0,33,0,...u4(c),...u4(f.d.length),...u4(f.d.length),...u2(nm.length),0,0,0,0,0,0,0,0,0,0,0,0,...u4(off)]),nm);off+=30+nm.length+f.d.length}
 const sz=cd.reduce((a,b)=>a+b.length,0);return new Blob([...ps,...cd,new Uint8Array([0x50,0x4b,5,6,0,0,0,0,...u2(fs.length),...u2(fs.length),...u4(sz),...u4(off),0,0])],{type:"application/zip"})};
const dl=(b,n)=>{const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=n;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},3000)};
/* ---------- sheet (several labels per page) ---------- */
const PAPER={a4:[210,297,"A4"],a5:[148,210,"A5"],letter:[215.9,279.4,"US Letter"],a3:[297,420,"A3"]};
const packSheet=(scs,o)=>{const P=PAPER[o.paper]||PAPER.a4;let W=P[0],H=P[1];if(+o.land)[W,H]=[H,W];const m=+o.margin||0,g=+o.gap||0,pages=[];let pg,x,y,rh,over=0;
 const np=()=>{pg={w:W,h:H,it:[]};pages.push(pg);x=m;y=m;rh=0};np();
 for(const sc of scs){if(sc.w>W-2*m+.01||sc.h>H-2*m+.01)over++;
  if(x>m&&x+sc.w>W-m+.01){x=m;y+=rh+g;rh=0}
  if(pg.it.length&&y+sc.h>H-m+.01)np();
  pg.it.push({sc,x,y,border:+o.border});x+=sc.w+g;rh=Math.max(rh,sc.h)}
 return{pages,over}};
/* ---------- tiny expression language (numbers, strings, + - * / %, comparisons, && || !, a?b:c, min/max/round/floor/ceil/len) ---------- */
const FN={min:Math.min,max:Math.max,round:Math.round,floor:Math.floor,ceil:Math.ceil,len:v=>v==null?0:v.length,upper:v=>String(v==null?"":v).toUpperCase(),lower:v=>String(v==null?"":v).toLowerCase()},TK=new Map();
const lex=src=>{let t=TK.get(src);if(t)return t;t=[];const re=/\s*(?:(\d*\.?\d+)|([A-Za-z_$][\w.$]*)|'([^']*)'|"([^"]*)"|(&&|\|\||==|!=|<=|>=|[-+*\/%<>!?:(),]))/y;let p=0;
 while(p<src.length){if(/^\s*$/.test(src.slice(p)))break;re.lastIndex=p;const m=re.exec(src);if(!m)throw new Error("Cannot read “"+src+"” near “"+src.slice(p,p+12)+"”");p=re.lastIndex;
  t.push(m[1]!==undefined?{n:+m[1]}:m[2]!==undefined?{i:m[2]}:m[3]!==undefined?{s:m[3]}:m[4]!==undefined?{s:m[4]}:{o:m[5]})}
 TK.set(src,t);return t};
const getp=(c,path)=>{let v=c;for(const k of path.split(".")){if(v==null)return undefined;v=v[k]}return v};
const add=(a,b)=>typeof a=="string"||typeof b=="string"?(a??"")+(b??""):(+a||0)+(+b||0),nn=v=>+v||0;
const OPS={"||":(a,b)=>a||b,"&&":(a,b)=>a&&b,"==":(a,b)=>a==b,"!=":(a,b)=>a!=b,"<":(a,b)=>a<b,">":(a,b)=>a>b,"<=":(a,b)=>a<=b,">=":(a,b)=>a>=b,"+":add,"-":(a,b)=>nn(a)-nn(b),"*":(a,b)=>nn(a)*nn(b),"/":(a,b)=>nn(a)/(nn(b)||1),"%":(a,b)=>nn(a)%(nn(b)||1)};
const LV=[["||"],["&&"],["==","!="],["<",">","<=",">="],["+","-"],["*","/","%"]];
const ev=(src,c)=>{src=String(src);const tk=lex(src);let p=0;const pk=()=>tk[p],eat=o=>{if(tk[p]&&tk[p].o===o){p++;return true}return false};
 const prim=()=>{const t=tk[p++];if(!t)throw new Error("Unfinished expression “"+src+"”");
  if("n"in t)return t.n;if("s"in t)return t.s;
  if(t.i!==undefined){if(pk()&&pk().o==="("){p++;const a=[];if(!eat(")")){do a.push(tern());while(eat(","));eat(")")}const f=FN[t.i];if(!f)throw new Error("Unknown function “"+t.i+"”");return f(...a)}
   if(t.i==="true")return true;if(t.i==="false")return false;return getp(c,t.i)}
  if(t.o==="(" ){const v=tern();eat(")");return v}if(t.o==="-")return -nn(prim());if(t.o==="!")return !prim();throw new Error("Unexpected “"+t.o+"” in “"+src+"”")};
 const lvl=i=>{if(i===LV.length)return prim();let a=lvl(i+1);for(;;){const t=pk();if(t&&t.o&&LV[i].includes(t.o)){p++;a=OPS[t.o](a,lvl(i+1))}else return a}};
 const tern=()=>{const q=lvl(0);if(eat("?")){const a=tern();eat(":");const b=tern();return q?a:b}return q};
 const r=tern();if(p<tk.length){const t=tk[p];throw new Error("Unexpected “"+(t.o||t.i||t.s||t.n)+"” in “"+src+"”")}return r};
const fx=(s,c)=>{s=String(s==null?"":s);for(let k=0;k<3&&s.includes("{{");k++)s=s.replace(/\{\{([\s\S]+?)\}\}/g,(_,e)=>{const v=ev(e,c);return v==null||v===false?"":v});return s};
const nv=(v,c)=>v==null?0:typeof v=="number"?v:nn(ev(v,c));
/* ---------- config: JSON defaults + your overrides (saved in S.lblcfg) ---------- */
const DEF=window.LABEL_DEFAULTS||{brand:{},defaults:{},palettes:{color:{}},texts:{en:{}},templates:[]};
const isO=v=>v&&typeof v=="object"&&!Array.isArray(v);
const dmerge=(a,b)=>{if(!isO(a)||!isO(b))return b===undefined?a:b;const o={...a};for(const k in b)o[k]=isO(a[k])&&isO(b[k])?dmerge(a[k],b[k]):b[k];return o};
let CM=null,CK="";
const patch=()=>isO(S.lblcfg)?S.lblcfg:(S.lblcfg={});
const cfg=()=>{const p=isO(S.lblcfg)?S.lblcfg:{},k=JSON.stringify(p);if(CM&&k==CK)return CM;
 const{templates:tp=[],...rest}=p,{templates:dt=[],...base}=DEF,o=dmerge(base,rest),list=dt.map(t=>({...t}));
 for(const q of Array.isArray(tp)?tp:[]){if(!q||!q.id)continue;const{replace,...r}=q,i=list.findIndex(t=>t.id==q.id);if(i<0)list.push(r);else list[i]=replace?r:{...list[i],...r}}
 o.templates=list.filter(t=>!t.hidden);CM=o;CK=k;return o};
const setPatch=(path,val)=>{let o=patch();const ks=path.split(".");for(let i=0;i<ks.length-1;i++)o=isO(o[ks[i]])?o[ks[i]]:(o[ks[i]]={});o[ks[last(ks)]]=val};
const last=a=>a.length-1;
const U=()=>{const d=cfg().defaults||{},u=S.lblui=S.lblui||{};u.m=u.m||d.style||"color";if(u.lang==null)u.lang=d.lang||"";u.fmt=u.fmt||d.fmt||"pdf";u.dpi=u.dpi||d.dpi||300;u.zoom=u.zoom||d.zoom||100;
 u.tab=u.tab||"make";u.on=u.on||{};u.rot=u.rot||{};u.copies=u.copies||{};u.vars=u.vars||{};u.sel=u.sel||"delivery";u.sheet={...(d.sheet||{}),...(u.sheet||{})};u.id=u.id||"";return u};
const isOn=(t,u)=>t.id in u.on?!!u.on[t.id]:!!t.on,isRot=(t,u)=>t.id in u.rot?!!u.rot[t.id]:!!t.rotate,cop=(t,u)=>Math.max(1,+(u.copies[t.id]||t.copies||1));
const tvars=(t,u)=>{const o={};for(const[k,d]of Object.entries(t.vars||{})){const v=(u.vars[t.id]||{})[k];o[k]=v!==undefined?+v:+d.v}return o};
/* ---------- order data ---------- */
const billOf=id=>S.bills.find(b=>b[0]==id),REQS=()=>typeof REQ!="undefined"?REQ:[],PROS=()=>typeof PRO!="undefined"?PRO:{};
const reqOf=b=>b[17]&&REQS().find(r=>r.id==b[17]);
const cust=b=>{const r=reqOf(b),p=r?(r.contact||PROS()[r.user_id]||{}):{},d=b[16]||{};return{name:p.name||"",where:d.loc||(r&&r.delivery_where)||""}};
const defParts=b=>{const m=b[11]||{},pl=m.plates||[],r=reqOf(b),it=r&&r.options&&r.options.items,mt=x=>[x.m,x.w&&x.w+" g"].filter(Boolean).join(" · ");
 if(pl.length>1)return pl.map(p=>({n:p.name||"Plate "+p.plateNum,q:1,x:1,d:mt(p)}));
 if(it&&it.length)return it.map(i=>({n:i.name,q:i.qty||1,x:1,d:[(i.cl||[]).map(c=>c.n).join("+")||i.colour,i.m].filter(Boolean).join(" · ")}));
 return[{n:b[1],q:(r&&r.options&&+r.options.qty)||1,x:1,d:mt(m)}]};
const plan=id=>{S.lbl=S.lbl||{};let p=S.lbl[id];if(!p||!p.parts)p=S.lbl[id]={n:1,pp:1,parts:defParts(billOf(id))};return p};
const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"nozzler";
const of_=(pl,i)=>pl.parts.filter(p=>p.x==i);
const sumQ=ps=>ps.reduce((a,p)=>a+(+p.q||0),0);
const baseCtx=(b,pl,lang)=>{const C0=cfg(),d=b[16]||{},cu=cust(b),t={...(C0.texts.en||{}),...(C0.texts[lang]||{})},
 all=pl.parts.map(p=>p.d).join(" ")+" "+((b[11]||{}).m||"")+" "+((b[11]||{}).plates||[]).map(p=>p.m).join(" ");
 return{id:b[0],name:b[1],date:b[2],account:b[3],customer:cu.name,where:cu.where,due:d.due||"",boxes:pl.n,pp:pl.pp,allpieces:sumQ(pl.parts),partsn:pl.parts.length,
  today:new Date().toLocaleDateString(lang=="nl"?"nl-NL":"en-GB",{day:"numeric",month:"long",year:"numeric"}),
  info:[cu.where&&t.deliver+": "+cu.where,d.due&&t.need+" "+d.due].filter(Boolean).join("   "),idline:"#"+b[0]+(cu.name?"  ·  "+cu.name:""),
  material:(b[11]||{}).m||"",weight:(b[11]||{}).w?(b[11]||{}).w+" g":"",time:(b[11]||{}).t?(Math.floor(b[11].t/60)?Math.floor(b[11].t/60)+"h ":"")+Math.round(b[11].t%60)+"m":"",plates:((b[11]||{}).plates||[]).length,
  brand:C0.brand,t,lang,shop:CF().shop,_:{b,mats:new Set(all.match(/\b(PLA|PETG|ABS|ASA|TPU|PA|Carbon)\b/g)||[])}}};
/* ---------- template interpreter ---------- */
const RCH={h:9,c:6,t:6,sep:4,kv:5,big:9,bar:15,stamp:14},rch=(r,w)=>r[0]=="c"?wrap(r[1],3.3,0,w-10).length*4.2+2:RCH[r[0]]||5,rcHeight=(b,w=80)=>Math.ceil(12+rcRows(b).reduce((a,r)=>a+rch(r,w),0));
const plist=(out,ps,x,y,w,y2,z,t)=>{let k=0;for(const p of ps){const h=z*(p.d?2.15:1.4);if(y+h>y2){out.push(T(x,y,"+ "+(ps.length-k)+" "+t.more,{z,f:"mu"}));return}
 out.push(T(x,y,p.q+"×",{z,b:1}),T(x+z*2.4,y,cut(p.n,z,1,w-z*2.4),{z,b:1}));if(p.d)out.push(T(x+z*2.4,y+z*.95,cut(p.d,z*.8,0,w-z*2.4),{z:z*.8,f:"mu"}));y+=h;k++}};
const slipRows=(out,ps,x,y,w,y2,t,tick)=>{for(let k=0;k<ps.length;k++){const p=ps[k];if(y>y2){out.push(T(x+24,y,"+ "+(ps.length-k)+" "+t.more,{z:3.8,f:"mu"}));break}
 if(tick)out.push(R(x+1,y-3.4,3.8,3.8,{s:"ink",sw:.35}));out.push(T(x+8,y,String(p.q),{z:4.6,b:1}),T(x+24,y,cut(p.n,4.6,1,w-28),{z:4.6,b:1}));if(p.d)out.push(T(x+24,y+4.2,cut(p.d,3.3,0,w-28),{z:3.3,f:"mu"}));out.push(L(x,y+6.4,x+w,y+6.4,{s:"ln",sw:.2}));y+=11}};
const pick=(el,o,ks)=>{for(const k of ks)if(el[k]!==undefined)o[k]=el[k];return o};
const textEl=(el,c,out,x,y)=>{let z=nv(el.z==null?3.5:el.z,c);if(el.text==="@wordmark"){if(el.fit!=null)z=fit(BR.wordmark.map(r=>r[0]).join(""),z,1,nv(el.fit,c),el.min||2);out.push(T(x,y,BR.wordmark,{z,b:1,a:el.a}));return}let s=fx(el.text,c);const b=el.b?1:0;if(!s)return;if(el.fit!=null)z=fit(s,z,b,nv(el.fit,c),el.min||2);if(el.cut!=null)s=cut(s,z,b,nv(el.cut,c));out.push(el.rot?{...T(y,-x,s,{z,b,a:el.a,f:el.f}),rot:1,H:0}:T(x,y,s,{z,b,a:el.a,f:el.f}))};
const paras=(el,c,out,x,y,w)=>{const list=el.list?(getp(c,el.list)||[]):[el.text],z=nv(el.z==null?3.5:el.z,c),lh=el.lh!=null?nv(el.lh,c):z*1.5,gap=nv(el.gap,c),b=el.b?1:0;
 for(const p of list){for(const l of wrap(fx(p,c),z,b,w)){if(l)out.push(T(x,y,l,{z,b,a:el.a,f:el.f}));y+=lh}y+=gap}return y};
const emit=(el,c,out)=>{if(el.if!=null&&!ev(el.if,c))return;const n=k=>nv(el[k],c);
 switch(el.k){
 case"rect":out.push(R(n("x"),n("y"),n("w"),n("h"),pick(el,el.r!=null?{r:n("r")}:{},["f","s","sw","d"])));break;
 case"line":out.push(L(n("x"),n("y"),n("x2"),n("y2"),pick(el,{},["s","sw","d"])));break;
 case"poly":out.push(P(el.p.map(q=>[nv(q[0],c),nv(q[1],c)]),pick(el,{},["f","s","sw","d"])));break;
 case"text":textEl(el,c,out,n("x"),n("y")+(el.dy?n("dy"):0));break;
 case"para":case"paras":paras(el,c,out,n("x"),n("y"),n("w"));break;
 case"stack":{let y=n("y");const x=n("x"),w=n("w");for(const it of el.items||[]){if(it.if!=null&&!ev(it.if,c))continue;
   if(it.k=="text"){textEl(it,c,out,x,y+(it.dy?nv(it.dy,c):0));y+=nv(it.adv,c)}else if(it.k=="paras"||it.k=="para")y=paras(it,c,out,x,y,w);else if(it.k=="space")y+=nv(it.h,c)}break}
 case"parts":{const ps=c._.parts,x=n("x"),y=n("y"),w=n("w"),y2=n("y2");if(el.style=="slip")slipRows(out,ps,x,y,w,y2,c.t,el.tick==null?1:nv(el.tick,c));else plist(out,ps,x,y,w,y2,n("z")||4,c.t);break}
 case"heart":{const x=n("x"),y=n("y"),sz=n("s")||6,pts=[];for(let i=0;i<40;i++){const t=i/40*2*Math.PI,hx=16*Math.sin(t)**3,hy=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);pts.push([x+hx*sz/34,y-hy*sz/34])}out.push(P(pts,{f:el.f||"ac"}));break}
 case"checks":{const list=getp(c,el.list)||[],x=n("x"),w=n("w"),z=n("z")||3.8,gp=el.gap!=null?n("gap"):3.4;let y=n("y");for(const it of list){const ls=wrap(fx(it,c),z,0,w-6);out.push(R(x,y-z*.78,z*.9,z*.9,{s:"ink",sw:.35}));ls.forEach((l,j)=>out.push(T(x+6,y+j*z*1.3,l,{z})));y+=ls.length*z*1.3+gp}break}
 case"bars":out.push(...bars(n("x"),n("y"),n("w"),n("h"),el.code?fx(el.code,c):c.id));break;
 case"logo":out.push(...logo(n("x"),n("y"),n("h"),{mark:el.mark}));break;
 case"tips":{const t=c.t,w=n("w"),z=n("z")||3.8,x=n("x"),bx=el.bx!=null?n("bx"):x-5,y2=n("y2"),mats=c._.mats;let y=n("y");
  const tips=[...["PLA","PETG","ABS","ASA","TPU","PA","Carbon"].filter(k=>mats.has(k)).map(k=>t[k=="ASA"?"ABS":k=="Carbon"?"PA":k]),...(t.tips||[])].filter((v,k,a)=>v&&a.indexOf(v)==k);
  for(const s of tips){const ls=wrap(s,z,0,w);if(y+ls.length*5>y2)break;out.push(R(bx,y-2.4,2,2,{f:"ac",r:1}));ls.forEach((l,j)=>out.push(T(x,y+j*5,l,{z})));y+=ls.length*5+3.4}break}
 case"rc":{const rows=rcRows(c._.b),Wd=c.W,iw=Wd-10;let y=el.y!=null?n("y"):6;
  for(const r of rows){const k=r[0];
   if(k=="h")out.push(T(Wd/2,y+6,r[1],{z:fit(r[1],6,1,Wd-8),b:1,a:"m"}));
   else if(k=="c")wrap(r[1],3.3,0,iw).forEach((l,j)=>out.push(T(Wd/2,y+3.6+j*4.2,l,{z:3.3,a:"m"})));
   else if(k=="t")out.push(T(5,y+4,r[1],{z:3.3,b:1}));
   else if(k=="sep")out.push(L(5,y+2,Wd-5,y+2,{s:"mu",sw:.25,d:[1,.8]}));
   else if(k=="kv"){const v=String(r[2]),vz=fit(v,3.2,0,iw*.57,2.4);out.push(T(5,y+3.6,cut(r[1],3.2,0,iw-2-tw(v,vz,0)),{z:3.2}),T(Wd-5,y+3.6,v,{z:vz,a:"r"}))}
   else if(k=="big")out.push(T(5,y+6.5,r[1],{z:5,b:1}),T(Wd-5,y+6.5,r[2],{z:5,b:1,a:"r"}));
   else if(k=="bar")out.push(...bars((Wd-60)/2,y+1,60,10,r[1]));
   else if(k=="stamp")out.push(R((Wd-36)/2,y+1,36,10,{s:r[2]?"ac":"ink",sw:.7,r:1.5}),T(Wd/2,y+8,r[1],{z:fit(r[1],5,1,32),b:1,a:"m",f:r[2]?"ac":"ink"}));
   y+=rch(r,Wd)}break}
 case"rep":{const f=n("from"),to=n("to"),st=n("step")||1,v=el.v||"i";if(st<=0)break;let g=0;for(let q=f;q<to&&g<3000;q+=st,g++){const c2={...c,[v]:q};for(const it of el.items||[])emit(it,c2,out)}break}
 default:throw new Error("Unknown element kind “"+el.k+"”")}};
const build=(tpl,base,extra,u)=>{const c0={...base,...tvars(tpl,u),...extra},W=nv(tpl.w,c0);let H=tpl.h==="auto"?rcHeight(base._.b,W):nv(tpl.h,c0);if(!(W>0&&H>0))throw new Error("Template needs a width (w) and height (h) in mm");
 const c={...c0,W,H},out=[];(tpl.elements||[]).forEach((el,i)=>{try{emit(el,c,out)}catch(e){throw new Error("element "+(i+1)+" ("+(el&&el.k||"?")+"): "+e.message)}});return{w:W,h:H,e:out}};
const inst=(tpl,base,pl,u,firstOnly)=>{const out=[],lock=/"rot":/.test(JSON.stringify(tpl.elements||[])),rt=isRot(tpl,u)&&!lock,cp=cop(tpl,u),sh=sc=>rt?rot90(sc):sc,fn=suffix=>`${slug(CF().shop)}_${base.id}_${tpl.id}${suffix}`;
 if(tpl.per=="box"){for(let i=1;i<=pl.n;i++){const ps=of_(pl,i),sc=sh(build(tpl,base,{box:i,i,pieces:sumQ(ps),nparts:ps.length,_:{...base._,parts:ps}},u));
   out.push({key:tpl.id+"~"+i,tpl,sc,title:`${tpl.name} · box ${i}/${pl.n}`,file:fn("_box"+i),copies:cp});if(firstOnly)break}}
 else if(tpl.per=="part"){for(let k=0;k<pl.parts.length;k++){const p=pl.parts[k],pt={name:p.n,detail:p.d||"",qty:p.q,box:p.x,idx:k+1,n:pl.parts.length},sc=sh(build(tpl,base,{box:p.x,i:p.x,pieces:+p.q||0,nparts:1,part:pt,_:{...base._,parts:[p]}},u));
   out.push({key:tpl.id+"~"+(k+1),tpl,sc,title:`${tpl.name} · ${p.n}`,file:fn("_part"+(k+1)),copies:cp});if(firstOnly)break}}
 else{const sc=sh(build(tpl,base,{box:pl.pp,i:pl.pp,pieces:sumQ(pl.parts),nparts:pl.parts.length,_:{...base._,parts:pl.parts}},u));out.push({key:tpl.id+"~0",tpl,sc,title:`${tpl.name} · goes in box ${pl.pp}`,file:fn(""),copies:cp})}
 return out};
const gen=()=>{const u=U(),b=billOf(u.id),pl=plan(u.id),C0=cfg(),lang=u.lang||CF().lang||"en";PAL=C0.palettes;
 BR={wordmark:Array.isArray(C0.brand.wordmark)&&C0.brand.wordmark.length?C0.brand.wordmark:[[C0.brand.name||"","ink"]],tagline:C0.brand.tagline||""};
 const base=baseCtx(b,pl,lang),items=[],errs=[],smp={};
 for(const tpl of C0.templates){try{const on=isOn(tpl,u),r=inst(tpl,base,pl,u,!on);if(r[0])smp[tpl.id]=r[0].sc;if(on)items.push(...r)}catch(e){errs.push({tpl,msg:tpl.name+" › "+e.message})}}
 return{items,errs,smp}};
/* ---------- UI ---------- */
const PERTXT=(t,pl)=>t.per=="box"?`per box (${pl.n}×)`:t.per=="part"?`per part (${pl.parts.length}×)`:`once, in box ${pl.pp}`;
const GROUPS=[["outside","On the box"],["inside","In the box"],["part","Per part"],["workshop","Workshop (internal)"]];
let CUR=[],MSG=null,PEND="";
const note=(ok,t)=>{MSG={ok,t}};
const mm=sc=>`${N(sc.w)} × ${N(sc.h)} mm`;
const seg=(k,o,cur)=>`<div class="lbseg">${o.map(([v,l])=>`<button type="button" class="${v==cur?"on":""}" data-lb="set:${k}:${v}">${esc(l)}</button>`).join("")}</div>`;
const sel=(k,a,v)=>`<select data-lbi="${k}">${a.map(([o,l])=>`<option value="${o}" ${o==v?"selected":""}>${esc(l)}</option>`).join("")}</select>`;
const fld=(l,i)=>`<div><label>${l}</label>${i}</div>`;
const pretty=t=>{const{elements,...r}=t;return"{\n"+Object.keys(r).map(k=>" "+JSON.stringify(k)+": "+JSON.stringify(r[k])).join(",\n")+(elements?",\n \"elements\": [\n"+elements.map(e=>"  "+JSON.stringify(e)).join(",\n")+"\n ]":"")+"\n}"};
const tile=(t,sm,u,pl)=>{const on=isOn(t,u),rt=isRot(t,u),sc=sm[t.id];
 return`<div class="lbtile ${on?"on":""}"><label class="lbtog"><input type="checkbox" data-lbi="on:${t.id}" ${on?"checked":""}><b>${esc(t.name)}</b></label>
 <div class="lbthumb">${sc?svg(sc,u.m):`<span class="mu">no preview</span>`}</div>
 <div class="mu lbmeta">${sc?mm(sc)+" · ":""}${PERTXT(t,pl)}</div>
 <div class="lbctl"><button type="button" class="btn g s ${rt?"act":""}" data-lb="rot:${t.id}" ${/"rot":/.test(JSON.stringify(t.elements||[]))?"disabled title=\"This label has vertical text and can't be turned again\"":"title=\"Turn 90°, text and all\""}>↻ 90°</button>
 <span class="lbcp"><button type="button" class="btn g s" data-lb="cp:${t.id}:-1">−</button><b>${cop(t,u)}×</b><button type="button" class="btn g s" data-lb="cp:${t.id}:1">+</button></span>
 <button type="button" class="btn g s" data-lb="edit:${t.id}" title="Settings and JSON of this template">⚙</button></div></div>`};
const makeView=(u,bs,G)=>{const b=billOf(u.id),pl=plan(u.id),n=pl.n,C0=cfg(),cu=cust(b),d=b[16]||{},nums=Array.from({length:n},(_,i)=>[i+1,"Box "+(i+1)]);
 const rows=pl.parts.map((p,i)=>`<tr><td><input data-lbi="p:${i}:n" value="${esc(p.n)}" style="min-width:150px"></td><td><input data-lbi="p:${i}:d" value="${esc(p.d||"")}" style="min-width:110px"></td><td><input data-lbi="p:${i}:q" type="number" min="1" value="${p.q}" style="width:64px"></td><td>${sel("p:"+i+":x",nums,p.x)}</td><td><div class="acts"><button class="btn g s" data-lb="split:${i}" title="Split this part over two boxes">Split</button><button class="btn g s" data-lb="del:${i}">✕</button></div></td></tr>`).join("");
 const boxes=nums.map(([v])=>{const ps=of_(pl,v);return`<div class="lbbox ${ps.length?"":"empty"}"><b>Box ${v}</b><span>${sumQ(ps)} pcs</span><small>${ps.length?esc(ps.map(p=>p.q+"× "+p.n).join(", ")):"empty"}</small></div>`}).join("");
 const tot=G.items.reduce((a,l)=>a+l.copies,0);let sheet=null;if(u.fmt=="sheet"){const scs=[];for(const l of G.items)for(let k=0;k<l.copies;k++)scs.push(l.sc);if(+u.sheet.sort)scs.sort((a,b)=>b.h-a.h);sheet=packSheet(scs,u.sheet)}
 const sh=u.sheet,grp=[...GROUPS,...[...new Set(C0.templates.map(t=>t.group))].filter(g=>!GROUPS.some(x=>x[0]==g)).map(g=>[g,g||"Other"])];
 return`<div class="card lbcard"><h2>Order</h2><div class="f">${fld("Order",sel("id",bs.slice().reverse().map(x=>[x[0],`${x[1]} · ${x[3]||"–"} · ${x[0]}`]),u.id))}
 ${fld("Boxes",`<div class="lbstep"><button type="button" class="btn g" data-lb="nn:-1">−</button><b>${n}</b><button type="button" class="btn g" data-lb="nn:1">+</button></div>`)}
 ${fld("Papers go in",sel("pp",nums,pl.pp))}${fld("Print style",seg("m",[["color","Colour"],["gray","Grayscale"],["bw","B & W"]],u.m))}
 ${fld("Language",seg("lang",[["","Default"],["en","EN"],["nl","NL"]],u.lang))}</div>
 <p class="mu lbsum">${[cu.name&&"Customer: "+cu.name,cu.where&&"Delivery: "+cu.where,d.due&&"Needed by "+d.due,sumQ(pl.parts)+" pieces"].filter(Boolean).map(esc).join(" · ")}</p></div>
 <div class="card lbcard"><h2>Boxes &amp; parts</h2><div class="lbboxes">${boxes}</div><div class="tw"><table><tr><th>Part</th><th>Details</th><th>Qty</th><th>Box</th><th></th></tr>${rows}</table></div>
 <div class="row" style="margin-top:10px"><button class="btn g s" data-lb="add">+ Add part</button><button class="btn g s" data-lb="spread">Spread evenly</button><button class="btn g s" data-lb="reset">Reset from bill</button></div></div>
 <div class="card lbcard"><h2>Labels to make</h2><p class="mu" style="margin:0 0 10px">Tick what you need. ↻ turns a label 90° (text and all), × sets the number of copies, ⚙ opens its settings.</p>
 ${grp.map(([g,gn])=>{const ts=C0.templates.filter(t=>t.group==g);return ts.length?`<h3 class="lbh">${esc(gn)}</h3><div class="lbtiles">${ts.map(t=>tile(t,G.smp,u,pl)).join("")}</div>`:""}).join("")}</div>
 ${G.errs.length?`<div class="msg er">${G.errs.map(e=>`<div>${esc(e.msg)} <a href="#" data-lb="edit:${e.tpl.id}">fix</a></div>`).join("")}</div>`:""}
 <div class="card lbcard"><h2>Export</h2><div class="f">${fld("Download as",seg("fmt",[["pdf","One PDF"],["sheet","Print sheets"],["svg","SVG zip"],["png","PNG zip"]],u.fmt))}
 ${u.fmt=="png"?fld("PNG resolution",sel("dpi",[[150,"150 dpi"],[300,"300 dpi"],[600,"600 dpi"]],u.dpi)):""}
 ${u.fmt=="sheet"?fld("Paper",sel("sheet:paper",Object.entries(PAPER).map(([k,v])=>[k,v[2]]),sh.paper))+fld("Orientation",seg("sheetland",[["0","Portrait"],["1","Landscape"]],+sh.land))+fld("Margin (mm)",`<input data-lbi="sheet:margin" type="number" min="0" max="30" value="${sh.margin}">`)+fld("Gap (mm)",`<input data-lbi="sheet:gap" type="number" min="0" max="20" value="${sh.gap}">`)+
  fld("Options",`<label class="lbchk"><input type="checkbox" data-lbi="sheet:border" ${+sh.border?"checked":""}> Cut guides</label><label class="lbchk"><input type="checkbox" data-lbi="sheet:sort" ${+sh.sort?"checked":""}> Pack tightly</label>`):""}</div>
 <div class="row"><button class="btn" data-lb="all" ${G.items.length?"":"disabled"}>${u.fmt=="sheet"?`Download ${sheet.pages.length} sheet${sheet.pages.length>1?"s":""}`:`Download all (${u.fmt=="pdf"?tot:G.items.length})`}</button>
 <span class="mu">${u.fmt=="pdf"?"Copies are repeated as extra pages.":u.fmt=="sheet"?"Labels are packed on the paper at real size."+(sheet.over?` ${sheet.over} label${sheet.over>1?"s are":" is"} larger than the paper (rotate it or use a bigger paper).`:""):"Zips hold one file per label (copies are not repeated)."}</span></div></div>
 <div class="row lbzoom"><span class="mu">Preview size</span><input type="range" min="50" max="220" step="5" value="${u.zoom}" data-lbz style="width:180px"><span class="mu">${G.items.length} label${G.items.length==1?"":"s"}</span></div>
 <div class="lbg" style="--z:${u.zoom/100}">${G.items.map(l=>`<div class="card"><h2>${esc(l.title)}${l.copies>1?` <span class="tag">${l.copies}×</span>`:""}</h2><div class="lbv">${svg(l.sc,u.m)}</div><p class="mu" style="margin:6px 0">${mm(l.sc)}</p><div class="acts"><button class="btn g s" data-lb="svg:${l.key}">SVG</button><button class="btn g s" data-lb="png:${l.key}">PNG</button><button class="btn g s" data-lb="pdf:${l.key}">PDF</button></div></div>`).join("")||`<div class="card mu">Nothing selected. Tick some labels above.</div>`}</div>`};
const tplView=(u,G)=>{const C0=cfg(),ts=C0.templates;let t=ts.find(x=>x.id==u.sel);if(!t){t=ts[0];u.sel=t&&t.id}if(!t)return`<div class="card mu">No templates.</div>`;
 const isDef=DEF.templates.some(x=>x.id==t.id),mod=(patch().templates||[]).some(x=>x.id==t.id),sc=G.smp[t.id],vs=Object.entries(t.vars||{});
 const list=ts.map(x=>`<button type="button" class="lbli ${x.id==t.id?"on":""}" data-lb="edit:${x.id}">${esc(x.name)}<small>${DEF.templates.some(d=>d.id==x.id)?((patch().templates||[]).some(q=>q.id==x.id)?"edited":""):"custom"}</small></button>`).join("");
 return`<div class="lbtwo"><div class="card lbcard lbside"><h2>Templates</h2><div class="lbl">${list}</div><div class="row" style="margin-top:10px"><button class="btn g s" data-lb="tnew">+ New</button><button class="btn g s" data-lb="tdup">Duplicate</button></div></div>
 <div class="lbmain"><div class="card lbcard"><h2>${esc(t.name)} <span class="mu" style="font-weight:400;font-size:12px">${esc(t.id)} · ${esc(t.group||"")} · ${esc(PERTXT(t,plan(U().id)))}</span></h2><p class="mu" style="margin:0 0 10px">${esc(t.desc||"")}</p>
 <div class="lbtwo2"><div class="lbv">${sc?svg(sc,u.m):`<span class="mu">no preview</span>`}</div><div>${vs.length?vs.map(([k,d])=>{const v=(u.vars[t.id]||{})[k],cur=v!==undefined?+v:+d.v;return d.type=="bool"?`<label class="lbchk"><input type="checkbox" data-lbi="var:${t.id}:${k}" ${cur?"checked":""}> ${esc(d.label||k)}</label>`:fld(esc(d.label||k),`<input type="number" data-lbi="var:${t.id}:${k}" value="${cur}" ${d.min!=null?`min="${d.min}"`:""} ${d.max!=null?`max="${d.max}"`:""} step="${d.step||1}">`)}).join(""):`<p class="mu">This template has no settings of its own. Edit the JSON below to change it.</p>`}
 <div class="row" style="margin-top:10px"><button class="btn g s" data-lb="vreset">Reset settings</button><button class="btn g s ${isRot(t,u)?"act":""}" data-lb="rot:${t.id}">↻ 90°</button></div></div></div></div>
 <div class="card lbcard"><h2>Template JSON</h2><textarea id="lbjson" class="lbcode" rows="16" spellcheck="false">${esc(pretty(t))}</textarea>
 <div class="row" style="margin-top:10px"><button class="btn" data-lb="tapply">Apply</button><button class="btn g" data-lb="treset" ${mod&&isDef?"":"disabled"}>Reset to default</button><button class="btn g" data-lb="tdel" ${isDef?"disabled":""}>Delete</button></div>${msg()}</div></div></div>`};
const msg=()=>{const m=MSG;MSG=null;return m?`<div class="msg ${m.ok?"":"er"}" style="margin-top:10px">${esc(m.t)}</div>`:""};
const lookView=(u,G)=>{const C0=cfg(),B=C0.brand,lang=u.txlang||"en",TXT=(C0.texts[lang])||{},wm=Array.isArray(B.wordmark)?B.wordmark:[];
 const cols=Object.keys((C0.palettes.color)||{}),pv=["delivery","seal","thanks"].filter(k=>G.smp[k]);
 return`<div class="card lbcard"><h2>Look &amp; text</h2><div class="lbrow">${pv.map(k=>`<div class="lbv">${svg(G.smp[k],u.m)}</div>`).join("")}</div></div>
 <div class="card lbcard"><h2>Brand</h2><div class="f">${fld("Name (used on labels)",`<input data-lbi="brand:name" value="${esc(B.name||"")}">`)}${fld("Tagline under the logo",`<input data-lbi="brand:tagline" value="${esc(B.tagline||"")}">`)}
 ${fld("Signature (letters, notes)",`<input data-lbi="brand:sign" value="${esc(B.sign||"")}">`)}${fld("Footer line",`<input data-lbi="brand:footer" value="${esc(B.footer||"")}">`)}
 ${fld("Return address",`<input data-lbi="brand:address" value="${esc(B.address||"")}" placeholder="shown on the return label">`)}${fld("Contact (e-mail / phone)",`<input data-lbi="brand:contact" value="${esc(B.contact||"")}" placeholder="shown on the help card">`)}${fld("Web / social",`<input data-lbi="brand:web" value="${esc(B.web||"")}" placeholder="shown on the help card">`)}</div>
 <h3 class="lbh">Logo wordmark</h3><div class="lbrow">${wm.map((p,i)=>`<div class="lbwm"><input data-lbi="wm:${i}:t" value="${esc(p[0])}" style="width:90px">${sel("wm:"+i+":c",[["ink","dark"],["ac","accent"],["st","steel"],["mu","grey"]],p[1])}</div>`).join("")}</div></div>
 <div class="card lbcard"><h2>Colours</h2><p class="mu" style="margin:0 0 10px">Used in “Colour” print style. Grayscale and B &amp; W follow their own palettes (JSON tab).</p><div class="lbcols">${cols.map(k=>`<label class="lbcol"><input type="color" data-lbi="col:color:${k}" value="${esc(C0.palettes.color[k])}"><span>${k}</span></label>`).join("")}</div>
 <div class="row" style="margin-top:10px"><button class="btn g s" data-lb="lookreset">Reset brand, colours &amp; texts</button></div></div>
 <div class="card lbcard"><h2>Texts</h2><div class="f">${fld("Language",seg("txlang",[["en","English"],["nl","Nederlands"]],lang))}</div>
 <div class="lbtx">${Object.entries(TXT).map(([k,v])=>Array.isArray(v)?`<div><label>${esc(k)} <span class="mu">(one per line)</span></label><textarea data-lbi="tx:${lang}:${k}" rows="${Math.min(8,v.length+1)}">${esc(v.join("\n"))}</textarea></div>`:`<div><label>${esc(k)}</label><input data-lbi="tx:${lang}:${k}" value="${esc(v)}"></div>`).join("")}</div></div>`};
const DOCS=`<details class="lbdoc"><summary>How templates work</summary><div>
<p>A template is JSON: <code>id, name, group</code> (outside / inside / part), <code>per</code> (<code>box</code> = one per box, <code>once</code> = one per order, <code>part</code> = one per part), <code>w, h</code> in mm (numbers or expressions of your <code>vars</code>, e.g. <code>"h":"sideLen+botLen"</code>; <code>"h":"auto"</code> for the receipt), optional <code>vars</code> (settings that show up as inputs), <code>rotate, on, copies</code> and <code>elements</code>.</p>
<p>Elements (all sizes in mm, origin top-left, text y = baseline): <code>rect</code> x y w h r f s sw d · <code>line</code> x y x2 y2 s sw d · <code>poly</code> p:[[x,y],…] f s · <code>text</code> x y text z b a(l|m|r) f fit cut dy (<code>"text":"@wordmark"</code> = your coloured logo name) · <code>para</code> x y w text|list z lh gap a · <code>stack</code> x y w items:[text|paras|space] (flows downward, <code>adv</code> = step after an item) · <code>parts</code> style(compact|slip) x y w y2 z · <code>bars</code> x y w h · <code>logo</code> x y h mark · <code>tips</code> · <code>rc</code> (receipt rows) · <code>rep</code> v from to step items (repeats elements) · <code>heart</code> x y s f · <code>checks</code> x y w list z (tick-box list) · add <code>"rot":1</code> to a text for vertical text (x = baseline, y = start along the label; such labels can't be turned again).</p>
<p>Any number can be an expression (<code>"W-10"</code>, <code>"cutX+4"</code>, <code>"barcode?118:H-8"</code>) using W, H, your template vars and the loop variable. Add <code>"if":"customer"</code> to show an element only when true. Colours: ink ac lt l2 o2 d2 st pp mu ln wh or #hex. <code>fit</code>/<code>cut</code> shrink or shorten text to that width.</p>
<p>Text can contain <code>{{…}}</code>: id name date account customer where due info idline box boxes pp pieces allpieces today brand.name/tagline/sign/footer/contact/web/address, material weight time plates, <code>upper(x)</code>, t.&lt;text key&gt;, part.name/detail/qty/box (per-part templates).</p></div></details>`;
const jsonView=(u)=>`<div class="card lbcard"><h2>Your overrides</h2><p class="mu" style="margin:0 0 10px">Everything you change in Labels is stored here and merged on top of the defaults in <code>labels.defaults.js</code>. Templates are matched by <code>id</code>; add <code>"replace":true</code> to swap a whole template.</p>
 <textarea id="lbpatch" class="lbcode" rows="14" spellcheck="false">${esc(JSON.stringify(patch(),null,1))}</textarea>
 <div class="row" style="margin-top:10px"><button class="btn" data-lb="japply">Apply</button><button class="btn g" data-lb="jdl">Download overrides</button><button class="btn g" data-lb="jdlfull">Download full config</button>
 <label class="btn g" style="margin:0;cursor:pointer">Import JSON<input type="file" accept=".json,application/json" data-lbi="imp" style="display:none"></label><button class="btn g" data-lb="jreset">Reset everything</button></div>${msg()}</div>
 <div class="card lbcard">${DOCS}</div>`;
const css=`.lbt{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}.lbt button{border:1px solid var(--bd);background:var(--sf);color:var(--tx);padding:8px 14px;border-radius:999px;cursor:pointer;font:inherit;font-size:13px}.lbt button.on{background:var(--ac);color:#fff;border-color:var(--ac)}
.lbcard{margin-bottom:14px}.lbseg{display:inline-flex;border:1px solid var(--bd);border-radius:10px;overflow:hidden}.lbseg button{border:0;background:var(--sf);color:var(--tx);padding:8px 12px;cursor:pointer;font:inherit;font-size:13px}.lbseg button.on{background:var(--ac);color:#fff}
.lbstep{display:flex;align-items:center;gap:10px}.lbstep b{min-width:24px;text-align:center;font-size:18px}.lbsum{margin:10px 0 0}.btn.act{background:var(--ac);color:#fff;border-color:var(--ac)}
.lbboxes{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.lbbox{border:1.5px solid var(--bd);border-radius:10px;padding:8px 12px;display:flex;flex-direction:column;min-width:110px;max-width:220px;background:var(--sf)}.lbbox span{color:var(--ac);font-weight:600}.lbbox small{color:var(--mu)}.lbbox.empty{border-style:dashed;opacity:.7}
.lbh{margin:16px 0 8px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--mu)}.lbtiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px}
.lbtile{border:1.5px solid var(--bd);border-radius:12px;background:var(--sf);padding:10px;display:flex;flex-direction:column;gap:7px}.lbtile.on{border-color:var(--ac);box-shadow:0 0 0 2px #c2410c22}.lbtog{display:flex;gap:8px;align-items:center;margin:0;color:var(--tx);cursor:pointer}.lbtog input{width:auto}
.lbthumb,.lbv{background:#e8e6df;border-radius:8px;display:flex;align-items:center;justify-content:center;padding:8px;overflow:hidden}.lbthumb{height:92px}.lbthumb svg{max-width:100%;max-height:76px;width:auto;height:auto}.lbmeta{font-size:12px}
.lbctl{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.lbcp{display:inline-flex;align-items:center;gap:6px;margin-left:auto}.lbchk{display:flex;gap:6px;align-items:center;margin:6px 0;color:var(--tx)}.lbchk input{width:auto}
.acts{display:flex;gap:6px;flex-wrap:wrap}.lbzoom{margin:4px 0 12px;align-items:center}.lbg{display:grid;grid-template-columns:repeat(auto-fill,minmax(calc(260px*var(--z,1)),1fr));gap:14px}
.lbv{padding:10px}.lbv svg{max-width:100%;max-height:calc(340px*var(--z,1));width:auto;height:auto;box-shadow:0 1px 6px #0003}
.lbtwo{display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap}.lbside{flex:0 0 230px}.lbmain{flex:1;min-width:280px}.lbtwo2{display:grid;grid-template-columns:minmax(160px,1fr) minmax(160px,1fr);gap:14px}
.lbl{display:flex;flex-direction:column;gap:4px}.lbli{border:1px solid var(--bd);background:var(--sf);color:var(--tx);border-radius:8px;padding:8px 10px;text-align:left;cursor:pointer;font:inherit;font-size:13px;display:flex;justify-content:space-between;gap:8px}.lbli.on{border-color:var(--ac);background:#c2410c14}.lbli small{color:var(--mu)}
.lbcode{width:100%;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;line-height:1.45;white-space:pre;overflow:auto}.lbrow{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start}.lbrow .lbv svg{max-height:200px}
.lbwm{display:flex;gap:6px}.lbcols{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px}.lbcol{display:flex;gap:8px;align-items:center;margin:0;color:var(--tx)}.lbcol input{width:40px;height:32px;padding:0}
.lbtx{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px;margin-top:10px}.lbdoc summary{cursor:pointer;font-weight:600}.lbdoc code{background:#8881;padding:1px 4px;border-radius:4px;font-size:12px}.lbdoc p{line-height:1.55}
@media(max-width:640px){.lbtwo2{grid-template-columns:1fr}.lbside{flex-basis:100%}}`;
const TABS=[["make","Make labels"],["tpl","Templates"],["look","Look & text"],["json","JSON"]];
window.labelView=()=>{const bs=S.bills.filter(b=>b[14]!="quote");if(!bs.length)return`<div class="card mu">Make a bill first; labels are built from your bills.</div>`;
 const u=U();if(!bs.some(b=>b[0]==u.id))u.id=bs[bs.length-1][0];if(!TABS.some(t=>t[0]==u.tab))u.tab="make";
 const G=gen();CUR=G.items;
 const body=u.tab=="tpl"?tplView(u,G):u.tab=="look"?lookView(u,G):u.tab=="json"?jsonView(u):makeView(u,bs,G);
 return`<div class="lbt">${TABS.map(([k,l])=>`<button type="button" class="${k==u.tab?"on":""}" data-lb="tab:${k}">${l}</button>`).join("")}</div>${body}`};
const re=()=>{if(tab=="Labels"){const y=window.scrollY;$("#app").innerHTML=labelView();window.scrollTo(0,y)}};
const doAll=async(u)=>{const m=u.m,f=u.fmt,id=u.id,sh=slug(CF().shop);if(!CUR.length)return;toast("Preparing…");
 if(f=="pdf"){const L=[];for(const l of CUR)for(let k=0;k<l.copies;k++)L.push(l.sc);dl(new Blob([pdf(L,m)],{type:"application/pdf"}),`${sh}_${id}_labels.pdf`)}
 else if(f=="sheet"){const scs=[];for(const l of CUR)for(let k=0;k<l.copies;k++)scs.push(l.sc);if(+u.sheet.sort)scs.sort((a,b)=>b.h-a.h);const r=packSheet(scs,u.sheet);dl(new Blob([pdfPages(r.pages,m)],{type:"application/pdf"}),`${sh}_${id}_label-sheets.pdf`)}
 else{const fs=[];for(const l of CUR)fs.push({n:l.file+"."+f,d:f=="svg"?new TextEncoder().encode(svg(l.sc,m)):new Uint8Array(await(await png(l.sc,m,+u.dpi)).arrayBuffer())});dl(zip(fs),`${sh}_${id}_labels_${f}.zip`)}};
const parseJ=(el,what)=>{try{return JSON.parse(el.value)}catch(e){note(false,what+" is not valid JSON: "+e.message);return null}};
const upsertTpl=o=>{const p=patch();p.templates=(Array.isArray(p.templates)?p.templates:[]).filter(t=>t.id!=o.id);p.templates.push({...o,replace:true})};
const uid=(base)=>{let i=base,k=2;const ids=cfg().templates.map(t=>t.id);while(ids.includes(i))i=base+"-"+k++;return i};
document.addEventListener("click",async e=>{const el=e.target.closest("[data-lb]");if(!el||tab!="Labels")return;e.preventDefault();const[a,x,y]=el.dataset.lb.split(":"),u=U(),pl=plan(u.id),m=u.m,C0=cfg();
 try{
 if(a=="tab")u.tab=x;
 else if(a=="set"){if(x=="m"||x=="lang"||x=="fmt")u[x]=y===undefined?"":y;else if(x=="txlang")u.txlang=y;else if(x=="sheetland")u.sheet.land=+y;else u[x]=y}
 else if(a=="nn"){pl.n=Math.max(1,Math.min(30,pl.n+(+x)));pl.parts.forEach(p=>p.x=Math.min(p.x,pl.n));pl.pp=Math.min(pl.pp,pl.n)}
 else if(a=="add")pl.parts.push({n:"New part",q:1,x:1,d:""});
 else if(a=="del")pl.parts.splice(+x,1);
 else if(a=="split"){const p=pl.parts[+x];if(p.q>1){const h=Math.floor(p.q/2);p.q-=h;pl.parts.splice(+x+1,0,{...p,q:h,x:Math.min(pl.n,p.x+1)})}else toast("Quantity is 1, nothing to split")}
 else if(a=="spread")pl.parts.forEach((p,i)=>p.x=Math.floor(i*pl.n/pl.parts.length)+1);
 else if(a=="reset")pl.parts=defParts(billOf(u.id));
 else if(a=="rot"){const t=C0.templates.find(q=>q.id==x);u.rot[x]=isRot(t||{id:x},u)?0:1}
 else if(a=="cp"){const t=C0.templates.find(q=>q.id==x);u.copies[x]=Math.max(1,Math.min(99,cop(t||{id:x},u)+(+y)))}
 else if(a=="edit"){u.sel=x;u.tab="tpl"}
 else if(a=="vreset"){delete u.vars[u.sel];delete u.rot[u.sel];delete u.copies[u.sel]}
 else if(a=="tapply"){const o=parseJ($("#lbjson"),"The template");if(!o)return re();if(!o.id||!Array.isArray(o.elements)){note(false,"A template needs an id and an elements list.");return re()}
  const keep=patch().templates,old=cfg();upsertTpl(o);try{PAL=cfg().palettes;const g=gen();const er=g.errs.find(q=>q.tpl.id==o.id);if(er)throw new Error(er.msg)}catch(err){patch().templates=keep;CM=null;note(false,"Not applied: "+err.message);return re()}
  u.sel=o.id;if(!old.templates.some(t=>t.id==o.id))u.on[o.id]=1;note(true,"Template applied.")}
 else if(a=="tdup"){const t=C0.templates.find(q=>q.id==u.sel);if(t){const n={...JSON.parse(JSON.stringify(t)),id:uid(t.id+"-copy"),name:t.name+" (copy)"};upsertTpl(n);u.sel=n.id;u.on[n.id]=1}}
 else if(a=="tnew"){const n={id:uid("custom"),name:"New label",group:"outside",per:"box",w:80,h:50,desc:"Your own label.",elements:[{k:"rect",x:1,y:1,w:"W-2",h:"H-2",s:"ink",sw:0.5,r:3},{k:"text",x:"W/2",y:20,text:"{{name}}",z:6,fit:"W-8",b:1,a:"m"},{k:"text",x:"W/2",y:30,text:"{{t.box}} {{box}}/{{boxes}}",z:4,a:"m",f:"mu"}]};upsertTpl(n);u.sel=n.id;u.on[n.id]=1}
 else if(a=="treset"){const p=patch();p.templates=(p.templates||[]).filter(t=>t.id!=u.sel);note(true,"Back to the default template.")}
 else if(a=="tdel"){if(DEF.templates.some(t=>t.id==u.sel))return;const p=patch();p.templates=(p.templates||[]).filter(t=>t.id!=u.sel);u.sel="delivery"}
 else if(a=="japply"){const o=parseJ($("#lbpatch"),"The overrides");if(!o)return re();if(!isO(o)){note(false,"Overrides must be a JSON object.");return re()}const keep=S.lblcfg;S.lblcfg=o;CM=null;try{const g=gen();if(g.errs.length)throw new Error(g.errs[0].msg)}catch(err){S.lblcfg=keep;CM=null;note(false,"Not applied: "+err.message);return re()}note(true,"Overrides applied.")}
 else if(a=="jdl")dl(new Blob([JSON.stringify(patch(),null,1)],{type:"application/json"}),"nozzler-labels-overrides.json");
 else if(a=="jdlfull")dl(new Blob([JSON.stringify(C0,null,1)],{type:"application/json"}),"nozzler-labels-config.json");
 else if(a=="jreset"){if(!confirm("Remove all your label customisations (templates, brand, colours, texts)?"))return;S.lblcfg={};CM=null;u.on={};u.rot={};u.copies={};u.vars={};note(true,"Everything is back to the defaults.")}
 else if(a=="lookreset"){const p=patch();delete p.brand;delete p.palettes;delete p.texts;CM=null}
 else if(a=="all"){await doAll(u);return}
 else{const l=CUR.find(q=>q.key==x);if(!l)return;
  if(a=="svg")dl(new Blob([svg(l.sc,m)],{type:"image/svg+xml"}),l.file+".svg");else if(a=="png")dl(await png(l.sc,m,+u.dpi),l.file+".png");else if(a=="pdf")dl(new Blob([pdf([l.sc],m)],{type:"application/pdf"}),l.file+".pdf");return}
 save();re()}catch(err){console.error(err);toast("Label action failed: "+(err&&err.message||err))}});
document.addEventListener("change",e=>{const el=e.target.closest("[data-lbi]");if(!el||tab!="Labels")return;const[k,x,y]=el.dataset.lbi.split(":"),v=el.value,u=U(),pl=plan(u.id);
 try{
 if(k=="imp"){const f=el.files&&el.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const o=JSON.parse(r.result);if(!isO(o))throw new Error("not a JSON object");S.lblcfg=o;CM=null;gen();note(true,"Imported "+f.name+".")}catch(err){S.lblcfg={};CM=null;note(false,"Import failed: "+err.message)}save();re()};r.readAsText(f);return}
 if(k=="n"){pl.n=Math.max(1,Math.min(30,+v||1));pl.parts.forEach(p=>p.x=Math.min(p.x,pl.n));pl.pp=Math.min(pl.pp,pl.n)}
 else if(k=="id")u.id=v;else if(k=="pp")pl.pp=+v;else if(k=="dpi")u.dpi=+v;
 else if(k=="p"){const p=pl.parts[+x];if(y=="q")p.q=Math.max(1,Math.round(+v)||1);else if(y=="x")p.x=+v;else p[y]=v}
 else if(k=="on")u.on[x]=el.checked?1:0;
 else if(k=="var"){(u.vars[x]=u.vars[x]||{})[y]=el.type=="checkbox"?(el.checked?1:0):(+v||0)}
 else if(k=="sheet"){u.sheet[x]=el.type=="checkbox"?(el.checked?1:0):v}
 else if(k=="brand")setPatch("brand."+x,v);
 else if(k=="wm"){const w=(Array.isArray(cfg().brand.wordmark)?cfg().brand.wordmark:[]).map(q=>[q[0],q[1]]);w[+x][y=="t"?0:1]=v;setPatch("brand.wordmark",w)}
 else if(k=="col")setPatch("palettes."+x+"."+y,v);
 else if(k=="tx"){const cur=(cfg().texts[x]||{})[y];setPatch("texts."+x+"."+y,Array.isArray(cur)?v.split("\n").map(s=>s.trim()).filter(Boolean):v)}
 else return;
 save();re()}catch(err){console.error(err);toast("Label setting failed: "+(err&&err.message||err))}});
document.addEventListener("input",e=>{const el=e.target.closest("[data-lbz]");if(!el||tab!="Labels")return;const u=U();u.zoom=+el.value;const g=$(".lbg");if(g)g.style.setProperty("--z",u.zoom/100)});
document.addEventListener("change",e=>{const el=e.target.closest("[data-lbz]");if(el&&tab=="Labels")save()});
document.head.appendChild(Object.assign(document.createElement("style"),{textContent:css}));
window.LabelGen={ev,fx,cfg,gen,svg,pdf,pdfPages,packSheet,zip,png,rot90,PAL:()=>PAL,pick:id=>{U().id=id},_ui:U,_patch:patch};
/* opened straight on #Labels: the first render ran before this file loaded */
if(typeof tab!="undefined"&&tab=="Labels"&&typeof render=="function")render();
})();
