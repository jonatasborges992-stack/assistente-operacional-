/* OPERA ONE V9.2.4 — entrada única: texto + voz + correção semântica */
(function(){'use strict';
const A=window.OPERA_AI;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
let rec=null,listening=false;
function field(){return document.getElementById('v16Command')}
function response(){return document.getElementById('v16Response')}
function status(){return document.getElementById('operaMainVoiceStatus')}
function setStatus(t){if(status())status().textContent=t}
function voiceSupported(){return !!(window.SpeechRecognition||window.webkitSpeechRecognition)}
function addVoiceUI(){
 const cmd=document.querySelector('.assist-command');
 if(!cmd||document.getElementById('operaMainVoiceBtn'))return;
 const wrap=document.createElement('div');wrap.className='opera-main-input-tools';
 wrap.innerHTML='<button id="operaMainVoiceBtn" type="button" class="voice-main-btn">🎙️ Falar</button><button id="operaMainTypeBtn" type="button" class="type-main-btn">⌨️ Digitar</button>';
 cmd.parentNode.insertBefore(wrap,cmd.nextSibling);
 const st=document.createElement('div');st.id='operaMainVoiceStatus';st.className='opera-main-voice-status';st.textContent='Você pode falar ou digitar. A correção automática acontece antes da interpretação.';wrap.parentNode.insertBefore(st,wrap.nextSibling);
 document.getElementById('operaMainVoiceBtn').onclick=toggleVoice;
 document.getElementById('operaMainTypeBtn').onclick=()=>{field()?.focus();setStatus('⌨️ Modo digitação ativo.');};
}
async function permission(){
 if(!navigator.mediaDevices?.getUserMedia)return true;
 try{const s=await navigator.mediaDevices.getUserMedia({audio:true});s.getTracks().forEach(t=>t.stop());return true}catch(e){setStatus('⚠️ Permissão do microfone bloqueada. Autorize o microfone e tente novamente.');return false}
}
async function toggleVoice(){
 const b=document.getElementById('operaMainVoiceBtn');
 if(listening&&rec){try{rec.stop()}catch(e){}return}
 if(!voiceSupported()){setStatus('⚠️ Este navegador não disponibiliza reconhecimento de voz. Use ⌨️ Digitar ou o ditado do teclado.');field()?.focus();return}
 if(!await permission())return;
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;rec=new SR();rec.lang='pt-BR';rec.continuous=false;rec.interimResults=true;rec.maxAlternatives=5;listening=true;
 if(b)b.textContent='⏹️ Parar';setStatus('🎙️ Ouvindo... fale o lançamento completo.');
 rec.onresult=e=>{let t='';for(let i=e.resultIndex;i<e.results.length;i++)t+=e.results[i][0].transcript+' ';if(field())field().value=t.trim();if(e.results[e.results.length-1].isFinal){setStatus('🧠 Voz recebida. Corrigindo e interpretando...');setTimeout(window.operaMainResolve,0)}};
 rec.onerror=e=>{const m={'no-speech':'Não ouvi sua fala.','not-allowed':'Permissão do microfone bloqueada.','service-not-allowed':'Reconhecimento de voz bloqueado pelo navegador.','audio-capture':'Microfone indisponível.'};setStatus('⚠️ '+(m[e.error]||'Não foi possível reconhecer a voz.'));};
 rec.onend=()=>{listening=false;if(b)b.textContent='🎙️ Falar';if(!status().textContent.startsWith('⚠️'))setStatus('🎙️ Pronto para novo lançamento.')};
 try{rec.start()}catch(e){listening=false;if(b)b.textContent='🎙️ Falar';setStatus('⚠️ Não foi possível iniciar o microfone.')}
}
function render(p,text,original){
 const client=A.findClient?A.findClient(text):null;const guess=A.clientGuess?A.clientGuess(A.norm(text)):'';const vehicle=A.findVehicle?A.findVehicle(text):null;const route=A.route?A.route(A.norm(text)):null;const type=A.type?A.type(text):'frete';
 const cost=Number(p.third||0)+Number(p.fuel||0)+Number(p.toll||0)+Number(p.food||0)+Number(p.hotel||0)+Number(p.maint||0)+Number(p.daily||0)+Number(p.hourTotal||0);const profit=Number(p.revenue||0)-cost;const margin=p.revenue?profit/p.revenue*100:0;
 const missing=[];if(!client)missing.push(guess?'cliente "'+guess+'" não cadastrado/confirmado':'cliente');if(!p.revenue)missing.push('valor do frete');if(!route)missing.push('origem e destino');if(p.hours&&!p.hourRate)missing.push('valor da hora extra');
 const out=response();if(!out)return;
 out.innerHTML='<div class="result '+(missing.length?'warn':'good')+'"><h3>'+(missing.length?'⚠️ Confira a interpretação':'✅ Lançamento entendido')+'</h3><p class="muted"><b>Texto corrigido:</b> '+esc(text)+(text!==original?' <span>• correção automática aplicada</span>':'')+'</p><div class="kpis"><div class="kpi"><span>Tipo</span><strong>'+esc(type)+'</strong></div><div class="kpi"><span>Cliente</span><strong>'+esc(client?.nome||guess||'Não identificado')+'</strong></div><div class="kpi"><span>Frete</span><strong>'+A.money(p.revenue)+'</strong></div><div class="kpi"><span>Fretes terceirizados</span><strong>'+A.money(p.third)+'</strong></div><div class="kpi"><span>Custos</span><strong>'+A.money(cost)+'</strong></div><div class="kpi"><span>Lucro</span><strong>'+A.money(profit)+'</strong></div><div class="kpi"><span>Margem</span><strong>'+(p.revenue?margin.toFixed(1)+'%':'—')+'</strong></div></div><p><b>Rota:</b> '+(route?esc(route[0])+' → '+esc(route[1]):'Não identificada')+(route?' <button class="secondary" style="padding:6px 9px" onclick="openMapsRoute('+JSON.stringify(route[0])+','+JSON.stringify(route[1])+')">🗺️ Maps</button>':'')+'</p><p><b>Combustível:</b> '+A.money(p.fuel)+' • <b>Pedágio:</b> '+A.money(p.toll)+' • <b>Alimentação:</b> '+A.money(p.food)+' • <b>Hotel:</b> '+A.money(p.hotel)+' • <b>Manutenção:</b> '+A.money(p.maint)+' • <b>Diárias:</b> '+A.money(p.daily)+' • <b>Horas extras:</b> '+A.money(p.hourTotal)+'</p>'+(missing.length?'<p class="muted"><b>Falta:</b> '+esc(missing.join(' • '))+' — corrija o texto acima e toque novamente em Resolver.</p>':'<div class="actions"><button class="green" id="mainAiConfirm">✓ Confirmar e registrar</button><button class="secondary" id="mainAiEdit">✎ Corrigir</button></div>')+'</div>';
 if(!missing.length){document.getElementById('mainAiConfirm').onclick=()=>confirmSmart({clientId:client.id,value:p.revenue,combust:p.fuel,toll:p.toll,food:p.food,hotel:p.hotel,third:p.third,maintenance:p.maint,driverDailyCount:0,driverDailyUnit:0,driverDailyTotal:p.daily,driverExtraHours:p.hours,driverExtraRate:p.hourRate,driverExtraTotal:p.hourTotal,route:route||['',''],vehicleId:vehicle?.id||null,km:0,operationType:type});document.getElementById('mainAiEdit').onclick=()=>{field()?.focus();field()?.setSelectionRange(field().value.length,field().value.length)}}
}
window.operaMainResolve=function(){const f=field(),original=(f?.value||'').trim();if(!original){setStatus('⚠️ Digite ou fale o lançamento.');return}try{const text=A.correctText?A.correctText(original):original;if(f)f.value=text;const p=A.parse(text);render(p,text,original);setStatus('✅ Interpretação pronta para conferência.')}catch(e){console.error(e);if(response())response().innerHTML='<div class="result bad"><b>⚠️ Não consegui interpretar este lançamento.</b><p>Corrija o texto e tente novamente.</p></div>';setStatus('⚠️ Erro na interpretação.')}};
window.v16HandleCommand=function(){window.operaMainResolve()};
function boot(){addVoiceUI()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();setTimeout(boot,500);setTimeout(boot,1500);
})();
