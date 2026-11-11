(function(){
'use strict';
/* ---------- constants ---------- */
var EXP=['Food','Transport','Car fuel','Car repair','Shopping','Rent','Bills','Medical','Education','Entertainment','Travel','Family','Other'];
var INC=['Salary','Business','Freelance','Bonus','Investment','Other'];
var ATYPES={cash:'Cash',bank:'Bank account',savings:'Savings account',credit_card:'Credit card',other:'Other'};
var CURS=['AED','BDT'];
var NAV=[['home','Dashboard','home'],['transactions','Transactions','list'],['accounts','Accounts','wallet'],['loans','Borrow & Lend','swap'],['remittance','Remittance','send'],['reports','Reports','chart'],['preferences','Settings','sliders']];
var IC={
 home:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
 list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
 wallet:'<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2z"/><path d="M17 14h.01"/>',
 swap:'<path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
 chart:'<path d="M5 21V11M12 21V4M19 21v-7"/>',
 sliders:'<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
 plus:'<path d="M12 5v14M5 12h14"/>', x:'<path d="M6 6l12 12M18 6L6 18"/>',
 down:'<path d="M12 4v11M7 11l5 5 5-5M4 20h16"/>', up:'<path d="M12 16V5M7 9l5-5 5 5M4 20h16"/>',
 inc:'<path d="M12 19V5M6 11l6-6 6 6"/>', exp:'<path d="M12 5v14M6 13l6 6 6-6"/>', trf:'<path d="M4 8h14M14 4l4 4-4 4M20 16H6M10 12l-4 4 4 4"/>',
 send:'<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>'
};
function ic(n){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[n]+'</svg>';}
var LOGO='<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" style="fill:var(--accent)"/><path d="M8 11.5a2.5 2.5 0 0 1 2.5-2.5H22v3.5" fill="none" stroke="var(--accent-ink)" stroke-width="2" stroke-linecap="round"/><path d="M8 11.5v9a2.5 2.5 0 0 0 2.5 2.5h12a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1H10.5A2.5 2.5 0 0 1 8 11.5z" fill="none" stroke="var(--accent-ink)" stroke-width="2" stroke-linejoin="round"/><circle cx="19.5" cy="17.5" r="1.4" style="fill:var(--accent-ink)"/></svg>';

/* ---------- helpers ---------- */
function $(s){return document.querySelector(s);}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function pad(n){return String(n).padStart(2,'0');}
function ymd(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function today(){return ymd(new Date());}
function uuid(){try{return crypto.randomUUID();}catch(e){return 'id-'+Date.now().toString(36)+Math.random().toString(36).slice(2,10);}}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1);}
var NF=new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
function money(m,c){return (m<0?'−':'')+NF.format(Math.abs(m)/100)+' '+c;}
function short(m){var v=Math.abs(m)/100;return v>=1e6?(v/1e6).toFixed(1)+'M':v>=1000?(v/1000).toFixed(v>=10000?0:1)+'k':String(Math.round(v));}
/* amounts are integers in minor units (fils / poisha), so no floating point drift */
function parseAmt(s,allowNeg){
  s=String(s||'').trim().replace(/,/g,'');
  var m=/^(-)?(\d+)(?:\.(\d{1,2}))?$/.exec(s);
  if(!m||(m[1]&&!allowNeg))return null;
  var v=parseInt(m[2],10)*100+(m[3]?parseInt((m[3]+'0').slice(0,2),10):0);
  return m[1]?-v:v;
}
function inputAmt(m){return m==null?'':(m/100).toFixed(2);}
function fdate(s){if(!s)return '';var d=new Date(s+'T00:00:00');return isNaN(d)?s:d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});}
function validDate(s){return /^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(new Date(s+'T00:00:00'));}
function weekStart(s){var d=new Date(s+'T00:00:00');d.setDate(d.getDate()-((d.getDay()+6)%7));return ymd(d);}
function rangeStart(r){var n=new Date();if(r==='month')return ymd(new Date(n.getFullYear(),n.getMonth(),1));if(r==='30d'){n.setDate(n.getDate()-29);return ymd(n);}if(r==='year')return n.getFullYear()+'-01-01';return '0000-01-01';}
function lastMonths(n){var o=[],d=new Date();d.setDate(1);for(var i=n-1;i>=0;i--){var x=new Date(d.getFullYear(),d.getMonth()-i,1);o.push({key:x.getFullYear()+'-'+pad(x.getMonth()+1),label:x.toLocaleDateString('en-US',{month:'short'})});}return o;}

/* ---------- state ---------- */
function blank(){return {v:1,settings:{name:'',cur:'AED',theme:'system'},accounts:[],tx:[],loans:[],remits:[]};}
function migrate(d){
  var s=blank();if(!d||typeof d!=='object')return s;
  try{d=JSON.parse(JSON.stringify(d));}catch(e){return s;}
  if(d.settings&&typeof d.settings==='object'){s.settings.name=String(d.settings.name||'');s.settings.cur=CURS.indexOf(d.settings.cur)>=0?d.settings.cur:'AED';s.settings.theme=['light','dark','system'].indexOf(d.settings.theme)>=0?d.settings.theme:'system';}
  s.accounts=Array.isArray(d.accounts)?d.accounts:[];s.tx=Array.isArray(d.tx)?d.tx:[];s.loans=Array.isArray(d.loans)?d.loans:[];s.remits=Array.isArray(d.remits)?d.remits:[];
  s.loans.forEach(function(l){if(!Array.isArray(l.reps))l.reps=[];});
  return s;
}
var inflight=0,S=blank(),docRef=null,loaded=false,mode='memory',slow=false,view='home',chain=Promise.resolve();
var F={dash:{range:'month',cur:null,acc:''},tx:{q:'',type:'',acc:'',sort:'date-desc',page:1},loans:{tab:'lent'},rem:{range:'all',cur:null,who:''},rep:{from:'',to:'',cur:null,period:'month'}};
var PAGE=10;

function persist(){
  if(!docRef){try{localStorage.setItem('mywallet-local',JSON.stringify(S));}catch(e){}return;}
  var snap=JSON.parse(JSON.stringify(S));
  inflight++;
  chain=chain.then(function(){return docRef.set(snap);}).catch(function(e){toast('Could not save: '+((e&&e.message)||'try again'),true);}).then(function(){inflight--;});
}
function commit(){render();persist();}

/* ---------- derived numbers ---------- */
function acc(id){for(var i=0;i<S.accounts.length;i++)if(S.accounts[i].id===id)return S.accounts[i];return null;}
function balances(){
  var b={};S.accounts.forEach(function(a){b[a.id]=a.opening||0;});
  S.tx.forEach(function(t){
    if(t.type==='income'){if(t.acc in b)b[t.acc]+=t.amt;}
    else if(t.type==='expense'){if(t.acc in b)b[t.acc]-=t.amt;}
    else{if(t.acc in b)b[t.acc]-=t.amt;if(t.to in b)b[t.to]+=t.amt;}
  });
  S.remits.forEach(function(r){if(r.acc in b)b[r.acc]-=r.amt+(r.fee||0);});
  S.loans.forEach(function(l){
    if(l.acc in b)b[l.acc]+=(l.dir==='lent'?-l.amt:l.amt);
    l.reps.forEach(function(r){if(r.acc in b)b[r.acc]+=(l.dir==='lent'?r.amt:-r.amt);});
  });
  return b;
}
function loanInfo(l){
  var rep=0;l.reps.forEach(function(r){rep+=r.amt;});
  var rem=l.amt-rep,st;
  if(rem<=0)st='fully_repaid';
  else if(l.due&&l.due<today())st='overdue';
  else if(rep>0)st='partially_repaid';
  else st='active';
  return {repaid:rep,rem:rem,status:st};
}
var STL={active:['Active','info'],partially_repaid:['Partly repaid','warn'],fully_repaid:['Repaid','inc'],overdue:['Overdue','exp']};
function hasRecords(id){
  return S.remits.some(function(r){return r.acc===id;})||S.tx.some(function(t){return t.acc===id||t.to===id;})||S.loans.some(function(l){return l.acc===id||l.reps.some(function(r){return r.acc===id;});});
}

