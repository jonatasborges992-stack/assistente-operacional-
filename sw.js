const CACHE='opera-one-app-v936';
const APP=['./app.html','./index.html','./manifest.webmanifest','./icon.svg','./opera-one.css','./opera-ui-v5.css','./opera-fix-v5.js','./opera-main-assistant.js','./voice-controller-v4.js','./voice-controller-v8.js','./ui-assistente-unificado.js','./audio-launcher-v1.js','./opera-intelligence.js','./opera-intelligence-core.js','./opera-intelligence-entities.js','./opera-intelligence-parser.js','./opera-intelligence-ui.js','./opera-intelligence-tests.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))).then(()=>self.clients.claim())))});
async function responseWithModules(req){
  let res=await caches.match(req);
  if(!res){try{res=await fetch(req)}catch(e){res=await caches.match('./index.html')||await caches.match('./app.html')}}
  if(!res)return new Response('Offline',{status:503});
  const type=res.headers.get('content-type')||'';
  if(req.destination==='document'||type.includes('text/html')){
    let text=await res.text();
    const tags=[
      '<script src="./audio-launcher-v1.js?v=5"></script>',
      '<script src="./opera-intelligence.js?v=5"></script>',
      '<script src="./opera-intelligence-core.js?v=5"></script>',
      '<script src="./opera-intelligence-entities.js?v=5"></script>',
      '<script src="./opera-intelligence-parser.js?v=5"></script>',
      '<script src="./opera-intelligence-ui.js?v=5"></script>'
    ];
    for(const tag of tags){const file=tag.match(/src="\.\/([^?]+)/)?.[1];if(file&&!text.includes(file))text=text.replace('</body>',tag+'</body>')}
    return new Response(text,{status:res.status,headers:{'Content-Type':'text/html; charset=UTF-8'}});
  }
  return res;
}
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(responseWithModules(e.request))});
