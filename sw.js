/* Nozzler service worker: receives push messages and opens the right page when tapped. Deliberately no caching, so updates are never stale. */
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("push",e=>{
  let d={};try{d=e.data.json()}catch(_){d={body:e.data?e.data.text():""}}
  e.waitUntil(self.registration.showNotification(d.title||"Nozzler",{
    body:d.body||"",icon:"assets/icon-192.png",badge:"assets/icon-192.png",tag:d.tag||undefined,renotify:!!d.tag,data:{url:d.url||""}}));
});
self.addEventListener("notificationclick",e=>{
  e.notification.close();
  const url=new URL((e.notification.data&&e.notification.data.url)||"",self.registration.scope).href;
  e.waitUntil((async()=>{
    const all=await self.clients.matchAll({type:"window",includeUncontrolled:true});
    const same=all.find(c=>c.url.split("#")[0]==url.split("#")[0]);
    if(same){try{await same.navigate(url)}catch(_){}return same.focus()}
    return self.clients.openWindow(url);
  })());
});
