/* OPERA ONE V10.2 — controlador único do lançamento principal */
(function(){'use strict';
  const files=['opera-intelligence-core.js','opera-intelligence-entities.js','opera-intelligence-parser-v10.js','opera-intelligence-ui.js','opera-intelligence-tests.js','opera-main-assistant.js','opera-ui-cleanup-v1.js'];
  function load(i){
    if(i>=files.length){window.OPERA_AI_READY=true;window.OPERA_VOICE_READY=true;window.OPERA_MAIN_ASSISTANT_READY=true;return;}
    const selector='script[data-opera-module="'+files[i]+'"]';
    if(document.querySelector(selector)){load(i+1);return;}
    const s=document.createElement('script');s.src=files[i]+'?v=10.2.0';s.dataset.operaModule=files[i];s.onload=()=>load(i+1);s.onerror=()=>{console.warn('OPERA ONE: módulo não carregado',files[i]);load(i+1)};document.head.appendChild(s);
  }
  function boot(){
    /* O áudio é responsabilidade exclusiva do Assistente Principal. O controlador antigo
       voice-controller-v8 NÃO é carregado, evitando que ele substitua a interface e esconda
       o botão Falar da entrada principal. */
    load(0);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  setTimeout(boot,500);setTimeout(boot,1500);setTimeout(boot,3000);
})();
