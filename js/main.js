(function () {
  "use strict";

  // 1. Accessible accordion disclosure for Experiences
  var triggers = document.querySelectorAll(".exp-trigger");

  function setExpanded(trigger, open) {
    var item = trigger.closest(".exp-item");
    if (!item) return;
    trigger.setAttribute("aria-expanded", open ? "true" : "false");
    item.setAttribute("data-open", open ? "true" : "false");
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var isOpen = trigger.getAttribute("aria-expanded") === "true";
      setExpanded(trigger, !isOpen);
    });

    trigger.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && trigger.getAttribute("aria-expanded") === "true") {
        setExpanded(trigger, false);
        trigger.focus();
      }
    });
  });

  // 2. Scroll-entry choreography via IntersectionObserver (never scroll listeners)
  var revealNodes = document.querySelectorAll("[data-reveal]");
  var allowsMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

  if (!allowsMotion || !revealNodes.length || typeof IntersectionObserver !== "function") {
    revealNodes.forEach(function (node) {
      node.classList.add("is-visible");
    });
    return;
  }

  document.documentElement.classList.add("motion-ready");

  var observer = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -6% 0px",
      threshold: 0.06
    }
  );

  revealNodes.forEach(function (node) {
    var rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.96) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          node.classList.add("is-visible");
        });
      });
    } else {
      observer.observe(node);
    }
  });
})();
