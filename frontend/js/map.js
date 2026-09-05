/**
 * HOSTEL MAP — Map & Discovery Interactive Controller
 * Powered by Google Maps Platform & Interactive Leaflet Engine
 */

const MAP_THEMES = {
  voyager: {
    name: 'Voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    subdomains: 'abcd',
    maxZoom: 19,
    googleMapTypeId: 'roadmap',
  },
  light: {
    name: 'Clean Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    subdomains: 'abcd',
    maxZoom: 19,
    googleMapTypeId: 'roadmap',
  },
  dark: {
    name: 'Cyber Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    subdomains: 'abcd',
    maxZoom: 19,
    googleMapTypeId: 'roadmap',
  },
  satellite: {
    name: 'Satellite Aerial',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; High-Res Aerial Imagery',
    maxZoom: 18,
    googleMapTypeId: 'satellite',
  },
};

const HYDERABAD_HUBS = {
  ALL: { name: 'All Hyderabad', lat: 17.4435, lng: 78.3582, zoom: 12 },
  GACHIBOWLI: { name: 'Gachibowli & DLF', lat: 17.4435, lng: 78.3582, zoom: 14.5 },
  MADHAPUR: { name: 'Madhapur & Cyber Towers', lat: 17.4486, lng: 78.3908, zoom: 14.5 },
  JNTU: { name: 'JNTU & KPHB Metro', lat: 17.4942, lng: 78.3912, zoom: 14.5 },
  KONDAPUR: { name: 'Kondapur & Botanical', lat: 17.4615, lng: 78.3610, zoom: 14.5 },
  NIZAMPET: { name: 'Nizampet & Bachupally', lat: 17.5140, lng: 78.3810, zoom: 14.5 },
};

class HostelMapController {
  constructor() {
    this.engine = 'none'; // 'google' | 'leaflet'
    this.map = null; // Google Maps Map instance
    this.leafletMap = null; // Leaflet Map instance
    this.leafletTileLayer = null;
    this.currentTheme = localStorage.getItem('hostelmap_theme') || 'voyager';
    this.searchRadiusKm = null;
    this.radiusCircle = null;
    this.userMarker = null;
    this.markers = new Map(); // hostelId -> marker instance
    this.clusterMarkers = new Map(); // clusterId -> marker instance
    this.clusters = []; // active calculated cluster groupings
    this.clusteringEnabled = true; // marker clustering on by default
    this.clusterRadiusPx = 55; // clustering distance in pixels at current zoom
    this.lastClusterZoom = null; // cached zoom level to prevent redundant re-renders
    this.infoWindow = null;
    this.hostels = [];
    this.activeHostelId = null;
    this.currentFilters = {
      type: 'ALL',
      priceRange: '',
      food: false,
      minRating: '',
      facility: '',
      search: '',
    };
    this.userLocation = null;
    this.isGoogleMapsLoaded = false;
  }

  async init() {
    this.bindDOMEvents();
    this.setupResizeObserver();
    this.initThemeUI();
    await this.loadConfigAndMap();
    await this.loadHostels();
    this.renderFacilitiesFilter();

    // Auto switch to map if URL hash is #map or query is view=map
    if (window.location.hash === '#map' || window.location.search.includes('view=map')) {
      this.switchToMapView();
      this.invalidateMapSize();
      setTimeout(() => this.updateMapMarkers(true), 250);
    }
  }

  initThemeUI() {
    document.querySelectorAll('.map-theme-btn').forEach((btn) => {
      const isMatch = btn.dataset.theme === this.currentTheme;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-checked', isMatch ? 'true' : 'false');
    });
    const pane = document.getElementById('map-pane');
    if (pane) {
      pane.classList.remove('theme-light', 'theme-dark', 'theme-satellite', 'theme-voyager');
      pane.classList.add(`theme-${this.currentTheme}`);
    }
  }

