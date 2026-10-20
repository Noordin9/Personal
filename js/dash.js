/* ==========================================================================
   dash.js – werking van de dashboard (dashboard/dashboard.html)

   Indeling van dit bestand:
    1. Hulpfuncties (elementen zoeken, bedragen opmaken)
    2. Meldingen (de pop-up rechtsonder)
    3. Iconen
    4. Tabbladen
    5. Advertenties (lijst, zoeken, filteren, label, verwijderen)
    6. Informatieaanvragen (incl. e-mail/telefoon kopiëren)
    7. Statistieken (kerncijfers, grafiek, top-advertenties)
    8. Tarieven (rekenhulp en keuze opslaan)
    9. Prepaid-tegoed (bedrag + betaalmethode kiezen, overzicht)
   10. Mijn gegevens (formulier)
   11. Alle klikken op één plek afhandelen
   12. Opstarten

   Werkwijze: de gegevens staan in lijsten (arrays) bovenaan elk onderdeel.
   Een "render"-functie maakt daar HTML van en zet die op de pagina.
   Verandert er iets (klik, zoeken), dan passen we de lijst aan en roepen
   we de render-functie opnieuw aan.
   ========================================================================== */


/* ==========================================================================
   1. HULPFUNCTIES
   ========================================================================== */

// Zoek één element op de pagina, bijvoorbeeld zoek("#q") geeft het zoekveld.
function zoek(selector) {
    return document.querySelector(selector);
}

// Zoek álle elementen die bij de selector passen en geef ze als lijst terug.
function zoekAlle(selector) {
    return Array.from(document.querySelectorAll(selector));
}

// Bedrag als euro's op z'n Nederlands: euro(1234.5) geeft "€ 1.234,50".
// Met decimalen = 0 krijg je "€ 1.235" (gebruikt voor vraagprijzen).
function euro(bedrag, decimalen) {
    if (decimalen === undefined) {
        decimalen = 2;
    }
    const tekst = bedrag.toLocaleString("nl-NL", {
        minimumFractionDigits: decimalen,
        maximumFractionDigits: decimalen
    });
    return "€ " + tekst;
}

// Heel getal met punt als duizendtal-scheiding: getal(1556) geeft "1.556".
function getal(aantal) {
    return aantal.toLocaleString("nl-NL");
}


/* ==========================================================================
   2. MELDINGEN (pop-up rechtsonder, bijvoorbeeld "Uw gegevens zijn opgeslagen")
   ========================================================================== */

// Icoontje links in de melding: een vinkje (ok) of een uitroepteken (warn).
const meldingIconen = {
    ok:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 7v6M12 17h.01"/></svg>'
};

let meldingTimer; // Onthoudt de afteltimer, zodat we die kunnen stoppen

// Toon een melding. soort is "ok" (standaard) of "warn" (rood, voor fouten).
function melding(tekst, soort) {
    if (!soort) {
        soort = "ok";
    }
    const vak = zoek("#toast");

    // Rode variant alleen bij een waarschuwing
    if (soort === "warn") {
        vak.className = "toast warn";
    } else {
        vak.className = "toast";
    }

    zoek("#tIco").innerHTML = meldingIconen[soort];
    zoek("#tTxt").textContent = tekst;

    // Even verbergen en meteen weer tonen, zodat de in-animatie opnieuw speelt
    vak.hidden = true;
    void vak.offsetWidth; // Dwingt de browser de verandering te verwerken
    vak.hidden = false;

    // Na 3,2 seconden vanzelf weer verbergen
    clearTimeout(meldingTimer);
    meldingTimer = setTimeout(function () {
        vak.hidden = true;
    }, 3200);
}

// Kruisje in de melding: meteen sluiten
zoek("#tX").addEventListener("click", function () {
    clearTimeout(meldingTimer);
    zoek("#toast").hidden = true;
});


/* ==========================================================================
   3. ICONEN (kleine SVG-plaatjes die in knoppen en labels gebruikt worden)
   ========================================================================== */

const icoon = {
    bewerken: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
    oog:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    slot:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    prullenbak: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
    label:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/></svg>',
    camera:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 7l2-3h4l2 3"/></svg>'
};

// Bij "Mijn gegevens" staat per blok of het zichtbaar is op de site.
// In de HTML staat daar een leeg <span data-eye> of <span data-lock>; hier vullen we die.
zoekAlle("[data-eye]").forEach(function (el) {
    el.innerHTML = icoon.oog + "Zichtbaar op de site";
});
zoekAlle("[data-lock]").forEach(function (el) {
    el.innerHTML = icoon.slot + "Alleen voor HUISenAANBOD";
});


/* ==========================================================================
   4. TABBLADEN
   Elk tabblad is een <section id="p-..."> in de HTML. We tonen er één tegelijk.
   ========================================================================== */

const tabbladen = ["advertenties", "informatieaanvragen", "statistieken", "tarieven", "prepaid", "gegevens"];

function toonTabblad(naam) {
    // Onbekende naam (bijv. lege #): val terug op Advertenties
    if (!tabbladen.includes(naam)) {
        naam = "advertenties";
    }

    // Tab-knoppen: alleen de gekozen knop krijgt aria-selected="true" (oranje streep via CSS)
    zoekAlle(".tab").forEach(function (knop) {
        knop.setAttribute("aria-selected", knop.dataset.tab === naam);
    });

    // Secties: alleen de gekozen sectie zichtbaar
    zoekAlle("section.panel").forEach(function (sectie) {
        sectie.hidden = (sectie.id !== "p-" + naam);
    });

    // De grafiek moet getekend worden terwijl hij zichtbaar is (anders is de breedte 0)
    if (naam === "statistieken") {
        tekenStatistieken();
    }

    // Zet de naam achter # in de adresbalk, zodat verversen op hetzelfde tabblad blijft
    try {
        history.replaceState(null, "", "#" + naam);
    } catch (fout) {
        // Sommige omgevingen staan dit niet toe; dan slaan we het gewoon over
    }
}

// Klik op een tab-knop: tabblad wisselen en naar boven scrollen
zoekAlle(".tab").forEach(function (knop) {
    knop.addEventListener("click", function () {
        toonTabblad(knop.dataset.tab);
        window.scrollTo({ top: 0 });
    });
});

// De pillen in de bedrijfsband (Prepaid-tegoed, Tarief) springen ook naar een tabblad
zoekAlle("[data-go]").forEach(function (link) {
    link.addEventListener("click", function (e) {
        e.preventDefault(); // Niet de link volgen
        toonTabblad(link.dataset.go);
        window.scrollTo({ top: 0 });
    });
});


