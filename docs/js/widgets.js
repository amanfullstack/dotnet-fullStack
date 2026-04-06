/**
 * ================================================================
 * WIDGETS MODULE — Dynamic Quotes, News, and Versions
 * Fetches data from free APIs and displays with smooth animations
 * ================================================================
 */

class WidgetsManager {
  constructor() {
    this.quotes = [];
    this.news = [];
    this.versions = {};
    this.currentQuoteIndex = 0;
    this.quoteRotationInterval = null;
    this.newsRotationInterval = null;
    this.versionRefreshInterval = null;
  }

  /**
   * Initialize all widgets
   */
  async init() {
    console.log('🚀 Initializing widgets...');

    // Load widgets in parallel
    await Promise.all([
      this.loadQuotes(),
      this.loadNews(),
      this.loadVersions()
    ]);

    console.log('✓ Widgets initialized');
  }

  /**
   * QUOTES: Fetch and rotate inspirational coding quotes
   */
  async loadQuotes() {
    try {
      console.log('📖 Loading coding quotes...');

      // Fetch from Quotable API - programming related quotes
      const response = await fetch(
        'https://api.quotable.io/quotes?tags=Famous-Quotes&limit=5&minLength=100'
      );

      if (!response.ok) throw new Error('Failed to fetch quotes');

      const data = await response.json();
      this.quotes = data.results || [];

      if (this.quotes.length === 0) {
        // Fallback quotes if API fails
        this.quotes = [
          { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
          { content: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
          { content: "First solve the problem, then write the code.", author: "John Johnson" }
        ];
      }

      console.log(`✓ Loaded ${this.quotes.length} quotes`);
      this.renderQuotes();
      this.startQuoteRotation();

    } catch (err) {
      console.error('✗ Error loading quotes:', err);
      this.quotes = [
        { content: "Code is poetry written for computers.", author: "Unknown" }
      ];
      this.renderQuotes();
    }
  }

  /**
   * Render quotes slider
   */
  renderQuotes() {
    const slider = document.getElementById('quotes-slider');
    if (!slider) return;

    slider.innerHTML = '';

    this.quotes.forEach((quote, idx) => {
      const slide = document.createElement('div');
      slide.className = `quote-slide ${idx === 0 ? 'active' : ''}`;
      slide.innerHTML = `
        "${quote.content}"
        <div class="quote-author">— ${quote.author || 'Author'}</div>
      `;
      slider.appendChild(slide);
    });

    // Update dots
    const dotsContainer = document.querySelector('.quotes-controls');
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      this.quotes.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.className = `quote-dot ${idx === 0 ? 'active' : ''}`;
        dot.setAttribute('data-slide', idx);
        dot.addEventListener('click', () => this.goToQuote(idx));
        dotsContainer.appendChild(dot);
      });
    }
  }

  /**
   * Auto-rotate quotes every 8 seconds
   */
  startQuoteRotation() {
    if (this.quoteRotationInterval) clearInterval(this.quoteRotationInterval);

    this.quoteRotationInterval = setInterval(() => {
      this.nextQuote();
    }, 8000);
  }

  /**
   * Go to specific quote
   */
  goToQuote(index) {
    this.currentQuoteIndex = index % this.quotes.length;
    this.updateQuoteDisplay();
  }

  /**
   * Next quote
   */
  nextQuote() {
    this.currentQuoteIndex = (this.currentQuoteIndex + 1) % this.quotes.length;
    this.updateQuoteDisplay();
  }

  /**
   * Update quote display
   */
  updateQuoteDisplay() {
    const slides = document.querySelectorAll('.quote-slide');
    const dots = document.querySelectorAll('.quote-dot');

    slides.forEach((slide, idx) => {
      slide.classList.toggle('active', idx === this.currentQuoteIndex);
    });

    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === this.currentQuoteIndex);
    });
  }

  /**
   * NEWS: Fetch and display tech news with auto-scroll
   */
  async loadNews() {
    try {
      console.log('📰 Loading tech news...');

      // Fetch from Dev.to API - specifically tech topics we care about
      const response = await fetch(
        'https://dev.to/api/articles?per_page=10&tags=csharp,dotnet,react,angular,typescript,javascript,python&top=1w'
      );

      if (!response.ok) throw new Error('Failed to fetch news');

      const articles = await response.json();
      this.news = articles.slice(0, 8);

      if (this.news.length === 0) {
        this.news = [
          { title: "Check back for latest tech news", url: 'https://dev.to' }
        ];
      }

      console.log(`✓ Loaded ${this.news.length} news articles`);
      this.renderNews();

    } catch (err) {
      console.error('✗ Error loading news:', err);
      this.news = [
        { title: "Tech news feed - Please check your internet connection", url: 'https://dev.to' },
        { title: ".NET 9 Released - Latest features and improvements", url: 'https://devblogs.microsoft.com/dotnet/' },
        { title: "React 19 - New hooks and server components", url: 'https://react.dev' }
      ];
      this.renderNews();
    }
  }

  /**
   * Render news ticker with scroll animation
   */
  renderNews() {
    const ticker = document.getElementById('news-ticker');
    if (!ticker) return;

    ticker.innerHTML = '';

    // Duplicate news for seamless loop
    const allNews = [...this.news, ...this.news];

    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'news-items-scroll';

    allNews.forEach((article) => {
      const item = document.createElement('div');
      item.className = 'news-item';
      item.innerHTML = `
        <div class="news-title">${article.title}</div>
        <div class="news-source">${article.user?.name || article.source || 'Dev.to'}</div>
      `;

      if (article.url) {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
          window.open(article.url, '_blank');
        });
      }

      scrollContainer.appendChild(item);
    });

    ticker.appendChild(scrollContainer);
    console.log('✓ News ticker rendered');
  }

  /**
   * VERSIONS: Fetch latest tech versions
   */
  async loadVersions() {
    try {
      console.log('📦 Loading latest tech versions...');

      // Fetch versions in parallel
      const [dotnet, python, node, react, angular] = await Promise.all([
        this.getVersionDotNet(),
        this.getVersionPython(),
        this.getVersionNodeJS(),
        this.getVersionReact(),
        this.getVersionAngular()
      ]);

      this.versions = {
        '.NET': dotnet,
        'Python': python,
        'Node.js': node,
        'React': react,
        'Angular': angular
      };

      console.log('✓ Versions loaded:', this.versions);
      this.renderVersions();
      this.startVersionRefresh();

    } catch (err) {
      console.error('✗ Error loading versions:', err);
      this.versions = {
        '.NET': { version: '9.0', status: 'LTS' },
        'Python': { version: '3.13', status: 'Latest' },
        'Node.js': { version: '22.0', status: 'Latest' },
        'React': { version: '19.0', status: 'Latest' },
        'Angular': { version: '18.0', status: 'Latest' }
      };
      this.renderVersions();
    }
  }

  /**
   * Get .NET version
   */
  async getVersionDotNet() {
    try {
      // Using GitHub API for .NET release info
      const response = await fetch(
        'https://api.github.com/repos/dotnet/core/releases?per_page=1'
      );
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const version = data[0].tag_name.replace('v', '');
          return { version, status: 'Latest', updated: new Date(data[0].published_at).toLocaleDateString() };
        }
      }
      return { version: '9.0', status: 'LTS' };
    } catch (err) {
      return { version: '9.0', status: 'LTS' };
    }
  }

  /**
   * Get Python version
   */
  async getVersionPython() {
    try {
      // Using PyPI API
      const response = await fetch('https://pypi.org/pypi/python/json');
      if (response.ok) {
        const data = await response.json();
        const version = data.info.version;
        return { version, status: 'Latest' };
      }
      return { version: '3.13.0', status: 'Latest' };
    } catch (err) {
      return { version: '3.13.0', status: 'Latest' };
    }
  }

  /**
   * Get Node.js version
   */
  async getVersionNodeJS() {
    try {
      const response = await fetch('https://nodejs.org/dist/latest/');
      if (response.ok) {
        // Parse from response headers or use npm API
        const npmResponse = await fetch('https://registry.npmjs.org/node');
        if (npmResponse.ok) {
          const data = await npmResponse.json();
          const version = Object.keys(data.versions).pop();
          return { version, status: 'Latest' };
        }
      }
      return { version: '22.0.0', status: 'Latest' };
    } catch (err) {
      return { version: '22.0.0', status: 'Latest' };
    }
  }

  /**
   * Get React version
   */
  async getVersionReact() {
    try {
      const response = await fetch('https://registry.npmjs.org/react/latest');
      if (response.ok) {
        const data = await response.json();
        return { version: data.version, status: 'Latest' };
      }
      return { version: '19.0.0', status: 'Latest' };
    } catch (err) {
      return { version: '19.0.0', status: 'Latest' };
    }
  }

  /**
   * Get Angular version
   */
  async getVersionAngular() {
    try {
      const response = await fetch('https://registry.npmjs.org/@angular/core/latest');
      if (response.ok) {
        const data = await response.json();
        return { version: data.version, status: 'Latest' };
      }
      return { version: '18.0.0', status: 'Latest' };
    } catch (err) {
      return { version: '18.0.0', status: 'Latest' };
    }
  }

  /**
   * Render versions list
   */
  renderVersions() {
    const list = document.getElementById('versions-list');
    if (!list) return;

    list.innerHTML = '';

    Object.entries(this.versions).forEach(([name, data]) => {
      const item = document.createElement('div');
      item.className = 'version-item';
      item.innerHTML = `
        <span class="version-name">${name}</span>
        <span class="version-number">
          v${data.version}
          <span class="version-badge">${data.status}</span>
        </span>
      `;
      list.appendChild(item);
    });

    console.log('✓ Versions rendered');
  }

  /**
   * Refresh versions every 30 minutes
   */
  startVersionRefresh() {
    if (this.versionRefreshInterval) clearInterval(this.versionRefreshInterval);

    this.versionRefreshInterval = setInterval(async () => {
      console.log('🔄 Refreshing versions...');
      await this.loadVersions();
    }, 30 * 60 * 1000); // 30 minutes
  }

  /**
   * Cleanup on page unload
   */
  destroy() {
    clearInterval(this.quoteRotationInterval);
    clearInterval(this.newsRotationInterval);
    clearInterval(this.versionRefreshInterval);
  }
}

// Initialize widgets when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const widgetsManager = new WidgetsManager();
  await widgetsManager.init();

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    widgetsManager.destroy();
  });
});
