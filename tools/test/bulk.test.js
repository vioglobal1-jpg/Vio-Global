// Tests bulk upload. Run: NODE_PATH=$(npm root -g) node tools/test/bulk.test.js
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),os=require('os'),{execFileSync}=require('child_process'),vm=require('vm');
const ok=(c,m)=>{if(!c){console.log('FAIL',m);process.exitCode=1}else console.log('ok  ',m)};
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'vio-bulk-'));
// --- server logic with a fake Google Sheet
const code=fs.readFileSync(path.join(__dirname,'../../apps-script/admin/Code.gs'),'utf8');
const start=code.indexOf('/** Bulk product upload');
const db={China_Products:[],Egypt_Stock:[],Dubai_Stock:[],Product_Media:[]};let translations=0,tick=0;
const sb={console,Utilities:{getUuid:()=>'abcdef12-34'+(++tick),base64Decode:b=>[...Buffer.from(b,'base64')].map(x=>x>127?x-256:x),newBlob:x=>x},LanguageApp:{translate:(t,f,to)=>{translations++;return to==='ar'?'ترجمة '+t:'translated '+t}},LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},DriveApp:{Access:{},Permission:{}},
 access_:()=>({email:'a@b'}),db_:()=>({}),ensure_:()=>{},rows_:n=>db[n].map(r=>({...r})),append_:(n,o)=>db[n].push(o),log_:()=>{},mediaFolder_:()=>({createFile:()=>({setSharing(){},getId:()=>'F'+(++tick)})}),vioSetFields_:(t,k,id,c)=>{Object.assign(db[t].find(r=>String(r[k])===id),c);return{ok:true}}};
