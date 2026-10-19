// Side navigation + Experiences accordion (cloned layout interactions).
(function () {
    "use strict";

    var body = document.body;

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
})();
