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
    ...Object.keys(demoFixtures).map(Number).filter(id=>!demoFixtures[id].virtual),
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
      tag.innerHTML = `<a class="portfolio-return" href="/" aria-label="Back to portfolio">Portfolio</a><span>DEMO · No real funds</span>`;
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
    document.documentElement.dataset.surface="home";
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
      const target=tabs[0].getAttribute("aria-controls");
      const existing=target?document.getElementById(target):null;
      const content=existing||document.createElement("div");
      if(!existing){
        content.className="tab-result-panel";content.id="route-panel-"+index;
        content.setAttribute("role","tabpanel");
        while(list.nextSibling)content.append(list.nextSibling);
        list.after(content);
      }
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
  let referencePhone='',referenceJoinStep=0,referenceRecoveryStep=0;
  const referencePhoneField=(value='')=>`<label class="reference-phone-field"><span>+234</span><input name="phone" type="tel" inputmode="tel" placeholder="Mobile Number" aria-label="Demo mobile number" autocomplete="off" maxlength="11" pattern="0?[789][01][0-9]{8}" required value="${safe(value)}"></label>`;
  function referenceAuthMarkup(type){
    const register=type==='register',phone=referencePhone||state.profile?.phone||'';
    const top=mobile?`<div class="reference-auth-country"><img src="${asset('flagNigeria.12aeae58bb.png')}" alt="Nigeria"><span>Nigeria</span><button data-reference-region>Change${icon('chevron',20)}</button><a href="#/home" aria-label="Close sign in">${icon('close',22)}</a></div>`:`<div class="reference-auth-tabs"><button data-reference-auth-tab="register" aria-selected="${register}">Register</button><button data-reference-auth-tab="login" aria-selected="${!register}">Login</button></div><span class="reference-auth-ball" aria-hidden="true"></span>`;
    if(register&&mobile&&referenceJoinStep===0)return `${top}<div class="reference-auth-form reference-join-start"><h2>Join SportyBet<br>with your mobile number</h2><form data-reference-phone-next>${referencePhoneField(phone)}<button class="btn-green" disabled>Next</button>${formError()}</form><a href="#/account/login" class="reference-auth-switch">Already have an account? Log In</a><p class="reference-auth-disclosure">Independent local demo. Use made-up details.</p></div>`;
    return `${top}<div class="reference-auth-form"><form data-authform="${type}">${referencePhoneField(phone)}<label class="reference-password-field"><input name="pin" type="password" placeholder="${register?'Set Password':'Password'}" aria-label="${register?'Set six-digit demo PIN':'Demo PIN'}" inputmode="numeric" pattern="[0-9]{6}" minlength="6" maxlength="6" required autocomplete="off"><button type="button" data-reference-password aria-label="Show demo PIN">${icon('eye',20)}</button></label>${register?`<input type="hidden" name="name" value="Demo player"><input type="hidden" name="confirm"><label class="reference-auth-consent"><input type="checkbox" name="terms" required><span>I understand this is an independent demo with no real funds.</span></label>`:`<div class="reference-auth-checks"><label><input type="checkbox" checked>Remember me</label><label><input type="checkbox" checked>Keep me signed in</label></div>`}${formError()}<button class="btn-green" disabled>${register?'Create New Account':'Login'}</button></form>${register?`<p class="reference-auth-terms">By creating a local demo account, you agree to the <a href="#/help/terms">demo terms</a>. You must be at least 18 years old.</p>`:`<div class="reference-auth-links"><a href="#/account/recover">Forgot Password?</a><button data-reference-auth-tab="register">Create New Account</button></div><div class="reference-auth-or">Or</div><p class="reference-auth-deactivate">To deactivate or reactivate your local account <a href="#/account/security">click here.</a></p>`}<p class="reference-auth-disclosure">Independent local demo. Password is a six-digit demo PIN. Never enter your SportyBet password.</p></div>`;
  }
  function referenceAuth(type,modal=false){
    if(modal){const d=openDialog(type==='register'?'Register':'Login',referenceAuthMarkup(type));d.classList.add('reference-auth-dialog');return}
    pageShell(type==='register'?'Register':'Login',`<section class="reference-auth-screen">${referenceAuthMarkup(type)}</section>`,{full:true,aside:false});document.documentElement.dataset.surface='auth';
  }
  function referenceRegion(){
    const countries=['Nigeria','Ghana','Tanzania','Zambia','South Africa','Cameroon','Mozambique','Kenya'];
    const d=openDialog('Location Preference',`<div class="reference-region-list">${countries.map(c=>`<button data-reference-region-pick="${c}" aria-pressed="${c===(storage.get('sporty-reference-region')||'Nigeria')}"><img src="${asset('flags/'+({'Nigeria':'ng','Ghana':'gh','Tanzania':'tz','Zambia':'zm','South Africa':'za','Cameroon':'cm','Mozambique':'mz','Kenya':'ke'}[c])+'.svg')}" alt=""><span>${c}</span>${c===(storage.get('sporty-reference-region')||'Nigeria')?icon('check',24):''}</button>`).join('')}</div><p class="reference-region-note">Visual location preference only. The demo uses NGN credits.</p>`);d.classList.add('reference-region-dialog');
  }
  document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.matches('.geo-btn')){e.preventDefault();e.stopImmediatePropagation();referenceRegion();return}const keys=['referenceAuthTab','referencePassword','referenceRegion','referenceRegionPick'];const k=keys.find(k=>Object.hasOwn(b.dataset,k));if(!k)return;e.preventDefault();e.stopImmediatePropagation();
    if(k==='referenceAuthTab'){referenceJoinStep=0;if(mobile)navigate('account/'+b.dataset[k]);else referenceAuth(b.dataset[k],Boolean(activeDialog?.classList.contains('reference-auth-dialog')));return}
    if(k==='referencePassword'){const input=b.parentElement.querySelector('input');const show=input.type==='password';input.type=show?'text':'password';b.setAttribute('aria-label',show?'Hide demo PIN':'Show demo PIN');b.innerHTML=icon(show?'eye-off':'eye',20);drawIcons();return}
    if(k==='referenceRegion'){referenceRegion();return}
    storage.set('sporty-reference-region',b.dataset[k]);closeDialog();document.querySelectorAll('.reference-auth-country>span').forEach(el=>el.textContent=b.dataset[k]);toast('Demo location preference saved. Credits remain in NGN.');
  },true);
  document.addEventListener('input',e=>{if(!e.target.closest('.reference-auth-form'))return;const f=e.target.closest('form');if(!f)return;if(f.elements.phone)referencePhone=f.elements.phone.value;const phoneOk=/^0?[789][01][0-9]{8}$/.test(referencePhone);if(f.elements.confirm)f.elements.confirm.value=f.elements.pin.value;if(f.elements.name)f.elements.name.value='Demo '+referencePhone.slice(-4);const valid=phoneOk&&(!f.elements.pin||/^\d{6}$/.test(f.elements.pin.value))&&(!f.elements.terms||f.elements.terms.checked);f.querySelector('.btn-green').disabled=!valid},true);
  document.addEventListener('change',e=>{if(e.target.matches('.reference-auth-form input[type=checkbox]'))e.target.dispatchEvent(new Event('input',{bubbles:true}))},true);
  document.addEventListener('submit',e=>{if(e.target.matches('[data-reference-recovery-next]')){e.preventDefault();e.stopImmediatePropagation();referencePhone=e.target.elements.phone.value;if(!state.profile){feedback(e.target,'No local profile exists on this browser. Create a demo account first.');return}if(state.profile.phone&&state.profile.phone!==referencePhone){feedback(e.target,'This number does not match your local demo profile.');return}referenceRecoveryStep=1;renderAccount('recover');return}if(!e.target.matches('[data-reference-phone-next]'))return;e.preventDefault();e.stopImmediatePropagation();referencePhone=e.target.elements.phone.value;referenceJoinStep=1;referenceAuth('register')},true);

  let referenceDayFilter='All',referenceSelectedLeagues=[],referenceCountry='Top Leagues',referenceDraftLeagues=new Set(),referenceCalendarTarget='results',referenceTimeHours=null,referenceResultCountry='All';
  function referenceFilterDialog(kind){
    if(kind==='Results'){referenceResultsDialog();return}
    if(kind==='League')referenceDraftLeagues=new Set(referenceSelectedLeagues);
    const currentLeague=listLeague==='All'?'':listLeague;
    const hidden=`<input type="hidden" name="league" value="${safe(listLeague)}"><input type="hidden" name="query" value="${safe(listQuery)}"><input type="hidden" name="sort" value="${referenceSort}"><input type="hidden" name="status" value="${listStatus}">`;
    let body='';
    if(kind==='Daily')body=`<div class="reference-day-options">${['All','Today','Tomorrow','Sunday','Monday','Tuesday','Wednesday','Thursday','Weekend'].map((s,i)=>`<button data-reference-day="${s}" aria-pressed="${referenceDayFilter===s}">${s}<span>(${referenceDayCount(s)})</span></button>`).join('')}<button data-reference-custom-date>Custom date${icon('calendar-days',16)}</button><label class="reference-custom-time"><span>Custom time</span><input type="range" min="1" max="168" value="${referenceTimeHours||24}" name="hours" data-reference-time-hours aria-label="Hours from reference snapshot"></label><div class="reference-time-labels"><span>0h 1h</span><span>6h</span><span>12h</span><span>1d</span><span>1w</span></div><button class="reference-clear-filter" data-reference-day="All">Clear all</button></div>`;
    else if(kind==='League')body=`<form class="reference-league-picker" data-reference-league-form><div class="reference-league-columns"><nav>${['Top Leagues','International','International Clubs','England','Spain','Germany','Italy','France','Albania','Algeria','Andorra','Argentina','Armenia','Australia','Austria','Belgium','Brazil','Nigeria','Portugal'].map(c=>`<button type="button" data-reference-country="${c}" aria-pressed="${referenceCountry===c}">${c}</button>`).join('')}</nav><div class="reference-league-options">${referenceLeagueOptions()}</div></div><div class="reference-picker-actions"><button type="button" data-reference-clear-leagues>Reset</button><button class="btn-green">View</button></div></form>`;
    else if(kind==='Sort')body=`<div class="reference-sort-options">${[['default','Default'],['date','Time'],['league','League']].map(([v,t])=>`<button data-reference-sort="${v}" aria-pressed="${referenceSort===v}"><span>${t}</span>${referenceSort===v?icon('check',20):''}</button>`).join('')}</div>`;
    else body=`<form data-reference-event-filter class="reference-odds-picker">${hidden}<div class="reference-odds-options">${[['All',1000],['Odds ≤ 1.2',1.2],['Odds ≤ 1.5',1.5],['Odds ≤ 2',2]].map(([t,v])=>`<button type="button" data-reference-odds-preset="${v}">${t}</button>`).join('')}</div><div class="reference-odds-custom"><span>Custom</span><output data-reference-odds-output>${referenceOddsRange?referenceOddsRange.join(' - '):'1 - Max'}</output><button class="btn-green" disabled>Apply</button></div><div class="reference-range-pair"><input type="range" min="1" max="20" step="0.1" name="min" value="${referenceOddsRange?.[0]||1}" aria-label="Minimum odds"><input type="range" min="1" max="1000" step="0.1" name="max" value="${referenceOddsRange?.[1]||1000}" aria-label="Maximum odds"></div><div class="reference-time-labels"><span>1</span><span>Max</span></div>${formError()}</form>`;
    if(!mobile&&kind==='Odds'){
      const prior=document.querySelector('.reference-inline-odds');if(prior){prior.remove();return}
      const box=document.createElement('div');box.className='reference-inline-odds';box.setAttribute('role','dialog');box.setAttribute('aria-label','Odds filter');box.innerHTML=body;document.querySelector('.odds-filter').after(box);drawIcons();return;
    }
    const d=openDialog(kind+' filter',body);d.classList.add('reference-filter-popover','reference-filter-'+kind.toLowerCase());d.dataset.referencePopover=kind;
    const rect=document.querySelector(mobile?'.reference-mobile-filters':'.odds-filter')?.getBoundingClientRect();
    if(rect){d.style.setProperty('--reference-drop-top',Math.min(rect.bottom,innerHeight-200)+'px');if(!mobile){d.style.setProperty('--reference-drop-left',rect.left+'px');d.style.setProperty('--reference-drop-width',rect.width+'px')}}
    document.querySelectorAll('[data-reference-filter]').forEach(b=>b.setAttribute('aria-expanded',String(b.dataset.referenceFilter===kind)));
    d.addEventListener('close',()=>document.querySelectorAll('[data-reference-filter]').forEach(b=>b.setAttribute('aria-expanded','false')));
    d.addEventListener('click',e=>{if(e.target===d&&mobile&&rect&&e.clientY>=rect.top&&e.clientY<rect.bottom){const tab=['Daily','League','Odds','Sort'][Math.min(3,Math.floor(e.clientX/(innerWidth/4)))];if(tab===kind)closeDialog();else referenceFilterDialog(tab)}});
  }
  function referenceDayMatches(id,day=referenceDayFilter){const date=meta(id).day||'',days={Today:'06/11',Tomorrow:'07/11',Sunday:'08/11',Monday:'09/11',Tuesday:'10/11',Wednesday:'11/11',Thursday:'12/11'};return day==='All'||day==='Weekend'&&/^(07|08)\/11/.test(date)||date.startsWith(days[day]||day)}
  function referenceKickoff(id){const m=meta(id),date=/^(\d{2})\/(\d{2})/.exec(m.day||''),time=/^(\d{1,2}):(\d{2})/.exec(m.time||'');return date&&time?Date.UTC(2026,Number(date[2])-1,Number(date[1]),Number(time[1])-1,Number(time[2])):Infinity}
  function referenceDayCount(day){return fixtureIds().filter(id=>meta(id).sport===listSport&&referenceDayMatches(id,day)).length}
  function referenceLeagueOptions(){const leagues=[...new Set(fixtureIds().filter(id=>meta(id).sport===listSport).map(id=>meta(id).league))].filter(l=>referenceCountry==='Top Leagues'||referenceCountry==='International'||l.toLowerCase().includes(referenceCountry.toLowerCase()));return `<label><input type="checkbox" name="all" ${!referenceDraftLeagues.size?'checked':''}><span>All</span></label>`+leagues.map(l=>`<label><input type="checkbox" name="league" value="${safe(l)}" ${referenceDraftLeagues.has(l)?'checked':''}><span>${safe(l)}</span></label>`).join('')}
  function resultTournamentOptions(country,value='All'){return '<option value="All">All Tournaments</option>'+referenceUI.results.filter(g=>country==='All'||g.title.startsWith(country+' - ')).map(g=>`<option value="${safe(g.title)}" ${g.title===value?'selected':''}>${safe(g.title.split(' - ').slice(1).join(' - '))}</option>`).join('')}
  function referenceResultsDialog(){const countries=[...new Set(referenceUI.results.map(g=>g.title.split(' - ')[0]))];openDialog('Change results filters',`<form class="reference-filter-form reference-result-change" data-reference-results-filter><label class="form-field"><span>Sport</span><select name="sport">${['Football',...sports.filter(s=>s!=='Football')].map(s=>`<option ${listSport===s?'selected':''}>${s}</option>`).join('')}</select></label><label class="form-field"><span>Category</span><select name="country"><option value="All">All Categories</option>${countries.map(c=>`<option ${referenceResultCountry===c?'selected':''}>${safe(c)}</option>`).join('')}</select></label><label class="form-field"><span>Tournament</span><select name="category">${resultTournamentOptions(referenceResultCountry,referenceResultCategory)}</select></label><input type="hidden" name="query" value="${safe(listQuery)}">${formError()}<div class="reference-picker-actions"><button type="button" data-reference-reset-result-dialog>Reset</button>${primary('Apply')}</div></form>`).classList.add('reference-results-dialog')}
  document.addEventListener('change',e=>{if(e.target.matches('[data-reference-results-filter] [name=country]'))e.target.form.elements.category.innerHTML=resultTournamentOptions(e.target.value)},true);
  document.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;const keys=['referenceDay','referenceCountry','referenceClearLeagues','referenceSort','referenceOddsPreset','referenceCustomDate','referenceResetResultDialog'];const k=keys.find(k=>Object.hasOwn(b.dataset,k));if(!k)return;e.preventDefault();e.stopImmediatePropagation();
    if(k==='referenceDay'){referenceDayFilter=b.dataset[k];if(referenceDayFilter==='All')referenceTimeHours=null;listStatus='all';closeDialog();renderPage();return}
    if(k==='referenceSort'){referenceSort=b.dataset[k];closeDialog();renderPage();return}
    if(k==='referenceCountry'){referenceCountry=b.dataset[k];document.querySelectorAll('[data-reference-country]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.querySelector('.reference-league-options').innerHTML=referenceLeagueOptions();return}
    if(k==='referenceClearLeagues'){referenceDraftLeagues.clear();document.querySelector('.reference-league-options').innerHTML=referenceLeagueOptions();return}
    if(k==='referenceOddsPreset'){referenceOddsRange=Number(b.dataset[k])===1000?null:[1,Number(b.dataset[k])];closeDialog();renderPage();return}
    if(k==='referenceCustomDate'){referenceCalendar('sports');return}
    if(k==='referenceResetResultDialog'){const f=b.closest('form');f.elements.sport.value='Football';f.elements.country.value='All';f.elements.category.innerHTML=resultTournamentOptions('All');f.elements.query.value='';return}
  },true);
  document.addEventListener('submit',e=>{if(!e.target.matches('[data-reference-league-form]'))return;e.preventDefault();e.stopImmediatePropagation();referenceSelectedLeagues=[...referenceDraftLeagues];listLeague='All';closeDialog();renderPage()},true);
  document.addEventListener('change',e=>{if(!e.target.matches('.reference-league-options input'))return;if(e.target.name==='all'){referenceDraftLeagues.clear();document.querySelectorAll('.reference-league-options [name=league]').forEach(x=>x.checked=false)}else{if(e.target.checked)referenceDraftLeagues.add(e.target.value);else referenceDraftLeagues.delete(e.target.value);e.target.closest('form').querySelector('[name=all]').checked=!referenceDraftLeagues.size}},true);
  document.addEventListener('input',e=>{if(!e.target.matches('.reference-range-pair input'))return;const form=e.target.closest('form'),min=Number(form.elements.min.value),max=Number(form.elements.max.value);form.querySelector('[data-reference-odds-output]').textContent=min+' - '+(max===1000?'Max':max);feedback(form,min>max?'Minimum odds must not exceed maximum odds.':'');form.querySelector('.btn-green').disabled=min>max},true);

  function referenceCalendar(target='results'){referenceCalendarTarget=target;openDialog(target==='sports'?'Select match date':'Select result date',`<p>November 2026</p><div class="reference-calendar">${['M','T','W','T','F','S','S'].map(d=>`<span>${d}</span>`).join('')}${Array.from({length:30},(_,i)=>`<button data-reference-date-pick="${i+1}" aria-pressed="${i+1===referenceResultDateOffset+5}">${i+1}</button>`).join('')}</div>`)}
  document.addEventListener('click',e=>{
    const b=e.target.closest('button,a');if(!b)return;
    const keys=['referenceStatus','referenceFilter','referenceListMarket','referencePromoFilter','referenceRefresh','referenceLeague','referenceDate','referenceDatePick','referenceResetFilters','resetResults'];
    const key=keys.find(k=>Object.hasOwn(b.dataset,k));if(!key)return;e.preventDefault();e.stopImmediatePropagation();
    if(key==='referenceFilter'){referenceFilterDialog(b.dataset[key]);return}
    if(key==='referenceStatus'){listStatus=b.dataset[key];renderPage();return}
    if(key==='referenceListMarket'){referenceListMarket=b.dataset[key];renderPage();return}
    if(key==='referencePromoFilter'){referencePromoFilter=b.dataset[key];referencePromotions();return}
    if(key==='referenceRefresh'){renderPage();toast('Showing the saved reference snapshot. No live feed is connected.');return}
    if(key==='referenceLeague'){const name=b.dataset[key];listLeague=['England','Top Leagues'].includes(name)?'England Premier League':name;listStatus='all';renderSports();return}
    if(key==='resetResults'){referenceResultDateOffset=0;referenceResultCategory='All';referenceResultCountry='All';listSport='Football';listQuery='';renderResults(currentPath==='results');return}
    if(key==='referenceResetFilters'){referenceDayFilter='All';referenceSelectedLeagues=[];referenceOddsRange=null;referenceSort='default';referenceTimeHours=null;listQuery='';listLeague='All';listStatus='all';closeDialog();renderPage();return}
    if(key==='referenceDatePick'){if(referenceCalendarTarget==='sports'){referenceDayFilter=String(b.dataset[key]).padStart(2,'0')+'/11';listStatus='all';closeDialog();renderSports();return}referenceResultDateOffset=Number(b.dataset[key])-5;closeDialog();renderResults(currentPath==='results');return}
    if(key==='referenceDate'){if(b.dataset[key]==='0'){referenceCalendar();return}referenceResultDateOffset+=Number(b.dataset[key]);renderResults(currentPath==='results');return}
  },true);
  document.addEventListener('submit',e=>{
    const form=e.target;if(!form.matches('[data-reference-event-filter],[data-reference-results-filter],[data-reference-menu-search]'))return;
    e.preventDefault();e.stopImmediatePropagation();
    if(form.hasAttribute('data-reference-menu-search')){listQuery=form.elements.query.value.trim();listLeague='All';listStatus='all';navigate('sports/football');return}
    if(form.hasAttribute('data-reference-results-filter')){listSport=form.elements.sport.value;listQuery=form.elements.query.value.trim();referenceResultCategory=form.elements.category.value;referenceResultCountry=form.elements.country.value;closeDialog();renderResults(currentPath==='results');return}
    const min=Number(form.elements.min.value),max=Number(form.elements.max.value);if(!Number.isFinite(min)||!Number.isFinite(max)||min<1||max<min||max>1000){feedback(form,'Use odds between 1 and 1000, with the maximum above the minimum.');return}
    referenceOddsRange=min===1&&max===1000?null:[min,max];listLeague=form.elements.league.value;listQuery=form.elements.query.value.trim();listStatus=form.elements.status.value;referenceSort=form.elements.sort.value;closeDialog();renderPage();
  },true);
  document.addEventListener('change',e=>{if(e.target.matches('[data-reference-time]')){referenceTimeHours=[1,3,6,24,null][Number(e.target.value)];listStatus='all';renderPage()}if(e.target.matches('[data-reference-time-hours]')){referenceTimeHours=Number(e.target.value);listStatus='all';closeDialog();renderPage()}},true);

  const referenceTimerStarted=Date.now();
  setInterval(()=>{const left=Math.max(0,104681-Math.floor((Date.now()-referenceTimerStarted)/1000));const clock={Days:Math.floor(left/86400),Hours:Math.floor(left%86400/3600),Minutes:Math.floor(left%3600/60),Seconds:left%60};document.querySelectorAll('[data-reference-clock]').forEach(e=>e.textContent=String(clock[e.dataset.referenceClock]||0).padStart(2,'0'))},1000);

  function referenceSidebar(){
    const leagues=['Top Leagues','International','International Clubs','England','Spain','Germany','Italy','France'];
    return `<nav class="reference-sidebar" aria-label="Sports filters"><div class="sidebar-box">${[['Today Games','scheduled'],['Upcoming Games','all'],['Outrights','outrights']].map(([t,v])=>`<button data-reference-status="${v}">${t}${icon('chevron',14)}</button>`).join('')}</div><div class="sidebar-box time-filter"><strong>Filter by start time</strong><input type="range" min="0" max="4" value="${[1,3,6,24,null].indexOf(referenceTimeHours)}" aria-label="Filter by start time" data-reference-time><div><span>1 h</span><span>3 h</span><span>6 h</span><span>24 h</span><span>All</span></div></div><button class="sidebar-box odds-filter" data-reference-filter="Odds">Odds Filter ${icon('sliders-horizontal',16)}</button><div class="sidebar-box country-list">${leagues.map((l,i)=>`<button data-reference-league="${l}"><span>${l}</span><span>${[287,32,28,118,100,49,157,52][i]}</span></button>`).join('')}<strong>A–Z</strong>${['Albania','Algeria','Andorra','Argentina','Armenia','Australia','Austria','Austria Amateur','Azerbaijan','Bahrain','Belarus','Belgium','Bolivia','Bosnia and Herzegovina','Brazil','Bulgaria','Cambodia','Cameroon','Canada','Chile','China','Colombia','Croatia','Cyprus','Czechia','Denmark','Ecuador','Egypt','England','France','Germany','Italy','Japan','Netherlands','Nigeria','Portugal','Spain','USA'].map(l=>`<button data-reference-league="${l}">${l}${icon('chevron',12)}</button>`).join('')}</div></nav>`;
  }
  function referenceRegistration(){return `<form class="reference-registration reg-panel"><h2>Instant Registration</h2><p>Make a Deposit and Start Betting!</p><label class="reg-field"><span>+234</span><input aria-label="Registration Mobile Number" placeholder="Mobile Number" inputmode="tel"></label><button class="btn-green">Register</button></form>`;}
  function referenceToolbar(title){return `<div class="reference-breadcrumb"><span>${safe(title)}</span><span><button data-print aria-label="Print">${icon('printer',16)}</button><button data-reference-refresh aria-label="Refresh events">${icon('refresh',18)}</button></span></div>`;}
  function referenceScheduledRow(id){const f=fixture(id),m=meta(id),ref=referenceUI.football[id-100],markets=allMarkets(id),first=(referenceListMarket==="Main"?markets.find(x=>x.id==="dc"):referenceListMarket==="Goals"?markets.find(x=>x.id==="btts"):referenceListMarket==="Totals"?markets.find(x=>x.id.startsWith("half-total:")):referenceListMarket==="Handicap"?markets.find(x=>x.id.startsWith("handicap:")):null)||markets[0],total=markets.find(x=>x.id==='totals:2.5')||markets.find(x=>x.id.startsWith('totals:'));
    return `<article class="reference-match ${m.reference?'captured-match':''}"><div class="reference-match-meta"><time>${safe(m.time)}</time><span>ID ${safe(m.gameId||String(id))}</span><span class="mobile-competition">${safe(m.league)}</span><button data-star="${id}" aria-label="Pin ${safe(f[0])}" aria-pressed="${isStarred(id)}">${icon('chart-no-axes-combined',16)}</button></div><a class="reference-match-teams" href="#/event/${id}"><span>${safe(f[0])}</span><span>${safe(f[1])}</span></a><div class="reference-match-odds">${first.outcomes.map(([o,v])=>marketOdd(id,first.id,o,v)).join('')}</div>${total?`<div class="reference-match-totals"><button data-lines="${id}" class="odd-select" aria-label="Select total goals line">${safe(total.id.split(':')[1])}${icon('down',12)}</button>${total.outcomes.map(([o,v])=>marketOdd(id,total.id,o,v)).join('')}</div>`:''}<a class="reference-market-count" href="#/event/${id}">${safe(ref?.size||'+33')}${icon('chevron',12)}</a></article>`;
  }
  function referenceDay(label,two=false){const labels=referenceListMarket==='Main'?['1X','12','X2']:referenceListMarket==='Goals'?['Yes','No']:referenceListMarket==='Totals'?['Over','Under']:referenceListMarket==='Handicap'?['Home','Away']:two?['1','2']:['1','X','2'];return `<div class="reference-day"><strong>${safe(label)}</strong><div>${labels.map(x=>`<span>${x}</span>`).join('')}</div><div class="reference-day-totals"><span>Goals</span><span>Over</span><span>Under</span></div></div>`;}

  function referenceArticle(index){
    const article=SportyPromoReferences[index];if(!article)return false;
    document.documentElement.dataset.promoStandalone='true';
    pageShell(article.title,`<section class="reference-promo-reader"><h1 class="sr-only">${safe(article.title)}</h1><iframe class="reference-promo-frame" title="${safe(article.title)}" src="reference/promotions/${index}-${innerWidth<1000?'mobile':'desktop'}.html" sandbox="allow-scripts allow-same-origin" referrerpolicy="no-referrer"></iframe></section>`,{full:true,aside:false});return true;
  }
  window.addEventListener('resize',()=>{const frame=document.querySelector('.reference-promo-frame');if(!frame)return;const device=innerWidth<1000?'mobile':'desktop';if(!frame.src.endsWith('-'+device+'.html'))frame.src=frame.src.replace(/-(desktop|mobile)\.html$/,'-'+device+'.html')});
  window.addEventListener('message',event=>{const frame=document.querySelector('.reference-promo-frame');if(!frame||event.origin!==location.origin||event.source!==frame.contentWindow)return;const message=event.data;if(message?.type==='sporty-demo-article-size'&&Number.isFinite(message.height)){frame.style.height=Math.min(30000,Math.max(300,message.height))+'px';return}if(message?.type==='sporty-demo-article-action'&&['account/login','account/register','games','sports/football'].includes(message.destination))navigate(message.destination)});
  function referencePromotions(){
    if(currentPath.startsWith('promotions/reference/')){const parts=currentPath.split('/'),items=parts[2]==='features'?SportyMenu.features:SportyMenu.promotions,p=items[Number(parts[3])],index=p?SportyPromoReferences.findIndex(a=>a.source===p.url):-1;if(index>=0&&referenceArticle(index))return;}

    const part=currentPath.split('/')[2];
    if(part!=null&&referenceUI.promotions[Number(part)]){const p=referenceUI.promotions[Number(part)],items=[...SportyMenu.promotions,...SportyMenu.features],match=items.find(i=>i.title===p.title||i.title.startsWith(p.title)||p.title.startsWith(i.title)),index=match?SportyPromoReferences.findIndex(a=>a.source===match.url):-1;if(index>=0&&referenceArticle(index))return;}
    if(part!=null&&referenceUI.promotions[Number(part)]){const p=referenceUI.promotions[Number(part)];pageShell(p.title,`<article class="reference-promotion-detail"><img src="${asset(p.image)}" alt="${safe(p.title)}"><h2>${safe(p.title)}</h2><p>This is a captured promotion shown for visual reference. This portfolio demo does not participate in the official promotion or offer its advertised prizes.</p><a class="btn-green" href="#/games">Try local demo games</a><a class="inline-action" href="#/promotions">All promotions</a></article>`,{full:true,aside:false});return}
    const offers=referenceUI.promotions.filter(p=>referencePromoFilter==='All'||p.category===referencePromoFilter);
    pageShell('Promotions',`<section class="reference-promotions"><h2>Promotions</h2><div class="page-tabs reference-promo-tabs" role="tablist" aria-label="Promotion category">${['All','Games','Features'].map(t=>`<button role="tab" data-reference-promo-filter="${t}" aria-selected="${referencePromoFilter===t}">${t}</button>`).join('')}</div><div class="reference-promo-list">${offers.map(p=>`<a href="#/promotions/details/${referenceUI.promotions.indexOf(p)}" class="reference-promo-card"><img src="${asset(p.image)}" alt="${safe(p.title)}"><div><h3>${safe(p.title)}</h3>${icon('chevron',24)}</div></a>`).join('')}</div><details class="reference-local-rewards"><summary>Local demo rewards${icon('down',16)}</summary><p>Separate from the reference promotions above. Demo credits only.</p>${promotions.map(p=>`<article><h3>${p.title}</h3><p>${p.copy}</p>${primary(state.claimed.includes(p.id)?'Claimed':p.eligible()?'Claim demo reward':p.id==='welcome'?'Create demo account':'Place a demo bet',`data-claim="${p.id}" ${state.claimed.includes(p.id)?'disabled':''}`)}</article>`).join('')}</details></section>`,{full:true,aside:false});
  }
  let meBalanceVisible=true;
  function referenceGuestAccount(){
    const signed=Boolean(state.profile&&state.session);
    const preference=storage.get("sporty-me-theme")||"system",theme=preference==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):preference;
    pageShell('Me',`<section class="reference-me ${signed?'reference-me-signed':''}" data-me-mode="${theme}"><div class="reference-me-main">${signed?`<div class="signed-me-heading"><a href="#/account/edit" class="signed-me-profile"><span class="signed-me-avatar">${safe(state.profile.name.slice(0,1).toUpperCase())}</span><strong>${safe(state.profile.name)}</strong>${icon('chevron',16)}</a><a href="#/account/security" aria-label="Account settings">${icon('settings',24)}</a></div><a class="signed-me-tier" href="#/loyalty"><span>Loyalty Tier: <img src="${surface.loyalty.tiers[0].image}" alt="Iron"></span><span>${state.points} local demo points</span><span class="signed-me-progress" role="progressbar" aria-label="Local loyalty progress" aria-valuenow="${Math.min(10,state.points)}" aria-valuemin="0" aria-valuemax="10"><i style="width:${Math.min(100,state.points*10)}%"></i></span></a>`:`<button data-me-theme-toggle class="me-theme-toggle" aria-expanded="false" aria-haspopup="menu">Dark Mode ${icon('moon',17)}</button><a class="reference-me-login" href="#/account/login">${icon('circle-user',28)}<strong>Login to View</strong>${icon('chevron',18)}</a>`}<div class="reference-me-balance"><span>Total Balance</span><strong>${signed?(meBalanceVisible?money(balance()):'NGN ••••••'):'NGN --'}</strong>${signed?`<button data-me-balance aria-label="${meBalanceVisible?'Hide':'Show'} balance" aria-pressed="${!meBalanceVisible}">${icon(meBalanceVisible?'eye':'eye-off',18)}</button>`:''}</div><div class="reference-me-actions"><a class="btn-green" href="#/wallet/deposit">${icon('wallet',20)}Deposit</a><a href="#/wallet/withdraw">${icon('banknote',20)}Withdraw</a></div><a class="reference-me-loyalty" href="#/loyalty" style="background-image:url('${signed?asset('me-loyalty-banner.webp'):surface.loyalty.banner}')"><strong>Sporty Loyalty</strong><span>${signed?'Earn Rewards':'Log in to join'}${icon('chevron',20)}</span></a><div class="reference-me-records">${[['bets','receipt-text','Sports Bet History'],['wallet/transactions','refresh-cw','Transaction Records'],['promotions','gift','Gifts (0)<br>Lucky Wheel (0)']].map(([p,i,t])=>`<a href="#/${p}">${icon(i,26)}<span>${t}</span></a>`).join('')}</div></div><div class="reference-me-links">${[['promotions','Sporty Survivor','trophy'],['help/support','Customer Service','headset'],['help/faq','How to play','info'],...(signed?[['account/notifications','Notification Center','bell'],['help/support','Share an Idea','message-circle']]:[])].map(([p,t,i])=>`<a class="page-link" href="#/${p}">${icon(i,22)}<span>${t}</span>${p==='help/support'?'<small>Online 24/7</small>':''}${icon('chevron',20)}</a>`).join('')}</div><div class="reference-me-age">18+<small>© 2026 SportyBet. All rights reserved.</small></div><div class="reference-me-footer"><img src="${asset('Image_partnership_3logo_wap_69bcc5ae73.png')}" alt="SportyBet and LALIGA reference partners"><p>The world’s most visited betting platform</p><small>Payment methods</small><div class="reference-me-payments">${['footer_opay_logo_a954fa8a51.png','footer_palmpay_logo_dbb2dc54fc.png','footer_quickteller_logo_67ba461e70.png','footer_verve_logo_c68b5a53c0.png','footer_visa_logo_9dabd03576.png','footer_uba_logo_58a31a9c3b.png'].map(im=>`<img src="${asset(im)}" alt="${im.split('_')[1]} reference payment logo">`).join('')}</div><a href="#/help/terms">Demo terms & privacy</a>${signed?'<button class="signed-me-logout" data-signout-demo>Logout</button>':''}</div></section>`,{full:true,aside:false});
  }

  let referenceOddsRange=null,referenceListMarket="All",referencePromoFilter="All",referenceResultDateOffset=0,referenceResultCategory="All",referenceSort="default";
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
    const family=currentPath.split('/')[0];
    panel.className='route-view container reference-layout reference-'+family;
    const auth=currentPath.startsWith('account/')&&['login','register','recover'].includes(currentPath.split('/')[1]);
    document.documentElement.dataset.surface=auth?'auth':family;
    const structural=['sports','live','event','jackpot','results','scores','promotions','help','menu'].includes(family)||auth;
    const heading=mobile?`<header class="reference-mobile-header"><a href="#/home" aria-label="Back to home">${icon('arrow-left',26)}</a><h1>${safe(title)}</h1><button data-search aria-label="Search events">${icon('search',24)}</button><a href="#/home" aria-label="Home">${icon('house',24)}</a></header>`:structural?`<h1 class="sr-only">${safe(title)}</h1>`:`<div class="page-heading"><h1>${safe(title)}</h1></div>`;
    panel.innerHTML=heading+`<div class="demo-page-columns ${full?'full-page':''}"><section class="demo-page-content" tabindex="-1">${body}</section>${!mobile&&aside?`<aside class="reference-right-column">${referenceRegistration()}<div class="page-slip-portal"></div><a href="#/instant-football"><img src="${asset('59bd76f2fe42b8cd5daf90e91b822ef3.jpg')}" alt="Instant Football"></a></aside>`:''}</div>`;
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
    document.documentElement.dataset.promoStandalone='false';
    document.documentElement.dataset.surface=path.split("/")[0];
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
    if(main==="virtual"){if(parts[1]==="product")referenceVirtualProduct(Number(parts[2]));else if(parts[1]==="instant"&&Number(parts[2])>0)referenceVirtualProduct(Number(parts[2]));else if(parts[1]==="instant")referenceInstant();else if(parts[1]==="scheduled")renderVirtual("scheduled");else referenceVirtualLobby();return;}
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
  showLines=function(id){const totals=allMarkets(id).filter(m=>m.id.startsWith('totals:'));openDialog('Over/Under',`<p>${safe(fixture(id)[0])} vs ${safe(fixture(id)[1])}</p><p class="local-note">Available captured lines. Local demo selections only.</p>${totals.map(m=>`<section class="home-market-lines"><h3>${safe(m.title)}</h3><div>${m.outcomes.map(([o,v])=>marketOdd(id,m.id,o,v)).join('')}</div></section>`).join('')}`)};

  showTickets = () => navigate("bets");
  profile = () => navigate("account");
  showSports = () => navigate("sports/football");
  const baseMount = mount;
  mount = function () {
    baseMount();
    enhanceMount();
  };
  const sportSlug=s=>s.toLowerCase().replaceAll(' ','-');
  const sports=[...new Set(['Football','vFootball','Basketball','Tennis','eFootball','Table Tennis','eBasketball','eTennis','Ice Hockey','eIce Hockey','Handball','Volleyball','Baseball','American Football','Cricket','Darts','MMA','Boxing','Badminton','Beach Volleyball','Futsal','Rugby','Snooker','Basketball 3x3','ESport Counter-Strike','ESport Dota','ESport League of Legends'])];
  const sportFromSlug=slug=>sports.find(s=>sportSlug(s)===slug.toLowerCase())||'Football';
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
  function renderSports(liveOnly=false){
    const leagues=[...new Set(fixtureIds().filter(id=>meta(id).sport===listSport).map(id=>meta(id).league))];
    let ids=fixtureIds().filter(id=>meta(id).sport===listSport&&(liveOnly?status(id)==='live':listStatus==='all'||listStatus==='outrights'||status(id)===listStatus)&&(listLeague==='All'||meta(id).league===listLeague)&&(!onlyPinned||isStarred(id))&&(!listQuery||fixture(id).slice(0,2).join(' ').toLowerCase().includes(listQuery.toLowerCase())));
    ids.sort((a,b)=>referenceSort==='date'?referenceKickoff(a)-referenceKickoff(b):referenceSort==='name'?fixture(a)[0].localeCompare(fixture(b)[0]):referenceSort==='league'?meta(a).league.localeCompare(meta(b).league):Number(Boolean(meta(b).reference))-Number(Boolean(meta(a).reference))||Number(isStarred(b))-Number(isStarred(a)));
    if(!liveOnly){ids=ids.filter(id=>referenceDayMatches(id)&&(!referenceSelectedLeagues.length||referenceSelectedLeagues.includes(meta(id).league)))}
    if(referenceTimeHours!==null)ids=ids.filter(id=>{const delta=referenceKickoff(id)-Date.now();return delta>=0&&delta<=referenceTimeHours*3600000});
    if(referenceOddsRange)ids=ids.filter(id=>fixture(id)[4].some(v=>v>=referenceOddsRange[0]&&v<=referenceOddsRange[1]));
    const title=liveOnly?'Live':listSport,liveCount=fixtureIds().filter(id=>meta(id).sport===listSport&&status(id)==='live').length;
    const liveBanner=`<a class="reference-live-banner" href="#/live"><span>${icon('play',18)}Live Betting <b>${liveCount}</b></span><span>All Live <b>${fixtureIds().filter(id=>status(id)==='live').length}</b>${icon('chevron',20)}</span></a>`;
    let previous='',rows=ids.map(id=>{if(status(id)==='live'||status(id)==='finished')return eventCard(id);const day=meta(id).day||'Upcoming';let h=day!==previous?referenceDay(day,allMarkets(id)[0].outcomes.length===2):'';previous=day;return h+referenceScheduledRow(id)}).join('');
    if(listStatus==='outrights')rows=panelEmpty('No outright markets in this snapshot','Match markets remain available in the Matches tab.');
    const filters=`<div class="reference-mobile-filters">${['Daily','League','Odds','Sort'].map(x=>`<button data-reference-filter="${x}" aria-haspopup="dialog" aria-expanded="false">${x}${icon('down',14)}</button>`).join('')}</div>`;
    const bar=`<div class="reference-market-tabs">${[['3 Way & O/U','1X2','All'],['Double Chance','DC','Main'],['GG/NG','GG/NG','Goals'],['Draw No Bet','1st Half O/U','Totals'],['Other Markets','Handicap','Handicap']].map(([desktop,mobileLabel,g],i)=>`<button data-reference-list-market="${g}" aria-pressed="${referenceListMarket===g}"><span class="desktop-market-name">${desktop}</span><span class="mobile-market-name">${mobileLabel}</span></button>`).join('')}</div>`;
    const tabs=`<div class="reference-matches-tabs"><button data-reference-status="all" aria-pressed="${listStatus!=='outrights'}">Matches</button><button data-reference-status="outrights" aria-pressed="${listStatus==='outrights'}">Outrights</button></div>`;
    const content=`<div class="sports-layout">${referenceSidebar()}<section class="sport-events">${referenceToolbar(listSport)}${liveBanner}<div class="reference-competition"><h2>${icon('down',16)}${safe(listLeague==='All'?(listSport==='Football'?'England Premier League':listSport):listLeague)}</h2>${tabs}${filters}${bar}<div class="reference-fixture-list">${rows||panelEmpty('No matching events','Change your filters to find more fixtures.')}</div><button class="inline-action" data-reference-reset-filters>Reset filters</button></div></section></div>`;
    pageShell(title,content,{subtitle:'',aside:true});
  }

  let nativeVariants={}, nativePins=readJSON('sporty-market-pins',[]);
  if(!Array.isArray(nativePins))nativePins=[];
  function nativeOutcomes(group,variant){
    return `<div class="market-outcomes">${variant.outcomes.map(o=>`<div class="labelled-odd"><span>${safe(o.name)}</span>${variant.model&&o.active?marketOdd(100,variant.model,o.outcome,o.odd):`<button class="odd native-reference-odd" data-native-info="${group.id}" data-native-unavailable aria-label="${safe(o.name)} ${o.odd.toFixed(2)}; reference market information">${o.odd.toFixed(2)}</button>`}</div>`).join('')}</div>`;
  }
  function nativeMarketStack(){
    return SportyEventMarkets.filter(g=>marketGroup==='All'||g.category===marketGroup).map((g,i)=>{
      const variants=g.variants.filter(v=>g.id!=='18'||Number(v.specifier.split('=')[1])%1!==0);
      const v=variants[nativeVariants[g.id]||0]||variants[0];
      const totals=g.id==='18';
      return `<details class="market-block native-market-block" data-native-market="${g.id}" ${i<6?'open':''}><summary>${icon('down',14)}<span>${safe(g.name)}</span><button data-native-info="${g.id}" aria-label="${safe(g.name)} rules">${icon('info',14)}</button><button data-native-pin="${g.id}" aria-label="Favourite ${safe(g.name)}" aria-pressed="${nativePins.includes(g.id)}">${icon('star',20)}</button></summary>${totals?`<div class="native-total-heading"><span></span><b>Over</b><b>Under</b></div>${variants.map(v=>`<div class="native-total-row"><strong>${safe(v.specifier.split('=')[1])}</strong>${v.outcomes.map(o=>marketOdd(100,v.model,o.outcome,o.odd)).join('')}</div>`).join('')}`:`${variants.length>1?`<label class="native-variant-label">Market line <select data-native-variant="${g.id}">${variants.map((v,j)=>`<option value="${j}" ${v===(variants[nativeVariants[g.id]||0]||variants[0])?'selected':''}>${safe(v.specifier||g.name)}</option>`).join('')}</select></label>`:''}<div class="native-variant-outcomes">${nativeOutcomes(g,v)}</div>`}</details>`;
    }).join('');
  }
  document.addEventListener('click',event=>{
    const b=event.target.closest('[data-native-info],[data-native-pin]');if(!b)return;
    event.preventDefault();event.stopImmediatePropagation();
    const id=b.dataset.nativeInfo||b.dataset.nativePin,g=SportyEventMarkets.find(g=>g.id===id);
    if(b.hasAttribute('data-native-pin')){nativePins=nativePins.includes(id)?nativePins.filter(x=>x!==id):[...nativePins,id];storage.set('sporty-market-pins',JSON.stringify(nativePins));b.setAttribute('aria-pressed',nativePins.includes(id));return}
    openDialog(g.name,`${g.guide.split(/\n\s*\n/).map(text=>`<p>${safe(text)}</p>`).join('')}${b.hasAttribute('data-native-unavailable')?'<p class="local-note">Captured reference odds only. This market has no local settlement model, so no demo wager is taken.</p>':'<p class="local-note">Reference rules. Supported demo selections settle against locally simulated scores and goal order, not official results.</p>'}<button class="btn-green" data-close>OK</button>`);
  },true);
  document.addEventListener('change',event=>{
    const b=event.target.closest('[data-native-variant]');if(!b)return;
    nativeVariants[b.dataset.nativeVariant]=Number(b.value);
    const g=SportyEventMarkets.find(g=>g.id===b.dataset.nativeVariant);
    b.closest('.market-block').querySelector('.native-variant-outcomes').innerHTML=nativeOutcomes(g,g.variants[Number(b.value)]);markPicks();
  });

  function renderEvent(id){
    if(!fixture(id)){pageShell('Event not found',panelEmpty('Unknown event','This event is unavailable.'));return}
    const f=fixture(id),m=meta(id),r=result(id),groups=id===100?['All','Main','Goals','Corners','Half','Players','Teams','Match','Bookings','Specials','Minutes']:['All','Main','Goals','Totals'],markets=allMarkets(id).filter(x=>marketGroup==='All'||x.group===marketGroup);
    const teamLogo=(index)=>id===100?`<img src="${asset(index?'adcb1bfee50ec016c560c007941dccf4.png':'6b82f2b1ef59196096a4a42d6a3b5224.png')}" alt="">`:'';
    const score=`<section class="event-scoreboard reference-scoreboard"><a class="scoreboard-competition" href="#/sports/${sportSlug(m.sport)}">${safe(m.sport)} - ${safe(m.league)}</a><div class="scoreboard-meta">Friday 06/11 ${safe(m.time)} <span>Live In-Play Available</span> ID:${safe(m.gameId||String(id))}</div><div class="scoreboard-teams"><strong>${teamLogo(0)}${safe(f[0])}</strong><div><b>${r?r.home:m.status==='live'?f[2]:'06/11'}<span>${r||m.status==='live'?':':'Friday'}</span>${r?r.away:m.status==='live'?f[3]:''}</b><small>${r?'Full time · simulated':m.time}</small></div><strong>${teamLogo(1)}${safe(f[1])}</strong></div><h2 class="desktop-event-title">${safe(f[0])} vs ${safe(f[1])}</h2></section>`;
    const detail=`${score}<div class="page-tabs event-detail-tabs" role="tablist" aria-label="Event detail"><button role="tab" aria-selected="true" data-event-section="markets">Markets</button><button role="tab" aria-selected="false" data-event-section="stats">Stats</button><button role="tab" aria-selected="false" data-event-section="timeline">Timeline</button></div><div class="event-detail-section" id="event-section">${r?'<div class="settled-notice">This simulated event has finished.</div>':''}<div class="market-filters">${groups.map(g=>`<button data-marketgroup="${g}" aria-pressed="${marketGroup===g}">${g==='Totals'?'Half':g}</button>`).join('')}</div><div class="market-stack">${id===100?nativeMarketStack():markets.map(x=>`<details class="market-block" open><summary>${icon('down',14)}<span>${safe(x.title)}</span>${icon('info',14)}<button data-star="${id}" aria-label="Pin event">${icon('star',20)}</button></summary><div class="market-outcomes">${x.outcomes.map(([o,v])=>`<div class="labelled-odd"><span>${safe(o==="home"?"Home":o==="away"?"Away":o==="draw"?"Draw":pickLabel({id,market:x.id,outcome:o}))}</span>${marketOdd(id,x.id,o,v)}</div>`).join('')}</div></details>`).join('')}</div></div><details class="simulation-controls reference-demo-controls"><summary>Local demo match controls${icon('down',16)}</summary><p>Generate a simulated result, not a live match result.</p>${primary(r?'View result':'Simulate final result',`type="button" data-simulate="${id}" ${r?'disabled':''}`)}</details>`;
    pageShell('Details',`<div class="sports-layout">${referenceSidebar()}<div class="sport-events">${referenceToolbar(m.sport+' / '+m.league+' / '+f[0]+' vs '+f[1])}<div class="reference-event-card">${detail}</div></div></div>`,{aside:true});
  }

  let menuTab='Sports',menuSport='Popular',menuPromoFilter='All';
  const menuSportSlug=name=>sportSlug(name==='eSoccer'?'eFootball':name);
  function referenceMenu(){const data=globalThis.SportyMenu,live=menuTab==='Live',content=data.sports[menuSport]||data.sports.Football,side=live?data.liveSports:Object.keys(data.sports).map(label=>({label}));
    const tabs=[['Sports','Sports'],['Live','Live (172)'],['Promotions','Promotions (5)'],['Features','Features (11)']];
    let body='';
    if(menuTab==='Sports'||live){const rows=live?data.liveCountries:content;body=`<div class="reference-menu-columns"><nav aria-label="Sports">${side.map(s=>`<button data-menu-sport="${safe(s.label)}" aria-pressed="${menuSport===s.label}" class="${menuSport===s.label?'selected':''}"><span>${safe(s.label)}</span>${s.count?`<small>${s.count}</small>`:''}</button>`).join('')}</nav><section>${rows.map((r,i)=>r.header?`<div class="menu-country-heading">${safe(r.label)}${r.all?`<button data-menu-country="All">All ${icon('chevron',13)}</button>`:''}</div>`:`<button data-menu-country="${safe(r.label)}"><span>${safe(r.label)}</span>${r.count?`<small>${r.count}</small>`:''}</button>`).join('')}</section></div>`}
    else{const cards=menuTab==='Features'?data.features:data.promotions;body=`<div class="menu-promo-body">${menuTab==='Promotions'?`<div class="menu-promo-filters">${['All','Games'].map(t=>`<button data-menu-promo-filter="${t}" aria-pressed="${menuPromoFilter===t}">${t}</button>`).join('')}</div>`:''}${cards.map((p,i)=>`<a class="menu-reference-promo" href="#/promotions/reference/${menuTab.toLowerCase()}/${i}"><img src="${p.image}" alt="${safe(p.title)}"><div><strong>${safe(p.title)}</strong>${icon('chevron',22)}</div></a>`).join('')}</div>`}
    pageShell('A–Z Menu',`<div class="reference-menu"><form data-reference-menu-search class="reference-menu-search"><input name="query" placeholder="Teams/Players, League, Game ID" aria-label="Search teams, league or event ID"><button aria-label="Search events">${icon('search',20)}</button></form><nav class="m-tools">${[['layers','Virtuals'],['code','Load Code'],['trophy','Jackpot'],['network','SportyPicks'],['circle-dot','Livescore'],['list','Results'],['smartphone','App']].map(([i,t])=>`<button data-tool="${t}">${icon(i,22)}<span>${t}</span></button>`).join('')}</nav><div class="reference-menu-tabs" role="tablist" aria-label="A–Z sections">${tabs.map(([key,title])=>`<button role="tab" data-menu-tab="${key}" aria-selected="${menuTab===key}">${title}</button>`).join('')}</div>${body}</div>`,{full:true,aside:false});
  }
  document.addEventListener('click',e=>{const b=e.target.closest('[data-menu-tab],[data-menu-sport],[data-menu-country],[data-menu-promo-filter]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();if(b.hasAttribute('data-menu-tab')){menuTab=b.dataset.menuTab;if(menuTab==='Live'&&menuSport==='Popular')menuSport='Football';referenceMenu();return}if(b.hasAttribute('data-menu-sport')){menuSport=b.dataset.menuSport;referenceMenu();return}if(b.hasAttribute('data-menu-promo-filter')){menuPromoFilter=b.dataset.menuPromoFilter;referenceMenu();return}let label=b.dataset.menuCountry,sport=menuSport==='Popular'?'Football':menuSport;referenceDayFilter='All';referenceTimeHours=null;listLeague='All';referenceSelectedLeagues=[];if(label==="Today's Football")referenceDayFilter='Today';else if(label==='Football In Next 3 Hours')referenceTimeHours=3;else if(label==='NBA'||label==='Euroleague')sport='Basketball';else if(label==='ATP/WTA')sport='Tennis';else if(label==='NFL')sport='American Football';else if(label==='NHL')sport='Ice Hockey';else if(label==='SportyPicks'){navigate('bets');return}else if(menuSport==='Popular'){const names={'ENGLAND PREMIER LEAGUE':'England Premier League','SPAIN LA LIGA':'Spain La Liga','ITALY SERIE A':'Italy Serie A','GERMANY BUNDESLIGA':'Germany Bundesliga','FRANCE LIGUE 1':'France Ligue 1'};if(names[label])listLeague=names[label]}else if(!['All','Top Leagues','International','International Clubs'].includes(label)){referenceSelectedLeagues=[...new Set(fixtureIds().filter(id=>meta(id).sport===sport&&meta(id).league.toLowerCase().startsWith(label.toLowerCase())).map(id=>meta(id).league))];if(!referenceSelectedLeagues.length)listLeague=label}listSport=sport;listStatus=menuTab==='Live'?'live':'all';navigate((menuTab==='Live'?'live':'sports/'+menuSportSlug(sport)))},true);

  function renderMenu() {
    if(mobile){referenceMenu();return}
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
  let notificationTab='System',transactionCategory='All Categories',transactionFrom='',transactionTo='';
  function referenceNotifications(){
    const messages=notificationTab==='Message'?(state.messages||[]):[];
    pageShell('Notification Center',`<section class="reference-notifications"><header><a href="#/account" aria-label="Back to account">${icon('arrow-left',22)}</a><h1>Notification Center</h1></header><div class="notification-tabs" role="tablist" aria-label="Notifications">${['System','Promotion','Message'].map(tab=>`<button role="tab" data-notification-tab="${tab}" aria-selected="${notificationTab===tab}" aria-controls="notification-list">${tab}</button>`).join('')}</div><div id="notification-list" role="tabpanel" aria-label="${notificationTab} notifications">${messages.length?messages.map(m=>`<details class="notification-entry"><summary>${safe(m.subject)}${icon('chevron',16)}</summary><p>${safe(m.message)}</p><small>${dateText(m.time)} · Saved locally, not sent to SportyBet</small></details>`).join(''):`<div class="notification-empty">${icon('bell',48)}<p>No Messages available</p></div>`}</div></section>`,{full:true,aside:false});
  }
  const transactionCategories=['All Categories','Deposits','Withdrawals','Bets','Winnings','Refunds'];
  function referenceTransactions(){
    const types={Deposits:['Demo deposit'],Withdrawals:['Demo withdrawal'],Bets:['Bet stake','Game stake','Jackpot entry'],Winnings:['Bet return','Game return','Cashout','Jackpot prize'],Refunds:['Bet refund','Refund','Cancelled bet refund']};
    const rows=state.ledger.filter(x=>(transactionCategory==='All Categories'||(types[transactionCategory]||[]).includes(x.kind))&&(!transactionFrom||nigeriaDay.format(new Date(x.time))>=transactionFrom)&&(!transactionTo||nigeriaDay.format(new Date(x.time))<=transactionTo));
    pageShell('Transactions',`<section class="reference-transactions"><header><a href="#/account" aria-label="Back to account">${icon('arrow-left',22)}</a><h1>Transactions</h1><button data-export="ledger">Export CSV</button></header><p class="transaction-status-prompt">Need to speed up your payment? <button data-transaction-status>Fix Status</button></p><div class="transaction-controls"><label><span class="sr-only">Transaction category</span><select data-transaction-category>${transactionCategories.map(c=>`<option ${c===transactionCategory?'selected':''}>${c}</option>`).join('')}</select></label><button data-transaction-dates>${transactionFrom&&transactionTo?safe(transactionFrom+' ~ '+transactionTo):'Choose Date Range'}${icon('down',15)}</button></div><p class="transaction-local-note">Local demo transactions only. No bank or payment service is connected.</p><div class="ledger-list">${rows.length?rows.map(x=>`<button class="ledger-row" data-receipt="${safe(x.id)}"><span class="ledger-icon">${icon(x.amount>=0?'arrow-down-left':'arrow-up-right',20)}</span><span><strong>${safe(x.kind)}</strong><small>${dateText(x.time)}</small></span><strong class="${x.amount>=0?'positive':'negative'}">${x.amount>=0?'+':'−'}${money(Math.abs(x.amount))}</strong>${icon('chevron',16)}</button>`).join(''):'<div class="transaction-empty"><p>No Records Found.</p><small>Select a date range to find more records</small></div>'}</div><button class="inline-action transaction-reset" data-transaction-reset>Reset filters</button></section>`,{full:true,aside:false});
  }
  function transactionDateDialog(){openDialog('Choose Date Range',`<form data-transaction-date-form><div class="transaction-date-presets">${[7,14,30].map(days=>`<button type="button" data-transaction-preset="${days}">Last ${days} days</button>`).join('')}</div><label class="form-field"><span>From</span><input type="date" name="from" required value="${safe(transactionFrom)}"></label><label class="form-field"><span>To</span><input type="date" name="to" required value="${safe(transactionTo)}"></label><p class="form-feedback" role="alert"></p><button class="btn-green">Apply</button><button type="button" class="inline-action" data-close>Cancel</button></form>`)}
  document.addEventListener('click',event=>{const b=event.target.closest('[data-me-balance],[data-notification-tab],[data-transaction-dates],[data-transaction-preset],[data-transaction-reset],[data-transaction-status]');if(!b)return;event.preventDefault();event.stopImmediatePropagation();
    if(b.hasAttribute('data-me-balance')){meBalanceVisible=!meBalanceVisible;referenceGuestAccount();document.querySelector('[data-me-balance]')?.focus();return}
    if(b.hasAttribute('data-notification-tab')){notificationTab=b.dataset.notificationTab;referenceNotifications();document.querySelector(`[data-notification-tab="${notificationTab}"]`)?.focus();return}
    if(b.hasAttribute('data-transaction-dates')){transactionDateDialog();return}
    if(b.hasAttribute('data-transaction-reset')){transactionCategory='All Categories';transactionFrom='';transactionTo='';referenceTransactions();return}
    if(b.hasAttribute('data-transaction-preset')){const form=b.closest('form'),to=new Date(),from=new Date(to.getTime()-(Number(b.dataset.transactionPreset)-1)*86400000);form.elements.from.value=nigeriaDay.format(from);form.elements.to.value=nigeriaDay.format(to);return}
    if(b.hasAttribute('data-transaction-status'))openDialog('Transaction status','<p>All local demo transactions complete immediately. No external payment is pending, and no real payment status can be changed here.</p><button class="btn-green" data-close>OK</button>');
  },true);
  document.addEventListener('change',event=>{if(event.target.matches('[data-transaction-category]')){transactionCategory=event.target.value;referenceTransactions();document.querySelector('[data-transaction-category]')?.focus()}});
  document.addEventListener('submit',event=>{const form=event.target.closest('[data-transaction-date-form]');if(!form)return;event.preventDefault();event.stopImmediatePropagation();if(form.elements.from.value>form.elements.to.value){form.querySelector('[role=alert]').textContent='The start date must be on or before the end date.';return}transactionFrom=form.elements.from.value;transactionTo=form.elements.to.value;closeDialog();referenceTransactions()},true);

  function renderWallet(section = "overview") {
    if(section==='transactions'){referenceTransactions();return}
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

  let referenceGuestBetTab='Open Bets';
  function referenceGuestBets(){const scheduled=fixtureIds().filter(id=>meta(id).reference&&status(id)==='scheduled'),codes=[0,1,2].map((n)=>{const ids=scheduled.slice(n*3,n*3+3),code='DEMO0'+(n+1),data=ids.map(id=>({id,market:'1x2',outcome:'home',key:pickKey(id,'1x2','home'),odd:lookupOdd(id,'1x2','home')}));savedCodes[code]=data;return {ids,code,data}});storage.set('sporty-codes',JSON.stringify(savedCodes));pageShell('Open Bets',`<section class="reference-guest-bets"><header><button data-guest-cashout-help>${icon('help-circle',15)} How to Cashout?</button><a href="#/account/register">Register</a><i></i><a href="#/account/login">Login</a></header><nav>${['Open Bets','Bet History'].map(t=>`<button data-guest-bet-tab="${t}" aria-pressed="${referenceGuestBetTab===t}">${t}</button>`).join('')}</nav><div class="guest-bets-login"><p>Please Log In to see your ${referenceGuestBetTab}<br>${referenceGuestBetTab==='Open Bets'?'and Cashout Bets':''}</p><a href="#/account/login">Login</a></div><details class="guest-codes" open><summary>${icon('bookmark',22)}<strong>Recommended Football Codes</strong>${icon('chevron-up',16)}</summary>${codes.map(c=>`<article><header><strong>${c.code}</strong><span>Folds: <b>${c.ids.length}</b></span><span>Odds: <b>${c.data.reduce((n,p)=>n*p.odd,1).toFixed(2)}</b></span></header><p>${icon('shield-check',17)} Local demo code · captured match odds</p><div>${c.ids.map(id=>`<div class="guest-code-selection">${icon('volleyball',15)}<span><b>Home @${lookupOdd(id,'1x2','home').toFixed(2)}</b> <small>1X2</small><br>${safe(fixture(id)[0])} vs ${safe(fixture(id)[1])}</span><time>Today ${safe(meta(id).time)}</time></div>`).join('')}</div><footer><button data-copy="${c.code}">${icon('share-2',16)} Share</button><button data-local-bookcode="${c.code}">Add to Betslip</button></footer></article>`).join('')}</details></section>`,{full:true,aside:false})}
  document.addEventListener('click',e=>{const b=e.target.closest('[data-guest-bet-tab],[data-local-bookcode],[data-guest-cashout-help],[data-me-theme-toggle],[data-me-theme]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();if(b.hasAttribute('data-guest-bet-tab')){referenceGuestBetTab=b.dataset.guestBetTab;referenceGuestBets();return}if(b.hasAttribute('data-local-bookcode')){picks=structuredClone(savedCodes[b.dataset.localBookcode]);renderSlip();openSheet(b);toast('Local demo selections loaded.');return}if(b.hasAttribute('data-guest-cashout-help')){openDialog('How to Cashout?',`<p>Open an unsettled demo ticket from My Bets and choose Cash out. Review the offered local credit before confirming.</p><p>Cashout and all balances in this replica are simulated.</p>`);return}if(b.hasAttribute('data-me-theme-toggle')){let menu=document.querySelector('.me-theme-menu');if(menu){menu.remove();b.setAttribute('aria-expanded','false');return}const selected=storage.get('sporty-me-theme')||'system';const div=document.createElement('div');div.className='me-theme-menu';div.setAttribute('role','menu');div.innerHTML=[['dark','On'],['light','Off'],['system','Follow System Settings']].map(([k,v])=>`<button role="menuitemradio" aria-checked="${selected===k}" data-me-theme="${k}">${v}<span>${selected===k?icon('check',11):''}</span></button>`).join('');b.after(div);b.setAttribute('aria-expanded','true');div.querySelector('button').focus();return}if(b.hasAttribute('data-me-theme')){storage.set('sporty-me-theme',b.dataset.meTheme);referenceGuestAccount();return}},true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.querySelector('.me-theme-menu')){document.querySelector('.me-theme-menu').remove();document.querySelector('[data-me-theme-toggle]')?.focus()}},true);

  function renderBets(ticketId) {
    if(mobile&&!state.session&&!ticketId&&!state.tickets.length){referenceGuestBets();return;}
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
    if(p.market.startsWith('early:')||p.market==='never-down'){
      if(p.outcome==='draw')return r.home===r.away;
      let difference=0,maximum=0,minimum=0;
      for(const goal of r.goals||[]){difference+=goal===p.outcome?1:-1;maximum=Math.max(maximum,difference);minimum=Math.min(minimum,difference)}
      return p.market==='never-down'?compare(r.home,r.away,p.outcome)&&minimum>=0:maximum>=Number(p.market.split(':')[1]);
    }
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
    const goals=[...Array(h).fill('home'),...Array(a).fill('away')];
    if(sport==='Football')for(let i=goals.length-1;i>0;i--){const j=crypto.getRandomValues(new Uint32Array(1))[0]%(i+1);[goals[i],goals[j]]=[goals[j],goals[i]]}
    return {
      goals,
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
  function renderResults(finishedOnly){
    const simulated=fixtureIds().filter(id=>(finishedOnly?Boolean(result(id)):status(id)==='live')&&(listSport==='All'||meta(id).sport===listSport)&&(!listQuery||fixture(id).slice(0,2).join(' ').toLowerCase().includes(listQuery.toLowerCase())||String(id)===listQuery));
    const matchesQuery=(row)=>!listQuery||(row.home+' '+row.away+' '+row.gameId).toLowerCase().includes(listQuery.toLowerCase());
    const snapshot=finishedOnly&&(listSport==='Football'||listSport==='All')?referenceUI.results.map(g=>({...g,rows:g.rows.filter(matchesQuery)})).filter(g=>g.rows.length):[];
    const groups=referenceResultDateOffset===0?[...(simulated.length?[{title:finishedOnly?'Local demo results':'Live snapshot',rows:simulated.map(id=>{const f=fixture(id),r=result(id);return{home:f[0],away:f[1],score:(r?r.home:f[2])+':'+(r?r.away:f[3]),gameId:String(id),id,simulated:true}})}]:[]),...snapshot].filter(g=>(referenceResultCountry==='All'||g.title.startsWith(referenceResultCountry+' - '))&&(referenceResultCategory==='All'||g.title===referenceResultCategory)):[];
    const dateLabel=new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(2026,10,5+referenceResultDateOffset));
    const row=(x)=>`<div class="score-row ${x.simulated?'result-row':'reference-result-row'}"><div class="score-time"><small>05/11/2026</small><span>20:00</span></div><span class="score-game-id">${safe(x.gameId)}</span><span class="score-home">${safe(x.home)}</span><details class="score-detail"><summary>${safe(x.score)}${icon('down',14)}</summary><div><p>${x.simulated?'Simulated final result.':'Historical reference result captured on 6 November 2026, not a live feed.'}</p>${x.id!=null?`<a href="#/event/${x.id}">Event details</a>`:''}</div></details><span class="score-away">${safe(x.away)}</span></div>`;
    const filters=`<form class="results-filter" data-resultsfilter><label class="form-field"><span class="sr-only">Sport</span><select name="sport"><option value="All">Football</option>${sports.map(s=>`<option ${listSport===s?'selected':''}>${s}</option>`).join('')}</select></label><label class="form-field result-search"><span class="sr-only">Team or event ID</span><input name="query" value="${safe(listQuery)}" placeholder="Enter event id"></label><button class="btn-green">Search</button></form>`;
    pageShell(finishedOnly?'Results':'Livescore',`<section class="reference-results"><header class="reference-results-heading"><h2>${finishedOnly?'Results':'Livescore'}</h2>${filters}</header><div class="reference-result-selectors"><button data-reference-date="0">${dateLabel}${icon('down',16)}</button><button data-reference-filter="Results">${safe(listSport==='All'?'Football':listSport)}${icon('down',16)}</button><button data-reference-filter="Results">Select Category${icon('down',16)}</button><button data-reference-filter="Results">Select Tournament${icon('down',16)}</button></div><div class="reference-results-mobile"><div><button data-reference-date="-1" aria-label="Previous day">${icon('chevron-left',24)}</button><button data-reference-date="0">${dateLabel}</button><button data-reference-date="1" aria-label="Next day">${icon('chevron',24)}</button></div><p>${safe(listSport==='All'?'Football':listSport)} / ${safe(referenceResultCountry==='All'?'All Categories':referenceResultCountry)} / ${safe(referenceResultCategory==='All'?'All Tournaments':referenceResultCategory.split(' - ').slice(1).join(' - '))}<button data-reference-filter="Results">Change</button></p></div><div class="score-columns"><span>Time</span><span>Game ID</span><span>Match and Result</span></div><div class="result-list">${groups.map((g,i)=>`<details class="reference-result-group" ${!mobile||g.title.startsWith('Local')?'open':''}><summary>${icon('play',16)}${safe(g.title)}</summary><div>${g.rows.map(row).join('')}</div></details>`).join('')||panelEmpty('No matching results','Change the date or search filter.')}</div><p class="reference-snapshot-note">Reference results captured 6 November 2026. Local demo results are listed separately.</p><button class="inline-action" data-reset-results>Reset filters</button></section>`,{full:true,aside:false});
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
  // Captured public surfaces use structured reference data; no captured scripts or remote game/payment calls run here.
  const surface = globalThis.SportySurfaces;
  let catalogCategory=0,catalogQuery='',catalogLimit=96,loyaltyTier=0,loyaltyTab='Latest Rewards',virtualLeague=0,virtualMarket='1x2',virtualRound=(()=>{try{return Math.max(0,Math.min(99,Number(sessionStorage.getItem('sporty-iv-round'))||0))}catch{return 0}})(),virtualBusy=false;
  const catalogData=()=>globalThis.SportyCatalog;
  function catalogCard(id,rank=0){const g=catalogData().games[id];return g?`<button class="catalog-card" data-catalog-game="${id}" aria-label="Open ${safe(g.name)}"><img src="${safe(g.image)}" alt="${safe(g.name)}" loading="lazy" width="384" height="384">${rank?`<span class="catalog-rank">${rank}</span>`:''}${g.tags?.length?`<span class="catalog-badge">${safe(g.tags[0])}</span>`:''}<span class="catalog-online">${icon('users',11)} ${g.online}</span></button>`:''}
  function catalogMatches(){const d=catalogData(),ids=d.sets[catalogCategory]||[];return ids.filter(id=>!catalogQuery||d.games[id].name.toLowerCase().includes(catalogQuery.toLowerCase()))}
  function catalogGrid(){const ids=catalogMatches();return `<div class="catalog-grid">${ids.slice(0,catalogLimit).map(id=>catalogCard(id)).join('')}</div>${ids.length>catalogLimit?`<button class="catalog-more" data-catalog-more>Load more games (${catalogLimit} of ${ids.length})</button>`:!ids.length?`<p class="catalog-empty" role="status">No games found. Try another name or category.</p>`:''}`}
  function catalogSection(title,ids,category,rank=false){return `<section class="catalog-section"><header><h2>${safe(title)}</h2><button data-catalog-category="${category}">Show All</button></header><div class="catalog-track">${ids.map((id,i)=>catalogCard(id,rank?i+1:0)).join('')}</div></section>`}
  function referenceGames(){
    const d=catalogData();if(!d){pageShell('SportyGames',panelEmpty('Catalog unavailable','Please reload the local page.'),{full:true,aside:false});return;}
    const categories=d.categories.map(c=>({...c,name:c.id===2?'Card Games':c.id===9?'Live Casino':c.name})).filter(c=>(d.sets[c.id]||[]).length),selected=categories.find(c=>c.id===catalogCategory)||categories[0];
    const sections=surface.mobileSections;
    const top=sections[0]?.ids.filter(id=>d.games[id])||[];
    const home=`${catalogSection('Top 10 in Nigeria',top,17,true)}<section class="catalog-providers"><h2>Game Providers</h2><div>${surface.providers.map(p=>`<button data-catalog-provider="${p.id}" aria-label="Browse ${safe(p.name)} games"><img src="${p.image}" alt="${safe(p.name)}" loading="lazy"></button>`).join('')}</div></section>${sections.slice(1).map(s=>catalogSection(s.name,s.ids.filter(id=>d.games[id]),s.category)).join('')}`;
    pageShell('SportyGames',`<section class="reference-catalog"><header class="catalog-mobile-head"><a href="#/games" aria-label="SportyGames home"><b>Sporty<span>Games</span></b></a><a href="#/account/register">Join Now</a><a href="#/account/login">Login</a></header><div class="catalog-layout"><nav class="catalog-sidebar" aria-label="Game categories">${categories.map(c=>`<button data-catalog-category="${c.id}" aria-pressed="${catalogCategory===c.id}">${surface.categoryIcons[c.id]?`<img src="${surface.categoryIcons[c.id]}" alt="">`:icon('grid',18)}<span>${safe(c.name)}</span></button>`).join('')}</nav><div class="catalog-right"><section class="catalog-top-wins"><h2>Top Wins Today</h2><div>${surface.topWins.map(w=>`<button data-catalog-win-name="${safe(w.name)}"><img src="${w.image}" alt=""><span><b>NGN ${safe(w.amount)}</b><small>${icon('user',11)} ${safe(w.user)}<em>PLAY</em></small></span></button>`).join('')}</div></section><main class="catalog-content"><div class="catalog-desktop-title"><h1>${safe(selected.name)}</h1><button data-catalog-wins>${icon('trophy',17)} Top Wins</button></div><div class="catalog-toolbar"><label class="catalog-search">${icon('search',18)}<input aria-label="Search games" data-catalog-search placeholder="Search" value="${safe(catalogQuery)}"></label><button class="catalog-category-toggle" data-catalog-menu>${safe(catalogCategory===0?'Home':selected.name)} ${icon('down',15)}</button></div><div class="catalog-results">${mobile&&catalogCategory===0&&!catalogQuery?home:catalogGrid()}</div><p class="catalog-local-engines">Local playable demos: <a href="#/games/aviator">Aviator</a> · <a href="#/games/redblack">Red & Black</a> · <a href="#/games/bottle">Bottle</a> · <a href="#/games/hero">Sporty Hero</a></p></main></div></div></section>`,{full:true,aside:false});
    document.querySelector('[data-catalog-search]')?.addEventListener('input',e=>{catalogQuery=e.target.value;catalogLimit=96;const results=document.querySelector('.catalog-results');results.innerHTML=mobile&&catalogCategory===0&&!catalogQuery?home:catalogGrid()});
  }
  function catalogCategoryMenu(){openDialog('Games',`<div class="catalog-category-dialog">${catalogData().categories.filter(c=>(catalogData().sets[c.id]||[]).length).map(c=>`<button data-catalog-category="${c.id}" aria-pressed="${catalogCategory===c.id}">${surface.categoryIcons[c.id]?`<img src="${surface.categoryIcons[c.id]}" alt="">`:icon('grid',20)}${safe(c.name)}</button>`).join('')}</div>`)}
  function referenceLoyalty(){
    const d=surface.loyalty,t=d.tiers[loyaltyTier],neighbors=[(loyaltyTier+7)%8,loyaltyTier,(loyaltyTier+1)%8];
    pageShell('Sporty Loyalty',`<section class="loyalty-stage"><div class="reference-loyalty"><header><button data-loyalty-back aria-label="Back">${icon('arrow-left',22)}</button><span>Sporty Loyalty</span><button data-loyalty-help aria-label="Loyalty help">${icon('help-circle',20)}</button><button data-loyalty-history aria-label="Loyalty history">${icon('history',20)}</button></header><div class="loyalty-hero" style="background-image:url('${d.banner}')"><img src="${d.title}" alt="Sporty Loyalty"></div><section class="loyalty-tiers"><p>Current Tier</p><div class="loyalty-tier-carousel" aria-label="Loyalty tiers">${neighbors.map(i=>`<button data-loyalty-tier="${i}" aria-pressed="${i===loyaltyTier}"><span><img src="${d.tiers[i].image}" alt="">${icon('lock',15)}</span><b>${safe(d.tiers[i].name)}</b></button>`).join('')}</div><div class="loyalty-dots">${d.tiers.map((v,i)=>`<button aria-label="View ${safe(v.name)} tier" data-loyalty-tier="${i}" aria-pressed="${i===loyaltyTier}"></button>`).join('')}</div><h2>Deposit to unlock Sporty Loyalty</h2><p class="loyalty-weekly">Weekly Free Bet Gift Giveaway</p><div class="loyalty-rakeback"><p>Max. rakeback for this tier:</p><div>${[['Real Sport','5%'],['Instant Virtual','4%'],['Games','3%']].map(([k,v])=>`<span>${k}<b>${v}</b></span>`).join('')}</div></div></section><div class="loyalty-tabs">${['Latest Rewards','Ready To Claim'].map(v=>`<button data-loyalty-tab="${v}" aria-pressed="${loyaltyTab===v}">${v}</button>`).join('')}</div><div class="loyalty-rewards">${loyaltyTab==='Latest Rewards'?`<article><strong>02 - 09 Nov Free Bet Gift Giveaway</strong><button data-loyalty-help>Potential Rewards ${icon('info',13)}</button><b>NGN&nbsp; 0.00</b><a href="#/sports/football">Play Now !</a><small>Ends on 09:00, 09 Nov</small></article><article><strong>02 - 09 Nov<br>Games and Instant Virtual Daily Giveaway</strong><button data-loyalty-help>${icon('info',14)}</button><b>NGN&nbsp; 0.00</b><p>Reminder: claimed rewards will be deducted from Total Potential Rewards</p><p>Games and Instant Virtual rewards are claimable daily. Start playing games and claim your reward here. Rewards amount will display upon calculation.</p></article>`:`<div class="loyalty-claim-empty">${icon('gift',32)}<p>${state.session?'No rewards ready to claim.':'Login to view rewards ready to claim.'}</p>${state.session?`<p>${state.points} local demo points</p><button data-redeem ${state.points<10?'disabled':''}>Redeem 10 points</button>`:`<a href="#/account/login">Login</a>`}</div>`}</div><a class="loyalty-join" href="#/${state.session?'wallet/deposit':'account/login'}">${state.session?'Deposit To Join':'Login To Join'}</a></div></section>`,{full:true,aside:false});
    let x=0;const carousel=document.querySelector('.loyalty-tier-carousel');carousel?.addEventListener('pointerdown',e=>x=e.clientX);carousel?.addEventListener('pointerup',e=>{if(Math.abs(e.clientX-x)>45){loyaltyTier=(loyaltyTier+(e.clientX<x?1:7))%8;referenceLoyalty()}});
  }
  function referenceVirtualLobby(){const d=surface.virtual,groups=[['Instant Games','Start your own games anytime with instant results.',d.cards.slice(0,7)],['Scheduled Games','Shared games that start at fixed times. Bet alongside every player.',d.cards.slice(7,10)],['Originals','More ways to play virtual football.',d.cards.slice(10)]];pageShell('Virtuals',`<section class="reference-virtual-lobby"><header><a href="#/home" aria-label="Back">${icon('arrow-left',24)}</a><span>Virtuals</span><a href="#/account/register">Register</a><i>|</i><a href="#/account/login">Login</a></header><nav><button aria-pressed="true">Game</button><button data-virtual-help>How To Play ${icon('help-circle',18)}</button></nav><div class="virtual-promo-carousel">${d.banners.map((b,i)=>`<a href="#/virtual/instant" style="background-image:url('${b.background}')" aria-label="Virtual games promotion ${i+1}"><img src="${b.image}" alt=""><span>${safe(b.text.replace(/[🔥🏁]/gu,''))}</span></a>`).join('')}</div>${groups.map(([title,sub,cards])=>`<section class="virtual-lobby-section"><h2>${title}${title==='Scheduled Games'?'<em>LIVE</em>':''}</h2><p>${sub}</p><div class="virtual-lobby-grid">${cards.map((c,i)=>`<a class="virtual-reference-card ${c.large?'large':''}" href="#/virtual/${surface.virtual.cards.indexOf(c)===0?'instant':'product/'+surface.virtual.cards.indexOf(c)}" style="background-image:url('${c.background}')">${c.badge?`<small>${safe(c.badge)}</small>`:''}<strong>${safe(c.name)}</strong><img src="${c.image}" alt="" loading="lazy"></a>`).join('')}</div></section>`).join('')}</section>`,{full:true,aside:false});let carousel=document.querySelector('.virtual-promo-carousel');if(carousel&&!motionReduced()){let tick=setInterval(()=>{if(!carousel.isConnected){clearInterval(tick);return;}carousel.scrollTo({left:(Math.round(carousel.scrollLeft/carousel.clientWidth)+1)%d.banners.length*carousel.clientWidth,behavior:'smooth'})},5000)}}
  function referenceVirtualProduct(index){
    const card=surface.virtual.cards[index];if(!card){referenceVirtualLobby();return}
    if(index===0){referenceInstant();return}
    if(index===6){mode='SIM';listSport='Football';navigate('sports/football');return}
    const tabs=index===3?['Winner (incl. overtime)','Over/Under (incl. overtime)','1st Half O/U','1st Quarter O/U','1X2','Home Team Total (incl. overtime)','Away Team Total (incl. overtime)','Winner & total (incl. overtime)']:index===1||index===2?['1X2','O/U','Double Chance','GG/NG','Handicap','1st Half 1X2','2nd Half Double Chance','1X2 & Total','1st Half O/U','2nd Half O/U','Home Team O/U','Away Team O/U']:index===11?['All','Main','Teams']:[];
    pageShell(card.name,`<section class="reference-product-stage"><div class="reference-product"><header><a href="#/virtual" aria-label="Back to Virtuals">${icon('arrow-left',22)}</a><h1>${safe(card.name)}</h1><a href="#/account/register">Register</a><a href="#/account/login">${index===10?'Log In':'Login'}</a></header>${tabs.length?`<nav aria-label="Product markets">${tabs.map((label,i)=>`<button data-product-market aria-pressed="${i===0}">${safe(label)}</button>`).join('')}</nav>`:''}${index===5||index===8?'<div class="product-scheduled-promo">Try our new Scheduled Football <a href="#/virtual/product/7">Play Now</a></div>':''}${index===11?'<p>Penalty shootouts. Virtual action. Instant wins.</p>':index===10?'<p>Pick your own match and bet instantly!</p>':''}<div class="product-connection-note" role="status"><img src="${card.image}" alt=""><h2>${safe(card.name)}</h2><p>${index===4||index===5||index===8?'The public provider did not return playable content in the capture.':'The public screen was captured, but its proprietary match and settlement service is not connected to this independent demo.'}</p><p>No real wager or payment is taken.</p><a class="btn-green" href="#/virtual/instant">Play local Instant Football</a>${index===11?'<a class="inline-action" href="#/games/hero">Play local penalty demo</a>':''}<a class="inline-action" href="#/virtual">Back to Virtuals</a></div></div></section>`,{full:true,aside:false});
  }
  document.addEventListener('click',event=>{const b=event.target.closest('[data-product-market]');if(!b)return;b.closest('nav').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b))});
  function ivIds(){return surface.instant[virtualLeague].rows.map((_,i)=>5000+virtualRound*100+surface.instant.slice(0,virtualLeague).reduce((n,l)=>n+l.rows.length,0)+i)}
  function referenceInstant(){const league=surface.instant[virtualLeague],ids=ivIds(),market=demoMarketDefinitions(ids[0]).find(m=>m.id===virtualMarket)||demoMarketDefinitions(ids[0])[0];virtualMarket=market.id;pageShell('Instant Football',`<section class="reference-instant-stage"><div class="reference-instant"><header><a href="#/virtual" aria-label="Back">${icon('arrow-left',23)}</a><strong>Instant Football</strong><button data-virtual-help aria-label="How to play">${icon('help-circle',20)}</button><a href="#/account/login">${icon('user',20)}</a></header><nav class="iv-leagues">${surface.instant.map((l,i)=>`<button data-iv-league="${i}" aria-pressed="${virtualLeague===i}">${safe(l.name)}</button>`).join('')}</nav><div class="iv-tools"><button data-iv-builder aria-label="Bet builder information">BB</button><button data-iv-settings aria-label="Virtual settings">${icon('settings',18)}</button></div><nav class="iv-markets">${[['1x2','1X2'],['dc','Double Chance'],['totals:2.5','O/U'],['btts','GG/NG'],['handicap:-1','Handicap'],['half-total:0.5','1st Half O/U']].map(([k,v])=>`<button data-iv-market="${k}" aria-pressed="${virtualMarket===k}">${v}</button>`).join('')}</nav><div class="iv-column-heading"><strong>${safe(league.name)}</strong><span>${market.outcomes.map(([o])=>`<b>${safe(({home:'1',draw:'X',away:'2',over:'Over',under:'Under','home-draw':'1X','home-away':'12','draw-away':'X2',yes:'Yes',no:'No'})[o]||o)}</b>`).join('')}</span></div><div class="iv-rows">${league.rows.map((r,i)=>{const id=ids[i],m=demoMarketDefinitions(id).find(m=>m.id===virtualMarket),res=result(id);return `<article class="iv-row"><div class="iv-teams"><div><img src="${r.homeImage}" alt=""><b>${safe(r.home)}</b><span>vs</span><b>${safe(r.away)}</b><img src="${r.awayImage}" alt=""></div><p>${icon('star',10).repeat(5)}<span></span>${icon('star',10).repeat(5)}</p></div><div class="iv-odds">${m.outcomes.map(([o,v])=>marketOdd(id,m.id,o,v)).join('')}</div><a href="#/event/${id}" class="iv-more">+71</a>${res?`<span class="iv-score">${res.home} - ${res.away}</span>`:''}</article>`}).join('')}</div><footer><button data-iv-next ${virtualBusy?'disabled':''}>${virtualBusy?'Playing round…':'Next Round'}</button><button data-iv-slip>Betslip <b>${picks.filter(p=>ids.includes(p.id)).length}</b></button></footer><p class="iv-demo-caption">Local simulated round ${virtualRound+1} · no real wagers</p></div></section>`,{full:true,aside:false})}
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-catalog-win-name],[data-catalog-category],[data-catalog-more],[data-catalog-game],[data-catalog-menu],[data-catalog-wins],[data-catalog-provider],[data-loyalty-tier],[data-loyalty-tab],[data-loyalty-back],[data-loyalty-help],[data-loyalty-history],[data-virtual-help],[data-iv-league],[data-iv-market],[data-iv-next],[data-iv-slip],[data-iv-settings],[data-iv-builder]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();
    if(b.hasAttribute('data-catalog-win-name')){const g=Object.values(catalogData().games).find(g=>g.name===b.dataset.catalogWinName);if(g){const card=document.createElement('button');card.dataset.catalogGame=g.id;document.body.append(card);card.click();card.remove()}return}
    if(b.hasAttribute('data-catalog-category')){catalogCategory=Number(b.dataset.catalogCategory);catalogQuery='';catalogLimit=96;closeDialog();referenceGames();return}
    if(b.hasAttribute('data-catalog-more')){catalogLimit+=96;const y=scrollY;document.querySelector('.catalog-results').innerHTML=catalogGrid();scrollTo(0,y);return}
    if(b.hasAttribute('data-catalog-menu')){catalogCategoryMenu();return}
    if(b.hasAttribute('data-catalog-game')){const g=catalogData().games[b.dataset.catalogGame],known=/aviator/i.test(g.name)?'aviator':/^red[-\s]*&?[-\s]*black$/i.test(g.name)?'redblack':/spin da.*bottle/i.test(g.name)?'bottle':/^sporty hero$/i.test(g.name)?'hero':null;if(known){navigate('games/'+known);return}openDialog(g.name,`<div class="catalog-game-preview"><img src="${g.image}" alt="${safe(g.name)}"><p>This game’s artwork and catalog entry are available in the replica. Its proprietary game engine is not connected.</p><a class="btn-green" href="#/games/aviator">Play local Aviator demo</a><a href="#/games">Back to games</a></div>`);return}
    if(b.hasAttribute('data-catalog-wins')){openDialog('Top Wins',`<div class="catalog-wins"><h3>Local demo wins</h3>${state.games.filter(g=>g.return>0).slice(-20).reverse().map(g=>`<p>${safe(g.game||g.type||'Game')}<strong>${money(g.return)}</strong></p>`).join('')||'<p>No local wins yet.</p>'}</div>`);return}
    if(b.hasAttribute('data-catalog-provider')){const provider=Number(b.dataset.catalogProvider),name=surface.providers.find(p=>p.id===provider)?.name||'Game Provider',games=Object.values(catalogData().games).filter(g=>g.provider===provider);openDialog(name,`<div class="catalog-provider-games">${games.slice(0,60).map(g=>catalogCard(g.id)).join('')}</div>`);return}
    if(b.hasAttribute('data-loyalty-tier')){loyaltyTier=Number(b.dataset.loyaltyTier);referenceLoyalty();return}
    if(b.hasAttribute('data-loyalty-tab')){loyaltyTab=b.dataset.loyaltyTab;referenceLoyalty();return}
    if(b.hasAttribute('data-loyalty-back')){navigate('account');return}
    if(b.hasAttribute('data-loyalty-help')){openDialog('Sporty Loyalty',`<p>Deposit to unlock Sporty Loyalty.</p><p>Weekly Free Bet Gift Giveaway and Games and Instant Virtual Daily Giveaway are reference promotions. The independent demo uses local points only.</p><p>Earn 1 point per NGN 100 of settled demo sports stakes. Redeem 10 points for NGN 100 in demo credits.</p><a href="#/help/loyalty">How demo points work</a>`);return}
    if(b.hasAttribute('data-loyalty-history')){navigate(state.session?'wallet/transactions':'account/login');return}
    if(b.hasAttribute('data-virtual-help')){openDialog('How To Play',`<p>Choose a league, market and selection. Add selections to the betslip and enter a demo stake.</p><p>Next Round generates local simulated results and settles affected demo tickets. Virtual rounds do not represent real fixtures or official SportyBet outcomes.</p><a href="#/help/virtuals">Virtual football help</a>`);return}
    if(b.hasAttribute('data-iv-league')){virtualLeague=Number(b.dataset.ivLeague);referenceInstant();return}
    if(b.hasAttribute('data-iv-market')){virtualMarket=b.dataset.ivMarket;referenceInstant();return}
    if(b.hasAttribute('data-iv-slip')){openSheet();return}
    if(b.hasAttribute('data-iv-builder')){openDialog('Bet Builder','<p>The independent simulator supports one selection per event. Same-event combination pricing is not connected.</p><button class="btn-green" data-close>OK</button>');return}
    if(b.hasAttribute('data-iv-settings')){openDialog('Settings',`<label class="setting-row">Reduce motion <input type="checkbox" data-preference-motion ${motionReduced()?'checked':''}></label><p>Decimal odds · NGN demo credits</p>`);return}
    if(b.hasAttribute('data-iv-next')){if(virtualBusy)return;virtualBusy=true;b.disabled=true;b.textContent='Playing round…';Promise.resolve().then(async()=>{try{const ids=ivIds();await simulate(ids);if(!motionReduced())await new Promise(r=>setTimeout(r,1200));virtualRound=Array.from({length:100},(_,i)=>(virtualRound+i+1)%100).find(round=>!result(5000+round*100))??virtualRound;try{sessionStorage.setItem('sporty-iv-round',String(virtualRound))}catch{};virtualBusy=false;referenceInstant()}finally{virtualBusy=false;document.querySelector('[data-iv-next]')?.removeAttribute('disabled')}}).catch(error=>toast(error.message));return}
  },true);

  function renderGames() {
    referenceGames();return;
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
    if(type==="instant-football"){referenceInstant();return;}
    if(!type||(mobile&&type==="virtuals")){referenceVirtualLobby();return;}
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
  function renderJackpot(tab='play'){
    storage.set('sporty-jackpot-picks',JSON.stringify(jackpotPicks));const round=state.jackpot.round,draw=state.jackpot.draws[round],count=Object.keys(jackpotPicks).length;
    const nav=`<nav class="reference-jackpot-nav"><a href="#/jackpot" ${tab==='play'?'aria-current="page"':''}>Sporty 12${icon('chevron',16)}</a><a href="#/jackpot/results" ${tab==='results'?'aria-current="page"':''}>Previous Results${icon('chevron',16)}</a><a href="#/jackpot/rules" ${tab==='rules'?'aria-current="page"':''}>How to play${icon('chevron',16)}</a></nav>`;
    let content;
    if(tab==='rules')content=`<section class="reference-jackpot-rules"><h2>How to Play "Jackpot"</h2><p>The local Sporty 12 demo consists of predicting the outcomes of twelve games.</p><ol><li>Select 1(Home), X(Draw) or 2(Away) for each match.</li><li>Review your board and place the demo entry for NGN 100.</li><li>Simulate the draw once. Twelve correct predictions return NGN 100,000; eleven return NGN 5,000; ten return NGN 500.</li></ol><p>These payouts are simulated credits with no cash value, not official SportyBet jackpot terms.</p><a class="inline-action" href="#/jackpot">Back to current round</a></section>`;
    else if(tab==='results')content=`<section class="reference-jackpot-rules"><h2>Previous Results</h2><p>Local demo entries and simulated draws</p>${state.jackpot.boards.length?state.jackpot.boards.map(b=>`<div class="jackpot-entry"><strong>${safe(b.id)} · Round ${b.round}</strong><span>${b.correct==null?'Open':b.correct+'/12 correct'}</span><strong>${b.prize?money(b.prize):b.correct==null?'Awaiting draw':'No prize'}</strong></div>`).join(''):'<p>No completed demo entries. Play the current round to create your own result.</p>'}<a href="#/jackpot" class="inline-action">Current round</a></section>`;
    else content=`<section class="jackpot-board"><div class="section-heading"><h2>Round No. ${20261107+round}</h2><span>${draw?'Draw complete':count+'/12 selected'}</span></div><div class="reference-jackpot-columns"><span>No.</span><span>Date</span><span>Match</span><span>H2H</span><span>1(Home)</span><span>X(Draw)</span><span>2(Away)</span></div>${jackpotIds.map((id,i)=>{const f=referenceUI.jackpot[i];return `<div class="jackpot-match"><span class="jackpot-number">${i+1}</span><time class="jackpot-date">${safe(f.date)}</time><div class="jackpot-teams"><small>${safe(f.date)}</small><span>${safe(f.home)}</span><span>${safe(f.away)}</span></div><span class="jackpot-h2h">${icon('chart-no-axes-combined',16)}</span><div class="jackpot-choices">${['home','draw','away'].map((o,j)=>`<button data-jackpick="${id}:${o}" aria-label="${safe(f.home)} ${['Home','Draw','Away'][j]}" aria-pressed="${jackpotPicks[id]===o}" ${draw?'disabled':''}>${f.odds[j].toFixed(2)}${draw&&draw[i]===o?'<small>Result</small>':''}</button>`).join('')}</div></div>`}).join('')}<div class="jackpot-actions"><div><strong>Total Stake <b>NGN ${count===12?'100.00':'0.00'}</b></strong><span>${count}/12 selected</span></div>${draw?primary('Start next demo round','data-next-jackpot'):primary('Place Bet','data-jackpot-enter')}<div class="action-row"><button class="inline-action" data-jackpot-random ${draw?'disabled':''}>Jackpot Rush</button><button class="inline-action" data-jackpot-clear ${draw?'disabled':''}>Clear All</button><button class="inline-action" data-jackpot-draw ${draw?'disabled':''}>Simulate draw</button></div><p class="form-feedback" role="alert"></p><p class="local-note">Local demo entry. No real funds or prizes.</p></div></section>`;
    pageShell('Jackpot',`<div class="reference-jackpot-hero"><div><h2>Predict 12 GAMES to Win</h2><strong>NGN 100,000</strong><p>Prizes for 11 and 10 correct predictions too!</p><small>Simulated credits only. No real prize.</small></div><div class="reference-countdown"><span>Demo visual timer</span><div>${['01','04','54','41'].map((n,i)=>`<div><b data-reference-clock="${['Days','Hours','Minutes','Seconds'][i]}">${n}</b><small>${['Days','Hours','Minutes','Seconds'][i]}</small></div>`).join('')}</div></div></div><div class="reference-jackpot-layout">${nav}<div>${content}</div><aside><a href="#/instant-football"><img src="${asset('59bd76f2fe42b8cd5daf90e91b822ef3.jpg')}" alt="Instant Football"></a></aside></div>`,{full:true,aside:false});
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
    if(section==='notifications'){if(!state.session){referenceAuth('login');return}referenceNotifications();return}
    if(section==='recover'&&referenceRecoveryStep===0){pageShell('Find Account',`<section class="reference-auth-screen reference-recovery"><a class="reference-recovery-back" href="#/account/login">${icon('arrow-left',22)} Find Account</a><div class="reference-auth-form"><form data-reference-recovery-next><h2>Find Account</h2>${referencePhoneField(referencePhone||state.profile?.phone||'')}<button class="btn-green" disabled>Next</button>${formError()}</form><p class="reference-auth-disclosure">Local profile recovery only. No SMS or real account service is connected.</p></div></section>`,{full:true,aside:false});document.documentElement.dataset.surface='auth';return;}
    if(!mobile&&!state.profile&&!section){referenceAuth('login');return;}

    if(section==="register"||section==="login"){referenceAuth(section);return}
    if(mobile&&!section&&(!state.profile||state.session)){referenceGuestAccount();return;}
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
    if(kind==="promotions"){referencePromotions();return;}
    if (kind === "loyalty") {
      referenceLoyalty();return;
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
          if(b.dataset.path==="reference-region")referenceRegion();else navigate(b.dataset.path);
        });
        return;
      }
      if (b.dataset.nav) {
        handle(() => navigate(aliases[b.dataset.nav] || "home"));
        return;
      }
      if (b.hasAttribute("data-auth")) {
        handle(()=>{referenceJoinStep=0;const type=b.classList.contains("login")||b.classList.contains("btn-login")?"login":"register";if(mobile)navigate("account/"+type);else referenceAuth(type,true)});
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
          const text = (b.getAttribute("aria-label")||b.textContent).toLowerCase();
          listStatus = "all";
          referenceDayFilter = text.includes("today") ? "Today" : "All";
          referenceTimeHours = text.includes("3 hours") ? 3 : null;
          referenceSelectedLeagues = [];
          listSport = /nba|euroleague/.test(text) ? "Basketball" : text==='nfl' ? "American Football" : text==='nhl' ? "Ice Hockey" : "Football";
          const leagueNames = {"england premier league":"England Premier League","premier league":"England Premier League","spain la liga":"Spain La Liga","la liga":"Spain La Liga","italy serie a":"Italy Serie A","serie a":"Italy Serie A","germany bundesliga":"Germany Bundesliga","bundesliga":"Germany Bundesliga","france ligue 1":"France Ligue 1","ligue 1":"France Ligue 1"};
          listLeague = leagueNames[text] || "All";
          navigate("sports/"+sportSlug(listSport));
        });
        return;
      }
      if (b.dataset.bottom) {
        handle(() =>
          navigate(
            {
              Home: "home",
              "A-Z Menu": "menu",
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
                Jackpot: "jackpot",
                Livescore: "scores",
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
        const phone=form.querySelector('input:not([type=password]):not([type=checkbox])')?.value||'';
        referencePhone=/^0?[789][01][0-9]{8}$/.test(phone)?phone:'';
        const pin=form.querySelector('input[type=password]')?.value||'';
        const type=form.matches('.reg-panel')?'register':'login';form.reset();referenceJoinStep=0;
        if(mobile)navigate('account/'+type);else{referenceAuth(type,true);const f=document.querySelector('.reference-auth-form form');if(type==='login'&&/^\d{6}$/.test(pin)){f.elements.pin.value=pin;f.elements.pin.dispatchEvent(new Event('input',{bubbles:true}));f.requestSubmit()}}
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
              s.profile = { id: uid("USER"), name, salt, hash, recoveryHash, phone:form.elements.phone?.value||"" };
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
    navigator.serviceWorker.register(new URL("../../sw.js", document.currentScript.src).href,{updateViaCache:"none"}).catch(() => {});
})();
