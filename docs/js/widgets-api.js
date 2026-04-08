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
    this.localContext = null;
    this.timeInterval = null;
    this.weatherInterval = null;
    this.cacheKeys = {
      location: 'devdocs_local_snapshot_location',
      weather: 'devdocs_local_snapshot_weather',
      geoPromptCooldown: 'devdocs_local_snapshot_geo_cooldown_until'
    };
    this.cacheTtl = {
      locationMs: 12 * 60 * 60 * 1000,
      weatherMs: 15 * 60 * 1000,
      geoPromptCooldownMs: 24 * 60 * 60 * 1000
    };
    this.defaultLocation = {
      city: 'New Delhi',
      region: 'Delhi',
      country: 'India',
      timezone: 'Asia/Kolkata',
      latitude: 28.6139,
      longitude: 77.2090
    };
    this.currentWeather = {
      weatherCode: null,
      feelsLike: null
    };
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
      this.loadVersions(),
      this.loadLocalSnapshot()
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
   * Detect user location and load local time + weather snapshot
   */
  async loadLocalSnapshot() {
    const timeEl = document.getElementById('local-time-value');
    const weatherMainEl = document.getElementById('local-weather-main');
    const weatherMetaEl = document.getElementById('local-weather-meta');

    if (!timeEl || !weatherMainEl || !weatherMetaEl) return;

    this.localContext = {
      ...this.defaultLocation,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || this.defaultLocation.timezone
    };

    this.updateLocalClock();

    if (this.timeInterval) clearInterval(this.timeInterval);
    this.timeInterval = setInterval(() => this.updateLocalClock(), 1000);

    try {
      const cachedLocation = this.getCachedData(this.cacheKeys.location, this.cacheTtl.locationMs);
      const permissionState = await this.getGeolocationPermissionState();

      let location = null;
      if (permissionState === 'granted') {
        location = await this.tryBrowserGeolocation();
      }

      if (!location && cachedLocation) {
        location = cachedLocation;
      }

      if (!location) {
        location = await this.detectUserLocation();
      }

      if (!location) {
        location = { ...this.defaultLocation, source: 'fallback' };
      }

      if (location) {
        this.localContext = {
          city: location.city || this.defaultLocation.city,
          region: location.region || this.defaultLocation.region,
          country: location.country || this.defaultLocation.country,
          timezone: location.timezone || this.defaultLocation.timezone,
          latitude: typeof location.latitude === 'number' ? location.latitude : this.defaultLocation.latitude,
          longitude: typeof location.longitude === 'number' ? location.longitude : this.defaultLocation.longitude,
          source: location.source || 'fallback'
        };

        if (location.source !== 'fallback' || !cachedLocation) {
          this.setCachedData(this.cacheKeys.location, this.localContext);
        }

        this.updateLocalClock();
      }

      await this.loadLocalWeather(this.localContext.latitude, this.localContext.longitude);
    } catch (error) {
      console.warn('⚠ Could not load local snapshot:', error);
      this.localContext = { ...this.defaultLocation };
      this.updateLocalClock();
      await this.loadLocalWeather(this.localContext.latitude, this.localContext.longitude);
    }
  }

  async detectUserLocation() {
    const geoLocation = await this.tryBrowserGeolocation();
    if (geoLocation) return geoLocation;
    return this.tryIpLocation();
  }

  async getGeolocationPermissionState() {
    if (!navigator.permissions || !navigator.permissions.query) return 'unsupported';

    try {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      return status.state;
    } catch (error) {
      return 'unknown';
    }
  }

  async tryBrowserGeolocation() {
    if (!navigator.geolocation) return null;
    const canTry = await this.canAttemptGeolocation();
    if (!canTry) return null;

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 10 * 60 * 1000
        });
      });

      const latitude = Number(position.coords.latitude);
      const longitude = Number(position.coords.longitude);

      const locationName = await this.reverseGeocode(latitude, longitude);
      return {
        latitude,
        longitude,
        city: locationName.city,
        region: locationName.region,
        country: locationName.country,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        source: 'geo'
      };
    } catch (error) {
      if (error && (error.code === 1 || error.code === 2)) {
        this.startGeolocationCooldown();
      }
      return null;
    }
  }

  async canAttemptGeolocation() {
    const cooldownUntil = Number(localStorage.getItem(this.cacheKeys.geoPromptCooldown) || 0);
    const isCooldownActive = Date.now() < cooldownUntil;

    if (!navigator.permissions || !navigator.permissions.query) {
      return !isCooldownActive;
    }

    try {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      if (status.state === 'granted') {
        return true;
      }
      if (status.state === 'denied') {
        this.startGeolocationCooldown();
        return false;
      }
      return !isCooldownActive;
    } catch (error) {
      return !isCooldownActive;
    }
  }

  startGeolocationCooldown() {
    const cooldownUntil = Date.now() + this.cacheTtl.geoPromptCooldownMs;
    localStorage.setItem(this.cacheKeys.geoPromptCooldown, String(cooldownUntil));
  }

  async reverseGeocode(latitude, longitude) {
    try {
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&count=1&language=en`);
      if (!response.ok) throw new Error('Reverse geocoding failed');

      const data = await response.json();
      const place = data.results && data.results[0] ? data.results[0] : null;

      return {
        city: place?.name || 'Your area',
        region: place?.admin1 || '',
        country: place?.country || ''
      };
    } catch (error) {
      return { city: 'Your area', region: '', country: '' };
    }
  }

  async tryIpLocation() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) throw new Error('IP location request failed');

      const data = await response.json();
      const latitude = Number(data.latitude);
      const longitude = Number(data.longitude);

      return {
        latitude: Number.isFinite(latitude) ? latitude : null,
        longitude: Number.isFinite(longitude) ? longitude : null,
        city: data.city || 'Your area',
        region: data.region || '',
        country: data.country_name || '',
        timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        source: 'ip'
      };
    } catch (error) {
      return null;
    }
  }

  async loadLocalWeather(latitude, longitude) {
    const weatherMainEl = document.getElementById('local-weather-main');
    const weatherMetaEl = document.getElementById('local-weather-meta');

    if (!weatherMainEl) return;

    try {
      const cachedWeather = this.getCachedData(this.cacheKeys.weather, this.cacheTtl.weatherMs);
      const hasMatchingCoords = cachedWeather
        && typeof cachedWeather.latitude === 'number'
        && typeof cachedWeather.longitude === 'number'
        && Math.abs(cachedWeather.latitude - latitude) < 0.02
        && Math.abs(cachedWeather.longitude - longitude) < 0.02;

      if (hasMatchingCoords) {
        weatherMainEl.textContent = cachedWeather.main;
        if (weatherMetaEl) weatherMetaEl.title = cachedWeather.meta;
        this.currentWeather = {
          weatherCode: typeof cachedWeather.weatherCode === 'number' ? cachedWeather.weatherCode : null,
          feelsLike: typeof cachedWeather.feelsLike === 'number' ? cachedWeather.feelsLike : null
        };
        this.renderLocalScene();
        return;
      }

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
      );

      if (!response.ok) throw new Error('Weather request failed');

      const data = await response.json();
      const current = data.current;
      if (!current) throw new Error('Weather data missing');

      const weatherInfo = this.getWeatherInfo(current.weather_code);
      const tempRounded = Math.round(current.temperature_2m);
      const mainText = `${tempRounded}°`;
      const metaText = `${weatherInfo.label} • Feels like ${Math.round(current.apparent_temperature)}° • Wind ${Math.round(current.wind_speed_10m)} km/h • ${this.getLocationLabel()}`;

      this.currentWeather = {
        weatherCode: current.weather_code,
        feelsLike: current.apparent_temperature
      };

      weatherMainEl.textContent = mainText;
      if (weatherMetaEl) weatherMetaEl.title = metaText;
      this.setCachedData(this.cacheKeys.weather, {
        latitude,
        longitude,
        main: mainText,
        meta: metaText,
        weatherCode: current.weather_code,
        feelsLike: current.apparent_temperature
      });
      this.renderLocalScene();
    } catch (error) {
      weatherMainEl.textContent = '--°';
      weatherMetaEl.textContent = `Could not fetch live weather • ${this.getLocationLabel()}`;
      this.currentWeather = { weatherCode: null, feelsLike: null };
      this.renderLocalScene();
    }
  }

  getCachedData(key, maxAgeMs) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const payload = JSON.parse(raw);
      if (!payload || typeof payload.timestamp !== 'number') return null;
      if (Date.now() - payload.timestamp > maxAgeMs) return null;

      return payload.data || null;
    } catch (error) {
      return null;
    }
  }

  setCachedData(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify({
        timestamp: Date.now(),
        data
      }));
    } catch (error) {
      // Ignore quota/storage access issues and continue with live data.
    }
  }

  updateLocalClock() {
    const timeEl = document.getElementById('local-time-value');
    if (!timeEl || !this.localContext) return;

    const now = new Date();
    const timeZone = this.localContext.timezone || 'UTC';

    const timeText = new Intl.DateTimeFormat([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone
    }).format(now);

    const locationLabel = this.getLocationLabel();

    timeEl.textContent = timeText;
    this.renderLocalScene();
  }

  renderLocalScene() {
    const widgetEl = document.getElementById('hero-local-widget');
    if (!widgetEl || !this.localContext) return;

    const now = new Date();
    const timeZone = this.localContext.timezone || this.defaultLocation.timezone;
    const hour = Number(new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      hour12: false,
      timeZone
    }).format(now));

    const partOfDay = hour >= 6 && hour < 17
      ? 'day'
      : hour >= 17 && hour < 20
        ? 'evening'
        : 'night';

    const feelsLike = this.currentWeather.feelsLike;
    const weatherCode = this.currentWeather.weatherCode;
    const weatherGroup = typeof weatherCode === 'number' && [95, 96, 99].includes(weatherCode)
      ? 'storm'
      : typeof weatherCode === 'number' && [2, 3, 45, 48, 51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)
        ? 'cloudy'
        : 'clear';

    const tempBand = typeof feelsLike === 'number'
      ? (feelsLike >= 34 ? 'hot' : feelsLike <= 12 ? 'cold' : 'mild')
      : 'mild';

    const palette = this.getLocalThemePalette(partOfDay, weatherGroup, tempBand);

    widgetEl.style.setProperty('--local-bg-1', palette.bg1);
    widgetEl.style.setProperty('--local-bg-2', palette.bg2);
    widgetEl.style.setProperty('--local-bg-3', palette.bg3);
    widgetEl.style.setProperty('--local-glow', palette.glow);
  }

  getLocalThemePalette(partOfDay, weatherGroup, tempBand) {
    if (partOfDay === 'night') {
      if (weatherGroup === 'storm') {
        return { bg1: '#0b1020', bg2: '#1e293b', bg3: '#334155', glow: 'rgba(71, 85, 105, 0.45)' };
      }
      if (tempBand === 'cold') {
        return { bg1: '#082f49', bg2: '#1e3a5f', bg3: '#0f172a', glow: 'rgba(56, 189, 248, 0.32)' };
      }
      return { bg1: '#0f172a', bg2: '#1e293b', bg3: '#312e81', glow: 'rgba(99, 102, 241, 0.30)' };
    }

    if (partOfDay === 'evening') {
      if (weatherGroup === 'storm') {
        return { bg1: '#7c2d12', bg2: '#9a3412', bg3: '#431407', glow: 'rgba(249, 115, 22, 0.38)' };
      }
      if (tempBand === 'hot') {
        return { bg1: '#fdba74', bg2: '#fb7185', bg3: '#f97316', glow: 'rgba(251, 113, 133, 0.34)' };
      }
      return { bg1: '#fed7aa', bg2: '#fda4af', bg3: '#c4b5fd', glow: 'rgba(244, 114, 182, 0.30)' };
    }

    if (weatherGroup === 'storm') {
      return { bg1: '#64748b', bg2: '#475569', bg3: '#334155', glow: 'rgba(71, 85, 105, 0.35)' };
    }
    if (tempBand === 'hot') {
      return { bg1: '#fdba74', bg2: '#fb7185', bg3: '#f97316', glow: 'rgba(251, 113, 133, 0.30)' };
    }
    if (tempBand === 'cold') {
      return { bg1: '#bae6fd', bg2: '#93c5fd', bg3: '#38bdf8', glow: 'rgba(56, 189, 248, 0.30)' };
    }

    return { bg1: '#e0f2fe', bg2: '#bfdbfe', bg3: '#dbeafe', glow: 'rgba(59, 130, 246, 0.32)' };
  }

  getLocationLabel() {
    if (!this.localContext) return 'New Delhi, Delhi, India';

    const parts = [
      this.localContext.city,
      this.localContext.region,
      this.localContext.country
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : 'New Delhi, Delhi, India';
  }

  getWeatherInfo(code) {
    const mappings = {
      0: { label: 'Clear sky', icon: '☀️' },
      1: { label: 'Mostly clear', icon: '🌤️' },
      2: { label: 'Partly cloudy', icon: '⛅' },
      3: { label: 'Overcast', icon: '☁️' },
      45: { label: 'Foggy', icon: '🌫️' },
      48: { label: 'Foggy', icon: '🌫️' },
      51: { label: 'Light drizzle', icon: '🌦️' },
      53: { label: 'Drizzle', icon: '🌦️' },
      55: { label: 'Heavy drizzle', icon: '🌧️' },
      56: { label: 'Freezing drizzle', icon: '🌧️' },
      57: { label: 'Freezing drizzle', icon: '🌧️' },
      61: { label: 'Light rain', icon: '🌦️' },
      63: { label: 'Rain', icon: '🌧️' },
      65: { label: 'Heavy rain', icon: '🌧️' },
      66: { label: 'Freezing rain', icon: '🌧️' },
      67: { label: 'Freezing rain', icon: '🌧️' },
      71: { label: 'Light snow', icon: '🌨️' },
      73: { label: 'Snow', icon: '❄️' },
      75: { label: 'Heavy snow', icon: '❄️' },
      77: { label: 'Snow grains', icon: '🌨️' },
      80: { label: 'Rain showers', icon: '🌦️' },
      81: { label: 'Rain showers', icon: '🌧️' },
      82: { label: 'Heavy showers', icon: '⛈️' },
      85: { label: 'Snow showers', icon: '🌨️' },
      86: { label: 'Heavy snow showers', icon: '🌨️' },
      95: { label: 'Thunderstorm', icon: '⛈️' },
      96: { label: 'Thunderstorm with hail', icon: '⛈️' },
      99: { label: 'Thunderstorm with hail', icon: '⛈️' }
    };

    return mappings[code] || { label: 'Unknown conditions', icon: '🌍' };
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

    // Auto-refresh local weather every 15 minutes
    if (this.weatherInterval) clearInterval(this.weatherInterval);
    this.weatherInterval = setInterval(async () => {
      if (!this.localContext) return;

      const { latitude, longitude } = this.localContext;
      if (typeof latitude === 'number' && typeof longitude === 'number') {
        await this.loadLocalWeather(latitude, longitude);
      }
    }, 900000);

    // Marquee is auto-animated via CSS
    // Close button handled inline in HTML
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const widgets = new WidgetsAPI();
  await widgets.init();
});
