/* OPERA ONE — Áudio integrado ao lançamento único */
(function(){'use strict';
function boot(){
  const input=document.getElementById('v16Command');
  const panel=document.getElementById('operaVoicePanel');
  if(!input||!panel){setTimeout(boot,250);return;}
  if(document.getElementById('operaAudioMainBtn'))return;
  const grid=panel.querySelector('.opv-grid');
  if(!grid)return;
  const btn=document.createElement('button');
  btn.id='operaAudioMainBtn';btn.type='button';btn.className='opv opv-main';btn.textContent='🎙️ Falar';btn.setAttribute('aria-label','Falar por áudio');
  grid.insertBefore(btn,grid.firstChild);
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  let rec=null,active=false,finalText='',restart=false;
  const status=()=>document.getElementById('operaVoiceStatus');
  function setStatus(t){const e=status();if(e)e.innerHTML=t}
  function render(){btn.textContent=active?'⏹️ Parar áudio':'🎙️ Falar';btn.setAttribute('aria-pressed',String(active));}
  function start(){
    if(!SR){setStatus('⚠️ <b>Áudio não disponível neste navegador.</b> Use ✍️ Digitar e o ditado do teclado.');return;}
    if(active)return;
    finalText=String(input.value||'').trim();restart=true;
    rec=new SR();rec.lang='pt-BR';rec.continuous=true;rec.interimResults=true;rec.maxAlternatives=3;
    try{if('phrases' in rec && window.SpeechRecognitionPhrase){const terms=['frete','terceirizado','terceirizados','terceirização','combustível','diesel','pedágio','manutenção','diária','horas extras','cliente','origem','destino','cobrei','paguei'];rec.phrases=terms.map(x=>new SpeechRecognitionPhrase(x,5))}}catch(e){}
    rec.onstart=()=>{active=true;render();setStatus('🟢 <b>Ouvindo…</b> fale normalmente. O texto fica preservado.');};
    rec.onresult=e=>{let interim='';for(let i=e.resultIndex;i<e.results.length;i++){const r=e.results[i],t=(r[0]&&r[0].transcript)||'';if(r.isFinal)finalText=(finalText+' '+t).replace(/\s+/g,' ').trim();else interim+=(t+' ')}input.value=(finalText+' '+interim).replace(/\s+/g,' ').trim();input.dispatchEvent(new Event('input',{bubbles:true}));};
    rec.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed'){active=false;restart=false;render();setStatus('⚠️ <b>Microfone bloqueado.</b> O texto capturado foi preservado.');}else setStatus('🟡 Interrupção de voz. O texto foi preservado; toque em Falar para continuar.');};
    rec.onend=()=>{if(!restart)return;setTimeout(()=>{if(!restart)return;try{rec.start()}catch(e){}},450)};
    try{rec.start()}catch(e){setStatus('⚠️ Não foi possível iniciar o microfone. Tente novamente.');}
  }
  function stop(){restart=false;active=false;try{rec&&rec.stop()}catch(e){}input.value=(finalText||input.value||'').replace(/\s+/g,' ').trim();input.dispatchEvent(new Event('input',{bubbles:true}));render();setStatus('⏸️ <b>Áudio pausado.</b> Texto preservado. Você pode corrigir ou continuar digitando.');}
  btn.onclick=()=>active?stop():start();render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
