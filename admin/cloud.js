/* Admin cloud layer: login gate, Supabase sync of the whole app state, customer requests inbox. */
(()=>{const C=window.APP_CONFIG||{},on=C.SUPABASE_URL&&!/YOUR/.test(C.SUPABASE_URL)&&window.supabase,
sb=on?supabase.createClient(C.SUPABASE_URL,C.SUPABASE_ANON_KEY,{auth:{storageKey:"p3d-admin"}}):null;
const M=()=>{try{return JSON.parse(localStorage.getItem("p3d_sync")||"{}")}catch(e){return{}}},setM=o=>localStorage.setItem("p3d_sync",JSON.stringify({...M(),...o}));
/* ask the notify Edge Function to mail whatever changed on a request (it de-duplicates, so extra calls are harmless) */
const ping=id=>{if(sb&&id)sb.functions.invoke("notify",{body:{id}}).then(r=>{if(r.error)console.warn("notify:",r.error.message||r.error)}).catch(e=>console.warn("notify:",e))};
let RF="",REQ=[],PRO={},timer=0,cloud=false;const STM={queued:"in_queue",printing:"printing",ready:"ready",delivered:"delivered"};
const chip=document.createElement("button");chip.className="btn g s";chip.onclick=()=>cloud?(chip.dataset.s=="conflict"?resolve():sync()):0;
const so=document.createElement("button");so.className="btn g s";so.textContent="Sign out";so.onclick=async()=>{if(M().dirty&&!confirm("There are changes not synced to the cloud yet. Sign out and discard them?"))return;await sb.auth.signOut();["p3d2","p3d_sync"].forEach(k=>localStorage.removeItem(k));location.reload()};
const setSt=s=>{chip.dataset.s=s;chip.textContent={synced:"✓ Synced",syncing:"Syncing…",dirty:"Unsynced changes",conflict:"⚠ Conflict: tap to resolve",err:"Sync error: tap to retry"}[s]||s};
const gate=document.createElement("div");gate.style.cssText="position:fixed;inset:0;z-index:50;background:var(--bg);display:grid;place-items:center;padding:20px";
gate.innerHTML=`<div class="card" style="width:min(380px,100%)"><h2>3D Print <span style="color:var(--ac)">Desk</span> admin</h2>${on?`<label>Email</label><input id="ge" type="email" autocomplete="email"><label style="margin-top:8px">Password</label><input id="gp" type="password" autocomplete="current-password"><p id="gm" class="wn"></p><div class="row"><button class="btn" id="gi">Sign in</button></div>`:`<p class="mu">Supabase is not configured yet. Fill in <b>config.js</b> to enable cloud sync and login.</p>`}${on?"":`<p><button class="btn g s" id="gl">Work offline (this device only)</button></p>`}</div>`;
document.body.append(gate);
const err=t=>{const m=gate.querySelector("#gm");if(m)m.textContent=t};
async function ok(){const{data:{session}}=await sb.auth.getSession();if(!session)return false;const{data:p}=await sb.from("profiles").select("role").eq("id",session.user.id).maybeSingle();
 if(!p||p.role!="admin"){await sb.auth.signOut();err("This account is not an admin.");return false}return true}
async function enter(){gate.remove();cloud=true;const h=document.querySelector("header");h.insertBefore(chip,h.querySelector("[data-a=th]"));h.append(so);
 await pull();window.onSaved=()=>{setM({dirty:true});setSt("dirty");clearTimeout(timer);timer=setTimeout(push,1500)};window.__start();loadReq();pubColors();setInterval(loadReq,15000)}
const gl=gate.querySelector("#gl");if(gl)gl.onclick=()=>{gate.remove();window.__start()};
if(on){gate.querySelector("#gi").onclick=async()=>{err("");const r=await sb.auth.signInWithPassword({email:gate.querySelector("#ge").value.trim(),password:gate.querySelector("#gp").value});
  if(r.error)return err(r.error.message);if(await ok())enter()};sb.auth.getSession().then(async({data})=>{if(data.session&&await ok())enter()})}
async function pull(){setSt("syncing");const{data,error}=await sb.from("app_state").select("*").eq("id","main").maybeSingle();if(error)return setSt("err");const m=M();
 if(!data){const r=await sb.from("app_state").insert({id:"main",data:S,version:1});if(r.error)return setSt("err");setM({version:1,dirty:false});return setSt("synced")}
 if(m.dirty&&data.version>(m.version||0))return setSt("conflict");
 if(data.version>(m.version||0)){S=data.data;try{localStorage.setItem("p3d2",JSON.stringify(S))}catch(e){}}
 setM({version:data.version});m.dirty?push():setSt("synced")}
async function push(){const m=M();setSt("syncing");const{data,error}=await sb.from("app_state").update({data:S,version:(m.version||0)+1,updated_at:new Date().toISOString()}).eq("id","main").eq("version",m.version||0).select("version");
 if(error)return setSt("err");if(!data.length)return setSt("conflict");setM({version:data[0].version,dirty:false});setSt("synced");mirror()}
const sync=async()=>{await pull();if(M().dirty)push();loadReq()};
async function resolve(){const{data}=await sb.from("app_state").select("*").eq("id","main").single();
 if(confirm("Overwrite the cloud with THIS device's data?\nCancel = replace this device with the cloud copy.")){setM({version:data.version});push()}
 else{S=data.data;try{localStorage.setItem("p3d2",JSON.stringify(S))}catch(e){}setM({version:data.version,dirty:false});setSt("synced");render()}}
/* push bill progress back to the customer's request */
async function mirror(){for(const b of S.bills){const r=b[17]&&REQ.find(x=>x.id==b[17]);if(!r||["declined","cancelled"].includes(r.status))continue;const o=QD(b),pat={};
  const st=b[14]=="quote"?(r.status=="accepted"?"accepted":"quoted"):(STM[o.st]||r.status);if(st!=r.status)pat.status=st;if(+r.quoted_price!=b[5])pat.quoted_price=b[5];
  if(!!r.paid!=!!b[6])pat.paid=!!b[6];if(o.due&&r.due!=o.due)pat.due=o.due;if(r.bill_id!=b[0])pat.bill_id=b[0];
  if(Object.keys(pat).length){pat.updated_at=new Date().toISOString();const{error}=await sb.from("requests").update(pat).eq("id",r.id);if(!error){Object.assign(r,pat);ping(r.id)}}}await mirrorWallet()}
/* publish each customer's credit/points and the voucher list so the shop can show and check them */
let WS="";async function mirrorWallet(){const rows=Object.values(PRO).filter(p=>p.role!="admin"&&p.account_id).map(p=>{const a=find(p.account_id);return a?{user_id:p.id,account_id:p.account_id,points:a[1],credit:a[2],updated_at:new Date().toISOString()}:null}).filter(Boolean),
 vs=S.cards.filter(c=>T[c[1]]&&T[c[1]][2]=="voucher").map(c=>({serial:c[0],pct:T[c[1]][3],label:T[c[1]][1],unlimited:!!T[c[1]][4],used:!!c[4],updated_at:new Date().toISOString()})),
 sig=JSON.stringify([rows.map(r=>[r.user_id,r.points,r.credit]),vs.map(v=>[v.serial,v.used])]);if(sig==WS)return;
 try{if(rows.length){const x=await sb.from("wallets").upsert(rows);if(x.error)throw x.error}
  for(let i=0;i<vs.length;i+=400){const x=await sb.from("vouchers").upsert(vs.slice(i,i+400));if(x.error)throw x.error}
  const{data}=await sb.from("vouchers").select("serial").limit(5000),keep=new Set(vs.map(v=>v.serial)),gone=(data||[]).map(x=>x.serial).filter(s=>!keep.has(s));
  for(let i=0;i<gone.length;i+=200)await sb.from("vouchers").delete().in("serial",gone.slice(i,i+200));WS=sig}catch(e){console.warn("wallet sync (run the new schema.sql?)",e)}}
async function loadReq(){const[a,b]=await Promise.all([sb.from("requests").select("*").order("created_at",{ascending:false}),sb.from("profiles").select("id,name,email,account_id,phone,address,role")]);
 if(a.data){REQ=a.data;(b.data||[]).forEach(p=>PRO[p.id]=p);
  /* quotes the customer has accepted since the last check */
  const acc=new Set(REQ.filter(r=>r.status=="accepted").map(r=>r.id)),fresh=SEEN?[...acc].filter(i=>!SEEN.has(i)):[];SEEN=acc;
  if(fresh.length){const r=REQ.find(x=>x.id==fresh[0]);toast("✓ "+((PRO[r.user_id]||{}).name||"Customer")+" accepted “"+r.name+"”"+(fresh.length>1?" (+"+(fresh.length-1)+" more)":""))}
  if(["Requests","Bills","Queue","Dashboard"].includes(tab)&&!modal)render();mirror()}}
let SEEN=null;window.reqAcc=b=>b[14]=="quote"&&!!b[17]&&REQ.some(r=>r.id==b[17]&&r.status=="accepted");
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&cloud)loadReq()});
window.reqView=()=>{const n=REQ.filter(r=>r.status=="new").length;if(!cloud)return`<div class="card mu">Sign in with Supabase to receive customer requests.</div>`;
 return`<div class="row"><span class="mu">${REQ.length} requests · ${n} new</span><select data-rf style="width:auto">${["","new","quoted","accepted","in_queue","printing","ready","delivered","declined","cancelled"].map(x=>`<option value="${x}" ${RF==x?"selected":""}>${x||"All statuses"}</option>`).join("")}</select><button class="btn g s" data-a="rqr">Refresh</button></div><div class="card">${REQ.length?tbl(["When","Customer","Request","Source","Estimate","Status"],REQ.filter(r=>!RF||r.status==RF).map(r=>({a:"rq:"+r.id,c:[r.created_at.slice(0,10),esc((PRO[r.user_id]||{}).name||"?"),esc(r.name),r.source,r.est_price!=null?E(r.est_price):"manual",`<span class="tag ${r.status=="new"||r.status=="accepted"?"pr-high":""}">${r.status}</span>`]})),[]):'<span class="mu">No requests yet</span>'}</div>`};
