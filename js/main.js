/* ==========================================================================
   AKITA GROUP — interactions (multi-page)
   Theme toggle · trilingual switch (EN/FR/ZH) · nav active state ·
   scroll reveal · stat counters · ticker loop · mailto forms · tracking
   ========================================================================== */
(function () {
  'use strict';

  var doc = document.documentElement;
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- theme ---------- */
  var THEME_COLORS = { light: '#ffffff', dark: '#0f1117' };

  function applyTheme(theme) {
    doc.dataset.theme = theme;
    localStorage.setItem('akita-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLORS[theme] || THEME_COLORS.light);
  }

  var themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      applyTheme(doc.dataset.theme === 'dark' ? 'light' : 'dark');
    });
  }

  // keep meta theme-color in sync with the pre-paint script in <head>
  applyTheme(doc.dataset.theme || 'light');

  /* ---------- language (EN / FR / ZH) ----------
     English lives in the markup; FR/ZH live in data-fr / data-zh
     (and data-ph-fr / data-ph-zh for input placeholders).
     The page <title> carries data-fr / data-zh too. */
  var i18nNodes = Array.prototype.slice.call(document.querySelectorAll('[data-fr], [data-zh]'));
  i18nNodes.forEach(function (el) {
    if (el.dataset.en === undefined) el.dataset.en = el.textContent.trim();
  });

  var phNodes = Array.prototype.slice.call(document.querySelectorAll('[data-ph-fr], [data-ph-zh]'));
  phNodes.forEach(function (el) {
    if (el.dataset.phEn === undefined) el.dataset.phEn = el.getAttribute('placeholder') || '';
  });

  function setLang(lang) {
    i18nNodes.forEach(function (el) {
      var text = lang === 'en' ? el.dataset.en : (el.dataset[lang] || el.dataset.en);
      el.textContent = text;
    });
    phNodes.forEach(function (el) {
      var ph = lang === 'en' ? el.dataset.phEn
        : (lang === 'fr' ? el.dataset.phFr : el.dataset.phZh) || el.dataset.phEn;
      el.setAttribute('placeholder', ph);
    });
    doc.lang = lang === 'zh' ? 'zh-CN' : lang;
    localStorage.setItem('akita-lang', lang);

    document.querySelectorAll('.lang-switch button').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.dataset.lang === lang);
    });
  }

  document.querySelectorAll('.lang-switch button').forEach(function (btn) {
    btn.addEventListener('click', function () { setLang(btn.dataset.lang); });
  });

  var savedLang = localStorage.getItem('akita-lang');
  if (savedLang && savedLang !== 'en') setLang(savedLang);
  else setLang('en');

  /* ---------- active nav item (by current page) ---------- */
  var page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav .nav-item > a, .main-nav > a').forEach(function (a) {
    var target = (a.getAttribute('href') || '').split('#')[0];
    if (target && target === page) {
      a.classList.add('is-active');
      a.setAttribute('aria-current', 'page');
    }
  });

  /* ---------- header state ---------- */
  var head = document.querySelector('.site-head');
  function onScroll() { if (head) head.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile nav ---------- */
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');

  function closeNav() {
    document.body.classList.remove('nav-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    mainNav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (prefersReduced) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  }

  /* ---------- stat counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.dataset.count);
    if (prefersReduced || !isFinite(target)) { el.textContent = el.dataset.count; return; }
    var dur = 1300;
    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = el.dataset.count;
    }
    requestAnimationFrame(frame);
  }

  var countObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('.count').forEach(function (el) { countObs.observe(el); });

  /* ---------- ticker: duplicate items for a seamless loop ---------- */
  var track = document.getElementById('tickerTrack');
  if (track) {
    var clone = track.cloneNode(true);
    Array.prototype.forEach.call(clone.children, function (item) {
      item.setAttribute('aria-hidden', 'true');
      track.appendChild(item);
    });
    // re-collect i18n nodes so the cloned half follows language switches
    Array.prototype.slice.call(track.querySelectorAll('[data-fr], [data-zh]')).forEach(function (el) {
      if (el.dataset.en === undefined) el.dataset.en = el.textContent.trim();
      if (i18nNodes.indexOf(el) === -1) i18nNodes.push(el);
    });
    var lang = localStorage.getItem('akita-lang') || 'en';
    if (lang !== 'en') setLang(lang);
  }

  /* ---------- contact form → mailto ---------- */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var get = function (n) { return (form.elements[n] && form.elements[n].value || '').trim(); };
      var service = form.elements.service;
      var serviceLabel = service && service.options[service.selectedIndex]
        ? service.options[service.selectedIndex].textContent.trim() : '';

      var subject = 'Enquiry — ' + (serviceLabel && service.selectedIndex > 0 ? serviceLabel : 'Logistics services');
      var lines = [
        'Name: ' + get('name'),
        'Company: ' + get('company'),
        'Email: ' + get('email')
      ];
      if (get('phone')) lines.push('Phone / WhatsApp: ' + get('phone'));
      if (get('origin') || get('destination')) {
        lines.push('Route: ' + (get('origin') || '—') + ' → ' + (get('destination') || '—'));
      }
      lines.push('Service: ' + serviceLabel, '', get('message'));

      window.location.href = 'mailto:logistics@akitagn.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(lines.join('\n'));
    });
  }

  /* ---------- cargo tracking → mailto (placeholder until system hookup) ---------- */
  document.querySelectorAll('form[data-track]').forEach(function (tf) {
    tf.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = tf.querySelector('input');
      var v = input ? input.value.trim() : '';
      if (!v) { if (input) input.focus(); return; }
      window.location.href = 'mailto:logistics@akitagn.com'
        + '?subject=' + encodeURIComponent('Cargo tracking request — ' + v)
        + '&body=' + encodeURIComponent('Please send the latest status for: ' + v);
    });
  });

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
