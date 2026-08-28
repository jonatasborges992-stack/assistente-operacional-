window.OPERA_AI=window.OPERA_AI||{};
const A=window.OPERA_AI;
A.norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[\u2018\u2019]/g,"'").replace(/\s+/g,' ').trim();
A.money=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const W={um:1,uma:1,dois:2,duas:2,tres:3,quatro:4,cinco:5,seis:6,sete:7,oito:8,nove:9,dez:10,vinte:20,trinta:30,quarenta:40,cinquenta:50,cento:100,cem:100,duzentos:200,trezentos:300,quatrocentos:400,quinhentos:500,seiscentos:600,setecentos:700,oitocentos:800,novecentos:900};
function wordValue(s){let a=s.split(/\s+e\s+|\s+/),total=0,cur=0;for(const x of a){if(x==='mil'){total+=(cur||1)*1000;cur=0}else if(W[x]!=null)cur+=W[x];else return 0}return total+cur}
A.num=v=>{let s=String(v??'').trim().toLowerCase().replace(/r\$/g,'').replace(/reais?/g,'').trim();if(!s)return 0;if(/[a-z]/.test(s)){const w=wordValue(s);if(w)return w}let m=/^([0-9]+(?:[.,][0-9]+)?)\s*mil$/.exec(s.replace(/\s+/g,''));if(m)return A.num(m[1])*1000;s=s.replace(/\s/g,'');if(s.includes('.')&&s.includes(','))s=s.replace(/\./g,'').replace(',','.');else if(s.includes(','))s=s.replace(',','.');else if(/^\d+\.\d{3}$/.test(s))s=s.replace('.','');return Number(s)||0};
A.amounts=t=>{let r=[],m,re=/(?:r\$\s*)?([0-9]+(?:\.[0-9]{3})*(?:,[0-9]+)?|[0-9]+(?:[.,][0-9]+)?)(?:\s*mil)?/gi;while((m=re.exec(t))){const raw=m[0];if(/^\d+$/.test(raw)&&!/(?:r\$|valor|frete|combust|diesel|pedag|hotel|aliment|manut|terceir|diar|hora|paguei|cobrei|faturei)/i.test(t.slice(Math.max(0,m.index-45),m.index+45)))continue;r.push([m.index,raw,A.num(m[1]+(/\bmil\b/i.test(raw)?' mil':''))]);}return r};
A.correctText=function(text){let s=String(text??'').replace(/[\n\r]+/g,' ').replace(/\s+/g,' ').trim();const fixes=[[/\bmartin\s+minas\b/gi,'Mart Minas'],[/\bmartim\s+minas\b/gi,'Mart Minas'],[/\bterceirizados?\b/gi,'terceirizado'],[/\bterceirizadas?\b/gi,'terceirizado'],[/\bterceirizacao\b/gi,'terceirização'],[/\bcombustivel\b/gi,'combustível'],[/\bpedagio\b/gi,'pedágio'],[/\balimentacao\b/gi,'alimentação'],[/\bmanutencao\b/gi,'manutenção'],[/\bdiarias?\b/gi,'diária'],[/\bhora[s]?\s+extra[s]?\b/gi,'horas extras'],[/\bpra\b/gi,'para'],[/\bpro\b/gi,'para'],[/\bpaguei\s+(?:o|os|a|as)\s+terceirizado[s]?\b/gi,'paguei ao terceirizado'],[/\bpaguei\s+(?:para|pro)\s+terceirizado[s]?/gi,'paguei ao terceirizado'],[/\bgastei\s+de\s+/gi,'gastei '],[/\bno\s+valor\s+de\s+(?!r\$)/gi,'no valor de R$ '],[/\bvalor\s+de\s+(?!r\$)/gi,'valor de R$ '],[/\br\$\s*/gi,'R$ ']];fixes.forEach(([re,x])=>s=s.replace(re,x));return s.replace(/\s+/g,' ').trim();};
A.canonicalize=A.correctText;

/* OPERA ONE — injeta o botão de áudio diretamente na ÚNICA entrada principal. */
(function(){
 const install=()=>{
  const field=document.getElementById('v16Command');
  if(!field)return false;
  if(document.getElementById('operaMainVoiceBtn'))return true;
  const wrap=field.parentElement;if(!wrap)return false;
  const btn=document.createElement('button');btn.id='operaMainVoiceBtn';btn.type='button';btn.className='green';btn.textContent='🎙️ Falar';btn.setAttribute('aria-label','Falar lançamento por áudio');btn.style.minWidth='130px';
  wrap.appendChild(btn);
  const status=document.createElement('div');status.id='operaMainVoiceStatus';status.className='muted';status.style.marginTop='8px';status.setAttribute('aria-live','polite');status.textContent='🎙️ Fale o lançamento completo.';wrap.parentElement.appendChild(status);
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;let rec=null,listening=false,base='';
  btn.onclick=()=>{
   if(listening){listening=false;try{rec&&rec.stop()}catch(e){}return;}
   if(!SR){status.textContent='⚠️ Áudio não disponível neste navegador. Use o ditado do teclado.';field.focus();return;}
   rec=new SR();rec.lang='pt-BR';rec.continuous=true;rec.interimResults=true;rec.maxAlternatives=1;base=field.value.trim();listening=true;btn.textContent='⏹️ Parar';status.textContent='🎙️ Ouvindo… pode fazer pausas; o texto será preservado.';
   rec.onresult=e=>{let fin='',tmp='';for(let i=e.resultIndex;i<e.results.length;i++){const t=e.results[i][0]?.transcript||'';if(e.results[i].isFinal)fin+=' '+t;else tmp+=' '+t;}field.value=(base+' '+fin+' '+tmp).replace(/\s+/g,' ').trim();field.dispatchEvent(new Event('input',{bubbles:true}));if(fin)base=field.value.trim();};
   rec.onerror=e=>{if(e.error!=='aborted')status.textContent='⚠️ '+(e.error==='not-allowed'?'Permita o microfone.':'O texto capturado foi preservado; você pode continuar digitando.')};
   rec.onend=()=>{if(listening){try{rec.start()}catch(_){}}else{btn.textContent='🎙️ Falar';status.textContent='✅ Áudio finalizado. Revise e toque em Resolver.'}};
   try{rec.start()}catch(e){listening=false;btn.textContent='🎙️ Falar';status.textContent='⚠️ Não foi possível iniciar o áudio.'}
  };
  return true;
 };
 const boot=()=>{if(!install())setTimeout(boot,200)};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
