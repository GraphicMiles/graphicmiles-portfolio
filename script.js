/* ========================================
   GRAPHIC MILES — PORTFOLIO ENGINE
   Card Deck + Bento Portal System
   ======================================== */

(() => {
    'use strict';

    // ---- State ----
    const state = {
        currentCard: 0,
        totalCards: 0,
        isDragging: false,
        startY: 0,
        currentY: 0,
        deltaY: 0,
        velocity: 0,
        lastY: 0,
        lastTime: 0,
        cardHeight: 0,
        transitioning: false,
        isMobile: window.innerWidth < 900,
        activeOverlay: null,
    };

    // ---- Project Data ----
    const projects = {
        nearspace: {
            label: 'Web App · 2025 · Live',
            title: 'Nearspace',
            image: 'assets/projects/nearspace.jpg',
            description: 'Creator-discovery platform for finding nearby builders and professionals. A real shipped product with live user flows for discovery, profiles, and location-aware browsing.',
            meta: [
                { key: 'What I built', value: ['Full frontend interface from scratch', 'Location-aware discovery and filtering', 'Profile pages with project showcases', 'Mobile-first responsive design'] },
                { key: 'Technologies', value: 'JavaScript, HTML/CSS, Responsive UI, Product Design' },
                { key: 'Status', value: 'Live at nearspace.com.ng' },
            ],
            links: [
                { label: 'Live site', url: 'https://nearspace.com.ng' },
                { label: 'GitHub', url: 'https://github.com/GraphicMiles' },
            ],
        },
        legally: {
            label: 'AI Web App · 2025 · Live',
            title: 'Legally Unbullied',
            image: 'assets/projects/legally-unbullied.jpg',
            description: 'Nigerian legal-information assistant combining web interface with retrieval-augmented AI. Users ask questions and receive source-backed answers from legal documents.',
            meta: [
                { key: 'What I built', value: ['Q&A interface with source attribution', 'Retrieval and AI answer pipeline', 'Document search and passage ranking', 'Trust-building UI for legal content'] },
                { key: 'Technologies', value: 'JavaScript, Python, FastAPI, AI/ML, RAG' },
                { key: 'Status', value: 'Live on Render' },
            ],
            links: [
                { label: 'Live site', url: 'https://legally-unbullied.onrender.com' },
                { label: 'GitHub', url: 'https://github.com/GraphicMiles/Legallyunbullied' },
            ],
        },
        mrnobody: {
            label: 'Android + Web · 2024',
            title: 'Mr Nobody',
            image: 'assets/projects/mr-nobody.jpg',
            description: 'Privacy-focused browser spanning Android and web. Includes Android app with privacy controls, browsing workflows, and bounded task assistant concept.',
            meta: [
                { key: 'What I built', value: ['Android app with privacy controls', 'Companion project website', 'Task assistant concept', 'Cross-platform product thinking'] },
                { key: 'Technologies', value: 'Java, Android, Capacitor, HTML/CSS' },
                { key: 'Status', value: 'Open source on GitHub' },
            ],
            links: [
                { label: 'GitHub', url: 'https://github.com/GraphicMiles/Mr-Nobody' },
            ],
        },
        touchline: {
            label: 'Landing Page · 2024',
            title: 'The Touchline',
            image: 'assets/projects/touchline.jpg',
            description: 'Desktop-first editorial layout for a football news site. Demonstrates content-heavy homepage design with lead stories, navigation, and readable article structure.',
            meta: [
                { key: 'What I built', value: ['Editorial homepage layout', 'Content hierarchy for news', 'Navigation and story cards'] },
                { key: 'Technologies', value: 'HTML/CSS, JavaScript' },
                { key: 'Status', value: 'Demo project' },
            ],
            links: [
                { label: 'GitHub', url: 'https://github.com/GraphicMiles/demos' },
            ],
        },
        metrix: {
            label: 'Landing Page · 2024',
            title: 'Metrix',
            image: 'assets/projects/metrix.jpg',
            description: 'SaaS analytics landing page focused on product messaging, dashboard presentation, and conversion-oriented structure.',
            meta: [
                { key: 'What I built', value: ['SaaS hero and feature sections', 'Dashboard preview integration', 'Conversion-oriented layout'] },
                { key: 'Technologies', value: 'HTML/CSS, JavaScript' },
                { key: 'Status', value: 'Demo project' },
            ],
            links: [
                { label: 'GitHub', url: 'https://github.com/GraphicMiles/demos' },
            ],
        },
    };

    // ---- DOM References ----
    const deck = document.getElementById('deck');
    const cards = document.querySelectorAll('.card');
    const bentoGrid = document.getElementById('bento');
    const portals = document.querySelectorAll('.portal');
    const overlay = document.getElementById('projectOverlay');
    const overlayContent = document.getElementById('overlayContent');
    const closeOverlayBtn = document.getElementById('closeOverlay');

    // ---- Initialize ----
    function init() {
        state.totalCards = cards.length;
        state.cardHeight = window.innerHeight;

        if (state.isMobile) {
            initDeck();
        } else {
            initBento();
        }

        initProjectLinks();
        initResize();
        initKeyboard();
    }

    // ========================================
    // MOBILE CARD DECK
    // ========================================

    function initDeck() {
        // Position cards
        cards.forEach((card, i) => {
            card.style.zIndex = state.totalCards - i;
            if (i === 0) {
                card.style.transform = 'translateY(0)';
                card.style.opacity = '1';
            } else {
                card.style.transform = 'translateY(100%)';
                card.style.opacity = '0';
            }
        });

        // Touch events
        deck.addEventListener('touchstart', onDragStart, { passive: true });
        deck.addEventListener('touchmove', onDragMove, { passive: false });
        deck.addEventListener('touchend', onDragEnd, { passive: true });

        // Mouse events for desktop testing
        deck.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    function onDragStart(e) {
        if (state.transitioning) return;
        const touch = e.touches[0];
        startDrag(touch.clientY);
    }

    function onDragMove(e) {
        if (!state.isDragging) return;
        e.preventDefault();
        const touch = e.touches[0];
        moveDrag(touch.clientY);
    }

    function onDragEnd() {
        endDrag();
    }

    function onMouseDown(e) {
        if (state.transitioning) return;
        startDrag(e.clientY);
    }

    function onMouseMove(e) {
        if (!state.isDragging) return;
        e.preventDefault();
        moveDrag(e.clientY);
    }

    function onMouseUp() {
        endDrag();
    }

    function startDrag(y) {
        state.isDragging = true;
        state.startY = y;
        state.currentY = y;
        state.lastY = y;
        state.lastTime = Date.now();
        state.velocity = 0;
        state.deltaY = 0;

        const card = cards[state.currentCard];
        card.style.transition = 'none';
    }

    function moveDrag(y) {
        const now = Date.now();
        const dt = now - state.lastTime;

        state.deltaY = y - state.startY;
        state.velocity = dt > 0 ? (y - state.lastY) / dt : 0;
        state.lastY = y;
        state.lastTime = now;

        const card = cards[state.currentCard];

        // Apply resistance at edges
        let move = state.deltaY;
        if (move > 0 && state.currentCard === 0) {
            move = move * 0.3;
        }
        if (move < 0 && state.currentCard === state.totalCards - 1) {
            move = move * 0.3;
        }

        card.style.transform = `translateY(${move}px)`;
    }

    function endDrag() {
        if (!state.isDragging) return;
        state.isDragging = false;

        const card = cards[state.currentCard];
        const threshold = state.cardHeight * 0.2;
        const velocityThreshold = 0.5;

        const shouldAdvance = (
            (state.deltaY < -threshold) ||
            (state.velocity < -velocityThreshold && state.deltaY < -30)
        );

        const shouldRetreat = (
            (state.deltaY > threshold) ||
            (state.velocity > velocityThreshold && state.deltaY > 30)
        );

        if (shouldAdvance && state.currentCard < state.totalCards - 1) {
            commitCard('next');
        } else if (shouldRetreat && state.currentCard > 0) {
            commitCard('prev');
        } else {
            // Snap back
            card.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            card.style.transform = 'translateY(0)';
        }
    }

    function commitCard(direction) {
        state.transitioning = true;
        const card = cards[state.currentCard];
        const exitY = direction === 'next' ? -state.cardHeight : state.cardHeight;

        // Exit animation
        card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease';
        card.style.transform = `translateY(${exitY}px)`;
        card.style.opacity = '0';

        // Update index
        if (direction === 'next') {
            state.currentCard++;
        } else {
            state.currentCard--;
        }

        // Enter animation
        const nextCard = cards[state.currentCard];
        const enterFrom = direction === 'next' ? state.cardHeight : -state.cardHeight;

        nextCard.style.transition = 'none';
        nextCard.style.transform = `translateY(${enterFrom}px)`;
        nextCard.style.opacity = '1';

        // Force reflow
        nextCard.offsetHeight;

        nextCard.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        nextCard.style.transform = 'translateY(0)';

        updateCardIndex();

        setTimeout(() => {
            state.transitioning = false;
        }, 550);
    }

    function updateCardIndex() {
        // Could add a visual indicator here
    }

    // ========================================
    // DESKTOP BENTO PORTALS
    // ========================================

    function initBento() {
        portals.forEach(portal => {
            portal.addEventListener('click', () => openPortal(portal.dataset.portal));
            
            // Keyboard support
            portal.setAttribute('tabindex', '0');
            portal.setAttribute('role', 'button');
            portal.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openPortal(portal.dataset.portal);
                }
            });
        });
    }

    function openPortal(name) {
        const content = getPortalContent(name);
        if (!content) return;

        state.activeOverlay = name;
        overlayContent.innerHTML = content;
        overlay.hidden = false;
        
        // Fade in
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
        });

        // Scroll to top
        overlay.scrollTop = 0;

        // Focus close button
        setTimeout(() => closeOverlayBtn.focus(), 100);

        // Wire up project clicks
        overlayContent.querySelectorAll('[data-project]').forEach(el => {
            el.addEventListener('click', () => openProject(el.dataset.project));
        });
    }

    function closeOverlay() {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.hidden = true;
            overlayContent.innerHTML = '';
            state.activeOverlay = null;
        }, 300);
    }

    function getPortalContent(name) {
        switch (name) {
            case 'identity':
                return `
                    <div class="overlay-hero">
                        <span class="overlay-label">Identity</span>
                        <h1 class="overlay-title">Raji Adewunmi<br>Farouq</h1>
                        <p class="overlay-desc">Developer and builder from Lagos, Nigeria. I ship web products, AI-powered tools, and responsive interfaces that solve real problems.</p>
                    </div>`;

            case 'work':
                return `
                    <div class="overlay-hero">
                        <span class="overlay-label">Selected Work</span>
                        <h1 class="overlay-title">Products &<br>Systems</h1>
                        <p class="overlay-desc">Projects I've built — from product-facing web apps to AI-assisted tools.</p>
                    </div>
                    ${renderProjects()}`;

            case 'building':
                return `
                    <div class="overlay-hero">
                        <span class="overlay-label">Currently</span>
                        <h1 class="overlay-title">Building</h1>
                        <p class="overlay-desc">What I'm shipping, iterating, and exploring.</p>
                    </div>
                    <div class="building-overlay-list">
                        <div class="building-overlay-item">
                            <div class="building-overlay-status">
                                <span class="status-dot status-dot--live"></span>
                                <span>Shipping</span>
                            </div>
                            <p>Nearspace — creator discovery platform with location-aware browsing and real user flows.</p>
                        </div>
                        <div class="building-overlay-item">
                            <div class="building-overlay-status">
                                <span class="status-dot status-dot--iter"></span>
                                <span>Iterating</span>
                            </div>
                            <p>Legally Unbullied — retrieval-augmented AI for Nigerian legal information. Connecting FastAPI pipelines to clean interfaces.</p>
                        </div>
                        <div class="building-overlay-item">
                            <div class="building-overlay-status">
                                <span class="status-dot status-dot--explore"></span>
                                <span>Exploring</span>
                            </div>
                            <p>AI automation workflows — practical agent-style systems that connect prompts, tools, and APIs to real product tasks.</p>
                        </div>
                    </div>`;

            case 'about':
                return `
                    <div class="overlay-hero">
                        <span class="overlay-label">About</span>
                        <h1 class="overlay-title">How I<br>Work</h1>
                    </div>
                    <p class="about-overlay-text">I build at the intersection of frontend engineering and AI — where a clean interface meets a useful backend. My projects range from product-facing web apps to retrieval-augmented AI tools.</p>
                    <p class="about-overlay-text">Every project starts with understanding what needs to exist and why. I care about clarity, usability, and systems that work.</p>
                    <div class="about-overlay-grid">
                        <div class="about-cell">
                            <h4>Focus</h4>
                            <p>Frontend engineering, product UI, AI automation, backend integrations</p>
                        </div>
                        <div class="about-cell">
                            <h4>Location</h4>
                            <p>Lagos, Nigeria</p>
                        </div>
                        <div class="about-cell">
                            <h4>Available</h4>
                            <p>Remote projects and technical collaboration</p>
                        </div>
                    </div>`;

            case 'capabilities':
                return `
                    <div class="overlay-hero">
                        <span class="overlay-label">Capabilities</span>
                        <h1 class="overlay-title">What I<br>Build With</h1>
                        <p class="overlay-desc">Technologies and tools across frontend, backend, AI, and mobile.</p>
                    </div>
                    <div class="capabilities-overlay-grid">
                        <div class="cap-overlay-group">
                            <h4>Frontend</h4>
                            <ul class="cap-overlay-list">
                                <li>JavaScript</li>
                                <li>TypeScript</li>
                                <li>React</li>
                                <li>Vite</li>
                                <li>HTML/CSS</li>
                                <li>Responsive UI</li>
                            </ul>
                        </div>
                        <div class="cap-overlay-group">
                            <h4>Backend</h4>
                            <ul class="cap-overlay-list">
                                <li>Python</li>
                                <li>FastAPI</li>
                                <li>Firebase</li>
                                <li>Node.js</li>
                                <li>REST APIs</li>
                            </ul>
                        </div>
                        <div class="cap-overlay-group">
                            <h4>AI & Automation</h4>
                            <ul class="cap-overlay-list">
                                <li>RAG</li>
                                <li>Retrieval Pipelines</li>
                                <li>AI Workflows</li>
                                <li>Computer Vision</li>
                                <li>Agentic Systems</li>
                            </ul>
                        </div>
                        <div class="cap-overlay-group">
                            <h4>Mobile</h4>
                            <ul class="cap-overlay-list">
                                <li>Java</li>
                                <li>Android</li>
                                <li>Capacitor</li>
                                <li>Cross-platform</li>
                            </ul>
                        </div>
                    </div>`;

            case 'contact':
                return `
                    <div class="overlay-hero">
                        <span class="overlay-label">Contact</span>
                        <h1 class="overlay-title">Let's Build<br>Something</h1>
                        <p class="overlay-desc">Available for frontend builds, product interfaces, AI automation, and backend integrations.</p>
                    </div>
                    <div class="contact-overlay-links">
                        <a href="mailto:rfarouq69@gmail.com" class="contact-overlay-link">rfarouq69@gmail.com</a>
                        <a href="https://github.com/GraphicMiles" target="_blank" class="contact-overlay-link">GitHub</a>
                        <a href="https://x.com/DSGNBYMILES" target="_blank" class="contact-overlay-link">X / Twitter</a>
                        <a href="https://www.linkedin.com/search/results/all/?keywords=Raji%20Adewunmi%20Farouq" target="_blank" class="contact-overlay-link">LinkedIn</a>
                    </div>
                    <div class="contact-overlay-footer">© 2026 Raji Adewunmi Farouq</div>`;

            default:
                return '';
        }
    }

    function renderProjects() {
        const featured = ['nearspace', 'legally'];
        const small = ['mrnobody', 'touchline', 'metrix'];

        let html = '';

        // Featured projects
        featured.forEach(key => {
            const p = projects[key];
            html += `
                <div class="project-card" data-project="${key}">
                    <div class="project-img">
                        <img src="${p.image}" alt="${p.title}" loading="lazy">
                    </div>
                    <div class="project-info">
                        <span class="project-label">${p.label}</span>
                        <h3>${p.title}</h3>
                        <p>${p.description}</p>
                        <span class="project-tech">${p.meta[1].value}</span>
                        <div class="project-links">
                            ${p.links.map(l => `<a href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`).join('')}
                        </div>
                    </div>
                </div>`;
        });

        // Smaller projects
        html += '<div class="projects-small">';
        small.forEach(key => {
            const p = projects[key];
            html += `
                <div class="project-small" data-project="${key}">
                    <span class="small-label">${p.label}</span>
                    <h4>${p.title}</h4>
                    <p>${p.description.substring(0, 80)}...</p>
                </div>`;
        });
        html += '</div>';

        return html;
    }

    // ========================================
    // PROJECT DETAIL
    // ========================================

    function initProjectLinks() {
        document.addEventListener('click', (e) => {
            const item = e.target.closest('[data-project]');
            if (item) {
                openProject(item.dataset.project);
            }
        });
    }

    function openProject(key) {
        const p = projects[key];
        if (!p) return;

        let metaHtml = '';
        p.meta.forEach(m => {
            const val = Array.isArray(m.value)
                ? `<ul>${m.value.map(v => `<li>${v}</li>`).join('')}</ul>`
                : `<p>${m.value}</p>`;
            metaHtml += `
                <div class="project-meta-item">
                    <h4>${m.key}</h4>
                    ${val}
                </div>`;
        });

        overlayContent.innerHTML = `
            <div class="overlay-hero">
                <span class="overlay-label">${p.label}</span>
                <h1 class="overlay-title">${p.title}</h1>
            </div>
            <div class="project-detail-img">
                <img src="${p.image}" alt="${p.title}">
            </div>
            <p class="overlay-desc">${p.description}</p>
            <div class="project-detail-meta">${metaHtml}</div>
            <div class="project-links">
                ${p.links.map(l => `<a href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`).join('')}
            </div>`;

        overlay.hidden = false;
        overlay.scrollTop = 0;
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.25s ease';
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
        });

        state.activeOverlay = 'project';
        setTimeout(() => closeOverlayBtn.focus(), 100);
    }

    // ========================================
    // KEYBOARD NAVIGATION
    // ========================================

    function initKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (state.activeOverlay) {
                if (e.key === 'Escape') {
                    closeOverlay();
                }
                return;
            }

            if (state.isMobile) {
                if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    if (state.currentCard < state.totalCards - 1) commitCard('next');
                } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    if (state.currentCard > 0) commitCard('prev');
                }
            }
        });
    }

    // ========================================
    // RESIZE HANDLER
    // ========================================

    function initResize() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const wasMobile = state.isMobile;
                state.isMobile = window.innerWidth < 900;
                state.cardHeight = window.innerHeight;

                if (wasMobile !== state.isMobile) {
                    // Reset for new mode
                    state.currentCard = 0;
                    cards.forEach((card, i) => {
                        card.style.transition = 'none';
                        if (state.isMobile) {
                            card.style.transform = i === 0 ? 'translateY(0)' : 'translateY(100%)';
                            card.style.opacity = i === 0 ? '1' : '0';
                        }
                    });
                }
            }, 200);
        });
    }

    // ========================================
    // CLOSE HANDLERS
    // ========================================

    closeOverlayBtn.addEventListener('click', closeOverlay);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeOverlay();
    });

    // ---- Boot ----
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
