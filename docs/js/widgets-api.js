/**
 * ================================================================
 * WIDGETS API — Dynamic Data Fetching for Quotes, News & Versions
 * ================================================================
 */

class WidgetsAPI {
  constructor() {
    this.quotes = [];
    this.news = [];
    this.versions = [];
    this.currentQuoteIndex = 0;
  }

  /**
   * Initialize all widgets
   */
  async init() {
    console.log('🎯 Initializing widgets...');

    // Fetch data in parallel
    await Promise.all([
      this.loadQuotes(),
      this.loadNews(),
      this.loadVersions()
    ]);

    // Render widgets
    this.renderQuotesBanner();
    this.renderNewsCards();
    this.renderVersionsBar();
    this.setupEventListeners();

    console.log('✓ Widgets initialized');
  }

  /**
   * Load inspirational coding quotes
   */
  async loadQuotes() {
    try {
      console.log('📚 Fetching quotes...');

      // Use Quotable API for quotes
      const response = await fetch('https://api.quotable.io/random?tags=inspirational');

      if (!response.ok) throw new Error('Failed to fetch quote');

      const data = await response.json();

      // Create quote array with fetched quote + fallback ones
      this.quotes = [
        {
          text: data.content,
          author: data.author.replace(', type.fit', '')
        },
        {
          text: "Code is poetry. It tells the story of what you intended the computer to do.",
          author: "Donald Knuth"
        },
        {
          text: "The best way to predict the future is to invent it.",
          author: "Alan Kay"
        },
        {
          text: "First, solve the problem. Then, write the code.",
          author: "John Johnson"
        }
      ];

      console.log('✓ Quotes loaded:', this.quotes.length);
    } catch (err) {
      console.warn('⚠ Using fallback quotes');
      // Fallback quotes
      this.quotes = [
        {
          text: "The only way to do great work is to love what you do.",
          author: "Steve Jobs"
        },
        {
          text: "Innovation distinguishes between a leader and a follower.",
          author: "Steve Jobs"
        },
        {
          text: "Code is poetry written in a language computers understand.",
          author: "Unknown"
        },
        {
          text: "Any fool can write code. Good programmers write code for humans.",
          author: "Martin Fowler"
        },
        {
          text: "The best code is no code at all.",
          author: "Jeff Atwood"
        }
      ];
    }
  }

  /**
   * Load tech and development news
   */
  async loadNews() {
    try {
      console.log('📰 Fetching tech news...');

      // Use Dev.to API (no auth required) for tech news
      const response = await fetch('https://dev.to/api/articles?per_page=3');

      if (!response.ok) throw new Error('Failed to fetch news');

      const articles = await response.json();

      this.news = articles.slice(0, 3).map(article => ({
        title: article.title,
        description: article.description || article.title,
        url: article.url,
        image: article.social_image,
        source: 'Dev.to',
        date: new Date(article.published_at).toLocaleDateString(),
        tags: article.tag_list.slice(0, 2)
      }));

      console.log('✓ News loaded:', this.news.length);
    } catch (err) {
      console.warn('⚠ Using fallback news');
      // Fallback news
      this.news = [
        {
          title: '.NET 8 Performance Enhancements Released',
          description: 'New SIMD improvements and native AOT compilation features for faster applications',
          url: 'https://devblogs.microsoft.com/dotnet',
          source: 'Microsoft',
          date: new Date().toLocaleDateString(),
          tags: ['.NET', 'Performance']
        },
        {
          title: 'React 19 Introduces New Server Components',
          description: 'Revolutionary approach to building full-stack applications with improved developer experience',
          url: 'https://react.dev',
          source: 'React Blog',
          date: new Date().toLocaleDateString(),
          tags: ['React', 'JavaScript']
        },
        {
          title: 'Angular 17 Delivers Major Performance Boost',
          description: 'Standalone components now default, significant reduction in bundle size and faster rendering',
          url: 'https://angular.io/blog',
          source: 'Angular',
          date: new Date().toLocaleDateString(),
          tags: ['Angular', 'TypeScript']
        }
      ];
    }
  }

