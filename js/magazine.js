/* Artikelen op de landenpagina: filteren per onderwerp, maximaal 6 kaarten zichtbaar.
   "Meer artikelen tonen" is een gewone link naar de artikelpagina. */
(function () {
    var LIMIT = 6;
    var cards = Array.prototype.slice.call(document.querySelectorAll('.grid .card[data-cat]'));
    var filters = Array.prototype.slice.call(document.querySelectorAll('.filter'));
    if (!cards.length || !filters.length) { return; }
    function apply(cat) {
        var shown = 0;
        cards.forEach(function (card) {
            var match = cat === 'Alles' || card.getAttribute('data-cat') === cat;
            card.hidden = !match || shown >= LIMIT;
            if (match && shown < LIMIT) { shown++; }
        });
    }
    filters.forEach(function (button) {
        button.addEventListener('click', function () {
            filters.forEach(function (b) { b.setAttribute('aria-pressed', String(b === button)); });
            apply(button.getAttribute('data-filter'));
        });
    });
    apply('Alles');
})();

/* Regio's: handmatig bladeren met de pijlen, geen automatische carrousel. */
(function () {
    var track = document.getElementById('regionTrack');
    var prev = document.getElementById('regionPrev');
    var next = document.getElementById('regionNext');
    if (!track || !prev || !next) { return; }
    function slide(dir) {
        var amount = Math.max(280, track.clientWidth * 0.8) * dir;
        track.scrollBy({ left: amount, behavior: 'smooth' });
    }
    prev.addEventListener('click', function () { slide(-1); });
    next.addEventListener('click', function () { slide(1); });
})();

/* Hoofdtekst: Lees verder / Minder tonen. De volledige tekst staat in de HTML;
   zonder JavaScript is alles zichtbaar. */
(function () {
    var btn = document.getElementById('readMore');
    var more = document.getElementById('meer-tekst');
    if (!btn || !more) { return; }
    function setOpen(open) {
        more.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', String(open));
        btn.textContent = open ? 'Minder tonen' : 'Lees verder';
    }
    function targetInside() {
        var id = decodeURIComponent(location.hash.slice(1));
        var el = id ? document.getElementById(id) : null;
        return el && more.contains(el) ? el : null;
    }
    btn.hidden = false;
    var start = targetInside();
    setOpen(!!start);
    if (start) { start.scrollIntoView(); }
    btn.addEventListener('click', function () {
        var open = !more.classList.contains('is-open');
        setOpen(open);
        if (!open) { btn.scrollIntoView({ block: 'nearest' }); }
    });
    window.addEventListener('hashchange', function () {
        var el = targetInside();
        if (el) { setOpen(true); el.scrollIntoView(); }
    });
})();