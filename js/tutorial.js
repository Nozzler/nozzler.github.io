/* ---------- Tutorial ---------- */
const TIP={
 C:"Keep it behind your Pikes early. In the endgame it is a real attacker, and freeze cannot stop it.",
 S:"A Seer stays on one hex shade forever, so it only ever attacks hexes of that shade. It cannot capture an unmoved Core or Seer; moving the target removes that opening protection.",
 R:"A Runner jump cannot be blocked, so it threatens hexes behind walls. Watch the hexes exactly 2 away from your Core.",
 H:"Hoppers need something to vault, even your own piece. Line them up behind your Pikes, then vault the wall to strike deep. The vaulted piece is not captured.",
 P:"Advance Pikes side by side: they capture sideways, so an enemy next to your Pike is in danger. Reaching the far edge makes a Seer.",
 L:"A steady, reliable attacker. Use its reach to control long lines and punish pieces that wander within 3 hexes.",
 G:"It cannot be blocked, so it can hit a Core hiding behind a full wall. Keep your Core off open straight lines within 3 hexes of a Phantom.",
 B:"Capture a piece inside a cluster and its neighbors die too. Never leave your pieces clumped near an enemy Bomber. The Bomber is lost when it captures.",
 W:"Swap your Core out of danger, or swap a Hopper or Lancer forward past the front line. A swap never captures.",
 U:"Anchor it beside your Core or your best attacker. The Bulwark itself can be captured, so trade it off carefully.",
 F:"Park it next to the enemy best piece to lock it. Cores are immune, so an enemy Core can still walk up and take it.",
 X:"A good piece to risk in an attack: the first capture only costs you a tempo, because it returns to your back row.",
 T:"The board edge is your weapon. Walk the Titan beside an enemy near the rim and shove it off, even a Core.",
 V:"Spend a turn next to a wall of enemy Pikes and it becomes your wall. Keep it protected afterwards.",
 A:"Hard to trade for: it removes pieces from 2 to 3 hexes away and stays put. Keep a clear line and a safe distance.",
 M:"Pull enemies into the reach of your Seers and Lancers, or drag a blocker out of the way of an attack.",
 D:"Look for captures where another enemy stands right behind the target: you remove both in one move.",
 J:"Swap an enemy out of a strong post, or swap one into the line of your own attackers.",
 N:"Place it beside a key hex. Whoever captures it loses the capturing piece, unless it is a Core."};
