/** VIO ADMIN — deploy in a SEPARATE Apps Script project, execute as USER ACCESSING. */







const VIO_DB='176X-ZAGuXpiDOr0Wshs3LI0lu9WUSN2DohCX5Iyi4zY';







const VIO_OWNER='vioglobal1@gmail.com';







function doGet(){return HtmlService.createHtmlOutputFromFile('AdminIndex').setTitle('VIO | Management Portal').addMetaTag('viewport','width=device-width, initial-scale=1');}







function db_(){return SpreadsheetApp.openById(VIO_DB);}







function tab_(name){const s=db_().getSheetByName(name);if(!s)throw Error('Missing tab: '+name+'. Run setupVIOAdmin once.');return s;}







function rows_(name){const s=tab_(name),v=s.getDataRange().getValues();if(v.length<2)return [];const h=v[0].map(String);return v.slice(1).filter(r=>r.some(x=>x!==''&&x!==null)).map((r,i)=>Object.fromEntries([['__row',i+2],...h.map((k,j)=>[k,r[j] instanceof Date?r[j].toISOString():r[j]])]));}







function append_(name,obj){const s=tab_(name),h=s.getRange(1,1,1,s.getLastColumn()).getValues()[0];s.appendRow(h.map(k=>safeCell_(obj[k]===undefined?'':obj[k])));}







function safeCell_(v){return typeof v==='string'&&/^[=+\-@\t\r]/.test(v)?"'"+v:v;}







function identity_(){const email=String(Session.getActiveUser().getEmail()||'').trim().toLowerCase();if(!email)throw Error('Your Google identity is unavailable. Deploy Admin as "User accessing the web app", require Google sign-in, and grant this account spreadsheet access. Never deploy Admin as "Me".');return email;}







function access_(roles){const email=identity_(),p=rows_('Permissions').find(r=>String(r.Email||'').trim().toLowerCase()===email&&String(r.Status||'').toLowerCase()==='active');if(!p)throw Error('Access denied: your email is not Active in Permissions.');const role=String(p.Role||'').trim();if(roles&&!roles.includes(role))throw Error('Your role does not permit this action.');return {email,role};}







function log_(action,ref,detail){try{append_('Activity_Log',{Timestamp:new Date(),Email:identity_(),Action:action,Reference:ref,Details:String(detail||'').slice(0,500)});}catch(e){console.error(e);}}







function ensure_(ss,name,headers){let s=ss.getSheetByName(name);if(!s)s=ss.insertSheet(name);let existing=s.getLastColumn()?s.getRange(1,1,1,s.getLastColumn()).getValues()[0].map(String):[];headers.forEach(h=>{if(!existing.includes(h)){s.getRange(1,existing.length+1).setValue(h).setBackground('#C6A052').setFontColor('#ffffff').setFontWeight('bold');existing.push(h);}});s.setFrozenRows(1);}







/** RUN ONCE FROM THE ADMIN SCRIPT EDITOR, AS THE SPREADSHEET OWNER. */







function setupVIOAdmin(){const ss=db_();ensure_(ss,'Permissions',['Email','Role','Status','Receive_Notifications']);ensure_(ss,'China_Products',['Product_ID','Product_Name','Category','Description','Specifications','Image_URL','Video_URL','MOQ','Lead_Time_Days','Status','Supplier_ID','Created_At']);ensure_(ss,'Product_Media',['Media_ID','Product_ID','Media_Type','Media_URL','File_ID','Sort_Order','Created_At']);ensure_(ss,'Shipping_Rates',['Rate_ID','Destination','Shipping_Mode','Goods_Type','Rate_USD','Unit','Effective_Date','Status','Last_Updated']);ensure_(ss,'Exchange_Rates',['Currency','AED_Per_Unit','Updated_At','Source','Manual_Override']);ensure_(ss,'Activity_Log',['Timestamp','Email','Action','Reference','Details']);ensure_(ss,'Upload_Submissions',['Submission_Key','Status','Product_IDs','Created_At','Completed_At']);const p=ss.getSheetByName('Permissions'),h=p.getRange(1,1,1,p.getLastColumn()).getValues()[0],emailIdx=h.indexOf('Email');let found=false;if(p.getLastRow()>1)found=p.getRange(2,emailIdx+1,p.getLastRow()-1,1).getValues().some(r=>String(r[0]).toLowerCase()===VIO_OWNER);if(!found)append_('Permissions',{Email:VIO_OWNER,Role:'Admin',Status:'Active',Receive_Notifications:'Yes'});Logger.log('VIO Admin tables prepared. Existing rows preserved.');}







function adminBootstrap(){const a=access_();return {user:a,products:rows_('China_Products').filter(r=>r.Product_ID).map(publicAdminProduct_),rfqs:['Admin','Buyer'].includes(a.role)?rows_('Price_Inquiries').filter(r=>r.RFQ_ID).map(r=>({RFQ_ID:r.RFQ_ID,Created_At:r.Created_At,Customer_Name:r.Customer_Name,Product_Name:r.Product_Name,Requested_Qty:r.Requested_Qty,Destination_Country:r.Destination_Country,Shipping_Mode:r.Shipping_Mode,Status:r.Status,Phone:r.Phone,Email:r.Email,Notes:r.Notes})):[],customers:['Admin','Buyer'].includes(a.role)?rows_('Customers').filter(r=>r.Customer_ID).map(r=>({Customer_ID:r.Customer_ID,Customer_Name:r.Customer_Name,Phone:r.Phone,Email:r.Email,Company_Name:r.Company_Name,Request_Count:r.Request_Count,Last_Request_At:r.Last_Request_At})):[],rates:['Admin','Buyer','Logistics'].includes(a.role)?rows_('Shipping_Rates').filter(r=>r.Rate_ID):[],permissions:a.role==='Admin'?rows_('Permissions').filter(r=>r.Email):[]};}







function publicAdminProduct_(r){return {Product_ID:r.Product_ID,Product_Name:r.Product_Name,Category:r.Category,Status:r.Status,Image_URL:r.Image_URL,Created_At:r.Created_At};}







