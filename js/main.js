// Side navigation, Experiences accordion and the playful motion system.
(function () {
    "use strict";

    var body = document.body;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    function setNav(open) {
        body.classList.toggle("nav-open", open);
        document.querySelectorAll("[data-menu-btn]").forEach(function (btn) {
            btn.setAttribute("aria-expanded", open ? "true" : "false");
        });
        var nav = document.querySelector("[data-side-nav]");
        if (nav) nav.setAttribute("aria-hidden", open ? "false" : "true");
    }

    document.querySelectorAll("[data-menu-btn]").forEach(function (btn) {
        btn.addEventListener("click", function () { setNav(true); });
    });
    document.querySelectorAll("[data-nav-close]").forEach(function (el) {
        el.addEventListener("click", function () { setNav(false); });
    });
    document.querySelectorAll(".side-links a, .side-body .btn").forEach(function (a) {
        a.addEventListener("click", function () { setNav(false); });
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") setNav(false);
    });

    document.querySelectorAll(".acc-item").forEach(function (item) {
        var head = item.querySelector(".acc-head");
        if (!head) return;
        head.addEventListener("click", function () {
            var open = item.classList.toggle("open");
            head.setAttribute("aria-expanded", open ? "true" : "false");
        });
    });

    if (reduceMotion.matches) return;

    // The inline boot script adds this before first paint. Re-adding an
    // existing class does not restart CSS animations.
    document.documentElement.classList.add("motion-on");

    // The hero portrait gets one entrance only. Once that entrance is done,
    // remove its animation so later class changes cannot replay it.
    var heroPhoto = document.querySelector(".hero-photo");
    if (heroPhoto) {
        var settleHeroPhoto = function () {
            heroPhoto.classList.add("is-entered");
        };
        heroPhoto.addEventListener("animationend", function (event) {
            if (event.target === heroPhoto && event.animationName === "heroPhotoIn") {
                settleHeroPhoto();
            }
        });
        window.setTimeout(function () {
            var stillRunning = false;
            if (heroPhoto.getAnimations) {
                stillRunning = heroPhoto.getAnimations().some(function (animation) {
                    return animation.animationName === "heroPhotoIn" && animation.playState === "running";
                });
            }
            if (!stillRunning) settleHeroPhoto();
        }, 1300);
    }

    // The final hero word flips only while the hero is actually visible.
    var role = document.querySelector("[data-role-words]");
    if (role) {
        var words = role.getAttribute("data-role-words").split("|").filter(Boolean);
        var roleIndex = 0;
        var roleCycleTimer = 0;
        var roleFlipTimer = 0;
        var roleFlipping = false;
        var heroVisible = true;

        var stopRoleCycle = function () {
            if (roleCycleTimer) window.clearTimeout(roleCycleTimer);
            if (roleFlipTimer) window.clearTimeout(roleFlipTimer);
            roleCycleTimer = 0;
            roleFlipTimer = 0;
            roleFlipping = false;
            role.classList.remove("is-flipping");
        };

        var scheduleRole = function (delay) {
            if (words.length <= 1 || document.hidden || !heroVisible || roleFlipping || roleCycleTimer) return;
            roleCycleTimer = window.setTimeout(flipRole, delay);
        };

        var flipRole = function () {
            roleCycleTimer = 0;
            if (document.hidden || !heroVisible || roleFlipping) return;
            roleFlipping = true;
            role.classList.add("is-flipping");
            roleFlipTimer = window.setTimeout(function () {
                roleFlipTimer = 0;
                roleIndex = (roleIndex + 1) % words.length;
                role.textContent = words[roleIndex];
                role.classList.remove("is-flipping");
                roleFlipping = false;
                scheduleRole(2400);
            }, 190);
        };

        scheduleRole(2600);

        var hero = document.querySelector(".hero");
        if (hero && "IntersectionObserver" in window) {
            new IntersectionObserver(function (entries) {
                heroVisible = entries[0].isIntersecting;
                if (heroVisible) scheduleRole(900);
                else stopRoleCycle();
            }, { threshold: 0.25 }).observe(hero);
        }

        document.addEventListener("visibilitychange", function () {
            if (document.hidden) stopRoleCycle();
            else scheduleRole(900);
        });
    }

    // Reveal state is explicit. An element moves pending -> running -> done.
    // Child animationend events are ignored, and a fallback timer guarantees
    // cleanup even if a browser drops an animation event.
    var revealStates = new WeakMap();
    var revealAnimationNames = {
        up: "rvUp",
        left: "rvLeft",
        right: "rvRight",
        pop: "rvPop",
        zoom: "rvPop"
    };

    function finishReveal(el) {
        var state = revealStates.get(el);
        if (!state || state.done) return;
        state.done = true;
        if (state.timer) window.clearTimeout(state.timer);
        if (state.onEnd) {
            el.removeEventListener("animationend", state.onEnd);
            el.removeEventListener("animationcancel", state.onEnd);
        }
        el.classList.remove("rv", "rv-up", "rv-left", "rv-right", "rv-pop", "rv-zoom", "is-in");
        el.removeAttribute("data-reveal-state");
        el.style.removeProperty("--d");
        el.style.removeProperty("--r");
    }

    function handleRevealEnd(el, event) {
        var state = revealStates.get(el);
        if (!state || state.done) return;
        if (event.target !== el || event.animationName !== state.animation) return;
        finishReveal(el);
    }

    function isRevealBusy(el) {
        if (!el) return false;
        var state = revealStates.get(el);
        return !!(state && !state.done);
    }

    function startReveal(el) {
        var state = revealStates.get(el);
        if (!state || state.done || el.getAttribute("data-reveal-state") !== "pending") return;
        el.setAttribute("data-reveal-state", "running");
        el.classList.add("is-in");
        state.timer = window.setTimeout(function () {
            finishReveal(el);
        }, state.delay + 1050);
    }

    function revealGroup(selector, variant, baseDelay, alternateSides) {
        var counters = new WeakMap();
        document.querySelectorAll(selector).forEach(function (el) {
            var parent = el.parentElement || body;
            var index = counters.get(parent) || 0;
            counters.set(parent, index + 1);
            var chosen = alternateSides ? (index % 2 ? "right" : "left") : variant;
            var delay = baseDelay + (index % 6) * 65;
            var state = {
                done: false,
                delay: delay,
                animation: revealAnimationNames[chosen] || "rvUp",
                timer: 0,
                onEnd: null
            };
            state.onEnd = function (event) { handleRevealEnd(el, event); };
            revealStates.set(el, state);
            el.setAttribute("data-reveal-state", "pending");
            el.classList.add("rv", "rv-" + chosen);
            el.style.setProperty("--d", delay + "ms");
            el.style.setProperty("--r", index % 2 ? "1.4deg" : "-1.4deg");
            el.addEventListener("animationend", state.onEnd);
            el.addEventListener("animationcancel", state.onEnd);
        });
    }

    revealGroup(".section .eyebrow", "pop", 0, false);
    revealGroup(".section h2", "up", 80, false);
    revealGroup(".section-sub", "up", 160, false);
    revealGroup(".acc-item", "up", 0, true);
    revealGroup(".list-card", "pop", 0, false);
    revealGroup(".project-card", "pop", 0, false);
    revealGroup(".link-card", "up", 0, false);
    revealGroup(".philosophy-text p, .philosophy-text .btn", "left", 0, false);
    revealGroup(".philosophy-photo", "right", 120, false);
    revealGroup(".footer-logo, .footer-bar", "up", 0, false);
    revealGroup(".socials li", "pop", 0, false);

    var revealEls = document.querySelectorAll(".rv");
    if ("IntersectionObserver" in window) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                revealObserver.unobserve(entry.target);
                startReveal(entry.target);
            });
        }, { threshold: 0.01, rootMargin: "15% 0px 20% 0px" });
        revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
        revealEls.forEach(startReveal);
    }

    // Desktop tilt is cleared as soon as the page scrolls. A card that moves
    // under a stationary cursor must not keep a stale tilt.
    var tiltedCards = new Set();
    var tiltFrames = new WeakMap();

    function clearTilt(card) {
        if (!card) return;
        var frame = tiltFrames.get(card);
        if (frame) window.cancelAnimationFrame(frame);
        tiltFrames.delete(card);
        card.style.removeProperty("--rx");
        card.style.removeProperty("--ry");
        tiltedCards.delete(card);
    }

    function clearAllTilts() {
        Array.from(tiltedCards).forEach(clearTilt);
    }

    // Hover effects should follow the pointer, not the scrollbar. While the
    // page is moving under a stationary cursor, suppress hover motion and
    // clear any stale tilt. Actual pointer movement re-enables hover.
    window.addEventListener("scroll", function () {
        document.documentElement.classList.add("is-scrolling");
        clearAllTilts();
    }, { passive: true });
    document.addEventListener("pointermove", function () {
        document.documentElement.classList.remove("is-scrolling");
    }, { passive: true });

    if (finePointer.matches) {
        document.querySelectorAll(".list-card, .project-card, .link-card").forEach(function (card) {
            card.addEventListener("pointermove", function (event) {
                if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
                if (isRevealBusy(card) || card.classList.contains("tap-pop")) {
                    clearTilt(card);
                    return;
                }
                if (tiltFrames.has(card)) return;
                var clientX = event.clientX;
                var clientY = event.clientY;
                var frame = window.requestAnimationFrame(function () {
                    tiltFrames.delete(card);
                    if (isRevealBusy(card) || card.classList.contains("tap-pop") || !card.matches(":hover")) {
                        clearTilt(card);
                        return;
                    }
                    var rect = card.getBoundingClientRect();
                    if (!rect.width || !rect.height) return;
                    var px = (clientX - rect.left) / rect.width - 0.5;
                    var py = (clientY - rect.top) / rect.height - 0.5;
                    card.style.setProperty("--rx", (-py * 4).toFixed(2) + "deg");
                    card.style.setProperty("--ry", (px * 5).toFixed(2) + "deg");
                    tiltedCards.add(card);
                });
                tiltFrames.set(card, frame);
            });
            card.addEventListener("pointerleave", function () { clearTilt(card); });
            card.addEventListener("pointercancel", function () { clearTilt(card); });
        });
        window.addEventListener("blur", clearAllTilts);
    }

    // Tap effects run only after a real tap is confirmed on pointerup.
    // A scroll gesture starts with pointerdown too, so pointerdown alone is
    // not proof of a tap. Movement, cancellation and long presses disqualify it.
    var interactiveSelector = ".btn, .link-card, .acc-head, .socials a, .menu-btn, .side-close";
    var cardSelector = ".list-card, .project-card, .link-card, .acc-item, .philosophy-photo";
    var activePointers = new Map();
    var tapTimers = new WeakMap();

    function pointerNow() {
        return window.performance && performance.now ? performance.now() : Date.now();
    }

    function closestFromEvent(event, selector) {
        var target = event.target;
        return target && target.closest ? target.closest(selector) : null;
    }

    function spawnRipple(target, clientX, clientY) {
        if (!target || isRevealBusy(target)) return;
        var rect = target.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        var size = Math.max(rect.width, rect.height) * 1.2;
        var ripple = document.createElement("span");
        ripple.className = "tap-ripple";
        ripple.setAttribute("aria-hidden", "true");
        ripple.style.width = size + "px";
        ripple.style.height = size + "px";
        ripple.style.left = (clientX - rect.left - size / 2) + "px";
        ripple.style.top = (clientY - rect.top - size / 2) + "px";
        target.appendChild(ripple);
        var removeRipple = function () { ripple.remove(); };
        ripple.addEventListener("animationend", removeRipple, { once: true });
        window.setTimeout(removeRipple, 700);
    }

    function triggerTapPop(card) {
        if (!card || isRevealBusy(card) || card.classList.contains("tap-pop")) return;
        card.classList.add("tap-pop");
        var timer = window.setTimeout(function () {
            card.classList.remove("tap-pop");
            tapTimers.delete(card);
        }, 460);
        tapTimers.set(card, timer);
    }

    document.addEventListener("pointerdown", function (event) {
        if (event.isPrimary === false) return;
        if (event.pointerType !== "touch" && event.button !== 0) return;
        var interactive = closestFromEvent(event, interactiveSelector);
        var card = closestFromEvent(event, cardSelector);
        if (!interactive && !card) return;
        if (card) clearTilt(card);
        activePointers.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
            time: pointerNow(),
            interactive: interactive,
            card: card,
            cancelled: false
        });
    }, { passive: true });

    document.addEventListener("pointermove", function (event) {
        var record = activePointers.get(event.pointerId);
        if (!record) return;
        var dx = event.clientX - record.x;
        var dy = event.clientY - record.y;
        if (dx * dx + dy * dy > 144) record.cancelled = true;
    }, { passive: true });

    document.addEventListener("pointercancel", function (event) {
        activePointers.delete(event.pointerId);
    }, { passive: true });

    document.addEventListener("pointerup", function (event) {
        var record = activePointers.get(event.pointerId);
        activePointers.delete(event.pointerId);
        if (!record || record.cancelled) return;
        if (pointerNow() - record.time > 700) return;
        var dx = event.clientX - record.x;
        var dy = event.clientY - record.y;
        if (dx * dx + dy * dy > 144) return;

        if (record.interactive && record.interactive.contains(event.target)) {
            spawnRipple(record.interactive, event.clientX, event.clientY);
        }
        if (record.card && record.card.contains(event.target)) {
            triggerTapPop(record.card);
        }
    }, { passive: true });
})();
