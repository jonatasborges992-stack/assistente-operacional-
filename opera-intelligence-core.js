window.OPERA_AI=window.OPERA_AI||{};
OPERA_AI.norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
OPERA_AI.money=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const W={um:1,uma:1,dois:2,duas:2,tres:3,quatro:4,cinco:5,seis:6,sete:7,oito:8,nove:9,dez:10,vinte:20,trinta:30,quarenta:40,cinquenta:50,cento:100,cem:100,duzentos:200,trezentos:300,quatrocentos:400,quinhentos:500,seiscentos:600,setecentos:700,oitocentos:800,novecentos:900};
function wordValue(s){let a=s.split(/\s+e\s+|\s+/),total=0,cur=0;for(const x of a){if(x==='mil'){total+=(cur||1)*1000;cur=0}else if(W[x]!=null)cur+=W[x];else return 0}return total+cur}
OPERA_AI.num=v=>{let s=String(v??'').trim().toLowerCase().replace(/r\$/g,'').replace(/reais?/g,'').trim();if(!s)return 0;if(/[a-z]/.test(s)){const w=wordValue(s);if(w)return w}let m=/^([0-9]+(?:[.,][0-9]+)?)\s*mil$/.exec(s.replace(/\s+/g,''));if(m)return OPERA_AI.num(m[1])*1000;s=s.replace(/\s/g,'');if(s.includes('.')&&s.includes(','))s=s.replace(/\./g,'').replace(',','.');else if(s.includes(','))s=s.replace(',','.');else if(/^\d+\.\d{3}$/.test(s))s=s.replace('.','');return Number(s)||0};
OPERA_AI.amounts=t=>{let r=[],m,re=/r\$?\s*([0-9]+(?:[.,][0-9]+)?(?:\s*mil)?)/gi;while((m=re.exec(t)))r.push([m.index,m[0],OPERA_AI.num(m[1])]);return r};
