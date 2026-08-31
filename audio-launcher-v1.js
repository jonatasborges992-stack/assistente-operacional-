/* OPERA ONE — ÁUDIO PRINCIPAL V1
   Botão de áudio independente na área única de lançamento.
   Não depende do painel antigo de interpretação. */
(function(){'use strict';
function boot(){
  const box=document.querySelector('.assist-command');
  const input=document.getElementById('v16Command');
  if(!box||!input){setTimeout(boot,300);return;}
  if(document.getElementById('operaAudioMainBtn'))return;
  const btn=document.createElement('button');
  btn.id='operaAudioMainBtn'; btn.type='button'; btn.className='green';
  btn.textContent='🎙️ Falar'; btn.setAttribute('aria-label','Falar por áudio');
  btn.style.minWidth='150px'; btn.style.background='linear-gradient(135deg,#16803c,#16a34a)';
  box.insertBefore(btn,box.querySelector('button'));
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  let rec=null,active=false,finalText='',restart=false;
  function status(t){let e=document.getElementById('operaAudioStatus');if(!e){e=document.createElement('div');e.id='operaAudioStatus';e.style.cssText='font-size:13px;font-weight:700;color:#526477;margin-top:7px';box.parentElement.insertBefore(e,box.nextSibling)}e.textContent=t}
  function render(){btn.textContent=active?'⏹️ Parar áudio':'🎙️ Falar';btn.setAttribute('aria-pressed',String(active));}
  function start(){
    if(!SR){status('⚠️ Seu navegador não disponibilizou reconhecimento de voz. Use o teclado/digitação.');return}
    if(active)return;
    finalText=String(input.value||'').trim(); restart=true;
    rec=new SR();rec.lang='pt-BR';rec.continuous=true;rec.interimResults=true;rec.maxAlternatives=3;
    rec.onstart=function(){active=true;render();status('🟢 Ouvindo… pode fazer pausas. O texto não será apagado.');};
    rec.onresult=function(e){let interim='';for(let i=e.resultIndex;i<e.results.length;i++){const r=e.results[i];const t=(r[0]&&r[0].transcript)||'';if(r.isFinal)finalText=(finalText+' '+t).replace(/\s+/g,' ').trim();else interim+=(t+' ')}input.value=(finalText+' '+interim).replace(/\s+/g,' ').trim();input.dispatchEvent(new Event('input',{bubbles:true}));};
    rec.onerror=function(e){if(e.error==='not-allowed'||e.error==='service-not-allowed'){active=false;restart=false;render();status('⚠️ Permissão do microfone bloqueada. O texto já capturado foi preservado.');}else status('🟡 Pequena interrupção. Mantendo o texto; continue falando.');};
    rec.onend=function(){if(!restart)return;setTimeout(function(){if(!restart)return;try{rec.start()}catch(_){ }},450)};
    try{rec.start()}catch(e){status('⚠️ Não foi possível iniciar o microfone. Tente novamente.');}
  }
  function stop(){restart=false;active=false;try{rec&&rec.stop()}catch(_){}input.value=(finalText||input.value||'').replace(/\s+/g,' ').trim();input.dispatchEvent(new Event('input',{bubbles:true}));render();status('⏸️ Áudio pausado. Texto preservado. Você pode corrigir ou continuar digitando.');}
  btn.addEventListener('click',function(){active?stop():start()});
  render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
