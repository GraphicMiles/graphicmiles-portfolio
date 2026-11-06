"use strict";

// Snapshot data and local state. No credentials or payment information are collected.
const mobileQuery = matchMedia("(max-width: 767px)");
let mobile = mobileQuery.matches;
const scheduledMatch = [
  "Liverpool Montevideo",
  "Penarol Montevideo",
  null,
  null,
  [3.4, 3.6, 1.89],
];
const fixture = (id) =>
  id === 10
    ? scheduledMatch
    : matches[id] || globalThis.demoFixtures?.[id]?.teams;
const leagueName = (id) =>
  globalThis.demoFixtures?.[id]?.league ||
  (id === 10
    ? "Uruguay Tercera Division"
    : id >= 8
      ? "UEFA Conference League"
      : "UEFA Europa League");
const currency = (n) =>
  "NGN " +
  n.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const pickKey = (id, market, outcome) => `${id}|${market}|${outcome}`;
let recovered = false;
const memory = new Map();
const storage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return memory.get(key) ?? null;
    }
  },
  set(key, value) {
    memory.set(key, value);
    try {
      localStorage.setItem(key, value);
    } catch {
      storage.unavailable = true;
    }
  },
  unavailable: false,
};
function readJSON(key, fallback) {
  try {
    const value = storage.get(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    recovered = true;
    return fallback;
  }
}
const nextGoalOdds = [
  [1.85, 4.7, 3.2],
  [5.6, 6.75, 1.37],
  [1.75, 6.75, 2.95],
  [2, 5.5, 2.65],
  [2.8, 4.8, 2],
  [1.65, 6.75, 3.2],
  [2.2, 3.75, 2.95],
  [1.85, 5.6, 2.85],
  [1.37, 6.5, 6.5],
  [2.65, 8, 1.8],
];
const nextLines = [1, 2, 2, 2, 2, 2, 1, 2, 1, 3];
const initialPicks = readJSON("sporty-picks", []);
let picks = Array.isArray(initialPicks)
  ? initialPicks.filter(validatePick)
  : [];
if (!Array.isArray(initialPicks) || picks.length !== initialPicks.length)
  recovered = true;
const uniqueFixtures = new Set();
picks = picks
  .filter((p) => {
    if (uniqueFixtures.has(p.id)) {
      recovered = true;
      return false;
    }
    uniqueFixtures.add(p.id);
    return true;
  })
  .slice(0, 20);
let stake = storage.get("sporty-stake") || "";
if (!/^\d*(\.\d{0,2})?$/.test(stake) || Number(stake) > 1000000) {
  stake = "";
  recovered = true;
}
let tickets = readJSON("sporty-tickets", []);
if (!Array.isArray(tickets)) tickets = [];
tickets = tickets.filter(
  (t) =>
    t &&
    typeof t.id === "string" &&
    Array.isArray(t.picks) &&
    t.picks.every(validatePick) &&
    Number.isFinite(t.stake) &&
    t.stake > 0,
);
let savedCodes = readJSON("sporty-codes", {});
if (!savedCodes || Array.isArray(savedCodes) || typeof savedCodes !== "object")
  savedCodes = {};
let account = readJSON("sporty-profile", null);
if (!account || typeof account.name !== "string") account = null;
let mode = "REAL",
  slipTab = "Betslip",
  liveSport = "Football",
  liveMarket = "1X2",
  liveLeague = "All";
let expanded = false,
  carouselIndex = 0,
  sheetTrigger = null,
  dialogTrigger = null;
let route = "Sports";
const marketLabels = {
  "1x2": "1X2",
  next: "Next goal",
  "totals:2.5": "Total goals 2.5",
};
function validatePick(p) {
  if (
    !p ||
    !Number.isInteger(p.id) ||
    !fixture(p.id) ||
    typeof p.market !== "string" ||
    typeof p.outcome !== "string"
  )
    return false;
  const odds = lookupOdd(p.id, p.market, p.outcome);
  return (
    odds !== null &&
    p.key === pickKey(p.id, p.market, p.outcome) &&
    p.odd === odds
  );
}
function lookupOdd(id, market, outcome) {
  if (globalThis.demoMarketOdd) {
    const extended = globalThis.demoMarketOdd(id, market, outcome);
    if (extended !== undefined) return extended;
  }
  if (!fixture(id)) return null;
  if (market === "1x2") {
    const j = ["home", "draw", "away"].indexOf(outcome);
    return j >= 0 ? fixture(id)[4][j] : null;
  }
  if (
    market.startsWith("next:") &&
    id < 10 &&
    Number(market.split(":")[1]) === nextLines[id]
  ) {
    const j = ["home", "none", "away"].indexOf(outcome);
    return j >= 0 ? nextGoalOdds[id][j] : null;
  }
  if (id === 10 && market === "totals:2.5")
    return outcome === "over" ? 1.54 : outcome === "under" ? 2.3 : null;
  return null;
}
function pickLabel(p) {
  if (globalThis.demoPickLabel) {
    const label = globalThis.demoPickLabel(p);
    if (label) return label;
  }
  const f = fixture(p.id);
  if (p.market === "1x2")
    return p.outcome === "draw" ? "Draw" : p.outcome === "home" ? f[0] : f[1];
  if (p.market.startsWith("totals:"))
    return `${p.outcome === "over" ? "Over" : "Under"} ${p.market.split(":")[1]} goals`;
  return p.outcome === "none"
    ? "No goal"
    : `${p.outcome === "home" ? f[0] : f[1]} to score next`;
}
function marketTitle(p) {
  if (globalThis.demoMarketTitle) {
    const title = globalThis.demoMarketTitle(p.market);
    if (title) return title;
  }
  return (
    marketLabels[p.market] ||
    (p.market.startsWith("next:")
      ? `Next goal ${p.market.split(":")[1]}`
      : p.market)
  );
}
function persist() {
  storage.set("sporty-picks", JSON.stringify(picks));
  storage.set("sporty-stake", stake);
}
function drawIcons() {
  window.lucide?.createIcons();
}
function markPicks() {
  document.querySelectorAll("[data-pick]").forEach((b) =>
    b.setAttribute(
      "aria-pressed",
      picks.some((p) => p.key === b.dataset.pick),
    ),
  );
  const badge = document.querySelector("#pick-count");
  if (badge) badge.textContent = picks.length;
}
function marketOdd(id, market, outcome, value) {
  const key = pickKey(id, market, outcome),
    f = fixture(id);
  const label = pickLabel({ id, market, outcome });
  return `<button class="odd-btn" data-pick="${key}" data-id="${id}" data-market-id="${market}" data-outcome="${outcome}" aria-label="${escapeHTML(f[0] + " v " + f[1] + ", " + label + ", " + Number(value).toFixed(2))}" aria-pressed="${picks.some((p) => p.key === key)}">${Number(value).toFixed(2)}</button>`;
}
function odd(id, j, value) {
  return marketOdd(id, "1x2", ["home", "draw", "away"][j], value);
}
function tabs() {
  return `<div class="sport-tabs" role="tablist" aria-label="Sport">${["Football", "vFootball", "Basketball", "Tennis", "eFootball", "More Sports"].map((s, i) => `<button role="tab" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-tab="${s}">${s}</button>`).join("")}<button class="filter-trigger" aria-label="Filter matches" data-filter>${icon("filter")}</button></div>`;
}
function row(m, id) {
  const next = `next:${nextLines[id]}`;
  const odds =
    liveMarket === "1X2"
      ? m[4].map((v, j) => odd(id, j, v)).join("")
      : liveMarket === "Next Goal"
        ? nextGoalOdds[id]
            .map((v, j) => marketOdd(id, next, ["home", "none", "away"][j], v))
            .join("")
        : `<button class="market-unavailable" data-detail="${id}">View available markets ${icon("chevron", 12)}</button>`;
  return `<div class="live-row"><div class="match-when"><div class="time">45:00</div><div class="ht">HT</div></div><button class="match-teams" data-detail="${id}"><span class="team">${escapeHTML(m[0])}</span><span class="team">${escapeHTML(m[1])}</span></button><div class="live-score">${m[2]}<br>${m[3]}</div><div class="odds-cols">${odds}<span class="desktop-extra gap"></span><button class="odd-select desktop-extra" data-lines="${id}" aria-label="Next goal market ${nextLines[id]}">${nextLines[id]} ${icon("down", 12)}</button>${nextGoalOdds[id].map((v, j) => marketOdd(id, next, ["home", "none", "away"][j], v).replace('class="odd-btn"', 'class="odd-btn desktop-extra"')).join("")}<button class="more-markets desktop-extra" data-detail="${id}" aria-label="View ${escapeHTML(m[0])} markets">${icon("chevron", 16)}</button></div></div>`;
}
function live() {
  return `<section class="card-dark live-card">${head("Live Betting")}${tabs()}<div class="live-results" role="tabpanel" aria-label="Football matches"></div><button class="view-all" data-more>View all ${matches.length} events ${icon("chevron")}</button></section>`;
}
function slip() {
  return `<section class="betslip"><div class="betslip-head" role="tablist" aria-label="Betslip view"><button role="tab" aria-selected="true" tabindex="0" data-sliptab="Betslip">Betslip</button><button role="tab" aria-selected="false" tabindex="-1" data-sliptab="Cashout">Cashout</button></div><div class="betslip-mode"><div class="pill-wrap" role="group" aria-label="Bet mode"><button aria-pressed="${mode === "REAL"}" data-mode="REAL">REAL</button><button aria-pressed="${mode === "SIM"}" data-mode="SIM">SIM</button></div></div><div class="betslip-body" role="tabpanel" aria-label="Betslip" id="slip-body"></div></section>`;
}
function emptyState(
  title,
  text,
  action = "Show football",
  attr = "data-resetfilters",
) {
  return `<div class="empty-state"><h3>${escapeHTML(title)}</h3><p>${escapeHTML(text)}</p><button class="inline-action" ${attr}>${escapeHTML(action)}</button></div>`;
}
function liveContent(limit = 10) {
  if (!["1X2", "Next Goal"].includes(liveMarket))
    return emptyState(
      "Market not in this snapshot",
      "Choose 1X2 or Next Goal to see captured odds.",
      "Show 1X2",
      "data-resetfilters",
    );
  if (liveSport !== "Football")
    return emptyState(
      `No ${liveSport} fixtures`,
      "There are no captured events for this sport.",
    );
  let ids = matches
    .map((_, i) => i)
    .filter((id) => liveLeague === "All" || leagueName(id) === liveLeague)
    .slice(0, limit);
  if (!ids.length)
    return emptyState(
      "No matching events",
      "Try another league or reset your filters.",
    );
  if (mobile)
    return ids
      .map(
        (id) =>
          `<article class="m-match"><div class="m-match-meta"><strong>45:00 HT</strong><span>${leagueName(id)}</span><button data-detail="${id}" aria-label="Match details">${icon("chart")}</button></div>${row(matches[id], id)}</article>`,
      )
      .join("");
  return `<div class="live-group"><div class="market-column-head"><span>Match</span><div><span>1</span><span>X</span><span>2</span><span>Goal</span><span>1</span><span>No goal</span><span>2</span></div></div>${ids.map((id, i) => `${i === 0 || leagueName(id) !== leagueName(ids[i - 1]) ? `<h3>${leagueName(id)}</h3>` : ""}${row(matches[id], id)}`).join("")}</div>`;
}
function renderLive() {
  const target = document.querySelector(
    mobile ? ".m-live-results" : ".live-results",
  );
  if (target) {
    target.innerHTML = liveContent(expanded ? 10 : mobile ? 6 : 10);
    animateContent(target);
    drawIcons();
    markPicks();
  }
  const panel = document.querySelector(mobile ? ".m-live" : ".live-card");
  if (panel) {
    panel.querySelectorAll("[data-tab]").forEach((b) => {
      const active = b.dataset.tab === liveSport;
      b.setAttribute("aria-selected", active);
      b.tabIndex = active ? 0 : -1;
    });
    const tp = panel.querySelector("[role=tabpanel]");
    if (tp) {
      tp.setAttribute("aria-label", liveSport + " matches");
      const selected = panel.querySelector("[data-tab][aria-selected=true]");
      if (selected?.id) tp.setAttribute("aria-labelledby", selected.id);
    }
  }
}
function stakeError() {
  if (!stake.trim()) return "Enter a stake.";
  if (!/^\d+(\.\d{1,2})?$/.test(stake))
    return "Use a positive amount with up to two decimal places.";
  const n = Number(stake);
  if (!Number.isFinite(n) || n < 50 || n > 1000000)
    return "Stake must be between NGN 50 and NGN 1,000,000.";
  const total = picks.reduce((a, p) => a * p.odd, 1);
  if (!Number.isFinite(total * n) || total * n > Number.MAX_SAFE_INTEGER / 100)
    return "The calculated return exceeds the supported limit.";
  return "";
}
function renderSlip() {
  persist();
  markPicks();
  const body = document.querySelector("#slip-body");
  if (!body) return;
  body.setAttribute("aria-label", slipTab);
  if (slipTab === "Cashout") {
    body.innerHTML = emptyState(
      "No cashout offers",
      "Demo tickets do not have real-money cashout. View or cancel your saved demo tickets.",
      "Open bets",
      "data-openbets",
    );
    return;
  }
  if (!picks.length) {
    body.innerHTML = `<div class="betslip-empty"><p>Click an odd to start your betslip, or load a locally saved booking code.</p><form data-booking-form><label class="field"><input placeholder="Booking Code" aria-label="Booking Code" maxlength="16" autocomplete="off"></label><button class="load" disabled>Load</button><p class="error" role="alert" hidden></p></form><p class="hint">Codes saved on this browser work offline.</p></div>`;
    body.querySelector("input").oninput = (e) =>
      (body.querySelector(".load").disabled = !e.target.value.trim());
    return;
  }
  const total = picks.reduce((a, p) => a * p.odd, 1);
  body.innerHTML = `<div class="slip-list">${picks.map((p) => `<div class="slip-item"><div class="league">${leagueName(p.id)}</div><div class="pick">${escapeHTML(pickLabel(p))}</div><div class="match">${escapeHTML(fixture(p.id).slice(0, 2).join(" v "))}</div><div class="slip-market">${escapeHTML(marketTitle(p))}</div><strong>${p.odd.toFixed(2)}</strong><button class="remove" data-remove="${p.key}" aria-label="Remove ${escapeHTML(pickLabel(p))}">${icon("close", 16)}</button></div>`).join("")}</div><div class="slip-foot"><div class="slip-total"><span>${picks.length === 1 ? "Single" : "Multiple"} · Total odds</span><strong>${total.toFixed(2)}</strong></div><label class="stake"><span>NGN</span><input aria-label="Stake" inputmode="decimal" placeholder="Stake" maxlength="12" value="${escapeHTML(stake)}" aria-describedby="stake-error"></label><p class="field-error" id="stake-error" role="status"></p><div class="slip-total"><span>Potential win</span><strong class="pay">${stakeError() ? "NGN 0.00" : currency(total * Number(stake))}</strong></div><button class="btn-green" data-place>${mode === "SIM" ? "Place demo bet" : "Review bet"}</button><div class="slip-actions"><button data-savecode>Book selections</button><button data-clear>Remove all</button></div><p class="local-note">Local replica. No real-money bets or payments.</p></div>`;
  body.querySelector("input").oninput = (e) => {
    stake = e.target.value;
    storage.set("sporty-stake", stake);
    updateStake();
  };
  drawIcons();
}
function updateStake(showEmpty = false) {
  const error = stakeError(),
    el = document.querySelector("#stake-error"),
    field = document.querySelector("input[aria-label=Stake]");
  if (el) el.textContent = stake || showEmpty ? error : "";
  field?.setAttribute("aria-invalid", Boolean(error && (stake || showEmpty)));
  const pay = document.querySelector(".pay");
  if (pay)
    pay.textContent = error
      ? "NGN 0.00"
      : currency(picks.reduce((a, p) => a * p.odd, 1) * Number(stake));
  return !error;
}
function togglePick(button) {
  const id = Number(button.dataset.id),
    market = button.dataset.marketId,
    outcome = button.dataset.outcome,
    odd = lookupOdd(id, market, outcome);
  if (odd === null) return;
  const key = pickKey(id, market, outcome),
    exists = picks.some((p) => p.key === key);
  // Correlated selections from the same fixture cannot form a normal multiple.
  picks = picks.filter((p) => p.id !== id);
  if (!exists) {
    if (picks.length >= 20) {
      toast("A betslip can contain at most 20 events.");
      return;
    }
    picks.push({ id, market, outcome, key, odd });
  }
  renderSlip();
  if (!motionReduced())
    document
      .querySelector(".m-slip-fab")
      ?.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(1.08)" },
          { transform: "scale(1)" },
        ],
        { duration: 200 },
      );
}

