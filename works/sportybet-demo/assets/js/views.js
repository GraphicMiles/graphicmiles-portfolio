const ASSET_ROOT = document.currentScript.src ? new URL("../img/", document.currentScript.src).href : new URL("assets/img/", document.baseURI).href;
const asset = (name) => globalThis.DEMO_EMBEDDED_ASSETS?.[name] || new URL(name, ASSET_ROOT).href;
const icons = {
  chevron: "chevron-right",
  down: "chevron-down",
  search: "search",
  close: "x",
  refresh: "refresh-cw",
  print: "printer",
  filter: "sliders-horizontal",
  chart: "chart-no-axes-combined",
  ball: "volleyball",
  tv: "tv",
  code: "network",
  game: "gamepad-2",
  menu: "menu",
  user: "user",
  slip: "receipt-text",
  clock: "history",
  settings: "settings",
  chat: "message-circle",
};
function icon(n, s = 16) {
  return `<i class="icon" data-lucide="${icons[n] || n}" style="width:${s}px;height:${s}px" aria-hidden="true"></i>`;
}
const matches = [
  ["AC Milan", "Ferencvarosi Budapest", 0, 0, [2.1, 2.75, 4.65]],
  ["Sparta Prague", "Bournemouth", 1, 0, [3.15, 3.05, 2.45]],
  ["Crystal Palace", "Hoffenheim", 0, 1, [4.25, 3.4, 1.9]],
  ["Real Sociedad", "Lyon", 1, 0, [1.32, 4.8, 11.0]],
  ["Lillestroem SK", "Viktoria Plzen", 0, 1, [13, 4.85, 1.3]],
  ["NEC Nijmegen", "AC Omonia Nicosia", 1, 0, [3.8, 3.35, 2.05]],
  ["PFC Levski Sofia", "Jagiellonia Bialystok", 0, 0, [2.6, 2.5, 3.85]],
  ["RSC Anderlecht", "Salzburg", 1, 0, [1.27, 5.3, 13.5]],
  ["Atalanta", "FC Kairat Almaty", 0, 0, [1.42, 3.95, 11]],
  ["FC Midtjylland", "Ajax", 1, 1, [3.85, 3.25, 2.05]],
];
const logo = () => `<img src="${asset(`logo.2723b05b63.png`)}" alt="SportyBet">`;
const head = (t) =>
  `<div class="panel-head"><span class="dot ${t === "Live Betting" ? "live" : ""}"></span><h2>${t}</h2><div class="actions"><button data-print>${icon("print")}Print</button><button data-refresh>${icon("refresh")}Refresh</button></div></div>`;
