/* OPERA ONE V9.4 — carregador único. NÃO cria controles duplicados. */
(function(){'use strict';
  const version='9.4.0';
  const files=[
    'opera-intelligence-core.js',
    'opera-intelligence-entities.js',
    'opera-intelligence-parser-v10.js',
    'opera-intelligence-ui.js',
    'opera-intelligence-tests.js',
    'opera-main-assistant.js'
  ];
  function load(i){
    if(i>=files.length){
      window.OPERA_AI_READY=true;
      window.OPERA_VOICE_READY=true;
      return;
    }
    if(document.querySelector('script[data-opera-module="'+files[i]+'"]')){load(i+1);return;}
    const s=document.createElement('script');
    s.src=files[i]+'?v='+version;
    s.dataset.operaModule=files[i];
    s.onload=function(){load(i+1)};
    s.onerror=function(){console.warn('OPERA ONE: módulo não carregado',files[i]);load(i+1)};
    document.head.appendChild(s);
  }
  /*
    REGRA DEFINITIVA:
    a interface principal é criada SOMENTE pelo opera-main-assistant.js.
    Este arquivo apenas carrega os módulos. Não cria botão Falar,
    não remove controles e não injeta uma segunda interface.
  */
  function boot(){load(0)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
