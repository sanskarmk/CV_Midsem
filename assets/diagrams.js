/* ============================================================
   diagrams.js — inline-SVG concept diagrams, theme-aware via CSS vars.
   Usage: <figure data-diagram="edge-profiles" data-caption="..."></figure>
   Loaded by layout.js; self-initialises.
   ============================================================ */
(function () {
  "use strict";
  var FONT = 'font-family="-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif"';
  var D = {};

  /* ---------- Edge profiles: step / ramp / roof ---------- */
  D["edge-profiles"] = `
  <svg viewBox="0 0 720 250" ${FONT}>
    <defs><linearGradient id="rampg" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#1c1c1c"/><stop offset="1" stop-color="#e9e9e9"/></linearGradient></defs>
    ${[["Step",120],["Ramp",360],["Roof",600]].map(function(p){return '<text x="'+p[1]+'" y="20" text-anchor="middle" fill="var(--accent-2)" font-size="15" font-weight="700">'+p[0]+'</text>';}).join("")}
    <!-- STEP -->
    <rect x="30" y="32" width="90" height="34" fill="#1c1c1c"/><rect x="120" y="32" width="90" height="34" fill="#e9e9e9"/>
    <rect x="30" y="32" width="180" height="34" fill="none" stroke="var(--border-2)"/>
    <line x1="30" y1="200" x2="210" y2="200" stroke="var(--muted)"/><line x1="30" y1="95" x2="30" y2="200" stroke="var(--muted)"/>
    <polyline points="30,185 120,185 120,110 210,110" fill="none" stroke="var(--accent)" stroke-width="2.6"/>
    <!-- RAMP -->
    <rect x="270" y="32" width="180" height="34" fill="url(#rampg)" stroke="var(--border-2)"/>
    <line x1="270" y1="200" x2="450" y2="200" stroke="var(--muted)"/><line x1="270" y1="95" x2="270" y2="200" stroke="var(--muted)"/>
    <polyline points="270,185 320,185 400,110 450,110" fill="none" stroke="var(--accent)" stroke-width="2.6"/>
    <!-- ROOF -->
    <rect x="510" y="32" width="180" height="34" fill="#1c1c1c"/><rect x="590" y="32" width="20" height="34" fill="#e9e9e9"/>
    <rect x="510" y="32" width="180" height="34" fill="none" stroke="var(--border-2)"/>
    <line x1="510" y1="200" x2="690" y2="200" stroke="var(--muted)"/><line x1="510" y1="95" x2="510" y2="200" stroke="var(--muted)"/>
    <polyline points="510,185 588,185 600,110 612,185 690,185" fill="none" stroke="var(--accent)" stroke-width="2.6"/>
    <text x="120" y="225" text-anchor="middle" fill="var(--muted)" font-size="11">instant jump</text>
    <text x="360" y="225" text-anchor="middle" fill="var(--muted)" font-size="11">gradual slope</text>
    <text x="600" y="225" text-anchor="middle" fill="var(--muted)" font-size="11">thin bright line</text>
  </svg>`;

  /* ---------- 1st & 2nd derivative of an edge ---------- */
  D["edge-derivative"] = `
  <svg viewBox="0 0 700 290" ${FONT}>
    <line x1="350" y1="14" x2="350" y2="282" stroke="var(--pink)" stroke-width="1.2" stroke-dasharray="4 4"/>
    <text x="356" y="20" fill="var(--pink)" font-size="11">edge</text>
    <text x="16" y="52" fill="var(--accent-2)" font-size="15" font-weight="700">f</text>
    <text x="14" y="150" fill="var(--accent-2)" font-size="15" font-weight="700">f′</text>
    <text x="13" y="250" fill="var(--accent-2)" font-size="15" font-weight="700">f″</text>
    <line x1="60" y1="70" x2="670" y2="70" stroke="var(--border)"/>
    <polyline points="60,62 350,62 350,30 670,30" fill="none" stroke="var(--accent)" stroke-width="2.6"/>
    <line x1="60" y1="150" x2="670" y2="150" stroke="var(--border)"/>
    <polyline points="60,150 338,150 350,108 362,150 670,150" fill="none" stroke="var(--accent)" stroke-width="2.6"/>
    <text x="370" y="120" fill="var(--muted)" font-size="11">peak at edge</text>
    <line x1="60" y1="250" x2="670" y2="250" stroke="var(--border)"/>
    <polyline points="60,250 336,250 344,218 350,250 356,282 364,250 670,250" fill="none" stroke="var(--accent)" stroke-width="2.6"/>
    <text x="370" y="240" fill="var(--muted)" font-size="11">+ / − ⇒ zero-crossing = edge</text>
  </svg>`;

  /* ---------- Image formation (pinhole / lens) ---------- */
  D["image-formation"] = `
  <svg viewBox="0 0 700 240" ${FONT}>
    <circle cx="60" cy="60" r="22" fill="var(--amber)"/>
    ${[0,45,90,135,180,225,270,315].map(function(a){var r=a*Math.PI/180;return '<line x1="'+(60+Math.cos(r)*26)+'" y1="'+(60+Math.sin(r)*26)+'" x2="'+(60+Math.cos(r)*36)+'" y2="'+(60+Math.sin(r)*36)+'" stroke="var(--amber)" stroke-width="2"/>';}).join("")}
    <text x="60" y="115" text-anchor="middle" fill="var(--muted)" font-size="11">light source i(x,y)</text>
    <line x1="210" y1="160" x2="210" y2="80" stroke="var(--accent-2)" stroke-width="3"/>
    <polygon points="210,72 204,86 216,86" fill="var(--accent-2)"/>
    <text x="210" y="185" text-anchor="middle" fill="var(--muted)" font-size="11">object (reflectance r)</text>
    <line x1="420" y1="40" x2="420" y2="200" stroke="var(--text)" stroke-width="2"/>
    <circle cx="420" cy="120" r="5" fill="var(--surface)" stroke="var(--text)"/>
    <text x="420" y="222" text-anchor="middle" fill="var(--muted)" font-size="11">lens / pinhole</text>
    <line x1="560" y1="60" x2="560" y2="180" stroke="var(--text)" stroke-width="2"/>
    <line x1="560" y1="100" x2="560" y2="160" stroke="var(--pink)" stroke-width="3"/>
    <polygon points="560,168 554,154 566,154" fill="var(--pink)"/>
    <text x="560" y="205" text-anchor="middle" fill="var(--muted)" font-size="11">sensor (inverted)</text>
    <line x1="210" y1="80" x2="560" y2="160" stroke="var(--accent)" stroke-width="1.2" stroke-dasharray="4 3"/>
    <line x1="210" y1="160" x2="560" y2="100" stroke="var(--accent)" stroke-width="1.2" stroke-dasharray="4 3"/>
    <text x="350" y="30" text-anchor="middle" fill="var(--accent)" font-size="13" font-weight="700">f(x,y) = i(x,y) · r(x,y)</text>
  </svg>`;

  /* ---------- Gradient direction vs edge direction ---------- */
  D["gradient-direction"] = `
  <svg viewBox="0 0 380 300" ${FONT}>
    <clipPath id="cp"><rect x="60" y="40" width="240" height="220"/></clipPath>
    <g clip-path="url(#cp)">
      <polygon points="60,260 300,40 60,40" fill="#e9e9e9"/>
      <polygon points="60,260 300,40 300,260" fill="#1c1c1c"/>
    </g>
    <rect x="60" y="40" width="240" height="220" fill="none" stroke="var(--border-2)"/>
    <line x1="60" y1="260" x2="300" y2="40" stroke="var(--text)" stroke-width="2"/>
    <text x="250" y="70" fill="#111" font-size="12">bright</text>
    <text x="95" y="240" fill="#ddd" font-size="12">dark</text>
    <!-- gradient arrow (perpendicular, into bright) -->
    <line x1="180" y1="150" x2="128" y2="98" stroke="var(--accent)" stroke-width="3"/>
    <polygon points="124,94 140,100 130,110" fill="var(--accent)"/>
    <text x="96" y="92" fill="var(--accent)" font-size="13" font-weight="700">∇f</text>
    <!-- edge direction arrow (along edge) -->
    <line x1="180" y1="150" x2="244" y2="92" stroke="var(--accent-2)" stroke-width="3"/>
    <polygon points="250,86 236,92 244,100" fill="var(--accent-2)"/>
    <text x="252" y="92" fill="var(--accent-2)" font-size="13" font-weight="700">edge</text>
    <rect x="168" y="138" width="14" height="14" fill="none" stroke="var(--muted)" transform="rotate(-45 180 150)"/>
  </svg>`;

  /* ---------- RGB additive vs CMYK subtractive ---------- */
  D["rgb-cmyk"] = `
  <svg viewBox="0 0 700 340" ${FONT}>
    <text x="175" y="22" text-anchor="middle" fill="var(--accent)" font-size="14" font-weight="700">RGB — additive (light)</text>
    <text x="525" y="22" text-anchor="middle" fill="var(--accent)" font-size="14" font-weight="700">CMYK — subtractive (ink)</text>
    <g style="isolation:isolate">
      <rect x="20" y="36" width="310" height="270" rx="10" fill="#070707"/>
      <g style="mix-blend-mode:screen">
        <circle cx="175" cy="120" r="78" fill="#ff2d2d"/>
        <circle cx="130" cy="200" r="78" fill="#2dff2d"/>
        <circle cx="220" cy="200" r="78" fill="#2d6bff"/>
      </g>
      <text x="175" y="295" text-anchor="middle" fill="#ddd" font-size="11">all three on → white</text>
    </g>
    <g style="isolation:isolate">
      <rect x="370" y="36" width="310" height="270" rx="10" fill="#ffffff"/>
      <g style="mix-blend-mode:multiply">
        <circle cx="525" cy="120" r="78" fill="#00b7c8"/>
        <circle cx="480" cy="200" r="78" fill="#e5009a"/>
        <circle cx="570" cy="200" r="78" fill="#ffe000"/>
      </g>
      <text x="525" y="295" text-anchor="middle" fill="#333" font-size="11">all three on → black (K)</text>
    </g>
  </svg>`;

  /* ---------- Hough polar (rho, theta) ---------- */
  D["hough-polar"] = `
  <svg viewBox="0 0 360 320" ${FONT}>
    <line x1="50" y1="280" x2="340" y2="280" stroke="var(--muted)"/><polygon points="346,280 334,275 334,285" fill="var(--muted)"/>
    <line x1="50" y1="280" x2="50" y2="30" stroke="var(--muted)"/><polygon points="50,24 45,36 55,36" fill="var(--muted)"/>
    <text x="338" y="300" fill="var(--muted)" font-size="12">x</text><text x="30" y="40" fill="var(--muted)" font-size="12">y</text>
    <text x="36" y="296" fill="var(--muted)" font-size="12">O</text>
    <!-- the line -->
    <line x1="120" y1="60" x2="330" y2="250" stroke="var(--accent-2)" stroke-width="2.6"/>
    <text x="300" y="240" fill="var(--accent-2)" font-size="12">line</text>
    <!-- perpendicular from origin to line -->
    <line x1="50" y1="280" x2="171" y2="159" stroke="var(--accent)" stroke-width="2.4"/>
    <text x="95" y="210" fill="var(--accent)" font-size="14" font-weight="700">ρ</text>
    <rect x="158" y="146" width="13" height="13" fill="none" stroke="var(--muted)" transform="rotate(45 171 159)"/>
    <path d="M 110 280 A 60 60 0 0 0 88 242" fill="none" stroke="var(--pink)" stroke-width="2"/>
    <text x="104" y="258" fill="var(--pink)" font-size="13" font-weight="700">θ</text>
  </svg>`;

  /* ---------- Harris eigenvalue regions ---------- */
  D["harris-eigen"] = `
  <svg viewBox="0 0 360 320" ${FONT}>
    <rect x="55" y="40" width="110" height="110" fill="var(--green)" opacity="0.18"/>
    <rect x="55" y="150" width="120" height="120" fill="var(--muted)" opacity="0.16"/>
    <rect x="175" y="150" width="155" height="120" fill="var(--amber)" opacity="0.16"/>
    <rect x="55" y="40" width="110" height="110" fill="none"/>
    <line x1="55" y1="270" x2="340" y2="270" stroke="var(--muted)"/><polygon points="346,270 334,265 334,275" fill="var(--muted)"/>
    <line x1="55" y1="270" x2="55" y2="30" stroke="var(--muted)"/><polygon points="55,24 50,36 60,36" fill="var(--muted)"/>
    <text x="330" y="290" fill="var(--muted)" font-size="13">λ₁</text><text x="34" y="40" fill="var(--muted)" font-size="13">λ₂</text>
    <text x="110" y="96" text-anchor="middle" fill="var(--green)" font-size="14" font-weight="700">Corner</text>
    <text x="110" y="114" text-anchor="middle" fill="var(--green)" font-size="10">R &gt; 0</text>
    <text x="252" y="206" text-anchor="middle" fill="var(--amber)" font-size="14" font-weight="700">Edge</text>
    <text x="252" y="224" text-anchor="middle" fill="var(--amber)" font-size="10">R &lt; 0 (λ₁ ≫ λ₂)</text>
    <text x="115" y="206" text-anchor="middle" fill="var(--muted)" font-size="13" font-weight="700">Flat</text>
    <text x="115" y="224" text-anchor="middle" fill="var(--muted)" font-size="10">|R| small</text>
    <text x="120" y="300" text-anchor="middle" fill="var(--amber)" font-size="10">Edge (λ₂ ≫ λ₁) sits along λ₂-axis too</text>
  </svg>`;

  /* ---------- Canny pipeline flow ---------- */
  D["canny-flow"] = (function () {
    var stages = [["Image","",20,"var(--muted)"],["Gaussian","smooth",168,"var(--accent)"],["Gradient","∇f: mag, θ",316,"var(--accent)"],["Non-max","suppression",464,"var(--accent-2)"],["Hysteresis","double thresh",612,"var(--green)"]];
    var boxes = stages.map(function (s) {
      return '<rect x="'+s[2]+'" y="38" width="128" height="54" rx="9" fill="var(--surface-2)" stroke="'+s[3]+'" stroke-width="1.6"/>'+
        '<text x="'+(s[2]+64)+'" y="62" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="700">'+s[0]+'</text>'+
        '<text x="'+(s[2]+64)+'" y="80" text-anchor="middle" fill="var(--muted)" font-size="11">'+s[1]+'</text>';
    }).join("");
    var arrows = [148,296,444,592].map(function (x) {
      return '<line x1="'+x+'" y1="65" x2="'+(x+20)+'" y2="65" stroke="var(--muted)" stroke-width="2"/><polygon points="'+(x+20)+',65 '+(x+13)+',61 '+(x+13)+',69" fill="var(--muted)"/>';
    }).join("");
    return '<svg viewBox="0 0 760 120" '+FONT+'><text x="380" y="22" text-anchor="middle" fill="var(--accent)" font-size="13" font-weight="700">The 4-stage Canny pipeline</text>'+boxes+arrows+'</svg>';
  })();

  /* ---------- HOG pipeline ---------- */
  D["hog-pipeline"] = (function () {
    var grid = "";
    for (var i = 0; i <= 4; i++) grid += '<line x1="'+(30+i*16)+'" y1="30" x2="'+(30+i*16)+'" y2="190" stroke="var(--border-2)"/>';
    for (var j = 0; j <= 10; j++) grid += '<line x1="30" y1="'+(30+j*16)+'" x2="94" y2="'+(30+j*16)+'" stroke="var(--border-2)"/>';
    var arrows = "";
    for (var a = 0; a < 6; a++) { var r = (a*61)*Math.PI/180; arrows += '<line x1="200" y1="110" x2="'+(200+Math.cos(r)*22)+'" y2="'+(110+Math.sin(r)*22)+'" stroke="var(--accent)" stroke-width="1.6"/>'; }
    var bars = [22,55,80,38,18,10,8,14,20];
    var hist = bars.map(function (h, k) { return '<rect x="'+(360+k*22)+'" y="'+(180-h)+'" width="16" height="'+h+'" fill="'+(h===80?'var(--pink)':'var(--accent)')+'"/>'+'<text x="'+(368+k*22)+'" y="194" text-anchor="middle" fill="var(--muted)" font-size="8">'+(k*20)+'</text>'; }).join("");
    return '<svg viewBox="0 0 720 220" '+FONT+'>'+
      '<rect x="30" y="30" width="64" height="160" fill="none" stroke="var(--text)"/>'+grid+
      '<text x="62" y="210" text-anchor="middle" fill="var(--muted)" font-size="11">window → 8×8 cells</text>'+
      '<rect x="150" y="60" width="100" height="100" fill="var(--surface-2)" stroke="var(--accent-2)"/>'+arrows+
      '<text x="200" y="178" text-anchor="middle" fill="var(--muted)" font-size="11">one cell: gradients</text>'+
      hist+'<text x="450" y="210" text-anchor="middle" fill="var(--muted)" font-size="11">9-bin orientation histogram</text>'+
      '<line x1="104" y1="110" x2="146" y2="110" stroke="var(--muted)" stroke-width="2"/><polygon points="146,110 139,106 139,114" fill="var(--muted)"/>'+
      '<line x1="256" y1="110" x2="354" y2="110" stroke="var(--muted)" stroke-width="2"/><polygon points="354,110 347,106 347,114" fill="var(--muted)"/>'+
      '<text x="630" y="100" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="700">2×2 blocks</text>'+
      '<text x="630" y="120" text-anchor="middle" fill="var(--muted)" font-size="11">L2-normalise</text>'+
      '<text x="630" y="138" text-anchor="middle" fill="var(--muted)" font-size="11">→ 3780-D</text>'+
      '<line x1="568" y1="110" x2="582" y2="110" stroke="var(--muted)" stroke-width="2"/><polygon points="582,110 575,106 575,114" fill="var(--muted)"/></svg>';
  })();

  /* ---------- Scale-space & Difference of Gaussians ---------- */
  D["scale-space-dog"] = (function () {
    var levels = [0.10,0.22,0.38,0.6];
    var stack = levels.map(function (op, k) { return '<rect x="'+(40)+'" y="'+(40+k*44)+'" width="120" height="38" rx="4" fill="var(--accent)" opacity="'+op+'" stroke="var(--border-2)"/>'; }).join("");
    var dog = [0.5,0.42,0.3].map(function (op, k) { return '<rect x="300" y="'+(62+k*44)+'" width="120" height="38" rx="4" fill="var(--accent-2)" opacity="'+op+'" stroke="var(--border-2)"/>'; }).join("");
    return '<svg viewBox="0 0 700 290" '+FONT+'>'+
      '<text x="100" y="28" text-anchor="middle" fill="var(--accent)" font-size="13" font-weight="700">Gaussian scale-space</text>'+stack+
      '<text x="100" y="262" text-anchor="middle" fill="var(--muted)" font-size="11">blur ↑ : σ, kσ, k²σ …</text>'+
      '<text x="230" y="150" text-anchor="middle" fill="var(--text)" font-size="26">−</text>'+
      '<text x="360" y="48" text-anchor="middle" fill="var(--accent-2)" font-size="13" font-weight="700">DoG</text>'+dog+
      '<text x="360" y="262" text-anchor="middle" fill="var(--muted)" font-size="11">D = G(kσ) − G(σ) ≈ LoG</text>'+
      '<line x1="430" y1="120" x2="498" y2="120" stroke="var(--muted)" stroke-width="2"/><polygon points="498,120 491,116 491,124" fill="var(--muted)"/>'+
      // 3x3x3 neighbour schematic
      '<g transform="translate(515,70)">'+
      [0,1,2].map(function(z){return [0,1,2].map(function(yy){return [0,1,2].map(function(xx){var cxp=z*14+xx*22, cyp=z*14+yy*22; var center=(z===1&&xx===1&&yy===1); return '<rect x="'+cxp+'" y="'+cyp+'" width="18" height="18" fill="'+(center?'var(--pink)':'var(--surface-2)')+'" stroke="var(--border-2)"/>';}).join("");}).join("");}).join("")+
      '</g>'+
      '<text x="585" y="250" text-anchor="middle" fill="var(--muted)" font-size="11">extremum vs 26 neighbours</text>'+
      '<text x="585" y="266" text-anchor="middle" fill="var(--pink)" font-size="11">→ keypoint at its scale</text></svg>';
  })();

  /* ---------- SIFT descriptor 4x4x8 ---------- */
  D["sift-descriptor"] = (function () {
    var cells = "";
    var len = [10,7,5,4,6,8,5,4];
    for (var gy = 0; gy < 4; gy++) for (var gx = 0; gx < 4; gx++) {
      var cx = 40 + gx * 60 + 30, cy = 40 + gy * 60 + 30;
      cells += '<rect x="'+(40+gx*60)+'" y="'+(40+gy*60)+'" width="60" height="60" fill="var(--surface-2)" stroke="var(--border-2)"/>';
      for (var d = 0; d < 8; d++) { var r = d * 45 * Math.PI / 180; var L = 6 + len[(d + gx + gy) % 8]; cells += '<line x1="'+cx+'" y1="'+cy+'" x2="'+(cx + Math.cos(r) * L)+'" y2="'+(cy + Math.sin(r) * L)+'" stroke="var(--accent)" stroke-width="1.5"/>'; }
    }
    return '<svg viewBox="0 0 320 320" '+FONT+'><text x="160" y="24" text-anchor="middle" fill="var(--accent)" font-size="13" font-weight="700">SIFT descriptor</text>'+cells+'<text x="160" y="300" text-anchor="middle" fill="var(--muted)" font-size="12">4×4 cells × 8 orientations = 128-D vector</text></svg>';
  })();

  /* ---------- RANSAC inliers / outliers ---------- */
  D["ransac"] = (function () {
    var inliers = [[70,250],[110,228],[150,212],[195,190],[235,172],[280,150],[320,134],[360,116],[395,100]];
    var outliers = [[120,90],[300,250],[200,80],[360,210]];
    var pts = inliers.map(function (p) { return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="5" fill="var(--accent)"/>'; }).join("") +
      outliers.map(function (p) { return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="5" fill="var(--pink)"/>'; }).join("");
    return '<svg viewBox="0 0 440 300" '+FONT+'>'+
      '<line x1="40" y1="270" x2="420" y2="270" stroke="var(--muted)"/><line x1="40" y1="270" x2="40" y2="40" stroke="var(--muted)"/>'+
      '<line x1="55" y1="268" x2="410" y2="92" stroke="var(--accent)" stroke-width="2.4"/>'+
      '<line x1="55" y1="248" x2="410" y2="72" stroke="var(--accent)" stroke-width="1" stroke-dasharray="5 4" opacity="0.7"/>'+
      '<line x1="55" y1="288" x2="410" y2="112" stroke="var(--accent)" stroke-width="1" stroke-dasharray="5 4" opacity="0.7"/>'+
      pts +
      '<circle cx="270" cy="36" r="5" fill="var(--accent)"/><text x="282" y="40" fill="var(--muted)" font-size="12">inliers (within band)</text>'+
      '<circle cx="270" cy="56" r="5" fill="var(--pink)"/><text x="282" y="60" fill="var(--muted)" font-size="12">outliers</text>'+
      '<text x="120" y="58" fill="var(--accent)" font-size="11">fit with most inliers</text></svg>';
  })();

  /* ---------- Image as a grid of intensities ---------- */
  D["image-grid"] = (function () {
    var vals = [[40,40,60,150,160],[40,55,90,170,180],[60,90,140,200,210],[150,170,200,230,240],[160,180,210,240,250]];
    var cells = "";
    for (var r = 0; r < 5; r++) for (var c = 0; c < 5; c++) {
      var v = vals[r][c]; cells += '<rect x="'+(70 + c * 44)+'" y="'+(40 + r * 44)+'" width="44" height="44" fill="rgb('+v+','+v+','+v+')" stroke="var(--border)"/>'+
        '<text x="'+(70 + c * 44 + 22)+'" y="'+(40 + r * 44 + 27)+'" text-anchor="middle" fill="'+(v > 130 ? '#111' : '#eee')+'" font-size="12" font-family="monospace">'+v+'</text>';
    }
    return '<svg viewBox="0 0 320 300" '+FONT+'>'+cells+
      '<line x1="70" y1="32" x2="290" y2="32" stroke="var(--muted)"/><polygon points="290,32 283,28 283,36" fill="var(--muted)"/><text x="296" y="36" fill="var(--muted)" font-size="12">x</text>'+
      '<line x1="62" y1="40" x2="62" y2="260" stroke="var(--muted)"/><polygon points="62,260 58,253 66,253" fill="var(--muted)"/><text x="56" y="276" fill="var(--muted)" font-size="12">y</text>'+
      '<text x="180" y="288" text-anchor="middle" fill="var(--muted)" font-size="11">each cell = f(x,y), an intensity 0–255</text></svg>';
  })();

  /* ---------- Non-maximum suppression ---------- */
  D["nms"] = `
  <svg viewBox="0 0 380 240" ${FONT}>
    ${[0,1,2].map(function(r){return [0,1,2].map(function(c){var center=(r===1&&c===1);var nb=(r===1&&(c===0||c===2));return '<rect x="'+(60+c*70)+'" y="'+(40+r*60)+'" width="70" height="60" fill="'+(center?'var(--pink)':nb?'var(--accent)':'var(--surface-2)')+'" opacity="'+(center?0.85:nb?0.4:1)+'" stroke="var(--border-2)"/>';}).join("");}).join("")}
    <line x1="60" y1="100" x2="270" y2="100" stroke="var(--accent-2)" stroke-width="2.5" stroke-dasharray="6 4"/>
    <polygon points="276,100 264,95 264,105" fill="var(--accent-2)"/>
    <text x="150" y="88" text-anchor="middle" fill="var(--accent-2)" font-size="11">gradient direction</text>
    <text x="95" y="135" text-anchor="middle" fill="#eee" font-size="11">n₁</text>
    <text x="165" y="135" text-anchor="middle" fill="#111" font-size="11" font-weight="700">p</text>
    <text x="235" y="135" text-anchor="middle" fill="#eee" font-size="11">n₂</text>
    <text x="190" y="225" text-anchor="middle" fill="var(--muted)" font-size="12">keep p only if p ≥ n₁ and p ≥ n₂  →  1-px-thin edge</text>
  </svg>`;

  // ---- init ----
  function initAll() {
    var nodes = document.querySelectorAll("figure[data-diagram]");
    Array.prototype.forEach.call(nodes, function (f) {
      if (f.dataset._dgInit) return;
      var svg = D[f.dataset.diagram];
      if (!svg) return;
      f.dataset._dgInit = "1";
      f.classList.add("diagram");
      var cap = f.getAttribute("data-caption");
      f.innerHTML = svg + (cap ? '<figcaption>' + cap + '</figcaption>' : '');
    });
  }
  window.CVDiagrams = { initAll: initAll, _D: D };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initAll);
  else initAll();
})();
