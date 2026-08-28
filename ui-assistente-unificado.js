/* OPERA ONE V9.2.3 — carrega o motor corrigido e depois o controlador de áudio */
(function(){'use strict';
function load(src,next){var s=document.createElement('script');s.src=src;s.onload=next;s.onerror=function(){console.error('OPERA ONE: módulo não carregado',src);if(next)next()};document.head.appendChild(s)}
load('opera-fix-v5.js?v=9.2.3',function(){window.OPERA_AI_READY=true;load('voice-controller-v8.js?v=9.2.3',function(){window.OPERA_VOICE_READY=true})});
})();
