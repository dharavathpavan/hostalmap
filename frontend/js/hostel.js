/**
 * HOSTEL MAP — Hostel Details, Food, Experience & Reviews Controller
 */

class HostelDetailController {
  constructor() {
    this.hostelId = null;
    this.hostel = null;
    this.reviews = [];
    this.todayFood = null;
  }

  async init() {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');

    if (!idParam) {
      window.location.href = '/index.html';
      return;
    }

    this.hostelId = parseInt(idParam);
    this.bindEvents();
    await this.loadHostelData();
  }

  bindEvents() {
    // Review form submission
    const reviewForm = document.getElementById('submit-review-form');
    if (reviewForm) {
      reviewForm.addEventListener('submit', (e) => this.handleReviewSubmit(e));
    }

    // Modal close triggers
    document.querySelectorAll('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-overlay').forEach((m) => m.classList.remove('active'));
      });
    });

    // Rating star sliders / radio updates
    const ratingInputs = document.querySelectorAll('.rating-slider');
    ratingInputs.forEach((input) => {
      input.addEventListener('input', (e) => {
        const valDisplay = document.getElementById(`${e.target.name}-val`);
        if (valDisplay) valDisplay.innerText = `${parseFloat(e.target.value).toFixed(1)} / 5`;
      });
    });
  }

  async loadHostelData() {
    const mainContainer = document.getElementById('hostel-detail-content');
    if (mainContainer) {
      mainContainer.innerHTML = `
        <div class="state-container" style="padding: 6rem 1.5rem;">
          <div class="spinner"></div>
          <p class="state-desc">Loading hostel details, food menus, and student feedback...</p>
        </div>
      `;
    }

    try {
      const [hostelRes, reviewsRes, foodRes] = await Promise.all([
        API.getHostelById(this.hostelId),
        API.getReviews(this.hostelId),
        API.getTodayFood(this.hostelId).catch(() => ({ data: null })),
      ]);

      this.hostel = hostelRes.data;
      this.reviews = reviewsRes.data || [];
      this.todayFood = foodRes.data || this.hostel.todayFood;

      // Update page title
      document.title = `${this.hostel.name} | Student Reviews & Food | Hostel Map`;

      this.render();
    } catch (err) {
      console.error('Failed to load hostel details:', err);
      if (mainContainer) {
        mainContainer.innerHTML = `
          <div class="state-container" style="padding: 6rem 1.5rem;">
            <div class="state-icon">⚠️</div>
            <h3 class="state-title">Hostel Not Found</h3>
            <p class="state-desc">${err.message || 'Unable to retrieve hostel details.'}</p>
            <a href="/index.html" class="btn btn-primary btn-sm">← Back to Discover Map</a>
          </div>
        `;
      }
    }
  }

  render() {
    const container = document.getElementById('hostel-detail-content');
    if (!container || !this.hostel) return;

    const h = this.hostel;
    const rb = h.ratingBreakdown || {
      overallScore: h.rating || 0,
      recentScore: h.rating || 0,
      totalReviews: h.reviewCount || 0,
      food: 0,
      cleanliness: 0,
      safety: 0,
      wifi: 0,
      management: 0,
      value: 0,
      recommendationRate: 0,
    };

    const typeLabel =
      h.hostelType === 'BOYS'
        ? "Boys' Hostel"
        : h.hostelType === 'GIRLS'
        ? "Girls' PG & Hostel"
        : 'Co-Living Residency';

    const typeClass =
      h.hostelType === 'BOYS'
        ? 'hostel-type-boys'
        : h.hostelType === 'GIRLS'
        ? 'hostel-type-girls'
        : 'hostel-type-coliving';

    const isSaved = this.isHostelSaved(h.id);

    // Facilities pills
    const facilitiesHtml = (h.facilities || [])
      .map((f) => `<span class="facility-tag" style="padding:0.4rem 0.8rem; font-size:0.85rem;">✓ ${f}</span>`)
      .join('');

    // Today's food rendering
    let foodHtml = '';
    if (this.todayFood) {
      foodHtml = `
        <div class="detail-section-card">
          <div class="section-heading-row">
            <h3 class="section-heading">
              <span>🍲 Today's Food Menu</span>
            </h3>
            <span style="font-size:0.82rem; font-weight:600; color:#15803d; background:#f0fdf4; padding:0.25rem 0.65rem; border-radius:9999px; border:1px solid #bbf7d0;">
              Fresh Daily Update (${this.todayFood.foodDate})
            </span>
          </div>

          <div style="display:flex; flex-direction:column; gap:0.75rem;">
            <div class="food-meal-item">
              <span class="meal-badge meal-badge-breakfast">Breakfast</span>
              <div class="meal-text">${this.todayFood.breakfast}</div>
            </div>
            <div class="food-meal-item">
              <span class="meal-badge meal-badge-lunch">Lunch</span>
              <div class="meal-text">${this.todayFood.lunch}</div>
            </div>
            <div class="food-meal-item">
              <span class="meal-badge meal-badge-dinner">Dinner</span>
              <div class="meal-text">${this.todayFood.dinner}</div>
            </div>
          </div>

          ${
            this.todayFood.imageUrl
              ? `<div style="margin-top:1.25rem; border-radius:12px; overflow:hidden; max-height:260px;">
                   <img src="${this.todayFood.imageUrl}" alt="Today's Meal" style="width:100%; height:260px; object-fit:cover;" />
                 </div>`
              : ''
          }
        </div>
      `;
    }

    // Reviews rendering
    let reviewsHtml = '';
    if (this.reviews.length === 0) {
      reviewsHtml = `
        <div class="state-container" style="padding: 2.5rem 1rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 12px;">
          <div class="state-icon">📝</div>
          <h4 class="state-title">No reviews yet</h4>
          <p class="state-desc">Are you a resident or stayed here recently? Be the first to help fellow students.</p>
          <button class="btn btn-primary btn-sm" onclick="window.detailController.openReviewModal()">Write Anonymous Review</button>
        </div>
      `;
    } else {
      reviewsHtml = this.reviews
        .map(
          (r) => `
          <div class="review-card" id="review-card-${r.id}">
            <div class="review-card-header">
              <div class="reviewer-profile">
                <div class="reviewer-avatar">🎓</div>
                <div>
                  <div class="reviewer-name">
                    ${r.authorName}
                    ${
                      r.verifiedStudent
                        ? `<span class="verified-pill" style="font-size:0.68rem; padding:0.1rem 0.4rem;">✓ Verified Student</span>`
                        : ''
                    }
                  </div>
                  <div class="review-date">${new Date(r.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}</div>
                </div>
              </div>

              <div class="rating-badge rating-high">
                <span>★ ${(r.weightedScore || 4.0).toFixed(1)}</span>
              </div>
            </div>

            <div class="review-ratings-grid">
              <div class="rating-subitem">
                <span>Food:</span>
                <span class="rating-subitem-val">${r.foodRating.toFixed(1)}</span>
              </div>
              <div class="rating-subitem">
                <span>Clean:</span>
                <span class="rating-subitem-val">${r.cleanlinessRating.toFixed(1)}</span>
              </div>
              <div class="rating-subitem">
                <span>Safety:</span>
                <span class="rating-subitem-val">${r.safetyRating.toFixed(1)}</span>
              </div>
              <div class="rating-subitem">
                <span>WiFi:</span>
                <span class="rating-subitem-val">${r.wifiRating.toFixed(1)}</span>
              </div>
              <div class="rating-subitem">
                <span>Mgmt:</span>
                <span class="rating-subitem-val">${r.managementRating.toFixed(1)}</span>
              </div>
              <div class="rating-subitem">
                <span>Value:</span>
                <span class="rating-subitem-val">${r.valueRating.toFixed(1)}</span>
              </div>
            </div>

            ${r.comment ? `<p class="review-comment">"${r.comment}"</p>` : ''}

            <div class="review-footer">
              <div>
                ${
                  r.recommend
                    ? `<span style="color:#15803d; font-weight:600;">👍 Recommends this hostel</span>`
                    : `<span style="color:#b91c1c; font-weight:600;">👎 Does not recommend</span>`
                }
              </div>
              <button class="btn btn-ghost btn-sm" style="font-size:0.75rem; color:var(--text-muted);" onclick="window.detailController.openReportModal(${r.id})">
                🚩 Report
              </button>
            </div>
          </div>
        `
        )
        .join('');
    }

    container.innerHTML = `
      <!-- Breadcrumb -->
      <nav class="detail-breadcrumb">
        <a href="/index.html">← Back to Discover</a>
        <span>/</span>
        <span>${h.city}</span>
        <span>/</span>
        <span>${h.area}</span>
        <span>/</span>
        <span style="color:var(--text-primary); font-weight:600;">${h.name}</span>
      </nav>

      <!-- Main Header Card -->
      <div class="detail-header-card">
        <div class="detail-header-top">
          <div class="detail-title-col">
            <div class="detail-badges-row">
              <span class="hostel-type-badge ${typeClass}">${typeLabel}</span>
              ${h.verified ? `<span class="verified-pill">✓ Physically Verified</span>` : ''}
              ${h.foodAvailable ? `<span class="facility-tag food-tag">🍲 Food Included</span>` : ''}
            </div>
            <h1 class="detail-hostel-name">${h.name}</h1>
            <div class="detail-address">
              <span>📍 ${h.address}, ${h.area}, ${h.city} - ${h.pincode}</span>
            </div>
          </div>

          <div class="detail-price-box">
            <div class="detail-rent-amount">₹${h.monthlyRent.toLocaleString('en-IN')}</div>
            <div style="font-size:0.85rem; font-weight:600; color:var(--text-secondary);">per month</div>
            <div class="detail-deposit-text">Security Deposit: ₹${h.deposit.toLocaleString('en-IN')} (Refundable)</div>
          </div>
        </div>

        <div class="detail-actions-row">
          <button class="btn btn-primary" onclick="window.detailController.openContactModal()">
            📞 Contact Warden / Book Visit
          </button>
          <button class="btn btn-outline" onclick="window.detailController.openReviewModal()">
            ✍️ Write Anonymous Review
          </button>
          <button class="btn btn-secondary" onclick="window.detailController.toggleSaveHostel()">
            ${isSaved ? '❤️ Saved to Shortlist' : '🤍 Shortlist Hostel'}
          </button>
          <button class="btn btn-secondary" onclick="window.detailController.shareHostel()">
            🔗 Share Link
          </button>
          <button class="btn btn-secondary" onclick="window.detailController.addToCompare()">
            ⇄ Compare
          </button>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="detail-content-grid">
        <!-- Main Column -->
        <div class="detail-main-col">
          <!-- Description -->
          <div class="detail-section-card">
            <h3 class="section-heading" style="margin-bottom:0.75rem;">About this Student Stay</h3>
            <p style="color:var(--text-secondary); line-height:1.65; font-size:0.95rem;">
              ${h.description || 'Comfortable and student-centric accommodation equipped with essential living amenities, study setup, and secure access.'}
            </p>
          </div>

          <!-- Student Experience Score (Weighted formula from Prompt Section 15 & 16) -->
          <div class="experience-score-card">
            <div class="section-heading-row">
              <h3 class="section-heading">
                <span>⭐ Student Experience Score</span>
              </h3>
              <span style="font-size:0.8rem; color:var(--text-muted); font-weight:500;">
                Calculated from verified & anonymous reviews
              </span>
            </div>

            <div class="score-summary-banner">
              <div class="big-score-badge">
                <div class="big-score-number">${rb.overallScore > 0 ? rb.overallScore.toFixed(1) : '—'}</div>
                <div class="big-score-max">OUT OF 5.0</div>
              </div>

              <div class="score-meta-text">
                <div class="score-status-title">
                  ${rb.overallScore >= 4.5 ? 'Exceptional Student Stay' : rb.overallScore >= 4.0 ? 'Highly Rated Student Living' : rb.overallScore >= 3.0 ? 'Comfortable Living' : 'New Hostel'}
                </div>
                <div class="score-recency-note">
                  Recent 90-day rating: <strong style="color:var(--text-primary);">${rb.recentScore > 0 ? rb.recentScore.toFixed(1) : '—'}</strong> (${rb.totalReviews} student reviews total)
                </div>
              </div>

              <div class="recommend-circle-box">
                <div class="recommend-pct">${rb.recommendationRate}%</div>
                <div class="recommend-label">Recommend</div>
              </div>
            </div>

            <!-- Weighted Breakdown Bars -->
            <div class="rating-bars-container">
              <!-- Food (25%) -->
              <div class="rating-bar-row">
                <div class="rating-category-name">
                  🍲 Food Quality <span class="rating-weight-tag">(25%)</span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill green" style="width: ${(rb.food / 5) * 100}%"></div>
                </div>
                <div class="rating-value-display">${rb.food > 0 ? rb.food.toFixed(1) : '—'}</div>
              </div>

              <!-- Cleanliness (20%) -->
              <div class="rating-bar-row">
                <div class="rating-category-name">
                  ✨ Cleanliness <span class="rating-weight-tag">(20%)</span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill blue" style="width: ${(rb.cleanliness / 5) * 100}%"></div>
                </div>
                <div class="rating-value-display">${rb.cleanliness > 0 ? rb.cleanliness.toFixed(1) : '—'}</div>
              </div>

              <!-- Safety (20%) -->
              <div class="rating-bar-row">
                <div class="rating-category-name">
                  🛡️ Safety & Warden <span class="rating-weight-tag">(20%)</span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill green" style="width: ${(rb.safety / 5) * 100}%"></div>
                </div>
                <div class="rating-value-display">${rb.safety > 0 ? rb.safety.toFixed(1) : '—'}</div>
              </div>

              <!-- Management (15%) -->
              <div class="rating-bar-row">
                <div class="rating-category-name">
                  🤝 Management <span class="rating-weight-tag">(15%)</span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill blue" style="width: ${(rb.management / 5) * 100}%"></div>
                </div>
                <div class="rating-value-display">${rb.management > 0 ? rb.management.toFixed(1) : '—'}</div>
              </div>

              <!-- Facilities & WiFi (10%) -->
              <div class="rating-bar-row">
                <div class="rating-category-name">
                  📶 Facilities & WiFi <span class="rating-weight-tag">(10%)</span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill amber" style="width: ${(rb.wifi / 5) * 100}%"></div>
                </div>
                <div class="rating-value-display">${rb.wifi > 0 ? rb.wifi.toFixed(1) : '—'}</div>
              </div>

              <!-- Value (10%) -->
              <div class="rating-bar-row">
                <div class="rating-category-name">
                  💰 Value for Money <span class="rating-weight-tag">(10%)</span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill green" style="width: ${(rb.value / 5) * 100}%"></div>
                </div>
                <div class="rating-value-display">${rb.value > 0 ? rb.value.toFixed(1) : '—'}</div>
              </div>
            </div>
          </div>

          <!-- Food Section -->
          ${foodHtml}

          <!-- Anonymous Student Reviews -->
          <div class="detail-section-card">
            <div class="section-heading-row">
              <h3 class="section-heading">
                <span>💬 Real Student Experiences (${this.reviews.length})</span>
              </h3>
              <button class="btn btn-outline btn-sm" onclick="window.detailController.openReviewModal()">
                + Share Your Review
              </button>
            </div>

            <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:0.75rem 1rem; font-size:0.85rem; color:#1e40af; display:flex; align-items:center; gap:0.5rem; margin-bottom:1rem;">
              <span>🔒</span>
              <span><strong>Strict Privacy Guaranteed:</strong> Reviews are completely anonymous. No name, email, or identity is ever shared with hostel management.</span>
            </div>

            <div class="reviews-stack">
              ${reviewsHtml}
            </div>
          </div>
        </div>

        <!-- Sidebar Column -->
        <div class="detail-sidebar-col">
          <!-- Facilities Card -->
          <div class="detail-section-card">
            <h3 class="section-heading" style="margin-bottom:1rem;">Verified Facilities</h3>
            <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
              ${facilitiesHtml}
            </div>
          </div>

          <!-- Location & Transit Card -->
          <div class="detail-section-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
              <h3 class="section-heading" style="margin:0;">Location & Transit</h3>
              <span id="detail-map-provider-badge" style="font-size:0.72rem; color:var(--text-muted); font-weight:600;"></span>
            </div>
            <div id="detail-map-container" style="height:220px; width:100%; border-radius:8px; overflow:hidden; border:1px solid var(--border-subtle); margin-bottom:0.75rem; background:#f1f5f9;"></div>
            <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:1rem;">
              📍 ${h.address}, ${h.area}, ${h.city}
            </p>
            <div style="display:flex; gap:0.5rem;">
              <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(h.name + ' ' + h.address)}" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 class="btn btn-primary btn-sm" 
                 style="flex:1; justify-content:center;">
                🧭 Get Directions
              </a>
              <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name + ' ' + h.address)}" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 class="btn btn-secondary btn-sm" 
                 style="flex:1; justify-content:center;">
                🗺️ Full Map
              </a>
            </div>
          </div>

          <!-- Safety Notice -->
          <div class="detail-section-card" style="background:#f8fafc; border-color:#e2e8f0;">
            <h4 style="font-size:0.95rem; font-weight:700; color:var(--text-primary); margin-bottom:0.5rem;">
              🛡️ Student Safety Tip
            </h4>
            <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.5;">
              Always visit the hostel in person and verify food timing, gate closing hours, and power backup before paying a deposit.
            </p>
          </div>
        </div>
      </div>

      <!-- Mobile Sticky Action Bar -->
      <div class="mobile-sticky-action-bar">
        <div>
          <div style="font-size:1.1rem; font-weight:800; color:var(--text-primary);">₹${h.monthlyRent.toLocaleString('en-IN')}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">/ month with food</div>
        </div>
        <div style="display:flex; gap:0.5rem;">
          <button class="btn btn-outline btn-sm" onclick="window.detailController.openReviewModal()">Review</button>
          <button class="btn btn-primary btn-sm" onclick="window.detailController.openContactModal()">Contact</button>
        </div>
      </div>
    `;

    this.initDetailMap();
  }

  async initDetailMap() {
    const mapDiv = document.getElementById('detail-map-container');
    const badge = document.getElementById('detail-map-provider-badge');
    if (!mapDiv || !this.hostel) return;

    const lat = parseFloat(this.hostel.latitude);
    const lng = parseFloat(this.hostel.longitude);
    if (isNaN(lat) || isNaN(lng)) return;

    let apiKey = '';
    try {
      const configRes = await API.get('/config');
      apiKey = configRes.data?.mapApiKey || '';
    } catch (e) {
      console.warn('Config load failed for detail map:', e);
    }

    if (apiKey && apiKey !== 'YOUR_KEY_HERE') {
      try {
        await this.injectGoogleMapsScript(apiKey);
        const { Map } = await google.maps.importLibrary('maps');
        const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');

        const map = new Map(mapDiv, {
          center: { lat, lng },
          zoom: 15,
          mapId: CONFIG.MAP_ID || 'DEMO_MAP_ID',
          internalUsageAttributionIds: ['gmp_mcp_codeassist_v1_aistudio'],
          disableDefaultUI: true,
          zoomControl: true,
        });

        const pin = document.createElement('div');
        pin.className = 'custom-map-marker active';
        pin.innerHTML = `<span>₹${(this.hostel.monthlyRent / 1000).toFixed(1)}k</span><div class="marker-dot"></div>`;

        const marker = new AdvancedMarkerElement({
          map,
          position: { lat, lng },
          title: this.hostel.name,
        });
        marker.append(pin);

        if (badge) {
          badge.innerHTML = `<span style="color:#2563eb;">●</span> Google Maps Platform`;
        }
        return;
      } catch (err) {
        console.warn('Google Maps load failed for hostel detail:', err);
      }
    }

    // Leaflet fallback
    if (window.L) {
      mapDiv.innerHTML = '';
      const lMap = L.map(mapDiv, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(lMap);

      const customIcon = L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div class="custom-map-marker active"><span>₹${(this.hostel.monthlyRent / 1000).toFixed(1)}k</span><div class="marker-dot"></div></div>`,
        iconSize: [60, 30],
        iconAnchor: [30, 30],
      });

      L.marker([lat, lng], { icon: customIcon }).addTo(lMap);

      if (badge) {
        badge.innerHTML = `<span style="color:#10b981;">●</span> Interactive Map`;
      }
      setTimeout(() => lMap.invalidateSize(), 200);
    }
  }

  injectGoogleMapsScript(apiKey) {
    // Source: Google Maps Platform Code Assist
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps && window.google.maps.importLibrary) {
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
      }).then(resolve).catch(reject);
    });
  }

  openReviewModal() {
    const modal = document.getElementById('review-modal');
    if (modal) {
      modal.classList.add('active');
    }
  }

  async handleReviewSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = 'Submitting...';
    }

    try {
      const data = {
        foodRating: parseFloat(form.foodRating.value),
        cleanlinessRating: parseFloat(form.cleanlinessRating.value),
        safetyRating: parseFloat(form.safetyRating.value),
        wifiRating: parseFloat(form.wifiRating.value),
        managementRating: parseFloat(form.managementRating.value),
        valueRating: parseFloat(form.valueRating.value),
        comment: form.comment.value.trim(),
        recommend: form.recommend.value === 'true',
        verifiedStudent: form.verifiedStudent ? form.verifiedStudent.checked : false,
      };

      const res = await API.submitReview(this.hostelId, data);
      showToast(res.message || 'Review submitted successfully!', 'success');

      // Close modal
      document.querySelectorAll('.modal-overlay').forEach((m) => m.classList.remove('active'));
      form.reset();

      // Reload hostel data
      await this.loadHostelData();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Submit Anonymous Review';
      }
    }
  }

  openReportModal(reviewId) {
    const modal = document.getElementById('report-modal');
    const input = document.getElementById('report-review-id');
    if (input) input.value = reviewId;
    if (modal) modal.classList.add('active');
  }

  async handleReportSubmit(e) {
    e.preventDefault();
    const reviewId = document.getElementById('report-review-id')?.value;
    const reason = document.getElementById('report-reason')?.value;

    if (!reviewId) return;

    try {
      await API.reportReview(reviewId, { reason, reportedBy: 'Anonymous Student' });
      showToast('Report submitted. Our moderation team will investigate.', 'success');
      document.getElementById('report-modal')?.classList.remove('active');
    } catch (err) {
      showToast(err.message || 'Failed to submit report', 'error');
    }
  }

  openContactModal() {
    const modal = document.getElementById('contact-modal');
    if (modal) modal.classList.add('active');
  }

  isHostelSaved(id) {
    try {
      const saved = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.SAVED_HOSTELS) || '[]');
      return saved.includes(id);
    } catch {
      return false;
    }
  }

  toggleSaveHostel() {
    let saved = [];
    try {
      saved = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.SAVED_HOSTELS) || '[]');
    } catch {}

    if (saved.includes(this.hostelId)) {
      saved = saved.filter((id) => id !== this.hostelId);
      showToast('Removed from your shortlist', 'info');
    } else {
      saved.push(this.hostelId);
      showToast('Saved to your shortlist!', 'success');
    }

    localStorage.setItem(CONFIG.STORAGE_KEYS.SAVED_HOSTELS, JSON.stringify(saved));
    this.render();
  }

  addToCompare() {
    try {
      let compare = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.COMPARE_HOSTELS) || '[]');
      if (compare.includes(this.hostelId)) {
        showToast('Already added to comparison', 'info');
      } else {
        if (compare.length >= 3) {
          showToast('You can compare maximum 3 hostels at once', 'error');
          return;
        }
        compare.push(this.hostelId);
        localStorage.setItem(CONFIG.STORAGE_KEYS.COMPARE_HOSTELS, JSON.stringify(compare));
        showToast('Added to comparison! Open discovery map to view table.', 'success');
      }
    } catch {}
  }

  shareHostel() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'success');
    } else {
      showToast('Copy URL from your address bar', 'info');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.detailController = new HostelDetailController();
  window.detailController.init();
});
