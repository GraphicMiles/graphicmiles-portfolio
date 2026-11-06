"use strict";
// Additional fixtures are simulation data, not claims about real schedules or odds.
globalThis.demoFixtures = {};
(function () {
  const rows = [
    [
      11,
      "Football",
      "England Premier League",
      "Arsenal",
      "Chelsea",
      2.05,
      3.5,
      3.4,
      "scheduled",
    ],
    [
      12,
      "Football",
      "Spain La Liga",
      "Barcelona",
      "Valencia",
      1.55,
      4.2,
      6.2,
      "scheduled",
    ],
    [
      13,
      "Football",
      "England Premier League",
      "Liverpool",
      "Manchester City",
      2.7,
      3.6,
      2.45,
      "live",
    ],
    [
      14,
      "Football",
      "Germany Bundesliga",
      "Bayern Munich",
      "Dortmund",
      1.7,
      4.1,
      4.8,
      "scheduled",
    ],
    [
      15,
      "Basketball",
      "Demo Basketball League",
      "Lagos Aces",
      "Abuja Giants",
      1.75,
      0,
      2.1,
      "live",
    ],
    [
      16,
      "Basketball",
      "Demo Basketball League",
      "Kano Kings",
      "Ibadan Eagles",
      1.9,
      0,
      1.9,
      "scheduled",
    ],
    [
      17,
      "Tennis",
      "Demo Tennis Tour",
      "Alex Morgan",
      "Jordan Reed",
      1.65,
      0,
      2.3,
      "live",
    ],
    [
      18,
      "Tennis",
      "Demo Tennis Tour",
      "Sam Ellis",
      "Taylor Brooks",
      2.05,
      0,
      1.78,
      "scheduled",
    ],
    [
      19,
      "Table Tennis",
      "Demo Table Tennis",
      "Player One",
      "Player Two",
      1.8,
      0,
      2.0,
      "live",
    ],
    [
      20,
      "Ice Hockey",
      "Demo Hockey League",
      "Northern Ice",
      "Coastal Wolves",
      2.1,
      3.8,
      2.7,
      "live",
    ],
    [
      21,
      "eFootball",
      "Demo eFootball",
      "Red FC",
      "Blue FC",
      2.35,
      3.3,
      2.85,
      "live",
    ],
    [
      22,
      "vFootball",
      "Demo Virtual League",
      "United V",
      "City V",
      2.2,
      3.4,
      3.0,
      "scheduled",
    ],
    [
      23,
      "eBasketball",
      "Demo eBasketball",
      "East Court",
      "West Court",
      1.85,
      0,
      1.95,
      "live",
    ],
    [
      24,
      "eIce Hockey",
      "Demo eHockey",
      "Ice Red",
      "Ice Blue",
      2.3,
      3.5,
      2.8,
      "scheduled",
    ],
    [
      25,
      "Volleyball",
      "Demo Volleyball",
      "Lagos Spikers",
      "Abuja Setters",
      1.75,
      0,
      2.1,
      "scheduled",
    ],
    [
      26,
      "Cricket",
      "Demo Cricket",
      "Lagos XI",
      "Abuja XI",
      1.9,
      0,
      1.9,
      "scheduled",
    ],
    [
      27,
      "Handball",
      "Demo Handball",
      "North HC",
      "South HC",
      2.15,
      3.5,
      2.9,
      "scheduled",
    ],
    [
      28,
      "Football",
      "Demo Instant Football",
      "Green United",
      "Red Athletic",
      2.05,
      3.4,
      3.7,
      "scheduled",
    ],
    [
      29,
      "Football",
      "Demo Virtual League",
      "Virtual Rovers",
      "Virtual Stars",
      2.45,
      3.2,
      2.85,
      "scheduled",
    ],
  ];
  for (const [id, sport, league, home, away, h, d, a, status] of rows) {
    const initial =
      sport.includes("Basketball") && status === "live"
        ? [42, 38]
        : sport === "Tennis" && status === "live"
          ? [1, 0]
          : [0, 0];
    demoFixtures[id] = {
      id,
      sport,
      league,
      teams: [home, away, ...initial, [h, d, a]],
      status,
      time: status === "live" ? "Live" : "18:00",
      demo: true,
    };
  }
})();

