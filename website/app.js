'use strict';
const CONFIG={
  api:'https://script.google.com/macros/s/AKfycbxMOyqd-1WXkf22QSwcu3pftN6zJYwxZ0gRtnkfXzaSpDJ673XJogIAO7fw3fYYpKp-/exec',
  whatsapp:'201070000604',
  quoteHours:48,
  countries:['Egypt','UAE','Saudi Arabia','Kuwait','Qatar','Bahrain','Oman']
};
const I18N={
ar:{skip:'تخطى إلى المحتوى',navHome:'الرئيسية',navProducts:'المنتجات',navStock:'مخزون جاهز',navRequest:'اطلب سعر',navRequestShort:'اطلب سعر',navOrders:'طلباتي',whatsapp:'واتساب',footShip:'نوصل إلى مصر، الإمارات، السعودية، الكويت، قطر، البحرين وعُمان.',footCity:'القاهرة',privacy:'الخصوصية',terms:'الشروط',
kicker:'لأصحاب صفحات البيع والمتاجر الإلكترونية',heroTitle:'أرسل صورة المنتج، واحصل على سعره حتى باب مخزنك',heroLead:'توريد من الصين إلى مصر ودول الخليج، ومخزون جاهز في مصر والإمارات.',ctaQuote:'اطلب سعر الآن',ctaStock:'تصفح المخزون الجاهز',
quickTitle:'طلب سعر سريع',quickHint:'ارفع صورة المنتج وأكمل طلبك في خطوة واحدة.',
speed:'سرعة',speedText:h=>`عرض سعر مكتوب خلال ${h} ساعة في أيام العمل.`,price:'سعر واضح',priceText:'اعرف تكلفة البضاعة والشحن قبل تأكيد الطلب.',door:'من الباب للباب',doorText:'نتابع الشحن حتى تصل بضاعتك لمخزنك.',
catsTitle:'تسوق حسب القسم',catAll:'الكل',catElectronics:'إلكترونيات',catCosmetics:'مستحضرات تجميل',catHome:'منتجات منزلية',catElectronicsText:'إكسسوارات وأجهزة مطلوبة للبيع أونلاين',catCosmeticsText:'منتجات مختارة للعناية والجمال',catHomeText:'أدوات عملية للبيت والمطبخ',
trendTitle:'منتجات مختارة',stockTitle:'مخزون جاهز للشحن',seeAll:'عرض الكل',egypt:'مصر',uae:'الإمارات',
howTitle:'كيف تعمل VIO',step:'الخطوة',s1:'أرسل طلبك',s1t:'صورة أو رابط، مع الكمية ومكان التوصيل.',s2:'استلم السعر',s2t:'عرض واضح بالعربية بعملتك.',s3:'أكد الطلب',s3t:'وافق واتفق على طريقة الدفع.',s4:'تابع حتى التسليم',s4t:'شوف كل مرحلة من صفحة طلباتي.',
loading:'جارٍ التحميل...',noProducts:'منتجات جديدة قريبًا. أرسل لنا المنتج الذي تحتاجه وسنوفره لك.',loadError:'تعذر التحميل. حاول مرة أخرى.',retry:'حاول مرة أخرى',search:'ابحث عن منتج',productsTitle:'المنتجات',stockPage:'المخزون الجاهز',
moq:'الحد الأدنى',onRequest:'عند الطلب',priceOnRequest:'السعر عند الطلب',leadDays:'مدة التوريد',days:'يوم',requestThis:'اطلب هذا المنتج',close:'إغلاق',outOfStock:'غير متوفر حاليًا',
reqTitle:'اطلب سعر',reqLead:h=>`عرض سعر مكتوب خلال ${h} ساعة في أيام العمل.`,photoLabel:'التقط صورة للمنتج أو ارفعها',photoHint:'حتى 5 صور: JPG أو PNG أو WEBP',productName:'اسم المنتج',link:'رابط المنتج (اختياري)',qty:'الكمية',category:'القسم',source:'مصدر التوريد',bestOption:'الأفضل لي',china:'الصين',dest:'التوصيل إلى',city:'المدينة',shipping:'طريقة الشحن',sea:'بحري',air:'جوي',name:'الاسم',company:'اسم الصفحة أو المتجر (اختياري)',wa:'رقم واتساب',email:'البريد الإلكتروني',emailHint:'نرسل عليه عرض السعر ورمز دخول حسابك.',notes:'ملاحظات (اختياري)',send:'إرسال الطلب',sending:'جارٍ الإرسال...',needProduct:'أضف صورة أو اكتب اسم المنتج.',tooMany:'يمكنك رفع 5 صور كحد أقصى.',badPhoto:'استخدم صورة JPG أو PNG أو WEBP.',
sent:'تم إرسال طلبك',sentText:'سنراجع طلبك ونرسل لك عرض السعر. احتفظ برقم الطلب.',viewOrders:'تابع طلباتك',newReq:'طلب جديد',
Saudi:'السعودية',Kuwait:'الكويت',Qatar:'قطر',Bahrain:'البحرين',Oman:'عُمان',
signTitle:'طلباتي',signLead:'ادخل بالبريد الإلكتروني الذي استخدمته في طلبك، وسنرسل لك رمزًا.',sendCode:'إرسال الرمز',code:'الرمز المكون من 6 أرقام',verify:'دخول',changeEmail:'تغيير البريد',signOut:'خروج',codeSent:'تم إرسال الرمز إذا كان البريد صحيحًا.',
tabRequests:'الطلبات',tabQuotes:'عروض الأسعار',tabOrders:'الشحنات',noRequests:'لا توجد طلبات بعد.',noQuotes:'لا توجد عروض أسعار بعد.',noOrders:'لا توجد شحنات بعد.',
total:'الإجمالي',unit:'سعر القطعة',validity:'صلاحية العرض',lead:'مدة التوريد المتوقعة',accept:'قبول العرض',reject:'رفض',counter:'طلب تعديل',confirmAccept:'هل تريد قبول هذا العرض؟',confirmReject:'هل تريد رفض هذا العرض؟',yes:'نعم، تأكيد',no:'لا',counterText:'اكتب طلبك',counterTotal:'السعر الإجمالي المطلوب (اختياري)',sendCounter:'إرسال الطلب',decisionSaved:'تم حفظ ردك.',track:'تتبع الطلب',
aboutTitle:'شريكك في التوريد',aboutText:'شركة توريد وتجارة جملة مقرها القاهرة، تعمل مع البائعين والمتاجر في مصر ودول الخليج.',aboutAddr:'٢٩ شارع النصر، المعادي الجديدة، القاهرة، مصر',contactUs:'تواصل معنا',orderTitle:'تتبع الطلب',eta:'الوصول المتوقع',tracking:'رقم التتبع',payment:'الدفع',statusNow:'الحالة الآن',messages:'الرسائل',writeMsg:'اكتب رسالتك',sendMsg:'إرسال',back:'رجوع',cancelled:'تم إلغاء هذا الطلب.',
navCalc:'حاسبة الربح',
payTitle:'طريقة الدفع',payChina:'التوريد من الصين',payChinaText:'30% مقدم لبدء الطلب، و70% بعد الفحص وقبل الشحن.',payStock:'المخزون الجاهز',payStockText:'الدفع كاملًا قبل الشحن.',payWays:'وسائل الدفع',payWaysText:'مصر: تحويل بنكي، إنستاباي أو فودافون كاش. الخليج: تحويل بنكي.',payNote:'شروط كل طلب مكتوبة في عرض السعر.',
calcBandTitle:'اعرف ربحك قبل ما تطلب',calcBandText:'احسب ربح القطعة وسعر التعادل في أقل من دقيقة.',calcOpen:'افتح حاسبة الربح',
calcTitle:'حاسبة الربح',calcLead:'أدخل أرقامك بعملة واحدة لتعرف ربحك المتوقع.',calcCost:'تكلفة القطعة',calcSell:'سعر البيع للقطعة',calcShip:'تكلفة توصيل الطلب لعميلك',calcAds:'تكلفة الإعلان لكل طلب',calcReturns:'نسبة المرتجعات %',calcQty:'الكمية',calcProfit:'الربح لكل قطعة',calcMargin:'هامش الربح',calcTotal:'إجمالي الربح المتوقع',calcBreak:'سعر التعادل',calcHint:'هذه الأرقام تقديرية. نحسب تكلفة التوصيل والإعلان على كل طلب، حتى لو رجع.',calcCta:'اطلب سعر القطعة من VIO',
waFollow:'أرسل الطلب على واتساب',waFollowText:'أسرع طريقة للمتابعة معنا.',waReq:(id,n,q)=>`مرحبًا VIO، أرسلت طلب سعر رقم ${id}${n?` للمنتج: ${n}`:''}${q?`، الكمية: ${q}`:''}.`,waQuote:(n)=>`مرحبًا VIO، لدي سؤال عن عرض السعر: ${n}`,waProduct:(n)=>`مرحبًا VIO، أريد الاستفسار عن: ${n}`,askQuote:'اسأل على واتساب',askProduct:'اسأل على واتساب',share:'شارك على واتساب',copyLink:'انسخ الرابط',copied:'تم نسخ الرابط',notFound:'هذا المنتج غير متاح الآن.',allProducts:'كل المنتجات',
stInspection:'فحص الجودة',stCustoms:'التخليص الجمركي',
chatOpen:'اسأل VIO',chatTitle:'مساعد VIO',chatSub:'مساعد آلي للأسئلة الشائعة',chatHello:'أهلًا بك في VIO. اختر سؤالًا أو اكتب سؤالك.',chatPlaceholder:'اكتب سؤالك',chatSend:'إرسال',chatNo:'لم أفهم سؤالك بالكامل. فريقنا يجيبك على واتساب.',
stConfirmed:'تأكيد الطلب',stProduction:'الإنتاج',stReady:'جاهز للشحن',stTransit:'في الطريق',stDelivered:'التسليم',doneLbl:'تم',nowLbl:'الآن',nextLbl:'لاحقًا',
status:{'New Request':'طلب جديد','In Sourcing':'جارٍ التوريد','Quoted':'تم إرسال السعر','Closed':'مغلق','Sent':'بانتظار ردك','Accepted':'مقبول','Rejected':'مرفوض','Revision Requested':'طلب تعديل','Confirmed':'مؤكد','In Production':'في الإنتاج','Quality Inspection':'فحص الجودة','Customs Clearance':'التخليص الجمركي','Ready to Ship':'جاهز للشحن','In Transit':'في الطريق','Delivered':'تم التسليم','Cancelled':'ملغي','Unpaid':'غير مدفوع','Partially Paid':'مدفوع جزئيًا','Paid':'مدفوع'}},
en:{skip:'Skip to content',navHome:'Home',navProducts:'Products',navStock:'Ready stock',navRequest:'Get a price',navRequestShort:'Get a price',navOrders:'My orders',whatsapp:'WhatsApp',footShip:'We deliver to Egypt, UAE, Saudi Arabia, Kuwait, Qatar, Bahrain and Oman.',footCity:'Cairo',privacy:'Privacy',terms:'Terms',
kicker:'For social sellers and online stores',heroTitle:'Send a product photo and get its price delivered to your door',heroLead:'Sourcing from China to Egypt and the GCC, with ready stock in Egypt and the UAE.',ctaQuote:'Get a price now',ctaStock:'See ready stock',
quickTitle:'Quick quote',quickHint:'Add a photo or a product name in the next step.',
speed:'Fast',speedText:h=>`A written quote within ${h} hours on working days.`,price:'Clear price',priceText:'Know the goods and shipping cost before you confirm.',door:'Door to door',doorText:'We follow your shipment until it reaches your door.',
catsTitle:'Shop by category',catAll:'All',catElectronics:'Electronics',catCosmetics:'Cosmetics',catHome:'Home',catElectronicsText:'Accessories and devices for online sellers',catCosmeticsText:'Selected beauty and care products',catHomeText:'Practical products for home and kitchen',
trendTitle:'Selected products',stockTitle:'Ready to ship',seeAll:'See all',egypt:'Egypt',uae:'UAE',
howTitle:'How VIO works',step:'Step',s1:'Send your request',s1t:'A photo or link, with quantity and delivery location.',s2:'Get your price',s2t:'A clear quote in your currency.',s3:'Confirm',s3t:'Accept and agree payment.',s4:'Track to delivery',s4t:'Follow every stage in My orders.',
loading:'Loading...',noProducts:'New products are coming soon. Tell us what you need and we will source it.',loadError:'Could not load. Please try again.',retry:'Try again',search:'Search products',productsTitle:'Products',stockPage:'Ready stock',
moq:'MOQ',onRequest:'On request',priceOnRequest:'Price on request',leadDays:'Lead time',days:'days',requestThis:'Request this product',close:'Close',outOfStock:'Out of stock',
reqTitle:'Get a price',reqLead:h=>`A written quote within ${h} hours on working days.`,photoLabel:'Take or upload a product photo',photoHint:'Up to 5 photos: JPG, PNG or WEBP',productName:'Product name',link:'Product link (optional)',qty:'Quantity',category:'Category',source:'Source from',bestOption:'Best option for me',china:'China',dest:'Deliver to',city:'City',shipping:'Shipping',sea:'Sea',air:'Air',name:'Your name',company:'Page or store name (optional)',wa:'WhatsApp number',email:'Email',emailHint:'We send your quote and sign-in code here.',notes:'Notes (optional)',send:'Send request',sending:'Sending...',needProduct:'Add a photo or a product name.',tooMany:'You can upload up to 5 photos.',badPhoto:'Use a JPG, PNG or WEBP photo.',
sent:'Your request was sent',sentText:'We will review it and send your quote. Keep your reference.',viewOrders:'View my orders',newReq:'New request',
Saudi:'Saudi Arabia',Kuwait:'Kuwait',Qatar:'Qatar',Bahrain:'Bahrain',Oman:'Oman',
signTitle:'My orders',signLead:'Enter the email you used on your request and we will send a code.',sendCode:'Send code',code:'6-digit code',verify:'Sign in',changeEmail:'Change email',signOut:'Sign out',codeSent:'If that email is correct, your code is on its way.',
tabRequests:'Requests',tabQuotes:'Quotes',tabOrders:'Orders',noRequests:'No requests yet.',noQuotes:'No quotes yet.',noOrders:'No orders yet.',
total:'Total',unit:'Unit price',validity:'Valid for',lead:'Estimated lead time',accept:'Accept quote',reject:'Reject',counter:'Ask for a change',confirmAccept:'Accept this quote?',confirmReject:'Reject this quote?',yes:'Yes, confirm',no:'No',counterText:'What would you like to change?',counterTotal:'Requested total (optional)',sendCounter:'Send',decisionSaved:'Your response was saved.',track:'Track order',
aboutTitle:'Your sourcing partner',aboutText:'A sourcing and wholesale company based in Cairo, working with sellers and stores across Egypt and the GCC.',aboutAddr:'29 Al Nasr Street, New Maadi, Cairo, Egypt',contactUs:'Contact us',orderTitle:'Track order',eta:'Estimated arrival',tracking:'Tracking number',payment:'Payment',statusNow:'Current status',messages:'Messages',writeMsg:'Write a message',sendMsg:'Send',back:'Back',cancelled:'This order was cancelled.',
navCalc:'Profit calculator',
payTitle:'How payment works',payChina:'Sourcing from China',payChinaText:'30% deposit to start, and 70% after inspection and before shipping.',payStock:'Ready stock',payStockText:'Full payment before dispatch.',payWays:'Ways to pay',payWaysText:'Egypt: bank transfer, InstaPay or Vodafone Cash. GCC: bank transfer.',payNote:'The terms for each order are written on your quote.',
calcBandTitle:'Know your profit before you order',calcBandText:'Work out profit per piece and your break-even price in under a minute.',calcOpen:'Open the calculator',
calcTitle:'Profit calculator',calcLead:'Enter your numbers in one currency to see your expected profit.',calcCost:'Cost per piece',calcSell:'Selling price per piece',calcShip:'Delivery cost per order',calcAds:'Ad cost per order',calcReturns:'Return rate %',calcQty:'Quantity',calcProfit:'Profit per piece',calcMargin:'Profit margin',calcTotal:'Expected total profit',calcBreak:'Break-even price',calcHint:'These are estimates. Delivery and ad costs count on every order, even if it comes back.',calcCta:'Get a unit price from VIO',
waFollow:'Send your request on WhatsApp',waFollowText:'The fastest way to follow up with us.',waReq:(id,n,q)=>`Hello VIO, I sent price request ${id}${n?` for: ${n}`:''}${q?`, quantity: ${q}`:''}.`,waQuote:(n)=>`Hello VIO, I have a question about my quote: ${n}`,waProduct:(n)=>`Hello VIO, I would like to ask about: ${n}`,askQuote:'Ask on WhatsApp',askProduct:'Ask on WhatsApp',share:'Share on WhatsApp',copyLink:'Copy link',copied:'Link copied',notFound:'This product is not available right now.',allProducts:'All products',
stInspection:'Quality inspection',stCustoms:'Customs clearance',
chatOpen:'Ask VIO',chatTitle:'VIO assistant',chatSub:'Automated help for common questions',chatHello:'Welcome to VIO. Pick a question or type your own.',chatPlaceholder:'Type your question',chatSend:'Send',chatNo:'I could not fully understand that. Our team can help on WhatsApp.',
stConfirmed:'Order confirmed',stProduction:'Production',stReady:'Ready to ship',stTransit:'In transit',stDelivered:'Delivered',doneLbl:'Done',nowLbl:'Now',nextLbl:'Later',
status:{}}
};
const ICONS={Electronics:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/></svg>',Cosmetics:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6v5H9zM8 8h8l1 13H7z"/></svg>',Home:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 11 12 4l8.5 7M6 9.5V20h12V9.5"/></svg>'};
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}},sget(k){try{return sessionStorage.getItem(k)}catch(e){return null}},sset(k,v){try{sessionStorage.setItem(k,v)}catch(e){}},sdel(k){try{sessionStorage.removeItem(k)}catch(e){}}};
let lang=store.get('vioLang')==='en'?'en':'ar';
const t=(k,...a)=>{const v=I18N[lang][k];return typeof v==='function'?v(...a):(v===undefined?k:v)};
const st=s=>(I18N[lang].status||{})[s]||s||'';
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=(s,r=document)=>r.querySelector(s);
const app=$('#app');
const money=(c,v)=>`${esc(c||'')} ${Number(v||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const uuid=()=>(crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(16).slice(2)).replace(/[^a-zA-Z0-9-]/g,'');
const httpsUrl=u=>/^https:\/\//i.test(String(u||''))?String(u):'';
const waLink=text=>`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
const countryLabel=c=>({Egypt:t('egypt'),UAE:t('uae'),'Saudi Arabia':t('Saudi'),Kuwait:t('Kuwait'),Qatar:t('Qatar'),Bahrain:t('Bahrain'),Oman:t('Oman')}[c]||c);

