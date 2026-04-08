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

    // Clear scroll history when clicking logo to go home
    const logo = document.querySelector('.site-logo');
    if (logo) {
      logo.addEventListener('click', () => {
        sessionStorage.removeItem('sidebarScrollPos');
      });
    }

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

    // Restore sidebar scroll position if saved (but not on homepage)
    const isHomepage = currentPath === '' || currentPath === 'index.html';
    if (!isHomepage && sidebar) {
      const savedScroll = sessionStorage.getItem('sidebarScrollPos');
      if (savedScroll) {
        setTimeout(() => {
          sidebar.scrollTop = parseInt(savedScroll);
        }, 0);
      }
    } else if (isHomepage && sidebar) {
      // Always scroll to top on homepage
      sidebar.scrollTop = 0;
      sessionStorage.removeItem('sidebarScrollPos');
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
    // Web API
    { title: 'Web API Overview', section: 'Web API', url: 'webapi.html', icon: '🌐', keywords: 'rest api asp.net', description: 'Complete guide to building REST APIs with ASP.NET Core' },
    { title: 'Architecture & Project Setup', section: 'Web API', url: 'webapi-architecture.html', icon: '🏗️', keywords: 'architecture project setup', description: 'Learn how to structure a Web API project' },
    { title: 'Controllers & REST API', section: 'Web API', url: 'webapi-controllers.html', icon: '🎮', keywords: 'controller action routing endpoints', description: 'Build controllers and define REST endpoints' },
    { title: 'Models & DTOs', section: 'Web API', url: 'webapi-models.html', icon: '📦', keywords: 'model dto data transfer object', description: 'Model design and DTOs' },
    { title: 'Dependency Injection', section: 'Web API', url: 'webapi-di.html', icon: '💉', keywords: 'dependency injection di ioc container', description: 'Master DI patterns' },
    { title: 'Middleware Pipeline', section: 'Web API', url: 'webapi-middleware.html', icon: '⚙️', keywords: 'middleware pipeline request response', description: 'Understand middleware pipeline' },
    { title: 'Caching Strategies', section: 'Web API', url: 'webapi-caching.html', icon: '⚡', keywords: 'cache caching performance redis', description: 'Implement caching for performance' },
    { title: 'Error Handling', section: 'Web API', url: 'webapi-error-handling.html', icon: '🚨', keywords: 'error exception handling validation', description: 'Proper error handling' },
    { title: 'Data Access & Queries', section: 'Web API', url: 'webapi-data-access.html', icon: '🗾', keywords: 'database query data access', description: 'Data access patterns' },
    { title: 'GraphQL & HotChocolate', section: 'Web API', url: 'webapi-graphql.html', icon: '📊', keywords: 'graphql query mutation hotchocolate', description: 'Build GraphQL APIs' },

    // MVC
    { title: 'MVC Pattern', section: 'MVC', url: 'mvc.html', icon: '🖥️', keywords: 'mvc model view controller pattern', description: 'Complete MVC pattern explanation' },
    { title: 'MVC Setup & Installation', section: 'MVC', url: 'mvc-setup.html', icon: '📥', keywords: 'setup install create project', description: 'Set up MVC projects' },
    { title: 'Controllers & Actions', section: 'MVC', url: 'mvc-controllers.html', icon: '🎮', keywords: 'controller action routing', description: 'Build MVC controllers' },
    { title: 'Views & Razor Templates', section: 'MVC', url: 'mvc-views.html', icon: '👁️', keywords: 'view razor html template', description: 'Create views with Razor' },
    { title: 'Models & ViewModels', section: 'MVC', url: 'mvc-models.html', icon: '📦', keywords: 'model viewmodel data', description: 'Design models and ViewModels' },
    { title: 'Services & Business Logic', section: 'MVC', url: 'mvc-services.html', icon: '⚙️', keywords: 'service business logic repository', description: 'Implement services' },

    // Data Access
    { title: 'Entity Framework Core', section: 'Data Access', url: 'ef-core.html', icon: '🗄️', keywords: 'entity framework core ef orm database', description: 'Master EF Core ORM' },
    { title: 'ADO.NET', section: 'Data Access', url: 'ado-net.html', icon: '💾', keywords: 'ado.net connection command sqlcommand', description: 'Work with ADO.NET' },
    { title: 'LINQ & Filtering', section: 'Data Access', url: 'linq.html', icon: '🔗', keywords: 'linq query filter select where', description: 'Master LINQ queries' },
    { title: 'Collections in C#', section: 'Data Access', url: 'collections.html', icon: '📊', keywords: 'collection list dictionary array enumerable', description: 'Work with C# collections' },

    // React
    { title: 'React Fundamentals', section: 'React', url: 'react.html', icon: '⚛️', keywords: 'react component jsx', description: 'Learn React fundamentals' },
    { title: 'React Setup & Installation', section: 'React', url: 'react-setup.html', icon: '📥', keywords: 'setup vite npm create-react-app', description: 'Set up React projects' },
    { title: 'React Hooks', section: 'React', url: 'react-hooks.html', icon: '⚙️', keywords: 'hooks usestate useeffect functional', description: 'Master React Hooks' },
    { title: 'Custom Hooks', section: 'React', url: 'react-custom-hooks.html', icon: '🪝', keywords: 'custom hook reusable logic', description: 'Create custom hooks' },
    { title: 'Context API', section: 'React', url: 'react-context.html', icon: '🎯', keywords: 'context usecontext provider theme', description: 'State management with Context' },
    { title: 'Parent-Child Communication', section: 'React', url: 'react-parent-child.html', icon: '👨‍👧', keywords: 'props callback lifting state data flow', description: 'Pass data between components' },
    { title: 'Redux State Management', section: 'React', url: 'react-redux.html', icon: '🏪', keywords: 'redux actions reducers store dispatch', description: 'Advanced state management' },
    { title: 'React Forms', section: 'React', url: 'react-forms.html', icon: '📝', keywords: 'form input validation controlled', description: 'Build and handle forms' },
    { title: 'React Router', section: 'React', url: 'react-router.html', icon: '🗺️', keywords: 'routing navigation link route', description: 'Client-side routing' },

    // Angular
    { title: 'Angular Fundamentals', section: 'Angular', url: 'angular.html', icon: '🔺', keywords: 'angular typescript component', description: 'Learn Angular fundamentals' },
    { title: 'Angular Setup & Installation', section: 'Angular', url: 'angular-setup.html', icon: '📥', keywords: 'setup cli ng new', description: 'Set up Angular projects' },
    { title: 'Components', section: 'Angular', url: 'angular-components.html', icon: '🧩', keywords: 'component decorator selector template', description: 'Build Angular components' },
    { title: 'Services & Dependency Injection', section: 'Angular', url: 'angular-services.html', icon: '⚙️', keywords: 'service injectable providein', description: 'Create services' },
    { title: 'RxJS & Observables', section: 'Angular', url: 'angular-rxjs.html', icon: '📡', keywords: 'rxjs observable subject pipe reactive', description: 'Reactive programming' },
    { title: 'Parent-Child Communication', section: 'Angular', url: 'angular-parent-child.html', icon: '👨‍👧', keywords: 'input output eventemitter viewchild', description: 'Component communication' },
    { title: 'Forms & Validation', section: 'Angular', url: 'angular-forms.html', icon: '📝', keywords: 'form formcontrol validation reactive', description: 'Build Angular forms' },
    { title: 'Routing & Navigation', section: 'Angular', url: 'angular-router.html', icon: '🗺️', keywords: 'router routing navigation module', description: 'Client-side routing' },

    // C# & OOP
    { title: 'C# Programming', section: 'C#', url: 'csharp.html', icon: '💠', keywords: 'csharp language syntax basics', description: 'C# language fundamentals' },
    { title: 'Interview Q&A', section: 'Interview', url: 'interview.html', icon: '🎓', keywords: 'interview questions answers backend', description: 'General interview Q&A' },
    { title: 'C# Interview Q&A', section: 'Interview', url: 'interview-csharp.html', icon: '🎓', keywords: 'csharp interview oop encapsulation inheritance', description: 'C# and OOP interview questions' },
    { title: 'MVC Interview Q&A', section: 'Interview', url: 'interview-mvc.html', icon: '🎓', keywords: 'mvc interview controller view pattern', description: 'MVC interview Q&A' },
    { title: 'MVC Extended Q&A', section: 'Interview', url: 'interview-mvc-extended.html', icon: '📚', keywords: 'extended mvc advanced', description: 'Advanced MVC concepts' },
    { title: 'React Interview Q&A', section: 'Interview', url: 'interview-react.html', icon: '🎓', keywords: 'react interview hooks lifecycle component', description: 'React interview Q&A' },
    { title: 'React Extended Q&A', section: 'Interview', url: 'interview-react-extended.html', icon: '📚', keywords: 'extended react advanced performance', description: 'Advanced React concepts' },
    { title: 'Angular Interview Q&A', section: 'Interview', url: 'interview-angular.html', icon: '🎓', keywords: 'angular interview module decorator service', description: 'Angular interview Q&A' },
    { title: 'Angular Extended Q&A', section: 'Interview', url: 'interview-angular-extended.html', icon: '📚', keywords: 'extended angular advanced', description: 'Advanced Angular concepts' },
    { title: 'Design Patterns & SOLID', section: 'Interview', url: 'interview-patterns.html', icon: '🏗️', keywords: 'pattern singleton factory solid design', description: 'Design patterns' },
    { title: 'SOLID Principles', section: 'Interview', url: 'interview-solid.html', icon: '✅', keywords: 'solid single responsibility open closed', description: 'SOLID principles deep dive' },
    { title: 'SQL & Database', section: 'Interview', url: 'interview-sql.html', icon: '🗄️', keywords: 'sql query join group having database', description: 'Database and SQL' },
    { title: 'Coding Challenges', section: 'Interview', url: 'interview-coding.html', icon: '💻', keywords: 'coding algorithm problem solving', description: 'Coding challenges' },

    // Performance & Tools
    { title: 'Performance Optimization', section: 'Advanced', url: 'performance.html', icon: '⚡', keywords: 'performance optimization speed profiling', description: 'Optimize performance' },
    { title: 'Learning Paths', section: 'Guides', url: 'learning-paths.html', icon: '🎯', keywords: 'learning path guide roadmap', description: 'Structured learning paths' },
    { title: 'Code Compiler', section: 'Tools', url: 'compiler.html', icon: '🚀', keywords: 'compiler execute code run', description: 'Online code compiler' },

    // Advanced Architecture
    { title: 'Microservices Architecture', section: 'Advanced Architecture', url: 'microservices.html', icon: '🔌', keywords: 'microservices architecture breaking monolith services', description: 'Break monolithic backend into independent services' },
    { title: 'Event-Driven Architecture', section: 'Advanced Architecture', url: 'event-driven-architecture.html', icon: '⚡', keywords: 'event driven architecture publishers subscribers event bus', description: 'Publish-subscribe pattern for decoupled services' },
    { title: 'Kafka Message Streaming', section: 'Advanced Architecture', url: 'kafka.html', icon: '📡', keywords: 'kafka topics partitions consumers message streaming high throughput', description: 'Distributed event streaming platform for high-throughput scenarios' },
    { title: 'RabbitMQ vs Kafka Comparison', section: 'Advanced Architecture', url: 'rabbitmq-kafka-comparison.html', icon: '⚔️', keywords: 'rabbitmq kafka comparison message broker when to use', description: 'Compare two message brokers and choose the right one' },
    { title: 'Micro Frontends (MFE)', section: 'Advanced Architecture', url: 'mfe.html', icon: '🎨', keywords: 'micro frontend mfe module federation webpack independent deployment', description: 'Break frontend monolith into independent applications' },

    // DevOps & Infrastructure
    { title: 'Docker - Containerization', section: 'DevOps', url: 'docker.html', icon: '🐳', keywords: 'docker container image dockerfile multi-stage build containerization', description: 'Package apps with dependencies, works everywhere - standardized, reproducible deployment' },
    { title: 'Kubernetes - Orchestration', section: 'DevOps', url: 'kubernetes.html', icon: '☸️', keywords: 'kubernetes k8s pods deployment service auto-scaling self-healing rolling update', description: 'Orchestrate containers, auto-scaling, self-healing, zero-downtime deployments' },
    { title: 'Git & Version Control', section: 'DevOps', url: 'git-version-control.html', icon: '🔀', keywords: 'git version control branches pull request code review ci/cd pipeline github', description: 'Collaborate on code, track changes, code review, automated CI/CD pipeline' },
    { title: 'Complete Deployment Flow', section: 'DevOps', url: 'git-docker-kubernetes-flow.html', icon: '🚀', keywords: 'deployment pipeline git docker kubernetes cicd continuous integration automatic rollback', description: 'End-to-end: commit code → tests → Docker build → K8s deploy → Live in production' },

    // React Inner Topics
    { title: 'useState & useEffect Hooks', section: 'React', url: 'react-hooks.html', icon: '⚙️', keywords: 'usestate useeffect hooks state side effects dependency array cleanup', description: 'Core hooks for state management and side effects' },
    { title: 'React Context API & Prop Drilling', section: 'React', url: 'react-context.html', icon: '🎯', keywords: 'context createcontext usecontent prop drilling state sharing', description: 'Avoid prop drilling with Context API for global state' },
    { title: 'React Forms & Validation', section: 'React', url: 'react-forms.html', icon: '📝', keywords: 'form input controlled component validation submission handling', description: 'Build and validate forms, handle submissions' },

    // Angular Inner Topics
    { title: 'Angular Components & Decorators', section: 'Angular', url: 'angular-components.html', icon: '🧩', keywords: 'component decorator selector template binding lifecycle', description: 'Create components with decorators, bindings, lifecycle hooks' },
    { title: 'Angular Forms & Validation', section: 'Angular', url: 'angular-forms.html', icon: '📝', keywords: 'formcontrol formgroup validators reactive forms template driven', description: 'Build reactive and template-driven forms' },

    // MVC Inner Topics
    { title: 'MVC Controllers & Routing', section: 'MVC', url: 'mvc-controllers.html', icon: '🎮', keywords: 'controller routing action method http verbs post get put delete filters', description: 'Create controllers, define routes, handle HTTP requests' },
    { title: 'Razor Views & Templates', section: 'MVC', url: 'mvc-views.html', icon: '👁️', keywords: 'razor view template layout partial html asp.net', description: 'Build dynamic views with Razor syntax, layouts, and partials' },

    // Web API Inner Topics
    { title: 'REST Controllers & Endpoints', section: 'Web API', url: 'webapi-controllers.html', icon: '🎮', keywords: 'rest api controller action endpoint http routing', description: 'Design REST API controllers and endpoints' },
    { title: 'Models, DTOs & Validation', section: 'Web API', url: 'webapi-models.html', icon: '📦', keywords: 'model dto data transfer object validation automapper', description: 'Create models and DTOs, map between layers' },

    // Data Access Inner Topics
    { title: 'Entity Framework CRUD Operations', section: 'Data Access', url: 'ef-core.html', icon: '🗄️', keywords: 'entity framework crud create read update delete migrations relationships', description: 'CRUD operations, migrations, relationships in EF Core' },
    { title: 'LINQ Queries & Filtering', section: 'Data Access', url: 'linq.html', icon: '🔗', keywords: 'linq where select orderby groupby join aggregate performance', description: 'Write efficient LINQ queries for data filtering and transformation' },

    // Web API Advanced Topics
    { title: 'Dependency Injection & IoC', section: 'Web API', url: 'webapi-di.html', icon: '💉', keywords: 'dependency injection ioc container services registration scoped singleton', description: 'Implement DI for loose coupling and testability' },
    { title: 'Middleware Pipeline & Request Flow', section: 'Web API', url: 'webapi-middleware.html', icon: '⚙️', keywords: 'middleware pipeline request response cors authentication error handling', description: 'Understand middleware execution and request processing' },
    { title: 'API Caching & Performance', section: 'Web API', url: 'webapi-caching.html', icon: '⚡', keywords: 'cache caching performance redis distributed memory output response cache', description: 'Improve API performance with caching strategies' },
    { title: 'Error Handling & Responses', section: 'Web API', url: 'webapi-error-handling.html', icon: '🚨', keywords: 'error exception handling validation response status code problem details', description: 'Proper error handling and response formatting' },
    { title: 'Data Access Patterns', section: 'Web API', url: 'webapi-data-access.html', icon: '🗾', keywords: 'database repository pattern query database access data layer', description: 'Implement data access patterns and repository pattern' },
    { title: 'GraphQL APIs with HotChocolate', section: 'Web API', url: 'webapi-graphql.html', icon: '📊', keywords: 'graphql query mutation hotchocolate schema types resolvers', description: 'Build GraphQL APIs as alternative to REST' },

    // MVC Advanced Topics
    { title: 'MVC Models & ViewModels', section: 'MVC', url: 'mvc-models.html', icon: '📦', keywords: 'model viewmodel data binding validation mapping strongly typed', description: 'Design models and ViewModels for MVC views' },
    { title: 'MVC Services & Business Logic', section: 'MVC', url: 'mvc-services.html', icon: '⚙️', keywords: 'service business logic repository pattern dependency injection', description: 'Implement services for business logic separation' },

    // C# Features & Concepts
    { title: 'C# Syntax & Fundamentals', section: 'C#', url: 'csharp.html', icon: '💠', keywords: 'csharp language syntax classes methods properties variables types', description: 'Learn C# language basics and syntax' },

    // Architecture Concepts - More Detailed
    { title: 'Microservices Deployment & Scaling', section: 'Advanced Architecture', url: 'microservices.html', icon: '🔌', keywords: 'microservices scaling deployment docker kubernetes orchestration', description: 'Deploy and scale microservices with containers' },
    { title: 'Event Bus & Message Brokers', section: 'Advanced Architecture', url: 'event-driven-architecture.html', icon: '⚡', keywords: 'event bus kafka rabbitmq publishers subscribers event handling', description: 'Implement event-driven patterns with message brokers' },
    { title: 'Kafka Topics & Consumers', section: 'Advanced Architecture', url: 'kafka.html', icon: '📡', keywords: 'kafka topics partitions consumer groups offset producer throughput', description: 'Master Kafka architecture and consumer patterns' },
    { title: 'Message Broker Selection Guide', section: 'Advanced Architecture', url: 'rabbitmq-kafka-comparison.html', icon: '⚔️', keywords: 'rabbitmq kafka comparison choosing broker throughput latency guarantees', description: 'Compare message brokers and choose the right one' },
    { title: 'Module Federation & MFE', section: 'Advanced Architecture', url: 'mfe.html', icon: '🎨', keywords: 'micro frontend module federation webpack independent deployment shared libraries', description: 'Implement micro frontends for independent frontend teams' },

    // Performance & Learning
    { title: 'Performance Profiling & Optimization', section: 'Advanced', url: 'performance.html', icon: '⚡', keywords: 'performance profiling dotnet benchmark memory cpu caching optimization', description: 'Profile and optimize application performance' },
    { title: 'Structured Learning & Skill Paths', section: 'Guides', url: 'learning-paths.html', icon: '🎯', keywords: 'learning path guide roadmap curriculum backend frontend full stack', description: 'Follow guided learning paths for different skill levels' },

    // Coding Challenges - C#
    { title: 'Compare Two Objects - Reference vs Value Types', section: 'Coding Challenges', url: 'interview-coding.html#csharp-1', icon: '💻', keywords: 'reference value type comparison csharp object', description: 'Understand reference vs value types through object comparison' },
    { title: 'Valid Braces/Parentheses Matching - Stack', section: 'Coding Challenges', url: 'interview-coding.html#csharp-2', icon: '💻', keywords: 'braces parentheses matching balanced stack validation', description: 'Check if braces, parentheses are balanced using stack data structure' },
    { title: 'Reverse String - Multiple Approaches', section: 'Coding Challenges', url: 'interview-coding.html#csharp-3', icon: '💻', keywords: 'string reverse array builtin algorithm', description: 'Reverse a string using different techniques' },
    { title: 'Fibonacci Series - Recursive, Iterative, Memoization', section: 'Coding Challenges', url: 'interview-coding.html#csharp-4', icon: '💻', keywords: 'fibonacci recursive iterative memoization dynamic programming', description: 'Implement Fibonacci with different optimization approaches' },
    { title: 'Prime Number Check', section: 'Coding Challenges', url: 'interview-coding.html#csharp-5', icon: '💻', keywords: 'prime number check divisor mathematical algorithm', description: 'Determine if a number is prime efficiently' },
    { title: 'Remove Duplicates from Array', section: 'Coding Challenges', url: 'interview-coding.html#csharp-6', icon: '💻', keywords: 'remove duplicates array deduplication hashset', description: 'Remove duplicate elements while preserving order' },
    { title: 'String Rotation Check', section: 'Coding Challenges', url: 'interview-coding.html#csharp-7', icon: '💻', keywords: 'string rotation rotation check substring', description: 'Check if one string is a rotation of another' },
    { title: 'Anagram Detection', section: 'Coding Challenges', url: 'interview-coding.html#csharp-8', icon: '💻', keywords: 'anagram detection character count sorting comparison', description: 'Determine if two strings are anagrams' },

    // Coding Challenges - SQL
    { title: 'Nth Highest Salary - ROW_NUMBER, DENSE_RANK, CTE', section: 'Coding Challenges', url: 'interview-coding.html#sql-1', icon: '💻', keywords: 'nth highest salary rank dense rank cte window function sql', description: 'Find nth highest salary using window functions and CTEs' },
    { title: 'Maximum Salary Per Department', section: 'Coding Challenges', url: 'interview-coding.html#sql-2', icon: '💻', keywords: 'maximum salary department group by aggregate sql', description: 'Calculate max salary per department using GROUP BY' },
    { title: 'Running Total - SUM OVER Window Function', section: 'Coding Challenges', url: 'interview-coding.html#sql-3', icon: '💻', keywords: 'running total cumulative sum window function over sql', description: 'Calculate running totals using SUM OVER window function' },
    { title: 'Gap Detection in Sequence', section: 'Coding Challenges', url: 'interview-coding.html#sql-4', icon: '💻', keywords: 'gap detection sequence missing values sql', description: 'Find gaps in sequential data' },
    { title: 'Find Duplicate Records', section: 'Coding Challenges', url: 'interview-coding.html#sql-5', icon: '💻', keywords: 'duplicate records find duplicates group by having sql', description: 'Identify duplicate rows in a table' },
    { title: 'RANK vs DENSE_RANK vs ROW_NUMBER', section: 'Coding Challenges', url: 'interview-coding.html#sql-6', icon: '💻', keywords: 'rank dense rank row number window function comparison sql', description: 'Understand differences between ranking window functions' },

    // Coding Challenges - JavaScript
    { title: 'Debounce Function Implementation', section: 'Coding Challenges', url: 'interview-coding.html#js-1', icon: '💻', keywords: 'debounce function implementation timer delay event', description: 'Implement debounce to limit function execution' },
    { title: 'Promise Chain vs Async/Await - Error Handling', section: 'Coding Challenges', url: 'interview-coding.html#js-2', icon: '💻', keywords: 'promise async await error handling try catch', description: 'Compare promise chains and async/await patterns' },
    { title: 'Event Loop Execution Order - Callbacks, Promises, setTimeout', section: 'Coding Challenges', url: 'interview-coding.html#js-3', icon: '💻', keywords: 'event loop callback promise settimeout microtask macrotask', description: 'Understand JavaScript event loop execution order' },
    { title: 'Deep Clone vs Shallow Clone', section: 'Coding Challenges', url: 'interview-coding.html#js-4', icon: '💻', keywords: 'deep clone shallow clone object copy recursion', description: 'Implement deep cloning to copy nested objects' },
    { title: 'Closure Counter Pattern', section: 'Coding Challenges', url: 'interview-coding.html#js-5', icon: '💻', keywords: 'closure counter function closure encapsulation', description: 'Use closures to create counters with private variables' },

    // Coding Challenges - Algorithms
    { title: 'Two Sum - Array', section: 'Coding Challenges', url: 'interview-coding.html#algo-1', icon: '💻', keywords: 'two sum target array hash map algorithm', description: 'Find two numbers that sum to a target value' },
    { title: 'Longest Substring Without Repeating Characters', section: 'Coding Challenges', url: 'interview-coding.html#algo-2', icon: '💻', keywords: 'longest substring repeating characters sliding window', description: 'Find longest substring with unique characters using sliding window' },
    { title: 'Merge Sorted Arrays', section: 'Coding Challenges', url: 'interview-coding.html#algo-3', icon: '💻', keywords: 'merge sorted arrays combine sort algorithm', description: 'Merge two sorted arrays efficiently' },
    { title: 'Binary Search vs Linear Search', section: 'Coding Challenges', url: 'interview-coding.html#algo-4', icon: '💻', keywords: 'binary search linear search performance comparison', description: 'Understand search algorithm differences and optimization' },
    { title: 'Linked List Reversal - Iterative & Recursive', section: 'Coding Challenges', url: 'interview-coding.html#algo-5', icon: '💻', keywords: 'linked list reversal iterative recursive node pointer', description: 'Reverse a linked list using iteration and recursion' },
    { title: 'Tree Traversal - DFS & BFS', section: 'Coding Challenges', url: 'interview-coding.html#algo-6', icon: '💻', keywords: 'tree traversal dfs bfs depth first breadth first', description: 'Traverse trees using depth-first and breadth-first search' }
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
      // Press Enter to go to search results page
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
          e.preventDefault();
          const query = encodeURIComponent(input.value);
          window.location.href = `search.html?q=${query}`;
        }
      });
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
          item.section.toLowerCase().includes(query.toLowerCase()) ||
          item.keywords.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
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
     PIN MENU ITEMS (UP TO 5)
  --------------------------------------------------------------- */
  function initPinning() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    // Get pinned items from localStorage
    const pinnedItems = JSON.parse(localStorage.getItem('pinnedMenuItems') || '[]');

    // Add pin buttons to all sidebar links
    document.querySelectorAll('.sidebar-link:not(.sidebar-pinned-item .sidebar-link)').forEach(link => {
      const href = link.getAttribute('href') || '';
      const text = link.textContent.trim();

      const pinBtn = document.createElement('button');
      pinBtn.className = 'pin-btn';
      pinBtn.innerHTML = '📌';
      pinBtn.title = 'Pin to favorites';
      pinBtn.setAttribute('data-href', href);
      pinBtn.setAttribute('data-text', text);

      // Check if already pinned
      if (pinnedItems.some(item => item.href === href)) {
        pinBtn.classList.add('pinned');
      }

      pinBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        togglePin(pinBtn, href, text);
      });

      link.appendChild(pinBtn);
    });

    // Render pinned section
    renderPinnedSection(pinnedItems);
  }

  function togglePin(btn, href, text) {
    let pinnedItems = JSON.parse(localStorage.getItem('pinnedMenuItems') || '[]');
    const isPinned = btn.classList.contains('pinned');

    if (isPinned) {
      // Unpin
      pinnedItems = pinnedItems.filter(item => item.href !== href);
      btn.classList.remove('pinned');
    } else {
      // Pin (max 5)
      if (pinnedItems.length < 5) {
        pinnedItems.push({ href, text });
        btn.classList.add('pinned');
      } else {
        alert('Maximum 5 pinned items. Unpin one to add another.');
        return;
      }
    }

    localStorage.setItem('pinnedMenuItems', JSON.stringify(pinnedItems));
    renderPinnedSection(pinnedItems);
  }

  function renderPinnedSection(pinnedItems) {
    let pinnedSection = document.querySelector('.sidebar-pinned');

    if (pinnedItems.length === 0) {
      if (pinnedSection) pinnedSection.remove();
      return;
    }

    // Create or update pinned section
    if (!pinnedSection) {
      pinnedSection = document.createElement('div');
      pinnedSection.className = 'sidebar-pinned';

      const header = document.createElement('div');
      header.className = 'sidebar-pinned-header';
      header.textContent = 'Favorites';

      const list = document.createElement('ul');
      list.className = 'sidebar-pinned-list';

      pinnedSection.appendChild(header);
      pinnedSection.appendChild(list);

      const sidebar = document.getElementById('sidebar');
      const sidebarInner = sidebar.querySelector('.sidebar-inner');
      sidebarInner.insertBefore(pinnedSection, sidebarInner.firstChild);
    }

    // Update pinned list
    const list = pinnedSection.querySelector('.sidebar-pinned-list');
    list.innerHTML = '';

    pinnedItems.forEach(item => {
      const li = document.createElement('li');
      li.className = 'sidebar-pinned-item';

      // Extract emoji from text (first character that looks like emoji)
      const emojiMatch = item.text.match(/[\p{Emoji}]/u);
      const emoji = emojiMatch ? emojiMatch[0] : '📌';
      const textWithoutEmoji = item.text.replace(/[\p{Emoji}]/gu, '').trim();

      // Create link
      const link = document.createElement('a');
      link.href = item.href;
      link.className = 'sidebar-link';
      link.setAttribute('data-emoji', emoji);
      link.setAttribute('title', textWithoutEmoji);
      link.style.fontSize = '0'; // Hide text, show emoji via CSS ::before

      // Create unpin button
      const unpinBtn = document.createElement('button');
      unpinBtn.className = 'unpin-btn-pinned';
      unpinBtn.innerHTML = '✕';
      unpinBtn.title = `Unpin "${textWithoutEmoji}"`;
      unpinBtn.setAttribute('aria-label', `Unpin ${textWithoutEmoji}`);

      unpinBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Unpin by removing from list
        pinnedItems = pinnedItems.filter(p => p.href !== item.href);
        localStorage.setItem('pinnedMenuItems', JSON.stringify(pinnedItems));
        renderPinnedSection(pinnedItems);

        // Also update the pin button in sidebar if visible
        const pinBtns = document.querySelectorAll(`.pin-btn[data-href="${item.href}"]`);
        pinBtns.forEach(btn => btn.classList.remove('pinned'));
      });

      link.appendChild(unpinBtn);
      li.appendChild(link);
      list.appendChild(li);
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
     PROJECT TAB NAVIGATION (Modern Tab-based UI)
  --------------------------------------------------------------- */
  function initProjectTabs() {
    const tabs = document.querySelectorAll('.project-tab');

    if (tabs.length === 0) {
      console.warn('No project tabs found');
      return;
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const projectName = tab.getAttribute('data-project');
        if (!projectName) return;

        // Remove active from all tabs
        document.querySelectorAll('.project-tab').forEach(t => {
          t.classList.remove('active');
        });

        // Hide all topic lists
        document.querySelectorAll('.project-topics-list').forEach(list => {
          list.style.display = 'none';
        });

        // Add active to clicked tab
        tab.classList.add('active');

        // Show matching topics list
        const topicsList = document.querySelector(`[data-topics="${projectName}"]`);
        if (topicsList) {
          topicsList.style.display = 'flex';
        }

        // Save preference
        localStorage.setItem('activeProject', projectName);
      });
    });

    // Restore last active project or detect from current page
    const currentProject = detectCurrentProject();
    const savedProject = localStorage.getItem('activeProject');

    // Use saved project if available and tabs exist for it, otherwise use current page
    const projectToActivate = (savedProject && document.querySelector(`[data-project="${savedProject}"]`)) ? savedProject : currentProject;

    const activeTab = document.querySelector(`[data-project="${projectToActivate}"]`);
    if (activeTab) {
      activeTab.click();
    }
  }

  /* Detect which project current page belongs to */
  function detectCurrentProject() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    if (currentPath.includes('mvc') || currentPath === 'mvc.html' || currentPath === 'mvc-setup.html') return 'mvc';
    if (currentPath.includes('angular')) return 'angular';
    if (currentPath.includes('react')) return 'react';
    if (currentPath.includes('compiler')) return 'webapi'; // Compiler is part of Web API section
    if (currentPath.includes('webapi') || currentPath.includes('ef-core') ||
        currentPath.includes('ado-net') || currentPath.includes('linq') ||
        currentPath.includes('collections')) return 'webapi';

    return 'webapi'; // default
  }

  /* ---------------------------------------------------------------
     INIT
  --------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSidebar();
    initCollapseBtn();
    initPinning();
    initProjectTabs();
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
