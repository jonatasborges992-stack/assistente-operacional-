/* OPERA ONE — Voz + Assistente Inteligente V6
   Entrada única na primeira tela: teclado e voz usam o mesmo Assistente Inteligente.
   O botão principal da primeira tela também usa o mesmo interpretador.
*/
(function(){
'use strict';
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const KEY='opera_one_voice_unified_v6';
let rec=null,state='idle',finalText='',interim='',timer=null,userStop=false;
const input=()=>document.getElementById('v16Command');
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
function style(d){if(d.getElementById('operaVoiceUnifiedStyle'))return;const s=d.createElement('style');s.id='operaVoiceUnifiedStyle';s.textContent=`
#operaVoicePanel{margin-top:12px;padding:14px;border:1px solid #d8e4f0;border-radius:18px;background:linear-gradient(180deg,#fff,#f6f9fd);box-shadow:0 8px 24px rgba(15,35,60,.08)}
#operaVoiceStatus{margin:0 0 10px;color:#526477;font-size:13px;line-height:1.45;font-weight:700}#operaVoiceStatus.live{color:#087a45}
#operaVoiceLive{display:none;margin:9px 0;padding:10px 12px;border-radius:12px;background:#eefaf3;border:1px solid #c9ead6;color:#166534;font-size:12px;font-weight:800}#operaVoiceLive.show{display:block}
.opv-grid{display:grid;grid-template-columns:1.3fr 1fr 1fr 1fr;gap:8px}.opv{border:0!important;border-radius:12px!important;padding:12px 8px!important;font-weight:800!important;min-height:44px!important}.opv-main{background:linear-gradient(135deg,#118cff,#14c8ed)!important;color:#fff!important}.opv-dark{background:#142238!important;color:#fff!important}.opv-soft{background:#edf2f7!important;color:#17202a!important}.opv-danger{background:#b42318!important;color:#fff!important}.opv:disabled{opacity:.42!important}
#operaVoiceHelp{margin-top:9px;color:#64748b;font-size:12px;line-height:1.4}@media(max-width:680px){.opv-grid{grid-template-columns:1fr 1fr}.opv-main,.opv-dark{grid-column:span 2}}
`;d.head.appendChild(s)}
function unify(d){
 const home=d.querySelector('.assist-home');
 if(home){const h=home.querySelector('.assist-hero h2'),p=home.querySelector('.assist-hero p');if(h)h.textContent='🧠 Assistente Inteligente';if(p)p.textContent='Fale ou digite o que aconteceu. O Assistente interpreta, calcula os custos, mostra o lucro e prepara o lançamento.'}
 [...d.querySelectorAll('section.card')].forEach(card=>{const h=card.querySelector('h2');if(h&&/assistente inteligente/i.test(clean(h.textContent))){card.style.display='none'}});
 [...d.querySelectorAll('button')].forEach(b=>{const t=clean(b.textContent).toLowerCase();if(['falar','🎙️ falar','🎤 falar'].includes(t)&&!b.dataset.operaVoice){b.style.display='none';b.dataset.operaOld='1'}})
}
function save(){try{sessionStorage.setItem(KEY,JSON.stringify({text:clean(finalText),state}))}catch(e){}}
function load(){try{const x=JSON.parse(sessionStorage.getItem(KEY)||'null');if(x&&x.text){finalText=clean(x.text);state='paused'}}catch(e){}}
function sendToAssistant(text){
 const smart=document.getElementById('smartText');if(!smart)return false;
 smart.value=clean(text);
 if(typeof window.interpretSmart==='function'){try{window.interpretSmart();return true}catch(e){console.error(e)}}
 return false;
}
function analyzeUnified(){
 const el=input();if(!el)return;
 const text=clean(el.value);if(!text)return;
 sendToAssistant(text);
 const tools=document.querySelector('.more-tools');if(tools)tools.setAttribute('open','');
 setTimeout(()=>document.getElementById('smartResult')?.scrollIntoView({behavior:'smooth',block:'center'}),80);
}
function build(d){
 const el=input();if(!el)return false;unify(d);if(d.getElementById('operaVoicePanel')){window.v16HandleCommand=analyzeUnified;return true}style(d);
 const command=el.parentElement;
 const resolver=command?.querySelector('button');
 if(resolver){resolver.textContent='Analisar operação';resolver.className='green';resolver.onclick=analyzeUnified}
 const p=d.createElement('section');p.id='operaVoicePanel';p.innerHTML=`<p id="operaVoiceStatus">🎙️ <b>Assistente pronto.</b> Fale naturalmente ou digite seu lançamento.</p><div class="opv-grid"><button type="button" id="operaVoiceStart" class="opv opv-main">🎙️ Falar</button><button type="button" id="operaVoicePause" class="opv opv-soft" disabled>⏸️ Pausar</button><button type="button" id="operaVoiceCorrect" class="opv opv-soft" disabled>✏️ Corrigir</button><button type="button" id="operaVoiceClear" class="opv opv-danger" disabled>🗑️ Apagar tudo</button><button type="button" id="operaVoiceDone" class="opv opv-dark" disabled>✓ Concluir e analisar</button></div><div id="operaVoiceLive">🟢 <b>Ouvindo continuamente.</b> Pode fazer pausas; o texto fica protegido.</div><div id="operaVoiceHelp">✏️ <b>Uma única entrada:</b> o que você falar ou digitar aqui será enviado ao mesmo Assistente Inteligente. Não é necessário lançar o frete novamente em outra tela.</div>`;
 el.parentNode.insertBefore(p,el.nextSibling);
 const $=id=>p.querySelector('#'+id),start=$('operaVoiceStart'),pause=$('operaVoicePause'),correct=$('operaVoiceCorrect'),clear=$('operaVoiceClear'),done=$('operaVoiceDone'),status=$('operaVoiceStatus'),live=$('operaVoiceLive');
 function render(){if(state==='listening')el.value=clean(finalText+' '+interim);else if(state!=='idle')el.value=clean(finalText);const has=!!clean(el.value),listening=state==='listening';start.disabled=listening;start.textContent=listening?'🎙️ Ouvindo…':'🎙️ Falar';pause.disabled=state==='idle';pause.textContent=state==='paused'?'▶️ Continuar':'⏸️ Pausar';correct.disabled=!has;clear.disabled=!has;done.disabled=!has;live.classList.toggle('show',listening);status.classList.toggle('live',listening);if(listening)status.innerHTML='🟢 <b>Ouvindo…</b> silêncio não encerra. O texto continua protegido.';else if(state==='paused')status.innerHTML='⏸️ <b>Pausado.</b> Você pode corrigir, apagar ou continuar.';else status.innerHTML='🎙️ <b>Assistente pronto.</b> Fale naturalmente ou digite e depois analise.';save()}
 function setup(){if(!SR){status.textContent='⚠️ Reconhecimento de voz não disponível neste navegador. Use o ditado do teclado.';return false}rec=new SR();rec.lang='pt-BR';rec.continuous=true;rec.interimResults=true;rec.maxAlternatives=1;rec.onstart=()=>{state='listening';render()};rec.onresult=e=>{let t='';for(let i=e.resultIndex;i<e.results.length;i++){const r=e.results[i],x=r[0]?.transcript||'';if(r.isFinal)finalText=clean(finalText+' '+x);else t+=x+' '}interim=clean(t);render()};rec.onerror=e=>{if(userStop||e.error==='aborted')return;if(e.error==='not-allowed'||e.error==='service-not-allowed'){state='paused';render();status.textContent='⚠️ Microfone bloqueado. O texto foi preservado.';return}status.textContent='🟢 Pequena interrupção. Mantendo o texto e tentando continuar…'};rec.onend=()=>{if(userStop||state!=='listening')return;clearTimeout(timer);timer=setTimeout(()=>{if(state==='listening'&&!userStop){try{rec.start()}catch(e){try{rec.stop()}catch(_){}setTimeout(()=>{try{rec.start()}catch(_){}},500)}}},700)};return true}
 async function permission(){if(!navigator.mediaDevices?.getUserMedia)return true;try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});stream.getTracks().forEach(t=>t.stop());return true}catch(e){status.textContent='⚠️ Autorize o microfone para usar a voz. O texto não será apagado.';return false}}
 async function listen(){if(state==='paused'){finalText=clean(el.value);interim=''}if(!await permission())return;if(!rec&&!setup())return;userStop=false;clearTimeout(timer);state='listening';render();try{rec.start()}catch(e){try{rec.stop()}catch(_){}setTimeout(()=>{try{rec.start()}catch(_){}},250)}}
 function pauseSession(){finalText=clean(el.value);interim='';state='paused';userStop=true;clearTimeout(timer);try{rec?.stop()}catch(e){}render();el.focus()}
 function correctSession(){if(state==='listening')pauseSession();else{finalText=clean(el.value);el.focus()}status.innerHTML='✏️ <b>Modo correção.</b> Ajuste o texto e continue.';save()}
 function erase(){userStop=true;clearTimeout(timer);try{rec?.abort()}catch(e){}finalText='';interim='';el.value='';state='paused';try{sessionStorage.removeItem(KEY)}catch(e){}render();status.innerHTML='🗑️ <b>Tudo apagado.</b> Pode começar novamente.'}
 function finish(){finalText=clean(el.value);interim='';userStop=true;clearTimeout(timer);try{rec?.stop()}catch(e){}state='idle';el.value=finalText;try{sessionStorage.removeItem(KEY)}catch(e){}render();sendToAssistant(finalText);const tools=document.querySelector('.more-tools');if(tools)tools.setAttribute('open','');setTimeout(()=>document.getElementById('smartResult')?.scrollIntoView({behavior:'smooth',block:'center'}),80);status.innerHTML='✅ <b>Lançamento enviado ao Assistente.</b> Confira os dados antes de confirmar.'}
 el.addEventListener('input',()=>{if(state!=='listening'){finalText=clean(el.value);interim='';render()}});start.onclick=listen;pause.onclick=()=>state==='paused'?listen():pauseSession();correct.onclick=correctSession;clear.onclick=erase;done.onclick=finish;load();render();window.v16HandleCommand=analyzeUnified;return true}
function boot(){if(build(document))return;const o=new MutationObserver(()=>{if(build(document))o.disconnect()});o.observe(document.documentElement,{childList:true,subtree:true});setTimeout(()=>o.disconnect(),15000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();