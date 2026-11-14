(() => {
  "use strict";

  // Secondary pages lack #feed-panel; nothing else needs to run there.
  const feedPanel = document.getElementById("feed-panel");
  if (!feedPanel) return;

  const ARROW_RIGHT_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`;
  const ARROW_UP_RIGHT_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>`;
  const PLUS_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14"/><path d="M5 12h14"/></svg>`;

  const CATALOG = {
    projects: {
      label: "My projects",
      countLabel: "5 shipped apps",
      initialVisible: 5,
      items: [
        {
          id: "legally-unbullied",
          title: "Legally Unbullied",
          hook: "Answers plain-English Nigerian legal questions and cites the exact section",
          image: "/images/previews/legally-unbullied.jpg",
          alt: "Legally Unbullied open on a new legal question with saved conversations",
          bordered: true,
          hero: true,
          primaryActionLabel: "Read case notes",
          liveUrl: "https://legally-unbullied.onrender.com",
          liveLabel: "Live app",
          repoUrl: "https://github.com/GraphicMiles/Legallyunbullied",
          repoLabel: "GitHub",
          overview:
            "A Nigerian legal assistant that takes everyday legal questions, sorts them into the right area of law and answers strictly from Nigerian statutes and cases.",
          problem:
            "General AI chat tools invent statute sections or mix up foreign laws when asked Nigerian legal questions, so you cannot trust the answer.",
          solution:
            "Pulls matching sections from a verified Nigerian law database, checks every citation against the source text before replying and refuses to guess when a law is missing. Tested across 100 real scenarios.",
          stack: ["Node.js", "Express", "Firebase", "Groq", "Gemini"]
        },
        {
          id: "nearspace",
          title: "Nearspace",
          hook: "Live map and chat for finding developers and designers nearby in Nigeria",
          image: "/images/previews/nearspace.jpg",
          alt: "Nearspace map and sign-in screen",
          bordered: false,
          hero: true,
          primaryActionLabel: "Read case notes",
          liveUrl: "https://nearspace.com.ng",
          liveLabel: "nearspace.com.ng",
          repoUrl: null,
          repoLabel: "Private repo",
          overview:
            "A live community web app where developers, designers and builders across Nigeria see who is working nearby and message them directly.",
          problem:
            "Builders in the same city rarely know who else is shipping nearby, and constant GPS polling drains phone battery and mobile data.",
          solution:
            "Places nearby creators on a live map without exposing exact street addresses, keeps reads cached so weak connections stay fast and handles Pro upgrades through Paystack. Backed by 590+ automated tests.",
          stack: ["React", "Firebase", "MapLibre", "Paystack", "PWA"]
        },
        {
          id: "scout",
          title: "Scout",
          hook: "Tiny Rust browser engine for AI agents that idles around 5 MB of RAM",
          image: "/images/previews/scout.jpg",
          alt: "Scout install command and MCP server screen",
          bordered: false,
          hero: false,
          primaryActionLabel: "Read case notes",
          liveUrl: "https://github.com/GraphicMiles/Scout#readme",
          liveLabel: "Docs",
          repoUrl: "https://github.com/GraphicMiles/Scout",
          repoLabel: "GitHub",
          overview:
            "A lightweight browser automation tool written in Rust and published on npm (@graphicmiles/scout) so AI agents can read pages and submit forms without launching Chrome.",
          problem:
            "Spinning up headless Chrome eats hundreds of megabytes of memory per session, which crashes small servers when an agent only needs text and forms.",
          solution:
            "Loads pages, runs page scripts in a sandbox, fills forms and returns clean data over HTTP or MCP while sitting near 5 MB of memory at idle.",
          stack: ["Rust", "HTTP API", "MCP", "npm package"]
        },
        {
          id: "luna",
          title: "Luna",
          hook: "Offline Android coding assistant that runs AI models directly on the phone",
          image: "/images/previews/luna.jpg",
          alt: "Luna speed and context benchmark card",
          bordered: false,
          hero: false,
          primaryActionLabel: "Read case notes",
          liveUrl: "https://github.com/GraphicMiles/forgeai-android/blob/main/docs/TECHNICAL_REPORT.md",
          liveLabel: "Write-up",
          repoUrl: "https://github.com/GraphicMiles/forgeai-android",
          repoLabel: "GitHub",
          overview:
            "An Android coding assistant that runs open language models locally on your phone, with an optional cloud mode when you want bigger models.",
          problem:
            "Cloud coding apps stop working offline, and letting an agent edit files on a phone is risky if you cannot see and undo every change.",
          solution:
            "Runs models locally through llama.cpp with no internet needed, verifies model files before opening them and asks permission before changing any file, with one-tap undo.",
          stack: ["Flutter", "Android Java", "llama.cpp", "On-device AI"]
        },
        {
          id: "motionshelf",
          title: "MotionShelf",
          hook: "Curated library of copy-paste UI components and offline developer tools",
          image: "/images/previews/motionshelf.jpg",
          alt: "MotionShelf component library home view",
          bordered: false,
          hero: false,
          primaryActionLabel: "Read case notes",
          liveUrl: "https://motionshelf.onrender.com/",
          liveLabel: "Live app",
          repoUrl: "https://github.com/GraphicMiles/Motionshelf",
          repoLabel: "GitHub",
          overview:
            "A web library of ready-to-copy interface components, motion examples and small offline utilities for frontend work.",
          problem:
            "UI snippets saved across gists and bookmarks rarely show a live preview beside the actual code you are about to copy.",
          solution:
            "Pairs live interactive previews with clean source code, framework filters and a manual review queue before community submissions go live.",
          stack: ["JavaScript", "Node.js", "UI Components"]
        }
      ]
    },

    experiments: {
      label: "My experiments",
      countLabel: "9 experiments",
      initialVisible: 5,
      moreLabel: "Show 4 more experiments",
      items: [
        {
          id: "stare-ai",
          title: "Stare",
          hook: "Webcam staring contest in the browser where blinking loses the round",
          image: "/images/previews/stare-ai.jpg",
          alt: "Stare browser staring game screen",
          bordered: false,
          hero: true,
          primaryActionLabel: "Read notes",
          liveUrl: "https://peekaboo-beige.vercel.app/",
          liveLabel: "Play live",
          repoUrl: "https://github.com/GraphicMiles/stare-ai",
          repoLabel: "GitHub",
          overview:
            "A browser staring game that uses your webcam to referee a duel in real time without sending a single video frame to a server.",
          problem:
            "Catching real blinks on ordinary laptop and phone cameras without lag or false triggers when you move your head.",
          solution:
            "Tracks eye landmarks locally at 60 FPS in the browser, calibrates to your lighting in a few seconds and scores rounds across difficulty modes.",
          stack: ["TypeScript", "MediaPipe", "Webcam Vision"]
        },
        {
          id: "photon-lab",
          title: "Photon Lab",
          hook: "Sends data from a screen to a phone camera using flashing color grids",
          image: "/images/previews/photon-lab.jpg",
          alt: "Photon Lab optical transmitter and signal plots",
          bordered: false,
          hero: true,
          primaryActionLabel: "Read notes",
          liveUrl: "https://steinberg-zeta.vercel.app/",
          liveLabel: "Try live",
          repoUrl: "https://github.com/GraphicMiles/photon-lab",
          repoLabel: "GitHub",
          overview:
            "A browser test bench for sending tiny packets of data visually from one screen into another device's camera.",
          problem:
            "Phone cameras shift brightness and warp fast-changing pixels, so raw color flashes turn noisy almost immediately.",
          solution:
            "Locks onto bright corner markers to straighten the grid, plots signal quality live and lets you test symbol speeds before writing a full app.",
          stack: ["JavaScript", "WebRTC Camera", "Canvas"]
        },
        {
          id: "turf",
          title: "Turf",
          hook: "Public media board starting at 100 naira where taking a spot costs 2x",
          image: "/images/previews/turf.jpg",
          alt: "Turf ranked media ladder",
          bordered: true,
          hero: false,
          primaryActionLabel: "Read notes",
          liveUrl: "https://turf-pi-six.vercel.app/",
          liveLabel: "Try live",
          repoUrl: "https://github.com/GraphicMiles/Turf",
          repoLabel: "GitHub",
          overview:
            "A playful ranked media board where every slot starts at 100 naira and claiming someone's rank costs double what they paid.",
          problem:
            "If two people pay for the same slot at the same moment, the board breaks unless payments and rank swaps settle cleanly in order.",
          solution:
            "Processes rank claims one at a time so prices, slot owners and media posts stay accurate even when people compete for the top spot.",
          stack: ["JavaScript", "Paystack", "Realtime State"]
        },
        {
          id: "mr-nobody",
          title: "Mr Nobody",
          hook: "Android privacy browser where the built-in assistant obeys your ad and cookie rules",
          image: "/images/previews/mr-nobody.jpg",
          alt: "Mr Nobody Android privacy browser overview",
          bordered: false,
          hero: false,
          primaryActionLabel: "Read notes",
          liveUrl: "https://github.com/GraphicMiles/Mr-Nobody#readme",
          liveLabel: "README",
          repoUrl: "https://github.com/GraphicMiles/Mr-Nobody",
          repoLabel: "GitHub",
          overview:
            "An open-source Android privacy browser with a built-in task assistant that shares the same privacy rules as your own tabs.",
          problem:
            "Most AI browser tools run around your tracker blockers and cookie settings behind the scenes.",
          solution:
            "Runs the assistant inside the same tracker filter and isolated storage as normal browsing, and pauses for approval before submitting forms.",
          stack: ["Android Java", "WebView", "Privacy Controls"]
        },
        {
          id: "middleground",
          title: "Middleground",
          hook: "Walkable 3D wetland scene in the browser with a live day-to-night sky",
          image: "/images/previews/middleground.jpg",
          alt: "Middleground 3D Okavango marsh scene",
          bordered: false,
          hero: false,
          primaryActionLabel: "Read notes",
          liveUrl: "/middleground/",
          liveLabel: "Walk scene",
          repoUrl: "https://github.com/GraphicMiles/Middleground",
          repoLabel: "GitHub",
          overview:
            "A quiet first-person 3D wetland you can walk around in the browser on desktop or mobile, inspired by the Okavango Delta.",
          problem:
            "Drawing dense reeds, water and shifting daylight in a browser tab without multi-megabyte downloads or frame drops on phones.",
          solution:
            "Generates terrain, water and plants procedurally from code as you move, with touch and keyboard controls plus quality presets.",
          stack: ["Three.js", "WebGL", "Procedural 3D"]
        },
        {
          id: "impose",
          title: "Impose",
          hook: "Agent workspace that shows the plan and asks before touching files",
          image: "/images/previews/impose.jpg",
          alt: "Impose agent workspace trace view",
          bordered: true,
          hero: false,
          primaryActionLabel: "Read notes",
          liveUrl: "https://github.com/GraphicMiles/Impose#readme",
          liveLabel: "README",
          repoUrl: "https://github.com/GraphicMiles/Impose",
          repoLabel: "GitHub",
          overview:
            "A clean web workspace for running coding agents where every step is visible instead of hidden behind a loading spinner.",
          problem:
            "Most agent UIs only tell you what happened after a command or file edit has already run.",
          solution:
            "Breaks every task into plan, read steps, write approvals and a saved log you can replay afterward.",
          stack: ["Python", "Vanilla JS", "Agent UI"]
        },
        {
          id: "chan-watchparty",
          title: "Chan Watchparty",
          hook: "Shared YouTube and screen-share rooms that keep everyone in sync",
          image: "/images/previews/chan-watchparty.jpg",
          alt: "Chan Watchparty room overview",
          bordered: false,
          hero: false,
          primaryActionLabel: "Read notes",
          liveUrl: "https://github.com/GraphicMiles/chan-watchparty#readme",
          liveLabel: "README",
          repoUrl: "https://github.com/GraphicMiles/chan-watchparty",
          repoLabel: "GitHub",
          overview:
            "A watch-party app for web and Android where friends watch YouTube or live screen shares together with chat.",
          problem:
            "Late joiners drift out of sync with the host, and switching from a video link to live screen share usually forces a new room.",
          solution:
            "Syncs everyone to the host's playback clock through Firebase and switches smoothly to LiveKit video when someone shares their screen.",
          stack: ["React", "Firebase", "LiveKit", "Capacitor"]
        },
        {
          id: "uptime",
          title: "Uptime",
          hook: "Small job server that dispatches Docker tasks to spare machines",
          image: "/images/previews/uptime.jpg",
          alt: "Uptime worker queue overview",
          bordered: true,
          hero: false,
          primaryActionLabel: "Read notes",
          liveUrl: "https://github.com/GraphicMiles/Uptime#readme",
          liveLabel: "README",
          repoUrl: "https://github.com/GraphicMiles/Uptime",
          repoLabel: "GitHub",
          overview:
            "A lightweight backend prototype for queueing compute jobs and running them inside Docker containers on remote worker machines.",
          problem:
            "Running jobs across separate machines gets messy quickly if a worker disconnects halfway through a task.",
          solution:
            "Tracks worker heartbeats from a FastAPI server, runs each job in a clean container and re-queues work if a node drops offline.",
          stack: ["Python", "FastAPI", "SQLite", "Docker"]
        },
        {
          id: "cobble",
          title: "Cobble",
          hook: "No-ads Android screen recorder launched from the Quick Settings shade",
          image: "/images/previews/cobble.jpg",
          alt: "Cobble Android screen recorder card",
          bordered: false,
          hero: false,
          primaryActionLabel: "Read notes",
          liveUrl: "https://github.com/GraphicMiles/Cobble#readme",
          liveLabel: "README",
          repoUrl: "https://github.com/GraphicMiles/Cobble",
          repoLabel: "GitHub",
          overview:
            "A tiny Android screen recorder that starts and stops right from your phone's Quick Settings panel with zero ads or extra permissions.",
          problem:
            "Third-party screen recorders on Android often pack heavy ad SDKs and background trackers for a simple system feature.",
          solution:
            "Uses Android's built-in hardware video encoder inside a clean foreground service and saves standard MP4 clips straight to storage.",
          stack: ["Android Java", "Hardware MP4", "Quick Settings"]
        }
      ]
    },

    demos: {
      label: "My demo projects",
      countLabel: "13 UI studies",
      initialVisible: 5,
      moreLabel: "Show all 13 demo projects",
      items: [
        {
          id: "bragsheet",
          title: "Bragsheet",
          hook: "Private career-receipts landing page with interactive log shell and MCP setup",
          image: "/images/previews/bragsheet.jpg",
          alt: "Bragsheet dark landing page with interactive two-pane receipt shell",
          bordered: false,
          hero: true,
          primaryActionLabel: "Open live demo",
          directLaunch: true,
          liveUrl: "/bragsheet/",
          liveLabel: "Open demo"
        },
        {
          id: "atelier-drop",
          title: "Atelier Drop",
          hook: "18-page streetwear store recreated in plain HTML, CSS and JS",
          image: "/images/previews/atelier-drop.jpg",
          alt: "Atelier Drop storefront with hanging garment rail",
          bordered: true,
          hero: true,
          primaryActionLabel: "Open live demo",
          directLaunch: true,
          liveUrl: "/atelier-drop/",
          liveLabel: "Open demo",
          secondaryUrl: "/atelier-drop-case-study",
          secondaryLabel: "Case study"
        },
        {
          id: "sixhours",
          title: "Sixhours",
          hook: "20-product gadget store demo with bag and Lagos/Abuja delivery checks",
          image: "/images/previews/sixhours.jpg",
          alt: "Sixhours gadget store front page",
          bordered: true,
          hero: true,
          primaryActionLabel: "Open live demo",
          directLaunch: true,
          liveUrl: "/sixhours/",
          liveLabel: "Open demo"
        },
        {
          id: "ilee",
          title: "Ilée",
          hook: "Verified Lagos home-rental storefront and concierge desk flow",
          image: "/images/previews/ilee.jpg",
          alt: "Ilée verified Lagos homes page",
          bordered: true,
          hero: false,
          primaryActionLabel: "Open live demo",
          directLaunch: true,
          liveUrl: "/ilee/",
          liveLabel: "Open demo"
        },
        {
          id: "tessera",
          title: "Tessera",
          hook: "Product landing page and workflow UI for team AI approvals",
          image: "/images/previews/tessera.jpg",
          alt: "Tessera workflow landing page",
          bordered: true,
          hero: false,
          primaryActionLabel: "Open live demo",
          directLaunch: true,
          liveUrl: "/tessera/",
          liveLabel: "Open demo"
        },
        {
          id: "sportybet-demo",
          title: "SportyBet UI study",
          hook: "Desktop and mobile sportsbook recreation with betslip and demo wallet",
          image: "/images/previews/sportybet-demo.jpg",
          alt: "SportyBet responsive sportsbook study",
          bordered: false,
          hero: false,
          primaryActionLabel: "Open live demo",
          directLaunch: true,
          liveUrl: "/sportybet-demo/",
          liveLabel: "Open demo"
        },
        {
          id: "cirrus",
          title: "Cirrus",
          hook: "Invoicing and cashflow dashboard study for finance teams",
          image: "/images/previews/cirrus.jpg",
          alt: "Cirrus finance workspace concept",
          bordered: true,
          hero: false,
          primaryActionLabel: "Open live demo",
          directLaunch: true,
          liveUrl: "/cirrus/",
          liveLabel: "Open demo"
        },
        {
          id: "drop",
          title: "Drop",
          hook: "Simple file-sharing interface built around a single clean inbox",
          image: "/images/previews/drop.jpg",
          alt: "Drop file transfer interface",
          bordered: true,
          hero: false,
          primaryActionLabel: "Open live demo",
          directLaunch: true,
          liveUrl: "/drop/",
          liveLabel: "Open demo"
        },
        {
          id: "rewind",
          title: "Rewind",
          hook: "Streaming catalog browser with instant search and saved watchlist",
          image: "/images/previews/rewind.jpg",
          alt: "Rewind streaming catalog study",
          bordered: false,
          hero: false,
          primaryActionLabel: "Open live demo",
          directLaunch: true,
          liveUrl: "/rewind/",
          liveLabel: "Open demo"
        },
        {
          id: "cala",
          title: "Cala",
          hook: "Boutique hotel site and room-booking flow study",
          image: "/images/previews/cala.jpg",
          alt: "Cala hotel booking study",
          bordered: false,
          hero: false,
          primaryActionLabel: "Open live demo",
          directLaunch: true,
          liveUrl: "/cala/",
          liveLabel: "Open demo"
        },
        {
          id: "quarry",
          title: "Quarry",
          hook: "Brand and product design studio landing page",
          image: "/images/previews/quarry.jpg",
          alt: "Quarry studio landing page",
          bordered: true,
          hero: false,
          primaryActionLabel: "Open live demo",
          directLaunch: true,
          liveUrl: "/quarry/",
          liveLabel: "Open demo"
        },
        {
          id: "metrix",
          title: "Metrix",
          hook: "SaaS product usage and revenue analytics dashboard",
          image: "/images/previews/metrix.jpg",
          alt: "Metrix SaaS analytics dashboard",
          bordered: true,
          hero: false,
          primaryActionLabel: "Open live demo",
          directLaunch: true,
          liveUrl: "/demos/03-saas.html",
          liveLabel: "Open demo"
        },
        {
          id: "touchline",
          title: "The Touchline",
          hook: "Football magazine homepage and matchday briefing layout",
          image: "/images/previews/touchline.jpg",
          alt: "The Touchline football editorial layout",
          bordered: true,
          hero: false,
          primaryActionLabel: "Open live demo",
          directLaunch: true,
          liveUrl: "/demos/04-media.html",
          liveLabel: "Open demo"
        }
      ]
    }
  };

  const SEGMENT_ORDER = ["projects", "experiments", "demos"];

  const state = {
    activeSegment: "projects",
    expandedSegments: {
      projects: true,
      experiments: false,
      demos: false
    },
    detailItem: null
  };

  const els = {
    aboutToggle: document.getElementById("about-toggle"),
    aboutDrawer: document.getElementById("about-drawer"),
    copyEmailBtn: document.getElementById("copy-email-btn"),
    copyEmailLabel: document.getElementById("copy-email-label"),
    glider: document.getElementById("segment-glider"),
    segmentBtns: Array.from(document.querySelectorAll(".segment-btn")),
    topbarCount: document.getElementById("topbar-count"),
    feedList: feedPanel,
    detailView: document.getElementById("detail-view"),
    rightPane: document.getElementById("content")
  };

  let revealObserver = null;

  function setupRevealObserver() {
    if (revealObserver) revealObserver.disconnect();
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".feed-entry").forEach((el) => el.classList.add("is-visible"));
      return;
    }
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -24px 0px" }
    );
    document.querySelectorAll(".feed-entry").forEach((el) => revealObserver.observe(el));
  }

  function buildWipeLinkHTML(label, attrs) {
    return `
      <${attrs.tag} ${attrs.props} class="wipe-link">
        <span class="wipe-link-arrow wipe-link-arrow--left">${ARROW_RIGHT_SVG}</span>
        <span>${label}</span>
        <span class="wipe-link-arrow wipe-link-arrow--right">${ARROW_RIGHT_SVG}</span>
        <span class="wipe-line-track" aria-hidden="true"></span>
      </${attrs.tag}>
    `;
  }

  const IS_SAND_IFRAME =
    location.protocol === "about:" ||
    location.origin === "null" ||
    location.protocol === "blob:" ||
    location.protocol === "data:" ||
    location.protocol === "file:";
  const DEPLOYED_BASE = "https://designedbymiles.vercel.app";

  function resolveActionUrl(url) {
    if (!url) return url;
    if (/^(https?:|mailto:|tel:)/i.test(url)) return url;
    if (IS_SAND_IFRAME && url.startsWith("/")) return DEPLOYED_BASE + url;
    return url;
  }

  function isExternal(url) {
    return /^https?:\/\//i.test(url) || IS_SAND_IFRAME;
  }

  function safePushHash(stateObj, hashStr) {
    try {
      history.pushState(stateObj, "", hashStr);
    } catch (_) {
      try {
        location.hash = hashStr;
      } catch (_) {}
    }
  }

  function renderFeed() {
    const segKey = state.activeSegment;
    const group = CATALOG[segKey];
    const showAll = state.expandedSegments[segKey];
    const visibleItems = showAll ? group.items : group.items.slice(0, group.initialVisible);
    const hiddenCount = group.items.length - visibleItems.length;

    if (els.topbarCount) els.topbarCount.textContent = group.countLabel;
    els.detailView.hidden = true;
    els.feedList.hidden = false;

    const cardsHTML = visibleItems
      .map((item, idx) => {
        const wrapClass = item.hero || idx < 2 ? "feed-card-wrap" : "feed-card-wrap feed-card-wrap--inset";
        const borderClass = item.bordered ? " showcase-frame--bordered" : "";
        const loadingAttr = IS_SAND_IFRAME || idx < 2 ? `loading="eager"` : `loading="lazy"`;

        let frameTagOpen = "";
        let frameTagClose = "";
        let primaryActionHTML = "";
        let secondaryActionHTML = "";

        if (item.directLaunch) {
          const liveHref = resolveActionUrl(item.liveUrl);
          const extAttrs = isExternal(liveHref) ? `target="_blank" rel="noopener noreferrer"` : "";
          frameTagOpen = `<a href="${liveHref}" ${extAttrs} class="showcase-frame${borderClass}" aria-label="Open ${item.title}">`;
          frameTagClose = `</a>`;
          primaryActionHTML = buildWipeLinkHTML(item.primaryActionLabel, {
            tag: "a",
            props: `href="${liveHref}" ${extAttrs}`
          });
          if (item.secondaryUrl) {
            const secHref = resolveActionUrl(item.secondaryUrl);
            const secExt = isExternal(secHref) ? `target="_blank" rel="noopener noreferrer"` : "";
            secondaryActionHTML = `<a href="${secHref}" ${secExt} class="subtle-ext-link">${item.secondaryLabel} ${ARROW_UP_RIGHT_SVG}</a>`;
          }
        } else {
          frameTagOpen = `<a href="#${segKey}/${item.id}" data-open-detail="${item.id}" class="showcase-frame${borderClass}" aria-label="Read details for ${item.title}">`;
          frameTagClose = `</a>`;
          primaryActionHTML = buildWipeLinkHTML(item.primaryActionLabel, {
            tag: "button",
            props: `type="button" data-open-detail="${item.id}"`
          });
          if (item.liveUrl) {
            const liveHref = resolveActionUrl(item.liveUrl);
            const extAttrs = isExternal(liveHref) ? `target="_blank" rel="noopener noreferrer"` : "";
            secondaryActionHTML = `<a href="${liveHref}" ${extAttrs} class="subtle-ext-link">${item.liveLabel} ${ARROW_UP_RIGHT_SVG}</a>`;
          }
        }

        return `
          <article class="feed-entry">
            <div class="${wrapClass}">
              ${frameTagOpen}
                <img src="${item.image}" alt="${item.alt}" width="1280" height="800" decoding="async" ${loadingAttr}>
              ${frameTagClose}
              <div class="entry-bar">
                <div class="entry-summary">
                  <h2 class="entry-title">${item.title}</h2>
                  <span class="entry-hook">${item.hook}</span>
                </div>
                <div class="entry-actions">
                  ${secondaryActionHTML}
                  ${primaryActionHTML}
                </div>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    const moreHTML =
      hiddenCount > 0
        ? `
        <div class="more-row">
          <button type="button" class="more-pill-btn" id="expand-more-btn">
            ${PLUS_SVG}
            <span>${group.moreLabel || `Show ${hiddenCount} more`}</span>
          </button>
        </div>
      `
        : "";

    els.feedList.innerHTML = cardsHTML + moreHTML;

    const expandBtn = document.getElementById("expand-more-btn");
    if (expandBtn) {
      expandBtn.addEventListener("click", () => {
        state.expandedSegments[segKey] = true;
        renderFeed();
      });
    }

    requestAnimationFrame(() => {
      setupRevealObserver();
    });
  }

  function renderDetail(segKey, itemId, pushHash = true) {
    const group = CATALOG[segKey];
    if (!group) return;
    const idx = group.items.findIndex((i) => i.id === itemId);
    if (idx === -1) return;
    const item = group.items[idx];
    state.activeSegment = segKey;
    state.detailItem = { segKey, itemId };
    syncSegmentUI();

    const prevItem = group.items[(idx - 1 + group.items.length) % group.items.length];
    const nextItem = group.items[(idx + 1) % group.items.length];

    const resolvedLive = resolveActionUrl(item.liveUrl);
    const liveExt = resolvedLive && isExternal(resolvedLive) ? `target="_blank" rel="noopener noreferrer"` : "";
    const liveCTA = resolvedLive
      ? `<a href="${resolvedLive}" ${liveExt} class="pill-cta pill-cta--primary"><span>${item.liveLabel}</span>${ARROW_UP_RIGHT_SVG}</a>`
      : "";

    const repoCTA = item.repoUrl
      ? `<a href="${item.repoUrl}" target="_blank" rel="noopener noreferrer" class="pill-cta pill-cta--secondary"><span>${item.repoLabel}</span>${ARROW_UP_RIGHT_SVG}</a>`
      : item.repoLabel
        ? `<span class="stack-tag">${item.repoLabel}</span>`
        : "";

    const stackHTML = (item.stack || []).map((t) => `<span class="stack-tag">${t}</span>`).join("");

    if (els.topbarCount) els.topbarCount.textContent = `${group.label} / ${item.title}`;
    els.feedList.hidden = true;
    els.detailView.hidden = false;

    els.detailView.innerHTML = `
      <div class="detail-hero-card">
        <button type="button" class="detail-back-btn" id="detail-back-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          <span>Back to ${group.label.toLowerCase()}</span>
        </button>

        <div class="detail-head">
          <div class="detail-title-group">
            <h2 class="detail-title">${item.title}</h2>
            <p class="detail-subtitle">${item.hook}</p>
          </div>
          <div class="detail-cta-group">
            ${liveCTA}
            ${repoCTA}
          </div>
        </div>

        <div class="detail-media-frame">
          <img src="${item.image}" alt="${item.alt}" width="1280" height="800" decoding="async">
        </div>
      </div>

      <div class="detail-sections">
        <section class="detail-block">
          <h3 class="detail-block-heading">What it is</h3>
          <p class="detail-block-body">${item.overview}</p>
        </section>
        <section class="detail-block">
          <h3 class="detail-block-heading">Why I built it</h3>
          <p class="detail-block-body">${item.problem}</p>
        </section>
        <section class="detail-block">
          <h3 class="detail-block-heading">How it works</h3>
          <p class="detail-block-body">${item.solution}</p>
        </section>
      </div>

      <div class="detail-stack-row">
        <div class="stack-tags" aria-label="Built with">
          ${stackHTML}
        </div>
        <div class="detail-pager">
          <button type="button" class="more-pill-btn" data-open-detail="${prevItem.id}">Prev: ${prevItem.title}</button>
          <button type="button" class="more-pill-btn" data-open-detail="${nextItem.id}">Next: ${nextItem.title}</button>
        </div>
      </div>
    `;

    if (pushHash) {
      safePushHash({ segKey, itemId }, `#${segKey}/${itemId}`);
    }

    if (window.innerWidth >= 1200) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (els.rightPane) {
      els.rightPane.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    const backBtn = document.getElementById("detail-back-btn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        closeDetail(true);
      });
    }
  }

  function closeDetail(pushHash = true) {
    state.detailItem = null;
    if (pushHash) {
      safePushHash({ segKey: state.activeSegment }, `#${state.activeSegment}`);
    }
    renderFeed();
  }

  function syncSegmentUI() {
    let activeBtn = null;
    els.segmentBtns.forEach((btn) => {
      const selected = btn.dataset.segment === state.activeSegment;
      btn.setAttribute("aria-selected", selected ? "true" : "false");
      btn.tabIndex = selected ? 0 : -1;
      if (selected) activeBtn = btn;
    });
    if (activeBtn && els.glider) {
      els.glider.style.width = `${activeBtn.offsetWidth}px`;
      els.glider.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
    }
  }

  function switchSegment(segKey, pushHash = true) {
    if (!CATALOG[segKey]) return;
    state.activeSegment = segKey;
    state.detailItem = null;
    syncSegmentUI();
    renderFeed();

    if (pushHash) {
      safePushHash({ segKey }, `#${segKey}`);
    }

    if (window.innerWidth >= 1200 && window.scrollY > 120) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function applyHashRoute() {
    const raw = (location.hash || "").replace(/^#/, "").trim();
    if (!raw) {
      syncSegmentUI();
      renderFeed();
      return;
    }
    const [segPart, itemPart] = raw.split("/");
    if (CATALOG[segPart]) {
      state.activeSegment = segPart;
      syncSegmentUI();
      if (itemPart) {
        renderDetail(segPart, itemPart, false);
        return;
      }
    }
    state.detailItem = null;
    renderFeed();
  }

  document.addEventListener("click", (e) => {
    const detailTrigger = e.target.closest("[data-open-detail]");
    if (detailTrigger) {
      e.preventDefault();
      const itemId = detailTrigger.getAttribute("data-open-detail");
      renderDetail(state.activeSegment, itemId, true);
    }
  });

  els.segmentBtns.forEach((btn, idx) => {
    btn.addEventListener("click", () => {
      switchSegment(btn.dataset.segment, true);
    });
    btn.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const dir = e.key === "ArrowRight" ? 1 : -1;
        const nextIdx = (idx + dir + SEGMENT_ORDER.length) % SEGMENT_ORDER.length;
        const nextBtn = els.segmentBtns[nextIdx];
        nextBtn.focus();
        switchSegment(nextBtn.dataset.segment, true);
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.detailItem) {
      closeDetail(true);
    }
  });

  if (els.aboutToggle && els.aboutDrawer) {
    els.aboutToggle.addEventListener("click", () => {
      const open = els.aboutToggle.getAttribute("aria-expanded") === "true";
      els.aboutToggle.setAttribute("aria-expanded", open ? "false" : "true");
      els.aboutDrawer.hidden = open;
    });
  }

  if (els.copyEmailBtn && els.copyEmailLabel) {
    els.copyEmailBtn.addEventListener("click", (e) => {
      if (navigator.clipboard && window.isSecureContext) {
        e.preventDefault();
        navigator.clipboard.writeText("rfarouq69@gmail.com").then(() => {
          els.copyEmailLabel.textContent = "Copied";
          setTimeout(() => {
            els.copyEmailLabel.textContent = "Email";
          }, 1600);
        });
      }
    });
  }

  const avatarLink = document.getElementById("avatar-home-link");
  if (avatarLink) {
    avatarLink.addEventListener("click", (e) => {
      e.preventDefault();
      switchSegment("projects", true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  window.addEventListener("popstate", applyHashRoute);
  window.addEventListener("resize", () => {
    requestAnimationFrame(syncSegmentUI);
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncSegmentUI);
  }

  applyHashRoute();
})();
