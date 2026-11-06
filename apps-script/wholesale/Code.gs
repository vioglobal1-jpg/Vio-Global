function doGet() {







  return HtmlService.createHtmlOutputFromFile('Index')







    .setTitle('VIO | Global Sourcing & Wholesale')







    .addMetaTag('viewport', 'width=device-width, initial-scale=1');







}







const SPREADSHEET_ID = '176X-ZAGuXpiDOr0Wshs3LI0lu9WUSN2DohCX5Iyi4zY';







function testDatabaseConnection() {







  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);







  Logger.log('Connected successfully to: ' + ss.getName());







}







function getChinaProducts() {







  const ss=SpreadsheetApp.openById(SPREADSHEET_ID);







  const sh=ss.getSheetByName('China_Products');







  if(!sh)throw new Error('China_Products sheet not found');







  const values=sh.getDataRange().getValues();if(values.length<2)return [];







  const headers=values[0].map(String);







  const mediaSheet=ss.getSheetByName('Product_Media');







  const byId={};







  if(mediaSheet&&mediaSheet.getLastRow()>1){







    const v=mediaSheet.getDataRange().getValues(),h=v[0].map(String);







    v.slice(1).forEach(r=>{const x={};h.forEach((k,i)=>x[k]=r[i]);







      const id=String(x.Product_ID||'');if(!id)return;







      if(!byId[id])byId[id]=[];







      if(['image','video','catalog'].includes(String(x.Media_Type))&&/^https:\/\//i.test(String(x.Media_URL||'')))







        byId[id].push({type:String(x.Media_Type),url:String(x.Media_URL),sort:Number(x.Sort_Order)||0});







    });







  }







  return values.slice(1).map(r=>{const p={};headers.forEach((h,i)=>p[h]=r[i]);return p;})







    .filter(p=>p.Product_ID&&String(p.Status||'').trim().toLowerCase()==='active')







    .map(p=>({Product_ID:String(p.Product_ID),Product_Name:String(p.Product_Name||''),Product_Name_AR:String(p.Product_Name_AR||''),Description_AR:String(p.Description_AR||''),Category_AR:String(p.Category_AR||''),Category:String(p.Category||''),







      Description:String(p.Description||''),Specifications:String(p.Specifications||''),Image_URL:String(p.Image_URL||''),







      Video_URL:String(p.Video_URL||''),MOQ:p.MOQ||'',Lead_Time_Days:p.Lead_Time_Days||'',







      Media:(byId[String(p.Product_ID)]||[]).sort((a,b)=>a.sort-b.sort).map(m=>({type:m.type,url:m.url}))}));







}







function testChinaProducts() {







  const products = getChinaProducts();







  Logger.log(JSON.stringify(products));







  Logger.log('Active products found: ' + products.length);







}







// Run once after pasting this file. Existing records are preserved.







function prepareRFQDatabase() {







  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);







  const ensure = (name, cols) => {







    let s = ss.getSheetByName(name);







    if (!s) s = ss.insertSheet(name);







    const last = s.getLastColumn();







    const headers = last ? s.getRange(1,1,1,last).getValues()[0].map(String) : [];







    cols.forEach(h => {







      if (!headers.includes(h)) {







        s.getRange(1,headers.length+1).setValue(h).setBackground('#c6a052').setFontColor('white').setFontWeight('bold');







        headers.push(h);







      }







    });







    s.setFrozenRows(1);







    return s;







  };







  ensure('Price_Inquiries', ['RFQ_ID','Created_At','Customer_ID','Product_ID','Product_Source','Requested_Qty','Destination_Country','Target_Price','Currency','Shipping_Mode','Notes','Status','Assigned_To','Customer_Name','Phone','Email','Company_Name','Product_Name','Notification_Status','Notification_Sent_At','Submission_Key','Photo_File_IDs','Photo_Count','Preferred_Contact','Request_Type','Suggested_Product_Name','Originally_Selected_Product']);







  ensure('Customers', ['Customer_ID','Created_At','Customer_Name','Phone','Email','Company_Name','Country','Preferred_Contact','Last_Request_At','Request_Count']);







  Logger.log('RFQ and customer tables ready. Existing data retained.');







}







function vioSafe_(v,max) { return String(v == null ? '' : v).trim().slice(0,max); }







