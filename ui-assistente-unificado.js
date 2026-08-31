/* OPERA ONE V16.3 — lançamento único: somente 1 botão de áudio + confirmação */
(function(){'use strict';
const base='?v=16.3.0';
const files=['opera-intelligence-core.js','opera-intelligence-entities.js','opera-intelligence-parser-v10.js','opera-intelligence-ui.js','opera-intelligence-tests.js','opera-main-assistant.js'];
function load(i){if(i>=files.length){window.OPERA_AI_READY=true;window.OPERA_VOICE_READY=true;setTimeout(cleanupAndInstall,0);setTimeout(cleanupAndInstall,500);setTimeout(cleanupAndInstall,1500);return}const s=document.createElement('script');s.src=files[i]+base;s.onload=()=>load(i+1);s.onerror=()=>{console.warn('OPERA ONE: módulo não carregado',files[i]);load(i+1)}}
function cleanupAndInstall(){
  /* Remove todas as interfaces antigas/duplicadas do Assistente. */
  document.querySelectorAll('#voiceV9,#voiceV8,#operaVoicePanel,#opera-main-v932-style,#opera-root-v15-ui,#voiceBtn,#voiceStatus,#operaMainVoiceStatus,#operaMainVoiceBtn,#operaMainTypeBtn,#operaMainPauseBtn,#operaMainCorrectBtn,#operaMainClearBtn,#operaMainDoneBtn,.opera-main-input-tools').forEach(e=>e.remove());
  document.querySelectorAll('.more-tools .tools-wrap>main>section.card').forEach(c=>{const h=c.querySelector('h2');if(h&&/assistente inteligente/i.test(h.textContent||''))c.remove()});
  const cmd=document.querySelector('.assist-home .assist-command');
  const field=document.getElementById('v16Command');
  if(!cmd||!field)return;
  if(document.getElementById('operaSingleAudioBtn'))return;
  const resolver=cmd.querySelector('button');
  if(resolver){resolver.textContent='Resolver';resolver.type='button';resolver.onclick=()=>{if(typeof window.v16HandleCommand==='function')window.v16HandleCommand();else if(typeof window.operaMainResolve==='function')window.operaMainResolve()};}
  const audio=document.createElement('button');audio.id='operaSingleAudioBtn';audio.type='button';audio.className='green';audio.style.cssText='width:100%;min-height:58px;margin-top:9px;font-size:17px;font-weight:800;border-radius:14px';audio.textContent='🎙️ Falar';
  cmd.appendChild(audio);
  const st=document.createElement('div');st.id='operaSingleAudioStatus';st.className='muted';st.style.cssText='margin-top:7px;line-height:1.4';st.textContent='🎙️ Fale normalmente. Você pode fazer pausas; o texto não será apagado.';cmd.after(st);
  const css=document.createElement('style');css.id='opera-one-v163-style';css.textContent='.assist-home .assist-command{display:flex;flex-direction:column;gap:0}.assist-home .assist-command textarea{width:100%;min-height:90px}.assist-home .assist-command>button:not(#operaSingleAudioBtn){width:100%;min-height:58px}.assist-home .quick-actions{margin-top:12px}.more-tools .tools-wrap>main>section.card.opera-duplicate{display:none!important}';document.head.appendChild(css);
  let rec=null,listening=false,manualStop=false,baseText='';
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  function sync(){audio.textContent=listening?'⏹️ Parar e interpretar':'🎙️ Falar';audio.style.background=listening?'#b42318':'';}
  function status(t){st.textContent=t}
  function finish(){if(!field.value.trim()){status('⚠️ Fale ou digite um lançamento antes de resolver.');sync();return}if(typeof window.v16HandleCommand==='function')window.v16HandleCommand();else if(typeof window.operaMainResolve==='function')window.operaMainResolve();setTimeout(()=>document.getElementById('v16Response')?.scrollIntoView({behavior:'smooth',block:'center'}),250);sync()}
  function start(){
    if(!SR){status('⚠️ O áudio não está disponível neste navegador. Digite diretamente no campo acima e toque em Resolver.');field.focus();return}
    if(listening){manualStop=true;listening=false;try{rec&&rec.stop()}catch(e){}status('🧠 Interpretando o lançamento…');finish();return}
    manualStop=false;baseText=field.value.trim();rec=new SR();rec.lang='pt-BR';rec.continuous=true;rec.interimResults=true;rec.maxAlternatives=3;listening=true;sync();status('🟢 Ouvindo… faça pausas à vontade. Quando terminar, toque novamente em Parar e interpretar.');
    rec.onresult=e=>{let t=baseText;for(let i=e.resultIndex;i<e.results.length;i++)t=(t+' '+(e.results[i][0]?.transcript||'')).replace(/\s+/g,' ').trim();field.value=t};
    rec.onerror=e=>{if(manualStop||e.error==='aborted')return;status('🟡 Houve uma interrupção no áudio. O texto reconhecido foi preservado; continue falando.');};
    rec.onend=()=>{if(!manualStop&&listening){setTimeout(()=>{try{rec.start()}catch(e){}},350)}};
    try{rec.start()}catch(e){listening=false;status('⚠️ Não foi possível iniciar o microfone.');sync()}
  }
  audio.onclick=start;sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>load(0));else load(0);
})();