/* ---------- chrome ---------- */
function applyTheme(){var t=S.settings.theme,r=document.documentElement;if(t==='light'||t==='dark')r.setAttribute('data-theme',t);else r.removeAttribute('data-theme');}
function toast(msg){var t=$('#toast');t.textContent=msg;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(function(){t.hidden=true;},2600);}
function buildChrome(){
  $('#side').innerHTML='<div class="brand">'+LOGO+'<span>My Wallet</span></div>'+NAV.map(function(n){return '<button class="nav" data-act="nav" data-v="'+n[0]+'">'+ic(n[2])+'<span>'+n[1]+'</span></button>';}).join('')+'<button class="btn primary" data-act="add-tx">'+ic('plus')+'Add transaction</button>';
  $('#bottom').innerHTML=NAV.map(function(n){return '<button data-act="nav" data-v="'+n[0]+'">'+ic(n[2])+'<span>'+(n[0]==='loans'?'Lend':n[0]==='transactions'?'Activity':n[0]==='remittance'?'Remit':n[1])+'</span></button>';}).join('');
  $('#fab').innerHTML=ic('plus')+'<span>Add</span>';
  $('#closeBtn').innerHTML=ic('x');
}
function render(){
  applyTheme();
  var cur=view;
  document.querySelectorAll('[data-act="nav"]').forEach(function(b){if(b.dataset.v===cur)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  var m=$('#main');
  var html='<div class="top"><div class="brand">'+LOGO+'<span>My Wallet</span></div><span class="chip">'+esc(S.settings.name||'My account')+'</span></div>';
  if(!loaded){html+='<div class="card"><h2>Opening your wallet…</h2><p class="muted">'+(slow?'Your saved data is taking a while to arrive. Check your connection.':'Loading saved records.')+'</p></div>';m.innerHTML=html;return;}
  if(mode==='memory')html+='<div class="notice warnbox" style="margin-bottom:12px">Saving is unavailable in this view. Changes last only until you close the page.</div>';
  if(cur==='home')html+=vHome();else if(cur==='transactions')html+=vTx();else if(cur==='accounts')html+=vAccounts();
  else if(cur==='loans')html+=vLoans();else if(cur==='remittance')html+=vRem();else if(cur==='reports')html+=vReports();else html+=vPrefs();
  m.innerHTML=html;
}
function go(v){view=v;try{history.replaceState(null,'','#'+v);}catch(e){location.hash=v;}render();window.scrollTo(0,0);}

/* ---------- charts ---------- */
function niceMax(minor){var x=Math.max(minor/100,1),p=Math.pow(10,Math.floor(Math.log10(x))),k=[1,2,2.5,5,10],i;for(i=0;i<k.length;i++)if(k[i]*p>=x)return k[i]*p*100;return 10*p*100;}
function bars(labels,series,classes,title){
  var W=340,H=156,pl=34,pr=4,pt=8,pb=22,max=niceMax(Math.max.apply(null,[0].concat.apply([],series))),gw=(W-pl-pr)/labels.length,n=series.length,bw=Math.min(26,gw*0.7/n),y=function(v){return pt+(H-pt-pb)*(1-v/max);},o='<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(title)+'">';
  [0,0.5,1].forEach(function(f){var v=max*f;o+='<line class="grid" x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y(v)+'" y2="'+y(v)+'"/><text x="'+(pl-5)+'" y="'+(y(v)+3)+'" text-anchor="end">'+short(v)+'</text>';});
  labels.forEach(function(lb,i){
    var cx=pl+gw*i+gw/2;
    series.forEach(function(sr,k){var v=sr[i],x=cx-(n*bw)/2+k*bw,h=Math.max(0,(H-pt-pb)*(v/max));o+='<rect class="'+classes[k]+'" x="'+x.toFixed(1)+'" y="'+(H-pb-h).toFixed(1)+'" width="'+(bw-2).toFixed(1)+'" height="'+h.toFixed(1)+'" rx="3"/>';});
    o+='<text x="'+cx+'" y="'+(H-6)+'" text-anchor="middle">'+esc(lb)+'</text>';
  });
  return o+'</svg>';
}

/* ---------- dashboard ---------- */
function dashFilters(){
  var f=F.dash;if(!f.cur)f.cur=S.settings.cur;
  var accs=S.accounts.filter(function(a){return a.currency===f.cur;});
  if(f.acc&&!accs.some(function(a){return a.id===f.acc;}))f.acc='';
  return '<div class="filters" style="margin-bottom:14px"><select data-f="dash.range" aria-label="Date range">'+[['month','This month'],['30d','Last 30 days'],['year','This year'],['all','All time']].map(function(o){return '<option value="'+o[0]+'"'+(f.range===o[0]?' selected':'')+'>'+o[1]+'</option>';}).join('')+'</select>'
   +'<select data-f="dash.cur" aria-label="Currency">'+CURS.map(function(c){return '<option'+(f.cur===c?' selected':'')+'>'+c+'</option>';}).join('')+'</select>'
   +'<select data-f="dash.acc" aria-label="Account"><option value="">All accounts</option>'+accs.map(function(a){return '<option value="'+a.id+'"'+(f.acc===a.id?' selected':'')+'>'+esc(a.name)+'</option>';}).join('')+'</select></div>';
}
function vHome(){
  var f=F.dash;
  var head='<div class="pagehead"><div><h1>'+(S.settings.name?'Hello, '+esc(S.settings.name.split(' ')[0]):'Dashboard')+'</h1><div class="muted small">'+new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})+'</div></div></div>';
  if(!S.accounts.length){
    return head+'<div class="card empty"><h2>Start with an account</h2><p class="muted">An account is a place your money sits: cash in hand, a bank account, a savings pot. Each account has one currency, AED or BDT.</p><div class="row wrap" style="justify-content:center"><button class="btn primary" data-act="add-acc">'+ic('plus')+'Add account</button><button class="btn" data-act="sample">Try with sample data</button></div></div>';
  }
  var filt=dashFilters(),cur=f.cur,from=rangeStart(f.range),b=balances();
  var accs=S.accounts.filter(function(a){return a.currency===cur&&(!f.acc||a.id===f.acc);});
  var ids={};accs.forEach(function(a){ids[a.id]=1;});
  var cash=0,bank=0,assets=0;
  accs.forEach(function(a){var v=b[a.id];if(a.type==='credit_card')return;assets+=v;if(a.type==='cash')cash+=v;else if(a.type==='bank'||a.type==='savings')bank+=v;});
  var inc=0,exp=0;
  var txs=S.tx.filter(function(t){return ids[t.acc]&&t.cur===cur&&t.date>=from;});
  txs.forEach(function(t){if(t.type==='income')inc+=t.amt;else if(t.type==='expense')exp+=t.amt;});
  var lentTot=0,borTot=0,recv=0,pay=0;
  S.loans.forEach(function(l){if(l.cur!==cur||!ids[l.acc])return;var i=loanInfo(l);if(l.dir==='lent'){lentTot+=l.amt;recv+=i.rem;}else{borTot+=l.amt;pay+=i.rem;}});
  var sentH=0,remFee=0;S.remits.forEach(function(r){if(r.cur===cur&&ids[r.acc]&&r.date>=from){sentH+=r.amt;remFee+=r.fee||0;}});
  var months=lastMonths(6),mi={},me={};months.forEach(function(m){mi[m.key]=0;me[m.key]=0;});
  S.tx.forEach(function(t){if(!ids[t.acc]||t.cur!==cur)return;var k=t.date.slice(0,7);if(!(k in mi))return;if(t.type==='income')mi[k]+=t.amt;else if(t.type==='expense')me[k]+=t.amt;});
  var labs=months.map(function(m){return m.label;}),incS=months.map(function(m){return mi[m.key];}),expS=months.map(function(m){return me[m.key];});
  var cats={};txs.forEach(function(t){if(t.type==='expense')cats[t.cat||'Other']=(cats[t.cat||'Other']||0)+t.amt;});
  var catRows=Object.keys(cats).sort(function(a,c){return cats[c]-cats[a];});
  var recent=S.tx.filter(function(t){return ids[t.acc]||ids[t.to];}).sort(cmpDate).slice(0,6);
  var rangeLbl={month:'this month','30d':'last 30 days',year:'this year',all:'all time'}[f.range];
  return head+filt
   +'<div class="stack">'
   +'<div class="card hero"><div class="lbl">Total assets · '+cur+'</div><div class="big num">'+money(assets,cur)+'</div><div class="chips"><div class="mini"><div class="lbl">Cash</div><div class="num">'+money(cash,cur)+'</div></div><div class="mini"><div class="lbl">Bank &amp; savings</div><div class="num">'+money(bank,cur)+'</div></div></div></div>'
   +'<div class="grid g2 c3">'
   +kpi('Income · '+rangeLbl,money(inc,cur),'inc')+kpi('Expenses · '+rangeLbl,money(exp,cur),'exp')
   +kpi('Money lent (total)',money(lentTot,cur),'')+kpi('Money borrowed (total)',money(borTot,cur),'')
   +kpi('Receivables owed to you',money(recv,cur),'info')+kpi('Payables you owe',money(pay,cur),'warn')+kpi('Sent home · '+rangeLbl,money(sentH,cur),'')+kpi('Transfer fees · '+rangeLbl,money(remFee,cur),'')+'</div>'
   +'<div class="grid c2"><div class="card"><div class="row between"><h2>Monthly spending</h2><span class="chip '+cur+'">'+cur+'</span></div>'+bars(labs,[expS],['b-exp'],'Monthly spending, last 6 months')+'</div>'
   +'<div class="card"><div class="row between"><h2>Income vs expense</h2><span class="chip '+cur+'">'+cur+'</span></div>'+bars(labs,[incS,expS],['b-inc','b-exp'],'Income versus expenses, last 6 months')+'<div class="legend"><span><i style="background:var(--inc)"></i>Income</span><span><i style="background:var(--exp)"></i>Expense</span></div></div></div>'
   +'<div class="grid c2"><div class="card"><h2>Where it went</h2><div class="muted small" style="margin-bottom:10px">Expenses '+rangeLbl+'</div>'+(catRows.length?catRows.map(function(c){return catBar(c,cats[c],exp,cur);}).join(''):'<p class="muted">No expenses in this period.</p>')+'</div>'
   +'<div class="card"><div class="row between"><h2>Recent</h2><button class="btn ghost sm" data-act="nav" data-v="transactions">See all</button></div><div class="list">'+(recent.length?recent.map(txRow).join(''):'<p class="muted">Nothing yet. Tap Add to record your first transaction.</p>')+'</div></div></div>'
   +'<p class="muted small">AED and BDT are never added together. Switch currency above to see the other side.</p></div>';
}
function kpi(l,v,c){return '<div class="card kpi"><div class="lbl">'+l+'</div><div class="val num '+c+'">'+v+'</div></div>';}
function catBar(name,v,tot,cur){var p=tot?Math.round(v/tot*100):0;return '<div style="margin-bottom:12px"><div class="row between small"><span>'+esc(name)+'</span><span class="num">'+money(v,cur)+' · '+p+'%</span></div><div class="bar exp" style="margin-top:5px"><i style="width:'+Math.max(p,2)+'%"></i></div></div>';}
function cmpDate(a,b){return a.date<b.date?1:a.date>b.date?-1:(b.created||0)-(a.created||0);}

/* ---------- transactions ---------- */
function txRow(t){
  var a=acc(t.acc),to=t.to?acc(t.to):null,title=t.desc||(t.type==='transfer'?'Transfer':t.cat||cap(t.type));
  var sign=t.type==='income'?'+':t.type==='expense'?'−':'';
  var sub=(t.type==='transfer'?esc(a?a.name:'?')+' → '+esc(to?to.name:'?'):esc((t.cat||'')+(t.cat?' · ':'')+(a?a.name:'?')))+' · '+fdate(t.date);
  return '<button class="item" data-act="edit-tx" data-id="'+t.id+'"><span class="ico '+t.type+'">'+ic(t.type==='income'?'inc':t.type==='expense'?'exp':'trf')+'</span><span class="grow"><div class="t">'+esc(title)+'</div><div class="s">'+sub+'</div></span><span class="num '+(t.type==='income'?'inc':t.type==='expense'?'exp':'')+'" style="white-space:nowrap">'+sign+NF.format(t.amt/100)+' <span class="small muted">'+t.cur+'</span></span></button>';
}
function filteredTx(){
  var f=F.tx,q=f.q.trim().toLowerCase();
  var r=S.tx.filter(function(t){
    if(f.type&&t.type!==f.type)return false;
    if(f.acc&&t.acc!==f.acc&&t.to!==f.acc)return false;
    if(q){var h=((t.desc||'')+' '+(t.notes||'')+' '+(t.cat||'')).toLowerCase();if(h.indexOf(q)<0)return false;}
    return true;});
  var s=f.sort;
  r.sort(function(a,b){if(s==='date-asc')return -cmpDate(a,b);if(s==='amt-desc')return b.amt-a.amt;if(s==='amt-asc')return a.amt-b.amt;return cmpDate(a,b);});
  return r;
}
function txListHtml(){
  var r=filteredTx(),pages=Math.max(1,Math.ceil(r.length/PAGE)),f=F.tx;
  if(f.page>pages)f.page=pages;
  var slice=r.slice((f.page-1)*PAGE,f.page*PAGE);
  if(!r.length)return '<div class="empty"><p class="muted">'+(S.tx.length?'No transactions match these filters.':'No transactions yet. Tap Add to record one.')+'</p></div>';
  return '<div class="list">'+slice.map(txRow).join('')+'</div><div class="row between" style="margin-top:10px"><button class="btn sm" data-act="page" data-d="-1"'+(f.page<=1?' disabled':'')+'>Previous</button><span class="small muted">Page '+f.page+' of '+pages+' · '+r.length+' records</span><button class="btn sm" data-act="page" data-d="1"'+(f.page>=pages?' disabled':'')+'>Next</button></div>';
}
function vTx(){
  var f=F.tx;
  return '<div class="pagehead"><h1>Transactions</h1><button class="btn primary hide-m" data-act="add-tx">'+ic('plus')+'Add</button></div>'
   +'<div class="filters" style="margin-bottom:12px"><input type="search" id="txq" data-f="tx.q" placeholder="Search description, notes, category" value="'+esc(f.q)+'" aria-label="Search" style="flex-basis:100%">'
   +'<select data-f="tx.type" aria-label="Type"><option value="">All types</option>'+['income','expense','transfer'].map(function(x){return '<option value="'+x+'"'+(f.type===x?' selected':'')+'>'+cap(x)+'</option>';}).join('')+'</select>'
   +'<select data-f="tx.acc" aria-label="Account"><option value="">All accounts</option>'+S.accounts.map(function(a){return '<option value="'+a.id+'"'+(f.acc===a.id?' selected':'')+'>'+esc(a.name)+' ('+a.currency+')</option>';}).join('')+'</select>'
   +'<select data-f="tx.sort" aria-label="Sort">'+[['date-desc','Newest first'],['date-asc','Oldest first'],['amt-desc','Largest first'],['amt-asc','Smallest first']].map(function(o){return '<option value="'+o[0]+'"'+(f.sort===o[0]?' selected':'')+'>'+o[1]+'</option>';}).join('')+'</select></div>'
   +'<div class="card" id="txlist">'+txListHtml()+'</div>';
}

/* ---------- accounts ---------- */
function vAccounts(){
  var b=balances();
  var head='<div class="pagehead"><h1>Accounts</h1><div class="row"><button class="btn" data-act="transfer">'+ic('trf')+'Transfer</button><button class="btn primary" data-act="add-acc">'+ic('plus')+'Add account</button></div></div>';
  if(!S.accounts.length)return head+'<div class="card empty"><p class="muted">No accounts yet. Add one to start recording money in and out.</p><button class="btn" data-act="sample">Try with sample data</button></div>';
  var o=head+'<div class="grid c2">';
  S.accounts.forEach(function(a){
    o+='<div class="card"><div class="row between"><div class="grow"><h3>'+esc(a.name)+'</h3><div class="small muted">'+ATYPES[a.type]+' · opened '+fdate(a.created)+'</div></div><span class="chip '+a.currency+'">'+a.currency+'</span></div>'
     +'<div class="num" style="font-size:24px;margin:12px 0 2px">'+money(b[a.id],a.currency)+'</div><div class="small muted">Opening balance '+money(a.opening||0,a.currency)+'</div>'
     +'<div class="row" style="margin-top:12px"><button class="btn sm" data-act="edit-acc" data-id="'+a.id+'">Edit</button>'+(hasRecords(a.id)?'':'<button class="btn sm danger" data-act="del-acc" data-id="'+a.id+'">Delete</button>')+'</div></div>';
  });
  return o+'</div><p class="muted small" style="margin-top:12px">Balances are worked out from opening balance plus every record, so they cannot drift out of step. Transfers move money between your own accounts and are not counted as income or expense.</p>';
}

/* ---------- borrow & lend ---------- */
function vLoans(){
  var f=F.loans,list=S.loans.filter(function(l){return l.dir===f.tab;}).sort(function(a,b){return a.date<b.date?1:-1;});
  var sums={};CURS.forEach(function(c){sums[c]={amt:0,rep:0,rem:0};});
  list.forEach(function(l){var i=loanInfo(l),s=sums[l.cur];s.amt+=l.amt;s.rep+=i.repaid;s.rem+=i.rem;});
  var o='<div class="pagehead"><h1>Borrow &amp; Lend</h1><button class="btn primary" data-act="add-loan">'+ic('plus')+'New record</button></div>'
   +'<div class="tabs" style="margin-bottom:12px"><button data-act="ltab" data-t="lent" aria-pressed="'+(f.tab==='lent')+'">Money I lent</button><button data-act="ltab" data-t="borrowed" aria-pressed="'+(f.tab==='borrowed')+'">Money I borrowed</button></div>';
  var shown=CURS.filter(function(c){return sums[c].amt>0;});
  if(shown.length)o+='<div class="grid c2" style="margin-bottom:12px">'+shown.map(function(c){var s=sums[c];return '<div class="card kpi"><div class="row between"><div class="lbl">'+(f.tab==='lent'?'Receivable':'Payable')+' · '+c+'</div><span class="chip '+c+'">'+c+'</span></div><div class="val num '+(f.tab==='lent'?'info':'warn')+'">'+money(s.rem,c)+'</div><div class="small muted">of '+money(s.amt,c)+' · repaid '+money(s.rep,c)+'</div></div>';}).join('')+'</div>';
  if(!list.length)return o+'<div class="card empty"><p class="muted">'+(f.tab==='lent'?'Nothing lent out yet. Lending reduces the account you pay from and creates a receivable. It is not an expense.':'Nothing borrowed yet. Borrowing adds to the account you receive in and creates a payable. It is not income.')+'</p><button class="btn primary" data-act="add-loan">'+ic('plus')+'New record</button></div>';
  o+='<div class="stack">';
  list.forEach(function(l){
    var i=loanInfo(l),st=STL[i.status],a=acc(l.acc),p=Math.round(i.repaid/l.amt*100);
    o+='<div class="card"><div class="row between wrap"><div class="grow"><h3>'+esc(l.person)+'</h3><div class="small muted">'+(l.dir==='lent'?'Lent':'Borrowed')+' '+fdate(l.date)+(l.due?' · due '+fdate(l.due):'')+' · '+esc(a?a.name:'removed account')+'</div></div><span class="pill '+st[1]+'">'+st[0]+'</span></div>'
     +(l.desc?'<div style="margin-top:6px">'+esc(l.desc)+'</div>':'')
     +'<div class="row between" style="margin-top:12px"><div><div class="small muted">Remaining</div><div class="num" style="font-size:21px">'+money(i.rem,l.cur)+'</div></div><div style="text-align:right"><div class="small muted">Original</div><div class="num">'+money(l.amt,l.cur)+'</div></div></div>'
     +'<div class="bar" style="margin:10px 0 4px"><i style="width:'+p+'%"></i></div><div class="small muted">Repaid '+money(i.repaid,l.cur)+' ('+p+'%)</div>'
     +(l.reps.length?'<details style="margin-top:8px"><summary>Repayment history ('+l.reps.length+')</summary><div class="list">'+l.reps.slice().sort(function(x,y){return x.date<y.date?1:-1;}).map(function(r){var ra=acc(r.acc);return '<div class="item"><span class="grow"><div class="t num">'+money(r.amt,l.cur)+'</div><div class="s">'+fdate(r.date)+' · '+esc(ra?ra.name:'?')+(r.notes?' · '+esc(r.notes):'')+'</div></span><button class="btn ghost sm danger" data-act="del-rep" data-id="'+l.id+'" data-r="'+r.id+'">Remove</button></div>';}).join('')+'</div></details>':'')
     +'<div class="row wrap" style="margin-top:12px">'+(i.rem>0?'<button class="btn sm primary" data-act="repay" data-id="'+l.id+'">'+(l.dir==='lent'?'Record repayment received':'Record repayment made')+'</button>':'')+'<button class="btn sm" data-act="edit-loan" data-id="'+l.id+'">Edit</button><button class="btn sm danger" data-act="del-loan" data-id="'+l.id+'">Delete</button></div></div>';
  });
  return o+'</div>';
}

/* ---------- remittance ---------- */
function vRem(){
  var f=F.rem;if(!f.cur)f.cur=S.settings.cur;
  var cur=f.cur,other=cur==='AED'?'BDT':'AED',from=rangeStart(f.range);
  var all=S.remits.filter(function(r){return r.cur===cur&&r.date>=from;});
  var sent=0,fee=0,rv=0,rvBase=0,by={};
  all.forEach(function(r){sent+=r.amt;fee+=r.fee||0;if(r.recv>0){rv+=r.recv;rvBase+=r.amt;}
    var w=by[r.to]||(by[r.to]={n:0,amt:0,last:''});w.n++;w.amt+=r.amt;if(r.date>w.last)w.last=r.date;});
  var who=Object.keys(by).sort(function(a,b){return by[b].amt-by[a].amt;});
  if(f.who&&!by[f.who])f.who='';
  var list=all.filter(function(r){return !f.who||r.to===f.who;}).sort(cmpDate);
  var months=lastMonths(6),ms={};months.forEach(function(m){ms[m.key]=0;});
  S.remits.forEach(function(r){if(r.cur===cur){var k=r.date.slice(0,7);if(k in ms)ms[k]+=r.amt;}});
  var rl={month:'this month','30d':'last 30 days',year:'this year',all:'all time'}[f.range];
  var o='<div class="pagehead"><h1>Remittance</h1><button class="btn primary" data-act="add-rem">'+ic('send')+'Send money</button></div>'
   +'<div class="filters" style="margin-bottom:14px"><select data-f="rem.range" aria-label="Date range">'+[['month','This month'],['30d','Last 30 days'],['year','This year'],['all','All time']].map(function(x){return '<option value="'+x[0]+'"'+(f.range===x[0]?' selected':'')+'>'+x[1]+'</option>';}).join('')+'</select>'
   +'<select data-f="rem.cur" aria-label="Currency sent">'+CURS.map(function(c){return '<option'+(c===cur?' selected':'')+'>'+c+'</option>';}).join('')+'</select></div>';
  if(!S.remits.length)return o+'<div class="card empty"><h2>Track money you send home</h2><p class="muted">Record each transfer with who received it, the amount, the fee and the exchange rate. The amount leaves the account you pick. It is not counted as an expense.</p><button class="btn primary" data-act="add-rem">'+ic('send')+'Record first transfer</button></div>';
  o+='<div class="stack"><div class="card hero"><div class="lbl">Sent · '+rl+' · '+cur+'</div><div class="big num">'+money(sent,cur)+'</div><div class="chips">'
   +'<div class="mini"><div class="lbl">Transfers</div><div class="num">'+all.length+'</div></div>'
   +'<div class="mini"><div class="lbl">Fees paid</div><div class="num">'+money(fee,cur)+'</div></div>'
   +(rvBase>0?'<div class="mini"><div class="lbl">Average rate</div><div class="num">1 '+cur+' = '+(rv/rvBase).toFixed(2)+' '+other+'</div></div>':'')+'</div></div>'
   +'<div class="grid c2"><div class="card"><div class="row between"><h2>Sent each month</h2><span class="chip '+cur+'">'+cur+'</span></div>'+bars(months.map(function(m){return m.label;}),[months.map(function(m){return ms[m.key];})],['b-acc'],'Money sent each month, last 6 months')+'</div>'
   +'<div class="card"><h2>Who you send to</h2><div class="muted small" style="margin-bottom:6px">'+rl+' · tap a name to filter</div><div class="list">'
   +(who.length?who.map(function(w){var x=by[w],p=sent?Math.round(x.amt/sent*100):0;return '<button class="item" data-act="rem-who" data-who="'+esc(w)+'"'+(f.who===w?' style="background:var(--surface2);border-radius:10px"':'')+'><span class="grow"><div class="t">'+esc(w)+'</div><div class="s">'+x.n+' transfer'+(x.n>1?'s':'')+' · last '+fdate(x.last)+'</div><div class="bar" style="margin-top:6px"><i style="width:'+Math.max(p,3)+'%"></i></div></span><span class="num" style="white-space:nowrap">'+NF.format(x.amt/100)+' <span class="small muted">'+cur+'</span></span></button>';}).join(''):'<p class="muted">Nothing sent in this period.</p>')+'</div></div></div>'
   +'<div class="card"><div class="row between wrap"><h2>History'+(f.who?' · '+esc(f.who):'')+'</h2>'+(f.who?'<button class="btn sm" data-act="rem-clear">Show everyone</button>':'')+'</div><div class="list" style="margin-top:6px">'
   +(list.length?list.map(function(r){var a=acc(r.acc);return '<button class="item" data-act="edit-rem" data-id="'+r.id+'"><span class="ico transfer">'+ic('send')+'</span><span class="grow"><div class="t">'+esc(r.to)+(r.rel?' <span class="muted small">· '+esc(r.rel)+'</span>':'')+'</div><div class="s">'+fdate(r.date)+(r.method?' · '+esc(r.method):'')+' · '+esc(a?a.name:'?')+'</div></span><span style="text-align:right;white-space:nowrap"><div class="num">'+NF.format(r.amt/100)+' <span class="small muted">'+r.cur+'</span></div>'+(r.recv>0?'<div class="small muted num">→ '+NF.format(r.recv/100)+' '+r.recvCur+'</div>':'')+(r.fee>0?'<div class="small muted num">fee '+NF.format(r.fee/100)+'</div>':'')+'</span></button>';}).join(''):'<p class="muted">No transfers match.</p>')+'</div></div></div>';
  return o;
}

/* ---------- reports ---------- */
function vReports(){
  var r=F.rep;if(!r.cur)r.cur=S.settings.cur;if(!r.from)r.from=new Date().getFullYear()+'-01-01';if(!r.to)r.to=today();
  var cur=r.cur,txs=S.tx.filter(function(t){return t.cur===cur&&t.date>=r.from&&t.date<=r.to&&t.type!=='transfer';});
  var gk=function(d){return r.period==='day'?d:r.period==='week'?weekStart(d):r.period==='year'?d.slice(0,4):d.slice(0,7);};
  var g={};txs.forEach(function(t){var k=gk(t.date);g[k]=g[k]||{i:0,e:0};if(t.type==='income')g[k].i+=t.amt;else g[k].e+=t.amt;});
  var keys=Object.keys(g).sort().reverse(),cats={},ex=0;
  txs.forEach(function(t){if(t.type==='expense'){cats[t.cat||'Other']=(cats[t.cat||'Other']||0)+t.amt;ex+=t.amt;}});
  var catRows=Object.keys(cats).sort(function(a,c){return cats[c]-cats[a];});
  var b=balances();
  var o='<div class="pagehead"><h1>Reports</h1></div><div class="filters" style="margin-bottom:12px"><label class="f">From<input type="date" data-f="rep.from" value="'+r.from+'"></label><label class="f">To<input type="date" data-f="rep.to" value="'+r.to+'"></label>'
   +'<label class="f">Currency<select data-f="rep.cur">'+CURS.map(function(c){return '<option'+(c===cur?' selected':'')+'>'+c+'</option>';}).join('')+'</select></label>'
   +'<label class="f">Group by<select data-f="rep.period">'+[['day','Day'],['week','Week'],['month','Month'],['year','Year']].map(function(p){return '<option value="'+p[0]+'"'+(r.period===p[0]?' selected':'')+'>'+p[1]+'</option>';}).join('')+'</select></label></div><div class="stack">';
  o+='<div class="card"><h2>Income and expenses by '+r.period+'</h2><div class="tablewrap" style="margin-top:8px">'+(keys.length?'<table><thead><tr><th>'+(r.period==='week'?'Week of':'Period')+'</th><th class="r">Income</th><th class="r">Expenses</th><th class="r">Net</th></tr></thead><tbody>'+keys.map(function(k){var x=g[k],n=x.i-x.e;return '<tr><td>'+esc(r.period==='day'||r.period==='week'?fdate(k):k)+'</td><td class="r num inc">'+NF.format(x.i/100)+'</td><td class="r num exp">'+NF.format(x.e/100)+'</td><td class="r num">'+(n<0?'−':'')+NF.format(Math.abs(n)/100)+'</td></tr>';}).join('')+'</tbody></table>':'<p class="muted">No income or expenses in this range.</p>')+'</div></div>';
  o+='<div class="card"><h2>Spending by category</h2><div style="margin-top:10px">'+(catRows.length?catRows.map(function(c){return catBar(c,cats[c],ex,cur);}).join(''):'<p class="muted">No expenses in this range.</p>')+'</div></div>';
  o+='<div class="card"><h2>Account balances</h2><div class="tablewrap" style="margin-top:8px">'+(S.accounts.length?'<table><thead><tr><th>Account</th><th>Type</th><th class="r">Balance</th></tr></thead><tbody>'+S.accounts.map(function(a){return '<tr><td>'+esc(a.name)+'</td><td>'+ATYPES[a.type]+'</td><td class="r num">'+money(b[a.id],a.currency)+'</td></tr>';}).join('')+'</tbody></table>':'<p class="muted">No accounts.</p>')+'</div></div>';
  ['lent','borrowed'].forEach(function(d){
    var rows=CURS.map(function(c){var a=0,p=0,m=0,n=0;S.loans.forEach(function(l){if(l.dir!==d||l.cur!==c)return;var i=loanInfo(l);a+=l.amt;p+=i.repaid;m+=i.rem;n++;});return {c:c,a:a,p:p,m:m,n:n};}).filter(function(x){return x.n;});
    o+='<div class="card"><h2>'+(d==='lent'?'Lending summary (receivables)':'Borrowing summary (payables)')+'</h2><div class="tablewrap" style="margin-top:8px">'+(rows.length?'<table><thead><tr><th>Currency</th><th class="r">Records</th><th class="r">Original</th><th class="r">Repaid</th><th class="r">Outstanding</th></tr></thead><tbody>'+rows.map(function(x){return '<tr><td>'+x.c+'</td><td class="r num">'+x.n+'</td><td class="r num">'+NF.format(x.a/100)+'</td><td class="r num">'+NF.format(x.p/100)+'</td><td class="r num">'+NF.format(x.m/100)+'</td></tr>';}).join('')+'</tbody></table>':'<p class="muted">None recorded.</p>')+'</div></div>';
  });
  var reps=[];S.loans.forEach(function(l){l.reps.forEach(function(x){reps.push({l:l,r:x});});});reps.sort(function(a,c){return a.r.date<c.r.date?1:-1;});
  o+='<div class="card"><h2>Repayment history</h2><div class="tablewrap" style="margin-top:8px">'+(reps.length?'<table><thead><tr><th>Date</th><th>Person</th><th>Direction</th><th class="r">Amount</th><th>Account</th></tr></thead><tbody>'+reps.map(function(x){var a=acc(x.r.acc);return '<tr><td>'+fdate(x.r.date)+'</td><td>'+esc(x.l.person)+'</td><td>'+(x.l.dir==='lent'?'Received':'Paid')+'</td><td class="r num">'+money(x.r.amt,x.l.cur)+'</td><td>'+esc(a?a.name:'?')+'</td></tr>';}).join('')+'</tbody></table>':'<p class="muted">No repayments yet.</p>')+'</div></div>';
  var rr=S.remits.filter(function(x){return x.cur===cur&&x.date>=r.from&&x.date<=r.to;}),rb={};
  rr.forEach(function(x){var w=rb[x.to]||(rb[x.to]={n:0,a:0,f:0,v:0});w.n++;w.a+=x.amt;w.f+=x.fee||0;w.v+=x.recv||0;});
  var rk=Object.keys(rb).sort(function(a,c){return rb[c].a-rb[a].a;}),oc=cur==='AED'?'BDT':'AED';
  o+='<div class="card"><h2>Remittances by recipient</h2><div class="tablewrap" style="margin-top:8px">'+(rk.length?'<table><thead><tr><th>Sent to</th><th class="r">Transfers</th><th class="r">Sent ('+cur+')</th><th class="r">Fees</th><th class="r">Received ('+oc+')</th></tr></thead><tbody>'+rk.map(function(k){var w=rb[k];return '<tr><td>'+esc(k)+'</td><td class="r num">'+w.n+'</td><td class="r num">'+NF.format(w.a/100)+'</td><td class="r num">'+NF.format(w.f/100)+'</td><td class="r num">'+(w.v?NF.format(w.v/100):'–')+'</td></tr>';}).join('')+'</tbody></table>':'<p class="muted">No remittances in this range.</p>')+'</div></div>';
  o+='<div class="card"><h2>Export and backup</h2><p class="muted small">Files are offered for you to save after you confirm.</p><div class="row wrap"><button class="btn" data-act="exp-tx">'+ic('down')+'Transactions CSV</button><button class="btn" data-act="exp-loans">'+ic('down')+'Loans CSV</button><button class="btn" data-act="exp-rem">'+ic('down')+'Remittances CSV</button><button class="btn" data-act="backup">'+ic('down')+'Full backup</button></div></div></div>';
  return o;
}

/* ---------- settings ---------- */
function vPrefs(){
  var st=mode==='cloud'?'Saved privately to your Claude account. Other people with the link cannot see your records.':mode==='local'?'Saved in this browser only.':'Not saved. Open this page inside Claude to keep your data.';
  return '<div class="pagehead"><h1>Settings</h1></div><div class="stack">'
   +'<div class="card"><h2>Profile</h2><form class="form" data-form="prefs" style="margin-top:10px"><label class="f">Your name<input type="text" id="p-name" value="'+esc(S.settings.name)+'" maxlength="60" autocomplete="name"></label>'
   +'<label class="f">Default display currency<select id="p-cur">'+CURS.map(function(c){return '<option'+(S.settings.cur===c?' selected':'')+'>'+c+'</option>';}).join('')+'</select></label>'
   +'<div class="f" style="display:grid;gap:5px;font-size:13px;font-weight:600;color:var(--muted)">Theme<div class="seg" role="radiogroup" aria-label="Theme">'+['system','light','dark'].map(function(t){return '<label><input type="radio" name="theme" value="'+t+'"'+(S.settings.theme===t?' checked':'')+'><span>'+cap(t)+'</span></label>';}).join('')+'</div></div>'
   +'<button class="btn primary" type="submit">Save settings</button></form></div>'
   +'<div class="card"><h2>Your data</h2><p class="muted">'+st+'</p><div class="row wrap"><button class="btn" data-act="backup">'+ic('down')+'Download backup</button><label class="btn" for="restoreFile" style="cursor:pointer">'+ic('up')+'Restore backup</label><input type="file" id="restoreFile" accept=".json,application/json" hidden></div>'
   +'<div class="row wrap" style="margin-top:12px"><button class="btn danger" data-act="clear">Delete all my data</button></div></div>'
   +'<div class="notice">Amounts are stored as whole minor units (fils and poisha), never as decimals, so totals stay exact. Balances are always calculated from your records.</div></div>';
}

/* ---------- sheets ---------- */
function openSheet(title,html,mount){
  $('#sheetTitle').textContent=title;$('#sheetBody').innerHTML=html;$('#overlay').hidden=false;document.body.classList.add('lock');
  if(mount)mount();
  var f=$('#sheetBody').querySelector('input[type=text],input:not([type=radio]):not([type=hidden]),select');if(f&&!/Android|iPhone|iPad/.test(navigator.userAgent))f.focus();
}
function closeSheet(){$('#overlay').hidden=true;$('#sheetBody').innerHTML='';document.body.classList.remove('lock');}
function accOpts(sel,cur){return S.accounts.filter(function(a){return !cur||a.currency===cur;}).map(function(a){return '<option value="'+a.id+'" data-cur="'+a.currency+'"'+(a.id===sel?' selected':'')+'>'+esc(a.name)+' ('+a.currency+')</option>';}).join('');}
function confirmSheet(title,msg,act,data){
  openSheet(title,'<p>'+esc(msg)+'</p><div class="row wrap"><button class="btn danger" data-act="'+act+'" '+data+'>Yes, delete</button><button class="btn" data-act="close">Cancel</button></div>');
}

function txSheet(id,forceType){
  var t=id?S.tx.find(function(x){return x.id===id;}):null;
  if(!S.accounts.length){toast('Add an account first.');return accSheet();}
  var type=t?t.type:(forceType||'expense');
  openSheet(t?'Edit transaction':'Add transaction',
   '<form class="form" data-form="tx" data-id="'+(t?t.id:'')+'" novalidate>'
   +'<div class="seg" role="radiogroup" aria-label="Type">'+['expense','income','transfer'].map(function(x){return '<label><input type="radio" name="type" value="'+x+'"'+(x===type?' checked':'')+'><span>'+cap(x)+'</span></label>';}).join('')+'</div>'
   +'<label class="f">Amount<div class="amt"><input type="text" id="f-amt" inputmode="decimal" autocomplete="off" placeholder="0.00" value="'+(t?inputAmt(t.amt):'')+'"><span class="chip" id="f-cur"></span></div></label>'
   +'<label class="f"><span id="l-acc">Account</span><select id="f-acc">'+accOpts(t?t.acc:F.dash.acc||'')+'</select></label>'
   +'<label class="f" id="w-to"><span>To account</span><select id="f-to">'+accOpts(t&&t.to?t.to:'')+'</select></label>'
   +'<label class="f" id="w-cat"><span>Category</span><select id="f-cat"></select></label>'
   +'<div class="two"><label class="f">Date<input type="date" id="f-date" value="'+(t?t.date:today())+'"></label><label class="f">Description<input type="text" id="f-desc" maxlength="120" value="'+esc(t?t.desc:'')+'" placeholder="Optional"></label></div>'
   +'<label class="f">Notes<textarea id="f-notes" maxlength="500" placeholder="Optional">'+esc(t?t.notes:'')+'</textarea></label>'
   +'<p class="err" id="f-err" role="alert"></p>'
   +'<div class="row wrap"><button class="btn primary" type="submit">Save</button>'+(t?'<button class="btn danger" type="button" data-act="ask-del-tx" data-id="'+t.id+'">Delete</button>':'')+'</div></form>',
   function(){
     var form=$('#sheetBody form');
     function sync(){
       var ty=form.querySelector('input[name=type]:checked').value,sel=$('#f-acc'),ac=acc(sel.value);
       $('#w-to').hidden=ty!=='transfer';$('#w-cat').hidden=ty==='transfer';$('#l-acc').textContent=ty==='transfer'?'From account':'Account';
       var cats=ty==='income'?INC:EXP,cs=$('#f-cat'),keep=t&&t.cat?t.cat:cs.value;
       cs.innerHTML=cats.map(function(c){return '<option'+(c===keep?' selected':'')+'>'+c+'</option>';}).join('');
       var c=ac?ac.currency:'';$('#f-cur').textContent=c;$('#f-cur').className='chip '+c;
     }
     form.addEventListener('change',function(e){if(e.target.name==='type'||e.target.id==='f-acc')sync();});
     sync();
   });
}
function accSheet(id){
  var a=id?acc(id):null,locked=a&&hasRecords(a.id);
  openSheet(a?'Edit account':'Add account','<form class="form" data-form="acc" data-id="'+(a?a.id:'')+'" novalidate>'
   +'<label class="f">Account name<input type="text" id="a-name" maxlength="80" value="'+esc(a?a.name:'')+'" placeholder="e.g. Emirates NBD current"></label>'
   +'<div class="two"><label class="f">Type<select id="a-type">'+Object.keys(ATYPES).map(function(k){return '<option value="'+k+'"'+(a&&a.type===k?' selected':'')+'>'+ATYPES[k]+'</option>';}).join('')+'</select></label>'
   +'<label class="f">Currency<select id="a-cur"'+(a?' disabled':'')+'>'+CURS.map(function(c){return '<option'+(a?(a.currency===c?' selected':''):(S.settings.cur===c?' selected':''))+'>'+c+'</option>';}).join('')+'</select></label></div>'
   +'<label class="f">Opening balance<input type="text" id="a-open" inputmode="decimal" placeholder="0.00" value="'+(a?inputAmt(a.opening||0):'')+'"><span class="hint">'+(locked?'Changing this changes the current balance by the same amount.':'The balance when you start tracking. Credit cards can start negative.')+'</span></label>'
   +'<p class="err" id="f-err" role="alert"></p><button class="btn primary" type="submit">Save account</button></form>');
}
function loanSheet(id){
  var l=id?S.loans.find(function(x){return x.id===id;}):null;
  if(!l&&!S.accounts.length){toast('Add an account first.');return accSheet();}
  var people={};S.loans.forEach(function(x){people[x.person]=1;});
  var dl='<datalist id="people">'+Object.keys(people).map(function(p){return '<option value="'+esc(p)+'">';}).join('')+'</datalist>';
  var type=l?l.dir:F.loans.tab;
  openSheet(l?'Edit record':'New borrow or lend record','<form class="form" data-form="loan" data-id="'+(l?l.id:'')+'" novalidate>'
   +(l?'<div class="notice">'+(l.dir==='lent'?'Lent':'Borrowed')+' '+money(l.amt,l.cur)+' on '+fdate(l.date)+'. Amount, account and dates of the original loan stay fixed so balances remain correct.</div>':'<div class="seg" role="radiogroup" aria-label="Direction"><label><input type="radio" name="dir" value="lent"'+(type==='lent'?' checked':'')+'><span>I lent</span></label><label><input type="radio" name="dir" value="borrowed"'+(type==='borrowed'?' checked':'')+'><span>I borrowed</span></label></div>')
   +'<label class="f"><span id="l-person">'+(type==='borrowed'?'Lender':'Person')+' name</span><input type="text" id="l-person-in" list="people" maxlength="80" value="'+esc(l?l.person:'')+'" autocomplete="off"></label>'+dl
   +'<label class="f">Contact details<input type="text" id="l-contact" maxlength="120" value="'+esc(l?l.contact:'')+'" placeholder="Optional: phone or email"></label>'
   +(l?'':'<label class="f">Amount<div class="amt"><input type="text" id="l-amt" inputmode="decimal" placeholder="0.00" autocomplete="off"><span class="chip" id="f-cur"></span></div></label>'
   +'<label class="f"><span id="l-acc">Paid from account</span><select id="l-accsel">'+accOpts('')+'</select></label>'
   +'<div class="two"><label class="f"><span id="l-date-l">Date lent</span><input type="date" id="l-date" value="'+today()+'"></label><label class="f">Expected repayment<input type="date" id="l-due"></label></div>')
   +(l?'<label class="f">Expected repayment<input type="date" id="l-due" value="'+(l.due||'')+'"></label>':'')
   +'<label class="f">Description<input type="text" id="l-desc" maxlength="120" value="'+esc(l?l.desc:'')+'" placeholder="Optional"></label>'
   +'<label class="f">Notes<textarea id="l-notes" maxlength="500">'+esc(l?l.notes:'')+'</textarea></label>'
   +'<p class="err" id="f-err" role="alert"></p><button class="btn primary" type="submit">Save</button></form>',
   function(){
     var form=$('#sheetBody form');
     function sync(){
       var r=form.querySelector('input[name=dir]:checked'),d=r?r.value:(l?l.dir:'lent');
       var pl=$('#l-person'),ac=$('#l-acc'),dl2=$('#l-date-l');
       if(pl)pl.textContent=(d==='borrowed'?'Lender':'Person')+' name';
       if(ac)ac.textContent=d==='borrowed'?'Received into account':'Paid from account';
       if(dl2)dl2.textContent=d==='borrowed'?'Date borrowed':'Date lent';
       var s=$('#l-accsel');if(s){var a=acc(s.value),c=a?a.currency:'';$('#f-cur').textContent=c;$('#f-cur').className='chip '+c;}
     }
     form.addEventListener('change',sync);sync();
   });
}
function repaySheet(id){
  var l=S.loans.find(function(x){return x.id===id;});if(!l)return;var i=loanInfo(l);
  openSheet(l.dir==='lent'?'Repayment received':'Repayment made','<form class="form" data-form="rep" data-id="'+l.id+'" novalidate>'
   +'<div class="notice">'+esc(l.person)+' · remaining '+money(i.rem,l.cur)+'</div>'
   +'<label class="f">Amount ('+l.cur+')<input type="text" id="r-amt" inputmode="decimal" value="'+inputAmt(i.rem)+'"></label>'
   +'<label class="f">'+(l.dir==='lent'?'Received into account':'Paid from account')+'<select id="r-acc">'+accOpts(l.acc,l.cur)+'</select></label>'
   +'<label class="f">Date<input type="date" id="r-date" value="'+today()+'"></label>'
   +'<label class="f">Notes<input type="text" id="r-notes" maxlength="200" placeholder="Optional"></label>'
   +'<p class="err" id="f-err" role="alert"></p><button class="btn primary" type="submit">Save repayment</button></form>');
}

function remSheet(id){
  var r=id?S.remits.find(function(x){return x.id===id;}):null;
  if(!S.accounts.length){toast('Add an account first.');return accSheet();}
  var ppl={},meth={'Bank transfer':1,'Exchange house':1,'Western Union':1,'Wise':1,'Remitly':1,'bKash':1,'Cash through agent':1};
  S.remits.forEach(function(x){ppl[x.to]=1;if(x.method)meth[x.method]=1;});
  var RELS=['Parent','Spouse','Child','Sibling','Relative','Friend','Other'];
  openSheet(r?'Edit remittance':'Send money home','<form class="form" data-form="rem" data-id="'+(r?r.id:'')+'" novalidate>'
   +'<label class="f">Sent to<input type="text" id="m-who" list="m-people" maxlength="80" autocomplete="off" placeholder="Name of the person" value="'+esc(r?r.to:'')+'"></label><datalist id="m-people">'+Object.keys(ppl).map(function(p){return '<option value="'+esc(p)+'">';}).join('')+'</datalist>'
   +'<label class="f">Relationship<select id="m-rel">'+RELS.map(function(x){return '<option'+(r&&r.rel===x?' selected':'')+'>'+x+'</option>';}).join('')+'</select></label>'
   +'<label class="f">Paid from account<select id="m-acc">'+accOpts(r?r.acc:(F.dash.acc||''))+'</select></label>'
   +'<label class="f">Amount sent<div class="amt"><input type="text" id="m-amt" inputmode="decimal" autocomplete="off" placeholder="0.00" value="'+(r?inputAmt(r.amt):'')+'"><span class="chip" id="m-cur1"></span></div></label>'
   +'<div class="two"><label class="f">Fee charged<input type="text" id="m-fee" inputmode="decimal" placeholder="0.00" value="'+(r&&r.fee?inputAmt(r.fee):'')+'"></label>'
   +'<label class="f"><span id="m-rate-l">Exchange rate</span><input type="text" id="m-rate" inputmode="decimal" placeholder="Optional" value="'+(r&&r.rate?String(r.rate):'')+'"></label></div>'
   +'<label class="f"><span id="m-recv-l">Recipient receives</span><div class="amt"><input type="text" id="m-recv" inputmode="decimal" placeholder="Optional" value="'+(r&&r.recv?inputAmt(r.recv):'')+'"><span class="chip" id="m-cur2"></span></div></label>'
   +'<div class="two"><label class="f">Date<input type="date" id="m-date" value="'+(r?r.date:today())+'"></label><label class="f">Method<input type="text" id="m-method" list="m-meths" maxlength="60" placeholder="Optional" value="'+esc(r?r.method:'')+'"></label></div>'
   +'<datalist id="m-meths">'+Object.keys(meth).map(function(p){return '<option value="'+esc(p)+'">';}).join('')+'</datalist>'
   +'<label class="f">Reference number<input type="text" id="m-ref" maxlength="60" placeholder="Optional" value="'+esc(r?r.ref:'')+'"></label>'
   +'<label class="f">Notes<textarea id="m-notes" maxlength="500">'+esc(r?r.notes:'')+'</textarea></label>'
   +'<p class="err" id="f-err" role="alert"></p><div class="row wrap"><button class="btn primary" type="submit">Save</button>'+(r?'<button class="btn danger" type="button" data-act="ask-del-rem" data-id="'+r.id+'">Delete</button>':'')+'</div></form>',
   function(){
     var form=$('#sheetBody form');
     function sync(){var a=acc($('#m-acc').value),c=a?a.currency:'AED',o=c==='AED'?'BDT':'AED';
       $('#m-cur1').textContent=c;$('#m-cur1').className='chip '+c;$('#m-cur2').textContent=o;$('#m-cur2').className='chip '+o;
       $('#m-rate-l').textContent='Exchange rate (1 '+c+' = ? '+o+')';$('#m-recv-l').textContent='Recipient receives ('+o+')';}
     form.addEventListener('change',function(e){if(e.target.id==='m-acc')sync();});
     form.addEventListener('input',function(e){
       var id=e.target.id,amt=parseAmt($('#m-amt').value),rt=parseRate($('#m-rate').value),rv=parseAmt($('#m-recv').value);
       if(id==='m-recv'){if(amt&&rv)$('#m-rate').value=(rv/amt).toFixed(4).replace(/0+$/,'').replace(/\.$/,'');}
       else if(id==='m-amt'||id==='m-rate'){if(amt&&rt)$('#m-recv').value=inputAmt(Math.round(amt*rt));else if(id==='m-amt'&&amt&&rv)$('#m-rate').value=(rv/amt).toFixed(4).replace(/0+$/,'').replace(/\.$/,'');}
     });
     sync();
   });
}
function parseRate(s){s=String(s||'').trim();if(!s)return 0;var m=/^\d+(\.\d{1,6})?$/.exec(s);if(!m)return null;var v=parseFloat(s);return v>0&&v<1e6?v:null;}
function submitRem(form){
  var id=form.dataset.id,who=$('#m-who').value.trim();if(!who)return err('Enter who you are sending to.');
  var a=acc($('#m-acc').value);if(!a)return err('Choose an account.');
  var amt=parseAmt($('#m-amt').value);if(!amt||amt<=0)return err('Enter the amount sent, for example 1500.00.');
  var fee=parseAmt($('#m-fee').value||'0');if(fee==null)return err('Fee must be a number such as 15.00, or leave it empty.');
  var rate=parseRate($('#m-rate').value);if(rate==null)return err('Exchange rate must be a number such as 33.15, or leave it empty.');
  var rv=$('#m-recv').value.trim()?parseAmt($('#m-recv').value):0;if(rv==null)return err('Amount received must be a number, or leave it empty.');
  var date=$('#m-date').value;if(!validDate(date))return err('Choose a valid date.');
  var o={id:id||uuid(),date:date,to:who,rel:$('#m-rel').value,method:$('#m-method').value.trim(),ref:$('#m-ref').value.trim(),acc:a.id,cur:a.currency,amt:amt,fee:fee,rate:rate,recv:rv,recvCur:a.currency==='AED'?'BDT':'AED',notes:$('#m-notes').value.trim(),created:Date.now()};
  if(id){var ix=S.remits.findIndex(function(x){return x.id===id;});if(ix<0)return err('This record no longer exists.');o.created=S.remits[ix].created||o.created;S.remits[ix]=o;}
  else S.remits.push(o);
  closeSheet();commit();toast(id?'Remittance updated':'Remittance saved');return true;
}
function expRem(){
  var rows=[['id','date','sent_to','relationship','method','reference','account','amount_sent','fee','currency','exchange_rate','amount_received','received_currency','notes']];
  S.remits.slice().sort(cmpDate).forEach(function(r){rows.push([r.id,r.date,r.to,r.rel,r.method,r.ref,an(r.acc),(r.amt/100).toFixed(2),((r.fee||0)/100).toFixed(2),r.cur,r.rate||'',r.recv?(r.recv/100).toFixed(2):'',r.recv?r.recvCur:'',r.notes]);});
  save('my-wallet-remittances-'+today()+'.csv',csv(rows));
}

/* ---------- form handlers ---------- */
function err(m){var e=$('#f-err');if(e)e.textContent=m;return false;}
function submitTx(form){
  var id=form.dataset.id,type=form.querySelector('input[name=type]:checked').value,amt=parseAmt($('#f-amt').value);
  if(!amt||amt<=0)return err('Enter an amount greater than zero, for example 25.50.');
  var a=acc($('#f-acc').value);if(!a)return err('Choose an account.');
  var date=$('#f-date').value;if(!validDate(date))return err('Choose a valid date.');
  var o={id:id||uuid(),type:type,amt:amt,cur:a.currency,acc:a.id,to:'',cat:'',date:date,desc:$('#f-desc').value.trim(),notes:$('#f-notes').value.trim(),created:Date.now()};
  if(type==='transfer'){
    var to=acc($('#f-to').value);if(!to)return err('Choose the account to move money into.');
    if(to.id===a.id)return err('Pick two different accounts.');
    if(to.currency!==a.currency)return err('Transfers must stay in one currency. '+a.currency+' and '+to.currency+' are never converted automatically.');
    o.to=to.id;
  }else o.cat=$('#f-cat').value;
  if(id){var ix=S.tx.findIndex(function(x){return x.id===id;});if(ix<0)return err('This record no longer exists.');o.created=S.tx[ix].created||o.created;S.tx[ix]=o;}
  else S.tx.push(o);
  closeSheet();commit();toast(id?'Transaction updated':'Transaction saved');return true;
}
function submitAcc(form){
  var id=form.dataset.id,name=$('#a-name').value.trim();if(!name)return err('Give the account a name.');
  var open=parseAmt($('#a-open').value||'0',true);if(open==null)return err('Opening balance must be a number such as 1500.00.');
  if(id){var a=acc(id);a.name=name;a.type=$('#a-type').value;a.opening=open;}
  else S.accounts.push({id:uuid(),name:name,type:$('#a-type').value,currency:$('#a-cur').value,opening:open,created:today()});
  closeSheet();commit();toast('Account saved');return true;
}
function submitLoan(form){
  var id=form.dataset.id,person=$('#l-person-in').value.trim();if(!person)return err('Enter the person’s name.');
  if(id){var l=S.loans.find(function(x){return x.id===id;});l.person=person;l.contact=$('#l-contact').value.trim();l.due=$('#l-due').value;l.desc=$('#l-desc').value.trim();l.notes=$('#l-notes').value.trim();closeSheet();commit();toast('Record updated');return true;}
  var amt=parseAmt($('#l-amt').value);if(!amt||amt<=0)return err('Enter an amount greater than zero.');
  var a=acc($('#l-accsel').value);if(!a)return err('Choose an account.');
  var date=$('#l-date').value,due=$('#l-due').value;if(!validDate(date))return err('Choose a valid date.');
  if(due&&(!validDate(due)||due<date))return err('Repayment date cannot be before the loan date.');
  var dir=form.querySelector('input[name=dir]:checked').value;
  S.loans.push({id:uuid(),dir:dir,person:person,contact:$('#l-contact').value.trim(),amt:amt,cur:a.currency,acc:a.id,date:date,due:due,desc:$('#l-desc').value.trim(),notes:$('#l-notes').value.trim(),reps:[]});
  F.loans.tab=dir;closeSheet();commit();toast('Record saved');return true;
}
function submitRep(form){
  var l=S.loans.find(function(x){return x.id===form.dataset.id;});if(!l)return err('This loan no longer exists.');
  var i=loanInfo(l),amt=parseAmt($('#r-amt').value);
  if(!amt||amt<=0)return err('Enter an amount greater than zero.');
  if(amt>i.rem)return err('That is more than the remaining '+money(i.rem,l.cur)+'.');
  var a=acc($('#r-acc').value);if(!a||a.currency!==l.cur)return err('Choose an account in '+l.cur+'.');
  var date=$('#r-date').value;if(!validDate(date))return err('Choose a valid date.');
  l.reps.push({id:uuid(),amt:amt,acc:a.id,date:date,notes:$('#r-notes').value.trim()});
  closeSheet();commit();toast('Repayment saved');return true;
}
function submitPrefs(form){
  S.settings.name=$('#p-name').value.trim();S.settings.cur=$('#p-cur').value;S.settings.theme=form.querySelector('input[name=theme]:checked').value;
  F.dash.cur=null;F.rep.cur=null;commit();toast('Settings saved');
}

/* ---------- export / backup ---------- */
function csvCell(v){v=String(v==null?'':v);return /[",\n\r]/.test(v)||/^[=+\-@]/.test(v)?'"'+(/^[=+\-@]/.test(v)?"'":'')+v.replace(/"/g,'""')+'"':v;}
function csv(rows){return rows.map(function(r){return r.map(csvCell).join(',');}).join('\r\n');}
function save(name,data){
  var type=/\.json$/.test(name)?'application/json':'text/csv';
  var blob=new Blob([data],{type:type+';charset=utf-8'});
  try{
    var file=new File([blob],name,{type:type});
    if(navigator.canShare&&navigator.canShare({files:[file]})){
      navigator.share({files:[file],title:name}).then(function(){toast('File saved');},function(e){if(e&&e.name!=='AbortError')dl();});
      return;
    }
  }catch(e){}
  dl();
  function dl(){
    try{var u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();
      setTimeout(function(){URL.revokeObjectURL(u);a.remove();},2000);toast('File saved');}
    catch(e){toast('Could not save the file.');}
  }
}
function an(id){var a=acc(id);return a?a.name:'';}
function expTx(){
  var rows=[['id','date','type','amount','currency','account','to_account','category','description','notes']];
  S.tx.slice().sort(cmpDate).forEach(function(t){rows.push([t.id,t.date,t.type,(t.amt/100).toFixed(2),t.cur,an(t.acc),an(t.to),t.cat,t.desc,t.notes]);});
  save('my-wallet-transactions-'+today()+'.csv',csv(rows));
}
function expLoans(){
  var rows=[['record','loan_id','direction','person','contact','amount','currency','date','due_or_paid_date','account','status','remaining','notes']];
  S.loans.forEach(function(l){var i=loanInfo(l);rows.push(['loan',l.id,l.dir,l.person,l.contact,(l.amt/100).toFixed(2),l.cur,l.date,l.due,an(l.acc),i.status,(i.rem/100).toFixed(2),l.notes]);l.reps.forEach(function(r){rows.push(['repayment',l.id,l.dir,l.person,'',(r.amt/100).toFixed(2),l.cur,r.date,r.date,an(r.acc),'','',r.notes]);});});
  save('my-wallet-loans-'+today()+'.csv',csv(rows));
}
function backup(){save('my-wallet-backup-'+today()+'.json',JSON.stringify({app:'my-wallet',version:1,exportedAt:new Date().toISOString(),data:S},null,1));}

/* ---------- sample data ---------- */
function sample(){
  var n=new Date(),d=function(back){var x=new Date(n.getFullYear(),n.getMonth(),n.getDate()-back);return ymd(x);},
      A=function(name,type,cur,open){return {id:uuid(),name:name,type:type,currency:cur,opening:open,created:d(120)};};
  var cash=A('Wallet cash (sample)','cash','AED',200000),bank=A('Current account (sample)','bank','AED',350000),home=A('Home account (sample)','bank','BDT',2500000);
  S.accounts.push(cash,bank,home);
  var T=function(type,amt,a,cat,back,desc,to){S.tx.push({id:uuid(),type:type,amt:amt,cur:a.currency,acc:a.id,to:to?to.id:'',cat:cat||'',date:d(back),desc:desc||'',notes:'',created:Date.now()-back});};
  for(var m=0;m<5;m++){var o=m*30;T('income',580000,bank,'Salary',o+2,'Monthly salary (sample)');T('expense',210000,bank,'Rent',o+4,'Room rent (sample)');T('expense',32000+m*2500,cash,'Food',o+8,'Groceries (sample)');T('expense',9500,cash,'Transport',o+11,'Metro card (sample)');T('expense',18000+m*1000,bank,'Bills',o+14,'DEWA and internet (sample)');}
  T('expense',24000,cash,'Shopping',5,'Shoes (sample)');T('transfer',100000,bank,'',9,'Cash withdrawal (sample)',cash);
  S.loans.push({id:uuid(),dir:'lent',person:'Rahim (sample)',contact:'',amt:150000,cur:'AED',acc:bank.id,date:d(40),due:d(5),desc:'Short loan',notes:'',reps:[{id:uuid(),amt:50000,acc:bank.id,date:d(20),notes:'First part'}]});
  S.loans.push({id:uuid(),dir:'borrowed',person:'Karim (sample)',contact:'',amt:800000,cur:'BDT',acc:home.id,date:d(30),due:'',desc:'Family help',notes:'',reps:[]});
  var R=function(back,who,rel,amt,fee,rate,method){S.remits.push({id:uuid(),date:d(back),to:who,rel:rel,method:method,ref:'',acc:bank.id,cur:'AED',amt:amt,fee:fee,rate:rate,recv:Math.round(amt*rate),recvCur:'BDT',notes:'',created:Date.now()-back});};
  R(3,'Mother (sample)','Parent',150000,1500,33.1,'Bank transfer');R(18,'Brother (sample)','Sibling',50000,1200,33.0,'Western Union');
  R(33,'Mother (sample)','Parent',150000,1500,33.2,'Bank transfer');R(63,'Mother (sample)','Parent',140000,1500,32.9,'Bank transfer');R(95,'Brother (sample)','Sibling',60000,1200,32.8,'Western Union');
  commit();toast('Sample data added. Clear it any time in Settings.');
}

/* ---------- events ---------- */
document.addEventListener('click',function(e){try{onClick(e);}catch(x){toast('Something went wrong: '+(x&&x.message||x));}});
function onClick(e){
  var el=e.target.closest('[data-act]');if(!el)return;var a=el.dataset.act,id=el.dataset.id;
  if(a==='nav'){go(el.dataset.v);}
  else if(a==='add-tx')txSheet();
  else if(a==='edit-tx')txSheet(id);
  else if(a==='transfer')txSheet(null,'transfer');
  else if(a==='ask-del-tx')confirmSheet('Delete transaction?','This removes the record and updates your balance.','del-tx','data-id="'+id+'"');
  else if(a==='del-tx'){S.tx=S.tx.filter(function(t){return t.id!==id;});closeSheet();commit();toast('Transaction deleted');}
  else if(a==='add-acc')accSheet();
  else if(a==='edit-acc')accSheet(id);
  else if(a==='del-acc'){S.accounts=S.accounts.filter(function(x){return x.id!==id;});commit();toast('Account deleted');}
  else if(a==='add-loan')loanSheet();
  else if(a==='edit-loan')loanSheet(id);
  else if(a==='repay')repaySheet(id);
  else if(a==='del-loan')confirmSheet('Delete this record?','The loan and its repayments are removed, and the related account balances change back.','do-del-loan','data-id="'+id+'"');
  else if(a==='do-del-loan'){S.loans=S.loans.filter(function(l){return l.id!==id;});closeSheet();commit();toast('Record deleted');}
  else if(a==='del-rep'){var l=S.loans.find(function(x){return x.id===id;});if(l){l.reps=l.reps.filter(function(r){return r.id!==el.dataset.r;});commit();toast('Repayment removed');}}
  else if(a==='ltab'){F.loans.tab=el.dataset.t;render();}
  else if(a==='page'){F.tx.page+=parseInt(el.dataset.d,10);$('#txlist').innerHTML=txListHtml();}
  else if(a==='sample')sample();
  else if(a==='exp-tx')expTx();
  else if(a==='exp-loans')expLoans();
  else if(a==='backup')backup();
  else if(a==='clear')confirmSheet('Delete all data?','Every account, transaction and loan is removed. Download a backup first if you may want it back.','do-clear','');
  else if(a==='do-clear'){S=blank();closeSheet();commit();toast('All data deleted');}
  else if(a==='add-rem')remSheet();
  else if(a==='edit-rem')remSheet(id);
  else if(a==='ask-del-rem')confirmSheet('Delete remittance?','This removes the record and the amount returns to the account balance.','del-rem','data-id="'+id+'"');
  else if(a==='del-rem'){S.remits=S.remits.filter(function(r){return r.id!==id;});closeSheet();commit();toast('Remittance deleted');}
  else if(a==='rem-who'){F.rem.who=F.rem.who===el.dataset.who?'':el.dataset.who;render();}
  else if(a==='rem-clear'){F.rem.who='';render();}
  else if(a==='exp-rem')expRem();
  else if(a==='close')closeSheet();
}
$('#overlay').addEventListener('click',function(e){if(e.target.id==='overlay')closeSheet();});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!$('#overlay').hidden)closeSheet();});
document.addEventListener('submit',function(e){try{onSubmit(e);}catch(x){err('Something went wrong: '+(x&&x.message||x));}});
function onSubmit(e){
  var f=e.target.closest('form[data-form]');if(!f)return;e.preventDefault();err('');
  var k=f.dataset.form,btn=f.querySelector('button[type=submit]');
  if(btn&&btn.disabled)return;
  var ok;
  if(k==='tx')ok=submitTx(f);else if(k==='acc')ok=submitAcc(f);else if(k==='loan')ok=submitLoan(f);else if(k==='rep')ok=submitRep(f);else if(k==='rem')ok=submitRem(f);else if(k==='prefs')submitPrefs(f);
  if(ok===false&&btn){btn.disabled=false;}
}
function onFilter(e){
  var t=e.target;if(!t.dataset||!t.dataset.f)return;var p=t.dataset.f.split('.');
  F[p[0]][p[1]]=t.value;
  if(p[0]==='tx'){F.tx.page=1;$('#txlist').innerHTML=txListHtml();}
  else{if(p[0]==='dash'&&p[1]==='cur')F.dash.acc='';render();}
}
document.addEventListener('input',function(e){if(e.target.id==='txq')onFilter(e);});
document.addEventListener('change',function(e){
  if(e.target.id==='restoreFile'){
    var file=e.target.files&&e.target.files[0];if(!file)return;
    var rd=new FileReader();rd.onload=function(){
      try{var j=JSON.parse(rd.result),d=j&&j.app==='my-wallet'?j.data:null;if(!d||!Array.isArray(d.accounts))throw 0;
        var m=migrate(d);S=m;commit();toast('Backup restored');}catch(x){toast('That file is not a My Wallet backup.');}
    };rd.readAsText(file);e.target.value='';return;
  }
  if(e.target.id!=='txq')onFilter(e);
});
window.addEventListener('hashchange',function(){var h=location.hash.slice(1);if(NAV.some(function(n){return n[0]===h;})&&h!==view){view=h;render();}});

