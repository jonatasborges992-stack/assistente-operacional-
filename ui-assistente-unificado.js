/* OPERA ONE — Assistente Inteligente unificado V1
   Um único lugar para lançar: texto + voz + pausa + continuar + corrigir + apagar + concluir.
   Remove a antiga caixa de voz da primeira tela e concentra tudo no Assistente Inteligente.
*/
(function(){
  'use strict';
  function clean(s){return String(s||'').replace(/\s+/g,' ').trim()}
  function boot(){
    const home=document.querySelector('.assist-home');
    const tools=document.querySelector('.more-tools');
    const card=[...document.querySelectorAll('section.card')].find(x=>/Assistente Inteligente/i.test(x.querySelector('h2')?.textContent||''));
    const panel=document.getElementById('operaVoicePanel');
    const topInput=document.getElementById('v16Command');
    const smart=document.getElementById('smartText');
    if(!tools||!card||!panel||!topInput||!smart)return false;

    // A antiga área da primeira tela deixa de existir visualmente.
    if(home)home.style.display='none';

    // O Assistente Inteligente passa a ser a única área de lançamento.
    tools.open=true;
    tools.style.maxWidth='920px';
    const summary=tools.querySelector(':scope > summary');
    if(summary)summary.style.display='none';

    // Mostra a seção inteligente e move para dentro dela todos os controles de voz.
    card.style.display='block';
    card.style.marginTop='0';
    const title=card.querySelector('h2');
    if(title)title.textContent='🧠 Assistente Inteligente';
    const desc=card.querySelector('.muted');
    if(desc)desc.textContent='Fale ou digite normalmente. O mesmo Assistente interpreta a operação, calcula custos, terceirização, lucro e margem e mostra o resultado antes de registrar.';

    // O campo antigo de entrada fica oculto; o campo do Assistente Inteligente é o único visível.
    topInput.style.display='none';
    const topCommand=topInput.closest('.assist-command');
    if(topCommand)topCommand.style.display='none';
    const topResolver=topCommand?.querySelector('button');
    if(topResolver)topResolver.style.display='none';

    // Remove qualquer painel duplicado existente e coloca o único painel dentro do Assistente.
    panel.style.marginTop='14px';
    const oldParent=panel.parentElement;
    card.insertBefore(panel,card.querySelector('#smartResult')||null);

    // Sincronização: a lógica de voz existente continua usando v16Command, mas o usuário só vê smartText.
    let syncing=false;
    function syncFromSmart(){if(syncing)return;syncing=true;topInput.value=smart.value;syncing=false}
    function syncFromTop(){if(syncing)return;syncing=true;smart.value=topInput.value;syncing=false}
    smart.addEventListener('input',syncFromSmart);
    topInput.addEventListener('input',syncFromTop);
    smart.addEventListener('change',syncFromSmart);
    topInput.addEventListener('change',syncFromTop);
    syncFromSmart();

    // Todos os comandos passam pelo mesmo interpretador.
    const analyze=document.getElementById('smartResult');
    const oldInterpret=window.interpretSmart;
    window.interpretSmart=function(){syncFromSmart();return typeof oldInterpret==='function'?oldInterpret():undefined};

    // Remove atalhos que criariam uma segunda porta de lançamento.
    const quick=document.querySelector('.quick-actions');
    if(quick)quick.style.display='none';

    // Se o painel for recriado por outro script, reposiciona novamente.
    const observer=new MutationObserver(()=>{
      const p=document.getElementById('operaVoicePanel');
      if(p && p.parentElement!==card)card.insertBefore(p,card.querySelector('#smartResult')||null);
    });
    observer.observe(document.body,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),15000);
    return true;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{let n=0;const i=setInterval(()=>{if(boot()||++n>30)clearInterval(i)},250)});
  else {let n=0;const i=setInterval(()=>{if(boot()||++n>30)clearInterval(i)},250)}
})();
