/* Pokédex Pros — game logic and screens. Everything is saved on the device (localStorage). */
(function () {
  "use strict";
  const D = window.PP_DATA, PP = window.PP;
  const $ = function (s) { return document.querySelector(s); };
  const $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  const esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  const fmt = function (n) { return Math.round(n).toLocaleString("en-AU"); };

  const DIFFS = {
    easy:   { label: "Easy",   time: 30, hearts: 5, mult: 1,   blurb: "30 seconds · 5 lives · mostly well-known Pokémon", mix: [[0.75, 0.25, 0], [0.5, 0.42, 0.08]] },
    medium: { label: "Medium", time: 20, hearts: 4, mult: 1.5, blurb: "20 seconds · 4 lives · points ×1.5",                mix: [[0.35, 0.5, 0.15], [0.15, 0.5, 0.35]] },
    hard:   { label: "Hard",   time: 12, hearts: 3, mult: 2,   blurb: "12 seconds · 3 lives · points ×2",                  mix: [[0.1, 0.45, 0.45], [0, 0.3, 0.7]] }
  };
  const PER_LEVEL = 7, TEAM_MAX = 6, KEY = "pokedexPros.v1";
  const CAT_BY_ID = {};
  PP.CATS.forEach(function (c) { CAT_BY_ID[c.id] = c; });

  /* ---------- saved data ---------- */
  function fresh() {
    return {
      teams: [{ name: "Team 1", members: [] }, { name: "Team 2", members: [] }],
      scores: { easy: [], medium: [], hard: [] },
      settings: { diff: "medium", cats: PP.CATS.map(function (c) { return c.id; }), team: -1, name: "" }
    };
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s && s.teams && s.scores && s.settings) {
        const f = fresh();
        s.teams = [0, 1].map(function (i) {
          const t = s.teams[i] || f.teams[i];
          return { name: t.name || f.teams[i].name, members: (t.members || []).filter(function (n) { return PP.byName[n]; }).slice(0, TEAM_MAX) };
        });
        ["easy", "medium", "hard"].forEach(function (d) { if (!Array.isArray(s.scores[d])) s.scores[d] = []; });
        s.settings.cats = (s.settings.cats || []).filter(function (c) { return CAT_BY_ID[c]; });
        if (!DIFFS[s.settings.diff]) s.settings.diff = "medium";
        return s;
      }
    } catch (e) { /* fall through to a fresh save */ }
    return fresh();
  }
  let store = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* private mode: play on without saving */ } }

  /* ---------- question pool ---------- */
  const pool = PP.buildPool();
  const index = {};
  pool.forEach(function (q) {
    const c = index[q.cat] = index[q.cat] || {};
    const d = c[q.d] = c[q.d] || {};
    (d[q.kind] = d[q.kind] || []).push(q);
  });

  /* ---------- helpers ---------- */
  function token(name, small) {
    const m = PP.byName[name];
    const a = D.TYPE_COLORS[m.types[0]], b = D.TYPE_COLORS[m.types[1] || m.types[0]];
    return '<span class="tok' + (small ? " sm" : "") + '" style="--a:' + a + ";--b:" + b + '" aria-hidden="true">' + esc(name.slice(0, 2)) + "</span>";
  }
  function show(id) {
    $$(".screen").forEach(function (s) { s.classList.toggle("active", s.id === "s-" + id); });
    if (id === "setup") renderSetup();
    if (id === "teams") renderTeams();
    if (id === "scores") renderScores(store.settings.diff);
  }
  document.addEventListener("click", function (e) {
    const b = e.target.closest("[data-go]");
    if (b) show(b.getAttribute("data-go"));
  });

  /* ---------- setup screen ---------- */
  function renderSetup() {
    const st = store.settings;
    $("#diffList").innerHTML = Object.keys(DIFFS).map(function (k) {
      const d = DIFFS[k];
      return '<button class="diff' + (st.diff === k ? " on" : "") + '" data-diff="' + k + '" aria-pressed="' + (st.diff === k) + '"><b>' + d.label + "</b><small>" + d.blurb.split(" · ").join("<br>") + "</small></button>";
    }).join("");
    $("#catList").innerHTML = PP.CATS.map(function (c) {
      const on = st.cats.indexOf(c.id) >= 0;
      return '<button class="cat' + (on ? " on" : "") + '" data-cat="' + c.id + '" aria-pressed="' + on + '"><span class="ic">' + (on ? "✓" : c.icon) + "</span><span><b>" + c.name + "</b><small>" + c.blurb + "</small></span></button>";
    }).join("");
    if (st.team >= 0 && !store.teams[st.team].members.length) st.team = -1;
    let html = '<button class="tp' + (st.team === -1 ? " on" : "") + '" data-team="-1"><b>No team</b><em>Go it alone</em></button>';
    store.teams.forEach(function (t, i) {
      const has = t.members.length > 0;
      html += '<button class="tp' + (st.team === i ? " on" : "") + '" data-team="' + i + '"><b>' + esc(t.name) + "</b>" +
        (has ? '<span class="mini">' + t.members.map(function (n) { return token(n, true); }).join("") + "</span>" : "<em>Empty — tap to build it</em>") + "</button>";
    });
    $("#teamPick").innerHTML = html;
    $("#startBtn").disabled = st.cats.length === 0;
    $("#startBtn").textContent = st.cats.length ? "Start" : "Pick at least one category";
  }
  $("#s-setup").addEventListener("click", function (e) {
    const st = store.settings;
    let b;
    if ((b = e.target.closest("[data-diff]"))) st.diff = b.getAttribute("data-diff");
    else if ((b = e.target.closest("[data-cat]"))) {
      const id = b.getAttribute("data-cat"), i = st.cats.indexOf(id);
      if (i >= 0) st.cats.splice(i, 1); else st.cats.push(id);
    } else if ((b = e.target.closest("[data-team]"))) {
      const t = +b.getAttribute("data-team");
      if (t >= 0 && !store.teams[t].members.length) { openEditor(t, "setup"); return; }
      st.team = t;
    } else if (e.target.id === "catAll") st.cats = PP.CATS.map(function (c) { return c.id; });
    else if (e.target.id === "catNone") st.cats = [];
    else return;
    save(); renderSetup();
  });

  /* ---------- game ---------- */
  let g = null, tick = null;

  function startGame() {
    const st = store.settings, cfg = DIFFS[st.diff];
    g = {
      diff: st.diff, cfg: cfg, cats: st.cats.slice(), level: 1, qn: 0, score: 0, streak: 0, best: 0, correct: 0, asked: 0,
      hearts: cfg.hearts, used: new Set(), marks: [], perfect: true,
      team: st.team >= 0 ? store.teams[st.team].members.slice() : [], teamName: st.team >= 0 ? store.teams[st.team].name : "",
      helped: {}, q: null, locked: false
    };
    show("game");
    nextQuestion();
  }
  $("#startBtn").addEventListener("click", startGame);
  $("#againBtn").addEventListener("click", startGame);

  function chooseQuestion() {
    const t = Math.min(1, (g.level - 1) / 5);
    const mix = g.cfg.mix[0].map(function (v, i) { return v + (g.cfg.mix[1][i] - v) * t; });
    const r = Math.random();
    const d = r < mix[0] ? 1 : r < mix[0] + mix[1] ? 2 : 3;
    const cat = g.cats[PP.rnd(g.cats.length)];
    const order = [d].concat([1, 2, 3].filter(function (x) { return x !== d; }).sort(function (a, b) { return Math.abs(a - d) - Math.abs(b - d); }));
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < order.length; i++) {
        const kinds = (index[cat] || {})[order[i]] || {};
        const open = Object.keys(kinds).filter(function (k) { return kinds[k].some(function (q) { return !g.used.has(q.id); }); });
        if (open.length) {
          const list = kinds[open[PP.rnd(open.length)]].filter(function (q) { return !g.used.has(q.id); });
          const q = list[PP.rnd(list.length)];
          g.used.add(q.id);
          return q;
        }
      }
      // every question in this category has been asked: allow repeats
      pool.forEach(function (q) { if (q.cat === cat) g.used.delete(q.id); });
    }
    return pool[PP.rnd(pool.length)];
  }

  function nextQuestion() {
    if (g.qn === 0) { g.marks = []; g.perfect = true; g.helped = {}; }
    g.q = chooseQuestion();
    g.locked = false;
    g.tips = {};
    const q = g.q;
    $("#qCat").innerHTML = esc(CAT_BY_ID[q.cat].name) + '<span class="pts">' + "●".repeat(q.d) + "</span>";
    $("#qText").textContent = q.q;
    $("#opts").innerHTML = PP.shuffle(q.opts).map(function (o) { return '<button class="opt" data-opt="' + esc(o) + '">' + esc(o) + "</button>"; }).join("");
    $("#bubble").classList.add("hidden");
    $("#fact").classList.add("hidden");
    $("#nextBtn").classList.add("hidden");
    $("#teamWrap").classList.toggle("hidden", !g.team.length);
    $("#s-game .scroll").scrollTop = 0;
    renderHud(); renderTeamBar();
    g.total = g.cfg.time * 1000;
    g.tEnd = Date.now() + g.total;
    clearInterval(tick);
    tick = setInterval(onTick, 100);
    onTick();
  }

  function onTick() {
    const left = Math.max(0, g.tEnd - Date.now());
    const bar = $("#timerBar");
    bar.style.transform = "scaleX(" + (left / g.total) + ")";
    bar.classList.toggle("low", left < 5000);
    if (left <= 0) answer(null);
  }

  function renderHud() {
    $("#hudLevel").textContent = g.level;
    $("#hudScore").textContent = fmt(g.score);
    $("#hudStreak").textContent = g.streak;
    let h = "";
    for (let i = 0; i < g.cfg.hearts; i++) h += '<span class="' + (i < g.hearts ? "" : "off") + '">♥</span>';
    $("#hudHearts").innerHTML = h;
    $("#hudHearts").setAttribute("aria-label", g.hearts + " lives left");
    let dots = "";
    for (let i = 0; i < PER_LEVEL; i++) dots += '<i class="' + (g.marks[i] === true ? "ok" : g.marks[i] === false ? "no" : i === g.qn ? "now" : "") + '"></i>';
    $("#qDots").innerHTML = dots;
  }

  function renderTeamBar() {
    $("#teamBar").innerHTML = g.team.map(function (n) {
      const off = g.helped[n] || g.locked;
      return '<button data-help="' + esc(n) + '"' + (off ? " disabled" : "") + ' aria-label="Ask ' + esc(n) + '">' + token(n) + "<small>" + esc(n) + "</small></button>";
    }).join("");
    const left = g.team.filter(function (n) { return !g.helped[n]; }).length;
    $("#teamLabel").textContent = left ? "Ask a teammate — " + left + " left this level" : "Your team has helped all it can this level";
  }

  // A teammate knows its own family for certain, its own types well, and guesses at the rest.
  function askHelper(name) {
    if (g.locked || g.helped[name]) return;
    const m = PP.byName[name], q = g.q, fam = PP.family(name);
    let p, line, conf;
    const sharedType = (q.tags || []).filter(function (t) { return m.types.indexOf(t) >= 0; })[0];
    if ((q.mons || []).some(function (x) { return fam.has(x); })) { p = 1; conf = "Certain"; line = "That's my own family — I know this one! It's <b>%s</b>"; }
    else if (sharedType) { p = 0.85; conf = "Pretty sure"; line = sharedType + " type is my thing. I'm pretty sure it's <b>%s</b>"; }
    else {
      p = [0, 0.7, 0.55, 0.42][q.d] + (m.types.indexOf("Psychic") >= 0 ? 0.08 : 0);
      if (p >= 0.65) { conf = "Fairly sure"; line = "Hmm… I think it's <b>%s</b>"; }
      else { conf = "Just a guess"; line = "Not really my area… my best guess is <b>%s</b>"; }
    }
    const wrongs = q.opts.filter(function (o) { return o !== q.a; });
    const say = Math.random() < p ? q.a : wrongs[PP.rnd(wrongs.length)];
    g.helped[name] = true;
    (g.tips[say] = g.tips[say] || []).push(name);
    $("#bubble").innerHTML = token(name) + "<div><span class=\"conf\">" + esc(name).toUpperCase() + " · " + conf.toUpperCase() + "</span>" + line.replace("%s", esc(say)) + "</div>";
    $("#bubble").classList.remove("hidden");
    $$("#opts .opt").forEach(function (b) {
      const names = g.tips[b.getAttribute("data-opt")];
      if (!names) return;
      b.classList.add("tip");
      b.innerHTML = esc(b.getAttribute("data-opt")) + '<span class="who">▲ ' + esc(names.join(", ")) + (names.length > 1 ? " agree" : "'s pick") + "</span>";
    });
    g.tEnd = Math.min(Date.now() + g.total, g.tEnd + 4000); // a few seconds back to read the hint
    renderTeamBar();
    $("#bubble").scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
  $("#teamBar").addEventListener("click", function (e) {
    const b = e.target.closest("[data-help]");
    if (b) askHelper(b.getAttribute("data-help"));
  });

  $("#opts").addEventListener("click", function (e) {
    const b = e.target.closest(".opt");
    if (b && !g.locked) answer(b.getAttribute("data-opt"));
  });

  function answer(choice) {
    if (g.locked) return;
    g.locked = true;
    clearInterval(tick);
    const q = g.q, left = Math.max(0, g.tEnd - Date.now()), right = choice === q.a;
    g.asked++;
    let msg;
    if (right) {
      g.streak++; g.correct++; g.best = Math.max(g.best, g.streak);
      const pts = Math.round((100 * q.d + 60 * (left / g.total) + Math.min(g.streak - 1, 5) * 20) * g.cfg.mult);
      g.score += pts;
      msg = '<b class="g">Correct! +' + fmt(pts) + "</b>" + (g.streak >= 3 ? " · " + g.streak + " in a row" : "");
    } else {
      g.streak = 0; g.hearts--; g.perfect = false;
      msg = '<b class="r">' + (choice === null ? "Out of time!" : "Not quite.") + "</b> The answer is <b>" + esc(q.a) + "</b>.";
    }
    g.marks[g.qn] = right;
    $$("#opts .opt").forEach(function (b) {
      const o = b.getAttribute("data-opt");
      b.disabled = true;
      if (o === q.a) b.classList.add("right");
      else if (o === choice) b.classList.add("wrong");
      else b.classList.add("dim");
    });
    $("#fact").innerHTML = msg + (q.fact ? "<br>" + esc(q.fact) : "");
    $("#fact").classList.remove("hidden");
    $("#bubble").classList.add("hidden");
    $("#teamWrap").classList.add("hidden");
    const nb = $("#nextBtn");
    nb.textContent = g.hearts <= 0 ? "See results" : g.qn === PER_LEVEL - 1 ? "Finish level" : "Next";
    nb.classList.remove("hidden");
    renderHud();
    $("#fact").scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  $("#nextBtn").addEventListener("click", function () {
    if (g.hearts <= 0) return endGame();
    g.qn++;
    if (g.qn >= PER_LEVEL) return levelClear();
    nextQuestion();
  });

  function levelClear() {
    const bonus = Math.round((150 * g.level + (g.perfect ? 250 : 0)) * g.cfg.mult);
    g.score += bonus;
    const healed = g.hearts < g.cfg.hearts;
    if (healed) g.hearts++;
    $("#lvTitle").textContent = (g.perfect ? "Perfect! " : "") + "Level " + g.level + " cleared";
    $("#lvBonus").textContent = "+" + fmt(bonus);
    $("#lvText").textContent = (healed ? "You won back a life. " : "") + (g.team.length ? "Your team is rested and ready to help again. " : "") + "Level " + (g.level + 1) + " will be tougher.";
    $("#overlay").classList.remove("hidden");
    renderHud();
  }
  $("#lvNext").addEventListener("click", function () {
    $("#overlay").classList.add("hidden");
    g.level++; g.qn = 0;
    nextQuestion();
  });

  $("#quitBtn").addEventListener("click", function () {
    if (window.confirm("End this game now? Your score so far will still count.")) { clearInterval(tick); endGame(); }
  });

  function endGame() {
    clearInterval(tick);
    const list = store.scores[g.diff];
    const qualifies = g.score > 0 && (list.length < 10 || g.score > list[list.length - 1].score);
    $("#overEyebrow").textContent = qualifies ? "New high score!" : "Game over";
    $("#overScore").textContent = fmt(g.score);
    $("#overSub").textContent = g.cfg.label + " · reached level " + g.level;
    $("#overStats").innerHTML = "<div><b>" + g.correct + "/" + g.asked + "</b><span>Correct</span></div><div><b>" + g.best + "</b><span>Best streak</span></div><div><b>" + g.level + "</b><span>Level</span></div>";
    $("#nameRow").classList.toggle("hidden", !qualifies);
    $("#nameInput").value = store.settings.name || "";
    const msg = $("#savedMsg");
    msg.classList.toggle("hidden", qualifies);
    msg.textContent = qualifies ? "" : list.length >= 10 ? "Score to beat for the top ten: " + fmt(list[list.length - 1].score) : "Answer at least one question to post a score.";
    show("over");
  }
  $("#saveScore").addEventListener("click", function () {
    const name = ($("#nameInput").value || "").trim().slice(0, 12) || "Trainer";
    store.settings.name = name;
    const list = store.scores[g.diff];
    const entry = { name: name, score: g.score, level: g.level, team: g.teamName, date: new Date().toISOString().slice(0, 10) };
    list.push(entry);
    list.sort(function (a, b) { return b.score - a.score; });
    list.length = Math.min(list.length, 10);
    save();
    $("#nameRow").classList.add("hidden");
    $("#savedMsg").textContent = "Saved — you're #" + (list.indexOf(entry) + 1) + " on " + g.cfg.label + ".";
    $("#savedMsg").classList.remove("hidden");
  });

  /* ---------- high scores ---------- */
  function renderScores(diff) {
    $("#scoreTabs").innerHTML = Object.keys(DIFFS).map(function (k) { return '<button data-tab="' + k + '" class="' + (k === diff ? "on" : "") + '">' + DIFFS[k].label + "</button>"; }).join("");
    const list = store.scores[diff];
    $("#scoreList").innerHTML = list.length ? list.map(function (s, i) {
      return '<li><span class="rank">' + (i + 1) + '</span><span class="who"><b>' + esc(s.name) + "</b><small>Level " + s.level + (s.team ? " · " + esc(s.team) : "") + " · " + esc(s.date) + '</small></span><span class="pts">' + fmt(s.score) + "</span></li>";
    }).join("") : '<li class="nothing">No ' + DIFFS[diff].label + " scores yet. Be the first.</li>";
  }
  $("#scoreTabs").addEventListener("click", function (e) {
    const b = e.target.closest("[data-tab]");
    if (b) renderScores(b.getAttribute("data-tab"));
  });

  /* ---------- teams ---------- */
  function renderTeams() {
    $("#teamCards").innerHTML = store.teams.map(function (t, i) {
      let cells = "";
      for (let k = 0; k < TEAM_MAX; k++) {
        const n = t.members[k];
        cells += '<div class="member">' + (n ? token(n) + "<small>" + esc(n) + "</small>" : '<div class="empty"></div>') + "</div>";
      }
      return '<div class="tcard"><div class="tcard-head"><b>' + esc(t.name) + '</b><button class="btn primary small" data-edit="' + i + '">' + (t.members.length ? "Edit" : "Build") + '</button></div><div class="members">' + cells + "</div></div>";
    }).join("");
  }
  $("#teamCards").addEventListener("click", function (e) {
    const b = e.target.closest("[data-edit]");
    if (b) openEditor(+b.getAttribute("data-edit"), "teams");
  });

  let draft = null;
  function openEditor(i, backTo) {
    draft = { i: i, backTo: backTo, name: store.teams[i].name, members: store.teams[i].members.slice() };
    $("#teamName").value = draft.name;
    $("#search").value = "";
    $("#typeFilter").innerHTML = '<option value="">All types</option>' + D.TYPES.map(function (t) { return "<option>" + t + "</option>"; }).join("");
    show("edit");
    renderSlots(); renderGrid();
  }
  function renderSlots() {
    let h = "";
    for (let k = 0; k < TEAM_MAX; k++) {
      const n = draft.members[k];
      h += n ? '<button data-rm="' + esc(n) + '" aria-label="Remove ' + esc(n) + '">' + token(n) + "</button>" : '<div class="empty"></div>';
    }
    $("#slots").innerHTML = h;
  }
  function renderGrid() {
    const s = $("#search").value.trim().toLowerCase(), t = $("#typeFilter").value;
    $("#monGrid").innerHTML = D.MONS.filter(function (m) {
      return (!s || m.name.toLowerCase().indexOf(s) >= 0) && (!t || m.types.indexOf(t) >= 0);
    }).map(function (m) {
      const on = draft.members.indexOf(m.name) >= 0;
      return '<button class="mon' + (on ? " on" : "") + '" data-mon="' + esc(m.name) + '" aria-pressed="' + on + '" title="' + esc(m.types.join(" / ")) + '">' + token(m.name) + "<small>" + esc(m.name) + "</small></button>";
    }).join("") || '<p class="hint">No Pokémon match that search.</p>';
  }
  function toggleMember(name) {
    const i = draft.members.indexOf(name);
    if (i >= 0) draft.members.splice(i, 1);
    else if (draft.members.length < TEAM_MAX) draft.members.push(name);
    else return;
    renderSlots();
    $$("#monGrid .mon").forEach(function (b) {
      const on = draft.members.indexOf(b.getAttribute("data-mon")) >= 0;
      b.classList.toggle("on", on); b.setAttribute("aria-pressed", on);
    });
  }
  $("#monGrid").addEventListener("click", function (e) { const b = e.target.closest("[data-mon]"); if (b) toggleMember(b.getAttribute("data-mon")); });
  $("#slots").addEventListener("click", function (e) { const b = e.target.closest("[data-rm]"); if (b) toggleMember(b.getAttribute("data-rm")); });
  $("#search").addEventListener("input", renderGrid);
  $("#typeFilter").addEventListener("change", renderGrid);
  $("#editBack").addEventListener("click", function () { show(draft.backTo); });
  $("#editSave").addEventListener("click", function () {
    store.teams[draft.i] = { name: $("#teamName").value.trim().slice(0, 16) || "Team " + (draft.i + 1), members: draft.members.slice() };
    if (draft.backTo === "setup" && draft.members.length) store.settings.team = draft.i;
    save();
    show(draft.backTo);
  });

  /* ---------- offline support ---------- */
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }
})();
