/* Online play: Supabase Realtime (broadcast + presence). No tables, no accounts. */
let online=false,my=0,isHost=false,net=null;
const cfg=window.HEXFALL_CONFIG||{},myId=window.crypto&&window.crypto.randomUUID?window.crypto.randomUUID():Math.random().toString(36).slice(2,10);
const ostat=t=>{document.getElementById("ostat").textContent=t};
function sendSnapshot(){
 if(!net||!net.started||!isHost)return;
 if(wilds.some(cards=>cards.length<MODES[mode].k))return;
 net.send({type:"snapshot",mode,board,turn,over,last,seq:net.seq,wilds});
}
function validSnapshot(p){
 if(!p||!MODES[p.mode]||!p.board||typeof p.board!=="object"||!Array.isArray(p.wilds)||p.wilds.length!==2)return false;
 const radius=MODES[p.mode].R,limit=1+3*radius*(radius+1),entries=Object.entries(p.board);
 if(entries.length>limit||entries.some(([k,v])=>{
  const parts=k.split(",").map(Number);
  return parts.length!==2||!parts.every(Number.isInteger)||Math.max(Math.abs(parts[0]),Math.abs(parts[1]),Math.abs(parts[0]+parts[1]))>radius||!v||!Object.prototype.hasOwnProperty.call(INFO,v.t)||![0,1].includes(v.c);
 }))return false;
 const cards=p.mode==="mythic"?WILD.concat(MYTH):WILD;
 return [0,1].includes(p.turn)&&typeof p.over==="boolean"&&Number.isInteger(p.seq)&&p.seq>=0&&(!p.last||(Array.isArray(p.last)&&p.last.length===4&&p.last.every(Number.isInteger)))&&p.wilds.every(a=>Array.isArray(a)&&a.length<=MODES[p.mode].k&&a.every(t=>cards.includes(t)));
}
function requestSnapshot(){if(net)net.send({type:"resync"})}
function roster(){
 const list=[];Object.values(net.ch.presenceState()).forEach(a=>a.forEach(p=>list.push(p)));
 list.sort((a,b)=>a.t-b.t||(a.id<b.id?-1:1));
 return {list,idx:list.findIndex(p=>p.id===myId)};
}
function applyRoster(r){my=r.idx;isHost=my===0;if(r.list.length>1){NAMES[0]=r.list[0].name;NAMES[1]=r.list[1].name}}
function newGame(){
 if(online){
  if(!net||!net.started)return;
  if(!isHost){ostat("Only the lobby host can start a new game.");return}
  net.seq=0;
  net.send({type:"start",mode});
 }
 setup();
}
function joinLobby(){
 if(!window.supabase||!cfg.SUPABASE_URL||!cfg.SUPABASE_ANON_KEY)return ostat("Online play needs your Supabase keys in js/config.js. See the README.");
 const name=uname.value.trim().slice(0,16),lob=lobid.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g,"").slice(0,24);
 if(!name||!lob)return ostat("Enter a username and a lobby ID.");
 leaveLobby(true);
 try{localStorage.setItem("hf_name",name)}catch(e){}
 const sb=supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
 const ch=sb.channel("hexfall:"+lob,{config:{presence:{key:myId},broadcast:{self:false,ack:true}}});
 net={sb,ch,started:false,seq:0,send:p=>ch.send({type:"broadcast",event:"hf",payload:p}).then(status=>{
  if(status!=="ok"){console.error("Hexfall lobby broadcast was not acknowledged.",status);ostat("The lobby could not send an update. Check your connection; reconnecting may be needed.")}
  return status==="ok";
 }).catch(error=>{
  console.error("Hexfall lobby broadcast failed.",error);
  ostat("The lobby could not send an update. Check your connection; reconnecting may be needed.");
  return false;
 })};
 ch.on("broadcast",{event:"hf"},({payload})=>onMsg(payload));
 ch.on("presence",{event:"sync"},onSync);
 ch.subscribe(async st=>{
  if(st==="SUBSCRIBED"){
   try{await ch.track({id:myId,name,t:Date.now()});ostat("Connected to \""+lob+"\". Waiting for an opponent...")}
   catch(error){console.error("Could not join the Hexfall lobby presence.",error);ostat("Connected to the lobby, but could not register your player. Please leave and try again.")}
  }
  else if(st==="CHANNEL_ERROR"||st==="TIMED_OUT")ostat("Connection lost. Check your network, then wait here while the lobby reconnects.");
  else if(st==="CLOSED")ostat("Disconnected from the lobby.");
 });
 online=true;vsAI=false;busy=true;over=false;modal.className="hide";
 m1.classList.remove("on");m2.classList.add("on");document.getElementById("ai-style").disabled=true;
 draw("Waiting for an opponent in lobby "+lob+"...");
}
function onSync(){
 if(!net)return;
 const r=roster();if(r.idx<0)return;
 if(r.idx>1){leaveLobby(true);ostat("This lobby already has 2 players. Try another ID.");return}
 applyRoster(r);
 if(r.list.length>=2){
  if(!net.started){net.started=true;ostat("Playing "+r.list[1-r.idx].name+". You are "+(my?"Tide (teal, top)":"Ember (amber, bottom)")+".");if(isHost)newGame()}
  else if(isHost){busy=false;sendSnapshot()}
  else requestSnapshot();
 }else if(net.started){busy=true;ostat("Opponent disconnected. Your game is saved here while you wait.");draw("Opponent disconnected. Waiting to reconnect...")}
}
function onMsg(p){
 if(!p||!net)return;
 if(p.type==="start"){
  const r=roster();if(r.idx<0||r.idx>1)return;
  if(!isHost&&MODES[p.mode]){applyRoster(r);mode=p.mode;syncMode();net.seq=0;net.started=true;setup()}
 }else if(p.type==="wilds"&&p.s===1-my&&Array.isArray(p.w)){
  if(p.w.length!==MODES[mode].k||!p.w.every(t=>pool().includes(t)))return;
  wilds[p.s]=p.w.slice();tryFinish();
 }else if(p.type==="move"&&!over&&turn!==my&&Array.isArray(p.m)&&p.m.length===4){
  if(p.seq!==net.seq+1){requestSnapshot();return}
  const[fq,fr,tq,tr]=p.m,pc=board[key(fq,fr)];
  if(p.m.every(Number.isInteger)&&pc&&pc.c===turn&&gen(board,fq,fr).some(([a,c])=>a===tq&&c===tr)){net.seq=p.seq;move(p.m,true)}
  else requestSnapshot();
 }else if(p.type==="resync"&&isHost){
  sendSnapshot();
 }else if(p.type==="snapshot"&&my===1&&validSnapshot(p)){
  mode=p.mode;R=MODES[mode].R;build();
  board=Object.fromEntries(Object.entries(p.board).map(([k,v])=>[k,{t:v.t,c:v.c,moved:v.moved===true,u:v.u===1?1:undefined}]));
  turn=p.turn;over=p.over;last=Array.isArray(p.last)&&p.last.length===4&&p.last.every(Number.isInteger)?p.last:null;wilds=p.wilds;net.seq=p.seq;net.started=true;sel=null;legal=[];busy=false;modal.className="hide";syncMode();draw();
 }
}
function tryFinish(){
 const k=MODES[mode].k;
 if(wilds[0].length>=k&&wilds[1].length>=k)finish();
 else if(wilds[my].length>=k)draw("Waiting for "+NAMES[1-my]+" to choose wild cards...");
}
function leaveLobby(silent){
 if(net){try{net.ch.unsubscribe();net.sb.removeAllChannels()}catch(e){}net=null}
 online=false;flip=false;my=0;isHost=false;NAMES[0]="Ember";NAMES[1]="Tide";
 busy=false;clearAITimer();
 m1.classList.remove("on");m2.classList.remove("on");
 if(!silent)ostat("Left the lobby.");
}
ob.onclick=()=>{
 olp.classList.toggle("hide");
 if(!cfg.SUPABASE_URL||!cfg.SUPABASE_ANON_KEY)ostat("Online play needs your Supabase project URL and anon key in js/config.js. See the README.");
};
function generateLobbyId(){return Math.random().toString(36).slice(2,8)}
oj.onclick=joinLobby;
orand.onclick=()=>{lobid.value=generateLobbyId()};
document.getElementById("copy-lobby").onclick=async()=>{
 if(!lobid.value.trim())return ostat("Enter or generate a lobby ID to share.");
 try{await navigator.clipboard.writeText(lobid.value.trim());ostat("Lobby ID copied. Send it to your friend.")}
 catch(e){ostat("Could not copy automatically. Select and copy the lobby ID instead.")}
};
olv.onclick=()=>{leaveLobby();setAI(true)};
[uname,lobid].forEach(i=>i.addEventListener("keydown",e=>{if(e.key==="Enter")joinLobby()}));
try{uname.value=localStorage.getItem("hf_name")||""}catch(e){}
