(function(){
'use strict';
const A=window.OPERA_AI;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
window.interpretSmart=function(){
 const field=document.getElementById('smartText'),out=document.getElementById('smartResult');
 const original=(field?.value||'').trim();
 if(!original){if(out)out.innerHTML='<div class="result warn"><b>⚠️ Digite ou fale o lançamento.</b></div>';return;}
 try{
   const text=A.correctText?A.correctText(original):original;
   if(field)field.value=text;
   const p=A.parse(text);
   const client=A.findClient?A.findClient(text):null;
   const guess=A.clientGuess?A.clientGuess(A.norm(text)):'';
   const vehicle=A.findVehicle?A.findVehicle(text):null;
   const route=A.route?A.route(A.norm(text)):null;
   const type=A.type?A.type(text):(/\b(coleta|coletei|coletar|coletado)\b/i.test(A.norm(text))?'coleta':'frete');
   const cost=Number(p.third||0)+Number(p.fuel||0)+Number(p.toll||0)+Number(p.food||0)+Number(p.hotel||0)+Number(p.maint||0)+Number(p.daily||0)+Number(p.hourTotal||0);
   const profit=Number(p.revenue||0)-cost;
   const margin=p.revenue?profit/p.revenue*100:0;
   const missing=[];
   if(!client)missing.push(guess?'confirme/cadastre o cliente "'+guess+'"':'cliente');
   if(!p.revenue)missing.push('valor do frete');
   if(!route)missing.push('origem e destino');
   if(p.hours&&!p.hourRate)missing.push('valor de cada hora extra');
   const confidence=Math.min(99,Math.round((client?30:guess?20:5)+(p.revenue?30:0)+(route?25:0)+(p.third||cost?10:5)+5));
   const clientLabel=client?.nome||guess||'Não identificado';
   out.innerHTML=`<div class="result ${missing.length?'warn':'good'}">
     <h3>${missing.length?'⚠️ Confira a interpretação':'✅ Entendi o lançamento'}</h3>
     <p class="muted"><b>Texto entendido:</b> ${esc(text)}${text!==original?' <span>• corrigido automaticamente</span>':''}</p>
     <div class="kpis">
       <div class="kpi"><span>Tipo</span><strong>${esc(type)}</strong></div>
       <div class="kpi"><span>Cliente</span><strong>${esc(clientLabel)}</strong></div>
       <div class="kpi"><span>Frete</span><strong>${A.money(p.revenue)}</strong></div>
       <div class="kpi"><span>Terceirização</span><strong>${A.money(p.third)}</strong></div>
       <div class="kpi"><span>Custos totais</span><strong>${A.money(cost)}</strong></div>
       <div class="kpi"><span>Lucro</span><strong>${A.money(profit)}</strong></div>
       <div class="kpi"><span>Margem</span><strong>${p.revenue?margin.toFixed(1)+'%':'—'}</strong></div>
     </div>
     <p><b>Rota:</b> ${route?esc(route[0])+' → '+esc(route[1]):'Não identificada'} ${route?`<button class="secondary" style="padding:6px 9px;margin-left:6px" onclick="openMapsRoute(${JSON.stringify(route[0])},${JSON.stringify(route[1])})">🗺️ Maps</button>`:''}</p>
     <p><b>Combustível:</b> ${A.money(p.fuel)} • <b>Pedágio:</b> ${A.money(p.toll)} • <b>Alimentação:</b> ${A.money(p.food)} • <b>Hotel:</b> ${A.money(p.hotel)} • <b>Manutenção:</b> ${A.money(p.maint)} • <b>Diárias:</b> ${A.money(p.daily)} • <b>Horas extras:</b> ${A.money(p.hourTotal)}</p>
     <p><b>Confiança da interpretação:</b> ${confidence}%</p>
     ${missing.length?`<p class="muted"><b>Para registrar:</b> ${esc(missing.join(' • '))}. O texto acima já pode ser corrigido manualmente e interpretado novamente.</p>`:`<div class="actions"><button class="green" id="aiConfirm">✓ Confirmar e registrar</button><button class="secondary" id="aiCorrect">✎ Corrigir texto</button></div>`}
   </div>`;
   if(!missing.length){
     document.getElementById('aiConfirm').onclick=()=>confirmSmart({clientId:client.id,value:p.revenue,combust:p.fuel,toll:p.toll,food:p.food,hotel:p.hotel,third:p.third,maintenance:p.maint,driverDailyCount:0,driverDailyUnit:0,driverDailyTotal:p.daily,driverExtraHours:p.hours,driverExtraRate:p.hourRate,driverExtraTotal:p.hourTotal,route:route||['',''],vehicleId:vehicle?.id||null,km:0,operationType:type});
     document.getElementById('aiCorrect').onclick=()=>{field.focus();field.setSelectionRange(field.value.length,field.value.length)};
   }
 }catch(err){console.error('OPERA ONE interpreter',err);out.innerHTML='<div class="result bad"><b>⚠️ Erro interno de interpretação.</b><p>O texto foi preservado. Edite e tente novamente.</p></div>';}
};

/* V9.2.5 — botão Falar visível na ENTRADA PRINCIPAL. */
function addMainVoiceButton(){
 const cmd=document.querySelector('.assist-home .assist-command');
 if(!cmd||document.getElementById('operaMainVoiceBtn'))return;
 const btn=document.createElement('button');
 btn.id='operaMainVoiceBtn';btn.type='button';btn.className='green opera-main-voice-btn';btn.textContent='🎙️ Falar';
 btn.onclick=mainVoiceToggle;
 cmd.appendChild(btn);
 const st=document.createElement('div');st.id='operaMainVoiceStatus';st.className='muted';st.style.marginTop='8px';st.setAttribute('aria-live','polite');st.textContent='🎙️ Toque em Falar para lançar por voz.';
 cmd.parentNode.insertBefore(st,cmd.nextSibling);
}
let mainRec=null,mainListening=false;
function mainVoiceToggle(){
 const b=document.getElementById('operaMainVoiceBtn'),st=document.getElementById('operaMainVoiceStatus'),f=document.getElementById('v16Command');
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(mainListening&&mainRec){try{mainRec.stop()}catch(e){}return;}
 if(!SR){if(st)st.textContent='⚠️ Seu navegador não oferece reconhecimento de voz. Use o ditado do teclado.';return;}
 mainRec=new SR();mainRec.lang='pt-BR';mainRec.continuous=false;mainRec.interimResults=true;mainRec.maxAlternatives=3;mainListening=true;
 if(b)b.textContent='⏹️ Parar';if(st)st.textContent='🎙️ Ouvindo... fale o lançamento completo.';
 mainRec.onresult=e=>{let t='';for(let i=e.resultIndex;i<e.results.length;i++)t+=e.results[i][0].transcript+' ';if(f)f.value=t.trim();if(e.results[e.results.length-1].isFinal){if(st)st.textContent='🧠 Interpretando sua fala...';setTimeout(()=>window.v16HandleCommand(),0)}};
 mainRec.onerror=e=>{if(st)st.textContent='⚠️ '+(e.error==='not-allowed'?'Permissão do microfone bloqueada.':e.error==='no-speech'?'Não ouvi sua fala.':'Não foi possível reconhecer a voz.');};
 mainRec.onend=()=>{mainListening=false;if(b)b.textContent='🎙️ Falar';if(st&&!st.textContent.startsWith('⚠️'))st.textContent='🎙️ Pronto para novo lançamento.';};
 try{mainRec.start()}catch(e){mainListening=false;if(b)b.textContent='🎙️ Falar';if(st)st.textContent='⚠️ Não foi possível iniciar o microfone.';}
}
function bootMainVoice(){addMainVoiceButton();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootMainVoice);else bootMainVoice();
setTimeout(bootMainVoice,300);setTimeout(bootMainVoice,1000);setTimeout(bootMainVoice,2000);
})();
