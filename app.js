(() => {
  "use strict";

  // ---------- Configuración ----------
  const DURATIONS = [30, 60, 90, 120];
  const TRIGGER = 0.6;   // ~37° de inclinación para contar como "arriba" / "abajo"
  const NEUTRAL = 0.35;  // ~20°: hay que volver a la posición vertical antes del siguiente gesto
  const HOLD_MS = 900;   // tiempo vertical en la frente para arrancar solo
  const FEEDBACK_MS = 750;

  const MIX = { id: "mezcla", name: "Mezcla", emoji: "🎲", color: "#0ea5e9" };
  const CUSTOM = { id: "custom", name: "Tus palabras", emoji: "✏️", color: "#475569" };

  // ---------- Estado ----------
  const S = {
    screen: "home",
    duration: load("duration", 60),
    category: null,
    deck: [],
    current: null,
    results: [],
    endAt: 0,
    timerId: 0,
    lastTick: null,
    armed: false,
    busy: false,
    sensor: false,
    listening: false,
    facing: null,
    holdStart: 0,
    wakeLock: null,
  };

  const $ = (s) => document.querySelector(s);
  const el = {
    durations: $("#durations"), categories: $("#categories"),
    readyEmoji: $("#readyEmoji"), readyName: $("#readyName"), readyHint: $("#readyHint"),
    startBtn: $("#startBtn"), holdBar: $("#holdBar"), holdFill: $("#holdBar i"),
    countNum: $("#countNum"), timer: $("#timer"), liveScore: $("#liveScore"),
    word: $("#word"), flash: $("#flash"),
    finalScore: $("#finalScore"), resultsCat: $("#resultsCat"), resultsList: $("#resultsList"),
    customDlg: $("#customDlg"), customWords: $("#customWords"),
  };

  // ---------- Utilidades ----------
  function load(key, fallback) {
    try { const v = localStorage.getItem("charadas." + key); return v == null ? fallback : JSON.parse(v); }
    catch { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem("charadas." + key, JSON.stringify(value)); } catch { /* sin almacenamiento */ }
  }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function show(name) {
    S.screen = name;
    document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("active", s.id === name));
    if (name === "home" || name === "results") document.documentElement.style.removeProperty("--cat");
  }
  function vibrate(p) { try { navigator.vibrate && navigator.vibrate(p); } catch { /* */ } }

  // ---------- Sonido (sintetizado, sin archivos) ----------
  let audio = null;
  function initAudio() {
    if (audio) { if (audio.state === "suspended") audio.resume(); return; }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audio = new Ctx();
  }
  function tone(freq, start, dur, type = "sine", gain = 0.25) {
    if (!audio) return;
    const t = audio.currentTime + start;
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(audio.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
  const sfx = {
    ok() { tone(660, 0, 0.12, "triangle"); tone(990, 0.1, 0.22, "triangle"); },
    pass() { tone(220, 0, 0.25, "sawtooth", 0.12); },
    count() { tone(520, 0, 0.15, "square", 0.12); },
    go() { tone(880, 0, 0.35, "square", 0.14); },
    tick() { tone(1200, 0, 0.05, "square", 0.08); },
    end() { tone(440, 0, 0.25, "square", 0.15); tone(330, 0.25, 0.25, "square", 0.15); tone(220, 0.5, 0.6, "square", 0.15); },
  };

  // ---------- Sensor de inclinación ----------
  // "facing" = cuánto mira la pantalla hacia el techo (+1) o hacia el suelo (-1).
  // Con el teléfono vertical en la frente vale ~0. Se calcula a partir de beta/gamma,
  // así funciona igual en horizontal o vertical y en iOS o Android.
  function onOrientation(e) {
    if (e.beta == null || e.gamma == null) return;
    const rad = Math.PI / 180;
    const f = Math.cos(e.beta * rad) * Math.cos(e.gamma * rad);
    S.facing = S.facing == null ? f : S.facing * 0.5 + f * 0.5;
    if (!S.sensor) { S.sensor = true; document.body.classList.remove("no-sensor"); updateReadyHint(); }
    handleTilt(S.facing);
  }

  function enableSensors() {
    // Debe llamarse dentro de un toque del usuario (iOS pide permiso).
    // Se escucha siempre; si no llegan lecturas, el juego pasa a modo botones.
    const DOE = window.DeviceOrientationEvent;
    if (!DOE) return;
    if (typeof DOE.requestPermission === "function") DOE.requestPermission().catch(() => {});
    if (!S.listening) { window.addEventListener("deviceorientation", onOrientation); S.listening = true; }
  }

  function handleTilt(f) {
    if (S.screen === "ready") {
      if (Math.abs(f) < NEUTRAL) {
        if (!S.holdStart) S.holdStart = performance.now();
        const p = Math.min(1, (performance.now() - S.holdStart) / HOLD_MS);
        el.holdBar.classList.add("show");
        el.holdFill.style.width = p * 100 + "%";
        if (p >= 1) startCountdown();
      } else {
        S.holdStart = 0;
        el.holdFill.style.width = "0%";
      }
      return;
    }
    if (S.screen !== "play" || S.busy) return;
    if (!S.armed) { if (Math.abs(f) < NEUTRAL) S.armed = true; return; }
    if (f < -TRIGGER) answer(true);        // pantalla hacia el suelo → correcto
    else if (f > TRIGGER) answer(false);   // pantalla hacia el techo → pasar
  }

  // ---------- Pantalla completa / pantalla encendida ----------
  async function goImmersive() {
    try {
      const d = document.documentElement;
      if (!document.fullscreenElement && d.requestFullscreen) await d.requestFullscreen({ navigationUI: "hide" });
      if (screen.orientation && screen.orientation.lock) await screen.orientation.lock("landscape");
    } catch { /* iOS no lo permite: no pasa nada */ }
  }
  async function keepAwake() {
    try { if ("wakeLock" in navigator && !S.wakeLock) S.wakeLock = await navigator.wakeLock.request("screen"); } catch { /* */ }
  }
  function releaseAwake() {
    if (S.wakeLock) { S.wakeLock.release().catch(() => {}); S.wakeLock = null; }
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && ["ready", "countdown", "play"].includes(S.screen)) { S.wakeLock = null; keepAwake(); }
  });

  // ---------- Inicio ----------
  function renderDurations() {
    el.durations.innerHTML = "";
    DURATIONS.forEach((d) => {
      const b = document.createElement("button");
      b.className = "chip";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", String(d === S.duration));
      b.textContent = d + " s";
      b.onclick = () => { S.duration = d; save("duration", d); renderDurations(); };
      el.durations.appendChild(b);
    });
  }

  function renderCategories() {
    const all = window.CATEGORIES;
    const mixWords = all.flatMap((c) => c.words);
    const list = [...all, { ...MIX, words: mixWords }];
    el.categories.innerHTML = "";
    list.forEach((c) => el.categories.appendChild(catCard(c, c.words.length + " palabras", () => pickCategory(c))));
    const customCount = load("customWords", []).length;
    const card = catCard(CUSTOM, customCount ? customCount + " palabras" : "Crea tu lista", openCustom);
    card.classList.add("custom");
    el.categories.appendChild(card);
  }

  function catCard(c, sub, onClick) {
    const b = document.createElement("button");
    b.className = "cat-card";
    b.style.setProperty("--c", c.color);
    b.innerHTML = `<span class="emoji"></span><span class="name"></span><span class="count"></span>`;
    b.querySelector(".emoji").textContent = c.emoji;
    b.querySelector(".name").textContent = c.name;
    b.querySelector(".count").textContent = sub;
    b.onclick = onClick;
    return b;
  }

  function openCustom() {
    el.customWords.value = load("customWords", []).join("\n");
    el.customDlg.showModal();
  }
  el.customDlg.addEventListener("close", () => {
    if (el.customDlg.returnValue !== "play") return;
    const words = [...new Set(el.customWords.value.split(/\n|,/).map((w) => w.trim()).filter(Boolean))];
    save("customWords", words);
    renderCategories();
    if (words.length < 3) { alert("Escribe al menos 3 palabras."); return; }
    pickCategory({ ...CUSTOM, words });
  });

  // ---------- Flujo de partida ----------
  function pickCategory(cat) {
    // Todo esto ocurre dentro del toque: permiso del sensor, audio, pantalla completa.
    enableSensors();
    initAudio();
    goImmersive();
    keepAwake();

    S.category = cat;
    document.documentElement.style.setProperty("--cat", cat.color);
    el.readyEmoji.textContent = cat.emoji;
    el.readyName.textContent = cat.name;
    S.holdStart = 0;
    el.holdFill.style.width = "0%";
    el.holdBar.classList.remove("show");
    show("ready");
    updateReadyHint();

    // Si en 2 s no llega ninguna lectura, no hay sensor (o se negó el permiso).
    // Las lecturas que lleguen después reactivan el modo inclinación.
    setTimeout(() => { if (!S.sensor) setNoSensor(); }, 2000);
  }

  function setNoSensor() {
    if (S.sensor) return;
    document.body.classList.add("no-sensor");
    updateReadyHint();
  }

  function updateReadyHint() {
    if (S.screen !== "ready") return;
    if (S.sensor) {
      el.readyHint.textContent = "Ponlo en horizontal sobre tu frente con la pantalla hacia tus amigos. Empieza solo cuando esté derecho.";
    } else if (document.body.classList.contains("no-sensor")) {
      el.readyHint.textContent = "No se detectó el sensor de movimiento: usa los botones (o las flechas ↓ ↑ del teclado).";
    } else {
      el.readyHint.textContent = "";
    }
  }

  function startCountdown() {
    if (S.screen !== "ready") return;
    initAudio();
    show("countdown");
    let n = 3;
    const step = () => {
      if (S.screen !== "countdown") return;
      if (n === 0) { sfx.go(); vibrate(80); startRound(); return; }
      el.countNum.textContent = n;
      el.countNum.style.animation = "none";
      void el.countNum.offsetWidth;
      el.countNum.style.animation = "";
      sfx.count();
      n--;
      setTimeout(step, 1000);
    };
    step();
  }

  function startRound() {
    S.deck = shuffle(S.category.words);
    S.results = [];
    S.armed = false;
    S.busy = false;
    S.lastTick = null;
    el.liveScore.textContent = "0";
    S.endAt = performance.now() + S.duration * 1000;
    show("play");
    nextWord();
    updateTimer();
    clearInterval(S.timerId);
    S.timerId = setInterval(updateTimer, 100);
  }

  function nextWord() {
    if (!S.deck.length) { endRound(); return; }
    S.current = S.deck.pop();
    el.word.textContent = S.current;
    el.word.classList.remove("enter");
    void el.word.offsetWidth;
    el.word.classList.add("enter");
    // Sin sensor no hay que "volver a vertical".
    S.armed = !S.sensor;
  }

  function answer(correct) {
    if (S.screen !== "play" || S.busy || !S.current) return;
    S.busy = true;
    S.results.push({ word: S.current, correct });
    S.current = null;
    el.liveScore.textContent = S.results.filter((r) => r.correct).length;
    el.flash.textContent = correct ? "¡Correcto!" : "Paso";
    el.flash.className = "flash show " + (correct ? "ok" : "pass");
    correct ? sfx.ok() : sfx.pass();
    vibrate(correct ? 60 : [30, 40, 30]);
    setTimeout(() => {
      el.flash.className = "flash";
      S.busy = false;
      if (S.screen === "play") nextWord();
    }, FEEDBACK_MS);
  }

  function updateTimer() {
    const left = Math.max(0, Math.ceil((S.endAt - performance.now()) / 1000));
    el.timer.textContent = left;
    el.timer.classList.toggle("low", left <= 5);
    if (left <= 5 && left > 0 && left !== S.lastTick) { S.lastTick = left; sfx.tick(); }
    if (left === 0) endRound();
  }

  function endRound() {
    if (S.screen !== "play") return;
    clearInterval(S.timerId);
    el.flash.className = "flash";
    sfx.end();
    vibrate([200, 100, 200]);
    show("timeup");
    setTimeout(showResults, 1600);
  }

  function showResults() {
    releaseAwake();
    try { screen.orientation && screen.orientation.unlock && screen.orientation.unlock(); } catch { /* */ }
    const ok = S.results.filter((r) => r.correct).length;
    el.finalScore.textContent = ok;
    el.resultsCat.textContent = `${S.category.emoji} ${S.category.name} · ${S.results.length} jugadas`;
    el.resultsList.innerHTML = "";
    if (!S.results.length) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = "No se jugó ninguna palabra.";
      el.resultsList.appendChild(li);
    }
    S.results.forEach((r) => {
      const li = document.createElement("li");
      li.className = r.correct ? "ok" : "pass";
      li.textContent = r.word;
      el.resultsList.appendChild(li);
    });
    show("results");
  }

  function goHome() {
    clearInterval(S.timerId);
    releaseAwake();
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    show("home");
  }

  // ---------- Eventos ----------
  el.startBtn.onclick = () => { initAudio(); startCountdown(); };
  $("#okBtn").onclick = () => answer(true);
  $("#passBtn").onclick = () => answer(false);
  $("#againBtn").onclick = () => pickCategory(S.category);
  document.querySelectorAll("[data-go=home]").forEach((b) => (b.onclick = goHome));

  document.addEventListener("keydown", (e) => {
    if (S.screen === "play") {
      if (e.key === "ArrowDown" || e.key === "Enter") { e.preventDefault(); answer(true); }
      if (e.key === "ArrowUp" || e.key === " ") { e.preventDefault(); answer(false); }
      if (e.key === "Escape") goHome();
    } else if (S.screen === "ready" && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault(); startCountdown();
    }
  });

  // ---------- Arranque ----------
  renderDurations();
  renderCategories();
  if (!window.DeviceOrientationEvent) document.body.classList.add("no-sensor");
})();
