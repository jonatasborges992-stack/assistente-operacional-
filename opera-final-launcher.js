/* OPERA ONE FINAL LAUNCHER — UMA ÚNICA ENTRADA DE ÁUDIO */
(function(){'use strict';
function boot(){
 const field=document.getElementById('v16Command'),cmd=document.querySelector('.assist-home .assist-command');
 if(!field||!cmd){setTimeout(boot,300);return}
 if(document.getElementById('operaFinalAudioBtn'))return;
 /* Remove qualquer controle/painel de voz duplicado, sem tocar no motor de interpretação. */
 document.querySelectorAll('#voiceV9,#voiceV8,#operaVoicePanel,#operaPrimaryAudio,#opera-main-v932-style,#operaMainVoiceStatus,#operaMainVoiceBtn,#operaMainTypeBtn,#operaMainPauseBtn,#operaMainCorrectBtn,#operaMainClearBtn,#operaMainDoneBtn,.opera-main-input-tools,#voiceBtn').forEach(e=>e.remove());
 document.querySelectorAll('.more-tools .card').forEach(c=>{const h=c.querySelector('h2');if(h&&/assistente inteligente/i.test(h.textContent||''))c.remove()});
 const oldResolver=cmd.querySelector('button');if(oldResolver){oldResolver.textContent='Resolver';oldResolver.onclick=()=>resolve()}
 const wrap=document.createElement('div');wrap.id='operaFinalAudio';wrap.style.cssText='margin-top:9px';
 const audio=document.createElement('button');audio.id='operaFinalAudioBtn';audio.type='button';audio.className='green';audio.textContent='🎙️ Falar';audio.style.cssText='width:100%;min-height:58px;font-size:17px;font-weight:800;border-radius:14px';
 const status=document.createElement('div');status.id='operaFinalAudioStatus';status.className='muted';status.style.cssText='margin-top:7px;line-height:1.4';status.textContent='🎙️ Fale normalmente. Faça pausas à vontade. Quando terminar, toque novamente para interpretar.';
 wrap.append(audio,status);cmd.appendChild(wrap);
 let rec=null,active=false,stopping=false,finalText='',interim='',restartTimer=null;
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 function sync(){audio.textContent=active?'⏹️ Terminar e interpretar':'🎙️ Falar';audio.style.background=active?'#b42318':''}
 function setStatus(t){status.textContent=t}
 function resolve(){
   const text=field.value.trim();if(!text){setStatus('⚠️ Fale ou digite um lançamento antes de resolver.');return}
   field.value=text;field.dispatchEvent(new Event('input',{bubbles:true}));
   if(typeof window.v16HandleCommand==='function')window.v16HandleCommand();else if(typeof window.operaMainResolve==='function')window.operaMainResolve();
   setTimeout(()=>document.getElementById('v16Response')?.scrollIntoView({behavior:'smooth',block:'center'}),350);
 }
 function start(){
   if(!SR){setStatus('⚠️ Áudio não disponível neste navegador. Use o teclado para digitar.');field.focus();return}
   if(active)return;
   stopping=false;finalText=field.value.trim();interim='';rec=new SR();rec.lang='pt-BR';rec.continuous=true;rec.interimResults=true;rec.maxAlternatives=3;active=true;sync();setStatus('🟢 Ouvindo… você pode pausar para pensar. O texto já reconhecido será preservado.');
   rec.onresult=e=>{let temp=finalText;for(let i=e.resultIndex;i<e.results.length;i++){const r=e.results[i],t=(r[0]?.transcript||'').trim();if(r.isFinal)finalText=(finalText+' '+t).replace(/\s+/g,' ').trim();else temp=(temp+' '+t).replace(/\s+/g,' ').trim()}interim=temp===finalText?'':temp.slice(finalText.length).trim();field.value=(finalText+' '+interim).replace(/\s+/g,' ').trim();field.dispatchEvent(new Event('input',{bubbles:true}))};
   rec.onerror=e=>{if(stopping||e.error==='aborted')return;if(e.error==='not-allowed'||e.error==='service-not-allowed'){active=false;sync();setStatus('⚠️ Permissão do microfone bloqueada. O texto reconhecido foi preservado.')}else setStatus('🟡 O áudio teve uma interrupção. Texto preservado; continue falando.')};
   rec.onend=()=>{if(active&&!stopping){clearTimeout(restartTimer);restartTimer=setTimeout(()=>{try{rec.start()}catch(_){ }},400)}};
   try{rec.start()}catch(e){active=false;sync();setStatus('⚠️ Não foi possível iniciar o microfone. Tente novamente.')}
 }
 function stop(){stopping=true;active=false;clearTimeout(restartTimer);try{rec?.stop()}catch(_){}field.value=(finalText||field.value).replace(/\s+/g,' ').trim();field.dispatchEvent(new Event('input',{bubbles:true}));sync();setStatus('🧠 Processando o lançamento…');resolve()}
 audio.onclick=()=>active?stop():start();
 /* Observa re-renderizações do aplicativo e reinstala somente se algum módulo antigo tentar duplicar os controles. */
 new MutationObserver(()=>{if(!document.getElementById('operaFinalAudioBtn'))boot()}).observe(document.body,{childList:true,subtree:true});
 sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1200));else setTimeout(boot,1200);
})();
