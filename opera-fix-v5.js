/* OPERA ONE V8.2.3 — loader seguro + auditoria */
(function(){'use strict';var f=['opera-intelligence-core.js','opera-intelligence-entities.js','opera-intelligence-parser.js','opera-intelligence-ui.js','opera-intelligence-tests.js'];function n(i){if(i>=f.length)return;var s=document.createElement('script');s.src=f[i]+'?v=8.2.3';s.onload=function(){n(i+1)};document.head.appendChild(s)}n(0)})();
