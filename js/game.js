let R=4;const S=29,SQ=Math.sqrt(3),NAMES=["Ember","Tide"],COL=["#f2a23c","#3cc4b8"];
const D=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]],SD=[[1,1],[2,-1],[1,-2],[-1,-1],[-2,1],[-1,2]];
const VAL={C:1000,S:5,H:4,R:3,P:1,L:5,G:4,B:4,W:3,U:4,F:5,X:6,T:6,V:5,A:5,M:5,D:6,J:4,N:3},WILD=["L","G","B","W","U","F"],MYTH=["X","T","V","A","M","D","J","N"];
const pool=()=>mode==="mythic"?WILD.concat(MYTH):WILD;
const INFO={
 C:["Core","Steps 1 hex any way. A Seer cannot capture your Core until it has moved."],
 S:["Seer","Slides any distance along the six long diagonals. It cannot capture an unmoved Core or Seer."],
 R:["Runner","Leaps exactly 2 hexes in a straight line, ignoring what is between."],
 H:["Hopper","Vaults over an adjacent piece to land right behind it, capturing if an enemy is there. Also steps 1 into empty hexes."],
 P:["Pike","Steps to either forward hex. Captures the hex to its left or right."],
 L:["Lancer","Slides up to 3 hexes in any straight line."],
 G:["Phantom","Glides 1 to 3 hexes in a straight line, passing through any pieces in the way."],
 B:["Bomber","Steps 1 hex. When it captures it explodes: it and every enemy touching the target are removed, except Cores."],
 W:["Swapper","Steps 1 hex, or swaps places with any friendly piece up to 3 hexes away in a straight line."],
 U:["Bulwark","Slides up to 2 hexes. Shield: friendly pieces touching it cannot be captured."],
 F:["Frostbinder","Steps 1 hex. Freeze: enemy pieces touching it cannot move, except Cores."],
 X:["Phoenix","Slides up to 2 hexes. The first time it is captured, it is reborn on an empty hex of your back row."],
 T:["Titan","Steps 1 hex. Moving into an enemy shoves it one hex further. Off the board means destroyed, even a Core. A shove into another piece is not allowed."],
 V:["Witch","Steps 1 hex. After it moves, every enemy Pike touching it switches to your side."],
 A:["Archer","Steps 1 hex into empty hexes. Shoots any enemy 2 to 3 hexes away in a clear straight line, without leaving its hex."],
 M:["Magnet","Steps 1 hex. After it moves, enemy pieces (not Cores) in clear straight lines within 3 hexes are pulled 1 hex closer."],
 D:["Dragon","Slides up to 3 hexes straight. When it captures, it also burns the enemy (not a Core) standing directly behind the target."],
 J:["Trickster","Steps 1 hex into empty hexes, or swaps places with any enemy (not a Core) up to 3 hexes away in a straight line."],
 N:["Revenant","Steps 1 hex. If an enemy captures it, the capturer is destroyed too (Cores excepted)."]};
const key=(q,r)=>q+","+r,inb=(q,r)=>Math.max(Math.abs(q),Math.abs(r),Math.abs(q+r))<=R;
let cells=[];
function build(){cells=[];for(let r=-R;r<=R;r++)for(let q=-R;q<=R;q++)if(inb(q,r))cells.push([q,r]);
 const hw=S*SQ*(R+.5)+4,hh=S*1.5*R+S+4;svg.setAttribute("viewBox",`${-hw} ${-hh} ${2*hw} ${2*hh}`);}
let flip=false;const pxn=(q,r)=>[S*SQ*(q+r/2),S*1.5*r],px=(q,r)=>{const[x,y]=pxn(q,r);return flip?[-x,-y]:[x,y]};
const hexPts=(s)=>[0,1,2,3,4,5].map(i=>{const a=(60*i-30)*Math.PI/180;return (s*Math.cos(a)).toFixed(1)+","+(s*Math.sin(a)).toFixed(1)}).join(" ");