/* ==========================================================================
   5. ADVERTENTIES
   ========================================================================== */

// Landcodes uit de database omzetten naar een leesbare naam
const landNamen = {
    EL:  "Griekenland",
    ANT: "Aruba",
    DOM: "Dominicaanse Republiek"
};

// Voorbeeldadvertenties. Later uit de database (zie uitleg in de chat).
//   id       = advertentienummer
//   soort    = "K" (te koop) of "H" (te huur)
//   ref      = eigen referentie van de makelaar
//   land     = landcode, zie landNamen
//   provincie, plaats, type, prijs, weergaven, fotos = spreekt voor zich
//   online   = true (zichtbaar) of false (offline)
//   label    = null (geen), "ov" (verkocht o.v.) of "verkocht"
const advertenties = [
    { id: 3294250, soort: "K", ref: "",           land: "EL",  provincie: "Kreta",  plaats: "Chania",     type: "Bungalow",    prijs: 495000,  weergaven: 12,  fotos: 7,  online: true,  label: null },
    { id: 3294238, soort: "K", ref: "",           land: "EL",  provincie: "Kreta",  plaats: "Rethymno",   type: "Bungalow",    prijs: 700000,  weergaven: 31,  fotos: 17, online: true,  label: null },
    { id: 3278606, soort: "K", ref: "17596999",   land: "ANT", provincie: "",       plaats: "Oranjestad", type: "Appartement", prijs: 400000,  weergaven: 78,  fotos: 9,  online: true,  label: "ov" },
    { id: 3236204, soort: "K", ref: "726",        land: "EL",  provincie: "Attica", plaats: "Saronida",   type: "Woonhuis",    prijs: 275000,  weergaven: 342, fotos: 3,  online: true,  label: "verkocht" },
    { id: 3236063, soort: "K", ref: "720",        land: "EL",  provincie: "Kreta",  plaats: "Lentas",     type: "Bouwgrond",   prijs: 190000,  weergaven: 426, fotos: 8,  online: true,  label: null },
    { id: 3282493, soort: "K", ref: "7783593260", land: "DOM", provincie: "",       plaats: "Cap Cana",   type: "Appartement", prijs: 1156620, weergaven: 75,  fotos: 12, online: true,  label: null },
    { id: 3275100, soort: "K", ref: "17537941",   land: "DOM", provincie: "",       plaats: "Cap Cana",   type: "Appartement", prijs: 879500,  weergaven: 98,  fotos: 5,  online: true,  label: null },
    { id: 3260421, soort: "K", ref: "16928616",   land: "DOM", provincie: "",       plaats: "Punta Cana", type: "Appartement", prijs: 202000,  weergaven: 138, fotos: 6,  online: false, label: null },
    { id: 3237751, soort: "H", ref: "",           land: "DOM", provincie: "",       plaats: "Sosúa",      type: "Villa",       prijs: 3500,    weergaven: 199, fotos: 6,  online: true,  label: null }
];

// Testfoto voor alle advertenties. Pad is relatief aan dashboard/index.html.
// Later per advertentie de echte foto uit de database gebruiken.
const TESTFOTO = "../assets/house-test-dashboard.jpg";

// Wat er op dit moment gekozen of open staat:
let statusFilter = "all";     // "all", "on", "off" of "sold" (knoppen boven de lijst)
let verwijderOpenId = null;   // Bij welke advertentie staat "Definitief verwijderen?" open
let labelOpenId = null;       // Bij welke advertentie staat de label-keuze open

// Zoek een advertentie op nummer
function vindAdvertentie(id) {
    return advertenties.find(function (ad) {
        return ad.id === Number(id);
    });
}

// Tekst van een label. Te huur krijgt "Verhuurd", te koop "Verkocht".
function labelTekst(ad, label) {
    const huur = (ad.soort === "H");
    if (label === "ov") {
        return huur ? "Verhuurd o.v." : "Verkocht o.v.";
    }
    if (label === "verkocht") {
        return huur ? "Verhuurd" : "Verkocht";
    }
    return "";
}