function saveRecommendation(payload){const a=access_(['Admin','Buyer']);if(!payload||typeof payload!=='object')throw Error('Invalid upload');const submissionKey=String(payload.submissionKey||'').trim();if(!/^[A-Za-z0-9_-]{12,100}$/.test(submissionKey))throw Error('Invalid upload session. Refresh the admin portal and retry.');const groups=payload.groups;if(!Array.isArray(groups)||groups.length<1||groups.length>30)throw Error('Choose 1–30 product groups');const lock=LockService.getScriptLock();lock.waitLock(30000);try{const subSheet=tab_('Upload_Submissions');const subRows=rows_('Upload_Submissions');const previous=subRows.find(r=>String(r.Submission_Key)===submissionKey);if(previous){if(previous.Status==='Completed')return {ok:true,ids:String(previous.Product_IDs||'').split(',').filter(Boolean),alreadySaved:true};throw Error('This upload may have been partially saved. Check Existing Recommendations before retrying with a new batch.');}append_('Upload_Submissions',{Submission_Key:submissionKey,Status:'Processing',Product_IDs:'',Created_At:new Date()});const subRow=subSheet.getLastRow();const subHeaders=subSheet.getRange(1,1,1,subSheet.getLastColumn()).getValues()[0].map(String);const setSub=(field,value)=>subSheet.getRange(subRow,subHeaders.indexOf(field)+1).setValue(value);const folder=mediaFolder_();const result=[];for(const group of groups){const media=group.media;if(!Array.isArray(media)||media.length<1||media.length>12)throw Error('Each product needs 1–12 media items');const id='VIO-PRD-'+Utilities.getUuid().slice(0,10).toUpperCase();let imageUrl='',videoUrl='',sort=0;for(const item of media){const type=String(item.type||'');let url='',fid='';if(type==='image'&&item.base64){const mime=String(item.mime||'');if(!['image/jpeg','image/png','image/webp'].includes(mime))throw Error('JPG, PNG or WEBP only');const bytes=Utilities.base64Decode(String(item.base64));if(bytes.length>4*1024*1024||!bytes.length)throw Error('Image exceeds 4MB');const signature=bytes.map(x=>(x+256)%256);const valid=mime==='image/jpeg'?signature[0]===255&&signature[1]===216:mime==='image/png'?signature.slice(0,8).join(',')==='137,80,78,71,13,10,26,10':signature.slice(0,4).map(x=>String.fromCharCode(x)).join('')==='RIFF'&&signature.slice(8,12).map(x=>String.fromCharCode(x)).join('')==='WEBP';if(!valid)throw Error('Invalid image file');const ext=mime==='image/jpeg'?'jpg':mime==='image/png'?'png':'webp';const f=folder.createFile(Utilities.newBlob(bytes,mime,id+'-'+(++sort)+'.'+ext));f.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);fid=f.getId();url='https\\://drive.google.com/thumbnail?id='+encodeURIComponent(fid)+'&sz=w1200';}else if(['image','video','catalog'].includes(type)&&/^https:\/\//i.test(String(item.url||''))){url=String(item.url).slice(0,1800);sort++;}else throw Error('Each media item must be an image or valid HTTPS link');if(type==='image'&&!imageUrl)imageUrl=url;if(type==='video'&&!videoUrl)videoUrl=url;append_('Product_Media',{Media_ID:'MED-'+Utilities.getUuid().slice(0,10),Product_ID:id,Media_Type:type,Media_URL:url,File_ID:fid,Sort_Order:sort,Created_At:new Date()});}append_('China_Products',{Product_ID:id,Product_Name:String(group.name||'').trim().slice(0,150)||'Product '+id,Category:String(payload.category||'').slice(0,80),Description:'Details available on request',Image_URL:imageUrl,Video_URL:videoUrl,Status:payload.publish?'Active':'Draft',Supplier_ID:String(payload.supplier||'').slice(0,100),Created_At:new Date()});result.push(id);setSub('Product_IDs',result.join(','));log_('CREATE_RECOMMENDATION',id,'Status: '+(payload.publish?'Active':'Draft'));}setSub('Status','Completed');setSub('Completed_At',new Date());return {ok:true,ids:result,alreadySaved:false};}finally{lock.releaseLock();}}







function mediaFolder_(){const props=PropertiesService.getScriptProperties(),id=props.getProperty('VIO_PUBLIC_MEDIA_FOLDER');if(id)return DriveApp.getFolderById(id);const f=DriveApp.createFolder('VIO - Public Recommendation Media');props.setProperty('VIO_PUBLIC_MEDIA_FOLDER',f.getId());return f;}







function setRecommendationStatus(id,status){access_(['Admin','Buyer']);if(!['Active','Draft','Archived'].includes(status))throw Error('Invalid status');const s=tab_('China_Products'),h=s.getRange(1,1,1,s.getLastColumn()).getValues()[0],i=h.indexOf('Product_ID'),j=h.indexOf('Status');if(i<0||j<0)throw Error('Missing product columns');const data=s.getDataRange().getValues();for(let k=1;k<data.length;k++)if(String(data[k][i])===String(id)){s.getRange(k+1,j+1).setValue(status);log_('PRODUCT_STATUS',id,status);return {ok:true};}throw Error('Product not found');}







function setRFQStatus(id,status){access_(['Admin','Buyer']);if(!['New Request','In Sourcing','Quoted','Closed'].includes(status))throw Error('Invalid status');const s=tab_('Price_Inquiries'),h=s.getRange(1,1,1,s.getLastColumn()).getValues()[0],i=h.indexOf('RFQ_ID'),j=h.indexOf('Status');if(i<0||j<0)throw Error('Missing RFQ columns');const data=s.getDataRange().getValues();for(let k=1;k<data.length;k++)if(String(data[k][i])===String(id)){s.getRange(k+1,j+1).setValue(status);log_('RFQ_STATUS',id,status);return {ok:true};}throw Error('RFQ not found');}







function saveShippingRate(x){access_(['Admin','Logistics']);vioFreightEnsure_();const v=vioFreightValidate_(x);const id='RATE-'+Utilities.getUuid().slice(0,8);const lock=LockService.getScriptLock();lock.waitLock(30000);try{vioFreightDeactivate_(v,null);append_('Shipping_Rates',{Rate_ID:id,Origin:v.origin,Destination:v.destination,Shipping_Mode:v.mode,Goods_Type:v.goods,Rate_USD:v.rate,Unit:v.mode==='Sea Freight'?'CBM':'KG',Transit_Min_Days:v.minDays,Transit_Max_Days:v.maxDays,Effective_Date:new Date(),Status:'Active',Last_Updated:new Date()});log_('FREIGHT_RATE_ADDED',id,v.origin+' > '+v.destination);return {ok:true,id};}finally{lock.releaseLock();}}







function upsertPermission(x){access_(['Admin']);const email=String(x.email||'').trim().toLowerCase(),role=String(x.role||''),status=String(x.status||'');if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!['Admin','Buyer','Logistics','Viewer'].includes(role)||!['Active','Inactive'].includes(status))throw Error('Invalid permission');if(email===VIO_OWNER&&(role!=='Admin'||status!=='Active'))throw Error('The primary admin cannot be disabled here');const s=tab_('Permissions'),h=s.getRange(1,1,1,s.getLastColumn()).getValues()[0],data=s.getDataRange().getValues();for(let k=1;k<data.length;k++)if(String(data[k][h.indexOf('Email')]).trim().toLowerCase()===email){for(const [key,val] of Object.entries({Role:role,Status:status}))s.getRange(k+1,h.indexOf(key)+1).setValue(val);log_('PERMISSION_UPDATED',email,role+' '+status);return {ok:true};}append_('Permissions',{Email:email,Role:role,Status:status,Receive_Notifications:'No'});log_('PERMISSION_ADDED',email,role+' '+status);return {ok:true};}







/** Freight estimate only, not full landed cost. Latest active rate, USD->AED via configured sheet. */







function freightEstimate(x){access_(['Admin','Buyer','Logistics']);const qty=Number(x.quantity);if(!Number.isFinite(qty)||qty<=0)throw Error('Enter CBM or KG');const rate=vioActiveRate_(String(x.destination),String(x.mode),String(x.goods),String(x.origin||'China'));const usd=Number(rate.Rate_USD)*qty;const fx=rows_('Exchange_Rates').find(r=>String(r.Currency).toUpperCase()==='USD');const aedRate=fx?Number(fx.Manual_Override)||Number(fx.AED_Per_Unit):0;return {usd,rate:rate.Rate_USD,unit:rate.Unit,aed:aedRate>0?usd*aedRate:null,fx:aedRate>0?aedRate:null,rateId:rate.Rate_ID,transitMin:rate.Transit_Min_Days,transitMax:rate.Transit_Max_Days};}







/** VIO phase 2: sourcing, rates, and stock. No public entry points here. */



function vioPhase2Setup(){access_(['Admin']);const ss=db_();



 ensure_(ss,'Price_Inquiries',['RFQ_ID','Status','Assigned_To','Internal_Notes','Follow_Up_Date','Updated_At']);



 ensure_(ss,'Egypt_Stock',['Stock_ID','Product_Name','Category','Description','Image_URL','Media_URLs','Available_Qty','MOQ','Status','Updated_At']);



 ensure_(ss,'Dubai_Stock',['Stock_ID','Product_Name','Category','Description','Image_URL','Media_URLs','Available_Qty','MOQ','Status','Updated_At']);



 ensure_(ss,'Landed_Cost_Calculations',['Calculation_ID','Created_At','RFQ_ID','Destination','Shipping_Mode','Goods_Type','Quantity_PCS','Unit_Cost','Supplier_Currency','Supplier_Total_USD','Freight_USD','Additional_Cost_USD','Landed_Total_USD','Landed_Unit_USD','Destination_Currency','Landed_Total_Local','Landed_Unit_Local','Margin_Percent','Selling_Unit_Local','Rate_ID','FX_USD_To_Local','FX_Updated_At','Created_By']);



 ensure_(ss,'Exchange_Rates',['Currency','AED_Per_Unit','Updated_At','Source','Manual_Override','USD_Per_Unit']);



 return {ok:true};



}



function vioSetFields_(tab,keyColumn,id,changes){const s=tab_(tab),v=s.getDataRange().getValues(),h=v[0].map(String),ki=h.indexOf(keyColumn);if(ki<0)throw Error('Missing '+keyColumn);const row=v.findIndex((r,i)=>i>0&&String(r[ki])===String(id));if(row<0)throw Error('Record not found');for(const [k,val] of Object.entries(changes)){const col=h.indexOf(k);if(col>=0)s.getRange(row+1,col+1).setValue(safeCell_(val));}return {ok:true};}



function updateRFQDetails(x){access_(['Admin','Buyer']);if(!x||!x.id)throw Error('Select RFQ');const status=String(x.status||'');if(!['New Request','In Sourcing','Quoted','Closed'].includes(status))throw Error('Invalid status');const assigned=String(x.assigned||'').trim().slice(0,120),notes=String(x.notes||'').slice(0,3000);const follow=String(x.followUp||'');if(follow&&!/^\d{4}-\d{2}-\d{2}$/.test(follow))throw Error('Invalid follow-up date');const r=vioSetFields_('Price_Inquiries','RFQ_ID',x.id,{Status:status,Assigned_To:assigned,Internal_Notes:notes,Follow_Up_Date:follow,Updated_At:new Date()});log_('RFQ_UPDATED',x.id,status+' / '+assigned);return r;}



function vioActiveRate_(destination,mode,goods,origin){const from=String(origin||'China');const list=rows_('Shipping_Rates').filter(r=>String(r.Origin||'China')===from&&r.Destination===destination&&r.Shipping_Mode===mode&&r.Goods_Type===goods&&String(r.Status).toLowerCase()==='active'&&Number(r.Rate_USD)>0);list.sort((a,b)=>String(b.Effective_Date||b.Last_Updated||'').localeCompare(String(a.Effective_Date||a.Last_Updated||'')));if(!list.length)throw Error('No active shipping rate for '+from+' → '+destination+' / '+mode+' / '+goods);return list[0];}



function vioExchange_(currency){const c=String(currency||'').toUpperCase();if(c==='USD')return {usdPerUnit:1,updated:'USD base',source:'Base'};const row=rows_('Exchange_Rates').find(r=>String(r.Currency).toUpperCase()===c);if(!row)throw Error('Missing exchange rate for '+c+'. Update Exchange_Rates first.');const manual=Number(row.Manual_Override),usd=manual>0?manual:Number(row.USD_Per_Unit);if(!(usd>0))throw Error('Missing USD_Per_Unit for '+c);return {usdPerUnit:usd,updated:row.Updated_At,source:manual>0?'Manual override':row.Source};}



/** Fetch rates from public endpoint; call manually or schedule a daily trigger. Overrides remain untouched. */



function updateVIOExchangeRates(){access_(['Admin']);return vioRefreshFX_();}



function vioRefreshFX_(){const url='https\\://open.er-api.com/v6/latest/USD';const response=UrlFetchApp.fetch(url,{muteHttpExceptions:true});if(response.getResponseCode()!==200)throw Error('Exchange-rate service unavailable');const data=JSON.parse(response.getContentText());if(data.result!=='success'||!data.rates)throw Error('Invalid exchange-rate response');const ss=db_();ensure_(ss,'Exchange_Rates',['Currency','AED_Per_Unit','Updated_At','Source','Manual_Override','USD_Per_Unit']);const s=tab_('Exchange_Rates'),h=s.getRange(1,1,1,s.getLastColumn()).getValues()[0].map(String);const existing=rows_('Exchange_Rates');const usdAed=Number(data.rates.AED);if(!(usdAed>0))throw Error('AED rate unavailable');const now=new Date();let count=0;for(const currency of ['AED','EGP','CNY','SAR','USD']){const perUsd=Number(data.rates[currency]);if(!(perUsd>0))continue;const values={AED_Per_Unit:usdAed/perUsd,USD_Per_Unit:1/perUsd,Updated_At:now,Source:'open.er-api.com (indicative)'};const row=existing.find(r=>String(r.Currency).toUpperCase()===currency);if(row){for(const [k,v] of Object.entries(values))s.getRange(row.__row,h.indexOf(k)+1).setValue(v);}else append_('Exchange_Rates',{Currency:currency,...values,Manual_Override:''});count++;}log_('FX_REFRESH','USD',count+' currencies');return {ok:true,count,updatedAt:now.toISOString()};}



function calculateLandedCost(x){const a=access_(['Admin','Buyer','Logistics']);if(!x)throw Error('Missing calculation');const dest=String(x.destination),mode=String(x.mode),goods=String(x.goods);if(!['Egypt','UAE'].includes(dest)||!['Sea Freight','Air Freight'].includes(mode)||!['Normal','Dangerous Goods'].includes(goods))throw Error('Check shipping selections');const pcs=Number(x.pcs),cost=Number(x.unitCost),measure=Number(x.freightMeasure),additional=Number(x.additionalUsd||0),margin=Number(x.margin||0);if(!Number.isSafeInteger(pcs)||pcs<1||pcs>1e8||![cost,measure,additional,margin].every(Number.isFinite)||cost<0||measure<=0||additional<0||margin<0||margin>=100)throw Error('Check quantities, costs and margin (0–99%)');const supplierCurrency=String(x.supplierCurrency||'USD').toUpperCase();if(!['USD','AED','CNY','EGP'].includes(supplierCurrency))throw Error('Unsupported supplier currency');const rate=vioActiveRate_(dest,mode,goods),supplierFx=vioExchange_(supplierCurrency),local=dest==='UAE'?'AED':'EGP',localFx=vioExchange_(local);const supplierTotalUsd=pcs*cost*supplierFx.usdPerUnit,freightUsd=measure*Number(rate.Rate_USD),totalUsd=supplierTotalUsd+freightUsd+additional,totalLocal=totalUsd/localFx.usdPerUnit,unitLocal=totalLocal/pcs,sellingUnit=unitLocal/(1-margin/100);const result={supplierTotalUsd,freightUsd,totalUsd,totalLocal,unitLocal,sellingUnit,localCurrency:local,rateId:rate.Rate_ID,rateUsd:Number(rate.Rate_USD),fxUsdToLocal:1/localFx.usdPerUnit,fxUpdatedAt:localFx.updated,margin};if(x.save){if(a.role==='Logistics')throw Error('Only Admin and Buyer can save a landed-cost calculation');const id='VIO-LC-'+Utilities.getUuid().slice(0,8).toUpperCase();append_('Landed_Cost_Calculations',{Calculation_ID:id,Created_At:new Date(),RFQ_ID:String(x.rfqId||''),Destination:dest,Shipping_Mode:mode,Goods_Type:goods,Quantity_PCS:pcs,Unit_Cost:cost,Supplier_Currency:supplierCurrency,Supplier_Total_USD:supplierTotalUsd,Freight_USD:freightUsd,Additional_Cost_USD:additional,Landed_Total_USD:totalUsd,Landed_Unit_USD:totalUsd/pcs,Destination_Currency:local,Landed_Total_Local:totalLocal,Landed_Unit_Local:unitLocal,Margin_Percent:margin,Selling_Unit_Local:sellingUnit,Rate_ID:rate.Rate_ID,FX_USD_To_Local:result.fxUsdToLocal,FX_Updated_At:localFx.updated,Created_By:a.email});result.calculationId=id;log_('LANDED_COST_SAVED',id,String(x.rfqId||''));}return result;}



function saveStockItem(x){access_(['Admin','Buyer']);if(!x||!['Egypt','Dubai'].includes(x.market))throw Error('Select Egypt or Dubai');const name=String(x.name||'').trim().slice(0,150),qty=Number(x.qty),moq=Number(x.moq||0);if(!name||!Number.isSafeInteger(qty)||qty<0||!Number.isSafeInteger(moq)||moq<0)throw Error('Enter valid product name, quantity and MOQ');const status=String(x.status||'Active');if(!['Active','Draft','Archived'].includes(status))throw Error('Invalid status');const url=String(x.image||'').trim();if(url&&!/^https:\/\//i.test(url))throw Error('Image must use HTTPS');const id='VIO-STK-'+Utilities.getUuid().slice(0,10).toUpperCase();append_(x.market+'_Stock',{Stock_ID:id,Product_Name:name,Category:String(x.category||'').slice(0,80),Description:String(x.description||'').slice(0,500),Image_URL:url,Available_Qty:qty,MOQ:moq,Status:status,Updated_At:new Date()});log_('STOCK_CREATED',id,x.market);return {ok:true,id};}



function updateStockItem(x){access_(['Admin','Buyer']);if(!x||!['Egypt','Dubai'].includes(x.market)||!['Active','Draft','Archived'].includes(x.status))throw Error('Invalid stock update');const qty=Number(x.qty);if(!Number.isSafeInteger(qty)||qty<0)throw Error('Invalid quantity');return vioSetFields_(x.market+'_Stock','Stock_ID',x.id,{Status:x.status,Available_Qty:qty,Updated_At:new Date()});}



/** Read fresh data, applying the current Permissions sheet on each call. */



function adminPhase2Data(){const a=access_();return {rfqs:['Admin','Buyer'].includes(a.role)?rows_('Price_Inquiries').filter(r=>r.RFQ_ID).map(r=>({RFQ_ID:r.RFQ_ID,Customer_Name:r.Customer_Name,Product_Name:r.Product_Name,Requested_Qty:r.Requested_Qty,Destination_Country:r.Destination_Country,Shipping_Mode:r.Shipping_Mode,Status:r.Status,Assigned_To:r.Assigned_To,Internal_Notes:r.Internal_Notes,Follow_Up_Date:r.Follow_Up_Date,Created_At:r.Created_At,Phone:r.Phone,Email:r.Email,Product_Source:r.Product_Source})):[],stocks:{Egypt:[],Dubai:[]},fx:['Admin','Buyer','Logistics'].includes(a.role)?rows_('Exchange_Rates').filter(r=>r.Currency).map(r=>({Currency:r.Currency,USD_Per_Unit:r.USD_Per_Unit,Updated_At:r.Updated_At,Source:r.Source,Manual_Override:r.Manual_Override})):[]};}







/** Run once as the owner in the script editor after setup. Daily rate refresh thereafter. */



function installVIODailyFXTrigger(){const email=identity_();if(email!==VIO_OWNER)throw Error('Only the primary admin may install the FX trigger');ScriptApp.getProjectTriggers().filter(t=>t.getHandlerFunction()==='vioDailyFXJob_').forEach(t=>ScriptApp.deleteTrigger(t));ScriptApp.newTrigger('vioDailyFXJob_').timeBased().everyDays(1).atHour(7).create();return {ok:true};}



function vioDailyFXJob_(){try{vioRefreshFX_();}catch(e){console.error('Daily FX refresh failed: '+e.message);}}











/** PHASE 3 — additive schema migration; never deletes existing data. */



function setupVIOPhase3(){access_(['Admin']);const ss=db_();vioPhase2Setup();



 ['Egypt','Dubai'].forEach(m=>ensure_(ss,m+'_Stock',['Selling_Price','Price_Visibility','Availability','Currency']));



 ensure_(ss,'Price_Inquiries',['Quotation_ID','Quotation_Status']);



 ensure_(ss,'Supplier_Quotations',['Supplier_Quote_ID','RFQ_ID','Created_At','Supplier_Name','Supplier_Currency','Unit_Price','MOQ','Quantity','PCS_Per_Carton','Carton_L_CM','Carton_W_CM','Carton_H_CM','Net_Unit_KG','Gross_Carton_KG','Production_Days','Payment_Terms','Supplier_Media_URLs','Destination','Shipping_Mode','Goods_Type','Extra_Charges_USD','Customs_USD','Clearance_USD','Local_Delivery_USD','Margin_Percent','Validity_Days','Transit_Days','Customs_Days','Local_Delivery_Days','Cartons','Total_CBM','Gross_KG','Chargeable_KG','Freight_USD','Landed_Unit_Local','Suggested_Unit_Local','Currency','Approval_Status','Created_By','Notes']);



 ensure_(ss,'Customer_Quotations',['Quotation_ID','RFQ_ID','Supplier_Quote_ID','Created_At','Product_Name','Quantity','MOQ','Destination','Currency','Selling_Unit','Selling_Total','Production_Days','Transit_Days','Customs_Days','Local_Delivery_Days','Total_Lead_Days','Validity_Days','Commercial_Terms','Approval_Status','Approved_By','Approved_At','Sent_At','Customer_Email','Customer_Name']);



 ensure_(ss,'Lead_Time_Settings',['Destination','Shipping_Mode','Transit_Days','Customs_Days','Local_Delivery_Days']);



 ensure_(ss,'Freight_Settings',['Setting','Value']);const fs=tab_('Freight_Settings');if(fs.getLastRow()===1)fs.appendRow(['Air_Volumetric_Divisor_CM3_Per_KG',6000]);



 const lt=tab_('Lead_Time_Settings');if(lt.getLastRow()===1){[['Egypt','Sea Freight',35,7,3],['Egypt','Air Freight',10,7,3],['UAE','Sea Freight',25,5,2],['UAE','Air Freight',7,4,2]].forEach(r=>lt.appendRow(r));}



 return {ok:true,message:'Phase 3 sheets and columns ready; existing rows preserved'};



}



function vioNumber_(v,label,min,allowZero){if(v===''||v===null||v===undefined)throw Error(label+' required');const n=Number(v);if(!Number.isFinite(n)||n<min)throw Error('Invalid '+label);return n;}



function vioGetLead_(destination,mode){const r=rows_('Lead_Time_Settings').find(r=>r.Destination===destination&&r.Shipping_Mode===mode);if(!r)throw Error('Configure lead time for '+destination+' / '+mode);return r;}



function vioGetRFQ_(id){const r=rows_('Price_Inquiries').find(r=>String(r.RFQ_ID)===String(id));if(!r)throw Error('RFQ not found');if(String(r.Product_Source||'').toLowerCase()==='egypt'||String(r.Product_Source||'').toLowerCase()==='dubai')throw Error('Stock inquiries use the separate stock workflow');return r;}



function previewSupplierQuote(x){access_(['Admin','Buyer']);return vioComputeQuote_(x);}



function vioComputeQuote_(x){if(!x)throw Error('Missing quote');if(String(x.measurementMode||'carton')!=='manual'&&['length','width','height'].some(k=>String(x[k]===undefined?'':x[k]).trim()===''||!Number.isFinite(Number(x[k]))||Number(x[k])<=0))throw Error('Enter all three carton dimensions (L / W / H), each greater than zero.');const rfq=vioGetRFQ_(x.rfqId),qty=vioNumber_(x.quantity,'quantity',1),manual=String(x.measurementMode||'carton')==='manual',pc=manual?1:vioNumber_(x.pcsPerCarton,'pieces per carton',1);if(!Number.isInteger(qty)||!Number.isInteger(pc))throw Error('Quantity and pieces per carton must be whole numbers');



 const l=manual?0:vioNumber_(x.length,'carton length',0.01),w=manual?0:vioNumber_(x.width,'carton width',0.01),h=manual?0:vioNumber_(x.height,'carton height',0.01),gross=manual?0:(String(x.mode)==='Sea Freight'?0:0),net=manual||String(x.mode)==='Sea Freight'?0:vioNumber_(x.netUnitKg,'weight per piece kg',0.000001),packing=manual||String(x.mode)==='Sea Freight'?0:vioNumber_(x.packingCartonKg===undefined?'0':x.packingCartonKg,'packaging kg per carton',0),unit=vioNumber_(x.unitPrice,'unit price',0),moq=vioNumber_(x.moq,'MOQ',1),margin=vioNumber_(x.margin,'gross margin',0),production=vioNumber_(x.productionDays,'production days',0);if(margin>=100)throw Error('Margin must be below 100%');



 const destination=String(x.destination),mode=String(x.mode),goods=String(x.goods),currency=String(x.currency||'CNY').toUpperCase();if(!vioFreightCountries_().includes(destination)||!['Sea Freight','Air Freight'].includes(mode)||!['Normal','Dangerous Goods'].includes(goods)||!['USD','CNY','AED','EGP'].includes(currency))throw Error('Invalid destination, mode, goods or currency');



 const cartons=manual?0:Math.ceil(qty/pc),cbmCarton=manual?0:l*w*h/1000000,totalCbm=manual?(String(x.mode)==='Sea Freight'?vioNumber_(x.manualCbm,'total CBM',0.000001):0):cbmCarton*cartons,grossKg=manual?(String(x.mode)==='Air Freight'?vioNumber_(x.manualKg,'chargeable KG',0.000001):0):(String(x.mode)==='Air Freight'?qty*net+cartons*packing:0),airDivisor=Number((rows_('Freight_Settings').find(r=>r.Setting==='Air_Volumetric_Divisor_CM3_Per_KG')||{}).Value)||6000,volumetricKg=mode==='Sea Freight'?0:totalCbm*1000000/airDivisor,chargeableKg=mode==='Sea Freight'?0:(manual?grossKg:Math.max(grossKg,volumetricKg)),measure=mode==='Sea Freight'?totalCbm:chargeableKg;



 const rate=vioActiveRate_(destination,mode,goods),supplierFx=vioExchange_(currency),localCurrency=vioDestinationCurrency_(destination),localFx=vioExchange_(localCurrency),freightUsd=measure*Number(rate.Rate_USD);



 const extraUsd=0; // VIO Stage 1D: goods + international freight only
 const supplierUsd=qty*unit*supplierFx.usdPerUnit,landedUsd=supplierUsd+freightUsd+extraUsd,landedLocal=landedUsd/localFx.usdPerUnit,landedUnit=landedLocal/qty,sellingUnit=landedUnit/(1-margin/100),lead={Transit_Days:0};



 const transit=Number(rate.Transit_Max_Days||0),customsDays=0,deliveryDays=0;if(!(transit>0))throw Error('Shipping transit days not configured for this freight route. Open Shipping Rates and edit the active rate.');



 return {rfqId:rfq.RFQ_ID,cartons,cbmCarton,totalCbm,grossKg,volumetricKg,chargeableKg,freightUsd,rateId:rate.Rate_ID,rateUsd:rate.Rate_USD,supplierUsd,extraUsd,landedUsd,landedLocal,landedUnit,sellingUnit,sellingTotal:sellingUnit*qty,currency:localCurrency,productionDays:production,transitDays:transit,customsDays,deliveryDays,totalLeadDays:production+transit+customsDays+deliveryDays,fxUpdated:localFx.updated};



}



function saveSupplierQuote(x){const a=access_(['Admin','Buyer']);const r=vioComputeQuote_(x),id='VIO-SQ-'+Utilities.getUuid().slice(0,9).toUpperCase();const supplier=String(x.supplier||'').trim();if(!supplier)throw Error('Supplier required');const qty=Number(x.quantity);if(qty<Number(x.moq))throw Error('Requested quantity is below supplier MOQ');



 append_('Supplier_Quotations',{Supplier_Quote_ID:id,RFQ_ID:x.rfqId,Created_At:new Date(),Supplier_Name:supplier,Supplier_Currency:x.currency,Unit_Price:Number(x.unitPrice),MOQ:Number(x.moq),Quantity:qty,PCS_Per_Carton:Number(x.pcsPerCarton)||0,Carton_L_CM:Number(x.length)||0,Carton_W_CM:Number(x.width)||0,Carton_H_CM:Number(x.height)||0,Net_Unit_KG:Number(x.netUnitKg)||0,Gross_Carton_KG:Number(x.grossCartonKg)||0,Production_Days:r.productionDays,Payment_Terms:String(x.paymentTerms||'').slice(0,500),Supplier_Media_URLs:String(x.mediaUrls||'').slice(0,2000),Destination:x.destination,Shipping_Mode:x.mode,Goods_Type:x.goods,Extra_Charges_USD:0,Customs_USD:0,Clearance_USD:0,Local_Delivery_USD:0,Margin_Percent:Number(x.margin),Validity_Days:Number(x.validityDays||7),Transit_Days:r.transitDays,Customs_Days:r.customsDays,Local_Delivery_Days:r.deliveryDays,Measurement_Mode:String(x.measurementMode||'carton'),Cartons:r.cartons,Total_CBM:r.totalCbm,Gross_KG:r.grossKg,Chargeable_KG:r.chargeableKg,Freight_USD:r.freightUsd,Landed_Unit_Local:r.landedUnit,Suggested_Unit_Local:r.sellingUnit,Currency:r.currency,Approval_Status:'Draft',Created_By:a.email,Notes:String(x.notes||'').slice(0,1000)});



 const quoteId='VIO-QT-'+Utilities.getUuid().slice(0,9).toUpperCase();const rfq=vioGetRFQ_(x.rfqId);append_('Customer_Quotations',{Quotation_ID:quoteId,RFQ_ID:x.rfqId,Supplier_Quote_ID:id,Created_At:new Date(),Product_Name:rfq.Product_Name,Quantity:qty,MOQ:Number(x.moq),Destination:x.destination,Currency:r.currency,Selling_Unit:r.sellingUnit,Selling_Total:r.sellingTotal,Production_Days:r.productionDays,Transit_Days:r.transitDays,Customs_Days:r.customsDays,Local_Delivery_Days:r.deliveryDays,Total_Lead_Days:r.totalLeadDays,Validity_Days:Number(x.validityDays||7),Commercial_Terms:String(x.customerTerms||'').slice(0,1000),Approval_Status:'Pending Approval',Customer_Email:rfq.Email,Customer_Name:rfq.Customer_Name});vioSetFields_('Price_Inquiries','RFQ_ID',x.rfqId,{Quotation_ID:quoteId,Quotation_Status:'Pending Approval'});log_('QUOTE_DRAFT',quoteId,x.rfqId);return {ok:true,quoteId,supplierQuoteId:id,calculation:r};}



function approveCustomerQuote(id){const a=access_(['Admin']);const q=rows_('Customer_Quotations').find(r=>r.Quotation_ID===id);if(!q)throw Error('Quotation not found');if(q.Approval_Status!=='Pending Approval')throw Error('Only pending quotations can be approved');vioSetFields_('Customer_Quotations','Quotation_ID',id,{Approval_Status:'Approved',Approved_By:a.email,Approved_At:new Date()});vioSetFields_('Price_Inquiries','RFQ_ID',q.RFQ_ID,{Quotation_Status:'Approved'});log_('QUOTE_APPROVED',id,q.RFQ_ID);return {ok:true};}



function sendCustomerQuote(request){
 const a=access_(['Admin']);
 const id=typeof request==='string'?request:String(request&&request.id||'');
 const lang=typeof request==='string'?'en':String(request&&request.language||'en').toLowerCase();
 if(!['en','ar'].includes(lang))throw Error('Choose English or Arabic');
 const q=vioGetCustomerQuote_(id);
 if(!['Approved','Sent'].includes(String(q.Approval_Status)))throw Error('Quotation must be approved before sending');
 if(String(q.Customer_Decision||'')==='Accepted')throw Error('Customer already accepted this quotation');
 const email=String(q.Customer_Email||'').trim();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Customer email missing or invalid; nothing sent');
 const title=lang==='ar'?'عرض سعر تجاري من VIO Trading':'Commercial quotation from VIO Trading';
 const message=lang==='ar'?'عزيزي العميل،\nمرفق عرض السعر التجاري الخاص بكم. يرجى مراجعة الشروط والتواصل معنا لتأكيد الطلب.\nVIO Trading | +20 107 000 0604':'Dear '+String(q.Customer_Name||'Customer')+',\nPlease find your commercial quotation attached. Review the terms and contact us to confirm your order.\nVIO Trading | +20 107 000 0604';
 const filename='VIO-Trading-Quotation-'+id+'-'+lang.toUpperCase()+'.pdf';
 const pdf=HtmlService.createHtmlOutput(vioQuoteHtml_(q,lang)).getBlob().getAs('application/pdf').setName(filename);
 if(pdf.getBytes().length<1000)throw Error('PDF generation failed; no email sent');
 MailApp.sendEmail({to:email,subject:'VIO Trading | '+title+' | '+id,body:message,attachments:[pdf],name:'VIO Trading'});
 vioSetFields_('Customer_Quotations','Quotation_ID',id,{Approval_Status:'Sent',Sent_At:new Date(),Sent_Language:lang});
 vioSetFields_('Price_Inquiries','RFQ_ID',q.RFQ_ID,{Quotation_Status:'Sent',Status:'Quoted'});
 log_('QUOTE_SENT',id,email+' / '+lang);return {ok:true,language:lang,to:email};
}

function phase3Data(){const a=access_();return {quotes:['Admin','Buyer'].includes(a.role)?rows_('Customer_Quotations').filter(r=>r.Quotation_ID):[],leads:['Admin','Buyer','Logistics'].includes(a.role)?rows_('Lead_Time_Settings'):[]};}



function saveLeadTimes(x){access_(['Admin','Logistics']);const d=String(x.destination),m=String(x.mode);if(!['Egypt','UAE'].includes(d)||!['Sea Freight','Air Freight'].includes(m))throw Error('Invalid route');const v={Transit_Days:vioNumber_(x.transit,'transit',0),Customs_Days:vioNumber_(x.customs,'customs',0),Local_Delivery_Days:vioNumber_(x.delivery,'delivery',0)};const s=tab_('Lead_Time_Settings'),h=s.getRange(1,1,1,s.getLastColumn()).getValues()[0],data=s.getDataRange().getValues();let i=data.findIndex((r,j)=>j>0&&r[h.indexOf('Destination')]===d&&r[h.indexOf('Shipping_Mode')]===m);if(i<0){append_('Lead_Time_Settings',{Destination:d,Shipping_Mode:m,...v});}else Object.entries(v).forEach(([k,n])=>s.getRange(i+1,h.indexOf(k)+1).setValue(n));return {ok:true};}



function saveStockItem(x){access_(['Admin','Buyer']);const lock=LockService.getScriptLock();lock.waitLock(30000);try{const n=String(x&&x.name||'').trim().toLowerCase(),c=String(x&&x.category||'').trim().toLowerCase();if(x&&['Egypt','Dubai'].includes(x.market)&&rows_(x.market+'_Stock').some(r=>String(r.Product_Name||'').trim().toLowerCase()===n&&String(r.Category||'').trim().toLowerCase()===c&&String(r.Status||'')!=='Archived'))throw Error('This product already exists in '+x.market+' Stock. Add photos using Save Changes on the existing product.');if(!x||!['Egypt','Dubai'].includes(x.market))throw Error('Select market');const name=String(x.name||'').trim().slice(0,150),price=Number(x.price),moq=Number(x.moq||1),availability=String(x.availability||'In Stock'),visibility=String(x.visibility||'Show'),status=String(x.status||'Active');if(!name||!Number.isFinite(price)||price<0||!Number.isInteger(moq)||moq<1||!['In Stock','Out of Stock'].includes(availability)||!['Show','On Request'].includes(visibility)||!['Active','Draft','Archived'].includes(status))throw Error('Invalid stock details');const url=String(x.image||'').trim();if(url&&!/^https:\/\//i.test(url))throw Error('Image URL must use HTTPS');const id='VIO-STK-'+Utilities.getUuid().slice(0,10).toUpperCase();append_(x.market+'_Stock',{Stock_ID:id,Product_Name:name,Category:String(x.category||'').slice(0,80),Description:String(x.description||'').slice(0,500),Image_URL:url,Available_Qty:availability==='In Stock'?1:0,MOQ:moq,Status:status,Selling_Price:price,Price_Visibility:visibility,Availability:availability,Currency:x.market==='Egypt'?'EGP':'AED',Updated_At:new Date()});log_('STOCK_CREATED',id,x.market);return {ok:true,id};}finally{lock.releaseLock();}}



function updateStockItem(x){access_(['Admin','Buyer']);if(!x||!['Egypt','Dubai'].includes(x.market))throw Error('Invalid market');const allowed=['Product_Name','Category','Description','Image_URL','MOQ','Selling_Price','Price_Visibility','Availability','Status'];const changes={};for(const k of allowed)if(Object.prototype.hasOwnProperty.call(x,k))changes[k]=x[k];if(changes.Selling_Price!==undefined&&(!Number.isFinite(Number(changes.Selling_Price))||Number(changes.Selling_Price)<0))throw Error('Invalid selling price');if(changes.MOQ!==undefined&&(!Number.isInteger(Number(changes.MOQ))||Number(changes.MOQ)<1))throw Error('Invalid MOQ');if(changes.Availability!==undefined&&!['In Stock','Out of Stock'].includes(changes.Availability))throw Error('Invalid availability');if(changes.Price_Visibility!==undefined&&!['Show','On Request'].includes(changes.Price_Visibility))throw Error('Invalid price visibility');if(changes.Status!==undefined&&!['Active','Draft','Archived'].includes(changes.Status))throw Error('Invalid status');if(changes.Image_URL&&!/^https:\/\//i.test(changes.Image_URL))throw Error('Invalid image URL');if(changes.Availability)changes.Available_Qty=changes.Availability==='In Stock'?1:0;changes.Updated_At=new Date();return vioSetFields_(x.market+'_Stock','Stock_ID',x.id,changes);}











/** Phase 3.1: manage public stock gallery, retaining existing records and photo URLs. */



function vioStockMediaFolder_(){



 const props=PropertiesService.getScriptProperties();let id=props.getProperty('VIO_PUBLIC_STOCK_MEDIA_FOLDER');



 if(id){try{return DriveApp.getFolderById(id)}catch(e){console.warn('Stock folder inaccessible: '+e.message);props.deleteProperty('VIO_PUBLIC_STOCK_MEDIA_FOLDER');}}
 const f=DriveApp.createFolder('VIO - Public Stock Product Photos');



 props.setProperty('VIO_PUBLIC_STOCK_MEDIA_FOLDER',f.getId());return f;



}



function vioStockPhotoUrls_(market,id){



 const r=rows_(market+'_Stock').find(x=>String(x.Stock_ID)===String(id));



 if(!r)throw Error('Stock product not found');



 const urls=String(r.Media_URLs||'').split(/[\n,]/).map(x=>x.trim()).filter(x=>/^https:\/\//i.test(x));



 const primary=String(r.Image_URL||'').trim();



 if(primary&&/^https:\/\//i.test(primary)&&!urls.includes(primary))urls.unshift(primary);



 return urls;



}



function uploadStockPhotos(x){



 access_(['Admin','Buyer']);



 if(!x||!['Egypt','Dubai'].includes(x.market)||!x.id)throw Error('Invalid stock product');



 const photos=x.photos;if(!Array.isArray(photos)||!photos.length||photos.length>10)throw Error('Choose 1 to 10 photos');



 const current=vioStockPhotoUrls_(x.market,x.id);if(current.length+photos.length>10)throw Error('Maximum 10 photos per stock product. Remove old photos first.');



 const allowed={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};



 const prepared=photos.map((item,i)=>{



  const mime=String(item.mime||'').toLowerCase(),encoded=String(item.base64||'');



  if(!allowed[mime]||!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded))throw Error('Photo '+(i+1)+': JPG, PNG or WEBP only');



  const bytes=Utilities.base64Decode(encoded);



  if(!bytes.length||bytes.length>4*1024*1024)throw Error('Photo '+(i+1)+' exceeds 4 MB');



  const b=bytes.map(n=>(n+256)%256);



  const valid=mime==='image/jpeg'?b[0]===255&&b[1]===216&&b[2]===255:mime==='image/png'?b.slice(0,8).join(',')==='137,80,78,71,13,10,26,10':b.slice(0,4).map(n=>String.fromCharCode(n)).join('')==='RIFF'&&b.slice(8,12).map(n=>String.fromCharCode(n)).join('')==='WEBP';



  if(!valid)throw Error('Photo '+(i+1)+' is invalid');return {bytes,mime,ext:allowed[mime]};



 });



 const folder=vioStockMediaFolder_(),created=[];



 for(const item of prepared){



  const f=folder.createFile(Utilities.newBlob(item.bytes,item.mime,x.id+'-'+Utilities.getUuid().slice(0,8)+'.'+item.ext));



  f.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);



  created.push('https\\://drive.google.com/thumbnail?id='+encodeURIComponent(f.getId())+'&sz=w1200');



 }



 const urls=current.concat(created);



 const sheet=tab_(x.market+'_Stock');
 const headers=sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0].map(String);
 // Existing databases may predate the photo gallery. Add only missing photo columns.
 for(const field of ['Image_URL','Media_URLs']){
  if(!headers.includes(field)){sheet.getRange(1,sheet.getLastColumn()+1).setValue(field);headers.push(field);}
 }
 vioSetFields_(x.market+'_Stock','Stock_ID',x.id,{Image_URL:urls[0]||'',Media_URLs:urls.join('\n'),Updated_At:new Date()});
 SpreadsheetApp.flush();
 const saved=rows_(x.market+'_Stock').find(r=>String(r.Stock_ID)===String(x.id));
 const stored=String(saved&&saved.Media_URLs||'').split(/[\n,]/).map(s=>s.trim()).filter(Boolean);
 if(!saved||stored.length!==urls.length||created.some(u=>!stored.includes(u))||String(saved.Image_URL||'')!==urls[0])
  throw Error('Image files created, but stock photo links could not be verified in Google Sheets. Contact admin; do not upload again yet.');



 log_('STOCK_PHOTOS_ADDED',x.id,created.length+' photos');return {ok:true,count:created.length,urls,verified:true};



}



function removeStockPhoto(x){



 access_(['Admin','Buyer']);if(!x||!['Egypt','Dubai'].includes(x.market)||!x.id)throw Error('Invalid stock product');



 const urls=vioStockPhotoUrls_(x.market,x.id),url=String(x.url||'');



 if(!urls.includes(url))throw Error('Photo not found');



 const remaining=urls.filter(u=>u!==url);



 vioSetFields_(x.market+'_Stock','Stock_ID',x.id,{Image_URL:remaining[0]||'',Media_URLs:remaining.join('\n'),Updated_At:new Date()});



 // Unlink only: don't delete Drive files that may be referenced elsewhere.



 log_('STOCK_PHOTO_REMOVED',x.id,url.slice(0,150));return {ok:true,urls:remaining};



}





/** Operational update: change active shipping rates without editing Sheets. */

function vioUpdateShippingRate(x){access_(['Admin','Logistics']);vioFreightEnsure_();const old=rows_('Shipping_Rates').find(r=>String(r.Rate_ID)===String(x&&x.id));if(!old)throw Error('Shipping rate not found');if(String(old.Status)!=='Active')throw Error('Only active rates can be edited');const v=vioFreightValidate_({...x,origin:x.origin||old.Origin||'China',destination:x.destination||old.Destination,mode:x.mode||old.Shipping_Mode,goods:x.goods||old.Goods_Type,minDays:x.minDays===undefined?old.Transit_Min_Days:x.minDays,maxDays:x.maxDays===undefined?old.Transit_Max_Days:x.maxDays});const lock=LockService.getScriptLock();lock.waitLock(30000);try{if(String(x.status)==='Inactive'){vioSetFields_('Shipping_Rates','Rate_ID',old.Rate_ID,{Status:'Inactive',Last_Updated:new Date()});log_('FREIGHT_RATE_INACTIVE',old.Rate_ID,'');return {ok:true};}vioFreightDeactivate_(v,old.Rate_ID);const id='RATE-'+Utilities.getUuid().slice(0,8);append_('Shipping_Rates',{Rate_ID:id,Origin:v.origin,Destination:v.destination,Shipping_Mode:v.mode,Goods_Type:v.goods,Rate_USD:v.rate,Unit:v.mode==='Sea Freight'?'CBM':'KG',Transit_Min_Days:v.minDays,Transit_Max_Days:v.maxDays,Effective_Date:new Date(),Status:'Active',Last_Updated:new Date()});log_('FREIGHT_RATE_REVISED',id,'Previous '+old.Rate_ID);return {ok:true,id};}finally{lock.releaseLock();}}

function vioSetPermissionNotifications(x){access_(['Admin']);const email=String(x.email||'').trim().toLowerCase();if(!email)throw Error('Missing email');const p=rows_('Permissions').find(r=>String(r.Email).trim().toLowerCase()===email);if(!p)throw Error('User not found');vioSetFields_('Permissions','Email',p.Email,{Receive_Notifications:x.enabled?'Yes':'No'});log_('PERMISSION_NOTIFICATION',email,x.enabled?'Yes':'No');return {ok:true};}

function vioGetStockMarket(market){access_(['Admin','Buyer','Viewer']);if(!['Egypt','Dubai'].includes(market))throw Error('Invalid market');return rows_(market+'_Stock').filter(r=>r.Stock_ID);}





/** VIO operational workflow v2 — additive setup, no existing rows deleted. */

function setupVIOOperations(){access_(['Admin']);const ss=db_();setupVIOPhase3();

 ensure_(ss,'Sales_Orders',['Order_ID','Quotation_ID','RFQ_ID','Customer_Name','Customer_Email','Product_Name','Quantity','Currency','Unit_Price','Order_Total','Status','Payment_Status','Amount_Paid','Shipment_Status','Tracking_Number','ETA','Created_At','Updated_At','Updated_By','Notes']);

 ensure_(ss,'Order_Events',['Event_ID','Order_ID','Created_At','Event_Type','Details','Created_By']);

 ensure_(ss,'Customer_Quotations',['Revision','Customer_Decision','Customer_Decision_At','Product_Image_URL','PDF_File_ID','Sent_Language']);

 return {ok:true,message:'Operational tables created. Existing data preserved.'};}

function vioOpsData(){const a=access_();const canSee=['Admin','Buyer'].includes(a.role);return {rfqs:canSee?rows_('Price_Inquiries').filter(r=>r.RFQ_ID).map(r=>({RFQ_ID:r.RFQ_ID,Customer_Name:r.Customer_Name,Product_Name:r.Product_Name,Requested_Qty:r.Requested_Qty,Destination_Country:r.Destination_Country,Shipping_Mode:r.Shipping_Mode,Status:r.Status,Quotation_Status:r.Quotation_Status,Created_At:r.Created_At,Phone:r.Phone,Email:r.Email,Product_Source:r.Product_Source,Product_ID:r.Product_ID,Photo_File_IDs:r.Photo_File_IDs,Photo_Count:r.Photo_Count,Assigned_To:r.Assigned_To,Category:r.Category||'',Priority:r.Priority||'Normal',Company_Name:r.Company_Name,Product_Image_URL:vioRFQCatalogImage_(r)})):[],quotes:canSee?rows_('Customer_Quotations').filter(r=>r.Quotation_ID):[],orders:canSee?rows_('Sales_Orders').filter(r=>r.Order_ID):[],counts:{products:rows_('China_Products').filter(r=>String(r.Status).toLowerCase()==='active').length,egypt:rows_('Egypt_Stock').filter(r=>String(r.Status).toLowerCase()==='active').length,dubai:rows_('Dubai_Stock').filter(r=>String(r.Status).toLowerCase()==='active').length}};}

function vioGetCustomerQuote_(id){const q=rows_('Customer_Quotations').find(r=>String(r.Quotation_ID)===String(id));if(!q)throw Error('Quotation not found');return q;}

/** Customer-only bilingual commercial PDF. No supplier pricing or margin fields. */
function vioQuoteHtml_(q, language){
 const ar=String(language||'en').toLowerCase()==='ar';
 const e=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
 const T=(en,arabic)=>ar?arabic:en;
 const money=v=>Number(v||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
 const qty=Number(q.Quantity||0),total=Number(q.Selling_Total||0),unit=Number(q.Selling_Unit||0);
 const effectiveUnit=qty>0?total/qty:unit;
 const unitDigits=qty>0&&Math.abs(effectiveUnit-Number(effectiveUnit.toFixed(2)))>.0000001?Math.min(8,Math.max(2,String((Math.round(effectiveUnit*100000000)/100000000).toFixed(8)).replace(/0+$/,'').split('.')[1].length)):2;
 const unitText=effectiveUnit.toLocaleString('en-US',{minimumFractionDigits:unitDigits,maximumFractionDigits:unitDigits});
 const rfq=rows_('Price_Inquiries').find(r=>String(r.RFQ_ID)===String(q.RFQ_ID));
 const sq=rows_('Supplier_Quotations').find(r=>String(r.Supplier_Quote_ID)===String(q.Supplier_Quote_ID));
 const product=rfq&&rfq.Product_ID?rows_('China_Products').find(r=>String(r.Product_ID)===String(rfq.Product_ID)):null;
 // Quote-specific photo first, RFQ customer photo second; supplier media is deliberately excluded.
 let imageRef=String(q.Product_Image_URL||'').trim();
 if(!imageRef&&rfq){const ids=String(rfq.Photo_File_IDs||'').split(',').map(s=>s.trim()).filter(Boolean);if(ids.length)imageRef='vio-private-file:'+ids[0];else imageRef=String(rfq.Product_Image_URL||'').trim();}
 if(!imageRef&&product)imageRef=String(product.Image_URL||'').trim();
 let imageHtml='';
 try{
  if(imageRef.indexOf('vio-private-file:')===0){const f=DriveApp.getFileById(imageRef.slice(17)),blob=f.getBlob(),type=blob.getContentType();if(f.getSize()<=4000000&&/^image\/(png|jpeg|webp)$/.test(type))imageHtml='<img alt="Product" src="data:'+e(type)+';base64,'+Utilities.base64Encode(blob.getBytes())+'"/>';}
  else if(/^https:\/\//i.test(imageRef))imageHtml='<img alt="Product" src="'+e(imageRef)+'"/>';
 }catch(err){/* Do not expose private Drive file identifiers in customer PDF. */}
 const terms=String(q.Commercial_Terms||'').trim();
 const created=q.Created_At||q.Quotation_Date||q.Issued_At||'';
 let issue='';try{if(created)issue=Utilities.formatDate(new Date(created),Session.getScriptTimeZone()||'Africa/Cairo','yyyy-MM-dd');}catch(err){}
 const validity=Math.max(0,Number(q.Validity_Days)||0);
 const row=(name,value)=>'<tr><td>'+name+'</td><td>'+value+'</td></tr>';
 const waQr='iVBORw0KGgoAAAANSUhEUgAAAFEAAABRAQAAAACC9HebAAABIklEQVR4nI1TO07DQBB9440UNygcYCP7CnRGQrK73IMTEGho8OcCtrkA90gHEhJ0OQGSF69EQUNS7Upxhgrlo+yKqZ6enmbezL4lxl9VAXZ1gBWRmoe6ohGcGsFGPhpMuHNrUGX6gWKmY/4QR3dv3Sl+Hw/laX6Hi+evcyuJPZqBQpzd6xXFTg2YeVMYZubS2Ue3Nl5l8dpqz6z5rHsC2qV7VhCVVty+q9r6blg0020qr8fS47kG/yRywr3TMzYYR2yiioVnr/xCUYj8xeMnEo2oU13N3H4CNVzafvFRJv47d2T6ber2HCgicIj2mN/Hgk3UMG58GlTZ8GmnAa68GQMgc+vPoebwdb10vzt6NlymHVJ3fkYDoafFd5O4+9A//ukvg+p58UBkZGgAAAAASUVORK5CYII=';
 return '<!DOCTYPE html><html lang="'+(ar?'ar':'en')+'" dir="'+(ar?'rtl':'ltr')+'"><head><meta charset="UTF-8"><style>'+
  '@page{size:A4;margin:9mm 11mm}html,body{margin:0;padding:0}body{font-family:Arial,Tahoma,sans-serif;color:#243047;font-size:10px;line-height:1.25;direction:'+(ar?'rtl':'ltr')+'}.brand{color:#c6a052;font-size:27px;font-weight:800;letter-spacing:2px}.sub{font-size:9px;color:#526174}.line{border-bottom:2px solid #c6a052;margin:6px 0 10px}h1{font-size:16px;color:#243047;margin:7px 0}h2{font-size:12px;color:#b28a3b;margin:10px 0 4px}p{line-height:1.35;margin:5px 0}table{border-collapse:collapse;width:100%;margin-top:6px;page-break-inside:avoid}tr{page-break-inside:avoid}td{border-bottom:1px solid #e5e7eb;padding:5px 7px;text-align:'+(ar?'right':'left')+'}td:first-child{color:#526174;width:44%}.total{background:#faf6ea;font-weight:bold}.photo{text-align:center;margin:5px 0}.photo img{max-width:200px;max-height:105px;object-fit:contain}.contact{background:#f8fafc;border:1px solid #e7e9ed;padding:7px;font-size:9px;line-height:1.45}.qr{width:65px;height:65px}.note{color:#687385;font-size:8px;margin-top:7px}.ltr{direction:ltr;unicode-bidi:embed;display:inline-block}.footer{margin-top:8px;border-top:1px solid #c6a052;padding-top:6px;font-size:9px}.contactblock{page-break-inside:avoid;break-inside:avoid}.contactblock h2{margin:6px 0 3px}.contactblock table{margin-top:3px}.terms{line-height:1.3}'+
  '</style></head><body>'+
 '<div class="brand">VIO <span style="font-size:17px;color:#27364a">TRADING</span></div><div class="sub">GLOBAL SOURCING &amp; WHOLESALE · YOUR BEST CHOICE</div><div class="line"></div>'+
 '<h1>'+T('Commercial Quotation','عرض سعر تجاري')+'</h1><p>'+T('Quotation No.','رقم عرض السعر')+': <b class="ltr">'+e(q.Quotation_ID)+'</b> &nbsp; '+T('Issue date','تاريخ الإصدار')+': <span class="ltr">'+e(issue||'—')+'</span></p>'+
 '<p>'+T('Prepared for','مقدم إلى')+': <b>'+e(q.Customer_Name||T('Customer','العميل'))+'</b></p>'+
 (imageHtml?'<div class="photo">'+imageHtml+'</div>':'')+
 '<h2>'+e(q.Product_Name||T('Product','المنتج'))+'</h2><table>'+
 row(T('Destination','وجهة التسليم'),e(q.Destination||'—'))+
 row(T('Quantity','الكمية'),'<span class="ltr">'+e(q.Quantity)+' PCS</span>')+
 row(T('Minimum order quantity','الحد الأدنى للطلب'),'<span class="ltr">'+e(q.MOQ||'—')+' PCS</span>')+
 row(T('Unit price (indicative)','سعر الوحدة (للعرض)'),'<span class="ltr">'+e(q.Currency||'AED')+' '+unitText+'</span>')+
 '<tr class="total"><td>'+T('Total quotation','إجمالي عرض السعر')+'</td><td><span class="ltr">'+e(q.Currency||'AED')+' '+money(total)+'</span></td></tr>'+
 row(T('Estimated lead time','مدة التوريد المتوقعة'),e(q.Total_Lead_Days||'—')+' '+T('days','يومًا'))+
 row(T('Quotation validity','صلاحية العرض'),validity?validity+' '+T('days from issue','يومًا من تاريخ الإصدار'):T('To be confirmed','تحدد لاحقًا'))+
 '</table><h2>'+T('Commercial terms','الشروط التجارية')+'</h2><p class="terms">'+e(terms||T('Payment and delivery terms to be confirmed in writing before order placement.','يتم تأكيد شروط الدفع والتسليم كتابيًا قبل إصدار الطلب.'))+'</p>'+
 '<p class="note">'+T('Unit price is displayed for reference; the approved quotation total is authoritative. Lead times are estimates and subject to written confirmation.','سعر الوحدة معروض للاستدلال؛ ويُعتد بالإجمالي المعتمد لعرض السعر. مدد التوريد تقديرية وتخضع للتأكيد الكتابي.')+'</p>'+
 '<div class="contactblock"><h2>'+T('Contact VIO Trading','التواصل مع VIO Trading')+'</h2><table><tr><td class="contact">'+T('29 Al Nasr Street, New Maadi, Cairo, Egypt','٢٩ شارع النصر، المعادي الجديدة، القاهرة، مصر')+'<br><span class="ltr">+20 107 000 0604</span><br><span class="ltr">Vioglobal1@gmail.com</span><br>'+T('Scan to contact us on WhatsApp','امسح الرمز للتواصل معنا عبر واتساب')+'</td><td style="text-align:center"><img class="qr" src="data:image/png;base64,'+waQr+'"/></td></tr></table></div>'+ 
 '<div class="footer">VIO Trading · '+T('Global Sourcing & Wholesale','التوريد العالمي وتجارة الجملة')+' · '+T('Your Best Choice','خيارك الأفضل')+'</div></body></html>';
}
function vioQuotationPdf(request){
 access_(['Admin','Buyer']);
 const id=typeof request==='string'?request:String(request&&request.id||'');
 const lang=typeof request==='string'?'en':String(request&&request.language||'en').toLowerCase();
 if(!['en','ar'].includes(lang))throw Error('Unsupported quotation language');
 const q=vioGetCustomerQuote_(id);
 if(!['Approved','Sent','Accepted'].includes(String(q.Approval_Status)))throw Error('Approve quotation before generating customer PDF');
 const filename='VIO-Trading-Quotation-'+id+'-'+lang.toUpperCase()+'.pdf';
 const blob=HtmlService.createHtmlOutput(vioQuoteHtml_(q,lang)).getBlob().getAs('application/pdf').setName(filename);
 const props=PropertiesService.getScriptProperties();let fid=props.getProperty('VIO_QUOTE_PDF_FOLDER');const folder=fid?DriveApp.getFolderById(fid):DriveApp.createFolder('VIO - Customer Quotations');if(!fid)props.setProperty('VIO_QUOTE_PDF_FOLDER',folder.getId());
 const f=folder.createFile(blob);
 // Preserve historical default English PDF attachment reference; Arabic must not overwrite it.
 if(lang==='en')vioSetFields_('Customer_Quotations','Quotation_ID',id,{PDF_File_ID:f.getId()});
 log_('QUOTE_PDF_CREATED',id,lang+' '+f.getId());
 return {ok:true,filename:filename,language:lang,base64:Utilities.base64Encode(blob.getBytes())};
}

function vioRecordCustomerDecision(x){access_(['Admin','Buyer']);const id=String(x&&x.id||''),decision=String(x&&x.decision||'');if(!['Accepted','Rejected','Revision Requested'].includes(decision))throw Error('Invalid customer decision');const q=vioGetCustomerQuote_(id);if(!['Approved','Sent','Accepted'].includes(String(q.Approval_Status)))throw Error('Quotation must be approved first');if(String(q.Customer_Decision)==='Accepted'&&decision!=='Accepted')throw Error('Accepted quotation is locked; create a new revision');vioSetFields_('Customer_Quotations','Quotation_ID',id,{Customer_Decision:decision,Customer_Decision_At:new Date(),Approval_Status:decision==='Accepted'?'Accepted':decision==='Rejected'?'Customer Rejected':decision==='Revision Requested'?'Revision Requested':q.Approval_Status});log_('CUSTOMER_DECISION',id,decision);return {ok:true};}

function vioConvertQuoteToOrder(id){const a=access_(['Admin','Buyer']);const q=vioGetCustomerQuote_(id);if(String(q.Customer_Decision)!=='Accepted')throw Error('Record customer acceptance before converting');const existing=rows_('Sales_Orders').find(r=>String(r.Quotation_ID)===String(id));if(existing)return {ok:true,id:existing.Order_ID,alreadyExists:true};const oid='VIO-SO-'+Utilities.getUuid().slice(0,9).toUpperCase();append_('Sales_Orders',{Order_ID:oid,Quotation_ID:id,RFQ_ID:q.RFQ_ID,Customer_Name:q.Customer_Name,Customer_Email:q.Customer_Email,Product_Name:q.Product_Name,Quantity:q.Quantity,Currency:q.Currency,Unit_Price:q.Selling_Unit,Order_Total:q.Selling_Total,Status:'Confirmed',Payment_Status:'Unpaid',Amount_Paid:0,Shipment_Status:'Not Shipped',Tracking_Number:'',ETA:'',Created_At:new Date(),Updated_At:new Date(),Updated_By:a.email});append_('Order_Events',{Event_ID:Utilities.getUuid(),Order_ID:oid,Created_At:new Date(),Event_Type:'ORDER_CREATED',Details:'Converted from '+id,Created_By:a.email});log_('SALES_ORDER_CREATED',oid,id);return {ok:true,id:oid};}

function vioUpdateOrder(x){const a=access_(['Admin','Buyer']);if(!x||!x.id)throw Error('Select an order');const current=rows_('Sales_Orders').find(r=>String(r.Order_ID)===String(x.id));if(!current)throw Error('Order not found');const status=String(x.status),payment=String(x.paymentStatus),shipping=String(x.shipmentStatus),paid=Number(x.amountPaid);if(!['Confirmed','In Production','Ready to Ship','In Transit','Delivered','Closed','Cancelled'].includes(status)||!['Unpaid','Partially Paid','Paid'].includes(payment)||!['Not Shipped','Booked','In Transit','Delivered'].includes(shipping)||!Number.isFinite(paid)||paid<0||paid>Number(current.Order_Total)+0.01)throw Error('Check status and payment amount');const expectedPayment=paid<=0?'Unpaid':paid>=Number(current.Order_Total)-0.01?'Paid':'Partially Paid';if(payment!==expectedPayment)throw Error('Payment status must match amount paid: '+expectedPayment);if(shipping==='Delivered'&&!['Delivered','Closed'].includes(status))throw Error('Delivered shipment requires Delivered or Closed order stage');const changes={Status:status,Payment_Status:payment,Shipment_Status:shipping,Amount_Paid:paid,Tracking_Number:String(x.tracking||'').slice(0,120),ETA:String(x.eta||''),Notes:String(x.notes||'').slice(0,1000),Updated_At:new Date(),Updated_By:a.email};vioSetFields_('Sales_Orders','Order_ID',x.id,changes);append_('Order_Events',{Event_ID:Utilities.getUuid(),Order_ID:x.id,Created_At:new Date(),Event_Type:'ORDER_UPDATED',Details:JSON.stringify(changes).slice(0,1200),Created_By:a.email});log_('ORDER_UPDATED',x.id,status);return {ok:true};}

/** VIO Stage 1A: additive customer conversations and negotiation. Run setupVIOStage1A once. */
function setupVIOStage1A(){
 access_(['Admin']); const ss=db_();
 ensure_(ss,'VIO_Messages',['Message_ID','RFQ_ID','Customer_Email','Sender_Type','Sender','Message','Created_At','Read_By_Admin','Read_By_Customer']);
 ensure_(ss,'VIO_Negotiations',['Negotiation_ID','RFQ_ID','Quotation_ID','Customer_Email','Requested_Total','Requested_Quantity','Requested_Terms','Customer_Message','Status','Created_At','Resolved_At','Resolved_By']);
 ensure_(ss,'Customer_Auth',['Email','Code_Hash','Code_Expires','Code_Attempts','Last_Code_Sent','Session_Hash','Session_Expires']);
 ensure_(ss,'Customer_Quotations',['Revision','Parent_Quotation_ID','Customer_Decision','Customer_Decision_At']);
 return {ok:true,message:'Stage 1A tables prepared without deleting data.'};
}
function vioStageEmail_(v){return String(v||'').trim().toLowerCase();}
function vioStageRfqs_(){return rows_('Price_Inquiries').filter(r=>r.RFQ_ID);}
function vioStageAdminRfq_(id){const r=vioStageRfqs_().find(r=>String(r.RFQ_ID)===String(id));if(!r)throw Error('RFQ not found');return r;}
function vioStageInbox(id){access_(['Admin','Buyer']);vioStageAdminRfq_(id);return {supplierOffers:rows_('Supplier_Quotations').filter(z=>String(z.RFQ_ID)===String(id)).map(z=>({id:z.Supplier_Quote_ID,supplier:z.Supplier_Name,cost:z.Unit_Price,currency:z.Supplier_Currency,moq:z.MOQ,landed:z.Landed_Unit_Local,selling:z.Suggested_Unit_Local,freight:z.Freight_USD,lead:z.Production_Days,status:z.Approval_Status,createdAt:z.Created_At})),messages:rows_('VIO_Messages').filter(r=>String(r.RFQ_ID)===String(id)).map(r=>({id:r.Message_ID,senderType:r.Sender_Type,sender:r.Sender,message:r.Message,createdAt:r.Created_At})),negotiations:rows_('VIO_Negotiations').filter(r=>String(r.RFQ_ID)===String(id)),quotes:rows_('Customer_Quotations').filter(r=>String(r.RFQ_ID)===String(id)).map(q=>({id:q.Quotation_ID,revision:q.Revision||1,status:q.Approval_Status,decision:q.Customer_Decision,total:q.Selling_Total,currency:q.Currency,quantity:q.Quantity,product:q.Product_Name}))};}
function vioStageSendAdminMessage(x){const a=access_(['Admin','Buyer']);const rfq=vioStageAdminRfq_(x&&x.rfqId);const message=String(x&&x.message||'').trim();if(!message||message.length>3000)throw Error('Enter a message up to 3,000 characters');append_('VIO_Messages',{Message_ID:'MSG-'+Utilities.getUuid(),RFQ_ID:rfq.RFQ_ID,Customer_Email:vioStageEmail_(rfq.Email),Sender_Type:'VIO',Sender:a.email,Message:message,Created_At:new Date(),Read_By_Admin:'Yes',Read_By_Customer:'No'});log_('CUSTOMER_MESSAGE',rfq.RFQ_ID,'Reply from '+a.email);return {ok:true};}
function vioStageResolveNegotiation(x){const a=access_(['Admin','Buyer']);const id=String(x&&x.id||'');const status=String(x&&x.status||'');if(!['Under Review','Revised Quote Prepared','Closed'].includes(status))throw Error('Invalid status');const n=rows_('VIO_Negotiations').find(r=>String(r.Negotiation_ID)===id);if(!n)throw Error('Negotiation not found');vioSetFields_('VIO_Negotiations','Negotiation_ID',id,{Status:status,Resolved_At:new Date(),Resolved_By:a.email});log_('NEGOTIATION_STATUS',n.RFQ_ID,status);return {ok:true};}
function vioStageCloneQuote(x){const a=access_(['Admin','Buyer']);const old=vioGetCustomerQuote_(String(x&&x.id||''));if(!['Approved','Sent','Accepted'].includes(String(old.Approval_Status)))throw Error('Only approved quotation versions can be revised');if(String(old.Customer_Decision)==='Accepted')throw Error('Accepted quote cannot be revised');const qty=Number(x.quantity),unit=Number(x.unitPrice);if(!Number.isSafeInteger(qty)||qty<1||!Number.isFinite(unit)||unit<=0)throw Error('Enter a valid quantity and unit selling price');const previous=rows_('Customer_Quotations').filter(q=>String(q.RFQ_ID)===String(old.RFQ_ID));const revision=previous.reduce((m,q)=>Math.max(m,Number(q.Revision)||1),1)+1;const id='VIO-QT-'+Utilities.getUuid().slice(0,9).toUpperCase();if(qty!==Number(old.Quantity))throw Error('Changing quantity requires a new supplier costing calculation. Open Supplier Costing to create a new quote.');const supplier=rows_('Supplier_Quotations').find(z=>String(z.Supplier_Quote_ID)===String(old.Supplier_Quote_ID));const landed=Number(supplier&&supplier.Landed_Unit_Local);if(!Number.isFinite(landed)||landed<=0)throw Error('Landed cost snapshot missing. Recalculate using Supplier Costing before revising.');const margin=(unit-landed)/unit*100;if(margin<0)throw Error('Selling price is below landed cost; management review required through supplier costing');const copy={...old,Quotation_ID:id,Parent_Quotation_ID:old.Quotation_ID,Revision:revision,Quantity:qty,Selling_Unit:unit,Selling_Total:Math.round(qty*unit*100)/100,Margin_Percent:margin,Landed_Unit_Local:landed,Approval_Status:'Pending Approval',Approved_By:'',Approved_At:'',Sent_At:'',Customer_Decision:'',Customer_Decision_At:'',PDF_File_ID:'',Created_At:new Date(),Created_By:a.email};delete copy.__row;append_('Customer_Quotations',copy);vioSetFields_('Price_Inquiries','RFQ_ID',old.RFQ_ID,{Quotation_Status:'Pending Approval'});log_('QUOTE_REVISION_CREATED',id,'Parent '+old.Quotation_ID+' V'+revision);return {ok:true,id,revision,margin};}

/** Stage 1B additive schema, safe to rerun. */
function setupVIOStage1B(){access_(['Admin']);setupVIOStage1A();ensure_(db_(),'Supplier_Quotations',['Measurement_Mode']);return {ok:true,message:'Stage 1B ready; existing data preserved'};}

/* RFQ Management: product reference photos remain private to authorized staff. */
function vioRFQCatalogImage_(r){if(!r.Product_ID)return '';const id=String(r.Product_ID);const sources=id.indexOf('VIO-STK-')===0?['Egypt_Stock','Dubai_Stock']:['China_Products'];for(const source of sources){const item=rows_(source).find(p=>String(p.Product_ID||p.Stock_ID)===id);if(item&&/^https:\/\//i.test(String(item.Image_URL||'')))return String(item.Image_URL)}return ''}
function vioRFQPhotoPreview(x){access_(['Admin','Buyer']);const id=String(x&&x.rfqId||'');const row=rows_('Price_Inquiries').find(r=>String(r.RFQ_ID)===id);if(!row)throw Error('Request not found');const ids=String(row.Photo_File_IDs||'').split(',').map(s=>s.trim()).filter(Boolean);const i=Number(x&&x.index);if(!Number.isSafeInteger(i)||i<0||i>=ids.length)throw Error('Photo not found');const file=DriveApp.getFileById(ids[i]);const mime=String(file.getMimeType());if(!/^image\/(jpeg|png|webp|gif)$/.test(mime))throw Error('Unsupported image format');if(file.getSize()>8*1024*1024)throw Error('Image is too large to preview. Open it in Drive instead.');return {dataUrl:'data:'+mime+';base64,'+Utilities.base64Encode(file.getBlob().getBytes()),index:i,count:ids.length};}

/** Private small preview for the admin RFQ list. The full-resolution viewer remains separate. */
function vioRFQPhotoThumbnail(x){
  access_(['Admin','Buyer']);
  const id=String(x&&x.rfqId||'');
  const row=rows_('Price_Inquiries').find(r=>String(r.RFQ_ID)===id);
  if(!row)throw Error('Request not found');
  const ids=String(row.Photo_File_IDs||'').split(',').map(v=>v.trim()).filter(Boolean);
  const index=Number(x&&x.index||0);
  if(!Number.isSafeInteger(index)||index<0||index>=ids.length)throw Error('Photo not found');
  const file=DriveApp.getFileById(ids[index]);
  let blob=file.getThumbnail();
  if(!blob){
    if(file.getSize()>300*1024)throw Error('Drive has not generated a thumbnail for this image yet');
    blob=file.getBlob();
  }
  const mime=String(blob.getContentType());
  if(!/^image\/(jpeg|png|webp|gif)$/.test(mime))throw Error('Unsupported thumbnail format');
  if(blob.getBytes().length>500*1024)throw Error('Thumbnail exceeds safe size');
  return {dataUrl:'data:'+mime+';base64,'+Utilities.base64Encode(blob.getBytes())};
}


/** Upload a real quotation photo to the approved internal quote record. */
function vioUploadQuotePhoto(x){
 access_(['Admin','Buyer']);
 const id=String(x&&x.quoteId||''), q=vioGetCustomerQuote_(id);
 if(!['Pending Approval','Changes Requested'].includes(String(q.Approval_Status)))throw Error('Photo changes require a new quotation revision after approval.');
 const p=x&&x.photo||{},mime=String(p.mime||'').toLowerCase(),enc=String(p.base64||'');
 const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[mime];
 if(!ext||!/^[A-Za-z0-9+/]+={0,2}$/.test(enc))throw Error('Use a JPG, PNG or WEBP photo.');
 const bytes=Utilities.base64Decode(enc);if(!bytes.length||bytes.length>4*1024*1024)throw Error('Photo must be 4 MB or less.');
 const b=bytes.map(v=>(v+256)%256);
 const valid=mime==='image/jpeg'?b[0]===255&&b[1]===216&&b[2]===255:mime==='image/png'?b.slice(0,8).join(',')==='137,80,78,71,13,10,26,10':b.slice(0,4).map(v=>String.fromCharCode(v)).join('')==='RIFF'&&b.slice(8,12).map(v=>String.fromCharCode(v)).join('')==='WEBP';
 if(!valid)throw Error('Invalid photo content.');
 const props=PropertiesService.getScriptProperties(),key='VIO_QUOTE_PHOTO_FOLDER';
 let fid=props.getProperty(key),folder=fid?DriveApp.getFolderById(fid):DriveApp.createFolder('VIO - Private Quotation Photos');
 if(!fid)props.setProperty(key,folder.getId());
 const file=folder.createFile(Utilities.newBlob(bytes,mime,id+'-product.'+ext));
 // Keep private; never expose a supplier document link.
 vioSetFields_('Customer_Quotations','Quotation_ID',id,{Product_Image_URL:'vio-private-file:'+file.getId()});
 log_('QUOTE_PRODUCT_PHOTO',id,file.getId());return {ok:true};
}


/** Freight route migration. Additive: preserves all historical rate rows. */
function vioFreightCountries_(){return ['China','UAE','Saudi Arabia','Kuwait','Oman','Qatar','Bahrain','Iraq','Egypt'];}
function vioDestinationCurrency_(country){const c={'China':'CNY','UAE':'AED','Saudi Arabia':'SAR','Kuwait':'KWD','Oman':'OMR','Qatar':'QAR','Bahrain':'BHD','Iraq':'IQD','Egypt':'EGP'};if(c[country])return c[country];const configured=rows_('VIO_Countries').find(r=>r.Country===country&&r.Status==='Active');if(configured&&/^[A-Z]{3}$/.test(String(configured.Currency)))return configured.Currency;throw Error('Destination currency not configured for '+country);}
function vioFreightEnsure_(){const ss=db_();ensure_(ss,'Shipping_Rates',['Origin','Transit_Min_Days','Transit_Max_Days']);ensure_(ss,'VIO_Countries',['Country','Currency','Status']);const sh=ss.getSheetByName('Shipping_Rates'),data=sh.getDataRange().getValues(),h=data[0],oi=h.indexOf('Origin');if(oi>=0&&data.length>1){const range=sh.getRange(2,oi+1,data.length-1,1),values=range.getValues();let dirty=false;values.forEach(r=>{if(!String(r[0]||'').trim()){r[0]='China';dirty=true;}});if(dirty)range.setValues(values);}const existing=rows_('VIO_Countries');vioFreightCountries_().forEach(country=>{if(!existing.some(r=>r.Country===country))append_('VIO_Countries',{Country:country,Currency:vioDestinationCurrency_(country),Status:'Active'});});return {ok:true};}
function setupVIOFreightRoutes(){access_(['Admin']);return vioFreightEnsure_();}
function vioFreightCountryList(){access_(['Admin','Logistics','Buyer']);vioFreightEnsure_();return rows_('VIO_Countries').filter(r=>r.Country&&String(r.Status)==='Active').map(r=>({name:r.Country,currency:r.Currency}));}
function vioFreightAddCountry(x){access_(['Admin']);vioFreightEnsure_();const name=String(x&&x.name||'').trim(),currency=String(x&&x.currency||'').trim().toUpperCase();if(!/^[a-zA-Z][a-zA-Z .'-]{1,65}$/.test(name)||!/^[A-Z]{3}$/.test(currency))throw Error('Enter country name and three-letter ISO currency');if(rows_('VIO_Countries').some(r=>String(r.Country).toLowerCase()===name.toLowerCase()))throw Error('Country already exists');append_('VIO_Countries',{Country:name,Currency:currency,Status:'Active'});log_('COUNTRY_ADDED',name,currency);return {ok:true};}
function vioFreightValidate_(x){const countryRows=rows_('VIO_Countries').filter(r=>r.Country&&String(r.Status)==='Active');const origin=String(x.origin||'China'),destination=String(x.destination||''),mode=String(x.mode||''),goods=String(x.goods||''),rate=Number(x.rate),minDays=Number(x.minDays),maxDays=Number(x.maxDays);if(!countryRows.some(r=>r.Country===origin)||!countryRows.some(r=>r.Country===destination)||origin===destination)throw Error('Select two different configured countries');if(!['Sea Freight','Air Freight'].includes(mode)||!['Normal','Dangerous Goods'].includes(goods)||!Number.isFinite(rate)||rate<=0)throw Error('Check shipping mode, goods type and USD rate');if(!Number.isSafeInteger(minDays)||!Number.isSafeInteger(maxDays)||minDays<1||maxDays<minDays||maxDays>365)throw Error('Enter transit minimum and maximum days (1–365), maximum must be ≥ minimum');return {origin,destination,mode,goods,rate,minDays,maxDays};}
function vioFreightDeactivate_(v,excludeId){rows_('Shipping_Rates').filter(r=>String(r.Rate_ID)!==String(excludeId||'')&&String(r.Origin||'China')===v.origin&&String(r.Destination)===v.destination&&String(r.Shipping_Mode)===v.mode&&String(r.Goods_Type)===v.goods&&String(r.Status)==='Active').forEach(r=>vioSetFields_('Shipping_Rates','Rate_ID',r.Rate_ID,{Status:'Inactive',Last_Updated:new Date()}));if(excludeId)vioSetFields_('Shipping_Rates','Rate_ID',excludeId,{Status:'Inactive',Last_Updated:new Date()});}


/** Translate public interface labels; never pass customer, supplier, or quotation data. */
function vioTranslateInterface(phrases) {
  access_();
  if (!Array.isArray(phrases) || phrases.length > 60) throw Error('Invalid translation batch');
  const cache = CacheService.getScriptCache();
  const result = {};
  phrases.forEach(function(raw) {
    const text = String(raw || '').trim();
    if (text.length < 2 || text.length > 170 || !/[a-z]/i.test(text) ||
        /https?:|@|VIO-RFQ-|VIO-Q-|\d{4,}/i.test(text)) return;
    const key = 'vio_ar_' + Utilities.base64EncodeWebSafe(
      Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text)).slice(0, 42);
    let translated = cache.get(key);
    if (!translated) {
      translated = LanguageApp.translate(text, 'en', 'ar');
      if (translated) cache.put(key, translated, 21600);
    }
    if (translated) result[text] = translated;
  });
  return result;
}


/** Management approval upgrade: private images, audit decisions, immutable revisions. */
function vioApprovalSetup(){access_(['Admin']);ensure_(db_(),'Customer_Quotations',['Approval_Notes','Decision_By','Decision_At','Revision_Reason','Parent_Quotation_ID','Product_Image_URL']);return {ok:true};}
function vioApprovalDecision(x){const a=access_(['Admin']);const id=String(x&&x.id||''),decision=String(x&&x.decision||''),reason=String(x&&x.reason||'').trim();if(!['Approve','Request Changes','Reject'].includes(decision))throw Error('Invalid management decision');const q=vioGetCustomerQuote_(id);if(String(q.Approval_Status)!=='Pending Approval')throw Error('Only pending quotations can be reviewed');if(decision!=='Approve'&&reason.length<5)throw Error('Enter a reason of at least 5 characters');const status={Approve:'Approved','Request Changes':'Changes Requested',Reject:'Rejected'}[decision];const fields={Approval_Status:status,Approval_Notes:reason,Decision_By:a.email,Decision_At:new Date()};if(decision==='Approve'){const cost=Number(q.Landed_Unit_Local||((rows_('Supplier_Quotations').find(z=>String(z.Supplier_Quote_ID)===String(q.Supplier_Quote_ID))||{}).Landed_Unit_Local));if(!(cost>0)||!(Number(q.Selling_Unit)>0))throw Error('Cannot approve: landed cost or selling price is missing. Recalculate supplier costing.');fields.Approved_By=a.email;fields.Approved_At=new Date();}vioSetFields_('Customer_Quotations','Quotation_ID',id,fields);vioSetFields_('Price_Inquiries','RFQ_ID',q.RFQ_ID,{Quotation_Status:status});log_('MANAGEMENT_QUOTE_'+decision.toUpperCase().replace(/ /g,'_'),id,reason||'Approved');return {ok:true,status};}
/** Quote image: private quote upload first, then original customer RFQ photo. */
function vioQuotePhotoPreview(id){
 access_(['Admin','Buyer']);
 const q=vioGetCustomerQuote_(String(id||''));
 const raw=String(q.Product_Image_URL||'').trim();
 let fileId='';
 if(raw.startsWith('vio-private-file:'))fileId=raw.substring('vio-private-file:'.length);
 if(!fileId&&raw&&/^https:\/\//i.test(raw))return {exists:true,url:raw,source:'quotation'};
 if(!fileId){
   const rfq=rows_('Price_Inquiries').find(r=>String(r.RFQ_ID)===String(q.RFQ_ID));
   const ids=String(rfq&&rfq.Photo_File_IDs||'').split(',').map(x=>x.trim()).filter(Boolean);
   if(ids.length)fileId=ids[0];
 }
 if(!fileId)return {exists:false,reason:'No photo attached to the quotation or original request'};
 const file=DriveApp.getFileById(fileId);
 let blob=file.getThumbnail();
 if(!blob){if(file.getSize()>1200000)throw Error('Drive thumbnail not ready for this image');blob=file.getBlob();}
 const mime=String(blob.getContentType());
 if(!/^image\/(jpeg|png|webp|gif)$/.test(mime))throw Error('Unsupported image format: '+mime);
 const bytes=blob.getBytes();
 if(bytes.length>1300000)throw Error('Photo preview too large; upload a smaller image');
 return {exists:true,dataUrl:'data:'+mime+';base64,'+Utilities.base64Encode(bytes),source:raw?'quotation':'customer RFQ'};
}
/** Return a JSON-safe plain object; Google Apps Script HTML RPC cannot return Date objects. */
function vioQuoteApprovalDetail(id){
 const a=access_(['Admin','Buyer']);
 const q=vioGetCustomerQuote_(String(id||''));
 const s=rows_('Supplier_Quotations').find(r=>String(r.Supplier_Quote_ID)===String(q.Supplier_Quote_ID))||{};
 const num=v=>{const n=Number(v);return Number.isFinite(n)?n:0;};
 const detail={id:String(q.Quotation_ID||''),rfqId:String(q.RFQ_ID||''),product:String(q.Product_Name||''),customer:String(q.Customer_Name||''),quantity:num(q.Quantity),currency:String(q.Currency||''),unit:num(q.Selling_Unit),total:num(q.Selling_Total),margin:num(q.Selling_Unit)>0?(num(q.Selling_Unit)-num(q.Landed_Unit_Local||s.Landed_Unit_Local))/num(q.Selling_Unit)*100:null,targetMargin:(String(s.Margin_Percent||'').trim()!==''?num(s.Margin_Percent):null),landed:num(q.Landed_Unit_Local||s.Landed_Unit_Local),supplier:String(s.Supplier_Name||''),supplierCost:num(s.Unit_Price),supplierCurrency:String(s.Supplier_Currency||''),freight:num(s.Freight_USD),lead:num(q.Total_Lead_Days),status:String(q.Approval_Status||''),revision:num(q.Revision)||1,reason:String(q.Approval_Notes||''),hasPhoto:!!q.Product_Image_URL,canApprove:a.role==='Admin'};
 return JSON.parse(JSON.stringify(detail));
}

function vioQuoteRevision(x){const a=access_(['Admin','Buyer']);const old=vioGetCustomerQuote_(String(x&&x.id||''));if(!['Approved','Sent','Changes Requested','Rejected'].includes(String(old.Approval_Status)))throw Error('This quotation cannot be revised in its current status');if(String(old.Customer_Decision)==='Accepted')throw Error('Accepted quote cannot be revised');const qty=Number(x.quantity),unit=Number(x.unitPrice),reason=String(x.reason||'').trim();if(!Number.isSafeInteger(qty)||qty<1||!Number.isFinite(unit)||unit<=0)throw Error('Enter valid quantity and selling price');if(qty!==Number(old.Quantity))throw Error('Quantity changes require recalculating supplier costing. Return to Supplier & Costing and create a new offer.');if(reason.length<5)throw Error('Enter a reason for the revision');const s=rows_('Supplier_Quotations').find(z=>String(z.Supplier_Quote_ID)===String(old.Supplier_Quote_ID))||{};const landed=Number(old.Landed_Unit_Local||s.Landed_Unit_Local);if(!(landed>0))throw Error('Landed cost snapshot is missing; recalculate supplier costing');const margin=(unit-landed)/unit*100;if(margin<0)throw Error('Selling price below landed cost; recalculate the supplier offer');const previous=rows_('Customer_Quotations').filter(z=>String(z.RFQ_ID)===String(old.RFQ_ID));const revision=previous.reduce((m,z)=>Math.max(m,Number(z.Revision)||1),1)+1;const id='VIO-QT-'+Utilities.getUuid().slice(0,9).toUpperCase();const copy={...old,Quotation_ID:id,Parent_Quotation_ID:old.Quotation_ID,Revision:revision,Revision_Reason:reason,Quantity:qty,Selling_Unit:unit,Selling_Total:Math.round(qty*unit*100)/100,Margin_Percent:margin,Landed_Unit_Local:landed,Approval_Status:'Pending Approval',Approval_Notes:'',Decision_By:'',Decision_At:'',Approved_By:'',Approved_At:'',Sent_At:'',Customer_Decision:'',Customer_Decision_At:'',PDF_File_ID:'',Created_At:new Date(),Created_By:a.email};delete copy.__row;append_('Customer_Quotations',copy);vioSetFields_('Price_Inquiries','RFQ_ID',old.RFQ_ID,{Quotation_Status:'Pending Approval'});log_('QUOTE_REVISION_CREATED',id,'Parent '+old.Quotation_ID+' / '+reason);return {ok:true,id,revision};}

/** Read-only diagnostics: never exposes private image data or supplier costs. */
function vioApprovalHealthCheck(id){access_(['Admin','Buyer']);const q=vioGetCustomerQuote_(String(id||''));const raw=String(q.Product_Image_URL||'');let status='Not attached';if(raw.startsWith('vio-private-file:')){try{const f=DriveApp.getFileById(raw.slice(17));status='Saved in Drive ('+f.getMimeType()+', '+f.getSize()+' bytes)'}catch(e){status='Drive file inaccessible: '+e.message}}else if(/^https:\/\//i.test(raw))status='External HTTPS photo';return {quotationId:String(q.Quotation_ID),photoStatus:status,approvalStatus:String(q.Approval_Status||'')};}
