(function () {
  'use strict';
  var S = window.Senior = window.Senior || {};
  S.views = S.views || {};

  // ---------- helpers ----------
  function shuffle(a) {
    var r = a.slice();
    for (var i = r.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = r[i]; r[i] = r[j]; r[j] = t;
    }
    return r;
  }
  function bag(list) {
    var q = [];
    return function () { if (!q.length) q = shuffle(list); return q.pop(); };
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function reduced() {
    try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
  }
  function hashStr(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  // ---------- content ----------
  var ARCH = {
    survivor: { title: 'الناجي من ليلة الامتحان', desc: 'بتذاكر في آخر لحظة وبتطلع بنتيجة تحترم. الضغط بيطلع أحسن ما فيك.', traits: ['قهوة كتير', 'نوم قليل', 'حظ عالي'] },
    boss: { title: 'مدير الجروب', desc: 'إنت اللي بتنظم وبتفكّر الكل بالمواعيد. الدفعة من غيرك تايهة.', traits: ['تنظيم', 'رسايل كتير', 'قيادة'] },
    social: { title: 'روح الدفعة', desc: 'بتعرف كل الناس ومفيش لمة من غيرك. الضحك معاك ببلاش.', traits: ['ضحك', 'صداقات', 'طاقة'] },
    brain: { title: 'العقل المدبر', desc: 'بتخطط لكل حاجة بدري وملازمك محدّثة. الكل بيسألك الأول.', traits: ['تركيز', 'خطط', 'ملازم'] },
    artist: { title: 'الفنان الهادي', desc: 'دماغك في عالم تاني وأفكارك مختلفة. اللي بتعمله بيبان فيه ذوقك.', traits: ['إبداع', 'هدوء', 'ذوق'] },
    chill: { title: 'الفيلسوف الرايق', desc: 'مبتتوترش من حاجة وبتقول الجملة اللي تهدي الكل. كله هيعدي.', traits: ['رواقة', 'حكمة', 'هدوء'] }
  };
  var QUIZ = [
    { q: 'ليلة الامتحان، بتعمل إيه؟', a: [['بذاكر كل حاجة في آخر ساعتين', 'survivor'], ['خلصت من أسبوع وبساعد غيري', 'brain'], ['بعمل جروب مذاكرة وأنظمه', 'boss'], ['بنام بدري وأتوكل', 'chill']] },
    { q: 'أول حاجة بتعملها لما توصل المعهد؟', a: [['أدوّر على الناس وأسلّم عليهم', 'social'], ['أشوف الجدول وأتأكد من كل حاجة', 'boss'], ['أشرب قهوة وأكمل نوم', 'survivor'], ['أقعد في ركني وأتفرج', 'artist']] },
    { q: 'في مشروع جماعي، دورك إيه؟', a: [['أقسّم الشغل وأتابع', 'boss'], ['أعمل التصميم والشكل', 'artist'], ['أحمّس الكل وأجيب الأكل', 'social'], ['أخلّص الجزء بتاعي في آخر لحظة', 'survivor']] },
    { q: 'شنطتك شكلها إيه؟', a: [['منظمة ومفيهاش حاجة زيادة', 'brain'], ['فيها كل حاجة ولا حاجة', 'survivor'], ['فيها كشكول رسم وسماعات', 'artist'], ['خفيفة وخلاص', 'chill']] },
    { q: 'جروب الدفعة ساكت، إنت؟', a: [['أبعت ميم يحيي الجروب', 'social'], ['أفكّرهم بالمواعيد والمهم', 'boss'], ['أتفرج من بعيد وأضحك', 'chill'], ['أصمم حاجة وأبعتها', 'artist']] },
    { q: 'إيه جملتك المشهورة؟', a: [['«لسه في وقت»', 'survivor'], ['«إحنا اتفقنا على إيه؟»', 'brain'], ['«يلا نطلع نتصور»', 'social'], ['«كله هيعدي»', 'chill']] },
    { q: 'هتذاكر فين؟', a: [['المكتبة الهادية', 'brain'], ['كافيه فيه ناس', 'social'], ['في البيت وأي حتة', 'chill'], ['مكان شكله حلو أتصور فيه', 'artist']] },
    { q: 'حفلة التخرج، هتكون…', a: [['اللي بينظم كل حاجة', 'boss'], ['أول واحد على الدانس فلور', 'social'], ['اللي بيصوّر كل اللحظات', 'artist'], ['اللي جاي في آخر لحظة', 'survivor']] }
  ];

  var WHEEL = [
    { name: 'تحدي', color: '#14101A', ink: '#FFFFFF', items: ['اعمل حركة رقص لمدة 10 ثواني', 'قلّد دكتور من المعهد والكل يخمّن مين', 'احكي نكتة والكل لازم يضحك', 'اتكلم بلكنة تانية لمدة دقيقتين', 'اعمل سيلفي مضحك وابعته للجروب', 'غنّي أول سطر من أغنية قدام الكل', 'قلّد صوت حد من الدفعة والكل يخمّن', 'مثّل مشهد من فيلم والكل يخمّن'] },
    { name: 'اعتراف', color: '#D6337A', ink: '#FFFFFF', items: ['أغرب عذر قلته عشان تتأخر؟', 'أسوأ موقف حصلك في امتحان؟', 'آخر مرة نمت في محاضرة كانت إمتى؟', 'حاجة ندمان إنك معملتهاش في المعهد؟', 'مادة كنت بتحبها ومش هتعترف؟', 'مين أكتر واحد اتعلمت منه في الدفعة؟'] },
    { name: 'سؤال', color: '#C7CBD5', ink: '#14101A', items: ['إيه أحلى ذكرى ليك في المعهد؟', 'هتعمل إيه أول أسبوع بعد التخرج؟', 'لو ترجع أول يوم، هتغيّر إيه؟', 'وصف الدفعة في كلمة واحدة؟', 'أحلى دكتور أو معيد، واتعلمت منه إيه؟', 'إيه حلمك بعد خمس سنين؟'] },
    { name: 'مين فينا', color: '#7A3A78', ink: '#FFFFFF', items: ['مين الأكتر احتمالًا يبقى مشهور؟', 'مين الأكتر احتمالًا ينسى ميعاد الحفلة؟', 'مين أكتر واحد بيضحّك الدفعة؟', 'مين هيبقى مدير شركة؟', 'مين الأكتر احتمالًا يعيّط في الحفلة؟'] },
    { name: 'جايزة', color: '#AEB3BF', ink: '#14101A', items: ['خد تصفيق حار من الكل', 'اختار حد يعمل دورك النهارده', 'إنت معفي من التحدي الجاي', 'اختار أغنية تتشغل دلوقتي'] },
    { name: 'حظ', color: '#E8508F', ink: '#14101A', items: ['الدور بيعدي للي على يمينك', 'لف تاني', 'إنت اللي تختار مين يلف بعدك', 'اختار حد يشاركك التحدي'] }
  ];

  var WHO = [
    'مين الأكتر احتمالًا ينسى ميعاد الامتحان؟', 'مين الأكتر احتمالًا يبقى مشهور؟', 'مين الأكتر احتمالًا يتأخر على حفلة التخرج؟',
    'مين الأكتر احتمالًا يعيّط في الحفلة؟', 'مين الأكتر احتمالًا يفتح مشروع أكل؟', 'مين الأكتر احتمالًا ينام في المحاضرة؟',
    'مين الأكتر احتمالًا يسافر برة؟', 'مين الأكتر احتمالًا يبقى مدير شركة؟', 'مين الأكتر احتمالًا يضحك في وقت غلط؟',
    'مين الأكتر احتمالًا يكسب جايزة الدفعة؟', 'مين الأكتر احتمالًا يفتكر كل تفاصيل المعهد بعد عشر سنين؟', 'مين الأكتر احتمالًا يبقى أول واحد يتجوز؟',
    'مين الأكتر احتمالًا يعمل جروب الدفعة القديمة؟', 'مين الأكتر احتمالًا يفضل يقول «هبدأ أذاكر بكرة»؟', 'مين الأكتر احتمالًا يصوّر الحفلة كلها؟',
    'مين الأكتر احتمالًا يضيع في أي مكان جديد؟', 'مين الأكتر احتمالًا يبقى معلّم أو دكتور؟', 'مين الأكتر احتمالًا ينسى موبايله في أي حتة؟',
    'مين الأكتر احتمالًا يخلّص أي شغل في آخر دقيقة؟', 'مين الأكتر احتمالًا يبقى نجم سوشيال ميديا؟', 'مين الأكتر احتمالًا يغيّر تخصصه؟',
    'مين الأكتر احتمالًا يعزم الدفعة كلها على الأكل؟'
  ];

  // ---------- hub ----------
  function hubHTML() {
    return '<h1 class="vt">ألعاب الدفعة</h1><p class="lead">لعب وضحك للمّات الدفعة. كله على موبايل واحد.</p>' +
      '<div class="tiles one">' +
      '<a class="tile" href="#/games/quiz"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h0"/></svg><b>أي سينيور أنت؟</b><span>8 أسئلة وتطلع لك شخصيتك وكارت تشاركه</span></a>' +
      '<a class="tile" href="#/games/wheel"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3v9l6 4M12 12L5 16"/></svg><b>عجلة التحديات</b><span>لف العجلة: تحدي، اعتراف، سؤال، جايزة</span></a>' +
      '<a class="tile" href="#/games/who"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 19c.6-3 3-4.5 6-4.5s5.4 1.5 6 4.5M15.5 14.5c2.6 0 4.6 1.2 5.5 3.5"/></svg><b>مين الأكتر احتمالًا؟</b><span>سؤال والكل يختار، وفي الآخر تعرفوا الفائز</span></a>' +
      '</div>';
  }

  // ---------- quiz ----------
  function mountQuiz(box) {
    box.innerHTML =
      '<div data-s="start"><h1 class="vt">أي سينيور أنت؟</h1><p class="lead">8 أسئلة سريعة وتعرف شخصيتك في الدفعة.</p>' +
      '<input data-r="name" type="text" maxlength="24" placeholder="اكتب اسمك" autocomplete="off">' +
      '<button data-r="go" class="primary wide" type="button">ابدأ</button></div>' +
      '<div data-s="play" hidden><div class="progress"><i data-r="bar"></i></div><p class="muted" data-r="count"></p>' +
      '<h2 class="qtext" data-r="q"></h2><div class="answers" data-r="ans"></div></div>' +
      '<div data-s="res" hidden><div class="card-wrap"><img data-r="img" alt="كارت شخصيتك"></div>' +
      '<p class="lead center" data-r="desc"></p>' +
      '<div class="actions"><button data-r="save" class="primary" type="button">احفظ الكارت</button><button data-r="share" type="button" hidden>شارك</button><button data-r="again" type="button">العب تاني</button></div>' +
      '<p class="status" data-r="status" role="status" aria-live="polite"></p></div>';
    function r(n) { return box.querySelector('[data-r="' + n + '"]'); }
    function scr(n) { ['start', 'play', 'res'].forEach(function (s) { box.querySelector('[data-s="' + s + '"]').hidden = s !== n; }); }
    var st = { i: 0, score: {}, name: '', canvas: null };

    function drawResult(name, key) {
      var K = S.cardKit, A = ARCH[key], c = document.createElement('canvas');
      c.width = K.W; c.height = K.H;
      var ctx = c.getContext('2d');
      K.base(ctx);
      var size = 130;
      ctx.font = size + 'px ' + K.F_DISPLAY;
      while (size > 60 && ctx.measureText(name).width > 860) { size -= 6; ctx.font = size + 'px ' + K.F_DISPLAY; }
      ctx.fillStyle = K.PINK; ctx.fillText(name, K.W / 2 + 6, 376);
      ctx.fillStyle = K.INK; ctx.fillText(name, K.W / 2, 370);
      ctx.fillStyle = K.INK;
      ctx.fillRect(110, 470, K.W / 2 - 150, 6); ctx.fillRect(K.W / 2 + 40, 470, K.W / 2 - 150, 6);
      K.sparkle(ctx, K.W / 2, 473, 24, K.PINK);
      ctx.fillStyle = K.PINK; ctx.font = '700 36px ' + K.F_BODY;
      ctx.fillText('شخصيتك في الدفعة', K.W / 2, 540);
      var t = 96, lines;
      do { ctx.font = '900 ' + t + 'px ' + K.F_BODY; lines = K.wrap(ctx, A.title, 840); t -= 6; } while (lines.length > 2 && t > 52);
      var tl = t + 34;
      var dsz = 44, dl;
      do { ctx.font = '700 ' + dsz + 'px ' + K.F_BODY; dl = K.wrap(ctx, A.desc, 820); dsz -= 2; } while (dl.length > 4 && dsz > 30);
      var dlh = dsz + 24;
      var blockH = lines.length * tl + 50 + dl.length * dlh + 60 + 70;
      var y = 600 + (1090 - 600 - blockH) / 2 + tl / 2;
      ctx.fillStyle = K.INK;
      ctx.font = '900 ' + t + 'px ' + K.F_BODY;
      for (var i = 0; i < lines.length; i++) { ctx.fillText(lines[i], K.W / 2, y); y += tl; }
      y += 50 - tl / 2 + dlh / 2;
      ctx.font = '700 ' + dsz + 'px ' + K.F_BODY;
      for (var j = 0; j < dl.length; j++) { ctx.fillText(dl[j], K.W / 2, y); y += dlh; }
      var ty = y - dlh / 2 + 60;
      // traits (laid out right-to-left, centered as a group)
      ctx.font = '700 34px ' + K.F_BODY;
      var ws = A.traits.map(function (tr) { return ctx.measureText(tr).width + 56; }), gap = 22;
      var total = ws.reduce(function (sum, v) { return sum + v; }, 0) + gap * (ws.length - 1);
      var cur = K.W / 2 + total / 2;
      for (var k = 0; k < A.traits.length; k++) {
        ctx.fillStyle = K.INK; K.roundRect(ctx, cur - ws[k], ty, ws[k], 70, 35); ctx.fill();
        ctx.fillStyle = '#FFFFFF'; ctx.fillText(A.traits[k], cur - ws[k] / 2, ty + 36);
        cur -= ws[k] + gap;
      }
      ctx.fillStyle = K.INK; ctx.font = '36px ' + K.F_DISPLAY;
      if ('letterSpacing' in ctx) ctx.letterSpacing = '8px';
      ctx.direction = 'ltr'; ctx.fillText('CLASS OF 2027', K.W / 2, 1268); ctx.direction = 'rtl';
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
      return c;
    }

    function renderQ() {
      var q = QUIZ[st.i];
      r('count').textContent = 'سؤال ' + (st.i + 1) + ' من ' + QUIZ.length;
      r('bar').style.width = Math.round((st.i / QUIZ.length) * 100) + '%';
      r('q').textContent = q.q;
      var ans = r('ans'); ans.textContent = '';
      shuffle(q.a).forEach(function (o) {
        var b = el('button', 'ans', o[0]); b.type = 'button';
        b.addEventListener('click', function () {
          st.score[o[1]] = (st.score[o[1]] || 0) + 1;
          st.i++;
          if (st.i < QUIZ.length) renderQ(); else finish();
        });
        ans.appendChild(b);
      });
    }
    function finish() {
      var keys = Object.keys(ARCH), best = -1, tops = [];
      keys.forEach(function (k) { var v = st.score[k] || 0; if (v > best) { best = v; tops = [k]; } else if (v === best) tops.push(k); });
      var key = tops[hashStr(st.name + tops.join()) % tops.length];
      st.canvas = drawResult(st.name, key);
      r('img').src = st.canvas.toDataURL('image/png');
      r('desc').textContent = 'إنت «' + ARCH[key].title + '». ' + ARCH[key].desc;
      r('status').textContent = '';
      scr('res');
      try { window.scrollTo(0, 0); } catch (e) {}
    }
    r('go').addEventListener('click', function () {
      var n = r('name').value.trim();
      if (!n) { r('name').focus(); return; }
      st.name = n; st.i = 0; st.score = {};
      S.store.set('name', n);
      scr('play'); renderQ();
    });
    r('again').addEventListener('click', function () { scr('start'); });
    r('save').addEventListener('click', function () {
      if (!st.canvas) return;
      st.canvas.toBlob(function (b) {
        if (!b) return;
        S.download(b, 'senior-2027-personality.png');
        r('status').textContent = 'لو مانزلتش، اضغط مطولًا على الكارت واحفظه.';
      }, 'image/png');
    });
    if (S.canShareFiles()) {
      r('share').hidden = false;
      r('share').addEventListener('click', function () {
        if (!st.canvas) return;
        st.canvas.toBlob(function (b) { if (b) S.shareFile(b, 'senior-2027-personality.png').catch(function () {}); }, 'image/png');
      });
    }
    return { enter: function () { r('name').value = S.store.get('name') || ''; scr('start'); } };
  }

  // ---------- wheel ----------
  function mountWheel(box) {
    box.innerHTML =
      '<h1 class="vt">عجلة التحديات</h1><p class="lead">اضغط لف، ونفّذ اللي يطلع.</p>' +
      '<div class="wheel-box"><canvas data-r="cv" width="640" height="660" role="img" aria-label="عجلة التحديات"></canvas></div>' +
      '<button data-r="spin" class="primary wide" type="button">لف العجلة</button>' +
      '<div class="panel wheel-res" data-r="res" hidden><div class="wr-cat" data-r="cat"></div><div class="wr-item" data-r="item"></div></div>';
    function r(n) { return box.querySelector('[data-r="' + n + '"]'); }
    var cv = r('cv'), ctx = cv.getContext('2d'), N = WHEEL.length, seg = 2 * Math.PI / N;
    var rot = 0, spinning = false, bags = WHEEL.map(function (c) { return bag(c.items); });
    var CX = 320, CY = 350, R = 290;

    function draw() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.textBaseline = 'middle'; ctx.direction = 'rtl';
      for (var i = 0; i < N; i++) {
        var a0 = rot + i * seg, a1 = a0 + seg;
        ctx.beginPath(); ctx.moveTo(CX, CY); ctx.arc(CX, CY, R, a0, a1); ctx.closePath();
        ctx.fillStyle = WHEEL[i].color; ctx.fill();
        ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 4; ctx.stroke();
        ctx.save();
        ctx.translate(CX, CY);
        var mid = a0 + seg / 2, flip = Math.cos(mid) < 0;
        ctx.rotate(flip ? mid + Math.PI : mid);
        ctx.fillStyle = WHEEL[i].ink; ctx.textAlign = flip ? 'left' : 'right';
        ctx.font = '900 38px Cairo, "Segoe UI", Tahoma, sans-serif';
        ctx.fillText(WHEEL[i].name, flip ? -(R - 26) : R - 26, 0);
        ctx.restore();
      }
      ctx.beginPath(); ctx.arc(CX, CY, 34, 0, 6.2832); ctx.fillStyle = '#FFFFFF'; ctx.fill();
      ctx.lineWidth = 6; ctx.strokeStyle = '#14101A'; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(CX - 26, 14); ctx.lineTo(CX + 26, 14); ctx.lineTo(CX, 74); ctx.closePath();
      ctx.fillStyle = '#D6337A'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#14101A'; ctx.stroke();
    }
    function finish() {
      spinning = false; r('spin').disabled = false;
      var ang = (((-Math.PI / 2 - rot) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      var idx = Math.min(N - 1, Math.floor(ang / seg));
      r('cat').textContent = WHEEL[idx].name;
      r('item').textContent = bags[idx]();
      r('res').hidden = false;
    }
    r('spin').addEventListener('click', function () {
      if (spinning) return;
      spinning = true; r('spin').disabled = true; r('res').hidden = true;
      var start = rot, target = start + (5 + Math.random() * 3) * 2 * Math.PI + Math.random() * 2 * Math.PI;
      var dur = reduced() ? 0 : 4200, t0 = Date.now();
      (function step() {
        var p = dur ? Math.min(1, (Date.now() - t0) / dur) : 1;
        rot = start + (target - start) * (1 - Math.pow(1 - p, 3));
        draw();
        if (p < 1) requestAnimationFrame(step); else finish();
      })();
    });
    draw();
    return { enter: function () { draw(); } };
  }

  // ---------- who is most likely ----------
  function mountWho(box) {
    box.innerHTML =
      '<div data-s="setup"><h1 class="vt">مين الأكتر احتمالًا؟</h1><p class="lead">ضيفوا أسامي اللاعبين (2 لـ 12)، وكل سؤال الكل يتفق على حد.</p>' +
      '<form data-r="form" autocomplete="off"><input data-r="pname" type="text" maxlength="16" placeholder="اسم لاعب"><button class="wide" type="submit">إضافة</button></form>' +
      '<div class="chips players" data-r="list"></div>' +
      '<button data-r="start" class="primary wide" type="button">ابدأ اللعب</button><p class="status" data-r="smsg" role="status" aria-live="polite"></p></div>' +
      '<div data-s="play" hidden><p class="muted" data-r="qn"></p><h2 class="qtext" data-r="q"></h2><div class="names" data-r="names"></div>' +
      '<p class="status" data-r="pmsg" role="status" aria-live="polite"></p>' +
      '<div class="actions"><button data-r="skip" type="button">تخطي</button><button data-r="end" type="button">إنهاء اللعبة</button></div></div>' +
      '<div data-s="end" hidden><h1 class="vt">النتيجة</h1><p class="lead center" data-r="win"></p><ol class="rank" data-r="rank"></ol>' +
      '<div class="actions"><button data-r="replay" class="primary" type="button">العب تاني</button><button data-r="edit" type="button">غيّر اللاعبين</button></div></div>';
    function r(n) { return box.querySelector('[data-r="' + n + '"]'); }
    function scr(n) { ['setup', 'play', 'end'].forEach(function (s) { box.querySelector('[data-s="' + s + '"]').hidden = s !== n; }); }
    var players = [], scores = {}, nextQ = bag(WHO), qn = 0;

    function load() {
      try { players = JSON.parse(S.store.get('players') || '[]'); } catch (e) { players = []; }
      if (!Array.isArray(players)) players = [];
      players = players.filter(function (p) { return typeof p === 'string' && p; }).slice(0, 12);
      if (!players.length && S.store.get('name')) players = [S.store.get('name')];
    }
    function save() { S.store.set('players', JSON.stringify(players)); }
    function renderList() {
      var l = r('list'); l.textContent = '';
      players.forEach(function (p, i) {
        var b = el('button', null, p + '  ×'); b.type = 'button'; b.setAttribute('aria-label', 'امسح ' + p);
        b.addEventListener('click', function () { players.splice(i, 1); save(); renderList(); });
        l.appendChild(b);
      });
    }
    r('form').addEventListener('submit', function (e) {
      e.preventDefault();
      var n = r('pname').value.trim().slice(0, 16);
      if (!n) return;
      if (players.indexOf(n) >= 0) { r('smsg').textContent = 'الاسم ده موجود.'; return; }
      if (players.length >= 12) { r('smsg').textContent = 'الحد الأقصى 12 لاعب.'; return; }
      players.push(n); save(); r('pname').value = ''; r('smsg').textContent = ''; renderList();
    });
    function question() {
      qn++;
      r('qn').textContent = 'السؤال ' + qn;
      r('q').textContent = nextQ();
      var names = r('names'); names.textContent = '';
      players.forEach(function (p) {
        var b = el('button', 'namebtn', p); b.type = 'button';
        b.addEventListener('click', function () {
          scores[p] = (scores[p] || 0) + 1;
          r('pmsg').textContent = 'اتسجلت نقطة لـ ' + p;
          question();
        });
        names.appendChild(b);
      });
    }
    function startGame() {
      if (players.length < 2) { r('smsg').textContent = 'محتاجين لاعبين اتنين على الأقل.'; return; }
      scores = {}; qn = 0; r('pmsg').textContent = '';
      scr('play'); question();
    }
    function results() {
      var sorted = players.slice().sort(function (a, b) { return (scores[b] || 0) - (scores[a] || 0); });
      var top = scores[sorted[0]] || 0;
      r('win').textContent = top ? sorted[0] + ' هو الأكتر احتمالًا للحاجات كلها!' : 'محدش اتصوّت له. جربوا تاني.';
      var rank = r('rank'); rank.textContent = '';
      sorted.forEach(function (p) { rank.appendChild(el('li', null, p + ' · ' + (scores[p] || 0) + ' نقطة')); });
      scr('end');
    }
    r('start').addEventListener('click', startGame);
    r('skip').addEventListener('click', question);
    r('end').addEventListener('click', results);
    r('replay').addEventListener('click', startGame);
    r('edit').addEventListener('click', function () { scr('setup'); renderList(); });
    return { enter: function () { load(); renderList(); scr('setup'); } };
  }

  // ---------- view ----------
  S.views.games = {
    mount: function (root) {
      root.innerHTML = '<div data-g="hub"></div><div data-g="quiz" hidden></div><div data-g="wheel" hidden></div><div data-g="who" hidden></div>';
      function box(n) { return root.querySelector('[data-g="' + n + '"]'); }
      box('hub').innerHTML = hubHTML();
      this._games = { quiz: mountQuiz(box('quiz')), wheel: mountWheel(box('wheel')), who: mountWho(box('who')) };
      this._box = box;
    },
    show: function (sub) {
      var names = { quiz: 'أي سينيور أنت؟', wheel: 'عجلة التحديات', who: 'مين الأكتر احتمالًا؟' };
      var which = this._games[sub] ? sub : 'hub';
      ['hub', 'quiz', 'wheel', 'who'].forEach(function (g) { this._box(g).hidden = g !== which; }, this);
      if (S.setTitle) S.setTitle(which === 'hub' ? 'ألعاب الدفعة' : names[which]);
      if (which !== 'hub') this._games[which].enter();
    }
  };
})();
