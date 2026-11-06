// Tests the customer website with a mock server. Run: NODE_PATH=$(npm root -g) node tools/test/site.test.js
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const dir=path.join(__dirname,'../../website');
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png'};
const srv=http.createServer((q,s)=>{const f=path.join(dir,q.url==='/'?'index.html':q.url.split('?')[0]);if(!fs.existsSync(f)){s.writeHead(404);return s.end()}s.writeHead(200,{'Content-Type':types[path.extname(f)]||'text/plain'});s.end(fs.readFileSync(f))});
const P=[{Product_ID:'VIO-PRD-1',Product_Name:'Test Blender',Category:'Home',Description:'x',Image_URL:'',MOQ:100,Media:[]},{Product_ID:'VIO-PRD-2',Product_Name:'Test Cream',Category:'Cosmetics',Image_URL:'',MOQ:'',Media:[]}];
const S=[{Product_ID:'VIO-STK-1',Product_Name:'Test Camera',Category:'Security',Image_URL:'',MOQ:50,Availability:'In Stock',Price_Visibility:'Show',Selling_Price:990,Currency:'EGP',Media:[]}];
let sent=null,decision=null;const D={email:'a@b.co',rfqs:[{id:'R1',product:'Test',quantity:10,status:'Quoted'}],quotes:[{id:'Q1',rfqId:'R1',product:'<b>Test</b>',quantity:10,currency:'EGP',total:1000,leadDays:30,validityDays:7,status:'Sent',decision:''}],orders:[{id:'O1',rfqId:'R1',product:'Test',status:'In Transit',paymentStatus:'Paid',shipmentStatus:'In Transit',tracking:'T1',eta:'2026-12-01'}],messages:[],negotiations:[]};
const R={getChinaProducts:()=>P,getVIOPublicStock:m=>m==='Egypt'?S:[],submitPriceInquiry:a=>{sent=a;return{ok:true,rfqId:'VIO-RFQ-TEST'}},vioCPRequestCode:()=>({ok:true}),vioCPVerifyCode:()=>({ok:true,token:'t'.repeat(50),email:'a@b.co'}),vioCPDashboard:()=>D,vioCPDecision:a=>{decision=a;return{ok:true}},vioCPSendMessage:()=>({ok:true}),vioCPLogout:()=>({ok:true})};
const ok=(c,m)=>{if(!c){console.log('FAIL',m);process.exitCode=1}else console.log('ok  ',m)};
(async()=>{await new Promise(r=>srv.listen(0,r));const url=`http://127.0.0.1:${srv.address().port}/`;const b=await chromium.launch();
for(const [name,vp] of [['phone',{width:390,height:844}],['desktop',{width:1280,height:800}]]){
 const c=await b.newContext({viewport:vp});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.route('**/macros/**',async r=>{const j=JSON.parse(r.request().postData());await r.fulfill({json:{ok:true,result:R[j.fn](...j.args)},headers:{'access-control-allow-origin':'*'}})});
 await p.route('**fonts.g**',r=>r.abort());
 await p.goto(url);await p.waitForSelector('#trend .item');await p.waitForSelector('#ready .item');
 const over=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);ok(over<=0,name+' home no sideways scroll '+over);
 ok(await p.getAttribute('html','dir')==='rtl',name+' Arabic first');
 await p.screenshot({path:`/tmp/vio-${name}-home.png`,fullPage:true});
 if(name==='phone'){
  await p.click('#trend .item');ok(await p.isVisible('#productDialog'),'product details open');await p.click('#pdReq');await p.waitForSelector('#reqForm');ok(await p.inputValue('#pname')==='Test Blender','request prefilled');ok(!(await p.$('#origin')),'catalog hides source');
  await p.goto(url+'#/request');await p.waitForSelector('#reqForm');await p.reload();await p.waitForSelector('#origin');
  await p.fill('#pname','Widget');await p.fill('#qty','500');await p.fill('#city','Cairo');await p.fill('#name','Test');await p.fill('#phone','+201000000000');await p.fill('#email','a@b.co');
  await p.screenshot({path:'/tmp/vio-request.png',fullPage:true});
  await p.click('#sendBtn');await p.waitForSelector('.ref');ok((await p.getAttribute('#waFollow','href')).includes('VIO-RFQ-TEST'),'WhatsApp follow-up has reference');ok(sent&&sent.sourceOrigin==='China'&&sent.preferredContact==='WhatsApp'&&/City: Cairo/.test(sent.notes),'request sent with origin and city');ok(sent.submissionKey.length>=12,'submission key');
  await p.click('.done a[href="#/account"]');await p.waitForSelector('#mailForm');await p.fill('#mail','a@b.co');await p.click('#mailForm button');await p.waitForSelector('#codeForm');await p.fill('#code','123456');await p.click('#codeForm button');await p.waitForSelector('[data-act=accept]');
  ok((await p.innerHTML('.rows')).includes('&lt;b&gt;Test'),'product names escaped');
  await p.click('[data-act=accept]');await p.click('#y');await p.waitForSelector('.msg.good');ok(decision&&decision.decision==='Accepted'&&decision.quotationId==='Q1','quote accept sent');
  await p.click('[data-tab=orders]');await p.click('.rows .btn');await p.waitForSelector('.timeline');ok((await p.locator('.dot.done').count())===4&&(await p.locator('.dot.now').count())===1&&(await p.locator('.timeline li').count())===7,'tracker stage correct');
  await p.screenshot({path:'/tmp/vio-tracker.png',fullPage:true});
  await p.click('#langBtn');await p.waitForSelector('.timeline');ok(await p.getAttribute('html','dir')==='ltr','English switch');
 }else{
  await p.goto(url+'#/stock/Egypt');await p.waitForSelector('#list .item');ok((await p.innerText('#list')).includes('Test Camera'),'Egypt stock');await p.goto(url+'#/stock/Dubai');await p.waitForSelector('#list .empty');ok(true,'UAE empty message');await p.goto(url+'#/products/cosmetics');await p.waitForSelector('#list .item');ok((await p.locator('#list .item').count())===1,'category filter');
 }
 await p.goto(url+'#/product/VIO-STK-1');await p.reload();await p.waitForSelector('#pdShare');ok((await p.innerText('.pd')).includes('Test Camera'),name+' product page');ok((await p.getAttribute('#pdShare','href')).includes('%2Fp%2FVIO-STK-1'),name+' share link');
 await p.goto(url+'#/product/NOPE');await p.reload();await p.waitForSelector('.empty');ok(true,name+' missing product message');
 await p.goto(url+'#/calculator');await p.reload();await p.waitForSelector('#cCost');await p.fill('#cCost','100');await p.fill('#cSell','200');await p.fill('#cShip','20');await p.fill('#cAds','10');await p.fill('#cRet','10');await p.fill('#cQty','100');
 ok(await p.innerText('#rProfit')==='60'&&await p.innerText('#rTotal')==='6,000'&&await p.innerText('#rBreak')==='133.33',name+' calculator '+await p.innerText('#rProfit')+' '+await p.innerText('#rTotal')+' '+await p.innerText('#rBreak'));
 const lc=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);ok(lc<=0,name+' calculator no sideways scroll');
 await p.screenshot({path:`/tmp/vio-${name}-calc.png`,fullPage:true});
 await p.goto(url+'#/');await p.click('#chatBtn');await p.click('.chip[data-i="3"]');ok(/30/.test(await p.innerText('#chatLog')),name+' chat chip answers payment');
 for(const [q,w] of [['عايز اعرف الدفع ازاي','30'],['do you deliver to kuwait?','Kuwait|الكويت'],['xyzzy','WhatsApp|واتساب'],['الحد الأدنى كام','الحد الأدنى|minimum']]){await p.fill('#chatInput',q);await p.press('#chatInput','Enter');const tx=await p.locator('#chatLog .bubble').last().innerText();ok(new RegExp(w).test(tx),name+' chat: '+q)}
 await p.screenshot({path:`/tmp/vio-${name}-chat.png`});
 await p.click('#chatX');
 await p.goto(url+'#/');await p.waitForSelector('.hero-map');await p.locator('.stop[data-c="Kuwait"]:visible').click();ok(/الكويت|Kuwait/.test(await p.innerText('#routeCap')),name+' route picks Kuwait');await p.click('#routeGo');await p.waitForSelector('#country');ok(await p.inputValue('#country')==='Kuwait',name+' route presets country');
 ok(errs.length===0,name+' no page errors '+errs.join('|'));await c.close();
}
await b.close();srv.close()})().catch(e=>{console.log('ERROR',e.message);process.exit(1)});
