/* OPERA ONE UI CLEANUP V2 — uma única área de lançamento, sem controles antigos/duplicados */
(function(){'use strict';
function cleanDuplicateVoiceUI(){
  const home=document.querySelector('.assist-home');
  if(!home)return;
  /* O index.html ainda possui um patch legado que cria #opera-root-v15-ui.
     Ele é removido aqui para que somente o Assistente Principal controle áudio. */
  home.querySelectorAll('#opera-root-v15-ui,#operaRootVoiceStatus,#voiceV9,#operaVoicePanel,#voiceV8,.opera-old-voice-panel').forEach(e=>e.remove());
  /* Remove o antigo Assistente Inteligente que ficava dentro de Mais ferramentas. */
  home.parentElement?.querySelectorAll('.more-tools .card').forEach(c=>{const h=c.querySelector('h2');if(h&&/assistente inteligente/i.test(h.textContent||''))c.remove()});
  /* Mantém somente UM conjunto de controles do Assistente Principal. */
  const tools=home.querySelectorAll('.opera-main-input-tools');
  tools.forEach((e,i)=>{if(i>0)e.remove()});
  const statuses=home.querySelectorAll('#operaMainVoiceStatus');
  statuses.forEach((e,i)=>{if(i>0)e.remove()});
  /* Se o controlador principal ainda não criou o conjunto, não cria uma segunda interface.
     O controlador principal é a fonte oficial dos botões e do áudio. */
}
function boot(){cleanDuplicateVoiceUI();[250,700,1500,3000,5000].forEach(t=>setTimeout(cleanDuplicateVoiceUI,t))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
