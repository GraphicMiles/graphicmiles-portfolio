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
    forge: {
        title: 'ForgeAI',
        category: 'Android AI utility',
        link: 'https://toddler-kappa.vercel.app',
        repo: 'https://github.com/GraphicMiles/forgeai-android',
        description: 'An Android project exploring a local-first AI coding assistant with a controlled workspace and user-approved file actions.',
        points: [
            'Uses Java and Capacitor around a native Android workflow.',
            'Explores on-device model use and token streaming for mobile AI tools.',
            'Shows practical thinking around safe file access, tool actions, and approval steps.'
        ]
    },
    turf: {
        title: 'Turf',
        category: 'JavaScript web app',
        link: 'https://turf-pi-six.vercel.app',
        repo: 'https://github.com/GraphicMiles/Turf',
        description: 'A web app prototype for a paid ranking ladder where positions are determined by contribution amount and clear rules.',
        points: [
            'Builds a direct interaction model around ranking, payment amount, and ordering.',
            'Uses plain web UI patterns that make the product rule easy to understand.',
            'Good example of turning a simple product mechanic into a working web experience.'
        ]
    },
    stare: {
        title: 'Stare',
        category: 'AI browser game',
        link: 'https://peekaboo-beige.vercel.app',
        repo: 'https://github.com/GraphicMiles/stare-ai',
        description: 'A browser game prototype that uses face tracking to judge eye and head movement during a staring competition.',
        points: [
            'Uses computer vision in the browser for a clear game mechanic.',
            'Tracks eye state and head position instead of relying on manual judging.',
            'Shows comfort connecting frontend interaction with AI-assisted logic.'
        ]
    },
    patungans: {
        title: 'Patungans',
        category: 'Landing page',
        link: 'https://milesdemo1.vercel.app',
        repo: 'https://github.com/GraphicMiles/patungans-landing',
        description: 'A responsive marketing page for a group-savings product concept, focused on clear messaging and clean frontend execution.',
        points: [
            'Communicates the product idea quickly with a focused landing-page structure.',
            'Uses responsive sections, calls to action, and product explanation blocks.',
            'Shows frontend delivery for a consumer finance-style product concept.'
        ]
    },
    photon: {
        title: 'Photon Lab',
        category: 'Browser research tool',
        link: 'https://steinberg-zeta.vercel.app',
        repo: 'https://github.com/GraphicMiles/photon-lab',
        description: 'A browser-based test bench for experimenting with screen-to-camera optical data transfer and measurement workflows.',
        points: [
            'Includes transmit and receive flows for browser-based experiments.',
            'Provides calibration and measurement UI for testing signal behavior.',
            'Shows ability to build technical interfaces around non-trivial workflows.'
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
