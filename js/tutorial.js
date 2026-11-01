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
function trainingGoal(goal,b,m,a){
 switch(goal.type){
  case "missingEnemyPiece":return !has(a,goal.piece,1);
  case "ownPiecePresent":return has(a,goal.piece,0);
  case "enemyCoreMissing":return !has(a,"C",1);
  case "enemyCountDrop":return count(b,1)-count(a,1)>=goal.minimum;
  case "enemyPieceFrozen":{const target=Object.entries(a).find(([,p])=>p.t===goal.piece&&p.c===1);return !!target&&gen(a,...target[0].split(",").map(Number)).length===0}
  case "coreSafe":return coreSafe(a);
  case "swapRescue":{const target=b[key(m[2],m[3])];return !!target&&target.c===0&&coreSafe(a)}
  case "archerRemoval":return !has(a,goal.target,1)&&has(a,goal.actor,0);
  case "ownCountIncrease":return count(a,0)-count(b,0)>=goal.minimum;
  case "coreSafeAndMissing":return coreSafe(a)&&!has(a,goal.piece,1);
  default:return false;
 }
}
window.HexfallTrainingReady=fetch("data/lessons.json").then(response=>{
 if(!response.ok)throw new Error(`Lesson catalog request failed: ${response.status}`);
 return response.json();
}).then(data=>{
 const CHAPTERS=data.chapters,COURSE=data.lessons,CHAPTER_SIZE=data.chapterSize;
 const DR=data.puzzles.map(puzzle=>({...puzzle,ck:(b,m,a)=>trainingGoal(puzzle.goal,b,m,a)}));
let tdI=0,td=null;const done=new Set(),drillStats={};
try{
 const saved=JSON.parse(localStorage.getItem("hf_training")||"{}");
 if(Array.isArray(saved.done))saved.done.filter(i=>Number.isInteger(i)&&i>=0&&i<COURSE.length).forEach(i=>done.add(i));
 if(saved.stats&&typeof saved.stats==="object")Object.assign(drillStats,saved.stats);
}catch(error){console.warn("Could not restore Hexfall training progress.",error)}
function saveTraining(){try{localStorage.setItem("hf_training",JSON.stringify({done:[...done],stats:drillStats}))}catch(error){console.warn("Could not save Hexfall training progress.",error)}}
const nextTrainingIndex=()=>{const i=COURSE.findIndex((_,index)=>!done.has(index));return i<0?0:i};
const HEX_OFFSETS=[];for(let q=-3;q<=3;q++)for(let r=-3;r<=3;r++)if(Math.max(Math.abs(q),Math.abs(r),Math.abs(q+r))<=3)HEX_OFFSETS.push([q,r]);
const trainingHexDistance=(a,b)=>Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1]),Math.abs(a[0]+a[1]-b[0]-b[1]));
function makeTrainingVariant(id,offset,decoys){
 const lesson=COURSE[id],tactic=DR[lesson.puzzleIndex],b={},shifted=points=>points.map(([q,r,t])=>[q+offset[0],r+offset[1],t]);
 const w=shifted(tactic.w),e=shifted(tactic.e),seq=tactic.seq?.map(m=>[m[0]+offset[0],m[1]+offset[1],m[2]+offset[0],m[3]+offset[1]]);
 if([...w,...e].some(([q,r])=>Math.max(Math.abs(q),Math.abs(r),Math.abs(q+r))>3))return null;
 for(const[q,r,t]of w){if(b[key(q,r)])return null;b[key(q,r)]={t,c:0}}
 for(const[q,r,t]of e){if(b[key(q,r)])return null;b[key(q,r)]={t,c:1}}
 if(tactic.movedCore){const core=Object.keys(b).find(k=>b[k].t==="C"&&b[k].c===1);if(core)b[core].moved=true}
 const occupied=Object.keys(b).map(k=>k.split(",").map(Number));
 const empty=HEX_OFFSETS.filter(([q,r])=>!b[key(q,r)]);
 let state=(id+1)*7919+(offset[0]+4)*97+(offset[1]+4)*193;
 const random=()=>{state=(state*48271)%2147483647;return state/2147483647};
 const isolated=empty.filter(cell=>occupied.every(other=>trainingHexDistance(cell,other)>1));
 const spaces=isolated.length>=decoys?isolated:empty;
 const types=["P","R","H","L","G","W","A"];
 for(let i=0;i<decoys;i++){
  if(!spaces.length)return null;
  const index=Math.floor(random()*spaces.length),[q,r]=spaces.splice(index,1)[0];
  b[key(q,r)]={t:types[Math.floor(random()*types.length)],c:random()<.5?0:1};
 }
 return{b,seq};
}
function hasTrainingSolution(id,position){
 const lesson=COURSE[id],tactic=DR[lesson.puzzleIndex];
 if(position.seq){let b=position.b,lastMove;
  for(const move of position.seq){if(!gen(b,move[0],move[1]).some(([q,r])=>q===move[2]&&r===move[3]))return false;b=apply(b,move);lastMove=move}
  return tactic.ck(position.b,lastMove,b);
 }
 return allMoves(position.b,0).some(move=>tactic.ck(position.b,move,apply(position.b,move)));
}
function trainingPosition(id){
 const lesson=COURSE[id],seed=id<17?0:id;
 if(id<17)return makeTrainingVariant(id,[0,0],0);
 const offsets=HEX_OFFSETS.slice().sort((a,b)=>((a[0]*31+a[1]*17+seed*13)%997)-((b[0]*31+b[1]*17+seed*13)%997));
 const maxDecoys=Math.min(4,Math.floor(lesson.lessonNumber/15)+Math.floor(lesson.chapterIndex/5));
 for(let decoys=maxDecoys;decoys>=0;decoys--)for(const offset of offsets){
  const position=makeTrainingVariant(id,offset,decoys);
  if(position&&hasTrainingSolution(id,position))return position;
 }
 return makeTrainingVariant(id,[0,0],0);
}
function drillStart(i){const position=withR3(()=>trainingPosition(i));tdI=i;td={b:position.b,seq:position.seq,sel:null,mv:[],hl:[],msg:"",ok:false,step:0,learned:false,quizMsg:""}}
const trainingMove=(b,m,a)=>{const expected=td.seq?.[td.step];return expected?expected.every((v,i)=>v===m[i]):DR[COURSE[tdI].puzzleIndex].ck(b,m,a)};
function trainClick(q,r){
 if(td.ok||!td.learned)return;
 withR3(()=>{const b=td.b,p=b[key(q,r)];
  if(td.sel&&td.mv.some(([a,c])=>a===q&&c===r)){
  const m=[td.sel[0],td.sel[1],q,r],a=apply(b,m),d=DR[COURSE[tdI].puzzleIndex],stats=drillStats[tdI]||(drillStats[tdI]={attempts:0,hints:0});
   stats.attempts++;saveTraining();
  if(trainingMove(b,m,a)&&td.seq&&td.step<td.seq.length-1){td.b=a;td.step++;td.sel=null;td.mv=[];td.hl=[];td.msg=`Step ${td.step} complete. ${COURSE[tdI].next}`;saveTraining()}
   else if(trainingMove(b,m,a)&&d.ck(b,m,a)){td.b=a;td.sel=null;td.mv=[];td.hl=[];td.ok=true;done.add(tdI);td.msg="Goal complete. "+d.why;saveTraining()}
   else{const quizMsg=td.quizMsg;drillStart(tdI);td.learned=true;td.quizMsg=quizMsg;td.msg="Not quite: the board was reset. Try the tactic again, or use a hint."}
  }else if(p&&p.c===0){td.sel=[q,r];td.mv=gen(b,q,r);td.hl=[]}
  else{td.sel=null;td.mv=[]}});
 showTab("Train");
}
function trainAct(a){
 withR3(()=>{const b=td.b;
  if(a==="reset"){const learned=td.learned,quizMsg=td.quizMsg;drillStart(tdI);td.learned=learned;td.quizMsg=quizMsg}
  else if(a==="next"){const complete=done.size===COURSE.length;drillStart(complete?0:nextTrainingIndex());if(complete)td.msg="Path complete. Replay any lesson to keep practicing."}
  else if(!td.ok&&td.learned){const m=allMoves(b,0).find(m=>trainingMove(b,m,apply(b,m)));
   if(m){
    if(a==="hint"){const stats=drillStats[tdI]||(drillStats[tdI]={attempts:0,hints:0});stats.hints++;saveTraining()}
    td.hl=a==="hint"?[[m[0],m[1]]]:[[m[0],m[1]],[m[2],m[3]]];
    const piece=b[key(m[0],m[1])];
    td.msg=a==="hint"?`Think about ${COURSE[tdI].n}. Look at the dashed ${INFO[piece.t][0]}.`:`Step ${td.step+1}: move the dashed ${INFO[piece.t][0]} to the highlighted hex, then try it yourself.`;
   }
  }});
 showTab("Train");
}
function answerLesson(answer){
 const lesson=COURSE[tdI];
 if(answer===lesson.answer){td.learned=true;td.quizMsg="Correct. Now put the tactic into practice on the board."}
 else td.quizMsg="Not quite. "+lesson.learn;
 showTab("Train");
}
function openChapter(index){
 const start=index*CHAPTER_SIZE,first=COURSE.slice(start,start+CHAPTER_SIZE).find(lesson=>!done.has(lesson.id));
 drillStart(first?first.id:start);showTab("Train");
}
const TABS={
 Goal:()=>`<h3>The goal</h3><p>Capture the enemy Core. There is no check or checkmate: you can move into danger, and the game ends the moment a Core is taken. A side with no legal moves loses.</p>
<h3>Taking turns</h3><p>Ember (amber, bottom) moves first, then Tide (teal, top). Click one of your pieces. Gold dots show empty hexes it can move to, red rings show captures. Click a target to move, or click elsewhere to deselect. The last move stays outlined.</p>
<h3>The board</h3><p>Hexes come in three repeating shades. They matter: Seers never leave the shade they start on.</p>
<h3>Wild cards</h3><p>Before the game each player chooses wild cards from six extra pieces. They start on the open hexes in front of your army, so you can have more piece types than your opponent expects.</p>
<h3>Fair opening</h3><p>An unmoved Core cannot be captured by a Seer. Move the Core once and Seers can target it. An unmoved Seer also cannot capture the opposing starting Seer. Other pieces may capture either piece normally.</p>
<h3>Promotion</h3><p>A Pike that reaches the far edge becomes a Seer.</p><h3>Practice</h3><p>Try the guided full game for live coaching, or follow the 1,000-lesson path across 20 chapters. Learn a tactic, check your recall, then solve increasingly varied boards and two-move combinations.</p>
<h3>Before every move, ask</h3><ol><li>Can the enemy take my Core next turn?</li><li>Can I take their Core right now?</li><li>What can they capture, and is it worth defending?</li><li>Is any of my pieces frozen or about to be bombed?</li></ol>`,
 Pieces:()=>`<p>Pick a piece. Your piece is amber in the middle. Gold dots are moves, rings are captures. Enemy Pikes (teal) and a friendly Pike (amber) are placed to show captures, vaults and swaps.</p>
<div class="pcs">${Object.keys(INFO).map(k=>`<button data-p="${k}" class="${k===tp?"on":""}" title="${INFO[k][0]}"><svg width="36" height="36" viewBox="-20 -20 40 40"><circle r="18" fill="${COL[0]}" stroke="#14111c" stroke-width="2"/>${icon(k,"#1a1420")}</svg></button>`).join("")}</div>
<div class="demo">${demo(tp)}<div><h3 style="margin-top:0">${INFO[tp][0]}${WILD.includes(tp)?" (wild card)":MYTH.includes(tp)?" (Mythic wild card)":""}</h3><p>${INFO[tp][1]}</p><h3>Strategy</h3><p>${TIP[tp]}</p></div></div>
<h3>Rough values</h3><p class="key">Core: priceless. Seer, Lancer, Frostbinder: 5. Hopper, Phantom, Bomber, Bulwark: 4. Runner, Swapper: 3. Pike: 1.</p>`,
 Train:()=>{if(!td)drillStart(nextTrainingIndex());const courseLesson=COURSE[tdI],chapter=CHAPTERS[courseLesson.chapterIndex],d=DR[courseLesson.puzzleIndex],stats=drillStats[tdI]||{attempts:0,hints:0},percent=Math.round(done.size/COURSE.length*100),unlocked=nextTrainingIndex(),start=courseLesson.chapterIndex*CHAPTER_SIZE,chapterLessons=COURSE.slice(start,start+CHAPTER_SIZE);
 return `<p>Learn a tactic, check your recall, then solve the board. Browse any chapter or lesson; progress marks what you have completed.</p>
<div class="training-progress"><div><b>Training path</b><span>${done.size} / ${COURSE.length} complete</span></div><div class="progress-track"><span style="width:${percent}%"></span></div></div>
<div class="training-layout"><div class="training-sidebar">
<label class="chapter-picker">Chapter<select data-chapter>${CHAPTERS.map((item,index)=>{const first=index*CHAPTER_SIZE,complete=COURSE.slice(first,first+CHAPTER_SIZE).filter(lesson=>done.has(lesson.id)).length;return `<option value="${index}" ${index===courseLesson.chapterIndex?"selected":""}>${index+1}. ${item.n} · ${complete}/${CHAPTER_SIZE}</option>`}).join("")}</select></label>
<section class="chapter-lessons"><h3>Lessons · ${chapter.n}</h3><div class="training-lessons">${chapterLessons.map(lesson=>`<button data-d="${lesson.id}" class="training-lesson ${done.has(lesson.id)?"complete":""} ${lesson.id===tdI?"on":""}"><span class="lesson-state">${done.has(lesson.id)?"✓":lesson.id===unlocked?"●":"○"}</span><span>${String(lesson.lessonNumber+1).padStart(2,"0")}. ${lesson.n}</span><small>${done.has(lesson.id)?"Complete":lesson.id===unlocked?"Next":"Available"}</small></button>`).join("")}</div></section>
</div><main class="training-current">
<section class="tactic-lesson"><p class="tactic-label">CHAPTER ${courseLesson.chapterIndex+1} · LESSON ${courseLesson.lessonNumber+1} OF ${CHAPTER_SIZE} · LEVEL ${courseLesson.difficulty}</p><h3>${courseLesson.n}</h3><p>${courseLesson.learn}</p><div class="recall-check"><b>Quick recall</b><p>${courseLesson.q}</p><div class="recall-answers">${courseLesson.a.map((answer,i)=>`<button data-answer="${i}" ${td.learned?"disabled":""}>${answer}</button>`).join("")}</div><p class="recall-feedback" role="status">${td.quizMsg||"Choose an answer to start the challenge."}</p></div></section>
<div class="demo">${miniSVG(td.b,td.mv,td.sel,td.hl,!td.ok&&td.learned)}<div><h3 style="margin-top:0">${d.n}</h3><p><b>Mission:</b> ${d.g}</p><p class="training-message">${td.msg||(td.learned?"Take your time. Gold dots are legal moves; rings mark captures.":"Answer the quick recall question to begin.")}</p>
<div class="bar" style="justify-content:flex-start"><button data-a="hint" ${td.learned?"":"disabled"}>Give me a hint</button><button data-a="sol" ${td.learned?"":"disabled"}>Show the move</button><button data-a="reset">Try again</button>${td.ok?`<button data-a="next" class="on">${done.size===COURSE.length?"Path complete":"Continue path"}</button>`:""}</div>
<p class="key">${done.has(tdI)?"Complete · ":""}${stats.attempts} move${stats.attempts===1?"":"s"} tried · ${stats.hints} hint${stats.hints===1?"":"s"} used. Gold is your move; red is a capture.</p></div></div>
<p>Want a full match? Hex can coach you through live threats as you play.</p><button data-start-guided>Play a coached full game</button>
</main></div>`},
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
function showTab(n){tabs.innerHTML=Object.keys(TABS).map(k=>`<button data-t="${k}" class="${k===n?"on":""}">${k}</button>`).join("");tc.dataset.t=n;tc.innerHTML=TABS[n]()}
tabs.onclick=e=>{const b=e.target.closest("button");if(b)showTab(b.dataset.t)};
tc.onclick=e=>{let b;
 if(b=e.target.closest("[data-p]")){tp=b.dataset.p;showTab("Pieces")}
 else if(b=e.target.closest("[data-d]")){drillStart(+b.dataset.d);showTab("Train")}
 else if(e.target.closest("[data-start-guided]")){tut.className="hide";startGame(true,true)}
 else if(b=e.target.closest("[data-answer]"))answerLesson(+b.dataset.answer);
 else if(b=e.target.closest("[data-a]"))trainAct(b.dataset.a);
 else if(b=e.target.closest("[data-h]")){const[q,r]=b.dataset.h.split(",").map(Number);trainClick(q,r)}};
tc.onchange=e=>{const b=e.target.closest("[data-chapter]");if(b)openChapter(+b.value)};
tb.onclick=()=>{showTab("Goal");tut.className=""};tx.onclick=()=>tut.className="hide";
 window.showTab=showTab;
 return true;
}).catch(error=>{
 console.error("Could not load Hexfall lessons.",error);
 document.getElementById("tc").textContent="Training lessons could not be loaded.";
 return false;
});
