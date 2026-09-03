/* OPERA ONE — ponte IA isolada.
   IA interpreta apenas texto/voz. O núcleo continua responsável por validação,
   cálculo, armazenamento e regras do negócio. */
(function(){
  if(window.__operaAiBridgeLoaded)return;
  window.__operaAiBridgeLoaded=true;
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const money=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  function db(){try{return JSON.parse(localStorage.getItem('assistente_operacional_v5')||'{}')}catch{return {clients:[],vehicles:[],services:[],closures:[]}}}
  function repairReceivableFilter(){const el=document.getElementById('crStatus');if(el&&el.getAttribute('onchange')==='renderReceivables')el.setAttribute('onchange','renderReceivables()')}
  function installFinancialModel(){
    if(typeof window.serviceValue!=='function'||typeof window.serviceCost!=='function')return false;
    if(window.__operaFinancialModel)return true;
    window.serviceReceived=function(s){
      const value=Math.max(0,Number(window.serviceValue(s))||0);
      const explicit=Number(s?.valorRecebido);
      if(Number.isFinite(explicit))return Math.min(value,Math.max(0,explicit));
      return s?.status==='Recebido'?value:0;
    };
    window.stats=function(arr){
      const list=Array.isArray(arr)?arr:[];
      const fat=list.reduce((a,s)=>a+(Number(window.serviceValue(s))||0),0);
      const cost=list.reduce((a,s)=>a+(Number(window.serviceCost(s))||0),0);
      const profit=fat-cost;
      const received=list.reduce((a,s)=>a+window.serviceReceived(s),0);
      return {fat,cost,profit,received,receivable:Math.max(0,fat-received),margin:fat?profit/fat*100:0};
    };
    window.__operaFinancialModel=true;
    return true;
  }
  function installClosureGuard(){
    if(typeof window.createClosure!=='function')return false;
    if(window.createClosure.__operaGuarded)return true;
    const original=window.createClosure;
    function guardedClosure(){
      try{
        const list=typeof window.filteredReceivables==='function'?window.filteredReceivables():[];
        const data=db(),closedIds=new Set((data.closures||[]).flatMap(c=>Array.isArray(c.serviceIds)?c.serviceIds.map(String):[]));
        const reused=list.filter(s=>closedIds.has(String(s.id)));
        if(reused.length){alert('Há serviço(s) já incluído(s) em fechamento anterior. Remova-os do período/filtro antes de gerar um novo fechamento. Nenhum novo fechamento foi criado.');return;}
      }catch(e){return original()}
      return original();
    }
    guardedClosure.__operaGuarded=true;
    window.createClosure=guardedClosure;
    return true;
  }
  function installReceiptIntegrity(){
    if(typeof window.markReceived==='function'&&!window.markReceived.__operaReceipt){
      const original=window.markReceived;
      function wrappedMarkReceived(id){
        original(id);
        try{
          const data=db(),s=(data.services||[]).find(x=>String(x.id)===String(id));
          if(!s)return;
          const value=Math.max(0,Number(window.serviceValue(s))||0);
          s.valorRecebido=value;
          localStorage.setItem('assistente_operacional_v5',JSON.stringify(data));
          if(typeof window.refresh==='function')window.refresh();
        }catch(e){}
      }
      wrappedMarkReceived.__operaReceipt=true;
      window.markReceived=wrappedMarkReceived;
    }
    if(typeof window.saveEditedService==='function'&&!window.saveEditedService.__operaReceipt){
      const original=window.saveEditedService;
      function wrappedSaveEditedService(){
        const id=window.__operaEditingServiceId;
        original();
        try{
          if(!id)return;
          const data=db(),s=(data.services||[]).find(x=>String(x.id)===String(id));
          if(!s)return;
          const value=Math.max(0,Number(window.serviceValue(s))||0);
          if(s.status==='Recebido')s.valorRecebido=value;
          else s.valorRecebido=0;
          localStorage.setItem('assistente_operacional_v5',JSON.stringify(data));
          if(typeof window.refresh==='function')window.refresh();
        }catch(e){}
      }
      wrappedSaveEditedService.__operaReceipt=true;
      window.saveEditedService=wrappedSaveEditedService;
    }
    return typeof window.markReceived==='function'&&typeof window.saveEditedService==='function';
  }
  function installVoice(){
    if(typeof window.startVoice==='function')return true;
    let recognition=null,listening=false;
    window.startVoice=function(){
      const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
      const dot=document.getElementById('voiceDot'),status=document.getElementById('voiceStatus'),command=document.getElementById('command');
      if(!SR){if(status)status.textContent='Reconhecimento de voz não disponível neste navegador. Digite o lançamento.';return}
      if(listening){try{recognition.stop()}catch{}return}
      recognition=new SR();recognition.lang='pt-BR';recognition.continuous=false;recognition.interimResults=false;listening=true;dot?.classList.add('live');if(status)status.textContent='Ouvindo…';
      recognition.onresult=e=>{const text=e.results?.[0]?.[0]?.transcript||'';if(command)command.value=text;if(status)status.textContent='Texto reconhecido. Interpretando…';if(typeof window.resolveCommand==='function')window.resolveCommand()};
      recognition.onerror=()=>{if(status)status.textContent='Não foi possível usar o áudio. Você pode digitar.'};
      recognition.onend=()=>{listening=false;dot?.classList.remove('live');if(status&&status.textContent==='Ouvindo…')status.textContent='Fale normalmente ou digite.'};
      try{recognition.start()}catch{listening=false;dot?.classList.remove('live')}
    };return true;
  }
  function installAI(){
    if(typeof window.operaAIInterpret!=='function'||typeof window.resolveCommand!=='function')return false;
    if(window.resolveCommand.__operaAI)return true;
    const original=window.resolveCommand;
    async function resolveWithAI(){
      const command=document.getElementById('command'),box=document.getElementById('commandResponse'),text=command?.value?.trim();
      if(!text)return;if(!box){original();return}
      box.innerHTML='<div class="result"><h3>Interpretando…</h3><p>A IA está organizando o lançamento. Nenhum dado foi salvo.</p></div>';
      try{
        const p=await window.operaAIInterpret(text),data=db(),client=(data.clients||[]).find(c=>String(c.id)===String(p.client_id)),vehicle=(data.vehicles||[]).find(v=>String(v.id)===String(p.vehicle_id)),missing=Array.isArray(p.missing_fields)?p.missing_fields:[];
        if(!p.client_id||!p.freight_value){const items=missing.length?missing.map(esc).join(', '):'cliente cadastrado e valor do frete';box.innerHTML='<div class="result warn"><h3>Quase lá</h3><p>A interpretação ficou incompleta. Falta: <b>'+items+'</b>.</p><p>Nenhum dado foi salvo.</p></div>';return}
        const parsed={client,vehicle,value:p.freight_value,origin:p.origin||'',destination:p.destination||'',diesel:p.diesel||0,manut:p.maintenance||0,ped:p.toll||0,ter:p.outsourcing||0,alim:p.food||0},payload=JSON.stringify(parsed).replace(/</g,'\\u003c');
        box.innerHTML='<div class="result good"><h3>✓ Lançamento reconhecido pela IA</h3><p><b>'+esc(client?.nome||p.client_name||'Cliente')+'</b> • '+esc(p.origin||'Origem não informada')+' → '+esc(p.destination||'Destino não informado')+' • <b>'+money(p.freight_value)+'</b></p><p>Custos identificados: combustível '+money(p.diesel)+' • manutenção '+money(p.maintenance)+' • pedágio '+money(p.toll)+(vehicle?' • '+esc(vehicle.nome):'')+'</p><p class="muted">Confira os dados antes de salvar.</p><div class="actions"><button class="green" onclick="applyParsed('+payload+')">Usar no lançamento</button></div></div>';
      }catch(error){box.innerHTML='<div class="result warn"><h3>IA indisponível</h3><p>O lançamento continua disponível pelo interpretador local.</p></div>';setTimeout(()=>original(),350)}
    }
    resolveWithAI.__operaAI=true;window.resolveCommand=resolveWithAI;return true;
  }
  let tries=0;const timer=setInterval(()=>{repairReceivableFilter();installFinancialModel();installClosureGuard();installReceiptIntegrity();installVoice();if(installAI()&&window.startVoice&&window.__operaFinancialModel&&installClosureGuard()&&installReceiptIntegrity())clearInterval(timer);if(++tries>=100)clearInterval(timer)},100);installFinancialModel();installClosureGuard();installReceiptIntegrity();installVoice();repairReceivableFilter();
})();
