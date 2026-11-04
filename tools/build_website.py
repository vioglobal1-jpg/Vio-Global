"""Builds the customer website from the Apps Script page.

The page keeps calling google.script.run. A small connector sends those calls
to the Apps Script doPost endpoint, so the website and the old link share one
set of features.
"""
import pathlib
import re

root = pathlib.Path(__file__).resolve().parent.parent
src = root / 'apps-script/wholesale/Index.html'
out = root / 'website'
out.mkdir(exist_ok=True)

API_URL = ('https://script.google.com/macros/s/AKfycbxMOyqd-1WXkf22QSwcu3pftN6z'
           'JYwxZ0gRtnkfXzaSpDJ673XJogIAO7fw3fYYpKp-/exec')
WHATSAPP = '201070000604'
PHONE = '+20 107 000 0604'
EMAIL = 'vioglobal1@gmail.com'

t = src.read_text(encoding='utf-8')
t = re.sub(r'\n\s*\n+', '\n', t)


def rep(a, b):
    global t
    assert t.count(a) == 1, (a[:60], t.count(a))
    t = t.replace(a, b)


rep('<base target="_top">', '''<title>VIO | Global Sourcing &amp; Wholesale</title>
  <meta name="description" content="Source products from China, Egypt and the UAE, and buy ready stock in wholesale quantities from VIO.">
  <meta property="og:title" content="VIO | Global Sourcing &amp; Wholesale">
  <meta property="og:description" content="Request a quotation or browse ready stock in Egypt and the UAE.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://viosourcing.com/">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23c6a052'/%3E%3Ctext x='50' y='70' font-size='62' font-family='Arial' font-weight='700' text-anchor='middle' fill='%23fff'%3EV%3C/text%3E%3C/svg%3E">
  <script>
  /* Connector: sends the page's server calls to the Apps Script endpoint. */
  (function(){
    var API='%API%';
    function call(){
      var ok=function(){},fail=function(){};
      var chain=new Proxy({},{get:function(_,name){
        if(name==='withSuccessHandler')return function(f){ok=f;return chain};
        if(name==='withFailureHandler')return function(f){fail=f;return chain};
        return function(){
          var args=Array.prototype.slice.call(arguments);
          fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({fn:name,args:args})})
            .then(function(r){return r.json()})
            .then(function(j){if(j.ok)ok(j.result);else fail(new Error(j.error||'Request failed'))})
            .catch(function(){fail(new Error('Connection problem. Please try again.'))});
        };
      }});
      return chain;
    }
    window.google={script:{get run(){return call()}}};
  })();
  </script>'''.replace('%API%', API_URL))

rep('''<div class="vio-switch"><button onclick="vioLanguage('en')">English</button><button onclick="vioLanguage('ar')">العربية</button></div>
</header>''', '''<nav class="vio-nav" aria-label="Main">
    <button type="button" onclick="vioOpenMarket('China')" data-vio-en="Products" data-vio-ar="المنتجات">Products</button>
    <button type="button" onclick="vioOpenMarket('Egypt')" data-vio-en="Egypt Stock" data-vio-ar="مخزون مصر">Egypt Stock</button>
    <button type="button" onclick="vioOpenMarket('Dubai')" data-vio-en="UAE Stock" data-vio-ar="مخزون الإمارات">UAE Stock</button>
    <button type="button" onclick="openCustomRequest()" data-vio-en="Request Sourcing" data-vio-ar="طلب توريد">Request Sourcing</button>
  </nav>
  <div class="vio-switch"><button onclick="vioLanguage('en')">English</button><button onclick="vioLanguage('ar')">العربية</button></div>
</header>''')

# Keep titles correct after a language change, and hide the home-only sections.
rep("document.getElementById('hero').style.display='none';document.getElementById('sections').style.display='none';\n document.getElementById('chinaPage').style.display='block';\n document.querySelector('#chinaPage .page-head h2').textContent=market==='China'?(document.documentElement.lang==='ar'?'مجموعة المنتجات العالمية':'Global Product Collection'):market+' Available Stock';\n document.querySelector('#chinaPage .page-head p').textContent=market==='China'?(document.documentElement.lang==='ar'?'استكشف منتجات مختارة وفرص توريد تناسب سوقك.':'Explore selected products and sourcing opportunities for your market.'):'Browse products currently available in '+market+'.';",
    "vioHomeVisible(false);\n"
    " const vioHead={China:['Global Product Collection','مجموعة المنتجات العالمية','Explore selected products and sourcing opportunities for your market.','استكشف منتجات مختارة وفرص توريد تناسب سوقك.'],Egypt:['Egypt Ready Stock','المخزون الجاهز في مصر','Products available now from our Egypt warehouse.','منتجات متوفرة الآن في مستودعنا في مصر.'],Dubai:['UAE Ready Stock','المخزون الجاهز في الإمارات','Products available now from our UAE warehouse.','منتجات متوفرة الآن في مستودعنا في الإمارات.']}[market];\n"
    " const vioH=document.querySelector('#chinaPage .page-head h2'),vioP=document.querySelector('#chinaPage .page-head p'),vioAr=document.documentElement.lang==='ar';\n"
    " vioH.setAttribute('data-vio-en',vioHead[0]);vioH.setAttribute('data-vio-ar',vioHead[1]);vioP.setAttribute('data-vio-en',vioHead[2]);vioP.setAttribute('data-vio-ar',vioHead[3]);vioH.textContent=vioAr?vioHead[1]:vioHead[0];vioP.textContent=vioAr?vioHead[3]:vioHead[2];")

