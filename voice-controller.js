/* OPERA ONE — Voz Inteligente v3
   Voz contínua + silêncio inteligente + edição manual.
   Regra: somente o usuário encerra a sessão.
   O silêncio não apaga nem reinicia o texto.
*/
(function(){
  'use strict';
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  const KEY='opera_one_voice_draft_v3';
  let rec=null, state='idle', finalText='', interim='', restarting=false, userStopped=false, restartTimer=null;
  const input=()=>document.getElementById('v16Command')||document.querySelector('textarea');
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim();

  function css(d){
    if(d.getElementById('operaVoiceStyleV3'))return;
    const s=d.createElement('style');s.id='operaVoiceStyleV3';s.textContent=`
      #operaVoicePanel{margin-top:10px;padding:14px;border:1px solid #d7e3ef;border-radius:17px;background:linear-gradient(180deg,#fff,#f6f9fc);box-shadow:0 7px 24px rgba(8,24,45,.07)}
      #operaVoiceStatus{margin:0 0 10px;font-size:13px;line-height:1.45;color:#526477;font-weight:600}
      #operaVoiceStatus.live{color:#087a45}.opera-vrow{display:grid;grid-template-columns:1.3fr 1fr 1fr 1fr 1fr;gap:7px}
      .opera-vbtn{border:0!important;border-radius:11px!important;padding:11px 8px!important;font-weight:800!important;cursor:pointer!important;min-height:43px!important}
      .opera-vbtn.blue{background:linear-gradient(135deg,#118cff,#14c8ed)!important;color:#fff!important}.opera-vbtn.dark{background:#142238!important;color:#fff!important}.opera-vbtn.gray{background:#edf2f7!important;color:#17202a!important}.opera-vbtn.red{background:#b42318!important;color:#fff!important}.opera-vbtn:disabled{opacity:.42!important}
      #operaVoiceLive{display:none;margin-top:9px;padding:10px;border-radius:11px;background:#eefaf3;border:1px solid #c9ead6;color:#166534;font-size:12px;font-weight:700}#operaVoiceLive.show{display:block}
      #operaVoiceEditHint{margin-top:8px;font-size:12px;color:#65778a}#operaVoiceEditHint b{color:#17202a}
      @media(max-width:680px){.opera-vrow{grid-template-columns:1fr 1fr}.opera-vbtn.blue,.opera-vbtn.dark{grid-column:span 2}}
    `;d.head.appendChild(s);
  }
  function hideOld(d){[...d.querySelectorAll('button')].forEach(b=>{const t=clean(b.textContent).toLowerCase();if(['falar','🎙️ falar','🎤 falar'].includes(t)&&!b.dataset.operaVoice){b.style.display='none';b.dataset.operaOld='1'}})}

  function build(d){
    const el=input(); if(!el||d.getElementById('operaVoicePanel'))return !!el;
    css(d);hideOld(d);
    const p=d.createElement('section');p.id='operaVoicePanel';p.innerHTML=`
      <p id="operaVoiceStatus">🎙️ Pronto. Você controla quando começa e quando termina.</p>
      <div class="opera-vrow">
        <button type="button" id="operaVoiceStart" class="opera-vbtn blue">🎙️ Falar</button>
        <button type="button" id="operaVoicePause" class="opera-vbtn gray" disabled>⏸️ Pausar</button>
        <button type="button" id="operaVoiceEdit" class="opera-vbtn gray" disabled>✏️ Corrigir</button>
        <button type="button" id="operaVoiceClear" class="opera-vbtn red" disabled>🗑️ Apagar tudo</button>
        <button type="button" id="operaVoiceDone" class="opera-vbtn dark" disabled>✓ Concluir</button>
      </div>
      <div id="operaVoiceLive">🟢 Ouvindo continuamente. <b>Silêncio não encerra a fala.</b> Pode parar para pensar.</div>
      <div id="operaVoiceEditHint">✏️ <b>Corrigir:</b> edite diretamente no teclado. Depois toque em Continuar. O OPERA ONE respeita exatamente o texto que ficou no campo.</div>`;
    el.parentNode.insertBefore(p,el.nextSibling);
    const $=id=>p.querySelector('#'+id), start=$('operaVoiceStart'), pause=$('operaVoicePause'), edit=$('operaVoiceEdit'), clear=$('operaVoiceClear'), done=$('operaVoiceDone'), status=$('operaVoiceStatus'), live=$('operaVoiceLive');

    function save(){try{sessionStorage.setItem(KEY,JSON.stringify({text:clean(el.value),state:state==='listening'?'paused':state}))}catch(e){}}
    function load(){try{const x=JSON.parse(sessionStorage.getItem(KEY)||'null');if(x&&x.text){finalText=clean(x.text);el.value=finalText;state='paused'}}catch(e){}}
    function clearSave(){try{sessionStorage.removeItem(KEY)}catch(e){}}
    function set(t,l){status.textContent=t;status.classList.toggle('live',l)}
    function render(){
      if(state==='listening')el.value=clean(finalText+' '+interim); else if(state!=='idle')el.value=clean(finalText);
      const listening=state==='listening', has=clean(el.value).length>0;
      start.disabled=listening;start.textContent=listening?'🎙️ Ouvindo…':'🎙️ Falar';
      pause.disabled=state==='idle';pause.textContent=state==='paused'?'▶️ Continuar':'⏸️ Pausar';
      edit.disabled=!has;clear.disabled=!has;done.disabled=!has;live.classList.toggle('show',listening);
      if(listening)set('🟢 Ouvindo… silêncio não encerra. O texto já confirmado está protegido.',true);
      else if(state==='paused')set('⏸️ Pausado. Você pode corrigir, apagar trechos ou continuar.',false);
      else set('🎙️ Pronto. Fale normalmente e toque em Concluir quando terminar.',false);
      save();
    }

    // Enquanto estiver pausado, toda edição manual vira a nova fonte oficial.
    el.addEventListener('input',()=>{if(state!=='listening'){finalText=clean(el.value);interim='';render()}});

    function setup(){
      if(!SR){set('⚠️ Reconhecimento de voz não disponível neste navegador. Use o teclado/ditado do aparelho.',false);return false}
      rec=new SR();rec.lang='pt-BR';rec.continuous=true;rec.interimResults=true;rec.maxAlternatives=1;
      rec.onstart=()=>{restarting=false;state='listening';render()};
      rec.onresult=e=>{
        let temp='';
        for(let i=e.resultIndex;i<e.results.length;i++){
          const r=e.results[i], txt=(r[0]&&r[0].transcript)||'';
          if(r.isFinal)finalText=clean(finalText+' '+txt);else temp+=txt+' ';
        }
        interim=clean(temp);render();
      };
      rec.onerror=e=>{
        if(userStopped||e.error==='aborted')return;
        if(e.error==='not-allowed'||e.error==='service-not-allowed'){state='paused';render();set('⚠️ Microfone bloqueado. O texto já capturado foi preservado.',false);return}
        // Erros transitórios não alteram o texto e não encerram a sessão.
        set('🟢 Reconectando o microfone… seu texto continua preservado.',true);
      };
      rec.onend=()=>{
        if(userStopped||state!=='listening')return;
        // Alguns navegadores encerram o SpeechRecognition após silêncio.
        // Reiniciamos apenas o motor, nunca o texto. A sessão do usuário continua ativa.
        clearTimeout(restartTimer);restartTimer=setTimeout(()=>{
          if(state!=='listening'||userStopped)return;
          try{rec.start()}catch(e){try{rec.stop()}catch(_){}setTimeout(()=>{try{rec.start()}catch(_){}} ,500)}
        },650);
      };
      return true;
    }

    function listen(){
      if(state==='paused'){
        // O campo editado pelo usuário é a fonte oficial antes de retomar.
        finalText=clean(el.value);interim='';
      }
      if(!rec&&!setup())return;
      userStopped=false;clearTimeout(restartTimer);state='listening';render();
      try{rec.start()}catch(e){try{rec.stop()}catch(_){}setTimeout(()=>{try{rec.start()}catch(_){}},250)}
    }
    function pauseSession(){
      finalText=clean(el.value);interim='';state='paused';userStopped=true;clearTimeout(restartTimer);save();
      try{rec&&rec.stop()}catch(e){}render();el.focus();try{el.setSelectionRange(el.value.length,el.value.length)}catch(e){}
    }
    function correct(){
      if(state==='listening')pauseSession();
      else{finalText=clean(el.value);el.focus();try{el.setSelectionRange(el.value.length,el.value.length)}catch(e){}}
      set('✏️ Modo correção: apague ou altere o que quiser. Depois toque em Continuar.',false);save();
    }
    function erase(){
      userStopped=true;clearTimeout(restartTimer);try{rec&&rec.abort()}catch(e){}
      finalText='';interim='';el.value='';state='paused';clearSave();render();el.focus();set('🗑️ Tudo apagado. Você pode começar novamente.',false);
    }
    function finish(){
      finalText=clean(el.value);interim='';userStopped=true;clearTimeout(restartTimer);try{rec&&rec.stop()}catch(e){}state='idle';el.value=finalText;clearSave();render();el.focus();set('✅ Texto concluído. Revise e toque em Resolver quando estiver pronto.',false);
    }
    start.onclick=listen;pause.onclick=()=>state==='paused'?listen():pauseSession();edit.onclick=correct;clear.onclick=erase;done.onclick=finish;
    load();render();
  }
  function boot(){if(build(document))return;const o=new MutationObserver(()=>{if(build(document))o.disconnect()});o.observe(document.documentElement,{childList:true,subtree:true});setTimeout(()=>o.disconnect(),15000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
