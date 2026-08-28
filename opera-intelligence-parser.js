(function(){'use strict';const A=window.OPERA_AI;
const K={
 revenue:['frete','frete de','valor do frete','cobrei','faturei','faturamento','receita','serviço','servico'],
 third:['terceiro','terceirizado','terceirizada','terceirização','terceirizacao','terceirizados','repasse','repassado','repassar','parceiro','paguei ao terceiro','paguei o terceiro','paguei pro terceiro','paguei para o terceiro'],
 fuel:['combustível','combustivel','diesel','abastecimento','abasteci'],
 toll:['pedágio','pedagio'],
 food:['alimentação','alimentacao','refeição','refeicao','comida','almoco','almoço','jantar'],
 hotel:['hotel','hospedagem','pousada','pernoite'],
 maint:['manutenção','manutencao','oficina','reparo','revisão','revisao','conserto'],
 daily:['diária','diaria','diárias','diarias']
};
function amounts(s){
 const out=[];const re=/(?:r\$\s*)?([0-9]+(?:\.[0-9]{3})*(?:,[0-9]+)?|[0-9]+(?:[.,][0-9]+)?)(?:\s*mil)?/gi;let m;
 while((m=re.exec(s))){const raw=m[0];out.push({i:m.index,v:A.num(m[1]+(/\bmil\b/i.test(raw)?' mil':'')),raw});}
 return out;
}
function contextScore(ctx,terms,kind){
 let score=0;const c=ctx.toLowerCase();
 terms.forEach(t=>{if(c.includes(t.toLowerCase()))score+=20});
 if(kind==='revenue'&&/cobrei|faturei|faturamento|receita|valor do frete/.test(c))score+=100;
 if(kind==='third'&&/paguei|repass|terceir|parceiro/.test(c))score+=100;
 return score;
}
function pick(s,terms,kind,used){
 let best=null,bs=-1;
 for(const x of amounts(s)){
   if(used[x.i])continue;
   const left=s.slice(Math.max(0,x.i-100),x.i),right=s.slice(x.i,x.i+80),score=contextScore(left+' '+right,terms,kind);
   if(score>bs){bs=score;best=x;}
 }
 return bs>0?best:null;
}
function clientGuess(s){
 let m=s.match(/(?:pro|pra|para|cliente|com)\s+(.+?)(?=\s+(?:cobrei|faturei|de|do|da|por|no|ate|até|r\$|valor)|\s*,|$)/i);
 return m?m[1].trim():'';
}
function route(s){
 const patterns=[
   /(?:de|saindo de|origem)\s+(.+?)\s+(?:ate|até|para|pra|destino)\s+(.+?)(?=\s+(?:r\$|por|no valor|cobrei|paguei|gastei|e paguei|e gastei|combust|diesel|pedag|terceir|$))/i,
   /(.+?)\s+(?:ate|até|para|pra)\s+(.+?)(?=\s+(?:r\$|por|no valor|cobrei|paguei|gastei|e paguei|e gastei|combust|diesel|pedag|terceir|$))/i
 ];
 for(const re of patterns){const m=s.match(re);if(m&&m[1].trim()&&m[2].trim())return[m[1].trim(),m[2].trim()];}
 return null;
}
function hours(s){
 const m=s.match(/([0-9]+(?:[.,][0-9]+)?)\s*(?:h|horas?)\s*(?:extras?|extra)\b[^0-9]{0,30}(?:r\$\s*)?([0-9]+(?:[.,][0-9]+)?)/i);
 if(!m)return{hours:0,hourRate:0,hourTotal:0};const q=A.num(m[1]),r=A.num(m[2]);return{hours:q,hourRate:r,hourTotal:q*r};
}
A.parse=function(text){
 const s=A.norm(text),used={},p={revenue:0,third:0,fuel:0,toll:0,food:0,hotel:0,maint:0,daily:0,hours:0,hourRate:0,hourTotal:0};
 let x=pick(s,K.revenue,'revenue',used);if(x){p.revenue=x.v;used[x.i]=1;}
 x=pick(s,K.third,'third',used);if(x){p.third=x.v;used[x.i]=1;}
 for(const q of ['fuel','toll','food','hotel','maint','daily']){x=pick(s,K[q],q,used);if(x){p[q]=x.v;used[x.i]=1;}}
 Object.assign(p,hours(s));
 return p;
};
A.clientGuess=clientGuess;A.route=route;
})();
