/* OPERA ONE — Service Worker protegido
   Regra: o SW nunca injeta HTML/scripts nem executa versões antigas.
   Ele somente faz cache/rede dos arquivos declarados pela versão ativa. */
const APP_VERSION='11.0.7';
const CACHE=`opera-one-${APP_VERSION}`;
const CORE=['./app.html','./index.html','./opera-one-v11.html','./manifest.webmanifest','./icon.svg','./ai-interpreter.js','./opera-ai-bridge.js'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>response).catch(()=>caches.match(event.request).then(cached=>cached||new Response('Offline',{status:503}))))});
self.addEventListener('message',event=>{if(event.data?.type==='OPERA_CLEAR_OLD_CACHES')event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))))});
