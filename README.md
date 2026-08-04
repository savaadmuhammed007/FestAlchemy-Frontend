# 🔮 FestAlchemy — Frontend Web Portal

FestAlchemy is a state-of-the-art, high-fidelity web platform designed to streamline the administration, evaluation, and public tracking of multi-category festivals and competitive events. Built with **React** and **Vite**, the frontend features a rich, responsive interface with a dark-themed glassmorphism aesthetic, custom animations, and a secure multi-role portal system.

---

## 🚀 Quick Start

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+ recommended) and `npm` installed.

### Installation
1. Clone the repository and navigate to the project directory:
   ```bash
   cd festalchemy
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running Locally
To launch the Vite development server:
```bash
npm run dev
```
The application will run by default at `http://localhost:5173/` (or the next available port).

### Building for Production
To generate the optimized production build:
```bash
npm run build
```
This produces output in the `dist/` directory, ready to be hosted on Netlify, Vercel, or any web server.

---

## 🎨 Technology Stack & Libraries

* **Core Framework:** [React 19](https://react.dev/) — Declarative UI component library.
* **Build System & Dev Server:** [Vite 8](https://vite.dev/) — Ultra-fast frontend tooling with Hot Module Replacement (HMR).
* **Routing:** [React Router DOM v7](https://reactrouter.com/) — Single-Page Application (SPA) client-side routing.
* **Icons:** [Lucide React](https://lucide.dev/) — Sleek, vector-based iconography.
* **Styling:** Vanilla CSS Custom Variables — Handcrafted responsive layout with smooth transitions, custom overlays, and full dark/light mode parameters.

---

## 🔐 Multi-Role Portals & Features

FestAlchemy features a secure, token-based role authentication system with four distinct portals:

### 1. 📢 Public Dashboard (`/`)
An interactive, live-updating screen for general participants and visitors.
* **Live Points Table:** Real-time team leaderboards showing ranks, gold, silver, and bronze trophies.
* **Top Performers Ledger:** Filterable directory showing individual champion rankings categorized by age and event categories.
* **Schedules & Stages:** Real-time visibility into stage statuses, upcoming programs, and live announcements.
* **Official Results:** Instant display of published rankings and certificates.

### 2. 👑 Admin Panel (`/admin`)
A comprehensive management cockpit for festival coordinators.
* **Dashboard Overview:** Displays live key metrics (registered participants, event completion rates, judge submissions).
* **Programs Setup:** Create, edit, and configure events (specifying categories, chest number ranges, max marks, and stages).
* **Members Registry:** Manage all participants; supports manual registration as well as bulk data importing.
* **Judge Assignments:** Allocate credentials and assign specific judges to manage marking directories.
* **Grade Rules Configurator:** Set grade boundaries (e.g., A Grade >= 80%) and the associated points weighting.
* **Interactive SpinLot Machine:** A digital lottery machine utilizing randomized wheels to assign performance slots or chest numbers.
* **Real-time Marksheet Monitor:** Keep track of which judges have submitted or saved drafts for assigned programs.
* **Results Compilation & Publishing:** Automatically tabulate results, calculate ties, and broadcast official results to the public dashboard.
* **Poster & Certificate Editor:** A visual, canvas-like template editor to design announcement flyers and print winner certificates dynamically.

### 3. ⚖️ Judge Portal (`/judge`)
A mobile-friendly, streamlined interface optimized for real-time scoring.
* **Assigned Program Directory:** List of events where the user is selected as a panel judge.
* **Marksheet Scoring Sheets:** Allows entry of marks for each participant with strict limit validation (based on event `max_marks`).
* **Draft Saving & Final Submission:** Supports saving drafts to edit later and locking final scores to prevent modifications.

### 4. 📣 Team Lead Portal (`/teamlead`)
A localized workspace for organization coordinators.
* **Team Members Registry:** View and audit registered participants under their team.
* **Register Participants:** Create new members under specific categories, generating unified chest numbers automatically.
* **Event Registrations:** Add or modify event assignments for team members subject to category constraints.

---

## 📁 Repository Structure

```text
festalchemy/
├── public/                 # Static assets, icons, and favicons
├── src/
│   ├── assets/             # Brand images and default SVGs
│   ├── components/         # Reusable modular UI components
│   │   ├── DashboardOverview.jsx
│   │   ├── GradeSettings.jsx
│   │   ├── JudgeAssignments.jsx
│   │   ├── JudgeEvaluationForm.jsx
│   │   ├── JudgeMarksheetList.jsx
│   │   ├── JudgeProgramList.jsx
│   │   ├── MarksheetsStatus.jsx
│   │   ├── MemberRegistry.jsx
│   │   ├── MembersDirectory.jsx
│   │   ├── Modal.jsx
│   │   ├── PosterTemplateEditor.jsx   # Visual certificate template canvas
│   │   ├── ProgramsSetup.jsx
│   │   ├── ReportSelector.jsx
│   │   ├── ReportViewer.jsx
│   │   ├── SchedulePlanner.jsx
│   │   ├── ScoringResults.jsx         # Tabulation and publishing engine
│   │   ├── SettingsConfig.jsx
│   │   ├── SpinLotMachine.jsx         # Lucky draw wheel component
│   │   ├── TeamLeadAddMemberForm.jsx
│   │   ├── TeamLeadAssignEventsForm.jsx
│   │   └── TeamLeadMembersDashboard.jsx
│   ├── context/
│   │   └── AuthContext.jsx            # Token Auth, Auth state, Roles & API URLs
│   ├── views/              # Portal page views (containers)
│   │   ├── AdminPanel.jsx
│   │   ├── JudgePanel.jsx
│   │   ├── Login.jsx
│   │   ├── PublicDashboard.jsx
│   │   └── TeamLeadPanel.jsx
│   ├── App.css
│   ├── App.jsx             # React Shell, Routing, Themes, and UI Context
│   ├── index.css           # Global Style tokens, Glassmorphism, and Themes
│   └── main.jsx            # React root mount point
├── eslint.config.js        # Code quality and rules configuration
├── index.html              # Core HTML structure
├── package.json            # Scripts, dependencies, and manifest metadata
└── vite.config.js          # Vite compiler config & plugins
```

---

## ⚡ Developer Guidelines & Style System

### Custom CSS Variables (`index.css`)
We avoid TailwindCSS and maintain styling inside `src/index.css`. All colors, animations, and shadows are defined as theme variables. Examples include:
* **Backgrounds:** `--bg-base` (`#0f1117`), `--bg-raised` (`#181c26`), and `--bg-overlay`.
* **Colors:** `--accent` (`#6366f1` Indigo), `--info`, `--success`, `--warning`, `--danger`.
* **Transitions:** Smooth UI animations are run using `transition: all var(--dur) var(--ease)`.
* **Theme Switching:** Modifying theme applies a `data-theme` attribute to the `html` element which updates variable tokens automatically.

### Authentication & API Routing (`AuthContext.jsx`)
* **API URL:** By default, calls are made to the local Django server: `https://festalchemy-backend.onrender.com/`.
* **Token Storage:** Authenticated session tokens are persisted in `localStorage` as `token`.
* **Headers:** Requests to protected endpoints must carry the header `'Authorization': 'Token <your_token>'`.
