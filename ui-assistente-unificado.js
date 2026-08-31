/* OPERA ONE V9.3.0 — uma única entrada: áudio + digitação + interpretação */
(function(){'use strict';
function load(src,next){var s=document.createElement('script');s.src=src;s.onload=function(){if(next)next()};s.onerror=function(){console.error('OPERA ONE: módulo não carregado',src);if(next)next()};document.head.appendChild(s)}
load('opera-fix-v5.js?v=9.3.0',function(){window.OPERA_AI_READY=true;load('opera-main-assistant.js?v=9.3.0',function(){window.OPERA_VOICE_READY=true})});
})();
