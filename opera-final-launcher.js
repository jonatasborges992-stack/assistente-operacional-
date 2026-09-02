/* OPERA ONE V10.1.2 — final launcher: somente garante a interface principal */
(function(){'use strict';
  function loadMain(){
    if(document.getElementById('opera-main-assistant-v1012'))return;
    const s=document.createElement('script');
    s.id='opera-main-assistant-v1012';
    s.src='./opera-main-assistant.js?v=10.1.2';
    s.defer=true;
    s.onerror=()=>console.error('OPERA ONE: Assistente Principal não carregou');
    document.head.appendChild(s);
  }
  function boot(){loadMain();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  setTimeout(boot,500);setTimeout(boot,1500);setTimeout(boot,3000);
})();
