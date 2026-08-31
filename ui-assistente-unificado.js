/* OPERA ONE V13 — carregamento único, sem módulos de áudio duplicados */
(function(){'use strict';
function load(src,next){var s=document.createElement('script');s.src=src;s.onload=function(){next&&next()};s.onerror=function(){console.error('OPERA ONE: módulo não carregado',src);next&&next()};document.head.appendChild(s)}
load('opera-fix-v5.js?v=13.0.0',function(){window.OPERA_AI_READY=true;window.OPERA_VOICE_READY=true});
})();
