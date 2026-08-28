/* OPERA ONE — Voz Inteligente v2
   Voz + teclado em uma única sessão.
   Regra principal: o texto visível no campo é a fonte da verdade quando o usuário pausa.
   O usuário pode apagar/corrigir pelo teclado e continuar sem recuperar o trecho apagado.
*/
(function(){
  'use strict';

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const DRAFT_KEY = 'opera_one_voice_draft_v2';
  let recognition = null;
  let mode = 'idle'; // idle | listening | paused
  let finalText = '';
  let interimText = '';
  let restartTimer = null;
  let restartAttempts = 0;
  let ignoreEnd = false;

  const getInput = () => document.getElementById('v16Command') || document.querySelector('textarea');
  const normalize = s => String(s || '').replace(/\s+/g, ' ').trim();

  function injectStyle(doc){
    if(doc.getElementById('opera-voice-style-v2')) return;
    const st = doc.createElement('style');
    st.id = 'opera-voice-style-v2';
    st.textContent = `
      #operaVoicePanel{margin-top:10px;padding:13px;border:1px solid #d9e3ef;border-radius:16px;background:linear-gradient(180deg,#fff,#f7fafc);box-shadow:0 6px 20px rgba(8,24,45,.06)}
      #operaVoiceStatus{font-size:13px;color:#64748b;margin:0 0 9px;line-height:1.4}
      #operaVoiceStatus.live{color:#16803c;font-weight:800}
      .opera-vrow{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:8px}
      .opera-vbtn{border:0!important;border-radius:11px!important;padding:11px 10px!important;font-weight:800!important;cursor:pointer!important;min-width:0!important}
      .opera-vbtn.primary{background:#1299ff!important;color:#fff!important}
      .opera-vbtn.dark{background:#17202a!important;color:#fff!important}
      .opera-vbtn.light{background:#edf2f7!important;color:#17202a!important}
      .opera-vbtn.red{background:#b42318!important;color:#fff!important}
      .opera-vbtn:disabled{opacity:.45!important;cursor:not-allowed!important}
      #operaVoiceLive{display:none;margin-top:9px;padding:10px;border-radius:10px;background:#eefaf2;border:1px solid #c8ead2;color:#166534;font-size:13px}
      #operaVoiceLive.show{display:block}
      #operaVoiceEditHint{margin-top:8px;font-size:12px;color:#64748b}
      @media(max-width:680px){
        .opera-vrow{grid-template-columns:1fr 1fr}
        .opera-vbtn.primary,.opera-vbtn.dark{grid-column:span 2}
      }
    `;
    doc.head.appendChild(st);
  }

  function hideOldVoiceButton(doc){
    [...doc.querySelectorAll('button')].forEach(b=>{
      const t = normalize(b.textContent).toLowerCase();
      if((t==='🎙️ falar'||t==='🎤 falar'||t==='falar') && !b.dataset.operaVoice){
        b.dataset.operaOldVoice='1';
        b.style.display='none';
      }
    });
  }

  function build(doc){
    const input = getInput();
    if(!input || doc.getElementById('operaVoicePanel')) return !!input;

    injectStyle(doc);
    hideOldVoiceButton(doc);

    const panel = doc.createElement('div');
    panel.id = 'operaVoicePanel';
    panel.dataset.operaVoice='1';
    panel.innerHTML = `
      <p id="operaVoiceStatus">🎙️ Pronto. Fale normalmente. Você pode pausar para pensar, editar pelo teclado e continuar.</p>
      <div class="opera-vrow">
        <button type="button" class="opera-vbtn primary" id="operaVoiceStart">🎙️ Falar</button>
        <button type="button" class="opera-vbtn light" id="operaVoicePause" disabled>⏸️ Pausar</button>
        <button type="button" class="opera-vbtn red" id="operaVoiceReset" disabled>↺ Refazer</button>
        <button type="button" class="opera-vbtn dark" id="operaVoiceDone" disabled>✓ Concluir</button>
      </div>
      <div id="operaVoiceLive">🟢 Ouvindo… silêncios curtos não encerram a sessão.</div>
      <div id="operaVoiceEditHint">✏️ Ao pausar, o campo acima fica livre para você apagar, corrigir ou acrescentar texto. Ao continuar, o sistema usa exatamente o texto que ficou no campo.</div>
    `;

    input.parentNode.insertBefore(panel, input.nextSibling);

    const start = panel.querySelector('#operaVoiceStart');
    const pause = panel.querySelector('#operaVoicePause');
    const reset = panel.querySelector('#operaVoiceReset');
    const done = panel.querySelector('#operaVoiceDone');
    const status = panel.querySelector('#operaVoiceStatus');
    const live = panel.querySelector('#operaVoiceLive');

    function saveDraft(){
      try{
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify({
          finalText: normalize(finalText),
          mode: mode==='listening' ? 'paused' : mode
        }));
      }catch(e){}
    }

    function clearDraft(){
      try{sessionStorage.removeItem(DRAFT_KEY)}catch(e){}
    }

    function loadDraft(){
      try{
        const raw=sessionStorage.getItem(DRAFT_KEY);
        if(!raw) return;
        const data=JSON.parse(raw);
        if(data && data.finalText){
          finalText=normalize(data.finalText);
          interimText='';
          input.value=finalText;
          mode='paused';
        }
      }catch(e){}
    }

    function transcript(){
      return normalize(finalText + ' ' + interimText);
    }

    function setStatus(text, liveState=false){
      status.textContent=text;
      status.classList.toggle('live', !!liveState);
    }

    function refresh(){
      const text=transcript();
      if(text || mode!=='idle') input.value=text;

      const active=mode==='listening';
      start.textContent=active?'🎙️ Ouvindo…':'🎙️ Falar';
      start.disabled=active;
      pause.disabled=mode==='idle';
      pause.textContent=mode==='paused'?'▶️ Continuar':'⏸️ Pausar';
      reset.disabled=mode==='idle' && !finalText;
      done.disabled=!normalize(finalText);
      live.classList.toggle('show',active);

      if(active){
        setStatus('🟢 Ouvindo… pode pausar para pensar. O que já foi falado está preservado.',true);
      }else if(mode==='paused'){
        setStatus('⏸️ Pausado. Edite o texto pelo teclado. O que você apagar não será recuperado ao continuar.',false);
      }else{
        setStatus('🎙️ Pronto. Fale normalmente. Você pode pausar, editar e continuar sem perder o restante.',false);
      }
      saveDraft();
    }

    // Esta é a parte crítica: quando o usuário edita manualmente o campo,
    // a edição vira a nova fonte oficial do texto. Assim, ao continuar,
    // o reconhecimento nunca volta para uma cópia antiga.
    input.addEventListener('input',()=>{
      if(mode==='paused' || mode==='idle'){
        finalText=normalize(input.value);
        interimText='';
        refresh();
      }
    });

    function setupRecognition(){
      if(!SR){
        setStatus('⚠️ Este navegador não disponibilizou reconhecimento de voz. Use o teclado/digitação ou o ditado do aparelho.',false);
        return false;
      }

      recognition=new SR();
      recognition.lang='pt-BR';
      recognition.continuous=true;
      recognition.interimResults=true;
      recognition.maxAlternatives=1;

      recognition.onstart=()=>{
        restartAttempts=0;
        mode='listening';
        refresh();
      };

      recognition.onresult=(event)=>{
        let interim='';
        for(let i=event.resultIndex;i<event.results.length;i++){
          const r=event.results[i];
          const phrase=(r[0] && r[0].transcript) || '';
          if(r.isFinal){
            finalText=normalize(finalText+' '+phrase);
          }else{
            interim += phrase+' ';
          }
        }
        interimText=normalize(interim);
        refresh();
      };

      recognition.onerror=(event)=>{
        if(event.error==='not-allowed'||event.error==='service-not-allowed'){
          mode='paused';
          setStatus('⚠️ Permissão do microfone bloqueada. O texto já capturado foi preservado. Libere o microfone e toque em Continuar.',false);
          refresh();
          return;
        }
        if(event.error==='aborted') return;
        setStatus('ℹ️ A escuta sofreu uma interrupção. O texto já capturado foi preservado.',false);
      };

      recognition.onend=()=>{
        if(ignoreEnd){ignoreEnd=false;return;}
        if(mode!=='listening') return;

        clearTimeout(restartTimer);
        const delay=Math.min(1400,350+(restartAttempts*150));
        restartAttempts++;
        restartTimer=setTimeout(()=>{
          if(mode!=='listening') return;
          try{recognition.start()}catch(e){}
        },delay);
      };

      return true;
    }

    async function startListening(){
      // Se o usuário editou enquanto estava pausado, o campo é a verdade.
      if(mode==='paused'){
        finalText=normalize(input.value);
        interimText='';
      }

      if(!recognition && !setupRecognition()) return;

      clearTimeout(restartTimer);
      mode='listening';
      interimText='';
      refresh();

      try{
        recognition.start();
      }catch(e){
        try{recognition.stop()}catch(_){}
        setTimeout(()=>{try{recognition.start()}catch(_){}},250);
      }
    }

    function pauseListening(){
      // Antes de parar, captura exatamente o que está no campo.
      finalText=normalize(input.value);
      interimText='';
      mode='paused';
      clearTimeout(restartTimer);
      saveDraft();
      try{recognition&&recognition.stop()}catch(e){}
      input.focus();
      refresh();
      // Seleciona o campo sem apagar nada, deixando o usuário editar imediatamente.
      try{input.setSelectionRange(input.value.length,input.value.length)}catch(e){}
    }

    function resetAll(){
      mode='idle';
      finalText='';
      interimText='';
      clearTimeout(restartTimer);
      clearDraft();
      ignoreEnd=true;
      try{recognition&&recognition.abort()}catch(e){}
      input.value='';
      refresh();
      input.focus();
    }

    function doneListening(){
      // Concluir sempre lê o campo atual. Isso garante que correções manuais
      // sejam respeitadas e que nada seja relançado automaticamente.
      finalText=normalize(input.value);
      interimText='';
      mode='idle';
      clearTimeout(restartTimer);
      ignoreEnd=true;
      try{recognition&&recognition.stop()}catch(e){}
      input.value=finalText;
      clearDraft();
      refresh();
      input.focus();
      setStatus('✅ Texto concluído. Revise se quiser e toque em “Resolver” quando estiver pronto.',false);
    }

    start.addEventListener('click',startListening);
    pause.addEventListener('click',()=>mode==='paused'?startListening():pauseListening());
    reset.addEventListener('click',resetAll);
    done.addEventListener('click',doneListening);

    loadDraft();
    refresh();
  }

  function boot(){
    const doc=document;
    if(build(doc)) return;
    const obs=new MutationObserver(()=>{
      if(build(doc)) obs.disconnect();
    });
    obs.observe(doc.documentElement,{childList:true,subtree:true});
    setTimeout(()=>obs.disconnect(),15000);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