// Shared market catalogue used by UI, persistence validation and settlement.
globalThis.demoMarketDefinitions = function (id) {
  const f =
    id === 10
      ? [
          "Liverpool Montevideo",
          "Penarol Montevideo",
          null,
          null,
          [3.4, 3.6, 1.89],
        ]
      : globalThis.demoFixtures[id]?.teams ||
        (typeof matches !== "undefined" ? matches[id] : null);
  const sport = globalThis.demoFixtures[id]?.sport || "Football";
  const twoWay = [
    "Basketball",
    "eBasketball",
    "Tennis",
    "Table Tennis",
    "Volleyball",
    "Cricket",
  ].includes(sport);
  const total = sport.includes("Basketball")
    ? 165.5
    : sport === "Tennis"
      ? 2.5
      : sport === "Table Tennis"
        ? 3.5
        : 2.5;
  const h = f?.[4]?.[0] || 2.1,
    a = f?.[4]?.[2] || 3.1,
    d = f?.[4]?.[1] || 3.4;
  const defs = [
    {
      id: "1x2",
      title: twoWay ? "Match winner" : "1X2",
      group: "Main",
      outcomes: twoWay
        ? [
            ["home", h],
            ["away", a],
          ]
        : [
            ["home", h],
            ["draw", d],
            ["away", a],
          ],
    },
  ];
  if (!twoWay)
    defs.push({
      id: "dc",
      title: "Double chance",
      group: "Main",
      outcomes: [
        ["home-draw", 1.35],
        ["home-away", 1.28],
        ["draw-away", 1.65],
      ],
    });
  defs.push({
    id: `totals:${total}`,
    title: `Total ${sport.includes("Basketball") ? "points" : sport === "Tennis" || sport === "Table Tennis" ? "sets" : "goals"} ${total}`,
    group: "Totals",
    outcomes: [
      ["over", id === 10 ? 1.54 : 1.9],
      ["under", id === 10 ? 2.3 : 1.9],
    ],
  });
  if (!twoWay) {
    defs.push({
      id: "half-total:0.5",
      title: "1st half total goals 0.5",
      group: "Goals",
      outcomes: [
        ["over", 1.35],
        ["under", 3.0],
      ],
    });
    defs.push({
      id: "btts",
      title: "Both teams to score",
      group: "Goals",
      outcomes: [
        ["yes", 1.82],
        ["no", 1.95],
      ],
    });
    defs.push({
      id: "handicap:-1",
      title: "Handicap: home -1",
      group: "Main",
      outcomes: [
        ["home", 2.8],
        ["draw", 3.6],
        ["away", 2.1],
      ],
    });
  }
  return defs;
};
globalThis.demoMarketOdd = function (id, market, outcome) {
  if (market.startsWith("next:")) return undefined;
  // Existing 1X2 odds must continue using the reference data, never a generated price.
  if (market === "1x2" && id <= 10) return undefined;
  const def = demoMarketDefinitions(id).find((m) => m.id === market);
  if (!def) return undefined;
  return def.outcomes.find((o) => o[0] === outcome)?.[1] ?? null;
};
globalThis.demoPickLabel = function (p) {
  const names = {
    "home-draw": "Home or draw",
    "home-away": "Home or away",
    "draw-away": "Draw or away",
  };
  if (p.market === "half-total:0.5")
    return p.outcome === "over" ? "1st half Over 0.5" : "1st half Under 0.5";
  if (p.market === "dc") return names[p.outcome];
  if (p.market === "btts")
    return p.outcome === "yes"
      ? "Both teams score: Yes"
      : "Both teams score: No";
  if (p.market === "handicap:-1")
    return { home: "Home -1", draw: "Draw (home -1)", away: "Away +1" }[
      p.outcome
    ];
  return null;
};
globalThis.demoMarketTitle = function (market) {
  return (
    {
      "half-total:0.5": "1st half total goals 0.5",
      dc: "Double chance",
      btts: "Both teams to score",
      "handicap:-1": "Handicap: home -1",
    }[market] || null
  );
};
