/* dash.js – werking van de makelaarsomgeving (dashboard/index.html) */

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const eur=(n,d=2)=>"€ "+n.toLocaleString("nl-NL",{minimumFractionDigits:d,maximumFractionDigits:d});
const int=n=>n.toLocaleString("nl-NL");
const tIcons={ok:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',warn:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 7v6M12 17h.01"/></svg>'};
let tt;function toast(m,kind){const t=$("#toast");kind=kind||"ok";t.className="toast"+(kind==="warn"?" warn":"");$("#tIco").innerHTML=tIcons[kind];$("#tTxt").textContent=m;t.hidden=true;void t.offsetWidth;t.hidden=false;clearTimeout(tt);tt=setTimeout(()=>t.hidden=true,3200)}
$("#tX").addEventListener("click",()=>{clearTimeout(tt);$("#toast").hidden=true});
const ico={
    edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
    eye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
    tag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/></svg>',
    cam:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 7l2-3h4l2 3"/></svg>'
};
$$("[data-eye]").forEach(e=>e.innerHTML=ico.eye+"Zichtbaar op de site");
$$("[data-lock]").forEach(e=>e.innerHTML=ico.lock+"Alleen voor HUISenAANBOD");

/* Tabbladen */
const tabs=["advertenties","informatieaanvragen","statistieken","tarieven","prepaid","gegevens"];
function show(t){
    if(!tabs.includes(t))t="advertenties";
    $$(".tab").forEach(b=>b.setAttribute("aria-selected",b.dataset.tab===t));
    $$("section.panel").forEach(s=>s.hidden=s.id!=="p-"+t);if(t==="statistieken")renderStats();
    try{history.replaceState(null,"","#"+t)}catch(e){}
}
$$(".tab").forEach(b=>b.addEventListener("click",()=>{show(b.dataset.tab);window.scrollTo({top:0})}));
$$("[data-go]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();show(a.dataset.go);window.scrollTo({top:0})}));

/* ADVERTENTIES */
const land={EL:"Griekenland",ANT:"Aruba",DOM:"Dominicaanse Republiek"};
const ads=[
    {id:3294250,sr:"K",ref:"",c:"EL",prov:"Kreta",city:"Chania",type:"Bungalow",price:495000,views:12,photos:7,img:2,on:true},
    {id:3294238,sr:"K",ref:"",c:"EL",prov:"Kreta",city:"Rethymno",type:"Bungalow",price:700000,views:31,photos:17,img:0,on:true},
    {id:3278606,sr:"K",ref:"17596999",c:"ANT",prov:"",city:"Oranjestad",type:"Appartement",price:400000,views:78,photos:9,img:1,on:true,lab:"ovv"},
    {id:3236204,sr:"K",ref:"726",c:"EL",prov:"Attica",city:"Saronida",type:"Woonhuis",price:275000,views:342,photos:3,img:1,on:true,lab:"sold"},
    {id:3236063,sr:"K",ref:"720",c:"EL",prov:"Kreta",city:"Lentas",type:"Bouwgrond",price:190000,views:426,photos:8,img:2,on:true},
    {id:3282493,sr:"K",ref:"7783593260",c:"DOM",prov:"",city:"Cap Cana",type:"Appartement",price:1156620,views:75,photos:12,img:1,on:true},
    {id:3275100,sr:"K",ref:"17537941",c:"DOM",prov:"",city:"Cap Cana",type:"Appartement",price:879500,views:98,photos:5,img:1,on:true},
    {id:3260421,sr:"K",ref:"16928616",c:"DOM",prov:"",city:"Punta Cana",type:"Appartement",price:202000,views:138,photos:6,img:0,on:false},
    {id:3237751,sr:"H",ref:"",c:"DOM",prov:"",city:"Sosúa",type:"Villa",price:3500,views:199,photos:6,img:2,on:true}
];

const PHOTO="../assets/house-test-dashboard.jpg";
let adF="all",confirmId=null,labelId=null;
const labName=(d,l)=>({ovv:d.sr==="H"?"Verhuurd o.v.":"Verkocht o.v.",sold:d.sr==="H"?"Verhuurd":"Verkocht"})[l||d.lab]||"";
const labShort=d=>({ovv:d.sr==="H"?"Verhuurd o.v.":"Verkocht o.v.",sold:d.sr==="H"?"Verhuurd":"Verkocht"})[d.lab]||"";
function adRow(d){
    const place=[d.city,d.prov,land[d.c]].filter(Boolean).join(", ");
    const price=`<span class="price ${d.lab==="sold"?"struck":""}">${eur(d.price,0)}${d.sr==="H"?" <small style='font-weight:400'>p/m</small>":""}</span>`;
    const sw=`<button class="switch" role="switch" aria-checked="${d.on}" data-toggle="${d.id}" aria-label="Zichtbaar op HUISenAANBOD"><span class="track"></span><span class="s">${d.on?"Online":"Offline"}</span></button>`;
    const acts=confirmId===d.id
        ?`<div class="confirm"><span><strong>Definitief verwijderen?</strong> Dit kan niet ongedaan worden.</span><button class="act yes" data-yes="${d.id}">Verwijderen</button><button class="act quiet" data-no>Annuleren</button></div>`
        :`<a href="#" class="act primary" title="Gegevens, foto's en prijs aanpassen">${ico.edit}Bewerken</a><button class="act quiet" data-lab="${d.id}" aria-expanded="${labelId===d.id}" title="Label Verkocht of Verhuurd op de advertentie zetten">${ico.tag}Label</button><a href="#" class="act quiet" title="Bekijk de advertentie zoals bezoekers hem zien">${ico.eye}<span class="t-hide">Bekijken</span></a><button class="act quiet del" data-del="${d.id}" title="Advertentie definitief verwijderen">${ico.trash}<span class="t-hide">Verwijderen</span></button>`;
    return `<article class="row ${d.on?"":"is-off"}">
   <div class="thumb"><img src="${PHOTO}" alt="" style="width:100%;height:100%;object-fit:cover;display:block">${d.lab?`<span class="ribbon ${d.lab}">${labShort(d)}</span>`:""}<span class="pc">${ico.cam}${d.photos}</span></div>
   <div class="info">
     <div style="display:flex;gap:6px;flex-wrap:wrap"><span class="chip ${d.sr==="H"?"rent":""}">${d.sr==="H"?"Te huur":"Te koop"}</span>${d.lab?`<span class="chip ${d.lab}">${labName(d)}</span>`:""}</div>
     <div class="title">${d.type}</div><div class="loc">${place}</div>
     <div class="meta"><span>Advertentienr. <span class="num">${d.id}</span></span>${d.ref?`<span>Eigen ref. <span class="num">${d.ref}</span></span>`:""}</div>
   </div>
   <div class="m-row">${price}<span class="views">${int(d.views)} <small>weergaven</small></span></div>
   <div class="cell-price">${price}</div><div class="cell-views views">${int(d.views)}</div><div class="cell-status">${sw}</div>
   <div class="cell-actions"><div class="vis-row"><span>Zichtbaar op de site</span>${sw}</div>${acts}</div>
   ${labelId===d.id?`<div class="label-pick"><span class="q">Label op de advertentie</span>
     <div class="seg" role="group" aria-label="Label kiezen">${[["","Geen label"],["ovv",labName(d,"ovv")],["sold",labName(d,"sold")]].map(([k,t])=>`<button aria-pressed="${(d.lab||"")===k}" data-setlab="${k}" data-id="${d.id}">${t}</button>`).join("")}</div>
     <span style="color:var(--ink-3)">De advertentie blijft online, met het label op de foto.</span>
     <button class="act quiet close" data-labclose>Sluiten</button></div>`:""}</article>`;
}
function renderAds(){
    const q=$("#q").value.trim().toLowerCase(), s=$("#sort").value;
    let v=ads.filter(d=>adF==="all"||(adF==="sold"?!!d.lab:(adF==="on")===d.on)).filter(d=>!q||[d.id,d.ref,d.city,d.prov,land[d.c],d.type].join(" ").toLowerCase().includes(q));
    v.sort((a,b)=>s==="views"?b.views-a.views:s==="pd"?b.price-a.price:s==="pa"?a.price-b.price:b.id-a.id);
    $("#adList").innerHTML=v.length?v.map(adRow).join(""):`<div class="empty">Geen advertenties gevonden voor dit filter.</div>`;
    const off=ads.filter(d=>!d.on).length;
    $("#aOn").textContent=int(584-off);$("#aOff").textContent=off;
    $("#adCount").textContent=`${v.length} ${v.length===1?"advertentie":"advertenties"}`;
}
$("#q").addEventListener("input",renderAds);$("#sort").addEventListener("change",renderAds);

/* INFORMATIEAANVRAGEN */
const leads=[
    {id:1,name:"Anna de Vries",mail:"anna.devries@example.nl",tel:"+31 6 12345678",ad:3236204,date:"19-10-2026 09:42",msg:"Goedemorgen, wij zijn erg geïnteresseerd in deze woning in Saronida. Is het mogelijk om in de week van 9 november een bezichtiging te plannen? Ook horen we graag wat de jaarlijkse kosten (IMU/ENFIA) ongeveer zijn.",st:"new"},
    {id:2,name:"Mark Jansen",mail:"m.jansen@example.com",tel:"+31 6 98765432",ad:3275100,date:"18-10-2026 21:15",msg:"Is dit appartement in Cap Cana nog beschikbaar? En wordt het gemeubileerd verkocht?",st:"new"},
    {id:3,name:"Sophie Peeters",mail:"sophie.peeters@example.be",tel:"+32 470 12 34 56",ad:3236063,date:"17-10-2026 14:03",msg:"Graag ontvang ik meer informatie over de bouwgrond in Lentas: is er een bouwvergunning aanwezig en hoeveel m² mag er bebouwd worden?",st:"new"},
    {id:4,name:"Pieter Bakker",mail:"pbakker@example.nl",tel:"",ad:3237751,date:"12-10-2026 11:30",msg:"Wij zoeken een huurwoning voor 3 maanden vanaf januari. Is de villa in Sosúa dan beschikbaar?",st:"done"},
    {id:5,name:"Lotte Smit",mail:"lotte.smit@example.nl",tel:"+31 6 11223344",ad:3282493,date:"03-10-2026 16:48",msg:"Kunt u mij de plattegrond van dit appartement sturen?",st:"done"}
];
let leadF="open";
function adName(id){const a=ads.find(x=>x.id===id);return a?`${a.type} in ${a.city}`:"Advertentie"}
function renderLeads(){
    const v=leads.filter(l=>leadF==="all"||(leadF==="open"?l.st==="new":l.st==="done"));
    const n=leads.filter(l=>l.st==="new").length;
    $("#leadCount").textContent=n||"";$("#lNew").textContent=n;
    $("#leadList").innerHTML=v.length?v.map(l=>`<details class="lead ${l.st==="new"?"is-new":""}">
   <summary><span class="who-l">${l.name}</span>
    <span class="when"><span class="chip ${l.st==="new"?"new":"done"}">${l.st==="new"?"Nieuw":"Beantwoord"}</span><span class="num">${l.date}</span></span>
    <span class="about">Over: ${adName(l.ad)} · advertentienr. <span class="num">${l.ad}</span></span></summary>
   <div class="body">
    <blockquote>${l.msg}</blockquote>
    <div class="contact"><span><b>E-mail</b> ${l.mail} <button class="copy" data-copy="${l.mail}">Kopiëren</button></span>${l.tel?`<span><b>Telefoon</b> <span class="num">${l.tel}</span> <button class="copy" data-copy="${l.tel}">Kopiëren</button></span>`:""}</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">${l.st==="new"?`<button class="act" data-done="${l.id}">Markeer als beantwoord</button>`:`<button class="act quiet" data-reopen="${l.id}">Terugzetten naar openstaand</button>`}<a href="#" class="act quiet" data-adlink>${ico.eye}Bekijk advertentie</a></div>
   </div></details>`).join(""):`<div class="empty"><strong style="color:var(--ink)">Geen ${leadF==="open"?"openstaande ":""}aanvragen</strong><br>Nieuwe aanvragen van woningzoekers verschijnen hier en worden ook naar uw e-mailadres gestuurd.</div>`;
}

/* STATISTIEKEN */
function seeded(n){let s=n;return()=>((s=Math.imul(s^s>>>15,1|s)+0x6D2B79F5|0)>>>0)/4294967296}
let period=30;
function renderStats(){
    const r=seeded(7),days=[];const today=new Date(2026,9,19);
    for(let i=89;i>=0;i--){const d=new Date(today);d.setDate(d.getDate()-i);const wk=d.getDay()===0||d.getDay()===6?1.35:1;days.push({d,v:Math.round((38+r()*30)*wk+(90-i)*.08)})}
    const sl=days.slice(-period),tot=sl.reduce((a,b)=>a+b.v,0);
    const www=Math.round(tot*.027),lds=Math.max(1,Math.round(tot/310));
    $("#kV").textContent=int(tot);$("#kVh").innerHTML=`<span class="up">+12%</span> t.o.v. vorige periode`;
    $("#kW").textContent=int(www);$("#kL").textContent=lds;$("#kA").textContent=(tot/584).toLocaleString("nl-NL",{maximumFractionDigits:1});
    const W=Math.max(300,Math.round($(".chart-wrap").clientWidth||760)),H=W<500?200:240,L=36,R=6,T=14,B=30,max=Math.ceil(Math.max(...sl.map(x=>x.v))/25)*25;
    const bw=(W-L-R)/sl.length,y=v=>T+(H-T-B)*(1-v/max);
    let g="";for(let t=0;t<=max;t+=25){g+=`<line x1="${L}" x2="${W-R}" y1="${y(t)}" y2="${y(t)}" stroke="#e5e7eb"/><text x="${L-8}" y="${y(t)+4}" text-anchor="end" font-size="11" fill="#6b7280">${t}</text>`}
    const fit=Math.max(1,Math.ceil(sl.length/Math.floor((W-L-R)/46)));const step=period===7?1:Math.max(fit,period===30?5:15);
    sl.forEach((p,i)=>{const x=L+i*bw+bw*.15,w=bw*.7;const last=i===sl.length-1;
        g+=`<rect x="${x}" y="${y(p.v)}" width="${w}" height="${H-B-y(p.v)}" rx="${Math.min(3,w/3)}" fill="${last?"#d46803":"#EC7404"}" opacity="${last?1:.85}"><title>${p.d.toLocaleDateString("nl-NL")}: ${p.v} weergaven</title></rect>`;
        if((sl.length-1-i)%step===0)g+=`<text x="${x+w/2}" y="${H-10}" text-anchor="middle" font-size="11" fill="#6b7280">${p.d.getDate()}-${p.d.getMonth()+1}</text>`});
    $("#chart").setAttribute("viewBox",`0 0 ${W} ${H}`);$("#chart").innerHTML=g;
    const top=[...ads].sort((a,b)=>b.views-a.views).slice(0,6),mx=top[0].views;
    $("#topBody").innerHTML=top.map(a=>`<tr><td class="first"><strong>${a.type}</strong> <span style="color:var(--muted)" class="num">· ${a.id}</span></td><td data-label="Plaats">${a.city}, ${land[a.c]}</td><td class="r" data-label="Weergaven"><span class="bar" style="width:${Math.round(a.views/mx*80)}px"></span>${int(a.views)}</td><td class="r" data-label="Website-clicks">${Math.round(a.views*.03)}</td><td class="r" data-label="Aanvragen">${Math.round(a.views/120)}</td></tr>`).join("");
}

/* TARIEVEN */
const tiers=[[0,99,.012],[100,499,.0095],[500,999,.00807],[1000,1e9,.0068]];
const last30={views:1556,www:42,leads:5};
let savedPlan="dag";
function renderPlan(){
    const n=Math.max(0,+$("#nAds").value||0),t=tiers.find(x=>n>=x[0]&&n<=x[1]);
    const day=n*t[2],month=day*30;
    $("#rateDag").textContent="€ "+t[2].toLocaleString("nl-NL",{minimumFractionDigits:5});
    $("#tierTxt").textContent=`staffel ${int(t[0])}${t[1]>1e8?"+":"–"+int(t[1])} advertenties`;
    $("#perDay").textContent=eur(day);$("#perMonth").textContent=eur(month);
    const pres=last30.views*.01+last30.www*1.5+last30.leads*9;
    $("#presMonth").textContent=eur(pres);
    $("#presCalc").textContent=`${int(last30.views)} weergaven × € 0,01 + ${last30.www} website-clicks × € 1,50 + ${last30.leads} aanvragen × € 9,00`;
    const dag30=584*.00807*30,mx=Math.max(dag30,pres);
    const cheaper=pres<dag30?"prestatie":"dag";
    $("#compare").innerHTML=`<div class="bar-row"><span>DAG-tarief</span><span class="track"><span class="fill ${cheaper==="dag"?"":"alt"}" style="width:${dag30/mx*100}%;display:block"></span></span><strong class="num" style="text-align:right">${eur(dag30)}</strong></div>
   <div class="bar-row"><span>Prestatie-tarief</span><span class="track"><span class="fill ${cheaper==="prestatie"?"":"alt"}" style="width:${pres/mx*100}%;display:block"></span></span><strong class="num" style="text-align:right">${eur(pres)}</strong></div>`;
    $("#advice").innerHTML=`Met uw huidige aantal weergaven en aanvragen was het <strong>${cheaper==="dag"?"DAG-tarief":"Prestatie-tarief"}</strong> de afgelopen 30 dagen <strong>${eur(Math.abs(dag30-pres))}</strong> voordeliger.`;
    const cur=$("input[name=plan]:checked").value;
    $("#savePlan").disabled=cur===savedPlan;
    $("#planMsg").innerHTML=cur===savedPlan?`Uw huidige keuze: <strong>${savedPlan==="dag"?"DAG-tarief":"Prestatie-tarief"}</strong>`:`<span style="color:var(--brand-ink);font-weight:700">Nog niet opgeslagen:</span> overstappen naar het ${cur==="dag"?"DAG-tarief":"Prestatie-tarief"} gaat in vanaf morgen.`;
}
$("#nAds").addEventListener("input",renderPlan);
$$("input[name=plan]").forEach(r=>r.addEventListener("change",renderPlan));
$("#savePlan").addEventListener("click",()=>{savedPlan=$("input[name=plan]:checked").value;const nm=savedPlan==="dag"?"DAG-tarief":"Prestatie-tarief";$("#planPill").textContent=nm;renderPlan();toast(`Opgeslagen: u stapt morgen over op het ${nm}`)});

/* PREPAID */
const amounts=[50,100,150,200,300,500,750,1000];
const methods=[["iDEAL | Wero","direct"],["Creditcard","Visa, Mastercard"],["PayPal","direct"],["Bancontact","België"],["Belfius","België"],["Overboeking","1–2 werkdagen"],["SEPA-overboeking","1–2 werkdagen"]];
let amt=null,meth=null;
$("#amounts").innerHTML=amounts.map(a=>`<button class="amt" aria-pressed="false" data-amt="${a}"><b>€ ${int(a)}</b><small>± ${Math.floor(a/4.70)} dagen</small></button>`).join("");
$("#pays").innerHTML=methods.map(m=>`<button class="pay" aria-pressed="false" data-m="${m[0]}">${m[0]}<small>${m[1]}</small></button>`).join("");
function renderPay(){
    $$(".amt").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.amt===amt));
    $$(".pay").forEach(b=>b.setAttribute("aria-pressed",b.dataset.m===meth));
    $("#paySum").innerHTML=amt&&meth?`U waardeert <strong>${eur(amt)}</strong> op via <strong>${meth}</strong>. Daarmee kunt u ca. ${Math.floor(amt/4.70)} dagen adverteren.`:amt?`Bedrag: <strong>${eur(amt)}</strong>. Kies nog een betaalmethode.`:"Kies een bedrag en een betaalmethode.";
    $("#payBtn").disabled=!(amt&&meth&&$("#agree").checked);
    $("#payBtn").textContent=amt?`${eur(amt)} betalen`:"Betalen";
}
$("#agree").addEventListener("change",renderPay);
(function(){const rows=[];let bal=0;const d0=new Date(2026,8,6);const ev=[];
    ev.push({d:new Date(2026,8,6),t:"Opwaardering via iDEAL",a:100});
    for(let i=1;i<=24;i++){const d=new Date(d0);d.setDate(d.getDate()+i);ev.push({d,t:"Advertentiekosten DAG-tarief (582 adv.)",a:-4.70})}
    ev.push({d:new Date(2026,9,1),t:"Opwaardering via Overboeking",a:50});
    ev.sort((a,b)=>a.d-b.d);
    for(const e of ev){let a=e.a;if(bal+a<0)a=-bal;if(a===0)continue;const prev=bal;bal=Math.round((bal+a)*100)/100;rows.push({...e,a,prev,bal})}
    const show=rows.slice(-12).reverse();
    $("#txBody").innerHTML=show.map(r=>`<tr><td class="num first">${r.d.toLocaleDateString("nl-NL",{day:"2-digit",month:"2-digit",year:"numeric"})}<span class="m-only"> · ${r.t}</span></td><td class="hide-m" data-label="Omschrijving">${r.t}</td><td class="r ${r.a>0?"plus":"min"}" data-label="Bij / af">${r.a>0?"+ ":"− "}${eur(Math.abs(r.a))}</td><td class="r" data-label="Vorig saldo">${eur(r.prev)}</td><td class="r" data-label="Nieuw saldo"><strong>${eur(r.bal)}</strong></td></tr>`).join("");
})();

