/* OPERA ONE V2 — áudio REAL na área principal de lançamento */
(function(){'use strict';
function boot(){
 const input=document.getElementById('v16Command'), host=document.querySelector('.assist-command');
 if(!input||!host){setTimeout(boot,300);return}
 if(document.getElementById('operaPrimaryAudio'))return;
 const box=document.createElement('div');box.id='operaPrimaryAudio';box.style.cssText='display:flex;gap:8px;margin-top:8px;align-items:center;flex-wrap:wrap';
 const b=document.createElement('button');b.id='operaPrimaryAudioBtn';b.type='button';b.className='green';b.textContent='🎙️ Falar';b.style.cssText='flex:1;min-width:140px';
 const s=document.createElement('span');s.id='operaPrimaryAudioStatus';s.className='muted';s.textContent='Áudio pronto';s.style.cssText='flex-basis:100%';
 box.append(b,s);host.parentNode.insertBefore(box,host.nextSibling);
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;let rec=null,active=false,shouldRestart=false,finalText='';
 function status(t){s.textContent=t}
 function render(){b.textContent=active?'⏹️ Parar áudio':'🎙️ Falar';b.setAttribute('aria-pressed',String(active))}
 function start(){
  if(!SR){status('⚠️ Microfone não disponível. Use o teclado/digitação.');return}
  if(active)return;finalText=input.value.trim();shouldRestart=true;rec=new SR();rec.lang='pt-BR';rec.continuous=true;rec.interimResults=true;rec.maxAlternatives=3;
  rec.onstart=()=>{active=true;render();status('🟢 Ouvindo… faça pausas à vontade. Nada será apagado.')};
  rec.onresult=e=>{let inter='';for(let i=e.resultIndex;i<e.results.length;i++){let r=e.results[i],t=r[0]?.transcript||'';if(r.isFinal)finalText=(finalText+' '+t).replace(/\s+/g,' ').trim();else inter+=(t+' ')}input.value=(finalText+' '+inter).replace(/\s+/g,' ').trim();input.dispatchEvent(new Event('input',{bubbles:true}))};
  rec.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed'){shouldRestart=false;active=false;render();status('⚠️ Microfone bloqueado. Texto preservado.')}else status('🟡 Pequena interrupção; mantendo o texto…')};
  rec.onend=()=>{if(shouldRestart)setTimeout(()=>{try{rec.start()}catch(_){}},500)};
  try{rec.start()}catch(e){status('⚠️ Não foi possível iniciar o áudio. Tente novamente.')}
 }
 function stop(){shouldRestart=false;active=false;try{rec?.stop()}catch(_){}input.value=(finalText||input.value).replace(/\s+/g,' ').trim();input.dispatchEvent(new Event('input',{bubbles:true}));render();status('⏸️ Áudio parado. Texto preservado; você pode corrigir e continuar.')}
 b.onclick=()=>active?stop():start();
 render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