async function api(fn,...args){
  let r;
  try{r=await fetch(CONFIG.api,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({fn,args})})}
  catch(e){throw new Error(t('loadError'))}
  let j;try{j=await r.json()}catch(e){throw new Error(t('loadError'))}
  if(!j.ok)throw new Error(j.error||t('loadError'));
  return j.result;
}
const cache={};
const load=(k,fn)=>cache[k]||(cache[k]=fn().catch(e=>{delete cache[k];throw e}));
const china=()=>load('china',()=>api('getChinaProducts'));
const stock=m=>load('stock'+m,()=>api('getVIOPublicStock',m));

function catOf(p){
  const c=`${p.Category||''}`.toLowerCase();
  if(/electr|إلكتر|الكتر|security/.test(c))return'electronics';
  if(/cosmet|beauty|تجميل/.test(c))return'cosmetics';
  if(/home|منزل|مطبخ|kitchen/.test(c))return'home';
  return'';
}
function card(p,label,sub,idx,list){
  const img=httpsUrl(p.Image_URL);
  return `<button type="button" class="item" data-list="${list}" data-idx="${idx}">${img?`<img class="thumb" loading="lazy" src="${esc(img)}" alt="${esc(p.Product_Name)}">`:'<span class="nophoto">VIO</span>'}<span class="item-body"><small>${esc(label)}</small><b>${esc(p.Product_Name)}</b><span>${esc(sub)}</span></span></button>`;
}
const priceText=p=>p.Availability==='Out of Stock'?t('outOfStock'):(p.Price_Visibility==='Show'&&Number(p.Selling_Price)>0?`${p.Currency} ${Number(p.Selling_Price).toLocaleString('en-US')}`:t('priceOnRequest'));
const chinaSub=p=>`${t('moq')}: ${p.MOQ||t('onRequest')}`;
const catLabel=p=>({electronics:t('catElectronics'),cosmetics:t('catCosmetics'),home:t('catHome')}[catOf(p)]||p.Category||'');
const lists={};
function fillGrid(id,items,list,labelFn,subFn){
  lists[list]=items;
  const el=document.getElementById(id);if(!el)return;
  el.innerHTML=items.length?items.map((p,i)=>card(p,labelFn(p),subFn(p),i,list)).join(''):`<p class="empty" style="grid-column:1/-1">${esc(t('noProducts'))}</p>`;
}
document.addEventListener('click',e=>{const b=e.target.closest('.item');if(b)openProduct(lists[b.dataset.list][Number(b.dataset.idx)])});