vm.createContext(sb);vm.runInContext(code.slice(start)+';this.save=vioBulkSaveRow;this.exp=vioBulkExport;this.pub=vioBulkPublishOne;',sb);
const jpg=Buffer.from([255,216,255,217]).toString('base64');
let r=sb.save({code:'EL-001',location:'Egypt',nameAr:'سماعة',category:'Electronics',qty:10,price:100,moq:5,descEn:'Good sound',photos:[{base64:jpg}]});
const row=db.Egypt_Stock[0];ok(r.created&&row.Status==='Draft','new product is Draft');ok(row.Product_Name==='translated سماعة'&&row.Product_Name_AR==='سماعة','Arabic name translated');ok(row.Description_AR==='ترجمة Good sound','English description translated');ok(row.Availability==='In Stock'&&row.Price_Visibility==='Show'&&/^https:\/\/drive/.test(row.Image_URL),'stock fields and photo');
row.Status='Active';const before=translations;r=sb.save({code:'EL-001',location:'Egypt',nameEn:row.Product_Name,nameAr:row.Product_Name_AR,category:'Electronics',qty:0,price:120,photos:[]});
ok(!r.created&&db.Egypt_Stock.length===1&&row.Status==='Active'&&row.Selling_Price===120&&row.Availability==='Out of Stock'&&translations===before,'update keeps status and adds no duplicate');ok(row.Description==='translated'||row.Description==='Good sound','blank description keeps old text');
let e='';try{sb.save({code:'EL-001',location:'China',nameEn:'X',category:'Home'})}catch(x){e=x.message}ok(/already exists in Egypt/.test(e),'code cannot move location');
e='';try{sb.save({code:'EL-002',location:'Dubai',nameEn:'X',category:'Home',qty:'',price:1})}catch(x){e=x.message}ok(/quantity/.test(e),'stock needs quantity');
e='';try{sb.save({code:'A B',location:'China',nameEn:'X'})}catch(x){e=x.message}ok(/Code/.test(e),'bad code refused');
sb.save({code:'H-1',location:'China',nameEn:'Pan',category:'Home',photos:[{base64:jpg}]});ok(db.China_Products[0].Description==='Details available on request'&&db.Product_Media.length===1&&db.China_Products[0].Status==='Draft','China product and media');
const list=sb.exp();ok(list.length===2&&list.find(x=>x.code==='EL-001').price===120,'export lists products');
sb.pub({location:'China',id:db.China_Products[0].Product_ID});ok(db.China_Products[0].Status==='Active','publish');
// --- Excel files in a real browser
const fixture=path.join(tmp,'in.xlsx');
execFileSync('python3',['-c',`
import openpyxl,sys
w=openpyxl.Workbook();s=w.active
s.append(['Code','Name English','Name Arabic','Location','Category','Qty','Price','MOQ','Lead Days','Description English','Description Arabic'])
s.append(['EXAMPLE-1','Sample','','Egypt','Electronics',1,1,1,None,'',''])
s.append(['EL-001','Camera','كاميرا','مصر','إلكترونيات',200,990.5,50,None,'Nice & clear',''])
s.append(['H-1',None,'مقلاة','China','Home',None,None,None,30,'',''])
s.append(['BAD 1',None,None,'Mars','Toys',-1,None,None,None,'',''])
s.append(['EL-001','Twin','','Egypt','Electronics',1,1,None,None,'',''])
s.append(['D-1','Lamp','','UAE','Home',5,None,None,None,'',''])
w.save(sys.argv[1])`,fixture]);
const html=fs.readFileSync(path.join(__dirname,'../../apps-script/admin/AdminIndex.html'),'utf8');
const script=html.slice(html.lastIndexOf('<script>')+8,html.lastIndexOf('</script>'));
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.setContent('<div></div>');await p.addScriptTag({content:'window.escapeHtml=x=>String(x);window.run=()=>{};'+script});
const res=await p.evaluate(async b64=>{const L=window.vioBulkLib;const buf=Uint8Array.from(atob(b64),c=>c.charCodeAt(0)).buffer;const rows=await L.readXlsx(buf);const v=L.validate(rows,['EL-001.jpg','el-001-2.PNG','H-1.jpg','other.jpg'],{'H-1':{location:'China',id:'P1'}});const blob=L.writeXlsx([{code:'A-1',nameEn:'Tom & Jerry <x>',nameAr:'عربي',location:'Egypt',category:'Home',qty:5,price:9.5,moq:'',leadDays:'',descEn:'',descAr:''}]);const out=btoa(String.fromCharCode(...new Uint8Array(await blob.arrayBuffer())));const round=await L.readXlsx(await blob.arrayBuffer());return{rows,v,out,round}},fs.readFileSync(fixture).toString('base64'));
ok(res.rows.length===6&&res.rows[1].nameAr==='كاميرا'&&res.rows[1].price==='990.5','reads Excel with Arabic');
const by=(i)=>res.v.rows[i];ok(res.v.rows.length===5,'example row ignored');ok(by(0).location==='Egypt'&&by(0).category==='Electronics'&&by(0).problems.length===0&&by(0).photoNames.length===2,'Arabic location, category and photos matched');ok(!by(1).isNew&&by(1).problems.length===0&&by(1).location==='China','existing China product recognised');ok(by(2).problems.length>=3,'bad row reports problems');ok(by(3).problems.includes('Code appears twice in the file'),'duplicate code found');ok(by(4).problems.includes('Add a price')&&by(4).location==='Dubai','UAE maps to Dubai and needs a price');ok(res.v.unusedPhotos.join()==='other.jpg','unmatched photo listed');
ok(res.round[0].nameEn==='Tom & Jerry <x>'&&res.round[0].price==='9.5','written file reads back');
const outFile=path.join(tmp,'out.xlsx');fs.writeFileSync(outFile,Buffer.from(res.out,'base64'));
const check=execFileSync('python3',['-c','import openpyxl,sys;s=openpyxl.load_workbook(sys.argv[1]).active;print(s["A1"].value,s["B2"].value,s["C2"].value,s["F2"].value,s.max_row)',outFile]).toString().trim();ok(check==='Code Tom & Jerry <x> عربي 5 2','openpyxl opens written file: '+check);
await b.close()})().catch(e=>{console.log('ERROR',e.message);process.exit(1)});
