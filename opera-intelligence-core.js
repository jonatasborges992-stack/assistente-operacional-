window.OPERA_AI=window.OPERA_AI||{};
OPERA_AI.norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
OPERA_AI.money=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
OPERA_AI.num=v=>{let s=String(v??'').trim().toLowerCase().replace(/r\$/g,'').replace(/reais?/g,'').replace(/\s/g,'');if(!s)return 0;let m=/^([0-9]+(?:[.,][0-9]+)?)mil$/.exec(s);if(m)return OPERA_AI.num(m[1])*1000;if(s.includes('.')&&s.includes(','))s=s.replace(/\./g,'').replace(',','.');else if(s.includes(','))s=s.replace(',','.');else if(/^\d+\.\d{3}$/.test(s))s=s.replace('.','');return Number(s)||0};
OPERA_AI.amounts=t=>{let r=[],m;let re=/r\$?\s*([0-9]+(?:[.,][0-9]+)?(?:\s*mil)?)/gi;while((m=re.exec(t)))r.push([m.index,m[0],OPERA_AI.num(m[1])]);return r};
