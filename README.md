# University Faculty Management System

A modern Next.js application for managing university faculty data, publications, and teaching assignments.

## Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Project Structure

```
app/
  ├── uni-dashboard/
  │   └── page.tsx              ← Main dashboard page
  └── faculty/
      ├── page.tsx              ← Faculty redirect page
      └── [id]/
          └── page.tsx          ← Individual faculty detail page

components/
  ├── dashboard/                ← Dashboard-specific components
  │   ├── StatsSection.tsx      ← Statistics cards section
  │   ├── ChartsSection.tsx     ← Charts visualization section
  │   └── FacultyTable.tsx      ← Faculty listing table
  │
  ├── faculty/                  ← Faculty page components
  │   ├── ProfileHeader.tsx     ← Faculty profile header
  │   └── FacultyDetails.tsx    ← Publications & teaching sections
  │
  ├── layout/                   ← Layout components
  │   └── PageFooter.tsx        ← Reusable footer
  │
  ├── ui/                       ← Reusable UI elements
  │   ├── ActionButtons.tsx     ← View/Edit action buttons
  │   └── StatusBadge.tsx       ← Status indicator badge
  │
  ├── charts/                   ← Chart components
  │   ├── BarChart.tsx
  │   ├── LineChart.tsx
  │   └── PublicationsChart.tsx
  │
  └── [shared components]
      ├── Header.tsx
      ├── StatCard.tsx
      ├── ChartCard.tsx
      └── DataTable.tsx

lib/
  ├── dashboard-data.ts         ← Dashboard configuration & chart data
  ├── faculty-table-data.tsx    ← Faculty table mock data
  └── faculty-data.ts           ← Faculty profile data
```

---

## Component Architecture

### Dashboard Page Structure

```
UniDashboard
│
├─ Header (Logo, Navigation, Login)
├─ StatsSection (4 StatCards)
├─ ChartsSection (BarChart & LineChart)
└─ FacultyTable (DataTable with Actions)
```

### Faculty Detail Page Structure

```
FacultyPage
│
├─ Header
├─ ProfileHeader (Photo, Name, Stats)
├─ FacultyDetails (Publications Chart & Teaching Table)
└─ PageFooter (Copyright & Theme Selector)
```

---
## Next Steps for Production

1. **Replace mock data** with real API calls
2. **Add authentication** and role-based access control
3. **Implement error boundaries** for better error handling
4. **Add loading states** for async operations
5. **Create unit tests** for components
6. **Add form validation** for data entry
7. **Implement the theme switcher** functionality
8. **Set up database** (PostgreSQL, MongoDB, etc.)
9. **Add search and filter** capabilities
10. **Deploy to production** (Vercel, AWS, etc.)

---

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe code
- **Tailwind CSS** - Utility-first styling
- **ECharts** - Interactive charts and visualizations
- **React** - Component-based UI library

---