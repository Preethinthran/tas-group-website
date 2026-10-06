/* TAS Group - interaction + motion layer.
   One rAF-throttled scroll loop drives progress, header, parallax, timeline and scrollspy.
   Everything degrades to a static page with prefers-reduced-motion or no JS. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (id) { return document.getElementById(id); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var isCompact = function () { return window.innerWidth <= 1024; };

  /* restart a CSS animation class */
  function retrigger(el, cls) {
    if (!el || reduceMotion) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  /* ---------- Image fallback: never show a broken image ---------- */
  var PLACEHOLDER =
    "data:image/svg+xml," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#0B1F33"/><line x1="0" y1="620" x2="1200" y2="620" stroke="rgba(245,246,243,.25)"/><text x="80" y="700" font-family="Arial" font-size="28" letter-spacing="8" fill="#9FC3D4">TAS GROUP - MARITIME LOGISTICS</text></svg>'
    );
  document.querySelectorAll("img").forEach(function (img) {
    img.addEventListener("error", function () {
      if (img.src !== PLACEHOLDER) img.src = PLACEHOLDER;
    });
  });

  /* ---------- Mobile nav ---------- */
  var menuBtn = $("menuBtn");
  var mobileNav = $("mobileNav");
  function setNav(open) {
    mobileNav.classList.toggle("open", open);
    document.body.classList.toggle("nav-open", open);
    menuBtn.setAttribute("aria-expanded", open);
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open) {
      var first = mobileNav.querySelector("a");
      if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 380);
    }
  }
  menuBtn.addEventListener("click", function () {
    setNav(!mobileNav.classList.contains("open"));
  });
  mobileNav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { setNav(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mobileNav.classList.contains("open")) { setNav(false); menuBtn.focus(); }
  });

  /* ---------- Reveal on scroll (staggered) ---------- */
  function initReveal() {
    /* list-like items get a lightweight stagger (animation, so their own hover transitions are untouched) */
    var list = document.querySelectorAll(
      ".ops-n,.why-st,.sus-points li,.group-cos>div,.svc-item,.office-btn,.ind-panel,.quote-card,.track-card");
    list.forEach(function (el) { el.classList.add("sr"); });

    function stagger(selector, step, cap) {
      var seen = new Map();
      document.querySelectorAll(selector).forEach(function (el) {
        var p = el.parentElement;
        var n = seen.get(p) || 0;
        seen.set(p, n + 1);
        if (!el.classList.contains("rv-1") && !el.classList.contains("rv-2")) {
          el.style.setProperty("--d", Math.min(n * step, cap) + "ms");
        }
      });
    }
    stagger(".rv", 90, 360);
    stagger(".sr", 70, 420);

    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".rv,.sr").forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.06, rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll(".rv,.sr").forEach(function (el) { io.observe(el); });
  }

  /* ---------- Count-up stats ---------- */
  document.querySelectorAll(".stat-num[data-count]").forEach(function (el) {
    var target = +el.dataset.count;
    var pad = +el.dataset.pad || 0;
    var from = target > 1000 ? target - 90 : 0;
    var fmt = function (v) { var s = String(Math.round(v)); while (s.length < pad) s = "0" + s; return s; };
    if (reduceMotion || !("IntersectionObserver" in window)) { el.textContent = fmt(target); return; }
    el.textContent = fmt(from);
    var obs = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      var t0 = null, DUR = 1700;
      (function tick(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / DUR);
        var e = k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
        el.textContent = fmt(from + (target - from) * e);
        if (k < 1) requestAnimationFrame(tick);
      })(performance.now());
    }, { threshold: 0.6 });
    obs.observe(el);
  });

  /* ---------- Scroll loop: progress, header, scrollspy, parallax, timeline ---------- */
  var header = $("siteHeader");
  var progress = $("scrollProgress");
  var heroBg = document.querySelector('[data-parallax="hero"]');
  var heroContent = document.querySelector(".hero-content");
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]:not([data-parallax='hero'])"));
  var timeline = $("timeline");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".main-nav a"));
  var spySections = Array.prototype.slice.call(document.querySelectorAll("section[id]"));
  var lastY = window.scrollY, ticking = false;

  function frame() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    var max = document.documentElement.scrollHeight - vh;

    if (progress) progress.style.setProperty("--sp", max > 0 ? clamp(y / max, 0, 1).toFixed(4) : 0);
    header.classList.toggle("scrolled", y > 40);

    /* hide on scroll down, reveal on scroll up */
    var dy = y - lastY;
    if (Math.abs(dy) > 6) {
      header.classList.remove("hide");
      lastY = y;
    }
    if (y < 120) header.classList.remove("hide");

    /* scrollspy */
    var current = null;
    for (var i = 0; i < spySections.length; i++) {
      var r = spySections[i].getBoundingClientRect();
      if (r.top <= vh * 0.4 && r.bottom > vh * 0.4) { current = spySections[i].id; break; }
    }
    navLinks.forEach(function (a) {
      a.classList.toggle("active", current !== null && a.getAttribute("href") === "#" + current);
    });

    if (reduceMotion) return;

    /* hero parallax */
    if (heroBg && y < vh * 1.3) {
      heroBg.style.setProperty("--py", (y * 0.22).toFixed(1) + "px");
      if (heroContent) {
        heroContent.style.transform = "translate3d(0," + (y * 0.1).toFixed(1) + "px,0)";
        heroContent.style.opacity = clamp(1 - y / (vh * 0.85), 0, 1).toFixed(3);
      }
    }
    /* section image parallax */
    parallaxEls.forEach(function (img) {
      var box = img.parentElement.getBoundingClientRect();
      if (box.bottom < -100 || box.top > vh + 100) return;
      var off = box.top + box.height / 2 - vh / 2;
      var lim = box.height * 0.08;
      img.style.setProperty("--py", clamp(-off * 0.06, -lim, lim).toFixed(1) + "px");
    });
    /* timeline rail fills with reading position */
    if (timeline) {
      var tr = timeline.getBoundingClientRect();
      timeline.style.setProperty("--tp", clamp((vh * 0.6 - tr.top) / tr.height, 0, 1).toFixed(4));
    }
  }
  function requestFrame() {
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  }
  window.addEventListener("scroll", requestFrame, { passive: true });
  window.addEventListener("resize", requestFrame);
  frame();

  /* ---------- Timeline scrollspy: orange marks the milestone in view ---------- */
  var tlItems = document.querySelectorAll(".tl-item");
  if ("IntersectionObserver" in window && tlItems.length) {
    var tlObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          tlItems.forEach(function (x) { x.classList.remove("live"); });
          e.target.classList.add("live");
        }
      });
    }, { rootMargin: "-40% 0px -45% 0px", threshold: 0 });
    tlItems.forEach(function (el) { tlObs.observe(el); });
    tlItems[0].classList.add("live");
  }

  /* ---------- Services explorer ---------- */
  var SERVICES = [
    { no: "01", tag: "CORE", title: "Freight Forwarding",
      line: "Sea + air freight / end-to-end forwarding",
      desc: "Sea freight (FCL/LCL) and air freight, planned end-to-end - bookings, documentation, carrier coordination and door-to-door delivery across regional and global lanes.",
      route: "ORIGIN → SEA / AIR → PORT → DESTINATION",
      img: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=1200&auto=format&fit=crop",
      points: ["FCL / LCL", "Sea Freight", "Air Freight", "Door-to-Door"] },
    { no: "02", tag: "COMPLIANCE", title: "Customs Brokerage",
      line: "Declarations + duty handling / compliant release",
      desc: "Declarations, classification, duty handling and cargo release - compliance-first brokerage that keeps goods moving through Malaysian ports and airports without delay.",
      route: "ARRIVAL → DECLARATION → RELEASE",
      img: "https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=1200&auto=format&fit=crop",
      points: ["Declarations", "Duty & Permits", "Cargo Release", "Documentation"] },
    { no: "03", tag: "INLAND", title: "Transportation",
      line: "Container haulage / port-to-door trucking",
      desc: "Container haulage and trucking connecting ports to warehouses, factories and distribution centres - scheduled, tracked and coordinated with vessel and flight arrivals.",
      route: "PORT → HAULAGE → CONSIGNEE",
      img: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1200&auto=format&fit=crop",
      points: ["Container Haulage", "Trucking", "Scheduling", "Last-Mile"] },
    { no: "04", tag: "STORAGE", title: "Warehouse & Distribution",
      line: "Storage + inventory / regional distribution",
      desc: "Receiving, storage, inventory handling and regional distribution - the buffer between international arrival and customer delivery, managed as one flow.",
      route: "ARRIVAL → STORAGE → DISTRIBUTION",
      img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop",
      points: ["Warehousing", "Inventory", "Order Handling", "Distribution"] },
    { no: "05", tag: "HEAVY LIFT", title: "Project Cargo",
      line: "Heavy lift + oversized / engineered moves",
      desc: "Heavy lift and oversized cargo - route surveys, method statements, permitting, lifting supervision and marine support for industrial projects and equipment moves.",
      route: "SURVEY → PERMIT → LIFT → DELIVER",
      img: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=1200&auto=format&fit=crop",
      points: ["Heavy Lift", "Break Bulk", "Route Surveys", "Movers"] },
    { no: "06", tag: "MARINE", title: "Tug & Barge",
      line: "Harbour + coastal / marine transport",
      desc: "Coastal and harbour marine transport - tug-and-barge operations supporting bulk, project and general cargo where road delivery is impractical or uneconomical.",
      route: "JETTY → COASTAL TRANSIT → DISCHARGE",
      img: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?q=80&w=1200&auto=format&fit=crop",
      points: ["Harbour Towage", "Coastal Barge", "Bulk Support", "Marine Ops"] },
    { no: "07", tag: "AGENCY", title: "Ship Agency & Marine Services",
      line: "Port clearance + husbandry / owner representation",
      desc: "Full port agency - pre-arrival planning, clearance, husbandry, crew and owner representation - backed by a stevedoring heritage at the Malaysian waterfront.",
      route: "PRE-ARRIVAL → BERTH → SAILING",
      img: "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?q=80&w=1200&auto=format&fit=crop",
      points: ["Port Clearance", "Husbandry", "Stevedoring", "Owner Representation"] }
  ];
  var svcList = $("svcList");
  var svcVisual = $("svcVisual");
  var svcLayout = svcList.parentNode;
  var svcImg = $("svcImg");
  var svcItems = [];
  var svcCurrent = -1, svcTimer = null;

  SERVICES.forEach(function (s, i) {
    var item = document.createElement("div");
    item.className = "svc-item" + (i === 0 ? " active" : "");
    item.innerHTML =
      '<button class="svc-btn" role="tab" aria-expanded="' + (i === 0) + '">' +
      '<span class="svc-no">' + s.no + "</span>" +
      '<span><h3 style="margin:0">' + s.title + '</h3><span class="svc-line">' + s.line + "</span></span>" +
      '<span class="svc-state">' + (i === 0 ? "ACTIVE" : "+") + "</span></button>";
    svcList.appendChild(item);
    svcItems.push(item);
  });

  function paintService(i) {
    var s = SERVICES[i];
    svcImg.src = s.img; svcImg.alt = s.title;
    $("svcKicker").textContent = s.no + " / " + s.tag;
    $("svcTitle").textContent = s.title;
    $("svcDesc").textContent = s.desc;
    $("svcSpec").innerHTML = "<b>●</b>&nbsp;&nbsp;" + s.points.join(" &nbsp;•&nbsp; ");
    $("svcRoute").textContent = s.route;
  }

  /* On tablet/phone the detail opens inline under the chosen service (accordion); on desktop it stays in the sticky column */
  function placeVisual(i) {
    if (isCompact()) {
      if (svcVisual.previousElementSibling !== svcItems[i]) svcItems[i].after(svcVisual);
    } else if (svcVisual.parentNode !== svcLayout) {
      svcLayout.appendChild(svcVisual);
    }
  }

  function selectService(i, fromUser) {
    if (i === svcCurrent) return;
    var first = svcCurrent === -1;
    svcCurrent = i;
    svcItems.forEach(function (item, j) {
      var on = i === j;
      item.classList.toggle("active", on);
      item.querySelector(".svc-btn").setAttribute("aria-expanded", on);
      item.querySelector(".svc-state").textContent = on ? "ACTIVE" : "+";
    });
    placeVisual(i);
    if (reduceMotion || first) { paintService(i); return; }

    svcVisual.classList.add("swap");
    clearTimeout(svcTimer);
    svcTimer = setTimeout(function () {
      var done = function () { svcImg.onload = svcImg.onerror = null; svcVisual.classList.remove("swap"); };
      svcImg.onload = svcImg.onerror = done;
      paintService(i);
      setTimeout(done, 900);
    }, 240);

    if (fromUser && isCompact()) {
      requestAnimationFrame(function () {
        var top = svcItems[i].getBoundingClientRect().top;
        if (top < 80 || top > window.innerHeight * 0.6) {
          window.scrollTo({ top: window.scrollY + top - 90, behavior: "smooth" });
        }
      });
    }
  }
  svcItems.forEach(function (item, i) {
    item.querySelector(".svc-btn").addEventListener("click", function () { selectService(i, true); });
  });
  selectService(0);

  /* ---------- Network: chart selection with subtle pan/zoom ---------- */
  var PORTS = {
    penang:    { name: "Penang", country: "MALAYSIA - HEAD OFFICE", lat: 5.41, lon: 100.33, links: ["langkawi", "klang"],
      routes: ["r-pen-klang", "r-lgk-pen"],
      desc: "Group headquarters and maritime heartland. Ship agency, marine services, freight forwarding and customs brokerage, rooted in Butterworth / Penang port operations since 1978.",
      svc: "HEAD OFFICE / MARITIME OPERATIONS" },
    langkawi:  { name: "Langkawi", country: "MALAYSIA - MARINE SUPPORT", lat: 6.35, lon: 99.85, links: ["penang"],
      routes: ["r-lgk-pen"],
      desc: "Northern-corridor marine and agency support - vessel husbandry and coastal connectivity at the Kedah island gateway.",
      svc: "AGENCY · MARINE SUPPORT" },
    klang:     { name: "Port Klang", country: "MALAYSIA - LOGISTICS OPERATIONS", lat: 3.0, lon: 101.39, links: ["penang", "klia", "singapore"],
      routes: ["r-pen-klang", "r-klang-sg", "r-klang-klia"],
      desc: "Principal-gateway forwarding and haulage at the nation's busiest container port - FCL/LCL coordination, customs release and inland distribution.",
      svc: "FREIGHT · CUSTOMS · HAULAGE" },
    klia:      { name: "KLIA", country: "MALAYSIA - AIR CARGO", lat: 2.74, lon: 101.7, links: ["klang"],
      routes: ["r-klang-klia"],
      desc: "Air-freight operations at Kuala Lumpur International Airport for time-sensitive cargo - consolidation, clearance and onward connection to sea and land legs.",
      svc: "AIR FREIGHT OPERATIONS" },
    singapore: { name: "Singapore", country: "SINGAPORE - REGIONAL LOGISTICS", lat: 1.29, lon: 103.82, links: ["klang"],
      routes: ["r-klang-sg", "r-lane"],
      desc: "Regional transhipment connectivity and cross-border logistics with Peninsular Malaysia - linking TAS customers to global line networks.",
      svc: "REGIONAL LOGISTICS" }
  };
  var portBtns = $("portBtns");
  var mapZoom = $("mapZoom");
  var netSvg = $("netSvg");
  var portCard = document.querySelector(".port-card");
  var portReady = false;
  if (reduceMotion && netSvg && netSvg.pauseAnimations) netSvg.pauseAnimations();

  /* Responsive framing: focus the operating region on small screens */
  function fitMap() {
    if (netSvg) { netSvg.setAttribute("viewBox", "0 0 640 560"); netSvg.setAttribute("preserveAspectRatio", "xMidYMid meet"); }
  }
  fitMap();
  document.querySelectorAll(".port").forEach(function (g, i) { g.style.setProperty("--i", i); });
  Object.keys(PORTS).forEach(function (key, i) {
    var b = document.createElement("button");
    b.textContent = PORTS[key].name;
    b.setAttribute("role", "tab");
    if (i === 0) b.classList.add("on");
    b.addEventListener("click", function () { selectPort(key); });
    b.dataset.key = key;
    portBtns.appendChild(b);
  });
  function selectPort(key) {
    var p = PORTS[key];
    $("portName").textContent = p.name;
    $("portCountry").textContent = p.country;
    $("portDesc").textContent = p.desc;
    $("portSvc").textContent = p.svc;
    if (portReady) {
      ["portName", "portCountry", "portDesc", "portSvc"].forEach(function (id, n) {
        var el = $(id);
        el.style.setProperty("--i", n);
        retrigger(el, "fx-i");
      });
    }
    portBtns.querySelectorAll("button").forEach(function (b) {
      b.classList.toggle("on", b.dataset.key === key);
    });
    document.querySelectorAll(".port").forEach(function (g) {
      g.classList.toggle("selected", g.dataset.port === key);
    });
    document.querySelectorAll(".route").forEach(function (r) {
      r.classList.toggle("dim", p.routes.indexOf(r.id) === -1);
      r.classList.remove("lit");
    });
    var hasPrimary = p.routes.some(function (id) {
      var el = $(id);
      return el && el.classList.contains("primary");
    });
    if (netSvg) netSvg.classList.toggle("sig-off", !hasPrimary);
    var hq = PORTS.penang, rad = Math.PI / 180;
    var dLat = (p.lat - hq.lat) * rad, dLon = (p.lon - hq.lon) * rad;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(hq.lat * rad) * Math.cos(p.lat * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var km = 2 * 6371 * Math.asin(Math.sqrt(h));
    $("portCoord").textContent = p.lat.toFixed(2) + "°N  " + p.lon.toFixed(2) + "°E";
    $("portDist").textContent = key === "penang" ? "Head office" : "≈ " + Math.round(km / 10) * 10 + " km straight-line";
    var links = $("portLinks");
    links.innerHTML = "";
    p.links.forEach(function (lk) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = PORTS[lk].name;
      b.addEventListener("click", function () { selectPort(lk); });
      links.appendChild(b);
    });
  }
  document.querySelectorAll(".port").forEach(function (g) {
    g.addEventListener("click", function () { selectPort(g.dataset.port); });
    g.addEventListener("mouseenter", function () {
      (PORTS[g.dataset.port].routes || []).forEach(function (id) {
        var el = $(id);
        if (el) el.classList.add("lit");
      });
    });
    g.addEventListener("mouseleave", function () {
      document.querySelectorAll(".route.lit").forEach(function (el) {
        el.classList.remove("lit");
      });
    });
  });
  window.addEventListener("resize", function () {
    fitMap();
    if (window.innerWidth <= 1024 && mapZoom) mapZoom.style.transform = "";
  });
  selectPort("penang");
  portReady = true;

  /* ---------- Process line: once-only cargo-chain animation ---------- */
  var pline = $("pline");
  if (pline) {
    var plStages = pline.querySelectorAll(".pl-stage");
    var runPline = function () {
      if (reduceMotion) {
        pline.style.setProperty("--p", 100);
        plStages.forEach(function (s) { s.classList.add("on"); });
        return;
      }
      var t0 = null, DUR = 3200;
      function tick(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / DUR);
        var e = 1 - Math.pow(1 - k, 3);
        pline.style.setProperty("--p", (e * 100).toFixed(2));
        plStages.forEach(function (s, i) {
          if (e * 100 >= (i / plStages.length) * 100) s.classList.add("on");
        });
        if (k < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };
    var plObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runPline(); plObs.disconnect(); }
      });
    }, { threshold: 0.35 });
    plObs.observe(pline);
  }

  /* ---------- Multimodal ---------- */
  var MODES = {
    ocean: { k: "Sea · Ports · Marine", t: "Ocean - our home ground.",
      d: "Sea freight, port operations, ship agency, tug & barge and marine services - the capability the group was built on, now integrated with forwarding and inland delivery.",
      img: "https://images.unsplash.com/photo-1605745341112-85968b19335b?q=80&w=1400&auto=format&fit=crop",
      alt: "Ocean freight container vessel",
      list: ["FCL & LCL sea freight", "Port operations & stevedoring heritage", "Ship agency & husbandry", "Tug & barge marine transport", "Project & heavy-lift by sea"] },
    air: { k: "Air · Speed · Precision", t: "Air - when time decides.",
      d: "Air freight through KLIA for urgent, high-value and time-critical cargo - consolidation, customs clearance and seamless handover to land distribution.",
      img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1400&auto=format&fit=crop",
      alt: "Air freight aircraft in flight",
      list: ["Air freight consolidation", "KLIA operations & clearance", "Time-sensitive & high-value cargo", "Air-to-land onward distribution", "Documentation & compliance"] },
    land: { k: "Road · Storage · Delivery", t: "Land - the final promise.",
      d: "Container haulage, trucking, warehousing and express distribution - the inland leg that turns a port arrival into a delivered promise.",
      img: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1400&auto=format&fit=crop",
      alt: "Container haulage trucks on highway",
      list: ["Container haulage & trucking", "Warehousing & inventory", "Regional distribution", "Express via Bexxbay network", "Scheduled, coordinated delivery"] }
  };
  var modeTabs = document.querySelector(".mode-tabs");
  var modeBtns = modeTabs.querySelectorAll("button");
  var modeImg = $("modeImg");
  var modeTimer = null;
  var tabInd = document.createElement("span");
  tabInd.className = "tab-ind";
  modeTabs.appendChild(tabInd);
  function moveInd() {
    var on = modeTabs.querySelector("button.on");
    if (!on) return;
    tabInd.style.width = on.offsetWidth + "px";
    tabInd.style.transform = "translateX(" + on.offsetLeft + "px)";
  }
  function listHtml(m) {
    return m.list.map(function (li, i) { return '<li class="fx-i" style="--i:' + i + '">' + li + "</li>"; }).join("");
  }
  moveInd();
  window.addEventListener("resize", moveInd);
  window.addEventListener("load", moveInd);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveInd);

  modeBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      if (b.classList.contains("on")) return;
      modeBtns.forEach(function (x) { x.classList.remove("on"); x.setAttribute("aria-selected", "false"); });
      b.classList.add("on"); b.setAttribute("aria-selected", "true");
      moveInd();
      var m = MODES[b.dataset.mode];
      modeImg.classList.add("out");
      clearTimeout(modeTimer);
      modeTimer = setTimeout(function () {
        var show = function () { modeImg.onload = modeImg.onerror = null; modeImg.classList.remove("out"); };
        modeImg.onload = modeImg.onerror = show;
        modeImg.src = m.img; modeImg.alt = m.alt;
        setTimeout(show, 900);
      }, 320);
      $("modeKicker").textContent = m.k;
      $("modeTitle").textContent = m.t;
      $("modeDesc").textContent = m.d;
      $("modeList").innerHTML = listHtml(m);
      ["modeKicker", "modeTitle", "modeDesc"].forEach(function (id, n) {
        var el = $(id);
        el.style.setProperty("--i", n);
        retrigger(el, "fx-i");
      });
    });
  });
  $("modeList").innerHTML = MODES.ocean.list.map(function (li) { return "<li>" + li + "</li>"; }).join("");

  /* ---------- Forms (frontend prototype) ---------- */
  function withLoading(btn, ms, done) {
    if (reduceMotion) { done(); return; }
    btn.classList.add("loading");
    setTimeout(function () { btn.classList.remove("loading"); done(); }, ms);
  }
  var quoteForm = $("quoteForm");
  quoteForm.querySelectorAll("input,select").forEach(function (f) {
    f.addEventListener("input", function () { f.classList.remove("bad"); });
  });
  quoteForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var origin = $("qOrigin");
    var dest = $("qDest");
    var email = $("qEmail");
    var ok = true;
    [origin, dest, email].forEach(function (f) {
      var bad = !f.value.trim() || (f.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value));
      f.classList.remove("bad");
      if (bad) { void f.offsetWidth; f.classList.add("bad"); ok = false; }
    });
    if (!ok) return;
    var mode = $("qMode").value;
    var btn = quoteForm.querySelector("button[type=submit]");
    withLoading(btn, 900, function () {
      $("quoteSummary").textContent =
        "Route: " + origin.value.trim() + " → " + dest.value.trim() + " · " + mode +
        ". A TAS representative will contact " + email.value.trim() + " shortly.";
      $("formFields").style.display = "none";
      $("quoteDone").classList.add("show");
    });
  });
  $("quoteReset").addEventListener("click", function () {
    quoteForm.reset();
    $("quoteDone").classList.remove("show");
    $("formFields").style.display = "";
  });

  /* ---------- Tracker (demo routing, no fake live data) ---------- */
  $("trackForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var v = $("trackInput").value.trim();
    var r = $("trackResult");
    var btn = e.target.querySelector("button");
    r.classList.remove("show");
    withLoading(btn, 700, function () {
      if (!v) {
        r.innerHTML = "Please enter a container, booking or reference number.";
      } else {
        r.innerHTML = "<b>" + v.replace(/</g, "&lt;") + "</b> - reference noted. " +
          "Live tracking is handled by the TAS operations team: please contact your TAS representative or submit a quote enquiry and we will confirm the current status of your shipment.";
      }
      r.classList.add("show");
    });
  });

  /* ---------- Offices ---------- */
  var OFFICES = [
    { city: "Penang", ctry: "MALAYSIA", k: "HEAD OFFICE",
      role: "TAS Group of Companies - Maritime & Group Operations",
      addr: "Butterworth / Penang waterfront district<br>Penang, Malaysia" },
    { city: "Port Klang", ctry: "MALAYSIA", k: "LOGISTICS OPERATIONS",
      role: "TAS Freight Services - Forwarding, Customs & Haulage",
      addr: "Port Klang gateway zone<br>Selangor, Malaysia" },
    { city: "KLIA", ctry: "MALAYSIA", k: "AIR CARGO",
      role: "TAS Freight Services - Air Freight Operations",
      addr: "KLIA cargo district<br>Sepang, Selangor, Malaysia" },
    { city: "Langkawi", ctry: "MALAYSIA", k: "MARINE SUPPORT",
      role: "TAS Maritime - Agency & Marine Support",
      addr: "Langkawi island gateway<br>Kedah, Malaysia" },
    { city: "Singapore", ctry: "SINGAPORE", k: "REGIONAL LOGISTICS",
      role: "Regional Logistics - Transhipment & Cross-Border",
      addr: "Singapore logistics district<br>Singapore" }
  ];
  var officeList = $("officeList");
  var offIds = ["offK", "offCity", "offRole", "offAddr", "offContact"];
  OFFICES.forEach(function (o, i) {
    var b = document.createElement("button");
    b.className = "office-btn" + (i === 0 ? " on" : "");
    b.setAttribute("role", "tab");
    b.innerHTML = '<span><span class="city">' + o.city + '</span><br><span class="ctry">' + o.ctry + " · " + o.k + '</span></span><span class="go">→</span>';
    b.addEventListener("click", function () {
      officeList.querySelectorAll(".office-btn").forEach(function (x) { x.classList.remove("on"); });
      b.classList.add("on");
      $("offK").textContent = o.k;
      $("offCity").textContent = o.city;
      $("offRole").textContent = o.role;
      $("offAddr").innerHTML = o.addr;
      offIds.forEach(function (id, n) {
        var el = $(id);
        el.style.setProperty("--i", n);
        retrigger(el, "fx-i");
      });
    });
    officeList.appendChild(b);
  });

  /* ---------- Pointer effects (fine pointers only) ---------- */
  if (canHover && !reduceMotion) {
    document.addEventListener("pointermove", function (e) {
      var g = e.target.closest && e.target.closest(".glow");
      if (g) {
        var r = g.getBoundingClientRect();
        g.style.setProperty("--mx", (e.clientX - r.left) + "px");
        g.style.setProperty("--my", (e.clientY - r.top) + "px");
      }
    }, { passive: true });

    /* magnetic primary buttons */
    document.querySelectorAll(".btn-primary").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        btn.style.translate = (dx * 10).toFixed(1) + "px " + (dy * 8).toFixed(1) + "px";
      });
      btn.addEventListener("pointerleave", function () { btn.style.translate = ""; });
    });
  }

  /* ---------- Footer year ---------- */
  $("year").textContent = new Date().getFullYear();

  initReveal();
  requestFrame();
})();
