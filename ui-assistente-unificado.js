/* OPERA ONE — LANÇAMENTO ÚNICO V2
   "O que você precisa fazer?" + "Interpretar lançamento" = UMA ÚNICA ÁREA.
   Voz, pausa, continuar, corrigir, apagar e interpretar usam o mesmo campo.
*/
(function(){
  'use strict';
  function clean(s){return String(s||'').replace(/\s+/g,' ').trim()}

  function boot(){
    const home=document.querySelector('.assist-home');
    const hero=document.querySelector('.assist-hero');
    const tools=document.querySelector('.more-tools');
    const oldCard=[...document.querySelectorAll('.more-tools section.card')].find(x=>/Assistente Inteligente/i.test(x.querySelector('h2')?.textContent||''));
    const panel=document.getElementById('operaVoicePanel');
    const topInput=document.getElementById('v16Command');
    const smart=document.getElementById('smartText');
    const smartResult=document.getElementById('smartResult');
    if(!home||!hero||!tools||!oldCard||!panel||!topInput||!smart||!smartResult)return false;

    /* A PRIMEIRA TELA é a única área de lançamento. */
    home.style.display='block';
    hero.style.display='block';
    tools.open=true;
    tools.style.maxWidth='1200px';

    const summary=tools.querySelector(':scope > summary');
    if(summary)summary.style.display='none';

    /* Remove a segunda caixa "Assistente Inteligente / Interpretar lançamento".
       As funções internas continuam no projeto, mas o usuário não vê nem usa uma segunda entrada. */
    oldCard.style.display='none';

    const title=hero.querySelector('h2');
    if(title)title.textContent='🧠 Assistente Inteligente — Lançamento único';
    const desc=hero.querySelector('.assist-hero > p');
    if(desc)desc.textContent='Fale ou digite tudo de uma vez. O Assistente interpreta a operação, calcula custos, terceirização, lucro e margem e mostra o resultado aqui.';

    /* A caixa de texto visível é a entrada oficial. O motor antigo usa smartText,
       portanto mantemos os dois IDs sincronizados sem criar outra tela. */
    const command=topInput.closest('.assist-command');
    if(command)command.style.display='block';
    topInput.style.display='block';
    topInput.rows=4;
    topInput.placeholder='Ex.: Fiz um frete para Mart Minas, Contagem para Betim por R$ 7.000, terceirizado por R$ 6.500, combustível R$ 500 e pedágio R$ 50.';

    let syncing=false;
    function syncToEngine(){
      if(syncing)return;
      syncing=true;
      smart.value=topInput.value;
      syncing=false;
    }
    function syncToScreen(){
      if(syncing)return;
      syncing=true;
      topInput.value=smart.value;
      syncing=false;
    }
    topInput.addEventListener('input',syncToEngine);
    topInput.addEventListener('change',syncToEngine);
    smart.addEventListener('input',syncToScreen);
    smart.addEventListener('change',syncToScreen);
    syncToEngine();

    /* O botão Resolver/Interpretar da primeira tela chama EXATAMENTE o mesmo interpretador. */
    const resolver=command?.querySelector('button');
    if(resolver){
      resolver.textContent='🧠 Interpretar lançamento';
      resolver.className='green';
      resolver.onclick=function(){
        syncToEngine();
        if(typeof window.interpretSmart==='function'){
          window.interpretSmart();
          setTimeout(()=>{
            if(smartResult.innerHTML) document.getElementById('v16Response').innerHTML=smartResult.innerHTML;
          },0);
        }
      };
    }

    /* Resultado do motor volta para a mesma primeira tela. */
    const response=document.getElementById('v16Response');
    if(response && smartResult.innerHTML && !response.innerHTML)response.innerHTML=smartResult.innerHTML;

    /* O painel de voz fica imediatamente abaixo do campo, na MESMA área. */
    panel.style.display='block';
    panel.style.marginTop='12px';
    hero.insertBefore(panel,hero.querySelector('.quick-actions')||hero.querySelector('#v16Response')||null);

    /* Não existem atalhos que abram outro lançamento. */
    const quick=hero.querySelector('.quick-actions');
    if(quick)quick.style.display='none';

    /* O painel já contém Falar/Pausar/Continuar/Corrigir/Apagar/Concluir.
       Mantemos tudo junto da única entrada. */
    return true;
  }

  function start(){
    let n=0;
    const timer=setInterval(()=>{
      if(boot()||++n>40)clearInterval(timer);
    },250);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
