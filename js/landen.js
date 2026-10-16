/* Weten & Wonen · landkeuze: zoeken, regiofilter en (prototype) weergave */
(function () {
    var input = document.getElementById('countryQuery');
    var form = document.getElementById('countrySearch');
    var feat = document.querySelector('.landen-feat');
    var items = document.querySelectorAll('#countryCloud li');
    var pills = document.querySelectorAll('.landen-all .filter');
    var none = document.getElementById('noResult');
    var region = 'Alle';

    function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim(); }

    function apply() {
        var q = norm(input.value);
        var shown = 0;
        feat.hidden = q !== '';
        items.forEach(function (li) {
            var inRegion = region === 'Alle' || li.getAttribute('data-region') === region;
            var ok = inRegion && (q === '' || norm(li.querySelector('a').getAttribute('data-name')).indexOf(q) !== -1);
            li.hidden = !ok;
            if (ok) { shown++; }
        });
        none.hidden = shown !== 0;
    }

    input.addEventListener('input', apply);
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var first = document.querySelector('#countryCloud li:not([hidden]) a');
        if (first && input.value.trim() !== '') { first.click(); }
    });
    pills.forEach(function (b) {
        b.addEventListener('click', function () {
            region = b.getAttribute('data-region');
            pills.forEach(function (p) { p.setAttribute('aria-pressed', String(p === b)); });
            apply();
        });
    });
    document.getElementById('resetSearch').addEventListener('click', function () {
        input.value = ''; region = 'Alle';
        pills.forEach(function (p) { p.setAttribute('aria-pressed', String(p.getAttribute('data-region') === 'Alle')); });
        apply();
    });

})();