// Maak de HTML voor één advertentie (één rij op desktop, één kaart op mobiel)
function advertentieHTML(ad) {

    // Plaats, provincie en land achter elkaar, lege delen overslaan
    const delen = [ad.plaats, ad.provincie, landNamen[ad.land]];
    const locatie = delen.filter(function (deel) { return deel !== ""; }).join(", ");

    // Prijs. Verkocht = doorgestreept. Huur krijgt "p/m" erachter.
    let prijsKlasse = "price";
    if (ad.label === "verkocht") {
        prijsKlasse += " struck";
    }
    let prijs = '<span class="' + prijsKlasse + '">' + euro(ad.prijs, 0);
    if (ad.soort === "H") {
        prijs += ' <small style="font-weight:400">p/m</small>';
    }
    prijs += "</span>";

    // Online/offline-schakelaar
    const schakelaar =
        '<button class="switch" role="switch" aria-checked="' + ad.online + '" data-toggle="' + ad.id + '" aria-label="Zichtbaar op HUISenAANBOD">' +
        '<span class="track"></span>' +
        '<span class="s">' + (ad.online ? "Online" : "Offline") + '</span>' +
        '</button>';

    // Knoppen. Staat "verwijderen" open, dan in plaats daarvan de bevestiging.
    let knoppen;
    if (verwijderOpenId === ad.id) {
        knoppen =
            '<div class="confirm">' +
            '<span><strong>Definitief verwijderen?</strong> Dit kan niet ongedaan worden.</span>' +
            '<button class="act yes" data-yes="' + ad.id + '">Verwijderen</button>' +
            '<button class="act quiet" data-no>Annuleren</button>' +
            '</div>';
    } else {
        knoppen =
            '<a href="#" class="act primary" title="Gegevens, foto\'s en prijs aanpassen">' + icoon.bewerken + 'Bewerken</a>' +
            '<button class="act quiet" data-lab="' + ad.id + '" title="Label Verkocht of Verhuurd op de advertentie zetten">' + icoon.label + 'Label</button>' +
            '<a href="#" class="act quiet" title="Bekijk de advertentie zoals bezoekers hem zien">' + icoon.oog + '<span class="t-hide">Bekijken</span></a>' +
            '<button class="act quiet del" data-del="' + ad.id + '" title="Advertentie definitief verwijderen">' + icoon.prullenbak + '<span class="t-hide">Verwijderen</span></button>';
    }

    // Band over de foto en chip naast "Te koop", alleen als er een label is
    let fotoBand = "";
    let labelChip = "";
    if (ad.label) {
        fotoBand  = '<span class="ribbon ' + ad.label + '">' + labelTekst(ad, ad.label) + '</span>';
        labelChip = '<span class="chip ' + ad.label + '">' + labelTekst(ad, ad.label) + '</span>';
    }

    // Eigen referentie alleen tonen als die is ingevuld
    let referentie = "";
    if (ad.ref !== "") {
        referentie = '<span>Eigen ref. <span class="num">' + ad.ref + '</span></span>';
    }

    // Label-keuze onder de advertentie, alleen als die open staat
    let labelKeuze = "";
    if (labelOpenId === ad.id) {
        const opties = [
            ["",         "Geen label"],
            ["ov",       labelTekst(ad, "ov")],
            ["verkocht", labelTekst(ad, "verkocht")]
        ];
        let optieKnoppen = "";
        opties.forEach(function (optie) {
            const waarde = optie[0];
            const tekst = optie[1];
            const gekozen = ((ad.label || "") === waarde);
            optieKnoppen += '<button aria-pressed="' + gekozen + '" data-setlab="' + waarde + '" data-id="' + ad.id + '">' + tekst + '</button>';
        });
        labelKeuze =
            '<div class="label-pick">' +
            '<span class="q">Label op de advertentie</span>' +
            '<div class="seg" role="group" aria-label="Label kiezen">' + optieKnoppen + '</div>' +
            '<span style="color:var(--ink-3)">De advertentie blijft online, met het label op de foto.</span>' +
            '<button class="act quiet close" data-labclose>Sluiten</button>' +
            '</div>';
    }

    // Alles samenvoegen tot één <article>
    return '' +
        '<article class="row' + (ad.online ? "" : " is-off") + '">' +
        '<div class="thumb">' +
        '<img src="' + TESTFOTO + '" alt="" style="width:100%;height:100%;object-fit:cover;display:block">' +
        fotoBand +
        '<span class="pc">' + icoon.camera + ad.fotos + '</span>' +
        '</div>' +
        '<div class="info">' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
        '<span class="chip' + (ad.soort === "H" ? " rent" : "") + '">' + (ad.soort === "H" ? "Te huur" : "Te koop") + '</span>' +
        labelChip +
        '</div>' +
        '<div class="title">' + ad.type + '</div>' +
        '<div class="loc">' + locatie + '</div>' +
        '<div class="meta"><span>Advertentienr. <span class="num">' + ad.id + '</span></span>' + referentie + '</div>' +
        '</div>' +
        // Mobiel: prijs en weergaven op één regel
        '<div class="m-row">' + prijs + '<span class="views">' + getal(ad.weergaven) + ' <small>weergaven</small></span></div>' +
        // Desktop: aparte kolommen
        '<div class="cell-price">' + prijs + '</div>' +
        '<div class="cell-views views">' + getal(ad.weergaven) + '</div>' +
        '<div class="cell-status">' + schakelaar + '</div>' +
        '<div class="cell-actions">' +
        '<div class="vis-row"><span>Zichtbaar op de site</span>' + schakelaar + '</div>' +
        knoppen +
        '</div>' +
        labelKeuze +
        '</article>';
}

// Teken de advertentielijst opnieuw, met zoeken, filter en sortering toegepast
function tekenAdvertenties() {

    // --- ZOEKEN: de tekst uit het zoekveld, zonder spaties aan de randen en in kleine letters
    const zoekTekst = zoek("#q").value.trim().toLowerCase();

    // De gekozen sortering uit de keuzelijst
    const sortering = zoek("#sort").value;

    // Begin met alle advertenties en houd alleen over wat bij filter én zoektekst past
    const zichtbaar = advertenties.filter(function (ad) {

        // Stap 1: statusfilter (Alle / Online / Offline / Verkocht-verhuurd)
        if (statusFilter === "on"   && ad.online === false) { return false; }
        if (statusFilter === "off"  && ad.online === true)  { return false; }
        if (statusFilter === "sold" && !ad.label)           { return false; }

        // Stap 2: zoektekst. Leeg zoekveld = alles mag blijven.
        if (zoekTekst === "") {
            return true;
        }

        // Plak alle doorzoekbare velden aan elkaar tot één zin en kijk of de zoektekst erin zit
        const doorzoekbaar = [
            ad.id,
            ad.ref,
            ad.plaats,
            ad.provincie,
            landNamen[ad.land],
            ad.type
        ].join(" ").toLowerCase();

        return doorzoekbaar.includes(zoekTekst);
    });

    // Sorteren volgens de keuzelijst
    zichtbaar.sort(function (a, b) {
        if (sortering === "views") { return b.weergaven - a.weergaven; } // Meest bekeken eerst
        if (sortering === "pd")    { return b.prijs - a.prijs; }         // Prijs hoog → laag
        if (sortering === "pa")    { return a.prijs - b.prijs; }         // Prijs laag → hoog
        return b.id - a.id;                                              // Nieuwste eerst
    });

    // HTML op de pagina zetten
    if (zichtbaar.length === 0) {
        zoek("#adList").innerHTML = '<div class="empty">Geen advertenties gevonden voor dit filter.</div>';
    } else {
        zoek("#adList").innerHTML = zichtbaar.map(advertentieHTML).join("");
    }

    // Kerncijfers bovenaan bijwerken
    const aantalOffline = advertenties.filter(function (ad) { return !ad.online; }).length;
    zoek("#aOn").textContent = getal(584 - aantalOffline); // 584 = totaal online in het voorbeeld
    zoek("#aOff").textContent = aantalOffline;

    // Aantal onder de lijst
    zoek("#adCount").textContent = zichtbaar.length + (zichtbaar.length === 1 ? " advertentie" : " advertenties");
}

// --- ZOEKEN: bij elke toets in het zoekveld de lijst opnieuw tekenen.
// "input" gaat ook af bij plakken en bij het wis-kruisje in het veld.
zoek("#q").addEventListener("input", tekenAdvertenties);

// Andere sortering gekozen: lijst opnieuw tekenen
zoek("#sort").addEventListener("change", tekenAdvertenties);


/* ==========================================================================
   6. INFORMATIEAANVRAGEN
   ========================================================================== */

