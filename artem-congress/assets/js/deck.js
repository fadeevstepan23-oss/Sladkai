/* Презентация: навигация, масштаб, анимации входа, обзор, заметки, печать.
   Клавиши: ← → / пробел — листать · O или Esc — обзор всех слайдов ·
   N — заметки спикера · D — скрыть пометки черновика · F — полный экран. */
(function () {
  'use strict';

  var deck = document.getElementById('deck');
  var slides = Array.prototype.slice.call(deck.querySelectorAll('.slide'));
  var total = slides.length;
  var cur = -1;
  var params = new URLSearchParams(location.search);
  var isPrint = params.has('print');
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var fmt = function (n, dec) {
    return Number(n).toLocaleString('ru-RU', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 });
  };

  /* ---------- Оформление листа ---------- */
  var META = { speaker: 'А. Панасенко', title: 'Субаренда коммерческой недвижимости' };
  slides.forEach(function (s, i) {
    var chrome = s.getAttribute('data-chrome') || 'full';
    if (chrome === 'none') return;
    ['tl', 'tr', 'bl', 'br'].forEach(function (c) {
      var t = document.createElement('i'); t.className = 'tick ' + c; s.appendChild(t);
    });
    var top = document.createElement('div');
    top.className = 'ch-top';
    top.innerHTML = '<span class="ch-sec">' + (s.getAttribute('data-section') || '') + '</span><span class="ch-brand">Premier</span>';
    s.appendChild(top);
    var st = document.createElement('div');
    st.className = 'stamp';
    st.innerHTML = '<span>' + META.speaker + '</span><span>' + META.title + '</span><span>Лист <b>' + pad(i + 1) + '</b> / ' + pad(total) + '</span>';
    s.appendChild(st);
  });

  /* ---------- Декор разделов: прямоугольник плана, который с каждым разделом делится сильнее ---------- */
  var SPLITS = {
    1: [],
    2: ['M300 0V360'],
    3: ['M300 0V360', 'M300 210H560'],
    4: ['M220 0V360', 'M420 0V360', 'M420 220H560'],
    5: ['M220 0V360', 'M0 200H220', 'M420 0V360', 'M420 220H560'],
    6: ['M180 0V360', 'M0 190H180', 'M380 0V360', 'M380 140H560', 'M380 260H560']
  };
  Array.prototype.forEach.call(document.querySelectorAll('svg[data-split]'), function (svg) {
    var n = +svg.getAttribute('data-split');
    var parts = SPLITS[n] || [];
    var h = '<path class="wall ln" style="--i:2" d="M0 0H560V360H0Z"/>';
    parts.forEach(function (d, k) { h += '<path class="part ln" style="--i:' + (8 + k * 3) + '" d="' + d + '"/>'; });
    h += '<path class="hair ln" style="--i:6" d="M0 404H560M0 396V412M560 396V412"/>';
    h += '<text class="dim fi" style="--i:10" x="280" y="436" text-anchor="middle">' + (parts.length + 1) + ' ' + plural(parts.length + 1, ['блок', 'блока', 'блоков']) + '</text>';
    svg.setAttribute('viewBox', '-10 -10 580 460');
    svg.innerHTML = h;
  });
  function plural(n, f) { var a = n % 10, b = n % 100; return (a === 1 && b !== 11) ? f[0] : (a >= 2 && a <= 4 && (b < 10 || b >= 20)) ? f[1] : f[2]; }

  /* ---------- Полоса «собственнику / нам» на слайдах кейсов ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.flow[data-pay]'), function (el) {
    var pay = +el.getAttribute('data-pay'), inc = +el.getAttribute('data-inc');
    var sum = pay + inc, pp = pay / sum * 100;
    el.innerHTML =
      '<div class="flow-bar"><i class="grow" style="width:' + pp + '%;background:var(--bronze)"></i><i class="grow" style="--i:3;width:calc(' + (100 - pp) + '% - 2px);background:var(--accent)"></i></div>' +
      '<div class="flow-leg">' +
        '<span style="width:' + pp + '%"><i style="background:var(--bronze)"></i>Собственнику <b>' + fmt(pay) + ' ₽</b></span>' +
        '<span><i style="background:var(--accent)"></i>Наш доход <b>' + fmt(inc) + ' ₽</b></span>' +
      '</div>' +
      '<div class="cap flow-cap">Из ' + fmt(sum) + ' ₽ в месяц: платёж собственнику + доход (расчёт)</div>';
  });

  /* ---------- График по пяти кейсам ---------- */
  var CASES = [
    { name: 'Садовая', city: 'СПб', pay: 180000, inc: 130000 },
    { name: 'Восстания', city: 'СПб', pay: 370000, inc: 133000 },
    { name: 'Буданова', city: 'Москва', pay: 286000, inc: 120000 },
    { name: 'Ленинский пр-т', city: 'Москва', pay: 265000, inc: 114000 },
    { name: 'Юлиана Семёнова', city: 'Москва', pay: 250000, inc: 114000 }
  ];
  var chart = document.getElementById('chart-cases');
  if (chart) buildChart(chart);
  function buildChart(root) {
    var W = 1060, labelW = 250, rowH = 96, barH = 24, max = 600000, plotW = W - labelW - 130;
    var x = function (v) { return labelW + v / max * plotW; };
    var H = CASES.length * rowH + 40;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="Платёж собственнику и доход по пяти объектам">';
    for (var t = 0; t <= max; t += 100000) {
      s += '<line x1="' + x(t) + '" x2="' + x(t) + '" y1="0" y2="' + (H - 40) + '" stroke="rgba(23,22,21,.10)" stroke-width="1"/>';
      s += '<text x="' + x(t) + '" y="' + (H - 12) + '" text-anchor="middle" class="axis">' + (t === 0 ? '0' : fmt(t / 1000) + ' тыс.') + '</text>';
    }
    CASES.forEach(function (c, i) {
      var y = i * rowH + rowH / 2 - barH / 2;
      var w1 = x(c.pay) - x(0), w2 = x(c.pay + c.inc) - x(c.pay) - 2;
      s += '<text x="0" y="' + (y + 17) + '" class="rl">' + c.name + '</text>';
      s += '<text x="0" y="' + (y + 40) + '" class="rc">' + c.city + '</text>';
      s += '<g class="grow" style="--i:' + (2 + i) + '">';
      s += '<path class="seg" data-tip="' + c.name + ' · собственнику <b>' + fmt(c.pay) + ' ₽</b>" fill="var(--bronze)" d="M' + x(0) + ' ' + y + 'h' + w1 + 'v' + barH + 'h-' + w1 + 'z"/>';
      s += '<path class="seg" data-tip="' + c.name + ' · наш доход <b>' + fmt(c.inc) + ' ₽</b>" fill="var(--accent)" d="' + roundEnd(x(c.pay) + 2, y, w2, barH, 4) + '"/>';
      s += '</g>';
      s += '<text x="' + (x(c.pay + c.inc) + 14) + '" y="' + (y + 18) + '" class="vl fi" style="--i:' + (6 + i) + '">+' + fmt(c.inc) + '</text>';
    });
    s += '<line x1="' + x(0) + '" x2="' + x(0) + '" y1="0" y2="' + (H - 40) + '" stroke="var(--ink)" stroke-width="1"/>';
    s += '</svg><div class="tip"></div>';
    root.innerHTML = s;
    var tip = root.querySelector('.tip');
    Array.prototype.forEach.call(root.querySelectorAll('.seg'), function (p) {
      p.addEventListener('mousemove', function (e) {
        var r = root.getBoundingClientRect(), k = r.width / root.offsetWidth;
        tip.innerHTML = p.getAttribute('data-tip');
        tip.style.left = ((e.clientX - r.left) / k + 16) + 'px';
        tip.style.top = ((e.clientY - r.top) / k - 52) + 'px';
        tip.classList.add('on');
      });
      p.addEventListener('mouseleave', function () { tip.classList.remove('on'); });
    });
  }
  function roundEnd(x0, y, w, h, r) {
    return 'M' + x0 + ' ' + y + 'h' + (w - r) + 'a' + r + ' ' + r + ' 0 0 1 ' + r + ' ' + r + 'v' + (h - 2 * r) + 'a' + r + ' ' + r + ' 0 0 1 -' + r + ' ' + r + 'h-' + (w - r) + 'z';
  }

  /* ---------- Порядок появления и длина линий ---------- */
  slides.forEach(function (s) {
    var k = 0;
    Array.prototype.forEach.call(s.querySelectorAll('.r, .ln, .fi, .grow'), function (el) {
      if (el.classList.contains('ln')) el.setAttribute('pathLength', '1');
      if (!el.style.getPropertyValue('--i')) el.style.setProperty('--i', k);
      k++;
    });
  });

  /* ---------- Масштаб сцены ---------- */
  function fit() {
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    deck.style.setProperty('--s', s);
  }
  window.addEventListener('resize', fit);
  fit();

  /* ---------- Счётчики ---------- */
  function countUp(slide) {
    Array.prototype.forEach.call(slide.querySelectorAll('.count'), function (el) {
      var to = parseFloat(el.getAttribute('data-to')), dec = +(el.getAttribute('data-dec') || 0);
      var t0 = null, dur = 1500, delay = 350;
      if (slide.classList.contains('static') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = fmt(to, dec); return; }
      el.textContent = fmt(0, dec);
      function step(ts) {
        if (!t0) t0 = ts + delay;
        var p = Math.max(0, Math.min(1, (ts - t0) / dur));
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(to * e, dec);
        if (p < 1 && slide.classList.contains('is-active')) requestAnimationFrame(step);
        else el.textContent = fmt(to, dec);
      }
      requestAnimationFrame(step);
    });
  }

  /* ---------- Переходы ---------- */
  var progress = document.querySelector('.ui-progress');
  var notes = document.querySelector('.ui-notes');
  function go(n, instant) {
    n = Math.max(0, Math.min(total - 1, n));
    if (n === cur) return;
    var prev = slides[cur];
    if (prev) {
      prev.classList.remove('is-active');
      prev.classList.add('is-leaving');
      setTimeout(function () {
        prev.classList.remove('is-leaving');
        if (!prev.classList.contains('is-active')) prev.classList.remove('is-in');
      }, 850);
    }
    cur = n;
    var s = slides[n];
    s.classList.remove('is-in', 'is-leaving');
    s.classList.add('is-active');
    if (instant) { s.classList.add('is-in'); }
    else requestAnimationFrame(function () { requestAnimationFrame(function () { s.classList.add('is-in'); }); });
    countUp(s);
    if (progress) progress.style.width = ((n + 1) / total * 100) + '%';
    if (history.replaceState) history.replaceState(null, '', '#' + (n + 1));
    renderNotes();
  }
  function renderNotes() {
    if (!notes || !notes.classList.contains('on')) return;
    var a = slides[cur].querySelector('.note');
    notes.innerHTML = '<h6>Заметки · лист ' + pad(cur + 1) + '</h6>' + (a ? a.innerHTML : '<p>—</p>');
  }

  /* ---------- Обзор всех слайдов ---------- */
  var ov = document.querySelector('.overview');
  var ovBuilt = false;
  function buildOverview() {
    var grid = ov.querySelector('.ov-grid');
    slides.forEach(function (s, i) {
      var item = document.createElement('div'); item.className = 'ov-item';
      var th = document.createElement('div'); th.className = 'ov-thumb';
      var c = s.cloneNode(true);
      c.classList.add('static', 'is-in'); c.classList.remove('is-active');
      c.removeAttribute('id');
      th.appendChild(c);
      var lb = document.createElement('div'); lb.className = 'ov-label';
      lb.innerHTML = '<b>' + pad(i + 1) + '</b><span>' + (s.getAttribute('data-title') || '') + '</span>';
      item.appendChild(th); item.appendChild(lb);
      item.addEventListener('click', function () { toggleOverview(false); go(i, true); });
      grid.appendChild(item);
    });
    ovBuilt = true;
    sizeThumbs();
    window.addEventListener('resize', sizeThumbs);
  }
  function sizeThumbs() {
    Array.prototype.forEach.call(ov.querySelectorAll('.ov-thumb'), function (t) {
      t.firstChild.style.transform = 'scale(' + (t.clientWidth / 1920) + ')';
    });
  }
  function toggleOverview(on) {
    if (on === undefined) on = !ov.classList.contains('on');
    if (on && !ovBuilt) { ov.classList.add('on'); buildOverview(); }
    ov.classList.toggle('on', on);
    if (on) {
      sizeThumbs();
      Array.prototype.forEach.call(ov.querySelectorAll('.ov-item'), function (it, i) { it.classList.toggle('cur', i === cur); });
      var c = ov.querySelectorAll('.ov-item')[cur];
      if (c) c.scrollIntoView({ block: 'center' });
    }
  }

  /* ---------- Управление ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key;
    if (ov.classList.contains('on')) {
      if (k === 'Escape' || k === 'o' || k === 'O' || k === 'щ' || k === 'Щ') toggleOverview(false);
      return;
    }
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || k === ' ' || k === 'Enter') { e.preventDefault(); go(cur + 1); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp' || k === 'Backspace') { e.preventDefault(); go(cur - 1); }
    else if (k === 'Home') go(0);
    else if (k === 'End') go(total - 1);
    else if (k === 'Escape' || k === 'o' || k === 'O' || k === 'щ' || k === 'Щ') toggleOverview(true);
    else if (k === 'n' || k === 'N' || k === 'т' || k === 'Т') { notes.classList.toggle('on'); renderNotes(); }
    else if (k === 'd' || k === 'D' || k === 'в' || k === 'В') document.body.classList.toggle('clean');
    else if (k === 'f' || k === 'F' || k === 'а' || k === 'А') {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
      else document.exitFullscreen && document.exitFullscreen();
    }
  });
  deck.addEventListener('click', function (e) {
    if (e.target.closest('a, button, .chart, [data-noclick]')) return;
    var r = deck.getBoundingClientRect();
    if (e.clientX - r.left < r.width * .3) go(cur - 1); else go(cur + 1);
  });
  var tx = null;
  window.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  window.addEventListener('touchend', function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1));
  });
  window.addEventListener('hashchange', function () {
    var n = parseInt(location.hash.slice(1), 10);
    if (n) go(n - 1);
  });

  /* ---------- Печать и PDF: все слайды в финальном состоянии ---------- */
  function staticAll() { slides.forEach(function (s) { s.classList.add('static', 'is-in'); }); }
  window.addEventListener('beforeprint', staticAll);
  if (isPrint) { document.body.classList.add('print'); staticAll(); }
  if (params.has('clean')) document.body.classList.add('clean');

  var hint = document.querySelector('.ui-hint');
  if (hint) setTimeout(function () { hint.classList.add('hide'); }, 5000);

  var start = parseInt(location.hash.slice(1), 10);
  go(start ? start - 1 : 0, isPrint);
})();
