/* Nozzler box labels: adds the "Labels" tab. Outside labels (delivery, top, tear-open seal) and inside papers
   (packing slip, receipt, thank-you letter, care card). Every label is built once as a small scene (mm) and
   exported as SVG, PNG (any dpi), vector PDF, or all at once (PDF / ZIP). No libraries, works offline.
   Loaded by admin/index.html after cloud.js. Uses the app globals S, CF, esc, $, toast, save, tab, render, bc, rcRows. */
(()=>{
const MM=72/25.4,N=v=>+(+v).toFixed(2),X=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
/* Helvetica / Helvetica-Bold advance widths for ASCII 32..126 (same metrics in the SVG via Arial/Helvetica) */
const WR=[278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584],
WB=[278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,556,556,778,556,556,500,389,280,389,584];
const tw=(s,z,b)=>[...String(s)].reduce((a,c)=>a+((b?WB:WR)[c.charCodeAt(0)-32]||556),0)*z/1000;
const wrap=(s,z,b,mw)=>{const o=[];for(const p of String(s).split("\n")){let l="";for(const w of p.split(/\s+/).filter(Boolean)){const t=l?l+" "+w:w;if(!l||tw(t,z,b)<=mw)l=t;else{o.push(l);l=w}}o.push(l)}return o};
const fit=(s,z,b,mw,mn=2)=>{while(z>mn&&tw(s,z,b)>mw)z-=.2;return z};
const cut=(s,z,b,mw)=>{s=String(s);if(tw(s,z,b)<=mw)return s;while(s.length>1&&tw(s+"…",z,b)>mw)s=s.slice(0,-1);return s+"…"};
/* colour tokens per print style */
const PAL={color:{ink:"#1c1b18",ac:"#c2410c",lt:"#fb923c",l2:"#fdba74",o2:"#ea580c",d2:"#9a3412",st:"#57534e",pp:"#fff7ed",mu:"#6d6a62",ln:"#d6d3d1",wh:"#ffffff"},
 gray:{ink:"#111111",ac:"#3a3a3a",lt:"#8c8c8c",l2:"#bdbdbd",o2:"#666666",d2:"#2a2a2a",st:"#555555",pp:"#f1f1f1",mu:"#666666",ln:"#c8c8c8",wh:"#ffffff"},
 bw:{ink:"#000000",ac:"#000000",lt:"#ffffff",l2:"#ffffff",o2:"#000000",d2:"#000000",st:"#000000",pp:"#ffffff",mu:"#000000",ln:"#000000",wh:"#ffffff"}};
const C=(t,m)=>t&&(t[0]=="#"?t:PAL[m][t]),hx=c=>[1,3,5].map(i=>parseInt(c.substr(i,2),16));
const norm=(e,m)=>{const o={...e},f=e.f;o.f=f?C(f,m):null;o.s=e.s?C(e.s,m):null;
 if(m=="bw"&&e.k!="t"&&f&&["lt","l2","pp","ln"].includes(f)){if(f=="ln")o.f="#ffffff";if(!o.s){o.s="#000000";o.sw=.25}}return o};
/* scene primitives (mm, origin top-left, y of text = baseline) */
const R=(x,y,w,h,o={})=>({k:"r",x,y,w,h,...o}),L=(x,y,x2,y2,o={})=>({k:"l",x,y,x2,y2,...o}),P=(p,o={})=>({k:"p",p,...o}),T=(x,y,t,o={})=>({k:"t",x,y,t,...o});
const logo=(x,y,h,o={})=>{const k=h/96,u=v=>x+v*k,w=v=>y+v*k,e=[R(u(28),w(6),40*k,18*k,{f:"st",r:4*k}),P([[34,24],[62,24],[53,46],[43,46]].map(q=>[u(q[0]),w(q[1])]),{f:"lt"}),R(u(45),w(46),6*k,5*k,{f:"ac",r:k}),
 R(u(12),w(56),72*k,9*k,{f:"l2",r:4.5*k}),R(u(12),w(68),72*k,9*k,{f:"o2",r:4.5*k}),R(u(12),w(80),72*k,9*k,{f:"d2",r:4.5*k})];
 if(!o.mark)e.push(T(u(108),w(60),[["No","ink"],["zz","ac"],["ler","ink"]],{z:46*k,b:1}),T(u(110),w(80),"BY SEPP · 3D PRINTING ON DEMAND",{z:10*k,b:1,f:"mu"}));return e};
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
const pdf=(L,m)=>{let o="%PDF-1.4\n",of=[];const ob=(n,s)=>{of[n]=o.length;o+=n+" 0 obj\n"+s+"\nendobj\n"};
 ob(1,"<</Type/Catalog/Pages 2 0 R>>");ob(2,`<</Type/Pages/Count ${L.length}/Kids[${L.map((_,i)=>5+i*2+" 0 R").join(" ")}]>>`);
 ob(3,"<</Type/Font/Subtype/Type1/BaseFont/Helvetica/Encoding/WinAnsiEncoding>>");ob(4,"<</Type/Font/Subtype/Type1/BaseFont/Helvetica-Bold/Encoding/WinAnsiEncoding>>");
 L.forEach((sc,i)=>{const s=pc(sc,m);ob(5+i*2,`<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${N(sc.w*MM)} ${N(sc.h*MM)}]/Resources<</Font<</F1 3 0 R/F2 4 0 R>>>>/Contents ${6+i*2} 0 R>>`);ob(6+i*2,`<</Length ${s.length}>>\nstream\n${s}\nendstream`)});
 const x=o.length,n=5+L.length*2;o+=`xref\n0 ${n}\n0000000000 65535 f \n`+of.slice(1).map(v=>String(v).padStart(10,"0")+" 00000 n \n").join("")+`trailer\n<</Size ${n}/Root 1 0 R>>\nstartxref\n${x}\n%%EOF`;
 return Uint8Array.from(o,c=>c.charCodeAt(0))};
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
/* ---------- text ---------- */
const TX={en:{box:"BOX",of:"of",order:"ORDER",inbox:"IN THIS BOX",more:"more (see packing slip)",deliver:"Deliver to",need:"Needed by",tear:"CUT ALONG THE LINE TO OPEN",z:["TOP / LID","SIDE","SIDE","BOTTOM"],seal:"Sealed by Nozzler",slip:"PACKING SLIP",tot:"Pieces in this box",qty:"QTY",part:"PART",
 chk:"Please check the contents when you unpack. Something missing or damaged? Send me a message and I’ll fix it.",dear:"Dear {n},",there:"there",reg:"Warm regards,",care:"Caring for your print",yo:"YOUR ORDER",parts:"parts",
 letter:["Thank you so much for your order. Every part in this box was prepared, printed and checked by hand, one layer at a time.","Please take a look at everything when you unpack. If something isn’t right, or you just want to say hi, send me a message and I’ll make it right.","Happy with your print? Tell a friend, or send me a photo of it in use. That really makes my day."],
 tips:["Clean with lukewarm water and a soft cloth.","Layer lines are normal for 3D prints and part of their character.","Remove small support marks with fine sandpaper or a hobby knife.","Keep away from long, direct sun and from heaters."],
 PLA:"PLA: keep below 50 °C (no hot car dashboard).",PETG:"PETG: tough and water resistant, fine up to about 70 °C.",ABS:"ABS/ASA: handles heat up to about 90 °C. Avoid acetone.",TPU:"TPU: flexible; avoid sharp edges and long stretching.",PA:"Nylon / carbon: keep dry, it absorbs moisture."},
 nl:{box:"DOOS",of:"van",order:"BESTELLING",inbox:"IN DEZE DOOS",more:"meer (zie pakbon)",deliver:"Afleveren bij",need:"Nodig tegen",tear:"SNIJD LANGS DE LIJN OM TE OPENEN",z:["BOVEN / DEKSEL","ZIJKANT","ZIJKANT","ONDER"],seal:"Verzegeld door Nozzler",slip:"PAKBON",tot:"Stuks in deze doos",qty:"AANT.",part:"ONDERDEEL",
 chk:"Kijk de inhoud even na als je uitpakt. Mist er iets of is het beschadigd? Stuur me een bericht, dan los ik het op.",dear:"Beste {n},",there:"klant",reg:"Hartelijke groet,",care:"Zo blijft je print mooi",yo:"JE BESTELLING",parts:"onderdelen",
 letter:["Hartelijk dank voor je bestelling. Elk onderdeel in deze doos is met zorg voorbereid, laag voor laag geprint en met de hand gecontroleerd.","Kijk alles even na als je de doos uitpakt. Klopt er iets niet, of wil je gewoon hallo zeggen? Stuur me een bericht, dan maak ik het goed.","Blij met je print? Vertel het een vriend door, of stuur me een foto van hoe je hem gebruikt. Daar word ik echt blij van."],
 tips:["Reinigen met lauw water en een zachte doek.","Laaglijntjes horen bij 3D-prints en maken ze uniek.","Kleine steunresten verwijder je met fijn schuurpapier of een hobbymes.","Houd uit de buurt van langdurige zon en verwarming."],
 PLA:"PLA: houd onder 50 °C (niet op een warm autodashboard).",PETG:"PETG: sterk en waterbestendig, goed tot ongeveer 70 °C.",ABS:"ABS/ASA: kan tegen warmte tot ongeveer 90 °C. Geen aceton.",TPU:"TPU: flexibel; vermijd scherpe randen en langdurig rekken.",PA:"Nylon / carbon: droog bewaren, het neemt vocht op."}};
/* ---------- label designs ---------- */
const of_=(c,i)=>c.parts.filter(p=>p.x==i);
const plist=(e,ps,x,y,w,y2,z,t)=>{let k=0;for(const p of ps){const h=z*(p.d?2.15:1.4);if(y+h>y2){e.push(T(x,y,"+ "+(ps.length-k)+" "+t.more,{z,f:"mu"}));return}
 e.push(T(x,y,p.q+"×",{z,b:1}),T(x+z*2.4,y,cut(p.n,z,1,w-z*2.4),{z,b:1}));if(p.d)e.push(T(x+z*2.4,y+z*.95,cut(p.d,z*.8,0,w-z*2.4),{z:z*.8,f:"mu"}));y+=h;k++}};
const head=(c,e,W,i)=>{const t=c.t;e.push(...logo(10,10,15),T(W-10,17,t.slip,{z:7,b:1,a:"r"}),T(W-10,25,c.parts&&i?`${t.box} ${i} ${t.of} ${c.n}`:"",{z:4.5,b:1,a:"r",f:"ac"}),R(10,31,W-20,1.6,{f:"ac"}))};
const G={
delivery:(c,i)=>{const t=c.t,b=c.b,d=b[16]||{},W=100,H=150,e=[R(1.5,1.5,W-3,H-3,{s:"ink",sw:.5,r:4}),...logo(6,6,13),T(94,9,t.box,{z:3,b:1,a:"r",f:"mu"}),T(94,23,`${i}/${c.n}`,{z:17,b:1,a:"r"}),R(6,27,88,2,{f:"ac"}),
 T(6,35,t.order,{z:2.6,b:1,f:"mu"}),T(6,42,b[1],{z:fit(b[1],6.5,1,88),b:1}),T(6,48,"#"+c.id+(c.c.name?"  ·  "+c.c.name:""),{z:fit(c.id+c.c.name,3.6,0,84)})];
 const inf=[c.c.where&&t.deliver+": "+c.c.where,d.due&&t.need+" "+d.due].filter(Boolean).join("   ");if(inf)e.push(T(6,54,cut(inf,3.2,0,88),{z:3.2,f:"mu"}));
 e.push(L(6,58,94,58,{s:"ln",sw:.3}),T(6,64,t.inbox,{z:2.6,b:1,f:"mu"}));plist(e,of_(c,i),6,72,88,118,4.2,t);
 e.push(...bars(6,123,62,13,c.id),T(6,141,c.id,{z:3,b:1}),T(94,141,"Nozzler · by Sepp",{z:2.6,a:"r",f:"mu"}));return{w:W,h:H,e}},
top:(c,i)=>{const t=c.t,b=c.b,W=150,H=100,e=[R(1,1,W-2,H-2,{s:"ink",sw:.5,r:3}),R(1,1,46,H-2,{f:"ink",r:3}),R(30,1,17,H-2,{f:"ink"}),T(24,24,t.box,{z:4.5,b:1,a:"m",f:"wh"}),T(24,60,String(i),{z:fit(String(i),36,1,38),b:1,a:"m",f:"wh"}),T(24,75,t.of+" "+c.n,{z:6.5,a:"m",f:"lt"}),
 ...logo(54,8,11),T(54,32,b[1],{z:fit(b[1],6,1,90),b:1}),T(54,38,"#"+c.id+(c.c.name?"  ·  "+c.c.name:""),{z:fit(c.id+c.c.name,3.4,0,90),f:"mu"}),L(54,42,144,42,{s:"ln",sw:.3})];
 plist(e,of_(c,i),54,50,90,78,3.8,t);e.push(...bars(54,81,50,12,c.id),T(144,91,"Nozzler",{z:3,b:1,a:"r"}));return{w:W,h:H,e}},
seal:(c,i)=>{const t=c.t,W=280,H=44,y0=10,e=[R(0,y0,W,H-y0,{f:"wh",s:"ink",sw:.4}),R(0,y0,W,3,{f:"ac"}),R(0,H-3,W,3,{f:"ac"})];
 for(let x=0;x<W;x+=4)e.push(L(x,y0,x+2.6,y0+3,{s:"wh",sw:.5}),L(x,H-3,x+2.6,H,{s:"wh",sw:.5}));
 /* fold hints at the top/side and side/side seams; the cut line sits on the side/bottom seam (x=210) */
 [70,140].forEach(x=>e.push(L(x,y0+3,x,H-3,{s:"mu",sw:.3,d:[1.6,1.2]})));e.push(L(210,.5,210,H,{s:"ink",sw:.5,d:[2,1.3]}),R(205.5,.5,9,9.2,{f:"wh"}),
  R(208.1,1,2.4,2.4,{s:"ink",sw:.4,r:1.2}),R(209.5,1,2.4,2.4,{s:"ink",sw:.4,r:1.2}),L(209.3,3.3,211.6,8.9,{s:"ink",sw:.5}),L(210.7,3.3,208.4,8.9,{s:"ink",sw:.5}));
 const bn=`${i} / ${c.n}`;
 e.push(...logo(7,20,15),T(105,24,t.box,{z:3,b:1,a:"m",f:"mu"}),T(105,37,bn,{z:fit(bn,13,1,32),b:1,a:"m"}),
  
  T(175,22,"#"+c.id,{z:6,b:1,a:"m"}),T(175,28.5,c.b[1],{z:fit(c.b[1],3.8,0,62),a:"m"}),T(175,35.5,t.tear,{z:fit(t.tear,3,1,62),b:1,a:"m",f:"ac"}),
  ...logo(219,18,13,{mark:1}),T(250,26,"Nozzler",{z:7,b:1,a:"m"}),T(250,33,t.seal,{z:fit(t.seal,2.6,0,38),a:"m",f:"mu"}));return{w:W,h:H,e}},
slip:(c,i)=>{const t=c.t,b=c.b,W=148,H=210,e=[];head(c,e,W,i);const ps=of_(c,i);
 e.push(T(10,41,b[1],{z:fit(b[1],6,1,128),b:1}),T(10,47,cut("#"+c.id+"  ·  "+b[2]+(c.c.name?"  ·  "+c.c.name:""),3.5,0,128),{z:3.5,f:"mu"}),R(10,54,128,7,{f:"pp",r:1.5}),T(18,59,t.qty,{z:2.8,b:1,f:"mu"}),T(34,59,t.part,{z:2.8,b:1,f:"mu"}));
 let y=70;for(let k=0;k<ps.length;k++){const p=ps[k];if(y>168){e.push(T(34,y,"+ "+(ps.length-k)+" "+t.more,{z:3.8,f:"mu"}));break}
  e.push(R(11,y-3.4,3.8,3.8,{s:"ink",sw:.35}),T(18,y,String(p.q),{z:4.6,b:1}),T(34,y,cut(p.n,4.6,1,100),{z:4.6,b:1}));if(p.d)e.push(T(34,y+4.2,cut(p.d,3.3,0,100),{z:3.3,f:"mu"}));e.push(L(10,y+6.4,138,y+6.4,{s:"ln",sw:.2}));y+=11}
 e.push(T(138,177,t.tot+": "+ps.reduce((a,p)=>a+p.q,0),{z:4.2,b:1,a:"r"}),...bars(10,184,50,10,c.id),T(10,198,c.id,{z:3,b:1}));
 wrap(t.chk,3.2,0,128).forEach((l,k)=>e.push(T(10+128/2,205+k*4,l,{z:3.2,a:"m",f:"mu"})));return{w:W,h:H+4,e}},
receipt:c=>{const R0=rcRows(c.b),W=80,HT={h:9,c:6,t:6,sep:4,kv:5,big:9,bar:15,stamp:14},hh=r=>r[0]=="c"?wrap(r[1],3.3,0,70).length*4.2+2:HT[r[0]]||5,H=Math.ceil(12+R0.reduce((a,r)=>a+hh(r),0)),e=[];let y=6;
 for(const r of R0){const k=r[0];
  if(k=="h")e.push(T(40,y+6,r[1],{z:fit(r[1],6,1,72),b:1,a:"m"}));
  else if(k=="c")wrap(r[1],3.3,0,70).forEach((l,j)=>e.push(T(40,y+3.6+j*4.2,l,{z:3.3,a:"m"})));
  else if(k=="t")e.push(T(5,y+4,r[1],{z:3.3,b:1}));
  else if(k=="sep")e.push(L(5,y+2,75,y+2,{s:"mu",sw:.25,d:[1,.8]}));
  else if(k=="kv"){const v=String(r[2]),vz=fit(v,3.2,0,40,2.4);e.push(T(5,y+3.6,cut(r[1],3.2,0,68-tw(v,vz,0)),{z:3.2}),T(75,y+3.6,v,{z:vz,a:"r"}))}
  else if(k=="big")e.push(T(5,y+6.5,r[1],{z:5,b:1}),T(75,y+6.5,r[2],{z:5,b:1,a:"r"}));
  else if(k=="bar")e.push(...bars(10,y+1,60,10,r[1]));
  else if(k=="stamp")e.push(R(22,y+1,36,10,{s:r[2]?"ac":"ink",sw:.7,r:1.5}),T(40,y+8,r[1],{z:fit(r[1],5,1,32),b:1,a:"m",f:r[2]?"ac":"ink"}));
  y+=hh(r)}return{w:W,h:H,e}},
thanks:c=>{const t=c.t,W=148,H=210,e=[...logo(10,10,15),T(138,17,c.dt,{z:3.6,a:"r",f:"mu"}),R(10,31,128,1.6,{f:"ac"})];let y=50;
 e.push(T(10,y,cut(t.dear.replace("{n}",c.c.name||t.there),5.6,1,128),{z:5.6,b:1}));y+=12;
 for(const p of t.letter){for(const l of wrap(p,4.1,0,128)){e.push(T(10,y,l,{z:4.1}));y+=6.2}y+=4}
 e.push(T(10,y+3,t.reg,{z:4.4}),T(10,y+10,"Sepp",{z:6,b:1,f:"ac"}));
 e.push(R(10,166,128,30,{f:"pp",r:3}),T(16,175,t.yo,{z:2.7,b:1,f:"mu"}),T(16,183,c.b[1],{z:fit(c.b[1],5,1,116),b:1}),T(16,190,cut("#"+c.id+"  ·  "+c.parts.reduce((a,p)=>a+p.q,0)+" "+t.parts+"  ·  "+c.n+" "+(c.lang=="nl"?"dozen":c.n>1?"boxes":"box"),3.4,0,116),{z:3.4,f:"mu"}),
  T(74,205,"Nozzler · by Sepp · 3D printing on demand",{z:2.8,a:"m",f:"mu"}));return{w:W,h:H,e}},
care:c=>{const t=c.t,W=105,H=148,e=[...logo(8,8,12),R(8,26,W-16,1.4,{f:"ac"}),T(8,38,t.care,{z:fit(t.care,6,1,W-16),b:1})];let y=48;
 const tips=[...["PLA","PETG","ABS","ASA","TPU","PA","Carbon"].filter(k=>c.mats.has(k)).map(k=>t[k=="ASA"?"ABS":k=="Carbon"?"PA":k]),...t.tips].filter((v,k,a)=>a.indexOf(v)==k);
 for(const s of tips){const ls=wrap(s,3.8,0,W-24);if(y+ls.length*5>H-14)break;e.push(R(9,y-2.4,2,2,{f:"ac",r:1}));ls.forEach((l,j)=>e.push(T(14,y+j*5,l,{z:3.8})));y+=ls.length*5+3.4}
 e.push(T(W/2,H-7,"Nozzler · by Sepp",{z:2.8,a:"m",f:"mu"}));return{w:W,h:H,e}}};
/* ---------- order data ---------- */
const KINDS=[["delivery","Delivery label","box"],["top","Top label","box"],["seal","Cut-open seal","box"],["slip","Packing slip","box"],["receipt","Receipt","once"],["thanks","Thank-you letter","once"],["care","Care card","once"]];
const ST={id:"",m:"color",lang:"",fmt:"pdf",dpi:300,rot:{},on:Object.fromEntries(KINDS.map(k=>[k[0],1]))};let CUR=[];
const billOf=id=>S.bills.find(b=>b[0]==id),REQS=()=>typeof REQ!="undefined"?REQ:[],PROS=()=>typeof PRO!="undefined"?PRO:{};
const reqOf=b=>b[17]&&REQS().find(r=>r.id==b[17]);
const cust=b=>{const r=reqOf(b),p=r?(r.contact||PROS()[r.user_id]||{}):{},d=b[16]||{};return{name:p.name||"",where:d.loc||(r&&r.delivery_where)||""}};
const defParts=b=>{const m=b[11]||{},pl=m.plates||[],r=reqOf(b),it=r&&r.options&&r.options.items,mt=x=>[x.m,x.w&&x.w+" g"].filter(Boolean).join(" · ");
 if(pl.length>1)return pl.map(p=>({n:p.name||"Plate "+p.plateNum,q:1,x:1,d:mt(p)}));
 if(it&&it.length)return it.map(i=>({n:i.name,q:i.qty||1,x:1,d:[(i.cl||[]).map(c=>c.n).join("+")||i.colour,i.m].filter(Boolean).join(" · ")}));
 return[{n:b[1],q:(r&&r.options&&+r.options.qty)||1,x:1,d:mt(m)}]};
const plan=id=>{S.lbl=S.lbl||{};let p=S.lbl[id];if(!p||!p.parts)p=S.lbl[id]={n:1,pp:1,parts:defParts(billOf(id))};return p};
const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"nozzler";
const gen=()=>{const b=billOf(ST.id),pl=plan(ST.id),lang=ST.lang||CF().lang||"en",all=pl.parts.map(p=>p.d).join(" ")+" "+((b[11]||{}).m||"")+" "+((b[11]||{}).plates||[]).map(p=>p.m).join(" "),
 c={b,id:b[0],n:pl.n,parts:pl.parts,c:cust(b),t:TX[lang]||TX.en,lang,dt:new Date().toLocaleDateString(lang=="nl"?"nl-NL":"en-GB",{day:"numeric",month:"long",year:"numeric"}),mats:new Set(all.match(/\b(PLA|PETG|ABS|ASA|TPU|PA|Carbon)\b/g)||[])},out=[];
 for(const[k,name,g]of KINDS){if(!ST.on[k])continue;for(const i of g=="box"?Array.from({length:pl.n},(_,j)=>j+1):[0]){const sc0=G[k](c,i||pl.pp),sc=ST.rot[k]?rot90(sc0):sc0;out.push({key:k+i,sc,title:name+(ST.rot[k]?" (rotated 90°)":"")+(g=="box"?` · box ${i}/${pl.n}`:` · goes in box ${pl.pp}`),file:`${slug(CF().shop)}_${b[0]}_${k}${g=="box"?"_box"+i:""}`})}}return out};
const stylePick={color:"Colour",gray:"Grayscale",bw:"Black & white"};
window.labelView=()=>{const bs=S.bills.filter(b=>b[14]!="quote");if(!bs.length)return`<div class="card mu">Make a bill first; labels are built from your bills.</div>`;
 if(!bs.some(b=>b[0]==ST.id))ST.id=bs[bs.length-1][0];const pl=plan(ST.id),n=pl.n,op=(a,sel)=>a.map(([v,l])=>`<option value="${v}" ${v==sel?"selected":""}>${esc(l)}</option>`).join(""),nums=Array.from({length:n},(_,i)=>[i+1,"Box "+(i+1)]);
 CUR=gen();const sel=(k,a,v)=>`<select data-lbi="${k}">${op(a,v)}</select>`;
 const rows=pl.parts.map((p,i)=>`<tr><td><input data-lbi="p:${i}:n" value="${esc(p.n)}" style="min-width:160px"></td><td><input data-lbi="p:${i}:d" value="${esc(p.d||"")}" style="min-width:120px"></td><td><input data-lbi="p:${i}:q" type="number" min="1" value="${p.q}" style="width:70px"></td><td>${sel("p:"+i+":x",nums,p.x)}</td><td><div class="acts"><button class="btn g s" data-lb="split:${i}" title="Split this part over two boxes">Split</button><button class="btn g s" data-lb="del:${i}">✕</button></div></td></tr>`).join("");
 const empty=nums.filter(([v])=>!pl.parts.some(p=>p.x==v)).map(([,l])=>l);
 return`<div class="card" style="margin-bottom:14px"><h2>Box labels &amp; papers</h2><div class="f">
 <div><label>Order</label>${sel("id",bs.slice().reverse().map(b=>[b[0],`${b[1]} · ${b[3]||"–"} · ${b[0]}`]),ST.id)}</div>
 <div><label>Number of boxes</label><input data-lbi="n" type="number" min="1" max="30" value="${n}"></div>
 <div><label>Receipt, letter &amp; care card go in</label>${sel("pp",nums,pl.pp)}</div>
 <div><label>Print style</label>${sel("m",Object.entries(stylePick),ST.m)}</div>
 <div><label>Language</label>${sel("lang",[["","Shop default ("+CF().lang+")"],["en","English"],["nl","Nederlands"]],ST.lang)}</div></div>
 <h2>Which parts go in which box</h2><div class="tw"><table><tr><th>Part</th><th>Details</th><th>Qty</th><th>Box</th><th></th></tr>${rows}</table></div>
 <div class="row" style="margin-top:10px"><button class="btn g s" data-lb="add">+ Add part</button><button class="btn g s" data-lb="spread">Spread evenly</button><button class="btn g s" data-lb="reset">Reset from bill</button>${empty.length?`<span class="wn">${empty.join(", ")} ${empty.length>1?"are":"is"} empty</span>`:""}</div>
 <h2 style="margin-top:14px">Labels to make <span class="mu" style="font-weight:400;font-size:12px">(↻90° turns a label sideways, e.g. the seal strip for a vertical side)</span></h2><div class="row">${KINDS.map(k=>`<label style="display:flex;gap:6px;align-items:center;color:var(--tx);margin:0"><input type="checkbox" style="width:auto" data-lbi="k:${k[0]}" ${ST.on[k[0]]?"checked":""}>${k[1]}</label><label style="display:flex;gap:4px;align-items:center;color:var(--mu);margin:0 10px 0 -4px;font-size:12px" title="Rotate ${k[1]} 90°"><input type="checkbox" style="width:auto" data-lbi="r:${k[0]}" ${ST.rot[k[0]]?"checked":""}>↻90°</label>`).join("")}</div>
 <div class="row"><span class="mu">Download everything as</span>${sel("fmt",[["pdf","One PDF (vector)"],["svg","SVG files (zip)"],["png","PNG files (zip)"]],ST.fmt)}${sel("dpi",[[150,"PNG 150 dpi"],[300,"PNG 300 dpi"],[600,"PNG 600 dpi"]],ST.dpi)}<button class="btn" data-lb="all">Download all (${CUR.length})</button></div></div>
 <div class="lbg">${CUR.map(l=>`<div class="card"><h2>${esc(l.title)}</h2><div class="lbv">${svg(l.sc,ST.m)}</div><p class="mu" style="margin:6px 0">${l.sc.w} × ${l.sc.h} mm</p><div class="acts"><button class="btn g s" data-lb="svg:${l.key}">SVG</button><button class="btn g s" data-lb="png:${l.key}">PNG</button><button class="btn g s" data-lb="pdf:${l.key}">PDF</button></div></div>`).join("")}</div>`};
const re=()=>{if(tab=="Labels")$("#app").innerHTML=labelView()};
document.addEventListener("click",async e=>{const el=e.target.closest("[data-lb]");if(!el||tab!="Labels")return;const[a,x]=el.dataset.lb.split(":"),pl=plan(ST.id),m=ST.m;
 try{if(a=="add")pl.parts.push({n:"New part",q:1,x:1,d:""});
 else if(a=="del")pl.parts.splice(+x,1);
 else if(a=="split"){const p=pl.parts[+x];if(p.q>1){const h=Math.floor(p.q/2);p.q-=h;pl.parts.splice(+x+1,0,{...p,q:h,x:Math.min(pl.n,p.x+1)})}else toast("Quantity is 1, nothing to split")}
 else if(a=="spread")pl.parts.forEach((p,i)=>p.x=Math.floor(i*pl.n/pl.parts.length)+1);
 else if(a=="reset")pl.parts=defParts(billOf(ST.id));
 else if(a=="all"){const f=ST.fmt;toast("Preparing…");
  if(f=="pdf")dl(new Blob([pdf(CUR.map(l=>l.sc),m)],{type:"application/pdf"}),`${slug(CF().shop)}_${ST.id}_labels.pdf`);
  else{const fs=[];for(const l of CUR)fs.push({n:l.file+"."+f,d:f=="svg"?new TextEncoder().encode(svg(l.sc,m)):new Uint8Array(await(await png(l.sc,m,+ST.dpi)).arrayBuffer())});dl(zip(fs),`${slug(CF().shop)}_${ST.id}_labels_${f}.zip`)}return}
 else{const l=CUR.find(q=>q.key==x);if(!l)return;
  if(a=="svg")dl(new Blob([svg(l.sc,m)],{type:"image/svg+xml"}),l.file+".svg");else if(a=="png")dl(await png(l.sc,m,+ST.dpi),l.file+".png");else if(a=="pdf")dl(new Blob([pdf([l.sc],m)],{type:"application/pdf"}),l.file+".pdf");return}
 save();re()}catch(err){console.error(err);toast("Label export failed: "+(err&&err.message||err))}});
document.addEventListener("change",e=>{const el=e.target.closest("[data-lbi]");if(!el||tab!="Labels")return;const[k,x,y]=el.dataset.lbi.split(":"),v=el.value,pl=plan(ST.id);
 if(k=="n"){pl.n=Math.max(1,Math.min(30,+v||1));pl.parts.forEach(p=>p.x=Math.min(p.x,pl.n));pl.pp=Math.min(pl.pp,pl.n)}
 else if(k=="pp")pl.pp=+v;else if(k=="p"){const p=pl.parts[+x];if(y=="q")p.q=Math.max(1,Math.round(+v)||1);else if(y=="x")p.x=+v;else p[y]=v}
 else if(k=="k")ST.on[x]=el.checked?1:0;else if(k=="r")ST.rot[x]=el.checked?1:0;else ST[k]=v;
 if(["n","pp","p"].includes(k))save();re()});
document.head.appendChild(Object.assign(document.createElement("style"),{textContent:".acts{display:flex;gap:6px;flex-wrap:wrap}.lbg{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}.lbv{background:#e8e6df;border-radius:6px;padding:10px;display:flex;justify-content:center}.lbv svg{max-width:100%;max-height:340px;width:auto;height:auto;box-shadow:0 1px 6px #0003}"}));
window.LabelGen={G,rot90,svg,pdf,zip,png,PAL,scene:(c,k,i)=>G[k](c,i),pick:id=>{ST.id=id},_gen:gen,_st:ST};
/* opened straight on #Labels: the first render ran before this file loaded */
if(typeof tab!="undefined"&&tab=="Labels"&&typeof render=="function")render();
})();