  /**
   * Load latest tech versions
   */
  async loadVersions() {
    try {
      console.log('📦 Loading tech versions...');

      // Try to fetch from a simple version API
      // Using jsDelivr CDN list which is more reliable
      const versionMap = {
        'C#': 'https://api.github.com/repos/dotnet/roslyn/releases/latest',
        '.NET': 'https://api.github.com/repos/dotnet/runtime/releases/latest',
        'React': 'https://api.github.com/repos/facebook/react/releases/latest',
        'Angular': 'https://api.github.com/repos/angular/angular/releases/latest',
        'Node.js': 'https://api.github.com/repos/nodejs/node/releases/latest',
        'TypeScript': 'https://api.github.com/repos/microsoft/TypeScript/releases/latest'
      };

      // Try to fetch but immediately fallback since we're likely offline or rate-limited
      const timeout = Promise.race([
        Promise.all(Object.entries(versionMap).map(async ([name, url]) => {
          try {
            const res = await fetch(url);
            if (!res.ok) return null;
            const data = await res.json();
            return { name, version: data.tag_name.replace(/^v/, '').substring(0, 5) };
          } catch {
            return null;
          }
        })),
        new Promise(resolve => setTimeout(() => resolve(null), 3000)) // 3 second timeout
      ]);

      const results = await timeout;
      if (results && results.some(v => v)) {
        this.versions = results.filter(v => v);
      } else {
        throw new Error('API timeout or failed');
      }

      console.log('✓ Versions loaded:', this.versions.length);
    } catch (err) {
      console.warn('⚠ Using fallback versions');
      // Fallback versions
      this.versions = [
        { name: 'C#', version: '13.0', stable: true },
        { name: '.NET', version: '8.0.12', stable: true },
        { name: 'React', version: '19.0', stable: true },
        { name: 'Angular', version: '17.2', stable: true },
        { name: 'Node.js', version: '22.0', stable: true },
        { name: 'TypeScript', version: '5.5', stable: true }
      ];
    }
  }

  /**
   * Render quotes marquee with auto-scroll
   */
  renderQuotesBanner() {
    const container = document.getElementById('quotes-marquee');
    if (!container) {
      console.error('❌ quotes-marquee container not found');
      return;
    }

    if (this.quotes.length === 0) {
      console.warn('⚠ No quotes to render, using hardcoded quotes');
      // Don't override - use hardcoded quotes in HTML
      return;
    }

    console.log(`✓ Rendering ${this.quotes.length} API quotes in banner`);

    // Create marquee items doubled for seamless scrolling
    const marqueeHTML = [
      ...this.quotes,
      ...this.quotes,
      ...this.quotes
    ]
      .map(q => `<span class="marquee-item">"${q.text}" — ${q.author}</span>`)
      .join('');

    container.innerHTML = marqueeHTML;
  }

  /**
   * Render news cards (3-column grid)
   */
  renderNewsCards() {
    const container = document.getElementById('news-cards-container');
    if (!container || this.news.length === 0) return;

    container.innerHTML = this.news.map(article => `
      <div class="news-card">
        ${article.image ? `<img src="${article.image}" alt="${article.title}" style="height: 180px; object-fit: cover; border-radius: var(--r-md); margin-bottom: var(--sp-3);">` : ''}
        <h3 class="news-title">${article.title}</h3>
        <p class="news-description">${article.description}</p>
        <div class="news-meta" style="margin-top: auto; padding-top: var(--sp-3); border-top: 1px solid var(--border);">
          <span class="news-source">${article.source}</span>
          <span class="news-date">${article.date}</span>
        </div>
        <a href="${article.url}" target="_blank" class="news-link" style="display: inline-block; margin-top: var(--sp-2);">Read more →</a>
      </div>
    `).join('');
  }

  /**
   * Render tech versions in hero section with icons
   */
  renderVersionsBar() {
    const container = document.getElementById('versions-icons');
    if (!container || this.versions.length === 0) return;

    container.innerHTML = this.versions.slice(0, 6).map(v => `
      <span class="version-icon" title="${v.name} ${v.version}">${v.name} <strong>${v.version}</strong></span>
    `).join('');
  }

  /**
   * Setup event listeners and auto-refresh
   */
  setupEventListeners() {
    // Auto-refresh news every 30 minutes (1800000 ms)
    setInterval(async () => {
      console.log('🔄 Auto-refreshing news...');
      await this.loadNews();
      this.renderNewsCards();
    }, 1800000);

    // Marquee is auto-animated via CSS
    // Close button handled inline in HTML
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const widgets = new WidgetsAPI();
  await widgets.init();
});
