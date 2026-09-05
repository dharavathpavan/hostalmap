# Running Hostel Map on Localhost

This full-stack application includes the Google Maps Discovery Interface, Student Anonymous Reviews, Daily Food Menus, and the Warden Management Portal with Room & Fee Management.

---

## 🚀 Quick Start (Windows)

You can launch the entire application with a single click using the included Windows batch files:

### 1. **`start_localhost.bat`** (Recommended)
- Checks your Node.js installation.
- Automatically installs required dependencies (`npm install`) if missing.
- Starts the Express backend server on `http://localhost:3000`.
- Automatically opens your default web browser to `http://localhost:3000`.

### 2. **`run_server.bat`**
- Starts the unified server (`node` / `tsx server.ts`) on port 3000.
- Serves all REST APIs and static frontend HTML, CSS, and JS.

### 3. **`run_frontend.bat`**
- Interactive menu to quickly jump to any section:
  - `[1]` Discover Hostels Map (`http://localhost:3000/`)
  - `[2]` Warden Management Portal (`http://localhost:3000/warden.html`)
  - `[3]` Student Reviews (`http://localhost:3000/review.html`)
  - `[4]` QR Feedback & Grievance System (`http://localhost:3000/feedback.html`)
  - `[5]` Super Admin Portal (`http://localhost:3000/admin.html`)

### 4. **`setup_localhost.bat`**
- One-time verification script that installs packages, sets up `.env`, and tests the TypeScript compiler.

---

## 💻 Manual Setup (macOS / Linux / Windows Terminal)

If you prefer using the command line:

### 1. Prerequisites
- **Node.js 18.0 or higher** installed. Check with:
  ```bash
  node -v
  npm -v
  ```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Dev Server
```bash
npm run dev
```

The server will bind to `http://localhost:3000` (and `http://0.0.0.0:3000`).

---

## 🌐 Localhost URL Reference

| Page / Feature | Localhost URL |
| :--- | :--- |
| **Interactive Map & Discovery** | [http://localhost:3000/](http://localhost:3000/) |
| **Hostel Profile & Room Photos** | [http://localhost:3000/hostel.html?id=1](http://localhost:3000/hostel.html?id=1) |
| **Warden Management Portal** | [http://localhost:3000/warden.html](http://localhost:3000/warden.html) |
| **Anonymous Student Reviews** | [http://localhost:3000/review.html](http://localhost:3000/review.html) |
| **Daily Mess Menu & QR Feedback** | [http://localhost:3000/feedback.html](http://localhost:3000/feedback.html) |
| **Super Admin Portal** | [http://localhost:3000/admin.html](http://localhost:3000/admin.html) |

---

## 🔑 Default Warden Credentials

- **Hostel**: Sri Venkateshwara Executive Boys Hostel
- **Warden Passcode**: `warden123` (or choose any hostel from the switcher)
- **Admin Password**: `admin123` (for `admin.html`)

---

## ❓ Troubleshooting

- **Port 3000 already in use**: If another app is running on port 3000, close that application or terminate the process holding port 3000 (`netstat -ano | findstr :3000` on Windows, then `taskkill /PID <pid> /F`).
- **Missing Node.js**: Download and install the LTS version from [https://nodejs.org](https://nodejs.org).
