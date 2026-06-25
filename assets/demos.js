/* ============================================================
   demos.js — interactive canvas / DOM demos for CV study site.
   Usage: <div data-demo="convolution" data-preset="prewittx"></div>
   window.CVDemos.initAll() scans and builds each demo.
   ============================================================ */
(function () {
  "use strict";

  // ---------- helpers ----------
  function cv(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#888"; }
  function make(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function round(v, d) { var f = Math.pow(10, d || 0); return Math.round(v * f) / f; }
  var themeCBs = [];
  window.addEventListener("cv-theme-change", function () { themeCBs.forEach(function (f) { try { f(); } catch (e) {} }); });
  function onTheme(f) { themeCBs.push(f); }

  function head(title, desc, tag) {
    var h = make("div");
    h.appendChild(make("div", "demo-head",
      '<span class="tag">' + (tag || "Live Demo") + '</span><span class="demo-title">' + title + "</span>"));
    if (desc) h.appendChild(make("div", "demo-desc", desc));
    return h;
  }

  // build an interactive / static numeric grid of divs
  function gridEl(mat, opt) {
    opt = opt || {};
    var g = make("div", "matrix");
    g.style.gridTemplateColumns = "repeat(" + mat[0].length + ", " + (opt.cell || 38) + "px)";
    for (var i = 0; i < mat.length; i++) {
      for (var j = 0; j < mat[i].length; j++) {
        var c = make("div", "cell", opt.fmt ? opt.fmt(mat[i][j]) : mat[i][j]);
        if (opt.cell) { c.style.width = opt.cell + "px"; c.style.height = (opt.cell - 4) + "px"; c.style.fontSize = (opt.fs || 13) + "px"; }
        c.dataset.r = i; c.dataset.c = j;
        g.appendChild(c);
      }
    }
    return g;
  }

  var DEMOS = {};

  /* ============================================================
     1) CONVOLUTION / KERNEL PLAYGROUND
     ============================================================ */
  var CONV_IMAGES = {
    vedge:  [[20,20,200,200,200],[20,20,200,200,200],[20,20,200,200,200],[20,20,200,200,200],[20,20,200,200,200]],
    hedge:  [[20,20,20,20,20],[20,20,20,20,20],[200,200,200,200,200],[200,200,200,200,200],[200,200,200,200,200]],
    corner: [[200,200,200,20,20],[200,200,200,20,20],[200,200,200,20,20],[20,20,20,20,20],[20,20,20,20,20]],
    ramp:   [[10,60,110,160,210],[10,60,110,160,210],[10,60,110,160,210],[10,60,110,160,210],[10,60,110,160,210]],
    flat:   [[120,120,120,120,120],[120,120,120,120,120],[120,120,120,120,120],[120,120,120,120,120],[120,120,120,120,120]],
    spot:   [[10,10,10,10,10],[10,200,200,200,10],[10,200,255,200,10],[10,200,200,200,10],[10,10,10,10,10]],
    examq3p:[[12,15,18],[15,10,15],[18,15,12]]
  };
  var CONV_KERNELS = {
    prewittx: { m: [[-1,0,1],[-1,0,1],[-1,0,1]], label: "Prewitt X (∂/∂x)" },
    prewitty: { m: [[-1,-1,-1],[0,0,0],[1,1,1]], label: "Prewitt Y (∂/∂y)" },
    sobelx:   { m: [[-1,0,1],[-2,0,2],[-1,0,1]], label: "Sobel X" },
    sobely:   { m: [[-1,-2,-1],[0,0,0],[1,2,1]], label: "Sobel Y" },
    lap4:     { m: [[0,1,0],[1,-4,1],[0,1,0]], label: "Laplacian (4-neighbour)" },
    lap8:     { m: [[1,1,1],[1,-8,1],[1,1,1]], label: "Laplacian (8-neighbour)" },
    box:      { m: [[1,1,1],[1,1,1],[1,1,1]], label: "Box / Average (×1/9)", scale: 1/9 },
    sharpen:  { m: [[0,-1,0],[-1,5,-1],[0,-1,0]], label: "Sharpen" }
  };

  DEMOS.convolution = function (el, o) {
    var imgKey = o.image || "vedge";
    var img = (CONV_IMAGES[imgKey] || CONV_IMAGES.vedge).map(function (r) { return r.slice(); });
    var kKey = o.preset || "prewittx";
    var kernel = CONV_KERNELS[kKey].m.map(function (r) { return r.slice(); });
    var scale = CONV_KERNELS[kKey].scale || 1;
    var flip = false; // correlation by default
    var H = img.length, W = img[0].length;
    var cr = 1, cc = 1; // window center (output coords range 1..H-2)
    var out = [];

    el.appendChild(head("Convolution / Filter Playground",
      "Slide the 3×3 window over the image. Watch the multiply-and-add at the current pixel. Switch kernels to see what each filter responds to.",
      "Interactive"));

    // controls
    var ctrls = make("div");
    var imgSel = make("select");
    [["vedge","Vertical edge"],["hedge","Horizontal edge"],["corner","Corner"],["ramp","Ramp / gradient"],["spot","Bright spot"],["flat","Flat"],["examq3p","Exam Q3 patch"]]
      .forEach(function (p) { var op = make("option", null, p[1]); op.value = p[0]; if (p[0] === imgKey) op.selected = true; imgSel.appendChild(op); });
    var kSel = make("select");
    Object.keys(CONV_KERNELS).forEach(function (k) { var op = make("option", null, CONV_KERNELS[k].label); op.value = k; if (k === kKey) op.selected = true; kSel.appendChild(op); });
    var modeBtn = make("button", "btn", "Mode: Correlation");
    ctrls.appendChild(rowwrap("Image", imgSel));
    ctrls.appendChild(rowwrap("Kernel", kSel));
    var btns = make("div", "btn-row");
    var prev = make("button", "btn", "◀ Prev"); var next = make("button", "btn", "Next ▶");
    var auto = make("button", "btn primary", "▶ Run all");
    btns.appendChild(prev); btns.appendChild(next); btns.appendChild(auto); btns.appendChild(modeBtn);
    ctrls.appendChild(btns);
    el.appendChild(ctrls);

    function rowwrap(lab, node) { var d = make("div", "ctrl"); d.appendChild(make("label", null, lab)); d.appendChild(node); return d; }

    var stage = make("div", "demo-flex");
    var imgBox = make("div"); var kBox = make("div"); var outBox = make("div");
    imgBox.appendChild(make("div", "mlabel", "Image  ·  highlighted = current window"));
    kBox.appendChild(make("div", "mlabel", "Kernel  ·  editable"));
    outBox.appendChild(make("div", "mlabel", "Output (valid region)"));
    var imgGridHost = make("div"); var kGridHost = make("div"); var outGridHost = make("div");
    imgBox.appendChild(imgGridHost); kBox.appendChild(kGridHost); outBox.appendChild(outGridHost);
    stage.appendChild(imgBox); stage.appendChild(kBox); stage.appendChild(outBox);
    el.appendChild(stage);
    var readout = make("div", "readout"); el.appendChild(readout);

    function computeAt(r, c) {
      var s = 0, terms = [];
      for (var u = -1; u <= 1; u++) for (var v = -1; v <= 1; v++) {
        var ku = flip ? -u : u, kv = flip ? -v : v;
        var k = kernel[ku + 1][kv + 1];
        var p = img[r + u][c + v];
        s += k * p;
        terms.push((k < 0 ? "(" + k + ")" : k) + "·" + p);
      }
      return { sum: s * scale, terms: terms };
    }
    function computeAll() {
      out = [];
      for (var r = 1; r < H - 1; r++) { var row = []; for (var c = 1; c < W - 1; c++) row.push(round(computeAt(r, c).sum, 1)); out.push(row); }
    }

    function render() {
      computeAll();
      // image grid
      imgGridHost.innerHTML = "";
      var ig = gridEl(img, { cell: 40, fmt: function (x) { return x; } });
      // shade by intensity
      Array.prototype.forEach.call(ig.children, function (cell) {
        var r = +cell.dataset.r, c = +cell.dataset.c;
        var val = img[r][c]; var g = Math.round(val);
        cell.style.background = "rgb(" + g + "," + g + "," + g + ")";
        cell.style.color = val > 130 ? "#111" : "#eee";
        cell.style.borderColor = "var(--border)";
        if (r >= cr - 1 && r <= cr + 1 && c >= cc - 1 && c <= cc + 1) {
          cell.style.outline = "2px solid var(--accent)"; cell.style.outlineOffset = "-2px";
          if (r === cr && c === cc) cell.style.outline = "3px solid var(--pink)";
        }
      });
      imgGridHost.appendChild(ig);

      // kernel grid (editable)
      kGridHost.innerHTML = "";
      var kg = make("div", "matrix"); kg.style.gridTemplateColumns = "repeat(3, 46px)";
      for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) {
        (function (i, j) {
          var inp = make("input"); inp.type = "number"; inp.value = kernel[i][j];
          inp.style.width = "44px"; inp.style.textAlign = "center"; inp.style.padding = "6px 2px";
          inp.addEventListener("change", function () { kernel[i][j] = parseFloat(inp.value) || 0; scale = 1; render(); });
          kg.appendChild(inp);
        })(i, j);
      }
      kGridHost.appendChild(kg);
      if (scale !== 1) kGridHost.appendChild(make("div", "mlabel", "× " + round(scale,3) + " (normalised)"));

      // output grid
      outGridHost.innerHTML = "";
      var og = gridEl(out, { cell: 46, fmt: function (x) { return x; } });
      Array.prototype.forEach.call(og.children, function (cell) {
        var r = +cell.dataset.r, c = +cell.dataset.c;
        if (r === cr - 1 && c === cc - 1) cell.classList.add("center");
      });
      outGridHost.appendChild(og);

      var res = computeAt(cr, cc);
      readout.textContent =
        "Current output pixel (row " + cr + ", col " + cc + "):\n" +
        res.terms.slice(0,3).join("  +  ") + "\n+ " + res.terms.slice(3,6).join("  +  ") + "\n+ " + res.terms.slice(6,9).join("  +  ") +
        (scale !== 1 ? "\n  all × " + round(scale,3) : "") +
        "\n=  " + round(res.sum, 2);
    }

    function step(d) {
      var idx = (cr - 1) * (W - 2) + (cc - 1) + d;
      idx = clamp(idx, 0, (H - 2) * (W - 2) - 1);
      cr = 1 + Math.floor(idx / (W - 2)); cc = 1 + (idx % (W - 2)); render();
    }
    prev.onclick = function () { step(-1); };
    next.onclick = function () { step(1); };
    auto.onclick = function () {
      var i = 0, total = (H - 2) * (W - 2); cr = 1; cc = 1; render();
      var t = setInterval(function () { i++; if (i >= total) { clearInterval(t); return; } step(1); }, 320);
    };
    modeBtn.onclick = function () { flip = !flip; modeBtn.textContent = "Mode: " + (flip ? "Convolution" : "Correlation"); render(); };
    imgSel.onchange = function () { img = CONV_IMAGES[imgSel.value].map(function (r) { return r.slice(); }); H = img.length; W = img[0].length; cr = 1; cc = 1; render(); };
    kSel.onchange = function () { var K = CONV_KERNELS[kSel.value]; kernel = K.m.map(function (r) { return r.slice(); }); scale = K.scale || 1; render(); };
    render();
  };

  /* ============================================================
     2) SAMPLING & QUANTIZATION
     ============================================================ */
  DEMOS.sampling = function (el, o) {
    el.appendChild(head("Sampling & Quantization",
      "Sampling sets how many pixels (spatial resolution); quantization sets how many intensity levels (bit depth). Drag both down to see the image fall apart.",
      "Interactive"));
    var size = 256;
    var cvs = document.createElement("canvas"); cvs.width = size; cvs.height = size;
    cvs.style.width = "min(100%, 360px)";
    var ctx = cvs.getContext("2d");

    // base "continuous" synthetic scene
    function base(x, y) {
      var cx = x - 0.5, cy = y - 0.5;
      var r = Math.sqrt(cx * cx + cy * cy);
      var v = 0.5 + 0.5 * Math.sin(34 * r) * Math.exp(-r * 1.4); // ripples
      v *= 0.7 + 0.3 * Math.sin(x * 9.0);                        // vertical bands
      v = clamp(v + 0.18 * (1 - y), 0, 1);                       // gradient
      return v;
    }
    var ctrls = make("div");
    var sRange = make("input"); sRange.type = "range"; sRange.min = 3; sRange.max = 8; sRange.value = 8; // log2 of N
    var sVal = make("span", "val");
    var qRange = make("input"); qRange.type = "range"; qRange.min = 1; qRange.max = 8; qRange.value = 8; // bits
    var qVal = make("span", "val");
    ctrls.appendChild(ctrlRow("Sampling (N×N)", sRange, sVal));
    ctrls.appendChild(ctrlRow("Quantization", qRange, qVal));
    function ctrlRow(lab, rng, val) { var d = make("div", "ctrl"); d.appendChild(make("label", null, lab)); d.appendChild(rng); d.appendChild(val); return d; }

    var wrap = make("div", "demo-flex");
    var left = make("div"); left.appendChild(cvs); wrap.appendChild(left);
    var info = make("div", "readout"); info.style.flex = "1"; info.style.minWidth = "200px"; wrap.appendChild(info);
    el.appendChild(ctrls); el.appendChild(wrap);

    function draw() {
      var N = Math.pow(2, +sRange.value);
      var bits = +qRange.value, L = Math.pow(2, bits);
      sVal.textContent = N + "×" + N;
      qVal.textContent = bits + " bit (" + L + ")";
      var id = ctx.createImageData(size, size);
      var block = size / N;
      for (var py = 0; py < size; py++) for (var px = 0; px < size; px++) {
        var sx = (Math.floor(px / block) + 0.5) / N;
        var sy = (Math.floor(py / block) + 0.5) / N;
        var v = base(sx, sy);
        var q = Math.round(v * (L - 1)) / (L - 1);  // quantize
        var g = Math.round(q * 255);
        var i = (py * size + px) * 4;
        id.data[i] = id.data[i + 1] = id.data[i + 2] = g; id.data[i + 3] = 255;
      }
      ctx.putImageData(id, 0, 0);
      info.textContent =
        "Spatial resolution : " + N + " × " + N + " = " + (N * N).toLocaleString() + " pixels\n" +
        "Intensity levels   : 2^" + bits + " = " + L + " grey levels\n" +
        "Storage (uncompressed):\n   " + N + "×" + N + "×" + bits + " bits = " +
        Math.round(N * N * bits / 8).toLocaleString() + " bytes\n\n" +
        (N <= 16 ? "→ Too few samples: blocky 'checkerboard' / pixelation.\n" : "") +
        (L <= 8 ? "→ Too few levels: false contours (banding) in smooth areas." : "");
    }
    sRange.oninput = draw; qRange.oninput = draw;
    draw();
  };

  /* ============================================================
     3) INTENSITY TRANSFORMATIONS
     ============================================================ */
  DEMOS.intensity = function (el, o) {
    el.appendChild(head("Intensity Transformation Explorer",
      "Every output pixel s depends only on its input r through s = T(r). The curve IS the operation — see how each transform reshapes a ramp and where a sample pixel lands.",
      "Interactive"));
    var mode = "gamma";
    var gamma = 0.4, logc = 1, r1 = 70, r2 = 180, T = 128, r0 = 100;

    var ctrls = make("div");
    var modeSel = make("select");
    [["negative","Negative  s = 255 − r"],["log","Log  s = c·log(1+r)"],["gamma","Power-law (gamma)  s = 255·(r/255)^γ"],["stretch","Contrast stretch (piecewise)"],["threshold","Threshold / binarize"]]
      .forEach(function (m) { var op = make("option", null, m[1]); op.value = m[0]; if (m[0] === mode) op.selected = true; modeSel.appendChild(op); });
    ctrls.appendChild(crow("Transform", modeSel));
    var gWrap = crow("γ (gamma)", null), gR = make("input"), gV = make("span", "val");
    gR.type = "range"; gR.min = 0.04; gR.max = 4; gR.step = 0.02; gR.value = gamma; gWrap.appendChild(gR); gWrap.appendChild(gV);
    var sWrap = crow("Stretch r1, r2", null), s1 = make("input"), s2 = make("input"), sV = make("span", "val");
    s1.type = "range"; s1.min = 0; s1.max = 255; s1.value = r1; s2.type = "range"; s2.min = 0; s2.max = 255; s2.value = r2;
    sWrap.appendChild(s1); sWrap.appendChild(s2); sWrap.appendChild(sV);
    var tWrap = crow("Threshold T", null), tR = make("input"), tV = make("span", "val");
    tR.type = "range"; tR.min = 0; tR.max = 255; tR.value = T; tWrap.appendChild(tR); tWrap.appendChild(tV);
    var pWrap = crow("Probe pixel r", null), pR = make("input"), pV = make("span", "val");
    pR.type = "range"; pR.min = 0; pR.max = 255; pR.value = r0; pWrap.appendChild(pR); pWrap.appendChild(pV);
    ctrls.appendChild(gWrap); ctrls.appendChild(sWrap); ctrls.appendChild(tWrap); ctrls.appendChild(pWrap);
    el.appendChild(ctrls);
    function crow(lab, node) { var d = make("div", "ctrl"); d.appendChild(make("label", null, lab)); if (node) d.appendChild(node); return d; }

    var stage = make("div", "demo-flex");
    var curve = document.createElement("canvas"); curve.width = 300; curve.height = 300; curve.style.width = "300px"; curve.style.maxWidth = "100%";
    var imgs = make("div");
    var inC = document.createElement("canvas"); inC.width = 256; inC.height = 46; inC.style.width = "256px"; inC.style.maxWidth = "100%";
    var outC = document.createElement("canvas"); outC.width = 256; outC.height = 46; outC.style.width = "256px"; outC.style.maxWidth = "100%";
    imgs.appendChild(make("div", "mlabel", "Input ramp (r: 0→255)")); imgs.appendChild(inC);
    imgs.appendChild(make("div", "mlabel", "Output after T(r)")); imgs.appendChild(outC);
    stage.appendChild(curve); stage.appendChild(imgs);
    el.appendChild(stage);
    var readout = make("div", "readout"); el.appendChild(readout);

    function T_of(r) {
      if (mode === "negative") return 255 - r;
      if (mode === "log") { var c = logc * 255 / Math.log(256); return c * Math.log(1 + r); }
      if (mode === "gamma") return 255 * Math.pow(r / 255, gamma);
      if (mode === "threshold") return r >= T ? 255 : 0;
      if (mode === "stretch") {
        var a = Math.min(r1, r2), b = Math.max(r1, r2);
        if (r <= a) return 0; if (r >= b) return 255;
        return (r - a) * 255 / (b - a);
      }
      return r;
    }
    function formula() {
      if (mode === "negative") return "s = 255 − r   (photographic negative)";
      if (mode === "log") return "s = c·log(1+r),  c = 255/log(256) ≈ 45.99\n→ expands dark values, compresses bright (great for Fourier spectra)";
      if (mode === "gamma") return "s = 255·(r/255)^γ,  γ = " + round(gamma, 2) + "\n" + (gamma < 1 ? "γ<1 → brightens, expands dark detail" : (gamma > 1 ? "γ>1 → darkens, expands bright detail" : "γ=1 → identity"));
      if (mode === "threshold") return "s = 255 if r ≥ T else 0,  T = " + T + "\n→ binarization (limiting case of contrast stretch)";
      return "Piecewise-linear stretch from [r1, r2] = [" + Math.min(r1,r2) + ", " + Math.max(r1,r2) + "] onto [0, 255]\nslope = 255 / (r2 − r1) = " + round(255/Math.max(1,Math.abs(r2-r1)),2);
    }

    function draw() {
      gamma = +gR.value; r1 = +s1.value; r2 = +s2.value; T = +tR.value; r0 = +pR.value;
      gV.textContent = round(gamma, 2); sV.textContent = Math.min(r1,r2) + " , " + Math.max(r1,r2); tV.textContent = T; pV.textContent = r0;
      gWrap.style.display = mode === "gamma" ? "" : "none";
      sWrap.style.display = mode === "stretch" ? "" : "none";
      tWrap.style.display = mode === "threshold" ? "" : "none";

      var ctx = curve.getContext("2d"); ctx.clearRect(0, 0, 300, 300);
      // axes
      ctx.strokeStyle = cv("--border-2"); ctx.lineWidth = 1; ctx.fillStyle = cv("--muted"); ctx.font = "11px sans-serif";
      ctx.beginPath(); ctx.moveTo(40, 10); ctx.lineTo(40, 270); ctx.lineTo(295, 270); ctx.stroke();
      ctx.fillText("s (out)", 4, 20); ctx.fillText("r (in)", 258, 288);
      // grid
      ctx.strokeStyle = cv("--border"); ctx.globalAlpha = .5;
      for (var k = 1; k <= 4; k++) {
        var gx = 40 + k * 63.75, gy = 270 - k * 63.75;
        ctx.beginPath(); ctx.moveTo(gx, 10); ctx.lineTo(gx, 270); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(40, gy); ctx.lineTo(295, gy); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // identity line (dashed)
      ctx.strokeStyle = cv("--faint"); ctx.setLineDash([4, 4]); ctx.beginPath();
      ctx.moveTo(40, 270); ctx.lineTo(295, 15); ctx.stroke(); ctx.setLineDash([]);
      // curve
      ctx.strokeStyle = cv("--accent"); ctx.lineWidth = 2.5; ctx.beginPath();
      for (var r = 0; r <= 255; r++) { var s = clamp(T_of(r), 0, 255); var X = 40 + r, Y = 270 - s; if (r === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
      ctx.stroke();
      // probe
      var sp = clamp(T_of(r0), 0, 255);
      ctx.fillStyle = cv("--pink"); ctx.strokeStyle = cv("--pink"); ctx.setLineDash([3,3]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(40 + r0, 270); ctx.lineTo(40 + r0, 270 - sp); ctx.lineTo(40, 270 - sp); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(40 + r0, 270 - sp, 4.5, 0, 7); ctx.fill();

      // image strips
      var ic = inC.getContext("2d"), oc = outC.getContext("2d");
      for (var x = 0; x < 256; x++) {
        ic.fillStyle = "rgb(" + x + "," + x + "," + x + ")"; ic.fillRect(x, 0, 1, 46);
        var sv = Math.round(clamp(T_of(x), 0, 255)); oc.fillStyle = "rgb(" + sv + "," + sv + "," + sv + ")"; oc.fillRect(x, 0, 1, 46);
      }
      readout.textContent = formula() + "\n\nProbe:  r = " + r0 + "   →   s = " + round(sp, 1);
    }
    modeSel.onchange = function () { mode = modeSel.value; draw(); };
    [gR, s1, s2, tR, pR].forEach(function (n) { n.oninput = draw; });
    onTheme(draw); draw();
  };

  /* ============================================================
     4) HISTOGRAM EQUALIZATION
     ============================================================ */
  var HISTEQ_SETS = {
    class5: {
      label: "Class 5×5 example",
      L: 8, total: 25,
      img: [[4,4,4,4,4],[3,4,5,4,3],[3,5,5,5,3],[3,4,5,4,3],[4,4,4,4,4]],
      counts: [0,0,0,6,14,5,0,0]
    },
    gonzalez: {
      label: "Gonzalez 3-bit (MN=4096)",
      L: 8, total: 4096, img: null,
      counts: [790,1023,850,656,329,245,122,81]
    }
  };
  DEMOS.histeq = function (el, o) {
    el.appendChild(head("Histogram Equalization",
      "Spread a cramped histogram across the full range. The transform is the (scaled) CDF: s = round((L−1)·CDF(r)). Compare the before / after histograms.",
      "Interactive"));
    var key = o.set || "class5";
    var sel = make("select");
    Object.keys(HISTEQ_SETS).forEach(function (k) { var op = make("option", null, HISTEQ_SETS[k].label); op.value = k; if (k === key) op.selected = true; sel.appendChild(op); });
    var c = make("div", "ctrl"); c.appendChild(make("label", null, "Dataset")); c.appendChild(sel); el.appendChild(c);

    var tableHost = make("div", "tbl-wrap");
    var charts = make("div", "demo-flex");
    var h1 = document.createElement("canvas"); h1.width = 250; h1.height = 150; h1.style.width = "250px";
    var h2 = document.createElement("canvas"); h2.width = 250; h2.height = 150; h2.style.width = "250px";
    var b1 = make("div"); b1.appendChild(make("div", "mlabel", "Original histogram")); b1.appendChild(h1);
    var b2 = make("div"); b2.appendChild(make("div", "mlabel", "Equalized histogram")); b2.appendChild(h2);
    charts.appendChild(b1); charts.appendChild(b2);
    var imgHost = make("div", "demo-flex");
    el.appendChild(tableHost); el.appendChild(imgHost); el.appendChild(charts);

    function barChart(cvsx, hist, hi) {
      var ctx = cvsx.getContext("2d"); ctx.clearRect(0, 0, 250, 150);
      var max = Math.max.apply(null, hist) || 1, n = hist.length, bw = 250 / n;
      ctx.fillStyle = cv("--muted"); ctx.font = "9px sans-serif";
      for (var i = 0; i < n; i++) {
        var bh = hist[i] / max * 120;
        ctx.fillStyle = i === hi ? cv("--pink") : cv("--accent");
        ctx.fillRect(i * bw + 2, 135 - bh, bw - 4, bh);
        ctx.fillStyle = cv("--muted"); ctx.fillText(i, i * bw + bw / 2 - 3, 148);
      }
    }
    function render() {
      var S = HISTEQ_SETS[sel.value]; var L = S.L, MN = S.total, n = S.counts;
      var cdf = [], run = 0, sMap = [], eq = new Array(L).fill(0);
      for (var i = 0; i < L; i++) { run += n[i]; cdf.push(run / MN); sMap.push(Math.round((L - 1) * cdf[i])); }
      for (var i = 0; i < L; i++) eq[sMap[i]] += n[i];

      var html = "<table><thead><tr><th>r</th><th>n<sub>k</sub></th><th>p(r)=n/MN</th><th>CDF</th><th>(L−1)·CDF</th><th>s = round</th></tr></thead><tbody>";
      for (var i = 0; i < L; i++) {
        var hot = n[i] > 0 ? ' style="background:color-mix(in srgb,var(--accent) 8%,transparent)"' : "";
        html += "<tr" + hot + "><td class='num'>" + i + "</td><td class='num'>" + n[i] + "</td><td class='num'>" + round(n[i] / MN, 3) +
          "</td><td class='num'>" + round(cdf[i], 3) + "</td><td class='num'>" + round((L - 1) * cdf[i], 2) + "</td><td class='num'><b>" + sMap[i] + "</b></td></tr>";
      }
      html += "</tbody></table>";
      tableHost.innerHTML = html;
      barChart(h1, n, -1); barChart(h2, eq, -1);

      imgHost.innerHTML = "";
      if (S.img) {
        var orig = S.img, eqImg = orig.map(function (row) { return row.map(function (v) { return sMap[v]; }); });
        var bo = make("div"); bo.appendChild(make("div", "mlabel", "Original pixels")); bo.appendChild(shaded(orig, L));
        var be = make("div"); be.appendChild(make("div", "mlabel", "Equalized pixels")); be.appendChild(shaded(eqImg, L));
        imgHost.appendChild(bo); imgHost.appendChild(be);
      }
    }
    function shaded(mat, L) {
      var g = gridEl(mat, { cell: 34 });
      Array.prototype.forEach.call(g.children, function (cell) {
        var r = +cell.dataset.r, cc = +cell.dataset.c, v = mat[r][cc];
        var gg = Math.round(v / (L - 1) * 255); cell.style.background = "rgb(" + gg + "," + gg + "," + gg + ")";
        cell.style.color = gg > 130 ? "#111" : "#eee";
      });
      return g;
    }
    sel.onchange = render; onTheme(render); render();
  };

  /* ============================================================
     5) HOUGH TRANSFORM (voting)
     ============================================================ */
  DEMOS.hough = function (el, o) {
    el.appendChild(head("Hough Transform — Voting for Lines",
      "Click in image space to drop edge points. Each point becomes a curve in parameter space; where curves cross, a line gets votes. Toggle the (m, c) and (ρ, θ) parameterisations.",
      "Interactive"));
    var XMAX = 6, YMAX = 6, space = "mc";
    var pts = [];
    var btns = make("div", "btn-row");
    var spaceBtn = make("button", "btn", "Space: (m, c)");
    var demoBtn = make("button", "btn", "Load (1,2)(2,3)(3,4)");
    var demo2Btn = make("button", "btn", "Load (2,0)(2,5)");
    var clrBtn = make("button", "btn", "Clear");
    btns.appendChild(spaceBtn); btns.appendChild(demoBtn); btns.appendChild(demo2Btn); btns.appendChild(clrBtn);
    el.appendChild(btns);

    var stage = make("div", "demo-flex");
    var iC = document.createElement("canvas"); iC.width = 270; iC.height = 270; iC.style.width = "270px"; iC.style.maxWidth = "100%"; iC.style.cursor = "crosshair";
    var pC = document.createElement("canvas"); pC.width = 290; pC.height = 270; pC.style.width = "290px"; pC.style.maxWidth = "100%";
    var bi = make("div"); bi.appendChild(make("div", "mlabel", "Image space (x, y) — click to add points")); bi.appendChild(iC);
    var bp = make("div"); bp.appendChild(make("div", "mlabel", "Parameter space — each point votes")); bp.appendChild(pC);
    stage.appendChild(bi); stage.appendChild(bp); el.appendChild(stage);
    var readout = make("div", "readout"); el.appendChild(readout);

    var M = 28; // image-space margin
    function ix(x) { return M + x / XMAX * (270 - 2 * M); }
    function iy(y) { return (270 - M) - y / YMAX * (270 - 2 * M); }
    function invX(px) { return (px - M) / (270 - 2 * M) * XMAX; }
    function invY(py) { return ((270 - M) - py) / (270 - 2 * M) * YMAX; }

    function drawImage(det) {
      var ctx = iC.getContext("2d"); ctx.clearRect(0, 0, 270, 270);
      ctx.fillStyle = cv("--code-bg"); ctx.fillRect(0, 0, 270, 270);
      ctx.strokeStyle = cv("--border"); ctx.lineWidth = 1;
      for (var g = 0; g <= XMAX; g++) { ctx.beginPath(); ctx.moveTo(ix(g), iy(0)); ctx.lineTo(ix(g), iy(YMAX)); ctx.stroke(); }
      for (var g2 = 0; g2 <= YMAX; g2++) { ctx.beginPath(); ctx.moveTo(ix(0), iy(g2)); ctx.lineTo(ix(XMAX), iy(g2)); ctx.stroke(); }
      ctx.strokeStyle = cv("--border-2"); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(ix(0), iy(0)); ctx.lineTo(ix(XMAX), iy(0)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ix(0), iy(0)); ctx.lineTo(ix(0), iy(YMAX)); ctx.stroke();
      ctx.fillStyle = cv("--muted"); ctx.font = "10px sans-serif";
      for (var t = 1; t <= XMAX; t++) ctx.fillText(t, ix(t) - 3, iy(0) + 14);
      for (var t2 = 1; t2 <= YMAX; t2++) ctx.fillText(t2, ix(0) - 16, iy(t2) + 4);
      // detected line
      if (det && det.line) {
        ctx.strokeStyle = cv("--green"); ctx.lineWidth = 2.5; ctx.beginPath();
        var drawn = false;
        for (var xx = 0; xx <= XMAX; xx += 0.05) {
          var yy = det.line(xx); if (yy < -1 || yy > YMAX + 1) { drawn = false; continue; }
          if (!drawn) { ctx.moveTo(ix(xx), iy(yy)); drawn = true; } else ctx.lineTo(ix(xx), iy(yy));
        }
        ctx.stroke();
      }
      // points
      pts.forEach(function (p) {
        ctx.fillStyle = cv("--pink"); ctx.beginPath(); ctx.arc(ix(p.x), iy(p.y), 5, 0, 7); ctx.fill();
        ctx.fillStyle = cv("--text"); ctx.font = "10px sans-serif"; ctx.fillText("(" + p.x + "," + p.y + ")", ix(p.x) + 7, iy(p.y) - 6);
      });
    }

    function detectMC() {
      // intersections of lines c = -x*m + y
      if (pts.length < 2) return null;
      var best = null;
      for (var a = 0; a < pts.length; a++) for (var b = a + 1; b < pts.length; b++) {
        var dx = pts[b].x - pts[a].x; if (Math.abs(dx) < 1e-9) continue;
        var m = (pts[b].y - pts[a].y) / dx; var c = pts[a].y - m * pts[a].x;
        var inl = 0; pts.forEach(function (p) { if (Math.abs(p.y - (m * p.x + c)) < 0.25) inl++; });
        if (!best || inl > best.inl) best = { m: m, c: c, inl: inl };
      }
      if (!best) return null;
      return { m: best.m, c: best.c, inl: best.inl, line: function (x) { return best.m * x + best.c; } };
    }

    function drawMC(det) {
      var ctx = pC.getContext("2d"); ctx.clearRect(0, 0, 290, 270);
      ctx.fillStyle = cv("--code-bg"); ctx.fillRect(0, 0, 290, 270);
      var mMin = -4, mMax = 4, cMin = -6, cMax = 10, M2 = 30;
      function mx(m) { return M2 + (m - mMin) / (mMax - mMin) * (290 - 2 * M2); }
      function my(c) { return (270 - M2) - (c - cMin) / (cMax - cMin) * (270 - 2 * M2); }
      ctx.strokeStyle = cv("--border"); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(mx(0), my(cMin)); ctx.lineTo(mx(0), my(cMax)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mx(mMin), my(0)); ctx.lineTo(mx(mMax), my(0)); ctx.stroke();
      ctx.fillStyle = cv("--muted"); ctx.font = "10px sans-serif"; ctx.fillText("m →", 250, my(0) - 5); ctx.fillText("c", mx(0) + 4, 14);
      pts.forEach(function (p, i) {
        ctx.strokeStyle = ["#6ea8fe", "#5eead4", "#f472b6", "#fbbf24", "#c084fc", "#4ade80"][i % 6]; ctx.lineWidth = 1.8; ctx.beginPath();
        var started = false;
        for (var m = mMin; m <= mMax; m += 0.05) { var c = -p.x * m + p.y; if (c < cMin || c > cMax) { started = false; continue; } if (!started) { ctx.moveTo(mx(m), my(c)); started = true; } else ctx.lineTo(mx(m), my(c)); }
        ctx.stroke();
      });
      if (det) { ctx.fillStyle = cv("--green"); ctx.beginPath(); ctx.arc(mx(det.m), my(det.c), 5.5, 0, 7); ctx.fill(); ctx.strokeStyle = cv("--green"); ctx.lineWidth = 2; ctx.stroke(); }
    }

    function detectRT() {
      if (pts.length < 2) return null;
      var nT = 180, dRho = 0.25; // bins centred on multiples of dRho so integers land exactly
      var acc = {}; var best = { v: 0 };
      pts.forEach(function (p) {
        for (var ti = 0; ti < nT; ti++) { var th = ti * Math.PI / 180; var rho = p.x * Math.cos(th) + p.y * Math.sin(th); var ri = Math.round(rho / dRho); var key = ti + "_" + ri; acc[key] = (acc[key] || 0) + 1; if (acc[key] > best.v) best = { v: acc[key], ti: ti, rho: (ri * dRho) }; }
      });
      if (best.v < 2) return null;
      var th = best.ti * Math.PI / 180, ct = Math.cos(th), st = Math.sin(th), rho = best.rho;
      return { theta: best.ti, rho: rho, votes: best.v, line: function (x) { return Math.abs(st) < 1e-6 ? NaN : (rho - x * ct) / st; }, ct: ct, st: st };
    }
    function drawRT(det) {
      var ctx = pC.getContext("2d"); ctx.clearRect(0, 0, 290, 270);
      ctx.fillStyle = cv("--code-bg"); ctx.fillRect(0, 0, 290, 270);
      var D = Math.sqrt(XMAX * XMAX + YMAX * YMAX), M2 = 30;
      function tx(t) { return M2 + t / 180 * (290 - 2 * M2); }
      function ry(r) { return 135 - r / D * (135 - M2); }
      ctx.strokeStyle = cv("--border"); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(tx(0), ry(D)); ctx.lineTo(tx(0), ry(-D)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tx(0), ry(0)); ctx.lineTo(tx(180), ry(0)); ctx.stroke();
      ctx.fillStyle = cv("--muted"); ctx.font = "10px sans-serif"; ctx.fillText("θ° →", 250, ry(0) - 4); ctx.fillText("ρ", tx(0) + 4, 14);
      ["0", "90", "180"].forEach(function (lab) { ctx.fillText(lab, tx(+lab) - 6, 265); });
      pts.forEach(function (p, i) {
        ctx.strokeStyle = ["#6ea8fe", "#5eead4", "#f472b6", "#fbbf24", "#c084fc", "#4ade80"][i % 6]; ctx.lineWidth = 1.8; ctx.beginPath();
        for (var t = 0; t <= 180; t += 1) { var th = t * Math.PI / 180; var rho = p.x * Math.cos(th) + p.y * Math.sin(th); if (t === 0) ctx.moveTo(tx(t), ry(rho)); else ctx.lineTo(tx(t), ry(rho)); }
        ctx.stroke();
      });
      if (det) { ctx.fillStyle = cv("--green"); ctx.beginPath(); ctx.arc(tx(det.theta), ry(det.rho), 5.5, 0, 7); ctx.fill(); }
    }

    function refresh() {
      var det = space === "mc" ? detectMC() : detectRT();
      drawImage(det);
      if (space === "mc") drawMC(det); else drawRT(det);
      var txt = "";
      pts.forEach(function (p) { txt += space === "mc" ? ("(" + p.x + "," + p.y + "):  c = " + (-p.x) + "m + " + p.y + "\n") : ("(" + p.x + "," + p.y + "):  ρ = " + p.x + "cosθ + " + p.y + "sinθ\n"); });
      if (det) {
        if (space === "mc") txt += "\nBest line: c = -x·m + y intersect at  m = " + round(det.m, 2) + ", c = " + round(det.c, 2) + "\n→ y = " + round(det.m, 2) + "x + " + round(det.c, 2) + "   (" + det.inl + " points agree)";
        else txt += "\nPeak cell: θ = " + det.theta + "°, ρ = " + round(det.rho, 2) + "  (" + det.votes + " votes)";
      } else txt += "\nAdd ≥2 points to detect a line.";
      readout.textContent = txt;
    }

    iC.addEventListener("click", function (e) {
      var rect = iC.getBoundingClientRect(); var sx = (e.clientX - rect.left) * 270 / rect.width, sy = (e.clientY - rect.top) * 270 / rect.height;
      var x = Math.round(invX(sx)), y = Math.round(invY(sy));
      if (x < 0 || x > XMAX || y < 0 || y > YMAX) return;
      if (!pts.some(function (p) { return p.x === x && p.y === y; })) pts.push({ x: x, y: y }); refresh();
    });
    spaceBtn.onclick = function () { space = space === "mc" ? "rt" : "mc"; spaceBtn.textContent = "Space: " + (space === "mc" ? "(m, c)" : "(ρ, θ)"); refresh(); };
    demoBtn.onclick = function () { pts = [{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }]; refresh(); };
    demo2Btn.onclick = function () { pts = [{ x: 2, y: 0 }, { x: 2, y: 5 }]; refresh(); };
    clrBtn.onclick = function () { pts = []; refresh(); };
    onTheme(refresh); refresh();
  };

  /* ============================================================
     6) CANNY PIPELINE
     ============================================================ */
  DEMOS.canny = function (el, o) {
    el.appendChild(head("Canny Edge Detector — Step by Step",
      "The classic 4-stage pipeline running live on a noisy synthetic image. Walk through smoothing → gradients → non-maximum suppression → hysteresis.",
      "Interactive"));
    var N = 100, scale = 2.4, stage = 0;
    var sigma = 1.4, TL = 18, TH = 45;
    var stageNames = ["1 · Original (noisy)", "2 · Gaussian smoothed", "3 · Gradient magnitude", "4 · Non-max suppression", "5 · Hysteresis (final edges)"];

    var btns = make("div", "btn-row");
    var prev = make("button", "btn", "◀ Prev"); var next = make("button", "btn primary", "Next stage ▶");
    var label = make("span", "badge blue", stageNames[0]);
    btns.appendChild(prev); btns.appendChild(next); btns.appendChild(label);
    el.appendChild(btns);
    var ctrls = make("div");
    var sgR = make("input"); sgR.type = "range"; sgR.min = 0.6; sgR.max = 2.6; sgR.step = 0.1; sgR.value = sigma; var sgV = make("span", "val");
    var loR = make("input"); loR.type = "range"; loR.min = 5; loR.max = 60; loR.value = TL; var loV = make("span", "val");
    var hiR = make("input"); hiR.type = "range"; hiR.min = 20; hiR.max = 120; hiR.value = TH; var hiV = make("span", "val");
    ctrls.appendChild(cr2("Gaussian σ", sgR, sgV)); ctrls.appendChild(cr2("Low threshold", loR, loV)); ctrls.appendChild(cr2("High threshold", hiR, hiV));
    el.appendChild(ctrls);
    function cr2(l, r, v) { var d = make("div", "ctrl"); d.appendChild(make("label", null, l)); d.appendChild(r); d.appendChild(v); return d; }
    var cvs = document.createElement("canvas"); cvs.width = N * scale; cvs.height = N * scale; cvs.style.width = "min(100%, 360px)"; cvs.style.imageRendering = "auto";
    el.appendChild(cvs);
    var readout = make("div", "readout"); el.appendChild(readout);

    // synthetic scene
    var base = [];
    (function () {
      for (var y = 0; y < N; y++) { base[y] = []; for (var x = 0; x < N; x++) {
        var v = 30;
        if (x > 18 && x < 60 && y > 22 && y < 70) v = 200;     // rectangle
        var dx = x - 68, dy = y - 40, r = Math.sqrt(dx * dx + dy * dy);
        if (r < 18) v = 150;                                    // circle
        base[y][x] = v;
      } }
    })();
    function noisy() { var g = []; for (var y = 0; y < N; y++) { g[y] = []; for (var x = 0; x < N; x++) g[y][x] = clamp(base[y][x] + (Math.random() - 0.5) * 60, 0, 255); } return g; }
    var noiseImg = noisy();

    function gauss(img, s) {
      var rad = Math.max(1, Math.round(s * 2.5)), ker = [], sum = 0;
      for (var i = -rad; i <= rad; i++) { var w = Math.exp(-(i * i) / (2 * s * s)); ker.push(w); sum += w; }
      ker = ker.map(function (w) { return w / sum; });
      var tmp = [], out = [];
      for (var y = 0; y < N; y++) { tmp[y] = []; for (var x = 0; x < N; x++) { var a = 0; for (var k = -rad; k <= rad; k++) { var xx = clamp(x + k, 0, N - 1); a += img[y][xx] * ker[k + rad]; } tmp[y][x] = a; } }
      for (var y2 = 0; y2 < N; y2++) { out[y2] = []; for (var x2 = 0; x2 < N; x2++) { var b = 0; for (var k2 = -rad; k2 <= rad; k2++) { var yy = clamp(y2 + k2, 0, N - 1); b += tmp[yy][x2] * ker[k2 + rad]; } out[y2][x2] = b; } }
      return out;
    }
    function sobel(img) {
      var gx = [], gy = [], mag = [], ang = [];
      for (var y = 0; y < N; y++) { gx[y] = []; gy[y] = []; mag[y] = []; ang[y] = []; for (var x = 0; x < N; x++) {
        var x0 = clamp(x - 1, 0, N - 1), x2 = clamp(x + 1, 0, N - 1), y0 = clamp(y - 1, 0, N - 1), y2 = clamp(y + 1, 0, N - 1);
        var gxx = (img[y0][x2] + 2 * img[y][x2] + img[y2][x2]) - (img[y0][x0] + 2 * img[y][x0] + img[y2][x0]);
        var gyy = (img[y2][x0] + 2 * img[y2][x] + img[y2][x2]) - (img[y0][x0] + 2 * img[y0][x] + img[y0][x2]);
        gx[y][x] = gxx; gy[y][x] = gyy; mag[y][x] = Math.sqrt(gxx * gxx + gyy * gyy) / 4; ang[y][x] = Math.atan2(gyy, gxx);
      } }
      return { gx: gx, gy: gy, mag: mag, ang: ang };
    }
    function nms(g) {
      var out = []; for (var y = 0; y < N; y++) { out[y] = []; for (var x = 0; x < N; x++) {
        var a = g.ang[y][x] * 180 / Math.PI; if (a < 0) a += 180; var m = g.mag[y][x], n1, n2;
        if (a < 22.5 || a >= 157.5) { n1 = px(x - 1, y); n2 = px(x + 1, y); }
        else if (a < 67.5) { n1 = px(x + 1, y - 1); n2 = px(x - 1, y + 1); }
        else if (a < 112.5) { n1 = px(x, y - 1); n2 = px(x, y + 1); }
        else { n1 = px(x - 1, y - 1); n2 = px(x + 1, y + 1); }
        out[y][x] = (m >= n1 && m >= n2) ? m : 0;
      } } function px(x, y) { return g.mag[clamp(y, 0, N - 1)][clamp(x, 0, N - 1)]; } return out;
    }
    function hyst(sup) {
      var lab = []; for (var y = 0; y < N; y++) { lab[y] = []; for (var x = 0; x < N; x++) lab[y][x] = sup[y][x] >= TH ? 2 : (sup[y][x] >= TL ? 1 : 0); }
      var st = []; for (var y2 = 0; y2 < N; y2++) for (var x2 = 0; x2 < N; x2++) if (lab[y2][x2] === 2) st.push([x2, y2]);
      var out = []; for (var y3 = 0; y3 < N; y3++) { out[y3] = []; for (var x3 = 0; x3 < N; x3++) out[y3][x3] = lab[y3][x3] === 2 ? 255 : 0; }
      while (st.length) { var p = st.pop(); for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) { var nx = p[0] + dx, ny = p[1] + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; if (lab[ny][nx] === 1) { lab[ny][nx] = 2; out[ny][nx] = 255; st.push([nx, ny]); } } }
      return out;
    }
    function render() {
      sigma = +sgR.value; TL = +loR.value; TH = +hiR.value; sgV.textContent = round(sigma, 1); loV.textContent = TL; hiV.textContent = TH;
      if (TH <= TL) { TH = TL + 5; hiR.value = TH; hiV.textContent = TH; }
      label.textContent = stageNames[stage];
      var sm = gauss(noiseImg, sigma); var g = sobel(sm); var grid, note = "";
      if (stage === 0) { grid = noiseImg; note = "Edges are buried in noise; raw gradients would fire everywhere."; }
      else if (stage === 1) { grid = sm; note = "Gaussian σ=" + round(sigma, 1) + " suppresses noise before differentiation (derivative amplifies noise)."; }
      else if (stage === 2) { grid = g.mag; note = "‖∇f‖ from Sobel. Edges are thick ridges — not yet 1px wide."; }
      else if (stage === 3) { grid = nms(g); note = "Keep a pixel only if it's a local max ALONG the gradient direction → thin 1px edges."; }
      else { grid = hyst(nms(g)); note = "Strong (≥" + TH + ") seed edges; weak (≥" + TL + ") kept only if connected to strong. Ratio TH:TL = " + round(TH / TL, 1) + ":1."; }
      var max = 0; for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) if (grid[y][x] > max) max = grid[y][x]; if (max === 0) max = 1;
      var ctx = cvs.getContext("2d"); var id = ctx.createImageData(N, N);
      for (var y2 = 0; y2 < N; y2++) for (var x2 = 0; x2 < N; x2++) { var v = stage >= 2 ? grid[y2][x2] / max * 255 : grid[y2][x2]; var gg = Math.round(clamp(v, 0, 255)); var i = (y2 * N + x2) * 4; id.data[i] = id.data[i + 1] = id.data[i + 2] = gg; id.data[i + 3] = 255; }
      var tmp = document.createElement("canvas"); tmp.width = N; tmp.height = N; tmp.getContext("2d").putImageData(id, 0, 0);
      ctx.imageSmoothingEnabled = false; ctx.clearRect(0, 0, cvs.width, cvs.height); ctx.drawImage(tmp, 0, 0, cvs.width, cvs.height);
      readout.textContent = "Stage " + (stage + 1) + "/5 — " + stageNames[stage] + "\n" + note;
    }
    prev.onclick = function () { stage = clamp(stage - 1, 0, 4); render(); };
    next.onclick = function () { stage = clamp(stage + 1, 0, 4); render(); };
    [sgR, loR, hiR].forEach(function (n) { n.oninput = render; });
    onTheme(render); render();
  };

  /* ============================================================
     7) HARRIS CORNER DETECTOR (structure tensor intuition)
     ============================================================ */
  DEMOS.harris = function (el, o) {
    el.appendChild(head("Harris Corner Detector — Why corners win",
      "Slide the window over flat, edge and corner regions. The scatter of gradients (Iₓ, I_y) inside the window — captured by the structure tensor M — tells flat from edge from corner. R = det(M) − k·trace(M)².",
      "Interactive"));
    var N = 80, scale = 3, win = 16, wx = 12, wy = 40, k = 0.04;
    // synthetic: bright square on dark bg
    var img = [];
    for (var y = 0; y < N; y++) { img[y] = []; for (var x = 0; x < N; x++) { var v = 35; if (x >= 24 && x <= 56 && y >= 24 && y <= 56) v = 205; img[y][x] = v; } }
    function I(x, y) { return img[clamp(y, 0, N - 1)][clamp(x, 0, N - 1)]; }
    function Ix(x, y) { return ((I(x + 1, y - 1) + 2 * I(x + 1, y) + I(x + 1, y + 1)) - (I(x - 1, y - 1) + 2 * I(x - 1, y) + I(x - 1, y + 1))) / 8; }
    function Iy(x, y) { return ((I(x - 1, y + 1) + 2 * I(x, y + 1) + I(x + 1, y + 1)) - (I(x - 1, y - 1) + 2 * I(x, y - 1) + I(x + 1, y - 1))) / 8; }

    var btns = make("div", "btn-row");
    var fBtn = make("button", "btn", "Flat"); var eBtn = make("button", "btn", "Edge"); var cBtn = make("button", "btn", "Corner");
    btns.appendChild(make("span", "mlabel", "Jump to: ")); btns.appendChild(fBtn); btns.appendChild(eBtn); btns.appendChild(cBtn);
    el.appendChild(btns);
    var stage = make("div", "demo-flex");
    var imgC = document.createElement("canvas"); imgC.width = N * scale; imgC.height = N * scale; imgC.style.width = "240px"; imgC.style.cursor = "crosshair"; imgC.style.imageRendering = "auto";
    var scC = document.createElement("canvas"); scC.width = 200; scC.height = 200; scC.style.width = "200px";
    var bi = make("div"); bi.appendChild(make("div", "mlabel", "Image — click to move window")); bi.appendChild(imgC);
    var bs = make("div"); bs.appendChild(make("div", "mlabel", "Gradient scatter (Iₓ, I_y) in window")); bs.appendChild(scC);
    stage.appendChild(bi); stage.appendChild(bs); el.appendChild(stage);
    var readout = make("div", "readout"); el.appendChild(readout);

    function render() {
      // base image scaled
      var ctx = imgC.getContext("2d"); var id = ctx.createImageData(N, N);
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) { var g = img[y][x]; var i = (y * N + x) * 4; id.data[i] = id.data[i + 1] = id.data[i + 2] = g; id.data[i + 3] = 255; }
      var tmp = document.createElement("canvas"); tmp.width = N; tmp.height = N; tmp.getContext("2d").putImageData(id, 0, 0);
      ctx.imageSmoothingEnabled = false; ctx.clearRect(0, 0, imgC.width, imgC.height); ctx.drawImage(tmp, 0, 0, imgC.width, imgC.height);
      // window rect
      ctx.strokeStyle = cv("--pink"); ctx.lineWidth = 2; ctx.strokeRect(wx * scale, wy * scale, win * scale, win * scale);

      // structure tensor over window
      var Sxx = 0, Syy = 0, Sxy = 0, gxs = [], gys = [], maxg = 1;
      for (var yy = wy; yy < wy + win; yy++) for (var xx = wx; xx < wx + win; xx++) {
        var gx = Ix(xx, yy), gy = Iy(xx, yy); Sxx += gx * gx; Syy += gy * gy; Sxy += gx * gy; gxs.push(gx); gys.push(gy); maxg = Math.max(maxg, Math.abs(gx), Math.abs(gy));
      }
      var det = Sxx * Syy - Sxy * Sxy, tr = Sxx + Syy;
      var disc = Math.sqrt(Math.max(0, (Sxx - Syy) * (Sxx - Syy) + 4 * Sxy * Sxy));
      var l1 = (tr + disc) / 2, l2 = (tr - disc) / 2;
      var R = det - k * tr * tr;
      var cls = "Flat", col = cv("--muted");
      var Rn = R / (win * win * 1000);
      if (l1 > 1500 && l2 > 1500) { cls = "CORNER ✦"; col = cv("--green"); }
      else if (l1 > 1500 && l2 <= 1500) { cls = "Edge"; col = cv("--amber"); }
      else { cls = "Flat"; col = cv("--muted"); }

      // scatter
      var sc = scC.getContext("2d"); sc.clearRect(0, 0, 200, 200); sc.fillStyle = cv("--code-bg"); sc.fillRect(0, 0, 200, 200);
      sc.strokeStyle = cv("--border"); sc.beginPath(); sc.moveTo(100, 0); sc.lineTo(100, 200); sc.moveTo(0, 100); sc.lineTo(200, 100); sc.stroke();
      sc.fillStyle = cv("--muted"); sc.font = "10px sans-serif"; sc.fillText("Iₓ", 186, 96); sc.fillText("I_y", 104, 12);
      sc.fillStyle = cv("--accent");
      for (var p = 0; p < gxs.length; p++) { var X = 100 + gxs[p] / maxg * 90, Y = 100 - gys[p] / maxg * 90; sc.beginPath(); sc.arc(X, Y, 2.4, 0, 7); sc.fill(); }

      readout.textContent =
        "Structure tensor  M = Σ [ Iₓ²  IₓI_y ; IₓI_y  I_y² ]\n" +
        "   = [ " + Math.round(Sxx) + "   " + Math.round(Sxy) + " ;  " + Math.round(Sxy) + "   " + Math.round(Syy) + " ]\n" +
        "λ₁ = " + Math.round(l1) + ",  λ₂ = " + Math.round(l2) + "\n" +
        "R = det − k·trace²  (k=0.04)  =  " + Math.round(R).toLocaleString() + "\n" +
        "→ " + cls + "   " + (cls.indexOf("CORNER") === 0 ? "(both λ large → scatter spreads in 2-D)" : cls === "Edge" ? "(one λ large → scatter forms a line)" : "(both λ small → scatter clustered at origin)");
      readout.style.borderLeft = "4px solid " + col;
    }
    imgC.addEventListener("click", function (e) {
      var rect = imgC.getBoundingClientRect(); var x = (e.clientX - rect.left) / rect.width * N, y = (e.clientY - rect.top) / rect.height * N;
      wx = clamp(Math.round(x - win / 2), 0, N - win); wy = clamp(Math.round(y - win / 2), 0, N - win); render();
    });
    fBtn.onclick = function () { wx = 4; wy = 4; render(); };
    eBtn.onclick = function () { wx = 32; wy = 8; render(); };
    cBtn.onclick = function () { wx = 48; wy = 16; render(); };
    onTheme(render); render();
  };

  /* ============================================================
     8) HOG ORIENTATION BINNING
     ============================================================ */
  DEMOS.hog = function (el, o) {
    el.appendChild(head("HOG — Orientation Binning with Interpolation",
      "Each pixel's gradient (magnitude + direction) votes into a 9-bin histogram (0–160°, width 20°). The vote splits between the two nearest bin centres by distance — exactly the exam-style calculation.",
      "Interactive"));
    var centers = [0, 20, 40, 60, 80, 100, 120, 140, 160];
    var hist = new Array(9).fill(0);
    var theta = 57, mag = 85;

    var ctrls = make("div");
    var thR = make("input"); thR.type = "range"; thR.min = 0; thR.max = 179; thR.value = theta; var thV = make("span", "val");
    var mgR = make("input"); mgR.type = "range"; mgR.min = 1; mgR.max = 100; mgR.value = mag; var mgV = make("span", "val");
    ctrls.appendChild(cr3("Direction θ°", thR, thV)); ctrls.appendChild(cr3("Magnitude |g|", mgR, mgV));
    el.appendChild(ctrls);
    function cr3(l, r, v) { var d = make("div", "ctrl"); d.appendChild(make("label", null, l)); d.appendChild(r); d.appendChild(v); return d; }
    var btns = make("div", "btn-row");
    var addB = make("button", "btn primary", "+ Cast this vote"); var exB = make("button", "btn", "Load exam: θ=57°"); var clrB = make("button", "btn", "Reset histogram");
    btns.appendChild(addB); btns.appendChild(exB); btns.appendChild(clrB); el.appendChild(btns);

    var stage = make("div", "demo-flex");
    var compass = document.createElement("canvas"); compass.width = 150; compass.height = 150; compass.style.width = "150px";
    var chart = document.createElement("canvas"); chart.width = 320; chart.height = 170; chart.style.width = "320px"; chart.style.maxWidth = "100%";
    var bc = make("div"); bc.appendChild(make("div", "mlabel", "Gradient direction")); bc.appendChild(compass);
    var bh = make("div"); bh.appendChild(make("div", "mlabel", "9-bin histogram")); bh.appendChild(chart);
    stage.appendChild(bc); stage.appendChild(bh); el.appendChild(stage);
    var readout = make("div", "readout"); el.appendChild(readout);

    function split(th, m) {
      var t = ((th % 180) + 180) % 180;
      var i = Math.floor(t / 20); var lo = 20 * i, loIdx = i % 9, hiIdx = (i + 1) % 9;
      var fhi = (t - lo) / 20, flo = 1 - fhi;
      return { loIdx: loIdx, hiIdx: hiIdx, wlo: m * flo, whi: m * fhi, loC: centers[loIdx], hiC: centers[hiIdx] };
    }
    function drawCompass() {
      var ctx = compass.getContext("2d"); ctx.clearRect(0, 0, 150, 150); ctx.fillStyle = cv("--code-bg"); ctx.fillRect(0, 0, 150, 150);
      var cx = 75, cy = 75; ctx.strokeStyle = cv("--border"); ctx.beginPath(); ctx.arc(cx, cy, 60, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 65, cy); ctx.lineTo(cx + 65, cy); ctx.stroke();
      var a = theta * Math.PI / 180;
      ctx.strokeStyle = cv("--accent"); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 60, cy - Math.sin(a) * 60); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - Math.cos(a) * 60, cy + Math.sin(a) * 60); ctx.stroke();
      ctx.fillStyle = cv("--muted"); ctx.font = "10px sans-serif"; ctx.fillText("0°", cx + 64, cy + 4); ctx.fillText("90°", cx - 8, cy - 64);
    }
    function drawChart(sp) {
      var ctx = chart.getContext("2d"); ctx.clearRect(0, 0, 320, 170); var max = Math.max(1, Math.max.apply(null, hist), sp ? Math.max(sp.wlo, sp.whi) : 0);
      var bw = 320 / 9;
      for (var i = 0; i < 9; i++) {
        var h = hist[i] / max * 120;
        ctx.fillStyle = cv("--accent"); ctx.fillRect(i * bw + 4, 140 - h, bw - 8, h);
        if (sp && (i === sp.loIdx || i === sp.hiIdx)) {
          var add = (i === sp.loIdx ? sp.wlo : sp.whi) / max * 120;
          ctx.fillStyle = cv("--pink"); ctx.globalAlpha = .6; ctx.fillRect(i * bw + 4, 140 - h - add, bw - 8, add); ctx.globalAlpha = 1;
        }
        ctx.fillStyle = cv("--muted"); ctx.font = "9px sans-serif"; ctx.fillText(centers[i], i * bw + bw / 2 - 7, 155);
        if (hist[i] > 0) { ctx.fillStyle = cv("--text"); ctx.fillText(round(hist[i], 1), i * bw + bw / 2 - 9, 138 - h); }
      }
    }
    function refresh() {
      theta = +thR.value; mag = +mgR.value; thV.textContent = theta + "°"; mgV.textContent = mag;
      var sp = split(theta, mag); drawCompass(); drawChart(sp);
      readout.textContent =
        "θ = " + theta + "°  falls between bin centres " + sp.loC + "° and " + sp.hiC + "°\n" +
        "weight→" + sp.loC + "° = (" + sp.hiC + "−" + theta + ")/20 = " + round(sp.wlo / mag, 2) + "   →  +" + round(sp.wlo, 2) + "\n" +
        "weight→" + sp.hiC + "° = (" + theta + "−" + sp.loC + ")/20 = " + round(sp.whi / mag, 2) + "   →  +" + round(sp.whi, 2) + "\n" +
        "(pink = the vote about to be cast; click “Cast this vote” to accumulate)";
    }
    addB.onclick = function () { var sp = split(theta, mag); hist[sp.loIdx] += sp.wlo; hist[sp.hiIdx] += sp.whi; refresh(); };
    exB.onclick = function () { thR.value = 57; mgR.value = 85; refresh(); };
    clrB.onclick = function () { hist = new Array(9).fill(0); refresh(); };
    [thR, mgR].forEach(function (n) { n.oninput = refresh; });
    onTheme(refresh); refresh();
  };

  /* ============================================================
     9) LIVE CAMERA — edges (Sobel/Canny) & Harris corners
     ============================================================ */
  DEMOS.camera = function (el, o) {
    el.appendChild(head("Live Camera — Edges &amp; Corners",
      "Point your webcam at the scene and watch Sobel / Canny edges and Harris corners computed live, in pure JavaScript. Frames are processed on your device and never uploaded.",
      "Webcam · Live"));

    var btns = make("div", "btn-row");
    var startBtn = make("button", "btn primary", "▶ Start camera");
    var stopBtn = make("button", "btn", "⏹ Stop"); stopBtn.disabled = true;
    var modeSel = make("select");
    [["edges", "Sobel edges"], ["canny", "Canny edges"], ["corners", "Harris corners"], ["original", "Original"]]
      .forEach(function (m) { var op = make("option", null, m[1]); op.value = m[0]; modeSel.appendChild(op); });
    var mirrorBtn = make("button", "btn", "Mirror: On");
    btns.appendChild(startBtn); btns.appendChild(stopBtn); btns.appendChild(modeSel); btns.appendChild(mirrorBtn);
    el.appendChild(btns);

    var ctrls = make("div");
    var sR = make("input"); sR.type = "range"; sR.min = 1; sR.max = 100; sR.value = 45; var sV = make("span", "val");
    var cw = make("div", "ctrl"); cw.appendChild(make("label", null, "Sensitivity")); cw.appendChild(sR); cw.appendChild(sV);
    ctrls.appendChild(cw); el.appendChild(ctrls);

    var video = document.createElement("video");
    video.setAttribute("playsinline", ""); video.muted = true; video.autoplay = true; video.style.display = "none";
    el.appendChild(video);
    var out = document.createElement("canvas"); out.width = 320; out.height = 240;
    out.style.width = "min(100%, 480px)"; out.style.background = "var(--code-bg)"; out.style.imageRendering = "auto";
    el.appendChild(out);
    var legend = make("div", "legend"); el.appendChild(legend);
    var status = make("div", "readout");
    status.textContent = "Camera is off. Click “Start camera” — your browser will ask for permission. Everything runs locally; no frames are uploaded.";
    el.appendChild(status);

    var stream = null, raf = null, mirror = true, mode = "edges";
    var PW = 320, PH = 240;
    var proc = document.createElement("canvas");
    var fpsT = 0, fpsN = 0, fpsVal = 0;

    function toGray(d, n) { var g = new Float32Array(n); for (var i = 0, j = 0; i < n; i++, j += 4) g[i] = 0.299 * d[j] + 0.587 * d[j + 1] + 0.114 * d[j + 2]; return g; }
    function blur3(g, W, H) {
      var t = new Float32Array(W * H), out2 = new Float32Array(W * H), i;
      for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) { i = y * W + x; var l = x > 0 ? g[i - 1] : g[i], r = x < W - 1 ? g[i + 1] : g[i]; t[i] = (l + 2 * g[i] + r) * 0.25; }
      for (var y2 = 0; y2 < H; y2++) for (var x2 = 0; x2 < W; x2++) { i = y2 * W + x2; var u = y2 > 0 ? t[i - W] : t[i], dn = y2 < H - 1 ? t[i + W] : t[i]; out2[i] = (u + 2 * t[i] + dn) * 0.25; }
      return out2;
    }
    function sobel(g, W, H) {
      var gx = new Float32Array(W * H), gy = new Float32Array(W * H);
      for (var y = 1; y < H - 1; y++) for (var x = 1; x < W - 1; x++) {
        var i = y * W + x;
        var tl = g[i - W - 1], tc = g[i - W], tr = g[i - W + 1], ml = g[i - 1], mr = g[i + 1], bl = g[i + W - 1], bc = g[i + W], br = g[i + W + 1];
        gx[i] = (tr + 2 * mr + br) - (tl + 2 * ml + bl);
        gy[i] = (bl + 2 * bc + br) - (tl + 2 * tc + tr);
      }
      return { gx: gx, gy: gy };
    }

    function renderEdges(g, W, H, img) {
      var s = sobel(g, W, H), gx = s.gx, gy = s.gy, n = W * H;
      var thr = 160 * (1 - sR.value / 100) + 12; // higher sensitivity → lower threshold
      var d = img.data;
      for (var i = 0, j = 0; i < n; i++, j += 4) {
        var m = Math.sqrt(gx[i] * gx[i] + gy[i] * gy[i]) / 4;
        var v = m > thr ? 255 : 0;
        d[j] = d[j + 1] = d[j + 2] = v; d[j + 3] = 255;
      }
    }
    function renderCanny(g, W, H, img) {
      g = blur3(g, W, H);
      var s = sobel(g, W, H), gx = s.gx, gy = s.gy, n = W * H;
      var mag = new Float32Array(n), sup = new Float32Array(n), i, x, y;
      for (i = 0; i < n; i++) mag[i] = Math.sqrt(gx[i] * gx[i] + gy[i] * gy[i]) / 4;
      for (y = 1; y < H - 1; y++) for (x = 1; x < W - 1; x++) {
        i = y * W + x; var a = Math.atan2(gy[i], gx[i]) * 180 / Math.PI; if (a < 0) a += 180; var n1, n2;
        if (a < 22.5 || a >= 157.5) { n1 = mag[i - 1]; n2 = mag[i + 1]; }
        else if (a < 67.5) { n1 = mag[i - W + 1]; n2 = mag[i + W - 1]; }
        else if (a < 112.5) { n1 = mag[i - W]; n2 = mag[i + W]; }
        else { n1 = mag[i - W - 1]; n2 = mag[i + W + 1]; }
        sup[i] = (mag[i] >= n1 && mag[i] >= n2) ? mag[i] : 0;
      }
      var TH = 150 * (1 - sR.value / 100) + 18, TL = TH * 0.4;
      var lab = new Uint8Array(n), st = [];
      for (i = 0; i < n; i++) { lab[i] = sup[i] >= TH ? 2 : (sup[i] >= TL ? 1 : 0); if (lab[i] === 2) st.push(i); }
      while (st.length) { var p = st.pop(); var nb = [p - 1, p + 1, p - W, p + W, p - W - 1, p - W + 1, p + W - 1, p + W + 1]; for (var q = 0; q < 8; q++) { var k = nb[q]; if (k >= 0 && k < n && lab[k] === 1) { lab[k] = 2; st.push(k); } } }
      var d = img.data;
      for (i = 0, x = 0; i < n; i++, x += 4) { var v = lab[i] === 2 ? 255 : 0; d[x] = d[x + 1] = d[x + 2] = v; d[x + 3] = 255; }
    }
    function renderCorners(g, W, H, octx) {
      var s = sobel(g, W, H), gx = s.gx, gy = s.gy, n = W * H, i;
      var xx = new Float32Array(n), yy = new Float32Array(n), xy = new Float32Array(n);
      for (i = 0; i < n; i++) { xx[i] = gx[i] * gx[i]; yy[i] = gy[i] * gy[i]; xy[i] = gx[i] * gy[i]; }
      xx = blur3(xx, W, H); yy = blur3(yy, W, H); xy = blur3(xy, W, H);
      var R = new Float32Array(n), maxR = 1, k = 0.04, x, y;
      for (y = 1; y < H - 1; y++) for (x = 1; x < W - 1; x++) { i = y * W + x; var det = xx[i] * yy[i] - xy[i] * xy[i], tr = xx[i] + yy[i]; var r = (det - k * tr * tr) / 1e6; R[i] = r; if (r > maxR) maxR = r; }
      var frac = (1 - sR.value / 100) * 0.25 + 0.02, thr = frac * maxR, count = 0;
      octx.fillStyle = "#ff3b6b"; octx.strokeStyle = "#fff"; octx.lineWidth = 1;
      for (y = 2; y < H - 2 && count < 600; y++) for (x = 2; x < W - 2 && count < 600; x++) {
        i = y * W + x; var v = R[i];
        if (v > thr && v >= R[i - 1] && v >= R[i + 1] && v >= R[i - W] && v >= R[i + W] && v >= R[i - W - 1] && v >= R[i + W + 1] && v >= R[i - W + 1] && v >= R[i + W - 1]) {
          octx.beginPath(); octx.arc(x, y, 3, 0, 7); octx.fill(); count++;
        }
      }
      return count;
    }

    function frame() {
      if (!stream) return;
      var vw = video.videoWidth, vh = video.videoHeight;
      if (vw && vh) { PW = 320; PH = Math.max(120, Math.round(320 * vh / vw)); }
      if (proc.width !== PW) { proc.width = PW; proc.height = PH; out.width = PW; out.height = PH; }
      var pctx = proc.getContext("2d");
      pctx.save(); if (mirror) { pctx.translate(PW, 0); pctx.scale(-1, 1); } pctx.drawImage(video, 0, 0, PW, PH); pctx.restore();
      var octx = out.getContext("2d");
      var img = pctx.getImageData(0, 0, PW, PH), n = PW * PH;
      var corners = 0;
      if (mode === "original") { octx.putImageData(img, 0, 0); }
      else if (mode === "corners") { octx.putImageData(img, 0, 0); corners = renderCorners(toGray(img.data, n), PW, PH, octx); }
      else { var g = toGray(img.data, n); if (mode === "canny") renderCanny(g, PW, PH, img); else renderEdges(g, PW, PH, img); octx.putImageData(img, 0, 0); }
      // fps
      var now = performance.now(); fpsN++; if (now - fpsT > 500) { fpsVal = Math.round(fpsN * 1000 / (now - fpsT)); fpsN = 0; fpsT = now; }
      status.textContent = "Live · " + PW + "×" + PH + " · " + modeSel.options[modeSel.selectedIndex].text + " · ~" + fpsVal + " fps" + (mode === "corners" ? " · " + corners + " corners" : "") + "\nAll processing is in-browser (vanilla JS). Nothing leaves your device.";
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        status.textContent = "⚠ Camera API unavailable in this context. If you opened the file directly (file://) and it's blocked, run a quick local server — e.g. `python3 -m http.server` in this folder — and open http://localhost:8000/session6.html, which browsers treat as secure.";
        return;
      }
      status.textContent = "Requesting camera permission…";
      navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 640 } }, audio: false })
        .then(function (s) {
          stream = s; video.srcObject = s; video.play();
          startBtn.disabled = true; stopBtn.disabled = false;
          fpsT = performance.now(); fpsN = 0;
          raf = requestAnimationFrame(frame);
        })
        .catch(function (err) {
          var msg = err && err.name === "NotAllowedError" ? "Permission denied. Allow camera access in your browser's site settings and try again."
            : err && err.name === "NotFoundError" ? "No camera found on this device."
            : "Could not start the camera (" + (err && err.name || err) + "). If on file://, try a local server (http://localhost).";
          status.textContent = "⚠ " + msg;
        });
    }
    function stop() {
      if (raf) cancelAnimationFrame(raf); raf = null;
      if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
      startBtn.disabled = false; stopBtn.disabled = true;
      status.textContent = "Camera stopped.";
    }
    startBtn.onclick = start;
    stopBtn.onclick = stop;
    modeSel.onchange = function () {
      mode = modeSel.value;
      legend.innerHTML = mode === "corners"
        ? '<span><span class="swatch" style="background:#ff3b6b"></span>detected Harris corners (R &gt; threshold, local maxima)</span>'
        : mode === "original" ? '' : '<span><span class="swatch" style="background:#fff"></span>edge pixels</span>';
    };
    mirrorBtn.onclick = function () { mirror = !mirror; mirrorBtn.textContent = "Mirror: " + (mirror ? "On" : "Off"); };
    sR.oninput = function () { sV.textContent = sR.value; };
    sV.textContent = sR.value;
    // pause when tab hidden to save the camera
    document.addEventListener("visibilitychange", function () { if (document.hidden && raf) { cancelAnimationFrame(raf); raf = null; } else if (!document.hidden && stream && !raf) { raf = requestAnimationFrame(frame); } });
  };

  // expose registry incrementally
  window.CVDemos = window.CVDemos || {};
  window.CVDemos._DEMOS = DEMOS;
  window.CVDemos._make = make;
  window.CVDemos._cv = cv;
  window.CVDemos._onTheme = onTheme;
  window.CVDemos._clamp = clamp;
  window.CVDemos._round = round;
  window.CVDemos._gridEl = gridEl;
  window.CVDemos._head = head;
  window.CVDemos.initAll = function () {
    var nodes = document.querySelectorAll("[data-demo]");
    Array.prototype.forEach.call(nodes, function (el) {
      if (el.dataset._init) return;
      var name = el.dataset.demo;
      if (DEMOS[name]) {
        el.dataset._init = "1";
        el.classList.add("demo");
        var opt = {};
        for (var k in el.dataset) if (k !== "demo" && k !== "_init") opt[k] = el.dataset[k];
        try { DEMOS[name](el, opt); } catch (e) { el.appendChild(make("div", "readout", "Demo error: " + e.message)); }
      }
    });
  };
})();
