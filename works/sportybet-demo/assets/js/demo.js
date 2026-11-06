"use strict";

(() => {
  const KEY = "sporty-demo-v2";
  const stamp = () => new Date().toISOString();
  const uid = (prefix) =>
    prefix + "-" + crypto.randomUUID().slice(0, 8).toUpperCase();
  const safe = escapeHTML;
  const cents = (n) => Math.round(Number(n) * 100);
  const money = (n) => currency(n / 100);
  const number = (n) => Number.isSafeInteger(n) && Math.abs(n) < 1e13;
  const seed = () => ({
    version: 2,
    revision: 0,
    profile: null,
    session: false,
    ledger: [
      {
        id: "INITIAL-DEMO-CREDIT",
        time: stamp(),
        kind: "Demo credit",
        amount: 1000000,
        ref: "Opening demo balance",
      },
    ],
    tickets: [],
    results: {},
    games: [],
    activeGame: null,
    codes: {},
    jackpot: { round: 1, boards: [], draws: {} },
    claimed: [],
    points: 0,
    settings: {
      reduceMotion: false,
      depositLimit: 100000000,
      wagerLimit: 10000000,
      excludedUntil: 0,
    },
    messages: [],
  });
  function jackpotBoardValid(board) {
    return (
      typeof board === "object" &&
      Object.keys(board).length === 12 &&
      Object.entries(board).every(
        ([id, o]) =>
          [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(Number(id)) &&
          ["home", "draw", "away"].includes(o),
      )
    );
  }
  function validState(s) {
    return (
      s &&
      s.version === 2 &&
      Array.isArray(s.ledger) &&
      s.ledger.length > 0 &&
      s.ledger.every(
        (x) =>
          x &&
          typeof x.id === "string" &&
          number(x.amount) &&
          typeof x.kind === "string" &&
          typeof x.ref === "string" &&
          Number.isFinite(Date.parse(x.time)),
      ) &&
      s.ledger.reduce((a, x) => a + x.amount, 0) >= 0 &&
      Array.isArray(s.tickets) &&
      s.tickets.every(
        (t) =>
          t &&
          typeof t.id === "string" &&
          Array.isArray(t.picks) &&
          t.picks.every(validatePick) &&
          Number.isFinite(t.stake),
      ) &&
      (!s.profile ||
        (typeof s.profile === "object" &&
          typeof s.profile.name === "string" &&
          typeof s.profile.id === "string" &&
          s.profile.name.length <= 40 &&
          (s.profile.legacy ||
            (typeof s.profile.hash === "string" &&
              typeof s.profile.salt === "string" &&
              typeof s.profile.recoveryHash === "string")))) &&
      typeof s.session === "boolean" &&
      s.results &&
      typeof s.results === "object" &&
      !Array.isArray(s.results) &&
      Object.entries(s.results).every(
        ([id, r]) =>
          fixture(Number(id)) &&
          r &&
          Number.isSafeInteger(r.home) &&
          Number.isSafeInteger(r.away) &&
          r.home >= 0 &&
          r.away >= 0 &&
          ["home", "none", "away"].includes(r.next),
      ) &&
      s.jackpot &&
      Array.isArray(s.jackpot.boards) &&
      Number.isSafeInteger(s.jackpot.round) &&
      s.jackpot.round > 0 &&
      s.jackpot.boards.every(
        (b) =>
          b &&
          typeof b.id === "string" &&
          Number.isInteger(b.round) &&
          b.picks &&
          jackpotBoardValid(b.picks),
      ) &&
      s.jackpot.draws &&
      Object.values(s.jackpot.draws).every(
        (d) =>
          Array.isArray(d) &&
          d.length === 12 &&
          d.every((o) => ["home", "draw", "away"].includes(o)),
      ) &&
      Array.isArray(s.games) &&
      s.games.every(
        (g) =>
          g &&
          typeof g.id === "string" &&
          number(g.stake) &&
          number(g.return) &&
          typeof g.type === "string" &&
          typeof g.result === "string",
      ) &&
      (!s.activeGame ||
        (s.activeGame.type === "aviator" &&
          number(s.activeGame.stake) &&
          Number.isFinite(s.activeGame.started) &&
          Number.isFinite(s.activeGame.crash))) &&
      Array.isArray(s.claimed) &&
      (!s.favouriteGames || Array.isArray(s.favouriteGames)) &&
      (!s.messages ||
        (Array.isArray(s.messages) &&
          s.messages.every(
            (m) =>
              m &&
              typeof m.id === "string" &&
              typeof m.subject === "string" &&
              typeof m.message === "string" &&
              typeof m.time === "string",
          ))) &&
      s.settings &&
      number(s.settings.depositLimit) &&
      number(s.settings.wagerLimit) &&
      Number.isFinite(s.settings.excludedUntil) &&
      number(s.points) &&
      s.points >= 0 &&
      number(s.ledger.reduce((a, x) => a + x.amount, 0))
    );
  }
  function load() {
    try {
      const raw = storage.get(KEY);
      if (!raw) {
        const fresh = seed();
        if (Array.isArray(tickets) && tickets.length) {
          fresh.tickets = structuredClone(tickets).map((t) => ({
            ...t,
            return: t.return || 0,
          }));
          const outstanding = fresh.tickets
            .filter((t) => t.status === "Open")
            .reduce((a, t) => a + cents(t.stake), 0);
          fresh.ledger[0].amount += outstanding;
          for (const t of fresh.tickets.filter((t) => t.status === "Open"))
            fresh.ledger.unshift({
              id: "IMPORTED-" + t.id,
              time: t.created || stamp(),
              kind: "Bet stake",
              amount: -cents(t.stake),
              ref: t.id,
            });
        }
        return fresh;
      }
      const s = JSON.parse(raw);
      if (validState(s)) return s;
    } catch {}
    recovered = true;
    return seed();
  }
  let state = load();
  const balance = (s = state) => s.ledger.reduce((a, x) => a + x.amount, 0);
  const fixtureIds = () => [
    ...matches.map((_, i) => i),
    10,
    ...Object.keys(demoFixtures).map(Number),
  ];
  const meta = (id) =>
    demoFixtures[id] || {
      id,
      sport: "Football",
      league: leagueName(id),
      status: id === 10 ? "scheduled" : "live",
      time: id === 10 ? "20:00" : "45:00 HT",
      demo: false,
      teams: fixture(id),
    };
  const result = (id) => state.results[id] || null;
  const status = (id) => (result(id) ? "finished" : meta(id).status);
  const dateText = (v) => {
    const d = new Date(v);
    return Number.isNaN(d.valueOf())
      ? ""
      : d.toLocaleString("en-NG", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        });
  };
  const setLedger = (s, kind, amount, ref, id = uid("TX")) => {
    if (!number(amount)) throw Error("Unsupported amount.");
    if (s.ledger.some((t) => t.id === id)) return false;
    s.ledger.unshift({ id, time: stamp(), kind, amount, ref });
    return true;
  };
  const nigeriaDay = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const limitTotal = (s, kind) =>
    s.ledger
      .filter(
        (x) =>
          x.kind === kind &&
          nigeriaDay.format(new Date(x.time)) === nigeriaDay.format(new Date()),
      )
      .reduce((a, x) => a + Math.abs(x.amount), 0);
  function charge(s, amount, kind, ref, id) {
    if (Date.now() < s.settings.excludedUntil)
      throw Error("Demo play is paused by your responsible-play settings.");
    if (amount <= 0 || !number(amount) || balance(s) < amount)
      throw Error("Insufficient demo balance. Add demo credits from Wallet.");
    if (
      limitTotal(s, "Bet stake") +
        limitTotal(s, "Game stake") +
        limitTotal(s, "Jackpot entry") +
        amount >
      s.settings.wagerLimit
    )
      throw Error("Your daily demo wager limit has been reached.");
    setLedger(s, kind, -amount, ref, id);
  }
  let queue = Promise.resolve();
  function transact(action) {
    const work = () => {
      const current = load(),
        draft = structuredClone(current);
      const value = action(draft);
      draft.revision = (current.revision || 0) + 1;
      if (!validState(draft) || balance(draft) < 0)
        throw Error("The change could not be saved. Please try again.");
      storage.set(KEY, JSON.stringify(draft));
      state = draft;
      syncCore();
      return value;
    };
    const run = () =>
      navigator.locks
        ? navigator.locks.request("sporty-demo-wallet", work)
        : Promise.resolve().then(work);
    const next = queue.then(run, run);
    queue = next.catch(() => {});
    return next;
  }
  function syncCore() {
    tickets = state.tickets;
    account = state.profile ? { name: state.profile.name } : null;
    storage.set("sporty-tickets", JSON.stringify(tickets));
    refreshHeader();
  }
  storage.set(KEY, JSON.stringify(state));
  syncCore();
  const oldOdd = marketOdd;
  marketOdd = function (id, market, outcome, value) {
    return oldOdd(id, market, outcome, value).replace(
      "<button class=",
      `<button ${status(id) === "finished" ? "disabled " : ""}class=`,
    );
  };
  const oldToggle = togglePick;
  togglePick = function (b) {
    if (status(Number(b.dataset.id)) === "finished") {
      toast("This demo event has finished. Choose another event.");
      return;
    }
    oldToggle(b);
  };
  const allMarkets = (id) => {
    const list = demoMarketDefinitions(id).map((m) =>
      m.id === "1x2"
        ? {
            ...m,
            outcomes: m.outcomes.map(([o, v]) => [o, lookupOdd(id, "1x2", o)]),
          }
        : m,
    );
    if (id < 10)
      list.push({
        id: `next:${nextLines[id]}`,
        title: `Next goal ${nextLines[id]}`,
        group: "Goals",
        outcomes: ["home", "none", "away"].map((o, j) => [
          o,
          nextGoalOdds[id][j],
        ]),
      });
    return list;
  };

  // Hash routing makes every screen refreshable and supports browser Back/Forward.
  const aliases = {
    Sports: "home",
    Home: "home",
    Football: "sports/football",
    Games: "games",
    "Live Games": "games",
    "Live Betting": "live",
    "Instant Football": "instant-football",
    "Scheduled Virtuals": "virtuals",
    Virtuals: "virtuals",
    Jackpot: "jackpot",
    Livescore: "scores",
    Results: "results",
    Promotions: "promotions",
    "Sporty Loyalty": "loyalty",
    App: "app",
    "Open Bets": "bets",
    Me: "account",
    Settings: "settings",
  };
  let currentPath = "",
    listSport = "Football",
    listStatus = "all",
    listLeague = "All",
    listQuery = "",
    marketGroup = "All",
    betFilter = "All",
    gameFilter = "All",
    jackpotPicks = {},
    pendingOperation = null;
  let portal = null,
    homeSlot = null;
  const current = () => {
    try {
      return decodeURIComponent(location.hash.replace(/^#\/?/, "") || "home");
    } catch {
      return "not-found";
    }
  };
  function navigate(path, replace = false) {
    path = aliases[path] || path;
    if (current() === path) {
      renderPage(path);
      return;
    }
    if (replace) history.replaceState(null, "", "#/" + path);
    else history.pushState(null, "", "#/" + path);
    renderPage(path);
    scrollTo({ top: 0, behavior: motionReduced() ? "instant" : "smooth" });
  }
  const link = (path, text, i = "chevron") =>
    `<a class="page-link" href="#/${path}"><span>${text}</span>${icon(i, 16)}</a>`;
  function enhanceMount() {
    portal = document.querySelector(".betslip");
    homeSlot = portal?.parentElement;
    document.querySelectorAll(".nav-item[data-nav]").forEach((b) => {
      b.setAttribute("data-path", aliases[b.dataset.nav] || "home");
    });
    document.querySelectorAll("[data-info]").forEach((b) => {
      const name = b.dataset.info;
      const paths = {
        "About Us": "help/about",
        "Terms & Conditions": "help/terms",
        "Responsible Gaming": "settings/responsible",
        "Privacy Policy": "help/privacy",
        "Sporty Group": "help/about",
        "System Status": "help/status",
        FAQ: "help/faq",
        "Bet Builder": "help/betting",
        "Customer support": "help/support",
        "Forgot Password?": "account/recover",
        "Deactivate / Reactivate": "account/security",
      };
      if (paths[name]) b.dataset.path = paths[name];
    });
    const tag = document.createElement("div");
    tag.className = "demo-status";
    tag.setAttribute("aria-label", "Demo status");
    document.querySelector("header").after(tag);
    refreshHeader();
    if (current() !== "home") renderPage(current());
  }
  function refreshHeader() {
    const login = document.querySelector(".login-form");
    if (login) login.hidden = Boolean(state.session);
    let sessionTools = document.querySelector(".header-session");
    if (state.session && state.profile) {
      if (!sessionTools) {
        sessionTools = document.createElement("div");
        sessionTools.className = "header-session";
        (
          document.querySelector(".topbar-row") ||
          document.querySelector(".m-header")
        )?.append(sessionTools);
      }
      sessionTools.innerHTML = `<a href="#/account">${safe(state.profile.name)}</a><a href="#/wallet">${money(balance())}</a><a href="#/wallet/deposit" class="session-deposit">Add credits</a>`;
    } else sessionTools?.remove();
    document
      .querySelectorAll(".m-header .join,.m-header .login")
      .forEach((b) => (b.hidden = Boolean(state.session)));
    const tag = document.querySelector(".demo-status");
    if (tag)
      tag.innerHTML = `<div class="container"><a class="portfolio-return" href="/" aria-label="Back to portfolio">Portfolio</a><span>DEMO <span class="demo-status-detail">· simulated events and funds</span></span><a href="#/wallet" aria-label="Demo wallet ${money(balance())}">${icon("wallet", 16)}<strong>${money(balance())}</strong></a><a href="#/account">${icon("user", 16)}<span>${state.session && state.profile ? safe(state.profile.name) : "My account"}</span></a></div>`;
  }
  function resetPortal() {
    if (portal && !mobile && homeSlot && portal.parentElement !== homeSlot)
      homeSlot.prepend(portal);
  }
  function showHome() {
    resetPortal();
    document.querySelector(".route-view")?.remove();
    document
      .querySelectorAll(".hero,.content,.m-main")
      .forEach((e) => (e.hidden = false));
    document.querySelectorAll("[data-route-hidden]").forEach((e) => {
      e.hidden = false;
      delete e.dataset.routeHidden;
    });
    route = "Sports";
    currentPath = "home";
    document.title = "SportyBet · Demo";
    const homeMain=document.querySelector(mobile?'.m-main':'.content');
    if(homeMain&&!homeMain.querySelector('h1')){
      const heading=document.createElement('h1');heading.className='sr-only';heading.textContent='SportyBet Nigeria — interactive demo';homeMain.prepend(heading);
    }
    renderLive();
    renderSlip();
    refreshHeader();
  }
  function enhancePageTabs(panel) {
    panel.querySelectorAll('[role="tablist"]').forEach((list, index) => {
      const tabs = [...list.querySelectorAll('[role="tab"]')];
      if (!tabs.length) return;
      const content = document.createElement("div");
      content.className = "tab-result-panel";
      content.id = "route-panel-" + index;
      content.setAttribute("role", "tabpanel");
      while (list.nextSibling) content.append(list.nextSibling);
      list.after(content);
      tabs.forEach((tab, i) => {
        tab.id = "route-tab-" + index + "-" + i;
        tab.setAttribute("aria-controls", content.id);
        tab.tabIndex = tab.getAttribute("aria-selected") === "true" ? 0 : -1;
        if (tab.tabIndex === 0) content.setAttribute("aria-labelledby", tab.id);
      });
    });
  }
  document.addEventListener(
    "keydown",
    (e) => {
      const tab = e.target.closest('.route-view [role="tab"]');
      if (!tab || !["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key))
        return;
      const list = tab.closest('[role="tablist"]'),
        lists = [...document.querySelectorAll('.route-view [role="tablist"]')],
        index = lists.indexOf(list),
        tabs = [...list.querySelectorAll('[role="tab"]')];
      const n =
        e.key === "Home"
          ? 0
          : e.key === "End"
            ? tabs.length - 1
            : (tabs.indexOf(tab) +
                (e.key === "ArrowRight" ? 1 : tabs.length - 1)) %
              tabs.length;
      e.preventDefault();
      e.stopImmediatePropagation();
      tabs[n].click();
      queueMicrotask(() =>
        document
          .querySelectorAll('.route-view [role="tablist"]')
          [index]?.querySelector('[aria-selected="true"]')
          ?.focus(),
      );
    },
    true,
  );
  document.addEventListener(
    "invalid",
    (e) => {
      const field = e.target,
        form = field.closest(".route-view form");
      if (!form) return;
      e.preventDefault();
      const now = performance.now();
      if (now - (form._lastInvalid || -100) < 30) return;
      form._lastInvalid = now;
      field.setAttribute("aria-invalid", "true");
      field.focus();
      feedback(
        form,
        field.validity.valueMissing
          ? "Complete the required fields before continuing."
          : field.name.includes("pin")
            ? "Use a six-digit demo PIN."
            : "Check the highlighted field and try again.",
      );
    },
    true,
  );
  document.addEventListener("input", (e) =>
    e.target.removeAttribute?.("aria-invalid"),
  );
  function pageShell(
    title,
    body,
    { full = false, subtitle = "", aside = true } = {},
  ) {
    if (activeDialog) closeDialog();
    if (document.querySelector(".sheet-backdrop:not([hidden])")) closeSheet();
    if (portal && !mobile) portal.remove();
    document
      .querySelectorAll(".hero,.content,.m-main")
      .forEach((e) => (e.hidden = true));
    let panel = document.querySelector(".route-view");
    if (!panel) {
      panel = document.createElement("main");
      panel.className = "route-view container";
      document.querySelector(mobile ? ".m-main" : ".hero").after(panel);
    }
    panel.innerHTML = `<nav class="demo-page-nav" aria-label="Demo pages">${[
      ["sports/football", "Sports"],
      ["live", "Live"],
      ["games", "Games"],
      ["jackpot", "Jackpot"],
      ["results", "Results"],
      ["wallet", "Wallet"],
      ["bets", "My bets"],
      ["promotions", "Promotions"],
      ["loyalty", "Loyalty"],
      ["account", "Account"],
      ["settings", "Settings"],
      ["help/faq", "Help"],
    ]
      .map(
        ([p, t]) =>
          `<a href="#/${p}" ${currentPath === p ? 'aria-current="page"' : ""}>${t}</a>`,
      )
      .join(
        "",
      )}</nav><div class="page-heading"><a href="#/home" aria-label="Back to home">${icon("arrow-left", 22)}</a><div><h1>${safe(title)}</h1>${subtitle ? `<p>${safe(subtitle)}</p>` : ""}</div><button aria-label="Search events" data-search>${icon("search", 22)}</button></div><div class="demo-page-columns ${full ? "full-page" : ""}"><section class="demo-page-content" tabindex="-1">${body}</section>${!mobile && aside ? '<aside class="page-slip-portal"></aside>' : ""}</div>`;
    enhancePageTabs(panel);
    const slot = panel.querySelector(".page-slip-portal");
    if (slot && portal) slot.append(portal);
    drawIcons();
    markPicks();
    renderSlip();
    animateContent(panel.querySelector(".demo-page-content"));
    refreshHeader();
    document.querySelectorAll(".primary-nav [data-nav]").forEach((b) => {
      const path = aliases[b.dataset.nav];
      if (path && currentPath.startsWith(path) && path !== "home")
        b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
  }
  function renderPage(path = current()) {
    currentPath = path;
    document.documentElement.dataset.route = path;
    document.title =
      path === "home"
        ? "SportyBet · Demo"
        : `${path.split("/")[0].replaceAll("-", " ")} · SportyBet Demo`;
    const parts = path.split("/"),
      main = parts[0];
    if (path === "home") {
      showHome();
      return;
    }
    if (main === "menu") {
      renderMenu();
      return;
    }
    if (main === "event") {
      renderEvent(Number(parts[1]));
      return;
    }
    if (main === "sports" || main === "live") {
      if (main === "sports") listSport = sportFromSlug(parts[1] || "football");
      else listStatus = "live";
      renderSports(main === "live");
      return;
    }
    if (main === "games") {
      parts[1] ? renderGame(parts[1]) : renderGames();
      return;
    }
    if (main === "virtuals" || main === "instant-football") {
      renderVirtual(main);
      return;
    }
    if (main === "jackpot") {
      renderJackpot(parts[1]);
      return;
    }
    if (main === "scores" || main === "results") {
      renderResults(main === "results");
      return;
    }
    if (main === "wallet") {
      renderWallet(parts[1]);
      return;
    }
    if (main === "bets") {
      renderBets(parts[1]);
      return;
    }
    if (main === "account") {
      renderAccount(parts[1]);
      return;
    }
    if (main === "promotions" || main === "loyalty") {
      renderRewards(main);
      return;
    }
    if (main === "settings") {
      renderSettings(parts[1]);
      return;
    }
    if (main === "help") {
      renderHelp(parts[1] || "faq");
      return;
    }
    if (main === "app") {
      pageShell(
        "SportyBet App",
        `<div class="page-surface"><h2>One demo, every screen</h2><p>Use this browser-based replica on your phone or desktop. Your demo balance, bets and preferences are stored on this browser.</p><div class="action-row">${link("home", "Open sports")}${link("account", "My account")}</div><p class="local-note">This replica is not an official SportyBet application. No app download is required.</p></div>`,
        { full: true },
      );
      return;
    }
    pageShell(
      "Page not found",
      emptyState(
        "This page does not exist",
        "Use the navigation to get back to sports.",
        "Back to sports",
        'data-path="home"',
      ),
      { full: true },
    );
  }
  routeView = (name) => navigate(aliases[name] || name);
  showDetails = (id) => navigate("event/" + id);
  showTickets = () => navigate("bets");
  profile = () => navigate("account");
  showSports = () => navigate("sports/football");
  const baseMount = mount;
  mount = function () {
    baseMount();
    enhanceMount();
  };
  const sportFromSlug = (slug) =>
    [
      "Football",
      "vFootball",
      "Basketball",
      "Tennis",
      "eFootball",
      "Table Tennis",
      "eBasketball",
      "Ice Hockey",
      "eIce Hockey",
      "Volleyball",
      "Cricket",
      "Handball",
    ].find(
      (s) => s.toLowerCase().replaceAll(" ", "-") === slug.toLowerCase(),
    ) || "Football";
  const sportSlug = (s) => s.toLowerCase().replaceAll(" ", "-");
  const sports = [
    "Football",
    "vFootball",
    "Basketball",
    "Tennis",
    "eFootball",
    "Table Tennis",
    "eBasketball",
    "Ice Hockey",
    "eIce Hockey",
    "Volleyball",
    "Cricket",
    "Handball",
  ];
  const panelEmpty = (t, p) =>
    `<div class="page-empty">${icon("inbox", 32)}<h2>${safe(t)}</h2><p>${safe(p)}</p><a href="#/sports/football" class="inline-action">Browse football</a></div>`;
  const field = (label, name, type = "text", value = "", attrs = "") =>
    `<label class="form-field"><span>${label}</span><input name="${name}" type="${type}" value="${safe(value)}" ${attrs}></label>`;
  const formError = () => '<p class="form-feedback" role="alert"></p>';
  const primary = (label, attrs = "") =>
    `<button class="btn-green" ${attrs}>${label}</button>`;
  function eventCard(id, compact = false) {
    const f = fixture(id),
      m = meta(id),
      r = result(id),
      finished = Boolean(r),
      score = r
        ? [r.home, r.away]
        : m.status === "scheduled"
          ? [null, null]
          : [f[2], f[3]];
    return `<article class="event-list-row"><div class="event-meta"><span class="${finished ? "event-finished" : m.status === "live" ? "event-live" : ""}">${finished ? "FT" : m.status === "live" ? "LIVE" : m.time}</span><span>${safe(m.league)}</span>${m.demo ? '<span class="demo-event-label">SIM</span>' : ""}<button data-star="${id}" aria-label="${isStarred(id) ? "Unpin" : "Pin"} ${safe(f[0])}" aria-pressed="${isStarred(id)}">${icon("star", 16)}</button></div><div class="event-list-main"><a class="event-teams" href="#/event/${id}"><span>${safe(f[0])}<strong>${score[0] ?? ""}</strong></span><span>${safe(f[1])}<strong>${score[1] ?? ""}</strong></span></a><div class="event-odds">${
      finished
        ? `<strong class="final-score">${score[0]} : ${score[1]}</strong>`
        : allMarkets(id)[0]
            .outcomes.map(([o, v]) => marketOdd(id, "1x2", o, v))
            .join("")
    }<a class="event-more" href="#/event/${id}" aria-label="All markets for ${safe(f[0])}">${icon("chevron", 18)}</a></div></div></article>`;
  }
  let favourites = readJSON("sporty-favourites", []);
  if (!Array.isArray(favourites)) favourites = [];
  const isStarred = (id) => favourites.includes(id);
  let onlyPinned = false;
  function renderSports(liveOnly = false) {
    const leagues = [
      ...new Set(
        fixtureIds()
          .filter((id) => meta(id).sport === listSport)
          .map((id) => meta(id).league),
      ),
    ];
    const ids = fixtureIds().filter(
      (id) =>
        meta(id).sport === listSport &&
        (liveOnly
          ? status(id) === "live"
          : listStatus === "all" || status(id) === listStatus) &&
        (listLeague === "All" || meta(id).league === listLeague) &&
        (!onlyPinned || isStarred(id)) &&
        (!listQuery ||
          fixture(id)
            .slice(0, 2)
            .join(" ")
            .toLowerCase()
            .includes(listQuery.toLowerCase())),
    );
    const body = `<div class="sports-layout"><nav class="sports-directory" aria-label="Sports">${sports.map((s) => `<a href="#/sports/${sportSlug(s)}" ${s === listSport ? 'aria-current="page"' : ""}>${icon(s.includes("Basket") ? "dribbble" : s === "Tennis" ? "circle-dot" : "ball", 16)}<span>${s}</span><small>${fixtureIds().filter((id) => meta(id).sport === s && status(id) !== "finished").length}</small></a>`).join("")}</nav><div class="sport-events"><div class="page-tabs" role="tablist" aria-label="Event status">${["all", "live", "scheduled", "finished"].map((s) => `<button role="tab" data-eventstatus="${s}" aria-selected="${(liveOnly ? "live" : listStatus) === s}" tabindex="${(liveOnly ? "live" : listStatus) === s ? 0 : -1}">${{ all: "All", live: "Live", scheduled: "Upcoming", finished: "Finished" }[s]}</button>`).join("")}</div><form class="event-filter" data-eventfilter><input name="query" aria-label="Filter teams" placeholder="Search teams" value="${safe(listQuery)}"><select name="league" aria-label="Competition"><option value="All">All competitions</option>${leagues.map((l) => `<option ${l === listLeague ? "selected" : ""}>${safe(l)}</option>`).join("")}</select><button aria-label="Apply event filters">${icon("search", 18)}</button><button type="button" data-pinned aria-pressed="${onlyPinned}" aria-label="Pinned events">${icon("star", 18)}</button></form><div class="competition-caption">${safe(listSport)} <span>${ids.length} events</span></div>${
      ids.length
        ? ids
            .sort((a, b) => Number(isStarred(b)) - Number(isStarred(a)))
            .map((id) => eventCard(id))
            .join("")
        : panelEmpty(
            "No matching events",
            "Change the competition or search to find more fixtures.",
          )
    }<button class="inline-action" data-reset-eventfilter>Reset filters</button></div></div>`;
    pageShell(liveOnly ? "Live Betting" : listSport, body, {
      subtitle: "Reference fixtures and simulated demo events",
    });
  }
  function renderEvent(id) {
    if (!fixture(id)) {
      pageShell(
        "Event not found",
        panelEmpty("Unknown event", "This event is not available in the demo."),
      );
      return;
    }
    const f = fixture(id),
      m = meta(id),
      r = result(id),
      groups = ["All", "Main", "Goals", "Totals"],
      markets = allMarkets(id).filter(
        (x) => marketGroup === "All" || x.group === marketGroup,
      );
    pageShell(
      f[0] + " v " + f[1],
      `<section class="event-scoreboard"><div class="scoreboard-top"><span>${safe(m.league)}</span><button data-star="${id}" aria-label="Pin event" aria-pressed="${isStarred(id)}">${icon("star", 20)}</button></div><div class="scoreboard-teams"><strong>${safe(f[0])}</strong><div><b>${r ? r.home : m.status === "live" ? f[2] : ""}<span>${m.status === "scheduled" && !r ? "VS" : ":"}</span>${r ? r.away : m.status === "live" ? f[3] : ""}</b><small>${r ? "Full time · simulated" : m.status === "live" ? "Half-time snapshot" : m.time + " · Demo schedule"}</small></div><strong>${safe(f[1])}</strong></div></section><div class="page-tabs" role="tablist" aria-label="Event detail"><button role="tab" aria-selected="true" data-event-section="markets">Markets</button><button role="tab" aria-selected="false" data-event-section="stats">Statistics</button><button role="tab" aria-selected="false" data-event-section="timeline">Timeline</button></div><div class="event-detail-section" id="event-section">${r ? `<div class="settled-notice">This demo event has finished. Bets on this fixture have been settled.</div>` : ""}<div class="market-filters">${groups.map((g) => `<button data-marketgroup="${g}" aria-pressed="${marketGroup === g}">${g}</button>`).join("")}</div><div class="market-stack">${markets.map((x) => `<details class="market-block" open><summary>${safe(x.title)}${icon("down", 16)}</summary><div class="market-outcomes">${x.outcomes.map(([o, v]) => `<div class="labelled-odd"><span>${safe(pickLabel({ id, market: x.id, outcome: o }))}</span>${marketOdd(id, x.id, o, v)}</div>`).join("")}</div></details>`).join("")}</div></div><div class="simulation-controls"><div><h3>Demo match controls</h3><p>Generate a simulated final result and settle affected demo bets.</p></div>${primary(r ? "View result" : "Simulate final result", `type="button" data-simulate="${id}" ${r ? "disabled" : ""}`)}</div>`,
      {
        subtitle:
          m.sport + " · " + (m.demo ? "Simulated event" : "Reference snapshot"),
      },
    );
  }

  function renderMenu() {
    pageShell(
      "Explore SportyBet",
      `<div class="menu-page">${[
        [
          "Sports",
          [
            ["sports/football", "Football"],
            ["live", "Live Betting"],
            ["scores", "Livescore"],
            ["results", "Results"],
            ["instant-football", "Instant Football"],
            ["virtuals", "Scheduled Virtuals"],
            ["jackpot", "Jackpot"],
          ],
        ],
        [
          "Games",
          [
            ["games", "All Games"],
            ["games/aviator", "Aviator"],
            ["games/bottle", "Spin da’ Bottle"],
            ["games/redblack", "Red Black"],
            ["games/hero", "Sporty Hero"],
          ],
        ],
        [
          "My account",
          [
            ["account", "My Profile"],
            ["wallet", "Demo Wallet"],
            ["bets", "My Bets"],
            ["promotions", "Promotions"],
            ["loyalty", "Sporty Loyalty"],
            ["settings", "Settings"],
            ["help/support", "Support"],
            ["app", "App"],
          ],
        ],
      ]
        .map(
          ([title, links]) =>
            `<section class="page-surface"><h2>${title}</h2>${links.map(([p, t]) => link(p, t)).join("")}</section>`,
        )
        .join("")}</div>`,
      { full: true, aside: false },
    );
  }
  function renderWallet(section = "overview") {
    const actions = [
      ["wallet", "Overview"],
      ["wallet/deposit", "Add credits"],
      ["wallet/withdraw", "Withdraw"],
      ["wallet/transactions", "Transactions"],
    ];
    let content = "";
    if (section === "deposit" || section === "withdraw") {
      const deposit = section === "deposit";
      content = `<div class="page-surface"><h2>${deposit ? "Add demo credits" : "Withdraw demo credits"}</h2><p>${deposit ? "Top up your simulated balance. No payment is taken." : "Remove credits from your demo balance. No bank transfer is made."}</p><form data-walletform="${section}" data-operation="${uid("OP")}">${field("Amount (NGN)", "amount", "text", "", 'inputmode="decimal" required placeholder="100.00" maxlength="12"')}<label class="form-field"><span>Demo method</span><select name="method"><option>Demo bank transfer</option><option>Demo card</option><option>Demo mobile money</option></select></label><div class="quick-amounts">${[100, 500, 1000, 5000].map((v) => `<button type="button" data-amount="${v}">${v.toLocaleString()}</button>`).join("")}</div>${formError()}${primary(deposit ? "Review top up" : "Review withdrawal")}</form></div>`;
    } else if (section === "transactions") {
      content = `<div class="page-surface"><div class="section-heading"><h2>Transaction history</h2><button class="inline-action" data-export="ledger">Export CSV</button></div><div class="ledger-list">${state.ledger.map((x) => `<button class="ledger-row" data-receipt="${safe(x.id)}"><span class="ledger-icon">${icon(x.amount >= 0 ? "arrow-down-left" : "arrow-up-right", 20)}</span><span><strong>${safe(x.kind)}</strong><small>${dateText(x.time)}</small></span><strong class="${x.amount >= 0 ? "positive" : "negative"}">${x.amount >= 0 ? "+" : "−"}${money(Math.abs(x.amount))}</strong>${icon("chevron", 16)}</button>`).join("")}</div></div>`;
    } else {
      content = `<section class="wallet-balance"><span>Available demo balance</span><strong>${money(balance())}</strong><p>Demo funds only</p><div class="action-row"><a href="#/wallet/deposit" class="btn-green">Add demo credits</a><a href="#/wallet/withdraw" class="wallet-withdraw">Withdraw</a></div></section><div class="wallet-summary"><div><span>Open demo stakes</span><strong>${currency(state.tickets.filter((t) => t.status === "Open").reduce((a, t) => a + t.stake, 0))}</strong></div><div><span>Settled demo returns</span><strong>${money(state.ledger.filter((t) => ["Bet return", "Cashout", "Game return", "Jackpot prize"].includes(t.kind)).reduce((a, t) => a + t.amount, 0))}</strong></div></div><section class="page-surface"><div class="section-heading"><h2>Recent transactions</h2><a href="#/wallet/transactions">View all</a></div>${state.ledger
        .slice(0, 5)
        .map(
          (x) =>
            `<button class="ledger-row" data-receipt="${safe(x.id)}"><span><strong>${safe(x.kind)}</strong><small>${dateText(x.time)}</small></span><strong class="${x.amount >= 0 ? "positive" : "negative"}">${x.amount >= 0 ? "+" : "−"}${money(Math.abs(x.amount))}</strong>${icon("chevron", 16)}</button>`,
        )
        .join(
          "",
        )}</section><a class="page-link" href="#/settings/responsible">Set deposit and play limits ${icon("chevron")}</a>`;
    }
    pageShell(
      "My wallet",
      `<div class="page-tabs page-tablinks">${actions.map(([p, t]) => `<a href="#/${p}" ${p === currentPath ? 'aria-current="page"' : ""}>${t}</a>`).join("")}</div>${content}`,
      { full: true, aside: false },
    );
  }
  function amountError(raw, min = 100) {
    if (!/^\d+(\.\d{1,2})?$/.test(raw))
      return "Enter a positive amount with up to two decimal places.";
    const amount = cents(raw);
    if (!number(amount) || amount < cents(min) || amount > 100000000)
      return `Amount must be between NGN ${min} and NGN 1,000,000.`;
    return "";
  }
  function receipt(id) {
    const x = state.ledger.find((t) => t.id === id);
    if (!x) return;
    openDialog(
      "Demo transaction receipt",
      `<dl class="receipt-details"><div><dt>Status</dt><dd>Completed · demo</dd></div><div><dt>Amount</dt><dd>${x.amount >= 0 ? "+" : "−"}${money(Math.abs(x.amount))}</dd></div><div><dt>Type</dt><dd>${safe(x.kind)}</dd></div><div><dt>Reference</dt><dd>${safe(x.ref)}</dd></div><div><dt>Transaction ID</dt><dd>${safe(x.id)}</dd></div><div><dt>Time</dt><dd>${dateText(x.time)}</dd></div></dl><button class="btn-green" data-close>Close receipt</button>`,
    );
  }

  function renderBets(ticketId) {
    const selected = state.tickets.find((t) => t.id === ticketId);
    if (ticketId && !selected) {
      pageShell(
        "Bet not found",
        panelEmpty("Unknown ticket", "Choose a ticket from your bet history."),
      );
      return;
    }
    if (selected) {
      const total = selected.picks.reduce((a, p) => a * p.odd, 1),
        settled = selected.status !== "Open";
      pageShell(
        "Bet details",
        `<div class="page-surface"><div class="ticket-title"><div><span>${safe(selected.id)}</span><h2>${safe(selected.status)}</h2></div><span>${dateText(selected.created)}</span></div><dl class="bet-summary"><div><dt>Stake</dt><dd>${currency(selected.stake)}</dd></div><div><dt>Total odds</dt><dd>${total.toFixed(2)}</dd></div><div><dt>${settled ? "Returned" : "Potential win"}</dt><dd>${currency(settled ? selected.return || 0 : total * selected.stake)}</dd></div></dl><div class="ticket-selections">${selected.picks
          .map((p) => {
            const r = result(p.id),
              won = r ? evaluate(p, r) : null;
            return `<a href="#/event/${p.id}" class="ticket-selection"><span class="pick-status ${won === true ? "won" : won === false ? "lost" : ""}">${icon(won === true ? "check" : won === false ? "x" : "clock", 16)}</span><div><strong>${safe(pickLabel(p))}</strong><small>${safe(fixture(p.id).slice(0, 2).join(" v "))}</small><small>${safe(marketTitle(p))}${r ? " · FT " + r.home + ":" + r.away : ""}</small></div><strong>${p.odd.toFixed(2)}</strong>${icon("chevron", 16)}</a>`;
          })
          .join(
            "",
          )}</div>${selected.status === "Open" ? `<div class="bet-detail-actions">${primary("Cash out " + currency(selected.stake * 0.7), `data-cashout="${safe(selected.id)}"`)}<button class="inline-action" data-cancel-demo="${safe(selected.id)}">Cancel demo bet and refund</button><button class="inline-action" data-settle-ticket="${safe(selected.id)}">Simulate remaining results</button></div>` : ""}<div class="action-row"><button class="inline-action" data-rebet="${safe(selected.id)}">Reuse selections</button><button class="inline-action" data-copyticket="${safe(selected.id)}">Copy ticket ID</button><a class="inline-action" href="#/bets">Back to history</a></div></div>`,
      );
      return;
    }
    const statuses = ["All", "Open", "Won", "Lost", "Cashed out", "Cancelled"],
      shown = state.tickets.filter(
        (t) => betFilter === "All" || t.status === betFilter,
      );
    pageShell(
      "My bets",
      `<div class="page-tabs" role="tablist" aria-label="Bet status">${statuses.map((s) => `<button role="tab" aria-selected="${betFilter === s}" data-betfilter="${s}">${s}</button>`).join("")}</div><div class="section-heading"><span>${shown.length} demo tickets</span><button class="inline-action" data-export="bets">Export CSV</button></div>${shown.length ? shown.map((t) => `<a class="bet-history-row" href="#/bets/${safe(t.id)}"><div><strong>${t.picks.length === 1 ? "Single" : "Multiple · " + t.picks.length + " events"}</strong><small>${dateText(t.created)} · ${safe(t.id)}</small></div><div><strong>${currency(t.stake)}</strong><span class="status-label ${t.status === "Won" ? "positive" : t.status === "Lost" ? "negative" : ""}">${safe(t.status)}</span></div>${icon("chevron", 18)}</a>`).join("") : panelEmpty("No " + (betFilter === "All" ? "bets" : betFilter.toLowerCase() + " bets"), "Build a betslip to place your first demo ticket.")}`,
      { subtitle: "Your local demo tickets and settlement history" },
    );
  }
  const oldRenderSlip = renderSlip;
  renderSlip = function () {
    oldRenderSlip();
    const body = document.querySelector("#slip-body");
    if (!body) return;
    if (slipTab === "Cashout") {
      const open = state.tickets.filter((t) => t.status === "Open");
      body.innerHTML = `<p class="local-note">Demo cashout offers are 70% of the original stake.</p>${open.length ? open.map((t) => `<div class="cashout-row"><a href="#/bets/${safe(t.id)}">${safe(t.id)}<small>${t.picks.length} selections · ${currency(t.stake)}</small></a><button class="btn-green" data-cashout="${safe(t.id)}">${currency(t.stake * 0.7)}</button></div>`).join("") : emptyState("No cashout offers", "Open demo bets will appear here.", "My bet history", 'data-path="bets"')}`;
      return;
    }
    if (picks.length) {
      const note = body.querySelector(".local-note");
      if (note)
        note.textContent = "Available demo balance: " + money(balance());
      const btn = body.querySelector("[data-place]");
      if (btn) btn.textContent = "Place demo bet";
    }
  };
  reviewBet = function () {
    if (!updateStake(true)) {
      document.querySelector("input[aria-label=Stake]")?.focus();
      return;
    }
    if (picks.some((p) => status(p.id) === "finished")) {
      toast("A selected event has finished. Remove it before placing a bet.");
      return;
    }
    if (cents(stake) > balance()) {
      openDialog(
        "Insufficient demo balance",
        `<p>Your demo balance is ${money(balance())}. Add credits or lower your stake.</p><button class="btn-green" data-path="wallet/deposit">Add demo credits</button>`,
      );
      return;
    }
    pendingOperation = {
      id: uid("BET"),
      picks: structuredClone(picks),
      stake: Number(stake),
    };
    const total = picks.reduce((a, p) => a * p.odd, 1);
    openDialog(
      "Confirm demo bet",
      `<dl class="receipt-details"><div><dt>Selections</dt><dd>${picks.length}</dd></div><div><dt>Stake</dt><dd>${currency(Number(stake))}</dd></div><div><dt>Total odds</dt><dd>${total.toFixed(2)}</dd></div><div><dt>Potential return</dt><dd>${currency(total * Number(stake))}</dd></div><div><dt>Balance after bet</dt><dd>${money(balance() - cents(stake))}</dd></div></dl><p class="local-note">Uses demo credits only. No real wager is submitted.</p><p class="form-feedback" role="alert"></p>${primary("Confirm demo bet", "data-confirmbet")}`,
    );
  };
  confirmBet = async function (button) {
    if (!pendingOperation || button.disabled) return;
    button.disabled = true;
    const op = structuredClone(pendingOperation);
    try {
      await transact((s) => {
        if (s.tickets.some((t) => t.id === op.id)) return;
        if (op.picks.some((p) => s.results[p.id] || !validatePick(p)))
          throw Error("A selected event is no longer available.");
        charge(s, cents(op.stake), "Bet stake", op.id, op.id);
        s.tickets.unshift({
          id: op.id,
          created: stamp(),
          stake: op.stake,
          picks: op.picks,
          status: "Open",
          return: 0,
        });
      });
      pendingOperation = null;
      picks = [];
      persist();
      renderSlip();
      closeDialog();
      closeSheet();
      navigate("bets/" + op.id);
      toast("Demo bet placed.");
    } catch (e) {
      const feedback = button
        .closest("dialog")
        ?.querySelector(".form-feedback");
      if (feedback) feedback.textContent = e.message;
      button.disabled = false;
    }
  };
  function evaluate(p, r) {
    const compare = (h, a, o) =>
      o === "home" ? h > a : o === "draw" ? h === a : h < a;
    if (p.market === "1x2") return compare(r.home, r.away, p.outcome);
    if (p.market === "dc")
      return p.outcome === "home-draw"
        ? r.home >= r.away
        : p.outcome === "draw-away"
          ? r.away >= r.home
          : r.home !== r.away;
    if (p.market === "btts")
      return p.outcome === "yes"
        ? r.home > 0 && r.away > 0
        : !(r.home > 0 && r.away > 0);
    if (p.market === "half-total:0.5")
      return p.outcome === "over"
        ? r.halfHome + r.halfAway > 0.5
        : r.halfHome + r.halfAway < 0.5;
    if (p.market.startsWith("totals:"))
      return p.outcome === "over"
        ? r.home + r.away > Number(p.market.split(":")[1])
        : r.home + r.away < Number(p.market.split(":")[1]);
    if (p.market === "handicap:-1")
      return compare(r.home - 1, r.away, p.outcome);
    if (p.market.startsWith("next:")) return p.outcome === r.next;
    return false;
  }
  function simulatedResult(id) {
    const n = crypto.getRandomValues(new Uint32Array(3));
    const m = meta(id),
      sport = m.sport;
    let h = n[0] % 5,
      a = n[1] % 5;
    if (sport.includes("Basketball")) {
      h = 70 + (n[0] % 51);
      a = 70 + (n[1] % 51);
      if (h === a) h++;
    } else if (["Tennis", "Table Tennis", "Volleyball"].includes(sport)) {
      const winning = sport === "Table Tennis" ? 3 : 2;
      if (n[2] % 2) {
        h = winning;
        a = n[1] % winning;
      } else {
        h = n[0] % winning;
        a = winning;
      }
    } else if (sport === "Cricket") {
      h = 100 + (n[0] % 151);
      a = 100 + (n[1] % 151);
      if (h === a) h++;
    }
    const before = fixture(id);
    if (m.status === "live" && sport === "Football") {
      h = Math.max(h, before[2]);
      a = Math.max(a, before[3]);
    }
    return {
      home: h,
      away: a,
      halfHome: Math.floor(h / 2),
      halfAway: Math.floor(a / 2),
      next:
        h + a > (before[2] || 0) + (before[3] || 0)
          ? n[2] % 2
            ? "home"
            : "away"
          : "none",
      time: stamp(),
      simulated: true,
    };
  }
  function settleTickets(s) {
    for (const t of s.tickets) {
      if (t.status !== "Open") continue;
      const outcomes = t.picks.map((p) =>
        s.results[p.id] ? evaluate(p, s.results[p.id]) : null,
      );
      if (outcomes.includes(false)) {
        t.status = "Lost";
        t.return = 0;
      } else if (outcomes.every((v) => v === true)) {
        t.status = "Won";
        t.return =
          Math.round(t.stake * t.picks.reduce((a, p) => a * p.odd, 1) * 100) /
          100;
        setLedger(s, "Bet return", cents(t.return), t.id, "RETURN-" + t.id);
      } else continue;
      t.settled = stamp();
      s.points += Math.floor(t.stake / 100);
    }
  }
  async function simulate(ids) {
    await transact((s) => {
      for (const id of ids) {
        if (!s.results[id]) s.results[id] = simulatedResult(id);
      }
      settleTickets(s);
    });
    renderPage();
    toast("Demo results generated and affected bets settled.");
  }
  function renderResults(finishedOnly) {
    const all = fixtureIds().filter(
      (id) =>
        (finishedOnly ? Boolean(result(id)) : status(id) === "live") &&
        (listSport === "All" || meta(id).sport === listSport) &&
        (!listQuery ||
          fixture(id)
            .slice(0, 2)
            .join(" ")
            .toLowerCase()
            .includes(listQuery.toLowerCase()) ||
          String(id) === listQuery),
    );
    pageShell(
      finishedOnly ? "Results" : "Livescore",
      `<form class="results-filter" data-resultsfilter><label class="form-field"><span>Sport</span><select name="sport"><option>All</option>${sports.map((s) => `<option ${listSport === s ? "selected" : ""}>${s}</option>`).join("")}</select></label><label class="form-field"><span>Team or event ID</span><input name="query" value="${safe(listQuery)}" placeholder="Search events"></label><button class="btn-green">Search</button></form><div class="page-tabs page-tablinks"><a href="#/scores" ${!finishedOnly ? 'aria-current="page"' : ""}>Live scores</a><a href="#/results" ${finishedOnly ? 'aria-current="page"' : ""}>Finished results</a></div><div class="result-list">${
        all.length
          ? all
              .map((id) => {
                const f = fixture(id),
                  r = result(id);
                return `<a class="result-row" href="#/event/${id}"><span class="result-time">${r ? "FT" : "HT"}<small>ID ${id}</small></span><span>${safe(f[0])}</span><strong>${r ? r.home : f[2]} : ${r ? r.away : f[3]}</strong><span>${safe(f[1])}</span>${icon("chevron", 16)}</a>`;
              })
              .join("")
          : panelEmpty(
              finishedOnly
                ? "No completed demo matches"
                : "No matching live scores",
              finishedOnly
                ? "Simulate a final result from any event page to populate this list."
                : "Try a different sport or search.",
            )
      }<button class="inline-action" data-reset-results>Reset filters</button></div>`,
      { full: true, aside: false },
    );
  }

  const gameCatalog = [
    {
      id: "bottle",
      name: "Spin da’ Bottle",
      category: "Quick games",
      asset: "minigame-bottle.png",
      description: "Choose Up or Down and spin the bottle.",
    },
    {
      id: "redblack",
      name: "Red Black",
      category: "Quick games",
      asset: "minigame-redblack.png",
      description: "Pick a color and reveal the result.",
    },
    {
      id: "hero",
      name: "Sporty Hero",
      category: "Football",
      asset: "minigame-hero.png",
      description: "Choose a corner and take a penalty.",
    },
    {
      id: "aviator",
      name: "Aviator",
      category: "Quick games",
      asset: "3e03544469705b9601e974c10e5fd961.webp",
      description: "Cash out before the simulated round ends.",
    },
  ];
  let gameChoice = "Up",
    gameBusy = false;
  function renderGames() {
    const games = gameCatalog.filter(
      (g) => gameFilter === "All" || g.category === gameFilter,
    );
    pageShell(
      "Games",
      `<div class="games-banner"><div><h2>Play your way</h2><p>Four local games. One demo wallet.</p><a href="#/wallet" class="inline-action">Balance: ${money(balance())}</a></div><img src="${asset(`minigame-hero.png`)}" alt="Sporty Hero"></div><div class="page-tabs" role="tablist" aria-label="Game category">${["All", "Quick games", "Football", "Favourites"].map((t) => `<button role="tab" aria-selected="${gameFilter === t}" data-gamefilter="${t}">${t}</button>`).join("")}</div><div class="game-catalog">${(gameFilter === "Favourites" ? gameCatalog.filter((g) => (state.favouriteGames || []).includes(g.id)) : games).map((g) => `<article class="catalog-game"><a href="#/games/${g.id}"><img src="${asset(g.asset)}" alt="${g.name}"><h2>${g.name}</h2><p>${g.description}</p></a><div><a class="btn-green" href="#/games/${g.id}">Play demo</a><button aria-label="Favourite ${g.name}" aria-pressed="${(state.favouriteGames || []).includes(g.id)}" data-favgame="${g.id}">${icon("star", 20)}</button></div></article>`).join("") || panelEmpty("No favourite games", "Use the star beside a game to save it here.")}</div>`,
      { full: true, aside: false },
    );
  }
  function renderGame(id) {
    const g = gameCatalog.find((g) => g.id === id);
    if (!g) {
      pageShell(
        "Game not found",
        panelEmpty("Choose a game", "This game is not in the local catalogue."),
      );
      return;
    }
    const choices =
      id === "bottle"
        ? ["Up", "Down"]
        : id === "redblack"
          ? ["Red", "Black"]
          : ["Left", "Centre", "Right"];
    if (!choices.includes(gameChoice)) gameChoice = choices[0];
    const latest = state.games.find((x) => x.type === id),
      active = state.activeGame?.type === id ? state.activeGame : null;
    pageShell(
      g.name,
      `<div class="game-player"><div class="game-player-head"><a href="#/games" aria-label="Back to games">${icon("arrow-left", 20)}</a><h2>${g.name}</h2><a href="#/wallet">${money(balance())}</a></div><div class="game-canvas ${id === "aviator" ? "aviator-canvas" : ""}"><div class="game-animation-object" data-gameobject>${icon(id === "bottle" ? "rotate-cw" : id === "redblack" ? "circle" : id === "hero" ? "volleyball" : "plane", 72)}</div><output id="game-display" aria-live="polite">${active ? "Flying…" : latest ? safe(latest.result) : "Ready to play"}</output><p id="game-return">${!active && latest ? (latest.return > 0 ? "Demo return " + money(latest.return) : "No return this round.") : ""}</p></div><form class="game-bet-form" data-gameform="${id}" data-operation="${uid("GAME")}">${id === "aviator" ? "" : `<fieldset class="game-choices"><legend>${id === "bottle" ? "Bottle direction" : id === "redblack" ? "Your color" : "Shot direction"}</legend>${choices.map((c) => `<label><input type="radio" name="choice" value="${c}" ${gameChoice === c ? "checked" : ""}><span>${c}</span></label>`).join("")}</fieldset>`}${field("Demo stake (NGN)", "amount", "text", "100", 'inputmode="decimal" required maxlength="12"')}<p class="game-rules">${id === "aviator" ? "Cash out at the shown multiplier before the plane leaves. Refreshing does not restart a round." : "A matching outcome returns 2× your demo stake. A miss returns zero."} All outcomes are locally simulated.</p>${formError()}${active ? primary("Cash out", 'type="button" data-aviator-cashout') : primary(id === "aviator" ? "Start demo flight" : "Play demo", gameBusy ? "disabled" : "")}</form></div><section class="page-surface"><h2>Recent rounds</h2>${
        state.games
          .filter((x) => x.type === id)
          .slice(0, 10)
          .map(
            (x) =>
              `<div class="round-history"><span>${dateText(x.time)}<small>${safe(x.result)}</small></span><span>Stake ${money(x.stake)}</span><strong class="${x.return > 0 ? "positive" : ""}">${money(x.return)}</strong></div>`,
          )
          .join("") || "<p>No rounds played yet.</p>"
      }</section>`,
      { full: true, aside: false },
    );
    if (active) updateAviator();
  }
  async function startGame(form) {
    if (gameBusy) return;
    const type = form.dataset.gameform,
      raw = form.elements.amount.value,
      error = amountError(raw, 50);
    if (error) {
      feedback(form, error);
      return;
    }
    gameBusy = true;
    const btn = form.querySelector("button[type=submit],button:not([type])");
    if (btn) btn.disabled = true;
    const amount = cents(raw),
      operation = form.dataset.operation,
      choice = form.elements.choice?.value;
    try {
      if (type === "aviator") {
        await transact((s) => {
          if (s.activeGame)
            throw Error("A demo flight is already in progress.");
          if (s.games.some((g) => g.id === operation)) return;
          charge(s, amount, "Game stake", operation, operation);
          s.activeGame = {
            id: operation,
            type,
            stake: amount,
            started: Date.now(),
            crash:
              1.15 +
              (crypto.getRandomValues(new Uint32Array(1))[0] % 386) / 100,
          };
        });
        gameBusy = false;
        renderGame(type);
        return;
      }
      const random = crypto.getRandomValues(new Uint32Array(1))[0];
      const actual =
        type === "bottle"
          ? ["Up", "Down"][random % 2]
          : type === "redblack"
            ? ["Red", "Black"][random % 2]
            : ["Left", "Centre", "Right"][random % 3];
      const won = type === "hero" ? choice !== actual : choice === actual;
      await transact((s) => {
        if (s.games.some((g) => g.id === operation)) return;
        charge(s, amount, "Game stake", operation, operation);
        const returned = won ? amount * 2 : 0;
        if (returned)
          setLedger(
            s,
            "Game return",
            returned,
            operation,
            "GAME-RETURN-" + operation,
          );
        s.games.unshift({
          id: operation,
          type,
          time: stamp(),
          stake: amount,
          return: returned,
          result: type === "hero" ? (won ? "Goal!" : "Saved!") : actual,
          choice,
        });
        s.games = s.games.slice(0, 100);
      });
      const object = document.querySelector("[data-gameobject]");
      if (object && !motionReduced())
        await object
          .animate(
            [{ transform: "rotate(0deg)" }, { transform: "rotate(1080deg)" }],
            { duration: 650, easing: "ease-out" },
          )
          .finished.catch(() => {});
      gameChoice = choice;
      gameBusy = false;
      if (current() === "games/" + type) renderGame(type);
    } catch (e) {
      gameBusy = false;
      feedback(form, e.message);
      if (btn) btn.disabled = false;
    }
  }
  const multiplier = (game) =>
    Math.round((1 + (Date.now() - game.started) / 3500) * 100) / 100;
  let flightResolving = false;
  async function finishFlight(cashout) {
    if (flightResolving) return;
    flightResolving = true;
    try {
      await transact((s) => {
        const g = s.activeGame;
        if (!g) return;
        const mult = multiplier(g),
          won = cashout && mult < g.crash,
          returned = won ? Math.floor(g.stake * mult) : 0;
        if (returned)
          setLedger(s, "Game return", returned, g.id, "GAME-RETURN-" + g.id);
        s.games.unshift({
          id: g.id,
          type: "aviator",
          time: stamp(),
          stake: g.stake,
          return: returned,
          result: won
            ? "Cashed out " + mult.toFixed(2) + "×"
            : "Flew away at " + g.crash.toFixed(2) + "×",
        });
        s.activeGame = null;
      });
      if (current() === "games/aviator") renderGame("aviator");
    } finally {
      flightResolving = false;
    }
  }
  function updateAviator() {
    const g = state.activeGame;
    if (!g) return;
    const mult = multiplier(g);
    if (mult >= g.crash) {
      finishFlight(false);
      return;
    }
    const output = document.querySelector("#game-display");
    if (current() === "games/aviator" && output) {
      output.textContent = mult.toFixed(2) + "×";
      const b = document.querySelector("[data-aviator-cashout]");
      if (b) b.textContent = "Cash out " + money(Math.floor(g.stake * mult));
    }
  }
  setInterval(updateAviator, 100);

  let virtualTab = "Upcoming";
  function renderVirtual(type) {
    const ids = type === "instant-football" ? [28, 13, 11] : [22, 29, 12];
    const shown = ids.filter((id) =>
      virtualTab === "Results" ? Boolean(result(id)) : !result(id),
    );
    pageShell(
      type === "instant-football" ? "Instant Football" : "Scheduled Virtuals",
      `<div class="virtual-banner"><img src="${asset(`473ebe4bc9ec82b681c36d6597f258e0.jpg`)}" alt="Virtual World"></div><div class="page-tabs">${["Upcoming", "Results"].map((t) => `<button data-virtualtab="${t}" aria-pressed="${virtualTab === t}">${t}</button>`).join("")}</div><div class="page-surface"><div class="section-heading"><h2>Demo round</h2><span>Local simulation</span></div>${shown.map((id) => eventCard(id)).join("") || panelEmpty("No " + virtualTab.toLowerCase() + " fixtures", "Simulate a round to see its results.")}<div class="simulation-controls"><p>Play a fixture individually or simulate all remaining results in this round.</p>${primary("Simulate round", `data-simulate-round="${type}" ${ids.every((id) => result(id)) ? "disabled" : ""}`)}</div></div>`,
      { subtitle: "Choose outcomes, place a demo bet, then run the round" },
    );
  }

  const jackpotIds = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  function renderJackpot(tab = "play") {
    storage.set("sporty-jackpot-picks", JSON.stringify(jackpotPicks));
    const round = state.jackpot.round,
      draw = state.jackpot.draws[round],
      count = Object.keys(jackpotPicks).length;
    let content = "";
    if (tab === "results") {
      content = `<div class="page-surface"><h2>Previous rounds & entries</h2>${state.jackpot.boards.length ? state.jackpot.boards.map((b) => `<div class="jackpot-entry"><strong>${safe(b.id)} · Round ${b.round}</strong><span>${b.correct == null ? "Open" : b.correct + "/12 correct"}</span><strong>${b.prize ? money(b.prize) : b.correct == null ? "Awaiting draw" : "No prize"}</strong></div>`).join("") : panelEmpty("No entries yet", "Complete all twelve selections to enter the demo round.")}<a class="inline-action" href="#/jackpot">Current round</a></div>`;
    } else if (tab === "rules") {
      content = `<div class="page-surface prose"><h2>How to play</h2><ol><li>Choose Home, Draw or Away for every one of the twelve matches.</li><li>Review and submit your board for NGN 100 in demo credits.</li><li>Run the simulated draw. Each round can only be drawn once.</li><li>12 correct returns NGN 100,000 demo credits; 11 returns NGN 5,000; 10 returns NGN 500. Otherwise the return is zero.</li></ol><p>These are rules of this local demo, not SportyBet jackpot terms. No real prize is offered.</p>${link("jackpot", "Enter current round")}</div>`;
    } else
      content = `<div class="jackpot-board"><div class="section-heading"><h2>Round ${round.toString().padStart(4, "0")}</h2><span>${draw ? "Draw complete" : count + "/12 selected"}</span></div>${jackpotIds
        .map((id, i) => {
          const f = fixture(id);
          return `<div class="jackpot-match"><span class="jackpot-number">${i + 1}</span><div class="jackpot-teams"><span>${safe(f[0])}</span><span>${safe(f[1])}</span></div><div class="jackpot-choices">${["home", "draw", "away"].map((o, j) => `<button data-jackpick="${id}:${o}" aria-label="${safe(f[0])} ${["Home", "Draw", "Away"][j]}" aria-pressed="${jackpotPicks[id] === o}" ${draw ? "disabled" : ""}>${["1", "X", "2"][j]}${draw ? `<small>${draw[i] === o ? "Result" : ""}</small>` : ""}</button>`).join("")}</div></div>`;
        })
        .join(
          "",
        )}<div class="jackpot-actions"><div><strong>Demo entry NGN 100</strong><span>${count}/12 selected</span></div>${draw ? primary("Start next demo round", "data-next-jackpot") : primary("Review entry", "data-jackpot-enter")}<div class="action-row"><button class="inline-action" data-jackpot-random ${draw ? "disabled" : ""}>Quick pick</button><button class="inline-action" data-jackpot-clear ${draw ? "disabled" : ""}>Clear board</button><button class="inline-action" data-jackpot-draw ${draw ? "disabled" : ""}>Simulate draw</button></div><p class="form-feedback" role="alert"></p></div></div>`;
    pageShell(
      "Sporty 12 Jackpot",
      `<div class="jackpot-hero"><div><span>Predict 12 matches</span><h2>NGN 100,000</h2><p>Maximum demo prize. No real funds.</p></div><strong>ROUND ${round.toString().padStart(4, "0")}</strong></div><div class="page-tabs page-tablinks"><a href="#/jackpot" ${tab === "play" ? 'aria-current="page"' : ""}>Sporty 12</a><a href="#/jackpot/results" ${tab === "results" ? 'aria-current="page"' : ""}>Previous results</a><a href="#/jackpot/rules" ${tab === "rules" ? 'aria-current="page"' : ""}>How to play</a></div>${content}`,
    );
  }
  async function drawJackpot() {
    await transact((s) => {
      const round = s.jackpot.round;
      if (s.jackpot.draws[round]) return;
      const nums = crypto.getRandomValues(new Uint32Array(12)),
        outcomes = Array.from(nums, (n) => ["home", "draw", "away"][n % 3]);
      s.jackpot.draws[round] = outcomes;
      for (const b of s.jackpot.boards.filter((b) => b.round === round)) {
        b.correct = jackpotIds.filter(
          (id, i) => b.picks[id] === outcomes[i],
        ).length;
        b.prize =
          b.correct === 12
            ? 10000000
            : b.correct === 11
              ? 500000
              : b.correct === 10
                ? 50000
                : 0;
        if (b.prize)
          setLedger(s, "Jackpot prize", b.prize, b.id, "JACKPOT-PRIZE-" + b.id);
      }
    });
    if (currentPath.startsWith("jackpot")) navigate("jackpot/results");
    toast("Demo jackpot draw completed.");
  }

  async function hashPIN(pin, salt) {
    const material = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(pin),
      "PBKDF2",
      false,
      ["deriveBits"],
    );
    const hash = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: new TextEncoder().encode(salt),
        iterations: 100000,
        hash: "SHA-256",
      },
      material,
      256,
    );
    return Array.from(new Uint8Array(hash), (x) =>
      x.toString(16).padStart(2, "0"),
    ).join("");
  }
  function renderAccount(section) {
    if (
      section === "register" ||
      (!state.profile && section !== "recover" && section !== "login")
    ) {
      pageShell(
        "Create demo account",
        `<div class="auth-page page-surface"><div class="page-tabs page-tablinks"><a href="#/account/register" aria-current="page">Register</a><a href="#/account/login">Log in</a></div><h2>Make it your own</h2><p>Use a made-up PIN for this local demo. Your wallet remains simulated.</p><form data-authform="register">${field("Display name", "name", "text", "", 'required maxlength="40" autocomplete="nickname"')}${field("Demo PIN (6 digits)", "pin", "password", "", 'required pattern="[0-9]{6}" inputmode="numeric" maxlength="6" autocomplete="new-password"')}${field("Confirm demo PIN", "confirm", "password", "", 'required pattern="[0-9]{6}" inputmode="numeric" maxlength="6" autocomplete="new-password"')}<label class="checkbox-field"><input name="terms" type="checkbox" required><span>I understand this is a demo with no real funds.</span></label>${formError()}${primary("Create demo account")}</form><a class="inline-action" href="#/wallet">Continue as guest</a></div>`,
        { full: true, aside: false },
      );
      return;
    }
    if (section === "login" || (!state.session && section !== "recover")) {
      pageShell(
        "Log in",
        `<div class="auth-page page-surface"><div class="page-tabs page-tablinks"><a href="#/account/register">Register</a><a href="#/account/login" aria-current="page">Log in</a></div><h2>Welcome back</h2><p>${state.profile ? "Enter the demo PIN for " + safe(state.profile.name) + "." : "Create a local account first to use demo sign-in."}</p><form data-authform="login">${field("Demo PIN", "pin", "password", "", 'required pattern="[0-9]{6}" inputmode="numeric" maxlength="6" autocomplete="current-password"')}${formError()}${primary("Log in")}</form><a class="inline-action" href="#/account/recover">Forgot demo PIN?</a><a class="inline-action" href="#/wallet">Continue as guest</a></div>`,
        { full: true, aside: false },
      );
      return;
    }
    if (section === "recover") {
      pageShell(
        "Reset demo PIN",
        `<div class="auth-page page-surface"><h2>Recover your local profile</h2><p>Use the recovery code shown when you created your account.</p><form data-authform="recover">${field("Recovery code", "recovery", "text", "", 'required autocomplete="off" maxlength="24"')}${field("New demo PIN", "pin", "password", "", 'required pattern="[0-9]{6}" inputmode="numeric" maxlength="6"')}${formError()}${primary("Reset demo PIN")}</form><a class="inline-action" href="#/account/login">Back to login</a></div>`,
        { full: true, aside: false },
      );
      return;
    }
    if (section === "security") {
      pageShell(
        "Account security",
        `<div class="account-layout"><nav class="account-menu">${accountLinks()}</nav><div class="page-surface"><h2>Change demo PIN</h2><form data-authform="pin">${field("Current demo PIN", "oldpin", "password", "", 'required inputmode="numeric" maxlength="6"')}${field("New demo PIN", "pin", "password", "", 'required pattern="[0-9]{6}" inputmode="numeric" maxlength="6"')}${formError()}${primary("Update PIN")}</form><h2 class="separated-title">Local account access</h2><p>Signing out preserves demo bets and your balance on this browser.</p><button class="inline-action" data-signout-demo>Sign out</button><button class="inline-action" data-pause-account>Pause demo play for 24 hours</button></div></div>`,
        { full: true, aside: false },
      );
      return;
    }
    if (section === "edit") {
      pageShell(
        "Edit profile",
        `<div class="account-layout"><nav class="account-menu">${accountLinks()}</nav><div class="page-surface"><form data-authform="edit">${field("Display name", "name", "text", state.profile.name, 'required maxlength="40"')}${field("Favourite sport", "sport", "text", state.profile.sport || "Football", 'maxlength="30"')}${formError()}${primary("Save profile")}</form></div></div>`,
        { full: true, aside: false },
      );
      return;
    }
    pageShell(
      "My account",
      `<div class="account-layout"><nav class="account-menu">${accountLinks()}</nav><section class="page-surface"><div class="profile-heading"><span class="profile-avatar">${safe(state.profile.name.slice(0, 1).toUpperCase())}</span><div><h2>${safe(state.profile.name)}</h2><p>Demo ID ${safe(state.profile.id)}</p></div><a href="#/account/edit" aria-label="Edit profile">${icon("pencil", 20)}</a></div><div class="profile-balance"><span>Available demo balance</span><strong>${money(balance())}</strong><a class="btn-green" href="#/wallet/deposit">Add credits</a></div><div class="profile-shortcuts">${link("bets", "My bets", "receipt-text")}${link("wallet/transactions", "Transactions", "list")}${link("promotions", "Promotions", "gift")}${link("loyalty", "Sporty Loyalty", "award")}${link("settings/responsible", "Responsible play", "shield-check")}${link("help/support", "Help & support", "message-circle")}</div><button class="inline-action" data-signout-demo>Sign out</button></section></div>`,
      { full: true, aside: false },
    );
  }
  function accountLinks() {
    return [
      ["account", "Overview"],
      ["account/edit", "Personal details"],
      ["account/security", "Security"],
      ["wallet", "My wallet"],
      ["bets", "Bet history"],
      ["settings", "Settings"],
    ]
      .map(
        ([p, t]) =>
          `<a href="#/${p}" ${currentPath === p ? 'aria-current="page"' : ""}>${t}${icon("chevron", 16)}</a>`,
      )
      .join("");
  }
  const promotions = [
    {
      id: "welcome",
      title: "Welcome to your demo",
      copy: "Create a local demo profile to receive NGN 500 in demo credits.",
      reward: 50000,
      eligible: () => Boolean(state.profile),
    },
    {
      id: "first-bet",
      title: "Your first selection counts",
      copy: "Place a demo sports bet to claim NGN 250 in demo credits.",
      reward: 25000,
      eligible: () => state.tickets.length > 0,
    },
  ];
  function renderRewards(kind) {
    if (kind === "loyalty") {
      pageShell(
        "Sporty Loyalty",
        `<section class="loyalty-balance"><div>${icon("award", 32)}<span>Your demo points</span><strong>${state.points}</strong></div><p>Earn 1 point per NGN 100 of stake when a sports ticket settles. Cancelled or cashed-out bets do not earn points.</p></section><div class="page-surface"><h2>Redeem your points</h2><p>Exchange 10 points for NGN 100 in demo credits.</p><dl class="receipt-details"><div><dt>Available</dt><dd>${state.points} points</dd></div><div><dt>Reward</dt><dd>NGN 100 demo credits</dd></div></dl>${primary("Redeem 10 points", `data-redeem ${state.points < 10 ? "disabled" : ""}`)}<p class="form-feedback" role="alert"></p></div><a class="page-link" href="#/bets">View settled bets ${icon("chevron")}</a>`,
        { full: true, aside: false },
      );
      return;
    }
    pageShell(
      "Promotions",
      `<div class="page-tabs"><button aria-pressed="true">All promotions</button></div><div class="promotion-pages">${promotions.map((p) => `<article class="promotion-page"><div class="promotion-art">${icon("gift", 40)}<strong>${money(p.reward)}</strong><span>Demo reward</span></div><div><h2>${p.title}</h2><p>${p.copy}</p><details><summary>Terms ${icon("down", 16)}</summary><p>One claim per browser demo wallet. Credits cannot be transferred or withdrawn as real money. This is a replica-only promotion, not an official SportyBet offer.</p></details>${primary(state.claimed.includes(p.id) ? "Claimed" : p.eligible() ? "Claim demo reward" : p.id === "welcome" ? "Create demo account" : "Place a demo bet", `data-claim="${p.id}" ${state.claimed.includes(p.id) ? "disabled" : ""}`)}</div></article>`).join("")}</div>`,
      { full: true, aside: false },
    );
  }
  function renderSettings(section = "general") {
    const responsible = section === "responsible";
    pageShell(
      responsible ? "Responsible play" : "Settings",
      `<div class="account-layout"><nav class="account-menu"><a href="#/settings">Display & preferences</a><a href="#/settings/responsible">Responsible play</a><a href="#/account/security">Account security</a></nav><div class="page-surface">${responsible ? `<h2>Demo limits</h2><p>Limits apply to this simulated wallet immediately. Daily totals reset at midnight, Nigeria time.</p><form data-settingsform="limits">${field("Daily demo deposit limit (NGN)", "deposit", "text", state.settings.depositLimit / 100, 'inputmode="decimal" required')}${field("Daily demo wager limit (NGN)", "wager", "text", state.settings.wagerLimit / 100, 'inputmode="decimal" required')}${formError()}${primary("Save limits")}</form><div class="exclusion-section"><h2>Take a break</h2><p>${Date.now() < state.settings.excludedUntil ? "Demo play paused until " + dateText(state.settings.excludedUntil) + ". Withdrawals and history are still available." : "Pause sports bets, jackpot entries and game rounds for a chosen period."}</p><form data-settingsform="pause"><label class="form-field"><span>Pause duration</span><select name="hours"><option value="1">1 hour</option><option value="24">24 hours</option><option value="168">7 days</option></select></label>${formError()}<button class="btn-green" ${Date.now() < state.settings.excludedUntil ? "disabled" : ""}>Pause demo play</button></form></div>` : `<h2>Display preferences</h2><label class="setting-row"><span>Reduce motion</span><input type="checkbox" data-preference-motion ${document.documentElement.dataset.motion === "reduce" ? "checked" : ""}></label><p>Your system’s reduced-motion preference is always respected.</p><div class="setting-row"><span>Odds format</span><strong>Decimal</strong></div><div class="setting-row"><span>Currency</span><strong>NGN · Demo</strong></div><div class="setting-row"><span>Storage</span><strong>${storage.unavailable ? "Session only" : "This browser"}</strong></div><div class="exclusion-section"><h2>Local demo data</h2><p>Export your transactions or restore the demo to its starting state.</p><div class="action-row"><button class="inline-action" data-export="ledger">Export transactions</button><button class="inline-action" data-reset-demo>Reset entire demo</button></div></div>`}</div></div>`,
      { full: true, aside: false },
    );
  }
  const helpText = {
    about: [
      "About this replica",
      "A self-contained interface demo inspired by SportyBet Nigeria. It supports sports selections, a simulated wallet, local games and demo bet settlement. It is not affiliated with SportyBet.",
    ],
    terms: [
      "Demo terms",
      "All balances, bets, games and rewards in this replica are simulated. They have no cash value. Data is stored in your browser and can be reset. Never enter a real bank account, payment card, SportyBet password or personal PIN.",
    ],
    privacy: [
      "Privacy",
      "Demo profiles, hashed demo PINs, bets and wallet transactions are stored on this browser. There is no remote account service, analytics, payment processor or live betting feed. Reset the demo from Settings to remove its stored data.",
    ],
    status: [
      "System status",
      "Sports data: reference snapshot and local simulation. Wallet: local demo ledger. Game engine: local random simulation. Account: browser-local profile. Real payments and live sportsbook services: not connected.",
    ],
    betting: [
      "How betting works",
      "Choose an outcome, add a stake and confirm the demo bet. Your wallet is debited once. Use the demo match controls to produce a final result. Winning returns are credited once; a losing ticket returns zero. Cancel an open demo ticket for a refund or accept its fixed demo cashout offer.",
    ],
    support: [
      "Help & support",
      "For this local demo, try the FAQ below or reset saved data in Settings. For real SportyBet account issues, use the official SportyBet service. This replica cannot access your real account.",
    ],
  };
  function renderHelp(topic = "faq") {
    const text = helpText[topic] || [
      "Frequently asked questions",
      "Find answers about the local demo.",
    ];
    const faqs = [
      [
        "Can I use real money?",
        "No. All balances, deposits, withdrawals and bets are local simulations with no cash value.",
      ],
      [
        "Where is my account saved?",
        "In this browser. Logging out preserves your local demo data. Clearing browser storage or resetting the demo removes it.",
      ],
      [
        "How do I get a bet result?",
        "Open an event and choose Simulate final result. Or open your ticket and simulate all remaining results. Returns appear in Wallet and the transaction history.",
      ],
      [
        "Can I cancel or cash out?",
        "Open a pending ticket in My bets. Cancel refunds the stake; demo cashout returns 70% of the original stake. Either action can only happen once.",
      ],
      [
        "How do booking codes work?",
        "Select outcomes, then Book selections. Load the generated code from the same browser. Codes do not connect to real SportyBet.",
      ],
      [
        "What if I forget my demo PIN?",
        "Use the recovery code shown at registration. The replica cannot reset a real SportyBet account.",
      ],
      [
        "Why are some events labelled SIM?",
        "They are generated demo fixtures, not claims about a real schedule. Results produced by the controls are also simulated.",
      ],
    ];
    pageShell(
      text[0],
      `<div class="help-layout"><nav class="account-menu">${[
        ["faq", "FAQ"],
        ["betting", "How to bet"],
        ["about", "About"],
        ["terms", "Demo terms"],
        ["privacy", "Privacy"],
        ["status", "System status"],
        ["support", "Support"],
      ]
        .map(
          ([p, t]) =>
            `<a href="#/help/${p}" ${topic === p ? 'aria-current="page"' : ""}>${t}</a>`,
        )
        .join(
          "",
        )}</nav><div class="page-surface prose"><h2>${text[0]}</h2><p>${text[1]}</p>${topic === "support" ? `<form data-supportform>${field("Subject", "subject", "text", "", 'required maxlength="80"')}<label class="form-field"><span>Message</span><textarea name="message" required maxlength="2000" placeholder="Describe your demo issue"></textarea></label><p class="local-note">Saved on this browser only. This is not sent to SportyBet support.</p>${formError()}${primary("Save demo support request")}</form>${(state.messages || []).length ? `<h3>Your local requests</h3>${state.messages.map((m) => `<details class="faq-item"><summary>${safe(m.subject)}${icon("down", 16)}</summary><p>${safe(m.message)}</p><small>${safe(m.id)} · ${dateText(m.time)} · Saved locally</small></details>`).join("")}` : ""}` : ""}${topic === "faq" || topic === "support" ? faqs.map(([q, a]) => `<details class="faq-item"><summary>${q}${icon("down", 16)}</summary><p>${a}</p></details>`).join("") : ""}<div class="action-row"><a class="inline-action" href="#/settings">Demo settings</a><a class="inline-action" href="#/home">Back to sports</a></div></div></div>`,
      { full: true, aside: false },
    );
  }

  const feedback = (form, message) => {
    const e = form.querySelector(".form-feedback");
    if (e) e.textContent = message;
  };
  async function withButton(button, action) {
    if (button.disabled) return;
    button.disabled = true;
    try {
      await action();
    } catch (e) {
      toast(e.message);
    } finally {
      if (button.isConnected) button.disabled = false;
    }
  }
  function confirmAction(title, html, buttonLabel, action) {
    openDialog(
      title,
      `${html}<p class="form-feedback" role="alert"></p><button class="btn-green" data-demo-confirm>${buttonLabel}</button><button class="inline-action" data-close>Cancel</button>`,
      (d) => {
        d.querySelector("[data-demo-confirm]").onclick = async (e) => {
          const b = e.currentTarget;
          if (b.disabled) return;
          b.disabled = true;
          try {
            await action();
            if (d.open) d.close();
          } catch (err) {
            if (d.isConnected)
              d.querySelector(".form-feedback").textContent = err.message;
            else toast(err.message);
            b.disabled = false;
          }
        };
      },
    );
  }
  async function changeTicket(id, type) {
    const ticket = state.tickets.find((t) => t.id === id);
    if (!ticket || ticket.status !== "Open") {
      toast("This ticket is no longer open.");
      renderPage();
      return;
    }
    const returned =
      type === "cashout"
        ? Math.round(ticket.stake * 0.7 * 100)
        : cents(ticket.stake);
    confirmAction(
      type === "cashout" ? "Accept demo cashout?" : "Cancel demo bet?",
      `<p>${type === "cashout" ? "Accept the fixed demo offer of" : "Refund the original stake of"} <strong>${money(returned)}</strong> for ticket ${safe(id)}?</p>`,
      type === "cashout" ? "Accept cashout" : "Cancel and refund",
      async () => {
        await transact((s) => {
          const t = s.tickets.find((t) => t.id === id);
          if (!t || t.status !== "Open")
            throw Error("This bet has already been settled or cancelled.");
          t.status = type === "cashout" ? "Cashed out" : "Cancelled";
          t.return = returned / 100;
          t.settled = stamp();
          setLedger(
            s,
            type === "cashout" ? "Cashout" : "Bet refund",
            returned,
            id,
            (type === "cashout" ? "CASHOUT-" : "REFUND-") + id,
          );
        });
        renderPage();
        renderSlip();
        toast(
          type === "cashout"
            ? "Demo cashout credited."
            : "Demo stake refunded.",
        );
      },
    );
  }
  function exportCSV(kind) {
    let rows =
      kind === "bets"
        ? [
            ["Ticket", "Created", "Status", "Stake NGN", "Return NGN"],
            ...state.tickets.map((t) => [
              t.id,
              t.created,
              t.status,
              t.stake,
              t.return || 0,
            ]),
          ]
        : [
            ["Transaction", "Time", "Type", "Amount NGN", "Reference"],
            ...state.ledger.map((x) => [
              x.id,
              x.time,
              x.kind,
              x.amount / 100,
              x.ref,
            ]),
          ];
    const csv = rows
        .map((r) =>
          r.map((v) => '"' + String(v).replaceAll('"', '""') + '"').join(","),
        )
        .join("\r\n"),
      url = URL.createObjectURL(
        new Blob([csv], { type: "text/csv;charset=utf-8" }),
      ),
      a = document.createElement("a");
    a.href = url;
    a.download = "sporty-demo-" + kind + ".csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  document.addEventListener(
    "click",
    (e) => {
      const b = e.target.closest("button,a");
      if (b?.matches('.route-view [role="tab"]')) {
        const list = b.closest('[role="tablist"]');
        list.querySelectorAll('[role="tab"]').forEach((t) => {
          t.setAttribute("aria-selected", String(t === b));
          t.tabIndex = t === b ? 0 : -1;
        });
        document
          .getElementById(b.getAttribute("aria-controls"))
          ?.setAttribute("aria-labelledby", b.id);
      }
      if (!b) return;
      function handle(fn) {
        e.preventDefault();
        e.stopImmediatePropagation();
        fn();
      }
      if (b.matches('a[href^="#/"]')) {
        handle(() =>
          navigate(decodeURIComponent(b.getAttribute("href").slice(2))),
        );
        return;
      }
      if (b.dataset.path) {
        handle(() => {
          closeDialog();
          navigate(b.dataset.path);
        });
        return;
      }
      if (b.dataset.nav) {
        handle(() => navigate(aliases[b.dataset.nav] || "home"));
        return;
      }
      if (b.hasAttribute("data-auth")) {
        handle(() =>
          navigate(
            b.classList.contains("login") || b.classList.contains("btn-login")
              ? "account/login"
              : "account/register",
          ),
        );
        return;
      }
      if (b.hasAttribute("data-subnav")) {
        handle(() => {
          const text = b.textContent.trim();
          listLeague = "All";
          listStatus = "all";
          navigate(
            text === "Home"
              ? "home"
              : "sports/" +
                  sportSlug(text === "More Sports" ? "Football" : text),
          );
        });
        return;
      }
      if (b.hasAttribute("data-league")) {
        handle(() => {
          const text = b.textContent.toLowerCase();
          listStatus = "all";
          listSport = "Football";
          listLeague = text.includes("conference")
            ? "UEFA Conference League"
            : text.includes("europa")
              ? "UEFA Europa League"
              : text.includes("premier")
                ? "England Premier League"
                : text.includes("la liga")
                  ? "Spain La Liga"
                  : "All";
          navigate("sports/football");
        });
        return;
      }
      if (b.dataset.bottom) {
        handle(() =>
          navigate(
            {
              Home: "home",
              "A-Z Menu": "sports/football",
              Games: "games",
              "Open Bets": "bets",
              Me: "account",
            }[b.dataset.bottom] || "home",
          ),
        );
        return;
      }
      if (b.hasAttribute("data-tool")) {
        handle(() => {
          const name = b.dataset.tool;
          if (name === "Load Code") showCodes();
          else
            navigate(
              {
                "All Sports": "sports/football",
                Live: "live",
                Aviator: "games/aviator",
                Virtuals: "virtuals",
                More: "menu",
              }[name] || "home",
            );
        });
        return;
      }
      if (b.hasAttribute("data-info")) {
        const name = b.dataset.info,
          footerMap = {
            Settings: "settings",
            Sports: "sports/football",
            "About Us": "help/about",
            "Terms & Conditions": "help/terms",
            "Responsible Gaming": "settings/responsible",
            "Privacy Policy": "help/privacy",
            "Sporty Group": "help/about",
            "System Status": "help/status",
            FAQ: "help/faq",
            "Bet Builder": "help/betting",
            "Live Betting": "live",
            Games: "games",
            "Live Games": "games",
            "Scheduled Virtuals": "virtuals",
            Jackpot: "jackpot",
            "Lucky Numbers": "games/redblack",
            Others: "help/faq",
            "Customer support": "help/support",
            "Forgot Password?": "account/recover",
            "Deactivate / Reactivate": "account/security",
            "Spin da’ Bottle": "games/bottle",
            "Sporty Hero": "games/hero",
            "Red Black": "games/redblack",
            "Mini Games": "games",
            "New games coming soon": "games",
            "Instant Football": "instant-football",
            "Virtual World": "virtuals",
            "Sporty 12 Jackpot": "jackpot",
            "Sporty Picks": "sports/football",
            "LEV vs MAR": "event/0",
            "CEL vs BJK": "event/13",
            "Leverkusen vs Marseille": "event/0",
            "Real Sociedad vs Lyon": "event/3",
          };
        handle(() => navigate(footerMap[name] || "help/about"));
        return;
      }
      if (b.hasAttribute("data-home")) {
        handle(() => navigate("home"));
        return;
      }
      if (b.hasAttribute("data-game")) {
        handle(() => navigate("games/" + b.dataset.game));
        return;
      }
      if (b.hasAttribute("data-openbets")) {
        handle(() => navigate("bets"));
        return;
      }
      if (b.hasAttribute("data-profile")) {
        handle(() => navigate("account"));
        return;
      }
      if (b.hasAttribute("data-signout")) {
        handle(() => signOut());
        return;
      }
      if (b.hasAttribute("data-scores")) {
        handle(() => navigate("scores"));
        return;
      }
      if (b.hasAttribute("data-eventstatus")) {
        handle(() => {
          listStatus = b.dataset.eventstatus;
          listLeague = "All";
          if (currentPath === "live")
            navigate("sports/" + sportSlug(listSport));
          else renderPage();
        });
        return;
      }
      if (b.hasAttribute("data-reset-eventfilter")) {
        handle(() => {
          listQuery = "";
          listLeague = "All";
          onlyPinned = false;
          listStatus = "all";
          renderPage();
        });
        return;
      }
      if (b.hasAttribute("data-pinned")) {
        handle(() => {
          onlyPinned = !onlyPinned;
          renderPage();
        });
        return;
      }
      if (b.hasAttribute("data-star")) {
        handle(() => {
          const id = Number(b.dataset.star);
          favourites = favourites.includes(id)
            ? favourites.filter((v) => v !== id)
            : [...favourites, id];
          storage.set("sporty-favourites", JSON.stringify(favourites));
          renderPage();
        });
        return;
      }
      if (b.hasAttribute("data-marketgroup")) {
        handle(() => {
          marketGroup = b.dataset.marketgroup;
          renderEvent(Number(currentPath.split("/")[1]));
        });
        return;
      }
      if (b.hasAttribute("data-event-section")) {
        handle(() => {
          const id = Number(currentPath.split("/")[1]),
            f = fixture(id),
            r = result(id),
            section = document.querySelector("#event-section");
          b.parentElement
            .querySelectorAll("button")
            .forEach((t) => t.setAttribute("aria-selected", t === b));
          if (b.dataset.eventSection === "markets") {
            renderEvent(id);
            return;
          }
          section.innerHTML =
            b.dataset.eventSection === "stats"
              ? `<div class="page-surface"><h2>Match statistics</h2><div class="stat-line"><strong>${r ? r.home : (f[2] ?? 0)}</strong><span>${meta(id).sport.includes("Basketball") ? "Points" : "Score"}</span><strong>${r ? r.away : (f[3] ?? 0)}</strong></div><div class="stat-line"><span>${status(id) === "finished" ? "Finished" : "Snapshot"}</span><span>Event status</span><span>${meta(id).sport}</span></div><p>Only scores included in the demo dataset are displayed. No invented possession or shot statistics.</p></div>`
              : `<div class="page-surface"><h2>Timeline</h2><ol class="event-timeline"><li><strong>00:00</strong><span>Demo event created</span></li>${meta(id).status === "live" ? "<li><strong>HT</strong><span>Reference half-time snapshot</span></li>" : ""}${r ? `<li><strong>FT</strong><span>Simulated result ${r.home}:${r.away} · ${dateText(r.time)}</span></li>` : ""}</ol></div>`;
          animateContent(section);
        });
        return;
      }
      if (b.hasAttribute("data-simulate")) {
        handle(() =>
          withButton(b, () => simulate([Number(b.dataset.simulate)])),
        );
        return;
      }
      if (b.hasAttribute("data-settle-ticket")) {
        handle(() => {
          const t = state.tickets.find((t) => t.id === b.dataset.settleTicket);
          if (t) withButton(b, () => simulate(t.picks.map((p) => p.id)));
        });
        return;
      }
      if (b.hasAttribute("data-betfilter")) {
        handle(() => {
          betFilter = b.dataset.betfilter;
          renderBets();
        });
        return;
      }
      if (b.hasAttribute("data-cancel-demo")) {
        handle(() => changeTicket(b.dataset.cancelDemo, "cancel"));
        return;
      }
      if (b.hasAttribute("data-cashout")) {
        handle(() => changeTicket(b.dataset.cashout, "cashout"));
        return;
      }
      if (b.hasAttribute("data-cancel-ticket")) {
        handle(() => changeTicket(b.dataset.cancelTicket, "cancel"));
        return;
      }
      if (b.hasAttribute("data-rebet")) {
        handle(() => {
          const t = state.tickets.find((t) => t.id === b.dataset.rebet);
          if (t) {
            picks = t.picks.filter((p) => status(p.id) !== "finished");
            persist();
            renderSlip();
            if (!picks.length)
              toast("These events have finished. Choose new fixtures.");
            else openSheet();
          }
        });
        return;
      }
      if (b.hasAttribute("data-copyticket")) {
        handle(async () => {
          try {
            await navigator.clipboard.writeText(b.dataset.copyticket);
            toast("Ticket ID copied.");
          } catch {
            toast("Ticket ID: " + b.dataset.copyticket);
          }
        });
        return;
      }
      if (b.hasAttribute("data-receipt")) {
        handle(() => receipt(b.dataset.receipt));
        return;
      }
      if (b.hasAttribute("data-export")) {
        handle(() => exportCSV(b.dataset.export));
        return;
      }
      if (b.hasAttribute("data-amount")) {
        handle(() => {
          b.closest("form").elements.amount.value = b.dataset.amount;
        });
        return;
      }
      if (b.hasAttribute("data-reset-results")) {
        handle(() => {
          listQuery = "";
          listSport = "All";
          renderPage();
        });
        return;
      }
      if (b.hasAttribute("data-gamefilter")) {
        handle(() => {
          gameFilter = b.dataset.gamefilter;
          renderGames();
        });
        return;
      }
      if (b.hasAttribute("data-favgame")) {
        handle(() =>
          withButton(b, async () => {
            await transact((s) => {
              s.favouriteGames = s.favouriteGames || [];
              s.favouriteGames = s.favouriteGames.includes(b.dataset.favgame)
                ? s.favouriteGames.filter((x) => x !== b.dataset.favgame)
                : [...s.favouriteGames, b.dataset.favgame];
            });
            renderGames();
          }),
        );
        return;
      }
      if (b.hasAttribute("data-aviator-cashout")) {
        handle(() => withButton(b, () => finishFlight(true)));
        return;
      }
      if (b.hasAttribute("data-virtualtab")) {
        handle(() => {
          virtualTab = b.dataset.virtualtab;
          renderVirtual(currentPath);
        });
        return;
      }
      if (b.hasAttribute("data-simulate-round")) {
        handle(() =>
          withButton(b, () =>
            simulate(
              b.dataset.simulateRound === "instant-football"
                ? [28, 13, 11]
                : [22, 29, 12],
            ),
          ),
        );
        return;
      }
      if (b.hasAttribute("data-jackpick")) {
        handle(() => {
          if (state.jackpot.draws[state.jackpot.round]) return;
          const [id, o] = b.dataset.jackpick.split(":");
          jackpotPicks[id] = o;
          renderJackpot();
        });
        return;
      }
      if (b.hasAttribute("data-jackpot-random")) {
        handle(() => {
          if (state.jackpot.draws[state.jackpot.round]) return;
          const nums = crypto.getRandomValues(new Uint32Array(12));
          jackpotIds.forEach(
            (id, i) =>
              (jackpotPicks[id] = ["home", "draw", "away"][nums[i] % 3]),
          );
          renderJackpot();
        });
        return;
      }
      if (b.hasAttribute("data-jackpot-clear")) {
        handle(() => {
          jackpotPicks = {};
          renderJackpot();
        });
        return;
      }
      if (b.hasAttribute("data-jackpot-enter")) {
        handle(() => {
          if (Object.keys(jackpotPicks).length !== 12) {
            document.querySelector(
              ".jackpot-actions .form-feedback",
            ).textContent = "Choose an outcome for all 12 matches.";
            return;
          }
          const op = uid("JP"),
            board = structuredClone(jackpotPicks),
            round = state.jackpot.round;
          confirmAction(
            "Confirm demo jackpot entry",
            `<p>Enter round ${round} for <strong>NGN 100 in demo credits</strong> with all twelve selections?</p>`,
            "Confirm entry",
            async () => {
              await transact((s) => {
                if (s.jackpot.boards.some((b) => b.id === op)) return;
                if (s.jackpot.round !== round || s.jackpot.draws[round])
                  throw Error("This round has closed. Start a new round.");
                charge(s, 10000, "Jackpot entry", op, op);
                s.jackpot.boards.unshift({
                  id: op,
                  round,
                  picks: board,
                  time: stamp(),
                  correct: null,
                  prize: 0,
                });
              });
              jackpotPicks = {};
              renderJackpot();
              toast("Demo jackpot entry saved.");
            },
          );
        });
        return;
      }
      if (b.hasAttribute("data-jackpot-draw")) {
        handle(() =>
          confirmAction(
            "Run demo draw?",
            `<p>The current round will close and all its entries will be evaluated. This cannot be repeated for the same round.</p>`,
            "Run demo draw",
            drawJackpot,
          ),
        );
        return;
      }
      if (b.hasAttribute("data-next-jackpot")) {
        handle(() =>
          withButton(b, async () => {
            await transact((s) => {
              if (!s.jackpot.draws[s.jackpot.round])
                throw Error("Finish the current round first.");
              s.jackpot.round++;
            });
            jackpotPicks = {};
            renderJackpot();
          }),
        );
        return;
      }
      if (b.hasAttribute("data-signout-demo")) {
        handle(() => signOut());
        return;
      }
      if (b.hasAttribute("data-pause-account")) {
        handle(() => navigate("settings/responsible"));
        return;
      }
      if (b.hasAttribute("data-claim")) {
        handle(() => {
          const promo = promotions.find((p) => p.id === b.dataset.claim);
          if (!promo) return;
          if (!promo.eligible()) {
            navigate(
              promo.id === "welcome" ? "account/register" : "sports/football",
            );
            return;
          }
          withButton(b, async () => {
            await transact((s) => {
              if (s.claimed.includes(promo.id))
                throw Error("This demo reward was already claimed.");
              if (promo.id === "welcome" ? !s.profile : !s.tickets.length)
                throw Error("Complete the promotion requirement first.");
              s.claimed.push(promo.id);
              setLedger(
                s,
                "Demo reward",
                promo.reward,
                promo.title,
                "PROMO-" + promo.id,
              );
            });
            if (currentPath === "promotions") renderRewards("promotions");
            toast("Demo reward credited.");
          });
        });
        return;
      }
      if (b.hasAttribute("data-redeem")) {
        handle(() =>
          withButton(b, async () => {
            await transact((s) => {
              if (s.points < 10)
                throw Error("You need at least 10 demo points.");
              s.points -= 10;
              setLedger(s, "Loyalty reward", 10000, "Redeemed 10 points");
            });
            renderRewards("loyalty");
            toast("NGN 100 demo credits added.");
          }),
        );
        return;
      }
      if (b.hasAttribute("data-reset-demo")) {
        handle(() =>
          confirmAction(
            "Reset the entire demo?",
            `<p>This removes your local account, bets, results, codes, games and transactions. The wallet returns to NGN 10,000 demo credits.</p>`,
            "Reset demo",
            async () => {
              state = seed();
              state.profile = null;
              state.tickets = [];
              storage.set(KEY, JSON.stringify(state));
              picks = [];
              stake = "";
              savedCodes = {};
              favourites = [];
              storage.set("sporty-codes", "{}");
              storage.set("sporty-favourites", "[]");
              storage.set("sporty-profile", "null");
              storage.set("sporty-jackpot-picks", "{}");
              storage.set("sporty-motion", "");
              document.documentElement.dataset.motion = "";
              persist();
              syncCore();
              navigate("home");
              toast("Demo reset.");
            },
          ),
        );
        return;
      }
    },
    true,
  );

  async function signOut() {
    await transact((s) => {
      s.session = false;
    });
    navigate("account/login");
    toast("Signed out. Your local demo history is preserved.");
  }
  document.addEventListener(
    "submit",
    async (e) => {
      const form = e.target,
        originPath = currentPath;
      if (
        !form.matches(
          "[data-walletform],[data-authform],[data-gameform],[data-eventfilter],[data-resultsfilter],[data-settingsform],[data-supportform],.login-form,.reg-panel",
        )
      )
        return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (form.matches(".login-form,.reg-panel")) {
        form.reset();
        navigate(
          form.matches(".reg-panel") ? "account/register" : "account/login",
        );
        return;
      }
      if (form.hasAttribute("data-eventfilter")) {
        listQuery = form.elements.query.value.trim().slice(0, 100);
        listLeague = form.elements.league.value;
        renderPage();
        return;
      }
      if (form.hasAttribute("data-resultsfilter")) {
        listQuery = form.elements.query.value.trim().slice(0, 100);
        listSport = form.elements.sport.value;
        renderPage();
        return;
      }
      if (form.hasAttribute("data-gameform")) {
        startGame(form);
        return;
      }
      if (form.hasAttribute("data-supportform")) {
        const subject = form.elements.subject.value.trim(),
          message = form.elements.message.value.trim();
        if (!subject || !message) {
          feedback(form, "Enter a subject and message.");
          return;
        }
        const b = form.querySelector("button");
        await withButton(b, async () => {
          await transact((s) => {
            s.messages = s.messages || [];
            s.messages.unshift({
              id: uid("HELP"),
              subject: subject.slice(0, 80),
              message: message.slice(0, 2000),
              time: stamp(),
            });
          });
          if (currentPath === originPath) renderHelp("support");
          toast("Demo request saved locally.");
        });
        return;
      }
      if (form.hasAttribute("data-walletform")) {
        const raw = form.elements.amount.value.trim(),
          error = amountError(raw);
        if (error) {
          feedback(form, error);
          return;
        }
        const type = form.dataset.walletform,
          amount = cents(raw),
          operation = form.dataset.operation,
          method = form.elements.method.value;
        if (type === "withdraw" && amount > balance()) {
          feedback(form, "Amount exceeds your available demo balance.");
          return;
        }
        confirmAction(
          type === "deposit"
            ? "Confirm demo top up"
            : "Confirm demo withdrawal",
          `<dl class="receipt-details"><div><dt>Amount</dt><dd>${money(amount)}</dd></div><div><dt>Method</dt><dd>${safe(method)}</dd></div></dl><p>No real payment or bank transfer will take place.</p>`,
          type === "deposit" ? "Add demo credits" : "Withdraw demo credits",
          async () => {
            await transact((s) => {
              if (s.ledger.some((x) => x.id === operation)) return;
              if (type === "deposit") {
                if (Date.now() < s.settings.excludedUntil)
                  throw Error("Deposits are paused during your demo break.");
                if (
                  limitTotal(s, "Demo deposit") + amount >
                  s.settings.depositLimit
                )
                  throw Error("This exceeds your daily demo deposit limit.");
                setLedger(s, "Demo deposit", amount, method, operation);
              } else {
                if (balance(s) < amount)
                  throw Error("Insufficient demo balance.");
                setLedger(s, "Demo withdrawal", -amount, method, operation);
              }
            });
            if (currentPath === originPath) navigate("wallet/transactions");
            toast(
              type === "deposit"
                ? "Demo credits added."
                : "Demo withdrawal completed.",
            );
          },
        );
        return;
      }
      const button = form.querySelector("button");
      if (button?.disabled) return;
      if (button) button.disabled = true;
      try {
        if (form.hasAttribute("data-authform")) {
          const type = form.dataset.authform;
          if (type === "register") {
            const name = form.elements.name.value.trim(),
              pin = form.elements.pin.value;
            if (!name || name.length > 40)
              throw Error("Enter a display name with 1 to 40 characters.");
            if (!/^\d{6}$/.test(pin)) throw Error("Use a six-digit demo PIN.");
            if (pin !== form.elements.confirm.value)
              throw Error("The PINs do not match.");
            if (!form.elements.terms.checked)
              throw Error("Confirm that you understand this is a demo.");
            if (state.profile && !state.profile.legacy)
              throw Error(
                "A local profile already exists. Log in or recover its PIN.",
              );
            const salt = crypto.randomUUID(),
              hash = await hashPIN(pin, salt),
              recovery = crypto
                .randomUUID()
                .replaceAll("-", "")
                .slice(0, 16)
                .toUpperCase(),
              recoveryHash = await hashPIN(recovery, salt);
            await transact((s) => {
              if (s.profile && !s.profile.legacy)
                throw Error("A local profile already exists.");
              s.profile = { id: uid("USER"), name, salt, hash, recoveryHash };
              s.session = true;
            });
            if (currentPath === originPath) navigate("account");
            openDialog(
              "Save your recovery code",
              `<p>This code resets your local demo PIN. Keep a copy before closing.</p><output class="booking-code recovery-code">${recovery}</output><button class="btn-green" data-copy="${recovery}">Copy recovery code</button><button class="inline-action" data-close>Continue</button>`,
            );
          } else if (type === "login") {
            if (!state.profile?.hash)
              throw Error("Create a demo account first.");
            const hash = await hashPIN(
              form.elements.pin.value,
              state.profile.salt,
            );
            await transact((s) => {
              if (!s.profile || s.profile.hash !== hash)
                throw Error("Incorrect demo PIN. Please try again.");
              s.session = true;
            });
            if (currentPath === originPath) navigate("account");
          } else if (type === "recover") {
            if (!state.profile?.hash)
              throw Error("No recoverable local account exists.");
            const recoveryHash = await hashPIN(
              form.elements.recovery.value.trim().toUpperCase(),
              state.profile.salt,
            );
            if (recoveryHash !== state.profile.recoveryHash)
              throw Error("Recovery code does not match.");
            const pin = form.elements.pin.value;
            if (!/^\d{6}$/.test(pin)) throw Error("Use a six-digit demo PIN.");
            const hash = await hashPIN(pin, state.profile.salt);
            await transact((s) => {
              if (!s.profile || s.profile.recoveryHash !== recoveryHash)
                throw Error("Profile changed. Please try again.");
              s.profile.hash = hash;
              s.session = true;
            });
            if (currentPath === originPath) navigate("account");
            toast("Demo PIN reset.");
          } else if (type === "pin") {
            if (!state.session || !state.profile) throw Error("Log in first.");
            const currentHash = await hashPIN(
                form.elements.oldpin.value,
                state.profile.salt,
              ),
              pin = form.elements.pin.value;
            if (currentHash !== state.profile.hash)
              throw Error("Current demo PIN is incorrect.");
            if (!/^\d{6}$/.test(pin)) throw Error("Use a six-digit demo PIN.");
            const hash = await hashPIN(pin, state.profile.salt);
            await transact((s) => {
              if (!s.session || s.profile.hash !== currentHash)
                throw Error("Please log in again.");
              s.profile.hash = hash;
            });
            form.reset();
            toast("Demo PIN updated.");
          } else if (type === "edit") {
            const name = form.elements.name.value.trim();
            if (!name || name.length > 40)
              throw Error("Enter a display name with 1 to 40 characters.");
            await transact((s) => {
              if (!s.session || !s.profile) throw Error("Please log in.");
              s.profile.name = name;
              s.profile.sport = form.elements.sport.value.trim().slice(0, 30);
            });
            if (currentPath === originPath) navigate("account");
            toast("Profile saved.");
          }
        } else if (form.hasAttribute("data-settingsform")) {
          if (form.dataset.settingsform === "limits") {
            const dep = form.elements.deposit.value.trim(),
              wager = form.elements.wager.value.trim();
            if (amountError(dep, 50) || amountError(wager, 50))
              throw Error(
                "Use positive limits between NGN 50 and NGN 1,000,000.",
              );
            await transact((s) => {
              s.settings.depositLimit = cents(dep);
              s.settings.wagerLimit = cents(wager);
            });
            toast("Demo limits saved.");
          } else {
            const hours = Number(form.elements.hours.value);
            if (![1, 24, 168].includes(hours))
              throw Error("Choose a valid pause duration.");
            await transact((s) => {
              if (Date.now() < s.settings.excludedUntil)
                throw Error("Your demo break is already active.");
              s.settings.excludedUntil = Date.now() + hours * 3600000;
            });
            if (currentPath === originPath) renderSettings("responsible");
            toast("Demo play paused.");
          }
        }
      } catch (err) {
        feedback(form, err.message);
      } finally {
        if (button?.isConnected) button.disabled = false;
      }
    },
    true,
  );
  document.addEventListener(
    "change",
    (e) => {
      if (e.target.matches("[data-preference-motion]")) {
        const reduced = e.target.checked;
        document.documentElement.dataset.motion = reduced ? "reduce" : "";
        storage.set("sporty-motion", reduced ? "reduce" : "");
        transact((s) => (s.settings.reduceMotion = reduced)).catch((err) =>
          toast(err.message),
        );
      }
    },
    true,
  );

  // Route, cross-tab and resizing recovery keep a single betslip and wallet source of truth.
  addEventListener("hashchange", () => {
    marketGroup = "All";
    renderPage();
    scrollTo({ top: 0, behavior: motionReduced() ? "instant" : "smooth" });
  });
  addEventListener("storage", (e) => {
    if (e.key === KEY) {
      state = load();
      syncCore();
      if (
        !activeDialog?.open &&
        !document.activeElement?.matches("input,select,textarea")
      )
        renderPage();
    }
  });
  function homeEventRow(id) {
    const m = meta(id),
      f = fixture(id);
    let market =
      liveMarket === "Next Goal"
        ? allMarkets(id).find((x) => x.id.startsWith("next:"))
        : liveMarket === "O/U"
          ? allMarkets(id).find((x) => x.id.startsWith("totals:"))
          : liveMarket === "DC"
            ? allMarkets(id).find((x) => x.id === "dc")
            : liveMarket === "Hand"
              ? allMarkets(id).find((x) => x.id === "handicap:-1")
              : liveMarket === "1st Half O/U"
                ? allMarkets(id).find((x) => x.id === "half-total:0.5")
                : allMarkets(id)[0];
    if (!market) return eventCard(id);
    const choices = market.outcomes
      .map(([o, v]) => marketOdd(id, market.id, o, v))
      .join("");
    const rowHTML = `<div class="live-row"><div class="match-when"><div class="time">45:00</div><div class="ht">HT</div></div><button class="match-teams" data-detail="${id}"><span class="team">${safe(f[0])}</span><span class="team">${safe(f[1])}</span></button><div class="live-score">${f[2]}<br>${f[3]}</div><div class="odds-cols alternate-home-market">${choices}</div></div>`;
    return mobile
      ? `<article class="m-match"><div class="m-match-meta"><strong>45:00 HT</strong><span>${safe(m.league)}</span><button data-detail="${id}" aria-label="Event details">${icon("chart")}</button></div><p class="home-market-name">${safe(market.title)}</p>${rowHTML}</article>`
      : `<div class="home-market-row"><p class="home-market-name">${safe(market.title)} · ${safe(m.league)}</p>${rowHTML}</div>`;
  }
  const originalLive = liveContent;
  liveContent = function (limit = 10) {
    if (
      liveSport === "Football" &&
      liveMarket === "1X2" &&
      Object.keys(state.results).length === 0
    )
      return originalLive(limit);
    if (liveSport === "Football") {
      const ids = fixtureIds()
        .filter(
          (id) =>
            meta(id).sport === "Football" &&
            status(id) === "live" &&
            (liveLeague === "All" || meta(id).league === liveLeague),
        )
        .slice(0, limit);
      return ids.length
        ? `<div class="${mobile ? "" : "live-group"}">${ids.map((id) => homeEventRow(id)).join("")}</div>`
        : emptyState(
            "No live events",
            "All selected events have finished.",
            "View results",
            'data-path="results"',
          );
    }
    const ids = fixtureIds().filter(
      (id) => meta(id).sport === liveSport && status(id) === "live",
    );
    return ids.length
      ? `<div class="home-extra-events">${ids.map((id) => eventCard(id)).join("")}</div>`
      : emptyState(
          "No live " + liveSport + " events",
          "Browse upcoming events in this sport.",
          "Upcoming events",
          `data-path="sports/${sportSlug(liveSport)}"`,
        );
  };
  const oldLoadBooking = loadBooking;
  loadBooking = function (form) {
    oldLoadBooking(form);
    if (!mobile && portal && !portal.isConnected) navigate("sports/football");
  };
  window.addEventListener("beforeunload", () => {
    persist();
    storage.set("sporty-jackpot-picks", JSON.stringify(jackpotPicks));
  });
  const savedBoard = readJSON("sporty-jackpot-picks", {});
  if (savedBoard && typeof savedBoard === "object")
    jackpotPicks = Object.fromEntries(
      Object.entries(savedBoard).filter(
        ([id, o]) =>
          jackpotIds.includes(Number(id)) &&
          ["home", "draw", "away"].includes(o),
      ),
    );
  enhanceMount();
  renderPage();
  if (!globalThis.DEMO_EMBEDDED_ASSETS && ["http:","https:"].includes(location.protocol) && "serviceWorker" in navigator)
    navigator.serviceWorker.register(new URL("../../sw.js", document.currentScript.src).href).catch(() => {});
})();