function icon(t,col){
 const a=`stroke="${col}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`;
 return {
 C:`<polygon points="0,-11 10,0 0,11 -10,0" fill="none" ${a}/><circle r="3.5" fill="${col}"/>`,
 S:`<path d="M-12 0Q0 -11 12 0Q0 11 -12 0Z" fill="none" ${a}/><circle r="3.6" fill="${col}"/>`,
 R:`<path d="M-8 -3L0 -11L8 -3M-8 8L0 0L8 8" fill="none" ${a}/>`,
 H:`<path d="M-11 8Q0 -16 11 8" fill="none" ${a}/><circle cx="0" cy="8" r="3" fill="${col}"/>`,
 P:`<polygon points="0,-11 8,9 -8,9" fill="${col}" ${a}/>`,
 L:`<path d="M0 11V-9M-6 -3L0 -10L6 -3M-6 6H6" fill="none" ${a}/>`,
 G:`<circle r="9" fill="none" stroke-dasharray="3 3.5" ${a}/><circle r="2.6" fill="${col}"/>`,
 B:`<circle cy="3" r="8" fill="${col}"/><path d="M4 -4L8 -9" fill="none" ${a}/>`,
 W:`<path d="M-10 -4H8M4 -8L8 -4L4 0M10 5H-8M-4 1L-8 5L-4 9" fill="none" ${a}/>`,
 U:`<path d="M0 -11L10 -6V2Q10 9 0 12Q-10 9 -10 2V-6Z" fill="none" ${a}/>`,
 F:`<path d="M0 -11V11M-11 0H11M-7 -7L7 7M-7 7L7 -7" fill="none" ${a}/>`,
 X:`<path d="M0 11C-9 5-8 -3-2 -11C-1 -4 3 -3 3 -8C9 -2 9 6 0 11Z" fill="none" ${a}/>`,
 T:`<rect x="-8" y="-8" width="16" height="16" fill="none" ${a}/><rect x="-3.5" y="-3.5" width="7" height="7" fill="${col}"/>`,
 V:`<path d="M-9 8L0 -11L9 8L-11 -3H11Z" fill="none" ${a}/>`,
 A:`<path d="M-6 -10Q10 0 -6 10M-6 -10V10M-12 0H8M4 -4L8 0L4 4" fill="none" ${a}/>`,
 M:`<path d="M-8 -10V3Q-8 10 0 10Q8 10 8 3V-10M-8 -4H-3M3 -4H8" fill="none" ${a}/>`,
 D:`<path d="M-11 6L-6 -10L0 -2L6 -10L11 6L0 11Z" fill="none" ${a}/>`,
 J:`<path d="M-10 0L-5 -8L0 0L5 -8L10 0L0 10Z" fill="none" ${a}/>`,
 N:`<circle cy="-2" r="8" fill="none" ${a}/><path d="M-4 9V5M4 9V5" fill="none" ${a}/><circle cx="-3" cy="-3" r="1.6" fill="${col}"/><circle cx="3" cy="-3" r="1.6" fill="${col}"/>`}[t];
}
const guide=document.getElementById("guide");
const row=t=>`<div class="row"><svg width="40" height="40" viewBox="-20 -20 40 40"><circle r="18" fill="${COL[0]}" stroke="#14111c" stroke-width="2"/>${icon(t,"#1a1420")}</svg><div><b>${INFO[t][0]}</b><br>${INFO[t][1]}</div></div>`;
guide.innerHTML=Object.keys(INFO).filter(t=>!WILD.includes(t)&&!MYTH.includes(t)).map(row).join("")+`<div class="tag">Wild cards: each player brings one</div>`+WILD.map(row).join("")+`<div class="tag">Mythic cards (Mythic mode only)</div>`+MYTH.map(row).join("");

let board,turn,sel,legal,over,vsAI=true,busy=false,last=null,coachEnabled=false,aiTimer=null;
const MODES={
 skirmish:{n:"Skirmish",R:3,rows:[["H","C","S","H"],["R","P","P","P","R"]],k:1,wr:2,ws:[-1],d:"Small 37-hex board, 9 pieces each plus a wild card. Fast and tactical."},
 classic:{n:"Classic",R:4,rows:[["S","H","C","H","S"],["R","P","P","P","P","R"]],k:1,wr:2,ws:[-1],d:"The standard 61-hex board: 11 pieces each plus one wild card."},
 wild:{n:"Wild rush",R:4,rows:[["S","H","C","H","S"],["R","P","P","P","P","R"]],k:3,wr:2,ws:[-2,-1,0],d:"Classic board, but each player brings three wild cards."},
 grand:{n:"Grand",R:6,rows:[["S","H","L","C","G","H","S"],["R","P","P","P","P","P","P","R"],[null,"P","P","P","P","P","P","P",null]],k:2,wr:3,ws:[-2,-1],d:"Huge 127-hex field: 22 pieces each, including Lancer and Phantom, plus two wild cards."},
 mythic:{n:"Mythic",R:5,rows:[["S","H","L","C","H","S"],["R","P","P","P","P","P","R"]],k:3,wr:3,ws:[-2,-1,0],d:"91-hex board. Each player picks three wild cards from 14, including eight Mythic pieces with game-bending abilities."}};
