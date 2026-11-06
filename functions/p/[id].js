// Gives each product its own link with a preview for WhatsApp and Facebook, then sends visitors to the site.
const API='https://script.google.com/macros/s/AKfycbxMOyqd-1WXkf22QSwcu3pftN6zJYwxZ0gRtnkfXzaSpDJ673XJogIAO7fw3fYYpKp-/exec';
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function call(fn,...args){
  const r=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({fn,args}),signal:AbortSignal.timeout(7000)});
  const j=await r.json();if(!j.ok)throw new Error('api');return j.result||[];
}
async function catalog(){
  const cache=globalThis.caches&&caches.default,key=new Request('https://viosourcing.com/__catalog');
  if(cache){const hit=await cache.match(key);if(hit)return hit.json()}
  const lists=await Promise.all([call('getChinaProducts').catch(()=>[]),call('getVIOPublicStock','Egypt').catch(()=>[]),call('getVIOPublicStock','Dubai').catch(()=>[])]);
  const all=lists.flat();
  if(cache&&all.length)await cache.put(key,new Response(JSON.stringify(all),{headers:{'Content-Type':'application/json','Cache-Control':'max-age=600'}}));
  return all;
}
export async function onRequest({params,request}){
  const id=String(params.id||'').slice(0,80),origin=new URL(request.url).origin;
  let p=null;try{p=(await catalog()).find(x=>String(x.Product_ID)===id)}catch(e){}
  const target=`/#/product/${encodeURIComponent(id)}`;
  const name=p?`${p.Product_Name||'Product'} | VIO`:'VIO';
  const shown=p&&p.Price_Visibility==='Show'&&Number(p.Selling_Price)>0?`${p.Currency} ${Number(p.Selling_Price).toLocaleString('en-US')} · `:'';
  const about=p&&p.Description&&p.Description!=='Details available on request'?String(p.Description).slice(0,120):'توريد وجملة إلى مصر ودول الخليج';
  const image=p&&/^https:\/\//i.test(String(p.Image_URL||''))?p.Image_URL:`${origin}/assets/og.png`;
  const html=`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${esc(name)}</title><meta name="description" content="${esc(shown+about)}"><meta property="og:title" content="${esc(name)}"><meta property="og:description" content="${esc(shown+about)}"><meta property="og:image" content="${esc(image)}"><meta property="og:url" content="${esc(`${origin}/p/${encodeURIComponent(id)}`)}"><meta property="og:type" content="product"><meta name="twitter:card" content="summary_large_image"><meta http-equiv="refresh" content="0;url=${esc(target)}"><script>location.replace(${JSON.stringify(target).replace(/</g,'\\u003c')})</script></head><body><a href="${esc(target)}">${esc(name)}</a></body></html>`;
  return new Response(html,{status:p?200:404,headers:{'Content-Type':'text/html;charset=utf-8','Cache-Control':'public, max-age=300'}});
}
