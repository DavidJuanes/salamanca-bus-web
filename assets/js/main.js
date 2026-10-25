(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Runs fn every ms, but only while el is on screen, so nothing touches the DOM off-screen during a scroll.
  function whileVisible(el, ms, fn) {
    if (reduce || !el) return;
    let timer = null;
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !timer) timer = setInterval(fn, ms);
      else if (!e.isIntersecting && timer) { clearInterval(timer); timer = null; }
    }).observe(el);
  }

  // LED board: a small simulated stop panel that counts down and rotates lines.
  const rows = document.getElementById("rows");
  if (!rows) return;
  const lines = [
    { n: "4", d: "CEMENTERIO", m: 2 },
    { n: "8", d: "VISTAHERMOSA", m: 4 },
    { n: "1", d: "BUENOS AIRES", m: 7 },
    { n: "3", d: "SAN JOSÉ", m: 8 },
    { n: "9", d: "ZURGUÉN", m: 11 },
  ];
  const clock = document.getElementById("clock");
  let minute = 2 * 60 + 2; // 14:02
  function render(flip) {
    rows.innerHTML = "";
    lines.slice(0, 4).forEach(l => {
      const r = document.createElement("div");
      r.className = "board-row" + (flip ? " flip" : "");
      const t = l.m <= 0 ? '<span class="blink">&gt;&gt;&gt;</span>' : l.m + " min";
      r.innerHTML = `<span>${l.n}</span><span class="d">${l.d}</span><span class="t">${t}</span>`;
      rows.appendChild(r);
    });
    const h = 12 + Math.floor(minute / 60), mm = String(minute % 60).padStart(2, "0");
    clock.textContent = `${h}:${mm}`;
  }
  render(false);
  whileVisible(rows, 2600, () => {
    minute++;
    lines.forEach(l => l.m--);
    const gone = lines.findIndex(l => l.m < 0);
    if (gone >= 0) { const [l] = lines.splice(gone, 1); l.m = 12 + Math.floor(Math.random() * 6); lines.push(l); }
    lines.sort((a, b) => a.m - b.m);
    render(true);
  });

  // Pinned phone: swap the screen to match the step in view.
  const shots = [...document.querySelectorAll("#screen img")];
  const dots = [...document.querySelectorAll("#dots i")];
  const screen = document.getElementById("screen");
  const steps = [...document.querySelectorAll(".step")];
  const stepsBox = document.getElementById("steps");
  const story = document.querySelector(".story");
  document.querySelectorAll(".legend span").forEach((s, k) => s.style.setProperty("--i", k));
  function show(i) {
    const which = i === 5 && clockFmt ? 6 : i;
    shots.forEach((s, k) => s.classList.toggle("on", k === which));
    dots.forEach((d, k) => d.classList.toggle("on", k === i));
    steps.forEach((s, k) => { s.classList.toggle("active", k === i); s.classList.toggle("passed", k < i); });
    screen.classList.toggle("is-dark", shots[i].classList.contains("dark"));
    const st = steps[i], dot = st.querySelector(".stop-dot");
    stepsBox.style.setProperty("--p", (st.offsetTop + dot.offsetTop + dot.offsetHeight / 2) + "px");
    story.style.setProperty("--active", getComputedStyle(st).getPropertyValue("--c"));
  }

  // Countdown in the "nearby" card; the wording comes from the page ("en %m min" / "in %m min").
  whileVisible(document.querySelector(".tick"), 3000, () => {
    document.querySelectorAll(".tick").forEach(b => {
      let m = +b.dataset.m - 1; if (m < 0) m = 15;
      b.dataset.m = m; b.textContent = m === 0 ? b.dataset.now : b.dataset.in.replace("%m", m);
    });
  });

  // "Your way": the format toggle and the phone switch together, every few seconds or on click.
  let clockFmt = false;
  const fmtStep = steps[5], seg = document.getElementById("seg");
  function setClock(v) {
    clockFmt = v;
    fmtStep.classList.toggle("fmt-clock", v);
    seg.setAttribute("aria-pressed", String(v));
    if (current === 5) show(5);
  }
  let auto = true;
  whileVisible(fmtStep, 2600, () => { if (auto) setClock(!clockFmt); });
  seg.addEventListener("click", () => { auto = false; setClock(!clockFmt); });

  // The active step is the card crossing a 1px line at the pinned phone's centre (the viewport's centre when the phone is hidden).
  // An IntersectionObserver does this off the scroll path: no layout reads on every frame.
  const phone = document.querySelector(".pin .phone");
  const cards = steps.map(s => s.querySelector(".card"));
  let current = 0, io = null;
  function watch() {
    if (io) io.disconnect();
    const r = phone.getBoundingClientRect();
    const pinTop = r.height ? parseFloat(getComputedStyle(phone.parentElement).top) || 0 : 0;
    const line = Math.round(r.height ? pinTop + r.height / 2 : innerHeight / 2);
    // The CSS route animation uses the same line, as the insets of its view timeline.
    stepsBox.style.setProperty("--lt", line + "px");
    stepsBox.style.setProperty("--lb", Math.max(0, innerHeight - line - 1) + "px");
    io = new IntersectionObserver(es => {
      es.forEach(e => {
        if (!e.isIntersecting) return;
        const k = cards.indexOf(e.target);
        if (k !== current) { current = k; show(k); }
      });
    }, { rootMargin: `-${line}px 0px -${Math.max(0, innerHeight - line - 1)}px 0px` });
    cards.forEach(c => io.observe(c));
  }
  // The route stops at the last stop, and each stretch takes the colour of the stop it leads to.
  function layoutRoute() {
    const centres = steps.map(s => { const d = s.querySelector(".stop-dot"); return s.offsetTop + d.offsetTop + d.offsetHeight / 2; });
    const end = centres[centres.length - 1];
    const colours = steps.map(s => getComputedStyle(s).getPropertyValue("--c").trim());
    const stops = [`${colours[0]} 0px`, `${colours[0]} ${centres[0]}px`];
    for (let k = 1; k < steps.length; k++) stops.push(`${colours[k]} ${centres[k - 1]}px`, `${colours[k]} ${centres[k]}px`);
    stepsBox.style.setProperty("--end", end + "px");
    stepsBox.style.setProperty("--route", `linear-gradient(180deg, ${stops.join(", ")})`);
  }
  function relayout() { layoutRoute(); watch(); show(current); }
  let resizeTimer;
  addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(relayout, 200); });
  addEventListener("load", relayout);
  document.fonts?.ready.then(relayout);
  layoutRoute();
  show(0);
  watch();

  // Screenshot viewer
  const thumbs = [...document.querySelectorAll(".shots button")];
  const big = thumbs.map(b => b.dataset.big);
  const caps = thumbs.map(b => b.querySelector("img").alt);
  const viewer = document.getElementById("viewer"), vimg = document.getElementById("vimg"), vcap = document.getElementById("vcap");
  let vi = 0;
  function open(i) { vi = (i + big.length) % big.length; vimg.src = big[vi]; vimg.alt = caps[vi]; vcap.textContent = `${caps[vi]} · ${vi + 1} / ${big.length}`;
    vimg.style.animation = "none"; vimg.offsetWidth; vimg.style.animation = ""; if (!viewer.open) viewer.showModal(); }
  thumbs.forEach(b => b.addEventListener("click", () => open(+b.dataset.i)));
  document.getElementById("vclose").onclick = () => viewer.close();
  document.getElementById("vprev").onclick = () => open(vi - 1);
  document.getElementById("vnext").onclick = () => open(vi + 1);
  viewer.addEventListener("click", e => { if (e.target === viewer || e.target.tagName === "FIGURE") viewer.close(); });
  viewer.addEventListener("keydown", e => { if (e.key === "ArrowLeft") open(vi - 1); if (e.key === "ArrowRight") open(vi + 1); });
  let x0 = null;
  viewer.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  viewer.addEventListener("touchend", e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) open(vi + (dx < 0 ? 1 : -1)); x0 = null; });
})();