let mode="classic",wilds=[[],[]];
function setup(){
 clearAITimer();
 const M=MODES[mode];R=M.R;build();board={};
 M.rows.forEach((row,i)=>row.forEach((t,j)=>t&&place(-R+j,R-i,t)));
 turn=0;sel=null;legal=[];over=false;busy=true;last=null;wilds=[[],[]];wc.textContent="";flip=online&&my===1;draw("Choose your wild cards");pick(online?my:0);
}
function place(q,r,t){board[key(q,r)]={t,c:0};board[key(-q,-r)]={t,c:1};}
function pick(s){
 const k=MODES[mode].k;
 if(s===1&&vsAI){wilds[1]=Array.from({length:k},()=>pool()[Math.random()*pool().length|0]);return finish()}
 mt.textContent=(vsAI?"Choose":NAMES[s]+": choose")+" wild card"+(k>1?" "+(wilds[s].length+1)+" of "+k:"");
 cards.innerHTML=pool().map((t,i)=>`<button class="card" style="--i:${i}" data-t="${t}"><svg width="44" height="44" viewBox="-20 -20 40 40"><circle r="18" fill="${COL[s]}" stroke="#14111c" stroke-width="2"/>${icon(t,"#1a1420")}</svg><b>${INFO[t][0]}</b><span>${INFO[t][1]}</span></button>`).join("");
 cards.dataset.s=s;modal.className="";
}
function choose(s,t){
 wilds[s].push(t);modal.className="hide";
 if(wilds[s].length<MODES[mode].k)return pick(s);
 if(online){net.send({type:"wilds",s,w:wilds[s]});return tryFinish()}
 if(s===0)return pick(1);
 finish();
}
function finish(){
 const M=MODES[mode];
 wilds.forEach((a,s)=>a.forEach((t,i)=>{const q=M.ws[i],r=R-M.wr;board[key(s?-q:q,s?-r:r)]={t,c:s}}));
 fx={intro:true};busy=false;wc.textContent="Wild cards: "+NAMES[0]+" "+wilds[0].map(t=>INFO[t][0]).join(", ")+"; "+NAMES[1]+" "+wilds[1].map(t=>INFO[t][0]).join(", ");draw();
 if(online&&isHost)sendSnapshot();
}
document.getElementById("cards").addEventListener("click",e=>{const b=e.target.closest(".card");if(b)choose(+cards.dataset.s,b.dataset.t)});
function place(q,r,t){board[key(q,r)]={t,c:0};board[key(-q,-r)]={t,c:1};}
const shielded=(b,x,y,o)=>o.t!=="U"&&o.t!=="C"&&D.some(([a,c])=>{const n=b[key(x+a,y+c)];return n&&n.t==="U"&&n.c===o.c});
const can=(b,x,y,c)=>{if(!inb(x,y))return false;const o=b[key(x,y)];return !o||(o.c!==c&&!shielded(b,x,y,o))};
function gen(b,q,r){
 const p=b[key(q,r)],out=[];
 if(p.t!=="C"&&D.some(([a,c])=>{const n=b[key(q+a,r+c)];return n&&n.t==="F"&&n.c!==p.c}))return out;
 const free=(x,y)=>inb(x,y)&&!b[key(x,y)];
 const ok=(x,y)=>can(b,x,y,p.c);
 if(p.t==="C")D.forEach(([a,c])=>ok(q+a,r+c)&&out.push([q+a,r+c]));
 else if(p.t==="S")SD.forEach(([a,c])=>{let x=q+a,y=r+c;
   while(inb(x,y)){const o=b[key(x,y)];if(o){if(o.c!==p.c&&!(o.t==="S"&&!o.moved)&&!(o.t==="C"&&!o.moved))out.push([x,y]);break}out.push([x,y]);x+=a;y+=c}});
 else if(p.t==="R")D.forEach(([a,c])=>ok(q+2*a,r+2*c)&&out.push([q+2*a,r+2*c]));
 else if(p.t==="H")D.forEach(([a,c])=>{
   if(free(q+a,r+c))out.push([q+a,r+c]);
   else if(inb(q+a,r+c)&&ok(q+2*a,r+2*c))out.push([q+2*a,r+2*c]);});
 else if("LUXD".includes(p.t)){const n="LD".includes(p.t)?3:2;D.forEach(([a,c])=>{for(let k=1;k<=n;k++){const x=q+a*k,y=r+c*k;if(!inb(x,y))break;if(b[key(x,y)]){if(can(b,x,y,p.c))out.push([x,y]);break}out.push([x,y])}})}
 else if(p.t==="T")D.forEach(([a,c])=>{const x=q+a,y=r+c;if(!inb(x,y))return;const o=b[key(x,y)];
   if(!o||(o.c!==p.c&&(!inb(x+a,y+c)||!b[key(x+a,y+c)])))out.push([x,y])});
 else if(p.t==="A")D.forEach(([a,c])=>{if(free(q+a,r+c))out.push([q+a,r+c]);
   for(let k=1;k<=3;k++){const x=q+a*k,y=r+c*k;if(!inb(x,y))break;const o=b[key(x,y)];if(o){if(k>=2&&can(b,x,y,p.c)&&o.c!==p.c)out.push([x,y]);break}}});
 else if(p.t==="J"){D.forEach(([a,c])=>free(q+a,r+c)&&out.push([q+a,r+c]));
   D.forEach(([a,c])=>[1,2,3].forEach(k=>{const x=q+a*k,y=r+c*k,o=inb(x,y)&&b[key(x,y)];if(o&&o.c!==p.c&&o.t!=="C")out.push([x,y])}))}
 else if(p.t==="G")D.forEach(([a,c])=>[1,2,3].forEach(k=>ok(q+a*k,r+c*k)&&out.push([q+a*k,r+c*k])));
 else if("BFVMN".includes(p.t))D.forEach(([a,c])=>ok(q+a,r+c)&&out.push([q+a,r+c]));
 else if(p.t==="W"){D.forEach(([a,c])=>ok(q+a,r+c)&&out.push([q+a,r+c]));
   D.forEach(([a,c])=>[1,2,3].forEach(k=>{const o=inb(q+a*k,r+c*k)&&b[key(q+a*k,r+c*k)];if(o&&o.c===p.c)out.push([q+a*k,r+c*k])}))}
 else{const f=p.c?[[0,1],[-1,1]]:[[0,-1],[1,-1]];
   f.forEach(([a,c])=>free(q+a,r+c)&&out.push([q+a,r+c]));
   [[1,0],[-1,0]].forEach(([a,c])=>{const o=inb(q+a,r+c)&&b[key(q+a,r+c)];if(o&&can(b,q+a,r+c,p.c))out.push([q+a,r+c])});}
 return out;
}
function apply(b,[fq,fr,tq,tr]){
 const nb={...b},dq=Math.sign(tq-fq),dr=Math.sign(tr-fr),dist=Math.max(Math.abs(tq-fq),Math.abs(tr-fr),Math.abs(tq-fq+tr-fr));
 let p=nb[key(fq,fr)];const tg=nb[key(tq,tr)];
 if(p.t==="A"&&dist>1&&tg){delete nb[key(tq,tr)];return nb}
 delete nb[key(fq,fr)];
 p={...p,moved:true};
 if(p.t==="P"&&tr===(p.c?R:-R))p={t:"S",c:p.c,moved:true};
 if(tg&&(tg.c===p.c||p.t==="J")){nb[key(fq,fr)]={...tg,moved:true};nb[key(tq,tr)]=p;return nb}
 if(p.t==="T"&&tg){nb[key(tq,tr)]=p;if(inb(tq+dq,tr+dr))nb[key(tq+dq,tr+dr)]={...tg,moved:true};return nb}
 if(p.t==="B"&&tg){D.forEach(([a,c])=>{const k=key(tq+a,tr+c),o=nb[k];if(o&&o.t!=="C"&&o.c!==p.c)delete nb[k]});delete nb[key(tq,tr)];return nb}
 if(tg&&tg.t==="X"&&!tg.u){const hr=tg.c?-R:R;for(let q=-R;q<=R;q++)if(inb(q,hr)&&!nb[key(q,hr)]){nb[key(q,hr)]={t:"X",c:tg.c,u:1};break}}
 if(tg&&tg.t==="N"&&p.t!=="C"){delete nb[key(tq,tr)];return nb}
 nb[key(tq,tr)]=p;
 if(p.t==="D"&&tg){const k=key(tq+dq,tr+dr),o=nb[k];if(o&&o.c!==p.c&&o.t!=="C")delete nb[k]}
 if(p.t==="V")D.forEach(([a,c])=>{const k=key(tq+a,tr+c),o=nb[k];if(o&&o.t==="P"&&o.c!==p.c)nb[k]={t:"P",c:p.c}});
 if(p.t==="M")D.forEach(([a,c])=>{for(let k=1;k<=3;k++){const x=tq+a*k,y=tr+c*k;if(!inb(x,y))break;const o=nb[key(x,y)];
   if(o){if(o.c!==p.c&&o.t!=="C"&&k>1&&!nb[key(x-a,y-c)]){delete nb[key(x,y)];nb[key(x-a,y-c)]=o.t==="S"?{...o,moved:true}:o}break}}});
 return nb;
}
function allMoves(b,c){const m=[];
 for(const k in b)if(b[k].c===c){const[q,r]=k.split(",").map(Number);
  gen(b,q,r).forEach(([x,y])=>m.push([q,r,x,y]));}
 return m;}