function footer() {
  return `<footer class="footer"><div class="container"><div class="footer-top"><div class="footer-brand"><div class="brand">${logo()}<span>Nigeria</span></div><div class="partner"><p>Official Sports<br>Betting Partner</p><span class="rule"></span><img src="${asset(`Image_partnership_2logo_desktop_f15468abc8.png`)}" alt="LALIGA"><img src="${asset(`lagos.d37caa18cb.png`)}" alt="Lagos"></div><p class="tag">The world's most visited betting platform</p></div>${[
    [
      "SportyBet Nigeria",
      "About Us",
      "Terms & Conditions",
      "Responsible Gaming",
      "Privacy Policy",
      "Sporty Group",
      "System Status",
    ],
    [
      "How To Play",
      "FAQ",
      "Sports",
      "Bet Builder",
      "Live Betting",
      "Games",
      "Live Games",
      "Scheduled Virtuals",
      "Jackpot",
      "Lucky Numbers",
      "Others",
    ],
  ]
    .map(
      (g) =>
        `<div class="footer-col"><h3>${g[0]}</h3>${g
          .slice(1)
          .map(
            (x) =>
              `<a href="#" data-info="${x}">${icon("chevron", 12)}${x}</a>`,
          )
          .join("")}</div>`,
    )
    .join(
      "",
    )}<div class="footer-connect"><h3>Connect with Us</h3><p>Telephone: 07008888888 | 09088999988<br>Email: nigeria.support@sportybet.com</p><div class="socials">${["facebook", "instagram", "send", "youtube"].map((n) => `<button data-info="${n}" aria-label="${n}">${icon(n, 20)}</button>`).join("")}</div><p>SportyBet ZA | SportyBet BR</p></div></div><div class="footer-mid"><img class="age" src="${asset(`forum@2x.b116a24aba.svg`)}" alt="18+"><p>Age 18 and above only to register or play at SportyBet. Play Responsibly.<br>Betting is addictive and can be psychologically harmful.</p><img class="license" src="${asset(`license@2x.e4e544418c.svg`)}" alt="Licence"><p>SportyBet Nigeria is licensed by National Lottery Regulatory Commission (NLRC) under License No 0001014.</p></div></div><div class="footer-bottom"><div class="container">${[
    "opay",
    "palmpay",
    "quickteller",
    "verve",
    "visa",
    "mastercard",
    "uba",
    "access",
    "firstbank",
    "zenith",
    "fidelity",
    "gtbank",
  ]
    .map((n) => {
      let f = assets.find((x) => x.startsWith("footer_" + n + "_"));
      return `<img src="${asset(f)}" alt="${n}">`;
    })
    .join(
      "",
    )}<span class="copy">© 2026 SportyBet. All rights reserved.</span></div></div></footer>`;
}
let homeHighlightSport = 'Football', homeHighlightLeague = 0;
function homeLeagueChips(){
  return (SportyHome.highlightSports[homeHighlightSport]||[]).map((g,i)=>`<button data-home-league="${i}" aria-pressed="${i===homeHighlightLeague}"><span class="chip-line">${escapeHTML(g.label)}</span><span class="chip-line chip-title">${escapeHTML(g.league)}</span></button>`).join('');
}
function currentHomeHighlights(){
  const group=SportyHome.highlightSports[homeHighlightSport]?.[homeHighlightLeague];let day='';
  return (group?.rows||[]).map(r=>{
    const nextDay=r.day!==day;day=r.day;
    const labels=r.odds[1]===0?['1','2']:['1','X','2'];
    const heading=nextDay?`<div class="match-date">${escapeHTML(day)}<span class="cols structured-labels ${r.odds[1]===0?'two-way-labels':''} ${!r.totals?.length?'home-single-labels':''}">${[...labels,...(r.totals?.length===2?[homeHighlightSport.includes('Basketball')?'Points':homeHighlightSport==='Tennis'?'Games':'Goals','Over','Under']:[])].map(l=>`<span>${l}</span>`).join('')}</span></div>`:'';
    return heading+`<div class="match-row"><div class="match-when"><div class="time">${r.time}</div><div class="id">ID: ${r.gameId}</div></div><div class="match-teams"><a href="#/event/${r.id}">${escapeHTML(r.home)}<br>${escapeHTML(r.away)}</a></div><button class="home-match-stat" data-detail="${r.id}" aria-label="${escapeHTML(r.home)} match details">${icon('chart',14)}</button><div class="odds-cols ${r.odds[1]===0?'two-way-odds':''} ${!r.totals?.length?'home-single-market':''}">${demoMarketDefinitions(r.id)[0].outcomes.map(([o,v])=>marketOdd(r.id,'1x2',o,v)).join('')}${r.totals?.length===2?`<button class="odd-select" data-lines="${r.id}" aria-label="Select total goals line">${r.line}${icon('down',12)}</button>${marketOdd(r.id,'totals:'+r.line,'over',r.totals[0])}${marketOdd(r.id,'totals:'+r.line,'under',r.totals[1])}`:''}<button class="more-markets" data-detail="${r.id}">${r.size||''}${icon('chevron',12)}</button></div></div>`;
  }).join('');
}
function homeOutcome(id,outcome,value){
  const label={home:'1',draw:'X',away:'2'}[outcome];
  return marketOdd(id,'1x2',outcome,value).replace(`>${Number(value).toFixed(2)}</button>`,`><span class="home-outcome-label">${label}</span><b>${Number(value).toFixed(2)}</b></button>`);
}
function homeBottomIcon(index){
  return SportyHome.bottomIcons[index].replace(/src="([^"]+)"/,(_,name)=>`src="${asset(name)}"`);
}
function homeCategoryChips(){
  return SportyHome.categories.map((c,i)=>`<button data-home-category="${i}" aria-pressed="${i===0}" aria-label="${escapeHTML(c.title)}"><img src="${asset(c.image)}" alt=""><span>${escapeHTML(c.title)}</span></button>`).join('');
}
function currentHomeFeatured(rows=SportyHome.featured){
  return `<div class="m-feature-track" aria-label="Featured matches" tabindex="0">${rows.map((r,index)=>`<article class="m-feature-card" data-feature-fixture="${r.id}"><div class="home-feature-top">${r.sport==='Football'?`<div class="home-match-badges"><span>HOT <img src="${asset('hot.2d9c9be910.png')}" alt=""></span><span>BEST ODDS <img src="${asset('bestodds.6d66046b0e.png')}" alt=""></span></div>`:''}<a class="m-tourney" href="#/event/${r.id}">${escapeHTML(r.displayLeague||r.sport+' - '+r.league)}</a><button data-detail="${r.id}" aria-label="Match details">${icon('chart',14)}</button></div><div class="m-versus"><div class="home-feature-team">${r.homeIcon?`<img src="${asset(r.homeIcon)}" alt="" loading="${index<2?'eager':'lazy'}">`:''}<span>${escapeHTML(r.home)}</span></div><div class="home-feature-center"><div class="home-feature-time"><b>${r.time}</b><span>${r.day||'Today'}</span></div><strong>${escapeHTML(r.marketLabel|| (r.sport==='Tennis'?'Winner':'1X2'))}</strong></div><div class="home-feature-team">${r.awayIcon?`<img src="${asset(r.awayIcon)}" alt="" loading="${index<2?'eager':'lazy'}">`:''}<span>${escapeHTML(r.away)}</span></div></div><div class="m-feature-odds">${demoMarketDefinitions(r.id)[0].outcomes.map(([o,v])=>homeOutcome(r.id,o,v)).join('')}</div></article>`).join('')}</div>`;
}

