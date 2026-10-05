/* KR / EN switch — swaps text, image descriptions and stat blocks in place */
(function () {
  var EN = window.NC_EN || {};
  var textOrig = new Map(), attrOrig = [], statOrig = new Map();
  var root = document.querySelector('[data-nc]');
  var TITLE_KO = document.title;
  var TITLE_EN = "Narrative Club — A private members' club for business leaders reshaping their companies with AI";
  function norm(s) { return s.replace(/\s+/g, ' ').trim(); }
  function textNodes() {
    var out = [], w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) {
      var p = n.parentNode && n.parentNode.nodeName;
      if (p === 'SCRIPT' || p === 'STYLE') continue;
      out.push(n);
    }
    return out;
  }
  function toEn() {
    textNodes().forEach(function (n) {
      var key = norm(n.nodeValue);
      if (!key || !Object.prototype.hasOwnProperty.call(EN, key)) return;
      if (!textOrig.has(n)) textOrig.set(n, n.nodeValue);
      var lead = n.nodeValue.match(/^\s*/)[0], trail = n.nodeValue.match(/\s*$/)[0];
      n.nodeValue = lead + EN[key] + trail;
    });
    root.querySelectorAll('[alt],[aria-label]').forEach(function (el) {
      ['alt', 'aria-label'].forEach(function (a) {
        var v = el.getAttribute(a); if (!v) return;
        var key = norm(v);
        if (Object.prototype.hasOwnProperty.call(EN, key)) { attrOrig.push([el, a, v]); el.setAttribute(a, EN[key]); }
      });
    });
    root.querySelectorAll('[data-en-big]').forEach(function (el) {
      if (!statOrig.has(el)) statOrig.set(el, el.innerHTML);
      var u = el.getAttribute('data-en-unit'), us = el.getAttribute('data-en-ustyle') || '';
      el.textContent = el.getAttribute('data-en-big');
      if (u) { var sp = document.createElement('span'); sp.setAttribute('style', us); sp.textContent = u; el.appendChild(sp); }
    });
  }
  function toKo() {
    textOrig.forEach(function (v, n) { n.nodeValue = v; }); textOrig.clear();
    attrOrig.forEach(function (r) { r[0].setAttribute(r[1], r[2]); }); attrOrig = [];
    statOrig.forEach(function (v, el) { el.innerHTML = v; }); statOrig.clear();
  }
  function setLang(lang, save) {
    var cur = document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'ko';
    if (lang === cur && save !== 'init') return;
    if (lang === 'en') toEn(); else if (cur === 'en') toKo();
    document.documentElement.setAttribute('lang', lang);
    document.title = lang === 'en' ? TITLE_EN : TITLE_KO;
    document.querySelectorAll('[data-lang-toggle]').forEach(function (b) {
      b.setAttribute('aria-label', lang === 'en' ? '한국어로 보기' : 'View in English');
    });
    if (save) { try { localStorage.setItem('nc-lang', lang); } catch (e) {} }
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-lang-toggle]');
    if (!b) return;
    var cur = document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'ko';
    setLang(cur === 'en' ? 'ko' : 'en', true);
  });
  var start = 'ko';
  try {
    var q = new URLSearchParams(location.search).get('lang');
    start = q === 'en' || q === 'ko' ? q : (localStorage.getItem('nc-lang') || 'ko');
  } catch (e) {}
  setLang(start === 'en' ? 'en' : 'ko', 'init');

  // mobile menu
  var hdr = document.querySelector('[data-hdr]');
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-menu-toggle]');
    if (t) {
      var open = !hdr.hasAttribute('data-menu');
      if (open) hdr.setAttribute('data-menu', '1'); else hdr.removeAttribute('data-menu');
      t.setAttribute('aria-expanded', open ? 'true' : 'false');
      return;
    }
    if (hdr.hasAttribute('data-menu') && e.target.closest && e.target.closest('.navwrap .navbtn, [data-go]')) {
      hdr.removeAttribute('data-menu');
      var mb = document.querySelector('[data-menu-toggle]'); if (mb) mb.setAttribute('aria-expanded', 'false');
    }
  });
})();
