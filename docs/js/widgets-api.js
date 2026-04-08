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

    // Fetch data in parallel with individual error handling
    await Promise.allSettled([
      this.loadQuotes(),
      this.loadNews(),
      this.loadVersions()
    ]);

    // Render widgets - they'll have fallback data if APIs failed
    this.renderQuotesBanner();
    this.renderNewsCards();
    this.renderVersionsBar();
    this.setupEventListeners();

    console.log('✓ Widgets initialized');
  }

  /**
   * Load inspirational coding quotes from Quotable API
   */
  async loadQuotes() {
    try {
      console.log('📚 Fetching quotes from Quotable API...');

      // Fetch multiple quotes about programming/technology
      const tags = ['programming', 'technology', 'code'];
      const quotes = [];

      for (const tag of tags) {
        try {
          const response = await fetch(`https://api.quotable.io/random?tags=${tag}`, { timeout: 5000 });
          if (response.ok) {
            const data = await response.json();
            quotes.push({
              text: data.content,
              author: data.author.replace(', type.fit', '').replace(/\(.*\)/, '').trim()
            });
          }
        } catch (e) {
          console.log(`Failed to fetch ${tag} quote`);
        }
      }

      if (quotes.length > 0) {
        this.quotes = quotes;
        console.log('✓ Quotes loaded from API:', this.quotes.length);
      } else {
        throw new Error('No quotes fetched from API');
      }
    } catch (err) {
      console.warn('⚠ API failed, using fallback quotes');
      // Enhanced fallback quotes with current industry insights
      this.quotes = [
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
          text: "Clean code always looks like it was written by someone who cares.",
          author: "Robert C. Martin"
        },
        {
          text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
          author: "Martin Fowler"
        },
        {
          text: "The most important property of a program is that it accomplishes the intention of the user.",
          author: "C.A.R. Hoare"
        }
      ];
    }
  }

  /**
   * Load tech and development news from multiple sources
   */
  async loadNews() {
    try {
      console.log('📰 Fetching tech news from Dev.to API...');

      // Primary source: Dev.to API - fresh developer content
      const devtoResponse = await fetch('https://dev.to/api/articles?tags=programming,webdev,dotnet&per_page=5', {
        timeout: 8000
      });

      if (devtoResponse.ok) {
        const articles = await devtoResponse.json();
        this.news = articles.slice(0, 3).map(article => ({
          title: article.title,
          description: article.description || article.title.substring(0, 100),
          url: article.url,
          image: article.social_image,
          source: 'Dev.to',
          date: new Date(article.published_at).toLocaleDateString(),
          tags: article.tag_list.slice(0, 2)
        }));

        console.log('✓ News loaded from API:', this.news.length);
        return;
      }
    } catch (err) {
      console.warn('⚠ Dev.to API request failed, trying alternative sources...');
    }

    try {
      // Secondary source: HackerNews API - technology industry news
      console.log('📰 Fetching from Hacker News...');
      const hnResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', { timeout: 8000 });

      if (hnResponse.ok) {
        const storyIds = await hnResponse.json();
        const topStories = storyIds.slice(0, 5);

        const stories = await Promise.all(
          topStories.map(id =>
            fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
              .then(r => r.ok ? r.json() : null)
              .catch(() => null)
          )
        );

        this.news = stories
          .filter(s => s && s.title)
          .slice(0, 3)
          .map(story => ({
            title: story.title,
            description: story.title.substring(0, 100),
            url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
            image: null,
            source: 'Hacker News',
            date: new Date(story.time * 1000).toLocaleDateString(),
            tags: ['tech', 'news']
          }));

        if (this.news.length > 0) {
          console.log('✓ News loaded from Hacker News:', this.news.length);
          return;
        }
      }
    } catch (err) {
      console.warn('⚠ Hacker News API failed');
    }

    // Fallback news with latest industry updates
    console.warn('⚠ Using fallback news');
    this.news = [
      {
        title: 'Latest .NET 8 Features: Performance & Innovation',
        description: 'Explore cutting-edge features in .NET 8 including improved SIMD support, native AOT compilation, and advanced caching strategies.',
        url: 'https://devblogs.microsoft.com/dotnet',
        image: null,
        source: 'Microsoft Devblogs',
        date: new Date().toLocaleDateString(),
        tags: ['.NET', 'Backend']
      },
      {
        title: 'React 19: Server Components & New Patterns',
        description: 'React 19 introduces server-side rendering improvements and new patterns for building modern full-stack applications efficiently.',
        url: 'https://react.dev/blog',
        image: null,
        source: 'React Blog',
        date: new Date().toLocaleDateString(),
        tags: ['React', 'Frontend']
      },
      {
        title: 'Angular 17+: Performance & Standalone Components',
        description: 'Discover how Angular has evolved with standalone components, improved change detection, and significantly reduced bundle sizes.',
        url: 'https://angular.io/blog',
        image: null,
        source: 'Angular Team',
        date: new Date().toLocaleDateString(),
        tags: ['Angular', 'Frontend']
      }
    ];
  }

  /**
   * Load latest tech versions from reliable APIs
   */
  async loadVersions() {
    try {
      console.log('📦 Loading tech versions from APIs...');

      const versionPromises = {
        'C#': this.fetchCSharpVersion(),
        '.NET': this.fetchDotNetVersion(),
        'React': this.fetchNpmVersion('react'),
        'Angular': this.fetchNpmVersion('@angular/core'),
        'Node.js': this.fetchNodeVersion(),
        'TypeScript': this.fetchNpmVersion('typescript')
      };

      const results = await Promise.allSettled(Object.entries(versionPromises).map(async ([name, promise]) => {
        const version = await promise;
        return { name, version };
      }));

      this.versions = results
        .filter(r => r.status === 'fulfilled' && r.value.version)
        .map(r => ({ ...r.value, stable: true }))
        .slice(0, 6);

      if (this.versions.length > 0) {
        console.log('✓ Versions loaded from APIs:', this.versions.length);
        return;
      }
      throw new Error('No versions fetched');
    } catch (err) {
      console.warn('⚠ Version API failed, using fallback data');
      // Fallback versions with current stable releases
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
   * Fetch latest .NET version
   */
  async fetchDotNetVersion() {
    try {
      const response = await fetch('https://raw.githubusercontent.com/dotnet/release-notes/main/release-notes.json', { timeout: 5000 });
      if (response.ok) {
        const data = await response.json();
        return data.releases?.[0]?.latest?.release || '8.0';
      }
    } catch (e) {
      // Try alternative source
      try {
        const res = await fetch('https://api.github.com/repos/dotnet/runtime/releases?per_page=1', { timeout: 5000 });
        if (res.ok) {
          const [release] = await res.json();
          return release.tag_name.replace(/^v/, '').substring(0, 5);
        }
      } catch (e2) {}
    }
    return '8.0.12';
  }

  /**
   * Fetch latest C# version
   */
  async fetchCSharpVersion() {
    try {
      const response = await fetch('https://api.github.com/repos/dotnet/roslyn/releases?per_page=1', { timeout: 5000 });
      if (response.ok) {
        const [release] = await response.json();
        return release.tag_name.replace(/^[a-zA-Z-]/, '').substring(0, 5);
      }
    } catch (e) {}
    return '13.0';
  }

  /**
   * Fetch latest Node.js version
   */
  async fetchNodeVersion() {
    try {
      const response = await fetch('https://api.github.com/repos/nodejs/node/releases?per_page=1', { timeout: 5000 });
      if (response.ok) {
        const [release] = await response.json();
        return release.tag_name.replace(/^v/, '').substring(0, 5);
      }
    } catch (e) {}
    return '22.0';
  }

  /**
   * Fetch latest version from NPM registry
   */
  async fetchNpmVersion(packageName) {
    try {
      const response = await fetch(`https://registry.npmjs.org/${packageName}`, { timeout: 5000 });
      if (response.ok) {
        const data = await response.json();
        const latestVersion = data['dist-tags']?.latest || '1.0.0';
        return latestVersion.substring(0, 5);
      }
    } catch (e) {}

    // Fallback versions by package
    const fallbacks = {
      'react': '19.0',
      '@angular/core': '17.2',
      'typescript': '5.5'
    };
    return fallbacks[packageName] || '1.0';
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
