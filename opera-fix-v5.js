/* OPERA ONE V8 — Motor semântico operacional
   Auditoria reforçada: fretes, coletas, terceirização, custos, horas extras,
   diárias, clientes, veículos e rotas. O motor é composicional: combina
   intenções, entidades, sinônimos e contexto, evitando uma lista literal de
   milhões de frases.
*/
(function(){
'use strict';
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const money=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const words={zero:0,um:1,uma:1,dois:2,duas:2,tres:3,quatro:4,cinco:5,seis:6,sete:7,oito:8,nove:9,dez:10,onze:11,doze:12,treze:13,quatorze:14,quinze:15,dezesseis:16,dezessete:17,dezoito:18,dezenove:19,vinte:20,trinta:30,quarenta:40,cinquenta:50,sessenta:60,setenta:70,oitenta:80,noventa:90,cem:100,cento:100,duzentos:200,duzentas:200,trezentos:300,trezentas:300,quatrocentos:400,quinhentos:500,seiscentos:600,setecentos:700,oitocentos:800,novecentos:900};
function wordNum(s){s=norm(s);if(words[s]!=null)return words[s];const p=s.split(/\s+e\s+/);if(p.length===2&&words[p[0]]!=null&&words[p[1]]!=null)return words[p[0]]+words[p[1]];return null}
function num(v){let s=String(v??'').trim().toLowerCase().replace(/r\$/g,'').replace(/reais?/g,'').replace(/\s/g,'');if(!s)return 0;let m=/^([0-9]+(?:[.,][0-9]+)?)mil$/.exec(s);if(m)return num(m[1])*1000;m=/^([a-z]+(?:[\s-]+[a-z]+)?)mil$/.exec(s);if(m){const n=wordNum(m[1]);if(n!=null)return n*1000}if(s.includes('.')&&s.includes(','))s=s.replace(/\./g,'').replace(',','.');else if(s.includes(','))s=s.replace(',','.');else if(/^\d+\.\d{3}$/.test(s))s=s.replace('.','');return Number(s)||0}
const N='(?:[0-9]+(?:[.,][0-9]+)?(?:\\s*mil)?|um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|quatorze|quinze|dezesseis|dezessete|dezoito|dezenove|vinte