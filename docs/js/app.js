/* ================================================================
   .NET FULL STACK DOCS — APP.JS
   Version 2.0 | Core Interactivity
   ================================================================ */

(function () {
  'use strict';

  /* ---------------------------------------------------------------
     THEME MANAGEMENT
  --------------------------------------------------------------- */
  function initTheme() {
    const btn = document.getElementById('themeBtn');
    const root = document.documentElement;
    const saved = localStorage.getItem('docsTheme') || 'light';

    root.setAttribute('data-theme', saved);
    updateThemeBtn(saved);

    if (!btn) return;
    btn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('docsTheme', next);
      updateThemeBtn(next);
    });
  }

  function updateThemeBtn(theme) {
    const btn = document.getElementById('themeBtn');
    if (btn) btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
  }

  /* ---------------------------------------------------------------
     MOBILE SIDEBAR
  --------------------------------------------------------------- */
  function initSidebar() {
    const menuBtn   = document.getElementById('menuBtn');
    const sidebar   = document.getElementById('sidebar');
    const overlay   = document.getElementById('sidebarOverlay');

    if (!menuBtn || !sidebar) return;

    menuBtn.addEventListener('click', toggleSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);

    // Save sidebar scroll position before clicking links
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.addEventListener('click', () => {
        if (sidebar) {
          sessionStorage.setItem('sidebarScrollPos', sidebar.scrollTop);
        }
        closeSidebar();
      });
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSidebar();
    });

    // Mark active sidebar link
    markActiveSidebarLink();
  }

  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const btn     = document.getElementById('menuBtn');
    const isOpen  = sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('open', isOpen);
    if (btn) btn.classList.toggle('open', isOpen);
    document.body.classList.toggle('no-scroll', isOpen);
  }

  function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const btn     = document.getElementById('menuBtn');
    if (sidebar)  sidebar.classList.remove('open');
    if (overlay)  overlay.classList.remove('open');
    if (btn)      btn.classList.remove('open');
    document.body.classList.remove('no-scroll');
  }

  function markActiveSidebarLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const sidebar = document.getElementById('sidebar');

    // Restore sidebar scroll position if saved
    const savedScroll = sessionStorage.getItem('sidebarScrollPos');
    if (sidebar && savedScroll) {
      setTimeout(() => {
        sidebar.scrollTop = parseInt(savedScroll);
      }, 0);
    }

    document.querySelectorAll('.sidebar-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      const linkFile = href.split('/').pop();
      if (linkFile === currentPath || (currentPath === '' && linkFile === 'index.html')) {
        link.classList.add('active');
        // Expand parent if nested
        const section = link.closest('.sidebar-section');
        if (section) section.classList.add('expanded');
      }
    });
  }

  /* ---------------------------------------------------------------
     COPY TO CLIPBOARD
  --------------------------------------------------------------- */
  function initCopyButtons() {
    // Add copy button to every .code-block
    document.querySelectorAll('.code-block').forEach(block => {
      const header = block.querySelector('.code-block-header');
      if (!header || header.querySelector('.copy-btn')) return;

      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.innerHTML = '📋 Copy';
      btn.addEventListener('click', () => copyCode(btn, block));
      header.appendChild(btn);
    });

    // Also handle bare <pre> blocks
    document.querySelectorAll('pre:not(.code-block pre)').forEach(pre => {
      if (pre.parentElement.classList.contains('code-block')) return;

      const wrapper = document.createElement('div');
      wrapper.style.position = 'relative';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.style.cssText = 'position:absolute;top:8px;right:8px;';
      btn.innerHTML = '📋';
      btn.title = 'Copy code';
      btn.addEventListener('click', () => copyCodeFromPre(btn, pre));
      wrapper.appendChild(btn);
    });
  }

  function copyCode(btn, block) {
    const code = block.querySelector('code') || block.querySelector('pre');
    if (!code) return;
    navigator.clipboard.writeText(code.textContent.trim()).then(() => {
      btn.innerHTML = '✅ Copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.innerHTML = '📋 Copy';
        btn.classList.remove('copied');
      }, 2000);
    }).catch(() => {
      fallbackCopy(code.textContent);
    });
  }

  function copyCodeFromPre(btn, pre) {
    navigator.clipboard.writeText(pre.textContent.trim()).then(() => {
      btn.innerHTML = '✅';
      setTimeout(() => { btn.innerHTML = '📋'; }, 2000);
    });
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

  /* ---------------------------------------------------------------
     TABLE OF CONTENTS — AUTO GENERATE
  --------------------------------------------------------------- */
  function initTOC() {
    const tocList = document.getElementById('tocList');
    if (!tocList) return;

    const article = document.querySelector('.article') || document.querySelector('.content-wrapper');
    if (!article) return;

    const headings = article.querySelectorAll('h2, h3');
    if (headings.length < 3) {
      const tocSidebar = document.getElementById('tocSidebar');
      if (tocSidebar) tocSidebar.style.display = 'none';
      return;
    }

    headings.forEach((h, i) => {
      if (!h.id) h.id = 'heading-' + i;
      const li = document.createElement('li');
      const a  = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      if (h.tagName === 'H3') a.classList.add('toc-h3');
      li.appendChild(a);
      tocList.appendChild(li);
    });

    // Highlight active section on scroll
    initTOCObserver();
  }

  function initTOCObserver() {
    const tocLinks = document.querySelectorAll('#tocList a');
    if (!tocLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          tocLinks.forEach(l => l.classList.remove('active'));
          const active = document.querySelector(`#tocList a[href="#${entry.target.id}"]`);
          if (active) active.classList.add('active');
        }
      });
    }, { rootMargin: '-20% 0% -70% 0%' });

    document.querySelectorAll('h2[id], h3[id]').forEach(h => observer.observe(h));
  }

  /* ---------------------------------------------------------------
     SEARCH
  --------------------------------------------------------------- */
  const searchData = [
    { title: 'Architecture & Project Setup', section: 'Web API', url: 'webapi-architecture.html', icon: '🏗️' },
    { title: 'Controllers & REST API',       section: 'Web API', url: 'webapi-controllers.html', icon: '🎮' },
    { title: 'Models & DTOs',                section: 'Web API', url: 'webapi-models.html',       icon: '📦' },
    { title: 'Dependency Injection',         section: 'Web API', url: 'webapi-di.html',           icon: '💉' },
    { title: 'Middleware Pipeline',          section: 'Web API', url: 'webapi-middleware.html',   icon: '⚙️' },
    { title: 'Caching Strategies',           section: 'Web API', url: 'webapi-caching.html',      icon: '⚡' },
    { title: 'Error Handling',               section: 'Web API', url: 'webapi-error-handling.html', icon: '🚨' },
    { title: 'GraphQL & HotChocolate',       section: 'Web API', url: 'webapi-graphql.html',      icon: '🌐' },
    { title: 'Entity Framework Core',        section: 'Data Access', url: 'ef-core.html',         icon: '🗄️' },
    { title: 'ADO.NET',                      section: 'Data Access', url: 'ado-net.html',          icon: '💾' },
    { title: 'LINQ & Filtering',             section: 'Data Access', url: 'linq.html',             icon: '🔗' },
    { title: 'Collections in C#',            section: 'Data Access', url: 'collections.html',      icon: '📊' },
    { title: 'Interview Q&A',                section: 'Interview', url: 'interview.html',          icon: '🎓' },
  ];

  function initSearch() {
    const modal       = document.getElementById('searchModal');
    const input       = document.getElementById('searchInput');
    const results     = document.getElementById('searchResults');
    const openBtns    = document.querySelectorAll('[data-search-open]');
    const closeBtn    = document.getElementById('searchClose');

    if (!modal) return;

    openBtns.forEach(btn => btn.addEventListener('click', openSearch));
    if (closeBtn) closeBtn.addEventListener('click', closeSearch);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeSearch();
    });

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeSearch();
      }
    });

    if (input) {
      input.addEventListener('input', () => renderSearchResults(input.value));
    }
  }

  function openSearch() {
    const modal = document.getElementById('searchModal');
    const input = document.getElementById('searchInput');
    if (!modal) return;
    modal.classList.add('open');
    document.body.classList.add('no-scroll');
    if (input) { input.value = ''; input.focus(); }
    renderSearchResults('');
  }

  function closeSearch() {
    const modal = document.getElementById('searchModal');
    if (modal) modal.classList.remove('open');
    document.body.classList.remove('no-scroll');
  }

  function renderSearchResults(query) {
    const results = document.getElementById('searchResults');
    if (!results) return;

    const filtered = query
      ? searchData.filter(item =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.section.toLowerCase().includes(query.toLowerCase())
        )
      : searchData;

    if (!filtered.length) {
      results.innerHTML = '<div class="search-empty">No results found for "' + query + '"</div>';
      return;
    }

    results.innerHTML = filtered.map(item => `
      <a href="${item.url}" class="search-result" onclick="closeSearch()">
        <span class="search-result-icon">${item.icon}</span>
        <div>
          <div class="search-result-title">${item.title}</div>
          <div class="search-result-section">${item.section}</div>
        </div>
      </a>
    `).join('');
  }

  /* ---------------------------------------------------------------
     CODE HIGHLIGHTING (highlight.js)
  --------------------------------------------------------------- */
  function initHighlight() {
    if (typeof hljs !== 'undefined') {
      document.querySelectorAll('pre code').forEach(block => {
        hljs.highlightElement(block);
      });
    }
  }

  /* ---------------------------------------------------------------
     SCROLL ANIMATIONS
  --------------------------------------------------------------- */
  function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-up');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.topic-card, .project-card, .path-card, .card').forEach(el => {
      el.style.opacity = '0';
      observer.observe(el);
    });
  }

  /* ---------------------------------------------------------------
     SMOOTH SCROLL FOR ANCHOR LINKS
  --------------------------------------------------------------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', function (e) {
        const id = this.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Update URL without reload
          history.pushState(null, '', '#' + id);
        }
      });
    });
  }

  /* ---------------------------------------------------------------
     READING PROGRESS BAR
  --------------------------------------------------------------- */
  function initReadingProgress() {
    const bar = document.getElementById('readingProgress');
    if (!bar) return;

    window.addEventListener('scroll', () => {
      const doc = document.documentElement;
      const scrolled = doc.scrollTop;
      const total = doc.scrollHeight - doc.clientHeight;
      const pct = total > 0 ? (scrolled / total) * 100 : 0;
      bar.style.width = pct + '%';
    });
  }


  /* ---------------------------------------------------------------
     SIDEBAR COLLAPSE (DESKTOP)
  --------------------------------------------------------------- */
  function initCollapseBtn() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    const inner = sidebar.querySelector('.sidebar-inner');
    if (!inner) return;

    // Inject ‹ collapse button into the sidebar
    const collapseBtn = document.createElement('button');
    collapseBtn.id        = 'sidebarToggle';
    collapseBtn.className = 'sidebar-toggle';
    collapseBtn.setAttribute('aria-label', 'Toggle sidebar');
    collapseBtn.innerHTML = '&#8249;'; // ‹
    inner.appendChild(collapseBtn);

    // Inject › re-open tab that sticks on the left edge when collapsed
    const openTab = document.createElement('button');
    openTab.className = 'sidebar-open-tab';
    openTab.setAttribute('aria-label', 'Open sidebar');
    openTab.innerHTML = '&#8250;'; // ›
    document.body.appendChild(openTab);

    // Restore persisted collapse state
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
      document.body.classList.add('sidebar-collapsed');
      collapseBtn.innerHTML = '&#8250;';
    }

    function toggle() {
      const collapsed = document.body.classList.toggle('sidebar-collapsed');
      collapseBtn.innerHTML = collapsed ? '&#8250;' : '&#8249;';
      localStorage.setItem('sidebarCollapsed', collapsed);
    }

    collapseBtn.addEventListener('click', toggle);
    openTab.addEventListener('click', toggle);
  }

  /* ---------------------------------------------------------------
     PROJECT COLLAPSIBLE TOPICS
  --------------------------------------------------------------- */
  function initProjectCollapse() {
    const headers = document.querySelectorAll('.sidebar-project-header');

    headers.forEach(header => {
      const projectName = header.getAttribute('data-project');
      const topics = header.nextElementSibling;

      if (!topics || !topics.classList.contains('sidebar-project-topics')) {
        return;
      }

      // Check if this project is the "active" one (page belongs to it)
      const activeLink = topics.querySelector('.sidebar-link.active');
      const shouldExpand = activeLink !== null;

      // Restore from localStorage or use default
      const savedState = localStorage.getItem(`project-${projectName}`);
      if (savedState !== null) {
        if (savedState === 'collapsed') {
          header.classList.add('collapsed');
          topics.classList.add('collapsed');
        } else {
          header.classList.remove('collapsed');
          topics.classList.remove('collapsed');
        }
      } else if (!shouldExpand) {
        // Default: collapse all except active
        header.classList.add('collapsed');
        topics.classList.add('collapsed');
      }

      // Toggle on click
      header.addEventListener('click', () => {
        header.classList.toggle('collapsed');
        topics.classList.toggle('collapsed');

        const isCollapsed = header.classList.contains('collapsed');
        localStorage.setItem(`project-${projectName}`, isCollapsed ? 'collapsed' : 'expanded');
      });
    });
  }

  /* ---------------------------------------------------------------
     INIT
  --------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSidebar();
    initCollapseBtn();
    initProjectCollapse();
    initCopyButtons();
    initTOC();
    initSearch();
    initHighlight();
    initSmoothScroll();
    initReadingProgress();

    // Light animation for visible elements
    setTimeout(initAnimations, 100);
  });

  // Export for inline use
  window.closeSearch = closeSearch;
  window.toggleSidebar = toggleSidebar;

})();
