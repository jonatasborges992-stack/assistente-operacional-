/* OPERA ONE V9.1 — carrega o motor e a interface única com versão nova */
(function(){'use strict';
function load(src,next){var s=document.createElement('script');s.src=src;s.onload=next;s.onerror=function(){console.error('OPERA ONE: módulo não carregado',src);if(next)next()};document.head.appendChild(s)}
load('opera-fix-v5.js?v=9.1.0',function(){window.OPERA_AI_READY=true;load('voice-controller-v8.js?v=9.1.0')});
})();