document.addEventListener("change",e=>{if(e.target.dataset&&e.target.dataset.rf!==undefined){RF=e.target.value;render()}});
window.custView=()=>{if(!cloud)return`<div class="card mu">Sign in with Supabase to see customers.</div>`;const L=Object.values(PRO).filter(p=>p.role!="admin");
 return`<div class="card">${L.length?tbl(["Customer","Phone","Email","Account","Credit","Points","Orders","Paid total"],L.map(p=>{const o=REQ.filter(r=>r.user_id==p.id);return{a:"",c:[esc(p.name||"?"),p.phone?`<a href="tel:${esc(p.phone)}">${esc(p.phone)}</a>`:"–",esc(p.email||""),esc(p.account_id||""),find(p.account_id||"")?E(find(p.account_id)[2]):"–",find(p.account_id||"")?find(p.account_id)[1]:"–",o.length,E(o.filter(r=>r.paid).reduce((a,r)=>a+(+r.quoted_price||0),0))]}}),[]):'<span class="mu">No customers yet</span>'}</div>`};
const useTxt=u=>u?[u.credit?"account credit":"",u.points?(u.points=="all"?"all points":u.points+" pts"):"",u.voucher?"voucher "+u.voucher+" ("+u.pct+"%)":""].filter(Boolean).join(" + "):"";
const reqModal=r=>{const o=r.options||{},p=PRO[r.user_id]||{},kv=(a,b)=>b?`<div class="kv"><span class="mu">${a}</span><span>${esc(b)}</span></div>`:"";
 return`<h2>${esc(r.name)}</h2><p class="mu">Account ${esc(p.account_id||"")}</p><div class="card" style="background:var(--bg)"><b>Contact${r.contact?"":" (not shared yet)"}</b>${(()=>{const c=r.contact||p;return`<div>${esc(c.name||"")}</div>${c.phone?`<div><a href="tel:${esc(c.phone)}">${esc(c.phone)}</a></div>`:'<div class="wn">No phone number</div>'}${c.email?`<div><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></div>`:""}${c.address?`<div>${esc(c.address)}</div>`:""}`})()}${r.accepted_at?`<div class="mu">Accepted ${r.accepted_at.slice(0,10)}</div>`:""}</div><p><span class="tag">${r.status}</span> estimate ${r.est_price!=null?E(r.est_price):"manual quote"}</p>
 ${(o.items||[]).map(it=>`<div class="kv"><span>${esc(it.name)} ×${it.qty}</span><span>${(it.cl||[]).map(c=>`<i title="${esc(c.n)}" style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${esc(c.h)};border:1px solid var(--bd);margin-right:3px"></i>`).join("")}${esc((it.cl||[]).map(c=>c.n).join("+")||it.colour||"")}${it.colour&&it.cl&&it.cl.length?" ("+esc(it.colour)+")":""} · ${esc(it.m)} · ${esc(it.st)} · ${it.plate?"plate "+it.plate:"auto plate"}${it.est?" · "+it.est.w+" g":""}</span></div>`).join("")}${kv("Material",o.items?"":o.m)}${kv("Strength",o.st)}${kv("Layer",o.lh)}${kv("Colour",(o.colour||"")+(o.cols>1?" ×"+o.cols:""))}${kv("Quantity",o.qty)}${kv("Supports",o.sup)}${kv("Scale",o.sc&&o.sc+"%")}${kv("Rush",o.rush?"yes":"")}${kv("Wants to use",useTxt(o.use))}${kv("Buy model for customer",o.buy?"yes":"")}${kv("Wanted by",r.due&&r.due+(o.tm?" "+o.tm:""))}${kv("Delivery",r.delivery_method+(r.delivery_where?": "+r.delivery_where:""))}${kv("Notes",r.notes)}${kv("Description",o.desc)}
 ${(r.links||[]).map(u=>`<p><a href="${esc(u)}" target="_blank" rel="noopener">${esc(u)}</a></p>`).join("")}<div id="rf" class="mu">${(r.files||[]).length?"Loading files…":""}</div>
 <div class="row" style="margin-top:14px">${r.bill_id?`<button class="btn" data-a="rqs:${r.id}">Actual price from sliced file</button>`:`<button class="btn" data-a="rqp:${r.id}">Prepare quote</button>`}<button class="btn g" data-a="rqm:${r.id}">Message customer</button><button class="btn g" data-a="rqd:${r.id}">Decline</button><button class="btn g" data-a="x">Close</button></div>`};
