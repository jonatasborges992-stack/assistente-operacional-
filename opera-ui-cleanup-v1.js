/* OPERA ONE UI CLEANUP V1 — garante uma única área de lançamento e um único botão de áudio */
(function(){'use strict';
function cleanDuplicateVoiceUI(){
  const home=document.querySelector('.assist-home');
  if(!home)return;
  /* Remove interfaces antigas/duplicadas */
  home.querySelectorAll('#voiceV9,#operaVoicePanel,#voiceV8,.opera-old-voice-panel').forEach(e=>e.remove());
  const tools=home.querySelectorAll('.opera-main-input-tools');
  tools.forEach((e,i)=>{if(i>0)e.remove()});
  const statuses=home.querySelectorAll('#operaMainVoiceStatus');
  statuses.forEach((e,i)=>{if(i>0)e.remove()});
  /* Se o controlador principal ainda não criou os controles, cria somente o botão de áudio como fallback. */
  const cmd=home.querySelector('.assist-command');
  if(cmd && !home.querySelector('#operaMainVoiceBtn')){
    const old=cmd.querySelector('button');
    if(old)old.remove();
    const b=document.createElement('button');
    b.id='operaMainVoiceBtn';
    b.type='button';
    b.className='green';
    b.style.cssText='width:100%;min-height:58px;margin-top:10px;font-weight:800;border-radius:14px';
    b.textContent='🎙️ Falar';
    b.onclick=function(){
      if(typeof window.operaStartVoice==='function')window.operaStartVoice();
      else if(typeof window.startOperaVoice==='function')window.startOperaVoice();
      else if(window.webkitSpeechRecognition||window.SpeechRecognition){
        const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
        const r=new SR();r.lang='pt-BR';r.continuous=true;r.interimResults=true;
        r.onresult=function(e){let t='';for(let i=0;i<e.results.length;i++)t+=e.results[i][0].transcript+' ';const f=document.getElementById('v16Command');if(f)f.value=t.trim()};
        try{r.start()}catch(e){}
      }
    };
    cmd.appendChild(b);
  }
}
function boot(){cleanDuplicateVoiceUI();setTimeout(cleanDuplicateVoiceUI,300);setTimeout(cleanDuplicateVoiceUI,900);setTimeout(cleanDuplicateVoiceUI,1800)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
