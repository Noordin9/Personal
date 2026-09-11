(function () {
    var button = document.getElementById('langbutton');
    var menu = document.getElementById('langmenu');
    var navButton = document.getElementById('navtoggle');
    var nav = document.getElementById('mainnav');

    navButton.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        navButton.setAttribute('aria-expanded', String(open));
        navButton.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
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
            navButton.focus();
        }
    });
})();