const hasCore=(b,c)=>Object.values(b).some(p=>p.t==="C"&&p.c===c);
const AI_STYLES={
 balanced:{depth:2,material:1,center:.2,safety:1,advance:.2,noise:.18},
 raider:{depth:2,material:.78,center:.42,safety:.5,advance:.48,noise:.3},
 guardian:{depth:2,material:1.18,center:.08,safety:3.2,advance:.12,noise:.08}
};
let aiStyle="balanced";
function aiEval(b,side){
 const style=AI_STYLES[aiStyle],moves=[allMoves(b,0),allMoves(b,1)];
 if(!moves[side].length)return side===1?-90000:90000;
 let score=0;
 for(const k in b){
  const p=b[k], [q,r]=k.split(",").map(Number);
  const sign=p.c?1:-1,distance=(Math.abs(q)+Math.abs(r)+Math.abs(q+r))/2;
  let value=VAL[p.t]*style.material;
  if(p.t==="P")value+=Math.max(0,p.c?r+R:R-r)*style.advance;
  if(p.t!=="C")value+=Math.max(0,R-distance)*style.center*.3;
  score+=sign*value;
 }
 for(const side of [0,1]){
  for(const m of moves[1-side]){
   const target=b[key(m[2],m[3])];
   if(target){
    if(target.t==="C")score+=(side?1:-1)*1500*style.safety;
    else score+=(side?1:-1)*Math.min(VAL[target.t],6)*.24*style.safety;
   }
  }
 }
 return score;
}
function orderedMoves(b,side){
 return allMoves(b,side).map((m,i)=>{
  const [fq,fr,tq,tr]=m,p=b[key(fq,fr)],target=b[key(tq,tr)];
  let priority=target?100+VAL[target.t]*8-VAL[p.t]:0;
  const next=apply(b,m);
  if(!hasCore(next,1-side))priority+=10000;
  if(p.t==="P"&&tr===(p.c?R:-R))priority+=45;
  if(p.t==="T"&&target&&(!inb(tq+Math.sign(tq-fq),tr+Math.sign(tr-fr))))priority+=90;
  return {m,priority,i};
 }).sort((a,b)=>b.priority-a.priority||a.i-b.i).map(x=>x.m);
}
function search(b,depth,side,alpha,beta){
 if(!hasCore(b,0))return 100000+depth;
 if(!hasCore(b,1))return -100000-depth;
 if(depth===0)return aiEval(b,side);
 const moves=orderedMoves(b,side);
 if(!moves.length)return side===1?-90000-depth:90000+depth;
 if(side===1){
  let best=-Infinity;
  for(const m of moves){best=Math.max(best,search(apply(b,m),depth-1,0,alpha,beta));alpha=Math.max(alpha,best);if(beta<=alpha)break}
  return best;
 }
 let best=Infinity;
 for(const m of moves){best=Math.min(best,search(apply(b,m),depth-1,1,alpha,beta));beta=Math.min(beta,best);if(beta<=alpha)break}
 return best;
}
const hexDistance=(a,b)=>Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1]),Math.abs(a[0]+a[1]-b[0]-b[1]));
function aiMoveBias(b,m,next,threatened){
 const p=b[key(m[0],m[1])],target=b[key(m[2],m[3])];
 let bonus=0;
 if(aiStyle==="raider"||aiStyle==="guardian"){
  const focusSide=aiStyle==="raider"?0:1, focusCore=Object.entries(b).find(([,piece])=>piece.t==="C"&&piece.c===focusSide);
  if(aiStyle==="raider"&&target&&target.c===0)bonus+=VAL[target.t]*.95;
  if(focusCore){
   const core=focusCore[0].split(",").map(Number),from=m.slice(0,2),to=m.slice(2);
   const progress=hexDistance(from,core)-hexDistance(to,core);
   bonus+=progress*(aiStyle==="raider"?1.8:1.6);
   if(aiStyle==="raider"&&allMoves(next,1).some(reply=>{const piece=next[key(reply[2],reply[3])];return piece&&piece.t==="C"&&piece.c===0}))bonus+=14;
  }
  if(aiStyle==="guardian"&&threatened.has(key(m[0],m[1]))){
   const remainsThreatened=allMoves(next,0).some(reply=>key(reply[2],reply[3])===key(m[2],m[3]));
   if(!remainsThreatened)bonus+=VAL[p.t]*.7;
  }
 }
 return bonus;
}
function aiMove(){
 const moves=orderedMoves(board,1),profile=AI_STYLES[aiStyle],threatened=new Set(allMoves(board,0).map(m=>key(m[2],m[3])));
 let best=null,bestScore=-Infinity;
 for(const m of moves){
  const next=apply(board,m),score=search(next,profile.depth-1,0,-Infinity,Infinity)+aiMoveBias(board,m,next,threatened)+(Math.random()-.5)*profile.noise;
  if(score>bestScore){bestScore=score;best=m}
 }
 return best;
}
let fx=null;
function pieceSVG(p,cls,st){return `<g class="pc ${cls||""}" style="${st||""}"><circle r="${S*.68}" fill="${COL[p.c]}" stroke="#14111c" stroke-width="2.5"/><circle r="${S*.56}" fill="none" stroke="#14111c" stroke-opacity=".25"/>${icon(p.t,"#1a1420")}</g>`}
function mkfx(o,n,m){
 const fk=key(m[0],m[1]),tk=key(m[2],m[3]),mv=o[fk],nm=new Map(),os=new Set(Object.values(o)),f={slides:[],ghosts:[],born:new Set(),boom:null,shot:null};
 const target=o[tk],archerShot=mv.t==="A"&&target&&Math.max(Math.abs(m[2]-m[0]),Math.abs(m[3]-m[1]),Math.abs(m[2]-m[0]+m[3]-m[1]))>1;
 const moverArrived=!!n[tk]&&!archerShot&&n[tk].c===mv.c;
 if(moverArrived)f.slides.push({a:fk,b:tk,p:n[tk],promo:mv.t==="P"&&n[tk].t==="S"});
 for(const k in n)nm.set(n[k],k);
 for(const k in o){const p=o[k],nk=nm.get(p);
  if(k===fk&&moverArrived)continue;
  if(nk&&nk!==k)f.slides.push({a:k,b:nk,p});
  else if(!nk){
   f.ghosts.push({k:k===fk?tk:k,p});}}
 for(const k in n)if(!os.has(n[k])&&!f.slides.some(s=>s.b===k))f.born.add(k);
 if(mv.t==="B"&&o[tk])f.boom=tk;
 if(mv.t==="A"&&n[fk]===mv&&o[tk])f.shot=[fk,tk];
 return f;
}
function fxLayer(){
 if(!fx||!fx.slides)return"";let h="";
 const P=k=>{const[q,r]=k.split(",").map(Number);return px(q,r)};
 fx.ghosts.forEach(g=>{const[x,y]=P(g.k);h+=`<g transform="translate(${x.toFixed(1)},${y.toFixed(1)})">${pieceSVG(g.p,"ghost")}</g>`});
 fx.slides.forEach(s=>{const[x,y]=P(s.b),[x0,y0]=P(s.a);h+=`<g transform="translate(${x.toFixed(1)},${y.toFixed(1)})">${pieceSVG(s.p,"slide"+(s.promo?" promo":""),`--dx:${(x0-x).toFixed(1)}px;--dy:${(y0-y).toFixed(1)}px`)}</g>`});
 if(fx.boom){const[x,y]=P(fx.boom);h+=`<g transform="translate(${x.toFixed(1)},${y.toFixed(1)})"><circle class="boom" r="12" fill="rgba(255,179,71,.35)" stroke="#ffb347" stroke-width="4"/></g>`}
 if(fx.shot){const[a,b]=P(fx.shot[0]),[c,d]=P(fx.shot[1]);h+=`<line class="shot" x1="${a.toFixed(1)}" y1="${b.toFixed(1)}" x2="${c.toFixed(1)}" y2="${d.toFixed(1)}" stroke="#ffd86b" stroke-width="4" stroke-linecap="round"/>`}
 return h;
}
function move(m,remote){
 if(online&&!remote){
  net.seq++;
  net.send({type:"move",m,seq:net.seq});
 }
 const ob=board;board=apply(board,m);fx=mkfx(ob,board,m);last=m;sel=null;legal=[];
 if(!hasCore(board,1-turn)){over=true;return draw(NAMES[turn]+" takes the Core and wins!");}
 turn=1-turn;
 if(!allMoves(board,turn).length){over=true;return draw(NAMES[turn]+" is blocked. "+NAMES[1-turn]+" wins!");}
 draw();
 if(vsAI&&turn===1){busy=true;aiTimer=setTimeout(()=>{aiTimer=null;busy=false;const a=aiMove();a&&move(a)},400);}
}
function clearAITimer(){if(aiTimer!==null){clearTimeout(aiTimer);aiTimer=null}}
const svg=document.getElementById("b");
function coachSide(){return online?my:vsAI?0:turn}
function draw(msg){
 let h="";
 const threatened=new Set();
 if(coachEnabled)allMoves(board,1-coachSide()).forEach(m=>{
  const k=key(m[2],m[3]),target=board[k];
  if(target&&target.c===coachSide())threatened.add(k);
 });
 const skip=new Set(fx&&fx.slides?fx.slides.map(s=>s.b):[]);let ci=0;
 for(const[q,r]of cells){ci++;const[x,y]=px(q,r),k=key(q,r),p=board[k];
  const isSel=sel&&sel[0]===q&&sel[1]===r,lg=legal.some(([a,c])=>a===q&&c===r);
  const lm=last&&((last[0]===q&&last[1]===r)||(last[2]===q&&last[3]===r));
  const danger=threatened.has(k);
  h+=`<g transform="translate(${x.toFixed(1)},${y.toFixed(1)})" data-q="${q}" data-r="${r}">
   <polygon class="hex c${((q-r)%3+3)%3}" points="${hexPts(S-1)}"/>`;
  if(lm)h+=`<polygon points="${hexPts(S-5)}" fill="none" stroke="${COL[board[k]?board[k].c:turn]}" stroke-opacity=".5" stroke-width="2" pointer-events="none"/>`;
  if(danger)h+=`<polygon class="threat-pulse" points="${hexPts(S-2)}" fill="rgba(255,87,87,.2)" stroke="#ff6868" stroke-width="3" pointer-events="none"/>`;
  if(isSel)h+=`<polygon points="${hexPts(S-3)}" fill="none" stroke="#ffd86b" stroke-width="3.5" pointer-events="none"/>`;
  if(p&&!skip.has(k)){
   const classes=[isSel?"piece-selected":"",fx&&fx.intro?"drop":"",fx&&fx.born&&fx.born.has(k)?"pop":""].filter(Boolean).join(" ");
   h+=pieceSVG(p,classes,fx&&fx.intro?`animation-delay:${ci*7}ms`:"");
  }
  if(lg)h+=p?`<polygon points="${hexPts(S-3)}" fill="rgba(255,90,80,.18)" stroke="#ff5a50" stroke-width="3.5" pointer-events="none"/>`
           :`<circle class="dotp" r="6" fill="#ffd86b" fill-opacity=".85" pointer-events="none"/>`;
  h+="</g>";}
 h+=fxLayer();fx=null;svg.innerHTML=h;
 document.getElementById("dot").style.background=COL[turn];document.getElementById("status").classList.toggle("win",over);
 document.getElementById("msg").textContent=msg||(vsAI&&turn===1?"Tide · "+aiStyle.charAt(0).toUpperCase()+aiStyle.slice(1)+" is thinking…":(online&&turn===my?"Your move":NAMES[turn]+" to move"));
 updateCoach();
}
function updateCoachButton(){
 const button=document.getElementById("coach-toggle");
 button.textContent=coachEnabled?"Coach on":"Coach off";
 button.setAttribute("aria-pressed",coachEnabled?"true":"false");
}
function updateCoach(){
 const text=document.getElementById("coach-msg");
 const action=document.getElementById("coach-action");
 coachSuggestedMove=null;
 action.classList.add("hide");
 if(!coachEnabled){text.textContent="Hex’s hints are paused. Switch Coach on to see threatened pieces.";return}
 if(over){text.textContent="That’s the game! Take a breath, then try another plan.";return}
 const side=coachSide();
 const threats=new Map();
 allMoves(board,1-side).forEach(m=>{
  const k=key(m[2],m[3]),target=board[k];
  if(target&&target.c===side){
   if(!threats.has(k))threats.set(k,new Set());
   threats.get(k).add(m[0]+","+m[1]);
  }
 });
 const core=Object.keys(board).find(k=>board[k].t==="C"&&board[k].c===side);
 if(core&&threats.has(core)){
  const attackers=threats.get(core),candidate=allMoves(board,side).map(m=>({m,p:board[key(m[0],m[1])]}));
  const safe=candidate.filter(({m})=>{
   const next=apply(board,m),nextCore=Object.keys(next).find(k=>next[k].t==="C"&&next[k].c===side);
   return nextCore&&!allMoves(next,1-side).some(reply=>key(reply[2],reply[3])===nextCore);
  });
  safe.sort((a,b)=>{
   const ac=a.p.t==="C"?0:attackers.has(key(a.m[0],a.m[1]))?1:2;
   const bc=b.p.t==="C"?0:attackers.has(key(b.m[0],b.m[1]))?1:2;
   return ac-bc;
  });
  const attacker=board[[...attackers][0]],pieceName=attacker?INFO[attacker.t][0]:"an enemy piece";
  if(safe.length&&turn===side){
   coachSuggestedMove=safe[0].m;
   text.textContent="Careful — your Core is threatened by "+pieceName+". Hex found a move that gets it out of immediate danger.";
   action.classList.remove("hide");
  }else{
   text.textContent="Careful — your Core is threatened by "+pieceName+". Move it, capture the attacker, or block its line.";
  }
 }else if(threats.size){
  const names=[...threats.keys()].map(k=>INFO[board[k].t][0]);
  text.textContent="Watch out: "+names.join(", ")+" can be captured next turn. Consider moving them or trading for the attacker.";
 }else if(last){
  const piece=board[key(last[2],last[3])];
  text.textContent=piece?"Nice move. Before you go again, look for a safe route toward the enemy Core.":"Good exchange. Look for a new route to the enemy Core.";
 }else{
  text.textContent="Choose a piece to see its moves. Red rings show what the other side can capture. An unmoved Core is safe from Seers.";
 }
}
let coachSuggestedMove=null;
document.getElementById("coach-action").onclick=()=>{
 if(coachSuggestedMove&&!over&&!busy&&(!vsAI||turn===0)&&(!online||turn===my))move(coachSuggestedMove);
};
svg.addEventListener("click",e=>{
 const g=e.target.closest("[data-q]");if(!g||over||busy||(vsAI&&turn===1)||(online&&turn!==my))return;
 const q=+g.dataset.q,r=+g.dataset.r,p=board[key(q,r)];
 if(sel&&legal.some(([a,c])=>a===q&&c===r))return move([sel[0],sel[1],q,r]);
 if(p&&p.c===turn){sel=[q,r];legal=gen(board,q,r)}else{sel=null;legal=[]}
 draw();
});
function setAI(v){if(online)leaveLobby(true);vsAI=v;m1.classList.toggle("on",v);m2.classList.toggle("on",!v);document.getElementById("ai-style").disabled=!v;setup()}
m1.onclick=()=>setAI(true);m2.onclick=()=>setAI(false);rs.onclick=()=>newGame();
modes.innerHTML=Object.keys(MODES).map(k=>`<button data-m="${k}">${MODES[k].n}</button>`).join("");
function syncMode(){[...modes.children].forEach(b=>b.classList.toggle("on",b.dataset.m===mode));md.textContent=MODES[mode].d;document.getElementById("mode-label").textContent=MODES[mode].n}
modes.onclick=e=>{const b=e.target.closest("button");if(b){if(online&&!isHost)return ostat("Only the lobby host can change the mode.");mode=b.dataset.m;syncMode();newGame()}};
syncMode();