function desktop() {
  homeHighlightSport='Football';homeHighlightLeague=0;
  return `<header><div class="topbar"><div class="container topbar-row"><a href="#/home" class="brand">${logo()}<span class="brand-country"><img src="${asset(`flagNigeria.12aeae58bb.png`)}" alt="Nigeria">Nigeria</span></a><button class="geo-btn" aria-label="Settings" data-info="Settings">${icon("settings", 22)}${icon("down", 12)}</button><form class="login-form"><div class="login-fields"><span class="field-prefix">+234</span><input aria-label="Mobile Number" placeholder="Mobile Number" inputmode="tel"><input aria-label="Password" placeholder="Password" type="password"><button class="btn-login">Login</button><button type="button" class="btn-register" data-auth>Register</button></div><div class="login-meta"><label class="check"><input type="checkbox" checked><span class="box">${icon("check", 12)}</span>Keep me signed in</label><a href="#" data-info="Forgot Password?">Forgot Password?</a><a href="#" data-info="Deactivate / Reactivate">Deactivate / Reactivate</a></div></form></div></div><nav class="primary-nav"><div class="container">${["Sports", "Games", "Live Betting", "Instant Football", "Scheduled Virtuals", "Jackpot", "Livescore", "Results", "Promotions", "Sporty Loyalty", "App"].map((x, i) => `<button class="nav-item" ${!i ? 'aria-current="page"' : ""} data-nav="${x}">${x}${x==='App'?'<span class="home-app-hot">HOT</span>':''}</button>`).join("")}<span class="nav-clock">GMT+00:00</span></div></nav><nav class="subnav"><div class="container">${["Home", "Football", "vFootball", "Basketball", "Tennis", "eFootball", "Table Tennis", "eBasketball", "Ice Hockey", "eIce Hockey", "More Sports"].map((x, i) => `<a href="#" ${!i ? 'aria-current="page"' : ""} data-subnav>${x}${x==='More Sports'?icon('down',14):''}</a>`).join("")}</div></nav></header><section class="hero"><div class="container"><div class="popular"><h2>Popular</h2><ul>${["Today's Football", "Football in Next 3 Hours", "England Premier League", "Spain La Liga", "Italy Serie A", "Germany Bundesliga", "France Ligue 1", "NBA", "EuroLeague", "NFL", "NHL"].map((x) => `<li><a href="#" data-league>${x}${icon("chevron", 20)}</a></li>`).join("")}</ul></div><div class="hero-carousel"><div class="track"><a class="slide" href="#" data-path="event/100"><img src="${asset(`home-current-hero.webp`)}" alt="Everton vs Coventry City. Premier League"></a><a class="slide" href="#" data-path="event/203"><img src="${asset(`home-current-second.webp`)}" alt="Sevilla vs Alaves. LaLiga"></a></div><div class="dots"><button aria-label="Banner 1" aria-current="true" data-slide="0"></button><button aria-label="Banner 2" data-slide="1"></button></div></div><form class="reg-panel"><h2>Instant Registration</h2><p class="reg-note">Make a Deposit and Start<br>Betting!</p><label class="reg-field"><span class="field-prefix">+234</span><input aria-label="Registration Mobile Number" placeholder="Mobile Number" inputmode="tel"></label><button class="btn-green">Register</button></form></div></section><main class="content container"><a href="#" class="promo-banner" data-info="Virtual World"><img src="${asset(`473ebe4bc9ec82b681c36d6597f258e0.jpg`)}" alt="SportyBet Virtual World. Bet on every second"></a><div class="columns"><div class="col-main"><section class="card-light highlights">${head("Highlights")}${tabs()}<div class="league-chips">${homeLeagueChips()}</div><div class="match-table">${currentHomeHighlights()}</div></section>${live()}<a href="#" data-info="Sporty 12 Jackpot"><img class="jackpot-img" src="${asset(`f012954cf4bb2e7da6bb87440282af91.webp`)}" alt="Sporty 12 Jackpot. NGN 38,358,530 up for grabs"></a></div><aside class="col-side">${slip()}<section class="mini-games"><h2>Mini Games</h2><div class="game-pictures">${[
    ["bottle", "Spin da’ Bottle"],
    ["hero", "Sporty Hero"],
    ["redblack", "Red Black"],
    ["soon", "New games coming soon"],
  ]
    .map(
      ([n, t]) =>
        `<button data-info="${t}" aria-label="${t}"><img src="${asset(`minigame-${n}.png`)}" alt="${t}"></button>`,
    )
    .join(
      "",
    )}</div><button class="mini-more" data-info="Mini Games">Discover more games</button></section><a href="#" data-info="Instant Football"><img src="${asset(`59bd76f2fe42b8cd5daf90e91b822ef3.jpg`)}" alt="Instant Football"></a><section class="winners"><h2>Grand Prize Winners</h2><ul>${["133,313.64", "63,661.10", "328,233.65", "85,159.61", "30,824.09", "39,616.04"].map((n) => `<li><div class="row1"><span class="amount">NGN${n}</span><span class="when">1 min ago</span></div><div class="row2"><span>Sports Betting</span><span>********5</span></div></li>`).join("")}</ul></section></aside></div></main>${footer()}<button class="chat-fab" aria-label="Customer support" data-info="Customer support">${icon("chat", 24)}</button>`;
}
function mobilePage() {
  return `<header class="m-header">${logo()}<button aria-label="Search" data-search>${icon("search", 22)}</button><button class="join" data-auth>Join Now</button><button class="login" data-auth>Log in</button></header><main class="m-main"><div class="m-promos">${SportyHome.promos.map(([f,t,path])=>`<button data-path="${path}" aria-label="${t}"><img src="${asset(f)}" alt=""><span>${t}</span></button>`).join('')}</div><nav class="m-tools" aria-label="Quick navigation">${SportyHome.tools.map(t=>`<button data-tool="${t.title}"><img src="${asset(t.image)}" alt=""><span>${t.title}</span></button>`).join('')}</nav><div class="m-categories">${[['aed95418bdaf759c6e669440e280a1c.png',"Today's Football"],['d2c1b7f09aa4f0ae5098ee990e6740ae.png','Football in Next 3 Hours'],['2ee7dda8cc83fb0d8aefca468f9d734e.png','England Premier League']].map(([f,t])=>`<button data-league aria-label="${t}"><img src="${asset(f)}" alt="${t}"></button>`).join('')}</div><div class="m-feature-tabs"><strong>Featured</strong><div class="m-feature-tabscroll"><button class="active" data-feature="Matches">Matches</button><button data-feature="Games">Games</button><button data-feature="Codes">Codes</button><button data-feature="Virtuals">Virtuals</button><button data-feature="LuckyNumbers">LuckyNumbers</button></div><button class="home-codehub" data-tool="Load Code" aria-label="Load booking code">${icon('file-search',21)}</button></div><div class="m-leagues" aria-label="Featured competitions">${homeCategoryChips()}</div><div class="m-feature-match">${currentHomeFeatured()}</div><section class="m-live"><div class="m-live-title"><h2>Live</h2>${tabs(true)}</div><div class="m-market-tabs">${["1X2", "O/U", "DC", "1st Half O/U", "Hand"].map((t, i) => `<button ${!i ? 'class="active"' : ""} data-market>${t}</button>`).join("")}</div><div class="m-odds-labels">1　　　　　　　 X　　　　　2</div>${matches
    .slice(0, 6)
    .map(
      (m, i) =>
        `<article class="m-match"><div class="m-match-meta"><strong>45:00　HT</strong><span>International Clubs · UEFA Europa League</span>${icon("chart")}</div>${row(m, i)}</article>`,
    )
    .join(
      "",
    )}<button class="m-all" data-more>All captured live events ${icon("chevron")}</button></section></main><nav class="m-bottom">${[
    ["ball", "Home"],
    ["menu", "A-Z Menu"],
    ["game", "Games"],
    ["clock", "Open Bets"],
    ["user", "Me"],
  ]
    .map(
      ([i, t]) =>
        `<button data-bottom="${t}" aria-label="${t}">${homeBottomIcon(['Home','A-Z Menu','Games','Open Bets','Me'].indexOf(t))}<span>${t==='A-Z Menu'?'AZ Menu':t}</span></button>`,
    )
    .join(
      "",
    )}</nav><button class="m-slip-fab" aria-label="Open betslip" data-openslip>${icon("slip", 28)}<span id="pick-count">0</span></button><div class="sheet-backdrop" hidden><div class="m-sheet" role="dialog" aria-modal="true" aria-label="Betslip"><button class="sheet-close" aria-label="Close betslip">${icon("close", 24)}</button>${slip()}</div></div>`;
}
const assets = [
  "d3d77957815db3662fcb5da8921e690b.png",
  "icon_telegram_logo.987e5936ae.svg",
  "fb374b3ea8478f90fa242311ae27f2eb.png",
  "footer_opay_logo_a954fa8a51.png",
  "6e288236e170579fa1e2bac1400aa7bf.png",
  "pac-card-bg.d26cb50d17.svg",
  "icon_check.1b59a733d4.svg",
  "semicircle.0942db6293.svg",
  "59bd76f2fe42b8cd5daf90e91b822ef3.jpg",
  "cash-card-bg.1c8414fa56.svg",
  "football-field_360x150.09ca071876.jpg",
  "footer_gtbank_logo_6b74706f30.png",
  "79f718d0679214a0f65bd7aeb6699b3a.webp",
  "f012954cf4bb2e7da6bb87440282af91.webp",
  "icon-roulette.3f8157103a.png",
  "24b794528caceddf0418741815fefaae.webp",
  "79111db9b222681556b23702a70ef825.png",
  "open-bet.4b0ce3ba4a.png",
  "hot.2d9c9be910.png",
  "cb02231cca7e2f7e6d56d60fa9de8762.png",
  "9d4eaa939537b05d3fb32708ce391fc6.png",
  "a01d98f87c256a84477e6dfa6eb8fa84.webp",
  "footer_quickteller_logo_67ba461e70.png",
  "dis-card-bg.153874f810.svg",
  "a4f70412a49c863de2c07a072a234796.webp",
  "mx.03edb56690.svg",
  "footer_palmpay_logo_dbb2dc54fc.png",
  "footer_mastercard_logo_094fa25aea.png",
  "9daf2d802a176bf5beaca990abb9c3b4.webp",
  "f687c701203721f9a26e8dbf8b879bb2.png",
  "5843d11bd9118b43c0731d379c197d07.webp",
  "45d2f3d6b108a0acf7a394b788a1873d.png",
  "7555c59481512478174ec1d35067e1d4.png",
  "3f29a54789748d6b167134ce3e34f57d.png",
  "ce11ea85ac65ae129758f20a0b4d8d63.png",
  "616cc93166ce6f2c1316a2c31ec32cb1.png",
  "footer_fidelity_logo_b6239d349d.png",
  "a917911891cdc5f574a842d7847b1c3a.webp",
  "flashWinImg.bdcb03e6aa.png",
  "background.fefbd012c9.png",
  "aed95418bdaf759c6e669440e280a1c.png",
  "e79f533fcfa4307156e1a81f844b7dd6.png",
  "d2c1b7f09aa4f0ae5098ee990e6740ae.png",
  "hot_badge_c157795775.png",
  "Image_partnership_2logo_desktop_f15468abc8.png",
  "worldCup.c31eab3504.png",
  "f268b4a9f6e7adb4921ea24d392edfa5.png",
  "5d118dca0ce307abbd678ef4365b7fe7.png",
  "2ee7dda8cc83fb0d8aefca468f9d734e.png",
  "left.0bac49396d.jpg",
  "forum@2x.b116a24aba.svg",
  "4b016f6e289ffc33bf25c4de0261e02f.webp",
  "goalkeeper.jpg",
  "4b182df3cac0aa336aa89b91a64a642d.png",
  "144x144.png",
  "winBg.7021172f98.png",
  "dob-verify-bg.544021490c.png",
  "right.7a114c1a9b.jpg",
  "lucky-bg.4c2708501e.svg",
  "icon_youtube.260f9bc049.png",
  "popupBg2-big.18bdb88cc6.png",
  "f49fef104470724cb6e4f1ea674c3c13.png",
  "ef04ea5faf985a7f9163aacd509e0148.png",
  "3175f1a20ec5adb7a2ffe7aeff7a1ec8.png",
  "popupBall2.fc00d8d576.png",
  "e67c812d32ef2f665d7e83e67c7ddf5b.webp",
  "bg_desktop_dialog.72b871151f.jpg",
  "icon-games.6a218923c5.svg",
  "679fad28e6fdebf9303e21a74817df5a.png",
  "cefcc0cc47f0de8465fc1bb3b0e0f1fd.png",
  "boost-light.6144486700.png",
  "footer_zenith_logo_5bfa08a0c5.png",
  "footer_uba_logo_58a31a9c3b.png",
  "more-dot.3c0aa6303b.svg",
  "15c023581130431bee1e0d7cee077a72.webp",
  "354b166d79ff5888e294065048d8a331.png",
  "3d2f6a89f2eaec4919c93343f3c7b770.png",
  "fb38667f1d986ec977ea756ecaf01bfd.png",
  "cash-top-bg.31552e0dfd.svg",
  "footer_access_logo_93dc405323.png",
  "d0839820d9f53131fa12f9583c909440.png",
  "473ebe4bc9ec82b681c36d6597f258e0.jpg",
  "logo.2723b05b63.png",
  "footer_firstbank_logo_d49c06c2ef.png",
  "lagos.d37caa18cb.png",
  "e11368d7b4583e713fdfa5c014cd3ccd.webp",
  "popSuc.3630e5f7cb.jpg",
  "77362c68280b20151571b56e670980bb.png",
  "6dd5d9f61e6c9988c109074e37c5972c.png",
  "dob-gift-popup-bg.58c07d7db1.png",
  "dob-verified-bg.6c2ef4fa41.png",
  "43cbd2c166ca216489e926b86d080481.png",
  "c080f2554374fe85415baf77f7d518f2.png",
  "5841880836a4009d87257d573f04f784.png",
  "flagNigeria.12aeae58bb.png",
  "top-bg.8b6bc14c77.svg",
  "Live_6911167f54.png",
  "74de67175927226ac3aca1e1ae68a806.png",
  "5c2def0f678e58706de2cfa5ea1c2c3.png",
  "boost-dark.680ddaf1aa.png",
  "b711e5dfcf69d69226ba2371f2d165f7.webp",
  "footer_verve_logo_c68b5a53c0.png",
  "cda660514c1071b6cac25e610c754845.png",
  "c6ca3632c820fd5dd917f17f7cc5ab62.png",
  "icon-bingo.dc39c6bf63.png",
  "ae6322fc2a9625f66191ea200e1c11ec.jpg",
  "shortLogo.b916e6f109.png",
  "dis-top-bg.3c8e9c52bf.svg",
  "7d2274f4de09878c1bb1fa42b154d659.png",
  "popupBgInt.0fd86d7416.png",
  "f8742b2d9f0b12b2e579577ad0e3d6c8.png",
  "23a7f8dfa3ed98a943188973bd5f80b3.webp",
  "a812f25aeb58f890c09308475799bde0.webp",
  "2affb09cf9a813e5801f12ade72bcb7d.png",
  "freebet-card-bg.8e848f1127.svg",
  "b638c0f668a29248d4709fa3618d4615.webp",
  "bg.832d4f9fa3.jpg",
  "welcome_bonus_claim.dda8aa6acc.png",
  "3e03544469705b9601e974c10e5fd961.webp",
  "footer_visa_logo_9dabd03576.png",
  "Load_Code_8ad27d3808.png",
  "license@2x.e4e544418c.svg",
  "winningImg.0ddcac60fd.png",
  "mission-of-the-week-banner.3262667c5a.png",
  "ac71b0a1a6b0a8fd8c6f6169d1f06fb9.png",
  "1c2690061368128d0f1b68302c151e69.png",
  "sfm.9a7043a916.png",
];
