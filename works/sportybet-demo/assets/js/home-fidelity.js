"use strict";
// Reference-home behaviour. All actions stay on the independent local demo.
(function () {
  const previousMarketTitle = marketTitle;
  marketTitle = function(p) {
    if (demoFixtures[p.id]?.homeSnapshot) return demoMarketDefinitions(p.id).find(m=>m.id===p.market)?.title || previousMarketTitle(p);
    return previousMarketTitle(p);
  };
  const previousPickLabel = globalThis.demoPickLabel;
  globalThis.demoPickLabel = function(p) {
    if (demoFixtures[p.id]?.homeSnapshot) {
      const sport=demoFixtures[p.id].sport;
      if(p.market.startsWith('totals:')) return `${p.outcome==='over'?'Over':'Under'} ${p.market.split(':')[1]} ${sport.includes('Basketball')?'points':sport==='Tennis'?'games':'goals'}`;
      if(p.market.startsWith('handicap:')) return `${p.outcome==='draw'?'Draw':fixture(p.id)[p.outcome==='home'?0:1]} (${demoMarketDefinitions(p.id).find(m=>m.id===p.market)?.title})`;
    }
    return previousPickLabel(p);
  };
  const previousLiveContent = liveContent;
  liveContent = function (limit = 10) {
    if (liveSport !== 'Football') return previousLiveContent(limit);
    const rows = SportyHome.live.filter(r => liveLeague === 'All' || r.league === liveLeague);
    const content = rows.slice(0, limit).map(r => {
      const definitions = demoMarketDefinitions(r.id);
      const market = liveMarket === '1X2' ? definitions[0] : definitions.find(m => m.tab === liveMarket || liveMarket === 'Hand' && m.tab === 'Handicap');
      const prices = market ? `${market.id.startsWith('totals:') || market.id.startsWith('handicap:') ? `<button class="home-live-line" data-home-live-lines="${r.id}" aria-label="Available market lines">${market.id.startsWith('totals:') ? market.id.split(':')[1] : market.title.replace('Handicap ', '')}${icon('down', 10)}</button>` : ''}${market.outcomes.map(([o,v]) => marketOdd(r.id, market.id, o, v)).join('')}` : `<a class="home-live-market-link" href="#/event/${r.id}">View markets ${icon('chevron',12)}</a>`;
      return `<article class="m-match home-live-match"><div class="home-live-meta"><strong>${r.time} &nbsp;${r.period}</strong><span>${escapeHTML(r.league)}</span><button data-detail="${r.id}" aria-label="${escapeHTML(r.home)} match details">${icon('chart',14)}</button></div><div class="home-live-main"><button class="home-live-teams" data-detail="${r.id}"><span>${escapeHTML(r.home)}</span><span>${escapeHTML(r.away)}</span></button><div class="home-live-score"><span>${r.scores[0]}</span><span>${r.scores[1]}</span></div><div class="home-live-odds">${prices}</div></div><button class="home-live-more" data-detail="${r.id}">${escapeHTML(r.size || '')}</button></article>`;
    }).join('');
    const labels = document.querySelector('.m-odds-labels');
    if (labels) {
      const names = liveMarket === 'O/U' || liveMarket === '1st Half O/U' ? ['Goals', 'Over', 'Under'] : liveMarket === 'DC' ? ['1X', '12', 'X2'] : liveMarket === 'Next Goal' ? ['1', 'No goal', '2'] : ['1', 'X', '2'];
      labels.innerHTML = names.map(n => `<span>${n}</span>`).join('');
    }
    return mobile ? content : `<div class="home-live-desktop">${content}</div>`;
  };

  const previousSwitchSport = switchSport;
  switchSport = function(button) {
    if (!button.closest('.highlights')) return previousSwitchSport(button);
    const sport = button.dataset.tab;
    if (sport === 'More Sports') return showSports();
    if (sport === 'vFootball') { location.hash = '#/virtual/instant'; return; }
    if (!SportyHome.highlightSports[sport]) return previousSwitchSport(button);
    homeHighlightSport = sport; homeHighlightLeague = 0;
    button.parentElement.querySelectorAll('[role=tab]').forEach(b => { b.setAttribute('aria-selected', b === button); b.tabIndex = b === button ? 0 : -1; });
    document.querySelector('.league-chips').innerHTML = homeLeagueChips();
    document.querySelector('.highlights .match-table').innerHTML = currentHomeHighlights();
    drawIcons(); markPicks();
  };

  const previousFeatureContent = featureContent;
  featureContent = function(tab) {
    if (tab === 'Matches' || tab === 'Codes') {
      previousFeatureContent(tab);
      const leagues = document.querySelector('.m-leagues');
      if (leagues) leagues.hidden = tab !== 'Matches';
      return;
    }
    document.querySelectorAll('[data-feature]').forEach(b => {
      const active = b.dataset.feature === tab;
      b.classList.toggle('active', active); b.setAttribute('aria-selected', active); b.tabIndex = active ? 0 : -1;
    });
    const leagues = document.querySelector('.m-leagues');
    if (leagues) leagues.hidden = true;
    const block = document.querySelector('.m-feature-match');
    if (!block) return;
    if (tab === 'Virtuals') {
      block.innerHTML = `<div class="home-feature-games">${SportySurfaces.virtual.cards.slice(0,7).map((c,i) => `<button data-path="virtual/${i === 0 ? 'instant' : 'product/'+i}"><img src="${c.image}" alt="${escapeHTML(c.name)}"><span>${escapeHTML(c.name)}</span></button>`).join('')}</div>`;
    } else {
      let games = Object.values(SportyCatalog.games);
      if (tab === 'LuckyNumbers') games = games.filter(g => /lucky|number|lotto/i.test(g.name));
      else games = (SportyCatalog.sets[17] || SportyCatalog.sets[0]).map(id => SportyCatalog.games[id]).filter(Boolean);
      block.innerHTML = `<div class="home-feature-games">${games.slice(0,12).map(g => `<button data-catalog-game="${g.id}" aria-label="Open ${escapeHTML(g.name)}"><img src="${g.image}" alt="${escapeHTML(g.name)}" loading="lazy"><span>${escapeHTML(g.name)}</span></button>`).join('')}</div>`;
    }
    drawIcons();
  };

  document.addEventListener('click', e => {
    const button = e.target.closest('[data-home-league],[data-home-category],[data-home-live-lines],.m-live [data-more],.live-card [data-more]');
    if (!button) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (button.hasAttribute('data-home-league')) {
      homeHighlightLeague = Number(button.dataset.homeLeague);
      document.querySelector('.league-chips').innerHTML = homeLeagueChips();
      document.querySelector('.highlights .match-table').innerHTML = currentHomeHighlights();
      drawIcons(); markPicks(); return;
    }
    if (button.hasAttribute('data-home-live-lines')) { showLines(Number(button.dataset.homeLiveLines)); return; }
    if (button.hasAttribute('data-more')) { location.hash = '#/live'; return; }
    const category = SportyHome.categories[Number(button.dataset.homeCategory)];
    const title = category.title;
    const index = SportyHome.featured.findIndex(r => r.category===title || (title.includes('ATP') ? r.sport === 'Tennis' : /premier/i.test(title) ? /Premier/i.test(r.league) : /laliga/i.test(title) ? /LaLiga/i.test(r.league) : r.league.toLowerCase().includes(title.toLowerCase())));
    if (index >= 0) {
      document.querySelectorAll('[data-home-category]').forEach(b => b.setAttribute('aria-pressed', b === button));
      const track = document.querySelector('.m-feature-track');
      const card = track?.children[index];
      if (card) track.scrollTo({left: card.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft), behavior: motionReduced() ? 'instant' : 'smooth'});
      return;
    }
    const route = title === 'NBA' ? 'sports/basketball' : title.includes('ATP') ? 'sports/tennis' : 'sports/football';
    location.hash = '#/'+route;
  }, true);

  document.addEventListener('keydown', e => {
    const track = e.target.closest('.m-feature-track');
    if (!track || !['ArrowRight','ArrowLeft'].includes(e.key)) return;
    e.preventDefault();
    track.scrollBy({left: (e.key === 'ArrowRight' ? 1 : -1) * (track.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap)), behavior: motionReduced() ? 'instant' : 'smooth'});
  });

  let featuredTick = setInterval(() => {
    const track = document.querySelector('.m-feature-track');
    if (!track || !track.isConnected || document.hidden || motionReduced() || activeDialog || track.contains(document.activeElement) || track.matches(':hover')) return;
    const step = track.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap);
    const next = (Math.round(track.scrollLeft / step) + 1) % track.children.length;
    track.scrollTo({left: step * next, behavior:'smooth'});
  }, 6000);
  addEventListener('pagehide', () => clearInterval(featuredTick), {once:true});
  renderLive();
})();