function vioCell_(v) { return typeof v === 'string' && /^[=+\-@\t\r]/.test(v) ? "'"+v : v; }







function vioEsc_(v) { return String(v == null ? '' : v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }







function vioHeaders_(sheet) { return sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0].map(String); }







function vioAppend_(sheet, record) { const headers=vioHeaders_(sheet); sheet.appendRow(headers.map(h=>vioCell_(record[h]===undefined?'':record[h]))); return sheet.getLastRow(); }







function vioPhotoLinks_(ids) { return ids.map(id=>'https\\://drive.google.com/file/d/'+encodeURIComponent(id)+'/view'); }







function vioPhone_(v) { return String(v || '').replace(/[^0-9+]/g,'').replace(/^00/,'+'); }







function vioEmail_(v) { return String(v || '').trim().toLowerCase(); }







function submitPriceInquiry(data) {







  if (!data || typeof data !== 'object') throw new Error('Invalid request');







  const name=vioSafe_(data.name,120), phone=vioSafe_(data.phone,35), email=vioSafe_(data.email,160);







  const company=vioSafe_(data.company,120), country=vioSafe_(data.country,30);







  const shipping=vioSafe_(data.shippingMode,30), contact=vioSafe_(data.preferredContact,30);







  const productId=vioSafe_(data.productId,100), customName=vioSafe_(data.productName,200);







  const notes=vioSafe_(data.notes,2000), key=vioSafe_(data.submissionKey,100);







  const quantity=Number(data.quantity), photos=Array.isArray(data.photos)?data.photos:[];







  if (!name || !key) throw new Error('Customer name is required');







  if (!['WhatsApp','Phone Call','Email'].includes(contact)) throw new Error('Select a contact method');







  if (contact!=='Email' && !/^\\+?[0-9 ()-]{7,35}$/.test(phone)) throw new Error('Enter a valid phone number');







  if (!email) throw new Error('Email is required so we can send your quotation');
  const originIn=vioSafe_(data.sourceOrigin,30);
  const sourceOrigin=productId?(productId.startsWith('VIO-STK-')?(String(data.productSource)==='Egypt'?'Egypt':'UAE'):'China'):originIn;
  if (!['China','Egypt','UAE','Best Option'].includes(sourceOrigin)) throw new Error('Select where to source from');







  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid email');







  if (!Number.isSafeInteger(quantity)||quantity<1||quantity>100000000) throw new Error('Enter a valid quantity');







  if (!['Egypt','UAE','Saudi Arabia','Kuwait','Qatar','Bahrain','Oman'].includes(country)) throw new Error('Select a delivery country');







  if (!['Sea Freight','Air Freight'].includes(shipping)) throw new Error('Select sea or air freight');







  if (photos.length>5) throw new Error('Maximum 5 photos');







  if (!customName && !photos.length) throw new Error('Enter a product name or upload a photo');







  const lock=LockService.getScriptLock(); lock.waitLock(30000);







  let rfqId, rowNumber, sheet, record, ids=[];







  try {







    const ss=SpreadsheetApp.openById(SPREADSHEET_ID);







    sheet=ss.getSheetByName('Price_Inquiries'); const customers=ss.getSheetByName('Customers');







    if (!sheet||!customers) throw new Error('Run prepareRFQDatabase first');







    const h=vioHeaders_(sheet), keyIndex=h.indexOf('Submission_Key');







    if(keyIndex<0) throw new Error('Run prepareRFQDatabase first');







    if(sheet.getLastRow()>1){







      const keys=sheet.getRange(2,keyIndex+1,sheet.getLastRow()-1,1).getValues();







      const index=keys.findIndex(r=>String(r[0])===key);







      if(index>=0) return {ok:true,rfqId:String(sheet.getRange(index+2,h.indexOf('RFQ_ID')+1).getValue())};







    }







    let catalogName='', effectiveProductId='';







    if(productId){







      const market=productId.startsWith('VIO-STK-')?String(data.productSource||''):'';



      const ps=ss.getSheetByName(market==='Egypt'?'Egypt_Stock':market==='Dubai'?'Dubai_Stock':'China_Products'); if(!ps) throw new Error('Product catalog missing');







      const ph=vioHeaders_(ps), productRows=ps.getDataRange().getValues().slice(1);







      const p=productRows.find(r=>String(r[ph.indexOf(market?'Stock_ID':'Product_ID')])===productId && String(r[ph.indexOf('Status')]).trim().toLowerCase()==='active');







      if(!p) throw new Error('Selected catalog product is no longer available');







      catalogName=String(p[ph.indexOf('Product_Name')]||'');







      if(!customName || customName.toLowerCase()===catalogName.trim().toLowerCase()) effectiveProductId=productId;







    }







    const productName=customName || (photos.length?'Photo reference - product name pending':'');







    const ch=vioHeaders_(customers), col=n=>ch.indexOf(n);







    const existing=customers.getLastRow()>1?customers.getRange(2,1,customers.getLastRow()-1,ch.length).getValues():[];







    const normalizedPhone=vioPhone_(phone), normalizedEmail=vioEmail_(email);







    // A verified account/login is needed for authoritative identity; this is contact-based deduplication only.







    let index=existing.findIndex(r=> normalizedPhone && vioPhone_(r[col('Phone')])===normalizedPhone);







    if(index<0 && normalizedEmail) index=existing.findIndex(r=>vioEmail_(r[col('Email')])===normalizedEmail);







    const now=new Date(); let customerId;







    if(index<0){







      customerId='VIO-CUS-'+Utilities.getUuid().slice(0,8).toUpperCase();







      vioAppend_(customers,{Customer_ID:customerId,Created_At:now,Customer_Name:name,Phone:phone,Email:email,Company_Name:company,Country:country,Preferred_Contact:contact,Last_Request_At:now,Request_Count:1});







    }else{







      const row=index+2; customerId=String(existing[index][col('Customer_ID')]);







      const updates={Customer_Name:name,Phone:phone||existing[index][col('Phone')],Email:email||existing[index][col('Email')],Company_Name:company||existing[index][col('Company_Name')],Country:country,Preferred_Contact:contact,Last_Request_At:now,Request_Count:(Number(existing[index][col('Request_Count')])||0)+1};







      Object.keys(updates).forEach(k=>{if(col(k)>=0)customers.getRange(row,col(k)+1).setValue(vioCell_(updates[k]));});







    }







    rfqId='VIO-RFQ-'+Utilities.getUuid().slice(0,8).toUpperCase();







    ids=saveRFQPhotos_(photos,rfqId);







    record={RFQ_ID:rfqId,Created_At:now,Customer_ID:customerId,Product_ID:effectiveProductId,Product_Source:effectiveProductId?(productId.startsWith('VIO-STK-')?String(data.productSource||'Stock'):'China'):'Customer Request',Requested_Qty:quantity,Destination_Country:country,Target_Price:'',Currency:'',Shipping_Mode:shipping,Notes:notes,Status:'New Request',Assigned_To:'',Customer_Name:name,Phone:phone,Email:email,Company_Name:company,Product_Name:productName,Notification_Status:'Pending',Notification_Sent_At:'',Submission_Key:key,Photo_File_IDs:ids.join(', '),Photo_Count:ids.length,Preferred_Contact:contact,Request_Type:effectiveProductId?'Catalog RFQ':'Custom Sourcing',Suggested_Product_Name:'',Originally_Selected_Product:catalogName && !effectiveProductId?catalogName:'',Source_Origin:sourceOrigin};







    rowNumber=vioAppend_(sheet,record);







  }finally{lock.releaseLock();}







  let sent=false;







  try{







    const ss=SpreadsheetApp.openById(SPREADSHEET_ID), p=ss.getSheetByName('Permissions');







    let recipients=['vioglobal1@gmail.com'];







    if(p&&p.getLastRow()>1){







      const h=vioHeaders_(p), rows=p.getRange(2,1,p.getLastRow()-1,h.length).getValues(), i=k=>h.indexOf(k);







      if(['Receive_Notifications','Status','Email'].every(k=>i(k)>=0)){







        const configured=rows.filter(r=>String(r[i('Receive_Notifications')]).toLowerCase()==='yes'&&String(r[i('Status')]).toLowerCase()==='active').map(r=>String(r[i('Email')]).trim()).filter(v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));







        if(configured.length) recipients=[...new Set(configured)];







      }







    }







    const details=[['Customer',name],['Customer ID',record.Customer_ID],['Company',company||'Not provided'],['Preferred contact',contact],['Phone / WhatsApp',phone||'Not provided'],['Email',email||'Not provided'],['Requested product',record.Product_Name],['Originally selected catalog product',record.Originally_Selected_Product||'—'],['Product ID',record.Product_ID||'Custom request'],['Quantity',quantity+' PCS'],['Source from',sourceOrigin],['Destination',country],['Shipping',shipping],['Notes',notes||'None']];







    const rows=details.map(([k,v])=>'<tr><td style="padding:11px;border-bottom:1px solid #ececec;color:#6b7280;width:38%">'+vioEsc_(k)+'</td><td style="padding:11px;border-bottom:1px solid #ececec;color:#222">'+vioEsc_(v)+'</td></tr>').join('');







    const inlineImages={}; let photoHtml='';







    ids.forEach((id,i)=>{







      const blob=DriveApp.getFileById(id).getBlob(), cid='vio-photo-'+(i+1);







      inlineImages[cid]=blob;







      photoHtml+='<div style="display:inline-block;margin:6px"><img src="cid:'+cid+'" alt="Product reference '+(i+1)+'" width="160" style="max-width:100%;height:auto;border-radius:8px;border:1px solid #ddd"></div>';







    });







    if(!ids.length)photoHtml='<p style="color:#777">No reference photos uploaded.</p>';







    const html='<div style="background:#f3f4f6;padding:22px 8px;font-family:Arial,sans-serif"><div style="max-width:650px;margin:auto;background:white;border-radius:12px;overflow:hidden"><div style="background:#c6a052;color:white;padding:24px;text-align:center"><div style="font-size:34px;font-weight:bold;letter-spacing:4px">VIO</div><div style="font-size:11px">GLOBAL SOURCING &amp; WHOLESALE</div></div><div style="padding:26px"><h2>New Quotation Request</h2><p>Hello VIO Team,</p><p>A customer submitted a sourcing request.</p><div style="background:#f8f5ef;padding:16px;border-radius:8px"><div style="font-size:12px;color:#777">REFERENCE</div><strong style="font-size:21px;color:#a77d32">'+vioEsc_(rfqId)+'</strong></div><h3>Customer &amp; Product Details</h3><table style="border-collapse:collapse;width:100%;font-size:14px">'+rows+'</table><h3>Product Reference Photos ('+ids.length+')</h3>'+photoHtml+'<p style="font-size:12px;color:#777">Photos are embedded. Originals remain private in VIO Drive.</p></div><div style="padding:18px;text-align:center;background:#fafafa;color:#a77d32">VIO | Source Smarter. Trade Better.</div></div></div>';







    MailApp.sendEmail({to:recipients.join(','),subject:'VIO | New RFQ '+rfqId,body:'New quotation request: '+rfqId+'\n'+details.map(([k,v])=>k+': '+v).join('\n'),htmlBody:html,inlineImages,name:'VIO Sourcing Platform'});







    sent=true;







  }catch(e){console.error('Notification failed: '+e.message);}







  try{







    const h=vioHeaders_(sheet);







    sheet.getRange(rowNumber,h.indexOf('Notification_Status')+1).setValue(sent?'Sent':'Failed');







    if(sent)sheet.getRange(rowNumber,h.indexOf('Notification_Sent_At')+1).setValue(new Date());







  }catch(e){console.error(e.message);}







  return {ok:true,rfqId,customerId:record.Customer_ID,notificationSent:sent};







}







