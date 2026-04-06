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

      // Use Quotable API for programming/learning related quotes
      const response = await fetch('https://api.quotable.io/random?tags=inspirational,wisdom,technology');

      if (!response.ok) throw new Error('Failed to fetch quote');

      const data = await response.json();

      // Create quote array with fetched quote + some hardcoded ones
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
        },
        {
          text: "Quality is not an act, it is a habit.",
          author: "Aristotle"
        }
      ];

      console.log('✓ Quotes loaded:', this.quotes.length);
    } catch (err) {
      console.error('✗ Error loading quotes:', err);
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
          text: "Life is what happens when you're busy making other plans.",
          author: "John Lennon"
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
      const response = await fetch('https://dev.to/api/articles?per_page=3&tag=webdev,dotnet,javascript,react,angular');

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
      console.error('✗ Error loading news:', err);
      // Fallback news
      this.news = [
        {
          title: 'Latest .NET 8 Features Released',
          description: 'Discover new performance improvements and native AOT compilation in .NET 8',
          url: '#',
          source: 'Microsoft',
          date: new Date().toLocaleDateString(),
          tags: ['.NET', 'C#']
        },
        {
          title: 'React 19 Now Available',
          description: 'New hooks and improved developer experience with Server Components',
          url: '#',
          source: 'React',
          date: new Date().toLocaleDateString(),
          tags: ['React', 'JavaScript']
        },
        {
          title: 'Angular 17 Performance Improvements',
          description: 'Faster build times and improved runtime performance',
          url: '#',
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

      // Use GitHub API to get latest release info
      const repos = [
        { name: '.NET', owner: 'dotnet', repo: 'runtime' },
        { name: 'React', owner: 'facebook', repo: 'react' },
        { name: 'Angular', owner: 'angular', repo: 'angular' },
        { name: 'Node.js', owner: 'nodejs', repo: 'node' },
        { name: 'TypeScript', owner: 'microsoft', repo: 'TypeScript' },
        { name: 'Vue', owner: 'vuejs', repo: 'core' }
      ];

      const versionPromises = repos.map(async r => {
        try {
          const response = await fetch(
            `https://api.github.com/repos/${r.owner}/${r.repo}/releases/latest`,
            { headers: { 'Accept': 'application/vnd.github.v3+json' } }
          );

          if (!response.ok) return null;

          const release = await response.json();
          const version = release.tag_name.replace(/^v/, '').substring(0, 5);

          return {
            name: r.name,
            version: version,
            stable: !release.prerelease,
            url: release.html_url
          };
        } catch (e) {
          console.warn(`Failed to fetch ${r.name} version`);
          return null;
        }
      });

      const results = await Promise.all(versionPromises);
      this.versions = results.filter(v => v !== null);

      // Fallback if all fail
      if (this.versions.length === 0) {
        this.versions = [
          { name: '.NET', version: '8.0.11', stable: true },
          { name: 'React', version: '19.0', stable: true },
          { name: 'Angular', version: '17.1', stable: true },
          { name: 'Node.js', version: '22.0', stable: true },
          { name: 'TypeScript', version: '5.5', stable: true },
          { name: 'Vue', version: '3.4', stable: true }
        ];
      }

      console.log('✓ Versions loaded:', this.versions.length);
    } catch (err) {
      console.error('✗ Error loading versions:', err);
      // Fallback versions
      this.versions = [
        { name: '.NET', version: '8.0.11', stable: true },
        { name: 'React', version: '19.0', stable: true },
        { name: 'Angular', version: '17.1', stable: true },
        { name: 'Node.js', version: '22.0', stable: true },
        { name: 'TypeScript', version: '5.5', stable: true },
        { name: 'Vue', version: '3.4', stable: true }
      ];
    }
  }

  /**
   * Render quotes marquee with auto-scroll
   */
  renderQuotesBanner() {
    const container = document.getElementById('quotes-marquee');
    if (!container || this.quotes.length === 0) return;

    // Create marquee items that repeat
    const marqueeHTML = [...this.quotes, ...this.quotes]
      .map(quote => `
        <span class="marquee-item">"${quote.text}" — ${quote.author}</span>
      `).join('');

    container.innerHTML = marqueeHTML;

    // Restart animation
    container.style.animation = 'none';
    setTimeout(() => {
      container.style.animation = 'marquee 30s linear infinite';
    }, 10);
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
   * Render tech versions bar (inline badges)
   */
  renderVersionsBar() {
    const container = document.getElementById('tech-versions-inline');
    if (!container || this.versions.length === 0) return;

    container.innerHTML = this.versions.slice(0, 6).map(v => `
      <span class="tech-badge" title="${v.version}">${v.name} ${v.version}</span>
    `).join('');
  }

  /**
   * Setup event listeners (marquee auto-plays, no buttons needed)
   */
  setupEventListeners() {
    // Marquee is auto-animated via CSS
    // Close button handled inline in HTML
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const widgets = new WidgetsAPI();
  await widgets.init();
});