function productHTML(p,page){
  const media=(Array.isArray(p.Media)?p.Media:[]).filter(m=>m.type==='image').map(m=>httpsUrl(m.url));
  const imgs=[...new Set([httpsUrl(p.Image_URL),...media].filter(Boolean))];
  const stockItem=p.Product_Source==='Egypt'||p.Product_Source==='Dubai';
  const shareUrl=p.Product_ID?`${location.origin}/p/${encodeURIComponent(p.Product_ID)}`:'';
  return `<div class="pd"><div class="pd-top"><h2 id="pdTitle">${esc(p.Product_Name)}</h2>${page?'':`<button type="button" class="close" id="pdClose" aria-label="${esc(t('close'))}">×</button>`}</div>
  ${imgs.length?`<img class="pd-main" id="pdMain" src="${esc(imgs[0])}" alt="${esc(p.Product_Name)}">`:'<span class="nophoto">VIO</span>'}
  ${imgs.length>1?`<div class="pd-strip">${imgs.map((u,i)=>`<button type="button" data-u="${esc(u)}" aria-label="${i+1}"><img src="${esc(u)}" alt=""></button>`).join('')}</div>`:''}
  <p><b>${esc(catLabel(p))}</b></p>
  ${p.Description&&p.Description!=='Details available on request'?`<p>${esc(p.Description)}</p>`:''}
  ${p.Specifications?`<p class="note">${esc(p.Specifications)}</p>`:''}
  <p>${esc(t('moq'))}: ${esc(p.MOQ||t('onRequest'))}${stockItem?` · ${esc(priceText(p))}`:''}${p.Lead_Time_Days?` · ${esc(t('leadDays'))}: ${esc(p.Lead_Time_Days)} ${esc(t('days'))}`:''}</p>
  <a class="btn gold block" id="pdReq" href="#/request">${esc(t('requestThis'))}</a>
  <a class="btn line block" target="_blank" rel="noopener" href="${esc(waLink(t('waProduct',p.Product_Name)))}">${esc(t('askProduct'))}</a>
  ${shareUrl?`<div class="share"><a class="btn line small" id="pdShare" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(`${p.Product_Name} ${shareUrl}`)}">${esc(t('share'))}</a><button type="button" class="btn line small" id="pdCopy" data-u="${esc(shareUrl)}">${esc(t('copyLink'))}</button></div>`:''}</div>`;
}
function bindProduct(root,p,done){
  $('#pdReq',root).onclick=()=>{selected=p;done&&done()};
  root.querySelectorAll('.pd-strip button').forEach(b=>b.onclick=()=>{$('#pdMain',root).src=b.dataset.u});
  const c=$('#pdCopy',root);
  if(c)c.onclick=async()=>{try{await navigator.clipboard.writeText(c.dataset.u);c.textContent=t('copied')}catch(e){c.textContent=c.dataset.u}};
}
function openProduct(p){
  const dlg=$('#productDialog');
  dlg.innerHTML=productHTML(p,false);
  $('#pdClose',dlg).onclick=()=>dlg.close();
  bindProduct(dlg,p,()=>dlg.close());
  dlg.showModal();
}
async function productPage(id){
  app.innerHTML=`<div class="wrap page"><p class="note">${esc(t('loading'))}</p></div>`;
  const parts=await Promise.all([china().then(l=>l.map(x=>({...x,Product_Source:'China'}))).catch(()=>[]),...['Egypt','Dubai'].map(m=>stock(m).then(l=>l.map(x=>({...x,Product_Source:m}))).catch(()=>[]))]);
  const p=parts.flat().find(x=>String(x.Product_ID)===String(id));
  if(!location.hash.startsWith('#/product/'))return;
  if(!p){app.innerHTML=`<div class="wrap page"><div class="narrow stack"><p class="empty">${esc(t('notFound'))}</p><a class="btn" href="#/products">${esc(t('allProducts'))}</a></div></div>`;return}
  app.innerHTML=`<div class="wrap page"><div class="narrow card product-page">${productHTML(p,true)}</div></div>`;
  bindProduct(app,p);
}
let selected=null,pendingFiles=[];

