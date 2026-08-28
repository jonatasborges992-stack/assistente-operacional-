/* OPERA ONE V9 — lançamento único: áudio + digitação + interpretação */
(function(){'use strict';
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
let rec=null,listening=false,userStop=false,finalText='',interim='',restartTimer=null;
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
const input=()=>document.getElementById('v16Command');
function status(t){const e=document.getElementById('voiceStatusV9');if(e)e.textContent=t}
function renameThirdParty(){document.querySelectorAll('#operaThirdPartyCard h2').forEach(h=>h.textContent='🚛 Fretes terceirizados')}
function removeOldUI(){
 document.querySelectorAll('#operaVoicePanel,#voiceV8').forEach(e=>e.remove());
 document.querySelectorAll('section.card').forEach(card=>{const h=card.querySelector('h2');if(h&&/assistente inteligente/i.test(clean(h.textContent)))card.remove()});
}
function ensureHiddenInterpreter(){
 let s=document.getElementById('smartText');if(!s){s=document.createElement('textarea');s.id='smartText';s.style.display='none';document.body.appendChild(s)}
 let r=document.getElementById('smartResult');if(!r){r=document.createElement('div');r.id='smartResult';r.style.display='none';document.body.appendChild(r)}
}
function interpret(){
 const text=clean(input()?.value);if(!text){status('⚠️ Digite ou fale o lançamento antes de concluir.');return}
 ensureHiddenInterpreter();const s=document.getElementById('smartText');s.value=text;
 if(typeof window.interpretSmart!=='function'){status('⏳ O motor inteligente ainda está carregando. Tente novamente em um instante.');setTimeout(interpret,500);return}
 try{window.interpretSmart();const r=document.getElementById('smartResult'),out=document.getElementById('v16Response');if(r&&out){out.innerHTML=r.innerHTML;out.scrollIntoView({behavior:'smooth',block:'center'})}status('✅ Interpretação pronta. Confira e corrija o texto se necessário antes de registrar.')}catch(e){console.error(e);status('⚠️ Erro ao interpretar. O texto foi preservado; corrija e tente novamente.')}
}
function render(){const f=input(),panel=document.getElementById('voiceV9');if(!f||!panel)return;const has=!!clean(f.value),live=listening;f.value=live?clean(finalText+' '+interim):clean(finalText||f.value);const start=panel.querySelector('#voiceStartV9'),pause=panel.querySelector('#voicePauseV9'),clear=panel.querySelector('#voiceClearV9'),correct=panel.querySelector('#voiceCorrectV9'),done=panel.querySelector('#voiceDoneV9');if(start){start.disabled=live;start.textContent=live?'🎙️ Ouvindo…':'🎙️ Falar'}if(pause){pause.disabled=!has;pause.textContent=listening?'⏸️ Pausar':'▶️ Continuar'}if(clear)clear.disabled=!has;if(correct)correct.disabled=!has;if(done)done.disabled=!has;if(live)status('🟢 Ouvindo… você pode fazer pausas. O texto já reconhecido fica preservado.')}
function setupRecognition(){
 if(!SR){status('⚠️ Áudio não disponível neste navegador. Use o botão ✏️ Digitar ou o ditado do teclado.');return false}
 if(rec)return true;rec=new SR();rec.lang='pt-BR';rec.continuous=true;rec.interimResults=true;rec.maxAlternatives=1;
 rec.onstart=()=>{listening=true;status('🟢 Ouvindo… fale normalmente. Pausas não apagam o texto.');render()};
 rec.onresult=e=>{let tmp='';for(let i=e.resultIndex;i<e.results.length;i++){const r=e.results[i],t=r[0]?.transcript||'';if(r.isFinal)finalText=clean(finalText+' '+t);else tmp+=t+' '}interim=clean(tmp);render()};
 rec.onerror=e=>{if(userStop||e.error==='aborted')return;if(e.error==='not-allowed'||e.error==='service-not-allowed'){listening=false;interim='';status('⚠️ Microfone bloqueado. O texto capturado foi preservado.');render()}else status('🟡 Pequena interrupção. Mantendo o texto; continue falando.')};
 rec.onend=()=>{if(!listening||userStop)return;clearTimeout(restartTimer);restartTimer=setTimeout(()=>{try{rec.start()}catch(_){ }},400)};return true
}
async function start(){if(!setupRecognition())return;userStop=false;if(!finalText)finalText=clean(input()?.value);try{rec.start()}catch(_){try{rec.stop()}catch(__){}setTimeout(()=>{try{rec.start()}catch(__){}},250)}render()}
function pause(){if(!listening){start();return}userStop=true;listening=false;interim='';finalText=clean(input()?.value);try{rec?.stop()}catch(_){}status('⏸️ Pausado. Texto preservado. Toque em ▶️ Continuar ou ✏️ Digitar para corrigir.');render();input()?.focus()}
function clearAll(){userStop=true;listening=false;interim='';finalText='';clearTimeout(restartTimer);try{rec?.abort()}catch(_){}if(input())input().value='';const out=document.getElementById('v16Response');if(out)out.innerHTML='';status('🗑️ Lançamento apagado. Pode começar novamente.');render()}
function correct(){if(listening)pause();const f=input();if(f){finalText=clean(f.value);f.focus();f.setSelectionRange(f.value.length,f.value.length)}status('✏️ Modo digitação/correção. Altere o texto e depois toque em ✓ Concluir e interpretar.');render()}
function done(){if(listening){userStop=true;listening=false;interim='';try{rec?.stop()}catch(_){}}finalText=clean(input()?.value);if(!finalText){status('⚠️ Nada para interpretar.');return}render();interpret()}
function install(){
 const home=document.querySelector('.assist-home');if(!home)return false;
 removeOldUI();renameThirdParty();ensureHiddenInterpreter();
 const old=home.querySelector('.assist-hero');if(!old)return false;
 old.innerHTML='<h2>🧠 Assistente Inteligente</h2><p>Fale ou digite normalmente. Esta é a única área de lançamento: o Assistente interpreta, calcula custos, identifica terceirização e mostra o resultado antes de salvar.</p><div class="assist-command"><textarea id="v16Command" rows="3" placeholder="Ex.: Fiz um frete para Mart Minas de BH para João Monlevade por R$ 7.000 e paguei R$ 6.500 ao terceirizado."></textarea><button id="unifiedAnalyzeV9" class="green" type="button">✓ Interpretar lançamento</button></div><div id="voiceV9" style="margin-top:12px"><div id="voiceStatusV9" style="font-size:13px;font-weight:700;margin:8px 0;color:#526477">🎙️ Assistente pronto. Você pode falar ou digitar.</div><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px"><button id="voiceStartV9" type="button" class="green">🎙️ Falar</button><button id="voiceTypeV9" type="button" class="secondary">✏️ Digitar</button><button id="voicePauseV9" type="button" class="secondary" disabled>⏸️ Pausar</button><button id="voiceCorrectV9" type="button" class="secondary" disabled>✏️ Corrigir</button><button id="voiceClearV9" type="button" class="danger" disabled>🗑️ Apagar tudo</button><button id="voiceDoneV9" type="button" disabled>✓ Concluir e interpretar</button></div><p style="font-size:12px;color:#64748b;margin:8px 0 0">Uma única entrada. Se a interpretação ficar errada, corrija o texto diretamente e interprete novamente.</p></div>';
 const f=input(),panel=document.getElementById('voiceV9');
 document.getElementById('unifiedAnalyzeV9').onclick=done;document.getElementById('voiceStartV9').onclick=start;document.getElementById('voiceTypeV9').onclick=correct;document.getElementById('voicePauseV9').onclick=pause;document.getElementById('voiceCorrectV9').onclick=correct;document.getElementById('voiceClearV9').onclick=clearAll;document.getElementById('voiceDoneV9').onclick=done;
 f.addEventListener('input',()=>{if(!listening){finalText=clean(f.value);interim='';render()}});render();window.v16HandleCommand=done;window.OPERA_VOICE_V9=true;return true
}
function boot(){if(install())return;setTimeout(boot,250)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