// Voorbeeldaanvragen. status is "nieuw" of "beantwoord".
const aanvragen = [
    { id: 1, naam: "Anna de Vries",  email: "anna.devries@example.nl",   telefoon: "+31 6 12345678",   advertentie: 3236204, datum: "19-10-2026 09:42", status: "nieuw",
        bericht: "Goedemorgen, wij zijn erg geïnteresseerd in deze woning in Saronida. Is het mogelijk om in de week van 9 november een bezichtiging te plannen? Ook horen we graag wat de jaarlijkse kosten (IMU/ENFIA) ongeveer zijn." },
    { id: 2, naam: "Mark Jansen",    email: "m.jansen@example.com",      telefoon: "+31 6 98765432",   advertentie: 3275100, datum: "18-10-2026 21:15", status: "nieuw",
        bericht: "Is dit appartement in Cap Cana nog beschikbaar? En wordt het gemeubileerd verkocht?" },
    { id: 3, naam: "Sophie Peeters", email: "sophie.peeters@example.be", telefoon: "+32 470 12 34 56", advertentie: 3236063, datum: "17-10-2026 14:03", status: "nieuw",
        bericht: "Graag ontvang ik meer informatie over de bouwgrond in Lentas: is er een bouwvergunning aanwezig en hoeveel m² mag er bebouwd worden?" },
    { id: 4, naam: "Pieter Bakker",  email: "pbakker@example.nl",        telefoon: "",                 advertentie: 3237751, datum: "12-10-2026 11:30", status: "beantwoord",
        bericht: "Wij zoeken een huurwoning voor 3 maanden vanaf januari. Is de villa in Sosúa dan beschikbaar?" },
    { id: 5, naam: "Lotte Smit",     email: "lotte.smit@example.nl",     telefoon: "+31 6 11223344",   advertentie: 3282493, datum: "03-10-2026 16:48", status: "beantwoord",
        bericht: "Kunt u mij de plattegrond van dit appartement sturen?" }
];

let aanvraagFilter = "open"; // "open", "done" of "all"

// "Woonhuis in Saronida" bij een advertentienummer
function advertentieNaam(id) {
    const ad = vindAdvertentie(id);
    if (ad) {
        return ad.type + " in " + ad.plaats;
    }
    return "Advertentie";
}

// Maak de HTML voor één aanvraag (uitklapbaar met <details>)
function aanvraagHTML(aanvraag) {
    const isNieuw = (aanvraag.status === "nieuw");

    // Telefoon alleen tonen als die is ingevuld
    let telefoonDeel = "";
    if (aanvraag.telefoon !== "") {
        telefoonDeel =
            '<span><b>Telefoon</b> <span class="num">' + aanvraag.telefoon + '</span> ' +
            '<button class="copy" data-copy="' + aanvraag.telefoon + '">Kopiëren</button></span>';
    }

    // Knop om de status te wisselen
    let statusKnop;
    if (isNieuw) {
        statusKnop = '<button class="act" data-done="' + aanvraag.id + '">Markeer als beantwoord</button>';
    } else {
        statusKnop = '<button class="act quiet" data-reopen="' + aanvraag.id + '">Terugzetten naar openstaand</button>';
    }

    return '' +
        '<details class="lead' + (isNieuw ? " is-new" : "") + '">' +
        // Wat je ziet als hij dicht is
        '<summary>' +
        '<span class="who-l">' + aanvraag.naam + '</span>' +
        '<span class="when">' +
        '<span class="chip ' + (isNieuw ? "new" : "done") + '">' + (isNieuw ? "Nieuw" : "Beantwoord") + '</span>' +
        '<span class="num">' + aanvraag.datum + '</span>' +
        '</span>' +
        '<span class="about">Over: ' + advertentieNaam(aanvraag.advertentie) + ' · advertentienr. <span class="num">' + aanvraag.advertentie + '</span></span>' +
        '</summary>' +
        // Wat je ziet als hij open is
        '<div class="body">' +
        '<blockquote>' + aanvraag.bericht + '</blockquote>' +
        '<div class="contact">' +
        // data-copy bevat de tekst die de Kopiëren-knop naar het klembord zet
        '<span><b>E-mail</b> ' + aanvraag.email + ' <button class="copy" data-copy="' + aanvraag.email + '">Kopiëren</button></span>' +
        telefoonDeel +
        '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        statusKnop +
        '<a href="#" class="act quiet">' + icoon.oog + 'Bekijk advertentie</a>' +
        '</div>' +
        '</div>' +
        '</details>';
}

// Teken de lijst met aanvragen opnieuw
function tekenAanvragen() {

    // Filter op status
    const zichtbaar = aanvragen.filter(function (aanvraag) {
        if (aanvraagFilter === "open") { return aanvraag.status === "nieuw"; }
        if (aanvraagFilter === "done") { return aanvraag.status === "beantwoord"; }
        return true; // "all"
    });

    // Aantal nieuwe: in het tegeltje en als badge op de tab (leeg = badge verborgen via CSS)
    const aantalNieuw = aanvragen.filter(function (a) { return a.status === "nieuw"; }).length;
    zoek("#leadCount").textContent = aantalNieuw > 0 ? aantalNieuw : "";
    zoek("#lNew").textContent = aantalNieuw;

    if (zichtbaar.length === 0) {
        const woord = (aanvraagFilter === "open") ? "openstaande " : "";
        zoek("#leadList").innerHTML =
            '<div class="empty"><strong style="color:var(--ink)">Geen ' + woord + 'aanvragen</strong><br>' +
            'Nieuwe aanvragen van woningzoekers verschijnen hier en worden ook naar uw e-mailadres gestuurd.</div>';
    } else {
        zoek("#leadList").innerHTML = zichtbaar.map(aanvraagHTML).join("");
    }
}

// --- KOPIËREN naar het klembord (e-mailadres of telefoonnummer)
function kopieer(tekst) {

    // Manier 1: de moderne Clipboard API.
    // Werkt alleen op https:// (of localhost) en moet direct na een klik gebeuren.
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(tekst)
            .then(function () {
                melding("Gekopieerd: " + tekst);
            })
            .catch(function () {
                kopieerOudeManier(tekst); // Geweigerd? Probeer de oude manier
            });
        return;
    }

    // Geen Clipboard API beschikbaar (bijv. op http://): oude manier
    kopieerOudeManier(tekst);
}

// Manier 2: tijdelijk tekstvak maken, tekst selecteren, browser laten kopiëren
function kopieerOudeManier(tekst) {
    const vak = document.createElement("textarea");
    vak.value = tekst;
    vak.setAttribute("readonly", "");     // Voorkomt dat het toetsenbord opent op mobiel
    vak.style.position = "fixed";         // Buiten beeld zetten, zodat de pagina niet verspringt
    vak.style.left = "-9999px";
    document.body.appendChild(vak);
    vak.select();

    let gelukt = false;
    try {
        gelukt = document.execCommand("copy"); // Oud, maar werkt nog in alle browsers
    } catch (fout) {
        gelukt = false;
    }
    document.body.removeChild(vak);

    if (gelukt) {
        melding("Gekopieerd: " + tekst);
    } else {
        // Lukt niets: toon de tekst, dan kan de gebruiker hem zelf overnemen
        melding(tekst);
    }
}