document.addEventListener("click",async e=>{const el=e.target.closest("[data-a]");if(!el||!cloud)return;const[k,id]=el.dataset.a.split(":"),r=REQ.find(x=>x.id==id);
 if(k=="rqr")return loadReq();
 if(k=="al"){const u=(Q.ml||"").split(/\s+/).find(x=>/^https?:/i.test(x));if(!u)return toast("Put the model link in “Model link / source” first");toast("Reading the page…");
  const{data,error}=await sb.functions.invoke("model-info",{body:{url:u}});
  if(data instanceof Blob){try{const buf=await data.arrayBuffer(),z=new Uint8Array(buf,0,2),s=z[0]==0x50&&z[1]==0x4b?await PRICING.threemf(buf):PRICING.stl(buf),e=s.w?{w:s.w,t:s.t}:PRICING.estimate({m:Q.m,st:"standard",lh:.2,cols:1,qty:1,sup:"auto",sc:100,vol:s.vol,area:s.area});
   Object.assign(Q,{w:e.w,t:Math.round(e.t)});toast("Model downloaded: "+e.w+" g");return render()}catch(x){return toast("Downloaded the file but couldn’t read it")}}
  const p=data&&data.profiles&&data.profiles[0];if(error||!p)return toast("Couldn’t read weight and time from that page");
  Object.assign(Q,{w:p.w,t:Math.round(p.t||0)||Q.t,name:Q.name||data.title||""});toast("Filled in "+p.w+" g");render()}
 if(k=="rq"&&r){modal=reqModal(r);render();if((r.files||[]).length){const{data}=await sb.storage.from("uploads").createSignedUrls(r.files,3600);const h=$("#rf");if(h)h.innerHTML=(data||[]).map(f=>`<p><a href="${f.signedUrl}" target="_blank" rel="noopener">⬇ ${esc(f.path.split("/").pop().replace(/^\d+_/,""))}</a></p>`).join("")}}
 if(k=="rqm"&&r){const n=prompt("Message the customer will see on their order:",r.admin_note||"");if(n===null)return;const{error}=await sb.from("requests").update({admin_note:n||null,updated_at:new Date().toISOString()}).eq("id",id);if(!error){r.admin_note=n;ping(id);toast("Message saved")}}
 if(k=="rqd"&&r){const n=prompt("Message to the customer (optional)");if(n===null)return;await sb.from("requests").update({status:"declined",admin_note:n||null,updated_at:new Date().toISOString()}).eq("id",id);ping(id);modal="";loadReq();render()}
 if(k=="rqs"&&r){const b=S.bills.find(x=>x[0]==r.bill_id);if(!b)return alert("Bill not found on this device. Sync first.");const m=b[11]||{},c=b[8]||{};
  Object.assign(Q,{name:b[1],acct:b[3],m:m.m||"PLA",w:m.w||0,t:m.t||0,s:m.s||0,c:m.c||0,mf:c.model_fee||0,df:c.design_fee||0,tip:b[7]||0,v:b[9]||"",rb:b[0],an:null,info:null});
  modal="";tab="Quote";location.hash="Quote";render();toast("Drop the sliced .gcode.3mf to get the actual price")}
 if(k=="rqp"&&r){const o=r.options||{},e2=r.est||{},p=PRO[r.user_id]||{},ac=p.account_id||"";if(ac&&!find(ac))S.accounts.push([ac,0,0,today()]);
  Object.assign(Q,{name:r.name,w:e2.w||+o.w||0,t:e2.t||+o.t||0,s:e2.sp||0,c:(o.items||[]).length?o.items.reduce((a,i)=>a+Math.max(0,(i.cols||1)-1)*6*(i.qty||1),0):Math.max(0,(o.cols||1)-1)*6*(o.qty||1),m:P_MAT(o.m),acct:ac,rid:r.id,pr:o.rush?"urgent":"normal",dd:r.due||"",tm:o.tm||"",dm:r.delivery_method||"pickup",dl:r.delivery_where||"",mf:0,df:0,ml:(r.links||[]).join(" "),fn:(r.files||[])[0]?r.files[0].split("/").pop():"",uc:!!(o.use&&o.use.credit),up:!!(o.use&&o.use.points),pts:o.use&&o.use.points&&o.use.points!="all"?o.use.points:"",v:o.use&&o.use.voucher&&vch().some(c=>c[0]==o.use.voucher)?o.use.voucher:""});
  modal="";tab="Quote";location.hash="Quote";render()}});