/* MIJN GEGEVENS */
const form=$("#form");
form.addEventListener("input",()=>{$("#formMsg").textContent="U heeft niet-opgeslagen wijzigingen.";$("#formMsg").classList.add("dirty")});
$("#same").addEventListener("change",e=>{$("#billing").hidden=e.target.checked});
form.addEventListener("submit",e=>{e.preventDefault();
    const bad=[...form.querySelectorAll("[required]")].find(i=>!i.value.trim());
    if(bad){bad.focus();toast(`Vul eerst “${bad.closest(".field").querySelector("label").textContent.replace("*","").trim()}” in`,"warn");return}
    $("#formMsg").textContent="Alle wijzigingen zijn opgeslagen.";$("#formMsg").classList.remove("dirty");toast("Uw gegevens zijn opgeslagen")});

/* Klikken */
document.addEventListener("click",e=>{
    const b=e.target.closest("button,a");if(!b)return;
    if(b.matches("a[href='#']")||b.hasAttribute("data-adlink"))e.preventDefault();
    if(b.closest("#adFilter")&&b.dataset.f){adF=b.dataset.f;$$("#adFilter button").forEach(x=>x.setAttribute("aria-pressed",x===b));renderAds()}
    if(b.closest("#leadFilter")&&b.dataset.f){leadF=b.dataset.f;$$("#leadFilter button").forEach(x=>x.setAttribute("aria-pressed",x===b));renderLeads()}
    if(b.dataset.d){period=+b.dataset.d;$$("#period button").forEach(x=>x.setAttribute("aria-pressed",x===b));renderStats()}
    if(b.dataset.toggle){const d=ads.find(x=>x.id==b.dataset.toggle);d.on=!d.on;renderAds();toast(d.on?`Advertentie ${d.id} staat online`:`Advertentie ${d.id} staat offline. Hij is verborgen, niet verwijderd`)}
    if(b.dataset.lab){labelId=labelId===+b.dataset.lab?null:+b.dataset.lab;confirmId=null;renderAds()}
    if(b.hasAttribute("data-labclose")){labelId=null;renderAds()}
    if(b.dataset.setlab!==undefined&&b.dataset.id){const d=ads.find(x=>x.id==b.dataset.id);d.lab=b.dataset.setlab||null;labelId=null;renderAds();toast(d.lab?`Label “${labName(d)}” staat op advertentie ${d.id}`:`Label verwijderd van advertentie ${d.id}`)}
    if(b.dataset.del){confirmId=+b.dataset.del;labelId=null;renderAds()}
    if(b.hasAttribute("data-no")){confirmId=null;renderAds()}
    if(b.dataset.yes){ads.splice(ads.findIndex(x=>x.id==b.dataset.yes),1);confirmId=null;renderAds();toast(`Advertentie ${b.dataset.yes} is verwijderd`)}
    if(b.dataset.done){leads.find(l=>l.id==b.dataset.done).st="done";renderLeads();toast("Gemarkeerd als beantwoord")}
    if(b.dataset.reopen){leads.find(l=>l.id==b.dataset.reopen).st="new";renderLeads()}
    if(b.dataset.copy){const v=b.dataset.copy;try{navigator.clipboard.writeText(v).then(()=>toast("Gekopieerd: "+v),()=>toast(v))}catch(x){toast(v)}}
    if(b.dataset.amt){amt=+b.dataset.amt;renderPay()}
    if(b.dataset.m){meth=b.dataset.m;renderPay()}
});

let rz;window.addEventListener("resize",()=>{clearTimeout(rz);rz=setTimeout(renderStats,150)});
renderAds();renderLeads();renderStats();renderPlan();renderPay();
show((location.hash||"").slice(1));