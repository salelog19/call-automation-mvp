/**
 * Profitx.by Call Tracking
 * Usage:
 * <script async src="https://api.proaudio.by/scripts/phones.js?YOUR_PROJECT_ID"></script>
 */
(function(){
  'use strict';
  const C={
    url:'https://api.proaudio.by',
    pid:null, dph:null
  };
  // Read config from window
  if(window.CallTrackingConfig)Object.assign(C,window.CallTrackingConfig);
  // Read projectId from script's own query string
  if(!C.pid){
    const scripts=document.querySelectorAll('script[src*="phones.js"]');
    if(scripts.length){
      const src=scripts[scripts.length-1].getAttribute('src');
      const q=src.split('?')[1];
      if(q)C.pid=q.split('&')[0];
    }
  }
  const gS=()=>{
    let s=localStorage.getItem('ct_sid');
    if(!s){s='s_'+Date.now()+'_'+Math.random().toString(36).substr(2,9);localStorage.setItem('ct_sid',s)}
    return s;
  };
  const gU=()=>{
    try{
      if(typeof ym!='undefined'&&ym.getCid){const c=ym.getCid();if(c&&c[1]){localStorage.setItem('ct_ym',c[1]);return c[1]}}
      const m=document.cookie.match(/_ym_uid=([^;]+)/);if(m){localStorage.setItem('ct_ym',m[1]);return m[1]}
      return localStorage.getItem('ct_ym')||''
    }catch(e){return ''}
  };
  const gT=()=>{
  const p=new URLSearchParams(location.search);
  return{
    utmSource:p.get('utm_source')||'',
    utmMedium:p.get('utm_medium')||'',
    utmCampaign:p.get('utm_campaign')||'',
    utmTerm:p.get('utm_term')||'',
    utmContent:p.get('utm_content')||''
  }
};
  const rN=async()=>{
    if(!C.pid)return{error:'no_pid'};
    const b={projectId:C.pid,sessionId:gS(),ymUid:gU(),landingUrl:location.href,referrer:document.referrer||undefined,...gT(),visitedAt:new Date().toISOString()};
    try{
      const r=await fetch(C.url+'/assign-number',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
      if(!r.ok)return{error:'req_fail'};
      return await r.json()
    }catch(e){
  console.error('[CT] Fetch error:', e);
  return { error:'net_err' };
}
  };
  const sw=(rn,dp)=>{
    if(!rn&&!dp)return;
    const t=rn||dp;let c=0;
    document.querySelectorAll('[data-ct-phone],.ct-phone,a[href^="tel:"]').forEach(e=>{
      const op=e.getAttribute('data-ct-original')||e.textContent||e.getAttribute('href')||'';
      if(!op)return;
      if(!e.getAttribute('data-ct-original'))e.setAttribute('data-ct-original',op.replace(/^tel:/,''));
      if(e.tagName==='A'&&e.href.startsWith('tel:')){e.href='tel:'+t;if(e.textContent.match(/[\d\s+\-()]{7,}/))e.textContent=t}
      else e.textContent=t;c++
    });
    if(c===0){const re=/(\+?\d[\d\s+\-()]{7,}\d)/g,w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null,false),n=[];let t;while((t=w.nextNode()))if(re.test(t.textContent))n.push(t);n.forEach(x=>x.textContent=x.textContent.replace(re,t))}
    console.log('[CT] Swapped to:',t)
  };
  const init=async()=>{
    console.log('[CT] Init...');
    const r=await rN();
    if(r.error){console.warn('[CT] Fail, using default');if(C.dph)sw(null,C.dph);return}
    if(r.shownPhoneNumber)sw(r.shownPhoneNumber,C.dph);
    else if(r.defaultPhone)sw(r.defaultPhone,C.dph)
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init()
})();