// AI recognition is not enabled until a secure image-recognition service is configured.







// No API key should ever be placed in Index.html or exposed to customers.







function suggestProductNameFromPhoto() {







  return {enabled:false,message:'AI image recognition is not configured yet. Please enter a product name or attach photos.'};







}







// Stores customer reference photos privately. Do not make the folder or files public.







function saveRFQPhotos_(photos, rfqId) {







  if (!photos.length) return [];







  const allowed = {'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};







  const prepared = photos.map((p,i) => {







    const mime = String(p.mimeType || '').toLowerCase();







    if (!allowed[mime]) throw new Error('Photo '+(i+1)+': JPG, PNG or WEBP only');







    const base64 = String(p.base64 || '');







    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) throw new Error('Invalid photo encoding');







    const bytes = Utilities.base64Decode(base64);







    if (!bytes.length || bytes.length > 5*1024*1024) throw new Error('Each photo must be 5 MB or smaller');







    // Validate file signatures, not just the browser-reported MIME type.







    const b = bytes.map(v => (v+256)%256);







    const valid = mime==='image/jpeg' ? b[0]===255 && b[1]===216 && b[2]===255 :







      mime==='image/png' ? b.slice(0,8).join(',')==='137,80,78,71,13,10,26,10' :







      b.slice(0,4).map(x=>String.fromCharCode(x)).join('')==='RIFF' &&







      b.slice(8,12).map(x=>String.fromCharCode(x)).join('')==='WEBP';







    if (!valid) throw new Error('Photo '+(i+1)+' is not a valid image');







    return {bytes,mime,extension:allowed[mime]};







  });







  const props = PropertiesService.getScriptProperties();







  let folder;







  const folderId = props.getProperty('VIO_RFQ_PHOTO_FOLDER_ID');







  if (folderId) folder = DriveApp.getFolderById(folderId);







  else {







    folder = DriveApp.createFolder('VIO - Private RFQ Photos');







    props.setProperty('VIO_RFQ_PHOTO_FOLDER_ID', folder.getId());







  }







  const ids = [];







  prepared.forEach((p,i) => {







    const file = folder.createFile(Utilities.newBlob(p.bytes,p.mime,rfqId+'-photo-'+(i+1)+'.'+p.extension));







    ids.push(file.getId());







  });







  return ids;







}







