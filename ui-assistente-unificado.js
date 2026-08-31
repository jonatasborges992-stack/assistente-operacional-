/* OPERA ONE V14 — carregamento determinístico do motor + interface única */
(function(){'use strict';
const base='?v=14.0.0';
const files=['opera-intelligence-core.js','opera-intelligence-entities.js','opera-intelligence-parser-v10.js','opera-intelligence-ui.js','opera-main-assistant.js','opera-intelligence-tests.js','opera-route-voice-v12.js'];
function load(i){if(i>=files.length){window.OPERA_AI_READY=true;window.OPERA_VOICE_READY=true;cleanup();return;}const s=document.createElement('script');s.src=files[i]+base;s.onload=()=>load(i+1);s.onerror=()=>{console.warn('OPERA ONE: módulo não carregado',files[i]);load(i+1)};document.head.appendChild(s)}
function cleanup(){
 const css=document.createElement('style');css.textContent='.more-tools .tools-wrap>main>section.card:first-child{display:none!important}#operaVoicePanel,#voiceV9,#voiceV8{display:none!important}.assist-home .assist-command{display:flex!important;flex-direction:column!important}.assist-home .assist-command textarea{width:100%!important}.assist-home .assist-command>button{display:none!important}.opera-main-voice-btn{width:100%!important;min-height:56px!important;font-size:18px!important;margin-top:8px!important}';document.head.appendChild(css);
 const old=document.querySelector('.more-tools .tools-wrap>main>section.card:first-child');if(old)old.style.display='none';
 const quick=document.querySelector('.quick-actions button');if(quick){quick.textContent='🚛 Lançar frete';quick.onclick=()=>{const f=document.getElementById('v16Command');if(f){f.focus();f.scrollIntoView({behavior:'smooth',block:'center')}}}};
 setTimeout(()=>{const b=document.getElementById('operaMainVoiceBtn');if(b)b.setAttribute('aria-label','Falar lançamento por áudio');},100);
}
if(!window.__OPERA_V14_BOOT){window.__OPERA_V14_BOOT=true;if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>load(0));else load(0)}
})();
