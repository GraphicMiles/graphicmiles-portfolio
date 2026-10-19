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

    document.documentElement.classList.add("motion-on");

    // The final hero word flips between three honest job descriptions.
    var role = document.querySelector("[data-role-words]");
    if (role) {
        var words = role.getAttribute("data-role-words").split("|").filter(Boolean);
        var roleIndex = 0;
        var flipping = false;
        if (words.length > 1) {
            window.setInterval(function () {
                if (document.hidden || flipping) return;
                flipping = true;
                role.classList.add("is-flipping");
                window.setTimeout(function () {
                    roleIndex = (roleIndex + 1) % words.length;
                    role.textContent = words[roleIndex];
                    role.classList.remove("is-flipping");
                    flipping = false;
                }, 190);
            }, 2600);
        }
    }

    // Mark the pieces that should bounce in as each section arrives.
    function revealGroup(selector, variant, baseDelay, alternateSides) {
        var counters = new WeakMap();
        document.querySelectorAll(selector).forEach(function (el) {
            var parent = el.parentElement || body;
            var index = counters.get(parent) || 0;
            counters.set(parent, index + 1);
            var chosen = alternateSides ? (index % 2 ? "right" : "left") : variant;
            el.classList.add("rv", "rv-" + chosen);
            el.style.setProperty("--d", (baseDelay + (index % 6) * 75) + "ms");
            el.style.setProperty("--r", index % 2 ? "1.4deg" : "-1.4deg");
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
    revealEls.forEach(function (el) {
        el.addEventListener("animationend", function (event) {
            if (event.target !== el) return;
            el.classList.remove("rv", "rv-up", "rv-left", "rv-right", "rv-pop", "rv-zoom", "is-in");
            el.style.removeProperty("--d");
            el.style.removeProperty("--r");
        }, { once: true });
    });

    if ("IntersectionObserver" in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-in");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
        revealEls.forEach(function (el) { observer.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add("is-in"); });
    }

    // A soft ink ripple replaces the browser's default blue tap flash.
    function addRipple(event) {
        if (!event.target.closest) return;
        var target = event.target.closest(".btn, .link-card, .acc-head, .socials a, .menu-btn, .side-close");
        if (!target) return;
        var rect = target.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height) * 1.2;
        var ripple = document.createElement("span");
        ripple.className = "tap-ripple";
        ripple.setAttribute("aria-hidden", "true");
        ripple.style.width = size + "px";
        ripple.style.height = size + "px";
        ripple.style.left = (event.clientX - rect.left - size / 2) + "px";
        ripple.style.top = (event.clientY - rect.top - size / 2) + "px";
        target.appendChild(ripple);
        window.setTimeout(function () { ripple.remove(); }, 650);
    }

    // Cards squash a little when tapped, then bounce back.
    function popCard(event) {
        if (!event.target.closest) return;
        var card = event.target.closest(".list-card, .project-card, .acc-item, .philosophy-photo, .hero-photo");
        if (!card) return;
        card.classList.remove("tap-pop");
        void card.offsetWidth;
        card.classList.add("tap-pop");
        window.setTimeout(function () { card.classList.remove("tap-pop"); }, 430);
    }

    document.addEventListener("pointerdown", addRipple, { passive: true });
    document.addEventListener("pointerdown", popCard, { passive: true });

    // Desktop cards lean toward the cursor. Touch devices keep the tap pop.
    if (finePointer.matches) {
        document.querySelectorAll(".list-card, .project-card, .link-card").forEach(function (card) {
            card.addEventListener("pointermove", function (event) {
                var rect = card.getBoundingClientRect();
                var px = (event.clientX - rect.left) / rect.width - 0.5;
                var py = (event.clientY - rect.top) / rect.height - 0.5;
                card.style.setProperty("--rx", (-py * 4).toFixed(2) + "deg");
                card.style.setProperty("--ry", (px * 5).toFixed(2) + "deg");
            });
            card.addEventListener("pointerleave", function () {
                card.style.removeProperty("--rx");
                card.style.removeProperty("--ry");
            });
        });
    }
})();
