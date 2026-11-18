/* Web Push for shop and admin. Needs APP_CONFIG.VAPID_PUBLIC_KEY, the service worker (../sw.js) and supabase/push.sql.
   Push.ui(textEl, buttonEl, supabaseClient) wires a ready-made on/off switch. */
(()=>{const C=window.APP_CONFIG||{};
const supported=()=>"serviceWorker"in navigator&&"PushManager"in window&&"Notification"in window;
const standalone=()=>matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
const ios=()=>/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform=="MacIntel"&&navigator.maxTouchPoints>1);
const key=s=>{const p="=".repeat((4-s.length%4)%4),r=atob((s+p).replace(/-/g,"+").replace(/_/g,"/"));return Uint8Array.from(r,c=>c.charCodeAt(0))};
const reg=()=>navigator.serviceWorker.register("../sw.js").then(()=>navigator.serviceWorker.ready);
if("serviceWorker"in navigator)addEventListener("load",()=>reg().catch(()=>{}));
async function status(){
  if(!supported())return ios()&&!standalone()?"ios-install":"unsupported";
  if(!C.VAPID_PUBLIC_KEY)return"unsupported";
  if(Notification.permission=="denied")return"denied";
  try{const r=await reg(),s=await r.pushManager.getSubscription();return s&&Notification.permission=="granted"?"on":"off"}catch(e){return"off"}}
async function enable(sb){
  if(await Notification.requestPermission()!="granted")throw new Error("Permission was not given.");
  const r=await reg();let s=await r.pushManager.getSubscription();
  if(!s)s=await r.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key(C.VAPID_PUBLIC_KEY)});
  const j=s.toJSON(),x=await sb.rpc("save_push_subscription",{p_endpoint:j.endpoint,p_p256dh:j.keys.p256dh,p_auth:j.keys.auth,p_ua:navigator.userAgent.slice(0,200)});
  if(x.error)throw new Error(x.error.message+" (did you run supabase/push.sql?)");}
async function disable(sb){
  const r=await reg(),s=await r.pushManager.getSubscription();
  if(s){await sb.rpc("remove_push_subscription",{p_endpoint:s.endpoint});await s.unsubscribe()}}
async function ui(m,b,sb){
  const s=await status(),T={unsupported:["This browser can’t receive push notifications.",""],
   "ios-install":["On iPhone: tap Share, then “Add to Home Screen”, open Nozzler from the Home Screen and come back here.",""],
   denied:["Notifications are blocked. Allow them for this site in your phone or browser settings.",""],
   off:["Get a message on this phone when something changes.","Turn on notifications"],on:["Notifications are on for this device.","Turn off"]}[s];
  m.textContent=T[0];if(!T[1]){b.style.display="none";return}b.style.display="";b.textContent=T[1];
  b.onclick=async()=>{b.disabled=true;let err="";try{s=="on"?await disable(sb):await enable(sb)}catch(e){err=e.message||String(e)}b.disabled=false;await ui(m,b,sb);if(err)m.textContent=err}}
window.Push={supported,status,enable,disable,ui};
})();