// Run once from Apps Script editor to authorize Drive and email permissions.







function authorizeVIOPhotoStorage() {







  const props = PropertiesService.getScriptProperties();







  let id = props.getProperty('VIO_RFQ_PHOTO_FOLDER_ID');







  let folder;







  if (id) folder = DriveApp.getFolderById(id);







  else {







    folder = DriveApp.createFolder('VIO - Private RFQ Photos');







    props.setProperty('VIO_RFQ_PHOTO_FOLDER_ID', folder.getId());







  }







  Logger.log('Private photo folder ready: ' + folder.getName());







  Logger.log('Email quota available: ' + MailApp.getRemainingDailyQuota());







}







/** Public stock: return only customer-safe columns. Never return supplier costs or internal notes. */



function getVIOPublicStock(market){
  if(!['Egypt','Dubai'].includes(market))throw Error('Unknown stock location');
  const s=SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(market+'_Stock');
  if(!s||s.getLastRow()<2)return [];
  const values=s.getDataRange().getValues();
  const headers=values[0].map(h=>String(h).trim());
  // Normalize links only for customer display; never modify stored stock records.
  const photoUrl=value=>{
    const url=String(value==null?'':value).trim().replace(/^'/,'').replace(/\\\//g,'/').replace(/\\:/g,':');
    return /^https:\/\//i.test(url)?url:'';
  };
  return values.slice(1).map(row=>Object.fromEntries(headers.map((key,i)=>[key,row[i]])))
    .filter(r=>String(r.Status||'').trim().toLowerCase()==='active')
    .map(r=>{
      const main=photoUrl(r.Image_URL);
      const media=String(r.Media_URLs||'').split(/[\n,]/).map(photoUrl).filter(Boolean);
      const images=[...new Set([main,...media].filter(Boolean))].slice(0,12);
      const availability=String(r.Availability||'').trim()||((Number(r.Available_Qty)||0)>0?'In Stock':'Out of Stock');
      return {
        Product_ID:String(r.Stock_ID||''),Product_Name:String(r.Product_Name||''),Product_Name_AR:String(r.Product_Name_AR||''),Description_AR:String(r.Description_AR||''),Category_AR:String(r.Category_AR||''),
        Category:String(r.Category||''),Description:String(r.Description||''),
        Image_URL:images[0]||'',MOQ:Number(r.MOQ)||1,Availability:availability,
        Price_Visibility:String(r.Price_Visibility||'On Request'),
        Selling_Price:Number(r.Selling_Price)||0,Currency:market==='Egypt'?'EGP':'AED',
        Media:images.map(url=>({type:/\.pdf(?:\?|$)/i.test(url)?'catalog':'image',url}))
      };
    });
}

/** VIO Stage 1A: email-verified customer portal. Run prepareVIOCustomerPortal once. */
function prepareVIOCustomerPortal(){const ss=SpreadsheetApp.openById(SPREADSHEET_ID);const ensure=(name,cols)=>{let s=ss.getSheetByName(name);if(!s)s=ss.insertSheet(name);const h=s.getLastColumn()?s.getRange(1,1,1,s.getLastColumn()).getValues()[0].map(String):[];cols.forEach(c=>{if(!h.includes(c)){s.getRange(1,h.length+1).setValue(c).setBackground('#c6a052').setFontColor('white');h.push(c);}});s.setFrozenRows(1);};ensure('Customer_Auth',['Email','Code_Hash','Code_Expires','Code_Attempts','Last_Code_Sent','Session_Hash','Session_Expires']);ensure('VIO_Messages',['Message_ID','RFQ_ID','Customer_Email','Sender_Type','Sender','Message','Created_At','Read_By_Admin','Read_By_Customer']);ensure('VIO_Negotiations',['Negotiation_ID','RFQ_ID','Quotation_ID','Customer_Email','Requested_Total','Requested_Quantity','Requested_Terms','Customer_Message','Status','Created_At','Resolved_At','Resolved_By']);return {ok:true};}
function vioCPDb_(){return SpreadsheetApp.openById(SPREADSHEET_ID);}
function vioCPSheet_(name){const s=vioCPDb_().getSheetByName(name);if(!s)throw Error('Customer portal not configured. Run prepareVIOCustomerPortal.');return s;}
function vioCPRows_(name){const s=vioCPSheet_(name),v=s.getDataRange().getValues();if(v.length<2)return [];const h=v[0].map(String);return v.slice(1).map((r,i)=>Object.fromEntries([['__row',i+2],...h.map((k,j)=>[k,r[j] instanceof Date?r[j].toISOString():r[j]])]));}
function vioCPAppend_(name,obj){const s=vioCPSheet_(name),h=s.getRange(1,1,1,s.getLastColumn()).getValues()[0];s.appendRow(h.map(k=>vioCell_(obj[k]===undefined?'':obj[k])));}
function vioCPUpdate_(name,row,fields){const s=vioCPSheet_(name),h=s.getRange(1,1,1,s.getLastColumn()).getValues()[0];Object.keys(fields).forEach(k=>{const i=h.indexOf(k);if(i>=0)s.getRange(row,i+1).setValue(vioCell_(fields[k]));});}
function vioCPHash_(x){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,x).map(b=>('0'+((b+256)%256).toString(16)).slice(-2)).join('');}
function vioCPEmail_(v){const e=String(v||'').trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)||e.length>160)throw Error('Enter a valid email address');return e;}
function vioCPRequestCode(email){email=vioCPEmail_(email);const lock=LockService.getScriptLock();lock.waitLock(20000);let code;try{const now=Date.now(),list=vioCPRows_('Customer_Auth'),record=list.find(r=>String(r.Email).toLowerCase()===email);if(record&&now-new Date(record.Last_Code_Sent).getTime()<60000)throw Error('Please wait one minute before requesting another code');code=String(100000+(parseInt(Utilities.getUuid().replace(/-/g,'').slice(0,10),16)%900000));const hash=vioCPHash_(email+':'+code+':'+vioCPSecret_());const data={Email:email,Code_Hash:hash,Code_Expires:new Date(now+10*60000),Code_Attempts:0,Last_Code_Sent:new Date(now),Session_Hash:'',Session_Expires:''};if(record)vioCPUpdate_('Customer_Auth',record.__row,data);else vioCPAppend_('Customer_Auth',data);}finally{lock.releaseLock();}MailApp.sendEmail({to:email,subject:'VIO | Your customer portal sign-in code',body:'Your VIO sign-in code is '+code+'. It expires in 10 minutes. Do not share it with anyone.\n\nIf you did not request this, ignore this email.'});return {ok:true,message:'If email delivery succeeds, your code will arrive shortly.'};}
function vioCPSecret_(){const props=PropertiesService.getScriptProperties();let v=props.getProperty('VIO_CP_SECRET');if(!v){v=Utilities.getUuid()+Utilities.getUuid();props.setProperty('VIO_CP_SECRET',v);}return v;}
function vioCPVerifyCode(x){const email=vioCPEmail_(x&&x.email),code=String(x&&x.code||'');if(!/^\d{6}$/.test(code))throw Error('Enter the 6-digit code');const lock=LockService.getScriptLock();lock.waitLock(20000);try{const r=vioCPRows_('Customer_Auth').find(z=>String(z.Email).toLowerCase()===email);if(!r||new Date(r.Code_Expires).getTime()<Date.now()||Number(r.Code_Attempts)>=5)throw Error('Code expired or too many attempts. Request a new code');vioCPUpdate_('Customer_Auth',r.__row,{Code_Attempts:Number(r.Code_Attempts||0)+1});if(vioCPHash_(email+':'+code+':'+vioCPSecret_())!==String(r.Code_Hash))throw Error('Incorrect code');const token=Utilities.getUuid()+Utilities.getUuid();vioCPUpdate_('Customer_Auth',r.__row,{Code_Hash:'',Code_Expires:'',Session_Hash:vioCPHash_(token+vioCPSecret_()),Session_Expires:new Date(Date.now()+12*3600000)});return {ok:true,token,email};}finally{lock.releaseLock();}}
function vioCPIdentity_(token){token=String(token||'');if(token.length<40||token.length>150)throw Error('Please sign in');const hash=vioCPHash_(token+vioCPSecret_());const r=vioCPRows_('Customer_Auth').find(x=>x.Session_Hash===hash&&new Date(x.Session_Expires).getTime()>Date.now());if(!r)throw Error('Session expired. Sign in again');return String(r.Email).toLowerCase();}
function vioCPLogout(token){const email=vioCPIdentity_(token);const r=vioCPRows_('Customer_Auth').find(x=>String(x.Email).toLowerCase()===email);if(r)vioCPUpdate_('Customer_Auth',r.__row,{Session_Hash:'',Session_Expires:''});return {ok:true};}
function vioCPAllowedRfq_(email,id){const r=vioCPRows_('Price_Inquiries').find(r=>String(r.RFQ_ID)===String(id)&&String(r.Email||'').trim().toLowerCase()===email);if(!r)throw Error('Request not found for your verified email');return r;}
function vioCPQuote_(email,id){const q=vioCPRows_('Customer_Quotations').find(r=>String(r.Quotation_ID)===String(id));if(!q)throw Error('Quotation not found');vioCPAllowedRfq_(email,q.RFQ_ID);if(!['Sent','Accepted'].includes(String(q.Approval_Status)))throw Error('Quotation is not yet available');return q;}
function vioCPDashboard(token){const email=vioCPIdentity_(token),rfqs=vioCPRows_('Price_Inquiries').filter(r=>String(r.Email||'').trim().toLowerCase()===email);const ids=new Set(rfqs.map(r=>String(r.RFQ_ID)));const quotes=vioCPRows_('Customer_Quotations').filter(q=>ids.has(String(q.RFQ_ID))&&['Sent','Accepted'].includes(String(q.Approval_Status))).map(q=>({id:q.Quotation_ID,rfqId:q.RFQ_ID,product:q.Product_Name,revision:q.Revision||1,quantity:q.Quantity,currency:q.Currency,total:q.Selling_Total,unit:q.Selling_Unit,moq:q.MOQ,leadDays:q.Total_Lead_Days,validityDays:q.Validity_Days,status:q.Approval_Status,decision:q.Customer_Decision,createdAt:q.Created_At}));const orders=vioCPRows_('Sales_Orders').filter(o=>ids.has(String(o.RFQ_ID))).map(o=>({id:o.Order_ID,rfqId:o.RFQ_ID,product:o.Product_Name,status:o.Status,paymentStatus:o.Payment_Status,shipmentStatus:o.Shipment_Status,tracking:o.Tracking_Number,eta:o.ETA}));const messages=vioCPRows_('VIO_Messages').filter(m=>ids.has(String(m.RFQ_ID))).map(m=>({id:m.Message_ID,rfqId:m.RFQ_ID,senderType:m.Sender_Type,message:m.Message,createdAt:m.Created_At}));const negotiations=vioCPRows_('VIO_Negotiations').filter(n=>ids.has(String(n.RFQ_ID))).map(n=>({id:n.Negotiation_ID,rfqId:n.RFQ_ID,quotationId:n.Quotation_ID,status:n.Status,requestedTotal:n.Requested_Total,message:n.Customer_Message,createdAt:n.Created_At}));return {email,rfqs:rfqs.map(r=>({id:r.RFQ_ID,product:r.Product_Name,quantity:r.Requested_Qty,status:r.Status,createdAt:r.Created_At})),quotes,orders,messages,negotiations};}
function vioCPSendMessage(x){const email=vioCPIdentity_(x&&x.token),rfq=vioCPAllowedRfq_(email,x.rfqId),message=String(x.message||'').trim();if(!message||message.length>3000)throw Error('Message must be 1–3,000 characters');vioCPAppend_('VIO_Messages',{Message_ID:'MSG-'+Utilities.getUuid(),RFQ_ID:rfq.RFQ_ID,Customer_Email:email,Sender_Type:'Customer',Sender:email,Message:message,Created_At:new Date(),Read_By_Admin:'No',Read_By_Customer:'Yes'});return {ok:true};}
function vioCPDecision(x){const email=vioCPIdentity_(x&&x.token),q=vioCPQuote_(email,x.quotationId),decision=String(x.decision||'');if(!['Accepted','Rejected','Revision Requested'].includes(decision))throw Error('Invalid decision');if(['Accepted','Rejected','Revision Requested'].includes(String(q.Customer_Decision)))throw Error('This quotation already has a recorded decision. Wait for VIO to respond or issue a new version');const all=vioCPRows_('Customer_Quotations').filter(z=>String(z.RFQ_ID)===String(q.RFQ_ID));if(all.some(z=>String(z.Quotation_ID)!==String(q.Quotation_ID)&&['Pending Approval','Approved','Sent','Accepted'].includes(String(z.Approval_Status))&&(Number(z.Revision)||1)>(Number(q.Revision)||1)))throw Error('A newer quotation version is available');const lock=LockService.getScriptLock();lock.waitLock(20000);try{const current=vioCPQuote_(email,x.quotationId);if(String(current.Customer_Decision)==='Accepted')throw Error('Already accepted');if(decision==='Revision Requested'){const total=x.requestedTotal===''?0:Number(x.requestedTotal);const qty=x.requestedQuantity===''?0:Number(x.requestedQuantity);const message=String(x.message||'').trim();if((total&&!Number.isFinite(total))||total<0||(qty&&(!Number.isSafeInteger(qty)||qty<1))||message.length>2000)throw Error('Check your counteroffer');if(!total&&!qty&&!message)throw Error('Enter a counteroffer or negotiation message');vioCPAppend_('VIO_Negotiations',{Negotiation_ID:'NEG-'+Utilities.getUuid(),RFQ_ID:q.RFQ_ID,Quotation_ID:q.Quotation_ID,Customer_Email:email,Requested_Total:total||'',Requested_Quantity:qty||'',Requested_Terms:String(x.terms||'').slice(0,1000),Customer_Message:message,Status:'New',Created_At:new Date()});}vioCPUpdate_('Customer_Quotations',current.__row,{Customer_Decision:decision,Customer_Decision_At:new Date(),Approval_Status:decision==='Accepted'?'Accepted':current.Approval_Status});return {ok:true};}finally{lock.releaseLock();}}

