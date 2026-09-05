/**
 * HOSTEL MAP — Admin Dashboard Controller
 * Moderation, Hostel Management, Food Publishing & Stats
 */

class AdminController {
  constructor() {
    this.isAuthenticated = false;
    this.currentTab = 'stats';
    this.hostels = [];
    this.facilities = [];
  }

  async init() {
    this.checkAuth();
    this.bindEvents();
    if (this.isAuthenticated) {
      await this.loadInitialData();
    }
  }

  checkAuth() {
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.ADMIN_TOKEN);
    const authSection = document.getElementById('admin-login-section');
    const dashboardSection = document.getElementById('admin-dashboard-section');

    if (token) {
      this.isAuthenticated = true;
      if (authSection) authSection.style.display = 'none';
      if (dashboardSection) dashboardSection.style.display = 'block';
    } else {
      this.isAuthenticated = false;
      if (authSection) authSection.style.display = 'block';
      if (dashboardSection) dashboardSection.style.display = 'none';
    }
  }

  bindEvents() {
    // Login form
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Logout button
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // Tabs switching
    document.querySelectorAll('[data-admin-tab]').forEach((tabBtn) => {
      tabBtn.addEventListener('click', () => {
        document.querySelectorAll('[data-admin-tab]').forEach((b) => b.classList.remove('active'));
        tabBtn.classList.add('active');
        this.switchTab(tabBtn.dataset.adminTab);
      });
    });

    // Add Hostel Form
    const addHostelForm = document.getElementById('admin-add-hostel-form');
    if (addHostelForm) {
      addHostelForm.addEventListener('submit', (e) => this.handleAddHostel(e));
    }

    // Food update form
    const foodForm = document.getElementById('admin-food-form');
    if (foodForm) {
      foodForm.addEventListener('submit', (e) => this.handleFoodUpdate(e));
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value.trim();
    const password = form.password.value.trim();

    try {
      const res = await API.adminLogin(username, password);
      localStorage.setItem(CONFIG.STORAGE_KEYS.ADMIN_TOKEN, res.data.token);
      showToast('Welcome, Administrator!', 'success');
      this.checkAuth();
      await this.loadInitialData();
    } catch (err) {
      showToast(err.message || 'Login failed. Try admin / admin123', 'error');
    }
  }

  handleLogout() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.ADMIN_TOKEN);
    showToast('Logged out of Admin Portal', 'info');
    this.checkAuth();
  }

  switchTab(tabName) {
    this.currentTab = tabName;
    document.querySelectorAll('.admin-tab-pane').forEach((pane) => (pane.style.display = 'none'));
    const activePane = document.getElementById(`tab-${tabName}`);
    if (activePane) activePane.style.display = 'block';

    if (tabName === 'stats') this.loadStats();
    if (tabName === 'reviews') this.loadReviews();
    if (tabName === 'reports') this.loadReports();
    if (tabName === 'hostels') this.loadHostelsTable();
  }

  async loadInitialData() {
    try {
      const [facRes, hostelRes] = await Promise.all([
        API.getFacilities(),
        API.getHostels({}),
      ]);
      this.facilities = facRes.data || [];
      this.hostels = hostelRes.data || [];
      this.populateHostelSelects();
      this.populateFacilityCheckboxes();
      this.loadStats();
    } catch (err) {
      console.error(err);
    }
  }

  populateFacilityCheckboxes() {
    const container = document.getElementById('admin-facilities-checkboxes');
    if (!container) return;

    container.innerHTML = this.facilities
      .map(
        (f) => `
        <label style="display:flex; align-items:center; gap:0.4rem; font-size:0.85rem; cursor:pointer;">
          <input type="checkbox" name="facilities" value="${f.id}" />
          <span>${f.name}</span>
        </label>
      `
      )
      .join('');
  }

  populateHostelSelects() {
    const selects = [document.getElementById('food-hostel-select')];
    selects.forEach((sel) => {
      if (!sel) return;
      sel.innerHTML = `<option value="">Select Hostel...</option>` +
        this.hostels.map((h) => `<option value="${h.id}">${h.name} (${h.area})</option>`).join('');
    });
  }

  async loadStats() {
    try {
      const res = await API.getAdminStats();
      const stats = res.data;

      document.getElementById('stat-hostels').innerText = stats.totalHostels || 0;
      document.getElementById('stat-reviews').innerText = stats.totalReviews || 0;
      document.getElementById('stat-pending-reviews').innerText = stats.pendingReviews || 0;
      document.getElementById('stat-pending-reports').innerText = stats.pendingReports || 0;
      document.getElementById('stat-food').innerText = stats.totalFoodUpdates || 0;
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }

  async loadReviews() {
    const container = document.getElementById('admin-reviews-table-body');
    if (!container) return;

    container.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem;"><div class="spinner" style="margin:0 auto;"></div></td></tr>`;

    try {
      const res = await API.getAdminReviews();
      const reviews = res.data || [];

      if (reviews.length === 0) {
        container.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">No reviews submitted yet.</td></tr>`;
        return;
      }

      container.innerHTML = reviews
        .map(
          (r) => `
        <tr>
          <td>#${r.id}</td>
          <td><strong>${r.hostelName}</strong></td>
          <td>★ ${(r.weightedScore || 4.0).toFixed(1)}</td>
          <td style="max-width:280px; font-size:0.85rem; color:var(--text-secondary);">${r.comment || '—'}</td>
          <td>
            <span class="badge" style="padding:0.2rem 0.5rem; border-radius:9999px; font-size:0.75rem; font-weight:700; ${
              r.status === 'APPROVED' ? 'background:#ecfdf5; color:#047857;' : r.status === 'REJECTED' ? 'background:#fef2f2; color:#b91c1c;' : 'background:#fffbeb; color:#b45309;'
            }">${r.status}</span>
          </td>
          <td style="font-size:0.75rem; color:var(--text-muted);">${new Date(r.createdAt).toLocaleDateString()}</td>
          <td>
            <div style="display:flex; gap:0.35rem;">
              <button class="btn btn-sm btn-primary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="window.adminController.updateReviewStatus(${r.id}, 'APPROVED')">
                ✓ Approve
              </button>
              <button class="btn btn-sm btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem; color:#b91c1c;" onclick="window.adminController.updateReviewStatus(${r.id}, 'REJECTED')">
                ✕ Reject
              </button>
            </div>
          </td>
        </tr>
      `
        )
        .join('');
    } catch (err) {
      container.innerHTML = `<tr><td colspan="7" style="color:red; text-align:center; padding:1rem;">${err.message}</td></tr>`;
    }
  }

  async updateReviewStatus(id, status) {
    try {
      await API.updateReviewStatus(id, status);
      showToast(`Review #${id} marked as ${status}`, 'success');
      this.loadReviews();
      this.loadStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async loadReports() {
    const container = document.getElementById('admin-reports-table-body');
    if (!container) return;

    container.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem;"><div class="spinner" style="margin:0 auto;"></div></td></tr>`;

    try {
      const res = await API.getAdminReports();
      const reports = res.data || [];

      if (reports.length === 0) {
        container.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">Zero active flagged review reports. Community is clean!</td></tr>`;
        return;
      }

      container.innerHTML = reports
        .map(
          (rep) => `
        <tr>
          <td>#${rep.id}</td>
          <td>Review #${rep.reviewId} (${rep.hostelName})</td>
          <td style="color:#b91c1c; font-weight:600;">${rep.reason}</td>
          <td style="font-size:0.85rem; color:var(--text-secondary);">"${rep.reviewComment}"</td>
          <td><span class="badge" style="background:#fffbeb; color:#b45309; padding:0.2rem 0.5rem; border-radius:9999px; font-size:0.75rem;">${rep.status}</span></td>
          <td>
            <div style="display:flex; gap:0.35rem;">
              <button class="btn btn-sm btn-primary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="window.adminController.updateReportStatus(${rep.id}, 'RESOLVED')">
                Resolve
              </button>
              <button class="btn btn-sm btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="window.adminController.updateReportStatus(${rep.id}, 'DISMISSED')">
                Dismiss
              </button>
            </div>
          </td>
        </tr>
      `
        )
        .join('');
    } catch (err) {
      container.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;">${err.message}</td></tr>`;
    }
  }

  async updateReportStatus(id, status) {
    try {
      await API.updateReportStatus(id, status);
      showToast(`Report #${id} marked as ${status}`, 'success');
      this.loadReports();
      this.loadStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async loadHostelsTable() {
    const container = document.getElementById('admin-hostels-table-body');
    if (!container) return;

    try {
      const res = await API.getHostels({});
      this.hostels = res.data || [];

      container.innerHTML = this.hostels
        .map(
          (h) => `
        <tr>
          <td>#${h.id}</td>
          <td><strong>${h.name}</strong></td>
          <td>${h.hostelType}</td>
          <td>${h.area}, ${h.city}</td>
          <td>₹${h.monthlyRent.toLocaleString('en-IN')}</td>
          <td>★ ${h.rating.toFixed(1)} (${h.reviewCount})</td>
          <td>
            <span style="font-size:0.75rem; font-weight:700; padding:0.2rem 0.5rem; border-radius:9999px; ${
              h.status === 'ACTIVE' ? 'background:#ecfdf5; color:#047857;' : 'background:#fef2f2; color:#b91c1c;'
            }">${h.status}</span>
          </td>
          <td>
            <button class="btn btn-sm btn-secondary" style="font-size:0.75rem;" onclick="window.adminController.toggleHostelStatus(${h.id}, '${h.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'}')">
              ${h.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            </button>
          </td>
        </tr>
      `
        )
        .join('');
    } catch (err) {
      console.error(err);
    }
  }

  async toggleHostelStatus(id, nextStatus) {
    try {
      await API.updateHostelStatus(id, nextStatus);
      showToast(`Hostel status changed to ${nextStatus}`, 'success');
      this.loadHostelsTable();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async handleAddHostel(e) {
    e.preventDefault();
    const form = e.target;

    const checkedFacs = Array.from(form.querySelectorAll('input[name="facilities"]:checked')).map((c) =>
      parseInt(c.value)
    );

    const payload = {
      name: form.name.value.trim(),
      description: form.description.value.trim(),
      address: form.address.value.trim(),
      area: form.area.value.trim(),
      city: form.city.value.trim(),
      state: 'Telangana',
      pincode: form.pincode.value.trim() || '500032',
      latitude: parseFloat(form.latitude.value),
      longitude: parseFloat(form.longitude.value),
      hostelType: form.hostelType.value,
      monthlyRent: parseFloat(form.monthlyRent.value),
      deposit: parseFloat(form.deposit.value || 0),
      foodAvailable: form.foodAvailable.checked,
      verified: form.verified.checked,
      facilityIds: checkedFacs,
    };

    try {
      await API.createHostel(payload);
      showToast('Hostel created and listed successfully!', 'success');
      form.reset();
      await this.loadInitialData();
      this.loadHostelsTable();
    } catch (err) {
      showToast(err.message || 'Failed to add hostel', 'error');
    }
  }

  async handleFoodUpdate(e) {
    e.preventDefault();
    const form = e.target;
    const hostelId = form.hostelId.value;

    if (!hostelId) {
      showToast('Please select a hostel', 'error');
      return;
    }

    const payload = {
      foodDate: form.foodDate.value || new Date().toISOString().split('T')[0],
      breakfast: form.breakfast.value.trim(),
      lunch: form.lunch.value.trim(),
      dinner: form.dinner.value.trim(),
      imageUrl: form.imageUrl ? form.imageUrl.value.trim() : undefined,
    };

    try {
      await API.updateFood(hostelId, payload);
      showToast("Daily food menu published for today's students!", 'success');
      form.reset();
      this.loadStats();
    } catch (err) {
      showToast(err.message || 'Failed to publish food update', 'error');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.adminController = new AdminController();
  window.adminController.init();
});
