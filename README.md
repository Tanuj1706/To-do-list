# Task Management System

A high-performance, enterprise Kanban workflow dashboard with Supabase PostgreSQL persistence, Row Level Security (RLS), real-time database audit trails, and tactile sticky-note cards.

![Task Management System Screenshot](https://raw.githubusercontent.com/Tanuj1706/To-do-list/main/public/vite.svg)

---

## Features

- **Enterprise Kanban Matrix**: 5-column workflow with dedicated High Priority, To Do, In Progress, Review, and Completed stages.
- **Section-Uniform Sticky Note Aesthetics**: Swiss Helvetica typography, organic resting tilt, black duct tape headers, priority badges, and column-synced color morphing.
- **Fine-Grained Placement Control**:
  - Drag-and-drop with top-half (*Insert Above*) and bottom-half (*Insert Below*) guideline indicators.
  - Interactive bottom drop zones for each column.
  - 1-click **Shift (`⇅`)** action popover on every card to move between columns and choose *Above* or *Below*.
  - Explicit *Top* vs *Bottom* column placement selector in the task creation and edit modals.
- **Real-Time Timestamps**: Each card displays a dynamic relative/exact timestamp (`Updated: Today at 2:45 PM`, `Updated 2m ago`) that refreshes automatically on changes.
- **Permanent Database Audit Trail**: Dedicated transaction log tracking all creations, moves, updates, deletes, and authentication events with tamper-proof PostgreSQL triggers.
- **Enterprise Security Gate**: Dedicated authentication gate with session persistence in `localStorage` across page reloads.
- **120 FPS Buttery-Smooth Performance**: Hardware-accelerated canvas background with cursor spotlight, optimized zero-GPU-lag rendering without heavy backdrop blur layers.
- **Vercel & Multi-Cloud Ready**: Preconfigured with `vercel.json` edge rewrites for seamless global DNS routing and SPA fallback.

---

## Tech Stack

- **Frontend**: React 18 / 19, Vite, Vanilla CSS Design System, Lucide React Icons, Canvas Confetti.
- **Backend & Database**: Supabase, PostgreSQL 15+, PostgREST, Row Level Security (RLS).
- **Deployment**: Vercel (Edge routing & Global CDN).

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Tanuj1706/To-do-list.git
cd To-do-list
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Supabase project credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Database Setup (Supabase)
Run the migration script provided in [`supabase_schema.sql`](./supabase_schema.sql) in your [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql):
- Creates `tasks` and `audit_logs` tables.
- Enables Row Level Security (RLS) policies.
- Installs the automated `log_task_audit()` trigger.
- Grants base table privileges to `authenticated` and `anon` roles.

### 5. Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Deployment on Vercel

1. Import this repository into [Vercel](https://vercel.com).
2. Add your environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) in the Vercel project settings.
3. Click **Deploy**. Vercel will automatically build the app and serve it with edge proxying via `vercel.json`.

---

## License

MIT License. Designed and engineered for high-performance productivity workflows.