/* ==========================================================================
   7. STATISTIEKEN
   De cijfers zijn nu nagemaakt. Later komen ze uit de database.
   ========================================================================== */

let periode = 30; // 7, 30 of 90 dagen (knoppen rechtsboven)

// Maakt "willekeurige" getallen die bij elke keer laden hetzelfde zijn,
// zodat de voorbeeldgrafiek niet verandert. Alleen nodig voor de voorbeelddata.
function vasteWillekeur(start) {
    let s = start;
    return function () {
        s = Math.imul(s ^ (s >>> 15), 1 | s) + 0x6D2B79F5 | 0;
        return (s >>> 0) / 4294967296;
    };
}

// Voorbeeld: weergaven per dag voor de laatste 90 dagen
function voorbeeldWeergavenPerDag() {
    const willekeur = vasteWillekeur(7);
    const vandaag = new Date(2026, 9, 19); // 19 oktober 2026 (maanden tellen vanaf 0)
    const dagen = [];

    for (let i = 89; i >= 0; i--) {
        const datum = new Date(vandaag);
        datum.setDate(datum.getDate() - i);

        // In het weekend wat drukker
        const weekend = (datum.getDay() === 0 || datum.getDay() === 6);
        const factor = weekend ? 1.35 : 1;

        const aantal = Math.round((38 + willekeur() * 30) * factor + (90 - i) * 0.08);
        dagen.push({ datum: datum, aantal: aantal });
    }
    return dagen;
}

function tekenStatistieken() {
    // Alleen de dagen van de gekozen periode
    const dagen = voorbeeldWeergavenPerDag().slice(-periode);

    // Totalen
    let totaal = 0;
    dagen.forEach(function (dag) { totaal += dag.aantal; });
    const websiteClicks = Math.round(totaal * 0.027);
    const aanvragenAantal = Math.max(1, Math.round(totaal / 310));

    // Kerncijfers in de tegels
    zoek("#kV").textContent = getal(totaal);
    zoek("#kVh").innerHTML = '<span class="up">+12%</span> t.o.v. vorige periode';
    zoek("#kW").textContent = getal(websiteClicks);
    zoek("#kL").textContent = aanvragenAantal;
    zoek("#kA").textContent = (totaal / 584).toLocaleString("nl-NL", { maximumFractionDigits: 1 });

    tekenGrafiek(dagen);
    tekenTopAdvertenties();
}

// Staafgrafiek als SVG, precies zo breed als het vak op het scherm
function tekenGrafiek(dagen) {
    const breedte = Math.max(300, Math.round(zoek(".chart-wrap").clientWidth || 760));
    const hoogte = breedte < 500 ? 200 : 240;

    // Marges binnen de grafiek: links ruimte voor getallen, onder voor datums
    const links = 36, rechts = 6, boven = 14, onder = 30;

    // Hoogste waarde naar boven afronden op een veelvoud van 25
    let hoogste = 0;
    dagen.forEach(function (dag) { if (dag.aantal > hoogste) { hoogste = dag.aantal; } });
    const maximum = Math.ceil(hoogste / 25) * 25;

    // Rekent een aantal weergaven om naar een y-positie in de grafiek
    function yPositie(waarde) {
        return boven + (hoogte - boven - onder) * (1 - waarde / maximum);
    }

    const staafRuimte = (breedte - links - rechts) / dagen.length;
    let svg = "";

    // Horizontale hulplijnen met getal ervoor (0, 25, 50, ...)
    for (let stap = 0; stap <= maximum; stap += 25) {
        const y = yPositie(stap);
        svg += '<line x1="' + links + '" x2="' + (breedte - rechts) + '" y1="' + y + '" y2="' + y + '" stroke="#e5e7eb"/>';
        svg += '<text x="' + (links - 8) + '" y="' + (y + 4) + '" text-anchor="end" font-size="11" fill="#6b7280">' + stap + '</text>';
    }

    // Om de hoeveel staven een datum eronder? Zo veel dat de datums niet overlappen.
    const pastErOp = Math.floor((breedte - links - rechts) / 46);
    const minimaal = Math.max(1, Math.ceil(dagen.length / pastErOp));
    let datumElke;
    if (periode === 7)       { datumElke = 1; }
    else if (periode === 30) { datumElke = Math.max(minimaal, 5); }
    else                     { datumElke = Math.max(minimaal, 15); }

    // De staven
    dagen.forEach(function (dag, i) {
        const x = links + i * staafRuimte + staafRuimte * 0.15;
        const w = staafRuimte * 0.7;
        const y = yPositie(dag.aantal);
        const laatste = (i === dagen.length - 1); // Vandaag iets donkerder

        svg += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + (hoogte - onder - y) + '"' +
            ' rx="' + Math.min(3, w / 3) + '" fill="' + (laatste ? "#d46803" : "#EC7404") + '" opacity="' + (laatste ? 1 : 0.85) + '">' +
            '<title>' + dag.datum.toLocaleDateString("nl-NL") + ': ' + dag.aantal + ' weergaven</title></rect>';

        // Datum onder de staaf (geteld vanaf de laatste dag, zodat vandaag altijd een datum heeft)
        if ((dagen.length - 1 - i) % datumElke === 0) {
            const datumTekst = dag.datum.getDate() + "-" + (dag.datum.getMonth() + 1);
            svg += '<text x="' + (x + w / 2) + '" y="' + (hoogte - 10) + '" text-anchor="middle" font-size="11" fill="#6b7280">' + datumTekst + '</text>';
        }
    });

    const grafiek = zoek("#chart");
    grafiek.setAttribute("viewBox", "0 0 " + breedte + " " + hoogte);
    grafiek.innerHTML = svg;
}

