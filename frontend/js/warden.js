/**
 * WARDEN PORTAL CONTROLLER
 * Full management system for hostel profile, food announcements,
 * student admissions, logins, QR feedback, room inventory, and fee reminders.
 */

class WardenController {
  constructor() {
    this.currentHostelId = parseInt(localStorage.getItem('warden_hostel_id')) || 1;
    this.currentTab = 'overview';
    this.hostels = [];
    this.hostelData = null;
    this.rooms = [];
    this.students = [];
    this.feedbacks = [];
    this.payments = [];
    this.notices = [];
    this.todayFood = null;
    this.activeFilterRoom = 'ALL';
  }

  async init() {
    this.checkAuth();
    await this.loadHostelsList();
    this.setupEventListeners();
    await this.loadAllHostelData();
  }

  checkAuth() {
    const token = localStorage.getItem('warden_token');
    const modal = document.getElementById('modal-warden-login');
    if (!token) {
      if (modal) modal.style.display = 'flex';
    } else {
      if (modal) modal.style.display = 'none';
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value.trim();
    const password = form.password.value.trim();

    try {
      const res = await API.wardenLogin(username, password, this.currentHostelId);
      if (res.success) {
        localStorage.setItem('warden_token', res.data.token || 'warden_logged_in');
        localStorage.setItem('warden_user', res.data.username || 'warden');
        showToast('Welcome to Warden Portal', 'success');
        document.getElementById('modal-warden-login').style.display = 'none';
        this.loadAllHostelData();
      }
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
    }
  }

  logout() {
    localStorage.removeItem('warden_token');
    localStorage.removeItem('warden_user');
    showToast('Signed out from warden desk', 'info');
    document.getElementById('modal-warden-login').style.display = 'flex';
  }

  setupEventListeners() {
    // Escape key closes open modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal-backdrop');
        modals.forEach((m) => {
          if (m.id !== 'modal-warden-login') m.style.display = 'none';
        });
      }
    });
  }

  async loadHostelsList() {
    try {
      const res = await API.getWardenHostels();
      this.hostels = res.data || [];
      const select = document.getElementById('warden-hostel-select');
      if (select && this.hostels.length > 0) {
        select.innerHTML = this.hostels
          .map((h) => `<option value="${h.id}" ${h.id === this.currentHostelId ? 'selected' : ''}>${h.name} (${h.area})</option>`)
          .join('');
      }
    } catch (err) {
      console.error('Failed to load hostels list:', err);
    }
  }

  async onHostelChange(hostelId) {
    this.currentHostelId = parseInt(hostelId);
    localStorage.setItem('warden_hostel_id', this.currentHostelId);
    
    // Update public link
    const pubLink = document.getElementById('nav-public-page');
    if (pubLink) pubLink.href = `/hostel.html?id=${this.currentHostelId}`;

    showToast('Switched managed hostel', 'info');
    await this.loadAllHostelData();
  }

  async loadAllHostelData() {
    try {
      await Promise.all([
        this.loadDashboard(),
        this.loadProfile(),
        this.loadFood(),
        this.loadRooms(),
        this.loadStudents(),
        this.loadFeedbacks(),
        this.loadFees(),
        this.loadNotices(),
      ]);
    } catch (err) {
      console.error('Error loading hostel data:', err);
    }
  }

  switchTab(tabName) {
    this.currentTab = tabName;

    // Update tab button styles
    const tabBtns = document.querySelectorAll('.warden-tab-btn');
    tabBtns.forEach((btn) => {
      if (btn.getAttribute('data-tab') === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update panel visibility
    const panels = document.querySelectorAll('.warden-panel');
    panels.forEach((p) => {
      if (p.id === `panel-${tabName}`) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });

    // Refresh tab-specific views if needed
    if (tabName === 'feedback') {
      this.renderQRPoster();
    }
  }

  // =========================================================
  // 1. DASHBOARD & OVERVIEW
  // =========================================================
  async loadDashboard() {
    try {
      const res = await API.getWardenDashboard(this.currentHostelId);
      if (!res.success) return;

      const { hostel, stats, todayFood, recentFeedbacks } = res.data;
      this.hostelData = hostel;

      // Update Header & Public link
      const pubLink = document.getElementById('nav-public-page');
      if (pubLink) pubLink.href = `/hostel.html?id=${hostel.id}`;

      // Update KPI numbers
      document.getElementById('stat-occupancy-rate').textContent = `${stats.occupancyRate}%`;
      document.getElementById('stat-occupancy-desc').textContent = `${stats.occupiedBeds} of ${stats.totalBeds} beds occupied`;
      document.getElementById('stat-occupancy-bar').style.width = `${stats.occupancyRate}%`;

      document.getElementById('stat-vacant-beds').textContent = stats.availableBeds;
      document.getElementById('stat-rooms-count').textContent = `Across ${stats.totalRooms} total rooms`;

      document.getElementById('stat-active-students').textContent = stats.totalStudents;
      document.getElementById('stat-pending-fees').textContent = `₹${stats.totalPendingFees.toLocaleString('en-IN')}`;
      document.getElementById('stat-pending-count').textContent = `${stats.pendingCount + stats.overdueCount} pending/overdue reminders`;

      // Update Nav Badges
      const vacantBadge = document.getElementById('badge-vacant-beds');
      if (vacantBadge) vacantBadge.textContent = `${stats.availableBeds} vacant`;

      const stuBadge = document.getElementById('badge-total-students');
      if (stuBadge) stuBadge.textContent = stats.totalStudents;

      const feeBadge = document.getElementById('badge-pending-fees');
      if (feeBadge) feeBadge.textContent = `₹${stats.totalPendingFees.toLocaleString('en-IN')}`;

      const feedBadge = document.getElementById('badge-open-feedback');
      if (feedBadge) feedBadge.textContent = `${stats.openFeedbacksCount} open`;

      // Food Banner in Overview
      const foodBanner = document.getElementById('overview-today-food-banner');
      if (todayFood && (todayFood.announcement || todayFood.specialDish)) {
        foodBanner.style.display = 'block';
        document.getElementById('banner-food-title').textContent = todayFood.specialDish || "Today's Special Feast";
        document.getElementById('banner-food-announcement').textContent = todayFood.announcement || `Lunch: ${todayFood.lunch} | Dinner: ${todayFood.dinner}`;
      } else {
        foodBanner.style.display = 'none';
      }

      // Recent Feedbacks Preview
      this.renderOverviewRecentFeedbacks(recentFeedbacks || []);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  }

  renderOverviewRecentFeedbacks(list) {
    const container = document.getElementById('overview-recent-feedbacks-list');
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem; text-align:center; padding:1rem;">No recent feedback received yet.</p>`;
      return;
    }

    container.innerHTML = list
      .map(
        (f) => `
      <div style="background:#fafafa; border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:0.75rem 1rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
          <span style="font-size:0.75rem; font-weight:800; color:var(--color-primary);">${f.category}</span>
          <span style="font-size:0.8rem; color:#f59e0b; font-weight:700;">★ ${f.rating}</span>
        </div>
        <p style="font-size:0.82rem; color:var(--text-primary); margin:0 0 0.35rem; line-height:1.35;">
          "${f.message}"
        </p>
        <div style="display:flex; justify-content:space-between; font-size:0.72rem; color:var(--text-muted);">
          <span>${f.studentName || 'Anonymous'} ${f.roomNo ? '(Room ' + f.roomNo + ')' : ''}</span>
          <span class="status-pill ${f.status === 'RESOLVED' ? 'paid' : f.status === 'IN_PROGRESS' ? 'pending' : 'overdue'}" style="font-size:0.65rem;">
            ${f.status}
          </span>
        </div>
      </div>
    `
      )
      .join('');
  }

  // =========================================================
  // 2. HOSTEL PROFILE
  // =========================================================
  async loadProfile() {
    try {
      const res = await API.getWardenProfile(this.currentHostelId);
      if (!res.success) return;
      const h = res.data;

      const form = document.getElementById('form-hostel-profile');
      if (!form) return;

      form.name.value = h.name || '';
      form.hostelType.value = h.hostelType || 'BOYS';
      form.wardenName.value = h.wardenName || '';
      form.wardenPhone.value = h.wardenPhone || '';
      form.wardenEmail.value = h.wardenEmail || '';
      form.gateClosingTime.value = h.gateClosingTime || '10:30 PM';
      form.monthlyRent.value = h.monthlyRent || 8500;
      form.deposit.value = h.deposit || 4000;
      form.upiId.value = h.upiId || '';
      form.area.value = h.area || '';
      form.city.value = h.city || '';
      form.pincode.value = h.pincode || '';
      form.address.value = h.address || '';
      form.description.value = h.description || '';
      form.rules.value = Array.isArray(h.rules) ? h.rules.join('\n') : '';

      // Update warden user badge in top nav
      const badge = document.getElementById('warden-user-badge');
      if (badge && h.wardenName) {
        badge.textContent = `${h.wardenName} (${h.name.split(' ')[0]})`;
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  }

  async handleSaveProfile(e) {
    e.preventDefault();
    const form = e.target;

    const rules = form.rules.value
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const payload = {
      name: form.name.value.trim(),
      hostelType: form.hostelType.value,
      wardenName: form.wardenName.value.trim(),
      wardenPhone: form.wardenPhone.value.trim(),
      wardenEmail: form.wardenEmail.value.trim(),
      gateClosingTime: form.gateClosingTime.value.trim(),
      monthlyRent: parseFloat(form.monthlyRent.value),
      deposit: parseFloat(form.deposit.value || 0),
      upiId: form.upiId.value.trim(),
      area: form.area.value.trim(),
      city: form.city.value.trim(),
      pincode: form.pincode.value.trim(),
      address: form.address.value.trim(),
      description: form.description.value.trim(),
      rules,
    };

    try {
      await API.updateWardenProfile(this.currentHostelId, payload);
      showToast('Hostel profile and warden details updated successfully!', 'success');
      this.loadDashboard();
      this.loadHostelsList();
    } catch (err) {
      showToast(err.message || 'Failed to save profile', 'error');
    }
  }

  // =========================================================
  // 3. FOOD ANNOUNCEMENTS & MESS MENU
  // =========================================================
  async loadFood(dateStr) {
    const date = dateStr || new Date().toISOString().split('T')[0];
    const datePicker = document.getElementById('food-date-picker');
    if (datePicker && !dateStr) datePicker.value = date;

    try {
      const res = await API.getWardenFood(this.currentHostelId, date);
      if (!res.success) return;
      const food = res.data;
      this.todayFood = food;

      const form = document.getElementById('form-food-menu');
      if (form) {
        form.announcement.value = food.announcement || '';
        form.specialDish.value = food.specialDish || '';
        form.imageUrl.value = food.imageUrl || '';
        form.breakfast.value = food.breakfast || '';
        form.lunch.value = food.lunch || '';
        form.snacks.value = food.snacks || '';
        form.dinner.value = food.dinner || '';
        form.breakfastTiming.value = food.breakfastTiming || '7:30 AM – 9:30 AM';
        form.lunchTiming.value = food.lunchTiming || '12:30 PM – 2:30 PM';
        form.dinnerTiming.value = food.dinnerTiming || '7:30 PM – 10:00 PM';
      }

      this.updateStudentFoodPreview(food);
    } catch (err) {
      console.error('Error loading food:', err);
    }
  }

  loadFoodForDate(date) {
    this.loadFood(date);
  }

  updateStudentFoodPreview(food) {
    const hName = document.getElementById('prev-food-hostel-name');
    if (hName && this.hostelData) hName.textContent = this.hostelData.name;

    const specialTag = document.getElementById('prev-special-tag');
    if (specialTag) {
      if (food.specialDish) {
        specialTag.style.display = 'inline-block';
        specialTag.textContent = `★ SPECIAL: ${food.specialDish.toUpperCase()}`;
      } else {
        specialTag.style.display = 'none';
      }
    }

    const annText = document.getElementById('prev-announcement-text');
    if (annText) {
      annText.textContent = food.announcement || 'Standard hostel meal menu active today.';
    }

    const bf = document.getElementById('prev-bf');
    const lu = document.getElementById('prev-lu');
    const di = document.getElementById('prev-di');
    if (bf) bf.textContent = food.breakfast || 'Not updated';
    if (lu) lu.textContent = food.lunch || 'Not updated';
    if (di) di.textContent = food.dinner || 'Not updated';
  }

  async handleSaveFood(e) {
    e.preventDefault();
    const form = e.target;
    const datePicker = document.getElementById('food-date-picker');
    const date = datePicker ? datePicker.value : new Date().toISOString().split('T')[0];

    const payload = {
      foodDate: date,
      announcement: form.announcement.value.trim(),
      specialDish: form.specialDish.value.trim(),
      imageUrl: form.imageUrl.value.trim(),
      breakfast: form.breakfast.value.trim(),
      lunch: form.lunch.value.trim(),
      snacks: form.snacks.value.trim(),
      dinner: form.dinner.value.trim(),
      breakfastTiming: form.breakfastTiming.value.trim(),
      lunchTiming: form.lunchTiming.value.trim(),
      dinnerTiming: form.dinnerTiming.value.trim(),
    };

    try {
      const res = await API.updateWardenFood(this.currentHostelId, payload);
      showToast('Daily food announcement broadcasted to students!', 'success');
      this.todayFood = res.data;
      this.updateStudentFoodPreview(res.data);
      this.loadDashboard();
      this.loadNotices();
    } catch (err) {
      showToast(err.message || 'Failed to update food menu', 'error');
    }
  }

  // =========================================================
  // 4. ROOMS & BED OCCUPANCY
  // =========================================================
  async loadRooms() {
    try {
      const res = await API.getWardenRooms(this.currentHostelId);
      if (!res.success) return;
      this.rooms = res.data || [];
      this.renderRooms();
      this.renderOverviewAvailableRooms();
    } catch (err) {
      console.error('Error loading rooms:', err);
    }
  }

  filterRooms(status) {
    this.activeFilterRoom = status;
    const buttons = ['btn-filter-room-all', 'btn-filter-room-vacant', 'btn-filter-room-full'];
    buttons.forEach((id) => {
      const b = document.getElementById(id);
      if (b) b.classList.remove('active');
    });

    if (status === 'ALL') document.getElementById('btn-filter-room-all')?.classList.add('active');
    if (status === 'AVAILABLE') document.getElementById('btn-filter-room-vacant')?.classList.add('active');
    if (status === 'FULL') document.getElementById('btn-filter-room-full')?.classList.add('active');

    this.renderRooms();
  }

  renderRooms() {
    const container = document.getElementById('rooms-grid-container');
    if (!container) return;

    let list = this.rooms;
    if (this.activeFilterRoom === 'AVAILABLE') {
      list = list.filter((r) => r.vacantBeds > 0 && r.status !== 'MAINTENANCE');
    } else if (this.activeFilterRoom === 'FULL') {
      list = list.filter((r) => r.vacantBeds === 0 && r.status !== 'MAINTENANCE');
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:3rem 1rem; color:var(--text-muted);">
          <div style="font-size:2rem; margin-bottom:0.5rem;">🚪</div>
          <div style="font-weight:700;">No rooms match this filter</div>
          <button class="btn btn-sm btn-secondary" style="margin-top:0.75rem;" onclick="window.wardenController.filterRooms('ALL')">Show All Rooms</button>
        </div>
      `;
      return;
    }

    container.innerHTML = list
      .map((room) => {
        // Build bed slots
        let bedSlotsHtml = '';
        const occupants = room.occupants || [];

        for (let i = 0; i < room.totalBeds; i++) {
          const occ = occupants[i];
          if (occ) {
            bedSlotsHtml += `
              <div class="bed-slot occupied" title="Occupant: ${occ.name} (${occ.phone})">
                <span>🛏️</span>
                <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                  <div>${occ.name.split(' ')[0]}</div>
                  <div style="font-size:0.65rem; opacity:0.8;">Bed ${i + 1}</div>
                </div>
              </div>
            `;
          } else if (room.status === 'MAINTENANCE') {
            bedSlotsHtml += `
              <div class="bed-slot maintenance">
                <span>🔧</span>
                <div>Maintenance</div>
              </div>
            `;
          } else {
            bedSlotsHtml += `
              <div class="bed-slot vacant" onclick="window.wardenController.openAddStudentForRoom('${room.roomNo}', 'Bed ${i + 1}')" title="Click to assign new student">
                <span>➕</span>
                <div>Vacant Bed ${i + 1}</div>
              </div>
            `;
          }
        }

        const isAvailable = room.vacantBeds > 0 && room.status !== 'MAINTENANCE';

        return `
        <div class="room-card" id="room-card-${room.id}">
          <div>
            <div class="room-card-header">
              <div class="room-number-badge">
                <span>🚪</span>
                <span>Room ${room.roomNo}</span>
              </div>
              <span class="status-pill ${room.status === 'MAINTENANCE' ? 'overdue' : isAvailable ? 'available' : 'full'}">
                ${room.status === 'MAINTENANCE' ? 'Maintenance' : isAvailable ? `${room.vacantBeds} Vacant` : 'Full'}
              </span>
            </div>

            <div style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:0.6rem; display:flex; gap:0.75rem; flex-wrap:wrap;">
              <span>Floor ${room.floor}</span>
              <span>•</span>
              <span>${room.sharingType}</span>
              <span>•</span>
              <span>₹${room.monthlyRent.toLocaleString('en-IN')}/mo</span>
              ${room.hasAC ? '<span>• ❄️ AC</span>' : ''}
              ${room.hasAttachedWashroom ? '<span>• 🚿 Bath</span>' : ''}
            </div>

            <!-- Bed slots visual grid -->
            <div class="bed-slots-grid">
              ${bedSlotsHtml}
            </div>

            ${room.notes ? `<div style="font-size:0.75rem; color:var(--text-muted); font-style:italic; margin-bottom:0.75rem;">"${room.notes}"</div>` : ''}
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; padding-top:0.75rem; border-top:1px solid var(--border-subtle); margin-top:0.5rem;">
            <div style="font-size:0.75rem; color:var(--text-muted);">
              ${room.occupiedBeds} of ${room.totalBeds} occupied
            </div>
            <div style="display:flex; gap:0.35rem;">
              <button class="btn btn-sm btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.72rem;" onclick="window.wardenController.openEditRoomModal(${room.id})">
                Edit
              </button>
              <button class="btn btn-sm btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.72rem; color:#b91c1c;" onclick="window.wardenController.deleteRoom(${room.id}, '${room.roomNo}')">
                Delete
              </button>
            </div>
          </div>
        </div>
      `;
      })
      .join('');
  }

  renderOverviewAvailableRooms() {
    const container = document.getElementById('overview-available-rooms-list');
    if (!container) return;

    const available = this.rooms.filter((r) => r.vacantBeds > 0 && r.status !== 'MAINTENANCE');
    if (available.length === 0) {
      container.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem; text-align:center; padding:1rem;">Hostel is 100% full! No vacant beds available.</p>`;
      return;
    }

    container.innerHTML = available
      .slice(0, 5)
      .map(
        (r) => `
      <div style="display:flex; align-items:center; justify-content:space-between; padding:0.65rem 0.85rem; background:#fafafa; border:1px solid var(--border-subtle); border-radius:var(--radius-md);">
        <div>
          <strong style="font-size:0.9rem; color:var(--text-primary);">Room ${r.roomNo}</strong>
          <div style="font-size:0.75rem; color:var(--text-muted);">
            Floor ${r.floor} • ${r.sharingType} ${r.hasAC ? '• AC' : ''} • ₹${r.monthlyRent.toLocaleString('en-IN')}/mo
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span class="status-pill available">${r.vacantBeds} Bed${r.vacantBeds > 1 ? 's' : ''} Free</span>
          <button class="btn btn-sm btn-primary" style="padding:0.25rem 0.6rem; font-size:0.72rem;" onclick="window.wardenController.openAddStudentForRoom('${r.roomNo}', 'Bed 1')">
            + Admit
          </button>
        </div>
      </div>
    `
      )
      .join('');
  }

  openAddRoomModal() {
    const form = document.getElementById('form-add-room');
    if (form) form.reset();
    document.getElementById('room-edit-id').value = '';
    document.getElementById('modal-room-title').textContent = '🛏️ Add New Room';
    document.getElementById('modal-room').style.display = 'flex';
  }

  openEditRoomModal(roomId) {
    const room = this.rooms.find((r) => r.id === roomId);
    if (!room) return;

    const form = document.getElementById('form-add-room');
    if (!form) return;

    document.getElementById('room-edit-id').value = room.id;
    document.getElementById('modal-room-title').textContent = `🛏️ Edit Room ${room.roomNo}`;
    form.roomNo.value = room.roomNo;
    form.floor.value = room.floor;
    form.sharingType.value = room.sharingType;
    form.totalBeds.value = room.totalBeds;
    form.monthlyRent.value = room.monthlyRent;
    form.status.value = room.status;
    form.hasAC.checked = room.hasAC;
    form.hasAttachedWashroom.checked = room.hasAttachedWashroom;
    form.notes.value = room.notes || '';

    document.getElementById('modal-room').style.display = 'flex';
  }

  onSharingTypeChange(type) {
    const bedsInput = document.getElementById('rm-beds');
    if (!bedsInput) return;
    if (type === 'Single') bedsInput.value = 1;
    else if (type === '2-Share') bedsInput.value = 2;
    else if (type === '3-Share') bedsInput.value = 3;
    else if (type === '4-Share') bedsInput.value = 4;
  }

  async handleRoomSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const editId = document.getElementById('room-edit-id').value;

    const payload = {
      roomNo: form.roomNo.value.trim(),
      floor: parseInt(form.floor.value),
      sharingType: form.sharingType.value,
      totalBeds: parseInt(form.totalBeds.value),
      monthlyRent: parseFloat(form.monthlyRent.value),
      status: form.status.value,
      hasAC: form.hasAC.checked,
      hasAttachedWashroom: form.hasAttachedWashroom.checked,
      notes: form.notes.value.trim(),
    };

    try {
      if (editId) {
        await API.updateWardenRoom(this.currentHostelId, editId, payload);
        showToast(`Room ${payload.roomNo} updated`, 'success');
      } else {
        await API.createWardenRoom(this.currentHostelId, payload);
        showToast(`Room ${payload.roomNo} created successfully!`, 'success');
      }
      this.closeModal('modal-room');
      await this.loadRooms();
      this.loadDashboard();
    } catch (err) {
      showToast(err.message || 'Failed to save room', 'error');
    }
  }

  async deleteRoom(roomId, roomNo) {
    if (!confirm(`Are you sure you want to delete Room ${roomNo}?`)) return;

    try {
      await API.deleteWardenRoom(this.currentHostelId, roomId);
      showToast(`Room ${roomNo} deleted`, 'success');
      await this.loadRooms();
      this.loadDashboard();
    } catch (err) {
      showToast(err.message || 'Cannot delete room', 'error');
    }
  }

  // =========================================================
  // 5. STUDENTS DIRECTORY & LOGINS
  // =========================================================
  async loadStudents() {
    try {
      const res = await API.getWardenStudents(this.currentHostelId);
      if (!res.success) return;
      this.students = res.data || [];
      this.renderStudents();
    } catch (err) {
      console.error('Error loading students:', err);
    }
  }

  filterStudents() {
    this.renderStudents();
  }

  renderStudents() {
    const tbody = document.getElementById('students-table-body');
    if (!tbody) return;

    const query = (document.getElementById('student-search-input')?.value || '').toLowerCase().trim();
    const feeFilter = document.getElementById('student-fee-filter')?.value || '';

    let list = this.students;
    if (feeFilter) {
      list = list.filter((s) => s.feeStatus === feeFilter);
    }
    if (query) {
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.rollNo.toLowerCase().includes(query) ||
          s.phone.includes(query) ||
          s.roomNo.toLowerCase().includes(query) ||
          s.loginUsername.toLowerCase().includes(query)
      );
    }

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:2rem; color:var(--text-muted);">No students found</td></tr>`;
      return;
    }

    tbody.innerHTML = list
      .map(
        (s) => `
      <tr id="student-row-${s.id}">
        <td>
          <div style="font-weight:800; color:var(--text-primary); font-size:0.92rem;">${s.name}</div>
          <div style="font-size:0.75rem; color:var(--text-muted); font-family:monospace;">${s.rollNo}</div>
        </td>
        <td>
          <strong>Room ${s.roomNo}</strong>
          <div style="font-size:0.75rem; color:var(--text-muted);">${s.bedNumber} • ${s.sharingType}</div>
        </td>
        <td>
          <div>${s.phone}</div>
          ${s.email ? `<div style="font-size:0.75rem; color:var(--text-muted);">${s.email}</div>` : ''}
        </td>
        <td>
          <div style="font-size:0.85rem;">${s.guardianName || '—'}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${s.guardianPhone || ''}</div>
        </td>
        <td>
          <strong>₹${s.monthlyFee.toLocaleString('en-IN')}</strong>
          <div style="font-size:0.72rem; color:var(--text-muted);">Due: ${s.dueDate}</div>
        </td>
        <td>
          <span class="status-pill ${s.feeStatus === 'PAID' ? 'paid' : s.feeStatus === 'PENDING' ? 'pending' : 'overdue'}">
            ${s.feeStatus}
          </span>
        </td>
        <td>
          <div style="display:flex; align-items:center; gap:0.4rem;">
            <span class="credential-pill" title="Student login username">${s.loginUsername}</span>
            <button class="btn btn-sm btn-secondary" style="padding:0.15rem 0.4rem; font-size:0.68rem;" onclick="window.wardenController.showStudentLoginSlip(${s.id})" title="View passcode slip">
              🔑 Slip
            </button>
          </div>
        </td>
        <td>
          <div style="display:flex; gap:0.35rem; align-items:center;">
            ${
              s.feeStatus !== 'PAID'
                ? `<button class="btn btn-sm btn-primary" style="padding:0.25rem 0.5rem; font-size:0.72rem; background:#047857;" onclick="window.wardenController.openRecordFeeModal(${s.id})" title="Record Payment">
                    Pay
                   </button>`
                : ''
            }
            <button class="btn btn-sm btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.72rem;" onclick="window.wardenController.openEditStudentModal(${s.id})">
              Edit
            </button>
            <button class="btn btn-sm btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.72rem; color:#b91c1c;" onclick="window.wardenController.checkoutStudent(${s.id}, '${s.name}', '${s.roomNo}')" title="Check out student">
              Checkout
            </button>
          </div>
        </td>
      </tr>
    `
      )
      .join('');
  }

  openAddStudentModal() {
    this.populateRoomSelectForStudent();
    const form = document.getElementById('form-add-student');
    if (form) form.reset();
    document.getElementById('student-edit-id').value = '';
    document.getElementById('modal-student-title').textContent = '👤 Add New Student';

    if (this.hostelData) {
      document.getElementById('stu-fee').value = this.hostelData.monthlyRent || 8500;
    }

    document.getElementById('modal-student').style.display = 'flex';
  }

  openAddStudentForRoom(roomNo, bedNumber) {
    this.openAddStudentModal();
    const roomSelect = document.getElementById('stu-room');
    if (roomSelect) roomSelect.value = roomNo;

    const bedSelect = document.getElementById('stu-bed');
    if (bedSelect && bedNumber) bedSelect.value = bedNumber;

    this.onStudentRoomSelected(roomNo);
  }

  populateRoomSelectForStudent(selectedRoom) {
    const select = document.getElementById('stu-room');
    if (!select) return;

    select.innerHTML = this.rooms
      .filter((r) => r.status !== 'MAINTENANCE')
      .map(
        (r) =>
          `<option value="${r.roomNo}" ${r.roomNo === selectedRoom ? 'selected' : ''}>
            Room ${r.roomNo} (${r.sharingType} • ${r.vacantBeds} vacant beds • ₹${r.monthlyRent})
           </option>`
      )
      .join('');
  }

  onStudentRoomSelected(roomNo) {
    const room = this.rooms.find((r) => r.roomNo === roomNo);
    if (room) {
      const feeInput = document.getElementById('stu-fee');
      if (feeInput && !feeInput.value) feeInput.value = room.monthlyRent;
    }
  }

  openEditStudentModal(studentId) {
    const s = this.students.find((stu) => stu.id === studentId);
    if (!s) return;

    this.populateRoomSelectForStudent(s.roomNo);
    const form = document.getElementById('form-add-student');
    if (!form) return;

    document.getElementById('student-edit-id').value = s.id;
    document.getElementById('modal-student-title').textContent = `👤 Edit Student: ${s.name}`;

    form.name.value = s.name;
    form.rollNo.value = s.rollNo;
    form.phone.value = s.phone;
    form.email.value = s.email || '';
    form.roomNo.value = s.roomNo;
    form.bedNumber.value = s.bedNumber || 'Bed 1';
    form.monthlyFee.value = s.monthlyFee;
    form.feeStatus.value = s.feeStatus;
    form.guardianName.value = s.guardianName || '';
    form.guardianPhone.value = s.guardianPhone || '';

    document.getElementById('modal-student').style.display = 'flex';
  }

  async handleStudentSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const editId = document.getElementById('student-edit-id').value;

    const room = this.rooms.find((r) => r.roomNo === form.roomNo.value);

    const payload = {
      name: form.name.value.trim(),
      rollNo: form.rollNo.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      roomNo: form.roomNo.value.trim(),
      bedNumber: form.bedNumber.value,
      sharingType: room ? room.sharingType : '2-Share',
      monthlyFee: parseFloat(form.monthlyFee.value),
      feeStatus: form.feeStatus.value,
      guardianName: form.guardianName.value.trim(),
      guardianPhone: form.guardianPhone.value.trim(),
    };

    try {
      if (editId) {
        await API.updateWardenStudent(this.currentHostelId, editId, payload);
        showToast('Student information updated', 'success');
        this.closeModal('modal-student');
      } else {
        const res = await API.createWardenStudent(this.currentHostelId, payload);
        showToast(`Student admitted to Room ${payload.roomNo}!`, 'success');
        this.closeModal('modal-student');
        if (res.data) {
          this.showStudentLoginSlipModal(res.data);
        }
      }
      await this.loadStudents();
      await this.loadRooms();
      this.loadDashboard();
      this.loadFees();
    } catch (err) {
      showToast(err.message || 'Failed to save student', 'error');
    }
  }

  showStudentLoginSlip(studentId) {
    const s = this.students.find((stu) => stu.id === studentId);
    if (s) this.showStudentLoginSlipModal(s);
  }

  showStudentLoginSlipModal(s) {
    document.getElementById('slip-student-name').textContent = s.name;
    document.getElementById('slip-room-info').textContent = `Room ${s.roomNo} (${s.bedNumber}) • Roll: ${s.rollNo}`;
    document.getElementById('slip-username').textContent = s.loginUsername;
    document.getElementById('slip-passcode').textContent = s.tempPasscode;

    document.getElementById('modal-login-slip').style.display = 'flex';
  }

  copyStudentCredentials() {
    const user = document.getElementById('slip-username').textContent;
    const pass = document.getElementById('slip-passcode').textContent;
    const name = document.getElementById('slip-student-name').textContent;
    const text = `Hostel Student Login\nName: ${name}\nUsername: ${user}\nPasscode: ${pass}\nPortal: ${window.location.origin}`;

    navigator.clipboard.writeText(text).then(() => {
      showToast('Login credentials copied to clipboard!', 'success');
    });
  }

  async checkoutStudent(studentId, name, roomNo) {
    if (!confirm(`Are you sure you want to check out ${name} from Room ${roomNo}? This will free up the bed.`)) return;

    try {
      await API.deleteWardenStudent(this.currentHostelId, studentId);
      showToast(`${name} checked out. Bed is now vacant!`, 'success');
      await this.loadStudents();
      await this.loadRooms();
      this.loadDashboard();
    } catch (err) {
      showToast(err.message || 'Failed to check out student', 'error');
    }
  }

  // =========================================================
  // 6. QR FEEDBACK SYSTEM
  // =========================================================
  renderQRPoster() {
    const hostelName = this.hostelData ? this.hostelData.name : 'Hostel';
    document.getElementById('poster-hostel-name').textContent = hostelName;

    const qrContainer = document.getElementById('poster-qr-container');
    if (!qrContainer) return;

    // Feedback URL that students scan
    const feedbackUrl = `${window.location.origin}/feedback.html?hostelId=${this.currentHostelId}&hostelName=${encodeURIComponent(hostelName)}`;

    // High quality QR Code image using pure QR image API
    const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(feedbackUrl)}`;

    qrContainer.innerHTML = `
      <img src="${qrImgUrl}" alt="Student QR Feedback" width="220" height="220" style="display:block; margin:0 auto; border-radius:4px;" />
    `;
  }

  openTestFeedbackLink() {
    const hostelName = this.hostelData ? this.hostelData.name : 'Hostel';
    const url = `/feedback.html?hostelId=${this.currentHostelId}&hostelName=${encodeURIComponent(hostelName)}`;
    window.open(url, '_blank');
  }

  copyFeedbackLink() {
    const hostelName = this.hostelData ? this.hostelData.name : 'Hostel';
    const url = `${window.location.origin}/feedback.html?hostelId=${this.currentHostelId}&hostelName=${encodeURIComponent(hostelName)}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast('QR Feedback link copied to clipboard!', 'success');
    });
  }

  async loadFeedbacks() {
    const cat = document.getElementById('filter-feedback-category')?.value || '';
    const st = document.getElementById('filter-feedback-status')?.value || '';

    try {
      const res = await API.getWardenFeedbacks(this.currentHostelId, { category: cat, status: st });
      if (!res.success) return;
      this.feedbacks = res.data || [];
      this.renderFeedbacks();
    } catch (err) {
      console.error('Error loading feedbacks:', err);
    }
  }

  renderFeedbacks() {
    const container = document.getElementById('feedbacks-container');
    if (!container) return;

    if (this.feedbacks.length === 0) {
      container.innerHTML = `<p style="text-align:center; padding:2rem; color:var(--text-muted);">No student feedbacks found matching filters.</p>`;
      return;
    }

    container.innerHTML = this.feedbacks
      .map(
        (f) => `
      <div class="feedback-card" id="feedback-card-${f.id}">
        <div class="feedback-card-header">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <span style="font-size:0.75rem; font-weight:800; background:#eff6ff; color:#1d4ed8; padding:0.2rem 0.5rem; border-radius:var(--radius-sm);">
              ${f.category}
            </span>
            <span style="font-size:0.85rem; font-weight:700; color:#f59e0b;">★ ${f.rating} / 5</span>
            <span style="font-size:0.8rem; color:var(--text-muted);">
              • ${new Date(f.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span class="status-pill ${f.status === 'RESOLVED' ? 'paid' : f.status === 'IN_PROGRESS' ? 'pending' : 'overdue'}">
              ${f.status}
            </span>
            <button class="btn btn-sm btn-secondary" style="padding:0.25rem 0.6rem; font-size:0.75rem;" onclick="window.wardenController.openFeedbackReplyModal(${f.id})">
              💬 Respond
            </button>
          </div>
        </div>

        <p style="font-size:0.92rem; color:var(--text-primary); margin:0.4rem 0 0.6rem; line-height:1.45;">
          "${f.message}"
        </p>

        <div style="font-size:0.78rem; color:var(--text-secondary);">
          Submitted by: <strong>${f.studentName || 'Anonymous Student'}</strong> ${f.roomNo ? `(Room ${f.roomNo})` : ''}
        </div>

        ${
          f.wardenResponse
            ? `
          <div class="warden-reply-box">
            <strong style="color:var(--color-primary); font-size:0.78rem; text-transform:uppercase; letter-spacing:0.04em;">Warden Response:</strong>
            <div style="margin-top:0.2rem; color:var(--text-primary);">${f.wardenResponse}</div>
          </div>
        `
            : ''
        }
      </div>
    `
      )
      .join('');
  }

  openFeedbackReplyModal(feedbackId) {
    const f = this.feedbacks.find((fb) => fb.id === feedbackId);
    if (!f) return;

    document.getElementById('reply-feedback-id').value = f.id;
    document.getElementById('reply-original-msg').innerHTML = `
      <div style="font-weight:700; margin-bottom:0.25rem;">[${f.category}] ★ ${f.rating} - ${f.studentName || 'Anonymous'} ${f.roomNo ? '(Room ' + f.roomNo + ')' : ''}:</div>
      "${f.message}"
    `;
    document.getElementById('reply-status').value = f.status === 'NEW' ? 'IN_PROGRESS' : f.status;
    document.getElementById('reply-text').value = f.wardenResponse || '';

    document.getElementById('modal-feedback-reply').style.display = 'flex';
  }

  async handleFeedbackReplySubmit(e) {
    e.preventDefault();
    const form = e.target;
    const id = document.getElementById('reply-feedback-id').value;

    const payload = {
      status: form.status.value,
      wardenResponse: form.wardenResponse.value.trim(),
    };

    try {
      await API.updateFeedbackResponse(id, payload);
      showToast('Response saved and updated for student!', 'success');
      this.closeModal('modal-feedback-reply');
      this.loadFeedbacks();
      this.loadDashboard();
    } catch (err) {
      showToast(err.message || 'Failed to update feedback', 'error');
    }
  }

  // =========================================================
  // 7. FEE REMINDERS & PAYMENT LEDGER
  // =========================================================
  async loadFees() {
    try {
      const res = await API.getWardenFees(this.currentHostelId);
      if (!res.success) return;
      const { summary, students, payments } = res.data;
      this.payments = payments || [];

      // Update KPI
      document.getElementById('fee-stat-expected').textContent = `₹${summary.totalExpected.toLocaleString('en-IN')}`;
      document.getElementById('fee-stat-collected').textContent = `₹${summary.totalCollected.toLocaleString('en-IN')}`;
      document.getElementById('fee-stat-paid-count').textContent = `${summary.paidCount} students paid`;
      document.getElementById('fee-stat-pending').textContent = `₹${summary.totalPending.toLocaleString('en-IN')}`;
      document.getElementById('fee-stat-pending-count').textContent = `${summary.pendingCount + summary.overdueCount} students with dues`;

      this.renderFeeReminders(students || []);
      this.renderPaymentsTable(this.payments);
    } catch (err) {
      console.error('Error loading fees:', err);
    }
  }

  renderFeeReminders(students) {
    const container = document.getElementById('fee-reminders-list');
    if (!container) return;

    const dues = students.filter((s) => s.feeStatus !== 'PAID');
    if (dues.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:2rem 1rem; color:#047857; background:#ecfdf5; border-radius:var(--radius-md);">
          <div style="font-size:1.5rem; margin-bottom:0.25rem;">🎉</div>
          <strong>All student fee dues are 100% collected for this month!</strong>
        </div>
      `;
      return;
    }

    const upiId = (this.hostelData && this.hostelData.upiId) || 'hostelwarden@upi';
    const hostelName = (this.hostelData && this.hostelData.name) || 'Hostel';

    container.innerHTML = dues
      .map((s) => {
        const cleanPhone = s.phone.replace(/[^0-9]/g, '');
        const reminderMsg = `Dear ${s.name}, your hostel rent for Room ${s.roomNo} of ₹${s.monthlyFee} is due. Kindly pay via UPI to ${upiId} or at the warden counter. Thank you, Warden - ${hostelName}.`;
        const waLink = `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(reminderMsg)}`;

        return `
        <div class="fee-reminder-card" id="fee-reminder-${s.id}">
          <div>
            <div style="display:flex; align-items:center; gap:0.6rem;">
              <strong style="font-size:0.95rem; color:#78350f;">${s.name}</strong>
              <span class="status-pill ${s.feeStatus === 'OVERDUE' ? 'overdue' : 'pending'}">${s.feeStatus}</span>
            </div>
            <div style="font-size:0.8rem; color:#92400e; margin-top:0.2rem;">
              Room ${s.roomNo} • Phone: ${s.phone} • Due Date: <strong>${s.dueDate}</strong>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:1rem; flex-wrap:wrap;">
            <div style="text-align:right;">
              <div style="font-size:1.15rem; font-weight:800; color:#991b1b;">₹${s.monthlyFee.toLocaleString('en-IN')}</div>
              <div style="font-size:0.72rem; color:#92400e;">Monthly Rent</div>
            </div>

            <div style="display:flex; gap:0.4rem;">
              <a href="${waLink}" target="_blank" class="whatsapp-btn" title="Send pre-filled WhatsApp reminder">
                <span>💬</span> WhatsApp Reminder
              </a>
              <button class="btn btn-sm btn-secondary" onclick="window.wardenController.copyReminderText('${reminderMsg.replace(/'/g, "\\'")}')" title="Copy text reminder">
                📋 Copy
              </button>
              <button class="btn btn-sm btn-primary" style="background:#047857;" onclick="window.wardenController.openRecordFeeModal(${s.id})" title="Record Payment">
                💰 Record Payment
              </button>
            </div>
          </div>
        </div>
      `;
      })
      .join('');
  }

  copyReminderText(text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Reminder message copied to clipboard!', 'success');
    });
  }

  renderPaymentsTable(payments) {
    const tbody = document.getElementById('payments-table-body');
    if (!tbody) return;

    if (payments.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:2rem; color:var(--text-muted);">No payment receipts recorded yet</td></tr>`;
      return;
    }

    tbody.innerHTML = payments
      .map(
        (p) => `
      <tr>
        <td><strong style="font-family:monospace; color:var(--color-primary);">${p.receiptNumber}</strong></td>
        <td><strong>${p.studentName}</strong></td>
        <td>Room ${p.roomNo}</td>
        <td><strong style="color:#047857;">₹${p.amount.toLocaleString('en-IN')}</strong></td>
        <td>${p.month}</td>
        <td><span style="font-size:0.75rem; font-weight:700; background:#f1f5f9; padding:0.2rem 0.5rem; border-radius:4px;">${p.paymentMode}</span></td>
        <td><span style="font-size:0.75rem; font-family:monospace; color:var(--text-muted);">${p.transactionRef}</span></td>
        <td style="font-size:0.78rem; color:var(--text-muted);">${new Date(p.paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
        <td>
          <button class="btn btn-sm btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.72rem;" onclick="window.wardenController.viewReceipt(${p.id})">
            📄 View Slip
          </button>
        </td>
      </tr>
    `
      )
      .join('');
  }

  openRecordFeeModal(studentId) {
    const s = this.students.find((stu) => stu.id === studentId);
    if (!s) return;

    document.getElementById('fee-student-id').value = s.id;
    document.getElementById('fee-modal-student-name').textContent = s.name;
    document.getElementById('fee-modal-student-room').textContent = `Room ${s.roomNo} (${s.bedNumber}) • Phone: ${s.phone}`;
    document.getElementById('fee-amount').value = s.monthlyFee;

    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    document.getElementById('fee-month').value = currentMonth;
    document.getElementById('fee-ref').value = `UPI/${new Date().toISOString().slice(2, 10).replace(/-/g, '')}/${Math.floor(1000 + Math.random() * 9000)}`;

    document.getElementById('modal-fee-payment').style.display = 'flex';
  }

  async handleRecordFeeSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const studentId = document.getElementById('fee-student-id').value;

    const payload = {
      studentId,
      amount: parseFloat(form.amount.value),
      month: form.month.value.trim(),
      paymentMode: form.paymentMode.value,
      transactionRef: form.transactionRef.value.trim(),
    };

    try {
      const res = await API.recordWardenPayment(this.currentHostelId, payload);
      showToast(res.message || 'Payment recorded successfully!', 'success');
      this.closeModal('modal-fee-payment');
      await this.loadFees();
      await this.loadStudents();
      this.loadDashboard();

      if (res.data) {
        this.displayReceiptModal(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to record payment', 'error');
    }
  }

  viewReceipt(paymentId) {
    const p = this.payments.find((pay) => pay.id === paymentId);
    if (p) this.displayReceiptModal(p);
  }

  displayReceiptModal(p) {
    const hostelName = this.hostelData ? this.hostelData.name : 'Hostel';
    const wardenName = this.hostelData ? this.hostelData.wardenName : 'Warden';
    const upiId = this.hostelData ? this.hostelData.upiId : 'UPI';

    const html = `
      <div style="border-bottom:2px solid #0f172a; padding-bottom:1rem; margin-bottom:1rem; display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <h2 style="font-size:1.25rem; font-weight:800; margin:0; color:#0f172a;">${hostelName}</h2>
          <div style="font-size:0.8rem; color:#64748b;">Official Student Fee Payment Receipt</div>
        </div>
        <div style="text-align:right;">
          <div style="font-family:monospace; font-weight:800; font-size:1rem; color:#0284c7;">${p.receiptNumber}</div>
          <div style="font-size:0.75rem; color:#64748b;">${new Date(p.paymentDate).toLocaleDateString()}</div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; font-size:0.88rem; margin-bottom:1.5rem;">
        <div>
          <span style="color:#64748b; font-size:0.75rem;">STUDENT NAME</span>
          <div style="font-weight:700;">${p.studentName}</div>
        </div>
        <div>
          <span style="color:#64748b; font-size:0.75rem;">ALLOCATED ROOM</span>
          <div style="font-weight:700;">Room ${p.roomNo}</div>
        </div>
        <div>
          <span style="color:#64748b; font-size:0.75rem;">FEE PERIOD</span>
          <div style="font-weight:700;">${p.month}</div>
        </div>
        <div>
          <span style="color:#64748b; font-size:0.75rem;">PAYMENT MODE & REF</span>
          <div style="font-weight:700;">${p.paymentMode} (${p.transactionRef})</div>
        </div>
      </div>

      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:1rem; display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
        <span style="font-size:1rem; font-weight:700;">TOTAL AMOUNT PAID</span>
        <span style="font-size:1.5rem; font-weight:800; color:#047857;">₹${p.amount.toLocaleString('en-IN')}</span>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:flex-end; font-size:0.75rem; color:#64748b; border-top:1px dashed #cbd5e1; padding-top:1rem;">
        <div>
          <div>Authorized Signature: <strong>${wardenName}</strong></div>
          <div>Chief Warden Desk • ${upiId}</div>
        </div>
        <div style="text-align:right;">
          <div>Status: <strong style="color:#047857;">CLEARED / PAID</strong></div>
          <div>Computer generated receipt</div>
        </div>
      </div>
    `;

    document.getElementById('receipt-content').innerHTML = html;
    document.getElementById('modal-receipt').style.display = 'flex';
  }

  // =========================================================
  // 8. NOTICE BOARD
  // =========================================================
  async loadNotices() {
    try {
      const res = await API.getWardenNotices(this.currentHostelId);
      if (!res.success) return;
      this.notices = res.data || [];
      this.renderNotices();
    } catch (err) {
      console.error('Error loading notices:', err);
    }
  }

  renderNotices() {
    const container = document.getElementById('notices-list-container');
    if (!container) return;

    if (this.notices.length === 0) {
      container.innerHTML = `<p style="text-align:center; padding:2rem; color:var(--text-muted);">No notices posted yet. Click "+ Post New Notice" to notify residents.</p>`;
      return;
    }

    container.innerHTML = this.notices
      .map(
        (n) => `
      <div class="feedback-card" id="notice-card-${n.id}" style="${n.priority === 'URGENT' ? 'border-left:4px solid #b91c1c;' : n.priority === 'HIGH' ? 'border-left:4px solid #f59e0b;' : 'border-left:4px solid #0284c7;'}">
        <div class="feedback-card-header">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <span class="status-pill ${n.priority === 'URGENT' ? 'overdue' : n.priority === 'HIGH' ? 'pending' : 'available'}">
              ${n.priority}
            </span>
            <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">${n.category}</span>
            <span style="font-size:0.75rem; color:var(--text-muted);">• ${n.date}</span>
          </div>

          <button class="btn btn-sm btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.72rem; color:#b91c1c;" onclick="window.wardenController.deleteNotice(${n.id})">
            Delete
          </button>
        </div>

        <h3 style="font-size:1.05rem; font-weight:800; color:var(--text-primary); margin:0.35rem 0 0.4rem;">
          ${n.title}
        </h3>

        <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.45; margin:0;">
          ${n.content}
        </p>
      </div>
    `
      )
      .join('');
  }

  openAddNoticeModal() {
    const form = document.getElementById('form-post-notice');
    if (form) form.reset();
    document.getElementById('modal-notice').style.display = 'flex';
  }

  async handleNoticeSubmit(e) {
    e.preventDefault();
    const form = e.target;

    const payload = {
      title: form.title.value.trim(),
      category: form.category.value,
      priority: form.priority.value,
      content: form.content.value.trim(),
    };

    try {
      await API.createWardenNotice(this.currentHostelId, payload);
      showToast('Notice published to hostel board!', 'success');
      this.closeModal('modal-notice');
      this.loadNotices();
    } catch (err) {
      showToast(err.message || 'Failed to post notice', 'error');
    }
  }

  async deleteNotice(noticeId) {
    if (!confirm('Are you sure you want to remove this notice?')) return;
    try {
      await API.deleteWardenNotice(this.currentHostelId, noticeId);
      showToast('Notice removed', 'info');
      this.loadNotices();
    } catch (err) {
      showToast(err.message || 'Failed to delete notice', 'error');
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  window.wardenController = new WardenController();
  window.wardenController.init();
});
