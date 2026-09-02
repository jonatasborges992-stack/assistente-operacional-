/* OPERA ONE — ponte IA isolada. Ativa somente quando o núcleo disponibilizar a função de resolução. */
(function(){
  if(window.__operaAiBridgeLoaded)return;
  window.__operaAiBridgeLoaded=true;
  function boot(){
    if(typeof window.operaAIInterpret!=='function' || typeof window.resolveCommand!=='function')return false;
    if(window.resolveCommand.__operaAI)return true;
    const original=window.resolveCommand;
    async function resolveWithAI(){
      const command=document.getElementById('command');
      const box=document.getElementById('commandResponse');
      const text=command?.value?.trim();
      if(!text)return original();
      if(!box)return original();
      box.innerHTML='<div class="result"><h3>Interpretando…</h3><p>Nenhum dado foi salvo.</p></div>';
      try{
        const p=await window.operaAIInterpret(text);
        if(!p?.client_id || !p?.freight_value){box.innerHTML='<div class="result warn"><h3>Quase lá</h3><p>Faltam informações para concluir o lançamento.</p></div>';return;}
        const db=JSON.parse(localStorage.getItem('assistente_operacional_v5')||'{}');
        const client=(db.clients||[]).find(c=>String(c.id)===String(p.client_id));
        const vehicle=(db.vehicles||[]).find(v=>String(v.id)===String(p.vehicle_id));
        if(typeof window.applyParsed==='function'){
          window.applyParsed({client,vehicle,value:p.freight_value,origin:p.origin||'',destination:p.destination||'',diesel:p.diesel||0,manut:p.maintenance||0,ped:p.toll||0,ter:p.outsourcing||0,alim:p.food||0});
          return;
        }
        original();
      }catch(e){box.innerHTML='<div class="result warn"><h3>IA indisponível</h3><p>'+String(e?.message||'Não foi possível interpretar agora.')+'</p></div>';}
    }
    resolveWithAI.__operaAI=true;
    window.resolveCommand=resolveWithAI;
    return true;
  }
  const timer=setInterval(()=>{if(boot())clearInterval(timer)},100);
  setTimeout(()=>clearInterval(timer),10000);
})();