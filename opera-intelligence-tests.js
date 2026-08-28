(function(){const A=window.OPERA_AI;
const cases=[
 ['terceiro',A.parse('frete R$ 7000 de Contagem para Betim paguei terceirizado R$ 6500'),7000,6500],
 ['terceiro ordem livre',A.parse('paguei R$ 6000 ao terceirizado, frete R$ 7000 para Mart Minas de BH pra Joao Monlevade'),7000,6000],
 ['custos',A.parse('frete R$7000 de Contagem para Betim gastei R$500 de combustivel mais R$50 de pedagio'),7000,0],
 ['coleta',A.parse('coleta R$4500 de Joao Monlevade para Belo Horizonte paguei terceiro R$4000'),4500,4000]
];
window.OPERA_AI_SELFTEST=cases.map(x=>({nome:x[0],ok:x[1].revenue===x[2]&&x[1].third===x[3],resultado:x[1]}));
window.OPERA_AI_SELFTEST_OK=window.OPERA_AI_SELFTEST.every(x=>x.ok);
})();