function home(){
  app.innerHTML=`<section class="hero"><div class="wrap hero-grid"><div><p class="kicker">${esc(t('kicker'))}</p><h1>${esc(t('heroTitle'))}</h1><p class="lead">${esc(t('heroLead'))}</p><a class="btn line-light" href="#/stock/Egypt">${esc(t('ctaStock'))}</a></div>
  <div class="quick"><h2>${esc(t('quickTitle'))}</h2><p class="note">${esc(t('quickHint'))}</p><label class="drop"><span>${esc(t('photoLabel'))}</span><small>${esc(t('photoHint'))}</small><input type="file" id="homePhotos" accept="image/jpeg,image/png,image/webp" multiple></label><a class="btn gold block" href="#/request">${esc(t('ctaQuote'))}</a></div></div></section>
  <div class="wrap"><div class="promises">
  <div class="card"><h3>${esc(t('speed'))}</h3><p>${esc(t('speedText',CONFIG.quoteHours))}</p></div><div class="card"><h3>${esc(t('price'))}</h3><p>${esc(t('priceText'))}</p></div><div class="card"><h3>${esc(t('door'))}</h3><p>${esc(t('doorText'))}</p></div></div>
  <section class="block"><div class="sec-head"><h2>${esc(t('catsTitle'))}</h2></div><div class="cats">
  ${['Electronics','Cosmetics','Home'].map(c=>`<a class="cat" href="#/products/${c.toLowerCase()}">${ICONS[c]}<b>${esc(t('cat'+c))}</b><span>${esc(t('cat'+c+'Text'))}</span></a>`).join('')}</div></section>
  <section class="block"><div class="sec-head"><h2>${esc(t('trendTitle'))}</h2><a href="#/products">${esc(t('seeAll'))}</a></div><div class="grid" id="trend"><p class="note">${esc(t('loading'))}</p></div></section>
  <section class="block"><div class="sec-head"><h2>${esc(t('stockTitle'))}</h2><a href="#/stock/Egypt">${esc(t('seeAll'))}</a></div><div class="grid" id="ready"><p class="note">${esc(t('loading'))}</p></div></section>
  <section class="block"><div class="sec-head"><h2>${esc(t('howTitle'))}</h2></div><ol class="steps">${[1,2,3,4].map(n=>`<li class="card"><small>${esc(t('step'))} ${n}</small><h3>${esc(t('s'+n))}</h3><p>${esc(t('s'+n+'t'))}</p></li>`).join('')}</ol></section>
  <section class="block" id="payment"><div class="sec-head"><h2>${esc(t('payTitle'))}</h2></div><div class="promises flat"><div class="card"><h3>${esc(t('payChina'))}</h3><p>${esc(t('payChinaText'))}</p></div><div class="card"><h3>${esc(t('payStock'))}</h3><p>${esc(t('payStockText'))}</p></div><div class="card"><h3>${esc(t('payWays'))}</h3><p>${esc(t('payWaysText'))}</p></div></div><p class="note pay-note">${esc(t('payNote'))}</p></section>
  <section class="block"><div class="band"><div><h2>${esc(t('calcBandTitle'))}</h2><p>${esc(t('calcBandText'))}</p></div><a class="btn" href="#/calculator">${esc(t('calcOpen'))}</a></div></section>
  <section class="block"><div class="about"><div><h2>${esc(t('aboutTitle'))}</h2><p>${esc(t('aboutText'))}</p></div><div class="about-side"><p>${esc(t('aboutAddr'))}</p><a class="btn gold" href="https://wa.me/${CONFIG.whatsapp}" target="_blank" rel="noopener">${esc(t('contactUs'))}</a></div></div></section></div>`;
  $('#homePhotos').onchange=e=>{pendingFiles=[...e.target.files].slice(0,5);location.hash='#/request'};
  china().then(l=>fillGrid('trend',l.slice(0,4),'trend',catLabel,chinaSub)).catch(()=>fillGrid('trend',[],'trend',catLabel,chinaSub));
  Promise.all(['Egypt','Dubai'].map(m=>stock(m).then(l=>l.map(p=>({...p,Product_Source:m}))).catch(()=>[]))).then(a=>{
    const l=a.flat().filter(p=>p.Availability==='In Stock').slice(0,4);
    fillGrid('ready',l,'ready',p=>p.Product_Source==='Egypt'?t('egypt'):t('uae'),priceText);
  });
}
function listing(kind,arg){
  const isStock=kind==='stock';
  const market=isStock?(arg==='Dubai'?'Dubai':'Egypt'):'';
  let filter=isStock?'':(arg||'');
  app.innerHTML=`<div class="wrap page"><div class="sec-head"><h1 class="page-title">${esc(isStock?t('stockPage'):t('productsTitle'))}</h1>
  <div class="tabs">${isStock?`<a class="tab" href="#/stock/Egypt" ${market==='Egypt'?'aria-current="page"':''}>${esc(t('egypt'))}</a><a class="tab" href="#/stock/Dubai" ${market==='Dubai'?'aria-current="page"':''}>${esc(t('uae'))}</a>`:[['',t('catAll')],['electronics',t('catElectronics')],['cosmetics',t('catCosmetics')],['home',t('catHome')]].map(([k,v])=>`<a class="tab" href="#/products${k?'/'+k:''}" ${filter===k?'aria-current="page"':''}>${esc(v)}</a>`).join('')}</div></div>
  <label class="f" style="margin-bottom:14px"><span class="hp">${esc(t('search'))}</span><input id="q" type="search" placeholder="${esc(t('search'))}"></label>
  <div class="grid" id="list"><p class="note">${esc(t('loading'))}</p></div></div>`;
  const src=isStock?stock(market).then(l=>l.map(p=>({...p,Product_Source:market}))):china().then(l=>l.map(p=>({...p,Product_Source:'China'})));
  src.then(all=>{
    const draw=()=>{const q=$('#q').value.trim().toLowerCase();
      const l=all.filter(p=>(!filter||catOf(p)===filter)&&(!q||`${p.Product_Name} ${p.Category} ${p.Description}`.toLowerCase().includes(q)));
      fillGrid('list',l,'list',catLabel,isStock?priceText:chinaSub)};
    $('#q').oninput=draw;draw();
  }).catch(()=>{$('#list').innerHTML=`<p class="empty" style="grid-column:1/-1">${esc(t('loadError'))}</p>`});
}
const opt=(v,l,sel)=>`<option value="${esc(v)}" ${sel?'selected':''}>${esc(l)}</option>`;
function resizeImage(file){
  return new Promise((res,rej)=>{
    if(!['image/jpeg','image/png','image/webp'].includes(file.type))return rej(new Error(t('badPhoto')));
    const url=URL.createObjectURL(file),img=new Image();
    img.onerror=()=>{URL.revokeObjectURL(url);rej(new Error(t('badPhoto')))};
    img.onload=()=>{const s=Math.min(1,1600/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);
      res({name:file.name.replace(/\.[^.]+$/,'')+'.jpg',mimeType:'image/jpeg',base64:c.toDataURL('image/jpeg',.82).split(',')[1]})};
    img.src=url;
  });
}
function request(){
  const p=selected;selected=null;
  const key=uuid();
  const saved=(()=>{try{return JSON.parse(store.get('vioBuyer')||'{}')}catch(e){return{}}})();
  const defaultCat=p?catOf(p):'';
  app.innerHTML=`<div class="wrap page"><div class="narrow stack"><div><h1 class="page-title">${esc(t('reqTitle'))}</h1><p class="note">${esc(t('reqLead',CONFIG.quoteHours))}</p></div>
  <form class="stack" id="reqForm" novalidate>
  <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
  <label class="drop"><span>${esc(t('photoLabel'))}</span><small>${esc(t('photoHint'))}</small><input type="file" id="photos" accept="image/jpeg,image/png,image/webp" multiple></label>
  <div class="previews" id="prev"></div>
  <label class="f">${esc(t('productName'))}<input id="pname" maxlength="200" value="${esc(p?p.Product_Name:'')}"></label>
  <label class="f">${esc(t('link'))}<input id="plink" type="url" inputmode="url" dir="ltr"></label>
  <div class="two"><label class="f">${esc(t('qty'))}<input id="qty" type="number" min="1" inputmode="numeric" required value="${esc(p&&p.MOQ?p.MOQ:'')}"></label>
  <label class="f">${esc(t('category'))}<select id="cat">${opt('Electronics',t('catElectronics'),defaultCat==='electronics')}${opt('Cosmetics',t('catCosmetics'),defaultCat==='cosmetics')}${opt('Home',t('catHome'),defaultCat==='home')}</select></label></div>
  ${p?'':`<label class="f">${esc(t('source'))}<select id="origin">${opt('China',t('china'))}${opt('Egypt',t('egypt'))}${opt('UAE',t('uae'))}${opt('Best Option',t('bestOption'))}</select></label>`}
  <div class="two"><label class="f">${esc(t('dest'))}<select id="country">${CONFIG.countries.map(c=>opt(c,countryLabel(c),saved.country===c)).join('')}</select></label>
  <label class="f">${esc(t('city'))}<input id="city" maxlength="60" required value="${esc(saved.city||'')}"></label></div>
  <label class="f">${esc(t('shipping'))}<select id="ship">${opt('Sea Freight',t('sea'))}${opt('Air Freight',t('air'))}</select></label>
  <label class="f">${esc(t('name'))}<input id="name" maxlength="120" required autocomplete="name" value="${esc(saved.name||'')}"></label>
  <label class="f">${esc(t('company'))}<input id="company" maxlength="120" value="${esc(saved.company||'')}"></label>
  <label class="f">${esc(t('wa'))}<input id="phone" type="tel" dir="ltr" required autocomplete="tel" placeholder="+20" value="${esc(saved.phone||'')}"></label>
  <label class="f">${esc(t('email'))}<input id="email" type="email" dir="ltr" required autocomplete="email" value="${esc(saved.email||'')}"><small class="note">${esc(t('emailHint'))}</small></label>
  <label class="f">${esc(t('notes'))}<textarea id="notes" rows="3" maxlength="1500"></textarea></label>
  <p class="msg" id="err" role="alert" hidden></p>
  <button class="btn gold block" id="sendBtn">${esc(t('send'))}</button></form></div></div>`;
  let files=pendingFiles;pendingFiles=[];
  const showPrev=()=>$('#prev').replaceChildren(...files.map(f=>{const i=new Image();i.src=URL.createObjectURL(f);i.alt='';return i}));
  showPrev();
  const err=m=>{const e=$('#err');e.textContent=m;e.hidden=!m;if(m)e.scrollIntoView({block:'center'})};
  $('#photos').onchange=e=>{const add=[...e.target.files];if(files.length+add.length>5){err(t('tooMany'));return}err('');files=files.concat(add);showPrev()};
  $('#reqForm').onsubmit=async e=>{
    e.preventDefault();err('');const f=e.target;
    if(!$('#pname').value.trim()&&!files.length&&!$('#plink').value.trim())return err(t('needProduct'));
    if(!f.reportValidity())return;
    const btn=$('#sendBtn');btn.disabled=true;btn.textContent=t('sending');
    const notes=[`Category: ${$('#cat').value}`,`City: ${$('#city').value.trim()}`,$('#plink').value.trim()&&`Link: ${$('#plink').value.trim()}`,$('#notes').value.trim()].filter(Boolean).join('\n');
    try{
      const photos=await Promise.all(files.map(resizeImage));
      const data={productId:p?p.Product_ID:'',productSource:p?p.Product_Source:'Customer Request',productName:$('#pname').value.trim()||($('#plink').value.trim()?'Product from link':''),preferredContact:'WhatsApp',name:$('#name').value.trim(),phone:$('#phone').value.trim(),email:$('#email').value.trim(),company:$('#company').value.trim(),quantity:Number($('#qty').value),country:$('#country').value,sourceOrigin:p?'':$('#origin').value,shippingMode:$('#ship').value,notes,submissionKey:key,website:f.website.value,photos};
      const r=await api('submitPriceInquiry',data);
      store.set('vioBuyer',JSON.stringify({name:data.name,phone:data.phone,email:data.email,company:data.company,country:data.country,city:$('#city').value.trim()}));
      app.innerHTML=`<div class="wrap page"><div class="narrow card done"><h1 class="page-title">${esc(t('sent'))}</h1><p class="note">${esc(t('sentText'))}</p><p class="ref">${esc(r.rfqId)}</p><a class="btn gold" id="waFollow" target="_blank" rel="noopener" href="${esc(waLink(t('waReq',r.rfqId,data.productName,data.quantity)))}">${esc(t('waFollow'))}</a><p class="note">${esc(t('waFollowText'))}</p><a class="btn" href="#/account">${esc(t('viewOrders'))}</a><a href="#/request" id="again">${esc(t('newReq'))}</a></div></div>`;
      app.focus();
    }catch(x){btn.disabled=false;btn.textContent=t('send');err(x.message)}
  };
}
const session={get token(){return store.sget('vioToken')||''},get email(){return store.sget('vioEmail')||''},save(tk,em){store.sset('vioToken',tk);store.sset('vioEmail',em)},clear(){store.sdel('vioToken');store.sdel('vioEmail')}};
let dash=null,dashTab='quotes';
function signIn(step,email){
  if(step==='code'){
    app.innerHTML=`<div class="wrap page"><div class="narrow card stack"><h1 class="page-title">${esc(t('signTitle'))}</h1><p class="note">${esc(t('codeSent'))}</p><form class="stack" id="codeForm"><label class="f">${esc(t('code'))}<input id="code" inputmode="numeric" autocomplete="one-time-code" dir="ltr" maxlength="6" required></label><p class="msg" id="err" role="alert" hidden></p><button class="btn block">${esc(t('verify'))}</button></form><button type="button" class="lang" style="color:var(--ink)" id="chg">${esc(t('changeEmail'))}</button></div></div>`;
    $('#chg').onclick=()=>signIn();
    $('#codeForm').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('button');b.disabled=true;
      try{const r=await api('vioCPVerifyCode',{email,code:$('#code').value.trim()});session.save(r.token,r.email);account()}catch(x){b.disabled=false;const m=$('#err');m.textContent=x.message;m.hidden=false}};
    return;
  }
  app.innerHTML=`<div class="wrap page"><div class="narrow card stack"><h1 class="page-title">${esc(t('signTitle'))}</h1><p class="note">${esc(t('signLead'))}</p><form class="stack" id="mailForm"><label class="f">${esc(t('email'))}<input id="mail" type="email" dir="ltr" required autocomplete="email"></label><p class="msg" id="err" role="alert" hidden></p><button class="btn block">${esc(t('sendCode'))}</button></form></div></div>`;
  $('#mailForm').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('button'),em=$('#mail').value.trim();b.disabled=true;
    try{await api('vioCPRequestCode',em);signIn('code',em)}catch(x){b.disabled=false;const m=$('#err');m.textContent=x.message;m.hidden=false}};
}
async function account(){
  if(!session.token)return signIn();
  app.innerHTML=`<div class="wrap page"><p class="note">${esc(t('loading'))}</p></div>`;
  try{dash=await api('vioCPDashboard',session.token)}catch(e){session.clear();return signIn()}
  drawDash();
}
function drawDash(msg){
  const tabs=[['quotes',t('tabQuotes')],['orders',t('tabOrders')],['requests',t('tabRequests')]];
  let body='';
  if(dashTab==='quotes')body=dash.quotes.length?dash.quotes.map(q=>`<div class="row"><div class="row-top"><b>${esc(q.product)}</b><span class="pill">${esc(st(q.decision||q.status))}</span></div><p>${esc(t('total'))}: <b dir="ltr">${money(q.currency,q.total)}</b> · ${esc(t('qty'))}: ${esc(q.quantity)}</p><p class="note">${esc(t('lead'))}: ${esc(q.leadDays)} ${esc(t('days'))} · ${esc(t('validity'))}: ${esc(q.validityDays)} ${esc(t('days'))}</p>${q.decision?'':`<div class="actions"><button class="btn gold small" data-act="accept" data-id="${esc(q.id)}">${esc(t('accept'))}</button><button class="btn line small" data-act="counter" data-id="${esc(q.id)}">${esc(t('counter'))}</button><button class="btn line small" data-act="reject" data-id="${esc(q.id)}">${esc(t('reject'))}</button></div>`}<a class="ask" target="_blank" rel="noopener" href="${esc(waLink(t('waQuote',`${q.product} (${q.id})`)))}">${esc(t('askQuote'))}</a><div id="box-${esc(q.id)}"></div></div>`).join(''):`<p class="empty">${esc(t('noQuotes'))}</p>`;
  if(dashTab==='orders')body=dash.orders.length?dash.orders.map(o=>`<div class="row"><div class="row-top"><b>${esc(o.product)}</b><span class="pill">${esc(st(o.status))}</span></div><p class="note" dir="ltr" style="text-align:start">${esc(o.id)}</p><a class="btn small" href="#/order/${encodeURIComponent(o.id)}">${esc(t('track'))}</a></div>`).join(''):`<p class="empty">${esc(t('noOrders'))}</p>`;
  if(dashTab==='requests')body=dash.rfqs.length?dash.rfqs.map(r=>`<div class="row"><div class="row-top"><b>${esc(r.product)}</b><span class="pill">${esc(st(r.status))}</span></div><p class="note"><span dir="ltr">${esc(r.id)}</span> · ${esc(t('qty'))}: ${esc(r.quantity)}</p></div>`).join(''):`<p class="empty">${esc(t('noRequests'))}</p>`;
  app.innerHTML=`<div class="wrap page"><div class="narrow stack"><div class="sec-head"><h1 class="page-title">${esc(t('signTitle'))}</h1><button type="button" class="btn line small" id="out">${esc(t('signOut'))}</button></div>${msg?`<p class="msg good" role="status">${esc(msg)}</p>`:''}<div class="tabs">${tabs.map(([k,v])=>`<button type="button" class="tab" aria-pressed="${k===dashTab}" data-tab="${k}">${esc(v)}</button>`).join('')}</div><div class="rows">${body}</div></div></div>`;
  app.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{dashTab=b.dataset.tab;drawDash()});
  $('#out').onclick=async()=>{try{await api('vioCPLogout',session.token)}catch(e){}session.clear();signIn()};
  app.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>quoteAction(b.dataset.act,b.dataset.id));
}
function quoteAction(act,id){
  const box=document.getElementById('box-'+id);
  const submit=async(decision,extra,btn)=>{btn.disabled=true;
    try{await api('vioCPDecision',{token:session.token,quotationId:id,decision,...extra});dash=await api('vioCPDashboard',session.token);drawDash(t('decisionSaved'))}
    catch(x){btn.disabled=false;box.insertAdjacentHTML('beforeend',`<p class="msg" role="alert">${esc(x.message)}</p>`)}};
  if(act==='counter'){
    box.innerHTML=`<form class="stack"><label class="f">${esc(t('counterText'))}<textarea id="cMsg" rows="3" maxlength="2000" required></textarea></label><label class="f">${esc(t('counterTotal'))}<input id="cTotal" type="number" min="0" step="any"></label><button class="btn small">${esc(t('sendCounter'))}</button></form>`;
    box.querySelector('form').onsubmit=e=>{e.preventDefault();submit('Revision Requested',{message:$('#cMsg').value.trim(),requestedTotal:$('#cTotal').value,requestedQuantity:''},e.target.querySelector('button'))};
    return;
  }
  const accept=act==='accept';
  box.innerHTML=`<p><b>${esc(t(accept?'confirmAccept':'confirmReject'))}</b></p><div class="actions"><button class="btn small" id="y">${esc(t('yes'))}</button><button class="btn line small" id="n">${esc(t('no'))}</button></div>`;
  box.querySelector('#n').onclick=()=>{box.innerHTML=''};
  box.querySelector('#y').onclick=e=>submit(accept?'Accepted':'Rejected',{},e.target);
}
const STAGES=[['Confirmed','stConfirmed'],['In Production','stProduction'],['Quality Inspection','stInspection'],['Ready to Ship','stReady'],['In Transit','stTransit'],['Customs Clearance','stCustoms'],['Delivered','stDelivered']];
async function orderPage(id){
  if(!session.token)return signIn();
  if(!dash)try{dash=await api('vioCPDashboard',session.token)}catch(e){session.clear();return signIn()}
  const o=dash.orders.find(x=>x.id===id);
  if(!o){location.hash='#/account';return}
  const cur=o.status==='Closed'?STAGES.length:STAGES.findIndex(s=>s[0]===o.status);
  const msgs=dash.messages.filter(m=>m.rfqId===o.rfqId);
  app.innerHTML=`<div class="wrap page"><div class="narrow stack"><a href="#/account">${esc(t('back'))}</a><h1 class="page-title">${esc(t('orderTitle'))}</h1><p class="note">${esc(o.product)} · <span dir="ltr">${esc(o.id)}</span></p>
  <div class="card"><p class="note">${esc(t('statusNow'))}</p><h2>${esc(st(o.status))}</h2>${o.eta?`<p class="note">${esc(t('eta'))}: ${esc(String(o.eta).slice(0,10))}</p>`:''}${o.tracking?`<p class="note">${esc(t('tracking'))}: <span dir="ltr">${esc(o.tracking)}</span></p>`:''}<p class="note">${esc(t('payment'))}: ${esc(st(o.paymentStatus))}</p></div>
  ${o.status==='Cancelled'?`<p class="msg">${esc(t('cancelled'))}</p>`:`<ol class="timeline card">${STAGES.map((s,i)=>{const cls=i<cur?'done':i===cur?'now':'';return `<li><span class="dot ${cls}" aria-hidden="true">${i+1}</span><span><b>${esc(t(s[1]))}</b><small>${esc(t(i<cur?'doneLbl':i===cur?'nowLbl':'nextLbl'))}</small></span></li>`}).join('')}</ol>`}
  <div class="card stack"><h2>${esc(t('messages'))}</h2><div class="msgs">${msgs.map(m=>`<p class="bubble ${m.senderType==='Customer'?'me':''}">${esc(m.message)}</p>`).join('')}</div><form class="stack" id="mForm"><label class="f">${esc(t('writeMsg'))}<textarea id="mText" rows="2" maxlength="3000" required></textarea></label><button class="btn small">${esc(t('sendMsg'))}</button></form></div>
  <a class="btn gold block" target="_blank" rel="noopener" href="https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(o.id)}">${esc(t('whatsapp'))}</a></div></div>`;
  $('#mForm').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('button');b.disabled=true;
    try{await api('vioCPSendMessage',{token:session.token,rfqId:o.rfqId,message:$('#mText').value.trim()});dash=await api('vioCPDashboard',session.token);orderPage(id)}catch(x){b.disabled=false}};
}
function calculator(){
  const field=(id,label,val='')=>`<label class="f">${esc(t(label))}<input id="${id}" type="number" min="0" step="any" inputmode="decimal" value="${val}"></label>`;
  app.innerHTML=`<div class="wrap page"><div class="narrow stack"><div><h1 class="page-title">${esc(t('calcTitle'))}</h1><p class="note">${esc(t('calcLead'))}</p></div>
  <form class="card stack" id="calc" novalidate><div class="two">${field('cCost','calcCost')}${field('cSell','calcSell')}</div><div class="two">${field('cShip','calcShip')}${field('cAds','calcAds')}</div><div class="two">${field('cRet','calcReturns',0)}${field('cQty','calcQty',100)}</div></form>
  <div class="result" aria-live="polite"><div><span>${esc(t('calcProfit'))}</span><b id="rProfit">-</b></div><div><span>${esc(t('calcMargin'))}</span><b id="rMargin">-</b></div><div><span>${esc(t('calcTotal'))}</span><b id="rTotal">-</b></div><div><span>${esc(t('calcBreak'))}</span><b id="rBreak">-</b></div></div>
  <p class="note">${esc(t('calcHint'))}</p><a class="btn gold block" href="#/request">${esc(t('calcCta'))}</a></div></div>`;
  const n=id=>Math.max(0,Number($('#'+id).value)||0);
  const fmt=v=>v.toLocaleString('en-US',{maximumFractionDigits:2});
  const draw=()=>{const r=calcProfit({cost:n('cCost'),sell:n('cSell'),ship:n('cShip'),ads:n('cAds'),returns:n('cRet'),qty:n('cQty')});
    const on=r&&n('cSell')>0;
    $('#rProfit').textContent=on?fmt(r.profit):'-';$('#rMargin').textContent=on?`${fmt(r.margin)}%`:'-';$('#rTotal').textContent=on?fmt(r.total):'-';$('#rBreak').textContent=on?fmt(r.breakEven):'-';
    ['rProfit','rTotal'].forEach(i=>$('#'+i).classList.toggle('neg',!!on&&r.profit<0))};
  $('#calc').oninput=draw;$('#calc').onsubmit=e=>e.preventDefault();draw();
}
function calcProfit({cost,sell,ship,ads,returns,qty}){
  const keep=1-Math.min(returns,95)/100;
  const profit=keep*(sell-cost)-ship-ads;
  return {profit,margin:sell>0?profit/(keep*sell)*100:0,total:profit*qty,breakEven:cost+(ship+ads)/keep};
}
const FAQ=[
 {k:['كيف اطلب','طريقه الطلب','اطلب','ابدا','صوره','how order','how do i','order','start','photo'],ar:'أرسل صورة أو رابط المنتج مع الكمية ومكان التوصيل، وسنرسل لك عرض سعر مكتوب.',en:'Send a product photo or link with the quantity and delivery location, and we will send you a written quote.',a:['ctaQuote','#/request']},
 {k:['سعر','عرض','تكلفه','بكام','quote','price','cost'],ar:'نرسل عرض سعر مكتوب خلال 48 ساعة في أيام العمل، ويوضح تكلفة البضاعة والشحن.',en:'We send a written quote within 48 hours on working days, showing the goods and shipping cost.',a:['ctaQuote','#/request']},
 {k:['حد ادني','الحد الادني','اقل كميه','اقل عدد','moq','minimum'],ar:'الحد الأدنى يختلف حسب المنتج، ويظهر في صفحة كل منتج. يمكنك أيضًا طلب كمية محددة وسنرد عليك بالمتاح.',en:'The minimum depends on the product and is shown on each product page. You can also ask for a specific quantity and we will tell you what is possible.',a:['allProducts','#/products']},
 {k:['دفع','ادفع','مقدم','عربون','انستاباي','فودافون','تحويل','payment','pay','deposit','instapay','vodafone','transfer'],ar:'التوريد من الصين: 30% مقدم و70% بعد الفحص وقبل الشحن. المخزون الجاهز: الدفع كاملًا قبل الشحن. في مصر: تحويل بنكي أو إنستاباي أو فودافون كاش. في الخليج: تحويل بنكي.',en:'Sourcing from China: 30% deposit and 70% after inspection, before shipping. Ready stock: full payment before dispatch. Egypt: bank transfer, InstaPay or Vodafone Cash. GCC: bank transfer.'},
 {k:['مده','كام يوم','متي','يوصل امتي','وقت','how long','when','lead time','arrive','days'],ar:'المدة تختلف حسب المنتج وطريقة الشحن، بحري أو جوي، وتكون مكتوبة في عرض السعر. المخزون الجاهز يشحن أسرع.',en:'It depends on the product and on sea or air shipping, and it is written on your quote. Ready stock ships faster.'},
 {k:['شحن','توصيل','دول','السعوديه','الكويت','قطر','البحرين','عمان','الامارات','باب','ship','deliver','country','countries','door','saudi','kuwait','qatar','bahrain','oman','uae'],ar:'نوصل من الباب للباب إلى مصر، الإمارات، السعودية، الكويت، قطر، البحرين وعُمان.',en:'We deliver door to door to Egypt, UAE, Saudi Arabia, Kuwait, Qatar, Bahrain and Oman.'},
 {k:['تتبع','طلبي','شحنتي','فين','track','my order','shipment'],ar:'من صفحة طلباتي يمكنك متابعة كل مرحلة، بالبريد الذي استخدمته في طلبك.',en:'You can follow every stage in My orders, using the email from your request.',a:['navOrders','#/account']},
 {k:['مخزون','جاهز','متاح','stock','available','ready'],ar:'لدينا مخزون جاهز في مصر والإمارات، ويمكنك تصفحه الآن.',en:'We have ready stock in Egypt and the UAE, and you can browse it now.',a:['navStock','#/stock/Egypt']},
 {k:['منتجات','الكترونيات','تجميل','منزليه','products','electronics','cosmetics','home'],ar:'نعمل في الإلكترونيات، مستحضرات التجميل، والمنتجات المنزلية.',en:'We work in electronics, cosmetics and home products.',a:['navProducts','#/products']},
 {k:['ربح','مكسب','حاسبه','profit','margin','calculator'],ar:'استخدم حاسبة الربح لتعرف ربح القطعة وسعر التعادل.',en:'Use the profit calculator to see your profit per piece and break-even price.',a:['navCalc','#/calculator']}
];
const CHIPS={ar:[['كيف أطلب؟',0],['طريقة الدفع؟',3],['كم مدة التوريد؟',4],['إلى أين توصلون؟',5],['كيف أتابع طلبي؟',6]],en:[['How do I order?',0],['How do I pay?',3],['How long does it take?',4],['Where do you deliver?',5],['How do I track my order?',6]]};
const normAr=x=>String(x).toLowerCase().replace(/[\u064B-\u0652]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/\s+/g,' ').trim();
function faqMatch(q){const n=normAr(q);let best=-1,score=0;FAQ.forEach((f,i)=>{const sc=f.k.reduce((v,w)=>{const nw=normAr(w);return v+((/^[a-z ]+$/.test(nw)?new RegExp(`\\b${nw}\\b`).test(n):n.includes(nw))?nw.length:0)},0);if(sc>score){score=sc;best=i}});return best}
function initChat(){
  const root=$('#chat');
  const addMsg=(html,me)=>{const box=$('#chatLog');box.insertAdjacentHTML('beforeend',`<div class="bubble ${me?'me':''}">${html}</div>`);box.scrollTop=box.scrollHeight};
  const reply=(i,q)=>{const use=q&&/[\u0600-\u06FF]/.test(q)?'ar':lang;if(i<0){addMsg(`${esc(I18N[use].chatNo)}<a class="chat-link" target="_blank" rel="noopener" href="https://wa.me/${CONFIG.whatsapp}">${esc(t('whatsapp'))}</a>`);return}
    const f=FAQ[i];addMsg(`${esc(f[use])}${f.a?`<a class="chat-link" href="${f.a[1]}">${esc(t(f.a[0]))}</a>`:''}`)};
  const draw=()=>{root.innerHTML=`<button type="button" class="chat-btn" id="chatBtn" aria-expanded="false" aria-controls="chatPanel">${esc(t('chatOpen'))}</button>
  <div class="chat-panel" id="chatPanel" hidden><div class="chat-head"><div><b>${esc(t('chatTitle'))}</b><small>${esc(t('chatSub'))}</small></div><button type="button" class="chat-x" id="chatX" aria-label="${esc(t('close'))}">×</button></div>
  <div class="chat-log" id="chatLog" aria-live="polite"><div class="bubble">${esc(t('chatHello'))}</div></div>
  <div class="chips">${CHIPS[lang].map(([l,i])=>`<button type="button" class="chip" data-i="${i}">${esc(l)}</button>`).join('')}</div>
  <form class="chat-form" id="chatForm"><input id="chatInput" maxlength="200" aria-label="${esc(t('chatPlaceholder'))}" placeholder="${esc(t('chatPlaceholder'))}"><button class="btn small">${esc(t('chatSend'))}</button></form></div>`;
    const toggle=open=>{$('#chatPanel').hidden=!open;$('#chatBtn').hidden=open;$('#chatBtn').setAttribute('aria-expanded',String(open));if(open)$('#chatInput').focus();else $('#chatBtn').focus()};
    $('#chatBtn').onclick=()=>toggle(true);$('#chatX').onclick=()=>toggle(false);
    root.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{addMsg(esc(c.textContent),true);reply(Number(c.dataset.i))});
    $('#chatForm').onsubmit=e=>{e.preventDefault();const v=$('#chatInput').value.trim();if(!v)return;addMsg(esc(v),true);$('#chatInput').value='';reply(faqMatch(v),v)};
  };
  root.addEventListener('click',e=>{const l=e.target.closest('.chat-link');if(l&&l.getAttribute('href').startsWith('#')){$('#chatPanel').hidden=true;$('#chatBtn').hidden=false}});
  initChat.draw=draw;draw();
}
function applyChrome(){
  document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';
  document.querySelectorAll('[data-t]').forEach(el=>{el.textContent=t(el.dataset.t)});
  $('#langBtn').textContent=lang==='ar'?'English':'العربية';
  $('#waTop').href=`https://wa.me/${CONFIG.whatsapp}`;
  $('#linkPrivacy').href=lang==='ar'?'/privacy-ar.html':'/privacy.html';$('#linkTerms').href=lang==='ar'?'/terms-ar.html':'/terms.html';
  if(initChat.draw)initChat.draw();
}
function route(){
  const parts=decodeURIComponent(location.hash.replace(/^#\/?/,'')).split('/').filter(Boolean);
  const r=parts[0]||'';
  const path='#/'+parts.slice(0,2).join('/');
  document.querySelectorAll('.main-nav a,.bottom-nav a').forEach(a=>{const h=a.getAttribute('href');const on=h==='#/'?!r:location.hash.startsWith(h.split('/').slice(0,2).join('/'));on?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current')});
  if(r==='products')listing('products',parts[1]);
  else if(r==='stock')listing('stock',parts[1]);
  else if(r==='request')request();
  else if(r==='account')account();
  else if(r==='order')orderPage(parts[1]);
  else if(r==='product')productPage(parts[1]);
  else if(r==='calculator')calculator();
  else home();
  window.scrollTo(0,0);
  return path;
}
$('#langBtn').onclick=()=>{lang=lang==='ar'?'en':'ar';store.set('vioLang',lang);applyChrome();route()};
window.addEventListener('hashchange',route);
initChat();applyChrome();route();
