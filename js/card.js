(function () {
  'use strict';
  var S = window.Senior = window.Senior || {};
  S.views = S.views || {};

  var W = 1080, H = 1350;
  var F_DISPLAY = "'Lalezar','Cairo','Segoe UI',Tahoma,sans-serif";
  var F_BODY = "'Cairo','Segoe UI',Tahoma,sans-serif";
  var INK = '#14101A', PINK = '#D6337A';

  var TITLES = [
    'رئيس لجنة «هو فيه محاضرة النهارده؟»',
    'أكتر واحد بيقول «هبدأ أذاكر بكرة»',
    'خبير النسخ واللصق المعتمد',
    'صاحب أطول سلسلة تأخير في الدفعة',
    'وزير الدفاع عن الدفعة في أي نقاش',
    'ملك الملازم اللي اتصورت ومتقريتش',
    'المسؤول الأول عن قفشات الجروب',
    'الناجي الأخير من ليلة الامتحان',
    'مدير عام كافيتيريا المعهد',
    'الوش اللي بيظهر في كل صورة جماعية',
    'متخصص تسليم المشاريع آخر دقيقة',
    'عضو مؤسس في جروب «مين عمل الواجب؟»',
    'أكتر واحد بيسأل «مين معاه الشرح؟»',
    'صاحب الرقم القياسي في قهوة ما قبل الامتحان',
    'الوحيد اللي بيفهم الجدول من أول مرة',
    'مستشار الدفعة في كل حاجة إلا المذاكرة'
  ];
  var STATS = [
    { label: 'مرات «هبدأ أذاكر بكرة»', min: 100, max: 999 },
    { label: 'أكواب قهوة', min: 300, max: 1999 },
    { label: 'مرات اتأخرت', min: 5, max: 120 },
    { label: 'سيلفي في المعهد', min: 50, max: 900 },
    { label: 'ساعات نوم ضاعت', min: 200, max: 1500 },
    { label: 'مرات سألت «في حاجة النهارده؟»', min: 30, max: 400 }
  ];

  function hashStr(s) {
    var h = 1779033703 ^ s.length;
    for (var i = 0; i < s.length; i++) {
      h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^ (h >>> 16)) >>> 0;
  }
  function rngFrom(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function wrap(ctx, text, maxW) {
    var words = text.split(' '), lines = [], cur = '';
    for (var i = 0; i < words.length; i++) {
      var t = cur ? cur + ' ' + words[i] : words[i];
      if (!cur || ctx.measureText(t).width <= maxW) cur = t;
      else { lines.push(cur); cur = words[i]; }
    }
    if (cur) lines.push(cur);
    return lines;
  }
  function sparkle(ctx, x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.quadraticCurveTo(x, y, x, y + r);
    ctx.quadraticCurveTo(x, y, x - r, y);
    ctx.quadraticCurveTo(x, y, x, y - r);
    ctx.closePath();
    ctx.fill();
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Shared look for other screens (games reuse it for their result cards).
  S.cardKit = {
    W: W, H: H, F_DISPLAY: F_DISPLAY, F_BODY: F_BODY, INK: INK, PINK: PINK,
    roundRect: roundRect, sparkle: sparkle, wrap: wrap,
    base: function (ctx) {
      ctx.clearRect(0, 0, W, H);
      ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
      var g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, '#F7F8FB'); g.addColorStop(0.22, '#C7CBD5'); g.addColorStop(0.42, '#FAFBFD');
      g.addColorStop(0.66, '#AEB3BF'); g.addColorStop(0.84, '#E9EBF0'); g.addColorStop(1, '#BFC4CE');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      var sh = ctx.createRadialGradient(W * 0.2, H * 0.12, 10, W * 0.2, H * 0.12, 520);
      sh.addColorStop(0, 'rgba(255,255,255,0.75)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sh; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = INK; ctx.lineWidth = 10;
      roundRect(ctx, 36, 36, W - 72, H - 72, 46); ctx.stroke();
      ctx.strokeStyle = PINK; ctx.lineWidth = 3;
      roundRect(ctx, 58, 58, W - 116, H - 116, 34); ctx.stroke();
      ctx.fillStyle = INK;
      roundRect(ctx, W / 2 - 200, 92, 400, 72, 36); ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '44px ' + F_DISPLAY;
      if ('letterSpacing' in ctx) ctx.letterSpacing = '6px';
      ctx.direction = 'ltr';
      ctx.fillText('SENIOR 2027', W / 2, 131);
      ctx.direction = 'rtl';
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
      sparkle(ctx, 150, 250, 34, INK); sparkle(ctx, 210, 190, 16, PINK);
      sparkle(ctx, W - 150, 270, 26, PINK); sparkle(ctx, W - 205, 205, 14, INK);
    }
  };

  S.views.card = {
    mount: function (root) {
      var nameEl = root.querySelector('#cardName'), imgEl = root.querySelector('#cardImg');
      var againBtn = root.querySelector('#cardAgain'), saveBtn = root.querySelector('#cardSave');
      var shareBtn = root.querySelector('#cardShare'), statusEl = root.querySelector('#cardStatus');
      var canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      var salt = 0, timer = null;

      function draw() {
        var ctx = canvas.getContext('2d');
        var raw = nameEl.value.trim(), shown = raw || 'اسمك هنا';
        var rand = rngFrom(hashStr(raw.replace(/\s+/g, ' ').toLowerCase() + '|' + salt));
        ctx.clearRect(0, 0, W, H);
        ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';

        var g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, '#F7F8FB'); g.addColorStop(0.22, '#C7CBD5'); g.addColorStop(0.42, '#FAFBFD');
        g.addColorStop(0.66, '#AEB3BF'); g.addColorStop(0.84, '#E9EBF0'); g.addColorStop(1, '#BFC4CE');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        var sh = ctx.createRadialGradient(W * 0.2, H * 0.12, 10, W * 0.2, H * 0.12, 520);
        sh.addColorStop(0, 'rgba(255,255,255,0.75)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = sh; ctx.fillRect(0, 0, W, H);

        ctx.strokeStyle = INK; ctx.lineWidth = 10;
        roundRect(ctx, 36, 36, W - 72, H - 72, 46); ctx.stroke();
        ctx.strokeStyle = PINK; ctx.lineWidth = 3;
        roundRect(ctx, 58, 58, W - 116, H - 116, 34); ctx.stroke();

        ctx.fillStyle = INK;
        roundRect(ctx, W / 2 - 200, 92, 400, 72, 36); ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '44px ' + F_DISPLAY;
        if ('letterSpacing' in ctx) ctx.letterSpacing = '6px';
        ctx.direction = 'ltr';
        ctx.fillText('SENIOR 2027', W / 2, 131);
        ctx.direction = 'rtl';
        if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';

        sparkle(ctx, 150, 250, 34, INK); sparkle(ctx, 210, 190, 16, PINK);
        sparkle(ctx, W - 150, 270, 26, PINK); sparkle(ctx, W - 205, 205, 14, INK);

        var size = 190;
        ctx.font = size + 'px ' + F_DISPLAY;
        while (size > 64 && ctx.measureText(shown).width > 860) { size -= 6; ctx.font = size + 'px ' + F_DISPLAY; }
        ctx.fillStyle = PINK; ctx.fillText(shown, W / 2 + 7, 399);
        ctx.fillStyle = INK; ctx.fillText(shown, W / 2, 392);

        ctx.fillStyle = INK;
        ctx.fillRect(110, 498, W / 2 - 150, 6);
        ctx.fillRect(W / 2 + 40, 498, W / 2 - 150, 6);
        sparkle(ctx, W / 2, 501, 24, PINK);

        ctx.fillStyle = PINK; ctx.font = '700 34px ' + F_BODY;
        ctx.fillText('لقبك الرسمي في الدفعة', W / 2, 562);

        var title = TITLES[Math.floor(rand() * TITLES.length)];
        var tSize = 60, lines;
        do {
          ctx.font = '900 ' + tSize + 'px ' + F_BODY;
          lines = wrap(ctx, title, 820);
          tSize -= 4;
        } while (lines.length > 3 && tSize > 40);
        var lh = 84, top = 724 - ((lines.length - 1) * lh) / 2;
        ctx.fillStyle = INK;
        for (var i = 0; i < lines.length; i++) ctx.fillText(lines[i], W / 2, top + i * lh);

        var pool = STATS.slice();
        for (var j = pool.length - 1; j > 0; j--) {
          var k = Math.floor(rand() * (j + 1)), tmp = pool[j]; pool[j] = pool[k]; pool[k] = tmp;
        }
        var picks = pool.slice(0, 3);
        ctx.fillStyle = INK;
        ctx.fillRect(110, 896, W - 220, 3);
        ctx.fillRect(390, 930, 3, 170);
        ctx.fillRect(690, 930, 3, 170);
        var centers = [840, 540, 240];
        for (var c = 0; c < 3; c++) {
          var st = picks[c], num = st.min + Math.floor(rand() * (st.max - st.min + 1));
          ctx.fillStyle = PINK; ctx.font = '78px ' + F_DISPLAY;
          ctx.fillText(num.toLocaleString('en-US'), centers[c], 972);
          ctx.fillStyle = INK; ctx.font = '700 30px ' + F_BODY;
          var ls = wrap(ctx, st.label, 270).slice(0, 2);
          for (var m = 0; m < ls.length; m++) ctx.fillText(ls[m], centers[c], 1044 + m * 40);
        }

        ctx.fillStyle = INK;
        var bx = W / 2 - 260, end = W / 2 + 260;
        while (bx < end) {
          var bw = 3 + Math.floor(rand() * 10);
          if (bx + bw > end) bw = end - bx;
          ctx.fillRect(bx, 1160, bw, 64);
          bx += bw + 4 + Math.floor(rand() * 5);
        }
        ctx.font = '36px ' + F_DISPLAY;
        if ('letterSpacing' in ctx) ctx.letterSpacing = '8px';
        ctx.direction = 'ltr';
        ctx.fillText('CLASS OF 2027', W / 2, 1268);
        ctx.direction = 'rtl';
        if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';

        imgEl.src = canvas.toDataURL('image/png');
      }
      this._draw = draw;

      nameEl.value = S.store.get('name') || '';
      nameEl.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(function () { salt = 0; draw(); }, 200);
      });
      againBtn.addEventListener('click', function () { salt += 1; statusEl.textContent = ''; draw(); });

      function getBlob() { return new Promise(function (res) { canvas.toBlob(res, 'image/png'); }); }
      saveBtn.addEventListener('click', function () {
        getBlob().then(function (blob) {
          if (!blob) { statusEl.textContent = 'مقدرتش أجهز الصورة. جرّب تاني.'; return; }
          S.download(blob, 'senior-2027-card.png');
          statusEl.textContent = 'لو مانزلتش، اضغط مطولًا على الكارت واحفظه.';
        });
      });
      if (S.canShareFiles()) {
        shareBtn.hidden = false;
        shareBtn.addEventListener('click', function () {
          getBlob().then(function (blob) {
            if (!blob) return;
            S.shareFile(blob, 'senior-2027-card.png').catch(function () {});
          });
        });
      }

      draw();
      try {
        Promise.race([
          Promise.all([
            document.fonts.load('190px Lalezar', 'مرحبا SENIOR 2027'),
            document.fonts.load('900 60px Cairo', 'مرحبا'),
            document.fonts.load('700 30px Cairo', 'مرحبا')
          ]),
          new Promise(function (r) { setTimeout(r, 3000); })
        ]).then(draw, draw);
      } catch (e) {}
    },
    show: function () { if (this._draw) this._draw(); }
  };
})();
