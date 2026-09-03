(function(){
  function localDate(){const d=new Date(),p=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())}
  function num(v){if(typeof window.num==='function')return window.num(v);const n=Number(String(v??'').replace(/\./g,'').replace(',','.'));return Number.isFinite(n)?n:0}
  function cost(s){return num(s?.custos)||num(s?.combustivel??s?.comb)+num(s?.pedagio??s?.ped)+num(s?.terceirizacao??s?.ter)+num(s?.alimentacao??s?.alim)+num(s?.hospedagem??s?.hotel)+num(s?.diarias??s?.motoristaDiarias)+num(s?.horas??s?.horasExtras)+num(s?.manut??s?.manutencao)+num(s?.outros)}
  function value(s){return num(s?.faturamento??s?.valor??s?.value)}
  function inClosure(id){const data=JSON.parse(localStorage.getItem('assistente_operacional_v5')||'{}');return (data.closures||[]).some(c=>(c.serviceIds||[]).some(x=>String(x)===String(id)))}
  function patch(){
    if(typeof window.serviceCost!=='function'||typeof window.serviceValue!=='function')return false;
    window.serviceCost=cost;window.serviceValue=value;
    if(typeof window.markReceived==='function'&&!window.markReceived.__operaSafe){const original=window.markReceived;window.markReceived=function(id){original(id);try{const d=JSON.parse(localStorage.getItem('assistente_operacional_v5')||'{}'),s=(d.services||[]).find(x=>String(x.id)===String(id));if(s){s.valorRecebido=value(s);localStorage.setItem('assistente_operacional_v5',JSON.stringify(d));}if(typeof window.refresh==='function')window.refresh()}catch(e){}};window.markReceived.__operaSafe=true}
    if(typeof window.deleteService==='function'&&!window.deleteService.__operaSafe){window.deleteService=function(id){if(inClosure(id))return alert('Este serviço já foi incluído em um fechamento e não pode ser excluído. Preserve o histórico financeiro.');if(confirm('Excluir este serviço?')){const d=JSON.parse(localStorage.getItem('assistente_operacional_v5')||'{}');d.services=(d.services||[]).filter(x=>String(x.id)!==String(id));localStorage.setItem('assistente_operacional_v5',JSON.stringify(d));if(typeof window.refresh==='function')window.refresh()}};window.deleteService.__operaSafe=true}
    if(typeof window.saveEditedService==='function'&&!window.saveEditedService.__operaSafe){const original=window.saveEditedService;window.saveEditedService=function(){const id=window.__operaEditingServiceId;original();if(id&&window.__operaEditingServiceId!==id)try{const d=JSON.parse(localStorage.getItem('assistente_operacional_v5')||'{}'),s=(d.services||[]).find(x=>String(x.id)===String(id));if(s){s.valorRecebido=s.status==='Recebido'?value(s):0;localStorage.setItem('assistente_operacional_v5',JSON.stringify(d));}}catch(e){}};window.saveEditedService.__operaSafe=true}
    return true
  }
  let tries=0;const t=setInterval(()=>{if(patch()||++tries>100)clearInterval(t)},100);patch();
  window.operaLocalDate=localDate;
})();