rep("function backToHome(){vioCloseGallery();document.getElementById('chinaPage').style.display='none';document.getElementById('hero').style.display='block';document.getElementById('sections').style.display='block';window.scrollTo(0,0);}",
    "function vioHomeVisible(show){['hero','sections','vioFeatured','vioTrust','vioContact'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display=show?'block':'none'});const how=[...document.querySelectorAll('.vio-section-heading h2')].find(h=>h.getAttribute('data-vio-en')==='How VIO Works');const box=how&&how.closest('section');if(box)box.style.display=show?'block':'none';}\n"
    "function backToHome(){vioCloseGallery();document.getElementById('chinaPage').style.display='none';vioHomeVisible(true);window.scrollTo(0,0);}")

# Hidden field for simple spam protection.
rep("sourceOrigin:document.getElementById('qOrigin').value,",
    "sourceOrigin:document.getElementById('qOrigin').value,\n      website:(document.getElementById('qWebsite')||{}).value||'',")
rep('<div class="field" id="originWrap">',
    '<input id="qWebsite" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;opacity:0;height:0;width:0"><div class="field" id="originWrap">')

extra = '''
<section class="container" id="vioFeatured">
  <div class="vio-section-heading"><div><div class="vio-eyebrow" data-vio-en="TRENDING" data-vio-ar="الأكثر رواجًا">TRENDING</div><h2 data-vio-en="Trending Products" data-vio-ar="منتجات رائجة">Trending Products</h2></div><p data-vio-en="Selected by our sourcing team." data-vio-ar="يختارها فريق التوريد لدينا.">Selected by our sourcing team.</p></div>
  <div class="vio-feature-grid" id="vioTrendingGrid"><p class="vio-feature-note" data-vio-en="Loading products..." data-vio-ar="جارٍ تحميل المنتجات...">Loading products...</p></div>
  <div class="vio-section-heading vio-stock-heading"><div><div class="vio-eyebrow" data-vio-en="READY TO SHIP" data-vio-ar="جاهز للشحن">READY TO SHIP</div><h2 data-vio-en="Ready Stock in Egypt &amp; UAE" data-vio-ar="مخزون جاهز في مصر والإمارات">Ready Stock in Egypt &amp; UAE</h2></div><p data-vio-en="Available now from our warehouses." data-vio-ar="متوفر الآن في مستودعاتنا.">Available now from our warehouses.</p></div>
  <div class="vio-feature-grid" id="vioStockGrid"><p class="vio-feature-note" data-vio-en="Loading stock..." data-vio-ar="جارٍ تحميل المخزون...">Loading stock...</p></div>
</section>
<section class="container" id="vioTrust">
  <div class="vio-section-heading"><div><div class="vio-eyebrow" data-vio-en="WHY VIO" data-vio-ar="لماذا VIO">WHY VIO</div><h2 data-vio-en="One Partner From Request to Delivery" data-vio-ar="شريك واحد من الطلب حتى التسليم">One Partner From Request to Delivery</h2></div></div>
  <div class="vio-trust-grid">
    <div><b data-vio-en="Three sourcing markets" data-vio-ar="ثلاثة أسواق للتوريد">Three sourcing markets</b><p data-vio-en="Source from China, Egypt or the UAE." data-vio-ar="ورّد من الصين أو مصر أو الإمارات.">Source from China, Egypt or the UAE.</p></div>
    <div><b data-vio-en="Clear quotations" data-vio-ar="عروض أسعار واضحة">Clear quotations</b><p data-vio-en="Written quotes in English or Arabic." data-vio-ar="عروض أسعار مكتوبة بالعربية أو الإنجليزية.">Written quotes in English or Arabic.</p></div>
    <div><b data-vio-en="Follow your request" data-vio-ar="تابع طلبك">Follow your request</b><p data-vio-en="Messages and quotes in your VIO account." data-vio-ar="الرسائل والعروض في حسابك لدى VIO.">Messages and quotes in your VIO account.</p></div>
  </div>
</section>
<section class="container" id="vioContact">
  <div class="vio-contact-card"><div><h2 data-vio-en="Talk to VIO" data-vio-ar="تواصل مع VIO">Talk to VIO</h2><p>29 Al Nasr Street, New Maadi, Cairo, Egypt</p><p><a href="tel:%PHONELINK%" dir="ltr">%PHONE%</a> · <a href="mailto:%EMAIL%">%EMAIL%</a></p></div><a class="btn" href="https://wa.me/%WA%" target="_blank" rel="noopener" data-vio-en="Chat on WhatsApp" data-vio-ar="تحدث عبر واتساب">Chat on WhatsApp</a></div>
</section>
<style>
.vio-nav{display:flex;gap:6px;flex-wrap:wrap;align-items:center}.vio-nav button{background:none;border:0;color:var(--vio-ink);font:600 14px Arial,sans-serif;padding:9px 11px;border-radius:8px;cursor:pointer}.vio-nav button:hover{background:rgba(198,160,82,.14)}
.vio-feature-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:18px}.vio-feature-card{background:var(--vio-card);border:1px solid var(--vio-line);border-radius:14px;overflow:hidden;display:flex;flex-direction:column;text-align:start;padding:0;cursor:pointer;color:var(--vio-ink);font:inherit}.vio-feature-card:focus-visible{outline:2px solid #c6a052;outline-offset:2px}.vio-feature-card img{width:100%;height:190px;object-fit:contain;background:#fff}.vio-feature-photo{height:190px;display:flex;align-items:center;justify-content:center;background:#f7f4ec;color:#a77d32;font-weight:700}.vio-feature-body{padding:13px 14px 15px;display:flex;flex-direction:column;gap:5px}.vio-feature-body small{color:#a77d32;font-weight:700;letter-spacing:.06em;text-transform:uppercase}.vio-feature-body b{font-size:15px;line-height:1.3}.vio-feature-body span{color:var(--vio-muted);font-size:13px}
.vio-feature-note{color:var(--vio-muted);grid-column:1/-1}.vio-stock-heading{margin-top:38px}.vio-trust-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.vio-trust-grid>div{background:var(--vio-card);border:1px solid var(--vio-line);border-radius:14px;padding:20px}.vio-trust-grid p{color:var(--vio-muted);margin:8px 0 0}
.vio-contact-card{background:var(--vio-card);border:1px solid var(--vio-line);border-radius:16px;padding:26px;display:flex;justify-content:space-between;gap:18px;align-items:center;flex-wrap:wrap}.vio-contact-card h2{margin:0 0 8px}.vio-contact-card p{margin:4px 0;color:var(--vio-muted);overflow-wrap:anywhere}.vio-contact-card a:not(.btn){color:#a77d32}.vio-contact-card .btn{text-decoration:none}
.vio-legal{display:flex;gap:14px;flex-wrap:wrap}.vio-legal a{color:inherit;font-size:13px}
@media(max-width:900px){header{flex-wrap:wrap;gap:10px}.vio-nav{order:3;width:100%;overflow-x:auto;flex-wrap:nowrap}.vio-nav button{white-space:nowrap}.vio-trust-grid{grid-template-columns:1fr}}
</style>
<script>
(function(){
  const API_MARKETS=[['Egypt','مصر','Egypt'],['Dubai','الإمارات','UAE']];
  const ar=()=>document.documentElement.lang==='ar';
  function money(p){if(p.Price_Visibility==='Show'&&Number(p.Selling_Price)>0)return p.Currency+' '+Number(p.Selling_Price).toLocaleString('en-US');return ar()?'السعر عند الطلب':'Price on request';}
  function card(p,label,sub){
    const c=document.createElement('button');c.type='button';c.className='vio-feature-card';
    if(/^https:\\/\\//i.test(String(p.Image_URL||''))){const i=document.createElement('img');i.src=p.Image_URL;i.alt=p.Product_Name||'Product';i.loading='lazy';c.appendChild(i);}
    else{const d=document.createElement('div');d.className='vio-feature-photo';d.textContent='VIO';c.appendChild(d);}
    const b=document.createElement('div');b.className='vio-feature-body';
    const s=document.createElement('small');s.textContent=label;const n=document.createElement('b');n.textContent=p.Product_Name||'Product';const m=document.createElement('span');m.textContent=sub;
    b.append(s,n,m);c.appendChild(b);c.addEventListener('click',()=>vioShowGallery(p));return c;
  }
  function fill(id,cards,en,arabic){const g=document.getElementById(id);g.replaceChildren();if(cards.length){g.append(...cards);return;}const p=document.createElement('p');p.className='vio-feature-note';p.setAttribute('data-vio-en',en);p.setAttribute('data-vio-ar',arabic);p.textContent=ar()?arabic:en;g.appendChild(p);}
  google.script.run.withSuccessHandler(list=>{
    const items=(Array.isArray(list)?list:[]).slice(0,6).map(p=>card({...p,Product_Source:'China'},p.Category||(ar()?'توريد':'Sourcing'),(ar()?'الحد الأدنى: ':'MOQ: ')+(p.MOQ||(ar()?'عند الطلب':'On request'))));
    fill('vioTrendingGrid',items,'New products are coming soon.','منتجات جديدة قريبًا.');
  }).withFailureHandler(()=>fill('vioTrendingGrid',[],'Products could not load. Please refresh.','تعذر تحميل المنتجات. يرجى التحديث.')).getChinaProducts();
  Promise.all(API_MARKETS.map(m=>new Promise(res=>google.script.run.withSuccessHandler(l=>res((Array.isArray(l)?l:[]).filter(p=>p.Availability==='In Stock').map(p=>({...p,Product_Source:m[0],_m:m})))).withFailureHandler(()=>res([])).getVIOPublicStock(m[0])))).then(all=>{
    const items=all.flat().slice(0,6).map(p=>card(p,ar()?p._m[1]:p._m[2],money(p)));
    fill('vioStockGrid',items,'Ready stock is being updated.','يجري تحديث المخزون الجاهز.');
  });
})();
</script>
'''.replace('%PHONELINK%', '+' + WHATSAPP).replace('%PHONE%', PHONE).replace('%EMAIL%', EMAIL).replace('%WA%', WHATSAPP)

