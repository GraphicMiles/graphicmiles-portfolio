(function () {
    const EMAIL = "rfarouq69@gmail.com";
    const root = document.documentElement.getAttribute("data-root") || "";

    const dockIcons = {
        Home: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"25\" height=\"25\" viewBox=\"0 0 24 24\" fill=\"none\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M2.5192 7.82274C2 8.77128 2 9.91549 2 12.2039V13.725C2 17.6258 2 19.5763 3.17157 20.7881C4.34315 22 6.22876 22 10 22H14C17.7712 22 19.6569 22 20.8284 20.7881C22 19.5763 22 17.6258 22 13.725V12.2039C22 9.91549 22 8.77128 21.4808 7.82274C20.9616 6.87421 20.0131 6.28551 18.116 5.10812L16.116 3.86687C14.1106 2.62229 13.1079 2 12 2C10.8921 2 9.88939 2.62229 7.88403 3.86687L5.88403 5.10813C3.98695 6.28551 3.0384 6.87421 2.5192 7.82274ZM9 17.25C8.58579 17.25 8.25 17.5858 8.25 18C8.25 18.4142 8.58579 18.75 9 18.75H15C15.4142 18.75 15.75 18.4142 15.75 18C15.75 17.5858 15.4142 17.25 15 17.25H9Z\" fill=\"currentColor\"></path></svg>",
        Projects: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"25\" height=\"25\" viewBox=\"0 0 24 24\" fill=\"none\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M10.2755 2.25503C10.359 2.24997 10.4474 2.24998 10.5609 2.25H13.4395C13.553 2.24998 13.6413 2.24997 13.7249 2.25503C14.7853 2.31926 15.7139 2.98855 16.1102 3.97426C16.1414 4.05194 16.1694 4.13581 16.2052 4.24347L16.2083 4.25254C16.2916 4.47692 16.4829 4.73205 16.7506 4.93589C16.7804 4.95858 16.8104 4.98 16.8403 5.00017C18.9942 5.00268 20.1185 5.04245 20.8934 5.67298C21.0524 5.80233 21.1977 5.94763 21.327 6.10659C22 6.9337 22 8.15877 22 10.6089C22 11.2307 22 11.5415 21.8492 11.784C21.8199 11.8312 21.7866 11.8759 21.7498 11.9176C21.5609 12.1317 21.2631 12.2211 20.6676 12.3997L16 13.8V13C16 11.8954 15.1046 11 14 11H10C8.89543 11 8 11.8954 8 13V13.8L3.3324 12.3997C2.7369 12.2211 2.43915 12.1317 2.25021 11.9176C2.21341 11.8759 2.18015 11.8312 2.15078 11.784C2 11.5415 2 11.2307 2 10.6089C2 8.15877 2 6.9337 2.67298 6.10659C2.80233 5.94763 2.94763 5.80233 3.10659 5.67298C3.88153 5.04245 5.00582 5.00268 7.15973 5.00017C7.18968 4.97999 7.21961 4.95855 7.24943 4.93586C7.51728 4.73199 7.70854 4.47684 7.79189 4.25251C7.82984 4.13863 7.85823 4.05369 7.89017 3.97425C8.28643 2.98855 9.21502 2.31926 10.2755 2.25503ZM14.8187 4.81811C14.8429 4.87968 14.8695 4.94034 14.8984 5H9.10172C9.13059 4.94044 9.1572 4.87988 9.18135 4.81842L9.1829 4.81492L9.18707 4.80502L9.19194 4.7929L9.19652 4.78093L9.20016 4.77098L9.20194 4.76597L9.20618 4.75373L9.21001 4.74244L9.2121 4.73617L9.21483 4.72783L9.21707 4.72079L9.21886 4.71502C9.25769 4.59872 9.27037 4.56246 9.28191 4.53375C9.46203 4.08571 9.88412 3.78148 10.3661 3.75229C10.3984 3.75034 10.4379 3.75 10.5813 3.75H13.419C13.5624 3.75 13.602 3.75034 13.6342 3.75229C14.1162 3.78148 14.5383 4.08571 14.7185 4.53375C14.7298 4.56204 14.7419 4.59698 14.7813 4.71499L14.783 4.72071L14.7853 4.72778L14.788 4.73614L14.7901 4.74239L14.7939 4.75366L14.7982 4.76588L14.7999 4.77089L14.8036 4.78081L14.8081 4.79271L14.813 4.80471L14.8171 4.81449L14.8187 4.81811ZM14 12.5H10C9.72386 12.5 9.5 12.7239 9.5 13V15.1615C9.5 15.3659 9.62448 15.5498 9.8143 15.6257L10.5144 15.9058C11.4681 16.2872 12.5319 16.2872 13.4856 15.9058L14.1857 15.6257C14.3755 15.5498 14.5 15.3659 14.5 15.1615V13C14.5 12.7239 14.2761 12.5 14 12.5ZM8.01076 15.3691L3.00586 13.8677C3.03595 16.9822 3.21789 19.8505 4.31792 20.8283C5.63593 21.9998 7.75726 21.9998 11.9999 21.9998C16.2425 21.9998 18.3639 21.9998 19.6819 20.8283C20.7819 19.8505 20.9638 16.9822 20.9939 13.8677L15.9892 15.3691C15.913 16.1018 15.4372 16.7407 14.7428 17.0184L14.0426 17.2985C12.7314 17.823 11.2686 17.823 9.95735 17.2985L9.25722 17.0184C8.5628 16.7407 8.08702 16.1018 8.01076 15.3691Z\" fill=\"currentColor\"></path></svg>",
        Github: "<svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12\"></path></svg>",
        Contact: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"25\" height=\"25\" viewBox=\"0 0 24 24\" fill=\"none\"><path d=\"M9.5 20V22C9.5 22.4142 9.83579 22.75 10.25 22.75C10.6642 22.75 11 22.4142 11 22V20H9.5Z\" fill=\"currentColor\"></path><path d=\"M15 20H13.5V22C13.5 22.4142 13.8358 22.75 14.25 22.75C14.6642 22.75 15 22.4142 15 22V20Z\" fill=\"currentColor\"></path><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M17.3846 6.58471L17.6407 6.53344C18.0564 6.45022 18.4863 6.48995 18.8814 6.64813C19.5717 6.92453 20.3266 6.97616 21.0458 6.79618L21.1073 6.7808C21.6309 6.64975 22 6.16299 22 5.60336V3.47284C22 2.73503 21.3358 2.19145 20.6454 2.36421C20.249 2.46342 19.8329 2.43496 19.4523 2.28261L19.3793 2.25335C18.7422 1.99828 18.0491 1.93421 17.3787 2.06841L16.93 2.15824C16.3901 2.26632 16 2.75722 16 3.32846V10.2807C16 10.678 16.31 11 16.6923 11C17.0747 11 17.3846 10.678 17.3846 10.2807V6.58471Z\" fill=\"currentColor\"></path><path d=\"M14.5 6V10.2807C14.5 11.4518 15.428 12.5 16.6923 12.5C17.9566 12.5 18.8846 11.4518 18.8846 10.2807V8.22795C19.6455 8.43335 20.4446 8.45735 21.22 8.29496C21.7122 9.13671 22 10.1541 22 11.25V17.4253C22 18.8473 21.0119 20 19.7931 20H12.5V11.25C12.5 9.22014 11.6679 7.27604 10.2826 6H14.5Z\" fill=\"currentColor\"></path><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M2 11.25C2 8.35051 4.01472 6 6.5 6C8.98528 6 11 8.35051 11 11.25V20H4.23256C2.99955 20 2 18.8339 2 17.3953V11.25ZM4.25 16C4.25 15.5858 4.58579 15.25 5 15.25H8C8.41421 15.25 8.75 15.5858 8.75 16C8.75 16.4142 8.41421 16.75 8 16.75H5C4.58579 16.75 4.25 16.4142 4.25 16Z\" fill=\"currentColor\"></path></svg>",
        Resume: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"25\" height=\"25\" viewBox=\"0 0 24 24\" fill=\"none\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M4.17157 3.17157C3 4.34315 3 6.22876 3 10V14C3 17.7712 3 19.6569 4.17157 20.8284C5.34315 22 7.22876 22 11 22H13C16.7712 22 18.6569 22 19.8284 20.8284C21 19.6569 21 17.7712 21 14V10C21 6.22876 21 4.34315 19.8284 3.17157C18.6569 2 16.7712 2 13 2H11C7.22876 2 5.34315 2 4.17157 3.17157ZM7.25 8C7.25 7.58579 7.58579 7.25 8 7.25H16C16.4142 7.25 16.75 7.58579 16.75 8C16.75 8.41421 16.4142 8.75 16 8.75H8C7.58579 8.75 7.25 8.41421 7.25 8ZM7.25 12C7.25 11.5858 7.58579 11.25 8 11.25H16C16.4142 11.25 16.75 11.5858 16.75 12C16.75 12.4142 16.4142 12.75 16 12.75H8C7.58579 12.75 7.25 12.4142 7.25 12ZM8 15.25C7.58579 15.25 7.25 15.5858 7.25 16C7.25 16.4142 7.58579 16.75 8 16.75H13C13.4142 16.75 13.75 16.4142 13.75 16C13.75 15.5858 13.4142 15.25 13 15.25H8Z\" fill=\"currentColor\"></path></svg>"
    };

    function mountDock() {
        const existing = document.querySelector(".dock-wrap");
        if (existing) return;
        const page = document.body.dataset.page || "home";
        const homeHref = root + "index.html";
        const projectsHref = page === "case" ? "index.html" : root + "projects/index.html";
        const contactHref = page === "home" ? "#contact" : root + "index.html#contact";
        const resumeHref = "https://x.com/DSGNBYMILES";

        const items = [
            { key: "Home", href: homeHref, label: "Home" },
            { key: "Projects", href: projectsHref, label: "Projects" },
            { key: "Github", href: "https://github.com/GraphicMiles", label: "Github", external: true },
            { key: "Contact", href: contactHref, label: "Contact" },
            { key: "Resume", href: resumeHref, label: "X", divider: true, external: true }
        ];

        const wrap = document.createElement("div");
        wrap.className = "dock-wrap";
        const nav = document.createElement("nav");
        nav.className = "dock";
        items.forEach((item) => {
            if (item.divider) {
                const d = document.createElement("div");
                d.className = "dock-divider";
                nav.appendChild(d);
            }
            const a = document.createElement("a");
            a.className = "dock-item";
            a.dataset.key = item.key;
            a.href = item.href;
            a.setAttribute("aria-label", item.label);
            if (item.external) {
                a.target = "_blank";
                a.rel = "noopener noreferrer";
            }
            a.innerHTML = dockIcons[item.key] + "<span>" + item.label + "</span>";
            nav.appendChild(a);
        });
        wrap.appendChild(nav);
        document.body.appendChild(wrap);
        updateDock();
        window.addEventListener("scroll", updateDock, { passive: true });
        window.addEventListener("resize", updateDock);
    }

    function updateDock() {
        const page = document.body.dataset.page || "home";
        let active = "Home";
        if (page === "projects" || page === "case") active = "Projects";
        const contact = document.getElementById("contact");
        if (page === "home") {
            const projects = document.getElementById("projects");
            const y = window.scrollY + window.innerHeight * 0.45;
            const contactTop = contact ? contact.getBoundingClientRect().top + window.scrollY : Infinity;
            const projectsTop = projects ? projects.getBoundingClientRect().top + window.scrollY : Infinity;
            if (y >= contactTop) active = "Contact";
            else if (y >= projectsTop) active = "Projects";
            else active = "Home";
        }
        document.querySelectorAll(".dock-item").forEach((el) => {
            el.classList.toggle("active", el.dataset.key === active);
        });

        const dock = document.querySelector(".dock");
        if (dock && contact) {
            const dockRect = dock.getBoundingClientRect();
            const contactRect = contact.getBoundingClientRect();
            const overlaps = dockRect.bottom > contactRect.top + 8 && dockRect.top < contactRect.bottom - 8;
            dock.classList.toggle("on-dark", overlaps);
        }
    }

    function bindWordmark() {
        const letters = document.querySelectorAll(".wordmark-letters span");
        const wrap = document.querySelector(".wordmark");
        if (!wrap || !letters.length) return;

        function setWeights(center) {
            letters.forEach((el, i) => {
                const dist = center === null ? 99 : Math.abs(i - center);
                let w = 300;
                if (dist === 0) w = 700;
                else if (dist === 1) w = 540;
                else if (dist === 2) w = 400;
                el.style.fontVariationSettings = `"wght" ${w}, "opsz" 144`;
            });
        }

        wrap.addEventListener("mousemove", (e) => {
            let nearest = 0;
            let best = Infinity;
            letters.forEach((el, i) => {
                const r = el.getBoundingClientRect();
                const mid = r.left + r.width / 2;
                const d = Math.abs(e.clientX - mid);
                if (d < best) {
                    best = d;
                    nearest = i;
                }
            });
            setWeights(nearest);
        });
        wrap.addEventListener("mouseleave", () => setWeights(null));
    }

    function mountToast() {
        if (document.querySelector(".toast")) return;
        const t = document.createElement("div");
        t.className = "toast";
        t.textContent = "Email copied";
        document.body.appendChild(t);
    }

    function showToast(msg) {
        const t = document.querySelector(".toast");
        if (!t) return;
        t.textContent = msg;
        t.classList.add("show");
        setTimeout(() => t.classList.remove("show"), 1800);
    }

    function bindCopy() {
        document.querySelectorAll("[data-copy-email]").forEach((btn) => {
            btn.addEventListener("click", async () => {
                try {
                    await navigator.clipboard.writeText(EMAIL);
                } catch {
                    const ta = document.createElement("textarea");
                    ta.value = EMAIL;
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand("copy");
                    ta.remove();
                }
                const label = btn.querySelector("[data-copy-label]");
                if (label) {
                    const prev = label.textContent;
                    label.textContent = "Copied";
                    setTimeout(() => { label.textContent = prev; }, 1600);
                }
                showToast("Email copied");
            });
        });
    }

    function bindRipple() {
        document.querySelectorAll(".btn-pill").forEach((btn) => {
            const ripple = btn.querySelector(".ripple");
            if (!ripple) return;
            btn.addEventListener("mousemove", (e) => {
                const r = btn.getBoundingClientRect();
                ripple.style.left = e.clientX - r.left + "px";
                ripple.style.top = e.clientY - r.top + "px";
            });
        });
    }

    function mountLightbox() {
        if (document.querySelector(".lightbox")) return;
        const box = document.createElement("div");
        box.className = "lightbox";
        box.innerHTML = '<button class="lightbox-close" aria-label="Close">×</button><img alt="Screenshot">';
        document.body.appendChild(box);
        box.addEventListener("click", (e) => {
            if (e.target === box || e.target.classList.contains("lightbox-close")) {
                box.classList.remove("open");
            }
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") box.classList.remove("open");
        });
        document.querySelectorAll("[data-zoom]").forEach((el) => {
            el.addEventListener("click", () => {
                const src = el.getAttribute("data-zoom") || el.querySelector("img")?.src;
                if (!src) return;
                box.querySelector("img").src = src;
                box.classList.add("open");
            });
        });
    }

    function bindShotsNav() {
        document.querySelectorAll(".shots").forEach((section) => {
            const row = section.querySelector(".shots-row");
            const prev = section.querySelector("[data-shots-prev]");
            const next = section.querySelector("[data-shots-next]");
            if (!row || !prev || !next) return;
            const update = () => {
                prev.disabled = row.scrollLeft <= 8;
                next.disabled = row.scrollLeft + row.clientWidth >= row.scrollWidth - 8;
            };
            prev.addEventListener("click", () => row.scrollBy({ left: -row.clientWidth * 0.8, behavior: "smooth" }));
            next.addEventListener("click", () => row.scrollBy({ left: row.clientWidth * 0.8, behavior: "smooth" }));
            row.addEventListener("scroll", update, { passive: true });
            update();
        });
    }

    function bindGreeting() {
        const el = document.getElementById("greet-word");
        if (!el) return;
        const words = ["Hello", "Kedu", "Ẹ n lẹ", "Bonjour", "Hola"];
        let i = 0;
        setInterval(() => {
            el.classList.remove("in");
            el.classList.add("out");
            setTimeout(() => {
                i = (i + 1) % words.length;
                el.textContent = words[i];
                el.classList.remove("out");
                el.classList.add("in");
            }, 400);
        }, 2600);
    }

    mountDock();
    mountToast();
    bindCopy();
    bindRipple();
    mountLightbox();
    bindShotsNav();
    bindWordmark();
    bindGreeting();
})();
