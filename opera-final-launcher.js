/* OPERA ONE V10.1 — ÁUDIO NA ENTRADA PRINCIPAL + CONTROLE ÚNICO + LIMPEZA DE DUPLICADOS */
(function(){'use strict';
function cleanupDuplicates(){
  // Remove definitivamente os controles antigos que estavam duplicando a entrada principal.
  document.querySelectorAll('#voiceV9,#voiceV8,#operaVoicePanel,#operaPrimaryAudio,#operaMainVoiceBtn,#voiceBtn,.opera-main-input-tools,#opera-root-v15-ui,#operaRootVoiceStatus').forEach(e=>e.remove());
  // Remove o cartão antigo de Assistente Inteligente que ficava em "Mais ferramentas".
  document.querySelectorAll('.more-tools .card').forEach(c=>{
    const h=c.querySelector('h2');
    if(h&&/assistente inteligente/i.test(h.textContent||''))c.remove();
  });
}
function boot(){
 cleanupDuplicates();
 const field=document.getElementById('v16Command'),cmd=document.querySelector('.assist-home .assist-command');
 if(!field||!cmd){setTimeout(boot,300);return}
 if(document.getElementById('operaFinalAudioBtn'))return;
 const wrap=document.createElement('div');wrap.id='operaFinalAudio';wrap.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:9px';
 wrap.innerHTML='<button id="operaFinalAudioBtn" type="button" class="green" style="min-height:54px;font-size:17px;font-weight:800">🎙️ Falar</button><button id="operaFinalTypeBtn" type="button" class="secondary" style="min-height:54px;font-size:17px;font-weight:800">⌨️ Digitar</button><button id="operaFinalPauseBtn" type="button" class="secondary" disabled style="min-height:50px">⏸️ Pausar</button><button id="operaFinalClearBtn" type="button" class="danger" disabled style="min-height:50px">🗑️ Apagar tudo</button>';
 cmd.after(wrap);
 const status=document.createElement('div');status.id='operaFinalAudioStatus';status.className='muted';status.style.cssText='margin-top:7px;line-height:1.4';status.textContent='🎙️ Fale normalmente. Você pode fazer pausas e corrigir pelo teclado.';wrap.after(status);
 let rec=null,active=false,shouldRestart=false,finalText='',interim='';
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 const setStatus=t=>status.textContent=t;
 const sync=()=>{const has=!!field.value.trim();document.getElementById('operaFinalAudioBtn').textContent=active?'⏹️ Terminar':'🎙️ Falar';document.getElementById('operaFinalPauseBtn').disabled=!has;document.getElementById('operaFinalClearBtn').disabled=!has};
 function start(){
  if(!SR){setStatus('⚠️ Áudio não disponível neste navegador. Use ⌨️ Digitar.');field.focus();return}
  if(active)return;
  shouldRestart=true;finalText=field.value.trim();interim='';rec=new SR();rec.lang='pt-BR';rec.continuous=true;rec.interimResults=true;rec.maxAlternatives=3;active=true;sync();setStatus('🟢 Ouvindo… faça pausas à vontade. O texto já reconhecido será preservado.');
  rec.onresult=e=>{let temp=finalText;for(let i=e.resultIndex;i<e.results.length;i++){const r=e.results[i],t=(r[0]?.transcript||'').trim();if(r.isFinal)finalText=(finalText+' '+t).replace(/\s+/g,' ').trim();else temp=(temp+' '+t).replace(/\s+/g,' ').trim()}interim=temp===finalText?'':temp.slice(finalText.length).trim();field.value=(finalText+' '+interim).replace(/\s+/g,' ').trim();field.dispatchEvent(new Event('input',{bubbles:true}));sync()};
  rec.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed'){shouldRestart=false;active=false;sync();setStatus('⚠️ Permissão do microfone bloqueada. Texto preservado.')}else if(e.error!=='aborted')setStatus('🟡 Interrupção do áudio. Texto preservado; continue falando.')};
  rec.onend=()=>{if(active&&shouldRestart)setTimeout(()=>{try{rec.start()}catch(_){ }},450)};
  try{rec.start()}catch(e){active=false;shouldRestart=false;sync();setStatus('⚠️ Não foi possível iniciar o microfone. Tente novamente.')}
 }
 function stop(pauseOnly){shouldRestart=false;active=false;try{rec?.stop()}catch(_){}field.value=(finalText||field.value).replace(/\s+/g,' ').trim();field.dispatchEvent(new Event('input',{bubbles:true}));sync();if(pauseOnly)setStatus('⏸️ Pausado. Texto preservado. Toque em 🎙️ Falar para continuar.');else{setStatus('🧠 Interpretando o lançamento…');setTimeout(()=>{if(typeof window.v16HandleCommand==='function')window.v16HandleCommand();},50)}}
 document.getElementById('operaFinalAudioBtn').onclick=()=>active?stop(false):start();
 document.getElementById('operaFinalTypeBtn').onclick=()=>{if(active)stop(true);field.focus();setStatus('⌨️ Digitação ativa. Corrija o texto diretamente e depois toque em Resolver.')};
 document.getElementById('operaFinalPauseBtn').onclick=()=>stop(true);
 document.getElementById('operaFinalClearBtn').onclick=()=>{shouldRestart=false;active=false;try{rec?.abort()}catch(_){}finalText='';interim='';field.value='';field.dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('v16Response').innerHTML='';setStatus('🗑️ Lançamento apagado.');sync()};
 sync();
 new MutationObserver(()=>{cleanupDuplicates();if(!document.getElementById('operaFinalAudioBtn'))boot()}).observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,700));else setTimeout(boot,700);
// O patch antigo tinha timers próprios; esta limpeza periódica impede que ele volte a aparecer.
setInterval(cleanupDuplicates,600);
})();