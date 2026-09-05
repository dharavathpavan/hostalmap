# Hostel Map — Complete End-to-End System Documentation & Technical Specification

---

## 📌 1. Abstract

**Hostel Map** is an end-to-end, full-stack geospatial discovery and hostel management platform built specifically for students, young professionals, and hostel wardens in major academic and IT hubs (e.g., Hyderabad tech corridors including Gachibowli, Madhapur, JNTU/KPHB, Kondapur, and Nizampet).

The platform solves two critical industry challenges:
1. **Student Discovery & Transparency**: Finding verified accommodations with real-time room availability, today's daily 3-meal food menus, transparent fee structures, crowd-sourced ratings (cleanliness, Wi-Fi speed, food taste, safety), and interactive map navigation with multi-theme visual cartography.
2. **Warden Management & Operations ERP**: Streamlining daily hostel operations for property managers and wardens, including student admissions, bed allocation, daily breakfast/lunch/dinner menu announcements, instant QR-code issue reporting and resolution, fee collection with receipt generation, student gate passes, and emergency broadcasts.

---

## 💻 2. Full-Stack Technology Stack

| Layer | Technologies & Libraries | Key Responsibilities |
| :--- | :--- | :--- |
| **Frontend UI / Client** | HTML5, CSS3 (Modern Variables & Responsive Grid), TypeScript / JavaScript (ES6+), Tailwind CSS | Fast, accessible, mobile-first responsive interfaces with zero framework lock-in overhead. |
| **Geospatial & Maps Engine** | Leaflet.js, OpenStreetMap, CartoDB (Voyager, Light, Dark tiles), Esri ArcGIS World Imagery, Google Maps JavaScript API (with `AdvancedMarkerElement` & MarkerClusterer) | Dual-engine spatial rendering with interactive pins, radius filtering, area hub navigation, and high-res aerial views. |
| **Backend & REST API** | Node.js, Express.js (`server.ts` & `warden_service.ts`), TypeScript (`tsx`), `bcryptjs` | High-throughput REST API layer handling authentication, filtering, geospatial queries, room inventory, and file data serialization. |
| **Database & Persistence** | JSON File-Backed Persistent Engine (`/data/hostel_db.json` & `/data/warden_db.json`), Java Spring Boot backend modules (`pom.xml`) | Atomic, durable JSON persistence with automatic migration, seeding, and relational cross-referencing. |
| **Security & Utilities** | BCrypt password hashing, Input sanitization, ARIA Screen Reader announcements, LocalStorage session persistence | Role-based data separation (Public Student, Warden Manager, Platform Administrator). |
| **Tooling & Build System** | Vite 6, esbuild, TypeScript Compiler (`tsc`), Nginx proxy on Port 3000 | Fast development with `tsx`, production CommonJS bundling (`dist/server.cjs`), and strict TypeScript type-checking. |

---

## 🏗️ 3. High-Level System Architecture

```
                                  +---------------------------------------+
                                  |            CLIENT BROWSER             |
                                  |   (Mobile / Tablet / Desktop Web)     |
                                  +---------------------------------------+
                                      |               |              |
                +---------------------+               |              +--------------------+
                |                                     |                                   |
                v                                     v                                   v
    +-----------------------+             +-----------------------+           +-----------------------+
    | 🗺️ Public Discovery   |             | 🛡️ Warden ERP Portal  |           | 📱 QR Feedback & PWA  |
    | - Multi-Theme Map     |             | - Admissions & KYC    |           | - Student Complaints  |
    | - Filter & Sort Engine|             | - Daily Food Broadcast|           | - Menu Live Checks    |
    | - Room Availability   |             | - Fee Invoicing / UPI |           | - Gate Pass Requests  |
    | - Comparison Matrix   |             | - QR Grievance Desk   |           | - Notice Board        |
    +-----------------------+             +-----------------------+           +-----------------------+
                |                                     |                                   |
                +-------------------------------------+-----------------------------------+
                                                      |
                                                      v  (REST API / JSON over HTTP)
                                          +-----------------------+
                                          |   Node Express Server |
                                          |     (Port 3000)       |
                                          +-----------------------+
                                           /          |          \
                                          /           |           \
                 +-----------------------+  +-------------------+  +-----------------------+
                 | Public & Search API   |  | Warden Operations |  | Review & Rating Engine|
                 | - GET /api/hostels    |  | - Room Inventory  |  | - POST /api/reviews   |
                 | - GET /api/facilities |  | - Admissions / KYC|  | - GET /api/feedback  |
                 | - GET /api/hostels/map|  | - Daily Food Menu |  | - POST /api/reports   |
                 +-----------------------+  +-------------------+  +-----------------------+
                                                      |
                                                      v
                                          +-----------------------+
                                          | JSON Persistence Engine|
                                          | - hostel_db.json      |
                                          | - warden_db.json      |
                                          +-----------------------+
```