document.addEventListener("click",e=>{if(!e.target.closest('[data-a="rb"]'))return;const b=S.bills.find(x=>x[0]==Q.rb);if(!b)return;const old=b[5],c=calc();
 b[4]=c.base;b[5]=c.due;b[8]={...c.b,total:c.base};b[11]={...(b[11]||{}),m:Q.m,w:Q.w,t:Q.t,s:Q.s,c:Q.c,fn:Q.fn||(b[11]||{}).fn||"",final:1};
 const r=b[17]&&REQ.find(x=>x.id==b[17]);if(cloud&&r&&c.due!=old){const n=prompt("Note to the customer about the final price (optional)");if(n)sb.from("requests").update({admin_note:n}).eq("id",r.id).then(()=>{r.admin_note=n;ping(r.id)})}
 Q.rb="";save();toast("Bill updated: "+E(c.due));tab="Bills";location.hash="Bills";modal=bm(b[0]);render()});
let pt=0,pub="Not published yet";const MATS=Object.keys(PRICING.MAT),CL=()=>S.colors||(S.colors=PRICING.COLORS.map(c=>({n:c[0],h:c[1],on:true,m:[]})));
function pubColors(now){if(!cloud){pub="Offline: saved on this device. Sign in to publish to the shop.";return}clearTimeout(pt);
 const go=async()=>{const v={custom:!!S.colorsCustom,list:CL().filter(c=>c.on).map(c=>({n:c.n,h:c.h,m:c.m||[]}))};const{error}=await sb.from("public_settings").upsert({key:"colors",value:v,updated_at:new Date().toISOString()});
  pub=error?"Publish failed: "+error.message:"Shop shows "+v.list.length+" colours · published "+new Date().toLocaleTimeString();if(tab=="Colors"&&!modal)render()};now?go():pt=setTimeout(go,1000)}
