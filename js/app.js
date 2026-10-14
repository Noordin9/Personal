(function () {
    document.documentElement.classList.add('js');
    var button = document.getElementById('langbutton');
    var menu = document.getElementById('langmenu');
    var navButton = document.getElementById('navtoggle');
    var nav = document.getElementById('mainnav');

    navButton.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        navButton.setAttribute('aria-expanded', String(open));
        navButton.textContent = open ? 'Sluiten' : 'Menu';
    });

    function close() {
        menu.hidden = true;
        button.setAttribute('aria-expanded', 'false');
    }

    button.addEventListener('click', function (event) {
        event.stopPropagation();
        var open = menu.hidden;
        menu.hidden = !open;
        button.setAttribute('aria-expanded', String(open));
        if (open) { menu.querySelector('a').focus(); }
    });

    /* prototype: een taal kiezen zet de vlag in de knop; echte links naar
       de taalversies kunnen later in de href's van het menu */
    menu.addEventListener('click', function (event) {
        var item = event.target.closest('a');
        if (!item || item.getAttribute('href')) { return; }
        event.preventDefault();
        var items = menu.querySelectorAll('a');
        for (var i = 0; i < items.length; i++) { items[i].removeAttribute('aria-current'); }
        item.setAttribute('aria-current', 'true');
        button.querySelector('.lang-current').innerHTML = item.querySelector('.flag').outerHTML;
        button.setAttribute('aria-label', 'Taal wijzigen, huidige taal ' + item.querySelector('.lang-name').textContent);
        close();
        button.focus();
    });

    document.addEventListener('click', function (event) {
        if (!menu.hidden && !menu.contains(event.target)) { close(); }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape') { return; }
        if (!menu.hidden) {
            close();
            button.focus();
        }
        if (nav.classList.contains('open')) {
            nav.classList.remove('open');
            navButton.setAttribute('aria-expanded', 'false');
            navButton.textContent = 'Menu';
            navButton.focus();
        }
    });

    /* ---------- Prototype: header A of B ----------
       De definitieve keuze is een template-instelling: zet data-header="a" of "b"
       op <html> en verwijder dit blok en de .proto-switch-CSS. */
    var root = document.documentElement;
    function setVariant(v) {
        root.setAttribute('data-header', v);
        try { localStorage.setItem('ha-header', v); } catch (e) {}
        var bs = document.querySelectorAll('.proto-switch button');
        for (var i = 0; i < bs.length; i++) {
            bs[i].setAttribute('aria-pressed', String(bs[i].getAttribute('data-variant') === v));
        }
    }
    var bar = document.createElement('div');
    bar.className = 'proto-switch';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Prototype: kies headervariant');
    bar.innerHTML = '<span>Header</span><button type="button" data-variant="a">A</button><button type="button" data-variant="b">B</button>';
    bar.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (b) { setVariant(b.getAttribute('data-variant')); }
    });
    /* Header A is gekozen. De schakelaar blijft bewaard voor een toekomstige licht/donker-knop:
    document.body.appendChild(bar);
    setVariant(root.getAttribute('data-header') === 'b' ? 'b' : 'a');
    */
})();