---

## 🚀 4. Core Features & Subsystem Breakdown

### 4.1. Interactive Discovery & Spatial Cartography
* **Multi-Theme Basemap Switcher**:
  * **Voyager**: Balanced cartography highlighting major roads, landmarks, and bus stops.
  * **Clean Light**: High-contrast, minimalist Carto Positron basemap.
  * **Cyber Dark**: Midnight high-contrast dark theme optimized for night exploration.
  * **Satellite Aerial**: High-resolution Esri World Imagery displaying actual campus grounds, streets, and building footprints.
* **Fly-To Area Hubs**: Instant camera transitions to Hyderabad's major education and IT hubs: Gachibowli, Madhapur, JNTU/KPHB, Kondapur, and Nizampet.
* **Dynamic "Near Me" GPS Radius Filter**: Instant device geolocation with selectable 3km, 5km, and 10km proximity circles using the Haversine distance formula.
* **Interactive Price & Gender Markers**: Custom styled badges with gender indicators (`🚹` Boys, `🚺` Girls, `👥` Co-Living), monthly rent, ratings, and verification badges.
* **Active Selection Drawer**: Side preview drawer rendering photos, today's 3-meal menus, experience scores (Wi-Fi, Food, Cleanliness), and direct booking/call CTAs.

### 4.2. Warden Management ERP Portal (`/warden.html`)
* **Live Occupancy Dashboard**: Visual cards showing total rooms, occupied beds, vacant beds, and occupancy rates.
* **Room & Bed Inventory Manager**: Add/edit rooms with floor numbers, sharing configurations (Single, 2-Share, 3-Share, 4-Share), AC/non-AC, attached washrooms, and rent.
* **Student Admissions & KYC**: Register new residents, assign rooms, record security deposits, generate temporary login credentials, and manage guardian contact details.
* **Daily 3-Meal Food Broadcast**: Update today's breakfast, lunch, and dinner menus instantly visible on the public student portal.
* **Fee Collection & UPI Invoicing**: Track paid, pending, and overdue fees; record UPI transaction references; and generate downloadable digital receipts.
* **QR Feedback & Maintenance Resolution**: View student complaints submitted via hostel QR codes, update status (`NEW` -> `ACKNOWLEDGED` -> `IN_PROGRESS` -> `RESOLVED`), and attach warden replies.
* **Hostel Notice Board**: Broadcast urgent announcements, maintenance alerts, and water/power schedules.

### 4.3. Student Reviews & Sentiment Breakdown (`/review.html` & `/feedback.html`)
* **Multi-Factor Score Ratings**: Individual 1-to-5 star ratings for Food, Cleanliness, Safety, Wi-Fi, Management, and Value for Money.
* **Verified Resident Badging**: Highlight reviews submitted by verified residents.
* **QR Quick Feedback**: Scan room/dining hall QR codes to report grievances directly to the warden without registration barriers.

---

## 🗄️ 5. Database Schemas & Data Models

### 5.1. Hostel Entity (`Hostel`)
```typescript
interface Hostel {
  id: number;
  name: string;
  description: string;
  address: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  hostelType: 'BOYS' | 'GIRLS' | 'CO_LIVING';
  monthlyRent: number;
  deposit: number;
  foodAvailable: boolean;
  verified: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  facilityIds: number[];
  createdAt: string;
  coverImage?: string;
  images?: string[];
  wardenName?: string;
  wardenPhone?: string;
  wardenEmail?: string;
  gateClosingTime?: string;
  upiId?: string;
  rules?: string[];
}
```

### 5.2. Room Entity (`Room`)
```typescript
interface Room {
  id: number;
  hostelId: number;
  roomNo: string;
  floor: number;
  sharingType: 'Single' | '2-Share' | '3-Share' | '4-Share';
  totalBeds: number;
  monthlyRent: number;
  hasAC: boolean;
  hasAttachedWashroom: boolean;
  status: 'AVAILABLE' | 'FULL' | 'MAINTENANCE';
  imageUrl?: string;
  photos?: string[];
  notes?: string;
}
```

