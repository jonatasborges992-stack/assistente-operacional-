/* OPERA ONE V16.2 — interface única, áudio principal obrigatório */
(function(){'use strict';
const base='?v=16.2.0';
const files=['opera-intelligence-core.js','opera-intelligence-entities.js','opera-intelligence-parser-v10.js','opera-intelligence-ui.js','opera-intelligence-tests.js','opera-main-assistant.js'];
function load(i){if(i>=files.length){window.OPERA_AI_READY=true;window.OPERA_VOICE_READY=true;cleanup();return;}const s=document.createElement('script');s.src=files[i]+base;s.onload=()=>load(i+1);s.onerror=()=>{console.warn('OPERA ONE: módulo não carregado',files[i]);load(i+1)}}
function cleanup(){
 const css=document.createElement('style');css.id='opera-one-v162-cleanup';css.textContent='.more-tools .tools-wrap>main>section.card:first-child{display:none!important}#voiceV9,#voiceV8,#operaVoicePanel,#voiceBtn,#voiceStatus,#operaPrimaryAudio,#operaPrimaryAudioBtn,#operaPrimaryAudioStatus{display:none!important}.assist-home .assist-command>button{display:none!important}.assist-home .opera-main-input-tools{display:grid!important}.assist-home .opera-main-input-tools #operaMainVoiceBtn{display:block!important;visibility:visible!important;opacity:1!important}.assist-home .opera-launch-result{display:block!important}';document.head.appendChild(css);
 const old=document.querySelector('.more-tools .tools-wrap>main>section.card:first-child');if(old)old.remove();
 document.querySelectorAll('#voiceV9,#voiceV8,#operaVoicePanel,#voiceBtn,#voiceStatus,#operaPrimaryAudio,#operaPrimaryAudioBtn,#operaPrimaryAudioStatus').forEach(e=>e.remove());
}
load(0);
})();
