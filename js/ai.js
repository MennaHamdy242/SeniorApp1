(function () {
  'use strict';
  var S = window.Senior = window.Senior || {};
  S.views = S.views || {};

  // Model names change often, so they are editable in the UI ("advanced").
  var PROVIDERS = {
    gemini: {
      name: 'Gemini',
      model: 'gemini-3.1-flash-image',
      keyUrl: 'https://aistudio.google.com/apikey',
      steps: [
        'افتح صفحة المفتاح (الزرار اللي تحت) وسجّل بحساب جوجل.',
        'اضغط Create API key واختار مشروع.',
        'انسخ المفتاح والصقه في الخانة اللي تحت.',
        'مهم: توليد الصور مش متاح في النسخة المجانية. لازم تفعّل الفوترة (Billing) من نفس الموقع، ولو الخدمة مش متاحة في بلدك استخدم الوضع اليدوي المجاني.'
      ]
    },
    openai: {
      name: 'ChatGPT',
      model: 'gpt-image-2',
      keyUrl: 'https://platform.openai.com/api-keys',
      steps: [
        'افتح صفحة المفتاح (الزرار اللي تحت) وسجّل دخول.',
        'اضغط Create new secret key وانسخه فورًا (بيظهر مرة واحدة).',
        'لازم يكون في الحساب رصيد. حط حد أقصى للصرف من Settings ثم Limits.',
        'الصق المفتاح في الخانة اللي تحت.'
      ]
    }
  };

  function extra(o) { return o.extra ? ' Additional instructions from the user: ' + o.extra + '.' : ''; }
  function sty(o) { return o.style ? ' ' + o.style + '.' : ''; }
  var TEMPLATES = [
    {
      id: 'caricature', label: 'كاريكاتير', photo: true, ratio: 'portrait',
      extraLabel: 'تفاصيل إضافية (اختياري)', extraHint: 'مثال: بنظارة، وخلفية ديسكو',
      styles: [
        { id: 'pixar', label: '3D كرتوني', text: 'Style: polished 3D animated-movie look with soft cinematic lighting.' },
        { id: 'comic', label: 'كوميكس', text: 'Style: bold comic-book illustration with thick ink lines and halftone dots.' },
        { id: 'chibi', label: 'شيبي لطيف', text: 'Style: cute chibi character with a big head and a small body.' },
        { id: 'pop', label: 'بوب آرت', text: 'Style: retro pop-art with bold flat colors and strong outlines.' },
        { id: 'water', label: 'ألوان مائية', text: 'Style: soft hand-painted watercolor illustration.' }
      ],
      build: function (o) {
        return 'Turn the person in the attached photo into a friendly, flattering caricature illustration: a slightly exaggerated head with big expressive eyes and a warm smile, keeping the face, hairstyle, skin tone and glasses recognizable. They wear a black graduation cap with a gold tassel. Clean vibrant background in silver, black and pink with a small banner reading "SENIOR 2027". Fun and warm, never mocking. No other text.' + sty(o) + extra(o);
      }
    },
    {
      id: 'poster', label: 'بوستر فيلم', photo: true, ratio: 'portrait',
      extraLabel: 'الجملة اللي تحت العنوان (اختياري)', extraHint: 'مثال: The final chapter',
      styles: [
        { id: 'action', label: 'أكشن', text: 'Mood: action blockbuster with explosive orange and teal lighting.' },
        { id: 'romance', label: 'رومانسي', text: 'Mood: romantic drama with warm golden-hour light.' },
        { id: 'comedy', label: 'كوميدي', text: 'Mood: bright comedy with playful colors and a funny expression.' },
        { id: 'noir', label: 'نوار', text: 'Mood: black-and-white film noir with dramatic shadows.' },
        { id: 'scifi', label: 'خيال علمي', text: 'Mood: sci-fi with neon glow and a futuristic background.' }
      ],
      build: function (o) {
        var line = o.extra || 'The final chapter';
        return 'Create a cinematic movie poster starring the person in the attached photo (keep their face recognizable). Large chrome silver title letters: "SENIOR 2027". Tagline: "' + line + '". A small credit line: "Starring ' + (o.name || 'You') + '". Dramatic lighting, subtle film grain, palette of silver, black and pink unless the mood says otherwise. Spell all text exactly as written.' + sty(o);
      }
    },
    {
      id: 'magazine', label: 'غلاف مجلة', photo: true, ratio: 'portrait',
      extraLabel: 'تفاصيل إضافية (اختياري)', extraHint: 'مثال: ألوان دهبي',
      styles: [
        { id: 'fashion', label: 'فاشن', text: 'Look: high-fashion editorial with elegant typography.' },
        { id: 'yearbook', label: 'كتاب الدفعة', text: 'Look: college yearbook magazine with school-spirit details.' },
        { id: 'nineties', label: 'التسعينات', text: 'Look: 1990s teen magazine with bright colors and stickers.' },
        { id: 'minimal', label: 'مينيمال', text: 'Look: minimal and clean with lots of white space.' }
      ],
      build: function (o) {
        return 'Design a glossy magazine cover featuring the person in the attached photo (keep their face recognizable). Masthead: "SENIOR". Issue line: "Class of 2027 issue". Add three short cover lines in English about graduation. Silver chrome and pink accents unless the look says otherwise. Spell all text exactly as written.' + sty(o) + extra(o);
      }
    },
    {
      id: 'sticker', label: 'ستيكر', photo: true, ratio: 'square',
      extraLabel: 'تفاصيل إضافية (اختياري)', extraHint: 'مثال: بيشرب قهوة',
      styles: [
        { id: 'kawaii', label: 'كاواي', text: 'Style: kawaii with big sparkly eyes and pastel colors.' },
        { id: 'emoji', label: 'إيموجي 3D', text: 'Style: glossy 3D emoji-like character.' },
        { id: 'street', label: 'ستريت', text: 'Style: street-art graffiti sticker with bold outlines.' },
        { id: 'pixel', label: 'بكسل', text: 'Style: retro pixel art.' }
      ],
      build: function (o) {
        return 'Make a die-cut sticker of the person in the attached photo as a cute cartoon character wearing a graduation cap. Thick white outline, plain white background, a small ribbon reading "SENIOR 2027".' + sty(o) + extra(o);
      }
    },
    {
      id: 'frame', label: 'فريم', photo: false, ratio: 'portrait',
      extraLabel: 'إضافة على الستايل (اختياري)', extraHint: 'مثال: نجوم كتير وألوان دافية',
      styles: [
        { id: 'chrome', label: 'كروم وأسود', text: 'black and silver chrome with a disco ball and pink accents' },
        { id: 'gold', label: 'دهبي فخم', text: 'luxurious gold and black with sparkles' },
        { id: 'pastel', label: 'باستيل', text: 'soft pastel pink and lavender with clouds and stars' },
        { id: 'film', label: 'شريط سينما', text: 'black film-strip border with clapperboard and camera icons' },
        { id: 'balloons', label: 'بالونات فضي', text: 'silver foil balloons and confetti' }
      ],
      build: function (o) {
        var style = (o.style || 'black and silver chrome with a disco ball and pink accents') + (o.extra ? ', ' + o.extra : '');
        return 'Design a decorative photo frame overlay for a graduation party. Output ONE image where the CENTER 70% is a plain flat white area (a photo will replace it) and only the border and decorations are drawn around the edges. Style: ' + style + '. Decorate the four corners; keep the edges simple and repeating so the frame can stretch to any photo size. Put the exact text "SENIOR 2027" on the bottom border, spelled correctly. No watermark, no people.';
      }
    },
    {
      id: 'free', label: 'حر', photo: false, ratio: 'square',
      extraLabel: 'اكتب وصف الصورة', extraHint: 'أي حاجة تتخيلها',
      styles: [],
      build: function (o) { return o.extra; }
    }
  ];

  function b64ToBlob(b64, mime) {
    var bin = atob(b64), arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }
  function trim(s, n) { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n) + '…' : s; }

  function friendlyError(status, msg, provider) {
    if (provider === 'gemini' && (/country|free tier|billing/i.test(msg || '') || status === 429)) {
      return 'جوجل بتقفل توليد الصور في النسخة المجانية ومش متاح في كل البلاد. لازم فوترة مفعّلة، أو استخدم الوضع اليدوي المجاني.';
    }
    if (status === 401 || status === 403) return 'المفتاح مش مقبول أو ملوش صلاحية. اتأكد إنه صح ومفعّل.';
    if (status === 404) return 'اسم الموديل مش موجود. غيّره من الإعدادات المتقدمة.';
    if (status === 429) return 'وصلت للحد أو الرصيد خلص. راجع حسابك عند المزود.';
    if (status === 400) return 'الطلب اتقبل بس اتنفذش: ' + trim(msg, 160);
    return 'المزود فيه مشكلة (' + status + '). جرّب بعد شوية.';
  }
  function readError(res, provider) {
    return res.text().then(function (t) {
      var msg = '';
      try { var j = JSON.parse(t); msg = (j.error && (j.error.message || j.error.status)) || ''; } catch (e) { msg = t; }
      var err = new Error(friendlyError(res.status, msg, provider));
      err.friendly = true;
      throw err;
    });
  }

  function callGemini(o) {
    var parts = [{ text: o.prompt }];
    if (o.photoB64) parts.push({ inline_data: { mime_type: 'image/jpeg', data: o.photoB64 } });
    var body = {
      contents: [{ parts: parts }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: { aspectRatio: o.ratio === 'square' ? '1:1' : '3:4' }
      }
    };
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(o.model) + ':generateContent';
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': o.key },
      body: JSON.stringify(body),
      signal: o.signal
    }).then(function (res) {
      if (!res.ok) return readError(res, 'gemini');
      return res.json().then(function (j) {
        var cand = (j.candidates || [])[0] || {};
        var ps = (cand.content && cand.content.parts) || [];
        for (var i = 0; i < ps.length; i++) {
          var d = ps[i].inlineData || ps[i].inline_data;
          if (d && d.data) return { mime: d.mimeType || d.mime_type || 'image/png', b64: d.data };
        }
        var block = (j.promptFeedback && j.promptFeedback.blockReason) || cand.finishReason;
        var err = new Error('الموديل مرجّعش صورة' + (block ? ' (' + block + ')' : '') + '. جرّب وصف أبسط أو صورة تانية.');
        err.friendly = true;
        throw err;
      });
    });
  }

  function callOpenAI(o) {
    var size = o.ratio === 'square' ? '1024x1024' : '1024x1536';
    var headers = { 'Authorization': 'Bearer ' + o.key };
    var req;
    if (o.photoB64) {
      var fd = new FormData();
      fd.append('model', o.model);
      fd.append('prompt', o.prompt);
      fd.append('size', size);
      fd.append('n', '1');
      fd.append('image', b64ToBlob(o.photoB64, 'image/jpeg'), 'photo.jpg');
      req = fetch('https://api.openai.com/v1/images/edits', { method: 'POST', headers: headers, body: fd, signal: o.signal });
    } else {
      headers['Content-Type'] = 'application/json';
      req = fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST', headers: headers, signal: o.signal,
        body: JSON.stringify({ model: o.model, prompt: o.prompt, size: size, n: 1 })
      });
    }
    return req.then(function (res) {
      if (!res.ok) return readError(res, 'openai');
      return res.json().then(function (j) {
        var d = (j.data || [])[0];
        if (d && d.b64_json) return { mime: 'image/png', b64: d.b64_json };
        var err = new Error('المزود مرجّعش صورة. جرّب تاني.');
        err.friendly = true;
        throw err;
      });
    });
  }

  S.views.ai = {
    mount: function (root) {
      function $(id) { return root.querySelector('#' + id); }
      var state = { style: '', provider: 'manual', template: 'caricature', ratio: 'portrait', photoB64: null, result: null, ctl: null, timer: null };

      function tmpl() { for (var i = 0; i < TEMPLATES.length; i++) if (TEMPLATES[i].id === state.template) return TEMPLATES[i]; return TEMPLATES[0]; }
      function styleText(t) {
        if (!t.styles || !t.styles.length) return '';
        if (state.style === 'rand') return t.styles[Math.floor(Math.random() * t.styles.length)].text;
        for (var i = 0; i < t.styles.length; i++) if (t.styles[i].id === state.style) return t.styles[i].text;
        return t.styles[0].text;
      }
      function renderStyles() {
        var t = tmpl(), box = $('aiStyles');
        box.textContent = '';
        $('aiStylesBox').hidden = !(t.styles && t.styles.length);
        if ($('aiStylesBox').hidden) return;
        if (!state.style || (state.style !== 'rand' && !t.styles.some(function (s) { return s.id === state.style; }))) state.style = t.styles[0].id;
        t.styles.concat([{ id: 'rand', label: 'مفاجأة' }]).forEach(function (s) {
          var b = document.createElement('button');
          b.type = 'button'; b.textContent = s.label; b.setAttribute('data-s', s.id);
          b.setAttribute('aria-pressed', s.id === state.style ? 'true' : 'false');
          box.appendChild(b);
        });
      }
      function press(container, attr, value) {
        var bs = container.querySelectorAll('button');
        for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', bs[i].getAttribute(attr) === value ? 'true' : 'false');
      }
      function setMsg(t) { $('aiMsg').textContent = t || ''; }

      // ---- provider & key ----
      function keyOf(p) { return S.store.get('key.' + p) || ''; }
      function modelOf(p) { return S.store.get('model.' + p) || PROVIDERS[p].model; }
      function refreshProvider() {
        var manual = state.provider === 'manual';
        $('aiKeyPanel').hidden = manual;
        $('aiManualNote').hidden = !manual;
        $('aiManualOut').hidden = true;
        $('aiGo').textContent = manual ? 'جهّز البرومبت' : 'اعمل الصورة';
        if (manual) return;
        var p = PROVIDERS[state.provider], has = !!keyOf(state.provider);
        $('aiKeyState').textContent = has ? 'مفتاح ' + p.name + ' متسجل على الجهاز ده ✓' : 'لسه مسجلتش مفتاح ' + p.name + '.';
        var ol = $('aiSteps'); ol.textContent = '';
        p.steps.forEach(function (s) { var li = document.createElement('li'); li.textContent = s; ol.appendChild(li); });
        $('aiKeyLink').href = p.keyUrl;
        $('aiKey').value = '';
        $('aiModel').value = S.store.get('model.' + state.provider) || '';
        $('aiModel').placeholder = p.model;
        $('aiKeyBox').open = !has;
      }
      $('aiProviders').addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        state.provider = b.getAttribute('data-p');
        press($('aiProviders'), 'data-p', state.provider);
        setMsg('');
        refreshProvider();
        refreshTemplate();
      });
      $('aiKeySave').addEventListener('click', function () {
        var k = $('aiKey').value.trim();
        if (!k) { setMsg('الصق المفتاح الأول.'); return; }
        S.store.set('key.' + state.provider, k);
        refreshProvider();
        setMsg('اتحفظ المفتاح على الجهاز ده بس.');
      });
      $('aiKeyClear').addEventListener('click', function () {
        S.store.del('key.' + state.provider);
        refreshProvider();
        setMsg('اتمسح المفتاح.');
      });
      $('aiModel').addEventListener('change', function (e) {
        var v = e.target.value.trim();
        if (v) S.store.set('model.' + state.provider, v); else S.store.del('model.' + state.provider);
      });

      // ---- templates ----
      var tbox = $('aiTemplates');
      TEMPLATES.forEach(function (t) {
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = t.label; b.setAttribute('data-t', t.id);
        b.setAttribute('aria-pressed', t.id === state.template ? 'true' : 'false');
        tbox.appendChild(b);
      });
      function refreshTemplate() {
        var t = tmpl();
        $('aiPhotoRow').hidden = state.provider === 'manual' || !(t.photo || t.id === 'free');
        $('aiExtraLbl').textContent = t.extraLabel;
        $('aiExtra').placeholder = t.extraHint;
        $('aiNameBox').hidden = t.id !== 'poster';
        state.ratio = t.ratio;
        press($('aiRatios'), 'data-r', state.ratio);
        renderStyles();
      }
      tbox.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        state.template = b.getAttribute('data-t');
        state.style = '';
        press(tbox, 'data-t', state.template);
        setMsg('');
        refreshTemplate();
      });
      $('aiStyles').addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        state.style = b.getAttribute('data-s');
        press($('aiStyles'), 'data-s', state.style);
      });
      $('aiRatios').addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        state.ratio = b.getAttribute('data-r');
        press($('aiRatios'), 'data-r', state.ratio);
      });

      // ---- photo ----
      $('aiPhotoIn').addEventListener('change', function (e) {
        var f = e.target.files && e.target.files[0];
        if (!f) return;
        var fr = new FileReader();
        fr.onload = function () {
          var im = new Image();
          im.onload = function () {
            var sc = Math.min(1, 1024 / Math.max(im.naturalWidth, im.naturalHeight));
            var c = document.createElement('canvas');
            c.width = Math.max(1, Math.round(im.naturalWidth * sc)); c.height = Math.max(1, Math.round(im.naturalHeight * sc));
            c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
            var url = c.toDataURL('image/jpeg', 0.9);
            state.photoB64 = url.split(',')[1];
            $('aiThumb').src = url; $('aiThumb').hidden = false;
            $('aiPhotoName').textContent = 'اتضافت الصورة.';
          };
          im.onerror = function () { $('aiPhotoName').textContent = 'مقدرتش أفتح الصورة دي.'; };
          im.src = fr.result;
        };
        fr.readAsDataURL(f);
      });

      // ---- generate ----
      function stopTimer() { clearInterval(state.timer); state.timer = null; }
      function setBusy(on) {
        $('aiGo').disabled = on; $('aiCancel').hidden = !on;
        if (!on) stopTimer();
      }
      $('aiCancel').addEventListener('click', function () { if (state.ctl) state.ctl.abort(); });
      $('aiGo').addEventListener('click', function () {
        if (state.provider === 'manual') {
          var mt = tmpl(), mx = $('aiExtra').value.trim().slice(0, 200);
          if (mt.id === 'free' && !mx) { setMsg('اكتب وصف الصورة.'); return; }
          $('aiPrompt').value = mt.build({ name: ($('aiName').value.trim() || S.store.get('name') || ''), extra: mx, style: styleText(mt) });
          $('aiManualOut').hidden = false;
          setMsg('انسخ البرومبت وروح لأي شات.');
          try { $('aiManualOut').scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
          return;
        }
        var pk = state.provider, key = keyOf(pk), t = tmpl(), name = PROVIDERS[pk].name;
        if (!key) { setMsg('سجّل مفتاح ' + name + ' الأول.'); $('aiKeyBox').open = true; return; }
        var extraTxt = $('aiExtra').value.trim().slice(0, 200);
        var usePhoto = (t.photo || t.id === 'free') && !!state.photoB64;
        if (t.photo && !state.photoB64) { setMsg('اختار صورة الأول.'); return; }
        if (t.id === 'free' && !extraTxt) { setMsg('اكتب وصف الصورة.'); return; }
        if (usePhoto && !S.store.get('consent')) {
          if (!window.confirm('الصورة هتتبعت لـ ' + name + ' بمفتاحك. استخدمها بموافقة صاحبها. تكمل؟')) return;
          S.store.set('consent', '1');
        }
        var prompt = t.build({ name: ($('aiName').value.trim() || S.store.get('name') || ''), extra: extraTxt, style: styleText(t) });
        state.ctl = new AbortController();
        var to = setTimeout(function () { state.ctl.abort(); }, 150000);
        var t0 = Date.now();
        setBusy(true); $('aiResult').hidden = true;
        setMsg('بيشتغل... 0 ث');
        state.timer = setInterval(function () { setMsg('بيشتغل... ' + Math.round((Date.now() - t0) / 1000) + ' ث'); }, 1000);
        var opts = { key: key, model: modelOf(pk), prompt: prompt, ratio: state.ratio, photoB64: usePhoto ? state.photoB64 : null, signal: state.ctl.signal };
        (pk === 'gemini' ? callGemini(opts) : callOpenAI(opts)).then(function (img) {
          return new Promise(function (res, rej) {
            var im = new Image();
            im.onload = function () {
              var sc = Math.min(1, 2400 / Math.max(im.naturalWidth, im.naturalHeight));
              var c = document.createElement('canvas');
              c.width = Math.max(1, Math.round(im.naturalWidth * sc)); c.height = Math.max(1, Math.round(im.naturalHeight * sc));
              c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
              res(c);
            };
            im.onerror = function () { rej(new Error('الصورة اللي رجعت مش مفهومة. جرّب تاني.')); };
            im.src = 'data:' + img.mime + ';base64,' + img.b64;
          });
        }).then(function (canvas) {
          showResult(canvas);
          setMsg('خلصت.');
        }).catch(function (err) {
          if (err && err.name === 'AbortError') setMsg('اتلغى.');
          else if (err && err.friendly) setMsg(err.message);
          else if (err instanceof TypeError) setMsg('مقدرتش أوصل للمزود. اتأكد من النت، ولو ChatGPT مش راضي جرّب Gemini.');
          else setMsg((err && err.message) || 'حصلت مشكلة. جرّب تاني.');
        }).then(function () { clearTimeout(to); setBusy(false); });
      });

      // ---- result actions ----
      function showResult(canvas) {
        state.result = canvas;
        $('aiImg').src = canvas.toDataURL('image/png');
        $('aiUse').textContent = tmpl().id === 'frame' ? 'استخدمها كفريم' : 'حطها في الفريمات';
        $('aiResult').hidden = false;
        try { $('aiResult').scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
      }
      function resultBlob() { return new Promise(function (res) { state.result.toBlob(res, 'image/png'); }); }
      $('aiSave').addEventListener('click', function () {
        if (!state.result) return;
        resultBlob().then(function (b) { if (b) { S.download(b, 'senior-2027-ai.png'); setMsg('لو مانزلتش، اضغط مطولًا على الصورة واحفظها.'); } });
      });
      if (S.canShareFiles()) {
        $('aiShare').hidden = false;
        $('aiShare').addEventListener('click', function () {
          if (!state.result) return;
          resultBlob().then(function (b) { if (b) return S.shareFile(b, 'senior-2027-ai.png'); }).catch(function () {});
        });
      }
      $('aiUse').addEventListener('click', function () {
        if (!state.result) return;
        var kind = tmpl().id === 'frame' ? 'frame' : 'photo';
        if (S.views.frames && S.views.frames.importImage) S.views.frames.importImage(kind, state.result);
        location.hash = '#/frames';
      });

      $('aiCopy').addEventListener('click', function () {
        var ta = $('aiPrompt');
        ta.focus(); ta.select();
        var fail = 'النص متحدد. اضغط نسخ من الكيبورد.';
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(ta.value).then(function () { setMsg('اتنسخ البرومبت.'); }, function () { setMsg(fail); });
            return;
          }
          setMsg(document.execCommand('copy') ? 'اتنسخ البرومبت.' : fail);
        } catch (e) { setMsg(fail); }
      });
      $('aiImport').addEventListener('change', function (e) {
        var f = e.target.files && e.target.files[0];
        if (!f) return;
        var fr = new FileReader();
        fr.onload = function () {
          var im = new Image();
          im.onload = function () {
            var sc = Math.min(1, 2400 / Math.max(im.naturalWidth, im.naturalHeight));
            var c = document.createElement('canvas');
            c.width = Math.max(1, Math.round(im.naturalWidth * sc)); c.height = Math.max(1, Math.round(im.naturalHeight * sc));
            c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
            showResult(c);
            setMsg('اتضافت الصورة.');
          };
          im.onerror = function () { setMsg('مقدرتش أفتح الصورة دي.'); };
          im.src = fr.result;
        };
        fr.readAsDataURL(f);
      });

      refreshProvider();
      refreshTemplate();
    },
    show: function (root) {
      var n = document.getElementById('aiName');
      if (n && !n.value) n.value = S.store.get('name') || '';
    }
  };
})();
