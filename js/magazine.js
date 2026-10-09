/* Magazine page: article filters, "show more" and the region carousel. */
(function () {
    var PAGE = 9;
    var limit = PAGE;
    var active = 'Alles';
    var cards = Array.prototype.slice.call(document.querySelectorAll('.grid .card'));
    var filters = Array.prototype.slice.call(document.querySelectorAll('.filter'));
    var count = document.getElementById('articleCount');
    var moreWrap = document.getElementById('moreWrap');
    var moreButton = document.getElementById('moreButton');

    function applyFilter() {
        var matching = cards.filter(function (card) {
            return active === 'Alles' || card.getAttribute('data-cat') === active;
        });
        cards.forEach(function (card) { card.hidden = true; });
        matching.forEach(function (card, i) { card.hidden = i >= limit; });
        count.textContent = matching.length + (matching.length === 1 ? ' artikel' : ' artikelen');
        moreWrap.hidden = matching.length <= limit;
    }

    filters.forEach(function (button) {
        button.addEventListener('click', function () {
            active = button.getAttribute('data-filter');
            limit = PAGE;
            filters.forEach(function (b) { b.setAttribute('aria-pressed', String(b === button)); });
            applyFilter();
        });
    });

    moreButton.addEventListener('click', function () {
        limit += PAGE;
        applyFilter();
    });

    applyFilter();

    var track = document.getElementById('regionTrack');
    function slide(dir) {
        var amount = Math.max(280, track.clientWidth * 0.8) * dir;
        track.scrollBy({ left: amount, behavior: 'smooth' });
    }
    document.getElementById('regionPrev').addEventListener('click', function () { slide(-1); });
    document.getElementById('regionNext').addEventListener('click', function () { slide(1); });
})();