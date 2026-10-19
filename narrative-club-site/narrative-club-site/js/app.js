/* Narrative Club — static runtime (replaces the Claude canvas runtime) */
(function () {
  var PAGES = ['about', 'benefits', 'lounge', 'clubhouse', 'apply'];
  function pageFromHash() {
    var h = (location.hash || '').replace(/^#\/?/, '');
    return PAGES.indexOf(h) >= 0 ? h : 'about';
  }
  var comp = new Component({ startPage: pageFromHash() });

  function apply(prev) {
    var st = comp.state, root = document.querySelector('[data-nc]');
    // pages
    var pages = root.querySelectorAll('[data-page]');
    for (var i = 0; i < pages.length; i++) {
      if (pages[i].getAttribute('data-page') === st.page) pages[i].removeAttribute('hidden');
      else pages[i].setAttribute('hidden', '');
    }
    // header nav active state
    var nb = root.querySelectorAll('header .navbtn[data-go]');
    for (var j = 0; j < nb.length; j++) {
      var on = nb[j].getAttribute('data-go') === st.page;
      nb[j].style.color = on ? '#1C1C1C' : '#7A7A76';
      var bar = nb[j].querySelector('.bar'); if (bar) bar.style.width = on ? '100%' : '0%';
    }
    // lounge zones
    var zb = root.querySelectorAll('[data-zone]');
    for (var k = 0; k < zb.length; k++) {
      var zon = parseInt(zb[k].getAttribute('data-zone'), 10) === st.zone;
      zb[k].style.color = zon ? '#1C1C1C' : '#8A8A86';
      var spans = zb[k].querySelectorAll(':scope > span');
      if (spans[0]) spans[0].style.background = zon ? '#1C1C1C' : '#DADAD6';
      if (spans.length) spans[spans.length - 1].style.width = zon ? '40px' : '0px';
    }
    var zp = root.querySelectorAll('#l-zones .fpanel');
    for (var m = 0; m < zp.length; m++) zp[m].style.display = m === st.zone ? 'block' : 'none';
    // accordions
    var ab = root.querySelectorAll('[data-acc]');
    for (var n = 0; n < ab.length; n++) {
      var key = ab[n].getAttribute('data-acc'), idx = parseInt(ab[n].getAttribute('data-i'), 10);
      var open = (key === 'faq' ? st.faq : st.mem) === idx;
      var body = ab[n].nextElementSibling; if (body) body.style.gridTemplateRows = open ? '1fr' : '0fr';
      var is = ab[n].querySelectorAll('.plus i'); if (is[1]) is[1].style.transform = open ? 'rotate(0deg)' : 'rotate(90deg)';
    }
    if (prev && prev.page !== st.page) {
      if (comp.componentDidUpdate) comp.componentDidUpdate(comp.props, prev);
      var want = st.page === 'about' ? '' : '#/' + st.page;
      if ((location.hash || '') !== want) { try { history.replaceState(null, '', want || location.pathname + location.search); } catch (er) {} }
    }
  }
  comp.setState = function (o) {
    var prev = {}; for (var k in this.state) prev[k] = this.state[k];
    for (var k2 in o) this.state[k2] = o[k2];
    apply(prev);
  };

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-go],[data-zone],[data-acc]') : null;
    if (!t) return;
    if (t.hasAttribute('data-go')) { comp.setState({ page: t.getAttribute('data-go') }); return; }
    if (t.hasAttribute('data-zone')) { comp.setState({ zone: parseInt(t.getAttribute('data-zone'), 10) }); return; }
    var key = t.getAttribute('data-acc'), i = parseInt(t.getAttribute('data-i'), 10);
    var cur = key === 'faq' ? comp.state.faq : comp.state.mem;
    var o = {}; o[key] = cur === i ? -1 : i; comp.setState(o);
  });
  window.addEventListener('hashchange', function () {
    var p = pageFromHash(); if (p !== comp.state.page) comp.setState({ page: p });
  });

  apply(null);
  comp.componentDidMount();
})();
