/* ============================================================
   layout.js — shared shell: sidebar nav, topbar, theme toggle,
   mobile menu, MathJax loader. Include on every page.
   Set window.CV_PAGE = {id, title, crumb} before this loads.
   ============================================================ */
(function () {
  var PAGE = window.CV_PAGE || { id: "", title: "", crumb: "" };

  var NAV = [
    { group: "", items: [
      { id: "index", ix: "★", label: "Home", href: "index.html" }
    ]},
    { group: "Sessions", items: [
      { id: "session1", ix: "1", label: "Intro to Computer Vision", href: "session1.html" },
      { id: "session2", ix: "2", label: "Digital Image Fundamentals", href: "session2.html" },
      { id: "session3", ix: "3", label: "Low-Level Vision & Color", href: "session3.html" },
      { id: "session4", ix: "4", label: "Edge Detection & Gradients", href: "session4.html" },
      { id: "session5", ix: "5", label: "Canny & Hough Transform", href: "session5.html" },
      { id: "session6", ix: "6", label: "Harris Corners & HOG", href: "session6.html" },
      { id: "session7",  ix: "7",  label: "SIFT & RANSAC", href: "session7.html" },
      { id: "session9",  ix: "9",  label: "Image Classification", href: "session9.html" },
      { id: "session10", ix: "10", label: "Attention & ViT", href: "session10.html" },
      { id: "session11", ix: "11", label: "Image Segmentation", href: "session11.html" },
      { id: "session12", ix: "12", label: "Semantic Seg & Metrics", href: "session12.html" },
      { id: "session13", ix: "13", label: "Object Detection", href: "session13.html" },
      { id: "session14", ix: "14", label: "Visual Bag of Words", href: "session14.html" },
      { id: "session15", ix: "15", label: "Object Tracking", href: "session15.html" },
      { id: "session16", ix: "16", label: "Metrics & Wrap-up", href: "session16.html" },
      { id: "session17", ix: "17", label: "Edge Devices", href: "session17.html" },
      { id: "optional",  ix: "W",  label: "Face & OCR (optional)", href: "optional.html" }
    ]},
    { group: "Exam Prep", items: [
      { id: "comprehensive", ix: "EC3", label: "Comprehensive Exam", href: "comprehensive.html" },
      { id: "exam",    ix: "✦", label: "Midsem — Overview", href: "exam.html" },
      { id: "exam-q1", ix: "Q1", label: "Q1 · Sampling & Contrast", href: "exam-q1.html" },
      { id: "exam-q2", ix: "Q2", label: "Q2 · Transforms & Hough", href: "exam-q2.html" },
      { id: "exam-q3", ix: "Q3", label: "Q3 · Edge Kernel & Color", href: "exam-q3.html" },
      { id: "exam-q4", ix: "Q4", label: "Q4 · Laplacian & Operators", href: "exam-q4.html" },
      { id: "exam-q5", ix: "Q5", label: "Q5 · Hough & Corners", href: "exam-q5.html" },
      { id: "exam-q6", ix: "Q6", label: "Q6 · HOG & RANSAC", href: "exam-q6.html" },
      { id: "exam-q7", ix: "Q7", label: "Q7 · kNN & Softmax", href: "exam-q7.html" },
      { id: "exam-q8", ix: "Q8", label: "Q8 · Attention & ViT", href: "exam-q8.html" },
      { id: "exam-q9", ix: "Q9", label: "Q9 · Segmentation", href: "exam-q9.html" },
      { id: "exam-q10", ix: "Q10", label: "Q10 · IoU & FCN", href: "exam-q10.html" },
      { id: "exam-q11", ix: "Q11", label: "Q11 · Object Detection", href: "exam-q11.html" },
      { id: "exam-q12", ix: "Q12", label: "Q12 · Visual BoW", href: "exam-q12.html" },
      { id: "exam-q13", ix: "Q13", label: "Q13 · Tracking", href: "exam-q13.html" },
      { id: "exam-q14", ix: "Q14", label: "Q14 · AP & mAP", href: "exam-q14.html" },
      { id: "exam-q15", ix: "Q15", label: "Q15 · Edge, Face & OCR", href: "exam-q15.html" },
      { id: "practice", ix: "✎", label: "Questions for Practice", href: "practice.html" },
      { id: "practice-ec3", ix: "✎", label: "EC-3 Practice Paper", href: "practice-ec3.html" },
      { id: "lectures", ix: "▶", label: "From the Lectures", href: "lectures.html" }
    ]},
    { group: "Reference", items: [
      { id: "numericals", ix: "∑", label: "Numericals — Step by Step", href: "numericals.html" },
      { id: "formulas",   ix: "ƒ", label: "Formula Cheat-Sheet", href: "formulas.html" }
    ]}
  ];

  // ---- Build sidebar ----
  var sb = document.getElementById("sidebar");
  if (sb) {
    var html = '<a class="brand" href="index.html">' +
      '<span class="logo">CV</span>' +
      '<span><span class="b-title">Computer Vision</span><br>' +
      '<span class="b-sub">AIMLCZG525 · Exam Companion</span></span></a>';
    NAV.forEach(function (g) {
      html += '<div class="nav-group">';
      if (g.group) html += '<h4>' + g.group + '</h4>';
      g.items.forEach(function (it) {
        var active = it.id === PAGE.id ? " active" : "";
        html += '<a class="nav-link' + active + '" href="' + it.href + '">' +
          '<span class="ix">' + it.ix + '</span><span>' + it.label + '</span></a>';
      });
      html += '</div>';
    });
    sb.innerHTML = html;
  }

  // ---- Build topbar ----
  var tb = document.getElementById("topbar");
  if (tb) {
    tb.innerHTML =
      '<button class="icon-btn menu-btn" id="menuBtn" aria-label="Menu">☰</button>' +
      '<div class="crumbs">Computer Vision &nbsp;›&nbsp; <b>' + (PAGE.crumb || PAGE.title || "") + '</b></div>' +
      '<button class="icon-btn" id="themeBtn" aria-label="Toggle theme" title="Toggle light / dark">◐</button>';
  }

  // ---- Theme toggle (persist with safe fallback) ----
  function getStored(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
  function setStored(k,v){ try { localStorage.setItem(k,v); } catch(e){} }
  var saved = getStored("cv-theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);
  var themeBtn = document.getElementById("themeBtn");
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var cur = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", cur);
    setStored("cv-theme", cur);
    window.dispatchEvent(new CustomEvent("cv-theme-change", { detail: cur }));
  });

  // ---- Mobile menu ----
  var menuBtn = document.getElementById("menuBtn");
  var backdrop = document.getElementById("backdrop");
  function closeMenu(){ if(sb) sb.classList.remove("open"); if(backdrop) backdrop.classList.remove("show"); }
  if (menuBtn) menuBtn.addEventListener("click", function(){ if(sb) sb.classList.toggle("open"); if(backdrop) backdrop.classList.toggle("show"); });
  if (backdrop) backdrop.addEventListener("click", closeMenu);

  // ---- Title ----
  if (PAGE.title) document.title = PAGE.title + " · CV Study";

  // ---- MathJax ----
  window.MathJax = {
    tex: { inlineMath: [["\\(", "\\)"]], displayMath: [["\\[", "\\]"]] },
    svg: { fontCache: "global", scale: 0.98 },
    options: { skipHtmlTags: ["script", "noscript", "style", "textarea", "pre", "code"] },
    startup: { typeset: true }
  };
  var mj = document.createElement("script");
  mj.src = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-svg.min.js";
  mj.async = true; mj.id = "MathJax-script";
  document.head.appendChild(mj);

  // ---- Inline SVG diagrams (self-initialising) ----
  if (!window.CVDiagrams) {
    var dg = document.createElement("script");
    dg.src = "assets/diagrams.js"; dg.async = true;
    document.head.appendChild(dg);
  } else { window.CVDiagrams.initAll(); }

  // ---- Auto-init demos after DOM + demos.js ready ----
  function initDemos() {
    if (window.CVDemos && typeof window.CVDemos.initAll === "function") {
      window.CVDemos.initAll();
    }
  }
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(initDemos, 0);
  } else {
    document.addEventListener("DOMContentLoaded", initDemos);
  }
})();
