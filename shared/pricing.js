/* Shared by admin and shop. Edit rates here; both apps use them. */
(()=>{const P=window.PRICING={MAT:{PLA:25,PETG:25,TPU:36,PA:30,Carbon:35,ABS:26,ASA:25},DENS:{PLA:1.24,PETG:1.27,TPU:1.21,PA:1.14,Carbon:1.3,ABS:1.04,ASA:1.07},
mult:7,machine:.5,support:.05,color:.25,rate:2.5,rush:25,min:3,
STRENGTH:{light:{n:"Light · decorative (10% infill)",wall:.8,fill:.1},standard:{n:"Standard · everyday (20% infill)",wall:1.2,fill:.2},strong:{n:"Strong · functional (40% infill)",wall:1.6,fill:.4},max:{n:"Maximum · heavy duty (70% infill)",wall:2.4,fill:.7}}};
P.COLORS=[["Black","#1a1a1a"],["White","#f5f5f5"],["Grey","#8a8d91"],["Red","#d32f2f"],["Orange","#f57c00"],["Yellow","#fbc02d"],["Green","#388e3c"],["Teal","#00897b"],["Blue","#1976d2"],["Navy","#1a237e"],["Purple","#7b1fa2"],["Pink","#ec407a"],["Brown","#6d4c41"],["Beige","#d7c4a3"],["Gold","#c9a227"],["Clear","#dfe9ee"]];
const r=v=>Math.round(v*100)/100;
P.estimate=o=>{const s=P.STRENGTH[o.st]||P.STRENGTH.standard,k=(o.sc||100)/100,q=o.qty||1;let w=o.w,t=o.t,sp=0;
 if(!o.w){const v=o.vol*k**3*1000,sh=Math.min(v,o.area*k**2*s.wall),pv=sh+(v-sh)*s.fill;w=pv/1000*P.DENS[o.m];t=pv/(P.rate*(o.lh/.2))/60;sp=pv/1000*({yes:.12,auto:.05,no:0}[o.sup]||0)}
 else if(!t)t=w/P.DENS[o.m]*1000/P.rate/60;
 w*=q;t*=q;sp*=q;const b={material:P.MAT[o.m]*w/1000*P.mult,machine_time:P.machine*t/60,support_removal:P.support*sp,color_changes:P.color*Math.max(0,(o.cols||1)-1)*6*q};
 for(const x in b)b[x]=r(b[x]);const sub=Object.values(b).reduce((a,x)=>a+x,0),ru=o.rush?r(sub*P.rush/100):0;
 return{w:r(w),t:Math.round(t),sp:r(sp),b,rush:ru,total:r(Math.max(P.min,sub+ru))}};
P.stats=tri=>{if(!tri.length)throw 0;let V=0,A=0,mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];
 for(const t of tri){const[a,b,c,d,e,f,g,h,i]=t;V+=(a*(e*i-f*h)-b*(d*i-f*g)+c*(d*h-e*g))/6;const ux=d-a,uy=e-b,uz=f-c,vx=g-a,vy=h-b,vz=i-c;
  A+=Math.hypot(uy*vz-uz*vy,uz*vx-ux*vz,ux*vy-uy*vx)/2;for(let k=0;k<3;k++)for(let j=0;j<3;j++){mn[j]=Math.min(mn[j],t[k*3+j]);mx[j]=Math.max(mx[j],t[k*3+j])}}
 return{vol:Math.abs(V)/1000,area:A,dim:mx.map((x,i)=>x-mn[i])}};
P.stl=buf=>{const d=new DataView(buf),n=d.getUint32(80,true),tri=[];
 if(buf.byteLength==84+50*n)for(let i=0;i<n;i++){const o=84+50*i+12;tri.push([...Array(9)].map((_,k)=>d.getFloat32(o+4*k,true)))}
 else{const v=(new TextDecoder().decode(buf).match(/vertex\s+\S+\s+\S+\s+\S+/g)||[]).map(x=>x.split(/\s+/).slice(1).map(Number));for(let i=0;i+2<v.length;i+=3)tri.push([...v[i],...v[i+1],...v[i+2]])}
 return P.stats(tri)};
P.unzip=async buf=>{const d=new DataView(buf),u=new Uint8Array(buf);let e=buf.byteLength-22;while(e>=0&&d.getUint32(e,true)!=0x06054b50)e--;if(e<0)throw 0;
 const n=d.getUint16(e+10,true),o={};let p=d.getUint32(e+16,true);
 for(let i=0;i<n;i++){const m=d.getUint16(p+10,true),cs=d.getUint32(p+20,true),nl=d.getUint16(p+28,true),xl=d.getUint16(p+30,true),cl=d.getUint16(p+32,true),lo=d.getUint32(p+42,true),nm=new TextDecoder().decode(u.subarray(p+46,p+46+nl));
  o[nm]=async()=>{const s=lo+30+d.getUint16(lo+26,true)+d.getUint16(lo+28,true),raw=u.subarray(s,s+cs);if(!m)return raw;return new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer())};p+=46+nl+xl+cl}return o};
P.threemf=async buf=>{const z=await P.unzip(buf),dec=u=>new TextDecoder().decode(u);
 if(z["Metadata/slice_info.config"]){const x=dec(await z["Metadata/slice_info.config"]()),g=k=>+((x.match(new RegExp('key="'+k+'"\\s+value="([\\d.]+)"'))||[])[1]||0),
  w=[...x.matchAll(/used_g="([\d.]+)"/g)].reduce((a,m)=>a+ +m[1],0)||g("weight");if(w)return{w,t:g("prediction")/60,sliced:1}}
 const tri=[];for(const k of Object.keys(z).filter(k=>/\.model$/i.test(k))){const x=dec(await z[k]());
  for(const m of x.matchAll(/<mesh>([\s\S]*?)<\/mesh>/g)){const v=[...m[1].matchAll(/<vertex x="([^"]+)" y="([^"]+)" z="([^"]+)"/g)].map(a=>[+a[1],+a[2],+a[3]]);
   for(const t of m[1].matchAll(/<triangle v1="(\d+)" v2="(\d+)" v3="(\d+)"/g))tri.push([...v[t[1]],...v[t[2]],...v[t[3]]])}}
 return P.stats(tri)};
P.gcode=t=>{const L=s=>(t.match(s)||[])[1],num=s=>+(L(s)||0),fg=L(/filament used \[g\]\s*=\s*([\d.,\s]+)/i),
 w=num(/total filament weight \[g\]\s*:\s*([\d.]+)/i)||(fg?fg.split(",").reduce((a,x)=>a+(+x||0),0):0),
 ts=L(/(?:total estimated time|estimated printing time[^=\n]*)\s*[:=]\s*([^\n;]+)/i),k=u=>+((ts||"").match(new RegExp("(\\d+(?:\\.\\d+)?)\\s*"+u))||[])[1]||0,
 m=ts?k("d")*1440+k("h")*60+k("m")+k("s")/60:num(/;TIME:(\d+)/)/60;if(!w||!m)throw 0;return{w,t:m,sliced:1}};
P.obj=t=>{const v=[],tri=[];for(const l of t.split("\n")){if(l[0]=="v"&&l[1]==" ")v.push(l.trim().split(/\s+/).slice(1,4).map(Number));
 else if(l[0]=="f"&&l[1]==" "){const i=l.trim().split(/\s+/).slice(1).map(x=>{const n=parseInt(x);return n<0?v.length+n:n-1});for(let k=1;k+1<i.length;k++)tri.push([...v[i[0]],...v[i[k]],...v[i[k+1]]])}}return P.stats(tri)};
})();
