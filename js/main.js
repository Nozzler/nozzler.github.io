const home=document.getElementById("home");
const gameScreen=document.getElementById("game-screen");
const showGame=()=>{home.classList.add("hide");gameScreen.classList.remove("hide");document.body.classList.add("in-game");window.scrollTo(0,0)};
const homeMode=document.getElementById("home-mode");
const homeModeDescription=document.getElementById("home-mode-description");

homeMode.innerHTML=Object.entries(MODES).map(([id,details])=>
 `<option value="${id}">${id==="skirmish"?"Skirmish · Beginner":details.n}</option>`
).join("");
homeMode.value="skirmish";
homeModeDescription.textContent=MODES[homeMode.value].d;
homeMode.addEventListener("change",()=>{
 homeModeDescription.textContent=MODES[homeMode.value].d;
});
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

document.getElementById("start-guided").onclick=()=>startGame(true,true);
document.getElementById("start-ai").onclick=()=>startGame(true,false);
document.getElementById("start-local").onclick=()=>startGame(false,false);
document.getElementById("start-online").onclick=()=>{
 showGame();
 mode=MODES[homeMode.value]?homeMode.value:"skirmish";
 syncMode();
 coachEnabled=false;
 updateCoachButton();
 setAI(true);
 modal.className="hide";
 olp.classList.remove("hide");
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
 home.classList.remove("hide");
 document.body.classList.remove("in-game");
 window.scrollTo(0,0);
};
document.getElementById("sidebar-learn").onclick=openLearning;
document.getElementById("coach-toggle").onclick=()=>{
 coachEnabled=!coachEnabled;
 updateCoachButton();
 if(board)draw();
};
