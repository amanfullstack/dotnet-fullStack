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

    if (!themeToggle) {
        console.warn('Theme toggle element not found');
        return;
    }

    // Check localStorage for saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Prevent default interaction
    themeToggle.style.cursor = 'pointer';
    themeToggle.style.zIndex = '1001';
    themeToggle.style.position = 'relative';

    // Theme toggle listener
    themeToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);

        console.log('Theme changed to:', newTheme);
    });

    // Double-check localStorage on page load
    window.addEventListener('load', function() {
        const theme = localStorage.getItem('theme') || 'light';
        htmlElement.setAttribute('data-theme', theme);
        updateThemeIcon(theme);
    });
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-icon');
    if (icon) {
        icon.textContent = theme === 'light' ? '🌙' : '☀️';
        icon.style.cursor = 'pointer';
    }
}

/* ============================================================
   NAVIGATION
   ============================================================ */

/* ============================================================
   SIDEBAR UTILITIES
   ============================================================ */

function closeSidebarMenu() {
    const sidebar = document.getElementById('sidebar');
    const navToggle = document.getElementById('navToggle');

    if (sidebar) {
        sidebar.classList.remove('active');
    }
    if (navToggle) {
        navToggle.classList.remove('active');
    }
    console.log('Sidebar closed');
}

function initializeNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.getElementById('sidebarClose');

    if (!navToggle || !navMenu) {
        console.warn('Navigation elements not found');
        return;
    }

    // Mobile menu toggle
    navToggle.style.cursor = 'pointer';
    navToggle.style.pointerEvents = 'auto';
    navToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Hamburger menu clicked');

        if (sidebar) {
            sidebar.classList.toggle('active');
            console.log('Sidebar toggled, now:', sidebar.classList.contains('active') ? 'OPEN' : 'CLOSED');
        }
        navToggle.classList.toggle('active');
    });

    // Close sidebar button
    if (sidebarClose) {
        sidebarClose.style.cursor = 'pointer';
        sidebarClose.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeSidebarMenu();
        });
    }

    // Nav menu links (with data-section)
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const section = this.getAttribute('data-section');
            if (section) {
                e.preventDefault();
                goToSection(section);
                closeSidebarMenu();
            }
        });
    });

    // Phase list links - close sidebar after onclick
    const phaseLinks = document.querySelectorAll('.phase-list a');
    phaseLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            console.log('Phase link clicked:', this.textContent);
            // Allow onclick handler to execute, then close
            setTimeout(() => {
                closeSidebarMenu();
            }, 50);
        });
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', function(e) {
        if (sidebar && sidebar.classList.contains('active')) {
            if (!sidebar.contains(e.target) && !navToggle.contains(e.target)) {
                closeSidebarMenu();
            }
        }
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
    // First navigate to documentation section
    goToSection('documentation');

    // Then find and expand the phase card
    setTimeout(() => {
        const card = document.querySelector(`[data-phase="${phaseNumber}"]`);
        if (card) {
            const button = card.querySelector('.expand-btn');
            if (button) {
                expandPhase(button);
            }
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            console.warn('Phase card not found:', phaseNumber);
        }

        // Close sidebar when phase is selected
        closeSidebarMenu();
    }, 300);
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
window.closeSidebarMenu = closeSidebarMenu;

// Ensure expandPhase is callable from inline onclick
if (!window.expandPhase) {
    window.expandPhase = expandPhase;
}
