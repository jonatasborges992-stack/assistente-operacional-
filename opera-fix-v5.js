/* OPERA ONE V5.2 — interpretação fiel do lançamento falado. */
(function(){
  function n(v){const s=String(v??'').trim().replace(/R\$/ig,'').replace(/\s/g,'');if(!s)return 0;if(s.includes(',')&&s.includes('.'))return Number(s.replace(/\./g,'').replace(',','.'))||0;if(s.includes(','))return Number(s.replace(',','.'))||0;if(s.includes('.')&&s.split('.').pop().length===3)return Number(s.replace('.',''))||0;return Number(s)||0;}
  function money(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
  function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
  function cost(text,labels){
    const t=norm(text),ls=labels.map(norm).join('|');
    let m=t.match(new RegExp('(?:'+ls+')\\s*(?:de|do|da|com|em|por|no valor de|e|:)?\\s*r?\\$?\\s*([0-9][0-9.,]*)','i'));if(m)return n(m[1]);
    m=t.match(new RegExp('r?\\$?\\s*([0-9][0-9.,]*)\\s*(?:de|do|da|com|em|por|e)?\\s*(?:'+ls+')(?:\\s|,|;|$)','i'));if(m)return n(m[1]);
    return 0;
  }
  function hours(text){
    const t=norm(text);let m=t.match(/\b([0-9]+(?:[.,][0-9]+)?)\s*h[0-9]{0,2}\s*(?:extras?|extra)?\s*(?:a|de|por|no valor de|:)?\s*r?\$?\s*([0-9]+(?:[.,][0-9]+)?)/i);
    if(!m)m=t.match(/\b([0-9]+(?:[.,][0-9]+)?)\s*horas?\s*extras?\s*(?:a|de|por|no valor de|:)?\s*r?\$?\s*([0-9]+(?:[.,][0-9]+)?)/i);
    return m?{q:n(m[1]),rate:n(m[2]),total:n(m[1])*n(m[2])}:{q:0,rate:0,total:0};
  }
  function esc2(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
  window.interpretSmart=function(){
    try{
      const field=document.getElementById('smartText'),out=document.getElementById('smartResult');const text=(field?.value||'').trim();if(!text){alert('Digite ou fale o lançamento.');return;}
      const t=norm(text);const clients=(typeof db!=='undefined'&&Array.isArray(db.clients))?db.clients:[];const client=clients.find(c=>t.includes(norm(c.nome)))||null;
      let clientFallback='';const cm=text.match(/\bfrete\s+(?:pro|para o|para a|para)\s+([^,;]+?)(?=\s+(?:no valor|por|de\s+r?\$|de\s+contagem|saindo)|,|;|$)/i);if(cm)clientFallback=cm[1].trim();
      const value=text.match(/(?:frete|faturamento)\s*(?:pro|para|de|no valor de|por)?\s*r?\$?\s*([0-9][0-9.,]*)/i)||text.match(/\b(?:valor|por)\s*r?\$?\s*([0-9][0-9.,]*)/i);const frete=value?n(value[1]):0;
      const fuel=cost(text,['diesel','combustivel','combustível']),toll=cost(text,['pedagio','pedágio']),food=cost(text,['alimentacao','alimentação','refeicao','refeição']),hotel=cost(text,['hotel','hospedagem']),third=cost(text,['terceirizacao','terceirização','terceiro','terceirizado']),maintenance=cost(text,['manutencao','manutenção','oficina','reparo','revisao','revisão']),ex=hours(text);
      let route=null;const rm=text.match(/\b(?:de|saindo de)\s+(.+?)\s+(?:para|até|ate)\s+(.+?)(?=\s+(?:gastei|gaste|mais|mas|com|e\s+\d|e\s+(?:hotel|pedagio|alimentacao|manutencao|diesel)|por|no valor)|\s*,|$)/i);if(rm)route=[rm[1].trim(),rm[2].trim()];
      if(!route){const rm2=text.match(/\b([A-Za-zÀ-ÿ ]+?)\s+para\s+([A-Za-zÀ-ÿ ]+?)(?=\s+(?:gastei|gaste|mais|mas|com|e\s+\d|e\s+(?:hotel|pedagio|alimentacao|manutencao|diesel))|,|$)/i);if(rm2)route=[rm2[1].trim(),rm2[2].trim()];}
      const costs=fuel+toll+food+hotel+third+maintenance+ex.total,profit=frete-costs,margin=frete?profit/frete*100:0,missing=[];
      if(!client)missing.push(clientFallback?'cadastre o cliente "'+clientFallback+'"':'cliente');if(!frete)missing.push('valor do frete');if(!route)missing.push('origem e destino');if(/hora|extra|\bh\d/i.test(t)&&ex.q&&!ex.rate)missing.push('valor por hora extra');
      const items=[['Combustível',fuel],['Pedágio',toll],['Alimentação',food],['Hotel',hotel],['Manutenção',maintenance],['Horas extras',ex.total],['Terceirização',third]].filter(x=>x[1]>0);
      const payload={clientId:client?.id||null,value:frete,combust:fuel,toll,food,hotel,third,maintenance,driverExtraHours:ex.q,driverExtraRate:ex.rate,driverExtraTotal:ex.total,route:route||['',''],vehicleId:null,km:0};
      out.innerHTML=`<div class="result ${missing.length?'warn':'good'}"><h3>${missing.length?'⚠️ Conferência do lançamento':'✅ Lançamento reconhecido'}</h3><div class="smart-summary"><div><span>Cliente</span><b>${esc2(client?.nome||clientFallback||'—')}</b></div><div><span>Frete</span><b>${money(frete)}</b></div><div><span>Custos</span><b>${money(costs)}</b></div><div class="profit-box"><span>Resultado</span><b>${money(profit)}</b></div></div><div class="smart-details"><p><b>Rota:</b> ${route?esc2(route[0])+' → '+esc2(route[1]):'não identificada'}</p><p>${items.length?items.map(x=>'<b>'+x[0]+':</b> '+money(x[1])).join(' • '):'Nenhum custo identificado'}</p>${ex.q?`<p><b>Horas extras:</b> ${ex.q}h × ${money(ex.rate)}/h = ${money(ex.total)}</p>`:''}<p><b>Margem:</b> ${frete?margin.toFixed(1)+'%':'—'}</p></div>${missing.length?'<div class="missing-box">Falta: <b>'+missing.join(', ')+'</b></div>':'<div class="actions compact-actions"><button class="green primary-action" id="v5ConfirmBtn">✓ Confirmar lançamento</button><button class="secondary" id="v5CorrectBtn">✎ Corrigir</button></div>'}</div>`;
      if(!missing.length){document.getElementById('v5ConfirmBtn').onclick=()=>confirmSmart(payload);document.getElementById('v5CorrectBtn').onclick=()=>field.focus();}
    }catch(e){console.error(e);document.getElementById('smartResult').innerHTML='<div class="result bad"><b>Não consegui interpretar este lançamento.</b><p>Revise o texto e tente novamente.</p></div>';}
  };
})();
