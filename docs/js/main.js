/* ============================================================
   MAIN JAVASCRIPT - INTERACTIVITY & FUNCTIONALITY
   ============================================================ */

document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeNavigation();
    initializePhases();
    initializeSearch();
    highlightCode();
});

/* ============================================================
   THEME MANAGEMENT
   ============================================================ */

function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;

    // Check localStorage for saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Theme toggle listener
    themeToggle.addEventListener('click', function() {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-icon');
    icon.textContent = theme === 'light' ? '🌙' : '☀️';
}

/* ============================================================
   NAVIGATION
   ============================================================ */

function initializeNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.getElementById('sidebarClose');

    if (!navToggle || !navMenu) return; // Exit if navigation elements not found

    const navLinks = document.querySelectorAll('.nav-menu a, .phase-list a');

    // Mobile menu toggle
    navToggle.addEventListener('click', function() {
        if (sidebar) sidebar.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close sidebar
    if (sidebarClose) {
        sidebarClose.addEventListener('click', function() {
            if (sidebar) sidebar.classList.remove('active');
            navToggle.classList.remove('active');
        });
    }

    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('data-section')) {
                e.preventDefault();
                const section = this.getAttribute('data-section');
                goToSection(section);
                if (sidebar) sidebar.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    });

    // Highlight current section
    updateActiveNavLink();
}

function goToSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active');
        window.scrollTo(0, 0);
        updateActiveNavLink();
    }
}

function updateActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    const activeSection = document.querySelector('.content-section.active');

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === activeSection.id) {
            link.classList.add('active');
        }
    });
}

/* ============================================================
   PHASE MANAGEMENT
   ============================================================ */

function initializePhases() {
    const phaseCards = document.querySelectorAll('.phase-card');
    if (phaseCards.length === 0) return;

    // Don't add duplicate event listeners since we use inline onclick
    // Just ensure cards are initialized
    console.log('Found', phaseCards.length, 'phase cards');
}

function expandPhase(button) {
    console.log('expandPhase called with:', button);

    if (!button) {
        console.error('Button is null or undefined');
        return;
    }

    const card = button.closest('.phase-card');
    console.log('Card found:', card);

    if (!card) {
        console.error('Card not found');
        return;
    }

    const content = card.querySelector('.phase-content');
    console.log('Content found:', content);

    if (!content) {
        console.error('Phase content not found');
        return;
    }

    const isExpanded = content.style.display !== 'none';
    console.log('Is expanded:', isExpanded);

    // Close all other cards
    document.querySelectorAll('.phase-card').forEach(c => {
        if (c !== card) {
            const btn = c.querySelector('.expand-btn');
            const cnt = c.querySelector('.phase-content');
            if (cnt) cnt.style.display = 'none';
            if (btn) btn.textContent = 'View Details';
        }
    });

    // Toggle current card
    if (isExpanded) {
        content.style.display = 'none';
        button.textContent = 'View Details';
        console.log('Collapsed card');
    } else {
        content.style.display = 'block';
        button.textContent = 'Hide Details';
        console.log('Expanded card');
    }
}

function selectPhase(phaseNumber) {
    const card = document.querySelector(`[data-phase="${phaseNumber}"]`);
    if (card) {
        const button = card.querySelector('.expand-btn');
        expandPhase(button);
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function scrollToPhase(phaseNumber) {
    goToSection('documentation');
    setTimeout(() => selectPhase(phaseNumber), 300);
}

/* ============================================================
   Q&A SECTION
   ============================================================ */

function toggleAnswer(questionElement) {
    const answer = questionElement.closest('.qa-item').querySelector('.qa-answer');
    const toggle = questionElement.querySelector('.qa-toggle');
    const isOpen = answer.style.display !== 'none';

    // Close all other answers
    document.querySelectorAll('.qa-answer').forEach(ans => {
        if (ans !== answer) {
            ans.style.display = 'none';
            ans.closest('.qa-item').querySelector('.qa-toggle').textContent = '+';
        }
    });

    // Toggle current answer
    if (isOpen) {
        answer.style.display = 'none';
        toggle.textContent = '+';
    } else {
        answer.style.display = 'block';
        toggle.textContent = '−';
    }
}

/* ============================================================
   SEARCH FUNCTIONALITY
   ============================================================ */

function initializeSearch() {
    const searchBox = document.getElementById('searchBox');

    if (!searchBox) return; // Exit if no search box found

    searchBox.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        searchDocumentation(query);
    });
}

function searchDocumentation(query) {
    if (!query) {
        document.querySelectorAll('.phase-card').forEach(card => {
            card.style.display = 'block';
        });
        return;
    }

    document.querySelectorAll('.phase-card').forEach(card => {
        const title = card.querySelector('.phase-title h3').textContent.toLowerCase();
        const description = card.querySelector('.phase-description').textContent.toLowerCase();
        const topics = card.querySelector('.phase-topics').textContent.toLowerCase();

        const match = title.includes(query) ||
                      description.includes(query) ||
                      topics.includes(query);

        card.style.display = match ? 'block' : 'none';
    });
}

/* ============================================================
   CODE HIGHLIGHTING
   ============================================================ */

function highlightCode() {
    if (typeof hljs !== 'undefined') {
        document.querySelectorAll('pre code').forEach(block => {
            hljs.highlightElement(block);
        });
    }
}

/* ============================================================
   UTILITY FUNCTIONS
   ============================================================ */

function scrollToElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

/* ============================================================
   ANIMATION ON SCROLL
   ============================================================ */

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.phase-card, .stat-card, .roadmap-card').forEach(el => {
        observer.observe(el);
    });
});

/* ============================================================
   KEYBOARD SHORTCUTS
   ============================================================ */

document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('searchBox').focus();
    }

    // Escape to close sidebar
    if (e.key === 'Escape') {
        document.getElementById('sidebar').classList.remove('active');
    }
});

/* ============================================================
   PAGE LOAD ANIMATIONS
   ============================================================ */

window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

/* ============================================================
   EXPORT FUNCTIONS FOR HTML ONCLICK
   ============================================================ */

// Make functions global for onclick handlers
window.goToSection = goToSection;
window.expandPhase = expandPhase;
window.selectPhase = selectPhase;
window.scrollToPhase = scrollToPhase;
window.toggleAnswer = toggleAnswer;

// Ensure expandPhase is callable from inline onclick
if (!window.expandPhase) {
    window.expandPhase = expandPhase;
}