// Tabel met de 6 best bekeken advertenties
function tekenTopAdvertenties() {
    const gesorteerd = advertenties.slice().sort(function (a, b) { return b.weergaven - a.weergaven; });
    const top = gesorteerd.slice(0, 6);
    const meeste = top[0].weergaven; // Voor de lengte van het balkje

    let rijen = "";
    top.forEach(function (ad) {
        const balkBreedte = Math.round(ad.weergaven / meeste * 80);
        // data-label wordt op mobiel als kopje voor de waarde getoond (zie CSS)
        rijen +=
            '<tr>' +
            '<td class="first"><strong>' + ad.type + '</strong> <span style="color:var(--muted)" class="num">· ' + ad.id + '</span></td>' +
            '<td data-label="Plaats">' + ad.plaats + ', ' + landNamen[ad.land] + '</td>' +
            '<td class="r" data-label="Weergaven"><span class="bar" style="width:' + balkBreedte + 'px"></span>' + getal(ad.weergaven) + '</td>' +
            '<td class="r" data-label="Website-clicks">' + Math.round(ad.weergaven * 0.03) + '</td>' +
            '<td class="r" data-label="Aanvragen">' + Math.round(ad.weergaven / 120) + '</td>' +
            '</tr>';
    });
    zoek("#topBody").innerHTML = rijen;
}

// Venster groter/kleiner of telefoon gedraaid: grafiek opnieuw tekenen.
// Met een korte wachttijd, zodat het niet bij elke pixel opnieuw gebeurt.
let resizeTimer;
window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(tekenStatistieken, 150);
});


/* ==========================================================================
   8. TARIEVEN
   ========================================================================== */

// Staffel DAG-tarief: van ... tot ... advertenties, prijs per advertentie per dag
const staffels = [
    { van: 0,    tot: 99,       prijs: 0.012 },
    { van: 100,  tot: 499,      prijs: 0.0095 },
    { van: 500,  tot: 999,      prijs: 0.00807 },
    { van: 1000, tot: Infinity, prijs: 0.0068 }
];

// Prestatie-tarief
const KLIK_TARIEF = 0.01; // per weergave
const WWW_TARIEF  = 1.50; // per klik naar de website van de makelaar
const LEAD_TARIEF = 9.00; // per informatieaanvraag

// Resultaten van de afgelopen 30 dagen (voorbeeld)
const afgelopen30 = { weergaven: 1556, websiteClicks: 42, aanvragen: 5 };

let opgeslagenTarief = "dag"; // "dag" of "prestatie"

function tariefNaam(tarief) {
    return tarief === "dag" ? "DAG-tarief" : "Prestatie-tarief";
}

function tekenTarieven() {

    // --- DAG-tarief rekenhulp
    let aantal = Number(zoek("#nAds").value);
    if (!aantal || aantal < 0) {
        aantal = 0;
    }
    const staffel = staffels.find(function (s) { return aantal >= s.van && aantal <= s.tot; });
    const perDag = aantal * staffel.prijs;
    const perMaand = perDag * 30;

    zoek("#rateDag").textContent = "€ " + staffel.prijs.toLocaleString("nl-NL", { minimumFractionDigits: 5 });
    if (staffel.tot === Infinity) {
        zoek("#tierTxt").textContent = "staffel " + getal(staffel.van) + "+ advertenties";
    } else {
        zoek("#tierTxt").textContent = "staffel " + getal(staffel.van) + "–" + getal(staffel.tot) + " advertenties";
    }
    zoek("#perDay").textContent = euro(perDag);
    zoek("#perMonth").textContent = euro(perMaand);

    // --- Prestatie-tarief over de afgelopen 30 dagen
    const prestatieKosten =
        afgelopen30.weergaven * KLIK_TARIEF +
        afgelopen30.websiteClicks * WWW_TARIEF +
        afgelopen30.aanvragen * LEAD_TARIEF;

    zoek("#presMonth").textContent = euro(prestatieKosten);
    zoek("#presCalc").textContent =
        getal(afgelopen30.weergaven) + " weergaven × € 0,01 + " +
        afgelopen30.websiteClicks + " website-clicks × € 1,50 + " +
        afgelopen30.aanvragen + " aanvragen × € 9,00";

    // --- Vergelijking: wat kostte het DAG-tarief de afgelopen 30 dagen?
    const dagKosten30 = 584 * 0.00807 * 30;
    const hoogsteKosten = Math.max(dagKosten30, prestatieKosten);
    const goedkoopste = (prestatieKosten < dagKosten30) ? "prestatie" : "dag";

    // Balk van het goedkoopste tarief oranje, de andere grijs (klasse "alt")
    function balk(naam, tarief, kosten) {
        const kleur = (goedkoopste === tarief) ? "" : "alt";
        const procent = kosten / hoogsteKosten * 100;
        return '<div class="bar-row">' +
            '<span>' + naam + '</span>' +
            '<span class="track"><span class="fill ' + kleur + '" style="width:' + procent + '%;display:block"></span></span>' +
            '<strong class="num" style="text-align:right">' + euro(kosten) + '</strong>' +
            '</div>';
    }
    zoek("#compare").innerHTML =
        balk("DAG-tarief", "dag", dagKosten30) +
        balk("Prestatie-tarief", "prestatie", prestatieKosten);

    zoek("#advice").innerHTML =
        'Met uw huidige aantal weergaven en aanvragen was het <strong>' + tariefNaam(goedkoopste) + '</strong> ' +
        'de afgelopen 30 dagen <strong>' + euro(Math.abs(dagKosten30 - prestatieKosten)) + '</strong> voordeliger.';

    // --- Opslaan-knop: alleen aan als de keuze anders is dan wat is opgeslagen
    const gekozen = zoek("input[name=plan]:checked").value;
    zoek("#savePlan").disabled = (gekozen === opgeslagenTarief);

    if (gekozen === opgeslagenTarief) {
        zoek("#planMsg").innerHTML = 'Uw huidige keuze: <strong>' + tariefNaam(opgeslagenTarief) + '</strong>';
    } else {
        zoek("#planMsg").innerHTML =
            '<span style="color:var(--brand-ink);font-weight:700">Nog niet opgeslagen:</span> ' +
            'overstappen naar het ' + tariefNaam(gekozen) + ' gaat in vanaf morgen.';
    }
}

// Aantal advertenties aangepast of ander tarief aangeklikt: opnieuw rekenen
zoek("#nAds").addEventListener("input", tekenTarieven);
zoekAlle("input[name=plan]").forEach(function (keuze) {
    keuze.addEventListener("change", tekenTarieven);
});

// Keuze opslaan (later: hier een verzoek naar PHP sturen)
zoek("#savePlan").addEventListener("click", function () {
    opgeslagenTarief = zoek("input[name=plan]:checked").value;
    zoek("#planPill").textContent = tariefNaam(opgeslagenTarief); // Pil in de bedrijfsband
    tekenTarieven();
    melding("Opgeslagen: u stapt morgen over op het " + tariefNaam(opgeslagenTarief));
});