### 5.3. Student Entity (`Student`)
```typescript
interface Student {
  id: number;
  hostelId: number;
  name: string;
  rollNo: string;
  email: string;
  phone: string;
  roomNo: string;
  bedNumber: string;
  sharingType: string;
  monthlyFee: number;
  depositPaid: number;
  feeStatus: 'PAID' | 'PENDING' | 'OVERDUE';
  dueDate: string;
  lastPaymentDate?: string;
  checkInDate: string;
  emergencyContact: string;
  guardianName: string;
  guardianPhone: string;
  loginUsername: string;
  tempPasscode: string;
  isActive: boolean;
}
```

### 5.4. Daily Food Update (`FoodUpdate`)
```typescript
interface FoodUpdate {
  id: number;
  hostelId: number;
  foodDate: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  imageUrl?: string;
}
```

### 5.5. QR Feedback & Grievances (`QRFeedback`)
```typescript
interface QRFeedback {
  id: number;
  hostelId: number;
  category: 'FOOD' | 'CLEANLINESS' | 'WIFI' | 'MAINTENANCE' | 'SECURITY' | 'GENERAL';
  rating: number;
  studentName?: string;
  roomNo?: string;
  message: string;
  status: 'NEW' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED';
  wardenResponse?: string;
  createdAt: string;
}
```

---

## 🔌 6. REST API Reference

### Public Discovery & Map
* `GET /api/hostels` — Fetch filtered list of hostels (supports `search`, `area`, `type`, `minPrice`, `maxPrice`, `facilities`).
* `GET /api/hostels/:id` — Retrieve detailed hostel metadata with facilities, rooms, and reviews.
* `GET /api/hostels/map/all` — Lightweight geospatial payload for map rendering.
* `GET /api/hostels/nearby` — Get proximity-sorted hostels given `lat`, `lng`, and `radius`.
* `GET /api/facilities` — Retrieve all available amenities and filters.

### Warden Operations ERP
* `GET /api/warden/overview/:hostelId` — Get key metric counts (occupancy, revenue, complaints).
* `GET /api/warden/rooms/:hostelId` — Get list of rooms with occupancy status.
* `POST /api/warden/rooms` — Create or update room inventory.
* `GET /api/warden/students/:hostelId` — Get active admitted students list.
* `POST /api/warden/admissions` — Admit new student and generate credentials.
* `GET /api/warden/food-menu/:hostelId` — Get current and upcoming food menus.
* `POST /api/warden/food-menu` — Post today's breakfast, lunch, and dinner.
* `GET /api/warden/fees/:hostelId` — Fetch student fee statuses and payment histories.
* `POST /api/warden/fees/record` — Record fee payment transaction and generate receipt.
* `GET /api/warden/feedback/:hostelId` — Fetch all QR grievance submissions.
* `PATCH /api/warden/feedback/:id/status` — Update complaint resolution status and reply.

---

## 🎨 7. UI/UX Design System & Accessibility

* **Design Philosophy**: High-contrast, clean typography pairing modern sans-serif fonts with distinct spatial accents.
* **WCAG AA Compliance**: High contrast ratios on all text and badge elements (> 4.5:1).
* **Keyboard Navigation**:
  * `+` / `-` : Zoom in / out on map.
  * `Arrow Keys` : Pan viewport across regions.
  * `[` / `]` : Cycle through active hostel markers.
  * `F` : Fit all hostels in view.
  * `Esc` : Close drawers, modals, and popups.
* **Screen Reader Live Regions**: Real-time ARIA live polite announcer for map camera shifts and filter count changes.

---

## 🛠️ 8. Running & Deploying the Application

### 8.1. Local Development
```bash
# 1. Install dependencies
npm install

# 2. Start development server on port 3000
npm run dev
```

### 8.2. Production Build
```bash
# Build frontend bundle & compile TypeScript backend
npm run build

# Start production server
npm start
```

### 8.3. Windows Quick Scripts
* `run_server.bat` — Launches the Node Express server.
* `run_frontend.bat` — Launches frontend preview.
* `start_localhost.bat` — Runs full stack on localhost:3000.