/** Website API for viosourcing.com. Only the listed customer functions can be called. */
function doPost(e){
  const out=o=>ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
  try{
    const req=JSON.parse(e&&e.postData&&e.postData.contents||'{}'),fn=String(req.fn||''),args=Array.isArray(req.args)?req.args:[];
    const api={getChinaProducts,getVIOPublicStock,submitPriceInquiry,vioCPRequestCode,vioCPVerifyCode,vioCPDashboard,vioCPSendMessage,vioCPDecision,vioCPLogout};
    if(!Object.prototype.hasOwnProperty.call(api,fn))throw Error('Unknown request');
    if(fn==='submitPriceInquiry'||fn==='vioCPRequestCode')vioRateLimit_(fn,args);
    return out({ok:true,result:api[fn].apply(null,args)});
  }catch(err){return out({ok:false,error:String(err&&err.message||err)});}
}
function vioRateLimit_(fn,args){
  if(fn==='submitPriceInquiry'&&args[0]&&String(args[0].website||'').trim())throw Error('Request could not be sent');
  if(MailApp.getRemainingDailyQuota()<5)throw Error('We are very busy right now. Please contact us on WhatsApp.');
  const cache=CacheService.getScriptCache(),key='vio_rl_'+fn+'_'+Utilities.formatDate(new Date(),'GMT','yyyyMMddHH'),used=Number(cache.get(key)||0);
  if(used>=(fn==='submitPriceInquiry'?30:40))throw Error('Too many requests right now. Please try again later or contact us on WhatsApp.');
  cache.put(key,String(used+1),3700);
}