/* ==========================================================================
   9. PREPAID-TEGOED
   ========================================================================== */

const KOSTEN_PER_DAG = 4.70; // Voor "± ... dagen" bij elk bedrag

const bedragen = [50, 100, 150, 200, 300, 500, 750, 1000];

const betaalmethoden = [
    { naam: "iDEAL | Wero",     uitleg: "direct" },
    { naam: "Creditcard",       uitleg: "Visa, Mastercard" },
    { naam: "PayPal",           uitleg: "direct" },
    { naam: "Bancontact",       uitleg: "België" },
    { naam: "Belfius",          uitleg: "België" },
    { naam: "Overboeking",      uitleg: "1–2 werkdagen" },
    { naam: "SEPA-overboeking", uitleg: "1–2 werkdagen" }
];

let gekozenBedrag = null;
let gekozenMethode = null;

// Knoppen voor de bedragen maken
let bedragKnoppen = "";
bedragen.forEach(function (bedrag) {
    const dagen = Math.floor(bedrag / KOSTEN_PER_DAG);
    bedragKnoppen +=
        '<button class="amt" aria-pressed="false" data-amt="' + bedrag + '">' +
        '<b>€ ' + getal(bedrag) + '</b><small>± ' + dagen + ' dagen</small>' +
        '</button>';
});
zoek("#amounts").innerHTML = bedragKnoppen;

// Knoppen voor de betaalmethoden maken
let methodeKnoppen = "";
betaalmethoden.forEach(function (methode) {
    methodeKnoppen +=
        '<button class="pay" aria-pressed="false" data-m="' + methode.naam + '">' +
        methode.naam + '<small>' + methode.uitleg + '</small>' +
        '</button>';
});
zoek("#pays").innerHTML = methodeKnoppen;

// Gekozen knoppen markeren, samenvatting en Betalen-knop bijwerken
function tekenBetaling() {
    zoekAlle(".amt").forEach(function (knop) {
        knop.setAttribute("aria-pressed", Number(knop.dataset.amt) === gekozenBedrag);
    });
    zoekAlle(".pay").forEach(function (knop) {
        knop.setAttribute("aria-pressed", knop.dataset.m === gekozenMethode);
    });

    if (gekozenBedrag && gekozenMethode) {
        zoek("#paySum").innerHTML =
            'U waardeert <strong>' + euro(gekozenBedrag) + '</strong> op via <strong>' + gekozenMethode + '</strong>. ' +
            'Daarmee kunt u ca. ' + Math.floor(gekozenBedrag / KOSTEN_PER_DAG) + ' dagen adverteren.';
    } else if (gekozenBedrag) {
        zoek("#paySum").innerHTML = 'Bedrag: <strong>' + euro(gekozenBedrag) + '</strong>. Kies nog een betaalmethode.';
    } else {
        zoek("#paySum").innerHTML = 'Kies een bedrag en een betaalmethode.';
    }

    // Betalen kan pas als bedrag, methode én akkoord voorwaarden zijn gekozen
    const klaar = gekozenBedrag && gekozenMethode && zoek("#agree").checked;
    zoek("#payBtn").disabled = !klaar;
    zoek("#payBtn").textContent = gekozenBedrag ? euro(gekozenBedrag) + " betalen" : "Betalen";
}

zoek("#agree").addEventListener("change", tekenBetaling);

// Overzicht van bij- en afschrijvingen (voorbeeld; later uit de database)
function tekenTransacties() {
    const gebeurtenissen = [];

    // Opwaardering op 6 september
    gebeurtenissen.push({ datum: new Date(2026, 8, 6), omschrijving: "Opwaardering via iDEAL", bedrag: 100 });

    // Daarna elke dag de advertentiekosten
    for (let i = 1; i <= 24; i++) {
        const datum = new Date(2026, 8, 6);
        datum.setDate(datum.getDate() + i);
        gebeurtenissen.push({ datum: datum, omschrijving: "Advertentiekosten DAG-tarief (582 adv.)", bedrag: -KOSTEN_PER_DAG });
    }

    // Opwaardering op 1 oktober
    gebeurtenissen.push({ datum: new Date(2026, 9, 1), omschrijving: "Opwaardering via Overboeking", bedrag: 50 });

    // Op datum zetten
    gebeurtenissen.sort(function (a, b) { return a.datum - b.datum; });

    // Saldo bijhouden; het saldo kan niet onder € 0 komen
    const rijen = [];
    let saldo = 0;
    gebeurtenissen.forEach(function (g) {
        let bedrag = g.bedrag;
        if (saldo + bedrag < 0) {
            bedrag = -saldo; // Alleen afschrijven wat er nog is
        }
        if (bedrag === 0) {
            return; // Niets afgeschreven: geen regel
        }
        const vorigSaldo = saldo;
        saldo = Math.round((saldo + bedrag) * 100) / 100; // Afronden op centen
        rijen.push({ datum: g.datum, omschrijving: g.omschrijving, bedrag: bedrag, vorig: vorigSaldo, nieuw: saldo });
    });

    // Laatste 12 regels, nieuwste bovenaan
    const laatste = rijen.slice(-12).reverse();

    let html = "";
    laatste.forEach(function (r) {
        const datum = r.datum.toLocaleDateString("nl-NL", { day: "2-digit", month: "2-digit", year: "numeric" });
        const bij = (r.bedrag > 0);
        html +=
            '<tr>' +
            // Op mobiel staat de omschrijving achter de datum (m-only), op desktop in een eigen kolom
            '<td class="num first">' + datum + '<span class="m-only"> · ' + r.omschrijving + '</span></td>' +
            '<td class="hide-m" data-label="Omschrijving">' + r.omschrijving + '</td>' +
            '<td class="r ' + (bij ? "plus" : "min") + '" data-label="Bij / af">' + (bij ? "+ " : "− ") + euro(Math.abs(r.bedrag)) + '</td>' +
            '<td class="r" data-label="Vorig saldo">' + euro(r.vorig) + '</td>' +
            '<td class="r" data-label="Nieuw saldo"><strong>' + euro(r.nieuw) + '</strong></td>' +
            '</tr>';
    });
    zoek("#txBody").innerHTML = html;
}


/* ==========================================================================
   10. MIJN GEGEVENS
   ========================================================================== */

const formulier = zoek("#form");

// Iets veranderd in het formulier: melding in de opslaan-balk
formulier.addEventListener("input", function () {
    zoek("#formMsg").textContent = "U heeft niet-opgeslagen wijzigingen.";
    zoek("#formMsg").classList.add("dirty");
});

