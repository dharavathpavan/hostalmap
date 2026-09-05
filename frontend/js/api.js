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

  async put(endpoint, data = {}) {
    try {
      const response = await fetch(CONFIG.API_BASE + endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message || 'Request failed');
      }
      return json;
    } catch (err) {
      console.error(`API PUT [${endpoint}] Error:`, err);
      throw err;
    }
  },

  async delete(endpoint) {
    try {
      const response = await fetch(CONFIG.API_BASE + endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message || 'Request failed');
      }
      return json;
    } catch (err) {
      console.error(`API DELETE [${endpoint}] Error:`, err);
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

  getHostelRooms(id) {
    return this.get(`/hostels/${id}/rooms`);
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

  // Warden APIs
  wardenLogin(username, password, hostelId) {
    return this.post('/warden/login', { username, password, hostelId });
  },

  getWardenHostels() {
    return this.get('/warden/hostels');
  },

  getWardenDashboard(hostelId) {
    return this.get(`/warden/hostels/${hostelId}/dashboard`);
  },

  getWardenProfile(hostelId) {
    return this.get(`/warden/hostels/${hostelId}/profile`);
  },

  updateWardenProfile(hostelId, data) {
    return this.put(`/warden/hostels/${hostelId}/profile`, data);
  },

  getWardenFood(hostelId, date) {
    return this.get(`/warden/hostels/${hostelId}/food`, { date });
  },

  updateWardenFood(hostelId, data) {
    return this.post(`/warden/hostels/${hostelId}/food`, data);
  },

  getWardenRooms(hostelId) {
    return this.get(`/warden/hostels/${hostelId}/rooms`);
  },

  createWardenRoom(hostelId, data) {
    return this.post(`/warden/hostels/${hostelId}/rooms`, data);
  },

  updateWardenRoom(hostelId, roomId, data) {
    return this.put(`/warden/hostels/${hostelId}/rooms/${roomId}`, data);
  },

  deleteWardenRoom(hostelId, roomId) {
    return this.delete(`/warden/hostels/${hostelId}/rooms/${roomId}`);
  },

  getWardenStudents(hostelId, params = {}) {
    return this.get(`/warden/hostels/${hostelId}/students`, params);
  },

  createWardenStudent(hostelId, data) {
    return this.post(`/warden/hostels/${hostelId}/students`, data);
  },

  updateWardenStudent(hostelId, studentId, data) {
    return this.put(`/warden/hostels/${hostelId}/students/${studentId}`, data);
  },

  deleteWardenStudent(hostelId, studentId) {
    return this.delete(`/warden/hostels/${hostelId}/students/${studentId}`);
  },

  resetStudentPasscode(hostelId, studentId) {
    return this.post(`/warden/hostels/${hostelId}/students/${studentId}/reset-passcode`);
  },

  getWardenFeedbacks(hostelId, params = {}) {
    return this.get(`/warden/hostels/${hostelId}/feedbacks`, params);
  },

  updateFeedbackResponse(feedbackId, data) {
    return this.patch(`/warden/feedbacks/${feedbackId}`, data);
  },

  submitStudentFeedback(data) {
    return this.post('/feedback/submit', data);
  },

  getWardenFees(hostelId) {
    return this.get(`/warden/hostels/${hostelId}/fees`);
  },

  recordWardenPayment(hostelId, data) {
    return this.post(`/warden/hostels/${hostelId}/fees/record`, data);
  },

  getWardenNotices(hostelId) {
    return this.get(`/warden/hostels/${hostelId}/notices`);
  },

  createWardenNotice(hostelId, data) {
    return this.post(`/warden/hostels/${hostelId}/notices`, data);
  },

  deleteWardenNotice(hostelId, noticeId) {
    return this.delete(`/warden/hostels/${hostelId}/notices/${noticeId}`);
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
