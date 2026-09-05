/**
 * HOSTEL MAP — API Client
 * Clean fetch wrapper for all backend endpoints
 */
const API = {
  async get(endpoint, params = {}) {
    try {
      const url = new URL(CONFIG.API_BASE + endpoint);
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          url.searchParams.append(key, params[key]);
        }
      });
      const response = await fetch(url.toString());
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message || 'Request failed');
      }
      return json;
    } catch (err) {
      console.error(`API GET [${endpoint}] Error:`, err);
      throw err;
    }
  },

  async post(endpoint, data = {}) {
    try {
      const response = await fetch(CONFIG.API_BASE + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message || 'Request failed');
      }
      return json;
    } catch (err) {
      console.error(`API POST [${endpoint}] Error:`, err);
      throw err;
    }
  },

  async patch(endpoint, data = {}) {
    try {
      const response = await fetch(CONFIG.API_BASE + endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message || 'Request failed');
      }
      return json;
    } catch (err) {
      console.error(`API PATCH [${endpoint}] Error:`, err);
      throw err;
    }
  },

  // Hostel APIs
  getHostels(params) {
    return this.get('/hostels', params);
  },

  getHostelById(id) {
    return this.get(`/hostels/${id}`);
  },

  searchHostels(query) {
    return this.get('/hostels/search', { q: query });
  },

  getNearbyHostels(latitude, longitude, radius = 15) {
    return this.get('/hostels/nearby', { latitude, longitude, radius });
  },

  getFacilities() {
    return this.get('/facilities');
  },

  // Reviews APIs
  getReviews(hostelId) {
    return this.get(`/hostels/${hostelId}/reviews`);
  },

  submitReview(hostelId, reviewData) {
    return this.post(`/hostels/${hostelId}/reviews`, reviewData);
  },

  reportReview(reviewId, reportData) {
    return this.post(`/reviews/${reviewId}/report`, reportData);
  },

  // Food APIs
  getTodayFood(hostelId) {
    return this.get(`/hostels/${hostelId}/food/today`);
  },

  updateFood(hostelId, foodData) {
    return this.post(`/hostels/${hostelId}/food`, foodData);
  },

  // Admin APIs
  adminLogin(username, password) {
    return this.post('/admin/login', { username, password });
  },

  getAdminStats() {
    return this.get('/admin/stats');
  },

  createHostel(data) {
    return this.post('/admin/hostels', data);
  },

  updateHostelStatus(id, status) {
    return this.patch(`/admin/hostels/${id}/status`, { status });
  },

  getAdminReviews(status) {
    return this.get('/admin/reviews', { status });
  },

  updateReviewStatus(id, status) {
    return this.patch(`/admin/reviews/${id}/status`, { status });
  },

  getAdminReports() {
    return this.get('/admin/reports');
  },

  updateReportStatus(id, status) {
    return this.patch(`/admin/reports/${id}/status`, { status });
  },
};

// UI Helpers (Toast notification)
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 200ms ease';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

window.API = API;
window.showToast = showToast;
