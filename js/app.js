(function () {
  'use strict';
  var S = window.Senior = window.Senior || {};
  S.views = S.views || {};

  // ---------- storage (falls back to memory if localStorage is blocked) ----------
  var mem = {};
  S.store = {
    get: function (k) {
      try { var v = localStorage.getItem('senior.' + k); if (v !== null) return v; } catch (e) {}
      return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null;
    },
    set: function (k, v) { mem[k] = v; try { localStorage.setItem('senior.' + k, v); } catch (e) {} },
    del: function (k) { delete mem[k]; try { localStorage.removeItem('senior.' + k); } catch (e) {} }
  };

  // ---------- save / share helpers used by the tools ----------
  S.canShareFiles = function () {
    try {
      var f = new File([''], 'a.png', { type: 'image/png' });
      return !!(navigator.share && navigator.canShare && navigator.canShare({ files: [f] }));
    } catch (e) { return false; }
  };
  S.download = function (blob, name) {
    try {
      var url = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = url; a.download = name; a.rel = 'noopener';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
    } catch (e) {}
  };
  S.shareFile = function (blob, name) {
    var f = new File([blob], name, { type: blob.type || 'image/png' });
    return navigator.share({ files: [f], title: 'Senior 2027' });
  };
  S.showFinal = function (wrap, img, blob) {
    var fr = new FileReader();
    fr.onload = function () {
      img.src = fr.result;
      wrap.hidden = false;
      try { wrap.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
    };
    fr.readAsDataURL(blob);
  };

  function $(id) { return document.getElementById(id); }

  // ---------- home ----------
  function greet() {
    var n = S.store.get('name');
    $('greet').textContent = n ? 'أهلًا يا ' + n : '';
  }
  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }
  function renderCountdown() {
    var el = $('countdown');
    el.textContent = '';
    var target = parseDate(S.store.get('date'));
    if (!target) {
      var a = document.createElement('a');
      a.href = '#/settings'; a.textContent = 'حدد ميعاد حفلة التخرج';
      var l = document.createElement('div'); l.className = 'lbl'; l.textContent = 'عايزين نعد الأيام مع بعض';
      el.appendChild(l); el.appendChild(a);
      return;
    }
    var now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var days = Math.round((target - today) / 86400000);
    var num = document.createElement('div'), lbl = document.createElement('div');
    num.className = 'num'; lbl.className = 'lbl';
    if (days > 0) { num.textContent = String(days); lbl.textContent = days === 1 ? 'يوم واحد وتبدأ الحفلة' : 'يوم على الحفلة'; }
    else if (days === 0) { num.textContent = '🎓'; lbl.textContent = 'النهارده الحفلة!'; }
    else { num.textContent = '🎉'; lbl.textContent = 'مبروك! خلصتوا'; }
    el.appendChild(num); el.appendChild(lbl);
  }
  S.views.home = { mount: function () {}, show: function () { greet(); renderCountdown(); } };

  // ---------- settings ----------
  var deferredInstall = null;
  function isStandalone() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  }
  function installHelpText() {
    if (isStandalone()) return 'التطبيق متثبت عندك بالفعل.';
    var ua = navigator.userAgent || '';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'على الآيفون: افتح اللينك في Safari، اضغط زرار المشاركة، واختار Add to Home Screen.';
    return 'على الأندرويد: من قايمة Chrome (النقط التلاتة) اختار Install app أو Add to Home screen.';
  }
  S.views.settings = {
    mount: function () {
      $('sSave').addEventListener('click', function () {
        var n = $('sName').value.trim();
        if (n) S.store.set('name', n);
        var d = $('sDate').value;
        if (d) S.store.set('date', d); else S.store.del('date');
        $('sMsg').textContent = 'اتحفظ.';
      });
      $('sReset').addEventListener('click', function () {
        if (!window.confirm('تمسح الاسم والميعاد ومفاتيح الـ AI؟')) return;
        ['name', 'date', 'consent', 'key.gemini', 'key.openai', 'model.gemini', 'model.openai'].forEach(function (k) { S.store.del(k); });
        location.hash = '#/';
        checkWelcome();
      });
      $('installHelp').textContent = installHelpText();
    },
    show: function () {
      $('sName').value = S.store.get('name') || '';
      $('sDate').value = S.store.get('date') || '';
      $('sMsg').textContent = '';
    }
  };

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredInstall = e;
    $('installBtn').hidden = false;
    $('installBtn2').hidden = false;
  });
  function doInstall() {
    if (!deferredInstall) return;
    deferredInstall.prompt();
    deferredInstall.userChoice.then(function () {
      deferredInstall = null;
      $('installBtn').hidden = true; $('installBtn2').hidden = true;
    }, function () {});
  }
  window.addEventListener('appinstalled', function () { $('installBtn').hidden = true; $('installBtn2').hidden = true; });

  // ---------- onboarding ----------
  function checkWelcome() {
    var need = !S.store.get('name');
    $('welcome').hidden = !need;
    if (need) setTimeout(function () { try { $('wName').focus(); } catch (e) {} }, 60);
  }

  // ---------- router ----------
  var VIEWS = ['home', 'card', 'frames', 'ai', 'games', 'settings'];
  var TITLES = { home: 'Senior', card: 'كارت السينيور', frames: 'استوديو الفريمات', ai: 'استوديو AI', games: 'ألعاب الدفعة', settings: 'الإعدادات' };
  var mounted = {};
  S.setTitle = function (t) { $('brand').textContent = t; };
  function show(name, sub) {
    VIEWS.forEach(function (v) { $('v-' + v).hidden = v !== name; });
    var view = S.views[name];
    if (view && !mounted[name]) { mounted[name] = true; view.mount($('v-' + name)); }
    $('backBtn').hidden = name === 'home';
    $('gearBtn').hidden = name === 'settings';
    $('brand').textContent = TITLES[name];
    if (view && view.show) view.show(sub || '');
    window.scrollTo(0, 0);
  }
  function route() {
    var parts = (location.hash || '#/').replace(/^#\/?/, '').split('?')[0].split('/');
    var name = parts[0] || 'home';
    if (VIEWS.indexOf(name) < 0) name = 'home';
    show(name, parts[1] || '');
  }
  window.addEventListener('hashchange', route);

  function boot() {
    $('backBtn').addEventListener('click', function () {
      var h = (location.hash || '').replace(/^#\/?/, '').split('?')[0];
      location.hash = h.indexOf('/') > 0 ? '#/' + h.split('/')[0] : '#/';
    });
    $('gearBtn').addEventListener('click', function () { location.hash = '#/settings'; });
    $('installBtn').addEventListener('click', doInstall);
    $('installBtn2').addEventListener('click', doInstall);
    $('welcomeForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var n = $('wName').value.trim();
      if (!n) return;
      S.store.set('name', n);
      $('welcome').hidden = true;
      greet();
    });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && !$('v-home').hidden) renderCountdown();
    });
    checkWelcome();
    route();
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    }
  }
  boot();
})();