/* ---------- boot ---------- */
function boot(){
  buildChrome();
  var h=location.hash.slice(1);if(NAV.some(function(n){return n[0]===h;}))view=h;
  render();
  var timer=setTimeout(function(){if(!loaded){slow=true;render();}},10000);
  function ready(){clearTimeout(timer);loaded=true;render();}
  function local(){
    try{var raw=localStorage.getItem('mywallet-local');if(raw){S=migrate(JSON.parse(raw));mode='local';}else mode='local';
      localStorage.setItem('mywallet-probe','1');localStorage.removeItem('mywallet-probe');}catch(e){mode='memory';}
    ready();
  }
  if(!(window.claude&&window.claude.use)){local();return;}
  Promise.all([window.claude.use('db'),window.claude.use('user')]).then(function(r){
    var db=r[0],user=r[1];if(!db||!user)return local();
    return user.id().then(function(uid){
      if(!uid)return local();
      docRef=db.doc('data/users/'+uid+'/wallet');mode='cloud';
      docRef.onSnapshot(function(snap){
        if(inflight>0||(snap.metadata&&snap.metadata.hasPendingWrites))return;
        if(snap.exists)S=migrate(snap.data());
        clearTimeout(timer);loaded=true;slow=false;render();
      },function(){docRef=null;local();});
    });
  }).catch(function(){local();});
}
boot();
})();
