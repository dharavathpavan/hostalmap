/**
 * HOSTEL MAP — Global Configuration
 */
const CONFIG = {
  API_BASE: window.location.origin + '/api',
  DEFAULT_MAP_CENTER: { lat: 17.4435, lng: 78.3582 }, // Gachibowli, Hyderabad
  DEFAULT_ZOOM: 13,
  MAP_ID: 'DEMO_MAP_ID',
  MAP_OPTIONS: {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    gestureHandling: 'greedy',
    internalUsageAttributionIds: ['gmp_mcp_codeassist_v1_aistudio'],
  },
  STORAGE_KEYS: {
    SAVED_HOSTELS: 'hostelmap_saved_ids',
    COMPARE_HOSTELS: 'hostelmap_compare_ids',
    ADMIN_TOKEN: 'hostelmap_admin_token',
  }
};

window.CONFIG = CONFIG;