window.colView=()=>{const L=CL();return`<div class="card"><h2>Colours you have</h2><p class="mu">Customers only see colours that are switched on. Pick materials to limit a colour to them (none picked = all materials).</p>
 <label style="display:flex;gap:8px;align-items:center;color:var(--tx)"><input type="checkbox" data-cu ${S.colorsCustom?"checked":""} style="width:auto">Also let customers pick any custom colour</label></div>
 ${L.map((c,i)=>`<div class="card" style="padding:12px"><div class="row"><input type="color" data-col="${i}:h" value="${esc(c.h)}" style="width:44px;padding:2px"><input data-col="${i}:n" value="${esc(c.n)}" style="flex:1;min-width:120px">
 <label style="display:flex;gap:6px;align-items:center;color:var(--tx);margin:0"><input type="checkbox" data-a="colt:${i}" ${c.on?"checked":""} style="width:auto">Available</label><button class="btn g s" data-a="cold:${i}">Delete</button></div>
 <div class="row" style="margin-top:8px;gap:6px">${MATS.map(m=>`<button class="btn s ${(c.m||[]).includes(m)?"":"g"}" data-a="colm:${i}:${m}">${m}</button>`).join("")}</div></div>`).join("")}
 <div class="card"><h2>Add a colour</h2><div class="row"><input type="color" id="nch" value="#888888" style="width:44px;padding:2px"><input id="nc" placeholder="Name, e.g. Matte Charcoal" style="flex:1;min-width:140px"><button class="btn" data-a="cola">Add</button></div></div>
 <div class="row"><span class="mu">${esc(pub)}</span><button class="btn g s" data-a="colp">Publish to shop now</button></div>`};
document.addEventListener("click",e=>{const el=e.target.closest("[data-a^='col']");if(!el)return;const[k,i,m]=el.dataset.a.split(":"),L=CL();
 if(k=="colt")L[i].on=!L[i].on;else if(k=="cold"){if(!confirm("Delete "+L[i].n+"?"))return;L.splice(i,1)}
 else if(k=="colm"){const a=L[i].m=L[i].m||[],j=a.indexOf(m);j<0?a.push(m):a.splice(j,1)}
 else if(k=="cola"){const n=$("#nc").value.trim();if(!n)return;L.push({n,h:$("#nch").value,on:true,m:[]})}
 else if(k=="colp")return pubColors(true);else return;save();pubColors();render()});
document.addEventListener("change",e=>{const t=e.target;if(t.dataset.col){const[i,f]=t.dataset.col.split(":");CL()[i][f]=t.value;save();pubColors();render()}if(t.dataset.cu!==undefined){S.colorsCustom=t.checked;save();pubColors()}});
const P_MAT=m=>PRICING.MAT[m]?m:"PLA";
})();