let tp="C";
const withR3=f=>{const o=R;R=3;try{return f()}finally{R=o}};
function miniSVG(b,mv,sel,hl,click){let h="";
 for(let r=-3;r<=3;r++)for(let q=-3;q<=3;q++){if(Math.max(Math.abs(q),Math.abs(r),Math.abs(q+r))>3)continue;
  const[x,y]=pxn(q,r),p=b[key(q,r)],m=mv.some(([a,c])=>a===q&&c===r),s=sel&&sel[0]===q&&sel[1]===r,H=hl&&hl.some(([a,c])=>a===q&&c===r);
  h+=`<g transform="translate(${x.toFixed(1)},${y.toFixed(1)})"${click?` data-h="${q},${r}"`:""}><polygon class="hex c${((q-r)%3+3)%3}" ${click?"":'style="cursor:default" '}points="${hexPts(S-1)}"/>`
   +(p?`<circle r="${S*.68}" fill="${COL[p.c]}" stroke="#14111c" stroke-width="2.5" pointer-events="none"/><g pointer-events="none">${icon(p.t,"#1a1420")}</g>`:"")
   +(m?(p?`<polygon points="${hexPts(S-3)}" fill="rgba(255,90,80,.18)" stroke="${p.c?"#ff5a50":"#ffd86b"}" stroke-width="3.5" pointer-events="none"/>`:`<circle r="6" fill="#ffd86b" pointer-events="none"/>`):"")
   +(s?`<polygon points="${hexPts(S-3)}" fill="none" stroke="#ffd86b" stroke-width="3.5" pointer-events="none"/>`:"")
   +(H?`<polygon points="${hexPts(S-3)}" fill="none" stroke="#7ad7ff" stroke-width="3.5" stroke-dasharray="6 4" pointer-events="none"/>`:"")+"</g>";}
 return `<svg viewBox="-178 -160 356 320">${h}</svg>`;
}
function demo(t){
 const b={};b[key(0,0)]={t,c:0};b[key(1,0)]={t:"P",c:1};b[key(0,-2)]={t:"P",c:1};b[key(-1,0)]={t:"P",c:0};
 return withR3(()=>miniSVG(b,gen(b,0,0),null,null,false));
}
/* ---------- Trainer drills (you play amber, moving up) ---------- */
const has=(b,t,c)=>Object.values(b).some(p=>p.t===t&&p.c===c),count=(b,c)=>Object.values(b).filter(p=>p.c===c).length;
const coreSafe=b=>has(b,"C",0)&&!allMoves(b,1).some(m=>{const o=b[key(m[2],m[3])];return o&&o.t==="C"&&o.c===0});
const DR=[
 {n:"Pike capture",g:"Capture the enemy Lancer with your Pike.",w:[[0,0,"P"]],e:[[1,0,"L"],[0,-3,"C"]],ck:(b,m,a)=>!has(a,"L",1),why:"Pikes capture the hex to their left or right, not straight ahead."},
 {n:"Promotion",g:"Promote your Pike by moving it to the far edge.",w:[[1,-2,"P"],[0,3,"C"]],e:[[-2,-1,"C"]],ck:(b,m,a)=>has(a,"S",0),why:"A Pike that reaches the far edge becomes a Seer."},
 {n:"Seer strike",g:"Take the enemy Core with your Seer after it has moved.",w:[[-1,2,"S"]],e:[[1,0,"P"],[1,-2,"C"]],ck:(b,m,a)=>!has(a,"C",1),why:"Seers slide along long diagonals. An unmoved Core is protected from Seers."},
 {n:"Runner jump",g:"Take the enemy Core with your Runner. The Pike wall is in the way.",w:[[0,2,"R"]],e:[[0,1,"P"],[0,0,"C"]],ck:(b,m,a)=>!has(a,"C",1),why:"A Runner jump ignores whatever stands in between."},
 {n:"Hopper vault",g:"Take the enemy Core with your Hopper.",w:[[-1,1,"H"],[0,0,"P"]],e:[[1,-1,"C"]],ck:(b,m,a)=>!has(a,"C",1),why:"The Hopper vaulted your own Pike and landed on the Core."},
 {n:"Phantom raid",g:"Take the enemy Core with your Phantom.",w:[[-1,1,"G"]],e:[[0,0,"P"],[1,-1,"P"],[2,-2,"C"]],ck:(b,m,a)=>!has(a,"C",1),why:"Phantoms pass through pieces, so a wall cannot stop them."},
 {n:"Bomb blast",g:"Use your Bomber to remove at least 4 enemy pieces in one capture.",w:[[0,1,"B"]],e:[[0,0,"P"],[1,0,"P"],[1,-1,"P"],[-1,0,"P"],[0,-3,"C"]],ck:(b,m,a)=>count(b,1)-count(a,1)>=4,why:"Capturing the middle of a cluster removes every neighbor too."},
 {n:"Freeze",g:"Move your Frostbinder so the enemy Lancer cannot move.",w:[[-1,1,"F"]],e:[[1,0,"L"],[0,-3,"C"]],ck:(b,m,a)=>has(a,"L",1)&&gen(a,1,0).length===0,why:"Enemy pieces touching a Frostbinder cannot move."},
 {n:"Shield",g:"Capture the enemy Bulwark. Try the Seer first: the Pike it targets is shielded.",w:[[0,2,"L"],[-1,0,"S"]],e:[[0,-1,"U"],[1,-1,"P"],[0,-3,"C"]],ck:(b,m,a)=>!has(a,"U",1),why:"Shielded pieces cannot be captured, but the Bulwark itself can."},
 {n:"Core defense",g:"Your Core is attacked by the Runner. Make it safe.",w:[[0,2,"C"],[1,0,"P"]],e:[[0,0,"R"],[0,-3,"C"]],ck:(b,m,a)=>coreSafe(a),why:"Capturing the attacker or stepping away both save the Core."},
 {n:"Swap rescue",g:"The Lancer attacks your Core. Save it by swapping with your Swapper.",w:[[-3,3,"C"],[-1,1,"W"]],e:[[-3,0,"L"],[0,-3,"C"]],ck:(b,m,a)=>{const o=b[key(m[2],m[3])];return !!o&&o.c===0&&coreSafe(a)},why:"The swap moved your Core out of the Lancer line."},
 {n:"Archer shot",g:"Remove the enemy Lancer with your Archer without moving it.",w:[[0,2,"A"]],e:[[0,-1,"L"],[0,-3,"C"]],ck:(b,m,a)=>!has(a,"L",1)&&has(a,"A",0),why:"Archers shoot 2 to 3 hexes away and never leave their hex."},
 {n:"Titan shove",g:"Win by shoving the enemy Core off the board with your Titan.",w:[[2,-2,"T"]],e:[[3,-2,"C"]],ck:(b,m,a)=>!has(a,"C",1),why:"A Titan pushes enemies one hex. Pushed off the board means destroyed."},
 {n:"Witch charm",g:"Win over at least 3 enemy Pikes with one Witch move.",w:[[0,1,"V"]],e:[[1,-1,"P"],[-1,0,"P"],[0,-1,"P"],[0,-3,"C"]],ck:(b,m,a)=>count(a,0)-count(b,0)>=3,why:"After a Witch moves, enemy Pikes touching it join you."}];
