/* ilee - the live home discovery surface on listings.html.

   Driven by GET /api/v1/homes. The controls filter the live response in memory,
   which is right at pilot volume and wrong at a thousand listings; engineering
   gap B-7 already records the pagination limit that goes with it.

   Three rules this file keeps, because each was broken once already:

   1. The server owns the labels. `badge` and `badgeLabel` come from
      routes/catalog.js, which derives them from verification_tier in one place.
      A page-side map of badge names is how the site came to show a verification
      state the database did not have (gap F-2), so nothing here re-derives one.

   2. Filters are populated from what exists. `facets` in the response lists the
      categories, launch areas and home types that have at least one live home
      behind them. Hardcoded Lekki and Ikeja chips left a live home in another
      area reachable only through "All pilot areas" and invisible under both.

   3. A photograph is only shown if the API sent one. Media arrives as relative
      /api/v1/media/:id/photo paths that redirect to a short-lived signed URL, so
      an unpublished or withdrawn photograph cannot be rendered even by a page
      that still holds an old copy of this response.

   SRS 3.1 alignment: category filtering, high-definition imagery, and the
   "Pay Small Small" filter label (D-010 reversed 23 September 2026).
*/
(function () {
  "use strict";

  var grid = document.querySelector("[data-homes-grid]");
  if (!grid) return;

  var supplyCell = grid.querySelector(".listing-cta");
  var allHomes = [];
  var filteredHomes = [];
  var facets = { categories: [], launchAreas: [], homeTypes: [] };
  var launchAreas = [];
  var programName = "installments";
  var activeView = "list";
  var loadState = "loading";
  var filterToggle = document.querySelector("[data-filter-toggle]");
  var savedHomes = [];
  try {
    var stored = JSON.parse(
      sessionStorage.getItem("ilee.homes.shortlist") || "[]",
    );
    if (Array.isArray(stored)) savedHomes = stored;
  } catch (_) {}
  var summary = document.querySelector("[data-homes-summary]");
  var search = document.getElementById("home-search");
  var area = document.getElementById("home-area");
  var type = document.getElementById("home-type");
  var budget = document.getElementById("home-budget");
  var installments = document.getElementById("home-installments");
  var priceLabel = document.querySelector("[data-homes-price-label]");
  var filterForm = document.querySelector("[data-homes-filters]");
  // Read once and consumed once, so a later facet refresh or a reset does not
  // re-apply a category the visitor has since changed.
  var requestedCategory = (function () {
    var value = new URLSearchParams(window.location.search).get("category");
    return value === "rent" || value === "buy" ? value : "";
  })();
  var mapMarkers = document.querySelector("[data-map-markers]");
  var mapTitle = document.querySelector("[data-map-title]");
  var mapCopy = document.querySelector("[data-map-copy]");
  var tourTitle = document.querySelector("[data-tour-title]");
  var tourCopy = document.querySelector("[data-tour-copy]");
  var tourStage = document.querySelector("[data-tour-stage]");
  var tourPlaceholder = document.querySelector("[data-tour-placeholder]");

  function setContent(html) {
    grid.innerHTML = html;
    if (supplyCell) grid.appendChild(supplyCell);
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // One money formatter, told what the number means. A purchase price labelled
  // "a year" is the kind of error that ends a conversation with a buyer.
  function price(home) {
    var kobo = home.priceKobo != null ? home.priceKobo : home.rentAnnualKobo;
    if (kobo == null) return { amount: "Price on request", suffix: "" };
    var amount = "\u20a6" + Number(kobo / 100).toLocaleString("en-NG");
    return {
      amount: amount,
      suffix: home.priceBasis === "asking_price" ? "" : " a year",
    };
  }

  function skeletons(count) {
    var out = "";
    for (var i = 0; i < count; i++) {
      out +=
        '<div class="skeleton-card" aria-hidden="true">' +
        '<div class="skeleton-card__media"></div>' +
        '<div class="skeleton-card__body">' +
        '<span class="skeleton-line skeleton-line--short"></span>' +
        '<span class="skeleton-line skeleton-line--mid"></span>' +
        '<span class="skeleton-line"></span>' +
        "</div></div>";
    }
    return out;
  }

  function homeCard(home) {
    var badgeLabel = home.badgeLabel || "Verification details not provided";
    var title = home.homeType || "Home";
    var location = home.area || home.launchArea || "Lagos";
    var money = price(home);
    var kind =
      home.category === "buy"
        ? "For sale · Asking price"
        : "For rent";
    var enquiryHref =
      "/ilee/contact.html?topic=" +
      encodeURIComponent(
        home.category === "buy"
          ? "Looking to buy a home"
          : "Looking for a rental home",
      ) +
      "&context=" +
      encodeURIComponent(
        "I am asking about " +
          location +
          " " +
          title +
          (home.id ? " (reference " + home.id + ")" : ""),
      ) +
      "#contact-form";
    var photos = home.photos || [];
    var saved = savedHomes.indexOf(String(home.id)) !== -1;
    var media =
      photos.length && photos[0].url
        ? '<img src="' +
          esc(photos[0].url) +
          '?w=900" alt="' +
          esc((photos[0].room || title) + " in " + location) +
          '" loading="lazy" decoding="async" width="900" height="675">'
        : '<div class="home-card__no-photo"><i class="ph ph-buildings" aria-hidden="true"></i><strong>Photographs not published yet</strong><span>Ask the desk about a viewing.</span></div>';
    return (
      '<article class="home-card listing">' +
      '<div class="home-card__media">' +
      media +
      '<button type="button" class="home-card__save-btn" data-save-listing="' +
      esc(home.id) +
      '" aria-pressed="' +
      saved +
      '" aria-label="' +
      (saved ? "Remove from" : "Add to") +
      " session shortlist: " +
      esc(title + " in " + location) +
      '" title="Shortlist for this browser session">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg></button>' +
      '</div><div class="home-card__body"><div class="home-card__badges">' +
      '<span class="home-card__badge">' +
      esc(badgeLabel) +
      "</span>" +
      (home.acceptsInstallments
        ? '<span class="home-card__badge home-card__schedule">' +
          esc(programName) +
          " available</span>"
        : "") +
      '</div><div class="home-card__header"><h3 class="home-card__title">' +
      esc(title) +
      "</h3>" +
      '<span class="home-card__location"><i class="ph ph-map-pin" aria-hidden="true"></i>' +
      esc(location) +
      "</span></div>" +
      '<div class="home-card__price">' +
      esc(money.amount) +
      (money.suffix ? " <small>" + esc(money.suffix.trim()) + "</small>" : "") +
      "</div>" +
      '<p class="home-card__kind">' +
      kind +
      "</p>" +
      (home.terms
        ? '<details class="home-card__terms"><summary>Costs &amp; terms on file</summary><p>' +
          esc(home.terms) +
          "</p></details>"
        : '<p class="home-card__kind">Ask the desk for the full cost breakdown.</p>') +
      '<a class="home-card__action-btn" href="' +
      enquiryHref +
      '">Request a viewing <i class="ph ph-arrow-up-right" aria-hidden="true"></i></a>' +
      "</div></article>"
    );
  }

  function emptyState(isFiltered) {
    var where = launchAreas.length
      ? launchAreas.join(" and ")
      : "the pilot area";
    var heading = isFiltered
      ? "No live home matches that brief."
      : "No verified home is listed yet.";
    var copy = isFiltered
      ? "Clear a filter or send the rental desk your area, budget and timing so the next search has somewhere to start."
      : "Every home on this page has passed a physical inspection first. Nothing has cleared that bar in the " +
        where +
        " pilot yet.";
    return (
      '<div class="homes-state homes-state--empty">' +
      '<i class="ph ph-house homes-state__icon" aria-hidden="true"></i>' +
      "<h3>" +
      heading +
      "</h3>" +
      "<p>" +
      copy +
      "</p>" +
      '<div class="homes-state__actions">' +
      '<a class="button button--primary" href="/ilee/contact.html?topic=Looking%20for%20a%20rental%20home#contact-form"><span class="button__wash" aria-hidden="true"></span><span class="button__label">Tell us what you need</span> <i class="ph ph-arrow-right" aria-hidden="true"></i></a>' +
      '<button class="text-button" type="button" data-homes-clear>Clear filters</button>' +
      "</div></div>"
    );
  }

  function errorState() {
    return (
      '<div class="homes-state homes-state--error">' +
      '<i class="ph ph-warning homes-state__icon" aria-hidden="true"></i>' +
      "<h3>The home list did not load.</h3>" +
      "<p>The rental desk can confirm current supply directly while this is fixed.</p>" +
      '<div class="homes-state__actions">' +
      '<button class="button button--primary" type="button" data-homes-retry><span class="button__wash" aria-hidden="true"></span><span class="button__label">Try again</span> <i class="ph ph-arrow-right" aria-hidden="true"></i></button>' +
      '<a class="text-link" href="/ilee/contact.html#contact-form"><i class="ph ph-arrow-right" aria-hidden="true"></i>Contact the desk</a>' +
      "</div></div>"
    );
  }

  function selectedCategory() {
    var checked = filterForm
      ? filterForm.querySelector('input[name="home-category"]:checked')
      : null;
    return checked ? checked.value : "";
  }

  function matches(home) {
    var query = search ? search.value.trim().toLowerCase() : "";
    var homeArea = String(home.area || "").toLowerCase();
    var homeLaunch = String(home.launchArea || "").toLowerCase();
    var homeType = String(home.homeType || "").toLowerCase();
    var rent = Number(
      home.priceKobo != null ? home.priceKobo : home.rentAnnualKobo || 0,
    );
    var category = selectedCategory();

    if (category && home.category !== category) return false;
    if (
      query &&
      (homeArea + " " + homeLaunch + " " + homeType).indexOf(query) === -1
    )
      return false;
    // Matched on the canonical launch area the database derived, not on the free
    // text the landlord wrote. "Lekki Phase 1" is a Lekki home and now answers to
    // the Lekki chip instead of disappearing from every one of them.
    if (area && area.value && homeLaunch !== area.value.toLowerCase())
      return false;
    if (type && type.value && home.homeType !== type.value) return false;
    if (budget && budget.value === "under-3m" && rent >= 300000000)
      return false;
    if (
      budget &&
      budget.value === "3m-6m" &&
      (rent < 300000000 || rent > 600000000)
    )
      return false;
    if (budget && budget.value === "over-6m" && rent <= 600000000) return false;
    if (installments && installments.checked && !home.acceptsInstallments)
      return false;
    return true;
  }

  function updateSummary() {
    if (!summary) return;
    if (!allHomes.length) {
      summary.textContent = "No live homes published yet";
      return;
    }
    var category = selectedCategory();
    var one = filteredHomes.length === 1;
    var noun =
      category === "buy"
        ? "home for sale"
        : category === "rent"
          ? "home to rent"
          : "home";
    var many =
      category === "buy"
        ? "homes for sale"
        : category === "rent"
          ? "homes to rent"
          : "homes";
    summary.textContent =
      filteredHomes.length +
      " " +
      (one ? noun : many) +
      " " +
      (one ? "matches" : "match");
  }

  function renderList() {
    updateSummary();
    if (!filteredHomes.length) {
      setContent(emptyState(allHomes.length > 0));
      return;
    }
    var html = "";
    for (var i = 0; i < filteredHomes.length; i++)
      html += homeCard(filteredHomes[i]);
    setContent(html);
    var cards = grid.querySelectorAll("[data-reveal]");
    for (var j = 0; j < cards.length; j++)
      cards[j].classList.add("is-revealed");
  }

  /* Fill the selects from the live facets, then rebuild the custom listboxes.

     The rebuild is not optional. js/custom-select.js enhances a select once at
     parse time and marks it, and its MutationObserver only looks for NEW selects
     - so repopulating an existing one left the visible listbox showing the
     options from parse time while the native select sat display:none underneath.
     The home-type filter had exactly one reachable option, permanently. */
  function populateFacets() {
    if (area) {
      var keepArea = area.value;
      var areaOptions = '<option value="">All pilot areas</option>';
      facets.launchAreas.forEach(function (value) {
        areaOptions +=
          '<option value="' + esc(value) + '">' + esc(value) + "</option>";
      });
      area.innerHTML = areaOptions;
      if (keepArea && facets.launchAreas.indexOf(keepArea) !== -1)
        area.value = keepArea;
    }
    if (type) {
      var keepType = type.value;
      var typeOptions = '<option value="">All home types</option>';
      facets.homeTypes.forEach(function (value) {
        typeOptions +=
          '<option value="' + esc(value) + '">' + esc(value) + "</option>";
      });
      type.innerHTML = typeOptions;
      if (keepType && facets.homeTypes.indexOf(keepType) !== -1)
        type.value = keepType;
    }
    // The category chips are radios in the markup, so a category with no live
    // home behind it is disabled rather than removed: the shape of the choice
    // stays stable while the visitor is looking at it.
    if (filterForm) {
      filterForm
        .querySelectorAll('input[name="home-category"]')
        .forEach(function (radio) {
          if (!radio.value) return;
          var available = facets.categories.indexOf(radio.value) !== -1;
          radio.disabled = !available;
          var label = radio.closest(".choice-chip");
          if (label) label.classList.toggle("is-unavailable", !available);
          if (!available && radio.checked) radio.checked = false;
        });
      var allRadio = filterForm.querySelector(
        'input[name="home-category"][value=""]',
      );
      if (
        allRadio &&
        !filterForm.querySelector('input[name="home-category"]:checked')
      )
        allRadio.checked = true;

      // A deep link such as listings.html?category=buy is how the homepage can
      // offer a rent door and a buy door instead of one ambiguous one. Honoured
      // only when there is supply behind it: pre-selecting a category with no
      // live home would show an empty grid, which reads as a broken filter
      // rather than as an honest "nothing listed yet". When it cannot be
      // honoured, say so - a parameter that quietly does nothing is worse than
      // either answer.
      // A chip that is greyed out with no reason next to it is the dead control
      // the blueprint warns about: the visitor cannot tell whether the site is
      // broken, whether they did something wrong, or whether there is simply
      // nothing listed. So the unavailability always explains itself - and the
      // radios point at that explanation, because a disabled control cannot be
      // focused and a screen reader would otherwise never reach it.
      var note = document.querySelector("[data-homes-category-note]");
      var unavailable = [];
      filterForm
        .querySelectorAll('input[name="home-category"]')
        .forEach(function (radio) {
          if (radio.value && radio.disabled) unavailable.push(radio.value);
          if (radio.value) {
            if (note)
              radio.setAttribute(
                "aria-describedby",
                note.id || (note.id = "homes-category-note"),
              );
            else radio.removeAttribute("aria-describedby");
          }
        });

      var word = { buy: "buy", rent: "rent" };
      if (requestedCategory && unavailable.indexOf(requestedCategory) === -1) {
        var wanted = filterForm.querySelector(
          'input[name="home-category"][value="' + requestedCategory + '"]',
        );
        if (wanted) wanted.checked = true;
        if (note) note.hidden = true;
      } else if (note && unavailable.length) {
        // The areas come from the response, not from this file. Hardcoding Lekki
        // and Ikeja in a filter is the mistake that once left a live home in
        // another area reachable only through "All pilot areas" - see the comment
        // on the area <select> in listings.html.
        var where =
          facets.launchAreas && facets.launchAreas.length
            ? facets.launchAreas.join(" or ")
            : "the pilot areas";
        note.textContent =
          "Nothing is listed to " +
          unavailable
            .map(function (c) {
              return word[c] || c;
            })
            .join(" or ") +
          " in " +
          where +
          " yet. Ask the desk about your search.";
        note.hidden = false;
      } else if (note) {
        note.hidden = true;
      }
      requestedCategory = "";
    }
    if (priceLabel) {
      priceLabel.textContent =
        selectedCategory() === "buy"
          ? "Asking price"
          : selectedCategory() === "rent"
            ? "Annual rent"
            : "Price range";
    }
    // The programme name comes from the API, so the D-010 reversal has one place
    // to be undone. "available" stays in the sentence because a label that is
    // only a brand name does not tell anyone what the box does.
    var programLabel = document.querySelector("[data-homes-program-label]");
    if (programLabel) programLabel.textContent = programName + " available";
    if (window.ileeCustomSelect)
      window.ileeCustomSelect.refresh(filterForm || document);
  }

  function applyFilters() {
    if (loadState !== "ready") return;
    updateFilterToggle();
    filteredHomes = allHomes.filter(matches);
    if (priceLabel)
      priceLabel.textContent =
        selectedCategory() === "buy"
          ? "Asking price"
          : selectedCategory() === "rent"
            ? "Annual rent"
            : "Price range";
    renderList();
    renderMap();
    renderTour();
  }

  function updateFilterToggle() {
    if (!filterToggle) return;
    var count =
      [area, type, budget].filter(function (el) {
        return el && el.value;
      }).length + (installments && installments.checked ? 1 : 0);
    var expanded = filterToggle.getAttribute("aria-expanded") === "true";
    filterToggle.querySelector("span").textContent =
      (expanded ? "Fewer filters" : "More filters") +
      (count ? " (" + count + " active)" : "");
  }

  if (filterToggle)
    filterToggle.addEventListener("click", function () {
      var expanded = filterToggle.getAttribute("aria-expanded") !== "true";
      filterToggle.setAttribute("aria-expanded", String(expanded));
      filterForm.classList.toggle("is-filter-expanded", expanded);
      updateFilterToggle();
    });

  function clearFilters() {
    if (filterForm) filterForm.reset();
    applyFilters();
    if (window.ileeCustomSelect)
      window.ileeCustomSelect.refresh(filterForm || document);
  }

  /* Approximate positions for the areas ilee actually serves. A home in an area
     this map does not know is left off the map and counted in the caption,
     rather than given a fabricated coordinate: an invented marker is a claim
     about where a real home is. */
  var AREA_POINTS = {
    ikeja: { x: 230, y: 188 },
    lekki: { x: 584, y: 327 },
    victoriaisland: { x: 470, y: 300 },
    ikoyi: { x: 430, y: 286 },
    yaba: { x: 300, y: 250 },
    surulere: { x: 250, y: 258 },
    mushin: { x: 214, y: 232 },
    agege: { x: 208, y: 132 },
    apapa: { x: 268, y: 300 },
  };

  function pointFor(home) {
    var key = String(home.launchArea || home.area || "")
      .toLowerCase()
      .replace(/[^a-z]/g, "");
    var hit = Object.keys(AREA_POINTS).find(function (known) {
      return key.indexOf(known) === 0;
    });
    return hit ? AREA_POINTS[hit] : null;
  }

  function renderMap() {
    if (!mapMarkers) return;
    mapMarkers.innerHTML = "";
    if (!filteredHomes.length) {
      if (mapTitle)
        mapTitle.textContent = allHomes.length
          ? "No live home matches this view."
          : "Waiting for the first live home.";
      if (mapCopy)
        mapCopy.textContent = allHomes.length
          ? "Clear a filter to see the broad area marker. Exact addresses stay with the desk until a viewing is arranged."
          : "The map will show a broad area only. Exact addresses stay with the desk until a viewing is arranged.";
      return;
    }
    var plotted = filteredHomes.filter(pointFor);
    var unplotted = filteredHomes.length - plotted.length;
    if (mapTitle) {
      mapTitle.textContent =
        plotted.length +
        (plotted.length === 1 ? " live home area" : " live home areas");
    }
    if (mapCopy) {
      mapCopy.textContent =
        (plotted.length
          ? "Markers are approximate and intentionally broad. The desk confirms the exact viewing address after availability is checked."
          : "These homes are outside the areas this map covers.") +
        (unplotted
          ? " " +
            unplotted +
            " live " +
            (unplotted === 1 ? "home is" : "homes are") +
            " not plotted rather than given a guessed position."
          : "");
    }
    plotted.forEach(function (home) {
      var point = pointFor(home);
      var group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.setAttribute("class", "map-marker");
      group.setAttribute(
        "transform",
        "translate(" + point.x + " " + point.y + ")",
      );
      var label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "title",
      );
      label.textContent = home.launchArea || home.area || "Live home";
      group.appendChild(label);
      group.innerHTML +=
        '<circle r="15"></circle><circle class="map-marker__core" r="4"></circle>';
      mapMarkers.appendChild(group);
    });
  }

  /* The tour panel shows real inspection photographs when a listing has them,
     and says plainly that it is a placeholder when it does not. SRS 3.1 asks for
     3D virtual tours; those are deferred with the rest of blueprint.md:71, and
     this panel is the honest interim: a room-by-room sequence from the same
     evidence that qualified the home to be published. */
  function renderTour() {
    if (!tourTitle || !tourCopy) return;
    var home = filteredHomes.find(function (h) {
      return (h.photos || []).length;
    });

    var scenes = document.querySelector("[data-photo-scenes]");
    if (scenes) scenes.innerHTML = "";
    if (!home) {
      tourTitle.textContent = filteredHomes.length
        ? "No published photographs yet."
        : "Choose a live home to see its rooms.";
      tourCopy.textContent =
        "Photographs come from the inspection that qualified the home to be listed. " +
        "No stock image is used in place of a photograph of the home.";
      if (tourStage) {
        tourStage.innerHTML = "";
        tourStage.hidden = true;
      }
      if (tourPlaceholder) tourPlaceholder.hidden = false;
      return;
    }

    tourTitle.textContent =
      "Walk " +
      [home.launchArea || home.area, home.homeType].filter(Boolean).join(" ") +
      ".";
    tourCopy.textContent =
      "Every photograph below was taken during the inspection that published this home. " +
      "The desk confirms availability before a viewing.";
    if (tourPlaceholder) tourPlaceholder.hidden = true;
    if (scenes)
      scenes.innerHTML = home.photos
        .map(function (photo, index) {
          return (
            '<li class="' +
            (index === 0 ? "is-current" : "") +
            '"><button type="button" data-tour-scene="' +
            esc(photo.room || "Photo " + (index + 1)) +
            '" data-tour-index="' +
            index +
            '" aria-pressed="' +
            (index === 0) +
            '">' +
            esc(photo.room || "Photo " + (index + 1)) +
            "</button></li>"
          );
        })
        .join("");
    if (tourStage) {
      tourStage.hidden = false;
      tourStage.innerHTML = home.photos
        .map(function (photo, index) {
          return (
            '<figure class="tour-frame' +
            (index === 0 ? " is-current" : "") +
            '">' +
            '<img src="' +
            esc(photo.url) +
            '?w=1200" alt="' +
            esc(photo.room || "Room") +
            ' at this home"' +
            ' loading="lazy" decoding="async" width="1200" height="800">' +
            "<figcaption>" +
            esc(photo.room || "Room " + (index + 1)) +
            "</figcaption>" +
            "</figure>"
          );
        })
        .join("");
    }
  }

  function setView(view) {
    activeView = view;
    document.querySelectorAll("[data-homes-view]").forEach(function (button) {
      var selected = button.getAttribute("data-homes-view") === view;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-selected", selected ? "true" : "false");
      button.tabIndex = selected ? 0 : -1;
    });
    document
      .querySelectorAll("[data-homes-view-panel]")
      .forEach(function (panel) {
        panel.hidden = panel.getAttribute("data-homes-view-panel") !== view;
      });
  }

  function load() {
    loadState = "loading";
    setContent(skeletons(3));
    if (summary) summary.textContent = "Loading live homes...";
    if (!window.fetch) {
      setContent(errorState());
      return;
    }

    fetch("/api/v1/homes", { headers: { accept: "application/json" } })
      .then(function (res) {
        if (!res.ok) return Promise.reject(res.status);
        return res.json();
      })
      .then(function (body) {
        allHomes = (body && body.homes) || [];
        facets = (body && body.facets) || {
          categories: [],
          launchAreas: [],
          homeTypes: [],
        };
        launchAreas = (body && body.launchAreas) || [];
        programName =
          (body && body.installmentProgram && body.installmentProgram.name) ||
          "installments";
        loadState = "ready";
        populateFacets();
        applyFilters();
        setView(activeView);
      })
      .catch(function () {
        loadState = "error";
        allHomes = [];
        filteredHomes = [];
        setContent(errorState());
        renderMap();
        renderTour();
        if (mapTitle) mapTitle.textContent = "The live record is unavailable.";
        if (tourTitle)
          tourTitle.textContent = "The live record is unavailable.";
        if (summary) summary.textContent = "The live record is unavailable";
      });
  }

  if (filterForm) {
    filterForm.addEventListener("input", function (event) {
      if (event.target === search) applyFilters();
    });
    filterForm.addEventListener("change", function (event) {
      if (event.target !== search) applyFilters();
    });
    filterForm.addEventListener("reset", function () {
      window.setTimeout(applyFilters, 0);
    });
  }
  var reset = document.querySelector("[data-homes-reset]");
  if (reset) reset.addEventListener("click", clearFilters);
  grid.addEventListener("click", function (event) {
    var save = event.target.closest("[data-save-listing]");
    if (save) {
      var id = save.getAttribute("data-save-listing");
      var index = savedHomes.indexOf(id);
      if (index === -1) savedHomes.push(id);
      else savedHomes.splice(index, 1);
      try {
        sessionStorage.setItem(
          "ilee.homes.shortlist",
          JSON.stringify(savedHomes),
        );
      } catch (_) {}
      var nowSaved = index === -1;
      save.setAttribute("aria-pressed", String(nowSaved));
      save.setAttribute(
        "aria-label",
        save
          .getAttribute("aria-label")
          .replace(
            /^(Add to|Remove from)/,
            nowSaved ? "Remove from" : "Add to",
          ),
      );
    }
    if (event.target.closest("[data-homes-retry]")) load();
    if (event.target.closest("[data-homes-clear]")) clearFilters();
  });
  document.querySelectorAll("[data-homes-view]").forEach(function (button) {
    button.addEventListener("click", function () {
      setView(button.getAttribute("data-homes-view"));
    });
    button.addEventListener("keydown", function (event) {
      var buttons = Array.from(document.querySelectorAll("[data-homes-view]"));
      var index = buttons.indexOf(button);
      var next =
        event.key === "ArrowRight"
          ? (index + 1) % buttons.length
          : event.key === "ArrowLeft"
            ? (index + buttons.length - 1) % buttons.length
            : event.key === "Home"
              ? 0
              : event.key === "End"
                ? buttons.length - 1
                : -1;
      if (next >= 0) {
        event.preventDefault();
        buttons[next].click();
        buttons[next].focus();
      }
    });
  });
  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-tour-scene]");
    if (!button) return;
    document.querySelectorAll("[data-tour-scene]").forEach(function (scene) {
      var selected = scene === button;
      scene.closest("li").classList.toggle("is-current", selected);
      scene.setAttribute("aria-pressed", String(selected));
    });
    var index = Number(button.getAttribute("data-tour-index") || 0);
    if (tourStage)
      tourStage.querySelectorAll(".tour-frame").forEach(function (frame, i) {
        frame.classList.toggle("is-current", i === index);
      });
  });

  setView("list");
  load();
})();
