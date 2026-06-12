/* ==========================================================================
   AKITA — dynamic news rendering (news.html only)
   When the backend is reachable, articles come from /api/news and replace
   the static fallback; otherwise the static HTML stays untouched.
   Re-renders on language switch via the "akita:langchange" event.
   ========================================================================== */
(function () {
  'use strict';

  var staticWrap = document.getElementById('newsStatic');
  var app = document.getElementById('newsApp');
  if (!app || !staticWrap) return;

  var API_BASE = location.protocol === 'file:' ? 'http://localhost:4000' : '';
  var items = null;

  function lang() { return localStorage.getItem('akita-lang') || 'en'; }
  function pick(obj, field, l) { return obj[field + '_' + l] || obj[field + '_en'] || ''; }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function num(i) { return (i + 1 < 10 ? '0' : '') + (i + 1); }

  function render(l) {
    app.innerHTML = '';
    items.forEach(function (it, i) {
      var section = el('section', 'section');
      section.id = it.slug;

      var container = el('div', 'container');

      var head = el('header', 'sec-head');
      var kicker = el('p', 'kicker');
      kicker.appendChild(el('span', 'knum', num(i)));
      kicker.appendChild(el('span', null, pick(it, 'category', l)));
      head.appendChild(kicker);
      container.appendChild(head);

      var art = el('article', 'news-item');
      if (it.meta_label) art.appendChild(el('p', 'news-meta mono', it.meta_label));
      art.appendChild(el('h2', 'news-title', pick(it, 'title', l)));

      var sub = pick(it, 'subtitle', l);
      if (sub) art.appendChild(el('p', 'news-sub', sub));

      var body = el('div', 'news-body');
      pick(it, 'body', l).split(/\n\s*\n/).forEach(function (para) {
        para = para.trim();
        if (para) body.appendChild(el('p', null, para));
      });
      art.appendChild(body);

      if (it.facts && it.facts.length) {
        var dl = el('dl', 'fact-grid');
        it.facts.forEach(function (f) {
          var d = el('div');
          d.appendChild(el('dd', null, f['value_' + l] || f.value_en));
          d.appendChild(el('dt', null, f['label_' + l] || f.label_en));
          dl.appendChild(d);
        });
        art.appendChild(dl);
      }

      container.appendChild(art);
      section.appendChild(container);
      app.appendChild(section);
    });
  }

  function renderSubnav(l) {
    var nav = document.getElementById('newsSubnav');
    if (!nav) return;
    nav.innerHTML = '';
    items.forEach(function (it, i) {
      var a = document.createElement('a');
      a.href = '#' + it.slug;
      a.appendChild(el('span', 'snum', num(i)));
      a.appendChild(el('span', null, pick(it, 'category', l)));
      nav.appendChild(a);
    });
  }

  fetch(API_BASE + '/api/news')
    .then(function (r) { return r.json(); })
    .then(function (j) {
      if (!j || !j.ok || !j.items || !j.items.length) return;
      items = j.items;
      render(lang());
      renderSubnav(lang());
      staticWrap.style.display = 'none';

      document.addEventListener('akita:langchange', function (e) {
        render(e.detail.lang);
        renderSubnav(e.detail.lang);
      });

      if (location.hash) {
        var target = document.getElementById(location.hash.slice(1));
        if (target) target.scrollIntoView();
      }
    })
    .catch(function () { /* backend unavailable — static fallback remains */ });
})();