  bindDOMEvents() {
    // Search input
    const searchInput = document.getElementById('search-input');
    const searchClearBtn = document.getElementById('search-clear');
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if (searchClearBtn) searchClearBtn.style.display = val ? 'block' : 'none';
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.currentFilters.search = val.trim();
          this.loadHostels();
        }, 300);
      });
    }

    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          searchClearBtn.style.display = 'none';
          this.currentFilters.search = '';
          this.loadHostels();
        }
      });
    }

    // Filter Chips (Type)
    const typeChips = document.querySelectorAll('[data-filter-type]');
    typeChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        typeChips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentFilters.type = chip.dataset.filterType;
        this.loadHostels();
      });
    });

    // Quick filter chips (Food, WiFi, Price)
    const foodChip = document.getElementById('filter-food');
    if (foodChip) {
      foodChip.addEventListener('click', () => {
        this.currentFilters.food = !this.currentFilters.food;
        foodChip.classList.toggle('active', this.currentFilters.food);
        this.loadHostels();
      });
    }

    const ratingChip = document.getElementById('filter-rating');
    if (ratingChip) {
      ratingChip.addEventListener('click', () => {
        const nextRating = this.currentFilters.minRating === '4.0' ? '' : '4.0';
        this.currentFilters.minRating = nextRating;
        ratingChip.classList.toggle('active', !!nextRating);
        this.loadHostels();
      });
    }

    // Price select filter
    const priceSelect = document.getElementById('price-filter-select');
    if (priceSelect) {
      priceSelect.addEventListener('change', (e) => {
        this.currentFilters.priceRange = e.target.value;
        this.loadHostels();
      });
    }

    // Zoom In Button
    const zoomInBtn = document.getElementById('map-zoomin-btn');
    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => this.zoomIn());
    }

    // Zoom Out Button
    const zoomOutBtn = document.getElementById('map-zoomout-btn');
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => this.zoomOut());
    }

    // Cluster Toggle Button
    const clusterToggleBtn = document.getElementById('map-cluster-toggle-btn');
    if (clusterToggleBtn) {
      clusterToggleBtn.addEventListener('click', () => this.toggleClustering());
    }

    // Locate Me GPS Button
    const locateBtn = document.getElementById('map-locate-btn');
    if (locateBtn) {
      locateBtn.addEventListener('click', () => this.handleLocateUser());
    }

    // Recenter Button
    const recenterBtn = document.getElementById('map-recenter-btn');
    if (recenterBtn) {
      recenterBtn.addEventListener('click', () => this.recenterMap());
    }

    // Keyboard Help Button & Modal
    const kbdHelpBtn = document.getElementById('map-keyboard-help-btn');
    if (kbdHelpBtn) {
      kbdHelpBtn.addEventListener('click', () => this.toggleKeyboardHelp());
    }

    const helpModal = document.getElementById('keyboard-help-modal');
    if (helpModal) {
      helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
          this.toggleKeyboardHelp(false);
        }
      });
    }

    // Mobile View Toggle ("List" vs "Map")
    const mobileToggleList = document.getElementById('mobile-toggle-list');
    const mobileToggleMap = document.getElementById('mobile-toggle-map');
    const mobileQuickMapBtn = document.getElementById('mobile-quick-map-btn');

    if (mobileQuickMapBtn) {
      mobileQuickMapBtn.addEventListener('click', () => {
        this.switchToMapView();
      });
    }

    if (mobileToggleList && mobileToggleMap) {
      mobileToggleList.addEventListener('click', () => {
        this.switchToListView();
      });

      mobileToggleMap.addEventListener('click', () => {
        this.switchToMapView();
      });
    }

    // Scroll listener on hostel-list to apply elevation shadow to sticky header
    const hostelList = document.getElementById('hostel-list');
    const explorerHeader = document.querySelector('.explorer-header');
    if (hostelList && explorerHeader) {
      hostelList.addEventListener('scroll', () => {
        if (hostelList.scrollTop > 8) {
          explorerHeader.classList.add('is-scrolled');
        } else {
          explorerHeader.classList.remove('is-scrolled');
        }
      }, { passive: true });
    }

    this.initKeyboardNavigation();
  }

  setupResizeObserver() {
    const mapPane = document.getElementById('map-pane');
    if (mapPane && window.ResizeObserver) {
      const ro = new ResizeObserver(() => {
        this.invalidateMapSize();
      });
      ro.observe(mapPane);
    }
  }

  invalidateMapSize() {
    setTimeout(() => {
      if (this.engine === 'leaflet' && this.leafletMap) {
        this.leafletMap.invalidateSize();
      } else if (this.engine === 'google' && this.map && window.google?.maps?.event) {
        google.maps.event.trigger(this.map, 'resize');
      }
    }, 120);
  }

  switchToMapView() {
    const layout = document.getElementById('discovery-layout');
    const mobileToggleList = document.getElementById('mobile-toggle-list');
    const mobileToggleMap = document.getElementById('mobile-toggle-map');

    if (layout) {
      layout.classList.remove('view-list');
      layout.classList.add('view-map');
    }
    if (mobileToggleMap) {
      mobileToggleMap.classList.add('active');
      mobileToggleMap.setAttribute('aria-selected', 'true');
    }
    if (mobileToggleList) {
      mobileToggleList.classList.remove('active');
      mobileToggleList.setAttribute('aria-selected', 'false');
    }
    this.announceToScreenReader('Switched to interactive map view.');
    this.invalidateMapSize();
  }

  fitAllHostels() {
    if (!this.hostels || this.hostels.length === 0) {
      this.loadHostels();
      return;
    }
    this.invalidateMapSize();
    this.updateMapMarkers(true);
    this.announceToScreenReader(`Fitted all ${this.hostels.length} hostels to current map viewport.`);
    showToast(`🗺️ Fitted all ${this.hostels.length} hostels on map`, 'info');
  }

  toggleFullMap() {
    const layout = document.getElementById('discovery-layout');
    if (!layout) return;
    const isFull = layout.classList.toggle('full-map');
    const expandBtn = document.getElementById('map-expand-btn');
    if (expandBtn) {
      expandBtn.innerHTML = isFull ? '🗗' : '⛶';
      expandBtn.setAttribute('title', isFull ? 'Restore split view' : 'Expand full map');
    }
    this.invalidateMapSize();
    setTimeout(() => {
      this.updateMapMarkers(true);
    }, 150);
  }

  async showLatestMap(e) {
    if (e) e.preventDefault();
    this.switchToMapView();
    await this.loadHostels();
    this.invalidateMapSize();
    setTimeout(() => {
      this.updateMapMarkers(true);
    }, 150);
    showToast(`Showing latest map with ${this.hostels.length} hostels across Hyderabad`, 'success');
  }

  switchToListView() {
    const layout = document.getElementById('discovery-layout');
    const mobileToggleList = document.getElementById('mobile-toggle-list');
    const mobileToggleMap = document.getElementById('mobile-toggle-map');

    if (layout) {
      layout.classList.remove('view-map');
      layout.classList.add('view-list');
    }
    if (mobileToggleList) {
      mobileToggleList.classList.add('active');
      mobileToggleList.setAttribute('aria-selected', 'true');
    }
    if (mobileToggleMap) {
      mobileToggleMap.classList.remove('active');
      mobileToggleMap.setAttribute('aria-selected', 'false');
    }
    this.announceToScreenReader('Switched to hostel list view.');
  }

  announceToScreenReader(message) {
    const announcer = document.getElementById('map-live-announcer');
    if (!announcer) return;
    announcer.textContent = '';
    setTimeout(() => {
      announcer.textContent = message;
    }, 40);
  }

  initKeyboardNavigation() {
    const mapPane = document.getElementById('map-pane');

    window.addEventListener('keydown', (e) => {
      // Don't intercept if user is typing in form inputs, textareas, or selects
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (['input', 'textarea', 'select'].includes(activeTag)) return;

      const helpModal = document.getElementById('keyboard-help-modal');
      const isHelpOpen = helpModal && helpModal.style.display === 'flex';

      // Toggle help with '?'
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        this.toggleKeyboardHelp();
        return;
      }

      // Close modal / drawer with Escape
      if (e.key === 'Escape') {
        if (isHelpOpen) {
          e.preventDefault();
          this.toggleKeyboardHelp(false);
          return;
        }
        const overlay = document.getElementById('active-selection-overlay');
        if (overlay && overlay.style.display !== 'none') {
          e.preventDefault();
          this.closeActiveSelection();
          return;
        }
      }

      if (isHelpOpen) return;

      // Allow navigation hotkeys if focused on map-pane, body, or interactive map
      const isMapFocused =
        mapPane &&
        (mapPane.contains(document.activeElement) ||
          document.activeElement === mapPane ||
          document.activeElement === document.body);

      if (!isMapFocused) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          this.panMap(0, -90);
          this.announceToScreenReader('Panned map north');
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.panMap(0, 90);
          this.announceToScreenReader('Panned map south');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.panMap(-90, 0);
          this.announceToScreenReader('Panned map west');
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.panMap(90, 0);
          this.announceToScreenReader('Panned map east');
          break;
        case '+':
        case '=':
          e.preventDefault();
          this.zoomIn();
          break;
        case '-':
        case '_':
          e.preventDefault();
          this.zoomOut();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          this.recenterMap();
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          this.handleLocateUser();
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          this.toggleClustering();
          break;
        case '[':
          e.preventDefault();
          this.cycleMarker(-1);
          break;
        case ']':
          e.preventDefault();
          this.cycleMarker(1);
          break;
      }
    });
  }

  panMap(dx, dy) {
    if (this.engine === 'google' && this.map && typeof this.map.panBy === 'function') {
      this.map.panBy(dx, dy);
    } else if (this.engine === 'leaflet' && this.leafletMap) {
      this.leafletMap.panBy([dx, dy], { animate: true });
    }
  }

  zoomIn() {
    if (this.engine === 'google' && this.map && typeof this.map.getZoom === 'function') {
      const currentZoom = this.map.getZoom() || 12;
      const nextZoom = Math.min(currentZoom + 1, 20);
      this.map.setZoom(nextZoom);
      this.announceToScreenReader(`Zoomed in to level ${nextZoom}`);
    } else if (this.engine === 'leaflet' && this.leafletMap) {
      this.leafletMap.zoomIn();
      this.announceToScreenReader(`Zoomed in to level ${this.leafletMap.getZoom()}`);
    }
  }

  zoomOut() {
    if (this.engine === 'google' && this.map && typeof this.map.getZoom === 'function') {
      const currentZoom = this.map.getZoom() || 12;
      const nextZoom = Math.max(currentZoom - 1, 3);
      this.map.setZoom(nextZoom);
      this.announceToScreenReader(`Zoomed out to level ${nextZoom}`);
    } else if (this.engine === 'leaflet' && this.leafletMap) {
      this.leafletMap.zoomOut();
      this.announceToScreenReader(`Zoomed out to level ${this.leafletMap.getZoom()}`);
    }
  }

  recenterMap() {
    if (this.engine === 'google' && this.map) {
      this.map.panTo(CONFIG.DEFAULT_MAP_CENTER);
      this.map.setZoom(CONFIG.DEFAULT_ZOOM);
      this.announceToScreenReader('Recenter map to default view in Hyderabad');
    } else if (this.engine === 'leaflet' && this.leafletMap) {
      this.leafletMap.setView(
        [CONFIG.DEFAULT_MAP_CENTER.lat, CONFIG.DEFAULT_MAP_CENTER.lng],
        CONFIG.DEFAULT_ZOOM,
        { animate: true }
      );
      this.announceToScreenReader('Recenter map to default view in Hyderabad');
    }
  }

  cycleMarker(direction) {
    if (!this.hostels || this.hostels.length === 0) return;

    let currentIndex = -1;
    if (this.activeHostelId !== null) {
      currentIndex = this.hostels.findIndex((h) => h.id === this.activeHostelId);
    }

    let nextIndex;
    if (currentIndex === -1) {
      nextIndex = direction > 0 ? 0 : this.hostels.length - 1;
    } else {
      nextIndex = (currentIndex + direction + this.hostels.length) % this.hostels.length;
    }

    const nextHostel = this.hostels[nextIndex];
    if (nextHostel) {
      const marker = this.markers.get(nextHostel.id);
      if (marker) {
        this.onMarkerClicked(nextHostel, marker);
        const pin = document.getElementById(`map-marker-${nextHostel.id}`);
        if (pin) pin.focus();
      } else if (this.clusteringEnabled && this.clusters.length > 0) {
        const cluster = this.clusters.find((c) => c.hostels.some((h) => h.id === nextHostel.id));
        if (cluster) {
          this.expandCluster(cluster);
          this.setActiveHostel(nextHostel.id);
          this.renderActiveSelection(nextHostel);
        }
      }
    }
  }

  toggleKeyboardHelp(forceState) {
    const modal = document.getElementById('keyboard-help-modal');
    if (!modal) return;
    const currentState = modal.style.display === 'flex';
    const nextState = typeof forceState === 'boolean' ? forceState : !currentState;
    modal.style.display = nextState ? 'flex' : 'none';
    const helpBtn = document.getElementById('map-keyboard-help-btn');
    if (helpBtn) {
      helpBtn.setAttribute('aria-expanded', nextState ? 'true' : 'false');
    }
    if (nextState) {
      const closeBtn = document.getElementById('kbd-help-close');
      if (closeBtn) closeBtn.focus();
      this.announceToScreenReader('Opened keyboard shortcuts guide. Press Escape to close.');
    } else {
      if (helpBtn) helpBtn.focus();
    }
  }

  async loadConfigAndMap() {
    let apiKey = '';
    try {
      const configRes = await API.get('/config');
      apiKey = configRes.data?.mapApiKey || '';
    } catch (err) {
      console.warn('API config load failed:', err);
    }

    if (apiKey && apiKey !== 'YOUR_KEY_HERE') {
      try {
        await this.injectGoogleMapsScript(apiKey);
        this.initGoogleMap();
        this.updateProviderBadge('google');
        return;
      } catch (err) {
        console.warn('Google Maps Platform load failed, falling back to OpenStreetMap:', err);
      }
    }

    // Default to fully interactive Leaflet engine
    this.initLeafletMap();
    this.updateProviderBadge('leaflet');
  }

  updateProviderBadge(engine) {
    const badge = document.getElementById('map-provider-badge');
    if (!badge) return;
    if (engine === 'google') {
      badge.innerHTML = `<span class="badge-dot" style="background:#2563eb; box-shadow:0 0 6px rgba(37,99,235,0.5);"></span> Google Maps Platform`;
    } else {
      badge.innerHTML = `<span class="badge-dot" style="background:#10b981; box-shadow:0 0 6px rgba(16,185,129,0.5);"></span> Interactive Map (OSM)`;
    }
  }

  injectGoogleMapsScript(apiKey) {
    // Source: Google Maps Platform Code Assist
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps && window.google.maps.importLibrary) {
        this.isGoogleMapsLoaded = true;
        return resolve();
      }

      (g => {
        var h, a, k, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__", m = document, b = window;
        b[c] = b[c] || {};
        var d = b.maps || (b.maps = {}), r = new Set(), e = new URLSearchParams(), u = () => h || (h = new Promise(async (f, n) => {
          await (a = m.createElement("script"));
          e.set("libraries", [...r] + "");
          for (k in g) e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k]);
          e.set("callback", c + ".maps." + q);
          a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
          d[q] = f;
          a.onerror = () => h = n(Error(p + " could not load."));
          a.nonce = m.querySelector("script[nonce]")?.nonce || "";
          m.head.append(a);
        }));
        d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n));
      })({
        key: apiKey,
        v: "weekly",
        internalUsageAttributionIds: ["gmp_mcp_codeassist_v1_aistudio"],
      });

      window.google.maps.importLibrary("maps").then(() => {
        return window.google.maps.importLibrary("marker");
      }).then(() => {
        this.isGoogleMapsLoaded = true;
        resolve();
      }).catch(reject);
    });
  }

  async initGoogleMap() {
    const mapDiv = document.getElementById('map');
    if (!mapDiv || !window.google || !window.google.maps) return;

    this.engine = 'google';
    mapDiv.innerHTML = '';

    const { Map, InfoWindow } = await google.maps.importLibrary('maps');
    await google.maps.importLibrary('marker');

    this.map = new Map(mapDiv, {
      center: CONFIG.DEFAULT_MAP_CENTER,
      zoom: CONFIG.DEFAULT_ZOOM,
      mapId: CONFIG.MAP_ID || 'DEMO_MAP_ID',
      internalUsageAttributionIds: ['gmp_mcp_codeassist_v1_aistudio'],
      ...CONFIG.MAP_OPTIONS,
    });

    this.infoWindow = new InfoWindow();

    // Close info window on map click
    this.map.addListener('click', () => {
      if (this.infoWindow) this.infoWindow.close();
      this.closeActiveSelection();
    });

    // Listen to zoom changes to update clusters dynamically
    this.map.addListener('idle', () => {
      if (this.clusteringEnabled) {
        const currentZoom = Math.round(this.map.getZoom() || CONFIG.DEFAULT_ZOOM);
        if (this.lastClusterZoom !== currentZoom) {
          this.lastClusterZoom = currentZoom;
          this.updateGoogleMapMarkers(false);
        }
      }
    });

    this.isGoogleMapsLoaded = true;
    this.invalidateMapSize();
    this.updateMapMarkers(true);
  }

  initLeafletMap() {
    const mapDiv = document.getElementById('map');
    if (!mapDiv) return;

    if (!window.L) {
      console.warn('Leaflet library not ready on window');
      return;
    }

    if (this.leafletMap) {
      this.leafletMap.remove();
      this.leafletMap = null;
    }
    mapDiv.innerHTML = '';

    this.engine = 'leaflet';
    this.leafletMap = L.map(mapDiv, {
      center: [CONFIG.DEFAULT_MAP_CENTER.lat, CONFIG.DEFAULT_MAP_CENTER.lng],
      zoom: CONFIG.DEFAULT_ZOOM,
      zoomControl: false, // We have dedicated custom accessible buttons
      attributionControl: true,
    });

    const themeConfig = MAP_THEMES[this.currentTheme] || MAP_THEMES.voyager;
    this.leafletTileLayer = L.tileLayer(themeConfig.url, {
      maxZoom: themeConfig.maxZoom,
      subdomains: themeConfig.subdomains || 'abc',
      attribution: themeConfig.attribution,
    }).addTo(this.leafletMap);

    this.leafletMap.on('click', () => {
      this.closeActiveSelection();
    });

    this.leafletMap.on('zoomend', () => {
      if (this.clusteringEnabled) {
        const currentZoom = this.leafletMap.getZoom();
        if (this.lastClusterZoom !== currentZoom) {
          this.lastClusterZoom = currentZoom;
          this.updateLeafletMapMarkers(false);
        }
      }
    });

    this.invalidateMapSize();
    this.updateMapMarkers(true);
  }

  setMapTheme(themeName) {
    if (!MAP_THEMES[themeName]) return;
    this.currentTheme = themeName;
    localStorage.setItem('hostelmap_theme', themeName);
    this.initThemeUI();

    const themeConfig = MAP_THEMES[themeName];

    if (this.engine === 'leaflet' && this.leafletMap) {
      if (this.leafletTileLayer) {
        this.leafletMap.removeLayer(this.leafletTileLayer);
      }
      this.leafletTileLayer = L.tileLayer(themeConfig.url, {
        maxZoom: themeConfig.maxZoom,
        subdomains: themeConfig.subdomains || 'abc',
        attribution: themeConfig.attribution,
      }).addTo(this.leafletMap);
    } else if (this.engine === 'google' && this.map) {
      this.map.setMapTypeId(themeConfig.googleMapTypeId || 'roadmap');
    }

    showToast(`🎨 Map theme set to ${themeConfig.name}`, 'info');
    this.announceToScreenReader(`Map visual theme switched to ${themeConfig.name}`);
  }

  flyToHub(hubKey) {
    const hub = HYDERABAD_HUBS[hubKey];
    if (!hub) return;

    // Update active state in hub chips
    document.querySelectorAll('.map-hub-chip').forEach((chip) => {
      const isMatch = chip.getAttribute('onclick')?.includes(hubKey);
      chip.classList.toggle('active', isMatch);
    });

    if (hubKey === 'ALL') {
      this.fitAllHostels();
      return;
    }

    if (this.engine === 'leaflet' && this.leafletMap) {
      this.leafletMap.flyTo([hub.lat, hub.lng], hub.zoom, { duration: 1.2 });
    } else if (this.engine === 'google' && this.map) {
      this.map.panTo({ lat: hub.lat, lng: hub.lng });
      this.map.setZoom(Math.round(hub.zoom));
    }

    showToast(`📍 Centered on ${hub.name}`, 'info');
    this.announceToScreenReader(`Flew map camera to ${hub.name} educational hub`);
  }

  setSearchRadius(radiusKm) {
    this.searchRadiusKm = radiusKm;
    document.querySelectorAll('.radius-pill').forEach((pill) => {
      const r = parseInt(pill.dataset.radius, 10);
      pill.classList.toggle('active', r === radiusKm);
    });

    if (!this.userLocation) {
      // Default to Hyderabad central hub if user hasn't located
      this.userLocation = { lat: 17.4435, lng: 78.3582 };
    }

    this.drawRadiusCircle();
    this.loadHostels();
    showToast(`🎯 Showing hostels within ${radiusKm} km radius`, 'info');
  }

  drawRadiusCircle() {
    if (!this.userLocation || !this.searchRadiusKm) return;

    const center = this.userLocation;
    const radiusMeters = this.searchRadiusKm * 1000;

    if (this.engine === 'leaflet' && this.leafletMap) {
      if (this.radiusCircle) {
        this.leafletMap.removeLayer(this.radiusCircle);
      }
      this.radiusCircle = L.circle([center.lat, center.lng], {
        radius: radiusMeters,
        color: '#6366f1',
        weight: 2,
        fillColor: '#818cf8',
        fillOpacity: 0.12,
        dashArray: '6, 6',
      }).addTo(this.leafletMap);

      this.leafletMap.fitBounds(this.radiusCircle.getBounds(), { padding: [40, 40] });
    } else if (this.engine === 'google' && this.map && window.google?.maps?.Circle) {
      if (this.radiusCircle) {
        this.radiusCircle.setMap(null);
      }
      this.radiusCircle = new google.maps.Circle({
        strokeColor: '#6366f1',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#818cf8',
        fillOpacity: 0.15,
        map: this.map,
        center: center,
        radius: radiusMeters,
      });
      this.map.fitBounds(this.radiusCircle.getBounds());
    }
  }

  clearUserLocation() {
    this.userLocation = null;
    this.searchRadiusKm = null;
    if (this.radiusCircle) {
      if (this.engine === 'leaflet' && this.leafletMap) {
        this.leafletMap.removeLayer(this.radiusCircle);
      } else if (this.engine === 'google' && this.radiusCircle.setMap) {
        this.radiusCircle.setMap(null);
      }
      this.radiusCircle = null;
    }
    const radiusBar = document.getElementById('map-radius-bar');
    if (radiusBar) radiusBar.style.display = 'none';

    this.loadHostels();
    this.fitAllHostels();
    showToast('Cleared location radius filter', 'info');
  }

  async loadHostels() {
    const container = document.getElementById('hostel-list');
    const countDisplay = document.getElementById('results-count');

    if (container) {
      container.innerHTML = `
        <div class="state-container">
          <div class="spinner"></div>
          <p class="state-desc">Discovering student verified hostels...</p>
        </div>
      `;
    }

    try {
      let res;
      if (this.currentFilters.search) {
        res = await API.searchHostels(this.currentFilters.search);
      } else {
        const params = {
          type: this.currentFilters.type !== 'ALL' ? this.currentFilters.type : undefined,
          priceRange: this.currentFilters.priceRange || undefined,
          food: this.currentFilters.food ? 'true' : undefined,
          minRating: this.currentFilters.minRating || undefined,
          facility: this.currentFilters.facility || undefined,
        };
        res = await API.getHostels(params);
      }

      this.hostels = res.data || [];

      // If user location is active, calculate distances and filter by radius
      if (this.userLocation) {
        this.hostels.forEach((h) => {
          const lat = parseFloat(h.latitude);
          const lng = parseFloat(h.longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            const d = this.calculateDistanceKm(
              this.userLocation.lat,
              this.userLocation.lng,
              lat,
              lng
            );
            h.distanceKm = parseFloat(d.toFixed(1));
          }
        });

        if (this.searchRadiusKm) {
          this.hostels = this.hostels.filter((h) => h.distanceKm !== undefined && h.distanceKm <= this.searchRadiusKm);
        }

        // Sort by closest first
        this.hostels.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
      }

      if (countDisplay) {
        if (this.userLocation && this.searchRadiusKm) {
          countDisplay.innerText = `${this.hostels.length} ${this.hostels.length === 1 ? 'hostel' : 'hostels'} within ${this.searchRadiusKm}km`;
        } else {
          countDisplay.innerText = `${this.hostels.length} ${this.hostels.length === 1 ? 'hostel' : 'hostels'} found`;
        }
      }

      this.renderHostelList();
      this.updateMapMarkers(true);
    } catch (err) {
      console.error('Failed to load hostels:', err);
      if (container) {
        container.innerHTML = `
          <div class="state-container">
            <div class="state-icon">⚠️</div>
            <h4 class="state-title">Unable to load hostels</h4>
            <p class="state-desc">${err.message || 'Please check your connection and retry.'}</p>
            <button class="btn btn-secondary btn-sm" onclick="window.mapController.loadHostels()">Retry</button>
          </div>
        `;
      }
    }
  }

  renderHostelList(preserveScroll = false) {
    const container = document.getElementById('hostel-list');
    if (!container) return;

    if (!preserveScroll) {
      container.scrollTop = 0;
    }

    if (this.hostels.length === 0) {
      container.innerHTML = `
        <div class="state-container">
          <div class="state-icon">🔍</div>
          <h4 class="state-title">No hostels match your filters</h4>
          <p class="state-desc">Try resetting your filters or search for another area/college.</p>
          <button class="btn btn-outline btn-sm" onclick="window.mapController.resetFilters()">Reset All Filters</button>
        </div>
      `;
      return;
    }

    const savedIds = this.getSavedHostelIds();
    const compareIds = this.getCompareHostelIds();
    const defaultThumb = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=300&q=80';

    container.innerHTML = this.hostels
      .map((h) => {
        const isSaved = savedIds.includes(h.id);
        const isCompared = compareIds.includes(h.id);
        const photoUrl = h.coverImage || (h.images && h.images[0]) || (h.photos && h.photos[0]) || defaultThumb;

        const typeClass =
          h.hostelType === 'BOYS'
            ? 'hostel-type-boys'
            : h.hostelType === 'GIRLS'
            ? 'hostel-type-girls'
            : 'hostel-type-coliving';

        const typeLabel =
          h.hostelType === 'BOYS'
            ? "Boys"
            : h.hostelType === 'GIRLS'
            ? "Girls PG"
            : 'Co-Living';

        const facilitiesHtml = (h.facilities || [])
          .slice(0, 3)
          .map((f) => `<span class="facility-tag">${f}</span>`)
          .join('');

        const foodBadge = h.foodAvailable
          ? `<span class="facility-tag food-tag">Food</span>`
          : '';

        const verifiedBadge = h.verified
          ? `<span class="verified-pill" title="Physical verification completed">✓ Verified</span>`
          : '';

        return `
          <div class="hostel-card ${this.activeHostelId === h.id ? 'active-marker' : ''}" 
               id="hostel-card-${h.id}"
               onclick="window.mapController.onCardClicked(${h.id})"
               onmouseenter="window.mapController.onCardHovered(${h.id})"
               onmouseleave="window.mapController.onCardUnhovered(${h.id})">
            
            <div class="hostel-card-thumb" style="background-image: url('${photoUrl}');"></div>

            <div class="hostel-card-content">
              <div>
                <div class="hostel-card-header">
                  <h3 class="hostel-card-name">${h.name}</h3>
                  <div class="rating-badge ${h.rating >= 4.0 ? 'rating-high' : ''}">
                    <span class="rating-star-icon">★</span>
                    <span>${h.rating > 0 ? h.rating.toFixed(1) : '4.5'}</span>
                  </div>
                </div>

                <div class="hostel-card-location">
                  <span>${h.area}, ${h.city}</span>
                  ${h.distanceKm !== undefined ? `<span>• ${h.distanceKm}km</span>` : ''}
                </div>

                <div class="hostel-card-facilities">
                  ${verifiedBadge}
                  ${foodBadge}
                  ${facilitiesHtml}
                </div>
              </div>

              <div class="hostel-card-footer">
                <div class="hostel-card-price">
                  ₹${h.monthlyRent.toLocaleString('en-IN')}
                  <span class="price-subtext">/mo</span>
                </div>

                <div class="hostel-card-actions">
                  <button class="btn btn-outline btn-sm" 
                          title="Compare hostel"
                          onclick="event.stopPropagation(); window.mapController.toggleCompare(${h.id})">
                    ${isCompared ? '✓ Added' : 'Compare'}
                  </button>
                  <a href="/hostel.html?id=${h.id}" class="btn btn-primary btn-sm" onclick="event.stopPropagation()">
                    View →
                  </a>
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join('');
  }

  calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  latLngToPixel(lat, lng, zoom) {
    const sinLat = Math.sin((lat * Math.PI) / 180);
    const clampedSin = Math.min(Math.max(sinLat, -0.9999), 0.9999);
    const x = 256 * (0.5 + lng / 360);
    const y = 256 * (0.5 - Math.log((1 + clampedSin) / (1 - clampedSin)) / (4 * Math.PI));
    const scale = Math.pow(2, zoom);
    return { x: x * scale, y: y * scale };
  }

  computeClusters(items, zoom, radiusPx = 55) {
    const clusters = [];
    let clusterIdCounter = 1;

    for (const h of items) {
      const lat = parseFloat(h.latitude);
      const lng = parseFloat(h.longitude);
      if (isNaN(lat) || isNaN(lng)) continue;

      const px = this.latLngToPixel(lat, lng, zoom);

      let closestCluster = null;
      let minDist = radiusPx;

      for (const c of clusters) {
        const d = Math.hypot(c.px.x - px.x, c.px.y - px.y);
        if (d < minDist) {
          minDist = d;
          closestCluster = c;
        }
      }

      if (closestCluster) {
        closestCluster.hostels.push(h);
        closestCluster.minLat = Math.min(closestCluster.minLat, lat);
        closestCluster.maxLat = Math.max(closestCluster.maxLat, lat);
        closestCluster.minLng = Math.min(closestCluster.minLng, lng);
        closestCluster.maxLng = Math.max(closestCluster.maxLng, lng);
        const count = closestCluster.hostels.length;
        closestCluster.lat = (closestCluster.lat * (count - 1) + lat) / count;
        closestCluster.lng = (closestCluster.lng * (count - 1) + lng) / count;
        closestCluster.px = this.latLngToPixel(closestCluster.lat, closestCluster.lng, zoom);
      } else {
        clusters.push({
          id: clusterIdCounter++,
          hostels: [h],
          lat,
          lng,
          px,
          minLat: lat,
          maxLat: lat,
          minLng: lng,
          maxLng: lng,
        });
      }
    }
    return clusters;
  }

  createPricePinElement(h, onSelect) {
    const pricePin = document.createElement('div');
    const genderIcon = h.hostelType === 'BOYS' ? '🚹' : h.hostelType === 'GIRLS' ? '🚺' : '👥';
    const typeClass =
      h.hostelType === 'BOYS'
        ? 'marker-type-boys'
        : h.hostelType === 'GIRLS'
        ? 'marker-type-girls'
        : 'marker-type-coliving';

    pricePin.className = `custom-map-marker ${typeClass} ${this.activeHostelId === h.id ? 'active' : ''}`;
    pricePin.id = `map-marker-${h.id}`;
    pricePin.setAttribute('role', 'button');
    pricePin.setAttribute('tabindex', '0');
    pricePin.setAttribute(
      'aria-label',
      `${h.name}, ${h.hostelType.toLowerCase()} hostel in ${h.area}. Rent ₹${h.monthlyRent.toLocaleString('en-IN')} per month. Rating ${h.rating > 0 ? h.rating.toFixed(1) : '4.5'} stars. Press Enter to view details.`
    );
    pricePin.setAttribute('aria-expanded', this.activeHostelId === h.id ? 'true' : 'false');
    pricePin.innerHTML = `
      <span class="marker-gender-icon">${genderIcon}</span>
      <span class="marker-price-val">₹${(h.monthlyRent / 1000).toFixed(1)}k</span>
      <span class="marker-star-tag">★ ${(h.rating > 0 ? h.rating.toFixed(1) : '4.5')}</span>
      ${h.verified ? '<span style="color:#10b981; font-weight:800; font-size:0.75rem;" title="Verified PG">✓</span>' : ''}
    `;

    pricePin.addEventListener('click', (e) => {
      e.stopPropagation();
      onSelect();
    });

    pricePin.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        onSelect();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        this.cycleMarker(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.cycleMarker(-1);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.closeActiveSelection();
      }
    });

    return pricePin;
  }

  createClusterElement(cluster) {
    const count = cluster.hostels.length;
    const sizeClass = count >= 10 ? 'cluster-lg' : count >= 5 ? 'cluster-md' : 'cluster-sm';
    const clusterEl = document.createElement('div');
    clusterEl.className = `custom-cluster-marker ${sizeClass}`;
    clusterEl.id = `map-cluster-${cluster.id}`;
    clusterEl.setAttribute('role', 'button');
    clusterEl.setAttribute('tabindex', '0');
    clusterEl.setAttribute(
      'aria-label',
      `Cluster of ${count} hostels. Press Enter or Space to zoom in and expand this cluster.`
    );
    clusterEl.setAttribute(
      'title',
      `${count} hostels clustered here. Click or press Enter to zoom in and expand.`
    );
    clusterEl.innerHTML = `
      <div class="cluster-badge">
        <span class="cluster-count">${count}</span>
        <span class="cluster-label">Hostels</span>
      </div>
    `;

    const handleExpand = (e) => {
      if (e) e.stopPropagation();
      this.expandCluster(cluster);
    };

    clusterEl.addEventListener('click', handleExpand);
    clusterEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleExpand(e);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.closeActiveSelection();
      }
    });

    // Hover effect: highlight cards in sidebar
    clusterEl.addEventListener('mouseenter', () => {
      cluster.hostels.forEach((h) => {
        const card = document.getElementById(`hostel-card-${h.id}`);
        if (card) card.classList.add('active-marker');
      });
    });

    clusterEl.addEventListener('mouseleave', () => {
      cluster.hostels.forEach((h) => {
        if (this.activeHostelId !== h.id) {
          const card = document.getElementById(`hostel-card-${h.id}`);
          if (card) card.classList.remove('active-marker');
        }
      });
    });

    return clusterEl;
  }

  expandCluster(cluster) {
    if (!cluster || !cluster.hostels || cluster.hostels.length === 0) return;

    if (this.engine === 'google' && this.map) {
      const bounds = new google.maps.LatLngBounds();
      cluster.hostels.forEach((h) => {
        bounds.extend({ lat: parseFloat(h.latitude), lng: parseFloat(h.longitude) });
      });

      const latSpan = Math.abs(cluster.maxLat - cluster.minLat);
      const lngSpan = Math.abs(cluster.maxLng - cluster.minLng);

      if (latSpan < 0.0005 && lngSpan < 0.0005) {
        this.map.panTo({ lat: cluster.lat, lng: cluster.lng });
        this.map.setZoom(Math.max((this.map.getZoom() || 13) + 2, 17));
      } else {
        this.map.fitBounds(bounds, { top: 70, bottom: 70, left: 70, right: 70 });
      }
      this.announceToScreenReader(`Expanded cluster of ${cluster.hostels.length} hostels.`);
    } else if (this.engine === 'leaflet' && this.leafletMap) {
      const latSpan = Math.abs(cluster.maxLat - cluster.minLat);
      const lngSpan = Math.abs(cluster.maxLng - cluster.minLng);

      if (latSpan < 0.0005 && lngSpan < 0.0005) {
        this.leafletMap.setView(
          [cluster.lat, cluster.lng],
          Math.max((this.leafletMap.getZoom() || 13) + 2, 17)
        );
      } else {
        this.leafletMap.fitBounds(
          [
            [cluster.minLat, cluster.minLng],
            [cluster.maxLat, cluster.maxLng],
          ],
          { padding: [60, 60], maxZoom: 17 }
        );
      }
      this.announceToScreenReader(`Expanded cluster of ${cluster.hostels.length} hostels.`);
    }
  }

  toggleClustering() {
    this.clusteringEnabled = !this.clusteringEnabled;
    const btn = document.getElementById('map-cluster-toggle-btn');
    if (btn) {
      btn.classList.toggle('active-clustering', this.clusteringEnabled);
      btn.setAttribute(
        'aria-label',
        this.clusteringEnabled ? 'Disable marker clustering (C)' : 'Enable marker clustering (C)'
      );
      btn.setAttribute(
        'title',
        this.clusteringEnabled
          ? 'Clustering active: Click or press C to show all individual pins'
          : 'Clustering off: Click or press C to group nearby hostels'
      );
    }
    this.updateMapMarkers(false);
    showToast(
      this.clusteringEnabled
        ? 'Cluster view active: Grouped high-density hostels'
        : 'All pins view: Showing individual markers',
      'info'
    );
    this.announceToScreenReader(
      this.clusteringEnabled
        ? 'Marker clustering enabled'
        : 'Marker clustering disabled. All individual pins visible.'
    );
  }

  updateMapMarkers(shouldFitBounds = false) {
    if (this.engine === 'google') {
      this.updateGoogleMapMarkers(shouldFitBounds);
    } else if (this.engine === 'leaflet') {
      this.updateLeafletMapMarkers(shouldFitBounds);
    }

    // Update results count display to show cluster count if active
    const countDisplay = document.getElementById('results-count');
    if (countDisplay && this.hostels) {
      const multiClusterCount = this.clusteringEnabled
        ? this.clusters.filter((c) => c.hostels.length > 1).length
        : 0;
      let countText = `${this.hostels.length} ${this.hostels.length === 1 ? 'hostel' : 'hostels'} found`;
      if (multiClusterCount > 0) {
        countText += ` • ${multiClusterCount} clusters`;
      }
      countDisplay.innerText = countText;
    }

    // Update map status banner
    const mapStatusText = document.getElementById('map-status-text');
    if (mapStatusText && this.hostels) {
      mapStatusText.innerText = `Live Map • ${this.hostels.length} Hostels Active`;
    }
  }

  updateGoogleMapMarkers(shouldFitBounds = false) {
    if (!this.map || !window.google?.maps?.marker?.AdvancedMarkerElement) return;

    // Clear old markers and cluster markers
    this.markers.forEach((marker) => {
      if (marker && 'map' in marker) marker.map = null;
    });
    this.markers.clear();

    this.clusterMarkers.forEach((marker) => {
      if (marker && 'map' in marker) marker.map = null;
    });
    this.clusterMarkers.clear();

    if (!this.hostels || this.hostels.length === 0) return;

    const bounds = new google.maps.LatLngBounds();

    if (this.clusteringEnabled) {
      const zoom = Math.round(this.map.getZoom() || CONFIG.DEFAULT_ZOOM);
      this.clusters = this.computeClusters(this.hostels, zoom, this.clusterRadiusPx);

      this.clusters.forEach((cluster) => {
        if (cluster.hostels.length === 1) {
          const h = cluster.hostels[0];
          const position = { lat: parseFloat(h.latitude), lng: parseFloat(h.longitude) };
          bounds.extend(position);

          const marker = new google.maps.marker.AdvancedMarkerElement({
            map: this.map,
            position,
            title: h.name,
          });

          const pricePin = this.createPricePinElement(h, () => {
            this.onMarkerClicked(h, marker);
          });
          marker.append(pricePin);
          this.markers.set(h.id, marker);
        } else {
          bounds.extend({ lat: cluster.lat, lng: cluster.lng });

          const clusterEl = this.createClusterElement(cluster);
          const clusterMarker = new google.maps.marker.AdvancedMarkerElement({
            map: this.map,
            position: { lat: cluster.lat, lng: cluster.lng },
            title: `${cluster.hostels.length} hostels clustered here`,
          });
          clusterMarker.append(clusterEl);
          this.clusterMarkers.set(cluster.id, clusterMarker);
        }
      });
    } else {
      this.clusters = [];
      this.hostels.forEach((h) => {
        const position = { lat: parseFloat(h.latitude), lng: parseFloat(h.longitude) };
        bounds.extend(position);

        const marker = new google.maps.marker.AdvancedMarkerElement({
          map: this.map,
          position,
          title: h.name,
        });

        const pricePin = this.createPricePinElement(h, () => {
          this.onMarkerClicked(h, marker);
        });
        marker.append(pricePin);
        this.markers.set(h.id, marker);
      });
    }

    if (shouldFitBounds && this.hostels.length > 0 && !this.userLocation) {
      this.map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
      const listener = google.maps.event.addListener(this.map, 'idle', () => {
        if (this.map.getZoom() > 16) this.map.setZoom(16);
        google.maps.event.removeListener(listener);
      });
    }
  }

  updateLeafletMapMarkers(shouldFitBounds = false) {
    if (!this.leafletMap || !window.L) return;

    // Clear old markers and cluster markers
    this.markers.forEach((marker) => {
      if (marker && typeof marker.remove === 'function') {
        marker.remove();
      }
    });
    this.markers.clear();

    this.clusterMarkers.forEach((marker) => {
      if (marker && typeof marker.remove === 'function') {
        marker.remove();
      }
    });
    this.clusterMarkers.clear();

    if (!this.hostels || this.hostels.length === 0) return;

    const bounds = L.latLngBounds([]);

    if (this.clusteringEnabled) {
      const zoom = this.leafletMap.getZoom() || CONFIG.DEFAULT_ZOOM;
      this.clusters = this.computeClusters(this.hostels, zoom, this.clusterRadiusPx);

      this.clusters.forEach((cluster) => {
        if (cluster.hostels.length === 1) {
          const h = cluster.hostels[0];
          const lat = parseFloat(h.latitude);
          const lng = parseFloat(h.longitude);
          if (isNaN(lat) || isNaN(lng)) return;

          bounds.extend([lat, lng]);

          let leafletMarker;
          const pricePin = this.createPricePinElement(h, () => {
            this.onMarkerClicked(h, leafletMarker);
          });

          const markerIcon = L.divIcon({
            className: 'leaflet-custom-marker-wrapper',
            html: pricePin,
            iconSize: [68, 30],
            iconAnchor: [34, 15],
          });

          leafletMarker = L.marker([lat, lng], {
            icon: markerIcon,
            title: h.name,
          }).addTo(this.leafletMap);

          leafletMarker.position = { lat, lng };
          this.markers.set(h.id, leafletMarker);
        } else {
          bounds.extend([cluster.lat, cluster.lng]);

          const clusterEl = this.createClusterElement(cluster);
          const clusterIcon = L.divIcon({
            className: 'leaflet-custom-marker-wrapper',
            html: clusterEl,
            iconSize: [52, 52],
            iconAnchor: [26, 26],
          });

          const clusterMarker = L.marker([cluster.lat, cluster.lng], {
            icon: clusterIcon,
            title: `${cluster.hostels.length} hostels`,
          }).addTo(this.leafletMap);

          this.clusterMarkers.set(cluster.id, clusterMarker);
        }
      });
    } else {
      this.clusters = [];
      this.hostels.forEach((h) => {
        const lat = parseFloat(h.latitude);
        const lng = parseFloat(h.longitude);
        if (isNaN(lat) || isNaN(lng)) return;

        bounds.extend([lat, lng]);

        let leafletMarker;
        const pricePin = this.createPricePinElement(h, () => {
          this.onMarkerClicked(h, leafletMarker);
        });

        const markerIcon = L.divIcon({
          className: 'leaflet-custom-marker-wrapper',
          html: pricePin,
          iconSize: [68, 30],
          iconAnchor: [34, 15],
        });

        leafletMarker = L.marker([lat, lng], {
          icon: markerIcon,
          title: h.name,
        }).addTo(this.leafletMap);

        leafletMarker.position = { lat, lng };
        this.markers.set(h.id, leafletMarker);
      });
    }

    if (shouldFitBounds && this.hostels.length > 0 && !this.userLocation && bounds.isValid()) {
      this.leafletMap.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }

  onMarkerClicked(hostel, marker) {
    this.setActiveHostel(hostel.id);

    // Pan map smoothly
    const pos = marker?.position;
    if (pos) {
      if (this.engine === 'google' && this.map) {
        this.map.panTo(pos);
      } else if (this.engine === 'leaflet' && this.leafletMap) {
        this.leafletMap.panTo([pos.lat, pos.lng], { animate: true, duration: 0.5 });
      }
    }

    // Render Sleek Interface Active Selection Floating Drawer
    this.renderActiveSelection(hostel);

    // Announce to screen reader
    this.announceToScreenReader(
      `Selected ${hostel.name}, ${hostel.hostelType.toLowerCase()} hostel in ${hostel.area}. Rent ₹${hostel.monthlyRent.toLocaleString('en-IN')} per month. Rating ${hostel.rating > 0 ? hostel.rating.toFixed(1) : '4.5'} stars. Quick preview opened.`
    );

    // Scroll corresponding card into view in the left list
    const card = document.getElementById(`hostel-card-${hostel.id}`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  renderActiveSelection(hostel) {
    const overlay = document.getElementById('active-selection-overlay');
    const body = document.getElementById('active-selection-body');
    if (!overlay || !body) return;

    const breakfast = hostel.todayFood?.breakfast || 'Idli & Sambar';
    const lunch = hostel.todayFood?.lunch || 'Veg Meals & Curd';
    const dinner = hostel.todayFood?.dinner || 'Roti & Dal';

    const wifiScore = hostel.wifiRating ? Math.round((hostel.wifiRating / 5) * 100) : 88;
    const foodScore = hostel.foodRating ? Math.round((hostel.foodRating / 5) * 100) : 92;
    const cleanScore = hostel.cleanlinessRating ? Math.round((hostel.cleanlinessRating / 5) * 100) : 85;

    const sampleQuote = hostel.recentReview || 
      (hostel.reviews && hostel.reviews[0]?.comment) || 
      "Decent food menu with good Wi-Fi speed for late night study. Very close to bus stop.";

    const isCompared = this.getCompareHostelIds().includes(hostel.id);
    const photoUrl = hostel.coverImage || (hostel.images && hostel.images[0]) || (hostel.photos && hostel.photos[0]) || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80';

    body.innerHTML = `
      <div class="active-selection-layout">
        <div style="display:flex; gap:1rem; align-items:flex-start; flex:1;">
          <div style="width:115px; min-width:115px; height:95px; border-radius:var(--radius-sm); overflow:hidden; position:relative; background:#e2e8f0; flex-shrink:0;">
            <img src="${photoUrl}" alt="${hostel.name}" style="width:100%; height:100%; object-fit:cover;" />
            <span style="position:absolute; bottom:3px; left:3px; background:rgba(0,0,0,0.68); color:#fff; font-size:0.65rem; font-weight:700; padding:1px 4px; border-radius:2px;">📷 Photos</span>
          </div>
          <div class="active-selection-main" style="flex:1;">
            <span class="active-selection-tagline">
              ${hostel.verified ? '✓ VERIFIED' : 'STUDENT PG'} • ${hostel.area.toUpperCase()}
            </span>
            <h2 class="active-selection-title">${hostel.name}</h2>
            
            <div class="active-selection-grid">
              <div>
                <div class="active-col-header">Today's Menu</div>
                <div class="active-food-list">
                  <div class="active-food-row">
                    <span>Breakfast</span>
                    <span class="food-val" title="${breakfast}">${breakfast.split(',')[0]}</span>
                  </div>
                  <div class="active-food-row">
                    <span>Lunch</span>
                    <span class="food-val" title="${lunch}">${lunch.split(',')[0]}</span>
                  </div>
                  <div class="active-food-row">
                    <span>Dinner</span>
                    <span class="food-val" title="${dinner}">${dinner.split(',')[0]}</span>
                  </div>
                </div>
              </div>

              <div>
                <div class="active-col-header">Experience</div>
                <div class="active-exp-list">
                  <div class="active-exp-item">
                    <div class="active-exp-header">
                      <span>Wi-Fi Reliability</span>
                      <span>${wifiScore}%</span>
                    </div>
                    <div class="active-progress-bg">
                      <div class="active-progress-bar" style="width: ${wifiScore}%; background: var(--primary);"></div>
                    </div>
                  </div>
                  <div class="active-exp-item">
                    <div class="active-exp-header">
                      <span>Food Taste</span>
                      <span>${foodScore}%</span>
                    </div>
                    <div class="active-progress-bg">
                      <div class="active-progress-bar" style="width: ${foodScore}%; background: #10b981;"></div>
                    </div>
                  </div>
                  <div class="active-exp-item">
                    <div class="active-exp-header">
                      <span>Cleanliness</span>
                      <span>${cleanScore}%</span>
                    </div>
                    <div class="active-progress-bg">
                      <div class="active-progress-bar" style="width: ${cleanScore}%; background: #6366f1;"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div class="active-col-header">Student Review</div>
                <p class="active-review-quote">"${sampleQuote}"</p>
                <div class="active-review-author">— Verified Resident</div>
              </div>
            </div>
          </div>
        </div>

        <div class="active-selection-actions">
          <div style="font-size:1.15rem; font-weight:800; color:var(--primary-text); margin-bottom:0.25rem;">
            ₹${hostel.monthlyRent.toLocaleString('en-IN')}<span style="font-size:0.75rem; font-weight:400; color:var(--text-muted);">/mo</span>
          </div>
          <a href="/hostel.html?id=${hostel.id}" class="btn btn-primary btn-sm">
            View Details →
          </a>
          <button class="btn btn-outline btn-sm" onclick="window.mapController.toggleCompare(${hostel.id})">
            ${isCompared ? '✓ In Compare' : '⇄ Compare'}
          </button>
        </div>
      </div>
    `;

    overlay.style.display = 'flex';
  }

  closeActiveSelection() {
    const overlay = document.getElementById('active-selection-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
    const prevActiveId = this.activeHostelId;
    this.setActiveHostel(null);
    this.announceToScreenReader('Closed hostel preview');
    if (prevActiveId) {
      const pin = document.getElementById(`map-marker-${prevActiveId}`);
      if (pin) pin.focus();
    }
  }

  onCardClicked(hostelId) {
    const hostel = this.hostels.find((h) => h.id === hostelId);
    if (!hostel) return;

    // Check if hostel marker is currently inside a multi-hostel cluster
    if (this.clusteringEnabled && this.clusters.length > 0) {
      const cluster = this.clusters.find((c) => c.hostels.some((h) => h.id === hostelId));
      if (cluster && cluster.hostels.length > 1) {
        // Expand cluster to reveal individual hostel pin
        this.expandCluster(cluster);
        this.setActiveHostel(hostelId);
        this.renderActiveSelection(hostel);
        return;
      }
    }

    const marker = this.markers.get(hostelId);
    if (marker) {
      this.onMarkerClicked(hostel, marker);
    } else {
      this.setActiveHostel(hostelId);
      this.renderActiveSelection(hostel);
      const pos = { lat: parseFloat(hostel.latitude), lng: parseFloat(hostel.longitude) };
      if (this.engine === 'google' && this.map) {
        this.map.panTo(pos);
      } else if (this.engine === 'leaflet' && this.leafletMap) {
        this.leafletMap.panTo([pos.lat, pos.lng], { animate: true });
      }
    }
  }

  onCardHovered(hostelId) {
    const markerPin = document.getElementById(`map-marker-${hostelId}`);
    if (markerPin) {
      markerPin.classList.add('active');
    }
    if (this.clusteringEnabled && this.clusters.length > 0) {
      const cluster = this.clusters.find((c) => c.hostels.some((h) => h.id === hostelId));
      if (cluster && cluster.hostels.length > 1) {
        const clusterEl = document.getElementById(`map-cluster-${cluster.id}`);
        if (clusterEl) clusterEl.classList.add('hover-highlight');
      }
    }
  }

  onCardUnhovered(hostelId) {
    if (this.activeHostelId !== hostelId) {
      const markerPin = document.getElementById(`map-marker-${hostelId}`);
      if (markerPin) {
        markerPin.classList.remove('active');
      }
    }
    if (this.clusteringEnabled && this.clusters.length > 0) {
      const cluster = this.clusters.find((c) => c.hostels.some((h) => h.id === hostelId));
      if (cluster && cluster.hostels.length > 1) {
        const clusterEl = document.getElementById(`map-cluster-${cluster.id}`);
        if (clusterEl) clusterEl.classList.remove('hover-highlight');
      }
    }
  }

  setActiveHostel(id) {
    this.activeHostelId = id;
    // Update card highlights and ARIA states
    document.querySelectorAll('.hostel-card').forEach((c) => {
      const isCardActive = c.id === `hostel-card-${id}`;
      c.classList.toggle('active-marker', isCardActive);
      c.setAttribute('aria-selected', isCardActive ? 'true' : 'false');
    });

    // Update marker pins and ARIA states
    this.markers.forEach((marker, mId) => {
      const pin = document.getElementById(`map-marker-${mId}`);
      if (pin) {
        const isActive = mId === id;
        pin.classList.toggle('active', isActive);
        pin.setAttribute('aria-expanded', isActive ? 'true' : 'false');
      }
    });
  }

  handleLocateUser() {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      this.announceToScreenReader('Geolocation is not supported by your browser');
      return;
    }

    showToast('Locating your position...', 'info');
    this.announceToScreenReader('Locating your current GPS position...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        this.userLocation = { lat: latitude, lng: longitude };

        if (this.engine === 'google' && this.map) {
          this.map.panTo(this.userLocation);
          this.map.setZoom(14);

          // Add user position indicator marker
          if (window.google?.maps?.marker?.AdvancedMarkerElement) {
            const userPin = document.createElement('div');
            userPin.style.width = '18px';
            userPin.style.height = '18px';
            userPin.style.background = '#2563eb';
            userPin.style.border = '3px solid #ffffff';
            userPin.style.borderRadius = '50%';
            userPin.style.boxShadow = '0 0 0 5px rgba(37,99,235,0.3)';

            new google.maps.marker.AdvancedMarkerElement({
              map: this.map,
              position: this.userLocation,
              title: 'Your Location',
              content: userPin,
            });
          }
        } else if (this.engine === 'leaflet' && this.leafletMap) {
          this.leafletMap.setView([latitude, longitude], 14, { animate: true });
          const userPin = document.createElement('div');
          userPin.style.width = '18px';
          userPin.style.height = '18px';
          userPin.style.background = '#2563eb';
          userPin.style.border = '3px solid #ffffff';
          userPin.style.borderRadius = '50%';
          userPin.style.boxShadow = '0 0 0 5px rgba(37,99,235,0.3)';

          const userIcon = L.divIcon({
            className: 'leaflet-custom-marker-wrapper',
            html: userPin,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });
          L.marker([latitude, longitude], { icon: userIcon, title: 'Your Location' }).addTo(this.leafletMap);
        }

        const radiusBar = document.getElementById('map-radius-bar');
        if (radiusBar) radiusBar.style.display = 'flex';

        this.setSearchRadius(5);
        this.announceToScreenReader('Located your position and enabled 5 kilometer radius filter');
      },
      (err) => {
        console.warn('Geolocation denied or failed:', err);
        showToast('Unable to retrieve location. Using Hyderabad center.', 'info');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  async renderFacilitiesFilter() {
    try {
      const res = await API.getFacilities();
      const facilities = res.data || [];
      const container = document.getElementById('facility-filter-chips');
      if (!container) return;

      container.innerHTML = facilities
        .slice(0, 6)
        .map(
          (f) => `
            <button class="filter-chip" data-fac-id="${f.id}" onclick="window.mapController.toggleFacility(${f.id}, this)">
              ${f.name}
            </button>
          `
        )
        .join('');
    } catch {
      // Ignored
    }
  }

  toggleFacility(id, element) {
    let current = this.currentFilters.facility ? this.currentFilters.facility.split(',') : [];
    const idStr = id.toString();

    if (current.includes(idStr)) {
      current = current.filter((item) => item !== idStr);
      element.classList.remove('active');
    } else {
      current.push(idStr);
      element.classList.add('active');
    }

    this.currentFilters.facility = current.join(',');
    this.loadHostels();
  }

  resetFilters() {
    this.currentFilters = {
      type: 'ALL',
      priceRange: '',
      food: false,
      minRating: '',
      facility: '',
      search: '',
    };

    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    document.querySelectorAll('.filter-chip').forEach((c) => {
      if (c.dataset.filterType === 'ALL') {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });

    const priceSelect = document.getElementById('price-filter-select');
    if (priceSelect) priceSelect.value = '';

    this.loadHostels();
  }

  // Saved & Compare Storage helpers
  getSavedHostelIds() {
    try {
      return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.SAVED_HOSTELS) || '[]');
    } catch {
      return [];
    }
  }

  getCompareHostelIds() {
    try {
      return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.COMPARE_HOSTELS) || '[]');
    } catch {
      return [];
    }
  }

  toggleCompare(id) {
    let ids = this.getCompareHostelIds();
    if (ids.includes(id)) {
      ids = ids.filter((i) => i !== id);
      showToast('Removed from comparison', 'info');
    } else {
      if (ids.length >= 3) {
        showToast('You can compare up to 3 hostels at a time', 'error');
        return;
      }
      ids.push(id);
      showToast('Added to comparison bar', 'success');
    }
    localStorage.setItem(CONFIG.STORAGE_KEYS.COMPARE_HOSTELS, JSON.stringify(ids));
    this.renderHostelList(true);
    this.updateCompareDrawer();
  }

  updateCompareDrawer() {
    const drawer = document.getElementById('compare-drawer');
    const countSpan = document.getElementById('compare-count');
    const ids = this.getCompareHostelIds();

    if (!drawer) return;

    if (ids.length > 0) {
      drawer.classList.add('active');
      if (countSpan) countSpan.innerText = ids.length;
    } else {
      drawer.classList.remove('active');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.mapController = new HostelMapController();
  window.mapController.init();
  window.mapController.updateCompareDrawer();
});
