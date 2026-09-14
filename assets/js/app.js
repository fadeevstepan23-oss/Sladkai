/* =============================================================================
   1618 Avenue — демо-лендинг с онлайн-записью
   Всё хранится локально (localStorage). Точка интеграции с Telegram-ботом —
   функция sendToManager() в самом низу файла.
   ========================================================================== */

(function () {
  'use strict';

  /* ---------------------------------------------------------------------------
     1. Данные салона (демо)
     ------------------------------------------------------------------------ */

  var CATEGORIES = [
    { id: 'all',    title: 'Все услуги' },
    { id: 'nails',  title: 'Ногти' },
    { id: 'lashes', title: 'Ресницы и брови' },
    { id: 'hair',   title: 'Волосы' },
    { id: 'face',   title: 'Лицо и уходы' },
    { id: 'body',   title: 'Эпиляция' }
  ];

  var SERVICES = [
    { id: 'manicure',    cat: 'nails',  title: 'Маникюр с покрытием', price: 3200, dur: 90,
      tag: 'хит', img: 'assets/img/service-manicure.svg',
      desc: 'Аппаратный маникюр, уход за кутикулой и стойкий гель-лак любимого оттенка.' },
    { id: 'nail-design', cat: 'nails',  title: 'Дизайн и наращивание', price: 4800, dur: 150,
      tag: 'премиум', img: 'assets/img/service-nail-design.svg',
      desc: 'Форма под вашу руку, укрепление и аккуратный дизайн — от нюда до сладкой ваты.' },
    { id: 'pedicure',    cat: 'nails',  title: 'Педикюр SPA', price: 3900, dur: 90,
      tag: 'уход', img: 'assets/img/service-pedicure.svg',
      desc: 'Тёплая ванночка с молочком, деликатная обработка и питательная маска.' },
    { id: 'lashes',      cat: 'lashes', title: 'Наращивание ресниц', price: 3500, dur: 120,
      tag: 'хит', img: 'assets/img/service-lashes.svg',
      desc: 'Классика, 2D или лёгкий объём — эффект, который выглядит как «свои, но лучше».' },
    { id: 'lamination',  cat: 'lashes', title: 'Ламинирование ресниц', price: 2900, dur: 70,
      tag: 'нежно', img: 'assets/img/service-lamination.svg',
      desc: 'Изгиб, питание и ботокс: ресницы поднимаются и остаются мягкими.' },
    { id: 'brows',       cat: 'lashes', title: 'Брови: форма и окрашивание', price: 2200, dur: 60,
      tag: 'быстро', img: 'assets/img/service-brows.svg',
      desc: 'Архитектура по чертам лица, окрашивание краской или хной, укладка.' },
    { id: 'haircut',     cat: 'hair',   title: 'Стрижка и укладка', price: 3800, dur: 90,
      tag: 'стиль', img: 'assets/img/service-haircut.svg',
      desc: 'Консультация, стрижка по форме лица и лёгкая укладка «как из журнала».' },
    { id: 'coloring',    cat: 'hair',   title: 'Окрашивание', price: 7500, dur: 210,
      tag: 'премиум', img: 'assets/img/service-coloring.svg',
      desc: 'Сложное окрашивание, тонирование и уход. Цена зависит от длины волос.' },
    { id: 'hair-care',   cat: 'hair',   title: 'Уход для волос', price: 4200, dur: 80,
      tag: 'восстановление', img: 'assets/img/service-hair-care.svg',
      desc: 'Реконструкция, кератиновое питание и блеск, который держится недели.' },
    { id: 'makeup',      cat: 'face',   title: 'Макияж', price: 4500, dur: 80,
      tag: 'событие', img: 'assets/img/service-makeup.svg',
      desc: 'Дневной, вечерний или съёмочный. Стойкая база и косметика люкс-класса.' },
    { id: 'facial',      cat: 'face',   title: 'Уход за лицом', price: 5600, dur: 90,
      tag: 'косметолог', img: 'assets/img/service-facial.svg',
      desc: 'Чистка, увлажнение и массаж лица — кожа как после отпуска.' },
    { id: 'depilation',  cat: 'body',   title: 'Эпиляция воском / шугаринг', price: 1800, dur: 45,
      tag: 'деликатно', img: 'assets/img/service-depilation.svg',
      desc: 'Гипоаллергенные составы, аккуратная техника и уход после процедуры.' }
  ];

  var MASTERS = [
    { id: 'alina',  name: 'Алина',   role: 'Nail-мастер',        exp: '9 лет в профессии, любит нюд и минимализм.', img: 'assets/img/master-alina.svg' },
    { id: 'sofia',  name: 'София',   role: 'Lash & brow',        exp: 'Топ-мастер по ресницам, обучает новичков.',  img: 'assets/img/master-sofia.svg' },
    { id: 'polina', name: 'Полина',  role: 'Колорист',           exp: 'Сложные окрашивания и блонд без желтизны.',  img: 'assets/img/master-polina.svg' },
    { id: 'vera',   name: 'Вера',    role: 'Косметолог',         exp: 'Уходовые протоколы и массаж лица.',          img: 'assets/img/master-vera.svg' }
  ];

  // Любой мастер — вариант по умолчанию в форме записи
  var ANY_MASTER = { id: 'any', name: 'Любой свободный мастер' };

  var WORK = { open: 10, close: 21 };      // 10:00–21:00, последняя запись в 20:00
  var STORAGE_KEY = 'avenue1618:bookings:v1';

  var WEEK_DAYS = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
  var MONTHS = ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
  var MONTHS_OF = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];

  /* ---------------------------------------------------------------------------
     2. Мелкие помощники
     ------------------------------------------------------------------------ */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, cls, html) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html != null) node.innerHTML = html;
    return node;
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function dateKey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function money(v) { return v.toLocaleString('ru-RU') + ' ₽'; }
  function humanDate(d) {
    return d.getDate() + ' ' + MONTHS_OF[d.getMonth()] + ', ' + WEEK_DAYS[d.getDay()];
  }
  function serviceById(id) {
    for (var i = 0; i < SERVICES.length; i++) if (SERVICES[i].id === id) return SERVICES[i];
    return null;
  }
  function masterById(id) {
    if (id === ANY_MASTER.id) return ANY_MASTER;
    for (var i = 0; i < MASTERS.length; i++) if (MASTERS[i].id === id) return MASTERS[i];
    return ANY_MASTER;
  }

  // Стабильный псевдослучайный генератор: одна и та же дата всегда даёт
  // одинаковую «занятость» — иначе демо мигало бы при каждом рендере.
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return h;
  }
  function busyHours(key) {
    var taken = {};
    for (var hour = WORK.open; hour < WORK.close; hour++) {
      // ~35% часов заняты, распределение зависит от даты и часа
      if ((hash(key + ':' + hour) % 100) < 35) taken[hour] = true;
    }
    // выходные загружены сильнее
    var d = parseKey(key);
    if (d.getDay() === 0 || d.getDay() === 6) {
      for (var hh = WORK.open; hh < WORK.close; hh++) {
        if ((hash(key + '#' + hh) % 100) < 25) taken[hh] = true;
      }
    }
    return taken;
  }
  function parseKey(key) {
    var p = key.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }

  /* ---------------------------------------------------------------------------
     3. Хранилище записей
     ------------------------------------------------------------------------ */

  var store = {
    all: function () {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) { return []; }
    },
    save: function (list) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) { /* приватный режим */ }
    },
    add: function (booking) {
      var list = store.all();
      list.push(booking);
      list.sort(function (a, b) { return (a.date + a.hour) < (b.date + b.hour) ? -1 : 1; });
      store.save(list);
    },
    remove: function (id) {
      store.save(store.all().filter(function (b) { return b.id !== id; }));
    },
    forDate: function (key) {
      return store.all().filter(function (b) { return b.date === key; });
    },
    isMine: function (key, hour) {
      return store.all().some(function (b) { return b.date === key && b.hour === hour; });
    }
  };

  /* ---------------------------------------------------------------------------
     4. Каталог услуг
     ------------------------------------------------------------------------ */

  var activeCat = 'all';

  function renderTabs() {
    var wrap = $('#tabs');
    if (!wrap) return;
    wrap.innerHTML = '';
    CATEGORIES.forEach(function (cat) {
      var btn = el('button', 'tab' + (cat.id === activeCat ? ' is-active' : ''), cat.title);
      btn.type = 'button';
      btn.setAttribute('role', 'tab');
      btn.addEventListener('click', function () {
        activeCat = cat.id;
        renderTabs();
        renderCatalog();
      });
      wrap.appendChild(btn);
    });
  }

  function renderCatalog() {
    var wrap = $('#catalog');
    if (!wrap) return;
    wrap.innerHTML = '';
    SERVICES.filter(function (s) { return activeCat === 'all' || s.cat === activeCat; })
      .forEach(function (s, i) {
        var card = el('article', 'service');
        card.style.animationDelay = (i * 0.05) + 's';
        card.innerHTML =
          '<div class="service-media">' +
            '<img src="' + s.img + '" alt="' + s.title + '" loading="lazy">' +
            '<span class="service-tag">' + s.tag + '</span>' +
          '</div>' +
          '<div class="service-body">' +
            '<h3>' + s.title + '</h3>' +
            '<p>' + s.desc + '</p>' +
            '<div class="service-meta">' +
              '<span class="service-price">' + money(s.price) + '<small>от · ' + s.dur + ' мин</small></span>' +
              '<button type="button" class="btn btn-primary btn-sm" data-service="' + s.id + '">Записаться</button>' +
            '</div>' +
          '</div>';
        card.querySelector('button').addEventListener('click', function () {
          preselectedService = s.id;
          var booking = $('#booking');
          if (booking) booking.scrollIntoView({ behavior: 'smooth', block: 'start' });
          toast('Услуга «' + s.title + '» выбрана — осталось выбрать время ✨');
        });
        wrap.appendChild(card);
      });
  }

  function renderMasters() {
    var wrap = $('#mastersGrid');
    if (!wrap) return;
    wrap.innerHTML = '';
    MASTERS.forEach(function (m) {
      var card = el('article', 'master reveal');
      card.innerHTML =
        '<div class="master-photo"><img src="' + m.img + '" alt="' + m.name + '" loading="lazy"></div>' +
        '<h3>' + m.name + '</h3>' +
        '<div class="role">' + m.role + '</div>' +
        '<p>' + m.exp + '</p>';
      wrap.appendChild(card);
    });
  }

  /* ---------------------------------------------------------------------------
     5. Календарь
     ------------------------------------------------------------------------ */

  var today = startOfDay(new Date());
  var viewMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  var selectedDate = new Date(today);
  var preselectedService = null;

  function freeCount(key) {
    var taken = busyHours(key), free = 0;
    var d = parseKey(key);
    for (var h = WORK.open; h < WORK.close; h++) {
      if (isPastHour(d, h)) continue;
      if (taken[h] || store.isMine(key, h)) continue;
      free++;
    }
    return free;
  }

  function isPastHour(d, hour) {
    var now = new Date();
    if (startOfDay(d).getTime() > startOfDay(now).getTime()) return false;
    if (startOfDay(d).getTime() < startOfDay(now).getTime()) return true;
    return hour <= now.getHours();
  }

  // Открываем календарь на ближайшем дне, где ещё есть свободные часы
  function firstAvailableDate() {
    var d = new Date(today);
    for (var i = 0; i < 60; i++) {
      if (freeCount(dateKey(d)) > 0) return d;
      d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    }
    return new Date(today);
  }

  function renderCalendar() {
    var grid = $('#calGrid'), label = $('#calMonth');
    if (!grid) return;

    label.textContent = MONTHS[viewMonth.getMonth()] + ' ' + viewMonth.getFullYear();
    grid.innerHTML = '';

    var first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    var offset = (first.getDay() + 6) % 7;            // неделя начинается с понедельника
    var daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();

    for (var i = 0; i < offset; i++) grid.appendChild(el('div', 'cal-day is-empty'));

    for (var day = 1; day <= daysInMonth; day++) {
      var date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
      var key = dateKey(date);
      var isPast = date.getTime() < today.getTime();
      var free = isPast ? 0 : freeCount(key);

      var btn = el('button', 'cal-day');
      btn.type = 'button';
      btn.innerHTML = day + '<small>' + (isPast ? '—' : free > 0 ? free + ' ч.' : 'нет мест') + '</small>';

      if (date.getTime() === today.getTime()) btn.classList.add('is-today');
      if (key === dateKey(selectedDate)) btn.classList.add('is-selected');
      if (!isPast && free <= 3) btn.classList.add('is-busy');
      if (store.forDate(key).length) btn.appendChild(el('span', 'dot'));


      var hasMine = store.forDate(key).length > 0;
      if (isPast || (free === 0 && !hasMine)) {
        btn.disabled = true;
      } else {
        (function (d) {
          btn.addEventListener('click', function () {
            selectedDate = d;
            renderCalendar();
            renderSlots();
          });
        })(date);
      }
      grid.appendChild(btn);
    }

    // Назад в прошлое не листаем
    var prev = $('#calPrev');
    prev.disabled = viewMonth.getFullYear() === today.getFullYear() && viewMonth.getMonth() === today.getMonth();
  }

  /* ---------------------------------------------------------------------------
     6. Часовые ячейки
     ------------------------------------------------------------------------ */

  function renderSlots() {
    var wrap = $('#slots');
    if (!wrap) return;

    var key = dateKey(selectedDate);
    var taken = busyHours(key);

    $('#slotsDate').textContent = humanDate(selectedDate);
    $('#slotsHint').textContent = 'Салон работает с ' + WORK.open + ':00 до ' + WORK.close +
      ':00. Нажмите на свободный час, чтобы занять ячейку.';

    wrap.innerHTML = '';
    var free = 0, idx = 0;

    for (var hour = WORK.open; hour < WORK.close; hour++) {
      var mine = store.isMine(key, hour);
      var past = isPastHour(selectedDate, hour);
      var busy = taken[hour] && !mine;

      var btn = el('button', 'slot');
      btn.type = 'button';
      btn.style.animationDelay = (idx++ * 0.03) + 's';
      btn.innerHTML = pad(hour) + ':00' + '<small>' +
        (mine ? 'вы записаны' : past ? 'прошло' : busy ? 'занято' : 'свободно') + '</small>';

      if (mine) {
        btn.classList.add('is-mine');
        (function (h) {
          btn.addEventListener('click', function () { cancelPrompt(key, h); });
        })(hour);
      } else if (past || busy) {
        btn.classList.add('is-taken');
        btn.disabled = true;
      } else {
        free++;
        (function (h) {
          btn.addEventListener('click', function () { openModal(selectedDate, h); });
        })(hour);
      }
      wrap.appendChild(btn);
    }

    $('#slotsCount').textContent = free > 0 ? 'свободно: ' + free : 'всё занято';

    if (!wrap.children.length) {
      wrap.appendChild(el('div', 'slots-empty', 'На этот день записи нет 🌸'));
    }
    renderMyBookings();
  }

  function renderMyBookings() {
    var wrap = $('#myBookings');
    if (!wrap) return;
    var list = store.all().filter(function (b) {
      return parseKey(b.date).getTime() >= today.getTime();
    });

    if (!list.length) {
      wrap.innerHTML = '<p class="empty-note">Пока пусто — самое время выбрать время 🩷</p>';
      return;
    }

    wrap.innerHTML = '';
    list.forEach(function (b) {
      var svc = serviceById(b.service);
      var item = el('div', 'booking-item');
      item.innerHTML =
        '<span><b>' + pad(b.hour) + ':00 · ' + humanDate(parseKey(b.date)) + '</b>' +
        '<span>' + (svc ? svc.title : 'Услуга') + ' · ' + masterById(b.master).name + '</span></span>';
      var cancel = el('button', null, 'отменить');
      cancel.type = 'button';
      cancel.addEventListener('click', function () {
        store.remove(b.id);
        toast('Запись отменена. Будем ждать в другой раз 🌷');
        renderCalendar();
        renderSlots();
      });
      item.appendChild(cancel);
      wrap.appendChild(item);
    });
  }

  function cancelPrompt(key, hour) {
    var booking = store.forDate(key).filter(function (b) { return b.hour === hour; })[0];
    if (!booking) return;
    store.remove(booking.id);
    toast('Запись на ' + pad(hour) + ':00 отменена 🌷');
    renderCalendar();
    renderSlots();
  }

  /* ---------------------------------------------------------------------------
     7. Модальное окно записи
     ------------------------------------------------------------------------ */

  var modal = null;

  function closeModal() {
    if (!modal) return;
    modal.remove();
    modal = null;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onEsc);
  }
  function onEsc(e) { if (e.key === 'Escape') closeModal(); }

  function openModal(date, hour) {
    closeModal();

    var options = SERVICES.map(function (s) {
      return '<option value="' + s.id + '"' + (s.id === preselectedService ? ' selected' : '') + '>' +
        s.title + ' — ' + money(s.price) + '</option>';
    }).join('');

    var masterOptions = '<option value="any">' + ANY_MASTER.name + '</option>' +
      MASTERS.map(function (m) {
        return '<option value="' + m.id + '">' + m.name + ' · ' + m.role + '</option>';
      }).join('');

    modal = el('div', 'modal');
    modal.innerHTML =
      '<div class="modal-card" role="dialog" aria-modal="true" aria-label="Запись в салон">' +
        '<button class="modal-close" type="button" aria-label="Закрыть">✕</button>' +
        '<h3>Записываемся ✨</h3>' +
        '<p class="modal-sub">Проверьте детали и оставьте контакты — администратор подтвердит запись.</p>' +
        '<div class="summary">' +
          '<span class="chip">📅 ' + humanDate(date) + '</span>' +
          '<span class="chip">🕰️ ' + pad(hour) + ':00</span>' +
        '</div>' +
        '<form id="bookingForm" novalidate>' +
          '<div class="field"><label for="f-service">Услуга</label>' +
            '<select id="f-service" name="service">' + options + '</select></div>' +
          '<div class="field"><label for="f-master">Мастер</label>' +
            '<select id="f-master" name="master">' + masterOptions + '</select></div>' +
          '<div class="field-row">' +
            '<div class="field"><label for="f-name">Ваше имя</label>' +
              '<input id="f-name" name="name" type="text" placeholder="Анна" autocomplete="name" required></div>' +
            '<div class="field"><label for="f-phone">Телефон</label>' +
              '<input id="f-phone" name="phone" type="tel" placeholder="+7 900 000-00-00" autocomplete="tel" required></div>' +
          '</div>' +
          '<div class="field"><label for="f-note">Комментарий</label>' +
            '<textarea id="f-note" name="note" placeholder="Например: хочу нежный нюд и снять прошлое покрытие"></textarea></div>' +
          '<button class="btn btn-primary" type="submit" style="width:100%">Подтвердить запись 🩷</button>' +
          '<p class="form-note">Нажимая кнопку, вы соглашаетесь на обработку персональных данных. ' +
          'В демо-версии заявка никуда не отправляется.</p>' +
        '</form>' +
      '</div>';

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onEsc);

    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    setTimeout(function () { var n = $('#f-name'); if (n) n.focus(); }, 60);

    $('#bookingForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#f-name').value.trim();
      var phone = $('#f-phone').value.trim();

      if (name.length < 2) { toast('Как к вам обращаться? 🌸'); $('#f-name').focus(); return; }
      if (phone.replace(/\D/g, '').length < 10) { toast('Проверьте номер телефона 📞'); $('#f-phone').focus(); return; }

      var booking = {
        id: 'b' + Date.now() + Math.floor(Math.random() * 1000),
        date: dateKey(date),
        hour: hour,
        service: $('#f-service').value,
        master: $('#f-master').value,
        name: name,
        phone: phone,
        note: $('#f-note').value.trim(),
        createdAt: new Date().toISOString()
      };

      store.add(booking);
      sendToManager(booking);
      showSuccess(booking);
      renderCalendar();
      renderSlots();
    });
  }

  function showSuccess(booking) {
    if (!modal) return;
    var svc = serviceById(booking.service);
    modal.querySelector('.modal-card').innerHTML =
      '<button class="modal-close" type="button" aria-label="Закрыть">✕</button>' +
      '<div class="success">' +
        '<span class="emoji">🎀</span>' +
        '<h3>Вы записаны!</h3>' +
        '<p class="modal-sub">' + humanDate(parseKey(booking.date)) + ', ' + pad(booking.hour) + ':00<br>' +
          (svc ? svc.title : '') + ' · ' + masterById(booking.master).name + '</p>' +
        '<div class="tg-note" style="text-align:left">' +
          '<b>Что дальше:</b> заявка отправлена администратору в Telegram-бота. ' +
          'Он свяжется с вами по номеру ' + booking.phone + ' и подтвердит время.' +
        '</div>' +
        '<button class="btn btn-primary" type="button" id="successOk" style="width:100%;margin-top:20px">Хорошо ☁️</button>' +
      '</div>';
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    $('#successOk').addEventListener('click', closeModal);
    toast('Запись создана — ждём вас в 1618 Avenue 🩷');
  }

  /* ---------------------------------------------------------------------------
     8. Интерфейсные мелочи
     ------------------------------------------------------------------------ */

  var toastTimer = null;
  function toast(text) {
    var t = $('#toast');
    if (!t) return;
    t.textContent = text;
    t.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-visible'); }, 3600);
  }

  function initHeader() {
    var header = $('#header'), burger = $('#burger'), nav = $('#nav');
    window.addEventListener('scroll', function () {
      header.classList.toggle('is-stuck', window.scrollY > 12);
    }, { passive: true });

    if (burger) {
      burger.addEventListener('click', function () {
        var open = nav.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      nav.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') {
          nav.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (i) { i.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (i) { io.observe(i); });
  }

  function initSparkles() {
    var hero = $('.hero');
    if (!hero) return;
    for (var i = 0; i < 12; i++) {
      var s = el('span', 'sparkle');
      s.style.left = (Math.random() * 96 + 2) + '%';
      s.style.top = (Math.random() * 88 + 6) + '%';
      s.style.animationDelay = (Math.random() * 3.4) + 's';
      s.style.transform = 'scale(' + (0.5 + Math.random()) + ')';
      hero.appendChild(s);
    }
  }

  /* ---------------------------------------------------------------------------
     9. Точка интеграции с Telegram-ботом
     ------------------------------------------------------------------------
     Пока лендинг демонстрационный, заявка просто пишется в консоль.
     Чтобы включить отправку менеджеру:
       1) поднять небольшой backend (или serverless-функцию), который знает
          BOT_TOKEN и CHAT_ID менеджера и дёргает Telegram Bot API;
       2) указать его адрес в TELEGRAM.endpoint и выставить enabled = true.
     Токен бота в коде страницы держать нельзя — только на сервере.
     ------------------------------------------------------------------------ */

  var TELEGRAM = {
    enabled: false,
    endpoint: ''   // например: 'https://api.1618avenue.ru/booking'
  };

  function bookingToText(b) {
    var svc = serviceById(b.service);
    return [
      '🎀 Новая запись — 1618 Avenue',
      '📅 ' + humanDate(parseKey(b.date)) + ', ' + pad(b.hour) + ':00',
      '💅 ' + (svc ? svc.title + ' (' + money(svc.price) + ', ' + svc.dur + ' мин)' : b.service),
      '👩‍🎨 Мастер: ' + masterById(b.master).name,
      '👤 ' + b.name,
      '📞 ' + b.phone,
      b.note ? '📝 ' + b.note : ''
    ].filter(Boolean).join('\n');
  }

  function sendToManager(booking) {
    var payload = { booking: booking, text: bookingToText(booking) };

    if (!TELEGRAM.enabled || !TELEGRAM.endpoint) {
      console.info('[1618 Avenue · демо] Заявка, которая уйдёт в Telegram-бота:\n' + payload.text);
      return Promise.resolve({ ok: true, demo: true });
    }

    return fetch(TELEGRAM.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(function (err) {
      console.warn('Не удалось отправить заявку менеджеру:', err);
      return { ok: false };
    });
  }

  /* ---------------------------------------------------------------------------
     10. Старт
     ------------------------------------------------------------------------ */

  function init() {
    selectedDate = firstAvailableDate();
    viewMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);

    renderTabs();
    renderCatalog();
    renderMasters();
    renderCalendar();
    renderSlots();
    initHeader();
    initReveal();
    initSparkles();

    $('#calPrev').addEventListener('click', function () {
      viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1);
      renderCalendar();
    });
    $('#calNext').addEventListener('click', function () {
      viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1);
      renderCalendar();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
