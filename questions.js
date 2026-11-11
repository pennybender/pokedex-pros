/* Pokédex Pros — turns the raw data into a pool of multiple-choice questions. */
(function (g) {
  "use strict";
  const D = g.PP_DATA;

  const CATS = [
    { id: "types", name: "Types", icon: "◆", blurb: "What type is it?" },
    { id: "evolution", name: "Evolution", icon: "➜", blurb: "Who evolves into what, and how" },
    { id: "matchups", name: "Type Matchups", icon: "⚔", blurb: "Strengths, weaknesses, immunities" },
    { id: "pokedex", name: "Pokédex Entries", icon: "#", blurb: "Species names and numbers" },
    { id: "regions", name: "Regions & Places", icon: "⌖", blurb: "Home regions, first partners, towns" },
    { id: "trainers", name: "Gyms & Trainers", icon: "★", blurb: "Leaders, Champions, villains" },
    { id: "moves", name: "Moves & Items", icon: "✦", blurb: "Moves, Abilities, items, battle rules" },
    { id: "lore", name: "Legends & Lore", icon: "☾", blurb: "Myths, stories and record-holders" }
  ];

  const rnd = function (n) { return Math.floor(Math.random() * n); };
  const shuffle = function (a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  };
  // n distinct items from arr that pass ok() and are not in the avoid list
  const pick = function (arr, n, ok, avoid) {
    const out = [];
    const pool = shuffle(arr);
    for (let i = 0; i < pool.length && out.length < n; i++) {
      const x = pool[i];
      if (avoid && avoid.indexOf(x) >= 0) continue;
      if (out.indexOf(x) >= 0) continue;
      if (ok && !ok(x)) continue;
      out.push(x);
    }
    return out;
  };

  const byName = {};
  const kids = {};
  D.MONS.forEach(function (m) { byName[m.name] = m; });
  D.MONS.forEach(function (m) { if (m.from && byName[m.from]) (kids[m.from] = kids[m.from] || []).push(m.name); });

  const famCache = {};
  function family(name) {
    if (famCache[name]) return famCache[name];
    let root = name;
    while (byName[root] && byName[root].from && byName[byName[root].from]) root = byName[root].from;
    const set = new Set();
    (function walk(n) { set.add(n); (kids[n] || []).forEach(walk); })(root);
    set.forEach(function (n) { famCache[n] = set; });
    return set;
  }

  const fame = function (m) { return m.gen === 1 ? 1 : 2; };
  const typeLabel = function (m) { return m.types.join(" / "); };
  const dexNo = function (n) { return "#" + String(n).padStart(n > 999 ? 4 : 3, "0"); };
  const levelOf = function (how) { const x = /^L(\d+)$/.exec(how || ""); return x ? +x[1] : null; };

  function howGroup(how) {
    if (/friendship/i.test(how)) return "friend";
    if (/traded|trading/i.test(how)) return "trade";
    if (/level 20/i.test(how)) return "tyrogue";
    return how;
  }

  function buildPool() {
    const pool = [];
    const add = function (cat, kind, d, q, a, wrong, tags, mons, fact) {
      const w = [];
      (wrong || []).forEach(function (x) { if (x !== a && w.indexOf(x) < 0) w.push(x); });
      if (w.length < 3) return;
      pool.push({ cat: cat, kind: kind, d: Math.max(1, Math.min(3, d)), q: q, a: a, opts: shuffle([a].concat(w.slice(0, 3))), tags: tags || [], mons: mons || [], fact: fact || "" });
    };
    const names = D.MONS.map(function (m) { return m.name; });

    // similar-looking wrong Pokémon: share a type, not in the same family
    const lookalikes = function (m, extraOk) {
      const fam = family(m.name);
      const ok = function (n) { return !fam.has(n) && (!extraOk || extraOk(byName[n])); };
      const near = pick(names, 3, function (n) {
        const o = byName[n];
        return ok(n) && Math.abs(o.gen - m.gen) <= 1 && o.types.some(function (t) { return m.types.indexOf(t) >= 0; });
      });
      return near.concat(pick(names, 3, ok, near)).slice(0, 3);
    };

    D.MONS.forEach(function (m) {
      const f = fame(m);

      /* ---- Types ---- */
      if (m.types.length === 1) {
        add("types", "single", f, "What type is " + m.name + "?", m.types[0], pick(D.TYPES, 3, null, m.types), m.types, [m.name]);
      } else {
        const t1 = m.types[0], t2 = m.types[1];
        const same = function (a, b) { return (a === t1 && b === t2) || (a === t2 && b === t1); };
        const wrong = [];
        let guard = 0;
        while (wrong.length < 3 && guard++ < 60) {
          let a = t1, b = t2;
          if (wrong.length === 0) b = pick(D.TYPES, 1, null, [t1, t2])[0];
          else if (wrong.length === 1) a = pick(D.TYPES, 1, null, [t1, t2])[0];
          else { const two = pick(D.TYPES, 2); a = two[0]; b = two[1]; }
          const s = a + " / " + b;
          if (a !== b && !same(a, b) && wrong.indexOf(s) < 0 && wrong.indexOf(b + " / " + a) < 0) wrong.push(s);
        }
        add("types", "dual", f + 1, "Which two types does " + m.name + " have?", typeLabel(m), wrong, m.types, [m.name]);
      }

      /* ---- Evolution ---- */
      const ch = kids[m.name] || [];
      ch.forEach(function (c) {
        const child = byName[c];
        add("evolution", "into", f, ch.length > 1 ? "Which of these can " + m.name + " evolve into?" : "What does " + m.name + " evolve into?",
          c, lookalikes(child), m.types.concat(child.types), [m.name, c]);
      });
      if (m.from && byName[m.from]) {
        const par = byName[m.from];
        add("evolution", "from", f, "Which Pokémon evolves into " + m.name + "?", par.name, lookalikes(par), m.types.concat(par.types), [m.name, par.name]);
        const lv = levelOf(m.how);
        if (lv) {
          const offs = shuffle([-12, -8, -6, -4, -2, 2, 4, 6, 8, 12]);
          const wrong = [];
          offs.forEach(function (o) { if (lv + o >= 5 && wrong.length < 3) wrong.push("Level " + (lv + o)); });
          add("evolution", "level", f + 1, "At what level does " + par.name + " evolve into " + m.name + "?", "Level " + lv, wrong, m.types, [m.name, par.name]);
        } else if (m.how) {
          const grp = howGroup(m.how);
          const others = [];
          D.MONS.forEach(function (o) {
            if (o.how && !levelOf(o.how) && howGroup(o.how) !== grp && others.indexOf(o.how) < 0) others.push(o.how);
          });
          // never offer two wrong answers from the same group (e.g. two kinds of trade)
          const wrong = [], seen = {};
          shuffle(others).forEach(function (h) { const k = howGroup(h); if (!seen[k] && wrong.length < 3) { seen[k] = 1; wrong.push(h); } });
          add("evolution", "method", f + 1, "How does " + par.name + " evolve into " + m.name + "?", m.how, wrong, m.types, [m.name, par.name]);
        }
      }

      /* ---- Pokédex ---- */
      if (m.cat) {
        add("pokedex", "who", f, "Which Pokémon is known as the " + m.cat + " Pokémon?", m.name,
          lookalikes(m, function (o) { return o.cat !== m.cat; }), m.types, [m.name]);
        const cats = [];
        D.MONS.forEach(function (o) { if (o.cat && o.cat !== m.cat && cats.indexOf(o.cat) < 0) cats.push(o.cat); });
        add("pokedex", "species", f + 1, "The Pokédex calls " + m.name + " the “_____ Pokémon”. What fills the blank?", m.cat, pick(cats, 3), m.types, [m.name]);
      }
      const numWrong = [];
      shuffle([-9, -6, -4, -3, -2, -1, 1, 2, 3, 4, 6, 9]).forEach(function (o) { if (m.n + o > 0 && numWrong.length < 3) numWrong.push(dexNo(m.n + o)); });
      add("pokedex", "number", 3, "What is " + m.name + "'s National Pokédex number?", dexNo(m.n), numWrong, m.types, [m.name]);
      const closest = D.MONS.filter(function (o) { return o !== m && Math.abs(o.n - m.n) <= 12; }).map(function (o) { return o.name; });
      if (closest.length >= 3) add("pokedex", "bynumber", f + 1, "Which Pokémon is " + dexNo(m.n) + " in the National Pokédex?", m.name, pick(closest, 3), m.types, [m.name]);

      /* ---- Regions ---- */
      add("regions", "home", f, "In which region was " + m.name + " first discovered?", m.region, pick(D.REGIONS, 3, null, [m.region]), m.types, [m.name]);
    });

    /* ---- Types: spot the type ---- */
    D.TYPES.forEach(function (t) {
      [1, 2].forEach(function (tier) {
        const has = D.MONS.filter(function (m) { return m.types.indexOf(t) >= 0 && (tier === 1 ? m.gen === 1 : m.gen > 1); });
        const hasnt = D.MONS.filter(function (m) { return m.types.indexOf(t) < 0 && (tier === 1 ? m.gen === 1 : true); }).map(function (m) { return m.name; });
        shuffle(has).slice(0, 5).forEach(function (m) {
          add("types", "spot", tier, "Which of these Pokémon is " + (/^[AEIOU]/.test(t) ? "an " : "a ") + t + " type?", m.name, pick(hasnt, 3), [t], [m.name]);
        });
      });
    });

    /* ---- Type matchups ---- */
    const basics = ["Fire", "Water", "Grass", "Electric", "Ground", "Flying", "Rock", "Ice"];
    D.TYPES.forEach(function (atk) {
      const sup = D.CHART[atk][0], nve = D.CHART[atk][1], none = D.CHART[atk][2];
      sup.forEach(function (def) {
        const d = basics.indexOf(atk) >= 0 && basics.indexOf(def) >= 0 ? 1 : 2;
        add("matchups", "strong", d, atk + "-type moves are super effective against which of these types?", def, pick(D.TYPES, 3, null, sup), [atk, def]);
        const beats = D.TYPES.filter(function (x) { return D.CHART[x][0].indexOf(def) >= 0; });
        add("matchups", "weak", d, "Which of these types is super effective against " + def + "-type Pokémon?", atk, pick(D.TYPES, 3, null, beats), [atk, def]);
      });
      nve.forEach(function (def) {
        add("matchups", "resist", 3, atk + "-type moves are NOT very effective against which of these types?", def, pick(D.TYPES, 3, null, nve.concat(none)), [atk, def]);
      });
      none.forEach(function (def) {
        add("matchups", "immune", 2, atk + "-type moves have no effect at all on which type?", def, pick(D.TYPES, 3, null, none), [atk, def]);
        const blockers = D.TYPES.filter(function (x) { return D.CHART[x][2].indexOf(def) >= 0; });
        add("matchups", "immune", 2, def + "-type Pokémon are completely immune to which type of move?", atk, pick(D.TYPES, 3, null, blockers), [atk, def]);
      });
    });
    const mult = function (atk, m) {
      return m.types.reduce(function (x, t) {
        const c = D.CHART[atk];
        return x * (c[0].indexOf(t) >= 0 ? 2 : c[1].indexOf(t) >= 0 ? 0.5 : c[2].indexOf(t) >= 0 ? 0 : 1);
      }, 1);
    };
    D.MONS.forEach(function (m) {
      if (m.types.length < 2) return;
      const four = D.TYPES.filter(function (a) { return mult(a, m) === 4; });
      if (!four.length) return;
      const a = four[rnd(four.length)];
      add("matchups", "double", 3, m.name + " is " + typeLabel(m) + ". Which type of move does 4× damage to it?", a,
        pick(D.TYPES, 3, function (x) { return mult(x, m) < 4; }), m.types.concat([a]), [m.name]);
    });

    /* ---- Regions: first partners, professors, cities ---- */
    const starterTypes = ["Grass", "Fire", "Water"];
    Object.keys(D.STARTERS).forEach(function (region) {
      D.STARTERS[region].forEach(function (name, i) {
        const others = Object.keys(D.STARTERS).filter(function (r) { return r !== region; }).map(function (r) { return D.STARTERS[r][i]; });
        add("regions", "partner", region === "Kanto" ? 1 : 2, "Which " + starterTypes[i] + "-type Pokémon can a new Trainer choose as their first partner in " + region + "?",
          name, pick(others, 3), [starterTypes[i]], [name]);
      });
    });
    const profs = Object.keys(D.PROFESSORS).map(function (r) { return D.PROFESSORS[r]; });
    Object.keys(D.PROFESSORS).forEach(function (region) {
      const p = D.PROFESSORS[region];
      add("regions", "professor", region === "Kanto" ? 1 : 2, "Who is the Pokémon Professor of the " + region + " region?", p, pick(profs, 3, null, [p]));
      add("regions", "professor", region === "Kanto" ? 1 : 3, p + " studies Pokémon in which region?", region, pick(Object.keys(D.PROFESSORS), 3, null, [region]));
    });

    /* ---- Gyms ---- */
    const gymRegions = ["Kanto", "Johto", "Hoenn", "Sinnoh"];
    D.GYMS.forEach(function (gym) {
      const leader = gym[0], type = gym[1], city = gym[2], region = gym[3], badge = gym[4];
      const kanto = region === "Kanto";
      const verb = leader.indexOf("&") >= 0 ? " specialise" : " specialises";
      add("trainers", "gymtype", kanto ? 1 : 2, "Gym Leader " + leader + verb + " in which type?", type, pick(D.TYPES, 3, null, [type]), [type]);
      const cities = D.GYMS.filter(function (o) { return o[3] === region && o[2] !== city; }).map(function (o) { return o[2]; });
      add("trainers", "gymcity", kanto ? 2 : 3, "Where is Gym Leader " + leader + "'s Gym?", city, pick(cities, 3), [type]);
      const leaders = D.GYMS.filter(function (o) { return o[3] === region && o[0] !== leader; }).map(function (o) { return o[0]; });
      add("trainers", "gymwho", kanto ? 1 : 3, "Who is the Gym Leader of " + city + "?", leader, pick(leaders, 3), [type]);
      add("regions", "city", kanto ? 2 : 3, city + " is in which region?", region, pick(gymRegions, 3, null, [region]), [type]);
      if (badge) {
        const badges = D.GYMS.filter(function (o) { return o[4] && o[4] !== badge; }).map(function (o) { return o[4]; });
        add("trainers", "badge", 2, "Which Badge do you earn by defeating " + leader + "?", badge, pick(badges, 3), [type]);
      }
    });

    /* ---- Moves & Abilities ---- */
    D.MOVES.forEach(function (mv) {
      add("moves", "movetype", mv[2], "What type is the move " + mv[0] + "?", mv[1], pick(D.TYPES, 3, null, [mv[1]]), [mv[1]]);
    });
    const abNames = D.ABILITIES.map(function (a) { return a[0]; });
    const abDesc = D.ABILITIES.map(function (a) { return a[1]; });
    D.ABILITIES.forEach(function (ab) {
      add("moves", "ability", ab[2], "What does the Ability " + ab[0] + " do?", ab[1], pick(abDesc, 3, null, [ab[1]]), [ab[3]]);
      add("moves", "abilityname", ab[2], "Which Ability does this? “" + ab[1] + "”", ab[0], pick(abNames, 3, null, [ab[0]]), [ab[3]]);
    });

    /* ---- Hand-written ---- */
    D.HAND.forEach(function (h) { add(h.c, "hand", h.d, h.q, h.a, h.w, h.t, h.m, h.f); });

    pool.forEach(function (q, i) { q.id = i; });
    return pool;
  }

  g.PP = { CATS: CATS, buildPool: buildPool, byName: byName, family: family, shuffle: shuffle, rnd: rnd };
})(typeof window !== "undefined" ? window : globalThis);
