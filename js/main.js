const home=document.getElementById("home");
const gameScreen=document.getElementById("game-screen");
const onlineScreen=document.getElementById("online-screen");
const showHome=()=>{home.classList.remove("hide");onlineScreen.classList.add("hide");gameScreen.classList.add("hide");document.body.classList.remove("in-game");window.scrollTo(0,0)};
const showOnlinePage=()=>{home.classList.add("hide");gameScreen.classList.add("hide");onlineScreen.classList.remove("hide");document.body.classList.remove("in-game");document.getElementById("lobby-board-label").textContent=MODES[mode]?.n||MODES[homeMode.value]?.n||"Skirmish";document.getElementById("online-back").textContent=online?"← Back to match":"← Menu";if(online&&net){renderLobbyRoster(roster().list);ostat(net.started?"Match in progress. Return to the board when ready.":"Waiting for the other seat…")}window.scrollTo(0,0)};
const showGame=()=>{home.classList.add("hide");onlineScreen.classList.add("hide");gameScreen.classList.remove("hide");document.body.classList.add("in-game");window.scrollTo(0,0)};
window.showGame=showGame;
window.showOnlinePage=showOnlinePage;
const homeMode=document.getElementById("home-mode");
const homeModeDescription=document.getElementById("home-mode-description");

homeMode.innerHTML=Object.entries(MODES).map(([id,details])=>
 `<option value="${id}">${id==="skirmish"?"Skirmish · Beginner":details.n}</option>`
).join("");
homeMode.value="skirmish";
const startGuidedButton=document.getElementById("start-guided");
const startAIButton=document.getElementById("start-ai");
const startLocalLabel=document.getElementById("start-local-label");
const startLocalDescription=document.getElementById("start-local-description");
const startOnlineButton=document.getElementById("start-online");
function updateHomeBoardOptions(){
 const details=MODES[homeMode.value];
 homeModeDescription.textContent=details.d;
 startGuidedButton.disabled=false;startAIButton.disabled=false;startOnlineButton.disabled=false;
 startLocalLabel.textContent="Two players";
 startLocalDescription.textContent="Share the board on one screen";
}
updateHomeBoardOptions();
function updateHomeTraining(){
 let saved={};
 try{saved=JSON.parse(localStorage.getItem("hf_training")||"{}")}catch(error){}
 const done=new Set(Array.isArray(saved.done)?saved.done.filter(id=>Number.isInteger(id)&&id>=0&&id<1000):[]);
 const next=Array.from({length:1000},(_,id)=>id).find(id=>!done.has(id))??0;
 const current=Number.isInteger(saved.current)&&saved.current>=0&&saved.current<1000?saved.current:next;
 document.getElementById("home-training-title").textContent=done.size?`Continue lesson ${current+1}`:"Start your first lesson";
 document.getElementById("home-training-detail").textContent=`${done.size.toLocaleString()} of 1,000 lessons complete`;
 document.getElementById("home-training-fill").style.width=`${done.size/10}%`;
 document.getElementById("home-training-label").textContent=done.size?"Continue training":"Open training";
}
window.updateHomeTraining=updateHomeTraining;
updateHomeTraining();
homeMode.addEventListener("change",updateHomeBoardOptions);
const aiStyleSelect=document.getElementById("ai-style");
try{aiStyle=localStorage.getItem("hf_ai_style")||"balanced"}catch(error){}
if(!AI_STYLES[aiStyle])aiStyle="balanced";
aiStyleSelect.value=aiStyle;
aiStyleSelect.addEventListener("change",()=>{
 aiStyle=AI_STYLES[aiStyleSelect.value]?aiStyleSelect.value:"balanced";
 try{localStorage.setItem("hf_ai_style",aiStyle)}catch(error){}
});

function startGame(ai,coach){
 showGame();
 mode=MODES[homeMode.value]?homeMode.value:"skirmish";
 syncMode();
 coachEnabled=coach;
 updateCoachButton();
 setAI(ai);
}
document.getElementById("home-training-action").onclick=async()=>{
 if(!await window.HexfallTrainingReady)return;
 showTab("Train");
 tut.classList.remove("hide");
};
document.getElementById("online-back").onclick=()=>online?showGame():showHome();
document.getElementById("ob").onclick=showOnlinePage;

document.getElementById("start-guided").onclick=()=>startGame(true,true);
document.getElementById("start-ai").onclick=()=>startGame(true,false);
document.getElementById("start-local").onclick=()=>startGame(false,false);
startOnlineButton.onclick=()=>{
 mode=MODES[homeMode.value]?homeMode.value:"skirmish";
 syncMode();
 showOnlinePage();
};
const openLearning=async()=>{
 if(!await window.HexfallTrainingReady)return;
 showTab("Goal");
 tut.classList.remove("hide");
};
document.getElementById("home-learn").onclick=openLearning;
document.getElementById("back-home").onclick=()=>{
 clearAITimer();
 if(online)leaveLobby();
 modal.className="hide";
 gameScreen.classList.add("hide");
 onlineScreen.classList.add("hide");
 home.classList.remove("hide");
 updateHomeTraining();
 document.body.classList.remove("in-game");
 window.scrollTo(0,0);
};
document.getElementById("sidebar-learn").onclick=openLearning;
document.getElementById("coach-toggle").onclick=()=>{
 coachEnabled=!coachEnabled;
 updateCoachButton();
 if(board)draw();
};
