/* Page logic (smooth scroll, reveals, dark mode, downloads) */
class DCLogic { constructor(p) { this.props = p || {}; this.state = {}; } setState() {} }
class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { page: props.startPage || 'about', floor: 1, faq: 0, mem: -1, zone: 0 };
  }
  componentDidUpdate(pp, ps) {
    if (this.props.startPage && pp.startPage !== this.props.startPage) this.setState({ page: this.props.startPage });
    if (ps.page !== this.state.page && this._onPage) this._onPage();
  }
  componentDidMount() {
    var self = this;
    var root = document.querySelector('[data-nc]');
    if (!root) return;
    root.setAttribute('data-js', '');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    var q = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };
    var lerp = function (a, b, t) { return a + (b - a) * t; };
    var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

    // reveal: checked every frame (works in canvas, focused view and nested scrollers)
    var revealed = 0;
    var reveal = function (vh) {
      var els = root.querySelectorAll('[data-rv]:not([data-in])');
      for (var i = 0; i < els.length; i++) {
        var r = els[i].getBoundingClientRect();
        if (r.top < vh * 0.94 && r.bottom > -40) { els[i].setAttribute('data-in', ''); revealed++; }
      }
    };
    var observe = function () { reveal(window.innerHeight || 900); };
    observe();
    setTimeout(function () {
      if (!revealed) { q('[data-rv]').forEach(function (el) { el.setAttribute('data-in', ''); }); }
    }, 1800);

    var findScroller = function () {
      var n = root.parentElement;
      while (n && n !== document.body && n !== document.documentElement) {
        var s = getComputedStyle(n);
        if (/(auto|scroll)/.test(s.overflowY) && n.scrollHeight > n.clientHeight + 2) return n;
        n = n.parentElement;
      }
      return document.scrollingElement || document.documentElement;
    };
    var sc = findScroller();
    var docSc = sc === (document.scrollingElement || document.documentElement);
    var maxS = function () { return sc.scrollHeight - sc.clientHeight; };
    var target = sc.scrollTop, cur = target, gliding = false;

    var toTop = function () {
      sc = findScroller(); docSc = sc === (document.scrollingElement || document.documentElement);
      gliding = false;
      var n = root.parentElement;
      while (n) { if (n.scrollTop) n.scrollTop = 0; n = n.parentElement; }
      if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
      try { window.scrollTo(0, 0); } catch (er3) {}
      target = cur = sc.scrollTop;
    };
    var lastPage = self.state.page;
    this._onPage = function () {
      lastPage = self.state.page;
      toTop();
      requestAnimationFrame(function () { toTop(); observe(); });
      setTimeout(function () { toTop(); observe(); }, 60);
    };

    var onWheel = function (e) {
      if (reduce || !fine || e.ctrlKey || maxS() <= 2) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (!gliding) target = cur = sc.scrollTop;
      gliding = true;
      var dy = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? sc.clientHeight : 1);
      target = clamp(target + dy, 0, maxS());
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    var onClick = function (e) {
      var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a || !root.contains(a)) return;
      var el = root.querySelector('[id="' + a.getAttribute('href').slice(1) + '"]');
      if (!el) return;
      e.preventDefault(); e.stopPropagation();
      var base = docSc ? 0 : sc.getBoundingClientRect().top;
      cur = sc.scrollTop;
      target = clamp(el.getBoundingClientRect().top - base + sc.scrollTop - 88, 0, maxS());
      gliding = true;
    };
    root.addEventListener('click', onClick, true);



    // ---- file download (lounge brochure) ----
    var onDl = function (e) {
      var a = e.target.closest ? e.target.closest('a[data-dl]') : null;
      if (!a || !root.contains(a)) return;
      e.preventDefault(); e.stopPropagation();
      var href = a.getAttribute('href'), name = a.getAttribute('data-dl');
      var viaAnchor = function (blob) {
        try {
          var u = URL.createObjectURL(blob), t = document.createElement('a');
          t.href = u; t.download = name; t.style.display = 'none'; document.body.appendChild(t); t.click();
          setTimeout(function () { URL.revokeObjectURL(u); t.remove(); }, 1500);
        } catch (er) { window.open(href, '_blank'); }
      };
      fetch(href).then(function (r) { return r.blob(); }).then(function (blob) {
        var cl = window.claude;
        var p = cl && cl.use ? Promise.race([cl.use('downloads'), new Promise(function (res) { setTimeout(function () { res(null); }, 1500); })]) : Promise.resolve(null);
        return p.then(function (dlc) {
          if (!dlc) { viaAnchor(blob); return; }
          return dlc.save({ filename: name, data: blob }).catch(function (err) {
            if (err && (err.code === 'declined' || err.code === 'rate_limited')) return;
            viaAnchor(blob);
          });
        });
      }).catch(function () { window.open(href, '_blank'); });
    };
    root.addEventListener('click', onDl, true);
    var prog = root.querySelector('[data-prog]');
    var ix = 0, iw = 0, pv = 0, lastSub = null;
    var tick = function () {
      if (self.state.page !== lastPage) self._onPage();
      var k = self.props.smoothness != null ? self.props.smoothness : 0.085;
      if (gliding) {
        cur = lerp(cur, target, k);
        if (Math.abs(target - cur) < 0.4) { cur = target; gliding = false; }
        sc.scrollTop = cur;
      } else { cur = target = sc.scrollTop; }
      var vh = window.innerHeight, m = maxS();
      reveal(vh || 900);
      pv = lerp(pv, m > 0 ? sc.scrollTop / m : 0, 0.12);
      if (prog) prog.style.transform = 'scaleX(' + pv.toFixed(4) + ')';
      if (!reduce) q('[data-par]').forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        el.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - vh / 2) * -0.03).toFixed(1) + 'px,0)';
      });
      var dz = root.querySelector('[data-dz]');
      var dmOn = false;
      if (dz) { var zr = dz.getBoundingClientRect(); dmOn = zr.top <= 150 && zr.bottom > vh * 0.45; }
      if (dmOn !== root.hasAttribute('data-dm')) { if (dmOn) root.setAttribute('data-dm', '1'); else root.removeAttribute('data-dm'); }
      var sub = root.querySelector('[data-sub]');
      if (sub !== lastSub) { lastSub = sub; ix = 0; iw = 0; }
      if (sub) {
        var active = null, aEl = null;
        q('[data-spy]').forEach(function (s) { if (s.getBoundingClientRect().top < vh * 0.42) active = s.getAttribute('data-spy'); });
        Array.prototype.forEach.call(sub.querySelectorAll('[data-spylink]'), function (l) {
          if (l.getAttribute('data-spylink') === active) { l.setAttribute('data-on', ''); aEl = l; } else l.removeAttribute('data-on');
        });
        var ind = sub.querySelector('[data-ind]');
        if (ind) {
          ix = lerp(ix, aEl ? aEl.offsetLeft : ix, 0.14);
          iw = lerp(iw, aEl ? aEl.offsetWidth : 0, 0.14);
          ind.style.transform = 'translateX(' + ix.toFixed(1) + 'px)';
          ind.style.width = iw.toFixed(1) + 'px';
        }
      }
      self._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
    this._cleanup = function () {
      cancelAnimationFrame(self._raf);
      root.removeEventListener('click', onDl, true);
      window.removeEventListener('wheel', onWheel);
      root.removeEventListener('click', onClick, true);
    };
  }
  componentWillUnmount() { if (this._cleanup) this._cleanup(); }

  renderVals() {
    var self = this, st = this.state;
    var go = function (p) { return function () { self.setState({ page: p }); }; };
    var pages = [['about', '소개'], ['benefits', '멤버십'], ['lounge', '라운지'], ['clubhouse', '클럽하우스']];
    var nav = pages.map(function (p) {
      var on = st.page === p[0];
      return { label: p[1], go: go(p[0]), color: on ? '#1C1C1C' : '#7A7A76', w: on ? '100%' : '0%' };
    });
    var fl = [
      { lv: 'RF', en: 'ROOFTOP', ko: '루프탑 테라스', tone: '#6B6B67', img: '/_blob/d4d532509237943310108fb4724cde7d', photo: '', desc: '바비큐와 소규모 밋업이 열리는 야외 라운지. 서울숲과 남산이 보입니다.' },
      { lv: '4F', en: 'WELLNESS · MEMBERS ONLY', ko: '웰니스 라운지 · 테라스', tone: '#4E4E4B', photo: 'PHOTO · 4층 실내와 테라스 (31e005c1e9e9.jpg)', desc: '라운지, 외기욕 테라스, 콜드플런지. 일하다 올라와 몸을 식히는 층입니다.' },
      { lv: '3F', en: 'OFFICE', ko: 'Narrative 오피스', tone: '#8A8A86', photo: 'PHOTO · 3F 오피스', desc: '클럽 운영팀이 상주합니다.' },
      { lv: '2F', en: 'LOUNGE · CO-WORK', ko: '라운지 · 코워킹', tone: '#5E5E5B', photo: 'PHOTO · 2F 라운지', desc: '미팅룸 2개. 창가 집중석, 협업 테이블, 소파 라운지.' },
      { lv: '1F', en: 'CAFÉ · BAR · TERRACE', ko: '카페 · 바 · 테라스', tone: '#737370', photo: 'PHOTO · 1F 카페 · 바', desc: '낮에는 카페, 밤에는 바. 폴딩도어를 열면 테라스와 하나로 이어집니다.' },
      { lv: 'B1', en: 'EVENT HALL', ko: '카페 · 바 · 이벤트홀', tone: '#3E3E3C', photo: 'PHOTO · B1 이벤트홀', desc: '세미나 · 데모데이 · 파티에 맞춰 바뀌는 가변형 홀.' }
    ];
    var floors = fl.map(function (f, i) {
      var on = i === st.floor;
      return { lv: f.lv, ko: f.ko, color: on ? '#1C1C1C' : '#8A8A86', line: on ? '#1C1C1C' : '#DADAD6', w: on ? '56px' : '0px', pick: function () { self.setState({ floor: i }); } };
    });
    var floorPanels = fl.map(function (f, i) { return { disp: i === st.floor ? 'block' : 'none', lv: f.lv, en: f.en, ko: f.ko, bg: f.img ? (f.tone + ' url(' + f.img + ') center / cover no-repeat') : f.tone, photo: f.photo, desc: f.desc }; });

    var W='/_blob/82b27b33f2530412c968a015fabc5a95', BAR='/_blob/d225c1df7d52ffa59bb41b5ef5cd38c7', NR='/_blob/57329be2e202e15af0f84b0bee85fb53';
    var zd = [
      { name: '미디어존', cap: '22인\u00a0+\u00a0α', en: 'Media Zone', title: '대형 디스플레이를 갖춘 미디어존', img: W, alt: '미디어존 — 대형 디스플레이와 소파 좌석', desc: '55인치 TV 4대를 연결한 대형 디스플레이가 있어 행사와 세션에 필요한 기본 인프라를 갖췄습니다. 화면을 향해 배치된 좌석으로 몰입도 높은 환경을 제공합니다.', services: ['디스플레이', '스피커', '공기청정기'] },
      { name: '바테이블존', cap: '7인\u00a0+\u00a0α', en: 'Bar Table Zone', title: '케이터링이 가능한 바테이블존', img: BAR, alt: '바테이블존 — 바 카운터와 스툴', desc: '스탠딩과 좌석으로 자유롭게 교류할 수 있고, 케이터링과 음료를 비치할 수 있는 큰 바테이블이 있습니다. 파트너 서비스 로켓펀치를 통해 케이터링 업체를 예약할 수 있습니다.', services: ['정수기', '케이터링 예약'] },
      { name: '사이드존', cap: '11인\u00a0+\u00a0α', en: 'Side Zone', title: '그룹 대화를 위한 사이드존', img: NR, alt: '사이드존 — Nr 로고 선반과 라운지 체어', desc: '라운지 입구 정면에 있어, 가까이 모여 그룹 대화를 나눌 수 있는 좌석과 홍보 사이니지가 비치되어 있습니다. 천장을 따라 설치된 스마트조명으로 분위기를 바꿀 수 있습니다.', services: ['홍보 사이니지', '스마트조명'] }
    ];
    var zones = zd.map(function (z, i) {
      var on = i === st.zone;
      return { name: z.name, cap: z.cap, color: on ? '#1C1C1C' : '#8A8A86', line: on ? '#1C1C1C' : '#DADAD6', w: on ? '40px' : '0px', pick: function () { self.setState({ zone: i }); } };
    });
    var zonePanels = zd.map(function (z, i) {
      return { disp: i === st.zone ? 'block' : 'none', en: z.en, title: z.title, img: z.img, alt: z.alt, desc: z.desc, services: z.services.map(function (t) { return { t: t }; }) };
    });
    var acc = function (list, key) {
      return list.map(function (x, i) {
        var open = st[key] === i;
        return { q: x[0], a: x[1], rot: open ? 'rotate(0deg)' : 'rotate(90deg)', rows: open ? '1fr' : '0fr', toggle: function () { var o = {}; o[key] = open ? -1 : i; self.setState(o); } };
      });
    };
    var memRows = acc([
      ['파운딩 멤버 혜택', '초기 가입 가격을 멤버십 유지 기간 동안 그대로 적용합니다.'],
      ['별도 비용이 드는 경우', '글로벌 리트릿처럼 규모가 큰 일부 이벤트는 실비로 참가합니다. Narrative Club은 이벤트에서 이윤을 남기지 않습니다.']
    ], 'mem');
    var faqs = acc([
      ['가입 기준은 어떻게 되나요?', '연 매출 20억원, 누적 투자유치 20억원, 기업가치 50억원 이상 매각 경험, 팔로워 10만 명 이상 중 하나 이상을 충족하는 현직 대표와 크리에이터가 신청할 수 있습니다.'],
      ['마음에 들지 않으면 환불되나요?', '네. 가입 후 30일 동안 라운지와 세미나, 커뮤니티를 직접 경험해보세요. 멤버십이 맞지 않으면 전액 환불해 드립니다.'],
      ['연 200만원에 모든 혜택이 포함되나요?', '라운지, 세미나, 커뮤니티, 크레딧 · 툴 지원까지 모두 포함됩니다. 일부 파트너 크레딧은 각 프로그램의 자격 요건과 소진 상황에 따라 제공됩니다.'],
      ['AI를 잘 몰라도 괜찮나요?', '가능합니다. 매월 실무 세미나와 도입 자문을 통해 AI를 회사 업무에 처음 적용하는 단계부터 지원합니다.'],
      ['서울 밖 멤버도 의미가 있나요?', '온라인 세미나와 멤버 교류에 참여할 수 있습니다. 글로벌 밋업과 리트릿은 일정과 참가 조건에 따라 별도로 안내합니다.']
    ], 'faq');
    return {
      nav: nav, navA: nav, navB: [], goAbout: go('about'), goApply: go('apply'),
      isAbout: st.page === 'about', isBenefits: st.page === 'benefits', isLounge: st.page === 'lounge', isClub: st.page === 'clubhouse', isApply: st.page === 'apply',
      floors: floors, floorPanels: floorPanels, memRows: memRows, faqs: faqs, zones: zones, zonePanels: zonePanels
    };
  }
}
