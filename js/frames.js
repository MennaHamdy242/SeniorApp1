(function () {
  'use strict';
  var S = window.Senior = window.Senior || {};
  S.views = S.views || {};
  var F_DISPLAY = "'Lalezar','Cairo','Segoe UI',Tahoma,sans-serif";
  var F_BODY = "'Cairo','Segoe UI',Tahoma,sans-serif";
  var F_EMOJI = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  var EMOJIS = ['🎓', '🪩', '✨', '⭐', '🎉', '📸', '🎬', '💖', '🔥', '🥂', '🎈', '📚'];

  // ==RENDERER-START==

  var PRESETS = {
    chrome: { bg: ['#F7F8FB', '#C7CBD5', '#FAFBFD', '#AEB3BF', '#E9EBF0'], gloss: true, line1: '#14101A', line2: 'accent', text: '#14101A', sub: '#14101A', accent: '#D6337A', inset: { t: 0.05, s: 0.05, b: 0.22 }, radius: 0.05, borderStyle: 'double', band: true, shadow: true, decor: ['sparkles'] },
    polaroid: { bg: ['#FBF7EE', '#F1E9D8'], line1: '#D9CFBA', line2: '#14101A', text: '#1B1420', sub: '#6B6155', accent: '#B8892B', inset: { t: 0.07, s: 0.07, b: 0.26 }, radius: 0.02, borderStyle: 'plain', band: true, shadow: false, decor: ['stars'] },
    gold: { bg: ['#FBF6E6', '#EFE2B8'], line1: '#B8892B', line2: '#D9B44A', text: '#1B1420', sub: '#5A4720', accent: '#B8892B', inset: { t: 0.04, s: 0.04, b: 0.04 }, radius: 0.04, borderStyle: 'double', band: false, ribbon: true, cap: true, shadow: false, decor: ['stars', 'sparkles'] },
    cinema: { bg: ['#0E0C12', '#1C1722'], line1: '#0E0C12', line2: 'accent', text: '#FFFFFF', sub: 'accent', accent: '#F2C14E', inset: { t: 0.09, s: 0.035, b: 0.22 }, radius: 0.02, borderStyle: 'film', band: true, shadow: false, decor: [] },
    disco: { bg: ['#24123F', '#0C0714', '#2B1150'], line1: '#0C0714', line2: 'accent', text: '#FFFFFF', sub: '#F6B8D4', accent: '#E8508F', inset: { t: 0.06, s: 0.06, b: 0.22 }, radius: 0.05, borderStyle: 'dots', band: true, shadow: true, decor: ['sparkles', 'confetti'] }
  };
  var RATIOS = { square: 1, r45: 4 / 5, story: 9 / 16 };

  var state = {
    style: 'chrome', ratio: 'fit', thick: 1, round: 1, zoom: 1, panX: 0, panY: 0,
    accent: null, decor: true, confetti: false,
    main: 'SENIOR 2027', sub: 'CLASS OF 2027',
    stickers: [], sel: -1, aiSpec: null,
    slice: 'nine', corner: 0.25, key: false, tol: 40
  };
  var photo = { src: null, w: 0, h: 0 };
  var frameImg = { src: null, w: 0, h: 0, orig: null };

  function currentSpec() {
    if (state.style === 'custom') return null;
    if (state.style === 'ai') return state.aiSpec || PRESETS.chrome;
    return PRESETS[state.style] || PRESETS.chrome;
  }
  function rr(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
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
  function hasArabic(s) { return /[\u0600-\u06FF]/.test(s); }
  function setSpacing(ctx, text, px) {
    if ('letterSpacing' in ctx) ctx.letterSpacing = hasArabic(text) ? '0px' : px + 'px';
  }
  function sparkle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.quadraticCurveTo(x, y, x, y + r);
    ctx.quadraticCurveTo(x, y, x - r, y);
    ctx.quadraticCurveTo(x, y, x, y - r);
    ctx.closePath();
    ctx.fill();
  }
  function star5(ctx, x, y, r) {
    ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var ang = -Math.PI / 2 + i * Math.PI / 5;
      var rad = i % 2 === 0 ? r : r * 0.46;
      var px = x + Math.cos(ang) * rad, py = y + Math.sin(ang) * rad;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  function heart(ctx, x, y, r) {
    ctx.beginPath();
    ctx.moveTo(x, y + r * 0.9);
    ctx.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.7, y - r * 1.1, x, y - r * 0.4);
    ctx.bezierCurveTo(x + r * 0.7, y - r * 1.1, x + r * 1.5, y - r * 0.1, x, y + r * 0.9);
    ctx.closePath();
    ctx.fill();
  }

  function insetsPx(sp, u) {
    var k = state.thick, i = sp.inset;
    return { t: i.t * k * u, l: i.s * k * u, r: i.s * k * u, b: (sp.band ? i.b : i.b * k) * u };
  }

  function computeLayout(maxSide) {
    var sp = currentSpec();
    var a = photo.src ? photo.w / photo.h : 4 / 5;
    var ins = { t: 0, l: 0, r: 0, b: 0 }, W, H, rect, u;
    if (state.ratio === 'fit') {
      var rw, rh;
      if (a >= 1) { rw = 1000; rh = 1000 / a; } else { rh = 1000; rw = 1000 * a; }
      u = Math.min(rw, rh);
      if (sp) ins = insetsPx(sp, u);
      W = rw + ins.l + ins.r; H = rh + ins.t + ins.b;
      rect = { x: ins.l, y: ins.t, w: rw, h: rh };
    } else {
      W = 1000; H = Math.round(1000 / RATIOS[state.ratio]); u = Math.min(W, H);
      if (sp) ins = insetsPx(sp, u);
      rect = { x: ins.l, y: ins.t, w: W - ins.l - ins.r, h: H - ins.t - ins.b };
    }
    return { W: W, H: H, rect: rect, u: u, ins: ins, s: maxSide / Math.max(W, H), spec: sp, R: sp ? sp.radius * u * state.round : 0 };
  }

  function drawBackground(ctx, L) {
    var sp = L.spec, n = sp.bg.length;
    var g = ctx.createLinearGradient(0, 0, L.W, L.H);
    for (var i = 0; i < n; i++) g.addColorStop(n === 1 ? 0 : i / (n - 1), sp.bg[i]);
    ctx.fillStyle = g;
    rr(ctx, 0, 0, L.W, L.H, L.R);
    ctx.fill();
    if (sp.gloss) {
      var m = Math.max(L.W, L.H);
      var sh = ctx.createRadialGradient(L.W * 0.2, L.H * 0.12, 10, L.W * 0.2, L.H * 0.12, m * 0.55);
      sh.addColorStop(0, 'rgba(255,255,255,0.7)');
      sh.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sh;
      rr(ctx, 0, 0, L.W, L.H, L.R);
      ctx.fill();
    }
  }

  function drawPhoto(ctx, L) {
    var r = L.rect, sp = L.spec;
    ctx.save();
    rr(ctx, r.x, r.y, r.w, r.h, sp ? Math.min(L.R * 0.5, r.w / 2) : 0);
    ctx.clip();
    if (photo.src) {
      var sc = Math.max(r.w / photo.w, r.h / photo.h) * state.zoom;
      var dw = photo.w * sc, dh = photo.h * sc;
      var dx = (r.w - dw) / 2 + state.panX * r.w;
      var dy = (r.h - dh) / 2 + state.panY * r.h;
      dx = Math.min(0, Math.max(r.w - dw, dx));
      dy = Math.min(0, Math.max(r.h - dh, dy));
      state.panX = (dx - (r.w - dw) / 2) / r.w;
      state.panY = (dy - (r.h - dh) / 2) / r.h;
      ctx.drawImage(photo.src, r.x + dx, r.y + dy, dw, dh);
    } else {
      var g = ctx.createLinearGradient(r.x, r.y, r.x + r.w, r.y + r.h);
      g.addColorStop(0, '#3A2B57');
      g.addColorStop(0.55, '#7A3A78');
      g.addColorStop(1, '#D6337A');
      ctx.fillStyle = g;
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.direction = 'rtl';
      var big = Math.min(r.w, r.h) * 0.22;
      ctx.font = big + 'px ' + F_EMOJI;
      ctx.fillText('📷', r.x + r.w / 2, r.y + r.h / 2 - big * 0.4);
      ctx.font = '700 ' + Math.min(r.w, r.h) * 0.075 + 'px ' + F_BODY;
      ctx.fillText('ارفع صورتك هنا', r.x + r.w / 2, r.y + r.h / 2 + big * 0.55);
    }
    ctx.restore();
  }

  function fitFont(ctx, text, family, weight, size, maxW, minSize) {
    var s = size;
    while (s > minSize) {
      ctx.font = weight + s + 'px ' + family;
      if (ctx.measureText(text).width <= maxW) break;
      s -= 2;
    }
    ctx.font = weight + s + 'px ' + family;
    return s;
  }

  function ringPoints(L, n, seed) {
    var rnd = rngFrom(seed), pts = [], ins = L.ins, r = L.rect, u = L.u;
    var bt = Math.max(ins.t, u * 0.03), bs = Math.max(ins.l, u * 0.03);
    var yMax = r.y + r.h - u * 0.02;
    for (var i = 0; i < n; i++) {
      var side = rnd(), x, y;
      if (side < 0.42) { x = rnd() * L.W; y = bt * 0.5 + (rnd() - 0.5) * bt * 0.5; }
      else if (side < 0.71) { x = bs * 0.5 + (rnd() - 0.5) * bs * 0.5; y = bt + rnd() * (yMax - bt); }
      else { x = L.W - bs * 0.5 + (rnd() - 0.5) * bs * 0.5; y = bt + rnd() * (yMax - bt); }
      var m = u * 0.035;
      x = Math.min(L.W - m, Math.max(m, x));
      y = Math.min(L.H - m, Math.max(m, y));
      pts.push({ x: x, y: y, r: rnd(), k: rnd() });
    }
    return pts;
  }

  function drawDecor(ctx, L, acc, textCol) {
    var sp = L.spec, u = L.u;
    var list = state.decor ? sp.decor.filter(function (d) { return d !== 'confetti'; }) : [];
    if (state.confetti) list = list.concat(['confetti']);
    var palette = [acc, '#F2C14E', '#FFFFFF', '#7DD3FC'];
    for (var i = 0; i < list.length; i++) {
      var pts = ringPoints(L, list[i] === 'confetti' ? 22 : 12, 11 + i * 7);
      for (var j = 0; j < pts.length; j++) {
        var p = pts[j], size = u * (0.016 + 0.026 * p.r);
        var col = p.k < 0.5 ? acc : textCol;
        ctx.fillStyle = col;
        if (list[i] === 'sparkles') sparkle(ctx, p.x, p.y, size * 1.4);
        else if (list[i] === 'stars') star5(ctx, p.x, p.y, size);
        else if (list[i] === 'hearts') heart(ctx, p.x, p.y, size);
        else if (list[i] === 'confetti') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.k * 6.28);
          ctx.fillStyle = palette[Math.floor(p.r * 3.99)];
          ctx.fillRect(-size * 0.5, -size * 0.2, size, size * 0.4);
          ctx.restore();
        }
      }
    }
  }

  function drawRibbon(ctx, L, sp, acc) {
    var u = L.u, r = L.rect;
    var rh = u * 0.17, rw = r.w * 0.84, cx = r.x + r.w / 2;
    var y0 = r.y + r.h - rh * 1.4, x0 = cx - rw / 2, tail = rh * 0.55;
    ctx.fillStyle = '#A87A1E';
    [-1, 1].forEach(function (sg) {
      var bx = sg < 0 ? x0 : x0 + rw, ox = bx + sg * tail;
      ctx.beginPath();
      ctx.moveTo(bx, y0 + rh * 0.15);
      ctx.lineTo(ox, y0 + rh * 0.15);
      ctx.lineTo(ox - sg * tail * 0.35, y0 + rh * 0.6);
      ctx.lineTo(ox, y0 + rh * 1.05);
      ctx.lineTo(bx, y0 + rh * 1.05);
      ctx.closePath();
      ctx.fill();
    });
    var g = ctx.createLinearGradient(0, y0, 0, y0 + rh);
    g.addColorStop(0, '#F6E19B'); g.addColorStop(0.5, '#D9B44A'); g.addColorStop(1, '#B8892B');
    ctx.fillStyle = g;
    ctx.fillRect(x0, y0, rw, rh);
    ctx.fillStyle = 'rgba(90,71,32,0.55)';
    ctx.fillRect(x0, y0, rw, u * 0.004);
    ctx.fillRect(x0, y0 + rh - u * 0.004, rw, u * 0.004);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    var ink = '#1B1420';
    ctx.fillStyle = ink;
    ctx.direction = hasArabic(state.main) ? 'rtl' : 'ltr';
    setSpacing(ctx, state.main, u * 0.004);
    fitFont(ctx, state.main, F_DISPLAY, '', rh * 0.52, rw * 0.9, 12);
    ctx.fillText(state.main, cx, y0 + rh * 0.4);
    ctx.direction = hasArabic(state.sub) ? 'rtl' : 'ltr';
    setSpacing(ctx, state.sub, u * 0.005);
    fitFont(ctx, state.sub, F_BODY, '700 ', rh * 0.2, rw * 0.9, 10);
    ctx.fillText(state.sub, cx, y0 + rh * 0.79);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    if (sp.cap) {
      ctx.font = u * 0.13 + 'px ' + F_EMOJI;
      ctx.direction = 'ltr';
      ctx.fillText('🎓', cx, y0 - u * 0.045);
    }
  }

  function drawFrame(ctx, L) {
    var sp = L.spec, u = L.u, r = L.rect, ins = L.ins, W = L.W, H = L.H;
    var acc = state.accent || sp.accent;
    function col(c) { return c === 'accent' ? acc : c; }
    var minIns = Math.min(ins.l, ins.t);
    var e = minIns * 0.35;
    ctx.lineJoin = 'round';
    // outer line
    ctx.lineWidth = Math.max(2, u * 0.01);
    ctx.strokeStyle = col(sp.line1);
    rr(ctx, e, e, W - 2 * e, H - 2 * e, L.R * 0.9);
    ctx.stroke();
    // double: extra inner line
    if (sp.borderStyle === 'double') {
      var e2 = minIns * 0.62;
      ctx.lineWidth = Math.max(1.5, u * 0.004);
      ctx.strokeStyle = col(sp.line2);
      rr(ctx, e2, e2, W - 2 * e2, H - 2 * e2, L.R * 0.6);
      ctx.stroke();
    }
    // line hugging the photo
    var pad = u * 0.006;
    ctx.lineWidth = Math.max(1.5, u * 0.005);
    ctx.strokeStyle = col(sp.line2);
    rr(ctx, r.x - pad, r.y - pad, r.w + 2 * pad, r.h + 2 * pad, Math.min(L.R * 0.5, r.w / 2) + pad);
    ctx.stroke();

    if (sp.borderStyle === 'dots') {
      ctx.fillStyle = acc;
      var dd = minIns * 0.62, dr = u * 0.0075, step = u * 0.05, k;
      for (k = dd + step; k < W - dd - step * 0.5; k += step) { ctx.beginPath(); ctx.arc(k, dd, dr, 0, 6.2832); ctx.fill(); }
      for (k = dd + step; k < r.y + r.h; k += step) {
        ctx.beginPath(); ctx.arc(dd, k, dr, 0, 6.2832); ctx.fill();
        ctx.beginPath(); ctx.arc(W - dd, k, dr, 0, 6.2832); ctx.fill();
      }
    }
    var textTopPad = 0;
    if (sp.borderStyle === 'film') {
      var hh = ins.t * 0.42, hw = hh * 0.72, gap = hh * 1.0, edge = u * 0.03;
      var n = Math.floor((W - 2 * edge + gap) / (hw + gap));
      var startX = (W - (n * hw + (n - 1) * gap)) / 2;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      for (var q = 0; q < n; q++) {
        var hx = startX + q * (hw + gap);
        rr(ctx, hx, (ins.t - hh) / 2, hw, hh, hh * 0.2); ctx.fill();
        rr(ctx, hx, H - ins.t * 0.5 - hh / 2, hw, hh, hh * 0.2); ctx.fill();
      }
      textTopPad = ins.t * 0.9;
    }

    if (sp.band && ins.b > 0) {
      var avail = ins.b - textTopPad, y0 = r.y + r.h;
      var mainY = y0 + avail * 0.42, subY = y0 + avail * 0.8;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.direction = hasArabic(state.main) ? 'rtl' : 'ltr';
      setSpacing(ctx, state.main, u * 0.004);
      var ms = fitFont(ctx, state.main, F_DISPLAY, '', avail * 0.58, W * 0.84, 14);
      if (sp.shadow) { ctx.fillStyle = acc; ctx.fillText(state.main, W / 2 + ms * 0.04, mainY + ms * 0.04); }
      ctx.fillStyle = col(sp.text);
      ctx.fillText(state.main, W / 2, mainY);
      ctx.fillStyle = col(sp.sub);
      ctx.direction = hasArabic(state.sub) ? 'rtl' : 'ltr';
      setSpacing(ctx, state.sub, u * 0.007);
      fitFont(ctx, state.sub, F_BODY, '700 ', avail * 0.15, W * 0.8, 10);
      ctx.fillText(state.sub, W / 2, subY);
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    }
    if (sp.ribbon) drawRibbon(ctx, L, sp, acc);
    drawDecor(ctx, L, acc, col(sp.text));
  }

  function drawCustomFrame(ctx, L) {
    if (!frameImg.src) return;
    var fw = frameImg.w, fh = frameImg.h, W = L.W, H = L.H;
    if (state.slice === 'stretch') { ctx.drawImage(frameImg.src, 0, 0, W, H); return; }
    var c = Math.min(state.corner * Math.min(fw, fh), Math.min(fw, fh) / 2 - 1);
    var d = c * (Math.min(W, H) / Math.min(fw, fh));
    d = Math.min(d, Math.min(W, H) / 2 - 1);
    var sx = [0, c, fw - c, fw], dxs = [0, d, W - d, W], sy = [0, c, fh - c, fh], dys = [0, d, H - d, H];
    for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) {
      var sw = sx[i + 1] - sx[i], sh = sy[j + 1] - sy[j], dw = dxs[i + 1] - dxs[i], dh = dys[j + 1] - dys[j];
      if (sw > 0 && sh > 0 && dw > 0 && dh > 0) ctx.drawImage(frameImg.src, sx[i], sy[j], sw, sh, dxs[i], dys[j], dw, dh);
    }
  }

  function drawStickers(ctx, L, preview) {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'ltr';
    for (var i = 0; i < state.stickers.length; i++) {
      var st = state.stickers[i], px = st.size * L.u;
      ctx.font = px + 'px ' + F_EMOJI;
      ctx.fillStyle = '#000';
      ctx.fillText(st.ch, st.x * L.W, st.y * L.H);
      if (preview && i === state.sel) {
        ctx.save();
        ctx.setLineDash([px * 0.08, px * 0.08]);
        ctx.lineWidth = Math.max(2, px * 0.03);
        ctx.strokeStyle = '#D6337A';
        rr(ctx, st.x * L.W - px * 0.62, st.y * L.H - px * 0.62, px * 1.24, px * 1.24, px * 0.2);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  function render(cv, maxSide, preview) {
    var L = computeLayout(maxSide);
    cv.width = Math.max(1, Math.round(L.W * L.s));
    cv.height = Math.max(1, Math.round(L.H * L.s));
    var ctx = cv.getContext('2d');
    ctx.setTransform(L.s, 0, 0, L.s, 0, 0);
    ctx.clearRect(0, 0, L.W, L.H);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (L.spec) drawBackground(ctx, L);
    drawPhoto(ctx, L);
    if (L.spec) drawFrame(ctx, L); else drawCustomFrame(ctx, L);
    drawStickers(ctx, L, preview);
    return L;
  }
  
  // ==RENDERER-END==

  // ---------- UI ----------
  S.views.frames = {
    mount: function (root) {
      function $(id) { return root.querySelector('#' + id); }
      var cv = $('cv'), statusEl = $('status');
      var lastL = null, raf = 0, drag = null, keyTimer = null;

      function redraw() {
        if (raf) return;
        raf = requestAnimationFrame(function () { raf = 0; lastL = render(cv, 860, true); });
      }
      function redrawNow() { lastL = render(cv, 860, true); }
      this._redraw = redrawNow;

      function readImage(file, maxDim) {
        return new Promise(function (res, rej) {
          var fr = new FileReader();
          fr.onload = function () {
            var im = new Image();
            im.onload = function () {
              var w = im.naturalWidth, h = im.naturalHeight, sc = Math.min(1, maxDim / Math.max(w, h));
              var c = document.createElement('canvas');
              c.width = Math.max(1, Math.round(w * sc)); c.height = Math.max(1, Math.round(h * sc));
              c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
              res(c);
            };
            im.onerror = rej;
            im.src = fr.result;
          };
          fr.onerror = rej;
          fr.readAsDataURL(file);
        });
      }

      function keyOut(canvas, tol) {
        var w = canvas.width, h = canvas.height;
        var c = document.createElement('canvas'); c.width = w; c.height = h;
        var x = c.getContext('2d'); x.drawImage(canvas, 0, 0);
        var id = x.getImageData(0, 0, w, h), d = id.data;
        var start = (h >> 1) * w + (w >> 1), p = start * 4;
        if (d[p + 3] < 10) return canvas;
        var r0 = d[p], g0 = d[p + 1], b0 = d[p + 2], t2 = tol * tol;
        var vis = new Uint8Array(w * h), stack = [start];
        vis[start] = 1;
        while (stack.length) {
          var i = stack.pop(); d[i * 4 + 3] = 0;
          var xx = i % w, yy = (i / w) | 0, nb = [];
          if (xx > 0) nb.push(i - 1);
          if (xx < w - 1) nb.push(i + 1);
          if (yy > 0) nb.push(i - w);
          if (yy < h - 1) nb.push(i + w);
          for (var k = 0; k < nb.length; k++) {
            var n = nb[k];
            if (vis[n]) continue;
            vis[n] = 1;
            var q = n * 4, dr = d[q] - r0, dg = d[q + 1] - g0, db = d[q + 2] - b0;
            if (d[q + 3] > 0 && dr * dr + dg * dg + db * db <= t2) stack.push(n);
          }
        }
        x.putImageData(id, 0, 0);
        return c;
      }
      function applyKey() {
        if (!frameImg.orig) return;
        var c = state.key ? keyOut(frameImg.orig, state.tol) : frameImg.orig;
        frameImg.src = c; frameImg.w = c.width; frameImg.h = c.height;
        redraw();
      }

      $('photoIn').addEventListener('change', function (e) {
        var f = e.target.files && e.target.files[0];
        if (!f) return;
        statusEl.textContent = 'بحمّل الصورة...';
        readImage(f, 2400).then(function (c) {
          photo.src = c; photo.w = c.width; photo.h = c.height;
          state.panX = 0; state.panY = 0; state.zoom = 1; $('zoom').value = 1;
          $('photoName').textContent = 'اتضافت الصورة.';
          statusEl.textContent = '';
          redraw();
        }, function () { statusEl.textContent = 'مقدرتش أفتح الصورة دي. جرّب صورة تانية.'; });
      });
      $('frameIn').addEventListener('change', function (e) {
        var f = e.target.files && e.target.files[0];
        if (!f) return;
        readImage(f, 1400).then(function (c) {
          frameImg.orig = c;
          $('frameName').textContent = 'اتضاف الفريم.';
          setStyle('custom');
          applyKey();
        }, function () { $('frameName').textContent = 'الملف ده مش صورة صالحة.'; });
      });

      function pressGroup(container, attr, value) {
        var bs = container.querySelectorAll('button');
        for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', bs[i].getAttribute(attr) === value ? 'true' : 'false');
      }
      function syncAccentInput() {
        var sp = currentSpec();
        $('accent').value = (state.accent || (sp ? sp.accent : '#D6337A')).toLowerCase();
      }
      function setStyle(s) {
        state.style = s;
        state.accent = null;
        var sp = currentSpec();
        if (sp) {
          state.confetti = sp.decor.indexOf('confetti') >= 0;
          $('confettiOn').checked = state.confetti;
        }
        syncAccentInput();
        pressGroup($('styleChips'), 'data-style', s);
        redraw();
      }
      $('styleChips').addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (b) setStyle(b.getAttribute('data-style'));
      });
      $('ratioChips').addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        state.ratio = b.getAttribute('data-ratio');
        state.panX = 0; state.panY = 0;
        pressGroup($('ratioChips'), 'data-ratio', state.ratio);
        redraw();
      });
      $('sliceChips').addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        state.slice = b.getAttribute('data-slice');
        pressGroup($('sliceChips'), 'data-slice', state.slice);
        redraw();
      });

      function bindRange(id, key) {
        $(id).addEventListener('input', function (e) { state[key] = parseFloat(e.target.value); redraw(); });
      }
      bindRange('thick', 'thick'); bindRange('round', 'round'); bindRange('zoom', 'zoom'); bindRange('corner', 'corner');
      $('tol').addEventListener('input', function (e) {
        state.tol = parseFloat(e.target.value);
        clearTimeout(keyTimer);
        keyTimer = setTimeout(applyKey, 150);
      });
      $('keyOn').addEventListener('change', function (e) { state.key = e.target.checked; applyKey(); });
      $('accent').addEventListener('input', function (e) { state.accent = e.target.value; redraw(); });
      $('decorOn').addEventListener('change', function (e) { state.decor = e.target.checked; redraw(); });
      $('confettiOn').addEventListener('change', function (e) { state.confetti = e.target.checked; redraw(); });
      $('mainText').addEventListener('input', function (e) { state.main = e.target.value; redraw(); });
      $('subText').addEventListener('input', function (e) { state.sub = e.target.value; redraw(); });

      var TABS = ['frame', 'text', 'stickers', 'custom'];
      function showTab(name) {
        TABS.forEach(function (t) {
          var on = t === name;
          $('tab-' + t).setAttribute('aria-selected', on ? 'true' : 'false');
          $('p-' + t).hidden = !on;
        });
      }
      TABS.forEach(function (t) { $('tab-' + t).addEventListener('click', function () { showTab(t); }); });

      var grid = $('emojiGrid');
      EMOJIS.forEach(function (ch) {
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = ch; b.setAttribute('aria-label', 'أضف استيكر ' + ch);
        b.addEventListener('click', function () {
          var n = state.stickers.length;
          state.stickers.push({ ch: ch, x: 0.3 + ((n * 0.17) % 0.45), y: 0.3 + ((n * 0.13) % 0.3), size: 0.16 });
          state.sel = state.stickers.length - 1;
          syncStickerUI(); redraw();
        });
        grid.appendChild(b);
      });
      function syncStickerUI() {
        var has = state.sel >= 0 && state.stickers[state.sel];
        $('stSize').disabled = !has; $('stDel').disabled = !has; $('stClear').disabled = state.stickers.length === 0;
        if (has) $('stSize').value = state.stickers[state.sel].size;
      }
      $('stSize').addEventListener('input', function (e) {
        if (state.sel >= 0 && state.stickers[state.sel]) { state.stickers[state.sel].size = parseFloat(e.target.value); redraw(); }
      });
      $('stDel').addEventListener('click', function () {
        if (state.sel >= 0) { state.stickers.splice(state.sel, 1); state.sel = -1; syncStickerUI(); redraw(); }
      });
      $('stClear').addEventListener('click', function () { state.stickers = []; state.sel = -1; syncStickerUI(); redraw(); });

      function toCanvas(e) {
        var b = cv.getBoundingClientRect();
        return { x: (e.clientX - b.left) * (cv.width / b.width), y: (e.clientY - b.top) * (cv.height / b.height) };
      }
      cv.addEventListener('pointerdown', function (e) {
        if (!lastL) return;
        var p = toCanvas(e), hit = -1;
        for (var i = state.stickers.length - 1; i >= 0; i--) {
          var st = state.stickers[i];
          var cx = st.x * lastL.W * lastL.s, cy = st.y * lastL.H * lastL.s, rad = st.size * lastL.u * lastL.s * 0.62;
          if (Math.hypot(p.x - cx, p.y - cy) <= rad) { hit = i; break; }
        }
        state.sel = hit;
        syncStickerUI();
        drag = { kind: hit >= 0 ? 'sticker' : 'photo', x: e.clientX, y: e.clientY };
        try { cv.setPointerCapture(e.pointerId); } catch (err) {}
        redraw();
      });
      cv.addEventListener('pointermove', function (e) {
        if (!drag || !lastL) return;
        var b = cv.getBoundingClientRect(), k = cv.width / b.width;
        var dx = (e.clientX - drag.x) * k, dy = (e.clientY - drag.y) * k;
        drag.x = e.clientX; drag.y = e.clientY;
        if (drag.kind === 'sticker' && state.sel >= 0) {
          var st = state.stickers[state.sel];
          st.x = Math.min(1, Math.max(0, st.x + dx / (lastL.W * lastL.s)));
          st.y = Math.min(1, Math.max(0, st.y + dy / (lastL.H * lastL.s)));
        } else {
          state.panX += dx / (lastL.rect.w * lastL.s);
          state.panY += dy / (lastL.rect.h * lastL.s);
        }
        redraw();
      });
      function endDrag() { drag = null; }
      cv.addEventListener('pointerup', endDrag);
      cv.addEventListener('pointercancel', endDrag);

      function exportBlob() {
        var off = document.createElement('canvas');
        var prev = state.sel; state.sel = -1;
        render(off, 2000, false);
        state.sel = prev;
        return new Promise(function (res) { off.toBlob(res, 'image/png'); });
      }
      $('save').addEventListener('click', function () {
        var btn = $('save');
        btn.disabled = true; statusEl.textContent = 'بجهز الصورة...';
        exportBlob().then(function (blob) {
          if (!blob) { statusEl.textContent = 'مقدرتش أجهز الصورة. جرّب تاني.'; return; }
          S.download(blob, 'senior-2027-frame.png');
          S.showFinal($('finalWrap'), $('finalImg'), blob);
          statusEl.textContent = 'لو مانزلتش، اضغط مطولًا على الصورة اللي تحت واحفظها.';
        }).then(function () { btn.disabled = false; redraw(); }, function () { btn.disabled = false; statusEl.textContent = 'حصلت مشكلة. جرّب تاني.'; });
      });
      if (S.canShareFiles()) {
        $('share').hidden = false;
        $('share').addEventListener('click', function () {
          exportBlob().then(function (blob) {
            if (blob) return S.shareFile(blob, 'senior-2027-frame.png');
          }).catch(function () {});
        });
      }

      $('copyGen').addEventListener('click', function () {
        var ta = $('genPrompt'), msg = $('copyMsg');
        ta.focus(); ta.select();
        var ok = false;
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(ta.value).then(function () { msg.textContent = 'اتنسخ.'; }, function () { msg.textContent = 'النص متحدد. اضغط نسخ من الكيبورد.'; });
            return;
          }
          ok = document.execCommand('copy');
        } catch (err) {}
        msg.textContent = ok ? 'اتنسخ.' : 'النص متحدد. اضغط نسخ من الكيبورد.';
      });

      this._api = {
        setPhoto: function (c) {
          photo.src = c; photo.w = c.width; photo.h = c.height;
          state.panX = 0; state.panY = 0; state.zoom = 1; $('zoom').value = 1;
          $('photoName').textContent = 'اتضافت الصورة من استوديو AI.';
          redraw();
        },
        setFrame: function (c) {
          frameImg.orig = c;
          $('frameName').textContent = 'اتضاف الفريم من استوديو AI.';
          state.key = true; $('keyOn').checked = true;
          setStyle('custom');
          applyKey();
        }
      };

      syncStickerUI();
      redrawNow();
      try {
        Promise.race([
          Promise.all([
            document.fonts.load('120px Lalezar', 'مرحبا SENIOR 2027'),
            document.fonts.load('700 30px Cairo', 'مرحبا CLASS')
          ]),
          new Promise(function (r) { setTimeout(r, 3000); })
        ]).then(redrawNow, redrawNow);
      } catch (e) {}
    },
    importImage: function (kind, canvas) { this._pending = { kind: kind, canvas: canvas }; },
    show: function () {
      if (this._redraw) this._redraw();
      if (this._pending && this._api) {
        var p = this._pending; this._pending = null;
        if (p.kind === 'frame') this._api.setFrame(p.canvas); else this._api.setPhoto(p.canvas);
      }
    }
  };
})();