// "Facturatieadres is hetzelfde": velden van het factuuradres verbergen
zoek("#same").addEventListener("change", function () {
    zoek("#billing").hidden = zoek("#same").checked;
});

// Opslaan
formulier.addEventListener("submit", function (e) {
    e.preventDefault(); // Pagina niet herladen (later: gegevens naar PHP sturen)

    // Zoek het eerste verplichte veld dat leeg is
    const verplichteVelden = Array.from(formulier.querySelectorAll("[required]"));
    const leegVeld = verplichteVelden.find(function (veld) {
        return veld.value.trim() === "";
    });

    if (leegVeld) {
        leegVeld.focus(); // Cursor in dat veld
        const labelTekstVeld = leegVeld.closest(".field").querySelector("label").textContent.replace("*", "").trim();
        melding("Vul eerst “" + labelTekstVeld + "” in", "warn");
        return;
    }

    zoek("#formMsg").textContent = "Alle wijzigingen zijn opgeslagen.";
    zoek("#formMsg").classList.remove("dirty");
    melding("Uw gegevens zijn opgeslagen");
});


/* ==========================================================================
   11. ALLE KLIKKEN OP ÉÉN PLEK
   De knoppen in de lijsten worden steeds opnieuw gemaakt. Daarom luisteren we
   niet op elke knop apart, maar op de hele pagina, en kijken we welke knop
   er geklikt is aan de hand van zijn data-...-attribuut.
   ========================================================================== */

document.addEventListener("click", function (e) {

    // Welke knop of link is er geklikt? (ook als je op het icoontje erin klikt)
    const knop = e.target.closest("button, a");
    if (!knop) {
        return; // Niet op een knop of link geklikt
    }

    // Links naar "#" zijn nog niet gekoppeld: niet naar boven springen
    if (knop.matches("a[href='#']")) {
        e.preventDefault();
    }

    const data = knop.dataset; // Alle data-... attributen van deze knop

    // --- Advertenties: statusfilter (Alle / Online / Offline / Verkocht-verhuurd)
    if (knop.closest("#adFilter") && data.f) {
        statusFilter = data.f;
        zoekAlle("#adFilter button").forEach(function (b) {
            b.setAttribute("aria-pressed", b === knop);
        });
        tekenAdvertenties();
    }

    // --- Advertenties: online/offline-schakelaar
    if (data.toggle) {
        const ad = vindAdvertentie(data.toggle);
        ad.online = !ad.online; // Omdraaien
        tekenAdvertenties();
        if (ad.online) {
            melding("Advertentie " + ad.id + " staat online");
        } else {
            melding("Advertentie " + ad.id + " staat offline. Hij is verborgen, niet verwijderd");
        }
    }

    // --- Advertenties: Label-knop (label-keuze open of dicht)
    if (data.lab) {
        const id = Number(data.lab);
        labelOpenId = (labelOpenId === id) ? null : id;
        verwijderOpenId = null; // Niet tegelijk de verwijder-vraag open
        tekenAdvertenties();
    }

    // --- Advertenties: label-keuze sluiten
    if (knop.hasAttribute("data-labclose")) {
        labelOpenId = null;
        tekenAdvertenties();
    }

    // --- Advertenties: een label kiezen (leeg = label weghalen)
    if (data.setlab !== undefined && data.id) {
        const ad = vindAdvertentie(data.id);
        ad.label = data.setlab || null;
        labelOpenId = null;
        tekenAdvertenties();
        if (ad.label) {
            melding("Label “" + labelTekst(ad, ad.label) + "” staat op advertentie " + ad.id);
        } else {
            melding("Label verwijderd van advertentie " + ad.id);
        }
    }

    // --- Advertenties: Verwijderen (eerst om bevestiging vragen)
    if (data.del) {
        verwijderOpenId = Number(data.del);
        labelOpenId = null;
        tekenAdvertenties();
    }

    // --- Advertenties: verwijderen geannuleerd
    if (knop.hasAttribute("data-no")) {
        verwijderOpenId = null;
        tekenAdvertenties();
    }

    // --- Advertenties: verwijderen bevestigd
    if (data.yes) {
        const positie = advertenties.findIndex(function (ad) { return ad.id === Number(data.yes); });
        advertenties.splice(positie, 1); // Uit de lijst halen
        verwijderOpenId = null;
        tekenAdvertenties();
        melding("Advertentie " + data.yes + " is verwijderd");
    }

    // --- Informatieaanvragen: filter (Openstaand / Beantwoord / Alle)
    if (knop.closest("#leadFilter") && data.f) {
        aanvraagFilter = data.f;
        zoekAlle("#leadFilter button").forEach(function (b) {
            b.setAttribute("aria-pressed", b === knop);
        });
        tekenAanvragen();
    }

    // --- Informatieaanvragen: markeren als beantwoord
    if (data.done) {
        const aanvraag = aanvragen.find(function (a) { return a.id === Number(data.done); });
        aanvraag.status = "beantwoord";
        tekenAanvragen();
        melding("Gemarkeerd als beantwoord");
    }

    // --- Informatieaanvragen: terugzetten naar openstaand
    if (data.reopen) {
        const aanvraag = aanvragen.find(function (a) { return a.id === Number(data.reopen); });
        aanvraag.status = "nieuw";
        tekenAanvragen();
    }

    // --- Informatieaanvragen: e-mail of telefoon kopiëren
    if (data.copy) {
        kopieer(data.copy);
    }

    // --- Statistieken: periode (7 / 30 / 90 dagen)
    if (data.d) {
        periode = Number(data.d);
        zoekAlle("#period button").forEach(function (b) {
            b.setAttribute("aria-pressed", b === knop);
        });
        tekenStatistieken();
    }

    // --- Prepaid: bedrag gekozen
    if (data.amt) {
        gekozenBedrag = Number(data.amt);
        tekenBetaling();
    }

    // --- Prepaid: betaalmethode gekozen
    if (data.m) {
        gekozenMethode = data.m;
        tekenBetaling();
    }
});


/* ==========================================================================
   12. OPSTARTEN: alles één keer tekenen en het juiste tabblad tonen
   ========================================================================== */

tekenAdvertenties();
tekenAanvragen();
tekenStatistieken();
tekenTarieven();
tekenBetaling();
tekenTransacties();

// Tabblad uit de adresbalk (#tarieven enz.), anders Advertenties
toonTabblad(location.hash.replace("#", ""));