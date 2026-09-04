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

function updateBackToTop() {
    if (!backToTop) return;

    const isMobile = window.innerWidth <= 760;
    backToTop.classList.toggle('visible', isMobile && window.scrollY > 240);
}

window.addEventListener('scroll', updateBackToTop, { passive: true });
window.addEventListener('resize', updateBackToTop);
updateBackToTop();

const projectData = {
    legally: {
        title: 'Legally Unbullied',
        category: 'AI platform',
        link: 'https://legally-unbullied.onrender.com',
        description: 'AI-powered legal-information platform for Nigeria with classify, retrieve, and draft flows over an indexed legal corpus.',
        points: [
            'Routes questions through a legal-information workflow.',
            'Retrieves sourced provisions before drafting responses.',
            'Escalates professional matters instead of pretending to replace a lawyer.'
        ]
    },
    nearspace: {
        title: 'Nearspace',
        category: 'Realtime PWA',
        link: 'https://nearspace.com.ng',
        description: 'A proximity-first professional network for technology creators in Nigeria with map, feed, bounties, groups, and offline-first behavior.',
        points: [
            'Built around local discovery and professional proximity.',
            'Uses realtime data flows for feed, groups, and activity.',
            'Shipped as an installable PWA.'
        ]
    },
    forge: {
        title: 'ForgeAI',
        category: 'Mobile AI',
        link: 'https://github.com/GraphicMiles/forgeai-android',
        description: 'Local-first AI coding assistant for Android with on-device inference, model cataloging, token streaming, and workspace file tools.',
        points: [
            'Runs GGUF inference through a native Android bridge.',
            'Streams model output into a mobile coding workflow.',
            'Includes workspace file actions and an agent core.'
        ]
    },
    watchparty: {
        title: 'Chan Watchparty',
        category: 'Realtime video',
        link: 'https://github.com/GraphicMiles/chan-watchparty',
        description: 'Synchronized watch-party app with a Node sync server, stream proxy, and Android playback fallback.',
        points: [
            'Keeps viewers synchronized across sessions.',
            'Combines web playback with native Android fallback support.',
            'Uses a dedicated sync layer for realtime room state.'
        ]
    },
    stare: {
        title: 'Stare',
        category: 'Computer vision',
        link: 'https://github.com/GraphicMiles/stare-ai',
        description: 'Real-time AI staring competition using in-browser face tracking to judge eye and head movement.',
        points: [
            'Uses computer vision as an impartial game referee.',
            'Scores eye state and head pose in the browser.',
            'Combines live interaction with realtime matchmaking.'
        ]
    },
    photon: {
        title: 'Photon Lab',
        category: 'Research',
        link: 'https://github.com/GraphicMiles/photon-lab',
        description: 'Research bench for screen-to-camera optical data channels with calibration, measurement, and experiment recording.',
        points: [
            'Measures real-world optical data transfer behavior.',
            'Tracks experiment data for BER, SNR, and throughput.',
            'Bridges research code into Android workflows.'
        ]
    }
};

const projectDialog = document.querySelector('[data-project-dialog]');
const projectTitle = document.querySelector('[data-project-title]');
const projectCategory = document.querySelector('[data-project-category]');
const projectDescription = document.querySelector('[data-project-description]');
const projectPoints = document.querySelector('[data-project-points]');
const projectLink = document.querySelector('[data-project-link]');

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