footer = '<footer class="vio-footer"><span>VIO · YOUR BEST CHOICE</span>'
rep(footer, extra + '<footer class="vio-footer"><span>VIO · YOUR BEST CHOICE</span><div class="vio-legal"><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a></div>')

(out / 'index.html').write_text(t, encoding='utf-8')

legal = '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>%TITLE% | VIO</title><style>body{font:16px/1.65 Arial,sans-serif;color:#25272a;background:#f3f4f6;margin:0}main{max-width:760px;margin:0 auto;padding:32px 16px}h1{font-size:30px}h2{font-size:19px;margin-top:26px}a{color:#a77d32}</style></head><body><main><p><a href="/">← VIO</a></p>%BODY%</main></body></html>'''
privacy = f'''<h1>Privacy Policy</h1><p>Last updated: 4 November 2026.</p>
<p>VIO Trading, 29 Al Nasr Street, New Maadi, Cairo, Egypt, runs this website.</p>
<h2>What we collect</h2><p>Your name, company, email, phone or WhatsApp number, the products you ask about, delivery country, messages and any photos you send.</p>
<h2>Why we use it</h2><p>To answer requests, prepare quotations, process orders, and contact you about them. We do not sell your information.</p>
<h2>Where it is stored</h2><p>We use service providers, including Google and Cloudflare, which may store information outside your country.</p>
<h2>How long we keep it</h2><p>We keep it for as long as we need it for your requests and for business and legal records.</p>
<h2>Your choices</h2><p>To see, correct or delete your information, or to withdraw consent, email <a href="mailto:{EMAIL}">{EMAIL}</a>.</p>'''
terms = f'''<h1>Terms of Use</h1><p>Last updated: 4 November 2026.</p>
<h2>Requests and quotations</h2><p>Sending a request does not create an order. A quotation is valid only for the period stated on it, and an order is confirmed only in writing by VIO.</p>
<h2>Products and availability</h2><p>Photos, availability and lead times are for guidance and may change. Stock is not reserved until an order is confirmed.</p>
<h2>Prices and shipping</h2><p>Each quotation states what its price includes. Customs duties, taxes, clearance and local delivery are extra unless the quotation says otherwise.</p>
<h2>Your responsibilities</h2><p>Please give accurate details and follow import rules in your destination country.</p>
<h2>Contact</h2><p>VIO Trading, 29 Al Nasr Street, New Maadi, Cairo, Egypt. <a href="mailto:{EMAIL}">{EMAIL}</a></p>'''
(out / 'privacy.html').write_text(legal.replace('%TITLE%', 'Privacy').replace('%BODY%', privacy), encoding='utf-8')
(out / 'terms.html').write_text(legal.replace('%TITLE%', 'Terms').replace('%BODY%', terms), encoding='utf-8')
(out / 'robots.txt').write_text('User-agent: *\nAllow: /\n', encoding='utf-8')
print('built', len(t))
