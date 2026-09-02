/* OPERA ONE — compatibilidade DOM
   Corrige a dependência do núcleo em variáveis globais criadas automaticamente
   a partir de IDs HTML. Não altera regras de negócio, dados ou cálculos. */
(function(){
  const ids=[
    'command','homeKpis','actionCenter','recentServices','brain',
    'sData','sCliente','sVeiculo','sStatus','sOrigem','sDestino','sValor','sKm',
    'sComb','sPed','sTer','sAlim','sHotel','sDiarias','sHorasQtd','sHorasRate','sHoras',
    'sManut','sOutros','serviceSearch','servicesTable','crCliente','crDe','crAte','crStatus','receivableBox',
    'fCliente','fDe','fAte','fPeriodo','financeKpis','clientProfit','costBreakdown',
    'cmpA','cmpB','cmpDe','cmpAte','compareResult',
    'vNome','vPlaca','vConsumo','vehicleList','cNome','cContato','cCnpj','clientList',
    'voiceDot','voiceStatus','modal','modalTitle','modalBody'
  ];
  ids.forEach(id=>{
    if(!document.getElementById(id)) return;
    if(typeof window[id]==='undefined') window[id]=document.getElementById(id);
  });
  window.__operaDomCompatLoaded=true;
  if(typeof window.init==='function'){
    try{ window.init(); }catch(error){
      console.error('OPERA ONE: falha na inicialização',error);
      const home=document.getElementById('inicio');
      if(home) home.classList.add('active');
    }
  }
})();
