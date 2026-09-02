/* OPERA ONE V10.2 — final launcher: somente o Assistente Principal */
(function(){'use strict';
  function loadMain(){
    if(document.getElementById('opera-main-assistant-v102'))return;
    const s=document.createElement('script');
    s.id='opera-main-assistant-v102';
    s.src='./opera-main-assistant.js?v=10.2.0';
    s.defer=true;
    s.onerror=()=>console.error('OPERA ONE: Assistente Principal não carregou');
    document.head.appendChild(s);
  }
  function boot(){loadMain();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  setTimeout(boot,500);setTimeout(boot,1500);setTimeout(boot,3000);
})();