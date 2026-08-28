/* OPERA ONE — Voz Inteligente v1
   Grava em sessão contínua, preserva pausas e só conclui quando o usuário mandar.
*/
(function(){
  'use strict';
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const DRAFT_KEY = 'opera_one_voice_draft_v1';
  let recognition = null;
  let mode = 'idle'; // idle | listening | paused
  let finalText = '';
  let interimText = '';
  let restartTimer = null;
  let restartAttempts = 0;
  let built = false;

  const esc = s => String(s||'').replace(/[&<>\"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const getInput = () => document.getElementById('v16Command') || document.querySelector('textarea');

  function injectStyle(doc){
    if(doc.getElementById('opera-voice-style')) return;
    const st=doc.createElement('style'); st.id='opera-voice-style';
    st.textContent=`
      #operaVoicePanel{margin-top:10px;padding:12px;border:1px solid #d9e3ef;border-radius:16px;background:linear-gradient(180deg,#fff,#f7fafc);box-shadow:0 6px 20px rgba(8,24,45,.06)}
      #operaVoiceStatus{font-size:13px;color:#64748b;margin:0 0 9px;line-height:1.35}
      #operaVoiceStatus.live{color:#16803c;font-weight:800}
      .opera-vrow{display:flex;gap:8px;flex-wrap:wrap}
      .opera-vbtn{border:0!important;border-radius:11px!important;padding:10px 13px!important;font-weight:800!important;cursor:pointer!important;min-width:100px!important}
      .opera-vbtn.primary{background:#1299ff!important;color:#fff!important}
      .opera-vbtn.dark{background:#17202a!important;color:#fff!important}
      .opera-vbtn.light{background:#edf2f7!important;color:#17202a!important}
      .opera-vbtn.red{background:#b42318!important;color:#fff!important}
      .opera-vbtn:disabled{opacity:.45!important;cursor:not-allowed!important}
      #operaVoiceLive{display:none;margin-top:9px;padding:10px;border-radius:10px;background:#eefaf2;border:1px solid #c8ead2;color:#166534;font-size:13px}
      #operaVoiceLive.show{display:block}
      @media(max-width:680px){.opera-vrow{display:grid;grid-template-columns:1fr 1fr}.opera-vbtn{min-width:0!important}.opera-vbtn.primary{grid-column:span 2}}
    `;
    doc.head.appendChild(st);
  }

  function hideOldVoiceButton(doc){
    [...doc.querySelectorAll('button')].forEach(b=>{
      const t=(b.textContent||'').trim().toLowerCase();
      if((t==='🎙️ falar'||t==='🎤 falar'||t==='falar') && !b.dataset.operaVoice){
        b.dataset.operaOldVoice='1'; b.style.display='none';
      }
    });
  }

  function build(doc){
    const input=getInput();
    if(!input || doc.getElementById('operaVoicePanel')) return !!input;
    injectStyle(doc); hideOldVoiceButton(doc);
    const panel=doc.createElement('div'); panel.id='operaVoicePanel'; panel.dataset.operaVoice='1';
    panel.innerHTML=`
      <p id="operaVoiceStatus">🎙️ Pronto para ouvir. Você pode falar, parar para pensar e continuar sem perder o que já disse.</p>
      <div class="opera-vrow">
        <button type="button" class="opera-vbtn primary" id="operaVoiceStart">🎙️ Falar</button>
        <button type="button" class="opera-vbtn light" id="operaVoicePause" disabled>⏸️ Pausar</button>
        <button type="button" class="opera-vbtn red" id="operaVoiceReset" disabled>↺ Refazer</button>
        <button type="button" class="opera-vbtn dark" id="operaVoiceDone" disabled>✓ Concluir</button>
      </div>
      <div id="operaVoiceLive">Ouvindo… fale normalmente. Silêncios curtos não encerram a gravação.</div>`;
    input.parentNode.insertBefore(panel,input.nextSibling);

    const start=panel.querySelector('#operaVoiceStart'), pause=panel.querySelector('#operaVoicePause'), reset=panel.querySelector('#operaVoiceReset'), done=panel.querySelector('#operaVoiceDone'), status=panel.querySelector('#operaVoiceStatus'), live=panel.querySelector('#operaVoiceLive');

    function saveDraft(){
      try{sessionStorage.setItem(DRAFT_KEY, JSON.stringify({finalText, interimText}));}catch(e){}
    }
    function loadDraft(){
      try{const x=JSON.parse(sessionStorage.getItem(DRAFT_KEY)||'null'); if(x&&x.finalText){finalText=x.finalText; interimText=''; input.value=finalText; refresh();}}catch(e){}
    }
    function clearDraft(){try{sessionStorage.removeItem(DRAFT_KEY)}catch(e){}}
    function transcript(){return (finalText+' '+interimText).replace(/\s+/g,' ').trim()}
    function refresh(){
      const text=transcript();
      if(text) input.value=text;
      const active=mode==='listening';
      start.textContent=active?'🎙️ Ouvindo…':'🎙️ Falar';
      start.disabled=active;
      pause.disabled=mode==='idle';
      pause.textContent=mode==='paused'?'▶️ Continuar':'⏸️ Pausar';
      reset.disabled=mode==='idle' && !finalText;
      done.disabled=!text;
      live.classList.toggle('show',active);
      status.classList.toggle('live',active);
      status.textContent=active?'🟢 Ouvindo… pode pausar para pensar. O que você já falou fica salvo.':mode==='paused'?'⏸️ Pausado. Seu texto está preservado. Toque em Continuar quando quiser.':'🎙️ Pronto para ouvir. Você pode falar, parar para pensar e continuar sem perder o que já disse.';
      saveDraft();
    }
    function setupRecognition(){
      if(!SR){status.textContent='⚠️ O navegador não disponibilizou reconhecimento de voz. Use o campo de texto ou abra no Safari/Chrome atualizado.'; return false;}
      recognition=new SR();
      recognition.lang='pt-BR'; recognition.continuous=true; recognition.interimResults=true; recognition.maxAlternatives=1;
      recognition.onstart=()=>{restartAttempts=0;mode='listening';refresh()};
      recognition.onresult=(event)=>{
        let interim='';
        for(let i=event.resultIndex;i<event.results.length;i++){
          const r=event.results[i];
          const phrase=(r[0]&&r[0].transcript)||'';
          if(r.isFinal){finalText=(finalText+' '+phrase).replace(/\s+/g,' ').trim();}
          else interim += phrase+' ';
        }
        interimText=interim.trim(); refresh();
      };
      recognition.onerror=(event)=>{
        if(event.error==='not-allowed'||event.error==='service-not-allowed'){
          mode='paused'; status.textContent='⚠️ Permissão do microfone bloqueada. Libere o microfone para este site e toque em Continuar.'; refresh(); return;
        }
        if(event.error==='aborted') return;
        status.textContent='ℹ️ A escuta teve uma interrupção. O texto já capturado foi preservado.';
      };
      recognition.onend=()=>{
        if(mode!=='listening') return;
        clearTimeout(restartTimer);
        const delay=Math.min(1400,350+restartAttempts*150); restartAttempts++;
        restartTimer=setTimeout(()=>{if(mode==='listening'){try{recognition.start()}catch(e){}}},delay);
      };
      return true;
    }
    function startListening(){
      if(!recognition && !setupRecognition()) return;
      clearTimeout(restartTimer); mode='listening'; interimText=''; refresh();
      try{recognition.start()}catch(e){try{recognition.stop()}catch(_){} setTimeout(()=>{try{recognition.start()}catch(_){ }},250)}
    }
    function pauseListening(){
      mode='paused'; interimText=''; saveDraft();
      try{recognition&&recognition.stop()}catch(e){}
      refresh();
    }
    function resetAll(){
      mode='idle'; finalText=''; interimText=''; clearTimeout(restartTimer); clearDraft();
      try{recognition&&recognition.abort()}catch(e){}
      input.value=''; refresh();
    }
    function doneListening(){
      const text=finalText.trim();
      mode='idle'; interimText=''; clearTimeout(restartTimer);
      try{recognition&&recognition.stop()}catch(e){}
      if(text) input.value=text;
      clearDraft(); refresh();
      input.focus();
      status.textContent='✅ Texto concluído. Revise se quiser e depois toque em “Interpretar lançamento”.';
    }
    start.addEventListener('click',startListening);
    pause.addEventListener('click',()=>mode==='paused'?startListening():pauseListening());
    reset.addEventListener('click',resetAll);
    done.addEventListener('click',doneListening);
    loadDraft(); refresh();
    built=true; return true;
  }

  function boot(){
    const doc=document;
    if(build(doc)) return;
    const obs=new MutationObserver(()=>{if(build(doc)){obs.disconnect()}});
    obs.observe(doc.documentElement,{childList:true,subtree:true});
    setTimeout(()=>obs.disconnect(),15000);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