let tdI=0,td=null;const done=new Set(),drillStats={};
try{
 const saved=JSON.parse(localStorage.getItem("hf_training")||"{}");
 if(Array.isArray(saved.done))saved.done.filter(i=>Number.isInteger(i)&&i>=0&&i<DR.length).forEach(i=>done.add(i));
 if(saved.stats&&typeof saved.stats==="object")Object.assign(drillStats,saved.stats);
}catch(error){console.warn("Could not restore Hexfall training progress.",error)}
function saveTraining(){try{localStorage.setItem("hf_training",JSON.stringify({done:[...done],stats:drillStats}))}catch(error){console.warn("Could not save Hexfall training progress.",error)}}
function drillStart(i){tdI=i;const d=DR[i],b={};d.w.forEach(([q,r,t])=>b[key(q,r)]={t,c:0});d.e.forEach(([q,r,t])=>b[key(q,r)]={t,c:1});if(i===2){const core=Object.keys(b).find(k=>b[k].t==="C"&&b[k].c===1);if(core)b[core].moved=true}td={b,sel:null,mv:[],hl:[],msg:"",ok:false}}
function trainClick(q,r){
 if(td.ok)return;
 withR3(()=>{const b=td.b,p=b[key(q,r)];
  if(td.sel&&td.mv.some(([a,c])=>a===q&&c===r)){
   const m=[td.sel[0],td.sel[1],q,r],a=apply(b,m),stats=drillStats[tdI]||(drillStats[tdI]={attempts:0,hints:0});
   stats.attempts++;saveTraining();
   if(DR[tdI].ck(b,m,a)){td.b=a;td.sel=null;td.mv=[];td.hl=[];td.ok=true;done.add(tdI);td.msg="Goal complete. "+DR[tdI].why;saveTraining()}
   else{drillStart(tdI);td.msg="Not quite: that does not meet the goal, so the board was reset. Press Hint if you are stuck."}
  }else if(p&&p.c===0){td.sel=[q,r];td.mv=gen(b,q,r);td.hl=[]}
  else{td.sel=null;td.mv=[]}});
 showTab("Train");
}
function trainAct(a){
 withR3(()=>{const b=td.b;
  if(a==="reset")drillStart(tdI);
  else if(a==="next"){if(tdI<DR.length-1)drillStart(tdI+1);else{drillStart(0);td.msg="That was the last drill. Now try a real game in Skirmish mode."}}
  else if(!td.ok){const m=allMoves(b,0).find(m=>DR[tdI].ck(b,m,apply(b,m)));
   if(m){
    if(a==="hint"){const stats=drillStats[tdI]||(drillStats[tdI]={attempts:0,hints:0});stats.hints++;saveTraining()}
    td.hl=a==="hint"?[[m[0],m[1]]]:[[m[0],m[1]],[m[2],m[3]]];
    const piece=b[key(m[0],m[1])];
    td.msg=a==="hint"?"Look at the dashed "+INFO[piece.t][0]+". Find a move that achieves the goal.":"Answer: move the dashed "+INFO[piece.t][0]+" to the highlighted hex, then try it yourself.";
   }
  }});
 showTab("Train");
}
const TABS={
 Goal:()=>`<h3>The goal</h3><p>Capture the enemy Core. There is no check or checkmate: you can move into danger, and the game ends the moment a Core is taken. A side with no legal moves loses.</p>
<h3>Taking turns</h3><p>Ember (amber, bottom) moves first, then Tide (teal, top). Click one of your pieces. Gold dots show empty hexes it can move to, red rings show captures. Click a target to move, or click elsewhere to deselect. The last move stays outlined.</p>
<h3>The board</h3><p>Hexes come in three repeating shades. They matter: Seers never leave the shade they start on.</p>
<h3>Wild cards</h3><p>Before the game each player chooses wild cards from six extra pieces. They start on the open hexes in front of your army, so you can have more piece types than your opponent expects.</p>
<h3>Fair opening</h3><p>An unmoved Core cannot be captured by a Seer. Move the Core once and Seers can target it. An unmoved Seer also cannot capture the opposing starting Seer. Other pieces may capture either piece normally.</p>
<h3>Promotion</h3><p>A Pike that reaches the far edge becomes a Seer.</p><h3>Practice</h3><p>Try the guided full game to get live threat warnings and coaching, or use the 14 hands-on drills to practice a specific tactic.</p>
<h3>Before every move, ask</h3><ol><li>Can the enemy take my Core next turn?</li><li>Can I take their Core right now?</li><li>What can they capture, and is it worth defending?</li><li>Is any of my pieces frozen or about to be bombed?</li></ol>`,
 Pieces:()=>`<p>Pick a piece. Your piece is amber in the middle. Gold dots are moves, rings are captures. Enemy Pikes (teal) and a friendly Pike (amber) are placed to show captures, vaults and swaps.</p>
<div class="pcs">${Object.keys(INFO).map(k=>`<button data-p="${k}" class="${k===tp?"on":""}" title="${INFO[k][0]}"><svg width="36" height="36" viewBox="-20 -20 40 40"><circle r="18" fill="${COL[0]}" stroke="#14111c" stroke-width="2"/>${icon(k,"#1a1420")}</svg></button>`).join("")}</div>
<div class="demo">${demo(tp)}<div><h3 style="margin-top:0">${INFO[tp][0]}${WILD.includes(tp)?" (wild card)":MYTH.includes(tp)?" (Mythic wild card)":""}</h3><p>${INFO[tp][1]}</p><h3>Strategy</h3><p>${TIP[tp]}</p></div></div>
<h3>Rough values</h3><p class="key">Core: priceless. Seer, Lancer, Frostbinder: 5. Hopper, Phantom, Bomber, Bulwark: 4. Runner, Swapper: 3. Pike: 1.</p>`,
 Train:()=>{if(!td)drillStart(0);const d=DR[tdI],stats=drillStats[tdI]||{attempts:0,hints:0},percent=Math.round(done.size/DR.length*100);
 return `<p>Short, hands-on missions build one tactic at a time. Pick your piece, study its legal moves, and solve the goal. A wrong move resets the position, not your progress.</p><p>Want a full match? Hex can coach you through live threats as you play.</p><button data-start-guided class="on">Play a coached full game</button>
<div class="training-progress"><div><b>Training path</b><span>${done.size} / ${DR.length} complete</span></div><div class="progress-track"><span style="width:${percent}%"></span></div></div>
<div class="pcs">${DR.map((x,i)=>`<button data-d="${i}" class="${i===tdI?"on":""}">${done.has(i)?"★ ":""}${i+1}. ${x.n}</button>`).join("")}</div>
<div class="demo">${miniSVG(td.b,td.mv,td.sel,td.hl,!td.ok)}<div><h3 style="margin-top:0">${d.n}</h3><p><b>Mission:</b> ${d.g}</p><p class="training-message">${td.msg||"Take your time. Gold dots are legal moves; rings mark captures."}</p>
<div class="bar" style="justify-content:flex-start"><button data-a="hint">Give me a hint</button><button data-a="sol">Show the move</button><button data-a="reset">Try again</button>${td.ok?`<button data-a="next" class="on">${tdI<DR.length-1?"Next mission":"Replay path"}</button>`:""}</div>
<p class="key">${done.has(tdI)?"Complete · ":""}${stats.attempts} move${stats.attempts===1?"":"s"} tried · ${stats.hints} hint${stats.hints===1?"":"s"} used. Gold is your move; red is a capture.</p></div></div>`},
 Modes:()=>`<h3>Game modes</h3><ul>${Object.values(MODES).map(m=>`<li><b>${m.n}</b>: ${m.d}</li>`).join("")}</ul>
<h3>Which should I play?</h3><ul><li>New to the game: Skirmish. Fewer pieces make it easy to see threats.</li><li>Learning wild cards: Classic.</li><li>Want chaos and combos: Wild rush.</li><li>Want long plans and flank attacks: Grand. Distances are bigger, so Lancers and Phantoms matter more.</li></ul>
<h3>Playing vs the computer</h3><p>Choose an AI style in the match bar. <b>Balanced</b> mixes tactics and position, <b>Raider</b> chases activity and captures, and <b>Guardian</b> values safe pieces and solid play. All styles look ahead for replies, but they make different trade-offs; no computer opponent is unbeatable.</p>`,
 Strategy:()=>`<h3>Opening</h3><ul><li>Advance Pikes in pairs and claim the center.</li><li>Keep the Core behind them.</li><li>Keep Hoppers behind your wall: they vault your own pieces, so a wall helps them.</li><li>Choose a wild card that fits a plan (see below), not just the strongest-sounding one.</li></ul>
<h3>Middle game</h3><ul><li>Trade when you are ahead in value, avoid trades when behind.</li><li>Aim pieces at the enemy Core, not only at its pieces.</li><li>Use shades: a Seer on the same shade as the enemy Core can threaten it from far away. A Seer on another shade can never touch it.</li><li>Do not cluster against a Bomber. Do not leave a lone piece beside a Frostbinder.</li></ul>
<h3>Endgame</h3><ul><li>Promote Pikes: a fresh Seer can decide a race.</li><li>Use your Core. It is a strong attacker once few enemy pieces remain.</li><li>The board edge limits a Core. Trap it by covering the hexes around it.</li></ul>
<h3>Choosing a wild card</h3><ul><li><b>Lancer</b>: safe all-round attacker.</li><li><b>Phantom</b>: assassin that ignores walls.</li><li><b>Bomber</b>: breaks up clusters and trades up.</li><li><b>Swapper</b>: flexible, great for rescuing your Core.</li><li><b>Bulwark</b>: defensive anchor for a slow plan.</li><li><b>Frostbinder</b>: locks down the enemy best piece.</li></ul>
<h3>Mythic pieces (Mythic mode)</h3><ul><li><b>Titan</b>: shove enemies toward the rim. The edge is a weapon.</li><li><b>Archer</b>: shoots 2 to 3 hexes away and stays put.</li><li><b>Phoenix</b>: returns once after capture, so risk it in attacks.</li><li><b>Witch</b>: turns enemy Pikes into yours.</li><li><b>Dragon</b>: captures twice if a second enemy stands behind the first.</li><li><b>Magnet</b>: pulls enemies into your attackers.</li><li><b>Trickster</b>: swaps enemies out of strong posts.</li><li><b>Revenant</b>: costs the capturer its piece.</li></ul>
<h3>Counters</h3><ul><li>vs Bomber: spread out and capture it first.</li><li>vs Frostbinder: capture it, or bring your Core next to it.</li><li>vs Bulwark: capture the Bulwark itself, the shield does not protect it.</li><li>vs Phantom or Runner: walls do not help. Cover hexes or keep your Core off its lines.</li></ul>`,
 Tactics:()=>`<h3>Named tricks to try</h3><ul>
<li><b>Hop fork</b>: place a Hopper behind your own Pike facing two enemy pieces. Vaulting can threaten two captures at once.</li>
<li><b>Phantom raid</b>: send a Phantom toward the enemy Core on a line with an open hex at distance 1 to 3. A wall will not save them.</li>
<li><b>Swap rescue</b>: when your Core is attacked, swap it with a friendly piece up to 3 hexes away.</li>
<li><b>Freeze lock</b>: freeze their Seer, then attack the Frostbinder with a piece they cannot answer.</li>
<li><b>Bomb chain</b>: capture the center of a cluster. Neighbors vanish, which can open a path to the Core. Cores are safe from blasts, so finish with a separate attack.</li>
<li><b>Shield wall</b>: put a Bulwark in the middle of your Pikes. Nothing touching it can be taken, so you can push forward safely.</li>
<li><b>Seer shade trap</b>: if an enemy Core stands on a shade your Seers cannot reach, aim at its escape hexes instead.</li>
<li><b>Edge squeeze</b>: push the enemy Core to the rim, then cover its last free neighbors with Runner and Lancer reach.</li></ul>
<h3>Common mistakes</h3><ul><li>Moving the Core early with no plan.</li><li>Forgetting that jumps (Runner, Hopper, Phantom) ignore blockers.</li><li>Leaving a Pike next to an enemy Pike, which can capture sideways.</li><li>Ignoring which piece is frozen.</li></ul>
<p class="key">Tip: try Skirmish with a Phantom first. It is the easiest way to learn how fast a game can end.</p>`};
function showTab(n){tabs.innerHTML=Object.keys(TABS).map(k=>`<button data-t="${k}" class="${k===n?"on":""}">${k}</button>`).join("");tc.innerHTML=TABS[n]();tc.dataset.t=n}
tabs.onclick=e=>{const b=e.target.closest("button");if(b)showTab(b.dataset.t)};
tc.onclick=e=>{let b;
 if(b=e.target.closest("[data-p]")){tp=b.dataset.p;showTab("Pieces")}
 else if(b=e.target.closest("[data-d]")){drillStart(+b.dataset.d);showTab("Train")}
 else if(e.target.closest("[data-start-guided]")){tut.className="hide";startGame(true,true)}
 else if(b=e.target.closest("[data-a]"))trainAct(b.dataset.a);
 else if(b=e.target.closest("[data-h]")){const[q,r]=b.dataset.h.split(",").map(Number);trainClick(q,r)}};
tb.onclick=()=>{showTab("Goal");tut.className=""};tx.onclick=()=>tut.className="hide";
