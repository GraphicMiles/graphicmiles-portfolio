const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');
const panelLinks = document.querySelectorAll('a[href$="-panel"]');
const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const backToTop = document.querySelector('[data-back-to-top]');

function showPanel(name) {
    tabs.forEach((tab) => {
        const isActive = tab.dataset.tab === name;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
    });

    panels.forEach((panel) => {
        const isActive = panel.id === `${name}-panel`;
        panel.hidden = !isActive;
        panel.classList.toggle('active', isActive);
    });
}

function openPanel(name, shouldScroll = true) {
    const panel = document.getElementById(`${name}-panel`);
    if (!panel) return;

    showPanel(name);

    if (shouldScroll) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    history.replaceState(null, '', `#${name}-panel`);
}

tabs.forEach((tab) => {
    tab.addEventListener('click', () => openPanel(tab.dataset.tab, false));
});

panelLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
        const name = link.getAttribute('href').replace('#', '').replace('-panel', '');
        event.preventDefault();
        openPanel(name);

        if (mobileMenu && !mobileMenu.hidden) {
            mobileMenu.hidden = true;
            menuButton.setAttribute('aria-expanded', 'false');
        }
    });
});

if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
        const isOpen = !mobileMenu.hidden;
        mobileMenu.hidden = isOpen;
        menuButton.setAttribute('aria-expanded', String(!isOpen));
    });
}


const avatarButton = document.querySelector('[data-avatar-open]');
const avatarLightbox = document.querySelector('[data-avatar-lightbox]');

if (avatarButton && avatarLightbox) {
    avatarButton.addEventListener('click', () => avatarLightbox.showModal());

    avatarLightbox.addEventListener('click', (event) => {
        if (event.target === avatarLightbox) {
            avatarLightbox.close();
        }
    });

    document.querySelectorAll('[data-avatar-close]').forEach((button) => {
        button.addEventListener('click', () => avatarLightbox.close());
    });
}

function updateBackToTop() {
    if (!backToTop) return;

    const isMobile = window.innerWidth <= 760;
    backToTop.classList.toggle('visible', isMobile && window.scrollY > 240);
}

window.addEventListener('scroll', updateBackToTop, { passive: true });
window.addEventListener('resize', updateBackToTop);
updateBackToTop();

const projectData = {
    nearspace: {
        title: 'Nearspace',
        category: 'Realtime web app',
        link: 'https://nearspace.com.ng',
        repo: '',
        description: 'A web product for discovering nearby creators, builders, and professionals. It shows frontend product thinking around discovery, profiles, and location-aware experiences.',
        points: [
            'Built as a responsive product-facing web experience.',
            'Focuses on creator discovery, profiles, and practical user flows.',
            'Shows comfort turning a product idea into a polished interface.'
        ]
    },
    legally: {
        title: 'Legally Unbullied',
        category: 'AI-assisted web app',
        link: 'https://legally-unbullied.onrender.com',
        repo: 'https://github.com/GraphicMiles/Legallyunbullied',
        description: 'A Nigerian legal-information assistant that combines a web interface with retrieval and AI-assisted answer drafting. The goal is helpful guidance, not replacing a lawyer.',
        points: [
            'Uses a clear question-and-answer workflow for legal information.',
            'Connects frontend UI to AI/retrieval-style product logic.',
            'Shows practical knowledge of automation without overstating the role of AI.'
        ]
    },
    mrnobody: {
        title: 'Mr Nobody',
        category: 'Android privacy browser',
        link: '',
        repo: 'https://github.com/GraphicMiles/Mr-Nobody',
        description: 'An Android privacy browser project with a companion website and a bounded task-assistant concept for safer browsing workflows.',
        points: [
            'Includes an Android app codebase plus a focused project website.',
            'Explores privacy controls, browsing flows, and task assistance.',
            'Shows ability to work across web presentation and mobile product ideas.'
        ]
    },
    touchline: {
        title: 'The Touchline',
        category: 'News blog landing page',
        link: '',
        repo: 'https://github.com/GraphicMiles/demos',
        description: 'A desktop news/blog landing page from the demos collection, built around editorial hierarchy, navigation, story cards, and readable content structure.',
        points: [
            'Demonstrates layout control for a content-heavy homepage.',
            'Uses clear editorial sections for lead stories and secondary links.',
            'Good example of frontend structure for media or publishing products.'
        ]
    },
    metrix: {
        title: 'Metrix',
        category: 'SaaS landing page',
        link: '',
        repo: 'https://github.com/GraphicMiles/demos',
        description: 'A SaaS analytics landing page from the demos collection, focused on product messaging, dashboard presentation, and conversion-oriented sections.',
        points: [
            'Shows a clean SaaS hero, feature framing, and dashboard preview.',
            'Uses responsive landing-page structure and product-focused copy.',
            'Demonstrates frontend execution for a software product website.'
        ]
    }
};

const projectDialog = document.querySelector('[data-project-dialog]');
const projectTitle = document.querySelector('[data-project-title]');
const projectCategory = document.querySelector('[data-project-category]');
const projectDescription = document.querySelector('[data-project-description]');
const projectPoints = document.querySelector('[data-project-points]');
const projectLink = document.querySelector('[data-project-link]');
const projectRepo = document.querySelector('[data-project-repo]');

function openProject(key) {
    const project = projectData[key];
    if (!project || !projectDialog) return;

    projectTitle.textContent = project.title;
    projectCategory.textContent = project.category;
    projectDescription.textContent = project.description;
    projectPoints.innerHTML = project.points
        .map((point) => `<span><i class="fa-solid fa-check"></i>${point}</span>`)
        .join('');

    projectLink.href = project.link;
    projectLink.hidden = !project.link;

    if (projectRepo) {
        projectRepo.href = project.repo;
        projectRepo.hidden = !project.repo;
    }

    projectDialog.showModal();
}

document.querySelectorAll('[data-project]').forEach((card) => {
    card.addEventListener('click', () => openProject(card.dataset.project));

    card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openProject(card.dataset.project);
        }
    });
});

document.querySelectorAll('[data-close-project]').forEach((button) => {
    button.addEventListener('click', () => projectDialog.close());
});

if (projectDialog) {
    projectDialog.addEventListener('click', (event) => {
        if (event.target === projectDialog) {
            projectDialog.close();
        }
    });
}

const initialPanel = window.location.hash.replace('#', '').replace('-panel', '');
if (initialPanel && document.querySelector(`[data-tab="${initialPanel}"]`)) {
    showPanel(initialPanel);
}