// Modal stack: the browser traps focus inside native dialogs. The sheet only
// handles Escape and Tab when no native dialog is above it.
let activeDialog = null;
function openDialog(title, html, onReady) {
  if (activeDialog) {
    const previous = activeDialog;
    previous.close();
    previous.remove();
    activeDialog = null;
  }
  const returnFocus = document.activeElement;
  const d = document.createElement("dialog");
  d.className = "app-dialog";
  d.setAttribute("aria-labelledby", "modal-title");
  d.innerHTML = `<button class="dialog-close" aria-label="Close" data-close>${icon("close", 22)}</button><h2 id="modal-title">${escapeHTML(title)}</h2><div class="dialog-content">${html}</div>`;
  document.body.append(d);
  activeDialog = d;
  document.body.classList.add("modal-open");
  d.addEventListener("click", (e) => {
    const rect = d.getBoundingClientRect();
    const outside =
      e.target === d &&
      (e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom);
    if (outside || e.target.closest("[data-close]")) dismissDialog(d);
  });
  d.addEventListener("cancel", (e) => {
    e.preventDefault();
    dismissDialog(d);
  });
  d.addEventListener("close", () => {
    if (activeDialog === d) activeDialog = null;
    d.remove();
    if (!activeDialog) {
      document.body.classList.remove("modal-open");
      if (returnFocus?.isConnected) returnFocus.focus();
    }
  });
  d.showModal();
  drawIcons();
  onReady?.(d);
  return d;
}
function closeDialog() {
  activeDialog?.close();
}
async function dismissDialog(dialog) {
  if (!dialog.open || dialog.dataset.closing) return;
  dialog.dataset.closing = "true";
  if (!motionReduced())
    await dialog
      .animate(
        [
          { opacity: 1, transform: "translateY(0)" },
          { opacity: 0, transform: "translateY(16px)" },
        ],
        { duration: 140, easing: "ease-in", fill: "forwards" },
      )
      .finished.catch(() => {});
  if (dialog.open) dialog.close();
}
function toast(text) {
  let t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    document.body.append(t);
  }
  t.textContent = text;
  t.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove("show"), 3500);
}
function motionReduced() {
  return (
    document.documentElement.dataset.motion === "reduce" ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
// The reference switches route content directly; motion belongs to individual components.
function animateContent(el) { return el; }
function openSheet(trigger = document.activeElement) {
  if (!mobile) {
    document
      .querySelector(".betslip")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    document.querySelector("#slip-body input")?.focus({ preventScroll: true });
    return;
  }
  const bg = document.querySelector(".sheet-backdrop");
  if (!bg) return;
  sheetTrigger = trigger;
  bg.dataset.closing = "";
  bg.querySelector(".m-sheet")
    .getAnimations()
    .forEach((a) => a.cancel());
  bg.hidden = false;
  document.body.classList.add("sheet-open");
  bg.querySelector(".sheet-close").focus();
}
async function closeSheet() {
  const bg = document.querySelector(".sheet-backdrop");
  if (!bg || bg.hidden || bg.dataset.closing) return;
  bg.dataset.closing = "true";
  if (!motionReduced())
    await bg
      .querySelector(".m-sheet")
      .animate(
        [{ transform: "translateY(0)" }, { transform: "translateY(100%)" }],
        { duration: 250, easing: "cubic-bezier(.645,.045,.355,1)", fill: "forwards" },
      )
      .finished.catch(() => {});
  if (!bg.isConnected || !bg.dataset.closing) return;
  bg.hidden = true;
  bg.dataset.closing = "";
  document.body.classList.remove("sheet-open");
  if (sheetTrigger?.isConnected) sheetTrigger.focus();
}
function reviewBet() {
  if (!updateStake(true)) {
    document.querySelector("input[aria-label=Stake]")?.focus();
    return;
  }
  const sum = picks.reduce((a, p) => a * p.odd, 1) * Number(stake);
  openDialog(
    "Review demo bet",
    `<p class="local-note">Simulation only. This does not place a SportyBet wager or use real money.</p><dl class="review-totals"><div><dt>Selections</dt><dd>${picks.length}</dd></div><div><dt>Stake</dt><dd>${currency(Number(stake))}</dd></div><div><dt>Potential win</dt><dd>${currency(sum)}</dd></div></dl><button class="btn-green" data-confirmbet>Confirm demo bet</button>`,
  );
}
function confirmBet(button) {
  button.disabled = true;
  const ticket = {
    id: "DEMO-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
    created: new Date().toISOString(),
    stake: Number(stake),
    picks: structuredClone(picks),
    status: "Open",
  };
  tickets.unshift(ticket);
  storage.set("sporty-tickets", JSON.stringify(tickets));
  picks = [];
  renderSlip();
  closeDialog();
  showTickets(ticket.id);
}
function showTickets(highlight = "") {
  openDialog(
    "Open bets",
    `<p class="local-note">Local demo tickets. No real funds or live settlement.</p>${tickets.length ? tickets.map((t) => `<article class="ticket"><div><strong>${escapeHTML(t.id)}</strong><span>${escapeHTML(t.status)}</span></div><p>${t.picks.length} selection${t.picks.length === 1 ? "" : "s"} · ${currency(t.stake)}</p><ul>${t.picks.map((p) => `<li>${escapeHTML(pickLabel(p))} <strong>${p.odd.toFixed(2)}</strong></li>`).join("")}</ul>${t.status === "Open" ? `<button class="inline-action" data-cancel-ticket="${escapeHTML(t.id)}">Cancel demo ticket</button>` : ""}</article>`).join("") : emptyState("No open bets", "Your saved demo tickets will appear here.", "Build a betslip", "data-buildslip")}`,
  );
}
function bookSelections() {
  const code = crypto
    .randomUUID()
    .replaceAll("-", "")
    .slice(0, 8)
    .toUpperCase();
  savedCodes[code] = structuredClone(picks);
  storage.set("sporty-codes", JSON.stringify(savedCodes));
  openDialog(
    "Booking code",
    `<p>Saved on this browser. Load this code to restore these selections.</p><output class="booking-code">${code}</output><button class="btn-green" data-copy="${code}">Copy code</button><button class="inline-action" data-close>Back to betslip</button>`,
  );
}
function loadBooking(form) {
  const code = form.querySelector("input").value.trim().toUpperCase(),
    data = savedCodes[code];
  if (!Array.isArray(data) || !data.length || !data.every(validatePick)) {
    const e = form.querySelector(".error");
    e.hidden = false;
    e.textContent =
      "Code not found on this browser. Check the code or book new selections.";
    return;
  }
  picks = structuredClone(data);
  slipTab = "Betslip";
  renderSlip();
  closeDialog();
  openSheet();
  toast("Selections loaded.");
}
function showSearch() {
  openDialog(
    "Search events",
    `<form class="search-form" data-search-form><label for="match-search">Team or competition</label><input id="match-search" type="search" autocomplete="off" placeholder="Search teams, leagues…"></form><div class="search-results" aria-live="polite"></div>`,
    (d) => {
      const input = d.querySelector("input"),
        results = d.querySelector(".search-results");
      const search = () => {
        const q = input.value.trim().toLowerCase(),
          ids = [...matches, scheduledMatch]
            .map((m, i) => ({ m, id: i }))
            .filter(
              ({ m, id }) =>
                !q ||
                (m[0] + " " + m[1] + " " + leagueName(id))
                  .toLowerCase()
                  .includes(q),
            );
        results.innerHTML = ids.length
          ? ids
              .map(
                ({ m, id }) =>
                  `<button class="search-result" data-detail="${id}"><span>${escapeHTML(m[0])}<br>${escapeHTML(m[1])}<small>${leagueName(id)}</small></span>${icon("chevron")}</button>`,
              )
              .join("")
          : emptyState(
              "No matching events",
              "Try another team or competition.",
              "Clear search",
              "data-clearsearch",
            );
        drawIcons();
      };
      input.oninput = search;
      search();
    },
  );
}
function showDetails(id) {
  const m = fixture(id);
  if (!m) return;
  openDialog(
    m[0] + " v " + m[1],
    `<p class="match-summary">${leagueName(id)} · ${id === 10 ? "Scheduled 20:00" : m[2] + " - " + m[3] + " · HT"}</p><div class="detail-market"><h3>1X2</h3><div>${m[4].map((v, j) => odd(id, j, v)).join("")}</div></div>${id === 10 ? `<div class="detail-market"><h3>Total goals 2.5</h3><div>${marketOdd(10, "totals:2.5", "over", 1.54)}${marketOdd(10, "totals:2.5", "under", 2.3)}</div></div>` : `<div class="detail-market"><h3>Next goal ${nextLines[id]}</h3><div>${nextGoalOdds[id].map((v, j) => marketOdd(id, `next:${nextLines[id]}`, ["home", "none", "away"][j], v)).join("")}</div></div>`}<p class="local-note">Odds and scores from the captured fixture snapshot.</p><button class="btn-green" data-buildslip>View betslip</button>`,
  );
}
function showLines(id) {
  openDialog(
    "Choose market",
    `<p>Available captured markets for ${escapeHTML(fixture(id)[0])} v ${escapeHTML(fixture(id)[1])}.</p><button class="selection-row" data-detail="${id}">${id === 10 ? "Total goals 2.5" : `Next goal ${nextLines[id]}`} ${icon("chevron")}</button><p class="local-note">Other lines are not included in this snapshot.</p>`,
  );
}
function showFilter() {
  openDialog(
    "Filter matches",
    `<form data-filter-form><label for="league-filter">Competition</label><select id="league-filter" name="league">${["All", "UEFA Europa League", "UEFA Conference League"].map((l) => `<option ${liveLeague === l ? "selected" : ""}>${l}</option>`).join("")}</select><button class="btn-green">Apply filters</button><button type="button" class="inline-action" data-resetfilters>Reset filters</button></form>`,
  );
}
function switchSport(button) {
  const parent = button.closest(".highlights")
    ? "highlights"
    : button.closest(".m-live,.live-card")
      ? "live"
      : "live";
  const sport = button.dataset.tab;
  if (sport === "More Sports") {
    showSports();
    return;
  }
  if (parent === "live") {
    liveSport = sport;
    renderLive();
  } else {
    button.parentElement.querySelectorAll("[role=tab]").forEach((t) => {
      t.setAttribute("aria-selected", t === button);
      t.tabIndex = t === button ? 0 : -1;
    });
    const table = document.querySelector(".match-table");
    if (!table) return;
    if (sport === "Football") {
      table.innerHTML = originalHighlights;
      document
        .querySelectorAll(".highlights [data-chip]")
        .forEach((b, i) => b.setAttribute("aria-pressed", i === 0));
    } else
      table.innerHTML = emptyState(
        `No ${sport} highlights`,
        "No captured events for this sport.",
        "Show football",
        "data-reset-highlights",
      );
    drawIcons();
    markPicks();
  }
}
function filterLeague(text) {
  if (/conference/i.test(text)) liveLeague = "UEFA Conference League";
  else if (/europa/i.test(text)) liveLeague = "UEFA Europa League";
  else if (/premier|la liga/i.test(text)) liveLeague = text.trim();
  else liveLeague = "All";
  liveSport = "Football";
  renderLive();
  document
    .querySelector(mobile ? ".m-live" : ".live-card")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}
function showSports() {
  openDialog(
    "All sports",
    `<div class="sport-directory">${["Football", "vFootball", "Basketball", "Tennis", "eFootball", "Table Tennis", "eBasketball", "Ice Hockey"].map((s) => `<button class="selection-row" data-choosesport="${s}">${s}<span>${s === "Football" ? matches.length : 0} events</span>${icon("chevron")}</button>`).join("")}</div>`,
  );
}
function profile() {
  if (account) {
    openDialog(
      "My profile",
      `<p>Welcome, <strong>${escapeHTML(account.name)}</strong>.</p><p class="local-note">Local profile. Not a SportyBet account.</p><button class="selection-row" data-openbets>My demo bets ${icon("chevron")}</button><button class="selection-row" data-managecodes>Saved codes ${icon("chevron")}</button><button class="selection-row" data-signout>Remove local profile ${icon("user")}</button>`,
    );
    return;
  }
  openDialog(
    "Welcome to SportyBet replica",
    `<p>Try the experience with a local demo profile. No password, payment or real account is needed.</p><form data-profile-form><label for="profile-name">Display name</label><input id="profile-name" name="name" maxlength="40" required autocomplete="nickname" placeholder="Your name"><button class="btn-green">Create local profile</button></form><p class="local-note">For real account access, use the official service.</p><a class="external-link" href="https://www.sportybet.com/ng/" target="_blank" rel="noopener noreferrer">Open official SportyBet</a>`,
  );
}
function showCodes() {
  const codes = Object.entries(savedCodes).filter(
    ([, v]) => Array.isArray(v) && v.every(validatePick),
  );
  openDialog(
    "Saved booking codes",
    `${codes.length ? codes.map(([k, v]) => `<button class="selection-row" data-restorecode="${escapeHTML(k)}"><strong>${escapeHTML(k)}</strong><span>${v.length} selections</span>${icon("chevron")}</button>`).join("") : "<p>No saved codes. Select odds and choose Book selections.</p>"}<form data-booking-form><label for="load-code">Booking code</label><input id="load-code" placeholder="Booking Code" maxlength="16" autocomplete="off"><button class="btn-green">Load code</button><p class="error" role="alert" hidden></p></form>`,
  );
}

// Navigation uses real views. Unsupported feeds get a truthful empty state,
// never football fixtures underneath a different sport's active tab.
function routeView(name) {
  route = name;
  if (name === "Sports" || name === "Home") {
    document.querySelectorAll(".primary-nav [data-nav]").forEach((b) => {
      if (b.dataset.nav === "Sports") b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
    document.querySelector(".route-view")?.remove();
    document.querySelectorAll("[data-route-hidden]").forEach((e) => {
      e.hidden = false;
      e.removeAttribute("data-route-hidden");
    });
    scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  document.querySelectorAll(".primary-nav [data-nav]").forEach((b) => {
    if (b.dataset.nav === name) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  });
  let panel = document.querySelector(".route-view");
  if (!panel) {
    panel = document.createElement("main");
    panel.className = "route-view container";
    const anchor = document.querySelector(mobile ? ".m-main" : ".hero");
    anchor.after(panel);
    document
      .querySelectorAll(mobile ? ".m-main" : ".hero,.content")
      .forEach((el) => {
        el.hidden = true;
        el.dataset.routeHidden = "true";
      });
  }
  let content = "";
  if (
    [
      "Games",
      "Live Games",
      "Instant Football",
      "Scheduled Virtuals",
      "Lucky Numbers",
      "Virtuals",
      "Aviator",
    ].includes(name)
  ) {
    content = `<p class="local-note">Practice games only. No stakes, winnings or real funds.</p><div class="practice-list">${[
      ["bottle", "Spin da’ Bottle"],
      ["redblack", "Red Black"],
      ["hero", "Sporty Hero"],
    ]
      .map(
        ([n, t]) =>
          `<button class="practice-tile" data-game="${n}"><img src="${asset(`minigame-${n}.png`)}" alt=""><span>${t}</span><small>Practice ${icon("chevron", 16)}</small></button>`,
      )
      .join("")}</div>`;
  } else if (
    ["Livescore", "Live Betting", "Results", "Open Bets"].includes(name)
  ) {
    if (name === "Open Bets") {
      showTickets();
      return;
    }
    content =
      name === "Results"
        ? emptyState(
            "No final results",
            "The captured matches are still at half-time.",
            "View live scores",
            "data-scores",
          )
        : `<p class="local-note">Captured scores, not a live feed.</p><div class="score-list">${matches.map((m, id) => `<button class="selection-row" data-detail="${id}"><span>${escapeHTML(m[0])}<br>${escapeHTML(m[1])}</span><strong>${m[2]}<br>${m[3]}</strong><span>HT</span>${icon("chevron")}</button>`).join("")}</div>`;
  } else if (name === "Jackpot") {
    content = `<img class="route-banner" src="${asset(`f012954cf4bb2e7da6bb87440282af91.webp`)}" alt="Captured Sporty 12 jackpot banner"><p class="local-note">Promotional information from the reference snapshot. No jackpot entry is offered here.</p><button class="btn-green" data-home>Browse captured fixtures</button>`;
  } else if (name === "Promotions" || name === "Sporty Loyalty") {
    content = `<div class="promotion-list"><button data-detail="0"><img src="${asset(`b638c0f668a29248d4709fa3618d4615.webp`)}" alt="Leverkusen vs Marseille promotion"></button><button data-nav="Jackpot"><img src="${asset(`f012954cf4bb2e7da6bb87440282af91.webp`)}" alt="Jackpot promotion"></button></div><p class="local-note">Promotions are reference imagery. No bonus or loyalty points are credited by this replica.</p>`;
  } else if (name === "App") {
    content = `<p>This replica runs in your browser at desktop and mobile widths.</p><a class="btn-green" href="https://www.sportybet.com/ng/m/" target="_blank" rel="noopener noreferrer">Official SportyBet mobile site</a>`;
  } else {
    content = emptyState(
      "No captured events",
      "Choose Football to browse the available snapshot.",
      "Show football",
      "data-home",
    );
  }
  panel.innerHTML = `<div class="route-title"><button aria-label="Back to sports" data-home>${icon("arrow-left", 22)}</button><h1>${escapeHTML(name)}</h1><button aria-label="Search" data-search>${icon("search", 22)}</button></div>${content}`;
  animateContent(panel);
  drawIcons();
  scrollTo({ top: 0, behavior: "smooth" });
}
function showPractice(type) {
  const title =
    type === "bottle"
      ? "Spin da’ Bottle"
      : type === "redblack"
        ? "Red Black"
        : "Sporty Hero";
  openDialog(
    title,
    `<p class="local-note">Free local practice. Outcomes do not pay real money.</p><div class="practice-stage" data-stage>${icon(type === "bottle" ? "rotate-cw" : type === "redblack" ? "circle" : "shield", 64)}</div><p class="practice-result" role="status">${type === "redblack" ? "Choose a color, then reveal." : "Ready to play?"}</p>${type === "redblack" ? '<div class="practice-options"><button aria-pressed="true" data-color="Red">Red</button><button aria-pressed="false" data-color="Black">Black</button></div>' : ""}<button class="btn-green" data-play="${type}">${type === "bottle" ? "Spin" : type === "redblack" ? "Reveal" : "Kick"}</button>`,
    (d) => {
      d.dataset.color = "Red";
    },
  );
}
async function playPractice(button) {
  const d = button.closest("dialog");
  button.disabled = true;
  const stage = d.querySelector("[data-stage]"),
    reduced = motionReduced();
  const value = crypto.getRandomValues(new Uint32Array(1))[0],
    type = button.dataset.play;
  if (!reduced)
    await stage.animate(
      [
        { transform: "rotate(0deg)" },
        { transform: `rotate(${720 + (value % 360)}deg)` },
      ],
      { duration: 700, easing: "cubic-bezier(.1,.7,.3,1)" },
    ).finished;
  if (!d.isConnected) return;
  const result =
    type === "bottle"
      ? value % 2
        ? "UP"
        : "DOWN"
      : type === "redblack"
        ? value % 2
          ? "Red"
          : "Black"
        : value % 2
          ? "Goal!"
          : "Saved!";
  d.querySelector(".practice-result").textContent =
    type === "redblack"
      ? `${result}. ${d.dataset.color === result ? "Your color matched." : "Try again."}`
      : result;
  button.textContent = "Play again";
  button.disabled = false;
}
function featureContent(tab) {
  const block = document.querySelector(".m-feature-match");
  if (!block) return;
  document.querySelectorAll("[data-feature]").forEach((b) => {
    b.classList.toggle("active", b.dataset.feature === tab);
    b.setAttribute("aria-selected", b.dataset.feature === tab);
  });
  if (tab === "Matches") block.innerHTML = originalFeature;
  else if (tab === "Codes")
    block.innerHTML = `<div class="feature-action"><h3>Booking codes</h3><p>Restore selections saved on this browser.</p><button class="btn-green" data-managecodes>Load code</button></div>`;
  else
    block.innerHTML = `<div class="feature-action"><h3>${escapeHTML(tab)}</h3><p>Try a free local practice game.</p><button class="btn-green" data-game="${tab === "Virtuals" ? "hero" : "bottle"}">Play practice</button></div>`;
  animateContent(block);
  drawIcons();
  markPicks();
}
function infoAction(name) {
  if (/Forgot Password|Deactivate|Reactivate|Register|login/i.test(name)) {
    profile();
    return;
  }
  if (name === "Settings") {
    openDialog(
      "Settings",
      `<label class="setting-row"><span>Reduce motion</span><input type="checkbox" data-motion ${document.documentElement.dataset.motion === "reduce" ? "checked" : ""}></label><p class="local-note">Your system’s reduced-motion setting is always respected.</p><button class="selection-row" data-clearlocal>Reset saved selections and demo tickets ${icon("trash-2")}</button>`,
    );
    return;
  }
  if (/Leverkusen|Real Sociedad|LEV vs MAR|CEL vs BJK/.test(name)) {
    showDetails(name.includes("Sociedad") ? 3 : 0);
    return;
  }
  if (/Jackpot/.test(name)) {
    routeView("Jackpot");
    return;
  }
  if (/Spin|Hero|Red Black|Mini Games|games|Lucky|Aviator/i.test(name)) {
    if (name.includes("Spin")) showPractice("bottle");
    else if (name.includes("Red Black")) showPractice("redblack");
    else if (name.includes("Hero")) showPractice("hero");
    else routeView("Games");
    return;
  }
  if (/Football|Virtual|Sporty Picks/.test(name)) {
    routeView("Sports");
    return;
  }
  if (name === "Customer support" || name === "Connect with Us") {
    openDialog(
      "Customer support",
      `<p>This is an unaffiliated replica. For your SportyBet account, contact the official support service.</p><a class="selection-row" href="https://www.sportybet.com/ng/" target="_blank" rel="noopener noreferrer">Official SportyBet ${icon("external-link")}</a>`,
    );
    return;
  }
  if (name === "New games coming soon") {
    toast("No additional practice games are available.");
    return;
  }
  openDialog(
    name,
    `<p>This local replica is not operated by SportyBet. Official ${escapeHTML(name.toLowerCase())} information is available from the original service.</p><a class="selection-row" href="https://www.sportybet.com/ng/" target="_blank" rel="noopener noreferrer">Open official website ${icon("external-link")}</a>`,
  );
}

function setupTabs() {
  document.querySelectorAll("[role=tablist]").forEach((list, index) => {
    const panel = list.closest(".m-feature-tabs")
      ? document.querySelector(".m-feature-match")
      : list
          .closest(".highlights,.live-card,.m-live,.betslip")
          ?.querySelector("[role=tabpanel]");
    list.querySelectorAll("[role=tab]").forEach((tab, i) => {
      tab.id = `tab-${index}-${i}`;
      if (panel) {
        panel.id = panel.id || `panel-${index}`;
        tab.setAttribute("aria-controls", panel.id);
        if (tab.getAttribute("aria-selected") === "true")
          panel.setAttribute("aria-labelledby", tab.id);
      }
    });
  });
}
let originalHighlights = "",
  originalFeature = "",
  carouselTimer;
function mount() {
  document.getElementById("app").innerHTML = mobile ? mobilePage() : desktop();
  if (mobile) {
    const livePanel = document.querySelector(".m-live");
    livePanel.querySelectorAll(":scope > .m-match").forEach((e) => e.remove());
    const target = document.createElement("div");
    target.className = "m-live-results";
    target.setAttribute("role", "tabpanel");
    target.setAttribute("aria-label", "Football matches");
    livePanel.insertBefore(target, livePanel.querySelector(".m-all"));
    const label = livePanel.querySelector(".m-odds-labels");
    label.innerHTML = "<span>1</span><span>X</span><span>2</span>";
    // The only alternate market included in the captured snapshot is Next Goal.
    const marketBar = document.querySelector(".m-market-tabs");
    marketBar.innerHTML = [
      "1X2",
      "Next Goal",
      "O/U",
      "DC",
      "1st Half O/U",
      "Hand",
    ]
      .map(
        (t, i) =>
          `<button role="tab" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" class="${i === 0 ? "active" : ""}" data-market="${t}">${t}</button>`,
      )
      .join("");
    marketBar.setAttribute("role", "tablist");
    marketBar.setAttribute("aria-label", "Market");
    document.querySelectorAll("[data-feature]").forEach((b) => {
      b.dataset.feature = b.textContent.trim();
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", b.classList.contains("active"));
      b.tabIndex = b.classList.contains("active") ? 0 : -1;
    });
    const ft = document.querySelector(".m-feature-tabs");
    ft.setAttribute("role", "tablist");
    ft.setAttribute("aria-label", "Featured content");
    document.querySelector(".m-feature-match").setAttribute("role", "tabpanel");
    originalFeature = document.querySelector(".m-feature-match").innerHTML;
  } else {
    const table = document.querySelector(".match-table");
    table.setAttribute("role", "tabpanel");
    table.setAttribute("aria-label", "Football highlights");
    originalHighlights = table.innerHTML;
    const search = document.createElement("button");
    search.className = "desktop-search";
    search.dataset.search = "";
    search.setAttribute("aria-label", "Search events");
    search.innerHTML = icon("search", 20);
    document.querySelector(".subnav .container").append(search);
    // These are replica entry controls, not credential collection fields.
    document
      .querySelector(".login-form input[type=password]")
      .setAttribute("autocomplete", "off");
  }
  document.querySelectorAll("[data-chip]").forEach((b) => {
    b.dataset.chip = b.textContent.trim();
  });
  const all = document.querySelector("[data-more]");
  if (all && mobile)
    all.innerHTML = `All ${matches.length} captured events ${icon("chevron")}`;
  renderLive();
  renderSlip();
  setupTabs();
  drawIcons();
  startCarousel();
  setSlide(0);
}
function startCarousel() {
  clearInterval(carouselTimer);
  const c = document.querySelector(".hero-carousel");
  if (!c) return;
  if (!motionReduced())
    carouselTimer = setInterval(() => {
      if (
        !document.hidden &&
        !c.matches(":hover") &&
        !c.contains(document.activeElement) &&
        !activeDialog
      )
        setSlide(1 - carouselIndex);
    }, 6000);
  let x;
  c.addEventListener("touchstart", (e) => (x = e.touches[0].clientX), {
    passive: true,
  });
  c.addEventListener(
    "touchend",
    (e) => {
      if (Math.abs(e.changedTouches[0].clientX - x) > 40)
        setSlide(1 - carouselIndex);
    },
    { passive: true },
  );
}
function setSlide(i) {
  carouselIndex = i;
  const track = document.querySelector(".track");
  if (track) track.style.transform = `translateX(-${i * 100}%)`;
  document.querySelectorAll("[data-slide]").forEach((b) => {
    b.setAttribute("aria-current", Number(b.dataset.slide) === i);
    const slide = document.querySelectorAll(".slide")[Number(b.dataset.slide)];
    if (slide) slide.inert = Number(b.dataset.slide) !== i;
  });
}
function resetFilters() {
  liveLeague = "All";
  liveSport = "Football";
  liveMarket = "1X2";
  renderLive();
  closeDialog();
  document.querySelectorAll("[data-market]").forEach((b) => {
    b.classList.toggle("active", b.dataset.market === "1X2");
    b.setAttribute("aria-selected", b.dataset.market === "1X2");
  });
}

document.addEventListener("click", async (event) => {
  const b = event.target.closest("button,a");
  if (!b) return;
  if (b.matches('a[href="#"]')) event.preventDefault();
  if (b.dataset.pick) {
    togglePick(b);
    return;
  }
  if (b.dataset.remove) {
    picks = picks.filter((p) => p.key !== b.dataset.remove);
    renderSlip();
    return;
  }
  if (b.hasAttribute("data-clear")) {
    picks = [];
    renderSlip();
    return;
  }
  if (b.hasAttribute("data-place")) {
    reviewBet();
    return;
  }
  if (b.hasAttribute("data-confirmbet")) {
    confirmBet(b);
    return;
  }
  if (b.hasAttribute("data-savecode")) {
    bookSelections();
    return;
  }
  if (b.dataset.copy) {
    try {
      await navigator.clipboard.writeText(b.dataset.copy);
      b.textContent = "Copied";
    } catch {
      b.textContent = "Select and copy the code above";
    }
    return;
  }
  if (b.hasAttribute("data-detail")) {
    showDetails(Number(b.dataset.detail));
    return;
  }
  if (b.hasAttribute("data-lines")) {
    showLines(Number(b.dataset.lines));
    return;
  }
  if (b.hasAttribute("data-search")) {
    showSearch();
    return;
  }
  if (b.hasAttribute("data-clearsearch")) {
    const input = activeDialog.querySelector("input");
    input.value = "";
    input.dispatchEvent(new Event("input"));
    input.focus();
    return;
  }
  if (b.hasAttribute("data-auth")) {
    profile();
    return;
  }
  if (b.hasAttribute("data-profile") || b.hasAttribute("data-signout")) {
    if (b.hasAttribute("data-signout")) {
      account = null;
      storage.set("sporty-profile", "null");
    }
    profile();
    return;
  }
  if (b.hasAttribute("data-home")) {
    routeView("Sports");
    return;
  }
  if (b.hasAttribute("data-scores")) {
    routeView("Livescore");
    return;
  }
  if (b.dataset.nav) {
    if (b.dataset.nav === "Live Betting") {
      routeView("Sports");
      document
        .querySelector(".live-card")
        ?.scrollIntoView({ behavior: "smooth" });
    } else routeView(b.dataset.nav);
    return;
  }
  if (b.hasAttribute("data-subnav")) {
    const sport = b.textContent.trim();
    if (sport === "Home") {
      routeView("Sports");
      return;
    }
    routeView("Sports");
    liveSport = sport;
    renderLive();
    document.querySelectorAll("[data-subnav]").forEach((t) => {
      t.removeAttribute("aria-current");
    });
    b.setAttribute("aria-current", "page");
    document
      .querySelector(".live-card")
      ?.scrollIntoView({ behavior: "smooth" });
    return;
  }
  if (b.hasAttribute("data-tab")) {
    switchSport(b);
    return;
  }
  if (b.hasAttribute("data-filter")) {
    showFilter();
    return;
  }
  if (b.hasAttribute("data-resetfilters")) {
    resetFilters();
    return;
  }
  if (b.hasAttribute("data-reset-highlights")) {
    document.querySelector('.highlights [data-tab="Football"]')?.click();
    return;
  }
  if (b.dataset.choosesport) {
    closeDialog();
    routeView("Sports");
    liveSport = b.dataset.choosesport;
    renderLive();
    document
      .querySelector(mobile ? ".m-live" : ".live-card")
      ?.scrollIntoView({ behavior: "smooth" });
    return;
  }
  if (b.hasAttribute("data-league")) {
    filterLeague(b.textContent);
    return;
  }
  if (b.hasAttribute("data-chip")) {
    b.parentElement
      .querySelectorAll("[data-chip]")
      .forEach((t) => t.setAttribute("aria-pressed", t === b));
    if (b.closest(".highlights")) {
      const text = b.textContent;
      if (/Uruguay/i.test(text))
        document.querySelector(".match-table").innerHTML = originalHighlights;
      else if (/Europa|Conference/.test(text)) {
        document.querySelector(".match-table").innerHTML = emptyState(
          "Live competition",
          "View captured live matches for this league.",
          "Show matches",
          'data-showleague="' +
            (/Conference/.test(text) ? "conference" : "europa") +
            '"',
        );
      } else
        document.querySelector(".match-table").innerHTML = emptyState(
          "No captured fixtures",
          "Choose Uruguay or view the live competitions.",
          "Show Uruguay",
          "data-reset-highlights",
        );
      drawIcons();
      markPicks();
    } else {
      filterLeague(b.textContent);
      if (/Europa/.test(b.textContent)) featureContent("Matches");
      const featured = document.querySelector(".m-feature-match");
      if (featured && /Conference|Premier/.test(b.textContent)) {
        featured.innerHTML = emptyState(
          "No featured match",
          "Browse the filtered live list below.",
          "All matches",
          "data-reset-feature",
        );
      }
    }
    return;
  }
  if (b.dataset.showleague) {
    filterLeague(b.dataset.showleague);
    return;
  }
  if (b.hasAttribute("data-reset-feature")) {
    featureContent("Matches");
    resetFilters();
    return;
  }
  if (b.hasAttribute("data-feature")) {
    featureContent(b.dataset.feature);
    return;
  }
  if (b.hasAttribute("data-market")) {
    liveMarket = b.dataset.market;
    b.parentElement.querySelectorAll("[data-market]").forEach((t) => {
      t.classList.toggle("active", t === b);
      t.setAttribute("aria-selected", t === b);
      t.tabIndex = t === b ? 0 : -1;
    });
    renderLive();
    return;
  }
  if (b.hasAttribute("data-refresh")) {
    b.disabled = true;
    b.classList.add("refreshing");
    renderLive();
    setTimeout(() => {
      b.disabled = false;
      b.classList.remove("refreshing");
      toast("Snapshot reloaded. Live feeds are not connected.");
    }, 300);
    return;
  }
  if (b.hasAttribute("data-print")) {
    print();
    return;
  }
  if (b.hasAttribute("data-slide")) {
    setSlide(Number(b.dataset.slide));
    return;
  }
  if (b.hasAttribute("data-more")) {
    expanded = !expanded;
    renderLive();
    b.innerHTML = expanded
      ? "Show fewer events"
      : `All ${matches.length} captured events`;
    return;
  }
  if (b.hasAttribute("data-openslip")) {
    openSheet(b);
    return;
  }
  if (b.classList.contains("sheet-close")) {
    closeSheet();
    return;
  }
  if (b.hasAttribute("data-buildslip")) {
    closeDialog();
    openSheet();
    return;
  }
  if (b.hasAttribute("data-sliptab")) {
    slipTab = b.dataset.sliptab;
    b.parentElement.querySelectorAll("[role=tab]").forEach((t) => {
      t.setAttribute("aria-selected", t === b);
      t.tabIndex = t === b ? 0 : -1;
    });
    renderSlip();
    return;
  }
  if (b.hasAttribute("data-mode")) {
    mode = b.dataset.mode;
    b.parentElement
      .querySelectorAll("button")
      .forEach((t) => t.setAttribute("aria-pressed", t === b));
    renderSlip();
    return;
  }
  if (b.hasAttribute("data-openbets")) {
    showTickets();
    return;
  }
  if (b.dataset.cancelTicket) {
    tickets = tickets.map((t) =>
      t.id === b.dataset.cancelTicket ? { ...t, status: "Cancelled" } : t,
    );
    storage.set("sporty-tickets", JSON.stringify(tickets));
    showTickets();
    return;
  }
  if (b.hasAttribute("data-managecodes")) {
    showCodes();
    return;
  }
  if (b.dataset.restorecode) {
    const data = savedCodes[b.dataset.restorecode];
    if (Array.isArray(data) && data.every(validatePick)) {
      picks = structuredClone(data);
      slipTab = "Betslip";
      renderSlip();
      closeDialog();
      openSheet();
    }
    return;
  }
  if (b.hasAttribute("data-clearlocal")) {
    openDialog(
      "Reset local data",
      `<p>Remove selections, saved booking codes and demo tickets on this browser? Your local profile will be kept.</p><button class="btn-green" data-confirmreset>Reset local data</button><button class="inline-action" data-close>Keep my data</button>`,
    );
    return;
  }
  if (b.hasAttribute("data-confirmreset")) {
    picks = [];
    stake = "";
    tickets = [];
    savedCodes = {};
    storage.set("sporty-tickets", "[]");
    storage.set("sporty-codes", "{}");
    renderSlip();
    closeDialog();
    toast("Local data reset.");
    return;
  }
  if (b.dataset.game) {
    showPractice(b.dataset.game);
    return;
  }
  if (b.dataset.color) {
    b.closest("dialog").dataset.color = b.dataset.color;
    b.parentElement
      .querySelectorAll("button")
      .forEach((t) => t.setAttribute("aria-pressed", t === b));
    return;
  }
  if (b.dataset.play) {
    playPractice(b);
    return;
  }
  if (b.hasAttribute("data-tool")) {
    const t = b.dataset.tool;
    if (t === "All Sports" || t === "More") showSports();
    else if (t === "Load Code") showCodes();
    else if (t === "Live") {
      routeView("Sports");
      document.querySelector(".m-live")?.scrollIntoView({ behavior: "smooth" });
    } else routeView(t);
    return;
  }
  if (b.dataset.bottom) {
    const t = b.dataset.bottom;
    if (t === "Home") routeView("Sports");
    else if (t === "A-Z Menu") showSports();
    else if (t === "Open Bets") showTickets();
    else if (t === "Me") profile();
    else routeView("Games");
    return;
  }
  if (b.hasAttribute("data-info")) infoAction(b.dataset.info);
});
document.addEventListener("submit", (e) => {
  const form = e.target;
  e.preventDefault();
  if (form.matches("[data-booking-form]")) {
    loadBooking(form);
    return;
  }
  if (form.matches("[data-filter-form]")) {
    liveLeague = form.querySelector("select").value;
    liveSport = "Football";
    renderLive();
    closeDialog();
    return;
  }
  if (form.matches("[data-profile-form]")) {
    const name = form.querySelector("input").value.trim();
    if (!name) {
      form.querySelector("input").setCustomValidity("Enter a display name.");
      form.querySelector("input").reportValidity();
      return;
    }
    account = { name };
    storage.set("sporty-profile", JSON.stringify(account));
    profile();
    return;
  }
  if (form.matches(".login-form,.reg-panel")) {
    form
      .querySelectorAll("input:not([type=checkbox])")
      .forEach((i) => (i.value = ""));
    profile();
  }
});
document.addEventListener("change", (e) => {
  if (e.target.matches("[data-motion]")) {
    document.documentElement.dataset.motion = e.target.checked ? "reduce" : "";
    storage.set("sporty-motion", e.target.checked ? "reduce" : "");
    if (e.target.checked) clearInterval(carouselTimer);
    else startCarousel();
  }
});
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("sheet-backdrop")) closeSheet();
});
document.addEventListener("keydown", (e) => {
  if (
    e.target.closest("[role=tablist]") &&
    ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
  ) {
    const tabs = [
        ...e.target.closest("[role=tablist]").querySelectorAll("[role=tab]"),
      ],
      i = tabs.indexOf(e.target);
    if (i < 0) return;
    const n =
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? tabs.length - 1
          : (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    e.preventDefault();
    tabs[n].focus();
    tabs[n].click();
  }
  if (activeDialog?.open) return;
  const sheet = document.querySelector(".sheet-backdrop");
  if (!sheet || sheet.hidden) return;
  if (e.key === "Escape") {
    e.preventDefault();
    closeSheet();
    return;
  }
  if (e.key === "Tab") {
    const items = [...sheet.querySelectorAll("button,input,a,select")].filter(
        (el) => !el.disabled && el.getBoundingClientRect().height > 0,
      ),
      first = items[0],
      last = items.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  }
});
mobileQuery.addEventListener("change", () => {
  closeDialog();
  document.body.classList.remove("sheet-open");
  mobile = mobileQuery.matches;
  route = "Sports";
  mount();
});
document.documentElement.dataset.motion = storage.get("sporty-motion") || "";
mount();
if (recovered)
  toast("Invalid saved selections were reset. You can start a new betslip.");
if (storage.unavailable)
  toast(
    "Browser storage is unavailable. Selections will last for this visit only.",
  );
