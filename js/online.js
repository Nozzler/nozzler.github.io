/* Online play: Supabase Realtime (broadcast + presence). No tables, no accounts. */
let online=false,my=0,isHost=false,net=null,drawOfferPending=false;
const cfg=window.HEXFALL_CONFIG||{},myId=window.crypto&&window.crypto.randomUUID?window.crypto.randomUUID():Math.random().toString(36).slice(2,10);
const ostat=t=>{document.getElementById("ostat").textContent=t};
let roomProbeTimer=null,roomProbeChannel=null,roomProbeVersion=0,roomDecision="empty",roomProbeClient=null;
function getOnlineClient(){
 if(!roomProbeClient)roomProbeClient=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
 return roomProbeClient;
}
function setRoomDecision(state,message){
 roomDecision=state;
 const button=document.getElementById("oj"),connection=document.getElementById("online-connection");
 const labels={empty:"Create lobby",join:"Join lobby",full:"Room full",checking:"Checking…",error:"Check connection",blank:"Enter room code"};
 button.textContent=labels[state]||labels.error;
 button.disabled=!online&&state!=="empty"&&state!=="join";
 button.disabled ||= online;
 connection.textContent=state==="empty"?"Room available":state==="join"?"Room found":state==="full"?"Room is full":state==="checking"?"Checking room…":state==="blank"?"Not connected":"Unavailable";
 connection.classList.toggle("connected",state==="join");
 if(message)ostat(message);
}
function stopRoomProbe(){
 roomProbeVersion++;
 if(roomProbeTimer!==null){clearTimeout(roomProbeTimer);roomProbeTimer=null}
 if(roomProbeChannel){const channel=roomProbeChannel;roomProbeChannel=null;roomProbeClient?.removeChannel(channel).catch(()=>{})}
}
function scheduleRoomCheck(){
 stopRoomProbe();
 if(online)return;
 const version=roomProbeVersion,code=lobid.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g,"").slice(0,24);
 if(!code){setRoomDecision("blank","Enter a room code to check it.");return}
 if(!window.supabase||!cfg.SUPABASE_URL||!cfg.SUPABASE_ANON_KEY){setRoomDecision("error","Online play is not configured for this copy.");return}
 setRoomDecision("checking","Checking whether this room is active…");
 roomProbeTimer=setTimeout(()=>probeRoom(code,version),350);
}
function probeRoom(code,version){
 if(version!==roomProbeVersion)return;
 let client,channel,settled=false,probeSent=false;
 const finish=(state,message)=>{
  if(settled)return;settled=true;
  if(roomProbeTimer!==null){clearTimeout(roomProbeTimer);roomProbeTimer=null}
  if(roomProbeChannel===channel)roomProbeChannel=null;
  client?.removeChannel(channel).catch(()=>{});
  if(version===roomProbeVersion)setRoomDecision(state,message);
 };
 try{
  client=getOnlineClient();
  const probeId=myId+"-"+version+"-"+Math.random().toString(36).slice(2,7);
  channel=client.channel("hexfall:"+code,{config:{broadcast:{self:false,ack:true}}});
  roomProbeChannel=channel;
  channel.on("broadcast",{event:"hf"},({payload})=>{
   if(payload?.type!=="roomProbeResponse"||payload.probeId!==probeId)return;
   const players=Number(payload.players)||1;
   finish(players>=2?"full":"join",players>=2?"That room already has two players.":"Room found. Join your friend.");
  });
  channel.subscribe(status=>{
   if(status==="SUBSCRIBED"){
    channel.send({type:"broadcast",event:"hf",payload:{type:"roomProbe",probeId}}).then(result=>{
     if(result==="ok")probeSent=true;
     else finish("error","Could not check the room. Check your connection and try again.");
    }).catch(()=>finish("error","Could not check the room. Check your connection and try again."));
   }
   if(status==="CHANNEL_ERROR"||status==="TIMED_OUT"||status==="CLOSED")finish("error","Could not check the room. Check your connection and try again.");
  });
  roomProbeTimer=setTimeout(()=>finish(probeSent?"empty":"error",probeSent?"No active room found. You can create it.":"Room check timed out. Check your connection and try again."),2200);
 }catch(error){finish("error","Could not check the room. Check your connection and try again.")}
}
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
 const list=[];Object.values(net.ch.presenceState()).forEach(a=>a.forEach(p=>{if(p&&!p.probe)list.push(p)}));
 list.sort((a,b)=>a.t-b.t||(a.id<b.id?-1:1));
 return {list,idx:list.findIndex(p=>p.id===myId)};
}
function renderLobbyRoster(list=[]){
 for(let seat=0;seat<2;seat++){
  const player=list[seat],card=document.getElementById("lobby-seat-"+seat);
  document.getElementById("lobby-player-"+seat).textContent=player?player.name:(seat?"Waiting for a friend":"Waiting for host");
  card.classList.toggle("connected",!!player);
 }
 const connection=document.getElementById("online-connection");
 connection.textContent=!online?"Not connected":list.length===2?"Both players connected":"Waiting for a friend";
 connection.classList.toggle("connected",online&&list.length===2);
 document.getElementById("oj").disabled=online;
 document.getElementById("uname").disabled=online;
 document.getElementById("lobid").disabled=online;
 document.getElementById("orand").disabled=online;
 document.getElementById("olv").disabled=!online;
}
function setOnlineMatchControls(active){
 document.getElementById("online-actions").classList.toggle("hide",!active);
 document.getElementById("online-chat").classList.toggle("hide",!active);
 document.getElementById("ob").textContent=active?"Lobby":"Online";
 document.getElementById("olv").disabled=!online;
 document.getElementById("offer-draw").disabled=!active||drawOfferPending;
}
function appendChatLine(name,message,own=false){
 const line=document.createElement("div"),author=document.createElement("b"),body=document.createElement("span");
 const log=document.getElementById("chat-log");
 line.className="chat-line"+(own?" own":"");author.textContent=name;body.textContent=message;
 line.append(author,body);log.append(line);
 while(log.children.length>60)log.firstElementChild.remove();
 log.scrollTop=log.scrollHeight;
}
function applyRoster(r){my=r.idx;isHost=my===0;if(r.list.length>1){NAMES[0]=r.list[0].name;NAMES[1]=r.list[1].name}renderLobbyRoster(r.list)}
function closeDrawOffer(){
 document.getElementById("draw-offer").classList.add("hide");
 document.getElementById("accept-draw").hidden=true;
 document.getElementById("decline-draw").hidden=true;
}
function finishOnlineMatch(message){
 over=true;busy=false;drawOfferPending=false;closeDrawOffer();
 document.getElementById("online-actions").classList.add("hide");
 draw(message);
}
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
 if(roomDecision!=="empty"&&roomDecision!=="join")return ostat("Wait for the room check to finish before continuing.");
 const action=roomDecision;stopRoomProbe();
 const name=uname.value.trim().slice(0,16),lob=lobid.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g,"").slice(0,24);
 if(!name||!lob)return ostat("Enter a username and a lobby ID.");
 leaveLobby(true);
 try{localStorage.setItem("hf_name",name)}catch(e){}
 const sb=getOnlineClient();
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
     try{await ch.track({id:myId,name,t:Date.now()});ostat("Connected to room "+lob+". Waiting for the other seat...")}
   catch(error){console.error("Could not join the Hexfall lobby presence.",error);ostat("Connected to the lobby, but could not register your player. Please leave and try again.")}
  }
  else if(st==="CHANNEL_ERROR"||st==="TIMED_OUT")ostat("Connection lost. Check your network, then wait here while the lobby reconnects.");
  else if(st==="CLOSED")ostat("Disconnected from the lobby.");
 });
 online=true;vsAI=false;busy=true;over=false;modal.className="hide";
 m1.classList.remove("on");m2.classList.add("on");document.getElementById("ai-style").disabled=true;
 document.getElementById("lobby-board-label").textContent=MODES[mode].n;
 renderLobbyRoster([]);setOnlineMatchControls(false);
 document.getElementById("olv").disabled=false;
 closeDrawOffer();drawOfferPending=false;document.getElementById("chat-log").replaceChildren();
 document.getElementById("online-connection").textContent="Connecting";
 ostat((action==="empty"?"Creating":"Joining")+" room "+lob+"…");
}
function onSync(){
 if(!net)return;
 const r=roster();if(r.idx<0)return;
 if(r.idx>1){leaveLobby(true);renderLobbyRoster([]);ostat("This room already has 2 players. Try another code.");return}
 applyRoster(r);
 if(r.list.length>=2){
  if(!net.started){net.started=true;ostat("Both players joined. Starting the match…");if(isHost){window.showGame();setOnlineMatchControls(true);newGame()}}
  else if(isHost){window.showGame();setOnlineMatchControls(true);busy=false;sendSnapshot()}
  else requestSnapshot();
 }else if(net.started){busy=true;ostat("Opponent disconnected. Your game is saved here while you wait.")}
 else ostat("You are in the room. Waiting for the other seat…");
}
function onMsg(p){
 if(!p||!net)return;
 if(p.type==="start"){
  const r=roster();if(r.idx<0||r.idx>1)return;
    if(!isHost&&MODES[p.mode]){applyRoster(r);mode=p.mode;syncMode();net.seq=0;net.started=true;window.showGame();setOnlineMatchControls(true);setup()}
 }else if(p.type==="wilds"&&p.s===1-my&&Array.isArray(p.w)){
  if(p.w.length!==MODES[mode].k||!p.w.every(t=>pool().includes(t)))return;
  wilds[p.s]=p.w.slice();tryFinish();
 }else if(p.type==="move"&&!over&&turn!==my&&Array.isArray(p.m)&&p.m.length===4){
  if(p.seq!==net.seq+1){requestSnapshot();return}
  const[fq,fr,tq,tr]=p.m,pc=board[key(fq,fr)];
  if(p.m.every(Number.isInteger)&&pc&&pc.c===turn&&gen(board,fq,fr).some(([a,c])=>a===tq&&c===tr)){net.seq=p.seq;move(p.m,true)}
  else requestSnapshot();
 }else if(p.type==="roomProbe"&&online&&net&&typeof p.probeId==="string"){
  const current=roster();net.send({type:"roomProbeResponse",probeId:p.probeId,players:current.list.length});
 }else if(p.type==="chat"&&typeof p.message==="string"&&p.message.length<=200){
  appendChatLine(NAMES[1-my],p.message);
 }else if(p.type==="drawOffer"&&!over){
  drawOfferPending=true;
  document.getElementById("draw-offer-text").textContent=NAMES[1-my]+" offers a draw.";
  document.getElementById("accept-draw").hidden=false;document.getElementById("decline-draw").hidden=false;
  document.getElementById("draw-offer").classList.remove("hide");document.getElementById("offer-draw").disabled=true;
 }else if(p.type==="drawResponse"){
  drawOfferPending=false;closeDrawOffer();document.getElementById("offer-draw").disabled=false;
  if(p.accepted)finishOnlineMatch("Draw by agreement.");
  else draw("Your opponent declined the draw.");
 }else if(p.type==="resign"&&!over){
  finishOnlineMatch(NAMES[my]+" wins by resignation.");
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
 stopRoomProbe();
 if(net){try{net.ch.unsubscribe();net.sb.removeAllChannels()}catch(e){}net=null}
 online=false;flip=false;my=0;isHost=false;NAMES[0]="Ember";NAMES[1]="Tide";
 busy=false;drawOfferPending=false;clearAITimer();setOnlineMatchControls(false);closeDrawOffer();document.getElementById("chat-log").replaceChildren();renderLobbyRoster([]);
 m1.classList.remove("on");m2.classList.remove("on");
 if(!silent)ostat("Left the lobby.");
}
ob.onclick=()=>window.showOnlinePage();
function generateLobbyId(){return Math.random().toString(36).slice(2,8)}
oj.onclick=joinLobby;
orand.onclick=()=>{lobid.value=generateLobbyId();scheduleRoomCheck()};
document.getElementById("copy-lobby").onclick=async()=>{
 if(!lobid.value.trim())return ostat("Enter or generate a lobby ID to share.");
 try{await navigator.clipboard.writeText(lobid.value.trim());ostat("Lobby ID copied. Send it to your friend.")}
 catch(e){ostat("Could not copy automatically. Select and copy the lobby ID instead.")}
};
olv.onclick=()=>{leaveLobby();ostat("You left the room. Choose a room code to join again.");scheduleRoomCheck()};
lobid.addEventListener("input",scheduleRoomCheck);
[uname,lobid].forEach(i=>i.addEventListener("keydown",e=>{if(e.key==="Enter")joinLobby()}));
try{uname.value=localStorage.getItem("hf_name")||""}catch(e){}

document.getElementById("chat-form").addEventListener("submit",event=>{
 event.preventDefault();
 const input=document.getElementById("chat-input"),message=input.value.trim();
 if(!message||!online||!net||!net.started||over)return;
 appendChatLine(NAMES[my],message,true);input.value="";
 net.send({type:"chat",message:message.slice(0,200)});
});
document.getElementById("offer-draw").onclick=()=>{
 if(!online||!net||!net.started||over||drawOfferPending)return;
 drawOfferPending=true;document.getElementById("offer-draw").disabled=true;
 document.getElementById("draw-offer-text").textContent="Draw offer sent. Waiting for your opponent.";
 document.getElementById("accept-draw").hidden=true;document.getElementById("decline-draw").hidden=true;
 document.getElementById("draw-offer").classList.remove("hide");
 net.send({type:"drawOffer"});
};
document.getElementById("accept-draw").onclick=()=>{
 if(!online||!net||!drawOfferPending)return;
 net.send({type:"drawResponse",accepted:true});finishOnlineMatch("Draw by agreement.");
};
document.getElementById("decline-draw").onclick=()=>{
 if(!online||!net||!drawOfferPending)return;
 net.send({type:"drawResponse",accepted:false});drawOfferPending=false;closeDrawOffer();document.getElementById("offer-draw").disabled=false;draw("Draw offer declined.");
};
document.getElementById("resign").onclick=()=>{
 if(!online||!net||over||!window.confirm("Resign this match?"))return;
 net.send({type:"resign"});finishOnlineMatch(NAMES[1-my]+" wins by resignation.");
};
